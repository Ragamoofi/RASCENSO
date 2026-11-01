/* RASCENSO 4.9.9 — Conservar la posición del usuario después de acciones
 * que reconstruyen el HTML de una pantalla (incluida navegación con Enter).
 * No modifica partida, router ni interacción nativa del navegador. */
if(typeof document!=='undefined'&&typeof window!=='undefined'){
 const root=document.getElementById('app');
 if(root){
  const signature=node=>{
   const classNames=[...node.classList||[]].filter(x=>!['active','selected','open','loading'].includes(x));
   return {tag:node.tagName,cls:classNames.slice(0,3),identity:node.getAttribute('data-tab')||node.id||null};
  };
  function snapshot(){
   const panes=[...root.querySelectorAll('*')].filter(e=>e.scrollTop>8&&e.scrollHeight>e.clientHeight+12);
   return {x:window.scrollX,y:window.scrollY,panes:panes.map(el=>{
    const sig=signature(el),all=[...root.querySelectorAll(sig.tag)].filter(x=>{
     const k=signature(x);return k.cls.join(' ')===sig.cls.join(' ')&&k.identity===sig.identity;
    });
    return {sig,index:all.indexOf(el),top:el.scrollTop,left:el.scrollLeft};
   })};
  }
  function restore(s){
   if(!s)return;
   for(const p of s.panes){
    const all=[...root.querySelectorAll(p.sig.tag)].filter(x=>{
     const k=signature(x);return k.cls.join(' ')===p.sig.cls.join(' ')&&k.identity===p.sig.identity;
    });
    const target=all[p.index];if(target){target.scrollTop=p.top;target.scrollLeft=p.left}
   }
   if(Math.abs(window.scrollY-s.y)>4||Math.abs(window.scrollX-s.x)>4)
    window.scrollTo({top:s.y,left:s.x,behavior:'instant'});
  }
  function remember(event){
   if(event.type==='keydown'&&!['Enter',' '].includes(event.key))return;
   const target=event.target;
   if(!(target instanceof Element)||!root.contains(target))return;
   if(target.closest('textarea,select,a[href]')||(event.type==='click'&&target.closest('input')))return;
   const action=target.closest('[data-action]')?.getAttribute('data-action');
   if(['nav','country','step','cr-goto','creator-next'].includes(action))return;
   const s=snapshot();if(s.y<4&&s.panes.length===0)return;
   requestAnimationFrame(()=>{restore(s);requestAnimationFrame(()=>restore(s))});
  }
  document.addEventListener('click',remember,{capture:true,passive:true});
  document.addEventListener('keydown',remember,true);
 }
}
