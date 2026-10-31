/* RASCENSO 2.0 · Mundo vivo.
 * El mundo evoluciona aunque el jugador no intervenga:
 *  - los clubes suben y bajan de nivel según resultados, inversiones y crisis;
 *  - cada club tiene un entrenador con personalidad; los despidos dependen de los resultados;
 *  - estrellas y promesas de tu generación progresan, cambian de club, ganan premios y se retiran;
 *  - cada temporada deja noticias, campeones, premios individuales y récords.
 * Todos los nombres de futbolistas y entrenadores generados son FICTICIOS.
 */
import { COUNTRIES } from './countries.mjs';
import { VERIFIED_LEAGUES, getInauguralLeague } from './leagues2026.mjs';
import { clubPrestige, livePrestige, CLUBS, marketClub, simLevel } from './market.mjs';
import { rng, hash, clamp, yearOf, COACH_STYLES, POSITION_NAMES, positionGroup } from './career20.mjs';

/* ---------- Nombres ficticios por región ---------- */
const POOLS={
 es:[['Mateo','Santiago','Thiago','Benjamín','Joaquín','Lucas','Martín','Diego','Gonzalo','Nicolás','Ignacio','Facundo','Emiliano','Bruno','Tomás','Julián','Agustín','Felipe','Cristian','Sebastián','Álvaro','Pablo','Hugo','Adrián','Iker','Javier','Rodrigo','Marcos','Franco','Valentín','Esteban','Andrés','Luis','Jorge','Iván','Raúl','Gabriel','Matías','Vicente','Renato'],
  ['González','Rodríguez','Fernández','López','Martínez','Pérez','Gómez','Díaz','Sánchez','Romero','Sosa','Torres','Álvarez','Ruiz','Ramírez','Flores','Acosta','Benítez','Medina','Herrera','Aguirre','Castro','Vargas','Rojas','Molina','Ortiz','Núñez','Cabrera','Ríos','Morales','Navarro','Peña','Vega','Campos','Fuentes','Carrasco','Valdés','Muñoz','Soto','Paredes','Ibarra','Correa','Villalba','Godoy','Arancibia','Cordero','Salazar','Quiroga']],
 pt:[['João','Pedro','Gabriel','Lucas','Matheus','Rafael','Gustavo','Felipe','Vinícius','Thiago','Bruno','Diogo','Rodrigo','André','Caio','Igor','Danilo','Renan','Éder','Leandro','Wesley','Kauã','Rúben','Tiago'],
  ['Silva','Santos','Oliveira','Souza','Costa','Pereira','Almeida','Ferreira','Rodrigues','Carvalho','Gomes','Martins','Araújo','Ribeiro','Barbosa','Nascimento','Moreira','Cardoso','Teixeira','Lopes','Fonseca','Pinto','Neves','Rocha']],
 en:[['Jack','Harry','Oliver','George','Charlie','James','Mason','Callum','Ryan','Liam','Connor','Kieran','Jordan','Ethan','Lewis','Jamie','Tyler','Noah','Aaron','Reece','Owen','Declan','Finley','Josh'],
  ['Smith','Walker','Taylor','Brown','Wilson','Davies','Evans','Thomas','Johnson','Roberts','Wright','Robinson','Hughes','Clarke','Mitchell','Turner','Hall','Barnes','Cooper','Ward','Kelly','Murray','Campbell','Stewart','Fletcher','Doyle']],
 it:[['Lorenzo','Matteo','Alessandro','Federico','Davide','Nicolò','Andrea','Riccardo','Simone','Gianluca','Marco','Tommaso','Pietro','Edoardo','Samuele'],
  ['Rossi','Bianchi','Romano','Colombo','Ricci','Marino','Greco','Bruno','Gallo','Conti','De Luca','Esposito','Barbieri','Moretti','Fontana','Rinaldi','Ferri','Mancini']],
 fr:[['Lucas','Hugo','Théo','Mathis','Enzo','Nathan','Maxime','Antoine','Kylian','Rayan','Yanis','Bastien','Clément','Ousmane','Moussa','Florian','Adrien'],
  ['Martin','Bernard','Dubois','Durand','Lefebvre','Moreau','Laurent','Simon','Michel','Garcia','David','Bertrand','Roux','Fournier','Diallo','Traoré','Koné','Camara','Mendy','Girard']],
 de:[['Lukas','Leon','Jonas','Finn','Niklas','Felix','Tim','Jan','Florian','Maximilian','Julian','Kai','Moritz','Paul','Luca','Timo'],
  ['Müller','Schmidt','Schneider','Fischer','Weber','Meyer','Wagner','Becker','Hoffmann','Schulz','Koch','Richter','Wolf','Krüger','Neumann','Brandt','Vogel','Huber']],
 nl:[['Daan','Sem','Milan','Jesse','Thijs','Luuk','Bram','Ruben','Stijn','Joris','Teun','Jens'],['de Jong','Jansen','de Vries','van Dijk','Bakker','Visser','Smit','Meijer','Mulder','de Boer','Bos','Vos','Dekker','Kuipers']],
 jp:[['Haruto','Ren','Kaito','Sota','Yuto','Riku','Takumi','Daichi','Kenta','Shun'],['Sato','Suzuki','Takahashi','Tanaka','Watanabe','Ito','Yamamoto','Nakamura','Kobayashi','Kato','Endo','Mori']],
 kr:[['Min-jun','Seo-jun','Do-yun','Ji-ho','Hyun-woo','Jun-seo','Woo-jin','Sung-min'],['Kim','Lee','Park','Choi','Jung','Kang','Cho','Yoon','Han','Lim']],
 ar:[['Mohammed','Abdullah','Fahad','Salem','Yasser','Khalid','Omar','Ali','Faisal','Nasser','Youssef','Hamza','Karim','Amine','Ayoub'],['Al-Dawsari','Al-Shahrani','Al-Faraj','Al-Malki','Al-Harbi','Al-Qahtani','Al-Otaibi','Al-Ghamdi','Benali','El Amrani','Haddad','Mansour','Saïdi','Bouzid']],
 tr:[['Emre','Burak','Mert','Arda','Kerem','Cenk','Oğuz','Hakan','Yusuf','Kaan'],['Yılmaz','Kaya','Demir','Şahin','Çelik','Yıldız','Aydın','Öztürk','Arslan','Doğan']],
 af:[['Moussa','Ibrahim','Samuel','Victor','Emmanuel','Kwame','Sadio','Yaya','Joseph','Wilfried','Chidi','Kofi','Ismaïla','Lamine'],['Diallo','Mensah','Okafor','Koné','Traoré','Boateng','Osei','Ndiaye','Eze','Touré','Sarr','Adeyemi','Mbeki','Ouattara']],
 sl:[['Luka','Ivan','Marko','Nikola','Filip','Petar','Mateo','Josip','Jakub','Tomasz','Kacper','Oleksandr','Mykola','Andriy'],['Horvat','Kovačić','Babić','Novak','Jovanović','Petrović','Nowak','Kowalski','Wiśniewski','Shevchenko','Kovalenko','Bondarenko','Marić','Vuković']],
 nord:[['Erik','Lars','Magnus','Oskar','Anders','Mikkel','Emil','Rasmus','Jonas','Viktor'],['Hansen','Johansen','Nielsen','Larsen','Andersson','Lindqvist','Berg','Dahl','Eriksen','Holm']],
 gr:[['Giorgos','Dimitris','Nikos','Kostas','Giannis','Christos'],['Papadopoulos','Georgiou','Nikolaidis','Pappas','Vlachos','Antoniou']],
 cn:[['Wei','Hao','Jun','Lei','Yang','Chen','Bo'],['Wang','Li','Zhang','Liu','Chen','Zhao','Wu','Zhou']],
 ir:[['Ali','Reza','Mehdi','Sardar','Amir','Saeed'],['Rezaei','Hosseini','Karimi','Moradi','Ahmadi','Jafari']]
};
const COUNTRY_POOL={AR:'es',BO:'es',CL:'es',CO:'es',EC:'es',PY:'es',PE:'es',UY:'es',VE:'es',MX:'es',CR:'es',ES:'es',US:'en',EN:'en',SC:'en',AU:'en',NZ:'en',BR:'pt',PT:'pt',IT:'it',FR:'fr',BE:'fr',CH:'de',DE:'de',AT:'de',NL:'nl',JP:'jp',KR:'kr',SA:'ar',QA:'ar',MA:'ar',EG:'ar',DZ:'ar',TN:'ar',TR:'tr',SN:'af',NG:'af',GH:'af',CM:'af',HR:'sl',RS:'sl',CZ:'sl',PL:'sl',UA:'sl',SE:'nord',NO:'nord',DK:'nord',GR:'gr',CN:'cn',IR:'ir'};
export function personName(seed,cc){const pool=POOLS[COUNTRY_POOL[cc]||'es'];const r=rng(seed+':name');return `${pool[0][Math.floor(r()*pool[0].length)]} ${pool[1][Math.floor(r()*pool[1].length)]}`;}
export function namerFor(cc){return seed=>personName(seed,cc);}

