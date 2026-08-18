# PRD-19 · Phase 3 — श्राद्ध/तर्पण विधि, Recorded Audio & Regional Variants

| | |
|---|---|
| **Status** | **ON HOLD — product decision, 2026-08-18.** Not scheduled for implementation right now (unlike the dropped 14-P2/17-P2–3, this one may be revived). Detail PRD and prototype remain the approved spec when it is picked up. Do NOT pick this up from a backlog/enrichment sweep without an explicit product go. Hard content gate unchanged: egress-capable authoring environment required. |
| **Parent** | [PRD-19 पूजा विधि](./19-puja-vidhi.md) §8 Phase 3 · [PRD-17 पितृ स्मरण](./17-pitru-smaran.md) §7 Phase 3 (the cross-link — this document IS both phase lines; neither PRD has any further phase after this) |
| **T-shirt size** | Part A: M (one vidhi entry + a new anchor kind + 3 door surfaces + third-stack registration). Part B: M–L (assets + player wiring; store release). Part C: M per varianted vidhi (verification dominates) |
| **Prototype** | [`docs/shraddha-vidhi-prototype.html`](../../shraddha-vidhi-prototype.html) — person-detail vidhi door, tarpan तैयारी checklist, conduct card with Gita-paath hand-off + the Part-B audio affordance, variant selection; **every liturgical string in it is an illustrative placeholder** |
| **Feasibility** | Engine work is nil (PRD-17 already solves every date this phase needs); screens/navigation are extensions of shipped patterns. **The content is the blocker — see §0.** |

> **Completes PRD-19.** Phase 3 is the last phase of the Puja Vidhi PRD: the seventh (shraddha/tarpan) vidhi with its Pitru Smaran cross-link (Part A, the headline), plus two explicitly optional product decisions — recorded step audio (Part B) and regional variants as named alternates (Part C). No further phases exist or are implied.

---

## 0. The honest content gate (read first)

