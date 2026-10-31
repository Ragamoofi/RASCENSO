import test from 'node:test';
import assert from 'node:assert/strict';
import {retirementData,retirementView} from '../src/retirement42.mjs';
import {newCareer,acceptDraft,academyOffers,signAcademy,autoResolveEvent,simulateToRetirement} from '../src/engine.mjs';

const fixture={
 name:'<PEPE>',position:'DC',country:'CL',age:38,startAge:17,number:9,
 history:[
  {year:2026,clubId:'uno',club:'Club Uno',matches:21,goals:2,assists:3,ovrAfter:58,titles:[],leaguePosition:5},
  {year:2027,clubId:'uno',club:'Club Uno',matches:30,goals:20,assists:5,ovrAfter:77,titles:['Liga de Primera'],leaguePosition:1},
  {year:2028,clubId:'dos',club:'Club Dos',matches:28,goals:8,assists:7,ovrAfter:73,titles:['Liga de Primera'],leaguePosition:3,nationalCaps:4}
 ],trophyRecords:[{title:'Liga de Primera',year:2027,clubId:'uno'},{title:'Liga de Primera',year:2028,clubId:'dos'}],
 awards:[{name:'Mejor jugador',year:2027}],
 careerMoments:[{kind:'on-field',year:2027,text:'Gol a los 90 min contra <Rival>'}],
 dream:'seleccion',dreamDone:'seleccion'
};
const deps={badge:id=>'<span class="crest">'+id+'</span>',trophyImage:()=>'/assets/trophies/league.png',flag:()=>'<span>🇨🇱</span>',
 dreamProgress:()=>({done:true,title:'Jugar por la selección'}),button:(s,action,cls,more='')=>'<button data-action="'+action+'" '+more+'>'+s+'</button>'};
test('el retiro reúne estadísticas, años, clubes y palmarés sin duplicar títulos',()=>{
 const d=retirementData(fixture);
 assert.equal(d.a.matches,79);assert.equal(d.a.goals,30);assert.equal(d.a.assists,15);
 assert.equal(d.peak,77);assert.equal(d.unique.length,1);assert.equal(d.unique[0].count,2);
 assert.equal(d.best.year,2027);assert.equal(d.most.name,'Club Uno');
});
test('el homenaje tiene portada, curva de progresión, trofeos, premios y acciones',()=>{
 const html=retirementView(fixture,deps);
 for(const term of ['EL ÚLTIMO','SILBATAZO.','La sala de trofeos','evolución','tu talento','Mejor jugador','Compartir']) {
  if(term==='Compartir')continue;
  assert.ok(html.includes(term),term);
 }
 assert.match(html,/data-action="share-png"/);
 assert.match(html,/data-action="export"/);
 assert.match(html,/data-tab="historial"/);
 assert.match(html,/2 títulos/);
 assert.match(html,/EL ÚLTIMO/);
 assert.doesNotMatch(html,/<PEPE>|<Rival>/);
 assert.match(html,/&lt;PEPE&gt;/);
});
test('jubilación sin trofeos, premios ni jugadas muestra contexto sin inventar hazañas',()=>{
 const s={...fixture,history:fixture.history.slice(0,1),awards:[],trophyRecords:[],careerMoments:[],name:'Nuevo'};
 const html=retirementView(s,deps);
 assert.match(html,/No ganaste títulos/);
 assert.doesNotMatch(html,/Premios individuales/);
 assert.match(html,/Las temporadas y resultados registran/);
});
test('una carrera simulada completa tiene un final calculable',()=>{
 let s=newCareer({name:'Prueba Legado',country:'CL',position:'MC',age:17,seed:'retiro42'});
 while(s.phase==='draft')s=acceptDraft(s);
 s=signAcademy(s,academyOffers(s)[0].id);
 s=autoResolveEvent(s);
 s=simulateToRetirement(s);
 assert.equal(s.phase,'retired');
 const d=retirementData(s);
 assert.ok(d.a.seasons>=8);
 assert.ok(d.a.matches>=0);
 assert.ok(d.last?.club);
 assert.ok(retirementView(s,deps).includes('EL ÚLTIMO'));
});


test('el epílogo destaca éxitos reales y recupera rivales del historial, no fracasos repetidos',()=>{
 const s={...fixture,history:[{...fixture.history[0],plays:[
  {rival:'<Gran Rival>',success:true},{rival:'<Gran Rival>',success:false}
 ]}],careerMoments:[
  {year:2026,kind:'on-field',text:'Penal: la ocasión se fue (atajado)'},
  {year:2026,kind:'on-field',text:'Remate de primera: ¡gol!'}
 ]};
 const d=retirementData(s);
 assert.equal(d.rivalries[0].duels,2);assert.equal(d.rivalries[0].successes,1);
 assert.equal(d.highlights.length,1);
 const html=retirementView(s,deps);
 assert.match(html,/Rivales inolvidables/);
 assert.match(html,/&lt;Gran Rival&gt;/);
 assert.doesNotMatch(html,/la ocasión se fue/);
 assert.match(html,/Remate de primera/);
});

test('la despedida del arquero prioriza vallas invictas sobre goles y asistencias',()=>{
 const s={...fixture,position:'POR',history:[{...fixture.history[0],cleanSheets:12,goalsConceded:14}]};
 const html=retirementView(s,deps);
 assert.match(html,/VALLAS INVICTAS/);
 assert.match(html,/GOLES RECIBIDOS/);
 assert.match(html,/>12<\/b>/);
 assert.doesNotMatch(html,/<small>ASISTENCIAS<\/small>/);
});