/* ---------- Clubes y ligas ---------- */
// Mismo catálogo activo que el mercado: un único origen de clubes.
const ALL_CLUBS=CLUBS;
export const worldClub=marketClub;
const VERIFIED_COUNTRIES=new Set(VERIFIED_LEAGUES.map(l=>l.countryCode));
/** Clubes que pueden fichar: país sin liga verificada o club inscrito en una liga verificada. */
export const ELIGIBLE_CLUBS=ALL_CLUBS.filter(c=>!VERIFIED_COUNTRIES.has(c.countryCode)||getInauguralLeague(c.id));
/** Grupos de competición de todo el planeta. Las ligas verificadas usan su nómina (con ascensos de la partida). */
export function worldLeagueGroups(state){
 const rosters=state?.leagueRosters||{};
 const groups=VERIFIED_LEAGUES.map(l=>({id:l.id,name:l.name,countryCode:l.countryCode,tier:l.tier,teamIds:rosters[l.id]||l.teamIds}));
 for(const c of COUNTRIES){
  if(VERIFIED_COUNTRIES.has(c.code))continue;
  const active=c.clubs.filter(x=>!x.inactive).sort((a,b)=>b.level-a.level||a.id.localeCompare(b.id)).slice(0,16);
  if(active.length>=4)groups.push({id:`REF-${c.code}`,name:`Circuito de referencia · ${c.name}`,countryCode:c.code,tier:null,teamIds:active.map(x=>x.id)});
 }
 return groups;
}
export function levelDelta(state,id){return Math.round(state?.world?.clubs?.[id]?.d||0);}
export function dynamicLevel(state,club){if(!club)return 60;return clamp((simLevel(club)||60)+levelDelta(state,club.id),40,92);}
export function dynamicPrestige(state,club){return club?livePrestige(state,club):0;}

