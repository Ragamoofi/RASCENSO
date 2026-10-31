/* RASCENSO 3.0 · Jugadas en vista de portería: penal, tiro libre, penal en contra y asedio al arquero.
 * Coordenadas del arco: gx −3.66…3.66 m (ancho), gz 0…2.44 m (alto). */
import { W, H, COLORS, clampN, lerp, roundRect, rivalColor } from './match2d.mjs';

const PX=76.5,CX=W/2,GY=402; // escala del arco en pantalla y línea de gol
const gs=(gx,gz)=>[CX+gx*PX,GY-gz*PX];
const POST=3.66,BAR=2.44;
const rc=m=>m._rc||(m._rc=rivalColor(m.play.rivalId||m.play.rival));

function stadium(g,t){
 const sky=g.createLinearGradient(0,0,0,H);sky.addColorStop(0,'#091628');sky.addColorStop(.42,'#1c3146');sky.addColorStop(.43,'#276346');sky.addColorStop(1,'#173e2c');g.fillStyle=sky;g.fillRect(0,0,W,H);
 // Tribunas, gradas y público: el patrón es estable para evitar parpadeos.
 for(let row=0;row<8;row++){
  const y=35+row*19;g.fillStyle=row%2?'#17283c':'#203247';g.fillRect(0,y,W,18);
  for(let i=0;i<80;i++){const x=i*12+(row%2)*6,h=((i*928371+row*1237)%97)/97;
   g.fillStyle=h>.91?'#d9a077':h>.72?'#8ea6b3':h>.42?'#40586b':'#263a4b';
   g.beginPath();g.arc(x+4,y+5,2.4,0,Math.PI*2);g.fill();g.fillRect(x+1,y+8,6,7);
  }
 }
 g.fillStyle='#0c1c2c';g.fillRect(0,188,W,38);g.fillStyle='#c69268';g.fillRect(0,187,W,2);
 g.textAlign='center';g.textBaseline='middle';g.font='800 12px Arial';
 for(let i=0;i<6;i++){g.fillStyle=i%2?'#ac7a56':'#83abc2';g.fillText(i%2?'RASCENSO  ·  CARRERA':'EL FÚTBOL ES TUYO',80+i*160,207);}
 for(const x of [90,W-90]){const lg=g.createRadialGradient(x,20,2,x,20,150);lg.addColorStop(0,'rgba(255,248,220,.6)');lg.addColorStop(1,'rgba(255,248,220,0)');g.fillStyle=lg;g.fillRect(x-150,0,300,190);}
 const turf=g.createLinearGradient(0,226,0,H);turf.addColorStop(0,'#38704b');turf.addColorStop(1,'#17452c');g.fillStyle=turf;g.fillRect(0,226,W,H-226);
 for(let i=0;i<8;i++){g.fillStyle=i%2?'rgba(218,244,197,.035)':'rgba(0,0,0,.045)';const y0=226+i*i*5.4,y1=226+(i+1)*(i+1)*5.4;g.fillRect(0,y0,W,y1-y0);}
 // Vetas discretas de césped, sin depender del azar del partido.
 g.strokeStyle='rgba(196,230,174,.10)';g.lineWidth=1;g.beginPath();for(let i=0;i<180;i++){const x=(i*137)%W,y=235+(i*71)%(H-235);g.moveTo(x,y);g.lineTo(x+2,y-2);}g.stroke();
 g.strokeStyle='rgba(255,255,255,.68)';g.lineWidth=2;g.beginPath();g.moveTo(40,GY);g.lineTo(W-40,GY);g.moveTo(CX-330,GY);g.lineTo(CX-430,H);g.moveTo(CX+330,GY);g.lineTo(CX+430,H);g.stroke();
 void t;
}
function goalFrame(g,shake=0){
 const [l,t]=gs(-POST,BAR),[r]=gs(POST,0),depth=25;
 // Red con profundidad y postes iluminados.
 g.fillStyle='rgba(7,22,27,.18)';g.beginPath();g.moveTo(l,t);g.lineTo(l+depth,t+16);g.lineTo(r-depth,t+16);g.lineTo(r,t);g.lineTo(r,GY);g.lineTo(l,GY);g.closePath();g.fill();
 g.strokeStyle='rgba(234,245,239,.23)';g.lineWidth=1;
 for(let x=l;x<=r;x+=18){g.beginPath();g.moveTo(x+Math.sin(x)*shake,t);g.lineTo(lerp(x,CX,.075),GY-10);g.stroke();}
 for(let y=t;y<=GY;y+=15){g.beginPath();g.moveTo(l,y);g.quadraticCurveTo(CX,y+7+Math.cos(y)*shake,r,y);g.stroke();}
 g.strokeStyle='rgba(0,0,0,.25)';g.lineWidth=12;g.lineCap='round';g.beginPath();g.moveTo(l+3,GY+3);g.lineTo(l+3,t+3);g.lineTo(r+3,t+3);g.lineTo(r+3,GY+3);g.stroke();
 g.strokeStyle='#e8f0e9';g.lineWidth=8;g.beginPath();g.moveTo(l,GY);g.lineTo(l,t);g.lineTo(r,t);g.lineTo(r,GY);g.stroke();g.strokeStyle='rgba(255,255,255,.8)';g.lineWidth=2;g.beginPath();g.moveTo(l-2,GY);g.lineTo(l-2,t-2);g.lineTo(r,t-2);g.stroke();g.lineCap='butt';
}
/** Geometría compartida por el dibujo y la colisión en la línea de gol. */
export function keeperPose(k){
 const p=clampN(k.p||0,0,1),hx=lerp(k.x,k.dx??k.x,p),hz=lerp(1.25,k.dz??1.25,p);
 return {hx,hz,bx:lerp(k.x,hx,.55),bz:lerp(.95,Math.max(.35,hz*.75),p),p};
}
function drawKeeper(g,k,color,dark){
 const {hx,hz,bx,bz,p}=keeperPose(k), [x,y]=gs(bx,bz), [handX,handY]=gs(hx,hz);
 const dir=Math.sign(hx-k.x)||1;
 g.fillStyle='rgba(0,0,0,.28)';g.beginPath();g.ellipse(x,GY+4,27+20*p,7,0,0,Math.PI*2);g.fill();
 // El guante adelantado está exactamente en el centro usado por la colisión.
 g.strokeStyle=dark;g.lineWidth=11;g.lineCap='round';g.beginPath();g.moveTo(x-7,y+16);g.lineTo(x-15-dir*p*30,y+48);g.moveTo(x+7,y+16);g.lineTo(x+14-dir*p*20,y+48);g.stroke();
 g.strokeStyle=color;g.lineWidth=26;g.beginPath();g.moveTo(x,y+12);g.lineTo(x-dir*p*14,y-20);g.stroke();
 g.fillStyle='#f2d2b6';g.beginPath();g.arc(x-dir*p*18,y-32,11,0,Math.PI*2);g.fill();
 g.strokeStyle=color;g.lineWidth=9;g.beginPath();g.moveTo(x,y-12);g.lineTo(handX,handY);g.moveTo(x,y-12);g.lineTo(x-dir*(25+p*15),y-30);g.stroke();
 g.fillStyle='#fff';g.beginPath();g.arc(handX,handY,8,0,Math.PI*2);g.arc(x-dir*(25+p*15),y-30,6,0,Math.PI*2);g.fill();g.lineCap='butt';
}
export function keeperCovers(k,gx,gz,extra=0){
 const {hx,hz,bx,bz}=keeperPose(k);
 const hand=Math.hypot(gx-hx,gz-hz)<.48+extra;
 const body=Math.hypot((gx-bx)/.42,(gz-bz)/.75)<1+extra;
 return hand||body;
}
const covers=keeperCovers;
function startDive(k,gx,gz,reach){const dx=gx-k.x,dz=gz-1.25,d=Math.hypot(dx,dz);const s=d>reach?reach/d:1;k.dx=k.x+dx*s;k.dz=clampN(1.25+dz*s,.15,2.6);k.diveT=0;k.diving=true;}
function stepDive(k,dt,time=.34){if(k.diving){k.diveT+=dt;k.p=clampN(k.diveT/time,0,1);}}
function drawBallAt(g,x,y,r){g.fillStyle='rgba(0,0,0,.3)';g.beginPath();g.ellipse(x+3,y+r*.9,r,r*.35,0,0,7);g.fill();g.fillStyle='#fbfbf6';g.beginPath();g.arc(x,y,r,0,7);g.fill();g.fillStyle='#1a1a1a';g.beginPath();g.arc(x+r*.25,y-r*.2,r*.33,0,7);g.fill();g.strokeStyle='rgba(0,0,0,.35)';g.lineWidth=1;g.beginPath();g.arc(x,y,r,0,7);g.stroke();}
function crosshair(g,x,y,col=COLORS.copper){g.strokeStyle=col;g.lineWidth=2;g.beginPath();g.arc(x,y,12,0,7);g.moveTo(x-18,y);g.lineTo(x-6,y);g.moveTo(x+6,y);g.lineTo(x+18,y);g.moveTo(x,y-18);g.lineTo(x,y-6);g.moveTo(x,y+6);g.lineTo(x,y+18);g.stroke();}
const toGoal=(sx,sy)=>[(sx-CX)/PX,(GY-sy)/PX];
function powerBar(g,v,zones=true){const x=W-60,y=150,h=230;g.fillStyle='rgba(8,23,40,.8)';roundRect(g,x-8,y-8,32,h+16,8);g.fill();if(zones){g.fillStyle='rgba(240,160,140,.35)';g.fillRect(x,y,16,h*.1);g.fillStyle='rgba(124,221,183,.25)';g.fillRect(x,y+h*.1,16,h*.35);}g.fillStyle=v>.9?'#f0a08c':COLORS.copper;g.fillRect(x,y+h*(1-v),16,h*v);g.strokeStyle='#fff';g.strokeRect(x,y,16,h);}
/** Resultado de un balón que llega al arco. */
function arrive(m,gx,gz,k,{shooter=true}={}){
 if(Math.abs(gx)<POST-.11&&gz<BAR-.06&&gz>=0){
  if(covers(k,gx,gz)){return m.finish(!shooter,shooter?'atajado':'atajada',shooter?.2:.6);}
  return m.finish(shooter,shooter?'gol':'gol rival',shooter?clampN(.5+(Math.abs(gx)/POST)*.3+(gz/BAR)*.2,0,1):.1);
 }
 if(gz>=BAR-.06&&gz<BAR+.18&&Math.abs(gx)<POST)return m.finish(!shooter,shooter?'travesaño':'atajada',.3);
 if(Math.abs(Math.abs(gx)-POST)<.15&&gz<BAR)return m.finish(!shooter,shooter?'poste':'atajada',.3);
 return m.finish(!shooter,shooter?'fuera':'atajada',shooter?.1:.5);
}

