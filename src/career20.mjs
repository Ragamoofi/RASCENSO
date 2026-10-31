/* RASCENSO 2.0 · Motor de carrera.
 * - La media (OVR) se deriva SIEMPRE de los atributos reales según el puesto.
 * - Cada atributo tiene un techo propio (heredado del legado + talento oculto) que puede subir o bajar.
 * - Vestuario: competidor directo por el puesto, entrenador con personalidad, directiva y afición.
 * - Objetivos de temporada, promesas con memoria (threads) y nota media de la campaña.
 * Todo es determinista por semilla: recargar la página nunca cambia un resultado.
 */
export const KEY_ATTRS=['pace','shot','pass','dribble','defense','physical'];
export const POSITION_WEIGHTS={DC:[.13,.38,.10,.24,.02,.13],EI:[.29,.20,.15,.27,.02,.07],ED:[.29,.20,.15,.27,.02,.07],
 MCO:[.13,.18,.32,.25,.03,.09],MC:[.13,.12,.30,.22,.13,.10],MI:[.25,.12,.24,.23,.06,.10],MD:[.25,.12,.24,.23,.06,.10],
 MCD:[.09,.04,.24,.12,.30,.21],DFC:[.08,.03,.12,.07,.42,.28],LI:[.20,.04,.18,.17,.27,.14],LD:[.20,.04,.18,.17,.27,.14],POR:[.06,.01,.11,.03,.47,.32]};
