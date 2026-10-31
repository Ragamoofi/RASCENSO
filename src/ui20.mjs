/* RASCENSO 2.0 · Componentes de interfaz para el mundo vivo, el vestuario, objetivos, premios y récords.
 * Funciones puras que devuelven HTML; experience.mjs decide dónde se montan. */
import { flag, badge } from './assets.mjs';
import { COACH_STYLES, THREAD_INFO, activeThreads, scoutedPotential, careerRecords, POSITION_NAMES, yearOf } from './career20.mjs';
import { coachFor, worldClub, worldRival, topPlayers, generationPlayers, powerRanking, risingClubs, clubTrend, newsIcon, dynamicPrestige, AWARD_NAMES } from './world20.mjs';
import { currentObjectives, currentRole, canRetire, NEGOTIATION_ASKS } from './engine.mjs';
import { annualSalaryLabel } from './market.mjs';

// Utilidades compartidas con experience.mjs (único escapador HTML del juego).
export const h=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const n=x=>Number(x||0).toLocaleString('es-CL');
const btn=(label,action,cls='main',more='')=>`<button type="button" class="action ${cls}" data-action="${action}" ${more}>${label}</button>`;
const meter=(label,value,tone='')=>`<div class="v2-meter ${tone}"><span>${h(label)}<b>${n(Math.round(value))}%</b></span><div><i style="width:${Math.max(0,Math.min(100,value))}%"></i></div></div>`;
const clubName=id=>worldClub(id)?.name||'—';
export const tierOf=ovr=>ovr>=83?'elite':ovr>=75?'gold':ovr>=65?'silver':'bronze';
const initials=name=>(name||'?').split(' ').map(x=>x[0]).join('').slice(0,2);
const avatar=name=>`<span class="v2-coach-avatar">${h(initials(name))}</span>`;
const threadIcon=kind=>h(THREAD_INFO[kind]?.icon||'•'),threadName=(kind,fallback=kind)=>h(THREAD_INFO[kind]?.name||fallback);

/* ---------- Tarjeta del jugador: proyección y nota ---------- */
export function cardExtras(s){
 const sp=scoutedPotential(s);const last=s.lastSeason;
 return `<div class="v2-card-extra">${sp?`<div><small>PROYECCIÓN</small><strong>${sp.low===sp.high?sp.low:`${sp.low}–${sp.high}`}</strong><em>${h(sp.label)}</em></div>`:''}${last?.rating?`<div><small>NOTA ${h(last.year)}</small><strong>${last.rating.toFixed(2)}</strong><em>${h(last.role||'')}</em></div>`:''}</div>`;
}
export function attributeBar(s,key,label){
 const v=s.attributes?.[key],c=s.attrCeil?.[key],delta=s.lastSeason?.attributeChanges?.[key];
 if(['skills','weak'].includes(key))return `<div class="v2-attr stars"><span>${h(label)}</span><strong>${'★'.repeat(v||0)}<i>${'★'.repeat(Math.max(0,5-(v||0)))}</i></strong></div>`;
 return `<div class="v2-attr" title="${h(label)}: ${v??'—'}${c?` · techo estimado ${c}`:''}"><span>${h(label)}</span><strong>${v??'—'}${typeof delta==='number'&&delta?`<small class="${delta>0?'up':'down'}">${delta>0?'+':''}${delta}</small>`:''}</strong><div class="v2-attr-bar"><i style="width:${v||0}%"></i>${c?`<b style="left:${Math.min(99,c)}%"></b>`:''}</div></div>`;
}

