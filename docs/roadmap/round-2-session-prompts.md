# Q4 Round 2 — session start prompts (PRD-31 … PRD-34 — renumbered from 26–29 on 2026-09-01; PRD-26 is the built दान-पुण्य feature)

Four independent build sessions, one per candidate from
[`2026-Q4-candidates-round-2.md`](./2026-Q4-candidates-round-2.md). Each prompt is self-contained:
paste it into a fresh session, no prior context needed.

**Run them on separate branches** — they touch overlapping surfaces (routine types, panchang engine,
observance detail, birth profiles) and will conflict if they share one.

| PRD | Branch | Order |
|---|---|---|
| 31 कण्ठस्थ | `claude/prd-31-kanthasth` | 1st — cheapest, no gates |
| 32 शुभ योग | `claude/prd-32-shubh-yoga` | 2nd — small tables |
| 34 कुल परम्परा | `claude/prd-34-kul-parampara` | 3rd — no content |
| 33 पर्व-अर्क | `claude/prd-33-parv-arc` | **Deadline: Diwali is in Q4** |

Shared context every prompt assumes (repeated inside each so they stand alone): bundle-only (no
backend, CDN, analytics SaaS or cloud sync); `wiki/index.md` first per `.claude/rules/wiki-first-lookup.md`;
`design.md` + `RULEBOOK.md` updated in the same PR per `.claude/rules/design-doc-sync.md`;
`npm run test` + `npm run lint` + a Maestro flow with every change.

---

## PRD-31 — कण्ठस्थ · memorization and recall

```
Work on branch claude/prd-31-kanthasth (create it from main).

Build PRD-31 from docs/roadmap/2026-Q4-candidates-round-2.md §2 (PRD-31). The prototype is
docs/memorize-abhyas-prototype.html — 8 frames, read it first, it is the spec's intent.

The gap: the app has 30+ reader screens and every one only ever SHOWS text. Nothing anywhere
hides it, so there is no way to practise recall. Verified absent: no memoriz/recall/quiz code
in mobile/src. This is the app's cheapest high-value feature — zero sourced content, since
every text is already in the binary.

Start by reading wiki/index.md and the [[readers]], [[routine]] and [[audio]] pages
(.claude/rules/wiki-first-lookup.md is mandatory), then write the PRD at
docs/roadmap/prds/31-memorization-abhyas.md following the house shape of the existing PRDs
(status table, problem, goal, phases, DoD, stance guards). Then build in phases.

Ship:
- memorize/mask.ts — pure. L1 = first word of each line (lightest cue), L2 = first akshara only,
  L3 = fully hidden with line count and metre. Masking is AKSHARA-WISE.
- memorize/mastery.ts — pure per-unit state + spaced-review scheduler. Key @vedansh:memorize:v1.
- An अभ्यास toggle on the existing readers (design.md §9), not a new screen.
- Audio-cue recall reusing the shipped expo-speech read-aloud (readAloud/verseAdapter.ts).
- RoutineItemKind gains 'memorize' — the same one-line move PRD-19 used to add 'vidhi'.

Phase 0 spike FIRST: the akshara splitter. Do NOT use Intl.Segmenter — read the comment above
SINGLE_AKSHARA in mobile/src/data/__tests__/contentCorrectness.test.ts: Indic grapheme clustering
changed in ICU (Unicode 15.1 GB9c) and the segmenter splits conjuncts like ज्यो on older runtimes.
Generalise that hand-rolled matcher into a line splitter and inherit its tests. Also note gu/kn
carry no authored content — they are transliterated from the Devanagari at runtime, so compute the
mask on the source and transliterate after, or offsets drift.

Stance guards (non-negotiable, pin them in a test): mastery is private, never ranked, never shared,
never a percentage or grade. No "you failed", no streak-shaming, no leaderboard. The user marks
their own recall and the app believes them.

Open decision to settle with me: does mastery state export through PRD-06 backup? My
recommendation is yes — it is the one piece of user data that takes months to rebuild.

Gates: npm run test and npm run lint at 0 errors, plus a Maestro flow in mobile/.maestro/ (the
repo's "every change ships with e2e" policy — see the [[e2e-verification]] wiki page). design.md
gets a new section for अभ्यास and updates to §9 and §45 IN THE SAME PR. Jest gotcha: suites that
render a FlatList must unmount their trees, and check $? rather than trusting the summary line.
```

---

## PRD-32 — शुभ योग · the additive half of the muhurat engine

