/* RASCENSO 4.6 — Estadísticas de la selección basadas en partidos y temporadas guardadas.
   El historial NO registra titularidades ni notas por encuentro de selección:
   se muestran solo las cifras verificables, sin fabricar datos. */
import {trophyImgTag} from './trophy45.mjs';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\u0027':'&#39;'}[c]));
const fmt=v=>new Intl.NumberFormat('es-CL').format(Number(v)||0);
const kinds=new Set(['qualifiers','international','world-cup','friendly']);
export function clubSeasonTrophies(state,season){
 const year=Number(season.year),clubId=String(season.clubId||'');
 const official=(state?.trophyRecords||[]).filter(t=>t&&Number(t.year)===year&&String(t.clubId||'')===clubId);
 const records=official.length?official:(season.titles||[]).filter(t=>{
  const name=String(t||'');
  return !/(copa mundial|copa america|eurocopa|selecci[oó]n|copa oro|copa asi[aá]tica|copa africana)/i.test(name);
 }).map(title=>({title,year,clubId,kind:'league',leagueId:season.leagueId}));
 return records.map(t=>({title:String(t.title||t.name||'Título'),record:t}));
}
export function clubSeasonTrophiesHTML(state,season){
 const entries=clubSeasonTrophies(state,season);
 if(!entries.length)return '';
 const visible=entries.slice(0,4);
 return '<span class="history-season-trophies" aria-label="'+entries.length+' título(s) en '+esc(season.year)+'">'+
 visible.map(t=>'<span class="history-mini-cup" title="'+esc(t.title)+'">'+trophyImgTag(t.record)+'</span>').join('')+
 (entries.length>4?'<span class="history-cup-more" title="'+esc(entries.slice(4).map(t=>t.title).join(', '))+'">+'+(entries.length-4)+'</span>':'')+
 '</span>';
}
export function selectionReport(state){
 const seasons=Array.isArray(state?.history)?state.history:[];
 const groups=new Map(),years=new Set(),titles=[],fixtures=[];
 let caps=0,goals=0,assists=0,minutes=0,hasMinutes=false,hasAssists=false;
 for(const y of seasons){
  const cups=(y.competitions||[]).filter(c=>kinds.has(c?.kind));
  const played=cups.reduce((s,c)=>s+(Number(c.played)||0),0);
  const seasonCaps=Number.isFinite(Number(y.nationalCaps))?Number(y.nationalCaps):played;
  const seasonGoals=Number.isFinite(Number(y.nationalGoals))?Number(y.nationalGoals):cups.reduce((s,c)=>s+(Number(c.goals)||0),0);
  caps+=Math.max(0,seasonCaps);goals+=Math.max(0,seasonGoals);
  if(seasonCaps>0||cups.some(c=>c.played>0))years.add(y.year);
  for(const c of cups){
   const p=Number(c.played)||0,g=Number(c.goals)||0,a=Number(c.assists),m=Number(c.minutes);
   if(Number.isFinite(a)){assists+=a;hasAssists=true;}
   if(Number.isFinite(m)){minutes+=m;hasMinutes=true;}
   if(c.championWon)titles.push({title:String(c.name||'Título internacional'),year:y.year,kind:c.kind});
   const name=String(c.name||'Competición internacional');
   const row=groups.get(name)||{name,kind:c.kind,editions:0,matches:0,goals:0,assists:0,championships:0,years:[]};
   row.editions++;row.matches+=p;row.goals+=g;row.assists+=Number.isFinite(a)?a:0;row.championships+=c.championWon?1:0;row.years.push(y.year);groups.set(name,row);
   for(const f of c.playerFixtures||[])if(f.playerPlayed)fixtures.push({...f,competition:name,year:y.year});
  }
 }
 let wins=0,draws=0,losses=0,cleanSheets=0,teamAgainst=0,teamFor=0,scoredGames=0,matchMinutes=0,trackedMinutes=0;
 const country=String(state?.country||'');
 for(const f of fixtures){
  const score=/^(\d+)\s*[-–:]\s*(\d+)$/.exec(String(f.score||''));
  const home=String(f.home||'')===country,away=String(f.away||'')===country;
  if(!score||(!home&&!away))continue;
  const own=Number(score[home?1:2]),rival=Number(score[home?2:1]);
  if(own>rival)wins++;else if(own===rival)draws++;else losses++;
  if(rival===0)cleanSheets++;
  teamAgainst+=rival;teamFor+=own;scoredGames++;
  if(Number.isFinite(Number(f.playerMinutes))&&f.playerMinutes!=null){trackedMinutes+=Number(f.playerMinutes);matchMinutes++;}
 }
 return {country,caps,goals,assists:hasAssists?assists:null,minutes:hasMinutes?minutes:null,
  years:[...years].filter(x=>x!=null).sort((a,b)=>a-b),titles,
  wins,draws,losses,cleanSheets,teamAgainst,teamFor,scoredGames,
  entries:[...groups.values()].sort((a,b)=>b.matches-a.matches||b.editions-a.editions),
  hasFixtures:scoredGames>0,fixtures:fixtures.length,
  yearMinutes:matchMinutes,trackedMinutes};
}
export function selectionPanel(state,getCountry,flag){
 const s=selectionReport(state);
 if(!s.caps&&!s.entries.some(x=>x.matches))return '';
 const countryName=getCountry?.(s.country)?.name||s.country||'Selección nacional';
 const stat=(name,v,detail='')=>'<div class="selection-stat"><strong>'+esc(v)+'</strong><span>'+name+'</span>'+(detail?'<small>'+detail+'</small>':'')+'</div>';
 const result=s.hasFixtures?fmt(s.wins)+' / '+fmt(s.draws)+' / '+fmt(s.losses):'—';
 const summary=stat('PARTIDOS',fmt(s.caps))+stat('GOLES',fmt(s.goals))+stat('ASISTENCIAS',s.assists==null?'—':fmt(s.assists))+
  stat('MINUTOS',s.minutes==null?'—':fmt(s.minutes))+stat('VICTORIAS / EMP. / DER.',result)+stat('TÍTULOS',fmt(s.titles.length))+
  stat('TEMPORADAS CONVOCADO',fmt(s.years.length))+stat('COMPETICIONES',fmt(s.entries.length));
 const extra=s.hasFixtures?'<p class="selection-extra">En '+fmt(s.scoredGames)+' partidos con resultado registrado: '+fmt(s.teamFor)+' goles a favor, '+fmt(s.teamAgainst)+' en contra y '+fmt(s.cleanSheets)+' porterías a cero del equipo. Marcadores de tiempo reglamentario.</p>':'<p class="selection-extra">El guardado registra convocatorias, pero no todos los resultados individuales de esos partidos.</p>';
 const goalkeeper=String(state?.position)==='POR'&&s.hasFixtures?'<p class="selection-extra">ARQUERO · '+fmt(s.cleanSheets)+' partidos sin recibir goles del equipo (no implica que disputaras los 90 minutos).</p>':'';
 const cupHtml=s.titles.length?'<div class="selection-honours"><b>TÍTULOS CON LA SELECCIÓN</b><div>'+s.titles.map(t=>'<span>🏆 '+esc(t.title)+' · '+esc(t.year)+'</span>').join('')+'</div></div>':'';
 const rows=s.entries.map(t=>'<div class="selection-competition"><span><strong>'+esc(t.name)+'</strong><small>'+fmt(t.editions)+' ediciones · '+esc(t.years.join(' / '))+'</small></span><b>'+fmt(t.matches)+' PJ</b><b>'+fmt(t.goals)+' G</b><b>'+fmt(t.assists)+' A</b></div>').join('');
 return '<section class="selection-report" aria-label="Estadísticas de la selección"><div class="selection-report-head">'+
 '<div class="selection-title">'+(flag?flag(s.country):'🌍')+'<div><span>TRAYECTORIA INTERNACIONAL</span><h3>Mi selección · '+esc(countryName)+'</h3></div></div>'+
 '<b>'+fmt(s.caps)+' INTERNACIONALIDADES</b></div>'+
 '<div class="selection-stats">'+summary+'</div>'+extra+goalkeeper+cupHtml+
 '<details class="selection-competitions"><summary>DESGLOSE POR COMPETICIÓN <b>'+s.entries.length+' torneos</b></summary>'+
 '<div class="selection-competition-list">'+rows+'</div></details>'+
 '<p class="selection-footnote">Datos de las temporadas disputadas. Las titularidades, notas por partido y otras métricas que no guarda el motor no se estiman.</p></section>';
}
