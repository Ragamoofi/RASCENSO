/* Retratos con permiso verificable de Wikimedia Commons: PNG local primero;
   si la compilación no logró descargar la foto, se intenta con la URL licenciada
   sólo para las tres cartas visibles. Nunca se carga una foto no verificada. */
let photoManifestPromise;
export function enhanceLegendImages(root){
 if(!root?.querySelectorAll||typeof fetch==='undefined'||typeof Image==='undefined')return;
 photoManifestPromise ||= fetch('./assets/portrait-catalog.json',{cache:'force-cache'})
  .then(r=>r.ok?r.json():{}).catch(()=>({}));
 void photoManifestPromise.then(index=>{
  for(const card of root.querySelectorAll('.legend-card[data-portrait-name]')){
   const entry=index[card.dataset.portraitName],src=entry?.url;
   if(!src||!src.startsWith('https://upload.wikimedia.org/')||card.dataset.photoResolved)return;
   card.dataset.photoResolved='1';
   const img=new Image();img.className='legend-real-photo legend-network-photo';img.alt='';
   img.loading='lazy';img.decoding='async';img.referrerPolicy='no-referrer';
   img.addEventListener('load',()=>{
    if(card.isConnected)card.querySelector('.legend-photo-backdrop')?.appendChild(img);
   },{once:true});
   img.src=src;
  }
 });
}