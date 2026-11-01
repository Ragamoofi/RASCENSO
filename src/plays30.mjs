/* RASCENSO 3.0 · Jugadas Vivas — lógica pura (sin DOM).
 * Ofrece jugadas según ritmo de temporada y rol, en partidos reales del calendario simulado.
 * La jugada parte del marcador que el simulador ya calculó para ese partido:
 *  - ofensiva lograda: +1 gol del equipo (gol o asistencia tuya, según la jugada);
 *  - defensiva lograda: −1 gol del rival (evitaste el gol que el simulador había anotado);
 *  - fallada: el partido queda exactamente como lo simuló el motor.
 * Así nunca hay resultados duplicados ni contradicciones con las estadísticas.
 */
import { rng, hash, clamp, yearOf, positionGroup } from './career20.mjs';
import { fixtureContext } from './career15.mjs';
import { choiceFx } from './identity30.mjs';
import {tuningFor,tunedAI,tunedChance} from './play-tuning43.mjs';
import {contextVariation4110} from './spotlight4110.mjs';

export const PLAYS={
 mano_a_mano:{name:'Mano a mano',kind:'attack',credit:'goal',view:'field',attr:['shot','dribble','pace'],brief:'Encara al arquero: muévete, amaga y define antes de que llegue el defensor.',controls:'Ratón o WASD/flechas para conducir · clic izquierdo potente o derecho colocado'},
 penal:{name:'Penal',kind:'attack',credit:'goal',view:'goal',attr:['shot','skills'],brief:'Once pasos de soledad. El arquero estudió tus penales anteriores.',controls:'Apunta con el ratón · mantén clic izquierdo para potencia o derecho para colocar · suelta para patear'},
 cabezazo:{name:'Cabezazo',kind:'attack',credit:'goal',view:'field',attr:['physical','shot'],brief:'Centro desde la banda: gana la posición a tu marcador y cabecea.',controls:'Muévete con ratón o WASD/flechas · clic para saltar y cabecear hacia el ratón'},
 remate:{name:'Remate de primera',kind:'attack',credit:'goal',view:'field',attr:['shot','weak'],brief:'Pase atrás desde el fondo: el balón no se controla, se impacta.',controls:'Apunta al arco con el ratón · clic cuando la pelota entre en tu anillo'},
 diagonal:{name:'Diagonal y rosca',kind:'attack',credit:'goal',view:'field',attr:['dribble','shot','skills'],brief:'Recibe abierto, rompe hacia adentro y busca el palo lejano con efecto.',controls:'Conduce con ratón o WASD/flechas (incluye diagonales) · clic en el arco para rematar con rosca'},
 tiro_libre:{name:'Tiro libre',kind:'attack',credit:'goal',view:'goal',attr:['shot','skills'],brief:'Barrera de cuatro y un arquero adelantado. Supera la barrera con efecto.',controls:'Apunta · mantén para cargar · mueve el ratón de lado mientras cargas para dar efecto'},
 encare:{name:'Duelo contra el lateral',kind:'attack',credit:'assist',view:'field',attr:['dribble','pace'],brief:'Uno contra uno en la banda: desbórdalo y mete el pase de la muerte. El color de la línea indica presión.',controls:'Conduce con ratón o WASD/flechas (incluye diagonales) · Espacio o clic derecho para amagar · clic sobre un compañero para centrar'},
 centro:{name:'Centro a la carrera',kind:'attack',credit:'assist',view:'field',attr:['pass','pace'],brief:'Tres compañeros atacan el área. Al apuntar, el color indica la presión sobre la línea de pase.',controls:'Clic sobre el compañero (o el espacio) al que quieres centrar'},
 pase_filtrado:{name:'Pase filtrado',kind:'attack',credit:'assist',view:'field',attr:['pass','skills'],brief:'La línea defensiva sube. Rompe la última línea sin dejar al delantero en fuera de juego.',controls:'Clic izquierdo: pase raso · clic derecho: bombeado · vigila el fuera de juego'},
 contragolpe:{name:'Contragolpe 3 contra 2',kind:'attack',credit:'assist',view:'field',attr:['pace','pass','dribble'],brief:'Robo en mitad de cancha: conduce, fija a un defensor y decide. El color de la línea indica presión.',controls:'Conduce con ratón o WASD/flechas (incluye diagonales) · clic en un compañero para pasar o en el arco para rematar'},
 rondo:{name:'Control del ritmo',kind:'defend',credit:'save',view:'field',attr:['pass','dribble'],brief:'Últimos minutos y el rival presiona. El color de la línea muestra la presión sobre el pase.',controls:'Clic sobre un compañero libre para pasar · completa 6 pases o aguanta 14 segundos'},
 recuperacion:{name:'Recuperación en la medular',kind:'defend',credit:'save',view:'field',attr:['defense','pace'],brief:'Un volante rival conduce hacia tu zona. Roba antes de que filtre el pase.',controls:'Muévete con ratón o WASD/flechas (incluye diagonales) · clic para meter el pie cuando el anillo brille más'},
 entrada:{name:'Duelo defensivo',kind:'defend',credit:'save',view:'field',attr:['defense','pace','physical'],brief:'El delantero te encara. Temporiza: una entrada precipitada es falta.',controls:'Muévete con ratón o WASD/flechas · clic para entrar cuando el anillo brille más'},
 anticipacion:{name:'Anticipación',kind:'defend',credit:'save',view:'field',attr:['defense','pace'],brief:'Lee el cuerpo del pasador y corta la línea de pase antes de que llegue.',controls:'Muévete con ratón o WASD/flechas hacia la línea de pase que vas a cortar'},
 despeje:{name:'Despeje aéreo',kind:'defend',credit:'save',view:'field',attr:['physical','defense'],brief:'Centro al corazón del área. Gánale el salto al nueve y aleja el peligro.',controls:'Muévete con ratón o WASD/flechas · clic para despejar lejos del arco'},
 fuera_juego:{name:'Línea del fuera de juego',kind:'defend',credit:'save',view:'field',attr:['defense','pass'],brief:'Tú ordenas la línea. Sube en el instante exacto del pase.',controls:'Mantén pulsado (clic o Espacio) para adelantar la línea · suelta para retroceder'},
 achique:{name:'Achique en el mano a mano',kind:'defend',credit:'save',view:'field',attr:['defense','pace'],brief:'El delantero quedó solo. Reduce el ángulo y elige cuándo salir.',controls:'Mueve al arquero con ratón o WASD/flechas · clic hacia el balón para lanzarte, también tras el remate'},
 salida_aerea:{name:'Salida por arriba',kind:'defend',credit:'save',view:'field',attr:['physical','defense'],brief:'Centro cerrado entre una nube de jugadores. Sal y atrapa.',controls:'Muévete con ratón o WASD/flechas · clic para atrapar cuando la pelota esté a tu alcance'},
 penal_atajado:{name:'Penal en contra',kind:'defend',credit:'save',view:'goal',attr:['defense','pace'],brief:'Lee la carrera del pateador. Si te tiras antes de tiempo, te engaña.',controls:'Mueve el ratón para elegir zona · clic para lanzarte'},
 reflejos:{name:'Asedio en el área',kind:'defend',credit:'save',view:'goal',attr:['defense','pace','physical'],brief:'Remate, rebote y otro remate. Aguanta la andanada.',controls:'Mueve al arquero con el ratón · clic para estirarte hacia el puntero'}
};
export const PLAY_IDS=Object.keys(PLAYS);
/** Repertorio por puesto: cada posición vive situaciones y controles propios. */
const LEGACY_POSITION_PLAYS={
 DC:['mano_a_mano','penal','cabezazo','remate'],
 EI:['encare','diagonal','centro','tiro_libre'],ED:['encare','diagonal','centro','tiro_libre'],
 MCO:['pase_filtrado','contragolpe','tiro_libre','remate'],
 MC:['pase_filtrado','contragolpe','rondo','recuperacion'],
 MI:['centro','contragolpe','pase_filtrado','encare'],MD:['centro','contragolpe','pase_filtrado','encare'],
 MCD:['recuperacion','anticipacion','rondo','entrada'],
 DFC:['entrada','anticipacion','despeje','fuera_juego'],
 LI:['entrada','centro','anticipacion','despeje'],LD:['entrada','centro','anticipacion','despeje'],
 POR:['reflejos','penal_atajado','achique','salida_aerea']
};
export const POSITION_PLAYS={
 DC:['mano_a_mano','penal','cabezazo','remate','diagonal','contragolpe','encare','tiro_libre'],
 EI:['encare','diagonal','centro','tiro_libre','contragolpe','pase_filtrado','remate','rondo'],ED:['encare','diagonal','centro','tiro_libre','contragolpe','pase_filtrado','remate','rondo'],
 MCO:['pase_filtrado','contragolpe','tiro_libre','remate','diagonal','centro','rondo','encare'],
 MC:['pase_filtrado','contragolpe','rondo','recuperacion','anticipacion','tiro_libre','centro','encare'],
 MI:['centro','contragolpe','pase_filtrado','encare','diagonal','rondo','recuperacion','tiro_libre'],MD:['centro','contragolpe','pase_filtrado','encare','diagonal','rondo','recuperacion','tiro_libre'],
 MCD:['recuperacion','anticipacion','rondo','entrada','fuera_juego','pase_filtrado','despeje','contragolpe'],
 DFC:['entrada','anticipacion','despeje','fuera_juego','recuperacion','cabezazo','rondo','pase_filtrado'],
 LI:['entrada','centro','anticipacion','despeje','encare','recuperacion','fuera_juego','contragolpe'],LD:['entrada','centro','anticipacion','despeje','encare','recuperacion','fuera_juego','contragolpe'],
 POR:['reflejos','penal_atajado','achique','salida_aerea','despeje']
};

