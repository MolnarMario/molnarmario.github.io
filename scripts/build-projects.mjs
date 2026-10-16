// Generates the project pages from assets/js/projects.js and data/projects/<slug>.json:
//   projects/<slug>/index.html            the project page
//   projects/<slug>/changelog/index.html  its changelog, release notes or commit log
// plus sitemap.xml. No network: fetch-projects.mjs gets the data. Run after editing
// projects.js or the page templates below:
//   node scripts/build-projects.mjs
import { readFile, writeFile, mkdir, readdir, rm, access } from 'node:fs/promises';
import vm from 'node:vm';

const SITE = 'https://thebarbellengineer.com';
const root = new URL('../', import.meta.url);
const ctx = { window: {} };
vm.runInNewContext(await readFile(new URL('assets/js/projects.js', root), 'utf8'), ctx);
const { PROJECTS, PROJECT_ORDER, HIVE_SCRIPTS } = ctx.window;

const exists = path => access(new URL(path, root)).then(() => true, () => false);
const loadData = async slug => {
  try { return JSON.parse(await readFile(new URL(`data/projects/${slug}.json`, root), 'utf8')); }
  catch { return null; }
};

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const day = new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
const month = new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric', timeZone: 'UTC' });
const utc = d => new Date(d + 'T00:00:00Z');
// Exact date in the HTML; page.js swaps in "3 days ago" and keeps the date as a tooltip
const time = (d, rel = false) => d ? `<time datetime="${d}"${rel ? ' data-rel' : ''}>${day.format(utc(d))}</time>` : '';
const ext = (href, label, cls = '') => `<a${cls ? ` class="${cls}"` : ''} href="${esc(href)}" target="_blank" rel="noopener">${label}</a>`;
const arrow = '<span aria-hidden="true">&nearr;</span>';

const logName = data => data?.log.source.kind === 'commits' ? 'Commit log' : 'Changelog';
const entryId = (e, seen) => {
  let id = e.version ? 'v' + e.version.replace(/[^\w]+/g, '-') : 'd' + (e.date || 'entry');
  while (seen.has(id)) id += '-';
  seen.add(id);
  return id;
};
const entryTitle = e => e.version && e.title ? `<span class="entry__v">${esc(e.version)}</span> ${esc(e.title)}`
  : e.version ? `Version ${esc(e.version)}`
  : e.title ? esc(e.title)
  : day.format(utc(e.date));
// First paragraph of an entry, or its first bullet when it has no paragraph
const summary = html => {
  const p = html.match(/<p>([\s\S]*?)<\/p>/)?.[1];
  if (p) return p;
  const li = html.match(/<li>([\s\S]*?)(?:<ul>|<ol>|<\/li>)/)?.[1];
  return li ?? '';
};

/* ---------- Figures ---------- */
// {name|format} in projects.js text, and data-live="[project.]name|format" on the
// homepage, come from data/projects/<slug>.json. The top of projects.js lists the names
// and formats.

const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
  'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty'];
const monthName = new Intl.DateTimeFormat('en', { month: 'long', timeZone: 'UTC' });
const FORMAT = {
  k: n => Math.round(n / 1000) + 'k',
  kb: n => Math.round(n / 1024) + ' KB',
  word: n => WORDS[n] ?? n,
  Word: n => { const w = String(FORMAT.word(n)); return w[0].toUpperCase() + w.slice(1); },
  month: d => monthName.format(utc(d)),
  minor: v => v.split('.').slice(0, 2).join('.'),
  v: v => 'v' + v,
  approx: s => '~' + s,
};
function show(value, formats, where) {
  const out = formats.reduce((v, f) => {
    if (!FORMAT[f]) throw new Error(`${where}: unknown format "${f}"`);
    return FORMAT[f](v);
  }, value);
  return typeof out === 'number' ? out.toLocaleString('en') : String(out);
}

// Everything a project's text can use: its counted facts plus what its data already says
function factsOf(data) {
  if (!data) return {};
  const versioned = data.log.entries.filter(e => e.version);
  return {
    ...data.facts,
    commits: data.commits,
    version: versioned[0]?.version,
    versions: versioned.length || undefined,
    firstVersion: versioned.at(-1)?.date,
    lastVersion: versioned[0]?.date,
  };
}

