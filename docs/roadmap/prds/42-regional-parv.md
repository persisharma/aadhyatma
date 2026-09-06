# PRD-42 — क्षेत्रीय पर्व · The Regional, Sampradaya & Jain Calendar

| | |
|---|---|
| **Status** | **Wave 1 shipped 2026-09-06** (§14 build record) — 17 observances, data only, no new mechanism. **Waves 2–8 proposed.** Wave 2 (the lens) is the gate: waves 3–8 are content that has nowhere to live until it exists. |
| **Trigger** | Sept 2026 user report: *"A lot of important dates like Goga Navami missing from calendar. Do a check for all Rajasthani and Bihari related dates. Also let's plan something around Jain specific or regional category too from different states."* Extended on request to **every** state. |
| **Scope** | **22 lenses** — 20 regional (every state with a distinct Hindu observance calendar) + 2 traditions (`jain`, `sindhi`). Appendix A registers **141 candidate observances** across those lenses; Appendix C adds **8 universal gaps** that are nobody's region and are simply missing — **149 in total**. |
| **Owner surface** | Panchang tab (design.md §33) — no new tab, no new Home category, no new notification family. |
| **T-shirt size** | W1 **S** (done) · W2 **M** (the mechanism) · W3 **M** · W4 **L** · W5 **L** · W6 **M** code + **L** content · W7 **L** · W8 **M**. Realistically a **three-to-four quarter content programme** with a one-sprint code gate in front of it. |
| **Delivery** | OTA-safe throughout: TypeScript + bundled data. No native dependency, no backend, no migration. `CACHE_VERSION` bump per wave. No `PANCHANG_DAY_CACHE_VERSION` bump in W1–W5; W6's nakshatra-in-solar-month solver may need one — decide when it is written, don't default. |
| **Contract** | RULEBOOK **§23a** (adding an observance — written by W1) · **§23** (vyapini day selection) · **§21** (bhog) · **§20** (upvas) · **§19/§26** (vidhi, arcs) · **§11** (content integrity) · **§25** (ask intents) · design.md **§33** |
| **Prototype** | **Drawn & signed off 2026-09-06** — [`docs/regional-parv-interactive-prd.html`](../../regional-parv-interactive-prd.html): lens sheet, detail caption, and the entry-point study. **Entry decided: pattern E** — a क्षेत्र ledger row on the व्रत-पर्व segment (third, after मेरा व्रत · पितृ स्मरण) + the dismissible seed line on the पंचांग day view. The header chip in the original proposal is **dropped**: the chip row already carries location, calendar-system and ★ follows. |

> **Locked decisions (do not drift).**
> ① **The app never asks a user to declare a religion, caste, language or community.** A lens is a *calendar* the user turns on, seeded silently from the city they already chose. Everything stays findable through search whether a lens is on or off.
> ② **A lens only ever ADDS.** It never hides a universal observance. Subtraction is a religion question wearing a filter's clothes.
> ③ **A lens filters presentation only.** The precomputed table carries every rule, so toggling is instant, offline and re-runs no scan.
> ④ **Nothing here changes an existing rule's tithi, month, paksha or `dayRule`** — the one exception is §5.1, which is its own separately-verified change and must never ride a content wave.
> ⑤ **No new notification family, and nothing joins the default-on festive catalog.** A lensed observance reaches reminders the way every other one does: ★ follow.
> ⑥ **Where two lineages or two regions differ, both ship, both named.** Never one as "the" date. Kashmiri Herath is Trayodashi and the app's Mahashivratri is Chaturdashi; both are correct, for different people.
> ⑦ **A folk deity is a deity.** Gogaji, Tejaji, Ramdevji, Jhulelal, Chhathi Maiya, Manasa, Sama-Chakeva, Khandoba, Garia and Bathukamma get the same treatment and the same content depth as the pan-Hindu names. The words "folk", "tribal" and "minor" never appear in user-facing copy.

---

## 1. The problem

### 1.1 What the audit found

The Sept 2026 check covered every Rajasthani and Bihari/Maithil observance a household would expect, against the 118-rule catalog as it then stood. It found two layers, and the second one is the reason the gap felt larger than "one missing festival".

**Twelve observances were absent outright** — Goga Navami, Ramdev Jayanti, Teja Dashami, Shitala Ashtami, Dasha Mata, Chaiti Chhath, Madhushravani, Sama Chakeva, Chitragupta Puja, and the three pan-Hindu gaps the same sweep surfaced (Kartik Purnima, Chaitra Navratri, Mahavir Jayanti).

**Five more shipped a katha but no date.** गणगौर · सकट चौथ · शीतला सप्तमी · बछ बारस · आशा दशमी each had a full bilingual katha *and* a verified bhog profile in the binary while their rule was `hidden()` / `ruleType: 'catalog-only'` — no `lunarMonth`, no `tithi`. `resolveRuleDates` returns `[]` for those, so the app could tell you the story of Gangaur and could not tell you when Gangaur was.

### 1.2 Why this is structural, not a content backlog

Three mechanisms, not three oversights:

1. **`hidden()` looks like "ship it quietly" and actually means "ship it dateless."** The helper sets `recurrence: 'catalog'` + `ruleType: 'catalog-only'`, and the matcher short-circuits on both — *even when the seed carries a tithi* (`ashoka-ashtami` does, and still resolves to nothing). Nothing in the type system or the tests distinguished "deliberately undateable" (`chaturmasa`) from "we never got round to the tithi".
2. **`visibility: 'regional'` is a trapdoor, not a label.** `getObservanceCatalog()` returns `default` only and **no surface anywhere passes `includeHidden`**. So the one field that reads like "this is a regional festival" is, in effect, delete. It is currently carrying `karthigai-vrat` and `rohini-vrat` — two real observances that render nowhere.
3. **There was no contract for adding an observance at all.** RULEBOOK §23 said which *day* a rule lands on and nothing about what it takes to add one. W1 wrote §23a to close that.

### 1.3 The scale of what is still missing

The catalog after W1 is **130 rules, 116 default-visible, 4,482 precomputed date rows** — and it is still, structurally, a North-Indian purnimant calendar. The full sweep across every state registers **141 further candidate observances** across 22 lenses (Appendix A) plus **8 universal gaps** that belong to no lens at all (Appendix C) — **149**.

Some absences are large by any measure: **Rath Yatra**, **Onam**, **Kali Puja**, **Vat Purnima**, **Radhashtami**, **Ratha Saptami**, **Bathukamma**, **Sarhul**, **Cheti Chand**, **Herath**, and the entire **Jain** calendar past Mahavir Jayanti.

Adding all 149 to the universal catalog would take a typical Bhadrapada day from ~4 observances to ~14, most of which no single household keeps. That is the actual product problem this PRD exists to solve, and it is why W1 stopped at 17.

### 1.4 The coverage map

Where the catalog stands per region after W1 — the honest starting point for the sequencing in §7.

| Region | Served today | Gap |
|---|---|---|
| Hindi belt (UP, MP, Delhi) | The whole default catalog is essentially this calendar | Braj/Kashi specifics, Rangpanchami, Radhashtami, Gopashtami |
| Rajasthan | **Good after W1** (10 rules) | Melas, the Gangaur and Ramdevra arcs |
| Bihar / Mithila | **Good after W1** (4 rules) | Jur Sital, Bihula-Bishahari, the Chhath and Madhushravani arcs |
| Maharashtra, Gujarat, Bengal, Odisha, Telugu, Karnataka | Only what overlaps the pan-Hindu calendar | 49 observances; the biggest single block of missing users |
| Tamil, Kerala | **Almost nothing** — the two `nakshatra` rules that exist resolve nowhere | 15 observances + two engine solvers |
| Uttarakhand, Himachal, Kashmir, Goa, Sindhi | **Nothing** | 23 observances, heavy sankranti and local-calendar work |
| Jharkhand, Chhattisgarh, Assam & NE | **Nothing** | 17 observances |
| Jain | Mahavir Jayanti only, since W1 | 11 observances + 4 arcs |

## 2. The bet

A devotional calendar earns trust by being **the household's** calendar, not a national average. The bet is that we can go deep on twenty-two traditions **without** making the Panchang tab unreadable for anyone, because the app already knows the one fact that predicts almost all of it: the city the user chose in the very first session.

Success looks like a Maithil family seeing Sama Chakeva and Jur Sital where they expect them; a Jain family seeing Paryushana as an eight-day arc with Samvatsari at its close; a Kashmiri Pandit family seeing Herath on Trayodashi; a Malayali family seeing Onam; and a user in Ujjain seeing exactly what they see today.

## 3. Product principles — the stance guards

1. **No identity question, ever.** Not at onboarding, not in settings, not as a "personalise your calendar" card. The lens is seeded from the city and is a plain list of calendars with checkboxes.
2. **A lens adds; it never subtracts.** A Jain household still sees Janmashtami. (Open decision 2 records why we considered otherwise and rejected it.)
3. **Search is lens-blind.** `searchObservances` always searches the whole catalog. A user must never be unable to *find* a festival because a checkbox is off — only unable to see it uninvited on a day.
4. **Both readings, both named.** Śvetāmbara Paryushana and Digambara Das Lakshan are two observances that abut, not variants of one. Kashmiri Herath (Phalguna K13) and the shipped Mahashivratri (Phalguna K14) are two days, not a bug. Maharashtra's Vat Purnima and Bihar's Vat Savitri Amavasya are two observances with one story.
5. **Sources or silence (§11.1).** Two independent published sources per rule, or the rule does not ship. A mela date that three sources disagree about stays out — Appendix B is the register of exactly that.
6. **A folk deity is a deity** (locked decision ⑦).
7. **No score, no ranking, no "your festivals".** A lensed day renders identically to a universal day. There is no "for you" badge and no personalisation language.
8. **A regional *name* for a day that already ships is an alias, not a rule.** Ugadi, Gudi Padwa, Navreh, Cheti Chand and Sanvsar Padvo are all Chaitra Shukla Pratipada. One tithi, one rule, many `searchTerms` — plus, where the *observance* genuinely differs (Cheti Chand honours Jhulelal; Gudi Padwa raises a gudi), a lensed rule that says so. Duplicating a rule duplicates the day.

