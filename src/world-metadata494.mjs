/* RASCENSO 4.9.4: consulta ligera de identidades de la base mundial instalada.
 * Corrige rankings históricos donde la nacionalidad no quedó persistida.
 * No copia el catálogo al guardado, ni altera UIDs o nacionalidades originales.
 */
import {bundledDirectory} from './fm26-bundled.mjs';
import {fm26OVR} from './fm26-real.mjs';
import {fmNationToCode} from './fm26-nations.mjs';
let byId=null,byName=null,pending=null;
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase().replace(/\s+/g,' ');

export async function primeWorldMetadata494(){
 if(byId)return true;
 if(pending)return pending;
 pending=(async()=>{
  const directory=await bundledDirectory();
  if(!Array.isArray(directory)||!directory.length)return false;
  const ids=new Map(),names=new Map();
  for(const row of directory){
   if(!Array.isArray(row)||!row[0]||!row[1])continue;
   ids.set(String(row[0]),row);
   const name=norm(row[1]);
   // No atribuir nacionalidades equivocadas a dos jugadores homónimos.
   if(names.has(name))names.set(name,null);else names.set(name,row);
  }
  byId=ids;byName=names;return true;
 })().catch(()=>false).finally(()=>{pending=null});
 return pending;
}

export function getWorldMetadata494({id,name}={}){
 if(!byId)return null;
 let row=id?byId.get(String(id)):null;
 if(!row&&name)row=byName.get(norm(name))||null;
 if(!row)return null;
 return {id:row[0],name:row[1],age:Number(row[2]),pos:row[3],
  ovr:fm26OVR(row[4])??null,cc:fmNationToCode(row[6]),fmNationId:row[6]};
}
export const isWorldMetadataReady494=()=>!!byId;
