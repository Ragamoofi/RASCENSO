/* RASCENSO 3.0 · Jugadas de cancha (vista cenital, arco a la derecha).
 * Cada escena: init / update / draw / down / up / key. Terminan con m.finish(éxito, detalle, calidad, extra).
 * Los atributos (m.stats) y la dificultad del rival (m.ai) cambian velocidades, alcances, ruido y tiempos de reacción. */
import { FIELD, COLORS, toScreen, dist, clampN, makeBall, makePlayer, moveToward, keepInField, kick, loft, stepBall, goalCrossing, inGoalMouth, segDist, drawPitch, drawPlayer, drawBall, drawRing, drawLine, drawAim, rivalColor } from './match2d.mjs';

const G={x:FIELD.goalX,y:FIELD.goalY};
const rc=m=>m._rc||(m._rc=rivalColor(m.play.rivalId||m.play.rival));
const them=(m,p,o={})=>drawPlayer(m.g,p,{color:rc(m).body,dark:rc(m).dark,...o});
const us=(m,p,o={})=>drawPlayer(m.g,p,{color:COLORS.us,dark:COLORS.usDark,...o});
const mate=(m,p,o={})=>drawPlayer(m.g,p,{color:COLORS.ally,dark:'#22448f',...o});
const keeper=(m,k,ours=false)=>drawPlayer(m.g,k,{color:ours?COLORS.keeperUs:COLORS.keeperThem,dark:ours?'#127a4c':'#9a7d12',highlight:ours});
const rnd=(m,a,b)=>a+m.rand()*(b-a);
function setBanner(m,x,y){m.bannerAt=toScreen(x,y);}
/** Distancia del rival más cercano a la línea de pase; información visible, no una garantía. */
export function passLaneSpace(from,to,defenders){return defenders.length?Math.min(...defenders.map(d=>segDist(d,from,to))):Infinity;}
function drawPassOption(g,m,from,teammates,defenders){
 if(!m.pointer.inside||!from||!teammates.length)return;
 const target=[...teammates].sort((a,b)=>Math.hypot(a.x-m.pointer.wx,a.y-m.pointer.wy)-Math.hypot(b.x-m.pointer.wx,b.y-m.pointer.wy))[0];
 if(Math.hypot(target.x-m.pointer.wx,target.y-m.pointer.wy)>3)return;
 const space=passLaneSpace(from,target,defenders),color=space<1.2?'#f18783':space<2.5?'#f2be79':'#85dfb6';
 drawLine(g,from,target,color,{dash:[5,5],width:2});drawRing(g,target.x,target.y,1.05,color,{width:2});
}


/* ---------- Arquero rival y vuelo de remates ---------- */
function makeKeeper(m){return makePlayer(FIELD.goalX-.8,FIELD.goalY,{num:'1',r:.5,speed:m.ai.keeperSpeed,reach:m.ai.keeperReach});}
/** Posición de cobertura: sobre la línea balón→centro del arco, más adelantado cuanto más cerca está el atacante. */
function keeperCover(m,k,ball,dt,{rush=true}={}){
 const d=dist(ball,G),out=rush?clampN(lerpRange(d,18,5,.8,3.1),.6,3.2):.9;
 const dx=ball.x-G.x,dy=ball.y-G.y,l=Math.hypot(dx,dy)||1;
 moveToward(k,G.x+dx/l*out,G.y+dy/l*out*.9,k.speed,dt);
}
function lerpRange(v,a,b,x,y){const t=clampN((v-a)/(b-a),0,1);return x+(y-x)*t;}
/** Remate a portería: puntería (ruido por atributos, presión y cansancio) + potencia. */
function shoot(m,ball,from,ty,{noise=1,speed=null,lift=null,curl=0}={}){
 const st=m.stats,d=Math.hypot(G.x-from.x,ty-from.y);
 const err=m.aimNoise(st.aimNoise*noise*clampN(d/14,.5,1.6));
 const target=clampN(ty+err,FIELD.goalY-6,FIELD.goalY+6);
 const sp=speed??(19+st.power*11);
 kick(ball,G.x+.5,target,sp,lift??Math.max(0,m.rand()*1.8*(st.aimNoise*.6)+(d>16?1.4:.4)),curl);
 m.shotAt=m.t;m.shotTarget=target;
}
/** Colisión sobre el recorrido anterior a la línea de gol, con altura interpolada. */
export function sweptKeeperContact(previous,ball,k,reach){
 const dx=ball.x-previous.x,dy=ball.y-previous.y,len=dx*dx+dy*dy;
 const end=dx>0&&ball.x>FIELD.goalX?clampN((FIELD.goalX-previous.x)/dx,0,1):1;
 const t=len?clampN(((k.x-previous.x)*dx+(k.y-previous.y)*dy)/len,0,end):0;
 const x=previous.x+dx*t,y=previous.y+dy*t,z=previous.z+(ball.z-previous.z)*t;
 return z<2.4&&Math.hypot(x-k.x,y-k.y)<reach;
}
/** Avanza un remate en vuelo: reacción y estirada del arquero, palo, gol o fuera. */
function shotFlight(m,ball,k,dt,{reaction=0,credit=null}={}){
 const previous={x:ball.x,y:ball.y,z:ball.z};
 stepBall(ball,dt);
 const cross=goalCrossing(ball);
 // Estirada: el arquero se lanza hacia la línea del remate (no hacia el arco), con alcance limitado.
 if(k&&m.t-m.shotAt>m.ai.keeperReaction+reaction&&cross){if(!k.diving){const t=Math.max(.05,(k.x-ball.x)/Math.max(1,ball.vx));k.diveTo={x:k.x,y:ball.y+ball.vy*t+(m.rand()*2-1)*(4.2-m.ai.d*1.8)};}moveToward(k,k.diveTo.x,k.diveTo.y,k.speed*1.15,dt);k.diving=true;}
 if(k&&sweptKeeperContact(previous,ball,k,k.reach*(k.diving?1.15:.85))&&!m.result){ball.vx*=-.35;ball.vy=(m.rand()-.5)*12;ball.vz=3;setBanner(m,k.x,k.y);return m.finish(false,'atajado',.2);}
 if(ball.x>=FIELD.goalX&&!m.result){
  const fraction=clampN((FIELD.goalX-previous.x)/(ball.x-previous.x||1),0,1);
  const crossingY=previous.y+(ball.y-previous.y)*fraction,crossingZ=previous.z+(ball.z-previous.z)*fraction;
  const dy=Math.abs(crossingY-FIELD.goalY);setBanner(m,FIELD.goalX,crossingY);
  if(inGoalMouth(crossingY,crossingZ)){const margin=k?clampN((dist(ball,k)-k.reach)/3,0,1):1;ball.vx=1;ball.vy=0;return m.finish(true,credit==='assist'?'asistencia':'gol',.5+margin*.5,credit?{credit}:{});}
  if(crossingZ>=FIELD.bar-.05&&crossingZ<FIELD.bar+.3&&dy<FIELD.post)return m.finish(false,'travesaño',.3);
  if(Math.abs(dy-FIELD.post)<.3)return m.finish(false,'poste',.35);
  return m.finish(false,'fuera',.1);
 }
 if(Math.hypot(ball.vx,ball.vy)<.6&&ball.z<=0&&!m.result)return m.finish(false,'atajado',.1);
}
/** El receptor define en pantalla: la calidad y el espacio afectan su remate. */
function receiverShot(m,receiver,quality,space){
 m.ball.owner=receiver;
 // Elegir el palo con más espacio en el cruce con el arquero.
 const fraction=clampN((m.k.x-receiver.x)/Math.max(.5,FIELD.goalX-receiver.x),0,1);
 const left=FIELD.goalY-(FIELD.post-.6),right=FIELD.goalY+(FIELD.post-.6);
 const separation=target=>Math.abs(receiver.y+(target-receiver.y)*fraction-m.k.y);
 const best=separation(left)>separation(right)?left:right;
 const error=clampN((1-clampN(quality,0,1))*1.3+clampN(2-space,0,2)*.4+m.ai.d*.2,0,1.2);
 const target=best+m.aimNoise(error);
 kick(m.ball,FIELD.goalX+.5,target,21+quality*5,Math.max(0,.4+m.rand()*.8));
 m.shotAt=m.t;m.finalizing=true;m.hint='¡Tu compañero define!';
}
const timeUp=(m)=>m.timer!=null&&m.t>=m.timer&&!m.result;

/* ======================================================================
   DELANTEROS
   ====================================================================== */
