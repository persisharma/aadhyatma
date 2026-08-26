---
title: Bhog, Naivedya and Vrat Food
type: subsystem
sources: [mobile/src/panchang/bhogContent.ts, mobile/src/panchang/bhogContentExtended.ts, mobile/src/panchang/types.ts, mobile/src/panchang/festivals.ts, mobile/src/components/BhogGuidancePanel.tsx, mobile/src/screens/ObservanceDetailScreen.tsx, mobile/src/screens/VidhiDetailScreen.tsx, mobile/src/data/vidhi/checklistStore.ts, mobile/src/panchang/__tests__/bhogContent.test.ts, mobile/src/screens/__tests__/ObservanceDetailScreen.test.tsx, mobile/src/screens/__tests__/VidhiScreens.test.tsx, mobile/.maestro/vidhi-smoke.yaml, docs/roadmap/prds/23-bhog-naivedya-vrat-food.md, RULEBOOK.md, design.md]
last_verified_date: 2026-08-26
confidence: high
status: current
---

## Summary

PRD-23 adds verified, offline household guidance for deity/festival offerings, food during a fast,
food abstained during a fast, prohibited offerings, and parana meals. All three product phases now
publish 39 profiles backed by 108 URLs across 50 domains. Every genuine `vrat`/`upavas` rule is
covered (68/68), while ritual-calendar rows are no longer misrepresented as fasts. Every profile
carries two or more independent published sources, a dated verification note, bilingual content,
and an explicit tradition/variant note.

## Details

**Data and gate.** `BhogContentEntry` deliberately has separate fields for `offerings`,
`permittedDuringFast`, `abstainedDuringFast`, `doNotOffer`, and the parana meal. It also holds
observance ids, Vidhi ids, additive kitchen items, status, and private provenance. Rules attach via
`bhogId`; a Vidhi is found through its reverse `vidhiIds` mapping. `getBhogContent` and
`getBhogForVidhi` expose verified entries only, so drafts and unknown ids are identical to screens.
The module-scope invariant guards ids, bilingual fields, source count and hooks; the test suite adds
independent-domain, dated-note, draft-filter, Devanagari, and customer-copy gates.

**All-phases coverage.** `bhogContent.ts` owns the ten high-use v1 profiles and
`bhogContentExtended.ts` owns 29 recurring, annual, advanced, and regional profiles. The test suite
filters the live catalogue by the genuine `vrat` and `upavas` categories, pins the expected 68-rule
set size, and requires every row to have a verified, exposed `bhogId`. Adding a new eligible rule
without sourced content therefore fails the engine gate. Mahadwadashi/ISKCON reuse the adjudicated
Ekadashi family, and Sakat Chauth reuses the Ganesha/Sankashti family; other long-tail practices keep
narrow profiles where timing, offerings, or food rules differ.

**Taxonomy correction.** The advanced helper had made `chandra-darshan`, `ishti-anvadhan`, and
`shraddha-dates` look like fasting rows. All three are now ritual-calendar `festival` records.
Chandra Darshan and Ishti/Anvadhan receive no invented food menu. Shraddha still hooks to
`pitru-offering`, which distinguishes water/til tarpana, pinda and meal offerings, feeding others,
and the performer's own lineage-dependent food discipline.

**Observance surface.** `ObservanceDetailScreen` resolves `rule.bhogId` and adds an independent final
`भोग · नैवेद्य · भोजन` block. This does not change the Upvas/Vidhi four-state How-to-observe home.
`BhogGuidancePanel` is a shared, non-interactive card and renders only the sections populated by that
profile. Review status, source URLs and verification notes never enter its props.

**Vidhi preparation.** `VidhiDetailScreen` shows the same verified panel above the samagri accordion.
Kitchen additions render below the ritual list in their own ledger. They persist in the existing
vidhi + occurrence-date checklist record using `bhog:<profile>:<item>` keys and are appended as a
separately headed section when the list is shared. Samagri progress filters against the base samagri
keys, so checking flour or bananas cannot make the ritual list appear complete.

**Source adjudication.** Government culture publications, temple/sampradaya institutions, published
procedural references, and textual translations were cross-checked claim by claim. The candidate
brief's blanket no-Tulsi-plucking-on-Ekadashi and no-durva-outside-Ganesha claims did not clear that
bar and were omitted. The ordinary Ganesha no-Tulsi convention and published Ganesh Chaturthi
exception are stated together. Shivaratri panchamrit ingredients are identified as abhisheka
materials rather than silently treated as a drink or required naivedya. The complete source groups
and decisions live in `docs/roadmap/prds/23-bhog-naivedya-vrat-food.md`.

**Verification.** On 2026-08-25 the complete mobile gate passed: 1,217/1,217 Jest tests, 303/303
engine tests, 75/75 data tests, typecheck, and lint with zero errors. `vidhi-smoke.yaml` then passed
separately on an iOS 26.4 native development build and an Android 16 / API 36 release APK with the
current worktree bundle embedded. The flow covers the Bhog panel, independent kitchen and ritual
checked states, Puja phases, conduct paging, navigation, and language restoration.

The 2026-08-26 all-phases bundle passed the full mobile gate (including 304/304 engine and 75/75
data/content tests), lint with zero errors, and the same end-to-end flow on iPhone 17 Pro / iOS 26.4.
The first iOS attempt lost the XCUITest driver connection during launch; a clean retry passed every
app assertion. Android tooling was unavailable for the expanded bundle, so the 2026-08-25 Android
v1 pass remains historical evidence rather than current all-phases proof.

## Dependencies

- [[panchang]] — observance rules and Observance Detail entry.
- [[puja-vidhi]] — preparation surface and occurrence-scoped checklist storage.
- [[languages]] — authored hi/en and runtime language selection.
- [[e2e-verification]] — device runs are recorded separately; all-phases iOS passed on 2026-08-26 and Android remains pending.

## Gotchas

- **A permitted food is not automatically an offering.** Keep the data fields and rendered sections
  distinct; flattening them changes religious meaning.
- **An abhisheka ingredient is not automatically edible guidance.** The Shivaratri distinction is a
  pinned content-correctness case.
- **Do not count kitchen checks as ritual progress.** The shared storage record contains both key
  families, so completion must filter against `vidhi.samagri` rather than use `checked.size`.
- **Do not duplicate base samagri in `shoppingItems`.** The kitchen list is additive and one shopping
  trip does not make the two domains one list.
- **Variant disagreement is not an invitation to average.** Name the scoped variants or leave the
  claim out; do not promote one regional menu or prohibition to a universal rule.
- **Coverage is not a universal menu.** Weekday fasts deliberately refuse a planet-food matrix;
  Chaturmasa names the publishing lineage for exclusions; Jivitputrika, Shitala, Bachh Baras and
  Kojagara name the region attached to their dishes.
- **Verification metadata is private.** The source trail exists for review and tests, not as a
  customer-visible citation/status panel.
