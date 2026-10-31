/* RASCENSO 4.3 — dificultad contextual por cada jugada, sin porcentajes de éxito impuestos. */
export const PLAY_TUNING=Object.freeze({
 mano_a_mano:{chance:-.035,defense:.03,keeper:.08,pace:.01,tag:'Definición bajo presión'},
 penal:{chance:-.04,keeper:.10,tag:'Duelo psicológico'},
 cabezazo:{chance:-.025,defense:.04,tag:'Dominio aéreo'},
 remate:{chance:-.02,keeper:.04,tag:'Primer toque'},
 diagonal:{chance:.015,defense:.02,tag:'Cambio de ritmo'},
 tiro_libre:{chance:-.06,keeper:.07,tag:'Balón detenido'},
 encare:{chance:-.025,defense:.09,tag:'Uno contra uno'},
 centro:{chance:.015,defense:.045,tag:'Precisión y desmarque'},
 pase_filtrado:{chance:.075,defense:-.065,pace:-.035,tag:'Visión entre líneas'},
 contragolpe:{chance:.035,defense:-.045,tag:'Decisión en velocidad'},
 rondo:{chance:-.045,defense:.06,pace:.02,tag:'Control con presión'},
 recuperacion:{chance:-.045,defense:.09,pace:.045,tag:'Lectura y robo'},
 entrada:{chance:-.045,defense:.095,pace:.035,tag:'Momento de la entrada'},
 anticipacion:{chance:-.015,defense:.04,tag:'Cortar la línea'},
 despeje:{chance:-.025,defense:.07,pace:.035,tag:'Disputa aérea'},
 fuera_juego:{chance:-.045,defense:.09,tag:'Coordinación de línea'},
 achique:{chance:-.055,shooter:.09,pace:.01,tag:'Cerrar el ángulo'},
 salida_aerea:{chance:-.035,defense:.08,tag:'Lectura del centro'},
 penal_atajado:{chance:-.055,shooter:.08,tag:'La decisión del arquero'},
 reflejos:{chance:-.055,shooter:.11,tag:'Reacción al rebote'}
});
export const tuningFor=id=>PLAY_TUNING[id]||{chance:0,tag:'Momento de partido'};
export const tunedChance=(base,id)=>Math.max(.06,Math.min(.88,base+(tuningFor(id).chance||0)));
export const tunedAI=(raw,id)=>{
 const t=tuningFor(id);
 const limit=(v,a,b)=>Math.max(a,Math.min(b,v));
 return {...raw,
  d:limit(raw.d+(t.defense||0)*.22+(t.keeper||0)*.16+(t.shooter||0)*.16,.1,.98),
  defSpeed:raw.defSpeed*(1+(t.defense||0)*.55+(t.pace||0)),
  defReaction:limit(raw.defReaction-(t.defense||0)*.65,.17,.65),
  keeperReaction:limit(raw.keeperReaction-(t.keeper||0)*.38,.14,.45),
  keeperSpeed:raw.keeperSpeed*(1+(t.keeper||0)*.65),
  feintResist:limit(raw.feintResist+(t.defense||0)*.45,.1,.9),
  passTell:limit(raw.passTell-(t.defense||0)*.3,.32,.92),
  shooterSkill:limit(raw.shooterSkill+(t.shooter||0)*.58,.35,.98)
 };
};
/** Perfil de desafíos: cada uno modifica rivales y no solo la probabilidad de simular. */
export function playBalanceMatrix(){
 return Object.entries(PLAY_TUNING).map(([id,t])=>({id,automaticOffset:t.chance,defense:t.defense||0,keeper:t.keeper||0,shooter:t.shooter||0,identity:t.tag}));
}
