import { retirementView } from './retirement42.mjs';
import {loadedFM26Clubs,advanceFM26Season} from './fm26-real.mjs';
import {installWorldDatabase,getWorldDatabaseInfo,getWorldMappingInfo,activateWorldContext,activateWorldClub,searchWorldPlayers,searchWorldClubs,getWorldPlayer,readWorldClub,forgetWorldDatabase} from './fm26-universe.mjs';
import { academyOfferReason } from './engine.mjs';
/* RASCENSO — Interfaz renovada. Motor y UI independientes. Sin dependencias de framework. */
import { COUNTRIES } from './countries.mjs';
import { VERIFIED_LEAGUES, getInauguralLeague } from './leagues2026.mjs';
import { getCompetitionForCareer, leagueParticipants } from './league.mjs';
import { flag, badge, CATALOG_COUNT } from './assets.mjs?v=330';
import { annualSalaryLabel, playerDemand, clubPrestige } from './market.mjs';
import { ENVIRONMENTS, PUBLIC_IMAGES, RISK_PROFILES, DEVELOPMENT_PATHS, PREPARATIONS, archetypeFor } from './career08.mjs';
import { legendPhoto, legendIllustration } from './legend-art.mjs';
import { enhanceLegendImages } from './portrait12.mjs';
import { enhanceCountryKit } from './kits19.mjs';
import { competitionLogo, trophyImage, WORLD_TROPHIES } from './competition12.mjs';
import { trophyEntries, trophyRail, trophyDetail } from './trophy45.mjs';
import { clubSeasonTrophiesHTML, selectionPanel } from './history46.mjs';
import { seasonReview, matchContext } from './career10.mjs';
import { marketValueEUR, contractSnapshot, careerAchievements, careerHeadline, fixtureContext } from './career15.mjs';
import { classesFor, classFor, STRENGTH_OPTIONS, WEAKNESS_OPTIONS } from './archetypes17.mjs';
import { MOMENT_NAMES, ZONES, timingTarget, minigameMode, memorySequence, memoryAccuracy } from './moments15.mjs';
import { competitionSummary, GLOBAL_COUNTRIES, GLOBAL_CONFEDERATIONS, NATIONAL_CUPS, CONTINENTAL_CLUB_CUPS } from './competitions13.mjs';
import { getSeasonAgenda } from './agenda09.mjs';
import { seasonMoment, playCareerMoment, POSITIONS, ATTRS, ORIGINS, PERSONALITIES, STYLES, DREAMS, newCareer, getClub, getCountry, migrateCareer, syncClub, careerYear, draftChoices, acceptDraft, rerollDraft, choosePreparation, academyOffers, academyContractOffer, signAcademy, advanceSeason, simulatedStandings, eventInfo, resolveEvent, finishEvent, autoResolveEvent, chooseTransfer, chooseSeasonPlan, SEASON_PLANS, chooseSeasonAgenda, openAgentMarket, askAgentForMore, retireFromMarket, simulateToRetirement, totals, dreamProgress, negotiateOffer, negotiateRenewal, retireNow, canRetire } from './engine.mjs';
import { seasonPlays, resolveSeasonPlay, autoResolveSeasonPlay, chooseMatchRhythm } from './engine.mjs';
import { matchdayPanel, rivalLedger } from './matchday41.mjs';
import { playsPanel, openPlay } from './plays-ui.mjs';
import { creatorView, STEPS, draftView, dnaCard } from './creator30.mjs';
import { PRESETS, randomFields } from './identity30.mjs';
import { cardExtras, projectionLine, attributeBar, seasonPanels, optionConsequences, recapExtras, vestuarioView, worldView, historyExtras, offerExtras, negotiationBanner, renewalExtras, legacyVerdict, h, n, tierOf, dnaBadge } from './ui20.mjs';
const ROOT=document.getElementById('app');
const STORE='rascenso-save-v2',OLD='carrera-mundial-demo-v1';
let worldDbInfo=null,worldImportStatus='',worldSearchTerm='',worldSearchRows=[],worldSearchTotal=0,worldSearchPending=false;
let worldClubTerm='',worldClubRows=[],worldClubTotal=0;
function worldPlayerSearchView(){
 if(!worldDbInfo)return '<div class="fm-world-empty">Instala una vez la base mundial desde ⚙ Opciones para consultar futbolistas reales de todos los países y clubes.</div>';
 return '<section class="fm-world-search"><div class="fm-world-summary"><b>BASE MUNDIAL INSTALADA</b><strong>'+n(worldDbInfo.total)+' futbolistas</strong><small>'+n(worldDbInfo.clubs)+' clubes de origen · '+n(worldDbInfo.freePlayers)+' agentes libres · '+n(worldDbInfo.mapped)+' clubes enlazados a RASCENSO</small></div>'+
 '<form id="fm-world-search"><input name="player-search" aria-label="Buscar futbolista" value="'+h(worldSearchTerm)+'" placeholder="Buscar jugador de cualquier club o país…" autocomplete="off"><button class="action main" type="submit">Buscar</button></form>'+
 '<div class="fm-world-results">'+(worldSearchPending?'Buscando en la base mundial…':worldSearchRows.length?worldSearchRows.map(p=>'<button type="button" class="fm-world-person" data-action="fm-world-player" data-id="'+h(p.id)+'"><b>'+h(p.name)+'</b><small>'+h(p.position)+' · '+Number(p.age)+' años · '+h(p.clubName||'Agente libre')+'</small><strong>'+Number(p.ovr||0)+'</strong></button>').join(''):worldSearchTerm?'Sin coincidencias para esa búsqueda.':'Busca por nombre para explorar el mundo futbolístico.')+'</div>'+
 '<form id="fm-world-club-search"><input name="club-search" aria-label="Buscar equipo" placeholder="Buscar cualquiera de los 12.725 clubes…" value="'+h(worldClubTerm)+'" autocomplete="off"><button class="action secondary" type="submit">Clubes</button></form>'+
 '<div class="fm-world-results">'+worldClubRows.map(c=>'<button type="button" class="fm-world-person" data-action="fm-world-club" data-id="'+h(c.uid)+'"><b>'+h(c.name)+'</b><small>'+h(c.players)+' futbolistas · '+h(c.firstTeam)+' primera plantilla</small><strong>'+h(c.countryId)+'</strong></button>').join('')+'</div>'+
 '<small class="fm-world-footnote">Clubes encontrados: '+n(worldClubTotal)+'.</small>'+
 '<small class="fm-world-footnote">'+(worldSearchTerm?n(worldSearchTotal)+' coincidencias en el catálogo completo. ':'')+'Plantillas y nombres importados desde tu archivo local. No se envían a ningún servidor.</small></section>';
}
async function runWorldClubSearch(term){
 worldClubTerm=String(term||'').trim().slice(0,70);
 try{const data=await searchWorldClubs(worldClubTerm,{limit:40});worldClubRows=data.results;worldClubTotal=data.total}
 catch(err){worldClubRows=[];worldClubTotal=0;worldImportStatus='Error: '+err.message}
 if(tab==='mundo')render();
}
async function runWorldSearch(term){
 worldSearchTerm=String(term||'').trim().slice(0,70);worldSearchPending=true;
 if(tab==='mundo')render();
 try{const res=await searchWorldPlayers(worldSearchTerm,{limit:70});worldSearchRows=res.results;worldSearchTotal=res.total}
 catch(err){worldSearchRows=[];worldSearchTotal=0;worldImportStatus='Error de búsqueda: '+err.message}
 worldSearchPending=false;if(tab==='mundo')render();
}

const short=x=>String(x||'').length>20?String(x).slice(0,18)+'…':x;
const pick=(arr,id)=>arr.find(x=>x.id===id)?.name||'—';
const countryName=c=>getCountry(c)?.name||c;
let agentFocusOpen=false;
let state=null,tab='carrera',wizard=0,showHistory=false,message='',showNew=false,rightTab='standings';
const skillUI={zone:null,started:0,current:0,raf:0,answers:[],revealed:false};
function stopNeedle(){if(skillUI.raf)cancelAnimationFrame(skillUI.raf);skillUI.raf=0;}
function startNeedle(){stopNeedle();skillUI.started=performance.now();const tick=now=>{if(skillUI.zone===null)return;skillUI.current=timingAt((now-skillUI.started)*1.25);const needle=ROOT.querySelector('.clutch-needle');if(!needle)return;needle.style.left=`${skillUI.current}%`;const label=ROOT.querySelector('.clutch-live-value');if(label)label.textContent=`${skillUI.current}%`;skillUI.raf=requestAnimationFrame(tick);};skillUI.raf=requestAnimationFrame(tick);}
const timingAt=elapsed=>{const phase=((elapsed%2400)+2400)%2400/1200;return Math.max(0,Math.min(100,Math.round((phase<=1?phase:2-phase)*100)));};

