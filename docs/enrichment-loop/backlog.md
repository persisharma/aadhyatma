# Enrichment Loop — Backlog (value-ranked queue)

The prioritized queue for `/enrich` and `/enrich-auto`. Each run picks the
**topmost ready item** (highest value), classifies its tier, and routes per
`scope.md`. Tiers: **T0** harden · **T1** enhance · **T2** feature slice · **T3** new feature.

> Verify against source before building — the Q3 roadmap (May) is partly stale.
> **Current focus: quick wins first** (low-effort, high-visibility T1/T2).

---

## Queue (top = next)

### 🥇 Quick wins — lead here

1. **[T1] Font-size control.** Persisted reader text-scale (S/M/L/XL) applied as a
   multiplier over `theme/typography`. Surfaced in More → a small control.
   *Files:* new `FontScaleContext`, `App.tsx` provider, a settings control, reader type consumes it.
   *Slice 1 (ship first):* the context + persistence + a pure `scaleTypography(scale)` util with tests. UI wiring is slice 2.
2. **[T2] Dark-mode toggle.** `ThemeMode` type already exists but only a light
   palette is wired. *Slice 1:* author a `darkColors` palette + contrast test
   (additive, no screen changes). *Slice 2:* make `ThemeProvider` stateful +
   persisted setting, default "system". Ship behind a setting; light stays default.
3. **[T1] Sleep timer** for japam/audio playback (stop after N minutes).
   *Slice 1:* a pure `useSleepTimer` hook + tests. *Slice 2:* control in the japam UI.

### 🥈 Discovery & habit (heavier — T2/T3)

4. **[T3] Global search** (net-new). → write a plan first (`plans/global-search.plan.md`):
   runtime-built memoized index over bundled data, search screen, deep-link results.
5. **[T3] Verse audio** for chalisas/aartis (Hanuman pilot). → plan first; gated on
   the audio-licensing open decision (roadmap §7) — a human call.

### 🥉 Reliability floor (T0 — fallback when nothing above is ready)

6. **[T0] Reader smoke-test coverage** for remaining untested readers
   (Aarti, DurgaStotram, GaneshStotram, HanumanAshtak, RamStuti, Ramcharitmanas,
   Sundarkand, VishnuSahasranama).
7. **[T0] Wire `npm run test:readers` into CI** (block merge on red for PRs touching `mobile/src`).

---

## Already shipped upstream (do NOT re-queue — verified in source)

- Daily notifications + festival reminders — `NotificationPreferencesContext`, `ReminderSettingsScreen` (PRD-01).
- Verse share card — `ShareCard.tsx`, `ShareButton`, `shareVerse` (PRD-05).

---

## Shipped log

Delivered by the loop. Newest at top: `date · tier · feature · enrichment · run · [autorun]`.

- 2026-06-25 · T0 · PRD-06 Foundation · ShivaStrotamReaderScreen smoke test (`ShivaStrotamReaderScreen.test.tsx`) · run 2 · autorun
- 2026-06-25 · T0 · PRD-06 Foundation · ChalisaReaderScreen smoke test (`ChalisaReaderScreen.test.tsx`) · run 1

---

## Autorun log

Notes from autonomous runs that deferred, planned, or reverted instead of shipping.
Newest at top: `date · reason`.

_(none yet)_
