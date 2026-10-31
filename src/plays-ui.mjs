/* RASCENSO 3.0 · Capa de interfaz de las Jugadas Vivas: tarjetas de temporada y ventana de juego. */
import { PLAYS, playerStats, aiStats, autoChance } from './plays30.mjs';
import { createMatch } from './match2d.mjs';
import { FIELD_SCENES } from './scenes-field.mjs';
import { GOAL_SCENES } from './scenes-goal.mjs';
import { POSITION_NAMES } from './career20.mjs';

export const SCENES={...FIELD_SCENES,...GOAL_SCENES};
const h=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ICON={mano_a_mano:'⚡',penal:'◎',cabezazo:'⤴',remate:'✦',diagonal:'↗',tiro_libre:'⌒',encare:'⇄',centro:'➶',pase_filtrado:'➝',contragolpe:'»',rondo:'◌',recuperacion:'✋',entrada:'⛨',anticipacion:'◇',despeje:'⤒',fuera_juego:'⚑',achique:'⊕',salida_aerea:'⬆',penal_atajado:'⊘',reflejos:'✱'};
const DETAIL={gol:'Gol',asistencia:'Asistencia',atajado:'Atajó el arquero',fuera:'Afuera',poste:'Palo',travesaño:'Travesaño',barrera:'Barrera',bloqueado:'Bloqueado','interceptado':'Interceptado','fuera de juego':'Fuera de juego',robo:'Robo',despeje:'Despeje',atajada:'Atajada',falta:'Falta',perdida:'Perdida',superado:'Te superaron',tiempo:'Se acabó el tiempo',corte:'Corte',posesión:'Posesión',controlada:'Controlada','gol rival':'Gol rival',auto:'Resuelta'};

function scoreLine(p,state,getClub){const us=getClub(state.clubId)?.name||'Tu club';const left=p.isHome?us:p.rival,right=p.isHome?p.rival:us;const a=p.isHome?p.before.gf:p.before.ga,b=p.isHome?p.before.ga:p.before.gf;return `${left} ${a}-${b} ${right}`;}
/** Panel de la temporada: jugadas pendientes y resueltas. */
export function playsPanel(state,plays,getClub){
 if(!plays.length)return `<section class="plays-panel empty"><div class="plays-head"><span>⚡ JUGADAS DE LA TEMPORADA</span></div><p>Con este rol todavía no tienes minutos decisivos asegurados. Gana confianza para vivir jugadas propias.</p></section>`;
 const done=plays.filter(p=>p.result).length;
 return `<section class="plays-panel"><div class="plays-head"><span>⚡ JUGADAS DE LA TEMPORADA · ${h(POSITION_NAMES[state.position]||state.position)}</span><b>${done}/${plays.length}</b></div>
 <div class="plays-list">${plays.map(p=>{const info=PLAYS[p.type],r=p.result;const chance=Math.round(autoChance(state,p)*100);
  return `<article class="play-card ${r?(r.success?'won':'lost'):''} ${p.decisive?'decisive':''}">
   <div class="play-icon">${ICON[p.type]||'⚽'}</div>
   <div class="play-main"><small>FECHA ${p.round} · MIN ${p.minute}' · ${h(p.tag)}</small><strong>${h(info.name)}</strong><em>${h(scoreLine(p,state,getClub))}</em>
    <div class="play-meta"><i title="Presión del momento">Presión ${p.pressure}</i><i title="Nivel del rival y contexto">Dificultad ${Math.round(p.difficulty*100)}</i><i>${info.kind==='attack'?(info.credit==='assist'?'Asistencia':'Gol'):'Evitar gol'}</i></div></div>
   <div class="play-act">${r?`<b class="play-res">${r.success?'✓':'✗'} ${h(DETAIL[r.detail]||r.detail)}</b>${r.finalScore?`<small>Final ${h(r.finalScore)}</small>`:''}${r.auto?'<small>Resuelta automáticamente</small>':''}`:`<button type="button" class="action main compact" data-action="play-open" data-id="${h(p.id)}">Jugar ▶</button><button type="button" class="play-auto" data-action="play-auto" data-id="${h(p.id)}" title="Probabilidad estimada según tus atributos">Simular (${chance}%)</button>`}</div>
  </article>`;}).join('')}</div>
 <small class="plays-foot">Cada jugada parte del marcador real de ese partido. Si la logras, suma un gol (o evita uno) en ese resultado; si fallas, el partido queda como lo simuló el motor.</small></section>`;
}

/** Abre la ventana de juego. onDone(report) recibe el resultado; onCancel cierra sin jugar. */
export function openPlay({state,play,clubName,onDone,onCancel}){
 const scene=SCENES[play.type];if(!scene)return null;
 const info=PLAYS[play.type];
 const wrap=document.createElement('div');wrap.className='play-overlay';wrap.setAttribute('role','dialog');wrap.setAttribute('aria-label',info.name);
 wrap.innerHTML=`<div class="play-window"><header><div><small>JUGADA VIVA · ${h(play.tag)}</small><strong>${h(info.name)}</strong></div><button type="button" class="play-close" aria-label="Salir sin jugar">✕</button></header><div class="play-stage"><canvas width="960" height="540" tabindex="0"></canvas></div><footer>${h(info.controls)}</footer></div>`;
 document.body.appendChild(wrap);
 const canvas=wrap.querySelector('canvas');canvas.focus();
 const fullPlay={...play,memory:state.playMemory?.penalties||[]};
 let match=null,closed=false;
 const close=()=>{if(closed)return;closed=true;match?.destroy();wrap.remove();document.removeEventListener('keydown',esc);};
 const esc=e=>{if(e.key==='Escape'&&match?.phase!=='outro'){close();onCancel?.();}};
 document.addEventListener('keydown',esc);
 wrap.querySelector('.play-close').addEventListener('click',()=>{if(match?.phase==='outro')return;close();onCancel?.();});
 match=createMatch(canvas,{play:fullPlay,stats:playerStats(state,play),ai:aiStats(play),scene,hud:{title:info.name,brief:info.brief,controls:info.controls,us:clubName,them:play.rival},
  onEnd:res=>{close();onDone?.(res);}});
 return {close,match};
}
