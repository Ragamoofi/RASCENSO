import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const file=(name)=>readFileSync(new URL('../src/'+name,import.meta.url),'utf8');
test('el arranque de RASCENSO instala guardia de scroll antes del render',()=>{
 const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
 const startup=file('experience494.mjs');
 assert.match(html,/experience494\.mjs\?v=501/);
 assert.match(startup,/import '\.\/scroll-guard499\.mjs'/);
 assert.ok(startup.indexOf('scroll-guard499.mjs')<startup.indexOf("import('./experience.mjs"));
});
test('la ventana de club devuelve el foco sin desplazar la página',()=>{
 const ui=file('club-ui495.mjs');
 assert.match(ui,/preventScroll:true/);
 assert.match(ui,/saveScroll/);
 assert.match(ui,/restoreScroll/);
});
test('el controlador conserva scroll de la página y paneles tras clics y Enter',()=>{
 const script=file('scroll-guard499.mjs');
 assert.match(script,/scrollTop/);
 assert.match(script,/scrollTo/);
 assert.match(script,/requestAnimationFrame/);
 assert.match(script,/keydown/);
});
