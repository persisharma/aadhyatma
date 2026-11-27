# Vedansh Mandir: the website as a temple visit (design spec)

Date: 25 Nov 2026 · Status: prototyping three variants; the owner picks one at the end · Branch: `feat/vedansh-app-website`

## 1. Goal

Turn vedansh.app from a product page into a **temple visit**: the visitor walks from the gate past shrines to the
sanctum. Each shrine is a meeting (darshan + one small act + the matching Vedansh content). It must feel like the
best current interactive sites (references: the viral Claude-made wedding-invite reel, astraeatravel.com), stay
devotional, and still drive app installs.

**Success:** a first-time visitor on a budget Android phone understands what Vedansh is within 5 s, can install
at any moment, enjoys at least one interaction, and can find any of the 42 offerings.

## 2. Decisions (owner + Claude/Codex debate, 25 Nov)

| # | Decision | Source |
|---|---|---|
| D1 | Journey shape: **the walk (pradakshina)**. Scrolling is walking, gate to sanctum. A jump index lets returning visitors skip. | Owner chose A |
| D2 | Vedansh and all 42 offerings stay visible inside the temple; scroll and tap both interactive. | Owner |
| D3 | **No ritual is a gate.** Scrolling opens every door/curtain on its own; tap/drag is an optional bonus. "Get the app" stays visible on every screen. | Codex, adopted |
| D4 | **Only real data.** Countdowns use the app's precomputed observance dates (day granularity, no fake hours); "good time?" only where computed (existing Today-card maths). | Codex, adopted |
| D5 | The app is not called "prasad". The end is "Take the temple home". | Codex, adopted |
| D6 | First 5 s: brand, one plain promise, Hindi/English switch, Google Play + App Store buttons. | Codex, adopted |
| D7 | 7 shrines between gate and sanctum (not 12). Krishna, Hanuman and Saraswati share one Granth mandap; no Durga+Lakshmi merge; daily practice is a neutral japa mandap. | Codex + Claude |
| D8 | Build **three variants** and let the owner compare: V1 CSS-3D temple, V2 WebGL opening scene, V3 fast page + one moment. | Owner |
| D9 | New look allowed ("don't stick with the current theme"): **Sandhya**, a dusk temple. | Owner delegated |
| D10 | All artwork painted by Codex in one consistent world; every image audited by Claude (arms, attributes, no text). | Standing rule |

## 3. The walk (shared content, all variants)

| # | Space (EN / HI) | Meeting | Offerings shown (catalog ids) | The act (optional) | Real data |
|---|---|---|---|---|---|
| 0 | Mahadwar · महाद्वार | Welcome | promise + install | Ring the bell; doors open (scroll also opens) | none |
| 1 | Ganesh mandap · गणेश मण्डप | Shri Ganesha, shubh aarambh | panchang, muhurat, choghadiya, ask | Draw the curtain for darshan; see today's sunrise, sunset, current choghadiya, Rahu Kaal | Today-card maths from `website/app/src/Showcase.jsx`; next Sankashti Chaturthi |
| 2 | Granth mandap · ग्रन्थ मण्डप | Three alcoves, swipe between: Krishna (Gita), Hanuman (Chalisa), Saraswati (library) | gita, gita-saar · chalisa, sundarkand, ramayan · aarti, stotram, ashtakam, kavacham, suktam, garud-puran, sanskar | Krishna: pick a feeling, receive one of the 3 sample shlokas (2.47 results/work, 2.48 fear of failure, 2.50 overthinking). Hanuman: the opening doha lights line by line. Saraswati: swipe the shelf of granths. | `preview-content.json`; Gita Jayanti 20 Dec 2026 |
| 3 | Japa mandap · जप मण्डप | Quiet practice (no single deity) | japa, routine, sankalp, daily-bhakti, alarms | 11-bead mala with the 3 existing mantras | `preview-content.json` mantras |
| 4 | Vrat aangan · व्रत आँगन | Observances | vrat, vidhi, my-vrat | Light the diya; upcoming vrat list with "in N days" | app precomputed observances (list below) |
| 5 | Bal Gopal aangan · बाल गोपाल आँगन | For children | kids-stories, ramayan-comic | Swipe comic panels; story cards flip | existing art in `website/app/public/assets/sanskar/` |
| 6 | Navagraha mandap · नवग्रह मण्डप | The nine grahas | kundali, guna-milan, rashifal, gochar, namkaran | The nine shrines light one by one as you scroll; tap one for its name (no predictions) | none |
| 7 | Yatra & parivar · यात्रा और परिवार | Pilgrimage and family | theerth, deity, purpose, daan, audio · pitru, janma-tithi, parampara, vastu, widgets, share | Tap one of the 4 sample theerths; make a greeting (existing Share maker idea) | existing theerth data |
| 8 | Garbhagriha · गर्भगृह | Take the temple home | install | Store buttons, QR on desktop, public visit count | `/api/hits` |

Upcoming observances (from `mobile/src/panchang/precomputedObservances.ts`, purnimant): sankashti-chaturthi
2026-11-27, kaal-bhairav-jayanti 12-01, utpanna-ekadashi 12-04, pradosh-krishna 12-06, amavasya 12-08,
vinayaka-chaturthi 12-13, vivah-panchami 12-14, dhanu-sankranti 12-16, gita-jayanti + mokshada-ekadashi 12-20,
pradosh-shukla 12-22, purnima 12-23, sankashti-chaturthi 12-26, saphala-ekadashi 2027-01-03, makar-sankranti
01-14, putrada-ekadashi 01-19, purnima 01-22. Show "Today", "Tomorrow" or "in N days"; drop past dates.

