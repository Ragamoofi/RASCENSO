import test from 'node:test';
import assert from 'node:assert/strict';
import {gzipSync} from 'node:zlib';
import {primeWorldHighlights493,worldTopPlayers493,worldGeneration493,isWorldHighlightsReady493} from '../src/world-highlights493.mjs';

// El servidor se sustituye por un catálogo sintético; ninguna descarga ni dato FM es necesario.
test('ranking mundial y generación: identidad, edad, bandera y club propio de cada jugador',async()=>{
 const directory=[
  ['fm26:1','Kylian Mbappé',27,'STC',195,'1734','143'],
  ['fm26:2','Lamine Yamal',18,'AMR',172,'1708','170'],
  ['fm26:3','Futbolista chileno',18,'STC',124,'399','190'],
  ['fm26:4','Thibaut Courtois',33,'GK',174,'1734','131'],
  ['fm26:5','Jugador libre',19,'MC',70,'','195']
 ];
 const index={'1734':{nombre:'Real Madrid'},'1708':{nombre:'Barcelona'},'399':{nombre:'Colo-Colo'}};
 const manifest={schema:'rascenso-bundled-world-v1',total:180739,shards:311,directory:'directory.json.gz',clubIndex:'club-index.json.gz'};
 const originalFetch=globalThis.fetch;
 globalThis.fetch=async url=>{
  const name=String(url);
  if(name.endsWith('/manifest.json'))return new Response(JSON.stringify(manifest),{status:200});
  if(name.endsWith('/directory.json.gz'))return new Response(gzipSync(JSON.stringify(directory)),{status:200});
  if(name.endsWith('/club-index.json.gz'))return new Response(gzipSync(JSON.stringify(index)),{status:200});
  return new Response(null,{status:404});
 };
 try{
  assert.equal(await primeWorldHighlights493(),true);
  assert.equal(isWorldHighlightsReady493(),true);
  const s={age:18,world:{year:2026}};
  const top=worldTopPlayers493(s,10);
  assert.equal(top[0].name,'Kylian Mbappé');
  assert.equal(top.find(p=>p.name==='Kylian Mbappé').cc,'FR');
  assert.equal(top.find(p=>p.name==='Lamine Yamal').cc,'ES');
  assert.equal(top.find(p=>p.name==='Thibaut Courtois').cc,'BE');
  assert.equal(top.find(p=>p.name==='Kylian Mbappé').clubName,'Real Madrid');
  assert.equal(top.find(p=>p.name==='Jugador libre').clubName,'Agente libre');
  assert.equal(new Set(top.map(p=>p.id)).size,top.length);
  const generation=worldGeneration493(s,12);
  assert.ok(generation.some(p=>p.name==='Lamine Yamal'));
  assert.ok(generation.every(p=>Math.abs(p.age-s.age)<=2));
  assert.equal(worldGeneration493({age:22,world:{year:2030}},12).find(p=>p.name==='Lamine Yamal')?.age,22);
  assert.equal(worldTopPlayers493({age:18,world:{year:2050}},10).some(p=>p.age>=40),false);
 }finally{globalThis.fetch=originalFetch}
});
