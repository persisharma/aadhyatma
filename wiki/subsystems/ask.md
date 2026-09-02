---
title: जिज्ञासा · Ask Vedansh (answer engine)
type: subsystem
sources: [mobile/src/ask/types.ts, mobile/src/ask/fold.ts, mobile/src/ask/aliases.ts, mobile/src/ask/lexicon.ts, mobile/src/ask/resolve.ts, mobile/src/ask/intents/index.ts, mobile/src/ask/engine.ts, mobile/src/ask/useAsk.ts, mobile/src/ask/actions.ts, mobile/src/ask/briefing.ts, mobile/src/components/AskAnswerCard.tsx, mobile/src/screens/SearchScreen.tsx, mobile/src/screens/TodayVidhanScreen.tsx, mobile/src/screens/ObservanceDetailScreen.tsx, mobile/src/ask/__tests__/, docs/roadmap/prds/25-jijnasa-ask-vedansh.md]
last_verified_date: 2026-09-02
confidence: high
status: current
---

# जिज्ञासा (Ask Vedansh)

A **deterministic grammar over the engines the app already ships** — no model, no network,
no telemetry — that makes the Search box answer a question (tithi, next Ekadashi, Rahu Kaal,
what to offer Ganesha, which way the mandir faces, a puja's vidhi…) above the library results,
composes the आज का विधान briefing from standing questions, and ends every answer in an action.
Spec: `design.md` §70 · contract: `RULEBOOK.md` §25 · PRD: `docs/roadmap/prds/25-jijnasa-ask-vedansh.md`
(§13 has the mechanism, measured latency, tooling decision) · clickable prototype `docs/jijnasa-ask-prototype.html`.

## Shape

- **`fold.ts`** — Devanagari / IAST / Hinglish → one ASCII key. Abugida inherent vowel, Hindi
  word-final schwa deletion (मंदिर = `mandir`, दिशा = `disha`), anusvara does not suppress the
  vowel, nukta, `aa/ee/oo`, `w→v`, `z→j`, `f→ph`. `stem()` strips honorific tails
  (ganeshji ≡ ganesha ≡ ganesh). `GENERIC_TOKENS` is the specificity-floor stoplist.
- **`lexicon.ts`** — every entity form DERIVED from registries (deities, `OBSERVANCE_RULES`,
  `EVENT_RULES`, `DISHA_LABELS`, vastu rooms, japam mantras, vidhis) + `OBSERVANCE_CLASSES`
  (ekadashi, pradosh, purnima, amavasya, chaturthi, shivaratri, navratri — members by id
  pattern) + `aliases.ts` (the only hand list). Built lazily, cached; ~430 forms.
- **`resolve.ts`** — `tagEntities` (whole-key, long-key prefix, deity head-stem ≥ 5 chars;
  longest key per type wins, so "nirjala ekadashi" beats the class), relative day
  (आज/कल/परसों; "rahu kal" is a Kaal), `scoreIntents` (trigger + 10/required slot + 3/optional;
  **missing required slot = ineligible**; `blockers`), the **stance guard**
  (`DECLINE_LEXEMES` → `kind: 'declined'`), did-you-mean suggestions, `looksLikeQuestion`.
- **`intents/index.ts`** — 13 intents: `panchang.day`, `muhurat.now`, `observance.next`,
  `vrat.how`, `vrat.food`, `katha.find`, `vidhi.how`, `bhog.offer`, `bhog.avoid`, `muhurat.event`,
  `vastu.direction`, `japam.mantra`, `sadhana.progress`. Each calls an existing pure engine
  (`cachedDayInputs` from the shared day store, `getNextOccurrence`, `computeMuhuratDay`,
  `getObservancesForDate`) or a verified-only accessor. `ruleFor(entry, ctx, needs)` picks the
  class member that actually carries the field (`upvasId`/`kathaId`/`bhogId`/`vidhiId`).
- **`engine.ts`** — `askQuestion(q, ctx)`, `warmAsk()`, `askExamples()`. The only module the UI
  loads, and only through `import()`.
- **`useAsk.ts`** — React: lazy engine load + warm on mount; `useAskContextBuilder()` assembles
  `AskContext` from `usePanchangLocation`, `usePanchangCalendarSystem`, `useGitaLanguage`,
  `useSadhanaToday`. **`actions.ts`** — `navigateAskTarget` through `panchangTabTarget` /
  `moreTabTarget` / `navigateToHomeStackTarget`. **`briefing.ts`** — `composeBriefing(ctx)`:
  standing questions (day · observance/upcoming · muhurat · sadhana) through `askQuestion`.
- **UI** — `AskAnswerCard` / `AskAbstainCard`; `SearchScreen` (header of the results list,
  rotating placeholder, `seed`/`initialQuery` route params); `TodayVidhanScreen` (Home stack
  `TodayVidhan`, Home DISCOVER card `jijnasa`); `ObservanceDetailScreen` ask-from-context row.

## Working rules

1. **A new askable feature registers an intent + corpus cases in the same PR** (RULEBOOK §25).
   Entities never get hand-listed — extend `lexicon.ts` from the registry and the coverage test.
2. **Never answer from a draft, never invent.** `resolve` returns `null`; the UI shows the abstain
   card. If you find yourself writing a fallback string in an intent, stop.
3. **Fix false tags in `fold.ts` / `resolve.ts`, not per intent.** The two recorded classes:
   class-vs-instance ("ekadashi" → a specific named one) and over-eager stemming
   ("rahu kaal" → kali, "vrat me kya khaye" → a specific vrat).
4. **Keep the engine off the launch graph.** New UI that needs the engine goes through
   `useAsk` / a dynamic `import()`; `launchPath.test.ts` (which ignores `import type`) is the gate.
5. **Corpus discipline.** `npm run test:ask` — ≥ 85% top-1 and zero wrong; add the *motivating*
   phrasings for an intent, not ones that already pass. Currently 199/199, 18 negatives.

## Gotchas

- **Hindi vs Sanskrit spellings differ after folding** — गृह प्रवेश folds to `grih pravesh`, the
  id/`nameEn` gives `griha pravesh`. Both are in the lexicon, so both scripts match; do not try
  to make `fold` produce one from the other (it would break दिशा/`disha`).
- **A rule may appear twice in `OBSERVANCE_RULES`** (Dev Uthani is a festival and an Ekadashi);
  `lexicon.ts` dedupes by id, and the uniqueness test is per (type, id, key).
- **The stance guard runs before intent resolution** — a question that names a real entity and a
  predictive lexeme ("kal lottery lagegi kya") is declined, not answered.
- **`ruleFor` with `needs`** — for a class, the soonest member may lack the profile (a monthly
  Shivaratri has no `upvasId`); the helper picks the nearest member that has it.
- **Tests run under `tsx --test`, not Jest** (`src/ask/__tests__/*.test.ts`); only the card has a
  Jest suite. The corpus prints its misses — read them, they are next release's aliases.
- **Deferred:** briefing widget variant (native/store release), notification family (iOS pending
  budget decision), voice (native STT → store release, PRD Phase 4).
