# PRD-09 · Phase 4 — उपवास विधि · Structured Upvas/Fasting Content ("How to observe")

| | |
|---|---|
| **Status** | Engineering shipped (Aug 2026) — registry, `upvasId` hook, parana helper, screen section, and tests landed with all 8 entries at `status: 'draft'` (§8.2 content-egress blocker, attempt dated 2026-08-18); user-invisible until entries verify |
| **Parent** | [PRD-09 व्रत-पर्व (Vrat & Parv)](./09-vrat-katha-catalog.md) — P1–P3 shipped; this details the remaining half of P4 |
| **T-shirt size** | M (one small data family + one screen section + one pure helper; the hard part is content verification, not code) |
| **Prototype** | [`docs/vrat-upvas-prototype.html`](../../vrat-upvas-prototype.html) — three Observance Detail states (upvas only · upvas + vidhi ordering · unverified/absent), annotated |
| **Feasibility** | ✅ Confirmed against current main — `ObservanceRule` already carries content hooks (`kathaId`, `linkSectionId`, `vidhiId` in `mobile/src/panchang/festivals.ts`); an `upvasId` follows the identical pattern. The engine already solves everything a computed parana line needs (`sunrise`, `moonrise`, per-tithi `endTime` in `PanchangData`). |

---

**Local-first constraint:** upvas entries are typed bundled modules, exactly like `mobile/src/panchang/kathaContent/`. No account, no server, no remote fetch. The only derived values (parana date/times) are computed on-device by the existing Panchang engine for the user's chosen location. Pure JS/TS data + one screen change ⇒ **OTA-shippable** via expo-updates; no native module, no engine change, no `PANCHANG_DAY_CACHE_VERSION` bump.

**Scope note — this is half of the original Phase 4, and it is the only half left.** Parent §7/P4 bundled two items: (a) authored upvas/fasting guidance and (b) per-user location configuration. **The location half has since shipped independently** — the nationwide location picker (`panchang/locations.ts`, `rajasthanTehsils.ts`, `pincodes.ts`: 52 cities + 342 Rajasthan tehsils + an 18,466-pincode lookup tier ≈ 18,860 selectable locations) with GPS snap. This PRD scopes **only the fasting-content half**, which completes PRD-09. No further phases exist or are proposed.

---

## 1. Problem

The Observance Detail screen (`mobile/src/screens/ObservanceDetailScreen.tsx`) answers *what* a vrat is (hero, About), *when* it falls (next date + countdown), and *its story* (katha card → reader). For six festivals it also answers *what puja to perform* (the PRD-19 Phase 2B "पूजा विधि · How to observe" card, gated on a resolving `vidhiId` — never a placeholder). What it still cannot answer is the question a fasting devotee actually opens the page with the evening before: **"कैसे रखें?"** — what kind of fast is this (nirjala? phalahar? one meal?), from when to when, **and when do I break it (parana)** — the answer that is date- and sunrise-specific and that today sends users to ad-choked panchang sites. The parent PRD reserved this slot ("Coming soon", §6.2) and deferred it to P4 because no verified content existed. It still doesn't; this PRD specifies the data model, surfaces, and the verification gates that let it exist honestly.

## 2. Goal

A user opens निर्जला एकादशी, and beneath the story sees **उपवास विधि · How to observe**: the fast type as a chip (निर्जला — जल भी वर्जित), the fasting window in plain words, the **parana rule** in words *plus the computed date and time window for their own location** (e.g. "पारण: 16 जून · सूर्योदय 05:42 से 08:10 तक — द्वादशी रहते"), a one-line strictness/variants note, and who traditionally observes. All offline, all verified against two concordant published sources, and **absent entirely** — not placeholdered — where content is not yet verified.

## 3. Non-goals