## 4. Architecture — the lens

### 4.1 Data model (`panchang/types.ts`, `festivals.ts`)

```ts
export type ObservanceLens =
  // By region — 20
  | 'rajasthan' | 'braj-awadh-kashi' | 'bundelkhand-malwa' | 'punjab-haryana'
  | 'uttarakhand' | 'himachal' | 'kashmir'
  | 'bihar-mithila' | 'jharkhand' | 'chhattisgarh' | 'bengal' | 'odisha' | 'assam-northeast'
  | 'gujarat' | 'maharashtra' | 'goa-konkan'
  | 'karnataka' | 'telugu' | 'tamil' | 'kerala'
  // By tradition — 2
  | 'jain' | 'sindhi';

export type ObservanceRule = {
  // …
  /** Absent ⇒ UNIVERSAL: shown to everyone, exactly as today. */
  lens?: ObservanceLens[];
};
```

Five rules about the field, all test-pinned:

- **`lens` is additive metadata on rules that would otherwise not ship at all.** It is **not** a retagging of wave 1. Gangaur, Chhath and Goga Navami stay universal: they are kept by tens of millions, their `shortDescription*` already names the region, and demoting them behind a switch would take away exactly what the report asked for.
- **A rule gets a lens only when showing it to everyone is genuinely noise** — Navpad Oli, Dhalo, Khetsimavas, Champa Shashthi, Attukal Pongala.
- **A rule may carry more than one lens.** Rath Yatra is `['odisha', 'bengal']`; Vasubaras is `['maharashtra', 'gujarat']`; Pola is `['maharashtra', 'chhattisgarh']`. The array is the point — a shared observance is one rule, never two.
- **`visibility: 'regional'` is retired** in the same change. Its two occupants become `default` + a lens and get real rule types (§5.3). Leaving the value in the union with no occupants is how it grows a third occupant next year.
- **The lens taxonomy is a calendar taxonomy, not a political map.** `braj-awadh-kashi` rather than "Uttar Pradesh" because the UP calendar that differs from the default *is* Braj and Kashi; `telugu` rather than two states because Bathukamma and Bonalu are Telangana's and Atla Tadde is both. Naming it after the calendar keeps us out of arguments the app has no business in.

### 4.2 The preference, and seeding without asking

`@vedansh:panchang-lenses` — a `Set<ObservanceLens>` serialised as a sorted comma list, read in the **same `multiGet`** as location and calendar system (`panchangPrefs.ts`). Empty set = today's behaviour, byte for byte.

`panchangPrefs.ts`'s header documents why that file exists — the launch path may not grow a serial round trip — so the lens read joins the existing batch and adds **zero** round trips. Its launch-path isolation rules are inherited unchanged: no `expo-*`, no React, and the 700 KB pincode table stays behind its lazy require.

**Seeding is silent and post-launch.** The user already chose a city. On the first Panchang entry after the update, *after interactions settle*:

- a bundled-city id → its `stateCode` (new field, W2-3) → `STATE_LENS[stateCode]`;
- a `pin-` id → the pincode table already carries `stateEn`/`stateHi`, and that table is loaded lazily here anyway;
- Ujjain, the default nobody chose → **no seed**. A default is not a signal.

