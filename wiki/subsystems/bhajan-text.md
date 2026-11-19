---
title: Bhajan text shelf (भजन संग्रह)
type: subsystem
sources: [mobile/src/data/bhajan/ids.ts, mobile/src/data/bhajan/index.ts, mobile/src/data/bhajan/shelf.ts, mobile/src/screens/BhajanListScreen.tsx, mobile/src/screens/BhajanReaderScreen.tsx, mobile/src/screens/audio/AudioLibraryScreen.tsx, mobile/src/navigation/entryRoutes.ts, mobile/src/navigation/AudioStackNavigator.tsx, mobile/src/data/categories.ts, docs/content-parity/bhajan-library.md, design.md, RULEBOOK.md]
last_verified_date: 2026-11-15
confidence: high
status: current
---

## Summary

Bhajan lyrics with meaning, listed inside the Bhajan (audio) tab rather than on the Home grid.
`bhajan` is a real `ContentCategory`, so search, deity pages, routines, bookmarks, resume and NEW
badges work through the ordinary `library` machinery; only its listing is special. The shelf
shipped as plumbing with an **empty catalog** (15 Nov 2026): no text had cleared RULEBOOK §11/§34
yet, so the Bhajan tab shows no door.

## Details

- **Placement.** `categories.ts` gives `bhajan` `placement: 'bhajan-tab'`; `HomeScreen` skips such
  categories. Every lookup-by-id consumer (DeityDetail grouping, routine chips, hashtags,
  backgrounds) still treats it as a category. design.md §34.1.
- **Registry (four parts, test-pinned).** JSON payload → `bhajanLoaders` thunk (`index.ts`) →
  `bhajanCatalog` `{ id, group }` row (`ids.ts`, launch-safe) → active `library` entry with
  `verseCount`. `bhajanLibrary.test.ts` (node:test, in `test:data`) checks the one-to-one mapping,
  two reference URLs, counts and routes for every shipped row.
- **Groups.** `group` is a deity id or a region (`rajasthani`, `lok-bhajan`; devotional only — secular folk songs were dropped from the backlog on 16 Nov 2026). The shelf orders deity
  groups by `deities.ts`, then regions (`groupBhajanShelf`). Group comes from the catalog row, not
  `deities[0]` — a Karma Bai bhajan can be tagged `krishna` and still shelve as Rajasthani.
- **Routes.** `BhajanStackParamList` (`BhajanList`, `BhajanReader { bhajanId, initialIndex? }`) is
  intersected into Home and Audio param lists and registered on both stacks (RULEBOOK §6.0.1).
  `entryRoutes.ts` routes start/progress/notification/bookmark targets by `bhajanIds`.
- **Reader.** The aarti reader shell keyed by string id; first page shows a plain `रचना` credit;
  a missing payload `goBack()`s. Background = group deity plate via `getSourceBackground` →
  `bhajanGroupOf`; regions keep the diya category plate.
- **Search.** Path A (`lines` + `linesEn`) via `pushBhajan` in `searchIndex.ts`.

## Dependencies

[[audio]] (host tab), [[readers]] (shell), [[languages]] (gu/kn derived from Devanagari),
[[share]] (verse cards, listing share).

## Gotchas

- **Content is the blocker, not code.** The backlog (`docs/content-parity/bhajan-library.md`)
  marks film/modern songs HOLD-© and aarti duplicates DUP. On 15 Nov 2026 the build sandbox's
  network policy rejected every lyrics host (kavitakosh.org, bhaktibharat.com, bhajansandhya.com,
  hi.wikisource.org, hindi.webdunia.com), so no text could be verified; nothing was typed from
  memory (RULEBOOK §11.3).
- The Jest suite (`BhajanShelf.test.tsx`) injects **synthetic** fixtures by mocking
  `@/data/bhajan/ids`, `@/data/bhajan` and `@/data/texts`; use `jest.requireMock` to read the
  mocked library inside a test.
- `.maestro/bhajan-text-smoke.yaml` is guarded on `bhajan-shelf-door` being visible, so it is a
  no-op until the first bhajan ships — re-run it natively then.
- `scripts/gen-route-graph.mts` does not scan `screens/audio/`, so the AudioLibrary → BhajanList
  edge is not in `routeGraph.ts` (ordering-only; harmless).
