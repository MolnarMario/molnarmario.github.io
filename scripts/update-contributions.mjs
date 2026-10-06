// Writes data/contributions.json from the GitHub GraphQL API.
// Run by .github/workflows/contributions.yml every 12 hours. Locally:
//   GITHUB_TOKEN=$(gh auth token) node scripts/update-contributions.mjs
import { writeFile, mkdir } from 'node:fs/promises';

const LOGIN = 'MolnarMario';
const token = process.env.GITHUB_TOKEN;
if (!token) throw new Error('GITHUB_TOKEN is not set');

const query = `query($login: String!) {
  user(login: $login) {
    contributionsCollection {
      totalCommitContributions
      restrictedContributionsCount
      contributionCalendar {
        totalContributions
        weeks { contributionDays { date contributionCount contributionLevel } }
      }
    }
  }
}`;

const res = await fetch('https://api.github.com/graphql', {
  method: 'POST',
  headers: { Authorization: `bearer ${token}`, 'Content-Type': 'application/json', 'User-Agent': 'tbe-site-contributions' },
  body: JSON.stringify({ query, variables: { login: LOGIN } }),
});
const json = await res.json();
if (!res.ok || json.errors || !json.data?.user) throw new Error('GraphQL failed: ' + JSON.stringify(json.errors ?? json));

const c = json.data.user.contributionsCollection;
const LEVELS = { NONE: 0, FIRST_QUARTILE: 1, SECOND_QUARTILE: 2, THIRD_QUARTILE: 3, FOURTH_QUARTILE: 4 };
// weeks[][] of [date, count, level 0-4]; each week starts on Sunday
const weeks = c.contributionCalendar.weeks.map(w =>
  w.contributionDays.map(d => [d.date, d.contributionCount, LEVELS[d.contributionLevel]]));

const days = weeks.flat();
let longest = 0, run = 0;
for (const [, n] of days) { run = n > 0 ? run + 1 : 0; longest = Math.max(longest, run); }

const out = {
  login: LOGIN,
  from: days[0][0],
  to: days.at(-1)[0],
  total: c.contributionCalendar.totalContributions,
  commits: c.totalCommitContributions,
  privateContributions: c.restrictedContributionsCount,
  activeDays: days.filter(d => d[1] > 0).length,
  longestStreak: longest,
  weeks,
};

await mkdir(new URL('../data/', import.meta.url), { recursive: true });
await writeFile(new URL('../data/contributions.json', import.meta.url), JSON.stringify(out) + '\n');
console.log(`${out.total} contributions, ${out.commits} commits, ${out.activeDays} active days (${out.from} to ${out.to})`);