Every offering keeps its catalog title and description (EN + HI) from `website/app/src/catalog.js` as real text.

## 4. Look: "Sandhya"

**Story of light:** the page starts outside at blue hour (indigo-plum) and grows warmer and brighter shrine by
shrine, ending in the sanctum's gold. Background colour is interpolated by scroll position.

Tokens: `--night #0e0b1f`, `--dusk #2a1838`, `--stone #d9a273`, `--stone-deep #9c5b35`, `--ivory #f8efe0`,
`--lamp #ffcc6b` (accent, sparing), `--marigold #f29a1d`, `--sindoor #c2381d`, `--tulsi #2f6b4f` (rare),
`--ink #1d120a`. Text on dark: ivory; on light: ink. Contrast ≥ 4.5:1 for body text.

**Ground decided (26 Nov colour audit): keep the indigo-plum dusk.** All text clears AA (lowest 5.2:1, after
lifting the unlit graha names from 2.7:1). A warm brown-black ground (closer to the app's warm-only chrome) was
built and compared; Codex rated it "warm with fixes", but the owner found it too black and kept the dusk. Do not
re-propose a warm or parchment ground for the walk.

Type: Latin display Cormorant Garamond (500/600); Devanagari display Tiro Devanagari Hindi; UI and body the
system font (Inter dropped after the first build: fonts went from ~380 KB to ~175 KB); Hindi body Mukta, loaded
only on Hindi pages (English pages show Hindi names in Tiro). Indic line-height ≥ 1.65. One language at a time
(owner, 26 Nov): every label follows the EN | हि switch. Only the chanted mantra and the Chalisa verse stay in
Devanagari on the English page, because there the script is the content. Devanagari is never letter-spaced.

Motion: slow and calm (600–1400 ms, ease-out); diya flicker, incense smoke, falling marigold petals only in
moments that earn them; nothing loops fast. `prefers-reduced-motion`: no parallax, no particles, doors and
curtains shown open.

Restraint (from the Astraea prompt): gold only for accents; do not overuse cards, rounded rectangles, glow or
gradients; must not look like a game UI; mobile is its own layout, not a shrunk desktop.

Persistent chrome: a slim top bar (Vedansh mark, EN/हि switch, "Get the app"), and a **lamp index**: one small
diya per space; visited spaces' diyas are lit; tapping one jumps there.

Art (Codex): `gate`, `door`, `ganesha`, `krishna`, `hanuman`, `saraswati`, `bal-gopal`, `navagraha`, `japa`,
`vrat`, `theerth`, `garbhagriha` (brief: `.context/prototypes/temple-visit/art-brief.md`). Existing site art
(kids stories, comic, theerth temples, app screenshots) is reused inside sections.

## 5. The three variants

All three: same content, art, tokens, top bar, install buttons, real data, accessibility and reduced-motion rules.

- **V1 · CSS-3D temple** (`v1-css3d/`). Hero: the closed temple doors (CSS 3D, `door` art mirrored) under the
  ringing bell, with the promise and store buttons; doors open on bell tap or on first scroll. Then the hero turns
  into the **shrine circle** (drag / arrows / keys / swipe; rail of names) as the "map" of the visit. Then the full
  walk with scroll-driven reveals: curtains part as each shrine enters view, layered parallax art, the Granth
  mandap as a horizontal swipe of three alcoves, the mala, the vrat list, comic swipe, navagraha lighting,
  theerth cards, sanctum. No 3D library.
- **V2 · WebGL opening scene** (`v2-webgl/`). Hero is a real three.js scene: the seven shrine paintings on arched
  panels around a central sanctum light, at different depths; the selected shrine moves toward the camera, others
  recede; slow camera drift; lamp-light glow, rising embers, incense smoke; arrows, keys, drag and swipe; rail of
  names; copy block updates. Loaded after first paint; on no-WebGL, Save-Data, low memory or reduced motion it
  shows the `gate` painting still. Below the hero: the same walk as V1 (shared code).
- **V3 · Fast page + one moment** (`v3-fast/`). An editorial, fast, searchable product page in the Sandhya look:
  hero with the `gate` painting, promise and store buttons; the single temple moment is the doors opening once on
  load (skipped for reduced motion); then the 9 spaces as compact art-led sections with all offerings and the
  live Today card; no other effects beyond fades.

Budgets (mid-range Android, 4G): first screen ≤ 500 KB transfer, hero art ≤ 250 KB, ≤ 150 KB gzip JS before the
page is usable (V2's three.js loads after first paint and is excluded but must stay ≤ 200 KB gzip), LCP ≤ 2.5 s,
INP ≤ 200 ms, CLS ≤ 0.1. Art shipped as WebP (q≈80, width ≤ 1600, 2 sizes).

## 6. Prototype layout and testing

`.context/prototypes/temple-visit/` (gitignored): `shared/` (tokens.css, content.js, walk.js/css, data, art),
`v1-css3d/`, `v2-webgl/`, `v3-fast/`, `index.html` board linking all three. Static files, served with
`python3 -m http.server`. English first with a working हि switch for headings and space names (full Hindi
parity is a production task).

Test every interaction with mouse, keyboard and touch emulation at 360, 390, 768 and 1440 px; reduced motion;
no console errors; Lighthouse mobile run per variant with the numbers recorded. Codex reviews all three on
visual delight, intuitiveness, readability, detail and story; fixes follow.

## 7. After the owner chooses

Port the chosen variant into `website/app` (React, EN `/` + HI `/hi/` pre-render, existing analytics ids for
every button, `/stats/` unaffected), with the full Hindi copy, then update the wiki runbook.
