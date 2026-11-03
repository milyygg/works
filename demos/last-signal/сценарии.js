(() => {
  const form = document.getElementById('bookingForm');
  const date = document.getElementById('sessionDate');
  const players = document.getElementById('players');
  const total = document.getElementById('total');
  const summary = document.getElementById('bookingSummary');
  const dialog = document.getElementById('confirmDialog');
  const confirmation = document.getElementById('confirmationSummary');
  // Календарь работает по московскому времени; расписание целиком демонстрационное.
  const parts = new Intl.DateTimeFormat('en-CA', {timeZone:'Europe/Moscow',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
  const getPart = name => parts.find(p => p.type === name).value;
  const today = `${getPart('year')}-${getPart('month')}-${getPart('day')}`;
  const fromISO = value => new Date(value+'T12:00:00Z');
  const iso = value => value.toISOString().slice(0,10);
  const minDay = fromISO(today);
  const maxDay = new Date(minDay);
  maxDay.setUTCDate(maxDay.getUTCDate()+180);
  const lastDate = iso(maxDay);
  date.min=today;date.max=lastDate;
  date.value = today;
  const trigger = document.getElementById('dateTrigger');
  const selectedText = document.getElementById('selectedDate');
  const panel = document.getElementById('calendarPanel');
  const monthTitle = document.getElementById('calendarMonth');
  const grid = document.getElementById('calendarDays');
  const previous = document.getElementById('previousMonth');
  const next = document.getElementById('nextMonth');
  const calendarNote = document.getElementById('calendarNote');
  const monthNumber = d => d.getUTCFullYear()*12+d.getUTCMonth();
  let shownMonth = new Date(Date.UTC(minDay.getUTCFullYear(),minDay.getUTCMonth(),1,12));
  const english = () => window.portfolioLanguage?.language === 'en';
  const formatter = options => ({format: value => new Intl.DateTimeFormat(english() ? 'en-US' : 'ru-RU', {timeZone:'UTC',...options}).format(value)});
  const fullDate = formatter({day:'numeric',month:'long',year:'numeric'});
  const monthFormat = formatter({month:'long',year:'numeric'});
  const weekday = formatter({weekday:'long'});
  // Праздники РФ: ст. 112 ТК РФ. Переносы 2026 года: постановление №1466.
  const holidays = {'01-01':'Новогодние каникулы','01-02':'Новогодние каникулы','01-03':'Новогодние каникулы','01-04':'Новогодние каникулы','01-05':'Новогодние каникулы','01-06':'Новогодние каникулы','01-07':'Рождество Христово','01-08':'Новогодние каникулы','02-23':'День защитника Отечества','03-08':'Международный женский день','05-01':'Праздник Весны и Труда','05-09':'День Победы','06-12':'День России','11-04':'День народного единства'};
  const extraDays = {'2026-01-09':'Перенесённый выходной','2026-03-09':'Выходной после 8 марта','2026-05-11':'Выходной после Дня Победы','2026-12-31':'Перенесённый выходной'};
  function dayInfo(d) {
    const key=iso(d), holiday=holidays[key.slice(5)], extra=extraDays[key];
    const weekend=d.getUTCDay()===0||d.getUTCDay()===6||Boolean(extra);
    const names={'Новогодние каникулы':'New Year holidays','Рождество Христово':'Orthodox Christmas','День защитника Отечества':'Defender of the Fatherland Day','Международный женский день':"International Women's Day",'Праздник Весны и Труда':'Spring and Labor Day','День Победы':'Victory Day','День России':'Russia Day','День народного единства':'National Unity Day','Перенесённый выходной':'Substitute holiday','Выходной после 8 марта':'Holiday following March 8','Выходной после Дня Победы':'Holiday following Victory Day'};
    const label=holiday||extra;
    return {key,holiday,weekend,description:`${weekday.format(d)}${label?' · '+(english()?names[label]||label:label):weekend?(english()?' · weekend':' · выходной'):''}`};
  }
  function renderCalendar(focusKey) {
    monthTitle.textContent=monthFormat.format(shownMonth).replace(/\s*г\.$/,'');
    previous.disabled=monthNumber(shownMonth)<=monthNumber(minDay);
    next.disabled=monthNumber(shownMonth)>=monthNumber(maxDay);
    grid.replaceChildren();
    const blanks=(shownMonth.getUTCDay()+6)%7;
    for(let n=0;n<blanks;n++){const empty=document.createElement('span');empty.setAttribute('aria-hidden','true');grid.append(empty)}
    const count=new Date(Date.UTC(shownMonth.getUTCFullYear(),shownMonth.getUTCMonth()+1,0)).getUTCDate();
    let tabStopSet=false;
    for(let n=1;n<=count;n++) {
      const d=new Date(Date.UTC(shownMonth.getUTCFullYear(),shownMonth.getUTCMonth(),n,12));
      const info=dayInfo(d), button=document.createElement('button');
      button.type='button';button.className='calendar-day';button.textContent=n;button.dataset.date=info.key;
      button.disabled=info.key<today||info.key>lastDate;
      button.classList.toggle('weekend',info.weekend);button.classList.toggle('holiday',Boolean(info.holiday));button.classList.toggle('today',info.key===today);button.classList.toggle('selected',info.key===date.value);
      button.setAttribute('aria-label',`${fullDate.format(d)}, ${info.description}${info.key===today?(english()?', today':', сегодня'):''}`);
      button.setAttribute('aria-pressed',String(info.key===date.value));button.title=info.description;
      if(info.key===today)button.setAttribute('aria-current','date');
      button.tabIndex=-1;
      if(!button.disabled&&(info.key===(focusKey||date.value)||!tabStopSet)){if(!tabStopSet){button.tabIndex=0;tabStopSet=true}else{grid.querySelector('[tabindex="0"]').tabIndex=-1;button.tabIndex=0}}
      button.addEventListener('click',()=>{date.value=info.key;selectedText.textContent=fullDate.format(d).replace(/\s*г\.$/,'');update();closeCalendar(true)});
      button.addEventListener('focus',()=>{grid.querySelectorAll('.calendar-day').forEach(b=>b.tabIndex=-1);button.tabIndex=0;calendarNote.textContent=info.description});
      grid.append(button);
    }
    calendarNote.textContent=monthNumber(fromISO(date.value))===monthNumber(shownMonth)?dayInfo(fromISO(date.value)).description:'Выберите день в календаре.';
    if(focusKey){const target=grid.querySelector(`[data-date="${focusKey}"]`);if(target&&!target.disabled)target.focus()}
  }
  function closeCalendar(returnFocus=false){panel.hidden=true;trigger.setAttribute('aria-expanded','false');if(returnFocus)trigger.focus()}
  trigger.addEventListener('click',()=>{
    if(!panel.hidden){closeCalendar();return}
    const chosen=fromISO(date.value);shownMonth=new Date(Date.UTC(chosen.getUTCFullYear(),chosen.getUTCMonth(),1,12));
    panel.hidden=false;trigger.setAttribute('aria-expanded','true');renderCalendar(date.value);
  });
  function changeMonth(delta){shownMonth.setUTCMonth(shownMonth.getUTCMonth()+delta);renderCalendar()}
  previous.addEventListener('click',()=>changeMonth(-1));next.addEventListener('click',()=>changeMonth(1));
  panel.addEventListener('keydown',e=>{
    if(e.key==='Escape'){e.preventDefault();closeCalendar(true);return}
    if(!e.target.dataset.date)return;
    const d=fromISO(e.target.dataset.date),offsets={ArrowLeft:-1,ArrowRight:1,ArrowUp:-7,ArrowDown:7};
    if(e.key in offsets)d.setUTCDate(d.getUTCDate()+offsets[e.key]);
    else if(e.key==='Home')d.setUTCDate(d.getUTCDate()-(d.getUTCDay()+6)%7);
    else if(e.key==='End')d.setUTCDate(d.getUTCDate()+6-(d.getUTCDay()+6)%7);
    else if(e.key==='PageUp'||e.key==='PageDown'){const day=d.getUTCDate();d.setUTCDate(1);d.setUTCMonth(d.getUTCMonth()+(e.key==='PageUp'?-1:1));const days=new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth()+1,0)).getUTCDate();d.setUTCDate(Math.min(day,days))}
    else return;
    e.preventDefault();const bounded=d<minDay?minDay:d>maxDay?maxDay:d;
    shownMonth=new Date(Date.UTC(bounded.getUTCFullYear(),bounded.getUTCMonth(),1,12));renderCalendar(iso(bounded));
  });
  document.addEventListener('click',e=>{if(!panel.hidden&&!panel.contains(e.target)&&!trigger.contains(e.target))closeCalendar()});
  selectedText.textContent=fullDate.format(minDay).replace(/\s*г\.$/,'');
  function update() {
    const count = Number(players.value);
    const time = new FormData(form).get('time');
    const price = 4500 + Math.max(0,count-4)*750;
    const money = english() ? 'RUB '+price.toLocaleString('en-US') : price.toLocaleString('ru-RU')+' ₽';
    const playerWord = english() ? 'players' : count === 2 || count === 3 || count === 4 ? 'участника' : 'участников';
    total.textContent = money;
    summary.textContent = `${count} ${playerWord} · ${time}`;
    return {count,time,money};
  }
  window.addEventListener('portfolio:language',()=>{
    selectedText.textContent=fullDate.format(fromISO(date.value)).replace(/\s*г\.$/,'');
    renderCalendar();update();
  });
  form.addEventListener('input', update);
  form.addEventListener('change', update);
  form.addEventListener('submit', e => {
    e.preventDefault();
    if(!form.reportValidity()) return;
    if(!/^\d{4}-\d{2}-\d{2}$/.test(date.value)||date.value<today||date.value>lastDate){date.value=today;selectedText.textContent=fullDate.format(minDay).replace(/\s*г\.$/,'');trigger.click();return}
    const state = update();
    const formatted = fullDate.format(fromISO(date.value));
    confirmation.textContent = english() ? `The Last Signal escape room\n${formatted} · ${state.time}\nTeam: ${state.count} people\nDemo price: ${state.money}` : `Квест «Последний сигнал»\n${formatted} · ${state.time}\nКоманда: ${state.count} чел.\nДемонстрационная стоимость: ${state.money}`;
    dialog.showModal();
  });
  dialog.querySelectorAll('button').forEach(b => b.addEventListener('click',()=>dialog.close()));
  dialog.addEventListener('click',e=>{if(e.target!==dialog)return;const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close()});
  update();
})();