// A token with no value stops the build, so a page never ships with "{tests}" in it.
const TOKEN = /\{(\w+)((?:\|\w+)*)\}/g;
const fill = (text, facts, where) => text.replace(TOKEN, (_, name, formats) => {
  if (facts[name] == null) throw new Error(`${where}: no value for {${name}}`);
  return show(facts[name], formats.split('|').slice(1), where);
});
// The same, through every string of a project (its `facts` rules stay as they are)
const fillAll = (x, facts, where) =>
  typeof x === 'string' ? fill(x, facts, where)
  : Array.isArray(x) ? x.map(v => fillAll(v, facts, where))
  : x && typeof x === 'object' ? Object.fromEntries(Object.entries(x).map(([k, v]) => [k, k === 'facts' ? v : fillAll(v, facts, where)]))
  : x;

/* ---------- Shell ---------- */

const NAV = `
  <header class="nav" id="top">
    <div class="nav__inner wrap">
      <a class="brand" href="/" aria-label="Mario Molnar, home">
        <span class="brand__mark" aria-hidden="true">MM</span>
        <span class="brand__name">Mario Molnar</span>
      </a>
      <nav class="nav__links" aria-label="Sections">
        <a href="/#work" class="is-active">Work</a>
        <a href="/#process">Process</a>
        <a href="/#about">About</a>
        <a href="/#contact" class="nav__cta">Get in touch</a>
      </nav>
      <button class="theme-btn" type="button" aria-label="Toggle light and dark theme">
        <svg class="i-sun" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4.5"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8"/></svg>
        <svg class="i-moon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11Z"/></svg>
      </button>
    </div>
  </header>`;

const FOOT = `
  <footer class="foot wrap">
    <p>Built and tested by me. &copy; <span id="year">${new Date().getUTCFullYear()}</span> Mario Molnar</p>
    <a href="#top">Back to top <span aria-hidden="true">&uarr;</span></a>
  </footer>`;

