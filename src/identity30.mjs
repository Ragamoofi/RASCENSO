/* RASCENSO 3.1 · Identidad del futbolista.
 * Une en un solo lugar TODAS las elecciones del creador y su efecto real en la carrera:
 *  - choiceFx(s): efectos numéricos nuevos de cada elección (origen, entorno, desarrollo, carácter, estilo,
 *    fortaleza, debilidad, sueño, pierna hábil, edad de inicio). Los efectos que ya existían en career08/archetypes17
 *    se describen en las fichas (chips) pero NO se aplican dos veces.
 *  - ADN de los legados: cada referente pertenece a una familia de juego; las 8 influencias elegidas
 *    determinan un ADN dominante (y uno secundario) con rasgo propio, techos y modificadores.
 *  - Sueños: cada sueño tiene una meta medible con recompensa.
 * Funciones puras y deterministas. No importa el motor (evita ciclos): engine/league/plays30 lo consumen.
 */
import { DRAFT_REFERENTS } from './draft09.mjs';
import { classesFor } from './archetypes17.mjs';
import { marketClub, clubPrestige } from './market.mjs';

const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
export const KEYS=['pace','shot','pass','dribble','defense','physical'];
export const ATTR_LABEL={pace:'Ritmo',shot:'Tiro',pass:'Pase',dribble:'Regate',defense:'Defensa',physical:'Físico',skills:'Filigranas',weak:'Pierna mala'};