export const POSITION_NAMES={POR:'Arquero',DFC:'Defensa central',LI:'Lateral izquierdo',LD:'Lateral derecho',MCD:'Pivote defensivo',MC:'Mediocampista',MI:'Volante izquierdo',MD:'Volante derecho',MCO:'Mediapunta',EI:'Extremo izquierdo',ED:'Extremo derecho',DC:'Delantero centro'};
// Puestos vecinos: un cambio de posición solo se propone hacia funciones compatibles.
export const NEIGHBOURS={DC:['EI','ED','MCO'],EI:['ED','MI','DC','MCO'],ED:['EI','MD','DC','MCO'],MCO:['MC','DC','EI','ED'],MC:['MCO','MCD','MI','MD'],MI:['EI','MC','LI'],MD:['ED','MC','LD'],MCD:['MC','DFC'],DFC:['MCD','LI','LD'],LI:['MI','DFC','LD'],LD:['MD','DFC','LI'],POR:[]};
export const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
export function hash(x){let h=2166136261;for(const c of String(x)){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0;}
export function rng(seed){let a=hash(seed);return ()=>{a=(a+0x6D2B79F5)|0;let t=Math.imul(a^(a>>>15),1|a);t^=t+Math.imul(t^(t>>>7),61|t);return ((t^(t>>>14))>>>0)/4294967296;};}
export const yearOf=s=>(s.startYear||2026)+(s.age-(s.startAge||16));
const group=p=>p==='POR'?'goalkeeper':['DC','EI','ED'].includes(p)?'attack':['MCO','MC','MI','MD'].includes(p)?'middle':'defense';
export {group as positionGroup};

/** Media según puesto: ponderación de los seis atributos principales + filigranas y pierna mala. */
export function ovrFromAttributes(position,attrs={}){
 const w=POSITION_WEIGHTS[position]||POSITION_WEIGHTS.MC;
 const base=KEY_ATTRS.reduce((sum,k,i)=>sum+(Number(attrs[k])||45)*w[i],0);
 const stars=((Number(attrs.skills)||2)+(Number(attrs.weak)||2)-5)*.55;
 return clamp(Math.round(base+(position==='POR'?0:stars)),30,99);
}
export function bestPositions(attrs,current){
 return Object.keys(POSITION_WEIGHTS).filter(p=>p!=='POR'||current==='POR').map(p=>({position:p,name:POSITION_NAMES[p],ovr:ovrFromAttributes(p,attrs)})).sort((a,b)=>b.ovr-a.ovr||(a.position===current?-1:1));
}

/** Atributos principales ordenados por importancia para el puesto. */
export function keysByWeight(position){const w=POSITION_WEIGHTS[position]||POSITION_WEIGHTS.MC;return [...KEY_ATTRS].sort((a,b)=>w[KEY_ATTRS.indexOf(b)]-w[KEY_ATTRS.indexOf(a)]);}
/** Potencial = media que tendría el jugador al alcanzar todos sus techos. */
export function potentialFrom(position,attrs={},ceil={},ovr=ovrFromAttributes(position,attrs)){return Math.max(ovr,ovrFromAttributes(position,Object.fromEntries(Object.entries(ceil).map(([k,v])=>[k,Math.max(v,attrs[k]??0)]))));}
/** Cambia la media moviendo atributos reales (los más importantes del puesto), nunca la cifra directamente. */
export function adjustOvr(s,delta){
 if(!delta)return s;
 if(!s.attributes||!KEY_ATTRS.every(k=>Number.isFinite(s.attributes[k])))return {...s,ovr:(s.ovr||0)+delta};
 const order=keysByWeight(s.position);
 const a={...s.attributes};let guard=0;const step=delta>0?1:-1;
 const target=delta>0?Math.min(s.potential||99,(s.ovr||0)+delta):(s.ovr||0)+delta;
 const pending=()=>step>0?ovrFromAttributes(s.position,a)<target:ovrFromAttributes(s.position,a)>target;
 while(pending()&&guard++<12){const k=order[guard%2];a[k]=clamp(a[k]+step,20,99);}
 return {...s,attributes:a,ovr:ovrFromAttributes(s.position,a)};
}

/* ---------- Draft: el legado es un referente, el juvenil es otra persona ---------- */
const TIER_START={icono:2,figura:0,profesional:-1};
const TIER_CEILING={icono:0,figura:2,profesional:4};
/** Valor real con el que el juvenil empieza en ese atributo (no la cifra de la leyenda). */
export function juniorValue(legendValue,key,tier){
 if(key==='skills'||key==='weak')return clamp(Math.round(legendValue)-1,1,5);
 return clamp(Math.round(36+(legendValue-30)*.36+(TIER_START[tier]??0)),32,66);
}
/** Techo de ese atributo, visible como proyección. El talento oculto se suma al cerrar el draft. */
export function juniorCeiling(legendValue,key,tier){
 if(key==='skills'||key==='weak')return clamp(Math.round(legendValue),1,5);
 return clamp(Math.round(44.5+(legendValue-50)*.7+(TIER_CEILING[tier]??0)),48,94);
}
/** Talento oculto: la mayoría de juveniles queda cerca de su proyección; muy pocos la superan con holgura. */
export function hiddenTalent(seed){const r=rng(seed+':talent20');const t=Math.pow(r(),2.4);return Math.round(-3+t*16);}
export function finalizeDraft(s,attributes){
 const ceilings={...(s.attrCeil||{})};
 const talent=hiddenTalent(s.seed);
 for(const k of KEY_ATTRS){if(Number.isFinite(ceilings[k]))ceilings[k]=clamp(ceilings[k]+talent,Math.max(attributes[k]+6,48),99);}
 for(const k of ['skills','weak'])if(Number.isFinite(ceilings[k]))ceilings[k]=clamp(Math.max(ceilings[k],attributes[k]),1,5);
 const ovr=ovrFromAttributes(s.position,attributes);
 return {attrCeil:ceilings,talent,ovr,potential:Math.max(ovr+3,ovrFromAttributes(s.position,ceilings)),attrModel:2};
}

/* ---------- Migración de partidas antiguas ---------- */
/** v8 o anteriores: los atributos podían no coincidir con la media. Se desplazan en bloque para respetar el perfil y la media guardada. */
export function migrateAttributes(s){
 if(s.attrModel===2&&s.attrCeil)return {};
 const attrs={...(s.attributes||{})};
 const ovr=Number(s.ovr)||null;
 if(!ovr||!KEY_ATTRS.every(k=>Number.isFinite(Number(attrs[k]))))return {attrModel:2,attrCeil:null};
 for(let i=0;i<6;i++){const diff=ovr-ovrFromAttributes(s.position,attrs);if(Math.abs(diff)<1)break;for(const k of KEY_ATTRS)attrs[k]=clamp(Math.round(Number(attrs[k])+diff),20,99);}
 const gap=Math.max(0,(s.potential||ovr)-ovr);
 const w=POSITION_WEIGHTS[s.position]||POSITION_WEIGHTS.MC;
 const ceil={};KEY_ATTRS.forEach((k,i)=>{ceil[k]=clamp(attrs[k]+Math.round(gap*(.6+w[i]*1.6)),attrs[k],99);});
 ceil.skills=clamp(attrs.skills||2,1,5);ceil.weak=clamp(attrs.weak||2,1,5);
 const fixedOvr=ovrFromAttributes(s.position,attrs);
 return {attributes:attrs,attrCeil:ceil,attrModel:2,ovr:fixedOvr,potential:Math.max(fixedOvr,s.potential||fixedOvr,ovrFromAttributes(s.position,ceil))};
}

/* ---------- Entrenadores ---------- */
export const COACH_STYLES={
 formador:{name:'Formador de talentos',short:'Formador',description:'Da minutos a los jóvenes y acelera su desarrollo; exige paciencia a los veteranos.'},
 pragmatico:{name:'Pragmático',short:'Pragmático',description:'Juega con los que rinden hoy. La media pesa más que la promesa.'},
 ofensivo:{name:'Romántico ofensivo',short:'Ofensivo',description:'Quiere goles y riesgo. Los atacantes brillan; los defensores sufren.'},
 disciplinario:{name:'Sargento disciplinario',short:'Disciplina',description:'Premia el sacrificio y castiga los desplantes. La confianza sube y baja rápido.'},
 gestor:{name:'Gestor de vestuario',short:'Gestor',description:'Cuida el clima del grupo y respeta la jerarquía de los veteranos.'},
 estratega:{name:'Estratega táctico',short:'Estratega',description:'Rota mucho, prueba posiciones y exige comprensión táctica.'}
};
export function coachRoleBias(coach,s){
 if(!coach)return 0;const g=group(s.position);let b=0;
 if(coach.style==='formador')b+=s.age<=21?3.2:s.age>=31?-1.6:0;
 if(coach.style==='pragmatico')b+=s.age>=26?1.2:s.age<=19?-1.8:0;
 if(coach.style==='ofensivo')b+=g==='attack'?1.6:g==='defense'?-.8:0;
 if(coach.style==='gestor')b+=s.age>=29?1.8:0;
 if(coach.style==='disciplinario')b+=s.personality==='rebelde'?-2.5:['disciplinado','obsesivo','lider'].includes(s.personality)?1.5:0;
 if(coach.style==='estratega')b+=s.preparation?.id==='tactica'&&s.preparation.year===yearOf(s)?1.5:0;
 return b;
}
export function coachSeasonEffects(coach,s){
 const st=coach?.style;return {
  growthYoung:st==='formador'&&s.age<=22?1.18:1,
  goals:st==='ofensivo'?1.07:st==='pragmatico'?.96:1,
  starterMinutes:st==='estratega'?-.05:0,
  trustSwing:st==='disciplinario'?1.6:st==='gestor'?.7:1,
  morale:st==='gestor'?2:st==='disciplinario'?-1:0,
  focusBonus:st==='estratega'?{defense:1.15,pass:1.12}:st==='disciplinario'?{physical:1.15}:st==='ofensivo'?{shot:1.12,dribble:1.1}:{}
 };
}

/* ---------- Vestuario: competidor directo, directiva y afición ---------- */
export function rivalTeammate(seedKey,club,position,age,names){
 const r=rng(seedKey+':rival20');
 const level=club?.level??65;
 const rivalAge=clamp(Math.round(age+(r()-.35)*10),18,35);
 return {name:names?names(seedKey+':rivalname'):'Compañero',age:rivalAge,ovr:clamp(Math.round(level+(r()-.42)*9),45,95),position,trend:0,since:null};
}
export function freshSquad(s,club,coach,names){
 const fan=s.fanClubId&&s.fanClubId===club?.id;
 return {clubId:club?.id||null,rival:rivalTeammate(`${s.seed}:${club?.id}:${yearOf(s)}`,club,s.position,s.age,names),
  board:55,fans:fan?72:48,captain:false,seasons:0,idol:false,coachId:coach?.id||null};
}
/** Rol en la plantilla: compite contra un futbolista concreto, no contra una cifra abstracta. */
export function squadRole(s,clubLevel,coach){
 const rival=s.squad?.clubId===s.clubId?s.squad.rival:null;
 const trust=s.coachTrust??50;
 const fx=threadEffects(s);
 let score;
 if(rival){score=(s.ovr||60)-rival.ovr+(trust-50)*.11+coachRoleBias(coach,s)+((s.morale??70)-70)*.03+fx.role;}
 else score=(s.ovr||60)-clubLevel+3+(trust-50)*.075+coachRoleBias(coach,s)+fx.role;
 // Nadie es titular indiscutido en un club muy superior a su nivel.
 const gap=(s.ovr||60)-clubLevel;
 let role=score>=1?'Titular':score>=-5?'Rotación':score>=-11?'Suplente':'Reserva';
 if(gap<-13&&role==='Titular')role='Rotación';
 if(gap<-18&&role==='Rotación')role='Suplente';
 return role;
}

/* ---------- Promesas, compromisos y deudas narrativas ---------- */
export const THREAD_INFO={
 promise_minutes:{name:'Promesa de minutos',icon:'⏱'},
 transfer_request:{name:'Pediste salir',icon:'✈'},
 public_challenge:{name:'Desafío público',icon:'⚔'},
 extra_training:{name:'Doble turno',icon:'🏋'},
 position_trial:{name:'Nueva posición',icon:'⇄'},
 big_club_interest:{name:'Club interesado',icon:'★'},
 salary_cut:{name:'Rebaja solidaria',icon:'♥'},
 captain:{name:'Capitanía',icon:'C'},
 mentor:{name:'Mentor de un juvenil',icon:'✦'},
 rushed_return:{name:'Regreso apresurado',icon:'✚'},
 fans_conflict:{name:'Conflicto con la hinchada',icon:'!'},
 board_ultimatum:{name:'Ultimátum de la directiva',icon:'⚖'},
 national_snub:{name:'Ausencia en la selección',icon:'⚑'},
 family:{name:'Asunto familiar',icon:'⌂'},
 media_feud:{name:'Polémica mediática',icon:'◎'},
 nutrition:{name:'Plan profesional',icon:'♣'},
 last_dance:{name:'Última función',icon:'☾'}
};
export function activeThreads(s,year=yearOf(s)){return (s.threads||[]).filter(t=>!t.resolved&&(t.until??year)>=year);}
export function hasThread(s,kind){return activeThreads(s).some(t=>t.kind===kind);}
export function addThread(s,kind,data={},years=1){const year=yearOf(s);const threads=[...(s.threads||[]).filter(t=>!(t.kind===kind&&!t.resolved)),{kind,year,until:year+years-1,data,resolved:false}];return threads.slice(-40);}
export function resolveThread(s,kind,outcome=''){return (s.threads||[]).map(t=>t.kind===kind&&!t.resolved?{...t,resolved:true,outcome}:t);}
export function threadEffects(s){
 const t=new Set(activeThreads(s).map(x=>x.kind));
 return {
  role:(t.has('promise_minutes')?4:0)+(t.has('transfer_request')?-3:0)+(t.has('captain')?2:0)+(t.has('board_ultimatum')?-1:0)+(t.has('media_feud')?-1.5:0),
  minutes:(t.has('promise_minutes')?.06:0)+(t.has('rushed_return')?.04:0)+(t.has('family')?-.05:0),
  injury:(t.has('extra_training')?1.35:1)*(t.has('rushed_return')?1.6:1)*(t.has('nutrition')?.75:1)*(t.has('last_dance')?1.15:1),
  growth:(t.has('extra_training')?1.22:1)*(t.has('mentor')?.95:1)*(t.has('nutrition')?1.06:1),
  goals:(t.has('public_challenge')?1.06:1)*(t.has('captain')?1.02:1)*(t.has('fans_conflict')?.95:1)*(t.has('last_dance')?1.05:1),
  decline:(t.has('nutrition')?.75:1),
  morale:(t.has('captain')?3:0)+(t.has('family')?-4:0)+(t.has('fans_conflict')?-3:0)+(t.has('salary_cut')?2:0)
 };
}

/* ---------- Objetivos de temporada ---------- */
export function seasonObjectives(s,participants,role){
 if(!participants?.length)return null;
 const n=participants.length;
 const sorted=[...participants].sort((a,b)=>b.level-a.level||String(a.id).localeCompare(String(b.id)));
 const rank=Math.max(1,sorted.findIndex(t=>t.id===s.clubId)+1);
 const tier=s.__tier??null;
 let board;
 if(tier===2)board=rank<=4?{id:'promotion',label:'Lograr el ascenso',target:2,text:'Terminar entre los dos primeros'}:{id:'upper',label:'Pelear arriba',target:Math.ceil(n/2),text:`Terminar en la mitad superior (top ${Math.ceil(n/2)})`};
 else if(rank<=2)board={id:'title',label:'Ganar la liga',target:1,text:'Salir campeón del torneo'};
 else if(rank<=Math.ceil(n*.28))board={id:'top',label:'Clasificar arriba',target:4,text:'Terminar entre los cuatro primeros'};
 else if(rank<=Math.ceil(n*.62))board={id:'mid',label:'Mitad superior',target:Math.ceil(n/2),text:`Terminar en el top ${Math.ceil(n/2)}`};
 else board={id:'survival',label:'Mantener la categoría',target:n-2,text:`No terminar en los dos últimos lugares (${n-1}° o ${n}°)`};
 const games=(n-1)*2;const g=group(s.position);
 const share={Titular:.62,'Rotación':.4,Suplente:.2,Reserva:.08}[role]??.4;
 const apps=Math.max(3,Math.round(games*share));
 let personal;
 if(g==='attack')personal={id:'goals',label:`${Math.max(2,Math.round(apps*.36))} goles`,stat:'goals',target:Math.max(2,Math.round(apps*.36))};
 else if(g==='middle')personal={id:'contrib',label:`${Math.max(2,Math.round(apps*.32))} goles + asistencias`,stat:'contrib',target:Math.max(2,Math.round(apps*.32))};
 else if(g==='goalkeeper')personal={id:'clean',label:`${Math.max(2,Math.round(apps*.26))} vallas invictas`,stat:'cleanSheets',target:Math.max(2,Math.round(apps*.26))};
 else personal={id:'apps',label:`${apps} partidos jugados`,stat:'matches',target:apps};
 return {board:{...board,expectedRank:rank,teams:n},personal,minutes:{label:`${apps} partidos`,target:apps},role};
}
export function evaluateObjectives(obj,season){
 if(!obj)return null;
 const pos=season.leaguePosition;
 const boardMet=pos<=obj.board.target;
 const value=obj.personal.stat==='contrib'?(season.goals||0)+(season.assists||0):season[obj.personal.stat]||0;
 const personalMet=value>=obj.personal.target;
 const appsMet=(season.matches||0)>=obj.minutes.target;
 return {board:{...obj.board,met:boardMet,actual:pos},personal:{...obj.personal,met:personalMet,actual:value},minutes:{...obj.minutes,met:appsMet,actual:season.matches||0},
  score:(boardMet?1:0)+(personalMet?1:0)+(appsMet?.5:0)};
}

/* ---------- Nota media de la temporada ---------- */
export function seasonRating(season,position){
 if(!season||!season.matches)return null;
 const g=group(position),mins=Math.max(90,season.minutes||season.matches*70);
 const expect={attack:.42,middle:.26,defense:.07,goalkeeper:0}[g];
 // Con pocos minutos la producción por 90 se acerca a lo esperado: evita notas infladas de suplentes.
 const K=8;const per90=((season.goals||0)*(g==='attack'?1:1.15)+(season.assists||0)*.75+expect*K)/(mins/90+K);
 const teams=season.table?.length||16;
 const posFx=((teams+1)/2-(season.leaguePosition||teams/2))/teams*.9;
 let r=6.35+(per90-expect)*(g==='attack'?2.1:2.6)+posFx;
 if(g==='goalkeeper'||g==='defense'){const cs=(season.cleanSheets||0)/Math.max(1,season.matches);const ga=season.table?.find(t=>t.isPlayer)?.against;const gaRate=ga!=null?ga/Math.max(1,(teams-1)*2):1.3;r+=(1.3-gaRate)*.55+(g==='goalkeeper'?cs*.9-.2:0);}
 if((season.injuryWeeks||0)>=8)r-=.12;
 // Escala calibrada: mediana ≈ 6,6; una temporada de 7,4 ya es sobresaliente.
 r=6.45+(r-6.35)*.8;
 return Math.round(clamp(r,5.6,8.6)*100)/100;
}

/* ---------- Desarrollo anual de atributos ---------- */
function ageRate(age){return age<=17?.36:age<=19?.33:age<=21?.27:age<=23?.19:age<=25?.12:age<=27?.06:age<=29?.025:0;}
/** Edad a partir de la que empieza el declive. Oculta, distinta por carrera. */
export function declineAge(s){const r=rng(s.seed+':decline20')();const base=s.developmentProfile==='temprano'?29:s.developmentProfile==='tardio'?32:30.5;return Math.round(base+r*2.4+(s.position==='POR'?3:0)+(s.injuryProfile==='fragil'?-1:0));}
export function developSeason(s,info){
 const r=rng(`${s.seed}:develop20:${s.age}:${s.clubId}`);
 const attrs={...(s.attributes||{})},ceil={...(s.attrCeil||{})};
 const before={...attrs},notes=[];
 const profileShift=s.developmentProfile==='temprano'?1.5:s.developmentProfile==='tardio'?-2:0;
 const devAge=s.age+profileShift;
 const share=clamp(info.share||0,0,1);
 // Los juveniles se forman también en reserva y cantera: los minutos en primera pesan más con la edad.
 const floor=s.age<=19?.58:s.age<=21?.46:s.age<=23?.36:.26;
 const minutesF=clamp(floor+share*(1.12-floor),floor,1.18);
 const rating=info.rating??6.4;
 const perfF=clamp(1+(rating-6.65)*.16,.84,1.16);
 const coachFx=info.coachFx||{growthYoung:1,focusBonus:{}};
 const fx=info.threadFx||{growth:1,decline:1};
 const focus=info.focus||{};
 const personality=s.personality==='obsesivo'?1.08:s.personality==='disciplinado'?1.04:s.personality==='rebelde'?.96:1;
 const cf=info.careerFx||{};
 const dAge=declineAge(s)+(cf.declineYears||0);
 const w=POSITION_WEIGHTS[s.position]||POSITION_WEIGHTS.MC;
 // Lesión grave: deja huella física y, a veces, en el techo.
 if((info.injuryWeeks||0)>=10){for(const k of ['pace','physical']){if(Number.isFinite(attrs[k])){const dmg=1+Math.floor(r()*2);attrs[k]=clamp(attrs[k]-dmg,20,99);if(r()<.55&&ceil[k])ceil[k]=clamp(ceil[k]-1-Math.floor(r()*2),attrs[k],99);}}notes.push({kind:'injury',text:'La lesión grave dejó secuelas en tu velocidad y tu físico.'});}
 // Estancamiento: sin minutos entre los 18 y 21 se pierde parte del techo.
 if(s.age>=19&&s.age<=22&&share<.12){const keys=keysByWeight(s.position).slice(0,3);let lost=0;for(const k of keys)if(ceil[k]&&r()<.45){ceil[k]=clamp(ceil[k]-1-Math.floor(r()*2),attrs[k],99);lost++;}if(lost)notes.push({kind:'stagnation',text:'La falta de minutos frenó tu proyección: tu techo bajó.'});}
 // Explosión: una gran temporada joven puede abrir un techo mayor.
 if(s.age<=23&&share>.55&&rating>=7.15&&r()<.42){const keys=keysByWeight(s.position).slice(0,2);for(const k of keys)if(ceil[k])ceil[k]=clamp(ceil[k]+1+Math.floor(r()*3),attrs[k],99);notes.push({kind:'breakout',text:'Temporada de explosión: los ojeadores elevan tu proyección.'});}
 for(const k of KEY_ATTRS){
  if(!Number.isFinite(Number(attrs[k])))continue;
  const v=Number(attrs[k]),c=Number(ceil[k]??v+4);
  const imp=w[KEY_ATTRS.indexOf(k)];
  const focusF=(focus[k]||1)*(coachFx.focusBonus?.[k]||1);
  // Elecciones del creador: desarrollo global, por atributo, juvenil y según minutos.
  const choiceF=(cf.growth||1)*(cf.growthAttr?.[k]||1)*(s.age<=21?cf.growthYoung||1:1)*(share<.4?cf.growthLow||1:1)*(share>.5?cf.growthRegular||1:1);
  let gain=Math.max(0,c-v)*ageRate(devAge)*minutesF*perfF*coachFx.growthYoung*fx.growth*personality*focusF*choiceF*(.85+imp*.9);
  gain+=(r()-.5)*.9*(1+(cf.varianceUp||0)*.8);
  if(s.age>=dAge){
   const years=s.age-dAge+1;
   const speed=(k==='pace'?1.7*(cf.paceDecline||1):k==='physical'?1.35:k==='dribble'?1.15:k==='shot'?.85:k==='pass'?.55:.65);
   const keeper=s.position==='POR'&&k==='defense'?.6:1;
   gain-=(.45+years*.55)*speed*keeper*fx.decline*(.7+r()*.6);
  }
  // Experiencia: lectura de juego y pase siguen afinándose hasta los 31.
  if(s.age>=26&&s.age<=31&&(k==='pass'||k==='defense')&&share>.4&&r()<.35)gain+=1;
  attrs[k]=clamp(Math.round(v+gain),20,99);
  if(attrs[k]>c&&gain>0)attrs[k]=Math.max(v,c);
 }
 for(const k of ['skills','weak']){
  if(!Number.isFinite(Number(attrs[k])))continue;
  const cap=ceil[k]??5;
  if(s.age<=27&&attrs[k]<cap&&share>.35&&r()<(focus[k]?.35:.14))attrs[k]++;
  if(s.age>=35&&r()<.1)attrs[k]=Math.max(1,attrs[k]-1);
 }
 const ovr=ovrFromAttributes(s.position,attrs);
 const potential=potentialFrom(s.position,attrs,ceil,ovr);
 const changes={};for(const [k] of Object.entries(attrs))if(Number.isFinite(before[k]))changes[k]=attrs[k]-before[k];
 return {attributes:attrs,attrCeil:ceil,ovr,potential,changes,notes};
}
/** Atributo prioritario según la pretemporada elegida. */
export function preparationFocus(id){return ({definicion:{shot:1.45},creacion:{pass:1.45,skills:1},fisico:{physical:1.4,pace:1.25},tactica:{defense:1.3,pass:1.15},equilibrio:{},caracter:{}})[id]||{};}

/* ---------- Proyección que ve el jugador (los ojeadores no son infalibles) ---------- */
export function scoutedPotential(s){
 if(!s.potential||!s.ovr)return null;
 const r=rng(`${s.seed}:scout:${s.age}`);
 const spread=s.age<=19?6:s.age<=22?4:s.age<=25?2:0;
 const centre=s.potential+Math.round((r()-.5)*spread*.6);
 const low=clamp(Math.max(s.ovr,centre-spread),s.ovr,99),high=clamp(Math.max(low,centre+spread),s.ovr,99);
 const label=high>=90?'Proyección de clase mundial':high>=84?'Proyección de élite':high>=78?'Proyección de primer nivel':high>=72?'Proyección sólida':'Proyección modesta';
 return {low,high,label};
}

/* ---------- Récords e hitos de la carrera ---------- */
export function careerRecords(s){
 const H=s.history||[];if(!H.length)return {records:[],milestones:[],byClub:[]};
 const sum=k=>H.reduce((a,x)=>a+(x[k]||0),0);
 const best=k=>H.reduce((b,x)=>(x[k]||0)>(b?.[k]||0)?x:b,null);
 const records=[];
 const g=best('goals'),a=best('assists'),m=best('matches');
 if(g?.goals)records.push({label:'Más goles en una temporada',value:g.goals,detail:`${g.year} · ${g.club}`});
 if(a?.assists)records.push({label:'Más asistencias en una temporada',value:a.assists,detail:`${a.year} · ${a.club}`});
 if(m?.matches)records.push({label:'Más partidos en una temporada',value:m.matches,detail:`${m.year} · ${m.club}`});
 const top=best('rating');
 if(top)records.push({label:'Mejor nota media',value:top.rating.toFixed(2),detail:`${top.year} · ${top.club}`});
 const peak=best('ovrAfter');if(peak)records.push({label:'Media máxima',value:peak.ovrAfter,detail:`${peak.year} · ${peak.age+1} años`});
 const byClubMap={};for(const x of H){const c=byClubMap[x.clubId]||(byClubMap[x.clubId]={clubId:x.clubId,club:x.club,seasons:0,matches:0,goals:0,assists:0,titles:0});c.seasons++;c.matches+=x.matches||0;c.goals+=x.goals||0;c.assists+=x.assists||0;c.titles+=(x.titles||[]).length;}
 const byClub=Object.values(byClubMap).sort((a,b)=>b.matches-a.matches);
 const loyal=byClub[0];if(loyal&&loyal.seasons>=3)records.push({label:'Club de tu vida',value:`${loyal.seasons} temp.`,detail:`${loyal.club} · ${loyal.matches} PJ · ${loyal.goals} G`});
 const firstGoalSeason=H.find(x=>x.goals>0);
 const milestones=[];
 const marks=[[sum('matches'),[50,100,200,300,400,500,600],'partidos oficiales de liga'],[sum('goals'),[10,25,50,100,150,200,250,300,400],'goles de liga'],[sum('assists'),[10,25,50,100,150],'asistencias de liga']];
 for(const [value,steps,label] of marks)for(const step of steps)if(value>=step)milestones.push({label:`${step} ${label}`,done:true});
 if(firstGoalSeason)milestones.push({label:`Primer gol profesional · ${firstGoalSeason.year}`,done:true});
 const caps=sum('nationalCaps');if(caps)milestones.push({label:`${caps} partidos con la selección`,done:true});
 const awards=(s.awards||[]);for(const aw of awards.slice(-12))milestones.push({label:`${aw.name} · ${aw.year}`,done:true,award:true});
 return {records,milestones:milestones.slice(-24),byClub,caps};
}
