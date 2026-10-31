import test from 'node:test';
import assert from 'node:assert/strict';
import {selectWorldHeadlines} from '../src/world20.mjs';
import {newCareer,acceptDraft,academyOffers,signAcademy,autoResolveEvent,advanceSeason} from '../src/engine.mjs';

test('la prensa no puede llenar la portada solamente con despidos de entrenadores',()=>{
 const fresh=[
  ...Array.from({length:30},(_,i)=>({kind:'coach',title:'Técnico '+i,weight:i})),
  ...Array.from({length:4},(_,i)=>({kind:'transfer',title:'Fichaje '+i})),
  {kind:'rival',title:'Partido del rival'},
  {kind:'you',title:'Premio del protagonista',mine:true},
  {kind:'award',title:'Premio mundial'},
  {kind:'prospect',title:'Nueva promesa'}
 ];
 const items=selectWorldHeadlines(fresh);
 assert.ok(items.filter(x=>x.kind==='coach').length<=2);
 assert.ok(items.some(x=>x.kind==='you'));
 assert.ok(items.some(x=>x.kind==='transfer'));
 assert.ok(items.some(x=>x.kind==='prospect'));
 assert.ok(items.length<=18);
 assert.deepEqual(selectWorldHeadlines(fresh),items);
});
test('campeones y actuaciones propias mantienen prioridad editorial',()=>{
 const fresh=Array.from({length:9},(_,i)=>({kind:'champion',title:'Campeón '+i,mine:i===8}));
 fresh.push(...Array.from({length:22},(_,i)=>({kind:'coach',title:'DT '+i})));
 fresh.push({kind:'you',title:'Actuación real',mine:true});
 const picked=selectWorldHeadlines(fresh);
 assert.equal(picked.filter(x=>x.kind==='champion').length,5);
 assert.equal(picked.filter(x=>x.kind==='coach').length,2);
 assert.ok(picked.some(x=>x.kind==='champion'&&x.mine));
 assert.ok(picked.some(x=>x.kind==='you'));
});
test('la simulación anual sigue produciendo noticias reales dentro del límite',()=>{
 let s=newCareer({name:'Prueba Prensa',country:'CL',position:'DC',age:17,seed:'prensa42'});
 while(s.phase==='draft')s=acceptDraft(s);
 s=signAcademy(s,academyOffers(s)[0].id);s=autoResolveEvent(s);
 s=advanceSeason(s);
 assert.ok(s.world.news.length>0&&s.world.news.length<=90);
 const coaches=s.world.news.filter(x=>x.kind==='coach'&&x.year===s.lastSeason.year);
 assert.ok(coaches.length<=2);
});
