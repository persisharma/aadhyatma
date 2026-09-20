# शेष सितंबर — व्रत-पर्व carousel

A five-card, 1080×1350 Instagram carousel for the observances left in September 2026,
three days a card, rendered from the app's own data and brand kit.

```
node make-cards.mjs          # → out/01-cover.png … out/05-cta.png
CHROME_BIN=/path/to/chrome node make-cards.mjs
```

No network is touched: the three brand fonts are read from
`mobile/node_modules/@expo-google-fonts` and inlined as base64, and the emblems are
drawn as SVG. Chromium is picked up from `/opt/pw-browsers/chromium` by default.

## Files

| File | What it is |
| --- | --- |
| `days.mjs` | the nine dates, names and tithis — the only file you edit for a new month |
| `glyphs.mjs` | the nine deity emblems, in the app's baked illustration palette |
| `make-cards.mjs` | layout + headless-Chrome render |
| `art/` | optional photographic art, one square image per day (see below) |
| `caption.md` | the post caption and its five hashtags |
| `out/` | the rendered PNGs, committed so a post outlives the session that made it |

## Where the dates come from

Every row in `days.mjs` was **read out of the engine**, not typed from memory:

```bash
cd mobile
TZ=Asia/Kolkata npx tsx -e "
  import { getObservancesForDate } from './src/panchang/festivalEngine';
  import { ALL_LENSES } from './src/panchang/lenses';
  for (let d = 21; d <= 30; d++) {
    const day = new Date(2026, 8, d, 12);
    console.log(d, getObservancesForDate(day, 'purnimant', undefined, ALL_LENSES)
      .map((o) => o.rule.nameHi).join(' · '));
  }"
```

Pitru Paksha has no festival rule — its window comes from
`pitruSmaran.pitruPakshaWindow(year)` — and the Sankashti occurrence's own name and its
अंगारकी flag come from `sankashtiOccurrenceName(date)`. Re-run those before publishing a
new month; a wrong date on a shared card is worse than no card.

## Swapping in your own artwork

The emblems follow the app's glyph rule (design.md §42): an **attribute** of the deity —
chakra, shankha, trishul, modak — in the baked palette, never a face and never an emoji.
If you want photographic or painted deity art instead, drop a square image into `art/`
and name it on the day:

```js
{ date: '2026-09-23', …, glyph: 'chhatra', art: 'vamana.jpg' }
```

The medallion, its ring and everything else stay exactly as they are. Only use art you
hold the rights to — nothing in `art/` is committed by default.

## House rules this follows

- **Five hashtags, occasion first** — the same budget and ordering `mobile/src/data/shareHashtags.ts`
  applies to verse shares, and for the same reason: with five slots, a tag nobody searches
  costs a fifth of the post.
- **Brand tokens are not re-invented** — palette, fonts, frame, the ॐ वेदांश़ ॐ wordmark and the
  smart link are the ones `marketing/reels/cards.mjs` already ships. Change them there, not here.