/* ---------- Penal (pateador) ---------- */
const penal={
 init(m){m.k={x:0,p:0};m.charge=null;m.ball=null;const mem=m.play.memory||[];m.tendency=mem.length?mem.reduce((a,b)=>a+b,0)/mem.length:.5;m.hint='Apunta · mantén pulsado para cargar · suelta para patear';m.bannerAt=[CX,GY-90];},
 aim(m){const n=m.stats.nerves*42,t=m.t;return [m.pointer.x+Math.sin(t*2.1)*n+Math.sin(t*3.7)*n*.6,m.pointer.y+Math.cos(t*1.7)*n*.7];},
 power(m){if(m.charge==null)return 0;const e=(m.t-m.charge)/1.15;const ph=e%2;return ph<1?ph:2-ph;},
 update(m,dt){
  if(!m.ball){m.k.x=Math.sin(m.t*1.6)*.35;return;}
  const b=m.ball;b.t+=dt;
  if(!m.k.diving&&b.t>=m.keeperDelay){const guess=m.keeperGuess;startDive(m.k,guess[0],guess[1],m.ai.keeperReach+1.55);}
  stepDive(m.k,dt,clampN(.285-m.ai.d*.035,.25,.285));
  if(b.t>=b.T&&!m.result){b.t=b.T;arrive(m,b.gx,b.gz,m.k);}
 },
 down(m){if(m.ball||m.charge!=null)return;m.charge=m.t;},
 up(m){if(m.ball||m.charge==null)return;const pw=this.power(m);const [ax,ay]=this.aim(m);let [gx,gz]=toGoal(ax,ay);
  const err=m.stats.aimNoise*.32;gx+=m.aimNoise(err);gz+=m.aimNoise(err*.6);if(pw>.9)gz+=(pw-.9)*14;if(pw<.35)gz=Math.max(0,gz-.4);
  const T=clampN(.62-pw*.24-(m.stats.power-.5)*.09,.32,.66);m.ball={t:0,T,gx,gz:Math.max(0,gz),pw};m.charge=null;m.hint='';
  // El arquero elige lado: tus penales anteriores y su lectura pesan en la decisión.
  const side=gx<0?-1:1,bias=m.tendency<.5?-1:1;
  const readP=clampN(.25+m.ai.d*.30+(1-pw)*.12,.25,.68);
  const stud=clampN(Math.abs(m.tendency-.5)*1.2,0,.55);
  let dir=m.rand()<readP?side:(m.rand()<.5+stud*.5?bias:-bias);
  if(Math.abs(gx)<.65&&m.rand()<.5)dir=0;else if(m.rand()<.08)dir=0;
  const accuracy=.35+(1-m.ai.d)*.65;
  m.keeperGuess=[dir===0?0:dir*clampN(Math.abs(gx)+(m.rand()-.5)*accuracy,1.0,3.5),clampN(gz+(m.rand()-.5)*(1.1+(1-m.ai.d)*.9),.25,2.3)];
  m.keeperDelay=clampN(m.ai.keeperReaction*(.65+m.rand()*.7),.10,.42);
  m.report={dir:(gx+POST)/(2*POST)};},
 draw(m,g){stadium(g,m.t);goalFrame(g,m.result?.success?4:0);drawKeeper(g,m.k,COLORS.keeperThem,'#9a7d12');
  if(m.ball){const b=m.ball,t=clampN(b.t/b.T,0,1),e=1-Math.pow(1-t,2);const [tx,ty]=gs(b.gx,b.gz);const x=lerp(CX,tx,e),y=lerp(H-30,ty,e)-Math.sin(t*Math.PI)*30*b.pw;drawBallAt(g,x,y,lerp(22,9,e));}
  else{drawBallAt(g,CX,H-30,22);const [ax,ay]=this.aim(m);crosshair(g,ax,ay);powerBar(g,this.power(m));}
 }
};
// La dirección del penal se guarda para que los arqueros futuros estudien tu tendencia.
const finishPenal=penal.update;penal.update=function(m,dt){finishPenal.call(this,m,dt);if(m.result&&m.report&&m.result.dir==null)m.result.dir=m.report.dir;};

