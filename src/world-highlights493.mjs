/* RASCENSO 4.9.3 — Rankings de la base mundial de 180.739 futbolistas.
 * La fuente es el directorio completo incluido en el sitio, no los 120 clubes cargados
 * para simular. La tabla no se copia al guardado ni se exporta a localStorage.
 */
import {bundledDirectory,bundledClubIndex} from './fm26-bundled.mjs';
import {fm26OVR,POS_FM,getFM26LoadedPlayers} from './fm26-real.mjs';
import {fmNationToCode} from './fm26-nations.mjs';

let cache=null,loading=null;
const max=(n,a,b)=>Math.max(a,Math.min(b,n));
const valid=p=>Array.isArray(p)&&typeof p[0]==='string'&&typeof p[1]==='string'&&
 Number.isFinite(Number(p[2]))&&Number(p[2])>=15&&Number(p[2])<=50&&Number.isFinite(Number(p[4]));

function normalize(p,index){
 const uid=String(p[5]??'');
 return {id:p[0],name:p[1],age:Number(p[2]),pos:POS_FM[p[3]]||p[3]||'DC',
  ovr:fm26OVR(p[4])??60,kind:'real',status:'active',cc:fmNationToCode(p[6]),
  fmNationId:p[6]??null,clubId:null,clubName:index[uid]?.nombre||'Agente libre',fmClubUID:uid};
}

/** Se ejecuta una sola vez al iniciar; el catálogo queda en memoria mientras se usa la página. */
export async function primeWorldHighlights493(){
 if(cache)return true;
 if(loading)return loading;
 loading=(async()=>{
  const [directory,index]=await Promise.all([bundledDirectory(),bundledClubIndex()]);
  if(!Array.isArray(directory)||!index)return false;
  // Se conservan sólo candidatos de élite y sub-30, sin generar 180.739 objetos.
  const eligible=directory.filter(valid);
  const best=eligible.slice().sort((a,b)=>Number(b[4])-Number(a[4])).slice(0,1800);
  const ages=new Map();
  for(const p of eligible){
   const age=Number(p[2]);if(age>32)continue;
   if(!ages.has(age))ages.set(age,[]);
   ages.get(age).push(p);
  }
  const youth=new Map();
  for(const [age,rows] of ages){
   rows.sort((a,b)=>Number(b[4])-Number(a[4]));
   youth.set(age,rows.slice(0,65).map(p=>normalize(p,index)));
  }
  cache={best:best.map(p=>normalize(p,index)),youth};
  return true;
 })().catch(()=>false).finally(()=>{loading=null});
 return loading;
}

const currentYear=state=>Math.max(2026,Math.floor(Number(state?.world?.year||2026)));
function now(p,state){
 const years=max(currentYear(state)-2026,0,45),age=p.age+years;
 if(age>=40)return null;
 const gain=p.age<=22?Math.min(3,Math.floor(years/2)):0;
 const decline=Math.max(0,age-32)*1.4;
 return {...p,age,ovr:max(Math.round(p.ovr+gain-decline),40,99)};
}
function loaded(state){
 try{return getFM26LoadedPlayers(state).filter(p=>p.status==='active').map(p=>({
  ...p,cc:p.cc||fmNationToCode(p.fmNationId),clubName:null
 }))}catch{return []}
}
function uniqueSorted(entries,limit){
 const seen=new Set();return entries.filter(p=>{
  if(!p||p.status!=='active'||seen.has(p.id))return false;
  seen.add(p.id);return true;
 }).sort((a,b)=>b.ovr-a.ovr||a.name.localeCompare(b.name,'es')).slice(0,limit);
}

export function worldTopPlayers493(state,limit=10){
 if(!cache)return [];
 const overrides=loaded(state),byId=new Map(overrides.map(p=>[p.id,p]));
 const candidates=cache.best.map(p=>byId.get(p.id)||now(p,state));
 return uniqueSorted([...overrides,...candidates],limit);
}
export function worldGeneration493(state,limit=12){
 if(!cache)return [];
 const desired=Number(state?.age||18),years=max(currentYear(state)-2026,0,45);
 const pool=[];
 for(let age=desired-years-2;age<=desired-years+2;age++)pool.push(...(cache.youth.get(age)||[]));
 const overrides=loaded(state).filter(p=>Math.abs(p.age-desired)<=2);
 const byId=new Map(overrides.map(p=>[p.id,p]));
 return uniqueSorted([...overrides,...pool.map(p=>byId.get(p.id)||now(p,state))]
  .filter(p=>p&&Math.abs(p.age-desired)<=2),limit);
}

// Informa qué fuente se está usando, útil para diagnósticos sin leer el estado interno.
export const isWorldHighlightsReady493=()=>!!cache;
