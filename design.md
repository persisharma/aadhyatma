# Sanatan — Design System

Reference document for all Sanatan / Aadhyatma modules (Hanuman Chalisa, Ramcharitmanas, Bhagavad Gītā, Sundarkand, and future sacred-text modules).

The source-of-truth visual reference is `design-preview.html` at the repo root. Open it to see live mockups of Home and Reader screens. This document captures the tokens, components, and rules so the same language can be re-applied in React Native.

---

## 1. Philosophy

- **Parchment-first.** The app should feel like an old manuscript, not a glossy modern reader. Warm cream base, sepia ink, saffron/gold accents.
- **Reverent, not decorative.** Ornamentation is minimal: a single `॥` glyph as divider, simple crest on Home. Never clutter the verse.
- **Text is the hero.** Every screen exists to carry Devanagari gracefully. Backgrounds are faded sketches that sit behind a parchment overlay — they must never fight the text.
- **Book-like pacing.** One verse per page, swipe to advance. No endless scroll in the reader.
- **Bilingual but Hindi-led.** Titles and verses in Devanagari; Latin (Cormorant Garamond italic) is a quiet secondary label, never a translation.

---

## 2. Color Tokens

| Token | Hex | Role |
| --- | --- | --- |
| `parchment` | `#F3E7C9` | Primary background for reader surfaces |
| `parchment-soft` | `#F8EFD6` | Lighter parchment for inner cards |
| `parchment-deep` | `#E9D9B1` | Bottom-edge gradient, elevated surfaces |
| `ink` | `#2F1E10` | Primary Devanagari body text |
| `ink-soft` | `#5A3A1E` | Secondary text / meaning body |
| `ink-muted` | `#8A6A47` | Tertiary / metadata / placeholders |
| `saffron` | `#B8621B` | Primary accent, active states, arrows |
| `saffron-deep` | `#8A3E0B` | Strong accent, pager dot, labels |
| `gold` | `#A67C34` | Secondary accent, crest, section tags |
| `divider` | `rgba(138, 62, 11, 0.18)` | Borders, card outlines |

**Home gradient** (top → bottom): `#F6ECD0` → `#F1E3BF`, with a soft radial saffron glow (`rgba(184, 98, 27, 0.14)`) behind the crest.

**Reader overlay** (on top of background image): vertical gradient
`rgba(243,231,201,0.85)` → `rgba(243,231,201,0.55)` → `rgba(243,231,201,0.75)` → `rgba(233,217,177,0.95)`.

**Background image filters:** `opacity: 0.52`, `sepia(0.35) saturate(0.85) brightness(1.02)`.

---

## 3. Typography

Two typefaces, four roles.

| Typeface | Usage |
| --- | --- |
| **Noto Serif Devanagari** | All Devanagari: titles, verses, meaning body, card names. Weights 400/500/600/700. |
| **Cormorant Garamond** | Latin subtitles, page counters, swipe hints, italic labels. Weights 400/500, often italic. |
| **Inter** | Only for tiny UI chrome (uppercase section labels, status bar) where Devanagari is not used. 500/600. |

### Type scale

| Role | Typeface | Size | Weight | Notes |
| --- | --- | --- | --- | --- |
| Screen title (`सनातन`) | Noto Serif Devanagari | 34 | 600 | Letter-spacing `0.01em` |
| Reader top-bar title | Noto Serif Devanagari | 16 | 600 | |
| Verse body | Noto Serif Devanagari | 23 | 500 | Line-height 1.7 |
| Meaning body | Noto Serif Devanagari | 15 | 400 | `ink-soft`, line-height 1.7 |
| Card name (Hindi) | Noto Serif Devanagari | 17 | 600 | |
| Card name (Latin) | Cormorant Garamond | 13 | 400 italic | `ink-muted` |
| Page counter (e.g., `1 / 43`) | Cormorant Garamond | 14 | 400 italic | Lining figures |
| Section label (`LIBRARY`) | Inter | 11 | 600 | `0.22em` tracking, uppercase |
| Verse-type pill (`दोहा`, `चौपाई · 9`) | Inter | 10 | 600 | `0.3em` tracking, uppercase, saffron on tinted bg |
| Meaning label (`अर्थ · Meaning`) | Cormorant Garamond | 13 | 600 italic | `0.14em` tracking, uppercase, `saffron-deep` |
| Sub tagline / swipe hint | Cormorant Garamond | 12–15 | 400 italic | |

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

### Elevation

