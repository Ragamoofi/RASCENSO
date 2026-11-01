// summer-activities.mjs
// 15 actividades de ejemplo para el Verano de RASCENSO. Solo datos: sin lógica.
//
// ACTIVIDAD
//   id, category, title, blurb
//   weeks      cupos de verano que consume (1 o 2)
//   weight     peso base en el sorteo (default 1)
//   boosts     [{ when:<condición>, mult }]   sube/baja el peso según rasgos o contexto
//   requires   <condición>                     para que pueda aparecer
//   once       true = una sola vez en toda la carrera
//   cooldown   temporadas que deben pasar antes de repetirla
//   modes[]    lo que ELIGE el jugador
// MODO
//   id, label, cost (en sueldos anuales), requires (condición propia del modo)
//   service    { id, upkeep, perSeason } gasto anual + modificadores mientras siga contratado
//   outcomes[] lo que SALE (las p suman 1)
//   traitMods  [{ when:<condición>, shift:{ idResultado: ±delta } }] mueve probabilidades según rasgos
// RESULTADO
//   id, p, text, headline?, bad? (marca los malos: de ahí sale el icono de riesgo 🟢🟡🔴)
//   fx         cambios inmediatos { stat: delta }
//   next       modificadores para la próxima temporada { lesiones: -0.1 }  (−10 %)
//   flags      banderas que quedan en la carrera
//   injury     semanas de lesión
//   followUps  [{ id, after, p }] eventos futuros: se enlazan con tus "hilos" narrativos
//
// ESCALA SUGERIDA de fx (calcada de los bonos del creador: +2 hinchada/año, +10 vínculo familiar...):
//   moral ±2..5 · reputacion ±0.5..3 · hinchada ±1..3 · confianzaDT ±1..4 · vínculos ±1..6
//   dinero en SUELDOS ANUALES (0.25 = un cuarto del sueldo de un año)
// Ajusta todo a tus escalas reales.
//
// CONDICIONES (when / requires): minAge, maxAge, minMoney, minStat, maxStat, profile, flag, notFlag.
// IDs de rasgos tomados de tu inventario (caracter: 'rebelde', imagen: 'mediatico', etc.).

