import assert from 'node:assert/strict';
import { test } from 'node:test';
import { COUNTRIES } from '../src/countries.mjs';
import { newCareer, currentDraft, acceptDraft, academyOffers, signAcademy, advanceSeason, resolveEvent, chooseTransfer, simulateToRetirement, getCountry } from '../src/engine.mjs';
function makeStarted(country='CL',seed='test-49'){
 let s=newCareer({name:'Sariego',country,position:'DC',mode:'Clásico',seed});
 while(s.phase==='draft')s=acceptDraft(s);
 s=signAcademy(s,academyOffers(s)[0].id);
 return s;
}
test('49 nacionalidades con tres clubes reales semilla como mínimo',()=>{
 assert.equal(COUNTRIES.length,49);assert(COUNTRIES.every(c=>c.clubs.length>=3));
 assert(COUNTRIES.every(c=>c.clubs.every(x=>x.id&&x.name&&Number.isFinite(x.level))));
});
test('Chile ofrece tres clubes del país y nunca clubes extranjeros al iniciar',()=>{
 const s=makeStarted();assert.equal(s.phase,'season');
 assert.equal(getCountry(s.country).name,'Chile');
 const d=newCareer({name:'X',country:'CL',position:'POR',seed:'test-49'});
 assert.equal(academyOffers(d).length,3);
 assert(academyOffers(d).every(c=>c.countryCode==='CL'));
});
test('Draft completa ocho atributos, OVR y potencial',()=>{
 let s=newCareer({name:'Prueba',country:'CL',position:'POR',seed:'same'});
 let count=0;while(s.phase==='draft'){assert(currentDraft(s));s=acceptDraft(s);count++;}
 assert.equal(count,8);assert.equal(Object.keys(s.attributes).length,8);
 assert(s.potential>s.ovr);assert.equal(academyOffers(s).length,3);
 assert(academyOffers(s).every(c=>c.countryCode==='CL'));
});
test('Simulación determinista',()=>{
 const a=advanceSeason(makeStarted('CL','same-seed'));
 const b=advanceSeason(makeStarted('CL','same-seed'));
 assert.deepEqual(a.lastSeason,b.lastSeason);
 assert(a.lastSeason.matches>=0&&a.lastSeason.matches<=42);
});
test('Avanza desde un club local hasta retiro a los 40 con 24 temporadas',()=>{
 let s=makeStarted('CL','full-run');
 s=simulateToRetirement(s);
 assert.equal(s.phase,'retired');assert.equal(s.age,40);
 assert.equal(s.history.length,24);
 assert(s.history.every(x=>x.matches>=0&&x.goals>=0&&x.assists>=0));
});

test('Cada uno de los 49 países devuelve exactamente tres ofertas propias',()=>{
 for(const c of COUNTRIES){
  const s=newCareer({name:'Prueba',country:c.code,position:'MC',seed:`territorio-${c.code}`});
  const offers=academyOffers(s);
  assert.equal(offers.length,3,`Faltan ofertas en ${c.name}`);
  assert(offers.every(o=>o.countryCode===c.code),`Club extranjero en ${c.name}`);
  assert.equal(new Set(offers.map(o=>o.id)).size,3,`Club repetido en ${c.name}`);
 }
});
