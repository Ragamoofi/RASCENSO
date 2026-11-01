import {isExcludedClub,isExcludedPlayer} from './world-exclusions.mjs';
/* RASCENSO 4.9 — Mundo mundial preinstalado. 
 * Si el paquete de datos forma parte del sitio, se consulta directamente;
 * nunca exige seleccionar ZIP, importar en IndexedDB ni copiarlo al guardado.
 * El HTTP cache del navegador mantiene comprimidos los recursos ya visitados.
 */
const ROOT=new URL('../assets/world-data/',import.meta.url);
let manifestPromise=null,directoryPromise=null,indexPromise=null;
const shardCache=new Map();
export async function bundledWorldManifest(){
 if(!manifestPromise)manifestPromise=(async()=>{
  try{
   const res=await fetch(new URL('manifest.json',ROOT),{cache:'force-cache'});
   if(!res.ok)return null;
   const m=await res.json();
   if(m.schema!=='rascenso-bundled-world-v1'||!Number.isInteger(m.total)||m.total<1||!Number.isInteger(m.shards)||m.shards<1)throw Error('Catálogo mundial incompleto');
   // La cifra visible refleja las exclusiones contrastadas de esta versión.
   return m.version==='2026-10-31'&&m.total===180739?{...m,total:m.total-822,players:m.players-822,clubs:m.clubs-34,sourceTotal:m.total}:m;
  }catch(e){if(String(e.message).includes('incompleto'))throw e;return null}
 })();
 return manifestPromise;
}
async function gzipJSON(file){
 const res=await fetch(new URL(file,ROOT),{cache:'force-cache'});
 if(!res.ok)throw Error('Falta recurso de la base mundial: '+file+' ('+res.status+')');
 if(typeof DecompressionStream==='undefined')throw Error('Tu navegador no soporta datos gzip; usa una versión actualizada');
 return new Response(res.body.pipeThrough(new DecompressionStream('gzip'))).json();
}
export async function bundledClubIndex(){
 if(!indexPromise)indexPromise=(async()=>{const m=await bundledWorldManifest();if(!m)return null;const idx=await gzipJSON(m.clubIndex);return Object.fromEntries(Object.entries(idx).filter(([uid])=>!isExcludedClub(uid)))})();
 return indexPromise;
}
export async function bundledDirectory(){
 if(!directoryPromise)directoryPromise=(async()=>{const m=await bundledWorldManifest();if(!m)return null;const rows=await gzipJSON(m.directory);return rows.filter(p=>!isExcludedClub(p?.[5])&&!isExcludedPlayer(p?.[0]))})();
 return directoryPromise;
}
export async function bundledShard(path){
 const m=await bundledWorldManifest();if(!m)throw Error('Base preinstalada no disponible');
 const key=String(path||'').replace(/^runtime\//,'').replace(/^\/+/, '');
 if(!/^(por_pais\/nacion_[0-9]+_parte_[0-9]+|libres\/libres_[0-9]+)\.json$/.test(key))throw Error('Shard mundial inválido: '+key);
 if(shardCache.has(key))return shardCache.get(key);
 const promise=gzipJSON(key+'.gz').then(data=>{if(Array.isArray(data.clubes))data={...data,clubes:data.clubes.filter(c=>!isExcludedClub(c.club_uid)).map(c=>({...c,jugadores:(c.jugadores||[]).filter(p=>!isExcludedPlayer(p.id))}))};if(Array.isArray(data.jugadores))data={...data,jugadores:data.jugadores.filter(p=>!isExcludedPlayer(p.id))};return data}).catch(err=>{shardCache.delete(key);throw err});
 shardCache.set(key,promise);
 // No mantener decenas de miles de fichas detalladas en RAM durante toda la carrera.
 if(shardCache.size>6)shardCache.delete(shardCache.keys().next().value);
 return promise;
}
export function resetBundledWorldCache(){manifestPromise=null;directoryPromise=null;indexPromise=null;shardCache.clear()}
