import test from 'node:test';
import assert from 'node:assert/strict';
import {rondoPressureTarget} from '../src/scenes-field.mjs';
test('la presión reparte balón, trayectoria y receptor según dificultad',()=>{
 const ball={x:10,y:10,vx:10,vy:0},receiver={x:20,y:15};
 assert.deepEqual(rondoPressureTarget(ball,receiver,0,.8),{x:10,y:10});
 assert.ok(rondoPressureTarget(ball,receiver,1,.8).x>10);
 assert.deepEqual(rondoPressureTarget(ball,receiver,2,.8),receiver);
 assert.notDeepEqual(rondoPressureTarget(ball,receiver,2,.2),receiver);
});
