import { COUNTRIES } from './countries.mjs';
import { identityTraits, identitySeasonEffects, preparationEffects, PREPARATIONS, archetypeFor } from './career08.mjs';
import { DRAFT_REFERENTS, DRAFT_TIERS, draftPotentialAdjustment } from './draft09.mjs';
import { chooseSeasonAgenda, seasonAgendaEffects } from './agenda09.mjs';
export { chooseSeasonAgenda } from './agenda09.mjs';

import { initialRelationships, chooseScene, sceneFor, resultOfScene } from './story.mjs';
import { playLeague, leagueParticipants, getCompetitionForCareer, nextLeagueRosters } from './league.mjs';
import { VERIFIED_LEAGUES, getInauguralLeague } from './leagues2026.mjs';
import { annualSalary, marketClub, clubPrestige, playerDemand, buildTransferOffers, evaluateClubFuture } from './market.mjs';

export const START_YEAR = 2026;
export const ORIGINS = [
  {id:'barrio',name:'Fútbol de barrio',description:'Aprendiste en canchas pequeñas. Tu talento destaca, pero todavía debes abrirte camino.',benefit:'Un impulso inicial de confianza'},
  {id:'cantera',name:'Formación juvenil',description:'Te formaste en divisiones inferiores, con entrenamientos y exigencia desde pequeño.',benefit:'Mejor relación inicial con el cuerpo técnico'},
  {id:'amateur',name:'Club amateur',description:'Llegaste desde ligas locales con esfuerzo, sacrificio y ganas de sorprender.',benefit:'Mayor crecimiento cuando tienes minutos'},
  {id:'academia',name:'Academia de alto rendimiento',description:'Tienes formación avanzada y una presión constante por demostrar tu nivel.',benefit:'Reconocimiento inicial ligeramente mayor'},
];
export const PERSONALITIES = [
  {id:'disciplinado',name:'Disciplinado',description:'Trabajas en silencio y te tomas en serio cada indicación.'},
  {id:'ambicioso',name:'Ambicioso',description:'Quieres jugar al máximo nivel y no te conformas con poco.'},
  {id:'leal',name:'Leal',description:'Valoras al equipo y las personas que confían en ti.'},
  {id:'carismatico',name:'Carismático',description:'Conectas con el vestuario, el público y la prensa.'},
];
export const STYLES = [
  {id:'equilibrado',name:'Completo',description:'Te adaptas a distintas situaciones del partido.'},
  {id:'goleador',name:'Finalizador',description:'Buscas el arco y aprovechas los espacios.'},
  {id:'creador',name:'Creador',description:'Prefieres encontrar el pase que otros no ven.'},
  {id:'intenso',name:'Incansable',description:'Compites fuerte y mantienes la presión durante todo el encuentro.'},
];
export const DREAMS = [
  {id:'seleccion',name:'Representar a mi país',description:'Tu gran sueño es vestir la camiseta de tu selección.'},
  {id:'europa',name:'Jugar en la élite mundial',description:'Sueñas con llegar a los clubes más exigentes.'},
  {id:'idolo',name:'Ser ídolo de un club',description:'Quieres dejar una huella imposible de olvidar.'},
  {id:'titulos',name:'Ganar todos los títulos',description:'Tu objetivo es llenar tu carrera de trofeos.'},
];

export const POSITIONS = [
  ['POR','Arquero'],['DFC','Defensa central'],['LI','Lateral izquierdo'],['LD','Lateral derecho'],
  ['MCD','Pivote defensivo'],['MC','Mediocampista'],['MI','Volante izquierdo'],['MD','Volante derecho'],
  ['MCO','Mediapunta'],['EI','Extremo izquierdo'],['ED','Extremo derecho'],['DC','Delantero centro']
];
export const ATTRS = [['pace','Ritmo'],['shot','Tiro'],['pass','Pase'],['dribble','Regate'],['defense','Defensa'],['physical','Físico'],['skills','Filigranas'],['weak','Pierna mala']];

