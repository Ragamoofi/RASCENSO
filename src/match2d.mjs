/* RASCENSO 3.0 · Motor 2D de jugadas.
 * Canvas propio, sin dependencias: bucle con dt, entrada por ratón/táctil/teclado,
 * física de pelota con altura y sombra, cancha vista desde arriba (arco a la derecha)
 * y vista de portería para penales, tiros libres y atajadas.
 * Coordenadas de cancha en metros: x 0→52 (arco en x=52), y 0→29 (centro del arco y=14.5).
 */
import { rng } from './career20.mjs';

export const W=960,H=540;
export const FIELD={len:52,wid:29,goalX:52,goalY:14.5,post:3.66,bar:2.44,boxX:35.5,boxY:[4.34,24.66],sixX:46.5,sixY:[9,20],spot:41};
const SCALE=Math.min((W-36)/FIELD.len,(H-36)/FIELD.wid),OX=(W-FIELD.len*SCALE)/2-6,OY=(H-FIELD.wid*SCALE)/2;
export const toScreen=(x,y)=>[OX+x*SCALE,OY+y*SCALE];
export const toWorld=(sx,sy)=>[(sx-OX)/SCALE,(sy-OY)/SCALE];
export const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
export const clampN=(v,a,b)=>Math.min(b,Math.max(a,v));
export const lerp=(a,b,t)=>a+(b-a)*t;

/* ---------- Colores ---------- */
export const COLORS={us:'#2f5fd6',usDark:'#16316f',mate:'#3c6ad8',ally:'#5b82e0',num:'#fff',copper:'#e8a574',gold:'#f3c47b',grassA:'#1f5c3d',grassB:'#23673f',line:'rgba(255,255,255,.82)',ball:'#fbfbf6',shadow:'rgba(0,0,0,.35)',keeperUs:'#2bd68a',keeperThem:'#f2cf4a'};
export function rivalColor(seed){let h=0;for(const c of String(seed))h=(h*31+c.charCodeAt(0))>>>0;// Siempre cálidos o contrastantes: nunca se confunden con el azul de tu equipo ni con el césped.
 const hues=[0,8,18,30,40,325,338,350,300];const hue=hues[h%hues.length];return {body:`hsl(${hue} 72% 46%)`,dark:`hsl(${hue} 70% 26%)`};}

/* ---------- Física de la pelota ---------- */
export function makeBall(x,y){return {x,y,z:0,vx:0,vy:0,vz:0,owner:null,curl:0,trail:[]};}
/** Pelota pegada al pie: se coloca delante del jugador que la conduce. */
export function syncOwned(ball){const o=ball?.owner;if(!o)return;const f=o.face||[1,0];ball.x=o.x+f[0]*.55;ball.y=o.y+f[1]*.55;ball.z=0;}
export function kick(ball,tx,ty,speed,lift=0,curl=0){
 syncOwned(ball);
 const dx=tx-ball.x,dy=ty-ball.y,d=Math.hypot(dx,dy)||1;
 ball.owner=null;ball.vx=dx/d*speed;ball.vy=dy/d*speed;ball.vz=lift;ball.curl=curl;ball.z=Math.max(ball.z,.05);
}
/** Lanza la pelota para que caiga en (tx,ty) tras `time` segundos con una altura máxima aproximada `peak`. */
export function loft(ball,tx,ty,time,peak=3){
 syncOwned(ball);
 ball.owner=null;ball.vx=(tx-ball.x)/time;ball.vy=(ty-ball.y)/time;ball.vz=peak*4/time;ball.g=ball.vz*2/time;ball.z=Math.max(ball.z,.1);ball.curl=0;
}
export function stepBall(ball,dt){
 if(ball.owner){const o=ball.owner,f=o.face||[1,0];ball.x=o.x+f[0]*.55;ball.y=o.y+f[1]*.55;ball.z=0;ball.vx=o.vx||0;ball.vy=o.vy||0;ball.vz=0;return;}
 if(ball.curl){const sp=Math.hypot(ball.vx,ball.vy)||1;const nx=-ball.vy/sp,ny=ball.vx/sp;ball.vx+=nx*ball.curl*dt;ball.vy+=ny*ball.curl*dt;}
 ball.x+=ball.vx*dt;ball.y+=ball.vy*dt;
 if(ball.z>0||ball.vz>0){ball.vz-=(ball.g||9.8)*dt;ball.z+=ball.vz*dt;if(ball.z<=0){ball.z=0;ball.g=0;ball.vz=Math.abs(ball.vz)>2.5?-ball.vz*.32:0;ball.vx*=.78;ball.vy*=.78;}}
 else{const f=Math.max(0,1-.5*dt);ball.vx*=f;ball.vy*=f;const sp=Math.hypot(ball.vx,ball.vy);if(sp<1.2&&sp>0){const k=Math.max(0,sp-1.5*dt)/sp;ball.vx*=k;ball.vy*=k;}} // rodadura realista
 ball.trail.push([ball.x,ball.y,ball.z]);if(ball.trail.length>14)ball.trail.shift();
}
/** Punto en el que la trayectoria actual cruza la línea de gol (o null). */
export function goalCrossing(ball){
 if(ball.vx<=0)return null;const t=(FIELD.goalX-ball.x)/ball.vx;return {t,y:ball.y+ball.vy*t};
}
export function inGoalMouth(y,z=0){return Math.abs(y-FIELD.goalY)<FIELD.post-.11&&z<FIELD.bar-.05;}

