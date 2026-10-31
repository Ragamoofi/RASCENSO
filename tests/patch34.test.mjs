import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {keyboardDirection} from '../src/match2d.mjs';

test('3.4: WASD y flechas permiten movimiento diagonal normalizado',()=>{
 const d=Math.SQRT1_2;
 for(const [keys,x,y] of [
  [['KeyW','KeyD'],d,-d],[['KeyW','KeyA'],-d,-d],
  [['KeyS','KeyD'],d,d],[['KeyS','KeyA'],-d,d],
  [['ArrowUp','ArrowRight'],d,-d],[['KeyW','ArrowRight'],d,-d]
 ]){
  const v=keyboardDirection(new Set(keys));
  assert.ok(Math.abs(v.x-x)<1e-12);
  assert.ok(Math.abs(v.y-y)<1e-12);
 }
 assert.deepEqual(keyboardDirection(new Set(['KeyW','KeyS'])),{x:0,y:0});
 assert.deepEqual(keyboardDirection(new Set()),{x:0,y:0});
});

test('3.4: ajustes accesibles durante draft, contratos y carrera',()=>{
 const ui=readFileSync(new URL('../src/experience.mjs',import.meta.url),'utf8');
 const css=readFileSync(new URL('../experience.css',import.meta.url),'utf8');
 const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
 assert.match(ui,/gear-trigger/);
 assert.match(ui,/shell\(draftScreen\(\),showNew\?tools\(\):''\)/);
 assert.match(ui,/shell\(state\.dnaReviewed===false\?dnaReview\(\):academy\(\),showNew\?tools\(\):''\)/);
 for(const action of ['ui-cycle-ambience','ui-toggle-vivid','ui-toggle-cardfx','ui-toggle-compact','ui-reset'])assert.ok(ui.includes(action));
 assert.ok(css.length>130000&&css.includes('z-index:30000'));
 const cssVersion=html.match(/experience\.css\?v=(\d+)/)?.[1];
 assert.ok(cssVersion,'El HTML debe declarar versión de caché para CSS');
 assert.ok(html.includes('src/experience.mjs?v='+cssVersion),'CSS y módulo principal deben usar la misma versión');
});
