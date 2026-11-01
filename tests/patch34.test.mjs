import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
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
 const secondaryCssVersion=html.match(/visual44\.css\?v=(\d+)/)?.[1];
 assert.equal(secondaryCssVersion,cssVersion,'Las hojas de estilo deben compartir versión de caché');
 // La entrada puede ser experience.mjs o un módulo de arranque como experience494.mjs.
 // Validamos el script REAL referenciado por HTML, sin asumir un nombre fijo antiguo.
 const entry=html.match(/<script\s+type=["']module["']\s+src=["']\.\/src\/(experience\d*)\.mjs\?v=(\d+)["']/);
 assert.ok(entry,'HTML debe cargar un módulo principal de RASCENSO versionado');
 assert.equal(entry[2],cssVersion,'CSS y módulo principal deben usar la misma versión');
 const entryUrl=new URL('../src/'+entry[1]+'.mjs',import.meta.url);
 assert.ok(existsSync(entryUrl),'El módulo principal versionado debe existir');
 if(entry[1]!=='experience'){
  const wrapper=readFileSync(entryUrl,'utf8');
  assert.match(wrapper,/import\(['"]\.\/experience\.mjs\?v=\d+['"]\)/,
   'El módulo de arranque debe cargar el motor/interfaz original');
 }
});
