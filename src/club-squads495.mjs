import {getWorldMappingInfo,getWorldIndex,readWorldClub,getWorldPlayer} from './fm26-universe.mjs';
import {fm26OVR,fm26Position,applyFM26Delta} from './fm26-real.mjs';
import {fmNationToCode} from './fm26-nations.mjs';
import {getClub} from './engine.mjs';
import {COUNTRIES} from './countries.mjs';
import {isExcludedPlayer} from './world-exclusions.mjs';
import {isFemaleClubRecord497,isFemalePlayerRecord497} from './world-gender497.mjs';

// Correspondencias contrastadas con el nombre completo, país y plantel del índice mundial.
const explicit={'cl-extra-15':{uid:'130779',country:'190',name:'Club de Deportes Santiago Morning'},'cl-extra-14':{uid:'130788',country:'190',name:'Club Social de Deportes Rangers de Talca'},'en-2':{uid:'676',country:'139',name:'Liverpool'}};
function explicitMatch(id,index){const x=explicit[id],entry=x&&index[x.uid];return entry&&String(entry.pais_id_fm)===x.country&&entry.nombre===x.name?x.uid:null}

// RASCENSO y la base mundial usan IDs de club diferentes. No confundir
// «no enlazado» con «sin jugadores»: buscar una equivalencia segura por
// país FM y nombre normalizado, sin fusionar homónimos por intuición.
/**
 * RASCENSO 4.9.9 — Resolver por identidad del CLUB, nunca por similitud aislada.
 * La base mundial incluye razones sociales (Club Deportivo, SADP, etc.) y
 * el catálogo jugable suele mostrar un nombre corto. Enlace automático sólo
 * si el país FM está confirmado y existe un candidato inequívoco.
 */
const normalizeClubName=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'')
 .toLowerCase().replace(/^\s*club\s+atletico\s+/,' ')
 .replace(/&/g,' y ').replace(/\b(s\.?\s*a\.?\s*d\.?\s*p?\.?)\b/g,' ')
 .replace(/\b(?:sociedad anonima deportiva profesional|sociedad anonima deportiva|club|clube|deportivo|deportiva|deportes|desportivo|futbol|futebol|football|sociedad|social|asociacion|associacao|regatas|fc|cf|ac|sc|sd|de|del|da|do|la|el)\b/g,' ')
 .replace(/[^a-z0-9]+/g,' ').replace(/\s+/g,' ').trim();
const normTokens=value=>new Set(normalizeClubName(value).split(' ').filter(Boolean));
const normBare=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim().replace(/\s+/g,' ');
const isYouthOrReserve=(name)=>/\b(?:women|womens|female|femenin[ao]|feminino|feminina|fem|ladies|sub\s*\d+|u\s*\d+|reserva(?:s)?|juvenil(?:es)?|filial|academy|academia|b team|ii|iii)\b/i.test(normBare(name));
const ratio=(a,b)=>{if(!a.size||!b.size)return 0;let hits=0;for(const t of a)if(b.has(t))hits++;return hits/Math.max(a.size,b.size)};
let memoIndex=null,memoRows=null,memoAlias=null,memoCountry=null;
function clubRows(index){
 if(index===memoIndex&&memoRows)return memoRows;
 memoIndex=index;memoCountry=new Map();memoAlias=new Map();
 memoRows=Object.entries(index||{}).filter(([uid,x])=>x&&x.nombre&&Number(x.n_jugadores)>0&&!isFemaleClubRecord497(uid,x))
 .map(([uid,entry])=>({uid,entry,key:normalizeClubName(entry.nombre),bare:normBare(entry.nombre),words:normTokens(entry.nombre),
  firstTeam:Number(entry.n_primer_equipo)||0,players:Number(entry.n_jugadores)||0,
  country:String(entry.pais_id_fm||'')})).filter(r=>!!r.key&&!isYouthOrReserve(r.entry.nombre));
 for(const row of memoRows){const k=row.key;const list=memoAlias.get(k)||[];list.push(row);memoAlias.set(k,list)}
 return memoRows;
}
/** Países inferidos con varias coincidencias INDEPENDIENTES de clubes del catálogo.
 * Nunca usar fmNationToCode(pais_id_fm): los IDs de naciones de futbolistas
 * son otra tabla distinta a los países de clubes FM. */
