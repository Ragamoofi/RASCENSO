import test from 'node:test';
import assert from 'node:assert/strict';
import {resolveClub,loadClubSquad} from '../src/club-squads495.mjs';

const index={
 '11':{nombre:'Club Atlético Boca Juniors',pais_id_fm:'187',n_primer_equipo:27,n_jugadores:34},
 '12':{nombre:'Boca Juniors',pais_id_fm:'190',n_primer_equipo:22,n_jugadores:31},
 '13':{nombre:'Club Social de Deportes Colo Colo',pais_id_fm:'190',n_primer_equipo:28,n_jugadores:36}
};
const mappings={mapping:{},countries:{AR:'187',CL:'190'}};
const player={id:'fm26:101',nombre:'Futbolista real de prueba',edad:22,posiciones:['MC'],ca_fm:110,nacion_fm:'187',equipo_slot:0};

test('enlace automático inequívoco para club de RASCENSO según nombre y país',()=>{
 const r=resolveClub({kind:'game',id:'ar-1'},index,mappings);
 assert.equal(r.uid,'11');assert.equal(r.linkStatus,'nombre-pais');assert.equal(r.simulationMapped,false);
});
test('un homónimo de otro país nunca desplaza el club correcto',()=>{
 const r=resolveClub({kind:'game',id:'ar-1'},index,mappings);
 assert.equal(r.entry.pais_id_fm,'187');
});
test('el país obtenido del identificador FM permite enlace incluso sin ancla previa',()=>{
 const r=resolveClub({kind:'game',id:'ar-1'},index,{mapping:{},countries:{}});
 assert.equal(r.uid,'11');
});
test('si hay dos equivalentes del mismo país no se inventa una identidad',()=>{
 const x={...index,'14':{nombre:'Boca Juniors FC',pais_id_fm:'187',n_primer_equipo:26,n_jugadores:26}};
 const r=resolveClub({kind:'game',id:'ar-1'},x,mappings);
 assert.equal(r.uid,null);assert.ok(r.candidates.length>=2);
});
test('sin ninguna identidad de país fiable no hay enlace automático',()=>{
 const badIndex={'22':{nombre:'Boca Juniors',pais_id_fm:'99999',n_primer_equipo:26,n_jugadores:26}};
 const r=resolveClub({kind:'game',id:'ar-1'},badIndex,{mapping:{},countries:{}});
 assert.equal(r.uid,null);assert.ok(r.candidates.length>0);
});
test('se muestra plantel original sin borrar fichas o modificar el guardado',async()=>{
 const before={fm26:{year:2026,changes:{}}};
 const api={getWorldMappingInfo:async()=>mappings,getWorldIndex:async()=>index,
  readWorldClub:async uid=>uid==='11'?{name:'Club Atlético Boca Juniors',players:[player]}:null,
  getWorldPlayer:async()=>null};
 const actual=await loadClubSquad({kind:'game',id:'ar-1'},before,api);
 assert.equal(actual.players.length,1);assert.equal(actual.players[0].name,player.nombre);
 assert.deepEqual(before,{fm26:{year:2026,changes:{}}});
});
test('si falta correspondencia, ofrece búsqueda y no inventa jugadores',async()=>{
 const unknown={'77':{nombre:'Boca Juniors',pais_id_fm:'99999',n_primer_equipo:26,n_jugadores:26}};
 const api={getWorldMappingInfo:async()=>({mapping:{},countries:{}}),getWorldIndex:async()=>unknown,
  readWorldClub:async()=>{throw Error('No debería consultarse sin UID')},getWorldPlayer:async()=>null};
 const data=await loadClubSquad({kind:'game',id:'ar-1'},{},api);
 assert.equal(data.players.length,0);assert.equal(data.linkStatus,'sin-enlace');assert.ok(data.candidates.length);
});
