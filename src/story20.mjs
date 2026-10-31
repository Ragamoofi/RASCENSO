/* RASCENSO 2.0 · Narrativa conectada al mundo.
 * Cada escena lee hechos de la partida (entrenador real del club, competidor por el puesto,
 * objetivos de la directiva, rival generacional, lesiones, premios, crisis del club) y sus
 * decisiones dejan "hilos" que el motor recuerda y cobra en temporadas posteriores.
 */
import { clamp, rng, yearOf, addThread, resolveThread, hasThread, activeThreads, bestPositions, NEIGHBOURS, POSITION_NAMES, ovrFromAttributes, potentialFrom, COACH_STYLES } from './career20.mjs';
import { worldClub, coachFor, worldRival, dynamicPrestige, personName, ELIGIBLE_CLUBS } from './world20.mjs';
import { normalizeProfile } from './archetypes17.mjs';

const o=(title,detail,dialogue,effect,impact)=>({title,detail,dialogue,effect,impact});
const clubName=id=>worldClub(id)?.name||'tu club';
// El contexto de una escena se calcula una vez por estado (los estados nunca se modifican en el sitio).
const CTX=new WeakMap();
function ctx(s){let c=CTX.get(s);if(!c){c=buildCtx(s);CTX.set(s,c);}return c;}
function buildCtx(s){
 const club=worldClub(s.clubId),coach=coachFor(s,s.clubId),last=s.lastSeason||{},squad=s.squad||{};
 return {club,coach,last,squad,rival:squad.rival,nemesis:worldRival(s),year:yearOf(s),data:s.sceneData||{}};
}
const pct=v=>`${Math.round(v)}%`;

