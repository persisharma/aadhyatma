# Vedansh — Q3 2026 Roadmap

**Plan window:** 1 Jul 2026 – 30 Sep 2026 (13 weeks)
**Authored:** 15 May 2026
**Owner:** Product (PM)
**Current shipped version:** 1.3.0 (build 11, iOS App Store)

---

## 1. Where the product is today

Vedansh ships 20+ active content sections (4 chalisas, 5 stotrams, 3 granths, 1 japam group with N mantras, 7 aartis) under a parchment-first reader with bilingual Hindi/English toggle. Anchor experiences in production:

- Home: 5 categories + "By Deity" index (6 deities), category cards filter automatically off `library` data.
- Reader shell: horizontal paginated verse pages, ornament divider, per-verse deterministic background image, language toggle, swipe-left to previous chapter, auto-advance on last verse, resume/start-over sheet.
- Japam: bead counter (108-bead mala) with optional audio playback that auto-increments beads.
- Personal: Bookmarks (Wishlist) and Sadhak Profile with lifetime/monthly/daily totals + current streak.
- Daily Bhakti: one random verse per session from a unified verse pool.

What is **not** in production yet (gap inventory):

| Area | Gap | Evidence |
|---|---|---|
| Engagement | No notifications. Daily Bhakti only refreshes when the user opens the tab. | `mobile/package.json` has no `expo-notifications`. |
| Audio | Verse-level recitation (chalisa/aarti) is missing — only japam mantras have audio. | `mobile/assets/japam-audio/` exists; no per-verse audio. |
| Discovery | No search. ~3 500+ verses are reachable only by drill-down. | No search screen / index in `mobile/src/screens/`. |
| Comfort | No dark mode, no font-size control, no sleep timer. | README §Roadmap lists dark mode as deferred. |
| Sharing | No way to share a verse outside the app — high-intent moment lost. | No `expo-sharing` or `react-native-view-shot` deps. |
| Reliability | RULEBOOK §4.10 requires `<Pascal>ReaderScreen.test.tsx` per section; the `__tests__` directory is empty. No crash analytics. | `find mobile/src/screens/__tests__` returns nothing. |
| Sync | Bookmarks and progress are device-local; uninstall loses sadhana history. | `BookmarksContext`, `ReadingProgressContext`, `UserActivityContext` all use `AsyncStorage` only. |

These gaps frame the quarter's themes.

---

## 2. Strategic themes for Q3 2026

Three themes, ranked by user impact × strategic leverage:

1. **Build a daily habit loop.** A devotional app's north-star metric is consecutive-day return rate, not session length. Notifications + festival anchoring + verse audio together convert "opens during a puja" into "opens every morning."
2. **Make the library searchable.** As the catalog crossed ~20 sections, drill-down is no longer enough. Users coming with a phrase ("कर्मण्येवाधिकारस्ते") cannot find it. Search unlocks the back-catalog without new content.
3. **Earn permission for the next 6 months.** Ship the test/observability foundation that PR #31 (Balkand crash) exposed, so the next quarter can move faster without re-litigating reliability. Backups (light cloud sync) protect the streak data the Sadhak Profile makes meaningful.

Themes **explicitly deferred** to Q4 2026: full dark mode, account login, Android-store launch, in-app purchases, FCM personalization, multi-language (Telugu / Tamil / Marathi).

---

## 3. North-star & success metrics

**North-star:** D30 / D7 return rate of users who completed onboarding.

| Metric | Today (est.) | Q3 target |
|---|---|---|
| D7 return | ~28% (no analytics — baseline TBD week 1) | 38% |
| D30 return | ~14% (estimated) | 22% |
| Median weekly active days/user | 1.8 | 3.0 |
| Notification opt-in rate (new) | n/a | ≥ 55% |
| Search adoption (% WAU who search at least once) | n/a | ≥ 35% |
| Verse-audio playthrough rate (chalisa pilot) | n/a | ≥ 40% |
| Crash-free sessions (iOS) | unknown | ≥ 99.5% |

Baseline collection (Sentry + an opt-in lightweight event log) ships in week 1 of the quarter as part of PRD-06.

---

## 4. Quarter at a glance

Six PRDs land in three thematic waves. Detailed PRDs in `docs/roadmap/prds/`.

| ID | Title | Theme | Sized | Wave |
|---|---|---|---|---|
| [PRD-01](./prds/01-daily-notifications.md) | Daily Bhakti notifications & festival reminders | Habit | M (4 wk) | Jul |
| [PRD-02](./prds/02-verse-audio.md) | Verse audio for chalisas & aartis (pilot → full) | Habit | L (6 wk) | Jul–Aug |
| [PRD-03](./prds/03-search.md) | Global library search | Discovery | M (3 wk) | Aug |
| [PRD-04](./prds/04-reading-comfort.md) | Reading comfort pack (font scale, dark mode, sleep timer) | Habit | M (4 wk) | Aug–Sep |
| [PRD-05](./prds/05-share-verse-card.md) | Share verse as parchment card | Habit / Growth | S (2 wk) | Sep |
| [PRD-06](./prds/06-foundation-hardening.md) | Test foundation, crash analytics, cloud-lite backup | Reliability | L (parallel, 8 wk) | Jul–Sep |