- **Not a re-scope of the vidhi system.** PRD-19 owns *performed puja procedure*; this PRD owns *fasting facts*. The two compose on one screen (§6.3) and never duplicate each other's content.
- **No location work.** That half of the original P4 shipped (see scope note). The computed parana line *consumes* the shipped `PanchangLocationContext`; it adds no location UI.
- **No per-day meal plans, recipes, or health guidance.** Fast type + window + parana + strictness note is the complete v1 shape. No medical claims of any kind; where sources carry the traditional exemption (children, the unwell, pregnant women, the elderly may observe leniently), it is transcribed as part of the strictness note, not composed.
- **No implementer-authored religious rules.** The exact analog of RULEBOOK §11.3 for liturgy: a fasting convention is dharmic guidance and is **transcribed from sources, never composed by analogy**. An observance whose rules the two sources state discordantly ships nothing until resolved (§8).
- **No notifications changes.** The P3 reminder system is untouched; a "parana reminder" is explicitly out of scope (it would need the iOS 64-cap budget renegotiated and is not requested).
- **No new tab, screen, or route.** This is one section on the existing Observance Detail.

## 4. User stories

> As someone keeping Ekadashi, I want the app to tell me **this one is nirjala** and **exactly when tomorrow I may break the fast at my city's sunrise**, so I don't cross-check a website at 5 AM.

> As a first-time Karwa Chauth observer, I want to see that the fast runs **sunrise to moonrise**, that it is nirjala by tradition, and then open the पूजा विधि right below it — one "how to observe" home, not two competing sections.

> As a cautious devotee, I want the app to show **nothing rather than a guess** for a vrat whose rules it hasn't verified — the same honesty the vidhi card already has.

## 5. Data model

### 5.1 New content family: `mobile/src/panchang/upvasContent/`

Mirrors `kathaContent/` exactly: an `entries/` directory of one-default-export modules, a generated-style `index.ts` array, and an accessor module `upvasContent.ts` whose module-scope IIFE asserts invariants (unique ids, non-empty bilingual fields, source shape) — the same pattern as `kathaContent.ts`'s `assertKathaContentInvariants`.

```ts
type FastType = 'nirjala' | 'phalahar' | 'one-meal' | 'night-vigil';

type UpvasInfoEntry = {
  id: string;                          // e.g. 'ekadashi-upvas'
  fastType: FastType;
  fastTypeNoteHi: string; fastTypeNoteEn: string;   // one line, e.g. "जल भी वर्जित" / "Even water is abstained"
  window: {
    kind: 'sunrise-to-next-sunrise' | 'sunrise-to-moonrise' | 'sunrise-to-parana' | 'day-and-night-vigil';
    textHi: string; textEn: string;    // authored, verified — always what renders
  };
  parana?: {
    kind: 'next-day-sunrise-tithi-bound'   // computable: parana day sunrise → boundTithi end
        | 'same-day-after-moonrise'        // computable: this day's moonrise
        | 'text-only';                     // rule renders in words only
    boundTithi?: number;                   // 1–15; required iff kind === 'next-day-sunrise-tithi-bound'
    textHi: string; textEn: string;        // the rule in words — ALWAYS present and always rendered
  };
  strictnessHi: string; strictnessEn: string;       // variants note: nirjala vs phalahar options, traditional exemptions
  whoObservesHi?: string; whoObservesEn?: string;
  status: 'draft' | 'verified';                     // §8 gate — the registry exposes 'verified' only
  source: { referenceUrls: string[]; verificationNote: string };  // ≥2 URLs; review metadata, never rendered
};
```

`ObservanceRule` gains an optional **`upvasId?: string`** — the identical hook mechanism as `kathaId`/`vidhiId` (`festivals.ts` `createRule`). Many rules may share one entry (all Ekadashis → `ekadashi-upvas`), exactly as `EKADASHI_KATHA_BY_NAME` falls back to the shared `ekadashi-vrat-katha`.

`getUpvasInfo(id)` returns the entry **only when `status === 'verified'`** and null otherwise, so a draft entry is indistinguishable from no entry at every call site — the section stays absent with zero screen logic (§8).

### 5.2 Parana: static text vs engine-computed — **hybrid, text-canonical**

The parana **rule** is authored verified text and always renders. The **date/time line** is derived display, added beneath the text only when it can be computed honestly:

- `next-day-sunrise-tithi-bound` (the Ekadashi family): parana civil day = resolved occurrence date + 1 (occurrence already normalized for kshaya/vriddhi by `festivalEngine`, §9). A pure helper `upvasParana.ts` takes that day's `PanchangData` and returns `{ start: sunrise, end: min(boundTithi endTime, …) } | null` — null when the bound tithi has already ended before sunrise (the Hari-Vasara/pratah edge) or doesn't prevail that morning. Null ⇒ only the rule text renders. **Never an invented time.**
- `same-day-after-moonrise` (Sankashti, Karwa Chauth): the occurrence day's `PanchangData.moonrise`; null moonrise ⇒ text only.
- `text-only` (Pradosh, Janmashtami midnight-bound, Shivaratri-style vigils where the convention resists a single machine-checkable rule): no computed line, ever.

