/* RASCENSO 1.4 · torneos por grupos, llaves y clasificación persistente.
   Reglas propias simplificadas, no calendario ni cupos oficiales de FIFA/CONMEBOL/UEFA.
   Sin red, sin estado global y con semilla reproducible. */
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const key=x=>String(x??'');
export function seededRng(seed){let a=2166136261;for(const c of key(seed)){a^=c.charCodeAt(0);a=Math.imul(a,16777619);}return ()=>{a=(a+0x6D2B79F5)|0;let t=Math.imul(a^(a>>>15),1|a);t^=t+Math.imul(t^(t>>>7),61|t);return ((t^(t>>>14))>>>0)/4294967296;};}
const reorder=(items,r)=>{const c=items.slice();for(let i=c.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[c[i],c[j]]=[c[j],c[i]];}return c;};
function score(a,b,r){
  const diff=clamp(((a.level||65)-(b.level||65))/28,-1.4,1.4);
  const goals=mean=>{let n=0;for(let i=0;i<6;i++)if(r()<clamp(mean/6,.09,.65))n++;return n;};
  return [goals(1.55+diff*.55),goals(1.22-diff*.55)];
}
function tableRow(team){return {id:team.id,name:team.name,pj:0,w:0,d:0,l:0,gf:0,ga:0,gd:0,pts:0,level:team.level};}
function record(table,a,b,ga,gb){for(const [team,scored,conceded] of [[a,ga,gb],[b,gb,ga]]){
  const x=table.get(team.id);x.pj++;x.gf+=scored;x.ga+=conceded;x.gd=x.gf-x.ga;
  if(scored>conceded){x.w++;x.pts+=3;}else if(scored===conceded){x.d++;x.pts++;}else x.l++;
}}
const orderTable=(a,b)=>b.pts-a.pts||b.gd-a.gd||b.gf-a.gf||b.level-a.level||a.id.localeCompare(b.id);
const months={club:['Feb','Mar','Abr','May','Jun','Ago','Sep','Oct','Nov'],international:['Ene','Mar','Jun','Jul','Sep','Oct','Nov'],world:['Jun','Jul'],qualifiers:['Mar','Jun','Sep','Oct','Nov']};
function dateSlot(kind,round){const slots=months[kind]||months.club;return `${slots[(round-1)%slots.length]} · Fecha ${round}`;}
/** Las acciones individuales deben ajustarse al puesto: un portero no suma goles de campo aleatorios. */
export function cupContributionRates(position){
 const role=String(position||'DC');
 if(role==='POR')return {goals:0,assists:.015};
 if(['DFC','LI','LD','MCD'].includes(role))return {goals:.045,assists:.10};
 if(['MC','MI','MD'].includes(role))return {goals:.12,assists:.25};
 if(role==='MCO')return {goals:.19,assists:.31};
 if(['EI','ED'].includes(role))return {goals:.25,assists:.23};
 return {goals:.34,assists:.15};
}
function performance(fix,playerTeamId,st,r,stat){
  const involved=fix.home===playerTeamId||fix.away===playerTeamId;
  fix.playerPlayed=!!(involved&&r()<clamp(((st?.coachTrust??65)+15)/100,.32,.98));
  fix.playerMinutes=fix.playerPlayed?65+Math.floor(r()*26):0;
  fix.playerGoals=0;fix.playerAssists=0;
  if(fix.playerPlayed){stat.played++;stat.minutes+=fix.playerMinutes;
    const ownGoals=fix.home===playerTeamId?Number(fix.score.split('-')[0]):Number(fix.score.split('-')[1]);
    const rates=cupContributionRates(st?.position);
    for(let i=0;i<ownGoals;i++){if(r()<(rates.goals===0?0:clamp(rates.goals+((st?.ovr??70)-65)*.003,0,.42)))fix.playerGoals++;else if(r()<rates.assists)fix.playerAssists++;}
    stat.goals+=fix.playerGoals;stat.assists+=fix.playerAssists;
  }
}
function fixturesOfGroup(group,groupIndex,r,playerTeamId,st,stat,calendar,roundRef,perfSeed){
  const table=new Map(group.map(x=>[x.id,tableRow(x)]));const games=[];
  // Round robin: todos los integrantes se enfrentan una vez; 3 jornadas en grupos de cuatro.
  for(let home=0;home<group.length;home++)for(let away=home+1;away<group.length;away++){
    const x=group[home],y=group[away],side=r()<.5?[x,y]:[y,x],g=score(...side,r);
    const matchday=1+(home+away-1)%(group.length-1||1);
    const f={stage:`Grupo ${String.fromCharCode(65+groupIndex)}`,phase:'group',group:String.fromCharCode(65+groupIndex),matchday,round:roundRef++,date:dateSlot(calendar,matchday),home:side[0].id,away:side[1].id,homeName:side[0].name,awayName:side[1].name,score:`${g[0]}-${g[1]}`,winner:g[0]===g[1]?null:g[0]>g[1]?side[0].id:side[1].id,penalties:false};
    record(table,side[0],side[1],...g);performance(f,playerTeamId,st,seededRng(`${perfSeed}:group:${f.home}:${f.away}`),stat);games.push(f);
  }
  games.sort((a,b)=>a.matchday-b.matchday||a.home.localeCompare(b.home));
  const ranked=[...table.values()].sort(orderTable);
  return {table:ranked,games};
}
function pairingRound(live,r,stage,legs,playerTeamId,st,stat,calendar,roundRef,perfSeed){
  const fixtures=[],next=[];
  for(let i=0;i<live.length;i+=2){
    const a=live[i],b=live[i+1];if(!b){next.push(a);continue;}
    let aggregateA=0,aggregateB=0;
    const legCount=stage==='Final'?1:legs;
    for(let leg=1;leg<=legCount;leg++){
      const home=leg===1?a:b,away=leg===1?b:a;
      const [gh,ga]=score(home,away,r);
      if(leg===1){aggregateA+=gh;aggregateB+=ga;}else{aggregateA+=ga;aggregateB+=gh;}
      const f={stage,phase:'knockout',leg:legCount===1?null:leg,round:roundRef++,date:dateSlot(calendar,roundRef),home:home.id,away:away.id,homeName:home.name,awayName:away.name,score:`${gh}-${ga}`,penalties:false,winner:null};
      performance(f,playerTeamId,st,seededRng(`${perfSeed}:${stage}:${leg}:${f.home}:${f.away}`),stat);fixtures.push(f);
    }
    let winner=aggregateA>aggregateB?a:aggregateB>aggregateA?b:(r()<.5?a:b);
    const last=fixtures.at(-1);last.winner=winner.id;last.aggregate=`${aggregateA}-${aggregateB}`;last.penalties=aggregateA===aggregateB;
    next.push(winner);
  }
  return {fixtures,next,roundRef};
}
export function playGroupTournament({id,name,year,teams,playerTeamId,seed,kind='continental',legs=2,state=null}){
  const unique=[...new Map((teams||[]).filter(x=>x?.id).map(t=>[t.id,t])).values()];
  if(unique.length<4)return null;
  const count=Math.min(32,2**Math.floor(Math.log2(unique.length)));
  // Ninguna selección/club entra por la fuerza: solo participa si está clasificado en el conjunto recibido.
  const chosen=unique.slice(0,count),r=seededRng(`${seed}:${id}:${year}:v14`);
  const groupsCount=count/4,groupSize=4,groups=Array.from({length:groupsCount},()=>[]);
  const ordered=reorder(chosen.sort((a,b)=>b.level-a.level||a.id.localeCompare(b.id)),r);
  // Cabezas de serie repartidas para evitar todos los favoritos en el mismo grupo.
  for(let i=0;i<ordered.length;i++)groups[i%groupsCount].push(ordered[i]);
  const stat={played:0,minutes:0,goals:0,assists:0};let fixtures=[],round=1;
  const groupTables=groups.map((g,ix)=>{
    const result=fixturesOfGroup(g,ix,r,playerTeamId,state,stat,kind==='world-cup'?'world':'club',round,`${seed}:${id}:${year}`);
    round+=result.games.length;fixtures.push(...result.games);
    return {name:String.fromCharCode(65+ix),standings:result.table};
  });
  // Los campeones enfrentan subcampeones de otro grupo; fixture deterministic.
  let advancing=groupTables.map(g=>g.standings[0]).map(x=>chosen.find(t=>t.id===x.id));
  const second=groupTables.map(g=>g.standings[1]).map(x=>chosen.find(t=>t.id===x.id));
  advancing=advancing.flatMap((a,i)=>[a,second[(i+1)%second.length]]);
  if(advancing.length===2&&advancing[0]?.id===advancing[1]?.id)advancing=[chosen[0],chosen[1]];
  while(advancing.length>1){
    const stage=advancing.length>16?'Dieciseisavos':advancing.length>8?'Octavos':advancing.length>4?'Cuartos':advancing.length>2?'Semifinal':'Final';
    const result=pairingRound(advancing,r,stage,legs,playerTeamId,state,stat,kind==='world-cup'?'world':'club',round,`${seed}:${id}:${year}`);
    fixtures.push(...result.fixtures);advancing=result.next;round=result.roundRef;
  }
  const winner=advancing[0],playerFixtures=fixtures.filter(f=>f.home===playerTeamId||f.away===playerTeamId),member=chosen.some(t=>t.id===playerTeamId);
  const ownGroup=groupTables.find(g=>g.standings.some(s=>s.id===playerTeamId));
  const advanced=ownGroup?.standings.slice(0,2).some(x=>x.id===playerTeamId);
  const last=playerFixtures.filter(f=>f.phase==='knockout').at(-1);
  const outcome=!member?'No clasificado':winner.id===playerTeamId?'Campeón':!advanced?'Fase de grupos':last?.stage||'Fase de grupos';
  return {id,name,year,kind,champion:winner.id,championName:winner.name,playerTeamId,outcome,participated:member,
    played:stat.played,minutes:stat.minutes,goals:stat.goals,assists:stat.assists,fixtures,playerFixtures,
    championWon:member&&winner.id===playerTeamId,groupTables,group:ownGroup?.name||null,
    format:`${groupsCount} grupos de cuatro · clasificación de dos por grupo · eliminatorias ${legs===2?'ida y vuelta, final única':'a partido único'}`};
}
/* Clasificatorias propias: ranking calculado por partidos, estable entre temporadas.
   El año de la fase final tiene la clasificación del año anterior, nunca un sorteo nuevo. */