/* ====================================================================== */
/* 1 · Familias de juego (ADN) de los referentes                           */
/* ====================================================================== */
export const DNA_TAGS={
 finalizador:{name:'Killer del área',icon:'◎',trait:'Instinto de gol',blurb:'Vive de la definición: aparece donde cae el balón.',
  fx:{goals:1.05},ceil:{shot:2,physical:1},cost:{assists:.97},positions:['DC','EI','ED','MCO'],attrs:['shot','physical']},
 creador:{name:'Cerebro creativo',icon:'✦',trait:'Visión periférica',blurb:'Ve el pase antes de que exista. El juego pasa por sus pies.',
  fx:{assists:1.07,passNoise:.9},ceil:{pass:2,dribble:1},cost:{goals:.97},positions:['MCO','MC','MI','MD'],attrs:['pass','dribble']},
 regateador:{name:'Gambeta pura',icon:'↯',trait:'Cintura de potrero',blurb:'Uno contra uno sin miedo: el regate es su idioma.',
  fx:{feint:.14,goals:1.02},ceil:{dribble:2,pace:1},cost:{injury:1.05},positions:['EI','ED','MCO','DC','LI','LD'],attrs:['dribble','pace']},
 velocista:{name:'Cohete',icon:'➤',trait:'Aceleración explosiva',blurb:'Gana carreras que otros ni intentan. El tiempo, sin embargo, le cobra la velocidad.',
  fx:{injury:1.06,sprint:.5},ceil:{pace:3},cost:{paceDecline:1.3},positions:['EI','ED','DC','LI','LD'],attrs:['pace']},
 muro:{name:'Muro defensivo',icon:'⛨',trait:'Lectura anticipada',blurb:'Corta antes de que el ataque nazca. Casi nunca se lo ve apurado.',
  fx:{tackle:.14,injury:.97},ceil:{defense:3,physical:1},cost:{goals:.96},positions:['DFC','MCD','LI','LD'],attrs:['defense','physical']},
 motor:{name:'Motor incansable',icon:'⚙',trait:'Pulmones de acero',blurb:'Cubre toda la cancha, todos los partidos. Pocas lesiones y muchos minutos.',
  fx:{injury:.92,minutes:.025},ceil:{physical:2,pace:1,pass:1},cost:{goals:.97},positions:['MC','MCD','MI','MD'],attrs:['physical','pace']},
 guardian:{name:'Guardián',icon:'✋',trait:'Reflejos de gato',blurb:'Lo imposible es una atajada más. Su carrera se mide en vallas invictas.',
  fx:{reflex:.12,minutes:.015},ceil:{defense:3,pace:1},cost:{},positions:['POR'],attrs:['defense','pace']},
 mosaico:{name:'Mosaico',icon:'◈',trait:'Sin etiquetas',blurb:'Bebes de muchas fuentes: ninguna escuela te define, todas te sirven. Más difícil de predecir; más difícil de neutralizar.',
  fx:{minutes:.012,injury:.98},ceil:{pace:1,shot:1,pass:1,dribble:1,defense:1,physical:1},cost:{},positions:[],attrs:[]}
};
/** Puntuación bruta de un perfil [ritmo, tiro, pase, regate, defensa, físico, filigranas, pierna mala] en cada familia. */
function rawScores([pace,shot,pass,dribble,defense,physical,skills]){
 return {
  finalizador:shot*.66+physical*.18+pace*.16,
  creador:pass*.7+dribble*.2+skills*2,
  regateador:dribble*.7+pace*.15+skills*3,
  velocista:pace*.8+dribble*.1+(100-defense)*.1,
  muro:defense*.7+physical*.3,
  motor:physical*.4+defense*.2+pace*.2+pass*.2
 };
}
let STATS=null;
/** Media y desviación de cada familia sobre todo el catálogo: cada perfil se asigna a donde más destaca. */
function poolStats(){
 if(STATS)return STATS;
 const rows=DRAFT_REFERENTS.filter(r=>!(r.values[4]>=84&&r.values[1]<=32)).map(r=>rawScores(r.values));
 STATS={};
 for(const k of Object.keys(rows[0])){const v=rows.map(x=>x[k]),m=v.reduce((a,b)=>a+b,0)/v.length,sd=Math.sqrt(v.reduce((a,b)=>a+(b-m)**2,0)/v.length)||1;STATS[k]={m,sd};}
 return STATS;
}
export function referentTag(values){
 if(values[4]>=84&&values[1]<=32)return 'guardian';
 const st=poolStats(),s=rawScores(values);
 return Object.entries(s).map(([k,v])=>[k,(v-st[k].m)/st[k].sd]).sort((a,b)=>b[1]-a[1])[0][0];
}
/** Asignaciones de criterio para figuras cuyo perfil numérico no refleja cómo se las recuerda. */
const OVERRIDE={
 regateador:['Lionel Messi','Marta','Ronaldinho','Neymar','Diego Maradona','Vinícius Júnior','Kaoru Mitoma','Takefusa Kubo','Raphinha','Gabriel Martinelli','Lucas Assadi','Darío Osorio','Alexis Sánchez','Ángel Correa'],
 motor:['Federico Valverde','Jude Bellingham','Arturo Vidal','Declan Rice','Charles Aránguiz','Marcelino Núñez','Dominik Szoboszlai','Mason Mount','Alexis Mac Allister','Youssouf Fofana','Roberto Carlos'],
 creador:['Enzo Fernández','Kaká'],
 muro:['Paolo Maldini','Sergio Ramos','Carles Puyol','Rodri','Virgil van Dijk','Paulo Díaz','Felipe Loyola','Erick Pulgar','João Palhinha']
};
const OVERRIDE_BY_NAME=Object.fromEntries(Object.entries(OVERRIDE).flatMap(([t,names])=>names.map(n=>[n,t])));
const TAG_CACHE=new Map();
export function tagOf(name){
 if(TAG_CACHE.has(name))return TAG_CACHE.get(name);
 const r=DRAFT_REFERENTS.find(x=>x.name===name);const t=OVERRIDE_BY_NAME[name]||(r?referentTag(r.values):'mosaico');TAG_CACHE.set(name,t);return t;
}
export function referentRadar(name){const r=DRAFT_REFERENTS.find(x=>x.name===name);return r?KEYS.map((k,i)=>r.values[i]):null;}

