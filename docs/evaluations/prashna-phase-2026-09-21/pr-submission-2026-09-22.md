# PR submission checks — 22 September 2026

Base refreshed to `origin/main` at `f81a4ceb`. Reconciliation preserves the newer regional-calendar and Pitru education features, cooperative engine work and Daan typography.

## Checks completed

- TypeScript: pass.
- Engine: 520 tests passed, including the expanded customer-copy guard.
- Reader/component suites: 205 suites, 1,786 tests passed. After removing the additional Pitru learning footer, its 7 focused screen tests passed again.
- Data: 125 tests passed, including the launch import budget. The earlier budget failure in this directory's historical logs no longer applies on current main.
- Ask: 47 tests passed, with all 223 positive corpus cases matching.
- Observance verification: pass, with 10 documented pre-existing day shifts and no wrong-month or missing-date failures.
- iOS production JavaScript export: pass; this is not a native release build.
- Whitespace: pass.

The first engine run exposed a machine-speed assumption in the newly merged cooperative-engine interruption test. The test now controls elapsed time so a fast CPU cannot complete the whole search inside the first allowed slice; runtime scheduling and astronomy are unchanged. The full engine rerun passed.

## Native evidence and remaining scope

The 21 September English/Hindi 402/375-point and large-text evidence remains available in this directory. It predates the copy-only removals. A fresh simulator pass was attempted during PR preparation but did not complete; it is not counted as a pass. Further testing was stopped at the user's request to submit the PR.

This PR is a reviewable career/business phase pilot. Seven other topics retain the earlier guidance model. Independent interpretation-source review, deeper narrative differentiation, Android, physical-device and VoiceOver certification remain open. Source verification flags remain false; no release, OTA or merge is performed.
