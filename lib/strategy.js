// STRATEGI BELLS (Ells'Land A+B TOP16 Shared Exit, profil Agresif) diadaptasi dari saham harian Kompas 100 ke kripto IDR Indodax — SATU fungsi sinyal dipakai backtest DAN bot.
// Input hanya candle 4 jam yang SUDAH TERTUTUP. Tiap 6 candle digabung menjadi "hari 24 jam" yang berakhir di candle keputusan, lalu indikator harian asli dihitung di atasnya.
// Keputusan di close candle t, dieksekusi sesudahnya (bot: order book live; backtest: open candle t+1 ± biaya terukur).
// Modul A: close > high 100 hari × 1,005; close > EMA50 > EMA200; EMA200 naik 20 hari; ROC252 > 0; median turnover 60 hari ≥ Rp500 jt; cooldown 10 hari sesudah exit.
// Modul B: dicek pada candle pertama tiap bulan; momentum close[-21]/close[-252] − 1 > 0; close > EMA200 yang naik; median turnover 60 hari ≥ Rp5 M; kandidat top 16.
// Exit bersama: stop tetap = harga beli − 4×ATR20 saat sinyal, atau 2 close hari berturut-turut di bawah EMA100.
// Perbedaan dari sumber asli dicatat di README: tanpa settlement T+2, tanpa lot, stop dinilai pada candle tertutup, universe 8 pasangan Indodax.
import { PAIRS } from './indodax.js';
import { COSTS } from './costs.js';

export const PARAMS = Object.freeze({
  tf: 240, D: 6,            // menit per candle; 6 candle = 1 hari
  turnA: 5e8, turnB: 5e9,   // median turnover 60 hari minimum modul A dan B (Rupiah)
  brkX: 1.005,              // pengali level breakout
  stopATR: 4,               // stop awal = harga beli − 4 × ATR20
  cooldownBars: 60,         // cooldown modul A: 10 hari
  risk: 0.015, aggRisk: 0.09, maxPosValue: 0.15,   // profil Agresif: risiko per trade, risiko agregat, bobot maksimum
  maxA: 6, maxB: 8, maxTotal: 12, topB: 16,
  corrLimit: 0.75, corrCap: 0.25, corrMin: 40, advCap: 0.01,   // guard korelasi 60 hari; order ≤ 1% ADV20
  slipSizing: 0.001,        // cadangan slippage untuk MENGHITUNG ukuran order (fill tetap dari order book / spread terukur)
  dailyLoss: 0.05,          // ekuitas ≤ 95% ekuitas awal hari WIB → tidak membuka posisi baru sampai 00.00 WIB berikutnya
  warmup: 1806,             // 301 hari × 6 candle
  window: 3000,             // jendela waktu (dalam candle) yang diberikan ke decide() — dipotong menurut WAKTU, sama di bot & backtest
});

export const monthOf = ms => new Date(ms).toISOString().slice(0, 7);
export const nextBarMs = t => Date.parse(t + 'Z') + PARAMS.tf * 60e3;

// gabungkan candle 4 jam menjadi hari 24 jam, dihitung mundur dari candle terakhir
export function dailyBars(b) {
  const D = PARAMS.D, out = [];
  for (let e = b.length - 1; e - D + 1 >= 0; e -= D) { let h = -Infinity, l = Infinity, v = 0;
    for (let k = e - D + 1; k <= e; k++) { h = Math.max(h, b[k].h); l = Math.min(l, b[k].l); v += b[k].v; }
    out.push({ t: b[e].t, o: b[e - D + 1].o, h, l, c: b[e].c, v }); }
  return out.reverse();
}

