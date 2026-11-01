// summer-demo.mjs — ejecuta:  node summer-demo.mjs
// 1) Valida los datos.  2) Simula miles de veranos con distintas "estrategias" de jugador
// para ver si alguna rinde demasiado más que las demás (señal de que algo está roto).

import { ACTIVITIES } from './summer-activities.mjs';
import {
  validateActivities, runSummer, createRecordingAdapter, mulberry32,
  policyRandom, policyGreedy, policyCategory,
} from './summer-engine.mjs';

// ── 1) Validación ──
const problems = validateActivities(ACTIVITIES);
if (problems.length) {
  console.log('PROBLEMAS EN LOS DATOS:');
  problems.forEach((p) => console.log(' -', p));
  process.exit(1);
}
console.log(`✔ ${ACTIVITIES.length} actividades válidas\n`);

// ── 2) Simulación ──
const RUNS = 3000;
const pick = (rng, arr) => arr[Math.floor(rng() * arr.length)];

// Perfil aleatorio con IDs reales del creador.
function makeCtx(rng) {
  return {
    season: 6,
    age: 18 + Math.floor(rng() * 17),
    money: 1 + rng() * 2.5,
    stats: { reputacion: 15 + rng() * 40, hinchada: 30, moral: 50 },
    profile: {
      formacion: pick(rng, ['barrio', 'cantera', 'amateur', 'academia']),
      entorno: pick(rng, ['sin_contactos', 'familia_futbolera', 'club_formativo', 'autodidacta', 'migrante', 'campesino', 'escuela', 'doble_turno']),
      caracter: pick(rng, ['disciplinado', 'ambicioso', 'leal', 'carismatico', 'sereno', 'rebelde', 'lider', 'obsesivo', 'solidario', 'competitivo']),
      imagen: pick(rng, ['reservado', 'referente', 'mediatico', 'provocador', 'solidario', 'analitico', 'confiado']),
      decisiones: pick(rng, ['paciente', 'audaz', 'calculador', 'economico', 'hogareno', 'aventurero', 'leal']),
      sueno: pick(rng, ['seleccion', 'europa', 'idolo', 'titulos', 'cantera', 'regresar', 'capitan', 'goleador', 'resistencia']),
    },
    rng,
  };
}

// Cuánto vale cada cosa para el "jugador optimizador". Ajusta a lo que tú consideres importante.
const W = {
  moral: 1, reputacion: 3, hinchada: 2, confianzaDT: 2, directiva: 1.5, vestuario: 1.5, forma: 1, fatiga: -0.5,
  vinculoPrensa: 1, vinculoFamiliar: 1, vinculoRepresentante: 1, vinculoCompanero: 1,
  impactoSocial: 2, escandalos: -4, dinero: 10,
  lesiones: -40, desarrollo: 60, minutos: 60, serenidad: 30, mercadoGrandes: 30, injury: -1.5,
};
const score = (rec) => {
  let s = 0;
  for (const [k, v] of Object.entries(rec.totals)) s += v * (W[k] ?? 0);
  for (const [k, v] of Object.entries(rec.mods)) s += v * (W[k] ?? 0);
  s += rec.injuryWeeks * W.injury;
  for (const sv of rec.services) {
    for (const [k, v] of Object.entries(sv.perSeason ?? {})) s += v * (W[k] ?? 0) * 5;
    s -= (sv.upkeep ?? 0) * W.dinero * 5;
  }
  return s;
};

const POLICIES = {
  'Al azar': policyRandom,
  'Optimizador (codicioso)': policyGreedy(W),
  'Solo ayudar': policyCategory('ayuda'),
  'Solo prensa': policyCategory('prensa'),
  'Solo fiesta/locura': (args) => policyCategory('locura')(args) ?? policyCategory('social')(args),
  'Solo dinero': policyCategory('dinero'),
};

const rows = {};
const picksByPolicy = {};
for (const [name, policy] of Object.entries(POLICIES)) {
  // Cada muestra tiene un perfil y una fuente de azar propios que NO
  // dependen de la cantidad de tiradas consumidas por la política previa.
  let total = 0, bad = 0, n = 0, escandalos = 0, lesiones = 0;
  const picks = {};
  for (let i = 0; i < RUNS; i++) {
    const ctx = makeCtx(mulberry32((12345 + Math.imul(i+1, 0x9e3779b1)) >>> 0));
    ctx.rng = mulberry32((98765 + Math.imul(i+1, 0x85ebca6b)) >>> 0);
    const { adapter, rec } = createRecordingAdapter();
    const report = runSummer({ activities: ACTIVITIES, ctx, adapter, policy });
    total += score(rec);
    escandalos += rec.totals.escandalos ?? 0;
    lesiones += rec.injuryWeeks;
    for (const r of report.log) {
      if (!r.activity) continue;
      n++;
      if (r.bad) bad++;
      const key = `${r.activity}/${r.mode}`;
      picks[key] = (picks[key] ?? 0) + 1;
    }
  }
  rows[name] = {
    'Puntaje medio': +(total / RUNS).toFixed(1),
    '% resultados malos': +((100 * bad) / Math.max(1, n)).toFixed(1),
    'Escándalos/verano': +(escandalos / RUNS).toFixed(2),
    'Semanas de lesión/verano': +(lesiones / RUNS).toFixed(2),
  };
  picksByPolicy[name] = picks;
}
console.table(rows);

console.log('\nTop 6 elecciones del OPTIMIZADOR (si una domina, es candidata a rebalancear):');
const top = Object.entries(picksByPolicy['Optimizador (codicioso)']).sort((a, b) => b[1] - a[1]).slice(0, 6);
const totalPicks = Object.values(picksByPolicy['Optimizador (codicioso)']).reduce((s, v) => s + v, 0);
for (const [k, v] of top) console.log(`  ${k.padEnd(34)} ${((100 * v) / totalPicks).toFixed(1)} % de las elecciones`);
