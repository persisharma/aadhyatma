# Native night-header preview

The moon is a fixed painted phase illustration shown only between the selected
location's calculated rise and set, with no bright Amavasya disc. Stars remain
before rise and after set. The night retains sunset/sunrise boundary times; the
moon no longer travels on that night-duration arc. Daytime sun behavior is unchanged.

The moonrise footer follows the running night, including the previous sunset
before dawn. Rises on another civil date are dated explicitly. Times follow the
app's shared 24-hour format.

## Captures

Dedicated iPhone 17 Pro simulator, iOS 26.5, Ujjain. The app runtime clock was
temporarily simulated; the status bar retains actual capture time. `captures.json`
records the state, instant and clock restoration. Each state passed the focused
Maestro capture flow and was visually inspected.

| Capture | Simulated instant | Expected header |
| --- | --- | --- |
| `ios-before.png` | 28 October 2026, 19:00 IST | Stars only; moonrise 19:31; yet to rise |
| `ios-after.png` | 28 October 2026, 20:00 IST | Painted waning moon; moonrise 19:31 retained |
| `ios-set.png` | 20 October 2026, 02:00 IST | No moon in sky; moon has set; rise dated 13:39, 19 Oct |

The last case's moonset is 00:44 on 20 October. Its rise was the previous afternoon,
so an undated 13:39 would misleadingly look upcoming. Decorative phase icons on an
observance ribbon or Tithi tile remain calendar illustrations, not sky visibility.

## Reproduction

Use the dedicated debug simulator with completed setup and this checkout's Metro
on port 8106. `preview-clock.mjs` is an external local-debug helper; no app entry
point imports it. It uses the local Hermes inspector and supports explicit restore.

From the repository root, set one of the ISO instants above with:

```sh
node docs/evaluations/panchang-day-icons-2026-10-27/night-horizon/preview-clock.mjs '2026-10-28T19:00:00+05:30'
```

Run `mobile/.maestro/panchang-night-horizon-capture.yaml` with `PREVIEW_DATE`,
`RESET_DATE`, `EXPECTED_STATE` (`not-risen`, `above` or `set`) and `SCREENSHOT`.
Reset through the preceding civil date so hooks recompute after changing the
preview clock. Assert the readable horizon-state label; the decorative moon is
intentionally hidden from accessibility and cannot be a visibility selector.

Always restore immediately after the preview:

```sh
node docs/evaluations/panchang-day-icons-2026-10-27/night-horizon/preview-clock.mjs restore
```

## Validation and limits

Typecheck, focused ESLint, 23 Jest checks and five real-engine horizon tests pass.
The three native state checks use completed setup; they do not establish first-run,
Android or VoiceOver acceptance. The original development server exhausted its
12GB heap during broad lazy-route warmup; captures resumed with Node 22, a 20GB
heap and one Metro worker. After merging the 24-hour formatter, the app was cold
reloaded before the final captures so cached older JavaScript could not produce
outdated time labels. No release, OTA or store upload is part of this work.