// indikator harian pada hari terakhir, rumus sama dengan bells_engine.js
export function indicators(b4) {
  const d = dailyBars(b4), n = d.length, i = n - 1; if (n < 2) return null;
  const c = d.map(x => x.c), ema = p => { const a = 2 / (p + 1); let v = c[0]; const o = [v]; for (let k = 1; k < n; k++) { v = v * (1 - a) + a * c[k]; o.push(v); } return o; };
  const e50 = ema(50), e100 = ema(100), e200 = ema(200);
  let atr = 0; for (let k = 0; k < n; k++) { const tr = k ? Math.max(d[k].h - d[k].l, Math.abs(d[k].h - c[k - 1]), Math.abs(d[k].l - c[k - 1])) : d[k].h - d[k].l; atr = k ? 0.95 * atr + 0.05 * tr : tr; }
  let turn = NaN; if (i >= 59) { const x = []; for (let j = i - 59; j <= i; j++) x.push(c[j] * d[j].v); x.sort((p, q) => p - q); turn = (x[29] + x[30]) / 2; }
  let adv = NaN; if (i >= 19) { let s = 0; for (let j = i - 19; j <= i; j++) s += d[j].v; adv = s / 20; }
  let brk = NaN; if (i >= 100) { let m = 0; for (let j = i - 100; j < i; j++) m = Math.max(m, d[j].h); brk = m * PARAMS.brkX; }
  return { n, c: c[i], v: d[i].v, low4: b4.at(-1).l, atr, turn, adv, brk, e50: e50[i], e200: e200[i],
    slope: i >= 20 ? e200[i] / e200[i - 20] - 1 : NaN, roc: i >= 252 ? c[i] / c[i - 252] - 1 : NaN, mom: i >= 252 ? c[i - 21] / c[i - 252] - 1 : NaN,
    below: i > 0 && c[i] < e100[i] && c[i - 1] < e100[i - 1], ret: c.slice(-61).map((x, k, a) => k ? x / a[k - 1] - 1 : NaN).slice(1) };
}
const common = x => x.n > 300 && x.v > 0 && x.atr > 0;
const setupA = x => common(x) && x.c > x.brk && x.c > x.e50 && x.e50 > x.e200 && x.slope > 0 && x.roc > 0 && x.turn >= PARAMS.turnA;
const eligB = x => common(x) && x.c > x.e200 && x.slope > 0 && x.mom > 0 && x.turn >= PARAMS.turnB;

function corr(a, b) {
  let n = 0, sx = 0, sy = 0, sxx = 0, syy = 0, sxy = 0; const m = Math.min(a.length, b.length);
  for (let k = 1; k <= m; k++) { const x = a.at(-k), y = b.at(-k); if (isNaN(x) || isNaN(y)) continue; n++; sx += x; sy += y; sxx += x * x; syy += y * y; sxy += x * y; }
  if (n < PARAMS.corrMin) return 0;
  const vx = sxx - sx * sx / n, vy = syy - sy * sy / n; return vx > 0 && vy > 0 ? (sxy - sx * sy / n) / Math.sqrt(vx * vy) : 0;
}

// syarat harga saat eksekusi (dipakai bot & backtest): tidak lebih tinggi dari close sinyal + ATR; modul A juga tidak di bawah level breakout
export const entryPriceOK = (x, px) => px <= x.limit && (x.m !== 'A' || px >= x.brk);