function page({ title, description, path, image, bodyClass = '', body, scripts = [] }) {
  const url = SITE + path;
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <meta name="theme-color" content="#0d0c0b" media="(prefers-color-scheme: dark)">
  <meta name="theme-color" content="#f5f2ec" media="(prefers-color-scheme: light)">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:url" content="${url}">
  <meta property="og:image" content="${SITE}${image || '/assets/img/og.png'}">
  <link rel="canonical" href="${url}">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" href="/assets/img/favicon.svg" type="image/svg+xml">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500&family=Instrument+Serif:ital@0;1&display=swap">
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Klee+One:wght@600&text=%E3%81%82%E3%81%8B%E3%81%8D%E3%82%B5%E3%81%B2%E3%83%A2&display=swap">
  <script>
    try { var t = localStorage.getItem('theme'); if (t) document.documentElement.dataset.theme = t; } catch (e) {}
  </script>
  <link rel="stylesheet" href="/assets/css/site.css">
  <link rel="stylesheet" href="/assets/css/pages.css">
</head>
<body${bodyClass ? ` class="${bodyClass}"` : ''}>
<!-- Generated by scripts/build-projects.mjs from assets/js/projects.js and data/projects/. Edit those, not this file. -->
${body}
${scripts.map(s => `  <script src="${s}" defer></script>`).join('\n')}
  <script src="/assets/js/page.js" defer></script>
</body>
</html>
`;
}

const crumbs = items => `<nav aria-label="Breadcrumb"><ol class="crumbs">${items.map(([label, href]) =>
  href ? `<li><a href="${href}">${esc(label)}</a></li>` : `<li aria-current="page">${esc(label)}</li>`).join('')}</ol></nav>`;

/* ---------- Media ---------- */

const CLS = { y: 'l-you', t: 'l-tool', o: 'l-ok', d: 'l-dim', w: 'l-warn' };
function hive() {
  const models = ['opus', 'sonnet', 'opus', 'sonnet'];
  const agents = HIVE_SCRIPTS.map((script, i) => `<div class="agent"><div class="agent__head"><span class="agent__dot"></span><b>Agent ${i + 1}</b><span>HiraKataQuest</span><em>${models[i]}</em></div><pre class="agent__out">${script.map(([k, t]) => `<span class="${CLS[k]}">${esc(t)}</span>`).join('\n')}</pre></div>`).join('\n');
  return `<figure class="hive p-media" aria-label="Mock-up of AI Hive running four coding agents on HiraKataQuest">
        <div class="hive__bar"><img src="/assets/img/aihive-logo.webp" width="20" height="20" alt=""><span class="hive__title">AI Hive</span><span class="hive__usage"><span class="hive__meter"><i style="--v:.42"></i></span>5h 42%</span></div>
        <div class="hive__body">
          <aside class="hive__side" aria-hidden="true">
            <p class="hive__label">Workspaces</p>
            <div class="ws"><span class="ws__badge is-working">4</span>HiraKataQuest</div>
            <div class="ws"><span class="ws__badge">1</span>one-more-tile</div>
            <div class="ws"><span class="ws__badge">1</span>Lifting-app</div>
            <div class="ws"><span class="ws__badge is-idle">0</span>vinted-flags</div>
            <div class="ws"><span class="ws__badge">1</span>TBE-site</div>
          </aside>
          <div class="hive__grid" aria-hidden="true">
${agents}
          </div>
        </div>
        <figcaption class="hive__cap">A mock-up of four agents working on HiraKataQuest at once. They check the shared board before touching a file.</figcaption>
      </figure>`;
}

const KANA = `<div class="feature__media art art--kana p-media" role="img" aria-label="Illustration of HiraKataQuest's writing screen: the kana あ traced on a genkouyoushi grid with a score of 92">
        <div class="phone">
          <div class="phone__notch"></div>
          <div class="kana-app">
            <div class="kana-app__top"><span>Writing</span><span class="pill">あ row</span></div>
            <div class="genko"><span class="genko__ghost">あ</span><span class="genko__ink">あ</span></div>
            <div class="kana-app__score"><span>Score</span><b class="ok">92</b></div>
            <div class="kana-strip"><span>か</span><span>き</span><span>サ</span><span>ひ</span><span>モ</span></div>
          </div>
        </div>
      </div>`;

async function media(id, p) {
  if (id === 'aihive') return hive();
  if (id === 'hirakata') return KANA;
  const has800 = await exists(`assets/img/${p.img}-800.webp`);
  const srcset = has800 ? ` srcset="/assets/img/${p.img}-800.webp 800w, /assets/img/${p.img}-1600.webp 1600w" sizes="(min-width: 1200px) 1120px, 100vw"` : '';
  const img = `<img src="/assets/img/${p.img}-1600.webp"${srcset} width="1600" height="1000" alt="${esc(p.title)} screenshot" decoding="async">`;
  // The test platform plays its recorded walkthrough over the screenshot (assets/js/atp.js via page.js)
  return `<div class="feature__media shot p-media"${p.replay ? ' data-atp' : ''}>${img}</div>`;
}

/* ---------- Project page ---------- */

function activity(p, data) {
  if (!data) return `
        <section class="p-side__block" aria-labelledby="act-h">
          <h2 class="p-h" id="act-h">Repository activity</h2>
          <p class="p-muted">${esc(p.title)} isn't on GitHub yet, so there's no public commit history or changelog to show.</p>
        </section>`;
  const versioned = data.log.entries.find(e => e.version);
  const max = Math.max(1, ...data.weeks.map(w => w[1]));
  const inWindow = data.weeks.reduce((n, w) => n + w[1], 0);
  const bars = data.weeks.map(([wk, n]) =>
    `<i style="--h:${(n / max).toFixed(3)}" title="Week of ${day.format(utc(wk))}: ${n} ${n === 1 ? 'commit' : 'commits'}"${n ? '' : ' class="is-zero"'}></i>`).join('');
  const recent = data.recent.map(c =>
    `<li><a href="${data.url}/commit/${c.sha}" target="_blank" rel="noopener"><code>${c.sha}</code></a> <span>${esc(c.subject)}</span> ${time(c.date)}</li>`).join('\n            ');
  return `
        <section class="p-side__block" aria-labelledby="act-h">
          <h2 class="p-h" id="act-h">Repository activity</h2>
          <dl class="act">
            <div><dt>Commits</dt><dd>${data.commits}</dd></div>
            <div><dt>Last commit</dt><dd>${time(data.lastCommit?.date, true)}</dd></div>
            ${versioned ? `<div><dt>Latest version</dt><dd>${esc(versioned.version)}</dd></div>` : ''}
            <div><dt>First commit</dt><dd>${data.firstCommit ? month.format(utc(data.firstCommit)) : ''}</dd></div>
          </dl>
          <div class="weeks" role="img" aria-label="${inWindow} commits in the last 26 weeks, by week">${bars}</div>
          <p class="weeks__cap"><span>26 weeks ago</span><span>This week</span></p>
          <h3 class="p-h p-h--sm">Latest commits</h3>
          <ol class="commits">
            ${recent}
          </ol>
          <p class="p-more">${ext(data.url + '/commits', `All commits on GitHub ${arrow}`)}</p>
        </section>`;
}

function latest(p, data) {
  if (!data || !data.log.entries.length) return '';
  const seen = new Set();
  const ids = data.log.entries.map(e => entryId(e, seen));
  const items = data.log.entries.slice(0, 3).map((e, i) => {
    const href = `changelog/#${ids[i]}`;
    const body = e.commits
      ? `<ul class="commit-list">${e.commits.slice(0, 4).map(c => `<li>${esc(c.subject)}</li>`).join('')}${e.commits.length > 4 ? `<li class="p-muted">and ${e.commits.length - 4} more</li>` : ''}</ul>`
      : `<p>${summary(e.html)}</p>`;
    return `
          <li class="change">
            <p class="change__meta">${e.version && e.title ? `<span class="entry__v">${esc(e.version)}</span>` : ''}${time(e.date)}</p>
            <h3 class="change__title"><a href="${href}">${e.commits ? day.format(utc(e.date)) : e.title ? esc(e.title) : `Version ${esc(e.version)}`}</a></h3>
            <div class="change__body">${body}</div>
          </li>`;
  }).join('');
  const name = logName(data);
  return `
      <section class="p-section wrap" aria-labelledby="latest-h">
        <div class="p-section__head">
          <h2 class="p-h" id="latest-h">Latest changes</h2>
          <a class="btn btn--ghost btn--sm" href="changelog/">Full ${name.toLowerCase()} <span aria-hidden="true">&rarr;</span></a>
        </div>
        <ol class="changes">${items}
        </ol>
      </section>`;
}

