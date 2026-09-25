// Mario Molnar, personal site. Plain JS, no dependencies.
(() => {
  const root = document.documentElement;
  root.classList.add('js');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  /* ---------- Project details (shown in the dialog) ---------- */
  // features: [name, detail], ordered by how much each one matters to someone using the app.
  const GH = 'https://github.com/MolnarMario/';
  const PROJECTS = {
    aihive: {
      tag: 'Windows desktop app',
      title: 'AI Hive',
      art: '[data-project="aihive"] .hive',
      lede: 'I built it when one terminal per agent stopped scaling, somewhere around the fifth project. Every other project on this page came out of it.',
      features: [
        ['Many agents, real terminals, one window.', 'Each tile is a Windows pseudo-console (ConPTY) running Claude Code, Gemini, Grok or a plain shell, so every CLI behaves exactly as it does on its own. Grids go from 1×1 to 4×3.'],
        ['Agents that don\'t trip over each other.', 'Agents in a workspace share an activity board through an MCP server. Before one edits a file, it can see that another agent already claimed it.'],
        ['Work keeps running when you look away.', 'Each workspace maps to a project folder and keeps executing while hidden. Its sidebar badge stays green while agents are healthy and pulses amber while one is working.'],
        ['Waits out usage limits for you.', 'It reads plan usage from the CLI into the top bar. When a limit runs out it can wait for the reset and resume the agents on its own.'],
        ['See what each agent is doing at a glance.', 'Every agent row shows its task, or Claude Code\'s own conversation title read live from the transcript, so you don\'t have to read its terminal.'],
        ['Per-agent model, effort and mode.', 'Dropdowns map to the real CLI flags. The card header follows whatever you change inside the terminal, and the permission mode survives a restart.'],
        ['A sidebar you can organize.', 'Drag agents and workspaces to reorder them, and group workspaces into collapsible categories. The layout persists across restarts.']
      ],
      stack: ['Python', 'PySide6 / Qt', 'Windows ConPTY', 'MCP', 'pytest'],
      links: [['Source on GitHub', GH + 'ai-hive']]
    },
    hirakata: {
      tag: 'Android app',
      title: 'HiraKataQuest',
      art: '[data-project="hirakata"] .feature__media',
      lede: 'Most kana apps stop at recognition. This one makes you write each character by hand and tells you how well you wrote it.',
      features: [
        ['Your handwriting gets a real score.', 'Geometry checks plus ML Kit digital-ink recognition score what you actually drew, with no consolation floor. A calibration suite pins it: a clean trace scores 95 or more, a random line 12 or less.'],
        ['Trace the handwritten form, not the font.', 'You write over a ghost of the kaisho (school handwriting) form on a genkouyoushi grid, by finger or stylus. The ink widens with pen pressure like a brush.'],
        ['Stroke order for every character.', 'An animated demo draws each stroke with the recorded rhythm and pen lifts, with play, pause, replay and speed controls. Words get one demo per kana.'],
        ['Write from memory.', 'Quiz me shows only the romaji and hides the guide. It works on whole words as well as single characters, and scores each kana in a word separately.'],
        ['A reading track for printed kana.', 'Quizzes run in either direction, by multiple choice or by typing the romaji, plus flip flashcards with audio.'],
        ['See what still needs work.', 'The library tints every character from red to green by your average score.'],
        ['Hear it, and remember it.', 'A speaker button reads any kana or word aloud with the phone\'s Japanese voice. Each of the 46 basic hiragana has a memory story: あ is APPLE.'],
        ['All of hiragana and katakana.', 'Voiced, combined and extended kana are opt-ins, so beginners start with the 46 basics and add the rest when ready.']
      ],
      stack: ['Kotlin', 'Jetpack Compose', 'Room', 'ML Kit Digital Ink', 'Gradle'],
      links: [['Download the APK', GH + 'HiraKataQuest-releases/releases/latest'], ['Source on GitHub', GH + 'HiraKataQuest']]
    },
    tile: {
      tag: 'Browser game',
      title: 'One More Tile',
      img: 'tile',
      lede: 'A cross-stitch puzzle inspired by the game Proverbs. Solving it uncovers a hidden pixel-art painting, one region at a time.',
      features: [
        ['Three puzzle types on one canvas.', 'Fill-a-pix clues cover the board, with sudoku patches (4×4 up to 9×9) and picross patches whose solution is part of the painting.'],
        ['Every region you finish reveals the art.', 'A content-aware watershed grows the regions along the picture\'s own edges, so a finished region shows a recognizable piece of the painting, not a random blob.'],
        ['Never a guess.', 'Five difficulty tiers, and a verifier script checks that every tier of every painting solves by logic alone.'],
        ['Co-op for up to four.', 'Split-screen on one screen, or online with a room code.'],
        ['Hints near where you\'re working.', 'Press H and it points at a forced move close to your cursor and explains why it\'s forced.'],
        ['Nine paintings, saved as you go.', 'Each painting autosaves separately, with a timer that remembers your time, undo, pan and zoom, and full gamepad support.'],
        ['One file.', 'The whole game is a single HTML file with zero dependencies.']
      ],
      stack: ['HTML', 'Canvas', 'Vanilla JS', 'Node verifier scripts'],
      links: [['Play it', 'https://molnarmario.github.io/one-more-tile/'], ['Source on GitHub', GH + 'one-more-tile']]
    },
    chess: {
      tag: 'Browser game',
      title: 'Chess 2.0',
      img: 'chess', mob: true,
      lede: 'Chess with an RPG layer. The king watches and never changes. Everything else can grow.',
      features: [
        ['Pieces evolve.', 'A pawn with 2 points becomes a knight or bishop, those become a rook at 6, a rook becomes a queen at 10, and a queen with 20 turns into an Amazon that also moves like a knight.'],
        ['Captures earn points.', '1 for a pawn, 3 for a knight or bishop, 5 for a rook, 10 for a queen.'],
        ['Play a friend or the computer.', 'Online against a friend, or against an AI at several difficulties, with an optional clock.'],
        ['Gambling mode.', 'Any capture can become a 50/50 roll that doubles the points or destroys your piece.']
      ],
      stack: ['HTML', 'Vanilla JS', 'WebRTC networking'],
      links: [['Play it', 'https://molnarmario.github.io/chess2.0/'], ['Source on GitHub', GH + 'chess2.0']]
    },
    ironlog: {
      tag: 'Web app',
      title: 'Ironlog',
      img: 'ironlog', mob: true,
      lede: 'The powerlifting tracker I use for my own training. No account, and nothing leaves your browser.',
      features: [
        ['Log a session set by set.', 'RPE or percentage intensity, per-set gear, readiness meters and session timing, from a 47-lift exercise library.'],
        ['Know which plates go on the bar.', 'The plate loader draws the barbell and solves the plates per side, with bar and collar options. The plate icon on any logged set sends that weight straight to it.'],
        ['Track food against your targets.', 'Calories and macros against daily targets from a 92-food pantry plus your own foods, with water and bodyweight.'],
        ['Training and food on one calendar.', 'The month view can overlay each day\'s calories, macros and bodyweight on top of the training grid.'],
        ['Switch kg and lb freely.', 'Weights are stored in kilograms and converted for display, so changing units never rewrites your history.'],
        ['Your old data comes along.', 'On first load it offers to import data from the older single-file version, and it never deletes the original.']
      ],
      stack: ['React', 'TypeScript', 'Vite', 'localStorage'],
      links: [['Open the app', 'https://molnarmario.github.io/testing-out-my-lifting-app/'], ['Source on GitHub', GH + 'testing-out-my-lifting-app']]
    },
    vinted: {
      tag: 'Chrome extension',
      title: 'Vinted Country Flags',
      img: 'vinted',
      lede: 'Vinted shows you items from sellers all over Europe and never says where they are. This extension does.',
      features: [
        ['A flag on every listing.', 'The seller\'s country flag sits in the corner of each item on the homepage, in search and on the item page.'],
        ['Mostly free.', 'The catalog API already returns the seller\'s currency when it differs from yours. On vinted.ro one catalog call resolved 93 of 94 items with no extra requests.'],
        ['Works on every Vinted domain.', 'No per-country code. It found every card on vinted.pl, .de, .co.uk and .ro without a change.'],
        ['Euro sellers fill in closest first.', 'A euro could mean any of eighteen markets, so those cost one profile lookup each. Cards near the screen go first, and the popup shows how many are left.'],
        ['Learns new markets by itself.', 'It builds the currency-to-country table from Vinted\'s own countries endpoint and caches it for a week.'],
        ['One cache across countries.', 'The cache lives in the service worker, so a seller found on vinted.fr is already known on vinted.de.']
      ],
      stack: ['JavaScript', 'Chrome Manifest V3', 'Vinted web API'],
      links: [['Download v2.1.0', GH + 'vinted-country-flags/releases/latest'], ['Source on GitHub', GH + 'vinted-country-flags']]
    },
    expense: {
      tag: 'Web app',
      title: 'Common Expense Tracker',
      img: 'expense', mob: true,
      lede: 'Split shared monthly costs between any number of people and see who owes whom, with no account.',
      features: [
        ['Who owes whom, settled.', 'Add each month\'s shared costs and it works out the transfers that square everyone up.'],
        ['Share one tracker live.', 'Two people can edit the same tracker from different devices. A change on a phone shows up on the other laptop in well under a second.'],
        ['The server can\'t read your data.', 'Every record is encrypted in the browser with a 256-bit key, wrapped by a key derived from your password (PBKDF2-SHA256, 600,000 iterations). The server never sees either.'],
        ['Hand someone one file.', 'The whole app builds into a single 200 KB HTML file. Save it anywhere and double-click it, no install.'],
        ['Money that adds up.', 'Amounts are stored as whole cents, never floats. Splitting 10,00 three ways gives 3,34 / 3,33 / 3,33, and "42,50" and "240.924,00" both parse correctly.'],
        ['Your data, portable.', 'Export any set of months as JSON or CSV.'],
        ['Tested hard.', '116 unit tests, a two-client protocol smoke test, and a UI test that drives two headless Chrome profiles as two devices.']
      ],
      stack: ['Vanilla JS', 'Web Crypto', 'Cloudflare Workers', 'Durable Objects', 'WebSockets'],
      links: [],
      note: 'Not on GitHub yet.'
    },
    dashboard: {
      tag: 'QA platform',
      title: 'Automation Test Platform',
      img: 'dashboard',
      lede: 'The QA tooling I always wanted. It runs end-to-end suites, shows every test live and keeps the history, without ever modifying the suites.',
      features: [
        ['Three frameworks, one live view.', 'Playwright, Cypress and Selenium suites run from the same dashboard. Each target gets a live card with a progress bar, pass/fail/skip counts and failures as they happen.'],
        ['Any suite against any site.', 'A suite says how to run, a site says where. Pick any registered site from a dropdown on the suite\'s row.'],
        ['Test a pull request in one step.', 'Paste a GitHub PR link and it builds that plugin or theme, installs it on a local WordPress site and lets you run any suite against it.'],
        ['Runs in parallel.', 'The same suite against two sites, or two frameworks against one site, run at once. Cancel stops the whole process tree.'],
        ['Scheduled runs and full history.', 'Cron schedules fire while the dashboard runs, and every run is kept, filterable by site and framework, with links to its reports.'],
        ['Shareable reports.', 'HTML and PDF reports for any run.'],
        ['Behind a login.', 'The dashboard, API, reports and live streams all need a session, with roles for who can do what.']
      ],
      stack: ['Node.js', 'Express', 'Playwright', 'Cypress', 'Selenium'],
      links: [['Source on GitHub', GH + 'thrive-test-dashboard']]
    },
    video: {
      tag: 'Web app',
      title: 'Video Production Tracker',
      img: 'video', mob: true,
      lede: 'I make videos, so I built the tracker I wanted. Each project is a script split into sections.',
      features: [
        ['Know what\'s filmed and what made the edit.', 'Every script section has its own filmed and edited checkboxes, so nothing gets forgotten between shoot and cut.'],
        ['Progress at a glance.', 'Progress bars for filming, editing and publishing, per project and overall.'],
        ['Track where it went live.', 'Publishing status per platform: YouTube, LinkedIn, Facebook, Instagram and TikTok.'],
        ['Write the script in place.', 'Quick-add templates for hooks, intros, main points, B-roll and calls to action, with a rich-text editor per section.'],
        ['Safe local storage.', 'Everything saves to the browser with a versioned schema. JSON backup and restore checks the file before touching your data.']
      ],
      stack: ['React', 'TypeScript', 'Vite', 'Tailwind CSS'],
      links: [['Source on GitHub', GH + 'video-production']]
    }
  };

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

  const links = $$('.nav__links a');
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
          e.target.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
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

  /* ---------- Project dialog ---------- */
  const modal = $('#modal');
  const media = $('#m-media');
  let lastFocus = null;
  let goingBack = false;

  function el(tag, props = {}, text) {
    const n = document.createElement(tag);
    Object.assign(n, props);
    if (text) n.textContent = text;
    return n;
  }

  function openProject(id, fromHistory = false) {
    const p = PROJECTS[id];
    if (!p) return;
    lastFocus = document.activeElement;
    media.replaceChildren();
    if (p.img) {
      media.append(el('img', { src: `assets/img/${p.img}-1600.webp`, alt: `${p.title} screenshot`, width: 1600, height: 1000 }));
      if (p.mob) media.append(el('img', { className: 'modal__phone', src: `assets/img/${p.img}-mob.webp`, alt: '', width: 480, height: 1039 }));
    } else if (p.art) {
      const art = $(p.art);
      if (art) {
        const copy = art.cloneNode(true);
        if (copy.matches('.hive')) staticHive(copy);
        media.append(copy);
      }
    }
    $('#m-tag').textContent = p.tag;
    $('#m-title').textContent = p.title;
    $('#m-lede').textContent = p.lede;
    $('#m-list').replaceChildren(...p.features.map(([name, detail]) => {
      const li = el('li');
      li.append(el('b', {}, name), ' ' + detail);
      return li;
    }));
    $('#m-stack').replaceChildren(...p.stack.map(t => el('li', {}, t)));
    const actions = $('#m-links');
    actions.replaceChildren(...p.links.map(([label, href], i) =>
      el('a', { className: 'btn ' + (i === 0 ? 'btn--primary' : 'btn--ghost'), href, target: '_blank', rel: 'noopener' }, label)));
    if (p.note) actions.append(el('p', { className: 'modal__note' }, p.note));
    modal.showModal();
    $('.modal__panel').scrollTop = 0;
    // Give the open dialog its own history entry, so the phone's Back button closes it
    // instead of leaving the site. popstate below handles the Back press.
    if (!fromHistory) history.pushState({ project: id }, '', '#' + id);
  }

  function closeProject() {
    if (!modal.open) return;
    modal.close();
  }
  modal.addEventListener('close', () => {
    // Closed with the X, Esc or the backdrop: drop the entry openProject pushed.
    // Closed by Back: popstate already left that entry, so state is empty here.
    // goingBack stops a second close from stepping back past the page itself.
    if (history.state && history.state.project && !goingBack) { goingBack = true; history.back(); }
    if (lastFocus) lastFocus.focus({ preventScroll: true });
  });
  addEventListener('popstate', e => {
    goingBack = false;
    const id = e.state && e.state.project;
    if (PROJECTS[id]) { if (!modal.open) openProject(id, true); }
    else if (modal.open) modal.close();
  });
  $('.modal__close').addEventListener('click', closeProject);
  modal.addEventListener('click', e => { if (e.target === modal) closeProject(); });

  document.addEventListener('click', e => {
    const t = e.target.closest('[data-open]');
    if (t) { e.preventDefault(); openProject(t.dataset.open); }
  });
  // Clicking the featured media also opens the details
  $$('.feature__media, .feature .hive').forEach(m => {
    m.style.cursor = 'pointer';
    m.addEventListener('click', () => openProject(m.closest('[data-project]').dataset.project));
  });
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

  $('#year').textContent = new Date().getFullYear();

  /* ---------- Hive replay ---------- */
  // Each agent plays a scripted session. y = prompt, t = tool call, o = success, d = narration, w = problem found.
  const SCRIPTS = [
    [
      ['y', 'make the stroke-order demo replayable from the guide panel'],
      ['t', 'Read components/CharacterGuidePanel.kt'],
      ['t', 'Read animation/StrokeAnimationEngine.kt'],
      ['d', 'The engine already has reset(). Adding a replay button that calls it and restarts the clock.'],
      ['t', 'Edit CharacterGuidePanel.kt  +24 -3'],
      ['t', 'Bash  ./gradlew assembleDebug'],
      ['o', 'BUILD SUCCESSFUL'],
      ['y', 'install it on the Pixel'],
      ['t', 'Bash  adb install -r app-debug.apk'],
      ['o', 'Success']
    ],
    [
      ['y', 'review the scoring change, look for edge cases'],
      ['t', 'Read scoring/GeometryScorer.kt'],
      ['w', '! a hooked stroke scores 0 if the pen lifts early'],
      ['t', 'Edit GeometryScorer.kt  +11 -2'],
      ['t', 'Bash  ./gradlew test --tests *GeometryScorer*'],
      ['o', 'GeometryScorerTest passed'],
      ['d', 'Posted to the board: "scorer fix, only touches GeometryScorer.kt"']
    ],
    [
      ['y', 'typing "o" for を in the quiz gets marked wrong'],
      ['t', 'Read model/RomajiMatch.kt'],
      ['d', 'The deck spells を "wo" but it\'s pronounced "o". Accept "o" for を only, never "wo" for お.'],
      ['t', 'Edit RomajiMatch.kt  +6 -1'],
      ['t', 'Edit RomajiMatchTest.kt  +18'],
      ['t', 'Bash  ./gradlew test --tests *RomajiMatch*'],
      ['o', 'RomajiMatchTest passed']
    ],
    [
      ['y', 'a clean エ scores 65 with "Looks more like 工"'],
      ['t', 'Read .aihive/board.md'],
      ['d', 'Agent 2 is in GeometryScorer.kt. Staying out of it.'],
      ['t', 'Read scoring/KanaLookalikes.kt'],
      ['d', 'ML Kit can\'t tell katakana エ from the kanji 工, they\'re the same drawing. A twin match should count as recognized.'],
      ['t', 'Edit KanaLookalikes.kt  +14 -1'],
      ['t', 'Bash  ./gradlew test --tests *KanaLookalikes*'],
      ['o', 'KanaLookalikesTest passed']
    ]
  ];
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

  // Deep links: /#hirakata opens that project. Runs last so the hive code above is ready.
  // The bare page goes underneath, so Back from a shared link closes the dialog first.
  const hash = location.hash.slice(1);
  if (PROJECTS[hash]) {
    history.replaceState(null, '', location.pathname + location.search);
    openProject(hash);
  }
})();
