/* RASCENSO 4.10.7 — hitos y contexto verificables.
 * Funciones puras: no alteran estadísticas ni resultado del partido. */
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const fmt=(v)=>Math.round(v*10)/10;
const stat=(rows,key)=>rows.reduce((sum,r)=>sum+(Number(r?.[key])||0),0);

export function seasonMilestones4110(state,season){
 const old=Array.isArray(state?.history)?state.history:[];
 const previous=Array.isArray(state?.milestones4110)?state.milestones4110:[];
 const already=new Set(previous.map(x=>x.id));
 // Para partidas antiguas: no se reescriben hitos cuya fecha real ya está en el historial.
 const seen={debut:stat(old,'matches')>0,first_goal:stat(old,'goals')>0,first_cap:stat(old,'nationalCaps')>0,first_title:old.some(x=>x.titles?.length),first_assist:stat(old,'assists')>0};
 const y=Number(season?.year)||Number(state?.startYear)||2026;
 const name=String(season?.club||'tu equipo');
 const options=[
  ['debut',!seen.debut&&season.matches>0,'⚽','¡Debut profesional!',`Jugaste tus primeros partidos oficiales con ${name}.`],
  ['first_goal',!seen.first_goal&&season.goals>0,'🥅','¡Primer gol de tu carrera!',`Marcaste ${season.goals} gol${season.goals===1?'':'es'} en ${name} durante ${y}.`],
  ['first_assist',!seen.first_assist&&season.assists>0,'🎯','¡Primera asistencia!',`Diste tu primera asistencia oficial con ${name}.`],
  ['first_cap',!seen.first_cap&&season.nationalCaps>0,'🌎','¡Debut con la selección!',`Sumaste ${season.nationalCaps} partido${season.nationalCaps===1?'':'s'} internacional${season.nationalCaps===1?'':'es'} en ${y}.`],
  ['first_title',!seen.first_title&&season.titles?.length>0,'🏆','¡Tu primer título!',`Ganaste ${season.titles[0]} con ${name}.`]
 ];
 return options.filter(([id,yes])=>yes&&!already.has(id)).map(([id,,icon,title,description])=>({id,year:y,icon,title,description,clubId:season.clubId}));
}

/** Variantes del mismo tipo de jugada; siempre ligadas al partido y a su marcador. */
export function contextVariation4110(s,play){
 const previous=(s?.history||[]).flatMap(x=>x.plays||[]).filter(x=>x.type===play.type);
 const seed=String(play.type);
 let code=0;for(let i=0;i<seed.length;i++)code=(Math.imul(code,31)+seed.charCodeAt(i))>>>0;
 const count=previous.length;
 const flavors=['Lectura del rival','El momento de decidir','Una segunda oportunidad','Contra la presión'];
 const flavour=flavors[(code+count)%flavors.length];
 const debut=(s?.history||[]).length===0;
 const closing=!!play.lastRound;
 const trailing=(play.before?.gf??0)<(play.before?.ga??0);
 const tied=(play.before?.gf??0)===(play.before?.ga??0);
 const kind=play.isFinal?'cup_final':play.classic?'classic':closing?'last_round':debut?'debut':play.minute>=85?'last_minute':trailing?'comeback':tied?'tie':'match';
 const tags={cup_final:'FINAL DE COPA · TODO O NADA',classic:'CLÁSICO · ORGULLO EN JUEGO',last_round:'JORNADA FINAL DE LIGA',debut:'TU PRIMERA TEMPORADA',last_minute:'LOS ÚLTIMOS MINUTOS',comeback:'BUSCANDO LA REMONTADA',tie:'EL PARTIDO ESTÁ IGUALADO',match:flavour.toUpperCase()};
 const notes={cup_final:'Una final real registrada en el calendario. Cada acción puede decidir el título.',classic:'La rivalidad añade tensión. Tu decisión puede definir este clásico.',last_round:'Última jornada del calendario: este partido cierra la temporada.',debut:'Tu estreno profesional: cada intervención es una oportunidad para darte a conocer.',last_minute:'El reloj aprieta y cada segundo importa.',comeback:'Tu equipo está abajo: una buena jugada puede acercarlo.',tie:'Nadie ha sacado ventaja todavía. Puedes cambiar el partido.',match:'Lee al rival y elige el momento justo para intervenir.'};
 return {kind,tag:tags[kind],note:notes[kind],flavour,sequence:count+1,identity:`${play.type}:${kind}:${(code+count)%flavors.length}`};
}

