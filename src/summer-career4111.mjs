/* RASCENSO 4.11 — adaptador real y persistente del sistema de verano.
 * No depende de engine.mjs para evitar ciclos de importación. */
import {ACTIVITIES} from './summer-activities.mjs';
import {DEFAULTS,startSummer,drawOffers,chooseMode,skipWeek,describeModes,finishSummer,modeProbs,mulberry32,expectedValue,validateActivities} from './summer-engine.mjs';

const clamp=(n,min=0,max=100)=>Math.max(min,Math.min(max,Number(n)||0));
const year=s=>(Number(s.startYear)||2026)+(Number(s.age)-Number(s.startAge||16));
function hash(s){let a=2166136261;for(const c of String(s)){a^=c.charCodeAt(0);a=Math.imul(a,16777619);}return a>>>0;}
const asRecord=x=>x&&typeof x==='object'&&!Array.isArray(x)?x:{};
const asArray=x=>Array.isArray(x)?x:[];
const moneySalary=s=>Math.max(9000,Number(s.contract?.salary)||Number(s.lastSeason?.salaryEarned)||36000);
export const SUMMER_VALIDATION=validateActivities(ACTIVITIES);

export function normalizeSummerState(s){
 const f=asRecord(s.summerFinance),m=asRecord(s.summerMeta);
 return {...s,
  summerFinance:{cashEUR:Math.max(0,Number(f.cashEUR)||0),earnedEUR:Math.max(0,Number(f.earnedEUR)||0),spentEUR:Math.max(0,Number(f.spentEUR)||0),impactSocial:Number(f.impactSocial)||0,escandalos:Number(f.escandalos)||0,quotes:asArray(f.quotes).slice(-20),services:asArray(f.services).filter(x=>x&&typeof x.id==='string').slice(0,12)},
  summerMeta:{flags:asArray(m.flags).filter(x=>typeof x==='string'),done:asArray(m.done).filter(x=>typeof x==='string'),history:asRecord(m.history),events:asArray(m.events).filter(x=>x&&typeof x.id==='string').slice(-120)},
  summerHistory:asArray(s.summerHistory).slice(-45),
  summerNextMods:asRecord(s.summerNextMods),
  summerInjuryWeeks:Math.max(0,Number(s.summerInjuryWeeks)||0),
  summerRngCalls:Math.max(0,Math.floor(Number(s.summerRngCalls)||0))};
}

/** Incrementa caja en euros, no en unidades abstractas. El sueldo real es siempre la escala. */
export function summerSalaryClose(s,earned){
 const state=normalizeSummerState(s),salary=Math.max(0,Number(earned)||0),finance={...state.summerFinance};
 finance.earnedEUR+=salary;finance.cashEUR+=salary;
 const paid=[];const cut=[];
 for(const service of finance.services){
  const price=Math.round(Math.max(0,Number(service.upkeep)||0)*salary);
  if(price>finance.cashEUR){cut.push(service.id);continue;}
  finance.cashEUR-=price;finance.spentEUR+=price;paid.push(service);
 }
 finance.services=paid;
 const oldFlags=state.summerMeta?.flags||[];
 const meta={...state.summerMeta,flags:oldFlags.filter(flag=>!cut.some(id=>flag===`svc_${id}`))};
 return {...state,summerMeta:meta,summerFinance:finance,summerServiceExpired:cut};
}

/** Modificadores fraccionarios activos en el siguiente curso. */
export function summerSeasonMods(s){
 const e={lesiones:0,desarrollo:0,minutos:0,serenidad:0,mercadoGrandes:0};
 for(const [k,v] of Object.entries(asRecord(s.summerNextMods)))if(k in e)e[k]+=Number(v)||0;
 for(const service of asArray(s.summerFinance?.services))for(const [k,v] of Object.entries(asRecord(service.perSeason)))if(k in e)e[k]+=Number(v)||0;
 // Protección contra acumulaciones irreales de servicios y beneficios.
 e.lesiones=clamp(e.lesiones,-.65,.65);e.desarrollo=clamp(e.desarrollo,-.3,.35);e.minutos=clamp(e.minutos,-.12,.12);e.serenidad=clamp(e.serenidad,-.35,.4);e.mercadoGrandes=clamp(e.mercadoGrandes,-.3,.3);
 return e;
}
export function clearSummerSeasonMods(s){return {...s,summerNextMods:{},summerInjuryWeeks:0};}

