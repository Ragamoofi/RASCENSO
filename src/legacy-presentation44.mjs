/* RASCENSO 4.4 · Relato del retiro anclado en las temporadas registradas. */
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const num=x=>new Intl.NumberFormat('es-CL').format(Number(x)||0);
const n=x=>Number(x)||0;
function score(x,goalkeeper){
 return n(x.rating)*4 + n(x.matches)*.14 + (goalkeeper?n(x.cleanSheets)*2.6:n(x.goals)*2.6+n(x.assists)*1.65)
 + (x.titles||[]).length*7+(x.leaguePosition===1?7:0);
}
export function careerActs(s){
 const history=Array.isArray(s?.history)?s.history:[];
 if(!history.length)return [];
 const first=history[0],last=history.at(-1),keeper=s.position==='POR';
 const peak=history.reduce((a,b)=>score(b,keeper)>score(a,keeper)?b:a,first);
 return [
  {label:'01 / EL ORIGEN',title:'El primer paso',entry:first,body:'El año en que empezó todo.',symbol:'✦'},
  {label:'02 / LA CUMBRE',title:'La gran temporada',entry:peak,body:keeper?'Su temporada más destacada entre los tres palos.':'Su temporada de mayor impacto deportivo.',symbol:'★'},
  {label:'03 / EL LEGADO',title:'El último silbatazo',entry:last,body:'La última camiseta y el cierre de una trayectoria.',symbol:'◆'}
 ].map(a=>({
  ...a,year:Number(a.entry?.year)||0,club:String(a.entry?.club||'Club sin registro'),
  matches:n(a.entry?.matches),goals:n(a.entry?.goals),assists:n(a.entry?.assists),
  cleanSheets:n(a.entry?.cleanSheets),rating:n(a.entry?.rating),titles:(a.entry?.titles||[]).length
 }));
}
export function renderCareerActs(s){
 const keeper=s.position==='POR',acts=careerActs(s);
 if(!acts.length)return '';
 const cards=acts.map((a,i)=>'<article class="legacy-act legacy-act-'+(i+1)+'">'+
   '<div class="legacy-act-top"><span>'+esc(a.label)+'</span><b>'+esc(a.symbol)+'</b></div>'+
   '<div class="legacy-act-year">'+(a.year||'—')+'</div>'+
   '<strong>'+esc(a.title)+'</strong><p>'+esc(a.club)+'</p>'+
   '<div class="legacy-act-metrics"><span>'+num(a.matches)+' PJ</span><span>'+(keeper?num(a.cleanSheets)+' VI':num(a.goals)+' G · '+num(a.assists)+' A')+'</span><span>'+num(a.titles)+' títulos</span></div>'+
   '<small>'+esc(a.body)+'</small></article>').join('');
 return '<section class="farewell-acts" aria-label="Tres capítulos de la trayectoria">'+
  '<div class="legacy-act-heading"><div><span class="farewell-kicker">DEBUT · CONSAGRACIÓN · DESPEDIDA</span><h2>Tres capítulos, una historia</h2></div><span>TRES ACTOS</span></div>'+
  '<div class="legacy-acts">'+cards+'</div></section>';
}
export function careerSignature(s,career){
 const a=career?.a||{},years=career?.history?.length||0;
 const goalkeeper=s.position==='POR',labels=[];
 if(n(a.caps)>=30)labels.push('Referente internacional');
 if(n(a.titles)>=6)labels.push('Coleccionista de títulos');
 if(n(a.clubs?.length)>=6)labels.push('Trotamundos');
 if(n(a.goals)>=140&&!goalkeeper)labels.push('Goleador histórico');
 if(years>=15)labels.push('Longevidad profesional');
 if(n(a.assists)>=100&&!goalkeeper)labels.push('Arquitecto de jugadas');
 if(goalkeeper&&years>=8)labels.push('Guardián de la portería');
 return labels.length?labels.slice(0,3):['Trayectoria profesional'];
}
