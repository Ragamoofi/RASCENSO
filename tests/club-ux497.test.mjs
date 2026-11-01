import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {renderClub497} from '../src/club-ui495.mjs';
import {resolveClub,loadClubSquad} from '../src/club-squads495.mjs';
import {isFemaleClubRecord497,isFemalePlayerRecord497,filterWorldIndex497,filterWorldDirectory497,filterWorldShard497} from '../src/world-gender497.mjs';
const player=(id,name,pos='MC')=>({id,name,age:23,ovr:83,cc:'CL',pos,source:'base'});
// IDs del catálogo real: cl-extra-9 = Santiago Wanderers; cl-1 = Colo-Colo.
const fixture={name:'Santiago Wanderers',club:{id:'cl-extra-9',name:'Santiago Wanderers',country:'Chile',league:'Liga de Ascenso',level:71},players:[player('fm26:1','Jugador Prueba'),player('fm26:2','Otro Futbolista','GK')],hasWorld:true};
test('la ficha muestra únicamente club, plantilla y filtros de sus futbolistas',()=>{
 const html=renderClub497(fixture);
 assert.match(html,/Santiago Wanderers/);assert.match(html,/Jugador Prueba/);
 assert.match(html,/Porteros/);assert.match(html,/Mediocampistas/);
 assert.doesNotMatch(html,/data-world-find|data-world-results|club495-suggestions|Buscar plantilla original/);
 assert.match(html,/data-search/);assert.match(html,/data-group/);assert.match(html,/data-sort/);
});
test('filtros por nombre y posición solo modifican el plantel visible',()=>{
 const html=renderClub497(fixture,{query:'Prueba',group:'Mediocampistas'});
 assert.match(html,/Jugador Prueba/);assert.doesNotMatch(html,/Otro Futbolista/);
});
test('si no hay enlace, no inventa jugadores ni propone clubes dentro de la ficha',()=>{
 const html=renderClub497({...fixture,players:[],hasWorld:false});
 assert.match(html,/Plantilla aún no disponible/);assert.match(html,/Mundo → Explorar clubes/);
 assert.doesNotMatch(html,/data-world-find|data-world-uid/);
});
test('equivalencia por nombre exacto y país acepta clubes con n_primer_equipo = 0',()=>{
 const index={'17':{nombre:'Club de Deportes Santiago Wanderers',pais_id_fm:'190',n_jugadores:30,n_primer_equipo:0}};
 const mapped=resolveClub({kind:'game',id:'cl-extra-9'},index,{mapping:{},countries:{CL:'190'}});
 assert.equal(mapped.uid,'17');assert.equal(mapped.linkStatus,'nombre-pais');
});
test('no atribuye a Colo-Colo la plantilla de Santiago Wanderers',()=>{
 const index={'17':{nombre:'Club de Deportes Santiago Wanderers',pais_id_fm:'190',n_jugadores:30,n_primer_equipo:0}};
 const mapped=resolveClub({kind:'game',id:'cl-1'},index,{mapping:{},countries:{CL:'190'}});
 assert.equal(mapped.uid,null);
 assert.equal(mapped.linkStatus,'sin-enlace');
});
test('una razón social verificada tiene prioridad frente a una variante abreviada del mismo país',()=>{
 const index={'17':{nombre:'Club de Deportes Santiago Wanderers',pais_id_fm:'190',n_jugadores:30,n_primer_equipo:0},'18':{nombre:'Santiago Wanderers',pais_id_fm:'190',n_jugadores:28,n_primer_equipo:0}};
 const mapped=resolveClub({kind:'game',id:'cl-extra-9'},index,{mapping:{},countries:{CL:'190'}});
 assert.equal(mapped.uid,'17');
});
test('el filtro usa marcas explícitas de club/registro y no deduce sexo de nombres personales',()=>{
 assert.equal(isFemaleClubRecord497('40',{nombre:'Arsenal Women'}),true);
 assert.equal(isFemaleClubRecord497('41',{nombre:'Club Deportivo Femenino'}),true);
 assert.equal(isFemaleClubRecord497('42',{nombre:'Arsenal FC'}),false);
 assert.equal(isFemalePlayerRecord497({id:'fm26:98765',nombre:'Alex Morgan',gender:'female'}),true);
 assert.equal(isFemalePlayerRecord497({id:'fm26:98764',nombre:'Alex Morgan'}),false);
});
test('índice, directorio y shards excluyen clubes femeninos identificados',()=>{
 const index=filterWorldIndex497({'1':{nombre:'Arsenal Women'},'2':{nombre:'Arsenal FC'}});
 assert.deepEqual(Object.keys(index),['2']);
 const rows=filterWorldDirectory497([['fm26:1','A',20,'MC',70,'1'],['fm26:2','B',23,'MC',70,'2']],index);
 assert.deepEqual(rows.map(x=>x[0]),['fm26:2']);
 const data=filterWorldShard497({clubes:[{club_uid:'1',nombre:'Arsenal Women',jugadores:[]},{club_uid:'2',nombre:'Arsenal FC',jugadores:[{id:'fm26:3',gender:'female'},{id:'fm26:4',nombre:'Jugador'}]}]});
 assert.equal(data.clubes.length,1);assert.deepEqual(data.clubes[0].jugadores.map(x=>x.id),['fm26:4']);
});
test('los estilos de la ficha se publican dentro de src, no se pierden en GitHub Pages',()=>{
 const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
 assert.match(html,/src\/club497\.css\?v=501/);
 assert.doesNotMatch(html,/href="\.\/club495\.css/);
});

test('dos UIDs idénticos con misma razón social y país quedan sin enlace automático',()=>{
 const index={'17':{nombre:'Club de Deportes Santiago Wanderers',pais_id_fm:'190',n_jugadores:30,n_primer_equipo:0},
  '18':{nombre:'Club de Deportes Santiago Wanderers',pais_id_fm:'190',n_jugadores:28,n_primer_equipo:0}};
 const mapped=resolveClub({kind:'game',id:'cl-extra-9'},index,{mapping:{},countries:{CL:'190'}});
 assert.equal(mapped.uid,null);
});
test('Universidad Católica jugable abre su razón social original en Chile',()=>{
 const index={'506':{nombre:'Club Deportivo Universidad Católica',pais_id_fm:'190',n_jugadores:48,n_primer_equipo:25}};
 const mapped=resolveClub({kind:'game',id:'cl-3'},index,{mapping:{},countries:{CL:'190'}});
 assert.equal(mapped.uid,'506');
});
test('Iquique jugable abre su plantilla original sin mezclar Iquique de otro país',()=>{
 const index={'501':{nombre:'Club de Deportes Iquique',pais_id_fm:'190',n_jugadores:33,n_primer_equipo:29},
  '777':{nombre:'Club de Deportes Iquique',pais_id_fm:'170',n_jugadores:28,n_primer_equipo:27}};
 const mapped=resolveClub({kind:'game',id:'cl-extra-3'},index,{mapping:{},countries:{CL:'190'}});
 assert.equal(mapped.uid,'501');
});

test('ficha jugable y ficha mundial de Católica consultan el mismo UID y jugadores reales',async()=>{
 const idx={'506':{nombre:'Club Deportivo Universidad Católica',pais_id_fm:'190',n_jugadores:48,n_primer_equipo:25}};
 const raw=Array.from({length:25},(_,i)=>({id:'fm26:'+(800+i),nombre:'Jugador real '+i,edad:25,posiciones:['MC'],ca_fm:130,nacion_fm:143,equipo_slot:0}));
 const api={getWorldMappingInfo:async()=>({mapping:{},countries:{CL:'190'}}),getWorldIndex:async()=>idx,
  readWorldClub:async uid=>uid==='506'?{uid,name:idx[uid].nombre,players:raw}:null,getWorldPlayer:async()=>null};
 const game=await loadClubSquad({kind:'game',id:'cl-3'},{world:{year:2027,players:[]}},api);
 const world=await loadClubSquad({kind:'world',id:'506'},{},api);
 assert.equal(game.uid,'506');assert.equal(game.players.length,25);
 assert.deepEqual(game.players.map(p=>p.id),world.players.map(p=>p.id));
 assert.ok(game.players.every(p=>p.id.startsWith('fm26:')));
});

test('ficha mundial de la Católica enlaza de vuelta a su club jugable sin adivinar el país',()=>{
 const index={'506':{nombre:'Club Deportivo Universidad Católica',pais_id_fm:'190',n_jugadores:48,n_primer_equipo:25}};
 const mapped=resolveClub({kind:'world',id:'506'},index,{mapping:{},countries:{CL:'190'}});
 assert.equal(mapped.gameId,'cl-3');
});
