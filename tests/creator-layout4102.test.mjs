import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const source=f=>readFileSync(new URL('../'+f,import.meta.url),'utf8');
const js=source('src/creator-layout4102.mjs'),css=source('src/creator-layout4102.css');
test('sin navegación adicional ni paneles ocultos: una etapa es un tablero',()=>{
 assert.doesNotMatch(js,/createElement\('nav'\)|role.?=.?.?tab|pane\.hidden|data-creator4101-tab/);
 assert.match(js,/function board\(/);
 assert.match(js,/for\(const x of items\)/);
 assert.match(js,/if\(step===1\)|else if\(step===1\)/);
 assert.match(js,/else if\(step===4\)/);
});
test('los radios originales permanecen dentro de su label, no se recrean',()=>{
 assert.match(js,/labels\.forEach\(label=>/);
 assert.match(js,/label\.classList\.remove\('cr-card','compact'\)/);
 assert.doesNotMatch(js,/replaceWith\(|new Event\('input'/);
});
test('el buscador de Sueños mantiene buscador y desplegable de respaldo',()=>{
 assert.match(js,/cr4102-fan-search/);
 assert.match(js,/cr4102-fan-manual/);
 assert.match(js,/manual\.append\(original\)/);
 assert.match(css,/\.cr4102-club-input/);
});
test('la plantilla usa dos columnas amplias y adapta a móviles',()=>{
 assert.match(css,/grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
 assert.match(css,/@media\(max-width:880px\)/);
 assert.match(css,/@media\(max-width:500px\)/);
});
