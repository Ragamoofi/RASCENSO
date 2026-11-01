import {getWorldMappingInfo,getWorldIndex,readWorldClub,getWorldPlayer} from './fm26-universe.mjs';
import {fm26OVR,fm26Position,applyFM26Delta} from './fm26-real.mjs';
import {fmNationToCode} from './fm26-nations.mjs';
import {getClub} from './engine.mjs';
import {isExcludedPlayer} from './world-exclusions.mjs';

// Correspondencias contrastadas con el nombre completo, país y plantel del índice mundial.
const explicit={'cl-extra-15':{uid:'130779',country:'190',name:'Club de Deportes Santiago Morning'},'cl-extra-14':{uid:'130788',country:'190',name:'Club Social de Deportes Rangers de Talca'},'en-2':{uid:'676',country:'139',name:'Liverpool'}};
function explicitMatch(id,index){const x=explicit[id],entry=x&&index[x.uid];return entry&&String(entry.pais_id_fm)===x.country&&entry.nombre===x.name?x.uid:null}
// El UID mundial es la identidad primaria; sólo se enlaza con una equivalencia aprobada.
export function resolveClub(ref,index,mappings){
 const mapping=mappings?.mapping||{};
 if(ref.kind==='game'){
  const club=getClub(ref.id),match=mapping[ref.id],uid=match?.fmUID||explicitMatch(ref.id,index);
  return {gameId:ref.id,uid:uid||null,club,entry:uid?index[uid]:null,simulationMapped:!!match};
 }
 const uid=String(ref.id),entry=index[uid];
 const matches=Object.entries(mapping).filter(([,v])=>String(v.fmUID)===uid);
 const explicitIds=Object.keys(explicit).filter(id=>explicitMatch(id,index)===uid);
 const gameId=matches.length===1?matches[0][0]:matches.length===0&&explicitIds.length===1?explicitIds[0]:null;
 return {uid,entry,gameId,club:gameId?getClub(gameId):null,simulationMapped:matches.length===1};
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
 const info=resolveClub(ref,index||{},mappings),world=info.uid?await api.readWorldClub(info.uid):null;
 const changes=state?.fm26?.changes||{},seen=new Set(),players=[];
 const add=(raw,originId)=>{if(!raw?.id||isExcludedPlayer(raw.id)||seen.has(raw.id))return;const p=snapshotPlayer(raw,originId,state,info.simulationMapped);
  if(p.status==='retired'||p.clubId!==info.gameId&&info.gameId!==null)return;
  if(info.gameId===null&&changes[p.id]?.clubId!==undefined)return;
  seen.add(p.id);players.push({...p,source:changes[p.id]?'simulado':'base'});
 };
 for(const raw of world?.players||[])add(raw,info.gameId);
 // La ficha original del futbolista transferido puede estar en otro shard aún no cargado.
 if(info.gameId){const inbound=Object.entries(changes).filter(([id,d])=>d.clubId===info.gameId&&!seen.has(id)&&d.status!=='retired');
  for(const [id] of inbound){const raw=await api.getWorldPlayer(id);if(raw)add(raw,info.gameId);}
  for(const p of state.world?.players||[]){if(p.clubId!==info.gameId||p.status==='retired'||isExcludedPlayer(p.id)||seen.has(p.id))continue;
   // Cuando hay datos reales, no presentar veteranos ficticios como sustitutos.
   if(world&&p.kind!=='gen'&&p.kind!=='prospect')continue;
   seen.add(p.id);players.push({...p,source:'simulado'});
  }
  if(state.clubId===info.gameId&&state.name){players.push({id:'career-player',name:state.name,age:state.age,pos:state.position,ovr:state.ovr,cc:state.country,source:'tu carrera'});}
 }
 return {...info,name:info.club?.name||world?.name||info.entry?.nombre||'Club',players,hasWorld:!!world};
}
