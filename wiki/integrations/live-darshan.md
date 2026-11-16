---
title: Temple Darshan
type: integration
sources: [mobile/src/screens/HomeScreen.tsx, mobile/src/screens/DarshanQuickScreen.tsx, mobile/src/screens/DarshanListScreen.tsx, mobile/src/screens/DarshanPlayerScreen.tsx, mobile/src/data/darshan/channels.ts, mobile/src/video/darshanSource.ts, mobile/src/video/darshanFavorites.ts, design.md, RULEBOOK.md]
last_verified_date: 2026-11-15
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
Nine official channel entries cover ten guides (Mallikarjuna/Bhramaramba share one feed and favourite) and were selected from the 13 November audit. Somnath/Kashi use
current official live-page iframe discovery. The other seven hand off to YouTube
until reliable current-video discovery exists. Public live-page embeds may be
recordings: the product never infers current liveness. SVBC/Srisaila are TV feeds.
The resolver has a12s abort deadline, rejects ambiguous IDs and off-domain redirects.
The existing docked player handles YouTube controls/audio arbitration; broadcasts
skip progress polling and have no invented spoken language. Background/blur cancel
requests and remove the player; return requires another tap.

## Dependencies
[[overview]], [[audio]], [[languages]], design.md §92.

## Gotchas
Do not paste yesterday's live IDs, scrape YouTube HTML, fabricate live counts,
forge recitation verification or add a background WebView to Home. Favourites
hydrate only on first use and serialize writes. The floating pill clears the
recorded-audio mini-player; audio context is consumed only in its small leaf,
so position ticks do not rerender Home. Unit/render tests do not prove native playback/layout
or ANR safety; native acceptance remains pending until device evidence exists.

Embed Retry refreshes the source lookup, rather than recycling a broken ID. The canonical channel ID survives handle renames; the trusted publisher website root is a separate functional fallback when YouTube cannot open (15 November).

The installed YouTube command-bridge patch waits for `playerReady` and re-runs on readiness with the latest play intent. Its previous `[play]`-only effect sent Play before the page global existed and did not retry at ready, leaving the broadcast cued until another tap. `YouTubeReadyPlayback.test.tsx` retains the real library and replaces only the native WebView; it covers broadcast/reader startup, background/blur/competing audio before readiness, duplicate ready and retry. Native playback remains a separate required check.
