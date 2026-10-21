const form = document.querySelector('#request-form');
const message = document.querySelector('#message');
const status = document.querySelector('#copy-status');
function prepareMessage() {
  const car = form.elements.car.value.trim();
  const services = [...form.querySelectorAll('input[name="service"]:checked')].map(input => input.value);
  const comment = form.elements.comment.value.trim();
  message.value = ['Здравствуйте! Хочу обсудить обновление автомобиля.',car ? `Автомобиль: ${car}.` : 'Марку и модель автомобиля уточню.',services.length ? `Интересует: ${services.join(', ')}.` : 'Помогите подобрать подходящий вариант.',comment ? `Пожелания: ${comment}` : '', 'Подскажите варианты, стоимость и возможность записи.'].filter(Boolean).join('\n\n');
}
form.addEventListener('submit', event => { event.preventDefault(); prepareMessage(); status.textContent = 'Текст готов. Это демонстрация: сообщения не отправляются.'; });
form.addEventListener('input', prepareMessage);
document.querySelectorAll('[data-select]').forEach(button => button.addEventListener('click', () => {
  [...form.querySelectorAll('[name="service"]')].find(input => input.value === button.dataset.select).checked = true;
  prepareMessage(); document.querySelector('#request').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
}));
document.querySelector('#copy').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(message.value); status.textContent = 'Текст скопирован. Это демонстрация, реальная заявка не создается.'; }
  catch { message.focus(); message.select(); status.textContent = 'Текст выделен. Его можно скопировать вручную.'; }
});
document.querySelectorAll('.service-list details').forEach(detail => detail.addEventListener('toggle', () => {
  if (!detail.open) return;
  document.querySelectorAll('.service-list details').forEach(other => { if (other !== detail) other.open = false; });
  const image = document.querySelector('#service-image'); image.src = `assets/${detail.dataset.image}.webp`; image.alt = detail.dataset.alt;
  document.querySelector('#service-caption').textContent = `${detail.querySelector('summary').childNodes[0].textContent.trim()}. Иллюстрация создана ИИ.`;
}));
const dialog = document.querySelector('#photo-dialog');
let photoTrigger;
document.querySelectorAll('[data-photo]').forEach(button => button.addEventListener('click', () => {
  photoTrigger = button; document.querySelector('#full-photo').src = button.dataset.photo; document.querySelector('#full-photo').alt = button.querySelector('img').alt;
  document.querySelector('#photo-caption').textContent = button.dataset.caption; dialog.showModal();
}));
document.querySelector('#close-photo').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => { if (event.target === dialog) { const rect=dialog.getBoundingClientRect(); if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)dialog.close(); } });
dialog.addEventListener('close', () => photoTrigger?.focus());
if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const observer = new IntersectionObserver(entries => entries.forEach(entry => { if(entry.isIntersecting){entry.target.classList.add('reveal');observer.unobserve(entry.target);} }), {threshold:.12});
  document.querySelectorAll('.section-heading, .light-photo, .service-photo, .request-output, .contact-info').forEach(element => observer.observe(element));
}
