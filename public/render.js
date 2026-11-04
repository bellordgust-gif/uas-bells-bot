// TAMPILAN DASHBOARD BELLS — satu kode untuk halaman Vercel (public/index.html) dan HTML offline (tools/hitung_ulang.mjs menyematkan file ini).
// Input: { bt: ringkasan backtest, fw: forwardFromLogs(...), gap: hasil pencocokan (opsional), sumber, status, latihan }
const NAV = [['ringkasan', 'Ringkasan', 'M4 13h6V4H4zM14 20h6v-9h-6zM14 8h6V4h-6zM4 20h6v-3H4z'], ['status', 'Status bot', 'M12 8v4l3 2M3 12a9 9 0 1018 0 9 9 0 00-18 0'], ['backtest', 'Backtest', 'M4 19h16M6 15l4-5 4 3 5-7'], ['trade', 'Trade forward', 'M4 7h13l-3-3M20 17H7l3 3'], ['sinyal', 'Sinyal forward', 'M4 12h3l3-7 4 14 3-7h3'], ['operasional', 'Operasional', 'M12 3v18M5 8h14M5 16h14'], ['aturan', 'Aturan strategi', 'M6 3h9l4 4v14H6zM9 12h7M9 16h7']];

export const SHELL = keterangan => `<aside class="sidebar" id="side"><div class="brand"><svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 17V11a6 6 0 0112 0v6l2 2H4zM10 21a2 2 0 004 0"/></svg><div>BELLS<small>STRATEGI A DAN B</small></div></div>
<div class="navcaption">WORKSPACE</div><nav aria-label="Menu utama">${NAV.map(([id, label, d]) => `<a class="navbutton" href="#${id}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${d}"/></svg>${label}</a>`).join('')}</nav>
<div class="navfooter"><span class="pill">DRY RUN</span><b>Mirabel Lordniani Gustaman</b>NIM 25110200037<br>Indodax · candle 4 jam<br>Tanpa uang sungguhan dan tanpa API key.</div></aside><div class="scrim" id="scrim"></div>
<div class="workspace"><header class="topbar"><div class="flex"><button class="burger" id="burger" aria-label="Buka menu">☰</button><div class="crumb">BELLS / <b>Bot dry run Indodax</b></div></div><div class="status"><span class="dot"></span> Ells’Land A+B Shared Exit</div></header>
<main class="content"><div class="pageintro"><div><div class="eyebrow muted">STRATEGY WORKSPACE</div><h1>Ringkasan portofolio</h1><p>${keterangan}</p></div></div><div id="o">memuat…</div>
<footer class="footnote"><span>BELLS · Strategi A dan B · Ells’Land A+B TOP16 Shared Exit</span><span>Hasil dry run, bukan saran investasi</span></footer></main></div>`;

export function pasangMenu(doc) {
  const side = doc.getElementById('side'), scrim = doc.getElementById('scrim'), set = v => { side.classList.toggle('open', v); scrim.classList.toggle('open', v); };
  doc.getElementById('burger').onclick = () => set(!side.classList.contains('open')); scrim.onclick = () => set(false);
  side.querySelectorAll('a').forEach(a => { a.onclick = () => set(false); });
}

