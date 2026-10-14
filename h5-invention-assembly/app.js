import {BOARD,SCENES,boardPoint,assessDrop,nextPart} from './core.js';
const app=document.querySelector('#app'),viewport=document.querySelector('#viewport');
const pages=[...document.querySelectorAll('.page')],sceneStates=new Map();
let currentPage=0,drag=null,swipe=null,windTimer=null;
const motionReduced=matchMedia('(prefers-reduced-motion: reduce)').matches;

function fitDeck(){
  const safeHeight=Math.max(240,window.innerHeight-(window.innerWidth>500?24:0));
  const s=Math.min(window.innerWidth/375,safeHeight/738,1.18);
  viewport.style.width=375*s+'px';viewport.style.height=738*s+'px';
  app.style.setProperty('--deck-scale',s);
}
fitDeck();window.addEventListener('resize',fitDeck);

function graphic(symbol){
  const source=document.querySelector('#sym-'+symbol);
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.setAttribute('viewBox',source.getAttribute('viewBox'));
  svg.setAttribute('aria-hidden','true');svg.classList.add('piece-svg');
  svg.innerHTML=source.innerHTML;return svg;
}
function setFeedback(state,text,type=''){
  const box=state.root.querySelector('.assembly-feedback');
  box.classList.remove('is-error','is-success');if(type)box.classList.add('is-'+type);
  box.querySelector('.feedback-text').textContent=text;
  box.querySelector('.feedback-icon').textContent=type==='success'?'✓':type==='error'?'↶':'↗';
}
function makeScene(root){
  const sceneId=root.dataset.scene,scene=SCENES[sceneId];
  const state={sceneId,root,placed:new Set(),selected:null,pieces:new Map(),targets:new Map(),cards:new Map()};
  sceneStates.set(sceneId,state);
  scene.parts.forEach((part,i)=>{
    const piece=document.createElement('div');
    piece.className='assembly-piece piece-'+part.id;piece.dataset.part=part.id;piece.dataset.placed='false';
    const [x,y,w,h]=part.rect;
    Object.assign(piece.style,{left:x/BOARD.width*100+'%',top:y/BOARD.height*100+'%',width:w/BOARD.width*100+'%',height:h/BOARD.height*100+'%'});
    piece.append(graphic(part.symbol));root.querySelector('.piece-layer').append(piece);state.pieces.set(part.id,piece);
    const target=document.createElement('button');
    target.className='drop-target';target.type='button';target.dataset.part=part.id;
    target.setAttribute('aria-label','把'+part.name+'放在这里');
    const [cx,cy,r]=part.target;
    Object.assign(target.style,{left:(cx-r)/BOARD.width*100+'%',top:(cy-r)/BOARD.height*100+'%',width:r*2/BOARD.width*100+'%',height:r*2/BOARD.height*100+'%'});
    const label=document.createElement('span');label.textContent=i+1+' · '+part.name+'放这里';target.append(label);
    target.addEventListener('click',()=>{
      if(state.selected)placePart(state,state.selected,{x:cx,y:cy});
      else setFeedback(state,'先从下方拖起'+part.name+'。');
    });
    root.querySelector('.target-layer').append(target);state.targets.set(part.id,target);
    const card=document.createElement('button');
    card.className='part-card';card.type='button';card.dataset.draggable='true';card.dataset.part=part.id;
    card.setAttribute('aria-label','拖动'+part.name);card.setAttribute('aria-describedby','keyboardHelp');card.setAttribute('aria-pressed','false');
    const index=document.createElement('span');index.className='part-index';index.textContent='0'+(i+1);
    const art=document.createElement('span');art.className='part-art';art.append(graphic(part.symbol));
    const name=document.createElement('span');name.className='part-name';name.textContent=part.name;
    card.append(index,art,name);root.querySelector('.parts-tray').append(card);state.cards.set(part.id,card);
    card.addEventListener('pointerdown',ev=>startDrag(ev,state,part,card));
    card.addEventListener('keydown',ev=>{if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();selectPart(state,part.id);}});
  });
  root.querySelector('.reset-button').addEventListener('click',()=>resetScene(state));
  root.querySelector('.pull-button')?.addEventListener('click',()=>pullFan(state));
  root.querySelector('.force-button')?.addEventListener('click',()=>{
    if(state.placed.size!==scene.parts.length)return;
    const show=!state.root.classList.contains('show-forces');
    state.root.classList.toggle('show-forces',show);
    root.querySelector('.force-button').setAttribute('aria-pressed',String(show));
    setFeedback(state,show?'静止时：磁力 = 重力 + 细线拉力。':'细线负责限位，星星的位置才稳定。','success');
  });
  refreshScene(state);return state;
}
function selectPart(state,partId){
  if(state.placed.has(partId))return;
  state.selected=partId;refreshScene(state);
  const part=SCENES[state.sceneId].parts.find(p=>p.id===partId);
  setFeedback(state,'已选'+part.name+'，把它放到对应的虚线圈里。');
}
function refreshScene(state){
  const scene=SCENES[state.sceneId],next=nextPart(state.sceneId,state.placed);
  state.root.querySelector('.assembly-count').textContent=state.placed.size+' / '+scene.parts.length;
  state.root.dataset.completed=String(state.placed.size===scene.parts.length);
  for(const part of scene.parts){
    const placed=state.placed.has(part.id),card=state.cards.get(part.id),target=state.targets.get(part.id);
    card.disabled=placed;card.classList.toggle('is-used',placed);card.classList.toggle('is-next',next?.id===part.id);
    card.classList.toggle('is-selected',state.selected===part.id);card.setAttribute('aria-pressed',String(state.selected===part.id));
    card.querySelector('.part-index').textContent=placed?'✓':'0'+(scene.parts.indexOf(part)+1);
    state.pieces.get(part.id).classList.toggle('placed',placed);state.pieces.get(part.id).dataset.placed=String(placed);
    target.classList.toggle('is-next',next?.id===part.id);target.disabled=placed;target.tabIndex=next?.id===part.id?0:-1;
    target.setAttribute('aria-hidden',String(next?.id!==part.id));
  }
}
function placePart(state,partId,point){
  const verdict=assessDrop(state.sceneId,partId,point,state.placed);
  if(!verdict.ok){setFeedback(state,verdict.message,'error');return false;}
  state.placed.add(partId);state.selected=null;refreshScene(state);
  const next=nextPart(state.sceneId,state.placed);
  if(next)setFeedback(state,verdict.message+' 接下来装'+next.name+'。','success');else finishScene(state);
  return true;
}
function finishScene(state){
  state.root.classList.add('complete');
  state.root.querySelector('.parts-tray').hidden=true;state.root.querySelector('.completion-card').hidden=false;
  state.root.querySelector('.board-complete').hidden=false;
  setFeedback(state,state.sceneId==='fan'?'四个零件装好了，拉一下试试看。':'四个零件装好了，星星找到稳定的位置。','success');
  if(!motionReduced)confetti(state.root.querySelector('.confetti-layer'));
}
function resetScene(state){
  if(drag?.state===state)cancelDrag();
  clearTimeout(windTimer);state.placed.clear();state.selected=null;
  state.root.classList.remove('complete','wind-active','show-forces','is-dragging');
  state.root.querySelector('.parts-tray').hidden=false;state.root.querySelector('.completion-card').hidden=true;
  state.root.querySelector('.board-complete').hidden=true;state.root.querySelector('.confetti-layer').replaceChildren();
  state.root.querySelector('.force-button')?.setAttribute('aria-pressed','false');
  refreshScene(state);setFeedback(state,'先拖动'+SCENES[state.sceneId].parts[0].name+'。');
}
function startDrag(ev,state,part,card){
  if(ev.button!==0||state.placed.has(part.id))return;
  ev.preventDefault();swipe=null;if(drag)cancelDrag();
  const ghost=document.createElement('div');ghost.className='drag-ghost';ghost.append(graphic(part.symbol));document.querySelector('#assemblyDialog').append(ghost);
  const r=card.getBoundingClientRect();
  drag={pointerId:ev.pointerId,state,part,card,ghost,startX:ev.clientX,startY:ev.clientY,originX:r.left+r.width/2,originY:r.top+r.height/2,moved:false};
  card.classList.add('is-lifted');state.root.classList.add('is-dragging');card.setAttribute('aria-grabbed','true');
  try{card.setPointerCapture(ev.pointerId);}catch{}
  moveGhost(ev.clientX,ev.clientY);setFeedback(state,part.tip);
}
function moveGhost(x,y){
  if(!drag)return;drag.ghost.style.left=x+'px';drag.ghost.style.top=y+'px';
  const state=drag.state,point=boardPoint(x,y,state.root.querySelector('.board').getBoundingClientRect());
  const good=assessDrop(state.sceneId,drag.part.id,point,state.placed).ok;
  for(const target of state.targets.values())target.classList.remove('is-hover');
  state.targets.get(drag.part.id).classList.toggle('is-hover',good);
}
window.addEventListener('pointermove',ev=>{
  if(!drag||ev.pointerId!==drag.pointerId)return;
  if(Math.hypot(ev.clientX-drag.startX,ev.clientY-drag.startY)>6)drag.moved=true;
  moveGhost(ev.clientX,ev.clientY);
});
window.addEventListener('pointerup',ev=>{
  if(!drag||ev.pointerId!==drag.pointerId)return;
  const d=drag;drag=null;cleanupDrag(d);
  if(!d.moved){d.ghost.remove();selectPart(d.state,d.part.id);return;}
  const r=d.state.root.querySelector('.board').getBoundingClientRect();
  const ok=placePart(d.state,d.part.id,boardPoint(ev.clientX,ev.clientY,r));
  if(ok){
    const [x,y]=d.part.target;
    d.ghost.classList.add('snapping');d.ghost.style.left=r.left+x/BOARD.width*r.width+'px';d.ghost.style.top=r.top+y/BOARD.height*r.height+'px';
  }else{
    d.ghost.classList.add('returning');d.ghost.style.left=d.originX+'px';d.ghost.style.top=d.originY+'px';
  }
  setTimeout(()=>d.ghost.remove(),motionReduced?0:300);
});
window.addEventListener('pointercancel',ev=>{if(drag?.pointerId===ev.pointerId)cancelDrag();});
window.addEventListener('blur',()=>{if(drag)cancelDrag();});
function cleanupDrag(d){
  d.card.classList.remove('is-lifted');d.card.setAttribute('aria-grabbed','false');d.state.root.classList.remove('is-dragging');
  for(const t of d.state.targets.values())t.classList.remove('is-hover');
  try{d.card.releasePointerCapture(d.pointerId);}catch{}
}
function cancelDrag(){if(!drag)return;const d=drag;drag=null;cleanupDrag(d);d.ghost.remove();}
function confetti(layer){
  layer.replaceChildren();const colors=['#ff81b4','#ffd45a','#30c9d4','#aa77e7'];
  for(let i=0;i<12;i++){
    const p=document.createElement('i');p.className='confetti-bit';p.style.background=colors[i%4];
    const angle=Math.PI*2*i/12;
    p.style.setProperty('--conf-x',Math.cos(angle)*75+'px');p.style.setProperty('--conf-y',Math.sin(angle)*45+22+'px');
    p.style.setProperty('--conf-rot',i*58+'deg');p.style.animationDelay=i%3*30+'ms';layer.append(p);
  }
  setTimeout(()=>layer.replaceChildren(),900);
}
function pullFan(state){
  if(state.placed.size!==SCENES.fan.parts.length)return;
  clearTimeout(windTimer);state.root.classList.remove('wind-active');
  requestAnimationFrame(()=>state.root.classList.add('wind-active'));
  setFeedback(state,'拉绳带动转轴，转轴带动扇叶，空气就流动起来。','success');
  windTimer=setTimeout(()=>state.root.classList.remove('wind-active'),2400);
}
document.querySelectorAll('.assembly').forEach(makeScene);