function countryFor(club,index,mappings){
 const code=String(club?.countryCode||'').toUpperCase();
 const fromMapping=mappings?.countries?.[code];
 if(fromMapping!=null)return String(fromMapping);
 // Anclas de país verificadas en la base mundial. Evitar inferir desde la
 // nacionalidad individual de jugadores, que no garantiza país del club.
 const verifiedOrigins={AR:'187',CL:'190',ES:'170'};
 if(verifiedOrigins[code])return verifiedOrigins[code];
 const fromKnown=memoCountry?.get(code);if(fromKnown!==undefined)return fromKnown;
 const countryClubs=COUNTRIES.find(c=>c.code===code)?.clubs||null;
 if(!countryClubs){memoCountry?.set(code,null);return null}
 const tally=new Map();
 for(const game of countryClubs){
  const options=(memoAlias?.get(normalizeClubName(game.name))||[]);
  if(options.length!==1)continue;
  tally.set(options[0].country,(tally.get(options[0].country)||0)+1);
 }
 const ordered=[...tally].sort((a,b)=>b[1]-a[1]);
 const result=ordered[0]?.[1]>=3&&ordered[0][1]>=2*(ordered[1]?.[1]||0)?ordered[0][0]:null;
 memoCountry?.set(code,result);return result;
}
const officialAliases=Object.freeze({
 'cl-3':['club deportivo universidad catolica'],
 'cl-extra-3':['club de deportes iquique'],
 'cl-extra-9':['club de deportes santiago wanderers']
});
function bestCandidate(club,rows){
 const wanted=normalizeClubName(club.name),bare=normBare(club.name),tokens=normTokens(club.name);
 const options=[];const official=officialAliases[club.id]||[];
 for(const row of rows){
  const exact=!!wanted&&row.key===wanted;
  const words=ratio(tokens,row.words);
  // Una razón social puede extender el nombre, pero no mezclar clubes que
  // comparten sólo una palabra («Universidad», «Atlético», «City», etc.).
  const containment=wanted.length>=7&&(row.key.startsWith(wanted+' ')||row.key.endsWith(' '+wanted));
  const score=official.includes(row.bare)?140:row.bare===bare?120:exact?110:containment&&words>=.76?93:words>=.87&&tokens.size>=2?82:0;
  if(score<82)continue;
  options.push({...row,score,exact});
 }
 options.sort((a,b)=>b.score-a.score||b.firstTeam-a.firstTeam||b.players-a.players||a.uid.localeCompare(b.uid));
 const top=options[0];if(!top)return {match:null,candidates:[]};
 // Varios registros con la misma identidad exacta: distinguir la plantilla
 // profesional de un duplicado con cero titulares; nunca adivinar si ambos
 // parecen clubes principales.
 let match=null;
 const peers=options.filter(x=>x.score===top.score);
 if(peers.length===1)match=top.uid;
 else {
  const professional=peers.filter(x=>x.firstTeam>=11);
  if(professional.length===1&&peers.every(x=>x===professional[0]||x.firstTeam<11))match=professional[0].uid;
 }
 // Evitar aceptar un alias parcial si otro nombre tiene puntuación cercana.
 if(options[1]&&options[1].score>=top.score-10&&options[1].key!==top.key)match=null;
 return {match,candidates:options.slice(0,8).map(x=>({uid:x.uid,name:x.entry.nombre,
  countryId:x.country,players:x.players,firstTeam:x.firstTeam,score:x.score,exact:x.exact}))};
}
function candidatesForGame(club,index,mappings){
 if(!club)return {match:null,candidates:[],countryVerified:false};
 const rows=clubRows(index);const country=countryFor(club,index,mappings);
 // No asignar automáticamente un club de país incierto; la lista mundial
 // sigue disponible desde Mundo para consultar la plantilla original.
 if(!country){
  const possible=bestCandidate(club,rows);
  return {match:null,candidates:possible.candidates,countryVerified:false};
 }
 const correctCountry=rows.filter(x=>x.country===country);
 if(!correctCountry.length){
  // Informar posibles coincidencias sin asignar un plantel extranjero.
  const possible=bestCandidate(club,rows);
  return {match:null,candidates:possible.candidates,countryVerified:false};
 }
 const answer=bestCandidate(club,correctCountry);
 return {...answer,countryVerified:true};
}
export function resolveClub(ref,index,mappings){
 const mapping=mappings?.mapping||{};
 if(ref.kind==='game'){
  const club=getClub(ref.id),known=mapping[ref.id];
  const verified=known&&index[String(known.fmUID)]&&!isFemaleClubRecord497(known.fmUID,index[String(known.fmUID)])?String(known.fmUID):null;
  const explicitUid=verified?null:explicitMatch(ref.id,index);
  const fallback=verified||explicitUid?null:candidatesForGame(club,index,mappings);
  const uid=verified||explicitUid||fallback?.match||null;
  return {gameId:ref.id,uid,club,entry:uid?index[uid]:null,
   simulationMapped:!!verified,candidates:uid?[]:fallback?.candidates||[],
   linkStatus:verified?'simulado':explicitUid?'verificado':uid?'nombre-pais':'sin-enlace'};
 }
 const uid=String(ref.id),entry=index[uid];
 const matches=Object.entries(mapping).filter(([,v])=>String(v.fmUID)===uid);
 const explicitIds=Object.keys(explicit).filter(id=>explicitMatch(id,index)===uid);
 let gameId=matches.length===1?matches[0][0]:matches.length===0&&explicitIds.length===1?explicitIds[0]:null;
 // La ficha original también puede reconocer el equipo jugable que comparte
 // UID confirmado: así conserva escudo, competición y valores de mercado.
 // Siempre comprobar ida y vuelta; no fusionar clubes homónimos.
 if(!gameId&&entry){
  const isoCountry=String(entry.pais_id_fm);
  const normalized=normalizeClubName(entry.nombre);
  const possible=[];
  for(const country of COUNTRIES){
   if(String(mappings?.countries?.[country.code])!==isoCountry)continue;
   for(const c of country.clubs||[]){
    if(c.inactive||normalizeClubName(c.name)!==normalized)continue;
    if(resolveClub({kind:'game',id:c.id},index,mappings).uid===uid)possible.push(c.id);
   }
  }
  if(possible.length===1)gameId=possible[0];
 }
 return {uid,entry,gameId,club:gameId?getClub(gameId):null,
  simulationMapped:matches.length===1,candidates:[],linkStatus:'original'};
}
/** Plantel profesional: no confundir una plantilla con los 80-100 registros de
 * primer equipo + juveniles + reservas de la exportación de 2026.
 * El identificador equipo_slot=0 señala primera plantilla en esta base.
 * Si faltan titulares marcados, completar sólo con futbolistas reales del
 * archivo, ordenados por calidad; JAMÁS inventar jugadores en esta función.
 */
