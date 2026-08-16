# PRD-20 — वास्तु · Directional Dharma of the Home

| | |
|---|---|
| **Status** | Proposed — prototype ready; build not started. |
| **T-shirt size** | M (content-first: one new data family + 2–3 screens in the Panchang stack; engine work is nil — everything computes from bundled static content) |
| **Prototype** | [`docs/vastu-prototype.html`](../../vastu-prototype.html) — tools-shelf/DISCOVER/search entries, mandala explorer, direction page (with the gated quote slot), facing picker + facing page, muhurat cross-link pill; every interaction annotated |
| **Feasibility** | ✅ Confirmed against current main — the Muhurat Finder already ships the three occasions Vastu users arrive from (`griha-pravesh`, `bhumi-pujan`, `sampatti` in `mobile/src/panchang/eventMuhurat.ts`); the deity registry already carries Kubera and Navagraha with shipped texts to hand off to (`kubera-stotram`, `navagraha-stotram`); the vidhi family (`mobile/src/data/vidhi/`, PRD-19) is the ready-made home for a वास्तु शान्ति vidhi. The only new capability is the content itself. A device compass is **not** feasible OTA (needs `expo-sensors`, a native module → store release) and is explicitly deferred. |

> **Design intent (validated in the prototype):** Vastu enters the app as a **calm reference tool**, not a verdict machine. The centrepiece is a tappable **Vastu Purusha Mandala** — a 3×3 direction grid (8 dik + ब्रह्मस्थान) rendered as View composition like the deity glyphs, no images, no SVG dependency. Tapping a direction opens its page: presiding dikpala, element, what tradition favours and avoids there, and hand-offs into shipped texts where the dikpala is a library deity (Kubera → कुबेर स्तोत्र, north). A second surface answers the one question every householder actually asks — *"my home faces X, what should I know?"* — via a facing picker, no sensors, no floor-plan upload.

---

**Bundle-only:** all Vastu content is typed bundled modules in `mobile/src/data/vastu/`. No network, no account, no sensors in v1. The user's facing selection (if we persist it at all) is one AsyncStorage key. Text-only size cost.

## 1. Problem

The user this app already owns — the young householder who does Griha Pravesh through our Muhurat Finder and Lakshmi-Ganesh pujan through our Vidhi — meets Vastu at exactly those moments: buying a plot, entering a new home, setting up a mandir at home. Today that intent lands on the incumbents' worst surface: fear-first "vastu dosha" listicles engineered to sell remedies, consultations, and yantra commerce. There is no calm, cited, offline place that simply explains the directional tradition — which deity presides where, what the classical texts actually assign to each direction, and what a given house facing traditionally implies.

## 2. Goal

Own the *reference* moment of Vastu: the mandala understood, each direction explained with its dikpala and classical assignment, the home-facing question answered in traditional terms, and the user handed onward to the things the app already does well — the Griha Pravesh muhurat, the Kubera and Navagraha texts, and (Phase 2) a sourced वास्तु शान्ति vidhi. Success = direction-page opens and facing-guide sessions (per-device local counters), plus cross-link taps from the Muhurat Finder's `griha-pravesh` / `bhumi-pujan` results.

## 3. How we identify the content (the sourcing method)

Vastu is uniquely exposed to made-up content — most of what ranks online is uncited invention. The rules, mapped to RULEBOOK §11:

### 3.1 Canon: classical texts first, named per claim
Primary references are the classical vastu corpus: **Brihat Samhita** (the vastu adhyaya — the oldest widely available treatment, public scans exist), **Vishwakarma Prakash**, and **Mayamatam / Samarangana Sutradhara** where they concur. The dikpala ↔ direction mapping (Indra-E, Agni-SE, Yama-S, Nirṛti-SW, Varuna-W, Vayu-NW, Kubera-N, Ishana-NE, Brahma-center) is stable across the corpus and is the factual spine of the feature. Each `DikEntry` carries the same `source` block shape as the vidhi family: `referenceUrls` (≥2), plus a `canonicalEditionStatus` recording honestly what was checked and when.