const mano_a_mano={
 init(m){m.timer=9;m.ball=makeBall(0,0);m.me=makePlayer(29,rnd(m,10,19),{num:'9',team:'us'});m.ball.owner=m.me;
  m.def=makePlayer(m.me.x-4.5,m.me.y+rnd(m,-3,3),{num:'4',speed:m.ai.defSpeed*.98});m.k=makeKeeper(m);m.hint='Conduce · clic izquierdo potente o derecho colocado';},
 update(m,dt){
  if(m.ball.owner===m.me){m.steer(m.me,m.stats.speed,dt);if(m.me.x>FIELD.goalX-.6)m.me.x=FIELD.goalX-.6;
   moveToward(m.def,m.me.x-.3,m.me.y,m.def.speed,dt);
   keeperCover(m,m.k,m.me,dt);
   if(dist(m.def,m.me)<.85&&!m.result){m.ball.owner=m.def;setBanner(m,m.me.x,m.me.y);return m.finish(false,'bloqueado',.2);}
   // El arquero se lanza a los pies si llega: el control y la gambeta pueden evitarlo.
   if(m.k.stun<=0&&dist(m.k,m.me)<1.25&&m.me.x<m.k.x+.2&&!m.result){const dodge=m.stats.control*.6+m.stats.skills*.3-m.ai.d*.35;if(m.rand()>clampN(dodge,.1,.85)){setBanner(m,m.k.x,m.k.y);return m.finish(false,'atajado',.2);}m.k.stun=.9;m.hint='¡Arquero superado! Define';}
   if(timeUp(m))return m.finish(false,'tiempo',.1);
  }else shotFlight(m,m.ball,m.k,dt);
 },
 down(m,button){if(m.ball.owner!==m.me)return;const placed=button==='alt';shoot(m,m.ball,m.me,m.pointer.wy,placed?{noise:.65,speed:16+m.stats.power*8}:{noise:1});m.hint='';},
 draw(m,g){drawPitch(g);them(m,m.def);keeper(m,m.k);us(m,m.me,{highlight:true});drawBall(g,m.ball);if(m.ball.owner===m.me)drawAim(g,m,m.me);}
};

/* Centro aéreo compartido por cabezazo (ataque), despeje (defensa) y salida aérea (arquero). */
function setupCross(m,{landing,time=1.35,peak=3,from=[41,1.5],contact=1.9}){
 m.ball=makeBall(...from);m.ground=landing;loft(m.ball,landing.x,landing.y,time,peak);m.crossT=time;
 // Punto de contacto: donde la pelota baja a la altura de la cabeza (o de las manos), antes de tocar el suelo.
 const vz=peak*4/time,g=peak*8/(time*time),disc=Math.max(0,vz*vz-2*g*contact),t=(vz+Math.sqrt(disc))/g;
 m.landing={x:from[0]+(landing.x-from[0])*t/time,y:from[1]+(landing.y-from[1])*t/time};m.contactT=t;
}
const cabezazo={
 init(m){m.timer=4.5;setupCross(m,{landing:{x:rnd(m,41.5,47.5),y:rnd(m,11,18.5)},time:rnd(m,1.3,1.55)});
  m.me=makePlayer(37.5,rnd(m,13,19),{num:'9',team:'us'});m.def=makePlayer(m.me.x+1.2,m.me.y-.8,{num:'5',speed:m.ai.defSpeed*.92});m.k=makeKeeper(m);m.cross=makePlayer(41,1.2,{num:'7',team:'us'});m.headed=false;m.hint='Ve a la sombra de la pelota · clic para cabecear hacia el puntero';},
 update(m,dt){
  if(!m.headed){
   m.steer(m.me,m.stats.sprint,dt);stepBall(m.ball,dt);
   if(m.t>m.ai.defReaction)moveToward(m.def,m.landing.x-.4,m.landing.y,m.def.speed,dt);
   moveToward(m.k,G.x-.9,clampN(m.ball.y,FIELD.goalY-2.4,FIELD.goalY+2.4),m.k.speed,dt);
   if(dist(m.def,m.ball)<.9&&m.ball.z<2.7&&m.ball.z>.4&&dist(m.def,m.ball)<dist(m.me,m.ball)&&!m.result){setBanner(m,m.def.x,m.def.y);return m.finish(false,'despeje',.2);}
   if(m.ball.z<=0&&m.t>.3&&!m.result)return m.finish(false,'fuera',.1);
  }else shotFlight(m,m.ball,m.k,dt,{reaction:.05});
 },
 down(m){
  if(m.headed)return;const d=dist(m.me,m.ball),top=2.3+m.stats.jump*.9;
  if(d>1.6||m.ball.z>top+.4||m.ball.z<.4){m.say('¡SALTO A DESTIEMPO!',false);m.me.stun=.35;return;}
  const timing=clampN(1-Math.abs(m.ball.z-1.9)/1.8,0,1)*clampN(1.15-d/1.8,0,1);
  m.headed=true;m.ball.z=Math.max(m.ball.z,1.6);shoot(m,m.ball,m.me,m.pointer.wy,{noise:1.1+(1-timing)*1.2,speed:10+m.stats.jump*6+timing*4,lift:-1.6+timing*.6});m.hint='';
 },
 draw(m,g){drawPitch(g);drawRing(g,m.landing.x,m.landing.y,.65,dist(m.me,m.ball)<1.6&&m.ball.z>.8&&m.ball.z<2.6?'#ffe3a8':'rgba(255,255,255,.28)',{dash:[3,4]});mate(m,m.cross);them(m,m.def);keeper(m,m.k);us(m,m.me,{highlight:true});drawBall(g,m.ball);if(!m.headed)drawAim(g,m,m.me);}
};

const remate={
 init(m){m.timer=4;m.me=makePlayer(rnd(m,36,38.5),rnd(m,12,17),{num:'9',team:'us'});m.passer=makePlayer(49.5,rnd(m,2.5,4),{num:'11',team:'us'});
  m.ball=makeBall(m.passer.x,m.passer.y+.6);const aim={x:m.me.x+rnd(m,-.6,.6),y:m.me.y+rnd(m,-.6,.6)};kick(m.ball,aim.x,aim.y,Math.hypot(aim.x-m.ball.x,aim.y-m.ball.y)*1.15+5+m.ai.d*3,0);
  m.def=makePlayer(44,rnd(m,13,17),{num:'3',speed:m.ai.defSpeed*.9});m.k=makeKeeper(m);m.struck=false;m.ringR=1.25;m.hint='Acomódate y apunta al arco · clic cuando la pelota cruce tu anillo';},
 update(m,dt){
  if(!m.struck){stepBall(m.ball,dt);m.steer(m.me,m.stats.speed*.45,dt,[33,44,8,21]);moveToward(m.def,(m.me.x+G.x)/2,(m.me.y+G.y)/2,m.def.speed*.6,dt);keeperCover(m,m.k,m.me,dt,{rush:false});
   if((m.ball.x<m.me.x-1.6||Math.hypot(m.ball.vx,m.ball.vy)<.5)&&!m.result)return m.finish(false,'perdida',.1);}
  else{if(segDist(m.def,{x:m.ball.x-m.ball.vx*.03,y:m.ball.y-m.ball.vy*.03},m.ball)<.55&&m.ball.z<1.4&&!m.result){setBanner(m,m.def.x,m.def.y);return m.finish(false,'bloqueado',.2);}shotFlight(m,m.ball,m.k,dt,{reaction:.1});}
 },
 down(m){if(m.struck)return;const d=dist(m.me,m.ball);if(d>m.ringR*1.8)return;if(d>m.ringR){m.say('¡AIRE!',false);return m.finish(false,'perdida',.1);}
  const timing=clampN(1-Math.abs(d-.35)/m.ringR,0,1);m.struck=true;m.ball.owner=null;m.ball.x=m.me.x+.3;m.ball.y=m.me.y;shoot(m,m.ball,m.me,m.pointer.wy,{noise:.75+(1-timing)*1.2+(1-m.stats.weak)*.25,speed:17+m.stats.power*9+timing*5});m.hint='';},
 draw(m,g){drawPitch(g);drawRing(g,m.me.x,m.me.y,m.ringR,'rgba(232,165,116,.7)',{dash:[5,5],fill:dist(m.me,m.ball)<m.ringR?'rgba(232,165,116,.18)':null});mate(m,m.passer);them(m,m.def);keeper(m,m.k);us(m,m.me,{highlight:true});drawBall(g,m.ball);if(!m.struck)drawAim(g,m,m.me);}
};

/* ======================================================================
   EXTREMOS
   ====================================================================== */
