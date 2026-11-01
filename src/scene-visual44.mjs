const editorialMotion=typeof matchMedia==='function'?matchMedia('(prefers-reduced-motion: reduce)'):null;
/* RASCENSO 4.4 — dirección artística de jugadas, sin tocar input, física ni aleatoriedad. */
const W=960,H=540;
const GROUPS={
 duelo:['penal','penal_atajado','mano_a_mano','tiro_libre'],
 vuelo:['cabezazo','centro','salida_aerea','despeje'],
 lectura:['pase_filtrado','rondo','anticipacion','fuera_juego'],
 presion:['entrada','recuperacion','encare','achique'],
 velocidad:['diagonal','contragolpe','remate','reflejos']
};
const PALETTE={
 duelo:{accent:'#ffcd98',shadow:'rgba(252,173,94,.17)',label:'EL DUELO'},
 vuelo:{accent:'#a0e0e5',shadow:'rgba(112,211,229,.13)',label:'EL JUEGO AÉREO'},
 lectura:{accent:'#c6c4ff',shadow:'rgba(159,146,241,.16)',label:'LECTURA TÁCTICA'},
 presion:{accent:'#f5aa88',shadow:'rgba(243,110,84,.14)',label:'LA PRESIÓN'},
 velocidad:{accent:'#8de0b3',shadow:'rgba(75,209,140,.14)',label:'CAMBIO DE RITMO'}
};
export function sceneVisualStyle44(type){
 const k=Object.keys(GROUPS).find(k=>GROUPS[k].includes(type))||'velocidad';
 return {...PALETTE[k],group:k};
}
const clamp=(x,a,b)=>Math.min(b,Math.max(a,x));
function ring(g,x,y,r,color,alpha=1){
 g.globalAlpha=alpha;g.beginPath();g.arc(x,y,r,0,Math.PI*2);
 g.lineWidth=2;g.strokeStyle=color;g.stroke();g.globalAlpha=1;
}
export function drawSceneFilm44(m,g){
 const style=sceneVisualStyle44(m?.play?.type),t=Number(m?.t)||0;
 g.save();
 // Reflectores laterales estilo estadio, transparencia suficiente para no tapar la jugada.
 const glow=g.createRadialGradient(W*.53,H*.60,20,W*.53,H*.60,W*.8);
 glow.addColorStop(0,'rgba(0,0,0,0)');glow.addColorStop(1,'rgba(4,12,24,.18)');
 g.fillStyle=glow;g.fillRect(0,0,W,H);
 for(let side=0;side<2;side++){
  const x=side?W-11:11;
  g.fillStyle=style.shadow;
  g.beginPath();
  g.moveTo(x,92);g.lineTo(x+(side?-65:65),H*.46);
  g.lineTo(x+(side?-105:105),H*.70);g.lineTo(x,H*.77);
  g.closePath();g.fill();
 }
 // Tablero de transmisión secundario, no tapa el marcador existente.
 g.fillStyle='rgba(4,18,30,.8)';g.fillRect(14,64,189,23);
 g.fillStyle=style.accent;g.fillRect(14,64,3,23);
 g.textBaseline='middle';g.textAlign='left';g.font='900 10px Inter,Arial';
 g.fillStyle='#e9f4f3';g.fillText(style.label,24,76,170);
 g.fillStyle='rgba(5,22,35,.65)';g.fillRect(W-176,64,163,23);
 g.fillStyle=style.accent;g.fillRect(W-176,64,3,23);
 g.fillStyle='#d5e9ed';g.font='800 10px Inter,Arial';g.textAlign='center';
 g.fillText((m?.play?.kind==='defend'?'DEFENSA':'ATAQUE')+' · RASCENSO',W-92,76);
 // Pulso lineal de presión: decoración temporal sin alterar resultados.
 if(m?.phase==='play'){
  g.fillStyle='rgba(255,255,255,.07)';g.fillRect(15,91,130,3);
  g.fillStyle=style.accent;g.fillRect(15,91,130*clamp((Number(m?.play?.pressure)||40)/100,.05,1),3);
  const flick=editorialMotion?.matches?1:.35+.65*Math.abs(Math.sin(t*1.1));
  g.globalAlpha=flick*.65;ring(g,W-42,107,6,style.accent);g.globalAlpha=1;
 }
 g.restore();
}
export function drawBriefFilm44(m,g){
 const style=sceneVisualStyle44(m?.play?.type);
 g.save();
 // Marcador visual temático que distingue penales, juego aéreo, táctico y recuperación.
 g.fillStyle=style.shadow;
 g.beginPath();g.arc(W/2,H/2,205,0,Math.PI*2);g.fill();
 g.strokeStyle=style.accent;g.globalAlpha=.35;g.lineWidth=3;
 g.beginPath();g.arc(W/2,H/2,196,-Math.PI*.72,Math.PI*.12);g.stroke();
 g.beginPath();g.arc(W/2,H/2,196,Math.PI*.28,Math.PI*.78);g.stroke();
 g.globalAlpha=1;g.fillStyle=style.accent;g.textBaseline='middle';g.textAlign='center';
 g.font='900 10px Inter,Arial';g.fillText('RASCENSO / '+style.label,W/2,m?.phase==='brief'?42:H/2-146);
 g.restore();
}
export function drawResultFilm44(m,g){
 if(!m?.result||m.phase!=='outro'||editorialMotion?.matches)return;
 const style=sceneVisualStyle44(m.play?.type),progress=clamp((2.1-(m.outT||0))/2.1,0,1);
 const good=!!m.result.success,color=good?style.accent:'#f2a4a0';
 g.save();
 const a=.38*(1-progress);
 g.globalAlpha=a;
 const radial=g.createRadialGradient(W/2,H/2,45,W/2,H/2,470);
 radial.addColorStop(0,good?'rgba(232,196,129,.24)':'rgba(250,95,85,.25)');
 radial.addColorStop(1,'rgba(2,12,26,0)');
 g.fillStyle=radial;g.fillRect(0,0,W,H);
 g.globalAlpha=Math.max(0,.85-progress*.78);
 for(let i=0;i<3;i++)ring(g,W/2,H/2,125+progress*250+i*24,color,Math.max(0,(1-progress)*(.32-i*.065)));
 g.restore();
}
