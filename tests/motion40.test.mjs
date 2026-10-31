import test from 'node:test';
import assert from 'node:assert/strict';
import {steerMotion,keyboardDirection} from '../src/match2d.mjs';
test('aceleración, frenado y movimiento diagonal mantienen el límite de velocidad',()=>{
 const e={x:0,y:0,vx:0,vy:0,stun:0};const d=keyboardDirection(new Set(['KeyW','KeyD']));
 steerMotion(e,d.x,d.y,8,1/60);assert.ok(Math.hypot(e.vx,e.vy)>0&&Math.hypot(e.vx,e.vy)<8);
 for(let i=0;i<120;i++){steerMotion(e,d.x,d.y,8,1/60);assert.ok(Math.hypot(e.vx,e.vy)<=8+1e-9);}
 const speed=Math.hypot(e.vx,e.vy);steerMotion(e,0,0,8,1/60);assert.ok(Math.hypot(e.vx,e.vy)<speed);for(let i=0;i<60;i++)steerMotion(e,0,0,8,1/60);assert.ok(Math.hypot(e.vx,e.vy)<1e-8);
});
