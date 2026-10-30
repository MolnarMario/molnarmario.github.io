// Mario Molnar, personal site. Plain JS, no dependencies.
(() => {
  const root = document.documentElement;
  root.classList.add('js');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  /* ---------- Projects ---------- */
  // Data lives in assets/js/projects.js, which loads first.
  const PROJECTS = window.PROJECTS;

  // Old shared links like /#hirakata opened a dialog. Send them to the project's own page.
  const hash = location.hash.slice(1);
  if (PROJECTS[hash]) { location.replace(`projects/${PROJECTS[hash].slug}/`); return; }

  /* ---------- Theme ---------- */
  const themeBtn = $('.theme-btn');
  themeBtn.addEventListener('click', () => {
    const current = root.dataset.theme || (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
    const next = current === 'light' ? 'dark' : 'light';
    root.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch (e) { /* storage blocked: theme just won't persist */ }
  });

  /* ---------- Nav: border when scrolled, active section ---------- */
  const nav = $('.nav');
  const onScroll = () => nav.classList.toggle('is-stuck', scrollY > 8);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Only the in-page links: an href like /changelog/ is not a selector
  const links = $$('.nav__links a[href^="#"]');
  const sections = links.map(a => $(a.getAttribute('href'))).filter(Boolean);
  const spy = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      links.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === '#' + e.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach(s => spy.observe(s));

  /* ---------- Reveal on scroll ---------- */
  const revealer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('is-in'); revealer.unobserve(e.target); }
    });
  }, { rootMargin: '0px 0px -8% 0px' });
  $$('.reveal').forEach(el => revealer.observe(el));

  /* ---------- Count-up on the stats row ---------- */
  if (!reduceMotion) {
    const counter = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        counter.unobserve(e.target);
        const end = +e.target.dataset.count, t0 = performance.now(), dur = 1200;
        const tick = now => {
          const p = Math.min(1, (now - t0) / dur);
          e.target.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))).toLocaleString('en');
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
    }, { threshold: .6 });
    $$('[data-count]').forEach(el => counter.observe(el));
  }

  const cards = $$('#grid .card');

  /* Cursor spotlight on cards */
  cards.forEach(card => card.addEventListener('pointermove', e => {
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', e.clientX - r.left + 'px');
    card.style.setProperty('--my', e.clientY - r.top + 'px');
  }));

  function el(tag, props = {}, text) {
    const n = document.createElement(tag);
    Object.assign(n, props);
    if (text) n.textContent = text;
    return n;
  }

  /* ---------- Project pages ---------- */
  // Each project has its own page under projects/<slug>/ (scripts/build-projects.mjs).
  // Clicking a featured picture goes there too, except the playable board and the
  // replay's own timeline buttons.
  $$('.feature__media:not([data-omt]), .feature .hive').forEach(m => {
    m.style.cursor = 'pointer';
    m.addEventListener('click', e => {
      if (e.target.closest('button, a')) return;
      location.href = `projects/${PROJECTS[m.closest('[data-project]').dataset.project].slug}/`;
    });
  });
  // The dashboard card plays its walkthrough in place of the screenshot
  if (window.AtpDemo && !reduceMotion) AtpDemo($('[data-atp]'));

  /* ---------- Copy email ---------- */
  $$('.copy').forEach(btn => btn.addEventListener('click', async () => {
    const label = $('.copy__label', btn);
    try {
      await navigator.clipboard.writeText(btn.dataset.copy);
      label.textContent = 'Copied';
    } catch (e) {
      label.textContent = btn.dataset.copy;
    }
    setTimeout(() => { label.textContent = 'Copy email'; }, 2000);
  }));

  /* ---------- Email picker ---------- */
  // Close the compose menu on an outside click, Escape, or once a service is picked
  const mailto = $('.mailto');
  if (mailto) {
    document.addEventListener('click', e => { if (!mailto.contains(e.target)) mailto.open = false; });
    mailto.addEventListener('keydown', e => {
      if (e.key === 'Escape' && mailto.open) { mailto.open = false; $('summary', mailto).focus(); }
    });
    $$('.mailto__menu a', mailto).forEach(a => a.addEventListener('click', () => { mailto.open = false; }));
  }

  $('#year').textContent = new Date().getFullYear();

  /* ---------- Hive replay ---------- */
  // Each agent plays a scripted session from projects.js. y = prompt, t = tool call, o = success, d = narration, w = problem found.
  const SCRIPTS = window.HIVE_SCRIPTS;
  const CLS = { y: 'l-you', t: 'l-tool', o: 'l-ok', d: 'l-dim', w: 'l-warn' };
  const agents = $$('.agent');
  const badges = $$('.hive .hive__side .ws__badge');
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  let running = true;
  const waitVisible = async () => { while (!running) await sleep(300); };

  function line(out, kind, text = '') {
    const s = el('span', { className: CLS[kind] }, text);
    out.append(s, '\n');
    while (out.childNodes.length > 40) out.firstChild.remove();
    return s;
  }

  async function play(agentEl, script, delay) {
    const out = $('.agent__out', agentEl);
    await sleep(delay);
    for (;;) {
      out.replaceChildren();
      for (const [kind, text] of script) {
        await waitVisible();
        agentEl.classList.toggle('is-working', kind !== 'y');
        if (kind === 'y') {
          const s = line(out, 'y');
          const caret = el('span', { className: 'caret' });
          s.after(caret);
          for (const ch of text) { s.textContent += ch; await sleep(22 + Math.random() * 40); }
          caret.remove();
          await sleep(350);
        } else {
          line(out, kind, text);
          await sleep(kind === 'd' ? 1500 : 650 + Math.random() * 900);
        }
      }
      agentEl.classList.remove('is-working');
      line(out, 'd', '');
      await sleep(3800);
    }
  }

  function staticHive(hive) {
    $$('.agent', hive).forEach((a, i) => {
      a.classList.remove('is-working');
      const out = $('.agent__out', a);
      out.replaceChildren();
      SCRIPTS[i].forEach(([k, t]) => line(out, k, t));
    });
  }

  if (reduceMotion) staticHive($('.hive'));
  else {
    const hive = $('.hive');
    let onScreen = true;
    const sync = () => { running = onScreen && !document.hidden; };
    new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; sync(); }).observe(hive);
    document.addEventListener('visibilitychange', sync);
    agents.forEach((a, i) => play(a, SCRIPTS[i], i * 900));
    // Sidebar badges follow what the agents are doing
    setInterval(() => {
      badges[0].classList.toggle('is-working', agents.some(a => a.classList.contains('is-working')));
    }, 400);
  }

  /* ---------- GitHub activity heatmap ---------- */
  // data/contributions.json is rewritten once a day by .github/workflows/contributions.yml.
  // Shows only the weeks from the first active one onward. If the fetch fails the block stays hidden.
  (async () => {
    const heat = $('#heat');
    if (!heat) return;
    let data;
    try {
      const res = await fetch('data/contributions.json', { cache: 'no-cache' });
      if (!res.ok) return;
      data = await res.json();
    } catch { return; }

    const grid = $('.heat__grid', heat);
    const monthsEl = $('.heat__months', heat);
    const scroller = $('.heat__scroll', heat);
    const tip = $('.heat__tip', heat);
    const fmt = new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
    const monthFmt = new Intl.DateTimeFormat('en', { month: 'short', timeZone: 'UTC' });

    const start = data.weeks.findIndex(w => w.some(d => d[1] > 0));
    if (start < 0) return;
    const weeks = data.weeks.slice(start);
    const since = monthFmt.format(new Date(weeks[0].find(d => d[1] > 0)[0] + 'T00:00:00Z'));

    const cells = document.createDocumentFragment();
    const labels = document.createDocumentFragment();
    let lastMonth = -1;
    weeks.forEach((week, w) => {
      const first = new Date(week[0][0] + 'T00:00:00Z');
      const m = first.getUTCMonth();
      // A label is wider than one column, so one in the last two columns would overflow the grid
      if (m !== lastMonth && w < weeks.length - 2) {
        const s = document.createElement('span');
        s.textContent = monthFmt.format(first);
        s.style.gridColumn = String(w + 1);
        labels.append(s);
      }
      lastMonth = m;
      week.forEach(([date, n, level]) => {
        const c = document.createElement('i');
        c.dataset.l = level;
        c.dataset.tip = `${n} ${n === 1 ? 'contribution' : 'contributions'} on ${fmt.format(new Date(date + 'T00:00:00Z'))}`;
        c.tabIndex = -1;
        cells.append(c);
      });
    });
    grid.append(cells);
    monthsEl.append(labels);
    heat.style.setProperty('--weeks', weeks.length);

    $('#heat-sum').innerHTML =
      `<b>${data.total}</b> contributions since ${since}, <b>${data.commits}</b> of them commits, across <b>${data.activeDays}</b> days. Longest streak: <b>${data.longestStreak}</b> days.`;
    heat.hidden = false;
    scroller.scrollLeft = scroller.scrollWidth; // narrow screens: start at today

    const show = (c) => {
      tip.textContent = c.dataset.tip;
      tip.hidden = false;
      const b = c.getBoundingClientRect(), h = heat.getBoundingClientRect();
      const x = b.left - h.left + b.width / 2;
      tip.style.left = Math.min(Math.max(x, tip.offsetWidth / 2 + 4), h.width - tip.offsetWidth / 2 - 4) + 'px';
      tip.style.top = (b.top - h.top - 6) + 'px';
    };
    grid.addEventListener('pointerover', e => { if (e.target.dataset.tip) show(e.target); });
    grid.addEventListener('pointerleave', () => { tip.hidden = true; });
    scroller.addEventListener('scroll', () => { tip.hidden = true; }, { passive: true });
  })();
})();
