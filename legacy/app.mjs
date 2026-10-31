import { COUNTRIES } from './countries.mjs';
import { flag, badge, CATALOG_COUNT } from './assets.mjs';
import { POSITIONS, ATTRS, ORIGINS, PERSONALITIES, STYLES, DREAMS, getClub, getCountry, newCareer, migrateCareer, careerYear, currentDraft, draftChoices, rerollDraft, acceptDraft, simulatedStandings, academyOffers, signAcademy, advanceSeason, eventInfo, resolveEvent, finishEvent, autoResolveEvent, chooseTransfer, simulateToRetirement, totals } from './engine.mjs';

const STORE='rascenso-save-v2'; // conservar clave: las partidas anteriores se migran sin perderse
const OLD_STORE='carrera-mundial-demo-v1';
const MIGRATED='rascenso-importacion-v1';
const root=document.getElementById('app');
const setupData={name:'',number:'9',age:'17',country:'CL',city:'',position:'DC',foot:'Derecha',origin:'barrio',personality:'disciplinado',style:'equilibrado',dream:'seleccion',story:'',fanClubId:'',mode:'Clásico'};
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
const fanName=s=>s.fanClubId?getClub(s.fanClubId)?.name||'Sin definir':'No elegido';
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
  root.innerHTML=`<div class="shell ${state?'ingame':''}">
   <header class="topbar"><div class="identity"><div class="crest" aria-hidden="true"><span>R</span><i>↗</i></div><div class="wordmark"><a href="./" aria-label="RASCENSO inicio">RASCENSO<span class="dot">.</span></a><small>DEL BARRIO A LA HISTORIA</small></div></div>
   <div class="headright"><span class="version">ALFA · 0.4</span>${state?`<span class="headerplayer">${h(state.name)}</span>${btn('Nueva carrera','reset','',true)}`:'<span class="online-pill"><i></i> SIMULACIÓN DE CARRERA</span>'}</div></header>
   <main><div class="hero"><div class="tinytitle"><span class="line"></span>${kicker}</div><h1>${heading}</h1>${intro?`<p>${intro}</p>`:''}${badge?`<span class="hero-badge">${badge}</span>`:''}</div>
   <div class="mainlayout ${side?'withside':''}"><div class="maincol">${content}</div>${side?`<aside class="asidecol">${side}</aside>`:''}</div></main>
   <footer><div class="footer-left"><span class="footer-brand">R<span>↗</span></span><span><b>RASCENSO</b> · Un camino. Miles de historias.</span></div><div class="footer-right">Una creación de <b>Ragamoofi</b> · Simulación ficticia. Proyecto independiente, no afiliado a Copero ni a los clubes.</div></footer>
  </div>${info?`<div class="toast" role="status">${h(info)}</div>`:''}`;
}
function selectedCards(list,field){return `<div class="select-cards">${list.map(x=>`<label class="pick ${setupData[field]===x.id?'active':''}"><input type="radio" name="${field}" value="${x.id}" ${setupData[field]===x.id?'checked':''}><span class="pick-head"><b>${h(x.name)}</b><i>${setupData[field]===x.id?'✓':'+'}</i></span><small>${h(x.description)}</small></label>`).join('')}</div>`;}
function setup(){
 const steps=[['01','Identidad'],['02','Tus raíces'],['03','Tu equipo'],['04','Mentalidad'],['05','Confirmar']];
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
 }else if(setupStep===2){
  const selected=setupData.fanClubId?getClub(setupData.fanClubId):null;
  const home=COUNTRIES.find(c=>c.code===setupData.country);
  const others=COUNTRIES.filter(c=>c.code!==setupData.country);
  const clubSelect=(c)=>`<optgroup label="${h(c.name)}">${c.clubs.map(club=>option(club.id,club.name,setupData.fanClubId)).join('')}</optgroup>`;
  body=`<h2>¿De qué equipo eres hincha?</h2><p class="muted lead">Esta elección es totalmente opcional. No modifica las ofertas ni asegura un fichaje. Si algún día llegas a ese club, los personajes y la historia recordarán tu vínculo.</p>
   <div class="supporterintro"><div class="supportercrest">♡</div><div><b>Una camiseta que llevas desde antes de ser profesional</b><p>Podrás crecer en otro equipo, enfrentar preguntas de la prensa o, si se da por méritos y suerte, cumplir ese sueño.</p></div></div>
   <label class="singlelabel">Club del que eres hincha <span class="optional">OPCIONAL</span><select name="fanClubId"><option value="">Ninguno / prefiero no elegir</option>${home?clubSelect(home):''}${others.map(clubSelect).join('')}</select></label>
   <div class="supporterselection">${selected?`${badge(selected,"large")}<div><small>TU EQUIPO</small><strong>${h(selected.name)}</strong><p>${h(selected.country)} · Este sentimiento puede aparecer en escenas, entrevistas y fichajes futuros.</p></div>`:'<span class="muted">Puedes dejarlo vacío. La carrera funcionará exactamente igual.</span>'}</div>`;
 }else if(setupStep===3){body=`<h2>No basta con tener talento</h2><p class="muted lead">Tus decisiones mostrarán qué tipo de jugador eres. La personalidad influirá en las relaciones; el estilo, en tu forma de competir.</p>
   <div class="subheading">¿Cómo eres dentro y fuera del campo?</div>${selectedCards(PERSONALITIES,'personality')}
   <div class="subheading">Tu identidad en la cancha</div>${selectedCards(STYLES,'style')}`;
 }else {body=`<h2>¿Hasta dónde quieres llegar?</h2><p class="muted lead">Escribe el inicio de tu historia. Podrás explorarla durante la carrera, mientras el simulador se encarga de los partidos y las temporadas.</p>
   <div class="subheading">Tu gran sueño</div>${selectedCards(DREAMS,'dream')}
   <label class="singlelabel">Una frase que defina tu historia <span class="optional">OPCIONAL</span><textarea name="story" maxlength="180" rows="3" placeholder="Ej.: Quiero sacar adelante a mi familia y convertirme en ídolo de mi ciudad.">${h(setupData.story)}</textarea></label>
   <div class="subheading">Cómo quieres descubrir tus atributos</div><div class="modebox"><label class="mode"><input type="radio" name="mode" value="Clásico" ${setupData.mode==='Clásico'?'checked':''}><span><b>Clásico</b><small>Conoces los valores antes de aceptar cada atributo.</small></span></label><label class="mode"><input type="radio" name="mode" value="Purista" ${setupData.mode==='Purista'?'checked':''}><span><b>Purista</b><small>Descubres el valor solo después de confirmarlo.</small></span></label></div>`;}
 const actions=`<div class="wizardactions">${setupStep>0?btn('Volver','setup-prev','',true):'<span class="hint">Tu progreso se guarda al comenzar la carrera.</span>'}${btn(setupStep===4?'Comenzar mi historia ↗':'Continuar →',setupStep===4?'setup-start':'setup-next')}</div>`;
 const country=getCountry(setupData.country);
 const side=`<div class="sidebox"><div class="sidetitle"><span>VISTA PREVIA</span><span>FUTBOLISTA</span></div>${passport()}<div class="sideinfo"><div class="sidetitle"><span>EL CAMINO POR DELANTE</span><span>01 / 05</span></div><div class="infosteps"><p><span>01</span> Define tu historia y tu estilo.</p><p><span>02</span> Elige tus colores de hincha (opcional).</p><p><span>03</span> Construye tus 8 atributos con leyendas.</p><p><span>04</span> Firma con un club de ${h(country?.name||'tu país')}.</p><p><span>05</span> Vive las escenas y construye tu carrera.</p></div></div></div><div class="notice"><span>✦</span><div><b>Tus elecciones importan</b><p>Tu personalidad, origen y estilo tendrán consecuencias en la simulación. Puedes avanzar rápido cuando quieras.</p></div></div>`;
 layout({heading:'La carrera que tú escribes.',intro:'Cada leyenda comenzó en algún lugar. Crea tu futbolista, descubre sus atributos y haz que el mundo conozca su nombre.',badge:`49 PAÍSES · ${CATALOG_COUNT} CLUBES · TU HISTORIA`,content:`<div class="panel createpanel">${track}<div class="stepcaption">CAPÍTULO ${String(setupStep+1).padStart(2,'0')} <span>/</span> 05</div><form id="creator" novalidate>${body}${actions}</form></div>`,side});
}
function draft(){
 const choices=draftChoices(state),count=state.draftIndex+1;
 const source=Object.fromEntries((state.draftSources||[]).map(x=>[x.attribute,x.legend]));
 const attrs=ATTRS.map(([key,label])=>`<div class="trait-row ${key in state.attributes?'trait-ready':''}"><span>${h(label)}</span><strong>${key in state.attributes?state.attributes[key]:'—'}</strong><small>${h(source[key]||'Por definir')}</small></div>`).join('');
 const content=`<div class="panel scouting-draft"><div class="sectionhead"><div><div class="eyebrow">MERCADO DE TALENTOS · ELECCIÓN ${count}/8</div><h2>Elige la huella que dejará cada leyenda</h2><p class="muted">Tres perfiles distintos. Un solo atributo se suma a tu carta por elección; el resto queda para las próximas rondas.</p></div><span class="roundcount">${count}<small>/ 8</small></span></div><div class="progress"><span style="width:${state.draftIndex*12.5}%"></span></div>
 <div class="scout-cards">${choices.map((d,i)=>`<article class="scout-card"><div class="scout-rank">OPCIÓN ${i+1} <span>★ INSPIRACIÓN</span></div><div class="scout-silhouette">${h(d.legend.split(' ').map(x=>x[0]).slice(0,2).join(''))}</div><h3>${h(d.legend)}</h3><span class="scout-attribute">${h(d.label)}</span><div class="scout-value">${d.hidden?'?':d.value}<small>${d.hidden?'DESCONOCIDO':'VALOR DEL ATRIBUTO'}</small></div><div class="scout-fit">${h(d.fit)}</div>${btn('Elegir este legado ↗','draft-accept',`data-index="${i}"`)}</article>`).join('')}</div><div class="draft-foot"><span>${state.mode==='Purista'?'Modo Purista: el valor solo se revela al elegir.':'Modo Clásico: el valor se muestra antes de elegir.'}</span>${btn(`Renovar propuestas (${5-state.draftRerolls})`,'draft-reroll',state.draftRerolls>=5?'disabled':'',true)}</div></div>`;
 const side=`<div class="panel scout-sidebar"><div class="eyebrow">TU CARTA EN CONSTRUCCIÓN</div><h2>${h(state.name)}</h2><div class="scout-meta">${flag(state.country)} ${h(fmt(state))}</div><div class="trait-table">${attrs}</div><p class="muted mini-disclaimer">Los atributos de las leyendas son valoraciones ficticias diseñadas para el juego.</p></div>`;
 layout({heading:'Forja tu estilo de juego.',kicker:'DRAFT · 8 DECISIONES',content,side});
}
function academy(){
 const offers=academyOffers(state),country=getCountry(state.country);
 const main=`<div class="panel academy-panel"><div class="sectionhead"><div><span class="eyebrow">OFERTAS DE FORMACIÓN</span><h2>Tres clubes de ${h(country.name)} te quieren fichar</h2><p class="muted">Cada escudo representa una oportunidad. Tu primer club siempre pertenece a tu país.</p></div>${flag(country.code,'country-flag')}</div><div class="offer-grid">${offers.map((c,i)=>`<article class="offer-v4"><span class="offer-no">OFERTA 0${i+1}</span>${badge(c,'xlarge')}<h3>${h(c.name)}</h3><p> ${h(country.league)} </p><div class="offer-meta"><span>NIVEL</span><b>${c.level}</b><span>PROYECTO</span><b>${c.level>state.ovr+15?'COMPETITIVO':c.level>state.ovr?'DESARROLLO':'PROTAGONISMO'}</b></div>${btn('Firmar contrato ↗','academy',`data-id="${h(c.id)}"`)}</article>`).join('')}</div></div>`;
 const side=`<div class="panel scout-sidebar"><div class="eyebrow">FICHA DEL FUTBOLISTA</div><h2>${h(state.name)}</h2><div class="bigovr">${state.ovr}<small>MEDIA INICIAL</small></div><div class="summaryline"><span>País</span><b>${flag(state.country)} ${h(country.name)}</b></div><div class="summaryline"><span>Posición</span><b>${h(state.position)}</b></div><div class="summaryline"><span>Potencial</span><b>${state.potential}</b></div><p class="muted">Tu media y tu proyección no garantizan que seas titular.</p></div>`;
 layout({heading:'El primer gran paso.',kicker:'CANCHA · VESTUARIO · PRIMER CONTRATO',content:main,side});
}
function relationshipMeter(k){const r=state.relationships?.[k];if(!r)return '';const v=Math.max(0,Math.min(100,r.trust));return `<div class="relation-item"><div><b>${h(r.name)}</b><small>${h(r.role)}</small></div><div class="relationship-value"><span>${v}/100</span><div class="mini-meter"><i style="width:${v}%"></i></div></div></div>`;}
function storyJournal(){const log=[...(state.storyLog||[])].reverse();return `<section class="panel journal-panel"><div class="sectionhead"><h2>Bitácora de tu historia</h2><span>${log.length} ESCENAS</span></div>${log.length?`<div class="journal-list">${log.slice(0,24).map(item=>`<article class="journal-item"><div class="journal-date">${h(item.year)} · ${h(item.tag)}</div><strong>${h(item.title)}</strong><p>Hablaste con ${h(item.actor)} · ${h(item.choice)}</p>${item.words?`<blockquote>«${h(item.words)}»</blockquote>`:''}<small>${h(item.result)}</small></article>`).join('')}</div>`:'<p class="muted">Tus conversaciones y decisiones importantes aparecerán aquí cuando avances en la historia.</p>'}</section>`;}
function playerBrief(){const club=getClub(state.clubId),sum=totals(state);return `<div class="story-player"><div class="player-mark">${h(state.name.slice(0,1).toUpperCase())}</div><div><div class="eyebrow">TU CARRERA EN CURSO</div><h3>${h(state.name)}</h3><p>${h(club?.name||'Sin club')} · ${state.age} años</p>${state.fanClubId?`<small>♥ Hincha de ${h(fanName(state))}</small>`:''}</div><div class="story-ovr"><b>${h(state.ovr||'—')}</b><small>OVR</small></div></div><div class="story-summary"><div><b>${sum.matches}</b><small>PJ</small></div><div><b>${sum.goals}</b><small>Goles</small></div><div><b>${sum.assists}</b><small>Asist.</small></div><div><b>${state.history.length}</b><small>Años</small></div></div>`;}
function setFanLater(){if(state.fanClubId||state.phase==='retired')return '';
 const opts=COUNTRIES.map(c=>`<optgroup label="${h(c.name)}">${c.clubs.map(club=>option(club.id,club.name,'')).join('')}</optgroup>`).join('');
 return `<details class="fan-later"><summary>¿Quieres agregar tu equipo favorito a esta partida?</summary><div class="later-supporter"><p>Opcional. No influye en las ofertas ni asegura llegar al equipo. Solo se puede definir una vez para mantener la continuidad de la historia.</p><select id="fan-later-select"><option value="">Ninguno por ahora</option>${opts}</select>${btn('Guardar mi equipo favorito','fan-set')}</div></details>`;
}
function seasonRows(){
 const hist=[...(state.history||[])].reverse();
 return hist.length?hist.slice(0,13).map(x=>`<div class="hist-row"><span>${x.year}</span>${badge(getClub(x.clubId),'tiny')}<b title="${h(x.club)}">${h(x.club)}</b><span>${x.matches}</span><span>${x.goals}</span><span>${x.assists}</span><strong>${x.ovrAfter}</strong></div>`).join(''):'<p class="muted" style="padding:16px">El historial aparecerá después de tu primera temporada.</p>';
}
function leagueSidebar(){
 const club=getClub(state.clubId);const table=simulatedStandings(state);
 return `<aside class="league-side"><div class="league-head"><div><span class="eyebrow">LIGA NACIONAL</span><h3>${h(club?.league||'Liga')}</h3></div>${flag(club?.countryCode||state.country)}</div><div class="table-note">Tabla ilustrativa · resultados estimados</div><div class="standings-head"><span>#</span><span>EQUIPO</span><span>PJ</span><span>PTS</span></div><div class="standings-list">${table.map(t=>`<div class="standings-row ${t.isPlayer?'is-me':''}"><span class="rank">${t.position}</span><div class="team-name">${badge(getClub(t.id),'tiny')}<span title="${h(t.name)}">${h(t.name)}</span></div><span>${t.played}</span><strong>${t.points}</strong></div>`).join('')}</div><div class="league-footer">${flag(state.country)} ${h(getCountry(state.country)?.name)} · ${CATALOG_COUNT} clubes en el catálogo mundial</div></aside>`;
}
function careerPlayer(){
 const club=getClub(state.clubId),t=totals(state),fan=state.fanClubId?getClub(state.fanClubId):null;
 return `<aside class="career-player"><div class="playercard-cover"><div class="eyebrow">FUTBOLISTA PROFESIONAL</div><div class="main-player-icon">${badge(club,'xlarge')}</div><div class="player-overall">${state.ovr}<small>OVR</small></div><h2>${h(state.name)}</h2><div class="player-national">${flag(state.country)} ${h(state.country)} · ${h(state.position)} · #${state.number}</div></div>
 <div class="club-band">${badge(club,'medium')}<div><small>CLUB ACTUAL</small><b>${h(club?.name||'Sin equipo')}</b><span>${h(club?.league||'')}</span></div></div>
 <div class="player-metrics"><div><b>${state.age}</b><small>EDAD</small></div><div><b>${t.matches}</b><small>PJ</small></div><div><b>${t.goals}</b><small>GOLES</small></div><div><b>${t.assists}</b><small>ASIST.</small></div></div>
 ${fan?`<div class="fan-band">${badge(fan,'tiny')}<span>Hincha de <b>${h(fan.name)}</b></span></div>`:setFanLater()}
 <div class="history-heading"><h3>Trayectoria</h3><small>${state.history.length} TEMPORADAS</small></div><div class="hist-header"><span>AÑO</span><span>CLUB</span><span>PJ</span><span>G</span><span>A</span><span>OVR</span></div><div class="career-history">${seasonRows()}</div><div class="left-fine">${state.trophies.length?`🏆 ${state.trophies.length} títulos ganados`:'✦ Tu historia comienza en la cancha'}</div></aside>`;
}
function dashboard(extra=''){
 return `<div class="career-board">${careerPlayer()}<section class="career-center">${extra}</section>${leagueSidebar()}</div>`;
}
function season(){
 const x=state.lastSeason, club=getClub(state.clubId);
 const card=`<div class="season-stage"><div class="stadium-hero"><div class="stadium-glow"><span>RASCENSO · MODO CARRERA</span><strong>${careerYear(state)}</strong><small>UNA TEMPORADA MÁS, UNA NUEVA OPORTUNIDAD</small></div></div>
 <div class="season-content"><div class="season-tag">SIGUIENTE DESAFÍO</div><h2>La temporada ${careerYear(state)} comienza ahora.</h2><p>Sigues defendiendo los colores de <b>${h(club?.name)}</b>. Tus atributos, tu rendimiento y las decisiones anteriores marcarán la próxima campaña.</p>
 ${x?`<div class="previous-season"><div><small>ÚLTIMA TEMPORADA · ${x.year}</small><b>${h(x.club)}</b></div><div><b>${x.matches}</b><small>PJ</small></div><div><b>${x.goals}</b><small>G</small></div><div><b>${x.assists}</b><small>A</small></div><div><b>${x.leaguePosition}º</b><small>LIGA</small></div></div>`:''}
 <div class="career-actions">${btn('Simular siguiente temporada →','season-next')}${btn('Avanzar hasta el retiro','retire-auto','',true)}</div><p class="muted smallnote">Cada temporada simula evolución, partidos, goles, títulos y posibles oportunidades.</p></div></div>`;
 layout({heading:`Temporada ${careerYear(state)} · ${h(club?.name)}`,kicker:'MI CARRERA · MODO PROFESIONAL',content:dashboard(card)});
}
function eventScreen(){
 const e=eventInfo(state);if(!e){apply({...state,phase:'season'});return;}
 const beat=state.sceneBeat||0,choice=beat?e.options[state.sceneChoice??0]:null;
 const latest=state.lastSeason;
 const main=`<div class="event-stage"><div class="event-banner"><span class="event-topline">RASCENSO · DECISIÓN DE CARRERA</span><span class="event-label">${h(e.tag)} · ${h(e.place)}</span></div><div class="event-content"><div class="eyebrow">TEMPORADA ${h(latest?.year??careerYear(state))} · ${h(e.tag)}</div><h2>${h(e.title)}</h2>
 ${beat?`<div class="event-choice-done"><span>EL CAMINO QUE ELEGISTE</span><b>${h(choice.title)}</b></div><p class="event-reaction">${h(choice.dialogue)}</p><div class="impact-summary"><span>↗ EFECTO EN TU CARRERA</span><p>${h(choice.impact)}</p></div><div class="event-buttons">${btn('Continuar con mi carrera →','event-finish')}</div>`:
 `<p class="event-narrative">${h(e.paragraphs.join(' '))}</p><div class="event-speaker"><span class="coach-symbol">⚽</span><span><small>${h(e.speaker.role)} · ${h(e.speaker.name)}</small><b>${h(e.speech)}</b></span></div><div class="event-prompt">ELIGE TU ENFOQUE</div><div class="tactical-actions">${e.options.map((o,i)=>`<button type="button" class="tactical-card" data-action="event" data-option="${i}"><span class="tactical-index">0${i+1}</span><span><strong>${h(o.title)}</strong><small>${h(o.detail)}</small></span><span class="tactical-arrow">↗</span></button>`).join('')}</div><div class="event-buttons"><span class="muted">Tus elecciones dejan huella en futuras temporadas.</span>${btn('Pasar esta decisión','event-skip','',true)}</div>`}</div></div>`;
 layout({heading:`${h(e.tag)} · Temporada ${h(latest?.year??careerYear(state))}`,kicker:'DECISIONES FUTBOLÍSTICAS · SIN INTERROGATORIOS',content:dashboard(main)});
}
function transfers(){
 const count=state.offers.length;
 const main=`<div class="transfer-stage"><div class="sectionhead"><div><div class="eyebrow">MERCADO DE FICHAJES · ${careerYear(state)}</div><h2>Tu futuro está en juego.</h2><p class="muted">Elige un nuevo equipo o continúa en tu club. Una oferta no garantiza que seas titular.</p></div><b>${count} OFERTAS</b></div><div class="transfer-grid">${state.offers.map((c,i)=>`<article class="transfer-option"><span>OFERTA ${i+1}</span>${badge(c,'large')}<h3>${h(c.name)}</h3><small>${flag(c.countryCode)} ${h(c.country)} · NIVEL ${c.level}</small>${c.id===state.fanClubId?'<strong class="dream-call">♥ EL CLUB DE TUS SUEÑOS</strong>':''}${btn('Fichar por este club ↗','transfer',`data-id="${h(c.id)}"`)}</article>`).join('')}</div><div class="transfer-bottom">${btn('Continuar en mi equipo actual','transfer-stay','',true)}</div></div>`;
 layout({heading:'Mercado de transferencias',kicker:'LA SIGUIENTE CAMISETA',content:dashboard(main)});
}
function retired(){const t=totals(state),peak=Math.max(state.ovr,...state.history.map(x=>x.ovrAfter)), countries=[...new Set(state.history.map(x=>x.country))];
 layout({heading:'Tu nombre queda en la historia.',kicker:'EL ÚLTIMO SILBATAZO · RETIRO',intro:`Después de ${state.history.length} temporadas, ${h(state.name)} se despide del fútbol a los ${state.age} años. Cada decisión quedó atrás; ahora queda tu legado.`,content:dashboard(`<div class="panel farewell"><div class="eyebrow">LEGADO DE CARRERA</div><h2>El camino recorrido</h2><div class="statsgrid">${stat(t.matches,'Partidos')}${stat(t.goals,'Goles')}${stat(t.assists,'Asistencias')}${stat(peak,'Mejor media')}${stat(state.trophies.length,'Títulos')}${stat(countries.length,'Países')}</div><p>Jugaste en ${h(countries.join(', '))}.</p><div class="actions">${btn('Exportar mi historia ↗','export')}${btn('Crear otra carrera','reset','',true)}</div></div>`)});
}
function render(){info='';if(!state)return setup();switch(state.phase){case 'draft':return draft();case 'academy':return academy();case 'season':return season();case 'event':return eventScreen();case 'transfer':return transfers();case 'retired':return retired();default:state=null;return setup();}}
function collectCreator(){const form=document.getElementById('creator');if(!form)return;const data=new FormData(form);for(const [key,value] of data.entries())setupData[key]=value;}
function nextSetup(){collectCreator();if(setupStep===0){if(!setupData.name.trim()){const inp=document.querySelector('[name="name"]');inp?.focus();inp?.setCustomValidity('Indica un nombre para tu futbolista.');inp?.reportValidity();inp?.setCustomValidity('');return;}const number=Number(setupData.number);if(!Number.isFinite(number)||number<1||number>99){document.querySelector('[name="number"]')?.focus();return;}}setupStep=Math.min(4,setupStep+1);render();}
root.addEventListener('input',e=>{if(!state&&e.target.name&&e.target.closest('#creator')){setupData[e.target.name]=e.target.value;if(e.target.type==='radio'){const parent=e.target.closest('.select-cards');if(parent)parent.querySelectorAll('.pick').forEach(el=>el.classList.toggle('active',el.contains(e.target)));}const name=document.querySelector('.passport-name');if(name)name.textContent=setupData.name||'TU NOMBRE';const number=document.querySelector('.passport-number');if(number)number.textContent=setupData.number||'9';}});
root.addEventListener('change',e=>{if(!state&&e.target.closest('#creator')){collectCreator();if(e.target.closest('.select-cards')||['age','country','position'].includes(e.target.name))render();}});
root.addEventListener('submit',e=>{if(e.target.id!=='creator')return;e.preventDefault();if(setupStep===4){collectCreator();if(!setupData.name.trim()){setupStep=0;render();return;}try{apply(newCareer({...setupData,seed:`${Date.now()}-${Math.floor(Math.random()*1e7)}`}));}catch(err){alert(err.message);}}else nextSetup();});
root.addEventListener('error',e=>{if(e.target.matches('img.badge-img'))e.target.remove();else if(e.target.closest('.flag'))e.target.remove();},true);
root.addEventListener('click',e=>{
 const el=e.target.closest('[data-action]');if(!el||el.disabled)return;
 switch(el.dataset.action){
 case 'setup-next': nextSetup();break;
 case 'setup-prev': collectCreator();setupStep=Math.max(0,setupStep-1);render();break;
 case 'setup-step': collectCreator();setupStep=Math.min(setupStep,Number(el.dataset.step));render();break;
 case 'setup-start':collectCreator();if(!setupData.name.trim()){setupStep=0;render();return;}try{apply(newCareer({...setupData,seed:`${Date.now()}-${Math.floor(Math.random()*1e7)}`}));}catch(err){alert(err.message);}break;
 case 'reset':if(!confirm('¿Comenzar una carrera nueva? Tu partida actual se reemplazará. Puedes exportarla antes.'))return;state=null;setupStep=0;localStorage.removeItem(STORE);localStorage.setItem(MIGRATED,'1');render();break;
 case 'draft-accept':apply(acceptDraft(state,Number(el.dataset.index||0)));break;
 case 'draft-reroll':apply(rerollDraft(state));break;
 case 'academy':apply(signAcademy(state,el.dataset.id));break;
 case 'season-next':apply(advanceSeason(state));break;
 case 'event':apply(resolveEvent(state,Number(el.dataset.option)));break;
 case 'event-respond':{const choice=document.querySelector('input[name="scene-option"]:checked'); const words=document.getElementById('scene-words')?.value||'';apply(resolveEvent(state,Number(choice?.value??0),words));break;}
 case 'event-finish':apply(finishEvent(state));break;
 case 'event-skip':apply(autoResolveEvent(state));break;
 case 'fan-set':{if(state.fanClubId)break;const clubId=document.getElementById('fan-later-select')?.value;if(!getClub(clubId))break;apply({...state,fanClubId:clubId,storyFlags:{...state.storyFlags,playedForFan:!!state.history.some(x=>x.clubId===clubId)},decisions:[...state.decisions,{age:state.age,text:`Dejaste registrado que eres hincha de ${getClub(clubId).name}`}]});break;}
 case 'transfer':apply(chooseTransfer(state,el.dataset.id));break;
 case 'transfer-stay':apply(chooseTransfer(state));break;
 case 'retire-auto':if(confirm('¿Simular todas las temporadas restantes? El juego tomará las próximas decisiones automáticamente.'))apply(simulateToRetirement(state));break;
 case 'export':{const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`rascenso-${state.name.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-')}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);break;}
 }
});
render();