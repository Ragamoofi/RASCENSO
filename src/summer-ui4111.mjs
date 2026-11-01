/* RASCENSO 4.11 — pantalla de verano en una capa independiente.
 * Lee la partida ya persistida por el motor, no modifica componentes anteriores. */
import {ACTIVITIES} from './summer-activities.mjs';
import {summerOffers,summerModes,chooseSummerCareer,continueSummerCareer,restSummerCareer,answerSummerFollowUp,cancelSummerService,finishSummerCareer,autoSummerCareer,normalizeSummerState,summerActiveBoosts} from './summer-career4111.mjs';
const STORE='rascenso-save-v2';
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const number=v=>new Intl.NumberFormat('es-CL',{maximumFractionDigits:1}).format(Number(v)||0);
const euros=v=>new Intl.NumberFormat('es-CL',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(Math.round(Number(v)||0));
const kLabels={moral:'Moral',confianzaDT:'Confianza del DT',reputacion:'Reputación',hinchada:'Hinchada',directiva:'Directiva',vestuario:'Vestuario',fatiga:'Fatiga',forma:'Forma',vinculoFamiliar:'Familia',vinculoPrensa:'Prensa',vinculoRepresentante:'Representante',vinculoCompanero:'Compañeros',impactoSocial:'Impacto social',escandalos:'Escándalos',dinero:'Dinero',lesiones:'Riesgo de lesiones',desarrollo:'Desarrollo',minutos:'Minutos',serenidad:'Serenidad',mercadoGrandes:'Interés de grandes clubes'};
const goodFor=(k,n)=>n>=0?!['fatiga','escandalos','lesiones'].includes(k):['fatiga','escandalos','lesiones'].includes(k);
const risk={bajo:['🟢','Bajo'],medio:['🟡','Medio'],alto:['🔴','Alto']};
const phaseName={prensa:'PRENSA',social:'VIDA SOCIAL',carrera:'CARRERA',dinero:'ECONOMÍA',ayuda:'COMUNIDAD',descanso:'DESCANSO',locura:'AVENTURA'};
const annual=s=>Math.max(9000,Number(s.contract?.salary)||Number(s.lastSeason?.salaryEarned)||36000);
function statHTML(data,kind='fx'){
 const parts=Object.entries(data||{});
 if(!parts.length)return '<span class="summer-neutral">Sin modificadores numéricos</span>';
 return parts.map(([k,v])=>{const x=Number(v);const display=k==='dinero'?`${x>=0?'+':''}${euros(x*annual(currentState||{}))}`:kind==='next'||kind==='service'?`${x>=0?'+':''}${number(x*100)} %`:`${x>=0?'+':''}${number(x)}`;
 return `<span class="summer-chip ${goodFor(k,x)?'positive':'negative'}">${esc(kLabels[k]||k)} ${esc(display)}</span>`}).join('');
}
let currentState=null,error='',cachedRaw=null,cachedState=null;
function getSave(){try{const raw=localStorage.getItem(STORE);if(raw===cachedRaw)return cachedState;cachedRaw=raw;cachedState=raw?JSON.parse(raw):null;return cachedState;}catch{return null}}
function writeSave(s){const old=localStorage.getItem(STORE);const str=JSON.stringify(s);
 try{if(old&&old!==str)localStorage.setItem(STORE+'-backup',old);localStorage.setItem(STORE,str);cachedRaw=str;cachedState=s;return true;}catch(e){error='No se pudo guardar. Prueba exportar una copia de la partida.';return false;}
}
const seasonYear=s=>(Number(s.startYear)||2026)+(Number(s.age)-Number(s.startAge||16));
const activity=(id)=>ACTIVITIES.find(x=>x.id===id);
function weekTrack(s){const slots=[];for(const entry of (s.summer?.log||[])){const a=activity(entry.activity),qty=Math.max(1,a?.weeks||1);for(let i=0;i<qty;i++)slots.push({title:a?.title||'Descanso',active:true,two:i>0});}
 while(slots.length<6)slots.push({title:'Semana libre',active:false});return slots.slice(0,6).map((x,i)=>`<div class="summer-week ${x.active?'done':''}" title="${esc(x.title)}"><b>${i+1}</b><small>${x.active?'✓':'LIBRE'}</small></div>`).join('');
}
function servicesHTML(s){const items=s.summerFinance?.services||[];return `<div class="summer-services"><h3>Servicios y compromisos anuales</h3>${items.length?items.map(x=>`<div class="summer-service"><div><b>${esc({nutri:'Nutricionista',fisio:'Fisioterapeuta',psico:'Psicólogo',casa_club:'Casa cerca del club',casa_barrio:'Casa en el barrio'}[x.id]||x.id)}</b><small>Gasto anual: ${euros((x.upkeep||0)*annual(s))}</small><div class="summer-chips">${statHTML(x.perSeason,'service')}</div></div><button class="summer-btn subtle" data-summer-action="cancel" data-id="${esc(x.id)}">Cancelar</button></div>`).join(''):'<p class="summer-muted">Todavía no tienes servicios contratados.</p>'}</div>`}
function cardFor(a,s){const modes=summerModes(a,s);return `<article class="summer-card"><div class="summer-card-top"><span class="summer-cat">${esc(phaseName[a.category]||a.category)}</span><span class="summer-duration">◷ ${a.weeks} ${a.weeks===1?'semana':'semanas'}</span></div><h3>${esc(a.title)}</h3><p>${esc(a.blurb)}</p>${summerActiveBoosts(a,s).length?`<p class="summer-boost">✦ Tus rasgos favorecieron que apareciera esta actividad (${summerActiveBoosts(a,s).map(esc).join(', ')}).</p>`:''}<div class="summer-modes">${modes.map(({mode,enabled,reason,cost,risk:r})=>`<button type="button" class="summer-mode" data-summer-action="choose" data-id="${esc(a.id)}" data-mode="${esc(mode.id)}" ${enabled?'':'disabled'}><span class="summer-mode-label">${esc(mode.label)}</span><span class="summer-mode-meta"><span title="Riesgo ${esc(r)}">${risk[r][0]} ${risk[r][1]}</span><span>${cost?euros(cost*annual(s)):'Sin coste'}</span></span>${enabled?'':`<small>No disponible: ${reason==='dinero'?'patrimonio insuficiente':'no cumples los requisitos'}</small>`}</button>`).join('')}</div></article>`;}
function summerPanel(s){
 const su=s.summer,fin=s.summerFinance||{};
 const alerts=(s.summerServiceExpired||[]).length?`<p class="summer-warning">Servicios cancelados por falta de fondos: ${esc(s.summerServiceExpired.join(', '))}</p>`:'';
 let body='';
 if((s.summerInbox||[]).length){const event=s.summerInbox[0];body=`<section class="summer-moment"><span class="summer-tag">UN HILO DE TU HISTORIA VUELVE</span><h2>${esc(event.title)}</h2><p>${esc(event.text)}</p><div class="summer-actions"><button type="button" class="summer-btn primary" data-summer-action="followup" data-mode="participar">${esc(event.good)}</button><button type="button" class="summer-btn subtle" data-summer-action="followup" data-mode="privado">${esc(event.quiet)}</button></div></section>`;}
 else if(s.summerResult){const v=s.summerResult;body=`<section class="summer-moment"><span class="summer-tag">RESULTADO · ${esc(v.title||'Semana de verano')}</span><h2>${esc(v.headline||v.title||'Semana completada')}</h2><p>${esc(v.text)}</p>${v.traitNotes?.length?`<div class="summer-trait">✦ ${v.traitNotes.map(esc).join(' · ')}. La tirada final se hizo con esas probabilidades.</div>`:''}<div class="summer-chips">${statHTML(v.applied)}</div>${v.cost?`<p class="summer-effect-row">Coste de la actividad: <b>${euros(v.cost*annual(s))}</b></p>`:''}${Object.keys(v.next||{}).length?`<div class="summer-effect-row">PARA LA PRÓXIMA TEMPORADA<div class="summer-chips">${statHTML(v.next,'next')}</div></div>`:''}${v.service?`<div class="summer-effect-row">SERVICIO ACTIVADO · MANTENIMIENTO ${euros((v.service.upkeep||0)*annual(s))} AL AÑO<div class="summer-chips">${statHTML(v.service.perSeason,'service')}</div></div>`:''}${v.injuryWeeks?`<p class="summer-warning">Lesión: ${number(v.injuryWeeks)} semanas de baja</p>`:''}${v.followUps?.length?`<p class="summer-effect-row">Historia abierta: puede tener continuación en temporadas futuras.</p>`:''}<button class="summer-btn primary" data-summer-action="continue">${su.weeksLeft?'Siguiente semana →':'Ver el resumen del verano →'}</button></section>`;}
 else if(su.weeksLeft===0){const summary=su.log||[];body=`<section class="summer-summary"><span class="summer-tag">VERANO COMPLETADO</span><h2>El verano también escribe tu carrera.</h2><p>Esto es lo que pasó antes de comenzar una nueva temporada.</p><div class="summer-log">${summary.map(x=>`<div><strong>${esc(activity(x.activity)?.title||'Descanso')}</strong><small>${esc(x.headline||x.text)}</small></div>`).join('')}</div><div class="summer-chips">${statHTML(su.totals)}</div><button class="summer-btn primary" data-summer-action="finish">Ir a la preparación de temporada →</button></section>`;}
 else {const options=summerOffers(s);body=`<div class="summer-offer-head"><div><span class="summer-tag">SEMANA ${7-su.weeksLeft} · ELIGE TU CAMINO</span><h2>¿Qué harás con tu tiempo?</h2></div><p>Hay tres propuestas. Cada una tiene decisiones, un coste y riesgos propios. También puedes descansar.</p></div><div class="summer-card-grid">${options.length?options.map(a=>cardFor(a,s)).join(''):'<p class="summer-muted">No hay actividades disponibles con los requisitos actuales. Puedes descansar.</p>'}</div><div class="summer-actions"><button class="summer-btn subtle" data-summer-action="rest">Descansar una semana</button><button class="summer-btn ghost" data-summer-action="auto">Resumir el resto del verano</button></div>`;}
 const last=Number(s.summerLastYear)||0;
 return `<section class="summer-wrap"><div class="summer-hero"><div><span class="summer-tag">RASCENSO · ENTRE TEMPORADAS</span><h1>TU <em>VERANO</em></h1><p>Después de los premios y el mercado, seis semanas para decidir cómo vivir fuera del fútbol.</p></div><div class="summer-finances"><small>PATRIMONIO DISPONIBLE</small><strong>${euros(fin.cashEUR)}</strong><span>${number(fin.cashEUR/annual(s))} sueldos anuales · ${esc(s.contract?.currency||'EUR')}</span></div></div>${alerts}<div class="summer-week-track" role="group" aria-label="Calendario de seis semanas">${weekTrack(s)}</div><div class="summer-main-layout"><div class="summer-main">${error?`<p class="summer-warning">${esc(error)}</p>`:''}${body}</div><aside class="summer-side">${servicesHTML(s)}<div class="summer-aside-box"><h3>Tu impacto fuera de la cancha</h3><div><span>Acciones sociales</span><b>${number(fin.impactSocial)}</b></div><div><span>Escándalos</span><b>${number(fin.escandalos)}</b></div><div><span>Gastos acumulados</span><b>${euros(fin.spentEUR)}</b></div><div><span>Ingresos de carrera contabilizados</span><b>${euros(fin.earnedEUR)}</b></div><button type="button" class="summer-btn subtle" data-summer-action="export">Exportar respaldo JSON</button></div></aside></div></section>`;
}
function legacySummer(s){const H=s.summerHistory||[],fin=s.summerFinance||{};if(!H.length)return '';
 return `<section class="summer-legacy"><span class="summer-tag">FUERA DE LA CANCHA</span><h2>Los veranos que también te definieron</h2><div class="summer-legacy-totals"><span>Impacto social <b>${number(fin.impactSocial)}</b></span><span>Escándalos <b>${number(fin.escandalos)}</b></span><span>Patrimonio <b>${euros(fin.cashEUR)}</b></span></div><details><summary>Ver ${H.length} verano(s) de tu historia</summary>${H.slice(-8).reverse().map(y=>`<div class="summer-legacy-row"><b>${esc(y.year)}</b><span>${esc((y.headlines||[]).join(' · ')||'Actividades, decisiones y descanso')}</span></div>`).join('')}</details>${(fin.quotes||[]).length?`<p>Frases célebres: ${fin.quotes.slice(-3).map(esc).join(' · ')}</p>`:''}<button type="button" class="summer-btn subtle" data-summer-action="export-image">Guardar recuerdos de verano PNG</button></section>`;
}
function download(text,filename,type){const blob=new Blob([text],{type}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=filename;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500)}
function exportSummerImage(s){const can=document.createElement('canvas');can.width=1200;can.height=800;const c=can.getContext('2d');if(!c)return;const H=s.summerHistory||[];c.fillStyle='#091827';c.fillRect(0,0,1200,800);const g=c.createLinearGradient(0,0,1200,800);g.addColorStop(0,'#193d5e');g.addColorStop(1,'#091827');c.fillStyle=g;c.fillRect(26,26,1148,748);c.fillStyle='#efb881';c.font='bold 22px sans-serif';c.fillText('RASCENSO · FUERA DE LA CANCHA',65,80);c.fillStyle='#fff';c.font='bold 46px sans-serif';c.fillText(String(s.name||'Mi futbolista').slice(0,35),65,142);c.fillStyle='#bdd4e7';c.font='21px sans-serif';c.fillText(`${H.length} veranos · ${number(s.summerFinance?.impactSocial)} impacto social · ${number(s.summerFinance?.escandalos)} escándalos`,65,187);c.fillStyle='#efb881';c.font='bold 25px sans-serif';c.fillText('MOMENTOS DE TU HISTORIA',65,251);
 let y=307;for(const h of H.slice(-7).reverse()){c.fillStyle='#c9e0ee';c.font='bold 19px sans-serif';c.fillText(String(h.year||'—'),65,y);c.fillStyle='#fff';c.font='18px sans-serif';c.fillText(String((h.headlines||[])[0]||(h.log||[]).find(x=>x.headline)?.headline||'Un verano más en tu carrera').slice(0,85),142,y);y+=53;}
 c.fillStyle='#a9c8dc';c.font='18px sans-serif';c.fillText('Los resultados se obtuvieron de las decisiones registradas en tu partida.',65,723);can.toBlob(blob=>{if(!blob)return;const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='RASCENSO-veranos-'+String(s.name||'jugador').replace(/[^\p{L}\p{N}-]+/gu,'-')+'.png';a.click();setTimeout(()=>URL.revokeObjectURL(url),1500)},'image/png');}
function render(){const root=document.getElementById('app'),view=root?.querySelector('main.view');if(!root||!view)return;const saved=getSave();currentState=saved;if(!saved)return;
 if(saved.phase==='summer'){
  const signature=JSON.stringify({l:saved.summer?.log?.length,w:saved.summer?.weeksLeft,r:saved.summerResult?.outcome,ib:saved.summerInbox?.length,c:saved.summerFinance?.cashEUR,error});
  const inCareer=root.querySelector('.main-nav .navtab.selected')?.dataset?.tab==='carrera';
  if(inCareer&&view.dataset.summerSignature!==signature){view.dataset.summerSignature=signature;view.classList.add('summer-view');view.innerHTML=summerPanel(normalizeSummerState(saved));}
 }else{
  view.classList.remove('summer-view');delete view.dataset.summerSignature;
  if(root.querySelector('.main-nav .navtab.selected')?.dataset?.tab==='historial'){
   const container=view.querySelector('.farewell-page')||view.querySelector('.focus-card.history');if(container&&!container.querySelector('.summer-legacy'))container.insertAdjacentHTML('beforeend',legacySummer(saved));
  }
 }
}
let scheduled=false;const schedule=()=>{if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;render();});};
function start(){document.addEventListener('click',e=>{const a=e.target.closest('[data-summer-action]');if(!a)return;e.preventDefault();e.stopImmediatePropagation();const action=a.dataset.summerAction;let s=getSave();if(!s)return;
 try{
  error='';
  if(action==='export'){download(JSON.stringify(s,null,2),'RASCENSO-verano-respaldo.json','application/json');return;}
  if(action==='export-image'){exportSummerImage(s);return;}
  if(s.phase!=='summer')return;
  if(action==='choose')s=chooseSummerCareer(s,a.dataset.id,a.dataset.mode);
  else if(action==='continue')s=continueSummerCareer(s);
  else if(action==='rest')s=restSummerCareer(s);
  else if(action==='followup')s=answerSummerFollowUp(s,a.dataset.mode);
  else if(action==='cancel')s=cancelSummerService(s,a.dataset.id);
  else if(action==='auto')s=autoSummerCareer(s,{pauseAtSummary:true});
  else if(action==='finish')s=finishSummerCareer(s);
  if(writeSave(s)){
   if(s.phase==='season'){location.reload();return;} // Sincroniza el estado interno del simulador original.
   const view=document.querySelector('#app main.view');if(view)delete view.dataset.summerSignature;
  }
 }catch(err){error=err?.message||String(err);const view=document.querySelector('#app main.view');if(view)delete view.dataset.summerSignature;}
 schedule();
 },true);
 const root=document.getElementById('app');if(!root)return;new MutationObserver(schedule).observe(root,{childList:true,subtree:true});schedule();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