**The shraddha liturgy cannot be authored today, and this PRD does not pretend otherwise.** RULEBOOK §11.3 forbids composing liturgical text and forbids claiming unopened sources; §3.4 of the parent PRD requires two independent published references per vidhi (DrikPanchang as the common procedural reference plus one more), with the Gita Press canonical edition separately recorded as verified or honestly pending. That verification **cannot run from an environment where DrikPanchang and archive.org are unreachable — attempted and recorded 2026-08-12 and 2026-08-14** (each shipped entry's `canonicalEditionStatus` in `mobile/src/data/vidhi/*.ts` carries the dated attempts, e.g. `maha-shivaratri-puja.ts`).

Therefore this document is a plan for **what to build and how to verify it** — data contracts, surfaces, navigation, state, privacy, tests — all of which can be reviewed and even scaffolded now. The vidhi's actual samagri list, step sequence, and any mantra text ship **only** after an egress-capable authoring session performs the §3.4 verification. The attached prototype uses clearly-marked illustrative placeholders and must never be transcribed into `mobile/src/data/vidhi/` as if it were sourced content. Until the entry exists in the registry, **every door specified below is absent** (the never-a-placeholder rule, same gate as the Observance Detail "How to observe" card).

## 1. Prerequisites (carried, not scope)

1. **Canonical-edition sign-off for the six shipped vidhis** — the standing Phase-2 carry-over. Same environment requirement, same clearing procedure: open the recorded Gita Press scans, check character-by-character, update each `canonicalEditionStatus` from its honest pending state. This phase does not subsume that work; it merely shares the unblocking event.
2. **An egress-capable authoring environment** (DrikPanchang + archive.org reachable) for §0's verification.
3. PRD-17 Phases 1–2 shipped (they are — native-verified iOS 2026-08-13): `pitruSmaran.ts` solves, list/add/detail screens, Pitru Paksha overview, day chips.

---

# PART A — श्राद्ध/तर्पण विधि + the Pitru Smaran cross-link (the headline)

## 2. What the seventh vidhi is

A householder shraddha/tarpan procedure for a personal punyatithi day (and for Pitru Paksha shraddha days), as the seventh `VidhiEntry` in `mobile/src/data/vidhi/` — id `shraddha-tarpan-vidhi`. Same two modes as every vidhi:

- **तैयारी** — the tarpan samagri checklist (kusha, til, jau, water vessels, white flowers… — *final list comes from the verified sources, not from this PRD*), occurrence-scoped to the personal date (§5).
- **विधि (conduct)** — swipe-only paged steps, `prep | main | closing` phases, reader-grade type. Steps that are recitation hand off to shipped texts; PRD-17's person detail already links **Gita adhyaya 15 and adhyaya 2** (`GITA_PAATH_CHAPTERS` in `PitruSmaranDetailScreen.tsx`) — the vidhi's paath steps reuse exactly those chapters via a new Gita-capable ref (§6), never re-typed text (§11.11).

**Tone is Pitru Smaran's, not the festive vidhis':** muted gold-and-ink, no saffron celebration accents, no celebration seal copy beyond the standard quiet ॐ, and guidance language that never prescribes obligation (the PRD-17 §5 stance applies inside conduct mode). Mantra steps (tarpan formulae, sankalpa) ship **only** verbatim-verified; until then those steps are instruction-only, exactly like the Satyanarayan sankalp worked example (RULEBOOK §19 rule 2).

## 3. The new linkage kind: a personal-tithi-anchored vidhi

The six shipped vidhis anchor to **festival rules**: `festivals.ts` rows carry `vidhiId`, and `getVidhiForFestival(ruleId)` resolves the door. A shraddha vidhi's day is **personal** — a `SmaranEntry`'s solved tithi date — so this phase adds a second anchor kind rather than faking a festival:

```ts
// types.ts delta
export type VidhiAnchor = 'festival' | 'personal-tithi';
export type VidhiEntry = {
  …
  /** 'festival' (default, omitted on the six shipped entries) or 'personal-tithi'. */
  anchor?: VidhiAnchor;
};
```

- `anchor: 'personal-tithi'` means: occurrence dates come from `solveNextOccurrence` / `pakshaShraddhaDay` (`mobile/src/panchang/pitruSmaran.ts`) for a saved person — **not** from the festival engine. `festivalIds` stays usable so the vidhi may *also* door on the named **सर्वपितृ अमावस्या** rule PRD-17 added (the one public day of the family); the two anchors are additive, not exclusive.
- The registry invariant suite (`vidhiContent.test.ts`) gains: a `personal-tithi` entry must have ≥1 door surface (a `festivalIds` entry or the Pitru cross-link constant), and the shipped six must have no `anchor` field.
- The catalog (`VidhiCatalogScreen`) lists it like any vidhi — always-available, opened undated (checklist then keys to the civil day, the existing `dateMs?` semantics).
- **Search:** the entry gains its section row automatically — `searchIndex.buildSectionEntries` appends one row per registry entry with no index code change; `searchIndex.test.ts`'s `library.length + VIDHI_ENTRIES.length` pin moves from +6 to +7 in the same PR.
- **Routine:** no `AddToRoutineButton`. The shipped gate is a `festivalIds` rule with `recurrence: 'monthly'`; a shraddha day is annual and personal, and the per-person smaran reminder already owns that cadence. A routine item for grief would also collide with PRD-17's no-gamification stance — deliberately excluded, not deferred.
- **Panchang day panel:** on सर्वपितृ अमावस्या (a public rule carrying this `vidhiId` via `festivalIds`), the ObservanceCard's standard `॥ पूजा विधि` pill applies — but rendered in the **muted gold** pill treatment, not the festive filled saffron; the day is observance, not celebration. Personal days keep their private ॥ स्मरण chip → person detail → door (no vidhi pill on the public panel for a private date — the panel must never hint that this device holds a family entry).

## 4. Cross-link surfaces (this section is PRD-17 Phase 3, verbatim)

PRD-17 §7 Phase 3 reads "shraddha/tarpan vidhi cross-link (with PRD-19)". **These doors are that phase — building Part A closes both PRDs' final phase lines.** Both doors gate on `getVidhiById('shraddha-tarpan-vidhi')` resolving; while the registry lacks the entry (i.e., today), neither renders anything — no teaser, no "coming soon".

1. **Person detail** (`PitruSmaranDetailScreen.tsx`, More stack): a `॥ श्राद्ध विधि` action row in the linked-content group, above the two Gita-paath rows, carrying the person's **next solved occurrence** as `dateMs` (the hero pill's date — already solved warm-first by `useSmaranDetailSolve`). During the Pitru Paksha window, a second caption line offers the person's paksha day as the occurrence instead (whichever is sooner leads).
2. **Pitru Paksha overview** (`PitruPakshaOverviewScreen.tsx`): one quiet door row beneath the fortnight list — "श्राद्ध विधि देखें" — opening the vidhi detail with the tapped/soonest family-matched day as `dateMs`. Rows for individual days do not each grow a pill; the fortnight stays a calendar, not a launcher.
3. **Reverse link** (PRD-19 → PRD-17): the vidhi detail screen for this entry shows the standing invitation row "अपने पितरों की तिथियाँ जोड़ें → पितृ स्मरण" **only when the ledger has zero entries** (via `usePitruSmaran`), routed with `moreTabTarget` (`navigation/entryRoutes.ts`). With entries present the vidhi is already reached *from* the ledger and the row is noise — omitted.

