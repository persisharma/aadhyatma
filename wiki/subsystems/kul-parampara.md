---
title: कुल परम्परा — Janma Tithi & the Family Record
type: subsystem
sources: [mobile/src/panchang/janmaTithi.ts, mobile/src/panchang/janmaTithiPrefs.ts, mobile/src/panchang/useJanmaTithi.ts, mobile/src/panchang/kulParampara.ts, mobile/src/panchang/kulParamparaStore.ts, mobile/src/panchang/kulParamparaShare.ts, mobile/src/panchang/pitruSmaran.ts, mobile/src/components/JanmaTithiDayChip.tsx, mobile/src/components/JanmaTithiReminderScheduler.tsx, mobile/src/notifications/janmaTithiReminderPure.ts, mobile/src/notifications/janmaTithiScheduler.ts, mobile/src/screens/JanmaTithiListScreen.tsx, mobile/src/screens/JanmaTithiDetailScreen.tsx, mobile/src/screens/KulParamparaScreen.tsx, mobile/src/screens/KulParamparaEditScreen.tsx, mobile/src/screens/KulParamparaExportScreen.tsx, mobile/src/screens/MoreScreen.tsx, mobile/src/components/TodayStrip.tsx, mobile/src/navigation/MoreStackNavigator.tsx, docs/roadmap/prds/29-kul-parampara.md, mobile/.maestro/kul-parampara-smoke.yaml]
last_verified_date: 2026-09-02
confidence: high
status: current
---

## Summary

PRD-29 (design.md §70): the record-keeping inverse of Pitru Smaran — the tithis of the LIVING plus
the one private family record. Part A surfaces every Kundali roster person's **जन्म तिथि** (list +
detail in the More stack, a Home Today chip on the day, one opt-in eve reminder) with ZERO new
engine work. Part B is the **कुल परम्परा** record — kuldevta/kuldevi from the deity registry,
family temple linked into the Theerth registry with free text first-class, gotra, a kul vrat linked
to a real `ObservanceRule` so it dates itself, notes — plus a device-controlled JSON export via the
OS share sheet. Stance, structural: every field is chosen, never inferred (no gotra→kuldevta
mapping exists in the binary, no caste/community classification); the birthday is devotional, never
social (no greeting card, no share prompt, no age arithmetic).

## Details

**Engine (all reused).** `janmaTithi.ts` derives the rule via `deriveTithiRuleFromDate` over the
profile's birth date — the SUNRISE tithi of the birth civil date (udaya-vyapini, Ujjain/purnimant,
identical to how [[panchang]]'s Pitru Smaran derives a rule from a civil death date; stated in
words on the detail screen). Dates come from `solveNextOccurrence`; day matching goes through
`tithiRuleMatchesDate`, a thin export added to `pitruSmaran.ts`. The janma nakshatra line is the
Moon nakshatra at the IST birth instant via the shared Lahiri `getSiderealPlanetLongitude`.

**Persistence.** Solved occurrences ride the SAME `pitruSmaranSolves` layer (tithi-keyed,
person-free, `PANCHANG_DAY_CACHE_VERSION`-scoped, swept by the derived-cache reset) — a janma tithi
and a shraddha tithi on one rule genuinely share a record. Two new user-data keys, both enumerated
as non-cache keys in `derivedCacheReset.test.ts`:
- `@vedansh:janma-tithi:v1` (`janmaTithiPrefs.ts`) — `{version:1, reminders: Record<personId, true>}`;
  every write prunes ids that left the roster, so a removed person's opt-in dies with their details.
- `@vedansh:kul-parampara:v1` (`kulParamparaStore.ts`) — `{version:1, record: KulRecord}`; ids are
  validated against their registries on parse and degrade FIELD-WISE (a retired temple/rule id
  falls back to the free-text half, never a crash). Both stores follow the `birthProfileStore`
  rules: memoize only a successful read, serialized writes, publish after the write lands.

**Hooks (`useJanmaTithi.ts`).** `useJanmaTithiPeople` (roster × derived rules),
`useJanmaTithiList` / `useJanmaTithiDetailSolve` (warm-first, hydrate-immediately, solve-deferred —
the [[panchang]] three-rule reading discipline verbatim; the detail solve is `useSmaranDetailSolve`
minus the Pitru-Paksha mapping), `useJanmaTithiForDate` (chip matching, interaction-deferred).

