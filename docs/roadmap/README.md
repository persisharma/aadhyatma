# Vedansh — Roadmap & PRDs

This folder holds the product roadmap and PRDs for upcoming releases.

## Current quarter

- [**Q3 2026 Roadmap**](./2026-Q3-roadmap.md) — Jul–Sep 2026

## Next

- [**PRD-41 — जिज्ञासा · Ask Vedansh**](./prds/41-jijnasa-ask-vedansh.md) — **Q4 2026 flagship; Phases 0–3 built 2026-09-02 (§14 build record).** Numbered 41 because 25 stays reserved for सन्ध्या वन्दन (round 1 §3), 26–29 are round-2 reservations, 30 is retired and 31–40 are the 2027 feature bets.
  An on-device, deterministic answer engine over the engines the app already ships, so the computed
  half of the product (panchang, muhurat, vrat, bhog, vidhi, vastu, kundali, theerth) becomes
  askable in one line — and every future feature is discoverable on the day it ships. Companion
  build for the quarter: PRD-20 सङ्कल्प.
- [**Q4 2026 Candidates**](./2026-Q4-candidates.md) — household-practice gap analysis and the next five
  proposed features (PRD-20 … PRD-24, numbers reserved). PRD-23 and PRD-24 shipped in Aug 2026;
  PRD-41 §10 records where 20/21/22 sit against the flagship. Read this for what is *missing*; the
  table below is the Q3 slate only and has not tracked PRDs 07–19.
- [**Q4 2026 Candidates, Round 2**](./2026-Q4-candidates-round-2.md) — a second slate (PRD-27 … PRD-29 + PRD-42,
  numbers reserved) filtered so that nothing shipped, PRD-owned, or already rejected can appear:
  memorization/recall, the muhurat engine's missing auspicious yogas, festival arcs
  (sthapana → visarjan), and the family lineage record with living janma tithis. Each has a
  prototype. **PRD-30** (household roster) was proposed and dropped by product decision — round 2 §3.4;
  its number is retired. **PRD-25 stays reserved** for सन्ध्या वन्दन per round 1 §3.
- [**Round 2 session prompts**](./round-2-session-prompts.md) — a self-contained build prompt per
  candidate, one branch each, for running the four as independent sessions. PRD-27 and PRD-29
  shipped in Sep 2026; कण्ठस्थ renumbered PRD-26 → PRD-42 on 2026-09-03 (26 is the built दान-पुण्य).
- [**2027 Feature Bets**](./2027-feature-bets.md) — the strategic slate after Q4 2026: ten bets
  (PRD-41 … PRD-40, numbers reserved) that compound on the bilingual per-verse corpus, with a
  staged backend introduction. Originally drafted as PRD-10 … PRD-19; renumbered to avoid
  collision with the numbers main assigned since.

## PRDs (Q3 2026)

| ID | Title | Target release |
|---|---|---|
| [PRD-01](./prds/01-daily-notifications.md) | Daily Bhakti notifications & festival reminders | v1.4.0 |
| [PRD-02](./prds/02-verse-audio.md) | Verse audio for chalisas & aartis | v1.5.0 |
| [PRD-03](./prds/03-search.md) | Global library search | v1.6.0 |
| [PRD-04](./prds/04-reading-comfort.md) | Reading comfort pack (font scale, dark mode, sleep timer) | v1.7.0 |
| [PRD-05](./prds/05-share-verse-card.md) | Share verse on WhatsApp (image + app link) | v1.7.1 |
| [PRD-06](./prds/06-foundation-hardening.md) | Test foundation, local crash log, on-device backup export/import | continuous |
| [PRD-17](./prds/17-namkaran.md) | Namkaran — traditional namakshar and reviewed name suggestions | gated |

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
