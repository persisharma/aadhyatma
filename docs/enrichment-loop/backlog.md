# Enrichment Loop — Ledger

State for the `/enrich` loop. Each run reads this, picks one pending enrichment,
and (after approval) moves it to the Shipped log. **Never re-propose a shipped item.**

Priority follows `docs/roadmap/2026-Q3-roadmap.md` §4–6. All items obey the
bundle-only constraint (no backend / CDN / cloud sync / streaming / server analytics).

---

## Candidate registry (pending)

Each feature lists pending enrichments as thin, one-PR slices. Pick the topmost
unshipped slice of the highest-priority feature unless `$ARGUMENTS` or the user steers otherwise.

### PRD-01 — Daily notifications (Habit · Wave: Jul · priority 1)
- [ ] Local daily-verse notification scheduler (on-device, one verse/day)
- [ ] Notification opt-in modal + persisted opt-in flag
- [ ] Festival reminder scheduling off the bundled Panchang calendar
- [ ] Deep-link from notification tap → verse via `entryRoutes`

### PRD-06 — Foundation hardening (Reliability · continuous · priority 1)
- [ ] Add smoke tests for remaining untested readers (Aarti, DurgaStotram, GaneshStotram, HanumanAshtak, RamStuti, Ramcharitmanas, Sundarkand, VishnuSahasranama)
- [ ] Wire `npm run test:readers` into CI (block merge on red for PRs touching `mobile/src`)
- [ ] Buffered on-device crash log (no Sentry; user-initiated share-sheet send)
- [ ] On-device backup export (bookmarks + progress → JSON via share sheet)
- [ ] On-device backup import (verified by uninstall → reinstall → import)

### PRD-02 — Verse audio (Habit · Wave: Jul–Aug · priority 2)
- [ ] Per-verse audio playback control on the chalisa reader (Hanuman pilot)
- [ ] Audio asset registry + per-verse mapping in `src/data`
- [ ] Playthrough local counter

### PRD-03 — Global search (Discovery · Wave: Aug · priority 3)
- [ ] Search screen shell + route registration
- [ ] Runtime-built, memoized search index over bundled data (build on first search)
- [ ] Result rows with deep-link into the right reader page

### PRD-04 — Reading comfort (Habit · Wave: Aug–Sep · priority 3)
- [ ] Font-scale control persisted in AsyncStorage
- [ ] Dark-mode token audit of `theme/colors.ts` (gate before any screen change)
- [ ] Dark mode behind a setting, default "system"
- [ ] Sleep timer

### PRD-05 — Share verse card (Growth · Wave: Sep · priority 4)
- [ ] Parchment share-card render of a verse (image)
- [ ] Share affordance reachable from any reader page

---

## Shipped log

Delivered enrichments. Append newest at top: `date · feature · enrichment · commit/PR`.

- 2026-06-25 · PRD-06 Foundation hardening · ShivaStrotamReaderScreen smoke test (`ShivaStrotamReaderScreen.test.tsx`, mounts ch.1, asserts title + first verse render) · run 2 · autorun
- 2026-06-25 · PRD-06 Foundation hardening · ChalisaReaderScreen smoke test (`ChalisaReaderScreen.test.tsx`, mounts hanuman-chalisa ch.1, asserts title + first verse line render) · run 1

---

## Autorun log

Notes from autonomous (`/enrich-auto`) runs that deferred or reverted instead of
shipping. Newest at top: `date · reason`.

_(none yet)_
