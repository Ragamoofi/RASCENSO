// summer-engine.mjs
// Motor de "Verano" (entre temporadas) para RASCENSO. Módulo ES, sin dependencias.
// No toca tu estado: habla con tu motor mediante un ADAPTADOR (ver abajo).
//
// ESTRUCTURA DE 3 NIVELES
//   Actividad (gasta cupos de verano)
//     └─ Modo       (lo que ELIGE el jugador: "humilde", "picante", "táctico"...)
//          └─ Resultado (lo que SALE: azar ponderado por los rasgos del creador)
//
// USO BÁSICO
//   const ctx = buildCtx();                                   // foto de tu estado (ver CTX)
//   const summer = startSummer(ctx);                          // 6 cupos por defecto
//   const offers = drawOffers(ACTIVITIES, ctx, summer);       // 3 actividades sorteadas
//   const view = describeModes(offers[0], ctx);               // modos, coste, icono de riesgo
//   const res = chooseMode(summer, offers[0], 'humilde', ctx, adapter);  // texto + efectos
//   ...repetir hasta summer.weeksLeft === 0...
//   const report = finishSummer(summer);                      // titulares y resumen
//   // Botón "resumir verano": runSummer({ activities, ctx, adapter, policy })
//
// CTX (foto de tu estado; reconstrúyela antes de cada verano)
//   {
//     season: 7, age: 24,
//     money: 2.3,                 // patrimonio medido en SUELDOS ANUALES (1 = un sueldo anual)
//     annualSalary: opcional (solo para mostrar cifras en pantalla),
//     stats:   { reputacion: 40, hinchada: 30, ... },     // solo los que uses en requisitos
//     profile: { formacion, entorno, desarrollo, caracter, estilo, imagen, decisiones, sueno },
//     flags:   Set<string>,       // banderas de la carrera
//     done:    Set<string>,       // actividades ya hechas alguna vez
//     history: { [activityId]: últimaTemporada },
//     rng:     () => número en [0,1)   // USA TU GENERADOR CON SEMILLA, no Math.random
//   }
//   Los nombres de profile/stats deben coincidir con los de tu motor: ajusta los datos o mapea aquí.
//   El motor actualiza esta foto localmente (dinero, flags, history, done) para que los
//   requisitos sigan siendo correctos dentro del mismo verano; tú persistes con el adaptador.
//
// ADAPTADOR (todos los métodos son opcionales; los que no implementes se ignoran)
//   add(stat, delta)                     // moral, reputacion, hinchada, dinero (en sueldos anuales)...
//   setFlag(flag)
//   addSeasonMod(clave, valor, temporadas)   // ej. ('lesiones', -0.12, 1) = −12 % lesiones
//   addService(id, { upkeep, perSeason })    // gasto anual + modificadores mientras siga activo
//   scheduleEvent(id, despuesDeTemporadas, probabilidad)  // enlaza con tus "hilos" narrativos
//   injure(semanas)                          // lesión con duración (usa tu sistema de lesiones)
//   markDone(activityId, temporada)          // persiste cooldown / "una sola vez"

// ───────────────────────── Configuración ─────────────────────────

export const KNOWN_STATS = [
  'moral', 'confianzaDT', 'reputacion', 'hinchada', 'directiva', 'vestuario', 'fatiga', 'forma',
  'vinculoFamiliar', 'vinculoPrensa', 'vinculoRepresentante', 'vinculoCompanero',
  'impactoSocial', 'escandalos', 'dinero',
];
// Modificadores en fracción: -0.12 = −12 %, +0.03 = +3 % (misma convención que el Anexo A)
export const KNOWN_MODS = ['lesiones', 'desarrollo', 'minutos', 'serenidad', 'mercadoGrandes'];
export const PROFILE_KEYS = ['formacion', 'entorno', 'desarrollo', 'caracter', 'estilo', 'imagen', 'decisiones', 'sueno'];

