# Proportional Japa cadence

Owner clarification: Gayatri should gain 500ms; other chants should gain proportionally rather than a fixed half-second. Follow-up to merged #653; base main `91adc5f2dd23f4ef0a7e65d80f0b345ba6eec696`.

## Contract

Use a 1.125 scale from Gayatri's 4000 → 4500ms calibration, then apply the selected speed: `round(previousNaturalDurationMs × 1.125 / speed)`.

| Silent chant | Previous baseline at 1× | New 1× period | Increase |
| --- | ---: | ---: | ---: |
| Radha / Jai Shri Ram | 880ms | 990ms | 110ms |
| Om Namah Shivaya | 1000ms | 1125ms | 125ms |
| Gayatri | 4000ms | 4500ms | 500ms |
| Hare Krishna | 4400ms | 4950ms | 550ms |

Gayatri at 1.5× becomes 3000ms, at 0.5× 9000ms. The extra time follows the whole utterance and speed, rather than being a fixed post-speed pause. A recording retains its decoded natural average and uses matching pitch-corrected playback; the existing bead reducer and visual loop share that cadence. No count owner, timer, storage, content, frame, glyph allocation or UI layout changes.

## Acceptance and evidence

- Regression timing tests fail on the fixed-delay implementation (8 failures), covering short names, whole-utterance speed scaling, recording duration and every catalogue mantra/rate.
- Test realistic recorded 880ms and 4000ms utterances through the actual player, including no early bead, exactly one count, duration-zero seam and autoplay rate setup.
- Existing screen tests retain all four UI scripts, Standard/Large and compact Gayatri/Hare Krishna complete-reader coverage; motion tests retain pause/resume/stale-callback/single-owner checks.
- Full suite/typecheck/lint: pending at initial checkpoint; final results in PR.
- Native audio listening/lifecycle, Maestro and low-end Android 20-minute profiling: PENDING. No device runtime found; tests do not prove device audio or ANR freedom.

## Documentation sync and preservation

The Japa feature wiki and karaoke host contract are updated. Full root `design.md` / `RULEBOOK.md` uploads were rejected earlier by automatic approval review pending explicit file-level publication authorization; this task does not retry them. The matching proposed spec is the contract above: design §35's 1× examples should be Radha/Jai Shri Ram 990ms, Om Namah Shivaya 1125ms, Gayatri 4500ms, Hare Krishna 4950ms; all cadence is proportional ×1.125 before speed. The Japa integration rule must retain a single count owner and the same shared cadence for recording and visual motion. Keep draft while root sync and native acceptance remain pending.

Intended wiki log entry is preserved here without re-uploading the full historical log: **2026-11-08 — Gayatri-derived proportional cadence**. Replaced fixed +500ms with ×1.125 before tempo; shorter chants receive smaller delays. Shared silent, recording, bead-clock and visual timing remain aligned; approved design unchanged.
