# Vedansh — Design System

Reference document for all Vedansh / Aadhyatma modules (Hanuman Chalisa, Ramcharitmanas, Bhagavad Gītā, Sundarkand, and future sacred-text modules).

The source-of-truth visual reference is `design-preview.html` at the repo root. Open it to see live mockups of Home and Reader screens. This document captures the tokens, components, and rules so the same language can be re-applied in React Native.

---

## 1. Philosophy

- **Parchment-first.** The app should feel like an old manuscript, not a glossy modern reader. Warm cream base, sepia ink, saffron/gold accents.
- **Reverent, not decorative.** Ornamentation is minimal: a single `॥` glyph as divider, simple crest on Home. Never clutter the verse.
- **Text is the hero.** Every screen exists to carry Devanagari gracefully. Backgrounds are faded sketches that sit behind a parchment overlay — they must never fight the text.
- **Book-like pacing.** One verse per page, swipe to advance. No endless scroll in the reader.
- **Bilingual but Hindi-led.** Titles and verses in Devanagari; Latin (Cormorant Garamond italic) is a quiet secondary label, never a translation.
- **A line earns its place by telling the user something** (Sept 2026). The app grew a habit of closing screens with a muted caption restating its own stance — *"यहाँ रुक जाना भी पूर्ण है"*, *"यह कोई अंक नहीं है"*, *"यह परिचय है, विधान नहीं"*, *"निर्णय आपका है"*, *"यह सूची जान-बूझकर छोटी रखी गई है"*. The reader never asked, and under the very buttons they sat beneath they read as filler, so they are gone. A UI line now carries a **fact the user acts on** — what may be recorded, what a control does, where a hand-off leads, why a screen names no winner — or it does not ship. Nor does the app narrate its own implementation to buy trust: `userFacingImplementationCopy.test.ts` bans `on this device`, `offline`, `no cloud` and their Devanagari forms from every screen and component, so privacy is a property of the build, never a caption. The one carve-out (Oct 2026): a feature that truly needs the network — the streaming YouTube video fallback — may state it requires an internet connection, an actionable limitation rather than privacy marketing; the component carrying that copy is listed in the test's exceptions (RULEBOOK §3). The stance is enforced where it is load-bearing: in the data (no totals, verified-only registries, the gupt guarantee) and in the copy-guard tests' banned vocabulary. **This never touches content**: verse meanings, cause mahatva, katha शिक्षा, vidhi instructions and katha prose are what the reader came for and keep their full teaching register.

---

## 2. Color Tokens

| Token | Hex | Role |
| --- | --- | --- |
| `brandIvory` | `#FFF1D5` | Approved launch background; artwork keeps its copper and vermilion |
| `parchment` | `#F3E7C9` | Primary background for reader surfaces |
| `parchment-soft` | `#F8EFD6` | Lighter parchment for inner cards (with a soft `sm` shadow for lift) and flat controls |
| `parchment-deep` | `#E9D9B1` | Bottom-edge gradient, elevated surfaces |
| `ink` | `#1A0E03` | Primary Devanagari body text. Deepened from `#2F1E10` for contrast — ~15.4:1 on parchment (WCAG AAA). See `colors.ts` / `colors.contrast.test.ts`. |
| `ink-soft` | `#5A3A1E` | Secondary text / meaning body (~8.3:1) |
| `ink-muted` | `#6E5230` | Tertiary / metadata / placeholders / demoted secondary-language line. Deepened from `#8A6A47` (which only reached ~4.0:1) to ~5.9:1 (WCAG AA). |
| `saffron` | `#B8621B` | Primary accent, active states, arrows |
| `saffron-deep` | `#8A3E0B` | Strong accent, pager dot, labels |
| `iconInk` | `#6F3F1D` | Shared brown utility icon and inactive navigation tint |
| `iconAccent` | `#AD571F` | Active navigation, saved controls and wordmark accent |
| `gold` | `#A67C34` | Secondary accent, crest, section tags |
| `divider` | `rgba(138, 62, 11, 0.18)` | Borders, card outlines |
| `newBadgeBg` | `rgba(184, 98, 27, 0.16)` | "NEW" badge fill — saffron tint (recently-added content) |
| `newBadgeText` | `#8A3E0B` | "NEW" badge text — saffron-deep |
| `avoid` | `#9E4A2E` | Muted terracotta — inauspicious/त्याज्य timings (Rahu/Gulika/Yamaganda, avoid choghadiya). Warm palette, **never red**; PRD-14. |
| `avoidTint` | `rgba(158, 74, 46, 0.12)` | Fill behind an `avoid` row. Auspicious rows reuse `goldTint`; quality is always labelled in text too (§12). |
| `avoidChipBg` / `goldChipBg` | `rgba(158, 74, 46, 0.20)` / `rgba(166, 124, 52, 0.22)` | Fill behind a quality **chip/pill** (avoid / auspicious) on the Muhurat glance card. Deeper than the row tints so the pill reads as its own surface on the `cardActive` gradient — the 0.12–0.14 row tints were too faint to register as a chip (§31). |
| `avoidDeep` | `#7A3722` | Text **on** the avoid chip tint. Raw `avoid` clears AA on the card surfaces but drops to ~3.5:1 composited on `avoidChipBg` over the gradient's dark stop — chip text uses this deeper cut; pinned with compositing math in `colors.contrast.test.ts`. |
| `choghadiyaShubh` / `choghadiyaAvoid` | `#D2AB5E` / `#A85D40` | Choghadiya-strip segment fills on the Muhurat card (§33). The two qualities differ in **lightness**, not hue alone; every segment also prints its name. |
| `choghadiyaShubhTrack` / `choghadiyaAvoidTrack` | `#E8D09A` / `#D2A08B` | Not-yet-elapsed remainder of the running segment (elapsed share: `gold` / `avoidDeep`). |
| `skyNightTop` → `skyNightUpper` → `skyNightLower` → `skyNightHorizon` | `#160A03` → `#2A1508` → `#45250E` → `#5C3214` | The Panchang sky header at night (today, sunset → sunrise; §33) — deep sepia, the warm palette, **never indigo**. `skyNightTop` also fills the ribbon's moon disc. |
| `skyDayTop` → `skyDayUpper` → `skyDayLower` → `skyDayHorizon` | `#F2C77F` → `#F6D79F` → `#F9E6C0` → `#F7E3B8` | The sky header by day and on every browsed date. Day type is `ink` / `ink-muted` (muted ≈ 4.5:1 on `skyDayTop`). |
| `nightInk` / `nightInkSoft` / `nightInkMuted` | `#FFF4DC` / `#E9D8B6` / `#C2AC88` | Cream type on the night sky; all clear 4.5:1 on its lightest stop `skyNightHorizon` (muted ≈ 5:1). The night quality chip uses `nightInk` — coloured text on the composited tint falls under AA. |
| `nightGold` / `nightAvoid` (+ `nightGoldTrack`, `nightAvoidTrack`) | `#F2C46B` / `#B8694B` | Night accents — now dot, `अगला शुभ` line, chip tints (0.35 / 0.45). |
| `nightGlass` / `nightGlassBorder` / `nightGlassActive`, `dayGlass` / `dayGlassBorder` / `dayGlassActive` | `rgba(255, 240, 210, 0.10)` / `0.20` / `0.95`, `rgba(255, 250, 238, 0.55)` / `rgba(138, 62, 11, 0.16)` / `#FFF9EE` | Glass controls riding the sky — mode switch, location chip, calendar-system toggle, My Vrat, month/आज buttons; the active segment is the near-opaque `*GlassActive` with `saffron-deep` text. |
| `starLight`, `cloud`, `skyArcNight`/`skyArcNightRest`, `skyArcDay`/`skyArcDayRest`, `skyHillsNight`/`skyHillsDay` | `#FFF3D6`, `rgba(255, 251, 240, 0.6)`, … | Sky furniture: stars (night), clouds (day), the sunset → sunrise arc (travelled solid / to-go dashed) and the horizon hills. |
| `moonPaintedShade` / `moonHalo` / `sunHalo` | `rgba(60, 40, 24, 0.82)` / `rgba(255, 230, 180, 0.18)` / `rgba(240, 162, 60, 0.22)` | `CelestialGlyph` — shade over the retained moon painting and warm halos around the painted moon/sun. Decorative. |

**Home gradient** (top → bottom): `#F6ECD0` → `#F1E3BF` (`parchmentHighlight` → `parchmentGradientEnd` in `colors.ts`).

**Reader overlay** (on top of background image): vertical gradient
`rgba(243,231,201,0.85)` → `rgba(243,231,201,0.55)` → `rgba(243,231,201,0.75)` → `rgba(233,217,177,0.95)`. The themed artwork is the primary reading surface; this veil only softens it enough to keep verse labels legible without washing it out.

**Background image filters:** the CSS filter stack (`opacity: 0.52`, `sepia(0.35) saturate(0.85) brightness(1.02)`) applies only to `design-preview.html`. In React Native the sketch renders unfiltered — `BackgroundLayer.tsx` sets no `imageStyle` opacity or tint — and the fade comes solely from the parchment overlay gradient stacked above it.

### Scope of the warm-only rule

The palette is warm manuscript — **never green/red** — and signal colours stay inside it
(`avoid` is a muted terracotta, auspicious reuses the gold tint; both always carry a text cue,
§12). This rule governs **theme colour and UI chrome**, i.e. everything in
`mobile/src/theme/colors.ts`.

**Illustration exception:** the bundled Storybook illustrations
(`mobile/assets/icons/storybook/`, §42) carry muted peacock and water hues.
They are **painted attributes of the art, never signals**: Krishna's feather,
Kartikeya's plume, Ganga's waves. These colors stay inside the illustration assets;
badges, chips, borders, states and utility icon tints take their color from `colors.ts`.

### 2.1 App icon and native launch identity

**Approved particle integration (1 November 2026).** After font/reading-preference hydration, `BrandLaunchGate` mounts the accepted 3,809-particle canvas on ordinary launches. `BrandLaunchReveal` defers the existing WebView module and the composed document until accessibility queries resolve. The exact accepted fragment, SHA-256 `af052692ac2477860ae6c0e69ed7ce6754ed5dcf1400f10bd7e78665c6ad69d5`, is retained in `docs/branding/approved-particle-preview.html`; `scripts/prepare-approved-brand.mjs` embeds it verbatim in a local document and derives the shared wordmark crops. There is one renderer and one source for the app and downloadable exports: original copper/vermilion icon, joined English name, Hindi name and both companion subtitles coalesce together for 3,350ms. Native hosting only centers the existing 720×780 composition, hides the preview replay button and adds readiness/completion messages. It never replaces the type or trajectories. No network resources, new native dependency, font binary or playback service are introduced.

The OS splash remains until the canvas reports ready; navigation and automatic asks mount after completion. Targeted notification/widget starts bypass the introduction. Reduce Motion, screen-reader use, backgrounding, incoming links, native-query errors and rendering/process errors complete immediately; a 7,000ms watchdog bounds stalled startup. Early destinations still prepare the lazy Panchang stack before initial navigation. `ArtworkCaptureContext` now also waits for mounted wordmark images before share capture. Native iOS/Android fidelity, performance and actual exports require device evidence; source-level identity is separate. Confirm Samarkan registration before production use; the project does not bundle its font software.


The approved app icon uses enlarged copper relief geometry on warm ivory with a distinct vermilion bindu. The red is part of this approved brand artwork, never a UI status color. Keep the complete approved composition: no new lotus surround, recoloring, baked-in rounded mask, or regenerated geometry during export.

`mobile/assets/branding/app-icon-master.png` is the approved source. Its generation prompt and SHA-256 export manifest live beside it. Run `node mobile/scripts/export-app-icons.mjs` to derive `icon.png` (1024px, opaque iOS/legacy launcher), `splash-icon.png` (512px), `favicon.png` (64px), and `adaptive-icon.png` (1024px with the artwork centered in the Android 72/108 viewport). The essential central symbol stays inside Android's 66dp safe circle; peripheral decoration can be masked by launchers. Android adaptive and splash backgrounds use ivory `#FFF1D5`.

**Splash is feathered, the launcher is not.** The launcher `icon.png` keeps the full parchment tile (correct at home-screen size). The splash, however, is drawn `contain` on a flat `#FFF1D5` field, where the master's honey-cream corners and paper grain would show as a hard square "cropped tile" seam. So the export feathers `splash-icon.png` only: a superellipse mask (preserve inside `r0=0.90`, fade to `r1=1.02`, exponent 4, in half-width units) floods the image-corners to `#FFF1D5` while keeping the square frame crisp, so the emblem reads as a mandala radiating on the field rather than a floating chip. This is the single intentional divergence from a plain resize; the mask runs in pure JS (`pngjs`) to keep exports deterministic (no `sharp`).

`mobile/app.json` owns all four references. The explicit `expo-splash-screen` plugin uses a 200pt iOS image and a 160dp Android image; with the feathered emblem these sizes place the mandala at roughly half the screen width on a flat cream field. Home's Om-flanked wordmark and text-only share footer remain separate brand treatments; `AppIcon.tsx` is the navigation/control glyph registry, not the app logo. Launcher/splash changes require a new native binary; OTA and Expo Go are not native-launch verification. Review generated iOS assets, Android circle/squircle masks, and launch screens before release.

---

## 3. Typography

Two typefaces, four roles.

| Typeface | Usage |
| --- | --- |
| **Noto Serif Devanagari** | All Devanagari: titles, verses, meaning body, card names. Weights 400/500/600/700. |
| **Cormorant Garamond** | Latin titles and subtitles, page counters, swipe hints, italic labels. **600 non-italic** for Latin chapter numbers and English card/routine titles, 600 italic for section labels. Italic is reserved for labels and short flourishes. No longer the English reading face (Oct 2026): its small x-height and hairline dots washed out over the reader sketches. |
| **Tiro Devanagari Sanskrit** | English reading text: romanized verse lines (`verseLatin`) and English meaning/commentary (`meaningEnglish`), via `fontFamilies.sanskritLatin`. Drawn by Tiro Typeworks for romanized Sanskrit; carries every IAST letter (several candidates, e.g. Literata, lack `ṁ`). Loaded from `@expo-google-fonts/tiro-devanagari-sanskrit` (400 only), so verse↔meaning hierarchy comes from size. |
| **Noto Serif Gujarati** | All Gujarati (`gu` reading language): titles, verses, meaning body, card names. Weights 500/600. Same family/weights as the Devanagari cut so the reading type scale carries over unchanged. |
| **Noto Serif Kannada** | All Kannada (`kn` reading language): titles, verses, card names (Kannada meaning prose follows English). Weights 500/600. |
| **Inter** | Only for tiny UI chrome where reading content is not involved. Loaded via `@expo-google-fonts/inter` in `App.tsx` (500/600) and carried by the `sectionLabel` / `versePill` / `cardMeta` tokens (`typography.ts`), plus the tab-bar labels. Indic-script pill/label text swaps off Inter to the script serif via `pillTextStyle()` (`utils/langType.ts`) — Inter has no Indic glyphs and Latin tracking splits the shirorekha. |

**Font families come from tokens, never from string literals.** Always
`fontFamilies.*` (`mobile/src/theme/typography.ts`) — never a hand-typed
`'Inter_600SemiBold'`. A family string that names an unloaded or misspelled face fails
**silently** in React Native: the node just renders in the system font. That is exactly how
four call sites shipped referencing `NotoSansDevanagari_600SemiBold`, a family the app never
installed or loaded — including the Jyotish share card, which is exported as an image and
shared outside the app. 125 such literals across 23 files were migrated to tokens in July
2026. **Enforced:** `eslint.config.js` bans font-family string literals outside `src/theme/`.

### 3.0 The 10 pt floor

**No UI chrome renders below 10 pt.** The font-scale system (§12) deliberately never scales
chrome — only reading content — so a 7 pt badge is 7 pt forever, at every accessibility
setting. 10 is the scale's own floor (`versePill` 10, `cardMeta` 11); anything smaller was
below the system's stated minimum.

A July 2026 audit found 50 chrome sites at 7–9 pt across Panchang, Kundali, Rashifal,
Theerth, Muhurat and the catalog cards. All were raised to 10, and the two fixed-size chips
that would then have clipped were grown rather than trimmed: the calendar `dateTag`
(24×12 → 28×16 — its label can be Devanagari, whose matras clip below ~1.45× leading; label now 10/15) and
the Panchang `starBadge` (15 → 16).

**Leading is part of the floor.** Any line that can carry Indic text needs **≥ 1.5× leading**
(10 → 15, 12 → 18, 16 → 24; 1.45× is the hard minimum) — the earlier 1.4× floor still clipped:
Search's verse line shipped at 17/24 (1.41×) and sliced the top of ि/ी, and a September 2026
sweep raised 28 more Indic-capable sites below 1.45× (Arc strip, Ask card, Vastu mandala grid
and compare/roster chips, Daan katha, Namkaran tags/share card, Prashna, Pitru Paksha hero,
Widget gallery, Jyotish/Guna Milan share micro lines, the Panchang `dateTag`). Glyph-only lines
(›, ＋, ॥) and Inter numerals are exempt; `lineHeight === fontSize` sits the first baseline so high that the top of
the line is sliced off, which reads as trimmed text rather than tight text. And a chrome line
that can render Indic must *name* a face that has the script — Inter does not, and the OS
fallback's metrics are taller than any fixed leading can predict, so route it through
`pillTextStyle` / `scriptTitleFont` (`utils/langType.ts`) — or `indicSafeTag` for the mixed-case
micro tags (`यही · this one`, `९ चरण · 12 अक्षर`) that keep their Latin case and tracking in English
but must not carry either over Devanagari. Both halves of this bit the Jyotish
share cards in August 2026: three micro lines shipped at 10/10, and the Kundali header
(Inter + a Devanagari label) rendered `जन्म कुंडली` as "जन्म कुंडला" while its method footer lost
its shirorekha. Guarded by `components/__tests__/jyotishShareCardFit.test.tsx`. Both halves recurred on Namkaran a fortnight later (§61) — a 58/78 hero syllable cropped `के`, and five Inter-tracked micro labels split their clusters — so treat "fixed leading on a Devanagari line" and "Inter on an Indic label" as the two things to check on any new card, not as one screen's history. Its guard is `components/__tests__/namkaranTypeFit.test.tsx`, which also pins that a hero line pins **no** leading at all: a fixed box cannot follow `maxFontSizeMultiplier`. The third form of the same fault is a fixed leading paired with **platform auto-fit**: `adjustsFontSizeToFit` scales the glyphs and leaves `lineHeight` where it was, so the leading ratio grows as the text shrinks — the verse share card's meaning reached 7 pt inside 24 pt of leading before it was sized in JS instead (§39). **A fixed `lineHeight` and `adjustsFontSizeToFit` must never sit on the same Text**; size in JS, derive the leading from that size.