export const WORLD_SCENES={
 w_new_coach:{tag:'NUEVO ENTRENADOR',place:'Sala de reuniones · Primer día del nuevo cuerpo técnico',actor:'coach',
  title:s=>`${ctx(s).coach.name} toma el mando`,
  paragraphs:s=>{const {coach,club}=ctx(s);return [`${club.name} presentó a ${coach.name}, ${coach.age} años, conocido como un ${coach.styleName.toLowerCase()}.`,COACH_STYLES[coach.style].description,'Todo lo que ganaste con el anterior cuerpo técnico vuelve a estar en discusión.'];},
  speech:s=>({formador:'«Me interesa quién puedes llegar a ser, no solo quién eres hoy».',pragmatico:'«Acá juega el que rinde el domingo. Lo demás es ruido».',ofensivo:'«Quiero valentía. Si te equivocas buscando el arco, te banco».',disciplinario:'«Llegar cinco minutos antes es llegar tarde. ¿Entendido?»',gestor:'«Este grupo tiene que ser una familia. ¿Qué lugar quieres ocupar en ella?»',estratega:'«Necesito futbolistas que entiendan el juego. Quizás te vea en otro sitio».'})[ctx(s).coach.style],
  options:s=>{const st=ctx(s).coach.style;return [
   o('Presentarte y pedir una oportunidad','Mostrar ambición desde el primer día.','«Bien. Te vas a ganar el lugar como todos».',{coach:st==='disciplinario'?1:st==='pragmatico'?4:3,reputation:1},'El nuevo técnico registró tu nombre desde el primer día.'),
   o('Adaptarte a su idea en silencio','Entrenar según sus indicaciones y esperar.','«Eso es lo que necesito: compromiso».',{coach:st==='disciplinario'||st==='estratega'?7:4,morale:-1},'Tu disciplina encaja con el nuevo método.'),
   o('Recordar lo que ya conseguiste','Defender el estatus que tenías con el técnico anterior.','«El pasado no juega. Veremos».',{coach:st==='gestor'?3:-3,morale:2,teammate:1},'Marcaste territorio; el técnico tomó nota.')];}
 },
 w_squad_rival:{tag:'COMPETENCIA POR EL PUESTO',place:'Entrenamiento · Partido de once contra once',actor:'coach',
  title:s=>`${ctx(s).rival?.name||'Un compañero'} quiere tu lugar`,
  paragraphs:s=>{const {rival,coach}=ctx(s);const diff=(s.ovr||60)-(rival?.ovr||60);return [`${rival.name} (${rival.age} años, media ${rival.ovr}) compite contigo por el puesto de ${POSITION_NAMES[s.position].toLowerCase()}.`,diff>=3?'Hoy partes con ventaja, pero él no afloja en ningún entrenamiento.':diff<=-3?'Hoy está por delante en la consideración del cuerpo técnico.':'La pelea está tan pareja que cualquier detalle puede definirla.',`${coach.name} observa cada duelo desde la línea.`];},
  speech:s=>'«Los dos me sirven. Pero el domingo juega uno solo».',
  options:s=>[
   o('Doble turno de entrenamiento','Más carga física para ganar la pelea: mejora más rápido, con mayor riesgo de lesión.','«Así se gana un puesto».',{coach:4,morale:1,thread:{kind:'extra_training',years:1}},'Entrenarás en doble turno toda la temporada.'),
   o('Pedirle al técnico una regla clara','Que te diga qué necesita para elegirte.','«Rendimiento y regularidad. Así de simple».',{coach:2,teammate:1,thread:{kind:'promise_minutes',years:1,data:{soft:true}}},'El técnico se comprometió a darte una oportunidad real.'),
   o('Ayudar a tu competidor','Entender que el equipo gana si ambos crecen.','«Pocos lo hacen. El vestuario lo nota».',{teammate:8,coach:2,morale:2,rivalBond:true},'El vestuario te ve como un líder; la competencia sigue, pero sana.')]
 },
 w_position_change:{tag:'CAMBIO DE POSICIÓN',place:'Sala de video · Análisis táctico',actor:'coach',
  title:s=>`Te ven como ${POSITION_NAMES[ctx(s).data.position]||'otra cosa'}`,
  paragraphs:s=>{const d=ctx(s).data;return [`El cuerpo técnico revisó tus partidos. Según sus datos, rendirías mejor como ${POSITION_NAMES[d.position].toLowerCase()} (media estimada ${d.newOvr}, frente a ${s.ovr} actual).`,'Cambiar de puesto puede relanzar una carrera… o hacerte perder la identidad que construiste.'];},
  speech:s=>'«No te pido que lo decidas hoy. Pero creo que ahí puedes marcar la diferencia».',
  options:s=>{const d=ctx(s).data;return [
   o(`Aceptar: pasar a ${d.position}`,'Reinventarte en una nueva función.','«Valiente. Lo vamos a trabajar juntos».',{coach:6,position:d.position,thread:{kind:'position_trial',years:1,data:{from:s.position}}},`Desde ahora eres ${POSITION_NAMES[d.position].toLowerCase()}.`),
   o('Probarlo solo en algunos partidos','Mantener tu puesto, abierto a variantes.','«Lo usaremos como plan B».',{coach:2,morale:-1},'Seguirás en tu puesto, con alguna variante táctica.'),
   o('Rechazarlo','Defender tu posición natural.','«Entonces demuéstrame que me equivoco».',{coach:-4,morale:3},'Mantuviste tu identidad; el técnico espera respuestas.')];}
 },
 w_board_pressure:{tag:'DIRECTIVA',place:'Oficinas del club · Reunión con la directiva',actor:'agent',
  title:s=>`La directiva de ${ctx(s).club.name} pide explicaciones`,
  paragraphs:s=>{const ob=ctx(s).last.objectives;return [ob?`El objetivo era «${ob.board.text.toLowerCase()}». El equipo terminó ${ob.board.actual}°.`:'La temporada no cumplió las expectativas de la dirigencia.',`El presidente quiere saber si eres parte de la solución. Su confianza en ti: ${pct(s.squad?.board??50)}.`];},
  speech:s=>'«Necesitamos compromiso. ¿Podemos contar contigo para dar vuelta esta situación?»',
  options:s=>[
   o('Comprometerte públicamente','Asumir responsabilidad y aceptar un ultimátum.','«Eso queremos escuchar. Ahora, resultados».',{board:12,fans:4,thread:{kind:'board_ultimatum',years:1}},'La directiva te dio un voto de confianza con condiciones.'),
   o('Señalar los problemas del plantel','Decir que el equipo necesita refuerzos.','«No vinimos a escuchar excusas».',{board:-8,teammate:3,reputation:1},'Pusiste el foco en la planificación del club.'),
   o('Insinuar que podrías irte','Dejar abierta la puerta de salida.','«Si no quieres estar, tampoco vamos a retenerte».',{board:-12,thread:{kind:'transfer_request',years:1}},'Tu nombre pasa a la lista de transferibles.')]
 },
 w_broken_promise:{tag:'UNA PROMESA ROTA',place:'Despacho del entrenador',actor:'coach',
  title:()=>'Te prometieron minutos',
  paragraphs:s=>{const l=ctx(s).last;return [`La temporada pasada el entrenador se comprometió a darte protagonismo. Terminaste como ${String(l.role||'suplente').toLowerCase()}, con ${l.matches||0} partidos.`,'Es la hora de cobrar esa palabra.'];},
  speech:s=>'«Las cosas no salieron como planeamos. Sé lo que te dije».',
  options:s=>[
   o('Exigir que se cumpla','Confrontar al técnico frente a frente.','«Tienes razón. Esta vez va en serio».',{coach:-3,morale:2,thread:{kind:'promise_minutes',years:1},resolve:'promise_minutes'},'El técnico renovó su promesa, presionado.'),
   o('Pedir salir del club','Buscar un lugar donde sí confíen en ti.','«Entiendo. No voy a frenarte».',{coach:-6,board:-5,thread:{kind:'transfer_request',years:1},resolve:'promise_minutes'},'Tu representante buscará una salida en el próximo mercado.'),
   o('Dejarlo pasar','Seguir trabajando sin conflicto.','«Gracias por entenderlo».',{coach:4,morale:-6,resolve:'promise_minutes'},'Tragaste la frustración. El vestuario lo notó.')]
 },
 w_big_interest:{tag:'UN CLUB TE SIGUE',place:'Llamada de tu representante · Noche',actor:'agent',
  title:s=>`${clubName(ctx(s).data.clubId)} pregunta por ti`,
  paragraphs:s=>{const d=ctx(s).data,c=worldClub(d.clubId);return [`${s.relationships?.agent?.name||'Tu representante'} recibió una consulta de ${c.name} (${c.country}). Te siguen desde hace meses.`,`No es una oferta formal: el interés puede enfriarse si tu temporada no acompaña.`];},
  speech:s=>'«Esto puede cambiarte la vida. ¿Cómo quieres que lo manejemos?»',
  options:s=>{const d=ctx(s).data;return [
   o('Empujar la negociación','Que tu representante insista para llegar a una oferta.','«Voy a mover todo. Tú sigue jugando bien».',{agent:6,board:-6,thread:{kind:'big_club_interest',years:1,data:{clubId:d.clubId}}},'Si mantienes el nivel, ese club estará en tu próximo mercado.'),
   o('Enfocarte en tu club','Agradecer el interés y no distraerte.','«Lo entiendo. Las puertas quedan abiertas».',{coach:4,board:6,fans:5,morale:1},'Tu compromiso con el club sumó puntos en la directiva y la hinchada.'),
   o('Hablarlo en la prensa','Hacer público el interés para subir tu valor.','«Arriesgado, pero sube tu cotización».',{reputation:3,board:-10,fans:-8,press:4,thread:{kind:'big_club_interest',years:1,data:{clubId:d.clubId}}},'Tu cotización subió; tu hinchada no te lo perdona.')];}
 },
 w_generation_rival:{tag:'TU RIVAL GENERACIONAL',place:'Noticias deportivas · Redes sociales',actor:'press',
  title:s=>`Todos hablan de ${ctx(s).nemesis?.name}`,
  paragraphs:s=>{const n=ctx(s).nemesis;const c=worldClub(n.clubId);const diff=n.ovr-(s.ovr||60);return [`${n.name} nació el mismo año que tú y juega como ${POSITION_NAMES[n.pos].toLowerCase()} en ${c?.name||'otro club'}. Los periodistas no dejan de compararlos.`,diff>=3?`Hoy te lleva ventaja: su media es ${n.ovr} y la tuya ${s.ovr}.`:diff<=-3?`Hoy estás por delante: tu media ${s.ovr} contra su ${n.ovr}.`:`La comparación está igualada: ${n.ovr} contra ${s.ovr}.`];},
  speech:s=>'«¿Qué le respondes a quienes dicen que él llegará más lejos?»',
  options:s=>[
   o('Responder en la cancha','Usarlo como motivación silenciosa.','«Las respuestas se dan los domingos».',{morale:3,coach:2},'Convertiste la comparación en combustible.'),
   o('Desafiarlo públicamente','Prometer superarlo esta temporada.','«Eso será titular mañana».',{reputation:2,press:3,thread:{kind:'public_challenge',years:1,data:{vs:ctx(s).nemesis.id}}},'La prensa medirá vuestros números al final del año.'),
   o('Elogiarlo con respeto','Rebajar la tensión y mostrar madurez.','«Gran gesto. No todos lo hacen».',{press:5,morale:-1,teammate:2},'Tu imagen pública salió reforzada.')]
 },
 w_serious_injury:{tag:'LESIÓN GRAVE',place:'Clínica del club · Diagnóstico',actor:'family',
  title:()=>'El diagnóstico que nadie quiere escuchar',
  paragraphs:s=>[`La lesión de la temporada pasada (${ctx(s).last.injuryWeeks} semanas) dejó dudas. Los médicos presentan dos caminos y un especialista ofrece un tercero.`,'Lo que decidas puede marcar los próximos años de tu carrera.'],
  speech:s=>'«Tu cuerpo es tu herramienta. No lo apures»',
  options:s=>[
   o('Recuperación completa','Respetar todos los plazos médicos.','«Volverás más fuerte».',{morale:-2,family:4,thread:{kind:'nutrition',years:1}},'Recuperación completa: menor riesgo de recaída esta temporada.'),
   o('Volver cuanto antes','Acortar plazos para no perder el puesto.','«Es tu decisión, pero el riesgo es alto».',{coach:5,morale:2,thread:{kind:'rushed_return',years:1}},'Más minutos de inmediato, con mayor riesgo de recaer.'),
   o('Especialista en el extranjero','Pagar de tu bolsillo un tratamiento de élite.','«Es caro, pero es lo mejor».',{money:-Math.max(15000,Math.round((s.contract?.salary||60000)*.25)),morale:3,heal:true},'Inversión personal: recuperas parte de lo perdido.')]
 },
 w_veteran_body:{tag:'EL PASO DEL TIEMPO',place:'Casa · Después del último partido',actor:'family',
  title:s=>`${s.age} años: el cuerpo empieza a hablar`,
  paragraphs:s=>{const l=ctx(s).last;return [`Terminaste la temporada con media ${s.ovr}${l.ovrBefore?` (antes ${l.ovrBefore})`:''}. Las recuperaciones son más lentas y los jóvenes empujan.`,`${s.relationships?.family?.name||'Tu familia'} te pregunta, con cuidado, cuánto tiempo más quieres seguir.`];},
  speech:s=>'«Lo que decidas, estaremos contigo. Pero queremos que lo decidas tú, no tu cuerpo».',
  options:s=>[
   o('Anunciar que será tu última temporada','Una despedida planificada, con homenaje.','«Que sea inolvidable».',{fans:10,morale:4,thread:{kind:'last_dance',years:1}},'Jugarás tu última temporada como despedida.'),
   o('Seguir mientras el cuerpo aguante','Cuidarte más y competir.','«Entonces cuídate como nunca».',{morale:2,thread:{kind:'nutrition',years:2}},'Plan profesional: el declive será más lento.'),
   o('Retirarte ahora','Colgar los botines en este momento.','«Gracias por todo lo que nos diste».',{retire:true},'Decidiste poner fin a tu carrera profesional.')]
 },
 w_club_crisis:{tag:'CRISIS EN EL CLUB',place:'Vestuario · Reunión de plantel',actor:'teammate',
  title:s=>`${ctx(s).club.name} atraviesa una crisis económica`,
  paragraphs:s=>[`El club atrasó salarios y la directiva pidió a los jugadores con mayores sueldos una rebaja temporal.`,'Algunos compañeros ya buscan salida. Otros esperan lo que hagan los referentes.'],
  speech:s=>'«Si los que más ganan dan el ejemplo, el resto los sigue»',
  options:s=>[
   o('Aceptar la rebaja','Reducir tu sueldo un 25 % esta temporada.','«Eso es tener camiseta».',{fans:12,board:14,teammate:6,salaryCut:.25,thread:{kind:'salary_cut',years:1}},'Tu gesto fue celebrado por la hinchada.'),
   o('Negociar una rebaja menor','Un 10 %, sin renunciar a tus condiciones.','«Algo es algo».',{board:5,salaryCut:.1},'Acuerdo intermedio con la directiva.'),
   o('Negarte y pedir el pago','Exigir que se cumpla tu contrato.','«Estás en tu derecho, pero no lo olvidaremos».',{board:-14,fans:-6,morale:1,thread:{kind:'transfer_request',years:1}},'La directiva te puso en la lista de transferibles.')]
 },
 w_relegated:{tag:'DESCENSO',place:'Estadio vacío · Tras el último partido',actor:'teammate',
  title:s=>`${ctx(s).club.name} pierde la categoría`,
  paragraphs:s=>[`El equipo terminó ${ctx(s).last.leaguePosition}° y jugará en segunda división.`,'Los hinchas lloran en la tribuna. Los representantes ya llaman a los jugadores con mercado.'],
  speech:s=>'«Algunos se van a ir. ¿Tú qué vas a hacer?»',
  options:s=>[
   o('Quedarte para devolverlo a Primera','Ser la cara del regreso.','«Eso es ser de acá».',{fans:18,board:10,morale:-2},'La hinchada no olvidará que te quedaste.'),
   o('Buscar un club de Primera','Pedir a tu representante una salida.','«Lo entendemos, aunque duele».',{fans:-10,agent:4,thread:{kind:'transfer_request',years:1}},'Saldrás en el próximo mercado si llegan ofertas.'),
   o('Decidir según las ofertas','No cerrarte ninguna puerta.','«Prudente».',{morale:-1},'Tu futuro dependerá del mercado.')]
 },
 w_promoted:{tag:'¡ASCENSO!',place:'Centro de la ciudad · Caravana de celebración',actor:'teammate',
  title:s=>`${ctx(s).club.name} vuelve a Primera`,
  paragraphs:s=>[`Terminaron ${ctx(s).last.leaguePosition}° y lograron el ascenso. La ciudad entera salió a la calle.`,'El salto de categoría exigirá más: el club ya busca refuerzos que competirán contigo.'],
  speech:s=>'«¡Lo logramos! Ahora viene lo difícil»',
  options:s=>[
   o('Festejar con la hinchada','Subirte al bus y celebrar con la gente.','«¡Esto es para ustedes!»',{fans:12,morale:5},'Un día que nunca vas a olvidar.'),
   o('Pensar ya en la próxima temporada','Pedir refuerzos y trabajo desde el primer día.','«Así me gusta».',{coach:5,board:5},'El cuerpo técnico valoró tu mentalidad.'),
   o('Renegociar tu contrato','Aprovechar el momento para mejorar condiciones.','«Hablemos con calma».',{board:-4,agent:4,raise:.15},'Tu salario sube; la directiva queda algo incómoda.')]
 },
 w_captaincy:{tag:'LA JINETA',place:'Vestuario · Antes de la pretemporada',actor:'coach',
  title:()=>'El brazalete de capitán',
  paragraphs:s=>[`Llevas ${ctx(s).squad.seasons||0} temporadas en ${ctx(s).club.name}. El capitán anterior se fue y el plantel votó.`,'Tu nombre salió elegido. Liderar también significa dar la cara cuando las cosas van mal.'],
  speech:s=>'«El grupo te eligió. ¿Aceptas la responsabilidad?»',
  options:s=>[
   o('Aceptar la capitanía','Ser la voz del vestuario.','«Ese brazalete es tuyo».',{coach:5,teammate:6,fans:6,reputation:2,thread:{kind:'captain',years:5},captain:true},'Eres el capitán del equipo.'),
   o('Proponer a otro compañero','Liderar sin el brazalete.','«Respeto tu decisión».',{teammate:4,morale:1},'Seguirás liderando desde otro lugar.')]
 },
 w_fans_conflict:{tag:'HINCHADA',place:'Estadio · Silbidos al salir a la cancha',actor:'press',
  title:()=>'La hinchada te da la espalda',
  paragraphs:s=>[`La relación con la hinchada de ${ctx(s).club.name} está rota (${pct(s.squad?.fans??40)}). Hubo silbidos e insultos en el último partido.`,'Un periodista te espera en la zona mixta.'],
  speech:s=>'«¿Tienes algo que decirle a la gente que te silbó?»',
  options:s=>[
   o('Pedir disculpas','Reconocer que no estuviste a la altura.','«Un gesto que la gente valorará».',{fans:12,press:3,morale:-2,resolve:'fans_conflict'},'Diste el primer paso para recuperar a la hinchada.'),
   o('Responder con un gesto desafiante','Callar a la tribuna.','«Eso va a traer cola…»',{fans:-10,press:-3,morale:3,thread:{kind:'fans_conflict',years:1}},'La tensión con la hinchada escaló.'),
   o('No hablar','Dejar que el fútbol responda.','«Sin comentarios».',{fans:2},'Elegiste el silencio.')]
 },
 w_idol:{tag:'ÍDOLO',place:'Estadio · Una bandera con tu cara',actor:'family',
  title:s=>`Ídolo de ${ctx(s).club.name}`,
  paragraphs:s=>[`La hinchada colgó una bandera gigante con tu nombre. Ya eres parte de la historia del club (afinidad ${pct(s.squad?.fans??80)}).`,'Clubes de más prestigio preguntan por ti, pero aquí te consideran uno de los suyos.'],
  speech:s=>'«Esto no se compra con dinero»',
  options:s=>[
   o('Prometer lealtad','Renovar el compromiso con el club.','«¡Uno de los nuestros!»',{fans:8,board:8,morale:4,loyal:true},'El club y la hinchada te consideran leyenda viva.'),
   o('Agradecer sin promesas','Mantener abierto tu futuro.','«Gracias por todo»',{fans:2,morale:3},'Tu futuro sigue abierto.')]
 },
 w_mentor:{tag:'MENTOR',place:'Cancha auxiliar · Después del entrenamiento',actor:'teammate',
  title:s=>`${ctx(s).data.youth} te pide consejos`,
  paragraphs:s=>[`${ctx(s).data.youth}, ${ctx(s).data.youthAge} años, es la gran promesa de la cantera de ${ctx(s).club.name}. Juega en tu misma zona del campo.`,'Ayudarlo puede dejar huella… y también acelerar tu reemplazo.'],
  speech:s=>'«Quiero aprender de ti. ¿Me ayudas?»',
  options:s=>[
   o('Tomarlo bajo tu ala','Entrenar con él y compartir tu experiencia.','«Gracias, de verdad».',{teammate:8,coach:5,fans:3,thread:{kind:'mentor',years:2}},'Serás su mentor. El club valora tu legado.'),
   o('Ayudarlo a la distancia','Algunos consejos, sin descuidar tu puesto.','«Ok, entiendo».',{teammate:3},'Una relación cordial.'),
   o('Marcar distancia','El puesto es tuyo y lo vas a defender.','«…».',{teammate:-5,morale:2},'Defiendes tu lugar sin concesiones.')]
 },
 w_award_gala:{tag:'GALA DE PREMIOS',place:'Gala internacional · Alfombra roja',actor:'press',
  title:s=>`${ctx(s).data.award}: el premio es tuyo`,
  paragraphs:s=>[`Subes al escenario para recibir el ${ctx(s).data.award}. Medio mundo del fútbol está mirando.`,'Lo que digas en este discurso será titular durante semanas.'],
  speech:s=>'«Unas palabras para todos los que te siguen…»',
  options:s=>[
   o('Dedicárselo al barrio','Recordar de dónde vienes.','«Del barrio a la historia».',{fans:6,family:6,morale:4,reputation:2},'Un discurso que emocionó a tu gente.'),
   o('Dedicárselo al equipo','Compartir el mérito con tus compañeros.','«Esto es de todos».',{teammate:8,coach:4,reputation:2},'El vestuario se sintió parte del premio.'),
   o('Prometer más títulos','Elevar la vara de lo que viene.','«¡Esto recién empieza!»',{reputation:4,press:4,morale:2},'La exigencia sobre ti aumenta.')]
 },
 w_national:{tag:'SELECCIÓN',place:'Conferencia de prensa del seleccionador',actor:'press',
  title:s=>ctx(s).data.called?'La selección llama a tu puerta':'La lista que no te incluyó',
  paragraphs:s=>ctx(s).data.called?[`El seleccionador destacó tu temporada (${ctx(s).last.matches} partidos, nota ${(ctx(s).last.rating||6.5).toFixed(2)}).`,'Estar en la lista no garantiza minutos: hay que ganarse un lugar.']:[`Con media ${s.ovr} y una buena temporada, esperabas una citación. Tu nombre no apareció.`,'La prensa pregunta qué opinas.'],
  speech:s=>ctx(s).data.called?'«¿Qué significa para ti vestir esta camiseta?»':'«¿Te sientes ignorado por el seleccionador?»',
  options:s=>ctx(s).data.called?[
   o('Un sueño cumplido','Agradecer con humildad.','«Hoy es el día más feliz de mi familia».',{family:8,morale:5,reputation:2},'Tu familia vivió la convocatoria como un triunfo propio.'),
   o('Ir a ganarte la titularidad','Ambición desde la primera citación.','«Que se note el hambre».',{reputation:3,press:2,morale:2},'Llegas a la selección con hambre de protagonismo.')]:[
   o('Trabajar en silencio','Responder con rendimiento.','«Sin polémica».',{morale:-1,coach:3},'Seguirás trabajando para la próxima lista.'),
   o('Criticar al seleccionador','Decir lo que piensas.','«Eso no cae bien en la federación».',{press:4,reputation:1,morale:2,thread:{kind:'national_snub',years:2}},'La federación tomó nota de tus palabras.')]
 },
 w_family:{tag:'VIDA PERSONAL',place:'Casa familiar',actor:'family',
  title:()=>'Un problema en casa',
  paragraphs:s=>[`Un familiar cercano está pasando por un momento de salud delicado en ${s.city||'tu ciudad natal'}.`,'El club tiene partidos importantes y tu cabeza está en otro lugar.'],
  speech:s=>'«No queremos que dejes tu carrera por nosotros… pero te extrañamos».',
  options:s=>[
   o('Pedir permiso para viajar','Estar presente, aunque pierdas partidos.','«Vuelve cuando estés listo».',{family:12,coach:-2,morale:4,thread:{kind:'family',years:1}},'Estuviste cuando te necesitaban; perderás algunos minutos.'),
   o('Ayudar económicamente desde lejos','Cubrir gastos médicos y seguir compitiendo.','«Gracias, hijo».',{family:4,money:-20000,morale:-1},'Tu ayuda llegó; la distancia pesa.'),
   o('Hablar con un psicólogo deportivo','Ordenar emociones antes de decidir.','«Bien hecho. La cabeza también se entrena».',{morale:3,family:2,coach:1},'Aprendiste a gestionar la presión personal.')]
 },
 w_media_feud:{tag:'POLÉMICA',place:'Redes sociales · Tendencia nacional',actor:'press',
  title:()=>'Un video tuyo se vuelve viral',
  paragraphs:s=>[`Un video sacado de contexto te muestra discutiendo con un hincha a la salida del estadio.`,'Los programas deportivos no hablan de otra cosa.'],
  speech:s=>'«Tenemos que responder rápido. ¿Qué hacemos?»',
  options:s=>[
   o('Publicar un comunicado','Explicar el contexto con calma.','«Bien manejado».',{press:4,fans:3},'La polémica se apagó en pocos días.'),
   o('Ignorarlo','No alimentar el fuego.','«Ojalá pase rápido».',{fans:-3,thread:{kind:'media_feud',years:1}},'La polémica te acompañará un tiempo.'),
   o('Responder con dureza','Atacar a los medios que lo difundieron.','«Eso solo lo agrandará».',{press:-8,reputation:1,morale:2,thread:{kind:'media_feud',years:1}},'Te convertiste en el villano de la semana.')]
 },
 w_tactical_shift:{tag:'CAMBIO TÁCTICO',place:'Pizarra del vestuario',actor:'coach',
  title:()=>'Un nuevo sistema de juego',
  paragraphs:s=>[`${ctx(s).coach.name} cambiará el esquema para la próxima temporada. Tu función dentro del equipo será distinta.`,'Algunos se adaptan rápido; otros pierden protagonismo.'],
  speech:s=>'«Necesito saber si estás dispuesto a sacrificarte por el sistema».',
  options:s=>[
   o('Sacrificarte por el sistema','Menos lucimiento, más trabajo colectivo.','«Eso es lo que necesito».',{coach:7,morale:-2,preparation:'tactica'},'Te asignaron trabajo táctico: más minutos, menos brillo.'),
   o('Pedir libertad creativa','Que el sistema se adapte a tu talento.','«Gánatelo».',{coach:-3,morale:3,reputation:1},'Mantienes tu estilo, con la lupa del técnico encima.'),
   o('Estudiar el sistema a fondo','Horas extra de video y análisis.','«Me gusta tu actitud».',{coach:4,ovr:1},'Tu comprensión táctica mejoró.')]
 },
 w_nutrition:{tag:'PROFESIONALISMO',place:'Centro de alto rendimiento',actor:'agent',
  title:()=>'Un equipo de trabajo propio',
  paragraphs:s=>[`${s.relationships?.agent?.name||'Tu representante'} te propone contratar nutricionista, preparador físico y fisioterapeuta personales.`,'Es una inversión importante, pero los grandes futbolistas la hacen.'],
  speech:s=>'«Tu carrera es una empresa. Hay que invertir»',
  options:s=>[
   o('Contratar al equipo completo','Inversión alta: menos lesiones y declive más lento.','«La mejor inversión de tu vida».',{money:-Math.max(30000,Math.round((s.contract?.salary||80000)*.18)),thread:{kind:'nutrition',years:3},morale:2},'Tu cuerpo estará mejor cuidado durante tres temporadas.'),
   o('Solo un nutricionista','Un paso intermedio.','«Algo es algo».',{money:-12000,thread:{kind:'nutrition',years:1}},'Una temporada con mejor alimentación.'),
   o('No por ahora','Confiar en el club.','«Como quieras».',{morale:1},'Seguirás con los recursos del club.')]
 }
};
export const WORLD_SCENE_IDS=Object.keys(WORLD_SCENES);