| Level | Shadow |
| --- | --- |
| `sm` | `0 1px 2px rgba(60, 30, 10, 0.06)` — default card |
| `md` | `0 8px 24px rgba(60, 30, 10, 0.14)` — active card |
| `lg` | `0 30px 60px rgba(60, 30, 10, 0.22)` — phone frame in preview only |

---

## 5. Iconography & Ornaments

- **Crest on Home.** Thin horizontal rule · circular outline with `ॐ` · thin horizontal rule. Lines 40px, circle 28px, saffron stroke at `1.5px`.
- **Verse divider.** `॥` centered between two 1px horizontal rules, 80px wide, saffron at 60% opacity. Use between verse and meaning on every reader page.
- **Back chevron.** `‹` inside a 34px circle with `parchment-soft` fill and `divider` border.
- **Forward chevron.** Single `›` in saffron on active cards.
- **Pager dots.** 6px circles, `rgba(138,62,11,0.25)` resting. Current page dot: saffron-deep, width 18, radius 999 (pill).
- **No emoji. No photos.** Only hand-drawn faded sketches as backgrounds.

---

## 6. Background Image System

Three faded vintage sketches live in `/images/`:

1. `Hanuman_sita.png`
2. `Ram_hanuman.png`
3. `hanuman_lankadahan.png`

### Rotation rule

- Each reader page picks **one** of the three backgrounds.
- Selection is **deterministic per verse id**, not re-rolled on every render. Use a simple hash (e.g., `verse.number % 3`) so a given verse always shows the same image — this keeps the feeling stable as the user swipes back and forth.
- Apply the image as a `cover`-sized background. Then stack the parchment overlay (Section 2) on top. Then the content.

### Adding more modules

When Ramcharitmanas / Gita modules are added, new faded sketches should follow the same treatment: warm parchment tone, ~50% opacity after sepia, subject centered or top-anchored so the bottom third of the image stays clean for the meaning block.

---

## 7. Screen: Home / Index

**Purpose.** Surface the available sacred texts. One scroll, no tabs.

**Structure (top to bottom):**

1. Status bar area (44px safe region).
2. Hero block (28px top padding):
   - Crest (Section 5)
   - Title `सनातन` (34 / Noto Serif Devanagari 600)
   - Subtitle `Sacred Texts · Daily Reading` (Cormorant Garamond italic 15, `ink-muted`)
3. Section label `LIBRARY` (Inter 11, uppercase, `ink-muted`, 0.22em tracking).
4. Library list of **cards**. See Section 8 for card spec. First card (the live module) is the `active` variant; all others are `coming` until shipped.
5. Footer mantra, absolute-positioned 28px from bottom: `॥ श्रीरामचन्द्र चरणौ शरणं प्रपद्ये ॥` — Noto Serif Devanagari 28, 55% opacity.

**Gradient background.** See Section 2.

---

## 8. Component: Library Card

Two variants: `active` (live module) and `coming` (placeholder).

```
[ thumb ]  [ name (Hindi) ]                      [ › or badge ]
           [ name-en (Latin italic, muted) ]
           [ sub meta (counts, subtitle) ]
```

### Active

- Background: linear-gradient `#FFF5E0 → #F5DEAC`
- Border: `rgba(184, 98, 27, 0.4)`
- Shadow: `md`
- Thumb: gradient `#F8D291 → #E0A255` with the text's first Devanagari letter (`ह`, `रा`, `भ`, `सु`) in white, Noto Serif Devanagari 22.
- Right side: saffron `›` chevron.

### Coming

- Background: `rgba(255, 250, 235, 0.72)`
- Border: `divider`
- Shadow: `sm`
- Thumb: flat `#F1E0B3` with `saffron-deep` letter.
- Content (thumb + names) at 55% opacity so it looks dormant but still legible.
- Top-right pill badge: `SOON` (Inter 9, uppercase, 0.18em tracking, `rgba(166,124,52,0.14)` fill).

### Content per card

| Text | Example |
| --- | --- |
| name (Hindi) | `हनुमान चालीसा` |
| name-en | `Hanuman Chalisa` |
| sub | `43 verses · Hindi with meaning` |

Tapping `active` card → push Reader (Section 9) for that module.

---

## 9. Screen: Text Reader

**Purpose.** Show one verse at a time with its meaning, over a rotating background.

**Layer stack (back to front):**

1. Parchment base color.
2. Background image (Section 6), `cover`, sepia-tinted.
3. Parchment gradient overlay (Section 2).
4. Content column.

**Structure (top to bottom):**

