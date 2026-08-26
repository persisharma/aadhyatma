# PRD-17 — Namkaran (नामकरण) — Nāmākṣara & Name Suggestions

| | |
|---|---|
| **Status** | Phase 1 engineering shipped (#261, #262, #263). Convention sign-off (§11 gate 1) and corpus content gate (§11 gate 2) are both still open and both block a store release; the corpus in the repo is a development sample, not the shipping set. Android Maestro (§11.9) also outstanding. |
| **T-shirt size** | **L** — the arithmetic is trivial (one Moon longitude), but a bundled name corpus with attested meanings, a 108-cell convention table, newborn-grade privacy, and four reading languages make this the largest Jyotish slice so far. |
| **Prototype** | [`docs/namkaran-prototype.html`](../../namkaran-prototype.html) — 7 frames: entry, birth input, nāmākṣara result, name detail, unknown-time range, shortlist + share, guest browse |
| **Convention** | [`namkaran-namakshar-v1.md`](../conventions/namkaran-namakshar-v1.md) — the 108-charana syllable table, nakshatra attributes, and the derived rashi rule |
| **Feasibility** | No new native dependency. The calculation reuses `getSiderealPlanetLongitude('moon', …)`; the naming-day muhurat **already ships** (`EVENT_RULES.namkaran`, PRD-16). The only genuinely new asset is the bundled name corpus, which is why this is L and not M. Ships OTA **if** the corpus lands with it in the same JS bundle. |

> **Product stance:** this feature hands the parent a *traditional starting syllable and a shelf of
> attested names*, and gets out of the way. It does not name the child, rank names, score them,
> predict the child's nature, or claim an outcome. The family and their purohit decide; the app
> supplies the syllable, the meanings, and the muhurat.

---

## 1. Problem and goal

Namkaran Sanskar is the one lifecycle rite where almost every Hindu family needs a *specific
calculated input* — the nāmākṣara, the syllable the child's name should begin with, derived from the
Moon's charana at birth. Today parents get that syllable from a purohit, or from web name sites that
wrap it in ad-loaded lead forms, invented "numerology scores", and name lists with wrong or absent
meanings.

Vedansh already computes the exact input required (sidereal Moon longitude → nakshatra → pada, in
`kundali.ts`) and already ranks naming-ceremony muhurat days (`EVENT_RULES.namkaran`). The gap
between what is shipped and what a parent needs is **the syllable table, an attested name corpus,
and one calm screen that joins them**.

### Goal (v1)

1. Derive the nāmākṣara from the child's birth moment — or let the parent browse by nakshatra/pada
   with **no birth data entered at all**.
2. Offer names that genuinely start with that syllable, each with a meaning and, where it exists, a
   link into content the app already ships.
3. Let the parent shortlist candidates and share the shortlist without leaking the birth
   moment.
4. Connect the naming day to the muhurat finder that already exists.

### Success (local diagnostics only)

Counted privately and shown only in user-visible diagnostics, exactly per PRD-16's stance:

- namkaran sessions started, and started-with-birth-details vs started-in-browse;
- shortlist adds and removals;
- name-detail opens;
- muhurat-door taps, vidhi opens, share-preview generations, share-sheets opened.

Do not record a share as *completed* — the OS does not report the downstream result. Do not publish
aggregate adoption claims without a separately reviewed telemetry plan. **No name, no syllable, and
no birth field may appear in any counter** (§8.3).

## 2. Users and the two paths

| Path | Who | Entry state |
|---|---|---|
| **A · Calculated** | A parent (or grandparent) with the newborn's exact birth date and time | Enters date + time → exact charana → one syllable set |
| **A′ · Calculated, time unknown** | Birth time not recorded or not to hand | Enters date, marks समय ज्ञात नहीं → the *set* of charanas the Moon touched that IST day → every syllable in that set, no single hero |
| **B · Browse** | Someone who already knows the nakshatra/pada from their purohit, or is browsing out of interest | Picks nakshatra + pada (or opens the full 108-syllable index) → syllable set. **No birth data is requested or stored.** |

Path B is a first-class path, not a fallback — it is the privacy-minimal default and the one a
grandparent with a purohit's slip will use. The entry screen presents both without ranking one as
the "real" flow.

## 3. Placement and navigation

`PanchangScreen` → **ज्योतिष** landing gains a **नामकरण · Namkaran** card **below** अष्टकूट मिलान,
with the standard versioned NEW badge. It is a **fourth `JyotishToolCard`** — the identical
leading-glyph row treatment as the दैनिक राशिफल / मेरी कुंडली / अष्टकूट मिलान cards, **not a new card
design**. The Jyotish landing order becomes:

```
[saved-profile state] दैनिक राशिफल → मेरी कुंडली (compact) → अष्टकूट मिलान → नामकरण → practice card
[guest state]         कुंडली बनाएँ → दैनिक राशिफल → अष्टकूट मिलान → नामकरण → practice card
```

Routes are added to `PanchangStackParamList` inside the **existing Panchang stack** — never a
duplicate root-stack route (design.md §51/§58/§60 precedent):

| Route | Params | Purpose |
|---|---|---|
| `Namkaran` | — | Entry: path A input / path B picker |
| `NamkaranResult` | `{ source: 'birth' \| 'manual', … }` | Syllable + name list |

Name detail is a **bottom sheet inside `NamkaranResult`**, not a third route — the stack is already
deep and a name is a detail of the list, not a destination.

### 3.1 No Home tile in v1 — deliberate

The Home launcher grid is currently **16 tiles = 5 × 3 plus the full-width नित्य साधना closer**
(design.md §18, wiki `panchang.md`). A 17th tile leaves an orphan in the closing row and breaks the
grid's shape. So v1 ships **no Home tile**; discovery is the Jyotish landing card + the NEW badge +
the Feature Spotlight carousel (§32), which is designed for exactly this. Revisit only alongside a
deliberate grid re-flow.

## 4. Input experience

### 4.1 Birth details, borrowed not rebuilt

Path A reuses the controlled **`BirthDetailsForm`** primitive introduced for Guna Milan (PRD-16 §3.2)
— `value` / `onChange` / validation / disabled / persistence policy — with the shipped
`CalendarDatePicker` and `ClockTimePicker` field-buttons (design.md §52a). One deviation from
Kundali: the date range is **the last 24 months through today-IST**, not `1900-01-01`, because this
is a newborn's naming rite; a wider range is accepted in path B via manual nakshatra entry instead
of pretending the syllable table needs a birth century.

**No birth city is requested.** The charana depends on geocentric Moon longitude at an instant, not
on place — the identical reason Guna Milan omits it (PRD-16 §3.2). Do not add a city field "for
completeness"; it would be collected, stored, and never used. The **naming-day muhurat** door *does*
need a location, and it uses the user's existing `PanchangLocationContext` city — not a birth place.

The child's name field does not exist at input time. There is nothing to name yet; that is the point
of the feature.

### 4.2 Unknown birth time is an interval, never noon

Marking **समय ज्ञात नहीं** must not substitute 12:00 and must not persist a fabricated time. The
Moon covers ≈ 3.6–4.5 charanas in a civil day, so an unknown time genuinely means **3–5 candidate
syllable sets**, and the surface says so:

- enumerate every charana the Moon occupies during `00:00–23:59:59` IST;
- render each candidate as the shipped **`ListCard`** row (thumb = the candidate syllable, title =
  nakshatra · pada, with the IST window it held as the emphasised line —
  `12:00 AM – 6:41 AM · मघा पद 2 → मी`), ordered by time. **No forked "candidate" card** — a list is
  a list, the same `ListCard` grammar as the name rows (§5.3) and the muhurat results;
- **no single hero syllable, no "most likely" ranking, no share of an exact syllable** — the uniform
  list rows *are* the restraint Guna Milan applies to an uncertain score (PRD-16 §3.3);
- one line of copy explains why: *"चन्द्रमा दिन भर में नक्षत्र बदल सकता है — इसलिए सम्भावित अक्षर एक से अधिक हैं।"*

If the parent later learns the exact time, re-entering it collapses the set to one group. That
transition must be visible, not silent.

### 4.3 Path B — manual and index

Two controls, no birth data:

1. **नक्षत्र + पद picker** — a compact **3-column × 9-row** nakshatra launcher grid
   (Devanagari or English name fitted inside the shipped Home `CategoryCard` launcher tile; no
   ordinal-number title) followed by four `ListCard` pada rows. This keeps all 27 choices scannable without a
   27-card scroll, and lands on the same result screen with `source: 'manual'`.
2. **सभी नामाक्षर · all 108** — the full convention table as a scrollable index, grouped by
   nakshatra, each cell tappable straight into that charana's names. This is also the honest
   "I just want to browse names" door.

### 4.4 Privacy and persistence

Newborn birth date + time is the most sensitive record this app would hold, and it is data about a
person who cannot consent. Therefore:

- **Session-only by default.** Nothing about path A persists unless the user turns on an explicitly
  unchecked **जन्म विवरण याद रखें · Remember birth details**, with a visible clear action — the
  Guna Milan model (PRD-16 §3.4), including its invalidating-mutation-queue behaviour so turning the
  toggle off removes a write already in flight.
- **The shortlist is separable.** A shortlist of names persists under its own key and contains
  **names and syllables only — never the birth moment, never the derived charana index tied to a
  date**. A parent must be able to keep the shortlist and drop the birth details.
- **Path B stores nothing** beyond the shortlist.
- **No autofill from the Kundali profile.** The saved Kundali profile is an *adult's* chart (the
  device owner's), and copying it into a newborn's naming flow would produce a confidently wrong
  syllable. Guna Milan's "मेरे विवरण यहाँ" chip must **not** appear here. This is a deliberate
  break from §58 precedent — state it in the code comment so a later refactor doesn't "fix" it.
- **No implementation disclosure in customer copy.** The form explains only the action and its
  consequence (for example, “अगली बार यह फ़ॉर्म पहले से भरा मिलेगा · Prefill this form next time”).
  It must not mention on-device calculation/storage, offline or internet/account requirements,
  local notifications, schema/convention versions, or similar architecture details (RULEBOOK §3).

## 5. Result experience

### 5.1 The nāmākṣara card — the answer, first

Answer-first, matching the muhurat day detail (design.md §60): the syllable **is** the hero.

```
┌─────────────────────────────────────┐
│  ॥  नामाक्षर                        │   eyebrow
│                                     │
│            चू                       │   the syllable, the largest glyph on the screen
│           Chu                       │   pronunciation aid
│                                     │
│  अश्विनी नक्षत्र · पद 1 · मेष राशि   │   provenance line
│  अन्य विकल्प: —                     │   alternates when the charana carries them
└─────────────────────────────────────┘
```

- Uses the `cardActiveFrom → cardActiveTo` gradient + gold `॥` mark + `elevation.lifted`, the
  shipped answer-block treatment.
- The provenance line names nakshatra, pada, **and** rashi, because families differ on which they
  name by (§5.4).
- Below it, a quiet **कैसे निकला? · How this was derived** disclosure explains the user-level
  tradition: the Lahiri method maps the Moon's nakshatra and pada at birth to a starting sound. It
  never exposes a convention id, DRAFT/review state, implementation location, or connectivity claim.

### 5.2 Nakshatra context (display-only)

One collapsed row: presiding देवता, Vimshottari lord, gana with a neutral one-line gloss. Governed
by the convention doc's copy constraint — **no temperament, no warning, no claim about the child**.
If a reading language cannot carry the gana gloss neutrally, the row is dropped in that language,
not softened.

### 5.3 The name list

The core deliverable. Each row is the shipped **`ListCard`** (design.md §60) — no forked look:

- **thumb**: the syllable glyph (Devanagari, not an emoji);
- **title**: the name in Devanagari at the read tier;
- **subtitle**: pronunciation aid + one-line meaning;
- **trailing**: a shortlist toggle (44 pt) — *not* the library `+` add-to-routine affordance;
- **filters**: a `बालक · Boy | बालिका · Girl | सभी · All` segment, plus a syllable-count chip
  (2/3/4+ अक्षर) because "short name" is the single most common real constraint.

**Corpus coverage requirement.** Every charana that a real Moon can occupy must return names — an
empty result on a legitimate syllable is a shipping defect, not an edge case. Target: **≥ 12 boy and
≥ 12 girl names per charana** (raised from 6 + 6 by the corpus-depth decision, August 2026: at the
6 + 6 floor a parent narrowing to one gender *and* a syllable count could be left with one or two
rows, which reads as a broken screen rather than a short list). A name classed `any` counts toward
both genders, matching the runtime filter. Where the traditional syllable begins essentially no modern name
(ङ, ञ, ष, ण, ठ, थ — convention §2 open rows 2–3), the surface **falls back to the nakshatra-level
syllable set**, says so in one line (*"इस पद के लिए प्रचलित नाम सीमित हैं — पूरे नक्षत्र के अक्षर दिखाए जा रहे हैं"*),
and **never invents a name or a syllable** to fill the gap.

### 5.4 Rashi cross-check

A quiet second card: **राशि अनुसार अक्षर** — the 9 syllables of the child's Moon rashi, derived per
convention §4 (never a second table). Copy states plainly that some families name by rashi rather
than by charana, and that both are traditional. This card is the single highest-value piece of
honesty in the feature: it prevents the app from appearing to contradict a family's purohit.

### 5.5 Name detail sheet

A bottom sheet, one name at a time:

- name (Devanagari, large), pronunciation aid, syllable and nakshatra it belongs to;
- **meaning** in Hindi + English, and the word's root/derivation when attested;
- **deity or source link** where one exists — a name that is an epithet of a shipped deity links to
  that deity's page in the existing **Deity Index** (design.md §42, `deities.ts`), so
  *आरव → nothing*, but *केशव → श्री कृष्ण → the Krishna texts already in the app*. This is where the
  feature earns its place inside a devotional reader rather than a name website.
- shortlist toggle, and a copy action for the name text alone.

### 5.6 Doors out — reusing what already ships

Two rows at the foot of the result, both pure navigation into shipped surfaces:

| Door | Goes to | Why it already works |
|---|---|---|
| **नामकरण मुहूर्त · naming-day muhurat** | `MuhuratResults` for occasion `namkaran` | `EVENT_RULES.namkaran` shipped with PRD-16 — nakshatras, tithis, varas, and a 6-dosha stack are already defined and scanned |
| **नामकरण संस्कार विधि** | the `sanskar` reader | Needs one new content module (§6); the reader, category, and NEW badge all exist |

## 6. Content additions

| Asset | Shape | Gate |
|---|---|---|
| **Name corpus** | `mobile/src/data/namkaran/` — **one shard per nakshatra** (`names.<NN>-<slug>.json`, 27 files), ~2,450 names, each `{ id, hi, latin, gender, charanas[], meaningHi, meaningEn, root?, deityId?, syllableCount }`, plus a generated `counts.json` charana → count index | RULEBOOK §11 content integrity — every name needs an attested meaning; **no invented names, no living-person/celebrity lists, no "trending names"** |
| **Namkaran vidhi** | one `sanskar` content module (नामकरण संस्कार — the rite's steps and its mantras) | RULEBOOK §1–§4 + §9 (explanation and importance of every sloka and ritual) |
| **Convention data** | `namkaranConvention.ts` mirroring [`namkaran-namakshar-v1.md`](../conventions/namkaran-namakshar-v1.md) | Convention sign-off, `verified: false` until then |

**The name corpus is deliberately kept out of the global search index** (RULEBOOK §7). Adding ~1,500
short entries would swamp verse and text results for common query strings — search "राम" and get 40
baby names before the Ramayana. Names are reachable only from inside the Namkaran surface. Revisit
only with a scoped search-section design.

## 7. Non-goals

- **Numerology, name scores, "lucky" numbers, name-compatibility percentages, or a best-name pick.**
  The feature offers a syllable and attested meanings; ranking names is not a calculation, it is a
  family decision.
- Any claim about the child's nature, career, health, longevity, or future — including anything
  inferred from gana, lord, or nakshatra.
- Remote name APIs, AI-generated names, or a name feed of any kind. The corpus is bundled and
  reviewed, or it does not ship.
- Gender prediction, or requiring gender before showing anything (the `सभी` filter is available and
  the segment defaults to it).
- Nickname/rashi-name generators, initials-matching with parents' names, or sibling-name matching.
- Cloud sync, accounts, saved-session history beyond the one opt-in record, or lead capture.
- The secret-name / public-name (गुप्त नाम) custom as a *feature* — v1 explains it in the vidhi
  content, and does not build a second name slot for it.
- Namkaran-day nakshatra as an alternative basis (some traditions use the ceremony day, not the
  birth day). Explained in copy; not a second calculation path in v1.

## 8. Architecture and delivery

### 8.1 Layers

| Layer | Responsibility |
|---|---|
| `panchang/namkaranConvention.ts` | Immutable, versioned: 108-charana syllables + alternates, nakshatra attributes, source metadata, `verified: false` |
| `panchang/namkaran.ts` | **PURE**: instant → charana/pada/rashi/syllables; interval → candidate charana set; `rashiSyllables()` derivation. No React, no `Date.now()`, no storage — the `kundali.ts` boundary, pinned by a source-purity test |
| `data/namkaran/` | The bundled corpus + a generated charana → name-id index; **lazy-required**, never imported from `texts.ts` |
| `useNamkaran.ts` | Hook: input state, IST→UTC, explicit loading/browse/result/error states, opt-in persistence policy |
| `useNamkaranShortlist.ts` | Shortlist persistence under its own key, independent of birth details |
| Share model | Explicit allow-list of display fields; never serialize the input object |

### 8.2 Reuse ledger — what this feature does *not* build

| Already shipped | Used for |
|---|---|
| `getSiderealPlanetLongitude('moon', …)`, Lahiri ayanamsa | the one calculation |
| `NAKSHATRA_NAMES_HI/EN`, `RASHI_NAMES_HI/EN/WESTERN`, `DASHA_ORDER` | every label; the lord-column equality test |
| `BirthDetailsForm`, `CalendarDatePicker`, `ClockTimePicker`, `TextField` `form` variant | all input |
| `CategoryCard variant="launcher"`, `ListCard`, `ReaderHeader variant="index"`, `ShareButton`, `JyotishStateCard`, `JyotishPracticeCard`, `JyotishToolCard` (the landing row) | the 27-choice grid plus all remaining chrome — shipped grammars, no forked look |
| `EVENT_RULES.namkaran` + `MuhuratFinder`/`MuhuratResults` + `panchangDayStore` | the naming-day muhurat door — **zero new engine work** |
| `deities.ts` + Deity Index (§42) + the reader dispatcher | name → deity → shipped texts |
| `react-native-view-shot` → `expo-sharing`, the 4:5 / 1080×1350 share family | the share card |
| `sanskar` category + reader + NEW badge | the vidhi module |

New native dependencies: **none**. New caches: **none** — the muhurat door reads `panchangDayStore`
like every other panchang surface (design.md §60: do not add a private cache).

### 8.3 Privacy invariants (testable)

1. No birth date, birth time, or derived-charana-plus-date pair appears in the share card, its
   embedded metadata, the shortlist record, or any diagnostic counter.
2. The shortlist record survives clearing the birth details, and clearing the shortlist does not
   clear the birth details.
3. Path B writes no birth-details key at all.
4. Share of a *name* requires an explicit opt-in per share, with the warning visible in the preview;
   syllable + nakshatra alone are shareable without a warning.
5. An unknown-time result has **no** exact-syllable share action.

### 8.4 Bundle-size guard

The corpus is the first sizeable data addition outside a content module. It must be **lazily
required from inside the already-lazy Panchang stack** so it cannot touch Home's first frame, and
CI must fail if it exceeds the agreed byte budgets.

The original single budget was **512 KB** raw JSON with the instruction to shard rather than raise it
silently. The 12 + 12 depth decision put the corpus at roughly 750 KB, so that escape hatch was
taken: the reviewed sharding decision (RULEBOOK §18.4) splits the corpus **one shard per nakshatra**
and replaces the single cap with two:

- **≤ 64 KB per shard** — the budget that protects the user, because a screen reads at most two
  shards. Worst case is an unknown-time day straddling a nakshatra boundary: ~58 KB against the
  512 KB a single file would have cost.
- **≤ 1,024 KB total** — the bundle ceiling, not a runtime figure.

Sharding by nakshatra rather than by syllable group (the original §8.4 wording) follows the access
pattern: `charana → nakshatra` is `floor(c/4)`, so an exact result reads exactly one shard and the
thin-charana fallback reads exactly one shard, because a nakshatra *is* a shard. Per-charana counts
for the rashi detail come from the generated index, never from loading shards to tally them.

## 9. Phasing

| Phase | Contents | Ship |
|---|---|---|
| **1** | Convention + pure engine + result screen (paths A, A′, B) + corpus + shortlist + rashi cross-check + muhurat door + share | OTA-capable (pure JS + bundled JSON), gated on §11.1–§11.2 |
| **2** | Namkaran vidhi `sanskar` module; Feature Spotlight entry; name-detail deity links for the full corpus; customer-copy audit removes implementation/connectivity/version language in all four reading languages | store release if the vidhi ships audio, else OTA |
| **3** | Namkaran-day reminder (reuses the vrat `VratReminderPref` model, the same slice PRD-16 defers) with action-only reminder copy; Home tile alongside a grid re-flow; namkaran-day nakshatra as an explicit second basis; no “local/on-device/offline” reassurance on any new surface | — |

— **Phases 2–3 detailed in [17-namkaran-phase2-3.md](./17-namkaran-phase2-3.md)**

## 10. Design requirements

- Warm manuscript palette only — `parchment*`, `ink*`, `saffron*`, `gold`, `divider`, `goldTint`,
  `cardActive*`. **No new colour token** is expected; if one becomes necessary it lands in
  `colors.ts` + design.md *before* use (RULEBOOK §3).
- Noto Serif Devanagari for Hindi-led content, Cormorant Garamond italic for Latin secondary,
  Inter for compact labels. The 10 pt floor holds, and any 10 pt line that can carry Indic needs
  ≥ 1.4× leading and a script-capable face (design.md §3.0 — the trap that clipped
  `JyotishShareCard`). The syllable hero is the largest glyph on the screen and must be given a
  fixed, generous line box rather than inheriting a text style.
- `ReaderHeader variant="index"`; every control ≥ 44 pt, field-buttons ≥ 48 pt (§12/§52/§52a).
- **No emoji** anywhere (`॥`, `ॐ`, chevrons, drawn glyphs only).
- Gender filter, shortlist state, and the fallback notice are conveyed by **word + tint, never
  colour alone** (§12). A shortlisted row must be identifiable in greyscale.
- Sheet expansion uses the standard layout animation and respects reduced motion.
- Every string authored in Devanagari + English through `contentByLang`; gu/kn derive by
  transliteration (wiki `languages`). Accessibility labels stay stable in English for Maestro even
  when Hindi is the visible reading language.
- Customer-visible copy follows RULEBOOK §3: describe the action, content, or outcome; never expose
  on-device/offline/internet/account/storage/version implementation details. This applies equally to
  Phase 2 Spotlight/vidhi/deity-link copy and Phase 3 reminder/Home-tile copy in hi/en/gu/kn.
- The syllable must be exposed to screen readers as a *pronounceable label plus its Latin aid*, not
  a bare glyph — a lone `चू` read by TTS in an English voice is unusable (wiki `audio` traps).

## 11. Verification gates

Not shippable until every gate passes:

1. **Convention review** — a domain reviewer signs off all 108 syllables, alternates, the four open
   rows (convention §2), gana/deity attributes, and the derived rashi rule, with two concordant
   sources each (RULEBOOK §11). Until then `verified: false`, pinned by a test.
2. **Corpus content gate** — every name has an attested meaning in both languages; no invented
   names; no living-person lists; charana assignment matches the name's actual first syllable
   (mechanically checkable — a test asserts the Devanagari initial against the convention cell);
   coverage ≥ 12 + 12 per charana, or — for a thin charana — a nakshatra-level fallback pool that
   itself clears 12 + 12, since a fallback that is also empty is not a fallback; no duplicate ids.
   `namkaranCorpus.test.ts` enforces the floor the moment `NAMKARAN_CORPUS.releaseEligible` becomes
   `true`, and while it is `false` it asserts the inverse — that gaps still exist — so a finished
   corpus cannot sit behind a stale flag.
3. **Boundary corpus** — longitudes immediately below / at / above every one of the 108 charana
   boundaries (multiples of 3°20′) resolve to the correct cell, with the existing astronomy
   tolerance considered when choosing fixture instants. Golden charana values sourced
   independently, not captured from the implementation under test.
4. **Properties** — `charanaIndex ∈ [0,107]`, `pada ∈ [1,4]`, `nakshatraIndex = ⌊charana/4⌋`,
   `rashiSyllables(r)` has exactly 9 charanas, lord column equals `DASHA_ORDER[n % 9]`.
5. **Unknown time** — a same-charana-all-day case yields one group; a boundary-crossing day yields
   the full ordered set with correct IST windows; IST day edges; no fabricated or persisted noon;
   no exact-syllable share.
6. **Privacy** — all five invariants of §8.3, plus the opt-in/clear/in-flight-write behaviour, plus
   no Panchang-location mutation, plus the absence of Kundali autofill.
7. **UI / accessibility** — 44 pt controls; sheet expanded/collapsed semantics; screen-reader
   syllable label with Latin aid; dynamic type at the largest step without clipping the hero;
   hi/en/gu/kn; greyscale legibility; reduced motion.
8. **Performance and size** — corpus lazily required; Home's first interactive frame unchanged
   (measure, don't assume); corpus within the §8.4 byte budget; result render under the same
   interaction-deferral discipline as `useMuhurat`.
9. **Integration** — navigation/back/deep-link fallback; muhurat door lands on the `namkaran`
   occasion; deity links resolve to real shipped texts; share preview/cancel; `npm run lint` **0
   errors**; typecheck; focused Jest + tsx suites; a Maestro flow run and reported **independently
   on iOS and Android** (RULEBOOK §8).
10. **Docs** — design.md gains **§61 Namkaran** and RULEBOOK gains **§18** (the corpus + convention
    contract) in the same PR as the code, per `.claude/rules/design-doc-sync.md`.

## 12. Risks

| Risk | Mitigation |
|---|---|
| **Convention divergence** — published syllable tables disagree, most sharply on Shravana | The convention doc is the internal contract and the feature remains release-gated until review closes; user copy names only the Lahiri method, while the rashi cross-check (§5.4) keeps the app from appearing to contradict a purohit |
| **Corpus quality is the whole feature** — a wrong meaning is worse than a missing name | §11.2 is a hard gate; the initial-vs-charana check is mechanical; thin padas fall back rather than get filled with invented names |
| **Scope creep toward a name-scoring app** | §7 non-goals are explicit; no numerology, no ranking, no best-pick |
| **Newborn PII** | Session-default, separable shortlist, no city, no Kundali autofill, five testable invariants |
| **Bundle growth** | Lazy require + CI byte budget (§8.4) |
| **Overreach in copy** — gana/nakshatra sliding into personality claims | Convention §3 copy constraint; drop the row rather than soften the term |

## 13. Open questions

1. **Shravana's ज/ख series** — one series or both? (convention §2 open row 1) — **still open**, and
   still needs the §11.1 domain reviewer; it is a claim about tradition, not a product call.
   *Corpus policy is settled, though, so authoring is no longer blocked on it:* Shravana's four
   charanas are filled to 12 + 12 each drawing from **either** series, exactly like every other
   nakshatra. The UI already renders ज primary with ख as अन्य विकल्प. If the reviewer later drops a
   series, those names are re-filed rather than re-collected.
2. ~~**Corpus size target**~~ — **settled (August 2026): 12 + 12 per charana**, ≈ 2,450 names.
   The recommendation here had been the smaller 6 + 6 set on bundle-cost grounds; the depth decision
   went the other way for filter quality (§5.3) and paid for it with the nakshatra sharding in §8.4
   rather than with thinner meanings.
3. **Gender vocabulary** — `बालक/बालिका` vs `लड़का/लड़की`; and whether `सभी` or a gender is the
   default. Recommendation: `बालक · बालिका · सभी`, defaulting to `सभी`.
4. **Should the vidhi module ship in Phase 1** rather than 2? It is the piece that makes this a
   *sanskar* feature rather than a name lookup; the only reason it is Phase 2 is content-review
   throughput.
