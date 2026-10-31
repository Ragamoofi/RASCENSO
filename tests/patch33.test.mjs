import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {newCareer,acceptDraft,academyOffers,signAcademy,autoResolveEvent,advanceSeason} from '../src/engine.mjs';
import {getInauguralLeague} from '../src/leagues2026.mjs';
import {playLeague} from '../src/league.mjs';
import {nationalSelectionEligibility} from '../src/competitions13.mjs';
import {socialEffects} from '../src/career20.mjs';
import {cardExtras,projectionLine,vestuarioView} from '../src/ui20.mjs';
import {pickWorldScene} from '../src/story20.mjs';

function starter(seed='patch33'){
 let s=newCareer({name:'Prueba',country:'CL',position:'DC',seed,age:17});
 while(s.phase==='draft')s=acceptDraft(s);
 return autoResolveEvent(signAcademy(s,academyOffers(s)[0].id));
}
test('3.3: juvenil recién llegado al Ascenso queda fuera del Mundial y de la selección mayor',()=>{
 const s=starter();
 const league=playLeague(s);
 assert.equal(nationalSelectionEligibility(s,league,'world-cup').eligible,false);
 const result=advanceSeason(s);
 assert.equal(result.lastSeason.calledUp,false);
 assert.equal(result.lastSeason.nationalCaps,0);
 assert.ok(result.lastSeason.competitions.every(c=>!['world-cup','international','qualifiers','friendly'].includes(c.kind)));
});
test('3.3: jugador adulto de Primera y recorrido internacional puede ir a su Mundial',()=>{
 const s=starter('adulto33');
 const league={matches:30,goals:22,assists:10,playerMatches:Array(30).fill({})};
 const veteran={...s,age:25,ovr:90,reputation:72,history:[{year:2023,matches:31,nationalCaps:2},{year:2024,matches:30,nationalCaps:5},{year:2025,matches:28,nationalCaps:6}]};
 assert.equal(nationalSelectionEligibility(veteran,league,'world-cup').eligible,false,'El Ascenso sigue sin acceso automático');
 const firstDivision={...veteran,clubId:'cl-1'};
 assert.equal(getInauguralLeague(firstDivision.clubId)?.tier,1);
 assert.equal(nationalSelectionEligibility(firstDivision,league,'world-cup').eligible,true);
});
test('3.3: amistades y familia tienen efecto acotado y la relación neutra no bonifica',()=>{
 const s=starter('social33');
 const neutral={...s,relationships:Object.fromEntries(['coach','teammate','agent','press','family'].map(key=>[key,{name:key,trust:50}]))};
 assert.equal(socialEffects(neutral).minutes,0);
 assert.equal(socialEffects(neutral).agentMarket,1);
 const high={...neutral,relationships:{...neutral.relationships,teammate:{trust:90},agent:{trust:100},family:{trust:100},press:{trust:100}}};
 const fx=socialEffects(high);
 assert.ok(fx.minutes>0&&fx.minutes<=.025&&fx.injury<1&&fx.injury>=.93);
 assert.ok(fx.agentMarket>1&&fx.agentMarket<=1.2&&fx.reputation<=1);
 assert.ok(vestuarioView(high).includes('Apoyo dentro del plantel'));
});
test('3.3: proyección sin caja, pretemporada sin nivel ni ranking, narrativa posterior veraz',()=>{
 const s=starter('ui33');
 assert.ok(projectionLine(s).includes('player-projection-inline'));
 assert.ok(!cardExtras(s).includes('v2-card-extra"><div><small>PROYECCIÓN'));
 const code=readFileSync(new URL('../src/experience.mjs',import.meta.url),'utf8');
 assert.ok(code.includes('listado alfabético, sin ranking previo'));
 assert.ok(!code.includes('· nivel estimado'));
 assert.ok(code.includes('Por jugar'));
 const story=readFileSync(new URL('../src/story20.mjs',import.meta.url),'utf8');
 assert.ok(story.includes('Tu debut internacional ya es historia'));
 assert.ok(!story.includes('La selección llama a tu puerta'));
});
test('3.3: nuevas fuentes del inventario de escudos identificadas por ID y con créditos',()=>{
 const refs=JSON.parse(readFileSync(new URL('../scripts/crest_commons.json',import.meta.url),'utf8'));
 assert.equal(Object.keys(refs).length,8);
 assert.equal(refs['cl-extra-15'].club,'Santiago Morning');
 assert.equal(refs['cl-extra-31'].club,'Fernández Vial');
 assert.equal(refs['au-extra-13'].club,'Auckland FC');
 assert.ok(Object.values(refs).every(x=>x.file&&x.page.startsWith('https://commons.wikimedia.org/wiki/File:')&&x.license));
 const audit=JSON.parse(readFileSync(new URL('../assets/crest-audit.json',import.meta.url),'utf8'));
 assert.equal(audit.mapped,826);
 assert.equal(audit.unmatched,48);
});
