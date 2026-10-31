import test from 'node:test';
import assert from 'node:assert/strict';
import {FIELD_SCENES} from '../src/scenes-field.mjs';
import {aiStats,playerStats} from '../src/plays30.mjs';
function setup(){const play={difficulty:.8,pressure:40,fatigue:0};const stats=playerStats({attributes:{pace:60,shot:60,pass:60,dribble:60,defense:60,physical:60}},play);const m={play,stats,ai:aiStats(play),rand:()=>.5,t:1,pointer:{wx:45,wy:15},say(){},finish(success,detail){this.result={success,detail};}};const scene=FIELD_SCENES.salida_aerea;scene.init(m);m.me.x=49;m.me.y=14;m.st.x=49;m.st.y=14;return {m,scene};}
test('una captura bien posicionada detiene el balón',()=>{const {m,scene}=setup();m.st.x=42;m.ball.x=49;m.ball.y=14;m.ball.z=2;scene.down(m);assert.equal(m.result.detail,'atajada');assert.equal(m.ball.owner,m.me);});
test('una captura exigida genera rebote sin inventar un gol inmediato',()=>{const {m,scene}=setup();m.stats.reflex=.2;m.stats.jump=.2;m.ball.x=m.me.x+1.6;m.ball.y=m.me.y;m.ball.z=0;scene.down(m);assert.equal(m.result,undefined);assert.equal(m.caught,undefined);assert.ok(m.ball.vz>0);});
