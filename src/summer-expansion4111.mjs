/* RASCENSO 4.11 — 23 actividades adicionales, segmentadas por edad. */
const out=(text,fx={},extra={})=>[{id:'ok',p:1,text,fx,...extra}];
export const SUMMER_EXPANSION = [
 {id:'asado_familiar',category:'descanso',weeks:1,weight:1.3,title:'Asado con la familia',blurb:'Una tarde sin apuros con los que te vieron crecer.',requires:{maxAge:24},modes:[
  {id:'compartir',label:'Organizar una reunión tranquila',cost:.015,outcomes:out('Una conversación sincera te ayuda a recuperar la cabeza.',{vinculoFamiliar:3,moral:2,fatiga:-1})},
  {id:'masivo',label:'Invitar a todo el barrio',cost:.045,outcomes:[{id:'bien',p:.7,text:'La comunidad celebra tu cercanía.',fx:{vinculoFamiliar:3,hinchada:2,moral:1}},{id:'cansancio',p:.3,bad:true,text:'Una fiesta demasiado grande: terminas agotado.',fx:{fatiga:2,forma:-1}}]}
 ]},
 {id:'primer_auto',category:'dinero',weeks:1,once:true,title:'Tu primer auto',blurb:'La primera compra grande puede hacerte ilusión… o distraerte.',requires:{maxAge:23,minAge:18},modes:[
  {id:'practico',label:'Comprar algo práctico',cost:.08,outcomes:out('Disfrutas tu independencia sin llamar demasiado la atención.',{moral:2})},
  {id:'lujo',label:'Darte un gusto lujoso',cost:.25,outcomes:[{id:'alegria',p:.7,text:'Te emocionas con tu nueva máquina.',fx:{moral:3,reputacion:1}},{id:'critica',p:.3,bad:true,text:'Algunos creen que te has olvidado del fútbol.',fx:{moral:1,confianzaDT:-2}}]}
 ]},
 {id:'entrevista_juvenil',category:'prensa',weeks:1,requires:{maxAge:19},title:'Tu primera entrevista como profesional',blurb:'La prensa quiere conocer cómo llevas la presión del debut.',modes:[
  {id:'tranquilo',label:'Hablar del trabajo',outcomes:out('Hablas de tu familia y tus entrenamientos.',{vinculoPrensa:2,confianzaDT:1})},
  {id:'seguro',label:'Prometer grandes cosas',outcomes:[{id:'viral',p:.4,text:'Tu seguridad entusiasma al público.',fx:{hinchada:2,reputacion:1}},{id:'presion',p:.6,bad:true,text:'Ahora todos esperan resultados inmediatos.',fx:{confianzaDT:-2,fatiga:1}}]}
 ]},
 {id:'campus_ninez',category:'ayuda',weeks:2,cooldown:3,requires:{minAge:18},title:'Campus de fútbol para niños',blurb:'Compartir tu experiencia con la próxima generación.',modes:[
  {id:'personal',label:'Entrenar tú mismo a los niños',cost:.035,outcomes:out('Los niños recuerdan cada consejo que les diste.',{impactoSocial:3,hinchada:2,moral:2})},
  {id:'patrocinio',label:'Financiar el campus sin cámaras',cost:.06,outcomes:out('Los formadores reciben recursos para seguir enseñando.',{impactoSocial:4,vinculoFamiliar:1})}
 ]},
 {id:'trabajo_extra',category:'carrera',weeks:2,cooldown:2,title:'Entrenamiento personalizado',blurb:'Una sesión de alto nivel que requiere descanso posterior.',modes:[
  {id:'intensidad',label:'Buscar el máximo rendimiento',cost:.04,outcomes:[{id:'mejora',p:.6,text:'El entrenamiento te deja mejor preparado.',fx:{forma:3,fatiga:2},next:{desarrollo:.04}},{id:'desgaste',p:.4,bad:true,text:'El exceso de carga te deja tocado.',fx:{forma:1,fatiga:4},next:{lesiones:.06}}]},
  {id:'controlado',label:'Priorizar técnica y recuperación',cost:.03,outcomes:out('Trabajas detalles sin exigir demasiado al cuerpo.',{forma:1,fatiga:-1},{next:{desarrollo:.015}})}
 ]},
 {id:'reunion_capitanes',category:'carrera',weeks:1,requires:{minAge:24},title:'Reunión de líderes del vestuario',blurb:'Los referentes del plantel buscan a alguien que medie.',modes:[
  {id:'escuchar',label:'Escuchar y mediar',outcomes:out('Ayudas a bajar tensiones en el grupo.',{vestuario:3,vinculoCompanero:2})},
  {id:'tomar_mando',label:'Dar un discurso exigente',outcomes:[{id:'lider',p:.6,text:'El grupo responde a tu liderazgo.',fx:{vestuario:4,confianzaDT:2}},{id:'choque',p:.4,bad:true,text:'Algunos compañeros se sienten cuestionados.',fx:{vestuario:-3,confianzaDT:-1}}]}
 ]},
 {id:'documental',category:'prensa',weeks:2,once:true,requires:{minAge:23,minStat:{reputacion:12}},title:'Propuesta de documental',blurb:'Un equipo de filmación quiere seguir tu vida fuera de la cancha.',modes:[
  {id:'autentico',label:'Mostrar entrenamientos y barrio',cost:.015,outcomes:out('El documental conecta con los hinchas.',{hinchada:3,impactoSocial:1,reputacion:1})},
  {id:'espectaculo',label:'Mostrar tu vida de lujo',outcomes:[{id:'exito',p:.5,text:'Te conviertes en tema de conversación.',fx:{reputacion:3,dinero:.12}},{id:'rechazo',p:.5,bad:true,text:'El público considera que hay demasiado espectáculo.',fx:{hinchada:-3,confianzaDT:-1}}]}
 ]},
 {id:'amistoso_benefico',category:'ayuda',weeks:1,requires:{minAge:20},cooldown:3,title:'Amistoso benéfico',blurb:'Una asociación deportiva organiza un encuentro solidario.',modes:[
  {id:'jugar',label:'Participar en el partido',cost:.025,outcomes:[{id:'fiesta',p:.85,text:'Ayudas a recaudar y la gente te lo agradece.',fx:{impactoSocial:3,hinchada:2,moral:2,fatiga:1}},{id:'molestia',p:.15,bad:true,text:'Una pequeña molestia enturbia el encuentro.',fx:{impactoSocial:1},injury:2}]},
  {id:'donar',label:'Donar el dinero y descansar',cost:.08,outcomes:out('La fundación financia nuevas actividades.',{impactoSocial:4,fatiga:-1})}
 ]},
 {id:'torneo_barrio',category:'social',weeks:1,requires:{minAge:18},cooldown:3,title:'Torneo en la cancha de tu infancia',blurb:'Tus antiguos amigos quieren que juegues con ellos.',modes:[
  {id:'visitar',label:'Ir como invitado',outcomes:out('Recuerdas de dónde vienes y firmas camisetas.',{hinchada:2,vinculoFamiliar:2,moral:2})},
  {id:'jugar',label:'Jugar el torneo',outcomes:[{id:'lindo',p:.75,text:'Una tarde inolvidable jugando con tus amigos.',fx:{moral:4,vinculoFamiliar:2}},{id:'golpe',p:.25,bad:true,text:'Un golpe tonto te causa una molestia.',fx:{moral:-1},injury:2}]}
 ]},
 {id:'viaje_pareja',category:'descanso',weeks:2,requires:{minAge:20},title:'Escapada personal',blurb:'Necesitas tiempo para tus vínculos fuera del fútbol.',modes:[
  {id:'tranquilo',label:'Una escapada tranquila',cost:.045,outcomes:out('Regresas con menos tensión y más energías.',{moral:3,fatiga:-3})},
  {id:'lujo',label:'Viaje de lujo',cost:.18,outcomes:out('Te das un gusto; el gasto se nota en tu cuenta.',{moral:4,fatiga:-2})}
 ]},
 {id:'curso_idiomas',category:'carrera',weeks:2,once:true,requires:{minAge:19},title:'Aprender otro idioma',blurb:'Podría ayudarte si algún día cambias de país.',modes:[
  {id:'intensivo',label:'Tomar clases intensivas',cost:.045,outcomes:out('Mejoras tu adaptación a una futura experiencia internacional.',{vinculoRepresentante:2}, {flags:['idiomas']})},
  {id:'online',label:'Aprender por tu cuenta',cost:.01,outcomes:out('Construyes una base para seguir practicando.',{moral:1},{flags:['idiomas']})}
 ]},
 {id:'startup',category:'dinero',weeks:1,requires:{minAge:24},cooldown:4,title:'Invertir en una empresa tecnológica',blurb:'El futuro no está garantizado, pero puede traer beneficios.',modes:[
  {id:'pequeno',label:'Invertir con prudencia',cost:.12,outcomes:[{id:'gana',p:.65,text:'Tu inversión crece un poco.',fx:{dinero:.17}},{id:'pierde',p:.35,bad:true,text:'El proyecto pierde valor.',fx:{dinero:.02}}]},
  {id:'grande',label:'Apostar fuerte',cost:.45,outcomes:[{id:'boom',p:.3,text:'La empresa despega.',fx:{dinero:.9,reputacion:1}},{id:'fracaso',p:.7,bad:true,text:'Una mala decisión financiera.',fx:{dinero:.03,moral:-2}}]}
 ]},
 {id:'mentor_canterano',category:'ayuda',weeks:1,requires:{minAge:27},cooldown:2,title:'Mentoría a un canterano',blurb:'Un juvenil necesita consejo para dar su próximo paso.',modes:[
  {id:'asesorar',label:'Conversar sobre disciplina',outcomes:out('Tus palabras ayudan al juvenil y fortalecen el plantel.',{vestuario:2,impactoSocial:2,moral:1})},
  {id:'representar',label:'Presentarlo a tu representante',outcomes:[{id:'bien',p:.7,text:'El joven obtiene orientación profesional.',fx:{impactoSocial:2,vinculoRepresentante:1}},{id:'mal',p:.3,bad:true,text:'Parece que quieres influir demasiado.',fx:{vinculoCompanero:-2}}]}
 ]},
 {id:'prensa_polemica',category:'prensa',weeks:1,requires:{minAge:24},cooldown:3,title:'Entrevista incómoda',blurb:'Un periodista insiste en un tema polémico.',modes:[
  {id:'sereno',label:'Responder sin polémica',outcomes:out('Tu mesura frena el ruido.',{vinculoPrensa:2,confianzaDT:1})},
  {id:'contraatacar',label:'Responder con dureza',outcomes:[{id:'viral',p:.4,text:'Muchos hinchas defienden tu postura.',fx:{hinchada:3,reputacion:2}},{id:'fuego',p:.6,bad:true,text:'Tus palabras empeoran el conflicto.',fx:{reputacion:-3,confianzaDT:-2,escandalos:1}}]}
 ]},
 {id:'patrocinio_local',category:'dinero',weeks:1,requires:{minAge:20,minStat:{reputacion:8}},cooldown:2,title:'Una empresa local te busca',blurb:'Una marca de tu región quiere colaborar.',modes:[
  {id:'comunidad',label:'Patrocinar actividades comunitarias',outcomes:out('Cobras algo menos, pero se financian talleres deportivos.',{dinero:.07,impactoSocial:2})},
  {id:'comercial',label:'Contrato principalmente comercial',outcomes:out('Ingresas dinero y cumples tus compromisos publicitarios.',{dinero:.16,reputacion:.5})}
 ]},
 {id:'retiro_espiritual',category:'descanso',weeks:2,requires:{minAge:28},cooldown:2,title:'Desconectar del ruido',blurb:'Un descanso mental lejos de las redes y la presión.',modes:[
  {id:'aislado',label:'Retiro silencioso',cost:.03,outcomes:out('Te sientes más centrado.',{moral:3,fatiga:-3},{next:{serenidad:.03}})},
  {id:'compartido',label:'Viajar con gente cercana',cost:.05,outcomes:out('Conversas sobre lo importante de verdad.',{vinculoFamiliar:3,moral:2,fatiga:-2})}
 ]},
 {id:'curso_finanzas',category:'dinero',weeks:1,requires:{minAge:21},once:true,title:'Aprender a administrar tu dinero',blurb:'Un asesor te explica cómo planificar sin endeudarte.',modes:[
  {id:'aprender',label:'Tomar el curso',cost:.025,outcomes:out('Comprendes mejor tus gastos y tu futuro.',{moral:1},{flags:['educacion_financiera']})}
 ]},
 {id:'evento_hinchas',category:'social',weeks:1,requires:{minAge:19},cooldown:2,title:'Encuentro con hinchas',blurb:'Una peña organiza una tarde con sus ídolos.',modes:[
  {id:'cercano',label:'Compartir sin cobrar',outcomes:out('Te ganas un vínculo sincero con la tribuna.',{hinchada:3,moral:2})},
  {id:'publicitario',label:'Evento comercial',outcomes:[{id:'bien',p:.65,text:'Los hinchas disfrutan y tú recibes una recompensa.',fx:{hinchada:1,dinero:.08}},{id:'criticas',p:.35,bad:true,text:'Algunos rechazan que cobres por asistir.',fx:{hinchada:-2,reputacion:-1,dinero:.08}}]}
 ]},
 {id:'plan_retiro',category:'carrera',weeks:2,requires:{minAge:32},cooldown:4,title:'Preparar la vida después del fútbol',blurb:'Exploras tus proyectos para el día en que dejes de jugar.',modes:[
  {id:'formacion',label:'Diseñar un plan de formación',cost:.04,outcomes:out('Tu próxima etapa empieza a tomar forma.',{moral:3},{flags:['plan_retiro']})},
  {id:'familia',label:'Conversar con tu entorno',outcomes:out('Tomar decisiones en familia te da tranquilidad.',{vinculoFamiliar:4,moral:2},{flags:['plan_retiro']})}
 ]},
 {id:'homenaje_veterano',category:'social',weeks:1,requires:{minAge:32},cooldown:3,title:'Homenaje a tu trayectoria',blurb:'Los hinchas te invitan a recordar tus años de carrera.',modes:[
  {id:'humilde',label:'Agradecer al club y compañeros',outcomes:out('El público aplaude la forma en que recuerdas tu trayectoria.',{hinchada:3,vestuario:2})},
  {id:'emotivo',label:'Dedicarlo a tu familia',outcomes:out('Tu discurso conmueve a muchos.',{vinculoFamiliar:4,hinchada:2})}
 ]},
 {id:'libro_memorias',category:'prensa',weeks:2,once:true,requires:{minAge:30,minStat:{reputacion:15}},title:'Escribir tus memorias',blurb:'Te ofrecen publicar tus historias de vestuario y fútbol.',modes:[
  {id:'respetuoso',label:'Un libro sin secretos ajenos',cost:.03,outcomes:out('Los lectores valoran tus recuerdos.',{reputacion:2,vinculoCompanero:2,dinero:.06},{flags:['libro']})},
  {id:'explosivo',label:'Contar historias controvertidas',outcomes:[{id:'ventas',p:.5,text:'El libro es un éxito de ventas.',fx:{dinero:.3,reputacion:3},flags:['libro']},{id:'conflicto',p:.5,bad:true,text:'Varios excompañeros se sienten traicionados.',fx:{dinero:.16,vinculoCompanero:-4,escandalos:1},flags:['libro']}]} 
 ]},
 {id:'fundacion',category:'ayuda',weeks:2,once:true,requires:{minAge:29},title:'Crear una fundación deportiva',blurb:'Un proyecto duradero para abrir espacios en el deporte.',modes:[
  {id:'inicial',label:'Empezar con un proyecto pequeño',cost:.15,outcomes:out('Un pequeño grupo de jóvenes ya recibe apoyo.',{impactoSocial:4,reputacion:1},{flags:['fundacion']})},
  {id:'grande',label:'Lanzar un programa amplio',cost:.4,outcomes:[{id:'exito',p:.65,text:'La fundación encuentra voluntarios y comienza a funcionar.',fx:{impactoSocial:6,reputacion:2},flags:['fundacion']},{id:'dificultad',p:.35,bad:true,text:'Los primeros meses son más duros de lo esperado.',fx:{impactoSocial:2,moral:-2},flags:['fundacion']}]} 
 ]},
 {id:'congreso_futbol',category:'carrera',weeks:1,requires:{minAge:28},cooldown:3,title:'Congreso internacional de fútbol',blurb:'Escuchas otras maneras de trabajar el juego.',modes:[
  {id:'participar',label:'Asistir y tomar apuntes',cost:.02,outcomes:out('Regresas con nuevas ideas de entrenamiento.',{confianzaDT:2,forma:1},{next:{desarrollo:.015}})},
  {id:'ponente',label:'Dar una charla',outcomes:[{id:'aplauso',p:.65,text:'Tu visión es bien recibida.',fx:{reputacion:2,vinculoPrensa:2}},{id:'dudas',p:.35,bad:true,text:'Algunos dudan de tu experiencia.',fx:{reputacion:-1}}]}
 ]},
 {id:'vacacion_mentor',category:'carrera',weeks:1,requires:{minAge:32},cooldown:2,title:'Compartir con una leyenda retirada',blurb:'Un antiguo profesional comparte aciertos y errores.',modes:[
  {id:'escuchar',label:'Escuchar su experiencia',outcomes:out('Sus consejos te ayudan a valorar el tiempo que queda.',{moral:2,confianzaDT:1})},
  {id:'plan',label:'Preparar juntos una etapa futura',cost:.03,outcomes:out('Surge una idea para después del retiro.',{moral:2,vinculoRepresentante:2},{flags:['mentor_veterano']})}
 ]}
];
