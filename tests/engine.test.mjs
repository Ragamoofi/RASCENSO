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
test('50 nacionalidades con tres clubes reales semilla como mínimo',()=>{
 assert.equal(COUNTRIES.length,50);assert(COUNTRIES.every(c=>c.clubs.length>=3));
 assert(COUNTRIES.every(c=>c.clubs.every(x=>x.id&&x.name&&Number.isFinite(x.level))));
});
test('Chile puede recibir ofertas nacionales e internacionales al iniciar',()=>{
 const s=makeStarted();assert.equal(s.phase,'season');
 assert.equal(getCountry(s.country).name,'Chile');
 const d=newCareer({name:'X',country:'CL',position:'POR',seed:'test-49'});
 assert.equal(academyOffers(d).length,3);
 assert(academyOffers(d).some(c=>c.countryCode==='CL'));assert(academyOffers(d).some(c=>c.countryCode!=='CL'));
});
test('Draft completa ocho atributos, OVR y potencial',()=>{
 let s=newCareer({name:'Prueba',country:'CL',position:'POR',seed:'same'});
 let count=0;while(s.phase==='draft'){assert(currentDraft(s));s=acceptDraft(s);count++;}
 assert.equal(count,8);assert.equal(Object.keys(s.attributes).length,8);
 assert(s.potential>s.ovr);assert.equal(academyOffers(s).length,3);
 assert(academyOffers(s).some(c=>c.countryCode==='CL'));
});
test('Simulación determinista',()=>{
 const a=advanceSeason(makeStarted('CL','same-seed'));
 const b=advanceSeason(makeStarted('CL','same-seed'));
 assert.deepEqual(a.lastSeason,b.lastSeason);
 assert(a.lastSeason.matches>=0&&a.lastSeason.matches<=42);
});
test('Carrera veterana continúa más allá de los 40 hasta que termina el contrato o el mercado',()=>{
 let s=makeStarted('CL','full-run');
 s=simulateToRetirement(s);
 assert.equal(s.phase,'retired');assert.ok(s.age>40&&s.age<75);
 assert.ok(s.history.length>24);
 assert(s.history.every(x=>x.matches>=0&&x.goals>=0&&x.assists>=0));
});