export const DEFAULTS = {
  weeks: 6,                       // cupos de verano
  offersPerWeek: 3,               // ofertas sorteadas cada semana
  maxSameCategoryInOffers: 2,     // no más de 2 ofertas de la misma categoría a la vez
  categoryRepeatPenalty: 0.5,     // peso ×0.5 por cada actividad de esa categoría ya hecha este verano
  // Tope de GANANCIA positiva por verano (anti-farmeo). Las pérdidas no tienen tope.
  gainCaps: { moral: 8, reputacion: 5, hinchada: 5, confianzaDT: 5, directiva: 4, vestuario: 5, impactoSocial: 6 },
  idleWeekFx: { fatiga: -1 },     // semana sin actividad: descansas un poco (ajusta a tu escala)
};

// ───────────────────────── Utilidades ─────────────────────────

const asArray = (v) => (v == null ? [] : Array.isArray(v) ? v : [v]);

export function normalizeCtx(ctx) {
  ctx.flags ??= new Set();
  ctx.done ??= new Set();
  ctx.history ??= {};
  ctx.stats ??= {};
  ctx.profile ??= {};
  ctx.money ??= 0;
  ctx.rng ??= Math.random; // en tu juego pasa SIEMPRE tu generador con semilla
  return ctx;
}

// Condición unificada: sirve para requisitos, bonus de peso y ajustes por rasgos.
//   { minAge, maxAge, minMoney, minStat:{reputacion:10}, maxStat:{...},
//     profile:{ caracter:'rebelde' | ['rebelde','competitivo'] }, flag:'x'|[...], notFlag:'x'|[...] }
// Todas las claves presentes deben cumplirse.
export function matches(cond = {}, ctx) {
  if (cond.minAge != null && ctx.age < cond.minAge) return false;
  if (cond.maxAge != null && ctx.age > cond.maxAge) return false;
  if (cond.minMoney != null && ctx.money < cond.minMoney) return false;
  for (const [s, n] of Object.entries(cond.minStat ?? {})) if ((ctx.stats?.[s] ?? 0) < n) return false;
  for (const [s, n] of Object.entries(cond.maxStat ?? {})) if ((ctx.stats?.[s] ?? 0) > n) return false;
  for (const [k, v] of Object.entries(cond.profile ?? {})) if (!asArray(v).includes(ctx.profile?.[k])) return false;
  for (const f of asArray(cond.flag)) if (!ctx.flags.has(f)) return false;
  for (const f of asArray(cond.notFlag)) if (ctx.flags.has(f)) return false;
  return true;
}

// Elige un índice según pesos (ignora pesos ≤ 0). Devuelve -1 si no hay ninguno positivo.
function weightedPick(weights, rng) {
  const total = weights.reduce((s, w) => s + Math.max(0, w), 0);
  if (total <= 0) return -1;
  let r = rng() * total;
  let last = -1;
  for (let i = 0; i < weights.length; i++) {
    if (weights[i] <= 0) continue;
    last = i;
    r -= weights[i];
    if (r < 0) return i;
  }
  return last;
}

// ───────────────────────── Probabilidades y riesgo ─────────────────────────

// Probabilidades de cada resultado tras aplicar los rasgos del jugador (renormalizadas a 1).
export function modeProbs(mode, ctx) {
  const raw = {};
  for (const o of mode.outcomes) raw[o.id] = o.p;
  for (const tm of mode.traitMods ?? []) {
    if (!matches(tm.when, ctx)) continue;
    for (const [id, d] of Object.entries(tm.shift)) if (id in raw) raw[id] = Math.max(0, raw[id] + d);
  }
  const total = Object.values(raw).reduce((s, p) => s + p, 0) || 1;
  return Object.fromEntries(Object.entries(raw).map(([id, p]) => [id, p / total]));
}

// Icono de riesgo calculado (no se declara a mano): suma de probabilidad de resultados con bad:true.
export function riskLevel(mode, ctx) {
  const probs = modeProbs(mode, ctx);
  const pBad = mode.outcomes.filter((o) => o.bad).reduce((s, o) => s + probs[o.id], 0);
  return pBad < 0.15 ? 'bajo' : pBad < 0.35 ? 'medio' : 'alto'; // 🟢 🟡 🔴
}

const canAfford = (mode, ctx) => (mode.cost ?? 0) <= ctx.money + 1e-9;

