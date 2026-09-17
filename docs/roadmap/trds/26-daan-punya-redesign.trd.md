# TRD-26R — दान-पुण्य — v3 Redesign Integration (three doors, skippable journey)

| | |
|---|---|
| **Companion PRD** | [PRD-26](../prds/26-daan-punya.md) |
| **Base TRD** | [26-daan-punya.trd.md](./26-daan-punya.trd.md) — content-gathering (§3) is unchanged and still governs; this doc **supersedes its §4–§5 integration sections** |
| **Contract** | RULEBOOK §27 · design.md §72 / §18 · wiki `daan-punya` |
| **Prototype** | `docs/daan-punya-revised.html` (v3, for sign-off) |
| **Status** | Draft — pending sign-off on the §2 contract relaxation and the §5 Home-tile collision |
| **Feasibility** | ✅ Engineering is small (surface-level screens + one glyph + one data row). **Decided (2026-09-17):** §2.7 relaxed (skip + direct द्वार) and the Home category tile approved. **PRD-40 collision resolved — Resolution A, links-only, PRD-40 on hold** (base TRD §2). Remaining: the Home-structure coordination with the Today-First branch (§5), and the base TRD's content gap (§3). |

> **Non-negotiables (PRD-26 §2, RULEBOOK §27) that DO NOT move:** the app never touches money; punya
> is never a number; gupt-daan is structurally guaranteed on write and read; verified-only accessors;
> no fear/guilt/fruit-promise copy; the द्वार hands off to an org's own site behind the honest
> interstitial. **What this TRD does move is one clause of §2.7** — see §2.

---

## 0. Scope

The v3 redesign captured in `docs/daan-punya-revised.html`, driven by four review notes:

1. **Fidelity** — the prototype must render the *real* app: real `CategoryIcon` glyphs, real launcher order, real character-badge More rows (§3).
2. **A visible donate touchpoint** — three standing doors on the daan home (§4.1).
3. **Educate *or* donate directly, any day, without being forced through the reading** — the skippable journey and the daily/vaar variant (§2, §4.2).
4. **Contain the growing More tab** — deferred to a follow-up (§4.3).

Out of scope (unchanged from base TRD): daan-day reminders, Routine one-tap daan unit, grahan-daan, the PRD-40 payment rail.

---

## 1. Ground truth (verified in source this session)

| Fact | Source | Consequence |
|---|---|---|
| `CategoryIcon` icons are **View compositions** (borders/transforms), not SVG/emoji/font — except `MusicIcon` | `components/CategoryIcon.tsx:41-64` | A prototype's stroke-SVGs only *approximate* them; the shipped glyph is a View recipe. |
| **दान-पुण्य has no `CategoryIcon` glyph and is not in `categories.ts`** | `categories.ts:25-46`, `CategoryIcon.tsx:41-62` | A Home tile needs a **new hand-drawn glyph** — real design work, not a config line. |
| The More row's icon is the **Devanagari "दा"** in a saffron `iconBg`, `state="NEW"` | `MoreScreen.tsx:433-445` | More rows are character badges, not line glyphs — the prototype was wrong; the app is already right. |
| `HomeScreen.tsx` has **zero** daan references | grep | The feature has no Home-tab presence today. |
| Home launcher order is content tiles + interleaved non-content (japam→vrat·kundali·muhurat, theerth→deity·purpose), नित्य साधना a **full-width closer** | `HomeScreen.tsx:94-178, 408-438` | The tile lands before the routine closer; the grid stays 3-col + 1 wide. |
| `DaanPunyaScreen` is educate-first: subtitle → (today card) → इस वार → शास्त्र → कथाएँ → **खाता door** → footer. No give/`Linking` affordance | `DaanPunyaScreen.tsx:63-233` | v3 adds doors *above* this; the ledger door and footer stay. |
| Daan routes registered on **More + Panchang** stacks; the Home stack is **not** wired for daan | `navigation/types.ts`, base TRD §1 | A Home door needs the route reachable from the Home stack (base TRD said Home-stack registered; re-confirm before building). |
| 20 occasion rows, 19 carry causes; **~67 / 365** days of 2026 covered | `occasions.ts`, base-TRD audit | The occasion door is dark **298 days/yr** — the whole reason for the standing doors + daily journey. |

---

## 2. Contract change — §2.7 is relaxed (the one material decision)