**Enforced:** `eslint.config.js` bans `fontSize` below 10 outside `src/theme/`.

**One documented exception:** `NorthIndianChart` keeps sub-10 numbers because those are
**viewBox units**, not points — they scale with the chart's `size` prop, so the "chrome can
never grow" premise does not hold. Reasoning is recorded at the call site.

**The thin italic Cormorant face (`latinItalic`, 400) is never used for numerals, clock times, ranges, quality chips, or status labels** — only for prose subtitles and short flourishes. Those secondary elements use the **non-italic ≥600 face** (`latinSemiBold` / `latinBold`): the thin italic strokes wash out against parchment and the `cardActive` gradient even when the color technically clears WCAG AA, so a time or chip set in italic reads half-visible. This has been re-fixed several times (e.g. the Muhurat glance-card times & auspicious/avoid chip, §31) — treat "small secondary text in italic on a light surface" as a readability defect on sight.

### 3.1 Romanization Style by Source Language

The Latin-script `linesEn` / `transliteration` field is rendered very differently depending on the source language of the verse. Use the rule that matches the *source*, not the *module*:

**Sanskrit verses → IAST + Hunterian digraphs.**
This applies to the Bhagavad Gītā in full (`transliteration[]`) and to the Sanskrit shlokas embedded in other texts (e.g., the three opening shlokas in Sundarkand, where `section === 'shloka'`).

- Diacritics in scope: `ā ī ū ṛ ṝ ṅ ñ ṭ ḍ ṇ ś ṣ ḥ ṁ`.
- Digraphs: `śh` (श + h aspirate), `kṣh` (क्ष), `chh` (छ), `ch` (च). An epenthetic `i` follows `ṛ` (e.g., `dhṛitarāśhtra`, `pṛithivī`) — this matches the popular BhaktiVedanta-style romanization the Gita corpus already uses, not strict Sanskrit IAST (`dhṛtarāṣṭra`).
- Reference (Gita 1.1):

```
dhṛitarāśhtra uvācha
dharma-kṣhetre kuru-kṣhetre samavetā yuyutsavaḥ
māmakāḥ pāṇḍavāśhchaiva kimakurvata sañjaya
```

**Awadhi / Hindi verses → pronunciation-based ASCII (no diacritics).**
This applies to Sundarkand's chaupais, dohas, sorthas, and chhands, and to all of Hanuman Chalisa (opening dohas, chaupais, closing doha). Tulsidas's Awadhi is recited with schwa-deletion and regional consonant variations that strict IAST does not capture — IAST `mahābīra bikrama bajaraṁgī` does not match how `महाबीर बिक्रम बजरंगी` is actually chanted, but `Mahaabeer bikram bajarangee` does. The romanization is hand-curated to reflect recitation; do not regenerate mechanically from the Devanagari.

