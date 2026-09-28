// Builds the mini One More Tile board shown on the homepage and writes it into
// assets/js/tile.js between the DATA markers.
//
//   node tools/tile-board.js path/to/one-more-tile/_pixels.txt
//
// _pixels.txt is the Castle painting from the game repo: 120×64 "r,g,b;" pixels.
// The board is 30×16 cells, so each cell covers a 4×4 block of the painting.
// Regions grow along the picture's edges, the light/dark solution follows the
// painting's brightness, and clues are thinned only while the board still solves
// by plain neighbour counting (no guessing, no advanced deductions).
const fs = require('fs');
const path = require('path');

const SW = 120, SH = 64, F = 4, W = SW / F, H = SH / F, N = W * H;
const REGIONS = 14, CLUE_DENSITY = 0.6;

const pixFile = process.argv[2];
if (!pixFile) { console.error('usage: node tools/tile-board.js <_pixels.txt>'); process.exit(1); }
const src = fs.readFileSync(pixFile, 'utf8').trim().split(';').filter(Boolean).map(s => s.split(',').map(Number));
if (src.length !== SW * SH) throw new Error(`expected ${SW * SH} pixels, got ${src.length}`);

let seed = 7;
const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };

// ---- per-cell average colour and brightness ----
const avg = [], lum = [];
for (let i = 0; i < N; i++) {
  const x = i % W, y = (i / W) | 0;
  let r = 0, g = 0, b = 0;
  for (let dy = 0; dy < F; dy++) for (let dx = 0; dx < F; dx++) {
    const c = src[(y * F + dy) * SW + x * F + dx];
    r += c[0]; g += c[1]; b += c[2];
  }
  avg.push([r / 16, g / 16, b / 16]);
  lum.push((.3 * r + .59 * g + .11 * b) / 16);
}

// ---- regions: jittered seeds, then a Dijkstra flood where crossing a colour edge costs more ----
const seeds = [];
const cols = Math.round(Math.sqrt(REGIONS * W / H)), rows = Math.ceil(REGIONS / cols);
for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
  if (seeds.length >= REGIONS) break;
  const x = Math.min(W - 1, Math.floor((c + .2 + .6 * rnd()) * W / cols));
  const y = Math.min(H - 1, Math.floor((r + .2 + .6 * rnd()) * H / rows));
  seeds.push(y * W + x);
}
const reg = new Int32Array(N).fill(-1), dist = new Float64Array(N).fill(1e9), pq = [];
seeds.forEach((i, r) => { dist[i] = 0; pq.push([0, i, r]); });
while (pq.length) {
  let bi = 0;
  for (let k = 1; k < pq.length; k++) if (pq[k][0] < pq[bi][0]) bi = k;
  const [d, i, r] = pq.splice(bi, 1)[0];
  if (reg[i] >= 0) continue;
  reg[i] = r;
  const x = i % W, y = (i / W) | 0;
  for (const [nx, ny] of [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]]) {
    if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
    const j = ny * W + nx;
    if (reg[j] >= 0) continue;
    const a = avg[i], b = avg[j];
    const nd = d + 1 + Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]) / 9;
    if (nd < dist[j]) { dist[j] = nd; pq.push([nd, j, r]); }
  }
}

// region-clipped 3×3 neighbourhoods: clues never count across a region border
const nb = [];
for (let i = 0; i < N; i++) {
  const x = i % W, y = (i / W) | 0, a = [];
  for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
    const nx = x + dx, ny = y + dy;
    if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
    const j = ny * W + nx;
    if (reg[j] === reg[i]) a.push(j);
  }
  nb.push(a);
}

// ---- solution: brighter than the region's median is light, with 30% texture noise ----
const sol = new Uint8Array(N);
for (let r = 0; r < REGIONS; r++) {
  const cells = [...Array(N).keys()].filter(i => reg[i] === r);
  const med = cells.map(i => lum[i]).sort((a, b) => a - b)[cells.length >> 1];
  for (const i of cells) sol[i] = (lum[i] > med ? 1 : 0) ^ (rnd() < .3 ? 1 : 0);
}

// plain neighbour counting from a blank board
function solves(hasClue) {
  const st = new Int8Array(N).fill(-1);
  for (let prog = true; prog;) {
    prog = false;
    for (let i = 0; i < N; i++) {
      if (!hasClue[i]) continue;
      const c = nb[i].reduce((a, j) => a + sol[j], 0);
      let L = 0; const U = [];
      for (const j of nb[i]) { if (st[j] === 1) L++; else if (st[j] < 0) U.push(j); }
      if (!U.length) continue;
      const v = L === c ? 0 : L + U.length === c ? 1 : -1;
      if (v < 0) continue;
      for (const j of U) st[j] = v;
      prog = true;
    }
  }
  return st;
}

// repair the texture until every clue shown solves it, then thin the clues
const hasClue = new Uint8Array(N).fill(1);
for (let tries = 0; ; tries++) {
  const st = solves(hasClue);
  const stuck = [...Array(N).keys()].filter(i => st[i] < 0);
  if (!stuck.length) break;
  if (tries > 5000) throw new Error('could not make the board solvable');
  sol[stuck[(rnd() * stuck.length) | 0]] ^= 1;
}
let clues = N;
for (const i of [...Array(N).keys()].sort(() => rnd() - .5)) {
  if (clues <= N * CLUE_DENSITY) break;
  hasClue[i] = 0;
  if (solves(hasClue).every(v => v >= 0)) clues--; else hasClue[i] = 1;
}

// ---- painting: palette + one character per pixel ----
const KEYS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const pal = [], idx = new Map();
let art = '';
for (const c of src) {
  const k = c.join(',');
  if (!idx.has(k)) { idx.set(k, pal.length); pal.push('#' + c.map(v => v.toString(16).padStart(2, '0')).join('')); }
  art += KEYS[idx.get(k)];
}
if (pal.length > KEYS.length) throw new Error('too many colours');

const out = path.join(__dirname, '..', 'assets', 'js', 'tile.js');
const js = fs.readFileSync(out, 'utf8');
const block = `// DATA:BEGIN (generated by tools/tile-board.js, do not edit by hand)
  const DATA = {
    reg: '${[...reg].map(r => r.toString(36)).join('')}',
    sol: '${sol.join('')}',
    clue: '${hasClue.join('')}',
    pal: ${JSON.stringify(pal)},
    art: '${art}'
  };
  // DATA:END`;
fs.writeFileSync(out, js.replace(/\/\/ DATA:BEGIN[\s\S]*?\/\/ DATA:END/, () => block));
console.log(`board ${W}×${H}, ${REGIONS} regions, ${clues} clues, ${pal.length} colours -> ${path.relative(process.cwd(), out)}`);
