import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const html=read('index.html');
const js=read('src/creator-layout4102.mjs');
const css=read('src/creator-layout4102.css');
test('creador 4.10.2 reemplaza las subpestañas de 4.10.1',()=>{
 assert.match(html,/experience494\.mjs\?v=502/);
 assert.match(html,/creator-layout4102\.mjs\?v=504/);
 assert.match(html,/creator-layout4102\.css\?v=504/);
 assert.doesNotMatch(html,/creator-layout4101\.(?:css|mjs)/);
});
test('todas las decisiones siguen presentes, en un único tablero por etapa',()=>{
 for(const i of [0,1,2,3,4,5])assert.match(js,new RegExp('step==='+i+'[){]'));
 assert.match(js,/cr4102-board/);
 assert.doesNotMatch(js,/role','tabpanel'|creator4101-nav|aria-selected.*cur/);
 assert.match(js,/MutationObserver\(schedule\)/);
});
test('el selector de clubes conserva su valor y emite cambio al creador original',()=>{
 assert.match(js,/select\[name="fanClubId"\]/);
 assert.match(js,/select\.value=b\.dataset\.clubChoice/);
 assert.match(js,/new Event\('change',\{bubbles:true\}\)/);
 assert.match(js,/type='search'/);
});
test('opciones tipo planilla y detalle único conservan controles originales',()=>{
 assert.match(css,/\.cr4102-choice/);
 assert.match(css,/\.cr4102-detail/);
 assert.match(js,/classList\.remove\('cr-card','compact'\)/);
 assert.match(js,/chips\.cloneNode\(true\)/);
 assert.doesNotMatch(js,/localStorage\.clear|removeItem\(|window\.location\.reload/);
});
