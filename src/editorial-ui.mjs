/* Focus management and presentation only. No save/motor dependencies. */
const FOCUSABLE='button:not([disabled]),a[href],input:not([disabled]):not([type=hidden]),select:not([disabled]),textarea:not([disabled]),summary,[tabindex="0"]';
const visible=el=>el.getClientRects().length&&!el.closest('[hidden],[inert]');
let returnFocus=null,modalOpen=false,lastScroll=0,lastAction=null;
export function installEditorialUI(root){
 if(!root?.addEventListener||typeof document.addEventListener!=='function')return;
 root.addEventListener('click',event=>{
  const control=event.target.closest?.('[data-action]');if(!control)return;
  const action=control.dataset.action;
  if(action==='tools'){returnFocus=control;lastScroll=window.scrollY;modalOpen=true;}
  if(action?.startsWith('ui-'))lastAction=action;
  // Native render replaces controls. Restore destination focus after a deliberate
  // page/step change; never steal focus during async world/database updates.
  if(['nav','step','cr-goto','creator-next','creator-prev','create','academy-continue','academy'].includes(action)){
   requestAnimationFrame(()=>{
    const target=root.querySelector('.cr-head h1,.lg-head h1,.setup-stage h1,.career-heading h1,.farewell-hero-text h1');
    if(target){target.tabIndex=-1;target.focus({preventScroll:true});target.scrollIntoView({block:'start',behavior:'instant'});}
   });
  }
 },true);
 document.addEventListener('keydown',event=>{
  const modal=root.querySelector('#modal');if(!modal||document.querySelector('dialog[open]'))return;
  if(event.key==='Tab'){
   const controls=[...modal.querySelectorAll(FOCUSABLE)].filter(visible),first=controls[0],last=controls.at(-1);
   if(!controls.length){event.preventDefault();modal.focus();return;}
   if(event.shiftKey&&(document.activeElement===first||!modal.contains(document.activeElement))){event.preventDefault();last.focus();}
   else if(!event.shiftKey&&(document.activeElement===last||!modal.contains(document.activeElement))){event.preventDefault();first.focus();}
  }
 });
 root.addEventListener('click',event=>{if(event.target.id==='modal')root.querySelector('[data-action="tools-close"]')?.click();});
}
export function editorialAfterRender(root){
 if(typeof root?.querySelector!=='function'||typeof document.querySelector!=='function')return;
 // These attributes are rendered here to cover the secondary legacy tab system.
 root.querySelectorAll?.('.right-tabs [data-action="right-tab"],.match-rhythm-buttons button').forEach(el=>el.setAttribute('aria-pressed',String(el.classList.contains('active')||el.classList.contains('selected'))));
 const modal=root.querySelector('#modal');
 const shell=root.querySelector('.view'),nav=root.querySelector('.site-head'),foot=root.querySelector('.site-foot');
 for(const el of [shell,nav,foot])if(el)el.inert=!!modal;
 if(modal){
  const focused=lastAction?modal.querySelector(`[data-action="${lastAction}"]`):null;
  (focused||modal.querySelector('[data-action="tools-close"]'))?.focus({preventScroll:true});lastAction=null;
 }else if(modalOpen){
  modalOpen=false;const focus=returnFocus?.isConnected?returnFocus:root.querySelector('[data-action="tools"]');
  focus?.focus({preventScroll:true});window.scrollTo({top:lastScroll,behavior:'instant'});returnFocus=null;
 }
}
