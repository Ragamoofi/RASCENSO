import test from 'node:test';
import assert from 'node:assert/strict';
import {newCareer,draftChoices,acceptDraft,academyOffers,signAcademy,autoResolveEvent,advanceSeason,migrateCareer,getClub,eventInfo,resolveEvent} from '../src/engine.mjs';
import {standoutMatch,matchContext,seasonReview,chatContext,chatPrompt} from '../src/career10.mjs';
import {sceneFor} from '../src/story.mjs';
function ready(seed='c10'){
 let state=newCareer({name:'Jugador de prueba',country:'CL',position:'DC',seed});
 while(state.phase==='draft')state=acceptDraft(state,0);
 return autoResolveEvent(signAcademy(state,academyOffers(state)[0].id));
}
test('Cada temporada comienza con recapitulación basada en partidos simulados, sin reemplazar evento',()=>{
 const before=ready('recap10'); const after=advanceSeason(before);
 assert.equal(after.phase,'event');assert.equal(after.recapPending,true);
 const review=seasonReview(after,getClub);
 assert.equal(review.year,after.lastSeason.year);assert.equal(review.goals,after.lastSeason.goals);
 assert.equal(review.position,after.lastSeason.leaguePosition);
 assert.ok(review.voice.quote);assert.equal(review.summary.length>=3,true);
 assert.ok(Array.isArray(after.lastSeason.playerMatches));
 assert.equal(migrateCareer(after).recapPending,true);
});
test('Partido destacado es un partido existente en los resultados, con rival y marcador verificables',()=>{
 const s=advanceSeason(ready('match10'));const m=standoutMatch(s);
 assert.ok(m);assert.ok(s.lastSeason.playerMatches.some(f=>f.home===m.home&&f.away===m.away&&f.score===m.score&&f.round===m.round));
 const ctx=matchContext(s,getClub);assert.ok(ctx.opponentName);assert.ok(ctx.homeName);assert.ok(ctx.awayName);
 const [homeGoals,awayGoals]=ctx.score.split('-').map(Number);
 assert.equal(ctx.ourGoals,ctx.isHome?homeGoals:awayGoals);
 assert.equal(ctx.theirGoals,ctx.isHome?awayGoals:homeGoals);
 const scene=sceneFor({...s,pendingEvent:'rival'});
 assert.match(scene.title,new RegExp(ctx.opponentName.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));
 assert.ok(scene.paragraphs.join(' ').includes(ctx.score));
 assert.doesNotMatch(scene.title,/Se aproxima un partido decisivo/i);
});
test('Escena de clásico posterior a temporada cita adversario real, no un rival futuro inventado',()=>{
 const s=advanceSeason(ready('derby10'));const ctx=matchContext(s,getClub);
 const scene=sceneFor({...s,pendingEvent:'derby'});
 assert.ok(scene.title.includes(ctx.opponentName));assert.ok(scene.paragraphs.join(' ').includes(ctx.score));
});
test('Mensaje para ChatGPT lleva carrera y guía de no modificar estadísticas',()=>{
 const s=advanceSeason(ready('chat10'));
 const context=chatContext(s,getClub);
 assert.ok(context.currentClub);assert.equal(context.lastReview.year,s.lastSeason.year);
 const prompt=chatPrompt(s,getClub,'Hablar con mi entrenador');
 assert.ok(prompt.includes('Hablar con mi entrenador'));assert.ok(prompt.includes(s.lastSeason.club));
 assert.ok(prompt.includes('sin inventar partidos'));
});
test('Migrar partidas antiguas no reabre automáticamente resúmenes ya jugados',()=>{
 const s=ready('old10');const old={...s,version:6};delete old.recapPending;
 const migrated=migrateCareer(old);assert.equal(migrated.recapPending,false);
});
