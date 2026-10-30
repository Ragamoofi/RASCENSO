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
 item('goalkeeper-hero','BAJO LOS TRES PALOS','El arquero gana protagonismo','El rival carga el área y el entrenador quiere que domines los centros bajo presión.',[
  ch('Ordenar a los defensas','Más confianza en el último bloque',{coach:4,minutes:.02}),ch('Salir a cortar centros','Mayor iniciativa y desgaste',{minutes:.055,injury:1.13}),ch('Estudiar al lanzador rival','Lectura y serenidad',{morale:3,injury:.93})],s=>s.position==='POR'),
 item('set-piece-specialist','BALÓN DETENIDO','La pizarra necesita un especialista','Los últimos partidos se decidieron en tiros libres y córners. Podrías asumir una responsabilidad nueva.',[
  ch('Quedarme para los córners','Buscar conexiones aéreas',{assists:1.10,injury:1.06}),ch('Practicar tiros libres','Mejorar el remate preparado',{goals:1.08}),ch('Diseñar una jugada corta','Hacer circular la pelota',{assists:1.12,coach:1})],s=>['MC','MCO','MI','MD','EI','ED'].includes(s.position)),
 item('defensive-order','DEFENSA','Ordenar la última línea','La zaga recibió goles evitables y el entrenador está ajustando el bloque defensivo.',[
  ch('Cerrar mi banda','Más disciplina táctica',{coach:4,minutes:.02}),ch('Salir a anticipar','Más recuperaciones pero mayor riesgo',{minutes:.045,injury:1.12}),ch('Apoyar la salida','Progresar con pelota',{assists:1.06,coach:1})],s=>['DFC','LD','LI','MCD'].includes(s.position)),
 item('veteran-mentor','VESTUARIO','Los jóvenes te buscan','Un juvenil te pidió consejo: quiere aprender de alguien que haya vivido varias temporadas profesionales.',[
  ch('Entrenar con él','Liderazgo y más carga',{coach:3,morale:2,injury:1.05}),ch('Ayudarlo antes del partido','Confianza del equipo',{morale:4,coach:2}),ch('Dejar que encuentre su camino','Conservar energía',{injury:.91})],s=>s.age>=32),
 item('comeback','SEGUNDA OPORTUNIDAD','Volver a demostrar','Tu protagonismo bajó en la última temporada y se abre una posibilidad de recuperar tu sitio.',[
  ch('Ganar el puesto en cancha','Más carga y oportunidades',{minutes:.09,injury:1.13}),ch('Pedir claridad al entrenador','Comprender tu rol',{coach:4}),ch('Ser útil en otro rol','Adaptarte al sistema',{assists:1.06,minutes:.045})],s=>s.lastSeason&&(s.lastSeason.matches||0)<17),
 item('continental-focus','COMPETICIÓN INTERNACIONAL','Un viaje que cambia todo','La competición continental exige preparar dos frentes. Cada fecha puede pesar en el mercado.',[
  ch('Priorizar los grandes partidos','Buscar impacto ofensivo',{goals:1.08,injury:1.09}),ch('Rotar entre encuentros','Llegar con piernas frescas',{minutes:-.025,injury:.70}),ch('Trabajar los detalles tácticos','Ayudar al equipo',{coach:3,assists:1.06})],s=>s.history?.some(t=>t.competitions?.some(c=>c.kind==='continental-club'))),
 item('local-hero','IDENTIDAD','La hinchada te empieza a reconocer','Los aficionados recuerdan tus mejores partidos y quieren que te quedes.',[
  ch('Comprometerme con el club','Más vínculo con el plantel',{coach:3,morale:3}),ch('Dejar que el fútbol hable','Manejar la presión',{injury:.9,morale:2}),ch('Reconocer que tengo ambición','Más visibilidad en el mercado',{reputation:3,coach:-1})],s=>s.history?.length>=3),
 item('captaincy','CAPITANÍA','El brazalete está en juego','El capitán actual perdió continuidad y el técnico busca una referencia con experiencia.',[
  ch('Postularme como capitán','Más reputación y exigencia',{coach:2,reputation:3,injury:1.08}),ch('Respaldar al referente','Fortalecer el vestuario',{morale:4,coach:2}),ch('Pensar solo en el rendimiento','Menos presión sobre tus hombros',{injury:.9})],s=>s.age>=27),
 item('scoring-drought','DELANTERA','Varios partidos sin encontrar el gol','Tu último período fue irregular frente al arco y el cuerpo técnico te pide decisiones más inteligentes.',[
  ch('Seguir pateando','Más ocasiones, más riesgos',{goals:1.10,injury:1.07}),ch('Buscar al mejor ubicado','Más pases de gol',{assists:1.14}),ch('Volver a lo simple','Recuperar confianza',{morale:4,coach:1})],s=>['DC','EI','ED'].includes(s.position)&&s.lastSeason?.matches>=15&&s.lastSeason?.goals<=5),
 item('relegation-battle','TABLA DE POSICIONES','Se vienen fechas por la permanencia','El club terminó cerca de la zona baja y cada punto puede decidir la categoría.',[
  ch('Prometer intensidad','Más minutos y riesgo',{minutes:.08,injury:1.13}),ch('Jugar con paciencia','Evitar errores innecesarios',{coach:3,morale:3}),ch('Asumir el liderazgo','Mejor ambiente',{reputation:2,coach:2})],s=>s.lastSeason?.leaguePosition>=11),
 item('title-race','PELEA ARRIBA','La ilusión de levantar la copa','Los hinchas empiezan a creer en el campeonato. El grupo necesita gestionar las expectativas.',[
  ch('Asumir el protagonismo','Más llegadas al área',{goals:1.08,injury:1.09}),ch('Repartir responsabilidades','Mejor juego colectivo',{assists:1.09,coach:2}),ch('Controlar la presión','Más calma en la recta final',{morale:4,injury:.91})],s=>s.lastSeason?.leaguePosition<=3),
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
