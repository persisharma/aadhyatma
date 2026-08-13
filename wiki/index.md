# Wiki Index

## Overview
- [[overview]] — Vedansh: offline-first Hindu devotional-text reader (Expo/React Native), stack, module map, content pipeline.

## Reference Docs (in place — not copied into the wiki)
- [`RULEBOOK.md`](../RULEBOOK.md) — integration contract for adding a content section.
- [`design.md`](../design.md) — visual system spec (tokens, type scale, romanization rules).
- [`docs/roadmap/`](../docs/roadmap/) — Q3 2026 roadmap + PRDs 01–07.
- [`docs/superpowers/`](../docs/superpowers/) — deity-icon plan + design spec.

## Subsystems
- [[readers]] — per-text paged `FlatList` reader screens; chapter auto-advance contract.
- [[routine]] — Daily Routine (नित्य साधना): daily/weekday schedules, vaar deity suggestions, derived completion, home banner + celebration.
- [[panchang]] — Panchang tab: Hindu-calendar engine, festival/vrat observances, Daily Muhurat, Kundali, deterministic Daily Rashifal, and private IST-only Guna Milan.
- [[japam-alarms]] — Japam Alarms: repeat-days, one-time, and skip-next; native AlarmKit/AlarmManager tier with expo fallback.
- [[audio]] — the three sound sources (recorded library, japam loop, read-aloud TTS), the playback arbiter that keeps them mutually exclusive, and the expo-speech platform traps.
- [[notifications]] — local notifications: the four families (daily verse, vrat, festive, japam), the pure-planner + glue + headless-scheduler shape, the shared iOS pending budget, and notification-tap deep links.
- [[home-widgets]] — cross-platform Home/Lock Screen widgets: versioned 14-day IST snapshot, atomic native bridges, generated extension/provider wiring, gallery, and exact deep links.
- [[puja-vidhi]] — festival-linked guided puja: occurrence-scoped preparation checklist, swipe-only conduct cards, private provenance, and shipped-text hand-offs.

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
