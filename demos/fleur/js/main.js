/* FLEUR: каталог, корзина, анимации. Товары в js/products.js */

'use strict';

const CATEGORIES = [
  { id: 'hits',    label: 'Хиты' },
  { id: 'author',  label: 'Авторские' },
  { id: 'roses',   label: 'Розы' },
  { id: 'mono',    label: 'Монобукеты' },
  { id: 'boxes',   label: 'В коробках' },
  { id: 'wedding', label: 'Свадебные' },
  { id: 'dried',   label: 'Сухоцветы' },
];

const FREE_SHIP_FROM = 5000;
const CART_KEY = 'fleur_cart_v2';

const $  = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const fmt = n => n.toLocaleString('ru-RU') + ' ₽';

/* preloader */
window.addEventListener('load', () => {
  setTimeout(() => {
    $('#preloader').classList.add('done');
    document.body.classList.add('loaded');
  }, 900);
});
setTimeout(() => { $('#preloader').classList.add('done'); document.body.classList.add('loaded'); }, 4000);

/* header */
const header = $('#header');
let lastY = 0;
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  header.classList.toggle('scrolled', y > 40);
  header.classList.toggle('hidden', y > lastY && y > 500 && !$('.cart.open') && !$('.modal.open'));
  lastY = y;
}, { passive: true });

/* бургер */
const burger = $('#burger'), mobileMenu = $('#mobileMenu');
burger.addEventListener('click', () => {
  burger.classList.toggle('open');
  mobileMenu.classList.toggle('open');
  document.body.classList.toggle('no-scroll', mobileMenu.classList.contains('open'));
});
$$('#mobileMenu a').forEach(a => a.addEventListener('click', () => {
  burger.classList.remove('open'); mobileMenu.classList.remove('open');
  document.body.classList.remove('no-scroll');
}));

/* плавный скролл по якорям */
$$('[data-scroll]').forEach(a => a.addEventListener('click', e => {
  const target = $(a.getAttribute('href'));
  if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
}));

/* scroll reveal */
const io = new IntersectionObserver(entries => {
  entries.forEach(en => {
    if (en.isIntersecting) { en.target.classList.add('visible'); io.unobserve(en.target); }
  });
}, { threshold: .12, rootMargin: '0px 0px -40px 0px' });
const observeReveals = () => $$('.reveal:not(.visible), .reveal-scale:not(.visible)').forEach(el => io.observe(el));

/* counters */
const counterIO = new IntersectionObserver(entries => {
  entries.forEach(en => {
    if (!en.isIntersecting) return;
    const el = en.target, target = +el.dataset.count, suffix = el.dataset.suffix || '';
    const dur = 1800, t0 = performance.now();
    const tick = t => {
      const p = Math.min((t - t0) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased).toLocaleString('ru-RU') + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    counterIO.unobserve(el);
  });
}, { threshold: .6 });
$$('[data-count]').forEach(el => counterIO.observe(el));

/* parallax banner */
const pxBg = $('[data-parallax]');
if (pxBg) {
  window.addEventListener('scroll', () => {
    const r = pxBg.parentElement.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight) return;
    const shift = (r.top + r.height / 2 - innerHeight / 2) * .12;
    pxBg.style.transform = `translateY(${shift}px)`;
  }, { passive: true });
}

/* каталог */
const grid = $('#catalogGrid');
const filtersBox = $('#filters');
let activeCat = 'hits';

function renderFilters() {
  filtersBox.innerHTML = CATEGORIES.map(c =>
    `<button class="filter-chip${c.id === activeCat ? ' active' : ''}" data-cat="${c.id}" role="tab" aria-selected="${c.id === activeCat}">${c.label}</button>`
  ).join('');
}

function cardHTML(p, i) {
  const tag = p.tag
    ? `<span class="card__tag${p.tag === 'хит' ? ' card__tag--hit' : ''}">${p.tag}</span>` : '';
  return `
  <article class="card" style="animation-delay:${Math.min(i, 12) * 60}ms" data-id="${p.id}">
    <div class="card__media">
      ${tag}
      <button class="card__fav" aria-label="В избранное" data-fav>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20s-7.5-4.9-9.5-9A5.4 5.4 0 0 1 12 6.6 5.4 5.4 0 0 1 21.5 11c-2 4.1-9.5 9-9.5 9Z"/></svg>
      </button>
      <img src="${p.img}" alt="${p.name} - ${p.desc}" loading="lazy" />
      <button class="card__quick" data-add>В корзину · ${fmt(p.price)}</button>
    </div>
    <div class="card__body">
      <p class="card__cat">${p.catName}</p>
      <h3 class="card__name">${p.name}</h3>
      <p class="card__desc">${p.desc}</p>
      <div class="card__foot">
        <p class="card__price">${fmt(p.price)}${p.oldPrice ? `<small>${fmt(p.oldPrice)}</small>` : ''}</p>
        <button class="card__add" aria-label="Добавить ${p.name} в корзину" data-add>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
        </button>
      </div>
    </div>
  </article>`;
}