/** Defensor que se interpone entre el atacante y el arco y busca la pelota cuando queda a su alcance. */
function marker(m,d,att,dt,{gap=1.6,lunge=1.15}={}){
 if(d.stun>0)return moveToward(d,d.x,d.y,0,dt);
 const dx=G.x-att.x,dy=G.y-att.y,l=Math.hypot(dx,dy)||1;
 moveToward(d,att.x+dx/l*gap,att.y+dy/l*gap,d.speed,dt);
 if(dist(d,att)<lunge){d.reach=(d.reach||0)+dt;}else d.reach=0;
 return d.reach>m.ai.defReaction+.25;
}
/** Duelo: el amague recién hecho o una gambeta rápida pueden hacer pasar de largo al defensor. */
function duel(m,d,att){
 const recent=m.t-(m.lastFeint??-9)<.5,fast=Math.hypot(att.vx||0,att.vy||0)>m.stats.speed*.7;
 const p=clampN(.3+m.stats.feint*.35+(recent?.3:0)+(fast?.08:0)-m.ai.feintResist*.35,.1,.9);
 if(m.rand()<p){d.stun=1.15;d.reach=0;m.say(recent?'¡AMAGUE!':'¡SE LA SACÓ!',true);return true;}
 return false;
}
const diagonal={
 init(m){m.timer=9;m.ball=makeBall(0,0);m.me=makePlayer(33,rnd(m,3.5,6),{num:'11',team:'us'});m.ball.owner=m.me;m.fb=makePlayer(37,8,{num:'2',speed:m.ai.defSpeed*.92});m.k=makeKeeper(m);m.hint='Rompe hacia adentro · clic en el arco para rematar con rosca (Espacio: amague)';},
 update(m,dt){
  if(m.ball.owner===m.me){m.steer(m.me,m.stats.speed,dt);keeperCover(m,m.k,m.me,dt,{rush:false});
   if(marker(m,m.fb,m.me,dt)&&!m.result){if(!duel(m,m.fb,m.me)){setBanner(m,m.me.x,m.me.y);return m.finish(false,'robo',.15);}}
   if(timeUp(m))return m.finish(false,'tiempo',.1);}
  else shotFlight(m,m.ball,m.k,dt,{reaction:Math.abs(m.ball.curl)>2?.08:0});
 },
 key(m,code,down){if(down&&code==='Space')feint(m);},
 // La rosca curva el balón hacia el palo lejano: desde arriba (y pequeña) dobla hacia y mayor, y viceversa.
 down(m,b){if(b==='alt')return feint(m);if(m.ball.owner!==m.me)return;const curl=(m.me.y<FIELD.goalY?1:-1)*(1.5+m.stats.skills*3);shoot(m,m.ball,m.me,m.pointer.wy,{noise:1,curl});m.hint='';},
 draw(m,g){drawPitch(g);if(m.t-(m.lastFeint??-9)<.35)drawRing(g,m.me.x,m.me.y,1.15,COLORS.copper,{dash:[4,4]});them(m,m.fb,{ghost:m.fb.stun>0});keeper(m,m.k);us(m,m.me,{highlight:true});drawBall(g,m.ball);if(m.ball.owner===m.me)drawAim(g,m,m.me);}
};
/** El amague premia ejecutarlo cerca del marcador y permite elegir salida. */
export function feintImpact(distance,skill,resistance){
 const proximity=clampN(1-distance/3,0,1);
 return skill*.7+proximity*.4-resistance*.45;
}
function feint(m){
 if(m.ball?.owner!==m.me||m.t-(m.lastFeint??-9)<.7)return;m.lastFeint=m.t;
 const opponent=m.fb||m.defs?.[0],distance=opponent?dist(opponent,m.me):Infinity;
 const keys=m.keys||new Set(),vertical=Number(keys.has('KeyS')||keys.has('ArrowDown'))-Number(keys.has('KeyW')||keys.has('ArrowUp'));
 const pointerDelta=m.pointer.inside?m.pointer.wy-m.me.y:0;
 const side=vertical|| (Math.abs(pointerDelta)>.4?Math.sign(pointerDelta):(m.me.y<FIELD.goalY?1:-1));
 m.me.y+=side*1.1*(.6+m.stats.control*.6);m.me.x+=.4;keepInField(m.me);
 if(opponent&&opponent.stun<=0&&distance<3&&feintImpact(distance,m.stats.feint,m.ai.feintResist)>=.24){
  opponent.stun=.65+m.stats.feint*.8;opponent.reach=0;m.hint='¡Marcador engañado! Acelera al espacio';
 }else m.hint='Amague: acércate al marcador y elige el lado';
}

/** Compañeros que atacan el área con un marcador que se despega o se pega según el tiempo. */
function runners(m,spots){
 return spots.map((s,i)=>{const t=makePlayer(s[0]-6,s[1]+rnd(m,-2,2),{num:['9','10','8'][i],team:'us'});t.goal={x:s[0],y:s[1]};t.phase=m.rand()*6;
  const d=makePlayer(t.x+.6,t.y+.6,{num:['4','6','3'][i],speed:m.ai.defSpeed*.82});return {t,d};});
}
function moveRunners(m,list,dt){for(const {t,d} of list){moveToward(t,t.goal.x+Math.sin(m.t*1.4+t.phase)*1.4,t.goal.y+Math.cos(m.t*1.1+t.phase)*1.1,5.2,dt);const sep=.6+(Math.sin(m.t*1.7+t.phase)+1)*.9*(1-m.ai.d*.5);moveToward(d,t.x+sep*.7,t.y+sep*.5*(t.phase>3?1:-1),d.speed,dt);}}
/** Resuelve la llegada de un centro: compañero, defensor o arquero, el que llegue primero. */
function crossArrival(m,list,k,point,quality){
 // El compañero mejor ubicado es el que más ventaja saca a su marcador en el punto de caída.
 let best=null;for(const r of list){const dt=dist(r.t,point),dd=dist(r.d,point);if(dt>2.6)continue;if(!best||dd-dt>best.adv)best={r,adv:dd-dt};}
 const keeperClaims=k&&point.x>FIELD.sixX&&Math.abs(point.y-FIELD.goalY)<5.5&&dist(k,point)<1.1;
 setBanner(m,point.x,point.y);
 if(keeperClaims)return m.finish(false,'atajado',.2);
 if(!best||best.adv<-.2||dist(best.r.t,point)>2.6)return m.finish(false,'despeje',.2);
 receiverShot(m,best.r.t,quality,clampN(best.adv,0,3));
}
const centro={
 init(m){m.timer=7;m.me=makePlayer(28,rnd(m,2.2,3.6),{num:'7',team:'us'});m.ball=makeBall(0,0);m.ball.owner=m.me;m.k=makeKeeper(m);m.fb=makePlayer(31,5.5,{num:'2',speed:m.ai.defSpeed*.8});
  m.run=runners(m,[[48.5,12],[42,15],[47.5,19]]);m.hint='Clic sobre el compañero (o el espacio) al que quieres centrar';},
 update(m,dt){
  moveRunners(m,m.run,dt);
  if(m.ball.owner===m.me){moveToward(m.me,m.me.x+3,m.me.y,m.stats.sprint*.9,dt);moveToward(m.fb,m.me.x+.4,m.me.y+1.2,m.fb.speed,dt);m.k.y+=(FIELD.goalY-2-m.k.y)*dt;
   if(m.me.x>49.5&&!m.result)return m.finish(false,'perdida',.1);
   if(dist(m.fb,m.me)<.8&&m.t>1.2&&!m.result&&m.rand()<1-Math.exp(-(.9+m.ai.d*1.4)*dt))return m.finish(false,'bloqueado',.15);}
  else{if(m.finalizing)return shotFlight(m,m.ball,m.k,dt,{credit:'assist'});stepBall(m.ball,dt);keeperCover(m,m.k,m.target,dt,{rush:false});
   for(const {t,d} of m.run){moveToward(t,m.target.x,m.target.y,6.2,dt);moveToward(d,m.target.x,m.target.y,d.speed*.95,dt);}
   if(m.t>=m.arrive&&!m.result)crossArrival(m,m.run,m.k,m.target,m.quality);}
 },
 down(m){if(m.ball.owner!==m.me)return;const st=m.stats;let tx=m.pointer.wx,ty=m.pointer.wy;
  const near=m.run.map(r=>r.t).sort((a,b)=>Math.hypot(a.x-tx,a.y-ty)-Math.hypot(b.x-tx,b.y-ty))[0];if(near&&Math.hypot(near.x-tx,near.y-ty)<2.2){tx=near.x+.8;ty=near.y;}
  const err=st.passNoise*.55;m.target={x:clampN(tx+m.aimNoise(err),36,51),y:clampN(ty+m.aimNoise(err),5,24)};
  const time=clampN(dist(m.me,m.target)/(17+st.pass*9),.7,1.5);loft(m.ball,m.target.x,m.target.y,time,3.2);m.arrive=m.t+time;m.quality=clampN(1-err/3,0,1);m.hint='';},
 draw(m,g){drawPitch(g);if(m.ball.owner===m.me)drawPassOption(g,m,m.me,m.run.map(r=>r.t),[m.fb,...m.run.map(r=>r.d)]);for(const {t,d} of m.run){mate(m,t);them(m,d);}them(m,m.fb);keeper(m,m.k);us(m,m.me,{highlight:true});if(m.target)drawRing(g,m.target.x,m.target.y,.7,COLORS.copper,{dash:[4,4]});drawBall(g,m.ball);}
};

