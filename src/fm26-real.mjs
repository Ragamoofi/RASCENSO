/* FM26 PRIVADO · datos sólo en memoria local, nunca incluidos en el repositorio ni en el guardado.
 * Un club queda activo ÚNICAMENTE con FM UID, verificación de país/género y evidencia.
 * Se guardan IDs + cambios de trayectoria, no 180.739 fichas estáticas. */
const baseClubs=new Map(),approved=new Map(),byId=new Map();
export const POS_FM={GK:'POR',DC:'DFC',DL:'LI',DR:'LD',DM:'MCD',MC:'MC',ML:'MI',MR:'MD',AMC:'MCO',AML:'EI',AMR:'ED',STC:'DC',WBL:'LI',WBR:'LD'};
const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
const hash=v=>{let h=2166136261;for(const c of String(v)){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0};
const rand=k=>{let a=hash(k);return()=>{a=(a+0x6d2b79f5)|0;let t=Math.imul(a^(a>>>15),1|a);t^=t+Math.imul(t^(t>>>7),61|t);return ((t^(t>>>14))>>>0)/4294967296}};
const curve=[[0,40],[20,44],[40,50],[60,57],[80,64],[100,70],[120,77],[140,84],[160,90],[180,96],[200,99]];
export function fm26OVR(x){if(x==null||x==='')return null;const n=Number(x);if(!Number.isFinite(n)||n<0)return null;for(let i=1;i<curve.length;i++)if(n<=curve[i][0]){const [lo,lb]=curve[i-1],[hi,hb]=curve[i];return clamp(Math.round(lb+(n-lo)*(hb-lb)/(hi-lo)),40,99)}return 99}
export function fm26Position(positions){for(const p of (Array.isArray(positions)?positions:[]))if(POS_FM[p])return POS_FM[p];return null}
export function fm26Attributes(stats={}){const a=k=>clamp(Number(stats[k])||10,1,20);
 const scale=n=>clamp(Math.round(30+n*3.4),36,98);
 return {pace:scale((a('aceleracion')+a('velocidad'))/2),shot:scale((a('remate')+a('tecnica'))/2),
  pass:scale((a('pase')+a('vision')+a('primer_toque'))/3),dribble:scale((a('regate')+a('tecnica')+a('primer_toque'))/3),
  defense:scale((a('marcaje')+a('entrada')+a('colocacion'))/3),physical:scale((a('fuerza')+a('resistencia')+a('salto'))/3)};
}
export function convertFM26(fm,clubId,year=2026){
 const pos=fm26Position(fm?.posiciones),age=Number(fm?.edad);
 if(!/^fm26:\d+$/.test(String(fm?.id))||!pos||!Number.isInteger(age)||age<15||age>60||!clubId)throw Error('Jugador FM26 sin ID, edad o posición válida');
 const ovr=fm26OVR(fm.ca_fm)??60,pot=Math.max(ovr,fm26OVR(fm.pa_fm)??ovr);
 return {id:fm.id,name:String(fm.nombre||'').trim(),pos,age,ovr,pot,clubId,kind:'real',origin:'fm26',
  teamSlot:Number(fm.equipo_slot)||0,attributes:fm26Attributes(fm.stats),status:'active',apps:0,goals:0,assists:0,
  titles:0,awards:[],peak:ovr,seasons:[],joined:year,cc:null,fmNationId:fm.nacion_fm??null,
  loan:fm.cedido?{parentFM:String(fm.club_origen_cesion_uid||'')}:null};
}
/* La aprobación sólo acepta una evidencia EXTERNA real, no una etiqueta del paquete. */
export function verifyFM26Mapping(mapping,expectedClubId=null){
 return !!(mapping&&((mapping.status==='verified'&&mapping.genderVerified===true&&mapping.countryVerified===true)||
  (mapping.status==='local-matched'&&mapping.localOnly===true&&['pilot-id-country','unique-name-country'].includes(mapping.matchMethod)))&&
  (mapping.status==='local-matched'||(typeof mapping.evidence==='string'&&mapping.evidence.trim().length>=12))&&
  /^\d+$/.test(String(mapping.fmUID))&& /^\d+$/.test(String(mapping.fmCountryId))&&
  String(mapping.isoCountry||'')===String(mapping.clubId||'').slice(0,2).toUpperCase()&&
  (!expectedClubId||mapping.clubId===expectedClubId)&&/^[a-z]{2}-\d+$/.test(String(mapping.clubId)));
}
export function clearFM26Memory(){baseClubs.clear();approved.clear();byId.clear()}
export function registerFM26Club(mapping,clubData,{year=2026}={}){
 if(!verifyFM26Mapping(mapping))throw Error('Club FM26 sin mapeo verificado de país y género');
 if(String(clubData?.club_uid)!==String(mapping.fmUID))throw Error('FM UID distinto: NO asignar un club homónimo');
 if(String(clubData?.pais_id_fm)!==String(mapping.fmCountryId))throw Error('País FM distinto: equivalencia descartada');
 if(clubData?.genero==='FEMENINO')throw Error('Club femenino excluido del modo actual');
 const candidates=(clubData?.jugadores||[]).filter(p=>Number(p.equipo_slot)===0);
 const players=[],seen=new Set();
 for(const fm of candidates){try{const p=convertFM26(fm,mapping.clubId,year);if(seen.has(p.id))continue;seen.add(p.id);
   const owned=byId.get(p.id);if(owned&&owned.clubId!==mapping.clubId)throw Error('Jugador duplicado entre dos clubes');
   players.push(p)
 }catch(e){if(String(e.message).includes('duplicado'))throw e}}
 if(players.length<11)throw Error('Cobertura menor a 11; no sustituir plantel sin datos suficientes');
 approved.set(mapping.clubId,{...mapping,coverage:players.length});
 baseClubs.set(mapping.clubId,players);
 for(const p of players)byId.set(p.id,p);
 return {clubId:mapping.clubId,fmUID:String(mapping.fmUID),players:players.length};
}
export function loadedFM26Clubs(){return [...approved.values()].map(x=>({...x}))}
export function isRealClubReady(clubId){return baseClubs.has(clubId)}
export function getRealBasePlayer(id){return byId.get(String(id))||null}
export function ownFM26Delta(state){const z=state?.fm26;return z&&typeof z==='object'&&z.changes&&typeof z.changes==='object'?z.changes:{}}
function applyDelta(base,state){
 const d=ownFM26Delta(state)[base.id]||{};
 const target=Number(state?.fm26?.year||0);
 const last=Number(d.lastYear||2025);
 const elapsed=target>last?Math.min(80,target-last):0;
 const oldAge=Number(d.age??base.age);
 const oldOvr=Number(d.ovr??base.ovr);
 const age=oldAge+elapsed;
 const ovr=clamp(oldOvr+Math.round((Math.min(27,age)-Math.min(27,oldAge))*.28)
   -Math.max(0,age-32)*.46+Math.max(0,oldAge-32)*.46,40,99);
 return {...base,...d,seasons:d.seasons||base.seasons,attributes:{...base.attributes,...(d.attributes||{})},
   clubId:d.clubId===undefined?base.clubId:d.clubId,age,ovr,
   status:d.status|| (age>=43?'retired':base.status)};
}
export function getFM26PlayerById(id,state){const p=getRealBasePlayer(id);return p?applyDelta(p,state):null}
export function getFM26Squad(clubId,state,{includeReserves=false}={}){
 // Consulta sólo snapshots previamente cargados y aplica cambio de dueño del overlay.
 if(!clubId)return [];
 return [...byId.values()].filter(p=>p.clubId===clubId||ownFM26Delta(state)[p.id]?.clubId===clubId)
  .map(p=>applyDelta(p,state)).filter(p=>p.clubId===clubId&&p.status==='active'&&(includeReserves||p.teamSlot===0))
  .sort((a,b)=>b.ovr-a.ovr||a.name.localeCompare(b.name));
}
export function getFM26LoadedPlayers(state){return [...byId.values()].map(p=>applyDelta(p,state))}
export function getFM26BestCompetitor(clubId,pos,state){
 const exact=getFM26Squad(clubId,state).filter(p=>p.pos===pos);
 return exact[0]||null;
}
export function transferFM26(state,id,toClub,year){
 const p=getFM26PlayerById(id,state);
 if(!p||p.status!=='active')throw Error('Jugador inexistente o retirado');
 if(toClub!==null&&!baseClubs.has(toClub))throw Error('Destino no cargado/verificado; transferencia bloqueada');
 const previous=ownFM26Delta(state)[id]||{};
 const change={...previous,clubId:toClub,joined:year,lastYear:previous.lastYear??year-1,transferHistory:[...(previous.transferHistory||[]),{year,from:p.clubId,to:toClub}].slice(-20)};
 return {...state,fm26:{...(state.fm26||{}),schema:1,changes:{...ownFM26Delta(state),[id]:change}}};
}
export function advanceFM26Season(state,year){
 if(year<2026)return state;
 const changes={...ownFM26Delta(state)},events=[];
 const context=new Set([state.clubId,state.fanClubId].filter(Boolean));
 let tracked=0;
 for(const base of byId.values()){
  // Solo una burbuja pequeña mantiene un historial detallado. Los demás envejecen
  // automáticamente al consultarlos, sin serializar centenares de miles de fichas.
  const wasTracked=changes[base.id]!=null;
  if(!wasTracked&&!context.has(base.clubId)&&tracked>=220)continue;
  if(!wasTracked)tracked++;
  const prior=applyDelta(base,{fm26:{changes}});
  if(prior.status!=='active')continue;
  let p={...prior},fromYear=Number(changes[p.id]?.lastYear??2025);
  // Permite cargar un plantel nuevo años después y ponerlo al día sin reiniciarlo.
  for(let y=Math.max(2026,fromYear+1);y<=year;y++){
   const r=rand(p.id+':year:'+y);const age=p.age;const injured=r()<.09;
   const availability=injured?.4:1;const games=Math.round((9+r()*21)*availability);
   if(injured&&p.clubId)events.push({year:y,kind:'injury',title:p.name+' se lesiona',text:'Baja médica aproximada de '+Math.round(4+r()*10)+' semanas.',playerId:p.id,clubId:p.clubId});
   const goalRate={DC:.45,EI:.29,ED:.29,MCO:.19,MC:.07,MI:.09,MD:.09,POR:0,DFC:.018,LI:.03,LD:.03,MCD:.03}[p.pos]||.05;
   const goals=Math.round(games*goalRate*(.5+r())*p.ovr/75);
   const assists=Math.round(games*(p.pos==='POR'?.005:.1)*(r()+.4));
   const delta=age<=23?(r()<.65?1:0):age>=33?-(r()<.75?1:0):(r()<.14?1:0);
   p={...p,apps:p.apps+games,goals:p.goals+goals,assists:p.assists+assists,age:age+1,
    ovr:clamp(p.ovr+delta,40,99),lastInjury:injured?{year:y,weeks:4+Math.round(r()*10)}:null};
   p.peak=Math.max(p.peak,p.ovr);
   p.seasons=[...p.seasons,{year:y,clubId:p.clubId,apps:games,goals,assists,ovr:p.ovr,injured}].slice(-8);
   if(p.age>=40||(p.age>=35&&r()<Math.min(.95,(p.age-34)*.13))){
    p.status='retired';p.retired=y;events.push({year:y,kind:'retire',title:p.name+' anuncia su retiro',text:'Finaliza su carrera a los '+p.age+' años.',playerId:p.id,clubId:p.clubId});break;
   }
   // Mercado pequeño, sólo entre clubes aprobados; nunca mueve a otro universo.
   if(r()<.055&&p.age<33){const others=[...baseClubs.keys()].filter(x=>x!==p.clubId);
    if(others.length){const to=others[Math.floor(r()*others.length)];p.transferHistory=[...(p.transferHistory||[]),{year:y,from:p.clubId,to}].slice(-20);p.clubId=to;
      events.push({year:y,kind:'transfer',title:p.name+' ficha por otro club',text:'Traspaso de '+p.transferHistory.at(-1).from+' a '+to,playerId:p.id,clubId:to});}}
  }
  // Guardar solo evolución y movimientos, NO duplicar nombre, atributos y demás ficha estática.
  const {id,name,pos,attributes,kind,origin,teamSlot,cc,fmNationId,...evolved}=p;
  changes[p.id]={...changes[p.id],...evolved,lastYear:year};
 }
 return {...state,fm26:{schema:1,year,changes},fm26Events:events.slice(-20)};
}