const draft={name:'',country:'CL',age:'17',position:'DC',number:'9',foot:'Derecha',city:'',story:'',origin:'barrio',personality:'disciplinado',style:'equilibrado',dream:'seleccion',fanClubId:'',mode:'Clásico',environment:'sin_contactos',publicImage:'reservado',riskProfile:'calculador',developmentPath:'tecnica',roleClass:'cazagoles',strength:'tecnica',weakness:'inconstante'};
/** El borrador del creador sobrevive a recargas y cierres accidentales. */
const DRAFT_KEY='rascenso-creator-v31';
const UI_PREFS_KEY='rascenso-ui-v1';
const DEFAULT_UI_PREFS={ambience:'pitch',vivid:true,cardFx:true,compact:false};
function loadUIPrefs(){try{const u=JSON.parse(localStorage.getItem(UI_PREFS_KEY)||'null');return {...DEFAULT_UI_PREFS,...(u&&typeof u==='object'?u:{})};}catch{return {...DEFAULT_UI_PREFS};}}
function updateUIPrefs(changes){try{localStorage.setItem(UI_PREFS_KEY,JSON.stringify({...loadUIPrefs(),...changes}));}catch{}}
function loadDraft(){try{const raw=JSON.parse(localStorage.getItem(DRAFT_KEY)||'null');if(raw?.draft){for(const k of Object.keys(draft))if(typeof raw.draft[k]==='string')draft[k]=raw.draft[k];wizard=Math.max(0,Math.min(5,Number(raw.wizard)||0));}}catch{}}
function saveDraft(){try{localStorage.setItem(DRAFT_KEY,JSON.stringify({draft,wizard}));}catch{}}
function clearDraft(){try{localStorage.removeItem(DRAFT_KEY);}catch{}}
function load(){
 for(const key of [STORE,STORE+'-backup',OLD]){
  try{const raw=localStorage.getItem(key);if(!raw)continue;const recovered=migrateCareer(JSON.parse(raw));if(recovered){state=recovered;if(key===STORE+'-backup')message='Se recuperó un respaldo de tu partida.';break;}}catch{continue;}
 }
}
load();if(!state)loadDraft();
/** Si el navegador se queda sin cuota, las temporadas antiguas conservan su resumen y pierden el detalle partido a partido. */
function compactForStorage(s,keep=6){
 const H=s.history||[];const cut=Math.max(0,H.length-keep);
 const slim=c=>({id:c.id,name:c.name,kind:c.kind,year:c.year,outcome:c.outcome,played:c.played,goals:c.goals,championWon:c.championWon,playerFixtures:(c.playerFixtures||[]).slice(-3)});
 return {...s,history:H.map((x,i)=>i>=cut?x:{...x,fixtures:undefined,playerMatches:undefined,competitionCalendar:undefined,competitions:(x.competitions||[]).map(slim)}),
  world:s.world?{...s.world,news:(s.world.news||[]).slice(-50),awards:(s.world.awards||[]).slice(-15)}:s.world};
}
function save(){
 try{
  if(!state)return true;
  const previous=localStorage.getItem(STORE);let next=JSON.stringify(state),compacted=false;
  if(previous===next)return true;
  try{localStorage.setItem(STORE,next);}catch(err){
   // Cuota llena: liberar el respaldo y guardar una versión compacta.
   try{localStorage.removeItem(STORE+'-backup');}catch{}
   state=compactForStorage(state);next=JSON.stringify(state);compacted=true;
   localStorage.setItem(STORE,next);
   message='El guardado se compactó para caber en el navegador: las temporadas antiguas conservan su resumen.';
  }
  // El respaldo nunca debe bloquear el guardado principal si no queda cuota.
  if(!compacted&&previous&&previous!==next){try{localStorage.setItem(STORE+'-backup',previous);}catch{}}
  return true;
 }catch{message='No fue posible guardar la partida. Exporta una copia desde el menú.';return false;}
}
function mutate(s){
 if(!s||s===state)return;
 const previous=state,clubChanged=previous?.clubId!==s.clubId;
 state=s;const saved=save();if(!saved)state=previous;
 agentFocusOpen=false;tab='carrera';render();
 if(saved&&worldDbInfo&&clubChanged&&state?.clubId){
  const target=state.clubId;
  activateWorldClub(target).then(result=>{
   if(result.active&&state?.clubId===target){
    state=syncClub(state);save();render();
   }
  }).catch(()=>{});
 }
 return saved;
}
function button(label,action,cls='main',more=''){return `<button type="button" class="action ${cls}" data-action="${action}" ${more}>${label}</button>`;}
const opt=(value,label,active)=>`<option value="${h(value)}" ${active===value?'selected':''}>${h(label)}</option>`;
function select(label,name,items,value){return `<label class="field"><span>${label}</span><select name="${name}">${items.map(([v,l])=>opt(String(v),l,String(value))).join('')}</select></label>`;}
function branding(){return `<a class="brand brand-13" href="./" aria-label="RASCENSO"><img src="./assets/brand/rascenso-wordmark.png" alt="RASCENSO · Del barrio a la historia" width="300" height="75"></a>`;}
function header(){return `<header class="site-head">${branding()}<nav class="main-nav">${state?(['draft','academy'].includes(state.phase)?['carrera']:['carrera','vestuario','historial','mundo']).map(t=>`<button class="navtab ${tab===t?'selected':''}" data-action="nav" data-tab="${t}">${{carrera:state?.phase==='retired'?'Mi legado':'Mi carrera',vestuario:'Vestuario',historial:'Historial',mundo:'Mundo'}[t]}</button>`).join(''):'<span class="navtab selected">Tu historia empieza hoy</span>'}</nav><div class="head-controls"><span class="build">RASCENSO 4.6 · HISTORIAL Y LEGADO</span>${state?`<span class="head-name">${h(state.name)}</span>${button('⚙','tools','ghost gear-trigger','aria-label="Ajustes" title="Ajustes"')}`:`<span class="live"><i></i> MODO CARRERA</span>${button('⚙','tools','ghost gear-trigger','aria-label="Ajustes" title="Ajustes"')}`}</div></header>`;}
function shell(content,extra=''){const u=loadUIPrefs();ROOT.innerHTML=`<div class="app-shell ${u.compact?'ui-compact':''}" data-ambience="${u.ambience}" data-vivid="${u.vivid?'1':'0'}" data-cardfx="${u.cardFx?'1':'0'}">${header()}<main class="view ${state?'playing':''}">${content}</main><footer class="site-foot"><span>RASCENSO · Una creación de Ragamoofi</span><span>${CATALOG_COUNT} clubes disponibles · 13 ligas iniciales verificadas · copas globales con formato simplificado</span></footer>${extra}</div>${message?`<div class="notification" role="alert">${h(message)}</div>`:''}`;}
function featureIcon(name){return {glory:'★',home:'⌂',academy:'⚑',form:'◉',tactic:'♟',news:'◎',league:'▥'}[name]||'✦';}
function createSteps(){return STEPS.map((s,i)=>`<button type="button" class="creation-step ${wizard===i?'active':wizard>i?'past':''}" data-action="step" data-index="${i}"><span>0${i+1}</span>${s}</button>`).join('');}
function textInput(name,label,placeholder='',extra=''){return `<label class="field"><span>${label}</span><input name="${name}" value="${h(draft[name])}" placeholder="${h(placeholder)}" ${extra}></label>`;}
function choiceGroup(label,list,name){return `<div class="select-group"><h3>${label}</h3><div class="choice-tiles">${list.map(x=>`<label class="choice-tile ${draft[name]===x.id?'chosen':''}"><input type="radio" name="${name}" value="${x.id}" ${draft[name]===x.id?'checked':''}><strong>${h(x.name)}</strong><small>${h(x.description)}</small></label>`).join('')}</div></div>`;}
let lastCreatorStep=-1;
function creator(){
 // Se conserva el desplazamiento al redibujar el mismo paso; al cambiar de paso se vuelve arriba.
 const keep=lastCreatorStep===wizard?(document.querySelector?.('.cr-main')?.scrollTop||0):0,active=document.activeElement;lastCreatorStep=wizard;
 const focusKey=active?.name?`${active.name}=${active.type==='radio'?active.value:''}`:null;
 const {content,aside}=creatorView(draft,wizard);
 shell(`<div class="creation-layout cr3"><section class="creation-panel"><div class="creation-tabs">${createSteps()}</div><form id="creation-form" novalidate><div class="creation-content cr-main">${content}</div><div class="creation-actions">${wizard?button('← Atrás','creator-prev','secondary'):''}<span class="step-count">PASO ${wizard+1} DE 6 · ${h(STEPS[wizard].toUpperCase())}</span>${button(wizard===5?'Elegir mis influencias ↗':'Continuar →',wizard===5?'create':'creator-next')}</div></form></section><aside class="creation-aside cr-aside">${aside}</aside></div>`,showNew?tools():'');
 enhanceCountryKit(ROOT);
 const main=document.querySelector?.('.cr-main');if(main)main.scrollTop=keep;
 if(focusKey){const [nm,val]=focusKey.split('=');const el=[...document.querySelectorAll(`#creation-form [name="${nm}"]`)].find(e=>e.type!=='radio'||e.value===val);if(el&&el.type!=='text'&&el.type!=='number'&&el.tagName!=='TEXTAREA')el.focus({preventScroll:true});}
}
function playerCard(){const club=getClub(state.clubId),country=getCountry(state.country),p=state;return `<aside class="left-rail"><div class="profile-card player-tier-${tierOf(p.ovr)}"><div class="player-label">TARJETA DEL FUTBOLISTA <span>${h(p.position)} · #${h(p.number)}</span></div><div class="player-overall"><strong>${p.ovr??'—'}</strong><span>MEDIA</span></div><div class="card-crest">${club?badge(club,'large'):'<span class="card-free">⚽</span>'}</div><h2>${h(p.name)}</h2><p>${flag(p.country)} ${h(country?.name)} · ${h(p.position)}</p><div class="player-line"><span>${p.age} años</span><span>${h(p.foot)}</span></div>${projectionLine(p)}<div class="player-economy"><div><small>Valor de mercado</small><strong>${annualSalaryLabel(marketValueEUR(p,club))}</strong></div><div><small>Sueldo mensual${contractSnapshot(p).cutRate?` · rebaja temporal ${Math.round(contractSnapshot(p).cutRate*100)} %`:""}</small><strong>${annualSalaryLabel(contractSnapshot(p).monthly)}</strong></div><div><small>Contrato</small><strong>${contractSnapshot(p).remaining?`${contractSnapshot(p).remaining} año(s) · vence ${contractSnapshot(p).expires}`:'Sin renovación'}</strong></div></div>${cardExtras(state)}<div class="player-club">${club?badge(club,'large'):'<span class="unassigned">⚽</span>'}<div><small>CLUB ACTUAL</small><strong>${h(club?.name||'Sin contrato')}</strong></div></div></div><div class="rail-panel"><div class="rail-heading"><span>MI TEMPORADA</span><b>${h(state.lastSeason?.year||careerYear(state))}</b></div><div class="stat-row"><div><strong>${n(state.lastSeason?.matches||0)}</strong><small>PARTIDOS</small></div><div><strong>${n(state.lastSeason?.goals||0)}</strong><small>GOLES</small></div><div><strong>${n(state.lastSeason?.assists||0)}</strong><small>ASIST.</small></div></div><div class="rail-meter"><span>Confianza del entrenador <b>${n(state.coachTrust??50)}%</b></span><div><i style="width:${Math.min(100,state.coachTrust??50)}%"></i></div></div><div class="rail-meter"><span>Moral del jugador <b>${n(state.morale??70)}%</b></span><div><i style="width:${Math.min(100,state.morale??70)}%"></i></div></div></div><section class='rail-panel career-attributes'><div class='rail-heading'><span>MIS ATRIBUTOS · EVOLUCIÓN</span><b>${state.lastSeason?.year||'INICIO'}</b></div><div class='v2-attr-grid'>${ATTRS.map(([key,label])=>attributeBar(state,key,label)).join('')}</div></section><details class="rail-panel facts"><summary class="rail-heading"><span>PERFIL · MÁS INFORMACIÓN</span><span class="ornament">⌄</span></summary><div><span>Origen</span><b>${h(pick(ORIGINS,state.origin))}</b></div><div><span>Clase</span><b>${h(classFor(state).name)}</b></div><div><span>Fortaleza</span><b>${h(pick(STRENGTH_OPTIONS,state.strength))}</b></div><div><span>Debilidad</span><b>${h(pick(WEAKNESS_OPTIONS,state.weakness))}</b></div><div><span>Estilo</span><b>${h(pick(STYLES,state.style))}</b></div><div><span>Identidad</span><b>${h((state.footballDNA||archetypeFor(state)).name)}</b></div><div><span>Perfil público</span><b>${h(pick(PUBLIC_IMAGES,state.publicImage))}</b></div><div><span>Club de hincha</span><b>${h(state.fanClubId?getClub(state.fanClubId)?.name:'Sin elegir')}</b></div><div><span>Contrato</span><b>${state.contract?.ends?Math.max(0,state.contract.ends-careerYear(state)):state.contract?.yearsLeft??'—'} años</b></div><div><span>Salario anual estimado</span><b>${annualSalaryLabel(state.contract?.salary)}</b></div><div><span>Ingresos de carrera</span><b>${annualSalaryLabel(state.careerEarnings||0)}</b></div></details></aside>`;}
function table(){const club=getClub(state.clubId),competition=getCompetitionForCareer(state),allRows=simulatedStandings(state),historic=[...state.history].reverse().find(x=>x.clubId===state.clubId&&Array.isArray(x.table)),hasSeason=!!historic,rows=hasSeason?allRows:[];
 let body='';
 if(rows.length){body=`<div class="table-caption">${h([...state.history].reverse().find(x=>x.clubId===state.clubId&&x.table)?.leagueName||club?.league||'Liga')} · ${[...state.history].reverse().find(x=>x.clubId===state.clubId&&x.table)?.year||'—'}</div><div class="table-head"><span>POS · CLUB</span><span>PJ</span><span>DG</span><span>PTS</span></div><div class="standings-list">${rows.map(x=>`<div class="standing-row ${x.isPlayer?'mine':''}"><span class="standing-team"><b class="rank">${x.position}</b>${badge(x)}<span>${h(short(x.name))}</span></span><span>${x.played}</span><span>${x.gd>0?'+':''}${x.gd}</span><strong>${x.points}</strong></div>`).join('')}</div>`;}
 else {const contenders=leagueParticipants(club?.countryCode||state.country,club?.id,state).sort((a,b)=>a.name.localeCompare(b.name,'es'));body=`<div class="table-caption">${competition?.verified?'Participantes de '+h(competition.season)+' · '+h(competition.name):'Circuito de referencia · participantes aún no verificados'} · listado alfabético, sin ranking previo</div><div class="table-head prep"><span>CLUBES PARTICIPANTES</span><span>PRETEMPORADA</span></div><div class="standings-list prep">${contenders.map(x=>`<div class="standing-row"><span class="standing-team">${badge(x)}<span>${h(short(x.name))}</span></span><span class="prep-pending">Por jugar</span></div>`).join('')}</div>`;}
 const lastMatches=(historic?.playerMatches||[]).slice(-11).reverse();
 const gameHtml=`<div class="standings-list match-list">${lastMatches.length?lastMatches.map(g=>`<div class="fixture-item"><small>FECHA ${g.round} · ${g.played?g.minutes+' MIN':'SIN MINUTOS'}</small><div>${badge(g.home,'tiny')}<span>${h(short(getClub(g.home)?.name||''))}</span><b>${h(g.score)}</b><span>${h(short(getClub(g.away)?.name||''))}</span>${badge(g.away,'tiny')}</div>${g.played?`<small>${g.goals} GOL(ES) · ${g.assists} ASISTENCIA(S)</small>`:''}</div>`).join(''):'<div class="table-caption">Simula una temporada para ver tus partidos.</div>'}</div>`;
 return `<aside class="right-rail"><section class="table-card"><div class="side-top"><span class="section-label">EL CAMPEONATO</span>${flag(club?.countryCode||state.country)}</div><h2>Tabla de posiciones</h2><div class="competition-heading"><div class="league-brand">${competition?.id&&competitionLogo(competition.id)?`<img src="${competitionLogo(competition.id)}" loading="lazy" alt="" onerror="this.remove()">`:''}<b>${h(competition?.name||'Liga de referencia')}</b></div><small>${competition?.verified?'PARTICIPANTES 2026 VERIFICADOS':'FORMATO DE REFERENCIA · NO OFICIAL'}</small></div><div class="right-tabs"><button class="${rightTab==='standings'?'active':''}" data-action="right-tab" data-id="standings">CLASIFICACIÓN</button><button class="${rightTab==='matches'?'active':''}" data-action="right-tab" data-id="matches">MIS PARTIDOS</button></div>${rightTab==='matches'?gameHtml:body}</section><section class="news-card"><span class="section-label">TU CARRERA EN CIFRAS</span><div class="career-kpis">${[['Temporadas',state.history.length],['Títulos',state.trophies.length],['Clubes',new Set(state.history.map(x=>x.clubId)).size||1]].map(([k,v])=>`<div><b>${n(v)}</b><small>${k}</small></div>`).join('')}</div></section>${trophyGallery()}</aside>`;
}
function trophyGallery(){return trophyRail(state,getClub);}