## 5. Navigation contract & occurrence scoping

- **Third-stack registration.** `PitruSmaranDetail`/`PitruPakshaOverview` live on the **More stack**, where the vidhi routes are not registered (`MoreStackParamList` in `navigation/types.ts` does not intersect `VidhiStackParamList`; only Home and Panchang do). Per RULEBOOK §6.0.1 and the shipped back-navigation rationale, this phase makes it `MoreStackParamList = VidhiStackParamList & { … }` and registers the three vidhi screens in `MoreStackNavigator.tsx`, so both doors **push in place** and back retraces the journey. `navigation/__tests__/vidhiBackNavigation.test.ts` extends to the third navigator (the shared param type catches a missing param, not a missing `Stack.Screen` — that test is the net).
- **Shipped-text hand-offs from the More stack** already work: the conduct screen routes refs through `navigateToHomeStackTarget` (`entryRoutes.ts`), which checks `getState().routeNames` and falls back to `HomeTab` — the readers live only on the Home stack, and this is precisely the case that helper exists for. No new mechanism.
- **Occurrence scoping.** `dateMs` = the personal solved date (annual tithi occurrence, or the paksha day). `checklistStore.ts` needs **no schema change**: samagri state stays keyed `{vidhiId: {samagri: {dateKey, checked}}}` — a fresh personal date starts a fresh checklist, exactly as a fresh festival date does. The annual date and the paksha day are **two distinct occurrences** with distinct dateKeys (see edge cases).

## 6. Data-model deltas (Part A, consolidated)

```ts
// types.ts
anchor?: 'festival' | 'personal-tithi';                    // §3
export type VidhiRef =
  | { kind: 'katha'; id: string }
  | { kind: 'section'; id: string }
  | { kind: 'gita'; chapter: number };                     // NEW — Gita-paath hand-off
```

> **Reconciliation note (resolved):** [17-namkaran-phase2-3.md](./17-namkaran-phase2-3.md) independently proposed `occasion?: 'festival' | 'sanskar'` on `VidhiEntry`, but that PRD was **dropped by product decision on 2026-08-18** — `anchor?:` can land here as the single reviewed `VidhiEntry` change with one updated `vidhiContent.test.ts` invariant. If the namkaran phases are ever revived, that PRD must reconcile with whatever this one shipped.

The `gita` ref kind is required because `GitaReader` is chaptered (`{ chapter }` route param) and no `section` id addresses a single adhyaya. Hand-off caption for it is **पाठ** (the category-aware caption rule — never "आरती"). `vidhiContent.test.ts` pins that every `gita` ref's chapter is 1–18 and that this entry's refs cover the same chapters PRD-17 links (15 and 2) so the two features can never drift apart.

## 7. Privacy contract (locked)

