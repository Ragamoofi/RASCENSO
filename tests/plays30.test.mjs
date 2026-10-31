import test from 'node:test';
import assert from 'node:assert/strict';
import { newCareer, acceptDraft, academyOffers, signAcademy, autoResolveEvent, advanceSeason, chooseTransfer, seasonPlays, resolveSeasonPlay, autoResolveSeasonPlay } from '../src/engine.mjs';
import { playLeague } from '../src/league.mjs';
import { PLAYS, POSITION_PLAYS, playerStats, aiStats, autoChance, sanitizeReport } from '../src/plays30.mjs';

function start(seed,position='DC',country='CL'){let s=newCareer({name:'Jugadas',position,country,seed});while(s.phase==='draft')s=acceptDraft(s,0);s=signAcademy(s,academyOffers(s)[0].id);return autoResolveEvent(s);}
/** Busca una carrera que tenga al menos una jugada del tipo pedido (attack/defend). */
function withPlay(position,kind,tries=40){for(let i=0;i<tries;i++){let s=start(`pl30-${position}-${kind}-${i}`,position);const p=seasonPlays(s).find(x=>x.kind===kind);if(p)return [s,p];}return [null,null];}
const key=p=>m=>m.round===p.round&&m.home===p.home&&m.away===p.away;
const sum=score=>score.split('-').map(Number).reduce((a,b)=>a+b,0);

test('3.0 · cada posición vive jugadas propias de su repertorio',()=>{
 const seen={};
 for(const pos of ['DC','EI','MC','MCD','DFC','POR','LD','MCO']){
  for(let i=0;i<6;i++){const s=start(`rep-${pos}-${i}`,pos);for(const p of seasonPlays(s)){assert.ok(POSITION_PLAYS[pos].includes(p.type),`${pos} recibió ${p.type}`);(seen[pos]||=new Set()).add(p.type);}}
 }
 assert.ok(seen.DC&&[...seen.DC].every(t=>!POSITION_PLAYS.POR.includes(t)),'un delantero nunca juega como arquero');
 for(const pos of Object.keys(POSITION_PLAYS))for(const t of POSITION_PLAYS[pos])assert.ok(PLAYS[t],t);
 assert.equal(Object.keys(PLAYS).length,20);
});

test('3.0 · las jugadas son deterministas y estables tras resolver una',()=>{
 const [s,p]=withPlay('DC','attack');assert.ok(s);
 assert.deepEqual(seasonPlays(s).map(x=>x.id),seasonPlays({...s}).map(x=>x.id));
 const after=resolveSeasonPlay(s,p.id,{success:false,detail:'fuera'});
 assert.deepEqual(seasonPlays(after).map(x=>x.id),seasonPlays(s).map(x=>x.id));
 assert.equal(seasonPlays(after).find(x=>x.id===p.id).result.success,false);
 assert.strictEqual(resolveSeasonPlay(after,p.id,{success:true,detail:'gol'}),after,'no se resuelve dos veces');
});

test('3.0 · un gol logrado suma exactamente un gol en ese partido y nada más cambia',()=>{
 const [s,p]=withPlay('DC','attack');assert.ok(s);
 const before=playLeague(s),won=resolveSeasonPlay(s,p.id,{success:true,quality:.8,detail:'gol'}),after=playLeague(won);
 const a=before.playerMatches.find(key(p)),b=after.playerMatches.find(key(p));
 assert.equal(sum(b.score),sum(a.score)+1);assert.equal(b.goals,a.goals+1);assert.equal(b.assists,a.assists);
 // El resto de la temporada queda idéntico.
 assert.deepEqual(after.fixtureResults.filter(f=>!(f[0]===p.round&&f[1]===p.home&&f[2]===p.away)),before.fixtureResults.filter(f=>!(f[0]===p.round&&f[1]===p.home&&f[2]===p.away)));
 assert.deepEqual(after.playerMatches.filter(m=>!key(p)(m)),before.playerMatches.filter(m=>!key(p)(m)));
 const res=seasonPlays(won).find(x=>x.id===p.id).result;assert.equal(res.finalScore,b.score);
});

test('3.0 · una asistencia se acredita como asistencia, no como gol',()=>{
 let found=null;for(const pos of ['MC','MCO','EI'])for(let i=0;i<20&&!found;i++){const s=start(`assistido-${pos}-${i}`,pos),p=seasonPlays(s).find(x=>x.kind==='attack'&&x.credit==='assist');if(p)found=[s,p];}
 assert.ok(found);const [s,p]=found;
 const a=playLeague(s).playerMatches.find(key(p)),b=playLeague(resolveSeasonPlay(s,p.id,{success:true,detail:'asistencia'})).playerMatches.find(key(p));
 assert.equal(b.assists,a.assists+1);assert.equal(b.goals,a.goals);
 // Si el jugador remató él mismo (crédito «gol») cuenta como gol.
 const c=playLeague(resolveSeasonPlay(s,p.id,{success:true,detail:'gol',credit:'goal'})).playerMatches.find(key(p));assert.equal(c.goals,a.goals+1);
});

