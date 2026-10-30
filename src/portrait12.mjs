/* RASCENSO: mostrar los PNG fotográficos reales creados en el despliegue.
   El catálogo es una guía de licencias, no un requisito para que cargue la foto local.
   Si una foto falla, nunca reemplazarla por un retrato inventado. */
export const portraitSlug=name=>String(name||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
let manifestPromise;
const json=async url=>{try{const r=await fetch(url,{cache:'no-cache'});return r.ok?await r.json():{};}catch{return {};}};
export function portraitSources(name,catalog={},media={}){
 const candidate=catalog[name];
 const verified=Array.isArray(media.credits)&&media.credits.some(x=>x.kind==='portrait'&&x.name===name);
 const remote=typeof candidate?.url==='string'&&candidate.url.startsWith('https://upload.wikimedia.org/')?candidate.url:null;
 return verified||remote?[`./assets/portraits/${portraitSlug(name)}.png`,...(remote?[remote]:[])]:[];
}
export function enhanceLegendImages(root){
 if(!root?.querySelectorAll||typeof fetch!=='function'||typeof Image==='undefined')return;
 manifestPromise ||= Promise.all([json('./assets/portrait-catalog.json?v=191'),json('./assets/media12.json?v=191')]);
 void manifestPromise.then(([catalog,media])=>{
  for(const card of root.querySelectorAll('.legend-card[data-portrait-name]')){
   if(card.dataset.photoResolved)return;
   const sources=portraitSources(card.dataset.portraitName,catalog,media);
   if(!sources.length)continue;
   card.dataset.photoResolved='1';
   const img=new Image();img.className='legend-real-photo';img.alt='';img.decoding='async';img.loading='eager';
   img.referrerPolicy='no-referrer';
   let next=0;
   const tryNext=()=>{if(next<sources.length)img.src=sources[next++];else img.remove();};
   img.addEventListener('load',()=>{
    if(!card.isConnected)return;
    card.querySelector('.legend-photo-backdrop')?.appendChild(img);
    card.classList.add('has-licensed-photo');
   },{once:true});
   img.addEventListener('error',tryNext);
   tryNext();
  }
 });
}