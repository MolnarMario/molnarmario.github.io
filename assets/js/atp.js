// Automation Test Platform in miniature: a scripted "screen recording" of the real dashboard,
// played with a moving cursor. Six chapters (Run, Live, History, Calendar, Schedules, PR Builder)
// loop forever; the timeline under it jumps between them. Plain JS, no dependencies.
// Markup and colours follow the real app (thrive-test-dashboard/public), scaled down to fit.
(() => {
  const W = 1000;               // the stage is laid out at this width, then scaled to the host
  const STOP = Symbol('stop');  // thrown through a chapter when it's interrupted

  /* ---------- Fake data ---------- */
  const PW = ['account › logs in and sees past orders', 'account › updates the billing address', 'account › resets the password by email', 'account › logs out from every device',
    'cart › adds a product from the shop grid', 'cart › updates quantity and recalculates', 'cart › removes the last item, shows empty state', 'cart › keeps the cart after login',
    'cart › merges a guest cart on login', 'cart › caps quantity at stock level', 'checkout › guest checkout with card', 'checkout › saves the shipping address',
    'checkout › picks the cheapest shipping rate', 'checkout › shows tax for an EU address', 'checkout › blocks an invalid postcode', 'checkout › sends the order email',
    'checkout › thank-you page lists the items', 'checkout › retries a declined card', 'search › finds products by SKU', 'search › filters by price range',
    'search › sorts by newest', 'search › shows no-results suggestions', 'search › paginates 40+ results', 'search › keeps filters on back'];
  const CY = ['cart › mini-cart opens on add', 'cart › badge count matches items', 'cart › free-shipping bar fills', 'coupon › applies a 10% coupon',
    'coupon › stacks with a sale price', 'coupon › rejects an expired code', 'coupon › removes a coupon', 'product › switches variation, updates price',
    'product › zooms the gallery', 'product › shows out-of-stock notice', 'product › reviews tab loads', 'product › related items render',
    'shop › grid lazy-loads on scroll', 'shop › category filter', 'shop › quick view modal', 'shop › compare two products', 'wishlist › adds and removes', 'wishlist › survives reload'];
  const SE = ['SmokeTest > homepage responds 200', 'SmokeTest > shop page lists products', 'CheckoutTest > guest can reach payment', 'CheckoutTest > terms must be accepted',
    'CheckoutTest > order total matches cart', 'CheckoutTest > card form validates', 'LoginTest > wrong password shows error', 'LoginTest > remember-me persists',
    'AdminTest > orders list loads', 'AdminTest > refund button visible', 'AdminTest > stock report exports', 'MobileTest > burger menu opens'];
  const TARGETS = [
    { fw: 'playwright', label: 'Playwright', lang: 'TypeScript', name: 'Storefront E2E', site: 'Local shop', url: 'http://shop.local', tests: PW, ms: 360, fail: [], skip: [] },
    { fw: 'cypress', label: 'Cypress', lang: 'TypeScript', name: 'Storefront E2E', site: 'Local shop', url: 'http://shop.local', tests: CY, ms: 520, fail: [3, 5], skip: [] },
    { fw: 'selenium', label: 'Selenium', lang: 'Java', name: 'Checkout smoke', site: 'Staging', url: 'https://staging.shop.dev', tests: SE, ms: 790, fail: [], skip: [11] }
  ];
  const ERR = "AssertionError: Timed out retrying after 4000ms: expected\n  <span.order-total> to have text '€36.00', but the text was '€40.00'\n\n    at Context.eval (cypress/e2e/coupon/apply.cy.ts:27:8)\n    at applyCoupon (cypress/support/checkout.ts:41:6)";

  // History, newest first. mins = minutes ago. fws: p/c/s.
  const RUNS = [
    { mins: 2, label: 'Storefront · 3 frameworks', fws: 'pcs', st: 'partial', r: [51, 2, 1], dur: '1m 52s', fresh: true },
    { mins: 74, label: 'Scheduled · Nightly smoke', fws: 'p', st: 'passed', r: [24, 0, 0], dur: '58s' },
    { mins: 310, label: 'PR #3748 → shop.local', fws: 'pc', st: 'partial', r: [36, 6, 0], dur: '1m 31s' },
    { mins: 1500, label: 'Checkout smoke → Staging', fws: 's', st: 'passed', r: [12, 0, 0], dur: '48s' },
    { mins: 1620, label: 'Storefront · 3 frameworks', fws: 'pcs', st: 'passed', r: [54, 0, 0], dur: '1m 47s' },
    { mins: 2950, label: 'Admin regression', fws: 'p', st: 'partial', r: [33, 3, 0], dur: '2m 12s' },
    { mins: 3100, label: 'Scheduled · Nightly smoke', fws: 'p', st: 'passed', r: [24, 0, 0], dur: '1m 01s' },
    { mins: 4400, label: 'Storefront E2E → shop.local', fws: 'c', st: 'failed', r: [0, 2, 0], dur: '21s' }
  ];
  const FW = { p: ['playwright', 'Playwright'], c: ['cypress', 'Cypress'], s: ['selenium', 'Selenium'] };

  const LOG = [
    ['PR Builder — Checkout plugin: building acme/checkout-plugin#3752 (version 100.PR3752)', 'hd'],
    ['Target site: Local shop (shop.local)'], ['Checking the site is running...'], ['Site is running.', 'ok'],
    ['Fetching PR #3752...'], ['$ git fetch origin pull/3752/head:pr-3752', 'cmd'], ['Merging origin/main into PR head...'],
    ['Building: npm ci && npm run build'], ['$ npm ci', 'cmd'], ['added 812 packages in 21s', 'dim'], ['$ npm run build', 'cmd'], ['✓ built in 6.42s', 'ok'],
    ['Stamped version 100.PR3752 into checkout-plugin.php.'], ['Installing plugin → wp-content/plugins/checkout-plugin'], ['  copied 318 file(s).', 'dim'],
    ['$ wp plugin activate checkout-plugin', 'cmd'], ["Success: Plugin 'checkout-plugin' activated.", 'ok'], ['Build and install completed successfully!', 'ok'],
    ['---', 'dim'], ['Verifying installed files match PR diff...'], ['  ✓ exact match:        41', 'ok'], ['  ✓ version-stamped:    1', 'ok'],
    ['  – source (compiled):  12', 'dim'], ['  ⚠ hash mismatch:      0', 'dim'], ['  ✗ missing on disk:    0', 'dim']
  ];

  /* ---------- Small helpers ---------- */
  function h(tag, cls, ...kids) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    for (const k of kids) if (k != null && k !== false) n.append(k);
    return n;
  }
  const pad = n => String(n).padStart(2, '0');
  const ago = mins => new Date(Date.now() - mins * 60000);
  const fmtWhen = d => d.toLocaleString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', second: '2-digit' });
  const clock = d => `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  const fmtDur = s => s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${pad(s % 60)}s`;
  const ST_TEXT = { passed: 'Passed', failed: 'Failed', partial: 'Partial fail', running: 'Running', queued: 'Queued', skipped: 'Skipped' };
  const badge = st => h('span', `st st-${st}`, ST_TEXT[st]);
  const fwBadge = t => h('span', `fw-badge fw-${t.fw}`, h('span', 'fw-name', t.label), h('span', 'fw-lang', t.lang));
  const chip = k => h('span', `fw-chip fw-${FW[k][0]}`, FW[k][1]);
  const box = () => h('span', 'cb');
  const input = (ph, cls = '') => { const i = h('span', 'in ' + cls, h('span', 'v')); i.dataset.ph = ph; return i; };
  const select = text => h('span', 'sel', h('span', 'sel__v', text));
  const SPIN = '<svg class="spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-opacity=".25" stroke-width="3"/><path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>';
  const GLYPH = { passed: '✓', failed: '✗', skipped: '•', pending: '○' };

  function testRow(title, status = 'pending') {
    const ic = h('span', 'ic');
    const row = h('div', 'trow', ic, h('span', 'tname', title), h('span', 'dur', ''));
    setRow(row, status);
    return row;
  }
  function setRow(row, status, dur) {
    row.className = 'trow ' + status;
    const ic = row.firstChild;
    if (status === 'running') ic.innerHTML = SPIN; else ic.textContent = GLYPH[status];
    if (dur) row.lastChild.textContent = dur;
  }

  /* ---------- Chapters ---------- */
  // Each chapter builds its tab from scratch, so any of them can be jumped to.
  const CHAPTERS = [
    { tab: 'run', label: 'Run', play: runChapter },
    { tab: 'live', label: 'Live', play: liveChapter },
    { tab: 'history', label: 'History', play: historyChapter },
    { tab: 'calendar', label: 'Calendar', play: calendarChapter },
    { tab: 'schedules', label: 'Schedules', play: schedulesChapter },
    { tab: 'prbuilder', label: 'PR Builder', play: prChapter }
  ];

  async function runChapter(c) {
    c.live(0);
    const status = [['up', 'up · 38ms'], ['up', 'up · 41ms'], ['up', 'up · 212ms'], ['up', 'up · 38ms']];
    const suites = [
      { t: TARGETS[0], specs: 8, tests: 24, url: 'http://shop.local', kids: [['account', 4, 1], ['cart', 6, 2], ['checkout', 8, 3], ['search', 6, 2]] },
      { t: TARGETS[1], specs: 6, tests: 18, url: 'http://shop.local' },
      { t: TARGETS[2], specs: 4, tests: 12, url: 'https://staging.shop.dev' },
      { t: { fw: 'playwright', label: 'Playwright', lang: 'TypeScript', name: 'Admin regression' }, specs: 11, tests: 36, url: 'http://shop.local' }
    ];
    const check = h('button', 'ghost', '◎ Check sites');
    const count = h('span', 'sel-count', '0 specs selected');
    const run = h('button', 'primary is-off', 'Run selected ▶');
    const table = h('table', 'run-table', h('thead', null, h('tr', null,
      ...['Suite', 'Framework', 'Language', 'Tests', 'Site', 'Status'].map(s => h('th', null, s)))));
    const rows = suites.map((s, i) => {
      const dot = h('span', 'site-status'), txt = h('span', 'status-text', 'unknown');
      const tw = h('span', 'twisty', '▸'), cb = box();
      const tb = h('tbody', 'suite-body', h('tr', 'scope-row',
        h('td', null, h('span', 'cell-name', tw, cb, h('span', 'node-label', s.t.name))),
        h('td', null, fwBadge(s.t)), h('td', 'muted', s.t.lang),
        h('td', 'muted', `${s.tests} tests · ${s.specs} specs`),
        h('td', null, select(s.url)), h('td', null, dot, txt)));
      table.append(tb);
      return { tb, tw, cb, dot, txt, s };
    });
    c.pane(h('div', 'run-toolbar',
      h('div', 'tb-left', h('button', 'ghost', 'Expand all'), h('button', 'ghost', 'Collapse all'), h('button', 'ghost', '↻ Rescan'), check),
      h('div', 'tb-right', input('Filter by keyword, optional', 'grep'), count, run)), h('div', 'tree', table));
    await c.wait(700);

    await c.click(check);
    rows.forEach(r => { r.dot.className = 'site-status checking'; r.txt.textContent = 'checking…'; });
    for (const [i, r] of rows.entries()) {
      await c.wait(220 + i * 90);
      r.dot.className = 'site-status ' + status[i][0]; r.txt.textContent = status[i][1];
    }
    await c.wait(400);

    // Open the first suite to show its spec folders, then pick three suites
    const first = rows[0];
    await c.click(first.tw);
    first.tw.textContent = '▾';
    const kids = first.s.kids.map(([name, tests, specs]) => {
      const cb = box();
      const tr = h('tr', 'node-row', h('td', null, h('span', 'cell-name', h('span', 'indent'), h('span', 'twisty', '▸'), cb, h('span', 'node-label', name))),
        h('td'), h('td'), h('td', 'muted', `${tests} tests · ${specs} spec${specs > 1 ? 's' : ''}`), h('td'), h('td'));
      tr.classList.add('is-new');
      first.tb.append(tr);
      return cb;
    });
    await c.wait(700);
    let specs = 0;
    for (const i of [0, 1, 2]) {
      const r = rows[i];
      await c.click(r.cb);
      r.cb.classList.add('on');
      if (i === 0) kids.forEach(k => k.classList.add('on'));
      specs += r.s.specs;
      count.textContent = `${specs} specs selected`;
      run.classList.remove('is-off');
      await c.wait(260);
    }
    await c.wait(500);
    await c.click(run);
    run.textContent = 'Starting…';
    await c.wait(500);
    c.live(1);
    c.toast('Run started: 3 targets, 54 tests');
    await c.wait(900);
    await c.clickTab('live');
  }

  async function liveChapter(c) {
    c.live(1);
    const totals = h('span', 'a-stat');
    const elapsed = h('span', 'a-stat');
    const head = h('div', 'run-head', h('h2', null, 'Storefront · 3 frameworks'), badge('running'), h('span', 'spacer'), totals, elapsed);
    const cancel = h('button', 'danger', 'Cancel run');
    head.append(cancel);
    const cards = TARGETS.map(t => {
      const segP = h('div', 'seg-pass'), segF = h('div', 'seg-fail'), segS = h('div', 'seg-skip');
      const cP = h('span', 'c-pass'), cF = h('span', 'c-fail'), cS = h('span', 'c-skip'), cT = h('span', 'c-total');
      const cur = h('div', 'current');
      const st = badge('running');
      const list = h('div', 'tlist');
      const rows = t.tests.map(title => testRow(title));
      list.append(...rows);
      const toggle = h('button', 'ghost toggle');
      const card = h('div', 'tcard',
        h('div', 'tcard-head', fwBadge(t), h('span', 'name', t.name), h('span', 'spacer'), st),
        h('div', 'tcard-site', h('span', 'lbl', 'on'), h('b', null, t.site), h('span', 'url', t.url)),
        h('div', 'progress', segP, segF, segS), h('div', 'counts', cP, cF, cS, cT), cur, toggle, list);
      return { t, card, segP, segF, segS, cP, cF, cS, cT, cur, st, list, rows, toggle, n: 0, p: 0, f: 0, s: 0, open: false };
    });
    const paint = k => {
      const N = k.t.tests.length;
      k.segP.style.width = k.p / N * 100 + '%'; k.segF.style.width = k.f / N * 100 + '%'; k.segS.style.width = k.s / N * 100 + '%';
      k.cP.textContent = `✓ ${k.p}`; k.cF.textContent = `✗ ${k.f}`; k.cS.textContent = `• ${k.s}`; k.cT.textContent = `${k.n}/${N}`;
      k.toggle.textContent = `${k.open ? 'Hide' : 'Show'} tests (${k.n}/${N})`;
    };
    const sum = () => cards.reduce((a, k) => [a[0] + k.p, a[1] + k.f, a[2] + k.s, a[3] + k.n], [0, 0, 0, 0]);
    const paintHead = () => { const [p, f, s, n] = sum(); totals.textContent = `✓ ${p}  ✗ ${f}  • ${s} skipped  —  ${n}/54`; };
    cards.forEach(paint); paintHead();
    const modal = h('div', 'emodal');
    c.pane(head, h('div', 'cards', ...cards.map(k => k.card)), modal);

    // The run plays out in parallel with the cursor
    let t = 0;
    const sim = (async () => {
      cards.forEach(k => { setRow(k.rows[0], 'running'); k.cur.textContent = k.t.tests[0]; });
      while (cards.some(k => k.n < k.t.tests.length)) {
        await c.wait(90);
        t += 90;
        elapsed.textContent = '⏱ ' + fmtDur(Math.round(t * 0.009));
        for (const k of cards) {
          const N = k.t.tests.length;
          if (k.n >= N || t < (k.n + 1) * k.t.ms) continue;
          const i = k.n, res = k.t.fail.includes(i) ? 'failed' : k.t.skip.includes(i) ? 'skipped' : 'passed';
          setRow(k.rows[i], res, res === 'skipped' ? '' : ((k.t.ms * 9 * (0.6 + ((i * 37) % 10) / 12)) / 100 | 0) / 10 + 's');
          if (res === 'failed') k.rows[i].append(h('span', 'info', 'i'));
          k.n++; k[res[0]]++;
          if (k.n < N) { setRow(k.rows[k.n], 'running'); k.cur.textContent = k.t.tests[k.n]; if (k.open) scrollRow(k); }
          else { k.cur.textContent = ''; k.st.replaceWith(k.st = badge(k.f ? 'failed' : 'passed')); k.card.append(h('a', 'report-link', k.t.fw === 'playwright' ? '↗ Open Playwright report' : '↗ Artifacts (screenshots, reports)')); }
          paint(k); paintHead();
        }
      }
      head.children[1].replaceWith(badge('partial'));
      cancel.replaceWith(h('a', 'report-link', '↗ Combined report'));
      c.live(0);
    })();
    const scrollRow = k => { const r = k.rows[Math.min(k.n, k.rows.length - 1)]; k.list.scrollTop = Math.max(0, r.offsetTop - k.list.clientHeight + r.offsetHeight + 22); };
    const openList = k => { k.open = true; k.list.classList.add('open'); paint(k); scrollRow(k); };

    const cursor = (async () => {
      await c.wait(1300);
      await c.click(cards[0].toggle); openList(cards[0]);
      await c.wait(900);
      await c.click(cards[1].toggle); openList(cards[1]);
      await c.hover(cards[1].list, 0, 10);
    })();
    await Promise.all([sim, cursor]);
    await c.wait(700);

    // Open the failure: the error modal the real dashboard shows
    const failed = cards[1].rows[3];
    cards[1].list.scrollTop = failed.offsetTop - 30;
    await c.wait(300);
    await c.click(failed);
    modal.append(h('div', 'emodal__box',
      h('div', 'emodal__title', 'coupon › applies a 10% coupon'),
      h('div', 'emodal__meta', badge('failed'), h('span', null, '4.2s · Local shop')),
      h('pre', 'emodal__err', ERR),
      h('a', 'report-link', '↗ Artifacts (screenshots, reports)')));
    modal.classList.add('open');
    await c.wait(3200);
    modal.classList.remove('open');
    await c.wait(500);
    await c.clickTab('history');
  }

  async function historyChapter(c) {
    c.live(0);
    const status = select('All statuses');
    const count = h('span', 'sel-count', `${RUNS.length} of ${RUNS.length} runs`);
    const tbody = h('tbody');
    const rows = RUNS.map(r => {
      const rate = Math.round(r.r[1] / (r.r[0] + r.r[1]) * 100);
      const rerun = r.st !== 'passed' ? h('button', 'mini', '↻ Re-run') : null;
      const tr = h('tr', r.fresh ? 'is-fresh' : null,
        h('td', null, fmtWhen(ago(r.mins))), h('td', 'ell', r.label),
        h('td', null, h('span', 'fw-cell', ...[...r.fws].map(chip))), h('td', null, badge(r.st)),
        h('td', 'results', h('span', 'c-pass', `✓ ${r.r[0]}`), h('span', 'c-fail', `✗ ${r.r[1]}`), h('span', 'c-skip', `• ${r.r[2]}`)),
        h('td', 'rate ' + (rate === 0 ? 'good' : rate < 20 ? 'meh' : 'bad'), `${rate}%`), h('td', null, r.dur), h('td', 'act', rerun));
      tbody.append(tr);
      return { r, tr, rerun };
    });
    c.pane(h('div', 'filter-bar', input('Search label / site…', 'search'), status, select('All sites'), select('All frameworks'), h('span', 'grow'), count),
      h('div', 'history-list', h('table', null,
        h('colgroup', null, ...[142, 0, 236, 104, 118, 66, 66, 84].map(w => { const col = h('col'); if (w) col.style.width = w + 'px'; return col; })),
        h('thead', null, h('tr', null, ...['When', 'Run', 'Frameworks', 'Status', 'Results', 'Fail rate', 'Duration', ''].map(s => h('th', null, s)))), tbody)));
    await c.wait(1600);
    await c.pick(status, ['All statuses', 'Passed', 'Failed', 'Error', 'Cancelled', 'Running'], 2);
    const keep = rows.filter(x => x.r.st !== 'passed');
    rows.forEach(x => { if (!keep.includes(x)) x.tr.classList.add('is-gone'); });
    count.textContent = `${keep.length} of ${RUNS.length} runs`;
    await c.wait(1400);
    await c.click(keep[1].rerun);
    keep[1].rerun.textContent = '↻ Queued';
    c.live(1);
    c.toast('Re-run started. Watch it in Live.');
    await c.wait(2200);
    await c.clickTab('calendar');
  }

  async function calendarChapter(c) {
    c.live(1);
    const now = new Date();
    const y = now.getFullYear(), m = now.getMonth(), today = now.getDate();
    const first = new Date(y, m, 1).getDay(), days = new Date(y, m + 1, 0).getDate();
    // Deterministic, busy-looking history for the days before today
    const kinds = ['pass', 'pass', 'pass', 'partial', 'pass', 'fail', 'pass', 'partial'];
    const runsOn = d => {
      if (d > today) return [];
      if (d === today) return ['partial', 'pass', 'partial'];
      const n = (d * 7 + 3) % 5;
      return Array.from({ length: n }, (_, i) => kinds[(d * 3 + i * 5) % kinds.length]);
    };
    const grid = h('div', 'cal-grid', ...['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => h('div', 'cal-dow', d)));
    const cells = {};
    for (let i = 0; i < first; i++) grid.append(h('div', 'cal-cell empty'));
    for (let d = 1; d <= days; d++) {
      const rs = runsOn(d);
      const cell = h('div', 'cal-cell' + (d === today ? ' today' : '') + (rs.length ? ' has-runs' : ''),
        h('div', 'daynum', String(d)),
        rs.length ? h('div', 'runcount', `${rs.length} run${rs.length > 1 ? 's' : ''}`) : null,
        rs.length ? h('div', 'cdots', ...rs.map(k => h('span', 'cdot cdot-' + k))) : null);
      cells[d] = cell; grid.append(cell);
    }
    const day = h('div', 'cal-day');
    const month = now.toLocaleString('en-US', { month: 'long', year: 'numeric' });
    c.pane(h('div', 'cal-toolbar', h('button', 'ghost', '←'), h('span', 'cal-month', month), h('button', 'ghost', '→'), h('button', 'ghost', 'Today'),
      h('span', 'cal-legend', h('span', 'cdot cdot-pass'), 'passed', h('span', 'cdot cdot-partial'), 'partial', h('span', 'cdot cdot-fail'), 'failed')), grid, day);
    const showDay = (d, list) => {
      Object.values(cells).forEach(x => x.classList.remove('picked'));
      cells[d].classList.add('picked');
      day.replaceChildren(h('div', 'cal-day__h', new Date(y, m, d).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })),
        ...list.map(([time, label, st, res]) => h('div', 'cal-run', h('span', 'muted', time), h('span', 'ell', label), badge(st), h('span', 'muted', res))));
    };
    await c.wait(1200);
    const past = [today - 1, today - 2, today - 3].find(d => d > 0 && runsOn(d).length) || today;
    await c.click(cells[past]);
    showDay(past, runsOn(past).slice(0, 3).map((k, i) => [`${pad(2 + i * 5)}:0${i}`, i ? 'Storefront · 3 frameworks' : 'Scheduled · Nightly smoke', { pass: 'passed', partial: 'partial', fail: 'failed' }[k], k === 'pass' ? '✓ 24 ✗ 0' : '✓ 33 ✗ 3']));
    await c.wait(2000);
    await c.click(cells[today]);
    showDay(today, RUNS.slice(0, 3).filter(r => r.mins < 60 * now.getHours() + now.getMinutes()).map(r =>
      [clock(ago(r.mins)).slice(0, 5), r.label, r.st, `✓ ${r.r[0]} ✗ ${r.r[1]}`]));
    await c.wait(2400);
    await c.clickTab('schedules');
  }

  async function schedulesChapter(c) {
    c.live(0);
    const tomorrow = h => { const d = new Date(); d.setDate(d.getDate() + 1); d.setHours(h, 0, 0, 0); return fmtWhen(d); };
    const card = (name, meta, next, last, on) => {
      const sw = h('span', 'switch ' + (on ? 'on' : 'off'), on ? 'Enabled' : 'Disabled');
      const now = h('button', 'ghost', '▶ Run now');
      const el = h('div', 'sched-card', h('div', null, h('div', 'sname', name), h('div', 'meta', meta)), h('span', 'spacer'),
        h('div', 'meta right', on ? `next: ${next}` : 'disabled', last ? h('div', null, last) : null), sw, now, h('button', 'ghost', 'Last run'));
      return { el, sw, now };
    };
    const a = card('Nightly smoke', 'cron: 0 3 * * * · Storefront E2E (Playwright) → Local shop', tomorrow(3), 'last: passed @ ' + fmtWhen(ago(74)), true);
    const b = card('Weekly cross-browser', 'cron: 0 6 * * 1 · Checkout smoke (Selenium) → Staging', '', 'last: passed @ ' + fmtWhen(ago(4400)), false);
    const add = h('button', 'primary', '+ New schedule');
    const form = h('div', 'sched-form');
    const list = h('div', 'sched-list', a.el, b.el);
    c.pane(h('div', 'sched-head', h('h3', null, 'Scheduled runs'), add),
      h('p', 'muted-note', 'node-cron fires only while the dashboard is running. Keep it open (or launch it at logon) for unattended runs.'), form, list);
    await c.wait(1200);
    await c.click(add);
    const name = input('e.g. Nightly regression'), cron = input('0 2 * * *'), hint = h('span', 'cron-hint');
    const checks = TARGETS.map(t => { const cb = box(); return { cb, el: h('label', 'chk', cb, `${t.name} (${t.label}) → ${t.site}`) }; });
    const save = h('button', 'primary', 'Save schedule');
    form.append(h('div', 'row', h('div', null, h('label', null, 'Name'), name), h('div', null, h('label', null, 'Cron'), cron, hint)),
      h('label', null, 'Targets'), h('div', 'site-checks', ...checks.map(x => x.el)), h('div', 'actions', save, h('button', 'ghost', 'Cancel')));
    form.classList.add('open');
    await c.wait(500);
    await c.type(name, 'Full regression, weeknights');
    await c.type(cron, '30 1 * * 1-5');
    hint.textContent = 'At 01:30, Monday through Friday';
    for (const x of checks) { await c.click(x.cb); x.cb.classList.add('on'); }
    await c.wait(300);
    await c.click(save);
    form.classList.remove('open');
    const d = new Date(); d.setDate(d.getDate() + (d.getDay() === 5 ? 3 : d.getDay() === 6 ? 2 : 1)); d.setHours(1, 30, 0, 0);
    const n = card('Full regression, weeknights', 'cron: 30 1 * * 1-5 · Storefront E2E (Playwright), Storefront E2E (Cypress), Checkout smoke (Selenium)', fmtWhen(d), null, true);
    n.el.classList.add('is-new');
    list.prepend(n.el);
    await c.wait(1000);
    await c.click(b.sw);
    b.sw.className = 'switch on'; b.sw.textContent = 'Enabled';
    b.el.querySelector('.right').firstChild.textContent = `next: ${fmtWhen((() => { const x = new Date(); x.setDate(x.getDate() + ((8 - x.getDay()) % 7 || 7)); x.setHours(6, 0, 0, 0); return x; })())}`;
    await c.wait(700);
    await c.click(n.now);
    c.live(1);
    c.toast('Full regression, weeknights: started');
    await c.wait(2000);
    await c.clickTab('prbuilder');
  }

  async function prChapter(c) {
    c.live(0);
    const project = select('Checkout plugin');
    const prs = select('— pick a PR —');
    const num = input('3752 — or paste the PR URL');
    const ver = input('100.PR<N>');
    const build = h('button', 'primary', 'Build & Install ▶');
    const stat = h('span', 'a-stat');
    const admin = h('a', 'report-link hide', '↗ Open wp-admin');
    const log = h('pre', 'prb-log');
    const verify = h('div', 'prb-verify');
    const runTests = h('button', 'primary', 'Run tests ▶');
    c.pane(h('div', 'prb-layout',
      h('div', 'prb-form', h('h3', null, 'Build a PR onto ', h('code', null, 'shop.local')),
        h('label', null, 'Project'), project,
        h('div', 'prb-scope-info', h('b', null, 'acme/checkout-plugin'), ' · plugin · ', h('code', 'mono', 'npm run build')),
        h('label', null, 'Open PRs ', h('span', 'muted', '(optional — fills the field below)')), prs,
        h('label', null, 'PR number or link'), num,
        h('label', null, 'Version ', h('span', 'muted', '(optional)')), ver,
        h('label', 'chk', h('span', 'cb on'), 'Clean install (remove the existing folder first)'),
        h('div', 'prb-actions', build),
        h('p', 'muted-note', 'The site must be running in Local before you build.')),
      h('div', 'prb-right', h('div', 'prb-log-head', stat, h('span', 'spacer'), admin, h('button', 'ghost', 'Clear')), log, verify)),
    h('div', 'prb-runtests', h('h3', null, 'Run tests on ', h('code', null, 'shop.local')),
      h('p', 'muted-note', 'Runs a suite against the PR-built site. Results appear in Live and History.'),
      h('div', 'prb-test-row', select('Storefront E2E — Cypress (TypeScript)'), h('label', 'chk', h('span', 'rad on'), "Project's tests"), h('label', 'chk', h('span', 'rad'), 'All tests'), h('span', 'grow'), runTests)));
    await c.wait(1000);
    await c.pick(prs, ['— pick a PR —', '#3752 Fix coupon rounding on the order total', '#3749 Add an Apple Pay button', '#3741 Faster cart fragments'], 1);
    prs.firstChild.textContent = '#3752 Fix coupon rounding on the order total';
    num.firstChild.textContent = 'https://github.com/acme/checkout-plugin/pull/3752'; num.classList.add('filled');
    await c.wait(300);
    ver.firstChild.textContent = '100.PR3752'; ver.classList.add('filled');
    await c.wait(700);
    await c.click(build);
    build.textContent = 'Building…'; build.classList.add('is-off');
    stat.replaceChildren(badge('running'));
    const t0 = new Date();
    for (const [i, [line, kind]] of LOG.entries()) {
      log.append(h('span', kind || '', `[${clock(new Date(t0.getTime() + i * 1300))}] ${line}`), '\n');
      log.scrollTop = log.scrollHeight;
      await c.wait(kind === 'cmd' ? 420 : 170);
    }
    stat.replaceChildren(badge('passed'));
    build.textContent = 'Build & Install ▶'; build.classList.remove('is-off');
    admin.classList.remove('hide');
    verify.append(h('div', 'prb-verify-head', '✓ Installed files match the PR'),
      h('div', 'prb-vstats', ...['✓ exact match 41', '✓ version-stamped 1', '– compiled 12', '⚠ mismatch 0', '✗ missing 0'].map(s => h('span', 'prb-vstat', s))));
    verify.classList.add('open');
    await c.wait(1600);
    await c.scrollMain(1);
    await c.wait(300);
    await c.click(runTests);
    c.live(1);
    c.toast('PR #3752: running Storefront E2E (Cypress)');
    await c.wait(2400);
    await c.scrollMain(0);
    await c.clickTab('run');
  }

  /* ---------- The player ---------- */
  function AtpDemo(host, { start = 0 } = {}) {
    const tabs = {};
    const liveBadge = h('span', 'badge');
    const nav = h('nav', 'tabs', ...[['run', 'Run'], ['live', 'Live'], ['history', 'History'], ['calendar', 'Calendar'], ['schedules', 'Schedules'], ['prbuilder', 'PR Builder']]
      .map(([k, label]) => (tabs[k] = h('span', 'tab', label, k === 'live' ? liveBadge : null))));
    const main = h('div', 'main');
    const cur = h('div', 'cursor');
    cur.innerHTML = '<svg viewBox="0 0 24 24"><path d="M5 3l14 8-6.2 1.6L16 20l-2.7 1.2-3.2-7.3L5 18z"/></svg>';
    const toastEl = h('div', 'toast');
    const stage = h('div', 'atp__stage',
      h('div', 'topbar',
        h('div', 'a-brand', Object.assign(h('span', 'mark'), { innerHTML: '<svg viewBox="0 0 60 60"><circle cx="30" cy="30" r="28" fill="#5cb946"/><path d="M18 31l8 8 16-17" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg>' }),
          h('span', 'brand-text', h('b', null, 'Automation Test Platform'), h('small', null, 'Playwright · Cypress · Selenium'))),
        nav, h('span', 'env', '4 suites · 2 sites'), h('span', 'user', h('b', null, 'admin'), h('i', null, 'Admin'))),
      main, toastEl, cur);
    const view = h('div', 'atp__view', stage);
    view.setAttribute('role', 'img');
    view.setAttribute('aria-label', 'Replay of the Automation Test Platform: picking suites and running them, watching Playwright, Cypress and Selenium progress live, filtering the run history, the calendar, adding a schedule, and building a GitHub pull request onto a local site.');
    stage.setAttribute('aria-hidden', 'true');
    const segs = CHAPTERS.map((ch, i) => {
      const b = h('button', 'atp__seg', h('i'), h('span', null, ch.label));
      b.type = 'button';
      b.setAttribute('aria-label', `Jump to ${ch.label}`);
      b.addEventListener('click', e => { e.stopPropagation(); play(i); });
      return b;
    });
    const bar = h('div', 'atp__bar', h('span', 'atp__rec', h('i'), 'Replay'), ...segs);
    const root = h('div', 'atp', view, bar);
    host.replaceChildren(root);

    // Scale the 1000px-wide stage to the host; its height is whatever is left.
    let scale = 1;
    const fit = () => {
      scale = view.clientWidth / W || 1;
      stage.style.transform = `scale(${scale})`;
      stage.style.height = view.clientHeight / scale + 'px';
    };
    const ro = new ResizeObserver(fit);
    ro.observe(view);
    fit();

    // Plays only while on screen, in a visible tab, and not covered by the dialog
    let visible = true;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
    io.observe(host);
    const paused = () => !visible || document.hidden || (!!document.querySelector('dialog[open]') && !host.closest('dialog'));

    let gen = 0, chapter = start, spent = 0, cx = 640, cy = 300;
    const DUR = [9800, 15500, 8500, 7600, 13500, 14500]; // rough length of each chapter, for the timeline
    const alive = () => host.isConnected;
    const destroy = () => { gen++; ro.disconnect(); io.disconnect(); };

    function ctx(my) {
      const check = () => { if (my !== gen) throw STOP; if (!alive()) { destroy(); throw STOP; } };
      const wait = async ms => {
        check();
        let left = ms;
        while (left > 0) {
          const step = Math.min(left, 60);
          await new Promise(r => setTimeout(r, step));
          check();
          if (paused()) continue;
          left -= step; spent += step;
        }
      };
      const at = (el, dx, dy) => {
        const s = stage.getBoundingClientRect(), r = el.getBoundingClientRect();
        return [(r.left - s.left) / scale + (dx ?? Math.min(r.width / scale / 2, 40)), (r.top - s.top) / scale + (dy ?? r.height / scale / 2)];
      };
      const hover = async (el, dx, dy) => {
        const [x, y] = at(el, dx, dy);
        const ms = Math.min(900, 260 + Math.hypot(x - cx, y - cy) * 0.7);
        cur.style.transitionDuration = ms + 'ms';
        cur.style.transform = `translate(${x}px, ${y}px)`;
        cx = x; cy = y;
        await wait(ms + 60);
      };
      const click = async (el, dx, dy) => {
        await hover(el, dx, dy);
        cur.classList.add('down'); el.classList.add('pressed');
        const ring = h('span', 'ripple'); ring.style.transform = `translate(${cx}px, ${cy}px)`;
        stage.append(ring);
        setTimeout(() => ring.remove(), 600);
        await wait(140);
        cur.classList.remove('down'); el.classList.remove('pressed');
        await wait(120);
      };
      return {
        wait, hover, click,
        pane: (...kids) => { main.scrollTop = 0; main.replaceChildren(h('div', 'pane', ...kids)); },
        live: n => { liveBadge.textContent = n; liveBadge.classList.toggle('on', n > 0); },
        toast: text => {
          toastEl.textContent = text; toastEl.classList.add('on');
          clearTimeout(toastEl._t); toastEl._t = setTimeout(() => toastEl.classList.remove('on'), 2200);
        },
        clickTab: async k => { await click(tabs[k]); },
        type: async (el, text) => {
          await click(el);
          el.classList.add('focus', 'filled');
          const v = el.firstChild;
          for (const ch of text) { v.textContent += ch; await wait(35 + (ch.charCodeAt(0) * 7) % 45); }
          await wait(250);
          el.classList.remove('focus');
        },
        pick: async (sel, options, i) => {
          await click(sel);
          const [x, y] = at(sel, 0, 0);
          const pop = h('div', 'pop', ...options.map((o, j) => h('div', j === 0 ? 'on' : '', o)));
          pop.style.left = x + 'px'; pop.style.top = y + sel.getBoundingClientRect().height / scale + 3 + 'px';
          stage.append(pop);
          try {
            await wait(450);
            await hover(pop.children[i], 30);
            pop.children[0].className = ''; pop.children[i].className = 'on';
            await wait(300);
            sel.firstChild.textContent = options[i];
          } finally { pop.remove(); }
          await wait(200);
        },
        scrollMain: async to => {
          const from = main.scrollTop, end = to ? main.scrollHeight - main.clientHeight : 0;
          for (let k = 1; k <= 12; k++) { await wait(40); main.scrollTop = from + (end - from) * (1 - Math.pow(1 - k / 12, 3)); }
        }
      };
    }

    async function play(i) {
      const my = ++gen;
      spent = 0; chapter = i;
      stage.querySelectorAll('.pop, .ripple').forEach(n => n.remove());
      try {
        for (;;) {
          chapter = i; spent = 0;
          host.dataset.chapter = i;
          segs.forEach((s, k) => { s.classList.toggle('is-on', k === i); s.classList.toggle('is-done', k < i); });
          Object.entries(tabs).forEach(([k, t]) => t.classList.toggle('active', k === CHAPTERS[i].tab));
          await CHAPTERS[i].play(ctx(my));
          i = (i + 1) % CHAPTERS.length;
        }
      } catch (e) { if (e !== STOP) throw e; }
    }

    // Timeline fill for the current chapter
    const tick = () => {
      if (!alive()) return;
      const seg = segs[chapter];
      if (seg) seg.firstChild.style.width = Math.min(100, spent / DUR[chapter] * 100) + '%';
      segs.forEach((s, k) => { if (k !== chapter) s.firstChild.style.width = k < chapter ? '100%' : '0'; });
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    play(start);
    return { get chapter() { return chapter; }, destroy };
  }

  window.AtpDemo = AtpDemo;
})();