function renderCatalog() {
  const list = activeCat === 'hits'
    ? PRODUCTS.filter(p => p.tag === 'хит')
    : PRODUCTS.filter(p => p.cat === activeCat);
  grid.innerHTML = list.map(cardHTML).join('');
}

filtersBox.addEventListener('click', e => {
  const chip = e.target.closest('.filter-chip');
  if (!chip) return;
  activeCat = chip.dataset.cat;
  renderFilters();
  renderCatalog();
});

grid.addEventListener('click', e => {
  const fav = e.target.closest('[data-fav]');
  if (fav) { fav.classList.toggle('liked'); return; }
  const add = e.target.closest('[data-add]');
  if (add) addToCart(add.closest('.card').dataset.id, add);
});

/* корзина */
let cart = loadCart();

function loadCart() {
  try {
    const raw = JSON.parse(localStorage.getItem(CART_KEY)) || {};
    /* выкидываем товары, которых больше нет в каталоге */
    return Object.fromEntries(Object.entries(raw).filter(([id]) => PRODUCTS.some(p => p.id === id)));
  } catch { return {}; }
}
function saveCart() { localStorage.setItem(CART_KEY, JSON.stringify(cart)); }
function cartCount() { return Object.values(cart).reduce((s, q) => s + q, 0); }
function cartSum() {
  return Object.entries(cart).reduce((s, [id, q]) => {
    const p = PRODUCTS.find(p => p.id === id);
    return s + (p ? p.price * q : 0);
  }, 0);
}

function addToCart(id, sourceEl) {
  cart[id] = (cart[id] || 0) + 1;
  saveCart();
  updateCartUI();
  const p = PRODUCTS.find(p => p.id === id);
  showToast(`«${p.name}» уже в корзине ♥`);
  const btn = $('#cartBtn');
  btn.classList.remove('bump'); void btn.offsetWidth; btn.classList.add('bump');
  if (sourceEl) flyToCart(sourceEl, p.img);
}

function flyToCart(fromEl, imgSrc) {
  const from = fromEl.getBoundingClientRect();
  const to = $('#cartBtn').getBoundingClientRect();
  const img = document.createElement('img');
  img.src = imgSrc;
  img.className = 'fly-img';
  img.style.left = (from.left + from.width / 2 - 30) + 'px';
  img.style.top  = (from.top + from.height / 2 - 30) + 'px';
  document.body.appendChild(img);
  requestAnimationFrame(() => {
    const dx = to.left + to.width / 2 - (from.left + from.width / 2);
    const dy = to.top + to.height / 2 - (from.top + from.height / 2);
    img.style.transform = `translate(${dx}px, ${dy}px) scale(.15)`;
    img.style.opacity = '.2';
  });
  setTimeout(() => img.remove(), 850);
}

function updateCartUI() {
  const count = cartCount();
  const countEl = $('#cartCount');
  countEl.textContent = count;
  countEl.classList.toggle('show', count > 0);

  const itemsBox = $('#cartItems');
  const entries = Object.entries(cart);
  $('#cartEmpty').hidden = entries.length > 0;
  $('#cartFoot').style.display = entries.length ? '' : 'none';

  itemsBox.innerHTML = entries.map(([id, qty]) => {
    const p = PRODUCTS.find(p => p.id === id);
    if (!p) return '';
    return `
    <div class="cart-item" data-id="${id}">
      <img class="cart-item__img" src="${p.img}" alt="${p.name}" />
      <div>
        <p class="cart-item__name">${p.name}</p>
        <p class="cart-item__price">${fmt(p.price)} / шт.</p>
        <div class="cart-item__ctrl">
          <button class="qty-btn" data-dec aria-label="Меньше">−</button>
          <span class="cart-item__qty">${qty}</span>
          <button class="qty-btn" data-inc aria-label="Больше">+</button>
        </div>
      </div>
      <div class="cart-item__right">
        <p class="cart-item__sum">${fmt(p.price * qty)}</p>
        <button class="cart-item__del" data-del aria-label="Убрать из корзины">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M9 7V5h6v2M7 7l1 13h8l1-13"/></svg>
        </button>
      </div>
    </div>`;
  }).join('');

  const sum = cartSum();
  $('#cartTotal').textContent = fmt(sum);
  const hint = $('#cartHint');
  if (sum >= FREE_SHIP_FROM) {
    hint.classList.add('ok');
    hint.innerHTML = '🌿 Доставка бесплатная - вы прекрасны!';
  } else {
    hint.classList.remove('ok');
    hint.innerHTML = `До бесплатной доставки не хватает <b>${fmt(FREE_SHIP_FROM - sum)}</b>`;
  }
}