function story(s) {
  if (!s) return '';
  return `
          <h2 class="p-h">How it was built</h2>
          <div class="story">
            <p>${esc(s.context)}</p>
            <h3 class="story__h">Decisions that mattered</h3>
            <ul class="decisions">
              ${s.decisions.map(([lead, detail]) => `<li><b>${esc(lead)}</b> ${esc(detail)}</li>`).join('\n              ')}
            </ul>
            ${s.testing ? `<h3 class="story__h">How it's tested</h3>\n            <p>${esc(s.testing)}</p>` : ''}
            <h3 class="story__h">Where it stands</h3>
            <p>${esc(s.status)}</p>
          </div>`;
}

function pager(id) {
  const i = PROJECT_ORDER.indexOf(id), n = PROJECT_ORDER.length;
  const prev = PROJECTS[PROJECT_ORDER[(i - 1 + n) % n]], next = PROJECTS[PROJECT_ORDER[(i + 1) % n]];
  return `
      <nav class="pager wrap" aria-label="More projects">
        <a class="pager__link" href="/projects/${prev.slug}/" rel="prev"><span>Previous project</span><b>${esc(prev.title)}</b></a>
        <a class="pager__link pager__link--next" href="/projects/${next.slug}/" rel="next"><span>Next project</span><b>${esc(next.title)}</b></a>
      </nav>`;
}

async function projectPage(id, p, data) {
  const actions = [];
  p.links.forEach(([label, href], i) => actions.push(ext(href, `${esc(label)} ${arrow}`, `btn ${i === 0 ? 'btn--primary' : 'btn--ghost'}`)));
  if (data?.log.entries.length) actions.push(`<a class="btn btn--ghost" href="changelog/">${logName(data)}</a>`);
  const features = p.features.map(([name, detail]) => `<li><b>${esc(name)}</b> ${esc(detail)}</li>`).join('\n            ');
  const body = `${NAV}
  <main>
    <article class="p">
      <header class="p-head wrap">
        ${crumbs([['Work', '/#work'], [p.title]])}
        <p class="tag">${esc(p.tag)}</p>
        <h1 class="p-title">${esc(p.title)}</h1>
        <p class="p-lede">${esc(p.lede)}</p>
        <div class="p-actions">
          ${actions.join('\n          ')}
        </div>
        ${p.note ? `<p class="p-muted p-note">${esc(p.note)}</p>` : ''}
      </header>

      <div class="wrap p-media-wrap">
      ${await media(id, p)}
      </div>

      <div class="p-cols wrap">
        <section class="p-main" aria-labelledby="feat-h">
          <h2 class="p-h" id="feat-h">What it does</h2>
          <ol class="feat-list">
            ${features}
          </ol>${story(p.story)}
          <h2 class="p-h">Made with</h2>
          <ul class="stack">${p.stack.map(t => `<li>${esc(t)}</li>`).join('')}</ul>
        </section>
        <aside class="p-side">${activity(p, data)}
        </aside>
      </div>
${latest(p, data)}
    </article>
${pager(id)}
  </main>
${FOOT}`;
  return page({
    title: `${p.title} | Mario Molnar`, description: p.lede, path: `/projects/${p.slug}/`,
    image: p.img ? `/assets/img/${p.img}-1600.webp` : null,
    body, scripts: p.replay ? ['/assets/js/atp.js'] : [],
  });
}

/* ---------- Changelog page ---------- */

function changelogPage(id, p, data) {
  const { source, entries } = data.log;
  const name = logName(data);
  const seen = new Set();
  const ids = entries.map(e => entryId(e, seen));
  const repoLink = ext(data.url, `MolnarMario/${esc(data.repo)}`);
  const intro = {
    changelog: `Every version of ${esc(p.title)}, newest first, from ${ext(source.url, esc(source.label))} in ${repoLink}.`,
    releases: `Every release of ${esc(p.title)}, newest first, from its ${ext(source.url, 'GitHub releases')}.`,
    commits: `${esc(p.title)} has no written changelog yet, so this is its ${ext(source.url, 'commit history')} grouped by day, newest first. Merge commits are left out.`,
  }[source.kind];
  const LONG = 2400;
  const articles = entries.map((e, i) => {
    let content;
    if (e.commits) {
      content = `<ul class="commit-list">${e.commits.map(c => `<li><a href="${data.url}/commit/${c.sha}" target="_blank" rel="noopener"><code>${c.sha}</code></a> ${esc(c.subject)}</li>`).join('')}</ul>`;
    } else if (e.html.length > LONG && e.html.startsWith('<p>')) {
      // Long technical entries: the opening paragraph, then the rest behind a toggle
      const cut = e.html.indexOf('</p>') + 4;
      content = `<div class="prose">${e.html.slice(0, cut)}</div><details class="entry__more"><summary>Full notes</summary><div class="prose">${e.html.slice(cut)}</div></details>`;
    } else {
      content = `<div class="prose">${e.html}</div>`;
    }
    return `
        <article class="entry" id="${ids[i]}">
          <header class="entry__head">
            <h2 class="entry__title"><a href="#${ids[i]}">${entryTitle(e)}</a></h2>
            <p class="entry__meta">${e.commits ? `${e.commits.length} ${e.commits.length === 1 ? 'commit' : 'commits'}` : time(e.date)}${e.url ? ` &middot; ${ext(e.url, `Release page ${arrow}`)}` : ''}</p>
          </header>
          ${content}
        </article>`;
  }).join('');
  const index = entries.map((e, i) => `<li><a href="#${ids[i]}">${e.version ? esc(e.version) : day.format(utc(e.date))}</a></li>`).join('');
  const counted = source.kind === 'commits'
    ? `${entries.reduce((n, e) => n + e.commits.length, 0)} commits over ${entries.length} days`
    : `${entries.length} ${source.kind === 'releases' ? 'releases' : 'entries'}`;
  const body = `${NAV}
  <main>
    <header class="p-head wrap">
      ${crumbs([['Work', '/#work'], [p.title, '../'], [name]])}
      <p class="tag">${esc(p.tag)}</p>
      <h1 class="p-title">${esc(p.title)} ${name.toLowerCase()}</h1>
      <p class="p-lede">${intro} The site checks for new ${source.kind === 'commits' ? 'commits' : 'entries'} once a day.</p>
      <p class="p-count">${counted}${entries.at(-1)?.date ? `, since ${month.format(utc(entries.at(-1).date))}` : ''}</p>
    </header>
    <div class="log wrap">
      <nav class="log__index" aria-label="${name} entries"><p class="p-h p-h--sm">Jump to</p><ol>${index}</ol></nav>
      <div class="log__entries">${articles}
      </div>
    </div>
    <nav class="pager wrap" aria-label="Back">
      <a class="pager__link" href="../"><span>Back to</span><b>${esc(p.title)}</b></a>
    </nav>
  </main>
${FOOT}`;
  return page({
    title: `${p.title} ${name.toLowerCase()} | Mario Molnar`,
    description: `What changed in ${p.title}, ${counted}, newest first.`,
    path: `/projects/${p.slug}/changelog/`, image: p.img ? `/assets/img/${p.img}-1600.webp` : null, body,
  });
}

/* ---------- Write ---------- */

const out = async (path, html) => {
  await mkdir(new URL(path.replace(/[^/]+$/, ''), root), { recursive: true });
  await writeFile(new URL(path, root), html);
};

const slugs = new Set();
const urls = ['/'];
const allData = {};
for (const id of PROJECT_ORDER) {
  const data = PROJECTS[id].repo ? await loadData(PROJECTS[id].slug) : null;
  const p = fillAll(PROJECTS[id], factsOf(data), PROJECTS[id].slug);
  allData[id] = data;
  slugs.add(p.slug);
  const dir = `projects/${p.slug}/`;
  await out(dir + 'index.html', await projectPage(id, p, data));
  urls.push('/' + dir);
  if (data?.log.entries.length) { await out(dir + 'changelog/index.html', changelogPage(id, p, data)); urls.push(`/${dir}changelog/`); }
  else await rm(new URL(dir + 'changelog/', root), { recursive: true, force: true });
  // Projects link straight to their apps, so clear out any old framed copy
  await rm(new URL(dir + 'play/', root), { recursive: true, force: true });
}
// Drop pages of projects that were removed from projects.js
for (const d of await readdir(new URL('projects/', root))) {
  if (!slugs.has(d)) await rm(new URL(`projects/${d}`, root), { recursive: true, force: true });
}
// Homepage figures follow the same data, so they can't drift from the project pages:
//   <b data-live="aihive.commits">519</b>      a project's fact, as on its page
//   <b data-live="commits">890</b>             a site-wide one (below)
//   <meta data-live-tpl="... {projects|word} ..." content="...">   for attributes
// A project whose data file is missing keeps the figure that's there.
const site = {
  projects: PROJECT_ORDER.length,
  commits: Object.values(allData).reduce((n, d) => n + (d?.commits ?? 0), 0) || null,
  // On the web since 2015, the first year on the About timeline
  years: new Date().getUTCFullYear() - 2015,
};
function liveValue(key) {
  const [path, ...formats] = key.split('|');
  const [id, name] = path.includes('.') ? path.split('.') : [null, path];
  if (id && !PROJECTS[id]) throw new Error(`index.html: data-live="${key}" names no project`);
  if (id && !allData[id]) return null;
  const value = id ? factsOf(allData[id])[name] : site[name];
  if (value == null) throw new Error(`index.html: no value for data-live="${key}"`);
  return { value, text: show(value, formats, 'index.html') };
}
const home = await readFile(new URL('index.html', root), 'utf8');
const patched = home
  .replace(/<(\w+)\b([^>]*?\sdata-live="([^"]+)"[^>]*)>[^<]*<\/\1>/g, (m, tag, attrs, key) => {
    const v = liveValue(key);
    if (!v) return m;
    // The count-up animation in site.js runs to data-count
    if (typeof v.value === 'number') attrs = attrs.replace(/data-count="[^"]*"/, `data-count="${v.value}"`);
    return `<${tag}${attrs}>${esc(v.text)}</${tag}>`;
  })
  .replace(/<meta\b[^>]*\sdata-live-tpl="([^"]*)"[^>]*>/g, (m, tpl) =>
    m.replace(/\scontent="[^"]*"/, ` content="${fill(tpl, site, 'index.html')}"`));
if (patched !== home) await writeFile(new URL('index.html', root), patched);

await writeFile(new URL('sitemap.xml', root), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url><loc>${SITE}${u}</loc></url>`).join('\n')}
</urlset>
`);
console.log(`${slugs.size} project pages, ${urls.length} URLs in sitemap.xml`);
