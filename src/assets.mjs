import { COUNTRIES } from './countries.mjs';
// Recursos decorativos: escudos de terceros sólo donde existe una URL reconocida;
// distintivo original de respaldo en caso de error o falta de imagen.
const crestRegistry=new Map();
const CREST_MANIFEST='./assets/crest-manifest.json?v=322';
function safeReference(source){
 try{const u=new URL(source,location.href);return u.protocol==='https:'&&u.hostname==='raw.githubusercontent.com'&&u.pathname.startsWith('/JoseArroyave/football-logos/main/logos/')?u.href:null;}catch{return null;}
}
function applyCrestSources(){
 if(typeof document==='undefined')return;
 document.querySelectorAll('.team-badge[data-team-id]').forEach(node=>{
  const record=crestRegistry.get(node.dataset.teamId);
  if(!record||record.kind!=='source-unavailable'||!record.sourceUrl)return;
  const src=safeReference(record.sourceUrl);if(!src)return;
  const image=node.querySelector('img.badge-img');
  if(image){if(image.src!==src)image.src=src;}
  else{const fresh=document.createElement('img');fresh.className='badge-img';fresh.alt='Escudo de '+(node.title||'club');fresh.loading='lazy';fresh.decoding='async';fresh.onerror=()=>fresh.remove();fresh.src=src;node.appendChild(fresh);}
 });
}
// Este manifiesto se genera junto a los PNG; evita que una descarga fallida en CI
// transforme un escudo conocido (como Liverpool) en una insignia genérica.
if(typeof document!=='undefined'&&typeof fetch==='function'){
 fetch(CREST_MANIFEST).then(r=>r.ok?r.json():null).then(data=>{
  for(const x of data?.logos||[])if(x?.id)crestRegistry.set(x.id,x);
  applyCrestSources();
 }).catch(()=>{});
}
function letters(name){return String(name||'FC').split(/\s+/).filter(w=>!['de','da','do','del','la','el','fc','club','ac'].includes(w.toLowerCase())).slice(0,2).map(w=>w[0]).join('').toUpperCase()||'FC';}
function hue(str){let value=7;for(const c of String(str))value=(value*31+c.charCodeAt(0))%360;return value;}
export function flag(code,cls='flag'){
 const iso={EN:'gb-eng',SC:'gb-sct' }[code]||String(code||'CL').toLowerCase();
 const fallback=''; // Sin emoji de letras superpuesto: la bandera verdadera viene en PNG.
 return `<span class="${cls}" title="${code}"><span>${fallback}</span><img src="https://flagcdn.com/w80/${iso}.png" loading="lazy" alt="" decoding="async" onload="this.previousElementSibling.style.display='none'" onerror="this.remove()"></span>`;
}
export function badge(club, size=''){
 const c=typeof club==='string'?COUNTRIES.flatMap(x=>x.clubs).find(x=>x.id===club):club;
 const name=c?.name||'Club',code=c?.countryCode||c?.id?.slice(0,2).toUpperCase()||'CL';
 const id=c?.id||'';const record=crestRegistry.get(id);
 const remote=record?.kind==='source-unavailable'?safeReference(record.sourceUrl):null;
 const src=remote||(id?`./assets/crests/${encodeURIComponent(id)}.png`:null);
 const accent=hue(name);
 return `<span class="team-badge ${size}" data-team-id="${id}" style="--badge-hue:${accent}" title="${name.replaceAll('"','&quot;')}"><span class="badge-fallback">${letters(name)}</span>${src?`<img class="badge-img" src="${src}" loading="lazy" alt="Escudo de ${name.replaceAll('&','&amp;').replaceAll('"','&quot;')}" decoding="async" onerror="this.remove()">`:''}</span>`;
}
export const CATALOG_COUNT=COUNTRIES.reduce((n,c)=>n+c.clubs.length,0);
