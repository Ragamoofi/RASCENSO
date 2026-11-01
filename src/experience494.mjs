/* RASCENSO 4.9.4: ranking histórico, nombres de clubes y estimación de traspasos.
   Entrada estándar: basta con extraer el ZIP. Sin instaladores ni comandos. */
import {primeWorldHighlights493} from './world-highlights493.mjs';
import {primeWorldMetadata494} from './world-metadata494.mjs';
const globalData=Promise.allSettled([primeWorldHighlights493(),primeWorldMetadata494()]);
await import('./experience.mjs?v=498');
const root=document.getElementById('app');
function version(){
 const el=root?.querySelector('.site-head .build');
 if(el&&el.textContent.includes('4.9.2'))el.textContent='RASCENSO 4.9.6 · PLANTILLAS RECUPERADAS';
}
version();
if(root&&typeof MutationObserver!=='undefined'){
 new MutationObserver(version).observe(root,{subtree:true,childList:true});
}
await globalData;
// La importación puede tardar más que el render inicial; actualizar Mundo al terminar.
root?.querySelector('[data-action="nav"][data-tab="mundo"].selected')?.click();
if(root)root.dataset.worldReady='1';
