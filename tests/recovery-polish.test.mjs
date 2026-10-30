import test from 'node:test';
import assert from 'node:assert/strict';
import {injuryAbsenceSlots, calendar} from '../src/league.mjs';
import {cupContributionRates, playGroupTournament} from '../src/competitions14.mjs';
import {playCup,continentalEligibility,simulateGlobalSeason} from '../src/competitions13.mjs';
import {VERIFIED_LEAGUES} from '../src/leagues2026.mjs';
import {COUNTRIES} from '../src/countries.mjs';

const team=(id,level=77)=>({id,name:id,level});
test('lesión consecutiva: solo afecta las jornadas propias y no partidos sueltos',()=>{
 const clubs=[team('A'),team('B'),team('C'),team('D')];
 const matches=calendar(clubs);
 const ours=matches.map((m,i)=>m.home==='A'||m.away==='A'?i:-1).filter(i=>i>=0);
 const absent=injuryAbsenceSlots(matches,'A',3,()=>.55);
 assert.equal(absent.size,3);
 const offsets=[...absent].map(i=>ours.indexOf(i));
 assert.deepEqual(offsets,[offsets[0],offsets[0]+1,offsets[0]+2]);
 assert([...absent].every(i=>matches[i].home==='A'||matches[i].away==='A'));
 assert.equal(injuryAbsenceSlots(matches,'A',0,()=>.5).size,0);
 assert.equal(injuryAbsenceSlots(matches,'A',999,()=>.5).size,ours.length);
});
test('arquero no suma goles de campo en copas, sea el resultado que sea',()=>{
 assert.equal(cupContributionRates('POR').goals,0);
 const players=Array.from({length:16},(_,i)=>team('t'+i,72+i));
 for(let i=0;i<30;i++){
  const state={position:'POR',coachTrust:100,ovr:92};
  const copa=playCup({id:'GK',name:'Copa',year:2030,teams:players,playerTeamId:'t0',seed:'GK'+i,state});
  const groups=playGroupTournament({id:'GKG',name:'Copa',year:2030,teams:players,playerTeamId:'t0',seed:'GK'+i,state});
  assert.equal(copa.goals,0);assert.equal(groups.goals,0);
 }
});
test('equipo en segunda no clasifica a continental por ganar su liga',()=>{
 const second=VERIFIED_LEAGUES.find(l=>l.countryCode==='CL'&&l.tier===2);
 const club=COUNTRIES.find(c=>c.code==='CL').clubs.find(c=>c.id===second.teamIds[0]);
 const normal={...club,countryCode:'CL',confederation:'CONMEBOL'};
 const league={division:2,year:2030,leaguePosition:1,goals:30,assists:10,matches:30};
 assert.equal(continentalEligibility({history:[],seed:'B'},normal,league).eligible,false);
 assert(!simulateGlobalSeason({seed:'B',clubId:club.id,country:'CL',history:[],position:'DC',ovr:91},league).competitions.some(c=>c.kind==='continental'));
});
test('ascenso no arrastra un segundo puesto de segunda a copas de primera',()=>{
 const top=VERIFIED_LEAGUES.find(l=>l.countryCode==='CL'&&l.tier===1);
 const club=COUNTRIES.find(c=>c.code==='CL').clubs.find(c=>c.id===top.teamIds[0]);
 const normal={...club,countryCode:'CL',confederation:'CONMEBOL'};
 const s={clubId:club.id,history:[{clubId:club.id,leaguePosition:1,leagueDivision:2,competitions:[]}]};
 assert.equal(continentalEligibility(s,normal,{division:1,leaguePosition:1}).eligible,false);
 const eligible={...s,history:[{...s.history[0],leagueDivision:1,leaguePosition:2}]};
 assert.equal(continentalEligibility(eligible,normal,{division:1,leaguePosition:20}).eligible,true);
});
