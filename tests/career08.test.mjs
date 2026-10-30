import test from 'node:test';
import assert from 'node:assert/strict';
import {newCareer,acceptDraft,academyOffers,signAcademy,autoResolveEvent,advanceSeason,choosePreparation,migrateCareer,careerYear,simulateToRetirement} from '../src/engine.mjs';
import {ENVIRONMENTS,PUBLIC_IMAGES,RISK_PROFILES,DEVELOPMENT_PATHS,PREPARATIONS,archetypeFor,identityTraits,preparationEffects} from '../src/career08.mjs';
import {playLeague} from '../src/league.mjs';
import {STORY_IDS} from '../src/story.mjs';
import {legendPhoto} from '../src/legend-art.mjs';
function start(seed='test08'){let s=newCareer({name:'Protagonista',country:'CL',position:'DC',seed,environment:'club_formativo',publicImage:'referente',riskProfile:'audaz',developmentPath:'tactica'});while(s.phase==='draft')s=acceptDraft(s,0);s=signAcademy(s,academyOffers(s)[0].id);return autoResolveEvent(s);}
test('Cuatro ejes nuevos de identidad validados y persistentes',()=>{
 const s=newCareer({name:'Único',environment:'autodidacta',publicImage:'mediatico',riskProfile:'economico',developmentPath:'fisica',seed:'identity08'});
 assert.equal(s.version,7);assert.equal(s.environment,'autodidacta');assert.equal(s.publicImage,'mediatico');assert.equal(s.riskProfile,'economico');assert.equal(s.developmentPath,'fisica');
 for(const list of [ENVIRONMENTS,PUBLIC_IMAGES,RISK_PROFILES,DEVELOPMENT_PATHS])assert.equal(list.length,4);
 const bad=newCareer({name:'Validado',environment:'cualquier cosa',publicImage:'incorrecto'});assert.equal(bad.environment,'sin_contactos');assert.equal(bad.publicImage,'reservado');
});
test('Migración de v6 conserva historia y agrega rasgos nuevos sin borrar partida',()=>{
 let s=start('migration08');s=advanceSeason(s);const legacy={...s,version:6};delete legacy.environment;delete legacy.publicImage;
 const upgraded=migrateCareer(legacy);assert.equal(upgraded.version,7);assert.deepEqual(upgraded.history,s.history);assert.equal(upgraded.environment,'sin_contactos');assert.equal(upgraded.publicImage,'reservado');
});
test('Preparación se elige una vez por año y cambia la probabilidad deportiva',()=>{
 const s=start('preparation08');assert.equal(s.phase,'season');const a=choosePreparation(s,'definicion');assert.equal(a.preparation.year,careerYear(a));assert.equal(preparationEffects(a).goals,1.16);assert.strictEqual(choosePreparation(a,'creacion'),a);
 const b=choosePreparation(s,'tactica');assert.equal(preparationEffects(b).minutes,.08);
 assert.notDeepEqual(playLeague(a).standings,playLeague(b).standings);
 assert.notDeepEqual(playLeague(a).playerMatches,playLeague(b).playerMatches);
});
test('Eventos futbolísticos adicionales tienen consecuencias persistentes',()=>{
 for(const id of ['scouting','rotation','derby','captaincy'])assert.ok(STORY_IDS.includes(id));
 let s=start('events08');s=advanceSeason(s);assert.equal(s.phase,'event');s=autoResolveEvent(s);assert.equal(s.phase,'event');s=autoResolveEvent(s);assert.notEqual(s.phase,'event');
 assert.equal(s.annualScenes,1);assert.ok(s.storyLog.length>=2);
});
test('Títulos guardan competición, temporada, club y no se pierden',()=>{
 let s=start('titles08');s={...s,ovr:99,coachTrust:95};for(let i=0;i<6;i++){
  if(s.phase==='season')s=advanceSeason(s);
  else if(s.phase==='event')s=autoResolveEvent(s);
  else if(s.phase==='transfer')s=(awaitTransfer(s));
 }
 assert.ok(Array.isArray(s.trophyRecords));assert.ok(s.trophyRecords.every(t=>t.year&&t.clubId&&t.title));
});
function awaitTransfer(s){return {...s,phase:'season'};}
test('Legados generan perfil emergente y existen fotografías de archivo para ciertos nombres',()=>{
 let s=newCareer({name:'ADN',seed:'dna08'});while(s.phase==='draft')s=acceptDraft(s,0);
 const dna=archetypeFor(s);assert.ok(dna.name);assert.equal(s.footballDNA.name,dna.name);assert.ok(legendPhoto('Lionel Messi')?.includes('commons.wikimedia.org'));assert.equal(legendPhoto('Jugador no identificado'),null);
});
test('Autoretirada sigue funcionando con dos escenas por temporada',()=>{
 let s=start('retirement08');s=simulateToRetirement(s);assert.equal(s.phase,'retired');assert.ok(s.history.length>=18);
});