PRD-06 runs as a continuous track across the quarter and lands as a sequence of PRs rather than a single release.

---

## 5. Timeline

```
        Jul 2026                Aug 2026                Sep 2026
Week    27 28 29 30 31 32 33 34 35 36 37 38 39
        ─────────────────────────────────────────
PRD-01  ████████████              (ship 1.4.0 — Notifications)
PRD-02     ████████████████████████   (ship 1.5.0 — Audio: chalisas)
PRD-03              ████████████      (ship 1.6.0 — Search)
PRD-04                    ████████████ (ship 1.7.0 — Comfort)
PRD-05                          ██████ (ship 1.7.1 — Share card)
PRD-06  ██████████████████████████████ (continuous; ship as PRs)
        ─────────────────────────────────────────
Release v1.4    v1.5            v1.6 v1.7 v1.7.1
```

**Release cadence:** one **App Store** version every 3-4 weeks (4 releases this quarter). Bug-fix OTA via `expo-updates` between store releases (capability already in the dependency tree; surface scripts in PRD-06).

---

## 6. Sequencing rationale

- **Notifications first** because every other engagement feature compounds off it. Once a user opts in, every subsequent shipment has a free distribution surface.
- **Audio second, not first**, because audio is heavy (asset pipeline, file sizes, licensing of public-domain recitations) and benefits from notifications being live to drive playback.
- **Search after audio** because audio gives us a reason to deep-link from notifications and search queries (e.g. "हनुमान चालीसा" → results include "play audio" affordance).
- **Comfort pack late** because dark mode requires a token-level audit of `mobile/src/theme/colors.ts` (currently light only); doing it after notifications/audio prevents a costly merge with those changes.
- **Share card last** because it's small (~2 weeks), low-risk, and benefits from being launched on top of a fuller catalog of finished features (users have more to share by Sep).
- **Foundation track in parallel** so that the team isn't blocked on a "infra month" — each new feature lands its own tests and the harness grows organically.

---

## 7. Risks & open decisions

| Risk | Likelihood | Mitigation |
|---|---|---|
| Audio recitation licensing / quality | Medium | Use creative-commons / commissioned recitations of Hanuman Chalisa as the pilot; gate PRD-02 expansion on legal sign-off (see PRD-02 §Open Questions). |
| Notification fatigue / opt-out spiral | Medium | Cap to 1 daily verse + opt-in festival reminders. Quiet-hours default (see PRD-01). |
| Search index size hurts cold-start | Low | Build the index at runtime once on first search (memoized), not at app boot. |
| Dark mode regression across 18 reader screens | Medium | Token-only audit gate before any screen changes; ship behind a feature flag for 1 release. |
| SDK 55 upgrade required by App Store before quarter ends | Low–Medium | Track Expo's release calendar; reserve 1 week in week 36 buffer. |
| No Android user feedback because we have no Play Store release | High | Treat Android Play Store launch as a Q4 item; do not block Q3 features on Play submission. |

**Open decisions (need user input):**

1. Are we committing to an Android Play Store launch in this quarter, or treating Q3 as iOS-only?
2. Audio: do we commission recitations or license public-domain recordings? Budget implication.
3. Do we want lightweight anonymous cloud backup (PRD-06) in Q3, or wait until accounts ship in Q4?
4. App-name decision: the codebase says "Vedansh" but `RULEBOOK.md` and the umbrella repo say "Aadhyatma." Pick one before any marketing artifact (notifications text, share-card branding) goes live.

These four are surfaced in this doc so they get answered in a planning review, not discovered mid-sprint.

---

## 8. What is explicitly **not** in scope

To prevent scope creep, these are off the table for Q3:

- User accounts / login (Q4).
- Multi-language support beyond Hindi/English (Q4+).
- In-app purchases / donations (TBD, separate brief).
- New content sections beyond bug-fix data corrections. The 20+ existing sections are enough to validate the new engagement surfaces; adding more parallel to feature work re-creates the PR #31 risk.
- A redesign of the parchment system. The design language is working; iterate, don't rebuild.
- Web app / responsive web. The umbrella repo's `design-preview.html` is a mockup, not a target.

---

## 9. Definition of done — quarterly

At the end of Q3 2026 the product is considered to have delivered if:

1. v1.4.0, v1.5.0, v1.6.0, v1.7.0 are live on the iOS App Store (v1.7.1 stretch).
2. Notification opt-in rate ≥ 55% on new installs, with daily-verse delivery confirmed end-to-end.
3. At least Hanuman Chalisa and Sundarkand have working verse audio.
4. Global search returns results across all active sections within 200 ms perceived latency.
5. Dark mode ships behind a setting toggle, defaults to "system."
6. Every reader screen has a smoke test per RULEBOOK §4.10. Sentry is wired in production.
7. The "share verse as parchment card" surface is reachable from any reader page.
8. Quarterly retrospective happens in week 39 with metrics-against-targets table populated.
