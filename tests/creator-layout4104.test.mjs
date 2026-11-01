import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const js=read('src/creator-layout4103.mjs');
const css=read('src/creator-layout4103.css');
const html=read('index.html');

test('Futbolista usa una cabecera compacta y muestra las cuatro decisiones simultáneamente',()=>{
 assert.match(js,/else if\(step===2\)\{/);
 assert.match(js,/split\?\.classList\.add\('cr4102-profile-intro','cr4104-profile-banner'\)/);
 assert.match(js,/const groupBoard=board\(groups,'cr4102-player-board cr4104-player-board'\)/);
 assert.match(js,/\['FORTALEZA','DEBILIDAD','ESTILO','DESARROLLO'\]/);
 assert.doesNotMatch(js,/createElement\('nav'\)|tabpanel|creator4101-nav/);
});

test('las opciones originales y bonos permanecen vivos y accesibles',()=>{
 assert.match(js,/labels\.forEach\(label=>/);
 assert.match(js,/label\.classList\.remove\('cr-card','compact'\)/);
 assert.match(js,/chips\.cloneNode\(true\)/);
 assert.match(js,/detail\.setAttribute\('aria-live','polite'\)/);
 assert.match(css,/\.creator4104 \.cr4104-choice-section \.cr4102-choice\.on/);
});

test('el panel técnico usa dos columnas y atributos sin perder adaptación',()=>{
 assert.match(css,/\.creator4104 \.cr4104-profile-banner\.cr-split\.profile/);
 assert.match(css,/\.creator4104 \.cr4104-profile-banner \.cr-profile\{/);
 assert.match(css,/\.creator4104 \.cr4104-player-board\{/);
 assert.match(css,/@media\(max-width:1650px\)/);
 assert.match(css,/@media\(max-width:630px\)/);
});

test('se actualiza la versión sin depender de la caché previa ni modificar el motor',()=>{
 const style=html.match(/creator-layout4103\.css\?v=(\d+)/)?.[1];
 const module=html.match(/creator-layout4103\.mjs\?v=(\d+)/)?.[1];
 assert.ok(style,'estilo activo presente');
 assert.equal(module,style,'scripts y estilos deben compartir versión de caché');
 assert.match(html,/RASCENSO 4\.(?:10\.(?:[4-9]|[1-9]\d+)|11\.\d+) · /); // Nueva versión sin bloquear las siguientes
 assert.match(html,/experience494\.mjs\?v=502/);
 assert.doesNotMatch(js,/localStorage\.clear|window\.location\.reload/);
});
