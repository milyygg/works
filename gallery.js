const filters = document.querySelector('.filters');
const projects = [...document.querySelectorAll('.project')];
const result = document.querySelector('#result');
const allowed = ['all', 'sites', 'mini', 'graphics'];
function select(category) {
  if (!allowed.includes(category)) category = 'all';
  for (const project of projects) project.hidden = category !== 'all' && project.dataset.category !== category;
  for (const button of filters.querySelectorAll('button')) button.setAttribute('aria-pressed', String(button.dataset.filter === category));
  const count = projects.filter(project => !project.hidden).length;
  result.textContent = category === 'all' ? `Все проекты: ${count}` : `Показано: ${count}`;
}
filters.hidden = false;
filters.addEventListener('click', event => {
  const button = event.target.closest('[data-filter]');
  if (!button) return;
  select(button.dataset.filter);
  history.replaceState(null, '', button.dataset.filter === 'all' ? location.pathname : `#${button.dataset.filter}`);
});
window.addEventListener('hashchange', () => select(location.hash.slice(1)));
select(location.hash.slice(1));
