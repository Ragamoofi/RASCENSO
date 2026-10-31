import test from 'node:test';
import assert from 'node:assert/strict';
import {FIELD_SCENES} from '../src/scenes-field.mjs';
import {aiStats,playerStats} from '../src/plays30.mjs';
function setup(type){
 const play={type,seed:'assist',difficulty:.5,pressure:40,fatigue:0};const stats=playerStats({attributes:{pace:75,shot:75,pass:75,dribble:75,defense:75,physical:75,skills:3,weak:3}},play);
 const m={play,stats,ai:aiStats(play),rand:()=>.2,aimNoise:()=>0,t:1,pointer:{wx:40,wy:10},say(){},finish(success,detail,quality,extra){this.result={success,detail,quality,...extra};}};
 const scene=FIELD_SCENES[type];scene.init(m);m.receiver=type==='pase_filtrado'?m.strikers[0]:m.mates[0];
 m.receiver.x=40;m.receiver.y=12;m.ball.owner=null;m.ball.x=40;m.ball.y=12;m.ball.vx=0;m.ball.vy=0;m.ball.z=0;m.quality=.9;m.passT=1;
 for(const d of m.defs){d.x=20;d.y=2;}m.k.x=51;m.k.y=20;
 if(type==='pase_filtrado')m.passed=true;else m.mode='pass';return {m,scene};
}
for(const type of ['pase_filtrado','contragolpe'])test(`${type}: el receptor remata antes de resolver la asistencia`,()=>{
 const {m,scene}=setup(type);scene.update(m,.01);assert.equal(m.finalizing,true);assert.equal(m.result,undefined);assert.ok(m.ball.vx>0);
 for(let i=0;i<300&&!m.result;i++){m.t+=1/60;scene.update(m,1/60);}
 assert.ok(m.result);if(m.result.success){assert.equal(m.result.credit,'assist');assert.equal(m.result.detail,'asistencia');}
});
