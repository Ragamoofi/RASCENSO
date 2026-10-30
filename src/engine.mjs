import { COUNTRIES } from './countries.mjs';
import { initialRelationships, chooseScene, sceneFor, resultOfScene } from './story.mjs';

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
const LEGENDS = [
 ['Ronaldo Nazário',[92,98,76,95,27,87,5,4]],['Zinedine Zidane',[75,84,98,96,67,79,5,5]],
 ['Lionel Messi',[89,96,94,99,35,67,5,4]],['Cristiano Ronaldo',[94,98,78,92,40,95,5,4]],
 ['Pelé',[95,97,88,95,45,88,5,5]],['Marta',[91,92,88,96,37,76,5,4]],
 ['Andrés Iniesta',[77,77,97,95,68,70,4,4]],['Xavi Hernández',[68,73,99,94,70,67,4,4]],
 ['Ronaldinho',[91,91,91,99,30,80,5,4]],['Paolo Maldini',[81,51,80,74,99,90,3,4]],
 ['Sergio Ramos',[77,78,71,70,96,95,3,3]],['Kaká',[91,90,88,93,42,78,4,4]],
 ['Luka Modrić',[77,76,97,93,79,73,4,4]],['Thierry Henry',[96,96,83,92,45,84,4,4]],
 ['Roberto Carlos',[94,88,84,85,92,91,4,4]],['Manuel Neuer',[68,29,83,69,96,89,2,4]],
 ['Mia Hamm',[91,91,88,91,54,79,4,4]],['Iker Casillas',[64,20,71,51,98,82,2,3]],
].map(([name,values])=>({name,values}));

