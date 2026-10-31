import test from 'node:test';
import assert from 'node:assert/strict';
import { newCareer, acceptDraft, draftChoices, rerollDraft, academyOffers, signAcademy, autoResolveEvent, advanceSeason, eventInfo, resolveEvent, finishEvent, simulateToRetirement, migrateCareer, ORIGINS, PERSONALITIES, STYLES, DREAMS } from '../src/engine.mjs';
import { ENVIRONMENTS, PUBLIC_IMAGES, RISK_PROFILES, DEVELOPMENT_PATHS } from '../src/career08.mjs';
import { STRENGTH_OPTIONS, WEAKNESS_OPTIONS } from '../src/archetypes17.mjs';
import { DRAFT_REFERENTS } from '../src/draft09.mjs';
import { CHOICES, DNA_TAGS, tagOf, dnaFromPicks, dnaFx, dnaCeilBonus, choiceFx, creatorCeilings, startAttrDelta, startBoost, dreamProgress, DREAM_GOALS, PRESETS, randomFields, draftConsequences } from '../src/identity30.mjs';
import { developSeason, KEY_ATTRS } from '../src/career20.mjs';
import { creatorView, draftView, dnaCard, STEPS } from '../src/creator30.mjs';
import { playerStats } from '../src/plays30.mjs';

const finish=(s,pick=0)=>{while(s.phase==='draft')s=acceptDraft(s,pick);return s;};
const base={name:'Identidad',country:'CL',position:'MC',age:17};

test('3.1 · cada opción del creador existe en las listas del juego y tiene su ficha de efectos',()=>{
 const lists={origin:ORIGINS,environment:ENVIRONMENTS,developmentPath:DEVELOPMENT_PATHS,personality:PERSONALITIES,style:STYLES,strength:STRENGTH_OPTIONS,weakness:WEAKNESS_OPTIONS,dream:DREAMS,publicImage:PUBLIC_IMAGES,riskProfile:RISK_PROFILES};
 for(const [cat,list] of Object.entries(lists)){
  for(const o of list){const c=CHOICES[cat]?.[o.id];assert.ok(c,`${cat}:${o.id} sin ficha`);assert.ok(c.icon&&c.chips.length>=1,`${cat}:${o.id}`);}
  for(const id of Object.keys(CHOICES[cat]))assert.ok(list.some(o=>o.id===id),`ficha huérfana ${cat}:${id}`);
 }
 for(const id of Object.keys(DREAM_GOALS))assert.ok(DREAMS.some(d=>d.id===id));
});

test('3.1 · los 78 referentes pertenecen a una familia de juego y todas tienen representantes',()=>{
 const counts={};for(const r of DRAFT_REFERENTS){const t=tagOf(r.name);assert.ok(DNA_TAGS[t],r.name);counts[t]=(counts[t]||0)+1;}
 for(const t of Object.keys(DNA_TAGS).filter(x=>x!=='mosaico'))assert.ok(counts[t]>=7,`${t}: ${counts[t]}`);
 assert.equal(tagOf('Lionel Messi'),'regateador');assert.equal(tagOf('Manuel Neuer'),'guardian');assert.equal(tagOf('Erling Haaland'),'finalizador');assert.equal(tagOf('Paolo Maldini'),'muro');
});

test('3.1 · las cartas del draft ofrecen referentes con sentido y variedad de familia',()=>{
 let low=0,total=0,varied=0,rounds=0;
 for(let i=0;i<60;i++){let s=newCareer({...base,seed:'cards'+i});
  for(let r=0;r<8&&s.phase==='draft';r++){const c=draftChoices(s);assert.equal(c.length,3);
   for(const x of c){assert.ok(DNA_TAGS[x.tag]&&x.radar?.length===6&&x.junior<=x.ceiling,'el juvenil nunca supera su techo');total++;if(!['skills','weak'].includes(x.key)&&x.value<45)low++;}
   rounds++;if(new Set(c.map(x=>x.tag)).size>=2)varied++;s=acceptDraft(s,r%3);}}
 assert.ok(low/total<.12,`demasiadas cartas con una cifra irrelevante: ${low}/${total}`);
 assert.ok(varied/rounds>.85,'las cartas de una ronda rara vez comparten familia');
});

