import test from 'node:test';
import assert from 'node:assert/strict';
import {newCareer,acceptDraft,academyOffers,signAcademy,autoResolveEvent,seasonMoment,playCareerMoment} from '../src/engine.mjs';
import {PERSONALITIES,STYLES,DREAMS} from '../src/engine.mjs';
import {ENVIRONMENTS,PUBLIC_IMAGES,RISK_PROFILES,DEVELOPMENT_PATHS,creatorIdentityEffects} from '../src/career08.mjs';
import {MINIGAME_MODES,memorySequence,memoryAccuracy,timingTarget,solveMoment} from '../src/moments15.mjs';
import {SEASON_AGENDAS} from '../src/agenda09.mjs';
function start(seed,position='DC'){let s=newCareer({name:'Prueba',position,country:'CL',seed});while(s.phase==='draft')s=acceptDraft(s,0);s=signAcademy(s,academyOffers(s)[0].id);return autoResolveEvent(s);}
test('más perfiles válidos al crear un futbolista',()=>{for(const [a,n] of [[PERSONALITIES,10],[STYLES,8],[DREAMS,8],[ENVIRONMENTS,8],[PUBLIC_IMAGES,7],[RISK_PROFILES,7],[DEVELOPMENT_PATHS,7]])assert.ok(a.length>=n);const s=newCareer({name:'A',style:'asociativo',personality:'solidario',developmentPath:'tardio'});assert.equal(s.developmentProfile,'tardio');assert.ok(creatorIdentityEffects(s).assists>1.1);});
test('las nuevas escenas incluyen arqueros, veteranos y defensa',()=>{assert.ok(SEASON_AGENDAS.length>=28);for(const id of ['goalkeeper-hero','veteran-mentor','defensive-order','continental-focus'])assert.ok(SEASON_AGENDAS.some(x=>x.id===id));});
test('las mecánicas nuevas están definidas según la jugada',()=>{for(const type of ['penal','libre','pase','corte','atajada','corner','cabeza','regate','centro','despeje','salida','achique'])assert.ok(MINIGAME_MODES[type]);});
test('fallar completamente el medidor impide un gol por azar',()=>{for(let i=0;i<10;i++){const s=start('miss'+i),m=seasonMoment(s);const miss=playCareerMoment(s,m.aim,timingTarget(m)<50?100:0);assert.equal(miss.clutchMoment.success,false);assert.equal(miss.clutchMoment.executionValid,false);}});
test('memoria incorrecta no puede tener resultado positivo',()=>{for(const type of ['pase','corner','salida']){const m={year:2030,round:22,home:'a',away:'b',type,aim:1,pressure:65};const seq=memorySequence(m);assert.equal(memoryAccuracy(m,seq),100);assert.equal(memoryAccuracy(m,[(seq[0]+1)%3,...seq.slice(1)]),0);const out=solveMoment(start('mem'+type,'MC'),m,1,timingTarget(m),0);assert.equal(out.clutchMoment.success,false);}});
