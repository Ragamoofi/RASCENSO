/* RASCENSO 4.3 — realización televisiva Canvas para todas las jugadas. Sin recursos externos. */
const W=960,H=540;
import {tuningFor} from './play-tuning43.mjs';
const S={bg:'#061c30',copper:'#f3ba82',pale:'#d9ebf4',muted:'#9fbccc'};
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
function panel(g,x,y,w,h){
 g.beginPath();g.roundRect(x,y,w,h,8);g.fill();
}
/** Dibujo puro: nunca altera las físicas ni el RNG que usan los rivales. */
export function drawBroadcast43(m,g){
 const play=m.play||{},t=m.t||0,live=m.phase==='play';
 g.save();
 // Cinta de transmisión y focos, poco intrusiva en el campo.
 const top=g.createLinearGradient(0,0,0,86);top.addColorStop(0,'rgba(4,15,27,.72)');top.addColorStop(1,'rgba(4,15,27,0)');
 g.fillStyle=top;g.fillRect(0,0,W,86);
 const foot=g.createLinearGradient(0,H-95,0,H);foot.addColorStop(0,'rgba(4,15,27,0)');foot.addColorStop(1,'rgba(4,15,27,.78)');
 g.fillStyle=foot;g.fillRect(0,H-95,W,95);
 const name=String(tuningFor(play.type).tag||'Momento decisivo').toUpperCase();
 g.fillStyle='rgba(5,23,38,.75)';panel(g,18,H-76,252,30);
 g.strokeStyle='rgba(215,163,111,.75)';g.lineWidth=1.3;g.beginPath();g.moveTo(30,H-61);g.lineTo(46,H-61);g.stroke();
 g.textAlign='left';g.textBaseline='middle';g.font='800 12px "DM Sans",Arial';g.fillStyle=S.pale;g.fillText(name.slice(0,28),55,H-61,204);
 if(play.classic||play.decisive){
  const pulse=.78+Math.sin(t*3)*.08;
  g.globalAlpha=pulse;
  g.fillStyle='rgba(10,28,45,.82)';panel(g,W-220,H-76,200,30);
  g.fillStyle=S.copper;g.textAlign='center';g.font='900 11px "DM Sans",Arial';
  g.fillText(play.classic?'⚡ CLÁSICO EN JUEGO':'★ MOMENTO CLAVE',W-120,H-61,188);
  g.globalAlpha=1;
 }
 // Micro-progreso dentro del tiempo de la jugada: indica urgencia, no modifica la simulación.
 if(live&&Number.isFinite(m.timer)&&m.timer>0){
  const left=clamp(1-t/m.timer,0,1);
  g.fillStyle='rgba(1,14,27,.7)';g.fillRect(0,H-5,W,5);
  g.fillStyle=left<.2?'#f18973':'#ecc393';
  g.fillRect(0,H-5,W*left,5);
 }
 // Regla de dirección estilizada en el borde lateral, distinta según ataque/defensa.
 g.fillStyle=play.kind==='defend'?'rgba(105,186,197,.7)':'rgba(239,170,119,.7)';
 g.fillRect(0,110,4,live?Math.min(H-220,100+clamp(t/10,0,1)*125):100);
 g.restore();
}
/** El encuadre visual responde al tipo de ocasión y al minuto sin afectar la IA. */
export function sceneColour43(play){
 const kind=play?.kind==='defend'?'defend':'attack';
 return {edge:kind==='defend'?'#76b9ce':'#f1b586',label:tuningFor(play?.type).tag,
  intensity:clamp((Number(play?.pressure)||50)/100,.2,.99)};
}
