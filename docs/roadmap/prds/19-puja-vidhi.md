# PRD-19 — पूजा विधि · Guided Step-by-Step Puja Flows

| | |
|---|---|
| **Status** | Draft for review — prototype attached |
| **T-shirt size** | L (content-heavy: new data family + sourcing/verification track + 3 screens; engine work is nil) |
| **Prototype** | [`docs/puja-vidhi-prototype.html`](../../puja-vidhi-prototype.html) — festival-day entry, samagri checklist, conduct mode, aarti hand-off, completion, catalog; every interaction annotated |
| **Feasibility** | ✅ Confirmed against current main — festivals already carry content hooks (`kathaId`, `linkSectionId` in `festivals.ts`); a `vidhiId` follows the identical pattern. Steps reference shipped mantric texts by section id. Read-aloud TTS (#230) and follow-along audio (PRD-13) cover recitation. The only new capability is the content itself. |

> **Design intent (validated in the prototype):** the vidhi is entered from the **day it's needed** (festival day panel on the Panchang tab, vrat catalog detail) — not from a new Home category. Two modes: **तैयारी** (samagri checklist, the day before) and **पूजा** (full-screen conduct mode, one step per page, reader-grade type, keep-awake). Mantras render inline with IAST and a read-aloud affordance; aarti steps hand off to the shipped aarti reader + audio.

---

**Bundle-only:** vidhi definitions are bundled JSON (`mobile/src/data/vidhi/`), same pipeline as every content section (canonical markdown → `scripts/*.mjs` → JSON). Checklist state and completion marks live in AsyncStorage. No network, no account. No audio assets in v1 (recitation reuses shipped TTS/audio), so the size cost is text-only.

## 1. Problem

On festival morning, a young householder knows *that* it's Ganesh Chaturthi (the app tells them), can read the katha (the app ships it), and can sing the aarti (the app plays it) — but the actual **procedure** ("what do I do, in what order, with what in my hand, saying what?") sends them to ad-choked blog posts of wildly varying correctness, mid-puja, with wet hands. The app currently owns every *text* moment of devotional life but not the *performed* moment — which is the highest-stakes, highest-reverence moment of the user's year.

## 2. Goal

Own the performed puja end-to-end offline: samagri gathered the day before, every step guided with its mantra in hand, the aarti sung from the app, the vrat katha read at the right step. Success = vidhi conduct-mode completions on festival days and samagri-checklist opens the day before (per-device local counters).

## 3. How we identify the content (the sourcing method)

This is the PRD's hard part, so it is specified first. Five rules, mapped to the repo's existing content contract (RULEBOOK §11):

### 3.1 Canon: one printed convention, declared per vidhi
Primary canon is the **Gita Press (Gorakhpur) householder corpus** — *Nitya Karma Puja Prakash* for the puja frame (shodashopachara sequence, sankalp form) and the *Vrat-Parichay* / Kalyan annuals for festival-specific vidhis. Rationale: (a) it is the most widely accepted householder standard in the app's North-Indian/purnimant convention — which the festival engine already normalizes to; (b) the repo already treats Gita Press editions as canonical (the Valmiki Ramayana section pins "Gita Press … complete 2-volume scan" with archive.org URLs and a verification status in its committed `source` block — #232); (c) public scans exist for verification. Each vidhi's JSON carries the same `source` block shape: `canonicalEdition`, `canonicalEditionUrls`, `canonicalEditionStatus` (what was checked, when), `referenceUrls`.

### 3.2 What is transcribed vs. what is authored
- **Mantras, sankalp formulae, dhyana shlokas are transcribed, never composed** — RULEBOOK §11.3 (*no AI-generated liturgical text*) applies with full force. Every mantric line is copied from the canon scan, checked character-by-character, and passes the Devanagari well-formedness CI gate (#243).
- **Step instructions are authored fresh** in the app's own Hindi/English prose (the procedural sequence is tradition; a source's editorial prose is not copied). Authored instructions follow §9's explanation discipline: each step says *what* and *why* in one to two lines.

### 3.3 Reuse by reference, never by duplication
Texts the app already ships — aartis, chalisas, Vishnu Sahasranama, Gita adhyayas, kathas — are referenced from steps by `{ sectionId, verseRange? }`, exactly like `linkSectionId` on festival rows. No mantra that exists in the library is ever re-typed into a vidhi (single source of truth; verse-count sync §11.10 stays intact). Only genuinely new liturgical snippets (sankalp template, avahan/asana/pushpa mantras, panchopachara lines) enter as new content, each with its own citation.

### 3.4 Two-source verification per vidhi
Every vidhi is cross-checked against **two independent published references** before merge: the Gita Press canon plus DrikPanchang's published puja-vidhi pages (already the repo's pinned naming convention for muhurat work). Divergences are resolved toward the printed canon and recorded in the `source` block. Internet verification is mandatory (§11.1) and the check is committed as `contentCorrectness`-style pins: every step's mantra ref resolves to a real section/verse, every samagri list is non-empty, every festival `vidhiId` resolves.