/* ---------- Panel de temporada: objetivos, competidor y entrenador ---------- */
export function seasonPanels(s){
 const obj=currentObjectives(s);const role=currentRole(s);const coach=coachFor(s,s.clubId);const rival=s.squad?.rival;const threads=activeThreads(s);
 const diff=rival?(s.ovr||0)-rival.ovr:0;
 return `<div class="v2-season-grid">
 <section class="v2-panel"><header><span>OBJETIVOS ${yearOf(s)}</span><b>${h(role||'')}</b></header>${obj?`<ul class="v2-objectives"><li><i>🏛</i><div><small>DIRECTIVA</small><strong>${h(obj.board.label)}</strong><em>${h(obj.board.text)} · el club parte ${obj.board.expectedRank}° de ${obj.board.teams} en presupuesto</em></div></li><li><i>⚽</i><div><small>ENTRENADOR</small><strong>${h(obj.personal.label)}</strong><em>Meta personal según tu rol y puesto</em></div></li><li><i>⏱</i><div><small>CONTINUIDAD</small><strong>${h(obj.minutes.label)}</strong><em>Partidos esperados como ${h(String(role||'').toLowerCase())}</em></div></li></ul>`:'<p class="muted">Los objetivos se fijan al comenzar la temporada.</p>'}</section>
 <section class="v2-panel"><header><span>LUCHA POR EL PUESTO</span><b>${h(POSITION_NAMES[s.position]||s.position)}</b></header>${rival?`<div class="v2-duel"><div class="me"><small>TÚ</small><strong>${s.ovr}</strong><em>${s.age} años</em></div><div class="vs ${diff>=2?'ahead':diff<=-2?'behind':'even'}">${diff>=2?'Ventaja':diff<=-2?'Desventaja':'Parejo'}<small>${diff>0?'+':''}${diff}</small></div><div class="them"><small>${h(rival.name)}</small><strong>${rival.ovr}</strong><em>${rival.age} años${rival.trend?` · ${rival.trend>0?'▲':'▼'}`:''}</em></div></div>`:''}<div class="v2-coach-line">${avatar(coach?.name)}<div><strong>${h(coach?.name||'Entrenador')}</strong><small>${h(coach?.styleName||'')} · ${h(COACH_STYLES[coach?.style]?.description||'')}</small></div></div>${meter('Confianza del técnico',s.coachTrust??50,'trust')}</section>
 ${threads.length?`<section class="v2-panel v2-threads-mini"><header><span>COMPROMISOS ACTIVOS</span><b>${threads.length}</b></header>${threads.map(t=>`<span class="v2-thread"><i>${threadIcon(t.kind)}</i>${threadName(t.kind)}</span>`).join('')}</section>`:''}
 </div>${canRetire(s)?`<div class="v2-retire-row"><small>Con ${s.age} años puedes decidir el final de tu carrera.</small>${btn('Anunciar mi retiro','retire-now','ghost compact')}</div>`:''}`;
}

/* ---------- Consecuencias visibles de cada decisión ---------- */
const EFFECT_LABEL={coach:'Entrenador',teammate:'Vestuario',agent:'Representante',press:'Prensa',family:'Familia',morale:'Moral',reputation:'Reputación',fans:'Hinchada',board:'Directiva',ovr:'Media'};
export function optionConsequences(o){
 const e=o.effect||{};const chips=[];
 for(const [k,label] of Object.entries(EFFECT_LABEL))if(typeof e[k]==='number'&&e[k])chips.push(`<i class="${e[k]>0?'up':'down'}">${label} ${e[k]>0?'▲':'▼'}</i>`);
 if(e.thread)chips.push(`<i class="thread">${threadIcon(e.thread.kind)} ${threadName(e.thread.kind,'Compromiso')}</i>`);
 if(e.position)chips.push(`<i class="thread">⇄ Pasa a ${h(e.position)}</i>`);
 if(e.money)chips.push(`<i class="down">€ ${annualSalaryLabel(e.money)}</i>`);
 if(e.salaryCut)chips.push(`<i class="down">Sueldo −${Math.round(e.salaryCut*100)} %</i>`);
 if(e.raise)chips.push(`<i class="up">Sueldo +${Math.round(e.raise*100)} %</i>`);
 if(e.retire)chips.push('<i class="down">Fin de la carrera</i>');
 if(e.captain)chips.push('<i class="up">Capitán</i>');
 return chips.length?`<span class="v2-chips">${chips.join('')}</span>`:'';
}