/* ---------- Atributos → capacidades del jugador en la cancha ---------- */
export function composure(s){
 let c=.45+((s.morale??70)-60)/160+((s.reputation||0)/400);
 if(s.personality==='sereno')c+=.18;if(s.personality==='rebelde')c-=.05;
 if(s.weakness==='presion')c-=.15;if(s.strength==='mentalidad'||s.strength==='liderazgo')c+=.08;
 c+=choiceFx(s).calm;
 return clamp(c,.1,.95);
}
export function playerStats(s,play){
 const a=s.attributes||{},v=k=>clamp((Number(a[k])||50)/100,.2,.99),stars=k=>clamp((Number(a[k])||2)/5,.2,1);
 const cf=choiceFx(s);
 const fatigue=play?.fatigue??0,press=clamp(((play?.pressure??50)+cf.pressure)/100,0,1),calm=composure(s);
 const nerves=press*(1-calm); // 0 (frío) … ~0.8 (temblor)
 const tired=1-fatigue*.22;
 return {
  speed:(5.6+v('pace')*3.6+cf.sprint*.5)*tired,              // m/s con balón
  sprint:(6.4+v('pace')*3.8+cf.sprint)*tired,
  control:v('dribble'),shot:v('shot'),power:(v('shot')*.6+v('physical')*.4),
  pass:v('pass'),defense:v('defense'),jump:v('physical'),skills:stars('skills'),weak:stars('weak'),
  reflex:clamp(v('defense')*.6+v('pace')*.4+cf.reflex,.2,.99),reach:1.1+v('physical')*.5+v('defense')*.3,
  nerves,fatigue,composure:calm,
  aimNoise:(1-v('shot'))*1.15+nerves*1.1+fatigue*.45, // metros de desvío en el arco
  passNoise:((1-v('pass'))*2.2+nerves*1.2+fatigue*.5)*cf.passNoise,
  tackleReach:1.15+v('defense')*.75+cf.tackle,
  feint:clamp(v('dribble')*.7+stars('skills')*.3+cf.feint,.1,1)
 };
}
/** Dificultad del rival: nivel del club contrario, categoría, presión y etapa de la carrera. */
export function aiStats(play){
 const d=clamp(play?.difficulty??.5,.1,.98);
 return tunedAI({d,keeperReaction:.34-d*.14,keeperSpeed:4.4+d*2.2,keeperReach:.95+d*.38,defSpeed:5.2+d*2.4,defReaction:.5-d*.28,feintResist:.25+d*.5,passTell:.9-d*.5,shooterSkill:.45+d*.45},play?.type);
}