/* ---------- Entrenadores ---------- */
const STYLE_IDS=Object.keys(COACH_STYLES);
export function coachFor(state,clubId){
 const club=worldClub(clubId);if(!club)return null;
 const entry=state?.world?.clubs?.[clubId]||{};
 const gen=entry.cg||0;
 const seed=`${state?.world?.seed||state?.seed||'rascenso'}:coach:${clubId}:${gen}`;
 const r=rng(seed);
 // Muchos entrenadores dirigen fuera de su país: 25 % extranjeros.
 const pools=Object.keys(COUNTRY_POOL);const cc=r()<.25?pools[Math.floor(r()*pools.length)]:club.countryCode;
 const style=STYLE_IDS[Math.floor(r()*STYLE_IDS.length)];
 return {id:`${clubId}:${gen}`,clubId,name:personName(seed,cc),nationality:cc,style,styleName:COACH_STYLES[style].name,age:38+Math.floor(r()*26),since:entry.cs||null,rep:clamp(Math.round(clubPrestige(club)+(r()-.5)*14),40,99)};
}

/* ---------- Futbolistas del mundo ---------- */
const POS_LIST=['POR','DFC','DFC','LI','LD','MCD','MC','MC','MCO','EI','ED','DC','DC'];
const STAR_CLUBS=()=>ALL_CLUBS.filter(c=>clubPrestige(c)>=84);
function pickClubNear(state,target,r,{exclude=null,minPrestige=0}={}){
 // Una sola pasada: prestigio calculado una vez por club; mismo orden y mismas tiradas que el filtrado clásico.
 const pool=[],scored=[];let total=0;
 for(const c of ELIGIBLE_CLUBS){if(c.id===exclude)continue;const p=livePrestige(state,c);if(p<minPrestige)continue;pool.push(c);const w=Math.exp(-Math.pow((p-target)/5,2));if(w>.002){scored.push([c,w]);total+=w;}}
 if(!total)return pool[Math.floor(r()*pool.length)];
 let roll=r()*total;for(const [c,w] of scored)if((roll-=w)<=0)return c;return scored.at(-1)[0];
}
function makeNPC(state,seed,{age,ovr,pot,kind,cc,pos,clubId}){
 const r=rng(seed);
 const nat=cc||(()=>{const codes=COUNTRIES.map(c=>c.code);const big=['BR','AR','FR','ES','EN','DE','PT','IT','NL','BE','UY','CO','HR','SN','NG','MA','JP','US','MX','CL'];return r()<.75?big[Math.floor(r()*big.length)]:codes[Math.floor(r()*codes.length)];})();
 const position=pos||POS_LIST[Math.floor(r()*POS_LIST.length)];
 return {id:'p'+hash(seed).toString(36),name:personName(seed,nat),cc:nat,pos:position,age,ovr,pot:Math.max(ovr,pot),clubId,kind,status:'active',
  apps:0,goals:0,assists:0,titles:0,awards:[],peak:ovr,seasons:[],joined:yearOf(state)};
}
export function initWorld(state){
 const seed=`${state.seed}:world20`;const r=rng(seed);
 const year=yearOf(state);
 const world={v:1,seed,year:year-1,clubs:{},players:[],news:[],awards:[],champions:{}};
 const S={...state,world};
 const stars=STAR_CLUBS();
 // 28 estrellas establecidas.
 for(let i=0;i<28;i++){
  const ovr=Math.round(80+Math.pow(r(),1.6)*12),age=21+Math.floor(r()*12);
  const club=pickClubNear(S,Math.min(97,ovr+3),r,{minPrestige:80})||stars[i%stars.length];
  world.players.push(makeNPC(state,`${seed}:star:${i}`,{age,ovr,pot:ovr+Math.max(0,Math.round((27-age)*.8)),kind:'star',clubId:club.id}));
 }
 // Tu generación: 16 promesas de edad similar, en clubes de todo el mundo.
 for(let i=0;i<16;i++){
  const pot=Math.round(70+Math.pow(r(),1.7)*24),age=clamp(state.age+Math.floor(r()*3)-1,15,20);
  const ovr=clamp(Math.round(50+r()*12+(pot-75)*.18),46,70);
  const cc=i<3?state.country:null;
  const club=pickClubNear(S,58+ovr*.25+r()*12,r)||ALL_CLUBS[i];
  world.players.push(makeNPC(state,`${seed}:gen:${i}`,{age,ovr,pot,kind:'gen',cc:cc||undefined,clubId:club.id}));
 }
 // Rival generacional: misma zona del campo, mismo año y techo parecido al tuyo.
 const g=positionGroup(state.position);
 const rivalPos={attack:['DC','EI','ED'],middle:['MC','MCO','MI','MD'],defense:['DFC','LI','LD','MCD'],goalkeeper:['POR']}[g];
 const rival=makeNPC(state,`${seed}:nemesis`,{age:state.age,ovr:clamp((state.ovr||60)+Math.round((r()-.4)*4),46,72),pot:clamp((state.potential||76)+Math.round((r()-.3)*6),70,95),kind:'gen',cc:r()<.6?state.country:undefined,pos:rivalPos[Math.floor(r()*rivalPos.length)],clubId:null});
 rival.rival=true;
 const rivalClub=pickClubNear(S,clubPrestige(worldClub(state.clubId))+3,r,{exclude:state.clubId});rival.clubId=rivalClub?.id||ALL_CLUBS[3].id;
 world.players.push(rival);
 return world;
}
export function ensureWorld(state){return state.world?.v?state:{...state,world:initWorld(state)};}
export function worldRival(state){return state.world?.players?.find(p=>p.rival)||null;}

