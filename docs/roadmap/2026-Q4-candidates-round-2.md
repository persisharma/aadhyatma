# Vedansh — Q4 2026 Candidates, Round 2: five features the app has never proposed

| | |
|---|---|
| **Status** | Proposed for planning review — five candidate PRDs (PRD-26 … PRD-30, numbers reserved; PRD-25 stays reserved for सन्ध्या वन्दन per round 1 §3) |
| **Dated** | 2026-08-27 (against `claude/next-quarter-prds-gvyobx` @ `51a7f86`, app 1.4.6) |
| **Method** | Same household-practice audit as [round 1](./2026-Q4-candidates.md), run with a stricter filter: a candidate qualifies only if it is (a) genuinely useful and (b) **not discussed anywhere** — not shipped, not owned by PRDs 01–24, not sitting in round 1's §3 rejected table, and not in `docs/enrichment-loop/backlog.md`. Every claim below was checked against source, not against the docs. §3 records the near-misses the filter removed, including one that looked like the strongest candidate of the round. |
| **Prototypes** | One per candidate, in the app's parchment system — linked from each section below and indexed in §6. |
| **Inherited constraint** | Bundle-only. No backend, no CDN, no streaming, no analytics SaaS, no cloud sync. |

---

## 1. What changed since round 1, and what the stricter filter found

Round 1 audited *household practice* and found five gaps in what a family **does** (sankalp, graha
practice, havan/sanskar vidhi, bhog/naivedya, vastu). This round starts from the same premise but
looks at a different axis: **what the app's own shipped machinery is structurally incapable of
saying** — because those gaps survive a uniqueness filter that content ideas rarely do.

Two things have moved since 2026-08-22 and both change the calculus:

1. **The content-egress blocker has largely resolved.** Round 1 §5.5 named egress as "the rate
   limiter on roughly half the roadmap", with four families stuck at `status: 'draft'`.
   PRD-23 then shipped 39 **verified** profiles (#300/#301, 2026-08-25/26). The binary now carries
   **20 `status: 'verified'` markers against 3 `draft`** — and the only remaining drafts are inside
   `upvasContent`. Feasibility no longer has to be bought with transcription risk, so this round
   deliberately picks features that are content-light *by choice* rather than by necessity: four of
   the five below ship with **no new sourced prose at all**.
2. **Round 1's own slate moved.** PRD-23 is done ahead of the quarter. PRD-20/21/22/24 remain
   candidate sections with no PRD file, no TRD, and no prototype.

### 1.1 The three structural asymmetries this round found

1. **Every screen in the app shows you the text. Nothing ever hides it.** 30+ readers, read-aloud
   TTS, reading progress, bookmarks, japam counters, streaks, 15 multi-day Sadhana Programs — and
   no way to check whether you actually know a verse. The app supports *reading* a text forever and
   never supports the thing a devotee is actually trying to reach: **कण्ठस्थ**, having it by heart.
   → **PRD-26**
2. **The muhurat engine is entirely subtractive.** `eventMuhurat.ts` defines **12 `DoshaKey`s and
   zero yogas**, and it reads the 27 nitya yogas only to extract the two *inauspicious* ones
   (`p.yoga.index === 16 → vyatipata`, `=== 26 → vaidhriti`). The engine can state what is wrong
   with a day and has no vocabulary for what is specially *right* about one. Round 1 rejected
   surfacing panchak as a standalone day-warning because that is fear copy — the additive half of
   the very same axis is the on-brand inverse, and it is missing. → **PRD-27**
3. **The app installs deities and never concludes anything.** `data/vidhi/` ships
   `ganesh-chaturthi-sthapana` and `navratri-ghatasthapana` — and **no visarjan of anything**.
   `festivals.ts` models Diwali's five days as five unrelated rules (`dhanteras`, `diwali`,
   `govardhan-puja`, `bhai-dooj`), and `ganesh-chaturthi` and `anant-chaturdashi` as strangers.
   The biggest festivals are **arcs**, and the app only knows days. → **PRD-28**

Plus two record-keeping gaps that fall out of features already shipped:

4. **The app tracks the tithis of the dead with real care and no tithi of the living.** PRD-17 Pitru
   Smaran has `deriveTithiRuleFromDate` + `solveNextOccurrence`; multi-person birth profiles shipped
   in #294. Nothing anywhere answers "when is my Hindu birthday this year". And `kuldev`/lineage
   appear nowhere in the codebase outside katha prose, though the kuldevta is the one piece of
   practice a family most reliably loses in a generation. → **PRD-29**
5. **The app accepted the multi-person household and left practice single-user.** Birth profiles are
   per-person, Pitru Smaran is per-ancestor — and `Routine` (`data/routine/types.ts`) is
   `{ id, nameHi, nameEn, mode, items, createdAt }` with **no person field at all**. Every routine,
   done-mark, vrat follow and japam alarm belongs to one implicit user, so the second person in the
   house is a second app. → **PRD-30**

---

## 2. The five

Ordered by my recommended build sequence: cheapest-and-ungated first.

---

### PRD-26 — कण्ठस्थ · अभ्यास mode · memorization and recall

> *The largest untapped return on content already in the binary, at zero content cost.*

**Prototype.** [`memorize-abhyas-prototype.html`](../memorize-abhyas-prototype.html) — 8 frames — the reader toggle, all three mask levels, audio-cue recall, the due queue, routine integration, and the कण्ठस्थ arrival state. Every liturgical or tabular string in it is an illustrative placeholder.

**The practice.** The devotional arc does not end at reading. A devotee works toward reciting the
Hanuman Chalisa, Gita 12 and 15, the Gayatri, Vishnu Sahasranama, Sundarkand's dohas **without the
book** — that is what कण्ठस्थ means, and it is why families drill children on exactly these texts.
Memorization is the one practice in this app that takes years and compounds.

**The gap.** Verified absent: no `memoriz*`, `recall`, `quiz`, or `flashcard` anything in
`mobile/src`, and no mention in `docs/`, `RULEBOOK.md`, `design.md`, or the enrichment backlog. The
app has every prerequisite and none of the mechanic — 30+ readers, per-verse read-aloud
(`readAloud/verseAdapter.ts`), `ReadingProgressContext`, bookmarks, the routine/sadhana completion
and celebration path, and the japam counter's tap discipline.

**What ships.**
- `memorize/mask.ts` — pure. Deterministic progressive masking of a verse: **L1** first word of each
  line (the lightest cue) → **L2** first akshara only → **L3** fully hidden, line count and metre only. Masking is
  **akshara-wise, never by JS code unit** — splitting mid-cluster renders garbage.
- `memorize/mastery.ts` — pure per-unit state (level, last reviewed, consecutive successes) plus a
  spaced-review scheduler returning what is due today. Persisted at `@vedansh:memorize:v1`.
- **अभ्यास toggle on the existing readers** (§9): masks the page in place, tap a line to reveal,
  self-mark आया / नहीं आया. No new screen for the common case.
- **Audio-cue recall** — reuse the shipped `expo-speech` read-aloud as prompt-then-continue (the app
  speaks the opening line, you carry on). No new dependency.
