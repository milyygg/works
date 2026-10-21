const menu=document.getElementById('menu');
const menuToggle=document.querySelector('.menu-toggle');
function closeMenu(){menu.hidden=true;menuToggle.setAttribute('aria-expanded','false');}
menuToggle.addEventListener('click',()=>{menu.hidden=!menu.hidden;menuToggle.setAttribute('aria-expanded',String(!menu.hidden));});
menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!menu.hidden){closeMenu();menuToggle.focus();}});
document.addEventListener('click',e=>{if(!menu.hidden&&!menu.contains(e.target)&&!menuToggle.contains(e.target))closeMenu();});
const cases=[...document.querySelectorAll('[data-case]')];let current=0;
// Decode every gallery photo before the visitor reaches the carousel.
cases.forEach(item=>{const image=item.querySelector('img');image.loading='eager';image.decode().catch(()=>{});});
document.querySelectorAll('[data-step]').forEach(button=>button.addEventListener('click',()=>{current=(current+Number(button.dataset.step)+cases.length)%cases.length;cases.forEach((el,i)=>el.hidden=i!==current);document.getElementById('gallery-status').textContent=`Работа ${current+1} из ${cases.length}`;}));
const dialog=document.getElementById('photo-dialog');
document.querySelectorAll('.photo-open').forEach(button=>button.addEventListener('click',()=>{const image=document.getElementById('full-photo');image.src=button.dataset.image;image.alt=button.dataset.caption;document.getElementById('photo-caption').textContent=button.dataset.caption;dialog.showModal();}));
document.getElementById('close-photo').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',e=>{if(e.target===dialog){const box=dialog.getBoundingClientRect();if(e.clientX<box.left||e.clientX>box.right||e.clientY<box.top||e.clientY>box.bottom)dialog.close();}});
