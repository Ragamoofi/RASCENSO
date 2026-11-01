/* RASCENSO 4.10.7 — Celebra hitos comprobados y explica rasgos de la temporada.
 * No escribe ni muta el guardado del motor. */
import {seasonTraitSignals4110} from './spotlight4110.mjs';
import {choiceFx} from './identity30.mjs';
import {identitySeasonEffects} from './career08.mjs';
const STORE='rascenso-save-v2';
const escapeHTML=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
let latestRaw=null,latest=null,pending=false,active=false,seenCache=null,seenKey='';
function readCareer(){
 let raw=null;try{raw=localStorage.getItem(STORE);}catch{return null}
 if(!raw){latest=null;latestRaw=null;return null}
 if(raw===latestRaw)return latest;
 latestRaw=raw;try{latest=JSON.parse(raw);}catch{latest=null}return latest;
}
function seenFor(s){
 const key=`rascenso-spotlight4110:${String(s.seed||'sin-semilla').slice(0,80)}`;
 if(key===seenKey&&seenCache)return seenCache;
 seenKey=key;try{seenCache=JSON.parse(localStorage.getItem(key)||'{}')}catch{seenCache={}}
 if(!seenCache||typeof seenCache!=='object')seenCache={};
 return seenCache;
}
function markSeen(s,id){const seen=seenFor(s);seen[id]=true;try{localStorage.setItem(seenKey,JSON.stringify(seen))}catch{} }
function textSection(s){
 const panel=document.querySelector('#app .focus-card.story.recap');
 if(!panel||panel.querySelector('.spotlight4110-season'))return;
 const data=seasonTraitSignals4110(s,s.lastSeason,choiceFx,identitySeasonEffects);
 if(!data.length)return;
 const section=document.createElement('section');section.className='spotlight4110-season';
 section.innerHTML='<div class="spotlight4110-eyebrow">✦ ASÍ INFLUYERON TUS ELECCIONES</div><p>Modificadores reales utilizados por el simulador. No son goles o lesiones garantizadas.</p><div class="spotlight4110-season-grid">'+data.map(x=>`<div><strong>${escapeHTML(x.title)}</strong><span>${escapeHTML(x.text)}</span></div>`).join('')+'</div>';
 (panel.querySelector('.recap-summary')||panel.querySelector('.story-body'))?.after(section);
}
function historyGallery(s){
 const host=document.querySelector('#app .focus-card.history');
 if(!host||host.querySelector('.spotlight4110-history'))return;
 const milestones=Array.isArray(s.milestones4110)?s.milestones4110:[];
 if(!milestones.length)return;
 const section=document.createElement('section');section.className='spotlight4110-history';
 section.innerHTML='<div class="spotlight4110-eyebrow">MOMENTOS QUE MARCARON TU CARRERA</div><div class="spotlight4110-gallery">'+milestones.map(m=>`<article><span>${escapeHTML(m.icon)}</span><div><small>${escapeHTML(m.year)}</small><strong>${escapeHTML(m.title)}</strong><p>${escapeHTML(m.description)}</p></div></article>`).join('')+'</div>';
 (host.querySelector('.history-totals')||host.querySelector('h2'))?.after(section);
}
function showMilestone(s,items,index=0){
 if(index>=items.length){active=false;return}
 active=true;const m=items[index],dialog=document.createElement('dialog');dialog.className='spotlight4110-dialog';
 dialog.setAttribute('aria-labelledby','spotlight4110-title');
 const remaining=items.length-index-1;
 dialog.innerHTML=`<div class="spotlight4110-hero"><div class="spotlight4110-glow" aria-hidden="true"></div><span class="spotlight4110-label">RASCENSO · MOMENTO INOLVIDABLE · ${escapeHTML(m.year)}</span><div class="spotlight4110-symbol" aria-hidden="true">${escapeHTML(m.icon)}</div><p class="spotlight4110-overline">UN NUEVO CAPÍTULO EN TU HISTORIA</p><h2 id="spotlight4110-title">${escapeHTML(m.title)}</h2><p class="spotlight4110-description">${escapeHTML(m.description)}</p><div class="spotlight4110-rule"></div><span class="spotlight4110-footnote">Un hito registrado a partir de tus estadísticas reales</span><button type="button" class="spotlight4110-next">${remaining?`Siguiente hito (${remaining} más) →`:'Continuar mi carrera →'}</button></div>`;
 document.body.append(dialog);
 const done=()=>{markSeen(s,m.id);dialog.close();dialog.remove();showMilestone(s,items,index+1)};
 dialog.querySelector('button')?.addEventListener('click',done);
 dialog.addEventListener('cancel',e=>{e.preventDefault();done()});
 dialog.addEventListener('click',e=>{if(e.target===dialog)done()});
 dialog.showModal();dialog.querySelector('button')?.focus({preventScroll:true});
}
function scan(){pending=false;
 const root=document.getElementById('app');if(!root)return;
 const s=readCareer();if(!s?.clubId||!Array.isArray(s.milestones4110))return;
 if(root.querySelector('.focus-card.story.recap'))textSection(s);
 if(root.querySelector('.focus-card.history'))historyGallery(s);
 // Los hitos se anuncian durante el resumen de la temporada, no durante los minijuegos,
 // mercado, otras pestañas ni cuando está abierto el menú de herramientas.
 if(active||!root.querySelector('.focus-card.story.recap')||root.querySelector('#modal'))return;
 const seen=seenFor(s);
 const todo=s.milestones4110.filter(m=>m?.id&&!seen[m.id]&&m.year===s.lastSeason?.year);
 if(todo.length)showMilestone(s,todo);
}
function schedule(){if(pending)return;pending=true;requestAnimationFrame(scan)}
function start(){const app=document.getElementById('app');if(!app)return;
 new MutationObserver(schedule).observe(app,{childList:true,subtree:true});schedule();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