export function renderDashboard(el, { bt, fw, gap = null, sumber = '', status = null, latihan = null }) {
  const pct = (x, d = 2) => x == null || !isFinite(x) ? '–' : (x * 100).toFixed(d).replace('.', ',') + '%', num = (x, d = 2) => x == null ? '–' : x === Infinity ? '∞' : x.toFixed(d).replace('.', ','), rp = x => x == null ? '–' : 'Rp' + Math.round(x).toLocaleString('id-ID');
  const sh = x => x == null ? '–' : 'Rp' + (x / 1e6).toLocaleString('id-ID', { maximumFractionDigits: 1 }) + ' jt';
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const tone = x => x == null ? '' : x >= 0 ? 'positive' : 'negative';
  const tbl = (head, rows) => '<div class="tablewrap"><table><thead><tr>' + head.map(h => `<th>${h}</th>`).join('') + '</tr></thead><tbody>' + (rows.length ? rows.map(r => '<tr>' + r.map(c => `<td>${c}</td>`).join('') + '</tr>').join('') : `<tr><td colspan="${head.length}" class="empty">Belum ada data.</td></tr>`) + '</tbody></table></div>';
  const metric = (label, val, sub, c = '') => `<div class="card metric"><div class="label">${label}</div><div class="value ${c}">${val}</div><small>${sub}</small></div>`;
  const sec = (id, judul, ket, isi) => `<section id="${id}" class="card flush"><div class="sectionhead"><div><h2>${judul}</h2>${ket ? `<p>${ket}</p>` : ''}</div></div>${isi}</section>`;
  const T = fw.trade, B = bt.trade, op = fw.operasional, belumFreeze = !status?.freeze || status.freeze >= '2099';
  const wib = t => t ? new Date(Date.parse(t.length === 16 ? t + ':00Z' : t) + 7 * 3600e3).toISOString().slice(0, 16).replace('T', ' ') + ' WIB' : '–';
  const eqNow = status?.ekuitas ?? fw.ekuitas.akhir ?? 100e6;

  let h = `<section class="card hero"><div class="eyebrow">NILAI AKUN DRY RUN</div><div class="big">${rp(eqNow)}</div><div class="ret">${pct(eqNow / 100e6 - 1)} dari modal Rp100.000.000</div><div class="keyline"><span>Posisi terbuka<b>${status ? esc(status.posisi.join(', ') || 'tidak ada') : '–'}</b></span><span>Trade forward<b>${T.jumlah}</b></span><span>Drawdown forward<b>${fw.ekuitas.mdd == null ? '–' : '−' + pct(fw.ekuitas.mdd)}</b></span><span>Uptime<b>${pct(op.uptime, 1)}</b></span></div></section>`;
  h += '<div id="ringkasan" class="grid4">' + metric('CAGR backtest', pct(bt.ekuitas.cagr), `${esc(bt.mulai.slice(0, 10))} → ${esc(bt.akhir.slice(0, 10))}`, tone(bt.ekuitas.cagr)) + metric('Max drawdown backtest', '−' + pct(bt.ekuitas.mdd), 'Penurunan terdalam dari puncak', 'negative') + metric('Profit factor backtest', num(B.profit_factor), `${B.jumlah} trade${B.jumlah < 100 ? ', sampel kecil' : ''}`, B.profit_factor >= 1 ? 'positive' : 'negative') + metric('Beli & tahan BTC/IDR', pct(bt.beli_tahan_btc.return_total), `MDD −${pct(bt.beli_tahan_btc.mdd)} pada periode yang sama`, tone(bt.beli_tahan_btc.return_total)) + '</div>';

  if (status) { const L = status.terakhir, fase = belumFreeze ? 'Freeze belum ditentukan. Trade yang muncul sekarang hanya latihan dan direset saat freeze.' : { sebelum_freeze: `Persiapan: forward test mulai ${wib(status.freeze)}. Trade sebelum itu hanya latihan dan direset saat freeze.`, forward: `Forward test berjalan sampai ${wib(status.akhir)}.`, selesai: 'Forward test selesai.' }[status.fase];
    h += sec('status', 'Status bot', esc(fase), tbl(['Panggilan terakhir', 'Pemanggil', 'Hasil', 'Candle terakhir diproses', 'Total panggilan', 'Panggilan error', 'Ekuitas', 'Posisi'],
      [[wib(L?.t), esc(L?.sumber), esc(L?.hasil) + (L?.error ? ` (${L.error} error)` : ''), wib(status.candle_terakhir_diproses), status.panggilan_total, status.panggilan_error, rp(status.ekuitas), esc(status.posisi.join(', ') || '–')]])); }
  if (latihan && status?.fase === 'sebelum_freeze') { const o = latihan.operasional;
    h += sec('latihan', 'Uji coba sebelum freeze', 'Rumus sama dengan forward test. Angka ini tidak masuk hasil UAS.', tbl(['Candle terjadwal', 'Tepat waktu', 'Uptime', 'Panggilan', 'Panggilan error', 'Error API', 'Kill switch', 'Trade latihan', 'Return latihan'],
      [[o.candle_terjadwal, o.candle_tepat_waktu, pct(o.uptime, 1), o.panggilan, o.panggilan_error, o.error_api, o.kill_switch, latihan.trade.jumlah, pct(latihan.ekuitas.return_total)]])); }

  const bulanan = (bt.kurva || []).filter((x, i, a) => i === a.length - 1 || a[i + 1][0].slice(0, 7) !== x[0].slice(0, 7));
  h += `<section id="backtest" class="card"><div class="sectionhead"><div><h2>Ekuitas backtest</h2><p>Modal Rp100 jt, sudah termasuk fee, spread, dan slippage terukur. Arahkan kursor untuk melihat nilai.</p></div></div><div id="grafik"></div><details class="datatabel"><summary>Lihat nilai akhir tiap bulan</summary>${tbl(['Bulan', 'Ekuitas'], bulanan.map(x => [x[0].slice(0, 7), rp(x[1])]))}</details></section>`;
  h += '<div class="grid2">' + sec('modul', 'Hasil per modul', 'Backtest, satu exit bersama.', tbl(['Modul', 'Trade', 'Win rate', 'PF', 'Laba bersih'], [['A · Breakout', bt.modul.A], ['B · Momentum bulanan', bt.modul.B]].map(([k, s]) => [k, s.jumlah, pct(s.win_rate, 1), num(s.profit_factor), rp(s.laba_bersih)])))
    + sec('pasangan', 'Hasil per pasangan', 'Pasangan tanpa trade tetap ditampilkan.', tbl(['Pasangan', 'Trade', 'Win rate', 'PF', 'Laba bersih'], Object.entries(bt.per_pasangan).map(([k, s]) => [esc(k), s.jumlah, pct(s.win_rate, 1), num(s.profit_factor), rp(s.laba_bersih)]))) + '</div>';
  h += sec('banding', 'Backtest dan forward', 'Forward test berakhir 14 Nov 2026 12.00 WIB. Jendelanya terlalu pendek, jadi CAGR tidak dihitung.', tbl(['Metrik', 'Backtest', 'Forward test'], [
    ['Return total', pct(bt.ekuitas.return_total), pct(fw.ekuitas.return_total)], ['Maximum drawdown', '−' + pct(bt.ekuitas.mdd), fw.ekuitas.mdd == null ? '–' : '−' + pct(fw.ekuitas.mdd)], ['Jumlah trade', B.jumlah, T.jumlah], ['Win rate', pct(B.win_rate, 1), pct(T.win_rate, 1)], ['Profit factor', num(B.profit_factor), num(T.profit_factor)],
    ['Rata-rata untung / rugi', pct(B.rata_untung, 1) + ' / ' + pct(B.rata_rugi, 1), pct(T.rata_untung, 1) + ' / ' + pct(T.rata_rugi, 1)], ['Porsi biaya ÷ laba kotor', pct(B.porsi_biaya, 1), pct(T.porsi_biaya, 1)], ['Beli & tahan BTC/IDR', pct(bt.beli_tahan_btc.return_total), pct(fw.beli_tahan_btc)]]));
  if (gap) { h += sec('gap', 'Gap backtest vs forward', 'Jendela candle yang sama.', tbl(['Sinyal bot', 'Sinyal backtest', 'Identik', 'Kecocokan', 'Return backtest', 'Return forward', 'Selisih'],
      [[gap.sinyal.bot, gap.sinyal.backtest, gap.sinyal.identik, pct(gap.sinyal.kecocokan, 1), pct(gap.bt_jendela.return_total), pct(fw.ekuitas.return_total), pct(fw.ekuitas.return_total - gap.bt_jendela.return_total)]])
      + tbl(['Candle', 'Pasangan', 'Sisi', 'Fill bot', 'Fill backtest', 'Selisih', 'Terlambat'], gap.fill.map(f => [esc(f.candle), esc(f.pair), esc(f.sisi), num(f.bot, 4), num(f.backtest, 4), pct(f.selisih, 3), f.telat_menit + ' menit']))); }
  h += sec('trade', 'Trade forward', '', tbl(['Pasangan', 'Masuk', 'Keluar', 'Hasil', 'Return', 'Biaya', 'Alasan'], fw.trades.map(t => [`<b>${esc(t.pair)}</b>`, esc(t.masuk), esc(t.keluar), `<span class="${tone(t.pnl)}">${rp(t.pnl)}</span>`, pct(t.ret), rp(t.biaya), esc(t.alasan)])));
  h += sec('sinyal', 'Sinyal forward', 'Langsung dari log bot.', tbl(['Candle', 'Pasangan', 'Sisi', 'Alasan', 'Harga sinyal', 'Data valid'], fw.sinyal.map(s => [esc(s.candle), `<b>${esc(s.pair)}</b>`, esc(s.sisi), esc(s.alasan), num(s.harga_sinyal, 4), s.valid === false ? 'tidak: ' + esc((s.alasan_tidak_valid || []).join(', ')) : 'ya'])));
  h += sec('operasional', 'Operasional', '', tbl(['Candle terjadwal', 'Tepat waktu', 'Uptime', 'Panggilan', 'Panggilan error', 'Error API', 'Kill switch'], [[op.candle_terjadwal, op.candle_tepat_waktu, pct(op.uptime, 1), op.panggilan, op.panggilan_error, op.error_api, op.kill_switch]]) + (op.candle_terlewat?.length ? `<p class="catatan">Candle terlewat: ${op.candle_terlewat.map(esc).join(', ')}</p>` : ''));
  h += sec('aturan', 'Aturan strategi', 'Logika BELLS profil Agresif. Indikator harian dihitung dari 6 candle 4 jam terakhir.', tbl(['Bagian', 'Aturan di bot', 'Sumber asli (saham)'], [
    ['Modul A', 'Close > high 100 hari × 1,005; close > EMA50 > EMA200; EMA200 naik 20 hari; ROC252 > 0; turnover ≥ Rp500 jt; cooldown 10 hari', 'Sama'],
    ['Modul B', 'Candle pertama tiap bulan; momentum 12-1 positif; close > EMA200 yang naik; turnover ≥ Rp5 M; top 16', 'Sama, dicek di sesi pertama bulan'],
    ['Exit', 'Stop −4×ATR20 dicek pada low candle tertutup, lalu jual di harga pasar; atau 2 close hari di bawah EMA100', 'Stop dieksekusi intraday di level stop'],
    ['Ukuran', 'Risiko 1,5% per trade, risiko agregat 9%, bobot maks. 15%, 1% ADV20, guard breadth dan korelasi', 'Sama'],
    ['Biaya', 'Fee resmi Indodax 0,20555% beli dan 0,41555% jual, ditambah spread dan slippage terukur', 'Fee 0,25% + slippage 0,10% per sisi'],
    ['Pasar', '8 pasangan IDR Indodax, 24 jam, kas hasil jual langsung tersedia, tanpa lot', 'Kompas 100, kas cair 3 sesi, lot 100'],
    ['Batas harian', 'Tidak ada posisi baru bila ekuitas turun 5% dalam satu hari WIB', 'Tidak ada, ditambahkan untuk UAS']]));
  h += `<p class="sumber">Sumber data: ${esc(sumber)} · jendela forward ${esc(belumFreeze ? 'belum ditentukan' : fw.jendela.mulai + ' → ' + fw.jendela.akhir)}. Semua angka dihitung dari log mentah dengan public/metrics.js.</p>`;
  el.innerHTML = h;
  const g = el.querySelector('#grafik'); if (g) { const gambar = () => grafikEkuitas(g, bt.kurva || [], rp); gambar(); window.onresize = gambar; }
}