// bars: { PAIR: [{t,o,h,l,c,v}, ...] } · positions: [{pair, m:'A'|'B', stop, qty, risk}]
// ctx: { blocked, noEntry:Set, memo:{ lastX:{pair: ms bar exit}, bM:'YYYY-MM' bulan terakhir modul B dicek }, equity, cash }
// → { exits, entries:[{pair,m,reason,signalPrice,qty,limit,brk,atr}], rejected, info, bM }. Pemanggil menyimpan bM ke memo.
export function decide(bars, positions, { blocked = false, noEntry = new Set(), memo = { lastX: {}, bM: null }, equity = 0, cash = 0 } = {}) {
  const P = PARAMS, out = { exits: [], entries: [], rejected: [], info: {}, bM: memo.bM }, I = {};
  for (const pair of PAIRS) if (bars[pair]?.length) I[pair] = indicators(bars[pair]);
  const t = bars.BTCIDR?.at(-1)?.t ?? null; out.info.t = t;
  // ---- exit posisi terbuka: stop diperiksa lebih dulu
  for (const p of positions) { const x = I[p.pair]; if (!x || !common(x)) continue;
    const r = x.low4 <= p.stop ? 'STOP_4ATR' : x.below ? 'TREN_2CLOSE_EMA100' : null;
    if (r) out.exits.push({ pair: p.pair, reason: r, signalPrice: x.c }); }
  // ---- guard breadth
  let nCommon = 0, nAbove = 0; for (const k in I) if (I[k] && common(I[k])) { nCommon++; if (I[k].c > I[k].e200) nAbove++; }
  const breadth = nCommon ? nAbove / nCommon : 0, gross = breadth >= 0.5 ? 0.9 : breadth >= 0.25 ? 0.45 : 0;
  Object.assign(out.info, { breadth, gross });
  if (blocked || !t) return out;
  // ---- kandidat
  const mNow = t.slice(0, 7), scanB = memo.bM !== mNow, tMs = Date.parse(t + 'Z'); out.bM = mNow; out.info.scanB = scanB;
  const candB = [], candA = [];
  for (const pair of PAIRS) { const x = I[pair]; if (!x || !common(x)) continue;
    if (eligB(x)) candB.push({ pair, s: x.mom });
    const last = memo.lastX?.[pair]; if (setupA(x) && (last == null || (tMs - last) / (P.tf * 60e3) >= P.cooldownBars)) candA.push({ pair, s: x.roc / (x.atr / x.c) }); }
  // ---- ukuran order
  const held = new Set(positions.map(p => p.pair)), val = equity - cash, queued = [];
  let reserved = 0, openRisk = positions.reduce((s, p) => s + p.risk, 0), cntA = positions.filter(p => p.m === 'A').length, cntB = positions.filter(p => p.m === 'B').length;
  const plan = [['B', scanB ? candB.sort((a, b) => b.s - a.s).slice(0, P.topB) : [], 'B_MOMENTUM_BULANAN'], ['A', candA.sort((a, b) => b.s - a.s), 'A_BREAKOUT_HIGH100']];
  for (const [m, list, reason] of plan) for (const { pair } of list) {
    if (held.has(pair) || queued.some(q => q.pair === pair)) continue;
    const x = I[pair], base = { pair, m, reason, signalPrice: x.c };
    if (noEntry.has(pair)) { out.rejected.push({ ...base, reason: reason + '_DATA_TIDAK_VALID' }); continue; }
    if (positions.length + queued.length >= P.maxTotal || (m === 'A' && cntA >= P.maxA) || (m === 'B' && cntB >= P.maxB)) continue;
    const limit = x.c + x.atr, cp = limit * (1 + P.slipSizing) * (1 + COSTS.feeBuy), dist = P.stopATR * x.atr, den = dist + cp * (COSTS.feeBuy + COSTS.feeSell + 2 * P.slipSizing);
    let q = Math.min(P.maxPosValue * equity / cp, Math.max(0, cash - reserved) / cp, Math.max(0, gross * equity - val - reserved) / cp, P.advCap * x.adv, P.risk * equity / den, Math.max(0, P.aggRisk * equity - openRisk) / den);
    let linked = 0;
    for (const p of positions) if (I[p.pair] && corr(x.ret, I[p.pair].ret) > P.corrLimit) linked += p.qty * I[p.pair].c;
    for (const o of queued) if (corr(x.ret, I[o.pair].ret) > P.corrLimit) linked += o.res;
    q = Math.min(q, Math.max(0, P.corrCap * equity - linked) / cp);
    if (q * cp < COSTS.minOrderIDR) continue;
    const e = { ...base, qty: q, limit, brk: x.brk, atr: x.atr, res: q * cp };
    queued.push(e); out.entries.push(e); reserved += e.res; openRisk += q * dist; m === 'A' ? cntA++ : cntB++; }
  return out;
}