const TIER_WEIGHT={icono:1.15,figura:1,profesional:.9};
const FIT={natural:1,neutral:.85,atipico:.6};
/** ADN del futbolista a partir de las influencias elegidas y de su puesto. */
export function dnaFromPicks(draftSources=[],position='DC'){
 const tally={};
 for(const p of draftSources){const t=tagOf(p.legend);tally[t]=(tally[t]||0)+(TIER_WEIGHT[p.tier]||1);}
 const ranked=Object.entries(tally).sort((a,b)=>b[1]-a[1]);
 const [top,topW]=ranked[0]||['mosaico',0];
 const primary=topW>=2.2?top:'mosaico';
 const second=primary!=='mosaico'&&ranked[1]&&ranked[1][1]>=2?ranked[1][0]:null;
 const aff=primary==='mosaico'||DNA_TAGS[primary].positions.includes(position)?'natural':DNA_TAGS[primary].positions.length&&positionNeighbour(primary,position)?'neutral':'atipico';
 return {primary,secondary:second,fit:primary==='mosaico'?'neutral':aff,tally:Object.fromEntries(ranked.map(([k,v])=>[k,Math.round(v*10)/10]))};
}
const NEAR={DC:['MCO','EI','ED'],EI:['MCO','MI','DC'],ED:['MCO','MD','DC'],MCO:['MC','DC','EI','ED'],MC:['MCO','MCD','MI','MD'],MI:['EI','LI','MC'],MD:['ED','LD','MC'],MCD:['MC','DFC'],DFC:['MCD','LI','LD'],LI:['DFC','MI'],LD:['DFC','MD'],POR:[]};
function positionNeighbour(tag,position){return DNA_TAGS[tag].positions.some(p=>(NEAR[p]||[]).includes(position));}
/** Techos heredados del ADN (se suman a los techos por atributo al cerrar el draft). */
export function dnaCeilBonus(dna){
 const out={};if(!dna)return out;
 const add=(tag,w)=>{if(!tag)return;for(const [k,v] of Object.entries(DNA_TAGS[tag].ceil))out[k]=(out[k]||0)+v*w;};
 add(dna.primary,FIT[dna.fit]??1);add(dna.secondary,.5*(FIT[dna.fit]??1));
 return Object.fromEntries(Object.entries(out).map(([k,v])=>[k,Math.round(v)]));
}
/** Modificadores de partido y de desarrollo del ADN. Multiplicadores neutros = 1; sumas neutras = 0. */
export function dnaFx(dna){
 const fx={goals:1,assists:1,injury:1,minutes:0,feint:0,tackle:0,reflex:0,sprint:0,passNoise:1,paceDecline:1};
 if(!dna)return fx;
 const apply=(tag,w)=>{if(!tag)return;const t=DNA_TAGS[tag];
  for(const src of [t.fx,t.cost])for(const [k,v] of Object.entries(src||{})){
   if(['goals','assists','injury','passNoise','paceDecline'].includes(k))fx[k]*=1+(v-1)*w;else fx[k]+=v*w;}};
 const f=FIT[dna.fit]??1;apply(dna.primary,f);apply(dna.secondary,.5*f);return fx;
}

/* ====================================================================== */
/* 2 · Efectos de las elecciones del creador                               */
/* ====================================================================== */
/* Cada opción: icon, chips (descripción mostrada al jugador) y fx (solo efectos NUEVOS, aplicados por choiceFx).
 * Claves de fx:
 *   minutes(+) goals(×) assists(×) injury(×) growth(×) growthYoung(×) growthLow(× si juega poco) growthRegular(× si juega mucho)
 *   growthAttr{k:×} declineYears(+años) ceil{k:+n} ceilAll(+n) startAttr{k:+n} startMorale startTrust startRep startFamily
 *   calm(+) pressure(+) moraleYear coachYear repYear fansYear boardYear market(×) callup(+) feint tackle reflex adapt(1) varianceUp */
