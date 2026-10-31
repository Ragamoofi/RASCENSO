/* RASCENSO 4.2: retiro y legado con cifras tomadas del historial real. */
import {careerAchievements,careerHeadline} from './career15.mjs';
import {renderCareerActs,careerSignature} from './legacy-presentation44.mjs';
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const n=x=>new Intl.NumberFormat('es-CL').format(Number(x)||0);
const year=x=>Number.isFinite(+x)?+x:'—';
export function retirementData(s){
 const a=careerAchievements(s),history=s.history||[],clubs=[...a.clubs].sort((x,y)=>y.matches-x.matches);
 const best=history.reduce((b,x)=>{
  const score=y=>(+y.matches||0)*.15+(+y.rating||0)*5+(+y.goals||0)*2+(+y.assists||0)*1.5+(y.titles||[]).length*6+(y.leaguePosition===1?8:0);
  return !b||score(x)>score(b)?x:b;
 },null);
 const trophies=[...a.titles].reverse(),unique=new Map();
 for(const t of trophies){const k=String(t.name||'').trim();if(!k)continue;const v=unique.get(k)||{...t,years:[],count:0};v.count++;if(t.year!=null)v.years.push(t.year);unique.set(k,v);}
 const highlights=(s.careerMoments||[]).filter(x=>x.text&&(
 x.kind==='award'||x.kind==='on-field'&&/¡gol!|asistencia de gol|evitaste el gol rival/i.test(x.text)||
 x.kind==='story'&&/Ganaste|cumplid|consagraste|récord/i.test(x.text)
 )).slice(-7).reverse();
 const rivals=new Map();
 for(const y of history)for(const p of y.plays||[]){
  if(!p?.rival)continue;const name=String(p.rival),v=rivals.get(name)||{name,duels:0,successes:0,years:new Set()};
  v.duels++;v.successes+=p.success?1:0;v.years.add(y.year);rivals.set(name,v);
 }
 const rivalries=[...rivals.values()].sort((x,y)=>y.duels-x.duels||y.successes-x.successes).slice(0,4);
 const awards=(s.awards||[]).slice(-6).reverse();
 const first=history[0],last=history.at(-1);
 const most=clubs[0],peak=Math.max(0,...history.map(x=>+x.ovrAfter||0));
 const stature=trophies.length>=10||a.goals>=300||a.caps>=65?'UNA LEYENDA':trophies.length>=4||a.goals>=100||a.caps>=20?'CARRERA MEMORABLE':'UNA VIDA EN EL FÚTBOL';
 const hero=[trophies.length?`${n(trophies.length)} títulos`:'',a.goals?`${n(a.goals)} goles`:'',a.caps?`${n(a.caps)} partidos internacionales`:''].filter(Boolean).slice(0,2).join(' · ');
 return {a,history,clubs,best,trophies,unique:[...unique.values()],highlights,rivalries,awards,first,last,most,peak,stature,hero};
}
function chart(h){
 const all=h.map(y=>+y.ovrAfter).filter(Number.isFinite);
 if(!all.length)return '';
 const min=Math.min(...all)-5,max=Math.max(...all)+5;
 const points=all.map((v,i)=>`${30+940*(all.length===1?.5:i/(all.length-1))},${117-90*(v-min)/(max-min)}`).join(' ');
 return `<div class="farewell-curve"><svg role="img" aria-label="Evolución de la media de ${n(all[0])} a ${n(all.at(-1))}, con pico de ${n(Math.max(...all))}" viewBox="0 0 1000 140" preserveAspectRatio="none">
 <defs><linearGradient id="farewell-line"><stop stop-color="#8bc2ce"/><stop offset="1" stop-color="#f4ba82"/></linearGradient></defs>
 <path d="M30 117H970M30 72H970M30 27H970" stroke="#ffffff" stroke-opacity=".15" fill="none" stroke-dasharray="5 7"/>
 <polyline points="${points}" fill="none" stroke="url(#farewell-line)" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
 </svg><div class="farewell-curve-caption"><span>DEBUT ${year(h[0]?.year)} · ${n(all[0])} MED</span><span>PICO · ${n(Math.max(...all))} MED</span><span>RETIRO ${year(h.at(-1)?.year)} · ${n(all.at(-1))} MED</span></div></div>`;
}
export function retirementView(s,{badge,trophyImage,flag,dreamProgress,button}){
 const d=retirementData(s),a=d.a,club=d.last?.club||d.most?.name||'Fútbol profesional';
 const signature=careerSignature(s,d);
 const stat=(value,label)=>`<div class="farewell-stat"><b>${n(value)}</b><small>${label}</small></div>`;
 const goalkeeping=s.position==='POR';
 const cleanSheets=d.history.reduce((total,y)=>total+(Number(y.cleanSheets)||0),0);
 const goalsConceded=d.history.reduce((total,y)=>total+(Number(y.goalsConceded)||0),0);
 const stats=goalkeeping?[
  [a.matches,'PARTIDOS'],[cleanSheets,'VALLAS INVICTAS'],[goalsConceded,'GOLES RECIBIDOS'],
  [d.trophies.length,'TÍTULOS'],[a.caps,'SELECCIÓN'],[d.peak,'MEJOR MEDIA']
 ]:[
  [a.matches,'PARTIDOS'],[a.goals,'GOLES'],[a.assists,'ASISTENCIAS'],
  [d.trophies.length,'TÍTULOS'],[a.caps,'SELECCIÓN'],[d.peak,'MEJOR MEDIA']
 ];

 const clubs=d.clubs.map((c,i)=>`<div class="farewell-club"><span class="farewell-numeral">${String(i+1).padStart(2,'0')}</span>${badge(c.id,'large')}<div><strong>${esc(c.name)}</strong><small>${year(Math.min(...c.years))}–${year(Math.max(...c.years))} · ${c.years.length} temporada${c.years.length===1?'':'s'}</small></div><b>${n(c.matches)} PJ</b></div>`).join('');
 const trophies=d.unique.slice(0,12).map(t=>`<div class="farewell-trophy"><img src="${esc(trophyImage({title:t.name,kind:t.kind}))}" alt="" loading="lazy"><strong>${esc(t.name)}</strong><small>${n(t.count)} veces · ${esc(t.years.slice().reverse().slice(0,4).join(' / ')||'Año sin registro')}</small></div>`).join('');
 const memories=d.highlights.slice(0,6).map((m,i)=>`<div class="farewell-memory"><b>${String(i+1).padStart(2,'0')}</b><div><small>${esc(m.year||'—')}</small><p>${esc(m.text)}</p></div></div>`).join('');
 const rivals=d.rivalries.map(r=>`<div class="farewell-rival"><strong>${esc(r.name)}</strong><span>${n(r.duels)} momentos decisivos · ${n(r.successes)} favorables</span><small>${n(r.years.size)} temporadas</small></div>`).join('');
 const awards=d.awards.map(m=>`<div class="farewell-award">✦ <strong>${esc(m.title||m.name||m.type||'Reconocimiento')}</strong> <span>${esc(m.year||'')}</span></div>`).join('');
 const dream=dreamProgress(s);
 const dreamHtml=dream?`<div class="farewell-dream"><span>${dream.done?'★':'◇'}</span><div><small>${dream.done?'SUEÑO CUMPLIDO':'SUEÑO PENDIENTE'}</small><b>${esc(dream.title)}</b></div></div>`:'';
 const summary=`${esc(s.name)} se retiró tras ${n(d.history.length)} temporadas y ${n(a.matches)} partidos profesionales.${d.most?' Su etapa más extensa fue en '+esc(d.most.name)+', donde disputó '+n(d.most.matches)+' encuentros.':''} ${d.hero?esc(d.hero)+'. ':''}Su último club fue ${esc(club)}.`;
 return `<div class="farewell-page">
 <section class="farewell-hero" aria-label="Homenaje de carrera"><div class="farewell-hero-top"><span>RASCENSO · DEL BARRIO A LA HISTORIA</span><span>${flag(s.country)} · ${esc(s.position)} · #${n(s.number)}</span></div>
 <div class="farewell-hero-row"><div class="farewell-hero-text"><span class="farewell-kicker">EL ÚLTIMO SILBATAZO · ${year(d.last?.year)}</span>
 <h1>EL ÚLTIMO<em>SILBATAZO.</em></h1><p class="farewell-name">${esc(s.name)}</p><p>${esc(careerHeadline(s))}</p>
 <div class="farewell-hero-badges"><span>${d.stature}</span><span>${year(d.first?.year)} — ${year(d.last?.year)}</span><span>${n(d.clubs.length)} clubes</span></div><div class="farewell-signatures">${signature.map(x=>`<span>✦ ${esc(x)}</span>`).join('')}</div>
 </div><div class="farewell-medallion"><span>✦</span><strong>${n(d.history.length)}</strong><small>TEMPORADAS<br>DE HISTORIA</small></div></div>
 <div class="farewell-hero-foot"><span>ÚLTIMA CAMISETA</span><b>${esc(club)}</b>${d.last?.clubId?badge(d.last.clubId,'large'):''}</div></section>
 ${renderCareerActs(s)}
 <section class="farewell-numbers"><div><span class="farewell-kicker">LOS NÚMEROS DE TU HISTORIA</span><h2>La huella que dejaste</h2></div>
 <div class="farewell-stats">${stats.map(([value,label])=>stat(value,label)).join('')}</div></section>
 <div class="farewell-content"><div class="farewell-main">
 <section class="farewell-section farewell-tribute"><span class="farewell-kicker">EL VEREDICTO FINAL</span><h2>${esc(careerHeadline(s))}</h2><p>${summary}</p><div class="farewell-dates"><span>DEBUT · ${year(d.first?.year)}</span><span>RETIRO · ${year(d.last?.year)} · ${n(s.age)} AÑOS</span></div>${dreamHtml}</section>
 <section class="farewell-section"><div class="farewell-section-head"><span class="farewell-kicker">EL CAMINO RECORRIDO</span><b>${n(d.clubs.length)} CLUBES</b></div><h2>Las camisetas de tu vida</h2><div class="farewell-clubs">${clubs||'<p>Sin clubes registrados.</p>'}</div></section>
 <section class="farewell-section"><div class="farewell-section-head"><span class="farewell-kicker">DE TEMPORADA EN TEMPORADA</span><b>${n(d.history.length)} AÑOS</b></div><h2>La evolución de tu talento</h2>${chart(d.history)}
 ${d.best?`<div class="farewell-best"><span>★ TEMPORADA DESTACADA</span><b>${year(d.best.year)} · ${esc(d.best.club)}</b><small>${n(d.best.matches)} PJ · ${n(d.best.goals)} G · ${n(d.best.assists)} A · ${(d.best.titles||[]).length} títulos</small></div>`:''}</section></div>
 <div class="farewell-side"><section class="farewell-section"><div class="farewell-section-head"><span class="farewell-kicker">EL PALMARÉS</span><b>${n(d.trophies.length)} COPAS</b></div><h2>La sala de trofeos</h2><div class="farewell-trophies">${trophies||'<p>No ganaste títulos, pero tu carrera también tiene una historia que contar.</p>'}</div></section>
 <section class="farewell-section"><span class="farewell-kicker">LOS MOMENTOS QUE QUEDAN</span><h2>Recuerdos de cancha</h2><div class="farewell-memories">${memories||'<p>Las temporadas y resultados registran tu camino.</p>'}</div></section>
 ${rivals?`<section class="farewell-section"><span class="farewell-kicker">ADVERSARIOS DE TU HISTORIA</span><h2>Rivales inolvidables</h2><div class="farewell-rivals">${rivals}</div></section>`:''}

 ${awards?`<section class="farewell-section"><span class="farewell-kicker">RECONOCIMIENTOS</span><h2>Premios individuales</h2><div class="farewell-awards">${awards}</div></section>`:''}
 </div></div>
 <section class="farewell-outro"><span class="farewell-kicker">FIN DEL CAMINO PROFESIONAL</span><h2>Las estadísticas terminan.<em>La historia permanece.</em></h2><p>De ${esc(d.first?.club||'tu primer equipo')} a ${esc(club)}. ${n(a.matches)} partidos que ya son parte de tu historia.</p>
 <div class="farewell-actions">${button('Guardar recuerdo PNG','share-png','main')}${button('Exportar carrera','export','secondary')}${button('Ver historial completo','nav','ghost','data-tab="historial"')}${button('Crear nuevo futbolista','reset','ghost')}</div>
 <small>RASCENSO · Una creación de Ragamoofi · Simulador independiente</small></section></div>`;
}
