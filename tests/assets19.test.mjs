import test from 'node:test';
import assert from 'node:assert/strict';
import {portraitSlug,portraitSources} from '../src/portrait12.mjs';
import {officialKitSource} from '../src/kits19.mjs';
test('retratos locales verificados se muestran aunque el catálogo de URL esté vacío',()=>{
 const media={credits:[{kind:'portrait',name:'Lionel Messi'}]};
 assert.deepEqual(portraitSources('Lionel Messi',{},media),['./assets/portraits/lionel-messi.png']);
 assert.equal(portraitSources('Jugador sin foto',{},media).length,0);
 assert.equal(portraitSlug('Andrés Iniesta'),'andres-iniesta');
});
test('retratos Commons usan PNG local antes del respaldo remoto',()=>{
 const sources=portraitSources('Thierry Henry',{'Thierry Henry':{url:'https://upload.wikimedia.org/wikipedia/commons/photo.jpg'}},{});
 assert.equal(sources.length,1);assert.match(sources[0],/^https:\/\/upload.wikimedia.org\//);
});
test('fotos reales remotas no son tapadas por PNGs de respaldo decorativo',()=>{
 const url='https://upload.wikimedia.org/wikipedia/commons/paolo.jpg';
 assert.deepEqual(portraitSources('Paolo Maldini',{'Paolo Maldini':{url}},{}),[url]);
 assert.deepEqual(portraitSources('Paolo Maldini',{'Paolo Maldini':{url}},{credits:[{kind:'portrait',name:'Paolo Maldini'}]}),['./assets/portraits/paolo-maldini.png',url]);
});
test('las equipaciones solo cargan rutas registradas válidas, nunca diseños inventados',()=>{
 assert.equal(officialKitSource('CL',{CL:'chile-home-2026.png'}),'./assets/kits/official/chile-home-2026.png');
 assert.equal(officialKitSource('AR',{}),null);
 assert.equal(officialKitSource('CL',{CL:'../hack.png'}),null);
 assert.equal(officialKitSource('CL',{CL:'https://suspicious.example/x.png'}),null);
});