/* ---------- Selección de jugadas de la temporada ---------- */
const DECISIVE_LABEL=['Último minuto','Partido de máxima tensión','Recta final','Duelo directo'];
function playCount(role,mode='equilibrado'){const counts={rapido:{Titular:3,'Rotación':2,Suplente:1,Reserva:1},equilibrado:{Titular:5,'Rotación':4,Suplente:3,Reserva:2},inmersivo:{Titular:7,'Rotación':6,Suplente:4,Reserva:3}};return (counts[mode]||counts.equilibrado)[role]||1;}
function parseScore(m,clubId){const [h,a]=String(m.score||'0-0').split('-').map(Number);return m.home===clubId?{gf:h,ga:a}:{gf:a,ga:h};}
/** Lista determinista de jugadas para la temporada en curso (no depende de las ya resueltas). */
export function buildSeasonPlays(s,league,getClub,{role,rivalLevel=()=>60,clubLevel=60,tier=1,prestige=60}={}){
 if(s.phase!=='season'||!league?.playerMatches?.length)return [];
 const year=yearOf(s);
 const matches=league.playerMatches.filter(m=>m.played&&m.minutes>=20);
 if(!matches.length)return [];
 const oldMode=!!s.__legacyPlays;
 const set=oldMode?LEGACY_POSITION_PLAYS:POSITION_PLAYS;
 const repertoire=set[s.position]||set.MC;
 const r=rng(`${s.seed}:plays30:${year}:${s.clubId}`);
 // Variedad: se evitan primero los tipos jugados el año anterior.
 const lastTypes=new Set((s.history?.at(-1)?.plays||[]).map(p=>p.type));
 const order=[...repertoire].sort((a,b)=>(lastTypes.has(a)?1:0)-(lastTypes.has(b)?1:0)||hash(`${s.seed}:${year}:${a}`)-hash(`${s.seed}:${year}:${b}`));
 const count=Math.min(playCount(role,oldMode?'rapido':s.matchRhythm),order.length);
 const used=new Set(),legacy=s.clutchMoment;
 const out=[];
 for(let i=0;i<count;i++){
  const type=order[i],info=PLAYS[type];
  const scored=matches.filter(m=>!used.has(m.round)&&!(legacy&&legacy.round===m.round&&legacy.home===m.home)).map(m=>{
   const {gf,ga}=parseScore(m,s.clubId);
   if(info.kind==='defend'&&ga<1)return null;
   // Partidos ajustados primero: empate o derrota corta para atacar; ventaja corta o empate para defender.
   const diff=info.kind==='attack'?gf-ga:gf-(ga-1);
   const tight=info.kind==='attack'?(diff===0?3:diff===-1?2.6:diff===1?1.4:.4):(diff===1?3:diff===0?2.6:diff===2?1.2:.5);
   const late=m.round>=league.playerMatches.length*.7?1.3:1;
   return {m,gf,ga,w:tight*late*(.6+((hash(`${s.seed}:${year}:${type}:${m.round}`)%100)/100))};
  }).filter(Boolean).sort((a,b)=>b.w-a.w);
  const pick=scored[0];if(!pick)continue;
  used.add(pick.m.round);
  const ctx=fixtureContext(s,pick.m,getClub);
  const seed=`${s.seed}:${year}:${pick.m.round}:${type}`;
  const pr=rng(seed);
  const decisive=pick.w>2.4||ctx.classic;
  const minute=decisive?80+Math.floor(pr()*14):28+Math.floor(pr()*55);
  const before=info.kind==='attack'?{gf:pick.gf,ga:pick.ga}:{gf:pick.gf,ga:pick.ga-1};
  const rivalId=pick.m.home===s.clubId?pick.m.away:pick.m.home;
  const rl=rivalLevel(rivalId);
  const pressure=clamp(Math.round(38+(decisive?24:0)+(ctx.classic?14:0)+(Math.abs(before.gf-before.ga)<=1?8:0)+(minute>=85?8:0)+(tier===1?4:0)+(prestige-70)*.25+choiceFx(s).pressure),20,99);
  const fatigue=clamp(minute/95*(1.05-((s.attributes?.physical||60)/150)),0,.85);
  const difficulty=clamp(.34+(rl-(s.ovr||60))*.022+(prestige-65)*.006+(tier===1?.05:0)+pressure*.0016+(s.history?.length||0)*.004,.12,.95);
  const playEntry={id:`${year}:${pick.m.round}:${type}`,year,round:pick.m.round,home:pick.m.home,away:pick.m.away,type,kind:info.kind,credit:info.credit,
   rivalId,rival:ctx.rival,homeName:ctx.home,awayName:ctx.away,classic:!!ctx.classic,decisive,tag:decisive?DECISIVE_LABEL[hash(seed)%DECISIVE_LABEL.length]:ctx.tag||'Partido de liga',
   minute,before,pressure,fatigue:Math.round(fatigue*100)/100,difficulty:Math.round(difficulty*100)/100,rivalLevel:rl,seed,
   isHome:pick.m.home===s.clubId,lastRound:pick.m.round===Math.max(...league.playerMatches.map(m=>m.round)),isFinal:/^final(?:\s+de\s+copa)?$/i.test(String(pick.m.stage||pick.m.phase||''))};
  playEntry.variation=contextVariation4110(s,playEntry);
  out.push(playEntry);
 }
 return out.sort((a,b)=>a.round-b.round);
}

