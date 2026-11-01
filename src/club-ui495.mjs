import {loadClubSquad} from './club-squads495.mjs';
import {COUNTRIES} from './countries.mjs';
import {badge,flag} from './assets.mjs';
import {marketValueEUR} from './career15.mjs';
import {fmNationName} from './fm26-nations.mjs';
import {getWorldIndex} from './fm26-universe.mjs';
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clubs=COUNTRIES.flatMap(c=>c.clubs);
const nameIndex=new Map();
for(const c of clubs){const k=c.name.trim().toLocaleLowerCase('es');const a=nameIndex.get(k)||[];a.push(c.id);nameIndex.set(k,a)}
const embeddedNames=[...nameIndex].filter(([name,ids])=>ids.length===1&&name.length>=7).map(([name])=>name).sort((a,b)=>b.length-a.length);
const embeddedPattern=new RegExp('(?<![\\p{L}\\p{N}])(?:'+embeddedNames.map(s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|')+')(?![\\p{L}\\p{N}])','giu');
const category=p=>({POR:'Porteros',GK:'Porteros',DFC:'Defensas',LI:'Defensas',LD:'Defensas',DCB:'Defensas',DL:'Defensas',DR:'Defensas',MCD:'Mediocampistas',MC:'Mediocampistas',MCO:'Mediocampistas',MI:'Mediocampistas',MD:'Mediocampistas',DM:'Mediocampistas',AMC:'Mediocampistas',ML:'Mediocampistas',MR:'Mediocampistas',DC:'Delanteros',STC:'Delanteros',EI:'Delanteros',ED:'Delanteros',AML:'Delanteros',AMR:'Delanteros'})[p]||'Otras posiciones';
const groups=['Porteros','Defensas','Mediocampistas','Delanteros','Otras posiciones'];
const money=v=>new Intl.NumberFormat('es-ES',{style:'currency',currency:'EUR',notation:'compact',maximumFractionDigits:1}).format(v);
export function installClubUI(root,getState){
 if(!root||typeof MutationObserver!=='function'||typeof document.createTreeWalker!=='function')return;
 let dialog=null,previousFocus=null,seq=0;const worldNames=new Map();
 getWorldIndex().then(index=>{for(const [uid,c] of Object.entries(index||{})){const k=String(c.nombre||'').trim().toLocaleLowerCase('es');if(!k)continue;worldNames.set(k,worldNames.has(k)?null:{kind:'world',id:uid});}annotate()}).catch(()=>{});
 function close(){if(dialog?.open)dialog.close();}
 async function open(ref){
  const token=++seq;if(!dialog)previousFocus=document.activeElement;
  if(dialog){dialog.close();dialog.remove()}
  dialog=document.createElement('dialog');dialog.className='club-modal495';dialog.setAttribute('aria-labelledby','club495-title');
  dialog.innerHTML='<div class="club495-loading">Cargando plantilla… <button type="button" data-close aria-label="Cerrar">×</button></div>';
  document.body.append(dialog);let active=dialog;
  active.addEventListener('close',()=>{active.remove();if(dialog===active){dialog=null;previousFocus?.focus?.()}});
  active.addEventListener('click',e=>{
   const pick=e.target.closest('[data-world-uid]');
   if(pick){e.preventDefault();open({kind:'world',id:pick.dataset.worldUid});return;}
   if(e.target===active||e.target.closest('[data-close]'))close();
  });
  active.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();close()}},true);
  active.showModal();
  try{const data=await loadClubSquad(ref,getState()||{});if(token!==seq||active!==dialog||!active.open)return;
   const actual=data.players.filter(p=>p.ovr!=null&&Number.isFinite(Number(p.ovr)));
   const avg=actual.length?(actual.reduce((sum,p)=>sum+Number(p.ovr),0)/actual.length).toFixed(1):'—';
   const info=data.club, country=info?.country||fmNationName(data.entry?.pais_id_fm)||'País sin identificar';
   const needsLink=!data.hasWorld&&ref.kind==='game';
   const suggestionList=data.candidates||[];
   const suggestionPanel=needsLink?`<section class="club495-recovery"><h3>Buscar plantilla original</h3><p>Este club del juego aún no tiene una equivalencia confirmada. Puedes consultar sus jugadores en la base mundial sin alterar tu partida.</p><label>Buscar nombre original del equipo<input type="search" data-world-find placeholder="Nombre del club" autocomplete="off"></label><div class="club495-suggestions" data-world-results></div></section>`:'';
   active.innerHTML=`<div class="club495-shell"><header class="club495-head">${info?badge(info,'large'):'<div class="club495-icon">⚽</div>'}<div><small>RASCENSO · FICHA DE CLUB</small><h2 id="club495-title">${esc(data.name)}</h2><p>${esc(country)}${info?.league?' · '+esc(info.league):''}</p></div><button type="button" data-close aria-label="Cerrar ficha">×</button></header><div class="club495-stats"><div><b>${data.players.length}</b><span>FUTBOLISTAS</span></div><div><b>${avg}</b><span>MEDIA DEL PLANTEL</span></div>${info?.prestige!=null?`<div><b>${esc(info.prestige)}</b><span>PRESTIGIO</span></div>`:''}${info?.level!=null?`<div><b>${esc(info.level)}</b><span>NIVEL</span></div>`:''}</div><p class="club495-note">${data.hasWorld?(data.simulationMapped?'Plantilla original con cambios registrados en tu carrera. Los jugadores sin seguimiento conservan sus datos de origen.':'Datos originales de la base mundial. La simulación aún no gestiona este club completo.'):'No hay plantilla mundial vinculada de forma segura a este club; se muestran únicamente futbolistas registrados por la simulación.'}</p>${suggestionPanel}<div class="club495-controls"><label><span>Buscar jugador</span><input type="search" data-search placeholder="Nombre o posición" autocomplete="off"></label><label><span>Posición</span><select data-group><option value=''>Todas</option>${groups.map(g=>`<option value="${g}">${g}</option>`).join('')}</select></label><label><span>Ordenar por</span><select data-sort><option value="ovr">Media</option><option value="name">Nombre</option><option value="age">Edad</option><option value="pos">Posición</option></select></label></div><div class="club495-list" tabindex="0"></div></div>`;
   const list=active.querySelector('.club495-list'),search=active.querySelector('[data-search]'),sort=active.querySelector('[data-sort]'),group=active.querySelector('[data-group]');
   function paint(){const q=search.value.trim().toLocaleLowerCase('es');const rows=data.players.filter(p=>(!group.value||category(p.pos)===group.value)&&(p.name+' '+p.pos).toLocaleLowerCase('es').includes(q));
    const cmp=(a,b)=>sort.value==='name'?String(a.name).localeCompare(String(b.name),'es'):sort.value==='age'?(Number(b.age)||0)-(Number(a.age)||0):sort.value==='pos'?String(a.pos).localeCompare(String(b.pos),'es'): (Number(b.ovr)||0)-(Number(a.ovr)||0);
    list.innerHTML=groups.map(g=>{let matches=rows.filter(p=>category(p.pos)===g).sort((a,b)=>cmp(a,b)||String(a.name).localeCompare(String(b.name),'es'));if(!matches.length)return '';
      return `<section><h3>${g} <span>${matches.length}</span></h3>${matches.map(p=>`<div class="club495-row"><b class="club495-ovr">${esc(p.ovr??'—')}</b><div class="club495-name"><strong>${flag(p.cc)} ${esc(p.name)}</strong><small>${esc(p.fmNationId!=null?fmNationName(p.fmNationId):(p.cc||'Nacionalidad sin identificar'))} · ${esc(p.source==='base'?'Base original':p.source==='tu carrera'?'Tu futbolista':'Carrera simulada')}</small></div><span>${esc(p.pos||'—')}</span><span>${p.age==null?'—':esc(p.age)+' años'}</span><span>${p.ovr!=null&&p.age!=null?esc(money(marketValueEUR({ovr:p.ovr,age:p.age,potential:p.pot},info))):'—'}</span></div>`).join('')}</section>`}).join('')||'<p class="club495-empty">No hay futbolistas disponibles para esta búsqueda.</p>';}
   if(needsLink){
    const field=active.querySelector('[data-world-find]'),results=active.querySelector('[data-world-results]');
    const all=await getWorldIndex();if(token!==seq||active!==dialog||!active.open)return;
    const rows=Object.entries(all||{}).map(([uid,c])=>({uid,name:String(c.nombre||''),count:Number(c.n_jugadores)||0,country:c.pais_id_fm}));
    const show=term=>{
     const query=String(term||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
     const available=query?rows.filter(x=>x.name.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().includes(query)).slice(0,12):suggestionList;
     results.innerHTML=available.map(x=>`<button type="button" data-world-uid="${esc(x.uid)}"><strong>${esc(x.name)}</strong><small>${esc(x.count??x.players)} futbolistas · País ${esc(x.country??x.countryId??'—')} · plantilla original</small></button>`).join('')||'<small>Sin coincidencias. Prueba otro nombre.</small>';
    };
    show('');field.addEventListener('input',()=>show(field.value));
   }
   search.addEventListener('input',paint);sort.addEventListener('change',paint);group.addEventListener('change',paint);paint();active.querySelector('[data-close]').focus();
  }catch(err){if(active===dialog&&active.open)active.innerHTML=`<div class="club495-loading"><h2 id="club495-title">No se pudo cargar el club</h2><p>${esc(err.message)}</p><button type="button" data-close>Cerrar</button></div>`;}
 }
 // Marcar únicamente nombres completos no ambiguos fuera de controles existentes.
 function annotate(){root.querySelectorAll('.team-badge[data-team-id]').forEach(el=>{if(!el.dataset.teamId||el.closest('select,option'))return;el.tabIndex=0;el.setAttribute('role','button');el.setAttribute('aria-label','Ver plantilla de '+(el.title||'club'));el.classList.add('club495-link')});
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
  for(const node of nodes){let parent=node.parentElement;if(!parent||parent.closest('select,option,input,textarea,script,style,.club495-name-link,.team-badge'))continue;
   let str=node.nodeValue, trimmed=str.trim();if(!trimmed||trimmed.length<4)continue;let exact=nameIndex.get(trimmed.toLocaleLowerCase('es')),world=worldNames.get(trimmed.toLocaleLowerCase('es'));
   let matches=exact?.length===1||world?[{index:str.indexOf(trimmed),0:trimmed}]:[...str.matchAll(embeddedPattern)];if(!matches.length)continue;
   const fragment=document.createDocumentFragment();let offset=0;
   for(const match of matches){const text=match[0],idx=match.index,ids=nameIndex.get(text.toLocaleLowerCase('es')),world=worldNames.get(text.toLocaleLowerCase('es'));if(!(ids?.length===1)&&!world)continue;
    fragment.append(document.createTextNode(str.slice(offset,idx)));const span=document.createElement('span');span.className='club495-name-link';if(ids?.length===1){span.dataset.club495=ids[0]}else{span.dataset.clubWorld495=world.id};span.tabIndex=0;span.setAttribute('role','button');span.setAttribute('aria-label','Ver plantilla de '+text);span.textContent=text;fragment.append(span);offset=idx+text.length;}
   fragment.append(document.createTextNode(str.slice(offset)));node.replaceWith(fragment);
  }
 }
 let scheduled=false;new MutationObserver(()=>{if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;annotate()})}).observe(root,{childList:true,subtree:true});annotate();
 function target(el){const world=el.closest('[data-action="fm-world-club"]');if(world)return {kind:'world',id:world.dataset.id};const worldwide=el.closest('[data-club-world495]');if(worldwide)return {kind:'world',id:worldwide.dataset.clubWorld495};const name=el.closest('[data-club495]');if(name)return {kind:'game',id:name.dataset.club495};const crest=el.closest('.team-badge.club495-link');return crest?{kind:'game',id:crest.dataset.teamId}:null;}
 document.addEventListener('click',e=>{if(e.target.closest('.club-modal495'))return;const ref=target(e.target);if(ref){e.preventDefault();e.stopPropagation();open(ref)}},true);
 document.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.matches?.('.club495-link,.club495-name-link')){e.preventDefault();open(target(e.target))}},true);
}
