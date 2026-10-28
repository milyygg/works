import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root = fileURLToPath(new URL('../', import.meta.url));
const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
const projects = JSON.parse(await readFile(path.join(root, 'projects.json'), 'utf8'));
const collections = JSON.parse(await readFile(path.join(root, 'collections.json'), 'utf8'));
const ids = new Set();
for (const project of projects) {
  if(ids.has(project.id)) throw new Error(`Duplicate project: ${project.id}`);
  ids.add(project.id);
  if (!['sites', 'mini', 'graphics'].includes(project.category)) throw new Error(`Unknown category: ${project.category}`);
  const externalSite = project.path.startsWith('https://milyygg.github.io/');
  for(const key of (externalSite ? ['image'] : ['path', 'image'])) {
    if(project[key].startsWith('/') || project[key].includes('..') || project[key].includes(':')) throw new Error(`Expected relative ${key}`);
  }
}
const cards = projects.map((p, i) => `<article class="project${p.category === 'graphics' ? ' project--graphics' : ''}" data-category="${escape(p.category)}" id="${escape(p.id)}">
<a class="project__image" href="${escape(p.path)}" target="_blank" rel="noopener noreferrer" aria-label="Открыть ${escape(p.title)} в новой вкладке"><img src="${escape(p.image)}" width="${p.imageWidth || 1200}" height="${p.imageHeight || 750}" alt="${escape(p.title)}: предпросмотр работы" ${i === 0 ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async"></a>
<div class="project__body"><div><p class="project__meta">${escape(p.kind)} · ${escape(p.status)}</p><h2><a href="${escape(p.path)}" target="_blank" rel="noopener noreferrer">${escape(p.title)}</a></h2><p class="project__description">${escape(p.description)}</p></div><a class="project__open" href="${escape(p.path)}" target="_blank" rel="noopener noreferrer" aria-label="${p.category === 'graphics' ? 'Смотреть' : 'Открыть сайт'}: ${escape(p.title)} (новая вкладка)">${p.category === 'graphics' ? 'Смотреть работы' : 'Открыть сайт'} ↗</a></div></article>`).join('\n');
const filters = [['all','Все работы'],['sites','Сайты'],['mini','Мини-сайты'],['graphics','Графика']].map(([id, title]) => `<button class="filter" type="button" data-filter="${id}" aria-pressed="${id === 'all'}" aria-controls="collection">${title}<span>${projects.filter(p => id === 'all' || p.category === id).length}</span></button>`).join('');
let template = await readFile(path.join(root, 'template.html'), 'utf8');
template = template.replace('<!-- PROJECTS -->', cards).replace('<!-- FILTERS -->', filters).replace('<!-- COUNT -->', projects.length);
await writeFile(path.join(root, 'index.html'), template);
for(const collection of collections){
  const folder = path.join(root, 'demos', collection.id);
  await mkdir(folder, {recursive:true});
  const items = collection.images.map(p => ({title:p.title, image:'../../'+p.image, thumbnail:'../../'+(p.thumbnail || p.image), display:'../../'+(p.display || p.image)}));
  const first = items[0];
  const links = items.map((p,i)=>`<a href="${escape(p.image)}" data-index="${i}" aria-label="${escape(p.title)}"><img src="${escape(p.thumbnail)}" alt="${escape(p.title)}" loading="lazy" decoding="async" fetchpriority="low" width="100" height="100"></a>`).join('');
  await writeFile(path.join(folder, 'index.html'), `<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(collection.title)} | Михаил Милосердов</title><script src="../../viewer.js?v=20261028-3" defer></script><link rel="stylesheet" href="../../styles.css"><style>.viewer{width:min(1100px,100% - 32px);margin:0 auto 60px}.viewer h1{font-size:clamp(28px,5vw,48px);line-height:1.1;letter-spacing:-.035em}.stage{touch-action:pan-y pinch-zoom;position:relative;height:min(72vh,900px);background:#191b21;display:flex;justify-content:center}.stage img{width:100%;height:100%;object-fit:contain}.controls{display:flex;gap:16px;align-items:center;justify-content:space-between;margin:20px 0}.controls button{min-height:48px;padding:10px 20px;border:0;background:#f3efe9;color:#0e0f13;cursor:pointer}.thumbs{display:flex;flex-wrap:wrap;gap:12px}.thumbs a{width:calc(20% - 12px);min-width:70px;background:#191b21}.thumbs img{width:100%;height:100px;object-fit:contain}.thumbs a[aria-current=true]{outline:3px solid #ff8a5b;outline-offset:3px}.viewer p{max-width:62ch}@media(max-width:600px){.controls{flex-wrap:wrap}.controls span{order:3;width:100%}.stage{touch-action:pan-y pinch-zoom;position:relative;height:65vh}}</style></head><body><header class="top shell"><a class="brand" href="../../">Все работы</a><a href="https://milyygg.github.io/portfolio/">Портфолио</a></header><main class="viewer"><h1>${escape(collection.title)}</h1><p>Михаил Милосердов. Листайте работы кнопками, свайпом или выбирайте миниатюру. <a id="original" href="${escape(first.image)}" target="_blank" rel="noopener noreferrer">Открыть изображение целиком</a>.</p><div class="stage"><img id="artwork" src="${escape(first.display)}" alt="${escape(first.title)}" draggable="false" fetchpriority="high"></div><div class="controls"><button id="previous" hidden type="button">← Назад</button><span id="caption" role="status">${escape(first.title)}</span><button id="next" hidden type="button">Вперед →</button></div><nav class="thumbs" aria-label="Выбрать работу">${links}</nav><noscript><p>Нажмите миниатюру, чтобы открыть работу целиком.</p></noscript></main><script type="application/json" id="images">${JSON.stringify(items).replaceAll('<','\\u003c')}</script></body></html>`);
}
console.log(`Built ${projects.length} projects and ${collections.length} graphic collections.`);
