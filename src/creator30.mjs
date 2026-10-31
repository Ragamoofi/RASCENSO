import { dnaFromPicks } from './identity30.mjs';
/* RASCENSO 3.1 · Creador de futbolista y Legado/ADN — vistas.
 * Funciones puras que devuelven HTML. experience.mjs decide cuándo montarlas y gestiona los eventos. */
import { COUNTRIES } from './countries.mjs';
import { flag, badge } from './assets.mjs';
import { POSITIONS, ORIGINS, PERSONALITIES, STYLES, DREAMS, ATTRS, getClub, getCountry } from './engine.mjs';
import { ENVIRONMENTS, PUBLIC_IMAGES, RISK_PROFILES, DEVELOPMENT_PATHS } from './career08.mjs';
import { classesFor, STRENGTH_OPTIONS, WEAKNESS_OPTIONS } from './archetypes17.mjs';
import { POSITION_WEIGHTS, POSITION_NAMES, KEY_ATTRS } from './career20.mjs';
import { h, n } from './ui20.mjs';
import { CHOICES, DNA_TAGS, PRESETS, AGE_FX, DREAM_GOALS, DREAM_REWARD, chipsFor, iconFor, draftConsequences, classBonuses, dnaFx, dnaCeilBonus, ATTR_LABEL, KEYS, tagOf, choiceFx, startAttrDelta, creatorCeilings } from './identity30.mjs';

export const STEPS=['Identidad','Raíces','Futbolista','Mentalidad','Sueños','Resumen'];
const SHORT={pace:'RIT',shot:'TIR',pass:'PAS',dribble:'REG',defense:'DEF',physical:'FÍS'};
const name=(list,id)=>list.find(x=>x.id===id)?.name||'—';
const classOf=(position,id)=>classesFor(position).find(c=>c.id===id)||classesFor(position)[0];

/* ---------- Piezas ---------- */
const chips=(cat,id,max=3)=>`<span class="cr-chips">${chipsFor(cat,id).slice(0,max).map(([t,g])=>`<i class="${g?'up':'down'}">${h(t)}</i>`).join('')}</span>`;
function optCard(cat,field,o,draft,extra='',max=3){
 const on=String(draft[field])===String(o.id);
 return `<label class="cr-card ${on?'on':''}" title="${h(o.description||'')}"><input type="radio" name="${field}" value="${h(o.id)}" ${on?'checked':''}><span class="cr-ico">${iconFor(cat,o.id)}</span><span class="cr-body"><strong>${h(o.name)}${extra}</strong><small>${h(o.description||'')}</small>${chips(cat,o.id,max)}</span></label>`;
}
const group=(title,sub,cards,cols=4)=>`<section class="cr-group"><header><h3>${h(title)}</h3>${sub?`<small>${h(sub)}</small>`:''}</header><div class="cr-grid c${cols}">${cards}</div></section>`;
const heading=(label,title,em,intro)=>`<div class="cr-head"><span class="section-label">${h(label)}</span><h1>${h(title)} <em>${h(em)}</em></h1><p>${h(intro)}</p></div>`;