/** Avisos SOLO cuando se verifica una diferencia en las capacidades calculadas. */
export function traitSignals4110(state,play,playerStats){
 if(!state||!play||typeof playerStats!=='function')return [];
 const selected=[
  ['personality','Carácter'],['developmentPath','Desarrollo'],['environment','Entorno'],
  ['style','Estilo'],['strength','Fortaleza'],['weakness','Debilidad'],['origin','Raíces'],['foot','Pierna hábil']
 ];
 const labels={sereno:'Sangre fría',mental:'Mentalidad competitiva',recuperacion:'Cuidar el cuerpo',migrante:'Entorno migrante',
  regateador:'Uno contra uno',tecnica:'Talento técnico',disciplinado:'Disciplina',Izquierda:'Pierna izquierda',Derecha:'Pierna derecha'};
 const current=playerStats(state,play),out=[];
 const type=String(play.type||'');
 const allowed={feint:['encare','diagonal','mano_a_mano','contragolpe'],reflex:['reflejos','penal_atajado','achique','salida_aerea'],tackleReach:['entrada','recuperacion','anticipacion','despeje'],sprint:['encare','diagonal','mano_a_mano','contragolpe','entrada','recuperacion','anticipacion','despeje','fuera_juego'],passNoise:['centro','pase_filtrado','rondo','contragolpe','encare']};
 const metrics=[['composure','serenidad','pp',100],['nerves','nervios','pp',-100],['feint','eficacia de amague','pp',100],['reflex','reflejos','pp',100],['tackleReach','alcance de entrada','m',1],['sprint','sprint','m/s',1],['passNoise','error de pase','m',-1]];
 for(const [field,cat] of selected){
  const id=state[field];if(!id)continue;
  const neutral={...state,[field]:undefined};
  const baseline=playerStats(neutral,play);
  let impact=null;
  for(const [key,label,unit,sign] of metrics){
   if(allowed[key]&&!allowed[key].includes(type))continue;
   if(!Number.isFinite(current[key])||!Number.isFinite(baseline[key]))continue;
   const difference=(current[key]-baseline[key])*sign;
   if(difference<=.001)continue;
   const score=unit==='pp'?Math.round(difference*10)*10:fmt(difference);
   if(score<=0)continue;
   if(!impact||difference>impact.weight)impact={label,unit,value:score,weight:difference};
  }
  if(impact){
   const value=impact.unit==='pp'?`+${fmt(impact.weight*100)} puntos porcentuales`:`+${fmt(impact.weight)} ${impact.unit}`;
   out.push({id:`${field}:${id}`,title:labels[id]||id.replace(/_/g,' '),text:`Tu ${labels[id]||cat.toLowerCase()} aporta ${value} de ${impact.label} en esta jugada.`,weight:impact.weight});
  }
 }
 return out.sort((a,b)=>b.weight-a.weight).slice(0,3);
}

/** Bonos pasivos auditables: no se afirma que causaron un gol o evitaron una lesión. */
export function seasonTraitSignals4110(state,season,choiceFx,identitySeasonEffects){
 if(!season||!state||typeof choiceFx!=='function')return [];
 const out=[];
 const paths=[['developmentPath','Senda de desarrollo'],['origin','Formación'],['environment','Entorno'],['personality','Carácter'],['style','Estilo']];
 const original=choiceFx(state);
 for(const [key,label] of paths){
  if(!state[key])continue;
  const without=choiceFx({...state,[key]:undefined});
  const growth=original.growth/Math.max(.01,without.growth);
  const minutes=original.minutes-without.minutes;
  if(Math.abs(growth-1)>.006){const sign=growth>1?'+':'';out.push({id:key+':growth',title:label,text:`${state[key].replaceAll('_',' ')}: ${sign}${Math.round((growth-1)*100)} % de crecimiento relativo por este rasgo.`});}
  if(Math.abs(minutes)>.004){out.push({id:key+':minutes',title:label,text:`${state[key].replaceAll('_',' ')}: ${minutes>0?'+':''}${fmt(minutes*100)} puntos porcentuales en el modificador de minutos.`});}
 }
 if(typeof identitySeasonEffects==='function'&&state.developmentPath==='recuperacion'){
  const f=identitySeasonEffects(state),b=identitySeasonEffects({...state,developmentPath:undefined});
  if(f.injury<b.injury)out.unshift({id:'recovery',title:'Cuidar el cuerpo',text:`Tu senda reduce el multiplicador de riesgo de lesiones un ${Math.round((1-f.injury/b.injury)*100)} %; no garantiza evitar lesiones.`});
 }
 return out.slice(0,5);
}
