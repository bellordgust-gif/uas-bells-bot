# Bot Dry Run Indodax: BELLS (Ells'Land A+B Shared Exit)

> **Freeze terlambat:** dilakukan sesudah batas 4 Nov 2026 12.00 WIB dengan izin dosen. Forward test tetap berakhir 14 Nov 2026 12.00 WIB, jadi kurang dari 10 hari.

| | |
|---|---|
| Nama / NIM | Mirabel Lordniani Gustaman / 25110200037 |
| Vercel | https://uas-bells-bot.vercel.app |
| Repo | https://github.com/bellordgust-gif/uas-bells-bot |
| Commit freeze | `1890e710e887090ed6e5237f69c6f915896bea1c` (2026-11-04T13:52:35+07:00) |

## Strategi
Sumber: `bells_engine.js` dan `bells_strategi_ab.html`, profil Agresif. Sinyal ada di `lib/strategy.js`, dan satu fungsi `decide()` dipakai bot serta backtest.

- **Modul A:** close > high 100 hari × 1,005; close > EMA50 > EMA200; EMA200 naik 20 hari; ROC252 > 0; median turnover 60 hari ≥ Rp500 juta; cooldown 10 hari sesudah exit.
- **Modul B:** dicek pada candle pertama tiap bulan; momentum 12-1 positif; close > EMA200 yang naik; median turnover 60 hari ≥ Rp5 miliar; kandidat top 16.
- **Exit bersama:** stop tetap −4×ATR20, atau 2 close hari berturut-turut di bawah EMA100.
- **Ukuran posisi:** risiko 1,5% per trade, risiko agregat 9%, bobot maksimum 15%, order ≤ 1% ADV20, guard breadth, guard korelasi 25%. Maksimum A6/B8/total 12.

## Perubahan dari sumber asli
| Bagian | Sumber (saham Kompas 100, harian) | Bot (kripto Indodax, 4 jam) | Alasan |
|---|---|---|---|
| Universe | Kompas 100 | BTC ETH XRP DOGE TRX VELO ADA BNB /IDR | Pasangan likuid Oktober 2023; VELO ditolak karena spread > 2% |
| Indikator | Bar harian | 6 candle 4 jam terakhir digabung jadi satu hari | Aturan bisa dicek tiap 4 jam dengan panjang harian asli |
| Stop | Intraday di level stop | Low candle tertutup menyentuh stop, lalu jual di harga pasar | Bot hanya memakai candle tertutup |
| Settlement | Kas cair 3 sesi | Langsung | Kripto tidak memakai T+2 |
| Lot | 100 lembar | Tidak ada, minimum order Rp25.000 | Aturan Indodax |
| Biaya | Fee 0,25% + slippage 0,10% | Fee 0,20555% beli, 0,41555% jual, spread dan slippage terukur | Halaman biaya resmi, `data/sumber_biaya/` |
| Batas harian | Tidak ada | Tidak ada posisi baru bila ekuitas turun 5% per hari WIB | Ditambahkan untuk UAS |

ROC252 dan momentum memakai 252 hari kalender kripto (±8,3 bulan), bukan 12 bulan penuh, agar angkanya sama dengan sumber.

## Hasil backtest
Modal Rp100 juta, long-only, keputusan di close dan eksekusi di open candle berikutnya.

| Mulai | CAGR | MDD | PF | Trade | Beli & tahan BTC/IDR |
|---|---|---|---|---|---|
| 2023-11-01 | 18,65% | −21,20% | 5,30 | 43 | +152,37%, MDD −49,43% |
| 2022-12-20 | 11,80% | −20,90% | 2,93 | 55 | +431,05%, MDD −49,43% |

Keterbatasan:
- Trade di bawah 100, jadi sampelnya kecil dan PF bisa turun jauh di forward test.
- Sebagian besar laba datang dari 2024 (+50,93%). Hasil 2025 +2,21%, dan 2026 −0,35%.
- Return total kalah dari beli & tahan BTC pada dua periode, walaupun drawdown jauh lebih kecil.
- Median spread memakai snapshot order book dari bot Maudy sampai 2026-11-04 02:40 UTC (`data/snapshots/`) dan tidak diukur ulang saat freeze.

## Menjalankan
```
node tools/fetch_history.mjs 240 2022-02-01
node tools/spread_stats.mjs
node tools/backtest.mjs 2023-11-01 --ringkasan public/backtest_ringkasan.json --trades data/bt_trades.csv --sinyal data/bt_sinyal.csv --ekuitas data/bt_ekuitas.csv
node tools/tes_lokal.mjs
```
Deploy: buat proyek Vercel, hubungkan Upstash Redis dan QStash, lalu isi variabel dari `.env.example`. Panggil `POST /api/jadwal` dengan `CRON_SECRET` untuk membuat jadwal QStash (menit ke-11 tiap jam).

Akhir forward test:
```
node tools/ekspor_log.mjs <URL Vercel>
node tools/fetch_history.mjs 240 2022-02-01
node tools/hitung_ulang.mjs
```
Variabel rahasia hanya di `.env` dan Vercel. Jangan di-commit.