/* ---------- Resolución ---------- */
const DETAILS=new Set(['gol','asistencia','atajado','fuera','poste','travesaño','barrera','bloqueado','interceptado','fuera de juego','robo','despeje','atajada','falta','perdida','superado','tiempo','corte','posesión','gol rival','controlada','auto']);
export function sanitizeReport(report){
 const success=!!report?.success;
 const quality=clamp(Number(report?.quality)||0,0,1);
 const detail=DETAILS.has(report?.detail)?report.detail:(success?'gol':'fuera');
 const out={success,quality:Math.round(quality*100)/100,detail};
 if(Number.isFinite(report?.dir))out.dir=Math.round(clamp(report.dir,0,1)*100)/100;
 if(report?.credit==='goal'||report?.credit==='assist')out.credit=report.credit;
 return out;
}
/** Probabilidad de éxito al resolver sin jugar (botón «resolver automáticamente»). */
export function autoChance(s,play){
 const st=playerStats(s,play),info=PLAYS[play.type];
 const attr=info.attr.reduce((n,k)=>n+(['skills','weak'].includes(k)?(st[k]||.4)*100:(Number(s.attributes?.[k])||50)),0)/info.attr.length;
 const base={attack:.40,defend:.52}[info.kind];
 const chance=base+(attr-(45+play.difficulty*40))/120-st.nerves*.12-st.fatigue*.06;
 return tunedChance(chance,play.type);
}
export function autoReport(s,play){
 const p=autoChance(s,play),roll=rng(play.seed+':auto')();
 const success=roll<p;
 return {success,quality:success?.4+(1-roll/p)*.3:.2,detail:success?(play.kind==='attack'?(play.credit==='assist'?'asistencia':'gol'):'atajada'):(play.kind==='attack'?'atajado':'gol rival'),auto:true};
}
export function playOutcomeText(play,res){
 const name=PLAYS[play.type].name;
 if(res.success)return play.kind==='attack'?(play.credit==='assist'?`${name}: asistencia de gol`:`${name}: ¡gol!`):`${name}: evitaste el gol rival`;
 return play.kind==='attack'?`${name}: la ocasión se fue (${res.detail})`:`${name}: el rival marcó (${res.detail})`;
}
/** Efecto de una jugada sobre un partido concreto: lo usa el motor de liga. */
export function fixturePlayDelta(results,fixture,plays){
 if(!plays||!Array.isArray(results))return null;
 const r=results.find(x=>x.success&&x.round===fixture.round&&x.home===fixture.home&&x.away===fixture.away);
 if(!r)return null;
 return {type:r.type,attack:r.kind==='attack',defend:r.kind==='defend',credit:r.credit};
}
export { positionGroup };
