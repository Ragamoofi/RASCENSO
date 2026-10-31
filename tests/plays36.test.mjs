import test from 'node:test';
import assert from 'node:assert/strict';
import {sweptKeeperContact} from '../src/scenes-field.mjs';
import {stakes} from '../src/match2d.mjs';
test('colisión considera altura real y se detiene en la línea de gol',()=>{
 const k={x:50,y:14.5};
 assert.equal(sweptKeeperContact({x:49,y:14.5,z:4},{x:51,y:14.5,z:1.4},k,.4),false);
 assert.equal(sweptKeeperContact({x:49,y:14.5,z:1},{x:51,y:14.5,z:1},k,.4),true);
 assert.equal(sweptKeeperContact({x:51,y:14.5,z:1},{x:54,y:14.5,z:1},{x:53,y:14.5},.4),false);
});
test('las instrucciones del marcador no prometen el resultado final antes de tiempo',()=>{
 const p={kind:'attack',before:{gf:0,ga:0},minute:28};assert.match(stakes(p),/ventaja/);assert.doesNotMatch(stakes(p),/victoria/);
 assert.match(stakes({...p,kind:'defend',before:{gf:2,ga:1}}),/empate/);
});