export function selectOriginalSquad498(raw=[],maxPlayers=30){
 const eligible=(raw||[]).filter(p=>p?.id&&!isExcludedPlayer(p.id)&&!isFemalePlayerRecord497(p));
 const quality=(a,b)=>(Number(b.ca_fm)||0)-(Number(a.ca_fm)||0)
   ||(Number(a.edad)||99)-(Number(b.edad)||99)||String(a.id).localeCompare(String(b.id));
 const first=eligible.filter(p=>Number(p.equipo_slot)===0).sort(quality);
 const reserves=eligible.filter(p=>Number(p.equipo_slot)!==0).sort(quality);
 const cap=Math.max(1,Math.min(35,Math.floor(Number(maxPlayers)||30)));
 const choose=(rows,max)=>{
  const out=[];let keepers=0;
  for(const p of rows){
   if(out.length>=max)break;
   const keeper=fm26Position(p.posiciones)==='POR';
   if(keeper&&keepers>=4)continue;
   if(keeper)keepers++;
   out.push(p);
  }
  return out;
 };
 if(first.length>=11){
  const regular=choose(first,cap);
  return regular.length>=11?regular:choose([...first,...reserves],cap);
 }
 // Sin marca de titularidad suficiente: completar con el mejor talento
 // REAL del archivo; máximo 30 y nunca más de 4 porteros.
 const fallbackSize=first.length?Math.min(cap,Math.max(18,first.length)):Math.min(cap,30);
 return choose([...first,...reserves],fallbackSize);
}

/** Evitar canteranos sintéticos durante las primeras temporadas; recién
 * aparecen cuando quedan huecos reales por retiros o transferencias.
 */
export function shouldFillWithGenerated498(state,realCount){
 const year=Math.max(Number(state?.world?.year)||0,Number(state?.fm26?.year)||0,2026);
 return year>=2029&&realCount<18;
}

