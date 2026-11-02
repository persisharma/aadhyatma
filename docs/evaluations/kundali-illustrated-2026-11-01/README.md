# Illustrated Kundali integration — 2 November 2026

PR: #591, branch `codex/kundali-illustrated-reading`. Base main: `caa457921a39202a83dc34e5b345a4e1f54cde28`. Canonical design, RULEBOOK and wiki updates are included with the owner’s approval.

## Implemented acceptance

- Saar groups Lagna, Moon sign and birth Nakshatra/pada, each opening a short explanation. Current Dasha uses its actual Maha/Antar portraits on parchment and links to the complete existing period surface.
- Every Chart-tab entry selects Chart picture first, Life areas second. The SVG names the actual house and sign; house 1 with Virgo/sign 6 remains house 1. All twelve houses are also available as full-size Life areas buttons.
- House sheets teach the reviewed everyday life area, each occupant, sign relationship and actual ruler placement. Empty houses are explained and linked to their ruler. Sheet Back retraces the learning path; closing, Android Back and person/tab changes clear transient explanations.
- Graha sheets show the existing reviewed personal meaning and care line for adults, then factor reasons and typed basis behind “Why this reading?”. Generic Graha Parichay and positions remain available for minors. Review tables, review flags and adult gate are unchanged.
- Friend/neutral/adversary is directional from graha to sign ruler, after own/exalted/debilitated dignity. Nodes stay ungraded. The sign relationship is separate from the existing four-factor counted overall reading tone.
- No repeated “केवल संकेत”/prediction-warning copy in the new cards. The page teaches the meaning and exposes its basis.
- Eleven recovered approved paintings are integrated through a typed offline PNG registry, also reused by GrahaReferenceScreen. Total **254,879 bytes**, independent **300,000-byte** budget; shipped/master hashes and reproducible export included.
- Existing birth inputs, roster/selection/persistence, edit/cancel/error recovery, full report, complete Dasha dates/progress/nine-period timeline, japa/practice and privacy-aware sharing remain on their existing paths.

## Language and layout contract

New headings/buttons/instructions are authored in Hindi, English, Gujarati and Kannada. Reviewed meaning prose follows the app’s current policy: English/Hindi authored, Gujarati/Kannada re-script the Hindi. This is not a claim of new native translations for the existing reviewed corpus.

Script-specific fonts, Standard/Large factors and system scaling remain enabled. Graha tiles use one column on compact or enlarged-text layouts; result tabs wrap to two rows and the profile summary stacks. Text has no line clamps or silent size reduction. Sheet titles sit inside the scrollable body; a pinned Done/Back footer stays reachable. Diagram labels follow the fixed-diagram contract; the Life areas view provides fully scalable text.

## Artwork provenance

The eleven original ImageGen masters were recovered from their persistent approved conversation outputs. Original filenames and SHA-256 are pinned in `mobile/assets/icons/kundali/manifest.json`; `scripts/export-kundali-icons.py MASTERS_DIR` reproduces the native PNGs using Lanczos fit and a 256-color alpha palette, without repainting. Source and exported subjects were reviewed as a complete contact sheet: cratered Mercury/Moon, red Mars, fiery Sun, striped Jupiter, cloudy Venus, ringed Saturn, and distinct Rahu/Ketu node medallions. Lagna is a rising-horizon wheel; Nakshatra is a symbolic Moon/star cluster, not a map of the selected constellation. The paintings retain their pigments; chrome uses theme tokens.

Exact original generation-prompt strings are still pending recovery. Do not label reconstructed descriptions as exact prompts. That provenance gate and native subject/framing inspection remain pending before merge. Full-resolution masters remain retained in the original conversation; only the small native exports enter the app bundle.

## Evidence and remaining checks

| Check | Status | Evidence / next action |
| --- | --- | --- |
| U1 Scope/source | PASS | Current branch, main, repository instructions, RULEBOOK §14, design §51/78/80, PRD and Panchang wiki inspected. |
| U2 Acceptance | PASS | Complete observable criteria above, including house/sign confusion and empty-house ruler links. |
| U3 Native design fidelity | PENDING | Compare installed iOS/Android against approved illustrated direction. Source/contact sheets are not native screenshots. |
| U4 Four languages/sizes | PENDING | Eight automated language × Standard/Large compact/enlarged-text cases authored. Execute final-head CI and the native matrix; no device fit claim yet. |
| U5 Reachable journey | PENDING | Existing result integration assertions updated; new sheet navigation, main-tab reset and focused reference paths covered in tests. Native Kundali/multi-profile flows still required. |
| U6 Lifecycle/stores | PENDING | No store schema/input changes. Native fresh/saved/error/offline/restart/person-switch checks still required. Selection is tied to chart identity. |
| U7 Content/artwork | PENDING | Approved sources recovered, eleven hashes/alpha/dimensions/budget checked; exact prompt provenance and native framing remain. |
| U8 Sibling surfaces | PASS | GrahaReferenceScreen shares the same painted identities. Static report/share chart callers retain their existing rendering. |
| U9 Tests | PENDING | Four pure model regressions passed locally using Node 24’s installed type transform and the official astronomy-engine 2.1.19 source. Final-head typecheck/full Jest/engine/data/Ask CI and Maestro pending. |
| U10 Performance/data | PENDING | No new package/store schema/solve; 255KB feature-art budget. Measure native image decode/taps and saved-profile compatibility. |
| U11 Integration/docs | PENDING | design.md, RULEBOOK and wiki updated with owner approval; verify final-head CI/mergeability. |
| U12 Durability | PENDING | Verify final remote branch and PR head after uploading the implementation checkpoint. No cleanup of the only copy. |

Applicable: C3 artwork, C5 Jyotish, C7 navigation, C9 accessibility. C4 sharing regression only: renderer unchanged; actual export/handoff unverified. C1/C2/C6/C8/C10 are N/A: no scripture/story/reminder/playback/release changes.

Local environment has no installed React Native/Jest/TypeScript toolchain or native simulator. The pure source tests use Node’s type transform, a local extension resolver and the official astronomy-engine source at tag v2.1.19; no repository dependency/script change is made for that harness. Complete repository checks run in PR CI. Keep draft until required native checks and original prompt provenance are complete. No merge, native build, OTA or release is authorized here.
