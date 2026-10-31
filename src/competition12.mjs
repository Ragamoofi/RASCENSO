/* PNG local de competiciones y trofeos. Los logos libres verificables se obtienen
   durante el despliegue; faltantes: emblema RASCENSO, nunca un logo oficial inventado. */
export const OFFICIAL_COMPETITIONS={
 CL1:'Liga de Primera',CL2:'Liga de Ascenso',BR1:'Brasileirão Série A',BR2:'Brasileirão Série B',AR1:'Liga Profesional',
 EN1:'Premier League',ES1:'LaLiga EA Sports',DE1:'Bundesliga',IT1:'Serie A',FR1:'Ligue 1',NL1:'Eredivisie',PT1:'Primeira Liga',SC1:'Scottish Premiership'
};
export const WORLD_TROPHIES=[
 {key:'libertadores',name:'Copa Libertadores',region:'CONMEBOL'},
 {key:'sudamericana',name:'Copa Sudamericana',region:'CONMEBOL'},
 {key:'recopa',name:'Recopa Sudamericana',region:'CONMEBOL'},
 {key:'copaamerica',name:'Copa América',region:'CONMEBOL'},
 {key:'champions',name:'Champions League',region:'UEFA'},
 {key:'worldcup',name:'Copa Mundial de la FIFA',region:'FIFA'},
];
export const competitionLogo = id => OFFICIAL_COMPETITIONS[id]?`./assets/competitions/${id}.png`:null;
export {trophyImage} from './trophy45.mjs';
