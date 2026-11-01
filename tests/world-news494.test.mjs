import test from 'node:test';
import assert from 'node:assert/strict';
import {enrichWorld494,transferFee494,formatTransferFee494} from '../src/world-news494.mjs';

const clubs={
 'es-1':{name:'Real Madrid',prestige:97},
 'es-2':{name:'Barcelona',prestige:95},
 'cl-1':{name:'Colo-Colo',prestige:66}
};
const players={
 'fm26:1':{id:'fm26:1',name:'Kylian Mbappé',age:27,ovr:98,cc:'FR'},
 'fm26:2':{id:'fm26:2',name:'Jude Bellingham',age:23,ovr:95,cc:'EN'},
 'fm26:3':{id:'fm26:3',name:'Lamine Yamal',age:19,ovr:95,cc:'ES'},
 'fm26:4':{id:'fm26:4',name:'Andy Irving',age:26,ovr:73,cc:'SC'}
};
const mockValue=(player,club)=>{
 const young=player.age<=23?1.5:player.age<=28?1.22:player.age<=31?1:.65;
 const prestige=Math.max(.65,Math.min(1.35,(club?.prestige??78)/78));
 return Math.round(Math.max(35000,Math.pow(Math.max(1,player.ovr-42)/48,3)*37000000*young*prestige));
};
const helpers={
 getMeta:({id,name})=>players[id]||Object.values(players).find(p=>p.name===name)||null,
 getClub:id=>clubs[id]||null,
 getLive:()=>null,marketValue:mockValue
};
const example={country:'CL',age:18,world:{year:2027,
 awards:[{year:2026,ranking:[
  {id:'fm26:1',name:'Kylian Mbappé',cc:null,place:1,ovr:98},
  {id:'fm26:2',name:'Jude Bellingham',cc:'CL',place:2,ovr:95},
  {id:'fm26:3',name:'Lamine Yamal',place:3,ovr:95},
  {id:'you',name:'Jugador propio',you:true,place:4,cc:null,ovr:93}
 ]}],news:[
  {year:2026,kind:'transfer',playerId:'fm26:4',clubId:'es-1',title:'Andy Irving ficha por otro club',text:'Traspaso de es-2 a es-1'},
  {year:2026,kind:'injury',playerId:'fm26:4',title:'Andy Irving se lesiona',text:'Ausente 12 semanas.'},
  {year:2026,kind:'transfer',playerId:'fm26:9',title:'Jugador nuevo ficha por otro club',text:'Traspaso de cl-1 a es-2'}
 ]}};

test('Balón de Ascenso repara las cuatro banderas sin cambiar la partida',()=>{
 const original=structuredClone(example),copy=enrichWorld494(example,helpers),ranking=copy.world.awards[0].ranking;
 assert.deepEqual(ranking.map(p=>p.cc),['FR','EN','ES','CL']);
 assert.equal(ranking[0].ovr,98);
 assert.deepEqual(example,original);
});
test('Noticia de traspaso traduce IDs y muestra club destino, monto y moneda',()=>{
 const one=enrichWorld494(example,helpers).world.news[0];
 assert.match(one.title,/Andy Irving ficha por Real Madrid/);
 assert.match(one.text,/Barcelona → Real Madrid/);
 assert.match(one.text,/€[\d.,]+\s(?:M|mil)/);
 assert.match(one.text,/estimado/);
 assert.doesNotMatch(one.text,/\bes-\d+\b/);
 assert.equal(one.clubId,'es-1');
});
test('La ausencia de datos económicos no inventa cifras',()=>{
 const n=enrichWorld494(example,helpers).world.news[2];
 assert.match(n.text,/Colo-Colo/);assert.match(n.text,/Barcelona/);
 assert.doesNotMatch(n.text,/€|monto estimado/);
});
test('Lesiones intactas, no hay montos en otras noticias',()=>{
 const n=enrichWorld494(example,helpers).world.news[1];assert.deepEqual(n,example.world.news[1]);
});
test('Valoración coherente: élite > futbolista medio; edad y clubes importan',()=>{
 const young={ovr:95,age:21,pot:99},older={ovr:95,age:36,pot:95},average={ovr:68,age:21,pot:75};
 const elite=transferFee494(young,clubs['es-2'],clubs['es-1'],mockValue,'elite'),
  aging=transferFee494(older,clubs['es-2'],clubs['es-1'],mockValue,'aging'),
  regular=transferFee494(average,clubs['cl-1'],clubs['cl-1'],mockValue,'regular');
 assert.ok(elite>40000000,`elite ${elite}`);
 assert.ok(elite>aging&&aging>regular,`${elite} ${aging} ${regular}`);
 assert.equal(transferFee494(young,clubs['es-2'],clubs['es-1'],mockValue,'elite'),elite);
 assert.match(formatTransferFee494(elite),/^€[\d.,]+ M$/);
});
test('Noticias ya enriquecidas no repiten valoración',()=>{
 const once=enrichWorld494(example,helpers);const twice=enrichWorld494(once,helpers);
 assert.equal(once.world.news[0].text,twice.world.news[0].text);
});