**Why hybrid and not either extreme.** Pure static text cannot carry a *time* — parana is location- and date-specific, which is precisely why the shipped location half of P4 matters (a Srinagar sunrise is ~40 min from a Kolkata one). Pure engine computation cannot carry the *rule* — the convention ("after sunrise, while Dwadashi prevails; if Dwadashi ends before sunrise, then after sunrise") is religious guidance that must be transcribed and verified, and its degenerate branches make a computed-only display either wrong or blank. Text is therefore canonical; the computed line is an annotation on it.

**Engine cost and discipline.** The two solves a computed line needs (occurrence day, parana day) go through the shared **`panchangDayStore`** (never a private cache — panchang wiki gotcha), keyed by the user's real `PanchangLocationContext` scope, deferred behind `InteractionManager` after first paint exactly like `useMuhurat`'s solve gate. Nothing about the parana line is persisted: like a muhurat follow's window, a stored parana time lies the moment the user changes city — it is re-derived per render from the store.

## 6. Surfaces

### 6.1 Which observances get it — the v1 verified starter set

Small, and chosen so every entry (a) attaches to rules that **already carry a katha** — pages users already treat as authoritative — and (b) exercises a distinct window/parana shape, proving the whole model before the long tail is authored:

| Entry id | Fast type | Parana kind | Attached rules (`festivals.ts` ids) |
|---|---|---|---|
| `ekadashi-upvas` | phalahar (nirjala optional) | `next-day-sunrise-tithi-bound`, boundTithi 12 | all 25 `EKADASHI_RULES` except निर्जला |
| `nirjala-ekadashi-upvas` | nirjala | `next-day-sunrise-tithi-bound`, boundTithi 12 | `nirjala-ekadashi` (strictness differs from the family) |
| `purnima-satyanarayan-upvas` | one-meal / phalahar | `text-only` | `purnima-vrat`, `shree-satyanarayan-vrat` (both carry `vidhiId: 'satyanarayan-puja'` — the §6.3 composition case) |
| `pradosh-upvas` | day fast, evening puja | `text-only` | `pradosh-vrat-shukla`, `pradosh-vrat-krishna` |
| `sankashti-chaturthi-upvas` | phalahar till moonrise | `same-day-after-moonrise` | `sankashti-chaturthi-vrat` |
| `karwa-chauth-upvas` | nirjala till moonrise | `same-day-after-moonrise` | `karwa-chauth` (has katha **and** `vidhiId: 'karwa-chauth-puja'`) |
| `maha-shivaratri-upvas` | night-vigil | `text-only` | `maha-shivaratri`, `masik-shivaratri` (the annual rule has `vidhiId: 'maha-shivaratri-puja'`) |
| `janmashtami-upvas` | phalahar till midnight | `text-only` | `janmashtami`, `masik-krishna-janmashtami` |

**8 entries covering ~35 observance rules** (the Ekadashi family does the heavy lifting, as it does for kathas). Everything else — weekday fasts, Navratri, Teej, Jivitputrika, the regional tail — ships later entries under the same gates as verification capacity allows; no schema change needed, and *no new phase*: the registry grows the way `kathaContent/entries/` has.

### 6.2 The section: उपवास विधि · How to observe

Rendered on Observance Detail **at the end of the scroll** — the position the parent PRD settled for "How to observe" (§6.2: hero → actions → About → Story → How to observe **last**). Layout (see prototype frame A):

- **Section heading** `उपवास विधि · How to observe` (same `blockHeading` treatment as महत्व/कथा).
- **Fast-type chip row** — a pill (निर्जला / फलाहार / एक भुक्त / रात्रि जागरण) in the existing saffron-tint pill language, followed by the one-line `fastTypeNote`. Chip text routes through `pillTextStyle` (Devanagari micro-type discipline, design.md §3.0) with the 1.15 multiplier cap.
- **उपवास काल row** — label + `window.text`.
- **पारण row** — label + `parana.text`; beneath it, when computable (§5.2), the quiet computed line: date · start–end, using `formatRangeCompact`/`formatEndInstant` from `muhuratFormat.ts`. The computed line carries the location's name implicitly (it is the Panchang location) and never renders when derivation returns null.
- **Strictness/variants footnote** — italic serif muted line (`strictness`), then optional `whoObserves`.