$('#cartItems').addEventListener('click', e => {
  const item = e.target.closest('.cart-item');
  if (!item) return;
  const id = item.dataset.id;
  if (e.target.closest('[data-inc]')) { cart[id]++; saveCart(); updateCartUI(); }
  else if (e.target.closest('[data-dec]')) {
    cart[id]--;
    if (cart[id] <= 0) delete cart[id];
    saveCart(); updateCartUI();
  }
  else if (e.target.closest('[data-del]')) {
    item.classList.add('removing');
    setTimeout(() => { delete cart[id]; saveCart(); updateCartUI(); }, 320);
  }
});

const cartDrawer = $('#cart'), overlay = $('#overlay');
function openCart()  { cartDrawer.classList.add('open');  overlay.classList.add('show');  document.body.classList.add('no-scroll'); }
function closeCart() { cartDrawer.classList.remove('open'); overlay.classList.remove('show'); document.body.classList.remove('no-scroll'); }

$('#cartBtn').addEventListener('click', openCart);
$('#cartClose').addEventListener('click', closeCart);
overlay.addEventListener('click', closeCart);
$('#goCatalog').addEventListener('click', () => {
  closeCart();
  $('#catalog').scrollIntoView({ behavior: 'smooth' });
});

/* checkout */
const modal = $('#checkoutModal');
$('#checkoutBtn').addEventListener('click', () => {
  if (!cartCount()) return;
  $('#modalSum').textContent = fmt(cartSum());
  $('#checkoutFormWrap').hidden = false;
  $('#orderSuccess').hidden = true;
  closeCart();
  modal.classList.add('open');
  document.body.classList.add('no-scroll');
});
function closeModal() { modal.classList.remove('open'); document.body.classList.remove('no-scroll'); }
$('#modalClose').addEventListener('click', closeModal);
modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
$('#successClose').addEventListener('click', closeModal);

$('#checkoutForm').addEventListener('submit', e => {
  e.preventDefault();
  const form = e.target;
  if (!form.reportValidity()) return;
  $('#checkoutFormWrap').hidden = true;
  $('#orderSuccess').hidden = false;
  cart = {}; saveCart(); updateCartUI();
  form.reset();
});

$('#callbackForm').addEventListener('submit', e => {
  e.preventDefault();
  const form = e.target;
  if (!form.reportValidity()) return;
  form.reset();
  showToast('Пример проверен. Заявка не отправлена, звонка не будет.');
});

/* toast */
let toastTimer;
function showToast(text) {
  const t = $('#toast');
  $('#toastText').textContent = text;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
}