export const ACTIVITIES = [
  // ═════════════════════════ PRENSA ═════════════════════════
  {
    id: 'rueda_prensa', category: 'prensa', weeks: 1, weight: 1.2,
    title: 'Rueda de prensa de fin de temporada',
    blurb: 'Los periodistas quieren saber qué piensas. Cada palabra cuenta.',
    boosts: [{ when: { profile: { imagen: 'mediatico' } }, mult: 1.5 }],
    modes: [
      {
        id: 'humilde', label: 'Hablar con humildad',
        outcomes: [
          { id: 'bien', p: 0.7, text: 'Tu tono tranquilo cae bien: la prensa destaca tu madurez.', fx: { vinculoPrensa: 2, reputacion: 1, confianzaDT: 1 } },
          { id: 'flojo', p: 0.3, text: 'Sin titulares. Una entrevista más.', fx: {} },
        ],
        traitMods: [{ when: { profile: { imagen: 'reservado' } }, shift: { bien: +0.1, flojo: -0.1 } }],
      },
      {
        id: 'picante', label: 'Lanzar una frase picante',
        outcomes: [
          { id: 'viral', p: 0.35, headline: 'Tu frase da la vuelta al país', text: 'Tu frase se hace viral. Unos te aman, otros te odian, todos hablan de ti.', fx: { reputacion: 3, hinchada: 2, vinculoPrensa: 1 }, flags: ['frase_celebre'] },
          { id: 'escandalo', p: 0.45, bad: true, headline: 'Polémica por tus declaraciones', text: 'Se te va la mano. El club pide explicaciones y el titular te persigue.', fx: { reputacion: -2, confianzaDT: -3, directiva: -2, escandalos: 1 }, followUps: [{ id: 'prensa_recuerda', after: 1, p: 0.5 }] },
          { id: 'ignorada', p: 0.2, text: 'Nadie le da importancia.', fx: {} },
        ],
        traitMods: [
          { when: { profile: { imagen: 'provocador' } }, shift: { viral: +0.15, escandalo: -0.1 } },
          { when: { profile: { caracter: 'carismatico' } }, shift: { viral: +0.1, escandalo: -0.1 } },
          { when: { profile: { caracter: 'sereno' } }, shift: { escandalo: -0.1 } },
          { when: { profile: { caracter: 'rebelde' } }, shift: { escandalo: +0.1 } },
        ],
      },
      {
        id: 'tactico', label: 'Hablar de táctica y del proyecto',
        outcomes: [
          { id: 'respeto', p: 0.6, text: 'Tu lectura del juego impresiona al cuerpo técnico.', fx: { confianzaDT: 2, vinculoPrensa: 1, directiva: 1 } },
          { id: 'aburre', p: 0.4, text: 'Demasiada pizarra para tan poco titular.', fx: { vinculoPrensa: -1 } },
        ],
        traitMods: [{ when: { profile: { imagen: 'analitico' } }, shift: { respeto: +0.2, aburre: -0.2 } }],
      },
    ],
  },
  {
    id: 'reto_viral', category: 'social', weeks: 1, weight: 0.8,
    title: 'Un influencer te propone un reto viral',
    blurb: 'Millones de vistas… o un ridículo eterno.',
    boosts: [
      { when: { profile: { imagen: 'mediatico' } }, mult: 1.8 },
      { when: { profile: { imagen: 'reservado' } }, mult: 0.4 },
    ],
    modes: [
      {
        id: 'aceptar', label: 'Aceptar el reto',
        outcomes: [
          { id: 'viral', p: 0.45, headline: 'Tu reto arrasa en redes', text: 'El video se vuelve tendencia. La afición se divierte contigo.', fx: { reputacion: 2, hinchada: 1, dinero: 0.05 } },
          { id: 'nada', p: 0.35, text: 'Pasa sin pena ni gloria.', fx: {} },
          { id: 'ridiculo', p: 0.2, bad: true, text: 'Sales en todos los memes, y no precisamente bien.', fx: { reputacion: -1, vinculoPrensa: -1 } },
        ],
        traitMods: [{ when: { profile: { caracter: 'carismatico' } }, shift: { viral: +0.1, ridiculo: -0.1 } }],
      },
    ],
  },

  // ═════════════════════════ CARRERA ═════════════════════════
  {
    id: 'reunion_agente', category: 'carrera', weeks: 1,
    title: 'Reunión con tu representante',
    blurb: 'Tu agente tiene novedades… o consejos.',
    modes: [
      {
        id: 'buscar_ofertas', label: 'Pedirle que mueva el mercado',
        outcomes: [
          { id: 'contacto', p: 0.5, text: 'Tu agente consigue que varios grandes te sigan de cerca.', fx: { vinculoRepresentante: 2 }, next: { mercadoGrandes: +0.08 } },
          { id: 'nada', p: 0.5, text: 'Muchas llamadas, poco movimiento.', fx: { vinculoRepresentante: 1 } },
        ],
        traitMods: [{ when: { profile: { decisiones: 'audaz' } }, shift: { contacto: +0.15, nada: -0.15 } }],
      },
      {
        id: 'pedir_consejo', label: 'Pedirle consejo sincero',
        outcomes: [{ id: 'ok', p: 1, text: 'Hablan claro sobre tu carrera. Sales con la cabeza más fría.', fx: { vinculoRepresentante: 3, moral: 1 } }],
      },
    ],
  },
  {
    id: 'campamento', category: 'carrera', weeks: 1, cooldown: 2,
    title: 'Campamento de preparación',
    blurb: 'Una semana pensando solo en tu cuerpo.',
    modes: [
      {
        id: 'altura', label: 'Entrenar en altura', cost: 0.02,
        outcomes: [
          { id: 'pico', p: 0.55, text: 'Vuelves con el motor afinado.', fx: { forma: 3, fatiga: 1 }, next: { desarrollo: +0.03 } },
          { id: 'sobrecarga', p: 0.25, bad: true, text: 'Te pasas de carga y el cuerpo lo nota.', fx: { forma: 1, fatiga: 3 }, next: { lesiones: +0.04 } },
          { id: 'regular', p: 0.2, text: 'Una semana dura sin grandes cambios.', fx: { forma: 1 } },
        ],
        traitMods: [
          { when: { profile: { caracter: 'obsesivo' } }, shift: { pico: +0.1, sobrecarga: +0.1, regular: -0.2 } },
          { when: { profile: { caracter: 'disciplinado' } }, shift: { pico: +0.1, sobrecarga: -0.1 } },
        ],
      },
      {
        id: 'playa', label: 'Recuperación en la playa',
        outcomes: [{ id: 'ok', p: 1, text: 'Sol, mar y fisio. Recargas las baterías.', fx: { fatiga: -3, forma: 1 }, next: { lesiones: -0.02 } }],
      },
    ],
  },
  {
    id: 'curso_dt', category: 'carrera', weeks: 2, once: true,
    title: 'Curso de entrenador',
    blurb: 'Tu plan B para cuando cuelgues los botines.',
    requires: { minAge: 27 },
    boosts: [
      { when: { profile: { caracter: 'lider' } }, mult: 2 },
      { when: { profile: { imagen: 'analitico' } }, mult: 1.5 },
      { when: { profile: { sueno: 'capitan' } }, mult: 1.5 },
    ],
    modes: [
      {
        id: 'curso', label: 'Apuntarte al curso', cost: 0.05,
        outcomes: [{ id: 'ok', p: 1, headline: 'Sacas el carnet de entrenador', text: 'Aprendes a ver el fútbol desde el banquillo. Se abre una puerta para después del retiro.', fx: { confianzaDT: 2 }, flags: ['curso_dt'] }],
      },
    ],
  },

  // ═════════════════════════ SOCIAL / VESTUARIO ═════════════════════════
  {
    id: 'fiesta_plantel', category: 'social', weeks: 1,
    title: 'Fiesta de fin de temporada del plantel',
    blurb: 'Todo el vestuario va. ¿Y tú?',
    modes: [
      {
        id: 'corta', label: 'Ir y volver temprano',
        outcomes: [
          { id: 'bien', p: 0.85, text: 'Compartes un rato, sin excesos. Buen ambiente.', fx: { vestuario: 2, vinculoCompanero: 2, moral: 2 } },
          { id: 'regular', p: 0.15, text: 'Te vas justo antes de lo mejor.', fx: { vestuario: 1 } },
        ],
      },
      {
        id: 'toda_la_noche', label: 'Quedarte hasta el amanecer',
        outcomes: [
          { id: 'epica', p: 0.4, headline: 'La noche que el vestuario recuerda', text: 'Una noche legendaria. Mañana nadie olvidará nada.', fx: { vestuario: 4, vinculoCompanero: 4, moral: 4 } },
          { id: 'escandalo', p: 0.3, bad: true, headline: 'Foto comprometida de la fiesta', text: 'Alguien filtra una foto. El club no está contento.', fx: { confianzaDT: -3, directiva: -2, reputacion: -1, escandalos: 1, vestuario: 1 } },
          { id: 'lesion', p: 0.15, bad: true, text: 'Una caída tonta en plena celebración. Unas semanas de baja.', fx: { moral: -2 }, injury: 3 },
          { id: 'normal', p: 0.15, text: 'Una buena fiesta, sin más.', fx: { vestuario: 2, moral: 2 } },
        ],
        traitMods: [
          { when: { profile: { caracter: 'disciplinado' } }, shift: { escandalo: -0.1, epica: -0.05 } },
          { when: { profile: { caracter: 'carismatico' } }, shift: { epica: +0.1 } },
          { when: { profile: { caracter: 'rebelde' } }, shift: { escandalo: +0.1 } },
          { when: { profile: { caracter: 'sereno' } }, shift: { escandalo: -0.05 } },
        ],
      },
      {
        id: 'no_ir', label: 'No ir y descansar',
        outcomes: [{ id: 'ok', p: 1, text: 'Prefieres descansar. Alguien lo comenta en el vestuario.', fx: { vestuario: -1, fatiga: -1 } }],
      },
    ],
  },
  {
    id: 'vacaciones', category: 'descanso', weeks: 2,
    title: 'Vacaciones largas',
    blurb: 'Dos semanas lejos de todo. O no tan lejos.',
    modes: [
      {
        id: 'descanso_total', label: 'Desconectar por completo',
        outcomes: [{ id: 'ok', p: 1, text: 'Cuerpo y cabeza al 100 %, aunque llegas algo oxidado.', fx: { fatiga: -4, moral: 3, forma: -1 }, next: { lesiones: -0.03 } }],
      },
      {
        id: 'viaje_companeros', label: 'Viajar con compañeros', cost: 0.04,
        outcomes: [
          { id: 'genial', p: 0.7, text: 'Un viaje inolvidable que une al grupo.', fx: { vinculoCompanero: 3, vestuario: 2, moral: 3, fatiga: -2 } },
          { id: 'mal', p: 0.3, text: 'Más cansancio que descanso. Pero se agradece la compañía.', fx: { vinculoCompanero: 1, moral: 1, fatiga: -1 } },
        ],
      },
    ],
  },
  {
    id: 'visita_familia', category: 'descanso', weeks: 1,
    title: 'Volver a casa con los tuyos',
    blurb: 'Hace tiempo que no los ves.',
    boosts: [
      { when: { profile: { entorno: 'migrante' } }, mult: 2 },
      { when: { profile: { decisiones: 'hogareno' } }, mult: 2 },
      { when: { profile: { entorno: 'familia_futbolera' } }, mult: 1.5 },
    ],
    modes: [
      {
        id: 'visita', label: 'Pasar unos días en casa', cost: 0.03,
        outcomes: [{ id: 'ok', p: 1, text: 'Mesa larga, risas y consejos. Todo vuelve a su sitio.', fx: { vinculoFamiliar: 5, moral: 3, fatiga: -1 } }],
      },
    ],
  },
  {
    id: 'escapada_extrema', category: 'locura', weeks: 1, weight: 0.7,
    title: 'Fin de semana extremo',
    blurb: 'Paracaídas, karting, rafting… tu agente prefiere no saberlo.',
    boosts: [
      { when: { profile: { decisiones: 'aventurero' } }, mult: 1.8 },
      { when: { profile: { caracter: 'rebelde' } }, mult: 1.5 },
      { when: { profile: { caracter: 'disciplinado' } }, mult: 0.5 },
    ],
    modes: [
      {
        id: 'aceptar', label: 'Lanzarte a la aventura',
        outcomes: [
          { id: 'epico', p: 0.5, text: 'Adrenalina pura. Vuelves con otra energía.', fx: { moral: 4, fatiga: -1 } },
          { id: 'lesion', p: 0.15, bad: true, headline: 'Lesionado en una escapada extrema', text: 'Algo sale mal. El club no lo sabía y no le hace gracia.', fx: { moral: -2, confianzaDT: -2 }, injury: 6 },
          { id: 'anecdota', p: 0.35, text: 'Una anécdota para contar en el vestuario.', fx: { moral: 2, reputacion: 0.5 } },
        ],
        traitMods: [
          { when: { profile: { decisiones: 'aventurero' } }, shift: { epico: +0.1, anecdota: -0.1 } },
          { when: { profile: { caracter: 'disciplinado' } }, shift: { lesion: -0.05, anecdota: +0.05 } },
        ],
      },
    ],
  },

  // ═════════════════════════ DINERO ═════════════════════════
  {
    id: 'servicio_personal', category: 'dinero', weeks: 1,
    title: 'Montar tu equipo de apoyo personal',
    blurb: 'Gasto fijo cada año, pero tu cuerpo y tu cabeza lo agradecen.',
    modes: [
      {
        id: 'nutricionista', label: 'Contratar nutricionista', cost: 0.02,
        requires: { notFlag: 'svc_nutri' },
        service: { id: 'nutri', upkeep: 0.05, perSeason: { lesiones: -0.08, desarrollo: +0.02 } },
        outcomes: [{ id: 'ok', p: 1, text: 'Cambias hábitos y se nota en el campo.', fx: {} }],
      },
      {
        id: 'fisio', label: 'Contratar fisio personal', cost: 0.03,
        requires: { notFlag: 'svc_fisio' },
        service: { id: 'fisio', upkeep: 0.08, perSeason: { lesiones: -0.15 } },
        outcomes: [{ id: 'ok', p: 1, text: 'Tienes a alguien que cuida de tu cuerpo todo el año.', fx: {} }],
      },
      {
        id: 'psicologo', label: 'Contratar psicólogo deportivo', cost: 0.02,
        requires: { notFlag: 'svc_psico' },
        service: { id: 'psico', upkeep: 0.05, perSeason: { serenidad: +0.06 } },
        outcomes: [{ id: 'ok', p: 1, text: 'Aprendes a manejar la presión de las grandes noches.', fx: {} }],
      },
    ],
  },
  {
    id: 'casa', category: 'dinero', weeks: 1, once: true,
    title: 'Comprar una casa',
    blurb: 'Un hogar propio. Pero hay que decidir dónde.',
    requires: { minAge: 18 },
    modes: [
      {
        id: 'cerca_club', label: 'Cerca del club', cost: 0.3,
        service: { id: 'casa_club', upkeep: 0.02, perSeason: { lesiones: -0.03 } },
        outcomes: [{ id: 'ok', p: 1, text: 'Menos viajes, más descanso. Tu rutina mejora.', fx: { moral: 3, fatiga: -1 } }],
      },
      {
        id: 'en_el_barrio', label: 'En tu barrio de siempre', cost: 0.25,
        service: { id: 'casa_barrio', upkeep: 0.02, perSeason: { minutos: -0.01 } },
        outcomes: [{ id: 'ok', p: 1, text: 'Vuelves a tus raíces, aunque el viaje al club es largo.', fx: { vinculoFamiliar: 5, hinchada: 1, moral: 3 } }],
      },
    ],
  },
  {
    id: 'negocio', category: 'dinero', weeks: 1, cooldown: 3,
    title: 'Invertir en un negocio',
    blurb: 'Tu dinero puede trabajar por ti… o desaparecer.',
    requires: { minAge: 20 },
    modes: [
      {
        id: 'restaurante', label: 'Abrir un restaurante', cost: 0.5,
        outcomes: [
          { id: 'boom', p: 0.25, headline: 'Tu restaurante es un éxito', text: 'Lleno todos los fines de semana. Hasta los rivales vienen a cenar.', fx: { dinero: 1.0, reputacion: 1 } },
          { id: 'estable', p: 0.45, text: 'Un negocio modesto pero sano.', fx: { dinero: 0.55 } },
          { id: 'quiebra', p: 0.3, bad: true, text: 'El negocio no despega. Apenas recuperas algo de lo invertido.', fx: { dinero: 0.1 } },
        ],
        traitMods: [
          { when: { profile: { decisiones: 'calculador' } }, shift: { quiebra: -0.1, boom: +0.05 } },
          { when: { profile: { decisiones: 'economico' } }, shift: { boom: +0.05 } },
        ],
      },
      {
        id: 'academia_propia', label: 'Fundar una academia de fútbol', cost: 0.4,
        outcomes: [
          { id: 'crece', p: 0.6, text: 'La academia crece y los chicos te adoran.', fx: { dinero: 0.5, impactoSocial: 1 }, followUps: [{ id: 'academia_talento', after: 4, p: 0.6 }] },
          { id: 'lento', p: 0.4, text: 'Arranca despacio, pero con buena base.', fx: { dinero: 0.35, impactoSocial: 1 } },
        ],
      },
    ],
  },
  {
    id: 'patrocinio', category: 'dinero', weeks: 1,
    title: 'Oferta de patrocinio',
    blurb: 'Una marca quiere tu imagen. Tú decides con quién.',
    requires: { minStat: { reputacion: 10 } },
    modes: [
      {
        id: 'marca_deportiva', label: 'Marca deportiva tradicional',
        outcomes: [{ id: 'ok', p: 1, text: 'Un contrato limpio y sin sobresaltos.', fx: { dinero: 0.15, reputacion: 0.5 } }],
      },
      {
        id: 'marca_polemica', label: 'Marca polémica que paga más',
        outcomes: [
          { id: 'ok', p: 0.55, text: 'Cobras bien y nadie dice nada.', fx: { dinero: 0.35, reputacion: 1 } },
          { id: 'polemica', p: 0.45, bad: true, headline: 'Críticas por tu nuevo patrocinio', text: 'La hinchada no perdona que te asocies con esa marca.', fx: { dinero: 0.35, reputacion: -2, hinchada: -2 }, followUps: [{ id: 'boicot_marca', after: 1, p: 0.5 }] },
        ],
        traitMods: [{ when: { profile: { imagen: 'provocador' } }, shift: { ok: +0.1, polemica: -0.1 } }],
      },
    ],
  },

  // ═════════════════════════ AYUDA / COMUNIDAD ═════════════════════════
  {
    id: 'ayuda_barrio', category: 'ayuda', weeks: 1, once: true, weight: 0.8,
    title: 'Remodelar la cancha de tu barrio',
    blurb: 'Donde empezó todo, hoy está hecha pedazos.',
    requires: { minAge: 18 },
    boosts: [
      { when: { profile: { formacion: 'barrio' } }, mult: 2.5 },
      { when: { profile: { entorno: ['campesino', 'autodidacta', 'migrante'] } }, mult: 1.8 },
      { when: { profile: { caracter: 'solidario' } }, mult: 2 },
      { when: { profile: { imagen: 'solidario' } }, mult: 2 },
      { when: { profile: { sueno: 'cantera' } }, mult: 2 },
    ],
    modes: [
      {
        id: 'publica', label: 'Hacerlo con cámaras y prensa', cost: 0.12,
        outcomes: [{
          id: 'ok', p: 1, headline: 'Reinauguran la cancha de tu barrio', text: 'Todo el barrio te recibe como a un héroe. La prensa lo cuenta.',
          fx: { hinchada: 2, reputacion: 2, vinculoFamiliar: 4, moral: 2, impactoSocial: 2 },
          flags: ['ayudo_barrio'],
          followUps: [{ id: 'inauguracion_barrio', after: 1, p: 1 }, { id: 'nino_prometedor', after: 5, p: 0.4 }],
        }],
      },
      {
        id: 'anonima', label: 'Hacerlo en silencio', cost: 0.12,
        outcomes: [{
          id: 'ok', p: 1, text: 'Nadie sabe que fuiste tú… salvo los que importan.',
          fx: { hinchada: 1, reputacion: 0.5, vinculoFamiliar: 6, moral: 4, impactoSocial: 3 },
          flags: ['ayudo_barrio'],
          followUps: [{ id: 'inauguracion_barrio', after: 1, p: 1 }, { id: 'nino_prometedor', after: 5, p: 0.6 }],
        }],
      },
    ],
  },
  {
    id: 'beca_juvenil', category: 'ayuda', weeks: 1, cooldown: 4,
    title: 'Becar a un juvenil con talento',
    blurb: 'Un chico sin recursos tiene lo que a ti te sobraba: ganas.',
    requires: { minAge: 22 },
    boosts: [
      { when: { profile: { caracter: 'solidario' } }, mult: 2 },
      { when: { profile: { sueno: 'cantera' } }, mult: 2 },
      { when: { profile: { formacion: 'barrio' } }, mult: 1.5 },
    ],
    modes: [
      {
        id: 'becar', label: 'Pagar su formación', cost: 0.06,
        outcomes: [
          { id: 'exito', p: 0.7, text: 'El chico progresa. Su familia no sabe cómo agradecértelo.', fx: { impactoSocial: 1, reputacion: 1 }, followUps: [{ id: 'becario_destaca', after: 4, p: 0.7 }] },
          { id: 'nada', p: 0.3, text: 'No todo sale como se espera, pero lo intentaste.', fx: { impactoSocial: 1 } },
        ],
      },
    ],
  },
];

// Ampliación por etapas de vida. Se conserva íntegramente el catálogo inicial.
import {SUMMER_EXPANSION} from './summer-expansion4111.mjs';
ACTIVITIES.push(...SUMMER_EXPANSION);

// Recompensas competitivas sin eliminar probabilidades de fracaso.
import {balanceSummerRisk} from './summer-balance4111.mjs';
balanceSummerRisk(ACTIVITIES);