**Today (RULEBOOK §27.1 / PRD §2.7, as pinned by `DaanScreens.test.tsx`):** the home has *zero* give
affordances; the directory is reachable **only** as the terminal step of a guided journey; record
precedes hand-off. The base TRD §4.2 only proposed moving the terminal *trigger* to the संकल्प
section — same guarantee, different trigger.

**v3 goes further, per the product owner's calls this session:**

- *"Educate and keep the journey, but going through every step must not be a MUST — not good for repeat users."*
- *"Educate then donate, but there should be a way to skip if the user wishes."*
- *"Add a दान-द्वार button too on the daan home."*

**New wording (reword §27.1 + §2.7 in one series):**

> The daan home is educate-first **by default, not by gate.** The directory is reachable from a
> guided journey's terminal step, from an explicit **skip affordance** within the journey, **or**
> from a direct **दान-द्वार** door on the daan home. The reading is offered, never forced. The
> ledger is never gated. The app still never transacts; the द्वार still hands off to the org's own
> site behind the interstitial.

This **replaces** the old "no one-tap path to the hand-off" assertion with "educate-default + an
explicit, labelled skip." It does **not** touch any money/gupt/verified-only/copy-guard clause.

**Design caveat carried into the doc (raised in review):** three action doors + the hero CTA put
*four* affordances in the first viewport, two of them filled-saffron primaries → no hierarchy, and
`दान करें` (skippable journey) overlaps the direct `दान-द्वार`. **Recommended before build:** collapse
to **one primary + one quiet link** — occasion days keep the hero's single CTA + a quiet
`दान-द्वार ›`; any day leads with one `दान करें` primary + the quiet `दान-द्वार ›`, and `महत्व समझें`
becomes the content below rather than a third button. Open decision (§9).

---

## 3. Fidelity — icons & components (mostly a prototype fix, one real code item)

| Surface | Reality | Action |
|---|---|---|
| Tile glyphs | Real `CategoryIcon` objects: चालीसा=mala, आरती=diya, स्तोत्रम्=ॐ, ग्रन्थ=palm-leaf, व्रत=kalash, तीर्थ=shikhara, देवता=temple, नित्य साधना=lotus | Prototype only — redrawn to match. **No app change.** |
| Launcher order | content + interleaved non-content + full-width नित्य साधना closer | Prototype only — corrected. **No app change.** |
| More rows | character badges (`दा`, ♥, ॐ, ॥, ✦…), three groups (साधना · ऐप · जानकारी) | Prototype only — corrected. App already ships this. **No app change.** |
| **Daan Home glyph** | **does not exist** | **Real work:** design a hand-drawn `CategoryIcon` for दान (View composition, saffron+gold, in-style with mala/diya/kalash). Prototype ships a placeholder. |

---

## 4. Integration — the surface changes

### 4.1 `DaanPunyaScreen` — standing doors on top

- Add a door block above the existing educate content (which is unchanged: शास्त्र, कथाएँ, इस वार, खाता, footer).
- **Prototype draws three:** `महत्व समझें` (scrolls to शास्त्र), `दान करें` (opens the journey), direct `दान-द्वार` (→ directory). **Ship the §2-recommended reduction unless the owner keeps all three.**
- The occasion hero (tithi line, `whyHi` excerpt, cause pills, one CTA) still renders only on covered days; the खाता door and footer stay at the end and remain ungated.

### 4.2 `DaanJourneyScreen` — skippable reading

- One `ScrollView`, five marked sections, sticky progress rail (onScroll offset map — base TRD §4.2).
- Terminal block mounts when संकल्प enters the viewport **OR** when the **skip** (`सीधे दान-द्वार ›`, persistent under the mode toggle) is tapped — the skip mounts the terminal and scrolls to the द्वार.
- **Daily variant** (no occasion): महत्व / शास्त्र / कथा / क्या दें / संकल्प sourced from `vaar.ts` + `principles.ts` (all 365 days) — the "donate without occasion" path.
- **Required fallbacks:** reduced-motion and short-content mount the terminal immediately, else a short reading is unreachable. Test it.

### 4.3 `MoreScreen` — deferred compaction (owner's call)

- No change to the दान-पुण्य row. Proposed **follow-up, own PR:** collapse the साधना group to a 2-column compact grid. Drawn as a ghost in the prototype; **not in this scope.**

---

## 5. Integration — Home entry (⚠ collides with Today-First)