/* ---------- Selección contextual ---------- */
function bestNeighbour(s){
 if(s.position==='POR'||!s.attributes)return null;
 const options=bestPositions(s.attributes,s.position).filter(p=>NEIGHBOURS[s.position]?.includes(p.position));
 const top=options[0];return top&&top.ovr>=(s.ovr||0)+2?{position:top.position,newOvr:top.ovr}:null;
}
export function worldSceneCandidates(s){
 const c=ctx(s),last=c.last,year=c.year;const out=[];
 const add=(id,weight,data={})=>out.push({id,weight,data});
 const log=s.storyLog||[];const seen=id=>log.filter(x=>x.id===id);const recent=id=>log.slice(-6).some(x=>x.id===id);
 // Urgentes
 if(s.squad?.newCoachYear===c.year)add('w_new_coach',100);
 if(last.relegated)add('w_relegated',90);
 if(last.promoted)add('w_promoted',85);
 const broken=(s.threads||[]).find(t=>t.kind==='promise_minutes'&&!t.resolved&&t.year===last.year&&!t.data?.soft);
 if(broken&&last.role!=='Titular')add('w_broken_promise',80);
 if((last.injuryWeeks||0)>=9&&!recent('w_serious_injury'))add('w_serious_injury',70);
 const award=(s.awards||[]).find(a=>a.year===last.year&&a.global);
 if(award)add('w_award_gala',75,{award:award.name});
 if(s.age>=34&&!hasThread(s,'last_dance')&&((last.ovrAfter??s.ovr)<(last.ovrBefore??s.ovr)||(last.injuryWeeks||0)>=4)&&!recent('w_veteran_body'))add('w_veteran_body',s.age>=36?60:30);
 // Contextuales
 if(c.rival&&Math.abs((s.ovr||60)-c.rival.ovr)<=5&&!recent('w_squad_rival'))add('w_squad_rival',8);
 const nb=bestNeighbour(s);if(nb&&!recent('w_position_change')&&!hasThread(s,'position_trial'))add('w_position_change',c.coach?.style==='estratega'?14:7,nb);
 if(last.objectives&&!last.objectives.board.met&&!recent('w_board_pressure'))add('w_board_pressure',(s.squad?.board??50)<40?14:7);
 const r=rng(`${s.seed}:interest:${year}`);
 if((last.rating||0)>=6.95||((s.ovr||0)>=dynamicPrestige(s,c.club)+3)){
  const clubId=pickInterestedClub(s,r);if(clubId&&!recent('w_big_interest'))add('w_big_interest',9,{clubId});
 }
 if(c.nemesis&&c.nemesis.status==='active'&&!recent('w_generation_rival'))add('w_generation_rival',s.age<=26?6:2);
 const ev=s.world?.clubs?.[s.clubId]?.ev||[];if(ev.some(e=>e[0]===last.year&&e[1]==='crisis')&&!recent('w_club_crisis'))add('w_club_crisis',40);
 if((s.squad?.seasons||0)>=3&&(s.coachTrust??50)>=62&&s.age>=24&&!s.squad?.captain&&!recent('w_captaincy'))add('w_captaincy',10);
 if((s.squad?.fans??50)<=28&&!recent('w_fans_conflict'))add('w_fans_conflict',12);
 if((s.squad?.fans??50)>=86&&(s.squad?.seasons||0)>=4&&!seen('w_idol').some(x=>x.club===clubName(s.clubId)))add('w_idol',14);
 if(s.age>=29&&!hasThread(s,'mentor')&&!recent('w_mentor'))add('w_mentor',4,{youth:personName(`${s.seed}:youth:${year}`,c.club?.countryCode||s.country),youthAge:17+Math.floor(r()*2)});
 const nationalCalled=(last.nationalCaps||0)>0&&!(s.history||[]).slice(0,-1).some(h=>(h.nationalCaps||0)>0);
 if(nationalCalled)add('w_national',30,{called:true});
 else if((s.ovr||0)>=76&&!(last.nationalCaps)&&(last.rating||0)>=6.8&&!recent('w_national'))add('w_national',6,{called:false});
 if(!recent('w_family')&&seen('w_family').length<2)add('w_family',1.6);
 if(s.publicImage==='mediatico'&&!recent('w_media_feud'))add('w_media_feud',3);else if(!recent('w_media_feud')&&seen('w_media_feud').length<1)add('w_media_feud',1);
 if(!recent('w_tactical_shift'))add('w_tactical_shift',c.coach?.style==='estratega'?5:2.5);
 if(s.age>=24&&!hasThread(s,'nutrition')&&!recent('w_nutrition')&&(s.careerEarnings||0)>=120000)add('w_nutrition',3);
 return out;
}
function pickInterestedClub(s,r){
 const own=dynamicPrestige(s,worldClub(s.clubId));
 const target=Math.min(97,Math.max(own+5,(s.ovr||60)+2));
 const pool=ELIGIBLE_CLUBS.filter(c=>c.id!==s.clubId&&Math.abs(dynamicPrestige(s,c)-target)<=4);
 if(!pool.length)return null;return pool[Math.floor(r()*pool.length)].id;
}

