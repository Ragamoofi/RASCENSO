import { classesFor, classFor, normalizeProfile, classAdjustedAttributes, profileMatchEffects } from './archetypes17.mjs';
import { COUNTRIES } from './countries.mjs';
import { simulateGlobalSeason } from './competitions13.mjs';
import { upcomingMoment, solveMoment } from './moments15.mjs';
import { identityTraits, identitySeasonEffects, preparationEffects, PREPARATIONS, archetypeFor } from './career08.mjs';
import { DRAFT_REFERENTS, DRAFT_TIERS, draftPotentialAdjustment } from './draft09.mjs';
import { chooseSeasonAgenda, seasonAgendaEffects } from './agenda09.mjs';
export { chooseSeasonAgenda } from './agenda09.mjs';

import { initialRelationships, chooseScene, sceneFor, resultOfScene } from './story.mjs';
import { playLeague, leagueParticipants, getCompetitionForCareer, nextLeagueRosters } from './league.mjs';
import { VERIFIED_LEAGUES, getInauguralLeague } from './leagues2026.mjs';
import { annualSalary, marketClub, clubPrestige, playerDemand, buildTransferOffers, evaluateClubFuture } from './market.mjs';
import { clamp, rng, yearOf, adjustOvr, ovrFromAttributes, juniorValue, juniorCeiling, finalizeDraft, migrateAttributes, developSeason, seasonRating, seasonObjectives, evaluateObjectives, squadRole, freshSquad, threadEffects, coachSeasonEffects, preparationFocus, addThread, resolveThread, hasThread, activeThreads, KEY_ATTRS, POSITION_WEIGHTS } from './career20.mjs';
import { ensureWorld, advanceWorld, pushNews, coachFor, namerFor, worldClub, dynamicPrestige, dynamicLevel, worldRival } from './world20.mjs';
import { pickWorldScene } from './story20.mjs';
import { choiceFx, dnaFromPicks, startAttrDelta, creatorCeilings, tagOf, dnaFx, DNA_TAGS, referentRadar, dreamProgress, DREAM_REWARD, marketRarity } from './identity30.mjs';
export { choiceFx, dreamProgress, DNA_TAGS };
import { buildSeasonPlays, sanitizeReport, autoReport, playOutcomeText, PLAYS, POSITION_PLAYS } from './plays30.mjs';
export { PLAYS, POSITION_PLAYS };
export const SAVE_VERSION=9;

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
  {id:'sereno',name:'Sangre fría',description:'Te mantienes tranquilo en finales y partidos decisivos.'},
  {id:'rebelde',name:'Rebelde',description:'Cuestionas decisiones injustas; puedes chocar con el técnico.'},
  {id:'lider',name:'Líder silencioso',description:'Organizas al equipo sin buscar las cámaras.'},
  {id:'obsesivo',name:'Obsesivo con mejorar',description:'Entrenas más, pero debes cuidar el descanso.'},
  {id:'solidario',name:'Compañero solidario',description:'Ayudas al grupo y priorizas las asistencias.'},
  {id:'competitivo',name:'Amante de los clásicos',description:'Crecen tus ganas de destacar en los partidos de máxima rivalidad.'},
];
export const STYLES = [
  {id:'equilibrado',name:'Completo',description:'Te adaptas a distintas situaciones del partido.'},
  {id:'goleador',name:'Finalizador',description:'Buscas el arco y aprovechas los espacios.'},
  {id:'creador',name:'Creador',description:'Prefieres encontrar el pase que otros no ven.'},
  {id:'intenso',name:'Incansable',description:'Compites fuerte y mantienes la presión durante todo el encuentro.'},
  {id:'vertical',name:'Vertical',description:'Buscas romper líneas y acelerar la transición.'},
  {id:'asociativo',name:'Asociativo',description:'Te mueves para dar apoyos y combinar.'},
  {id:'aereo',name:'Especialista aéreo',description:'Buscas el cabezazo en cada pelota parada.'},
  {id:'defensor',name:'Seguro primero',description:'Prefieres el corte limpio y proteger tu espalda.'},
  {id:'regateador',name:'Uno contra uno',description:'Provocas duelos individuales sin miedo al error.'},
];
export const DREAMS = [
  {id:'seleccion',name:'Representar a mi país',description:'Tu gran sueño es vestir la camiseta de tu selección.'},
  {id:'europa',name:'Jugar en la élite mundial',description:'Sueñas con llegar a los clubes más exigentes.'},
  {id:'idolo',name:'Ser ídolo de un club',description:'Quieres dejar una huella imposible de olvidar.'},
  {id:'titulos',name:'Ganar todos los títulos',description:'Tu objetivo es llenar tu carrera de trofeos.'},
  {id:'cantera',name:'Ser referente de mi cantera',description:'Ayudar a nuevas generaciones a encontrar su lugar.'},
  {id:'regresar',name:'Volver a mis raíces',description:'Regresar a casa para cerrar mi carrera jugando.'},
  {id:'capitan',name:'Llevar la jineta',description:'Convertirme en líder dentro y fuera de la cancha.'},
  {id:'goleador',name:'Romper récords goleadores',description:'Ser recordado por los goles importantes.'},
  {id:'resistencia',name:'Una carrera longeva',description:'Seguir compitiendo incluso después de los años de élite.'},
];

export const POSITIONS = [
  ['POR','Arquero'],['DFC','Defensa central'],['LI','Lateral izquierdo'],['LD','Lateral derecho'],
  ['MCD','Pivote defensivo'],['MC','Mediocampista'],['MI','Volante izquierdo'],['MD','Volante derecho'],
  ['MCO','Mediapunta'],['EI','Extremo izquierdo'],['ED','Extremo derecho'],['DC','Delantero centro']
];
export const ATTRS = [['pace','Ritmo'],['shot','Tiro'],['pass','Pase'],['dribble','Regate'],['defense','Defensa'],['physical','Físico'],['skills','Filigranas'],['weak','Pierna mala']];

