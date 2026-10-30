import assert from 'node:assert/strict';
import { test } from 'node:test';
import { COUNTRIES } from '../src/countries.mjs';
import { newCareer, currentDraft, acceptDraft, academyOffers, signAcademy, advanceSeason, resolveEvent, finishEvent, autoResolveEvent, eventInfo, chooseTransfer, transferOffers, simulateToRetirement, getCountry, careerYear, migrateCareer } from '../src/engine.mjs';
function makeStarted(country='CL',seed='test-49'){
 let s=newCareer({name:'Sariego',country,position:'DC',mode:'Clásico',seed});
 while(s.phase==='draft')s=acceptDraft(s);
 s=signAcademy(s,academyOffers(s)[0].id);
 s=autoResolveEvent(s);
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

test('Origen, personalidad y estilo quedan registrados y afectan la progresión',()=>{
 let s=newCareer({name:'Jugador',country:'CL',age:18,city:'La Cisterna',origin:'amateur',personality:'ambicioso',style:'goleador',dream:'seleccion',story:'Quiero representar a mi país.',seed:'test-rol'});
 assert.equal(careerYear(s),2026);assert.equal(s.age,18);assert.equal(s.city,'La Cisterna');
 assert.equal(s.origin,'amateur');assert.equal(s.personality,'ambicioso');assert.equal(s.style,'goleador');
 while(s.phase==='draft')s=acceptDraft(s);s=autoResolveEvent(signAcademy(s,academyOffers(s)[0].id));
 const season=advanceSeason(s);assert.equal(season.lastSeason.year,2026);assert.equal(season.age,19);assert.equal(careerYear(season),2027);
});
test('Las partidas previas pueden migrarse sin borrar estadísticas',()=>{
 const prev={...newCareer({name:'Veterano',country:'CL',seed:'prev'}),version:1,phase:'season',clubId:'x',age:25,history:[{matches:28,goals:6}],ovr:70};
 const updated=migrateCareer(prev);assert.equal(updated.version,3);assert.equal(updated.history[0].goals,6);assert.equal(updated.name,'Veterano');
 assert.equal(migrateCareer(null),null);
});

test('Elegir equipo de hincha es opcional y se guarda sin alterar ofertas iniciales',()=>{
 const a=newCareer({name:'Chileno',country:'CL',fanClubId:'cl-1',seed:'hincha'});
 const b=newCareer({name:'Chileno',country:'CL',seed:'hincha'});
 assert.equal(a.fanClubId,'cl-1');assert.equal(b.fanClubId,null);
 assert.deepEqual(academyOffers(a),academyOffers(b));
 assert.equal(migrateCareer({...a,version:2}).fanClubId,'cl-1');
 assert.equal(newCareer({name:'Test',fanClubId:'inventado'}).fanClubId,null);
});
test('Los intercambios narrativos conservan texto, vínculos, consecuencias y memoria',()=>{
 let s=newCareer({name:'Sariego',country:'CL',fanClubId:'cl-1',seed:'escena'});
 while(s.phase==='draft')s=acceptDraft(s);
 const club=academyOffers(s)[0];s=signAcademy(s,club.id);
 assert.equal(s.phase,'event');const e=eventInfo(s);assert.equal(e.options.length,3);
 const title=e.title;const oldTrust=s.relationships.coach.trust;
 const first=resolveEvent(s,0,'Mi palabra es compromiso y esfuerzo.');
 assert.equal(first.sceneBeat,1);assert(first.storyLog.at(-1).words.includes('compromiso'));
 assert.equal(first.storyLog.at(-1).title,title);
 assert.equal(first.storyLog.length,1);assert(first.relationships.coach.trust!==oldTrust||s.pendingEvent==='fan_home');
 assert.equal(resolveEvent(first,2).storyLog.length,1,'no aplicar dos veces la decisión');
 s=finishEvent(first);assert.equal(s.phase,'season');assert.equal(s.storyLog.length,1);
 assert.deepEqual(migrateCareer(s).storyLog,s.storyLog);
});
test('El club favorito no se fuerza entre los fichajes ni garantiza recibir una oferta',()=>{
 let s=makeStarted('CL','chance-offers');s={...s,fanClubId:'ar-1'};
 for(let i=0;i<2;i++){s=advanceSeason(s);s=autoResolveEvent(s);if(s.phase==='transfer')s=chooseTransfer(s);}
 const a=transferOffers(s);const b=transferOffers({...s,fanClubId:null});
 assert.deepEqual(a.map(x=>x.id),b.map(x=>x.id));
});
test('Fichar por el club favorito dispara escena especial y marca la memoria',()=>{
 let s=makeStarted('CL','favorito');s={...s,fanClubId:'cl-1',phase:'transfer',offers:[getCountry('CL').clubs[0].id]};
 s={...s,offers:[{...getCountry('CL').clubs[0],country:'Chile'}]};
 if(s.clubId==='cl-1')s={...s,clubId:'cl-2'};
 s=chooseTransfer(s,'cl-1');
 assert.equal(s.pendingEvent,'fan_home');assert.equal(s.phase,'event');
 s=autoResolveEvent(s);assert.equal(s.storyFlags.playedForFan,true);assert(s.storyLog.some(x=>x.tag==='CUMPLIR UN SUEÑO'));
});
test('Migrar una partida v2 conserva temporada y añade relaciones y bitácora',()=>{
 const original=makeStarted('CL','migracion');const v2={...original,version:2};
 delete v2.relationships;delete v2.storyLog;delete v2.fanClubId;
 const m=migrateCareer(v2);assert.equal(m.version,3);assert(m.relationships.coach);assert.deepEqual(m.storyLog,[]);
 assert.equal(m.history.length,original.history.length);
});
