import test from 'node:test';
import assert from 'node:assert/strict';
import {FIELD_SCENES} from '../src/scenes-field.mjs';
import {aiStats,playerStats} from '../src/plays30.mjs';
function pass(button){const play={difficulty:.5,pressure:40,fatigue:0},stats=playerStats({attributes:{pace:70,shot:70,pass:70,dribble:70,defense:70,physical:70}},play);const m={play,stats,ai:aiStats(play),rand:()=>.5,aimNoise:()=>0,t:1,pointer:{wx:42,wy:11},say(){},finish(success,detail){this.result={success,detail};}};const scene=FIELD_SCENES.pase_filtrado;scene.init(m);m.strikers[0].x=35;m.strikers[0].y=11;m.strikers[1].x=34;m.strikers[1].y=22;scene.down(m,button);return m;}
test('el pase bombeado evita trayectorias rasas y el control derecho no altera el fuera de juego',()=>{
 const ground=pass('main'),lob=pass('alt');assert.ok(ground.ball.vx>0);assert.equal(ground.ball.vz,0);assert.ok(lob.ball.vz>0);assert.ok(lob.ball.g>0);assert.equal(lob.result,undefined);
});
