/* RASCENSO: escenas narrativas originales. Sin IA ni servicios externos.
 * Los personajes mantienen vínculos, el jugador decide y su respuesta se guarda.
 * Este motor no finge interpretar libremente cada frase; elige una intención explícita.
 */
import { COUNTRIES } from './countries.mjs';

const findClub=id=>COUNTRIES.flatMap(c=>c.clubs).find(c=>c.id===id);
const clubName=id=>findClub(id)?.name||'tu club';
const x=(n,a,b)=>Math.min(b,Math.max(a,n));
const actorNames={
 CL:['Ricardo Morales','Tomás Fuentes','Camila Rojas','Daniela Vargas','Elena'],
 AR:['Martín Cabrera','Lucas Fernández','Valentina Soto','Florencia Pérez','Elena'],
 ES:['Sergio Martín','Pablo García','Lucía Herrera','Irene Ruiz','Elena'],
 MX:['Javier Salinas','Mateo Torres','Valeria López','Mariana Reyes','Elena'],
 BR:['Rafael Oliveira','Lucas Costa','Marina Silva','Beatriz Alves','Elena']
};
export function initialRelationships(country){
 const a=actorNames[country]||['Andrés Navarro','Mateo Silva','Sofía Reyes','Clara Méndez','Elena'];
 return {
  coach:{name:a[0],role:'Entrenador',trust:50,known:true},
  teammate:{name:a[1],role:'Compañero',trust:50,known:true},
  agent:{name:a[2],role:'Representante',trust:45,known:false},
  press:{name:a[3],role:'Periodista',trust:50,known:false},
  family:{name:a[4],role:'Familiar',trust:75,known:true}
 };
}
const opt=(title,detail,dialogue,effect,impact)=>({title,detail,dialogue,effect,impact});
const catalog={
 arrival:{tag:'PRIMER CONTRATO',place:'Complejo deportivo · Primer día',actor:'coach',
  title:s=>`Tu primer día en ${clubName(s.clubId)}`,
  paragraphs:s=>[`La puerta del camarín se cierra detrás de ti. El escudo de ${clubName(s.clubId)} ocupa el centro de la pared. Tu nombre está escrito a mano sobre un casillero vacío.`,`El entrenador te observa un momento antes de hablar. Nadie sabe todavía qué clase de futbolista vas a ser.`],
  speech:s=>`«En este club no importan las promesas. Importa lo que hagas cuando te llegue la oportunidad. ¿Qué esperas de tu primera temporada?»`,
  options:s=>[
   opt('Quiero ganarme un puesto','Hablar con ambición y aceptar la competencia.','«Eso quería escuchar. Ahora demuéstralo en la cancha».',{coach:4,reputation:1},'El cuerpo técnico notó tus ganas de competir.'),
   opt('Vengo a aprender','Priorizar tu desarrollo y escuchar al entrenador.','«Tienes tiempo. Pero no desperdicies los entrenamientos».',{coach:6,morale:2},'Tu disposición facilitó tu adaptación.'),
   opt('Prefiero responder jugando','Guardar la energía para el primer entrenamiento.','«Está bien. El balón va a hablar por ti».',{coach:1,teammate:2},'Dejaste una primera impresión reservada.')]
 },
 coach:{tag:'CUERPO TÉCNICO',place:'Cancha de entrenamiento · Final de la jornada',actor:'coach',
  title:()=>`Una conversación después del entrenamiento`,
  paragraphs:s=>[`El resto del plantel ya se fue a las duchas. ${s.relationships.coach.name} te hace una seña para que te acerques.`,`La última temporada terminó con ${s.lastSeason?.matches||0} partidos disputados. El entrenador quiere saber cuál es tu siguiente paso.`],
  speech:s=>s.relationships.coach.trust>=65?'«He visto tu evolución. Confío en ti, pero quiero entender qué estás buscando».':'«Tienes condiciones, pero todavía necesito que me demuestres constancia. ¿Cómo vas a trabajar?»',
  options:()=>[
   opt('Pedir una oportunidad como titular','Explicar por qué estás listo para más minutos.','«Me gusta que lo pidas de frente. Voy a evaluarlo».',{coach:3,reputation:1},'Tu aspiración quedó sobre la mesa.'),
   opt('Preguntar qué debes mejorar','Escuchar una evaluación concreta.','«Trabaja la toma de decisiones y lo volveremos a hablar».',{coach:6,ovr:1},'Te llevas una tarea clara para la próxima campaña.'),
   opt('Defender tu rendimiento','Expresar tu desacuerdo sin retroceder.','«Está bien tener carácter. Pero el equipo va primero».',{coach:-4,morale:3},'La relación con el entrenador quedó un poco más tensa.')]
 },
 teammate:{tag:'VESTUARIO',place:'Camarín · Después del partido',actor:'teammate',
  title:()=>`Un compañero se acerca a ti`,
  paragraphs:s=>[`Mientras guardas tus cosas, ${s.relationships.teammate.name} se sienta en el banco contiguo. Hay ruido de fondo y algunos jugadores todavía comentan el último encuentro.`,`No parece buscar una pelea. Quiere saber si puede contar contigo fuera de la cancha.`],
  speech:()=>`«A veces uno siente que está solo acá dentro. ¿Puedo hablar contigo de algo que me preocupa?»`,
  options:()=>[
   opt('Escucharlo con calma','Darle tiempo y mantener la conversación en privado.','«Gracias. No necesitaba soluciones, solo que alguien escuchara».',{teammate:8,morale:2},'Construiste una confianza que puede durar años.'),
   opt('Ofrecer ayuda en el campo','Proponerle entrenar juntos para recuperar confianza.','«Mañana llego temprano. Hagámoslo».',{teammate:5,coach:2},'El compromiso se traslada al entrenamiento.'),
   opt('Pedirle hablar después','No cerrar la puerta, pero concentrarte en tu situación.','«Está bien, supongo. Nos vemos mañana».',{teammate:-3,morale:1},'La conversación quedó pendiente.')]
 },
 press:{tag:'PRENSA',place:'Zona mixta · Micrófonos y cámaras',actor:'press',
  title:()=>`Te esperan en la zona mixta`,
  paragraphs:s=>[`La temporada dejó ${s.lastSeason?.goals||0} goles y ${s.lastSeason?.assists||0} asistencias a tu nombre. Una periodista se adelanta con su grabadora.`,`Las palabras que elijas podrían repetirse mañana en los titulares.`],
  speech:()=>`«¿Estás conforme con lo conseguido o crees que ya es momento de buscar un club más grande?»`,
  options:()=>[
   opt('Mi prioridad es este equipo','Mostrar compromiso con el plantel actual.','«Una respuesta clara. Veremos si la sostienes en el mercado».',{press:4,coach:4},'Tu mensaje reforzó la imagen de compromiso.'),
   opt('Quiero llegar a la élite','Ser transparente respecto de tu ambición.','«Entonces habrá que estar atentos a tu futuro».',{press:5,reputation:3,coach:-2},'Tu nombre comienza a circular con mayor fuerza.'),
   opt('No hablar de mi futuro','Evitar especulaciones frente a la prensa.','«Entiendo. Dejaremos la pregunta abierta».',{press:-2,morale:1},'Mantuviste el control de la conversación.')]
 },
 agent:{tag:'REPRESENTANTE',place:'Cafetería · Reunión privada',actor:'agent',
  title:()=>`Tu representante tiene una propuesta`,
  paragraphs:s=>[`Tu teléfono vibra: un mensaje de ${s.relationships.agent.name}. Te pide una reunión antes de que empiece la siguiente temporada.`,`No hay un contrato firmado. Solamente interés y una pregunta sobre lo que deseas para tu carrera.`],
  speech:()=>`«Puedo intentar mover tu nombre, pero necesito saber qué valoras más: jugar, ganar dinero o estar en un club grande».`,
  options:()=>[
   opt('Priorizar minutos','Un proyecto deportivo por encima del prestigio.','«Bien. Buscaré un lugar donde tengas protagonismo».',{agent:6,coach:1},'Tu representante conoce mejor tus prioridades.'),
   opt('Buscar un salto de nivel','Aceptar competencia más exigente para crecer.','«Es una apuesta grande. Voy a tantear el mercado».',{agent:4,reputation:2},'Quedó clara tu ambición profesional.'),
   opt('No apurar una salida','Concentrarte en la camiseta actual.','«Perfecto. No voy a forzar nada por ahora».',{agent:2,coach:3},'Elegiste estabilidad sin cerrar puertas.')]
 },
 injury:{tag:'ENFERMERÍA',place:'Centro médico · Evaluación física',actor:'coach',
  title:()=>`El cuerpo te pide un descanso`,
  paragraphs:s=>[`La acumulación de partidos se siente en las piernas. Tras el entrenamiento, un integrante del cuerpo médico recomienda bajar las cargas.`,`El entrenador te encuentra en el pasillo y quiere conocer tu postura antes de tomar una decisión.`],
  speech:()=>`«Quiero que juegues, pero no a cualquier costo. ¿Cómo te sientes realmente?»`,
  options:()=>[
   opt('Ser sincero y recuperarte','Aceptar el tratamiento y no arriesgar tu futuro.','«Prefiero tenerte sano el resto del año».',{coach:5,morale:2},'El cuidado físico gana prioridad.'),
   opt('Pedir que te evalúen otra vez','Buscar otra revisión antes de decidir.','«Hablaremos con los médicos; sin promesas».',{coach:2,reputation:1},'Insististe sin pasar por encima del equipo médico.'),
   opt('Decir que estás listo','Mostrar confianza pese a las molestias.','«Esa actitud vale, pero decidirá el cuerpo médico».',{coach:-2,morale:1},'El entrenador percibe tu impaciencia.')]
 },
 family:{tag:'VIDA PERSONAL',place:'Videollamada · Noche libre',actor:'family',
  title:s=>`Una llamada desde ${s.city||'casa'}`,
  paragraphs:s=>[`Por un rato, el ruido del fútbol queda lejos. ${s.relationships.family.name} aparece en la pantalla del teléfono. Te pregunta si estás comiendo bien y durmiendo lo suficiente.`,`La distancia pesa más cuando los partidos terminan y vuelves a estar a solas.`],
  speech:()=>`«Estamos orgullosos de ti, pero no queremos que te pierdas en todo esto. ¿Cómo te está tratando el fútbol?»`,
  options:()=>[
   opt('Contar cómo te sientes','Ser abierto sobre tus dudas y expectativas.','«No tienes que demostrar nada cada vez que hablamos».',{family:7,morale:4},'La conversación te devuelve tranquilidad.'),
   opt('Hablar de tus metas','Compartir tus sueños y próximos pasos.','«Entonces ve por ellos. Nosotros te apoyamos».',{family:4,morale:3,reputation:1},'Recordaste por qué comenzaste.'),
   opt('Cambiar de tema','Disfrutar un momento sin hablar de fútbol.','«Mejor. Cuéntame de tu semana».',{family:3,morale:2},'Te permitiste desconectarte un rato.')]
 },
 bench:{tag:'DECISIÓN TÉCNICA',place:'Sala de video · Análisis del último año',actor:'coach',
  title:()=>`No estás jugando tanto como esperabas`,
  paragraphs:s=>[`Tu última temporada terminó con ${s.lastSeason?.matches||0} apariciones. El reloj avanzó más lento desde el banco que sobre el césped.`,`El entrenador acepta conversar contigo, pero no promete cambiar el once titular.`],
  speech:()=>`«Entiendo tu frustración. ¿Quieres saber qué te falta o vienes a exigirme minutos?»`,
  options:()=>[
   opt('Pedir un plan concreto','Buscar claridad sobre lo que debes demostrar.','«Te daré un plan; depende de ti cumplirlo».',{coach:6,ovr:1},'Te llevas una ruta de mejora.'),
   opt('Mostrar tu molestia','Reclamar con firmeza por las oportunidades.','«La alineación la decido yo. No lo olvides».',{coach:-7,morale:2},'La tensión con el cuerpo técnico aumentó.'),
   opt('Aceptar la competencia','Prometer trabajo sin pedir garantías.','«Esa actitud puede llevarte lejos».',{coach:4,morale:1},'Aumenta tu disposición a competir.')]
 },
 rival:{tag:'DUELO',place:'Pasillo del estadio · Después del partido',actor:'teammate',
  title:()=>`El vestuario habla de tu próximo desafío`,
  paragraphs:s=>[`La temporada todavía deja temas sin resolver. ${s.relationships.teammate.name} te alcanza al salir de la charla técnica.`,`Un duelo importante se acerca y la presión empieza a sentirse.`],
  speech:()=>`«El equipo te necesita con la cabeza fría. ¿Cómo vas a encarar este partido?»`,
  options:()=>[
   opt('Concentrarme en el colectivo','Priorizar el plan del equipo.','«Así tenemos más posibilidades. Cuenta conmigo».',{teammate:5,coach:3},'El grupo percibe tu compromiso.'),
   opt('Buscar ser protagonista','Aceptar que quieres marcar la diferencia.','«Entonces espero que estés listo para hacerlo».',{teammate:1,reputation:3},'Te exigiste un papel importante.'),
   opt('No adelantar resultados','Poner el foco en el siguiente entrenamiento.','«Mejor hablar después de jugar, tienes razón».',{teammate:2,morale:2},'Evitaste cargar con promesas.')]
 },
 fan_press:{tag:'TUS COLORES',place:'Entrevista · Pregunta inesperada',actor:'press',
  title:s=>`La prensa recuerda tu vínculo con ${clubName(s.fanClubId)}`,
  paragraphs:s=>[`En medio de las preguntas sobre ${clubName(s.clubId)}, aparece un tema personal: el club del que eras hincha antes de ser profesional.`,`No hay ninguna oferta sobre la mesa. Simplemente alguien encontró una entrevista antigua donde hablabas de ${clubName(s.fanClubId)}.`],
  speech:s=>`«¿Sigues siendo hincha de ${clubName(s.fanClubId)}? ¿O cambiaste de sentimientos ahora que juegas en ${clubName(s.clubId)}?»`,
  options:s=>[
   opt('Siempre seré hincha','Reconocer tus raíces sin faltar el respeto a tu club actual.',`«Entonces ${clubName(s.fanClubId)} ocupa un lugar especial. Entendido».`,{press:5,reputation:2,coach:-1},'Reconociste públicamente tu vínculo de infancia.'),
   opt('Defender mi camiseta actual','Explicar que hoy tu prioridad es tu trabajo.',`«Buena respuesta. Los hinchas de ${clubName(s.clubId)} seguro la valoran».`,{press:3,coach:5},'Pusiste por delante tu compromiso profesional.'),
   opt('Es algo privado','No querer convertir tus afectos en noticia.','«Está bien, no insistiremos».',{press:-2,morale:1},'Mantuviste tu historia personal fuera de los titulares.')]
 },
 fan_home:{tag:'CUMPLIR UN SUEÑO',place:'Vestuario · Un escudo familiar',actor:'family',
  title:s=>`Hoy vistes los colores de ${clubName(s.fanClubId)}`,
  paragraphs:s=>[`De niño imaginabas lo que sería entrar a este vestuario. Ahora tu camiseta lleva tu propio nombre.`,`La emoción no te garantiza minutos ni titulares. Esa parte tendrás que ganártela como cualquier otro futbolista.`],
  speech:()=>`«Todavía recuerdo cuando hablabas de este equipo sin parar. ¿Te das cuenta de dónde estás?»`,
  options:()=>[
   opt('Es un sueño, pero tengo que rendir','Disfrutar el momento sin dejarte llevar por la emoción.','«Exacto. Que nunca se te olvide por qué llegaste».',{family:7,coach:3,morale:4},'Viviste un sueño con los pies en la tierra.'),
   opt('Dedicarle esta etapa a mi familia','Compartir la alegría con quienes te apoyaron.','«Eso vale más que cualquier camiseta».',{family:9,morale:5},'El vínculo familiar se fortaleció.'),
   opt('Ponerme objetivos más grandes','Pensar en títulos y en un lugar en la historia del club.','«Entonces que esta sea solo la primera página».',{family:4,reputation:3},'Tu sueño se transforma en una nueva meta.')]
 },
 fan_departure:{tag:'DESPEDIDA',place:'Salida del estadio · Última noche',actor:'agent',
  title:s=>`Te marchas de ${clubName(s.fanClubId)}`,
  paragraphs:s=>[`Defendiste la camiseta de tus amores. Ahora la carrera te lleva por otro camino.`,`Tu representante te encuentra mirando el estadio una última vez. No sabes si volverás a vestirte con esos colores.`],
  speech:()=>`«Sé que este club era especial para ti. ¿Cómo quieres despedirte?»`,
  options:()=>[
   opt('Dejar un mensaje a los hinchas','Agradecer públicamente lo vivido.','«Será una despedida recordada. Voy a coordinar el mensaje».',{press:4,agent:3,morale:2},'Tu historia con los hinchas continúa fuera del club.'),
   opt('Despedirme en privado','Cerrar una etapa sin cámaras ni declaraciones.','«Lo entiendo. Nos vamos cuando estés listo».',{agent:4,family:2},'Elegiste una despedida íntima.'),
   opt('Prometer que algún día volveré','Expresar un deseo, sin comprometer un fichaje futuro.','«Ojalá se dé. Pero sabemos cómo funciona el fútbol».',{reputation:2,morale:3},'Dejaste una promesa emocional, no contractual.')]
 },
 milestone:{tag:'RECONOCIMIENTO',place:'Estadio · Fin de temporada',actor:'teammate',
  title:s=>s.lastSeason?.goals>=12?'Tus goles no pasan inadvertidos':'Comienzan a hablar de tu crecimiento',
  paragraphs:s=>[`El plantel comenta lo ocurrido en la última temporada. Tu nombre aparece entre los protagonistas de varias conversaciones.`,`No hay un premio asegurado ni un nuevo contrato firmado, pero el reconocimiento comienza a sentirse.`],
  speech:()=>`«Has trabajado mucho para llegar hasta acá. ¿Qué se siente que ahora todos hablen de ti?»`,
  options:()=>[
   opt('Sin mis compañeros no habría podido','Agradecer al equipo por ayudarte.','«Eso se nota. Seguimos juntos».',{teammate:7,coach:2},'Compartiste el mérito con el plantel.'),
   opt('Todavía quiero más','Decir que esta es una etapa de un objetivo mayor.','«Eso espero. Yo también quiero más».',{reputation:3,teammate:1},'Tu ambición sigue presente.'),
   opt('Prefiero mantener la calma','No permitir que las expectativas te distraigan.','«Buena elección. Mañana entrenamos igual».',{coach:3,morale:2},'Te mantuviste enfocado.')]
 }
};
export const STORY_IDS=Object.keys(catalog);
export function sceneFor(s){
 const entry=catalog[s.pendingEvent]||catalog.coach;
 const speaker=s.relationships?.[entry.actor]||initialRelationships(s.country)[entry.actor];
 return {id:s.pendingEvent,title:entry.title(s),tag:entry.tag,place:entry.place,actor:entry.actor,speaker,paragraphs:entry.paragraphs(s),speech:entry.speech(s),options:entry.options(s)};
}
export function chooseScene(s,roll){
 if(s.fanClubId && s.clubId===s.fanClubId && !s.storyFlags?.playedForFan) return 'fan_home';
 if(s.lastSeason?.matches<12)return roll()<.52?'bench':'coach';
 if(s.lastSeason?.injuryWeeks>=6)return 'injury';
 if(s.fanClubId&&s.clubId!==s.fanClubId&&roll()<.28)return 'fan_press';
 if((s.lastSeason?.goals||0)>=12&&roll()<.4)return 'milestone';
 return ['coach','teammate','press','agent','family','rival','milestone'][Math.floor(roll()*7)];
}
export function resultOfScene(s,scene,index,playerText=''){
 const o=scene.options[index]||scene.options[0];const effect=o.effect||{};
 const relation={...s.relationships};
 for(const key of ['coach','teammate','agent','press','family'])if(effect[key])relation[key]={...relation[key],trust:x((relation[key]?.trust||50)+effect[key],0,100),known:true};
 const ovr=effect.ovr?x(s.ovr+effect.ovr,40,s.potential):s.ovr;
 const newState={...s,relationships:relation,ovr,coachTrust:relation.coach.trust,
   morale:x((s.morale??70)+(effect.morale||0),0,100),reputation:x((s.reputation??0)+(effect.reputation||0),0,100),
   sceneBeat:1,sceneChoice:index,scenePlayerText:String(playerText||'').trim().slice(0,240),
   decisions:[...s.decisions,{age:s.age,text:`${scene.title}: ${o.title}`}],
   storyLog:[...(s.storyLog||[]),{year:(s.startYear||2026)+(s.age-(s.startAge||16)),title:scene.title,tag:scene.tag,actor:scene.speaker.name,choice:o.title,words:String(playerText||'').trim().slice(0,240),result:o.impact,club:clubName(s.clubId)}].slice(-100)};
 return newState;
}
export function sceneOutcome(s){const scene=sceneFor(s);return scene.options[s.sceneChoice??0]||scene.options[0];}
