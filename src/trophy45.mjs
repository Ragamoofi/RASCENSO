/* RASCENSO 4.7: catálogo estable y 863 PNG aportados por el usuario. */
import { fmTrophySrc } from './fm-trophy-catalog.mjs';
const normal=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const COUNTRY=/^[a-z]{2}$/;
const LEAGUE_IDS=new Set(['CL1','CL2','BR1','BR2','AR1','EN1','ES1','DE1','IT1','FR1','NL1','PT1','SC1']);
const NAMED_LEAGUES=[
 ['liga de primera','CL1'],['liga de ascenso','CL2'],['brasileirao serie a','BR1'],['brasileirao serie b','BR2'],
 ['liga profesional','AR1'],['premier league','EN1'],['laliga','ES1'],['bundesliga','DE1'],
 ['serie a','IT1'],['ligue 1','FR1'],['eredivisie','NL1'],['primeira liga','PT1'],['scottish premiership','SC1']
];
const MARKED=[
 [/libertadores/,'real-libertadores','Continental','continental.png'],
 [/recopa sudamericana/,'real-recopa','Supercopa','continental.png'],
 [/sudamericana/,'real-sudamericana','Continental','continental.png'],
 [/copa america/,'real-copaamerica','Selecciones','world.png'],
 [/^uefa champions league$|^champions league$|liga de campeones de europa/,'real-champions','Continental','continental.png'],
 [/mundial de la fifa|copa mundial de la fifa|fifa world cup/,'real-worldcup','Mundial','world.png'],
 [/copa del rey/,'real-copadelrey','Copa nacional','cup.png'],
 [/copa chile/,'real-copachile','Copa nacional','cup.png'],
 [/afc champions league elite/,'real-afcchampions','Continental','continental.png'],
 [/caf champions league/,'real-cafchampions','Continental','continental.png']
];
const CONTINENTAL = [
 ['europa league','europa'],['conference league','conference'],['concacaf champions','concacaf'],['afc champions league two','afc2'],
 ['caf confederation','cafconf'],['ofc champions','ofc'],['supercopa de la uefa','superuefa']
];
export function trophyEntries(state){
 const records=Array.isArray(state?.trophyRecords)&&state.trophyRecords.length?state.trophyRecords:null;
 if(records)return records.map(t=>({...t,title:String(t.title||t.name||'Título')})).sort((a,b)=>(+b.year||0)-(+a.year||0));
 const seasons=state?.history||[];
 const fromHistory=seasons.flatMap(y=>(y.titles||[]).map(title=>({title:String(title),year:y.year??null,clubId:y.clubId??null,kind:'league',leagueId:y.leagueId||''})));
 return fromHistory.sort((a,b)=>(+b.year||0)-(+a.year||0));
}
export function trophyIdentity(record,club=null){
 const title=String(record?.title||record?.name||'Título');
 const normalized=normal(title),comp=String(record?.competitionId||record?.leagueId||'');
 const kind=String(record?.kind||'league');
 const country=String(record?.countryCode||club?.countryCode||record?.clubId?.slice(0,2)||'').toLowerCase();
 const safeCountry=COUNTRY.test(country)?country:'generic';
 const qualifiedLeague=LEAGUE_IDS.has(comp)?comp:NAMED_LEAGUES.find(([n])=>normalized.includes(n))?.[1];
 let key='',category='Liga',fallback='league.png';
 if(kind==='club-world-cup'||/mundial de clubes/.test(normalized)){key='club-world';category='Mundial de clubes';fallback='world.png';}
 else {
   const marked=MARKED.find(([pattern])=>pattern.test(normalized));
   if(marked){[,key,category,fallback]=marked;}
   else if(normalized==='champions league'){key='real-champions';category='Continental';fallback='continental.png';}
   else if(kind==='world-cup'){key='real-worldcup';category='Mundial';fallback='world.png';}
   else if(kind==='national-cup'||comp.startsWith('CUP-')){key='cup-'+safeCountry;category='Copa nacional';fallback='cup.png';}
   else if(kind==='supercup'){key='supercup';category='Supercopa';fallback='continental.png';}
   else if(kind==='international'){key='national-'+(comp.startsWith('NAT-')?comp.slice(4).toLowerCase():'generic');category='Selecciones';fallback='world.png';}
   else if(kind==='continental'){const special=CONTINENTAL.find(([term])=>normalized.includes(term));key=special?'continental-'+special[1]:'continental-generic';category='Continental';fallback='continental.png';}
   else if(kind==='league'||qualifiedLeague){key=qualifiedLeague?'league-'+qualifiedLeague.toLowerCase():'league-'+safeCountry;category='Liga';fallback='league.png';}
   else if(normalized.includes('copa')){key='cup-'+safeCountry;category='Copa';fallback='cup.png';}
   else {key='league-'+safeCountry;}
 }
 if(key==='league-en1'){key='real-premier';fallback='league.png';}
 if(key==='league-br1'){key='real-brasileirao';fallback='league.png';}
 if(key==='league-nl1'){key='real-eredivisie';fallback='league.png';}
 const priorSrc='./assets/trophies/'+key+'.png';
 const fmSrc=fmTrophySrc({...record,title});
 return {title,key,category,src:fmSrc||priorSrc,fallback:fmSrc?priorSrc:'./assets/trophies/'+fallback,
  source:fmSrc?'fm-pack':'rascenso-original',year:record?.year??null,clubId:record?.clubId??null};
}
export const trophyImage=record=>trophyIdentity(record).src;
export const trophyImgTag=(record,club=null,className='')=>{
 const info=trophyIdentity(record,club),title=esc(info.title);
 return '<img class="'+className+'" src="'+info.src+'" alt="Trofeo de '+title+'" loading="lazy" decoding="async" onerror="this.onerror=null;this.src=\''+info.fallback+'\'">';
};
export function trophyRail(state,getClub){
 const records=trophyEntries(state);
 return '<section class="trophy-showcase" aria-label="Vitrina de títulos"><div class="rail-heading"><span>VITRINA DE TÍTULOS</span><strong>'+records.length+'</strong></div><div class="trophy-grid" aria-label="Trofeos conseguidos">'+
 (records.length?records.map((r,i)=>{
  const club=getClub?.(r.clubId),info=trophyIdentity(r,club),label=[info.title,r.year??'Año sin registro',club?.name||'Selección o club sin registro'].join(' · ');
  return '<button type="button" class="trophy-unit" data-action="trophy-detail" data-index="'+i+'" aria-label="'+esc(label)+'" title="'+esc(label)+'">'+
  '<span class="trophy-unit-art">'+trophyImgTag(r,club)+'</span><span class="trophy-unit-name">'+esc(info.title)+'</span></button>';
 }).join(''):'<p>Tu primer título tendrá su lugar acá.</p>')+'</div></section>';
}
export function trophyDetail(record,getClub,getCountry){
 const club=getClub?.(record.clubId),info=trophyIdentity(record,club);
 const context=club?.name||getCountry?.(record.countryCode)?.name||'Selección / club sin registro';
 return '<div class="trophy-detail-body"><div class="trophy-detail-head"><span>RASCENSO · PALMARÉS</span><button type="button" data-action="trophy-close" class="trophy-detail-close" aria-label="Cerrar detalle">✕</button></div><div class="trophy-detail-art">'+trophyImgTag(record,club)+'</div>'+
 '<span class="trophy-detail-category">'+esc(info.category)+'</span><h2 id="trophy-modal-title">'+esc(info.title)+'</h2>'+
 '<div class="trophy-detail-facts"><div><small>TEMPORADA</small><strong>'+esc(record.year??'Sin registro')+'</strong></div><div><small>CONSEGUIDO CON</small><strong>'+esc(context)+'</strong></div></div>'+
 '<p>'+(info.source==='fm-pack'?'Trofeo del paquete gráfico proporcionado para RASCENSO. Su nombre se vinculó por identificador de competición o nombre inequívoco; la licencia de redistribución no está verificada.':'Imagen de referencia o ilustración original de RASCENSO; conserva el diseño anterior cuando no hay una equivalencia exacta.')+'</p>'+
 '<a href="./assets/MEDIA_CREDITS.html" target="_blank" rel="noopener">Ver créditos y licencias de imágenes</a></div>';
}
export function trophyRetirementGrid(groups,getClub){
 return groups.slice(0,12).map(g=>{
  const club=getClub?.(g.clubId),info=trophyIdentity(g,club);
  const years=(g.years||[]).slice().reverse();
  const summary=years.length?years.slice(0,3).join(' / ')+(years.length>3?' +'+(years.length-3):''):'Año sin registro';
  const clubs=[...new Set((g.entries||[]).map(t=>getClub?.(t.clubId)?.name||'').filter(Boolean))];
  const detail=[info.title,summary,clubs.join(', ')].filter(Boolean).join(' · ');
  return '<div class="farewell-trophy" title="'+esc(detail)+'"><div class="farewell-trophy-art">'+trophyImgTag(g,club)+'</div>'+
  '<strong>'+esc(info.title)+'</strong><small>'+esc(g.count||1)+' '+((g.count||1)===1?'título':'títulos')+' · '+esc(summary)+'</small>'+
  (clubs.length?'<span class="farewell-trophy-club">'+esc(clubs[0])+(clubs.length>1?' +'+(clubs.length-1):'')+'</span>':'')+'</div>';
 }).join('');
}
