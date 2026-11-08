# Khatu Shyam — Hare Ka Sahara reflections

Base: `d76213f3fae9b9d6a50d5ea9e2ec727db10c04a5` (merged #603).
Branch: `codex/suvichar-hare-ka-sahara`.
The GitHub git-commit resource confirms main's tree is `1bd6d5770d04df6869be2db976c5de29ca130db3`; the local test snapshot starts at that exact tree.

## Scope and acceptance

The user requested new Suvichar on “हारे का सहारा” after merging the original collection. Add eight app-written Khatu Shyam reflections as `VD-0077`–`VD-0084`, on hope after setbacks, courage, asking for help, and offering support. Keep all 76 previous original entries byte-for-byte unchanged and all 621 referenced entries available. The combined collection is 84 originals / 705 total messages. New messages belong only to `khatu-shyam`; English is editorial translation and Gujarati/Kannada use the existing Hindi re-scripting policy. Do not invent scripture attribution or promise guaranteed victories.

Existing daily/weekday rotation, search, manual selection, favorite persistence and sharing ingest these entries through the existing registry. No production logic, layout, assets, permissions, version, build, merge or release changes.

## Verification and pending gates

- New eight per-entry integration regressions fail on merged main before adding the content.
- PASS: seven focused suites / 122 tests; all earlier 76 entry objects compare exactly with merged main. Source correctness and Devanagari scans pass (two tests; 33 previously baselined Unicode instances remain elsewhere).
- Focused suites exercise all IDs, matching deity, four-script lookup, authorship, favorites, daily rotation, theme search, and selecting the final ID. Final results are recorded in the PR.
- Source correctness and Unicode scans include the expanded collection; source-count gates are updated from 76 to 84 without altering the original-prose authorship contract or scripture gates.
- The existing Maestro flow is extended to select `VD-0084` from Khatu Shyam, inspect the card, and prove it is absent under Jagannath. YAML parsing is separate from device execution.
- Full mobile tests follow the existing gate. Known pre-existing tour-version mismatch and sparse-checkout review-fixture failures remain distinct from the new content tests; current run results and CI are recorded in the PR.
- Native iOS/Android, compact/four-script Standard/Large, enlarged system text, offline/Back/lifecycle and actual WhatsApp/Instagram exports remain PENDING: there is no native runner in this Linux session. Required pending checks keep the PR draft.

U1/U2: current main, current policy, existing module/wiki and user scope reviewed. U7/U8/U10: eight entries integrated only with their matching shrine and existing assets, stable old IDs preserved. U11: design, rulebook, wiki and this record updated. U12: preserve remotely and verify local/remote tree equality before handover; no cleanup of the only copy. C1/C4/C7/C9 apply to content, attribution, sharing, favorite persistence and existing growing text; no new art, calendar, notifications, playback or release work.