const clamp=(v,min,max)=>Math.min(max,Math.max(min,v));
function hash(x){ let h=2166136261;for(const c of String(x)){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0; }
function rng(seed){let a=hash(seed);return ()=>{a=(a+0x6D2B79F5)|0;let t=Math.imul(a^(a>>>15),1|a);t^=t+Math.imul(t^(t>>>7),61|t);return ((t^(t>>>14))>>>0)/4294967296;};}
function choose(arr,r){return arr[Math.floor(r()*arr.length)];}
export function getCountry(code){return COUNTRIES.find(c=>c.code===code);}
export function getClub(id){for(const c of COUNTRIES){const club=c.clubs.find(x=>x.id===id);if(club)return {...club,country:c.name,countryCode:c.code,league:c.league,region:c.confederation};}return null;}
function validSelection(value,options,defaultId){return options.some(x=>x.id===value)?value:defaultId;}
export function newCareer({name,number=9,foot='Derecha',country='CL',position='DC',mode='Clásico',age=16,city='',origin='barrio',personality='disciplinado',style='equilibrado',dream='seleccion',story='',fanClubId='',seed=Date.now()}){
  const safeName=String(name||'').trim().slice(0,44);
  if(!getCountry(country)||!POSITIONS.some(p=>p[0]===position)||!safeName)throw Error('Revisa el nombre, la nacionalidad y la posición.');
  const firstAge=clamp(Math.round(Number(age)||16),16,19);
  const originId=validSelection(origin,ORIGINS,'barrio');
  const personalityId=validSelection(personality,PERSONALITIES,'disciplinado');
  const relationships=initialRelationships(country);
  if(originId==='cantera')relationships.coach.trust=60;
  return {version:3,seed:String(seed),phase:'draft',name:safeName,number:clamp(Number(number)||9,1,99),foot:foot==='Izquierda'?'Izquierda':'Derecha', country,position,mode:mode==='Purista'?'Purista':'Clásico',
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
  if(![1,2,3].includes(s.version))return null;
  const v1=s.version===1?{...s,startAge:16,startYear:START_YEAR,city:'',origin:'barrio',personality:'disciplinado',style:'equilibrado',dream:'seleccion',story:'',coachTrust:50}:s;
  const rel=v1.relationships||initialRelationships(v1.country);
  const safeRel={...rel,coach:{...rel.coach,trust:v1.coachTrust??rel.coach?.trust??50}};
  const migrated={...v1,version:3,fanClubId:getClub(v1.fanClubId)?v1.fanClubId:null,
    storyFlags:v1.storyFlags||{playedForFan:!!(v1.fanClubId&&v1.history?.some(h=>h.clubId===v1.fanClubId))},
    storyLog:Array.isArray(v1.storyLog)?v1.storyLog:[],relationships:safeRel,
    sceneBeat:v1.sceneBeat||0,sceneChoice:v1.sceneChoice??null,scenePlayerText:v1.scenePlayerText||''};
  return migrated;
}
export function careerYear(s){return (s.startYear??START_YEAR)+(s.age-(s.startAge??16));}
export function currentDraft(s){
  if(s.phase!=='draft')return null;
  const r=rng(`${s.seed}:draft:${s.draftIndex}:${s.draftRerolls}`);
  const legend=choose(LEGENDS,r);
  const unfilled=ATTRS.filter(([key])=>!(key in s.attributes));
  const attrs=unfilled.map(([key])=>({key,label:ATTRS.find(a=>a[0]===key)[1],value:legend.values[ATTRS.findIndex(a=>a[0]===key)]}));
  const recommendation=attrs.sort((a,b)=>b.value/((a.key==='weak'||a.key==='skills')?5:100)-a.value/((b.key==='weak'||b.key==='skills')?5:100))[0];
  return {legend:legend.name,...recommendation,hidden:s.mode==='Purista'};
}
export function rerollDraft(s){if(s.phase!=='draft'||s.draftRerolls>=5)return s;return {...s,draftRerolls:s.draftRerolls+1};}
const WEIGHTS={DC:[.13,.38,.10,.24,.02,.13],EI:[.29,.20,.15,.27,.02,.07],ED:[.29,.20,.15,.27,.02,.07],
  MCO:[.13,.18,.32,.25,.03,.09],MC:[.13,.12,.30,.22,.13,.10],MI:[.25,.12,.24,.23,.06,.10],MD:[.25,.12,.24,.23,.06,.10],
  MCD:[.09,.04,.24,.12,.30,.21],DFC:[.08,.03,.12,.07,.42,.28],LI:[.20,.04,.18,.17,.27,.14],LD:[.20,.04,.18,.17,.27,.14],POR:[.06,.01,.11,.03,.47,.32]};
export function acceptDraft(s){
  if(s.phase!=='draft')return s;
  const d=currentDraft(s),attributes={...s.attributes,[d.key]:d.value};
  const draftSources=[...s.draftSources,{legend:d.legend,attribute:d.key,value:d.value}];
  if(s.draftIndex<7)return {...s,draftIndex:s.draftIndex+1,attributes,draftSources};
  const vals=['pace','shot','pass','dribble','defense','physical'];
  const weighted=vals.reduce((sum,k,i)=>sum+(attributes[k]??50)*WEIGHTS[s.position][i],0);
  const bonus=((attributes.skills||2)+(attributes.weak||2)-4)*.5;
  const ovr=clamp(Math.round(weighted*.56+14+bonus),48,72);
  const potential=clamp(ovr+14+Math.floor(rng(`${s.seed}:potential`)()*17),ovr+6,96);
  return {...s,phase:'academy',draftIndex:8,attributes,draftSources,ovr,potential};
}
export function academyOffers(s){
  const c=getCountry(s.country); if(!c)return [];
  const available=[...c.clubs];const r=rng(`${s.seed}:academy`);
  const count=Math.min(3,available.length);const chosen=[];while(chosen.length<count){const at=Math.floor(r()*available.length);chosen.push(available.splice(at,1)[0]);}
  return chosen.map(club=>getClub(club.id));
}
export function signAcademy(s,id){if(s.phase!=='academy'||!academyOffers(s).some(x=>x.id===id))return s;return {...s,phase:'event',clubId:id,pendingEvent:id===s.fanClubId?'fan_home':'arrival',sceneBeat:0,decisions:[...s.decisions,{age:s.age,text:`Primer contrato: ${getClub(id).name}`} ]};}
function positionGroup(p){if(p==='POR')return 'goalkeeper';if(['DC','EI','ED'].includes(p))return 'attack';if(['MCO','MC','MI','MD'].includes(p))return 'create';return 'defense';}
export function advanceSeason(s){
  if(s.phase!=='season'||s.age>=40)return s;
  const club=getClub(s.clubId);if(!club)return s;
  const r=rng(`${s.seed}:season:${s.age}:${club.id}`),diff=s.ovr-club.level;
  const role=diff>=-3?'Titular':diff>=-12?'Rotación':diff>=-22?'Suplente':'Reserva';
  const expected=role==='Titular'?33:role==='Rotación'?24:role==='Suplente'?13:4;
  const injury=r()<.11?Math.round(2+r()*10):0;
  const matches=clamp(Math.round(expected+(r()-.5)*12-injury),0,42);
  const trust=(s.coachTrust??50);
  const factor=clamp((s.ovr+10-club.level)/30+.80+(trust-50)/500,.35,1.65);
  const group=positionGroup(s.position);
  const goals= group==='goalkeeper'?0:Math.max(0,Math.round(matches*factor*(group==='attack'?.40:group==='create'?.14:.035)*(s.style==='goleador'?1.10:1)*(0.65+r()*.75)));
  const assists=group==='goalkeeper'?0:Math.max(0,Math.round(matches*factor*(group==='attack'?.16:group==='create'?.29:.06)*(s.style==='creador'?1.10:1)*(0.65+r()*.75)));
  const cleanSheets=group==='goalkeeper'?Math.round(matches*(.20+r()*.23)):0;
  const goalsConceded=group==='goalkeeper'?Math.round(matches*(.8+r()*.7)):0;
  const peak=s.age>=22&&s.age<=29?2:s.age<=21?4:s.age<=32?0:-2;
  const originGrowth=s.origin==='amateur'&&matches>=20?1:0;
  const personalityGrowth=s.personality==='disciplinado'&&matches>10?0.35:0;
  const growth=clamp(Math.round(peak+(matches>26?1:matches<8?-2:0)+(r()-.5)*4+(s.morale-70)/35+originGrowth+personalityGrowth),-5,5);
  const ovr=clamp(s.ovr+Math.min(growth,s.potential-s.ovr),40,99);
  const strength=clamp(club.level+(ovr-club.level)*.32+(r()-.5)*24,35,99);
  const leaguePosition=clamp(Math.round(20-(strength-40)/3.6+(r()-.5)*8),1,20);
  const titles=[];
  if(leaguePosition===1)titles.push(`Liga de ${club.country}`);
  if(strength>74&&r()>.78)titles.push(`Copa nacional de ${club.country}`);
  if(strength>84&&r()>.89)titles.push(`Copa continental (${club.region})`);
  const international=s.ovr>=76&&matches>=18?(2+Math.floor(r()*8)):0;
  const worldCup=international>0&&(s.age-18)%4===0&&s.age>=18;
  const worldCupResult=worldCup?choose(['Fase de grupos','Octavos de final','Cuartos de final','Semifinal','Final'],r):null;
  const seasonal={age:s.age,year:careerYear(s),clubId:club.id,club:club.name,country:club.country,ovrBefore:s.ovr,ovrAfter:ovr,role,matches,goals,assists,cleanSheets,goalsConceded,international,
    injuryWeeks:injury,leaguePosition,titles,worldCupResult};
  const eventId=chooseScene(s,r);
  const coachTrust=clamp((s.coachTrust??50)+(matches>20?2:-2),0,100);
  const relationships={...s.relationships,coach:{...s.relationships.coach,trust:coachTrust}};
  const flags={...(s.storyFlags||{})};
  if(s.fanClubId&&s.clubId===s.fanClubId)flags.playedForFan=true;
  return {...s,age:s.age+1,ovr,coachTrust,relationships,history:[...s.history,seasonal],trophies:[...s.trophies,...titles],lastSeason:seasonal,pendingEvent:eventId,storyFlags:flags,sceneBeat:0,sceneChoice:null,scenePlayerText:'',phase:s.age===39?'retired':'event'};
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
  const next={...s,phase:'season',pendingEvent:null,sceneBeat:0,sceneChoice:null,scenePlayerText:'',storyFlags:flags};
  const offers=transferOffers(next);
  return offers.length?{...next,offers,phase:'transfer'}:{...next,offers:[]};
}
export function autoResolveEvent(s){if(s.phase!=='event')return s;const first=(s.sceneBeat||0)===0?resolveEvent(s,0):s;return finishEvent(first);}
export function transferOffers(s){
  if(s.history.length<2)return [];
  const r=rng(`${s.seed}:transfers:${s.age}:${s.clubId}`);
  if(r()<(s.personality==='ambicioso'?.12:.20))return [];
  const all=COUNTRIES.flatMap(c=>c.clubs).filter(c=>c.id!==s.clubId);
  const valid=all.filter(c=>c.level>=s.ovr-20&&c.level<=s.ovr+15);
  const local=valid.filter(c=>getClub(c.id).countryCode===s.country);
  const pool=s.history.length<4&&local.length?local:valid;
  const picks=[];
  while(pool.length&&picks.length<3){const idx=Math.floor(r()*pool.length);picks.push(getClub(pool.splice(idx,1)[0].id));}
  return picks;
}
export function chooseTransfer(s,id=null){
  if(s.phase!=='transfer')return s;
  const offer=s.offers.find(o=>o.id===id);
  if(id&& !offer)return s;
  const nextClubId=offer?.id||s.clubId;
  const joinedFan=!!(offer&&s.fanClubId===nextClubId&&s.clubId!==nextClubId);
  const leftFan=!!(offer&&s.fanClubId===s.clubId&&s.clubId!==nextClubId);
  const rel={...s.relationships,coach:{...s.relationships.coach,trust:offer?47:clamp(s.relationships.coach.trust+3,0,100)}};
  return {...s,phase:joinedFan||leftFan?'event':'season',pendingEvent:joinedFan?'fan_home':leftFan?'fan_departure':null,
    sceneBeat:0,clubId:nextClubId,relationships:rel,coachTrust:rel.coach.trust,offers:[],
    decisions:[...s.decisions,{age:s.age,text:offer?`Fichaste por ${offer.name} (${offer.country})`:`Continuaste en ${getClub(s.clubId).name}`}]};
}
export function simulateToRetirement(state){
  let s=state;
  for(let k=0;k<100&&s.phase!=='retired';k++){
    if(s.phase==='season')s=advanceSeason(s);
    else if(s.phase==='event')s=autoResolveEvent(s);
    else if(s.phase==='transfer'){
      const current=getClub(s.clubId);
      const best=[...s.offers].sort((a,b)=>b.level-a.level).find(c=>c.level>current.level+3&&c.level<=s.ovr+7);
      s=chooseTransfer(s,best?.id||null);
    }
    else break;
  }
  return s;
}
export function totals(s){return s.history.reduce((a,x)=>({matches:a.matches+x.matches,goals:a.goals+x.goals,assists:a.assists+x.assists,international:a.international+x.international,cleanSheets:a.cleanSheets+x.cleanSheets}),{matches:0,goals:0,assists:0,international:0,cleanSheets:0});}