Owner chose **CATEGORIES tile + Discover card.** This **conflicts with the base TRD §5 finding**: the
Today-First restructure (`claude/homepage-relevance-features-amu8k0`) **removes the CATEGORIES grid
entirely**, which marked the tile option "Dead" and DISCOVER "weakened to launch-only नया".

| If… | Then |
|---|---|
| Today-First does **not** land | Ship the CATEGORIES tile (needs the §3 glyph + a `categories.ts` entry) + a DISCOVER card. |
| Today-First **lands** | The tile has no grid to live in — fall back to the base TRD's **FOR TODAY entry (option C)** as the standing door, with the Discover card as launch-only नया. |

**Blocking coordination:** settle the Home structure with the Today-First owner before building, or the
two changes conflict in `HomeScreen.tsx`. This is a decision, not code (§9).

---

## 6. Module inventory (delta over base TRD §6)

| Path | Change |
|---|---|
| `components/CategoryIcon.tsx` | **+ a hand-drawn दान glyph** (only if the Home tile is taken) |
| `data/categories.ts` | **+ a दान-पुण्य entry** (only if the Home tile is taken) |
| `screens/DaanPunyaScreen.tsx` | + the standing door block (§4.1) atop the existing educate layout |
| `screens/DaanJourneyScreen.tsx` | + the skip affordance + daily variant (§4.2) |
| `screens/DaanDirectoryScreen.tsx` | reachable directly now; grid unchanged (base TRD §4.3) |
| `screens/HomeScreen.tsx` | + tile and/or Discover card (§5, gated on Today-First) |
| `components/TodayRecommendationsRow.tsx` | + daan card on covered days (base TRD §5) |
| `RULEBOOK.md` §27.1 + `docs/roadmap/prds/26-daan-punya.md` §2.7 | **reword together** for the §2 relaxation |
| `design.md` §72 (screens) · §18 (grid enumeration) | refresh for the doors, the skip, and the new tile/glyph |

No new dependency, no native module. Bundle-only holds; **store release** still required (PRD-26 §6.1) for the release first carrying the directory.

---

## 7. Testing (delta over base TRD §7)

| Suite | Change |
|---|---|
| `DaanScreens.test.tsx` | **Replace** the "no one-tap path" assertion with: the **skip** reaches the terminal/directory; the direct **दान-द्वार** door reaches the directory; the guided path still teaches by default. Keep short-content + reduced-motion mount cases. |
| `daanContent.test.ts` | Unchanged from base TRD — incl. **every live cause has ≥2 verified places** (still fails today for 4 thin causes, see §8). |
| new — boundary test | (PRD-40 resolution A) no directory `officialUrl` on a Vedansh-owned domain. |
| `launchGraph.test.ts` | The door block + glyph must not pull registries into cold start; keep the `require()` thunks in `data/daan/index.ts`. |
| Maestro | `daan-punya-smoke.yaml`: add the skip flow and the direct द्वार door. |

---

## 8. Content summary (verified in source, for the sign-off)

### 8.1 Occasions — **20 rows**, ~67 / 365 days of 2026 covered

18 exact-id rows + 2 suffix-family rows (`sankranti-snana-daan` → all `-sankranti`; `ekadashi-parana`
→ all `-ekadashi`). 19 carry causes (`kartik-deep` carries none). The other **298 days** are served by
the **daily/vaar** journey, not the occasion door.

| # | Occasion | Cause(s) | Story linked |
|---|---|---|---|
| 1 | मकर संक्रान्ति | अन्न · वस्त्र · गौ | **दानवीर कर्ण** (giving-katha) |
| 2 | संक्रान्ति स्नान-दान *(family)* | अन्न | — |
| 3 | अक्षय तृतीया | अन्न | अक्षय तृतीया व्रत-कथा |
| 4 | पितृ पक्ष | अन्न · वस्त्र | — (links shraddha-tarpan vidhi) |
| 5 | अक्षय नवमी | अन्न | अक्षय नवमी कथा |
| 6 | गुरु पूर्णिमा | विद्या | गुरु पूर्णिमा कथा |
| 7 | वसंत पंचमी | विद्या · बाल | वसंत पंचमी कथा |
| 8 | गंगा पर्व | अन्न | गंगा दशहरा कथा |
| 9 | गोवर्धन · अन्नकूट | अन्न · गौ | गोवर्धन कथा + **बलि–वामन** (giving-katha) |
| 10 | बछ बारस | गौ | बछ बारस व्रत-कथा |
| 11 | दीप पर्व (धनतेरस–दिवाली) | अन्न | धनतेरस legends |
| 12 | कार्तिक दीप | — | — |
| 13 | छठ | अन्न | छठ पूजा कथा |
| 14 | नवरात्रि — कन्या भोज | अन्न · बाल | नवरात्रि कथा |
| 15 | शरद पूर्णिमा | अन्न | शरद पूर्णिमा व्रत-कथा |
| 16 | गीता जयंती | विद्या | गीता जयंती कथा |
| 17 | अमावस्या | अन्न · वस्त्र | अमावस्या व्रत-कथा |
| 18 | पूर्णिमा | अन्न | सत्यनारायण व्रत-कथा |
| 19 | एकादशी — पारण *(family)* | अन्न | एकादशी व्रत-कथा |
| 20 | षटतिला एकादशी | अन्न | षटतिला एकादशी कथा |