// grafik garis satu seri dengan crosshair; judul kartu sudah menamai seri sehingga tidak perlu legenda
function grafikEkuitas(el, pts, rp) {
  if (pts.length < 2) { el.innerHTML = '<div class="empty">Belum ada data.</div>'; return; }
  const W = Math.max(300, el.clientWidth || 960), H = W < 600 ? 230 : 300, L = 52, R = 10, Tp = 14, Bt = 28, v = pts.map(p => p[1]), lo = Math.min(...v) * 0.97, hi = Math.max(...v) * 1.03;
  const X = i => L + i / (pts.length - 1) * (W - L - R), Y = y => Tp + (hi - y) / (hi - lo) * (H - Tp - Bt), step = (hi - lo) / 4, ticks = [0, 1, 2, 3, 4].map(k => lo + k * step);
  const tahun = pts.map((p, i) => [p[0].slice(0, 4), i]).filter((x, i, a) => !i || a[i - 1][0] !== x[0]).slice(1);
  el.innerHTML = `<div class="chartbox"><svg class="ch" viewBox="0 0 ${W} ${H}" role="img" aria-label="Kurva ekuitas backtest dari ${rp(v[0])} menjadi ${rp(v.at(-1))}">
${ticks.map(t => `<line x1="${L}" x2="${W - R}" y1="${Y(t)}" y2="${Y(t)}" class="gridline"/><text x="${L - 8}" y="${Y(t) + 4}" text-anchor="end" class="axis">${Math.round(t / 1e6)} jt</text>`).join('')}
${tahun.map(([y, i]) => `<text x="${X(i)}" y="${H - 8}" text-anchor="middle" class="axis">${y}</text>`).join('')}
<path d="M${pts.map((p, i) => X(i).toFixed(1) + ' ' + Y(p[1]).toFixed(1)).join('L')}" class="garis"/><line class="cross" y1="${Tp}" y2="${H - Bt}" hidden/><circle class="titik" r="5" hidden/></svg><div class="tip" hidden></div></div>`;
  const box = el.firstChild, svg = box.querySelector('svg'), cross = svg.querySelector('.cross'), dot = svg.querySelector('.titik'), tip = box.querySelector('.tip');
  box.onpointermove = e => { const r = svg.getBoundingClientRect(), sx = (e.clientX - r.left) / r.width * W, i = Math.max(0, Math.min(pts.length - 1, Math.round((sx - L) / (W - L - R) * (pts.length - 1)))), p = pts[i];
    cross.removeAttribute('hidden'); dot.removeAttribute('hidden'); tip.hidden = false; cross.setAttribute('x1', X(i)); cross.setAttribute('x2', X(i)); dot.setAttribute('cx', X(i)); dot.setAttribute('cy', Y(p[1]));
    tip.innerHTML = `<b>${rp(p[1])}</b><br>${p[0]}`; const px = X(i) / W * r.width; tip.style.left = Math.min(px + 12, r.width - 150) + 'px'; tip.style.top = Y(p[1]) / H * r.height - 12 + 'px'; };
  box.onpointerleave = () => { cross.setAttribute('hidden', ''); dot.setAttribute('hidden', ''); tip.hidden = true; };
}

