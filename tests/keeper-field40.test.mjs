import test from 'node:test';
import assert from 'node:assert/strict';
import {FIELD_SCENES} from '../src/scenes-field.mjs';
import {aiStats,playerStats} from '../src/plays30.mjs';
function setup(){const play={difficulty:.5,pressure:40,fatigue:0};const stats=playerStats({attributes:{pace:70,shot:70,pass:70,dribble:70,defense:70,physical:70}},play);
 const m={play,stats,ai:aiStats(play),rand:()=>.5,t:1,pointer:{wx:49,wy:20},say(){},finish(success,detail){this.result={success,detail};},steer(){}};const scene=FIELD_SCENES.achique;scene.init(m);return {m,scene};}
test('el arquero puede lanzarse manualmente tras el remate y moverse hacia la zona elegida',()=>{
 const {m,scene}=setup();m.ball.owner=null;m.ball.x=30;m.ball.y=4;m.ball.vx=5;m.ball.vy=0;m.ball.z=0;m.shotAt=m.t;
 const y=m.me.y;scene.down(m);assert.ok(m.me.diveTime>0);scene.update(m,.05);assert.ok(m.me.y>y);assert.equal(m.result,undefined);
});
test('un achique cercano depende de la posición y los reflejos sin tirada oculta',()=>{
 const run=()=>{const {m,scene}=setup();m.st.x=49.9;m.st.y=m.me.y;scene.down(m);return m.result;};
 assert.deepEqual(run(),run());assert.equal(run().detail,'atajada');
});
test('un disparo detenido lejos del arquero sigue en disputa',()=>{
 const {m,scene}=setup();m.ball.owner=null;m.ball.x=44;m.ball.y=10;m.ball.z=0;m.ball.vx=0;m.ball.vy=0;m.ball.vz=0;m.shotAt=m.t;m.st.x=36;m.st.y=10;scene.update(m,.05);assert.equal(m.result,undefined);
});