test('Cada uno de los 50 países devuelve tres ofertas, con al menos una nacional',()=>{
 for(const c of COUNTRIES){
  const s=newCareer({name:'Prueba',country:c.code,position:'MC',seed:`territorio-${c.code}`});
  const offers=academyOffers(s);
  assert.equal(offers.length,3,`Faltan ofertas en ${c.name}`);
  assert(offers.some(o=>o.countryCode===c.code),`Falta una oferta nacional en ${c.name}`);
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
 const updated=migrateCareer(prev);assert.equal(updated.version,8);assert.equal(updated.history[0].goals,6);assert.equal(updated.name,'Veterano');
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
 const m=migrateCareer(v2);assert.equal(m.version,8);assert(m.relationships.coach);assert.deepEqual(m.storyLog,[]);
 assert.equal(m.history.length,original.history.length);
});

test('El catálogo ampliado conserva identificadores y supera 800 clubes de 50 países',()=>{
 assert(COUNTRIES.reduce((n,c)=>n+c.clubs.length,0)>=800);
 assert.equal(getCountry('CL').clubs.find(c=>c.id==='cl-1').name,'Colo-Colo');
 assert(getCountry('CL').clubs.some(c=>c.name==='Santiago Wanderers'));
 assert(COUNTRIES.every(c=>new Set(c.clubs.map(x=>x.id)).size===c.clubs.length));
});
test('Tres opciones del draft, un solo atributo por turno y progreso hasta academia',async()=>{
 const {draftChoices}=await import('../src/engine.mjs');
 let s=newCareer({name:'Prueba',seed:'draft-0.4',country:'CL',position:'DC'});
 assert.equal(draftChoices(s).length,3);
 const second=draftChoices(s)[1];s=acceptDraft(s,1);
 assert.equal(s.attributes[second.key],s.draftSources[0].startingValue);
 while(s.phase==='draft')s=acceptDraft(s,2);
 assert.equal(Object.keys(s.attributes).length,8);
 assert.equal(s.phase,'academy');
});
test('La tabla simulada incluye al jugador, equipos reales y ubicación de la última campaña',async()=>{
 const {simulatedStandings}=await import('../src/engine.mjs');
 let s=makeStarted('CL','tabla-0.4');s=advanceSeason(s);
 const board=simulatedStandings(s);
 assert(board.length>=15&&board.length<=20);
 assert.equal(new Set(board.map(x=>x.id)).size,board.length);
 const own=board.find(x=>x.id===s.clubId);
 assert.equal(own.position,s.lastSeason.leaguePosition);
 assert(board.every(x=>Number.isInteger(x.points)&&Number.isInteger(x.played)));
});


// Integridad del motor deportivo propio: todas las cifras proceden de enfrentamientos.
import { playLeague, calendar, leagueParticipants } from '../src/league.mjs';
import { chooseSeasonPlan } from '../src/engine.mjs';
test('Calendario de ida y vuelta sin enfrentamientos duplicados',()=>{
 const clubs=leagueParticipants('CL','cl-1');const fixtures=calendar(clubs);
 assert.equal(fixtures.length,clubs.length*(clubs.length-1));
 const keys=new Set(fixtures.map(f=>`${f.home}/${f.away}`));assert.equal(keys.size,fixtures.length);
 const perRound=new Map();for(const f of fixtures){const ids=perRound.get(f.round)||new Set();assert(!ids.has(f.home));assert(!ids.has(f.away));ids.add(f.home);ids.add(f.away);perRound.set(f.round,ids);}
});
test('Cada punto, victoria, gol y diferencia sale de los marcadores archivados',()=>{
 const player={seed:'integridad2026',startYear:2026,startAge:18,age:22,clubId:'cl-1',country:'CL',ovr:71,coachTrust:50,position:'DC',style:'goleador',seasonPlan:'ataque'};
 const sim=playLeague(player),stats=new Map(sim.standings.map(t=>[t.id,{played:0,points:0,wins:0,draws:0,losses:0,gf:0,ga:0}]));
 for(const [,home,away,gh,ga] of sim.fixtureResults){const a=stats.get(home),b=stats.get(away);a.played++;b.played++;a.gf+=gh;a.ga+=ga;b.gf+=ga;b.ga+=gh;if(gh===ga){a.points++;b.points++;a.draws++;b.draws++;}else if(gh>ga){a.points+=3;a.wins++;b.losses++;}else{b.points+=3;b.wins++;a.losses++;}}
 for(const row of sim.standings){const x=stats.get(row.id);assert.equal(x.played,row.played);assert.equal(x.points,row.points);assert.equal(x.wins,row.wins);assert.equal(x.draws,row.draws);assert.equal(x.losses,row.losses);assert.equal(x.gf,row.for);assert.equal(x.ga,row.against);assert.equal(x.gf-x.ga,row.gd);}
 const own=sim.playerMatches;assert.equal(sim.matches,own.filter(x=>x.played).length);assert.equal(sim.goals,own.reduce((a,x)=>a+x.goals,0));assert.equal(sim.assists,own.reduce((a,x)=>a+x.assists,0));
 assert.deepEqual(playLeague(player),sim);
});
test('Plan deportivo se elige antes de jugar y modifica los resultados reproduciblemente',()=>{
 const state={phase:'season',seasonPlan:'equilibrio'};assert.equal(chooseSeasonPlan(state,'ataque').seasonPlan,'ataque');assert.equal(chooseSeasonPlan(state,'inventado').seasonPlan,'equilibrio');
 const pl={seed:'planes2026',startYear:2026,startAge:17,age:24,clubId:'cl-1',country:'CL',ovr:76,coachTrust:66,position:'DC',style:'goleador'};
 assert.notDeepEqual(playLeague({...pl,seasonPlan:'ataque'}).fixtureResults,playLeague({...pl,seasonPlan:'defensa'}).fixtureResults);
});

test('El jugador solo puede cambiar tres veces las cartas de legado',async()=>{
 const {rerollDraft}=await import('../src/engine.mjs');
 let s=newCareer({name:'Legado',seed:'tres-cambios'});
 for(let i=0;i<3;i++)s=rerollDraft(s);
 assert.equal(s.draftRerolls,3);assert.deepEqual(rerollDraft(s),s);
});
test('Contrato inicial mostrado y firmado es el mismo; los atributos sobreviven la temporada',async()=>{
 const {academyContractOffer}=await import('../src/engine.mjs');
 let s=newCareer({name:'Carrera',seed:'stats-persistentes'});
 while(s.phase==='draft')s=acceptDraft(s,0);
 const club=academyOffers(s)[0];const contract=academyContractOffer(s,club);
 const starting={...s.attributes};s=signAcademy(s,club.id);
 assert.deepEqual(s.contract,contract);assert(s.contract.salary>=9000);
 s=autoResolveEvent(s);const next=advanceSeason(s);
 assert.deepEqual(next.lastSeason.attributesBefore,starting);
 assert.deepEqual(next.lastSeason.attributesAfter,next.attributes);
 assert.equal(Object.keys(next.attributes).length,8);
 assert(Object.values(next.attributes).every(x=>Number.isFinite(x)));
});