/** Selector de posición sobre una cancha: se elige jugando, no en una lista. */
const PITCH={DC:[50,13],EI:[17,19],ED:[83,19],MCO:[50,33],MI:[15,45],MC:[50,48],MD:[85,45],MCD:[50,63],LI:[13,72],DFC:[50,78],LD:[87,72],POR:[50,92]};
function pitchPicker(draft){
 return `<div class="cr-pitch" role="radiogroup" aria-label="Posición"><svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><rect x="1" y="1" width="98" height="98" rx="2"/><path d="M1 50h98"/><circle cx="50" cy="50" r="9"/><rect x="24" y="1" width="52" height="16"/><rect x="38" y="1" width="24" height="6"/><rect x="24" y="83" width="52" height="16"/><rect x="38" y="93" width="24" height="6"/></svg>${POSITIONS.map(([id,label])=>{const [x,y]=PITCH[id];const on=draft.position===id;return `<label class="pitch-dot ${on?'on':''}" style="left:${x}%;top:${y}%" title="${h(label)}"><input type="radio" name="position" value="${id}" ${on?'checked':''}><b>${id}</b><em>${h(label)}</em></label>`;}).join('')}</div>`;
}
/** Barras con la importancia de cada atributo en el puesto elegido y los bonos de la clase. */
function positionProfile(draft){
 const w=POSITION_WEIGHTS[draft.position]||POSITION_WEIGHTS.MC;const max=Math.max(...w);
 const bonus=Object.fromEntries(classBonuses(draft.position,draft.roleClass));
 return `<div class="cr-profile"><header><span>QUÉ IMPORTA EN ${h((POSITION_NAMES[draft.position]||'').toUpperCase())}</span><small>Peso de cada atributo en tu media</small></header>${KEYS.map((k,i)=>`<div class="cr-bar"><span>${h(ATTR_LABEL[k])}</span><div><i style="width:${Math.round(w[i]/max*100)}%"></i></div><b>${Math.round(w[i]*100)}%</b>${bonus[k]?`<em>+${bonus[k]}</em>`:''}</div>`).join('')}</div>`;
}
const radarPts=(vals,cx,cy,r,max=100)=>vals.map((v,i)=>{const a=-Math.PI/2+i*2*Math.PI/6,d=r*Math.max(0,Math.min(1,v/max));return [cx+Math.cos(a)*d,cy+Math.sin(a)*d];});
/** Radar hexagonal de 6 ejes. fill = valores actuales; ghost = techos; null = eje sin dato. */
export function radar(fill,{ghost=null,size=190,labels=true,dashed=false,max=100}={}){
 const cx=size/2,cy=size/2,r=size*.34;
 const ring=f=>radarPts(KEYS.map(()=>100*f),cx,cy,r).map(p=>p.join(',')).join(' ');
 const poly=(v,cls)=>v?`<polygon class="${cls}" points="${radarPts(v.map(x=>x??(max>=100?16:0)),cx,cy,r,max).map(p=>p.map(x=>x.toFixed(1)).join(',')).join(' ')}"/>`:'';
 const ax=KEYS.map((k,i)=>{const a=-Math.PI/2+i*2*Math.PI/6,[x,y]=[cx+Math.cos(a)*(r+16),cy+Math.sin(a)*(r+13)];return `<line x1="${cx}" y1="${cy}" x2="${(cx+Math.cos(a)*r).toFixed(1)}" y2="${(cy+Math.sin(a)*r).toFixed(1)}"/>${labels?`<text x="${x.toFixed(1)}" y="${y.toFixed(1)}">${SHORT[k]}</text>`:''}`;}).join('');
 return `<svg class="cr-radar ${dashed?'dashed':''}" viewBox="0 0 ${size} ${size}" role="img" aria-label="Perfil de atributos"><g class="grid"><polygon points="${ring(1)}"/><polygon points="${ring(.66)}"/><polygon points="${ring(.33)}"/>${ax}</g>${poly(ghost,'ghost')}${poly(fill,'fill')}</svg>`;
}

