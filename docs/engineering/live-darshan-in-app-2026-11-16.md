# In-app Darshan sources and player page — 16 November 2026

## Intended result

User feedback: the player was small, repeated publisher/warning text displaced
the temple's content, and two large buttons sent people out of Vedansh. Add the
newly audited channels, keep the journey in app, make the video the hero and make
fullscreen use the whole native display like a video player.

This extends PR #691 and integrates current main `f708ee04` (the upstream Android release configuration and launch-window update). The earlier ready-before-play patch remains.

## Implementation

- All nine audited channels now open a visible in-app YouTube channel embed.
  Seven entries previously opened a YouTube hand-off. The stable channel source
  selects its broadcast without hard-coding the audit's dated video IDs, scraping
  channel HTML, a hidden resolver/player, an API credential or a new backend.
- Somnath/Kashi prefer their dedicated official camera lookup. Missing/ambiguous
  IDs, source errors and the 12s deadline fall back to their in-app channel player.
  A channel may wait, be offline or disallow playback; the app does not claim it
  is live now or silently replay an archive. TV feeds retain their TV label.
- Full available width, maximum840pt, 16:9 with a240pt minimum (200pt on compact
  height). The player/control strip stays above the scrollable content, avoiding
  audio from an offscreen player. Readable publisher attribution moves into the
  scrollable temple identity block so short screens retain content space.
- One temple identity/location, compact header bookmark, existing language
  control, complete sourced significance, expandable origin story, full in-app
  temple guide, up to four shipped aarti/chalisa/stotram/ashtakam/kavach readers,
  and painted temple switching. Existing content, IDs and routing are reused.
- No app-owned website/YouTube exit buttons or broadcast strip external arrow.
  Broadcast errors offer Retry and Browse temples; content stays available below.
  Standard YouTube controls/branding remain. Reader-video hand-offs are preserved.
- Native fullscreen is explicitly enabled for both channel and video paths. It
  uses the WebView's OS video presentation, rather than a second player or a
  larger card/modal inside the tab layout. Android's installed native WebView
  implementation uses a fullscreen custom view, hides system chrome, permits
  orientation changes and restores the prior orientation/view on exit.
- Channel source HTML is memoised independently of height. Resizing/fullscreen
  exit does not replace its source or restart playback. The HTML uses the native
  app's registered HTTPS identity as baseURL/Referer and origin. Ready-before-play
  preserves the latest pause intent; autoplay blocking returns the Play control.
- Background/blur still cancels lookups and removes the player, with explicit
  resume on return. Favourites remain shared/lazy/serialised, with in-app retry
  of a failed snapshot rather than toggling the choice again.

## Source and fullscreen reference checks

Direct YouTube channel audit is preserved in
`live-darshan-channel-audit-2026-11-16.json`: seven active/embeddable videos,
Naina Devi waiting with embed permission, Khatu Shyam's completed aarti embeddable.
These were observations, not permanent per-channel permission guarantees.

The official Omkareshwar live page currently uses the same stable channel embed.
Browser inspection resolved it to its audited channel/video and displayed its
temple player. This establishes source resolution, not native autoplay/fullscreen.
No native playback verification is claimed from that browser observation.

YouTube WebView client identity guidance:
https://developers.google.com/youtube/terms/required-minimum-functionality
and IFrame API:
https://developers.google.com/youtube/iframe_api_reference

The installed Android implementation was inspected at
`RNCWebViewManagerImpl.kt` (`onShowCustomView`/`onHideCustomView`). Native implementation
and property tests are not a substitute for executing fullscreen on devices.

## Acceptance evidence

| Check | Result | Evidence / limitation |
| --- | --- | --- |
| U1 scope/source | PASS | Current main, existing #691, policies/wiki, screenshots and official sources inspected |
| U2 acceptance | PASS | In-app sources/recovery, larger pinned stage, real content, retained native fullscreen defined |
| U3 actual native design | PENDING | Integrated screen code; installed visual comparison with user screenshots unavailable |
| U4 languages/sizing | PENDING | hi/en/gu/kn × Standard/Large rendered-provider tests pass; compact/system-text native layout unexecuted |
| U5 journey | PENDING | Automated sheet/list/player/guide/readers/switch/Back contracts pass; native journeys pending |
| U6 lifecycle/persistence | PENDING | Lookup failure/timeout/abort, late-ready pause, background/blur, retry and favourite snapshots pass; native interruptions pending |
| U7 content/assets | PASS | Reuses full existing sourced temple significance/story and active correct-deity readers; existing painted assets, no new publication |
| U8 related surfaces | PASS | Sheet/list labels, all channel player routes, existing reader hand-off and shared player regression checked |
| U9 automated/native | PENDING | Automated results below; native Maestro unavailable |
| U10 performance/compatibility | PENDING | One visible player, bounded roster/reading scans, no startup work/polling/new dependency; native ANR/iOS hang/profile pending |
| U11 integration/docs | PASS | Same PR updates source, screen, shared player, tests, flows, design §§91–92, rules and wiki |
| U12 preservation | PASS | Exact final remote blobs/tree match local git objects; branch/head recorded in the PR; no cleanup |

C1 existing sourced prose, C3 reused artwork, C7 navigation/persistence, C8 playback
and C9 shared/accessibility apply. C2/C4/C5/C6/C10 N/A: no new story/art generation,
sharing, calendar, reminder or release work.

## Executed and remaining checks

- Before fix: 12 new in-app-source/content regressions fail against the previous
  screen. After fix: targeted source/player/routes/favourites/real-library tests pass.
- Final integrated full component run on main `f708ee04`: 411 suites / 4,390 tests PASS.
- Final focused source/player/routes/favourites rerun: 7 suites / 79 tests PASS,
  including large-system-text wrapping and ignored non-fatal HTTP subresources.
- TypeScript PASS. Focused production-file ESLint: 0 errors/warnings.
- Widget51, engine842, data242 and Ask49 PASS using the package scripts' exact
  file lists with `node --import tsx --test` (tsx CLI IPC socket is restricted).
- Native `live-darshan.yaml` and new `live-darshan-fullscreen.yaml` authored/updated;
  `npm run test:e2e:flow -- .maestro/live-darshan.yaml` returns `maestro: not found`.
  Fullscreen provider selectors are explicitly not device-verified.
- The scratch server/browser path could not be connected and a local headless
  browser could not create its required socket. No screenshot/mockup is represented
  as installed-native evidence. No visual acceptance is claimed from unit output.

Required device matrix: iOS and Android fullscreen hides header/tabs/system chrome,
landscape/portrait and Back/Done retain the stream/position; normal play/pause,
blocked autoplay, offline/retry, waiting/offline/restricted channels, temple
switching, guide/readers/Back, background/lock/competing audio, four scripts and
Standard/Large/compact/system text, accessibility, release-mode responsiveness,
20-minute continuous playback and ANR/hang telemetry. Keep draft until established.

No native dependency/version change, cloud release build, merge, store submission
or OTA. No new artwork/CDN assets or content publication.

## Spacing correction after preview review

The previous body stacked the identity, attribution and full language pill with
22pt gaps. These were spacing inherited by separate blocks, not a video requirement.
The implemented summary now has12pt top padding,4pt internal gaps and a wrapping
title/compact-language row. Location and publisher sit directly below; a TV label
remains when appropriate. Section gaps are16pt. The generic timing sentence and
standalone language row are removed. Tests cover the grouped summary in all four
languages at Standard/Large; native layout remains pending.
