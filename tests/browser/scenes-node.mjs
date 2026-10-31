// Prueba de lógica con canvas simulado: no sustituye la prueba visual en navegador.
globalThis.window=globalThis;
const ctx=new Proxy({measureText:()=>({width:100}),createLinearGradient:()=>({addColorStop(){}}),createRadialGradient:()=>({addColorStop(){}})}, {get:(t,k)=>k in t?t[k]:(()=>{}),set:(t,k,v)=>(t[k]=v,true)});
const canvasMock={getContext:()=>ctx,addEventListener(){},removeEventListener(){},getBoundingClientRect:()=>({left:0,top:0,width:960,height:540}),toDataURL:()=>''};
globalThis.document={getElementById:()=>canvasMock};globalThis.requestAnimationFrame=()=>1;globalThis.cancelAnimationFrame=()=>{};

import { createMatch, toScreen } from '../../src/match2d.mjs';
import { SCENES } from '../../src/plays-ui.mjs';
import { PLAYS, playerStats, aiStats } from '../../src/plays30.mjs';
const canvas=document.getElementById('c');
const attrs=v=>({pace:v,shot:v,pass:v,dribble:v,defense:v,physical:v,skills:3,weak:3});
// Bot competente: juega cada situación con una estrategia razonable (para comprobar que todas son ganables).
const W2S=(x,y)=>toScreen(x,y);
function aimAt(m,x,y){const [sx,sy]=W2S(x,y);m.pointer.x=sx;m.pointer.y=sy;m.pointer.wx=x;m.pointer.wy=y;m.pointer.inside=true;}
const SMART={
 mano_a_mano(m,t,S){if(m.ball.owner===m.me){if(m.me.x<41){aimAt(m,44,m.k.y>14.5?12.5:16.5);}else{aimAt(m,52,m.k.y>14.5?11.5:17.5);S.down.call(S,m,'main');}}},
 cabezazo(m,t,S){aimAt(m,m.landing.x,m.landing.y);if(!m.headed&&Math.hypot(m.me.x-m.ball.x,m.me.y-m.ball.y)<1&&m.ball.z<2.4&&m.ball.z>1.2){aimAt(m,52,m.k.y>14.5?11.8:17.2);S.down.call(S,m,'main');}},
 despeje(m,t,S){aimAt(m,m.landing.x,m.landing.y);if(!m.cleared&&Math.hypot(m.me.x-m.ball.x,m.me.y-m.ball.y)<1&&m.ball.z<2.4&&m.ball.z>.6){aimAt(m,30,2);S.down.call(S,m,'main');}},
 salida_aerea(m,t,S){aimAt(m,m.landing.x,m.landing.y);if(Math.hypot(m.me.x-m.ball.x,m.me.y-m.ball.y)<1.1&&m.ball.z<2.8)S.down.call(S,m,'main');},
 remate(m,t,S){const close=Math.hypot(m.me.x-m.ball.x,m.me.y-m.ball.y);if(close>2.5){aimAt(m,m.ball.x+m.ball.vx*.3,m.ball.y+m.ball.vy*.3);}else{aimAt(m,52,m.k.y>14.5?11.4:17.6);}if(!m.struck&&close<.6)S.down.call(S,m,'main');},
 diagonal(m,t,S){if(m.ball.owner!==m.me)return;if(Math.hypot(m.me.x-m.fb.x,m.me.y-m.fb.y)<2&&t-(m.lastFeint??-9)>1)S.key.call(S,m,'Space',true);if(m.me.x<43){aimAt(m,44,10.5);}else{aimAt(m,52,16.8);S.down.call(S,m,'main');}},
 encare(m,t,S){if(m.ball.owner!==m.me)return;if(!m.beaten){if(Math.hypot(m.me.x-m.fb.x,m.me.y-m.fb.y)<2.2&&t-(m.lastFeint??-9)>1)S.key.call(S,m,'Space',true);aimAt(m,m.fb.x+4,m.fb.y<4?6:2.5);}else if(m.me.x<46){aimAt(m,47.5,4);}else{const r=m.run.map(x=>x.t).sort((a,b)=>b.x-a.x)[0];aimAt(m,r.x,r.y);S.down.call(S,m,'main');}},
 centro(m,t,S){if(m.ball.owner!==m.me||m.me.x<43)return;let best=null;for(const r of m.run){const sep=Math.hypot(r.t.x-r.d.x,r.t.y-r.d.y);if(!best||sep>best.sep)best={r,sep};}if(best.sep>1.4||m.me.x>47){aimAt(m,best.r.t.x,best.r.t.y);S.down.call(S,m,'main');}},
 pase_filtrado(m,t,S){if(m.passed)return;const last=Math.max(...m.defs.map(d=>d.x));const s=m.strikers.find(x=>x.x<last-.3);if(s&&t>1){const ys=m.defs.map(d=>d.y).sort((a,b)=>a-b);let gap=s.y,bd=99;for(let i=0;i<ys.length-1;i++){const mid=(ys[i]+ys[i+1])/2;if(Math.abs(mid-s.y)<bd){bd=Math.abs(mid-s.y);gap=mid;}}aimAt(m,last+5,gap);S.down.call(S,m,'main');}},
 contragolpe(m,t,S){if(m.mode!=='carry')return;if(m.me.x<30){aimAt(m,36,14.5);return;}const free=[...m.mates].sort((a,b)=>Math.min(...m.defs.map(d=>Math.hypot(d.x-b.x,d.y-b.y)))-Math.min(...m.defs.map(d=>Math.hypot(d.x-a.x,d.y-a.y))))[0];aimAt(m,free.x,free.y);S.down.call(S,m,'main');},
 rondo(m,t,S){if(!m.ball.owner||m.holdT<.15)return;const h=m.ball.owner;const opts=m.spots.filter(p=>p!==h).map(p=>({p,risk:Math.min(...m.press.map(q=>{const dx=p.x-h.x,dy=p.y-h.y,l=dx*dx+dy*dy;const u=Math.max(0,Math.min(1,((q.x-h.x)*dx+(q.y-h.y)*dy)/l));return Math.hypot(h.x+dx*u-q.x,h.y+dy*u-q.y);}))})).sort((a,b)=>b.risk-a.risk);aimAt(m,opts[0].p.x,opts[0].p.y);S.down.call(S,m,'main');},
 recuperacion(m,t,S){aimAt(m,m.rv.x+1.2,m.rv.y);if(!m.passing&&S.exposed(m)&&(m.t%m.cycle)>.2&&Math.hypot(m.me.x-m.ball.x,m.me.y-m.ball.y)<m.stats.tackleReach-.1)S.down.call(S,m,'main');},
 entrada(m,t,S){aimAt(m,m.att.x+1.4,m.att.y);if(S.exposed(m)&&(m.t%m.cycle)>.2&&Math.hypot(m.me.x-m.ball.x,m.me.y-m.ball.y)<m.stats.tackleReach-.1)S.down.call(S,m,'main');},
 anticipacion(m,t,S){const f=m.p.face;let best=m.fw[0],bd=-9;for(const x of m.fw){const dx=x.x-m.p.x,dy=x.y-m.p.y,l=Math.hypot(dx,dy);const dot=(dx*f[0]+dy*f[1])/l;if(dot>bd){bd=dot;best=x;}}aimAt(m,(m.p.x+best.x*2)/3,(m.p.y+best.y*2)/3);},
 fuera_juego(m,t,S){if(m.windup)m.wt=(m.wt||0)+1/60;else m.wt=0;m.pointer.down=m.wt>.2;},
 achique(m,t,S){if(m.ball.owner===m.st){aimAt(m,Math.max(46,m.st.x+3),14.5+(m.st.y-14.5)*.35);if(Math.hypot(m.me.x-m.st.x,m.me.y-m.st.y)<1.8)S.down.call(S,m,'main');}},
 penal(m,t,S){const tx=480+(m.tendency<.5?1:-1)*215,ty=230;m.pointer.x=tx;m.pointer.y=ty;m.pointer.inside=true;if(!m.ball&&m.charge==null&&t>.3)S.down.call(S,m,'main');if(m.charge!=null&&S.power(m)>.7&&S.power(m)<.82)S.up.call(S,m,'main');},
 tiro_libre(m,t,S){m.pointer.inside=true;if(!m.ball&&m.charge==null&&t>.3){m.pointer.x=480-180;m.pointer.y=225;S.down.call(S,m,'main');}if(m.charge!=null){m.pointer.x=480-180+Math.min(60,(t-m.charge)*120);if(S.power(m)>.74&&S.power(m)<.84)S.up.call(S,m,'main');}},
 penal_atajado(m,t,S){const side=m.honest?m.side:-m.side;m.pointer.x=480+side*170;m.pointer.y=300;m.pointer.inside=true;if(!m.k.diving&&t>m.kickT-.02)S.down.call(S,m,'main');},
 reflejos(m,t,S){const s=m.shot;if(s.ball&&!m.k.diving){const x=480+s.target[0]*76.5,y=402-s.target[1]*76.5;m.pointer.x=x;m.pointer.y=y;m.pointer.inside=true;if(s.ball.t>s.ball.T*.25)S.down.call(S,m,'main');}else if(!s.ball){m.pointer.x=480;m.pointer.y=330;}}
};
window.runSmart=(type,{level=75,difficulty=.5,seed='smart'}={})=>{
 const play={id:'t',type,kind:PLAYS[type].kind,credit:PLAYS[type].credit,minute:87,before:{gf:1,ga:1},pressure:65,fatigue:.25,difficulty,seed:seed+type,rival:'Rival FC',rivalId:'x',tag:'Prueba',isHome:true,memory:[.2,.3]};
 const state={attributes:attrs(level),morale:72,personality:'disciplinado'};
 const S=SCENES[type];const m=createMatch(canvas,{play,stats:playerStats(state,play),ai:aiStats(play),scene:S,hud:{},onEnd:()=>{}});m.destroy();
 let t=0;try{while(t<30&&!m.result){const dt=1/60;t+=dt;SMART[type](m,m.t,S);m.tick(dt);}}catch(e){return {type,error:String(e.stack||e)};}
 return {type,finished:!!m.result,success:!!m.result?.success,detail:m.result?.detail};
};
window.ready=true;


let failed=false;
for(const type of Object.keys(PLAYS)){let wins=0;for(let i=0;i<100;i++){const r=runSmart(type,{seed:'test-'+i});if(r.error||!r.finished){console.error(type,r.error||'sin resultado');failed=true;break;}if(r.success)wins++;}console.log(`${type}: ${wins}/100 éxitos`);if(!wins)failed=true;}
if(failed)process.exitCode=1;
