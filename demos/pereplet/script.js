const item = document.getElementById('item');
const comparison = document.getElementById('comparison');
const handle = comparison.querySelector('.compare-handle');
const before = comparison.querySelector('.photo-before');
const divider = comparison.querySelector('.divider');
let split = 50;
let dragging = null;
function setSplit(value) {
  split = Math.max(0, Math.min(100, value));
  before.style.clipPath = `inset(0 ${100-split}% 0 0)`;
  divider.style.left = `${split}%`;
  handle.style.left = `${Math.max(7,Math.min(93,split))}%`;
  handle.setAttribute('aria-valuenow',Math.round(split));
  handle.setAttribute('aria-valuetext',`До: ${Math.round(split)} процентов; после: ${100-Math.round(split)} процентов`);
}
function moveSplit(event) {
  const rect = comparison.getBoundingClientRect();
  setSplit((event.clientX-rect.left)/rect.width*100);
}
comparison.addEventListener('pointerdown',event=>{
  if(!event.isPrimary||event.button!==0)return;
  dragging=event.pointerId;comparison.setPointerCapture(event.pointerId);
  handle.focus({preventScroll:true});moveSplit(event);
});
comparison.addEventListener('pointermove',event=>{if(dragging===event.pointerId)moveSplit(event);});
for(const type of ['pointerup','pointercancel','lostpointercapture'])comparison.addEventListener(type,()=>{dragging=null;});
handle.addEventListener('keydown',event=>{
  const actions={ArrowLeft:split-5,ArrowDown:split-5,ArrowRight:split+5,ArrowUp:split+5,Home:0,End:100,PageDown:split-20,PageUp:split+20};
  if(Object.hasOwn(actions,event.key)){event.preventDefault();setSplit(actions[event.key]);}
});
document.querySelectorAll('[data-service]').forEach(button => button.addEventListener('click', () => {
  item.value = button.dataset.service;
  document.getElementById('request').scrollIntoView({behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
  item.focus({preventScroll:true});
}));
document.getElementById('request-form').addEventListener('submit', event => {
  event.preventDefault();
  const details = document.getElementById('details').value.trim();
  document.getElementById('message').value = `Здравствуйте! Хочу обсудить ремонт. Вещь: ${item.value.toLowerCase()}. ${details ? details.replace(/[.!?]*$/, '.') : 'Пришлю фотографии в переписке.'} Подскажите, пожалуйста, можно ли восстановить и какая будет предварительная стоимость?`;
  document.getElementById('result').hidden = false;
  document.getElementById('message').focus();
});
