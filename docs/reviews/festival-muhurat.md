# Festival-specific timings and festive share strip

Base: 98184456f55c1d6ebe3d5eb62277bb97f13267e8. Approved in-thread compact
strip after the sky header and before the four angas; preserve all 16
Choghadiya, four Kaal and four Vaas tiles and the original footer.

Implementation: pure `occasionTimings.ts`, shared persisted day inputs,
cooperative/cancellable work, location/calendar/lens keyed hook. No new dates
are added to the catalog or baked year tables. Windows are derived from the
same ephemeris, tithi spans and lagnas already used by Panchang. Regional
traditions retain separate IDs. No computed Vaishnava Ekadashi parana.

Source URLs are retained per timing profile. Drik Panchang's published
conventions are the declared basis: Pradosh first fifth of night, Nishita
eighth night muhurta, Madhyahna middle fifth of daylight, Vijay eleventh
of 15 daylight muhurtas. Diwali/Dhanteras intersect Pradosh, Taurus lagna and
worship tithi; Ram Navami uses full Madhyahna. Holika uses the existing
Bhadra-aware day; before-midnight and shifted-next-evening branches are
computed; unreviewed Bhadra Punchha exceptions show guidance, not a clock.
Smarta parana excludes the actual first quarter of Dwadashi (Hari Vasara),
prefers morning, avoids midday and stays inside Dwadashi unless it ended
before sunrise. Moonrise is an astronomical event, not guaranteed sighting.

The app shows all computed windows; the full 4:5 share card highlights the
primary ritual/window in its existing festival ribbon slot. Complete windows
and exception guidance are included in Send as text. This prevents crowded
multi-occasion dates from silently clipping the existing almanac sections.
The approved floral strip uses painted marigold/mango corners, a fine double
gold frame, a vertical divider, maroon title/clock ink and a larger ritual
name. The 4:5 export uses a 66dp strip with a 3dp minimum body gap; existing
Panchang text sizes are unchanged. PNG capture waits for both corners and the
festival miniature to decode, including the focused occasion export. Artwork
master, grid map, transparency, byte/hash evidence and prompt are retained in
`docs/reviews/festival-art/`. A 479,742-byte WebP atlas is bundled for offline use.

Both endpoints carry their dates when they fall outside the reference day.
Artwork uses typed, bundled painted subjects (diya, fire, shastra, kalash,
moon, sun, Shiva, Ganesh, rakhi, lotus), with no CDN dependency or emoji.

Ghatasthapana adds the first daylight third while Pratipada prevails and an
Abhijit alternative. Chitra/Vaidhriti remain an explicit advisory, never an
undocumented prohibition; these periods are preferences, not a full lagna-grade
muhurta search. The Shardiya Delhi 2026 published windows are pinned.
Ayudha uses Navami's sunrise day separately from Dashami's Shastra Puja.

Pending coverage: Sandhi Puja, independent
Kali/Narak dates, visarjan, Jitiya, Sankranti Punya Kaal and Vaishnava-specific
parana require reviewed date/clock fixtures before exposing exact times.
Other catalog entries retain existing guidance; no generic special muhurat.

Verification:
- PASS: 21 pure timing checks, including 12 published city/date window fixtures,
  Hari Vasara, shifted Holika evening and Bhadra abstention, ordinary days,
  both lunar calendars, date suffixes and Diwali priority over past-night carryover.
- PASS: 46 final focused hook/component/existing-share/occasion-screen checks.
  Real hook tests include cancellation, stale date/city suppression, hydration,
  error/retry and the shared persisted day pipeline.
- PASS: TypeScript typecheck. Full scripts executed: widgets, all three reader
  shards (343 suites/3308 assertions), engine (649 assertions), data (218), ask.
  Missing sparse-checkout source fixtures were restored from HEAD and the affected
  groups rerun successfully. Focused checks were repeated after final strip changes.
- PASS: actual RN components rendered in browser at 2x with shipped fonts, real
  Delhi solver data and twenty-four full exports (six occasions x four scripts).
  All preserve 1080x1350 bounds and zero body/footer overlap. Four 320px app
  cards rendered. Follow-up: 144 additional RN Web layouts passed horizontal/text bounds checks: 320/390/600 CSS-point widths × Standard/Large × four languages × six occasions. These are browser measurements, not native device proof.
- PASS: authored Maestro YAML parses (2 documents); no native run is claimed.
- PENDING: installed iOS/Android visual, actual capture and system-share handoff,
  Standard/Large/enlarged-system-text, offline/fresh/saved device journeys.
  Android SDK/API 35, Expo Go and Maestro were provisioned locally for follow-up. The isolated software-only emulator reached sys.boot_completed=1. Its System UI reported ANR and both guest/host captures remained black; Expo Go installation/app launch did not complete. No native app run or export is claimed. No Mac/iOS runtime is available. Native evidence remains required for ready-for-merge status.
