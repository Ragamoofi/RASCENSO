/* RASCENSO · Base mundial local: instalador COMPLETO de jugadores, sin archivos FM en GitHub.
 * Almacena 280 shards de clubes + 31 de libres en IndexedDB y SOLO carga equipos visibles.
 * Nombres/UID no equivalen a una certificación de género; nunca se infiere el sexo del jugador.
 */
import {COUNTRIES} from './countries.mjs';
import {fm26OVR,registerFM26Club,clearFM26Memory,isRealClubReady,getFM26Squad,getFM26PlayerById,loadedFM26Clubs} from './fm26-real.mjs';
import {zipEntries,unpackZIPEntry} from './fm26-local.mjs';
const DB='rascenso-fm26-world-v2',VERSION=1;
const CLUBS='shards',META='meta',DIR='directory',FREE='free';
const cleanup=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/&/g,' and ').replace(/\b(futbol club|football club|club deportivo|club de futbol|club social y deportivo)\b/g,' ').replace(/[^a-z0-9]+/g,' ').trim().replace(/\s+/g,' ');
const startsWithFM=(n)=>/\/runtime\/(por_pais\/[^/]+\.json|libres\/libres_\d+\.json|indice_clubes\.json|indice_agentes_libres\.json)$/.test(n);
const matchEnd=(m,suffix)=>[...m.keys()].find(n=>n.endsWith(suffix));
const fmtCount=arr=>arr.reduce((sum,x)=>sum+x,0);
async function dbOpen(){
 if(!('indexedDB'in globalThis))throw Error('Este navegador no permite guardar bases mundiales (IndexedDB).');
 return await new Promise((resolve,reject)=>{const q=indexedDB.open(DB,VERSION);
 q.onupgradeneeded=()=>{for(const name of [CLUBS,META,DIR,FREE])if(!q.result.objectStoreNames.contains(name))q.result.createObjectStore(name)};
 q.onsuccess=()=>resolve(q.result);q.onerror=()=>reject(q.error)});
}
async function dbPutMany(store,items){
 const db=await dbOpen();try{await new Promise((resolve,reject)=>{
 const tx=db.transaction(store,'readwrite'),os=tx.objectStore(store);
 for(const [key,value] of items)os.put(value,key);
 tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||Error('Error de escritura local'));
 })}finally{db.close()}
}
async function dbGet(store,key){
 const db=await dbOpen();try{return await new Promise((resolve,reject)=>{const q=db.transaction(store,'readonly').objectStore(store).get(key);q.onsuccess=()=>resolve(q.result);q.onerror=()=>reject(q.error)})}finally{db.close()}
}
async function dbAll(store){
 const db=await dbOpen();try{return await new Promise((resolve,reject)=>{const q=db.transaction(store,'readonly').objectStore(store).getAll();q.onsuccess=()=>resolve(q.result);q.onerror=()=>reject(q.error)})}finally{db.close()}
}
const sleep=()=>new Promise(resolve=>setTimeout(resolve,0));
const b2u=a=>a instanceof Uint8Array?a:new Uint8Array(a);
const json=b=>JSON.parse(new TextDecoder().decode(b2u(b)));
const expected6={
 'es-1':{uid:'1734',pais:'170',alt:'r madrid'},'es-2':{uid:'1708',pais:'170',alt:'barcelona'},
 'cl-1':{uid:'399',pais:'190',alt:'club social y deportivo colo colo'},
 'cl-2':{uid:'404',pais:'190',alt:'club universidad de chile'},
 'ar-1':{uid:'82',pais:'187',alt:'boca juniors'},'ar-2':{uid:'94',pais:'187',alt:'river plate'}
};
function proposeMappings(index){
 const byLabel=new Map(),votes=new Map();
 for(const [uid,c] of Object.entries(index)){
  const label=cleanup(c.nombre);if(!label)continue;
  if(!byLabel.has(label))byLabel.set(label,[]);byLabel.get(label).push({uid,...c});
 }
 const countries=COUNTRIES.filter(c=>Array.isArray(c.clubs));
 const anchors=new Map([['ES','170'],['CL','190'],['AR','187']]);
 for(const country of countries){
  const count=new Map();
  for(const club of country.clubs){
   const list=byLabel.get(cleanup(club.name))||[];
   if(list.length!==1||Number(list[0].n_primer_equipo)<5)continue;
   const id=String(list[0].pais_id_fm);count.set(id,(count.get(id)||0)+1);
  }
  if(anchors.has(country.code))continue;
  const ranked=[...count].sort((a,b)=>b[1]-a[1]);
  if(ranked.length&&ranked[0][1]>=3&&ranked[0][1]>=2*(ranked[1]?.[1]||0))anchors.set(country.code,ranked[0][0]);
 }
 const mapping={}, used=new Set();
 for(const country of countries){
  const fmCountry=anchors.get(country.code);if(!fmCountry)continue;
  for(const club of country.clubs){
   if(club.inactive)continue;
   const pilot=expected6[club.id];
   let candidates=pilot?(index[pilot.uid]&&String(index[pilot.uid].pais_id_fm)===pilot.pais?[{uid:pilot.uid,...index[pilot.uid]}]:[]):(byLabel.get(cleanup(club.name))||[]).filter(x=>String(x.pais_id_fm)===fmCountry);
   if(candidates.length!==1||used.has(candidates[0].uid))continue;
   const entry=candidates[0];if(Number(entry.n_primer_equipo)<9)continue;
   mapping[club.id]={clubId:club.id,fmUID:String(entry.uid),fmCountryId:String(fmCountry),isoCountry:country.code,
    matchMethod:pilot?'pilot-id-country':'unique-name-country',status:'local-matched',localOnly:true,
    candidate:true,coverage:Number(entry.n_primer_equipo),fmName:entry.nombre};
   used.add(entry.uid);
  }
 }
 return {mapping,countries:Object.fromEntries(anchors),mapped:Object.keys(mapping).length};
}
const mini=(p,clubUid)=>[p.id,p.nombre,p.edad,p.posiciones?.[0]||'',fm26OVR(p.ca_fm),String(clubUid||''),String(p.nacion_fm??'')];
function directoryEntry(entry,data){
 const clubRows=Array.isArray(data.clubes)?data.clubes:[];
 const freeRows=Array.isArray(data.jugadores)?data.jugadores:[];
 return freeRows.length?freeRows.map(p=>mini(p,null)):clubRows.flatMap(c=>c.jugadores.map(p=>mini(p,c.club_uid)));
}
let cachedIndex=null,cachedMapping=null,loadedPromise=null;
export async function installWorldDatabase(file,{onProgress=()=>{}}={}){
 if(!file||!/\.zip$/i.test(file.name||''))throw Error('Selecciona el ZIP de jugadores de RASCENSO.');
 const bytes=new Uint8Array(await file.arrayBuffer()),entries=zipEntries(bytes);
 const idxName=matchEnd(entries,'/runtime/indice_clubes.json');if(!idxName)throw Error('El ZIP no contiene el índice mundial de clubes.');
 const index=json(await unpackZIPEntry(bytes,entries.get(idxName)));
 const related=[...entries].filter(([name])=>startsWithFM(name)&&/\/runtime\/(por_pais|libres)\//.test(name));
 const batches=[],dirBatches=[];let nPlayers=0,nFree=0,processed=0;
 for(const [name,entry] of related){
  const key=name.slice(name.indexOf('/runtime/')+9),free=key.startsWith('libres/');
  const blob=bytes.slice(entry.local+30+new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength).getUint16(entry.local+26,true)+new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength).getUint16(entry.local+28,true),
   entry.local+30+new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength).getUint16(entry.local+26,true)+new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength).getUint16(entry.local+28,true)+entry.compressed);
  batches.push([key,{data:blob,method:entry.method,size:entry.size,free}]);
  const content=json(await unpackZIPEntry(bytes,entry));
  const profiles=directoryEntry(entry,content);
  dirBatches.push([key,profiles]);if(free)nFree+=profiles.length;else nPlayers+=profiles.length;
  if(batches.length>=12){await dbPutMany(CLUBS,batches.splice(0));await dbPutMany(DIR,dirBatches.splice(0))}
  processed++;
  if(processed%6===0){onProgress({processed,total:related.length,players:nPlayers+nFree});await sleep()}
 }
 if(batches.length)await dbPutMany(CLUBS,batches);
 if(dirBatches.length)await dbPutMany(DIR,dirBatches);
 const map=proposeMappings(index);
 const info={schema:2,installedAt:Date.now(),players:nPlayers,freePlayers:nFree,total:nPlayers+nFree,shards:related.length,
  clubs:Object.keys(index).length,mapped:map.mapped};
 await dbPutMany(META,[['index',index],['mapping',map],['info',info]]);
 cachedIndex=index;cachedMapping=map;clearFM26Memory();
 onProgress({processed,total:related.length,players:info.total,done:true,mapped:info.mapped});
 return info;
}
export async function getWorldDatabaseInfo(){return await dbGet(META,'info')||null}
export async function getWorldMappingInfo(){return cachedMapping||await dbGet(META,'mapping')||null}
export async function getWorldIndex(){return cachedIndex||(cachedIndex=await dbGet(META,'index'))||{}}
async function inflateStored(r){
 if(!r)throw Error('El archivo del club no existe en la base local');
 if(r.method===0)return b2u(r.data);
 if(r.method!==8||typeof DecompressionStream==='undefined')throw Error('El navegador no admite ZIP deflate');
 const stream=new Blob([r.data]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
 const bytes=new Uint8Array(await new Response(stream).arrayBuffer());
 if(bytes.length!==r.size)throw Error('Shard local incompleto');
 return bytes;
}
async function getShard(file){
 const key=String(file).replace(/^runtime\//,'');
 return json(await inflateStored(await dbGet(CLUBS,key)));
}
export async function activateWorldClub(clubId,{year=2026}={}){
 const mappings=await getWorldMappingInfo(),m=mappings?.mapping?.[clubId];
 if(!m)return {active:false,reason:'Club sin correspondencia única; sus jugadores siguen disponibles en la búsqueda mundial'};
 if(isRealClubReady(clubId))return {active:true,clubId,players:getFM26Squad(clubId,{}).length};
 const index=await getWorldIndex(),i=index[m.fmUID];
 if(!i)return {active:false,reason:'FM UID ausente del índice'};
 const shard=await getShard(i.archivo),club=shard.clubes.find(x=>String(x.club_uid)===m.fmUID&&String(x.pais_id_fm)===m.fmCountryId);
 if(!club)return {active:false,reason:'La correspondencia no está en el shard'};
 const result=registerFM26Club(m,club,{year});
 return {active:true,clubId,players:result.players};
}
export async function activateWorldContext(state,{clubLimit=120}={}){
 const mappings=await getWorldMappingInfo();if(!mappings)return {active:0,players:0};
 const selected=new Set([state?.clubId,state?.fanClubId].filter(Boolean));
 const country=String(state?.clubId||'').split('-')[0],all=Object.keys(mappings.mapping);
 for(const c of all.filter(x=>x.startsWith(country+'-')).slice(0,28))selected.add(c);
 for(const c of all.slice(0,clubLimit))selected.add(c);
 let active=0,players=0;
 for(const id of [...selected].slice(0,clubLimit+30)){
  try{const r=await activateWorldClub(id,{year:2026});if(r.active){active++;players+=r.players}}
  catch{}
 }
 return {active,players};
}
export async function searchWorldPlayers(term,{limit=70,offset=0,clubUID=null}={}){
 const q=cleanup(term),files=await dbAll(DIR);
 const found=[];
 for(const rows of files){
  for(const p of rows){
   if(clubUID!==null&&p[5]!==String(clubUID))continue;
   if(q&&!cleanup(p[1]).includes(q))continue;
   found.push({id:p[0],name:p[1],age:p[2],position:p[3],ovr:p[4],fmClubUID:p[5],fmNationId:p[6]});
  }
 }
 found.sort((a,b)=>b.ovr-a.ovr||a.name.localeCompare(b.name));
 return {total:found.length,results:found.slice(offset,offset+limit)};
}
export async function getWorldPlayer(id){
 const all=await dbAll(DIR);
 for(const shard of all){
  const match=shard.find(p=>p[0]===id);
  if(match){
   const index=await getWorldIndex(),c=index[match[5]];
   const name=c?.archivo||'';
   const file=match[5]?name:null;
   if(file){const shard=await getShard(file);return shard.clubes.find(x=>String(x.club_uid)===String(match[5]))?.jugadores.find(x=>x.id===id)||null}
   for(const key of (await getWorldDatabaseInfo())?.freeFiles||[]){
    const z=await getShard(key);const item=z.jugadores?.find(x=>x.id===id);if(item)return item;
   }
  }
 }
 return null;
}
export async function forgetWorldDatabase(){
 const db=await dbOpen();await new Promise((resolve,reject)=>{const tx=db.transaction([CLUBS,META,DIR],'readwrite');
 for(const name of [CLUBS,META,DIR])tx.objectStore(name).clear();
 tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error)});
 db.close();cachedIndex=null;cachedMapping=null;clearFM26Memory();
}
