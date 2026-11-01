/* RASCENSO 4.9.7 — Fichas de clubes exclusivas y explorador mundial independiente.
 * No altera partidas, fichajes ni el catálogo fuente. */
import {loadClubSquad} from './club-squads495.mjs';
import {COUNTRIES} from './countries.mjs';
import {badge,flag} from './assets.mjs';
import {marketValueEUR} from './career15.mjs';
import {fmNationName} from './fm26-nations.mjs';
import {getWorldIndex} from './fm26-universe.mjs';
import {isFemaleClubRecord497,isFemalePlayerRecord497} from './world-gender497.mjs';

const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const normalize=x=>String(x||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('es').trim();
const clubs=COUNTRIES.flatMap(c=>c.clubs);
const nameIndex=new Map();
for(const club of clubs){const key=normalize(club.name),old=nameIndex.get(key)||[];old.push(club.id);nameIndex.set(key,old)}
const names=[...nameIndex].filter(([n,ids])=>ids.length===1&&n.length>=7).map(([n])=>n).sort((a,b)=>b.length-a.length);
const escapeRegex=x=>x.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const embedded=new RegExp('(?<![\\p{L}\\p{N}])(?:'+names.map(escapeRegex).join('|')+')(?![\\p{L}\\p{N}])','giu');
const groupOf=pos=>({POR:'Porteros',GK:'Porteros',DFC:'Defensas',LI:'Defensas',LD:'Defensas',DCB:'Defensas',DL:'Defensas',DR:'Defensas',MCD:'Mediocampistas',MC:'Mediocampistas',MCO:'Mediocampistas',MI:'Mediocampistas',MD:'Mediocampistas',DM:'Mediocampistas',AMC:'Mediocampistas',ML:'Mediocampistas',MR:'Mediocampistas',DC:'Delanteros',STC:'Delanteros',EI:'Delanteros',ED:'Delanteros',AML:'Delanteros',AMR:'Delanteros'})[pos]||'Otras posiciones';
const groups=['Porteros','Defensas','Mediocampistas','Delanteros','Otras posiciones'];
const euro=value=>Number.isFinite(value)&&value>0?new Intl.NumberFormat('es-ES',{style:'currency',currency:'EUR',notation:'compact',maximumFractionDigits:1}).format(value):'—';

export function renderClub497(data,{query='',group='',sort='ovr'}={}){
 const players=(data.players||[]).filter(p=>!isFemalePlayerRecord497(p));
 const total=players.filter(p=>Number.isFinite(Number(p.ovr))&&p.ovr!=null);
 const avg=total.length?(total.reduce((x,p)=>x+Number(p.ovr),0)/total.length).toFixed(1):'—';
 const club=data.club||{},country=club.country||fmNationName(data.entry?.pais_id_fm)||'País por confirmar';
 const note=data.hasWorld?(data.simulationMapped?'Plantilla de origen con los movimientos conocidos de tu carrera.':'Plantilla original de la base mundial; la simulación no sigue todos sus movimientos.'):'Este club aún no tiene una plantilla mundial enlazada con seguridad. No asignaremos jugadores de otro equipo.';
 const lower=normalize(query);
 const visible=players.filter(p=>(!group||groupOf(p.pos)===group)&&(!lower||normalize(p.name+' '+p.pos).includes(lower)));
 const compare=(a,b)=>sort==='name'?String(a.name).localeCompare(String(b.name),'es'):sort==='age'?(Number(a.age)||0)-(Number(b.age)||0):sort==='pos'?String(a.pos).localeCompare(String(b.pos),'es'):(Number(b.ovr)||0)-(Number(a.ovr)||0);
 const item=p=>{
  const value=(p.ovr!=null&&p.age!=null)?marketValueEUR({ovr:Number(p.ovr),age:Number(p.age),potential:Number(p.pot||p.ovr)},club):0;
  const countryName=p.fmNationId!=null?fmNationName(p.fmNationId):(p.cc||'Sin confirmar');
  return `<div class="club497-player" role="row"><b class="club497-rating">${esc(p.ovr??'—')}</b><div class="club497-person"><strong>${flag(p.cc)} ${esc(p.name)}</strong><small>${esc(countryName)}${p.source==='tu carrera'?' · Tu futbolista':''}</small></div><span class="club497-position">${esc(p.pos||'—')}</span><span class="club497-age">${p.age==null?'—':esc(p.age)+' años'}</span><strong class="club497-value">${esc(euro(value))}</strong></div>`;
 };
 const sections=groups.map(g=>{const rows=visible.filter(p=>groupOf(p.pos)===g).sort((a,b)=>compare(a,b)||a.name.localeCompare(b.name,'es'));
  return rows.length?`<section class="club497-group"><h3>${esc(g)}<span>${rows.length}</span></h3>${rows.map(item).join('')}</section>`:'';
 }).join('');
 const noPlayers=players.length===0;
 const emptyMessage=noPlayers?`<div class="club497-blank"><div class="club497-blank-icon">◎</div><h3>Plantilla aún no disponible</h3><p>${esc(note)}</p><p>Para explorar los clubes del catálogo, usa <b>Mundo → Explorar clubes</b>.</p></div>`:'<div class="club497-blank"><h3>Sin coincidencias</h3><p>Prueba otro nombre o cambia los filtros de posición.</p></div>';
 const crest=club.id?badge(club,'large'):'<div class="club497-crest-fallback">⚽</div>';
 const league=club.league||'Competiciones del mundo';
 const stats=[['Futbolistas',players.length],['Media del plantel',avg],['Nivel',club.level??'—'],['Prestigio',club.prestige??'—']];
 const shell=`<div class="club497-frame"><header class="club497-hero"><div class="club497-emblem">${crest}</div><div class="club497-identity"><div class="club497-eyebrow">RASCENSO <span>›</span> CLUBES DEL MUNDO</div><h2 id="club495-title">${esc(data.name)}</h2><p>${esc(country)} <span>·</span> ${esc(league)}</p></div><button type="button" class="club497-close" data-close aria-label="Cerrar ficha">✕</button></header><div class="club497-stats">${stats.map(([label,value])=>`<div class="club497-stat"><strong>${esc(value)}</strong><span>${esc(label)}</span></div>`).join('')}</div><section class="club497-main"><div class="club497-section-title"><div><small>PRIMER EQUIPO</small><h3>Plantilla del club</h3></div><span>${players.length} futbolistas</span></div><p class="club497-provenance">${esc(note)}</p><div class="club497-controls"><label><span>BUSCAR JUGADOR</span><input type="search" data-search placeholder="Nombre o posición" value="${esc(query)}" autocomplete="off"></label><label><span>POSICIÓN</span><select data-group><option value="">Todas</option>${groups.map(g=>`<option value="${esc(g)}" ${g===group?'selected':''}>${esc(g)}</option>`).join('')}</select></label><label><span>ORDENAR</span><select data-sort><option value="ovr" ${sort==='ovr'?'selected':''}>Media</option><option value="name" ${sort==='name'?'selected':''}>Nombre</option><option value="age" ${sort==='age'?'selected':''}>Edad</option><option value="pos" ${sort==='pos'?'selected':''}>Posición</option></select></label></div><div class="club497-table-head"><span>MED</span><span>FUTBOLISTA</span><span>POS</span><span>EDAD</span><span>VALOR</span></div><div class="club497-roster" tabindex="0" aria-label="Jugadores del club">${sections||emptyMessage}</div></section></div>`;
 return shell;
}

export function installClubUI(root,getState){
 if(!root||typeof MutationObserver!=='function'||typeof document.createTreeWalker!=='function')return;
 let dialog=null,previousFocus=null,serial=0,worldIndex=null;
 const worldNames=new Map();
 getWorldIndex().then(index=>{worldIndex=index||{};for(const [uid,c] of Object.entries(worldIndex)){if(isFemaleClubRecord497(uid,c))continue;const k=normalize(c.nombre);if(!k)continue;worldNames.set(k,worldNames.has(k)?null:{kind:'world',id:uid});}schedule()}).catch(()=>{});
 const close=()=>{if(dialog?.open)dialog.close()};
 async function open(ref){
  if(!ref)return;
  const token=++serial;
  if(!dialog)previousFocus=document.activeElement;
  if(dialog){dialog.close();dialog.remove()}
  dialog=document.createElement('dialog');dialog.className='club-modal495 club-modal497';dialog.setAttribute('aria-labelledby','club495-title');
  document.body.append(dialog);const active=dialog;
  active.innerHTML='<div class="club497-loading" role="status"><span class="club497-spinner"></span>Cargando plantilla…<button type="button" data-close aria-label="Cerrar">✕</button></div>';
  active.addEventListener('close',()=>{active.remove();if(dialog===active){dialog=null;previousFocus?.focus?.()}},{once:true});
  active.addEventListener('click',e=>{if(e.target===active||e.target.closest('[data-close]'))close()});
  active.showModal();
  try{
   const data=await loadClubSquad(ref,getState()||{});
   if(serial!==token||dialog!==active||!active.open)return;
   const filters={query:'',group:'',sort:'ovr'};
   const paint=(restore=false)=>{
    // Al cambiar filtros se conserva el campo y su foco mientras se actualiza la tabla.
    if(!restore){active.innerHTML=renderClub497(data,filters);}
    else {const doc=new DOMParser().parseFromString(renderClub497(data,filters),'text/html');const current=active.querySelector('.club497-roster'),next=doc.querySelector('.club497-roster');if(current&&next)current.innerHTML=next.innerHTML;}
   };
   paint();
   active.addEventListener('input',e=>{if(e.target.matches('[data-search]')){filters.query=e.target.value;paint(true)}});
   active.addEventListener('change',e=>{if(e.target.matches('[data-group]'))filters.group=e.target.value;else if(e.target.matches('[data-sort]'))filters.sort=e.target.value;else return;paint(true)});
   active.querySelector('[data-close]')?.focus();
  }catch(err){if(serial===token&&dialog===active&&active.open)active.innerHTML=`<div class="club497-error"><h2 id="club495-title">No se pudo cargar la plantilla</h2><p>${esc(err.message)}</p><button type="button" data-close>Cerrar</button></div>`;}
 }

 // Explorador independiente: aparece EXCLUSIVAMENTE en Mundo, nunca en la ficha.
 function ensureWorldFinder(){
  const area=root.querySelector('.world');if(!area||area.querySelector('.club497-finder'))return;
  const panel=document.createElement('section');panel.className='club497-finder';
  panel.innerHTML=`<div class="club497-finder-banner"><div class="club497-finder-icon">⌕</div><div class="club497-finder-copy"><small>EXPLORADOR MUNDIAL</small><h3>Encuentra cualquier club</h3><p>Busca equipos y consulta su plantilla original o actualizada.</p></div><button type="button" class="club497-finder-toggle" data-toggle-club-finder aria-expanded="false">Explorar clubes <span>⌄</span></button></div><div class="club497-finder-body" hidden><label class="club497-world-label">Buscar club del mundo<input type="search" data-club-global-search placeholder="Ej. Santiago Wanderers, Real Madrid, Liverpool…" autocomplete="off" aria-label="Buscar cualquier club"></label><div class="club497-results" data-club-global-results aria-live="polite"><p>Escribe al menos dos letras para encontrar clubes de todo el mundo.</p></div></div>`;
  const target=area.querySelector('.fm-world-search');if(target)target.before(panel);else area.prepend(panel);
  const toggle=panel.querySelector('[data-toggle-club-finder]');
  toggle.addEventListener('click',()=>{const body=panel.querySelector('.club497-finder-body'),show=body.hidden;body.hidden=!show;toggle.setAttribute('aria-expanded',String(show));if(show)panel.querySelector('[data-club-global-search]').focus()});
  let timer=null,job=0;
  panel.querySelector('[data-club-global-search]').addEventListener('input',e=>{
   clearTimeout(timer);const q=normalize(e.target.value),out=panel.querySelector('[data-club-global-results]');const myJob=++job;
   if(q.length<2){out.innerHTML='<p>Escribe al menos dos letras para buscar equipos.</p>';return;}
   out.innerHTML='<p>Buscando clubes…</p>';
   timer=setTimeout(async()=>{
    try{const idx=worldIndex||await getWorldIndex();if(!panel.isConnected||myJob!==job)return;
     const candidates=[];
     for(const c of clubs){if(normalize(c.name).includes(q))candidates.push({kind:'game',id:c.id,name:c.name,meta:'Club jugable · '+(COUNTRIES.find(z=>z.clubs.includes(c))?.name||'RASCENSO'),weight:normalize(c.name)===q?0:1})}
     for(const [uid,c] of Object.entries(idx||{})){if(isFemaleClubRecord497(uid,c)||!normalize(c.nombre).includes(q))continue;candidates.push({kind:'world',id:uid,name:c.nombre,meta:`Base mundial · ${Number(c.n_jugadores)||0} futbolistas · ${fmNationName(c.pais_id_fm)||'País por confirmar'}`,weight:normalize(c.nombre)===q?0:2})}
     candidates.sort((a,b)=>a.weight-b.weight||a.name.localeCompare(b.name,'es'));
     const top=candidates.slice(0,24);
     out.innerHTML=top.length?`<p class="club497-result-count">${candidates.length} coincidencias · mostrando hasta 24</p><div class="club497-result-grid">${top.map(c=>`<button class="club497-result" type="button" data-club497-result-kind="${c.kind}" data-club497-result-id="${esc(c.id)}"><span class="club497-result-mark">⚽</span><span><strong>${esc(c.name)}</strong><small>${esc(c.meta)}</small></span><span class="club497-result-arrow">›</span></button>`).join('')}</div>`:'<p>No encontramos clubes con ese nombre. Prueba otra búsqueda.</p>';
    }catch(err){if(myJob===job)out.innerHTML=`<p>No se pudieron cargar clubes: ${esc(err.message)}</p>`}
   },140);
  });
 }

 function annotate(){
  root.querySelectorAll('.team-badge[data-team-id]').forEach(el=>{if(!el.dataset.teamId||el.closest('select,option'))return;el.tabIndex=0;el.setAttribute('role','button');el.setAttribute('aria-label','Ver plantilla de '+(el.title||'club'));el.classList.add('club495-link')});
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT),nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
  for(const node of nodes){const parent=node.parentElement;if(!parent||parent.closest('select,option,input,textarea,script,style,.club495-name-link,.team-badge,.club497-finder'))continue;
   const text=node.nodeValue,trimmed=text.trim();if(trimmed.length<4)continue;
   const ids=nameIndex.get(normalize(trimmed)),world=worldNames.get(normalize(trimmed));
   const matches=ids?.length===1||world?[{index:text.indexOf(trimmed),0:trimmed}]:[...text.matchAll(embedded)];if(!matches.length)continue;
   const frag=document.createDocumentFragment();let offset=0,replacements=0;
   for(const m of matches){const entry=m[0],pos=m.index,gameIds=nameIndex.get(normalize(entry)),original=worldNames.get(normalize(entry));if(!(gameIds?.length===1)&&!original)continue;
    frag.append(document.createTextNode(text.slice(offset,pos)));
    const span=document.createElement('span');span.className='club495-name-link';if(gameIds?.length===1)span.dataset.club495=gameIds[0];else span.dataset.clubWorld495=original.id;
    span.tabIndex=0;span.setAttribute('role','button');span.setAttribute('aria-label','Ver plantilla de '+entry);span.textContent=entry;frag.append(span);offset=pos+entry.length;replacements++;
   }
   if(replacements){frag.append(document.createTextNode(text.slice(offset)));node.replaceWith(frag)}
  }
  ensureWorldFinder();
 }
 let scheduled=false;
 function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;annotate()})}
 new MutationObserver(schedule).observe(root,{childList:true,subtree:true});schedule();
 function getTarget(el){
  const finder=el.closest('[data-club497-result-kind]');if(finder)return {kind:finder.dataset.club497ResultKind,id:finder.dataset.club497ResultId};
  const world=el.closest('[data-action="fm-world-club"]');if(world)return {kind:'world',id:world.dataset.id};
  const worldLink=el.closest('[data-club-world495]');if(worldLink)return {kind:'world',id:worldLink.dataset.clubWorld495};
  const named=el.closest('[data-club495]');if(named)return {kind:'game',id:named.dataset.club495};
  const crest=el.closest('.team-badge.club495-link');return crest?{kind:'game',id:crest.dataset.teamId}:null;
 }
 document.addEventListener('click',e=>{if(e.target.closest('.club-modal495'))return;const ref=getTarget(e.target);if(ref){e.preventDefault();e.stopPropagation();open(ref)}},true);
 document.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.matches?.('.club495-link,.club495-name-link')){const ref=getTarget(e.target);if(ref){e.preventDefault();open(ref)}}},true);
}