/* ---------- Cierre de temporada ---------- */
export function recapExtras(s){
 const x=s.lastSeason;if(!x)return '';
 const ob=x.objectives;const aw=s.world?.awards?.find(a=>a.year===x.year);
 const yearNews=(s.world?.news||[]).filter(nw=>nw.year===x.year).slice(0,6);
 const objectives=ob?`<section class="v2-panel"><header><span>OBJETIVOS DE LA TEMPORADA</span><b>${[ob.board,ob.personal,ob.minutes].filter(o=>o.met).length}/3</b></header><ul class="v2-objectives result">${[['🏛','Directiva',ob.board,`${ob.board.actual}° (meta: ${ob.board.text.toLowerCase()})`],['⚽','Entrenador',ob.personal,`${ob.personal.actual} / ${ob.personal.target}`],['⏱','Continuidad',ob.minutes,`${ob.minutes.actual} / ${ob.minutes.target} partidos`]].map(([i,l,o,t])=>`<li class="${o.met?'met':'miss'}"><i>${i}</i><div><small>${l}</small><strong>${h(o.label)}</strong><em>${h(t)}</em></div><b>${o.met?'✓':'✗'}</b></li>`).join('')}</ul></section>`:'';
 const mine=(aw?.list||[]).filter(a=>a.winner?.you);
 const leagueAwards=(aw?.list||[]).filter(a=>!a.global);
 const awards=aw?`<section class="v2-panel v2-awards"><header><span>PREMIOS ${x.year}</span><b>${mine.length?`${mine.length} ganado(s)`:'—'}</b></header>${mine.map(a=>`<div class="v2-award won"><i>★</i><div><strong>${h(a.name)}</strong><small>${h(a.text)}</small></div></div>`).join('')}${leagueAwards.filter(a=>!a.winner?.you).map(a=>`<div class="v2-award"><i>☆</i><div><strong>${h(a.name)}</strong><small>${h(a.text)}</small></div></div>`).join('')}${aw.ranking?.length?`<div class="v2-ballot"><small>${h(AWARD_NAMES.ball)} · TOP 5</small>${aw.ranking.slice(0,5).map(r=>`<span class="${r.you?'you':''}"><b>${r.place}</b>${h(r.name)}<em>${h(clubName(r.clubId))}</em></span>`).join('')}${aw.youPlace&&aw.youPlace>5?`<span class="you"><b>${aw.youPlace}</b>${h(s.name)}<em>Tu puesto</em></span>`:''}</div>`:''}</section>`:'';
 const growth=(x.devNotes||[]).length||x.rivalChange?`<section class="v2-panel"><header><span>DESARROLLO Y VESTUARIO</span><b>Media ${x.ovrBefore} → ${x.ovrAfter}</b></header>${(x.devNotes||[]).map(d=>`<p class="v2-note ${d.kind}">${h(d.text)}</p>`).join('')}${x.rivalChange?`<p class="v2-note">${h(x.rivalChange)}</p>`:''}${x.relegated?'<p class="v2-note injury">El club descendió de categoría.</p>':''}${x.promoted?'<p class="v2-note breakout">¡El club consiguió el ascenso!</p>':''}</section>`:'';
 const headlines=yearNews.length?`<section class="v2-panel"><header><span>EL MUNDO ESTE AÑO</span><b>${yearNews.length} titulares</b></header><div class="v2-news compact">${yearNews.map(newsItem).join('')}</div></section>`:'';
 return `<div class="v2-recap-grid">${objectives}${awards}${growth}${headlines}</div>`;
}
function newsItem(nw){return `<article class="v2-news-item ${nw.mine?'mine':''} k-${h(nw.kind)}"><i>${newsIcon(nw.kind)}</i><div><strong>${h(nw.title)}</strong><small>${h(nw.year)} · ${h(nw.text)}</small></div>${nw.clubId?badge(nw.clubId,'tiny'):''}</article>`;}