/* ---------- Tiro libre ---------- */
const tiro_libre={
 init(m){m.k={x:.9,p:0};m.charge=null;m.wall=[-1.35,-.45,.45,1.35].map(x=>({x:x+(m.rand()-.5)*.2}));m.wallJump=0;m.hint='Apunta · mantén para cargar · arrastra a un lado mientras cargas para dar efecto';m.bannerAt=[CX,GY-90];},
 power:penal.power,
 aim(m){const n=m.stats.nerves*30;return [m.pointer.x+Math.sin(m.t*2.3)*n,m.pointer.y+Math.cos(m.t*1.9)*n*.6];},
 update(m,dt){
  if(!m.ball){m.k.x=.9+Math.sin(m.t)*.25;return;}
  const b=m.ball;b.t+=dt;stepDive(m.k,dt);m.wallJump=Math.min(1,m.wallJump+dt*4);
  // Paso por la barrera (mitad del recorrido): altura y posición lateral del balón.
  if(!b.wallChecked&&b.t>=b.T*.48){b.wallChecked=true;const wx=b.gx*.45-b.curl*.6,wz=b.gz*.55+b.pw*1.6;const inWall=m.wall.some(w=>Math.abs(w.x-wx)<.42);if(inWall&&wz<1.85+m.wallJump*.3&&!m.result){m.bannerAt=[CX+wx*PX*.6,300];return m.finish(false,'barrera',.15);}}
  if(!m.k.diving&&b.t>=b.T*.42+m.ai.keeperReaction*.4){startDive(m.k,b.gx+(m.rand()-.5)*(1.4-m.ai.d),b.gz,m.ai.keeperReach+1.1);}
  if(b.t>=b.T&&!m.result)arrive(m,b.gx,b.gz,m.k);
 },
 down(m){if(m.ball||m.charge!=null)return;m.charge=m.t;m.chargeX=m.pointer.x;},
 up(m){if(m.ball||m.charge==null)return;const pw=this.power(m);const [ax,ay]=this.aim(m);let [gx,gz]=toGoal(ax,ay);
  const curl=clampN((m.pointer.x-m.chargeX)/90,-1.5,1.5)*(.5+m.stats.skills*.6);const err=m.stats.aimNoise*.36;gx+=m.aimNoise(err);gz+=m.aimNoise(err*.6);if(pw>.88)gz+=(pw-.88)*12;
  m.ball={t:0,T:clampN(1.05-pw*.3,.72,1.05),gx,gz:Math.max(0,gz),pw,curl};m.charge=null;m.hint='';},
 draw(m,g){stadium(g,m.t);goalFrame(g,m.result?.success?4:0);drawKeeper(g,m.k,COLORS.keeperThem,'#9a7d12');
  // barrera
  // La barrera está más cerca de la cámara que el arquero: se dibuja más grande.
  const wy=392,jump=m.wallJump*22;for(const w of m.wall){const x=CX+w.x*PX*.6;g.fillStyle=rc(m).dark;roundRect(g,x-20,wy-66-jump,40,80,11);g.fill();g.fillStyle=rc(m).body;roundRect(g,x-17,wy-63-jump,34,46,10);g.fill();g.fillStyle='#f2d2b6';g.beginPath();g.arc(x,wy-78-jump,13,0,7);g.fill();g.fillStyle='rgba(0,0,0,.25)';g.beginPath();g.ellipse(x,wy+16,22,6,0,0,7);g.fill();}
  if(m.ball){const b=m.ball,t=clampN(b.t/b.T,0,1),e=1-Math.pow(1-t,1.6);const [tx,ty]=gs(b.gx,b.gz);const bow=Math.sin(t*Math.PI)*(-b.curl*70);const x=lerp(CX,tx,e)+bow,y=lerp(H-34,ty,e)-Math.sin(t*Math.PI)*(70+b.pw*40);drawBallAt(g,x,y,lerp(18,9,e));}
  else{drawBallAt(g,CX,H-34,18);const [ax,ay]=this.aim(m);crosshair(g,ax,ay);powerBar(g,this.power(m));if(m.charge!=null){const c=clampN((m.pointer.x-m.chargeX)/90,-1.5,1.5);g.strokeStyle=COLORS.copper;g.lineWidth=3;g.beginPath();g.moveTo(CX,H-60);g.quadraticCurveTo(CX-c*90,H-150,CX,H-220);g.stroke();}}
 }
};