### 8.2 Stories & verse-content the layer is built on

- **5 giving teaching-kathas** (`kathas.ts`): दानवीर कर्ण · राजा रन्तिदेव · राजा शिबि · बलि–वामन · सुदामा. Two are linked from occasions (Karna→Sankranti, Bali-Vamana→Govardhan); three are linked from directory orgs (§8.3).
- **5 verified verse/principle rows** (`principles.ts`): RV 10.117.6 (dana-sukta) · TU 1.11.3 (shraddhaya-deyam) · Gītā 17.20 (sattvik-daan) · Mahābhārata Anuśāsana (anna-daan-supremacy) · gupt-daan (tradition). **+1 draft** `dasa-dana` (invisible until a second reference lands).
- **16 occasions** also cross-link the app's own shipped festival/vrat katha; **3** carry no story (`sankranti-snana-daan`, `pitru-paksha`, `kartik-deep`).

### 8.3 Organisations by daan type — **9 orgs across 9 causes**

The द्वार groups by **cause (प्रयोजन — whom it serves)**, not by dravya. 5 causes have ≥2 places; **4
are thin (1 place)** — the base TRD §3.1 content gap.

| Cause (daan type) | Organisations | Official hand-off |
|---|---|---|
| **अन्न-जल** (food & water) | Akshaya Patra · Annamrita · TTD Annaprasadam · Belur Math | akshayapatra.org · annamrita.org · ttdevasthanams.ap.gov.in · donations.belurmath.org |
| **गौ-सेवा** ⚠ thin | TTD Gosamrakshana (via the TTD row) | ttdevasthanams.ap.gov.in |
| **बाल-सेवा** (children) | Akshaya Patra · Annamrita · CRY | …/akshayapatra · …/annamrita · cry.org/donation |
| **वृद्ध-सेवा** ⚠ thin | HelpAge India | helpageindia.org/donate |
| **विद्या-दान** (education) | Belur Math · CRY | donations.belurmath.org · cry.org/donation |
| **आरोग्य-सेवा** (health) | Belur Math · **e-RaktKosh** *(blood — no money)* · HelpAge India · CRY | …belurmath · eraktkosh.mohfw.gov.in · helpageindia · cry.org |
| **वस्त्र-सेवा** ⚠ thin | Goonj | goonj.org/donate |
| **जीव-सेवा** ⚠ thin | Blue Cross of India | bluecrossofindia.org |
| **आपदा-राहत** (disaster relief) | Goonj · Belur Math · HelpAge India | goonj.org · belurmath · helpageindia |

*(All URLs are the organisation's own or a government domain — never an aggregator or a payment gateway of ours. e-RaktKosh takes no money; the blood itself is the daan.)*

---

## 9. Decisions & remaining items

- ✅ **§2 relaxation — DECIDED:** skip + direct द्वार accepted (educate-default, not gate). *Still to confirm:* **three doors** vs the recommended **one-primary + quiet link** (a layout call, not a contract one).
- ✅ **Home category tile — DECIDED:** ship the CATEGORIES tile + Discover card. *Coordinate* the grid with the Today-First branch owner (§5); fall back to the FOR TODAY entry only if Today-First removes the grid.
- ✅ **PRD-40 collision — RESOLVED:** Resolution A, **links-only, no in-app payment; PRD-40 on hold** (base TRD §2).
- ⏳ **Content (base TRD §3):** 4 thin causes + 2 inclusion-rule swaps — the real remaining gate before the द्वार grid ships.
- ⏳ **New दान glyph:** a design task, needed for the Home tile.