const O=(icon,chips,fx={})=>({icon,chips,fx});
export const CHOICES={
 origin:{
  barrio:O('⌂',[['+5 moral inicial',1],['+1 techo Regate',1],['Aprende más rápido con pocos minutos',1]],{startMorale:5,ceil:{dribble:1},growthLow:1.12}),
  cantera:O('▦',[['+10 confianza del DT',1],['+5 % desarrollo juvenil',1],['+1 techo Pase',1]],{startTrust:10,growthYoung:1.05,ceil:{pass:1}}),
  amateur:O('☘',[['+10 % desarrollo si juegas mucho',1],['+1 techo Físico',1],['Arranque más lento',0]],{growthRegular:1.10,ceil:{physical:1},startAttr:{pace:-1}}),
  academia:O('★',[['+4 reputación inicial',1],['+1 Tiro, Pase y Regate al empezar',1],['+4 presión de las expectativas',0]],{startRep:4,startAttr:{shot:1,pass:1,dribble:1},pressure:4})
 },
 environment:{
  sin_contactos:O('✧',[['+4 % serenidad',1],['Sin padrinos: todo se gana',0]],{calm:.04}),
  familia_futbolera:O('♥',[['+2 moral/año',1],['+6 % serenidad',1],['+10 vínculo familiar',1]],{calm:.06,startFamily:10}),
  club_formativo:O('▦',[['+2,5 % minutos',1],['+4 % desarrollo juvenil',1],['+3 confianza del DT',1]],{growthYoung:1.04,startTrust:3}),
  autodidacta:O('⚽',[['+1 techo Filigranas',1],['+5 % desarrollo con pocos minutos',1]],{ceil:{skills:1},growthLow:1.05}),
  migrante:O('✈',[['Sin penalización al jugar fuera',1],['+1,4 % minutos',1],['+3 % serenidad',1]],{adapt:1,calm:.03}),
  campesino:O('▲',[['+2 techo Físico',1],['−4 % lesiones',1],['+3 % desarrollo',1]],{ceil:{physical:2},injury:.96,growth:1.03}),
  escuela:O('✎',[['+3 confianza del DT',1],['+3 % serenidad',1],['+2 % desarrollo',1]],{startTrust:3,calm:.03,growth:1.02}),
  doble_turno:O('☾',[['+6 % desarrollo si juegas mucho',1],['+4 % lesiones',0],['+3 % desarrollo',1]],{growthRegular:1.06,injury:1.04,growth:1.03})
 },
 developmentPath:{
  tecnica:O('◇',[['+4 % goles',1],['Pase y Regate crecen +10 %',1],['Físico crece −5 %',0]],{growthAttr:{pass:1.10,dribble:1.10,shot:1.08,physical:.95}}),
  fisica:O('⚙',[['−13 % lesiones',1],['Ritmo y Físico crecen +12 %',1],['Pase crece −4 %',0]],{growthAttr:{pace:1.12,physical:1.12,pass:.96}}),
  tactica:O('♟',[['+2,5 % minutos',1],['Defensa y Pase crecen +10-12 %',1],['Ritmo crece −4 %',0]],{growthAttr:{defense:1.12,pass:1.10,pace:.96}}),
  mental:O('☯',[['+8 % serenidad',1],['+3 % desarrollo',1],['+1 moral/año',1]],{calm:.08,growth:1.03,moraleYear:1}),
  mixta:O('◈',[['+5 % desarrollo en todo',1],['Sin puntos débiles extremos',1]],{growth:1.05}),
  recuperacion:O('✚',[['−20 % lesiones',1],['Declive 1,5 años más tarde',1]],{declineYears:1.5}),
  tardio:O('☾',[['+1 techo en todo',1],['Declive 2 años más tarde',1],['Desarrollo juvenil −8 %',0]],{ceilAll:1,declineYears:2,growthYoung:.92})
 },
 personality:{
  disciplinado:O('☑',[['+1 confianza del DT/año',1],['−3 % lesiones',1]],{coachYear:1,injury:.97}),
  ambicioso:O('↑',[['+0,5 reputación/año',1],['Mercado +6 % hacia grandes clubes',1]],{repYear:.5,market:1.06}),
  leal:O('♥',[['+2 hinchada/año',1],['+1 directiva/año',1]],{fansYear:2,boardYear:1}),
  carismatico:O('☺',[['+1 reputación/año',1],['+1 hinchada/año',1]],{repYear:1,fansYear:1}),
  sereno:O('❄',[['+18 % serenidad en jugadas',1],['−2 % lesiones',1]],{}),
  rebelde:O('⚡',[['+3 % goles',1],['−1,8 % minutos',0],['−5 % serenidad',0]],{}),
  lider:O('♔',[['+2,6 % minutos',1],['Capitanía antes',1]],{coachYear:.5}),
  obsesivo:O('∞',[['+2,2 % minutos',1],['+8 % desarrollo',1],['+13 % lesiones',0]],{}),
  solidario:O('✦',[['+7 % asistencias',1],['+1 vestuario',1]],{}),
  competitivo:O('⚔',[['+4 % goles',1],['+4 % lesiones',0],['Brilla en los clásicos',1]],{})
 },
 style:{
  equilibrado:O('◈',[['+1,5 % goles y asistencias',1],['+1 % minutos',1]],{goals:1.015,assists:1.015,minutes:.01}),
  goleador:O('◎',[['+10 % goles',1],['+1 techo Tiro',1]],{ceil:{shot:1}}),
  creador:O('✦',[['+15 % asistencias',1],['+1 techo Pase',1]],{ceil:{pass:1}}),
  intenso:O('⚙',[['+1,5 % minutos',1],['+4 % lesiones',0],['Mejor entrada defensiva',1]],{minutes:.015,injury:1.04,tackle:.06}),
  vertical:O('➤',[['+4 % goles',1],['+1 techo Ritmo',1],['+6 % lesiones',0]],{ceil:{pace:1}}),
  asociativo:O('⇄',[['+10 % asistencias',1],['Pases más precisos',1]],{}),
  aereo:O('⤴',[['+6 % goles',1],['+1 techo Físico',1]],{ceil:{physical:1}}),
  defensor:O('⛨',[['+1,8 % minutos',1],['−6 % goles',0],['Mejor entrada defensiva',1]],{tackle:.05}),
  regateador:O('↯',[['+3,5 % goles y asistencias',1],['Mejor amague',1],['+5 % lesiones',0]],{feint:.08})
 },
 strength:{
  tecnica:O('◇',[['+1 Pase al empezar',1],['+2 techo Pase',1]],{ceil:{pass:2}}),
  explosividad:O('➤',[['+1 Ritmo al empezar',1],['+2 techo Ritmo',1]],{ceil:{pace:2}}),
  definicion:O('◎',[['+1 Tiro al empezar',1],['+2 techo Tiro',1]],{ceil:{shot:2}}),
  resistencia:O('⚙',[['+1 Físico al empezar',1],['+2 techo Físico',1]],{ceil:{physical:2}}),
  lectura:O('♟',[['+1 Defensa al empezar',1],['+2 techo Defensa',1]],{ceil:{defense:2}})
 },
 weakness:{
  inconstante:O('≋',[['Rachas buenas y malas',0],['Notas de temporada más variables',0]],{varianceUp:1}),
  presion:O('⚠',[['−15 % serenidad en jugadas decisivas',0],['+7 presión en grandes partidos',0]],{}),
  fisico:O('✚',[['+12 % lesiones',0],['−1,8 % minutos',0],['−1 techo Físico',0]],{ceil:{physical:-1}}),
  individualista:O('☝',[['−6 % asistencias',0],['−1 techo Pase',0]],{assists:.94,ceil:{pass:-1}})
 },
 dream:{
  seleccion:O('⚑',[['Meta: 25 partidos con tu selección',1],['+4 en la convocatoria',1]],{callup:4}),
  europa:O('✈',[['Meta: 3 temporadas en clubes de élite',1],['Mercado +12 % hacia clubes top',1],['+3 presión',0]],{market:1.12,pressure:3}),
  idolo:O('♥',[['Meta: 8 temporadas en un mismo club',1],['+1,5 hinchada/año',1]],{fansYear:1.5}),
  titulos:O('★',[['Meta: 5 títulos',1],['+1 moral por título',1]],{}),
  cantera:O('▦',[['Meta: ser mentor o capitán 2 veces',1],['+0,5 reputación/año',1]],{repYear:.5}),
  regresar:O('⌂',[['Meta: 2 temporadas en tu país tras los 30',1],['Ofertas locales +25 % de veterano',1]],{}),
  capitan:O('♔',[['Meta: 3 temporadas como capitán',1],['+1 confianza del DT/año',1]],{coachYear:1}),
  goleador:O('◎',[['Meta: 150 goles (o equivalente a tu puesto)',1],['+2 % goles',1]],{goals:1.02}),
  resistencia:O('∞',[['Meta: 18 temporadas',1],['Declive 1,5 años más tarde',1]],{declineYears:1.5})
 },
 publicImage:{
  reservado:O('◐',[['Menos exposición y menos polémicas',1],['Fama más lenta',0]],{}),
  referente:O('♔',[['+2 confianza del DT/año',1],['Voz del vestuario',1]],{}),
  mediatico:O('◉',[['+0,7 reputación/año',1],['Los grandes te miran antes',1],['Más presión mediática',0]],{repYear:.7}),
  provocador:O('⚔',[['−2 confianza del DT/año',0],['Protagonista en los clásicos',1]],{}),
  solidario:O('♥',[['+1 confianza del DT/año',1],['Cercanía con la hinchada',1]],{fansYear:.5}),
  analitico:O('♟',[['+3 % serenidad',1],['Respuestas tácticas ante la prensa',1]],{calm:.03}),
  confiado:O('☀',[['+0,3 reputación/año',1],['Asumes la responsabilidad',1]],{repYear:.3})
 },
 riskProfile:{
  paciente:O('◷',[['+1,5 % minutos',1],['Evitas saltos precipitados',1],['Menos interés en fichajes grandes',0]],{}),
  audaz:O('↑',[['Más ofertas ambiciosas (+22 %)',1],['Puedes quedar en el banco de un grande',0]],{}),
  calculador:O('⚖',[['Eliges el momento: sin sesgos',1]],{}),
  economico:O('€',[['Mejor sueldo en las ofertas',1],['Menos ofertas de prestigio',0]],{}),
  hogareno:O('⌂',[['Ofertas de tu país +50 %',1],['Ofertas lejanas −30 %',0]],{}),
  aventurero:O('✈',[['Ofertas en el extranjero +35 %',1],['Más cambios de club',0]],{}),
  leal:O('♥',[['Renovar pesa más que salir',1],['Ofertas externas −25 %',0]],{})
 },
 mode:{
  'Clásico':O('◉',[['Ves el valor de cada leyenda',1]],{}),
  'Purista':O('◌',[['Valores ocultos: eliges por instinto',0],['+1 techo en todo (premio por arriesgar)',1]],{ceilAll:1})
 },
 foot:{
  // Las dos piernas otorgan las mismas oportunidades en su banda natural
  // o a pierna cambiada: elegir el pie no aumenta atributos ni mercado.
  Derecha:O('➜',[['+2 % minutos en bandas derechas',1],['A pierna cambiada por izquierda: +3 % goles',1],['A pierna cambiada: −1 % asistencias',0]],{}),
  Izquierda:O('⬅',[['+2 % minutos en bandas izquierdas',1],['A pierna cambiada por derecha: +3 % goles',1],['A pierna cambiada: −1 % asistencias',0]],{})
 }
};
/** Tipo de personalidades con efecto ya implementado en otras partes (se anotan para el resumen). */
export const AGE_FX={16:[['Más años para crecer (+1 año de carrera)',1],['Arranque más bajo',0]],17:[['Equilibrio entre margen y madurez',1]],18:[['+2 a los seis atributos al empezar',1]],19:[['+4 a los seis atributos al empezar',1],['Un año menos de desarrollo',0]]};
export function startBoost(age){return Math.max(0,(clamp(Number(age)||17,16,19)-17)*2);} // 17:0, 18:+2, 19:+4