function makeCtx(s,track=false){
 const st=normalizeSummerState(s);let calls=st.summerRngCalls;
 const source=mulberry32(hash(`${st.seed}:summer:${st.summer?.season||year(st)}`));for(let n=0;n<calls;n++)source();
 const rng=()=>{calls++;return source();};
 const f=st.summerFinance,m=st.summerMeta;
 const ctx={season:year(st),age:st.age,money:f.cashEUR/moneySalary(st),annualSalary:moneySalary(st),
  stats:{moral:st.morale??70,reputacion:st.reputation??0,hinchada:st.squad?.fans??50,confianzaDT:st.coachTrust??50,directiva:st.squad?.board??55,vestuario:st.squad?.morale??50,forma:st.form??70,fatiga:st.summerFatigue??0,impactoSocial:f.impactSocial,escandalos:f.escandalos,
   vinculoFamiliar:st.relationships?.family?.trust??50,vinculoPrensa:st.relationships?.press?.trust??50,vinculoRepresentante:st.relationships?.agent?.trust??50,vinculoCompanero:st.relationships?.teammate?.trust??50},
  profile:{formacion:st.origin,entorno:st.environment,desarrollo:st.developmentPath,caracter:st.personality,estilo:st.style,imagen:st.publicImage,decisiones:st.riskProfile,sueno:st.dream},
  flags:new Set(m.flags),done:new Set(m.done),history:{...m.history},rng};
 return {ctx,consumed:()=>calls,st};
}

const followUpText={
 inauguracion_barrio:{title:'El barrio estrena su nueva cancha',text:'Vecinos y familias te invitan a inaugurar las instalaciones que ayudaste a mejorar.',good:'Asistes y compartes la jornada con los niños del barrio.',quiet:'Envías un mensaje de cariño y dejas el protagonismo a la comunidad.'},
 nino_prometedor:{title:'Un juvenil de tu barrio llama la atención',text:'Años después de tu aporte, un entrenador te habla de un talento local que recién empieza a destacar.',good:'Ofreces orientación a su familia, sin prometerle una carrera profesional.',quiet:'Pides que el club lo observe con paciencia.'},
 prensa_recuerda:{title:'Tu frase vuelve a circular',text:'Un periodista recuperó una declaración polémica de hace una temporada.',good:'Aclaras el contexto y cierras la polémica.',quiet:'Decides no reabrir una discusión antigua.'},
 boicot_marca:{title:'La hinchada cuestiona tu patrocinio',text:'Un grupo de hinchas protesta por la empresa que te patrocina.',good:'Escuchas sus preocupaciones y buscas un acuerdo.',quiet:'Mantienes el contrato y asumes el descontento.'},
 academia_talento:{title:'Tu academia presenta a su primera promesa',text:'El proyecto de formación informa que un chico progresa. Por ahora es una noticia del proyecto, no un fichaje automático.',good:'Lo felicitas y refuerzas los recursos formativos.',quiet:'Pides a los formadores cuidar su desarrollo sin presión.'},
 becario_destaca:{title:'El juvenil becado sigue creciendo',text:'Llegan buenas noticias del joven cuya formación ayudaste a financiar.',good:'Lo invitas a conversar sobre los desafíos del fútbol.',quiet:'Lo felicitas en privado y respetas su proceso.'}
};

function dueFollowUps(st){
 const meta={...st.summerMeta},current=year(st),due=[];const remaining=[];
 for(const e of meta.events){
  if(e.dueYear>current){remaining.push(e);continue;}
  const r=mulberry32(hash(`${st.seed}:summer-followup:${e.id}:${e.dueYear}:${e.origin||''}`))();
  if(r<(Number(e.p)||0)){const info=followUpText[e.id];if(info)due.push({id:e.id,...info,year:current});}
 }
 meta.events=remaining;return {due,meta};
}