/* ---------- Pantalla: Vestuario ---------- */
export function vestuarioView(s){
 const club=worldClub(s.clubId);const coach=coachFor(s,s.clubId);const sq=s.squad||{};const rival=sq.rival;const trend=clubTrend(s,s.clubId);
 const rel=s.relationships||{};const threads=(s.threads||[]).slice().reverse();
 const obj=currentObjectives(s);
 const relCard=(key,label)=>{const r=rel[key];if(!r)return '';return `<div class="v2-rel">${avatar(r.name)}<div><strong>${h(r.name)}</strong><small>${h(label)}</small>${meter('Relación',r.trust??50)}</div></div>`;};
 return `<section class="focus-card v2-vestuario"><div class="section-label">VESTUARIO · ${h(club?.name||'Sin club')}</div><h2>Las personas que deciden tu carrera.</h2>
 <div class="v2-vest-grid">
  <section class="v2-panel v2-coach-card"><header><span>ENTRENADOR</span><b>${h(coach?.styleName||'')}</b></header><div class="v2-coach-line big">${avatar(coach?.name)}<div><strong>${h(coach?.name||'—')}</strong><small>${flag(coach?.nationality||s.country)} ${coach?.age||''} años${coach?.since?` · en el cargo desde ${coach.since}`:''}</small></div></div><p>${h(COACH_STYLES[coach?.style]?.description||'')}</p>${meter('Confianza en ti',s.coachTrust??50,'trust')}</section>
  <section class="v2-panel"><header><span>COMPETIDOR DIRECTO</span><b>${h(s.position)}</b></header>${rival?`<div class="v2-duel"><div class="me"><small>TÚ</small><strong>${s.ovr}</strong><em>${s.age} años</em></div><div class="vs">VS</div><div class="them"><small>${h(rival.name)}</small><strong>${rival.ovr}</strong><em>${rival.age} años${rival.signed?' · fichaje':''}${rival.bond?' · amistad':''}</em></div></div><p class="muted">Rol previsto: <b>${h(currentRole(s)||'—')}</b>. La media, la confianza del técnico, su estilo y tus compromisos deciden quién juega.</p>`:'<p class="muted">Sin competidor asignado.</p>'}</section>
  <section class="v2-panel"><header><span>EL CLUB</span><b>${h(trend.label)}</b></header>${meter('Directiva',sq.board??55,'board')}${meter('Hinchada',sq.fans??50,'fans')}<div class="v2-badges">${sq.captain?'<span>C · Capitán</span>':''}${sq.idol?'<span>★ Ídolo</span>':''}${sq.loyal?'<span>♥ Lealtad</span>':''}<span>${sq.seasons||0} temporada(s) en el club</span><span>Prestigio ${dynamicPrestige(s,club)}</span></div>${obj?`<p class="muted">Objetivo de la directiva: <b>${h(obj.board.text)}</b>.</p>`:''}${trend.hist.length?`<div class="v2-trend">${trend.hist.slice(-8).map(([y,p,t])=>`<span title="${y}: ${p}° de ${t}"><i style="height:${Math.max(8,100-(p-1)/(Math.max(2,t)-1)*92)}%"></i><small>${String(y).slice(2)}</small></span>`).join('')}</div>`:''}</section>
  <section class="v2-panel v2-rels"><header><span>RELACIONES</span><b>5</b></header>${relCard('teammate','Compañero de confianza')}${relCard('agent','Representante')}${relCard('press','Periodista de cabecera')}${relCard('family','Familia')}</section>
  <section class="v2-panel v2-memory"><header><span>MEMORIA DE TUS DECISIONES</span><b>${threads.length}</b></header>${threads.length?threads.slice(0,10).map(t=>`<div class="v2-thread-row ${t.resolved?'done':''}"><i>${threadIcon(t.kind)}</i><div><strong>${threadName(t.kind)}</strong><small>${t.year}${t.until&&t.until>t.year?`–${t.until}`:''} · ${t.resolved?h(t.outcome||'cerrado'):'activo'}</small></div></div>`).join(''):'<p class="muted">Tus promesas, desafíos y compromisos quedarán registrados aquí. El juego los recuerda.</p>'}</section>
 </div></section>`;
}

