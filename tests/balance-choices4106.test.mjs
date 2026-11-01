import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {CHOICES,BALANCE_TRADEOFFS,choiceFx,creatorCeilings,marketRarity} from '../src/identity30.mjs';
import {identitySeasonEffects,creatorIdentityEffects} from '../src/career08.mjs';
import {newCareer,acceptDraft,academyOffers,signAcademy,simulateToRetirement} from '../src/engine.mjs';
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`Se esperaba ${b}, salió ${a}`);

test('los costes declarados corresponden a opciones reales y salen en la ficha como advertencia',()=>{
 for(const [cat,entries] of Object.entries(BALANCE_TRADEOFFS))for(const [id,c] of Object.entries(entries)){
  assert.ok(CHOICES[cat]?.[id],`${cat}.${id} no existe`);
  assert.ok(CHOICES[cat][id].chips.some(([x,positive])=>!positive&&x===c.label),`${cat}.${id} no muestra coste`);
 }
});

test('recuperación: riesgo −20 % en el motor anterior, pero paga un desarrollo y minutos menores',()=>{
 const fx=choiceFx({developmentPath:'recuperacion'});
 near(identitySeasonEffects({developmentPath:'recuperacion'}).injury,.8);
 near(fx.growth,.92);near(fx.minutes,-.012);near(fx.declineYears,1.5);
 assert.ok(CHOICES.developmentPath.recuperacion.chips.find(c=>c[1]===0));
});

test('crecimiento integral intercambia techo general por crecimiento constante',()=>{
 const x=choiceFx({developmentPath:'mixta'});
 near(x.growth,1.05);near(x.ceil.shot,-1);near(x.ceil.defense,-1);
 for(const k of ['shot','defense'])near(creatorCeilings({developmentPath:'mixta'})[k],-1);
});

test('maduración tardía conserva su longevidad, pero pierde desarrollo y minutos al comienzo',()=>{
 const x=choiceFx({developmentPath:'tardio'});
 near(x.declineYears,2);near(x.growth,.91);near(x.minutes,-.01);
});

test('mental compensa serenidad y desarrollo con menor progreso físico',()=>{
 const x=choiceFx({developmentPath:'mental'});
 near(x.calm,.08);near(x.growth,1.03);near(x.growthAttr.pace,.94);near(x.growthAttr.physical,.94);
});

test('campesino conserva menor riesgo y techo físico, a costa del Pase',()=>{
 const x=choiceFx({environment:'campesino'});
 near(x.injury,.96);near(x.growth,1.03);near(x.ceil.physical,2);near(x.growthAttr.pass,.94);
});

test('migrante recibe adaptación y minutos en el motor antiguo, pero inicia con menos confianza',()=>{
 const x=choiceFx({environment:'migrante'});
 near(x.startTrust,-3);
 near(identitySeasonEffects({environment:'migrante'}).minutes,.014);
 const player=newCareer({name:'Prueba',country:'CL',position:'MC',environment:'migrante',origin:'cantera',seed:'migrante'});
 assert.equal(player.coachTrust,57);
});

test('personalidades: el beneficio ya existente NO se duplica al añadir costes',()=>{
 const ser=choiceFx({personality:'sereno'}),obs=choiceFx({personality:'obsesivo'}),sol=choiceFx({personality:'solidario'});
 near(ser.growth,.96);near(creatorIdentityEffects({personality:'sereno'}).injury,.98);
 near(obs.injury,1);near(creatorIdentityEffects({personality:'obsesivo'}).injury,1.13);
 near(sol.goals,.95);near(creatorIdentityEffects({personality:'solidario'}).assists,1.07);
});

test('origen por defecto mantiene 50 de confianza y 75 de moral, como antes',()=>{
 const player=newCareer({name:'Prueba',country:'CL',position:'MC',seed:'equilibrio-inicio'});
 assert.equal(player.coachTrust,50);assert.equal(player.morale,75);
 const can=newCareer({name:'Cantera',country:'CL',position:'MC',origin:'cantera',seed:'equilibrio-inicio'});
 assert.equal(can.coachTrust,60);
});

test('las dos piernas continúan equilibradas: el balance no añade penalizaciones por pie',()=>{
 near(choiceFx({foot:'Derecha',position:'ED'}).minutes,.02);
 near(choiceFx({foot:'Izquierda',position:'EI'}).minutes,.02);
 assert.equal(marketRarity({foot:'Derecha'}),0);
 assert.equal(marketRarity({foot:'Izquierda'}),0);
});

test('todas las elecciones con bonos muestran tradeoff, salvo alternativas neutrales deliberadas',()=>{
 for(const [cat,options] of Object.entries(CHOICES))for(const [id,value] of Object.entries(options)){
  if(cat==='weakness'||cat==='mode'||cat==='foot')continue;
  if(cat==='riskProfile'&&id==='calculador')continue;
  assert.ok(value.chips.some(x=>x[1]===0),`${cat}.${id} no tiene ninguna advertencia`);
 }
});

test('una carrera completa es determinista para la misma semilla y elecciones',()=>{
 const play=()=>{
  let s=newCareer({name:'Equilibrio',seed:'balance-e2e-4106',country:'CL',position:'MC',developmentPath:'recuperacion',personality:'sereno'});
  for(let i=0;i<8;i++)s=acceptDraft(s,0);
  s=signAcademy(s,academyOffers(s)[0].id);
  s=simulateToRetirement(s);
  return {phase:s.phase,history:s.history.map(h=>[h.year,h.ovrAfter,h.matches,h.goals,h.assists,h.injuryWeeks])};
 };
 assert.deepEqual(play(),play());
});

test('los recursos de publicación apuntan al motor actualizado con versión distinta',()=>{
 const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
 assert.match(html,/RASCENSO 4\.(?:10\.(?:[6-9]|[1-9]\d+)|11\.\d+)/);
 assert.match(html,/"\.\/src\/identity30\.mjs":"\.\/src\/identity30\.mjs\?v=510"/);
 assert.match(html,/experience494\.mjs\?v=\d+/);
});