test('3.1 · el ADN depende de las influencias: dominante, mosaico, secundario y encaje con el puesto',()=>{
 const pick=(names,tier='figura')=>names.map(n=>({legend:n,tier}));
 const d=dnaFromPicks(pick(['Lionel Messi','Ronaldinho','Neymar','Marta','Pedri','Xavi Hernández','Manuel Neuer','Rodri']),'EI');
 assert.equal(d.primary,'regateador');assert.equal(d.fit,'natural');
 const mos=dnaFromPicks(pick(['Lionel Messi','Manuel Neuer','Erling Haaland','Paolo Maldini','Kylian Mbappé','Federico Valverde','Kevin De Bruyne','Pedri']),'DC');
 assert.equal(mos.primary,'mosaico');
 const odd=dnaFromPicks(pick(['Erling Haaland','Harry Kane','Robert Lewandowski','Didier Drogba','Pelé']),'DFC');
 assert.equal(odd.primary,'finalizador');assert.equal(odd.fit,'atipico');
 const natural=dnaFx({primary:'finalizador',secondary:null,fit:'natural'}),atypical=dnaFx({primary:'finalizador',secondary:null,fit:'atipico'});
 assert.ok(natural.goals>atypical.goals&&atypical.goals>1,'un ADN atípico rinde menos que uno natural');
 assert.ok(dnaFx({primary:'velocista',fit:'natural'}).paceDecline>1&&dnaFx({primary:'velocista',fit:'natural'}).injury>1,'el velocista paga un precio');
 assert.ok(dnaCeilBonus({primary:'muro',secondary:null,fit:'natural'}).defense>=3);
});

test('3.1 · completar el draft guarda el ADN y eleva los techos coherentemente',()=>{
 let s=finish(newCareer({...base,position:'DC',seed:'dna31'}));
 assert.ok(s.dna&&DNA_TAGS[s.dna.primary]&&s.dna.tally);
 for(const k of KEY_ATTRS)assert.ok(s.attrCeil[k]>=s.attributes[k]+2,k);
 assert.equal(s.ovr,Math.round(s.ovr));assert.ok(s.potential>s.ovr);
 const again=finish(newCareer({...base,position:'DC',seed:'dna31'}));
 assert.deepEqual(again.dna,s.dna);assert.deepEqual(again.attrCeil,s.attrCeil);
 const migrated=migrateCareer({...s,version:9});assert.deepEqual(migrated.dna,s.dna);
});

test('3.1 · el origen, el entorno y los sueños fijan el punto de partida (y el club amateur por fin hace algo)',()=>{
 const b=o=>newCareer({...base,seed:'start',...o});
 assert.equal(b({origin:'cantera'}).coachTrust,60);assert.equal(b({origin:'barrio'}).morale,75);assert.equal(b({origin:'academia'}).reputation,4);
 assert.ok(b({environment:'familia_futbolera'}).relationships.family.trust>b({environment:'sin_contactos'}).relationships.family.trust);
 const amateur=choiceFx({origin:'amateur'}),barrio=choiceFx({origin:'barrio'});
 assert.ok(amateur.growthRegular>1&&barrio.growthLow>1&&amateur.growthLow===1);
 assert.ok(choiceFx({dream:'seleccion'}).callup>0&&choiceFx({dream:'europa'}).market>1&&choiceFx({style:'intenso'}).minutes>0);
 assert.deepEqual(startAttrDelta({age:19,startAge:19}),Object.fromEntries(KEY_ATTRS.map(k=>[k,startBoost(19)])));
 assert.equal(startBoost(16),0);assert.ok(startBoost(19)>startBoost(18));
 const mixed=creatorCeilings({...base,strength:'definicion',weakness:'fisico',environment:'campesino'});
 assert.equal(mixed.shot,2);assert.equal(mixed.physical,1);// campesino +2, debilidad físico −1
});

