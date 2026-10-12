# नवग्रह voice rebuild — Saturn narrative pilot + "Know the nine grahas" reference

**Date:** 2026-10-09 · **Status:** pilot implemented (Saturn), behind its own review gate.

## Problem

The graha cards (and Prashna answers) read like a machine: the body is assembled from fixed `(graha × house)` lookup cells (`GRAHA_BHAVA_READINGS`), so a strong and a weak placement read almost identically — the engine computes sign/dignity/lordship/combustion but none of it reaches the body copy. Users find it generic ("half the information is wrong") or artificial. The card also mixes generic textbook facts (what Saturn *is*, friends/enemies, karaka) with the chart-specific reading, which makes it a datasheet.

## Decisions (from the brainstorm)

1. **Bar = depth + voice.** The prose must change with the actual chart AND read like a person wrote it.
2. **Vertical pilot first: Saturn.** Prove the bar on the hardest-to-warm graha; the other eight follow, then B (minor register) and C (Prashna), reusing the same engine.
3. **Card shape: lead narrative + "one thing to tend" + upay + आधार.** The bullet blocks (About/Friends/Why/gives/care/rules) are replaced by the narrative; upay and आधार are unchanged.
4. **Depth engine = hybrid.** Hand-written core per `house × dignity bucket` + a deterministic modifier layer for lordship/combustion/retrograde. No LLM (that layer comes later).
5. **Two surfaces.** Personal reading ("Know YOUR grahas", the chart card) vs generic reference ("Know THE grahas", teaching). Generic facts move to the reference so the card stays a reading.
6. **Reference placement:** a launcher card in the Jyotish hub (KundaliScreen) + a `Know <graha> →` link on each card (and other relevant places).
7. **Prod safety:** the narrative has its OWN review gate, separate from the OTA'd legacy card.

## Design

**Engine — `grahaReadingNarrative.ts` (pure).**
- `dignityBucket(dignity, relation)` → `strong | friendly | neutral | weak`.
- `SATURN[house-1][bucket]` = `{ leadHi, leadEn, tendHi, tendEn }` — 12 × 4 = 48 hand-written cells.
- Modifier clauses (lordship / combustion / retrograde), appended in fixed order only when present; lordship names the ruled houses by ordinal (grammar-safe for the self-house).
- `composeNarrative(input)` → `{leadHi/En, tendHi/En}` or `null` for grahas not in `NARRATIVE_GRAHAS` (Saturn only).

**Wiring.** `grahaCard()` attaches `KundaliGrahaCard.narrative` for piloted grahas. `GrahaReadingList` renders the narrative (lead + tend) in place of the legacy bullets when `showNarrative = __DEV__ || narrativeReadingsApproved()`, keeping upay + आधार; it also shows the `Know <graha> →` link when `onLearnGraha` is provided.

**Gate.** `GRAHA_NARRATIVE_REVIEW` (ships `draft`) + `narrativeReadingsApproved()`, separate from `GRAHA_READING_REVIEW`. Store builds keep the approved legacy card until the Saturn narrative is signed off; dev previews it.

**Generic reference.** `grahaReference.ts` (authored `{nature, signifies}` per graha; name/meaning/maitri/weekday reused from reviewed tables) + `GrahaReferenceScreen` (route `GrahaReference`, `focusGraha` deep-link), reusing the deity index→detail pattern. Launcher card in `KundaliScreen`; link from `GrahaReadingList` via `KundaliReportScreen.onLearnGraha`.

## Tests

`grahaReadingNarrative.test.ts` (buckets, null for non-pilot, strong≠weak depth, modifier presence, 12×4 completeness, §14.3.5 bans, the separate gate); `grahaReference.test.ts` (completeness + bans); `GrahaReferenceScreen.test.tsx` (lists nine, focus expands, tap toggles); `GrahaReadingListNarrative.test.tsx` (narrative renders in dev, learn link). Existing `grahaReading.engine.test.ts` + `KundaliReportExperience.test.tsx` stay green (legacy path and OTA'd gate untouched).

## Out of scope (follow-ons)

- **B — minor register:** a parent-facing narrative cell set selected when `band ≠ adult`, same composer.
- **C — Prashna answers:** the same lead-narrative + modifier method applied to the ask-a-question assembly.
- The other eight grahas' narrative cells (each its own jyotishi sign-off before `NARRATIVE_GRAHAS` grows).
- LLM narration layer over the deterministic basis.

Prototype: `.context/prototypes/saturn-narrative-pilot/`. Docs: design.md §78/§79, RULEBOOK §14.7.10.
