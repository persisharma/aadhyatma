# Vedansh — Roadmap & PRDs

This folder holds the product roadmap and PRDs for upcoming releases.

## Current quarter

- [**Q3 2026 Roadmap**](./2026-Q3-roadmap.md) — Jul–Sep 2026

## Next quarter — Q4 2026 (Oct–Dec)

- [**Q4 2026 Roadmap**](./2026-Q4-roadmap.md) — authored 3 Sep 2026 against app 1.5.0. §1 is a full
  review of every shipped feature by domain; §2 audits where the app still loses or misleads a loyal
  user; §3 is the slate. Five PRDs, one store release (1.6.0, live before Dhanteras):

  | ID | Title | Solves | Ships as |
  |---|---|---|---|
  | [PRD-42](./prds/42-sanchay-backup-restore.md) | **संचय · Backup & Restore** — registry over every user-state key, one exporter, one importer with preview; absorbs PRD-29's export, supersedes PRD-06's backup third | ~40 keys of practice, people and family record die with the phone | Store 1.6.0 (`expo-document-picker`) |
  | [PRD-28](./prds/28-parv-arc-festival-arcs.md) | **पर्व-अर्क · Festival arcs** — sthapana → visarjan over existing rules, family-chosen duration, arc strip + Today chip; Navratri, Diwali-5, Chhath-4, Dev Uthani → Tulsi Vivah | "what do we do today, what is left" in the densest festival quarter | OTA, two drops (9 Oct · 1 Nov) |
  | [PRD-26](./prds/26-kanthastha-memorization.md) | **कण्ठस्थ · अभ्यास mode** — akshara-wise masking on every reader, self-marked recall, spaced review, audio-cue via read-aloud, `RoutineItemKind: 'memorize'` | no way to check you know a verse | OTA |
  | [PRD-04 P2](./prds/04-reading-comfort-phase2-dark-sleep.md) | **रात्रि पाठ · Dark theme + sleep timer** — completes PRD-04 | pre-dawn and evening use on a bright parchment; audio that never stops | OTA (System option rides 1.6.0) |
  | [PRD-43](./prds/43-pravasi-world-locations.md) | **प्रवासी · Vedansh beyond India** — P0 honest outside-India state, P1 world-city tier with IANA zones and zone-aware civil days; P2 (Q1 2027) birth abroad + widgets | every user outside India is silently served an Indian location | P0/P1 OTA · P2 store |

  Reserved by the roadmap: **PRD-44** सङ्कल्प composer (round 1's candidate, re-numbered — 20 was taken
  by the horoscope work), **PRD-45** more reading scripts (Telugu · Bengali · Odia · Malayalam via the
  gu/kn pipeline). Both Q1 2027.

## Q4 flagship (built)

- [**PRD-41 — जिज्ञासा · Ask Vedansh**](./prds/41-jijnasa-ask-vedansh.md) — **Q4 2026 flagship; Phases 0–3 built 2026-09-02 (§14 build record).** Numbered 41 because 25 stays reserved for सन्ध्या वन्दन (round 1 §3), 26–29 are round-2 reservations, 30 is retired and 31–40 are the 2027 feature bets.
  An on-device, deterministic answer engine over the engines the app already ships, so the computed
  half of the product (panchang, muhurat, vrat, bhog, vidhi, vastu, kundali, theerth) becomes
  askable in one line — and every future feature is discoverable on the day it ships. Companion
  build for the quarter: PRD-20 सङ्कल्प.
- [**Q4 2026 Candidates**](./2026-Q4-candidates.md) — household-practice gap analysis and the next five
  proposed features (PRD-20 … PRD-24, numbers reserved). PRD-23 and PRD-24 shipped in Aug 2026;
  PRD-41 §10 records where 20/21/22 sit against the flagship. Read this for what is *missing*; the
  table below is the Q3 slate only and has not tracked PRDs 07–19.
- [**Q4 2026 Candidates, Round 2**](./2026-Q4-candidates-round-2.md) — a second slate (PRD-26 … PRD-29,
  numbers reserved) filtered so that nothing shipped, PRD-owned, or already rejected can appear:
  memorization/recall, the muhurat engine's missing auspicious yogas, festival arcs
  (sthapana → visarjan), and the family lineage record with living janma tithis. Each has a
  prototype. **PRD-30** (household roster) was proposed and dropped by product decision — round 2 §3.4;
  its number is retired. **PRD-25 stays reserved** for सन्ध्या वन्दन per round 1 §3.
- [**Round 2 session prompts**](./round-2-session-prompts.md) — a self-contained build prompt per
  candidate (PRD-26 … PRD-29), one branch each, for running the four as independent sessions.
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
