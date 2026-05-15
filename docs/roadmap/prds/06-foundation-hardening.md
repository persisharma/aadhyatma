# PRD-06 — Foundation Hardening: Tests, Crash Analytics, Cloud-lite Backup

| | |
|---|---|
| **Status** | Proposed |
| **Target release** | Continuous across v1.4 → v1.7 |
| **Window** | Weeks 27–39 (1 Jul – 30 Sep 2026) |
| **T-shirt size** | L (~8 dev-weeks, spread across the quarter) |
| **Owner** | TBA |

---

## 1. Problem

Three foundation gaps are dragging on every shipping decision:

1. **No reader smoke tests.** `RULEBOOK.md` §4.10 mandates a `<Pascal>ReaderScreen.test.tsx` per section. The `mobile/src/screens/__tests__/` directory **does not exist**. PR #31 (Balkand crash) shipped because `tsc` alone doesn't catch field-shape drift after a cast. Every future section is exposed to the same risk.
2. **No crash analytics.** We can't tell if v1.3.0 is stable in the wild. Crash rate, OS distribution, route at crash — all unknown. App Store crash dashboard is too low-resolution to act on.
3. **No backup.** `BookmarksContext`, `ReadingProgressContext`, `UserActivityContext` all live in `AsyncStorage`. An app uninstall / device migration wipes the streak data that the Sadhak Profile makes meaningful. Worse: users **don't know** their data is fragile, so the loss is silent.

These aren't features users see, but every one of PRD-01 through PRD-05 leans on them.

## 2. Goal

By end of Q3 2026:

- 100% of `*ReaderScreen` files have a co-located smoke test that mounts the screen with the chapter-1 fixture.
- Sentry (or equivalent) in production with a populated dashboard: crash-free sessions, top-5 crash groups, top-5 perf transactions.
- Anonymous, opt-out, device-bound backup of bookmarks + reading progress + sadhak activity to a key-value cloud bucket. Restore on reinstall via a short recovery code.
- EAS OTA pipeline scripted so that bug-fixes between store releases take < 10 minutes from merge to user.

## 3. Non-goals

- Full user accounts. The backup is anonymous and device-bound; auth is a Q4 project.
- A custom analytics product. We use Sentry's built-in feature flagging / breadcrumbs for product events; no separate PostHog / Amplitude installation unless the metric set demands it.
- 100% test coverage. The goal is meaningful smoke-test coverage on the user-visible critical path, not a coverage percentage chase.

## 4. User-visible behavior (for the cloud-lite backup track)

> When I uninstall and reinstall Vedansh, the app asks: "Restore from a previous device? Enter your 6-digit recovery code." If I have one (shown in More → Backup), my bookmarks and streak come back.

> If I never set up backup, nothing changes. The app behaves like today.

> I can turn backup off at any time, which deletes the cloud copy within 24 hours.

## 5. Scope

### Track A — Reader smoke tests (weeks 27–30)

1. Add Jest + React Native Testing Library to `mobile/`. Configure `jest.config.js`, `jest.setup.ts`, `@testing-library/react-native`.
2. For each existing reader screen, scaffold `mobile/src/screens/__tests__/<Pascal>ReaderScreen.test.tsx`:
   - Mounts the screen with the chapter-1 / first-verse fixture from its data module.
   - Asserts the first verse text renders (Devanagari).
   - Asserts the language toggle button is present and pressable.
   - For chapter-based readers, asserts pager dot count matches verse count.
3. Wire tests into CI (GitHub Actions). Block merge on red CI for any PR touching `mobile/src`.
4. Update `RULEBOOK.md §4.10` to reflect the harness is live.

### Track B — Crash analytics & telemetry (weeks 28–31)

1. Add `@sentry/react-native`. Configure in `mobile/App.tsx`. DSN injected from EAS env (never committed to repo).
2. Wrap navigation in `Sentry.ReactNavigationInstrumentation` for automatic transaction tracing.
3. Define a single `analytics` module (`mobile/src/utils/analytics.ts`) wrapping Sentry breadcrumbs + custom events. **All telemetry from PRD-01 → PRD-05 goes through this module** so we can swap providers later.
4. Define an event whitelist (no free-form strings). Initial set:
   - `notif_opt_in`, `notif_opened`, `notif_scheduled_failed`
   - `audio_play`, `audio_complete`, `audio_seek`, `audio_error`
   - `search_query`, `search_tap`
   - `theme_change`, `font_scale_change`, `sleep_timer_set`
   - `share_initiated`, `share_completed`, `share_failed`
   - `bookmark_added`, `bookmark_removed`
   - `app_open`, `app_open_from_notif`
