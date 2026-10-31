import test from 'node:test';
import assert from 'node:assert/strict';
import {FIELD_SCENES} from '../src/scenes-field.mjs';
import {aiStats,playerStats} from '../src/plays30.mjs';
function run(attackerX){const play={difficulty:.5,pressure:40,fatigue:0};const m={play,stats:playerStats({attributes:{pace:70,shot:70,pass:70,dribble:70,defense:70,physical:70}},play),ai:aiStats(play),rand:()=>.5,t:0,pointer:{down:false},keys:new Set(),say(){},finish(success,detail){this.result={success,detail};}};
 const scene=FIELD_SCENES.fuera_juego;scene.init(m);m.line=38;m.defs[0].x=42;for(let i=1;i<m.defs.length;i++)m.defs[i].x=38;for(const a of m.atts)a.x=attackerX;m.t=m.passT;scene.update(m,.01);return m;}
test('el fuera de juego usa la posición real del último defensor, no la orden de la línea',()=>{
 const on=run(40);assert.ok(on.actualLine>41);assert.equal(on.offside,false);
 const off=run(43);assert.equal(off.offside,true);assert.equal(off.result.detail,'fuera de juego');
});