/* ---------- Simulación rápida de las ligas del mundo ---------- */
function poisson(mean,r){let n=0,p=Math.exp(-mean),prod=1;do{n++;prod*=r();}while(prod>p&&n<=9);return n-1;}
function quickTable(state,group,r){
 const teams=group.teamIds.map(id=>worldClub(id)).filter(Boolean);
 const rows=Object.fromEntries(teams.map(t=>[t.id,{id:t.id,name:t.name,level:dynamicLevel(state,t),played:0,points:0,for:0,against:0}]));
 for(const a of teams)for(const b of teams){if(a.id===b.id)continue;const tilt=(rows[a.id].level-rows[b.id].level)/22;const gh=poisson(clamp(1.62+tilt*.42,.18,3.6),r),ga=poisson(clamp(1.12-tilt*.42,.18,3.6),r);const H=rows[a.id],A=rows[b.id];H.played++;A.played++;H.for+=gh;H.against+=ga;A.for+=ga;A.against+=gh;if(gh>ga)H.points+=3;else if(gh<ga)A.points+=3;else{H.points++;A.points++;}}
 return Object.values(rows).sort((x,y)=>y.points-x.points||(y.for-y.against)-(x.for-x.against)||y.for-x.for).map((t,i)=>({...t,position:i+1}));
}

/* ---------- Avance anual del mundo ---------- */
const NEWS_LIMIT=90;
export function pushNews(world,item){return {...world,news:[...(world?.news||[]),item].slice(-NEWS_LIMIT)};}
function news(list,year,kind,title,text,extra={}){list.push({year,kind,title,text,...extra});}
const KIND_ICON={champion:'🏆',promotion:'▲',relegation:'▼',coach:'♟',transfer:'⇄',retire:'☾',injury:'✚',award:'★',crisis:'⚠',investment:'€',prospect:'✦',record:'◆',you:'●',rival:'⚔'};
export const newsIcon=k=>KIND_ICON[k]||'◎';

