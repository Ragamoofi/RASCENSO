import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import zlib from 'node:zlib';
import {fmNationToCode,fmNationName,FM_NATION_COUNT} from '../src/fm26-nations.mjs';
import {convertFM26} from '../src/fm26-real.mjs';
import {flag} from '../src/assets.mjs';

const examples=[
 ['143','FR','Kylian Mbappé'],['131','BE','Thibaut Courtois'],['195','UY','Federico Valverde'],
 ['139','EN','Jude Bellingham'],['189','BR','Vinícius Júnior'],['170','ES','Lamine Yamal'],
 ['11','EG','Mohamed Salah'],['33','NG','Victor Osimhen'],['219','XK','Amir Rrahmani'],
 ['190','CL','Alexis Sánchez'],['247','ME','Adam Marušić'],['242','FM','Lester James'],
 ['206','VG','Charley McMillan López'],['208','VI','Joshua Ramos'],['232','WF','Bob Scheidel']
];
test('ID numérico de nacionalidad FM26 -> bandera correcta; no se usa la del equipo',()=>{
 for(const [id,iso] of examples)assert.equal(fmNationToCode(id),iso,`ID ${id}`);
 assert.equal(FM_NATION_COUNT,223);
 assert.equal(fmNationToCode(null),null);
 assert.equal(fmNationToCode(''),null);
 assert.equal(fmNationToCode('999999'),null);
 assert.equal(fmNationToCode('FR'),null);
});
test('Las 180.739 fichas de la base mundial tienen un ID resuelto',()=>{
 const path=new URL('../assets/world-data/directory.json.gz',import.meta.url);
 if(!fs.existsSync(path))throw Error('No se encontró el directorio de futbolistas de RASCENSO 4.9');
 const roster=JSON.parse(zlib.gunzipSync(fs.readFileSync(path)));
 assert.equal(roster.length,180739);
 const missing=new Set();let wronglyChilean=0;
 for(const p of roster){const iso=fmNationToCode(p[6]);if(!iso)missing.add(p[6]);if(iso==='CL'&&String(p[6])!=='190')wronglyChilean++;}
 assert.deepEqual([...missing],[]);
 assert.equal(wronglyChilean,0);
 for(const [fmId,iso,name] of examples){
  const found=roster.find(p=>p[1]===name&&String(p[6])===fmId);
  assert.ok(found,`Jugador de control: ${name}, ID ${fmId}`);
  assert.equal(fmNationToCode(found[6]),iso);
 }
});
test('La ficha que usa rankings y premios ya posee cc real',()=>{
 const p=convertFM26({id:'fm26:85138874',nombre:'Kylian Mbappé',edad:27,ca_fm:195,pa_fm:196,
  posiciones:['AML'],nacion_fm:'143',stats:{}},'es-1');
 assert.equal(p.cc,'FR');assert.equal(p.fmNationId,'143');
});
test('Bandera desconocida nunca es Chile por defecto',()=>{
 const blank=flag(null);assert.match(blank,/Nacionalidad sin identificar/);assert.doesNotMatch(blank,/\/cl\.png/);
 assert.match(flag('CL'),/cl\.png/);
 assert.match(flag('EN'),/gb-eng\.png/);
 assert.match(flag('SC'),/gb-sct\.png/);
 assert.match(flag('SYC'),/sc\.png/);
 assert.match(flag('NIC'),/ni\.png/);
 assert.match(fmNationName('143'),/Francia/i);
});
