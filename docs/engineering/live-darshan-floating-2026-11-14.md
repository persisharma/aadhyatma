# Floating Darshan implementation review

Status: integrated in the React Native app; native acceptance remains pending.
Branch: `feat/live-darshan-floating`.
Integration base: `0e5ac377640c9fcb9448f5bdb65eecf0df0c32ff` (current main, 15 November).
Recovered implementation base: `624b7c4501306bb433b945ab0abaf2811b14f8a4`.

## Approved design and acceptance

The user selected Option C in the Darshan design preview, then requested the
floating icon design be built. Home uses the exact existing painted Theerth icon,
saffron diagonal gradient, gold outline and decorative bead, cream label, shared
warm shadow, and a minimum 52pt target. The label wraps at larger text sizes.
The bead carries no live status. The button sits above the existing bottom tabs
and rises above recorded audio; the audio subscription stays in the button leaf.

Home → floating दर्शन pill → native quick sheet → temple list/player → temple
guide or shipped reader. The quick sheet supports close/backdrop/Android Back,
two favourite-first temples, View all and replacement navigation. The browser
supports search, favourites, empty states and retained query on Back. The existing
five tabs and sixteen launcher tiles remain. Routes load on demand, with no new
Home stream fetch, WebView or favourites hydration.

## Playback coverage

Nine channel entries cover ten guides. Somnath/Kashi resolve current iframe IDs
from dedicated official live pages; the other seven entries hand off to canonical
YouTube channel-ID `/live` URLs. Mallikarjuna and Bhramaramba share Srisaila TV;
SVBC and Srisaila are labelled devotional TV. No dated video IDs, assumed current
liveness, invented schedules, reminders or partnerships are bundled.

Use the existing DockedYouTubePlayer and playback arbiter. Lookup has a 12s abort
deadline; ambiguous sources, redirects, oversize payloads and errors fail closed.
Retry re-resolves the official page, replacing changed IDs. The YouTube action
opens the resolved video or canonical channel; the publisher website root offers
a second labelled fallback. External launch errors remain visible. Background/blur
cancel lookup and remove broadcast playback; return requires another Watch tap.
Broadcasts skip progress polling. Verified recitations keep their existing cues.
Favourites hydrate on entry, validate/canonicalize IDs, serialize writes and expose
storage failure/retry. Existing painted artwork and native dependencies are reused.

## Verification on current main

- PASS: TypeScript; targeted Darshan/player/navigation/source/favourites/doc-token
  suites (64 tests in seven suites); lint (0 errors, 471 existing warnings).
- PASS: agent instruction entry points and evidence-template verification.
- PASS: complete mobile gate: reader/component shards 1486 / 1496 / 1366 tests,
  widgets 50, engine 842, data 242 and Ask 49. The first shard had one missing
  tracked speech-patch fixture; restoring it and rerunning that suite passed.
- PASS: iOS and Android production JavaScript/Hermes bundle exports. These are
  not compiled/installed native binaries or native playback evidence.
  The tsx CLI cannot open its IPC socket here; equivalent Node suites ran through
  `node --import tsx --test` with the exact package-script file sets.
- PENDING: actual iOS/Android installed layout and playback, Maestro execution,
  fullscreen/seek/volume/quality/orientation, screen readers, interruption and
  release-device memory/ANR/hang traces. No device runtime is available here.
- No version bump, OTA, native binary publication, merge or store release.

## Acceptance matrix

| Check | Result and evidence |
| --- | --- |
| U1–U2 | PASS: current main/instructions/selected preview reviewed; Home sheet/list/player/guides, saved/error/lifecycle acceptance defined |
| U3 | PENDING: selected design tokens/artwork integrated; actual native visual comparison required |
| U4 | Automated four-language × Standard/Large label checks PASS; native compact/enlarged-system-text matrix PENDING |
| U5–U6 | Automated journey, persistence, cancellation, background/blur and retry checks PASS; native journeys PENDING |
| U7–U8 | PASS: existing artwork registry/decode reused; canonical channel fallback, shared-TV IDs and lazy routes checked; no new remote artwork |
| U9 | Full automated gate and production bundle exports PASS; native Maestro PENDING |
| U10 | Bounded work, lazy loading and audio-leaf isolation reviewed; launch-budget check PASS; native ANR/hang profiling PENDING |
| U11 | PASS: recovered feature merged onto current main, preserving the unrelated share-hand-off revert; CI PENDING |
| U12 | Local source committed; user explicitly requested PR publication on 15 November. Remote checkpoint verification is recorded in the PR. |

Relevant conditional checks: C3 existing artwork; C7 navigation/persistence;
C8 streaming/audio; C9 four-script accessible overlays. C1/C2/C4/C5/C6/C10 are N/A:
no authored scripture/story, share export, calendar, reminder or release changes.

`mobile/.maestro/live-darshan.yaml` covers Home entry, close, View all,
stream-or-fallback, guide, Back chain and Home-only visibility. Execute it on the
exact branch binary on both platforms. Review hi/en/gu/kn × Standard/Large,
compact/system-text, VoiceOver/TalkBack, active recorded audio, online/ended/offline,
Retry, background/lock, rapid open/close and native performance traces. Keep the
PR draft until these required native gates have evidence.

## Publication handover

The user explicitly instructed raising the PR on 15 November 2026 and confirmed
that PR creation is already required by the repository workflow. Publication to
`persisharma/aadhyatma` is authorized for this implementation, tests and documentation.

Tested implementation checkpoint: `ae5b055`; final automated validation report:
`9f27fd8`. Current main and the destination branch were rechecked before publication.
The local branch is `feat/live-darshan-design`; the remote destination is
`feat/live-darshan-floating`. All 27 changed files are committed; no required
untracked artwork is missing. The draft PR records its verified remote commit and
source-tree identity. Preserve the checkout until remote verification succeeds.

Required native visual, playback, accessibility and performance checks remain
pending. The PR must remain draft until those acceptance gates have evidence.
