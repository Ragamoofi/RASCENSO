/* RASCENSO 4.9.3 — Muestra clubes de origen correctos junto a jugadores reales. */
export * from './ui20.mjs?v=492';
import {worldView as oldWorldView,h} from './ui20.mjs?v=492';
import {topPlayers,generationPlayers} from './world20-493.mjs';

export function worldView(state,legacy=''){
 const real=[...topPlayers(state,10),...generationPlayers(state)]
  .filter(p=>p?.kind==='real'&&p.clubName);
 const names=new Map(real.map(p=>[h(p.name),h(p.clubName)]));
 const html=oldWorldView(state,legacy).replace(
  'Todos los futbolistas y técnicos generados son ficticios.',
  'La base mundial contiene futbolistas reales; con el paso de las temporadas también aparecen nuevas promesas ficticias.'
 );
 // Sólo actualiza tarjetas de TOP 10 y Tu generación; no afecta noticias ni otros paneles.
 return html.split(/(?=<div class="v2-player-row )/).map(chunk=>{
  const match=chunk.match(/<strong>([^<]+?)(?=\s*<em>|<\/strong>)/);
  const club=match?names.get(match[1]):null;
  return club?chunk.replace(/(<small>[^<]*? · \d+ años · )—(?= · |<\/small>)/,(_,before)=>before+club):chunk;
 }).join('');
}
