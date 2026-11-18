# Live Darshan autoplay and channel audit — 16 November 2026

## Problem and change

Opening a resolved temple broadcast requested `play=true`, but the installed
`react-native-youtube-iframe` patch injected `player.playVideo()` before the
asynchronous YouTube player existed. Its effect depended only on `play`, so the
ready event never resent that command. A second user tap was needed.

The existing command bridge now waits for `playerReady` and depends on both
readiness and the latest play intent. This also honours a pause during loading
from backgrounding, route blur or competing audio. Retry waits for its replacement
iframe. No timer, native dependency, hidden player or startup work was added.
YouTube controls remain available if publisher/platform autoplay policy blocks
playback. This change does not force autoplay in the external YouTube app.

Entry: Home floating Darshan → quick sheet/list → Somnath/Kashi player. The same
shared fix covers reader Play video and retry. Channel roster, favourites, saved
IDs, languages, typography and layout remain unchanged.

## Direct YouTube channel checks

Read the nine roster channel `/live` pages directly and compared their selected
video's channel ID to the roster. The accompanying
`live-darshan-channel-audit-2026-11-16.json` records a minimal metadata snapshot,
source URLs and timestamps. No account/session tokens or raw page bodies are kept.
`playableInEmbed: true` means YouTube reports embed permission, not that playback
was exercised in an installed app. These observations can change immediately.

| Channel | Selected broadcast | Embed permission |
| --- | --- | --- |
| Somnath | Active | Yes |
| Kashi Vishwanath | Active | Yes |
| Omkareshwar | Active | Yes |
| Dwarkadhish | Active | Yes |
| Srisaila TV (Mallikarjuna/Bhramaramba) | Active devotional TV | Yes |
| SVBC TTD (Tirupati) | Active devotional TV | Yes |
| Banke Bihari | Active | Yes |
| Naina Devi | Waiting to start (`LIVE_STREAM_OFFLINE`) | Yes |
| Khatu Shyam | No active `/live` selection; latest 16 November morning aarti ended | Latest archive: yes |

Only Somnath and Kashi currently have supported in-app source discovery. The
five other active channels are additional embed candidates; the previous
two-temple implementation was not evidence that other publishers forbid embeds.
Naina Devi is waiting rather than currently playing. The Khatu archive's
`isLiveContent` is true, but `isLiveNow` is false with an explicit end timestamp;
do not present it as live.

This investigation does not enable additional production streams. Do not hard-code
these dated IDs or add client-side YouTube HTML scraping. Expansion needs supported
current-broadcast discovery, embed permission and channel checks, plus native
playback/error/lifecycle verification. TV feeds remain labelled TV rather than
continuous sanctum cameras.

## Acceptance and evidence

Base: `3b80aef9b1c1fdd406e1ef1c46526e7b2ed97f3a` (current main at checkout).
Applicable conditional groups: C7 navigation, C8 video/audio, C9 shared control
behaviour. C1–C6 and C10 are N/A: no devotional content, artwork, sharing,
calendar, notification or release work.

| Check | Result | Evidence / limitation |
| --- | --- | --- |
| U1 current source | PASS | Current main, merged #690, repository policies, design and wiki inspected |
| U2 acceptance | PASS | Initial play after ready; pause-before-ready wins; retry after ready; no auto-resume |
| U3 actual native design | PENDING | No layout changes; installed comparison unavailable |
| U4 languages and sizes | PENDING | No new visible text/layout; native hi/en/gu/kn × Standard/Large/compact/system text not executed |
| U5 reachable journey | PENDING | Darshan journey regression passes; native Home/list/reader/Back pending |
| U6 lifecycle/failure | PENDING | Real-library background/blur/arbiter/readiness/retry regressions pass; native interruptions pending |
| U7 assets/content | N/A | No production registry, content, manifest, CDN or artwork changes |
| U8 related surfaces | PASS | Broadcast and reader share the fix; both tested with real installed library |
| U9 tests/native | PENDING | Six new tests fail before fix; targeted 38 pass after; full results below; device playback/E2E pending |
| U10 performance/compatibility | PENDING | Single existing effect, bounded command, no extra polling; Android ANR/iOS hang/device profiling unavailable |
| U11 integration/docs | PASS | Patch, design §91, RULEBOOK Darshan integration and wiki updated together |
| U12 preservation | PASS | Final remote blobs/tree match local git objects; branch/remote head are recorded in the PR; no cleanup |

Validation:

- Before fix: all six new real-library tests FAIL due to premature Play/Pause.
- After fix: four targeted suites / 38 tests PASS. Tests replace only the native
  WebView, keeping the installed patched library and DockedYouTubePlayer real.
- Fresh application of patch-package: all four patches PASS, including YouTube.
- TypeScript PASS; focused ESLint: 0 errors, two test-mock require warnings.
- Widget 51, engine 842, data 242, Ask 49 PASS using `node --import tsx --test`
  with the exact package-script file lists (the tsx CLI cannot bind its IPC socket).
- `npm test` stops at the widget runner's tsx IPC `EPERM`; it is not a passing
  full command. Independent gates are run separately without that CLI wrapper.
- Full Jest: 410 suites / 4,354 tests PASS after clean patch-package application (217 seconds).
- Agent instruction checks and whitespace checks PASS.
- Maestro/native playback, platform autoplay restrictions, fullscreen/controls,
  background/lock and release-device responsiveness remain PENDING. This workspace
  has neither Maestro nor an iOS/Android device runtime. `npm run test:e2e:flow -- .maestro/live-darshan.yaml` confirms `maestro: not found`.

Keep the PR draft. No merge, native release build, version change or OTA.