export function enterSummerCareer(input){
 if(!input.summerDueYear||input.phase==='retired')return {...input,phase:input.phase==='retired'?'retired':'season'};
 const s=normalizeSummerState(input);
 if(s.summerLastYear===year(s))return {...s,phase:'season',summerDueYear:null};
 const {due,meta}=dueFollowUps(s);
 const next={...s,phase:'summer',summerMeta:meta,summerRngCalls:0,summerInbox:due,summerResult:null,summerNextMods:{},summerInjuryWeeks:0};
 const {ctx}=makeCtx(next);next.summer=startSummer(ctx,6);
 return next;
}

/** Estabilidad del menú: consultar las ofertas no altera la semilla ni la partida. */
export function summerOffers(s){if(s.phase!=='summer'||s.summer?.weeksLeft<=0||s.summerResult||asArray(s.summerInbox).length)return [];
 const {ctx}=makeCtx(s);return drawOffers(ACTIVITIES,ctx,s.summer);
}
export const summerModes=(activity,s)=>describeModes(activity,makeCtx(s).ctx);
export function summerActiveBoosts(activity,s){const {ctx}=makeCtx(s);return (activity.boosts||[]).filter(x=>matchesBoost(x.when,ctx)).map(x=>Object.values(x.when?.profile||{}).flat().join(', ')).filter(Boolean);}
function matchesBoost(when,ctx){if(!when)return true;return Object.entries(when.profile||{}).every(([k,v])=>(Array.isArray(v)?v:[v]).includes(ctx.profile[k]));}
function outcomeNext(mode,id){return mode.outcomes.find(x=>x.id===id)?.next||{};}
function applySummerChoice(s,activityId,modeId){
 const state=normalizeSummerState(s),{ctx,consumed}=makeCtx(state);const offers=drawOffers(ACTIVITIES,ctx,state.summer);
 const activity=offers.find(a=>a.id===activityId);if(!activity)throw new Error('La actividad ya no está disponible.');
 const mode=activity.modes.find(x=>x.id===modeId);if(!mode||!describeModes(activity,ctx).find(x=>x.mode.id===modeId)?.enabled)throw new Error('Modo no disponible.');
 const finance={...state.summerFinance,services:[...state.summerFinance.services],quotes:[...state.summerFinance.quotes]};
 const meta={...state.summerMeta,flags:[...state.summerMeta.flags],done:[...state.summerMeta.done],history:{...state.summerMeta.history},events:[...state.summerMeta.events]};
 let next={...state,summerFinance:finance,summerMeta:meta,squad:{...state.squad},relationships:{...state.relationships}};
 const salary=moneySalary(next),before=modeProbs(mode,{...ctx,profile:{}}),after=modeProbs(mode,ctx);
 const triggered=(mode.traitMods||[]).filter(x=>Object.keys(x.when?.profile||{}).every(k=>{const match=x.when.profile[k];return (Array.isArray(match)?match:[match]).includes(ctx.profile[k])}));
 const profileNames={sereno:'Sangre fría',disciplinado:'Disciplina',carismatico:'Carisma',rebelde:'Rebeldía',obsesivo:'Obsesión por mejorar',lider:'Liderazgo',solidario:'Solidaridad',mediatico:'Perfil mediático',reservado:'Perfil reservado',provocador:'Provocación',analitico:'Análisis táctico',audaz:'Audacia',aventurero:'Espíritu aventurero',calculador:'Prudencia'};
 const notes=triggered.filter(x=>Object.keys(x.shift||{}).some(k=>Math.abs((after[k]||0)-(before[k]||0))>.005)).map(x=>{
  const val=Object.values(x.when.profile||{})[0];const id=Array.isArray(val)?val[0]:val;
  const label=profileNames[id]||id;
  const changed=Object.keys(x.shift||{}).filter(k=>Math.abs((after[k]||0)-(before[k]||0))>.005).map(k=>`${k.replaceAll('_',' ')} ${Math.round((before[k]||0)*100)}→${Math.round((after[k]||0)*100)} %`).join(', ');
  return `Tu ${label} modificó las probabilidades: ${changed}`;
 });
 const add=(stat,d)=>{
  if(stat==='dinero'){const euros=Math.round(d*salary);finance.cashEUR=Math.max(0,finance.cashEUR+euros);if(euros<0)finance.spentEUR-=euros;return;}
  if(stat==='impactoSocial'||stat==='escandalos'){finance[stat]+=d;return;}
  const root={moral:'morale',reputacion:'reputation',confianzaDT:'coachTrust',forma:'form',fatiga:'summerFatigue'}[stat];
  if(root){next[root]=clamp((next[root]??(root==='summerFatigue'?0:50))+d,root==='summerFatigue'?-20:0,100);if(root==='coachTrust')next.relationships.coach={...next.relationships.coach,trust:next.coachTrust};return;}
  const squad={hinchada:'fans',directiva:'board',vestuario:'morale'}[stat];if(squad){next.squad[squad]=clamp((next.squad[squad]??50)+d);return;}
  const who={vinculoFamiliar:'family',vinculoPrensa:'press',vinculoRepresentante:'agent',vinculoCompanero:'teammate'}[stat];if(who)next.relationships[who]={...next.relationships[who],trust:clamp((next.relationships[who]?.trust??50)+d)};
 };
 const adapter={add,setFlag:f=>{if(!meta.flags.includes(f))meta.flags.push(f)},addSeasonMod:(k,v)=>{next.summerNextMods={...next.summerNextMods,[k]:(Number(next.summerNextMods[k])||0)+v}},addService:(id,svc)=>{if(!finance.services.some(x=>x.id===id))finance.services.push({id,...svc})},scheduleEvent:(id,after,p)=>{meta.events.push({id,dueYear:year(next)+after,p,origin:activity.id})},injure:weeks=>{next.summerInjuryWeeks+=weeks},markDone:(id,season)=>{meta.history[id]=season;if(!meta.done.includes(id))meta.done.push(id)}};
 const newSummer={...state.summer,chosen:[...state.summer.chosen],categoriesUsed:{...state.summer.categoriesUsed},gains:{...state.summer.gains},totals:{...state.summer.totals},log:[...state.summer.log]};
 const result=chooseMode(newSummer,activity,modeId,ctx,adapter);
 result.traitNotes=notes; // El aviso permanece en el historial del verano.
 if(result.headline&&result.headline.includes('frase'))finance.quotes.push(result.headline);
 if(meta.flags.includes('frase_celebre')&&result.outcome==='viral'&&activity.id==='rueda_prensa')finance.quotes.push(result.headline||'Una frase que quedó en la memoria');
 next.summer=newSummer;next.summerRngCalls=consumed();next.summerResult={...result,title:activity.title,traitNotes:notes,next:{...(outcomeNext(mode,result.outcome))},cost:mode.cost||0,service:mode.service||null,injuryWeeks:mode.outcomes.find(x=>x.id===result.outcome)?.injury||0,followUps:mode.outcomes.find(x=>x.id===result.outcome)?.followUps||[]};
 return next;
}
export function chooseSummerCareer(s,activityId,modeId){if(s.phase!=='summer'||s.summerResult||asArray(s.summerInbox).length)return s;return applySummerChoice(s,activityId,modeId);}
export function continueSummerCareer(s){if(s.phase!=='summer'||!s.summerResult)return s;return {...s,summerResult:null};}
export function restSummerCareer(s){if(s.phase!=='summer'||s.summerResult||asArray(s.summerInbox).length||s.summer.weeksLeft<=0)return s;
 const state=normalizeSummerState(s),{ctx,consumed}=makeCtx(state);const su={...state.summer,chosen:[...state.summer.chosen],categoriesUsed:{...state.summer.categoriesUsed},gains:{...state.summer.gains},totals:{...state.summer.totals},log:[...state.summer.log]};skipWeek(su,ctx,{add:(k,d)=>{if(k==='fatiga')state.summerFatigue=clamp((state.summerFatigue||0)+d,-20,100)}});
 return {...state,summer:su,summerRngCalls:consumed(),summerResult:{activity:null,title:'Descanso',text:'Una semana tranquila para recuperar energías.',applied:{fatiga:-1}}};
}
export function answerSummerFollowUp(s,answer='participar'){
 if(s.phase!=='summer'||!asArray(s.summerInbox).length)return s;
 const [notice,...rest]=s.summerInbox;const good=answer==='participar';
 const text=good?notice.good:notice.quiet;
 const value=good?1:0;
 const f={...s.summerFinance,impactSocial:(s.summerFinance?.impactSocial||0)+(notice.id.includes('academia')||notice.id.includes('becario')||notice.id.includes('barrio')?value:0)};
 return {...s,summerFinance:f,summerInbox:rest,summerFollowUpLog:[...asArray(s.summerFollowUpLog),{id:notice.id,year:year(s),title:notice.title,text}].slice(-60),careerMoments:[...asArray(s.careerMoments),{year:year(s),kind:'summer',text:`${notice.title}: ${text}`}].slice(-120)};
}
export function cancelSummerService(s,id){if(s.phase!=='summer'||s.summerResult)return s;const f={...s.summerFinance,services:s.summerFinance.services.filter(x=>x.id!==id)};const flags=(s.summerMeta.flags||[]).filter(x=>x!==`svc_${id}`);return {...s,summerFinance:f,summerMeta:{...s.summerMeta,flags}};}