const NEUTRAL={minutes:0,goals:1,assists:1,injury:1,growth:1,growthYoung:1,growthLow:1,growthRegular:1,declineYears:0,ceilAll:0,
 startMorale:0,startTrust:0,startRep:0,startFamily:0,calm:0,pressure:0,moraleYear:0,coachYear:0,repYear:0,fansYear:0,boardYear:0,market:1,callup:0,feint:0,tackle:0,reflex:0,sprint:0,passNoise:1,paceDecline:1,adapt:0,varianceUp:0};
/** Suma/multiplica los efectos de todas las elecciones del jugador y su ADN. Devuelve un objeto plano. */
export function choiceFx(s){
 const out={...NEUTRAL,growthAttr:{},ceil:{},startAttr:{}};
 const take=(cat,id)=>{const f=CHOICES[cat]?.[id]?.fx;if(!f)return;
  for(const [k,v] of Object.entries(f)){
   if(['growthAttr'].includes(k)){for(const [a,m] of Object.entries(v))out.growthAttr[a]=(out.growthAttr[a]||1)*m;}
   else if(['ceil','startAttr'].includes(k)){for(const [a,n] of Object.entries(v))out[k][a]=(out[k][a]||0)+n;}
   else if(['goals','assists','injury','growth','growthYoung','growthLow','growthRegular','market','passNoise','paceDecline'].includes(k))out[k]*=v;
   else out[k]=(out[k]||0)+v;}};
 for(const cat of ['origin','environment','developmentPath','personality','style','strength','weakness','dream','publicImage','riskProfile','mode'])take(cat,s[cat]);
 // Pierna hábil: bonificación espejo, según banda natural o a pierna cambiada.
 // No se aplican ventajas para posiciones centrales (DC, MC, POR, etc.).
 const bandaDerecha=['ED','MD','LD'].includes(s.position);
 const bandaIzquierda=['EI','MI','LI'].includes(s.position);
 if((s.foot==='Derecha'&&bandaDerecha)||(s.foot==='Izquierda'&&bandaIzquierda))out.minutes+=.02;
 if((s.foot==='Derecha'&&bandaIzquierda)||(s.foot==='Izquierda'&&bandaDerecha)){
  out.goals*=1.03;
  out.assists*=.99;
 }
 // ADN heredado de los legados
 if(s.dna){const d=dnaFx(s.dna);out.goals*=d.goals;out.assists*=d.assists;out.injury*=d.injury;out.minutes+=d.minutes;out.feint+=d.feint;out.tackle+=d.tackle;out.reflex+=d.reflex;out.sprint+=d.sprint;out.passNoise*=d.passNoise;out.paceDecline*=d.paceDecline;}
 return out;
}
/** Techos y valores iniciales extra derivados de las elecciones (se aplican una vez, al cerrar el draft). */
export function creatorCeilings(s){const f=choiceFx(s);const out={...f.ceil};for(const k of KEYS)out[k]=(out[k]||0)+f.ceilAll;const d=dnaCeilBonus(s.dna);for(const [k,v] of Object.entries(d))out[k]=(out[k]||0)+v;return out;}
export function startAttrDelta(s){const f=choiceFx(s);const out={...f.startAttr};const b=startBoost(s.startAge||s.age);if(b)for(const k of KEYS)out[k]=(out[k]||0)+b;return out;}
/** La demanda depende del rendimiento y perfil, no del pie preferido. */
export const marketRarity=()=>0;