/* ---------- Penal en contra (arquero) ---------- */
const penal_atajado={
 init(m){m.k={x:0,p:0};m.kickT=1.5+m.rand()*.6;m.side=m.rand()<.5?-1:1;m.honest=m.rand()>m.ai.d*.42;m.target=[m.side*(1.4+m.rand()*1.9),.25+m.rand()*1.8];m.ball=null;m.hint='Elige zona con el ratón · clic para lanzarte (si te adelantas, te leen)';m.bannerAt=[CX,GY-90];},
 update(m,dt){
  stepDive(m.k,dt,.3-m.stats.reflex*.08);
  if(!m.k.diving){const [gx]=toGoal(m.pointer.x,m.pointer.y);m.k.x+=clampN(clampN(gx,-.6,.6)-m.k.x,-1,1)*dt*2;}
  if(!m.ball&&m.t>=m.kickT){
   // Si el arquero ya se tiró con anticipación, el pateador cambia de lado.
   if(m.k.diving&&m.k.diveAt<m.kickT-.12&&m.rand()<.45+m.ai.d*.5){m.target=[-Math.sign(m.k.dx||1)*(1.3+m.rand()*1.8),.3+m.rand()*1.4];m.say('TE LEYÓ',false);}
   m.ball={t:0,T:.42+(1-m.ai.shooterSkill)*.12};}
  if(m.ball){m.ball.t+=dt;if(m.ball.t>=m.ball.T&&!m.result)arrive(m,m.target[0],m.target[1],m.k,{shooter:false});}
 },
 down(m){if(m.k.diving)return;const [gx,gz]=toGoal(m.pointer.x,m.pointer.y);m.k.diveAt=m.t;startDive(m.k,gx,gz,1.5+m.stats.reach*.9);m.hint='';},
 draw(m,g){stadium(g,m.t);goalFrame(g,m.result&&!m.result.success?4:0);
  // pateador: carrera con un indicio de hacia dónde abre la cadera
  if(!m.ball){const p=clampN(m.t/m.kickT,0,1),x=CX+lerp(-160*m.side*(m.honest?-1:1),-30*m.side,p),y=lerp(H+40,H-40,p),s=lerp(1.6,1.25,p);
   g.save();g.translate(x,y);g.scale(s,s);g.fillStyle=rc(m).dark;roundRect(g,-16,-60,32,64,10);g.fill();g.fillStyle=rc(m).body;roundRect(g,-14,-58,28,38,9);g.fill();g.fillStyle='#f2d2b6';g.beginPath();g.arc(0,-70,12,0,7);g.fill();
   const hip=(m.honest?m.side:-m.side)*(p>.55?1:0);g.strokeStyle='rgba(232,165,116,.8)';g.lineWidth=3;g.beginPath();g.moveTo(-18,-20);g.lineTo(18,-20+hip*8);g.stroke();g.restore();
   drawBallAt(g,CX,H-36,20);}
  drawKeeper(g,m.k,COLORS.keeperUs,'#127a4c');
  if(m.ball){const t=clampN(m.ball.t/m.ball.T,0,1);const [tx,ty]=gs(m.target[0],m.target[1]);drawBallAt(g,lerp(CX,tx,t),lerp(H-36,ty,t),lerp(20,10,t));}
  if(!m.k.diving)crosshair(g,m.pointer.x,m.pointer.y,'#7cddb7');
 }
};