The block is a **non-interactive information panel** (like the Pitru detail's annual-answer facts): no chevron, no navigation — the actions live in the action row above. All copy flows through `contentByLang`/`meaningByLang`.

### 6.3 Composing with the PRD-19 vidhi card — one "How to observe" home

The shipped vidhi card is gated on a resolving `vidhiId` and is never a placeholder; this section must compose with it, not conflict. **Decision: one section, four states** (prototype frames A–C):

1. **Upvas only** → heading `उपवास विधि · How to observe` + fast-facts panel.
2. **Vidhi only** → **exactly today's shipped block, unchanged** (`पूजा विधि · How to observe` heading + card, testID `observance-vidhi-card`) — zero regression for the six current festivals.
3. **Both** → heading `उपवास विधि · How to observe`; fast-facts panel first; the vidhi card beneath it inside the same section, keeping its own `॥ पूजा विधि` title row. Rationale: the fast spans the whole day and begins at sunrise; the puja is one act *inside* the fast — facts frame the procedure. Two sibling sections both subtitled "How to observe" would be a duplicate answer to one question.
4. **Neither** → **no section at all.** Never a placeholder, never "Coming soon" — the parent's §6.2 placeholder is retired by this PRD, and the PRD-19 Phase 2B house rule becomes uniform across the page.

## 7. Localization

- **hi/en are authored** per entry; both are mandatory on every rendered field (the data-shape test enforces non-empty pairs).
- **gu/kn derive at runtime** by transliterating the Devanagari (`utils/transliterate.ts` via the normal `contentByLang` path) — the app-wide languages contract.
- **Latin→Devanagari is not possible** (same constraint that keeps pincode district names Latin): English fields stay English in every language; nothing is machine-transliterated into Devanagari.
- The fast-type chip and any micro labels that can carry Devanagari go through `pillTextStyle`/`scriptTitleFont` with real line-height (≥1.4× at micro sizes) — the §3.0 shirorekha-clipping family of bugs applies here.

## 8. Content sourcing & verification gates (the hard part)

Mirrors PRD-19 §3 and the repo's honesty conventions (`canonicalEditionStatus`, `NAMAKSHAR_SOURCE.verified`):

1. **Two concordant sources per entry.** Every row of every entry (fast type, window, parana rule, strictness, who-observes) is cross-checked against **at least two independent published references** — DrikPanchang as the common procedural reference plus a named second source per entry (Gita Press *Vrat-Parichay*/Kalyan annuals preferred, matching the PRD-19 canon choice). Discordant sources ⇒ the entry stays `draft`, with the discord recorded in `verificationNote`.
2. **Content-egress environment required.** This verification cannot be performed where DrikPanchang/archive.org are unreachable — the identical blocker PRD-19 Phase 3 records (attempts dated 2026-08-12 and 2026-08-14). Authoring the 8 entries is therefore gated on an authoring environment with content egress; **this PRD, its prototype, and all the code scaffolding (types, registry, helper, screen section, tests) can land first with zero verified entries and zero user-visible change** — that is what the `status` gate buys.
3. **DRAFT until sign-off.** Entries enter the repo as `status: 'draft'` with dated `verificationNote`s. `getUpvasInfo` filters drafts (§5.1), tests pin the filter non-vacuously, and customer copy never exposes draft/review/status language. Flipping to `verified` is a reviewed content change, not a code change — automation passing never authorizes it (the Namkaran release-gate convention).
4. **No composed religious guidance.** The implementer transcribes conventions; where a rule is regionally split (e.g. smarta/vaishnava Ekadashi day differences), the entry either carries the split explicitly in the strictness note (transcribed) or stays draft. Composing a "reasonable middle" is forbidden.

## 9. Edge cases

- **Observance with vidhi AND upvas info** — §6.3 state 3; pinned by the rendering-matrix test and shown in prototype frame B (Karwa Chauth).
- **Observance with neither** — §6.3 state 4: section absent; prototype frame C.
- **Kshaya / vriddhi (two-day) observances** — the *occurrence date* is already normalized by the festival engine (vriddhi fires the first day; a kshaya tithi matches the day it prevails). The parana derivation takes the **resolved** occurrence from `getNextOccurrence` and looks at resolved-date + 1; it never re-matches tithis itself (the wiki's "never re-match tithis" rule). When the parana morning's own angas are odd (bound tithi kshaya or already ended), the helper returns null and text-only renders.
- **Bound tithi ends before parana sunrise** (Dwadashi pratah-kala exception) — helper returns null; the verified rule *text* already states the convention's own answer, which is exactly why text is canonical.
- **`moonrise` null** (engine can return it) — text-only.
- **Location change mid-session** — computed line re-derives from `panchangDayStore` under the new scope; nothing persisted (§5.2).
- **Catalog-only / hidden rules** (`navagraha-weekday-fasts`, `shraddha-dates`…) — out of v1; the hook exists but no entry attaches.
- **Large font scales** — chip and label rows cap at 1.15/1.25 multipliers like other dense chrome; the fact text itself scales freely (devotional/reading text rule).

## 10. Test plan

Data-shape and helper tests run via **`tsx --test` (`npm run test:engine`)**, not Jest — the registry and helper are RN-free by construction (same boundary as `panchangDayStore`):

- `upvasContent.test.ts` — unique ids; every rendered hi/en pair non-empty; `source.referenceUrls.length ≥ 2` on every entry; every `upvasId` in `festivals.ts` resolves to an entry; every entry is referenced by ≥ 1 rule; `boundTithi` present iff kind is tithi-bound and within 1–15; **draft entries are not exposed** by `getUpvasInfo` (proven non-vacuous against a fixture draft entry); Devanagari well-formedness on all Hindi fields (the #243 gate).
- **Content-correctness pins** — per-entry facts asserted literally so refactors can't silently swap rules: `ekadashi-upvas.parana.boundTithi === 12`; `nirjala-ekadashi-upvas.fastType === 'nirjala'`; `karwa-chauth-upvas.parana.kind === 'same-day-after-moonrise'`; the full attached-rule sets of §6.1's table.
- `upvasParana.test.ts` — the pure helper: normal Dwadashi morning window; Dwadashi-ends-before-sunrise ⇒ null; moonrise null ⇒ null; a pinned kshaya-occurrence case (reuse the Yogini Ekadashi 2026-07-10 reference date from the engine suite).
- Jest: `ObservanceDetailScreen` rendering matrix — the four §6.3 states, including that state 2 renders byte-identical structure to today's shipped block and that no placeholder string exists in the tree for state 4.
- e2e: extend the existing vrat-catalog Maestro flow with one assertion on a verified detail page (post-content only; skipped while the registry is empty).

## 11. Decisions & open questions

**Decided:**
- **Scope** — fasting-content half only; location half already shipped; this completes PRD-09 (no P5).
- **Data model** — `upvasContent/` family mirroring `kathaContent/`; `upvasId` hook on `ObservanceRule`; shared entries across rule families.
- **Parana** — hybrid: verified rule text canonical and always rendered; engine-computed date/time line only for the two machine-checkable kinds, via `panchangDayStore`, null-safe, never persisted.
- **Section** — one "How to observe" home, last on the page; fast facts before the vidhi card when both exist; absent when neither — no placeholder anywhere.
- **Gates** — two concordant sources per entry; draft-until-sign-off with the registry filter; content-egress environment prerequisite; no composed guidance.
- **Localization** — hi/en authored, gu/kn transliterated from Devanagari, English fields stay English.

**Open:**
1. Should the shared `ekadashi-upvas` later split per-Ekadashi (each has flavor differences some sources record)? Default: stay shared until a second source demands a split — mirrors how per-Ekadashi kathas were added incrementally over the shared one.
2. Does the day panel's `ObservanceCard` ever surface a fast-type chip (a glance affordance on the calendar)? Out of v1; detail-only. Revisit only with usage signal.
3. Smarta/vaishnava Ekadashi-day divergence: v1 transcribes it as a strictness-note line; whether the engine should ever *compute* the alternate day is explicitly not this PRD's question (it would be an engine convention change with its own verification).