/* ---------- Lado derecho del creador ---------- */
const NAME_OF={origin:id=>name(ORIGINS,id),environment:id=>name(ENVIRONMENTS,id),developmentPath:id=>name(DEVELOPMENT_PATHS,id),personality:id=>name(PERSONALITIES,id),style:id=>name(STYLES,id),strength:id=>name(STRENGTH_OPTIONS,id),weakness:id=>name(WEAKNESS_OPTIONS,id),dream:id=>name(DREAMS,id),publicImage:id=>name(PUBLIC_IMAGES,id),riskProfile:id=>name(RISK_PROFILES,id),mode:id=>id==='Purista'?'Purista':'Clásico',foot:id=>id};
function aside(draft,step){
 const cls=classOf(draft.position,draft.roleClass),club=getClub(draft.fanClubId);
 const cons=draftConsequences(draft,NAME_OF);
 return `<div class="cr-poster"><div class="poster-top"><span>RASCENSO / TALENTO</span><span>2026</span></div>
  <div class="poster-kit-wrap" data-country="${h(draft.country)}"><div class="kit-halo"></div><div class="kit-country-seal"><span>${flag(draft.country)}</span><strong>${h(getCountry(draft.country)?.name||'')}</strong><small>SELECCIÓN NACIONAL</small></div><div class="kit-badge">${flag(draft.country)} ${h((getCountry(draft.country)?.name||'').toUpperCase())}</div></div>
  <div class="cr-who"><b class="cr-num">#${h(draft.number||'9')}</b><div><strong>${h(draft.name||'TU NOMBRE')}</strong><small>${flag(draft.country)} ${h(POSITION_NAMES[draft.position]||'')} · ${h(cls.name)} · ${h(draft.age)} años · ${draft.foot==='Izquierda'?'zurdo':'diestro'}</small></div></div>
  ${club?`<div class="poster-fan">${badge(club)} <span>Hincha de <b>${h(club.name)}</b></span></div>`:''}</div>
  ${step===5?projection(draft):''}
  <div class="cr-effects ${step===5?'hidden':''}"><header><span>EFECTOS REALES DE TUS ELECCIONES</span><small>${cons.length} decisiones</small></header><div class="cr-effects-list">${cons.map(c=>`<div class="cr-eff ${c.cat===STEP_FOCUS[step]?'focus':''}"><span class="cr-ico sm">${c.icon}</span><div><small>${h(c.label)}</small><strong>${h(c.name)}</strong><div class="cr-chips">${c.chips.slice(0,2).map(([t,g])=>`<i class="${g?'up':'down'}">${h(t)}</i>`).join('')}</div></div></div>`).join('')}</div></div>`;
}
const STEP_FOCUS=[null,'origin','style','personality','dream',null];
const pctTxt=v=>{const x=Math.round((v-1)*100);return x?`${x>0?'+':''}${x} %`:null;};
/** Último paso: bonos de partida y de techo del perfil + balance total de modificadores. */
function projection(d){
 const full={...d,startAge:Number(d.age)};
 const st=startAttrDelta(full),cls=Object.fromEntries(classBonuses(d.position,d.roleClass)),boost=STRENGTH_OPTIONS.find(x=>x.id===d.strength)?.boost;
 const start=KEYS.map(k=>(st[k]||0)+(cls[k]||0)+(boost===k?1:0));
 const cc=creatorCeilings(full),ceil=KEYS.map(k=>cc[k]||0);
 const f=choiceFx(full);
 const rows=[[f.goals,'goles'],[f.assists,'asistencias'],[f.injury,'lesiones',-1],[f.growth,'desarrollo']].map(([v,l,sg=1])=>{const t=pctTxt(v);return t?`<i class="${(v-1)*sg>=0?'up':'down'}">${t} ${l}</i>`:'';}).join('')
  +(f.minutes?`<i class="${f.minutes>0?'up':'down'}">${f.minutes>0?'+':''}${(f.minutes*100).toFixed(1).replace('.0','').replace('.',',')} % minutos</i>`:'')+(f.calm?`<i class="${f.calm>0?'up':'down'}">${f.calm>0?'+':''}${Math.round(f.calm*100)} % serenidad</i>`:'')+(f.market>1?`<i class="up">Mercado +${Math.round((f.market-1)*100)} %</i>`:'');
 return `<div class="cr-proj"><header><span>BONOS DE TU PERFIL</span><small>Arranque y techo</small></header><table class="cr-bonus-table"><caption>Modificadores antes del Legado</caption><thead><tr><th>Atributo</th><th>Inicio</th><th>Techo</th></tr></thead><tbody>${KEYS.map((k,i)=>`<tr><th>${h(ATTR_LABEL[k])}</th><td>${start[i]>0?'+':''}${start[i]}</td><td>${ceil[i]>0?'+':''}${ceil[i]}</td></tr>`).join('')}</tbody></table><div class="cr-chips center">${rows||'<small>Sin modificadores globales.</small>'}</div><p class="cr-proj-note">Los bonos de atributos se suman; los porcentajes se combinan multiplicativamente. Tu ADN heredado (siguiente paso) añadirá techos y rasgos propios.</p></div>`;
}
function dreamGoalPanel(d){
 const g=DREAM_GOALS[d.dream];if(!g)return '';
 const target=g.target?`${g.target} ${g.unit}`:'Depende de tu puesto (goles, goles + asistencias o vallas invictas)';
 return `<div class="cr-dream"><div class="cr-ico">★</div><div><small>TU META</small><strong>${h(g.title)}</strong><p>${h(target)}.</p></div><div class="cr-dream-rw"><small>AL CUMPLIRLA</small><div class="cr-chips"><i class="up">+${DREAM_REWARD.rep} reputación</i><i class="up">+${DREAM_REWARD.morale} moral</i><i class="up">+${DREAM_REWARD.fans} hinchada</i><i class="up">+${DREAM_REWARD.board} directiva</i><i class="up">Premio y escena especial</i></div></div></div>`;
}