const clamp=(v,min,max)=>Math.min(max,Math.max(min,v));
function hash(x){ let h=2166136261;for(const c of String(x)){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0; }
function rng(seed){let a=hash(seed);return ()=>{a=(a+0x6D2B79F5)|0;let t=Math.imul(a^(a>>>15),1|a);t^=t+Math.imul(t^(t>>>7),61|t);return ((t^(t>>>14))>>>0)/4294967296;};}
function choose(arr,r){return arr[Math.floor(r()*arr.length)];}
export function getCountry(code){return COUNTRIES.find(c=>c.code===code);}
export function getClub(id){for(const c of COUNTRIES){const club=c.clubs.find(x=>x.id===id);if(club){const league=getInauguralLeague(club.id);return {...club,country:c.name,countryCode:c.code,league:league?.name||c.league,division:league?.tier??null,competitionId:league?.id??null,region:c.confederation};}}return null;}
function validSelection(value,options,defaultId){return options.some(x=>x.id===value)?value:defaultId;}
export function newCareer({name,number=9,foot='Derecha',country='CL',position='DC',mode='Clásico',age=16,city='',origin='barrio',personality='disciplinado',style='equilibrado',dream='seleccion',story='',fanClubId='',environment='sin_contactos',publicImage='reservado',riskProfile='calculador',developmentPath='tecnica',seed=Date.now()}){
  const safeName=String(name||'').trim().slice(0,44);
  if(!getCountry(country)||!POSITIONS.some(p=>p[0]===position)||!safeName)throw Error('Revisa el nombre, la nacionalidad y la posición.');
  const firstAge=clamp(Math.round(Number(age)||16),16,19);
  const originId=validSelection(origin,ORIGINS,'barrio');
  const personalityId=validSelection(personality,PERSONALITIES,'disciplinado');
  const relationships=initialRelationships(country);
  if(originId==='cantera')relationships.coach.trust=60;
  return {version:7,...identityTraits({environment,publicImage,riskProfile,developmentPath}),preparation:null,careerMoments:[],annualScenes:0,market:null,agent:{searches:0,year:null,focus:'balanced'},careerEarnings:0,developmentProfile:['temprano','normal','normal','normal','tardio'][Math.floor(rng(String(seed)+':dev')()*5)],injuryProfile:rng(String(seed)+':injury')()<.18?'fragil':'resistente',seasonPlan:'equilibrio',contract:null,seed:String(seed),phase:'draft',name:safeName,number:clamp(Number(number)||9,1,99),foot:foot==='Izquierda'?'Izquierda':'Derecha', country,position,mode:mode==='Purista'?'Purista':'Clásico',
    age:firstAge,startAge:firstAge,startYear:START_YEAR,city:String(city||'').trim().slice(0,40),origin:originId,personality:personalityId,
    style:validSelection(style,STYLES,'equilibrado'),dream:validSelection(dream,DREAMS,'seleccion'),story:String(story||'').trim().slice(0,180),
    fanClubId:getClub(fanClubId)?fanClubId:null,storyFlags:{playedForFan:false},storyLog:[],relationships,sceneBeat:0,sceneChoice:null,scenePlayerText:'',
    draftIndex:0,draftRerolls:0,attributes:{},draftSources:[],clubId:null,ovr:null,potential:null,
    form:70,morale:originId==='barrio'?75:70,reputation:originId==='academia'?4:0,
    coachTrust:originId==='cantera'?60:50,
    history:[],decisions:[],trophies:[],offers:[],pendingEvent:null,lastSeason:null};
}
export function migrateCareer(s){
  if(!s||typeof s!=='object'||!['draft','academy','season','event','transfer','retired'].includes(s.phase)||!getCountry(s.country))return null;
  if(![1,2,3,4,5,6,7].includes(s.version))return null;
  const v1=s.version===1?{...s,startAge:16,startYear:START_YEAR,city:'',origin:'barrio',personality:'disciplinado',style:'equilibrado',dream:'seleccion',story:'',coachTrust:50}:s;
  const rel=v1.relationships||initialRelationships(v1.country);
  const safeRel={...rel,coach:{...rel.coach,trust:v1.coachTrust??rel.coach?.trust??50}};
  const backfilledTrophies=(v1.history||[]).flatMap(x=>(x.titles||[]).map(title=>({title,year:x.year??null,clubId:x.clubId??null,leagueId:x.leagueId||'',kind:'league'})));
  if(backfilledTrophies.length<(v1.trophies||[]).length){for(const title of (v1.trophies||[]).slice(backfilledTrophies.length))backfilledTrophies.push({title:String(title),year:null,clubId:null,kind:'league'});}
  const migrated={...v1,version:7,trophyRecords:Array.isArray(v1.trophyRecords)?v1.trophyRecords:backfilledTrophies,...identityTraits(v1),preparation:v1.preparation||null,careerMoments:Array.isArray(v1.careerMoments)?v1.careerMoments:[],annualScenes:v1.annualScenes||0,market:v1.market||null,agent:v1.agent||{searches:0,year:null,focus:'balanced'},careerEarnings:v1.careerEarnings??(v1.history||[]).reduce((n,x)=>n+(x.salaryEarned||0),0),developmentProfile:v1.developmentProfile||'normal',injuryProfile:v1.injuryProfile||'resistente',seasonPlan:v1.seasonPlan||'equilibrio',contract:v1.contract||null,fanClubId:getClub(v1.fanClubId)?v1.fanClubId:null,
    storyFlags:v1.storyFlags||{playedForFan:!!(v1.fanClubId&&v1.history?.some(h=>h.clubId===v1.fanClubId))},
    storyLog:Array.isArray(v1.storyLog)?v1.storyLog:[],recapPending:!!v1.recapPending,relationships:safeRel,
    sceneBeat:v1.sceneBeat||0,sceneChoice:v1.sceneChoice??null,scenePlayerText:v1.scenePlayerText||''};
  // Datos v1-v5: antes el sueldo eran créditos sin moneda definida. No convertir temporadas históricas ficticiamente.
  const club=marketClub(migrated.clubId);
  if(club&&migrated.contract&&migrated.contract.salary<9000&&!migrated.contract.currency){migrated.contract={...migrated.contract,salary:annualSalary(club,migrated.ovr||60),currency:'EUR',estimated:true};}
  // Guardados pre-0.7 con ofertas en pantalla: reemplazar únicamente propuestas antiguas por el mercado nuevo.
  // No cambia club, historial, contratos ya aceptados ni decisiones del jugador.
  if(s.version<6&&s.phase==='transfer'){
   migrated.market={canStay:true,reason:'normal',renewal:null,source:'migration',searches:0,focus:'balanced'};
   migrated.offers=buildTransferOffers(migrated,{attempt:0});
  }
  return migrated;
}
export function careerYear(s){return (s.startYear??START_YEAR)+(s.age-(s.startAge??16));}
// Tres propuestas por ronda: leyendas, atributos y caminos de desarrollo diferentes.
export function draftChoices(s) {
  if (s.phase !== 'draft') return [];
  const r=rng(`${s.seed}:draft-v4:${s.draftIndex}:${s.draftRerolls}`);
  const unfilled=ATTRS.filter(([key])=>!(key in s.attributes));
  const order=[...unfilled];for(let i=order.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[order[i],order[j]]=[order[j],order[i]];}
  const source=[];
  const used=new Set((s.draftSources||[]).map(x=>x.legend));
  const important = ['pace','shot','pass','dribble','defense','physical'];
  // Una opción por nivel: la mejor cifra no siempre ofrece el mayor potencial.
  const tiers=['icono','figura','profesional'];
  const slots=tiers.map(t=>DRAFT_REFERENTS.filter(x=>x.tier===t&&!used.has(x.name)));
  for(let i=0;i<3;i++){
    const [key,label]=order[i%order.length];
    const pool=slots[i].length?slots[i]:DRAFT_REFERENTS.filter(x=>x.tier===tiers[i]);
    const player=pool[Math.floor(r()*pool.length)];
    used.add(player.name);
    const value=player.values[ATTRS.findIndex(a=>a[0]===key)];
    const weight=important.includes(key)?WEIGHTS[s.position][important.indexOf(key)]:.08;
    const fit=weight>=.26?'CLAVE PARA TU PUESTO':weight>=.16?'COMPLEMENTO FUERTE':'PERFIL ALTERNATIVO';
    source.push({legend:player.name,key,label,value,fit,tier:player.tier,development:player.ceiling,
      tierLabel:DRAFT_TIERS[player.tier].label,tierDetail:DRAFT_TIERS[player.tier].detail,
      hidden:s.mode==='Purista',archetype:archetypeFor({...s,attributes:{...s.attributes,[key]:value}}).name});
  }
  return source;
}
export function currentDraft(s){return draftChoices(s)[0]||null;}
export function rerollDraft(s){if(s.phase!=='draft'||s.draftRerolls>=5)return s;return {...s,draftRerolls:s.draftRerolls+1};}
const WEIGHTS={DC:[.13,.38,.10,.24,.02,.13],EI:[.29,.20,.15,.27,.02,.07],ED:[.29,.20,.15,.27,.02,.07],
  MCO:[.13,.18,.32,.25,.03,.09],MC:[.13,.12,.30,.22,.13,.10],MI:[.25,.12,.24,.23,.06,.10],MD:[.25,.12,.24,.23,.06,.10],
  MCD:[.09,.04,.24,.12,.30,.21],DFC:[.08,.03,.12,.07,.42,.28],LI:[.20,.04,.18,.17,.27,.14],LD:[.20,.04,.18,.17,.27,.14],POR:[.06,.01,.11,.03,.47,.32]};
export function acceptDraft(s, index=0){
  if(s.phase!=='draft')return s;
  const choices=draftChoices(s);
  const d=choices[Number.isInteger(index)&&index>=0&&index<choices.length?index:0];
  const attributes={...s.attributes,[d.key]:d.value};
  const draftSources=[...s.draftSources,{legend:d.legend,attribute:d.key,value:d.value,tier:d.tier}];
  if(s.draftIndex<7)return {...s,draftIndex:s.draftIndex+1,attributes,draftSources};
  const vals=['pace','shot','pass','dribble','defense','physical'];
  const weighted=vals.reduce((sum,k,i)=>sum+(attributes[k]??50)*WEIGHTS[s.position][i],0);
  const bonus=((attributes.skills||2)+(attributes.weak||2)-4)*.5;
  // El talento del draft representa el techo; el OVR inicial es una valoración independiente.
  const talent=clamp(Math.round(weighted+bonus*.75),60,97);
  const potential=clamp(talent+Math.floor(rng(`${s.seed}:potential`)()*7)-3+draftPotentialAdjustment(draftSources),68,97);
  const ovr=clamp(Math.round(59+(potential-65)*.23+rng(`${s.seed}:base`)()*5),55,Math.min(72,potential-5));
  return {...s,phase:'academy',draftIndex:8,attributes,draftSources,ovr,potential,footballDNA:archetypeFor({...s,attributes,draftSources})};
}
export function academyOffers(s){
  const c=getCountry(s.country); if(!c)return [];
  const verified=c.clubs.filter(cl=>!!getInauguralLeague(cl.id));
  const available=(verified.length>=3?verified:c.clubs.filter(cl=>!cl.inactive&&!getInauguralLeague(cl.id))).filter(cl=>!cl.inactive);
  const r=rng(`${s.seed}:academy`);
  const count=Math.min(3,available.length);const chosen=[];while(chosen.length<count){const at=Math.floor(r()*available.length);chosen.push(available.splice(at,1)[0]);}
  return chosen.map(club=>getClub(club.id));
}
export function signAcademy(s,id){if(s.phase!=='academy'||!academyOffers(s).some(x=>x.id===id))return s;return {...s,phase:'event',clubId:id,contract:{clubId:id,ends:careerYear(s)+3,salary:annualSalary(getClub(id),s.ovr||60,'Rotación'),currency:'EUR',estimated:true},pendingEvent:id===s.fanClubId?'fan_home':'arrival',sceneBeat:0,decisions:[...s.decisions,{age:s.age,text:`Primer contrato: ${getClub(id).name}`} ]};}
function countryLeagueSize(code){return Math.min(20,Math.max(1,getCountry(code)?.clubs.length||20));}
function positionGroup(p){if(p==='POR')return 'goalkeeper';if(['DC','EI','ED'].includes(p))return 'attack';if(['MCO','MC','MI','MD'].includes(p))return 'create';return 'defense';}
export const SEASON_PLANS=[
 {id:'equilibrio',name:'Equilibrio colectivo',tag:'BALANCE',description:'Priorizar la lectura de juego y la regularidad, sin arriesgar de más.'},
 {id:'ataque',name:'Atacar los espacios',tag:'VERTICAL',description:'Arriesgar en el último tercio para buscar más goles y asistencias.'},
 {id:'defensa',name:'Disciplina táctica',tag:'CONTROL',description:'Dar seguridad al equipo, cerrar espacios y facilitar un buen resultado.'}
];
export function chooseSeasonPlan(s,plan){if(s.phase!=='season'||!SEASON_PLANS.some(p=>p.id===plan))return s;
 return {...s,seasonPlan:plan};}
export function choosePreparation(s,id){
 if(s.phase!=='season'||!PREPARATIONS.some(p=>p.id===id))return s;
 const year=careerYear(s);if(s.preparation?.year===year)return s;
 return {...s,preparation:{year,id},careerMoments:[...(s.careerMoments||[]),{year,kind:'preseason',text:`Pretemporada: ${PREPARATIONS.find(p=>p.id===id).name}`}].slice(-80)};
}
export function advanceSeason(s){
 if(s.phase!=='season'||s.age>=40)return s;
 const club=getClub(s.clubId);if(!club)return s;
 const r=rng(`${s.seed}:seasonv5:${s.age}:${club.id}`);
 const league=playLeague(s),leagueRosters=nextLeagueRosters(s,league),{matches,goals,assists,cleanSheets,goalsConceded,injuryWeeks,leaguePosition,role,minutes}=league;
 const profile=s.developmentProfile||'normal';
 const ageStep=profile==='temprano'?2:profile==='tardio'?-2:0;
 const devAge=s.age+ageStep;
 const ageFactor=devAge<=21?1:devAge<=24?.78:devAge<=27?.5:devAge<=29?.22:0;
 const games=league.playerMatches.length||1;
 const share=minutes/(games*90);
 const injuryFactor=injuryWeeks>0?.56:1;
 const prep=preparationEffects(s),identity=identitySeasonEffects(s),agenda=seasonAgendaEffects(s);
 const gap=Math.max(0,s.potential-s.ovr);
 const breakout=s.age===(profile==='temprano'?19:profile==='tardio'?25:21)&&r()<.25?3:0;
 const declineStart=profile==='tardio'?33:profile==='temprano'?30:31;
 const decline=s.age>=declineStart?Math.max(1,Math.round(.6+(s.age-declineStart)*.65)):0;
 const growth=gap*.22*ageFactor*Math.max(.18,Math.min(1.12,share*1.55))*injuryFactor+breakout+prep.growth+(agenda.growth||0)+(r()-.5)*1.4-decline;
 const ovr=clamp(Math.round(s.ovr+growth),49,99);
 const titles=[];
 if(leaguePosition===1)titles.push(league.league);
 // Solo se concede el título de liga cuando se ganó por puntos en la tabla.
 const international=s.ovr>=77&&matches>=18?Math.floor(r()*7):0;
 const worldCup=international>0&&(s.age-18)%4===0&&s.age>=18;
 const worldCupResult=worldCup?choose(['Fase de grupos','Octavos de final','Cuartos de final','Semifinal'],r):null;
 const wage=s.contract?.currency==='EUR'?s.contract.salary:annualSalary(club,s.ovr);
 const seasonal={salaryEarned:wage,age:s.age,year:careerYear(s),clubId:club.id,club:club.name,country:club.country,ovrBefore:s.ovr,ovrAfter:ovr,role,matches,minutes,goals,assists,cleanSheets,goalsConceded,international,injuryWeeks,leaguePosition,titles,worldCupResult,
  table:league.standings,fixtures:league.fixtureResults,playerMatches:league.playerMatches,plan:league.plan,champion:league.champion,leagueName:league.league,leagueId:league.leagueId,leagueVerified:league.verified,leagueDivision:league.division,competitionVersion:2};
 const coachTrust=clamp((s.coachTrust??50)+(matches>=Math.round(games*.65)?3:matches<8?-5:-1)+(s.seasonPlan==='defensa'?2:0)+prep.coach+identity.coach,0,100);
 const relationships={...s.relationships,coach:{...s.relationships.coach,trust:coachTrust}};
 const flags={...(s.storyFlags||{})};if(s.fanClubId&&s.clubId===s.fanClubId)flags.playedForFan=true;
 let reputation=clamp((s.reputation||0)+(leaguePosition<=3?3:0)+Math.min(4,Math.floor((goals+assists)/13))+prep.reputation,0,100);
 let contract=s.contract;
 const trophyRecords=[...(s.trophyRecords||[]),...titles.map(title=>({title,year:careerYear(s),clubId:club.id,leagueId:league.leagueId||'',kind:'league'}))];
 return {...s,age:s.age+1,ovr,reputation,contract,trophyRecords,annualScenes:0,morale:clamp((s.morale??70)+prep.morale+identity.morale,0,100),careerEarnings:(s.careerEarnings||0)+wage,leagueRosters,coachTrust,relationships,history:[...s.history,seasonal],trophies:[...s.trophies,...titles],lastSeason:seasonal,recapPending:true,pendingEvent:chooseScene({...s,lastSeason:seasonal},r),storyFlags:flags,
  sceneBeat:0,sceneChoice:null,scenePlayerText:'',phase:s.age===39?'retired':'event'};
}

export function eventInfo(s){if(s.phase!=='event')return null;return sceneFor(s);}
export function resolveEvent(s,option,playerText=''){
  if(s.phase!=='event'||(s.sceneBeat||0)!==0)return s;
  const event=sceneFor(s);
  if(!Number.isInteger(option)||option<0||option>=event.options.length)return s;
  return resultOfScene(s,event,option,playerText);
}
export function finishEvent(s){
 if(s.phase!=='event'||s.sceneBeat!==1)return s;
 const hadFanScene=s.pendingEvent==='fan_home';
 const flags=hadFanScene?{...s.storyFlags,playedForFan:true}:s.storyFlags;
 let next={...s,phase:'season',pendingEvent:null,sceneBeat:0,sceneChoice:null,scenePlayerText:'',storyFlags:flags};
 // Al concluir una cesión de una temporada vuelve al club de origen conservando su contrato.
 if(next.contract?.kind==='loan'&&next.contract.ends<=careerYear(next)&&next.contract.parentClubId){
  const parent=marketClub(next.contract.parentClubId);
  if(parent){const parentContract=next.contract.parentContract||{clubId:parent.id,ends:careerYear(next)+1,salary:annualSalary(parent,next.ovr),currency:'EUR'};
   next={...next,clubId:parent.id,contract:parentContract,coachTrust:48,decisions:[...next.decisions,{age:next.age,text:`Regresaste a ${parent.name} tras una cesión`}]};}
 }
 if(next.history.length===0)return next;
 // Segunda escena contextual por campaña, sin repetir el primer contrato ni escenas de hinchas.
 const extraScenes=rng(`${next.seed}:scene-amount:${careerYear(next)}`)()<.55?1:2;
 if((next.annualScenes||0)<extraScenes && next.history.length>0 && !['arrival','fan_home','fan_departure'].includes(s.pendingEvent)){
  const r=rng(`${next.seed}:second-scene:${careerYear(next)}:${next.clubId}`);
  let another=chooseScene({...next,lastSeason:next.lastSeason},r);
  if(another===s.pendingEvent)another=chooseScene(next,()=>.97);
  if(another===s.pendingEvent)another='coach';
  return {...next,pendingEvent:another,phase:'event',annualScenes:(next.annualScenes||0)+1};
 }
 const policy=evaluateClubFuture(next);
 const mandatory=!policy.canStay;
 const pressure=Math.min(.96,.33+(next.reputation||0)/190+Math.max(0,(next.ovr||60)-78)*.025);
 const shouldOpen=mandatory||policy.reason==='renewal'||rng(`${next.seed}:transfer7:${next.age}`)()<pressure;
 if(!shouldOpen)return {...next,market:null,offers:[]};
 let offers=buildTransferOffers(next,{attempt:0,forced:mandatory});
 if(policy.reason==='loan-request')offers=offers.map((o,i)=>i<2?{...o,kind:'loan',role:'Cesión',years:1,salary:annualSalary(o,next.ovr,'Cesión')}:o);
 return {...next,offers,market:{...policy,source:'season',searches:0,focus:'balanced'},agent:{searches:0,year:careerYear(next),focus:'balanced'},phase:'transfer'};
}
export function autoResolveEvent(s){if(s.phase!=='event')return s;const first=(s.sceneBeat||0)===0?resolveEvent(s,0):s;return finishEvent(first);}
export function transferOffers(s){if((s.history||[]).length<1)return [];return buildTransferOffers(s,{attempt:0});}
export function openAgentMarket(s,focus='balanced'){
 if(s.phase!=='season'||!s.history?.length)return s;
 const sameYear=s.agent?.year===careerYear(s);
 if(sameYear&&(s.agent?.searches||0)>=2)return s;
 const market={canStay:true,reason:'agent',renewal:null,source:'agent',searches:sameYear?(s.agent.searches||0):0,focus};
 const next={...s,market,phase:'transfer',offers:buildTransferOffers(s,{attempt:market.searches+1,focus})};
 return {...next,agent:{year:careerYear(s),searches:market.searches+1,focus}};
}
export function askAgentForMore(s,focus='balanced'){
 if(s.phase!=='transfer'||(s.market?.searches||0)>=2)return s;
 const searches=(s.market?.searches||0)+1;
 const offers=buildTransferOffers(s,{attempt:searches,focus,forced:!s.market?.canStay});
 return {...s,offers,market:{...(s.market||{canStay:true}),searches,focus},agent:{year:careerYear(s),searches,focus}};
}
export function chooseTransfer(s,id=null){
 if(s.phase!=='transfer')return s;
 const offer=(s.offers||[]).find(o=>o.id===id);
 if(id&&!offer)return s;
 if(!offer&&s.market?.canStay===false)return s;
 const nextClubId=offer?.id||s.clubId;
 const joinedFan=!!(offer&&s.fanClubId===nextClubId&&s.clubId!==nextClubId);
 const leftFan=!!(offer&&s.fanClubId===s.clubId&&s.clubId!==nextClubId);
 const rel={...s.relationships,coach:{...s.relationships.coach,trust:offer?47:clamp((s.relationships.coach.trust||50)+3,0,100)}};
 let contract=s.contract;
 if(offer){
  contract={clubId:nextClubId,ends:careerYear(s)+(offer.years||3),salary:offer.salary,currency:'EUR',estimated:true,kind:offer.kind};
  if(offer.kind==='loan')contract={...contract,parentClubId:s.clubId,parentContract:s.contract};
 }else if(s.market?.renewal){contract={clubId:s.clubId,...s.market.renewal,currency:'EUR',estimated:true,kind:'permanent'};}
 else if(!contract||contract.ends<=careerYear(s))contract={clubId:s.clubId,ends:careerYear(s)+2,salary:annualSalary(marketClub(s.clubId),s.ovr),currency:'EUR',estimated:true};
 return {...s,phase:joinedFan||leftFan?'event':'season',pendingEvent:joinedFan?'fan_home':leftFan?'fan_departure':null,
  sceneBeat:0,clubId:nextClubId,contract,market:null,relationships:rel,coachTrust:rel.coach.trust,offers:[],
  decisions:[...s.decisions,{age:s.age,text:offer?`${offer.kind==='loan'?'Cesión a':'Fichaste por'} ${offer.name} (${offer.country})`:`Continuaste en ${getClub(s.clubId)?.name||'tu equipo'}`}]};
}
export function retireFromMarket(s){
 if(s.phase!=='transfer'||s.market?.canStay||s.age<31)return s;
 return {...s,phase:'retired',market:null,offers:[],decisions:[...s.decisions,{age:s.age,text:'Sin contrato disponible: decidiste retirarte del fútbol profesional'}]};
}
export function simulateToRetirement(state){
  let s=state;
  for(let k=0;k<160&&s.phase!=='retired';k++){
    if(s.phase==='season')s=advanceSeason(s);
    else if(s.phase==='event')s=autoResolveEvent(s);
    else if(s.phase==='transfer'){
      const current=getClub(s.clubId);
      const best=[...(s.offers||[])].sort((a,b)=>b.prestige-a.prestige)[0];
      if(best)s=chooseTransfer(s,best.id);
      else if(s.market?.canStay)s=chooseTransfer(s);
      else if((s.market?.searches||0)<2)s=askAgentForMore(s);
      else s=retireFromMarket(s);
    }
    else break;
  }
  return s;
}
export function totals(s){return s.history.reduce((a,x)=>({matches:a.matches+x.matches,goals:a.goals+x.goals,assists:a.assists+x.assists,international:a.international+x.international,cleanSheets:a.cleanSheets+x.cleanSheets}),{matches:0,goals:0,assists:0,international:0,cleanSheets:0});}

/** Tabla certificada: siempre sale de los resultados de encuentros cuando la temporada es nueva. */
export function simulatedStandings(s){
 const club=getClub(s.clubId);if(!club)return [];
 const saved=[...(s.history||[])].reverse().find(x=>x.clubId===s.clubId&&Array.isArray(x.table));
 if(saved&&saved.leagueId===getCompetitionForCareer(s)?.id)return saved.table.map(t=>({...t,isPlayer:t.id===s.clubId}));
 // Antes de disputar partidos, no hay tabla ficticia con puntos inventados.
 return leagueParticipants(club.countryCode,s.clubId,s).map(c=>({id:c.id,name:c.name,played:0,wins:0,draws:0,losses:0,for:0,against:0,gd:0,points:0,isPlayer:c.id===s.clubId})).sort((a,b)=>a.name.localeCompare(b.name,'es')).map((x,i)=>({...x,position:i+1}));
}