/** Revelación basada en una temporada efectivamente disputada, una vez por futbolista. */
export function isBreakoutSeason(player,previousOvr,apps){return !player.breakoutYear&&player.age<=23&&apps>=18&&player.ovr-previousOvr>=3;}
/** Lesiones reproducibles e independientes de otras tiradas de la temporada. */
export function npcInjury(seed,age){
 const r=rng(seed),risk=clamp(.08+Math.max(0,age-29)*.009,.08,.20);
 const weeks=r()<risk?2+Math.floor(r()*13):0;
 return {weeks,availability:clamp(1-weeks/45,.5,1)};
}
/** Avanza el mundo un año usando la tabla real de tu liga (playedLeague) cuando existe. */
export function advanceWorld(state,playedLeague,userSeason){
 const base=ensureWorld(state).world;
 const year=yearOf(state);
 if(base.year>=year)return base;
 const {rankings:_old,...rest}=base;const world={...rest,clubs:{...base.clubs},players:base.players.map(p=>({...p})),news:[...base.news],awards:[...base.awards],champions:{...base.champions}};
 const S={...state,world};
 const r=rng(`${world.seed}:year:${year}`);
 const fresh=[];
 const groups=worldLeagueGroups(state);
 const userClubs=new Set([state.clubId,state.fanClubId].filter(Boolean));
 const userCountry=worldClub(state.clubId)?.countryCode;
 const notable=c=>clubPrestige(c)>=80||userClubs.has(c.id)||c.countryCode===userCountry;
 const champions={};
 const tables={};
 for(const g of groups){
  const played=playedLeague&&(playedLeague.leagueId?playedLeague.leagueId===g.id:g.id===`REF-${playedLeague.countryCode}`);
  const table=played?playedLeague.standings.map(t=>({...t,level:dynamicLevel(S,worldClub(t.id))})):quickTable(S,g,r);
  tables[g.id]=table;
  const n=table.length;if(!n)continue;
  champions[g.id]=table[0].id;
  const expectedRank=new Map([...table].sort((a,b)=>b.level-a.level).map((x,i)=>[x.id,i+1]));
  for(const row of table){
   const club=worldClub(row.id);if(!club)continue;
   const exp=expectedRank.get(row.id);
   const entry={...(world.clubs[row.id]||{})};
   const d=(entry.d||0)*.82+(exp-row.position)/n*2.6+(r()-.5)*.6;
   entry.d=Math.round(clamp(d,-9,9)*10)/10;
   entry.hist=[...(entry.hist||[]),[year,row.position,n]].slice(-8);
   // Despidos de entrenador: malos resultados frente a lo esperado o simple desgaste.
   const under=(row.position-exp)/n;
   // Un técnico en el podio no se despide al azar; el resto puede caer por resultados o desgaste.
   const sack=under>.3&&r()<.6||row.position>=n-1&&r()<.45||r()<.06&&row.position>3;
   if(sack){
    const old=coachFor(S,row.id);entry.cg=(entry.cg||0)+1;entry.cs=year+1;
    world.clubs[row.id]=entry;
    const coach=coachFor(S,row.id);
    if(notable(club))news(fresh,year,'coach',`${club.name} cambia de entrenador`,`${old.name} deja el cargo tras terminar ${row.position}° de ${n}. Llega ${coach.name} (${coach.styleName.toLowerCase()}).`,{clubId:row.id,mine:userClubs.has(row.id)});
   }
   world.clubs[row.id]=entry;
  }
  const champ=worldClub(table[0].id);
  if(champ&&(g.tier===1||g.id.startsWith('REF-')&&clubPrestige(champ)>=74||g.countryCode===userCountry))news(fresh,year,'champion',`${champ.name}, campeón`,`${champ.name} conquistó ${g.name} con ${table[0].points} puntos${table[1]?`, por delante de ${table[1].name}`:''}.`,{clubId:champ.id,mine:userClubs.has(champ.id),weight:clubPrestige(champ)});
 }
 world.champions[year]=champions;
 const championIds=new Set(Object.values(champions));
 for(const y of Object.keys(world.champions))if(Number(y)<year-9)delete world.champions[y];
 // Ascensos y descensos del país donde juegas (los calcula el motor de ligas).
 // Inversiones y crisis: el fútbol también se decide fuera de la cancha.
 for(const club of ALL_CLUBS){
  if(r()>.022)continue;
  const entry={...(world.clubs[club.id]||{})};
  const invest=r()<.55;const amount=2.5+r()*3;
  entry.d=Math.round(clamp((entry.d||0)+(invest?amount:-amount),-9,9)*10)/10;
  entry.ev=[...(entry.ev||[]),[year,invest?'investment':'crisis']].slice(-6);
  world.clubs[club.id]=entry;
  if(notable(club))news(fresh,year,invest?'investment':'crisis',invest?`Nueva inversión en ${club.name}`:`Crisis económica en ${club.name}`,invest?`Un grupo inversor asume el control y promete reforzar la plantilla de ${club.name}.`:`${club.name} atrasa pagos y deberá vender o reducir salarios. La plantilla se debilita.`,{clubId:club.id,mine:userClubs.has(club.id)});
 }
 // Futbolistas: progreso, temporada, traspasos y retiros.
 const posGoals={DC:.55,EI:.38,ED:.38,MCO:.3,MC:.14,MI:.18,MD:.18,MCD:.06,DFC:.05,LI:.05,LD:.05,POR:0};
 const posAssists={DC:.16,EI:.3,ED:.3,MCO:.34,MC:.22,MI:.25,MD:.25,MCD:.1,DFC:.04,LI:.16,LD:.16,POR:.005};
 for(const p of world.players){
  if(p.status!=='active')continue;
  const pr=rng(`${world.seed}:npc:${p.id}:${year}`);
  const club=worldClub(p.clubId);const level=dynamicLevel(S,club);
  const share=clamp(.35+(p.ovr-level)*.05+pr()*.25,.05,.97);
  const injury=npcInjury(`${world.seed}:npc-injury:${p.id}:${year}`,p.age);
  const participation=share*injury.availability;
  const apps=Math.round(34*participation);
  p.lastInjury=injury.weeks?{year,weeks:injury.weeks}:null;
  if(injury.weeks>=8&&(p.rival||p.kind==='star'||p.clubId===state.clubId))news(fresh,year,'injury',`${p.name} sufre una lesión`,`${p.name} se pierde aproximadamente ${injury.weeks} semanas en ${club?.name||'su club'}. Su participación de esta temporada se reduce.`,{playerId:p.id,clubId:p.clubId,rival:!!p.rival,mine:p.clubId===state.clubId});
  const factor=clamp(1+(p.ovr-level)*.03,.6,1.6)*(p.ovr/80);
  const goals=Math.round(apps*posGoals[p.pos]*factor*(.75+pr()*.5));
  const assists=Math.round(apps*posAssists[p.pos]*factor*(.75+pr()*.5));
  const champion=championIds.has(p.clubId)&&apps>=10;
  p.apps+=apps;p.goals+=goals;p.assists+=assists;if(champion)p.titles++;
  p.seasons=[...(p.seasons||[]),{year,clubId:p.clubId,apps,goals,assists,ovr:p.ovr,champion,injuryWeeks:injury.weeks}].slice(-4);
  // Desarrollo
  const ageF=p.age<=19?.3:p.age<=22?.22:p.age<=25?.12:p.age<=28?.04:0;
  let delta=(p.pot-p.ovr)*ageF*(.45+participation*.8)+(pr()-.5)*2;
  const dAge=29+Math.floor(hash(p.id)%4)+(p.pos==='POR'?3:0);
  if(p.age>=dAge)delta-=(.6+(p.age-dAge)*.7)*(.6+pr()*.8);
  // Algunas promesas se estancan: el talento no garantiza nada.
  if(p.age<=21&&participation<.25&&pr()<.35)p.pot=Math.max(p.ovr,p.pot-2);
  const beforeOvr=p.ovr;p.ovr=clamp(Math.round(p.ovr+delta),40,95);p.peak=Math.max(p.peak||0,p.ovr);
  if(isBreakoutSeason(p,beforeOvr,apps)){
   p.breakoutYear=year;
   if(p.rival||p.kind==='gen'||p.clubId===state.clubId)news(fresh,year,'prospect',`${p.name} da un salto en ${club?.name||'su club'}`,`${apps} partidos de liga y una evolución de ${beforeOvr} a ${p.ovr} de media. La promesa empieza a hacerse un lugar.`,{playerId:p.id,clubId:p.clubId,rival:!!p.rival,mine:p.clubId===state.clubId});
  }
  p.age++;
  // Retiro
  const retireP=p.age>=40?1:p.age>=34?clamp((p.age-33)*.16+(p.ovr<72?.2:0),0,.95):0;
  if(pr()<retireP){p.status='retired';p.retired=year;
   if(p.kind==='star'||p.rival||p.peak>=84)news(fresh,year,'retire',`${p.name} anuncia su retiro`,`A los ${p.age} años se despide ${p.name} (${POSITION_NAMES[p.pos]}). Cierra su carrera con ${p.goals} goles en ${p.apps} partidos registrados y ${p.titles} títulos de liga.`,{playerId:p.id,rival:!!p.rival});
   continue;}
  // Traspasos: los que superan a su club se van; los que caen, bajan de escalón.
  const prestige=dynamicPrestige(S,club);
  const wantsUp=p.ovr>prestige+3&&p.age<=31&&pr()<.5;
  const goesDown=p.ovr<prestige-9&&pr()<.55;
  if(wantsUp||goesDown){
   const dest=pickClubNear(S,clamp(p.ovr+(wantsUp?1:-2),45,97),pr,{exclude:p.clubId});
   if(dest&&dest.id!==p.clubId){const from=club?.name||'su club';p.clubId=dest.id;
    if(p.kind==='star'||p.rival||p.ovr>=82||dest.id===state.clubId||userClubs.has(dest.id))news(fresh,year,'transfer',`${p.name} ficha por ${dest.name}`,`${from} acepta la salida de ${p.name} (${p.age} años, media ${p.ovr}). ${wantsUp?'Un salto de categoría para su carrera.':'Busca continuidad en un proyecto menor.'}`,{playerId:p.id,clubId:dest.id,rival:!!p.rival,mine:dest.id===state.clubId});
   }
  }
 }
 // Nuevas promesas irrumpen cada año.
 for(let i=0;i<3;i++){
  const pot=Math.round(76+Math.pow(r(),1.4)*19),age=17+Math.floor(r()*2);
  const club=pickClubNear(S,62+r()*20,r);if(!club)continue;
  const p=makeNPC(state,`${world.seed}:prospect:${year}:${i}`,{age,ovr:clamp(Math.round(56+r()*10+(pot-80)*.2),50,72),pot,kind:'prospect',clubId:club.id});
  world.players.push(p);
  if(i===0)news(fresh,year,'prospect',`Un juvenil se incorpora a ${club.name}`,`${p.name}, ${age} años, ${POSITION_NAMES[p.pos].toLowerCase()}, inicia su carrera en ${club.name}.`,{playerId:p.id,clubId:club.id});
 }
 // La élite se renueva: si faltan figuras de primer nivel, irrumpen futbolistas consagrados en otras ligas.
 const elite=world.players.filter(p=>p.status==='active'&&p.ovr>=84).length;
 for(let i=0;i<Math.max(0,24-elite)&&i<6;i++){
  const ovr=Math.round(83+Math.pow(r(),1.8)*8),age=21+Math.floor(r()*6);
  const club=pickClubNear(S,Math.min(97,ovr+4),r,{minPrestige:82});if(!club)continue;
  world.players.push(makeNPC(state,`${world.seed}:emerging:${year}:${i}`,{age,ovr,pot:ovr+Math.max(0,Math.round((26-age)*.9)),kind:'star',clubId:club.id}));
 }
 // Mantener la lista manejable: se conservan rival, estrellas activas y retirados recientes.
 const kept=world.players.filter(p=>p.status==='active'||p.rival||year-(p.retired||year)<=4);
 let drop=Math.max(0,kept.length-120);
 world.players=kept.filter(p=>{if(p.rival||drop<=0)return true;drop--;return false;});
 // Premios individuales.
 const awardsYear=worldAwards(S,world,year,userSeason,tables);
 world.awards=[...world.awards,awardsYear].slice(-30);
 for(const a of awardsYear.list){if(a.winner?.you)news(fresh,year,'award',`${state.name} gana: ${a.name}`,a.text,{mine:true,weight:200});else if(a.global)news(fresh,year,'award',`${a.winner.name}: ${a.name}`,a.text,{playerId:a.winner.id});}
 world.year=year;
 // Variedad: como máximo cinco campeones (los más relevantes) y el resto de historias del año.
 const relevance=(a,b)=>(b.mine?1:0)-(a.mine?1:0)||(b.weight||0)-(a.weight||0);
 const champs=fresh.filter(x=>x.kind==='champion').sort(relevance).slice(0,5);
 const others=fresh.filter(x=>x.kind!=='champion').sort(relevance).slice(0,13);
 world.news=[...world.news,...champs,...others].slice(-NEWS_LIMIT);
 return world;
}