**Surfaces.** More hub साधना rows `जन्म तिथि` (`more-janma-tithi`, state `N · soonest`, NEW when
empty) and `कुल परम्परा` (`more-kul-parampara`, state = kuldev name, NEW before a record) →
`JanmaTithiList` / `KulParampara` in the More stack, plus `JanmaTithiDetail {personId}`,
`KulParamparaEdit`, `KulParamparaExport`. `JanmaTithiDayChip` renders first in the Today strip's
chip row beside the Pitru chip (muted gold, never festive saffron). Practice rows on the detail
open ONLY shipped sections via `buildEntryStartTarget` (विष्णु सहस्रनाम + up to two of the saved
kuldev's texts — Part B feeding Part A). Birth details stay Kundali's to edit (RULEBOOK §14.5);
the detail's सम्पादन cross-tabs to the Kundali screen.

**Reminder.** The `janma-tithi-reminder` family — see [[notifications]]. One eve-18:00 notice per
person per year, cap 8 soonest-first, default OFF per person, persisted only after the OS grant.

**Export (`kulParampara.ts` `buildKulParamparaExport` + `kulParamparaShare.ts`).** Versioned
envelope `{format:'vedansh-kul-parampara', version:1, exportedAt, appVersion, kul, people, pitru}`,
display strings denormalized beside ids; written to a cache file and handed to `expo-sharing`. The
export screen lists exactly what leaves the device first. PRD-06's backup path is still unbuilt —
this is the record's own minimal path; import deliberately waits for PRD-06's one importer.

## Dependencies

- [[panchang]] — `deriveTithiRuleFromDate` / `solveNextOccurrence` / `pitruSmaranSolves` (the
  engine and persisted-answer layer this feature deliberately adds nothing to); the Kundali
  birth-profile roster (`useBirthProfileRoster`) is the only person source.
- [[notifications]] — the family shape (pure planner + glue + headless scheduler in `App.tsx`),
  the shared OS grant, the iOS pending budget.
- `data/deities.ts` (21-deity registry), `data/theerth/temples.ts` (73 temples),
  `panchang/festivals.ts` (`OBSERVANCE_RULES` for the kul vrat link).

## Gotchas

- **Match the living with `tithiRuleMatchesDate`, never `entryMatchesDate`** — the latter also
  fires on the rule's mapped shraddha day inside the Pitru-Paksha fortnight, which is correct for
  the dead and wrong for a birthday. Pinned in `janmaTithi.test.ts`.
- **The birth-profile roster schema is untouched, deliberately.** Reminder opt-ins live in the
  sibling key, NOT on `@vedansh:kundali-profiles:v1` — the roster parser is a strict allow-list
  that drops unknown fields, and the one roster migration belongs to the sankalp PRD (round 1's
  gotra owner; the landed PRD-20 personal-horoscope is unrelated). Gotra lives family-level in the
  kul record; a future sankalp PRD should read it from there first.
- **Launch-graph discipline:** the More stack is EAGER, so these screens must not import
  `vratCatalog` (it drags the ~1.3 MB katha corpus). `kulParamparaStore` reads
  `OBSERVANCE_RULES`/`resolveObservancesForYear` directly (`nextKulVratOccurrence`); rule-id
  validation is injected into the pure module for the same reason. `temples.ts` is already on the
  launch graph (NewContentContext), so importing it added nothing.
- **Customer copy must not say `इस उपकरण पर`/`इस फ़ोन पर`** — `userFacingImplementationCopy.test.ts`
  bans implementation/device phrasing outside the exempted Pitru surfaces; the export screen's
  share-unavailable error tripped it once and was reworded. The intended privacy lock lines use
  `इसी उपकरण पर`/`इसी फ़ोन पर`, which the ban does not cover.
- **The export carries no device ids** — person/entry ids are process-local keys; the envelope test
  asserts they never appear in the JSON. Names, birth details and tithi labels DO leave, by design:
  the user walked to the export screen and pressed share.
- **design.md section number moved twice** (§67 → §69 → §70) as PRD-20 and PRD-27 merged ahead of
  it — cite §70, and expect it to move again if another section lands first in a future round.
- Maestro `kul-parampara-smoke.yaml` is authored + parse-checked; **device run owed** (authoring
  environment had no simulator).
