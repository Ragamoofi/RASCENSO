/* RASCENSO 4.10.4 — Identidad y Futbolista armonizados.
 * Mantiene los controles de elección y su lógica original.
 * Un solo tablero, sin subpestañas ni grandes tarjetas. */
const normalize=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('es').trim();
const element=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!=null)e.textContent=text;return e};
let savedClubSearch='';

function decisionGroup(group){
 if(!group||group.dataset.creator4102)return group;
 group.dataset.creator4102='1';group.classList.add('cr4102-decision');
 const grid=group.querySelector(':scope > .cr-grid');
 if(!grid)return group;
 const labels=[...grid.querySelectorAll(':scope > label')];
 if(!labels.length)return group;
 grid.classList.add('cr4102-options');
 grid.classList.remove('c2','c3','c4','c5');
 grid.dataset.count=String(labels.length);
 const chosen=labels.find(label=>label.querySelector('input:checked'))||labels[0];
 const chosenBody=chosen.querySelector('.cr-body');
 const details=element('div','cr4102-detail');
 const main=element('div','cr4102-detail-copy');
 const info=element('div','cr4102-detail-title');
 info.append(element('span','cr4102-check','✓'),element('strong','',chosenBody?.querySelector('strong')?.textContent||'Opción seleccionada'));
 main.append(info);
 const desc=chosenBody?.querySelector('small');
 if(desc?.textContent)main.append(element('p','',desc.textContent));
 const chips=chosenBody?.querySelector('.cr-chips');
 if(chips)main.append(chips.cloneNode(true));
 details.append(main);
 labels.forEach(label=>{
  label.classList.remove('cr-card','compact');label.classList.add('cr4102-choice');
  const on=label===chosen;label.classList.toggle('on',on);
  label.setAttribute('aria-label',label.querySelector('strong')?.textContent||'Elegir opción');
 });
 const top=group.querySelector(':scope > header');
 if(top){const title=top.querySelector('h3');if(title)title.insertAdjacentHTML('afterbegin','<span class="cr4102-accent" aria-hidden="true"></span>')}
 grid.after(details);
 return group;
}

function board(items,cls=''){
 const panel=element('div','cr4102-board '+cls);
 for(const x of items)if(x)panel.append(decisionGroup(x));
 return panel;
}

function reorganize(main,step){
 const groups=[...main.querySelectorAll(':scope > .cr-group')];
 const split=main.querySelector(':scope > .cr-split');
 const report=main.querySelector(':scope > .cr-report');
 const presets=main.querySelector(':scope > .cr-presets');
 const dream=main.querySelector(':scope > .cr-dream');
 if(step===0){
  const top=split;
  const left=top?.querySelector('.cr-left');
  const nested=[...left?.querySelectorAll(':scope > .cr-group')||[]];
  const inlineBoard=nested.length?board(nested,'cr4103-ident-inline'):null;
  if(top)top.classList.add('cr4102-ident-layout','cr4103-ident-layout');
  if(left&&inlineBoard)left.append(inlineBoard);
  const rest=groups.filter(group=>!nested.includes(group));
  let all=null;
  if(rest.length){all=board(rest,'cr4102-ident-board');top?.after(all);}
  if(presets){const details=element('details','cr4102-presets');details.append(element('summary','','Usar un perfil sugerido o aleatorio'),presets);(all||top)?.after(details)}
 }else if(step===1){
  const groupBoard=board(groups);
  split?.after(groupBoard);
  split?.classList.add('cr4102-roots-intro');
 }else if(step===2){
  // Estudio del futbolista: identidad de juego, prioridades y cuatro decisiones
  // visibles en un solo tablero. Los controles originales siguen intactos.
  split?.classList.add('cr4102-profile-intro','cr4104-profile-banner');
  const profName=split?.querySelector('.cr-prof-class');
  if(profName){
   const heading=element('div','cr4104-role-eyebrow','◆  TU PAPEL EN EL EQUIPO');
   profName.prepend(heading);
  }
  const groupBoard=board(groups,'cr4102-player-board cr4104-player-board');
  const categoryNames=['FORTALEZA','DEBILIDAD','ESTILO','DESARROLLO'];
  for(const [index,group] of [...groupBoard.children].entries()){
   group.classList.add('cr4104-choice-section','cr4104-choice-'+index);
   const heading=group.querySelector(':scope > header');
   if(heading){
    const marker=element('span','cr4104-section-index',String(index+1).padStart(2,'0'));
    heading.prepend(marker);
    heading.dataset.category=categoryNames[index]||'PERFIL';
   }
   const detail=group.querySelector(':scope > .cr4102-detail');
   if(detail)detail.setAttribute('aria-live','polite');
  }
  split?.after(groupBoard);
 }else if(step===3){
  main.querySelector(':scope > .cr-head')?.after(board(groups,'cr4102-mind-board'));
 }else if(step===4){
  const fan=split?.querySelector('.cr-fan');
  const draft=split?.querySelector('.cr-group');
  const fanPanel=element('section','cr4102-fan-panel');
  if(fan)fanPanel.append(fan);
  const dreamGroup=groups[0];
  const groupBoard=board([dreamGroup,fanPanel,draft],'cr4102-dream-board');
  main.querySelector(':scope > .cr-head')?.after(groupBoard);
  if(dream&&dreamGroup)dreamGroup.append(dream);
  if(fan)installFanSearch(fan);
  split?.remove();
 }else if(step===5){main.classList.add('cr4102-summary');}
 if(report){const details=element('details','cr4102-report');details.append(element('summary','','Informe del formador y consecuencias'),report);main.append(details)}
}