const encare={
 init(m){m.timer=10;m.me=makePlayer(31,rnd(m,3,4.5),{num:'11',team:'us'});m.ball=makeBall(0,0);m.ball.owner=m.me;m.fb=makePlayer(36.5,5,{num:'2',speed:m.ai.defSpeed*.95});m.k=makeKeeper(m);
  m.run=runners(m,[[47,12.5],[43,17]]);m.beaten=false;m.hint='Desborda al lateral (Espacio o clic derecho: amague) · clic en un compañero para el pase';},
 update(m,dt){
  moveRunners(m,m.run,dt);
  if(m.ball.owner===m.me){m.steer(m.me,m.stats.speed,dt);
   if(!m.beaten&&m.me.x>m.fb.x+1.2){m.beaten=true;m.say('¡LO DEJASTE ATRÁS!',true);}
   if(!m.beaten&&marker(m,m.fb,m.me,dt,{gap:1.3})&&!m.result){if(!duel(m,m.fb,m.me)){setBanner(m,m.me.x,m.me.y);return m.finish(false,'robo',.15);}}
   if(m.beaten)moveToward(m.fb,m.me.x-.4,m.me.y+.3,m.fb.speed*.95,dt);
   if(m.me.x>51.3&&!m.result)return m.finish(false,'perdida',.1);
   if(timeUp(m))return m.finish(false,'tiempo',.1);}
  else if(m.shot)shotFlight(m,m.ball,m.k,dt,{credit:'goal'});
  else{if(m.finalizing)return shotFlight(m,m.ball,m.k,dt,{credit:'assist'});stepBall(m.ball,dt);for(const {t,d} of m.run){moveToward(t,m.target.x,m.target.y,6.2,dt);moveToward(d,m.target.x,m.target.y,d.speed*.9,dt);}if(m.t>=m.arrive&&!m.result)crossArrival(m,m.run,m.k,m.target,m.quality*(m.beaten?1:.55));}
 },
 key(m,code,down){if(down&&code==='Space')feint(m);},
 down(m,b){if(b==='alt')return feint(m);if(m.ball.owner!==m.me)return;
  if(m.pointer.wx>FIELD.goalX-1.2&&Math.abs(m.pointer.wy-FIELD.goalY)<FIELD.post+1){m.shot=true;shoot(m,m.ball,m.me,m.pointer.wy,{noise:1.3});m.hint='';return;}
  const st=m.stats;let tx=m.pointer.wx,ty=m.pointer.wy;const near=m.run.map(r=>r.t).sort((a,b)=>Math.hypot(a.x-tx,a.y-ty)-Math.hypot(b.x-tx,b.y-ty))[0];if(near&&Math.hypot(near.x-tx,near.y-ty)<2.4){tx=near.x+.6;ty=near.y;}
  const err=st.passNoise*(m.beaten?.4:.8);m.target={x:clampN(tx+m.aimNoise(err),34,51),y:clampN(ty+m.aimNoise(err),4,25)};
  const ground=m.me.x>46;const time=clampN(dist(m.me,m.target)/(16+st.pass*9),.45,1.4);if(ground)kick(m.ball,m.target.x,m.target.y,dist(m.me,m.target)/time*1.15,0);else loft(m.ball,m.target.x,m.target.y,time,2.6);m.arrive=m.t+time;m.quality=clampN(1-err/3,0,1);m.hint='';},
 draw(m,g){drawPitch(g);if(m.ball.owner===m.me)drawPassOption(g,m,m.me,m.run.map(r=>r.t),[m.fb,...m.run.map(r=>r.d)]);for(const {t,d} of m.run){mate(m,t);them(m,d);}them(m,m.fb,{ghost:m.fb.stun>0});keeper(m,m.k);us(m,m.me,{highlight:true});if(m.target)drawRing(g,m.target.x,m.target.y,.7,COLORS.copper,{dash:[4,4]});drawBall(g,m.ball);}
};

/* ======================================================================
   MEDIOCAMPISTAS
   ====================================================================== */
const pase_filtrado={
 init(m){m.timer=9;m.me=makePlayer(21,rnd(m,12,17),{num:'10',team:'us'});m.ball=makeBall(0,0);m.ball.owner=m.me;m.k=makeKeeper(m);
  m.line=36;m.defs=[6.5,11.5,17.5,22.5].map((y,i)=>makePlayer(36,y,{num:String(2+i),speed:m.ai.defSpeed}));
  m.strikers=[makePlayer(35,rnd(m,10,13),{num:'9',team:'us'}),makePlayer(34.5,rnd(m,16,20),{num:'11',team:'us'})];m.strikers.forEach((s,i)=>s.ph=i*2.3+m.rand()*3);
  m.passed=false;m.hint='Clic donde quieras dejar el balón · no lo des en fuera de juego';},
 update(m,dt){
  if(!m.passed){m.steer(m.me,m.stats.speed*.35,dt,[16,27,4,25]);
   m.line=36+Math.sin(m.t*.9)*2.2;for(const d of m.defs)moveToward(d,m.line,d.y,4,dt);
   for(const s of m.strikers){const burst=Math.sin(m.t*1.3+s.ph);moveToward(s,m.line-.3+burst*1.2,s.y+Math.cos(m.t+s.ph)*.4,6,dt);}
   if(timeUp(m))return m.finish(false,'tiempo',.1);return;}
  if(m.finalizing){return shotFlight(m,m.ball,m.k,dt,{credit:'assist'});}
  stepBall(m.ball,dt);
  const target=m.receiver,lead=m.passTarget&&m.ball.x<m.passTarget.x?m.passTarget:{x:m.ball.x+m.ball.vx*.12,y:m.ball.y+m.ball.vy*.12};moveToward(target,lead.x,lead.y,7.1+m.stats.pass*.85,dt);
  for(const d of m.defs){if(m.t-m.passT>m.ai.defReaction+.12)moveToward(d,m.ball.x+m.ball.vx*.15,m.ball.y+m.ball.vy*.15,d.speed*.75,dt);}
  keeperCover(m,m.k,m.ball,dt);
  for(const d of m.defs)if(dist(d,m.ball)<.55&&m.ball.z<1.2&&!m.result){setBanner(m,d.x,d.y);return m.finish(false,'interceptado',.2);}
  if(dist(m.k,m.ball)<m.k.reach&&m.ball.z<2.6&&!m.result){setBanner(m,m.k.x,m.k.y);return m.finish(false,'atajado',.2);}
  if(dist(target,m.ball)<1.10&&m.ball.z<1.6&&!m.result){const space=Math.min(...m.defs.map(d=>dist(d,target)));setBanner(m,target.x,target.y);receiverShot(m,target,m.quality,space);return;}
  if((m.ball.x>FIELD.goalX-.3||Math.hypot(m.ball.vx,m.ball.vy)<.4)&&!m.result)return m.finish(false,'atajado',.1);
 },
 down(m,button){if(m.passed)return;const st=m.stats,tx=m.pointer.wx,ty=m.pointer.wy;
  m.receiver=[...m.strikers].sort((a,b)=>Math.hypot(a.x-tx,a.y-ty)-Math.hypot(b.x-tx,b.y-ty))[0];
  const last=Math.max(...m.defs.map(d=>d.x));m.passed=true;m.passT=m.t;
  if(m.receiver.x>last+.15){setBanner(m,m.receiver.x,m.receiver.y);m.say('¡BANDERA ARRIBA!',false);return m.finish(false,'fuera de juego',.1);}
  const lofted=button==='alt',err=st.passNoise*(lofted?.48:.36);const t={x:tx+m.aimNoise(err),y:ty+m.aimNoise(err)};m.passTarget=t;m.quality=clampN(1-err/2.5,0,1);
  if(lofted){const duration=clampN(dist(m.me,t)/(17+st.pass*8),.55,1.45);loft(m.ball,t.x,t.y,duration,2+st.pass*.9);m.hint='Pase bombeado: tarda más en caer';}
  else{kick(m.ball,t.x,t.y,22+st.pass*13,0);m.hint='Pase raso: cuidado con los defensores';}},
 draw(m,g){drawPitch(g);const last=Math.max(...m.defs.map(d=>d.x));drawLine(g,{x:last,y:1},{x:last,y:28},'rgba(232,165,116,.55)',{dash:[8,6],width:2});
  for(const d of m.defs)them(m,d);for(const s of m.strikers)mate(m,s,{ring:s.x>last+.15?'#f0a08c':null});keeper(m,m.k);us(m,m.me,{highlight:true});drawBall(g,m.ball);if(!m.passed)drawAim(g,m,m.me);}
};