/* ---------- Premios individuales ---------- */
export const AWARD_NAMES={ball:'Balón de Ascenso',promise:'Trofeo Promesa',scorer:'Bota de la liga',mvp:'Mejor jugador de la liga',young:'Revelación de la liga',glove:'Guante de la liga'};
function userScore(state,season){
 if(!season)return 0;
 const rating=season.rating||6.3;
 const titles=(season.titles||[]).length;
 const club=worldClub(season.clubId);
 return (state.ovr||60)*1.6+(rating-6.6)*5+Math.min(3,titles)*1.4+Math.min(40,(season.goals||0)+(season.assists||0))/8+(clubPrestige(club)-84)/5+(season.international?1:0);
}
export function worldAwards(S,world,year,season,tables){
 const list=[];const players=world.players.filter(p=>p.status==='active'||p.retired===year);
 const last=p=>p.seasons?.at(-1)?.year===year?p.seasons.at(-1):null;
 const npcScore=p=>{const s=last(p);if(!s)return 0;const nr=rng(`${world.seed}:npcform:${p.id}:${year}`)();return p.ovr*1.6+(nr-.5)*4+Math.min(40,s.goals+s.assists)/8+(s.champion?1.4:0)+(clubPrestige(worldClub(p.clubId))-84)/5;};
 // Balón de Ascenso: el mejor del planeta.
 const candidates=players.filter(p=>p.ovr>=76&&last(p)).map(p=>({id:p.id,name:p.name,clubId:p.clubId,cc:p.cc,score:npcScore(p),ovr:p.ovr,goals:last(p).goals}));
 const youScore=userScore(S,season);
 if(season&&(S.ovr||0)>=80)candidates.push({id:'you',you:true,name:S.name,clubId:season.clubId,cc:S.country,score:youScore,ovr:S.ovr,goals:season.goals});
 candidates.sort((a,b)=>b.score-a.score);
 const ranking=candidates.slice(0,10).map((c,i)=>({id:c.id,you:c.you||undefined,name:c.name,clubId:c.clubId,cc:c.cc,ovr:c.ovr,place:i+1}));
 if(ranking[0]){const w=ranking[0];list.push({id:'ball',name:AWARD_NAMES.ball,global:true,winner:w,text:`${w.name} (${worldClub(w.clubId)?.name||'—'}) es elegido el mejor futbolista del mundo en ${year}.`});}
 const youPlace=ranking.find(x=>x.you)?.place||null;
 // Trofeo Promesa: mejor sub-21.
 const youngs=players.filter(p=>p.age-1<=21&&last(p)).map(p=>({id:p.id,name:p.name,clubId:p.clubId,score:p.ovr+p.pot*.12+(last(p).goals+last(p).assists)/6+last(p).apps/12}));
 if(season&&S.age<=21)youngs.push({id:'you',you:true,name:S.name,clubId:season.clubId,score:(S.ovr||60)+(S.potential||70)*.12+((season.goals||0)+(season.assists||0))/6+(season.matches||0)/12+((season.rating||6.4)-6.5)*3});
 youngs.sort((a,b)=>b.score-a.score);
 if(youngs[0])list.push({id:'promise',name:AWARD_NAMES.promise,global:true,winner:youngs[0],text:`${youngs[0].name} gana el ${AWARD_NAMES.promise} al mejor sub-21 del año.`});
 // Premios de tu liga.
 if(season&&season.leagueId!==undefined){
  const table=season.table||[];const games=Math.max(1,(table.length-1)*2);
  const r=rng(`${world.seed}:league-awards:${year}`);
  const fakeName=k=>personName(`${world.seed}:${k}:${year}`,worldClub(table[Math.floor(r()*Math.min(5,table.length))]?.id)?.countryCode||S.country);
  const topClub=()=>table[Math.floor(r()*Math.min(5,table.length))]||table[0];
  const leagueNPC=players.filter(p=>table.some(t=>t.id===p.clubId)&&last(p));
  // Máximo goleador: rival real del mundo o goleador generado.
  const npcTop=leagueNPC.map(p=>({name:p.name,clubId:p.clubId,goals:last(p).goals,id:p.id})).sort((a,b)=>b.goals-a.goals)[0];
  const typical=Math.round(games*(.42+r()*.2));
  const competitor=npcTop&&npcTop.goals>=typical-3?npcTop:{name:fakeName('scorer'),clubId:topClub()?.id,goals:typical};
  if(['DC','EI','ED','MCO','MC','MI','MD'].includes(S.position)||season.goals>=competitor.goals){
   const you=(season.goals||0)>competitor.goals||((season.goals||0)===competitor.goals&&(season.goals||0)>0&&r()<.5);
   list.push({id:'scorer',name:AWARD_NAMES.scorer,league:season.leagueName,winner:you?{you:true,name:S.name,clubId:season.clubId,goals:season.goals}:competitor,text:you?`${S.name} termina como máximo goleador de ${season.leagueName} con ${season.goals} goles.`:`${competitor.name} (${worldClub(competitor.clubId)?.name||''}) fue el máximo goleador con ${competitor.goals} goles. Tú marcaste ${season.goals||0}.`,yourValue:season.goals||0,winnerValue:you?season.goals:competitor.goals});
  }
  // Mejor jugador de la liga: nota media, rendimiento y posición del equipo.
  const rating=season.rating||0;const threshold=7.42+(r()-.5)*.2-(season.leaguePosition<=2?.08:0);
  const mvpYou=season.matches>=games*.55&&rating>=threshold&&r()<.8;
  const mvp=mvpYou?{you:true,name:S.name,clubId:season.clubId}:(leagueNPC.sort((a,b)=>b.ovr-a.ovr)[0]||{name:fakeName('mvp'),clubId:table[0]?.id});
  list.push({id:'mvp',name:AWARD_NAMES.mvp,league:season.leagueName,winner:mvp,text:mvpYou?`Tu nota media de ${rating.toFixed(2)} te convierte en el mejor jugador de ${season.leagueName}.`:`${mvp.name} (${worldClub(mvp.clubId)?.name||''}) fue elegido mejor jugador del torneo.`});
  if(S.age<=21){const yYou=season.matches>=games*.45&&rating>=7.1;list.push({id:'young',name:AWARD_NAMES.young,league:season.leagueName,winner:yYou?{you:true,name:S.name,clubId:season.clubId}:{name:fakeName('young'),clubId:topClub()?.id},text:yYou?`Eres la revelación de ${season.leagueName}.`:'Otro juvenil se llevó el premio a la revelación del torneo.'});}
  if(S.position==='POR'){const gYou=(season.cleanSheets||0)>=Math.round(games*.36);list.push({id:'glove',name:AWARD_NAMES.glove,league:season.leagueName,winner:gYou?{you:true,name:S.name,clubId:season.clubId}:{name:fakeName('glove'),clubId:table[0]?.id},text:gYou?`${season.cleanSheets} vallas invictas: el guante del torneo es tuyo.`:'El guante del torneo quedó en manos de otro arquero.'});}
 }
 return {year,list,ranking,youPlace};
}

