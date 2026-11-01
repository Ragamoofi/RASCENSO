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
 .replace(/\b(?:club|clube|atletico|deportivo|deportiva|deportes|desportivo|futbol|futebol|football|sociedad|social|asociacion|associacao|regatas|fc|cf|ac|sc|sd|de|del|da|do|la|el)\b/g,' ')
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
 const match=countryVerified&&exacts.length===1?exacts[0].uid:null;
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
  seen.add(p.id);players.push({...p,source:changes[p.id]?'simulado':'base'});
 };
 for(const raw of world?.players||[])add(raw,info.gameId);
 // La ficha original del futbolista transferido puede estar en otro shard aún no cargado.
 if(info.gameId){const inbound=Object.entries(changes).filter(([id,d])=>d.clubId===info.gameId&&!seen.has(id)&&d.status!=='retired');
  for(const [id] of inbound){const raw=await api.getWorldPlayer(id);if(raw)add(raw,info.gameId);}
  for(const p of state.world?.players||[]){if(p.clubId!==info.gameId||p.status==='retired'||isExcludedPlayer(p.id)||isFemalePlayerRecord497(p)||seen.has(p.id))continue;
   // Cuando hay datos reales, no presentar veteranos ficticios como sustitutos.
   if(world&&p.kind!=='gen'&&p.kind!=='prospect')continue;
   seen.add(p.id);players.push({...p,source:'simulado'});
  }
  if(state.clubId===info.gameId&&state.name){players.push({id:'career-player',name:state.name,age:state.age,pos:state.position,ovr:state.ovr,cc:state.country,source:'tu carrera'});}
 }
 return {...info,name:info.club?.name||world?.name||info.entry?.nombre||'Club',players,hasWorld:!!world};
}