/* ---------- Pasos ---------- */
function stepIdentity(d){
 const cls=classesFor(d.position),ages=[16,17,18,19];
 const sugg={POR:[1,12,13,25],DFC:[2,3,4,5,15],LI:[3,6,13],LD:[2,14,22],MCD:[5,6,8,14],MC:[8,10,16,20],MI:[11,17,21],MD:[7,16,23],MCO:[10,8,17],EI:[11,7,17,19],ED:[7,11,17,19],DC:[9,10,19,21]}[d.position]||[9,10];
 return heading('CAPÍTULO I · TU PRIMERA CAMISETA','Todo comienza','con un nombre.','Elige quién eres, dónde juegas y qué papel tienes dentro del campo. Esta posición definirá tus jugadas, tu rol y tus desafíos durante toda la carrera.')
 +`<div class="cr-split"><div class="cr-left">
   <div class="cr-fields"><label class="field"><span>Nombre del futbolista</span><input name="name" value="${h(d.name)}" placeholder="Ej.: Oscar Sariego" required maxlength="44" autocomplete="off"></label>
   <label class="field"><span>Nacionalidad</span><select name="country">${COUNTRIES.map(c=>`<option value="${c.code}" ${c.code===d.country?'selected':''}>${h(c.name)}</option>`).join('')}</select></label>
   <label class="field"><span>Dorsal</span><input name="number" value="${h(d.number)}" type="number" min="1" max="99"></label>
   <div class="cr-sugg"><small>Dorsales habituales:</small>${sugg.map(x=>`<button type="button" class="cr-pill" data-action="cr-number" data-n="${x}">${x}</button>`).join('')}</div></div>
   ${group('Tu edad de inicio','Cuanto más joven, más margen; cuanto mayor, más hecho llegas.',ages.map(a=>`<label class="cr-card compact ${String(d.age)===String(a)?'on':''}"><input type="radio" name="age" value="${a}" ${String(d.age)===String(a)?'checked':''}><span class="cr-ico">${a}</span><span class="cr-body"><strong>${a} años</strong>${`<span class="cr-chips">${(AGE_FX[a]||[]).map(([t,g])=>`<i class="${g?'up':'down'}">${h(t)}</i>`).join('')}</span>`}</span></label>`).join(''),4)}
   ${group('Pierna hábil',null,['Derecha','Izquierda'].map(f=>`<label class="cr-card compact ${d.foot===f?'on':''}"><input type="radio" name="foot" value="${f}" ${d.foot===f?'checked':''}><span class="cr-ico">${CHOICES.foot[f].icon}</span><span class="cr-body"><strong>${f}</strong>${chips('foot',f,3)}</span></label>`).join(''),2)}
  </div><div class="cr-right"><div class="cr-label">TU POSICIÓN EN LA CANCHA</div>${pitchPicker(d)}
   <div class="cr-selected"><b>${h(POSITION_NAMES[d.position])}</b><small>${h(classOf(d.position,d.roleClass).description)}</small></div></div></div>`
 +group(`Tu clase dentro de la posición · ${POSITION_NAMES[d.position]}`,'La clase concede bonos reales a tus atributos desde el primer día.',cls.map(c=>`<label class="cr-card ${d.roleClass===c.id?'on':''}"><input type="radio" name="roleClass" value="${c.id}" ${d.roleClass===c.id?'checked':''}><span class="cr-ico">${({shot:'◎',pace:'➤',pass:'✦',dribble:'↯',defense:'⛨',physical:'⚙'})[c.primary]||'•'}</span><span class="cr-body"><strong>${h(c.name)}</strong><small>${h(c.description)}</small><span class="cr-chips"><i class="up">+${c.power} ${h(ATTR_LABEL[c.primary])}</i><i class="up">+${c.extra} ${h(ATTR_LABEL[c.secondary])}</i></span></span></label>`).join(''),cls.length>4?3:cls.length)
 +`<div class="cr-presets"><span>¿POCO TIEMPO? ELIGE UN PERFIL SUGERIDO:</span>${PRESETS.map(p=>`<button type="button" class="cr-preset" data-action="cr-preset" data-id="${p.id}" title="${h(p.blurb)}"><b>${p.icon}</b>${h(p.name)}</button>`).join('')}<button type="button" class="cr-preset rand" data-action="cr-random"><b>⚄</b>Sorpréndeme</button></div>`;
}
function stepRoots(d){
 return heading('CAPÍTULO II · DONDE NACE EL TALENTO','Los grandes caminos','tienen un origen.','Cada antecedente deja huella: cambia tu velocidad de aprendizaje, tu techo y cómo te recibe el fútbol profesional.')
 +`<div class="cr-split even"><div><div class="cr-fields one"><label class="field"><span>Ciudad o barrio de origen</span><input name="city" value="${h(d.city)}" placeholder="Ej.: La Cisterna, Santiago" maxlength="40" autocomplete="off"></label></div></div>
   <label class="field story"><span>Tu historia en una frase · aparecerá en tu primer día como profesional <em id="story-count">${(d.story||'').length}/180</em></span><textarea name="story" maxlength="180" rows="2" placeholder="Ej.: Pateaba contra la pared del pasaje hasta que oscurecía.">${h(d.story||'')}</textarea></label></div>`
 +group('Tu formación','Dónde aprendiste a jugar',ORIGINS.map(o=>optCard('origin','origin',o,d)).join(''),4)
 +group('Tu entorno','Quiénes te rodearon y con qué recursos creciste',ENVIRONMENTS.map(o=>optCard('environment','environment',o,d)).join(''),4);
}
function stepPlayer(d){
 const rec={POR:'lectura',DFC:'lectura',MCD:'lectura',LI:'explosividad',LD:'explosividad',EI:'explosividad',ED:'explosividad',DC:'definicion',MCO:'tecnica',MC:'tecnica',MI:'tecnica',MD:'tecnica'}[d.position];
 return heading('CAPÍTULO III · IDENTIDAD DE JUEGO','¿Qué futbolista','quieres ser?','Una virtud, un defecto y una forma de jugar. Los bonos suben tus techos de desarrollo: son límites que alcanzarás con el tiempo, no regalos inmediatos.')
 +`<div class="cr-split profile"><div class="cr-prof-class"><div class="cr-label">TU CLASE</div><div class="cr-selected"><b>${h(classOf(d.position,d.roleClass).name)}</b><small>${h(classOf(d.position,d.roleClass).description)}</small></div></div>${positionProfile(d)}</div>`
 +group('Tu fortaleza principal','Sube +1 al empezar y +2 en el techo',STRENGTH_OPTIONS.map(o=>optCard('strength','strength',o,d,o.id===rec?'<em class="cr-rec">Recomendado</em>':'',2)).join(''),5)
 +group('Una debilidad que tendrás que trabajar','Todo futbolista real tiene una',WEAKNESS_OPTIONS.map(o=>optCard('weakness','weakness',o,d)).join(''),4)
 +group('Estilo en la cancha','Cómo juegas cuando nadie te dice qué hacer',STYLES.map(o=>optCard('style','style',o,d,'',2)).join(''),5)
 +group('Tu desarrollo','Hacia dónde crece tu cuerpo y tu cabeza',DEVELOPMENT_PATHS.map(o=>optCard('developmentPath','developmentPath',o,d,'',2)).join(''),4);
}
function stepMind(d){
 return heading('CAPÍTULO IV · TU MENTALIDAD','El fútbol también','se juega fuera.','Tu carácter decide cómo respondes a la presión; tu imagen y tus decisiones moldean tus ofertas, tu reputación y tu relación con el vestuario.')
 +group('Tu carácter bajo presión','Define tu serenidad en las jugadas decisivas',PERSONALITIES.map(o=>optCard('personality','personality',o,d,'',2)).join(''),5)
 +group('Tu imagen pública','Cómo te ve la gente',PUBLIC_IMAGES.map(o=>optCard('publicImage','publicImage',o,d)).join(''),4)
 +group('Cómo decides tu futuro','Condiciona qué ofertas llegan a tu representante',RISK_PROFILES.map(o=>optCard('riskProfile','riskProfile',o,d)).join(''),4);
}
function stepDreams(d){
 const club=getClub(d.fanClubId);
 return heading('CAPÍTULO V · TU AMBICIÓN','Hay camisetas','que se sueñan.','Tu sueño es una meta medible: la carrera la irá siguiendo, y cumplirla tiene recompensa. El club del que eres hincha es opcional y no garantiza fichajes.')
 +group('Sueño deportivo','Una meta de carrera con progreso y recompensa',DREAMS.map(o=>optCard('dream','dream',o,d,'',2)).join(''),5)
 +dreamGoalPanel(d)
 +`<div class="cr-split even"><div class="cr-fan"><div class="cr-label">CLUB DEL QUE ERES HINCHA · OPCIONAL</div><div class="cr-fanrow">${club?badge(club,'large'):'<span class="cr-fanempty">?</span>'}<label class="field"><select name="fanClubId"><option value="">Ninguno · seguir sin elegir</option>${COUNTRIES.map(c=>`<optgroup label="${h(c.name)}">${c.clubs.filter(x=>!x.inactive).map(x=>`<option value="${h(x.id)}" ${x.id===d.fanClubId?'selected':''}>${h(x.name)}</option>`).join('')}</optgroup>`).join('')}</select></label></div><small>${club?`Si algún día juegas en ${h(club.name)}, vivirás escenas especiales con su hinchada.`:'Sin club favorito: ningún escudo pesa más que otro.'}</small></div>
  <div>${group('Modo del draft','Cómo eliges a tus referentes',['Clásico','Purista'].map(m=>`<label class="cr-card compact ${d.mode===m?'on':''}"><input type="radio" name="mode" value="${m}" ${d.mode===m?'checked':''}><span class="cr-ico">${CHOICES.mode[m].icon}</span><span class="cr-body"><strong>${m}</strong>${chips('mode',m,3)}</span></label>`).join(''),2)}</div></div>`;
}
function summaryLine(d){
 const cls=classOf(d.position,d.roleClass);
 return `${POSITION_NAMES[d.position]} ${cls.name.toLowerCase()} ${d.foot==='Izquierda'?'zurdo':'diestro'} de ${d.age} años${d.city?`, criado en ${d.city}`:''}. Formado en «${name(ORIGINS,d.origin).toLowerCase()}», con una mentalidad ${name(PERSONALITIES,d.personality).toLowerCase()} y un sueño: ${name(DREAMS,d.dream).toLowerCase()}.`;
}
function stepSummary(d){
 const cons=draftConsequences(d,NAME_OF);
 const missing=[!d.name.trim()&&'Escribe un nombre',!(Number.isInteger(Number(d.number))&&Number(d.number)>=1&&Number(d.number)<=99)&&'El dorsal debe estar entre 1 y 99'].filter(Boolean);
 return heading('CAPÍTULO VI · PERFIL PREVIO','Tu carrera','comienza acá.','Revisa lo que has decidido. Ninguna elección garantiza el éxito: cambian las oportunidades, los riesgos y la manera de crecer.')
 +`<div class="cr-oneliner"><b>“</b>${h(summaryLine(d))}<b>”</b></div>`
 +(missing.length?`<div class="cr-warn">${missing.map(m=>`<span>⚠ ${h(m)}</span>`).join('')}</div>`:'')
 +`<div class="cr-sumgrid">${cons.map(c=>`<article class="cr-sum"><header><span class="cr-ico sm">${c.icon}</span><div><small>${h(c.label)}</small><strong>${h(c.name)}</strong></div><button type="button" class="cr-edit" data-action="cr-goto" data-step="${({origin:1,environment:1,developmentPath:2,personality:3,style:2,strength:2,weakness:2,publicImage:3,riskProfile:3,dream:4,mode:4,foot:0,age:0})[c.cat]??0}" aria-label="Editar ${h(c.label)}">Editar</button></header><div class="cr-chips">${c.chips.map(([t,g])=>`<i class="${g?'up':'down'}">${h(t)}</i>`).join('')}</div></article>`).join('')}</div>`
 +`<div class="cr-next"><div class="cr-ico">◈</div><div><strong>Lo que viene: tu legado</strong><p>Ahora elegirás 8 influencias entre leyendas e íconos. Cada una te da una faceta con su techo, y juntas forman tu <b>ADN futbolístico</b>: una familia de juego con un rasgo propio que acompañará toda tu carrera.</p></div></div>`;
}
export function creatorView(draft,wizard){
 const body=[stepIdentity,stepRoots,stepPlayer,stepMind,stepDreams,stepSummary][wizard](draft)+profileReport(draft,wizard);
 return {content:body,aside:aside(draft,wizard)};
}

