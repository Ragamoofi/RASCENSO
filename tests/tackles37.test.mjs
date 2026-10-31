import test from 'node:test';
import assert from 'node:assert/strict';
import {tackleTiming} from '../src/scenes-field.mjs';
test('la entrada premia acercarse y elegir el momento, sin depender de un dado oculto',()=>{
 const good=tackleTiming(.3,2,.17,.34,.65,.5);const late=tackleTiming(1.9,2,.01,.34,.65,.5);
 assert.equal(good.success,true);assert.equal(late.success,false);assert.ok(good.quality>late.quality);
 assert.deepEqual(good,tackleTiming(.3,2,.17,.34,.65,.5));
});
test('defensa y calidad del rival cambian el margen de una entrada igual',()=>{
 const weak=tackleTiming(1.4,2,.10,.34,.3,.8),strong=tackleTiming(1.4,2,.10,.34,.9,.2);
 assert.ok(strong.quality>weak.quality);assert.equal(weak.success,false);assert.equal(strong.success,true);
});