function frame(center){const club=getClub(state.clubId);return `<div class="playing-layout">${playerCard()}<div class="center-rail"><div class="career-heading"><div><span class="section-label">TEMPORADA ${h(careerYear(state))} · ${flag(club?.countryCode||state.country)} ${h(getCompetitionForCareer(state)?.name||club?.country||countryName(state.country))}</span><h1>${h(club?.name||'Tu carrera comienza aquí')}</h1></div><span class="year-pill">${h(state.age)} AÑOS · ${h(state.position)}</span></div>${center}</div>${table()}</div>`;}
/** Jugadas Vivas 3.0: varias jugadas por temporada con motor 2D. La jugada única antigua solo se muestra si una partida previa ya la tenía resuelta. */
function seasonMomentPanel(){return matchdayPanel(state,seasonPlays(state),getClub,badge)+(state.clutchMoment?legacyMomentPanel():'');}
function legacyMomentPanel(){
 const m=null,outcome=state.clutchMoment;
 if(!m&&!outcome)return '';
 const v=outcome||m,role=MOMENT_NAMES[v.type]||'Jugada clave';
 const description=v.type==='penal'?'El balón está en el punto penal: elegí destino y golpeá en el instante preciso.':v.type==='libre'?'El tiro libre exige dirección y precisión para superar la barrera.':v.type==='pase'?'Un compañero arranca entre líneas. Elegí el pase y ejecutalo antes de que se cierre el hueco.':v.type==='corte'?'El delantero rival prepara el regate. Anticipá su dirección y llegá justo al balón.':v.type==='corner'?'Memorizá la jugada preparada y repetí los movimientos para habilitar al rematador.':v.type==='cabeza'?'Leé el centro y conectá en el instante exacto.':v.type==='regate'?'Esperá que el marcador abra un espacio y acelerá con reflejos.':v.type==='centro'?'Recordá la secuencia ensayada y encontrá al compañero libre.':v.type==='despeje'?'La pelota llega al área. Reaccioná antes que el rival.':v.type==='salida'?'Recordá la señal para atacar la pelota aérea.':'Un instante puede cambiar el partido: elegí la zona y ejecutá tu acción con precisión.';
 const pitch=`<div class="clutch-goal" aria-label="Arco con tres zonas"><div class="clutch-net"><span></span><span></span><span></span></div>${outcome?`<div class="clutch-ball" style="left:${16.66+outcome.zone*33.33}%">⚽</div>`:''}</div>`;
 const target=timingTarget(v),selected=skillUI.zone,mode=minigameMode(v);
 const meter=!outcome&&selected!==null&&mode!=='memoria'?`<div class="clutch-timing"><div class="clutch-timing-top"><strong>2 · DETENÉ EL MEDIDOR</strong><small>${h(ZONES[selected])} · buscá la franja dorada</small></div><div class="clutch-meter-track" aria-label="Medidor móvil de precisión"><span class="clutch-perfect-window" style="left:${target-9}%"></span><span class="clutch-needle"></span></div><div class="clutch-live-indicator">Precisión actual <b class="clutch-live-value">0%</b></div><div class="clutch-timing-actions"><button data-action="clutch-cancel" type="button">Cambiar dirección</button><button class="clutch-hit-button" data-action="clutch-stop" type="button">⚡ EJECUTAR JUGADA <small>o barra espaciadora</small></button></div></div>`:'';
 const memory=!outcome&&selected!==null&&mode==='memoria'?`<div class="clutch-timing memory-stage"><strong>2 · MEMORIZÁ LA JUGADA</strong><p>${skillUI.revealed?'Observa el orden de las tres direcciones y repítelo.':'¡Tu turno! Repetí la secuencia de tres movimientos.'}</p>${skillUI.revealed?`<div class="memory-cues">${memorySequence(v).map(i=>`<b>${['←','↑','→'][i]}</b>`).join('')}</div>`:`<div class="memory-progress">${skillUI.answers.map(i=>`<b>${['←','↑','→'][i]}</b>`).join('')}<span>${skillUI.answers.length}/3</span></div><div class="clutch-choices">${ZONES.map((z,i)=>`<button data-action="clutch-memory" data-zone="${i}">${['←','↑','→'][i]} ${h(z)}</button>`).join('')}</div>`}<button class="memory-cancel" data-action="clutch-cancel">Cambiar dirección</button></div>`:'';
 return `<section class="clutch-stage"><div class="clutch-meta"><span>⚡ MOMENTO DECISIVO · ${h(v.tag)}</span><b>FECHA ${v.round}</b></div><div class="clutch-fixture"><span>${h(v.club)} <b>VS</b> ${h(v.rival)}</span>${v.classic?'<strong>CLÁSICO</strong>':''}</div><h3>${h(role)}</h3><p>${h(description)}</p>${pitch}${outcome?`<div class="clutch-result ${outcome.success?'is-good':'is-bad'}"><strong>${outcome.success?(['atajada','salida','achique'].includes(outcome.type)?'¡Intervención decisiva!':['corte','despeje'].includes(outcome.type)?'¡Corte salvador!':['pase','corner','centro'].includes(outcome.type)?'¡Asistencia decisiva!':'¡GOOOL!'):(['atajada','salida','achique'].includes(outcome.type)?'El rival encontró el espacio.':['corte','despeje'].includes(outcome.type)?'No pudiste cortar la jugada.':['pase','corner','centro'].includes(outcome.type)?'El pase fue interceptado.':'La ocasión terminó sin gol.')}</strong>${outcome.fixturePreview?`<div class="clutch-score"><span>${h(v.homeName||v.club)}</span><b>${h(outcome.fixturePreview.score)}</b><span>${h(v.awayName||v.rival)}</span></div><small class="clutch-score-note">Marcador proyectado con tus decisiones actuales · se confirma al simular temporada · ${outcome.fixturePreview.played?outcome.fixturePreview.minutes+' minutos disputados':'Sin minutos'}</small>`:''}<small>${outcome.executionReason?`${h(outcome.executionReason)} · `:''}${mode==='memoria'?`Memoria: ${outcome.executionValid?'patrón correcto':'patrón incorrecto'} · `:outcome.timing!==null&&outcome.timing!==undefined?`Ejecución: ${h(outcome.timingGrade||'Completada')} · `:''}Probabilidad técnica ${n(outcome.chance)}%. ${outcome.success?'Tu intervención se reflejará en el marcador y tus estadísticas.':'La temporada sigue y todavía puede cambiar.'}</small></div>`:selected===null?`<div class="clutch-step-label">1 · ELEGÍ TU DIRECCIÓN</div><div class="clutch-choices">${ZONES.map((z,i)=>`<button data-action="clutch-pick" data-zone="${i}"><span>${h(z)}</span><small>${i===0?'↖':i===1?'↑':'↗'}</small></button>`).join('')}</div>`:(mode==='memoria'?memory:meter)}<small class="clutch-note">Un intento por temporada · Primero elegí una zona. Después jugá la mecánica de precisión, reflejos o memoria. Fallar el desafío implica fallar la jugada; acertarlo no garantiza superar al rival.</small></section>`;
}
function matchRhythmPanel(){
 const locked=!!(state.plays30?.results?.length),chosen=locked&&(!state.plays30.version||state.plays30.version===3)?'rapido':state.matchRhythm||'equilibrado';
 const choices=[['rapido','Rápido','Pocos momentos'],['equilibrado','Equilibrado','Más partidos clave'],['inmersivo','Inmersivo','Máximo protagonismo']];
 return `<div class="match-rhythm"><div><strong>RITMO DE PARTIDOS</strong><small>Elige cuánto fútbol quieres jugar en esta temporada. No cambia los resultados que ya disputaste.</small></div><div class="match-rhythm-buttons">${choices.map(([id,label,desc])=>`<button type="button" data-action="match-rhythm" data-rhythm="${id}" class="${chosen===id?'selected':''}" ${locked?'disabled title="Ya disputaste una jugada en esta temporada"':''}><b>${label}</b><small>${desc}</small></button>`).join('')}</div></div>`;
}
function season(){
 const c=getClub(state.clubId),x=state.lastSeason;
 const agenda=getSeasonAgenda(state);
 const decided=state.seasonAgenda?.year===careerYear(state);
 const snapshot=state.careerMoments?.findLast(m=>m.kind==='agenda'&&m.year===careerYear(state));
 const recent=x?[`Última temporada: ${x.matches} partidos, ${x.goals} goles y ${x.assists} asistencias.`, `Tu equipo terminó ${x.leaguePosition}° en ${x.leagueName||'su liga'}.`,`El siguiente campeonato pondrá a prueba tu continuidad en ${c?.name||'el club'}.`]:[`Es tu primera temporada profesional en ${c?.name||'el club'}.`,`Tu primer contrato abre una etapa en la que cada oportunidad importa.`];
 const intro=recent[Math.abs((state.age||17)+(state.history?.length||0))%recent.length];
 const scene=agenda?`<section class="agenda-card agenda-premium"><div class="agenda-overline"><span>⚡ DECISIÓN DE CARRERA</span><b>${h(agenda.tag)} · ${careerYear(state)}</b></div><div class="agenda-season-context">${flag(c?.countryCode||state.country)} ${h(c?.name||'Tu club')}${x?` · Última campaña ${x.leaguePosition}° · ${x.matches} PJ · ${x.goals} G`: ' · Primera temporada'}</div><h3>${h(agenda.title)}</h3><p>${h(agenda.description)}</p>${decided?`<div class="agenda-result">✓ ${h(snapshot?.choice||'Tu decisión está tomada')} <small>Esta elección se reflejará en tus oportunidades, rendimiento o desgaste cuando simules la temporada.</small></div>`:`<div class="agenda-options">${agenda.choices.map((x,i)=>`<button data-action="season-agenda" data-index="${i}"><b>0${i+1}</b><span><strong>${h(x.title)}</strong><small>${h(x.detail)}</small><em>${x.effect?.injury>1?'MAYOR DESGASTE':x.effect?.injury<1?'MENOS RIESGO':x.effect?.minutes>0?'MÁS MINUTOS':x.effect?.coach>0?'CONFIANZA DEL DT':'CAMINO ALTERNATIVO'}</em></span><span class="agenda-choice-arrow">↗</span></button>`).join('')}</div>`}<small class="agenda-footnote">Decisión opcional · Puedes simular la temporada sin intervenir.</small></section>`:'';
 const content=`<section class="focus-card stadium season-modern"><div class="focus-eyebrow">TEMPORADA ${careerYear(state)} · ${h(c?.name||'Nuevo desafío')}</div><div class="hero-emblem">${c?badge(c,'hero'):''}</div><div class="spotlight"><div class="v2-season-cols"><div class="v2-col-main"><span class="v2-kicker">UN NUEVO CAPÍTULO</span><h2>${x?'La carrera sigue escribiéndose.':'El fútbol te abre la primera puerta.'}</h2><p>${h(intro)}</p>${seasonPanels(state)}${matchRhythmPanel()}<div class="season-action-row">${button('SIMULAR TEMPORADA ↗','season-next','main big')}${state.history.length?button(agentFocusOpen?'Cerrar opciones del representante':'Hablar con mi representante','agent-open','secondary'):''}</div>${state.history.length&&agentFocusOpen?`<div class="agent-focus-picker"><strong>¿Qué priorizamos en las ofertas?</strong><p>Elegí una estrategia. Tu representante buscará clubes según ese objetivo.</p><div class="agent-focus-options">${[['balanced','Equilibrio'],['minutes','Jugar más'],['money','Mejor salario'],['local','Seguir en mi país'],['international','Salir al extranjero']].map(([id,label])=>`<button type="button" data-action="agent-focus" data-focus="${id}">${label}</button>`).join('')}</div></div>`:''}${x?`<div class="last-match"><strong>ÚLTIMA CAMPAÑA · ${x.year}</strong><span>${x.leaguePosition}° en liga</span><span>${x.matches} PJ</span><span>${x.goals} G</span><span>${x.assists} A</span></div>`:''}</div><div class="v2-col-side">${seasonMomentPanel()}${scene}</div></div></div></section>`;
 return frame(content);
}
function standingsByCup(c,short=true){
 const tables=c.groupTables||[];
 if(!tables.length)return '';
 const target=(state.country&&['qualifiers','international','world-cup'].includes(c.kind))?state.country:state.clubId;
 const visible=short?tables.filter(g=>g.standings?.some(t=>t.id===target)):tables;
 const groups=visible.length?visible:tables.slice(0,1);
 return `<div class="cup-standings">${groups.map(g=>`<div class="cup-group"><b>GRUPO ${h(g.name)}</b><table><thead><tr><th>Equipo</th><th>PJ</th><th>DG</th><th>PTS</th></tr></thead><tbody>${g.standings.map((t,i)=>`<tr class="${t.id===target?'mine':''}"><td>${i+1}. ${h(t.name)}</td><td>${n(t.pj)}</td><td>${t.gd>0?'+':''}${n(t.gd)}</td><td>${n(t.pts)}</td></tr>`).join('')}</tbody></table></div>`).join('')}</div>`;
}
function cupDetail(c){
 const fixtures=c.fixtures||[];
 return `<details class="global-competition-item"><summary><span class="cup-icon">${['international','world-cup','qualifiers'].includes(c.kind)?'🌍':'🏆'}</span><span><b>${h(c.name)}</b><small>${h(c.outcome)} · ${c.played} PJ · ${c.goals} G · ${c.assists} A</small></span><strong>▾</strong></summary><div class="global-fixture-history">${c.qualification?`<small class="cup-qualification">${h(c.qualification)}</small>`:''}${c.format?`<small>${h(c.format)}</small>`:''}${standingsByCup(c)}<h4>Mis partidos</h4>${fixtures.map(f=>`<p><small>${h(f.date||`Ronda ${f.round}`)} · ${h(f.stage)}${f.leg?` · Ida/Vuelta ${f.leg}`:''}</small><span>${h(f.homeName)} <b>${h(f.score)}</b> ${h(f.awayName)}${f.penalties?' · pen.':''}</span>${f.playerPlayed?`<em>${n(f.playerMinutes||0)} min · ${f.playerGoals||0} G · ${f.playerAssists||0} A</em>`:'<em>Sin minutos</em>'}</p>`).join('')||'<p>No disputaste partidos en esta competición.</p>'}</div></details>`;
}
function seasonCalendarPanel(x){
 const events=(x?.competitionCalendar||[]).slice(0,90);
 if(!events.length)return '';
 return `<details class="season-calendar"><summary>📅 Calendario de club y selección · ${events.length} encuentros en copas</summary><div class="season-calendar-matches">${events.map(m=>`<div><small>${h(m.date)}</small><b>${h(m.competition)}</b><span>${h(m.home)} ${h(m.score)} ${h(m.away)}</span><em>${n(m.minutes)} min · ${n(m.goals)} G · ${n(m.assists)} A</em></div>`).join('')}</div><small>Ventanas orientativas, no calendario oficial.</small></details>`;
}
function competitionsPanel(x){
 const items=competitionSummary(x);
 if(!items.length)return '';
 const group=items.filter(c=>c.kind!=='friendly');
 return `<section class="global-competitions"><span class="section-label">COPAS Y SELECCIÓN · ${h(x.year)}</span><div class="global-cups-grid">${group.map(c=>cupDetail(c)).join('')}</div>${x.calledUp?`<p class="global-selection-note">🌎 Convocado por ${h(countryName(state.country))}: ${x.nationalCaps||0} partidos con tu selección.</p>`:'<p class="global-selection-note">La selección todavía no te ha convocado. Tu rendimiento puede cambiarlo.</p>'}${seasonCalendarPanel(x)}</section>`;
}
function endOfYear(){const x=seasonReview(state,getClub);if(!x)return frame('<p>No hay temporada para resumir.</p>');const match=x.match;return frame(`<section class="focus-card story recap"><div class="event-visual"><span class="section-label">FINAL DE TEMPORADA · ${h(x.year)} · ${h(x.league)}</span><h2>Así terminó tu año en ${h(x.club)}</h2><p>Balance de la temporada, con resultados registrados por el simulador.</p></div><div class="story-body"><div class="recap-metrics">${[['Partidos',x.starts],['Goles',x.goals],['Asistencias',x.assists],['Media',x.ovrAfter],['Nota',state.lastSeason?.rating?state.lastSeason.rating.toFixed(2):'—'],['Posición',x.position?x.position+'°':'—']].map(([k,v])=>`<div><b>${h(v)}</b><small>${h(k)}</small></div>`).join('')}</div><div class="recap-summary">${x.summary.map(t=>`<p>• ${h(t)}</p>`).join('')}</div><div class="talk-line"><span class="talk-icon">🎙</span><div><small>${h(x.voice.speaker)} · ${x.voice.fictional?'Titular ficticio de RASCENSO':'Comentario ficticio basado en la temporada'}</small>${x.voice.headline?`<span class="press-headline">${h(x.voice.headline)}</span>`:''}<strong>«${h(x.voice.quote)}»</strong></div></div>${recapExtras(state)}${competitionsPanel(state.lastSeason)}${state.lastSeason?.clutchMoment?`<div class="recap-clutch"><span>⚡ TU JUGADA DECISIVA · FECHA ${state.lastSeason.clutchMoment.round}</span><strong>${h(MOMENT_NAMES[state.lastSeason.clutchMoment.type])} · ${state.lastSeason.clutchMoment.success?'Conseguida':'No conseguida'}</strong><small>${(()=>{const m=state.lastSeason.playerMatches?.find(p=>p.round===state.lastSeason.clutchMoment.round&&p.home===state.lastSeason.clutchMoment.home&&p.away===state.lastSeason.clutchMoment.away);return m?`${getClub(m.home)?.name||'Local'} ${m.score} ${getClub(m.away)?.name||'Visita'} · Marcador definitivo`:'Resultado registrado en el historial';})()}</small></div>`:''}${match?`<div class="match-summary-small"><small>PARTIDO DESTACADO · FECHA ${match.round}</small><strong>${h(match.homeName)} ${h(match.score)} ${h(match.awayName)}</strong></div>`:''}${button('Continuar con los acontecimientos →','recap-continue','main wide')}</div></section>`);}
function narrative(){if(state.recapPending)return endOfYear();const e=eventInfo(state);if(!e)return frame('<p>Escena no encontrada.</p>');const x=state.lastSeason;const beat=state.sceneBeat||0,option=e.options[state.sceneChoice??0];const match=matchContext(state,getClub),showGame=['rival','derby','press','coach','title_defense','scouting_competition'].includes(e.id)&&match;const matchDetails=showGame?fixtureContext(state,match,getClub):null;return frame(`<section class="focus-card story"><div class="event-visual"><span class="section-label">${h(e.tag)} · ${h(e.place)}</span><div class="event-illustration">${featureIcon('tactic')}</div><h2>${h(e.title)}</h2><p>${x?`${x.year} · ${x.matches} partidos · ${x.goals} goles · ${x.assists} asistencias`:'Tu primer contrato profesional'}</p></div><div class="story-body">${showGame?`<div class="fixture-feature"><small>${h(matchDetails?.tag||'PARTIDO DESTACADO')} · FECHA ${match.round} · ${h(match.result.toUpperCase())} · ${match.played?match.minutes+' MINUTOS':'SIN MINUTOS'}</small><div>${badge(match.home,'tiny')}<b>${h(match.homeName)}</b><strong>${h(match.score)}</strong><b>${h(match.awayName)}</b>${badge(match.away,'tiny')}</div><p class="match-context-line">Ante ${h(match.opponentName)}: ${match.goals||0} gol(es), ${match.assists||0} asistencia(s). Una escena que sí pertenece a tu temporada.</p></div>`:''}${beat?`<div class="result-card"><span class="section-label">TU DECISIÓN</span><h3>${h(option.title)}</h3><p>${h(option.impact)}</p></div>${button('Continuar carrera →','event-finish','main wide')}`:`<p class="narrative-line">${h(e.paragraphs.join(' '))}</p><div class="talk-line"><span class="talk-icon">⚽</span><div><small>${h(e.speaker.role)}${e.actor==='press'||e.world?` · ${h(e.speaker.name)}`:''}</small><strong>${h(e.speech)}</strong></div></div><div class="section-label decision-label">TU DECISIÓN EN EL FÚTBOL</div><div class="football-options">${e.options.map((o,i)=>`<button class="football-choice" data-action="event" data-index="${i}"><span>0${i+1}</span><strong>${h(o.title)}</strong><small>${h(o.detail)}</small>${optionConsequences(o)}<b>↗</b></button>`).join('')}</div><div class="skip-row">${button('Resolver automáticamente','event-skip','ghost')}</div>`}</div></section>`);}
function market(){
 const offers=state.offers||[],policy=state.market||{canStay:true,reason:'normal',searches:0};
 const labels={request:'Pediste salir: tu representante consiguió propuestas. También puedes quedarte.',interest:'Un club que te seguía durante la temporada presentó una propuesta.',released:'Tu club decidió no renovarte. Debes encontrar un nuevo equipo.',listed:'La directiva te puso en el mercado. No cuentan contigo para el próximo proyecto.', 'loan-request':'El entrenador prefiere que sumes minutos a préstamo en otro club.',renewal:'Tu contrato está por terminar. Puedes renovar o estudiar otras propuestas.',agent:'Tu representante consultó el mercado por iniciativa tuya.',normal:'Llegaron propuestas de clubes interesados en tu carrera.'};
 const agentMsg=policy.searches>=2?'Ya se realizaron las dos rondas adicionales de búsqueda de esta temporada.':'Pídele a tu representante que explore otros proyectos. Cada búsqueda cambia los clubes interesados.';
 return frame(`<section class="focus-card market"><div class="section-label">MERCADO DE FICHAJES · ${careerYear(state)}</div><h2>${policy.canStay===false?'El club ha tomado una decisión.':'Tu próximo desafío.'}</h2><p class="muted">${h(labels[policy.reason]||labels.normal)} Tu media ${n(state.ovr)}, tus estadísticas, tu edad y la reputación de los clubes condicionan las ofertas.</p><div class="market-summary"><span>MEDIA <b>${n(state.ovr)}</b></span><span>VALORACIÓN DE MERCADO <b>${Math.round(playerDemand(state))}</b></span><span>SUELDO ACTUAL <b>${annualSalaryLabel(state.contract?.salary)}</b></span></div>${negotiationBanner(state)}<div class="offers-list">${offers.map((c,i)=>`<div class="offer"><span class="offer-num">0${i+1}</span>${badge(c,'large')}<div class="offer-name"><strong>${h(c.name)} ${c.kind==='loan'?'<span class="market-pill">CESIÓN</span>':''}</strong><small>${flag(c.countryCode)} ${h(c.country)} · ${h(getInauguralLeague(c.id)?.name||'Circuito de referencia')} · Prestigio ${n(c.prestige||clubPrestige(c))}</small><small>${h(c.project||c.role||'Proyecto deportivo')} · ${c.years||3} año(s) · <b>${annualSalaryLabel(c.salary)}</b> al año</small>${c.id===state.fanClubId?'<small class="dream-club">★ Tu equipo de hincha</small>':''}${offerExtras(state,c)}</div>${button(c.kind==='loan'?'Ir cedido ↗':'Firmar ↗','transfer','compact',`data-id="${h(c.id)}"`)}</div>`).join('')||'<div class="market-empty">Por ahora no hay propuestas formales. Tu representante puede consultar nuevamente el mercado.</div>'}</div><div class="agent-panel"><div><strong>📋 TU REPRESENTANTE</strong><p>${h(agentMsg)}</p></div>${button('Buscar otras ofertas','agent-search','secondary',policy.searches>=2?'disabled':'')}</div>${policy.canStay!==false?renewalExtras(state):''}<div class="market-actions">${policy.canStay===false?'<div class="must-move">El club no te ofrece continuidad esta temporada.</div>':button(policy.renewal?`Renovar · ${annualSalaryLabel(policy.renewal.salary)}/año`:'Seguir en mi club','stay','secondary wide')}${policy.canStay===false&&state.age>=31?button('Retirarme del fútbol','market-retire','ghost'):''}</div><p class="market-disclaimer">Montos orientativos de simulación en euros anuales: no representan contratos oficiales publicados por los clubes.</p></section>`);
}
function academy(){const offers=academyOffers(state);return `<div class="setup-stage academy-stage"><div class="section-label">CAPÍTULO III · EL PRIMER CONTRATO</div><h1>Tres caminos. <em>Una carrera.</em></h1><p>Tu primer paso nace cerca de casa: se priorizan los clubes de tu país y proyectos acordes a tu nivel. La edad, el entorno y tu disposición a emigrar pueden abrir una oportunidad fuera, normalmente dentro de tu región.</p><div class="academy-grid">${offers.map(c=>`<article class="academy-card">${badge(c,'hero')}<small>${flag(c.countryCode)} ${h(c.country)} · ${h(getInauguralLeague(c.id)?.name||'Circuito de referencia')}</small><h2>${h(c.name)}</h2><p>Nivel institucional <b>${c.level}</b> · ${getInauguralLeague(c.id)?.tier>=2?'Segunda división':clubPrestige(c)>=76?'Oportunidad excepcional':'Proyecto de crecimiento'}</p><p class="offer-route">${h(academyOfferReason(state,c))}</p><div class="academy-contract"><span class="contract-title">PROPUESTA DE CONTRATO</span><div class="contract-money"><small>SUELDO MENSUAL</small><strong>${annualSalaryLabel(Math.round(academyContractOffer(state,c).salary/12))}</strong></div><div class="contract-rows"><span>Anual <b>${annualSalaryLabel(academyContractOffer(state,c).salary)}</b></span><span>Duración <b>${academyContractOffer(state,c).years} años</b></span><span>Rol inicial <b>${h(academyContractOffer(state,c).role)}</b></span></div></div>${c.id===state.fanClubId?'<span class="fan-hint">★ Tu club de hincha</span>':''}${button('Firmar contrato ↗','academy','main wide',`data-id="${h(c.id)}"`)}</article>`).join('')}</div></div>`;}
function dnaReview(){
 const entries=(state.draftSources||[]).map(p=>`<span><b>${h(p.legend)}</b><small>${h(ATTRS.find(([k])=>k===p.attribute)?.[1]||p.attribute)}</small></span>`).join('');
 return `<div class="setup-stage dna-review-stage"><span class="section-label">CAPÍTULO VII · TU ADN DEFINITIVO</span><h1>Tu estilo. <em>Tu legado.</em></h1><p>Terminaste de elegir tus ocho influencias. Este es el estilo que te acompañará durante tu carrera. Revísalo antes de recibir las ofertas de clubes.</p>${dnaCard(state)}<div class="dna-review-list">${entries}</div><div class="dna-review-actions">${button('Continuar a mis contratos ↗','academy-continue','main big')}</div></div>`;
}
function draftScreen(){return draftView(state,draftChoices(state));}
function history(){const total=totals(state);return frame(`<section class="focus-card history"><div class="section-label">ARCHIVO DE CARRERA</div><h2>Una historia, temporada a temporada.</h2><div class="history-totals">${[['Temporadas',state.history.length],['Partidos',total.matches],['Goles',total.goals],['Asistencias',total.assists],['Títulos',state.trophies.length]].map(([name,val])=>`<div><strong>${n(val)}</strong><small>${name}</small></div>`).join('')}</div><div class="history-table"><div class="history-head"><span>AÑO · CLUB</span><span>OVR</span><span>PJ</span><span>G</span><span>A</span><span>LIGA</span><span>NOTA</span></div>${[...state.history].reverse().map(x=>`<div class="history-row"><span class="history-club-cell">${badge(x.clubId)}<span class="history-club-copy" title="${h(x.club)}">${x.year} · ${h(x.club)}</span>${clubSeasonTrophiesHTML(state,x)}</span><b>${x.ovrAfter}</b><b>${x.matches}</b><b>${x.goals}</b><b>${x.assists}</b><b>${x.leaguePosition}°</b><b>${x.rating?x.rating.toFixed(1):'—'}</b></div>`).join('')||'<p class="muted">Todavía no has disputado una temporada.</p>'}</div>${selectionPanel(state,getCountry,flag)}${historyExtras(state)}${rivalLedger(state)}<div class="history-cups"><h3>Jugadas para recordar</h3><div class="career-highlight-list">${(state.careerMoments||[]).filter(x=>x.kind==='on-field').slice(-12).reverse().map(x=>`<div><b>${h(x.year)}</b><span>${h(x.text)}</span></div>`).join('')||'<p class="muted">Los momentos especiales se irán guardando a medida que juegues.</p>'}</div><h3>Copas y selección por temporada</h3>${[...state.history].reverse().filter(t=>t.competitions?.length).map(t=>`<details><summary><strong>COMPETICIONES · ${h(t.year)}</strong><span>${t.competitions.filter(c=>c.championWon).length} títulos · ${t.nationalCaps||0} PJ selección</span></summary>${t.competitions.map(c=>`<details class="history-competition"><summary><b>${h(c.name)}</b> · ${h(c.outcome)} · ${c.played} PJ · ${c.goals} G</summary><div class="history-fixtures">${(c.playerFixtures||[]).map(f=>`<p>${h(f.stage)} · ${h(f.homeName)} <b>${h(f.score)}</b> ${h(f.awayName)}</p>`).join('')||'<p>Sin partidos registrados.</p>'}</div></details>`).join('')}${seasonCalendarPanel(t)}</details>`).join('')||'<p class="muted">Completa una temporada para desbloquear el registro de copas.</p>'}</div></section>`);}
function world(){const country=getCountry(state.country);return frame(worldView(state,`<section class="world"><div class="section-label">EL MUNDO DEL FÚTBOL</div>${worldPlayerSearchView()}<h2>${CATALOG_COUNT} clubes. ${GLOBAL_COUNTRIES} nacionalidades.</h2><p class="muted">Catálogo de referencia de distintas temporadas; no corresponde a participantes oficiales de 2026.</p><div class="world-countries">${COUNTRIES.map(c=>`<button class="country-entry" data-action="country" data-id="${c.code}">${flag(c.code)}<span>${h(c.name)}</span><b>${c.clubs.length}</b></button>`).join('')}</div><section class="global-world-guide"><h3>Competiciones jugables del modo carrera</h3><p>Las copas continentales y de selecciones incorporan grupos, tablas y llaves. Los cupos del Mundial salen de eliminatorias simuladas el año anterior; la convocatoria depende de tu rendimiento.</p><div class="world-competition-names">${Object.entries(NATIONAL_CUPS).map(([conf,name])=>`<span>${h(conf)} · ${h(name)}</span>`).join('')}${Object.entries(CONTINENTAL_CLUB_CUPS).flatMap(([conf,names])=>names.map(name=>`<span>${h(conf)} · ${h(name)}</span>`)).join('')}<span>FIFA · Copa Mundial de la FIFA</span><span>Copas nacionales · ${GLOBAL_COUNTRIES} países</span></div><small>Los torneos usan formatos, cupos y ventanas de calendario simplificados; no equivalen a los reglamentos oficiales.</small></section><section class="world-trophy-reference"><h3>Competiciones históricas</h3><p>Copas reales como referencia visual. Algunas todavía no están habilitadas en la simulación.</p><div class="world-trophy-gallery">${WORLD_TROPHIES.map(t=>`<div><img src="${trophyImage({title:t.name})}" alt="Trofeo de ${h(t.name)}" onerror="this.src=\'./assets/trophies/continental.png\'"><b>${h(t.name)}</b><small>${h(t.region)}</small></div>`).join('')}</div></section><div class="world-spotlight"><strong>${flag(country.code)} ${h(country.name)}</strong><small>${country.clubs.length} clubes de referencia</small></div></section>`));}
function farewell(){return retirementView(state,{badge,trophyImage,flag,dreamProgress,button,getClub});}

