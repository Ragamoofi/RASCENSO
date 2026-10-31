import test from 'node:test';
import assert from 'node:assert/strict';
import {keeperPose,keeperCovers,GOAL_SCENES} from '../src/scenes-goal.mjs';
import {aiStats,playerStats} from '../src/plays30.mjs';
import {rng} from '../src/career20.mjs';

test('la zona del guante coincide con la posición dibujada durante la estirada',()=>{
 for(const p of [0,.25,.5,.75,1]){const k={x:0,dx:2.6,dz:2,p};const q=keeperPose(k);assert.ok(keeperCovers(k,q.hx,q.hz));assert.equal(keeperCovers(k,-3,2.3),false);}
});

test('el penal genera goles y atajadas según la dificultad, sin acertar todos los tiros',()=>{
 function simulate(difficulty){const results={gol:0,atajado:0,otros:0};for(let i=0;i<1000;i++){
  const play={memory:[.2,.3],difficulty,pressure:65,fatigue:.25};const random=rng('rate'+i+'penal');
  const m={play,stats:playerStats({attributes:{pace:75,shot:75,pass:75,dribble:75,defense:75,physical:75,skills:3,weak:3},morale:72},play),ai:aiStats(play),rand:random,t:0,pointer:{x:695,y:230},aimNoise(n){return (random()*2-1)*n;},finish(success,detail,quality){this.result={success,detail,quality};}};
  const s=GOAL_SCENES.penal;s.init(m);s.down(m);m.t=.9;s.up(m);for(let t=0;t<2&&!m.result;t+=1/120){m.t+=1/120;s.update(m,1/120);}assert.ok(m.result);results[m.result.detail in results?m.result.detail:'otros']++;
 }return results;}
 const easy=simulate(.2),hard=simulate(.9);assert.ok(hard.atajado>easy.atajado);assert.ok(hard.atajado>20);assert.ok(hard.gol>100);
});
