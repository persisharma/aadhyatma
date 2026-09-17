# TRD-26 — दान-पुण्य — Technical Design (content gathering + integration)

| | |
|---|---|
| **Companion PRD** | [PRD-26](../prds/26-daan-punya.md) |
| **Contract** | RULEBOOK §27 · design.md §72 · wiki `daan-punya` |
| **Status** | Draft — covers the work **after** the shipped build, not the build itself |
| **Prototypes** | `docs/daan-punya-shipping.html` (what ships) · `docs/daan-punya-redesign.html` (journey redesign, approved) · `docs/daan-punya-home-placement.html` (Home doors, approved) |
| **Feasibility** | ⚠️ The engineering is small and well-understood. The risk is entirely **(a) a product collision with PRD-40, which must be resolved before any of this ships, and (b) content sourcing under a bar that four causes currently fail.** |

> **Non-negotiables (PRD-26 §2, RULEBOOK §27):** the app never touches money; punya is never a
> number; gupt-daan is structurally guaranteed on both write and read; educate precedes every
> hand-off; verified-only accessors; no fear/guilt/fruit-promise copy. This TRD introduces
> nothing outside those choices, and §2 below is the one place they are at risk.

---

## 0. Scope

Three tracks, in dependency order:

1. **Resolve the PRD-40 collision** (§2) — a product decision, blocking.
2. **Gather the missing content** (§3) — four thin causes, two rows that fail the inclusion
   rule, and one cause that would disappear entirely if we act on that rule first.
3. **Build the approved surface changes** (§4–§6) — the journey redesign and the Home doors.

Out of scope: opt-in daan-day reminders; the Karwa Chauth vidhi-step record affordance;
Routine daan-unit one-tap entry; grahan-daan (no eclipse rule ids exist in the engine).

---

## 1. Ground truth (verified in source, 2026-09-17)

| Fact | Source | Consequence |
|---|---|---|
| PRD-26 is **not on main** — it exists only on `claude/dan-punya-prd-integration-7odtti` | `git cat-file` across refs | Nothing here is live; the whole feature lands or doesn't in one PR. |
| PRD-40 **is on main**, therefore on every branch including ours | `docs/roadmap/prds/40-dakshina-donation-rail.md` | Two contradictory donation stances are already in the same tree. See §2. |
| 9 verified directory rows; 4 causes have exactly **one** place | `data/daan/directory.ts` | §3.1 — thin shelves. |
| 4 causes carry **no** citation (वृद्ध, आरोग्य, जीव, आपदा) | `data/daan/causes.ts` | By design, not a gap — but §3.2 lists what would close them honestly. |
| Only **2 of 9** rows are government or temple-trust provenance | `directory.ts` (`ttd-annaprasadam`, `e-raktkosh`) | The inclusion rule ranks these first; the set is NGO-heavy. |
| 20 occasion rows, 19 carrying causes; **67 of 365** days of 2026 covered | 2026 festival-engine audit, PRD §10.1 | The Observance door is dark 298 days a year. |
| 5 teaching-kathas, 5 verified principles, 1 draft (`dasa-dana`) | `kathas.ts`, `principles.ts` | Draft is invisible by accessor; closing it needs a second reference. |
| Daan routes are **already registered on the Home stack** | `navigation/types.ts`, `HomeStackNavigator.tsx` | A Home door needs no navigation work. |
| `HomeScreen.tsx` has **zero** daan references | grep | The feature has no Home-tab presence at all today. |
| A competing Home restructure exists | `claude/homepage-relevance-features-amu8k0` → `docs/home-today-first-prototype.html` | It **removes the 16-tile CATEGORIES grid** and reduces DISCOVER to ≤3 lifecycle-driven नया cards. See §5. |

---

## 2. BLOCKING — the PRD-40 collision

This is the finding that matters most, and it is not a technical problem.

**PRD-26 §2.1:** *"The app never touches money. Ever. No payment collection, no processing, no
commission, no suggested amounts."* The दान-द्वार hands off to an organisation's own website and
says so on screen.

**PRD-40 (Dakshina / Donation Rail), on main:** introduces Razorpay + Apple/Google IAP, suggested
amount chips (₹11 / ₹21 / ₹51 / ₹108 / ₹501), **Vedansh itself as a donation recipient**, a
₹99/month subscription, and a ₹7.5 lakh/month net revenue target. Its donation moments are
end-of-paath, end-of-sankalp, and the profile page.

These cannot both ship as written. Concretely, a user would meet:

- a **दान-द्वार** that refuses to take money and explains why, and
- a **dakshina sheet** that takes money at the end of a reading, with a default amount pre-selected.