// Para pintar la pantalla: cada modo con su coste, riesgo y si está disponible (y por qué no).
export function describeModes(activity, ctx) {
  return activity.modes.map((mode) => {
    let reason = null;
    if (!matches(mode.requires, ctx)) reason = 'requisitos';
    else if (!canAfford(mode, ctx)) reason = 'dinero';
    return { mode, enabled: reason === null, reason, cost: mode.cost ?? 0, risk: riskLevel(mode, ctx) };
  });
}

// ───────────────────────── Sorteo de ofertas ─────────────────────────

export function startSummer(ctx, weeks = DEFAULTS.weeks) {
  normalizeCtx(ctx);
  return { season: ctx.season, weeksLeft: weeks, chosen: [], categoriesUsed: {}, gains: {}, totals: {}, log: [] };
}

export function isEligible(a, ctx, summer) {
  if (a.weeks > summer.weeksLeft) return false;
  if (summer.chosen.includes(a.id)) return false;               // no repetir en el mismo verano
  if (a.once && ctx.done.has(a.id)) return false;                // "una sola vez en la carrera"
  const last = ctx.history[a.id];
  if (a.cooldown && last != null && ctx.season - last < a.cooldown) return false;
  if (!matches(a.requires, ctx)) return false;
  return a.modes.some((m) => matches(m.requires, ctx) && canAfford(m, ctx));
}

export function drawOffers(activities, ctx, summer, n = DEFAULTS.offersPerWeek) {
  const pool = activities.filter((a) => isEligible(a, ctx, summer));
  const picked = [];
  const catCount = {};
  while (picked.length < n && pool.length) {
    const weights = pool.map((a) => {
      let w = a.weight ?? 1;
      for (const b of a.boosts ?? []) if (matches(b.when, ctx)) w *= b.mult;
      w *= Math.pow(DEFAULTS.categoryRepeatPenalty, summer.categoriesUsed[a.category] ?? 0);
      if ((catCount[a.category] ?? 0) >= DEFAULTS.maxSameCategoryInOffers) w = 0;
      return w;
    });
    const idx = weightedPick(weights, ctx.rng);
    if (idx < 0) break;
    const [a] = pool.splice(idx, 1);
    catCount[a.category] = (catCount[a.category] ?? 0) + 1;
    picked.push(a);
  }
  return picked;
}

// ───────────────────────── Elegir y resolver ─────────────────────────

function change(ctx, adapter, stat, delta) {
  adapter.add?.(stat, delta);
  if (stat === 'dinero') ctx.money += delta;
  else if (stat in ctx.stats) ctx.stats[stat] += delta;
}

export function chooseMode(summer, activity, modeId, ctx, adapter = {}) {
  const mode = activity.modes.find((m) => m.id === modeId);
  if (!mode) throw new Error(`Modo desconocido: ${activity.id}/${modeId}`);
  if (!isEligible(activity, ctx, summer) || !matches(mode.requires, ctx) || !canAfford(mode, ctx)) {
    throw new Error(`No disponible ahora: ${activity.id}/${modeId}`);
  }

  const risk = riskLevel(mode, ctx);
  summer.weeksLeft -= activity.weeks;
  summer.chosen.push(activity.id);
  summer.categoriesUsed[activity.category] = (summer.categoriesUsed[activity.category] ?? 0) + 1;
  if (mode.cost) change(ctx, adapter, 'dinero', -mode.cost);

  // 1) El azar, ponderado por los rasgos
  const probs = modeProbs(mode, ctx);
  const ids = Object.keys(probs);
  const pick = weightedPick(ids.map((id) => probs[id]), ctx.rng);
  const outcome = mode.outcomes.find((o) => o.id === ids[Math.max(0, pick)]);

  // 2) Efectos inmediatos (con tope de ganancia por verano)
  const applied = {};
  for (const [stat, delta] of Object.entries(outcome.fx ?? {})) {
    let d = delta;
    const cap = DEFAULTS.gainCaps[stat];
    if (d > 0 && cap != null) {
      d = Math.min(d, Math.max(0, cap - (summer.gains[stat] ?? 0)));
      summer.gains[stat] = (summer.gains[stat] ?? 0) + d;
    }
    if (d === 0) continue;
    change(ctx, adapter, stat, d);
    applied[stat] = d;
    summer.totals[stat] = (summer.totals[stat] ?? 0) + d;
  }

  // 3) Efectos que se extienden en el tiempo
  for (const [k, v] of Object.entries(outcome.next ?? {})) adapter.addSeasonMod?.(k, v, 1);
  for (const f of outcome.flags ?? []) { ctx.flags.add(f); adapter.setFlag?.(f); }
  if (outcome.injury) adapter.injure?.(outcome.injury);
  for (const fu of outcome.followUps ?? []) adapter.scheduleEvent?.(fu.id, fu.after, fu.p ?? 1);
  if (mode.service) {
    const flag = `svc_${mode.service.id}`;
    ctx.flags.add(flag);
    adapter.setFlag?.(flag);
    adapter.addService?.(mode.service.id, { upkeep: mode.service.upkeep, perSeason: mode.service.perSeason });
  }

  ctx.history[activity.id] = ctx.season;
  ctx.done.add(activity.id);
  adapter.markDone?.(activity.id, ctx.season);

  const result = {
    activity: activity.id, mode: modeId, outcome: outcome.id, risk, bad: !!outcome.bad,
    text: outcome.text, headline: outcome.headline ?? null, applied,
  };
  summer.log.push(result);
  return result;
}

