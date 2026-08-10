# Vedansh — Roadmap & PRDs

This folder holds the product roadmap and PRDs for upcoming releases.

## Current quarter

- [**Q3 2026 Roadmap**](./2026-Q3-roadmap.md) — Jul–Sep 2026

## PRDs (Q3 2026)

| ID | Title | Target release |
|---|---|---|
| [PRD-01](./prds/01-daily-notifications.md) | Daily Bhakti notifications & festival reminders | v1.4.0 |
| [PRD-02](./prds/02-verse-audio.md) | Verse audio for chalisas & aartis | v1.5.0 |
| [PRD-03](./prds/03-search.md) | Global library search | v1.6.0 |
| [PRD-04](./prds/04-reading-comfort.md) | Reading comfort pack (font scale, dark mode, sleep timer) | v1.7.0 |
| [PRD-05](./prds/05-share-verse-card.md) | Share verse on WhatsApp (image + app link) | v1.7.1 |
| [PRD-06](./prds/06-foundation-hardening.md) | Test foundation, local crash log, on-device backup export/import | continuous |

_Later PRDs (07–14) live in [`prds/`](./prds/) alongside these._

## Drafted beyond Q3 (prototype-first)

| ID | Title | Notes |
|---|---|---|
| [PRD-15](./prds/15-home-widgets.md) | Home-screen widgets (verse · panchang · streak) | Native targets; store release only. [Prototype](../widgets-prototype.html) |
| [PRD-16](./prds/16-guna-milan.md) | Guna Milan — 36-guna Ashtakoota matching | Pure JS on the kundali engine; OTA-shippable. [Prototype](../guna-milan-prototype.html) |

## Constraint

**Every feature ships entirely inside the app binary.** No runtime backend, no remote CDN, no analytics SaaS, no cloud sync. Audio, festival dates, and search indices are bundled. Notifications are scheduled locally. Crash logs and backups are device-controlled (user shares them out via the OS share sheet if they choose).

## Convention

- One PRD per shippable epic. Each PRD owns its own metrics, scope, and DoD.
- Roadmap doc owns sequencing, themes, and the cross-PRD risks.
- After ship, the PRD stays — append a "Postmortem" section with what landed, what slipped, and what we learned.

## Out of scope this quarter (Q4+ candidates)

- User accounts / login
- Android Play Store launch
- Multi-language UI (Telugu, Tamil, Marathi, Gujarati, Bengali)
- In-app purchases / donations
- Bhagavad Gītā full-length audio
- Lock-screen widgets
- Web app
