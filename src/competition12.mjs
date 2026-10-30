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
export function trophyImage(record){
 const text=String(record?.title||record?.name||'').toLowerCase();
 if(/libertadores/.test(text))return './assets/trophies/real-libertadores.png';
 if(/sudamericana/.test(text))return './assets/trophies/real-sudamericana.png';
 if(/recopa/.test(text))return './assets/trophies/real-recopa.png';
 if(/copa am[eé]rica/.test(text))return './assets/trophies/real-copaamerica.png';
 if(/champions|liga de campeones/.test(text))return './assets/trophies/real-champions.png';
 if(/mundial|world cup/.test(text))return './assets/trophies/real-worldcup.png';
 if(record?.kind==='cup'||/copa/.test(text))return './assets/trophies/cup.png';
 return './assets/trophies/league.png';
}
