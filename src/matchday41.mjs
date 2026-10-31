/* RASCENSO 4.1 · Centro de partido y memoria deportiva. Sin dependencias de DOM. */
import { PLAYS, autoChance } from './plays30.mjs';
import {impactPreview} from './play-impact43.mjs';
import {tuningFor} from './play-tuning43.mjs';

const h=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=n=>Number.isFinite(Number(n))?Math.round(Number(n)):0;
const tag=p=>p.classic?'CLÁSICO':p.decisive?'PARTIDO CLAVE':'JORNADA DE LIGA';
const typeLabel=p=>p.kind==='attack'?(p.credit==='assist'?'CREAR UN GOL':'BUSCAR EL GOL'):'EVITAR UN GOL';
const roleText=p=>p.classic?'La rivalidad le pone otra presión a esta jugada.':p.decisive?'Un detalle puede cambiar el rumbo del partido.':p.minute>=80?'Los minutos finales pueden decidir los puntos.':'Todavía queda tiempo para cambiar la historia.';
function score(p,clubName){
 const local=p.isHome?clubName:p.rival,away=p.isHome?p.rival:clubName;
 return {local,away,home:p.isHome?p.before.gf:p.before.ga,visitor:p.isHome?p.before.ga:p.before.gf};
}
const action=(name,id,label,cls='')=>`<button type="button" class="matchday-button ${cls}" data-action="${name}" data-id="${h(id)}">${label}</button>`;
/** Escenario completo y opcional: no altera el partido ni sus resultados. */
export function matchdayPanel(s,plays,getClub,badgeFn){
 const clubName=getClub(s.clubId)?.name||'Tu club';
 const crest=id=>badgeFn?badgeFn(id,'tiny'):'<span aria-hidden="true">⚽</span>';
 const done=plays.filter(p=>p.result).length,remaining=plays.filter(p=>!p.result);
 const main=remaining[0]||plays.at(-1),inPlay=remaining.length>0;
 if(!plays.length)return `<section class="matchday-center"><div class="matchday-top"><span>⚽ CENTRO DE PARTIDO</span><small>Sin momentos disponibles</small></div><p>Esta temporada todavía no tienes minutos decisivos. Tus actuaciones y tu rol influyen en las oportunidades.</p></section>`;
 const outcome=main?.result,sc=score(main,clubName),win=outcome?.success;
 const p=main,info=PLAYS[p.type],club=getClub(p.rivalId);
 const max=plays.length;
 const mini=(r,i)=>{const sc=score(r,clubName),res=r.result,inf=PLAYS[r.type];return `<div class="matchday-fixture ${res?'finished':''} ${r.id===main.id?'up-next':''}"><span class="matchday-fixture-number">${String(i+1).padStart(2,'0')}</span>
  <div class="matchday-fixture-info"><small>FECHA ${fmt(r.round)} · ${tag(r)}</small><strong>${h(sc.local)} <span>vs</span> ${h(sc.away)}</strong><em>MIN ${fmt(r.minute)}' · ${h(inf.name)}</em></div>
  <div class="matchday-fixture-actions">${res?`<b class="${res.success?'good':'bad'}">${res.success?'✓ LOGRADA':'✕ FALLADA'}</b>${res.finalScore?`<small>Final ${h(res.finalScore)}</small>`:''}`:`${action('play-open',r.id,'Jugar ▶','compact')}${action('play-auto',r.id,'Simular','secondary compact')}`}</div></div>`};
 return `<section class="matchday-center" aria-label="Centro de partido">
 <div class="matchday-top"><span>⚽ CENTRO DE PARTIDO</span><div><b>${done}/${max} JUGADAS</b><small>${remaining.length?'Momentos por disputar':'Momentos completados'}</small></div></div>
 <div class="matchday-progress" role="progressbar" aria-valuenow="${done}" aria-valuemin="0" aria-valuemax="${max}"><span style="width:${100*done/max}%"></span></div>
 <div class="matchday-feature ${p.kind==='defend'?'defensive':'offensive'}">
  <div class="matchday-arena"><span class="matchday-arena-glow"></span><div class="matchday-arena-heading"><span>RASCENSO <b>${inPlay?'LIVE':'ARCHIVO'}</b></span><span>${inPlay?(p.isHome?'EN CASA':'FUERA DE CASA'):'PARTIDO REGISTRADO'}</span></div><div class="matchday-arena-pitch"><span></span><i></i><b></b></div></div>
  <div class="matchday-context"><span>${tag(p)} · FECHA ${fmt(p.round)}</span><span>MIN ${fmt(p.minute)}'</span></div>
  <div class="matchday-scoreboard"><div class="matchday-team"><span class="matchday-team-crest">${crest(p.isHome?s.clubId:p.rivalId)}</span><span>${h(sc.local)}</span></div><strong aria-label="Marcador ${fmt(sc.home)} a ${fmt(sc.visitor)}"><span>${fmt(sc.home)}</span><i>:</i><span>${fmt(sc.visitor)}</span></strong><div class="matchday-team"><span class="matchday-team-crest">${crest(p.isHome?p.rivalId:s.clubId)}</span><span>${h(sc.away)}</span></div></div>
  <div class="matchday-rival">${h(club?.country||'')} · RIVAL ${p.isHome?'VISITANTE':'LOCAL'} · ${typeLabel(p)}</div><div class="matchday-situation"><b>${!inPlay?'MOMENTO REGISTRADO':p.minute>=80?'ÚLTIMOS MINUTOS':p.decisive?'PARTIDO DECISIVO':'EL PARTIDO ESTÁ EN JUEGO'}</b><span>${inPlay?roleText(p):(win?'La jugada quedó registrada como momento logrado.':'La jugada quedó registrada sin éxito.')}</span></div><div class="matchday-identity">${h(tuningFor(p.type).tag)}</div>
  <h3>${h(info.name)}</h3><p>${h(info.brief)}</p>
  <div class="matchday-indicators"><span>Presión <b>${fmt(p.pressure)}/100</b></span><span>Rival <b>${fmt(p.difficulty*100)}/100</b></span><span>Tu oportunidad <b>${fmt(autoChance(s,p)*100)}%*</b></span></div>
  <div class="matchday-cta">${outcome?`<strong class="matchday-result ${win?'good':'bad'}">${win?'✓ MOMENTO CONSEGUIDO':'✕ OCASIÓN PERDIDA'}</strong>`:`${action('play-open',p.id,'▶ ENTRAR A LA CANCHA','primary')}${action('play-auto',p.id,'Simular jugada','secondary')}`}</div>
 </div>
 <details class="matchday-calendar"><summary><span>📅 Calendario de momentos · ${max} partidos</span><b>VER JORNADAS ▾</b></summary><div class="matchday-schedule">${plays.map(mini).join('')}</div></details>
 <div class="matchday-projection">${h(impactPreview(plays.map(p=>p.result).filter(Boolean)))}</div>
 <small class="matchday-note">*Probabilidad orientativa para resolución automática. Si juegas, tus decisiones y habilidades influyen. Las jugadas no disputadas se simulan al avanzar la temporada.</small>
 </section>`;
}
/** Clasificación histórica real derivada solamente de jugadas guardadas, nunca inventada. */
export function rivalLedger(s){
 const data=new Map();
 for(const y of s?.history||[])for(const p of y.plays||[]){
  if(!p.rival)continue;
  const key=String(p.rival);
  const r=data.get(key)||{name:key,played:0,successes:0,years:new Set(),recent:0};
  r.played++;r.successes+=p.success?1:0;r.years.add(y.year);r.recent=Math.max(r.recent,Number(y.year)||0);
  data.set(key,r);
 }
 const leaders=[...data.values()].sort((a,b)=>b.played-a.played||b.recent-a.recent||a.name.localeCompare(b.name,'es')).slice(0,4);
 if(!leaders.length)return '';
 return `<section class="matchday-rivals"><span class="section-label">RIVALES QUE MARCARON TU CARRERA</span><p>Enfrentamientos importantes registrados en tus jugadas.</p><div class="matchday-rivals-grid">${leaders.map(r=>`<div><strong>${h(r.name)}</strong><span>${r.played} duelos · ${r.successes} decisivos</span><small>${r.years.size} temporada${r.years.size===1?'':'s'}</small></div>`).join('')}</div></section>`;
}
