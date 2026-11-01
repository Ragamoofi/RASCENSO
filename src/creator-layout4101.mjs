/* RASCENSO 4.10.1 — renovación del creador sin alterar sus reglas.
 * Trabaja sobre el HTML existente; los radios, selects, nombres y eventos
 * originales siguen intactos, por lo que las elecciones se guardan igual. */
const normalize=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('es').trim();
const safeText=value=>String(value||'');
const labelsByStep={
 0:['Identidad y cancha','Edad y pierna','Tu tipo de jugador'],
 1:['Tu historia','Formación','Entorno'],
 2:['Tu clase','Fortaleza','Debilidad','Estilo','Desarrollo'],
 3:['Carácter','Imagen pública','Decisiones'],
 4:['Sueño deportivo','Club favorito y draft']
};
const preferred=new Map();
let currentStep=-1;
const element=(tag,cls,text)=>{const el=document.createElement(tag);if(cls)el.className=cls;if(text!=null)el.textContent=text;return el};

function setupCreator(main){
 if(main.dataset.creator4101==='1')return;
 const steps=[...document.querySelectorAll('.cr3 .creation-step')];
 const step=steps.findIndex(el=>el.classList.contains('active'));
 if(step<0)return;
 main.dataset.creator4101='1';
 main.classList.add('creator4101');
 main.dataset.step=String(step);
 if(step!==currentStep)currentStep=step;
 const head=main.querySelector(':scope > .cr-head');
 const groups=[...main.querySelectorAll(':scope > .cr-group')];
 const split=main.querySelector(':scope > .cr-split');
 const notes=main.querySelector(':scope > .cr-report');
 let parts=[];
 if(step===0){
  const inner=[...split?.querySelectorAll('.cr-left > .cr-group')||[]];
  // Evitar que edad/pierna queden entre los campos de identidad y la cancha.
  inner.forEach(x=>x.remove());
  parts=[[split],inner,[...groups,...[...main.querySelectorAll(':scope > .cr-presets')]]];
 }else if(step===1){parts=[[split],groups.slice(0,1),groups.slice(1,2)];}
 else if(step===2){parts=[[split],...groups.map(g=>[g])];}
 else if(step===3){parts=groups.map(g=>[g]);}
 else if(step===4){parts=[[...groups,main.querySelector(':scope > .cr-dream')],[split]];}
 else if(step===5){main.classList.add('creator4101-summary');}

 if(parts.length){
  const categories=labelsByStep[step]||[];
  const bar=element('nav','creator4101-nav');bar.setAttribute('aria-label','Categorías de esta etapa');
  const panels=element('div','creator4101-panels');
  const live=element('div','creator4101-progress');live.setAttribute('aria-live','polite');
  const valid=parts.map(rows=>rows.filter(Boolean));
  const active=Math.min(Math.max(Number(preferred.get(step))||0,0),valid.length-1);
  const buttons=[];
  const panes=[];
  let cur=active;
  function update(next,moveFocus=false){
   cur=Math.min(Math.max(next,0),valid.length-1);preferred.set(step,cur);
   buttons.forEach((btn,i)=>{
    const selected=cur===i;btn.classList.toggle('active',selected);btn.setAttribute('aria-selected',String(selected));btn.tabIndex=selected?0:-1;
    const mark=btn.querySelector('.creator4101-mark');
    if(mark)mark.textContent=panes[i].querySelector('input[type="radio"]:checked')?'✓':'·';
   });
   panes.forEach((pane,i)=>{pane.hidden=cur!==i;pane.setAttribute('aria-hidden',String(cur!==i))});
   live.textContent=`Bloque ${cur+1} de ${valid.length}`;
   const prev=foot.querySelector('[data-creator4101-prev]'),nextBtn=foot.querySelector('[data-creator4101-next]');
   if(prev)prev.disabled=cur===0;
   if(nextBtn){nextBtn.hidden=cur===valid.length-1;nextBtn.textContent=cur===valid.length-1?'':`Siguiente: ${categories[cur+1]} →`;}
   if(moveFocus)buttons[cur]?.focus({preventScroll:true});
   main.scrollTop=0;
  }
  valid.forEach((rows,i)=>{
   const label=categories[i]||`Bloque ${i+1}`;
   const btn=element('button','creator4101-tab');btn.type='button';btn.dataset.creator4101Tab=String(i);btn.setAttribute('role','tab');
   const num=element('span','creator4101-n',String(i+1).padStart(2,'0'));
   const title=element('span','creator4101-tabtitle',label);
   const check=element('span','creator4101-mark','·');btn.append(num,title,check);bar.append(btn);buttons.push(btn);
   const pane=element('section','creator4101-pane');pane.setAttribute('role','tabpanel');pane.dataset.creator4101Pane=String(i);
   rows.forEach(row=>pane.append(row));panels.append(pane);panes.push(pane);
  });
  const foot=element('div','creator4101-mini-footer');
  const prev=element('button','creator4101-prev','← Bloque anterior');prev.type='button';prev.dataset.creator4101Prev='';
  const next=element('button','creator4101-next','Siguiente →');next.type='button';next.dataset.creator4101Next='';
  foot.append(prev,live,next);
  if(head)head.after(bar,panels,foot);else main.prepend(bar,panels,foot);
  bar.addEventListener('click',e=>{
   const btn=e.target.closest('[data-creator4101-tab]');if(btn)update(Number(btn.dataset.creator4101Tab),true);
  });
  bar.addEventListener('keydown',e=>{
   if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;
   e.preventDefault();const to=e.key==='Home'?0:e.key==='End'?valid.length-1:(cur+(e.key==='ArrowLeft'?-1:1)+valid.length)%valid.length;update(to,true);
  });
  foot.addEventListener('click',e=>{
   if(e.target.closest('[data-creator4101-prev]'))update(cur-1,true);
   if(e.target.closest('[data-creator4101-next]'))update(cur+1,true);
  });
  // El juego reconstruye todo el creador al elegir un radio.
  // La categoría activa se recuerda aquí; los radios no son reemplazados.
  update(active);
 }
 if(notes){
  const details=element('details','creator4101-report');
  const summary=element('summary','','Ver informe del formador');details.append(summary,notes);main.append(details);
 }
 if(step===4)installClubFinder(main);
}