// Buscar el club favorito en la misma pantalla de Sueños.
// El select original queda disponible y sigue notificando al motor.
function installFanSearch(fan){
 const select=fan.querySelector('select[name="fanClubId"]');
 if(!select||fan.querySelector('.cr4102-fan-search'))return;
 const options=[...select.options].filter(x=>x.value).map(x=>({id:x.value,name:(x.textContent||'').trim(),country:x.parentElement?.label||''}));
 const wrap=element('div','cr4102-fan-search');
 const label=element('label','cr4102-search-label','BUSCAR EQUIPO');
 const input=element('input','cr4102-club-input');input.type='search';input.placeholder='Católica, Colo-Colo, Real Madrid…';input.autocomplete='off';input.value=savedClubSearch;
 input.setAttribute('aria-label','Buscar equipo favorito');label.append(input);
 const selected=element('p','cr4102-selected-club');
 const status=element('span','cr4102-search-status');
 const results=element('div','cr4102-club-results');results.setAttribute('aria-label','Equipos encontrados');
 const manual=element('details','cr4102-fan-manual');manual.append(element('summary','','Ver selector completo por país'));
 const original=select.closest('label');if(original)manual.append(original);
 wrap.append(label,selected,status,results,manual);
 const row=fan.querySelector('.cr-fanrow');if(row)row.after(wrap);else fan.append(wrap);
 const refresh=()=>{
  const active=options.find(x=>x.id===select.value);
  selected.textContent=active?`✓ ${active.name} · ${active.country}`:'Sin club favorito (opcional)';
  results.replaceChildren();const q=normalize(input.value);
  if(q.length<2){status.textContent='Escribe dos letras o más para encontrar el club.';return}
  const filtered=options.filter(x=>normalize(x.name).includes(q)||normalize(x.country+' '+x.name).includes(q));
  const rank=x=>normalize(x.name)===q?0:normalize(x.name).startsWith(q)?1:2;
  filtered.sort((a,b)=>rank(a)-rank(b)||a.name.localeCompare(b.name,'es'));
  status.textContent=`${filtered.length} resultados · mostrando hasta 6`;
  if(!filtered.length){results.append(element('span','cr4102-no-club','No se encontró ese nombre.'));return}
  for(const x of filtered.slice(0,6)){
   const b=element('button','cr4102-club-result');b.type='button';b.dataset.clubChoice=x.id;
   b.append(element('b','',x.name),element('small','',x.country));
   if(x.id===select.value)b.classList.add('selected');
   results.append(b);
  }
 };
 input.addEventListener('input',()=>{savedClubSearch=input.value.slice(0,60);refresh()});
 input.addEventListener('keydown',event=>{if(event.key==='Enter'){
  event.preventDefault();const first=results.querySelector('button');if(first)first.click();
 }else if(event.key==='ArrowDown'){event.preventDefault();results.querySelector('button')?.focus({preventScroll:true})}});
 results.addEventListener('click',event=>{const b=event.target.closest('[data-club-choice]');if(!b)return;
  select.value=b.dataset.clubChoice;select.dispatchEvent(new Event('change',{bubbles:true}));
 });
 select.addEventListener('change',refresh);
 refresh();
}

function setup(main){
 if(main.dataset.creator4102==='1')return;
 const steps=[...document.querySelectorAll('.cr3 .creation-step')];
 const step=steps.findIndex(x=>x.classList.contains('active'));
 if(step<0)return;
 main.dataset.creator4102='1';main.classList.add('creator4102','creator4103','creator4104');main.dataset.step=String(step);
 reorganize(main,step);
}
let pending=false;
function scan(){pending=false;const root=document.getElementById('app');
 const build=root?.querySelector('.site-head .build');
 if(build&&/RASCENSO\s+4\.10\.[0-3]/.test(build.textContent))build.textContent='RASCENSO 4.10.4 · FUTBOLISTA RENOVADO';
 const main=root?.querySelector('.cr3 .cr-main');if(main&&!main.dataset.creator4102)setup(main);
}
function schedule(){if(pending)return;pending=true;requestAnimationFrame(scan)}
function start(){const root=document.getElementById('app');if(!root)return;
 new MutationObserver(schedule).observe(root,{childList:true,subtree:true});schedule();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
