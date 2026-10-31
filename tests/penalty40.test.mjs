import test from 'node:test';
import assert from 'node:assert/strict';
import {GOAL_SCENES} from '../src/scenes-goal.mjs';
import {aiStats} from '../src/plays30.mjs';
function match(){return {play:{memory:[]},stats:{nerves:0,aimNoise:.5,power:.6},ai:aiStats({difficulty:.5}),rand:()=>.5,aimNoise:n=>n,t:0,pointer:{x:600,y:300},finish(success,detail){this.result={success,detail};}};}
test('penal colocado via clic derecho reduce desvío a costa de menor velocidad',()=>{
 const scene=GOAL_SCENES.penal;const make=style=>{const m=match();scene.init(m);scene.down(m,style);m.t=.8;scene.up(m);return m.ball;};
 const power=make('main'),placed=make('alt');assert.ok(placed.T>power.T);assert.ok(placed.gx<power.gx);assert.equal(placed.placed,true);
});
test('una atajada tiene desvío visible antes de cerrar el resultado',()=>{
 const m=match(),scene=GOAL_SCENES.penal;scene.init(m);m.k={x:0,p:0};m.keeperDelay=999;m.ball={t:0,T:.1,gx:0,gz:1.25,pw:.5};m.report={dir:.5};
 scene.update(m,.1);assert.equal(m.ball.saved,true);assert.equal(m.ball.contact,'guantes');assert.equal(m.result,undefined);
 scene.update(m,.46);assert.equal(m.result.detail,'atajado');assert.equal(m.result.dir,.5);
});