| | Verse-line romanization |
|---|---|
| ✓ Sanskrit shloka | `dhṛitarāśhtra uvācha` (Gita) |
| ✓ Sanskrit shloka | `nānyā spṛihā raghupate hṛidaye'smadīye` (Sundarkand opening shloka) |
| ✓ Awadhi chaupai | `Mahaabeer bikram bajarangee` (Hanuman Chalisa) |
| ✓ Awadhi doha | `Buddhiheen tanu jaanike, sumirau pavan-kumaar.` |
| ✗ | `dhritarashtra uvacha` for a Sanskrit verse (diacritics dropped) |
| ✗ | `mahābīra bikrama bajaraṁgī` for an Awadhi chaupai (IAST imposed where it doesn't fit) |

**Gujarati-language verses (e.g. `jay-adhya-shakti`) → the same pronunciation-based ASCII as Awadhi/Hindi** (`Jay Aadya Shakti, Ma jay Aadya Shakti`). Their Devanagari `lines` are a 1:1 codepoint re-scripting of the Gujarati source (offset −0x180), so the `gu` reading language below reproduces the source letter for letter; never respell them as Hindi.

**Gujarati / Kannada (`gu` / `kn`) are script conversion, not romanization.** This §3.1 governs only the *Latin* `linesEn`/`transliteration` field, where schwa-deletion and recitation nuance matter. The Gujarati and Kannada reading languages instead render the Devanagari re-scripted to the sister Brahmi script (`mobile/src/utils/transliterate.ts`) — an orthography-preserving 1:1 codepoint mapping, which is exactly how this content is printed regionally. Mechanical conversion is correct there precisely because it is *not* romanization. (gu/kn carry no authored content fields; see RULEBOOK §1.)

**Display respelling (Oct 2026).** The rules above govern what is *authored and stored*. What English-mode readers *see* is a reading form derived at render by `readableRomanization()` (`mobile/src/utils/readableRomanization.ts`), applied inside `verseLinesByLang`, so every reader, the Daily Verse card, share cards, notifications, read-aloud and the bookmark preview show the same thing:

- Long vowels keep their macron: `ā ī ū` (they carry the chanting length).
- Every dotted or accented letter takes its plain spelling: `ś`/`ṣ` (with or without the Hunterian `h`) → `sh`, `ṛ`/`ṛi` → `ri`, `ṝ` → `rī`, `ṁ`/`ṃ` → `m`, `ḥ` → `h`, `ṇ ṭ ḍ ṅ ñ` → `n t d n n`.
- The corpus holds two IAST dialects: the Gita and most stotras use the Hunterian form above; strict IAST (`c` = च, `ch` = छ) survives in the ashtakams, kavacham, suktams and parts of the stutis. A verse with a bare `c` and no Hunterian digraph (`śh ṣh ṛi chh`) is read as strict, and its `c`/`ch` become `ch`/`chh`.
- Lines with no IAST letter (the Awadhi/Gujarati pronunciation ASCII) and any line carrying Devanagari pass through unchanged.

| Stored | Displayed |
|---|---|
| `śhiṣhyaste ’haṁ śhādhi māṁ tvāṁ prapannam` | `shishyaste ’ham shādhi mām tvām prapannam` |
| `dhṛitarāśhtra uvācha` | `dhritarāshtra uvācha` |
| `karmaṇy evādhikāras te mā phaleṣu kadācana` (strict) | `karmany evādhikāras te mā phaleshu kadāchana` |

Why: the stored form marked one sound twice (`ś` already means "sh", then an `h` follows), which slowed lay readers while still not being standard IAST for scholars. Search keeps indexing the stored IAST.

**This whole section does NOT apply to:**

- Chapter titles' English subtitles (e.g., `Bhagavad Gītā`, `Arjuna's Dilemma`)
- Verse-pill subtitles (e.g., `Chapter 1`, `Opening`, `Closing`)
- Library-card English names (e.g., `Hanuman Chalisa`, `Sundarkand`)
- UI chrome — counts (`47 verses`), hints (`← swipe →`), labels (`Meaning`, `Commentary`)
- **Theerth prose.** `significanceHi/En` and `originStoryHi/En` on each `TheerthTemple` are independent prose translations, not romanizations of the same verse line. Temple names (`Somnath`, `Kashi Vishwanath`) use popular English spellings, not IAST.

These remain in everyday English. A handful of common Sanskrit terms keep their conventional spelling outside verse-lines (`Gītā`, `kāṇḍa`) — the diacritic-or-not call belongs to the editorial team, not this rule.

**Rendering layout** is module-specific:

- **Swap-on-toggle (all modules, Gita included):** the toggle swaps Devanagari ↔ romanization in place, so only one script is visible at a time (`verseLinesByLang`). See §9 / §10. Sanskrit shlokas swap to IAST (the Gita's `transliteration[]`, Sundarkand's opening shlokas); Awadhi chaupais swap to pronunciation-based ASCII. (An earlier Gita revision rendered both scripts side-by-side; the shipped readers use one script at a time everywhere.)

### Type scale

This table is the **single source of truth** for reading-content sizing, implemented in `mobile/src/theme/typography.ts`. Every reader section and every surface that shows verse / transliteration / meaning / commentary consumes these tokens — **no hardcoded `fontSize`/`lineHeight` on reading content**, no per-section scale. Both languages render the meaning at the same *apparent* size (English is x-height matched, so its point size is smaller), and the verse sits above the meaning. See `RULEBOOK.md` §3 ("One reading type scale") and the guard test at `mobile/src/components/__tests__/readerTypeScale.test.tsx`.

| Role | Typeface | Size | Weight | Notes |
| --- | --- | --- | --- | --- |
| Screen title (`सनातन`) | Noto Serif Devanagari | 34 | 600 | Letter-spacing `0.01em` |
| Reader top-bar title | Noto Serif Devanagari | 16 | 600 | |
| Verse body (Devanagari) | Noto Serif Devanagari | 23 | 500 | Line-height 1.7 |
| Transliteration (Latin) | Tiro Devanagari Sanskrit | 20 | 400 | `ink`, line-height 29. Respelled for reading at render (§3.1). Sits above the English meaning (17) so the verse stays dominant. Sized to the x-height of the Cormorant SemiBold 24 it replaced (Oct 2026), so the apparent size did not change. |
| Meaning body (Hindi) | Noto Serif Devanagari | 20 | 500 | `ink-soft`, line-height 34 (≈1.7). Bumped 15 → 20 to match the English meaning, so both languages read at one meaning scale. |
| Meaning body (English) | Tiro Devanagari Sanskrit | 17 | 400 non-italic | `ink`, line-height 28. x-height match for the Cormorant Medium 20 it replaced (Oct 2026); Tiro's x-height is ~24% taller, so 17 pt reads at the Hindi meaning's scale. Italic is not used for this body. |
| Commentary body (Hindi) | Noto Serif Devanagari | 20 | 500 | `ink-soft`, line-height 34. Paragraph gap `14`. Commentary reuses the `meaning` token — one reading scale, no smaller commentary tier (see `bodyStyle` in `GitaVersePage.tsx`). |
| Commentary body (English) | Tiro Devanagari Sanskrit | 17 | 400 non-italic | `ink`, line-height 28. Paragraph gap `14`. Same `meaningEnglish` token as the English meaning body. |
| Commentary fallback note | Cormorant Garamond | 14 | 400 italic | `ink-muted`, centred. Shown when the selected language has no commentary for this verse but the other language does (e.g., Gita Chapter 1 has only ~20 % English commentary coverage in the published source). |
| Card name (primary language) | Noto Serif Devanagari (hi) / Cormorant Garamond (en) | 14–22 | 600 semibold upright (hi) / **700 bold** upright + `0.3` tracking (en) | Prominent top line on catalog, category, deity, and resume-sheet titles. The **active reading language** takes this slot — Devanagari-first by default (`'hi'`), English-first when the toggle is `'en'`. **Weight follows the slot, not the script.** The two scripts carry different *optical* weight at the same point size (Devanagari reads dark/dense, Cormorant reads light), so the English primary uses the heavier Bold face **and** is sized a step larger than the Devanagari primary at each call site (e.g. CategoryCard `latPrimary 17` vs `devPrimary 16`; LibraryCard `19` vs `17`) — otherwise an English-primary title reads as a peer of its demoted Hindi line. Ordering/weight/tracking is centralised in `orderTitlesByLanguage()`; per-script optical sizes are passed by each caller. |
| Card name (secondary language) | Cormorant Garamond italic (en) / Noto Serif Devanagari (hi) | 11–13 | 400 italic (en) / 500 medium (hi) | `ink-muted` lighter supporting line below the primary title — the language *not* selected. Sized ~2–5 pt below the primary and demoted to `ink-muted` (not `ink-soft`) across **all** call sites so it reads as a caption, not a peer. |
| Chapter card title (Hindi) | Noto Serif Devanagari | 17 | 600 | Gita Chapters Index. |
| Chapter card title (English) | Cormorant Garamond | 16 | 400 italic | Gita Chapters Index when language toggle = English. |
| Chapter tag (`अध्याय N` / `CHAPTER N`) | Inter | 10 | 600 | `0.3em` tracking, uppercase, `saffron-deep`. |
| Language toggle (Hindi half) | Noto Serif Devanagari | 15 | 600 | Active: `saffron-deep`; inactive: `ink-muted`. |
| Language toggle (English half) | Cormorant Garamond | 14 | 400 italic | Active: `saffron-deep`; inactive: `ink-muted`. |
| Page counter (e.g., `1 / 47`) | Cormorant Garamond | 14 | 400 italic | Lining figures |
| Section label (`LIBRARY`) | Inter (en) / script serif bold (hi·gu·kn) | 11 | 600 | `0.22em` tracking, uppercase. Latin-only labels (`CATEGORIES`, `DISCOVER`, `LIBRARY`) spread the token directly. **Bilingual** eyebrows (`आज के लिए` / `FOR TODAY`, `कब पाठ करें`, deity category rows, Panchang/Rashifal kickers) must route the token through `pillTextStyle()` (`utils/langType.ts`) — Inter has no Indic glyphs (silent system fallback) and `0.22em` tracking splits the shirorekha, so Indic scripts swap to the script serif with **no** tracking or case transform. Guarded by `utils/__tests__/langType.test.ts`. |
| Verse-type pill (`दोहा`, `चौपाई · 9`, `श्लोक · 1.1`) | Inter (en) / script serif bold (hi·gu·kn) | 10 | 600 | Saffron-deep on tinted bg. English pills keep Inter + `0.3em` tracking + uppercase; Indic-script pills render in the script serif bold with **no** tracking or case transform via `pillTextStyle()` (`utils/langType.ts`). |
| Meaning / Commentary label (`भावार्थ` / `Meaning`, `व्याख्या` / `Commentary`) | Cormorant Garamond (en) / script serif bold (hi·gu·kn) | 13 | 600 italic (en) / semibold (Indic) | **Single-language**: the label renders only in the reading language — `भावार्थ` (hi) / `Meaning` (en) / `ભાવાર્થ` (gu) / `ಭಾವಾರ್ಥ` (kn), and `व्याख्या` / `Commentary` etc. No bilingual dot-pair, no order flipping. English keeps `0.14em` tracking + italic + uppercase; Indic scripts use the script serif bold with no tracking. `saffron-deep`, centred. See the label styling in `GitaVersePage.tsx` / `VersePage.tsx`. |
| Sub tagline / swipe hint | Cormorant Garamond | 12–15 | 400 italic | |

### 3.2 Time format

Every clock time the app renders — Panchang anga ends, sunrise/sunset/moonrise, muhurat and
choghadiya ranges, kaal windows, share cards, widgets, notifications, Kundali/Namkaran birth
times, Japam alarms, Routine "offered" times, reminder copy — is **24-hour, zero-padded `HH:MM`**
(`06:24`, `17:13`, `00:05`). No AM/PM, no पूर्वाह्न/अपराह्न, and no device-locale 12-hour
switch. Ranges are `HH:MM – HH:MM`; an end past midnight takes the short-date suffix
(`02:04, 12 जुल`, `formatEndInstant`), never the printed-panchang extended hour (`26:04`). The one
source is `formatClock` / `formatRange` in `mobile/src/panchang/muhuratFormat.ts`; widget strings
are rendered in IST with `hourCycle: 'h23'` (`widgets/planPayload.ts`). Time inputs
(`ClockTimePicker`, `TimeStepper`) step a 24-hour HR column.

---

## 4. Layout Tokens

| Token | Value |
| --- | --- |
| Screen side padding | `24–28` |
| Card padding | `18` |
| Card gap (list) | `12` |
| Section-to-section vertical gap | `20` |
| Card radius | `18` |
| Thumb radius | `14` |
| Pill radius | `999` |
| Surface radius (reader overlay ends, etc.) | `36` on phone screen only |

### Gutters

> **Runtime tokens (source of truth: `mobile/src/theme/spacing.ts`).** Two gutters, not one:
> `spacing.screenGutter` (**28**) for catalog and hub screens, and `spacing.readingGutter`
> (**22**) for reader/chapter surfaces, where a reading column wants more line length.
> The 22 was blessed into a token in July 2026 — every reader and chapters top bar had
> independently converged on it while the declared token said 28. `ReaderHeader` (§9)
> consumes `readingGutter`, so the ~32 reader/chapter screens share one value.
>
> Home uses its own **16dp** page gutter (`spacing.lg` through `homeLayout.ts`, §18), shared by its cards, grid and carousel insets.
>
> Card padding, pill padding and modal insets that happen to equal 22 are **not** gutters
> and are not expected to use this token.

### Radii

> **Runtime tokens (source of truth: `mobile/src/theme/spacing.ts`).** One 4-step scale:
> `radii.sm` **10** · `radii.md` **14** · `radii.lg` **18** · `radii.xl` **22** · `radii.pill` **999**.
> `xl` was added in July 2026 for the shared **44 pt circular back-button control** — half of
> 44 is 22 — now used by `ReaderHeader.tsx` (every reader/index top bar) and `RashifalScreen.tsx`,
> after an audit found ten ad-hoc radii (11, 12, 15, 16, 17, 20, 22, 24, 26, 32) and none of them
> on the scale.
>
> **Not tokenised, on purpose:** an *incidental* circle — a radius that is exactly half its box —
> keeps a bare literal: the profile badge and the
> Panchang month stepper, as do `deityGlyphs/` + `CategoryIcon` illustration internals. Card /
> tile / pill corners and the one shared 44 pt back control take a token; one-off circles stay
> literals.

### Elevation

| Level | Shadow |
| --- | --- |
| `sm` | `0 1px 2px rgba(60, 30, 10, 0.06)` — default card |
| `md` | `0 8px 24px rgba(60, 30, 10, 0.14)` — active card |
| `lg` | `0 30px 60px rgba(60, 30, 10, 0.22)` — phone frame in preview only |

> **Runtime tokens (source of truth: `mobile/src/theme/elevation.ts`).** React Native exposes
> five named elevations rather than the `sm/md/lg` scale above. All share one warm shadow
> colour, defined once as `#3C1E0A` — never re-typed at a call site.
>
> | Token | Offset · opacity · radius | Use |
> | --- | --- | --- |
> | `elevation.subtle` | `0,1` · `0.06` · `4` | dim/inactive card, grouped-list surface |
> | `elevation.card` | `0,2` · `0.10` · `6` | default card |
> | `elevation.lifted` | `0,4` · `0.11` · `12` | active/selected catalog tile, chapter card |
> | `elevation.raised` | `0,6` · `0.16` · `14` | the one focal element on a screen |
> | `elevation.overlay` | `0,6` · `0.25` · `14` | floats above a scrim (feature-tour card) |
>
> **Cross-platform shadow.** iOS renders each tier from the `shadow*` props (offset · opacity ·
> radius above). Android ignores `shadow*` and — before Sep 2026 — drew its own shadow from an
> integer `elevation` prop, a hard grey box cast on all four sides that looked nothing like the
> soft warm lift the design intends. Each tier now also carries an Android-only `boxShadow`
> with the same offset/blur/warm colour (and no integer `elevation`, which would double the
> shadow), so both platforms show the identical soft warm lift. Requires the New Architecture
> (enabled) — `boxShadow` is a no-op on the legacy renderer.
>
> `subtle`, `lifted` and `overlay` were added in July 2026: an audit found 14 files
> hand-rolling shadows, so cards floated at slightly different heights, the warm hex was
> re-typed by hand (with `#3c1e0a` casing drift), and the tour card used an off-palette
> `#0a0604`. The tiers above are the clusters that audit found, so every real surface has a
> token. The cream palette has very low figure-ground contrast, so card surfaces must be
> opaque for the shadow to render.
>
> **Enforced:** `eslint.config.js` bans a hex literal on `shadowColor` outside `src/theme/`.

---

## 5. Iconography & Ornaments

- **Home wordmark.** `HomeWordmark.tsx` preserves the compact crest: a 42pt row, two 30pt saffron (`iconAccent`) Om circles, 22×1pt side rules and 11pt gaps (compact: no rules, 6pt gaps). Only the title lettering adopts the approved English/Hindi artwork: 28pt image height, source aspect ratio, tinted to the previous dark `ink` colour. The Hindi mark retains the brand dot below श (`वेदांश़`) as a small native overlay inside the row, clear of the glyph baseline. The localized companion subtitle uses the previous 14pt size / `inkSoft`, with 22pt script-safe leading and system scaling/wrapping. The centered crest leaves the existing 44pt Settings target clear. Home must never inherit the larger copper launch/share lockup.

- **Shared/export wordmark.** `VedanshWordmark.tsx` keeps the approved crops at their original colour. Hindi mode uses the Hindi mark; other modes use the fixed English brand mark. Optional bilingual mode shows both. Full marks are 180pt English / 110pt Hindi; compact marks are 86pt / 58pt, capped to their parent width at the source aspect ratio. The localized companion subtitle remains native text at 16/26 (compact 12/20), with script-safe existing fonts and system scaling/wrapping. Fixed share exports disable scaling only for their fixed text. Mark images retain inversion protection and localized accessible brand labels; share captures register their actual native decode with `ArtworkCaptureContext`.

- **Verse divider.** `॥` centered between two 1px horizontal rules, 80px wide, saffron at 60% opacity. Use between verse and meaning on every reader page.
- **Shared reader back control.** `ReaderHeader` renders Phosphor `ArrowLeft` inside a **44dp** circle with `parchment-soft` fill and `divider` border, centered in a real **48×48dp Pressable**. Bookmark/share keep their **34dp visible circles** and 21/20dp glyphs inside actual 48×48dp targets; their parent rows grow with the target rather than relying on parent-limited hitSlop.
- **Forward chevron.** Single `›` in saffron on active cards.
- **Pager dots.** 6px circles, `rgba(138,62,11,0.25)` resting. Current page dot: saffron-deep, width 18, radius 999 (pill).
- **No emoji. No photos.** Only hand-drawn faded sketches as backgrounds.

---

## 6. Background Image System

Four faded vintage sketches serve the Hanuman texts, published from `mobile/assets/chalisa/` to R2 (source art in `/images/`):

1. `Hanuman_sita.webp`
2. `Ram_hanuman.webp`
3. `hanuman_lankadahan.webp`
4. `Hanuman_sea.webp`

### Rotation rule

- Selection is **deterministic per verse**, resolved by a curated registry — `mobile/src/data/backgrounds.ts` (`getReaderBackground(sourceId, verse)`) — **not** a `% 3` hash:
  - **Hanuman Chalisa:** a hand-picked per-verse override map (`hanumanChalisaOverrides`, keyed by verse id — e.g. `chaupai-18`/`chaupai-19` → the sea-crossing sketch), with `Ram_hanuman.webp` as the default for every other verse.
  - **Sundarkand:** stanza-range buckets — stanzas 1–4 sea, 5–11 Sita, 12–18 Lanka-dahan, remainder Ram-Hanuman.
  - **Every other source:** one pinned image per source id (`sourceBackgrounds`), plus category/deity fallback maps for browse screens.
- A given verse therefore always shows the same image — stable as the user swipes back and forth — but the mapping is curated to match the verse's story beat, never re-rolled per render.
- Background surfaces apply the image as a `cover`-sized background filling the whole reading surface — the themed artwork is the primary background, with the parchment overlay (Section 2) stacked above only to keep text legible. The plain parchment shows solely as the while-downloading fallback. Reader folios reserve a compact landscape banner above text.
- `cover` keeps only the middle of a plate on a portrait phone (~46% of a square's width, ~69% of a 2:3's). Multi-figure plates are therefore commissioned **2:3 portrait** with every figure inside the central ~60% (दान-पुण्य, §73).

**Exception — Theerth.** Theerth detail screens resolve their background by **presiding deity**, with per-temple overrides for shrines whose deity plate is too generic (`getTheerthBackground(templeId, deityId)` in `backgrounds.ts`). The browse/map surface uses no background image — only the flat parchment gradient behind the stylised India SVG outline.

### Delivery and prose folios

Reading plates use `backgroundAssetManifest.json` and content-hashed R2 URLs under
`reading-backgrounds/`. `BackgroundArtwork` paints bundled paper immediately, then requests
persistent cached artwork after navigation focus and interactions. Deduplicated disk lookups
bypass the network queue, so unrelated slow downloads do not delay cached paintings. Only
misses enter the bounded download queue. All file operations are async;
downloads deduplicate by hash/extension, limit concurrency to two, time out after eight seconds
and cancel when the final viewer leaves. Completed valid artwork has no expiry, revalidation or
automatic eviction. Text and controls never await artwork; native decode errors preserve the
fallback and evict damaged files for recovery.

Five reviewed corrections (14 Oct) correct Karni Mata's background and colored banner, remove the Hanuman–Sita corner mark, and recreate Rama blessing Hanuman and Rama Darbar. Since 16 Oct they are the publishing sources for their own slots (`backgrounds/theerth-karni-mata`, `backgrounds/deity-rama-darbar`, `chalisa/Hanuman_sita`, `chalisa/Ram_hanuman`, `reader-illustrations/theerth-karni-mata`) and ship from R2 like all other artwork; nothing is bundled. Their new hashes are new cache files, so a device that downloaded the old art fetches the correction once. `scripts/verify-artwork-corrections.mjs` checks the sources and manifest hashes against the approval record in `docs/evaluations/artwork-corrections-2026-10-14/`. The Vishnu background uses the published sepia Narayana plate; colored banners remain separate. Full-strength previews retain source detail while normal backgrounds receive the parchment overlay.

Paged sections share a single screen-level paper image instead of duplicating it per list cell.

**Approved Option 2 (9 Oct 2026):** Vrat Katha, Pitru introduction/story and Daan Katha use
`ProseReadingCard` as a continuous folio, without a separate bordered/elevated text card. The
3,102-byte ivory paper texture has a quiet centre and faint botanical corners. Chapter pills
and headings precede thematic art; gold lines and the existing leaf icon separate art
from prose. The latest 10 October correction uses `ReadingBanner`: a 2:1 rectangle, width
up to 360pt and height up to 180pt, centred on wider cards. The opening section uses this
compact frame. The existing bundled manuscript icon appears in that opening plate while
remote art loads or fails, preserving layout and providing a neutral offline visual.

`kathaBackgrounds.ts` selects appropriate thematic deity plates; unsupported traditions use
neutral manuscript art. The new 900×600 Vishnu/Narayana plate is 94,904 bytes and replaces its
semantic source mapping. These are thematic illustrations, not newly authored story scenes.
Normal reading tokens and unrestricted vertical text scrolling remain. Katha and Pitru
introduction markers sit below the text viewport; the tab bar owns the bottom safe-area inset
for the Pitru introduction. Utility forms, charts, ledgers and kids stories retain their layouts.

**Approved rollout (10 Oct 2026):** The `ReadingArtwork` painting/divider is shared by all
seven canonical verse layouts, covering Chalisa, Aarti, Gita/Gita Saar,
Stotram/Stuti, Kavacham, Ashtakam, Suktam, Sanskar and the Ramayan readers. Verse pages add
the thematic banner above the verse; existing source, verse and kāṇḍa mappings remain. Daily Bhakti originally used the same opening plate
inside its shareable card (superseded by the 12 October reading-space correction below). Daan's landing page has one Annapurna plate; its journey's Why
section uses the prose folio. Pitru's education opening uses neutral manuscript art
and its overview shares the paper. Vidhi preparation and the first conduct step have one
painting selected from the guide's declared deities; personal-tithi remembrance uses
neutral manuscript art. Later conduct steps keep the divider without repeating the painting.
All plates use the same R2 loader and persistent cache. No additional bitmap is bundled for
this expansion. Native prose measurement protection also covers verse meanings/commentary.

**Reading-space correction (11 Oct 2026):** The user reported that repeating artwork on every
card pushes the reading content down and forces unnecessary scrolling. Paged readers now
show one banner on the **first reading card only** (first verse of each chapter/theme for
chaptered readers, first section of a Katha/Pitru introduction). Later cards keep the existing
paper and small gold divider, with no banner, manuscript placeholder, reserved image height
or image subscription. Jumping directly to a later verse does not turn it into a cover card.
Chapter transition cards are excluded when finding the first verse. Single continuous prose,
detail/guide screens keep their existing one opening image. Illustration
assets, semantic mappings, R2 manifests and the lifetime cache remain available and unchanged.

**Daily Bhakti reading-space correction (12 Oct 2026):** The rotating daily verse card has
no banner, reserved image space or illustration request (its themed background was restored
on 14 Oct — see below).
The verse starts 14pt below its source/action row. A single compact `Ornament` separates verse
and meaning with 6pt margins above and below; remove the previous wrapper's additional 14pt
margins and the ornament's 26pt margins. Preserve full verse/meaning text, shared reading-size
tokens, vertical scrolling for long content and the existing themed share-card background.

**Themed backgrounds restored (14 Oct 2026):** Adding the banner was never meant to change
the background. The 10 Oct rollout had also swapped the seven verse layouts, Daan Punya's
landing and the Daily Bhakti card from their semantic plate to the neutral paper, so once
the banner was gated (11–12 Oct) continuation verses and the daily card lost all thematic art.
They again use their original `BackgroundLayer` plate — `getReaderBackground(sourceId, verse)`
on every verse page (banner or not), `getReaderBackground(sourceId, { stanza: chapter })` on
the Daily Bhakti card, `getDaanBackground()` on Daan Punya — with the parchment overlay
(Section 2). Banner gating is unchanged. The neutral paper remains the CachedArtwork offline
fallback and the background of surfaces that never had a plate (prose folios, Pitru, Vidhi,
Daan journey/Katha, Garud Puran). Guarded by `readerArtworkPlacement.test.tsx` and
`DailyBhaktiScreen.test.tsx`.

**Share background readiness (12 Oct 2026):** Offscreen verse/prose/story captures wait for
every remote background layer to finish native painting, including both a Story frame and its
inner card. The capture-only barrier allows up to ten seconds; terminal download/decode failures
use the painted bundled fallback. Normal reading/navigation never waits on this barrier. Existing
illustrated kids-story capture still requires its scene artwork and refuses partial albums.

The initial 80pt/220pt frames were followed by a natural-height proposal. The user rejected
that proposal because tall portrait art increases scrolling, explicitly requesting rectangular
banners. An intermediate `ReadingBanner` implementation applied focal positions from
`readingBannerFrames.json`, with three contained compositions. The user rejected these
crops as clipping the paintings and requested new artwork made to fit. Approved dedicated
illustrations now replace all mapped crops with complete 2:1 canvases. Theerth shares the same
short frame. Dimensions are read synchronously from the publication manifest; no network size
probe, extra image fetch, layout callback or post-load layout shift is needed.

The replacement uses newly composed 2:1 artwork showing the complete meaningful scene
within the existing 360×180pt maximum. The user specified the approved Krishna kids-story
rendering: fine warm outlines, expressive faces, broad pastel fills, subtle paper grain, muted
terracotta/saffron, sage/slate blue-grey and matte gold. Match `kj-08.webp` and `kj-11.webp` as
style references, composing new short horizontal scenes rather than copying the portrait
format or its large empty bottom band. The four detailed painting drafts are superseded.
The user accepted the detailed Style 3 set on 11 October, requested gadas in the ocean-crossing
and Rama–Hanuman scenes, and authorized integration while retaining current backgrounds.
All 43 unique 960×480 banners are published and active for 44 aliases, including both checked
gada corrections. The before/after gallery, exact selected hashes, approval decision and
43-object public SHA-256 verification are in
`docs/evaluations/reading-visuals-2026-10-11/style3-full-set/`. Files total 4.45 MiB and range
from 61–132 KiB; file sizes do not establish device performance. Production iOS/Android exports
include none of these new banner files. Eight focused suites/205 tests and TypeScript pass.

**Separate asset purposes.** Reading backgrounds remain quiet textures/subdued surfaces behind
text. Reader illustrations are standalone thematic banners above text, with their own asset
folder, typed descriptor, `readerIllustrationManifest.json` and R2 prefix `reader-illustrations`.
This is an asset category, not a new navigation tab. `CachedArtwork` shares the existing deferred
loader and lifetime cache; `BackgroundArtwork` stays background-only. Legacy semantic aliases
activate only published illustration manifest entries in `ReadingBanner`, using the whole canvas
with `contain`. The published manifest contains all 43 approved illustrations. Staging future
changes leaves the app manifest unchanged; publish approved optimized files before activating
new hashes. Only changed content should download again. The lifetime cache and immediate
neutral fallback contract are unchanged.
Scoped standalone native banner, fallback, Katha scrolling and cache relaunch checks pass.
The initial simulator certificate failure was resolved in an isolated QA simulator by installing
the exact corporate CA already trusted by this Mac; default TLS validation remains enabled.
Real native downloads now verify one transfer per missing hash and offline reuse after restart.
See the October 11 `r2-loading-followup/review.md`. The complete reader matrix and
physical-device/frame-time performance remain pending.
See `docs/content-parity/reader-illustrations-art-style.md` for the category/style contract.

### Adding more modules

New reader artwork should be composed for the compact 2:1 banner with complete subjects and
meaningful props inside the frame, then visually approved before publication. Keep text on the
separate parchment surface and preserve the immediate neutral fallback and static layout.

---

## 7. Screen: Home / Index

> **Superseded.** The v1 one-scroll, tab-less Home (hero title + flat LIBRARY card list) has been replaced by the tabbed Home in **Section 18** — wordmark hero, DISCOVER carousel, and category grid. This heading is kept so section numbering holds; the flat library list now lives inside the Category List screens (§21).

The one element that carries over is the **footer mantra**: `॥ श्रीरामचन्द्र चरणौ शरणं प्रपद्ये ॥` — Noto Serif Devanagari **18** (token `footerMantra`, `typography.ts`), `ink-muted` at 55% opacity, centred at the end of the Home scroll content.

---

## 8. Component: List Row Card (`ListCard`)

**Purpose.** The one list-row card in the app. Every list row renders `components/ListCard.tsx` — library entries (`LibraryCard`), sadhana programs, vidhis, audio tracks (`TrackCard`), chapter indexes (`GitaChapterCard`), Muhurat/Namkaran/Vastu rows and doors, Theerth browse rows and deity rows (`DeityCard`). An Oct 2026 audit found ten hand-rolled copies at four paddings, five thumb sizes and three shadow tiers; the shell now fixes those values and callers own only the slots. `ListingCard` (§82) is the one deliberate exception — its size comes from the illustration.

```
[ thumb ]  [ title (reading language) ]               [ trailing ]
           [ second-language name (optional) ]
           [ meta ]
```

**Sizes** (`size` prop):

| | `regular` (content rows) | `compact` (browse/group rows) |
| --- | --- | --- |
| Padding · gap | 18 · 14 | 14 · 12 |
| Thumb (`CardThumb`) | 52×52, `radii.md` | 44×44, `radii.md` |
| Lines | title · second-language name · meta | title · meta (second-language name optional — `DeityCard` keeps it) |
| Used by | `LibraryCard`, sadhana, vidhi, `TrackCard`, `GitaChapterCard`, Muhurat/Namkaran/Vastu rows | Theerth category/state/temple rows, `DeityCard` |

**Surfaces** — the only two:

- **Active:** `cardActiveFrom → cardActiveTo` gradient, 1px `cardActiveBorder`, `radii.lg`, **`elevation.lifted`**. Thumb on the `cardThumbActiveFrom → cardThumbActiveTo` gradient.
- **Disabled** (`disabled`, a "coming soon" `LibraryCard`): `cardSurface` fill, `divider` border, `elevation.subtle`, not pressable; thumb flat `cardThumbRest` with a `divider` border; thumb art and title lines at 55% opacity. A `SOON` pill (10, uppercase, 1.6 tracking, `goldTint` fill) sits top-right.

There is no flat variant (removed Oct 2026: its `parchment-soft` fill was lighter than the `background`, so it read as a white slab rather than a quieter card).

**Text column** (`CardTitles`, sizes from `CARD_TITLE_SIZES` via `orderTitlesByLanguage`):

- Title: dev 17 / lat 19 (Cormorant Bold, 0.3 tracking), `ink`. **Wraps — never clamped**; a cut Devanagari title can lose its meaning.
- Second-language name: dev 13 / lat 12 italic, `ink-muted`; 2 below the title, 6 above the meta (2 on compact).
- Meta (`CardMeta`): 11, `ink-muted` at 0.9. Font follows the text's script (`metaFont`): the Noto Serif face with **no** tracking for Devanagari/Gujarati/Kannada (§46 — Inter has no Indic glyphs and tracking splits the shirorekha), Inter with 0.4 tracking for Latin.

**Trailing slot** (the behaviour rule): `›` (26, `saffron`) opens the item · `＋ ›` (`CardRoutineTail`: 30pt gold-ringed ＋ with 12 hit slop, then ›) opens it and can add it to a routine · ▶ plays in place (`TrackCard`) · pill `›` opens and shows progress (sadhana) · `SOON` is disabled. Compact rows never carry ＋ — groups are not routine items.

**Overlay slot:** absolutely positioned NEW/SOON badges (`newBadgeBg` fill, `newBadgeText`, 10 uppercase) — top 12 / right 12 on regular, top 8 / right 8 on compact.

**Spacing:** 12 between cards. `ListCard` carries `marginBottom: 12`; wrappers used inside `gap: 12` lists (`LibraryCard`, `DeityCard`, `TrackCard`, `GitaChapterCard`) pass `marginBottom: 0`.

### `LibraryCard` content

| Text | Example |
| --- | --- |
| name (reading language) | `हनुमान चालीसा` |
| second-language name | `Hanuman Chalisa` |
| meta | `43 verses · Hindi with meaning` |

Thumb: tagged deity artwork with category fallback (§42); the single-akshara `thumb` is data only and is never drawn. Trailing: `＋ ›`, or plain `›` for theerth entries (they open a map, not a reader). Tapping an active card → push Reader (Section 9) for that module. A11y label: `<nameEn>. <subEn>.[ New.] Tap to open.` / `… Coming soon.`

### Read coverage row (§84)

On a full-size `active` card whose text has been read (or completed at least once), a row sits under the sub meta (8 top margin): texts with **more than one subsection** get a 4 pt `ReadProgressBar` (`saffronTint` track, `saffronDeep` fill, flex) plus `NN% · C.V` (12/600 `saffronDeep`; `C.V` = the latest saved position) and, after a completed reading, a `✓ N पाठ` chip; **single texts** (chalisa, aarti, ashtakam, stuti, sanskar…) get the `✓ N पाठ` chip (`goldChipBg`, Phosphor check 12 bold, 12 `saffronDeep`) and a muted `read / total` while a reading is in progress — a bar would sit at 100% forever after the first reading. The row is the last child of `ListCard`'s text column, under `CardTitles`, so a card with progress is taller (about 24 pt) than an unread one. Unread cards and non-reading rows (japa, theerth) show no row; compact `ListCard` rows (Theerth, deities) never carry coverage. The a11y label is unchanged (Maestro matches on it); coverage rides on `accessibilityValue`. **Long-press** (or the VoiceOver "Reset progress" action) opens the reset confirmation (§84) and the row becomes an inline `प्रगति रीसेट हुई · पूर्ववत करें` undo for 6 s. Files: `LibraryCard.tsx`, `LibraryCardProgress.tsx`.

---

## 9. Screen: Text Reader

**Purpose.** Show one verse at a time with its meaning (and, for multi-layered texts like Gita, its commentary) over a parchment-tinted sketch background.

Applies to both readers — the Hanuman Chalisa reader (linear, single text) and the Bhagavad Gītā reader (chapter-scoped, language-toggleable). Structural differences per module are called out inline.

**Layer stack (back to front):**

1. Parchment base color.
2. Background image (Section 6), `cover`, sepia-tinted.
3. Parchment gradient overlay (Section 2).
4. Content column — every verse page is a vertical `ScrollView` (verses + commentary may exceed screen height), with **64px bottom padding** so the last line clears the pager-dot overlay (`GitaVersePage.tsx` / `VersePage.tsx` `scrollContent`).

**Structure (top to bottom):**

1. Status bar.
2. **Top bar** — always `ReaderHeader` (see below); never a local copy.
   - Back button — returns to the previous surface (the Category List for Chalisa; Chapters Index for Gita — one level up in the stack, not always Home).
   - Title. Chalisa: `हनुमान चालीसा`. Gita: `अध्याय N · <titleHi>` (Hindi mode) or `Chapter N · <titleEn>` (English mode).
   - Progress counter (`1 / 47`, Cormorant Garamond italic). Counter is **chapter-scoped** for Gita (resets per chapter), **document-scoped** for Chalisa.
3. **Reading progress bar** (`ReadingProgressBar.tsx`) — a thin saffron track directly under the top bar showing position within the chapter/document.
4. **Toggle row** — rendered **once per reader**, in a persistent row above the pager (not on every verse page): `LanguageToggle` (Section 16) + `AddToRoutineButton`, centred.
5. **Verse area** (flex-1, 28px horizontal padding; each page scrolls vertically with 64px bottom padding so the last line clears the dots):
   - **Header row** (in-page): verse-type pill on the left, **Bookmark + Share buttons on the right** — the actions render on every verse page via the page's `topActions` prop (`GitaVersePage.tsx` / `VersePage.tsx`), not in the top bar.
   - Verse-type pill — vocabulary is consistent across modules: `दोहा · Opening` / `चौपाई · N` / `समापन दोहा · Closing` / `श्लोक · N.M` / f…62152 tokens truncated… and the `॥ ॐ ॥` endcap at 0.7 opacity. An unresolvable (draft) id renders the header only.
4. **Overview door** — §63.5.

**Data (`mobile/src/data/pitru/`) — 61 rows authored, 39 verified.** `lessons.ts` (`kind: 'parichay' | 'tithi' | 'shabd'`, `fortnightDay` on tithi rows — 10 concept incl. the draft पञ्चबलि lesson, all 16 fortnight tithis, 13 glossary incl. the draft पञ्चबलि term), `principles.ts` (`ref: {kind:'gita'|'valmiki', chapter, verseIndex}` — Gita 1.42 / 9.16 / 9.25 / 10.29 / 2.20, Valmiki 2.102.27 / 1.41.19), `kathas.ts` (four verified, each retold from the bundled corpus and anchored by a `ref`: Ayodhya 102, Bala 38–44, Aranya 67–68, Ayodhya 77), `prashna.ts` (9); `index.ts` exposes **verified-only** accessors behind `require()` thunks (the More stack imports the overview eagerly — launch-graph rule) and the single door predicate `hasPitruShiksha()`. Scripture is deep-linked, never re-typed; review-only `source` blocks are never rendered.

**A11y.** Every pressable carries an English constant label for Maestro (flow: `.maestro/pitru-paksha-smoke.yaml`): hub — `Read the introduction`, `Question <id>` (with `expanded` state), `Expand meaning` / `Collapse meaning`, `Open gita reader for <id>` / `Open valmiki reader for <id>`, `Open katha <id>`, `Glossary` (with `expanded` state), `Open Pitru Paksha overview`, `Open Tila-Tarpana remembrance guide`, `Open Pitru Smaran list`; reader — `Back`, `Reading language`, the read-aloud pill, pages `pitru-parichay-page-<id>`, counter `pitru-parichay-counter`; overview — `Open Pitru Paksha introduction`, `Open Tila-Tarpana remembrance guide`, `Open the first family shraddha day`, `Open day <en date>` / `Close day <en date>`, `Open smaran <en name>`, `Open the lesson on how a tithi is matched`. Cards are plain information panels; only interactive rows carry chevrons.

**Privacy.** The layer reads nothing from `PitruSmaranContext`; routes carry `{kathaId}` or an undated `{vidhiId}` only; reminder payloads are unchanged.

**Files.** `data/pitru/{types,lessons,principles,kathas,prashna,index}.ts` · `screens/PitruPakshaShikshaScreen.tsx` (hub) · `screens/PitruParichayReaderScreen.tsx` (reader) · `screens/PitruKathaScreen.tsx` · `components/KathaSectionPage.tsx` (`pillHi`/`pillEn`) · the door in `screens/PitruPakshaOverviewScreen.tsx` · routes in `navigation/types.ts` + `MoreStackNavigator.tsx`. Tests: `data/pitru/__tests__/pitruShikshaContent.test.ts` (Jest — registry invariants, reader-ref resolution against the bundled JSON, stance guard), `screens/__tests__/PitruPakshaShikshaScreen.test.tsx` (hub + reader + katha), the overview cases in `PitruSmaranScreens.test.tsx`, the reader's row in `readerReadAloud.test.tsx`; e2e `.maestro/pitru-paksha-smoke.yaml` (season-gated — see its header). PRD: `docs/roadmap/prds/44-pitru-paksha-shiksha.md`; prototype: `docs/pitru-paksha-shiksha-prototype.html`. Contract: RULEBOOK §28.

## 75. Screen loading & the background warm-up

**Purpose.** Every screen but each stack's root loads on demand, so the launch stops evaluating ~1.5 MB of surfaces most sessions never open. The cost must not reappear as a wait on the tap, so screens are warmed in the background before they are needed. The user-facing contract: **a tap on a warmed screen paints its content on the first frame, with no loading state at all.** The loading state below exists only for a tap that beats the warm-up.

**Structure.**
1. **Launch.** Each stack's root (Home, More, Panchang) is eager — it *is* the first frame, and deferring it would trade launch cost for a launch spinner.
2. **Warm-up order.** After `NavigationContainer.onReady`, screens are warmed breadth-first by tap-distance from Home (depth 2, then 3, …), one module per idle slice: each waits for `InteractionManager` to go idle and yields 60 ms before the next, so an in-flight touch, navigation or animation always wins the thread. Non-screen warm-ups ride the same walk — the Panchang stack chunk and the search index, both at depth 2. The search index runs *alongside* the walk rather than inside it: it is a many-second job at background pace, so its entry starts it and returns, and the walk carries on. It is built in ~8 ms time-budgeted slices over units of one chapter or one temple, each behind `InteractionManager` plus a one-frame gap; the worst slice measured one frame (§36).
3. **Following the user.** On every navigation the current route's children (from the generated `routeGraph.ts`) move to the front of the queue, so the walk stays one tap ahead of wherever the user actually is rather than finishing a depth they have left. Ordering only — it never blocks or drops a screen.
4. **Nested stacks.** Warming a lazily-loaded stack registers its own screens; the walk drains the registry rather than snapshotting it, so those join the queue at their own depth. A route registered on several stacks (Daan, Vidhi, GitaReader, VastuDisha) has each stack's copy warmed.

**Loading state (cold tap only).** Full-screen `parchment` surface, centred `ActivityIndicator` in `saffron`. No text, no skeleton — a cold module resolves in a few milliseconds, so anything richer would flash. Announced to screen readers as a progress bar labelled **खुल रहा है · Opening** (via `contentByLang`). Cold modules resolve through a cancellable effect rather than a `use(promise)` / Suspense hide-and-reveal cycle. This avoids Android Fabric re-attaching an already-parented SVG path when a cold route opens. Warm screens still paint synchronously; once mounted, the resolved screen keeps its element type and local state across updates. A load that fails reaches the existing error boundary and is retried on the next attempt rather than cached.

**Files.** `mobile/src/navigation/lazyScreen.tsx` (the lazy wrapper, warm/cold paths, loading state) · `screenPrefetch.ts` (the walk, `prioritise`) · `dataWarmups.ts` (non-screen warm-ups) · `routeGraph.ts` (generated by `scripts/gen-route-graph.mts`) · wiring in `App.tsx` (`onReady`, `onStateChange`). Gates: `__tests__/screenPrefetch.test.tsx` (what paints, warm and cold), `__tests__/lazyScreenRegistration.test.ts` (no eager screen imports), `routeGraph.test.ts`, `src/data/__tests__/launchGraph.test.ts` (budget). Registering a new screen: RULEBOOK §2 row 8.

---

## 76. Illustrated stories for children

**Asset delivery.** Every Kids Stories image, including the Home/library image, covers and older scenes, uses the hashed CDN manifest and persistent cache. No story artwork is imported into the app bundle. Source/review WebPs remain in Git. RULEBOOK §29.2 requires both production export asset-map checks and full CDN GET/hash checks before merge; source storage and on-demand device-cache storage are separate from the app asset payload.

Door: Home → Stories for Kids → deity (Krishna, Ganesha, Hanuman, Maa Durga) → story → reader. Catalog and reader routes load lazily. `data/kidsStories/index.ts` holds the deity and story registries; route params carry a stable `deityId`, `storyId` and optional `pageId`. The deity catalog uses the shared `DeityCard` treatment (§42), active-language-first bilingual names and authored Gujarati/Kannada spellings. A deity shelf is a §82 listing: `LanguageToggle`, one scope line with the shelf-wide age and count (`6+ आयु · 14 चित्र-पाठ`), then a `ListingCard` per story — cover art filling the thumb (`KidsStoryArt fill`), reading-language title, one-line description, `N पृष्ठ`. Planned stories can appear as subdued, non-tappable teasers; only records with complete content and artwork open a reader.

The shared `ReaderHeader`, parchment theme and persisted reading-language context match the scripture readers. Scenes use a horizontal, paginated `FlatList`, one per measured viewport width. Each scene is a vertical ScrollView inside the horizontal pager: the illustration keeps its width-derived height, and captions remain reachable through a short vertical scroll when needed. Caption length and reading size never shrink the art frame. Per-scene scripture citations are not shown to the reader (the `source` stays in the data only). The final scene adds the takeaway and source note below its caption. Navigation is swipe-only, matching the Gita reader (§GitaReaderScreen): the `n / total` counter sits in the header's right slot (italic `pageCounter`), a thin `ReadingProgressBar` runs under the header, and the shared `LanguageToggle` (the Gita two-segment reading-language pill, §16) sits in a centred row just below it — there are no Previous/Next buttons. Swipes drive the one shared index; the header back button returns to the library. Language changes preserve the scene; width changes restore that scene at the new width.

Text-free 4:5 illustrations use the approved muted pastel style; the Yamuna keeps its strong current. Krishna Janma has sixteen distinct scene illustrations plus its separate cover (`kj-01`–`kj-17`); each scene's art key resolves to the same bytes in the native reader and browser prototype. Inspect hand laterality, connected limbs and deity arm/object counts before accepting an illustration. `KidsStoryArt` uses the frame width to retain the natural 4:5 image height with `contain`; the art frame cannot shrink for a long caption. All 143 story illustrations have visually reviewed bottom-band frames in `mobile/src/components/kidsStoryArtFrames.json`, retaining the painted scene according to each reviewed boundary (the original 56 retain 78–88%). The image itself stays at its natural scale; only blank parchment is hidden. `hs09` retains the top 82%, including the people, cow, village and deities. A byte-hash gate requires re-review when an illustration changes; unreviewed future art stays full-height. The reader leaves the bottom safe-area inset to the visible tab bar, with an 8pt image/caption gap and bottom content inset plus 12pt caption vertical padding. Horizontal gestures still turn pages; vertical gestures reveal the rest of a scene. The native reader serves each illustration from the R2 CDN (`EXPO_PUBLIC_ASSET_BASE_URL`, resolved through `kidsStoryAssetManifest.json` by `assetCache`/`useCachedAsset`) and caches it once in the on-device document store — downloaded on first view, then served locally and offline, cleared only on uninstall; the parchment slot shows while a first fetch is in flight. The Home story-library card uses the same CDN manifest and cache. Narration is native text below the art, separately authored in Hindi, English, Gujarati and Kannada. The birth scene is the cover; the final Gokul scene has its own art and includes the takeaway and source note. The header back button returns to the deity shelf.

The Krishna shelf also includes Putana (10 scenes) and Kaliya Nag (8); Ganesha Birth (11) and Hanuman and the Sun (10) populate the other shelves. Each begins with a quiet illustrated setup page. Putana's concealed intention, response and collapse precede a separate rescue; Ganesha's decision, conflict and plea explain the events leading to restoration; Hanuman's hunger, Rahu's appeal and the world's appeal to Brahma connect the adventure. All four reuse this reader, with 39 distinct text-free scene illustrations (`pt-00`–`pt-09`, `ka-00`–`ka-07`, `gb-00`–`gb-10`, `hs-00`–`hs-09`). Covers use representative interior scenes, while closing scenes remain distinct. Records include dated publication provenance and page-level scripture references. The Ganesha story follows the Shvetakalpa Shiva Purana account; the Hanuman story follows Ramayana Uttara-kanda 35–36. Violence is briefly narrated and not graphically illustrated. Language selection changes native text, never artwork. Pacing evidence and nine illustration prompts live in `docs/content-parity/kids-story-pacing/`.

**Image/layout contract for every new story section (RULEBOOK §29.1).** Plan the supported frame against the actual viewport before generating art. Target a complete illustration plus short Standard caption in one viewport where practical; preserve readable text and allow real overflow at Large size or with longer narration. New artwork must not reserve a blank lower fifth, caption zone, black/white/parchment band or oversized border. Keep only modest breathing room and a narrow natural fade. Legacy 78–88% trims describe individual reviewed assets, not a reusable crop preset. Review every image/cover at full size and record its own frame/hash; keep `retainedHeight: 1` when there is no blank band. The current shared renderer assumes 4:5, so another source ratio requires a verified renderer change rather than forcing it into this frame. Diagnose source whitespace, aspect-ratio letterboxing, fixed-height wrappers, padding and duplicate safe-area insets separately. The visible tab bar owns the bottom inset in the reader, library and deity shelves. Cover wrappers specify width only and derive height from the reviewed art frame; shelf bottom padding is one `spacing.md`. Keep the approved 8pt scene gap/content bottom inset and 12pt caption vertical padding, preserving the existing horizontal reading gutter. Full native Standard/Large and locale review must distinguish unnecessary empty-space scroll from legitimate content overflow. Updated art template: `docs/content-parity/kids-stories-art-style.md`; reusable implementation prompt: `docs/content-parity/story-image-layout-prompt.md`.

The Durga shelf leads with a Navaratri introduction, then nine ordered day/form cover cards, then four further stories. Day 6 (Katyayani) opens Mahishasura without duplicating its content. Fourteen readings use 87 new illustrations and authored hi/en/gu/kn text. Navaratri, Kushmanda, Kalaratri and Siddhidatri are marked as introductions; all other entries are stories. Related Parvati narratives identify the devotional connection in source notes. Day cards show `दिन N` as the eyebrow; the form name stays in the accessibility label (`Day 7 · Kalaratri`). Introductions say so in their one-line description (परिचय / “Meet …”); cards carry no Story/Introduction tag. The Home card keeps its generic Stories for Kids title without a list of particular deities. Source, all-page pacing and image/frame review are in `docs/content-parity/kids-stories-durga/`; native coverage and R2 delivery status live in its validation report. Remote upload is necessary before a fresh device can fetch the new images.

**Multi-card sharing.** A `ShareButton` is pinned right of the centred language pill. Share icons sit at the trailing right side of their content card or header across the app; katha readers use the header right slot so the language row keeps its separate read-aloud control. It opens the existing §39 prose picker through the app's single `ShareProvider`, with the series laid out on the **picture card** (`layout: 'picture'`, `pictureCardMetrics`): the §39.4 chrome on a **540×960 dp (9:16) card captured at 1080×1920** for every target, so a shared scene looks like the reader page rather than a half-width thumbnail on a 4:5 card. Body 744 dp. Each scene is one card: the complete reviewed illustration at the body's full width (484 dp → 472–564 dp tall after the reviewed `retainedHeight`) when the caption leaves room, else narrower and centred, never under `illustrationMinHeight` (400 dp); then the reader's caption box (`parchmentSoft`, radius 12, padding 16/12): the scene title in `saffronDeep` at the fixed title face, the narration at the fixed body face, and the dialogue as a `quote` block in its `goldTint` box (radius 10, padding 12, speaker on its own line in the heading face, `inkSoft`). The paginator reserves the art minimum + `illustrationGap` (12 dp) on a scene's first page, counts the box padding and the narrower 452 dp text column, and the art fills what the caption leaves (`illustration.heightDp`); 416 of 644 scene cards are full-width today and none spills, a longer caption would continue on a plain picture card with the `…` cue. The closing card carries the story's cover art (`coverArt`, minimum `coverMinHeight` 260 dp), the takeaway, the source note and a `link` block (label in the heading face over `vedansh.app/get` in the Latin face, `goldTint`, never split across pages): a PNG cannot be tapped, so the link is printed and the share message's `Read on Vedansh: https://vedansh.app/get` line carries the tappable one. Geometry is fixed by the paginator, not measured at render, so estimate and capture share one geometry (`ProseShareCard` with `layout="picture"`: `testID` `share-scene-art`, `share-caption`, `share-quote`, `share-app-link`). The target sheet hides the 4:5 Instagram-post row for picture content (both Instagram routes would export the same 9:16 card); the story/reel row exports the picture card unframed, so its header band and footer may sit under Instagram's own top and bottom strips. Preview and thumbnails scale the 540×960 card (`ScaledShareCard` `metrics`). Four-language prepared scopes use native Gujarati/Kannada prose without transliteration. Complete scene groups are packed into explicitly numbered parts of at most ten cards, using the maximum card count across the four languages so part boundaries stay aligned. A separate “This scene” scope follows the visible page and includes the ending when sharing the final scene. Scope pills scroll horizontally below the page count so long or numerous parts stay reachable. Normal selection, preview, system album, single-card/story export and Instagram hand-off use the shared pipeline. An illustrated capture resolves the existing R2 cache and waits for native `Image.onLoad`; missing bytes, decode errors or timeouts abort the share with retry feedback. No placeholder or partial album is handed off. Instagram carousel assembly remains the existing manual Select multiple flow; an older binary without RNShare keeps multi-card actions disabled.

Every new or revised story follows RULEBOOK §29's mandatory full-arc pacing gate and `docs/content-parity/kids-story-pacing/authoring-checklist.md`: outline before captions/art, record page-by-page causal transitions and sources, read all four complete narratives, then inspect the full native sequence at Standard and Large. Passing schema/UI tests or reviewing only the opening cannot establish narrative completeness.

This data-driven picture-book reader does not replace GitaReaderScreen. Story bookmarks, progress persistence and read-aloud remain future work; no inactive controls appear. Gujarati/Kannada editorial review and native device verification are release checks.

Checks: `screens/__tests__/KidsStoryReaderScreen.test.tsx`, `screens/__tests__/KidsStoryCatalogScreen.test.tsx`, `data/__tests__/kidsStories.test.ts`, `utils/__tests__/kidsStoryShare.test.ts`, `utils/__tests__/kidsStoryShareFlow.test.tsx`, `.maestro/kids-stories-share-smoke.yaml`, `.maestro/kids-stories-smoke.yaml`, `.maestro/kids-stories-new-stories-smoke.yaml`, `.maestro/kids-stories-regional-smoke.yaml`, `.maestro/kids-stories-pacing-hindi-smoke.yaml`, `.maestro/kids-stories-art-scroll-smoke.yaml`. Contract: RULEBOOK §29. Prototypes: `docs/kids-stories-home-prototype.html`, `docs/kids-stories-catalog-prototype.html`, `docs/kids-stories-prototype.html`, and `docs/kids-stories-{putana,kaliya-nag,ganesha-birth,hanuman-sun}-prototype.html`. Sync the browser review copies from canonical JSON with `node mobile/scripts/sync-kids-story-prototypes.mjs`; it skips, with a warning, stories whose art is not yet wired in `KidsStoryArt`, and the Krishna Janma copy in `docs/kids-stories-prototype.html` is updated by hand.

### §76.1 Ramayana comic (native reader)

The Kids library lists the Ramayana comic as one ordinary app card. Its thumb holds painted art, not a letter tile (RULEBOOK §3): the `DeityCard` is given `iconKey="bowArrow"` so the card shows Rama's bow-arrow Storybook painting, matching the deity shelves above it. The card opens the seven-kanda comic shelf (§76.2), and a live kanda there opens `ComicChaptersScreen` with that kanda's native episode cards — §82 `ListingCard`s under a scope line (`N प्रसंग · …`, the kanda named from `comics.ts`), eyebrow `प्रसंग N`, meta `N पृष्ठ` (one panel is one page). Each prasang shows its own key scene, curated by topic in `data/comicBooks/episodeCovers.ts` (panel id + focal point; e.g. Valmiki and the krauncha pair for बालकाण्ड प्रसंग 1, the breaking of Shiva's bow for प्रसंग 23), rendered by `ComicArt fill` so only that panel's frame covers the 4:5 thumb — never the first panel or a neighbouring panel; an uncurated kanda falls back to each prasang's first panel. The shelf then opens `ComicReaderScreen` with a horizontal, swipe-only `FlatList`. Bālakāṇḍa (`balakanda-v1`, 29 prasangs / 62 pages) supplies all 140 reviewed panels including the three continuity additions and 31 reviewed speaker anchors; Ayodhyākāṇḍa (`ayodhyakanda-v1`, 81 prasangs / 269 panels) is described in §76.2. The stable catalog ids are retained for navigation compatibility; they no longer name a website URL.

The native reader shares `ReaderHeader`, `ReadingProgressBar`, the full-size `LanguageToggle` in a centred row (full language names, matching the episode index and scripture readers; the compact top-bar variant is not used here), app theme typography and the global Standard/Large preference. It has one page counter across the complete book, keeps the current panel when language/size changes, and permits vertical scrolling within each page. The tab navigator owns the bottom inset. The source/review pages, full-art links, website toolbar, episode select, comparison mode, independent size selector, and previous/next buttons are absent from the app. Provenance remains in the checked-in authoring edition.

`ComicPanel` keeps narration in the ink-bordered cream caption above the art. All 31 dialogue scenes use fully painted portraits with speech inside the image. `comicSpeechLayouts.ts` anchors each bubble edge near the cast and records a speaker endpoint; measured text grows away from the faces, and the tail reaches the endpoint without a fixed length cap. Inverted Trishanku's balloon sits below his head with an upward tail. Extreme accessibility text flows below the artwork without truncation. Speaker names remain in accessibility labels. Global typography controls size/leading; artwork retains its full painted bounds and aspect ratio. The reader uses 8-point side gutters and compact shared controls, with vertical scrolling for the complete image/caption.

`sync-comic-book.mjs` copies the reviewed text, dimensions, frames, and anchors into the lazy native book. `ComicArt` resolves the per-comic manifest through `getComicManifest(comicId)` (`comicAssetManifest.json` for बालकाण्ड, `ayodhyaComicAssetManifest.json` for अयोध्याकाण्ड — each edition under its own immutable content-hash CDN prefix), with the shared persistent asset cache. The 109 non-dialogue panels retain their reviewed source frames; 31 speaking panels use individually reviewed portraits. The selected package references 64 immutable PNGs; artwork is not bundled. A first-download failure keeps the art slot and offers retry while text/navigation remain usable. Hindi/English are the available narratives; Gujarati/Kannada display an explicit English-fallback notice without mutating the global language preference.

Validation: native reader/shelf/panel/art unit tests, reviewed-data parity, `sync-comic-book.mjs --check`, `verify-comic-assets.mjs --cdn`, iOS/Android production exports with `--dump-assetmap`, and `.maestro/comic-native-smoke.yaml`. Native sequence/editorial evidence is recorded in `docs/content-parity/ramayan-comic/balakanda-bilingual-v2/native-integration-review.md`; browser review is not native certification. No OTA or store release follows automatically from this integration.

### §76.2 Ramayana comic shelf (kanda listing)

The Kids card opens `RamayanComicScreen` — the seven kandas of the Valmiki Ramayana in narrative order, driven by `ramayanaKandas` in `comics.ts`. Each kanda is a §82 listing row (`ListCard`, `iconKey="bowArrow"` thumb, active-language-first name with the second-language line). A kanda whose `comicId` resolves to an edition in `comics` is a live row: pressable, meta `N काण्ड…`→`N प्रसंग · सचित्र`, opening `ComicChapters` (§76.1). The rest render the shared disabled `ListCard` state — muted surface, no chevron, meta "जल्द आएँगे / Coming soon" — and are not pressable, so the shelf shows the whole arc while naming what has shipped. Bālakāṇḍa and Ayodhyākāṇḍa are live; Araṇya, Kiṣkindhā, Sundara, Yuddha and Uttara are the coming-soon rows. The Kids card's own meta counts the live kandas (`${comics.length} काण्ड · सचित्र`), so a new edition lights its row and bumps the count with no further wiring.

**Ayodhyākāṇḍa edition.** Produced from `docs/content-parity/ramayan-comic/ayodhyakanda-preview-v1` into `ayodhyakanda-illustrated-v1` (`book.json` + `asset-manifest.json` + `art-sources.json`), then copied to `comicBooks/ayodhyakanda.json` and `ayodhyaComicAssetManifest.json`; its 81 sheets are uploaded to R2 under `comics/ayodhyakanda-illustrated-v1/` and served from the CDN like Bālakāṇḍa. Because the preview authored no speech-balloon geometry (the per-panel `zone` the bubble layout in §76.1 needs), its 189 speaking panels render speech as **speaker-attributed captions** below the art — the localized speaker name (from the preview's cast table) plus the quoted line, in the ink-bordered cream caption, in all four languages — never an overlaid balloon that could cover the painting. This is a faithful, art-safe rendering of a draft edition (its preview is marked "editorial approval pending"); balloons can follow once the 189 zones are authored.

## 77. गीता सार — themed readings over the Gita (Gita Saar)

**Purpose and approved direction.** Gita Saar connects a life question with the existing verified Gita selection. The 26 October 2026 prototype review approved a continuous lesson and rejected extra clicks. The follow-up review made distinct story paintings and concrete examples essential across all sixteen themes. One entry tap reaches a theme's illustrated lesson; scrolling reveals three story beats, the Gita connection, a current-day example and optional reflection. There are no required learning tabs, explanation toggles or separate completion screens.

**Identity and source of truth.** Sixteen themes / 170 entries retain their existing manifest order, refs, Saar text, IDs, bookmark keys and progress keys. The registry remains lazy. `themes/<id>.ts` carries references and existing Saar, never copied scripture. `experience.ts` keeps bilingual questions, category, takeaway and reflection prompts. `stories.ts` adds an original Hindi/English abridged retelling, three causal beats, image caption, source links, Gita references and a current-day application for every stable theme ID. Story passages, Gita text and editorial applications are visibly distinguished; no story is presented as a Gita quotation.

**Discovery.** `GitaSaarThemesScreen` keeps `ReaderHeader`, source-specific 2:1 Krishna–Arjuna `ReadingBanner`, parchment, the shared language preference and listing share. The introduction leads to the work/expectation teaching at theme 5 / index 0 (Gita 2.47); it opens directly, without a resume interruption. A separate continue-reading row uses existing progress. All sixteen cards show their own story illustration, question, original theme name and manifest count; opening a card starts with its illustrated story. Optional All / Mind / Work / Heart filters change only the visible cards, never registry order. “My learning” switches the same hub to saved verses and private reflections. This does not add another app-level tab bar.

**Continuous reader.** Preserve the bounded horizontal `FlatList`, measured page height, original theme transition sentinels, language and reading-size tokens, routine entry, share, read-aloud and auto-slide. The first page of each theme leads with its own complete 2:1 story painting and title, then the printed `श्लोक · c.v` / `Shloka · c.v` reference, theme line and complete Saar. The painting's description is an accessibility label, not a visible caption. Three visible narrative beats follow, with a separately marked Gita connection, current-day example and source citations. Keep source chrome concise: a short source heading, work and passage, with a chevron for available readers; omit explanations about links and repeated “Read here” labels. Every Gita reference in the connection or source list opens the exact bundled verse in `GitaReader`; Valmiki Ramayan source rows open the beginning of their cited kāṇḍa and sarga in `ValmikiRamayanReader`. Sources not available as a Vedansh reader remain plain citations with no browser action, and source URLs are retained only in research metadata (RULEBOOK §11.16). The prototype opens Gita references in its local sheet. Later verses offer a direct illustrated door back to the theme story. The source-specific `BackgroundLayer` stays mounted. Original Sanskrit/IAST and corpus meaning expand inline through an optional disclosure; opening it scrolls the expanded text into view. Every page retains its direct full-Gita handoff with `initialIndex = verse - 1`.

Group context follows the essence. The new story explanation appears once on the theme's first verse rather than repeating across all 170 pages. Later pages retain their theme-specific takeaway and optional writing. All sixteen paintings use the existing reader-illustration cache and complete 2:1 `contain` frames; they are published CDN assets rather than bundled image requirements. Neutral offline fallback never prevents reading. The earlier karma garden remains a published prototype asset but is superseded by Bhagiratha's scene in the current reader.

**Saving.** One action keeps the teaching and any optional reflection. Bookmark keys remain `gita-saar:<theme>:<pageIndex>` and old saved verses remain discoverable. Reflections use the separate lazy `@vedansh/gita-saar-reflections-v1` store: versioned, reference-validated, max 1000 characters, latest note per verse, serialized durable writes, retry after failure, and no empty-store overwrite after failed hydration. Notes remain on the device; they are not included in shares, narration, analytics or scripture. A failed reflection save retains the draft and reports an error inline. Removing a bookmark does not silently erase its reflection; remaining notes stay reachable on My learning.

**Navigation and accessibility.** A small previous/next footer complements swiping and crosses theme boundaries directly. First/last boundaries disable only when no previous/next theme exists. Editing stops read-aloud and auto-slide; keyboard avoidance resizes the measured reading viewport. All actions have at least 44 dp targets, stable English accessibility labels, selected/expanded/disabled state, and text/icon save feedback. Regional scripts derive Hindi content through the existing helpers. `ProseParagraph` preserves complete native wrapping; no content title/body truncation or auto-fit.

**Sharing.** Existing verse sharing retains the corpus verse, theme line, Saar and the closing line on a theme’s last verse. Private writing never enters the share payload.

**Evidence.** `docs/evaluations/gita-saar-stories-2026-10-26/` records sixteen source mappings, scene prompts, a 16-image contact sheet, the rejected/replaced chariot scene and exact published-asset hashes. `gita-saar-revamp-smoke.yaml` covers story-led entry, optional scripture, combined saving, persisted learning, previous/next and the exact Gita handoff. The earlier `docs/evaluations/gita-saar-revamp-2026-10-26/` preserves the prototype and first-pass record. Existing content, narration, auto-slide, cross-theme, type-scale, routing and search suites remain required.

## 78. नवग्रह विवेचन — the graha-by-graha cards (RULEBOOK §14.7, October 2026)

**Purpose.** Read each of the nine grahas the way a family pandit does — where it sits, how strong it is there, what it gives, where to take care, and one practice for it — in words a reader with no Jyotish can follow. It is the `grahas` section of the compiled report (§68), between `moon` and `combinations` (placement before combination). Adults only. **Signed off 7 Oct 2026:** the report screen passes `includeGrahaReadings: __DEV__ || grahaReadingsApproved()`, and `GRAHA_READING_REVIEW` now carries a dated sign-off, so store builds show the section. The sign-off pins a hash of the reviewed content, so a later content edit goes back to draft (development builds only) until it is re-reviewed (RULEBOOK §14.7.7); review state never appears in customer copy.

**Narrative-voice rebuild (all nine grahas, Oct 2026).** The bullet register below is replaced by a written **lead reading that re-synthesises for the specific chart** — the fix for "the card reads like a machine". `grahaReadingNarrative.ts` assembles **one module per graha under `panchang/narrative/`** (so each can be reviewed and signed off on its own): a hand-written core per **house × dignity bucket** (`strong`/`friendly`/`neutral`/`weak`, from `dignityBucket(dignity, relation)` in `narrative/types.ts`) plus a deterministic modifier layer that weaves in **lordship, combustion and retrograde**. The seven taras carry all 12 × 4 cells; the **nodes have no dignity**, so Rahu/Ketu share one reading per house across the four buckets (`nodeCell`) and take no modifiers (they rule nothing, never combust, and the retrograde modifier is excluded for nodes). `composeNarrative` returns `{leadHi/En, tendHi/En}` and `grahaCard()` attaches it as `KundaliGrahaCard.narrative` for every graha in `NARRATIVE_GRAHAS` (now **all nine**, derived from the table keys). In the open card `GrahaReadingList` renders the lead paragraph + a single **एक बात का ध्यान · One thing to tend** line in place of the About/Friends/Why/gives/care/rules bullets; the **upay panel and आधार toggle are unchanged**, and a **`<graha> के बारे में जानें · Know <graha> →`** link opens the generic reference (§80). It has its OWN gate — `GRAHA_NARRATIVE_REVIEW` + `narrativeReadingsApproved()`, **separate** from the legacy `GRAHA_READING_REVIEW` — so `showNarrative = __DEV__ || narrativeReadingsApproved()`. **Signed off 12 Oct 2026** (`GRAHA_NARRATIVE_REVIEW` approved, confirmed by the product owner — no names, like the legacy record), so the narrative now shows in **every** build and replaces the legacy card. There is no sheet-hash pin yet (unlike the legacy §78 record), so a later content edit does NOT auto-revert to draft — re-review by hand if the cells change. The generic facts the bullets carried (nature, मित्र-शत्रु, karaka) move to §80; the legacy bullet spec below stays in code as the fallback for any graha set back to draft.

**Register.** Bullets, not paragraphs (review note, 3 Oct 2026): every block is a short list, one idea per bullet, no full stop at the end. Meaning first, term second, in brackets: *In Karka (Cancer) — its strongest sign (exalted, uchcha)* / *कर्क में — सबसे मज़बूत स्थिति (उच्च)*. English names pair the planet with its Indian name (`Jupiter (Guru)`, `Mars (Mangal)`); English houses read `4th house — home, mother, vehicles, property and peace of mind`, never a bare `bhava`. No repeated "tradition links…" hedge — the report's single foot disclaimer frames everything.

**Structure.** Inside the standard section card (§68: eyebrow **नवग्रह · Nine grahas**, title **आपके नौ ग्रह, एक-एक करके · Your nine grahas, one by one**): the generic body paragraphs, fact rows and section-level आधार chain are NOT rendered; `GrahaReadingList` renders instead —

1. **Seven intro bullets** (`GRAHA_SECTION_COPY.body`): each graha looks after one part of life; what each card holds; the label is counted, not guessed; the three labels with the + / − legend; friends and enemies; karaka; *an upay is a practice … not a promise or an instant fix*.
2. A hint line *किसी ग्रह को छूकर उसका पूरा विवेचन खोलें। · Tap a graha to open its full reading.* (11/17, `inkMuted`, script body face).
3. **Nine rows**, one per graha in `GRAHA_ORDER`, 8 pt apart: a bordered card (`cardSurface`, 1 px `divider`, `radii.md`, 12 horizontal / 6 vertical padding). The row (min 48 pt) carries the graha name (script title face 14/21, `ink`), the house line (11.5/18 `inkSoft`, two lines when collapsed), the **tone pill**, and a `▴/▾` chevron (`saffron`). Pills (`radii.pill`, 9×3 padding, section-label face 10 en / 12 Indic): **सहायक · Helps you** on `goldChipBg` with `saffronDeep`; **मिश्रित · Mixed** on `saffronTint` with `inkSoft`; **ध्यान दें · Needs care** on `avoidTint` with `avoidDeep`.
4. **The open card** (tap the row; several may be open) — headed bullet lists, in order:
   - **इस ग्रह के बारे में · About this graha** — the meaning (*Jupiter (Guru) — the planet of wisdom…*), the sign bullet naming the sign, its lord and the relation (*In Simha (Leo) — ruled by the Sun, whom Venus counts as an enemy (shatru rashi)*), *Appears to move backwards (vakri)* when retrograde, and the house karaka (*This house’s karaka (guardian): Jupiter*).
   - **मित्र और शत्रु · Friends and enemies** — three bullets, *Friends: Sun, Moon, Mars* · *Enemies: Mercury, Venus* · *Neutral: Saturn*; absent for Rahu/Ketu.
   - **‘<label>’ क्यों · Why “<label>”** — one bullet per counted vote, glyph **+** (`saffronDeep`) when it helps and **−** (`avoidDeep`) when it asks for care, read aloud as *Helps: …* / *Asks for care: …*; a card with no vote shows its tone line instead.
   - **क्या देता है · What it gives** (2–4 bullets) and **कहाँ सावधानी रखें · Where to take care** (1–3 bullets), from `GRAHA_BHAVA_READINGS`.
   - **आपके लग्न के लिए इन भावों का स्वामी भी · For your Lagna it also rules** — one bullet per ruled house (*6th house — work and competition*); absent for the nodes.
   - Then the **upay panel** (`goldTint`, 1 px `divider`, `radii.md`, 10 padding): label `उपाय · इस बल को बनाए रखने के लिए / Upay · To keep this strength` on a supportive card, `… इस ग्रह को संतुलित रखने के लिए / To steady this graha` otherwise; rows **वार · Day**, **दान · Daan**, **सेवा · Seva**, **मंत्र · Mantra** (`<beej mantra> — 108 बार (एक माला)`; the English line is the transliteration) with 64 pt labels (wide enough for the tracked *MANTRA*); then the **japa pill** (`माला पर जप करें · Chant on the mala ›`, same practice-link style, a11y `Chant <Graha> Beej Mantra on the mala`) that opens the graha's beej mantra on the japam counter (`GRAHA_BEEJ_JAPA_ID` → `buildEntryStartTarget`, §35), then the paath pill (`Read <library name> ›`, the §68 practice-link style) → a `आधार देखें — यह कैसे निकाला गया · See the basis — how this was worked out` toggle that reveals the card's own `BasisChain` (`basis-graha-<graha>`).

5. **Empty houses** (`graha-empty-houses`, review note 4 Oct 2026), after the nine rows, in a bordered card like a graha row (`cardSurface`, 1 px `divider`, `radii.md`, 12 horizontal padding): heading **खाली भाव · Empty houses**; two intro bullets (*empty houses are normal — nine grahas share twelve houses*; *being empty does not make a house weak — its matters follow its lord*); then the subheading **आपकी कुंडली में · In your chart** and one bullet per empty house in house order (*3rd house (courage and effort) — ruled by Mercury, who sits in your 1st house (you yourself)*); then the same basis toggle (`graha-empty-basis-toggle`) revealing one `BasisChain` (`basis-empty-houses`) of each house's `bhava` and `lord` nodes. No label, no tap target besides the toggle.

Headings are section-label face at 10 pt (en) / 12 pt (Indic) in `saffronDeep`, 12 pt above and 2 pt below. A bullet row is a 10 pt-wide glyph column (`•` in `saffron`, 13/19) and the text (12/19, script body face, `inkSoft`), 7 pt apart, 4 pt between rows — the `bulletRow` pattern of `BhogGuidancePanel` and the Vastu mandir card. The handoff prints the same lists as `- ` lines under the same headings.

**Accessibility.** Each row is a button labelled `<Graha (Name)> reading` with `accessibilityState.expanded` and the house + label as its value; a reason bullet is one element read as *Helps: …* / *Asks for care: …* (the glyph is hidden); the basis toggle is `Show / Hide the basis for <graha>` (`… for the empty houses` on the empty-houses card); the paath pill is `Open <name> practice`. The `grahas` section card is deliberately not one grouped accessible element.

**Interaction.** No navigation of its own: the paath pill opens the shipped library text through `buildEntryStartTarget()` (`HomeTab`), exactly as the report's other practice links. Nothing persists — open rows reset on remount.

**Files.** `mobile/src/panchang/grahaReading.ts` (engine — votes, label, card; attaches `narrative` for piloted grahas), `grahaReadingNarrative.ts` (the narrative assembler — `composeNarrative`, `NARRATIVE_GRAHAS`, the 1-or-2-house lordship label) over `panchang/narrative/` (`types.ts` + one module per graha: `sun.ts`…`saturn.ts`, `rahu.ts`, `ketu.ts`), `grahaReadingContent.ts` (all copy + `GRAHA_UPAY` + `GRAHA_READING_REVIEW` + `GRAHA_NARRATIVE_REVIEW`/`narrativeReadingsApproved`), `grahaReviewSheet.ts` (the jyotishi sheet renderer), `kundaliBasis.ts` (`signRelationOf`, `housesRuledBy`, `NATURAL_BENEFICS`, `COMBUSTION_ORB_DEG`), `kundaliReport.ts` (`includeGrahaReadings`), `kundaliReportModel.ts` (v3 card types + optional `narrative`), `kundaliHandoff.ts`; `mobile/src/components/GrahaReadingList.tsx` (narrative vs legacy, the Know-this-graha link); `mobile/src/screens/KundaliReportScreen.tsx` (`onLearnGraha`); `mobile/scripts/export-graha-review.mts`. Convention: `docs/roadmap/conventions/graha-reading-v1.md`. Review sheet: `docs/reviews/graha-readings-jyotishi-review.md`. Tests: `grahaReading.engine.test.ts`, `grahaReadingNarrative.test.ts` (buckets, null for non-pilot, strong≠weak depth, modifier presence, completeness, bans, the separate gate), `kundaliReport.engine.test.ts`, `kundaliHandoff.engine.test.ts`, `KundaliReportExperience.test.tsx`, `GrahaReadingListNarrative.test.tsx` (narrative renders in dev, the learn link); e2e `.maestro/kundali-report-smoke.yaml` (opens the Jupiter card). Contract: RULEBOOK §14.3.5, §14.7.

### Native icon sizing follow-up (2026-10-06)

FOR TODAY compact cards retain their normal 196dp width. Above fontScale 1.2 their width grows to `min(windowWidth − 2 × horizontalGutter, 196 × fontScale)` (Home supplies 16dp) and titles wrap to their natural height. At enlarged text, the Today headline/timing chips and inline Routine title also retain their full text. Category art remains 62.7dp in all layouts; screen aspect ratio changes columns and scrolling, never the image aspect ratio. Fresh native evidence is tracked in `docs/evaluations/storybook-icons-2026-10-06/post-change/`.

---

## 79. App tracking permission (iOS, October 2026)

**Purpose.** Ask iOS App Tracking Transparency (ATT) once, before Meta install measurement starts, so App Review (2.1) can see the request on a fresh install. Android has no equivalent dialog.

**Structure.** A system alert drawn by iOS over Home. Only the second line is ours:

1. Title (iOS, fixed): *Allow “Vedansh” to track your activity across other companies’ apps and websites?*
2. Purpose line (`NSUserTrackingUsageDescription`): **So we know how you found Vedansh.** Plain words that answer the title's "why?": it names install attribution (the only use) without ad-industry terms, does not repeat the title's "Allow Vedansh", and carries no privacy reassurance (RULEBOOK §3 copy rule). It must stay true to the actual use (App Review 5.1.1); a new use means new copy. English only; the app ships no iOS `locales`.
3. Buttons (iOS, fixed): *Ask App Not to Track* · *Allow*.

**Interaction.** Requested after navigation is ready and the UI is idle, only while undetermined and askable. If iOS drops the request without showing it, the app asks again up to four times, 750 ms apart, in the same foreground. Meta stays inactive until the user answers. **Allow** lets Meta use the device's advertising ID for exact install attribution; **Ask App Not to Track** keeps the ID off and Meta falls back to Apple's aggregate install reports. Either answer leaves the app fully usable. Changing the purpose line needs a new store binary (Info.plist), not an OTA.

**Files.** `mobile/plugins/metaTrackingConfig.js` (`TRACKING_PERMISSION`), `mobile/src/utils/metaActivationController.ts` (ask/retry/activation order), `mobile/src/utils/metaAppEvents.ts` (native-flag gate), `docs/meta-app-events.md`.

---

## 80. नवग्रह परिचय — Know the nine grahas (the generic reference, Oct 2026)

**Purpose.** The teaching surface that lets the personal graha card (§78) stay a *reading* and not a datasheet. It answers "what each graha **is**, for anyone" — nature/role, what it governs, its naisargika **मित्र/शत्रु**, its weekday — independent of any chart, open to everyone (no birth data). This is the "Know **THE** nine grahas" half that pairs with the chart card's "Know **YOUR** nine grahas"; the generic facts the §78 bullets used to carry move here so the chart card can read like a person wrote it.

**Entry (a card in the Jyotish hub, plus at relevant places).** A **launcher card** in the Jyotish hub (`KundaliScreen`, beside the practice card: ✦ glyph in `gold`, label **जानें · Learn**, title **नवग्रह — परिचय · Know the nine grahas**, subtitle *हर ग्रह किसका कारक है · what each graha stands for*, on `parchmentSoft`/`radii.lg`), and a contextual **`Know <graha> →`** link on each personal graha card (§78) that deep-links with `focusGraha`. Reachable from `Kundali` and `KundaliReport` (routeGraph edges).

**Screen (`GrahaReferenceScreen`).** A back header (**नवग्रह — परिचय · Know the nine grahas**) + an intro line, then nine expandable cards in `GRAHA_ORDER` (`parchmentSoft`, 1 px `divider`, `radii.md`). Each row shows the graha name (script title face 16) and its *signifies* line (11.5/17 `inkMuted`) with a `▴/▾` chevron; tapping opens (`graha-ref-detail-<graha>`) the authored **nature** paragraph (14/23 `ink`) then label:value rows — **अर्थ · Meaning**, **किसका कारक · Governs**, **मित्र / शत्रु · Friends / Enemies** (from `maitriNames`, absent for the nodes), **वार · Day** (from `GRAHA_UPAY`). `focusGraha` opens that graha expanded; others stay collapsed. Reuses the deity index→detail pattern; nothing persists, no chart needed.

**Content.** `grahaReference.ts` — an authored `{natureHi/En, signifiesHi/En}` per graha (generic educational copy; the §14.3.5 bans still hold, scanned by test). Name/meaning/maitri/weekday are reused from the already-reviewed reading tables (`GRAHA_PLAIN`, `maitriNames`, `GRAHA_UPAY`), not re-authored.

**Files.** `mobile/src/panchang/grahaReference.ts`; `mobile/src/screens/GrahaReferenceScreen.tsx`; route in `navigation/types.ts` (`GrahaReference: { focusGraha? }`) + `PanchangStackNavigator.tsx` + `routeGraph.ts`; launcher in `KundaliScreen.tsx`; the Know-this-graha link in `GrahaReadingList.tsx` (wired from `KundaliReportScreen.tsx` `onLearnGraha`). Tests: `grahaReference.test.ts` (completeness + bans), `GrahaReferenceScreen.test.tsx` (lists nine, `focusGraha` expands, tap toggles). Contract: RULEBOOK §14.3.5, §14.7.

---

## 81. Garud Puran — selected stories and explanations

The `garud-puran` Granth row opens `GarudPuranChapters`, with 12 readings grouped into teachings, stories and traditions. Readings are §82 `ListingCard`s under three `ListingSectionHeader` groups and the scope line. Labels say `पाठ`/`Reading` and `पृष्ठ`/`pages`. Each 2:1 painting is cover-cropped into the 4:5 thumb around its subject (`garudPuranThumbFocus` in `assets/garud-puran/index.ts`, e.g. Vishnu at 0.68 of the cover). A reading the user has opened shows a thin progress bar, and every reading resumes its own progress.

`GarudPuranReader` reuses the Gita shell: shared header and page counter, progress bar, language/routine/narration controls, horizontal paging, bookmark/share, jump-to-start and chapter-boundary cards. Its `GarudPuranPage` renders authored prose using the shared meaning token, a short title, the shared `ReadingArtwork` first-page illustration and an expandable source/context note — the citation, the editorial caveat and the Sanskrit references as selectable text, with no external "open source" links (RULEBOOK §11.16). Both index and page identify the collection as selected editorial explanations. Do not display invented shlokas or present the 28 pages as a scripture verse count.

Nine bundled 960×480 WebP paintings follow current-main PR #449: fine warm outlines, detailed storybook scenes, muted pastel fills and no embedded text. Compose a full 2:1 scene with no blank caption band; do not crop a portrait to fill the slot. The opening frame is width 100%, maximum 360×180 pt, rendered with contain. A quiet approved paper texture sits once at screen level, followed by the compact gold leaf divider between artwork and prose. Continuations have no art slot. Page dots sit below, not over, the scroll viewport; the tab bar owns the bottom safe area. Cover art supports readings 1/3/4; giving supports 2; each of the four stories has its own scene; the ancestor still life supports 9/10; Yama and symbolic Vaitarani each have a separate plate. The original generated PNGs remain outside the bundle. Total compressed paintings are about 1.30 MB plus 3,102 bytes of paper texture. Story scenes are deterministic, never randomly rotated.

The source comparison and illustration manifest live in `docs/content/garud-puran/`. `scripts/preview-garud-puran.py` builds `preview.html` from the exact bundled JSON for bilingual reading and artwork review; it is an editorial preview, not a replacement for screenshots of the native app. Technical test and device evidence belongs in `INTEGRATION.md` there. Content contract: RULEBOOK §31.

The approved final set matches the saved Style 3 template and is recorded in `docs/content/garud-puran/design-review/style3-final/manifest.json`. The nine paintings ship from R2 as `reading-backgrounds` entries `garud-puran--<artId>` (sources in `mobile/assets/garud-puran/`, published by `prepare-reading-backgrounds.mjs`); none is bundled, and the paper shows until each one loads. The reader uses `BackgroundLayer(readingParchment)`; the index sits on plain parchment like every §82 listing; saved progress uses Reading / Page and sharing uses the shared prose export.

## 82. Content listing card (`ListingCard`)

**Purpose.** The one card for screens that list the units of a single section — Ramayana comic episodes (§76.1), Garud Puran readings (§81) and kids-story shelves (§76). Until October 2026 each of these grew its own card: three gutters, three thumbnail shapes, three meta formats, a second-language subtitle that doubled card height, no language toggle on the story shelf, and a 13 pt description carrying the 34 pt reading line height. RULEBOOK §3 "Listing cards" makes this component mandatory for such listings.

**Calendar variants.** Vrat reuses this component rather than maintaining a parallel card. Its `catalog` frame tone uses cream `catalogSurface → parchmentSoft`, `catalogBorder`, radius `md` and `elevation.card`; default `reading` tone retains the standard reading contract below. `observance` uses a compact square illustration, optional second-language caption and date/countdown metadata; `upcoming` uses a wide scene and a narrower vertical card. These variants preserve full calendar titles and a separate sibling save target. Standard story/comic/reading geometry, copy limits, progress and title behavior below stay unchanged.

**Screen frame.** `ReaderHeader variant="index"` → `LanguageToggle` row (`spacing.md` below) → list with `spacing.readingGutter` sides and `spacing.md` between cards, on plain `parchment`. The list opens with `ListingScope`: one centred line stating what the list is (count, age or scope disclaimer), `typography.listingScope` (14/22) in `inkSoft`, script body face. Groups use `ListingSectionHeader`: `typography.listingSection` (18/26), `saffronDeep`, bold script face (Cormorant SemiBold in English), `accessibilityRole="header"`.

**Card.**

```
┌──────────────────────────────────────────────┐
│ ┌──────┐  दिन 1                               │
│ │      │  शैलपुत्री: पर्वत की पुत्री            │
│ │ 4:5  │  पार्वती का जन्म और बचपन            › │
│ │ art  │  4 पृष्ठ                              │
│ └──────┘  ▬▬▬▬▬▬▬▬ (progress, where tracked)   │
└──────────────────────────────────────────────┘
```

- Shell: `cardActiveFrom → cardActiveTo` gradient, 1 px `cardActiveBorder`, radius `lg`, padding 14, gap 14, `elevation.lifted`; pressed opacity 0.86.
- Thumb: 92 wide, `alignSelf: stretch`, minimum height 115 (4:5), radius `sm`, `parchmentSoft` while loading. The art fills it cover-cropped: `KidsStoryArt fill` (top-anchored so the reviewed blank band never shows), `ComicArt fill` (only the panel's own frame), `ListingThumbImage` (a bundled image or an R2 background with a `focusX` focal point; R2 art is cropped from its manifest width/height before it downloads, showing the paper fallback until then). Each unit shows its own key scene for its topic.
- Eyebrow (optional): the sequence only — `प्रसंग N`, `पाठ N`, `दिन N`. `listingEyebrow` 13/20 bold script face (1.54× — the earlier 13/18 sat below the 1.45× Indic floor and sliced the top of ि in `दिन N`) in `saffronDeep`; English uses the uppercase Inter `sectionLabel` pill style (`EPISODE 1`).
- Title: the reading language only, `numberOfLines={2}`, `ink`. `listingTitle` 17/25 bold script face; English `listingTitleLatin` 16/22 Cormorant italic.
- Description (optional): one line, `inkSoft`, `listingBody` 12/18 (English `listingBodyLatin` 13/18), script body face. Copy is at most 32 characters per language and is written to fit a 360 dp phone's ~148 pt column; it is never left to truncation.
- Meta: the unit count only (`4 पृष्ठ` / `4 pages`), `inkMuted`, body size.
- Progress (optional): 3 pt track in `saffronTint` with a `saffron` fill, only where the section tracks reading progress (Garud Puran today); exposed as `accessibilityValue`.
- Chevron `›` 26 `saffron`.
- Accessibility: `button`, label `"<eyebrow>. <title>. <meta>. Tap to open."` by default (Maestro selects on this shape); a caller may pass its own (the Durga shelf keeps the form name).

Files: `mobile/src/components/ListingCard.tsx` (card, `ListingSectionHeader`, `ListingScope`, `ListingThumbImage`), `mobile/src/utils/coverRect.ts`, `mobile/src/data/comicBooks/episodeCovers.ts`, `garudPuranThumbFocus` in `mobile/assets/garud-puran/index.ts`. Tests: `components/__tests__/ListingCard.test.tsx` (including the guard that every listing screen renders this card), `utils/__tests__/coverRect.test.ts`, `components/__tests__/ComicArt.test.tsx`, `screens/__tests__/{KidsStoryCatalogScreen,ComicReaderScreen,GarudPuranChaptersScreen}.test.tsx`, `data/__tests__/kidsStories.test.ts`.

## 83. "A fresh update is ready" prompt (`UpdateReadyModal`)

**Purpose.** expo-updates downloads a new OTA bundle in the background and, by default, applies it only on the *next* cold start — so users see new content only after they happen to relaunch. This modal closes that gap: when `Updates.useUpdates().isUpdatePending` flips true (a background download has finished and is staged), it offers a one-tap apply without blocking startup. Mounted once, app-wide, in `App.tsx`.

**Structure.** Centred parchment card over `colors.modalBackdrop` (same frame as `RatingPromptSheet`), `radii.lg`, `spacing.xxl` padding, `maxWidth` 360. Title `नया अपडेट तैयार है` (readerTitle face / script-serif in gu·kn). Body: new content has downloaded; apply now or it applies automatically next launch. **A single CTA** — `अभी अपडेट करें` / "Update now", `saffron` fill — calls `Updates.reloadAsync()` to apply the staged bundle immediately (busy-latched, dims to 0.6 while reloading).

**Dismissal (Oct 2026).** There is **no "Later" button** — the single action keeps the choice unambiguous (RULEBOOK §0.1 / "a line earns its place", §16 above). The user who isn't ready dismisses by tapping outside the card (the backdrop is a `Pressable`, `accessibilityLabel` "Dismiss"; the card absorbs its own taps) or the Android back button (`onRequestClose`). Dismissal is session-only (`useState`, non-destructive) and per-pending-update — the latch resets when a *newer* update is staged — and the staged bundle still applies on the next natural relaunch.

**Guards.** Never shown when `Updates.isEnabled` is false (dev clients / Expo Go, where `reloadAsync()` throws).

Files: `mobile/src/components/UpdateReadyModal.tsx`, mounted in `mobile/App.tsx`. Tests: `components/__tests__/UpdateReadyModal.test.tsx` (pending-visibility, dev-client guard, Update-now reloads, no-Later guard, backdrop dismiss).

## 84. Read coverage — what has been read, per Granth

**Purpose.** The saved position (§40) is one cursor per subsection, and Start Over moves it back to verse 1 — so on its own it cannot say whether a chapter was ever read, or how much of a Granth is done. Read coverage records **which** verse-pages were read, independently of the position: it only grows as verses are read, and shrinks only on an explicit reset or when a full reading completes.

**The read rule.** A verse-page counts as read once it has stayed on screen for **3 s** (`READ_DWELL_MS`, `useReadDwell`). The mark is recorded when the page is left — paging on, leaving the reader, or the app going to the background — so fast swiping through a chapter marks nothing and no timer outlives a reader; background time never counts (returning restarts the clock). Every reader calls `useReadDwell(sourceId, chapter, currentIndex)` beside its `setProgress` effect (RULEBOOK §3 *Read coverage*); transition-card indices are ignored.

**What's persisted.** `@vedansh/read-coverage`: `{ v: 1, read, paath, paathAt }` — `read` maps `<sourceId>::<chapter>` (chapter 1 for single texts) to sorted inclusive verse-index ranges; `paath` counts completed full readings per text; `paathAt` is the last completion time. When every page of a text has been read, its `paath` goes up by one and its read marks clear for the next reading. Page counts come from the chapter manifests, and for single texts from the reader's own page count (the verse pool), so completion follows the pages the reader actually swipes.

**First launch with coverage.** The store seeds once from the saved positions: everything up to and including each subsection's saved verse counts as read (a position on the first page seeds nothing); a text seeded complete is banked as one पाठ. History from before this release cannot be recovered beyond that.

**Surfaces.** Library cards (§8 *Read coverage row*), chapter cards and the chapters summary (§15), the resume sheet (§40). The Garud Puran and Gita Saar index screens use their own cards (`ListingCard`, the theme cards) and do not show per-reading coverage yet; their library card and resume sheet do. Nothing on the first frame reads coverage: the store is a module store (`useSyncExternalStore`) that hydrates the first time a reader, card or sheet asks — no App-level provider, so the launch graph is unchanged.

**Reset.** Long-press a library card (whole text) or a chapter card (that chapter), or tap `प्रगति रीसेट` on the chapters summary (whole text). `ProgressResetDialog`: centred `parchmentSoft` card over `modalBackdrop`, `cardActiveBorder` 1 px, `radii.lg`, max 420 — `प्रगति रीसेट करें?` (19, title face) over the target name (14 `ink-muted`), a `divider` rule, then the body stating exactly what clears and what stays (`N पठित चिह्न मिट जाएँगे। पूर्ण पाठ की गिनती और अंतिम पठित स्थान वैसे ही रहेंगे।`, 15/24 `ink-soft`), a solid `avoidDeep` `रीसेट करें` button (`onPrimary` text) and a 44 pt `रहने दें` text button. A reset clears read marks only — never the पाठ count, never the saved position (Start Over already moves that), so routine completion (§31) is untouched. After confirming, the cleared row shows `ResetUndoPill` (`प्रगति रीसेट हुई` + outlined `पूर्ववत करें`) for 6 s (`RESET_UNDO_MS`); undo merges the cleared ranges back. All copy in this section is authored in hi/en/gu/kn via `pick`, except the resume-sheet lines, which follow that sheet's bilingual house style.

**Files:** `mobile/src/data/readCoverage.ts` (pure rules), `mobile/src/utils/readCoverageStore.ts` (store + `useReadCoverage`), `mobile/src/screens/_useReadDwell.ts`, `mobile/src/components/{ReadProgressBar,LibraryCardProgress,GranthProgressScope,ProgressResetDialog,ResetUndoPill,useProgressReset,useResumeSheetCoverage}.tsx|ts`. Tests: `data/__tests__/readCoverage.test.ts` (tsx), `utils/__tests__/readCoverageStore.test.tsx`, `components/__tests__/readCoverageUi.test.tsx`, `screens/__tests__/readerReadDwell.test.ts` (every reader wires the dwell hook).


## 82. Suvichar — personalized devotional wishes

Option 2 is the card composition: a complete deity painting above a separately rendered message, optional sender and Vedansh footer. Daily Bhakti keeps its scripture behavior and gains a door to the Home-stack composer: `SuvicharEntryCard` (testID `open-suvichar`), a full-width row card above the controls row — `cardActiveFrom` fill, 1 px `cardActiveBorder`, `radii.md`, 72 dp minimum height, soft saffron lift. Left, a decorative 46×60 miniature card tilted −4° (ॐ on `cardThumbActiveTo`, two gold text rules and a saffron name rule) shows the outcome before the tap; centre, title “आज का सुविचार भेजें / Send today's wish” (title face, `readerTitle` size) over “अपने नाम के साथ, परिवार और मित्रों को” (meaning face, `listingEyebrow`, `inkMuted`); right, a 36 dp `saffronDeep` disc with the `next` caret. On a day with a weekday card (see *Suvichar weekday cards* below) the title becomes “शुभ मंगलवार भेजें / Send Shubh Mangalwar” and the detail “श्रीहनुमान का आज का कार्ड, आपके नाम के साथ / Today's Shri Hanuman card, with your name”, and the miniature shows the day's default deity in मंदिर झरोखा (`open-suvichar-art`, cover-fit) when that master is already in the shared cache. Text wraps at large font scales; no network art is fetched for the miniature: the lookup is cache-only (`peekBackgroundAsset`), and a miss keeps the ॐ drawing. Fourteen subjects each have three approved directions: मंदिर झरोखा, पुष्प आँगन and भक्ति पत्र. Ram Darbar, Salasar Balaji, Khatu Shyam ji and Tirupati Balaji each require their own recognisable iconography; no generic fallback.

Users choose deity, frame and an optional ready-made morning/festival wish, enter up to 48 UTF-16 units of sender name and 280 units of message, preview and share. An empty name removes its whole line; names are preserved verbatim in their own script and are never baked into art. Changing a deity, frame or wish preserves the sender. Preferences and up to 50 complete favorites persist across visits. Explicit festival choices do not claim a calendar match or infer lunar dates. The separate 1,000-message editorial directory remains draft content outside the shipped content graph.

The fixed export typography lives in theme/suvichar.ts and scales with card width: message 21/34.65 at 360 dp, weekday title 26, sender 15, metadata 12, footer 13; actual painting geometry must be reviewed against every source. The card draws each master as three slices: the painting (`suvicharHeroFraction`) and the painted footer strip (`suvicharFooterBand`, measured per frame on all 14 masters) keep the master's own proportions; only the paper between them stretches with the message. The footer strip holds one line, vedansh.app/get (footer 13, `inkSoft`), centred between the footer rule and the bottom border. Below the message a gold breaker (36 dp rule · 3.5 dp diamond · 36 dp rule) replaces any attribution line; user-authored messages add the wishes label “आपकी शुभकामना” under it. The panel ends with the optional sender and a `saffronDeep` download line “ऐसे और संदेशों के लिए वेदांश ऐप डाउनलोड करें” (download 10), inset a further 14% each side so it wraps clear of the corner ornaments. One brand mark on every frame: the app-icon lockup — the approved yantra icon (`assets/branding/brand-mark.png`, exported by `scripts/export-app-icons.mjs`) at 15 dp beside वेदांश (badge 12 on the card's 1.65 leading — a shorter line box clips the matras on iOS — with negative vertical margins holding the text row at 16 dp, `saffronDeep`, nudged down 0.22 em so the descender-less Devanagari centres on the icon) in a `parchmentSoft` pill with a 1 px gold border — centred in each frame's painted top space (`suvicharBrandSlot`: the मंदिर झरोखा cartouche, the पुष्प आँगन paper band, the भक्ति पत्र margin, whose rule it covers). Every slot leaves space above the pill and ends above the painting and the crowns at its top centre. The brand mark joins the decode gate, so a share never captures it blank. No text crosses a painted rule. Grow the lower paper panel with native text height rather than shrinking or truncating text. Preview and capture use the same native component. All chrome supports hi/en/gu/kn; authored content follows contentByLang. User-authored messages carry a wishes label, never a scripture attribution. Use ReaderHeader, theme colors, script faces and 48 dp touch targets.

Share only after both artwork sections decode and the measured root matches its complete body. Replacements invalidate readiness; stale image callbacks cannot unlock the new selection. Share through the §39.10 provider like the Daily Bhakti card: it mounts its own 540 dp `SuvicharCard` (`awaitsArt`, `branded` — the card already prints its badge and link), waits for that copy's art, and offers WhatsApp, Instagram post/story and Send as text (title, message, sender); the PNG is 1080 px wide at full native height. WhatsApp gets a one-line caption, `buildSuvicharShareMessage(lang)` in `data/shareLinks.ts` (“आप भी ऐसे सुविचार भेजें — Vedansh ऐप: https://vedansh.app/get”, hi/en/gu/kn), so the recipient gets a tappable download link beside the image; the vedansh.app/get printed in the footer strip is not tappable. The caption omits the Instagram line to stay short. On Android the provider sends it with `react-native-share`; only a binary without that module falls back to expo-sharing (image only). The target sheet lets the user choose WhatsApp or another destination; the app never sends to a recipient automatically.

New artwork lives under the separate R2 prefix `suvichar` and the shared persistent cache. Sources/provenance may be committed for review, but no master may be bundled. `scripts/prepare-suvichar.mjs --publish` uploads all 42, verifies public bytes against source hashes and only then activates the runtime manifest. The initial empty manifest intentionally blocks sharing until publication; this is a draft-PR merge blocker. Installed iOS/Android and WhatsApp image inspection, four scripts, Standard/Large and long names/messages remain required before merge.

The reviewed source bounds are 60% for straight frames, 64% for floral frames and 62% for Tirupati’s temple frame; use suvicharHeroFraction rather than a universal crop. The runtime now contains 621 reviewed short editorial meanings and story lessons (600 catalogue entries and 21 app proposals), linked to 364 source locations. `suvicharContent.ts` groups them by devotional family; `suvicharTemplatesFor(suvicharDay(date))` chooses the local day's entry within the selected deity's pool. “दूसरा सुविचार” cycles that complete pool; “सभी सुविचार देखें / Browse all thoughts” opens a searchable, virtualized list with each message's reference. The source is credited on the card (`suvichar-card-source`) but is never a tappable external link — the composer carries no source-link row (RULEBOOK §11.16). Stable review IDs distinguish variants sharing an English sense and persist with favorites. An unedited shipped thought is dropped on the next visit so the preview opens on today's card; custom messages and saved favorites remain available. Switching deity resets an unedited catalogue message to that deity's daily thought.

References and the editorial type (भावार्थ, prayer meaning, hymn meaning or story lesson) appear above the message in native metadata typography, alongside the weekday title when present. The 21 pt message face remains unchanged; the lower panel grows. The reference is a plain credit, not a tappable link (RULEBOOK §11.16). Editing the wording removes attribution unless the result matches another known entry in the selected deity's pool. Preview, image capture and Send as text retain the reference. Hindi matches the approved review verbatim; English is a source-level editorial adaptation, with Gujarati/Kannada using the existing Hindi re-scripting policy. These entries are not presented as verbatim scripture quotations. The source register retains its edition and verification caveats.

Annapurna is a painted deity like the others (since 29 Oct): three reviewed masters, one per frame, show her ladling anna into Shiva-as-bhikshu's bowl, matching the Daan plate. Her 51 reviewed entries use the same card, frame thumbnails and capture gate as every image-based deity; there is no text-only path. Friday includes Annapurna. Existing image-based deities still require all verified masters and decoded image sections before capture. Saraswati's temple frame uses a 20 pt message-panel top inset to clear its painted border. Native iOS/Android, four-script, Large and WhatsApp export acceptance for this integration remains pending.

### Suvichar ready-made collection — 23 October 2026

The section opens on **तैयार कार्ड / Ready-made cards**, beside **अपना बनाएँ / Create your own**. Ready-made mode offers devotional messages (14 deity compositions) and greetings (seven wishes) in a horizontal virtualized painted-card rail. A tap applies the complete deity/frame/message composition while retaining the optional sender; the full native preview below is the image that is shared. All three frame choices remain available, yielding 63 template/frame combinations over the existing 42 masters, with no new artwork files. Custom mode exposes the existing deity, wish and message editors; switching modes never clears the card. Both modes use the same favorites, persistence, cache and decode/layout capture guard. Thumbnails contain a short text excerpt; the selected native card always retains the complete message. The seven greeting choices remain original wishes. The reviewed scripture-linked collection above supersedes the initial 21-reflection pool; its meanings are not verbatim scripture quotations.


### Suvichar composer layout — control tiers and sticky share (23 October 2026)

Purpose: every control used to be the same bordered 48 dp rectangle, so the mode switch, filters, frames and the Share action were indistinguishable and Share sat below the fold. The screen now has explicit tiers (`SuvicharScreen`):

1. **Mode** — a full-width two-segment pill (§33.1 pattern: `parchmentSoft` track, `divider` border, `radii.pill`, selected `saffronTint` + `saffronDeep`, 15 pt, 44 dp): तैयार कार्ड / अपना बनाएँ (`suvichar-mode-*`).
2. **Choose** — eyebrow labels (13 pt, `inkMuted`). Ready mode: “कार्ड चुनें” on its own line, then a left-aligned underline tab row आज · <weekday> (weekdays with a card only, `suvichar-presets-vaar`) / भक्ति संदेश / शुभकामनाएँ; the tab row never wraps — it scrolls horizontally when it outgrows the width (long weekday, kn/gu, large text) (15 pt, selected `saffronDeep` + 2 dp `saffron` underline, `suvichar-presets-*`) over the painted preset rail. Custom mode: “देवता चुनें” over the same rail in `compact` form (one painted tile per deity, no excerpt, `suvichar-deity-<id>`). Tiles take a 2 dp border, `saffron` when selected.
3. **Frame** — three painted miniatures of the current deity in each frame (`SuvicharFramePicker`, 52×65 art from the shared R2 cache, label 12 pt, 2 dp `saffron` ring when selected, `suvichar-frame-<id>`).
4. **Preview** — the native `SuvicharCard`; “चित्र फिर लाएँ” is a quiet text action under it.
5. **Message** — in both modes: eyebrow “संदेश” with a “↻ दूसरा सुविचार” text action (`suvichar-next`), a multiline field (`cardActiveFrom` fill, `cardActiveBorder`) holding the selected card's message, and a hint with the 280 counter. Editing a ready-made message makes it a user wish (wishes label on the card).
6. **Sender, asked once** — while no name is saved, a labelled field with “एक बार लिखें, आगे याद रहेगा”; once saved it collapses to a dashed `सप्रेम — name ✎` row (`suvichar-name-row`) that reopens the field. Below it, the optional sender-photo row (see *Suvichar sender photo*). Favorites (`suvichar-saved-*`) are pill chips at the end; the header's bookmark scrolls to them when any exist.
7. **Sticky action bar** — pinned under the scroll, `parchmentSoft` with a hairline top border: a 52 dp heart toggle (`suvichar-favorite`, filled when saved) and a full-width 52 dp `saffronDeep` primary button with the share icon and “साझा करें” (`suvichar-share`; 55% opacity until the card is capture-ready, spinner while busy).

The custom-mode wish chips were removed; wishes live in the ready-made शुभकामनाएँ tab.

### Suvichar weekday cards (आज) — 24 October 2026

Purpose: a ready card for each day of the week, “शुभ रविवार” to “शुभ शनिवार”, with that day's deity, sent the way families send a morning greeting.

**Rule: the day lives only in the title, never in the message.** The card's muted “आज का सुविचार” label is replaced by the weekday title (`suvichar-card-title`): title face, 26 at the 360 dp base (`suvicharCardType.title`), 1.65 leading, `saffronDeep`, centred. No jaikara or ornament. Everything below it is the existing card. The message is the deity's thought for the day from the shipped day-free thoughts (`suvicharTemplatesFor`, the same rotation the deity cards use), so consecutive days differ; “↻ दूसरा सुविचार” changes the message and keeps the title. A reader-written message under the title gets the usual wishes label.

**Days and deities** (`data/suvicharVaar.ts`; the first is the default, the rest follow in the rail). Every catalog deity belongs to at least one day, and forms follow their deity: Sunday विष्णु, तिरुपति बालाजी (Surya-Narayan, until Surya masters exist; Surya then goes first); Monday शिव; Tuesday and Saturday श्रीहनुमान, सालासर बालाजी; Wednesday श्रीगणेश, सरस्वती, श्रीकृष्ण, राधा–कृष्ण, सांवरिया सेठ, खाटू श्याम जी; Thursday विष्णु, तिरुपति बालाजी, जगन्नाथ, श्रीराम, राम दरबार; Friday लक्ष्मी, दुर्गा. Friday differs from Routine's `VAAR_DEITY` (Durga) on purpose: it follows the editorial drafts and common practice. A deity appears only when all three of its masters are in the runtime manifest. No unrelated deity ever stands in for a day; a day whose deities are all unpublished shows no आज tab. Latin titles follow the weekday hashtag spellings (Shubh Mangalwar, Shubh Shukrawar); gu/kn transliterate the Hindi.

**Composer:** on a weekday the ready-made tab row opens on आज · <weekday>, and the rail shows each of the day's deities in all three frames (`vaar-<deity>-<frame>`). Opening the composer applies today's card (`withTodaysVaar`): the saved frame, sender and favorites are kept, and the saved deity too when it is one of today's; a message the reader wrote is never replaced. Picking any other ready-made card drops the title; picking a weekday tile restores it. In custom mode, changing deity, frame or message keeps the title. The title always names the current civil day: the screen follows `useTodayKey` (midnight and app return), and a favorite saved from a weekday card stores `vaar: true` rather than a title, so it never names a past day. A title change resets capture readiness like any other text change.

Files: `mobile/src/data/suvicharVaar.ts` (`suvicharVaarTemplates`), `data/suvicharTemplates.ts` (`'vaar'` kind), `components/SuvicharCard.tsx` (`title`), `components/SuvicharEntryCard.tsx`, `screens/SuvicharScreen.tsx`, `utils/backgroundAssetCache.ts` (`peekBackgroundAsset`), `theme/suvichar.ts`. E2E: `.maestro/suvichar-vaar.yaml`.

### Suvichar sender photo — 25 October 2026

Purpose: families send morning cards with their own face on them; the sender can add one round photo beside their name without replacing the deity painting.

**Card:** the photo sits centred in the paper panel directly above “सप्रेम — name” (below the breaker and any wishes label): `suvicharCardType.photo` 56 at the 360 dp base, fully round, 1.5 dp `gold` ring, 4 dp above / 2 dp below (all scaled with card width), `suvichar-card-photo`. With no name it stands alone; with no photo the card is unchanged. The photo joins the decode gate like the brand mark, so a share never captures an empty circle; a photo that fails to decode is cleared from preferences and the row returns to “add”.

**Composer:** the section is opt-in. Under the sender row sits a 48 dp row: eyebrow “कार्ड पर अपनी फ़ोटो भी लगाएँ” with a `Switch` (`suvichar-photo-toggle`, `saffron` track on, `divider` off, the Routine reminder switch styling), off by default and persisted as `photoOn`. Off: no photo row, and the card never shows a photo, even one already saved (the file is kept, so turning it back on restores it). On: a dashed row in the same style as `suvichar-name-row` (`suvichar-photo`, 56 dp min): a 40 dp round thumbnail (or the `photo` icon, 28 dp `saffronDeep`) beside “अपनी फ़ोटो जोड़ें (वैकल्पिक)” / “फ़ोटो बदलें” over the hint “नाम के ऊपर गोल फ़ोटो; चेहरा अपने-आप बीच में आता है” (no storage or privacy claims in the copy; the user-facing-copy test bans them); a 44 dp ✕ (`suvichar-photo-remove`) removes it. Tapping opens the system photo picker (no camera capture, no manual crop step).

**Face auto-fit:** the chosen photo is fitted to its faces automatically. The local Expo module `SuvicharFace` (`mobile/modules/suvichar-face`) finds face boxes on-device: Apple Vision (`VNDetectFaceRectanglesRequest`) on iOS, the platform `android.media.FaceDetector` (eye midpoint × eye distance → box) on Android. Both read an orientation-corrected ≤1024 px copy; there are no extra libraries, Play Services or model downloads. `suvicharPhotoFit` turns the boxes into the square the circle shows: one face → 1.9× the face, a group/family → 1.35× the box around every face, centre nudged 6% down for the chin; no face (or detector missing/failing) → a centred square, raised to 40% height on portrait photos; never tighter than a fifth of the short side; always inside the image. The fit is stored with the photo (`photoFit`, fractions of the displayed image) and applied when drawing (`SuvicharSenderPhoto`: the full image positioned inside the clipped circle), so no cropped copy is written. The card, the composer thumbnail and the shared PNG use the same fit.

**Storage and privacy:** the cropped image is copied to `documents/suvichar/sender-<timestamp>.<ext>`; preferences keep only that file name (`photo`, validated by `isSenderPhotoName`), its face fit (`photoFit`, `isPhotoFit`) and the opt-in `photoOn` and resolve the URI at render time, because the iOS container path changes across updates. Like the name, the photo belongs to the sender: favorites do not store it, and changing or removing it deletes the old file. It is never uploaded; it leaves the phone only inside a card the user shares.

**Release gate:** `expo-image-picker` is a native module, so the row appears only on a binary that contains it (`requireOptionalNativeModule('ExponentImagePicker')`, lazily required like `multiShare.ts`); an OTA to an older binary shows no photo control. The plugin is configured with `cameraPermission: false` and `microphonePermission: false`; iOS keeps one `NSPhotoLibraryUsageDescription` covering cards and the sender photo.

Files: `mobile/src/utils/suvicharPhoto.ts`, `data/suvichar.ts` (`photo`, `isSenderPhotoName`, `suvicharPhotoFit`), `components/SuvicharSenderPhoto.tsx`, `components/SuvicharCard.tsx` (`photo`, `photoFit`), `mobile/modules/suvichar-face/` (iOS Vision / Android FaceDetector), `screens/SuvicharScreen.tsx`, `components/AppIcon.tsx` (`photo`), `theme/suvichar.ts`, `app.json`.
## 85. Auto-slide (स्वतः) — hands-free page turning

**Purpose.** Every paged surface — the verse readers, Vrat Katha, Garud Puran, Gita Saar, पितृ पक्ष परिचय, Kids Stories, the Ramayan comic and Puja Vidhi conduct — can turn its own pages, so a reading can be followed without swiping. It is a reading aid, not playback: it never speaks (that is read-aloud, §56) and never starts on its own.

**Pacing.** A page holds for its reading time, not a fixed interval: `autoSlideDurationMs(chars, speed)` = clamp(3 s + 55 ms × characters, 6 s, 120 s) × pace factor (slow 1.6, normal 1, fast 0.6). Readers count what the page shows in the reading language — verse lines, meaning and commentary (the same text `buildVerseScript` would speak with everything on); prose pages count their paragraphs; Kids Stories count title, narration and dialogue (plus takeaway and source on the last page); comic pages count every panel's words plus a 40-character allowance per panel for the art. Vidhi steps are paced by their text, not by how long the ritual action takes — the user pauses for a longer step.

**Long pages scroll first, then turn.** A page taller than the screen is read top to bottom before it turns: the visible part holds for its share of the page's time (by height), then the page scrolls down 70% of a screen (keeping 30% on screen for context) and holds for the newly revealed share (never under 1.5 s), until the bottom is on screen — only then does the pager move right. Touching the page pauses the slideshow (countdown hidden); 2 s after letting go (or one step's reading time, if longer) it carries on from wherever the user left the page. A page that fits holds for its whole time. Pages without a vertical scroll view (Krishna Stotram, Ramcharitmanas) just hold.

**Behaviour.** Tap ▶ to start from the current page (on the final page it starts over from the first). A manual swipe restarts the countdown on the page swiped to. On the last page of a chapter it moves onto the next-chapter card and, after the reader's `navigation.replace`, the new chapter keeps playing (an in-memory hand-off in `autoSlideStore`, valid 3 s); on the last chapter, a single text, or the Vidhi completion page it stops. Starting read-aloud stops auto-slide and vice versa. While it plays the screen stays awake (`expo-keep-awake`, per-instance tag); backgrounding the app stops it. It is hidden under a screen reader (moving focus would be a defect) and on a single-page text.

**Control.** `AutoSlideButton`, radius 999, 1 px `cardActiveBorder`, 13 pt title face (italic in English), `saffronDeep` tint. Idle: `parchmentSoft` pill, ▶ (`AppIcon play`, 14, fill) + `स्वतः · Auto · સ્વતઃ · ಸ್ವಯಂ`. Playing: `saffronTint` pill split by a hairline into ❚❚ (pause) and a three-bar pace meter (3 pt bars, 5/8/11 pt tall, unlit bars at 30% opacity) that cycles slow → normal → fast on tap and persists (`@vedansh/auto-slide`); a 2 pt `saffronDeep` countdown hairline runs along the pill's bottom to the next scroll or page turn (hidden while the page is held; omitted under reduced motion). Accessibility labels stay English for Maestro: `Start slideshow` / `Pause slideshow` / `Slideshow speed: <pace>`.

**Placement.** Verse readers: floating bottom-left of the pager (`left 16, bottom 16`, `elevation.lifted`), mirroring `JumpToStartButton` bottom-right and clear of the centred dots. Vrat Katha and पितृ पक्ष परिचय (prose fills the pager), Kids Stories (caption at the pager bottom) and the comic: inline (`floating={false}`) at the toggle row's left edge, opposite read-aloud/share. Vidhi conduct: inline beside the read-aloud pill on the phase row, step pages only.

**Files:** `mobile/src/screens/_useAutoSlide.ts` (`useAutoSlide`, `useReaderPlayback`, scroll-then-turn driver), `mobile/src/utils/autoSlideStore.ts` (pace, pacing rule, chapter hand-off), `mobile/src/components/AutoSlideButton.tsx`, `mobile/src/components/AutoSlideScrollView.tsx` (page scroll view + the pager's `CellRendererComponent` that tells it its index). RULEBOOK §3 *auto-slide*.

The Vrat landing, all category lists, My Vrat, Katha and observance details share `CatalogBackground`: a 12 KB bundled ivory parchment with faint golden edge ornaments, derived from the supplied prototypes. The artwork is UI paper (`assets/ui`), not a reading master. List filters use the same maroon `catalogAccent` active state as the landing mode selector. Detail uses the canonical `ReaderHeader`, retaining its share action.

### Mahakaal artwork — 27 October 2026

The reviewed Mahakaleshwar shrine painting is a separate subject, `mahakaal`; the existing seated Shiva masters remain. After publication, Daily Bhakti uses it for Lingashtakam and Om Namah Shivaya, through `devotionalSourceArt`. The full-card master reuses Shiva’s measured frame coordinates. Suvichar’s source catalog (`suvicharDeityCatalog`) contains seventeen subjects and 51 distinct masters; its public chooser (`suvicharDeities`) includes a subject only when every frame exists in the verified runtime manifest. Mahakaal appears as श्री महाकाल / Shri Mahakaal, with all three frames, a ready-made daily reflection and Monday cards beside Shiva. Until publication, those options stay hidden and the two Daily Bhakti sources retain their Shiva painting. Native branding, sender and message remain separate text layers. `scripts/prepare-mahakaal.mjs --publish` uploads just the four additions and verifies every public byte before activating either manifest; `--activate` verifies already-uploaded objects. Image and provenance review is recorded in `docs/evaluations/mahakaal/`; native/device/export review remains pending.


### Quiet companion first-launch asks — 31 October 2026 (§47 / §38 / §59)

The approved direction is **Quiet companion throughout**. `QuietCompanionSheet.tsx` is the shared compact native bottom sheet: 28pt top corners, parchmentSoft, 24pt gutters, a 36×4 grabber, a rounded 80pt cached painted illustration beside the heading, semantic AppIcon controls, and a deep terracotta (`avoidDeep`) primary. The body scrolls below an 88% height ceiling, keyboard avoidance stays within the one modal, and a safe-area footer keeps the action reachable. Titles/body use script-aware loaded faces and Standard/Large sizing; language options use their native scripts. Art is existing published reader-illustration artwork (scripture / Ganga / diya), never a new unverified URL or bundled painting.

- First use: language + reading size → staged city/search/GPS → reminder invitation → iOS ATT after native modal dismissal → existing feature tour. A persisted `setup → tour → done` phase survives language's upgrade signal. Replaying the tour does not re-run setup.
- City search here is the bundled city catalogue (30 results maximum); the full city/village/PIN picker remains in Settings. A choice and GPS result are committed once, on Continue. The sunrise line is computed from the engine, never a sample date/time.
- Fresh reminder preferences are off. One explained Yes requests the OS grant once and enables both daily verse and festival reminders only on grant. Later persists both off, so a separate Japam permission cannot silently subscribe the user. Existing explicit preferences are retained. The return ladder also respects daily-verse opt-in.
- The reminder body shows a notification facsimile, the actual configured daily times, and the catalogue's real festival count/time. No time form in the yes/no invitation; changes remain in Settings. Hard denial uses only the passive Settings strip. An explicit Settings round-trip enables the reminders when the grant is present.
- Lower-priority automatic surfaces wait for `launchAskStore.selectionComplete`: the host publishes this after choosing a prompt or explicitly passing. Hydrated storage alone does not mean prompt selection is complete. Automatic rating asks also wait for this decision.
- Later launches: one launch ask per local day, with a sticky session latch. Setup/tour/What's New and a pending update consume the opportunity; rating stands down. Notification/widget cold starts suppress setup/tour/What's New and other launch asks. Existing 15-day snoozes are honoured once. Follow-up reminder rests are 2, 2, 3, then 7 calendar days (a regular daily user sees day 3 / 5 / 8, then weekly); a third-decline stop control and Settings toggle-off end launch reminder asks. `lastReminderDay` owns the reminder rest independently of the shared `lastDay`, so widgets and discovery cannot postpone reminder eligibility. A widget offer can use an intervening day; it never appears on the install day.
- Widget pair and Panchang-only recovery share `widgetNudgeStore.ts`, including serialized writes and a process-owned Android pin queue. A launcher that never pauses permits a manual Panchang tap. Dismissal ends the offer; an add-flow stamp does not prove installation. iPhone uses actual widget snapshot previews and manual WidgetKit instructions in the shared Quiet companion shell. Missing snapshot data does not invent a tithi. Widgets remain available from the gallery. If Android pinning is unavailable or fails, `LaunchAskHost` opens `MoreTab` with `moreTabTarget('WidgetGallery')` (`initial: false`), preserving MoreHome beneath the gallery so Back reaches the hub even when More has never mounted.

Implementation: `LaunchAskHost`, `OnboardingSetupSheet`, `QuietReminderBody`, `launchAskStore`, `DailyBhaktiNudge`, `widgetNudgeStore`, `TourContext`, `NotificationPreferencesContext`. Native installed visual review on compact phones, all four scripts at both sizes, iPhone ATT/Modal sequencing and Android launcher behaviour remain required before merge; unit tests do not establish pixel or device acceptance.

## 86. Explore launch sheet — Immersive Story

Approved direction: a 190dp painted scene over a rounded parchment bottom sheet. The
single-language section eyebrow, script-safe headline and short description lead to
one useful preview. The close target is 44dp; the body scrolls independently of a
pinned primary action and Not now. Settings replay also offers Next section. The sheet is capped at 88%
of the available screen. Theme reading-size tokens and the four-language localization
helpers govern copy; content must grow rather than truncate. Reduce Motion removes
the entrance animation. Dragging the handle down, backdrop, Android back and Not now
share one dismissal path. No arrival haptic, looping animation or explored score.

`data/discovery/sections.ts` is the sixteen-section registry and destination source.
Gita Saar uses Krishna teaching Arjuna; Sankalp uses Hanuman doing japa. Suvichar
composes a real Ram Darbar painting with localized greeting and sender text. The
sender changes only the preview until the primary action hands the draft to the
Suvichar composer. Other previews open their real section; they never simulate a
saved ritual, a computed chart, device heading or completed practice.

Artwork is bundled under `assets/explore/`; its separate 1.5MB byte budget, source
master hashes, Library provenance, crops and shipped hashes are pinned by the
manifest and asset tests. These are section hero scenes, not additions to the Home
or More square icon registries. Native visual/device QA is still required before
merge; a passing renderer test is not evidence of native rendering.

### Eligibility and rollout

The ledger collects silently for the first 24 hours, seeds existing routine,
sankalp and Pitru records, and observes owned routes from every navigation source.
This conservative first-release collection window replaces an immediate launch
promotion; historical routes without persisted evidence cannot be reconstructed.
No sheet appears on the fresh install's first session or after another automatic
surface has claimed the launch. Onboarding, reminder consent, What's New, staged
updates and rating take precedence. Notification, widget and URL entries stand down.
Warm foreground returns count only after 30 minutes away; navigation away from Home
cancels the delayed offer. Storage or platform-probe failures suppress suggestions.

At most two shown sheets per phone-local calendar day, six hours apart. A regression
in the phone clock starts a fresh six-hour wait. Declined sections rest fourteen
days; two consecutive declines pause all suggestions for seven days, including when
both declines happen on one day. Visiting a section removes it from the pool. The
highest-priority eligible section wins; an unvisited previous suggestion is skipped
when another eligible section exists. No analytics or festival boosts are added in
this implementation. There is no enable/disable preference in Settings or the sheet. Legacy stored
`enabled: false` is ignored. Settings → Explore sections opens an explicit replay
of all sixteen cards, with Next section, Close and their real destination actions.
Replay bypasses automatic eligibility without changing visit/decline/cadence records
or consuming the shared automatic prompt budget. Closed replay does not mount.
Notification responses are read and cleared once per process by `launchResponse.ts`;
Explore uses the resolved cold-start target rather than rereading historical taps. No native build, release or OTA is
part of this change.

Files: `components/explore/ExploreLaunch.tsx`, `ExploreSheet.tsx`,
`data/discovery/{sections,policy,store,artwork}.ts`. This implements the selected
visual direction from draft PR #575; its earlier prototype disagreements no longer
define the native layout.

**Shared launch coordination (§86).** Explore waits for `launchAskStore.selectionComplete` and atomically claims the same daily opportunity as reminders, widgets, updates and automatic rating. Its own six-hour/two-per-day policy remains a ceiling; the app-wide cap permits at most one automatic prompt per local day. A stopped reminder is not a pending reminder surface. The host decides reminder eligibility from its current cadence, not the legacy 15-day flag.

A background update staged after Explore has claimed its slot does not dismiss the active sheet; the update offer waits for the next shared opportunity. Already-pending updates retain priority before Explore claims.

