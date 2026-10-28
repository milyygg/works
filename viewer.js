const items = JSON.parse(document.querySelector('#images').textContent);
let current = 0;
let request = 0;
const artwork = document.querySelector('#artwork');
const stage = document.querySelector('.stage');
const caption = document.querySelector('#caption');
const original = document.querySelector('#original');
const thumbs = [...document.querySelectorAll('[data-index]')];
const cache = new Map();
function preload(index, priority = 'low') {
  const item = items[(index + items.length) % items.length];
  const source = item.display || item.image;
  if (!cache.has(source)) {
    const image = new Image();
    image.fetchPriority = priority;
    image.src = source;
    cache.set(source, image);
  }
  return cache.get(source);
}
function show(index) {
  current = (index + items.length) % items.length;
  const selected = current;
  const token = ++request;
  const item = items[selected];
  const image = preload(selected, 'high');
  const label = `${selected + 1} / ${items.length} · ${item.title}`;
  original.href = item.image;
  thumbs.forEach((link,i) => link.setAttribute('aria-current', String(i === selected)));
  history.replaceState(null, '', `#${selected + 1}`);
  function ready() {
    if (token !== request) return;
    artwork.src = image.src;
    artwork.alt = item.title;
    stage.setAttribute('aria-busy', 'false');
    caption.textContent = label;
    preload(selected + 1);
    preload(selected - 1);
  }
  stage.setAttribute('aria-busy', 'true');
  caption.textContent = label + ' · Загрузка…';
  if (image.complete && image.naturalWidth) ready();
  else {
    image.onload = ready;
    image.onerror = () => {
      if (token !== request) return;
      stage.setAttribute('aria-busy', 'false');
      caption.textContent = label + ' · Не удалось загрузить. Откройте оригинал.';
    };
  }
}
for (const link of thumbs) link.addEventListener('click', event => {
  if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  event.preventDefault(); show(Number(link.dataset.index));
});
document.querySelector('#previous').hidden = false;
document.querySelector('#next').hidden = false;
document.querySelector('#previous').addEventListener('click', () => show(current - 1));
document.querySelector('#next').addEventListener('click', () => show(current + 1));
document.addEventListener('keydown', event => {
  if (event.target.matches('input, textarea, select, [contenteditable]') || event.altKey || event.ctrlKey || event.metaKey) return;
  if (event.key === 'ArrowLeft') { event.preventDefault(); show(current - 1); }
  if (event.key === 'ArrowRight') { event.preventDefault(); show(current + 1); }
});
let touch = null;
stage.addEventListener('pointerdown', event => {
  if (event.pointerType !== 'touch' || !event.isPrimary) { touch = null; return; }
  touch = {id:event.pointerId, x:event.clientX, y:event.clientY};
});
stage.addEventListener('pointerup', event => {
  if (!touch || event.pointerId !== touch.id) return;
  const dx = event.clientX - touch.x;
  const dy = event.clientY - touch.y;
  touch = null;
  if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.5) show(current + (dx < 0 ? 1 : -1));
});
stage.addEventListener('pointercancel', () => { touch = null; });
const initial = Number(location.hash.slice(1));
show(Number.isInteger(initial) && initial >= 1 && initial <= items.length ? initial - 1 : 0);