/* ====================================================================== */
/* 3 · Sueños: metas medibles                                              */
/* ====================================================================== */
const sum=(H,k)=>H.reduce((a,x)=>a+(x[k]||0),0);
function groupOf(p){return p==='POR'?'goalkeeper':['DC','EI','ED'].includes(p)?'attack':['MCO','MC','MI','MD'].includes(p)?'middle':'defense';}
export const DREAM_GOALS={
 seleccion:{title:'Vestir la camiseta de tu selección',unit:'partidos con tu país',target:25,value:s=>sum(s.history||[],'nationalCaps')},
 europa:{title:'Jugar en la élite mundial',unit:'temporadas en clubes de élite',target:3,value:s=>(s.history||[]).filter(h=>clubPrestige(marketClub(h.clubId))>=82).length},
 idolo:{title:'Ser ídolo de un club',unit:'temporadas en un mismo club',target:8,value:s=>Math.max(0,...Object.values((s.history||[]).reduce((a,h)=>(a[h.clubId]=(a[h.clubId]||0)+1,a),{})),s.squad?.idol?8:0)},
 titulos:{title:'Ganar todos los títulos',unit:'títulos',target:5,value:s=>(s.trophies||[]).length},
 cantera:{title:'Ser referente de la cantera',unit:'actos de liderazgo (mentor o capitán)',target:2,value:s=>(s.threads||[]).filter(t=>['mentor','captain'].includes(t.kind)).length},
 regresar:{title:'Volver a tus raíces',unit:'temporadas en casa tras los 30',target:2,value:s=>(s.history||[]).filter(h=>h.age>=30&&marketClub(h.clubId)?.countryCode===s.country).length},
 capitan:{title:'Llevar la jineta',unit:'temporadas como capitán',target:3,value:s=>(s.history||[]).filter(h=>h.captain).length},
 goleador:{title:'Romper récords goleadores',unit:null,target:null,value:null},
 resistencia:{title:'Una carrera longeva',unit:'temporadas',target:18,value:s=>(s.history||[]).length}
};
export function dreamProgress(s){
 const base=DREAM_GOALS[s?.dream];if(!base)return null;
 let {title,unit,target,value}=base;
 if(s.dream==='goleador'){const g=groupOf(s.position);
  if(g==='attack'){target=150;unit='goles';value=()=>sum(s.history||[],'goals');}
  else if(g==='middle'){target=90;unit='goles + asistencias';value=()=>sum(s.history||[],'goals')+sum(s.history||[],'assists');}
  else if(g==='goalkeeper'){target=80;unit='vallas invictas';value=()=>sum(s.history||[],'cleanSheets');}
  else{target=40;unit='goles + asistencias';value=()=>sum(s.history||[],'goals')+sum(s.history||[],'assists');}}
 const current=Math.min(target,value(s)),done=value(s)>=target;
 return {id:s.dream,title,unit,target,current,done,pct:Math.round(current/target*100),claimed:!!s.dreamDone};
}
export const DREAM_REWARD={rep:6,morale:10,board:8,fans:8,award:true};

