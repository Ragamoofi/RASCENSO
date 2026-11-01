/* RASCENSO 4.9.3 — Sustitución por módulo: deja intacto world20 de 4.9.2. */
export * from './world20.mjs?v=492';
import {topPlayers as oldTopPlayers,generationPlayers as oldGenerationPlayers} from './world20.mjs?v=492';
import {worldTopPlayers493,worldGeneration493} from './world-highlights493.mjs';

export function topPlayers(state,limit=12){
 const fromWorld=worldTopPlayers493(state,limit);
 return fromWorld.length?fromWorld:oldTopPlayers(state,limit);
}
export function generationPlayers(state){
 const fromWorld=worldGeneration493(state,12);
 return fromWorld.length?fromWorld:oldGenerationPlayers(state);
}