test('3.1 · la senda de desarrollo cambia qué atributos crecen',()=>{
 const s=finish(newCareer({...base,position:'MC',seed:'dev31',age:17}));
 const grow=(path)=>{const st={...s,developmentPath:path},cf=choiceFx(st);let tot={};for(let y=0;y<6;y++){const r=developSeason({...st,age:17+y,seed:'x'+y},{share:.8,rating:6.9,injuryWeeks:0,coachFx:{growthYoung:1,focusBonus:{}},threadFx:{growth:1,decline:1},careerFx:cf,focus:{}});for(const k of KEY_ATTRS)tot[k]=(tot[k]||0)+(r.changes[k]||0);}return tot;};
 const tec=grow('tecnica'),fis=grow('fisica');
 assert.ok(tec.pass+tec.dribble>fis.pass+fis.dribble,'la técnica favorece pase y regate');
 assert.ok(fis.pace+fis.physical>tec.pace+tec.physical,'lo físico favorece ritmo y físico');
 assert.ok(choiceFx({developmentPath:'recuperacion'}).declineYears>0&&choiceFx({developmentPath:'tardio'}).declineYears>choiceFx({developmentPath:'recuperacion'}).declineYears);
});

test('3.1 · las elecciones llegan al simulador de jugadas (serenidad, amague, entrada, reflejos)',()=>{
 const s=finish(newCareer({...base,position:'DC',seed:'plays31'}));
 const play={pressure:90,fatigue:.2};
 const calm=playerStats({...s,personality:'sereno',environment:'familia_futbolera',developmentPath:'mental'},play),nerv=playerStats({...s,personality:'rebelde',weakness:'presion'},play);
 assert.ok(calm.nerves<nerv.nerves,'el carácter sereno tiembla menos');
 const dribbler=playerStats({...s,dna:{primary:'regateador',fit:'natural'},style:'regateador'},play),plain=playerStats({...s,dna:null,style:'equilibrado'},play);
 assert.ok(dribbler.feint>plain.feint);
 assert.ok(playerStats({...s,dna:{primary:'guardian',fit:'natural'}},play).reflex>playerStats({...s,dna:null},play).reflex);
 assert.ok(playerStats({...s,dna:{primary:'muro',fit:'natural'}},play).tackleReach>playerStats({...s,dna:null},play).tackleReach);
});

test('3.1 · la meta del sueño avanza con la carrera, se cumple una sola vez y premia',()=>{
 let s=autoResolveEvent(signAcademy(finish(newCareer({...base,position:'DC',seed:'dream31',dream:'capitan'})),academyOffers(finish(newCareer({...base,position:'DC',seed:'dream31',dream:'capitan'}))) [0].id));
 for(let i=0;i<2;i++){s=advanceSeason(s);while(s.phase==='event')s=autoResolveEvent(s);if(s.phase==='transfer')s=s.offers[0]?{...s,phase:'season',market:null,offers:[]}:s;}
 const mark=s.history.map(h=>({...h,captain:true}));
 s={...s,history:mark.slice(0,2),squad:{...s.squad,captain:true}};
 const before=dreamProgress(s);assert.equal(before.id,'capitan');assert.equal(before.done,false);assert.equal(before.current,2);
 const rep=s.reputation,next=advanceSeason({...s,phase:'season'});
 assert.equal(dreamProgress(next).done,true);assert.ok(next.dreamDone&&next.dreamDone.id==='capitan');
 assert.ok(next.awards.some(a=>a.id==='dream'));assert.ok(next.reputation>=rep+4);
 assert.equal(next.pendingEvent,'w_dream');
 const e=eventInfo(next);assert.equal(e.options.length,3);
 const after=finishEvent(resolveEvent(next,1));assert.ok(['season','event','transfer'].includes(after.phase));
 // no se reclama dos veces
 let again={...after,phase:'season'};const second=advanceSeason(again);assert.equal(second.dreamDone.year,next.dreamDone.year);assert.equal(second.awards.filter(a=>a.id==='dream').length,1);
 assert.ok(dreamProgress(newCareer({...base,dream:'goleador',position:'POR',seed:'g'})).unit.includes('vallas'));
});