/* ---------- Pantalla: Mundo vivo ---------- */
export function worldView(s,legacy=''){
 const news=(s.world?.news||[]).slice().reverse();
 const lastAw=s.world?.awards?.at(-1);
 const rival=worldRival(s);
 const gen=generationPlayers(s);const top=topPlayers(s,10);const power=powerRanking(s,10);const rising=risingClubs(s,6);
 const playerRow=(p,i)=>`<div class="v2-player-row ${p.rival?'rival':''}"><b>${i+1}</b>${flag(p.cc)}<span><strong>${h(p.name)}${p.rival?' <em>RIVAL</em>':''}</strong><small>${h(POSITION_NAMES[p.pos])} · ${p.age} años · ${h(clubName(p.clubId))}</small></span><i class="tier-${tierOf(p.ovr)}">${p.ovr}</i></div>`;
 return `<section class="focus-card v2-world"><div class="section-label">EL MUNDO DEL FÚTBOL · ${s.world?.year?`ACTUALIZADO A ${s.world.year}`:'TEMPORADA INAUGURAL'}</div><h2>Un mundo que no te espera.</h2><p class="muted">Clubes que suben y se hunden, entrenadores despedidos, promesas que explotan y figuras que se retiran. Todos los futbolistas y técnicos generados son ficticios.</p>
 <div class="v2-world-grid">
  <section class="v2-panel v2-feed"><header><span>NOTICIAS</span><b>${news.length}</b></header><div class="v2-news">${news.slice(0,24).map(newsItem).join('')||'<p class="muted">Las noticias aparecerán al terminar tu primera temporada.</p>'}</div></section>
  <section class="v2-panel"><header><span>${h(AWARD_NAMES.ball)} ${lastAw?.year||''}</span><b>TOP 10</b></header>${lastAw?.ranking?.length?lastAw.ranking.map(r=>`<div class="v2-player-row ${r.you?'you':''}"><b>${r.place}</b>${flag(r.cc||s.country)}<span><strong>${h(r.name)}</strong><small>${h(clubName(r.clubId))}</small></span><i class="tier-${tierOf(r.ovr||80)}">${r.ovr||'—'}</i></div>`).join(''):'<p class="muted">El primer ranking se publica al cerrar la temporada.</p>'}${(()=>{const pr=lastAw?.list?.find(a=>a.id==='promise');return pr?`<div class="v2-promise"><small>${h(AWARD_NAMES.promise)}</small><strong>${h(pr.winner.name)}</strong><em>${h(clubName(pr.winner.clubId))}</em></div>`:'';})()}</section>
  <section class="v2-panel"><header><span>TU GENERACIÓN</span><b>${gen.length}</b></header>${rival&&rival.status==='active'?`<div class="v2-nemesis">${flag(rival.cc)}<div><small>RIVAL GENERACIONAL</small><strong>${h(rival.name)}</strong><em>${h(POSITION_NAMES[rival.pos])} · ${h(clubName(rival.clubId))} · media ${rival.ovr} (tú ${s.ovr})</em></div></div>`:''}${gen.map(playerRow).join('')||'<p class="muted">Sin datos todavía.</p>'}</section>
  <section class="v2-panel"><header><span>LAS FIGURAS DEL MOMENTO</span><b>TOP 10</b></header>${top.map(playerRow).join('')}</section>
  <section class="v2-panel"><header><span>PODER DE CLUBES</span><b>PRESTIGIO</b></header>${power.map((c,i)=>`<div class="v2-club-row"><b>${i+1}</b>${badge(c.id,'tiny')}<span><strong>${h(c.name)}</strong><small>${flag(c.countryCode)} ${h(c.country)}</small></span><i>${c.prestige}</i><em class="${c.d>=1?'up':c.d<=-1?'down':''}">${c.d>=1?'▲':c.d<=-1?'▼':'—'}</em></div>`).join('')}${rising.length?`<div class="v2-subhead">EN MOVIMIENTO</div>${rising.map(c=>`<div class="v2-club-row small">${badge(c.id,'tiny')}<span><strong>${h(c.name)}</strong></span><em class="${c.d>0?'up':'down'}">${c.d>0?'▲':'▼'} ${Math.abs(c.d).toFixed(1)}</em></div>`).join('')}`:''}</section>
 </div>
 <details class="v2-legacy"><summary>Catálogo de países, competiciones y trofeos</summary>${legacy}</details></section>`;
}