/* ====================================================================== */
/* Legado: draft con ADN                                                   */
/* ====================================================================== */
const TIER_ICON={icono:'★★★',figura:'★★',profesional:'★'};
const TAG_EFFECT_TEXT={
 finalizador:'+5 % goles · −3 % asistencias · techo Tiro +2',creador:'+7 % asistencias · pases más precisos · techo Pase +2',regateador:'Amague +14 % · +2 % goles · techo Regate +2',
 velocista:'Sprint más rápido · +6 % lesiones · el Ritmo se pierde antes · techo Ritmo +3',muro:'Entrada más larga · −3 % lesiones · −4 % goles · techo Defensa +3',
 motor:'−8 % lesiones · +2,5 % minutos · techo Físico +2',guardian:'Reflejos +12 % · +1,5 % minutos · techo Defensa +3',mosaico:'+1 techo en todo · −2 % lesiones · sin especialización'
};
export function tagText(tag){return TAG_EFFECT_TEXT[tag]||'';}
export function draftView(state,choices){
 const filled=ATTRS.filter(([k])=>k in state.attributes);
 const pips=ATTRS.map(([k,label])=>`<span class="lg-pip ${k in state.attributes?'done':''}" title="${h(label)}"><b>${h(label)}</b><i>${k in state.attributes?n(state.attributes[k]):'—'}</i></span>`).join('');
 const sources=state.draftSources||[];
 const lean=leaning(state);
 const cards=choices.map((x,i)=>{
  const tag=DNA_TAGS[x.tag]||DNA_TAGS.mosaico,hide=x.hidden;
  const pts=x.radar&&!hide?x.radar:null;
  const stars=['skills','weak'].includes(x.key);
  const projected=dnaFromPicks([...sources,{legend:x.legend,attribute:x.key,tier:x.tier}],state.position);
  const projectedTag=DNA_TAGS[projected.primary];
  return `<button class="lg-card tier-${h(x.tier)}" data-portrait-name="${h(x.legend)}" data-action="draft-accept" data-index="${i}">
   <div class="legend-photo-backdrop" aria-hidden="true"><div class="legend-art-field"><div class="legend-art-title">RASCENSO <span>ADN FUTBOLÍSTICO</span></div></div></div>
   <div class="lg-top"><span class="lg-tier">${TIER_ICON[x.tier]} ${h(x.tierLabel)}</span><span class="lg-fit fit-${x.fit.startsWith('CLAVE')?'key':x.fit.startsWith('COMPL')?'mid':'alt'}">${h(x.fit)}</span></div>
   <div class="lg-name"><small>INSPIRADO EN</small><h2>${h(x.legend)}</h2><span class="lg-tag"><b>${tag.icon}</b>${h(tag.name)}</span></div>
   <div class="lg-body">
    <div class="lg-facet"><small>ESTA RONDA TE OFRECE</small><strong>${h(x.label)}</strong></div>
    <div class="lg-nums"><div><small>LEYENDA</small><b>${hide?'?':stars?'★'.repeat(x.value):n(x.value)}</b></div><div class="arrow">→</div><div><small>TU JUVENIL</small><b>${hide?'?':stars?'★'.repeat(x.junior):n(x.junior)}</b></div><div class="ceil"><small>TECHO</small><b>${hide?'?':stars?'★'.repeat(x.ceiling):n(x.ceiling)}</b></div></div>
    ${stars?'':`<div class="lg-meter" aria-hidden="true"><i style="width:${hide?0:x.junior}%"></i><b style="left:${hide?0:x.ceiling}%"></b></div>`}
    <div class="lg-radar">${pts?radar(pts,{size:150,dashed:false}):'<div class="lg-hidden">Perfil oculto<br><small>Modo Purista</small></div>'}<div class="lg-trait"><small>RASGO DE LA FAMILIA</small><strong>${h(tag.trait)}</strong><p>${h(tag.blurb)}</p></div></div>
    <p class="lg-tier-detail">${h(x.tierDetail)}</p><div class="lg-preview"><small>ADN SI ELIGES ESTA CARTA</small><strong>${projectedTag.icon} ${h(projectedTag.name)}</strong><span>${projected.fit==='natural'?'Encaje natural':projected.fit==='neutral'?'Encaje parcial':'Estilo atípico para tu puesto'}${projected.secondary?' · secundaria: '+h(DNA_TAGS[projected.secondary].name):''}</span></div>
   </div>
   <span class="lg-cta">Incorporar al jugador ↗</span></button>`;}).join('');
 const picks=sources.map(p=>{const t=DNA_TAGS[tagFor(p)]||DNA_TAGS.mosaico;return `<li><b>${t.icon}</b><div><strong>${h(p.legend)}</strong><small>${h(ATTR_LABEL[p.attribute]||p.attribute)} · ${h(t.name)}</small></div><span>${TIER_ICON[p.tier]}</span></li>`;}).join('');
 return `<div class="lg-wrap"><div class="lg-main">
  <div class="lg-head"><div><span class="section-label">CAPÍTULO VII · TU ADN FUTBOLÍSTICO</span><h1>Elige tu <em>influencia.</em></h1><p>Cada carta te da una faceta distinta de la mano de una leyenda. La cifra del referente es solo una guía: tu juvenil hereda un valor modesto y un <b>techo</b> de crecimiento. Las 8 influencias forman tu <b>ADN</b>.</p></div><div class="lg-count"><strong>${state.draftIndex}<span>/8</span></strong><small>INFLUENCIAS</small></div></div>
  <div class="lg-pips">${pips}</div><div class="lg-focus" role="group" aria-label="Faceta del legado"><span>¿QUÉ QUIERES HEREDAR?</span><button type="button" data-action="draft-focus" data-key="" aria-pressed="${!state.draftFocus}">Explorar</button>${ATTRS.filter(([k])=>!(k in state.attributes)).map(([k,l])=>`<button type="button" data-action="draft-focus" data-key="${k}" aria-pressed="${state.draftFocus===k}">${h(l)}</button>`).join('')}<small>${state.draftFocus?'Tres referentes para la misma faceta: compara arranque, techo y ADN.':'Explora distintas facetas o elige una para comparar tres referentes. No consume cambios.'}</small></div>
  <div class="lg-cards">${cards}</div>
  <div class="lg-foot"><button type="button" class="action secondary" data-action="reroll" ${state.draftRerolls>=3?'disabled':''}>↻ Cambiar propuestas (${Math.max(0,3-state.draftRerolls)})</button><small>Las cifras son ficticias. Solo las cartas con fotografía autorizada muestran rostros reales. <a href="./assets/MEDIA_CREDITS.html" target="_blank" rel="noopener">Créditos y licencias</a>.</small></div></div>
  <aside class="lg-side"><section class="lg-panel"><header><span>TU JUGADOR HOY</span><small>${filled.length}/8 atributos</small></header>${radar(KEYS.map(k=>state.attributes[k]??null),{ghost:KEYS.map(k=>state.attrCeil?.[k]??null),size:230})}<div class="lg-legend"><i class="a"></i>Valor inicial<i class="b"></i>Techo</div></section>
   <section class="lg-panel"><header><span>ADN EN CONSTRUCCIÓN</span><small>${lean.label}</small></header>${lean.bars}</section>
   <section class="lg-panel picks"><header><span>TUS INFLUENCIAS</span></header>${picks?`<ol>${picks}</ol>`:'<p class="muted">Aún no has elegido ninguna.</p>'}</section>
   <section class="lg-panel fam"><header><span>LAS FAMILIAS DE JUEGO</span><small>Tu ADN será una de ellas</small></header>${Object.entries(DNA_TAGS).map(([k,t])=>`<div class="lg-fam"><b>${t.icon}</b><div><strong>${h(t.name)}</strong><small>${h(TAG_EFFECT_TEXT[k])}</small></div></div>`).join('')}</section></aside></div>`;
}
const tagFor=p=>tagOf(p.legend);
function leaning(state){
 const t=dnaFromPicks(state.draftSources||[],state.position).tally;
 const ranked=Object.entries(t).sort((a,b)=>b[1]-a[1]);
 const max=Math.max(2.2,ranked[0]?.[1]||0);
 const bars=ranked.length?ranked.map(([k,v])=>`<div class="lg-dna ${v>=2.2?'hot':''}"><span><b>${DNA_TAGS[k].icon}</b>${h(DNA_TAGS[k].name)}</span><div><i style="width:${Math.round(v/max*100)}%"></i></div><em>${v>=2.2?'DOMINANTE':''}</em></div>`).join(''):'<p class="muted">Elige influencias: la familia que más se repita será tu ADN. Si ninguna domina, serás un <b>Mosaico</b>.</p>';
 const top=ranked[0];return {bars,label:top&&top[1]>=2.2?DNA_TAGS[top[0]].name:(ranked.length?'Sin dominante aún':'—')};
}

