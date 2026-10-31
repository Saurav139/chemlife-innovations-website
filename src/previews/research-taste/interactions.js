(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (CSS.supports('animation-timeline', 'view()')) document.documentElement.classList.add('motion');
  const root = document.querySelector('main');
  if (!root) return;
  root.classList.add('rp-js');
  const timers = new Set();
  const play = (element) => {
    clearTimeout(element._live);
    element.classList.remove('in', 'live', 'off', 'replaying');
    void element.getBoundingClientRect();
    element.classList.add('replaying', 'in');
    element._played = true;
    if (reduced) return;
    element._live = setTimeout(() => { element.classList.remove('replaying'); element.classList.add('live'); }, Math.max(0, parseFloat(element.dataset.live || '0')) * 1000);
    timers.add(element._live);
  };
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    const element = entry.target;
    if (entry.isIntersecting) {
      if (!element._played) { element._played = true; element.classList.add('live'); }
      element.classList.remove('off');
    } else if (element._played) element.classList.add('off');
  }), {threshold: .25});
  root.querySelectorAll('.anim').forEach(element => observer.observe(element));
  const shown = element => {
    const box = element.getBoundingClientRect();
    const track = element.closest('.stages-m')?.getBoundingClientRect();
    return box.width > 0 && (!track || Math.min(box.right, track.right) - Math.max(box.left, track.left) > box.width / 2);
  };
  root.querySelectorAll('[data-replay]').forEach(button => button.addEventListener('click', () => {
    button.closest('figure')?.querySelectorAll('.anim').forEach(element => { if (shown(element)) play(element); });
  }));
  root.querySelectorAll('[data-mode-set]').forEach(button => button.addEventListener('click', () => {
    const figure = button.closest('figure');
    if (!figure) return;
    figure.dataset.mode = button.dataset.modeSet;
    figure.querySelectorAll('[data-mode-set]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  }));
  root.querySelectorAll('[data-stage-nav]').forEach(nav => {
    const list = nav.parentElement.querySelector('.stages-m');
    if (!list) return;
    const stages = Array.from(list.children), dots = Array.from(nav.querySelectorAll('[data-stage-go]'));
    const previous = nav.querySelector('[data-stage-prev]'), next = nav.querySelector('[data-stage-next]');
    const status = nav.querySelector('[data-stage-status]');
    let index = 0, frame;
    const sync = () => {
      if (!list.clientWidth) return;
      index = Math.min(stages.length - 1, Math.max(0, Math.round(list.scrollLeft / list.clientWidth)));
      dots.forEach((dot, i) => i === index ? dot.setAttribute('aria-current', 'step') : dot.removeAttribute('aria-current'));
      previous.disabled = index === 0;
      next.disabled = index === stages.length - 1;
      if (status) status.textContent = dots[index]?.getAttribute('aria-label') || '';
    };
    const go = value => list.scrollTo({left: Math.max(0, Math.min(stages.length - 1, value)) * list.clientWidth, behavior: reduced ? 'auto' : 'smooth'});
    list.addEventListener('scroll', () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(sync); }, {passive:true});
    previous.addEventListener('click', () => go(index - 1));
    next.addEventListener('click', () => go(index + 1));
    dots.forEach((dot, i) => dot.addEventListener('click', () => go(i)));
    window.addEventListener('resize', () => { list.scrollTo({left: index * list.clientWidth}); sync(); });
    sync();
  });
  const menu = document.querySelector('.menu-button'), navigation = document.querySelector('.main-nav');
  menu?.addEventListener('click', () => {
    const expanded = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(expanded));
    menu.textContent = expanded ? 'Close' : 'Menu';
    navigation.classList.toggle('open', expanded);
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && navigation?.classList.contains('open')) { menu.click(); menu.focus(); }
  });
  document.addEventListener('visibilitychange', () => root.querySelectorAll('.anim').forEach(element => {
    if (document.hidden) element.classList.add('off');
    else if (shown(element)) element.classList.remove('off');
  }));
  window.addEventListener('pagehide', () => { observer.disconnect(); timers.forEach(clearTimeout); });
  const search = document.querySelector('#platform-search');
  if (search) {
    const items = Array.from(document.querySelectorAll('.topic-item'));
    const result = document.querySelector('#search-result'), empty = document.querySelector('#no-platforms');
    const filter = () => {
      const query = search.value.trim().toLowerCase();
      let count = 0;
      items.forEach(item => { item.hidden = !item.textContent.toLowerCase().includes(query); if (!item.hidden) count++; });
      empty.hidden = count > 0;
      result.textContent = `${count} research platform${count === 1 ? '' : 's'}`;
    };
    search.addEventListener('input', filter);
    document.querySelector('#clear-search').addEventListener('click', () => { search.value = ''; filter(); search.focus(); });
  }
})();
