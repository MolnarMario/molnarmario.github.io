// Writes data/projects/<slug>.json for every project in assets/js/projects.js:
// commit activity, changelog entries rendered to HTML by GitHub's markdown API, and
// the figures its `facts` rules count in the repo's files.
// Run by .github/workflows/contributions.yml once a day, then build-projects.mjs
// turns the JSON into pages. Locally:
//   GITHUB_TOKEN=$(gh auth token) node scripts/fetch-projects.mjs
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import vm from 'node:vm';

const OWNER = 'MolnarMario';
const token = process.env.GITHUB_TOKEN;
if (!token) throw new Error('GITHUB_TOKEN is not set');

const ctx = { window: {} };
vm.runInNewContext(await readFile(new URL('../assets/js/projects.js', import.meta.url), 'utf8'), ctx);
const { PROJECTS } = ctx.window;

const headers = { Authorization: `bearer ${token}`, Accept: 'application/vnd.github+json', 'User-Agent': 'tbe-site-projects' };

async function api(path, init = {}) {
  const res = await fetch('https://api.github.com' + path, { ...init, headers: { ...headers, ...init.headers } });
  if (!res.ok) throw new Error(`${init.method || 'GET'} ${path}: ${res.status} ${await res.text()}`);
  return res;
}
const json = async path => (await api(path)).json();

async function allPages(path) {
  const out = [];
  for (let page = 1; ; page++) {
    const batch = await json(`${path}${path.includes('?') ? '&' : '?'}per_page=100&page=${page}`);
    out.push(...batch);
    if (batch.length < 100) return out;
  }
}

// GitHub renders the markdown (and sanitizes it). All entries of one changelog go in a
// single request, split afterwards on a marker paragraph.
const SPLIT = 'ENTRYSPLIT9f3c1';
async function render(bodies, repo, branch) {
  if (!bodies.length) return [];
  const res = await api('/markdown', {
    method: 'POST',
    body: JSON.stringify({ text: bodies.join(`\n\n${SPLIT}\n\n`), mode: 'markdown', context: `${OWNER}/${repo}` }),
  });
  const parts = (await res.text()).split(new RegExp(`<p[^>]*>${SPLIT}</p>`));
  if (parts.length !== bodies.length) throw new Error(`${repo}: rendered ${parts.length} entries, expected ${bodies.length}`);
  return parts.map(html => tidy(html, repo, branch));
}

function tidy(html, repo, branch) {
  return html
    .replace(/ dir="auto"/g, '')
    .replace(/ class="notranslate"/g, '')
    .replace(/<\/?markdown-accessiblity-table>/g, '')
    .replace(/ rel="nofollow"/g, '')
    // Relative links point into the repo; send them to GitHub
    .replace(/href="(?!https?:|mailto:|#)([^"]+)"/g, (_, p) => `href="https://github.com/${OWNER}/${repo}/blob/${branch}/${p.replace(/^\.?\//, '')}"`)
    .replace(/<a href="http/g, '<a target="_blank" rel="noopener" href="http')
    .trim();
}

// "[0.33.0] — 2026-09-25 — Online play" → { version, date, title }
function parseHeading(text) {
  const version = text.match(/\bv?(\d+\.\d+\.\d+)\b/)?.[1] ?? null;
  const date = text.match(/\b\d{4}-\d{2}-\d{2}\b/)?.[0] ?? null;
  const title = text
    .replace(/\[[^\]]*\]/g, '')
    .replace(/\bv?\d+\.\d+\.\d+\b/, '')
    .replace(/\b\d{4}-\d{2}-\d{2}\b/, '')
    .replace(/^[\s:—–-]+|[\s:—–-]+$/g, '')
    .replace(/\s+[—–]\s+/g, ': ')
    .trim();
  return { version, date, title: title || null };
}

// Line → date that line was last changed, for headings that carry no date of their own
async function blameDates(repo, branch, file) {
  const res = await api('/graphql', {
    method: 'POST',
    body: JSON.stringify({
      query: `query($o:String!,$r:String!,$e:String!,$p:String!){repository(owner:$o,name:$r){object(expression:$e){... on Commit{blame(path:$p){ranges{startingLine endingLine commit{authoredDate}}}}}}}`,
      variables: { o: OWNER, r: repo, e: branch, p: file },
    }),
  });
  const ranges = (await res.json()).data?.repository?.object?.blame?.ranges ?? [];
  return line => {
    const r = ranges.find(r => line >= r.startingLine && line <= r.endingLine);
    return r ? r.commit.authoredDate.slice(0, 10) : null;
  };
}

