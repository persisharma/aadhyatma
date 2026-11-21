# Android on low-end phones and slow networks — November 2026

**Trigger.** A review of the app for lower-configuration Android phones and slow connections.
**Scope.** A static audit plus reproducible numbers. No Android device, emulator or Gradle build was available, so nothing here is a reading from a phone. Each figure is labelled **counted** (from the repo), **measured** (on the machine that ran the script; Node/V8, a desktop proxy), **built** (a real `expo export`) or **modelled** (from the code's own constants and the pinned React Native / Fresco sources). Device profiling is a separate, pending check (build checklist U10.1).

The work is split by how it ships:

- **OTA (this document):** findings 1, 3, 4, 5.
- **Store build:** findings 2, 6, 7 — `android-low-end-performance-native-2026-11.md`.

## 1. Findings

| # | Finding | Ships via | Status |
|---|---|---|---|
| 1 | Remote artwork had an 8 s **total** limit and deleted the partial file on failure; kids art and audio had no resume. | OTA | Fixed |
| 2 | The JS bundle carries 43 MB of JSON; every OTA re-downloads all of it. | Store build | Native PR |
| 3 | Painted icons (256–512 px) were decoded whole for 22–96 dp tiles. | OTA | Fixed |
| 4 | Every cold start warmed every lazy screen and built the whole search index. | OTA | Fixed for constrained phones |
| 5 | Ten notification families each re-read, cancelled and re-scheduled everything on every launch and every return to the foreground. | OTA | Fixed |
| 6 | Fifteen fonts load at runtime behind the launch gate. | Store build | Native PR (see §4 for the OTA half that was dropped) |
| 7 | No R8 / resource shrinking. | Store build | Native PR |

## 2. What changed, and the numbers

### 2.1 Artwork downloads (finding 1) — **modelled**

`utils/resumableDownload.ts` replaces the transfer in both caches.

- **Stall, not duration.** `backgroundAssetCache` abandons a download when no byte arrives for 8 s, not after 8 s in total. An offline phone still settles to its fallback after 8 s. One attempt holds a slot for at most 2 minutes.
- **Resume on Android.** An interrupted attempt (stall, ceiling, viewer leaving, network drop) keeps its bytes; the next request sends `Range`. iOS restarts.
- **`assetCache`** (kids stories, comics, audio) uses the same transfer with no ceiling and a stall limit of 15 s on Android, 60 s on iOS (see §6).
- A completed download is stored even if its last viewer has just left.

How many files could **never** finish before, at a steady link speed with 1.5 s of connection setup (`scripts/perf-report.mts`):

| Artwork set (files) | Median / largest | 2G EDGE, 15 KB/s | Weak 3G, 40 KB/s | Slow 4G, 150 KB/s |
|---|---|---|---|---|
| Reading backgrounds (40) | 167 / 279 KB | 37 of 40 | 1 of 40 | 0 |
| Reader illustrations (60) | 116 / 272 KB | 52 of 60 | 1 of 60 | 0 |
| Puja vidhi steps (69) | 334 / 513 KB | 69 of 69 | 59 of 69 | 0 |
| Festival heroes (10) | 534 / 630 KB | 10 of 10 | 10 of 10 | 0 |
| Daily Bhakti frames (30) | 256 / 535 KB | 30 of 30 | 10 of 30 | 0 |
| Suvichar masters (58) | 545 / 723 KB | 58 of 58 | 58 of 58 | 0 |
| **All (267)** | | **256 of 267** | **139 of 267** | **0** |

After the change that column is 0 on every row, on both platforms. Each failed visit before re-spent about 98 KB (EDGE) or 260 KB (weak 3G) of the reader's data and kept nothing. The largest file now arrives in 50 s on EDGE and 20 s on weak 3G.

### 2.2 Painted-icon bitmaps (finding 3) — **modelled**

`PAINTED_ICON_DECODE` (`resizeMethod="resize"`, `resizeMultiplier={1.5}`) on `StoryIcon`, `MoreIcon`, `FeatureIcon`, `KundaliArtwork`, the `CelestialGlyph` sun, the Shubh Yoga star and the Explore sheet thumbs.

Bitmap memory for the 30 painted icons Home mounts (16 category tiles at 62.7 dp, 9 spotlights at 32 dp, 3 tab icons, 2 today-row icons):

| Screen density | Before | After | Saved |
|---|---|---|---|
| hdpi 1.5x | 31.5 MB | 1.8 MB | 94% |
| xhdpi 2x (720p HD+) | 31.5 MB | 5.1 MB | 84% |
| 2.625x (1080p) | 31.5 MB | 5.1 MB | 84% |
| xxhdpi 3x | 31.5 MB | 6.9 MB | 78% |

The model is `utils/androidImageDecode.ts`, written from React Native 0.81.5 (`ReactImageView.shouldResize`, `FrescoModule` → `DownsampleMode.AUTO`) and Fresco 3.6 (`DecodeProducer`, `DownsampleUtil`). The multiplier of 1.5 is what guarantees the decoded bitmap is never smaller than the view, so no icon is upscaled; `paintedIconDecode.test.tsx` asserts that for every drawn size × density in use. Exported share cards do not render these components, and the same test pins that.

### 2.3 Background warm-up (finding 4) — **counted** and **measured**

`utils/devicePace.ts` times this launch's own bundle evaluation. At or above 800 ms the phone is treated as constrained for that launch.

| | Ordinary phone (unchanged) | Constrained phone |
|---|---|---|
| Screen modules warmed up front | 136 | 13 |
| Source evaluated beyond the 3.0 MB launch graph | 7.0 MB | 1.6 MB |
| Gap between evaluations | 60 ms | 250 ms |
| Search index built at launch | yes | no — built when Search opens |

What the skipped search-index build costs, on Node/V8: 468 ms to load the indexed corpora, 732 ms to build 2,750 entries, **34.0 MB of heap retained for the life of the process**. On a phone the time is several times larger (the module's own comment says "seconds"); the heap is the same order.

On a constrained phone, arriving on a screen wakes the walk for that screen's children, so the next tap is still usually warm.

### 2.4 Notification re-arming (finding 5) — **measured against the real scheduler glue**

`notifications/familyArm.ts`. Native calls (pending-list reads + cancels + schedules) for daily verse + festive + return ladder, 37 notifications held, over a stateful stand-in for the OS queue (`PERF_REPORT=1 npx jest src/notifications/__tests__/rearmCost.jest.test.ts`; the "before" row is the same file run against `main`):

| Event | Before | After |
|---|---|---|
| Relaunch (process restart, queue already holds the plan) | 3 + 37 + 37 = **77** | 1 + 0 + 37 = **38** |
| Return to the app, plan unchanged (after a share sheet, a permission dialog) | **77** | **0** |
| First open of the next day (windows roll) | **77** | 1 + 6 + 35 = **42** |
| One relaunch, two returns, next morning | **308** | **80** |

The queue holds the same 37 notifications in every case. A relaunch still schedules every slot on purpose: a force-stop clears an app's alarms without touching the store that lists them, and scheduling again is what restores them. That is why the "unchanged plan" memory is per-process and never persisted.

## 3. Verification

| Check | Result | Evidence |
|---|---|---|
| Typecheck, lint | PASS | `npm run typecheck`; `npm run lint` — 0 errors |
| Full mobile suite | PASS | `npm test` (typecheck, widgets, Jest ×3 shards, engine, data, ask) on the tested head |
| Regression tests fail before the fix | PASS | `rearmCost.jest.test.ts` fails on `main` (77/77/77) and passes here; the stall, resume and constrained-walk tests are new behaviour |
| Mutation check | PASS | Removing the "never reuse a read older than your own last write" guard fails 6 `familyArm` tests |
| Launch-graph budget | PASS | `src/data/__tests__/launchGraph.test.ts` (in `test:data`) |
| Exported share cards unaffected by icon decode | PASS (static) | `paintedIconDecode.test.tsx` — capture surfaces do not use the bounded decode |
| Release-mode run on a lower-configuration Android phone | **PENDING** | No device. Needed: cold start, Home scroll + taps during warm-up, Search first open on a constrained launch, memory on Home, artwork on a throttled link, reminders after force-stop |
| `cdn.vedansh.app` honours `Range` | **PENDING** | The host is not reachable from the build sandbox. The code is safe either way; the resume saving exists only if it does |
| 800 ms threshold | **PENDING** | A judgement. Calibrate with `launchTrace` (`FORCE_ON`) on a release build |
| iOS | N/A for decode props; stall rule and arming rule covered by the same unit tests | iOS keeps restart-on-interrupt |

## 4. Deliberately not done

- **Loading Gujarati/Kannada fonts on demand (the OTA half of finding 6).** Dropped. The language pickers, the regional segment of the language toggle and `scriptFont` render those scripts for readers of any language, and on Android a `Text` that renders before its family is registered keeps the fallback typeface for that style for the rest of the process. Guaranteeing "never before loaded" across every screen is a wide change for at most 631 KB of the font payload, and the store-build fix (embedding the fonts) removes the runtime load entirely.
- **Japam alarms.** They re-arm on their own reconcile (native alarm tier, exact-alarm policy, snooze). Left alone.
- **First play of a recorded track** streams it and downloads it for the cache at the same time (`AudioPlayerContext`), so a slow link carries the file twice. Outside these findings; noted for a follow-up.
- **Remote artwork decoded at half resolution.** With `resizeMethod="auto"`, a cached 1122×1402 story page shown at about 64% of its size is decoded at 561×701 and stretched. It is a sharpness question, not a performance one; noted.

## 5. Baseline for the store-build work — **built**

`npx expo export --platform android` on `main` at `729a96e`: Hermes bundle **51.7 MB** (51,709,334 bytes), **16.3 MB gzipped**. That is what every OTA downloads today.

## 6. Post-merge review (11 November 2026)

Both halves were merged to `main` (`d4a5a8b`) with the pending checks in §3 still pending. An independent review of the merged diff then found the following in this half. None changes a figure in §2. Each fix has a test that fails on `d4a5a8b`.

| Finding | Effect | Status |
|---|---|---|
| A viewer leaving while the downloader was clearing its scratch path was not noticed: the cancel check ran before that wait and the abort handle was registered after it. | The download started anyway and held one of the two background slots until it finished, stalled or hit the 2-minute ceiling. | **Fixed** — the check is the last thing before the transfer starts. |
| Any non-206 answer to a resumed request turned resuming off for the whole session, including a 503 or 429. | One flaky answer sent every later interrupted download back to byte 0 — the cost §2.1 exists to remove. | **Fixed** — only an answer that shows `Range` being ignored does that; an error status costs that one file its kept bytes. |
| A download that finished kept its progress listener: the legacy task removes it only when cancelled or paused. | One listener per completed file for the life of the process, each handed every later progress event. New with this work, which added the progress callback. | **Fixed** — the finished task is released. |
| The kids-story / comic / audio cache gave up after 15 s without a byte on every platform. iOS's own client used to wait 60 s, and iOS cannot resume. | On iOS, a download that paused for 15–60 s on a poor link was abandoned and restarted from byte 0 where it used to continue. (Android's client used to give up at 10 s, so 15 s with kept bytes is the more patient there.) | **Fixed** — 60 s on iOS, 15 s on Android. Found in the author's own pass, not by the independent review. |
| On a constrained phone, an arrival in the instant a warm-up pass ran dry was handed the finished pass as if it were running. | The screens just asked for stayed cold until the next navigation. A narrow window. | **Fixed** — the pass gives up in the same turn it finds nothing. |

Also checked and found sound: all ten notification families go through `familyArm` and nothing else cancels or schedules their identifiers; no two family prefixes overlap; none uses a relative (seconds-from-now) trigger, so "an identical plan is not re-armed" cannot hold a reminder at a stale time.