- BLOCKED: automatic approval review rejected remote GitHub commit creation,
  saying building was authorized but publishing was not explicitly authorized.
  No branch or PR was created. No workaround push was attempted after rejection.
  The local patch, original source URLs and browser evidence are preserved in
  the review handover artifact. Publishing requires the user's explicit approval.
No application binary build, OTA, merge or release was performed.

## Design correction — 6 November 2026

The first implementation's simplified SVG symbols and plain border did not
match the approved painted reference. They were replaced, not accepted as
visually verified. Actual component exports were re-rendered for Diwali,
Holika, Shastra, parana and Ghatasthapana in all four scripts. The painted
miniatures, floral corners, divider and double border were inspected in the
complete existing Panchang card. Bounds and footer-overlap checks pass.
Decode-barrier regressions and SHA/transparent-master provenance checks pass.
Native image decoding/capture and Standard/Large remain pending.

The vrat-day view retains next-day parana/arghya windows as well as the
next-day calendar view. Date-bearing clocks put each complete endpoint on its own line in the
compact strip; their ritual label remains visible above the name. Final
regressions cover this branch and were repeated after the painted layout.

## Size follow-up — 6 November 2026

Ritual clocks and explanatory notes now honor the app’s Large reading preference (1.15×); headings and controls follow the existing fixed-chrome policy. The natural-height card permits wrapping. Export text stays fixed and disables system font scaling. The new regression verifies 21→24-point clocks, 13/23→15/26-point notes and unchanged 20-point compact-export clocks. Ten component checks and typecheck pass. Browser size evidence is recorded separately from native evidence.

## Native verification retry and prepared CI — 6 November 2026

- Retried with Google's stable Android Emulator 37.2.13 (archive SHA-1 checked against repository XML), 720×1280 SwiftShader/GLES with Vulkan disabled. Both API 35 and API 30 AOSP images were tried. No KVM/GPU device is exposed.
- API 35 completed boot but its System UI reported ANR. API 30 also displayed a System UI ANR. Multiple emulators hit the 8 GiB memory limit; only one was then retained. The final retry moved its live AVD disk outside the synced workspace and restarted Metro with one worker. The device completed boot and the official Expo Go APK transferred; app installation/rendering is not established. These are infrastructure attempts, not native app passes.
- Added an unpublished native iOS workflow and installed-app Maestro matrix, plus a stable `occasion-share` test selector. It compiles one unsigned Release simulator binary from the exact checkout, disables downloaded updates only in the generated verification plist and records the embedded JS hash and runs sequential compact/wide devices: four languages × Standard/Large, compact enlarged-system-text, focused export, Shastra, Holika and next-day parana (24 planned cases). The job sets the reference timezone to Asia/Kolkata, retains tested head/toolchain/JUnit/screens/actual exported PNGs and never selects a recipient. Each case is counted only after UI assertions and a new PNG pass.
- The PNG collector accepts only fresh files under the installed app's ReactNative temporary capture directory, with 1080×1350 full-card dimensions (focused may grow), opaque nonblank pixels and recorded SHA-256. Six collector regression tests pass, including rejection of stale, downloaded, blank, transparent and wrong-height files. Ten component tests pass; shell/JavaScript syntax and workflow/Maestro YAML parsing pass. These checks do not establish native execution.
- Remote publication and workflow execution are still pending. Automatic approval review previously rejected remote commit creation because code publication was not explicitly authorized. No new publication attempt was made.

## Publication approval and recovery — 6 November 2026

The user explicitly approved publishing `codex/festival-muhurat-share`, running the prepared native checks and opening a PR. Recovered the exact saved implementation (`ee539c8f77f31521296deb49e83fe4a9bf01e271`, original base `98184456f55c1d6ebe3d5eb62277bb97f13267e8`) after workspace maintenance. Applied it to current main `e3628c2c85a62e396cba8d91ec9ddc4d2611e7b5`; retained both wiki additions and all current Indic clipping fixes. The earlier publication block is resolved by explicit approval. New-head local/CI and native results remain pending until executed; earlier results above retain their recorded scope. Keep the PR draft until the required native matrix and actual export review pass.

### Native CI timezone preflight correction

The first published simulator run (42197733528, head e462cf8d) failed before npm/prebuild/compilation: macOS rejected `Asia/Kolkata` as an unsupported systemsetup zone. The preflight now selects only a listed `Asia/Kolkata`/`Asia/Calcutta` alias, requires UTC+05:30, and retains the selected timezone plus available list. All clock assertions remain. This failure is infrastructure setup and is not native app evidence; the corrected run remains pending.