export function skipWeek(summer, ctx, adapter = {}) {
  summer.weeksLeft -= 1;
  for (const [stat, d] of Object.entries(DEFAULTS.idleWeekFx)) change(ctx, adapter, stat, d);
  summer.log.push({ activity: null, mode: null, outcome: 'descanso', text: 'Semana tranquila.', headline: null, applied: { ...DEFAULTS.idleWeekFx } });
}

export function finishSummer(summer) {
  return {
    season: summer.season,
    weeksUnused: summer.weeksLeft,
    log: summer.log,
    headlines: summer.log.filter((r) => r.headline).map((r) => r.headline),
    totals: { ...summer.totals },
  };
}

// Verano automático (botón "resumir verano" o simulación de balance).
export function runSummer({ activities, ctx, adapter, policy = policyRandom, weeks }) {
  const summer = startSummer(ctx, weeks);
  while (summer.weeksLeft > 0) {
    const offers = drawOffers(activities, ctx, summer);
    const pick = policy({ offers, ctx, summer });
    if (pick) chooseMode(summer, pick.activity, pick.modeId, ctx, adapter);
    else skipWeek(summer, ctx, adapter);
  }
  return finishSummer(summer);
}

// ───────────────────────── Validación de datos ─────────────────────────

export function validateActivities(activities) {
  const errs = [];
  const seen = new Set();
  const err = (id, msg) => errs.push(`${id}: ${msg}`);
  for (const a of activities) {
    if (seen.has(a.id)) err(a.id, 'id repetido');
    seen.add(a.id);
    if (!a.category) err(a.id, 'falta category');
    if (!Number.isInteger(a.weeks) || a.weeks < 1) err(a.id, 'weeks debe ser entero ≥ 1');
    if (!a.title || !a.blurb) err(a.id, 'falta title o blurb');
    if (!a.modes?.length) { err(a.id, 'sin modos'); continue; }
    const modeIds = new Set();
    for (const m of a.modes) {
      const mid = `${a.id}/${m.id}`;
      if (modeIds.has(m.id)) err(mid, 'modo repetido');
      modeIds.add(m.id);
      if (!m.label) err(mid, 'falta label');
      if (!m.outcomes?.length) { err(mid, 'sin resultados'); continue; }
      const oids = new Set();
      let sum = 0;
      for (const o of m.outcomes) {
        if (oids.has(o.id)) err(mid, `resultado repetido: ${o.id}`);
        oids.add(o.id);
        sum += o.p;
        if (!o.text) err(`${mid}/${o.id}`, 'falta text');
        for (const k of Object.keys(o.fx ?? {})) if (!KNOWN_STATS.includes(k)) err(`${mid}/${o.id}`, `stat desconocido en fx: ${k}`);
        for (const k of Object.keys(o.next ?? {})) if (!KNOWN_MODS.includes(k)) err(`${mid}/${o.id}`, `modificador desconocido en next: ${k}`);
      }
      if (Math.abs(sum - 1) > 0.001) err(mid, `las probabilidades suman ${sum.toFixed(3)} (deben sumar 1)`);
      for (const tm of m.traitMods ?? []) {
        for (const id of Object.keys(tm.shift)) if (!oids.has(id)) err(mid, `traitMods apunta a un resultado inexistente: ${id}`);
        for (const k of Object.keys(tm.when?.profile ?? {})) if (!PROFILE_KEYS.includes(k)) err(mid, `clave de profile desconocida: ${k}`);
      }
      if (m.service) for (const k of Object.keys(m.service.perSeason ?? {})) if (!KNOWN_MODS.includes(k)) err(mid, `modificador desconocido en service: ${k}`);
    }
    for (const b of a.boosts ?? []) for (const k of Object.keys(b.when?.profile ?? {})) if (!PROFILE_KEYS.includes(k)) err(a.id, `clave de profile desconocida en boosts: ${k}`);
  }
  return errs;
}

