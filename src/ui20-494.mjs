import {filterWorldView} from './world-exclusions.mjs';
import {recapExtras as originalRecapExtras} from './ui20-493.mjs';
/* RASCENSO 4.9.4 — Mejora la presentación de rankings y noticias sin modificar
 * partidas guardadas ni reemplazar el motor de simulación. */
export * from './ui20-493.mjs';
import {worldView as originalWorldView} from './ui20-493.mjs';
import {enrichWorld494} from './world-news494.mjs';
import {getWorldMetadata494} from './world-metadata494.mjs';
import {worldClub} from './world20-493.mjs';
import {marketValueEUR} from './career15.mjs';
import {getFM26PlayerById} from './fm26-real.mjs';

export function recapExtras(state){return originalRecapExtras(filterWorldView(state))}
export function worldView(state,legacy=''){
 state=filterWorldView(state);
 const shown=enrichWorld494(state,{
  getMeta:getWorldMetadata494,
  getClub:worldClub,
  getLive:(id,s)=>getFM26PlayerById(id,s)||s?.world?.players?.find(p=>p.id===id)||null,
  marketValue:marketValueEUR
 });
 return originalWorldView(shown,legacy);
}
