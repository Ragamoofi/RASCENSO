import test from 'node:test';
import assert from 'node:assert/strict';
import {File} from 'node:buffer';
import {zipEntries,importFM26Local} from '../src/fm26-local.mjs';
function zipStored(name,body){
 const file=Buffer.from(body),n=Buffer.from(name),local=Buffer.alloc(30+n.length+file.length),central=Buffer.alloc(46+n.length),end=Buffer.alloc(22);
 local.writeUInt32LE(0x04034b50,0);local.writeUInt16LE(20,4);local.writeUInt32LE(file.length,18);local.writeUInt32LE(file.length,22);local.writeUInt16LE(n.length,26);
 n.copy(local,30);file.copy(local,30+n.length);
 central.writeUInt32LE(0x02014b50,0);central.writeUInt16LE(20,4);central.writeUInt16LE(20,6);central.writeUInt32LE(file.length,20);central.writeUInt32LE(file.length,24);central.writeUInt16LE(n.length,28);central.writeUInt32LE(0,42);
 n.copy(central,46);
 end.writeUInt32LE(0x06054b50,0);end.writeUInt16LE(1,8);end.writeUInt16LE(1,10);end.writeUInt32LE(central.length,12);end.writeUInt32LE(local.length,16);
 return Buffer.concat([local,central,end]);
}
test('ZIP del usuario se indexa por ruta, sin cargar todos los shards',()=>{
 const payload=zipStored('RASCENSO/runtime/indice_clubes.json','{}');
 const index=zipEntries(new Uint8Array(payload));
 assert.equal(index.size,1);
 assert.equal(index.get('RASCENSO/runtime/indice_clubes.json').size,2);
 assert.throws(()=>zipEntries(new Uint8Array([1,2,3])),/ZIP inválido/);
});
test('Sin CSV de género y JSON verificado no se activa una sola ficha de FM26',async()=>{
 const file=new File([zipStored('RASCENSO/runtime/indice_clubes.json','{}')],'paquete.zip');
 const r=await importFM26Local([file]);
 assert.equal(r.loaded,0);assert.equal(r.players,0);
 assert.match(r.notice,/género/);
});
