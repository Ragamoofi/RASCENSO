import { COUNTRIES } from './countries.mjs';
import { POSITIONS, ATTRS, ORIGINS, PERSONALITIES, STYLES, DREAMS, getClub, getCountry, newCareer, migrateCareer, careerYear, currentDraft, rerollDraft, acceptDraft, academyOffers, signAcademy, advanceSeason, eventInfo, resolveEvent, chooseTransfer, simulateToRetirement, totals } from './engine.mjs';

const STORE='rascenso-save-v2';
const OLD_STORE='carrera-mundial-demo-v1';
const MIGRATED='rascenso-importacion-v1';
const root=document.getElementById('app');
const setupData={name:'',number:'9',age:'17',country:'CL',city:'',position:'DC',foot:'Derecha',origin:'barrio',personality:'disciplinado',style:'equilibrado',dream:'seleccion',story:'',mode:'Clásico'};
let setupStep=0;
let state=null;
let info='';
try {
  const current=localStorage.getItem(STORE);
  const legacy=!current&&!localStorage.getItem(MIGRATED)?localStorage.getItem(OLD_STORE):null;
  state=migrateCareer(JSON.parse(current||legacy||'null'));
  if(state){localStorage.setItem(STORE,JSON.stringify(state));if(legacy)localStorage.setItem(MIGRATED,'1');}
} catch {state=null;}
const h=v=>String(v??'').replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
const btn=(label,action,extra='',secondary=false)=>`<button class="btn ${secondary?'outline':''}" type="button" data-action="${action}" ${extra}>${label}</button>`;
const stat=(val,label)=>`<div class="stat"><strong>${h(val)}</strong><span>${h(label)}</span></div>`;
const option=(value,label,current)=>`<option value="${h(value)}" ${current===value?'selected':''}>${h(label)}</option>`;
const originName=(list,id)=>list.find(a=>a.id===id)?.name||'Sin definir';
const fmt=(s)=>`${getCountry(s.country)?.name||''} · ${POSITIONS.find(p=>p[0]===s.position)?.[1]||s.position}`;
const passport=()=>{
 const nation=getCountry(setupData.country);return `<div class="passport"><div class="passport-label">TARJETA DE PROSPECTO <span>R · 01</span></div>
  <div class="passport-number">${h(setupData.number||'9')}</div><div class="passport-name">${h(setupData.name||'TU NOMBRE')}</div>
  <div class="passport-meta">${h(nation?.name||'Chile')} <span>·</span> ${h(setupData.age)} años <span>·</span> ${h(POSITIONS.find(p=>p[0]===setupData.position)?.[1]||'Delantero centro')}</div>
  <div class="passport-rules"><span>${h(originName(ORIGINS,setupData.origin))}</span><span>${h(originName(STYLES,setupData.style))}</span></div>
 </div>`;
};
function persist(){try{localStorage.setItem(STORE,JSON.stringify(state));}catch{info='No fue posible guardar la partida en este navegador.';}}
function apply(next){state=next;persist();render();window.scrollTo({top:0,behavior:'instant'});}
function layout({heading,kicker='TU CARRERA, TUS DECISIONES',intro='',content='',side='',badge=''}){
  root.innerHTML=`<div class="shell">
   <header class="topbar"><div class="identity"><div class="crest" aria-hidden="true"><span>R</span><i>↗</i></div><div class="wordmark"><a href="./" aria-label="RASCENSO inicio">RASCENSO<span class="dot">.</span></a><small>DEL BARRIO A LA HISTORIA</small></div></div>
   <div class="headright"><span class="version">ALFA · 0.2</span>${state?`<span class="headerplayer">${h(state.name)}</span>${btn('Nueva carrera','reset','',true)}`:'<span class="online-pill"><i></i> SIMULACIÓN DE CARRERA</span>'}</div></header>
   <main><div class="hero"><div class="tinytitle"><span class="line"></span>${kicker}</div><h1>${heading}</h1>${intro?`<p>${intro}</p>`:''}${badge?`<span class="hero-badge">${badge}</span>`:''}</div>
   <div class="mainlayout ${side?'withside':''}"><div class="maincol">${content}</div>${side?`<aside class="asidecol">${side}</aside>`:''}</div></main>
   <footer><div class="footer-left"><span class="footer-brand">R<span>↗</span></span><span><b>RASCENSO</b> · Un camino. Miles de historias.</span></div><div class="footer-right">Una creación de <b>Ragamoofi</b> · Simulación ficticia. Proyecto independiente, no afiliado a Copero ni a los clubes.</div></footer>
  </div>${info?`<div class="toast" role="status">${h(info)}</div>`:''}`;
}
function selectedCards(list,field){return `<div class="select-cards">${list.map(x=>`<label class="pick ${setupData[field]===x.id?'active':''}"><input type="radio" name="${field}" value="${x.id}" ${setupData[field]===x.id?'checked':''}><span class="pick-head"><b>${h(x.name)}</b><i>${setupData[field]===x.id?'✓':'+'}</i></span><small>${h(x.description)}</small></label>`).join('')}</div>`;}
function setup(){
 const steps=[['01','Identidad'],['02','Tus raíces'],['03','Mentalidad'],['04','Confirmar']];
 const track=`<nav class="stepnav" aria-label="Etapas de creación">${steps.map(([n,t],i)=>`<button type="button" data-action="setup-step" data-step="${i}" class="step ${setupStep===i?'current':setupStep>i?'done':''}" ${i>setupStep?'disabled':''}><small>${n}</small><span>${t}</span></button>`).join('')}</nav>`;
 let body='';
 if(setupStep===0){
  body=`<h2>¿Quién es el próximo protagonista?</h2><p class="muted lead">Empieza con lo esencial: tu identidad, tu país y la posición en la que quieres destacar.</p>
   <div class="formgrid"><label>Nombre futbolístico <input name="name" maxlength="44" placeholder="Ej.: Oscar Sariego" value="${h(setupData.name)}" required></label>
   <label>Nacionalidad<select name="country">${COUNTRIES.map(c=>option(c.code,c.name,setupData.country)).join('')}</select></label>
   <label>Edad al comenzar<select name="age">${[16,17,18,19].map(n=>option(String(n),`${n} años`,setupData.age)).join('')}</select></label>
   <label>Posición<select name="position">${POSITIONS.map(([k,v])=>option(k,`${k} · ${v}`,setupData.position)).join('')}</select></label>
   <label>Número de camiseta <input type="number" name="number" min="1" max="99" value="${h(setupData.number)}" required></label>
   <label>Pierna hábil<select name="foot">${['Derecha','Izquierda'].map(x=>option(x,x,setupData.foot)).join('')}</select></label></div>`;
 }else if(setupStep===1){body=`<h2>Todos tienen un punto de partida</h2><p class="muted lead">¿Dónde aprendiste a jugar? Tu origen determina las primeras oportunidades y algunas ventajas pequeñas durante la carrera.</p>
   <label class="singlelabel">Ciudad de origen <input name="city" maxlength="40" value="${h(setupData.city)}" placeholder="Ej.: Santiago, Valparaíso, Concepción"></label>
   <div class="subheading">Tu camino al fútbol profesional</div>${selectedCards(ORIGINS,'origin')}`;
 }else if(setupStep===2){body=`<h2>No basta con tener talento</h2><p class="muted lead">Tus decisiones mostrarán qué tipo de jugador eres. La personalidad influirá en las relaciones; el estilo, en tu forma de competir.</p>
   <div class="subheading">¿Cómo eres dentro y fuera del campo?</div>${selectedCards(PERSONALITIES,'personality')}
   <div class="subheading">Tu identidad en la cancha</div>${selectedCards(STYLES,'style')}`;
 }else {body=`<h2>¿Hasta dónde quieres llegar?</h2><p class="muted lead">Escribe el inicio de tu historia. Podrás explorarla durante la carrera, mientras el simulador se encarga de los partidos y las temporadas.</p>
   <div class="subheading">Tu gran sueño</div>${selectedCards(DREAMS,'dream')}
   <label class="singlelabel">Una frase que defina tu historia <span class="optional">OPCIONAL</span><textarea name="story" maxlength="180" rows="3" placeholder="Ej.: Quiero sacar adelante a mi familia y convertirme en ídolo de mi ciudad.">${h(setupData.story)}</textarea></label>
   <div class="subheading">Cómo quieres descubrir tus atributos</div><div class="modebox"><label class="mode"><input type="radio" name="mode" value="Clásico" ${setupData.mode==='Clásico'?'checked':''}><span><b>Clásico</b><small>Conoces los valores antes de aceptar cada atributo.</small></span></label><label class="mode"><input type="radio" name="mode" value="Purista" ${setupData.mode==='Purista'?'checked':''}><span><b>Purista</b><small>Descubres el valor solo después de confirmarlo.</small></span></label></div>`;}
 const actions=`<div class="wizardactions">${setupStep>0?btn('Volver','setup-prev','',true):'<span class="hint">Tu progreso se guarda al comenzar la carrera.</span>'}${btn(setupStep===3?'Comenzar mi historia ↗':'Continuar →',setupStep===3?'setup-start':'setup-next')}</div>`;
 const country=getCountry(setupData.country);
 const side=`<div class="sidebox"><div class="sidetitle"><span>VISTA PREVIA</span><span>FUTBOLISTA</span></div>${passport()}<div class="sideinfo"><div class="sidetitle"><span>EL CAMINO POR DELANTE</span><span>01 / 04</span></div><div class="infosteps"><p><span>01</span> Define tu historia y tu estilo.</p><p><span>02</span> Construye tus 8 atributos con leyendas.</p><p><span>03</span> Firma con un club de ${h(country?.name||'tu país')}.</p><p><span>04</span> Abre tu camino hacia la élite.</p></div></div></div><div class="notice"><span>✦</span><div><b>Tus elecciones importan</b><p>Tu personalidad, origen y estilo tendrán consecuencias en la simulación. Puedes avanzar rápido cuando quieras.</p></div></div>`;
 layout({heading:'La carrera que tú escribes.',intro:'Cada leyenda comenzó en algún lugar. Crea tu futbolista, descubre sus atributos y haz que el mundo conozca su nombre.',badge:'49 PAÍSES · 166 CLUBES DE REFERENCIA',content:`<div class="panel createpanel">${track}<div class="stepcaption">CAPÍTULO ${String(setupStep+1).padStart(2,'0')} <span>/</span> 04</div><form id="creator" novalidate>${body}${actions}</form></div>`,side});
}
function draft(){
 const d=currentDraft(state);const count=state.draftIndex+1;
 const attrs=ATTRS.map(([key,label])=>`<div class="attr ${key in state.attributes?'filled':''}"><small>${label}</small><b>${key in state.attributes?state.attributes[key]:'—'}</b></div>`).join('');
 layout({heading:'El talento se construye.',kicker:'CAPÍTULO DOS · DRAFT DE ATRIBUTOS',intro:`Turno ${count} de 8. Conoce las leyendas, define tu estilo y construye un futbolista único.`,content:`<div class="panel"><div class="drafthead"><span class="eyebrow">ATRIBUTO ${count} DE 8</span><span class="muted">${state.mode}</span></div><div class="progress"><span style="width:${state.draftIndex*12.5}%"></span></div><div class="legendcard"><div class="legendtag">LEYENDA DEL FÚTBOL</div><h2>${h(d.legend)}</h2><p>Una inspiración para mejorar tu <b>${h(d.label)}</b>.</p><div class="recommended"><b>${d.hidden?'?':d.value}</b><span>${h(d.label.toUpperCase())}</span></div></div><div class="actions">${btn('Aceptar atributo →','draft-accept')}${btn(`Cambiar leyenda · ${5-state.draftRerolls} restantes`,'draft-reroll',state.draftRerolls>=5?'disabled':'',true)}</div></div>`,side:`<div class="panel sidebox"><div class="eyebrow">TU PERFIL ACTUAL</div><h3>${h(state.name)}</h3><p class="muted">${h(fmt(state))}</p><div class="attrs">${attrs}</div><p class="smallnote">${state.mode==='Purista'?'El valor se revela al confirmar cada elección.':'Puedes ver los valores antes de aceptarlos.'}</p></div>`});
}
function academy(){
 const offers=academyOffers(state), country=getCountry(state.country);
 layout({heading:'Tu primera camiseta.',kicker:'CAPÍTULO TRES · PRIMER CONTRATO',intro:`Tres equipos de ${country.name} quieren conocerte. Elige el club donde comenzarás tu historia.`,content:`<div class="panel"><div class="eyebrow">OFERTAS DE FORMACIÓN · ${h(country.league)}</div><div class="offers">${offers.map((c,i)=>`<article class="offer"><div class="offer-index">0${i+1} <span>OFERTA FORMAL</span></div><div class="emblem">${h(c.name.slice(0,1))}</div><h2>${h(c.name)}</h2><p class="muted">Nivel del club <b>${c.level}</b> · ${h(country.name)}</p><p class="offersub">${c.level>=state.ovr+15?'Un desafío exigente. Tendrás que luchar por cada minuto.':c.level>=state.ovr?'Un buen escenario para crecer y buscar oportunidades.':'Podrías disputar más minutos desde el inicio.'}</p>${btn('Firmar contrato ↗','academy',`data-id="${h(c.id)}"`)}</article>`).join('')}</div></div>`,side:`<div class="panel sidebox"><span class="eyebrow">TU PRIMERA FICHA</span><h3>${h(state.name)}</h3><div class="bigovr">${state.ovr}<small>OVR INICIAL</small></div><div class="summaryline"><span>Potencial</span><b>${state.potential}</b></div><div class="summaryline"><span>Personalidad</span><b>${h(originName(PERSONALITIES,state.personality))}</b></div><div class="summaryline"><span>Estilo</span><b>${h(originName(STYLES,state.style))}</b></div></div>`});
}
function dashboard(extra=''){
 const club=getClub(state.clubId),t=totals(state),history=[...state.history].reverse().slice(0,12);
 const rows=history.map(x=>`<tr><td><b>${x.year}</b></td><td>${h(x.club)}</td><td>${x.matches}</td><td>${x.goals}</td><td>${x.assists}</td><td>${x.ovrAfter}</td></tr>`).join('')||'<tr><td colspan="6">Tu primera temporada está por comenzar.</td></tr>';
 const narrative=state.story?`<blockquote>“${h(state.story)}”</blockquote>`:'';
 return `<div class="playerpanel"><div><div class="eyebrow">EXPEDIENTE DEL FUTBOLISTA · ${h(getCountry(state.country)?.name)}</div><h2>${h(state.name)} <span class="jersey">#${state.number}</span></h2><p>${h(POSITIONS.find(x=>x[0]===state.position)?.[1])} <span>·</span> ${state.age} años <span>·</span> ${h(club?.name)}</p>${state.city?`<small>De ${h(state.city)} al fútbol profesional</small>`:''}</div><div class="ovr"><strong>${state.ovr}</strong><small>MEDIA</small></div></div>
 <div class="statsgrid">${stat(t.matches,'Partidos')}${stat(t.goals,'Goles')}${stat(t.assists,'Asistencias')}${stat(t.international,'Selección')}${stat(state.trophies.length,'Títulos')}${stat(state.potential,'Potencial')}</div>
 ${extra}<section class="panel"><div class="sectionhead"><h2>Historial de carrera</h2><span>${state.history.length} TEMPORADAS</span></div><div class="tablewrap"><table><thead><tr><th>AÑO</th><th>CLUB</th><th>PJ</th><th>G</th><th>A</th><th>OVR</th></tr></thead><tbody>${rows}</tbody></table></div></section>
 <section class="panel"><div class="sectionhead"><h2>Más que estadísticas</h2><span>IDENTIDAD</span></div><div class="traitgrid"><div><small>Origen</small><b>${h(originName(ORIGINS,state.origin))}</b></div><div><small>Personalidad</small><b>${h(originName(PERSONALITIES,state.personality))}</b></div><div><small>Estilo</small><b>${h(originName(STYLES,state.style))}</b></div><div><small>Objetivo</small><b>${h(originName(DREAMS,state.dream))}</b></div></div>${narrative}<div class="meterline"><span>Confianza del entrenador</span><b>${state.coachTrust??50}/100</b></div><div class="meter"><i style="width:${state.coachTrust??50}%"></i></div><div class="meterline"><span>Ánimo</span><b>${state.morale}/100</b></div><div class="meter"><i style="width:${state.morale}%"></i></div>${state.decisions.length?`<details><summary>Ver decisiones importantes (${state.decisions.length})</summary><ul class="decisionlog">${state.decisions.slice(-15).reverse().map(x=>`<li>${h(x.text)}</li>`).join('')}</ul></details>`:''}</section>`;
}
function season(){
 const x=state.lastSeason;const latest=x?`<div class="panel seasonresult"><div class="eyebrow">RESUMEN DE TEMPORADA · ${x.year}</div><h2>${h(x.club)}</h2><p>${h(x.role)} · <b>${x.matches}</b> partidos · <b>${x.goals}</b> goles · <b>${x.assists}</b> asistencias</p><p class="muted">OVR ${x.ovrBefore} → ${x.ovrAfter} · Puesto liguero estimado: ${x.leaguePosition}°${x.titles.length?' · '+x.titles.map(h).join(', '):''}${x.worldCupResult?' · Mundial: '+h(x.worldCupResult):''}</p></div>`:'';
 layout({heading:'El próximo capítulo es tuyo.',kicker:`TEMPORADA ${careerYear(state)} · ${h(getClub(state.clubId)?.name||'')}`,intro:'Avanza de temporada en temporada. Las oportunidades, los desafíos y las decisiones marcarán el rumbo de tu carrera.',content:dashboard(`<div class="panel nextchapter"><div><div class="eyebrow">TU PRÓXIMO PASO</div><h2>Temporada ${careerYear(state)}</h2><p>¿Podrás ganarte un lugar en ${h(getClub(state.clubId)?.name)}?</p></div><div class="actions">${btn('Jugar siguiente temporada →','season-next')}${btn('Simular hasta el retiro','retire-auto','',true)}</div></div>${latest}`)});
}
function eventScreen(){
 const e=eventInfo(state);if(!e){apply({...state,phase:'season'});return;}
 layout({heading:'Las decisiones también se juegan.',kicker:`FUERA DE LA CANCHA · ${careerYear(state)-1}`,intro:'No todo se resuelve con el balón. Lo que decidas puede afectar la confianza, la moral y tu futuro.',content:dashboard(`<div class="panel eventpanel"><div class="eyebrow">UNA SITUACIÓN QUE PUEDE CAMBIARLO TODO</div><h2>${h(e.title)}</h2><p class="eventstory">${h(e.body)}</p><div class="choicegrid">${e.options.map((o,i)=>btn(`${i+1 < 10?`0${i+1}`:''} · ${h(o[0])}`,'event',`data-option="${i}"`,i!==0)).join('')}</div><p class="muted smallnote">Las consecuencias se calculan después de tomar tu decisión.</p></div>`)});
}
function transfers(){
 layout({heading:'El futuro toca a tu puerta.',kicker:'MERCADO · OFERTAS DE TRANSFERENCIA',intro:'Quedarte o cambiar de aires: la camiseta que elijas también cambia las oportunidades que recibirás.',content:dashboard(`<section class="panel"><div class="sectionhead"><h2>Ofertas de otros equipos</h2><span>${state.offers.length} PROPUESTAS</span></div><div class="offers">${state.offers.map((c,i)=>`<article class="offer"><div class="offer-index">0${i+1} <span>${h(c.country)}</span></div><div class="emblem">${h(c.name.slice(0,1))}</div><h3>${h(c.name)}</h3><p class="muted">${h(c.league)} · Nivel <b>${c.level}</b></p>${btn('Aceptar oferta ↗','transfer',`data-id="${h(c.id)}"`)}</article>`).join('')}</div><div class="actions">${btn('Continuar en mi club','transfer-stay','',true)}</div></section>`)});
}
function retired(){const t=totals(state),peak=Math.max(state.ovr,...state.history.map(x=>x.ovrAfter)), countries=[...new Set(state.history.map(x=>x.country))];
 layout({heading:'Tu nombre queda en la historia.',kicker:'EL ÚLTIMO SILBATAZO · RETIRO',intro:`Después de ${state.history.length} temporadas, ${h(state.name)} se despide del fútbol a los ${state.age} años. Cada decisión quedó atrás; ahora queda tu legado.`,content:dashboard(`<div class="panel farewell"><div class="eyebrow">LEGADO DE CARRERA</div><h2>El camino recorrido</h2><div class="statsgrid">${stat(t.matches,'Partidos')}${stat(t.goals,'Goles')}${stat(t.assists,'Asistencias')}${stat(peak,'Mejor media')}${stat(state.trophies.length,'Títulos')}${stat(countries.length,'Países')}</div><p>Jugaste en ${h(countries.join(', '))}.</p><div class="actions">${btn('Exportar mi historia ↗','export')}${btn('Crear otra carrera','reset','',true)}</div></div>`)});
}
function render(){info='';if(!state)return setup();switch(state.phase){case 'draft':return draft();case 'academy':return academy();case 'season':return season();case 'event':return eventScreen();case 'transfer':return transfers();case 'retired':return retired();default:state=null;return setup();}}
function collectCreator(){const form=document.getElementById('creator');if(!form)return;const data=new FormData(form);for(const [key,value] of data.entries())setupData[key]=value;}
function nextSetup(){collectCreator();if(setupStep===0){if(!setupData.name.trim()){const inp=document.querySelector('[name="name"]');inp?.focus();inp?.setCustomValidity('Indica un nombre para tu futbolista.');inp?.reportValidity();inp?.setCustomValidity('');return;}const number=Number(setupData.number);if(!Number.isFinite(number)||number<1||number>99){document.querySelector('[name="number"]')?.focus();return;}}setupStep=Math.min(3,setupStep+1);render();}
root.addEventListener('input',e=>{if(!state&&e.target.name&&e.target.closest('#creator')){setupData[e.target.name]=e.target.value;if(e.target.type==='radio'){const parent=e.target.closest('.select-cards');if(parent)parent.querySelectorAll('.pick').forEach(el=>el.classList.toggle('active',el.contains(e.target)));}const name=document.querySelector('.passport-name');if(name)name.textContent=setupData.name||'TU NOMBRE';const number=document.querySelector('.passport-number');if(number)number.textContent=setupData.number||'9';}});
root.addEventListener('change',e=>{if(!state&&e.target.closest('#creator')){collectCreator();if(e.target.closest('.select-cards')||['age','country','position'].includes(e.target.name))render();}});
root.addEventListener('submit',e=>{if(e.target.id!=='creator')return;e.preventDefault();if(setupStep===3){collectCreator();if(!setupData.name.trim()){setupStep=0;render();return;}try{apply(newCareer({...setupData,seed:`${Date.now()}-${Math.floor(Math.random()*1e7)}`}));}catch(err){alert(err.message);}}else nextSetup();});
root.addEventListener('click',e=>{
 const el=e.target.closest('[data-action]');if(!el||el.disabled)return;
 switch(el.dataset.action){
 case 'setup-next': nextSetup();break;
 case 'setup-prev': collectCreator();setupStep=Math.max(0,setupStep-1);render();break;
 case 'setup-step': collectCreator();setupStep=Math.min(setupStep,Number(el.dataset.step));render();break;
 case 'setup-start':collectCreator();if(!setupData.name.trim()){setupStep=0;render();return;}try{apply(newCareer({...setupData,seed:`${Date.now()}-${Math.floor(Math.random()*1e7)}`}));}catch(err){alert(err.message);}break;
 case 'reset':if(!confirm('¿Comenzar una carrera nueva? Tu partida actual se reemplazará. Puedes exportarla antes.'))return;state=null;setupStep=0;localStorage.removeItem(STORE);localStorage.setItem(MIGRATED,'1');render();break;
 case 'draft-accept':apply(acceptDraft(state));break;
 case 'draft-reroll':apply(rerollDraft(state));break;
 case 'academy':apply(signAcademy(state,el.dataset.id));break;
 case 'season-next':apply(advanceSeason(state));break;
 case 'event':apply(resolveEvent(state,Number(el.dataset.option)));break;
 case 'transfer':apply(chooseTransfer(state,el.dataset.id));break;
 case 'transfer-stay':apply(chooseTransfer(state));break;
 case 'retire-auto':if(confirm('¿Simular todas las temporadas restantes? El juego tomará las próximas decisiones automáticamente.'))apply(simulateToRetirement(state));break;
 case 'export':{const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`rascenso-${state.name.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-')}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);break;}
 }
});
render();
