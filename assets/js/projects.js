// Project data, shared by the homepage dialog (site.js) and the generated
// project pages (scripts/build-projects.mjs reads this file with node:vm).
// Edit here, then run: node scripts/build-projects.mjs
(() => {
  // Order of the project pages (and their prev/next links), same as the homepage.
  window.PROJECT_ORDER = ['aihive', 'dashboard', 'hirakata', 'ironlog', 'tile', 'chess', 'vinted', 'expense', 'video'];

  // slug: URL of the project page. repo: GitHub repo name. log: where its changelog comes from
  // (a CHANGELOG.md split at that heading level, GitHub releases, or commit history).
  // features: [name, detail], ordered by how much each one matters to someone using the app.
  // Or chapters: [{ title, story, points: [[name, detail], ...] }, ...] in place of features.
  // featuresIntro (optional): one line under the "What it does" heading.
  // start (optional): { intro, steps: [[name, detail], ...] }, a Get started section.
  //
  // Figures that change with the repo are written as {name} or {name|format} in the text.
  // fetch-projects.mjs counts each project's `facts` in its repo once a day:
  //   { lines: /path/ }                  lines in every file whose path matches
  //   { count: /text/, in: /path/ }      matches of the text in those files
  //   { files: /path/, containing? }     files whose path matches (and whose text does)
  //   { capture: /(\d+)/, in: 'file' }    the number the pattern captures in one file
  //   { bytes: 'file' }                  size of one file
  // Every project with a repo also has {commits}, {version} (newest in its changelog),
  // {versions} (how many) and {firstVersion} / {lastVersion} (their dates).
  // Formats, chainable: k (72k), kb (202 KB), word (nine), Word (Nine), month (June),
  // minor (0.43.2 to 0.43), v (v0.43), approx (~). build-projects.mjs fills them in.
  const GH = 'https://github.com/MolnarMario/';
  window.PROJECTS = {
    aihive: {
      slug: 'ai-hive', repo: 'ai-hive', log: { from: 'changelog', file: 'CHANGELOG.md', level: 2 },
      facts: {
        pyLines: { lines: /\.py$/ },
        checks: { capture: /(\d[\d,]*)\s+checks\s+drive/, in: 'README.md' },
        workers: { capture: /up\s+to\s+(\d+|[a-z]+)\s+worker\s+processes/i, in: 'README.md' }
      },
      tag: 'Windows desktop app',
      title: 'AI Hive',
      art: '[data-project="aihive"] .hive',
      lede: 'Somewhere around the fifth project, I had five terminals open and no idea which agent was waiting on me. AI Hive puts every coding agent in one window, tells you which one needs you, and keeps them from overwriting each other\'s work.',
      // chapters: the problem first (story), then what the app does about it (points).
      // Most important first. `text` in backticks renders as code.
      featuresIntro: 'Six problems I kept running into, and what the app does about each, most important first.',
      chapters: [
        {
          title: 'See every agent at once',
          story: 'Before AI Hive, most of my day was alt-tab. I cycled through terminal windows just to find the one agent that had stopped to ask me something, while the others sat idle waiting for the same check. Now they all fit on one screen, and the screen tells me where to look.',
          points: [
            ['One grid, real terminals.', 'Every card is a real Windows console running Claude Code, Codex, Gemini, Grok or a plain shell, so each tool behaves exactly as it does on its own. Projects sit in the sidebar as workspaces.'],
            ['A status light for every project.', 'The sidebar badge pulses amber while an agent works, stays green when they\'re idle, turns red on a crash and goes grey when nothing runs. The taskbar icon counts the busy ones.'],
            ['A "?" and a chime when an agent needs you.', 'You hear it from another window, and the waiting card is marked, so a question never sits unanswered for an hour.'],
            ['Each card says what it\'s doing.', 'The header shows the conversation title, the model, effort and mode, and how full the context window is. It follows `/model` and `/effort` changes live.']
          ]
        },
        {
          title: 'Close it, and nothing is lost',
          story: 'The worst thing a tool like this can do is lose your work, and early on it did, a few times. Each of those sessions became a rule with a test behind it. Today you can close the app or reboot the PC and come back to exactly where you were.',
          points: [
            ['Every agent returns to its own conversation.', 'Each card is pinned to its chat and resumes it at launch, and it keeps track through `/clear` and compaction.'],
            ['Whatever was running starts again.', 'Agents that were mid-task come back with their conversation on screen, not a blank card.'],
            ['Saves you can\'t break.', 'Every change is saved at once, atomically, with a backup. Only one copy of the app can run, so two can never overwrite the same session.']
          ]
        },
        {
          title: 'Run agents in parallel without collisions',
          story: 'More agents only help if they stay out of each other\'s way. Two of them editing the same file is how you lose an afternoon. So each agent can work in its own lane, and the app warns you long before a merge goes wrong.',
          points: [
            ['Each agent gets its own lane.', 'A lane is a separate git worktree and branch, so agents can\'t overwrite each other\'s files. Switch it on per workspace.'],
            ['Collisions show up before they hurt.', 'A chip on each card shows its branch and changes. It turns amber when two lanes touch the same file and red when they would conflict, and the agent is warned too.'],
            ['One click to ship.', 'Finished lanes turn green. Click Ship finished lanes, and an integrator agent merges them, runs the tests, gets a code review, fixes what it finds and merges one pull request. Nothing ships until you click.'],
            ['A shared board.', 'Agents post what they\'re working on to a board they can all read, so they split the work instead of doing it twice.']
          ]
        },
        {
          title: 'It keeps working while you sleep',
          story: 'Usage limits used to end my evenings. I\'d hit one at 11 p.m., and the work sat there until I typed "continue" the next morning. Now a limit is just a pause.',
          points: [
            ['Your budget, always in view.', 'Pills in the top bar show Claude\'s 5-hour and 7-day usage, Codex and Gemini, with the time each one resets. They turn red at 85%.'],
            ['Auto-continue after a limit.', 'When the limit resets, each stopped agent picks up on its own. It checks your usage first, so it doesn\'t walk straight into the same wall.'],
            ['Scheduled messages.', 'Queue a prompt to send later, for example right after a reset.'],
            ['An awake PC and free memory.', 'One switch stops Windows from sleeping while agents work. Idle agents go to sleep instead and hand their memory back, then wake in the same conversation with a click.']
          ]
        },
        {
          title: 'Get around fast',
          story: 'Once you run ten agents, finding things becomes the job. These are the parts I use all day without thinking about them.',
          points: [
            ['Search and history.', '`Ctrl+F` searches an agent\'s whole conversation. The event log (`Ctrl+Shift+L`) shows what every agent did, and can filter to only what needs you.'],
            ['Keyboard first.', '`Ctrl+T` opens a new agent, `Ctrl+Tab` moves between them, `Ctrl+Up` maximizes one and `F11` hides everything but the grid.'],
            ['Layouts that fit.', 'Auto tiling, or any grid from 1×1 to 4×3. Drag cards to reorder them. Changing the layout never restarts an agent.'],
            ['See the code.', '`Ctrl+click` a path or link in a reply to open it. The file explorer and the Agent/File Map show which agent touched which file.'],
            ['Every computer in sync.', 'One click brings every workspace up to date with GitHub, so you can switch machines without asking each agent to pull.']
          ]
        },
        {
          title: 'Make it yours',
          story: 'You\'ll look at it all day, so it should be comfortable to look at.',
          points: [
            ['Four themes.', 'From dark parchment and gold to a green-phosphor CRT, switched live.'],
            ['Fonts for your eyes.', 'Pick a terminal font or load your own, adjust the letter spacing, and turn on Bionic reading if bold word starts help you keep your place.'],
            ['Your own sounds.', 'Replace any chime with a WAV or MP3.']
          ]
        }
      ],
      start: {
        intro: 'AI Hive is a Windows app written in Python. If you already use a coding agent in the terminal, setup takes about five minutes.',
        steps: [
          ['Check the basics.', 'Windows 11, Python 3, Git, and at least one agent CLI you\'re signed in to: Claude Code, Codex or Gemini.'],
          ['Get the code.', '`git clone https://github.com/MolnarMario/ai-hive`'],
          ['Install it once.', 'In the new folder, run `python -m venv .venv` and then `.venv\\Scripts\\python.exe -m pip install -r requirements.txt`.'],
          ['Launch it.', 'Double-click `AI Hive.bat`. From then on, the app updates itself from GitHub.'],
          ['Spend your first ten minutes.', 'Click + in the sidebar to add a workspace for a project folder, or paste a GitHub URL. Press `Ctrl+T`, pick Claude, set Count to 3 and give each agent a task. When you want them on separate branches, switch on Lanes in the workspace header.']
        ]
      },
      story: {
        context: 'I started AI Hive on 5 July 2026 as a quick fix for too many terminal windows. It kept growing because I used it every day. Whenever something slowed me down, it became a task, and the agents running inside AI Hive built the fix. They coordinate on the shared board, work in their own lanes and ship through reviewed pull requests, and every release gets a numbered entry in the changelog.',
        decisions: [
          ['Session data is never only in memory.', 'Adding or removing an agent saves at once, saves are atomic (a temp file, then a rename) and a failed load keeps the old file as a backup instead of deleting it. Each rule has a regression test, and the README traces several of them to sessions where agents were lost.'],
          ['One copy at a time, enforced by Windows.', 'A named mutex refuses a second launch, so two copies can never overwrite each other\'s session file.'],
          ['Closing a card kills everything it started.', 'Each card\'s processes run in a Windows Job Object, so a shell\'s grandchildren die with it, even if the app itself crashes.'],
          ['You decide when work ships.', 'Early versions merged finished lanes as soon as an agent flagged them. Now a lane only marks its work done, and nothing merges until you click Ship. A GPT-6-Luna review has to come back clean first.']
        ],
        testing: 'A smoke suite of {checks} checks drives the real app headlessly, with real child processes, in up to {workers|word} parallel workers. One end-to-end test talks to a live Claude Code agent, closes the app, reopens it and checks that the same conversation comes back on the same card, which is exactly where data used to get lost.',
        status: 'In daily use. I run all my projects from it, this site included, and new versions ship several times a week.'
      },
      stack: ['Python', 'PySide6 / Qt', 'Windows ConPTY', 'MCP', 'pytest'],
      links: [['Source on GitHub', GH + 'ai-hive']]
    },
    hirakata: {
      slug: 'hirakataquest', repo: 'HiraKataQuest', log: { from: 'changelog', file: 'CHANGELOG.md', level: 3 },
      facts: {
        ktLines: { lines: /\.kt$/ },
        tests: { count: /@Test\b/, in: /\/src\/test\/.*\.kt$/ },
        testFiles: { files: /\/src\/test\/.*\.kt$/, containing: /@Test\b/ },
        words: { count: /"kana"\s*:/, in: /assets\/(hiragana|katakana)\/vocabulary\.json$/ }
      },
      tag: 'Android app',
      title: 'HiraKataQuest',
      art: '[data-project="hirakata"] .feature__media',
      lede: 'Most kana apps stop at recognition. This one makes you write each character by hand and tells you how well you wrote it.',
      featuresIntro: 'Four things a kana app should do, and what this one does about each.',
      chapters: [
        {
          title: 'Write it by hand',
          story: 'Most kana apps stop at recognition: you see a character and tap the right answer. That teaches reading, not writing, and the font they show isn\'t how anyone writes by hand. Here you write every character yourself, and the app tells you honestly how close you got.',
          points: [
            ['Trace the handwritten form, not the font.', 'You write over a ghost of the kaisho (school handwriting) form on a genkouyoushi grid, by finger or stylus. The ink widens with pen pressure like a brush.'],
            ['Stroke order for every character.', 'An animated demo draws each stroke with the recorded rhythm and pen lifts, with play, pause, replay and speed controls. Words get one demo per kana.'],
            ['A score that measures what you drew.', 'Geometry checks plus ML Kit handwriting recognition score your ink, with no consolation floor. A calibration suite pins it: a clean trace scores 95 or more, a random line 12 or less.'],
            ['Write from memory.', 'Quiz me shows only the romaji and hides the guide. It works on whole words as well as single characters, and scores each kana in a word separately.']
          ]
        },
        {
          title: 'Read it in print',
          story: 'Signs, menus and screens use printed kana, and a few of them look different from the handwritten form. So reading has its own track, built around the shapes you\'ll actually meet.',
          points: [
            ['A reading quiz, either way round.', 'See a printed kana or word and give its reading, or see the reading and pick the kana, by multiple choice or by typing. Words can test the meaning too.'],
            ['Flashcards with audio.', 'Flip a printed card to reveal its reading, meaning and pronunciation, with an optional field to type the reading.'],
            ['"Looks different in print."', 'さ, き and り join their strokes in print but not by hand. Wherever one is on screen, a chip shows both forms side by side.']
          ]
        },
        {
          title: 'Make it stick',
          story: 'Recognising a shape today is easy. Recalling it a week later is the hard part, so the app gives every character something to hang on to.',
          points: [
            ['A memory story for every basic hiragana.', 'Each of the 46 has a keyword and a short story tying its shape to its sound: あ is APPLE. Every kana has alternates, and the one you pick is used everywhere.'],
            ['Hear it.', 'A speaker button reads any kana or word aloud with the phone\'s Japanese voice.'],
            ['A kanji reference.', 'Words with a kanji spelling can show the kanji, the reading and the meaning, and other kanji that share the reading. It is never quizzed.']
          ]
        },
        {
          title: 'Know what to practise next',
          story: 'Nothing is locked behind progress, so you can practise anything at any time. That only works if the app shows you where you stand.',
          points: [
            ['A Library tinted by your scores.', 'Every character, word and practice set goes from red to green by your average, in a list or as a gojūon chart.'],
            ['Practice sets.', 'Built-in sets for every gojūon row, kana category and a few word themes, plus your own. One button builds a word set from the kana you already score 85 or better on.'],
            ['All of hiragana and katakana, without the overwhelm.', 'Beginners start with the 46 basics. Voiced, combined and extended kana are separate opt-ins, and {words} words ship with the app.']
          ]
        }
      ],
      start: {
        intro: 'HiraKataQuest is an Android app for Android 8.0 or newer. It isn\'t on the Play Store, so you install the APK straight from GitHub. It takes a minute.',
        steps: [
          ['Download the APK.', 'On your phone, tap Download the APK on this page. It is about 39 MB and always the latest release.'],
          ['Install it.', 'Open the downloaded file. If Android asks, allow your browser to install unknown apps. If Play Protect warns that the app is unknown, tap More details, then Install anyway.'],
          ['Pick a track.', 'The opening screen offers Writing for handwriting and Reading for printed kana. You can switch any time.'],
          ['Write your first character.', 'Writing opens the Library. Tap あ, watch the stroke-order demo, trace it and tap Submit to see your score.'],
          ['Set your scope.', 'The Study scope sheet switches between hiragana and katakana, adds voiced, combined or extended kana, and holds memory hints, scoring and dark mode.']
        ]
      },
      story: {
        context: 'AI agents built the first version from three written phase prompts, starting on 3 July 2026. The first build session was lost before anything was written down, so the repo\'s HISTORY.md is a recovery record: what each phase asked for, what shipped and how every step was verified.',
        decisions: [
          ['Cut a feature the day after it landed.', 'Phase 3 added a spaced-repetition study mode with a scheduler, a lesson generator and a guided session. I removed it on 5 July and kept free practice and quizzes, with built-in practice sets for structure. Its tables stay in the database unused, because dropping them would take a destructive migration.'],
          ['Trace the font, animate the real strokes.', 'The ghost you trace is drawn by the system font, which guarantees a correct shape. The stroke-order demo comes from KanjiVG\'s stroke paths, so both match real calligraphic proportions.'],
          ['Contracts before parallel work.', 'Each phase started with a fixed design document and domain types, and then three or four workstreams built against it at once. Phase 3\'s four workstreams went green on the first integration build.']
        ],
        testing: '{tests} unit tests across {testFiles} files. After Phase 2 and again after Phase 3, two independent review agents went through the code, and both rounds came back with no blocking defects. The live database migrations were checked on a real Pixel 7 running Android 16.',
        status: 'Version {version} is out as a downloadable APK, with all of hiragana and katakana, a reading track and {words} words.'
      },
      stack: ['Kotlin', 'Jetpack Compose', 'Room', 'ML Kit Digital Ink', 'Gradle'],
      links: [['Download the APK', GH + 'HiraKataQuest/releases/latest/download/HiraKataQuest.apk'], ['Source on GitHub', GH + 'HiraKataQuest']]
    },
    tile: {
      slug: 'one-more-tile', repo: 'one-more-tile', log: { from: 'changelog', file: 'RELEASE-NOTES.md', level: 2 },
      facts: { paintings: { files: /^boards\/[^/]+\.js$/ } },
      tag: 'Browser game',
      title: 'One More Tile',
      img: 'tile', board: true,
      lede: 'A cross-stitch puzzle inspired by the game Proverbs. Solving it uncovers a hidden pixel-art painting, one region at a time.',
      featuresIntro: 'Four things I wanted from a puzzle like this, and how the game does each.',
      chapters: [
        {
          title: 'A picture worth solving for',
          story: 'In most logic puzzles the reward is a filled grid. I wanted something to look at when I was done, so here the solution is a painting, and you uncover it one region at a time.',
          points: [
            ['Three puzzle types on one canvas.', 'Fill-a-pix clues cover the board, with sudoku patches (4×4 up to 9×9) and picross patches whose solution is part of the painting.'],
            ['Every region you finish reveals the art.', 'A content-aware watershed grows the regions along the picture\'s own edges, so a finished region shows a recognizable piece of the painting, not a random blob.'],
            ['{paintings|Word} paintings, saved as you go.', 'Each painting autosaves separately, with a timer that remembers your time. On character maps, finishing a region makes its character speak.'],
            ['Weave it again.', 'Finished a canvas? New weave builds a completely new puzzle over the same painting, with its own save.']
          ]
        },
        {
          title: 'Never a guess',
          story: 'Nothing kills a logic puzzle like a spot where you have to guess. So every board at every difficulty is checked to solve by logic alone, and the game never hands you answers to get there.',
          points: [
            ['Five difficulty tiers.', 'The easier three need only neighbour counting. Hard and Very Hard add comparing overlapping clues, with a short tutorial the first time.'],
            ['Nothing is pre-filled.', 'An audit rebuilds every painting at every tier and checks that each region solves from its clues alone, with zero tiles given.'],
            ['Hints near where you\'re working.', 'Press H and it points at a forced move close to your cursor and explains why it\'s forced.'],
            ['No game over.', 'Mistakes are forgiven, and Undo takes back whole drag strokes.']
          ]
        },
        {
          title: 'Better with friends',
          story: 'Puzzles like this are usually a solo thing. I wanted to solve one on the couch with friends, and sometimes to race them.',
          points: [
            ['Co-op for up to four.', 'Split-screen on one screen, or online with a room code.'],
            ['Versus.', 'On one screen everyone races on the same canvas, and each region goes to whoever stitched most of it. Online, everyone solves their own copy and sees rivals\' progress, never their answers.'],
            ['Share a canvas.', 'Export your progress as a code or a file, and a friend\'s game replays it.']
          ]
        },
        {
          title: 'Made for long sessions',
          story: 'A big canvas takes hours, so the small things matter.',
          points: [
            ['Mouse, touch or gamepad.', 'Full gamepad support with remappable buttons, pinch-zoom on touch, and pan and zoom everywhere.'],
            ['Your colours, your music.', 'Recolour the whole interface, adjust the music and set a default difficulty.'],
            ['Loads instantly.', 'Every canvas ships already generated, so the only wait is a short animation of the puzzle being built.'],
            ['No install.', 'The game and its puzzle generator live in one HTML file, next to the precomputed boards.']
          ]
        }
      ],
      start: {
        intro: 'One More Tile runs in any modern browser, on a computer or a phone. There is nothing to install and no account.',
        steps: [
          ['Open the game.', 'Go to `tile.thebarbellengineer.com`, or use Play it on this page.'],
          ['Pick a mode and a painting.', 'Single Player, Co-op or Versus, then any canvas from the grid. Continue on the home menu takes you back later.'],
          ['Stitch.', 'Left-click or tap a tile to stitch it light, right-click to mark it dark, and drag to paint several. In a sudoku patch, click a cell and type a digit.'],
          ['Stuck?', 'Press `H` for a hint near your cursor.'],
          ['Play offline.', 'Download the repository and open `index.html`. Keep the `boards` folder next to it so canvases load instantly.']
        ]
      },
      story: {
        context: 'I started it on 13 June 2026 as a single HTML file. It still has no build step and no install: the game and its generator live in index.html, next to the precomputed boards. {versions} versions shipped between {firstVersion|month} and {lastVersion|month}.',
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
      links: [['Play it', 'https://tile.thebarbellengineer.com/'], ['Source on GitHub', GH + 'one-more-tile']]
    },
    chess: {
      slug: 'chess-2', repo: 'chess2.0', log: { from: 'commits' },
      tag: 'Browser game',
      title: 'Chess 2.0',
      img: 'chess', mob: true,
      lede: 'Chess with an RPG layer. The king watches and never changes. Everything else can grow.',
      featuresIntro: 'Three ideas on top of ordinary chess.',
      chapters: [
        {
          title: 'Pieces that grow',
          story: 'In ordinary chess, a pawn that wins three trades is still a pawn. I borrowed one idea from role-playing games: the pieces doing the work should get stronger. The king watches and never changes.',
          points: [
            ['Captures earn points.', '1 for a pawn, 3 for a knight or bishop, 5 for a rook, 10 for a queen, for the piece that made the capture. You can change the values before a game.'],
            ['Pieces evolve.', 'A pawn with 2 points becomes a knight or bishop, those become a rook at 6, a rook becomes a queen at 10, and a queen with 20 turns into an Amazon that also moves like a knight.'],
            ['Gambling mode.', 'Any capture can become a 50/50 roll that doubles the points or destroys your piece. Turn it on from move 1, or only once a clock runs low.']
          ]
        },
        {
          title: 'Play anyone',
          story: 'I wanted to play friends who weren\'t in the room, without an account or a game server of my own.',
          points: [
            ['On one screen.', 'Two players take turns on the same device.'],
            ['Against the computer.', 'An AI at Easy, Medium or Hard.'],
            ['Online with a room code.', 'One player hosts and shares a code, the other joins. The connection is peer to peer, a dropped game can be resumed, and Rematch starts the next one.'],
            ['Fair online play.', 'Each side sends only its move, checks it against its own legal moves and compares a position hash after every move, so neither player can fake the board.']
          ]
        },
        {
          title: 'Set it up your way',
          story: 'Half the fun of a variant is changing the rules, so most of them are settings.',
          points: [
            ['Clocks.', 'From bullet (1+0) to classical (30+20), with increment.'],
            ['Any starting position.', 'The standard one, a random Chess960 position, or your own from the board editor.'],
            ['Three looks.', 'Classic, Arcade and Swiss.'],
            ['Undo, resign and a move log.', 'The log records every evolution and gamble.']
          ]
        }
      ],
      start: {
        intro: 'Chess 2.0 runs in the browser, on a computer or a phone. There is nothing to install.',
        steps: [
          ['Open the game.', 'Go to `chess.thebarbellengineer.com`, or use Play it on this page.'],
          ['Pick a mode.', '2 Players, vs AI, or Play Online.'],
          ['Set it up.', 'Optionally open Board Setup for Chess960 or a custom position, Clock for a time control, and switch evolution and gambling on or off.'],
          ['Play.', 'Click a piece, then its square. A piece with enough points evolves, and a pawn asks which piece it should become.'],
          ['Play a friend online.', 'One of you clicks Host a Game and sends the room code; the other clicks Join a Game and enters it.']
        ]
      },
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
      links: [['Play it', 'https://chess.thebarbellengineer.com/'], ['Source on GitHub', GH + 'chess2.0']]
    },
    ironlog: {
      slug: 'ironlog', repo: 'lifting-app', log: { from: 'commits' },
      facts: {
        lifts: { count: /id: "def-/, in: /^src\/data\/exercises\.ts$/ },
        foods: { count: /id: "df-/, in: /^src\/data\/foods\.ts$/ }
      },
      tag: 'Web app',
      title: 'Ironlog',
      img: 'ironlog',
      lede: 'The powerlifting tracker I use for my own training. No account, and nothing leaves your browser.',
      featuresIntro: 'What I need from a training app, in the order I use it.',
      chapters: [
        {
          title: 'Log the session at the rack',
          story: 'Between heavy sets I have about a minute and chalky hands. Logging has to be quick, and it has to capture how the session felt, not only the numbers.',
          points: [
            ['Set by set.', 'Weight and reps with RPE or a percentage of your max, per-set gear and notes, from a {lifts}-lift exercise library plus your own.'],
            ['How you came in.', 'Readiness meters for sleep, motivation, hydration, calories, protein and stimulants.'],
            ['Session timing.', 'Start and end times are tracked for you, or you enter the duration by hand.']
          ]
        },
        {
          title: 'Know which plates go on the bar',
          story: 'Working out the plates for an odd weight after a hard set is how you load the bar wrong.',
          points: [
            ['The loader draws the bar.', 'It solves the plates per side, with bar and collar options and kg micro plates.'],
            ['One tap from the log.', 'The plate icon on any logged set sends that weight straight to the loader.'],
            ['Real plates in either unit.', 'In lb mode the bar is 45 lb and the plates are 45s, 35s and 25s, not converted kilos.']
          ]
        },
        {
          title: 'Food on the same calendar',
          story: 'A bad week of training often starts with a bad week of eating. So food lives in the same app, on the same calendar as the lifting.',
          points: [
            ['Track food against your targets.', 'Calories and macros against daily targets from a {foods}-food pantry plus your own foods, with water and bodyweight.'],
            ['Scan a label.', 'Photograph a package and the app finds the nutrition table and reads it on your phone. A barcode, when there is one, is looked up on Open Food Facts first.'],
            ['Training and food on one calendar.', 'The month view can overlay each day\'s calories, macros and bodyweight on the training grid.']
          ]
        },
        {
          title: 'See the trend',
          story: 'A log is only worth keeping if it tells you something back.',
          points: [
            ['Progress per lift.', 'Estimated one-rep max and top set over time, and your recent records.'],
            ['Volume and consistency.', 'Weekly volume, weekly sets per muscle group, your week streak, and bodyweight against volume.'],
            ['Food trends.', 'Average calories, protein and water, macro composition and bodyweight over time.']
          ]
        },
        {
          title: 'Your data stays yours',
          story: 'There is no account and no server, so keeping the data safe is entirely the app\'s job.',
          points: [
            ['Switch kg and lb freely.', 'Weights are stored in kilograms and converted for display, so changing units never rewrites your history.'],
            ['Your old data comes along.', 'On first load it offers to import data from the older single-file version, and it never deletes the original.'],
            ['It tells you when saving fails.', 'If the browser refuses to store data, in private mode or with full storage, a banner says so instead of failing silently.']
          ]
        }
      ],
      start: {
        intro: 'Ironlog runs in the browser, on a phone or a computer, with no account and nothing to install. Your data stays in that browser.',
        steps: [
          ['Open the app.', 'Go to `ironlog.thebarbellengineer.com`. On a phone, add it to your home screen.'],
          ['Set your maxes.', 'Enter your squat, bench and deadlift one-rep maxes, so percentage-based sets work out their weights.'],
          ['Log a session.', 'Under Workout, Today, pick an exercise and log your sets.'],
          ['Load the bar.', 'Tap the plate icon on a set to see it on the bar in Plates.'],
          ['Track food.', 'Set daily targets under Food, Goals, log what you eat, and turn on + Food in the workout calendar to see both together.']
        ]
      },
      story: {
        context: 'It began on 11 June 2026 as a single 424 KB HTML file holding a minified React bundle. In August I rebuilt it as a Vite, React and TypeScript project, one tab at a time, with the old build kept as the reference for how everything should behave.',
        decisions: [
          ['Kilograms underneath.', 'Weights are stored in kilograms and converted for display, so switching units never rewrites your history.'],
          ['Never lose the old data.', 'On first load it offers to import data from the original build, reports how many days and sets came across, names any exercise it couldn\'t match and never deletes the original.'],
          ['Parity you can check.', 'Every class in the original stylesheet was diffed against the new code. 17 are unused, and all 17 were already dead in the original.'],
          ['Say so when saving fails.', 'If the browser refuses to store data, in private mode or with full storage, a banner says so instead of failing silently.']
        ],
        testing: 'Unit tests cover the plate solver, the food maths, the statistics behind every chart, reading a nutrition label and the import from the old build. Every build runs the TypeScript typecheck first.',
        status: 'In use for my own training. The workout, plates and food tabs are all rebuilt.'
      },
      stack: ['React', 'TypeScript', 'Vite', 'localStorage'],
      links: [['Open the app', 'https://ironlog.thebarbellengineer.com/'], ['Source on GitHub', GH + 'lifting-app']]
    },
    vinted: {
      slug: 'vinted-country-flags', repo: 'vinted-country-flags', log: { from: 'releases' },
      facts: { markets: { capture: /All (\d+) markets/, in: 'README.md' } },
      tag: 'Chrome extension',
      title: 'Vinted Country Flags',
      img: 'vinted',
      lede: 'Vinted shows you items from sellers all over Europe and never says where they are. This extension does.',
      featuresIntro: 'Three things the extension had to get right.',
      chapters: [
        {
          title: 'The answer on the picture',
          story: 'Where a seller lives decides the shipping cost and how long a parcel takes, and Vinted never says. Finding out meant opening every seller\'s profile, which kills browsing.',
          points: [
            ['A flag on the listings you browse.', 'The seller\'s country flag sits in the corner of each item on the homepage, in search results, on seller pages and on the item page.'],
            ['Works on every Vinted domain.', 'All {markets} markets, with no per-country code. It found every card on vinted.pl, .de, .co.uk and .ro without a change.'],
            ['Cards near the screen go first.', 'Cards in and near the viewport are looked up first, and the popup shows how many are still coming.']
          ]
        },
        {
          title: 'Fast because it reads, not asks',
          story: 'The page already knows who sold each item. It just doesn\'t show you, and reading that costs nothing.',
          points: [
            ['Reads what the page already knows.', 'Seller ids come from the page\'s own data and from the requests Vinted makes anyway. On a vinted.ro search that named 96 of 96 sellers in 8 ms, with no extra requests.'],
            ['One lookup per seller, then remembered.', 'Where a seller lives costs one profile lookup. Sellers are cached for 30 days in one place, so a seller found on vinted.fr is already known on vinted.de.'],
            ['Learns new markets by itself.', 'It builds the market table from Vinted\'s own countries endpoint and caches it for a week.']
          ]
        },
        {
          title: 'A good guest',
          story: 'An extension that hammers Vinted\'s API gets you rate-limited, and takes Vinted\'s own page down with it. So it behaves like a careful visitor.',
          points: [
            ['Under the measured limit.', 'It allows 20 lookups at once and 0.8 a second after that, shared by every tab, and stops whenever Vinted says to slow down.'],
            ['No flag beats a wrong flag.', 'A card whose seller nothing named gets no flag rather than a guess.'],
            ['Nothing leaves your browser.', 'It reads Vinted\'s API with your own session and sends nothing anywhere else.']
          ]
        }
      ],
      start: {
        intro: 'It isn\'t on the Chrome Web Store, so it installs as an unpacked extension. That takes about a minute.',
        steps: [
          ['Download it.', 'Get the zip from the latest release on GitHub, with Download the latest release on this page.'],
          ['Unpack it somewhere you\'ll keep it.', 'Chrome loads the extension from that folder on every start, so don\'t delete it afterwards.'],
          ['Turn on Developer mode.', 'Go to `chrome://extensions` and switch on Developer mode, top right.'],
          ['Load it.', 'Click Load unpacked and pick the folder that holds `manifest.json`.'],
          ['Browse Vinted.', 'Open any Vinted market. Flags fill in as you scroll, and the toolbar popup shows what it\'s doing.']
        ]
      },
      story: {
        context: 'Vinted shows listings from all over Europe and never says where the seller is. The extension reads that from data the page already has, and asks Vinted only when it has to.',
        decisions: [
          ['Read what the page already received.', 'Seller ids come from the page\'s own server-rendered data and from the requests Vinted\'s front end makes anyway. On a vinted.ro search that named the sellers of 96 of 96 cards in 8 ms, with no extra requests.'],
          ['Measure the rate limit, then stay under it.', '30 requests to the profile endpoint succeed and the 31st gets a 429. The extension allows 20 at once and 0.8 per second after that, shared by every tab, so Vinted\'s own front end keeps some headroom.'],
          ['Adapt when Vinted changes.', 'On 8 October 2026 the endpoint that made most lookups free started returning 404. Version 2.2 dropped it and now learns exchange rates from sellers it already knows, so a converted price can name the seller\'s currency for free.'],
          ['No flag beats a wrong flag.', 'A card whose seller nothing named gets no flag rather than a guess.']
        ],
        testing: 'Node tests cover the currency rule against the real {markets}-market table, price parsing in every market\'s number format, the rate limiter and both feed parsers. The parts that depend on Vinted\'s pages were checked against live pages on five Vinted domains.',
        status: 'Version {version}. Install it by loading the unpacked extension in Chrome.'
      },
      stack: ['JavaScript', 'Chrome Manifest V3', 'Vinted web API'],
      links: [['Download the latest release', GH + 'vinted-country-flags/releases/latest'], ['Source on GitHub', GH + 'vinted-country-flags']]
    },
    expense: {
      slug: 'expense-tracker', repo: 'common-expense-tracker', log: { from: 'changelog', file: 'CHANGELOG.md', level: 2 },
      facts: {
        tests: { count: /^\s*(?:test|it)\(/m, in: /^test\/.*\.js$/ },
        htmlSize: { bytes: 'common-expense-tracker.html' }
      },
      tag: 'Web app',
      title: 'Common Expense Tracker',
      img: 'expense', mob: true,
      lede: 'Split shared monthly costs between any number of people and see who owes whom, with no account.',
      featuresIntro: 'Three problems with splitting bills, and what the app does about each.',
      chapters: [
        {
          title: 'Settle up without arguing',
          story: 'Shared bills usually end in a spreadsheet nobody trusts. If the maths is right once, nobody has to check it again.',
          points: [
            ['Who owes whom, settled.', 'Add each month\'s shared costs and it works out the transfers that square everyone up.'],
            ['The month in one picture.', 'A balance bar shows who paid what, the fair-share line, and exactly the money that has to change hands.'],
            ['Money that adds up.', 'Amounts are stored as whole cents, never floats. Splitting 10,00 three ways gives 3,34 / 3,33 / 3,33, and "42,50" and "240.924,00" both parse correctly.']
          ]
        },
        {
          title: 'Share it without giving it away',
          story: 'Two people need the same tracker on their phones. But a server holding a household\'s spending is a server that can leak it, so this one can\'t read what it stores.',
          points: [
            ['Share one tracker live.', 'Send a link and a password. A change on a phone shows up on the other laptop in well under a second, and edits made offline sync when the connection returns.'],
            ['The server can\'t read your data.', 'Every record is encrypted in the browser with a 256-bit key, wrapped by a key derived from your password (PBKDF2-SHA256, 600,000 iterations). The server never sees either.'],
            ['Invite only.', 'Making a shared tracker takes an invite code. No code? Ask for one from the Share dialog with just a name and a line about who you are.']
          ]
        },
        {
          title: 'Your data, portable',
          story: 'An app for money should never be the only place your numbers live.',
          points: [
            ['Export any months.', 'As JSON for an exact copy, or CSV for a spreadsheet.'],
            ['Imports that ask first.', 'An import replaces only the months the file names, and lists exactly what it will replace before it does.'],
            ['Hand someone one file.', 'The whole app builds into a single {htmlSize|kb} HTML file. Save it anywhere and double-click it, no install.']
          ]
        }
      ],
      start: {
        intro: 'It runs in the browser with no account. Everything except sharing works straight away.',
        steps: [
          ['Open the app.', 'Go to `expenses.thebarbellengineer.com`.'],
          ['Add the people.', 'Open People in the header and add everyone who shares the costs.'],
          ['Add expenses.', 'Amount, who paid, the date and a description.'],
          ['Settle up.', 'At the end of the month, open the bottom line for the balances and the payments that square everyone up.'],
          ['Share it.', 'Click Share, make a tracker and send the link and password to the other person. Keep the recovery key it shows you: a forgotten password can\'t be recovered by anyone.']
        ]
      },
      story: {
        context: 'I built it on 30 August 2026 from a written PRD with numbered acceptance scenarios, in one long day: the local-only version first, then export and the single-file build, then end-to-end encrypted sharing. It went live on its own domain on 26 September.',
        decisions: [
          ['The server never sees your data.', 'Records are encrypted in the browser before they leave it, with a key wrapped by your password, so the sharing server stores only ciphertext.'],
          ['Money in whole cents.', 'No floats anywhere. Splitting 10,00 three ways gives 3,34 / 3,33 / 3,33.'],
          ['One file you can hand to someone.', 'The build inlines everything into one HTML file that works from a double-click, with no install.'],
          ['Invite-only sharing.', 'Creating a shared tracker needs an invite code, and each one is capped at 2 MB, so a stranger can\'t fill the server.']
        ],
        testing: '{tests} unit tests, a protocol smoke test with two clients, and a UI check that drives two headless Chrome profiles as two devices editing the same tracker.',
        status: 'Live at expenses.thebarbellengineer.com.'
      },
      stack: ['Vanilla JS', 'Web Crypto', 'Cloudflare Workers', 'Durable Objects', 'WebSockets'],
      links: [['Open the app', 'https://expenses.thebarbellengineer.com/'], ['Source on GitHub', GH + 'common-expense-tracker']]
    },
    dashboard: {
      slug: 'automation-test-platform', repo: 'test-dashboard', log: { from: 'changelog', file: 'CHANGELOG.md', level: 2 },
      tag: 'QA platform',
      title: 'Automation Test Platform',
      img: 'dashboard', replay: true,
      lede: 'The QA tooling I always wanted. It runs end-to-end suites, shows every test live and keeps the history, without ever modifying the suites.',
      featuresIntro: 'Four things I wanted from one test dashboard, in the order I reach for them.',
      chapters: [
        {
          title: 'Any suite, against any site',
          story: 'Every framework came with its own runner, and pointing a suite at a different site meant editing its config. Here the suite and the site are chosen separately.',
          points: [
            ['Suites times sites.', 'A suite says how to run, a site says where. Every suite gets the site\'s URL and admin credentials as environment variables, so any suite can run against any registered site.'],
            ['Three frameworks, one view.', 'Playwright, Cypress and Selenium suites run from the same dashboard, with the same live view and history.'],
            ['Runs in parallel.', 'The same suite against two sites, or two frameworks against one site, run at once. Cancel stops the whole process tree.']
          ]
        },
        {
          title: 'Watch it live, keep the history',
          story: 'Terminal output scrolls away, and last week\'s failures go with it.',
          points: [
            ['A live card per target.', 'A progress bar, pass, fail and skip counts, the test running now, and failures as they happen.'],
            ['Every run kept.', 'Filterable by site and framework, with links to each run\'s reports and artifacts.'],
            ['Reports you can share.', 'A combined report for any run, printable to PDF, next to each framework\'s own HTML report.'],
            ['Scheduled runs.', 'Cron schedules fire while the dashboard runs, and a calendar shows runs by day.']
          ]
        },
        {
          title: 'Test a pull request in one step',
          story: 'Testing a WordPress plugin pull request used to mean checking out the branch, building it and installing it on a local site by hand, before a single test ran.',
          points: [
            ['Paste the link.', 'Paste a GitHub PR link and it builds that plugin or theme and installs it on a local WordPress site.'],
            ['Then run anything.', 'Any suite runs against the freshly installed build from the same screen.']
          ]
        },
        {
          title: 'Safe to leave running',
          story: 'It holds admin credentials for every site it can test, so it is locked down by default.',
          points: [
            ['Behind a login.', 'The dashboard, API, reports and live streams all need a session, with admin, tester and viewer roles.'],
            ['Encrypted site passwords.', 'Stored with AES-256-GCM and handed to a test only through its environment, never on a command line.'],
            ['Localhost by default.', 'It binds to 127.0.0.1 unless you choose otherwise, and the README covers what to set before exposing it.']
          ]
        }
      ],
      start: {
        intro: 'It runs on your own machine with Node.js 18 or newer. Your suites stay where they are and are never modified.',
        steps: [
          ['Get the code.', '`git clone https://github.com/MolnarMario/test-dashboard`, then `npm install` in the new folder.'],
          ['Point it at your suites.', 'Copy `sites.config.example.json` to `sites.config.json` and list each suite\'s folder and framework.'],
          ['Start it.', 'Run `npm start` and open `http://localhost:4400`. Copy the admin password from the boot banner; it is shown only once.'],
          ['Add a site.', 'In the Sites tab, add each site with its URL and admin credentials.'],
          ['Run something.', 'In Run, tick a suite or a few specs, pick the site and click Run selected. Watch it on Live.']
        ]
      },
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
      links: [['Source on GitHub', GH + 'test-dashboard']]
    },
    video: {
      slug: 'video-production-tracker', repo: 'video-production', log: { from: 'commits' },
      tag: 'Web app',
      title: 'Video Production Tracker',
      img: 'video', mob: true,
      lede: 'I make videos, so I built the tracker I wanted. Each project is a script split into sections.',
      featuresIntro: 'How a video actually gets made, one stage at a time.',
      chapters: [
        {
          title: 'Write the script in sections',
          story: 'Every video I make has a hook, an intro, a few main points and a call to action, and each part has a life of its own after the script is written.',
          points: [
            ['Quick-add templates.', 'Sections for a hook, an intro, main points, B-roll and a call to action, or your own.'],
            ['A rich-text editor per section.', 'Bold, italics and lists, with sections you can rename and reorder as the script changes.']
          ]
        },
        {
          title: 'Know what\'s filmed and what made the edit',
          story: 'Sections get filmed on different days and cut in later, and a to-do list loses track of which one is still missing from the edit.',
          points: [
            ['Two checkboxes per section.', 'Filmed, and inserted into the edit, so nothing gets forgotten between the shoot and the cut.'],
            ['Progress at a glance.', 'Bars for filming, editing and publishing, per project, and an overall figure that doesn\'t let a long script drown out its publishing.']
          ]
        },
        {
          title: 'Track where it went live',
          story: 'A finished video goes out to five platforms, not one, and they rarely all happen on the same day.',
          points: [
            ['Publishing per platform.', 'YouTube, LinkedIn, Facebook, Instagram and TikTok, each marked draft or published.'],
            ['Projects that end properly.', 'Mark a project completed, or scrap it. Scrapped projects are archived, not deleted, and can be restored.']
          ]
        },
        {
          title: 'Safe in your browser',
          story: 'There is no account and no server, so everything stays on your device, and the backup has to be trustworthy.',
          points: [
            ['Saved as you type.', 'Everything is stored in the browser with a versioned schema.'],
            ['Backups checked before they touch your data.', 'An imported file is validated and repaired, and you see how many projects it holds before choosing to merge or replace.'],
            ['Light and dark.', 'Plus a font picker that previews each option.']
          ]
        }
      ],
      start: {
        intro: 'It runs in the browser with no account and nothing to install. Your projects stay in that browser.',
        steps: [
          ['Open the app.', 'Go to `video.thebarbellengineer.com`.'],
          ['Start a project.', 'Click New Project and give the video a title.'],
          ['Write the script.', 'Add sections with the quick-add templates and write each one.'],
          ['Tick as you go.', 'Mark each section filmed and inserted, then each platform as published.'],
          ['Back it up.', 'Use Backup / Restore in the header now and then. Clearing site data or switching browsers starts empty until you restore.']
        ]
      },
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
      links: [['Open the app', 'https://video.thebarbellengineer.com/'], ['Source on GitHub', GH + 'video-production']]
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
