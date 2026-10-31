import test from 'node:test';
import assert from 'node:assert/strict';
import {passLaneSpace} from '../src/scenes-field.mjs';
test('la señal del pase usa la distancia a la línea y no altera la posesión',()=>{
 const a={x:0,y:0},b={x:10,y:0};assert.equal(passLaneSpace(a,b,[{x:5,y:0}]),0);assert.equal(passLaneSpace(a,b,[{x:5,y:3}]),3);assert.equal(passLaneSpace(a,b,[]),Infinity);
});
