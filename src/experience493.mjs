/* Entrada de RASCENSO 4.9.3. Sin instalador ni modificación de partidas. */
import {primeWorldHighlights493} from './world-highlights493.mjs';
// Iniciar la lectura mundial a la vez que la carga normal del juego.
const pending=primeWorldHighlights493().catch(()=>false);
await import('./experience.mjs?v=492');
const root=document.getElementById('app');
const updateVersion=()=>{
 const label=root?.querySelector('.site-head .build');
 if(label&&label.textContent.includes('4.9.2'))
  label.textContent='RASCENSO 4.9.3 · MUNDO REAL CORREGIDO';
};
updateVersion();
if(root&&typeof MutationObserver!=='undefined'){
 const observer=new MutationObserver(updateVersion);
 observer.observe(root,{subtree:true,childList:true});
}
if(await pending){
 // Si Mundo se está viendo durante la carga, actualiza las listas sin reiniciar la partida.
 root?.querySelector('[data-action="nav"][data-tab="mundo"].selected')?.click();
}
