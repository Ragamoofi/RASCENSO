/* FM26 privado en navegador: abre el ZIP local SIN publicarlo ni descargarlo al servidor.
 * Los mapeos pendientes del paquete se rechazan. Los aprobados requieren evidencia
 * externa del país y género de cada UID (clubs.csv/nations.csv o fuente fiable). */
import {registerFM26Club,clearFM26Memory,loadedFM26Clubs,verifyFM26Mapping} from './fm26-real.mjs';
const DB_NAME='rascenso-fm26-private-v1',STORE='verified-clubs';
function openDB(){
 if(typeof indexedDB==='undefined')return Promise.reject(Error('IndexedDB no disponible'));
 return new Promise((resolve,reject)=>{const req=indexedDB.open(DB_NAME,1);
  req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains(STORE))req.result.createObjectStore(STORE)};
  req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error)});
}
async function storeClub(mapping,clubData){
 const db=await openDB();try{await new Promise((resolve,reject)=>{const tx=db.transaction(STORE,'readwrite');
 tx.objectStore(STORE).put({mapping,clubData,storedAt:Date.now()},mapping.clubId);
 tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error)})}finally{db.close()}
}
export async function restoreFM26Private(){
 const db=await openDB();const items=await new Promise((resolve,reject)=>{const tx=db.transaction(STORE,'readonly');
 const request=tx.objectStore(STORE).getAll();request.onsuccess=()=>resolve(request.result||[]);request.onerror=()=>reject(request.error)});
 db.close();clearFM26Memory();let n=0;
 for(const x of items){try{registerFM26Club(x.mapping,x.clubData);n++}catch{/* club no verificado: se ignora */}}
 return {clubs:n,players:loadedFM26Clubs().reduce((a,b)=>a+b.coverage,0)};
}
export async function forgetFM26Private(){
 const db=await openDB();await new Promise((resolve,reject)=>{const tx=db.transaction(STORE,'readwrite');
 tx.objectStore(STORE).clear();tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error)});
 db.close();clearFM26Memory();
}
const u16=(v,o)=>v.getUint16(o,true),u32=(v,o)=>v.getUint32(o,true);
export function zipEntries(bytes){
 const a=bytes instanceof Uint8Array?bytes:new Uint8Array(bytes);
 const v=new DataView(a.buffer,a.byteOffset,a.byteLength),dec=new TextDecoder();
 let end=-1;
 for(let i=a.length-22;i>=Math.max(0,a.length-65557);i--)if(u32(v,i)===0x06054b50){end=i;break}
 if(end<0)throw Error('ZIP inválido (sin directorio central)');
 const n=u16(v,end+10),offset=u32(v,end+16);if(n>30000)throw Error('ZIP demasiado grande');
 const entries=new Map();let at=offset;
 for(let i=0;i<n;i++){
  if(u32(v,at)!==0x02014b50)throw Error('Directorio ZIP corrupto');
  const method=u16(v,at+10),compressed=u32(v,at+20),size=u32(v,at+24),length=u16(v,at+28),extra=u16(v,at+30),comment=u16(v,at+32),local=u32(v,at+42);
  const name=dec.decode(a.subarray(at+46,at+46+length));
  if(!name.includes('..')&&!name.startsWith('/')&&!name.includes('\\'))entries.set(name,{method,compressed,size,local});
  at+=46+length+extra+comment;
 }
 return entries;
}
export async function unpackZIPEntry(bytes,entry){
 const a=bytes instanceof Uint8Array?bytes:new Uint8Array(bytes),v=new DataView(a.buffer,a.byteOffset,a.byteLength),at=entry.local;
 if(u32(v,at)!==0x04034b50)throw Error('Cabecera ZIP inválida');
 const start=at+30+u16(v,at+26)+u16(v,at+28),chunk=a.slice(start,start+entry.compressed);
 if(entry.size>12_000_000)throw Error('Archivo JSON demasiado grande para importación selectiva');
 if(entry.method===0)return chunk;
 if(entry.method!==8||typeof DecompressionStream==='undefined')throw Error('Este navegador no permite leer este ZIP; usa Chrome o Brave actualizado');
 const body=new Blob([chunk]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
 const out=new Uint8Array(await new Response(body).arrayBuffer());
 if(out.length!==entry.size)throw Error('Archivo ZIP truncado');
 return out;
}
async function jsonEntry(buffer,entry){return JSON.parse(new TextDecoder().decode(await unpackZIPEntry(buffer,entry)))}
const find=(files,end)=>[...files.keys()].find(k=>k.endsWith(end));
export async function importFM26Local(files,opts={}){
 const list=Array.from(files||[]),archive=list.find(f=>/\.zip$/i.test(f.name));
 if(!archive)throw Error('Selecciona el ZIP FM26 más el archivo de mapeos verificados');
 const mappingFile=list.find(f=>/\.json$/i.test(f.name)&&!/manifiesto|indice/i.test(f.name));
 const proofs=mappingFile?JSON.parse(await mappingFile.text()):{mappings:[]};
 const mappings=Array.isArray(proofs)?proofs:Array.isArray(proofs.mappings)?proofs.mappings:[];
 const valid=mappings.filter(m=>verifyFM26Mapping(m));
 if(!valid.length)return {loaded:0,players:0,pending:6,notice:'El ZIP no incluye clubs.csv ni certificación de género. Se requiere archivo separado con mapeos revisados antes de activar jugadores.'};
 const zip=new Uint8Array(await archive.arrayBuffer()),entries=zipEntries(zip);
 const indexName=find(entries,'/runtime/indice_clubes.json');
 if(!indexName)throw Error('ZIP sin runtime/indice_clubes.json');
 const index=await jsonEntry(zip,entries.get(indexName)),fileCache=new Map();
 let loaded=0,players=0;const errors=[];
 for(const m of valid){
  const info=index[String(m.fmUID)];
  if(!info){errors.push(m.clubId+': FM UID inexistente');continue}
  const file=find(entries,'/'+info.archivo);
  if(!file){errors.push(m.clubId+': shard no encontrado');continue}
  let shard=fileCache.get(file);
  if(!shard){shard=await jsonEntry(zip,entries.get(file));fileCache.set(file,shard)}
  const club=shard.clubes.find(c=>String(c.club_uid)===String(m.fmUID)&&String(c.pais_id_fm)===String(info.pais_id_fm));
  if(!club){errors.push(m.clubId+': UID o país no coincide');continue}
  try{const r=registerFM26Club(m,club);await storeClub(m,club);loaded++;players+=r.players}
  catch(e){errors.push(m.clubId+': '+e.message)}
 }
 return {loaded,players,pending:mappings.length-valid.length,errors};
}
