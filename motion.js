(() => {
  const preference=matchMedia('(prefers-reduced-motion: reduce)');
  const button=document.querySelector('[data-motion-control]');
  let off=false;
  try{off=localStorage.getItem('portfolio-motion')==='off'}catch{}
  const enabled=()=>!off&&!preference.matches;
  function sync(){
    document.documentElement.dataset.motion=enabled()?'on':'off';
    if(!button)return;
    button.hidden=false;
    button.textContent=preference.matches?'Движение отключено системой':enabled()?'Отключить анимацию':'Включить анимацию';
    button.disabled=preference.matches;
    button.setAttribute('aria-pressed',String(enabled()));
  }
  button?.addEventListener('click',()=>{off=!off;try{localStorage.setItem('portfolio-motion',off?'off':'on')}catch{}sync()});
  preference.addEventListener('change',sync);sync();
  if(!CSS.supports('animation-timeline:view()')&&Element.prototype.animate){
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(!entry.isIntersecting)return;
      if(enabled())entry.target.animate([{opacity:.3,transform:'translateY(44px) scale(.98)'},{opacity:1,transform:'none'}],{duration:700,easing:'cubic-bezier(.22,1,.36,1)'});
      observer.unobserve(entry.target);
    }),{threshold:.08});
    document.querySelectorAll('.project').forEach(element=>observer.observe(element));
  }
})();