/* ---------- ADN heredado (se muestra al cerrar el draft) ---------- */
export function dnaCard(state){
 const d=state.dna;if(!d)return '';
 const p=DNA_TAGS[d.primary]||DNA_TAGS.mosaico,s=d.secondary?DNA_TAGS[d.secondary]:null;
 const fit={natural:['Encaje natural','Tu ADN y tu puesto hablan el mismo idioma: todos los efectos al 100 %.','up'],neutral:['Encaje parcial','Tu ADN se adapta a tu posición con efectos al 85 %.',''],atipico:['ADN atípico','Un perfil inesperado para tu puesto: efectos al 60 %, pero tendrás más opciones de cambiar de posición.','down']}[d.fit]||['', '', ''];
 const ceil=dnaCeilBonus(d),fx=dnaFx(d);
 const pct=(v,inv=false)=>{const x=Math.round((v-1)*100);return x===0?null:`${x>0?'+':''}${x} %`;};
 const lines=[['goals','goles',1],['assists','asistencias',1],['injury','lesiones',-1]].map(([k,l,sg])=>{const t=pct(fx[k]);return t?`<i class="${(fx[k]-1)*sg>=0?'up':'down'}">${t} ${l}</i>`:'';}).join('')+(fx.minutes?`<i class="${fx.minutes>0?'up':'down'}">${fx.minutes>0?'+':''}${(fx.minutes*100).toFixed(1).replace('.0','').replace('.',',')} % minutos</i>`:'')+(fx.feint?'<i class="up">Amague mejorado</i>':'')+(fx.tackle?'<i class="up">Entrada más larga</i>':'')+(fx.reflex?'<i class="up">Reflejos mejorados</i>':'')+(fx.sprint?'<i class="up">Sprint más rápido</i>':'')+(fx.paceDecline>1?'<i class="down">El Ritmo declina antes</i>':'');
 const ceils=Object.entries(ceil).filter(([,v])=>v).map(([k,v])=>`<i class="up">+${v} techo ${h(ATTR_LABEL[k])}</i>`).join('');
 return `<section class="dna-card"><div class="dna-ico">${p.icon}</div><div class="dna-main"><small>TU ADN HEREDADO</small><h2>${h(p.name)}</h2><strong>${h(p.trait)}</strong><p>${h(p.blurb)}</p>${s?`<p class="dna-2"><b>${s.icon} Influencia secundaria:</b> ${h(s.name)} — ${h(s.trait)}</p>`:''}<div class="dna-fit ${fit[2]}"><b>${h(fit[0])}</b> ${h(fit[1])}</div></div><div class="dna-fx"><small>EFECTOS EN TU CARRERA</small><div class="cr-chips">${lines}${ceils}</div></div>${radar(KEYS.map(k=>state.attributes[k]??null),{ghost:KEYS.map(k=>state.attrCeil?.[k]??null),size:210})}</section>`;
}