async function shareCareerPNG(){
 const a=careerAchievements(state),canvas=document.createElement('canvas');canvas.width=1400;canvas.height=1000;
 const ctx=canvas.getContext('2d');if(!ctx)return;
 const drawImage=async (path,x,y,w,h)=>{const img=new Image();img.src=path;try{await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=reject;if(img.complete&&img.naturalWidth)resolve();});ctx.drawImage(img,x,y,w,h);return true;}catch{return false;}};
 ctx.fillStyle='#09172b';ctx.fillRect(0,0,1400,1000);
 const g=ctx.createLinearGradient(0,0,1350,900);g.addColorStop(0,'#174365');g.addColorStop(.62,'#0d263e');g.addColorStop(1,'#07182a');ctx.fillStyle=g;ctx.fillRect(20,20,1360,960);
 ctx.fillStyle='#e9ad75';ctx.fillRect(54,55,6,138);
 await drawImage('./assets/brand/rascenso-icon.png',1240,48,91,91);
 ctx.fillStyle='#e9b782';ctx.font='800 22px sans-serif';ctx.fillText('RASCENSO · DEL BARRIO A LA HISTORIA',82,90);
 ctx.fillStyle='#fff';ctx.font='900 55px sans-serif';ctx.fillText(state.name.slice(0,34),80,158);
 ctx.fillStyle='#c4d7eb';ctx.font='22px sans-serif';ctx.fillText(`${careerHeadline(state)} · ${a.first||'—'}–${a.last||'—'} · retiro a los ${state.age} años`,80,204);
 const stats=[['TEMPORADAS',a.seasons],['PARTIDOS',a.matches],['GOLES',a.goals],['ASISTENCIAS',a.assists],['TÍTULOS',a.titles.length],['SELECCIÓN',a.caps]];
 stats.forEach(([label,val],i)=>{const x=77+i*208;ctx.fillStyle='#23405c';ctx.fillRect(x,247,191,102);ctx.fillStyle='#fff';ctx.font='900 39px sans-serif';ctx.fillText(String(val),x+14,297);ctx.fillStyle='#bbd3ea';ctx.font='13px sans-serif';ctx.fillText(label,x+14,330);});
 ctx.fillStyle='#e9b782';ctx.font='bold 22px sans-serif';ctx.fillText('LOS CLUBES DE MI CARRERA',78,405);
 const list=a.clubs.slice(0,12);
 for(let i=0;i<list.length;i++){
  const cl=list[i],col=i%2,row=Math.floor(i/2),x=78+col*636,y=428+row*55;
  ctx.fillStyle='#233f58';ctx.fillRect(x,y,616,49);
  const hasBadge=await drawImage(`./assets/crests/${encodeURIComponent(cl.id)}.png`,x+7,y+5,39,39);
  if(!hasBadge){ctx.fillStyle='#f0b87b';ctx.font='bold 22px sans-serif';ctx.fillText('⚽',x+12,y+32);}
  ctx.fillStyle='#fff';ctx.font='bold 18px sans-serif';ctx.fillText(cl.name.slice(0,34),x+57,y+21);
  ctx.fillStyle='#bed0e2';ctx.font='13px sans-serif';ctx.fillText(`${Math.min(...cl.years)}–${Math.max(...cl.years)} · ${cl.matches} PJ · ${cl.goals} G`,x+57,y+40);
 }
 ctx.fillStyle='#e9b782';ctx.font='bold 22px sans-serif';ctx.fillText('TÍTULOS Y RECUERDOS',80,805);
 const awards=a.titles.slice(-7).reverse();
 for(let i=0;i<awards.length;i++){
  const t=awards[i],x=81+i*183;
  ctx.fillStyle='#25445e';ctx.fillRect(x,823,171,113);
  const imgSrc=trophyImage({title:t.name,kind:t.kind});
  const loaded=await drawImage(imgSrc,x+60,828,51,58);
  if(!loaded){ctx.font='32px sans-serif';ctx.fillStyle='#f0b87b';ctx.fillText('🏆',x+59,871);}
  ctx.fillStyle='#fff';ctx.font='bold 11px sans-serif';ctx.fillText(String(t.name).slice(0,24),x+9,906);
  ctx.fillStyle='#d0dce9';ctx.font='12px sans-serif';ctx.fillText(String(t.year),x+9,924);
 }
 if(!awards.length){ctx.fillStyle='#d4e6f4';ctx.font='17px sans-serif';ctx.fillText('Cada carrera es una historia, con o sin copas.',82,883);}
 ctx.fillStyle='#89acc8';ctx.font='12px sans-serif';ctx.fillText('Carrera simulada · Proyecto independiente de Ragamoofi · Sin afiliación oficial a clubes o federaciones',77,960);
 const url=canvas.toDataURL('image/png'),anchor=document.createElement('a');anchor.download=`rascenso-expediente-${state.name.normalize('NFD').replace(/[^a-zA-Z0-9]+/g,'-')}.png`;anchor.href=url;anchor.click();
}
function settingsUI(){
 const u=loadUIPrefs(),modes=['pitch','stadium','classic'],names={pitch:'Césped',stadium:'Estadio',classic:'Clásico'};
 const items=[
  ['ui-cycle-ambience','Ambiente de fondo','Césped, luces del estadio o fondo clásico.',names[u.ambience]||'Césped'],
  ['ui-toggle-vivid','Colores más vivos','Contraste y acentos futboleros.',u.vivid?'Activo':'Desactivado'],
  ['ui-toggle-cardfx','Profundidad de tarjetas','Sombras suaves para distinguir cada panel.',u.cardFx?'Activo':'Desactivado'],
  ['ui-toggle-compact','Modo compacto','Más espacio para la carrera sin tanto desplazamiento.',u.compact?'Activo':'Desactivado'],
  ['ui-reset','Restablecer apariencia','Volver al diseño recomendado.','Restablecer']
 ];
 return '<section class="settings-section"><h3>APARIENCIA Y AMBIENTE</h3><p>Elige cómo se ve tu carrera. Estas preferencias se guardan en este navegador.</p><div class="settings-list">'
  +items.map(([action,title,detail,value])=>'<button type="button" class="settings-row" data-action="'+action+'"><strong>'+title+'</strong><small>'+detail+'</small><em>'+value+'</em></button>').join('')
  +'</div></section>';
}
function tools(){return `<div class="modal-dimmer" id="modal" role="dialog" aria-modal="true" aria-label="Opciones"><div class="tool-panel"><span class="section-label">${state?'GESTIÓN DE CARRERA':'OPCIONES'}</span><h2>${state?'Tu partida':'Apariencia del juego'}</h2>${state?`<p>RASCENSO guarda automáticamente en este navegador y conserva un respaldo anterior. Exporta una copia antes de cambiar de dispositivo.</p>${button('Exportar guardado JSON','export','main wide')}`:''}${button('Importar guardado JSON','import','secondary wide')}<input type="file" id="import-file" accept="application/json,.json" hidden>${state?`${button('Simular hasta el retiro','retire-auto','secondary wide')}${canRetire(state)?button('Anunciar mi retiro ahora','retire-now','ghost wide'):''}${button('Nueva carrera','reset','danger wide')}`:''}${settingsUI()}<section class="settings-section"><h3>BASE MUNDIAL DE JUGADORES</h3><p>Importa tu ZIP completo una sola vez. Se instalarán todos los jugadores y clubes disponibles en el archivo, incluidos agentes libres. No sube datos a internet.</p><p>${worldDbInfo?n(worldDbInfo.total)+" jugadores · "+n(worldDbInfo.clubs)+" clubes de origen · "+n(worldDbInfo.mapped)+" equivalencias automáticas":"Base mundial sin instalar."}</p><small><span class="fm-world-status">${h(worldImportStatus)}</span></small><input id="fm-world-file" type="file" accept=".zip" hidden>${button("Instalar base mundial completa","fm-world-import","secondary wide")}${worldDbInfo?button("Borrar base mundial de este navegador","fm-world-clear","ghost wide"):""}</section><p class="credits-note">Créditos de fotografías: <a href="https://commons.wikimedia.org/" target="_blank" rel="noopener">Wikimedia Commons</a>. <a href="./assets/MEDIA_CREDITS.html" target="_blank" rel="noopener">Autores y licencias de cada imagen</a>.</p>${button('Cerrar','tools-close','ghost wide')}</div></div>`;}
function render(){try{if(!state)return creator();if(state.phase==='draft'){shell(draftScreen(),showNew?tools():'');enhanceLegendImages(ROOT);return;}if(state.phase==='academy')return shell(state.dnaReviewed===false?dnaReview():academy(),showNew?tools():'');let center=tab==='historial'?history():tab==='mundo'?world():tab==='vestuario'?frame(vestuarioView(state)):state.phase==='season'?season():state.phase==='event'?narrative():state.phase==='transfer'?market():farewell();shell(center,showNew?tools():'');}finally{message='';}}
function gather(){document.querySelectorAll('#creation-form [name]').forEach(el=>{if(el.type==='radio'&&!el.checked)return;draft[el.name]=el.value;});}
function begin(){gather();if(!draft.name.trim()){wizard=0;message='Escribe un nombre para tu futbolista.';saveDraft();render();document.querySelector('[name="name"]')?.focus();return;}const number=Number(draft.number);if(!(Number.isInteger(number)&&number>=1&&number<=99)){wizard=0;message='El dorsal debe estar entre 1 y 99.';saveDraft();render();return;}try{if(mutate(newCareer({...draft,seed:`${Date.now()}-${Math.random().toString(36).slice(2)}`})))clearDraft();}catch(e){alert(e.message);}}
function download(){const data=JSON.stringify(state,null,2);const url=URL.createObjectURL(new Blob([data],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=`rascenso-${state.name.toLowerCase().replace(/[^a-z0-9]+/g,'-')}-${Date.now()}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
ROOT.addEventListener('change',e=>{if(e.target.closest('#creation-form')){gather();if(e.target.name==='country')draft.fanClubId='';if(e.target.name==='position')draft.roleClass=classesFor(draft.position)[0].id;
 // Los campos de texto no redibujan al perder el foco: así el clic en «Continuar» nunca se pierde.
 saveDraft();if(e.target.matches('input[type=text],input:not([type]),input[type=number],textarea'))return;render();}if(e.target.id==='fm-world-file'){const file=e.target.files?.[0];if(!file)return;
 worldImportStatus='Preparando la base mundial…';render();
 installWorldDatabase(file,{onProgress:({processed,total,players,done})=>{worldImportStatus=done?'Importación completa':processed+' de '+total+' archivos · '+n(players)+' jugadores procesados';const hint=document.querySelector('.fm-world-status');if(hint)hint.textContent=worldImportStatus;}}).then(async info=>{
 worldDbInfo=info;worldImportStatus='Instalados '+n(info.total)+' futbolistas, '+n(info.clubs)+' clubes y '+n(info.freePlayers)+' libres.';
 await activateWorldContext(state||{clubId:''});if(state?.clubId){state=syncClub(state);save()}render();
 }).catch(err=>{worldImportStatus='No se pudo importar: '+err.message;render();alert(worldImportStatus)});return;
 }if(e.target.id==='import-file'){const file=e.target.files?.[0];if(!file)return;file.text().then(x=>{let data=migrateCareer(JSON.parse(x));if(!data)throw Error('Archivo incompatible');if(!confirm('¿Reemplazar la partida actual por este guardado?'))return;showNew=false;mutate(data);}).catch(err=>alert(`Error al importar: ${err.message}`));}});
ROOT.addEventListener('input',e=>{if(e.target.closest('#creation-form')&&e.target.name){draft[e.target.name]=e.target.value;saveDraft();if(e.target.name==='story'){const c=document.getElementById('story-count');if(c)c.textContent=`${e.target.value.length}/180`;}if(e.target.name==='name'||e.target.name==='number'){const aside=document.querySelector('.cr-who');if(aside){const strong=aside.querySelector('strong');if(strong&&e.target.name==='name')strong.textContent=e.target.value||'TU NOMBRE';const num=aside.querySelector('.cr-num');if(num&&e.target.name==='number')num.textContent='#'+(e.target.value||'9');}}}});
ROOT.addEventListener('submit',e=>{if(e.target.id==='fm-world-search'){e.preventDefault();runWorldSearch(new FormData(e.target).get('player-search'));return;}if(e.target.id==='fm-world-club-search'){e.preventDefault();runWorldClubSearch(new FormData(e.target).get('club-search'));return;}if(e.target.id==='creation-form'){e.preventDefault();wizard===5?begin():((gather(),wizard++,render()));}});
ROOT.addEventListener('click',e=>{
 const a=e.target.closest('[data-action]');if(!a||a.disabled)return;
 const action=a.dataset.action;
 if(action==='trophy-detail'){
  const record=trophyEntries(state)[Number(a.dataset.index)];if(!record)return;
  document.querySelector('.trophy-spotlight')?.remove();
  const dlg=document.createElement('dialog');dlg.className='trophy-spotlight';dlg.setAttribute('aria-labelledby','trophy-modal-title');
  dlg.innerHTML=trophyDetail(record,getClub,getCountry);ROOT.appendChild(dlg);
  dlg.addEventListener('close',()=>dlg.remove(),{once:true});
  dlg.addEventListener('click',ev=>{if(ev.target===dlg)dlg.close();});
  dlg.showModal();dlg.querySelector('[data-action="trophy-close"]')?.focus();return;
 }
 if(action==='trophy-close'){a.closest('dialog')?.close();return;}
 if(action==='step'){gather();wizard=Math.max(0,Math.min(5,Number(a.dataset.index)));saveDraft();render();return;}
 if(action==='cr-goto'){gather();wizard=Math.max(0,Math.min(5,Number(a.dataset.step)));saveDraft();render();return;}
 if(action==='cr-number'){gather();draft.number=a.dataset.n;saveDraft();render();return;}
 if(action==='cr-preset'){gather();const p=PRESETS.find(x=>x.id===a.dataset.id);if(p){Object.assign(draft,p.fields);saveDraft();message=`Perfil «${p.name}» aplicado. Puedes ajustar cada elección.`;wizard=5;render();}return;}
 if(action==='cr-random'){gather();Object.assign(draft,randomFields(`${Date.now()}-${Math.random()}`));saveDraft();message='Perfil aleatorio aplicado. ¡Revisa tu resumen!';wizard=5;render();return;}
 if(action==='creator-prev'){gather();wizard=Math.max(0,wizard-1);saveDraft();render();return;}
 if(action==='creator-next'){gather();if(wizard===0&&!draft.name.trim()){document.querySelector('[name="name"]')?.focus();return;}wizard=Math.min(5,wizard+1);saveDraft();render();return;}
 if(action==='create'){begin();return;}
 if(action==='draft-accept')return mutate(acceptDraft(state,Number(a.dataset.index)));
 if(action==='reroll')return mutate(rerollDraft(state));
 if(action==='academy-continue'&&state?.phase==='academy')return mutate({...state,dnaReviewed:true});
 if(action==='academy')return mutate(signAcademy(state,a.dataset.id));
 if(action==='preparation')return mutate(choosePreparation(state,a.dataset.id));
 if(action==='clutch-pick'){if(state.phase!=='season'||state.clutchMoment)return;skillUI.zone=Number(a.dataset.zone);skillUI.answers=[];const m=seasonMoment(state);skillUI.revealed=minigameMode(m)==='memoria';render();if(skillUI.revealed){setTimeout(()=>{if(skillUI.zone!==null&&!state?.clutchMoment){skillUI.revealed=false;render();}},2200);}else startNeedle();return;}
 if(action==='clutch-cancel'){stopNeedle();skillUI.zone=null;skillUI.answers=[];skillUI.revealed=false;render();return;}
 if(action==='clutch-memory'){if(skillUI.zone===null||skillUI.revealed||state.phase!=='season'||state.clutchMoment)return;skillUI.answers.push(Number(a.dataset.zone));if(skillUI.answers.length===3){const zone=skillUI.zone,m=seasonMoment(state),accuracy=memoryAccuracy(m,skillUI.answers);skillUI.zone=null;skillUI.answers=[];return mutate(playCareerMoment(state,zone,timingTarget(m),accuracy));}render();return;}
 if(action==='clutch-stop'){if(skillUI.zone===null||state.phase!=='season'||state.clutchMoment)return;const zone=skillUI.zone,timing=skillUI.current;stopNeedle();skillUI.zone=null;return mutate(playCareerMoment(state,zone,timing));}
 if(action==='match-rhythm')return mutate(chooseMatchRhythm(state,a.dataset.rhythm));
 if(action==='season-agenda')return mutate(chooseSeasonAgenda(state,Number(a.dataset.index))); 
 if(action==='plan')return mutate(chooseSeasonPlan(state,a.dataset.id));
 if(action==='play-open'){const play=seasonPlays(state).find(p=>p.id===a.dataset.id);if(!play||play.result)return;const id=play.id;
  openPlay({state,play,clubName:getClub(state.clubId)?.name,onDone:res=>mutate(resolveSeasonPlay(state,id,res))});return;}
 if(action==='play-auto')return mutate(autoResolveSeasonPlay(state,a.dataset.id));
 if(action==='season-next'){
  // Modo rápido: completar realmente los momentos pendientes usando el mismo motor de probabilidades.
  // La simulación registra sus resultados y consecuencias; no ignora las jugadas al avanzar.
  let next=state;const pending=seasonPlays(next).filter(p=>!p.result);
  for(const play of pending)next=autoResolveSeasonPlay(next,play.id);
  return mutate(advanceSeason(next));
 }
 if(action==='agent-open'){agentFocusOpen=!agentFocusOpen;render();return;}
 if(action==='agent-focus'){agentFocusOpen=false;return mutate(openAgentMarket(state,a.dataset.focus||'balanced'));}
 if(action==='agent-search')return mutate(askAgentForMore(state));
 if(action==='market-retire')return mutate(retireFromMarket(state));
 if(action==='negotiate')return mutate(negotiateOffer(state,a.dataset.id,a.dataset.ask));
 if(action==='renewal-negotiate')return mutate(negotiateRenewal(state));
 if(action==='retire-now'){if(!canRetire(state)||!confirm('¿Anunciar tu retiro del fútbol profesional? La carrera terminará ahora.'))return;showNew=false;return mutate(retireNow(state));}
 if(action==='recap-continue')return mutate({...state,recapPending:false});
 if(action==='event')return mutate(resolveEvent(state,Number(a.dataset.index)));
 if(action==='event-skip')return mutate(autoResolveEvent(state));
 if(action==='event-finish')return mutate(finishEvent(state));
 if(action==='transfer')return mutate(chooseTransfer(state,a.dataset.id));
 if(action==='stay')return mutate(chooseTransfer(state));
 if(action==='right-tab'){rightTab=a.dataset.id==='matches'?'matches':'standings';render();return;}
 if(action==='nav'){stopNeedle();skillUI.zone=null;skillUI.answers=[];tab=a.dataset.tab;render();return;}
 if(action==='tools'){showNew=true;render();return;}
 if(action==='tools-close'){showNew=false;render();return;}
 if(action==='ui-cycle-ambience'){const order=['pitch','stadium','classic'],u=loadUIPrefs();updateUIPrefs({ambience:order[(order.indexOf(u.ambience)+1+order.length)%order.length]});render();return;}
 if(action==='ui-toggle-vivid'){updateUIPrefs({vivid:!loadUIPrefs().vivid});render();return;}
 if(action==='ui-toggle-cardfx'){updateUIPrefs({cardFx:!loadUIPrefs().cardFx});render();return;}
 if(action==='ui-toggle-compact'){updateUIPrefs({compact:!loadUIPrefs().compact});render();return;}
 if(action==='ui-reset'){updateUIPrefs(DEFAULT_UI_PREFS);render();return;}
 if(action==='export'){download();return;}
 if(action==='share-png'){shareCareerPNG().catch(err=>alert('No se pudo generar la imagen: '+err.message));return;}
 if(action==='import'){document.getElementById('import-file')?.click();return;}
 if(action==='fm-world-club'){readWorldClub(a.dataset.id).then(club=>{
 if(!club)return;
 const modal=document.createElement('dialog');modal.className='trophy-spotlight fm-person-spotlight';
 modal.innerHTML='<div class="trophy-detail-body"><b>PLANTILLA MUNDIAL</b><h2>'+h(club.name)+'</h2><p>'+club.players.length+' futbolistas registrados</p><div class="fm-world-results">'+club.players.slice(0,90).map(p=>'<div class="fm-world-person"><b>'+h(p.nombre)+'</b><small>'+h(p.posiciones?.[0]||'')+' · '+h(p.edad)+' años</small><strong>'+h(p.ca_fm??'—')+'</strong></div>').join('')+'</div><button type="button" class="action secondary" data-action="fm-person-close">Cerrar</button></div>';
 ROOT.appendChild(modal);modal.addEventListener('close',()=>modal.remove(),{once:true});modal.showModal();
 }).catch(err=>alert(err.message));return;}
 if(action==='fm-world-player'){const id=a.dataset.id;
 getWorldPlayer(id).then(player=>{if(!player)return;const modal=document.createElement('dialog');modal.className='trophy-spotlight fm-person-spotlight';
 modal.innerHTML='<div class="trophy-detail-body"><b>FUTBOLISTA DEL MUNDO</b><h2>'+h(player.nombre)+'</h2><p>'+h(player.edad)+' años · '+h((player.posiciones||[]).join(' / '))+'</p><div class="trophy-detail-facts"><div><small>MEDIA</small><strong>'+h(player.ca_fm??'—')+'</strong></div><div><small>POTENCIAL</small><strong>'+h(player.pa_fm??'—')+'</strong></div></div><button type="button" class="action secondary" data-action="fm-person-close">Cerrar</button></div>';
 ROOT.appendChild(modal);modal.addEventListener('close',()=>modal.remove(),{once:true});modal.showModal();
 }).catch(err=>alert(err.message));return;}
 if(action==='fm-person-close'){a.closest('dialog')?.close();return;}
 if(action==='fm-world-import'){document.getElementById('fm-world-file')?.click();return;}
 if(action==='fm-world-clear'){if(!confirm('¿Borrar la base mundial instalada en este navegador? La partida seguirá guardada.'))return;forgetWorldDatabase().then(()=>{worldDbInfo=null;worldSearchRows=[];render()}).catch(e=>alert(e.message));return;}
 if(action==='reset'){if(!confirm('¿Crear una nueva carrera? Exporta la actual antes de reemplazarla.'))return;localStorage.removeItem(STORE);state=null;showNew=false;wizard=0;render();return;}
 if(action==='retire-auto'){if(!confirm('¿Avanzar automáticamente hasta el retiro? No podrás deshacerlo sin un guardado anterior.'))return;showNew=false;mutate(simulateToRetirement(state));return;}
 if(action==='country'){const code=a.dataset.id;document.querySelector('.world-spotlight').innerHTML=`<strong>${flag(code)} ${h(countryName(code))}</strong><small>${getCountry(code).clubs.length} clubes de referencia · ${h(getCountry(code).clubs.slice(0,6).map(x=>x.name).join(' · '))}</small>`;}
});
document.addEventListener?.('keydown',e=>{
 if(e.code==='Escape'&&showNew){showNew=false;render();return;}
 if(e.code==='Space'&&skillUI.zone!==null&&state?.phase==='season'&&tab==='carrera'&&!e.repeat&&!e.target.closest('input,textarea,select')){e.preventDefault();ROOT.querySelector('[data-action="clutch-stop"]')?.click();}
});
ROOT.addEventListener('error',e=>{if(e.target.matches('img.badge-img'))e.target.remove();},true);
render();
getWorldDatabaseInfo().then(async info=>{worldDbInfo=info;if(info){await activateWorldContext(state||{clubId:''});if(state?.clubId){state=syncClub(state);save()}}render()}).catch(()=>{});