test('3.0 · una jugada defensiva lograda evita un gol rival y el fallo deja el partido igual',()=>{
 for(const pos of ['DFC','POR']){
  const [s,p]=withPlay(pos,'defend');assert.ok(s,pos);
  const base=playLeague(s).playerMatches.find(key(p));
  const saved=playLeague(resolveSeasonPlay(s,p.id,{success:true,detail:'atajada'})).playerMatches.find(key(p));
  const missed=playLeague(resolveSeasonPlay(s,p.id,{success:false,detail:'gol rival'})).playerMatches.find(key(p));
  assert.equal(sum(saved.score),sum(base.score)-1,pos);assert.equal(missed.score,base.score,pos);
  assert.equal(p.before.ga+1,(base.home===s.clubId?+base.score.split('-')[1]:+base.score.split('-')[0]),'el marcador previo es el de antes del gol rival');
 }
});

test('3.0 · los resultados quedan en la temporada y coinciden con el marcador definitivo',()=>{
 const [s,p]=withPlay('DC','attack');let t=resolveSeasonPlay(s,p.id,{success:true,detail:'gol',quality:.9});
 const preview=seasonPlays(t).find(x=>x.id===p.id).result.finalScore;
 const next=advanceSeason(t);
 assert.equal(next.plays30,null);
 const stored=next.lastSeason.plays.find(x=>x.id===p.id);assert.ok(stored&&stored.success);
 assert.equal(next.lastSeason.playerMatches.find(key(p)).score,preview);
 assert.ok(next.careerMoments.some(m=>m.kind==='on-field'&&m.text.includes(PLAYS[p.type].name)));
});

test('3.0 · los atributos y el contexto cambian la dificultad real',()=>{
 const [s,p]=withPlay('DC','attack');
 const weak={...s,attributes:Object.fromEntries(Object.entries(s.attributes).map(([k,v])=>[k,['skills','weak'].includes(k)?v:45]))};
 const strong={...s,attributes:Object.fromEntries(Object.entries(s.attributes).map(([k,v])=>[k,['skills','weak'].includes(k)?v:90]))};
 assert.ok(playerStats(strong,p).aimNoise<playerStats(weak,p).aimNoise);
 assert.ok(playerStats(strong,p).speed>playerStats(weak,p).speed);
 assert.ok(autoChance(strong,p)>autoChance(weak,p));
 const calm=playerStats(s,{...p,pressure:20}),tense=playerStats(s,{...p,pressure:95});assert.ok(tense.aimNoise>calm.aimNoise,'la presión hace temblar el pulso');
 const easy=aiStats({difficulty:.2}),hard=aiStats({difficulty:.9});assert.ok(hard.keeperReaction<easy.keeperReaction&&hard.defSpeed>easy.defSpeed);
});

test('3.0 · variedad entre temporadas y jugadas decisivas con más presión',()=>{
 let s=start('variedad30','DC');const types=new Set();let decisive=[],normal=[];
 for(let k=0;k<40&&s.history.length<5;k++){
  if(s.phase==='season'){for(const p of seasonPlays(s)){types.add(p.type);(p.decisive?decisive:normal).push(p.pressure);}s=advanceSeason(s);}
  else if(s.phase==='event')s=autoResolveEvent(s);else if(s.phase==='transfer')s=chooseTransfer(s,s.market?.canStay===false?s.offers[0]?.id:null);
 }
 assert.ok(types.size>=3,`tipos vistos: ${[...types]}`);
 if(decisive.length&&normal.length)assert.ok(decisive.reduce((a,b)=>a+b,0)/decisive.length>normal.reduce((a,b)=>a+b,0)/normal.length);
});

test('3.0 · el informe del minijuego se sanea y la resolución automática es reproducible',()=>{
 const r=sanitizeReport({success:1,quality:7,detail:'hackeo',credit:'otro',dir:3});
 assert.equal(r.success,true);assert.equal(r.quality,1);assert.equal(r.detail,'gol');assert.equal(r.credit,undefined);assert.equal(r.dir,1);
 const [s,p]=withPlay('POR','defend');assert.ok(s);
 assert.deepEqual(autoResolveSeasonPlay(s,p.id).plays30,autoResolveSeasonPlay(s,p.id).plays30);
});

test('3.0 · el arquero rival recuerda hacia dónde pateas los penales',()=>{
 let s=null,p=null;for(let i=0;i<60&&!p;i++){s=start('penales-'+i,'DC');p=seasonPlays(s).find(x=>x.type==='penal');}
 if(!p)return;const t=resolveSeasonPlay(s,p.id,{success:true,detail:'gol',dir:.1});
 assert.deepEqual(t.playMemory.penalties,[.1]);
});
