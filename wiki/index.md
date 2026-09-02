# Wiki Index

## Overview
- [[overview]] — Vedansh: offline-first Hindu devotional-text reader (Expo/React Native), stack, module map, content pipeline.

## Reference Docs (in place — not copied into the wiki)
- [`RULEBOOK.md`](../RULEBOOK.md) — integration contract for adding a content section.
- [`design.md`](../design.md) — visual system spec (tokens, type scale, romanization rules).
- [`docs/roadmap/`](../docs/roadmap/) — Q3 2026 roadmap + PRDs 01–07.
- [`docs/superpowers/`](../docs/superpowers/) — deity-icon plan + design spec.
- [`docs/content-parity/chalisa-aarti-existing-deities.md`](../docs/content-parity/chalisa-aarti-existing-deities.md) — source-candidate manifest for Chalisa/Aarti parity using only existing deity ids.
- [`docs/content-parity/other-content-existing-deities.md`](../docs/content-parity/other-content-existing-deities.md) — full non-Chalisa/Aarti parity benchmark and acquisition waves for the existing deity taxonomy.

## Subsystems
- [[readers]] — per-text paged `FlatList` reader screens; chapter auto-advance contract.
- [[routine]] — Daily Routine (नित्य साधना): daily/weekday schedules, vaar deity suggestions, derived completion, home banner + celebration.
- [[panchang]] — Panchang tab: Hindu-calendar engine, festival/vrat observances, Daily Muhurat, Kundali, deterministic Daily Rashifal, private IST-only Guna Milan, newborn-private Namkaran, and dated one-shot muhurat follows.
- [[japam-alarms]] — Japam Alarms: repeat-days, one-time, and skip-next; native AlarmKit/AlarmManager tier with expo fallback.
- [[audio]] — the three sound sources (recorded library, japam loop, read-aloud TTS), the playback arbiter that keeps them mutually exclusive, and the expo-speech platform traps.
- [[notifications]] — seven local notification families (daily verse, vrat, **muhurat**, festive, personal Pitru Smaran, public Pitru Paksha, japam), the pure-planner + glue + headless-scheduler shape, the shared iOS pending budget, and notification-tap deep links.
- [[home-widgets]] — cross-platform Home/Lock Screen widgets: versioned 14-day IST snapshot, atomic native bridges, generated extension/provider wiring, gallery, and exact deep links.
- [[puja-vidhi]] — festival and personal-tithi household guidance: occurrence-scoped preparation, swipe-only conduct, private provenance, and shipped-text hand-offs.
- [[bhog-naivedya]] — verified offerings, vrat food, prohibited offerings, parana meals, and the Vidhi kitchen-checklist integration.
- [[ask]] — जिज्ञासा · Ask Vedansh: deterministic answer engine over the shipped engines (fold → derived lexicon → intents → answer-or-abstain), answer-first Search, आज का विधान briefing, answers that act.
- [[vastu-disha]] — live 8-dik compass (true-north corrected, honest-accuracy states), room-by-room vastu guidance, and ghar-ka-mandir upkeep; store-release-only (expo-sensors).

## Concepts
- [[languages]] — reading languages hi/en/gu/kn; gu/kn derived at runtime by transliterating the Devanagari; selection + typography helpers.
- [[deity-icons]] — deity avatar glyph system: 21 hand-drawn View-composition glyphs (`deityGlyphs/` total registry), baked palette, 36 dp canvas/scaling contract, no-emoji rule.

## Entities
_(none yet — add per-model pages as they warrant)_

## Integrations
_(none yet — extract from source as needed)_

## Runbooks
- [[e2e-verification]] — Maestro e2e: authoring rules, the isolated-simulator verification recipe (multi-worktree machines), gotchas, and the "every change ships with e2e" policy.

## Decisions
_(none yet)_