/** Informe contextual: no promete contratos ni confunde techo con capacidad actual. */
function profileReport(d,step){
 const f=choiceFx(d),delta=startAttrDelta(d);
 const notes=[];
 if(step===0)notes.push('La posición pondera tu media. Cambiar de puesto actualiza las clases disponibles; el resto de tu identidad se conserva.');
 if(step===1)notes.push(`Tu formación fija ${70+f.startMorale} de moral y ${50+f.startTrust} de confianza inicial del entrenador. La ciudad y tu historia acompañan el relato; no conceden puntos extra.`);
 if(step===2){const strongest=classBonuses(d.position,d.roleClass).map(([k,v])=>`${ATTR_LABEL[k]} +${v}`).join(' · ');notes.push(`Tu clase: ${strongest}. El Legado aporta la base; formación, edad y fortaleza se añaden al cerrar las ocho elecciones.`);if((delta.pace||0)<0)notes.push('El origen amateur reduce en 1 el Ritmo inicial; puedes compensarlo con una influencia o tu clase.');}
 if(step===3||step===4||step===5)notes.push(`Primer contrato: prioridad para ${getCountry(d.country)?.name}. ${Number(d.age)<18?'Por tu edad, las salidas al extranjero son especialmente poco frecuentes.':'Puedes recibir una oportunidad regional junto a los proyectos locales.'} ${d.riskProfile==='aventurero'?'Tu espíritu aventurero aumenta esa posibilidad.':['hogareno','leal','paciente'].includes(d.riskProfile)?'Tu perfil refuerza un comienzo cerca de casa.':''}`);
 if(step===4)notes.push('El club de hincha añade vínculos y escenas, pero no compra una oferta. Tu sueño se seguirá durante la carrera.');
 return `<section class="cr-report"><span>INFORME DEL FORMADOR</span>${notes.map(t=>`<p>${h(t)}</p>`).join('')}</section>`;
}