`STATE_LENS` is a plain map with three deliberate holes: **Delhi/NCR and Chandigarh seed nothing** (they are the default calendar plus everyone else's), and **`jain` and `sindhi` never auto-seed from anything** — they are not places, and inferring either from a postcode is exactly the profiling this PRD refuses. They are only ever a deliberate tap.

The user sees one dismissible line above the day panel — *"जयपुर के अनुसार क्षेत्रीय पर्व जोड़े गए हैं · बदलें"* / *"Regional festivals for Jaipur were added · Change"* — never a modal, never an onboarding step. **The copy names the chosen city as the provenance of the suggestion, never the person's identity** (decided 2026-09-06 with the prototype).

### 4.3 The read path and the precomputed table

The filter runs at **read**, not at scan:

- `resolveObservancesForYearLive` and `gen-precomputed-observances.mts` scan **every** rule, lensed included. `festivalEngine`'s module-scope `defaultRules` must widen or the generator silently drops them — the single most likely bug in this wave, and it fails open (missing dates, green tests), so it gets its own test.
- `resolveObservancesForYear` applies the active lens set after the table read, before the per-year memo. **The memo key must include the lens set**, or turning a lens on mid-session serves the pre-filter list.
- `getObservancesForDateKey` reads the raw table directly (the widget/notification path) and needs the same filter applied at its own call site.
- `searchObservances` and `getRuleById` ignore lenses entirely (principle 3).

**Table growth.** 4,482 rows today → ≈13k at the full 149. Measure the bundle delta in the W2 PR and again at W4. If it matters, split the lensed years into a lazily-required sibling module keyed the same way — **do not** answer a size problem by dropping the precompute and scanning live on a render path; that scan is precisely what the precomputed table exists to prevent (wiki `[[panchang]]`, the "Panchang screen froze" incident).

### 4.4 What must not be lensed

- **`dayAnga.ts`'s notification-title picker keeps its universal-only gate.** It already filters to `visibility === 'default'`; it must additionally exclude any rule carrying a `lens`, regardless of the user's set, until the scheduler can read the preference. A lensed observance titling a stranger's lock screen is the worst failure mode this feature has.
- **The widget snapshot** (`planPayload.ts`) takes the filtered list, but the 14-day payload is written by a background coordinator that may run before the preference hydrates — it must read the lens set through the same store, never a default.
- **`festiveReminders.ts`** does not change at all (RULEBOOK §23a.9).

### 4.5 Surfaces

Everything downstream of `resolveObservancesForYear` needs no change: the day panel, the month grid's `पर्व`/`व्रत` tags, आगामी, the Vrat & Parv catalog counts, Observance List, the Home Today strip, the ask engine's date intents. Four surfaces do change:

| Surface | Change |
|---|---|
| व्रत-पर्व ledger (`PanchangScreen.tsx`) | A **`क्षेत्र · Calendars`** ledger row, third after मेरा व्रत · पितृ स्मरण — the same card anatomy (icon · title · one-line state · chevron) → the lens sheet. The subtitle names the active lenses (*तेलुगु सक्रिय · और 21 उपलब्ध*), so the row itself documents the seeding. **Pattern E, decided 2026-09-06**; replaces the header chip, because the ledger is this page's existing vocabulary for persistent personal calendar state and the chip row is already full. |
| **Lens sheet** (new, `LensPickerSheet.tsx`) | The `LocationPickerModal` shell — a `FlatList`, two group headers (`राज्य · By region`, `सम्प्रदाय · By tradition`), 22 rows: name + a one-line example (*"गणगौर, गोगा नवमी, तेजा दशमी"*) + a checkmark. No search at 22 rows, no "select all" (it would make the tab unreadable in one tap). |
| Observance Detail (`ObservanceDetailScreen.tsx`) | A quiet lens caption under the deity line — `राजस्थान · Rajasthan`, or two when a rule carries two — so a user can always see *why* a day is on their calendar. Absent on universal rules. |
| Seed notice (`PanchangScreen.tsx`) | The one dismissible line of §4.2 on the **पंचांग day view** — where the new dates actually appear — deep-linking to the lens sheet; persisted at `@vedansh:panchang-lens-seen`. It is the bridge for the one gap pattern E leaves: the entry row lives on the व्रत-पर्व segment, the new dates show up on the other one. |

## 5. Engine work these waves depend on

Six items. Each is independently shippable, and each gates named content.

### 5.1 `dayRule: 'pradosh'` — gates Bachh Baras, Vasubaras, Vagh Baras, Dhanteras, Diwali

The three-part job RULEBOOK §23.7 names: the enum value; a `tithiAtPradosh` instant solver in `engine.ts` (the pradosh window opens at sunset — gate it on the expected tithi index exactly like `tithiAtMoonrise` / `tithiAtMadhyahna`, so a year scan pays ~50 solves and not 365 per rule); and published-date tests across several years. It reuses `matchesInstantVyapiniRuleOnDate` unchanged.

It closes the `bachh-baras` shift W1 shipped knowingly (§14). **It must not retag `dhanteras` and `diwali` in the same PR as any content wave** — those two move the single most-viewed date in the app and deserve a change whose entire diff is that decision.

### 5.2 `ruleType: 'solar-offset'` — gates 9 observances across 7 lenses

A solar ingress plus a fixed civil-day offset: `{ solarLongitude, solarDayOffset: number }`. `findSolarFestivalDate` already memoises the ingress day per rule per year; the offset applies to its result.

| Observance | Rule | Lens |
|---|---|---|
| जुड़ शीतल | Mesha + 1 | `bihar-mithila` |
| लोहड़ी · लाल लोई | Makar − 1 | `punjab-haryana`, `sindhi` |
| भोगी | Makar − 1 | `telugu` |
| कनुमा · मुक्कनुमा | Makar + 1, + 2 | `telugu` |
| पहिली राजा · बासि राजा | Mithuna − 1, + 1 | `odisha` |
| गरिया पूजा | Mesha + 7 | `assam-northeast` |
| आदि पेरुक्कु | Karka + 17 | `tamil` |

### 5.3 Nakshatra rule types — gates `tamil`, `kerala`, `assam-northeast`, and the Jain Rohini Vrat

`ruleType: 'nakshatra'` is in the type union and **nothing resolves it** — `karthigai-vrat` and `rohini-vrat` are `catalog-only` in practice. Two solvers, and they are different problems:

- **(a) `nakshatra-in-lunar-month`** — Krittika in Kartika (Karthigai Deepam), Rohini each lunar month (the Jain Rohini Vrat, ~12–13 a year). Straightforward: the per-day nakshatra is already solved next to `computeTithiAndMonth`.
- **(b) `nakshatra-in-solar-month`** — Thiruvonam in Simha (Onam), Pushya in Makara (Thai Pusam), Uttara Phalguni in Meena (Panguni Uthiram), Pooram in Medam and in Kumbham (Thrissur Pooram, Attukal Pongala), Ardra in Mithuna (Ambubachi), Vishakha in Vrishabha (Vaikasi Visakam). This needs the **solar** month, which the engine derives only as sankranti instants today. Build a small `solarMonthForDate` helper over the cached ingress table rather than a second month engine.

(a) is cheap and unblocks W3. (b) is the largest single item in the PRD and gets its own PR and its own convention doc (`docs/roadmap/conventions/nakshatra-rules-v1.md`), because the vyapini question repeats here: Onam is the day Thiruvonam prevails at *sunrise*, Thai Pusam at *the nakshatra's own peak* in some almanacs.

### 5.4 Per-rule month system — gates Pola, Sama Chakeva, the Bengali and southern rules

`ObservanceRule.monthSystem` is declared on the type and plumbed through `createRule`, and then **no rule sets it and no matcher reads it** — `monthForRuleInSystem` shifts every krishna-paksha rule by the user's toggle with no per-rule escape. Several regional rules are reckoned in a fixed system whatever the user chose (Mithila is purnimant; the Bengali and southern reckonings are amanta).

The clean worked example is **Pola**: Maharashtra calls it Shravana Amavasya (amanta) and Chhattisgarh calls it Bhadrapada Amavasya (purnimant), and it is **one day**. One rule, one `monthSystem`, two names in the description — never two rules.

Wire the matcher to honour an explicit `monthSystem: 'purnimant' | 'amanta'`, keep `'both'` meaning today's behaviour, and audit every existing rule for whether it needs one (Open decision 3). Like `lens`, a field that exists and is never read is a field that will be set wrongly the first time someone reaches for it.

### 5.5 `weekday-in-lunar-month` already exists and is under-used

`sawan-somwar-vrat` and `mangala-gauri-vrat` prove the rule type works. Four registered candidates need nothing more than a new rule: **बोनालु** (Sundays in Ashadha, `telugu`), **मणबसा गुरुबार** (Thursdays in Margashirsha, `odisha`), **खुदुरुकुनी ओषा** (Sundays in Bhadrapada, `odisha`), **बड़ा मंगल** (Tuesdays in Jyeshtha, `braj-awadh-kashi`). Free content.

What it does **not** cover is a weekday × *solar* month (Himachal's Minjar Mela is the second Sunday of Shravana solar), or a weekday × tithi (**सोमवती अमावस्या**, an Amavasya that falls on a Monday — pan-Hindu, genuinely missing, and needing a `tithi-on-weekday` variant). Both are small; neither exists.

### 5.6 Regional arcs reuse PRD-28, and add nothing

Thirty-four of the registered candidates are **arcs**, not days. `ARC_DEFINITIONS` in `panchang/arcs.ts` already models an observance seen across days with a sthapana and a close, an occurrence-scoped user choice and a reminder that rides the vrat family. Adding them means adding definitions — never a second multi-day mechanism, and never a fabricated rule to make a strip look complete (RULEBOOK §26.6).

Two need a shape the existing definitions do not have: **Bastar Dussehra** runs ~75 days (Shravana Amavasya → Ashvina S13) and **Chandan Yatra** 21 days, both far past `maxSpanDays`. Either widen the cap or model them as a named range — decide when the first one is built, not now.

Only Ganesh Utsav has a *family-chosen* duration. Every arc below has a fixed close, so they take the Navratri/Diwali shape and inherit no chooser.

## 6. Content depth — what each new observance actually gets

A rule is the floor, not the deliverable. Each observance is graded, and the grade is declared in the wave's PR:

| Tier | What ships | Applies to |
|---|---|---|
| **T1 — dated** | Rule + bilingual `shortDescription*` + `searchTerms` + `deityHi/En` | Every observance. The W1 bar. |
| **T2 — + food** | `bhogId` → a verified `BhogContentEntry` (RULEBOOK §21) | Every `vrat`/`upavas` rule — **enforced**, `bhogContent.test.ts` fails otherwise |
| **T3 — + fast** | `upvasId` → a verified `UpvasInfoEntry` (§20) | Observances whose defining act is a fast: Paryushana, Samvatsari, Chaiti Chhath, Vat Purnima, Chaliho, Savitri Amavasya |
| **T4 — + story** | `kathaId` → a bilingual `KathaContentEntry` | Observances with a household katha: Sama Chakeva, Bihula-Bishahari, Nuakhai, Jhulelal, Goga, Tejaji, Ramdevji, Atla Tadde |
| **T5 — + procedure** | `vidhiId` → a `VidhiEntry`, verified-or-invisible (§19/§26) | Only where a published, instruction-level sequence exists. Expect **very few**. |

**T5 is where this PRD is most likely to overreach.** §11.3 forbids generated liturgy, §26.2 makes a draft vidhi invisible in code, and regional puja sequences are exactly the material for which two concordant published sources are hardest to find. Plan every wave to be shippable at T1–T2 and treat T4/T5 as follow-ons.

## 7. Phasing

Sequenced by **how many users a lens serves**, not by how interesting the content is. W2 is the only hard prerequisite; after it, waves are independent and can be reordered or run in parallel by different sessions.

| Wave | What ships | Count | Gated by | Size |
|---|---|---|---|---|
| **W1** ✅ | Rajasthan, Bihar/Mithila, 3 pan-Hindu + RULEBOOK §23a | 17 | — | S |
| **W2** | The lens: field, preference, seeding, filter, ledger row, sheet, caption. **Zero date-bearing lensed rules** — the two former `regional` orphans convert to lenses but stay unresolved until their solver waves, so the mechanism ships as a visible no-op | 0 | — | M |
| **W3** | `jain` — 11 new observances + the Rohini Vrat repair; four fixed arc families | 12 | W2, E-3a | M |
| **W4** | The big five: `maharashtra`, `gujarat`, `bengal`, `odisha`, `telugu` | 44 | W2, E-1, E-2, E-4, E-7 | L |
| **W5** | The Hindi belt + east: `braj-awadh-kashi`, `karnataka`, `chhattisgarh`, `bundelkhand-malwa`, `jharkhand`, `punjab-haryana` | 27 | W2, E-2, E-4, E-7 | L |
| **W6** | The nakshatra lenses: `tamil`, `kerala`, `assam-northeast` | 23 | W2, E-2, E-3b | M code + L content |
| **W7** | The Himalaya + diaspora set: `uttarakhand`, `himachal`, `kashmir`, `goa-konkan`, `sindhi` | 23 | W2, E-2, E-6, E-7 | L |
| **W8** | Rajasthan/Bihar depth — the mela and Chhath arcs + the Appendix B re-verification pass | 12 | W2, E-2, E-7 | M |
| **any** | Appendix C — 8 universal gaps that belong to no lens. Ship whenever; each is independent | 8 | §5.1 for one | S each |

W2 is deliberately a no-op release. Shipping the mechanism separately from the first content that uses it is what lets the filter, the seeding and the widget/notification gates be verified against a calendar whose dates nobody's household depends on yet.

**Appendix C should not wait for W8.** Radhashtami, Gopashtami and Ratha Saptami are missing for *everyone*, need no mechanism, and are one afternoon each.

## 8. Metrics — bundle-only, as always

There is no analytics SaaS and no backend (roadmap README, *Constraint*). Three honest instruments:

1. **Build-time coverage**, printed by an extended `verify:observances`: per lens, the number of days in a calendar year carrying ≥1 observance and the number of distinct observances. Targets at programme end — Rajasthan 40+, Bihar/Mithila 30+, Jain 25+, each of the big five 20+, every other lens 12+.
2. **Universal-day load**, the counter-metric that keeps this feature honest: the mean observances per day with **no lens on** must not move from its W1 value (±0, Appendix C excepted and stated explicitly). A regression here means something was tagged universal that should have been lensed.
3. **The ask engine's unanswered log** (PRD-41 §7.2, on-device, user-shared) is the only field signal we get. A named festival that shows up there repeatedly is the next wave's input — the same loop `aliases.ts` already grows on.

## 9. The complete build inventory

Everything this PRD will build. **N** = new file, **M** = modified.

### 9.0 Engine work (each independently shippable; gates the waves named in §5)

| # | Item | Files |
|---|---|---|
| E-1 | `dayRule: 'pradosh'` + `tithiAtPradosh` (§5.1) | M `panchang/types.ts`, `panchang/engine.ts`, `panchang/festivalEngine.ts`, N `panchang/__tests__/pradoshDayRule.test.ts` |
| E-2 | `ruleType: 'solar-offset'` (§5.2) | M `panchang/types.ts`, `panchang/festivalEngine.ts` |
| E-3a | `nakshatra-in-lunar-month` solver (§5.3a) | M `panchang/engine.ts`, `panchang/festivalEngine.ts` |
| E-3b | `solarMonthForDate` + `nakshatra-in-solar-month` (§5.3b) | M `panchang/engine.ts`, `panchang/festivalEngine.ts`, N `docs/roadmap/conventions/nakshatra-rules-v1.md`, N `panchang/__tests__/nakshatraRules.test.ts` |
| E-4 | Per-rule `monthSystem` honoured + audit of every existing rule (§5.4) | M `panchang/festivalEngine.ts`, M `panchang/festivals.ts` |
| E-5 | `tithi-on-weekday` rule type — Somvati Amavasya (§5.5) | M `panchang/types.ts`, `panchang/festivalEngine.ts` |
| E-6 | Weekday × **solar** month — Minjar Mela only; skip if E-3b's `solarMonthForDate` makes it a two-line addition | M `panchang/festivalEngine.ts` |
| E-7 | Arc `maxSpanDays` widened, or a named-range arc shape, for Bastar Dussehra (75 d) and Chandan Yatra (21 d) (§5.6) | M `panchang/arcs.ts` |

### 9.1 W2 — the lens mechanism

| # | Item | Files |
|---|---|---|
| W2-1 | `ObservanceLens` (22 values) + `lens?: ObservanceLens[]` on `ObservanceRule`; retire `visibility: 'regional'` | M `panchang/types.ts` |
| W2-2 | `getObservanceCatalog({ lenses })`; convert `karthigai-vrat` + `rohini-vrat` off `regional` | M `panchang/festivals.ts` |
| W2-3 | `stateCode?: StateCode` on `City`; tag the 52 major cities; Rajasthan tehsils tagged at generation; `STATE_LENS` map with its three deliberate holes | M `panchang/locations.ts`, `panchang/rajasthanTehsils.ts`, N `panchang/lenses.ts` |
| W2-4 | Lens preference in the launch `multiGet`; store + hydration + `useLenses()` | M `panchang/panchangPrefs.ts`, M `panchang/panchangLaunchPrefetch.ts` |
| W2-5 | Lens filter at the read path; **lens set in the memo key** | M `panchang/festivalEngine.ts` |
| W2-6 | Widen the live scan + generator to all rules | M `panchang/festivalEngine.ts`, M `scripts/gen-precomputed-observances.mts` |
| W2-7 | Regenerate the table; `CACHE_VERSION` 4→5; **measure and record the bundle delta** | M `panchang/precomputedObservances.ts`, M `panchang/observanceCache.ts` |
| W2-8 | Seeding from city/pincode after interactions; `@vedansh:panchang-lens-seen` | N `panchang/lensSeeding.ts` |
| W2-9 | The lens sheet — 22 rows, two group headers, an example line each | N `components/LensPickerSheet.tsx` |
| W2-10 | क्षेत्र ledger row on the व्रत-पर्व segment + the dismissible seed line on the पंचांग day view (**pattern E**, decided 2026-09-06) | M `screens/PanchangScreen.tsx` |
| W2-11 | Lens caption on the detail hero (one or two) | M `screens/ObservanceDetailScreen.tsx`, M `components/ObservanceDetailHero.tsx` |
| W2-12 | Notification-title gate: exclude any lensed rule | M `notifications/dayAnga.ts`, M `notifications/dayAngaResolver.ts` |
| W2-13 | Widget payload reads the lens set through the store, never a default | M `widgets/planPayload.ts` |
| W2-14 | Catalog counts + list respect lenses; search does not | M `panchang/vratCatalog.ts`, M `screens/ObservanceListScreen.tsx` |
| W2-15 | Lens names + examples in the ask lexicon so *"राजस्थान के पर्व"* / *"jain calendar"* resolves | M `ask/lexicon.ts`, M `ask/aliases.ts`, M `ask/__tests__/corpus.ts` |
| W2-16 | **A lint for the §1.2 defect class** — fail the build on any `hidden()` rule whose seed carries `lunarMonth` + `tithi` (`ashoka-ashtami`, `jayaparvati-vrat` are the two live cases) | M `panchang/__tests__/observances.test.ts` |
| W2-17 | **Tests** — filter on/off across day · month · upcoming · catalog · widget · notification; memo-key correctness; the through-the-precomputed-table test for R1; seeding table incl. the three holes; launch-path round-trip count; `regional` fully retired | N `panchang/__tests__/lens.test.ts`, N `components/__tests__/LensPickerSheet.test.tsx`, M `observances.test.ts`, M `notifications/__tests__/*`, M `widgets/__tests__/planPayload.test.ts` |
| W2-18 | **e2e** — turn a lens on, see a day gain an observance, turn it off, see it go | N `.maestro/lens-smoke.yaml` |
| W2-19 | **Docs** — design.md §33 lens block + a §72 for the sheet; RULEBOOK §23a.5 rewritten now that `regional` means something; wiki `[[panchang]]` | M `design.md`, M `RULEBOOK.md`, M `wiki/subsystems/panchang.md`, M `wiki/log.md` |

### 9.2 W3 — `jain` (12)

| # | Item | Files |
|---|---|---|
| W3-1 | 11 rules (Appendix A.1), two sources each in-comment | M `panchang/festivals.ts` |
| W3-2 | `rohini-vrat` → a real monthly nakshatra rule (needs E-3a) | M `panchang/festivals.ts` |
| W3-3 | Four fixed arc families: `paryushana` (Śvetāmbara, 8 d → Samvatsari), `das-lakshan` (Digambara, 10 d → Anant Chaturdashi), `navpad-oli` (twice yearly), `ashtahnika` (three times yearly) | M `panchang/arcs.ts` |
| W3-4 | Sibling-day pins: Mahavir Nirvana ≡ `diwali`, Veer Nirvana Samvat ≡ `govardhan-puja`, Maun Ekadashi ≡ `mokshada-ekadashi`, Das Lakshan close ≡ `anant-chaturdashi` | M `panchang/festivals.ts` |
| W3-5 | T2 bhog: `jain-parva-bhog`, and the Ayambil/Paryushana fast's own | M `panchang/bhogContentExtended.ts` |
| W3-6 | T3 upvas: Paryushana, Samvatsari, Ayambil — fast type, window, parana | N `panchang/upvasContent/entries/*.ts`, M `panchang/upvasContent/index.ts` |
| W3-7 | Deity registry: Bhagwan Mahavir + Parshvanath **only if** §11.8's background-image obligation is met first — never a deity without one | M `data/deities.ts`, `data/backgrounds.ts`, `components/deityGlyphs/` |
| W3-8 | **Tests** — published dates, arc occurrences, sibling days, both lineages distinct and separately named | M `observanceDates.test.ts`, `arcs.test.ts`, `upvasContent.test.ts`, `bhogContent.test.ts` |

### 9.3 W4 — the big five (44)

| # | Item | Files |
|---|---|---|
| W4-1 | E-1, E-2, E-4, E-5 land first (Vasubaras/Vagh Baras need pradosh; Bhogi/Kanuma need solar-offset; Pola needs monthSystem; Bonalu/Itu/Manabasa need nothing new) | see 9.0 |
| W4-2 | 44 rules across `maharashtra` (9), `gujarat` (7), `bengal` (6), `odisha` (14), `telugu` (8) — Appendix A.2–A.6 | M `panchang/festivals.ts` |
| W4-3 | Shared-lens rules carry arrays: Rath Yatra `['odisha','bengal']`, Vasubaras `['maharashtra','gujarat']`, Nuakhai `['odisha','chhattisgarh']`, Champa/Subrahmanya Shashthi `['maharashtra','karnataka','goa-konkan']` | M `panchang/festivals.ts` |
| W4-4 | Six arcs: Gauri Avahan–Visarjan, Champa Shashthi, Dashama Vrat, Bathukamma, Raja Parba, Chandan Yatra (needs E-7) — plus **lens-scoped Maharashtra day labels on the existing `ganesh-utsav` arc**, which is a label change, not a new arc | M `panchang/arcs.ts` |
| W4-5 | T2 bhog — ~10 new profiles (Vat Purnima, Kali Puja, Jagaddhatri, Savitri Amavasya, Nuakhai, Kumar Purnima, Prathamastami, Shitala Satam, Jayaparvati, Nagula Chavithi, Atla Tadde) | M `panchang/bhogContentExtended.ts` |
| W4-6 | T3 upvas — Vat Purnima, Savitri Amavasya, Dashama Vrat | N `panchang/upvasContent/entries/*.ts` |
| W4-7 | T4 katha — Nuakhai, Atla Tadde, Bathukamma | N `panchang/kathaContent/entries/*.ts`, M `kathaContent/index.ts`, M `festivals.ts` KATHA_CATALOG |
| W4-8 | Regenerate + `CACHE_VERSION` 5→6; diff by rule id | M `precomputedObservances.ts`, `observanceCache.ts` |
| W4-9 | **Docs** — VERIFICATION.md Class B shrinks (`bachh-baras` leaves it once E-1 lands) | M `src/panchang/VERIFICATION.md`, M `design.md` |

### 9.4 W5 — Hindi belt + east (27)

| # | Item | Files |
|---|---|---|
| W5-1 | 27 rules across `braj-awadh-kashi` (7), `karnataka` (5), `chhattisgarh` (5), `bundelkhand-malwa` (4), `jharkhand` (4), `punjab-haryana` (2) — Appendix A.7–A.12 | M `panchang/festivals.ts` |
| W5-2 | Five arcs: Lathmar/Braj Holi, Jhulan Yatra, Sarhul, Bhojli, Sanjhi; **Bastar Dussehra** needs E-7 | M `panchang/arcs.ts` |
| W5-3 | Two weekday-in-lunar-month rules (Bada Mangal, and Karnataka's Kartika Somavara if it clears §11.1) | M `panchang/festivals.ts` |
| W5-4 | T4 katha — Karma, Sarhul | N `panchang/kathaContent/entries/*.ts` |
| W5-5 | Resolve the **Hareli / Pola amavasya** question (§5.4) before either ships — one day or two, decided against sources, not guessed | M `panchang/festivals.ts` |

### 9.5 W6 — the nakshatra lenses (23)

| # | Item | Files |
|---|---|---|
| W6-1 | E-3b + its convention doc land first | see 9.0 |
| W6-2 | 23 rules across `tamil` (8), `kerala` (7), `assam-northeast` (8) — Appendix A.13–A.15 | M `panchang/festivals.ts` |
| W6-3 | Three arcs: Onam (Atham → Thiruvonam), Mandala Pooja → Makaravilakku (41 d), Yaoshang (5 d), Ambubachi (4 d) | M `panchang/arcs.ts` |
| W6-4 | `karthigai-vrat` becomes a real Krittika-in-Kartika rule (the §1.2 trapdoor's last occupant) | M `panchang/festivals.ts` |
| W6-5 | Decide the `PANCHANG_DAY_CACHE_VERSION` question explicitly if `solarMonthForDate` enters `DayInputs` | M `panchang/panchangDaySerde.ts` |
| W6-6 | T2/T3 — Onam sadya, Karkidaka Vavu, Thai Pusam, Attukal Pongala, Avani Avittam | M `panchang/bhogContentExtended.ts`, N `upvasContent/entries/*.ts` |

### 9.6 W7 — Himalaya + diaspora (23)

| # | Item | Files |
|---|---|---|
| W7-1 | 23 rules across `kashmir` (8), `uttarakhand` (5), `himachal` (4), `goa-konkan` (3), `sindhi` (3) — Appendix A.16–A.20 | M `panchang/festivals.ts` |
| W7-2 | **Herath** is the wave's hard case — Phalguna **Krishna Trayodashi**, a *second* rule beside the shipped Chaturdashi Mahashivratri, never a move (locked decision ⑥). Its own two-source pass and its own test | M `panchang/festivals.ts`, M `observanceDates.test.ts` |
| W7-3 | Four arcs: Shigmo, Dhalo, Chaliho Sahib (40 d), Kullu Dussehra, Mandi Shivratri | M `panchang/arcs.ts` |
| W7-4 | Plain **sankranti-day** rules (no offset needed, the existing `solar-sankranti` type covers them): Harela (Karka), Ghee Sankranti (Simha), Sair (Kanya), Phool Dei (Meena **or** Mesha — W7-6). Only लाल लोई needs E-2, and it is one rule with Punjab's लोहड़ी | M `panchang/festivals.ts` |
| W7-5 | T4 katha — Jhulelal (the Cheti Chand story), Kheer Bhawani | N `panchang/kathaContent/entries/*.ts` |
| W7-6 | Resolve **Phool Dei** (Meena vs Mesha Sankranti) and **Cheiraoba** (Chaitra S1 vs Mesha) against sources; both are ±1 month, not ±1 day | — |

### 9.7 W8 — Rajasthan / Bihar depth (12)

| # | Item | Files |
|---|---|---|
| W8-1 | **Six** regional arcs: Gangaur 18 d, Ramdevra Bhadva S2→S11, **Chaiti Chhath** and **Kartik Chhath** four days each (Nahay-Khay · Kharna · Sandhya Arghya · Usha Arghya — the highest-value arc in the whole PRD), Madhushravani fortnight, Sama Chakeva nine days | M `panchang/arcs.ts` |
| W8-2 | जुड़ शीतल via E-2 | M `panchang/festivals.ts` |
| W8-3 | Appendix B re-verification: Dhinga Gavar, Khatu Shyam Phalgun Mela, Kaila Devi, Salasar, Bihula-Bishahari, Bhagoria, Gadyachi Jatra, Halda/Phagli | M `panchang/festivals.ts` (only what clears §11.1) |
| W8-4 | T4 katha — Goga, Tejaji, Ramdevji: three of the most-told stories in Rajasthan, and the app has none of them | N `panchang/kathaContent/entries/*.ts` |

### 9.8 Appendix C — the universal gaps (8, any wave)

One rule each in `festivals.ts`, no lens, plus the usual test pins. Radhashtami, Gopashtami and Ratha Saptami are missing for *everyone*, need no mechanism, and are one afternoon each — do not let them wait for W8.

### 9.9 Cross-wave, every wave

Regenerate `precomputedObservances.ts` and diff by rule id · bump `CACHE_VERSION` · extend `verify-observances.mts` `ANNUAL` + `ANCHORS` · pin published dates in `observanceDates.test.ts` · sibling-day assertions · per-lens coverage counts (§8.1) · design.md §33 + this file + `wiki/subsystems/panchang.md` + `wiki/log.md` · one date-independent Maestro flow.

## 10. Non-goals

- **No Sikh Gurpurabs, and no Hola Mohalla.** The Nanakshahi calendar is a different reckoning, not a lens over this engine. Kartik Purnima ships as Kartik Purnima; if Guru Nanak Jayanti is ever added it is its own PRD with its own calendar.
- **No Islamic, Christian, Parsi, Buddhist or Bahá'í calendars.** Same reason. (Buddha Purnima ships because it is a Vaishakha Purnima tithi.)
- **No non-Hindu tribal calendars** — Ahom Me-Dam-Me-Phi, Naga Hornbill, Mizo Chapchar Kut, Meghalaya's Shad Suk Mynsiem, Ladakhi Losar. Several are fixed Gregorian dates and none is a panchang observance. Where a community's festival *is* tithi- or sankranti-reckoned (Sarhul, Karma, Garia, Kharchi, Bhagoria), it is in scope and gets the same treatment as everything else.
- **No multi-language UI.** A lens changes *which observances*, never the app's language. Regional-language names ride `searchTerms` and the existing hi/en/gu/kn scheme.
- **No per-observance toggles**, no "hide this festival", no favourites-as-filter.
- **No location-derived automatic behaviour beyond the one-time seed.** Travelling does not change anyone's calendar (Open decision 1).
- **No festive-reminder catalog change.** Ever, in this PRD.
- **No temple/mela ticketing, timings, live darshan or travel content.** A mela is named inside an observance's description; it is not a feature.
- **No 12-yearly or irregular observances** — Kumbh, Nanda Devi Raj Jat. They are not a recurrence rule.

## 11. Risks

| # | Risk | Mitigation |
|---|---|---|
| R1 | **The generator silently drops lensed rules** (`defaultRules` not widened). Fails open: tests green, dates missing. | A test that resolves a known lensed rule *through the precomputed table*, not the live scan. W2-17. |
| R2 | **A lensed observance titles a stranger's notification** — the worst failure mode here. | Two independent gates (`dayAnga` excludes any `lens`; the scheduler filters), each with its own test. W2-12. |
| R3 | **Bundle size.** ≈13k rows at the full 149. | Measured in W2 before any content lands and again at W4; lazy sibling module is the pre-agreed answer (§4.3). |
| R4 | **Content verification is the real cost, not code.** 149 observances × 2 sources × bilingual copy is the whole programme. | Tier the depth (§6). Ship T1–T2 and let T4/T5 follow. A wave that cannot clear §11.1 ships **fewer rules, never thinner sources**. |
| R5 | **Getting someone's festival wrong is worse than not having it.** A wrong Herath date or a Digambara/Śvetāmbara collapse is an insult, not a bug. | Principle 4; `variantNote` in every source block; §5.4's per-rule month system; native-reviewer sign-off named in each wave's PR, not just a URL pair. |
| R6 | **Seeding feels like profiling.** A user in Patna opens the app and sees "Bihar's festivals are showing". | One dismissible line, never a modal; the copy names the *city's state*, not the person; `jain` and `sindhi` never auto-seed; Open decision 4 tests the copy. |
| R7 | **Universal-day creep** — each wave quietly tags something universal because it feels famous. | Metric 2 in §8 is a hard gate: mean observances/day with no lens on must not move, Appendix C excepted and stated. |
| R8 | **Lens sprawl.** 22 lenses is already a long sheet; the next report will ask for a 23rd. | The taxonomy is **calendars, not administrative units** (§4.1). A new lens needs a calendar that genuinely differs, not a state that feels left out. |
| R9 | **E-3b leaks into `DayInputs`** and forces a `PANCHANG_DAY_CACHE_VERSION` bump nobody planned. | W6-5 makes it an explicit line item with an explicit decision. |
| R10 | **Waves stall halfway and the app ships a half-served lens** — Tamil users see Karthigai Deepam and nothing else. | A lens does not appear in the sheet until its wave lands. Coverage floor (§8.1, 12+ per lens) is a release gate, not a target. |

## 12. Verification & release gates

Per wave, on top of RULEBOOK §23a:

1. Two independent published sources per rule; the second in a code comment beside the published civil date used to pin it. A search-result snippet is not a source.
2. Published civil dates in `observanceDates.test.ts` for ≥1 year per rule, plus the once-a-year invariant 2024–2031.
3. A row in `verify-observances.mts` `ANNUAL` with the rule's **real** muhurta — including a muhurta the engine does not model, so the shift is reported every run rather than forgotten.
4. Sibling-day assertions for every rule sharing a tithi with a shipped rule.
5. Precomputed table regenerated and diffed **by rule id**: only new ids, **no existing date moved**. Stated in the PR.
6. `CACHE_VERSION` bumped.
7. `bhogContent.test.ts` count updated and every new `vrat`/`upavas` carrying a verified profile, hooked both directions.
8. Per-lens coverage counts printed and recorded (§8.1); the universal-day counter-metric unchanged (§8.2).
9. `npm test` green (typecheck + widgets + readers + engine + data + ask), `npm run lint` at 0 errors, `npm run verify:observances` with `wrong-month=0`.
10. One date-independent Maestro flow per wave; device run recorded, not assumed.
11. design.md §33 + this PRD + `wiki/subsystems/panchang.md` + `wiki/log.md` in the same PR.
12. **A named reviewer who keeps that calendar.** For W3 and W7 especially, two URLs are not enough — the PR names a person who observes these days and read the copy.

**W2 additionally:** lens-filter tests across all six consumers; the notification gate test; a launch-path test proving the preference adds no round trip; a test proving `visibility: 'regional'` has no occupants left; the W2-16 lint.

## 13. Open decisions

1. ~~**Does a seeded lens ever un-seed when the user changes city?**~~ **Decided 2026-09-06:** no. A lens is sticky once shown — a week in Chennai does not delete someone's Rajasthani calendar. A later city may offer its inactive matching calendar once, but adding it requires an explicit tap.
2. **Should a lens ever suppress a universal rule?** Proposal: **no** (principle 2). Recorded because it will be re-proposed.
3. **Which rules need a forced `monthSystem`?** Sama Chakeva and Madhushravani are Maithil-purnimant; the Bengali, Odia and southern entries are amanta-reckoned; Hareli/Pola is the worked case. Needs a per-rule audit before W4, including a re-check of the seventeen W1 rules.
4. ~~**The seed copy.**~~ **Decided 2026-09-06:** name the chosen city as provenance, not the person's identity — *"जयपुर के अनुसार क्षेत्रीय पर्व जोड़े गए हैं · बदलें"* / *"Regional festivals for Jaipur were added · Change"*.
5. ~~Does the lens sheet belong in Panchang's header or in More?~~ **Decided 2026-09-06 (prototype sign-off):** neither — a **क्षेत्र ledger row** on the व्रत-पर्व segment (pattern E in the interactive PRD), because the ledger is that page's existing vocabulary for persistent personal calendar state and the header chip row is already full (location · calendar-system · ★). The seed line on the पंचांग day view bridges discovery.
6. **Onam's vyapini rule** — sunrise-prevailing Thiruvonam, or the nakshatra's peak? Sources differ. Blocks W6; belongs in the convention doc, not in a rule.
9. **Does the क्षेत्र ledger row appear at all when no lens is on?** Pattern E puts it third in a ledger that is otherwise personal state the user created. Proposal: yes, always — it is the only discovery path for a user whose city seeded nothing (Ujjain, Delhi), and its subtitle then reads *कोई क्षेत्रीय पंचांग नहीं · 22 उपलब्ध*.
7. **Is Rangpanchami universal or `bundelkhand-malwa`?** It is huge in Indore and unknown in most of the country. Cross-listed in A.9 and Appendix C; decide in whichever wave reaches it.
8. **Ugadi / Gudi Padwa / Cheti Chand / Navreh / Sanvsar Padvo** are one tithi and five observances. W1 folded them into `chaitra-navratri-start`'s description. Do they each become a lensed rule (five rows on one day for a user with five lenses on), or stay aliases? Proposal: a lensed rule **only where the observance genuinely differs** — Cheti Chand honours Jhulelal, Gudi Padwa raises a gudi, Navreh sets the thaal. Sanvsar Padvo stays an alias.

## 14. Build record — Wave 1 (2026-09-06)

**Shipped:** 17 observances, data only, no new mechanism, all universal.

- **Rajasthan (10):** गोगा नवमी (Bhadrapada K9) · रामदेव जयंती (Bhadrapada S2) · तेजा दशमी (Bhadrapada S10) · बछ बारस (Bhadrapada K12)* · गणगौर (Chaitra S3)* · शीतला सप्तमी (Chaitra K7)* · शीतला अष्टमी·बसोड़ा (Chaitra K8) · दशा माता व्रत (Chaitra K10) · सकट चौथ (Magha K4, `chandrodaya`)* · आशा दशमी (Ashadha S10)*
- **Bihar / Mithila (4):** चैती छठ (Chaitra S6) · मधुश्रावणी (Shravana S3) · सामा-चकेवा (Kartika S7) · चित्रगुप्त पूजा (Kartika S2)
- **Pan-Hindu gaps the same audit surfaced (3):** कार्तिक पूर्णिमा (Kartika S15) · चैत्र नवरात्रि प्रारंभ (Chaitra S1) · महावीर जयंती (Chaitra S13)

`*` = promoted from a `catalog-only` rule that already shipped a katha and a bhog profile.

**Aliases, not rules:** जलझूलनी / देव झूलनी ग्यारस and मौन एकादशी on the existing Ekadashis (`EKADASHI_EXTRA_SEARCH_TERMS`); सतुआनी · बैसाखी · बोहाग बिहू · पोहेला बोइशाख · पुथांडु · विषु on Mesha and पोंगल · खिचड़ी पर्व · उत्तरायण on Makar (`SANKRANTI_ALIASES`).

**Also landed:** RULEBOOK **§23a** (the ten-point contract for adding an observance, which did not exist); design.md §33's regional-coverage block; `observances.test.ts`'s source-host allowlist widened from Drik-only to the §11.1 set actually used; the `devi-vrat-bhog`, `shitala-bhog` and `chhath-bhog` profiles extended to name their new members; `verify-observances.mts` extended by 16 rules and 21 anchors; `CACHE_VERSION` 3→4; `.maestro/regional-parv-smoke.yaml`.

**Known shift, shipped knowingly:** `bachh-baras` resolves at sunrise (8 Sep 2026) where Drik publishes pradosh-vyapini (7 Sep 2026), while the popular Hindi almanacs reasoned from sunrise for 2025 and agreed with the engine. No convention invented from one contested data point; pinned by a named test and a `pradosh` row in `verify-observances.mts`, and reported in the Class B list every run. E-1 closes it.

**Verification:** 2,049 tests green, lint 0 errors, `verify:observances` `wrong-month=0`, precomputed table diffed — 17 ids added, **no existing date moved**.

---

## Appendix A — the candidate register

Every observance the sweep found, by lens. **141 candidates.**

**These are candidates, not a verified table.** The tithis below are what the sources consulted for this plan agree on; each becomes a rule only after its own §11.1 two-source pass, and every row marked *TBD* is registered precisely because this plan could not settle it. Tier = §6. K = Krishna paksha, S = Shukla; lunar months are **purnimant** unless a row says otherwise.

### A.1 `jain` — 12 (W3)

| Observance | Tithi | Tier | Note |
|---|---|---|---|
| पर्युषण पर्व (Śvetāmbara) | Bhadrapada K12 → S4 | T3 | **Arc**, 8 days |
| संवत्सरी | Bhadrapada S4 | T3 | Closes Paryushana; 15 Sep 2026 |
| दस लक्षण पर्व (Digambara) | Bhadrapada S5 → Anant Chaturdashi | T2 | **Arc**, 10 days; close ≡ `anant-chaturdashi` |
| क्षमावाणी | Ashvina K1 | T1 | Day after Anant Chaturdashi |
| ज्ञान पंचमी | Kartika S5 | T1 | Śvetāmbara |
| महावीर निर्वाण | Kartika Amavasya | T1 | Sibling of `diwali` |
| वीर निर्वाण संवत् नववर्ष | Kartika S1 | T1 | Sibling of `govardhan-puja` |
| मौन एकादशी | Margashirsha S11 | T2 | Sibling of `mokshada-ekadashi`; alias already shipped |
| पौष दशमी (पार्श्वनाथ जन्म कल्याणक) | Pausha K10–11 | T1 | Exact tithi TBD |
| नवपद ओली | Chaitra & Ashvina S7–15 | T3 | **Arc ×2**, 9 days each |
| अष्टाह्निका पर्व | Kartika / Phalguna / Ashadha S8–15 | T1 | **Arc ×3** |
| *(fix)* रोहिणी व्रत | Rohini nakshatra, monthly | T2 | Exists; resolves nowhere (E-3a) |

### A.2 `maharashtra` — 9 (W4)

| Observance | Tithi | Tier | Note |
|---|---|---|---|
| वट पूर्णिमा | Jyeshtha S15 | T3 | The app ships only the **Amavasya** Vat Savitri — the northern/Bihari form |
| आषाढी एकादशी · पंढरपूर वारी | Ashadha S11 | T1 | Sibling of `devshayani-ekadashi`; the wari is the observance |
| दीप अमावस्या · गटारी | Ashadha Amavasya | T1 | Shared with `goa-konkan` (दिवज) |
| नारळी पौर्णिमा | Shravana S15 | T1 | Sibling of `raksha-bandhan`; shared with `goa-konkan` |
| पोळा · पिठोरी अमावस्या | Amavasya — see §5.4 | T2 | Shared with `chhattisgarh`; **one day, two month-names** |
| गौरी आवाहन → विसर्जन | Bhadrapada S3 → S5 | T2 | **Arc**, 3 days, inside Ganesh Utsav |
| वसुबारस | Kartika K12, `pradosh` | T2 | Shared with `gujarat` (વાઘ બારસ); needs E-1 |
| चंपा षष्ठी · खंडोबा | Margashirsha S1 → S6 | T2 | **Arc**, 6 days; shared with `karnataka`, `goa-konkan` |
| कार्तिकी एकादशी वारी | Kartika S11 | T1 | Sibling of `dev-uthani-ekadashi` |

*Aliases only:* गुढी पाडवा (Chaitra S1), कोजागिरी (shipped).

### A.3 `gujarat` — 7 (W4)

| Observance | Tithi | Tier | Note |
|---|---|---|---|
| રાંધણ છઠ | Shravana K6 | T1 | The cooking day before Shitala Satam |
| શીતળા સાતમ | Shravana K7 | T2 | Gujarat's Shitala day — a *different tithi* from the Rajasthani Chaitra one already shipped |
| જયાપાર્વતી વ્રત | Ashadha S13 → 5 days | T3 | **Arc.** Another `catalog-only` rule with a katha and no date — §1.2 again |
| દશામા વ્રત | Ashadha S8 → 10 days | T3 | **Arc.** Distinct from Rajasthan's Chaitra दशा माता, shipped in W1 |
| લાભ પાંચમ | Kartika S5 | T1 | The Gujarati new business year |
| વાઘ બારસ | Kartika K12, `pradosh` | T1 | One rule with Maharashtra's वसुबारस |
| પોષી પૂનમ | Pausha S15 | T2 | |

### A.4 `bengal` — 6 own + 3 shared (W4)

| Observance | Tithi | Tier | Note |
|---|---|---|---|
| কালী পূজা · काली पूजा | Kartika Amavasya | T2 | Sibling of `diwali` — same night, different deity, **two rules** |
| জগদ্ধাত্রী পূজা | Kartika S9 | T2 | |
| কৌশিকী অমাবস্যা | Bhadrapada Amavasya | T1 | Tarapith |
| ইতু পূজা | Sundays in Kartika | T1 | `weekday-in-lunar-month`, free (§5.5) |
| অন্নপূর্ণা পূজা | Chaitra S8 | T2 | |
| দোল পূর্ণিমা | Phalguna S15 | T1 | Sibling of `holi` |

*Shared with `odisha`:* रथ यात्रा · उल्टो रथ · स्नान यात्रा. *Aliases only:* পয়লা বৈশাখ, সরস্বতী পূজা, লক্ষ্মী পূজা.

### A.5 `odisha` — 14 (W4)

| Observance | Tithi | Tier | Note |
|---|---|---|---|
| **रथ यात्रा** | Ashadha S2 | T2 | `['odisha','bengal']`. A major absence at any scale |
| बाहुडा यात्रा (उल्टा रथ) | Ashadha S10 | T1 | `['odisha','bengal']` |
| स्नान यात्रा | Jyeshtha S15 | T1 | `['odisha','bengal']` |
| रज पर्व | Mithuna Sankranti −1 / 0 / +1 | T1 | **Arc**, 3 days; needs E-2 |
| सावित्री अमावस्या | Jyeshtha Amavasya | T3 | Sibling of `vat-savitri-vrat` |
| चंदन यात्रा | Akshaya Tritiya → +21 d | T1 | **Arc**; needs E-7 |
| नुआखाई | Bhadrapada S5 | T4 | `['odisha','chhattisgarh']`; sibling of `rishi-panchami` |
| खुदुरुकुनी ओषा | Sundays in Bhadrapada | T2 | `weekday-in-lunar-month` |
| गमहा पूर्णिमा | Shravana S15 | T1 | Balabhadra janma; sibling of `raksha-bandhan` |
| कुमार पूर्णिमा | Ashvina S15 | T2 | Sibling of `sharad-purnima` |
| बोइत बंदाण | Kartika S15 | T1 | Sibling of the shipped `kartik-purnima` |
| प्रथमाष्टमी | Margashirsha K8 | T2 | |
| मणबसा गुरुबार | Thursdays in Margashirsha | T2 | `weekday-in-lunar-month` |
| सांबा दशमी | Pausha S10 | T1 | |

### A.6 `telugu` (Andhra + Telangana) — 8 (W4)

| Observance | Tithi | Tier | Note |
|---|---|---|---|
| ఉగాది · उगादि | Chaitra S1 | T1 | Lensed rule beside the universal tithi; shared with `karnataka` |
| బోనాలు · बोनालु | Sundays in Ashadha | T1 | `weekday-in-lunar-month` |
| బతుకమ్మ · बतुकम्मा | Ashvina Amavasya → S8 | T2 | **Arc**, 9 days; sources differ on whether day 1 is the amavasya or the pratipada |
| అట్ల తద్దె · अट्ल तद्दे | Kartika K3 | T4 | 28 Oct 2026 |
| నాగుల చవితి | Kartika S4 | T2 | 13 Nov 2026 |
| భోగి · भोगी | Makar Sankranti − 1 | T1 | E-2 |
| కనుమ · कनुमा | Makar Sankranti + 1 | T1 | E-2 |
| ముక్కనుమ | Makar Sankranti + 2 | T1 | E-2 |

*Alias only:* వైకుంఠ ఏకాదశి on `mokshada-ekadashi` (the Dhanurmasa reckoning; note the variance).

### A.7 `braj-awadh-kashi` (Uttar Pradesh) — 7 (W5)

| Observance | Tithi | Tier | Note |
|---|---|---|---|
| यमुना जयंती (यमुना छठ) | Chaitra S6 | T1 | |
| लट्ठमार होली | Phalguna S9 (Barsana) → S10 (Nandgaon) | T1 | **Arc**, the Braj Holi cycle |
| रंगभरी एकादशी | Phalguna S11 | T1 | Kashi; sibling of `amalaki-ekadashi` |
| मसान होली | Phalguna S12 | T1 | Kashi, Manikarnika |
| झूलन यात्रा | Shravana S11 → S15 | T1 | **Arc**, 5 days |
| नाग नथैया | Kartika K4 | T1 | Kashi, Tulsi Ghat |
| बड़ा मंगल | Tuesdays in Jyeshtha | T1 | Lucknow; `weekday-in-lunar-month` |

*Universal, not lensed:* राधाष्टमी and गोपाष्टमी → Appendix C.

### A.8 `karnataka` — 5 (W5)

| Observance | Tithi | Tier | Note |
|---|---|---|---|
| ಸ್ವರ್ಣ ಗೌರಿ ವ್ರತ · गौरी हब्ब | Bhadrapada S3 | T3 | Sibling of `hartalika-teej`; **check the Ganesh-Chaturthi collision** — the madhyahna rule can put both on one civil day |
| ಬೆಂಗಳೂರು ಕರಗ | Chaitra S15 | T1 | Draupadi; sibling of the Chaitra Purnima |
| ಭೂಮಿ ಹುಣ್ಣಿಮೆ | Purnima — month **TBD** (Bhadrapada vs Ashvina) | T1 | Registered because this plan could not settle it |
| ಕನಕದಾಸ ಜಯಂತಿ | Kartika K — **TBD** | T1 | |
| ಕಡಲೆಕಾಯಿ ಪರಿಷೆ | Kartika S15 | T1 | Basavanagudi; sibling of `kartik-purnima` |

*Shared:* ಉಗಾದಿ with `telugu`; ಸುಬ್ರಹ್ಮಣ್ಯ ಷಷ್ಠಿ with Maharashtra's चंपा षष्ठी. *Aliases only:* ಎಳ್ಳು ಬೀರೋದು (Makar), ಉತ್ಥಾನ ದ್ವಾದಶಿ (shipped as `tulasi-vivah`).

### A.9 `bundelkhand-malwa` (Madhya Pradesh) — 4 (W5)

| Observance | Tithi | Tier | Note |
|---|---|---|---|
| रंगपंचमी | Chaitra K5 | T1 | Indore/Malwa. **Universal or lensed? Open decision 7** |
| कजलियाँ | Shravana S15 + 1 | T1 | Bundelkhand; the Kajari cluster's local form |
| मामुलिया | **TBD** (Ashvina/Kartika) | T1 | Bundelkhand girls' festival; registered unresolved |
| हरेली · पोला | see `chhattisgarh` | — | Shared; MP's Mahakoshal keeps both |

*Deferred:* भगोरिया — seven pre-Holi haat days, not a tithi. Appendix B. *Aliases only:* अक्ति (Akshaya Tritiya), गनगौर (shipped W1).

### A.10 `jharkhand` — 4 (W5)

| Observance | Tithi | Tier | Note |
|---|---|---|---|
| सरहुल | Chaitra S3 → S15 | T1 | **Arc**, 3 days; 21 Mar 2026 — the same tithi as Gangaur, a different observance |
| करम · करमा | Bhadrapada S11 | T4 | Sibling of `parivartini-ekadashi` |
| सोहराई · बंदना | Kartika Amavasya | T1 | Sibling of `diwali`; some Santhal areas keep it in Magha — record the variance |
| हल पुन्हया | Magha S1 | T1 | |

*Alias only:* टुसू परब (Makar Sankranti).

### A.11 `chhattisgarh` — 5 (W5)

| Observance | Tithi | Tier | Note |
|---|---|---|---|
| हरेली | Shravana Amavasya (amanta) | T1 | The state's first festival; needs E-4 |
| भोजली | Shravana S15 → Bhadrapada K1 | T1 | **Arc** |
| पोला | Amavasya — **§5.4, the worked case** | T1 | Maharashtra calls it Shravana, Chhattisgarh Bhadrapada. Resolve before either ships (W5-5) |
| छेर छेरा | Pausha S15 | T1 | |
| बस्तर दशहरा | Shravana Amavasya → Ashvina S13 | T1 | **Arc, ~75 days.** Needs E-7 |

*Shared:* नवाखाई with `odisha`. *Aliases only:* तीजा (Hartalika), अक्ति.

### A.12 `punjab-haryana` — 2 (W5)

| Observance | Tithi | Tier | Note |
|---|---|---|---|
| लोहड़ी | Makar Sankranti − 1 | T1 | `['punjab-haryana','sindhi']` (लाल लोई); needs E-2 |
| सांझी | Ashvina S1 → S10 | T1 | **Arc**, Haryana; the Navratri clay-goddess |

*Aliases only:* बैसाखी, माघी, तीयाँ, सलोनो. *Shipped:* गूगा नौमी (as `goga-navami`).

### A.13 `tamil` — 8 (W6)

| Observance | Rule | Tier | Note |
|---|---|---|---|
| கார்த்திகை தீபம் | Krittika in Kartika | T1 | Fixes `karthigai-vrat`, `catalog-only` since it was added |
| தை பூசம் | Pushya in Makara | T2 | Vyapini rule differs by almanac — convention doc |
| பங்குனி உத்திரம் | Uttara Phalguni in Meena | T1 | |
| ஆடி பூரம் | Purva Phalguni in Karka | T1 | |
| ஆடிப் பெருக்கு | Karka Sankranti + 17 | T1 | E-2 |
| சித்ரா பௌர்ணமி | Chaitra S15 | T1 | |
| வைகாசி விசாகம் | Vishakha in Vrishabha | T1 | |
| ஆவணி அவிட்டம் (உபாகர்மம்) | Shravana S15 | T2 | Sibling of `raksha-bandhan` |

### A.14 `kerala` — 7 (W6)

| Observance | Rule | Tier | Note |
|---|---|---|---|
| **ഓണം** | Atham → Thiruvonam in Simha | T2 | **Arc**, 10 days. Vyapini rule is Open decision 6 |
| തൃശ്ശൂർ പൂരം | Pooram in Medam | T1 | |
| ആറ്റുകാൽ പൊങ്കാല | Pooram in Kumbham | T2 | |
| മണ്ഡല പൂജ → മകരവിളക്ക് | Vrishchika S1 → +41 d → Makar | T3 | **Arc**; Sabarimala |
| കർക്കിടക വാവ് | Karka Amavasya | T2 | Bali tarpanam |
| രാമായണ മാസം | Karka → Simha Sankranti | T1 | `ruleType: 'range'` |
| വിഷു കണി | Mesha Sankranti | T2 | Lensed rule beside the alias — the kani is the observance |

### A.15 `assam-northeast` — 8 (W6)

| Observance | Rule | Tier | Note |
|---|---|---|---|
| কাতি বিহু | Kartika Amavasya | T1 | Assam |
| অম্বুবাচী মেলা | Ardra in Mithuna, 4 days | T1 | **Arc**; Kamakhya |
| দৌল উৎসব | Phalguna S15 | T1 | Assam; sibling of `holi` |
| ꯌꯥꯑꯣꯁꯥꯡ Yaoshang | Phalguna S15 → +5 d | T1 | **Arc**; Manipur |
| ꯆꯩꯔꯥꯑꯣꯕ Sajibu Cheiraoba | Chaitra S1 **or** Mesha Sankranti — **sources differ by a month** | T1 | Manipur new year; W7-6-class problem |
| ꯅꯤꯡꯣꯜ ꯆꯥꯛꯀꯧꯕ Ningol Chakouba | Kartika S2 (Meitei reckoning) — **TBD** | T1 | Manipur |
| খার্চি পূজা Kharchi Puja | Ashadha S8 | T1 | Tripura, 7 days — **arc** |
| গড়িয়া পূজা Garia Puja | Mesha Sankranti + 7 | T1 | Tripura; E-2 |

### A.16 `uttarakhand` — 5 (W7)

| Observance | Rule | Tier | Note |
|---|---|---|---|
| हरेला | Karka Sankranti (and a Chaitra one) | T1 | 16 Jul 2026. Two Harelas a year — model both or name the Shravan one |
| फूल देई | Meena **or** Mesha Sankranti — **sources differ by a month** | T1 | W7-6 |
| घी संक्रांति · ओलगिया | Simha Sankranti | T1 | |
| इगास बग्वाल | Kartika S11 | T1 | 20 Nov 2026; sibling of `dev-uthani-ekadashi` |
| हिलजात्रा | Bhadrapada Amavasya | T1 | Kumaon |

*Aliases only:* घुघुतिया/उत्तरायणी (Makar), बिखौती (Mesha). *Out of scope:* नंदा देवी राज जात (12-yearly, §10).

### A.17 `himachal` — 4 (W7)

| Observance | Rule | Tier | Note |
|---|---|---|---|
| कुल्लू दशहरा | Vijayadashami → +7 d | T1 | **Arc**; anchor already ships as `dussehra` |
| मंडी शिवरात्रि | Mahashivratri → +7 d | T1 | **Arc**; anchor already ships |
| सैर | Kanya Sankranti | T1 | |
| मिंजर मेला | 2nd Sunday of solar Shravana | T1 | Chamba; needs E-6 |

*Deferred:* हालडा (Lahaul), फागली — Appendix B.

### A.18 `kashmir` — 8 (W7)

| Observance | Tithi | Tier | Note |
|---|---|---|---|
| **हेरथ** | Phalguna **K13** | T3 | **The wave's hard case.** A second rule beside the shipped K14 Mahashivratri — never a move (locked decision ⑥) |
| नवरेह | Chaitra S1 | T1 | Sibling of `chaitra-navratri-start`; the Saptarshi-era new year |
| ज्येष्ठ अष्टमी (खीर भवानी) | Jyeshtha S8 | T2 | Tulmul |
| पन्न · विनायक त्सोरम् | Bhadrapada S4 | T2 | Roth puza; sibling of `ganesh-chaturthi` |
| व्येठ त्रुवाह | Bhadrapada S13 | T1 | Vitasta/Jhelum |
| खेत्सिमावस (यक्ष अमावस्या) | Pausha Amavasya | T2 | |
| गाड बट्ट | Pausha — **TBD** | T1 | Registered unresolved |
| कावा पुनिम | **TBD** | T1 | Registered unresolved |

### A.19 `goa-konkan` — 3 own + 2 shared (W7)

| Observance | Tithi | Tier | Note |
|---|---|---|---|
| चवथ | Bhadrapada S4 → 5 / 7 / 11 days | T2 | **Arc** with a family-chosen length — the one place PRD-28's duration chooser is reused |
| शिग्मो | Phalguna S5 → S15 | T1 | **Arc**; 5–18 Mar 2026 |
| ढालो | Pausha, ~7 nights | T1 | **Arc**; women's; Sindhudurg → Karwar |

*Shared with `maharashtra`:* दिवज (दीप अमावस्या), नारळी पुनव. *Alias only:* सांवसार पाडवो. *Deferred:* गडयाची जत्रा — Appendix B.

### A.20 `sindhi` — 3 own + 1 shared (W7)

| Observance | Tithi | Tier | Note |
|---|---|---|---|
| चेटी चंड · झूलेलाल जयंती | Chaitra S1 **or** S2 — sources differ | T4 | 19/20 Mar 2026. Open decision 8 |
| थदड़ी | Bhadrapada K7 | T2 | 3 Sep 2026; the Sindhi cold-food day, the tithi Rajasthan keeps in Chaitra |
| चालीहो साहिब | Jyeshtha–Ashadha, 40 days | T3 | **Arc**; needs E-7 |

*Shared with `punjab-haryana`:* लाल लोई.

### A.21 `rajasthan` / `bihar-mithila` depth — 12 (W8)

Five arcs — **गणगौर 18 days** (Chaitra K1 → S3) · **रामदेवरा** (Bhadrapada S2 → S11) · **छठ ×2, four days each** (Nahay-Khay · Kharna · Sandhya Arghya · Usha Arghya) · **मधुश्रावणी** fortnight (Shravana K5 → S3) · **सामा-चकेवा** nine days (Kartika S7 → S15) — plus जुड़ शीतल (Mesha + 1, E-2), T4 kathas for गोगाजी · तेजाजी · रामदेवजी, and whatever clears re-verification from Appendix B.

**Two more `catalog-only` rules with a katha and no date** belong to whichever wave reaches them first: **अशोक अष्टमी** (Chaitra S8 — the seed already *carries* the tithi and `hidden()` throws it away, §1.2's point 1 in one line) and **जयापार्वती व्रत** (Ashadha S13, A.3). W2-16 turns the whole class into a lint rather than a memory.

## Appendix B — found, deliberately not shipped

| Observance | Region | Why not |
|---|---|---|
| बिहुला-बिषहरी | Anga / Bhagalpur | Reckoned on the Anga solar calendar; published dates disagree with each other |
| धींगा गवर | Jodhpur | Sources place it differently relative to Holi and to Vaishakha; needs a Jodhpur authority |
| खाटू श्याम फाल्गुन मेला | Rajasthan | Spans Phalguna S9–S12; the "main" day is reported inconsistently. A mela span is an arc, not a tithi |
| कैला देवी · सालासर · पाबूजी जयंती | Rajasthan | Mela dates, single-source |
| सोनपुर मेला | Bihar | Opens on Kartik Purnima (shipped) and runs for weeks — a fair, not an observance |
| भगोरिया | Jhabua / Malwa | Seven pre-Holi **haat** days, tied to weekly market days, not to a tithi |
| हालडा · फागली | Lahaul / Kullu | Local reckoning; no concordant published rule found |
| गडयाची जत्रा · zatra | Goa | Per-temple calendars; §10 (a mela is not a feature) |
| मड़ई | Chhattisgarh | Per-village weekly fairs |
| Sikh Gurpurabs · होला मोहल्ला | Punjab | Nanakshahi calendar — §10 |
| मे-डैम-मे-फी · Hornbill · Chapchar Kut · Shad Suk Mynsiem | Northeast | Fixed Gregorian or non-panchang calendars — §10 |
| नंदा देवी राज जात · कुंभ | Uttarakhand / pan-India | 12-yearly; not a recurrence rule — §10 |

## Appendix C — universal gaps, no lens needed (8)

Found while gathering the states. These belong to **everyone**, need no mechanism beyond E-1/E-5 where noted, and should not wait for a wave.

| Observance | Tithi | Note |
|---|---|---|
| **राधाष्टमी** | Bhadrapada S8 | 19 Sep 2026. Pan-Vaishnava; sibling of `durva-ashtami`. The largest single universal gap left |
| **गोपाष्टमी** | Kartika S8 | |
| **रथ सप्तमी · सूर्य जयंती** | Magha S7 | Pan-Hindu, very large in the South |
| चम्पा · स्कंद षष्ठी (annual) | Margashirsha S6 | Distinct from the shipped **monthly** `skanda-sashti`; the Khandoba/Subrahmanya day |
| शनि जयंती | Jyeshtha Amavasya | Sibling of `vat-savitri-vrat` |
| सोमवती अमावस्या | Amavasya falling on a Monday | Needs E-5 (`tithi-on-weekday`) — the engine has no rule type for it |
| रंगपंचमी | Chaitra K5 | Cross-listed in A.9; Open decision 7 |
| हनुमान जयंती (कार्तिक) | Kartika K14 | The southern/Telugu-Tamil reckoning. **A second rule, not a moved one** — the app ships only the Chaitra Purnima date, and both are correct for different people (locked decision ⑥) |
