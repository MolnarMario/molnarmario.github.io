// Project data, shared by the homepage dialog (site.js) and the generated
// project pages (scripts/build-projects.mjs reads this file with node:vm).
// Edit here, then run: node scripts/build-projects.mjs
(() => {
  // Order of the project pages (and their prev/next links), same as the homepage.
  window.PROJECT_ORDER = ['aihive', 'hirakata', 'tile', 'dashboard', 'ironlog', 'chess', 'vinted', 'expense', 'video'];

  // slug: URL of the project page. repo: GitHub repo name. log: where its changelog comes from
  // (a CHANGELOG.md split at that heading level, GitHub releases, or commit history).
  // play: a same-origin app URL the play page can frame.
  // features: [name, detail], ordered by how much each one matters to someone using the app.
  const GH = 'https://github.com/MolnarMario/';
  window.PROJECTS = {
    aihive: {
      slug: 'ai-hive', repo: 'ai-hive', log: { from: 'changelog', file: 'CHANGELOG.md', level: 2 },
      tag: 'Windows desktop app',
      title: 'AI Hive',
      art: '[data-project="aihive"] .hive',
      lede: 'I built it when one terminal per assistant stopped scaling, somewhere around the fifth project. It lets me keep several workstreams moving at once and see all of them in one place.',
      features: [
        ['Many agents, real terminals, one window.', 'Each tile is a Windows pseudo-console (ConPTY) running Claude Code, Gemini, Grok or a plain shell, so every CLI behaves exactly as it does on its own. Grids go from 1×1 to 4×3.'],
        ['Agents that don\'t trip over each other.', 'Agents in a workspace share an activity board through an MCP server. Before one edits a file, it can see that another agent already claimed it.'],
        ['Work keeps running when you look away.', 'Each workspace maps to a project folder and keeps executing while hidden. Its sidebar badge stays green while agents are healthy and pulses amber while one is working.'],
        ['Waits out usage limits for you.', 'It reads plan usage from the CLI into the top bar. When a limit runs out it can wait for the reset and resume the agents on its own.'],
        ['See what each agent is doing at a glance.', 'Every agent row shows its task, or Claude Code\'s own conversation title read live from the transcript, so you don\'t have to read its terminal.'],
        ['Per-agent model, effort and mode.', 'Dropdowns map to the real CLI flags. The card header follows whatever you change inside the terminal, and the permission mode survives a restart.'],
        ['A sidebar you can organize.', 'Drag agents and workspaces to reorder them, and group workspaces into collapsible categories. The layout persists across restarts.']
      ],
      story: {
        context: 'I started AI Hive on 5 July 2026, when I was running more coding agents than I could follow in separate terminal windows. Since then it has been built by the agents it runs: they take tasks, coordinate on the shared board and ship through pull requests, and every release gets a numbered changelog entry.',
        decisions: [
          ['Session data is never only in memory.', 'Adding or removing an agent saves at once, saves are atomic (a temp file, then a rename) and a failed load keeps the old file as a backup instead of deleting it. Each rule has a regression test, and the README traces several of them to sessions where agents were lost.'],
          ['One copy at a time, enforced by Windows.', 'A named mutex refuses a second launch, so two copies can never overwrite each other\'s session file.'],
          ['Closing a card kills everything it started.', 'Each card\'s processes run in a Windows Job Object, so a shell\'s grandchildren die with it, even if the app itself crashes.'],
          ['Agents work in lanes.', 'An agent can get its own git worktree. It flags finished work with a "Task done" commit, and an integrator agent merges a batch through one pull request once a GPT-6-Luna review comes back clean.']
        ],
        testing: 'A smoke suite of over 3,400 checks drives the real app headlessly, with real child processes, in up to six parallel workers. One end-to-end test talks to a live Claude Code agent, closes the app, reopens it and checks that the same conversation comes back on the same card, which is exactly where data used to get lost.',
        status: 'In daily use. I run my projects from it, this site included.'
      },
      stack: ['Python', 'PySide6 / Qt', 'Windows ConPTY', 'MCP', 'pytest'],
      links: [['Source on GitHub', GH + 'ai-hive']]
    },
    hirakata: {
      slug: 'hirakataquest', repo: 'HiraKataQuest', log: { from: 'changelog', file: 'CHANGELOG.md', level: 3 },
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
      story: {
        context: 'AI agents built the first version from three written phase prompts, starting on 3 July 2026. The first build session was lost before anything was written down, so the repo\'s HISTORY.md is a recovery record: what each phase asked for, what shipped and how every step was verified.',
        decisions: [
          ['Cut a feature the day after it landed.', 'Phase 3 added a spaced-repetition study mode with a scheduler, a lesson generator and a guided session. I removed it on 5 July and kept free practice and quizzes, with built-in practice sets for structure. Its tables stay in the database unused, because dropping them would take a destructive migration.'],
          ['Trace the font, animate the real strokes.', 'The ghost you trace is drawn by the system font, which guarantees a correct shape. The stroke-order demo comes from KanjiVG\'s stroke paths, so both match real calligraphic proportions.'],
          ['Contracts before parallel work.', 'Each phase started with a fixed design document and domain types, and then three or four workstreams built against it at once. Phase 3\'s four workstreams went green on the first integration build.']
        ],
        testing: '272 unit tests across 28 files. After Phase 2 and again after Phase 3, two independent review agents went through the code, and both rounds came back with no blocking defects. The live database migrations were checked on a real Pixel 7 running Android 16.',
        status: 'Version 0.4.0 is out as a downloadable APK, with all of hiragana and katakana, a reading track and nearly 700 words.'
      },
      stack: ['Kotlin', 'Jetpack Compose', 'Room', 'ML Kit Digital Ink', 'Gradle'],
      links: [['Download the APK', GH + 'HiraKataQuest-releases/releases/latest'], ['Source on GitHub', GH + 'HiraKataQuest']]
    },
    tile: {
      slug: 'one-more-tile', repo: 'one-more-tile', log: { from: 'changelog', file: 'RELEASE-NOTES.md', level: 2 },
      play: 'https://thebarbellengineer.com/one-more-tile/',
      tag: 'Browser game',
      title: 'One More Tile',
      img: 'tile', board: true,
      lede: 'A cross-stitch puzzle inspired by the game Proverbs. Solving it uncovers a hidden pixel-art painting, one region at a time.',
      features: [
        ['Three puzzle types on one canvas.', 'Fill-a-pix clues cover the board, with sudoku patches (4×4 up to 9×9) and picross patches whose solution is part of the painting.'],
        ['Every region you finish reveals the art.', 'A content-aware watershed grows the regions along the picture\'s own edges, so a finished region shows a recognizable piece of the painting, not a random blob.'],
        ['Never a guess.', 'Five difficulty tiers, and a verifier script checks that every tier of every painting solves by logic alone.'],
        ['Co-op for up to four.', 'Split-screen on one screen, or online with a room code.'],
        ['Hints near where you\'re working.', 'Press H and it points at a forced move close to your cursor and explains why it\'s forced.'],
        ['Nine paintings, saved as you go.', 'Each painting autosaves separately, with a timer that remembers your time, undo, pan and zoom, and full gamepad support.'],
        ['No build step, no install.', 'The game and its puzzle generator live in one HTML file, next to the precomputed boards. Open it and play.']
      ],
      story: {
        context: 'I started it on 13 June 2026 as a single HTML file. It still has no build step and no install: the game and its generator live in index.html, next to the precomputed boards. 60 versions shipped between June and September.',
        decisions: [
          ['Repair the picture, never hand out answers.', 'Where the solver would stall on a truly ambiguous spot, the generator flips a few pixels of the stitch texture until every region falls to plain counting. That\'s why no tile is ever pre-filled, on any difficulty.'],
          ['Regions follow the painting.', 'A marker-controlled watershed grows the regions along the picture\'s own edges, so a finished region shows a recognisable piece of the art.'],
          ['Ship the boards ready-made.', 'Generation is deterministic, so every player was computing the same bytes, up to 35 seconds on the largest canvas. Since 0.30.0 the boards ship precomputed, and a check rebuilds each one and asserts the shipped bytes match.'],
          ['Trust the connection, not the message.', 'Version 0.33.0 rebuilt online play so a player\'s identity comes from the connection a message arrived on, after a review found one guest could pose as the host.']
        ],
        testing: 'An audit mode rebuilds every canvas at every difficulty and asserts zero pre-filled tiles, every region solvable from the shipped clues and every picross patch solvable by line logic. Versus was played across two browser tabs over the live connection broker before release, which turned up the fixes in 0.33.1.',
        status: 'Live and free to play, solo, in co-op or in versus.'
      },
      stack: ['HTML', 'Canvas', 'Vanilla JS', 'Node verifier scripts'],
      links: [['Play it', 'https://thebarbellengineer.com/one-more-tile/'], ['Source on GitHub', GH + 'one-more-tile']]
    },
    chess: {
      slug: 'chess-2', repo: 'chess2.0', log: { from: 'commits' },
      play: 'https://thebarbellengineer.com/chess2.0/',
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
      story: {
        context: 'It started on 13 June 2026 as chess with an RPG layer, in one HTML file. Online play came in August, and so did the work that made it safe.',
        decisions: [
          ['Rules without the page.', 'The move logic was tangled up with dialogs, animations and networking in one function. I pulled it out into a rules engine with no page, timer or network code, so it can be tested on its own.'],
          ['Send the move, not the result.', 'Online play first shipped the whole game state to the other player, who applied it as is, including move-log HTML that could run script. Now each side sends only the move, checks it against its own legal moves, replays it and compares a position hash after every move.'],
          ['Dice nobody controls.', 'Gamble rolls come from a seed both players contribute when they connect, so both boards roll the same result and neither side reports its own outcome.']
        ],
        testing: 'Three test suites cover the rules engine, the network protocol and replaying a game from its moves.',
        status: 'Live. Play a friend online or the computer.'
      },
      stack: ['HTML', 'Vanilla JS', 'WebRTC networking'],
      links: [['Play it', 'https://thebarbellengineer.com/chess2.0/'], ['Source on GitHub', GH + 'chess2.0']]
    },
    ironlog: {
      slug: 'ironlog', repo: 'testing-out-my-lifting-app', log: { from: 'commits' },
      play: 'https://thebarbellengineer.com/testing-out-my-lifting-app/',
      tag: 'Web app',
      title: 'Ironlog',
      img: 'ironlog',
      lede: 'The powerlifting tracker I use for my own training. No account, and nothing leaves your browser.',
      features: [
        ['Log a session set by set.', 'RPE or percentage intensity, per-set gear, readiness meters and session timing, from a 47-lift exercise library.'],
        ['Know which plates go on the bar.', 'The plate loader draws the barbell and solves the plates per side, with bar and collar options. The plate icon on any logged set sends that weight straight to it.'],
        ['Track food against your targets.', 'Calories and macros against daily targets from a 92-food pantry plus your own foods, with water and bodyweight.'],
        ['Training and food on one calendar.', 'The month view can overlay each day\'s calories, macros and bodyweight on top of the training grid.'],
        ['Switch kg and lb freely.', 'Weights are stored in kilograms and converted for display, so changing units never rewrites your history.'],
        ['Your old data comes along.', 'On first load it offers to import data from the older single-file version, and it never deletes the original.']
      ],
      story: {
        context: 'It began on 11 June 2026 as a single 424 KB HTML file holding a minified React bundle. In August I rebuilt it as a Vite, React and TypeScript project, one tab at a time, with the old build kept as the reference for how everything should behave.',
        decisions: [
          ['Kilograms underneath.', 'Weights are stored in kilograms and converted for display, so switching units never rewrites your history.'],
          ['Never lose the old data.', 'On first load it offers to import data from the original build, reports how many days and sets came across, names any exercise it couldn\'t match and never deletes the original.'],
          ['Parity you can check.', 'Every class in the original stylesheet was diffed against the new code. 17 are unused, and all 17 were already dead in the original.'],
          ['Say so when saving fails.', 'If the browser refuses to store data, in private mode or with full storage, a banner says so instead of failing silently.']
        ],
        testing: 'Unit tests cover the plate solver and the food maths, and every build runs the TypeScript typecheck first.',
        status: 'In use for my own training. The workout, plates and food tabs are all rebuilt.'
      },
      stack: ['React', 'TypeScript', 'Vite', 'localStorage'],
      links: [['Open the app', 'https://thebarbellengineer.com/testing-out-my-lifting-app/'], ['Source on GitHub', GH + 'testing-out-my-lifting-app']]
    },
    vinted: {
      slug: 'vinted-country-flags', repo: 'vinted-country-flags', log: { from: 'releases' },
      tag: 'Chrome extension',
      title: 'Vinted Country Flags',
      img: 'vinted',
      lede: 'Vinted shows you items from sellers all over Europe and never says where they are. This extension does.',
      features: [
        ['A flag on the listings you browse.', 'The seller\'s country flag sits in the corner of each item on the homepage, in search results and on seller pages.'],
        ['Reads what the page already knows.', 'Seller ids come from the page\'s own data and from the requests Vinted makes anyway. On a vinted.ro search that named 96 of 96 sellers in 8 ms, with no extra requests.'],
        ['Works on every Vinted domain.', 'No per-country code. It found every card on vinted.pl, .de, .co.uk and .ro without a change.'],
        ['Cards near the screen go first.', 'Where a seller lives costs one profile lookup, once. Cards in and near the viewport are looked up first, and the popup shows how many are still coming.'],
        ['Learns new markets by itself.', 'It builds the currency-to-country table from Vinted\'s own countries endpoint and caches it for a week.'],
        ['One cache across countries.', 'Sellers are cached for 30 days in the service worker, so a seller found on vinted.fr is already known on vinted.de.'],
        ['Polite to Vinted.', 'It stays under the measured rate limit, shares one budget across every tab and backs off whenever Vinted says to.']
      ],
      story: {
        context: 'Vinted shows listings from all over Europe and never says where the seller is. The extension reads that from data the page already has, and asks Vinted only when it has to.',
        decisions: [
          ['Read what the page already received.', 'Seller ids come from the page\'s own server-rendered data and from the requests Vinted\'s front end makes anyway. On a vinted.ro search that named the sellers of 96 of 96 cards in 8 ms, with no extra requests.'],
          ['Measure the rate limit, then stay under it.', '30 requests to the profile endpoint succeed and the 31st gets a 429. The extension allows 20 at once and 0.8 per second after that, shared by every tab, so Vinted\'s own front end keeps some headroom.'],
          ['Adapt when Vinted changes.', 'On 8 October 2026 the endpoint that made most lookups free started returning 404. Version 2.2 dropped it and now learns exchange rates from sellers it already knows, so a converted price can name the seller\'s currency for free.'],
          ['No flag beats a wrong flag.', 'A card whose seller nothing named gets no flag rather than a guess.']
        ],
        testing: 'Node tests cover the currency rule against the real 27-market table, price parsing in every market\'s number format, the rate limiter and both feed parsers. The parts that depend on Vinted\'s pages were checked against live pages on five Vinted domains.',
        status: 'Version 2.2.0. Install it by loading the unpacked extension in Chrome.'
      },
      stack: ['JavaScript', 'Chrome Manifest V3', 'Vinted web API'],
      links: [['Download the latest release', GH + 'vinted-country-flags/releases/latest'], ['Source on GitHub', GH + 'vinted-country-flags']]
    },
    expense: {
      slug: 'expense-tracker', repo: 'common-expense-tracker', log: { from: 'changelog', file: 'CHANGELOG.md', level: 2 },
      play: 'https://expenses.thebarbellengineer.com/',
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
        ['Tested hard.', '125 unit tests, a two-client protocol smoke test, and a UI test that drives two headless Chrome profiles as two devices.']
      ],
      story: {
        context: 'I built it on 30 August 2026 from a written PRD with numbered acceptance scenarios, in one long day: the local-only version first, then export and the single-file build, then end-to-end encrypted sharing. It went live on its own domain on 26 September.',
        decisions: [
          ['The server never sees your data.', 'Records are encrypted in the browser before they leave it, with a key wrapped by your password, so the sharing server stores only ciphertext.'],
          ['Money in whole cents.', 'No floats anywhere. Splitting 10,00 three ways gives 3,34 / 3,33 / 3,33.'],
          ['One file you can hand to someone.', 'The build inlines everything into one HTML file that works from a double-click, with no install.'],
          ['Invite-only sharing.', 'Creating a shared tracker needs an invite code, and each one is capped at 2 MB, so a stranger can\'t fill the server.']
        ],
        testing: '125 unit tests, a protocol smoke test with two clients, and a UI check that drives two headless Chrome profiles as two devices editing the same tracker.',
        status: 'Live at expenses.thebarbellengineer.com.'
      },
      stack: ['Vanilla JS', 'Web Crypto', 'Cloudflare Workers', 'Durable Objects', 'WebSockets'],
      links: [['Open the app', 'https://expenses.thebarbellengineer.com/'], ['Source on GitHub', GH + 'common-expense-tracker']]
    },
    dashboard: {
      slug: 'automation-test-platform', repo: 'thrive-test-dashboard', log: { from: 'changelog', file: 'CHANGELOG.md', level: 2 },
      tag: 'QA platform',
      title: 'Automation Test Platform',
      img: 'dashboard', replay: true,
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
      story: {
        context: 'I write Playwright suites for a living, and every framework came with its own runner, reports and history. On my own time I built the one dashboard I wanted: run Playwright, Cypress and Selenium suites against any site, without changing the suites.',
        decisions: [
          ['Suites times sites.', 'A suite says how to run and a site says where. Every suite gets the base URL and admin credentials as environment variables, so any suite can target any registered site.'],
          ['Adapters that admit their limits.', 'Where a framework can\'t do something, the dashboard says so instead of faking it. Cypress has no command-line title filter, so a keyword filter is ignored for it, with a warning, rather than quietly running more tests than you asked for.'],
          ['Hardened before going public.', 'A security pass on 20 August 2026 blocked environment injection into the processes it starts, encrypted stored site passwords with AES-256-GCM and bound the server to localhost by default.']
        ],
        status: 'Runs on your own machine, behind a login with roles. The source is public.'
      },
      stack: ['Node.js', 'Express', 'Playwright', 'Cypress', 'Selenium'],
      links: [['Source on GitHub', GH + 'thrive-test-dashboard']]
    },
    video: {
      slug: 'video-production-tracker', repo: 'video-production', log: { from: 'commits' },
      play: 'https://thebarbellengineer.com/video-production/',
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
      story: {
        context: 'It was planned up front: the data model, how progress is worked out across the production stages, how storage and backups behave, and a phased roadmap, all written down in a plan that went in with the first commit on 23 August 2026.',
        decisions: [
          ['Progress that doesn\'t mislead.', 'Overall progress weights filming at 40%, editing at 40% and publishing at 20%, so a project with many script sections doesn\'t drown out its publishing.'],
          ['Check a backup before touching your data.', 'An imported file is parsed, and its projects, sections and platform states are validated and repaired. You see how many projects it holds before you choose to merge or replace.'],
          ['Rich text, sanitized.', 'Each script section has a rich-text editor, and its HTML is sanitized before it\'s saved.']
        ],
        status: 'Live. Everything stays in your browser.'
      },
      stack: ['React', 'TypeScript', 'Vite', 'Tailwind CSS'],
      links: [['Open the app', 'https://thebarbellengineer.com/video-production/'], ['Source on GitHub', GH + 'video-production']]
    }
  };

  // The AI Hive replay on the homepage and the AI Hive page: each agent plays a scripted session.
  window.HIVE_SCRIPTS = [
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
})();
