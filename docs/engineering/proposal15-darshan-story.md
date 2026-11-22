# Proposal 15 — Darshan error to existing temple story

Base: `c8ad35dd55b67991c9af23b809c3229a401e24f7`. Extends merged #691; no overlapping open Darshan PR found at implementation time.
Reference: Library `libfile_64a78a48ef548191a699e184a378fc3b` (concept, not native QA).

One secondary localized error action opens the selected temple's authored story on the same screen. Retry/Browse remain. Non-Darshan errors, healthy/loading video, favourites, route/back stacks and no-autoresume policy are preserved. No content, network source, telemetry or page added.

## Verification in progress

- Targeted Darshan/shared player tests: 57 passed at initial checkpoint.
- Full `mobile/npm test`, lint and final coverage: running/pending.
- Native iOS/Android, VoiceOver/TalkBack, compact/enlarged system text: PENDING. This Linux environment has no `adb`, `xcrun` or `maestro` executable.
- 8/10 users reaching the story within 10 seconds: future usability target; NOT validated.

## Deterministic native test

Start isolated Metro with `VEDANSH_DARSHAN_E2E=1 npx expo start --port 8084 -c` from `mobile`, then run `maestro --device <dedicated-device> test .maestro/darshan-story-error.yaml` against a development build. The explicit Metro resolver intercepts only dedicated source discovery and the channel frame in development: source resolves null and the frame reports error. It does not change route/data/content or depend on a live stream failing. Normal and production resolution stay unchanged. Also run existing `live-darshan.yaml` and fullscreen flow with ordinary Metro.

Run each native journey in hi/en/gu/kn, Standard/Large, compact/enlarged system text. Verify heading focus after expansion and repeated taps, Back/reopen and switching temple, saved state, background/foreground and no duplicate playback. Empty/whitespace localized stories are covered by synthetic unit fixtures; do not remove authored production content to fabricate a native case.

## Acceptance

U1/U2 source/scope: PASS. U7 reused authored content/assets: PASS. U8 shared reader/broadcast boundary: targeted tests PASS. U3/U4/U5/U6/U9/U10/U11/U12: PENDING final checks and native evidence. C1/C7/C8/C9 applicable; C2–C6/C10 N/A (no new illustrated content, asset publication, exports, calendar/reminders or release work).

Keep draft. No merge, release, deployment or OTA is authorized by this change.