/* лепестки (canvas) */
(function petals() {
  const canvas = $('#petalsCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let W, H, parts = [];
  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  resize();
  addEventListener('resize', resize);
  const COLORS = ['#eab5a7', '#f2d9d2', '#d98a7e', '#e8c8b8'];
  function spawn(init) {
    return {
      x: Math.random() * W,
      y: init ? Math.random() * H : -20,
      r: 5 + Math.random() * 8,
      vy: .22 + Math.random() * .5,
      vx: -.3 + Math.random() * .6,
      rot: Math.random() * Math.PI * 2,
      vr: -.02 + Math.random() * .04,
      sway: Math.random() * Math.PI * 2,
      color: COLORS[Math.random() * COLORS.length | 0],
      alpha: .35 + Math.random() * .4,
    };
  }
  const N = innerWidth < 640 ? 14 : 26;
  for (let i = 0; i < N; i++) parts.push(spawn(true));
  function draw(p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.globalAlpha = p.alpha;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.moveTo(0, -p.r);
    ctx.bezierCurveTo(p.r * .9, -p.r * .6, p.r * .8, p.r * .6, 0, p.r);
    ctx.bezierCurveTo(-p.r * .8, p.r * .6, -p.r * .9, -p.r * .6, 0, -p.r);
    ctx.fill();
    ctx.restore();
  }
  function loop() {
    ctx.clearRect(0, 0, W, H);
    parts.forEach(p => {
      p.sway += .01;
      p.x += p.vx + Math.sin(p.sway) * .5;
      p.y += p.vy;
      p.rot += p.vr;
      if (p.y > H + 24) Object.assign(p, spawn(false));
      draw(p);
    });
    if (!reduce) requestAnimationFrame(loop);
  }
  if (reduce) { parts.forEach(draw); } else loop();
})();

/* скроллбар-роза (нежная версия) */
(function roseScrollbar() {
  const wrap = $('#scrollRose'), stem = $('#scrollStem'), bud = $('#scrollBud');
  if (!wrap || !matchMedia('(pointer: fine)').matches) return;

  /* тонкий полупрозрачный стебель с маленькими шипами и листьями */
  function buildStem() {
    const H = 700;
    let s = `<path d="M14 0 C 15 ${H * .25}, 13 ${H * .5}, 14 ${H}" stroke="#7fa08c" stroke-width="1.6" fill="none" stroke-linecap="round" opacity=".7"/>`;
    for (let y = 42; y < H - 20; y += 64) {
      const left = (y / 64) % 2 === 0;
      s += left
        ? `<path d="M14 ${y} l-5 -4 l1 6 Z" fill="#7fa08c" opacity=".5"/>`
        : `<path d="M14 ${y} l5 -4 l-1 6 Z" fill="#7fa08c" opacity=".5"/>`;
    }
    for (let y = 110; y < H - 70; y += 210) {
      s += `<path d="M14 ${y} c -10 -2 -13 -8 -12 -15 c 8 1 12 7 12 15 Z" fill="#9dbba8" opacity=".55"/>`;
      s += `<path d="M14 ${y + 105} c 10 -2 13 -8 12 -15 c -8 1 -12 7 -12 15 Z" fill="#9dbba8" opacity=".55"/>`;
    }
    stem.innerHTML = s;
  }
  buildStem();

  /* очень плавное движение розы (lerp) + «дыхание» в покое */
  let target = 0, cur = 0, vel = 0;
  function setTarget() {
    const max = document.documentElement.scrollHeight - innerHeight;
    target = max > 0 ? window.scrollY / max : 0;
  }
  setTarget();
  addEventListener('scroll', setTarget, { passive: true });
  addEventListener('resize', () => { setTarget(); buildStem(); });

  let dragging = false, grabOffset = 0, pointerY = null;

  (function tick() {
    const prev = cur;
    if (dragging && pointerY !== null) {
      /* во время перетаскивания роза идёт за курсором без задержки */
      const r = wrap.getBoundingClientRect();
      const trackPx = wrap.clientHeight - bud.offsetHeight;
      const p = Math.max(0, Math.min(1, (pointerY - grabOffset - r.top - bud.offsetHeight / 2) / trackPx));
      const max = document.documentElement.scrollHeight - innerHeight;
      scrollTo({ top: p * max, behavior: 'instant' });
      target = p;
      cur = p;
    } else {
      cur += (target - cur) * .06;
    }
    vel = vel * .85 + (cur - prev) * 30;
    const speed = Math.min(1, Math.abs(vel) * 3);
    const track = wrap.clientHeight - bud.offsetHeight;
    const scale = 1 + speed * .1;
    const rot = Math.max(-16, Math.min(16, vel * 5));
    bud.style.transform = `translateY(${cur * track}px) rotate(${rot}deg) scale(${scale})`;
    requestAnimationFrame(tick);
  })();

  /* перетаскивание розы */
  const root = document.documentElement;
  bud.addEventListener('pointerdown', e => {
    e.preventDefault();
    const b = bud.getBoundingClientRect();
    grabOffset = e.clientY - (b.top + b.height / 2);
    pointerY = e.clientY;
    dragging = true;
    root.style.scrollBehavior = 'auto';
    bud.setPointerCapture(e.pointerId);
  });
  bud.addEventListener('pointermove', e => { if (dragging) pointerY = e.clientY; });
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(ev => bud.addEventListener(ev, () => {
    dragging = false;
    pointerY = null;
    root.style.scrollBehavior = '';
  }));
})();

/* init */
renderFilters();
renderCatalog();
updateCartUI();
observeReveals();
new MutationObserver(observeReveals).observe(document.body, { childList: true, subtree: true });

