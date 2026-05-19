# Vedansh — Roadmap & PRDs

This folder holds the product roadmap and PRDs for upcoming releases.

## Current quarter

- [**Q3 2026 Roadmap**](./2026-Q3-roadmap.md) — Jul–Sep 2026

## PRDs (Q3 2026)

| ID | Title | Target release | Status |
|---|---|---|---|
| [PRD-01](./prds/01-daily-notifications.md) | Daily Bhakti notifications | v1.4.0 | ✅ Shipped (festivals deferred to Q4) |
| [PRD-02](./prds/02-verse-audio.md) | Verse audio for chalisas & aartis | v1.5.0 | ⏸ On hold (revisit when network is on the table) |
| [PRD-03](./prds/03-search.md) | Global library search | v1.6.0 | ✅ Shipped |
| [PRD-04](./prds/04-reading-comfort.md) | Reading comfort pack | v1.7.0 | ❌ Cut (font scale = UI risk; dark mode kills the parchment aesthetic) |
| [PRD-05](./prds/05-share-verse-card.md) | Share verse on WhatsApp (image + app link) | v1.7.1 | ✅ Shipped |
| [PRD-06](./prds/06-foundation-hardening.md) | Test foundation, local crash log, on-device backup | continuous | ⏳ Continuous |

## PRDs (Q4 2026 — drafting)

Q4 shifts emphasis from engagement plumbing (Q3) to **content as the product**. The unifying theme: turn Vedansh from a *timeless library* into a *daily, time-aware companion*. Panchang is the keystone — every subsequent Q4 PRD routes off the panchang engine.

| ID | Title | Target release | Status |
|---|---|---|---|
| [PRD-07](./prds/07-panchang.md) | Panchang — Today strip + Calendar view | v1.8.0 | 📝 Drafted |
| PRD-08 | Vrat & festival library (vrat-katha, fasting rules, regional variants) | v1.9.0 | TBD |
| PRD-09 | Temple stories (Char Dham + Jyotirlinga + Shakti Peeth) | v1.10.0 | TBD |
| PRD-10 | "आज / Today" home — panchang + today's story + vrat link | v1.10.1 | TBD |

## Constraint

**Every feature ships entirely inside the app binary.** No runtime backend, no remote CDN, no analytics SaaS, no cloud sync. Audio, festival dates, and search indices are bundled. Notifications are scheduled locally. Crash logs and backups are device-controlled (user shares them out via the OS share sheet if they choose).

## Convention

- One PRD per shippable epic. Each PRD owns its own metrics, scope, and DoD.
- Roadmap doc owns sequencing, themes, and the cross-PRD risks.
- After ship, the PRD stays — append a "Postmortem" section with what landed, what slipped, and what we learned.

## Out of scope (Q4+ candidates, but not committed)

- User accounts / login
- Android Play Store launch
- Multi-language UI (Telugu, Tamil, Marathi, Gujarati, Bengali)
- In-app purchases / donations
- Bhagavad Gītā full-length audio
- Lock-screen widgets
- Web app
- Dark mode (decided cut — fights the parchment-manuscript design language)
- Bundled verse audio (decided cut — incompatible with bundle-only at meaningful catalog coverage; revisit if/when network is allowed)
