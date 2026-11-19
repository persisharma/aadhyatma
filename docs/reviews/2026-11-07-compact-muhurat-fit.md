# Compact muhurat fit regression

Base: `dd8b1f96699e812fde734167fe9cb33b9fb9f7e1` (merged #648). Customer's actual iPhone screenshot `IMG_9356.png`: Jaipur, 8 November 2026. The ordinary clock row is inline, but previous-night Shivaratri expands into a large dated clock below its heading. The compact card occupies too much of Panchang.

## Cause and fix

The previous code selected a stacked layout merely because an endpoint crossed a date boundary, and included script-month suffixes inside 25dp clock text. The follow-up protected script glyphs with 42dp leading, which increased its height further. Long labels also competed with clocks on one line.

The fitted card groups every occasion heading once, separates labels from complete clock endpoints, places civil dates beneath their own endpoint at 11/19, and uses readable Inter SemiBold 18/26 for clocks only. Both endpoint dates remain explicit for carryover/parana and both years remain explicit across New Year. Full names and every window remain. The redundant subtitle is removed; margins, corners and motifs are smaller. No content cap, truncation, auto-fit or disabled accessibility scaling.

The normal time column is 132dp; the exact shipped Inter font was measured across all 1,440 HH:MM values. Maximum advance at 18dp is 53.5800dp, below the 55dp endpoint minimum. Two endpoints plus the 9dp dash and 8dp gaps consume 127dp. The fixture pins the font SHA-256; `mobile/scripts/measure-compact-occasion-clock.mts` reproduces it with the optional offline canvas rasterizer. The app imports no rasterizer or measurement engine.

Layout now uses the measured card width rather than only the viewport; below 280dp inner width or at Large/enlarged system text the label and clock groups stack. Same-width callbacks are ignored before state publication, so height changes do not create a measurement/render loop. No timer, async layout wait, image request or CPU solve added.

## Test correction

The earlier `jest.spyOn(RN, 'useWindowDimensions')` changed a Babel namespace copy while the component still received RN's default 750dp / fontScale=2 in every case. Consequently the earlier four-language matrix did not establish the advertised dimensions. The regression now mocks the underlying RN hook module used by the component, supplies measured host widths, checks both row and column outcomes, separates numeric clocks and script dates, verifies complete accessibility/share payloads and bounds real glyph advances including system scaling. This corrects the misleading earlier responsive evidence; rendered tests still do not prove native glyph/layout fidelity.

## Evidence

| Check | Result | Evidence |
| --- | --- | --- |
| Regression before fix | FAIL as expected | Previous card does not expose separated clock/date endpoints or measured-host layout |
| Affected component / navigation / share / art suites | PASS | 56 tests, including corrected hi/en/gu/kn × Standard/Large × 320/390dp and system scale, all 1,440 clock-width bounds, one heading for five prahars and no repeated render on equal layout |
| Typecheck | PASS | Full `npm test` proceeded past `tsc --noEmit` |
| Widget gate | PASS | 46 tests |
| Engine | PASS | 825 tests, including new overnight/parana/year-boundary/event regressions |
| Data | PASS | 223 tests |
| Ask | PASS | 49 tests |
| Complete local reader suite | PENDING / known baseline blockers | Full npm command and remaining independent shard attempted; this reused checkout previously lacks unrelated review/font fixtures and has WebView ESM harness failures. Hosted CI is required; no claim that the complete local suite passed. |
| Shell / workflow / native flow syntax | PASS | `bash -n`, YAML parsed; original timing expectations retained |
| Agent instruction policy | PASS | Entry-point verifier |
| Native iOS matrix | PENDING | PR-triggered unsigned simulator job; actual run results and screenshots must be reviewed |
| Physical Android / ANR | PENDING | No device or telemetry available here |

Before-fix run is recorded separately; no assertions weakened. All engine recipes, city/calendar/lens scoping, yielding/cancellation, full/focused sharing, dated Vrat navigation and deferred artwork are retained.

## Native acceptance

The existing `Native festival card iOS` workflow now runs for compact-card PRs. Its PR scope is the 21 compact/wide × hi/en/gu/kn × Standard/Large plus enlarged-system-text cases, including the actual share handoff. Existing manual/push triggers retain the full festival matrix. The flow checks that the expected clock is still visible after scrolling to the Vrat footer and captures a compact-fit screenshot. These are unsigned simulator verification builds with OTA disabled; no store or OTA release.

PENDING until actual results are reviewed: installed native matrix and human screenshot comparison; physical iPhone, Android compact/system-text and release-mode lower-configuration Android tap/scroll/Back/frame/memory/logcat/ANR evidence. This environment has no local native runtime. A parsed YAML, browser/canvas measurement or passing unit test is not native visual/ANR proof. Keep the PR draft pending required acceptance.

No new artwork, runtime dependency, content ID or persisted schema. This is a layout/formatting correction; calculation values and existing exports remain unchanged.