/* ---------- Entidades ---------- */
export function makePlayer(x,y,o={}){return {x,y,vx:0,vy:0,face:[1,0],r:.45,num:o.num||'',team:o.team||'them',speed:o.speed||6,role:o.role||'',stun:0,label:o.label||'',...o};}
export function moveToward(e,tx,ty,speed,dt,stop=.08){
 if(e.stun>0){e.stun-=dt;e.vx*=.85;e.vy*=.85;e.x+=e.vx*dt;e.y+=e.vy*dt;return false;}
 const dx=tx-e.x,dy=ty-e.y,d=Math.hypot(dx,dy);
 if(d<=stop){e.vx=0;e.vy=0;return true;}
 const sp=Math.min(speed,d/dt);e.vx=dx/d*sp;e.vy=dy/d*sp;e.x+=e.vx*dt;e.y+=e.vy*dt;e.face=[dx/d,dy/d];return false;
}
export function keepInField(e){e.x=clampN(e.x,.4,FIELD.len-.2);e.y=clampN(e.y,.4,FIELD.wid-.4);}
/** WASD y flechas admiten diagonales simultáneas a velocidad normalizada. */
export function keyboardDirection(keys){
 const x=Number(keys.has('KeyD')||keys.has('ArrowRight'))-Number(keys.has('KeyA')||keys.has('ArrowLeft'));
 const y=Number(keys.has('KeyS')||keys.has('ArrowDown'))-Number(keys.has('KeyW')||keys.has('ArrowUp'));
 const magnitude=Math.hypot(x,y)||1;return {x:x/magnitude,y:y/magnitude};
}
/** Distancia de un punto al segmento a→b (para líneas de pase y bloqueos). */
export function segDist(p,a,b){const dx=b.x-a.x,dy=b.y-a.y,l=dx*dx+dy*dy||1;const t=clampN(((p.x-a.x)*dx+(p.y-a.y)*dy)/l,0,1);return Math.hypot(a.x+dx*t-p.x,a.y+dy*t-p.y);}

