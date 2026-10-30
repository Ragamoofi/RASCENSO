import test from 'node:test';
import assert from 'node:assert/strict';
import {COUNTRIES} from '../src/countries.mjs';
import {VERIFIED_LEAGUES, getInauguralLeague} from '../src/leagues2026.mjs';
import {leagueParticipants, playLeague, nextLeagueRosters} from '../src/league.mjs';

const countries=Object.fromEntries(COUNTRIES.map(c=>[c.code,c]));
const division=id=>VERIFIED_LEAGUES.find(x=>x.id===id);
test('13 divisiones con nóminas verificadas y sin clubes duplicados',()=>{
 assert.equal(VERIFIED_LEAGUES.length,13);
 const seen=new Set();
 for(const l of VERIFIED_LEAGUES){
  assert.equal(l.teamIds.length,new Set(l.teamIds).size,`Duplicados en ${l.id}`);
  for(const id of l.teamIds){
   assert.ok(!seen.has(id),`${id} figura en varias ligas`);seen.add(id);
   const club=countries[l.countryCode].clubs.find(c=>c.id===id);
   assert.ok(club,`Club desconocido ${id}`);assert.ok(!club.inactive,`Club inactivo ${id}`);
  }
 }
});
test('Chile 2026: Primera y Ascenso tienen 16 participantes distintos y sin Colo-Colo B',()=>{
 const first=division('CL1'),second=division('CL2');
 assert.equal(first.teamIds.length,16);assert.equal(second.teamIds.length,16);
 const club=id=>countries.CL.clubs.find(x=>x.id===id)?.name;
 assert.ok(first.teamIds.some(id=>club(id)==='Colo-Colo'));
 assert.ok(!second.teamIds.some(id=>club(id)==='Colo-Colo'));
 assert.ok(second.teamIds.some(id=>club(id)==='San Marcos de Arica'));
 assert.ok(!first.teamIds.some(id=>club(id)==='San Marcos de Arica'));
 assert.ok(![...first.teamIds,...second.teamIds].some(id=>/col[o-]*colo b/i.test(club(id))));
});
test('San Marcos de Arica disputa Ascenso, 30 fechas, no contra Colo-Colo',()=>{
 const club=countries.CL.clubs.find(x=>x.name==='San Marcos de Arica');
 const state={clubId:club.id,seed:'liga06',startYear:2026,startAge:17,age:17,ovr:65,coachTrust:70,position:'DC',seasonPlan:'equilibrio'};
 const league=playLeague(state);
 assert.equal(league.league,'Liga de Ascenso');assert.equal(league.standings.length,16);
 assert.equal(league.fixtureResults.length,240);
 assert.equal(league.playerMatches.length,30);
 assert.ok(league.standings.every(x=>x.played===30));
 assert.ok(!league.teams.some(x=>x.name==='Colo-Colo'));
 assert.ok(league.standings.some(x=>x.id===club.id));
});
test('Chile: ascenso/descenso simulado mantiene exactamente 16 por división',()=>{
 const club=countries.CL.clubs.find(x=>x.name==='Universidad de Chile');
 const state={clubId:club.id,seed:'rotacion06',startYear:2026,startAge:17,age:17,ovr:70,coachTrust:52,position:'DC',seasonPlan:'equilibrio'};
 const league=playLeague(state),rosters=nextLeagueRosters(state,league);
 assert.equal(rosters.CL1.length,16);assert.equal(rosters.CL2.length,16);
 assert.equal(new Set([...rosters.CL1,...rosters.CL2]).size,32);
});
test('Argentina: dos zonas de 15 y 30 partidos anuales representativos por club',()=>{
 const a=division('AR1');assert.equal(a.teamIds.length,30);
 assert.equal(a.zones.A.length,15);assert.equal(a.zones.B.length,15);
 const sample=playLeague({clubId:a.teamIds[0],seed:'ar26',startYear:2026,startAge:17,age:17,ovr:60,coachTrust:50,position:'DC'});
 assert.equal(sample.standings.length,30);
 assert.equal(sample.playerMatches.length,30);
 assert.ok(sample.standings.every(x=>x.played===30));
});
test('Los equipos B/filiales fuera de nóminas no se presentan como participantes 2026',()=>{
 for(const l of VERIFIED_LEAGUES) assert.ok(l.teamIds.every(id=>!countries[l.countryCode].clubs.find(x=>x.id===id).inactive));
 assert.equal(getInauguralLeague(countries.CL.clubs.find(x=>x.name==='Colo-Colo B')?.id),null);
});