const contragolpe={
 init(m){m.timer=10;m.me=makePlayer(22,14.5,{num:'8',team:'us'});m.ball=makeBall(0,0);m.ball.owner=m.me;m.k=makeKeeper(m);
  m.mates=[makePlayer(22,6,{num:'11',team:'us'}),makePlayer(22,23,{num:'9',team:'us'})];m.defs=[makePlayer(38,12.5,{num:'4',speed:m.ai.defSpeed*.9}),makePlayer(39,17,{num:'5',speed:m.ai.defSpeed*.9})];
  m.mode='carry';m.hint='Conduce · clic en un compañero para pasar o en el arco para rematar';},
 update(m,dt){
  // Los compañeros sin balón corren más que tú con balón: el pase adelantado siempre existe.
  for(const t of m.mates)if(m.mode!=='pass'||t!==m.receiver)moveToward(t,Math.min(48,t.x+4),t.y+(FIELD.goalY-t.y)*.12,7.4,dt);
  if(m.mode==='carry'){m.steer(m.me,m.stats.speed*.85,dt);
   const [d1,d2]=m.defs;const lunge=dist(d1,m.me)<11?marker(m,d1,m.me,dt,{gap:m.me.x<36?2:1.4}):(moveToward(d1,Math.min(44,m.me.x+8),m.me.y,d1.speed,dt),false);
   const danger=[...m.mates].sort((a,b)=>dist(a,G)-dist(b,G))[0];moveToward(d2,(danger.x+G.x)/2+1,(danger.y+G.y)/2,d2.speed,dt);
   keeperCover(m,m.k,m.me,dt);
   if(lunge&&!m.result){if(!duel(m,d1,m.me)){setBanner(m,m.me.x,m.me.y);return m.finish(false,'robo',.15);}}
   if(timeUp(m))return m.finish(false,'tiempo',.1);}
  else if(m.mode==='shot')shotFlight(m,m.ball,m.k,dt,{credit:'goal'});
  else{if(m.finalizing)return shotFlight(m,m.ball,m.k,dt,{credit:'assist'});stepBall(m.ball,dt);moveToward(m.receiver,m.ball.x,m.ball.y,6.5,dt);if(m.t-m.passT>m.ai.defReaction)for(const d of m.defs)moveToward(d,m.ball.x,m.ball.y,d.speed*.75,dt);keeperCover(m,m.k,m.ball,dt);
   for(const d of m.defs)if(dist(d,m.ball)<.6&&!m.result){setBanner(m,d.x,d.y);return m.finish(false,'interceptado',.2);}
   if(dist(m.receiver,m.ball)<.9&&!m.result){const space=Math.min(...m.defs.map(d=>dist(d,m.receiver)));setBanner(m,m.receiver.x,m.receiver.y);receiverShot(m,m.receiver,m.quality,space);return;}
   if(Math.hypot(m.ball.vx,m.ball.vy)<.4&&!m.result)return m.finish(false,'perdida',.1);}
 },
 down(m){if(m.mode!=='carry')return;const tx=m.pointer.wx,ty=m.pointer.wy;
  if(tx>FIELD.goalX-1.5&&Math.abs(ty-FIELD.goalY)<FIELD.post+1.5){m.mode='shot';shoot(m,m.ball,m.me,ty,{noise:1.1});m.hint='';return;}
  m.receiver=[...m.mates].sort((a,b)=>Math.hypot(a.x-tx,a.y-ty)-Math.hypot(b.x-tx,b.y-ty))[0];const err=m.stats.passNoise*.45;const lead={x:m.receiver.x+2+m.aimNoise(err),y:m.receiver.y+m.aimNoise(err)};
  m.quality=clampN(1-err/2.5,0,1);m.mode='pass';m.passT=m.t;kick(m.ball,lead.x,lead.y,16+m.stats.pass*9,0);m.hint='';},
 draw(m,g){drawPitch(g);if(m.mode==='carry')drawPassOption(g,m,m.me,m.mates,m.defs);for(const t of m.mates)mate(m,t);for(const d of m.defs)them(m,d,{ghost:d.stun>0});keeper(m,m.k);us(m,m.me,{highlight:true});drawBall(g,m.ball);if(m.mode==='carry')drawAim(g,m,m.me);}
};

/** Cada presionante asume una tarea: balón, anticipación o receptor. */
export function rondoPressureTarget(ball,receiver,index,difficulty){
 const predict=index===0?0:index===1?.20+difficulty*.18:.1;
 return index===2&&difficulty>.45?{x:receiver.x,y:receiver.y}:{x:ball.x+ball.vx*predict,y:ball.y+ball.vy*predict};
}
const rondo={
 init(m){m.timer=14-m.ai.d*1.3;m.need=m.ai.d>.72?7:6;m.done=0;const c={x:26,y:14.5};m.spots=[[-6.5,0],[0,-6],[6.5,0],[0,6]].map(([dx,dy],i)=>makePlayer(c.x+dx,c.y+dy,{num:String([6,8,10,4][i]),team:'us'}));m.c=c;
  m.holder=m.spots[0];m.ball=makeBall(0,0);m.ball.owner=m.holder;m.press=[makePlayer(26,14.5,{num:'7',speed:m.ai.defSpeed*.8}),makePlayer(23,10,{num:'9',speed:m.ai.defSpeed*.78}),makePlayer(29,19,{num:'10',speed:m.ai.defSpeed*.78})];
  m.holdT=0;m.hint=`Clic en un compañero libre · ${m.need} pases o aguanta 14 s`;},
 update(m,dt){
  m.spots.forEach((p,i)=>{const base=[[-6.5,0],[0,-6],[6.5,0],[0,6]][i];moveToward(p,m.c.x+base[0]+Math.sin(m.t*1.3+i)*1.2,m.c.y+base[1]+Math.cos(m.t*1.1+i)*1.2,4.5,dt);});
  if(m.ball.owner){m.holdT+=dt;const h=m.ball.owner;
   moveToward(m.press[0],h.x,h.y,m.press[0].speed,dt);
   const others=m.spots.filter(p=>p!==h).sort((a,b)=>dist(a,h)-dist(b,h));
   m.press.slice(1).forEach((p,i)=>{const o=others[i]||others[0];moveToward(p,(h.x+o.x)/2,(h.y+o.y)/2,p.speed,dt);});
   if(dist(m.press[0],h)<.8&&m.holdT>.6&&!m.result){setBanner(m,h.x,h.y);return m.finish(false,'robo',.2);}}
  else{stepBall(m.ball,dt);if(m.t-m.passT>m.ai.defReaction)m.press.forEach((p,i)=>{
   // Uno persigue la pelota; los demás intentan cerrar el carril y el receptor.
   const target=rondoPressureTarget(m.ball,m.target,i,m.ai.d);
   moveToward(p,target.x,target.y,p.speed*(.68+m.ai.d*.12),dt);
  });
   for(const p of m.press)if(dist(p,m.ball)<.6&&!m.result){setBanner(m,p.x,p.y);return m.finish(false,'interceptado',.2);}
   if(dist(m.target,m.ball)<.80+m.stats.pass*.11){m.ball.owner=m.target;m.holdT=0;m.done++;m.hint=`${m.done}/${m.need} pases`;if(m.done>=m.need&&!m.result){setBanner(m,m.target.x,m.target.y);return m.finish(true,'posesión',.6+m.stats.pass*.3);}}}
  if(timeUp(m)){setBanner(m,m.c.x,m.c.y);return m.finish(true,'posesión',.5);}
 },
 down(m){if(!m.ball.owner)return;const tx=m.pointer.wx,ty=m.pointer.wy;const t=m.spots.filter(p=>p!==m.ball.owner).sort((a,b)=>Math.hypot(a.x-tx,a.y-ty)-Math.hypot(b.x-tx,b.y-ty))[0];if(Math.hypot(t.x-tx,t.y-ty)>3)return;
  m.target=t;m.passT=m.t;const err=m.stats.passNoise*.15;const px=t.x+m.aimNoise(err),py=t.y+m.aimNoise(err);kick(m.ball,px,py,Math.hypot(px-m.ball.x,py-m.ball.y)*1.15+8+m.stats.pass*7,0);},
 draw(m,g){drawPitch(g);drawRing(g,m.c.x,m.c.y,8.2,'rgba(255,255,255,.18)',{dash:[6,6]});if(m.ball.owner)drawPassOption(g,m,m.ball.owner,m.spots.filter(p=>p!==m.ball.owner),m.press);for(const p of m.spots)us(m,p,{highlight:p===m.ball.owner});for(const p of m.press)them(m,p);drawBall(g,m.ball);}
};

