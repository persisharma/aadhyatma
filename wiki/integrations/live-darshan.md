---
title: Temple Darshan
type: integration
sources: [mobile/src/screens/HomeScreen.tsx, mobile/src/screens/DarshanQuickScreen.tsx, mobile/src/screens/DarshanListScreen.tsx, mobile/src/screens/DarshanPlayerScreen.tsx, mobile/src/data/darshan/channels.ts, mobile/src/video/darshanSource.ts, mobile/src/video/darshanFavorites.ts, design.md, RULEBOOK.md]
last_verified_date: 2026-11-16
confidence: medium
status: current
---

## Summary
Home's selected floating Darshan pill opens a native quick sheet. Browse, favourites,
player and Theerth/readers stay in Home's typed stack. Routes load only on demand.
The Option C finish uses the existing painted temple icon, saffron gradient,
gold outline and decorative bead, cream label and shared warm shadow. The bead
does not signal live availability. Four authored accessibility labels preserve
one announcement per button; Standard/Large labels can wrap.

## Details
Nine audited channels cover ten guides (Mallikarjuna/Bhramaramba share Srisaila TV).
Every entry now opens a visible in-app channel embed; Somnath/Kashi prefer their
unambiguous dedicated live-page camera with a cancellable12s lookup and channel
fallback. `channelEmbed.ts` constructs the stable source and app-identity HTML;
`ChannelYouTubeFrame` waits for readiness and uses the latest play intent. There
are no dated IDs, channel HTML scraping, hidden resolver or progress polling.
Waiting/offline/restricted sources remain an in-app Retry/Browse experience.

The full-width player stays above scrollable temple content. One attribution,
header bookmark, actual sourced significance/story, guide, shipped devotional
readers and painted temple switching replace duplicated publisher copy and exit
buttons. Readers still open through `navigateToEntryStart`; switching temples
replaces the player route. New content comes from the existing temple/text corpus.

Native fullscreen uses the existing WebView's video presentation, not a duplicate
player/modal. Both source paths allow it; a channel-frame size change retains its
memoised source. Actual fullscreen, rotation and Back/Done are native gates.
Background/blur removes the player and cancels lookup; return requires Resume.

## Dependencies
[[overview]], [[audio]], [[languages]], design.md §§91–92.

## Gotchas
Do not infer live-now from an embed or replay an archive as live. SVBC/Srisaila are
TV feeds. Retain normal YouTube branding/controls. The channel HTML's baseURL and
origin are the registered native app identity, per YouTube's current WebView
Referer guidance. Never use an opaque-origin local HTML page without that identity.

Favourites hydrate lazily and serialize writes. No player is mounted on Home.
The app-owned external Darshan CTAs and strip arrow are removed; reader hand-offs
remain. Existing library-ready patch and real-library regressions remain required.
The channel frame separately tests late-ready pause, blocked autoplay, errors,
valid channel roster and native-fullscreen flags/source retention. Unit/browser
checks do not prove native playback/layout, fullscreen or ANR safety.
