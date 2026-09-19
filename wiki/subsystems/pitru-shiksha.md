---
title: Pitru Paksha Shiksha (परिचय)
type: subsystem
sources: [mobile/src/data/pitru/types.ts, mobile/src/data/pitru/lessons.ts, mobile/src/data/pitru/principles.ts, mobile/src/data/pitru/kathas.ts, mobile/src/data/pitru/prashna.ts, mobile/src/data/pitru/index.ts, mobile/src/screens/PitruPakshaShikshaScreen.tsx, mobile/src/screens/PitruKathaScreen.tsx, mobile/src/screens/PitruPakshaOverviewScreen.tsx, mobile/src/navigation/types.ts, mobile/src/navigation/MoreStackNavigator.tsx, mobile/src/data/pitru/__tests__/pitruShikshaContent.test.ts, mobile/src/screens/__tests__/PitruPakshaShikshaScreen.test.tsx, docs/roadmap/prds/44-pitru-paksha-shiksha.md, docs/pitru-paksha-shiksha-prototype.html, design.md, RULEBOOK.md]
last_verified_date: 2026-09-19
confidence: high
status: current
---

## Summary

पितृ पक्ष परिचय (PRD-44) is the **education layer** beside the two Pitru surfaces that already
shipped — the reminder + ledger ([[notifications]], [[panchang]] §Pitru Smaran) and the narrow
tila-tarpana vidhi ([[puja-vidhi]]). Before it, the fortnight told a family *when* and handed them
a checklist; it never said what the fortnight is, why it is kept, whose day is which, or what the
Gita and Ramayana actually say. Phase 1 is built: a bundled registry (`data/pitru/`), one
reading-order screen, a katha reader, and a gated door on the Pitru Paksha overview. Design:
design.md §74 (+ §63.5); contract: RULEBOOK §28; PRD + annotated HTML prototype in `docs/`.

## Shape

- **Data** — `mobile/src/data/pitru/`: `lessons.ts` (`kind: 'parichay' | 'tithi' | 'shabd'`;
  tithi rows carry `fortnightDay`), `principles.ts` (verse spine — Gita 1.42 / 9.25 / 2.20,
  Valmiki 2.102.27 — each with a `ref: {kind, chapter, verseIndex}` into a bundled reader),
  `kathas.ts` (`rama-jalanjali` verified from bundled Ayodhya Kanda 2.102.20–35; `karna-mahalaya`
  draft folk katha), `prashna.ts` (4 Q/A), `index.ts` (verified-only accessors behind `require()`
  thunks + `hasPitruShiksha()`).
- **Screens** — `PitruPakshaShikshaScreen` (परिचय → तिथियाँ → शास्त्र-वचन → कथाएँ → प्रश्नोत्तर →
  शब्द → three doors LAST: overview · vidhi · ledger) and `PitruKathaScreen` (the DaanKatha pattern
  in Pitru's muted register). Both on the **More stack only**, after `PitruPakshaOverview`.
- **Door** — one `parchmentSoft` card between the overview's date hero and the fortnight rows,
  rendered only when `hasPitruShiksha()` is true. The public `pitru-paksha-reminder` tap is
  unchanged and now lands education-first.
- **Hand-offs** — Gita rows push the More stack's local `GitaReader {chapter, initialIndex}`
  (Back returns); the Valmiki row/katha cross to `HomeTab/ValmikiRamayanReader` (not mounted on
  More — PRD-44 open question 3).

## Working Rules

- **Explain, never prescribe.** The stance guard in `pitruShikshaContent.test.ts` bans `must`,
  `you should`, `inauspicious`, `dosha`, `curse`, streak/score, `आपको … करना चाहिए`, `अशुभ`,
  `पितृ दोष`, `श्राप`, `अवश्य करें` across every rendered field. The FAQ deliberately omits the
  "no purchases / inauspicious fortnight" question — the opened sources make no such verdict.
- **Scripture is pointed at, never re-typed.** A row quotes verse lines only when its `ref`
  resolves to the exact bundled verse the cite line names (the test opens the corpus JSON and
  checks `number` / `reference`). No bundled reader ⇒ meaning-only, unquoted (Manu 3.70).
- **Verified-only, drafts dark.** Flipping `status` lights every surface with zero code change;
  the screen test pins that every draft id of every kind is absent (non-vacuous — the registry
  holds drafts on purpose). Drafts' notes begin `DRAFT — NOT VERIFIED` and name the sources.
- **Source threshold (RULEBOOK §28.4).** ≥2 refs (`https://` or `repo:`), ≥1 https, dated note.
  In-repo verified content (bundled corpus, engine, the shraddha-tarpan dossier) counts as one.
- **The vidhi boundary is unchanged.** No mantra/formula/sequence enters the layer; it describes
  that these exist and vary, and repeats "limited household guide" wording verbatim.
- **Reading order is the IA** — do not add a door above the lessons.

## Gotchas

- **The session that authored Phase 1 had no outbound network**, so "verified" was scoped to
  facts already recorded as opened in `docs/roadmap/conventions/shraddha-tarpan-source-dossier.md`
  (2026-08-19) plus in-repo corpora. Per-tithi assignments (Bharani, Matri Navami, Sannyasi
  Dwadashi, Ghata Chaturdashi), the three-debts / pancha-mahayajna lesson, Mahalaya, गोत्र and the
  Karna katha are all **draft** — Phase 2 is mostly opening sources and flipping statuses.
- **`userFacingImplementationCopy.test.ts` bans "on-device / इस फ़ोन पर / offline" copy** in
  screens outside its allow-list; the new screens avoid it (the Overview stays on the list).
- **Bundled Valmiki numbering is the Southern recension**: the Mandakini jalanjali is sarga 102
  in the corpus (`reference: 2.102.27`, `verses[3715]`) but sarga 103 in Gita Press. Cite lines
  follow the corpus; the katha's canon line says "सर्ग १०२–१०३" and the test checks the ref falls
  inside that range. Note also that a run of corpus rows at 2.103.26+ carries Hindi meanings that
  belong to the preceding shlokas — an upstream corpus defect, not something to link to.
- **`hasPitruShiksha()` is the only door predicate** — hosts must not check the registry
  themselves; the overview test mocks `@/data/pitru` to `false` to pin the absence path.
- **Jest `testMatch`** gained `src/data/pitru/__tests__/**` (no tsx scripts live there). Do not
  add these suites to `test:data`.