/** Entrada decidida por distancia y momento; los atributos amplían el margen de error. */
export function tackleTiming(distance,reach,elapsed,window,skill,difficulty,fatigue=0){
 const proximity=clampN(1-distance/Math.max(.01,reach),0,1);
 const timing=clampN(1-Math.abs(elapsed/Math.max(.01,window)-.5)*2,0,1);
 const score=proximity*.32+timing*.39+clampN(skill,0,1)*.28-clampN(difficulty,0,1)*.14-clampN(fatigue,0,1)*.075;
 return {success:score>=.35,quality:clampN(score,0,1),timing};
}
const tackleColor=(m,window)=>tackleTiming(0,1,m.t%m.cycle,window,m.stats.defense,m.ai.d).timing>.65?'#ffe3a8':COLORS.copper;
// El portador busca alejarse del defensor y elige al receptor con mayor espacio.
export function recoveryPassingOption(carrier,defender,receivers){
 const options=receivers.map(receiver=>({receiver,space:segDist(defender,carrier,receiver)})).sort((a,b)=>b.space-a.space);
 return options[0]?.space>1.6?options[0].receiver:null;
}
export function recoveryEscapeY(carrier,defender,time,difficulty){
 const separation=dist(carrier,defender),pressure=clampN((7-separation)/7,0,1)*clampN(difficulty,0,1);
 const away=carrier.y>=defender.y?1:-1;
 return clampN(carrier.y+Math.sin(time*1.6)*1.6+away*pressure*2.2,3,26);
}
const recuperacion={
 init(m){m.timer=10;m.rv=makePlayer(16,rnd(m,9,20),{num:'10',speed:m.ai.defSpeed*.62});m.ball=makeBall(0,0);m.ball.owner=m.rv;m.me=makePlayer(27,14.5,{num:'5',team:'us'});
  m.recv=[makePlayer(31,rnd(m,4,8),{num:'9'}),makePlayer(32,rnd(m,21,25),{num:'11'})];m.cycle=rnd(m,.85,1.25);m.passAt=rnd(m,3.3,5.0)-m.ai.d*.55;m.hint='Acércate · entra cuando el anillo brille más';},
 exposed(m){return (m.t%m.cycle)<.34-m.ai.d*.075;},
 update(m,dt){
  m.steer(m.me,m.stats.sprint,dt);
  if((timeUp(m)||m.rv.x>FIELD.boxX)&&!m.result){setBanner(m,m.rv.x,m.rv.y);return m.finish(false,'superado',.1);}
  for(const r of m.recv)moveToward(r,r.x+Math.sin(m.t+r.y)*.3,r.y,3,dt);
  if(m.ball.owner===m.rv){moveToward(m.rv,m.rv.x+3,recoveryEscapeY(m.rv,m.me,m.t,m.ai.d),m.rv.speed,dt);m.rv.face=[1,0];
   if(this.exposed(m)){m.ball.owner=null;m.ball.x=m.rv.x+1.1;m.ball.y=m.rv.y;}
   const open=recoveryPassingOption(m.rv,m.me,m.recv);
   if((m.t>m.passAt&&open)||m.t>m.timer-.5){m.target=open||m.recv[0];kick(m.ball,m.target.x,m.target.y,15,0);m.passing=true;}}
  else if(!m.passing){m.ball.x=m.rv.x+1.1;m.ball.y=m.rv.y;moveToward(m.rv,m.rv.x+3,m.rv.y,m.rv.speed,dt);if(!this.exposed(m))m.ball.owner=m.rv;}
  else{stepBall(m.ball,dt);if(dist(m.me,m.ball)<.9&&!m.result){setBanner(m,m.me.x,m.me.y);return m.finish(true,'corte',.7);}if((dist(m.target,m.ball)<.8||Math.hypot(m.ball.vx,m.ball.vy)<.4)&&!m.result){setBanner(m,m.target.x,m.target.y);return m.finish(false,'superado',.1);}}
 },
 down(m){if(m.passing||m.me.stun>0)return;const d=dist(m.me,m.ball),reach=m.stats.tackleReach;
  if(d<=reach&&!m.ball.owner){const duel=tackleTiming(d,reach,m.t%m.cycle,.34-m.ai.d*.075,m.stats.defense,m.ai.d,m.stats.fatigue);setBanner(m,m.me.x,m.me.y);if(duel.success)return m.finish(true,'robo',duel.quality);m.me.stun=.55;m.passAt=Math.min(m.passAt,m.t+.35);m.say('ENTRADA IMPRECISA',false);return;}
  if(dist(m.me,m.rv)<=reach){setBanner(m,m.rv.x,m.rv.y);m.say('¡FALTA!',false);return m.finish(false,'falta',.1);}
  m.me.stun=.55;m.passAt=Math.min(m.passAt,m.t+.35);m.say('AL AIRE',false);},
 draw(m,g){drawPitch(g);for(const r of m.recv)them(m,r);them(m,m.rv,{ring:this.exposed(m)&&!m.passing?tackleColor(m,.34-m.ai.d*.075):null});us(m,m.me,{highlight:true});drawRing(g,m.me.x,m.me.y,m.stats.tackleReach,'rgba(122,166,255,.35)',{dash:[3,5]});drawBall(g,m.ball);}
};

/* ======================================================================
   DEFENSAS
   ====================================================================== */
const entrada={
 init(m){m.timer=10;m.att=makePlayer(27,rnd(m,10,19),{num:'9',speed:m.ai.defSpeed*.82});m.ball=makeBall(0,0);m.ball.owner=m.att;m.me=makePlayer(38,14.5,{num:'4',team:'us'});m.k=makePlayer(51,14.5,{num:'1',r:.5});
  m.cycle=rnd(m,.93,1.27)-m.ai.d*.19;m.hint='Acompaña · entra cuando el anillo brille más';},
 exposed(m){return (m.t%m.cycle)<.29+(1-m.ai.d)*.11;},
 update(m,dt){
  m.steer(m.me,m.stats.sprint*.95,dt);
  const a=m.att;
  if(m.ball.owner===a||m.dribbling){const weave=Math.sin(m.t*2.2)*2.4*(.5+m.ai.d);const ty=clampN(a.y+(m.me.y>a.y?-1:1)*1.2+weave*.3,4,25);moveToward(a,a.x+3,ty,a.speed,dt);a.face=[1,0];
   if(this.exposed(m)){m.ball.owner=null;m.dribbling=true;m.ball.x=a.x+1.05;m.ball.y=a.y;}else{m.ball.owner=a;m.dribbling=false;}
   if(a.x>m.me.x+.9&&!m.passedBy){m.passedBy=true;m.say('TE SUPERÓ',false);}
   if(a.x>FIELD.boxX+3&&!m.result){setBanner(m,a.x,a.y);return m.finish(false,m.passedBy?'superado':'gol rival',.1);}
   if(timeUp(m))return m.finish(false,'superado',.1);}
 },
 down(m){if(m.result||m.me.stun>0)return;const d=dist(m.me,m.ball),reach=m.stats.tackleReach;
  if(d<=reach&&this.exposed(m)){const window=.29+(1-m.ai.d)*.11,duel=tackleTiming(d,reach,m.t%m.cycle,window,m.stats.defense,m.ai.d,m.stats.fatigue);setBanner(m,m.me.x,m.me.y);if(duel.success){m.ball.owner=m.me;return m.finish(true,'robo',duel.quality);}m.me.stun=.7;m.att.x+=1.2;m.say('ENTRADA IMPRECISA',false);return;}
  if(dist(m.me,m.att)<=reach+.2){setBanner(m,m.att.x,m.att.y);m.say(m.att.x>FIELD.boxX?'¡PENAL!':'¡FALTA!',false);return m.finish(false,'falta',.1);}
  m.me.stun=.7;m.say('TE TIRASTE ANTES',false);},
 draw(m,g){drawPitch(g);keeper(m,m.k,true);them(m,m.att,{ring:this.exposed(m)?tackleColor(m,.29+(1-m.ai.d)*.11):null});us(m,m.me,{highlight:true});drawRing(g,m.me.x,m.me.y,m.stats.tackleReach,'rgba(122,166,255,.35)',{dash:[3,5]});drawBall(g,m.ball);}
};