/* ---------- Motor ---------- */
export function createMatch(canvas,{play,stats,ai,scene,onEnd,hud={}}){
 const g=canvas.getContext('2d');
 const dpr=Math.min(2,globalThis.devicePixelRatio||1);
 canvas.width=W*dpr;canvas.height=H*dpr;g.setTransform(dpr,0,0,dpr,0,0);
 const m={play,stats,ai,g,canvas,t:0,phase:'brief',introT:2.4,outT:0,slow:1,shake:0,particles:[],banner:null,result:null,keys:new Set(),
  pointer:{x:W/2,y:H/2,wx:26,wy:14.5,down:false,inside:false,downAt:0,button:0},
  rand:rng(play.seed+':scene'),hud,
  finish(success,detail,quality=.5,extra={}){if(m.result)return;m.result={success,detail,quality:clampN(quality,0,1),...extra};m.phase='outro';m.outT=2.1;m.slow=.35;m.banner={text:success?(play.kind==='attack'?((extra.credit||play.credit)==='assist'?'¡ASISTENCIA!':'¡GOL!'):'¡SALVADA!'):(play.kind==='attack'?'SE FUE…':'GOL RIVAL'),good:success,sub:detail};if(success)m.burst(m.bannerAt||[W/2,H/2],success);m.shake=success?.25:.4;},
  burst([x,y],good){for(let i=0;i<60;i++){const a=m.rand()*Math.PI*2,s=80+m.rand()*260;m.particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-120,life:1.2+m.rand()*.6,c:good?(i%3?COLORS.copper:'#fff'):'#9fb3c8'});}},
  say(text,good=null,sub=''){m.banner={text,good,sub,temp:1.1};}
 };
 // ---- Entrada ----
 const rect=()=>canvas.getBoundingClientRect();
 const local=e=>{const r=rect();return [(e.clientX-r.left)/r.width*W,(e.clientY-r.top)/r.height*H];};
 const onMove=e=>{const [x,y]=local(e);m.pointer.x=x;m.pointer.y=y;[m.pointer.wx,m.pointer.wy]=toWorld(x,y);m.pointer.inside=true;};
 /** Botón «Empezar» de la pantalla de instrucciones (coordenadas del canvas). */
 const BTN={x:W/2-150,y:H-122,w:300,h:50};
 const overBtn=()=>m.pointer.x>=BTN.x&&m.pointer.x<=BTN.x+BTN.w&&m.pointer.y>=BTN.y&&m.pointer.y<=BTN.y+BTN.h;
 m.btn=BTN;m.overBtn=overBtn;
 /** Termina la lectura y arranca la cuenta 3-2-1. Nada se mueve hasta que el jugador lo decide. */
 m.begin=()=>{if(m.phase!=='brief')return;m.phase='intro';m.introT=2.4;m.pointer.down=false;};
 const onDown=e=>{e.preventDefault();canvas.setPointerCapture?.(e.pointerId);onMove(e);if(m.phase==='brief'){if(overBtn())m.begin();return;}m.pointer.down=true;m.pointer.button=e.button;m.pointer.downAt=m.t;if(m.phase==='play')scene.down?.(m,e.button===2?'alt':'main');};
 const onUp=e=>{onMove(e);m.pointer.down=false;if(m.phase==='play')scene.up?.(m,e.button===2?'alt':'main');};
 const onKey=e=>{const down=e.type==='keydown';if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault();if(down&&e.repeat)return;
  if(m.phase==='brief'){if(down&&(e.code==='Enter'||e.code==='Space'||e.code==='NumpadEnter'))m.begin();return;}if(down)m.keys.add(e.code);else m.keys.delete(e.code);if(m.phase==='play')scene.key?.(m,e.code,down);};
 const ctxMenu=e=>e.preventDefault();
 canvas.addEventListener('pointermove',onMove);canvas.addEventListener('pointerdown',onDown);canvas.addEventListener('pointerup',onUp);canvas.addEventListener('contextmenu',ctxMenu);
 canvas.addEventListener('pointerleave',()=>{m.pointer.inside=false;});
 const clearKeys=()=>m.keys.clear();
 globalThis.addEventListener?.('keydown',onKey);globalThis.addEventListener?.('keyup',onKey);globalThis.addEventListener?.('blur',clearKeys);
 /** Dirección de movimiento: teclado (WASD/flechas) o seguir al puntero. */
 m.steer=(e,speed,dt,limit=null)=>{
  const {x:kx,y:ky}=keyboardDirection(m.keys);
  if(kx||ky)moveToward(e,e.x+kx*3,e.y+ky*3,speed,dt);
  else if(m.pointer.inside){let tx=m.pointer.wx,ty=m.pointer.wy;if(limit){tx=clampN(tx,limit[0],limit[1]);ty=clampN(ty,limit[2],limit[3]);}moveToward(e,tx,ty,speed,dt,.25);}
  else{e.vx*=.8;e.vy*=.8;}
  keepInField(e);
 };
 m.aimNoise=(meters)=>(m.rand()*2-1)*meters;
 scene.init(m);
 // ---- Bucle ----
 let raf=0,last=performance.now(),alive=true;
 function frame(now){
  if(!alive)return;
  let dt=Math.min(.05,(now-last)/1000);last=now;
  if(m.phase==='brief'){/* en pausa: la escena no avanza ni el reloj corre */}
  else if(m.phase==='intro'){m.introT-=dt;if(m.introT<=0){m.phase='play';m.pointer.down=false;m.keys.clear();}}
  else if(m.phase==='play'){m.t+=dt*m.slow;scene.update(m,dt*m.slow);syncOwned(m.ball);if(m.t>40&&!m.result)m.finish(false,'tiempo',.1);}
  else if(m.phase==='outro'){m.outT-=dt;scene.update(m,dt*m.slow);m.slow=Math.min(1,m.slow+dt*.4);if(m.outT<=0){alive=false;draw();onEnd?.(m.result);return;}}
  for(const p of m.particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=380*dt;p.life-=dt;}m.particles=m.particles.filter(p=>p.life>0);
  if(m.banner?.temp){m.banner.temp-=dt;if(m.banner.temp<=0)m.banner=null;}
  m.shake=Math.max(0,m.shake-dt);
  draw();raf=requestAnimationFrame(frame);
 }
 function draw(){
  g.save();if(m.shake>0){g.translate((m.rand()-.5)*m.shake*24,(m.rand()-.5)*m.shake*24);}
  scene.draw(m,g);
  for(const p of m.particles){g.globalAlpha=Math.max(0,Math.min(1,p.life));g.fillStyle=p.c;g.fillRect(p.x,p.y,4,4);}g.globalAlpha=1;
  drawHud(m,g);
  if(m.phase==='brief'||m.phase==='intro')drawIntro(m,g);
  if(m.banner)drawBanner(g,m.banner);
  g.restore();
 }
 raf=requestAnimationFrame(frame);
 m.destroy=()=>{alive=false;cancelAnimationFrame(raf);canvas.removeEventListener('pointermove',onMove);canvas.removeEventListener('pointerdown',onDown);canvas.removeEventListener('pointerup',onUp);canvas.removeEventListener('contextmenu',ctxMenu);globalThis.removeEventListener?.('keydown',onKey);globalThis.removeEventListener?.('keyup',onKey);globalThis.removeEventListener?.('blur',clearKeys);};
 // Solo para pruebas automáticas: avanzar el tiempo sin esperar al navegador.
 m.tick=(dt=1/60)=>{if(m.phase==='brief'||m.phase==='intro'){m.introT=0;m.phase='play';}if(m.phase!=='done'){m.t+=dt;scene.update(m,dt);syncOwned(m.ball);}};
 return m;
}