/* ---------- Historial: gráfico, récords, hitos ---------- */
export function historyExtras(s){
 const H=s.history||[];if(!H.length)return '';
 const {records,milestones,byClub}=careerRecords(s);
 const w=560,hgt=150,pad=24;const vals=H.map(x=>x.ovrAfter);const pots=H.map(x=>x.potentialAfter||null);
 const min=Math.min(...vals,...H.map(x=>x.ovrBefore))-3,max=Math.max(...vals,...pots.filter(Boolean))+2;
 const X=i=>pad+(H.length===1?w/2:i*(w-pad*2)/(H.length-1)),Y=v=>hgt-pad-(v-min)/(max-min||1)*(hgt-pad*2);
 const line=vals.map((v,i)=>`${i?'L':'M'}${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join(' ');
 const potLine=pots.every(Boolean)?pots.map((v,i)=>`${i?'L':'M'}${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join(' '):'';
 const chart=`<svg class="v2-chart" viewBox="0 0 ${w} ${hgt}" role="img" aria-label="Evolución de la media"><path class="pot" d="${potLine}"/><path class="ovr" d="${line}"/>${vals.map((v,i)=>`<circle cx="${X(i).toFixed(1)}" cy="${Y(v).toFixed(1)}" r="3.2"><title>${H[i].year}: ${v}</title></circle>`).join('')}${H.map((x,i)=>i%Math.ceil(H.length/10)===0?`<text x="${X(i).toFixed(1)}" y="${hgt-6}">${x.year}</text>`:'').join('')}</svg>`;
 return `<div class="v2-history-grid"><section class="v2-panel"><header><span>EVOLUCIÓN DE LA MEDIA</span><b>${H[0].ovrBefore} → ${H.at(-1).ovrAfter}</b></header>${chart}<small class="muted">Línea cobre: media real. Línea punteada: proyección (techo) estimada al cierre de cada año.</small></section>
 <section class="v2-panel"><header><span>RÉCORDS PERSONALES</span><b>${records.length}</b></header>${records.map(r=>`<div class="v2-record"><strong>${h(r.value)}</strong><div><b>${h(r.label)}</b><small>${h(r.detail)}</small></div></div>`).join('')}</section>
 <section class="v2-panel"><header><span>PREMIOS E HITOS</span><b>${(s.awards||[]).length} premios</b></header><div class="v2-milestones">${milestones.map(m=>`<span class="${m.award?'award':''}">${m.award?'★':'◆'} ${h(m.label)}</span>`).join('')||'<p class="muted">Aún sin hitos.</p>'}</div></section>
 <section class="v2-panel"><header><span>POR CLUB</span><b>${byClub.length}</b></header>${byClub.map(c=>`<div class="v2-club-row byclub">${badge(c.clubId,'tiny')}<span><strong>${h(c.club)}</strong><small>${c.seasons} temp. · ${c.titles} títulos</small></span><i>${c.matches} PJ</i><em>${c.goals} G · ${c.assists} A</em></div>`).join('')}</section></div>`;
}

/* ---------- Mercado: contexto y negociación ---------- */
export function offerExtras(s,offer){
 const coach=coachFor(s,offer.id);const trend=clubTrend(s,offer.id);
 const negotiated=offer.negotiated;
 const status=offer.negotiation?`<small class="v2-nego ${offer.negotiation}">${offer.negotiation==='accepted'?'✓ Aceptaron tu pedido':'✗ Mantienen la oferta original'}</small>`:'';
 return `<div class="v2-offer-extra"><small>♟ ${h(coach?.styleName||'')} · ${h(coach?.name||'')} · ${h(trend.label)}</small>${status}${negotiated?'':`<div class="v2-nego-row">${Object.entries(NEGOTIATION_ASKS).map(([k,l])=>`<button type="button" data-action="negotiate" data-id="${h(offer.id)}" data-ask="${k}">${h(l)}</button>`).join('')}</div>`}</div>`;
}
export function negotiationBanner(s){const l=s.lastNegotiation;if(!l)return '';return `<div class="v2-nego-banner ${h(l.result)}">${l.result==='accepted'?'✓':l.result==='withdrawn'?'✗':'•'} ${h(l.text)}</div>`;}
export function renewalExtras(s){const r=s.market?.renewal;if(!r)return '';return `<div class="v2-renewal"><div><small>RENOVACIÓN OFRECIDA</small><strong>${annualSalaryLabel(r.salary)}/año · hasta ${r.ends}</strong><em>Directiva ${Math.round(s.squad?.board??55)}% · ${s.squad?.idol?'Eres ídolo: más margen':'Negociar puede tensar la relación'}</em></div>${r.negotiated?'<span class="v2-nego done">Negociada</span>':btn('Pedir mejora','renewal-negotiate','secondary compact')}</div>`;}

/* ---------- Veredicto del legado al retirarse ---------- */
export function legacyVerdict(s){
 const H=s.history||[];if(!H.length)return null;
 const peak=Math.max(...H.map(x=>x.ovrAfter));const awards=s.awards||[];const balls=awards.filter(a=>a.id==='ball').length;
 const {byClub,caps}=careerRecords(s);const top=byClub[0];const titles=(s.trophies||[]).length;
 if(balls)return {title:'Leyenda mundial',text:`${balls} ${balls>1?'veces elegido':'vez elegido'} mejor futbolista del planeta. Tu nombre entra en la historia grande del fútbol.`};
 if(peak>=86)return {title:'Estrella de élite',text:`Media máxima de ${peak}: compartiste vestuario con los mejores del mundo.`};
 const icon=(s.squad?.idol&&byClub.find(c=>c.clubId===s.squad.clubId))||(top&&top.seasons>=7?top:null);
 if(icon)return {title:`Ídolo de ${icon.club}`,text:`${icon.seasons} temporadas, ${icon.matches} partidos y ${icon.goals} goles con la misma camiseta.`};
 if(titles>=6)return {title:'Coleccionista de títulos',text:`${titles} títulos a lo largo de la carrera.`};
 if(byClub.length>=7)return {title:'Trotamundos',text:`${byClub.length} clubes: el fútbol te llevó por muchos destinos.`};
 if(caps>=20)return {title:'Fiel a la selección',text:`${caps} partidos defendiendo a tu país.`};
 if(peak>=76)return {title:'Profesional de primer nivel',text:`Una carrera sólida con una media máxima de ${peak}.`};
 return {title:'Una vida en el fútbol',text:'No todas las historias terminan en la cima. La tuya se escribió con esfuerzo, cancha y vestuario.'};
}