export function finishSummerCareer(s){if(s.phase!=='summer'||s.summer?.weeksLeft>0||s.summerResult||asArray(s.summerInbox).length)return s;
 const report={...finishSummer(s.summer),year:year(s),spendingEUR:s.summerFinance.spentEUR,impactSocial:s.summerFinance.impactSocial,escandalos:s.summerFinance.escandalos};
 return {...s,phase:'season',summerDueYear:null,summerLastYear:year(s),summer:null,summerResult:null,summerInbox:[],summerRngCalls:0,summerHistory:[...asArray(s.summerHistory),report].slice(-45),careerMoments:[...asArray(s.careerMoments),...report.headlines.map(text=>({year:year(s),kind:'summer',text}))].slice(-120)};
}
export function autoSummerCareer(s,{pauseAtSummary=false}={}){if(s.phase!=='summer')return s;let curr=s;
 let count=0;while(asArray(curr.summerInbox).length&&count++<30)curr=answerSummerFollowUp(curr,'participar');
 count=0;
 const weights={moral:1,reputacion:3,hinchada:2,confianzaDT:2,directiva:2,vestuario:1.6,forma:1,fatiga:-.4,vinculoFamiliar:.7,vinculoPrensa:.5,vinculoRepresentante:.8,vinculoCompanero:1,impactoSocial:2.5,escandalos:-6,dinero:8,lesiones:-28,desarrollo:40,minutos:40,serenidad:22,mercadoGrandes:18,injury:-2};
 while(curr.summer?.weeksLeft>0&&count++<12){if(curr.summerResult)curr=continueSummerCareer(curr);
  const offers=summerOffers(curr),ctx=makeCtx(curr).ctx;
  const choices=offers.flatMap(activity=>describeModes(activity,ctx).filter(x=>x.enabled).map(x=>({activity,mode:x.mode,score:expectedValue(x.mode,weights,ctx)/activity.weeks})));
  choices.sort((a,b)=>b.score-a.score||a.activity.id.localeCompare(b.activity.id));
  if(choices[0]&&choices[0].score>0)curr=chooseSummerCareer(curr,choices[0].activity.id,choices[0].mode.id);
  else curr=restSummerCareer(curr);
 }
 if(curr.summerResult)curr=continueSummerCareer(curr);
 return pauseAtSummary?curr:finishSummerCareer(curr);
}

export const SUMMER_FOLLOWUPS=Object.keys(followUpText);