```
Work on branch claude/prd-32-shubh-yoga (create it from main).

Build PRD-32 from docs/roadmap/2026-Q4-candidates-round-2.md §2 (PRD-32). The prototype is
docs/shubh-yoga-prototype.html — 6 frames including the REJECTED alternative; read it first.

The gap: mobile/src/panchang/eventMuhurat.ts defines twelve DoshaKeys and zero yogas, and it reads
the 27 nitya yogas only to extract the two inauspicious ones (yoga.index === 16 → vyatipata,
=== 26 → vaidhriti). The engine is structurally subtractive: it can say what is wrong with a day
and has no vocabulary for what is specially right about one.

Start by reading wiki/index.md and the [[panchang]] page (.claude/rules/wiki-first-lookup.md is
mandatory), then write docs/roadmap/prds/32-shubh-yoga.md plus the convention doc
docs/roadmap/conventions/shubh-yoga-v1.md (match the shape of the four existing convention docs).

Ship:
- panchang/shubhYoga.ts — pure, over primitives PanchangData already carries (nakshatra, vāra,
  tithi). Sarvartha Siddhi and Amrita Siddhi (weekday × nakshatra), Ravi yoga, and the
  Dwipushkar/Tripushkar pair (tithi × weekday × nakshatra).
- A yoga line on the Panchang day card and Daily Muhurat.
- A yoga annotation in the Event Muhurat Finder results (design.md §60), sharing a chip component
  with the existing dosha chips.

Three things to get right:
1. ANNOTATE ONLY in v1. A yoga must not re-rank finder results — an offset retroactively changes
   every ranking the shipped finder has produced. Pin this in the convention doc.
2. TIME FORMATTING. These yogas run nakshatra-to-nakshatra and constantly end after midnight.
   Render every window through the shipped formatEndInstant in panchang/muhuratFormat.ts — a
   12-hour clock plus a short-date suffix when the end lands on a different civil day
   ("2:12 AM, 15 अक्टू"). The printed-panchang extended-hour style (26:12) is used NOWHERE in this
   app and must not be introduced.
3. NAMING COLLISION — solve this in the PRD. The day card already shows a field called योग (one of
   the 27 nitya yogas, a Sun–Moon calculation) and one of those is literally named सिद्धि. A chip
   reading "सर्वार्थ सिद्धि योग" directly beneath a field reading "योग: सिद्धि" is two unrelated
   systems with near-identical names on one card. Decide the labelling before building.

Stance guards: no day-quality score, no percentage, no "luckiest day". A yoga is present or absent
with its window stated. Doshas and yogas coexist on one day and the app never nets them into a
verdict. Round 1 §3 rejected standalone panchak warnings as fear copy — this is the on-brand
inverse, not licence to start scoring days.

Gates: npm run test (its test:engine suite runs TZ=Asia/Kolkata) and npm run lint at 0 errors, a
Maestro flow, design.md §60 extended and RULEBOOK.md gets a §22 rule-table contract following §17's
shape — all in the same PR. Every nakshatra×vāra row is verification-gated like the existing
convention tables; these are printed in every published panchang, so cite two independent sources.
```

---

## PRD-34 — कुल परम्परा · kuldevta and the tithis of the living

```
Work on branch claude/prd-34-kul-parampara (create it from main).

Build PRD-34 from docs/roadmap/2026-Q4-candidates-round-2.md §2 (PRD-34). The prototype is
docs/kul-parampara-prototype.html — 6 frames, read it first.

The gap: the app keeps the tithis of the DEAD with real care (PRD-17 Pitru Smaran) and not one
tithi of the LIVING. Multi-person birth profiles shipped in #294 and hold birth date/time/place for
Kundali only — nothing answers "when is my Hindu birthday this year". And kuldev/lineage appear
nowhere in source outside katha prose.

Start by reading wiki/index.md and the [[panchang]] page (.claude/rules/wiki-first-lookup.md is
mandatory), then write docs/roadmap/prds/34-kul-parampara.md following the house PRD shape.

Ship, in two parts:
A. जन्म तिथि — ZERO new engine work. mobile/src/panchang/pitruSmaran.ts already exports
   deriveTithiRuleFromDate(birthDate) and solveNextOccurrence(rule, fromDate) and already handles
   adhik-masa and the paksha edge cases. Surface this year's date on the profile, on the Home Today
   strip on the day, one reminder in the shipped personal notification family, and the traditional
   practice for the day linking only to sections that already ship.
B. कुल परम्परा record — kuldevta/kuldevi from the shipped deity registry; the family temple linked
   into the 73-temple Theerth registry (data/theerth/temples.ts) with free text as a first-class
   fallback; gotra; the family's kept observance linked to a real vrat rule so it dates itself;
   free-text notes. Export through PRD-06's device-controlled backup path — a lineage record that
   cannot leave the device fails at the one job it has.

Coordinate before touching the schema: `gotra` is PRD-20's field (round 1 candidates doc), and
PRD-21 also wants the birth profile. That is three consumers of one
@vedansh:kundali-birth-profile:v1 migration. Check whether PRD-20 has landed; if not, design the
migration so PRD-20 and PRD-21 can consume it rather than re-migrating. Flag this to me if unclear.

Stance guards: private by default and NEVER inferred — no gotra→kuldevta guessing (do not build the
mapping at all), no caste or community classification, no directory of families, nothing leaves the
device unless the user shares it. Birthday framing stays devotional, not social: round 1 §3
rejected greeting cards and this must stay on that side of the line.

Open decision: does the birthday reminder default on or off? Recommend OFF, opted into per person —
it matches the shipped notification-preferences pattern and keeps the shared iOS pending-notification
budget honest (see the [[notifications]] wiki page).

Gates: npm run test and npm run lint at 0 errors, a Maestro flow, design.md gets a new section plus
an update to §37 (More Hub & Profile), all in the same PR.
```

