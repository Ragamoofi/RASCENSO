import {test} from 'node:test';
import assert from 'node:assert/strict';
import { COUNTRIES } from '../src/countries.mjs';
import { VERIFIED_LEAGUES } from '../src/leagues2026.mjs';
import { playLeague } from '../src/league.mjs';
import { CONTINENTAL_CLUB_CUPS,NATIONAL_CUPS,playCup,simulateGlobalSeason,selectionCalendar } from '../src/competitions13.mjs';
import { newCareer,acceptDraft,signAcademy,academyOffers,autoResolveEvent,advanceSeason,migrateCareer,syncClub } from '../src/engine.mjs';
function started(code,seed='global13'){
 let s=newCareer({name:'Jugador de prueba',country:code,position:'DC',seed});while(s.phase==='draft')s=acceptDraft(s);
 s=signAcademy(s,academyOffers(s)[0].id);return autoResolveEvent(s);
}
test('50 nacionalidades y seis confederaciones incluidas: Oceanía está disponible',()=>{
 assert.equal(COUNTRIES.length,50);assert.equal(COUNTRIES.find(x=>x.code==='NZ').confederation,'OFC');
 const confs=new Set(COUNTRIES.map(x=>x.confederation));assert.equal(confs.size,6);
 for(const c of confs){assert(NATIONAL_CUPS[c]);assert(CONTINENTAL_CLUB_CUPS[c]?.length);}
});
test('Eliminatorias, continentales, ciclos de Mundial y regionales son consistentes',()=>{
 assert(selectionCalendar('CONMEBOL',2028).regional);
 assert(selectionCalendar('CAF',2027).regional);
 assert(selectionCalendar('OFC',2028).regional);
 assert(selectionCalendar('UEFA',2030).worldCup);
 assert(selectionCalendar('AFC',2029).qualifiers);
});
test('Los torneos se resuelven con fechas y marcadores, el campeón es participante',()=>{
 const teams=Array.from({length:16},(_,i)=>({id:`t${i}`,name:`Club ${i}`,level:70+i}));
 const a=playCup({id:'TEST',name:'Copa ficticia',teams,playerTeamId:'t1',year:2030,seed:'global13'});
 const b=playCup({id:'TEST',name:'Copa ficticia',teams,playerTeamId:'t1',year:2030,seed:'global13'});
 assert.deepEqual(a,b);assert.equal(a.fixtures.length,15);assert(teams.some(t=>t.id===a.champion));
 assert(a.playerFixtures.every(f=>f.home==='t1'||f.away==='t1'));
});
test('El motor integra copa local, continental y selección en el mismo año',()=>{
 const top=VERIFIED_LEAGUES.find(l=>l.countryCode==='CL'&&l.tier===1);
 const base={...started('CL','chile13'),ovr:90,age:22,startAge:22,reputation:70,coachTrust:95,history:[{year:2024,matches:29,nationalCaps:2},{year:2025,matches:28,nationalCaps:2}]};
 const qualified=top.teamIds.find(clubId=>playLeague(syncClub({...base,clubId})).leaguePosition<=8);
 assert(qualified,'debe existir un equipo de primera entre los ocho primeros');
 const s=syncClub({...base,clubId:qualified});
 const a=advanceSeason(s);assert(a.lastSeason.competitions?.length>=2);
 const local=a.lastSeason.competitions.find(c=>c.kind==='national-cup');assert(local);assert.equal(local.year,2026);
 assert(a.lastSeason.calledUp);assert(a.lastSeason.nationalCaps>=0);
 assert(a.lastSeason.competitions.some(c=>c.kind==='continental'));
 assert(a.lastSeason.competitions.some(c=>c.kind==='world-cup'||c.kind==='friendly'));
 assert(a.trophyRecords.every(t=>t.kind&&t.title&&t.year));
 const m=migrateCareer(a);assert.deepEqual(m.lastSeason.competitions,a.lastSeason.competitions);
});
test('Nueva Zelanda puede fichar, disputar copa nacional y recibir convocatoria',()=>{
 let s={...started('NZ','oceania13'),ovr:92,age:22,startAge:22,reputation:75,history:[{year:2024,matches:28,nationalCaps:2},{year:2025,matches:27,nationalCaps:2}]};
 const next=advanceSeason(s);assert(next.lastSeason.competitions.some(c=>c.kind==='national-cup'));
 assert(next.lastSeason.calledUp);assert(next.lastSeason.competitions.some(c=>c.kind==='world-cup'||c.kind==='friendly'));
});
test('Competición continental solo para clasificación de liga, no por celebridad del jugador',()=>{
 const s=started('CL','no-conf');
 const league={year:2032,leaguePosition:15,matches:29,goals:7,assists:3};
 const comps=simulateGlobalSeason({...s,ovr:95},league).competitions;
 assert(!comps.some(c=>c.kind==='continental'));
});