function showPage(index){
 const next=(index+pages.length)%pages.length;if(next===currentPage)return;
 cancelDrag();sceneStates.forEach(s=>s.root.classList.remove('wind-active'));
 const backwards=next<currentPage;pages[currentPage].hidden=true;currentPage=next;
 const page=pages[next];page.hidden=false;page.classList.remove('entering','backwards');
 if(backwards)page.classList.add('backwards');requestAnimationFrame(()=>page.classList.add('entering'));
 document.querySelector('#pageCounter').textContent=String(next+1).padStart(2,'0')+' / 05';
 document.querySelector('#previousPage').disabled=next===0;
 document.querySelector('#nextPage').setAttribute('aria-label',next===4?'回到封面':'下一页');
 document.querySelectorAll('.page-tab').forEach((tab,i)=>{tab.classList.toggle('is-active',i===next);if(i===next)tab.setAttribute('aria-current','page');else tab.removeAttribute('aria-current');});
}
document.querySelectorAll('[data-go]').forEach(button=>button.addEventListener('click',()=>showPage(Number(button.dataset.go))));
document.querySelector('#previousPage').addEventListener('click',()=>{if(currentPage>0)showPage(currentPage-1);});
document.querySelector('#nextPage').addEventListener('click',()=>showPage(currentPage+1));
app.addEventListener('pointerdown',ev=>{if(ev.target.closest('button,dialog'))return;swipe={id:ev.pointerId,x:ev.clientX,y:ev.clientY};});
app.addEventListener('pointerup',ev=>{if(!swipe||swipe.id!==ev.pointerId)return;const d=swipe;swipe=null;const dx=ev.clientX-d.x,dy=ev.clientY-d.y;if(Math.abs(dy)>55&&Math.abs(dy)>Math.abs(dx)*1.4){if(dy<0)showPage(currentPage+1);else if(currentPage>0)showPage(currentPage-1);}});
app.addEventListener('pointercancel',()=>{swipe=null;});
const assemblyDialog=document.querySelector('#assemblyDialog');
document.querySelectorAll('[data-assembly]').forEach(button=>button.addEventListener('click',()=>{
 const scene=button.dataset.assembly;document.querySelectorAll('.assembly-pane').forEach(p=>p.hidden=p.dataset.pane!==scene);
 document.querySelector('#assemblyTitle').textContent=scene==='fan'?'组装手拉小风扇':'组装悬浮星星';assemblyDialog.showModal();
}));
document.querySelector('#closeAssembly').addEventListener('click',()=>assemblyDialog.close());
assemblyDialog.addEventListener('close',()=>{cancelDrag();clearTimeout(windTimer);sceneStates.forEach(s=>s.root.classList.remove('wind-active'));});
assemblyDialog.addEventListener('click',ev=>{if(ev.target===assemblyDialog)assemblyDialog.close();});
const photoDialog=document.querySelector('#photoDialog');
function openPhoto(file,title,caption='把照片放大，观察作品的连接与细节。'){
 cancelDrag();document.querySelector('#photoTitle').textContent=title;const image=document.querySelector('#referencePhoto');image.src='https://invention-assembly-lab-20261014.carryri.chatgpt.site/assets/'+file;image.alt=title;document.querySelector('#photoCaption').textContent=caption;photoDialog.showModal();
}
document.querySelectorAll('[data-photo-src]').forEach(b=>b.addEventListener('click',()=>openPhoto(b.dataset.photoSrc,b.dataset.photoTitle)));
document.querySelectorAll('.photo-button').forEach(b=>b.addEventListener('click',()=>openPhoto(b.dataset.photo==='star'?'star-original.jpg':'fan-original.jpg',b.dataset.photo==='star'?'磁力悬浮星星':'手拉小风扇')));
document.querySelector('#closePhoto').addEventListener('click',()=>photoDialog.close());
photoDialog.addEventListener('click',ev=>{if(ev.target===photoDialog)photoDialog.close();});
document.querySelector('#showLampParts').addEventListener('click',ev=>{const on=document.querySelector('#lampDisplay').classList.toggle('show-parts');ev.currentTarget.setAttribute('aria-pressed',String(on));ev.currentTarget.innerHTML=on?'收起结构标注 <span>－</span>':'看看结构标注 <span>＋</span>';});
document.querySelector('#showWheelLight').addEventListener('click',ev=>{const on=document.querySelector('#wheelDisplay').classList.toggle('light-active');ev.currentTarget.setAttribute('aria-pressed',String(on));ev.currentTarget.innerHTML=on?'暂停彩光演示 <span>Ⅱ</span>':'播放彩光演示 <span>▷</span>';});
document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelDrag();sceneStates.forEach(s=>s.root.classList.remove('wind-active'));}});
pages.forEach(page=>page.querySelectorAll('.reveal').forEach((element,i)=>element.style.setProperty('--reveal-order',Math.min(i,6))));
pages[0].classList.add('entering');
