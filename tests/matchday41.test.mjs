import test from 'node:test';
import assert from 'node:assert/strict';
import {buildSeasonPlays,POSITION_PLAYS} from '../src/plays30.mjs';
import {matchdayPanel,rivalLedger} from '../src/matchday41.mjs';
import {chooseMatchRhythm} from '../src/engine.mjs';

const clubs={a:{name:'Club Local',country:'Chile'},b:{name:'Rival FC',country:'Chile'}};
const getClub=id=>clubs[id];
const career=(position='DC',extra={})=>({
 phase:'season',age:21,startAge:17,startYear:2026,seed:'partidos-41',clubId:'a',
 country:'CL',position,ovr:75,history:[],attributes:{pace:75,shot:80,pass:70,physical:70,defense:65,dribble:80},
 morale:75,matchRhythm:'equilibrado',...extra
});
const league={playerMatches:Array.from({length:30},(_,i)=>({round:i+1,home:i%2?'a':'b',away:i%2?'b':'a',score:'2-2',played:true,minutes:85}))};
const options={role:'Titular',rivalLevel:()=>70,tier:1,prestige:60};
const make=(s)=>buildSeasonPlays(s,league,getClub,options);

test('ofrece más partidos clave a titulares y variedad real por puesto',()=>{
 const fast=make(career('DC',{matchRhythm:'rapido'}));
 const balanced=make(career('DC',{matchRhythm:'equilibrado'}));
 const immersive=make(career('DC',{matchRhythm:'inmersivo'}));
 assert.equal(fast.length,3);assert.equal(balanced.length,5);assert.equal(immersive.length,7);
 assert.equal(new Set(immersive.map(p=>p.type)).size,immersive.length);
 assert.equal(new Set(immersive.map(p=>p.round)).size,immersive.length);
 for(const p of immersive)assert.ok(POSITION_PLAYS.DC.includes(p.type));
});
test('respeta las jugadas anteriores y el ritmo clásico',()=>{
 const old=make(career('DC',{__legacyPlays:true,matchRhythm:'inmersivo'}));
 assert.equal(old.length,3);
 assert.deepEqual(old.map(p=>p.type).sort(),make(career('DC',{__legacyPlays:true,matchRhythm:'rapido'})).map(p=>p.type).sort());
});
test('los distintos roles conservan oportunidades proporcionales',()=>{
 const s=career('MC',{matchRhythm:'inmersivo'});
 assert.equal(buildSeasonPlays(s,league,getClub,{...options,role:'Rotación'}).length,6);
 assert.equal(buildSeasonPlays(s,league,getClub,{...options,role:'Suplente'}).length,4);
});
test('el ritmo no se cambia después de jugar una jugada',()=>{
 const s=career('DC',{plays30:{year:2030,version:4,results:[{id:'a'}]}});
 assert.equal(chooseMatchRhythm(s,'inmersivo'),s);
 assert.equal(chooseMatchRhythm({...s,plays30:null},'inmersivo').matchRhythm,'inmersivo');
 assert.equal(chooseMatchRhythm(s,'no-existe'),s);
});
test('centro de partido muestra situación, CTA y calendario sin mutar datos',()=>{
 const s=career(),plays=make(s),snapshot=JSON.stringify(plays);
 const html=matchdayPanel(s,plays,getClub);
 assert.match(html,/CENTRO DE PARTIDO/);
 assert.match(html,/data-action="play-open"/);
 assert.match(html,/matchday-calendar/);
 assert.match(html,/FECHA/);
 assert.equal(JSON.stringify(plays),snapshot);
});
test('legado deriva rivales reales del historial y escapa nombres',()=>{
 const result=rivalLedger({history:[{year:2029,plays:[{rival:'<Rival FC>',success:true},{rival:'<Rival FC>',success:false}]}]});
 assert.match(result,/2 duelos/);assert.match(result,/&lt;Rival FC&gt;/);
 assert.doesNotMatch(result,/<Rival FC>/);
 assert.equal(rivalLedger({history:[]}), '');
});
