const items = JSON.parse(document.querySelector('#images').textContent);
let current = 0;
const artwork = document.querySelector('#artwork');
const caption = document.querySelector('#caption');
const original = document.querySelector('#original');
const thumbs = [...document.querySelectorAll('[data-index]')];
function show(index) {
  current = (index + items.length) % items.length;
  artwork.src = items[current].image;
  artwork.alt = items[current].title;
  original.href = items[current].image;
  caption.textContent = `${current + 1} / ${items.length} · ${items[current].title}`;
  thumbs.forEach((link,i) => link.setAttribute('aria-current', String(i === current)));
  history.replaceState(null, '', `#${current + 1}`);
}
for(const link of thumbs) link.addEventListener('click', event => {
  if(event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  event.preventDefault(); show(Number(link.dataset.index));
});
document.querySelector('#previous').hidden = false;
document.querySelector('#next').hidden = false;
document.querySelector('#previous').addEventListener('click', () => show(current - 1));
document.querySelector('#next').addEventListener('click', () => show(current + 1));
document.addEventListener('keydown', event => {if(event.key === 'ArrowLeft') show(current - 1); if(event.key === 'ArrowRight') show(current + 1);});
const initial = Number(location.hash.slice(1));
show(Number.isInteger(initial) && initial >= 1 && initial <= items.length ? initial - 1 : 0);
