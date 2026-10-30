/* RASCENSO 1.2: los nombres son referencias a medios reales.
   TODOS los titulares y las entrevistas son FICCIÓN DEL JUEGO.
   Ningún medio participa, patrocina o publica estos textos. */
const MEDIA={
 CL:[['TNT Sports Chile','cobertura'],['RedGol','actualidad'],['En Cancha','análisis'],['AS Chile','crónica'],['El Deportivo','opinión']],
 AR:[['Olé','crónica'],['TyC Sports','cobertura'],['ESPN Argentina','análisis']],
 BR:[['ge','actualidad'],['ESPN Brasil','análisis'],['Lance!','crónica']],
 ES:[['MARCA','crónica'],['AS','opinión'],['Mundo Deportivo','análisis'],['SPORT','actualidad']],
 EN:[['BBC Sport','cobertura'],['Sky Sports','análisis'],['The Athletic','crónica']],
 FR:[["L'Équipe",'análisis'],['RMC Sport','actualidad']],
 DE:[['kicker','análisis'],['Sky Sport Deutschland','cobertura']],
 IT:[['La Gazzetta dello Sport','crónica'],['Corriere dello Sport','análisis']],
 PT:[['A Bola','crónica'],['Record Portugal','actualidad']],
 NL:[['Voetbal International','análisis']],
 MX:[['TUDN','cobertura'],['Récord','actualidad']],
 US:[['ESPN','análisis']],
 UY:[['Ovación','crónica']], CO:[['Win Sports','cobertura']], PE:[['Depor','actualidad']],
};
const GLOBAL=[['ESPN Deportes','análisis'],['Reuters Sports','cobertura'],['The Athletic','análisis']];
const hash=value=>{let h=2166136261;for(const ch of String(value||'')){h^=ch.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0;};
export function outletFor(state,topic='prensa'){
 const code=state?.clubCountry||state?.countryCode||state?.clubCode||state?.country||'CL';
 const candidates=MEDIA[code]||GLOBAL;
 const key=[state?.seed, state?.clubId, state?.lastSeason?.year, state?.age, topic].join('|');
 const [name,style]=candidates[hash(key)%candidates.length];
 return {name,style,kind:'ficcion',notice:'Cobertura ficticia de RASCENSO · no publicada por el medio'};
}
export function pressHeadline(state,outlet,topic='temporada'){
 const club=state?.clubName||state?.lastSeason?.club||'el club';
 const a=state?.lastSeason||{}, goals=Number(a.goals)||0,assists=Number(a.assists)||0;
 const catalogue={
  cobertura:[`La temporada de ${club} bajo la lupa`,`Lo que dejó la campaña en ${club}`,`${goals} goles y ${assists} asistencias: los números de un año`],
  actualidad:[`La carrera sigue: los desafíos tras el cierre de temporada`,`Las decisiones que vienen en ${club}`,`Una campaña que abre preguntas sobre el próximo año`],
  análisis:[`El rendimiento también se explica por los minutos`,`Las cifras y el contexto de ${club}`,`Qué dicen los ${goals} goles y ${assists} pases de gol`],
  crónica:[`Una temporada para recordar y corregir`,`Un año lleno de capítulos para ${club}`,`La historia sigue después del último silbato`],
  opinión:[`La exigencia también se mide por la constancia`,`El desafío será sostener lo conseguido`,`No todos los números cuentan toda la historia`]
 };
 const options=catalogue[outlet?.style]||catalogue.cobertura;
 return options[hash([state?.seed,a.year,topic].join(':'))%options.length];
}
