/* RASCENSO — decisiones contextuales de temporada, sin cuestionarios repetitivos.
 * Las decisiones aportan modificadores acotados; no conceden victorias ni fichajes.
 */
const item=(id,tag,title,description,choices,eligible=()=>true)=>({id,tag,title,description,choices,eligible});
const ch=(title,detail,effect)=>({title,detail,effect});
export const SEASON_AGENDAS=[
 item('new-coach','NUEVO CUERPO TÉCNICO','Cambió el entrenador','El nuevo técnico todavía está evaluando a la plantilla. Los primeros partidos podrían definir tu lugar.',[
  ch('Presentarme como opción titular','Más competencia por los minutos',{minutes:.06,coach:3,injury:1.05}),ch('Escuchar su plan','Mejor adaptación al esquema',{minutes:.035,coach:5}),ch('Priorizar continuidad','Mantener tu ritmo con menor desgaste',{injury:.83,morale:2})]),
 item('new-signing','COMPETENCIA INTERNA','Llegó un fichaje para tu puesto','La directiva reforzó tu posición y la pelea por jugar será más exigente.',[
  ch('Competir por el puesto','Una apuesta por jugar más',{minutes:.06,morale:-2}),ch('Complementar al refuerzo','Juego asociado con el nuevo compañero',{assists:1.12,coach:2}),ch('Buscar claridad con el técnico','Saber qué rol tendrás',{coach:4,reputation:1})]),
 item('rivalry','CLÁSICO EN EL HORIZONTE','Se viene una fecha especial','La próxima visita del rival histórico está en boca de todos. Hay más presión que en una jornada cualquiera.',[
  ch('Asumir protagonismo','Mayor responsabilidad ofensiva',{goals:1.09,exposure:2}),ch('Cuidar el resultado','Jugar con cabeza fría',{minutes:.035,injury:.86}),ch('Respaldar al grupo','Priorizar el colectivo',{assists:1.07,morale:3})]),
 item('captain','VESTUARIO','Se busca una voz dentro del equipo','El capitán pidió que los referentes apoyen a los juveniles. Tu posición en el grupo puede cambiar.',[
  ch('Ser parte del liderazgo','Más confianza y exigencia',{coach:3,reputation:2}),ch('Guiar en el entrenamiento','Mejor coordinación del equipo',{assists:1.08,morale:2}),ch('Concentrarme en jugar','Reducir responsabilidades adicionales',{goals:1.03,injury:.94})]),
 item('setpiece','PELOTA DETENIDA','Hay una nueva responsabilidad','El entrenador abrió la posibilidad de participar más en tiros libres y acciones preparadas.',[
  ch('Pedir los tiros libres','Más influencia en ataque',{goals:1.08}),ch('Trabajar centros y pases','Mejores ocasiones para los compañeros',{assists:1.13}),ch('Mantener mi posición','No alterar la rutina actual',{coach:2,minutes:.02})]),
 item('fixture','CALENDARIO CARGADO','Se viene una seguidilla de partidos','Liga y copa se acercan al mismo tiempo. Tendrás que administrar tu energía.',[
  ch('Jugar siempre que pueda','Más minutos, mayor desgaste',{minutes:.09,injury:1.23}),ch('Rotar cuando corresponda','Menos riesgo de molestias',{minutes:-.025,injury:.65}),ch('Concentrarme en los duelos clave','Buscar rendimiento en fechas importantes',{goals:1.06,assists:1.04})]),
 item('transfer-rumor','RUMORES DE MERCADO','Tu nombre aparece en las noticias','Una publicación afirma que varios clubes siguen tu evolución, aunque no hay una oferta formal.',[
  ch('No alimentar rumores','Proteger la relación con el club',{coach:3,morale:2}),ch('Mostrar ambición deportiva','Más exposición ante otros proyectos',{reputation:3,coach:-1}),ch('Pedir discreción al agente','Mantener abiertas las posibilidades',{reputation:1,morale:2})]),
 item('away-form','PARTIDOS DE VISITA','Las salidas están costando','El equipo está dejando puntos fuera de casa y el cuerpo técnico busca soluciones.',[
  ch('Atacar espacios en transición','Mayor amenaza en contragolpes',{goals:1.08,injury:1.06}),ch('Ayudar en la circulación','Más aportación asociativa',{assists:1.11}),ch('Cumplir un rol táctico','Mejor valoración del entrenador',{coach:4,minutes:.035})]),
 item('form','MOMENTO DE FORMA','El equipo necesita regularidad','La prensa habla de una plantilla irregular. Cada fecha será importante para recuperar confianza.',[
  ch('Dar el ejemplo con intensidad','Más protagonismo en cancha',{minutes:.05,injury:1.12}),ch('Mejorar las asociaciones','Buscar fluidez colectiva',{assists:1.11,morale:2}),ch('Bajar la presión','Jugar sin cargas adicionales',{injury:.82,morale:4})]),
 item('academy','PROYECTO JUVENIL','Un juvenil entrena con el plantel','El club subió a un futbolista joven que podría jugar contigo durante la campaña.',[
  ch('Ayudarlo a adaptarse','Impulso al vínculo del vestuario',{morale:3,coach:2}),ch('Competir por cada minuto','Mayor exigencia personal',{minutes:.06,injury:1.07}),ch('Pedirle al DT asociarnos','Ajuste colectivo',{assists:1.10,coach:2})]),
 item('derby-week','SEMANA CLAVE','Semana de máxima tensión','Una cadena de partidos contra rivales directos pondrá a prueba la estabilidad del equipo.',[
  ch('Buscar marcar diferencias','Más ambición en ataque',{goals:1.09,injury:1.07}),ch('Preparar cada partido','Mayor disciplina táctica',{minutes:.035,coach:3}),ch('Jugar sin ansiedad','Mejor control de la presión',{morale:4,injury:.91})]),
 item('national-team','SELECCIÓN','Se acerca una convocatoria','La prensa considera que podrías llamar la atención del seleccionador, pero no hay garantías.',[
  ch('Concentrarme en el club','Mantener la confianza interna',{coach:4}),ch('Aumentar la intensidad','Mostrar rendimiento en la cancha',{goals:1.06,injury:1.1,reputation:1}),ch('Proteger el físico','Estar disponible para más fechas',{injury:.76,morale:2})],s=>(s.ovr||0)>=73),
 item('minor-knock','CARGAS FÍSICAS','Se acumula el cansancio','El cuerpo médico advierte sobre las cargas del calendario, aunque puedes seguir compitiendo.',[
  ch('Ajustar los entrenamientos','Reducir el riesgo físico',{injury:.62,minutes:-.015}),ch('Mantener la intensidad','Intentar sostener la titularidad',{minutes:.06,injury:1.23}),ch('Hablar con el entrenador','Coordinar tu participación',{coach:4,injury:.91})]),
 item('media','RUEDA DE PRENSA','Una declaración puede marcar la semana','Los periodistas preguntan por el futuro deportivo del equipo y tus expectativas.',[
  ch('Respaldar al club','Mejor relación interna',{coach:3,morale:2}),ch('Hablar de objetivos grandes','Mayor notoriedad pública',{reputation:3,coach:-1}),ch('No dar titulares','Evitar presión innecesaria',{injury:.95,morale:2})]),
 item('leadership','AMBICIÓN','Quieren que seas referencia','Te piden involucrarte más en los momentos difíciles de la campaña.',[
  ch('Aceptar la responsabilidad','Mayor influencia en el grupo',{reputation:2,coach:3}),ch('Ayudar desde el juego','Más conexiones ofensivas',{assists:1.1}),ch('Mantener el perfil bajo','Proteger el equilibrio personal',{injury:.92,morale:2})],s=>(s.history?.length||0)>=2),
 item('tactical-shift','CAMBIO DE ESQUEMA','El equipo prueba otra formación','El cuerpo técnico ensaya un planteamiento que podría cambiar tus responsabilidades.',[
  ch('Adaptarme a otra posición','Más oportunidades de minutos',{minutes:.08,goals:.96}),ch('Pedir mantener mi función','Cuidar tu fortaleza principal',{goals:1.05,coach:-1}),ch('Buscar libertad creativa','Más pases decisivos',{assists:1.11,minutes:-.015})]),
 item('scout','OJEADORES','Alguien observa los entrenamientos','Varios representantes de clubes estuvieron en la cancha. Todavía no sabes por quién preguntaron.',[
  ch('Jugar como siempre','Conservar el equilibrio',{morale:3,coach:2}),ch('Mostrar mis recursos','Mayor visibilidad ante observadores',{reputation:3,injury:1.05}),ch('Poner el grupo primero','Mejorar la confianza interna',{coach:4,assists:1.04})]),
 item('contract','PLANIFICACIÓN','La directiva evalúa el proyecto','Se vienen decisiones sobre la plantilla y el entrenador debe presentar sus prioridades.',[
  ch('Pedir estabilidad','Valorar la continuidad',{coach:4,morale:2}),ch('Solicitar un rol mayor','Subir la exigencia deportiva',{minutes:.05,coach:-1}),ch('Esperar las propuestas','Conservar margen de decisión',{reputation:1,injury:.94})]),
 item('final-stretch','RECTA FINAL','La temporada entra en su tramo decisivo','Los objetivos del club pueden definirse por detalles. El ambiente está más intenso que nunca.',[
  ch('Tomar riesgos en ataque','Buscar acciones decisivas',{goals:1.08,injury:1.1}),ch('Priorizar orden','Asegurar el trabajo colectivo',{minutes:.025,coach:3}),ch('Controlar el desgaste','Llegar entero a las fechas finales',{injury:.78,morale:2})]),
 item('club-identity','IDENTIDAD DEL CLUB','La hinchada quiere respuestas','Los aficionados esperan compromiso y recuerdan las promesas realizadas al inicio del año.',[
  ch('Comprometerme públicamente','Mayor confianza del entorno',{reputation:2,morale:1}),ch('Responder en los partidos','Rendimiento por sobre discursos',{goals:1.05,assists:1.04}),ch('Mantener cautela','No asumir promesas imposibles',{coach:2,morale:2})])
];
function hash(s){let x=2166136261;for(const c of String(s)){x^=c.charCodeAt(0);x=Math.imul(x,16777619);}return x>>>0;}
export function getSeasonAgenda(s){const year=(s.startYear||2026)+s.age-(s.startAge||16);
 const recent=(s.careerMoments||[]).filter(x=>x.kind==='agenda').slice(-4).map(x=>x.id);
 const choices=SEASON_AGENDAS.filter(x=>x.eligible(s)&&!recent.includes(x.id));
 const pool=choices.length?choices:SEASON_AGENDAS.filter(x=>x.eligible(s));
 return pool[hash(`${s.seed}:agenda09:${year}:${s.clubId}`)%pool.length];
}
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
export function chooseSeasonAgenda(s,choice){if(s.phase!=='season')return s;
 const year=(s.startYear||2026)+s.age-(s.startAge||16);if(s.seasonAgenda?.year===year)return s;
 const agenda=getSeasonAgenda(s),picked=agenda?.choices?.[choice];if(!picked)return s;
 const effect=picked.effect||{};
 return {...s,seasonAgenda:{year,id:agenda.id,choice,modifiers:effect},
  coachTrust:clamp((s.coachTrust??50)+(effect.coach||0),0,100),
  reputation:clamp((s.reputation??0)+(effect.reputation||0),0,100),
  morale:clamp((s.morale??70)+(effect.morale||0),0,100),
  careerMoments:[...(s.careerMoments||[]),{year,kind:'agenda',id:agenda.id,title:agenda.title,choice:picked.title}].slice(-100)};
}
export function seasonAgendaEffects(s){const year=(s.startYear||2026)+s.age-(s.startAge||16);return s.seasonAgenda?.year===year?s.seasonAgenda.modifiers||{}:{};}