/* ---------- Dibujo: cancha ---------- */
export function drawPitch(g,{stripes=true}={}){
 g.fillStyle='#163f2b';g.fillRect(0,0,W,H);
 const [x0,y0]=toScreen(0,0),[x1,y1]=toScreen(FIELD.len,FIELD.wid);
 if(stripes)for(let i=0;i<13;i++){g.fillStyle=i%2?COLORS.grassA:COLORS.grassB;const a=toScreen(i*4,0)[0],b=toScreen(Math.min(FIELD.len,(i+1)*4),0)[0];g.fillRect(a,y0,b-a,y1-y0);}
 const vg=g.createRadialGradient(W*.62,H*.5,60,W*.55,H*.5,W*.75);vg.addColorStop(0,'rgba(255,255,255,.05)');vg.addColorStop(1,'rgba(0,0,0,.32)');g.fillStyle=vg;g.fillRect(0,0,W,H);
 g.strokeStyle=COLORS.line;g.lineWidth=2;
 const L=(ax,ay,bx,by)=>{const [a,b]=toScreen(ax,ay),[c,d]=toScreen(bx,by);g.beginPath();g.moveTo(a,b);g.lineTo(c,d);g.stroke();};
 g.strokeRect(x0,y0,x1-x0,y1-y0);
 // mitad de cancha (x=0 es la línea central en esta vista parcial)
 const [cx,cy]=toScreen(0,FIELD.goalY);g.beginPath();g.arc(cx,cy,9.15*SCALE,-Math.PI/2,Math.PI/2);g.stroke();
 L(FIELD.boxX,FIELD.boxY[0],FIELD.len,FIELD.boxY[0]);L(FIELD.boxX,FIELD.boxY[1],FIELD.len,FIELD.boxY[1]);L(FIELD.boxX,FIELD.boxY[0],FIELD.boxX,FIELD.boxY[1]);
 L(FIELD.sixX,FIELD.sixY[0],FIELD.len,FIELD.sixY[0]);L(FIELD.sixX,FIELD.sixY[1],FIELD.len,FIELD.sixY[1]);L(FIELD.sixX,FIELD.sixY[0],FIELD.sixX,FIELD.sixY[1]);
 const [px,py]=toScreen(FIELD.spot,FIELD.goalY);g.fillStyle=COLORS.line;g.beginPath();g.arc(px,py,2.5,0,7);g.fill();
 g.beginPath();g.arc(px,py,9.15*SCALE,Math.PI*.705,Math.PI*1.295);g.stroke();
 // arco
 const [gx,gy0]=toScreen(FIELD.goalX,FIELD.goalY-FIELD.post),[,gy1]=toScreen(FIELD.goalX,FIELD.goalY+FIELD.post);
 g.fillStyle='rgba(255,255,255,.14)';g.fillRect(gx,gy0,1.6*SCALE,gy1-gy0);
 g.strokeStyle='rgba(255,255,255,.35)';g.lineWidth=1;for(let i=0;i<=8;i++){const yy=gy0+(gy1-gy0)*i/8;g.beginPath();g.moveTo(gx,yy);g.lineTo(gx+1.6*SCALE,yy);g.stroke();}
 g.strokeStyle='#fff';g.lineWidth=4;g.beginPath();g.moveTo(gx,gy0);g.lineTo(gx,gy1);g.stroke();
 g.fillStyle='#fff';g.fillRect(gx-3,gy0-3,6,6);g.fillRect(gx-3,gy1-3,6,6);
}
export function drawPlayer(g,p,{color=COLORS.us,dark=COLORS.usDark,ring=null,highlight=false,ghost=false}={}){
 const [x,y]=toScreen(p.x,p.y),r=p.r*SCALE*1.7;
 g.globalAlpha=ghost?.45:1;
 g.fillStyle=COLORS.shadow;g.beginPath();g.ellipse(x+3,y+4,r*1.05,r*.7,0,0,7);g.fill();
 if(highlight){g.strokeStyle=COLORS.copper;g.lineWidth=2.5;g.beginPath();g.arc(x,y,r+7+Math.sin(performance.now()/160)*1.5,0,7);g.stroke();}
 if(ring){g.strokeStyle=ring;g.lineWidth=2;g.setLineDash([4,4]);g.beginPath();g.arc(x,y,r+12,0,7);g.stroke();g.setLineDash([]);}
 const f=p.face||[1,0];
 g.fillStyle=dark;g.beginPath();g.ellipse(x-f[0]*2,y-f[1]*2,r,r*.92,Math.atan2(f[1],f[0]),0,7);g.fill();
 g.fillStyle=color;g.beginPath();g.arc(x+f[0]*1.5,y+f[1]*1.5,r*.82,0,7);g.fill();
 g.fillStyle='rgba(255,255,255,.9)';g.beginPath();g.arc(x+f[0]*r*.55,y+f[1]*r*.55,r*.28,0,7);g.fill();
 if(p.num){g.fillStyle='#fff';g.font=`800 ${Math.round(r*.95)}px "DM Sans",Arial`;g.textAlign='center';g.textBaseline='middle';g.fillText(p.num,x,y+1);}
 if(p.label){g.font='700 11px "DM Sans",Arial';g.textAlign='center';g.fillStyle='rgba(8,23,40,.75)';const w=g.measureText(p.label).width+10;g.fillRect(x-w/2,y-r-24,w,16);g.fillStyle='#fff';g.fillText(p.label,x,y-r-16);}
 g.globalAlpha=1;
}
export function drawBall(g,b){
 syncOwned(b);
 for(let i=0;i<b.trail.length;i++){const [tx,ty,tz]=b.trail[i];const [sx,sy]=toScreen(tx,ty);g.fillStyle=`rgba(255,255,255,${i/b.trail.length*.18})`;g.beginPath();g.arc(sx,sy-tz*SCALE*.55,3,0,7);g.fill();}
 const [x,y]=toScreen(b.x,b.y),z=b.z*SCALE*.55,r=6+b.z*1.1;
 g.fillStyle=COLORS.shadow;g.beginPath();g.ellipse(x+2,y+2,r*Math.max(.5,1-b.z*.08),r*.55*Math.max(.5,1-b.z*.08),0,0,7);g.fill();
 g.fillStyle=COLORS.ball;g.beginPath();g.arc(x,y-z,r,0,7);g.fill();g.fillStyle='#1a1a1a';g.beginPath();g.arc(x+r*.2,y-z-r*.15,r*.32,0,7);g.fill();
 g.strokeStyle='rgba(0,0,0,.35)';g.lineWidth=1;g.beginPath();g.arc(x,y-z,r,0,7);g.stroke();
}
export function drawRing(g,x,y,radius,color,{dash=null,width=2,fill=null}={}){const [sx,sy]=toScreen(x,y);g.beginPath();g.arc(sx,sy,radius*SCALE,0,7);if(fill){g.fillStyle=fill;g.fill();}g.strokeStyle=color;g.lineWidth=width;if(dash)g.setLineDash(dash);g.stroke();g.setLineDash([]);}
export function drawLine(g,a,b,color,{dash=null,width=2}={}){const [x1,y1]=toScreen(a.x,a.y),[x2,y2]=toScreen(b.x,b.y);g.strokeStyle=color;g.lineWidth=width;if(dash)g.setLineDash(dash);g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.stroke();g.setLineDash([]);}
export function drawAim(g,m,from){if(!m.pointer.inside)return;const [x1,y1]=toScreen(from.x,from.y);g.strokeStyle='rgba(232,165,116,.55)';g.lineWidth=1.5;g.setLineDash([6,6]);g.beginPath();g.moveTo(x1,y1);g.lineTo(m.pointer.x,m.pointer.y);g.stroke();g.setLineDash([]);g.strokeStyle=COLORS.copper;g.lineWidth=2;g.beginPath();g.arc(m.pointer.x,m.pointer.y,9,0,7);g.moveTo(m.pointer.x-14,m.pointer.y);g.lineTo(m.pointer.x+14,m.pointer.y);g.moveTo(m.pointer.x,m.pointer.y-14);g.lineTo(m.pointer.x,m.pointer.y+14);g.stroke();}