/** Elige una escena del mundo. Las urgentes (peso ≥ 25) se imponen; el resto compite con el catálogo clásico. */
export function pickWorldScene(s,roll,{urgentOnly=false}={}){
 const list=worldSceneCandidates(s);if(!list.length)return null;
 const urgent=list.filter(x=>x.weight>=25).sort((a,b)=>b.weight-a.weight);
 const done=new Set((s.storyLog||[]).filter(x=>x.year===yearOf(s)).map(x=>x.id));
 const u=urgent.find(x=>!done.has(x.id));
 if(u)return u;
 if(urgentOnly)return null;
 const pool=list.filter(x=>x.weight<25&&!done.has(x.id));if(!pool.length)return null;
 const total=pool.reduce((a,x)=>a+x.weight,0);let v=roll()*total;
 for(const x of pool)if((v-=x.weight)<=0)return x;return pool.at(-1);
}
export function isWorldScene(id){return !!WORLD_SCENES[id];}
export function buildWorldScene(s){
 const e=WORLD_SCENES[s.pendingEvent];if(!e)return null;
 const rel=s.relationships?.[e.actor]||{name:'',role:''};
 const coach=coachFor(s,s.clubId);
 const speaker=e.actor==='coach'&&coach?{...rel,name:coach.name,role:`Entrenador · ${coach.styleName}`}:e.actor==='press'?{...rel,role:'Prensa deportiva · ficción de RASCENSO'}:rel;
 return {id:s.pendingEvent,world:true,title:e.title(s),tag:e.tag,place:e.place,actor:e.actor,speaker,paragraphs:e.paragraphs(s),speech:e.speech(s),options:e.options(s)};
}
/** Aplica los efectos extendidos de una escena del mundo (después de los efectos clásicos). */
export function applyWorldEffects(s,effect={}){
 let n={...s};
 if(effect.fans||effect.board||effect.captain||effect.loyal||effect.rivalBond){
  const squad={...(n.squad||{})};
  if(effect.fans)squad.fans=clamp((squad.fans??50)+effect.fans,0,100);
  if(effect.board)squad.board=clamp((squad.board??55)+effect.board,0,100);
  if(effect.captain)squad.captain=true;
  if(effect.loyal)squad.loyal=true;
  if(effect.rivalBond&&squad.rival)squad.rival={...squad.rival,bond:true};
  n.squad=squad;
 }
 if(effect.resolve)n.threads=resolveThread(n,effect.resolve,'resuelta');
 if(effect.thread)n.threads=addThread(n,effect.thread.kind,effect.thread.data||{},effect.thread.years||1);
 if(effect.money)n.careerEarnings=Math.max(0,(n.careerEarnings||0)+effect.money);
 if(effect.salaryCut&&n.contract?.salary)n.contract={...n.contract,salary:Math.round(n.contract.salary*(1-effect.salaryCut)/1000)*1000};
 if(effect.raise&&n.contract?.salary)n.contract={...n.contract,salary:Math.round(n.contract.salary*(1+effect.raise)/1000)*1000};
 if(effect.preparation){const year=yearOf(n);n.preparation={year,id:effect.preparation};}
 if(effect.heal&&n.attributes){const a={...n.attributes};for(const k of ['pace','physical'])if(Number.isFinite(a[k]))a[k]=Math.min(99,a[k]+1);n.attributes=a;n.ovr=ovrFromAttributes(n.position,a);}
 if(effect.position&&effect.position!==n.position){const prof=normalizeProfile({...n,position:effect.position,roleClass:''});n.position=effect.position;n.roleClass=prof.roleClass;n.ovr=ovrFromAttributes(n.position,n.attributes);n.potential=potentialFrom(n.position,n.attributes,n.attrCeil||{},n.ovr);n.decisions=[...(n.decisions||[]),{age:n.age,text:`Cambio de posición: ahora ${POSITION_NAMES[effect.position]}`}];}
 if(effect.retire)n.retireRequested=true;
 return n;
}
