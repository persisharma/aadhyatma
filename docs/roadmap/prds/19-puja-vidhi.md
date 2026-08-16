# PRD-19 — पूजा विधि · Guided Step-by-Step Puja Flows

| | |
|---|---|
| **Status** | Implemented — six v1 Vidhis published, all Phase 2B surfaces shipped (search rows, Observance Detail slot, DISCOVER card, keep-awake, Add to Routine); canonical-edition sign-off remains (requires archive.org access) |
| **T-shirt size** | L (content-heavy: new data family + sourcing/verification track + 3 screens; engine work is nil) |
| **Prototype** | [`docs/puja-vidhi-prototype.html`](../../puja-vidhi-prototype.html) — festival-day entry, samagri checklist, conduct mode, aarti hand-off, completion, catalog; every interaction annotated |
| **Feasibility** | ✅ Confirmed against current main — festivals already carry content hooks (`kathaId`, `linkSectionId` in `festivals.ts`); a `vidhiId` follows the identical pattern. Steps reference shipped mantric texts by section id. Read-aloud TTS (#230) and follow-along audio (PRD-13) cover recitation. The only new capability is the content itself. |

> **Design intent (validated in the prototype):** the Vidhi is entered from the **day it's needed** (festival day panel on the Panchang tab) or the always-available Vrat & Parv catalog — not from a new Home category. Two modes: **तैयारी** (samagri checklist, the day before) and **पूजा** (full-screen conduct mode, one step per page, reader-grade type). Verbatim-verified mantras render inline with IAST and read-aloud; applicable katha, prayer, and aarti steps hand off to shipped readers.

---

**Bundle-only:** vidhi definitions are typed bundled modules in `mobile/src/data/vidhi/`. Checklist state and completion marks live in AsyncStorage. No network, no account. No audio assets in v1 (recitation reuses shipped TTS/audio), so the size cost is text-only.

## 1. Problem

On festival morning, a young householder knows *that* it's Ganesh Chaturthi (the app tells them), can read the katha (the app ships it), and can sing the aarti (the app plays it) — but the actual **procedure** ("what do I do, in what order, with what in my hand, saying what?") sends them to ad-choked blog posts of wildly varying correctness, mid-puja, with wet hands. The app currently owns every *text* moment of devotional life but not the *performed* moment — which is the highest-stakes, highest-reverence moment of the user's year.

## 2. Goal

Own the performed puja end-to-end offline: samagri gathered the day before, every action guided in order, verified mantras in hand where available, the aarti sung from the app, and the vrat katha read at the right step. Success = Vidhi conduct-mode completions on festival days and samagri-checklist opens the day before (per-device local counters).

## 3. How we identify the content (the sourcing method)

This is the PRD's hard part, so it is specified first. Five rules, mapped to the repo's existing content contract (RULEBOOK §11):

### 3.1 Canon: one printed convention, retained for review per vidhi
Primary canon is the **Gita Press (Gorakhpur) householder corpus** — *Nitya Karma Puja Prakash* for the puja frame (shodashopachara sequence, sankalp form) and the *Vrat-Parichay* / Kalyan annuals for festival-specific vidhis. Rationale: (a) it is the most widely accepted householder standard in the app's North-Indian/purnimant convention — which the festival engine already normalizes to; (b) the repo already treats Gita Press editions as canonical (the Valmiki Ramayana section pins "Gita Press … complete 2-volume scan" with archive.org URLs and a verification status in its committed `source` block — #232); (c) public scans exist for verification. Each vidhi's JSON carries the same `source` block shape: `canonicalEdition`, `canonicalEditionUrls`, `canonicalEditionStatus` (what was checked, when), `referenceUrls`.

### 3.2 What is transcribed vs. what is authored
- **Mantras, sankalp formulae, dhyana shlokas are transcribed, never composed** — RULEBOOK §11.3 (*no AI-generated liturgical text*) applies with full force. A mantric line publishes only after exact-text verification against the recorded references and must pass the Devanagari well-formedness CI gate (#243). If the exact wording is not verified, the action remains instruction-only.
- **Step instructions are authored fresh** in the app's own Hindi/English prose (the procedural sequence is tradition; a source's editorial prose is not copied). Authored instructions follow §9's explanation discipline: each step says *what* and *why* in one to two lines.

### 3.3 Reuse by reference, never by duplication
Texts the app already ships — aartis, chalisas, Vishnu Sahasranama, Gita adhyayas, kathas — are referenced from steps by `{ sectionId, verseRange? }`, exactly like `linkSectionId` on festival rows. No mantra that exists in the library is ever re-typed into a vidhi (single source of truth; verse-count sync §11.10 stays intact). Only genuinely new liturgical snippets (sankalp template, avahan/asana/pushpa mantras, panchopachara lines) enter as new content, each with its own citation.

### 3.4 Two-source verification per vidhi
Every Vidhi's procedure and samagri are cross-checked against **at least two independent published references** before merge, with DrikPanchang as the common procedural reference and each entry naming its second source. A printed canonical edition remains separately recorded as verified or honestly pending; an unopened scan is never claimed as read. Internet verification is mandatory (§11.1), while tests pin that every shipped-text reference resolves, every samagri list is non-empty, every source record has at least two URLs, and every festival `vidhiId` resolves.

### 3.5 Scope ladder and regional honesty
v1 ships **six vidhis**, chosen because their festivals already exist as engine rows with kathas — the content compounds instead of sprawling: **सत्यनारायण पूजा** (purnima, monthly recurrence), **दीपावली लक्ष्मी-गणेश पूजन**, **गणेश चतुर्थी स्थापना**, **नवरात्रि घटस्थापना**, **करवा चौथ**, **महाशिवरात्रि पूजन**. Each retains its convention and sources as internal review metadata; those fields do not render on catalog, detail, conduct, or completion surfaces. Regional variants (Maharashtra Ganeshotsav, Bengali Lakshmi puja…) are explicitly out of v1 and recorded per vidhi rather than folded into a homogenized "quick puja" (completeness rule §11.5 applies to the chosen source's vidhi as a whole).

## 4. Where it lands in the app (surfaces)

Validated in the prototype; **no new Home category** (the launcher grid is closed by design). The shipped surfaces are:

1. **Festival day panel (Panchang tab)** — the primary door. On a festival with a vidhi, the shipped **ObservanceCard** (§33.5) gains a third action pill — **॥ पूजा विधि** (filled saffron) beside the existing `कथा पढ़ें` (gold-tint) and `पढ़ें: <section>` (outline) pills — driven by a `vidhiId` on the festival row, same mechanism as `kathaId`.
2. **Vidhi catalog screen** — all six Vidhis browsable in one list (routed in the Panchang stack), each row using the **§8 LibraryCard active variant**.
3. **Vidhi detail** — occurrence-scoped samagri checklist plus the grouped procedure index.
4. **Conduct reader** — one swipe-paged card per step, shipped-text hand-offs, resume state, and quiet completion.

Phase 2B (Aug 2026) added the remaining doors: **search rows** (one section-group row per vidhi, routed to Vidhi Detail), the **Observance Detail "How to observe" card** (gated on a resolving `vidhiId` — never a placeholder), and the **Home DISCOVER card** (opens the catalog).

## 5. The two modes (UX contract)

### 5.1 तैयारी — samagri checklist (the day before)
A checkable samagri list per vidhi (`{item, qty?, optional?}`) using Today's Practice's summary accordion, progress track, ledger rows, and routine-item check circles (§31). State persists per upcoming festival date in AsyncStorage and resurfaces via the existing vrat-reminder day-before slot when the user has opted into that festival's reminders. One action: **"सूची साझा करें"** — shares the samagri list as plain text (the family shopping message; no image pipeline needed, nothing personal on it).

### 5.2 पूजा — conduct mode (festival day)
Full-screen, one step per page, paged horizontally like the readers (the interaction the user's hands already know). Left/right swipe is the only page-turn mechanism: no back/forward buttons and no swipe-helper copy.
- Daily Bhakti-style reading card: phase (आरम्भ · मुख्य पूजा · समापन), step n/N, title, and instruction in reader-grade type (Devanagari primary, 10 pt+ floor, reading-size setting respected).
- Reader progress dots sit at the bottom; the active dot stretches as in Hanuman Chalisa. Dots disappear on completion.
- The step's mantra inline with IAST romanization, with the **read-aloud** affordance (#230 TTS) — or, where the step *is* a shipped text (aarti, katha, sahasranama), a **hand-off card** that deep-links into that reader/audio and returns to the next step.
- **Keep-awake (shipped, Phase 2B):** conduct mode holds `useKeepAwake()` for the whole session and announces it for screen readers on entry.
- Exit resumes: re-entering the same day offers "जहाँ थे वहीं से" (same resume sheet pattern as the readers).
- Completion: a quiet ॐ seal and completed-step count. It does not repeat katha/aarti actions already completed in the guided steps and deliberately does not use the routine celebration animation.
- **Add to routine (shipped, Phase 2B):** recurring Vidhis (a festival rule with monthly recurrence — Satyanarayan/purnima today) expose `AddToRoutineButton` on the detail header; routine items use the new `vidhi` kind (manual-mark completion).

## 6. Data model (new family: `mobile/src/data/vidhi/`)

```
VidhiEntry {
  id, titleHi/En, festivalIds[], deities[],
  conventionLineHi/En,          // internal review metadata; never rendered
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

1. **Phase 1 — complete:** source and publish Satyanarayan end-to-end; build the three shared screens and tests.
2. **Phase 2A — complete:** publish the remaining five v1 Vidhis and connect all six festival `vidhiId` hooks.
3. **Phase 2B — complete (Aug 2026):** search rows, the Observance Detail slot, DISCOVER card, keep-awake, and Add to Routine (recurring vidhis, `vidhi` routine-item kind). The same pass added liturgy hand-offs into shipped verified sections (Ganesha vandana → ganesh-stotram, Devi stuti → durga-stotram, deepa shloka → sandhya-deepam) and the inline Panchakshara mantra on the Shivaratri japa step — the registry now carries 96 guided steps and 12 transcribed mantras.
4. **Phase 3 (options, all content-gated):** shraddha vidhi (with PRD-17) — **blocked on an authoring environment with content egress**: §3.4's two-source verification cannot be performed where DrikPanchang/archive.org are unreachable (attempted and recorded 2026-08-14), and §11.3 forbids authoring the liturgy or claiming unopened sources; recorded audio (a product size decision needing real recorded assets); regional variants as explicit alternates (same sourcing requirement). The canonical-edition sign-off for all six shipped vidhis carries the same environment requirement — every entry's `canonicalEditionStatus` records the honest pending state and how to clear it.

## 9. Why it fits the moat

Every step of a puja is a moment the incumbents monetize (samagri commerce, pandit booking, ad interstitials mid-vidhi). Vedansh performing it clean, offline, cited, and free is the whole brand in one feature — and the content compounds annually: a verified vidhi is shelf-stable for decades, the rare content investment with zero decay.

## 10. Design compliance (design.md is authoritative)

- **Colour/type/layout** — reader rules apply wholesale (§9): parchment system, Noto Serif Devanagari, per-verse type scale, 10 pt floor, card radius 18/padding 18. Conduct mode is a reader variant, not a new visual language.
- **Components** — `ReaderHeader variant="reader"` in conduct mode, `variant="index"` on catalog/checklist; the **§8 LibraryCard** for catalog rows and the **§33.5 ObservanceCard action pills** for the day-panel entry; §31 routine check circles on the samagri list; `AddToRoutineButton`; the readers' progress dots and resume sheet; **no hand-rolled duplicates** (RULEBOOK §3).
- **Iconography** — `॥`/`ॐ`/दीया glyph territory, no emoji (§5).
- **Motion/haptics** — page turns per reader spec (§11); completion is a static seal, no celebration animation.
- **A11y** — steps are fully screen-reader traversable; keep-awake announced; mantra + IAST both exposed as text (§12).
- **Bilingual, Hindi-led** — Devanagari primary; the hi/en/gu/kn language system applies to instructions (mantras stay Devanagari + IAST per §3.1 romanization rules).
