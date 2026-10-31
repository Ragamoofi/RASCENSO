import test from 'node:test';
import assert from 'node:assert/strict';
import {clubSeasonTrophies,clubSeasonTrophiesHTML,selectionReport,selectionPanel} from '../src/history46.mjs';
const fixtures=[
 {home:'CL',away:'AR',score:'2-1',playerPlayed:true,playerMinutes:87,playerGoals:1,playerAssists:0},
 {home:'BR',away:'CL',score:'0-0',playerPlayed:true,playerMinutes:65,playerGoals:0,playerAssists:0},
 {home:'CL',away:'UY',score:'1-3',playerPlayed:false,playerMinutes:0,playerGoals:0,playerAssists:0}
];
const state={country:'CL',position:'DC',clubId:'cl-1',
 history:[
  {year:2030,clubId:'cl-1',club:'Colo-Colo',leagueId:'CL1',titles:['Liga de Primera','Copa Chile'],nationalCaps:2,nationalGoals:1,
   competitions:[
    {name:'Copa Chile',kind:'national-cup',played:4,championWon:true},
    {name:'Copa América',kind:'international',played:2,goals:1,assists:2,minutes:152,championWon:true,playerFixtures:fixtures}
   ]},
  {year:2031,clubId:'en-1',club:'Arsenal',leagueId:'EN1',titles:[],nationalCaps:1,nationalGoals:0,
   competitions:[{name:'Clasificatorias',kind:'qualifiers',played:1,goals:0,assists:0,minutes:90,
    playerFixtures:[{home:'AR',away:'CL',score:'0-2',playerPlayed:true,playerMinutes:90}]}]}
 ],
 trophyRecords:[
  {title:'Liga de Primera',year:2030,clubId:'cl-1',kind:'league',leagueId:'CL1'},
  {title:'Copa Chile',year:2030,clubId:'cl-1',kind:'national-cup',competitionId:'CUP-CL'},
  {title:'Copa América',year:2030,clubId:null,kind:'international',countryCode:'CL'}
 ]};
test('historial: un título muestra el trofeo al lado de su club y no los títulos de selección',()=>{
 const first=clubSeasonTrophies(state,state.history[0]);
 assert.deepEqual(first.map(t=>t.title),['Liga de Primera','Copa Chile']);
 assert.equal(clubSeasonTrophies(state,state.history[1]).length,0);
 const html=clubSeasonTrophiesHTML(state,state.history[0]);
 assert.equal((html.match(/history-mini-cup/g)||[]).length,2);
 assert.match(html,/league-cl1.png/);
 assert.match(html,/real-copachile.png/);
 assert.doesNotMatch(html,/Copa América/);
});
test('historial: guardados antiguos sin trophyRecords usan títulos de temporada',()=>{
 const s={history:[],trophyRecords:[]},y={year:2026,clubId:'cl-1',titles:['Liga de Primera','Copa Mundial de la FIFA']};
 assert.deepEqual(clubSeasonTrophies(s,y).map(t=>t.title),['Liga de Primera']);
});
test('selección: sumas solo partidos realmente jugados y resultados que figuran en guardado',()=>{
 const report=selectionReport(state);
 assert.equal(report.caps,3);assert.equal(report.goals,1);assert.equal(report.assists,2);assert.equal(report.minutes,242);
 assert.equal(report.wins,2);assert.equal(report.draws,1);assert.equal(report.losses,0);
 assert.equal(report.scoredGames,3);assert.equal(report.cleanSheets,2);
 assert.equal(report.titles.length,1);assert.equal(report.titles[0].title,'Copa América');
 assert.equal(report.entries.length,2);
 assert.equal(report.years.length,2);
});
test('selección: partidos antiguos sin detalle muestran datos reales sin inventar victorias',()=>{
 const s={country:'CL',history:[{year:2029,nationalCaps:5,nationalGoals:3,competitions:[]}]};
 const report=selectionReport(s);
 assert.equal(report.caps,5);assert.equal(report.goals,3);assert.equal(report.hasFixtures,false);
 assert.match(selectionPanel(s,c=>({name:'Chile'}),()=>''),/VICTORIAS \/ EMP. \/ DER./);
 assert.match(selectionPanel(s,c=>({name:'Chile'}),()=>''),/no todos los resultados/);
});
test('selección: no mostrar estadísticas si nunca hubo internacionalidades',()=>{
 assert.equal(selectionPanel({country:'CL',history:[{nationalCaps:0,competitions:[]}]},()=>({name:'Chile'}),()=>''),'');
});
test('selección: texto escapado y portería a cero diferenciada del dato individual',()=>{
 const report=selectionPanel({...state,position:'POR'},()=>({name:'<Chile>'}),()=>'<span>🇨🇱</span>');
 assert.match(report,/&lt;Chile&gt;/);
 assert.match(report,/ARQUERO/);
 assert.match(report,/porterías a cero del equipo/);
 assert.match(report,/DESGLOSE POR COMPETICIÓN/);
});