1. Status bar.
2. **Top bar** (14/22 padding): back button · title (`हनुमान चालीसा`) · progress counter (`1 / 43`, Cormorant Garamond italic).
3. **Verse area** (flex-1, centered, 28px horizontal padding):
   - Verse-type pill (`दोहा · Opening` / `चौपाई · N` / `समापन दोहा · Closing`).
   - Verse lines (23 / 1.7, Noto Serif Devanagari 500). Each line on its own row; preserve the original line breaks from the JSON.
   - Ornament divider (Section 5).
   - Meaning label (`अर्थ · Meaning`).
   - Meaning body (15 / 1.7, `ink-soft`).
4. **Bottom bar** (16/28 padding): pager dots on the left · swipe hint (`← swipe →`, italic 12, `ink-muted`) on the right.

**Interaction.**

- Horizontal swipe (pager). Left-edge swipe from first page or right-edge from last page should bounce, not dismiss.
- Tap-hold on the verse (future): audio playback hook — leave structural space now, don't ship until audio lands.
- Back button or gesture returns to Home.

**Progress counter.**

- Total = opening dohas + chaupais + closing dohas. For Hanuman Chalisa that's `2 + 40 + 1 = 43`.
- Counter always shows `currentIndex + 1 / total`.

---

## 10. Content Model

The reader consumes a normalized verse list derived from JSON files like `HanumanChalisa/hanuman-chalisa.hi.json`. Every module should flatten into this sequence:

```ts
type Verse = {
  id: string;              // e.g. "opening-doha-1", "chaupai-09", "closing-doha"
  type: 'doha' | 'chaupai';
  label: string;           // e.g. "दोहा 1", "चौपाई 9", "समापन दोहा"
  section: 'opening' | 'body' | 'closing';
  number?: number;         // present for numbered verses
  lines: string[];         // raw Devanagari lines, in order
  meaning: string;         // Hindi prose
};
```

**Order for Hanuman Chalisa:** `opening_dohas[0..]` → `chaupais[0..39]` → `closing_doha`. Same pattern generalizes to Ramcharitmanas and Gita with their own section boundaries.

**Display labels:**

- `doha` + `section === 'opening'` → pill reads `दोहा · Opening` (or `· N` if multiple).
- `chaupai` → pill reads `चौपाई · <number>`.
- `doha` + `section === 'closing'` → pill reads `समापन दोहा · Closing`.

---

## 11. Motion & Haptics

- Page transitions: native horizontal swipe, default spring. No custom easing in v1.
- On page change: a light haptic tap (`Haptics.ImpactFeedbackStyle.Light`) if running on device.
- Avoid crossfades or scale effects in v1 — they fight the manuscript metaphor.

---

## 12. Accessibility

- Minimum tap target: 44×44 for back button, card tap, and pager dots.
- Ensure contrast on text over the parchment overlay. The overlay specified in Section 2 keeps `ink` at > 7:1 on the lightest area of every supplied background.
- Support Dynamic Type: scale verse body from 23 up to ~30 while keeping line-height 1.7. Meaning scales accordingly.
- Devanagari must use the system's user-chosen font-scale, not a fixed point size.
- All accent-only information (saffron pill, saffron chevron) must also carry a text or shape cue — never color alone.

---

## 13. Future Modules (extension notes)

When a new text is added:

1. Add the source JSON under its own folder (e.g., `Ramcharitmanas/ramcharitmanas.hi.json`).
2. Normalize to the `Verse[]` model in Section 10. If the text has kāṇḍas / adhyāyas, add a `chapter` field and split the library card into `Text → Chapter → Verse` while keeping the Reader identical.
3. Add 2–3 faded sketches to `/images/` that match the text's story and follow the treatment in Section 6.
4. Flip the Home card from `coming` to `active`.
5. Keep the pill vocabulary consistent: `दोहा`, `चौपाई`, `श्लोक`, `मंत्र`, etc., always paired with a Latin subtitle.

No other surface should need redesign — the reader is the same, the tokens are the same.

---

## 14. File Map

- `design-preview.html` — live visual reference at repo root. Open in any browser.
- `design.md` — this document.
- `HanumanChalisa/hanuman-chalisa.hi.json` — v0 source for the first module.
- `images/*.png` — parchment sketch backgrounds.
- `mobile/src/theme/colors.ts` — to be updated with tokens from Section 2.
- `mobile/src/theme/ThemeContext.tsx` — single source of runtime tokens.

When building new components, pull tokens from the theme — never hard-code a hex. If a token is missing, add it to `colors.ts` first, update this doc, then use it.
