import test from 'node:test';
import assert from 'node:assert/strict';
import {GOAL_SCENES} from '../src/scenes-goal.mjs';
import {FIELD_SCENES,tackleTiming} from '../src/scenes-field.mjs';
import {aiStats,playerStats} from '../src/plays30.mjs';
function setup(type){const play={type,difficulty:.5,pressure:40,fatigue:0,memory:[]};const stats=playerStats({attributes:{pace:75,shot:75,pass:75,dribble:75,defense:75,physical:75,skills:3,weak:3}},play);const m={play,stats,ai:aiStats(play),rand:()=>.5,aimNoise:()=>0,t:0,pointer:{x:480,y:310,wx:52,wy:16},say(){},finish(success,detail){this.result={success,detail};}};const scene=GOAL_SCENES[type]||FIELD_SCENES[type];scene.init(m);return {m,scene};}
test('el penal atajado muestra un desvío antes del resultado',()=>{const {m,scene}=setup('penal_atajado');m.target=[0,1.25];m.ball={t:0,T:.1};m.k.x=0;scene.update(m,.1);assert.equal(m.ball.saved,true);assert.equal(m.result,undefined);scene.update(m,.46);assert.equal(m.result.detail,'atajada');});
test('la barrera salta durante un intervalo y vuelve a bajar',()=>{const {m,scene}=setup('tiro_libre');m.wall.forEach(w=>w.x=99);m.ball={t:0,T:2,gx:0,gz:1,pw:.5,curl:0,wallDelay:.1};scene.update(m,.3);assert.ok(m.wallJump>0);scene.update(m,.5);assert.equal(m.wallJump,0);});
test('el remate colocado del mano a mano viaja más lento que uno potente',()=>{const shot=button=>{const {m,scene}=setup('mano_a_mano');scene.down(m,button);return Math.hypot(m.ball.vx,m.ball.vy);};assert.ok(shot('alt')<shot('main'));});
test('el cansancio reduce el margen de una entrada',()=>{assert.ok(tackleTiming(1,2,.15,.34,.6,.5,0).quality>tackleTiming(1,2,.15,.34,.6,.5,.8).quality);});