5. Privacy: no PII / no user-input text in events. Query *length* yes, query *text* no. Document this in `docs/roadmap/prds/06-foundation-hardening.md` (this file).
6. Publish a Sentry dashboard with: crash-free sessions, top-5 crash groups, p95 reader cold-start.

### Track C — Cloud-lite backup (weeks 30–37)

1. Choose a key-value cloud store with anonymous writes: **recommended: Cloudflare Workers KV** behind a thin Worker that gates write rate per-IP and per-key. No user identity; no email.
2. Generate a recovery code on first launch and persist locally — `XXXX-XXXX` random alphanumeric. Display in More → Backup with a "Copy to clipboard" CTA.
3. Periodic sync: every 24 h, write the merged state of `bookmarks + readingProgress + userActivity` to `KV[recoveryCode]` as a single gzipped JSON blob. Cap blob size at 256 KB.
4. On a fresh install, More → Backup → "Restore from another device" prompts the user to enter their 6-digit code. Worker fetches blob → app merges into local state (always merge, never overwrite — collision resolution: union of bookmarks, max of activity counts, latest progress timestamp wins).
5. Privacy posture (must appear in the help modal): "Backup stores only your bookmarks, progress, and counter totals. No name, no email, no verses you read. You can disable backup any time, which deletes the cloud copy within 24 hours."
6. Server: a thin Cloudflare Worker, ~150 lines of TS. Add `infra/backup-worker/` to the repo with its own deploy script. Source-of-truth is in this repo.

### Track D — EAS OTA pipeline (week 27, one-shot)

1. Add `scripts/release-ota.sh` that runs `eas update --branch production` after a `git tag`.
2. Document in `mobile/README.md` (small section) so anyone can ship a bug-fix without app-store delay.
3. Confirm `expo-updates` runtime config works against the current SDK 54 setup.

## 6. Technical sketch — backup blob shape

```ts
type BackupBlob = {
  version: 1;
  createdAt: string;       // ISO
  recoveryCode: string;
  bookmarks: BookmarkRef[];
  readingProgress: Record<string, { chapterIndex: number; verseIndex: number; updatedAt: string }>;
  userActivity: Record<DateKey, DailyEntry>;
};
```

Merge rules on restore are explicit and unit-tested:

- `bookmarks`: union by `id`. Local wins on duplicate timestamp.
- `readingProgress`: per `sourceId`, latest `updatedAt` wins.
- `userActivity`: per `DateKey`, sum `reads` and max `japa` counters (so re-importing same day twice doesn't double-count).

## 7. Success metrics

| Metric | Source | Target |
|---|---|---|
| `*ReaderScreen` smoke-test coverage | CI report | 100% of active sections |
| Crash-free sessions, iOS | Sentry | ≥ 99.5% |
| % of users with backup enabled | Local + Worker count | ≥ 20% within 30 days |
| Backup restore success rate | Worker logs | ≥ 95% |
| Median time from PR merge to OTA-live | Manual log | < 10 min |

## 8. Risks

| Risk | Mitigation |
|---|---|
| Worker abuse (someone bulk-writing junk to KV) | Per-IP rate limit; per-recovery-code write rate cap (1 write / 5 min); 256 KB cap; alphanumeric code with ≥ 36^8 keyspace. |
| Sentry SDK conflicts with `expo-audio` or other native modules | Pin to the SDK-54-compatible Sentry version; add a smoke test for app cold-start with Sentry enabled. |
| RNTL setup with Expo SDK 54 is flaky | Pre-research in week 27 (1 day); if flaky, swap to Jest + react-test-renderer for smoke tests only. |
| Privacy review of backup posture | Pre-launch external eyes on the help-modal copy and the Worker source. |

## 9. Definition of done

- Every `*ReaderScreen` has a co-located smoke test that runs in CI.
- Sentry shows crash-free sessions ≥ 99.5% for 7 consecutive days in production.
- ≥ 20% of users have backup enabled within 30 days of launch.
- A test "restore from another device" flow completes end-to-end in QA on a fresh simulator.
- `scripts/release-ota.sh` shipped a bug fix in production at least once.

## 10. Open questions

1. Should the recovery code be 6-digit numeric (easier to type) or 8-char alphanumeric (more secure)? Recommend 8-char alphanumeric, displayed as `XXXX-XXXX`. Less collision risk; same UX with a copy button.
2. Do we want a "Backup now" manual trigger or rely solely on the 24-hour periodic sync? Recommend both: periodic + a Settings button.
3. Cloudflare Workers KV is the recommendation, but a Firebase Anonymous Auth + Firestore document is also viable. Lean on Workers KV because the no-account stance benefits from there being no Firebase user object at all — there is literally nothing to leak.
