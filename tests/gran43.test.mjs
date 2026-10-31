import test from 'node:test';
import assert from 'node:assert/strict';
import {PLAYS,PLAY_IDS,playerStats,aiStats,autoChance} from '../src/plays30.mjs';
import {PLAY_TUNING,tuningFor,tunedAI,tunedChance,playBalanceMatrix} from '../src/play-tuning43.mjs';
import {seasonMatchImpact,momentWeight,impactPreview,matchImpactHeadline} from '../src/play-impact43.mjs';
import {newCareer,acceptDraft,academyOffers,signAcademy,autoResolveEvent,advanceSeason,seasonPlays,resolveSeasonPlay} from '../src/engine.mjs';
import {tackleTiming,FIELD_SCENES} from '../src/scenes-field.mjs';
const make=()=>{
 let s=newCareer({name:'Prueba 4.3',country:'CL',position:'DC',age:17,seed:'gran-parche43'});
 while(s.phase==='draft')s=acceptDraft(s,0);
 s=signAcademy(s,academyOffers(s)[0].id);
 return autoResolveEvent(s);
};
const high={attributes:{shot:86,pace:86,pass:86,defense:86,dribble:86,physical:86,skills:4,weak:4},morale:75,reputation:40};
const low={attributes:{shot:48,pace:48,pass:48,defense:48,dribble:48,physical:48,skills:2,weak:2},morale:75,reputation:40};
test('4.3 · los 20 minijuegos tienen perfiles mecánicos individuales',()=>{
 assert.equal(PLAY_IDS.length,20);
 assert.deepEqual(Object.keys(PLAY_TUNING).sort(),[...PLAY_IDS].sort());
 assert.equal(playBalanceMatrix().length,20);
 for(const id of PLAY_IDS){
  const p={type:id,difficulty:.7,fatigue:.2,pressure:72};
  const ai=aiStats(p),t=tuningFor(id);
  assert.ok(t.tag&&typeof t.chance==='number',id);
  for(const key of ['keeperSpeed','defSpeed','keeperReaction','defReaction','d','shooterSkill'])assert.ok(Number.isFinite(ai[key]),id+' '+key);
  const easy=autoChance(high,p),hard=autoChance(low,p);
  assert.ok(easy>hard,id+' progreso del jugador');
  assert.ok(easy>=.06&&easy<=.88,id);
  assert.ok(aiStats({...p,difficulty:.9}).defSpeed>aiStats({...p,difficulty:.2}).defSpeed,id);
 }
});
test('4.3 · capacidades del portero, rivales, centros y pases reaccionan por jugada',()=>{
 const base={d:.7,keeperReaction:.25,keeperSpeed:6,defSpeed:6,defReaction:.3,feintResist:.5,passTell:.6,shooterSkill:.7};
 assert.ok(tunedAI(base,'penal').keeperSpeed>base.keeperSpeed);
 assert.ok(tunedAI(base,'pase_filtrado').defSpeed<base.defSpeed);
 assert.ok(tunedAI(base,'recuperacion').defSpeed>base.defSpeed);
 assert.ok(tunedAI(base,'achique').shooterSkill>base.shooterSkill);
 assert.notEqual(tunedChance(.5,'pase_filtrado'),tunedChance(.5,'penal'));
});
test('4.3 · en las entradas importan cercanía y ejecución, no resultados aleatorios',()=>{
 const good=tackleTiming(.35,2,.16,.33,.8,.35);
 const poor=tackleTiming(1.8,2,.02,.33,.4,.85);
 assert.equal(good.success,true);assert.equal(poor.success,false);
 assert.ok(good.quality>poor.quality);
 assert.ok(FIELD_SCENES.entrada&&FIELD_SCENES.recuperacion&&FIELD_SCENES.pase_filtrado);
});
test('4.3 · consecuencias positivas y negativas limitadas y manuales más relevantes',()=>{
 const made=(success,auto,decisive,quality=.8)=>({success,auto,decisive,quality,kind:'attack',credit:'goal',type:'penal',rival:'La Serena',minute:88});
 const manual=made(true,false,true),automatic=made(true,true,true),miss=made(false,false,true);
 assert.ok(momentWeight(manual)>momentWeight(automatic));
 assert.ok(seasonMatchImpact([manual]).effect.trust>seasonMatchImpact([automatic]).effect.trust);
 assert.ok(seasonMatchImpact([miss]).effect.trust<0);
 assert.equal(seasonMatchImpact([]).total,0);
 assert.ok(impactPreview([manual]).includes('DT +'));
 const many=seasonMatchImpact(Array.from({length:30},()=>manual));
 assert.ok(many.effect.trust<=9&&many.effect.fans<=8&&many.effect.reputation<=5);
 const low=seasonMatchImpact(Array.from({length:30},()=>miss));
 assert.ok(low.effect.trust>=-8&&low.effect.morale>=-9);
});
test('4.3 · los titulares se fundamentan en jugadas existentes',()=>{
 const s=make(),result={success:true,auto:false,decisive:true,quality:.95,rival:'La Serena',minute:88,kind:'attack',credit:'goal'};
 const h=matchImpactHeadline(s,2028,seasonMatchImpact([result]));
 assert.match(h.text,/La Serena/);
 assert.match(h.text,/minuto 88/);
 assert.equal(h.mine,true);
 assert.equal(matchImpactHeadline(s,2028,seasonMatchImpact([])),null);
 const slump=matchImpactHeadline(s,2028,seasonMatchImpact(Array.from({length:3},()=>({...result,success:false}))));
 assert.match(slump.title,/confianza/);
});
test('4.3 · simular una temporada aplica impacto una sola vez y lo registra en prensa y recap',()=>{
 const s=make(),play=seasonPlays(s)[0];assert.ok(play);
 const decided=resolveSeasonPlay(s,play.id,{success:true,quality:.92,detail:play.kind==='attack'?'gol':'atajada'});
 const once=resolveSeasonPlay(decided,play.id,{success:false,detail:'tiempo'});
 assert.equal(once,decided,'la misma jugada no se duplica');
 const finished=advanceSeason(decided),impact=finished.lastSeason.matchdayImpact;
 assert.equal(impact.total,1);assert.equal(impact.successes,1);assert.equal(impact.manual,1);
 assert.ok(finished.world.news.some(x=>x.kind==='you'&&x.title.includes('momentos decisivos')),'el logro debe tener eco en el mundo');
 assert.ok(finished.history.at(-1).matchdayImpact);
 const without=advanceSeason(s);
 assert.equal(without.lastSeason.matchdayImpact.total,0);
 assert.equal(without.world.news.filter(x=>x.title?.includes('momentos decisivos')).length,0);
});