1. **Names of remembered family NEVER enter vidhi state, route params, or notifications.** Vidhi routes carry `{vidhiId, dateMs}` only — never `entryId`, never a relation or name. Back returns to the person detail because the door *pushed from it*, not because the vidhi knows the person.
2. Checklist/conduct state is keyed by vidhi + dateKey only (`@vedansh/vidhi-checklist`). Two family members sharing a tithi share one occurrence checklist — deliberate, mirroring the tithi-keyed (never person-keyed) `pitruSmaranSolves` cache and its disclosure rationale.
3. **No new notification.** The existing per-person day-before/day-of smaran reminders are the only fires; their fixed copy is unchanged and already never names the vidhi or the person beyond the saved relation. The festive vrat-reminder prep slot does **not** apply to personal days.
4. Nothing about this vidhi appears on any share surface. The samagri "सूची साझा करें" plain-text share contains items only — no date, no relation (test-pinned).

## 8. Content gates for the entry itself

- §3.4 two-source verification: DrikPanchang's shraddha/tarpan procedural reference + one independent published reference, both recorded in `referenceUrls`; Gita Press *Nitya Karma Puja Prakash* as `canonicalEdition` with an honest `canonicalEditionStatus` (verified, or pending with the dated attempt — the 2026-08-14 precedent is the template).
- §11.3/§11.14: mantras transcribed verbatim or omitted (instruction-only steps); every Devanagari string through the well-formedness validator in `vidhiContent.test.ts`.
- DRAFT convention: if the entry is scaffolded before verification completes (not recommended), it must not be in `VIDHI_ENTRIES` — an unregistered module is invisible to every door and to search. There is no "draft but shipped" state for a vidhi.
- **Sensitivity review beyond sourcing:** shraddha instructions routinely involve fire, water bodies, and fasting; the authored instruction prose (which *is* written fresh, per parent §3.2) carries the same material-handling/health-safety qualification discipline the Shivaratri entry already models, and the PRD-17 §5 non-prescriptive stance — the vidhi describes the chosen source's procedure, it never asserts obligation ("आपको करना चाहिए…" is banned copy).

### 8.1 Verification runbook (what the egress session actually does)

So the unblocking session has no judgment calls to invent, the procedure is fixed now:

1. Open DrikPanchang's shraddha/tarpan procedural pages; capture URLs + retrieval date. Open one independent published reference (candidates evaluated *in that session* — naming one now would be claiming an unopened source).
2. Open the recorded Gita Press *Nitya Karma Puja Prakash* scan on archive.org; check the shraddha/tarpan section character-by-character for every mantra the entry will carry inline. Anything not verbatim-confirmable ships instruction-only.
3. Author the entry: samagri, phased steps, refs (`gita` chapters 15/2 at the paath steps; existing `section`/`katha` refs where applicable), transcribed mantras with per-mantra `sourceUrl`.
4. Complete the `source` block honestly — `canonicalEditionStatus` says exactly what was opened and checked, and what remains pending, with dates.
5. In the same session, clear the carried prerequisite where possible: re-open the six shipped entries' recorded scans and flip their pending `canonicalEditionStatus` lines to verified (or update the honest pending note with the new dated attempt).
6. Register the entry in `VIDHI_ENTRIES`, run `npm run test:data` (registry invariants + §11.14 validator + search-index row count) and the full Jest/Maestro gates of §12.
7. Update design.md §62/§63 and RULEBOOK §19 in the same PR (§0.1 merge gate).

---

# PART B — Recorded step audio (option; explicit product decision)

## 9. Scope and honest recommendation

**Recommendation: DEFER — and record that as this PRD's first open decision.** No recorded assets exist today; §11.15 says synthetic recitation is assistive-only, so TTS (#230) already covers read-aloud without any size cost, and commissioning/licensing purohit recordings is the same unresolved question PRD-02 carries for verse audio. Part B ships only if real recorded assets are procured and signed off; nothing in Part A depends on it.

If taken, the contract is:

