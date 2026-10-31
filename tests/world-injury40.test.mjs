import test from 'node:test';
import assert from 'node:assert/strict';
import {npcInjury,newsIcon} from '../src/world20.mjs';
test('las lesiones del mundo son reproducibles y reducen disponibilidad',()=>{
 let count=0;for(let i=0;i<1000;i++){const a=npcInjury('injury-'+i,27);assert.deepEqual(a,npcInjury('injury-'+i,27));assert.ok(a.weeks>=0&&a.weeks<=14);if(a.weeks){count++;assert.ok(a.availability<1);}else assert.equal(a.availability,1);}
 assert.ok(count>30&&count<150);assert.equal(newsIcon('injury'),'✚');
});
test('las lesiones registradas corresponden a temporadas simuladas y noticias verificables',async()=>{
 const {newCareer,acceptDraft,academyOffers,signAcademy,autoResolveEvent,advanceSeason}=await import('../src/engine.mjs');
 let s=newCareer({name:'Prueba mundo',country:'CL',seed:'injury-world'});while(s.phase==='draft')s=acceptDraft(s);s=autoResolveEvent(signAcademy(s,academyOffers(s)[0].id));
 const after=advanceSeason(s);const year=after.lastSeason.year;const seasons=after.world.players.flatMap(p=>(p.seasons||[]).filter(x=>x.year===year));
 assert.ok(seasons.length>0);assert.ok(seasons.some(x=>x.injuryWeeks>0));
 for(const x of seasons){assert.ok(x.injuryWeeks>=0&&x.injuryWeeks<=14);assert.ok(x.apps<=34);}
 for(const n of after.world.news.filter(n=>n.kind==='injury'&&n.year===year)){
  const p=after.world.players.find(p=>p.id===n.playerId);assert.ok(p);assert.ok(p.seasons.some(x=>x.year===year&&x.injuryWeeks>=8));
 }
});