// ───────────────────────── Herramientas de simulación / balance ─────────────────────────

export function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Adaptador que solo anota lo que pasó (para simular sin tocar tu partida).
export function createRecordingAdapter() {
  const rec = { totals: {}, mods: {}, services: [], events: [], flags: new Set(), injuryWeeks: 0 };
  const adapter = {
    add: (s, d) => { rec.totals[s] = (rec.totals[s] ?? 0) + d; },
    setFlag: (f) => rec.flags.add(f),
    addSeasonMod: (k, v) => { rec.mods[k] = (rec.mods[k] ?? 0) + v; },
    addService: (id, svc) => rec.services.push({ id, ...svc }),
    scheduleEvent: (id, after, p) => rec.events.push({ id, after, p }),
    injure: (w) => { rec.injuryWeeks += w; },
  };
  return { adapter, rec };
}

// Valor esperado de un modo según unos pesos por stat. Sirve para políticas "codiciosas".
// weights: { reputacion: 3, dinero: 10, lesiones: -40, injury: -1.5, ... }  (injury = valor por semana de baja)
// Los servicios se valoran a `horizon` temporadas. No cuenta los eventos futuros (followUps).
export function expectedValue(mode, weights, ctx, horizon = 5) {
  const probs = modeProbs(mode, ctx);
  let ev = -(mode.cost ?? 0) * (weights.dinero ?? 0);
  for (const o of mode.outcomes) {
    let v = (o.injury ?? 0) * (weights.injury ?? 0);
    for (const [k, d] of Object.entries(o.fx ?? {})) v += d * (weights[k] ?? 0);
    for (const [k, d] of Object.entries(o.next ?? {})) v += d * (weights[k] ?? 0);
    ev += probs[o.id] * v;
  }
  if (mode.service) {
    for (const [k, d] of Object.entries(mode.service.perSeason ?? {})) ev += d * (weights[k] ?? 0) * horizon;
    ev -= (mode.service.upkeep ?? 0) * (weights.dinero ?? 0) * horizon;
  }
  return ev;
}

const enabledOptions = (offers, ctx, filter = () => true) => {
  const out = [];
  for (const a of offers) {
    if (!filter(a)) continue;
    for (const d of describeModes(a, ctx)) if (d.enabled) out.push({ activity: a, modeId: d.mode.id, mode: d.mode });
  }
  return out;
};

export function policyRandom({ offers, ctx }) {
  const opts = enabledOptions(offers, ctx);
  return opts.length ? opts[Math.floor(ctx.rng() * opts.length)] : null;
}

// Elige lo mejor por cupo según `weights`; si nada suma valor, descansa.
export function policyGreedy(weights) {
  return ({ offers, ctx }) => {
    let best = null;
    let bestV = 0;
    for (const o of enabledOptions(offers, ctx)) {
      const v = expectedValue(o.mode, weights, ctx) / o.activity.weeks;
      if (v > bestV) { bestV = v; best = o; }
    }
    return best;
  };
}

// "¿Y si el jugador solo hiciera X?": solo toma ofertas de una categoría (ej. 'ayuda').
export function policyCategory(category) {
  return ({ offers, ctx }) => {
    const opts = enabledOptions(offers, ctx, (a) => a.category === category);
    return opts.length ? opts[Math.floor(ctx.rng() * opts.length)] : null;
  };
}
