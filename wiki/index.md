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
- [[panchang]] — Panchang tab: Hindu-calendar engine, festival/vrat observances, Daily Muhurat (Choghadiya · Rahu Kaal · Abhijit).
- [[japam-alarms]] — Japam Alarms: repeat-days, one-time, and skip-next; native AlarmKit/AlarmManager tier with expo fallback.

## Concepts
- [[languages]] — reading languages hi/en/gu/kn; gu/kn derived at runtime by transliterating the Devanagari; selection + typography helpers.

## Entities
_(none yet — add per-model pages as they warrant)_

## Integrations
_(none yet — extract from source as needed)_

## Runbooks
_(none yet)_

## Decisions
_(none yet)_
