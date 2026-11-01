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

const ICON_PATHS={
 carrera:'<circle cx="12" cy="7" r="3"/><path d="M5 21v-3a7 7 0 0 1 14 0v3M8 21v-4m8 4v-4"/>',
 vestuario:'<path d="m8 3-6 4 3 5 3-2v11h8V10l3 2 3-5-6-4c0 4-8 4-8 0Z"/>',
 historial:'<path d="M3 11a9 9 0 1 1 2 7M3 4v7h7m2-5v6l4 2"/>',
 mundo:'<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/>',
 settings:'<path d="m9 3-1 3-3 1-2 5 2 5 3 1 1 3h6l1-3 3-1 2-5-2-5-3-1-1-3Z"/><circle cx="12" cy="12" r="3"/>'
};
export function editorialIcon(name){return `<svg class="ed-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON_PATHS[name]||''}</svg>`;}
