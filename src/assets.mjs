import { COUNTRIES } from './countries.mjs';
// Recursos decorativos: escudos de terceros sólo donde existe una URL reconocida;
// distintivo original de respaldo en caso de error o falta de imagen.
const CRESTS = {
'Arsenal':57,'Chelsea':61,'Liverpool':64,'Manchester City':65,'Manchester United':66,
'Tottenham':73,'Everton':62,'Newcastle United':67,'Aston Villa':58,'Leicester City':338,
'West Ham United':563,'Fulham':63,'Crystal Palace':354,'Brighton':397,'Wolverhampton':76,'Brentford':402,'Bournemouth':1044,'Nottingham Forest':351,
'Real Madrid':86,'Barcelona':81,'Atlético de Madrid':78,'Athletic Club':77,'Sevilla':559,'Valencia':95,'Villarreal':94,'Real Betis':90,'Real Sociedad':92,'Celta de Vigo':558,'Getafe':82,'Osasuna':79,
'Bayern Múnich':5,'Borussia Dortmund':4,'Bayer Leverkusen':3,'RB Leipzig':721,'Eintracht Frankfurt':19,'Stuttgart':10,'Werder Bremen':12,'Wolfsburgo':11,'Friburgo':17,
'Inter de Milán':108,'Milan':98,'Juventus':109,'Napoli':113,'Roma':100,'Lazio':110,'Atalanta':102,'Fiorentina':99,'Bologna':103,
'Paris Saint-Germain':524,'Marsella':516,'Lyon':523,'Mónaco':548,'Lille':521,'Rennes':529,'Niza':522,
'Porto':503,'Benfica':1903,'Sporting CP':498,'Braga':5613,
'Ajax':678,'PSV':674,'Feyenoord':675,'AZ Alkmaar':682,'Twente':666,
'Galatasaray':610,'Fenerbahçe':611,'Beşiktaş':607,
};
const COUNTRY_SLUG={AR:'argentina',BO:'bolivia',BR:'brazil',CL:'chile',CO:'colombia',EC:'ecuador',PY:'paraguay',PE:'peru',UY:'uruguay',VE:'venezuela',MX:'mexico',CN:'china',US:'usa',CR:'costa-rica',ES:'spain',EN:'england',DE:'germany',IT:'italy',FR:'france',PT:'portugal',NL:'netherlands',BE:'belgium',TR:'turkey',HR:'croatia',CH:'switzerland',AT:'austria',SC:'scotland',GR:'greece',RS:'serbia',CZ:'czech-republic',PL:'poland',UA:'ukraine',SE:'sweden',NO:'norway',DK:'denmark',JP:'japan',KR:'south-korea',AU:'australia',SA:'saudi-arabia',QA:'qatar',IR:'iran',MA:'morocco',EG:'egypt',SN:'senegal',NG:'nigeria',DZ:'algeria',GH:'ghana',CM:'cameroon',TN:'tunisia'};
let logoIndex={};
const mark=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
const OVERRIDES={
 'cl:deportes la serena':'La_Serena.svg','cl:colo-colo':'Colo_Colo.svg','ar:argentinos juniors':'Argeninos_Juniors.svg',
 'ar:huracán':'CA_Huracán.svg','ar:belgrano de córdoba':'Belgrano.svg','ar:rosario central':'Rosario_Central.svg'
};
function crestURL(club){
  const code=club.countryCode||club.id?.slice(0,2).toUpperCase();
  const files=logoIndex[code]||[];if(!files.length)return null;
  const override=OVERRIDES[`${code.toLowerCase()}:${club.name.toLowerCase()}`];
  const nameKey=mark(club.name);
  let file=override&&files.includes(override)?override:files.find(f=>mark(f.replace(/\.svg$/i,''))===nameKey);
  if(!file){const shortened=nameKey.replace(/(fc|sc|club|deportes|universidad)$/g,'');file=files.find(f=>mark(f.replace(/\.svg$/i,''))===shortened);}
  return file?`https://raw.githubusercontent.com/JoseArroyave/football-logos/main/logos/${COUNTRY_SLUG[code]}/${encodeURIComponent(file)}`:null;
}
// Los escudos se cargan de forma diferida; la interfaz muestra siempre un emblema propio de respaldo.
if(typeof fetch!=='undefined')Promise.all([1,2,3,4].map(i=>fetch(`./assets/logos-${i}.json`).then(r=>r.ok?r.json():{}).catch(()=>({})))).then(parts=>{
 const index=Object.assign({},...parts);
 logoIndex=index||{};
 document.querySelectorAll('.team-badge[data-team-id]').forEach(node=>{
  if(node.querySelector('.badge-img'))return;
  const club=COUNTRIES.flatMap(c=>c.clubs.map(x=>({...x,countryCode:c.code}))).find(c=>c.id===node.dataset.teamId);
  const src=club&&crestURL(club);
  if(src){const img=document.createElement('img');img.className='badge-img';img.alt='';img.loading='lazy';img.decoding='async';img.src=src;img.addEventListener('error',()=>img.remove(),{once:true});node.appendChild(img);}
 });
}).catch(()=>{});
function letters(name){return String(name||'FC').split(/\s+/).filter(w=>!['de','da','do','del','la','el','fc','club','ac'].includes(w.toLowerCase())).slice(0,2).map(w=>w[0]).join('').toUpperCase()||'FC';}
function hue(str){let value=7;for(const c of String(str))value=(value*31+c.charCodeAt(0))%360;return value;}
export function flag(code,cls='flag'){
 const iso={EN:'gb-eng',SC:'gb-sct' }[code]||String(code||'CL').toLowerCase();
 const fallback=''; // Sin emoji de letras superpuesto: la bandera verdadera viene en PNG.
 return `<span class="${cls}" title="${code}"><span>${fallback}</span><img src="https://flagcdn.com/w80/${iso}.png" loading="lazy" alt="" decoding="async" onload="this.previousElementSibling.style.display='none'" onerror="this.remove()"></span>`;
}
export function badge(club, size=''){
 const c=typeof club==='string'?COUNTRIES.flatMap(x=>x.clubs).find(x=>x.id===club):club;
 const name=c?.name||'Club',code=c?.countryCode||c?.id?.slice(0,2).toUpperCase()||'CL';
 const id=c?.id||'';const known=COUNTRIES.find(x=>x.code===code);
 const src=id==='cl-1'?'https://assets.footylogos.com/logos/colo-colo/colo-colo-logo-footylogos.svg':(id?`./assets/crests/${encodeURIComponent(id)}.png`:null);
 const accent=hue(name);
 return `<span class="team-badge ${size}" data-team-id="${id}" style="--badge-hue:${accent}" title="${name.replaceAll('"','&quot;')}"><span class="badge-fallback">${letters(name)}</span>${src?`<img class="badge-img" src="${src}" loading="lazy" alt="Escudo de ${name.replaceAll('&','&amp;').replaceAll('"','&quot;')}" decoding="async" onerror="this.remove()">`:''}</span>`;
}
export const CATALOG_COUNT=COUNTRIES.reduce((n,c)=>n+c.clubs.length,0);
