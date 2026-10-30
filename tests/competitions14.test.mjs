import {test} from 'node:test';
import assert from 'node:assert/strict';
import {playGroupTournament,playQualification} from '../src/competitions14.mjs';
import {worldQualifiers,simulateGlobalSeason,WORLD_QUALIFYING_QUOTAS} from '../src/competitions13.mjs';
import {newCareer,acceptDraft,signAcademy,academyOffers,autoResolveEvent,advanceSeason} from '../src/engine.mjs';
const teams=Array.from({length:16},(_,i)=>({id:`t${i}`,name:`Equipo ${i}`,level:60+i}));
function start(seed='test14'){
 let s=newCareer({name:'Prueba',country:'CL',position:'DC',age:17,seed});
 while(s.phase==='draft')s=acceptDraft(s,0);
 s=signAcademy(s,academyOffers(s)[0].id);return autoResolveEvent(s);
}
test('fase de grupos: 4 grupos de 4, seis partidos por grupo y tabla coherente',()=>{
 const a=playGroupTournament({id:'G',name:'Copa',year:2030,teams,playerTeamId:'t0',seed:'groups'});
 assert.deepEqual(a,playGroupTournament({id:'G',name:'Copa',year:2030,teams,playerTeamId:'t0',seed:'groups'}));
 assert.equal(a.groupTables.length,4);assert.equal(a.fixtures.filter(f=>f.phase==='group').length,24);
 for(const g of a.groupTables){assert.equal(g.standings.length,4);assert.equal(g.standings.reduce((n,x)=>n+x.pj,0),12);
  for(const row of g.standings)assert.equal(row.gf-row.ga,row.gd);
  assert(g.standings.every(x=>x.pts===x.w*3+x.d));}
 assert.equal(a.fixtures.filter(x=>x.phase==='knockout').length,13);
 assert.equal(a.fixtures.at(-1).stage,'Final');assert(a.playerFixtures.every(f=>['t0'].includes(f.home)||f.away==='t0'));
 assert(teams.some(t=>t.id===a.champion));
});
test('las eliminatorias se definen por resultados y ranking; los cupos son fijos',()=>{
 const q=playQualification({id:'X',name:'Eliminatorias',year:2029,teams:teams.slice(0,6),playerTeamId:'t0',seed:'qual',quota:3});
 assert.equal(q.groupTables[0].standings.length,6);assert.equal(q.fixtures.length,15);
 assert.equal(q.qualified.length,3);assert.equal(q.qualifiedPlayer,q.qualified.includes('t0'));
 assert.equal(q.playerFixtures.length,5);
});
test('mundial 2030 depende exactamente de las tablas 2029, con 32 cupos',()=>{
 const a=worldQualifiers('global-proof',2029),b=worldQualifiers('global-proof',2029);
 assert.deepEqual(a,b);assert.equal(a.qualified.length,32);
 for(const [conf,quota] of Object.entries(WORLD_QUALIFYING_QUOTAS)){
  assert.equal(a.results[conf].qualified.length,quota);
  assert(a.results[conf].qualified.every(id=>a.qualified.includes(id)));
 }
});
test('clasificación continental se hereda del año anterior si se permanece en el club',()=>{
 const s={...start('qualified14'),ovr:90,coachTrust:95};
 const league={year:2030,leaguePosition:1,matches:35,goals:12,assists:4};
 const state={...s,history:[{year:2029,clubId:s.clubId,leaguePosition:14,competitions:[]} ]};
 assert.equal(simulateGlobalSeason(state,league).competitions.filter(c=>c.kind==='continental').length,0);
 const eligible={...state,history:[{year:2029,clubId:s.clubId,leaguePosition:2,competitions:[]}]};
 const cup=simulateGlobalSeason(eligible,league).competitions.find(c=>c.kind==='continental');
 assert(cup);assert.equal(cup.groupTables.length,4);assert.match(cup.qualification,/Liga previa: 2°/);
});
test('la posición del antiguo club no se hereda tras un fichaje',()=>{
 const s={...start('change14'),ovr:90};
 const league={year:2030,leaguePosition:18,matches:30,goals:12,assists:4};
 const a=simulateGlobalSeason({...s,history:[{year:2029,clubId:'club-de-origen',leaguePosition:1}]},league);
 const cup=a.competitions.find(x=>x.kind==='continental');
 if(cup)assert.doesNotMatch(cup.qualification,/Liga previa/);
});
test('el historial del motor contiene grupos, partidos y estadísticas por competición',()=>{
 const s={...start('engine14'),ovr:90,coachTrust:92};const next=advanceSeason(s);
 assert.equal(next.lastSeason.competitionVersion,4);
 assert(next.lastSeason.competitions.some(c=>c.kind==='national-cup'));
 assert(Array.isArray(next.lastSeason.competitionCalendar));
 assert(next.lastSeason.competitionCalendar.every(m=>m.competition&&m.stage&&m.home&&m.away));
 assert.equal(next.lastSeason.clubCupMatches,next.lastSeason.competitions.filter(c=>['national-cup','continental','supercup','club-world-cup'].includes(c.kind)).reduce((n,c)=>n+c.played,0));
});
test('el resultado de clasificatorias no cambia porque el protagonista sea convocado',()=>{
 const base={id:'WCQ-X',name:'Eliminatorias',year:2029,teams:teams.slice(0,8),seed:'seeds',quota:3};
 const without=playQualification({...base,playerTeamId:''}),withPlayer=playQualification({...base,playerTeamId:'t0',state:{ovr:90,coachTrust:90}});
 assert.deepEqual(without.groupTables,withPlayer.groupTables);
 assert.deepEqual(without.qualified,withPlayer.qualified);
});