- **Integration, not a silo:** `RoutineItemKind` gains `'memorize'` (an item meaning "review what is
  due"), so अभ्यास lands inside नित्य साधना, Today's Practice, and the shipped completion path for
  free — the same trick PRD-19 used to add `'vidhi'` to the same union.

**Feasibility.** ✅ **The highest in either round's slate.** Pure TypeScript, OTA-shippable, no
native dependency, no new asset, and **no sourced content whatsoever** — the text is already in the
binary and every language is already handled.

**The one risk, and it is already solved in-repo.** Akshara segmentation. Do **not** reach for
`Intl.Segmenter`: `data/__tests__/contentCorrectness.test.ts` records that Indic grapheme clustering
changed in ICU (Unicode 15.1 GB9c) and the segmenter splits conjuncts like ज्यो on older runtimes,
which is why the repo already ships a hand-rolled `SINGLE_AKSHARA` regex for card thumbs. PRD-26
generalises that matcher into a splitter and inherits its test. Second note: **gu/kn are runtime
transliterations of the Devanagari** ([[languages]]), so masking must be computed on the source
Devanagari and transliterated after, or the offsets drift.

**Stance guards.** This is practice, not testing. Mastery is private, never ranked, never shared,
never a percentage — the app's standing refusal of luck scores and verdicts (§51) applies verbatim.
No "you failed", no streak-shaming, no leaderboard. The user marks their own recall and the app
believes them.

---

### PRD-27 — शुभ योग · the additive half of the muhurat engine

> *Twelve doshas, zero yogas. The engine can only tell you what is wrong with a day.*

**Prototype.** [`shubh-yoga-prototype.html`](../shubh-yoga-prototype.html) — 6 frames — today's day card before/after, the yoga detail showing its working, annotate-only finder results **and** the rejected re-rank alternative, Daily Muhurat. Every liturgical or tabular string in it is an illustrative placeholder.

**The practice.** "Is today a good day to buy / start / sign this" is asked constantly, and the
traditional answer names *positive* combinations, not just absent defects: **सर्वार्थ सिद्धि योग**
(nakshatra × vaar), **अमृत सिद्धि योग** (same axis, held to be the strongest), **रवि योग**, and the
**द्विपुष्कर / त्रिपुष्कर** pair — the "doubles or triples what you do" yogas, which is precisely
why households time purchases to them.

**The gap, precisely.** `eventMuhurat.ts` §`DoshaKey`: `rikta · amavasya · bhadra · panchak · adhik ·
vyatipata · vaidhriti · chaturmas · masa · guru-asta · shukra-asta · disha-shool`. Twelve subtractive
keys, no additive vocabulary. `abujh` days ship (`abujhMuhurat.ts`), which proves the app is
already willing to name a day *good* — it just has one such concept where tradition has several.
Verified absent from source and every doc: no `sarvartha`, `amrit siddhi`, `dwipushkar`,
`tripushkar`, or `ravi yoga` anywhere.

**What ships.**
- `panchang/shubhYoga.ts` — pure, over primitives `PanchangData` already carries (nakshatra, vāra,
  tithi). Compact per-vaar nakshatra sets for Sarvārtha and Amṛta Siddhi; the tithi × vāra ×
  nakshatra condition for the puṣkar pair; Ravi yoga off the nakshatra-from-Sun distance.
- **Surfaces:** a positive line on Daily Muhurat and the Panchang day card; a yoga annotation in the
  Event Muhurat Finder results (§60) so a candidate day can be **promoted**, not only demoted; and
  a shared chip component matching the shipped dosha chips.
- `conventions/shubh-yoga-v1.md`, verification-gated like the four convention docs already in
  `docs/roadmap/conventions/`.

**Feasibility.** ✅ High, OTA. The content is **tables, not prose** — and these tables are printed in
every published panchang, so verification is genuinely easy for once, unlike the vidhi and bhog
corpora.

**The one real decision.** May a yoga **offset** a dosha in the finder's ranking, or only annotate
alongside it? Tradition says yes for certain pairs; the safer product answer is **annotate-only in
v1**, because an offset silently changes every ranking the finder has ever produced. Pin it in the
convention doc either way.

**Stance guards.** No day-quality score, no percentage, no "luckiest day this month" — a named yoga
is present or absent with its traditional meaning stated, in exactly the register the shipped dosha
chips use.

---

### PRD-28 — पर्व-अर्क · festival arcs, स्थापना → विसर्जन

> *The app knows how to install a deity and has never once concluded a rite.*

**Prototype.** [`parv-arc-prototype.html`](../parv-arc-prototype.html) — 6 frames — today's silence after day 1, the duration chooser, mid-arc day 4 of 10, visarjan day, the Diwali five-day arc, and Navratri feeding PRD-23's shipped bhog list a day early. Every liturgical or tabular string in it is an illustrative placeholder.

**The practice.** The biggest festivals are not days. You install Ganesh on Chaturthi and the family
decides its own visarjan — 1½ day, 3, 5, 7, or 10 days to Anant Chaturdashi — and the concluding
date depends on **that choice**, which is exactly why it cannot be a static calendar entry.
Navratri runs ghatasthapana → kanya pujan → visarjan. Diwali is a five-day sequence with a distinct
act each day, and "what do we do today, and what is left" is the live question all five days.

**The gap.** `data/vidhi/` has two `*-sthapana` entries and **no visarjan of anything**.
`festivals.ts` carries `dhanteras`, `diwali`, `govardhan-puja`, `bhai-dooj` as four unrelated rules
and `ganesh-chaturthi` / `anant-chaturdashi` as two more, with nothing expressing that they are one
observance seen on different days. Verified absent from every doc: no `visarjan`, no arc concept.

**What ships.**
- **An arc relation over the rules that already exist** — `arcId`, `arcRole:
  'sthapana' | 'day' | 'visarjan'`, ordinal. Purely additive; no existing rule is rewritten and no
  date changes.
- **The sthapana → visarjan solver.** Choose a duration when you install; the app computes *your*
  visarjan date and its window and schedules the reminder through a shipped notification family.
  The chosen duration is **occurrence-scoped user state** — the exact shape
  `vidhi/checklistStore.ts` and PRD-23's grocery checklist already use, so there is no new storage
  pattern.
- **An arc strip** on Observance Detail: where today sits in the arc, what is done, what remains.
- **Content:** visarjan vidhi entries, and the Diwali five-day arc as the second consumer.

**Feasibility.** 🟡 Code is small and additive; the visarjan procedures are sourced content. But this
is no longer an indefinite wait — PRD-23 established that verification is possible, so the content
half is now scheduling, not hoping. Ship the arc relation, the solver and the strip first; the
vidhi text follows into the same slot.

**Stance guard.** Duration is the family's decision — regional and household practice vary widely
between 1½ and 10 days. The app records the choice and computes its consequence; it never says which
duration is correct.

---

### PRD-29 — कुल परम्परा · kuldevta, family observance, and the tithis of the living

> *The app keeps the tithis of the dead with great care and not one tithi of the living.*

**Prototype.** [`kul-parampara-prototype.html`](../kul-parampara-prototype.html) — 6 frames — janma tithi on the profile, the Home strip on the day, living and ancestor tithis side by side, the kul record, chosen-never-inferred deity picking, and the export that is the point. Every liturgical or tabular string in it is an illustrative placeholder.

**The practice.** Two things every family holds that no app holds for them. **The kul** —
kuldevta/kuldevi, the family temple, the gotra, the observance the family has always kept, the vow
taken at that temple. Families lose this in one generation, and nobody who has lost it can get it
back from an app store. And **the janma tithi**: a Hindu birthday is a *tithi*, not a Gregorian
date, and the practice attached to it — abhishek, the ishta's paath, ayushya, feeding — is what
elders actually observe while the Gregorian date gets the cake.

**The gap.** PRD-17 built a careful engine for *death* tithis: `deriveTithiRuleFromDate`,
`solveNextOccurrence`, per-ancestor entries, native-verified reminders. Multi-person birth profiles
shipped in #294 and hold date, time and place of birth — for Kundali and muhurat bala only. Nothing
converts a living person's birth date to its tithi or answers when it recurs. `kuldev`/`lineage`
appear nowhere in source (only inside katha prose); Guna Milan's convention doc mentions lineage
only to disclaim it as a *matching* input, which is a scoring decision and not a record.

**What ships.**
- **जन्म तिथि on the existing profile — zero new engine work.**
  `deriveTithiRuleFromDate(birthDate)` yields the rule and `solveNextOccurrence` yields this year's
  date; both are shipped, tested, and already handle adhik-masa and the paksha edge cases. Surfaces:
  the profile, the Home Today strip on the day, one notification in the shipped personal family, and
  the traditional practice for the day pointing at sections that already exist.
- **The कुल परम्परा record** — kuldevta/kuldevi chosen from the shipped deity registry; the family
  temple linked to the 73-temple Theerth registry where it exists and free-text where it does not;
  gotra; the family's kept observance linked to a real vrat rule so it dates itself every year; and
  free text for what only a family knows.
- **Handing it on** — the record exports through PRD-06's backup path, because a lineage record that
  cannot leave the device fails at the one job it has.

**Feasibility.** ✅ High, OTA. All user-entered data. No content, no egress, no new dependency, and
the only computation is a function call into a shipped module.

**Cross-PRD note.** `gotra` is **PRD-20's field**. Round 1 already flagged that PRD-20 and PRD-21
must not migrate `@vedansh:kundali-birth-profile:v1` twice; PRD-29 makes it three consumers. Design
that schema change **once**, in PRD-20, and have 21 and 29 consume it.

**Stance guards.** Private by default, and **never inferred** — no gotra → kuldevta guessing, no
caste or community classification, no directory of families, nothing sent anywhere. The janma-tithi
framing stays devotional rather than social: no greeting cards (round 1 §3 rejected those), no
sharing prompt.

---

### PRD-30 — घर की साधना · the household practice roster

> *The app already accepted the multi-person household everywhere except in practice itself.*

**Prototype.** [`household-roster-prototype.html`](../household-roster-prototype.html) — 6 frames — today's implicit single user, the household day, person filtering, optional assignment, one roster with optional birth details, and the shared iOS notification budget. Every liturgical or tabular string in it is an illustrative placeholder.

**The practice.** Practice in a Hindu household is assigned, not individually chosen. Mother keeps
Somvar, father Shanivar, grandmother every Ekadashi, the child does one shloka before school — and
one phone runs all of it. "Who still has something left today" is a real question in a joint family.

**The gap.** The product has already accepted multi-person: birth profiles are per-person with a
`PersonChips` roster (#294), Pitru Smaran is per-ancestor. Then `data/routine/types.ts` defines
`Routine` as `{ id, nameHi, nameEn, mode, items, createdAt }` — **no person field**. Routines,
done-marks (`@vedansh/routine-done`), vrat follows and japam alarms are all single-user, so the
second practitioner in the house has no representation at all.

**What ships.**
- An **optional `personId`** on Routine and on vrat follows, resolved against the **shipped**
  `birthProfiles` roster — not a second identity system.
- A **household day view**: who has what remaining today, at a glance.
- Person filtering on the routine and vrat surfaces (§45), reusing `PersonChips`.
- **Per-person reminder routing** in the shipped notification planners — with the real constraint
  stated up front: iOS has **one shared pending-notification budget** ([[notifications]]), so the
  planner must allocate *across* people rather than schedule per-person independently, or a
  four-person household silently starves its own reminders.

**Feasibility.** ✅ Engine-only and OTA-shippable, but **the largest migration in this slate**:
`@vedansh/routines` and `@vedansh/routine-done` gain a person dimension, and `routineItemKey` must
keep every existing done-mark valid. All existing routines migrate to an implicit "self" person.
Write that migration test before the feature.

**Stance guards.** No accounts, no cloud, no sharing — a "person" is a label on this device. And the
failure mode to design out deliberately: **no per-person adherence percentage and no compliance
report**. A household roster that ranks who skipped their vrat turns practice into surveillance,
which is the opposite of the app's register.

---

## 3. What the filter removed (so "not already discussed" is checkable)

### 3.1 The near-miss: विवाह मुहूर्त

Worth recording, because it looked like the strongest gap of the round and is not a candidate.
`eventMuhurat.ts` carries **13 occasions and no vivah**, marriage muhurat is the most-consulted
muhurat in Indian households, and Guna Milan already computes both partners' charts — so the input,
the lagna sweep, the tarabala and the hora evidence are all shipped and paid for.

It is **explicitly and permanently excluded by product decision**, in PRD-16 §3: *"Marriage requires
both partners' charts and guna milan, and is the highest-stakes decision a user could take from an
app. Permanently out of v1 scope; the disclaimer says so on every screen."* Restated in PRD-16/P3:
*"no Vivah — ever (parent §3)"*. Reopening it is a deliberate product reversal, not a Q4 candidate,
so it is out of this document by construction.

### 3.2 Checked and found already covered

| Idea | Why it is not a gap |
|---|---|
| **Regional calendar reckonings** (Amanta vs Purnimanta) | Already shipped — the engine takes `calendarSystem: 'purnimant' \| 'amanta'` with parity tests in `__tests__/engine.test.ts` and `dayCacheParity.e2e.test.ts`. |
| **पारायण schedules** (Gita in 18 days, navah/mas parayan, 41-day anushthan, Shravan Mondays) | Already shipped as PRD-11 Sadhana Programs — 15 programs including `gita-18`, `navratri-durga-9`, `shravan-somvar`, with a lunar-anchored `weekday` cadence tied to real vrat rules. A "parayan" PRD would be a rename. |
| **Unblocking the draft-gated content families** | Largely done. 20 `verified` against 3 `draft` markers, all remaining drafts inside `upvasContent`. Round 1 §5.5's standing blocker has mostly cleared. |
| **Ghar-ka-mandir upkeep, murti placement** | Round 1 PRD-24. |
| **Vaar-wise daan items** | Round 1 PRD-21. |
| **Havan, sanskar vidhi for the 12 undated-procedure occasions** | Round 1 PRD-22. |

### 3.3 Considered this round and not picked

| Idea | Why not now |
|---|---|
| **Device-calendar export** (`expo-calendar`) — put the year's festivals in the family's shared calendar | Real utility, but it buys a new native dependency (therefore a store release, `APP_TOUR_VERSION`, a `whatsNew` entry) to deliver roughly what seven shipped notification families already deliver. Revisit if users specifically ask for *sharing* dates rather than being reminded of them. |
| **पूजा थाली sound toolkit** — ghanti, shankh, damru during aarti | Genuinely absent (no bell/shankh asset or code anywhere) and charming, but new audio assets mean a store release, and it is decoration standing next to five features that answer questions. |
| **दान / सेवा ledger** — what the household actually gave, and when | PRD-21 already names the daan *items*; a ledger of past giving is record-keeping with thin daily use. Fold into PRD-29's family record later if anyone asks for it. |
| **दर्शन log** over the 73 shipped temples | Cheap retention layer on an asset already built, but too adjacent to round 1's yatra-planner rejection to slip in through the side door. Hold for an explicit decision. |
| **Children's devotional layer** | A real gap and a real audience, but content-heavy and undefined. **PRD-26's अभ्यास mode serves the concrete half of it** — drilling shlokas with a parent — at a fraction of the cost. Revisit once 26 has shipped and there is usage to look at. |
| **Positive day-quality as a standalone daily "score"** | Out on the same grounds round 1 rejected standalone panchak warnings: the moment a day gets a number, the app is in the fortune business. PRD-27 names yogas and refuses the score. |

Round 1's §3 exclusions all carry over unchanged: सन्ध्या वन्दन (reserved **PRD-25**), अन्त्येष्टि,
temple darshan timings / yatra planner, festival greeting cards, rudrākṣa / ratna / numerology, and
panchak-or-gaṇḍamūla as standalone day warnings.

---

## 4. Sequencing

```
PRD-26  कण्ठस्थ · memorization    ████████        OTA · zero content · zero gates
PRD-27  शुभ योग                   ██████          OTA · tables, published everywhere
PRD-29  कुल परम्परा                █████           OTA · user data only
PRD-28  पर्व-अर्क                    ███░░░░░        arc+solver OTA · visarjan text sourced
PRD-30  घर की साधना                ██████░░        OTA · storage migration is the risk
                                  └ ██ = buildable now   ░░ = gated or risk-bearing
```

**Recommended order and why.** **PRD-26 first** — it is the cheapest feature in either round's
slate, it is the only one with literally no content and no convention sign-off, and it converts 30+
shipped texts into a practice that compounds for years. **PRD-27 second**: small pure tables, and it
fixes a structural asymmetry cheaply. **PRD-29 third** — no content, and its engine call is already
written and tested. **PRD-28 fourth**, splitting the arc mechanic (now) from the visarjan text
(scheduled, not hoped for). **PRD-30 last**, because its storage migration is the only thing in this
document that can break data users already have.

**Cross-cutting.** PRD-29 is the *third* consumer of the birth-profile schema change (after round 1's
PRD-20 gotra and PRD-21 natal Moon). Design that migration **once**, in PRD-20. And PRD-30's person
dimension must resolve against the same `birthProfiles` roster PRD-29 writes to — with birth details
**optional**, since a person who only owns a routine has no chart.

**Against round 1.** These five do not compete with PRD-20/21/22/24 for the same skills: round 1's
slate is convention-and-content-heavy, this one is mechanic-and-storage-heavy. If both are wanted
this quarter, PRD-26 and PRD-27 can run alongside PRD-20's convention sign-off without contention.

**Merge gates** (`RULEBOOK.md` §0/§0.1, and `.claude/rules/design-doc-sync.md`): unit **and** Maestro
e2e with each change; `design.md` updated in the same PR — PRD-26 extends §9 and §45 plus a new
section, PRD-27 extends §60, PRD-28 extends §62/§65, PRD-29 a new section plus §37, PRD-30 extends
§45; `RULEBOOK.md` gains a content contract at §22+ for each content-bearing family (PRD-27's yoga
tables, PRD-28's visarjan vidhi); `npm run lint` at 0 errors. design.md currently ends at §65.1 and
RULEBOOK at §21.

---

## 5. Open decisions

1. **PRD-26 akshara splitter** — confirm the hand-rolled `SINGLE_AKSHARA` matcher in
   `contentCorrectness.test.ts` generalises to a *splitter* over full verse lines, or whether a
   fresh one is needed. This is a half-day spike and it determines whether masking is a day's work
   or a week's. **Do not use `Intl.Segmenter`** — the repo has already recorded why (ICU/Unicode
   15.1 GB9c splits conjuncts on older runtimes).
2. **PRD-26 mastery in backup** — should memorization state export through PRD-06? Recommend **yes**:
   it is the one piece of user data in the app that takes years to rebuild and cannot be re-derived.
3. **PRD-27 offset or annotate** — may a shubh yoga raise a day's standing in the finder's ranking,
   or only annotate it? Recommend **annotate-only in v1**; an offset retroactively changes every
   ranking the shipped finder produces.
4. **PRD-28 duration set** — which visarjan durations does the app offer (1½ / 3 / 5 / 7 / 10), and
   does it default to any? Regional variance is wide; recommend offering the set and defaulting to
   nothing.
5. **PRD-30 person identity** — does a routine-only person share the birth-profile record?
   Recommend **yes, with birth details optional**, so the household roster does not demand a chart
   for a child who just recites one shloka.

---

## 6. Prototypes

Five static HTML prototypes, one per candidate, in the same parchment system and frame conventions
as the shipped PRD prototypes (`docs/*-prototype.html`). Each carries its own "open questions this
prototype does not settle" panel, so the unresolved decisions stay attached to the picture rather
than living only in §5.

| PRD | Prototype | What it shows |
|---|---|---|
| **26** | [`memorize-abhyas-prototype.html`](../memorize-abhyas-prototype.html) | The अभ्यास toggle on the shipped reader, all three mask levels (word → akshara → hidden), tap-to-reveal with आया/नहीं आया, audio-cue recall, the due queue, and `RoutineItemKind: 'memorize'` |
| **27** | [`shubh-yoga-prototype.html`](../shubh-yoga-prototype.html) | The day card with and without a yoga chip, the detail showing vāra × nakshatra as its working, annotate-only finder results beside the **rejected** re-rank alternative, and Daily Muhurat |
| **28** | [`parv-arc-prototype.html`](../parv-arc-prototype.html) | Today's silence after day 1, the 1½/3/5/7/10-day chooser, the arc strip mid-festival, visarjan computed from *your* sthapana, the Diwali five-day arc, and Navratri surfacing PRD-23's bhog list a day early |
| **29** | [`kul-parampara-prototype.html`](../kul-parampara-prototype.html) | Janma tithi on the profile and Home strip, living + ancestor tithis on one engine, the kul record, deity/temple chosen-never-inferred, and the PRD-06 export |
| **30** | [`household-roster-prototype.html`](../household-roster-prototype.html) | Today's implicit single user, the household day view, `PersonChips` filtering, optional person assignment, one roster with optional birth details, and the shared iOS pending budget |

**Read them as questions, not specs.** They are drawn against the shipped token set so the proposals
can be judged at the right altitude, but no candidate here has an approved PRD, a TRD, or content
verification. Devanagari copy in the frames is illustrative — anything liturgical ships
source-verified or not at all, per `RULEBOOK.md` §19–21.