/* ====================================================================== */
/* 4 · Resumen legible para la interfaz                                    */
/* ====================================================================== */
export const CATEGORY_LABEL={origin:'Formación',environment:'Entorno',developmentPath:'Desarrollo',personality:'Carácter',style:'Estilo',strength:'Fortaleza',weakness:'Debilidad',publicImage:'Imagen pública',riskProfile:'Decisiones',dream:'Sueño',mode:'Draft',foot:'Pierna'};
export function chipsFor(cat,id){return CHOICES[cat]?.[id]?.chips||[];}
export function iconFor(cat,id){return CHOICES[cat]?.[id]?.icon||'•';}
/** Todas las consecuencias de un borrador, agrupadas por categoría (para el panel «Efectos reales»). */
export function draftConsequences(d,names={}){
 const out=[];
 for(const cat of ['origin','environment','developmentPath','personality','style','strength','weakness','publicImage','riskProfile','dream','mode','foot']){
  const id=d[cat];const c=CHOICES[cat]?.[id];if(!c)continue;
  out.push({cat,label:CATEGORY_LABEL[cat],name:names[cat]?.(id)||id,icon:c.icon,chips:c.chips});
 }
 const a=AGE_FX[clamp(Number(d.age)||17,16,19)];if(a)out.push({cat:'age',label:'Edad',name:`${d.age} años`,icon:'◷',chips:a});
 return out;
}
/** Bonos de la clase elegida (los mismos que aplica classAdjustedAttributes). */
export function classBonuses(position,roleClass){
 const c=classesFor(position).find(x=>x.id===roleClass)||classesFor(position)[0];
 return c?[[c.primary,c.power],[c.secondary,c.extra]].filter(([k,v])=>k&&v):[];
}
/** Perfiles sugeridos: rellenan todo el carácter del futbolista de una vez. */
export const PRESETS=[
 {id:'barrio',name:'Promesa de barrio',icon:'⌂',blurb:'Talento callejero, hambre y regate. Arriesga por llegar lejos.',fields:{origin:'barrio',environment:'autodidacta',developmentPath:'tecnica',personality:'ambicioso',style:'regateador',strength:'explosividad',weakness:'inconstante',publicImage:'reservado',riskProfile:'audaz',dream:'europa'}},
 {id:'cerebro',name:'Cerebro del juego',icon:'✦',blurb:'Formado en cantera, piensa el fútbol antes de jugarlo.',fields:{origin:'cantera',environment:'club_formativo',developmentPath:'tactica',personality:'sereno',style:'asociativo',strength:'tecnica',weakness:'fisico',publicImage:'analitico',riskProfile:'calculador',dream:'titulos'}},
 {id:'lider',name:'Líder de vestuario',icon:'♔',blurb:'Voz de grupo y lealtad al escudo. Quiere la jineta.',fields:{origin:'amateur',environment:'familia_futbolera',developmentPath:'mental',personality:'lider',style:'intenso',strength:'resistencia',weakness:'presion',publicImage:'referente',riskProfile:'leal',dream:'capitan'}},
 {id:'global',name:'Trotamundos',icon:'✈',blurb:'Crece lejos de casa y busca desafíos en cualquier liga.',fields:{origin:'academia',environment:'migrante',developmentPath:'mixta',personality:'carismatico',style:'vertical',strength:'definicion',weakness:'individualista',publicImage:'mediatico',riskProfile:'aventurero',dream:'seleccion'}},
 {id:'atleta',name:'Máquina atlética',icon:'⚙',blurb:'Cancha de tierra y cuerpo de acero. Longevidad ante todo.',fields:{origin:'barrio',environment:'campesino',developmentPath:'fisica',personality:'obsesivo',style:'aereo',strength:'resistencia',weakness:'inconstante',publicImage:'reservado',riskProfile:'paciente',dream:'resistencia'}}
];
export function randomFields(seed=Math.random()){
 let a=0;for(const c of String(seed))a=(a*31+c.charCodeAt(0))>>>0;
 const r=()=>{a=(a+0x6D2B79F5)|0;let t=Math.imul(a^(a>>>15),1|a);t^=t+Math.imul(t^(t>>>7),61|t);return((t^(t>>>14))>>>0)/4294967296;};
 const pick=o=>{const k=Object.keys(o);return k[Math.floor(r()*k.length)];};
 return {origin:pick(CHOICES.origin),environment:pick(CHOICES.environment),developmentPath:pick(CHOICES.developmentPath),personality:pick(CHOICES.personality),style:pick(CHOICES.style),strength:pick(CHOICES.strength),weakness:pick(CHOICES.weakness),dream:pick(CHOICES.dream)};
}
