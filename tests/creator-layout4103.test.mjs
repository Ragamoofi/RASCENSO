import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const source=f=>readFileSync(new URL('../'+f,import.meta.url),'utf8');
const js=source('src/creator-layout4103.mjs'),css=source('src/creator-layout4103.css'),html=source('index.html');

test('identidad mantiene edad y pierna en el bloque superior sin crear subpestañas',()=>{
 assert.match(js,/cr4103-ident-inline/);
 assert.match(js,/left\.append\(inlineBoard\)/);
 assert.match(js,/groups\.filter\(group=>!nested\.includes\(group\)\)/);
 assert.match(css,/\.creator4103 \.cr4103-ident-inline\{grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
});

test('la tarjeta lateral recibe un fondo más trabajado y actualizado a 4.10.3',()=>{
 assert.match(js,/RASCENSO 4\.10\.3 · IDENTIDAD ARMONIZADA/);
 assert.match(css,/\.cr3:has\(\.creator4103\) \.cr-poster \.poster-kit-wrap\{/);
 assert.match(html,/creator-layout4103\.css\?v=506/);
 assert.match(html,/creator-layout4103\.mjs\?v=506/);
});

test('el buscador de Sueños sigue presente',()=>{
 assert.match(js,/cr4102-club-input/);
 assert.match(js,/manual\.append\(original\)/);
});
