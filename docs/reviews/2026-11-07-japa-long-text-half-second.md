# Japa long-text and half-second follow-up

Base: `87aa027ef13f4831229ba74d700edeec2633a0f9` (merged #651).
Branch: `codex/japa-long-text-500ms`. Separate follow-up PR requested by the owner.

## Observable change

Gayatri/Hare Krishna could fit the outer ornamental band before any words reached the inner one. Smaller frames could also strand one final word on an outer-only page. Bounded, memoized whole-word packing balances the last page across both bands. Full canonical text, shaped syllables, circle geometry, infinity/count placement, complete reader and Mala/footer layout remain unchanged.

Every automatic jap takes **500ms extra after the selected tempo**. Silent 1× examples: Radha 880 → 1380ms; Om Namah Shivaya 1000 → 1500ms; Gayatri 4000 → 4500ms; Hare Krishna 4400 → 4900ms. At 1.5×, Gayatri is 2667 → 3167ms. Recordings retain their decoded natural average and use a pitch-corrected effective rate: `naturalMs / (round(naturalMs / selectedRate) + 500)`. The bead clock and visual phase share that rate; no second timer/count owner is introduced. Tiny malformed clips respect the native 0.1 rate floor. Manual Mala taps are unchanged.

## Verification

- Reproduced the empty-band bug before the fix with two failing named-mantra regression cases.
- Exact locked-font fixtures cover all 22 mantras and 16 long Tandav shlokas × four scripts × 280/296/340dp (456 cases): complete text, shaped runs, radial/angular clearance and ≤768 decorative nodes.
- Regression cases require every Gayatri/Hare Krishna band/page to contain text. Compact actual-screen tests cover both mantras × four languages × Standard/Large, complete primary reader and count placement.
- Timing tests cover every catalogue mantra × all 11 selectable speeds, recorded native rate/visual period agreement, loading metadata, loop seams, first autoplay configuration and extra-time bead gating.
- Code tested at `6f5a5ccd6eacaa4e507f91baab84da9de0bd9f57`: typecheck PASS; lint PASS (0 errors / 448 existing warnings); all three Jest shards PASS (373 suites / 3840 tests). Widgets, engine (830), data (223) and Ask (49) scripts all exit 0.
- iOS + Android Expo/Hermes production exports PASS (51.6 MB bundles). This verifies bundling, not native playback or device rendering. Instruction verification and `git diff --check` PASS. Subsequent changes are evidence/documentation only.
- Native visual/audio listening, device lifecycle and 20-minute low-end Android profiling: **PENDING**; no native runtime is available in this session. Maestro smoke cadence comments updated; flow not executed.

## Documentation and delivery limits

The Japa wiki and karaoke timing contract are updated. Root `design.md` §35 and the Japa integration rule still need a separate documentation-sync follow-up: automatic approval review previously rejected uploading those full root documents to the public repository without explicit file-level authorization. This PR does not retry that upload. Keep the PR draft while native acceptance and root-document sync remain pending. No merge, OTA, version bump or store build is part of this task.

## Wiki log entry preserved for later sync

The large `wiki/log.md` upload did not return a verified Git blob, so it is excluded from the published tree. The feature wiki and karaoke contract are preserved remotely; the intended appended entry is captured here without uploading the whole historical log:

> 2026-11-07 — Japa long-text band allocation and extra half-second. Fixed greedy outer-first allocation that left Gayatri/Hare Krishna inner bands empty, including stranded final-page words. Bounded memoized packing keeps full script runs and existing geometry/node limits. Each automatic jap now takes 500ms more after tempo scaling; native pitch-corrected audio and its bead reducer share the effective padded rate. Manual Mala/count ownership and the approved layout stay unchanged. Native audio/visual/low-end acceptance remains pending.
