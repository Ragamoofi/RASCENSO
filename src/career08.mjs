/* RASCENSO 0.8: decisiones de identidad propias, independientes del narrador. */
export const ENVIRONMENTS = [
 {id:'sin_contactos',name:'Desde cero',description:'Sin conexiones: cada convocatoria y contrato se gana en la cancha.'},
 {id:'familia_futbolera',name:'Tradición futbolera',description:'Creciste respirando fútbol; sabes soportar la exigencia.'},
 {id:'club_formativo',name:'Proyecto formativo',description:'Entrenaste desde pequeño con objetivos y disciplina.'},
 {id:'autodidacta',name:'Talento callejero',description:'Aprendiste jugando libre, improvisando y compitiendo.'},
 {id:'migrante',name:'Crecer lejos de casa',description:'Jugaste en ciudades diferentes y aprendiste a adaptarte.'},
 {id:'campesino',name:'Cancha de tierra',description:'Entrenabas con pocos recursos y mucho esfuerzo.'},
 {id:'escuela',name:'Fútbol escolar',description:'Equilibraste clases y fútbol hasta llegar a una prueba profesional.'},
 {id:'doble_turno',name:'Trabajo y fútbol',description:'Entrenaste al final de jornadas agotadoras; valoras cada oportunidad.'}
];
export const PUBLIC_IMAGES = [
 {id:'reservado',name:'Perfil reservado',description:'Dejas que el rendimiento hable por ti.'},
 {id:'referente',name:'Voz del vestuario',description:'Proteges al grupo y te involucras cuando hay tensión.'},
 {id:'mediatico',name:'Figura mediática',description:'Aceptas la exposición y sus consecuencias.'},
 {id:'provocador',name:'Competidor polémico',description:'No rehúyes los clásicos ni los desafíos públicos.'},
 {id:'solidario',name:'Ídolo cercano',description:'Participas en actividades del barrio y visitas juveniles.'},
 {id:'analitico',name:'Analítico ante la prensa',description:'Te gusta hablar de movimientos y decisiones tácticas.'},
 {id:'confiado',name:'Seguro frente a cámaras',description:'Eres directo y aceptas asumir la responsabilidad.'}
];
export const RISK_PROFILES = [
 {id:'paciente',name:'Priorizar minutos',description:'La continuidad vale más que la fama inmediata.'},
 {id:'audaz',name:'Buscar el máximo nivel',description:'Aceptas competir incluso si partes desde el banco.'},
 {id:'calculador',name:'Elegir el momento',description:'Cambias de club cuando el proyecto convence.'},
 {id:'economico',name:'Seguridad económica',description:'Los contratos estables pesan en tus decisiones.'},
 {id:'hogareno',name:'Cerca de mi gente',description:'Un proyecto en casa pesa más que una oferta distante.'},
 {id:'aventurero',name:'Aventurero',description:'Te atraen los desafíos en ligas desconocidas.'},
 {id:'leal',name:'Lealtad al escudo',description:'Priorizas la permanencia y la identidad con tu club.'}
];
export const DEVELOPMENT_PATHS = [
 {id:'tecnica',name:'Talento técnico',description:'Refina la precisión y la lectura del juego.'},
 {id:'fisica',name:'Potencia atlética',description:'Apuesta por el físico y la intensidad.'},
 {id:'tactica',name:'Inteligencia táctica',description:'Mejora tu adaptación a esquemas exigentes.'},
 {id:'mental',name:'Mentalidad competitiva',description:'Trabaja constancia, confianza y liderazgo.'},
 {id:'mixta',name:'Crecimiento integral',description:'Apuesta por un progreso gradual sin puntos débiles extremos.'},
 {id:'recuperacion',name:'Cuidar el cuerpo',description:'Prioriza descanso, salud y longevidad profesional.'},
 {id:'tardio',name:'Maduración tardía',description:'Buscas tu mejor nivel cuando acumules experiencia.'}
];
export const PREPARATIONS = [
 {id:'definicion',name:'Definición',short:'Finalizar',description:'Mejora la eficacia ofensiva; exige más carga de trabajo.'},
 {id:'creacion',name:'Último pase',short:'Crear',description:'Aumenta las ocasiones de asistencia.'},
 {id:'fisico',name:'Preparación física',short:'Físico',description:'Reduce el riesgo de perder minutos por molestias.'},
 {id:'tactica',name:'Trabajo táctico',short:'Táctica',description:'Mayor probabilidad de sumar minutos y confianza del DT.'},
 {id:'equilibrio',name:'Recuperación y equilibrio',short:'Recuperar',description:'Protege la forma física y la moral en años exigentes.'},
 {id:'caracter',name:'Liderazgo',short:'Liderar',description:'Refuerza tu presencia en el vestuario y tu reputación.'}
];
const valid=(v,arr,fallback)=>arr.some(x=>x.id===v)?v:fallback;
export function identityTraits(user={}){return {
 environment:valid(user.environment,ENVIRONMENTS,'sin_contactos'),
 publicImage:valid(user.publicImage,PUBLIC_IMAGES,'reservado'),
 riskProfile:valid(user.riskProfile,RISK_PROFILES,'calculador'),
 developmentPath:valid(user.developmentPath,DEVELOPMENT_PATHS,'tecnica')
};}
export function identitySeasonEffects(s){const traits=identityTraits(s);return {
 minutes:(traits.environment==='club_formativo'?.025:traits.environment==='migrante'?.014:0)+(traits.developmentPath==='tactica'?.025:0)+(traits.riskProfile==='paciente'?.015:0),
 goals:traits.developmentPath==='tecnica'?1.04:1,
 injury:traits.developmentPath==='fisica'?.87:traits.developmentPath==='recuperacion'?.80:1,
 exposure:traits.publicImage==='mediatico'?1.18:traits.publicImage==='confiado'?1.10:traits.publicImage==='reservado'?.9:1,
 coach:traits.publicImage==='referente'?2:traits.publicImage==='solidario'?1:traits.publicImage==='provocador'?-2:0,
 morale:traits.environment==='familia_futbolera'?2:traits.environment==='sin_contactos'?1:0,
 market:traits.riskProfile==='audaz'?1.05:traits.riskProfile==='economico'?.99:1
};}
/** Moderados para que los rasgos cambien tu carrera sin regalar títulos. */
export function creatorIdentityEffects(s){
 const style={
  vertical:{goals:1.04,assists:1.02,injury:1.06},asociativo:{assists:1.10},aereo:{goals:1.06,injury:1.03},
  defensor:{minutes:.018,goals:.94},regateador:{goals:1.035,assists:1.035,injury:1.05}
 }[s.style]||{};
 const mind={
  sereno:{injury:.98},rebelde:{minutes:-.018,goals:1.03},lider:{minutes:.026},
  obsesivo:{minutes:.022,injury:1.13},solidario:{assists:1.07},competitivo:{goals:1.04,injury:1.04}
 }[s.personality]||{};
 return {minutes:(style.minutes||0)+(mind.minutes||0),goals:(style.goals||1)*(mind.goals||1),
 assists:(style.assists||1)*(mind.assists||1),injury:(style.injury||1)*(mind.injury||1)};
}
export function archetypeFor(s){const attrs=s.attributes||{};
 const pace=attrs.pace??50,shot=attrs.shot??50,pass=attrs.pass??50,dribble=attrs.dribble??50,defense=attrs.defense??50,physical=attrs.physical??50;
 const roles=[['Artillero imparable',shot*.55+pace*.18+physical*.27],['Creador de juego',pass*.55+dribble*.35+pace*.1],['Motor del equipo',physical*.4+pace*.3+defense*.3],['Muro defensivo',defense*.62+physical*.28+pass*.1],['Talento impredecible',dribble*.55+pace*.27+pass*.18]];
 const chosen=roles.sort((a,b)=>b[1]-a[1])[0]?.[0]||'Futbolista completo';
 const unique=new Set((s.draftSources||[]).map(x=>x.legend)).size;
 return {name:chosen,diversity:unique,signature:Math.round(Math.max(pace,shot,pass,dribble,defense,physical)),bond:unique<=4?'Identidad definida':unique>=7?'Talento versátil':'Equilibrio de legados'};
}
export function preparationEffects(s){const id=s.preparation?.year===((s.startYear||2026)+s.age-(s.startAge||16))?s.preparation.id:'none';return {
 id, goals:id==='definicion'?1.16:1, assists:id==='creacion'?1.20:1,
 minutes:id==='tactica'?.08:id==='caracter'?.025:0,
 injury:id==='fisico'?.60:id==='equilibrio'?.82:1,
 growth:id==='fisico'?.25:id==='tactica'?.20:0,
 morale:id==='equilibrio'?3:id==='caracter'?2:0,
 coach:id==='tactica'?4:id==='caracter'?2:0,
 reputation:id==='caracter'?2:0
};}