- **Assets are store-release-only.** Bundled native assets (`require()` + `expo-asset`, the Japam/PRD-02 pattern) — **not OTA-shippable**; the release drags the `APP_TOUR_VERSION` + `whatsNew` gate like any native-payload bump.
- **Size math** (roadmap figure: AAC 64 kbps mono ≈ **0.5 MB/min**; lower degrades Devanagari clarity, higher is waste — PRD-02 §9): a guided shraddha conduct of ~20 steps × 30–90 s ≈ 15–30 min ≈ **8–15 MB** for this one vidhi; voicing all seven vidhis (96+ steps) ≈ 60–90 min ≈ **30–45 MB**, which alone consumes half the quarter's +60 MB audio budget. Scope choice (this vidhi only vs. all seven) is Open Question 2.
- **Playback registers with the arbiter.** One player, `PlaybackKind: 'recorded'`, `registerStopper`/`claimPlayback` via `src/audio/playbackArbiter.ts` — starting a step's audio silences TTS/japam and vice versa. `ensureBackgroundAudioMode()` on mount like every player. No second arbiter, no context-value routing.
- **UX:** a per-step play pill on the conduct card, in the exact slot and labelled-pill shape of the read-aloud control (▶︎ + "सुनें", U+FE0E monochrome, no emoji). When a recording exists for a step, it is offered *alongside* TTS, not replacing it (TTS covers gu/kn instruction languages; recordings are the liturgy). Data: `stepAudio?: { asset: number; durationMs: number }` per step, manifest-tested so every referenced asset resolves.
- **Playback behavior details:** audio is per-step and stops on page-turn (a swipe re-targets the way read-aloud's swipe latch does — it never keeps narrating an invisible page); no auto-advance in v-first (the swipe-only page-turn contract stays intact; audio-driven page advance is a later decision if usage justifies it); the pill exposes play/pause only — no scrubber, no speed control (matching verse-audio v1's stance); a11y labels stay English for Maestro, visible label localized.
- **Content gate is identical to text:** a recording is liturgy. Each asset needs the same verification trail — recorded *from* the verified text, with the recording's provenance (artist/licence) in the entry's review-only `source.notes`. §11.15's assistive-only rule is why TTS never needed this and why recordings do.
- **Partial coverage is honest coverage:** steps without a recording simply show the TTS control; no placeholder pill, no "coming soon".

---

# PART C — Regional variants as explicit alternates (option)

## 10. The alternates model