export function snapshotPlayer(raw,gameId,state,simulationMapped=true){
 const base={id:raw.id,name:raw.nombre||'',age:raw.edad!=null&&raw.edad!==''&&Number.isFinite(Number(raw.edad))?Number(raw.edad):null,
  pos:fm26Position(raw.posiciones)||raw.posiciones?.[0]||'',ovr:fm26OVR(raw.ca_fm),
  cc:fmNationToCode(raw.nacion_fm),fmNationId:raw.nacion_fm,clubId:gameId,status:'active',
  teamSlot:Number(raw.equipo_slot)||0,attributes:{},seasons:[]};
 // La fórmula de la simulación requiere edad y media: si faltan, no inventarlas.
 if(!gameId||(!simulationMapped&&!state?.fm26?.changes?.[base.id])||(!state?.fm26?.year&&!state?.fm26?.changes?.[base.id])||base.age===null||base.ovr===null)return {...base,...(state?.fm26?.changes?.[base.id]||{})};
 return applyFM26Delta(base,state);
}
export async function loadClubSquad(ref,state={},api={getWorldMappingInfo,getWorldIndex,readWorldClub,getWorldPlayer}){
 const [mappings,index]=await Promise.all([api.getWorldMappingInfo(),api.getWorldIndex()]);
 const info=resolveClub(ref,index||{},mappings);
 // Nunca leer un club confirmado como femenino en la consulta masculina.
 const world=info.uid&&!isFemaleClubRecord497(info.uid,info.entry)?await api.readWorldClub(info.uid):null;
 const changes=state?.fm26?.changes||{},seen=new Set(),players=[];
 const add=(raw,originId)=>{if(!raw?.id||isExcludedPlayer(raw.id)||isFemalePlayerRecord497(raw)||seen.has(raw.id))return;const p=snapshotPlayer(raw,originId,state,info.simulationMapped);
  if(p.status==='retired'||p.clubId!==info.gameId&&info.gameId!==null)return;
  if(info.gameId===null&&changes[p.id]?.clubId!==undefined)return;
  seen.add(p.id);players.push({...p,source:changes[p.id]?'real actualizado':'real base'});
 };
 // El visor muestra profesionales, no todas las categorías del archivo.
 // El motor sigue conservando TODA la base real y los suplentes intactos.
 const selected=selectOriginalSquad498(world?.players||[]);
 for(const raw of selected)add(raw,info.gameId);
 // Traslados históricos: retirar quien se fue, incluir jugadores reales que llegaron.
 if(info.gameId){
  const inbound=Object.entries(changes).filter(([id,d])=>d.clubId===info.gameId&&!seen.has(id)&&d.status!=='retired');
  for(const [id] of inbound){const raw=await api.getWorldPlayer(id);if(raw)add(raw,info.gameId);}
  // Jugadores reales ya incorporados por el motor, sin duplicar fichas.
  for(const p of state.world?.players||[]){
   if(p.clubId!==info.gameId||p.status==='retired'||isExcludedPlayer(p.id)||isFemalePlayerRecord497(p)||seen.has(p.id))continue;
   if(p.origin!=='fm26'&&!String(p.id||'').startsWith('fm26:'))continue;
   seen.add(p.id);players.push({...p,source:'real'});
  }
  // No añadir figuras, rivales ni juveniles inventados al plantel inicial.
  // Sólo reponer bajas reales desde 2029, y hasta una base de 18 futbolistas.
  const realCount=players.length;
  if(shouldFillWithGenerated498(state,realCount)){
   const shortage=18-realCount;
   const eligible=(state.world?.players||[]).filter(p=>p?.clubId===info.gameId
    &&p.status==='active'&&(p.kind==='gen'||p.kind==='prospect')
    &&p.origin!=='fm26'&&!seen.has(p.id)&&!isExcludedPlayer(p.id)&&!isFemalePlayerRecord497(p));
   for(const p of eligible.slice(0,shortage)){
    seen.add(p.id);players.push({...p,source:'generado'});
   }
  }
  if(state.clubId===info.gameId&&state.name&&!seen.has('career-player')){
   players.push({id:'career-player',name:state.name,age:state.age,pos:state.position,ovr:state.ovr,cc:state.country,source:'tu carrera'});
  }
 }
 const generatedCount=players.filter(p=>p.source==='generado').length;
 return {...info,name:info.club?.name||world?.name||info.entry?.nombre||'Club',players,
  hasWorld:!!world,rawTotal:world?.players?.length||0,selectedOriginal: selected.length,
  generatedCount};
}