### 3.5 Scope ladder and regional honesty
v1 ships **six vidhis**, chosen because their festivals already exist as engine rows with kathas — the content compounds instead of sprawling: **सत्यनारायण पूजा** (purnima, monthly recurrence), **दीपावली लक्ष्मी-गणेश पूजन**, **गणेश चतुर्थी स्थापना**, **नवरात्रि घटस्थापना**, **करवा चौथ**, **महाशिवरात्रि पूजन**. Each declares its convention line ("गीता प्रेस परम्परा अनुसार"); regional variants (Maharashtra Ganeshotsav, Bengali Lakshmi puja…) are explicitly out of v1 and listed as such per vidhi — we state the tradition we follow rather than inventing a homogenized "quick puja" (completeness rule §11.5 applies to the chosen source's vidhi as a whole).

## 4. Where it lands in the app (surfaces)

Validated in the prototype; five surfaces, **no new Home category** (the launcher grid is a closed 5×3 by design — a 16th tile breaks the full-row closure; a `vidhi` content category is deferred until the family earns it, per RULEBOOK §1):

1. **Festival day panel (Panchang tab)** — the primary door. On a festival with a vidhi, the day panel's action rows gain **"पूजा विधि ›"** beside the existing katha row (`vidhiId` on the festival row, same mechanism as `kathaId`).
2. **Vrat catalog detail** — vrats whose observance has a vidhi link it from the detail screen (PRD-09 surface).
3. **Vidhi catalog screen** — the six vidhis browsable in one list (routed in the Panchang stack), each card showing festival linkage and duration hint; reachable from the day panel rows and search.
4. **Search** — each vidhi indexed (§7) so "सत्यनारायण" finds the puja, not just the katha.
5. **Home DISCOVER FeatureCard** — one launch-release card pointing at the catalog (existing mechanism, design.md §32).

## 5. The two modes (UX contract)

### 5.1 तैयारी — samagri checklist (the day before)
A checkable samagri list per vidhi (`{item, qty?, optional?}`), state persisted per upcoming festival date in AsyncStorage, resurfaced via the existing vrat-reminder day-before slot when the user has opted into that festival's reminders. One action: **"सूची साझा करें"** — shares the samagri list as plain text (the family shopping message; no image pipeline needed, nothing personal on it).

### 5.2 पूजा — conduct mode (festival day)
Full-screen, one step per page, paged horizontally like the readers (the interaction the user's hands already know):
- Step header: phase (आरम्भ · मुख्य पूजा · समापन), step n/N, a thin progress track (dots at reader spec).
- Instruction in reader-grade type (Devanagari primary, 10 pt+ floor, reading-size setting respected).
- The step's mantra inline with IAST romanization, with the **read-aloud** affordance (#230 TTS) — or, where the step *is* a shipped text (aarti, katha, sahasranama), a **hand-off card** that deep-links into that reader/audio and returns to the next step.
- **Keep-awake while in conduct mode** (wet hands; no tapping to wake), auto-released on exit.
- Exit resumes: re-entering the same day offers "जहाँ थे वहीं से" (same resume sheet pattern as the readers).
- Completion: a quiet ॐ seal + the festival's katha/aarti links — deliberately *not* the routine celebration animation; a puja ends in shanti, not confetti.
- **Add to routine:** recurring vidhis (Satyanarayan on purnima) offer the existing `AddToRoutineButton` so the practice enters नित्य साधना.

## 6. Data model (new family: `mobile/src/data/vidhi/`)

```
VidhiEntry {
  id, titleHi/En, festivalIds[], deities[],
  conventionLineHi/En,          // "गीता प्रेस परम्परा अनुसार"
  durationHintMin,
  samagri: [{ itemHi/En, qty?, optional? }],
  steps: [{
    id, phase: 'prep'|'main'|'closing',
    titleHi/En, instructionHi/En,
    mantra?: { devanagari, iast },          // transcribed, cited
    ref?: { sectionId, verseRange? },       // shipped-text hand-off
  }],
  source: { canonicalEdition, canonicalEditionUrls, canonicalEditionStatus, referenceUrls }
}
```
Registry questions (RULEBOOK §1), search rows (§7), and the reader-test requirement (§4.10 → a `VidhiScreens.test.tsx`) all apply as for any content family. Festival rows gain the optional `vidhiId`.

## 7. What it does NOT do (non-goals)

- **No audio narration assets in v1** — TTS + shipped aarti audio cover recitation; recorded purohit audio is a Phase-3 size decision.
- **No homam/havan or temple-scale rituals** — householder pujas only.
- **No regional variant switching in v1** — one declared convention per vidhi.
- **No shraddha/tarpan vidhi in v1** — it's the natural seventh vidhi, sequenced with PRD-17 Phase 3 so the two features cross-link.
- **No purohit marketplace, no samagri commerce, ever** — the incumbents' pattern this app exists to oppose.

## 8. Phasing

1. **Phase 1 (content spike):** source + transcribe + verify **one** vidhi end-to-end (Satyanarayan — monthly recurrence makes it testable year-round) with the full `source` discipline; build the three screens against it; Maestro smoke + screens test. This gates everything: if sourcing discipline doesn't hold for one, we stop before six.
2. **Phase 2:** remaining five vidhis (one PR each, §10 hygiene); festival `vidhiId` hooks; vrat-catalog links; search rows; DISCOVER card.
3. **Phase 3 (options):** shraddha vidhi (with PRD-17); recorded audio; regional variants as explicit alternates.

## 9. Why it fits the moat

Every step of a puja is a moment the incumbents monetize (samagri commerce, pandit booking, ad interstitials mid-vidhi). Vedansh performing it clean, offline, cited, and free is the whole brand in one feature — and the content compounds annually: a verified vidhi is shelf-stable for decades, the rare content investment with zero decay.

## 10. Design compliance (design.md is authoritative)

- **Colour/type/layout** — reader rules apply wholesale (§9): parchment system, Noto Serif Devanagari, per-verse type scale, 10 pt floor, card radius 18/padding 18. Conduct mode is a reader variant, not a new visual language.
- **Components** — `ReaderHeader variant="reader"` in conduct mode, `variant="index"` on catalog/checklist; `AddToRoutineButton`; the readers' progress dots and resume sheet; **no hand-rolled duplicates** (RULEBOOK §3).
- **Iconography** — `॥`/`ॐ`/दीया glyph territory, no emoji (§5).
- **Motion/haptics** — page turns per reader spec (§11); completion is a static seal, no celebration animation.
- **A11y** — steps are fully screen-reader traversable; keep-awake announced; mantra + IAST both exposed as text (§12).
- **Bilingual, Hindi-led** — Devanagari primary; the hi/en/gu/kn language system applies to instructions (mantras stay Devanagari + IAST per §3.1 romanization rules).