let lastClubQuery='';
function installClubFinder(main){
 const fan=main.querySelector('.cr-fan');
 const select=fan?.querySelector('select[name="fanClubId"]');
 if(!fan||!select||fan.querySelector('.creator4101-clubsearch'))return;
 const options=[...select.options].filter(o=>o.value).map(o=>({id:o.value,name:safeText(o.textContent).trim(),country:o.parentElement?.label||''}));
 const search=element('div','creator4101-clubsearch');
 const label=element('label','','ENCUENTRA TU EQUIPO FAVORITO');
 const input=element('input','creator4101-clubinput');input.type='search';input.placeholder='Escribe un equipo: Católica, Iquique, Real Madrid…';
 input.autocomplete='off';input.setAttribute('aria-label','Buscar equipo favorito');input.value=lastClubQuery;
 label.append(input);
 const status=element('p','creator4101-clubstatus');
 const results=element('div','creator4101-clubresults');results.setAttribute('role','listbox');results.setAttribute('aria-label','Clubes encontrados');
 const chosen=element('div','creator4101-clubchosen');
 const manual=element('details','creator4101-manual');
 manual.append(element('summary','','Ver listado completo por país'));
 const origin=select.closest('label');if(origin)manual.append(origin);
 search.append(label,chosen,status,results,manual);
 fan.querySelector('.cr-label')?.after(search);
 const draw=()=>{
  const chosenOpt=options.find(x=>x.id===select.value);
  chosen.textContent=chosenOpt?`✓ Club seleccionado: ${chosenOpt.name} (${chosenOpt.country})`:'Club elegido: ninguno · opcional';
  const q=normalize(input.value);results.replaceChildren();
  if(q.length<2){status.textContent='Escribe al menos dos letras para buscar entre los clubes disponibles.';return;}
  const matches=options.filter(o=>normalize(o.name).includes(q)||normalize(o.country+' '+o.name).includes(q));
  matches.sort((a,b)=>{
   const score=o=>normalize(o.name)===q?0:normalize(o.name).startsWith(q)?1:2;
   return score(a)-score(b)||a.name.localeCompare(b.name,'es');
  });
  status.textContent=`${matches.length} coincidencia${matches.length===1?'':'s'} · mostrando hasta 10`;
  if(!matches.length){results.append(element('div','creator4101-nomatch','No encontramos ese nombre; prueba otra palabra.'));return}
  for(const o of matches.slice(0,10)){
   const btn=element('button','creator4101-clubresult');btn.type='button';btn.dataset.creator4101ClubId=o.id;btn.setAttribute('role','option');btn.setAttribute('aria-selected',String(select.value===o.id));
   btn.append(element('strong','',o.name),element('small','',o.country));
   results.append(btn);
  }
 };
 input.addEventListener('input',()=>{lastClubQuery=input.value.slice(0,60);draw()});
 input.addEventListener('keydown',e=>{
  if(e.key==='Enter'){e.preventDefault();if(results.children.length===1&&results.firstElementChild?.matches('button'))results.firstElementChild.click()}
  else if(e.key==='ArrowDown'){e.preventDefault();results.querySelector('button')?.focus()}
 });
 results.addEventListener('click',e=>{
  const btn=e.target.closest('[data-creator4101-club-id]');if(!btn)return;
  const id=btn.dataset.creator4101ClubId;
  if(!options.some(o=>o.id===id))return;
  select.value=id;
  select.dispatchEvent(new Event('change',{bubbles:true}));
 });
 select.addEventListener('change',draw);
 draw();
}
let queued=false;
function scan(){
 queued=false;
 const root=document.getElementById('app');
 const build=root?.querySelector('.site-head .build');
 if(build&&build.textContent.includes('4.10.0'))build.textContent='RASCENSO 4.10.1 · CREADOR RENOVADO';
 const main=root?.querySelector('.cr3 .cr-main');
 if(main&&!main.dataset.creator4101)setupCreator(main);
}
function schedule(){if(queued)return;queued=true;requestAnimationFrame(scan)}
function start(){
 const root=document.getElementById('app');if(!root)return;
 new MutationObserver(schedule).observe(root,{childList:true,subtree:true});schedule();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