export const CSS = `:root{--bg:#f4f6f8;--surface:#fff;--ink:#142738;--muted:#6d7d8a;--line:#e3e9ed;--green:#16856e;--green-soft:#e9f6f0;--red:#d35756;--shadow:0 4px 22px #17344b05;--nav:#102c3b;--chart:#168b78;font:14px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;color-scheme:light}
@media(prefers-color-scheme:dark){:root{--bg:#10212c;--surface:#172e3b;--ink:#e2edf3;--muted:#a0b1bd;--line:#2c4351;--green:#5dccab;--green-soft:#234b42;--red:#ff9790;--shadow:none;--chart:#39a688;color-scheme:dark}}
[hidden]{display:none!important}*{box-sizing:border-box}html{scroll-behavior:smooth;scroll-padding-top:84px}body{margin:0;background:var(--bg);color:var(--ink);overflow-x:hidden}button{font:inherit;border:1px solid var(--line);background:var(--surface);color:var(--ink);border-radius:8px;padding:6px 11px;cursor:pointer}
h1,h2,p{margin:0}h1{font-size:27px;letter-spacing:-.8px;font-weight:700}h2{font-size:16px;letter-spacing:-.2px}.muted,small{color:var(--muted)}.positive{color:var(--green)}.negative{color:var(--red)}
.eyebrow{font-size:10px;text-transform:uppercase;letter-spacing:1.6px;font-weight:700}.label{font-size:12px;color:var(--muted)}.flex{display:flex;align-items:center;gap:10px}
.card{border:1px solid var(--line);background:var(--surface);border-radius:14px;box-shadow:var(--shadow);padding:22px;min-width:0;margin-bottom:18px}.card.flush{padding:0;overflow:hidden}.card.flush .sectionhead{padding:22px 22px 0}
.sectionhead{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:16px}.sectionhead p{font-size:12px;color:var(--muted);margin-top:3px}
.grid4{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;margin-bottom:18px}.grid4 .card{margin:0}.grid2{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px}
.metric{padding:17px 18px}.metric .value{font-size:25px;font-weight:680;letter-spacing:-.7px;margin:7px 0 3px;line-height:1.2}.metric small{font-size:11px;display:block}
.sidebar{position:fixed;inset:0 auto 0 0;width:218px;background:var(--nav);color:#eaf3f5;z-index:20;display:flex;flex-direction:column;padding:30px 18px 22px;overflow-y:auto}
.brand{display:flex;align-items:center;gap:11px;margin:0 8px 37px;font-size:21px;font-weight:700;letter-spacing:.5px}.brand svg{color:#9ae1c9;flex:none}.brand small{font-size:9px;display:block;color:#8caab5;letter-spacing:2.8px;font-weight:500;margin-top:3px}
.navcaption{color:#7794a2;font-size:9px;letter-spacing:1.8px;margin:0 13px 10px}.navbutton{display:flex;align-items:center;gap:12px;color:#a9bec8;text-decoration:none;padding:12px 13px;margin:3px 0;border-radius:8px;font-size:12px;white-space:nowrap}.navbutton svg{width:17px;height:17px;flex-shrink:0;opacity:.8}.navbutton:hover,.navbutton:focus-visible{background:#254654;color:#fff}
.navfooter{margin-top:auto;border-top:1px solid #ffffff18;padding:18px 9px 0;font-size:11px;color:#91aab6}.navfooter b{display:block;color:#d1e6e9;font-size:12px;margin:8px 0 4px}.pill{display:inline-block;background:#ffffff14;border-radius:6px;padding:3px 8px;font-size:10px;letter-spacing:.8px;color:#9ae1c9;font-weight:700}
.workspace{margin-left:218px}.topbar{min-height:70px;border-bottom:1px solid var(--line);background:var(--surface);display:flex;align-items:center;justify-content:space-between;padding:0 32px;gap:12px;position:sticky;top:0;z-index:10}.crumb{font-size:12px;color:var(--muted)}.crumb b{color:var(--ink);font-weight:550}
.status{border:1px solid var(--line);padding:6px 10px;border-radius:20px;font-size:10px;color:var(--muted);white-space:nowrap}.dot{width:6px;height:6px;border-radius:50%;display:inline-block;background:var(--green)}.burger{display:none}
.content{max-width:1560px;margin:auto;padding:29px 32px 45px}.pageintro{margin-bottom:22px}.pageintro .eyebrow{margin-bottom:7px}.pageintro p{font-size:12px;color:var(--muted);margin-top:6px}
.tablewrap{overflow:auto;max-height:440px}table{border-collapse:collapse;width:100%;font-size:12px;white-space:nowrap}th{position:sticky;top:0;font-size:11px;color:var(--muted);font-weight:550;text-align:left;background:var(--bg);padding:12px 16px;border-bottom:1px solid var(--line)}td{padding:12px 16px;border-bottom:1px solid var(--line);font-variant-numeric:tabular-nums}#aturan td{white-space:normal;min-width:150px}.empty{text-align:center;padding:30px 20px;color:var(--muted)}
.hero{background:var(--nav);color:#eaf3f5;border-color:var(--nav)}.hero .big{font-size:40px;font-weight:700;letter-spacing:-1.5px;margin:4px 0;font-variant-numeric:tabular-nums}.hero .ret{font-size:13px;color:#9ae1c9}.keyline{display:flex;gap:28px;flex-wrap:wrap;font-size:11px;color:#91aab6;margin-top:12px;border-top:1px solid #ffffff18;padding-top:12px}.keyline b{color:#fff;margin-left:6px}
.chartbox{position:relative;touch-action:pan-y}svg.ch{width:100%;height:auto;display:block}.gridline{stroke:var(--line);stroke-width:1}.axis{fill:var(--muted);font-size:12px}.garis{fill:none;stroke:var(--chart);stroke-width:2;stroke-linejoin:round;stroke-linecap:round}.cross{stroke:var(--muted);stroke-width:1;stroke-dasharray:3 3}.titik{fill:var(--chart);stroke:var(--surface);stroke-width:2}
.tip{position:absolute;pointer-events:none;background:var(--surface);border:1px solid var(--line);border-radius:8px;padding:6px 10px;font-size:11px;color:var(--muted);box-shadow:0 4px 14px #0002;white-space:nowrap}.tip b{color:var(--ink);font-size:12px}
.datatabel{margin-top:12px;font-size:12px;color:var(--muted)}.datatabel summary{cursor:pointer;padding:4px 0}.datatabel .tablewrap{max-height:280px}.catatan{padding:14px 22px;font-size:12px;color:var(--muted)}.sumber{font-size:11px;color:var(--muted);overflow-wrap:anywhere}
.footnote{font-size:10px;color:var(--muted);display:flex;justify-content:space-between;gap:15px;flex-wrap:wrap;margin-top:26px;padding-top:15px;border-top:1px solid var(--line)}.scrim{display:none}
@media(max-width:1200px){.grid4{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:900px){.sidebar{transform:translateX(-100%);transition:transform .2s}.sidebar.open{transform:none}.scrim.open{display:block;position:fixed;inset:0;background:#0006;z-index:15}.workspace{margin-left:0}.burger{display:block}.topbar{padding:0 16px}.content{padding:20px 16px 40px}.grid2{grid-template-columns:1fr}.status{display:none}.hero .big{font-size:32px}}
@media(max-width:560px){.metric .value{font-size:19px}h1{font-size:23px}}`;
