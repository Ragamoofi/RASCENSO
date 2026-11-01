import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const html=read('index.html'),js=read('src/creator-layout4101.mjs'),css=read('src/creator-layout4101.css');
test('el nuevo creador carga después del motor existente sin romper la entrada',()=>{
 assert.match(html,/experience494\.mjs\?v=502/);
 assert.match(html,/src\/creator-layout4101\.mjs\?v=503/);
 assert.match(html,/src\/creator-layout4101\.css\?v=503/);
 assert.ok(html.indexOf('experience494.mjs')<html.indexOf('creator-layout4101.mjs'));
});
test('las seis etapas permanecen presentes, y cinco incluyen navegación por categorías',()=>{
 for(const i of [0,1,2,3,4])assert.match(js,new RegExp(' '+i+':\\['));
 assert.match(js,/step===5/);
 assert.match(js,/role="tabpanel"|setAttribute\('role','tabpanel'\)/);
 assert.match(js,/preferred\.set\(step,cur\)/);
 assert.match(js,/MutationObserver\(schedule\)/);
});
test('buscador de clubes conserva el select original y el evento de cambio de RASCENSO',()=>{
 assert.match(js,/select\[name="fanClubId"\]/);
 assert.match(js,/select\.value=id/);
 assert.match(js,/new Event\('change',\{bubbles:true\}\)/);
 assert.match(js,/options\.filter\(o=>normalize\(o\.name\)/);
 assert.match(js,/type='search'/);
});
test('el modo compacto conserva tarjetas y sus decisiones sin tocar los módulos del motor',()=>{
 assert.match(css,/\.creator4101-pane \.cr-grid\.c5/);
 assert.match(css,/\.creator4101-summary \.cr-sumgrid/);
 assert.match(css,/@media\(max-width:560px\)/);
 assert.doesNotMatch(js,/localStorage\.clear|removeItem\(|window\.location\.reload/);
});