---

## PRD-33 — पर्व-अर्क · festival arcs, स्थापना → विसर्जन

```
Work on branch claude/prd-33-parv-arc (create it from main).

Build PRD-33 from docs/roadmap/2026-Q4-candidates-round-2.md §2 (PRD-33). The prototype is
docs/parv-arc-prototype.html — 6 frames, read it first.

TIMING MATTERS ON THIS ONE: Diwali falls inside Q4. The Diwali five-day arc either lands before it
or its value defers a full year. Sequence the work so the arc mechanic is shippable early.

The gap: mobile/src/data/vidhi/ ships ganesh-chaturthi-sthapana and navratri-ghatasthapana and NO
visarjan of anything — the app knows how to install a deity and has never once concluded a rite.
mobile/src/panchang/festivals.ts models Diwali's five days as unrelated rules (dhanteras, diwali,
govardhan-puja, bhai-dooj) and ganesh-chaturthi / anant-chaturdashi as strangers.

Start by reading wiki/index.md and the [[panchang]], [[puja-vidhi]] and [[bhog-naivedya]] pages
(.claude/rules/wiki-first-lookup.md is mandatory), then write docs/roadmap/prds/33-parv-arc.md.

Ship, phased so the content gate cannot block the mechanic:
- Phase A (code only, ship first): an arc relation over the rules that ALREADY exist — arcId,
  arcRole ('sthapana' | 'day' | 'visarjan'), ordinal. Purely additive: no rule rewritten, no date
  changed. Plus the sthapana→visarjan solver (the family picks 1½/3/5/7/10 days at installation and
  the app computes THEIR visarjan date and window, and schedules the reminder through a shipped
  notification family), and the arc strip on Observance Detail. The duration choice is
  occurrence-scoped user state — follow the shape data/vidhi/checklistStore.ts and PRD-23's grocery
  checklist already use; do not invent a new storage pattern.
- Phase B (content): visarjan vidhi entries. These are sourced liturgical content and ship
  status: 'verified' or user-invisible, per RULEBOOK §19. PRD-23 established that verification is
  achievable, so schedule it rather than assuming it is blocked.
- Second consumers: the Diwali five-day arc, and Navratri — where the arc should surface PRD-23's
  ALREADY-SHIPPED bhog list and grocery checklist a day before Kanya Pujan, when the shopping
  actually happens. That is new value from content already in the binary.

Stance guard: the duration is the family's decision — regional and household practice vary widely
between 1½ and 10 days. Offer the set, default to NOTHING, never say which is correct. Must degrade
gracefully: a user who never chooses sees today's behaviour (independent days) and is never nagged.

Gates: npm run test and npm run lint at 0 errors, a Maestro flow, design.md §62 and §65 extended and
RULEBOOK.md gains a §22+ content contract for the visarjan vidhi family following §19's shape — all
in the same PR.
```

---

## Notes for whoever runs these

- **None of these four is an approved PRD.** They are candidate sections plus a prototype. Each
  session's first deliverable is the PRD itself; expect the scope to move during that write-up.
- **Nothing here migrates existing user data.** PRD-30 was the slate's only storage migration and it
  was dropped (round 2 §3.4), so all four remaining candidates are additive.
- **OTA vs store release:** all four are pure TypeScript/data and OTA-shippable. If any grows a
  native dependency, that becomes a store release and drags APP_TOUR_VERSION plus a whatsNew entry
  with it — flag it rather than absorbing it.
- **Two test runners:** never add `src/data` tests to Jest; they run under `tsx --test` and Jest's
  testMatch excludes them deliberately.
- **RULEBOOK §22 is claimed twice** above (PRD-32's rule tables and PRD-33's visarjan contract).
  Whichever lands second takes §23 — check the file rather than assuming.