A vidhi may carry **named alternate step-lists** — by sampradaya or region — and they are never silently merged into a homogenized procedure (parent §3.5's regional-honesty rule, now given a shape):

```ts
// types.ts (Part C only)
export type VidhiVariant = {
  id: string;                       // e.g. 'dakshina-apastamba'
  labelHi: string; labelEn: string; // named for what it IS (sampradaya/region)
  samagri?: VidhiSamagriItem[];     // absent ⇒ base samagri applies
  steps: VidhiStep[];               // complete alternate sequence, never a diff
  source: VidhiSource;              // its OWN full source block
};
variants?: VidhiVariant[];          // on VidhiEntry; base entry stays the declared convention
```

- **Selection UX:** when `variants` exist, `VidhiDetailScreen` shows a परम्परा selector (segmented control / sheet, shipped form components) naming the base convention and each alternate; the choice persists per vidhi in the `@vedansh/vidhi-checklist` document (`variantId?`). Prep and conduct read the selected list; **switching variants starts a fresh occurrence checklist** (different samagri is a different preparation). No variant is ever auto-picked by locale guessing — the base renders until the user chooses.
- **Verification cost is doubled per variant and that is the point:** each variant carries its own §3.4 two-source verification and its own canonical edition/status — a variant is a whole vidhi's content obligation, not a delta. This is why Part C is an option, gated per variant, and why v1 shipped none.
- Steps inside a variant follow every Part A rule (refs, mantra transcription, instruction-only fallback). The registry invariants extend: variant ids unique per entry, variant steps non-empty, variant source blocks complete.
- **State semantics with variants:** conduct resume and samagri state gain the selected `variantId` in their occurrence identity — resuming "step 7" of one tradition inside another's sequence would be wrong, so a variant switch clears both, with confirm copy before it does. Search rows stay one-per-vidhi (a variant is not a separate catalog entry); the completion seal and step counts read from the selected list.
- **Naming discipline:** a variant label names what the tradition *is* (sampradaya/regional identity as its sources name it), never a quality or brevity claim — "quick", "short", "simple" are banned variant labels; that is the homogenized-puja pattern this model exists to prevent.

---

## 11. Goals & non-goals (whole phase)

**Goals:** the performed shraddha day joins the performed festival day — samagri the day before, guided steps on the day, paath handed off to shipped Gita chapters; the two private features (PRD-17 ledger, PRD-19 procedures) close their loop; PRD-19 is complete. Success measures (per-device local counters only, per the Q3 measurement stance): shraddha-vidhi conduct completions on solved personal dates, prep-checklist opens the day before, and door-taps from the two Pitru surfaces — no per-person dimension is ever recorded.

**Non-goals:** no gotra/pinda record-keeping, no pandit/samagri commerce ever; no new notification family; no Home category; no vidhi share cards; no OTA path for recorded audio; no locale-inferred variant defaults; no authored liturgy from any AI or from this document's placeholders; no Phase 4.

### 11.1 Sequencing & rollout

1. **Now (no egress needed):** nothing user-visible ships. The navigation/type groundwork (More-stack registration, `anchor` + `gita` ref types, test scaffolds) *may* land dark — every door gates on a registry entry that does not exist, so the app is bit-identical in behaviour. Optional; zero-risk either way.
2. **Egress session:** §8.1 runbook — content authored, six sign-offs cleared, entry registered, doors go live in the same PR series.
3. **Release:** Part A is pure JS/TS + bundled text — **OTA-shippable** like PRD-17's core. Part B, if ever taken, forces a store release (native assets + tour/whats-new gate). Part C rides whichever release its first verified variant is ready for.
4. One release of the standard NEW badge on the person-detail door row; the muted register everywhere else (no DISCOVER card for this — the audience is exactly the people already inside Pitru Smaran, and grief is not a growth surface).

## 12. Test plan

| Layer | Suite | What it pins |
|---|---|---|
| Data (tsx `--test`, `npm run test:data`) | `vidhiContent.test.ts` extensions | seventh entry invariants; `anchor` rules (§3); `gita` ref chapters valid + cover {15, 2}; per-mantra `sourceUrl`; §11.14 well-formedness over all strings incl. variants; variant invariants (§10); Part B manifest resolution |
| Solve reuse (tsx, `test:engine`) | existing `pitruSmaran` suites | unchanged — no new engine paths; a regression run guards the door's date inputs |
| Screens (Jest) | `VidhiScreens.test.tsx` + Pitru screen suites | door renders only when the entry resolves (absent registry ⇒ absent door — non-vacuous both ways); route params never contain `entryId`/name; no source/citation text in any render; variant selector state; samagri share text contains no date/relation |
| Navigation (Jest) | `vidhiBackNavigation.test.ts` | the three vidhi screens registered on **all three** stacks; More-stack back retraces to person detail; Gita hand-off from More stack goes through `navigateToHomeStackTarget` |
| e2e (Maestro) | new `shraddha-vidhi-crosslink-smoke.yaml` | More → पितृ स्मरण → add a person (tithi-known path) → person detail → श्राद्ध विधि door → तैयारी check two items → conduct swipe to the Gita hand-off → reader opens → back retraces to conduct, then to person detail. iOS and Android runs reported separately (RULEBOOK §8) |

Acceptance for the whole phase: `npm test` green (typecheck + widgets + readers + engine + data), the new Maestro flow passing on both platforms, `vidhiBackNavigation.test.ts` covering three stacks, and the §0.1 doc updates present in the PR. For Part A specifically, the door-absent case must be tested against the *shipped* registry (six entries) so the gate is proven before content lands, and the door-present case against a test registry containing a fixture entry — the suite must not wait for real content to exercise the surfaces.

## 13. Edge cases

- **Person saved as सर्वपितृ अमावस्या (no known tithi):** the door still renders; `dateMs` is the solved Sarvapitri date (`nextSarvapitriAmavasya`), and the caption says so.
- **Annual tithi vs. Pitru Paksha duplication:** one person, two legitimate days. Two occurrences, two dateKeys, two fresh checklists — but `checklistStore` holds **one** samagri record per vidhi, so prepping the second occurrence resets the first's ticks. Acceptable (they are weeks apart in the common case) but stated honestly; if verification-era testing shows real overlap pain, widen the store to two records before ship.
- **Vidhi absent → doors absent:** no placeholder, teaser, or disabled row anywhere (person detail, overview, catalog search). Pinned non-vacuously.
- **Person deleted mid-prep:** checklist state is date-keyed, not person-keyed — nothing dangling references the entry; the orphaned dateKey record is overwritten by the next occurrence naturally.
- **Two people, one tithi:** one shared occurrence checklist by design (§7.2).
- **Zero-entry ledger:** vidhi remains reachable from the catalog; the reverse-link invitation row appears (§4.3); conduct keys to the civil day.
- **Variant switching mid-occurrence:** fresh checklist, explicit confirm copy ("सूची फिर से शुरू होगी").
- **Adhik-maas / kshaya years:** nothing new — the door's `dateMs` comes from the shipped `pitruSmaran.ts` solves, which already observe barsi in the nija month and handle kshaya via the festival engine's fallback (fixture-tested). This phase must not re-derive or "sanity-check" the date on the vidhi side; the solve is the single source of truth.
- **Solve not yet landed (cold detail screen):** the hero publishes in two stages (warm-first); the door renders once `solved.next` exists and simply does not render before — no spinner row, consistent with the screen's staged-paint contract.
- **Mid-conduct occurrence rollover (midnight):** conduct resume is keyed per civil day (shipped semantics); a puja crossing midnight resumes as today's fresh conduct — unchanged, acknowledged.
- **Catalog entry opened far from any personal date:** valid — the vidhi is readable any day; checklist keys to the civil day and no occurrence line renders.

## 14. Open questions

1. **Part B go/no-go:** do recorded shraddha assets get commissioned at all? (Recommended answer until assets exist: no — TTS suffices.) Owner: product; blocked on the same licensing question as PRD-02.
2. If Part B proceeds: this vidhi only (~8–15 MB) or all seven (~30–45 MB against the +60 MB budget)?
3. Which second procedural source clears §3.4 for shraddha specifically (candidates recorded at verification time — not named now, per the no-unopened-claims rule)?
4. Part C's first variant, if any: is there demonstrated user demand for a named regional shraddha alternate, or does Part C debut on a festive vidhi (e.g. Maharashtra Ganeshotsav) instead?
5. Should the Panchang day panel's ॥ स्मरण chip gain a second line naming the vidhi on the day itself? (Deferred: the chip → person detail → door is two taps and keeps the chip quiet.)

## 15. Why it fits the moat

The shraddha day is the single moment the incumbents monetize hardest — pandit-booking interstitials, shraddha-package commerce, ads over grief. Vedansh answering "उस दिन क्या करें?" clean, offline, cited, and private closes the last gap between *knowing the day* (PRD-17's engine strength) and *performing it* (PRD-19's content strength), with data that never leaves the device. And like every vidhi, the content is shelf-stable for decades once verified — the rare investment with zero decay, made once, honestly.

## 16. Design & doc compliance

Design tokens/components as shipped: §33 observance rows/hero on the Pitru side, §62 conduct/prep patterns on the vidhi side, muted Pitru palette inside this vidhi's surfaces, ॥/ॐ glyphs, no emoji, 44 pt targets, screen-reader traversal of steps and the door row. On implementation, per §0.1: update **design.md §62** (seventh entry, anchor kind, variant selector, More-stack doors) and **§63** (person-detail/overview door rows), and **RULEBOOK §19** (anchor + `gita` ref + variant rules) in the same PR. The prototype attached to this PRD is illustrative-only and is labelled as such on every liturgical string.