const anticipacion={
 init(m){m.timer=6;m.p=makePlayer(24,rnd(m,11,18),{num:'8'});m.ball=makeBall(0,0);m.ball.owner=m.p;m.fw=[makePlayer(38,7,{num:'11'}),makePlayer(39,14.5,{num:'9'}),makePlayer(38,22,{num:'7'})];
  m.me=makePlayer(34,14.5,{num:'6',team:'us'});m.passT=rnd(m,2,3.2);m.choice=Math.floor(m.rand()*3);m.fake=m.ai.d>.5&&m.rand()<m.ai.d*.7?(m.choice+1+Math.floor(m.rand()*2))%3:null;m.hint='Lee la mirada del pasador y corta la línea de pase';},
 update(m,dt){
  m.steer(m.me,m.stats.sprint,dt);for(const f of m.fw)moveToward(f,f.x+Math.sin(m.t*1.2+f.y)*.4,f.y,2,dt);
  const tell=m.ai.passTell;
  if(m.ball.owner===m.p){const looking=m.fake!=null&&m.t>m.passT-tell*1.6&&m.t<m.passT-tell*.7?m.fake:m.t>m.passT-tell?m.choice:null;if(looking!=null){const f=m.fw[looking];const d=Math.hypot(f.x-m.p.x,f.y-m.p.y);m.p.face=[(f.x-m.p.x)/d,(f.y-m.p.y)/d];}
   if(m.t>=m.passT){m.target=m.fw[m.choice];kick(m.ball,m.target.x,m.target.y,dist(m.p,m.target)*1.15+5+m.ai.d*5,0);}}
  else{const previous={x:m.ball.x,y:m.ball.y};stepBall(m.ball,dt);if(segDist(m.me,previous,m.ball)<.65+m.stats.defense*.2&&m.ball.z<1.3&&!m.result){setBanner(m,m.me.x,m.me.y);return m.finish(true,'corte',.6+m.stats.defense*.3);}if((dist(m.target,m.ball)<.8||Math.hypot(m.ball.vx,m.ball.vy)<.5)&&!m.result){setBanner(m,m.target.x,m.target.y);return m.finish(false,'superado',.1);}}
 },
 draw(m,g){drawPitch(g);for(const f of m.fw)them(m,f);them(m,m.p,{highlight:false});const [px,py]=toScreen(m.p.x,m.p.y);g.strokeStyle='rgba(255,255,255,.6)';g.lineWidth=2;g.beginPath();g.moveTo(px,py);g.lineTo(px+m.p.face[0]*30,py+m.p.face[1]*30);g.stroke();us(m,m.me,{highlight:true});drawBall(g,m.ball);}
};

const despeje={
 init(m){m.timer=4.5;setupCross(m,{landing:{x:rnd(m,42,48),y:rnd(m,11,18)},time:rnd(m,1.3,1.55),from:[40,27.5]});m.st=makePlayer(m.landing.x-6.5,m.landing.y+rnd(m,-2.5,2.5),{num:'9',speed:m.ai.defSpeed*.88});
  m.me=makePlayer(m.landing.x+2.2,clampN(m.landing.y+rnd(m,-2,2),9,20),{num:'4',team:'us'});m.k=makePlayer(51.2,14.5,{num:'1',r:.5});m.cleared=false;m.hint='Ve a la sombra · clic para despejar hacia el puntero (lejos del arco)';},
 update(m,dt){
  if(m.cleared){const previous={x:m.ball.x,y:m.ball.y,z:m.ball.z};stepBall(m.ball,dt);
   if(m.t-m.clearAt>.18)moveToward(m.st,m.ball.x,m.ball.y,m.st.speed*.8,dt);
   if(dist(m.st,m.ball)<.8&&m.ball.z<1.6&&!m.result){setBanner(m,m.st.x,m.st.y);return m.finish(false,'superado',.15);}
   if(m.ball.x>=FIELD.goalX&&!m.result){setBanner(m,m.ball.x,m.ball.y);
    if(sweptKeeperContact(previous,m.ball,m.k,1.05))return m.finish(true,'atajada',.4);
    return inGoalMouth(m.ball.y,m.ball.z)?m.finish(false,'gol rival',.1):m.finish(true,'fuera',.45);}
   if((m.ball.x<FIELD.boxX-2||m.ball.y<0||m.ball.y>FIELD.wid||m.t-m.clearAt>2.5)&&!m.result){setBanner(m,m.ball.x,m.ball.y);return m.finish(true,'despeje',.5+m.stats.jump*.35);}return;}
  stepBall(m.ball,dt);m.steer(m.me,m.stats.sprint,dt);if(m.t>m.ai.defReaction*.6)moveToward(m.st,m.landing.x,m.landing.y,m.st.speed,dt);
  if(dist(m.st,m.ball)<.9&&m.ball.z<2.6&&m.ball.z>.3&&dist(m.st,m.ball)<dist(m.me,m.ball)&&!m.result){setBanner(m,m.st.x,m.st.y);return m.finish(false,'gol rival',.1);}
  if(m.ball.z<=0&&m.t>.3&&!m.result){setBanner(m,m.ball.x,m.ball.y);return m.finish(dist(m.me,m.ball)<dist(m.st,m.ball),dist(m.me,m.ball)<dist(m.st,m.ball)?'controlada':'gol rival',.3);}
 },
 down(m){if(m.cleared)return;const d=dist(m.me,m.ball),top=2.3+m.stats.jump*.9;
  if(d>1.6||m.ball.z>top+.4||m.ball.z<.3){m.say('¡A DESTIEMPO!',false);m.me.stun=.4;return;}
  m.cleared=true;m.clearAt=m.t;const tx=m.pointer.wx,ty=m.pointer.wy;
  const err=(1-m.stats.defense)*1.2+m.stats.fatigue*.5;
  kick(m.ball,tx+m.aimNoise(err),ty+m.aimNoise(err),14+m.stats.jump*8,4);setBanner(m,m.me.x,m.me.y);m.hint='El balón sigue en juego';},
 draw(m,g){drawPitch(g);drawRing(g,m.landing.x,m.landing.y,.5,'rgba(255,255,255,.18)',{dash:[3,4]});keeper(m,m.k,true);them(m,m.st);us(m,m.me,{highlight:true});drawBall(g,m.ball);if(!m.cleared)drawAim(g,m,m.me);}
};

const fuera_juego={
 init(m){m.timer=7;m.line=40;m.defs=[6.5,11.5,17.5,22.5].map((y,i)=>makePlayer(40,y,{num:String([2,4,5,3][i]),team:'us'}));m.atts=[makePlayer(39,rnd(m,9,12),{num:'9'}),makePlayer(39,rnd(m,16,20),{num:'11'})];
  m.p=makePlayer(22,14.5,{num:'10'});m.ball=makeBall(0,0);m.ball.owner=m.p;m.passT=rnd(m,2.6,4.6);m.fakeT=m.ai.d>.45?m.passT-rnd(m,1,1.6):null;m.k=makePlayer(51.2,14.5,{num:'1',r:.5});m.actualLine=40;m.hint='Mantén pulsado para adelantar · observa al último defensor';},
 update(m,dt){
  const hold=m.pointer.down||m.keys.has('Space'),lineSpeed=2.8+m.stats.defense*.9;m.line=clampN(m.line+(hold?-lineSpeed:2.6)*dt,33,44);
  m.defs.forEach((d,i)=>moveToward(d,m.line,d.y,4.5+m.stats.defense*1.6+i*.25,dt));
  m.actualLine=Math.max(...m.defs.map(d=>d.x));
  const windup=t=>m.t>t-.55&&m.t<t;m.windup=windup(m.passT)||(m.fakeT&&windup(m.fakeT));
  // Los delanteros miran la línea cada cierto tiempo: subir justo antes del pase los sorprende.
  if(m.ball.owner===m.p){const scan=.68-m.ai.d*.46;for(const a of m.atts){if(m.t-(a.seen??-9)>=scan){a.seen=m.t+m.rand()*.1;a.tx=m.actualLine-(.35+m.ai.d*.48);}moveToward(a,a.tx??a.x,a.y,6,dt);}
   if(m.t>=m.passT){const r=m.atts.sort((a,b)=>b.x-a.x)[0];m.target=r;const off=r.x>m.actualLine+.25;m.offside=off;kick(m.ball,Math.min(50,m.line+5),r.y,17,0);m.passed=true;if(off){setBanner(m,r.x,r.y);m.say('¡FUERA DE JUEGO!',true);return m.finish(true,'fuera de juego',.5+clampN((r.x-m.actualLine)/2,0,.45));}}}
  else{stepBall(m.ball,dt);moveToward(m.target,m.ball.x,m.ball.y,8,dt);if(dist(m.target,m.ball)<.9&&!m.result){setBanner(m,m.target.x,m.target.y);return m.finish(false,'superado',.1);}}
 },
 draw(m,g){drawPitch(g);drawLine(g,{x:m.actualLine,y:1},{x:m.actualLine,y:28},m.windup?'rgba(240,160,140,.9)':'rgba(122,166,255,.6)',{dash:[8,6],width:2.5});keeper(m,m.k,true);for(const d of m.defs)us(m,d,{highlight:false});for(const a of m.atts)them(m,a,{ring:a.x>m.actualLine?'#f0a08c':null});them(m,m.p,{ring:m.windup?COLORS.copper:null});drawBall(g,m.ball);}
};

/* ======================================================================
   ARQUEROS (cancha)
   ====================================================================== */
