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
      stack: ['Kotlin', 'Jetpack Compose', 'Room', 'ML Kit Digital Ink', 'Gradle'],
      links: [['Download the APK', GH + 'HiraKataQuest-releases/releases/latest'], ['Source on GitHub', GH + 'HiraKataQuest']]
    },
    tile: {
      slug: 'one-more-tile', repo: 'one-more-tile', log: { from: 'changelog', file: 'CHANGELOG.md', level: 2 },
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
        ['One file.', 'The whole game is a single HTML file with zero dependencies.']
      ],
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
      slug: 'expense-tracker', repo: null,
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
      links: [['Open the app', 'https://expenses.thebarbellengineer.com/']],
      note: 'Not on GitHub yet.'
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