test('3.1 · el borrador del creador se dibuja completo en cada paso y con cualquier posición',()=>{
 const draft={name:'Pruebas',country:'AR',age:'18',position:'DC',number:'10',foot:'Izquierda',city:'La Boca',story:'Pateaba contra la pared.',origin:'barrio',personality:'sereno',style:'regateador',dream:'europa',fanClubId:'',mode:'Purista',environment:'migrante',publicImage:'mediatico',riskProfile:'aventurero',developmentPath:'mixta',roleClass:'cazagoles',strength:'tecnica',weakness:'presion'};
 for(const pos of ['POR','DFC','LI','MCD','MC','MI','MCO','EI','DC']){
  for(let step=0;step<STEPS.length;step++){const {content,aside}=creatorView({...draft,position:pos,roleClass:''},step);
   assert.ok(content.length>800&&aside.includes('EFECTOS REALES'),`${pos} paso ${step}`);
   assert.ok(!/undefined|NaN|\[object/.test(content+aside),`${pos} paso ${step} contiene basura`);}
 }
 assert.equal(draftConsequences(draft,{}).length,13);
 // El dorsal y el nombre se muestran escapados.
 assert.ok(!creatorView({...draft,name:'<img src=x onerror=1>'},0).content.includes('<img src=x'));
 let s=newCareer({...base,seed:'view31'});const html=draftView(s,draftChoices(s));
 assert.ok(html.includes('lg-card')&&html.includes('ADN EN CONSTRUCCIÓN')&&html.includes('data-portrait-name'));
 s=finish(s);assert.ok(dnaCard(s).includes('TU ADN HEREDADO'));
 assert.ok(draftView({...newCareer({...base,mode:'Purista',seed:'pur'})},draftChoices(newCareer({...base,mode:'Purista',seed:'pur'}))).includes('Perfil oculto'));
});

test('3.1 · perfiles sugeridos y aleatorios son válidos y deterministas',()=>{
 for(const p of PRESETS){const s=newCareer({...base,seed:p.id,...p.fields});for(const [k,v] of Object.entries(p.fields))assert.equal(s[k],v,`${p.id}.${k}`);}
 assert.deepEqual(randomFields('x'),randomFields('x'));assert.notDeepEqual(randomFields('x'),randomFields('y'));
 for(let i=0;i<40;i++){const f=randomFields('v'+i);const s=newCareer({...base,seed:'r'+i,...f});for(const [k,v] of Object.entries(f))assert.equal(s[k],v);}
});

test('3.1 · equilibrio: con ADN y elecciones sigue siendo difícil ser superestrella',()=>{
 const peaks=[];
 for(let i=0;i<30;i++){let s=finish(newCareer({name:'Eq',country:['CL','AR','BR','MX'][i%4],position:['DC','MC','DFC','POR','EI','MCD'][i%6],seed:'eq31-'+i,age:16+i%4,...randomFields('eq'+i)}),i%3);
  s=simulateToRetirement(signAcademy(s,academyOffers(s)[i%3].id));peaks.push(Math.max(...s.history.map(h=>h.ovrAfter)));}
 const n85=peaks.filter(p=>p>=85).length,n90=peaks.filter(p=>p>=90).length;
 assert.ok(n85<=8,`≥85: ${n85}/30 (${peaks})`);assert.ok(n90<=3,`≥90: ${n90}/30`);
 assert.ok(peaks.filter(p=>p<72).length>=4,'también existen carreras modestas');
});