async function fromChangelog(p, branch) {
  const { file, level } = p.log;
  const meta = await json(`/repos/${OWNER}/${p.repo}/contents/${encodeURIComponent(file)}?ref=${branch}`);
  const lines = Buffer.from(meta.content, 'base64').toString('utf8').split('\n');
  const heading = new RegExp(`^#{${level}}\\s+(.*)$`);
  const higher = new RegExp(`^#{1,${level - 1}}\\s`);
  const entries = [];
  let cur = null, fence = false;
  lines.forEach((line, i) => {
    if (/^\s*(```|~~~)/.test(line)) fence = !fence;
    const m = !fence && line.match(heading);
    if (m) { cur = { ...parseHeading(m[1]), heading: m[1].trim(), line: i + 1, body: [] }; entries.push(cur); return; }
    if (!fence && higher.test(line)) { cur = null; return; }
    if (cur && !/^---+\s*$/.test(line)) cur.body.push(line);
  });
  const dateOf = entries.some(e => !e.date) ? await blameDates(p.repo, branch, file) : null;
  // Sub-headings start at h3 on the page whatever level the changelog uses
  const shift = level - 2;
  const bodies = entries.map(e => e.body.join('\n').replace(/^(#{3,6})(\s)/gm, (_, h, s) => '#'.repeat(Math.max(3, h.length - shift)) + s).trim());
  const html = await render(bodies, p.repo, branch);
  return {
    source: { kind: 'changelog', label: file, url: `https://github.com/${OWNER}/${p.repo}/blob/${branch}/${file}` },
    entries: entries.map((e, i) => ({
      version: e.version, date: e.date ?? dateOf?.(e.line) ?? null, dated: e.date ? 'heading' : 'git',
      title: e.title, html: html[i],
    })),
  };
}

async function fromReleases(p, branch) {
  const rels = (await allPages(`/repos/${OWNER}/${p.repo}/releases`)).filter(r => !r.draft);
  const html = await render(rels.map(r => r.body || ''), p.repo, branch);
  return {
    source: { kind: 'releases', label: 'GitHub releases', url: `https://github.com/${OWNER}/${p.repo}/releases` },
    entries: rels.map((r, i) => ({
      ...parseHeading(r.name || r.tag_name), version: r.tag_name.replace(/^v/, ''),
      date: r.published_at.slice(0, 10), dated: 'release', url: r.html_url, html: html[i],
    })),
  };
}

// One entry per day, newest first, from the subjects of non-merge commits
function fromCommits(p, commits) {
  const days = new Map();
  for (const c of commits) {
    if (c.merge) continue;
    if (!days.has(c.date)) days.set(c.date, []);
    days.get(c.date).push(c);
  }
  return {
    source: { kind: 'commits', label: 'commit history', url: `https://github.com/${OWNER}/${p.repo}/commits` },
    entries: [...days].map(([date, cs]) => ({ version: null, date, dated: 'commit', title: null, commits: cs.map(({ sha, subject }) => ({ sha, subject })) })),
  };
}

// Figures counted in the repo's files at one commit, from the project's `facts` rules
// in projects.js. A rule that breaks (file renamed, pattern no longer matches) keeps
// its last good value, and the run is marked failed so someone notices.
const re = (r, global) => new RegExp(r.source, r.flags.replace('g', '') + (global ? 'g' : ''));
const sum = ns => ns.reduce((a, b) => a + b, 0);
const lineCount = s => (s.match(/\n/g)?.length ?? 0) + (s && !s.endsWith('\n') ? 1 : 0);

// File contents come from raw.githubusercontent.com, which doesn't use up the API
// rate limit. At most 8 downloads at a time.
let active = 0;
const waiting = [];
function limited(fn) {
  return new Promise((resolve, reject) => {
    const run = () => {
      active++;
      fn().then(resolve, reject).finally(() => { active--; waiting.shift()?.(); });
    };
    active < 8 ? run() : waiting.push(run);
  });
}
const rawText = (repo, sha, path) => limited(async () => {
  const res = await fetch(`https://raw.githubusercontent.com/${OWNER}/${repo}/${sha}/${path.split('/').map(encodeURIComponent).join('/')}`);
  if (!res.ok) throw new Error(`${path}: ${res.status}`);
  return res.text();
});

async function countFacts(p, sha, previous) {
  const tree = await json(`/repos/${OWNER}/${p.repo}/git/trees/${sha}?recursive=1`);
  if (tree.truncated) throw new Error('file tree is truncated');
  const blobs = tree.tree.filter(t => t.type === 'blob');
  const texts = new Map();
  const text = path => texts.get(path) ?? texts.set(path, rawText(p.repo, sha, path)).get(path);
  const pick = r => {
    const files = blobs.filter(b => re(r).test(b.path));
    if (!files.length) throw new Error(`no file matches ${r}`);
    return files;
  };
  const facts = {};
  let broken = 0;
  for (const [name, f] of Object.entries(p.facts)) {
    try {
      let v;
      if (f.lines) v = sum(await Promise.all(pick(f.lines).map(async b => lineCount(await text(b.path)))));
      else if (f.count) v = sum(await Promise.all(pick(f.in).map(async b => (await text(b.path)).match(re(f.count, true))?.length ?? 0)));
      else if (f.files) {
        const files = pick(f.files);
        v = f.containing ? (await Promise.all(files.map(b => text(b.path)))).filter(s => re(f.containing).test(s)).length : files.length;
      }
      else if (f.capture) v = Number((await text(f.in)).match(re(f.capture))?.[1]?.replace(/,/g, ''));
      else if (f.bytes) v = blobs.find(b => b.path === f.bytes)?.size;
      else throw new Error('unknown rule');
      // Nothing on the site counts zero of something, so 0 means the rule stopped matching
      if (!v) throw new Error(`came out as ${v}`);
      facts[name] = v;
    } catch (e) {
      broken++;
      facts[name] = previous?.[name] ?? null;
      console.error(`${p.slug}: fact ${name} kept ${facts[name]}. ${e.message}`);
    }
  }
  return { facts, broken };
}

await mkdir(new URL('../data/projects/', import.meta.url), { recursive: true });

async function fetchProject(id, p) {
  const repo = await json(`/repos/${OWNER}/${p.repo}`);
  const branch = repo.default_branch;
  const list = await allPages(`/repos/${OWNER}/${p.repo}/commits?sha=${branch}`);
  const commits = list.map(c => ({
    sha: c.sha.slice(0, 7),
    date: (c.commit.author?.date ?? c.commit.committer.date).slice(0, 10),
    subject: c.commit.message.split('\n')[0],
    merge: c.parents.length > 1,
  }));

  // Commits per ISO week (Monday start), last 26 weeks ending this week
  const now = new Date();
  const monday = d => { const x = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())); x.setUTCDate(x.getUTCDate() - ((x.getUTCDay() + 6) % 7)); return x; };
  const thisWeek = monday(now).getTime(), WEEK = 7 * 864e5;
  const weeks = Array.from({ length: 26 }, (_, i) => [new Date(thisWeek - (25 - i) * WEEK).toISOString().slice(0, 10), 0]);
  for (const c of commits) {
    const i = 25 - Math.round((thisWeek - monday(new Date(c.date + 'T00:00:00Z')).getTime()) / WEEK);
    if (i >= 0 && i < 26) weeks[i][1]++;
  }

  const log = p.log.from === 'changelog' ? await fromChangelog(p, branch)
    : p.log.from === 'releases' ? await fromReleases(p, branch)
    : fromCommits(p, commits);

  const file = new URL(`../data/projects/${p.slug}.json`, import.meta.url);
  const previous = await readFile(file, 'utf8').then(JSON.parse, () => null);
  const counted = p.facts && list.length ? await countFacts(p, list[0].sha, previous?.facts) : null;

  const out = {
    id, repo: p.repo, url: repo.html_url, branch,
    created: repo.created_at.slice(0, 10), pushed: repo.pushed_at.slice(0, 10),
    commits: commits.length,
    firstCommit: commits.at(-1)?.date ?? null,
    lastCommit: commits[0] ? { sha: commits[0].sha, date: commits[0].date, subject: commits[0].subject } : null,
    recent: commits.filter(c => !c.merge).slice(0, 5).map(({ sha, date, subject }) => ({ sha, date, subject })),
    weeks,
    ...(counted && { facts: counted.facts }),
    log,
  };
  await writeFile(file, JSON.stringify(out, null, 1) + '\n');
  const facts = counted ? ', ' + Object.entries(counted.facts).map(([k, v]) => `${k} ${v}`).join(', ') : '';
  console.log(`${p.slug}: ${out.commits} commits, ${log.entries.length} ${log.source.kind} entries${facts}`);
  return counted?.broken ?? 0;
}

// One repo failing (renamed, private, rate limited) keeps its last good JSON and
// doesn't stop the others. The exit code still says something went wrong.
let failed = 0;
for (const [id, p] of Object.entries(PROJECTS)) {
  if (!p.repo) continue;
  try { if (await fetchProject(id, p)) failed++; }
  catch (e) { failed++; console.error(`${p.slug}: kept the previous data. ${e.message}`); }
}
if (failed) process.exitCode = 1;