export function playQualification({id,name,year,teams,playerTeamId,seed,quota,state=null}){
 const unique=[...new Map(teams.map(x=>[x.id,x])).values()];
 const r=seededRng(`${seed}:world-qualification:${id}:${year}`), table=new Map(unique.map(t=>[t.id,tableRow(t)]));
 const fixtures=[],stat={played:0,minutes:0,goals:0,assists:0};let nr=1;
 for(let i=0;i<unique.length;i++)for(let j=i+1;j<unique.length;j++){
  const home=unique[i],away=unique[j],[a,b]=score(home,away,r);
  record(table,home,away,a,b);
  const f={stage:'Eliminatorias',phase:'qualification',round:nr++,date:dateSlot('qualifiers',nr),home:home.id,away:away.id,homeName:home.name,awayName:away.name,score:`${a}-${b}`,winner:a>b?home.id:b>a?away.id:null,penalties:false};
  performance(f,playerTeamId,state,seededRng(`${seed}:perf:${id}:${year}:${f.home}:${f.away}`),stat);fixtures.push(f);
 }
 const standings=[...table.values()].sort(orderTable),qualified=standings.slice(0,quota).map(x=>x.id);
 const place=standings.findIndex(x=>x.id===playerTeamId)+1;
 return {id,name,year,kind:'qualifiers',groupTables:[{name:'Clasificatorias',standings}],champion:null,championName:null,playerTeamId,
  qualified,qualifiedPlayer:qualified.includes(playerTeamId),outcome:place?`${place}° · ${qualified.includes(playerTeamId)?'clasificó':'eliminado'}`:'No participó',
  participated:place>0,played:stat.played,minutes:stat.minutes,goals:stat.goals,assists:stat.assists,
  fixtures,playerFixtures:fixtures.filter(f=>f.home===playerTeamId||f.away===playerTeamId),championWon:false,
  format:`Liga clasificatoria simplificada · ${Math.min(quota,unique.length)} cupos`};
}