The incoherence is not cosmetic — PRD-26's entire stance guard, its copy-guard test, and RULEBOOK
§27.2 exist to make the first behaviour un-reversible by accident. PRD-40 reverses it on purpose.

**Three resolutions, for the product owner to pick:**

| | Resolution | What it costs |
|---|---|---|
| **A** | **Keep them separate by domain.** PRD-26 owns *daan to others* (never money, verified patra). PRD-40 owns *dakshina to Vedansh and partner temples* (payments, its own surfaces). Neither links to the other; the दान-द्वार never shows a Vedansh recipient. | Cheapest. Needs one clause in each PRD naming the boundary, and a test that the daan directory can never contain a Vedansh-owned recipient. Risk: users still meet two donation models. |
| **B** | **PRD-40 absorbs the directory.** The द्वार gains a Razorpay rail to the same nine organisations. | Kills PRD-26 §2.1, RULEBOOK §27.2, the copy guard and the interstitial. It also makes us a payment intermediary for third-party charities — the heaviest compliance path in the whole roadmap, well beyond PRD-40's own scope. Not recommended. |
| **C** | **PRD-40 drops its one-time donation rail**, keeps only the Sadhak Seva subscription (support the app, not a donation), and PRD-26 stays the only giving surface. | Cleanest product story. Costs PRD-40 its ₹5.1L/month one-time line. A revenue call, not an engineering one. |

**Recommendation: A**, with the boundary written into both PRDs, because it is reversible and
unblocks PRD-26 now. **C is the better end-state** if the revenue model can absorb it.

Nothing else in this TRD should be built until this is decided, because B would discard most of it.

**Secondary overlap:** PRD-39 (Live Darshan) captures partner-temple trust data and UPI VPAs for
PRD-40. Our directory already carries one temple trust (TTD). If PRD-39 lands, the two temple
registries must not diverge — see §3.4.

---

## 3. Content gathering

The §6.2 bar does not move: **≥2 independent published references, at least one not the
organisation's own site, a dated `verificationNote`, and an `officialUrl` on the organisation's
own (or a government) domain.** Provenance ranks government/temple-trust → math/mission →
apolitical seva body. Everything below is content work, not code.

### 3.1 Thin shelves — four causes with one place each

| Cause | Places today | Problem |
|---|---|---|
| **गौ-सेवा** | 1 — TTD Gosamrakshana | A cause the user explicitly asked for, served only as a side-trust of an anna row. |
| **वस्त्र-सेवा** | 1 — Goonj | And Goonj fails the inclusion rule (§3.3). |
| **वृद्ध-सेवा** | 1 — HelpAge India | No alternative if it goes stale. |
| **जीव-सेवा** | 1 — Blue Cross of India | Chennai-only; no northern option. |

**Order of work matters.** Dropping Goonj before sourcing a replacement leaves वस्त्र-सेवा with
zero rows, and a cause with no verified row renders **no chip and no shelf at all** — the cause
would silently vanish from the द्वार. Source first, then swap.

**To gather — target 2–3 rows per cause, ~8 new rows total:**

| Cause | Candidate | Status | What is still needed |
|---|---|---|---|
| गौ | **Pathmeda Godham Mahatirth** (Rajasthan) | Researched in-session; clears the bar on Wikipedia + official site | Confirm a working `officialUrl` giving page; write the one-line `about`; dated note. |
| गौ | A **state Gau Seva Aayog** register (e.g. `hargauseva.gov.in`) | Government domain — strongest provenance available | Decide whether a *register* is a `seva-portal` row (like e-RaktKosh) or only a verification source. |
| वस्त्र | **replacement for Goonj** | **Not sourced** | Hard gap. Needs a seva body with a clothing/blanket mandate that clears both §6.2 and the inclusion rule. |
| वृद्ध | second elder-care body | Not sourced | Prefer a math/mission with an eldercare arm over another NGO. |
| जीव | a northern/western animal-welfare body | Not sourced | Balances Blue Cross's Chennai base. |
| बाल | **replacement for CRY** | Not sourced | Same constraint as वस्त्र. |
| अन्न | one more temple annakshetra | Partly researched | Nathdwara / Khatushyamji / Salasar — see §3.4. |

### 3.2 Cause mahatva — the four uncited causes

वृद्ध, आरोग्य, जीव and आपदा ship as plain tradition-register prose with **no citation**, because
none was found they could honestly carry. That is the correct current state, not a bug — the
three-or-none rule is pinned by test. If we want them cited, each needs a genuine anchor at the
§6.2 bar; a plausible-sounding attribution is worse than none. Candidate directions, all
**unverified**, for a future content pass:

- **आरोग्य** — the *aushadha-dāna* / *abhaya-dāna* pairing appears in dāna-dharma lists; needs a
  locatable passage, not a secondary summary.
- **जीव** — the householder's *pañca-bali* (bhūta-yajña) share to animals and birds; likewise.
- **वृद्ध / आपदा** — I found no attested classical anchor. Recommend they stay uncited permanently.

### 3.3 The inclusion rule — two rows currently fail it

The rule you set: seva-delivery mandate only; not advocacy-led. Ranked provenance
government/temple-trust → math/mission → apolitical seva.

- **CRY** — rights-and-advocacy framing in its own self-description. Fails.
- **Goonj** — development-intervention framing rather than a pure relief mandate. Borderline; I
  flagged it as failing.

Both are currently load-bearing (Goonj is वस्त्र's only row; CRY is one of बाल's three). The swap
is blocked on §3.1 sourcing. **I also flagged the mirror risk:** applying the rule in the other
direction — preferring explicitly Sangh-affiliated bodies — would be the same editorial thumb on
the scale, and the rule as written does not license it.

### 3.4 Theerth ↔ daan cross-link (optional, adds a cause-agnostic surface)

Nathdwara, Khatushyamji and Salasar run annakshetras and are already in `theerth/temples.ts`.
Verifying them would let a temple detail carry its own giving line. **Prerequisite:** decide with
PRD-39 which registry owns temple-trust rows, or the same trust gets described twice with
different verification dates.

### 3.5 Content inventory summary

| Item | Have | Need | Bar |
|---|---|---|---|
| Directory rows | 9 | ~8 more; 2 swaps | §6.2 + inclusion rule |
| Causes with ≥2 places | 5 of 9 | all 9 | — |
| Cause mahatva | 9 | 0 new | 5 cited, 4 deliberately not |
| Occasion rows | 20 (67 days) | optional widening | real solver rule ids only |
| Teaching-kathas | 5 | 0 | — |
| Principles | 5 verified, 1 draft | 1 second reference for `dasa-dana` | §6 source threshold |
| Temple annakshetras | 0 | 3 (optional) | §6.2 + PRD-39 boundary |

---

## 4. Integration — the journey redesign

Approved in `docs/daan-punya-redesign.html`. Three screens, all surface-level; no registry, ledger
core, accessor or door changes.

### 4.1 `DaanPunyaScreen` — hero + fold

- Today becomes a hero card: tithi line, occasion title, `whyHi` excerpt, the day's cause pills,
  one CTA. Absent entirely on an uncovered day (unchanged rule).
- Verse spine: **one featured verse**, selected by `today.getDay() % verses.length` over the rows
  that carry `verseLines`; the remaining principles render as fold-open rows. No new data.
- Kathas become a horizontal strip of glyph tiles.
- **Contract unchanged** — zero give affordances; the existing §2.7 test passes as written.

### 4.2 `DaanJourneyScreen` — one reading

- Replace the step index with a single `ScrollView` of five marked sections and a sticky progress
  rail driven by an `IntersectionObserver`-equivalent (`onViewableItemsChanged` or an `onScroll`
  offset map — prefer the latter; the sections are few and fixed).
- The terminal block mounts when the संकल्प section enters the viewport.
- **This is the one contract clause that moves.** RULEBOOK §27.1 and `DaanScreens.test.tsx`
  currently pin *"terminal actions do not exist before the last **step**."* New wording:
  *"…before the संकल्प section is reached."* Same guarantee, different trigger.
- **Required fallbacks:** `prefers-reduced-motion` / `AccessibilityInfo.isReduceMotionEnabled`,
  and any screen where content is shorter than the viewport, must mount the block immediately —
  otherwise a short occasion becomes unreachable. This is a real bug risk; test it.

### 4.3 `DaanDirectoryScreen` — grid, then one cause

- Unfiltered: a 3×3 grid of cause tiles (glyph, name, place count); the occasion's causes ring gold.
- Selected: the existing filtered view — full mahatva, citation, then places — with a chip row above.
- **Contract unchanged** — tiles derive from rows present, mahatva still precedes places.
- Place counts make §3.1's thin shelves visible to the user. Fix the content before shipping the
  grid, or four tiles will read "1 स्थान".

---

## 5. Integration — Home doors (revised for the Today-First collision)

`docs/daan-punya-home-placement.html` proposed three options against Home **as it renders today**.
The Today-First prototype changes that ground, and the proposal must be revised:

| Option | Verdict now | Why |
|---|---|---|
| **B · CATEGORIES tile** | **Dead** | Today-First removes the 16-tile grid entirely, replacing it with one पाठ row, one साधना row and a fixed उपकरण row. |
| **A · DISCOVER card** | **Weakened** | DISCOVER becomes नया: ≤3 lifecycle cards, shown only until opened, then cleared. Good for launch awareness, but no longer standing all-year presence. |
| **C · FOR TODAY entry** | **Strengthened — take this** | The आज के लिए row survives and is the leading surface; Today-First explicitly keeps it reading the same observance rule our resolver uses. |

**Revised recommendation:** **C as the primary door, A as a launch-only नया card.** If Today-First
does not land, A reverts to standing awareness and the original A+C recommendation holds.

**Implementation:** one `getDaanOccasionForRule` call in `TodayRecommendationsRow`, already written
and already tested, opening `DaanJourney` at step one. No new route, no new glyph, no contract change
(§2.7 bans give affordances, not educate doors).

**Coordination:** talk to whoever owns `claude/homepage-relevance-features-amu8k0` before building,
or the two Home changes will conflict in the same file.

---

## 6. Module inventory

| Path | Change |
|---|---|
| `mobile/src/data/daan/directory.ts` | +~8 rows, 2 swaps (§3) — data only |
| `mobile/src/data/daan/causes.ts` | citations only if §3.2 finds honest anchors |
| `mobile/src/data/daan/principles.ts` | `dasa-dana` → verified if a second reference is found |
| `mobile/src/screens/DaanPunyaScreen.tsx` | rewrite (§4.1) |
| `mobile/src/screens/DaanJourneyScreen.tsx` | rewrite (§4.2) |
| `mobile/src/screens/DaanDirectoryScreen.tsx` | rewrite (§4.3) |
| `mobile/src/screens/DaanLedgerScreen.tsx`, `DaanEntryScreen.tsx` | glyph motif only, no structure |
| `mobile/src/components/TodayRecommendationsRow.tsx` | + daan entry (§5) |
| `mobile/src/screens/HomeScreen.tsx` | + नया card, only if DISCOVER survives |
| `RULEBOOK.md` §27.1 | reword the terminal-action trigger (§4.2) |
| `design.md` §72 | refresh for all three screens |
| `docs/roadmap/prds/26-daan-punya.md` | + the §2 boundary clause |
| `docs/roadmap/prds/40-dakshina-donation-rail.md` | + the reciprocal boundary clause |

No new dependency, no native module, no route. Bundle-only holds.

---

## 7. Testing

| Suite | Change |
|---|---|
| `daanContent.test.ts` | Add: **every live cause has ≥2 verified places** (this is the test that makes §3.1 fail loudly rather than ship a "1 स्थान" tile). Existing shape, source-threshold, cause-mahatva and banned-field tests unchanged. |
| `DaanScreens.test.tsx` | Reword the journey gating test per §4.2; add the **short-content and reduced-motion mount** cases; add the directory grid ↔ detail toggle; keep the §2.7 zero-affordance assertions verbatim. |
| New — boundary test | If resolution **A**: assert no directory row's `officialUrl` is a Vedansh-owned domain, so the two donation models can never merge by accident. |
| `launchGraph.test.ts` | Watch it — the hero/grid rewrites must not pull the registries into the cold-start graph. The `require()` thunks in `data/daan/index.ts` must stay. |
| Maestro | Update `daan-punya-smoke.yaml` for the scroll-to-terminal flow; add the Home door. |

---

## 8. Rollout

1. **Decide §2.** Nothing else starts. *(product owner)*
2. **Source §3.1** — the ~8 rows, वस्त्र and बाल replacements first since they block the swaps.
3. Land content + the ≥2-places test together, so the grid never shows a thin shelf.
4. Land §4 redesign + the RULEBOOK reword in one series.
5. Land §5 Home door, coordinated with the Today-First owner.
6. **Store release, not OTA** — PRD-26 §6.1's review-visibility gate applies to the release that
   first carries the directory, even though every line of this is OTA-safe JS.

---

## 9. Open technical questions

1. **§2 resolution** — A, B or C. Blocking everything.
2. Does a state Gau Seva Aayog *register* become a `seva-portal` row, or only a verification
   source? It lists gaushalas rather than receiving anything itself.
3. Who owns temple-trust rows once PRD-39 lands — its partnership registry or our directory?
4. Progress-rail mechanism on the journey: `onScroll` offset map (simpler, chosen) vs
   `onViewableItemsChanged` (more robust, more machinery). Revisit if sections become dynamic.
5. If Goonj and CRY are swapped out, do we state publicly why a row left? Silent removal is
   cleaner but loses the audit trail; the `source` block already records it for review.
6. `dasa-dana` — is a second reference worth finding, or does the contested daśa-dāna enumeration
   stay draft permanently as the recorded example of §27.6?
