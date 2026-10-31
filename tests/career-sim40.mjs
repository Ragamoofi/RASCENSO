/* Carreras completas, países y puestos distintos; comprobaciones sobre datos conservados. */
import assert from 'node:assert/strict';
import {newCareer,acceptDraft,academyOffers,signAcademy,autoResolveEvent,simulateToRetirement,migrateCareer} from '../src/engine.mjs';
for(const [country,position] of [['CL','DC'],['AR','DFC'],['FR','MC'],['JP','POR']]){
 let s=newCareer({name:`Prueba ${country}`,country,position,age:17,seed:`career40-${country}-${position}`});
 while(s.phase==='draft')s=acceptDraft(s);const offers=academyOffers(s);assert.ok(offers.length);s=signAcademy(s,offers[0].id);s=autoResolveEvent(s);
 s=simulateToRetirement(s);assert.equal(s.phase,'retired',`${country}/${position}`);assert.ok(s.history.length>=8);
 for(let i=0;i<s.history.length;i++){const h=s.history[i];assert.ok(h.matches>=0&&h.goals>=0&&h.assists>=0);if(i)assert.ok(h.year>s.history[i-1].year);
  if(h.calledUp===false)assert.equal(h.nationalCaps||0,0);
  for(const f of h.playerMatches||[])assert.match(f.score,/^\d+-\d+$/);
 }
 const restored=migrateCareer(JSON.parse(JSON.stringify(s)));assert.equal(restored.history.length,s.history.length);assert.equal(restored.phase,'retired');
 console.log(`${country}/${position}: ${s.history.length} temporadas · retiro ${s.age} años · ${s.history.reduce((n,h)=>n+(h.nationalCaps||0),0)} partidos internacionales`);
}
