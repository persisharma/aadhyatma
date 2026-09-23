---
title: Pitru Paksha Shiksha (परिचय)
type: subsystem
sources: [mobile/src/data/pitru/types.ts, mobile/src/data/pitru/lessons.ts, mobile/src/data/pitru/principles.ts, mobile/src/data/pitru/kathas.ts, mobile/src/data/pitru/prashna.ts, mobile/src/data/pitru/index.ts, mobile/src/screens/PitruPakshaShikshaScreen.tsx, mobile/src/screens/PitruKathaScreen.tsx, mobile/src/screens/PitruParichayReaderScreen.tsx, mobile/.maestro/pitru-paksha-smoke.yaml, mobile/src/screens/PitruPakshaOverviewScreen.tsx, mobile/src/navigation/types.ts, mobile/src/navigation/MoreStackNavigator.tsx, mobile/src/data/pitru/__tests__/pitruShikshaContent.test.ts, mobile/src/screens/__tests__/PitruPakshaShikshaScreen.test.tsx, docs/roadmap/prds/44-pitru-paksha-shiksha.md, docs/pitru-paksha-shiksha-prototype.html, design.md, RULEBOOK.md]
last_verified_date: 2026-09-23
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

- **Data** — `mobile/src/data/pitru/`, **61 rows authored / 39 verified**: `lessons.ts`
  (`kind: 'parichay' | 'tithi' | 'shabd'` — 10 concept, **all 16 fortnight tithis**, 13 glossary;
  tithi rows carry `fortnightDay`), `principles.ts` (verse spine — Gita 1.42 / 9.16 / 9.25 /
  10.29 / 2.20, Valmiki 2.102.27 / 1.41.19 — each with a `ref: {kind, chapter, verseIndex}` into
  a bundled reader), `kathas.ts` (four verified, each retold verse-by-verse from the bundled
  corpus: `rama-jalanjali` Ayodhya 102, `bhagirath-sagar` Bala 38–44, `jatayu-antim-sanskar`
  Aranya 67–68, `bharat-dwadashah` Ayodhya 77; plus the draft `karna-mahalaya` folk katha), `prashna.ts` (9 Q/A),
  `index.ts` (verified-only accessors behind `require()` thunks + `hasPitruShiksha()`).