function choose(arr,r){return arr[Math.floor(r()*arr.length)];}
export function getCountry(code){return COUNTRIES.find(c=>c.code===code);}
export function getClub(id){for(const c of COUNTRIES){const club=c.clubs.find(x=>x.id===id);if(club){const league=getInauguralLeague(club.id);return {...club,country:c.name,countryCode:c.code,league:league?.name||c.league,division:league?.tier??null,competitionId:league?.id??null,region:c.confederation};}}return null;}
function validSelection(value,options,defaultId){return options.some(x=>x.id===value)?value:defaultId;}
export function newCareer({name,number=9,foot='Derecha',country='CL',position='DC',mode='Clásico',age=16,city='',origin='barrio',personality='disciplinado',style='equilibrado',dream='seleccion',story='',fanClubId='',environment='sin_contactos',publicImage='reservado',riskProfile='calculador',developmentPath='tecnica',roleClass='',strength='tecnica',weakness='inconstante',seed=Date.now()}){
  const safeName=String(name||'').trim().slice(0,44);
  if(!getCountry(country)||!POSITIONS.some(p=>p[0]===position)||!safeName)throw Error('Revisa el nombre, la nacionalidad y la posición.');
  const firstAge=clamp(Math.round(Number(age)||16),16,19);
  const originId=validSelection(origin,ORIGINS,'barrio');
  const personalityId=validSelection(personality,PERSONALITIES,'disciplinado');
  const relationships=initialRelationships(country);
  // Todas las elecciones del creador fijan el punto de partida a través de choiceFx (origen, entorno…).
  const start=choiceFx({origin:originId,environment,developmentPath,personality:personalityId,style,strength,weakness,dream,foot:foot==='Izquierda'?'Izquierda':'Derecha',position});
  const startTrust=clamp(50+start.startTrust,0,100);
  relationships.coach.trust=startTrust;relationships.family.trust=clamp((relationships.family.trust||75)+start.startFamily,0,100);
  return {version:SAVE_VERSION,attrModel:2,attrCeil:{},world:null,squad:null,threads:[],awards:[],...normalizeProfile({position,roleClass,strength,weakness}),clutchMoment:null,...identityTraits({environment,publicImage,riskProfile,developmentPath}),preparation:null,careerMoments:[],annualScenes:0,market:null,agent:{searches:0,year:null,focus:'balanced'},careerEarnings:0,developmentProfile:developmentPath==='tardio'?'tardio':['temprano','normal','normal','normal','tardio'][Math.floor(rng(String(seed)+':dev')()*5)],injuryProfile:rng(String(seed)+':injury')()<.18?'fragil':'resistente',seasonPlan:'equilibrio',contract:null,seed:String(seed),phase:'draft',name:safeName,number:clamp(Number(number)||9,1,99),foot:foot==='Izquierda'?'Izquierda':'Derecha', country,position,mode:mode==='Purista'?'Purista':'Clásico',
    age:firstAge,startAge:firstAge,startYear:START_YEAR,city:String(city||'').trim().slice(0,40),origin:originId,personality:personalityId,
    style:validSelection(style,STYLES,'equilibrado'),dream:validSelection(dream,DREAMS,'seleccion'),story:String(story||'').trim().slice(0,180),
    fanClubId:getClub(fanClubId)?fanClubId:null,storyFlags:{playedForFan:false},storyLog:[],relationships,sceneBeat:0,sceneChoice:null,scenePlayerText:'',
    draftIndex:0,draftRerolls:0,attributes:{},draftSources:[],clubId:null,ovr:null,potential:null,
    form:70,morale:clamp(70+start.startMorale,0,100),reputation:clamp(start.startRep,0,100),
    coachTrust:startTrust,dna:null,dreamDone:null,
    history:[],decisions:[],trophies:[],offers:[],pendingEvent:null,lastSeason:null};
}
export function migrateCareer(s){
  if(!s||typeof s!=='object'||!['draft','academy','season','event','transfer','retired'].includes(s.phase)||!getCountry(s.country))return null;
  if(![1,2,3,4,5,6,7,8,9].includes(s.version))return null;
  const v1=s.version===1?{...s,startAge:16,startYear:START_YEAR,city:'',origin:'barrio',personality:'disciplinado',style:'equilibrado',dream:'seleccion',story:'',coachTrust:50}:s;
  const rel=v1.relationships||initialRelationships(v1.country);
  const safeRel={...rel,coach:{...rel.coach,trust:v1.coachTrust??rel.coach?.trust??50}};
  const backfilledTrophies=(v1.history||[]).flatMap(x=>(x.titles||[]).map(title=>({title,year:x.year??null,clubId:x.clubId??null,leagueId:x.leagueId||'',kind:'league'})));
  if(backfilledTrophies.length<(v1.trophies||[]).length){for(const title of (v1.trophies||[]).slice(backfilledTrophies.length))backfilledTrophies.push({title:String(title),year:null,clubId:null,kind:'league'});}
  const migrated={...v1,...normalizeProfile(v1),version:SAVE_VERSION,threads:Array.isArray(v1.threads)?v1.threads:[],awards:Array.isArray(v1.awards)?v1.awards:[],world:v1.world&&v1.world.v?v1.world:null,squad:v1.squad||null,clutchMoment:v1.clutchMoment||null,trophyRecords:Array.isArray(v1.trophyRecords)?v1.trophyRecords:backfilledTrophies,...identityTraits(v1),preparation:v1.preparation||null,careerMoments:Array.isArray(v1.careerMoments)?v1.careerMoments:[],annualScenes:v1.annualScenes||0,market:v1.market||null,agent:v1.agent||{searches:0,year:null,focus:'balanced'},careerEarnings:v1.careerEarnings??(v1.history||[]).reduce((n,x)=>n+(x.salaryEarned||0),0),developmentProfile:v1.developmentProfile||'normal',injuryProfile:v1.injuryProfile||'resistente',seasonPlan:v1.seasonPlan||'equilibrio',contract:v1.contract||null,fanClubId:getClub(v1.fanClubId)?v1.fanClubId:null,
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
  // 2.0: atributos coherentes con la media y techos por atributo (solo partidas con draft completo).
  if(migrated.phase!=='draft')Object.assign(migrated,migrateAttributes(migrated));
  else if(!migrated.attrCeil)migrated.attrCeil={};
  // 2.0: el mundo vivo y el vestuario se crean al cargar, no recién al simular.
  if(['season','event','transfer'].includes(migrated.phase)&&migrated.clubId&&getClub(migrated.clubId))return syncClub(migrated);
  return migrated;
}
export const careerYear=yearOf;
// Tres propuestas por ronda: leyendas, atributos y caminos de desarrollo diferentes.
export function draftChoices(s) {
  if (s.phase !== 'draft') return [];
  const r=rng(`${s.seed}:draft-v4:${s.draftIndex}:${s.draftRerolls}`);
  const unfilled=ATTRS.filter(([key])=>!(key in s.attributes));
  const order=[...unfilled];for(let i=order.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[order[i],order[j]]=[order[j],order[i]];}
  if(unfilled.some(([k])=>k===s.draftFocus)){const selected=unfilled.find(([k])=>k===s.draftFocus);order.splice(0,order.length,selected);}
  const source=[];
  const used=new Set((s.draftSources||[]).map(x=>x.legend));
  const important = ['pace','shot','pass','dribble','defense','physical'];
  // Una opción por nivel: la mejor cifra no siempre ofrece el mayor potencial.
  const tiers=['icono','figura','profesional'];
  const slots=tiers.map(t=>DRAFT_REFERENTS.filter(x=>x.tier===t&&!used.has(x.name)));
  for(let i=0;i<3;i++){
    const [key,label]=order[i%order.length];
    let pool=slots[i].length?slots[i]:DRAFT_REFERENTS.filter(x=>x.tier===tiers[i]);
    if(s.position==='POR'&&['defense','physical','pace','pass'].includes(key)){const keepers=pool.filter(p=>tagOf(p.name)==='guardian');if(keepers.length)pool=keepers;}
    // El referente se elige con sentido: pesa su valor en la faceta ofrecida y se evita repetir familia de juego en la misma ronda.
    const ai=ATTRS.findIndex(a=>a[0]===key),seen=new Set(source.map(x=>x.tag));
    const w=pool.map(p=>Math.exp((p.values[ai]-58)/26)*(seen.has(tagOf(p.name))?.3:1));
    const total=w.reduce((a,b)=>a+b,0);let roll=r()*total;let pi=w.findIndex(x=>(roll-=x)<=0);if(pi<0)pi=pool.length-1;
    const player=pool[pi];
    used.add(player.name);
    const value=player.values[ai];
    const weight=important.includes(key)?WEIGHTS[s.position][important.indexOf(key)]:.08;
    const fit=weight>=.26?'CLAVE PARA TU PUESTO':weight>=.16?'COMPLEMENTO FUERTE':'PERFIL ALTERNATIVO';
    source.push({legend:player.name,key,label,value,junior:juniorValue(value,key,player.tier),ceiling:juniorCeiling(value,key,player.tier),fit,tier:player.tier,development:player.ceiling,
      tierLabel:DRAFT_TIERS[player.tier].label,tierDetail:DRAFT_TIERS[player.tier].detail,
      hidden:s.mode==='Purista',archetype:archetypeFor({...s,attributes:{...s.attributes,[key]:value}}).name,tag:tagOf(player.name),radar:referentRadar(player.name),signature:player.values.slice(0,6)});
  }
  return source;
}
export function chooseDraftFocus(s,key){return s.phase==='draft'&&(key===''||ATTRS.some(([k])=>k===key&&!(k in s.attributes)))?{...s,draftFocus:key}:s;}
export function currentDraft(s){return draftChoices(s)[0]||null;}
export function rerollDraft(s){if(s.phase!=='draft'||s.draftRerolls>=3)return s;return {...s,draftRerolls:s.draftRerolls+1};}
const WEIGHTS={DC:[.13,.38,.10,.24,.02,.13],EI:[.29,.20,.15,.27,.02,.07],ED:[.29,.20,.15,.27,.02,.07],
  MCO:[.13,.18,.32,.25,.03,.09],MC:[.13,.12,.30,.22,.13,.10],MI:[.25,.12,.24,.23,.06,.10],MD:[.25,.12,.24,.23,.06,.10],
  MCD:[.09,.04,.24,.12,.30,.21],DFC:[.08,.03,.12,.07,.42,.28],LI:[.20,.04,.18,.17,.27,.14],LD:[.20,.04,.18,.17,.27,.14],POR:[.06,.01,.11,.03,.47,.32]};
export function acceptDraft(s, index=0){
  if(s.phase!=='draft')return s;
  const choices=draftChoices(s);
  const d=choices[Number.isInteger(index)&&index>=0&&index<choices.length?index:0];
  // El legado es un referente: el juvenil hereda una faceta y un techo, nunca la cifra de la leyenda.
  const starterValue=juniorValue(d.value,d.key,d.tier);
  const attributes={...s.attributes,[d.key]:starterValue};
  const attrCeil={...(s.attrCeil||{}),[d.key]:juniorCeiling(d.value,d.key,d.tier)};
  const draftSources=[...s.draftSources,{legend:d.legend,attribute:d.key,value:d.value,startingValue:starterValue,ceiling:attrCeil[d.key],tier:d.tier}];
  if(s.draftIndex<7)return {...s,draftIndex:s.draftIndex+1,draftFocus:'',attributes,attrCeil,draftSources};
  const dna=dnaFromPicks(draftSources,s.position);
  const withDna={...s,dna};
  const finalAttributes=classAdjustedAttributes(s,attributes);
  // Edad de inicio y elecciones del creador (origen, estilo…) ajustan los valores de partida.
  const delta=startAttrDelta(withDna);
  for(const k of KEY_ATTRS)finalAttributes[k]=clamp(finalAttributes[k]+(delta[k]||0),30,95);
  for(const k of KEY_ATTRS)attrCeil[k]=Math.max(attrCeil[k]??finalAttributes[k]+8,finalAttributes[k]+4);
  const done=finalizeDraft({...s,attrCeil,draftSources},finalAttributes);
  const bonus=Math.min(3,draftPotentialAdjustment(draftSources)/3);
  // Techos: tier de los legados + ADN heredado + origen/entorno/fortaleza/debilidad/sueño.
  const extra=creatorCeilings(withDna);
  for(const k of KEY_ATTRS)done.attrCeil[k]=clamp(Math.round(done.attrCeil[k]+bonus+(extra[k]||0)),finalAttributes[k]+2,99);
  for(const k of ['skills','weak'])if(Number.isFinite(done.attrCeil[k]))done.attrCeil[k]=clamp(done.attrCeil[k]+(extra[k]||0),Math.max(1,finalAttributes[k]||1),5);
  const potential=Math.max(done.ovr+3,ovrFromAttributes(s.position,done.attrCeil));
  const completed={...s,...done,potential,phase:'academy',draftFocus:'',draftIndex:8,attributes:finalAttributes,draftSources,dna,footballDNA:archetypeFor({...s,attributes:finalAttributes,draftSources})};
  return {...completed,initialOfferIds:academyOffers(completed).map(c=>c.id)};
}
// Primer contrato: dos rutas locales y una tercera que puede abrir el mercado regional.
export function academyOffers(s){
  if(Array.isArray(s.initialOfferIds)&&s.initialOfferIds.length===3)return s.initialOfferIds.map(getClub).filter(Boolean);
  const r=rng(String(s.seed)+':academy-v3');
  const all=COUNTRIES.flatMap(country=>country.clubs.filter(c=>!c.inactive&&!/\s(?:B|II|Reservas)$/i.test(c.name)).map(c=>getClub(c.id))).filter(Boolean);
  const home=all.filter(c=>c.countryCode===s.country);
  const conf=getCountry(s.country)?.confederation;
  const elite=c=>clubPrestige(c)>=76;
  const reachable=c=>!elite(c)&&c.level<=Math.max(70,(s.ovr||55)+10);
  const local=home.filter(reachable);
  const chosen=[];
  const take=pool=>{
    const candidates=pool.filter(c=>!chosen.some(x=>x.id===c.id));
    if(!candidates.length)return;
    const weights=candidates.map(c=>{
      const tier=getInauguralLeague(c.id)?.tier||1;
      const gap=Math.max(0,c.level-(s.ovr||55));
      return (tier>=2?3:1)*Math.exp(-gap/14);
    });
    let roll=r()*weights.reduce((a,b)=>a+b,0);
    const index=weights.findIndex(w=>(roll-=w)<=0);
    chosen.push(candidates[index<0?candidates.length-1:index]);
  };
  const locals=local.length>=2?local:home.filter(c=>!elite(c));
  take(locals.length?locals:home);take(locals.length>=2?locals:home);
  // Probabilidades de diseño, no una reproducción de reglamentos de transferencias.
  let abroad=s.age<18?.07:.25;
  if(s.riskProfile==='aventurero')abroad+=.25;
  if(['hogareno','leal','paciente'].includes(s.riskProfile))abroad*=.25;
  if(s.environment==='migrante')abroad+=.12;
  const regional=all.filter(c=>c.countryCode!==s.country&&getCountry(c.countryCode)?.confederation===conf&&reachable(c));
  const foreign=all.filter(c=>c.countryCode!==s.country&&reachable(c));
  if(r()<abroad)take(regional.length&&r()<.9?regional:foreign);
  if(chosen.length<3)take(locals);
  if(chosen.length<3)take(home.filter(c=>!elite(c)));
  if(chosen.length<3)take(home);
  while(chosen.length<3){const before=chosen.length;take(regional);if(chosen.length===before)take(foreign);if(chosen.length===before)break;}
  return chosen;
}
export function academyOfferReason(s,c){
 const local=c.countryCode===s.country,regional=getCountry(c.countryCode)?.confederation===getCountry(s.country)?.confederation;
 return local?'Seguimiento nacional · adaptación cercana a casa':regional?'Red regional de ojeadores · primera experiencia fuera':'Oportunidad internacional · mayor esfuerzo de adaptación';
}
export function academyContractOffer(s,clubOrId){
  const club=getClub(typeof clubOrId==='string'?clubOrId:clubOrId?.id);
  if(!club)return null;
  const r=rng(String(s.seed)+':first-contract:'+club.id);
  const years=2+Math.floor(r()*3);
  const prestige=clubPrestige(club);
  const role=prestige>=76?'Reserva':(s.ovr||60)>=67&&prestige<67?'Titular':'Rotación';
  return {clubId:club.id,role,years,ends:careerYear(s)+years,salary:annualSalary(club,s.ovr||60,role,'first-contract'),currency:'EUR',estimated:true};
}
export function signAcademy(s,id){
  const offer=academyOffers(s).find(c=>c.id===id);
  if(s.phase!=='academy'||!offer)return s;
  const contract=academyContractOffer(s,offer);
  const next={...s,phase:'event',clubId:id,contract,pendingEvent:id===s.fanClubId?'fan_home':'arrival',sceneBeat:0,decisions:[...s.decisions,{age:s.age,text:'Primer contrato: '+offer.name+' · '+contract.years+' años'}]};
  return syncClub(next,{fresh:true});
}
/** Mantiene coherentes mundo, vestuario y entrenador del club actual. */
export function syncClub(s,{fresh=false}={}){
  if(!s.clubId)return s;
  let n=ensureWorld(s);
  const club=worldClub(n.clubId)||getClub(n.clubId);if(!club)return n;
  const coach=coachFor(n,n.clubId);
  if(fresh||n.squad?.clubId!==n.clubId){
    const level=dynamicLevel(n,club);
    const squad=freshSquad(n,{...club,level},coach,namerFor(club.countryCode||n.country));
    // Un club nuevo empieza de cero; una partida migrada conserva la confianza que ya tenía.
    const trust=fresh?clamp(50+(!n.history?.length?choiceFx(n).startTrust:0),0,100):clamp(n.coachTrust??50,0,100);
    n={...n,squad,coachTrust:trust,relationships:{...n.relationships,coach:{...(n.relationships?.coach||{}),...(coach?{name:coach.name,role:'Entrenador',style:coach.style}:{}),trust,known:true}}};
  }else if(coach&&n.squad?.coachId&&n.squad.coachId!==coach.id){
    // El club cambió de entrenador: la relación empieza de cero y la escena de presentación queda pendiente.
    n={...n,coachTrust:48,relationships:{...n.relationships,coach:{...n.relationships.coach,name:coach.name,trust:48,style:coach.style}},squad:{...n.squad,coachId:coach.id,newCoachYear:careerYear(n)}};
  }
  return n;
}
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
// Cada render consulta la jugada: se calcula una vez por estado (los estados son inmutables).
const MOMENTS=new WeakMap();
export function seasonMoment(s){if(s.phase!=='season'||s.clutchMoment)return null;if(!MOMENTS.has(s))MOMENTS.set(s,upcomingMoment(s,playLeague(s).playerMatches,getClub));return MOMENTS.get(s);}
export function playCareerMoment(s,choice,timing=null,performance=null){if(s.plays30?.results?.length)return s;const moment=seasonMoment(s);if(!moment)return s;const next=solveMoment(s,moment,Number(choice),timing,performance);if(next===s)return s;const played=playLeague(next).playerMatches.find(m=>m.round===moment.round&&m.home===moment.home&&m.away===moment.away);return {...next,clutchMoment:{...next.clutchMoment,fixturePreview:played?{score:played.score,minutes:played.minutes,goals:played.goals,assists:played.assists,played:played.played}:null}};}
/* ---------- Jugadas Vivas 3.0 ---------- */
const PLAY_LISTS=new WeakMap();
/** Jugadas de la temporada en curso con su resultado si ya se jugaron. */
export function seasonPlays(s){
 if(s.phase!=='season'||!s.clubId)return [];
 if(PLAY_LISTS.has(s))return PLAY_LISTS.get(s);
 const year=careerYear(s);
 // El calendario base no depende de las jugadas resueltas: se calcula sin ellas.
 const base={...s,plays30:null};
 const league=playLeague(base);
 const levels=Object.fromEntries(league.teams.map(t=>[t.id,t.level]));
 const comp=getCompetitionForCareer(s);
 const list=buildSeasonPlays(base,league,getClub,{role:currentRole(s),rivalLevel:id=>levels[id]??60,tier:comp?.tier??null,prestige:dynamicPrestige(s,worldClub(s.clubId))});
 const results=s.plays30?.year===year?s.plays30.results:[];
 const merged=list.map(p=>({...p,result:results.find(r=>r.id===p.id)||null}));
 PLAY_LISTS.set(s,merged);return merged;
}
export function nextSeasonPlay(s){return seasonPlays(s).find(p=>!p.result)||null;}
/** Registra el resultado de una jugada interactiva (o automática) y actualiza moral y confianza. */
export function resolveSeasonPlay(s,id,report){
 const play=seasonPlays(s).find(p=>p.id===id);
 if(!play||play.result)return s;
 const res=sanitizeReport(report);
 const year=careerYear(s);
 const result={id:play.id,year,round:play.round,home:play.home,away:play.away,type:play.type,kind:play.kind,minute:play.minute,before:play.before,rival:play.rival,decisive:play.decisive,...res,credit:play.kind==='attack'?(res.credit||play.credit):play.credit,auto:!!report?.auto};
 const prev=s.plays30?.year===year?s.plays30.results:[];
 const memory={...(s.playMemory||{})};
 if(play.type==='penal'&&Number.isFinite(res.dir))memory.penalties=[...(memory.penalties||[]),res.dir].slice(-6);
 let next={...s,plays30:{year,results:[...prev,result]},playMemory:memory,
  // Moral, confianza y reputación cambian al cerrar la temporada: si cambiaran ahora,
  // alterarían los minutos simulados y el resto del calendario dejaría de coincidir.
  careerMoments:[...(s.careerMoments||[]),{year,kind:'on-field',text:`${playOutcomeText(play,res)} ante ${play.rival} · min. ${play.minute}`}].slice(-120)};
 const fixture=playLeague(next).playerMatches.find(m=>m.round===play.round&&m.home===play.home&&m.away===play.away);
 if(fixture)next.plays30.results[next.plays30.results.length-1]={...result,finalScore:fixture.score,goals:fixture.goals,assists:fixture.assists};
 return next;
}
export function autoResolveSeasonPlay(s,id){const play=seasonPlays(s).find(p=>p.id===id);return play&&!play.result?resolveSeasonPlay(s,id,autoReport(s,play)):s;}
function participantsFor(s){const club=getClub(s.clubId);return club?leagueParticipants(club.countryCode,s.clubId,s):[];}
/** Objetivos que la directiva y el técnico fijan antes de empezar la temporada. */
function roleContext(s){const parts=participantsFor(s);const own=parts.find(c=>c.id===s.clubId);return {parts,role:s.squad?squadRole(s,own?.level??60,coachFor(s,s.clubId)):null};}
export function currentObjectives(s){
  if(!s.clubId||!s.squad)return null;
  const {parts,role}=roleContext(s);
  return seasonObjectives({...s,__tier:getCompetitionForCareer(s)?.tier??null},parts,role);
}
export function currentRole(s){return roleContext(s).role;}
export function advanceSeason(input){
 if(input.phase!=='season')return input;
 let s=syncClub(input);
 const club=getClub(s.clubId);if(!club)return input;
 const r=rng(`${s.seed}:seasonv5:${s.age}:${club.id}`);
 const year=careerYear(s);
 const coach=coachFor(s,s.clubId);
 const objectives=currentObjectives(s);
 // Jugadas Vivas: el efecto anímico se aplica ahora, cuando la temporada ya quedó simulada.
 const playRes=s.plays30?.year===year?s.plays30.results:[];
 const playFx=playRes.reduce((a,r)=>{const w=r.decisive?1.5:1;a.morale+=(r.success?3:-2)*w;a.trust+=(r.success?1.5:-.5)*w;a.rep+=r.success&&r.decisive?1:0;return a;},{morale:0,trust:0,rep:0});

 const comp=getCompetitionForCareer(s);
 const league=playLeague(s),leagueRosters=nextLeagueRosters(s,league),{matches,goals,assists,cleanSheets,goalsConceded,injuryWeeks,leaguePosition,role,minutes}=league;
 const global=simulateGlobalSeason(s,league);
 const games=league.playerMatches.length||1;
 const share=minutes/(games*90);
 const prep=preparationEffects(s),identity=identitySeasonEffects(s);
 const threadFx=threadEffects(s),coachFx=coachSeasonEffects(coach,s);
 const titles=[];
 if(leaguePosition===1)titles.push(league.league);
 for(const name of global.titles)titles.push(name);
 const partial={matches,minutes,goals,assists,cleanSheets,leaguePosition,injuryWeeks,table:league.standings};
 let rating=seasonRating(partial,s.position);
 // «Irregularidad»: rachas buenas y malas → la nota de cada temporada oscila más (determinista por semilla).
 if(rating!=null&&s.weakness==='inconstante')rating=Math.round(clamp(rating+(rng(`${s.seed}:variance:${year}`)()-.5)*.5,5.6,8.6)*100)/100;
 // Desarrollo por atributos: edad, minutos, nota, entrenador, pretemporada, promesas y lesiones.
 const cfx=choiceFx(s);
 const dev=developSeason(s,{share,rating:rating??6.2,injuryWeeks,coachFx,threadFx,careerFx:cfx,focus:preparationFocus(prep.id)});
 const ovr=dev.ovr,attributes=dev.attributes,attributeChanges=dev.changes,attributesBefore={...(s.attributes||{})};
 const international=global.international;
 const worldCupResult=global.worldCupResult;
 const wage=s.contract?.currency==='EUR'?s.contract.salary:annualSalary(club,s.ovr);
 // Ascensos y descensos del club del jugador.
 const nextComp=getCompetitionForCareer({...s,leagueRosters});
 const relegated=!!(comp?.tier===1&&nextComp?.tier===2);
 const promoted=!!(comp?.tier===2&&nextComp?.tier===1);
 const objectiveResult=evaluateObjectives(objectives,{...partial,matches});
 const seasonal={salaryEarned:wage,attributesBefore,attributesAfter:{...attributes},attributeChanges,age:s.age,year,clubId:club.id,club:club.name,country:club.country,ovrBefore:s.ovr,ovrAfter:ovr,potentialAfter:dev.potential,role,matches,minutes,goals,assists,cleanSheets,goalsConceded,international,injuryWeeks,leaguePosition,titles,worldCupResult,rating,
  table:league.standings,fixtures:league.fixtureResults,playerMatches:league.playerMatches,plan:league.plan,champion:league.champion,leagueName:league.league,leagueId:league.leagueId,leagueVerified:league.verified,leagueDivision:league.division,competitionVersion:4,clutchMoment:s.clutchMoment?.year===year?s.clutchMoment:null,plays:s.plays30?.year===year?s.plays30.results:[],competitions:global.competitions,competitionCalendar:global.calendar,calledUp:global.calledUp,nationalCaps:global.nationalCaps,nationalGoals:global.nationalGoals,clubCupMatches:global.totalCupMatches??0,
  captain:!!s.squad?.captain,objectives:objectiveResult,devNotes:dev.notes,coachName:coach?.name,coachStyle:coach?.style,rivalName:s.squad?.rival?.name,rivalOvr:s.squad?.rival?.ovr,relegated,promoted};
 // El mundo avanza: clubes, entrenadores, futbolistas, premios y noticias.
 const world=advanceWorld({...s,ovr,potential:dev.potential,leagueRosters:s.leagueRosters},league,seasonal);
 const awardsYear=world.awards.at(-1);
 const myAwards=(awardsYear?.list||[]).filter(a=>a.winner?.you).map(a=>({year,id:a.id,name:a.name,league:a.league||null,global:!!a.global}));
 const ballPlace=awardsYear?.youPlace||null;
 seasonal.awards=myAwards;seasonal.ballPlace=ballPlace;
 // Relación con el entrenador, la directiva y la hinchada.
 const objScore=objectiveResult?.score??1;
 const swing=coachFx.trustSwing;
 const baseTrust=(matches>=Math.round(games*.65)?3:matches<8?-5:-1)+(s.seasonPlan==='defensa'?2:0)+prep.coach+identity.coach+((rating??6.4)-6.5)*4+(objectiveResult?.personal.met?2:-1);
 // La confianza cambia por temporada de forma acotada y tiende a estabilizarse.
 const coachTrust=clamp(Math.round((s.coachTrust??50)+playFx.trust+cfx.coachYear+clamp(baseTrust*swing,-11,8)-((s.coachTrust??50)-58)*.1-Math.max(0,(s.coachTrust??50)-80)*.3),0,100);
 const relationships={...s.relationships,coach:{...s.relationships.coach,trust:coachTrust}};
 const squad={...(s.squad||{})};
 squad.seasons=(squad.seasons||0)+1;
 squad.board=clamp(Math.round((squad.board??55)+cfx.boardYear+(objectiveResult?(objectiveResult.board.met?7:-9)+(objectiveResult.personal.met?2:-1):0)+(titles.length?5:0)),0,100);
 squad.fans=clamp(Math.round((squad.fans??50)+cfx.fansYear+(goals+assists)/5+((rating??6.4)-6.5)*6+titles.length*5+(objectiveResult?.board.met?3:-3)+(squad.seasons>=3?1:0)+threadFx.morale*.5),0,100);
 if(squad.fans>=86&&squad.seasons>=4)squad.idol=true;
 // Competidor directo: envejece, progresa o se marcha; el club puede fichar otro.
 if(squad.rival){
  const rr=rng(`${s.seed}:rival-year:${year}`);
  const rv={...squad.rival,age:squad.rival.age+1};
  const d=rv.age<=23?1+rr()*3:rv.age<=28?rr()*2-.5:rv.age<=31?-rr()*1.5:-1-rr()*2.5;
  rv.ovr=clamp(Math.round(rv.ovr+d),40,95);rv.trend=Math.round(d);
  const leaves=(role==='Titular'&&ovr-rv.ovr>=6&&rr()<.55)||(rv.age>=34&&rr()<.5)||rr()<.12;
  if(leaves){const lvl=dynamicLevel({...s,world},club);const arrives=rr()<.6;
   squad.rival={name:namerFor(club.countryCode)(`${s.seed}:rival-new:${year}`),age:arrives?20+Math.floor(rr()*10):18+Math.floor(rr()*2),ovr:clamp(Math.round(arrives?Math.max(lvl,ovr-3)+rr()*6:lvl-6+rr()*6),45,95),position:s.position,trend:0,since:year+1,signed:arrives};
   seasonal.rivalChange=`${rv.name} dejó el club. ${squad.rival.signed?`Llega ${squad.rival.name} (media ${squad.rival.ovr}) para pelear tu puesto.`:`Sube desde la cantera ${squad.rival.name} (media ${squad.rival.ovr}).`}`;}
  else squad.rival=rv;
 }
 // Reputación: rendimiento, títulos, selección y premios.
 const awardRep=myAwards.reduce((n,a)=>n+(a.id==='ball'?12:a.global?6:3),0)+(ballPlace?Math.max(0,11-ballPlace)*.6:0);
 let reputation=clamp(Math.round((s.reputation||0)+playFx.rep+cfx.repYear+(leaguePosition<=3?3:0)+Math.min(4,Math.floor((goals+assists)/13))+prep.reputation+Math.min(8,global.competitions.filter(c=>c.championWon).length*3)+Math.min(4,Math.floor(global.nationalCaps/4))+awardRep+((rating??6.4)>=7.2?2:0)),0,100);
 // Hilos narrativos: desafíos públicos y promesas se cobran al cierre de la temporada.
 let threads=s.threads||[];
 const challenge=activeThreads(s,year).find(t=>t.kind==='public_challenge');
 const nemesis=world.players.find(p=>p.rival);
 const moments=[...(s.careerMoments||[])];
 if(challenge&&nemesis){const theirs=nemesis.seasons?.at(-1);const mine=(goals+assists)+(rating??6)*2;const them=theirs?(theirs.goals+theirs.assists)+(nemesis.ovr/12):0;const won=mine>=them;reputation=clamp(reputation+(won?4:-3),0,100);moments.push({year,kind:'story',text:won?`Ganaste el duelo público con ${nemesis.name}.`:`${nemesis.name} ganó el duelo que le planteaste en la prensa.`});threads=threads.map(t=>t===challenge?{...t,resolved:true,outcome:won?'ganado':'perdido'}:t);}
 for(const n of dev.notes)moments.push({year,kind:'development',text:n.text});
 for(const a of myAwards)moments.push({year,kind:'award',text:`${a.name}${a.league?` · ${a.league}`:''}`});
 const trophyRecords=[...(s.trophyRecords||[]),...titles.filter(title=>title===league.league).map(title=>({title,year,clubId:club.id,leagueId:league.leagueId||'',kind:'league'})),...global.trophyRecords];
 const morale=clamp(Math.round((s.morale??70)+playFx.morale+cfx.moraleYear+(s.dream==='titulos'?titles.length:0)-((s.morale??70)-68)*.18+prep.morale+identity.morale+coachFx.morale+threadFx.morale+(objScore>=2?3:objScore<1?-4:0)+(myAwards.length?4:0)),0,100);
 const flags={...(s.storyFlags||{})};if(s.fanClubId&&s.clubId===s.fanClubId)flags.playedForFan=true;
 // Las promesas de esta temporada vencen; quedan registradas para escenas posteriores.
 const next={...s,age:s.age+1,ovr,potential:dev.potential,attributes,attrCeil:dev.attrCeil,reputation,trophyRecords,annualScenes:0,morale,careerEarnings:(s.careerEarnings||0)+wage,leagueRosters,coachTrust,relationships,history:[...s.history,seasonal],trophies:[...s.trophies,...titles],lastSeason:seasonal,recapPending:true,storyFlags:flags,
  world,squad,threads,awards:[...(s.awards||[]),...myAwards],careerMoments:moments.slice(-120),
  sceneBeat:0,sceneChoice:null,scenePlayerText:'',clutchMoment:null,plays30:null,phase:'event'};
 let synced=syncClub(next);
 // Sueño cumplido: recompensa única (reputación, moral, afición, directiva) y premio de carrera.
 const dream=dreamProgress(synced);
 if(dream?.done&&!synced.dreamDone){
  const sq={...synced.squad,fans:clamp((synced.squad?.fans??50)+DREAM_REWARD.fans,0,100),board:clamp((synced.squad?.board??55)+DREAM_REWARD.board,0,100)};
  synced={...synced,dreamDone:{year,id:dream.id,title:dream.title},squad:sq,reputation:clamp((synced.reputation||0)+DREAM_REWARD.rep,0,100),morale:clamp((synced.morale??70)+DREAM_REWARD.morale,0,100),
   awards:[...synced.awards,{year,id:'dream',name:`Sueño cumplido: ${dream.title}`,global:false}],
   careerMoments:[...synced.careerMoments,{year,kind:'award',text:`Sueño cumplido: ${dream.title}`}].slice(-120),
   lastSeason:{...synced.lastSeason,dreamCompleted:dream.title}};
 }
 const pick=nextScene(synced,r);
 return {...synced,pendingEvent:pick.id,sceneData:pick.data||{}};
}
function nextScene(s,r){
 const world=pickWorldScene(s,r);
 if(world&&(world.weight>=25||r()<.62))return world;
 return {id:chooseScene(s,r),data:{}};
}

export function eventInfo(s){if(s.phase!=='event')return null;return sceneFor(s);}
export function resolveEvent(s,option,playerText=''){
  if(s.phase!=='event'||(s.sceneBeat||0)!==0)return s;
  const event=sceneFor(s);
  if(!Number.isInteger(option)||option<0||option>=event.options.length)return s;
  return resultOfScene(s,event,option,playerText);
}
function retireState(s,text){return {...s,phase:'retired',market:null,offers:[],pendingEvent:null,sceneBeat:0,decisions:[...s.decisions,{age:s.age,text}]};}
export function finishEvent(s){
 if(s.phase!=='event'||s.sceneBeat!==1)return s;
 const hadFanScene=s.pendingEvent==='fan_home';
 const flags=hadFanScene?{...s.storyFlags,playedForFan:true}:s.storyFlags;
 let next={...s,phase:'season',pendingEvent:null,sceneBeat:0,sceneChoice:null,scenePlayerText:'',sceneData:{},storyFlags:flags};
 if(next.retireRequested)return retireState(next,'Anunciaste tu retiro del fútbol profesional');
 // Última función: tras la temporada de despedida llega el retiro.
 const farewell=(next.threads||[]).find(t=>t.kind==='last_dance'&&!t.resolved&&t.year<careerYear(next));
 if(farewell)return retireState({...next,threads:resolveThread(next,'last_dance','cumplida')},'Cumpliste tu temporada de despedida y colgaste los botines');
 if(next.age>=44)return retireState(next,'El cuerpo dijo basta: retiro a los '+next.age+' años');
 // Al concluir una cesión de una temporada vuelve al club de origen conservando su contrato.
 if(next.contract?.kind==='loan'&&next.contract.ends<=careerYear(next)&&next.contract.parentClubId){
  const parent=marketClub(next.contract.parentClubId);
  if(parent){const parentContract=next.contract.parentContract||{clubId:parent.id,ends:careerYear(next)+1,salary:annualSalary(parent,next.ovr),currency:'EUR'};
   next=syncClub({...next,clubId:parent.id,contract:parentContract,coachTrust:48,decisions:[...next.decisions,{age:next.age,text:`Regresaste a ${parent.name} tras una cesión`}]});}
 }
 if(next.history.length===0)return next;
 // Escenas adicionales por campaña, sin repetir el primer contrato ni escenas de hinchas.
 const extraScenes=rng(`${next.seed}:scene-amount:${careerYear(next)}`)()<.5?1:2;
 if((next.annualScenes||0)<extraScenes && !['arrival','fan_home','fan_departure'].includes(s.pendingEvent)){
  const r=rng(`${next.seed}:second-scene:${careerYear(next)}:${next.clubId}:${next.annualScenes||0}`);
  let pick=nextScene(next,r);
  if(pick.id===s.pendingEvent){const alt=chooseScene(next,()=>.97);pick={id:alt===s.pendingEvent?'coach':alt,data:{}};}
  return {...next,pendingEvent:pick.id,sceneData:pick.data||{},phase:'event',annualScenes:(next.annualScenes||0)+1};
 }
 const policy=evaluateClubFuture(next);
 const requested=hasThread(next,'transfer_request');
 const interest=activeThreads(next).find(t=>t.kind==='big_club_interest');
 const mandatory=!policy.canStay;
 // Mercado: se abre por contrato, por pedido propio, por interés de un grande o cuando el jugador supera a su club.
 const prestige=dynamicPrestige(next,worldClub(next.clubId));
 const outgrown=Math.max(0,(next.ovr||60)-prestige-2)*.05;
 const pressure=Math.min(.85,.16+(next.reputation||0)/260+outgrown+((next.lastSeason?.rating||6.4)>=7.1?.12:0));
 const shouldOpen=mandatory||requested||!!interest||policy.reason==='renewal'||next.age>=39&&!!next.contract&&next.contract.ends<=careerYear(next)+1||rng(`${next.seed}:transfer7:${next.age}`)()<pressure;
 if(!shouldOpen)return {...next,market:null,offers:[]};
 let offers=buildTransferOffers(next,{attempt:0,forced:mandatory||requested});
 if(policy.reason==='loan-request')offers=offers.map((o,i)=>i<2?{...o,kind:'loan',role:'Cesión',years:1,salary:annualSalary(o,next.ovr,'Cesión')}:o);
 if(requested)next={...next,threads:resolveThread(next,'transfer_request','mercado abierto')};
 const reason=requested&&policy.canStay?'request':interest&&policy.reason==='normal'?'interest':policy.reason;
 return {...next,offers,market:{...policy,reason,source:'season',searches:0,focus:'balanced'},agent:{searches:0,year:careerYear(next),focus:'balanced'},phase:'transfer'};
}
export function autoResolveEvent(s){if(s.phase!=='event')return s;const first=(s.sceneBeat||0)===0?resolveEvent(s,autoOption(s)):s;return finishEvent(first);}
/** La simulación automática evita decisiones extremas (como retirarse) salvo que la carrera ya esté terminando. */
function autoOption(s){const e=sceneFor(s);
 const safe=o=>!o.effect?.retire&&o.effect?.thread?.kind!=='transfer_request'&&!o.effect?.position&&(o.effect?.thread?.kind!=='last_dance'||s.age>=37);
 const idx=e.options.findIndex(safe);return idx>=0?idx:0;}
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
/** Negociación: pedir más sueldo, titularidad o más años. El club puede aceptar, mantener o retirar la oferta. */
export const NEGOTIATION_ASKS={salary:'Pedir +20 % de sueldo',role:'Exigir rol de titular',years:'Pedir un año más'};
export function negotiateOffer(s,id,ask){
 if(s.phase!=='transfer'||!NEGOTIATION_ASKS[ask])return s;
 const offer=(s.offers||[]).find(o=>o.id===id);if(!offer||offer.negotiated)return s;
 const r=rng(`${s.seed}:negotiate:${careerYear(s)}:${id}:${ask}`);
 const leverage=playerDemand(s)-(offer.prestige||clubPrestige(offer));
 const agent=(s.relationships?.agent?.trust??45)-50;
 const p=clamp(.42+leverage*.035+agent/180-(ask==='role'&&offer.role!=='Titular'?.08:0),.08,.9);
 const roll=r();
 let result,changed={...offer,negotiated:ask};
 if(roll<p){result='accepted';
  if(ask==='salary')changed.salary=Math.round(offer.salary*1.2/1000)*1000;
  if(ask==='role'){changed.role='Titular';changed.project='Titular prometido';changed.promise=true;}
  if(ask==='years')changed.years=(offer.years||2)+1;
 }else if(roll<p+(1-p)*.42){result='withdrawn';}
 else result='rejected';
 changed.negotiation=result;
 const offers=result==='withdrawn'?s.offers.filter(o=>o.id!==id):s.offers.map(o=>o.id===id?changed:o);
 const text={accepted:`${offer.name} aceptó tu pedido.`,rejected:`${offer.name} mantiene su propuesta original.`,withdrawn:`${offer.name} retiró la oferta tras tu pedido.`}[result];
 return {...s,offers,lastNegotiation:{id,ask,result,text,club:offer.name},relationships:{...s.relationships,agent:{...s.relationships.agent,trust:clamp((s.relationships.agent?.trust??45)+(result==='accepted'?3:result==='withdrawn'?-3:0),0,100),known:true}}};
}
export function negotiateRenewal(s){
 if(s.phase!=='transfer'||!s.market?.renewal||s.market.renewal.negotiated)return s;
 const r=rng(`${s.seed}:renewal-talk:${careerYear(s)}`);
 const board=s.squad?.board??55;
 const p=clamp(.3+(board-50)/90+((s.lastSeason?.rating||6.4)-6.5)*.35+(s.squad?.idol?.15:0),.08,.88);
 const ok=r()<p;
 const renewal={...s.market.renewal,negotiated:true,salary:ok?Math.round(s.market.renewal.salary*1.18/1000)*1000:s.market.renewal.salary};
 return {...s,market:{...s.market,renewal},squad:{...s.squad,board:clamp(board+(ok?-2:-6),0,100)},lastNegotiation:{id:'renewal',result:ok?'accepted':'rejected',text:ok?'La directiva mejoró tu renovación un 18 %.':'La directiva no mejora la oferta de renovación.'}};
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
 let threads=resolveThread(s,'big_club_interest','mercado cerrado');
 threads=threads.map(t=>offer&&!t.resolved&&['captain','mentor','fans_conflict','board_ultimatum','promise_minutes'].includes(t.kind)?{...t,resolved:true,outcome:'cambio de club'}:t);
 let next={...s,phase:joinedFan||leftFan?'event':'season',pendingEvent:joinedFan?'fan_home':leftFan?'fan_departure':null,
  sceneBeat:0,clubId:nextClubId,contract,market:null,relationships:rel,coachTrust:rel.coach.trust,offers:[],lastNegotiation:null,threads,
  decisions:[...s.decisions,{age:s.age,text:offer?`${offer.kind==='loan'?'Cesión a':'Fichaste por'} ${offer.name} (${offer.country})`:`Continuaste en ${getClub(s.clubId)?.name||'tu equipo'}`}]};
 if(offer){
  next=syncClub(next,{fresh:true});
  if(offer.promise)next={...next,threads:addThread(next,'promise_minutes',{clubId:offer.id},1)};
  next={...next,world:pushNews(next.world,{year:careerYear(s),kind:'you',title:`${s.name} ${offer.kind==='loan'?'llega cedido a':'ficha por'} ${offer.name}`,text:`${offer.kind==='loan'?'Préstamo por una temporada':`Contrato por ${offer.years||3} año(s)`} desde ${getClub(s.clubId)?.name||'su club'}.`,clubId:offer.id,mine:true})};
 }
 return next;
}
export function retireFromMarket(s){
 if(s.phase!=='transfer'||s.market?.canStay||s.age<31)return s;
 return retireState(s,'Sin contrato disponible: decidiste retirarte del fútbol profesional');
}
/** Retiro voluntario: desde los 32 años, entre temporadas. */
export function canRetire(s){return ['season','transfer'].includes(s?.phase)&&s.age>=32&&(s.history||[]).length>0;}
export function retireNow(s){if(!canRetire(s))return s;return retireState(s,`Anunciaste tu retiro a los ${s.age} años`);}
export function simulateToRetirement(state){
  let s=state;
  for(let k=0;k<180&&s.phase!=='retired';k++){
    if(s.phase==='season'){
      // Un veterano en caída libre deja el fútbol por decisión propia.
      if(s.age>=35&&(s.ovr<62||s.age>=39&&s.ovr<70))s=retireNow(s);
      else s=advanceSeason(s);
    }
    else if(s.phase==='event')s=autoResolveEvent(s);
    else if(s.phase==='transfer'){
      const currentPrestige=dynamicPrestige(s,worldClub(s.clubId));
      const best=[...(s.offers||[])].sort((a,b)=>b.prestige-a.prestige)[0];
      const better=best&&(best.prestige>=currentPrestige+4||s.market?.canStay===false||s.market?.reason==='request');
      if(better)s=chooseTransfer(s,best.id);
      else if(s.market?.canStay)s=chooseTransfer(s);
      else if((s.market?.searches||0)<2)s=askAgentForMore(s);
      else s=s.age>=31?retireFromMarket(s):chooseTransfer({...s,market:{...s.market,canStay:true}});
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
 if(saved)return saved.table.map(t=>({...t,isPlayer:t.id===s.clubId}));
 // Antes de disputar partidos, no hay tabla ficticia con puntos inventados.
 return leagueParticipants(club.countryCode,s.clubId,s).map(c=>({id:c.id,name:c.name,played:0,wins:0,draws:0,losses:0,for:0,against:0,gd:0,points:0,isPlayer:c.id===s.clubId})).sort((a,b)=>a.name.localeCompare(b.name,'es')).map((x,i)=>({...x,position:i+1}));
}
