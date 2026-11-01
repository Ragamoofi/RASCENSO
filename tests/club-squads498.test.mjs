import test from 'node:test';
import assert from 'node:assert/strict';
import {resolveClub,loadClubSquad,selectOriginalSquad498,shouldFillWithGenerated498} from '../src/club-squads495.mjs';

const raw=(id,slot=0,ca=110)=>({id:`fm26:${id}`,nombre:`Futbolista ${id}`,edad:23,ca_fm:ca,pa_fm:ca+5,na_fm:143,nacion_fm:143,posiciones:['MC'],equipo_slot:slot});
const api=(id,club,players,mapping={mapping:{},countries:{CL:'190',ES:'170'}})=>({
 getWorldMappingInfo:async()=>mapping,
 getWorldIndex:async()=>({[id]:club}),
 readWorldClub:async uid=>uid===String(id)?{uid:String(uid),name:club.nombre,players}:null,
 getWorldPlayer:async()=>null
});
const madrid={nombre:'Real Madrid',pais_id_fm:'170',n_jugadores:92,n_primer_equipo:27};
const iquique={nombre:'Club de Deportes Iquique S.A.D.P.',pais_id_fm:'190',n_jugadores:26,n_primer_equipo:0};

test('club con razón social chilena: Iquique muestra equipo sin asignar otro club',()=>{
 const r=resolveClub({kind:'game',id:'cl-extra-3'},{'93':iquique},{mapping:{},countries:{CL:'190'}});
 assert.equal(r.uid,'93');
 const other=resolveClub({kind:'game',id:'cl-extra-3'}, {'93':{...iquique,pais_id_fm:'170'}},{mapping:{},countries:{CL:'190'}});
 assert.equal(other.uid,null);
});
test('homónimos por país bloquean asociaciones falsas',()=>{
 const idx={'93':iquique,'94':{...iquique,nombre:'Deportes Iquique SADP'}};
 assert.equal(resolveClub({kind:'game',id:'cl-extra-3'},idx,{mapping:{},countries:{CL:'190'}}).uid,null);
});
test('no presenta 92 jugadores de todas las categorías del Real Madrid',async()=>{
 const all=[...Array.from({length:27},(_,i)=>raw(i,0,150-i)),...Array.from({length:65},(_,i)=>raw(100+i,2,80-i))];
 const m={mapping:{'es-1':{fmUID:'1734'}},countries:{ES:'170'}};
 const s={world:{year:2026,players:[]},fm26:{year:0,changes:{}}};
 const result=await loadClubSquad({kind:'game',id:'es-1'},s,api('1734',madrid,all,m));
 assert.equal(result.rawTotal,92);assert.equal(result.players.length,27);
 assert.ok(result.players.every(p=>p.id.startsWith('fm26:')));
 assert.equal(result.generatedCount,0);
});
test('sin etiquetas de primer equipo, elige máximo 30 jugadores reales',()=>{
 const all=Array.from({length:92},(_,i)=>raw(i,1,130-i));
 const a=selectOriginalSquad498(all);
 assert.equal(a.length,30);
 assert.ok(a.every(p=>p.id.startsWith('fm26:')));
});
test('2027 no agrega NPC aunque el motor tenga veteranos inventados',async()=>{
 const all=Array.from({length:12},(_,i)=>raw(i,0,100-i));
 const npc=Array.from({length:25},(_,i)=>({id:`n${i}`,name:`NPC ${i}`,clubId:'es-1',kind:'prospect',status:'active',ovr:66,age:18,pos:'MC'}));
 const m={mapping:{'es-1':{fmUID:'1734'}},countries:{ES:'170'}};
 const r=await loadClubSquad({kind:'game',id:'es-1'},
   {world:{year:2027,players:npc},fm26:{changes:{}}},api('1734',madrid,all,m));
 assert.equal(r.players.length,12);assert.equal(r.generatedCount,0);
});
test('2032 incorpora solamente juveniles necesarios tras bajar de 18 reales',async()=>{
 const all=Array.from({length:12},(_,i)=>raw(i,0,100-i));
 const npc=Array.from({length:25},(_,i)=>({id:`n${i}`,name:`NPC ${i}`,clubId:'es-1',kind:'prospect',status:'active',ovr:66,age:18,pos:'MC'}));
 const m={mapping:{'es-1':{fmUID:'1734'}},countries:{ES:'170'}};
 const r=await loadClubSquad({kind:'game',id:'es-1'},
   {world:{year:2032,players:npc},fm26:{changes:{}}},api('1734',madrid,all,m));
 assert.equal(r.players.length,18);assert.equal(r.generatedCount,6);
});
test('no rellena si hay 18 futbolistas reales',()=>{
 assert.equal(shouldFillWithGenerated498({world:{year:2038}},18),false);
 assert.equal(shouldFillWithGenerated498({world:{year:2027}},6),false);
 assert.equal(shouldFillWithGenerated498({world:{year:2038}},17),true);
});

test('el visor evita mostrar una plantilla con doce arqueros',()=>{
 const all=[...Array.from({length:12},(_,i)=>({...raw(i,0,190-i),posiciones:['GK']})),...Array.from({length:25},(_,i)=>raw(100+i,0,150-i))];
 const selected=selectOriginalSquad498(all);
 assert.ok(selected.filter(p=>p.posiciones.includes('GK')).length<=4);
 assert.ok(selected.length<=30);
});
