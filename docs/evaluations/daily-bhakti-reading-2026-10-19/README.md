# Daily Bhakti reading artwork correction

PR #494 wired devotional parchment sharing but left the Bhakti reading card on its old background. The user confirmed that the unchanged reading page was the missing behavior. This correction displays the same mapped artwork above the reading text.

- One bounded 180dp header, 270×180dp image constrained to the available width, `contain` without cropping, right aligned on parchment with a 30dp fade.
- Reuses all nine deity plates and the neutral prayer plate; no new artwork, downloads or native dependencies.
- Source/verse-level overrides are shared with exports. Next verse updates the image; unknown/mixed prayers use neutral art.
- Full verse and meaning remain in the existing ScrollView with their selected reading-size tokens. More content may fall below the fold; nothing is clipped or shrunk to make room.
- Decorative artwork adds no screen-reader stop. Source labels now use the selected script's serif without letter spacing.

## Validation

TypeScript and touched-file ESLint pass. Seven focused reader/share suites pass (59 tests), and the expanded reading-screen suite passes all six cases (including four added Next-verse mapping cases), giving 63 distinct tests in scope. The complete 1,367-candidate/four-language text preservation test remains green. Maestro YAML parses.

The existing full-project test gate and device-based Maestro gate still apply before merge. No simulator, emulator or Maestro executable is present here, so installed rendering at Standard/Large, small-screen visual review, offline native decode and native share hand-off are **pending**. Production export results do not replace those checks.

## Delivery

The confirmed issue is the reading page, not a proven capture failure. Separately, a GitHub merge does not deliver new JavaScript to installed apps: repository workflows run tests and the existing `push.sh` performs OTA publication. This task pushes the correction branch and PR; it does not publish a production OTA or store release. After merging and passing native checks, publish through the normal compatible-runtime update process and verify the staged update is applied on the phone.