/* ---------- Resúmenes para la interfaz ---------- */
export function topPlayers(state,limit=12){return (state.world?.players||[]).filter(p=>p.status==='active').sort((a,b)=>b.ovr-a.ovr).slice(0,limit);}
export function generationPlayers(state){const age=state.age;return (state.world?.players||[]).filter(p=>p.status==='active'&&Math.abs(p.age-age)<=2&&(p.kind==='gen'||p.kind==='prospect'||p.rival)).sort((a,b)=>b.ovr-a.ovr).slice(0,12);}
export function powerRanking(state,limit=12){
 // Se ordenan índices y solo se copian los clubes que entran al ranking.
 const pr=ALL_CLUBS.map(c=>livePrestige(state,c)),pw=ALL_CLUBS.map(c=>dynamicLevel(state,c));
 return ALL_CLUBS.map((_,i)=>i).sort((a,b)=>pr[b]-pr[a]||pw[b]-pw[a]).slice(0,limit).map(i=>({...ALL_CLUBS[i],power:pw[i],prestige:pr[i],d:state.world?.clubs?.[ALL_CLUBS[i].id]?.d||0}));
}
export function risingClubs(state,limit=6){return ALL_CLUBS.filter(c=>Math.abs(state.world?.clubs?.[c.id]?.d||0)>=2).map(c=>({...c,d:state.world.clubs[c.id].d})).sort((a,b)=>b.d-a.d).slice(0,limit);}
export function clubTrend(state,id){const e=state.world?.clubs?.[id];if(!e)return {d:0,label:'Estable',hist:[]};const d=e.d||0;return {d,label:d>=3?'En ascenso':d>=1?'Mejorando':d<=-3?'En crisis':d<=-1?'A la baja':'Estable',hist:e.hist||[],events:e.ev||[]};}