- **Screens** — `PitruPakshaShikshaScreen`, a **hub shaped by use** (Sept 2026): introduction card
  → questions accordion → verse carousel → katha tile shelf → glossary door → three doors LAST
  (fortnight · vidhi · ledger); **no tithi list — that is the overview's**. `PitruParichayReaderScreen`,
  the concept lessons paged on the **Vrat Katha reader shell** (ReaderHeader + counter,
  ReadingProgressBar, LanguageToggle + read-aloud, `KathaSectionPage` pages, pager dots, a closing
  `NextChapterCard` that hands off to the fortnight). `PitruKathaScreen` (the DaanKatha pattern in
  Pitru's muted register). All on the **More stack only**, after `PitruPakshaOverview`. Routes:
  `PitruPakshaShiksha: undefined` · `PitruParichayReader: { lessonId?: string } | undefined` ·
  `PitruKatha: { kathaId }`.
- **Door** — `pitru-paksha-shiksha-door`, the outlined half of the overview's sticky action bar,
  rendered only when `hasPitruShiksha()` is true; `pitru-paksha-day-shiksha` on an open day's card
  is the second way in (it opens the READER on `{lessonId:'kis-din-kiska'}`). An open day's card
  carries no guide button — the bar's `pitru-paksha-vidhi-door` is the one guide door and follows the
  open day, so the same door is never on screen twice. The public `pitru-paksha-reminder` tap is
  unchanged and still lands education-first.
- **Overview (Sept 2026 UX review)** — `PitruPakshaOverviewScreen` gained a standing hero
  (today's tithi + `दिन N / M` during the paksha, a countdown before it, an explicit `अगले वर्ष`
  once `year += 1` rolls), a family-days strip that OPENS the first family day (or, with an empty
  ledger, opens `PitruSmaranList`), expandable day rows that carry §74's verified tithi teachings
  inline and list each family member as a row into `PitruSmaranDetail {entryId}`, chevrons on
  openable rows (muted titles on bare ones), and the sticky bar holding both standing doors.
  design.md §63.5 item 5 carries the full spec.
- **Hand-offs** — Gita rows push the More stack's local `GitaReader {chapter, initialIndex}`
  (Back returns); the Valmiki row/katha cross to `HomeTab/ValmikiRamayanReader` (not mounted on
  More — PRD-44 open question 3).

## Working Rules

- **Explain, never prescribe.** The stance guard in `pitruShikshaContent.test.ts` bans `must`,
  `you should`, `inauspicious`, `dosha`, `curse`, streak/score, `आपको … करना चाहिए`, `अशुभ`,
  `पितृ दोष`, `श्राप`, `अवश्य करें` across every rendered field. The "can new work be undertaken
  in these days" question is **answered as an explicit non-verdict** rather than omitted — people
  ask it, and silence there cedes the ground to fear copy; the row states only that the opened
  sources are procedural and defers to family practice. "Who may perform" is draft by choice: even
  a deferral needs its adhikara chapter opened, because a bare "ask your family" reads as evasion.
- **Scripture is pointed at, never re-typed.** A row quotes verse lines only when its `ref`
  resolves to the exact bundled verse the cite line names (the test opens the corpus JSON and
  checks `number` / `reference`). No bundled reader ⇒ meaning-only, unquoted (Manu 3.70).
- **Verified-only, drafts dark.** Flipping `status` lights every surface with zero code change;
  the screen test pins that every draft id of every kind is absent (non-vacuous — the registry
  holds drafts on purpose). Drafts' notes begin `DRAFT — NOT VERIFIED` and name the sources.
- **Source threshold and the ladder (RULEBOOK §28.4).** ≥2 refs (`https://` or `repo:`), ≥1
  https, dated note. Prefer, in order: the **bundled corpus** (strongest — the reviewer opens the
  file; the corpus is one reference and its own published source line the second), the **shipped
  engine**, then the **dossier**. A web-search summary never flips a status — record its URLs in
  the draft note as leads. A **verified katha** must carry a `ref` into a bundled reader and a
  `repo:` reference, pinned by test.
- **Panchabali is authored as DRAFT** (`panchabali` parichay lesson + `shabd-panchabali`
  glossary row, 2026-09-21, dark until a reviewer opens the sources). Its dossier,
  `docs/roadmap/conventions/panchabali-source-dossier.md`, holds the five-recipient scheme, the
  copy the stance guard forbids, the mantra text (officiant appendix only — never in-app), the
  primary sources still unopened, and a table of every other pending gap in this layer.
- **The fortnight is covered end to end.** All sixteen days carry a `tithi` row, verified or
  draft, pinned by a coverage test: a missing day leaves the reader unable to tell "no tradition
  here" from "the app forgot".
- **The vidhi boundary is unchanged.** No mantra/formula/sequence enters the layer; it describes
  that these exist and vary, and repeats "limited household guide" wording verbatim.
- **Shape follows use, not content type** (Sept 2026 — the fix for "not user friendly, multiple
  clicks or scrolls"). The old screen stacked six content types with three interaction models in
  one ~39-block column, and reading the introduction cost seven taps of `और पढ़ें`. Now each
  kind is shaped by what people do with it: lessons are **read** (the paged reader — nothing to
  unlock), questions are **scanned** (accordion, second on the hub, because they are what people
  arrive with), verses and kathas are **browsed** (the §73 carousel and shelf), the glossary is
  **looked up** (a door). Do not reintroduce collapsed lesson cards or a section rail on the hub;
  if a new content kind arrives, pick its shape by its use.
- **A long text reads in the reader shell.** The परिचय reader is the Vrat Katha reader, component
  for component — the same header, counter, progress bar, toggle row, read-aloud, page anatomy,
  type scale and dots. It is a row in `readerReadAloud.test.tsx` (the rule for every reader). It
  is NOT in `readerAutoAdvance.test.tsx`: that table is for chapter-to-chapter swipes in
  multi-chapter texts, and this is one "chapter" whose closing card leaves for another screen —
  its hand-off is pinned in `PitruPakshaShikshaScreen.test.tsx` instead.
- **The closing card uses `popTo`, not `replace` or `navigate`.** React Navigation 7's `navigate`
  no longer returns to an existing route by default; `popTo('PitruPakshaOverview')` pops back to
  the calendar when the reader was opened from a dated day and replaces the reader otherwise, so a
  second overview is never stacked.
- **ONE fortnight surface, and it is the dated overview** (Sept 2026 — the fix for "the two
  screens feel disconnected"). The paksha was rendered twice: `पक्ष की तिथियाँ` here, undated and
  showing only the two verified rows, and the dated fifteen-row table on
  `PitruPakshaOverviewScreen`. Neither list knew about the other, so the teaching never met the
  day it was about. The section is **gone from this screen**; the verified `tithi` lessons are
  matched onto the overview's dated rows by `fortnightDay` and unfold there. The registry is
  untouched — all sixteen rows and the coverage test stay — and a future verification lights up
  a dated row with no UI work. Do not re-add a tithi list here.
- **The seam runs both ways.** A dated day hands off with
  `navigate('PitruParichayReader', { lessonId: 'kis-din-kiska' })`, which opens the reader ON that
  lesson rather than dumping the reader at the top of a long scroll; the reader's closing card and
  the hub's **अब** door hand back. If you add a hand-off from a day, deep-link the lesson that
  answers the question the day raises — never the screen.
- **A UI line must carry a fact, not the stance** (design.md §1). The screen's old lede,
  *क्या है, क्यों है, किस दिन किसका — फिर स्मरण, फिर विधि*, narrated its own section order and went
  in the Sept 2026 pass; a test pins that it does not come back. The teaching stays where it
  belongs — in the lessons, the verse meanings, the katha शिक्षा and the प्रश्नोत्तर answers.

## Gotchas

- **Outbound access is blocked by policy, not a transient fault** (retested 2026-09-19): the
  agent proxy is healthy but every source domain returns `CONNECT tunnel failed, response 403`,
  and `WebFetch` returns `EGRESS_BLOCKED`. Web *search* works, but a search summary is not an
  opened source. So "verified" is scoped to the dossier's 2026-08-19 facts, the engine, and the
  **bundled corpora** — which turned out to be the richest vein: a sweep of the 27 MB Valmiki
  JSON for पितृ · श्राद्ध · तर्पण · पिण्ड · जलाञ्जलि found three complete canonical pitru
  episodes and four new verses, all checkable in-repo. The 14 per-tithi assignments, the
  three-debts lesson, Mahalaya, गोत्र, "who may perform" and the Karna katha stay **draft** —
  Phase 2 is mostly opening sources and flipping statuses.
- **A defective corpus row is not a source.** The Yuddha-Kanda *maraṇāntāni vairāṇi* verse
  (Vibhishana performing Ravana's rites) was dropped: the bundled row at 6.114.100 has collapsed
  spacing, a corrupt akshara and a meaning offset from its shloka. The run at 2.103.26+ has the
  same offset defect. Never anchor a `ref` or a quote to one.
- **The Devanagari validator earns its keep here.** The bundled corpus writes `पितृ़` (pitṛ +
  nukta) where the correct form is `पितॄ`; copying a verse line straight out of the JSON imports
  that defect, and `devanagariWellFormed` caught exactly this in two new verse lines. Corpus text
  is a source for *identity*, not a clean-text source — normalise what you quote.
- **`userFacingImplementationCopy.test.ts` bans "on-device / इस फ़ोन पर / offline" copy** in
  screens outside its allow-list; the new screens avoid it (the Overview stays on the list).
- **Bundled Valmiki numbering is the Southern recension**: the Mandakini jalanjali is sarga 102
  in the corpus (`reference: 2.102.27`, `verses[3715]`) but sarga 103 in Gita Press. Cite lines
  follow the corpus; the katha's canon line says "सर्ग १०२–१०३" and the test checks the ref falls
  inside that range. Note also that a run of corpus rows at 2.103.26+ carries Hindi meanings that
  belong to the preceding shlokas — an upstream corpus defect, not something to link to.
- **`hasPitruShiksha()` is the only door predicate** — hosts must not check the registry
  themselves; the overview test mocks `@/data/pitru` to `false` to pin the absence path.
- **Season-gated e2e.** `.maestro/pitru-paksha-smoke.yaml` can only reach the overview from the UI
  ~30 days before purnima through amavasya (list banner; Today strip / day chip in the fortnight), so
  its journey runs under `runFlow: when: visible: "Open Pitru Paksha overview"` and is SKIPPED
  off-season. A green run out of season proves only the ledger add/delete — the behaviour is pinned
  date-independently in Jest. Authored 2026-09-23 without a simulator; not yet run.
- **Jest `testMatch`** gained `src/data/pitru/__tests__/**` (no tsx scripts live there). Do not
  add these suites to `test:data`.
