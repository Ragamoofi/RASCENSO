/* Carga equipaciones auténticas provistas/identificadas individualmente.
   Sin entradas verificadas no se muestran camisetas ficticias como oficiales. */
let catalogPromise;
export function officialKitSource(country,catalog={}){
 const file=catalog[String(country||'').toUpperCase()];
 if(typeof file!=='string'||!/^[-a-zA-Z0-9_]+\.(?:png|webp)$/i.test(file))return null;
 return './assets/kits/official/'+file;
}
export function enhanceCountryKit(root){
 const wrap=root?.querySelector?.('.poster-kit-wrap[data-country]');
 if(!wrap||typeof fetch!=='function'||typeof Image==='undefined')return;
 catalogPromise ||= fetch('./assets/kits/official/catalog.json?v=191',{cache:'no-cache'}).then(r=>r.ok?r.json():{}).catch(()=>({}));
 void catalogPromise.then(catalog=>{
  if(!wrap.isConnected)return;
  const path=officialKitSource(wrap.dataset.country,catalog);
  if(!path)return;
  const img=new Image();img.className='country-kit';img.alt='Camiseta de selección '+wrap.dataset.country;
  img.decoding='async';img.addEventListener('load',()=>{
   if(!wrap.isConnected)return;
   wrap.querySelector('.kit-country-seal')?.remove();
   wrap.prepend(img);wrap.classList.add('has-official-kit');
  },{once:true});
  img.src=path;
 });
}