/* ---------- Asedio: tres remates seguidos (arquero) ---------- */
const reflejos={
 init(m){m.k={x:0,p:0};m.shots=0;m.need=3;m.next(m);m.hint='Muévete con el ratón · clic para estirarte hacia el puntero';m.bannerAt=[CX,GY-90];},
 update(m,dt){
  const k=m.k;stepDive(k,dt,.28-m.stats.reflex*.07);
  if(k.diving&&k.p>=1&&m.t-k.diveAt>.7){k.diving=false;k.p=0;k.x=k.dx;k.dx=k.x;k.dz=1.25;}
  if(!k.diving){const [gx]=toGoal(m.pointer.x,m.pointer.y);const sp=2.4+m.stats.speed*.25;k.x+=clampN(clampN(gx,-3.2,3.2)-k.x,-sp*dt,sp*dt);}
  const s=m.shot;
  if(!s.ball&&m.t>=s.at){s.ball={t:0,T:.45+(1-m.ai.shooterSkill)*.2};}
  if(s.ball){s.ball.t+=dt;if(s.ball.t>=s.ball.T){
   const [gx,gz]=s.target;const onTarget=Math.abs(gx)<POST-.11&&gz<BAR-.06;
   if(onTarget&&!covers(k,gx,gz,.05)){m.bannerAt=gs(gx,gz);return m.finish(false,'gol rival',.1);}
   m.shots++;m.say(onTarget?'¡ATAJADA!':'¡AFUERA!',true);
   if(m.shots>=m.need){return m.finish(true,'atajada',.6+m.stats.reflex*.3);}
   this.next(m,onTarget&&m.rand()<.5);}}
 },
 next(m,rebound=false){const from=[-260,0,260][Math.floor(m.rand()*3)];const off=m.rand()<.16;m.shot={from:rebound?m.shot?.from??0:from,at:m.t+(rebound?.45:.9+m.rand()*.6),target:[off?(m.rand()<.5?-1:1)*(POST+.6):(m.rand()*2-1)*(POST-.4),.2+m.rand()*1.9],ball:null,rebound};},
 down(m){if(m.k.diving)return;const [gx,gz]=toGoal(m.pointer.x,m.pointer.y);m.k.diveAt=m.t;startDive(m.k,gx,gz,1.4+m.stats.reach*.9);},
 draw(m,g){stadium(g,m.t);goalFrame(g);const s=m.shot;
  const sx=CX+s.from,sy=H-46;g.fillStyle=rc(m).dark;roundRect(g,sx-16,sy-60,32,64,10);g.fill();g.fillStyle=rc(m).body;roundRect(g,sx-14,sy-58,28,38,9);g.fill();g.fillStyle='#f2d2b6';g.beginPath();g.arc(sx,sy-70,12,0,7);g.fill();
  if(!s.ball){const w=clampN((s.at-m.t)/1,0,1);g.strokeStyle=`rgba(240,160,140,${1-w})`;g.lineWidth=3;g.beginPath();g.arc(sx,sy-20,28+w*20,0,7);g.stroke();drawBallAt(g,sx+18,sy-4,16);}
  drawKeeper(g,m.k,COLORS.keeperUs,'#127a4c');
  if(s.ball){const t=clampN(s.ball.t/s.ball.T,0,1);const [tx,ty]=gs(s.target[0],s.target[1]);drawBallAt(g,lerp(sx+18,tx,t),lerp(sy-4,ty,t),lerp(16,10,t));}
  g.fillStyle='rgba(8,23,40,.8)';roundRect(g,CX-70,66,140,30,15);g.fill();g.fillStyle='#fff';g.font='800 13px "DM Sans",Arial';g.textAlign='center';g.textBaseline='middle';g.fillText(`REMATES ${m.shots}/${m.need}`,CX,81);
  if(!m.k.diving)crosshair(g,m.pointer.x,m.pointer.y,'#7cddb7');
 }
};
reflejos.init=function(m){m.k={x:0,p:0};m.shots=0;m.need=3;m.next=(mm,r)=>reflejos.next(mm,r);reflejos.next(m);m.hint='Muévete con el ratón · clic para estirarte hacia el puntero';m.bannerAt=[CX,GY-90];};

export const GOAL_SCENES={penal,tiro_libre,penal_atajado,reflejos};