/* ---------- HUD ---------- */
function drawHud(m,g){
 const p=m.play,h=m.hud;
 // Jugada decisiva: el borde de la pantalla late con la presión del momento.
 if(p.decisive&&m.phase!=='intro'){const a=.1+.08*Math.sin(m.t*6)*(p.pressure/100);const vg=g.createRadialGradient(W/2,H/2,H*.35,W/2,H/2,H*.85);vg.addColorStop(0,'rgba(120,20,20,0)');vg.addColorStop(1,`rgba(150,40,30,${Math.max(0,a)})`);g.fillStyle=vg;g.fillRect(0,0,W,H);}
 g.fillStyle='rgba(8,23,40,.82)';roundRect(g,14,12,330,44,10);g.fill();
 g.fillStyle=COLORS.copper;g.font='900 12px "DM Sans",Arial';g.textAlign='left';g.textBaseline='middle';g.fillText(`MIN ${p.minute}'`,28,34);
 g.fillStyle='#fff';g.font='800 15px "DM Sans",Arial';
 const score=p.isHome?`${h.us||'TÚ'} ${p.before.gf}-${p.before.ga} ${h.them||p.rival}`:`${h.them||p.rival} ${p.before.ga}-${p.before.gf} ${h.us||'TÚ'}`;
 g.fillText(score.length>34?score.slice(0,33)+'…':score,86,34);
 // presión y cansancio
 const bar=(x,label,v,color)=>{g.fillStyle='rgba(8,23,40,.82)';roundRect(g,x,12,150,44,10);g.fill();g.fillStyle='#bcd2ea';g.font='800 10px "DM Sans",Arial';g.fillText(label,x+12,25);g.fillStyle='#0a1b2e';roundRect(g,x+12,34,126,8,4);g.fill();g.fillStyle=color;roundRect(g,x+12,34,126*Math.min(1,v),8,4);g.fill();};
 bar(W-334,`PRESIÓN ${p.pressure}`,p.pressure/100,'#e8a574');bar(W-170,`CANSANCIO ${Math.round(p.fatigue*100)}%`,p.fatigue,'#7aa6ff');
 if(m.phase==='play'&&m.timer!=null){const left=Math.max(0,m.timer-m.t);g.fillStyle=left<3?'#f0a08c':'#fff';g.font='900 20px "Barlow Condensed","DM Sans",Arial';g.textAlign='center';g.fillText(left.toFixed(1),W/2,34);}
 if(m.hint&&m.phase==='play'){g.font='700 13px "DM Sans",Arial';const w=g.measureText(m.hint).width+28;g.fillStyle='rgba(8,23,40,.78)';roundRect(g,W/2-w/2,H-44,w,30,15);g.fill();g.fillStyle='#e8f0fa';g.textAlign='center';g.fillText(m.hint,W/2,H-29);}
}
/** Lo que está en juego, en una frase: depende del marcador, del minuto y del tipo de jugada. */
export function stakes(p){
 const d=p.before.gf-p.before.ga,min=p.minute;
 if(p.kind==='attack')return d===0?`Empate en el minuto ${min}: un gol vale la victoria.`:d===-1?`Pierden por uno: el empate está en tus pies.`:d<=-2?`Un gol para soñar con la remontada.`:`Ganan por ${d}: un gol más sentencia el partido.`;
 return d===0?`Empate en el minuto ${min}: si marcan ellos, se pierde todo.`:d===1?`Ganan por la mínima: este gol rival sería el empate.`:d>1?`Ventaja cómoda, pero un gol rival enciende el partido.`:`Si entra, la derrota se hace más grande.`;
}
function drawIntro(m,g){
 const brief=m.phase==='brief';
 g.fillStyle=brief?'rgba(6,16,30,.9)':'rgba(6,16,30,.72)';g.fillRect(0,0,W,H);
 const n=Math.ceil(m.introT/0.8);
 g.textAlign='center';g.textBaseline='middle';
 g.fillStyle=COLORS.copper;g.font='900 14px "DM Sans",Arial';g.fillText((m.play.tag||'').toUpperCase(),W/2,brief?58:H/2-96);
 g.fillStyle='#fff';g.font='900 46px "Barlow Condensed","DM Sans",Arial';g.fillText(m.hud.title||'',W/2,brief?102:H/2-58);
 g.fillStyle='#ffe2c4';g.font='800 17px "DM Sans",Arial';g.fillText(stakes(m.play),W/2,brief?150:H/2-22);
 if(brief){
  // Pantalla de lectura: sin tiempo límite. Tarjetas con objetivo y controles.
  const card=(y,h,label,text,color)=>{g.fillStyle='rgba(19,45,71,.92)';roundRect(g,W/2-350,y,700,h,12);g.fill();g.strokeStyle='rgba(122,166,255,.28)';g.lineWidth=1;g.stroke();
   g.fillStyle=color;g.font='900 11px "DM Sans",Arial';g.textAlign='left';g.fillText(label,W/2-330,y+20);g.textAlign='center';};
  card(184,86,'EL OBJETIVO','',COLORS.copper);g.fillStyle='#e8f0fa';g.font='600 17px "DM Sans",Arial';wrap(g,m.hud.brief||'',W/2,226,660,23);
  card(284,86,'CÓMO SE JUEGA','','#7aa6ff');g.fillStyle='#ffe2c4';g.font='700 16px "DM Sans",Arial';wrap(g,m.hud.controls||'',W/2,326,660,23);
  g.fillStyle='#9fb8d1';g.font='600 13px "DM Sans",Arial';g.fillText(`Dificultad ${Math.round((m.play.difficulty||0)*100)} · Presión ${m.play.pressure} · Cansancio ${Math.round((m.play.fatigue||0)*100)}%  —  tómate el tiempo que necesites`,W/2,396);
  const b=m.btn,hot=m.overBtn?.()&&m.pointer.inside,pulse=.5+.5*Math.sin(performance.now()/380);
  g.fillStyle=hot?'#5b82e8':'#3a64d2';roundRect(g,b.x,b.y,b.w,b.h,12);g.fill();g.strokeStyle=`rgba(232,165,116,${hot?1:.45+.4*pulse})`;g.lineWidth=2.5;g.stroke();
  g.fillStyle='#fff';g.font='900 18px "DM Sans",Arial';g.fillText('▶  ENTENDIDO · EMPEZAR',W/2,b.y+b.h/2+1);
  g.fillStyle='#9fb8d1';g.font='600 12px "DM Sans",Arial';g.fillText('o pulsa Enter / Espacio · después verás la cuenta 3, 2, 1',W/2,b.y+b.h+22);
  return;
 }
 g.fillStyle='#c9d8e8';g.font='600 14px "DM Sans",Arial';wrap(g,m.hud.brief||'',W/2,H/2+4,640,19);
 g.fillStyle='#e8a574';g.font='700 13px "DM Sans",Arial';wrap(g,m.hud.controls||'',W/2,H/2+48,700,18);
 g.fillStyle='#fff';g.font='900 64px "Barlow Condensed","DM Sans",Arial';g.fillText(String(Math.max(1,n)),W/2,H/2+118);
 g.fillStyle='#9fb8d1';g.font='700 13px "DM Sans",Arial';g.fillText('¡Prepárate!',W/2,H/2+170);
}
function drawBanner(g,b){
 g.textAlign='center';g.textBaseline='middle';
 g.fillStyle='rgba(6,16,30,.6)';g.fillRect(0,H/2-58,W,116);
 g.fillStyle=b.good===null?'#fff':b.good?COLORS.gold:'#f0a08c';g.font='900 62px "Barlow Condensed","DM Sans",Arial';g.fillText(b.text,W/2,H/2-10);
 if(b.sub){g.fillStyle='#d3e1f0';g.font='700 15px "DM Sans",Arial';g.fillText(String(b.sub).toUpperCase(),W/2,H/2+34);}
}
export function roundRect(g,x,y,w,h,r){g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath();}
function wrap(g,text,x,y,max,lh){const words=String(text).split(' ');let line='',yy=y;for(const w of words){const t=line?line+' '+w:w;if(g.measureText(t).width>max&&line){g.fillText(line,x,yy);line=w;yy+=lh;}else line=t;}if(line)g.fillText(line,x,yy);}
