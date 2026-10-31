import test from 'node:test';
import assert from 'node:assert/strict';
import {recoveryPassingOption,recoveryEscapeY} from '../src/scenes-field.mjs';
test('el rival busca la línea de pase con más espacio y evita opciones bloqueadas',()=>{
 const carrier={x:0,y:0},defender={x:5,y:0},blocked={x:10,y:0},open={x:0,y:10};
 assert.equal(recoveryPassingOption(carrier,defender,[blocked,open]),open);
 assert.equal(recoveryPassingOption(carrier,defender,[blocked]),null);
});
test('el portador se aleja bajo presión y respeta los límites de la cancha',()=>{
 const carrier={x:10,y:15},defender={x:10,y:14};
 assert.ok(recoveryEscapeY(carrier,defender,0,1)>recoveryEscapeY(carrier,defender,0,0));
 assert.ok(recoveryEscapeY({x:10,y:26},defender,0,1)<=26);
});
