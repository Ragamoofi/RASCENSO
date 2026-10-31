import test from 'node:test';
import assert from 'node:assert/strict';
import {FIELD_SCENES} from '../src/scenes-field.mjs';
import {aiStats,playerStats} from '../src/plays30.mjs';
test('el despeje se resuelve con el vuelo del balón y no al hacer clic',()=>{
 const play={difficulty:.5,pressure:40,fatigue:0};const stats=playerStats({attributes:{pace:70,shot:70,pass:70,dribble:70,defense:70,physical:70}},play);
 const m={play,stats,ai:aiStats(play),rand:()=>.5,aimNoise:()=>0,t:1,pointer:{wx:5,wy:4},say(){},finish(success,detail){this.result={success,detail};},steer(){}};
 const scene=FIELD_SCENES.despeje;scene.init(m);m.me.x=43;m.me.y=14;m.ball.owner=null;m.ball.x=43;m.ball.y=14;m.ball.z=1.2;m.st.x=50;m.st.y=25;
 scene.down(m);assert.equal(m.cleared,true);assert.equal(m.result,undefined);assert.ok(m.ball.vx<0);
 for(let i=0;i<300&&!m.result;i++){m.t+=1/60;scene.update(m,1/60);}
 assert.ok(m.result);assert.equal(m.result.success,true);assert.ok(['despeje','fuera'].includes(m.result.detail));
});
