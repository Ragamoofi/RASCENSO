import {getWorldMappingInfo,getWorldIndex,readWorldClub,getWorldPlayer} from './fm26-universe.mjs';
import {fm26OVR,fm26Position,applyFM26Delta} from './fm26-real.mjs';
import {fmNationToCode} from './fm26-nations.mjs';
import {getClub} from './engine.mjs';
import {isExcludedPlayer} from './world-exclusions.mjs';
import {isFemaleClubRecord497,isFemalePlayerRecord497} from './world-gender497.mjs';

// Correspondencias contrastadas con el nombre completo, país y plantel del índice mundial.
const explicit={'cl-extra-15':{uid:'130779',country:'190',name:'Club de Deportes Santiago Morning'},'cl-extra-14':{uid:'130788',country:'190',name:'Club Social de Deportes Rangers de Talca'},'en-2':{uid:'676',country:'139',name:'Liverpool'}};
function explicitMatch(id,index){const x=explicit[id],entry=x&&index[x.uid];return entry&&String(entry.pais_id_fm)===x.country&&entry.nombre===x.name?x.uid:null}

// RASCENSO y la base mundial usan IDs de club diferentes. No confundir
// «no enlazado» con «sin jugadores»: buscar una equivalencia segura por
// país FM y nombre normalizado, sin fusionar homónimos por intuición.
const normalizeClubName=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'')
 .toLocaleLowerCase('es').replace(/&/g,' y ').replace(/[^a-z0-9]+/g,' ')
 .replace(/\b(?:s a d p|s a d|s a|sadp|sociedad anonima deportiva profesional|sociedad anonima deportiva|s a d|club|clube|atletico|deportivo|deportiva|deportes|desportivo|futbol|futebol|football|sociedad|social|asociacion|associacao|regatas|fc|cf|ac|sc|sd|de|del|da|do|la|el)\b/g,' ')
 .replace(/\s+/g,' ').trim();
const tokenSet=value=>new Set(normalizeClubName(value).split(' ').filter(Boolean));
let lastIndex=null,lastRows=null;
function clubRows(index){
 if(index===lastIndex&&lastRows)return lastRows;
 lastIndex=index;lastRows=Object.entries(index||{}).filter(([uid,x])=>x&&x.nombre&&!Number.isNaN(Number(x.n_jugadores??1))&&Number(x.n_jugadores??1)>0)
  .map(([uid,x])=>({uid,entry:x,key:normalizeClubName(x.nombre),words:tokenSet(x.nombre)}));
 return lastRows;
}
const overlap=(a,b)=>{if(!a.size||!b.size)return 0;let count=0;for(const t of a)if(b.has(t))count++;
 return count/Math.max(a.size,b.size);
};
function candidatesForGame(club,index,mappings){
 if(!club)return {match:null,candidates:[],countryVerified:false};
 const name=normalizeClubName(club.name),tokens=tokenSet(club.name);
 const countryCode=String(club.countryCode||'').toUpperCase();
 const countryId=mappings?.countries?.[countryCode];
 // Además de los países inferidos del catálogo, ya existe una equivalencia
 // numérica FM→nacionalidad verificada en fm26-nations.mjs. Aprovecharla
 // permite abrir muchos clubes antes omitidos sin adivinar países.
 const knownRows=clubRows(index).filter(row=>countryId!=null
  ?String(row.entry.pais_id_fm)===String(countryId)
  :fmNationToCode(row.entry.pais_id_fm)===countryCode);
 const countryVerified=knownRows.length>0;
 const results=[];
 for(const row of (countryVerified?knownRows:clubRows(index))){
  // Con país desconocido sugerir, nunca enlazar automáticamente.
  const exact=!!name&&name===row.key;
  const ratio=overlap(tokens,row.words);
  // Para candidatos sugeridos permitimos nombres abreviados, nunca para
  // establecer un enlace automático con sólo parecido parcial.
  if(!exact&&ratio<.5)continue;
  const score=exact?1:ratio;
  results.push({uid:row.uid,name:row.entry.nombre,countryId:row.entry.pais_id_fm,
   players:Number(row.entry.n_jugadores)||0,firstTeam:Number(row.entry.n_primer_equipo)||0,
   score,exact});
 }
 results.sort((a,b)=>b.score-a.score||b.firstTeam-a.firstTeam||a.name.localeCompare(b.name,'es'));
 // Un club puede tener jugadores incluso cuando el índice no marca titulares (n_primer_equipo=0).
 // El único enlace automático permitido sigue exigiendo nombre+país inequívocos.
 const exacts=results.filter(x=>x.exact&&x.players>0);
 let match=countryVerified&&exacts.length===1?exacts[0].uid:null;
 // Deportes Iquique figura con distintas razones sociales en los datos FM.
 // Sólo aceptar un registro masculino del país comprobado, con el núcleo
 // «Deportes Iquique» completo y SIN sufijos de filiales/sub-21/reservas.
 if(!match&&club.id==='cl-extra-3'&&countryVerified&&String(countryId)==='190'){
  const alias=knownRows.filter(row=>/\bdeportes?\s+iquique\b/i.test(row.entry.nombre)
   &&!/\b(?:women|femenin[ao]|sub[- ]?\d+|u[- ]?\d+|reserva|filial|juvenil|ii|iii|b)\b/i.test(row.entry.nombre)
   &&Number(row.entry.n_jugadores)>0);
  if(alias.length===1)match=alias[0].uid;
 }
 return {match,candidates:results.slice(0,10),countryVerified};
}
export function resolveClub(ref,index,mappings){
 const mapping=mappings?.mapping||{};
 if(ref.kind==='game'){
  const club=getClub(ref.id),known=mapping[ref.id];
  const verified=known&&index[String(known.fmUID)]?String(known.fmUID):null;
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
 const gameId=matches.length===1?matches[0][0]:matches.length===0&&explicitIds.length===1?explicitIds[0]:null;
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