const achique={
 init(m){m.timer=9;m.st=makePlayer(32,rnd(m,10,19),{num:'9',speed:m.ai.defSpeed*.82});m.ball=makeBall(0,0);m.ball.owner=m.st;m.me=makePlayer(51,14.5,{num:'1',team:'us',r:.5});m.shootAt=rnd(m,11.3,14.7)+m.ai.d*1.45;m.hint='Muévete para achicar · clic hacia el balón para lanzarte';},
 update(m,dt){
  const st=m.stats;
  if(m.ball.owner===m.st){m.steer(m.me,st.speed*.9,dt,[43.5,51.8,8,21]);
   // Ante una salida cercana, el delantero intenta abrir ángulo hacia el lado libre.
   const separation=dist(m.st,m.me),escape=clampN((9-separation)/9,0,1)*m.ai.shooterSkill*3;
   const side=m.st.y>=m.me.y?1:-1;
   moveToward(m.st,G.x-2,clampN(m.st.y+(FIELD.goalY-m.st.y)*.4+side*escape,4,25),m.st.speed,dt);
   const d=dist(m.st,G);
   if(m.me.dive>0){m.me.dive-=dt;}
   if(timeUp(m))return m.finish(false,'superado',.1);
   if(d<m.shootAt||dist(m.st,m.me)<3.2||m.rounded){
    // Dispara al lado más abierto respecto de tu posición.
    const left=FIELD.goalY-FIELD.post+.4,right=FIELD.goalY+FIELD.post-.4;const side=Math.abs(m.me.y-left)>Math.abs(m.me.y-right)?left:right;
    if(m.rounded){m.st.x=Math.max(m.st.x,m.me.x+1);m.me.grounded=true;}
    const skill=m.ai.shooterSkill;kick(m.ball,G.x+.4,side+(m.rand()-.5)*(2.4-skill*1.6),18+skill*8,.6);m.shotAt=m.t;}}
  else{const previous={x:m.ball.x,y:m.ball.y,z:m.ball.z};stepBall(m.ball,dt);
   if(m.me.diveTime>0){m.me.diveTime=Math.max(0,m.me.diveTime-dt);moveToward(m.me,m.me.diveTarget.x,m.me.diveTarget.y,9+st.reflex*5,dt);}
   else m.steer(m.me,st.speed*.9,dt,[43.5,51.8,8,21]);
   const coverage=m.me.grounded?.6:st.reach+(m.me.diveTime>0?.4:0);
   if(sweptKeeperContact(previous,m.ball,m.me,coverage)&&!m.result){setBanner(m,m.me.x,m.me.y);return m.finish(true,'atajada',.5+clampN(coverage-dist(m.me,m.ball),0,1)*.5);}
   if(m.ball.x>=FIELD.goalX&&!m.result){setBanner(m,m.ball.x,m.ball.y);return inGoalMouth(m.ball.y,m.ball.z)?m.finish(false,'gol rival',.1):m.finish(true,'fuera',.4);}
   if(Math.hypot(m.ball.vx,m.ball.vy)<.5&&m.ball.z<=0&&!m.result){
    m.hint='¡Balón suelto! Acércate para asegurarlo';
    moveToward(m.st,m.ball.x,m.ball.y,m.st.speed,dt);
    if(dist(m.me,m.ball)<.85){setBanner(m,m.ball.x,m.ball.y);return m.finish(true,'controlada',.4);}
    if(dist(m.st,m.ball)<.85||m.t-m.shotAt>4){setBanner(m,m.ball.x,m.ball.y);return m.finish(false,'balón suelto',.1);}
   }}
 },
 down(m){if(m.me.stun>0||m.me.diveTime>0||m.result)return;
  if(m.ball.owner!==m.st){if(m.t-(m.me.lastDive??-9)<.65)return;m.me.lastDive=m.t;m.me.diveTime=.35;
   m.me.diveTarget={x:clampN(m.pointer.wx,43.5,51.8),y:clampN(m.pointer.wy,8,21)};m.hint='¡Estirada!';return;}
  const d=dist(m.me,m.st),reach=2.1+m.stats.reflex*.5;
  // Distancia, reflejos y habilidad del delantero determinan el achique.
  if(d<reach){const score=(1-d/reach)*.65+m.stats.reflex*.35-m.ai.shooterSkill*.15;setBanner(m,m.me.x,m.me.y);if(score>=.20)return m.finish(true,'atajada',clampN(.5+score*.5,0,1));m.me.stun=.8;m.rounded=true;m.say('TE ESQUIVÓ',false);return;}
  // Salida en falso: el delantero te esquiva y define con el arco más abierto.
  m.me.stun=.8;m.say('TE ESQUIVÓ',false);m.rounded=true;},
 draw(m,g){drawPitch(g);if(m.me.diveTime>0&&m.me.diveTarget)drawLine(g,m.me,m.me.diveTarget,'rgba(124,221,183,.7)',{dash:[4,4]});them(m,m.st);keeper(m,m.me,true);const l={x:G.x,y:FIELD.goalY-FIELD.post},r={x:G.x,y:FIELD.goalY+FIELD.post};drawLine(g,m.st,l,'rgba(255,255,255,.18)',{dash:[4,6]});drawLine(g,m.st,r,'rgba(255,255,255,.18)',{dash:[4,6]});drawBall(g,m.ball);}
};

const salida_aerea={
 init(m){m.timer=4.5;setupCross(m,{landing:{x:rnd(m,46,50),y:rnd(m,11,18)},time:rnd(m,1.3,1.55),peak:3.4,contact:2.4,from:[40,rnd(m,0,1)<.5?1.5:27.5]});m.st=makePlayer(m.landing.x-3.2,m.landing.y+rnd(m,-2,2),{num:'9',speed:m.ai.defSpeed*.94});m.def=makePlayer(m.st.x+.8,m.st.y+.6,{num:'4',team:'us',speed:5});
  m.me=makePlayer(51,14.5,{num:'1',team:'us',r:.5});m.hint='Muévete hacia la sombra · clic para atrapar con las manos';},
 update(m,dt){
  if(m.caught)return;stepBall(m.ball,dt);m.steer(m.me,m.stats.sprint,dt,[44,51.8,6,23]);if(m.t>m.ai.defReaction*.5)moveToward(m.st,m.landing.x,m.landing.y,m.st.speed,dt);moveToward(m.def,m.st.x+.6,m.st.y,5.5,dt);
  if(dist(m.st,m.ball)<.9&&m.ball.z<2.6&&m.ball.z>.3&&dist(m.st,m.ball)<dist(m.me,m.ball)-.2&&!m.result){setBanner(m,m.st.x,m.st.y);return m.finish(false,'gol rival',.1);}
  if(m.ball.z<=0&&m.t>.3&&!m.result){
   const keeperDistance=dist(m.me,m.ball),strikerDistance=dist(m.st,m.ball);
   if(keeperDistance<.85&&keeperDistance<strikerDistance){setBanner(m,m.ball.x,m.ball.y);return m.finish(true,'controlada',.3);}
   if(strikerDistance<.85&&strikerDistance<keeperDistance){setBanner(m,m.ball.x,m.ball.y);return m.finish(false,'gol rival',.1);}
   if(timeUp(m)){setBanner(m,m.ball.x,m.ball.y);return m.finish(false,'balón suelto',.1);}
  }
 },
 down(m){if(m.caught||m.me.stun>0||m.result)return;const d=dist(m.me,m.ball),top=2.6+m.stats.jump*.8,reach=1.35+m.stats.reach*.2;
  if(d>reach||m.ball.z>top){m.say('¡NO LLEGA!',false);m.me.stun=.35;return;}
  setBanner(m,m.me.x,m.me.y);
  const positioning=clampN(1-d/reach,0,1),height=clampN(1-Math.abs(m.ball.z-2.0)/2.5,0,1);
  const pressure=clampN(1-dist(m.st,m.me)/2,0,1);
  const control=positioning*.45+height*.25+m.stats.reflex*.25+m.stats.jump*.15-pressure*.12-m.ai.d*.12;
  if(control>=.38+m.ai.d*.018){m.caught=true;m.ball.owner=m.me;return m.finish(true,'atajada',clampN(control,0,1));}
  // Si no logra asegurarla, la pelota queda viva y el delantero puede disputar el rebote.
  m.ball.owner=null;m.ball.vx=-3;m.ball.vy=(m.ball.y<m.me.y?-1:1)*2;m.ball.vz=1.8;m.ball.g=9.8;m.me.stun=.45;m.hint='¡Se escapó! Ve por el rebote';},
 draw(m,g){drawPitch(g);drawRing(g,m.landing.x,m.landing.y,.5,'rgba(255,255,255,.18)',{dash:[3,4]});them(m,m.st);us(m,m.def);keeper(m,m.me,true);drawBall(g,m.ball);}
};

export const FIELD_SCENES={mano_a_mano,cabezazo,remate,diagonal,encare,centro,pase_filtrado,contragolpe,rondo,recuperacion,entrada,anticipacion,despeje,fuera_juego,achique,salida_aerea};
