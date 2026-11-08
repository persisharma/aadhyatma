# PR #564 — Sanatan customs integration, 8 November 2026

## Intended result and entry routes

Home → Sanatan Parichay → प्रथा और मान्यता / ऐसा क्यों?. Sanatan search also
opens exact verified customs; Tulasi overview and its final page hand off to K6.
No separate Home Discover or More door. Vrat observance questions and Panchang
month cards retain local Pratha/reader routes and Back. All 208 records/305
stories, their evidence and 19 verified/189 draft states are preserved. No data
migration, new artwork, source re-verification, store release or OTA.

Base main: `62d9b6d725e58b93c42cdb239468a647c155af1c`.
Original preserved PR head: `c0095331c50d457bcc8e053e60bcc1e08770d493`.
Branch: `claude/pratha-manyata-prd`; PR: https://github.com/persisharma/aadhyatma/pull/564.
The adaptation is a merge of main plus focused changes, preserving both histories.

## Evidence and acceptance

| Check | State | Evidence or next action |
|---|---|---|
| U1/U2 scope and acceptance | PASS | Current AGENTS/checklist/RULEBOOK/design/wiki and PRD read; current Sanatan/customs source compared. |
| U3 native design | PENDING | Shared listing/prose/header/reading tokens used; inspect installed compact iOS/Android screens. |
| U4 language/size | PENDING | Renderer tests exercise hi/en/gu/kn × M/L; native compact/enlarged-system-text matrix remains required. |
| U5 routes/Back/saved | PENDING | Sanatan door/search/Tulasi, local route registration and saved-filter exclusion covered in automated tests; execute native Back journeys. Existing Sanatan storage keys/IDs remain unchanged. |
| U6 lifecycle/error/empty | PENDING | Draft/unknown IDs, empty search, sparse/adhik month boundaries covered; native lifecycle/playback paths remain required. |
| U7 content/asset integration | PASS for records | Eight canonical axis files are byte-for-byte unchanged from original PR; publication state and provenance gates remain. No new assets. Native visibility pending. |
| U8 sibling surfaces | PASS | Home/More promotion removed; Sanatan hub/reader/search, Vrat detail, Panchang, shared Katha page and sharing audited. |
| U9 automated/native tests | PENDING | Regression tests reproduced missing Sanatan door/Tulasi hand-off before implementation. Final full-suite results recorded below. |
| U10 performance/compatibility | PENDING | Lazy registry/routes retained, list window bounded, page counter uses settled paging, playback controls wrap. Release Android profile/logcat/vitals and iOS playback/export checks still required; no ANR-free claim. |
| U11 integration | PENDING | Main merged locally and all textual conflicts resolved; verify final remote head and CI. |
| U12 durability | PENDING | Push merge checkpoint, verify remote head and preserve this handover. |
| C1/C4/C7/C8/C9 | PENDING | Projection retains complete narrative and folk/regional context, no research footer, genuine reader links, stable IDs. Native prose export/share, audio/auto-slide, accessibility and Back remain separate gates. |
| C2/C3/C5/C6/C10 | N/A to changes | No new illustrated story/artwork, calendar rule, consent/reminder or release work. Existing calendar selection drives contextual cards. |

## Executed commands

- Before implementation: focused Sanatan regression tests failed exactly on the
  absent `sanatan-pratha` and `pratha-related-K6` controls.
- `npm run test:e2e:flow -- .maestro/pratha-smoke.yaml`: blocked with
  `maestro: not found`. No `adb`/`xcrun` executable was found. Native tests did not run.
- `bash -n mobile/scripts/native-sanatan-matrix.sh`: PASS.
- js-yaml parsed `pratha-smoke.yaml`, `_sanatan-language-size.yaml` and native
  Sanatan workflow: PASS. This is syntax evidence only.
- Current native CI now includes customs entry/search/Tulasi/Back/Vrat journeys
  and customs screens in the existing four-script × two-size matrix. Seasonal
  blocks count only when actually executed. Review screenshots and device logs.

## Final validation

In progress at the first durable checkpoint. Required native/export/profile gates
remain pending and the PR stays draft. No merge or release is authorized by this
record. See the latest commit and PR checks for the tested code head.