### 3.2 What is stated vs. what is refused
- **Stated:** the classical assignments — presiding dikpala, element, and the traditional room/use associations that at least two independent references agree on. Authored fresh in the app's own Hindi/English prose, one to two calm lines per claim (PRD-19 §3.2 discipline).
- **Refused:** dosha verdicts, remedy prescriptions, and any claim we cannot find in two independent references. Where sources genuinely disagree (they do, on secondary room placements), the entry says so or stays silent — it never averages. No AI-composed shlokas anywhere (RULEBOOK §11.3); if a direction page quotes a line from Brihat Samhita, it is transcribed and cited or omitted.

### 3.3 Reuse by reference, never by duplication
Dikpalas who are library deities (Kubera, Surya adjacent to Indra's east, Navagraha for the graha-direction table if shipped) hand off via `{ sectionId }` exactly like festival `linkSectionId`. No mantra is re-typed into the vastu family.

### 3.4 Two-source verification per entry
Every direction page and every facing-guide entry cross-checked against **two independent published references** before merge, recorded in the entry's `source` block. Tests pin: 9 directions present, every `dikpala` resolves against the deity registry (or is explicitly marked non-library, e.g. Nirṛti, Ishana as Shiva-aspect), every `sectionId` hand-off resolves, every source record has ≥2 URLs.

### 3.5 Scope honesty
v1 is the **grihastha reference**: 9 direction pages + 8 facing-guide entries (4 cardinal + 4 intercardinal). Plot selection, industrial/commercial vastu, temple architecture, and remediation are out of v1 and recorded as such — not folded into a homogenized "vastu tips" feed.

## 4. Where it lands in the app (surfaces)

**No new Home category** — the launcher grid is closed at 15 tiles (5×3) by design, and Vastu is a tool, not a text family. It follows the Kundali/Rashifal pattern instead:

1. **Panchang stack screen** — `VastuScreen` routed in `PanchangStackNavigator`, entered from the Panchang tab's tools row alongside Kundali and Rashifal (its natural Jyotish-adjacent shelf).
2. **Muhurat Finder cross-link** — on `griha-pravesh` and `bhumi-pujan` result/detail surfaces, one outline pill **वास्तु देखें** (the user planning a Griha Pravesh is the Vastu user, at the exact moment). Same pill grammar as the ObservanceCard actions (§33.5).
3. **Search rows** — one section-group row ("वास्तु — दिशा ज्ञान"), routed to `VastuScreen` (PRD-19 Phase 2B precedent).
4. **Home DISCOVER card** — one rotation slot, opens `VastuScreen`.

## 5. UX contract

### 5.1 Mandala explorer (the landing surface)
A 3×3 grid — 8 directions around ब्रह्मस्थान — rendered as View composition (deity-glyph discipline: no emoji, no images). Each cell: the direction's Devanagari name, its dikpala. North sits at top by convention, with a one-line note that printed mandalas are drawn NE-up in some traditions. Tapping a cell pushes the direction page.

### 5.2 Direction page (×9)
Reader-grade calm: dikpala (with deity glyph where the registry has one), element, guna line, "tradition favours here / tradition avoids here" as two short token-styled lists, a transcribed-and-cited classical line where verified, and hand-off cards into shipped texts (Kubera → `kubera-stotram`; Navagraha table → `navagraha-stotram`). No score, no warning colour, no dosha language.

### 5.3 Facing guide
An 8-way facing picker ("मुख्य द्वार किस दिशा में है?") → one page per facing: the traditional reading of that facing, which pada the entry classically favours, and what to place mindfully. Explicitly framed as traditional reference — the page footer carries the same quiet framing line the Rashifal uses for interpretive content. Optional single AsyncStorage key remembers the selection.

### 5.4 What the user never sees
Verdicts ("your home has vastu dosha"), urgency, remedies for sale, or a form asking for birth details — this feature reads, it does not diagnose.

## 6. Data model (new family: `mobile/src/data/vastu/`)

```
DikEntry {
  id: 'east'|'southeast'|...|'brahmasthan',
  nameHi/En, dikpalaNameHi/En,
  dikpalaDeityId?: Deity,             // when the registry has them (kubera, …)
  element?, gunaLineHi/En,
  favours: [{ labelHi/En }], avoids: [{ labelHi/En }],
  quote?: { devanagari, iast, citation },   // transcribed only, never composed
  refs?: [{ sectionId }],                    // shipped-text hand-offs
  source: { referenceUrls, canonicalEditionStatus }
}
FacingEntry { facing, titleHi/En, bodyHi/En, entryPadaLineHi/En, source }
```
Registry questions (RULEBOOK §1), search rows (§7), and a `VastuScreens.test.tsx` (§4.10) apply as for any family. `eventMuhurat.ts` rows for `griha-pravesh`/`bhumi-pujan` gain an optional `vastuLink: true` flag driving the cross-link pill.

## 7. What it does NOT do (non-goals)

- **No device compass in v1** — `expo-sensors` is a new native module → store release (drags `APP_TOUR_VERSION` + whatsNew, per the OTA gotcha). Deferred to Phase 3 as a deliberate decision, not an oversight.
- **No dosha calculator, no remedies, no yantra/consultation commerce, ever** — the incumbents' fear-monetization pattern is the thing this feature exists to oppose.
- **No floor-plan input or per-room scoring** — reference, not diagnosis.
- **No plot/commercial/temple vastu in v1** — grihastha homes only.
- **No AI-generated liturgy or uncited claims** — RULEBOOK §11.3 with full force; thin-but-true beats rich-but-invented.

## 8. Phasing

1. **Phase 1 — the reference:** prototype → source and verify the 9 direction pages + 8 facing entries → `VastuScreen` + direction page + facing guide in the Panchang stack, search rows, tests. **Blocked on an authoring environment with content egress** for §3.4's two-source verification (same blocker recorded by PRD-19 Phase 3, 2026-08-14) — the screens can be built against a stub registry, but no entry publishes unverified.
2. **Phase 2 — the connections:** Muhurat Finder cross-link pills; DISCOVER card; **वास्तु शान्ति vidhi** as the vidhi family's next entry (natural pairing with `griha-pravesh`; inherits PRD-19 §3 sourcing wholesale and its content-egress gate).
3. **Phase 3 (options):** device compass overlay on the mandala (`expo-sensors`, store release); dishā-shūla travel-day table as a Panchang day-detail row (content-verification gated); regional convention notes.

## 9. Why it fits the moat

Vastu is where the devotional-app market is at its most predatory — fear-first content funneling into paid remedies. Vedansh shipping the classical reference clean, cited, offline, and free is the brand thesis restated (PRD-19 §9), and the content is the rare kind that compounds: a verified direction page is shelf-stable for decades. It also multiplies surfaces the app already owns — every Griha Pravesh muhurat query becomes two answered questions instead of one.

## 10. Design compliance (design.md is authoritative)

- **Colour/type/layout** — parchment system, Noto Serif Devanagari, token spacing/radius; direction pages are reader-adjacent cards, not a new visual language. No warning-red anywhere in the feature (calm-reference intent).
- **Components** — `ReaderHeader variant="index"` on VastuScreen, `variant="reader"` on direction pages; LibraryCard grammar for list rows; ObservanceCard-style action pills for hand-offs; deity glyphs from the existing registry; **no hand-rolled duplicates** (RULEBOOK §3).
- **Mandala** — View-composition drawing per the deity-glyph discipline (no emoji §5, no image assets, no new SVG dependency).
- **A11y** — the mandala grid is fully screen-reader traversable (each cell labelled "दिशा, दिक्पाल"); facing picker operable without gesture; quotes exposed as text with IAST (§12).
- **Bilingual, Hindi-led** — Devanagari primary; hi/en/gu/kn applies to authored prose; transcribed quotes stay Devanagari + IAST (§3.1 romanization rules).
