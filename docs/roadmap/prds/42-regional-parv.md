# PRD-42 — क्षेत्रीय पर्व · Regional, Sampradaya & Jain Observances

| | |
|---|---|
| **Status** | **Plan.** Wave 1 (Rajasthani + Bihari/Maithil dated rules, 17 additions) **shipped 2026-09-06** as a plain catalog change under RULEBOOK §23a — no new mechanism. Waves 2–4 below are unbuilt: they need the lens mechanism in §4, and the missing `dayRule`/`ruleType` conventions in §7. |
| **Trigger** | Sept 2026 user report: *"A lot of important dates like Goga Navami missing from calendar. Do a check for all Rajasthani and Bihari related dates."* |
| **T-shirt size** | Wave 1: S (data only, done). Wave 2 (the lens): **M** — one optional rule field, one persisted preference, one filter at the read path, a bigger precomputed table. Waves 3–4: M content per wave (§11.1 review each). |
| **Delivery** | OTA-safe throughout: TypeScript + data. No native dependency. `CACHE_VERSION` bump per wave; no `PANCHANG_DAY_CACHE_VERSION` bump (nothing in `DayInputs` moves). |
| **Contract** | RULEBOOK **§23a** (adding an observance) · **§23** (vyapini day selection) · **§21** (bhog) · **§11** (content integrity) · design.md **§33** (Panchang tab, regional-coverage block) |

> **Locked decisions (do not drift):** ① The app never asks a user to declare a religion. A lens is a *calendar* the user turns on, seeded from the city they already chose, and everything stays findable through search regardless. ② A lens filters **presentation only** — the precomputed table carries every rule, so turning a lens on is instant and offline and re-runs no scan. ③ Nothing here changes an existing rule's tithi, month, paksha or `dayRule`. ④ No new notification family: a lensed observance reaches reminders the way every other one does, through ★ follow.

---

## 1. What the audit found

The check covered every Rajasthani and Bihari/Maithil observance a household would expect, against the 118-rule catalog as it stood.

### 1.1 Shipped a katha, shipped no date

Five Rajasthani observances had a **full bilingual katha in the binary** while their rule was `hidden()` / `ruleType: 'catalog-only'` — no `lunarMonth`, no `tithi`. The engine returns `[]` for such a rule, so they could be read about and never appeared on a single calendar day: **गणगौर · सकट चौथ · शीतला सप्तमी · बछ बारस · आशा दशमी**. This is the defect that made the report feel bigger than "one missing festival": the app already knew these festivals existed and still could not say when they were. RULEBOOK §23a.1 now names it.

### 1.2 Absent entirely

| Observance | Tithi (purnimant) | Region |
|---|---|---|
| गोगा नवमी · Goga Navami | Bhadrapada K9 | Rajasthan, Haryana, Punjab, W-UP — Gogamedi mela |
| रामदेव जयंती · Ramdev Jayanti | Bhadrapada S2 | Rajasthan — Ramdevra/Runicha |
| तेजा दशमी · Teja Dashami | Bhadrapada S10 | Rajasthan, W-MP — Parbatsar |
| शीतला अष्टमी · बसोड़ा | Chaitra K8 | Rajasthan, Haryana, Gujarat |
| दशा माता व्रत | Chaitra K10 | Rajasthan, Gujarat |
| चैती छठ · Chaiti Chhath | Chaitra S6 | Bihar, Jharkhand, E-UP, Mithila |
| मधुश्रावणी · Madhushravani | Shravana S3 (closing day) | Mithila |
| सामा-चकेवा · Sama Chakeva | Kartika S7 (opening day) | Mithila |
| चित्रगुप्त पूजा | Kartika S2 | Bihar, Jharkhand, UP — Kayastha |
| कार्तिक पूर्णिमा | Kartika S15 | pan-Hindu; Pushkar + Sonepur melas |
| चैत्र नवरात्रि प्रारंभ | Chaitra S1 | pan-Hindu; also Gudi Padwa / Ugadi / Cheti Chand |
| महावीर जयंती | Chaitra S13 | Jain, pan-India gazetted |

All twelve shipped in wave 1, together with the five promotions above. Two of the finds are not regional at all, and are the more embarrassing ones: **Ram Navami had shipped for years with no Chaitra Navratri opening day**, and **Kartik Purnima existed only as an anonymous monthly `purnima-vrat`** — no Dev Deepawali, no Pushkar, no Sonepur.

### 1.3 Found, deliberately not shipped as rules

- **जलझूलनी / देव झूलनी ग्यारस** (Bhadrapada S11) — this *is* Parivartini Ekadashi. Shipped as `searchTerms` on the existing rule, not a duplicate (RULEBOOK §23a.6). Same treatment for सतुआनी / बैसाखी / बोहाग बिहू / पोहेला बोइशाख / पुथांडु / विषु on `mesha-sankranti`, and खिचड़ी पर्व / पोंगल / उत्तरायण on `makar-sankranti`.
- **जुड़ शीतल · Jur Sital** (Maithil new year) — the day **after** Mesha Sankranti. The engine has no "solar ingress + N days" rule type; see §7.2. Satuani itself, being the ingress day, is covered by the alias above.
- **बिहुला-बिषहरी · Bihula-Bishahari** (Anga/Bhagalpur, Manasa) — reckoned on the Anga solar calendar, and the published dates disagree with one another. §11.1 is not satisfied; it stays out until a source-verified rule exists.
- **धींगा गवर** (Jodhpur), **खाटू श्याम फाल्गुन मेला**, **कैला देवी** and **सालासर** melas — mela dates, several contested across sources. Wave 3 candidates, each needing its own two-source pass.

### 1.4 One known-wrong date, shipped knowingly

`bachh-baras` resolves at sunrise (8 Sep 2026) while Drik publishes it pradosh-vyapini (7 Sep 2026); popular Hindi almanacs reasoned from sunrise for 2025 and agreed with the engine. The variance is pinned in `observanceDates.test.ts` and reported by `verify:observances` on every run. §7.1 closes it.

---

## 2. Goal

Let the app be **the household's** calendar rather than a national average — for a Rajasthani family, a Maithil family, a Jain family, a Marathi family — without turning the Panchang tab into a wall of days nobody in the house observes, and without ever asking anyone to declare who they are.

## 3. Non-goals

- No religion, caste or community question, anywhere, ever.
- No per-observance on/off switches. A lens is a calendar, not a settings list.
- No change to the default-on festive reminder catalog (`festiveReminders.ts` stays "famous enough that everyone is already observing it" — RULEBOOK §23a.9).
- No sect ruling. Where Digambara and Śvetāmbara, or purnimant and amanta, differ, the app shows both with their names, never one as "the" date.

## 4. Wave 2 — the lens mechanism

### 4.1 Data

One optional field on `ObservanceRule`:

```ts
export type ObservanceLens =
  | 'rajasthan' | 'bihar-mithila' | 'maharashtra-konkan' | 'gujarat'
  | 'bengal-odisha' | 'punjab-haryana' | 'tamil' | 'kerala' | 'telugu-kannada' | 'assam-northeast'
  | 'jain';
/** Absent ⇒ universal: shown to everyone, exactly as today. */
lens?: ObservanceLens[];
```

`lens` is **additive metadata on rules that would otherwise not ship at all** — it is not a re-tagging of wave 1. Wave 1 stays universal: Gangaur and Chhath are kept by tens of millions, their descriptions already name their region, and demoting them behind a switch would take away what the user just asked for. A rule gets a lens only when it is genuinely narrow enough that showing it to everyone is noise (Navpad Oli, Sama Chakeva's nine intermediate days, Bathukamma).

This retires the current `visibility: 'regional'` value, which today means *invisible with no way back* — the two rules carrying it (`karthigai-vrat`, `rohini-vrat`) become `default` + a lens, and get real rule types.

### 4.2 Preference and seeding

`@vedansh:panchang-lenses` — a set, read in the same `multiGet` as location and calendar system (`panchangPrefs.ts`; the launch-path isolation rules in that file's header apply unchanged). Empty set = today's behaviour.

**Seeded, not asked.** The user has already chosen a city, and `locations.ts` knows its state, so first entry to Panchang after the update pre-ticks the matching lens and shows one dismissible line — *"राजस्थान के पर्व भी दिख रहे हैं · बदलें"* — rather than a modal. `jain` is never auto-seeded; it is only ever a deliberate choice.

### 4.3 Read path

`resolveObservancesForYearLive` scans **every** rule including lensed ones, so `PRECOMPUTED_OBSERVANCES` carries them all; the active-lens filter runs in `resolveObservancesForYear` after the table read. Consequences to respect:

- The table roughly doubles (≈4.5k → ≈9k rows). Measure the bundle delta in the PR; if it matters, move lensed years into a lazily-required sibling module rather than dropping the precompute — a live scan on a render path is the exact thing the precomputed table exists to prevent.
- `getObservanceCatalog()` grows an option; `festivalEngine`'s module-scope `defaultRules` must include lensed rules or the generator silently omits them.
- `CACHE_VERSION` bump (RULEBOOK §23a.8). `searchObservances` ignores lenses entirely — search always finds everything.
- `dayAnga.ts`'s notification-title picker keeps its **universal-only** gate: a lensed observance must never title a notification for a user who did not turn that lens on.

### 4.4 Surfaces

Panchang day panel, month grid, Upcoming, the Vrat & Parv catalog and Observance List all read the filtered resolver and need no change. Two additions: a lens row in the Panchang header sheet, and a quiet lens caption on Observance Detail (`राजस्थान · Rajasthan`), so a user can always see *why* a day is on their calendar.

## 5. Wave 3 — the Jain calendar

Already default-visible: **महावीर जयंती** (Chaitra S13). **रोहिणी व्रत** exists as a nakshatra rule that nothing resolves. The rest is one coherent body of content behind the `jain` lens. Every row below is a **candidate pending its own §11.1 two-source pass** — these tithis are what the sources consulted for this plan agree on, not a verified table.

| Observance | Tithi | Note |
|---|---|---|
| पर्युषण पर्व (Śvetāmbara) | Bhadrapada K12 → S4, 8 days | An **arc** (PRD-28), not a day |
| संवत्सरी | Bhadrapada S4 | Closes Paryushana; 15 Sep 2026 |
| दस लक्षण पर्व (Digambara) | Bhadrapada S5 → Anant Chaturdashi, 10 days | Arc; shares its last day with the shipped `anant-chaturdashi` |
| क्षमावाणी | Ashvina K1 | Day after Anant Chaturdashi |
| ज्ञान पंचमी | Kartika S5 | Śvetāmbara |
| महावीर निर्वाण / दीपावली | Kartika Amavasya | Same civil day as the shipped `diwali` — a **sibling rule**, §23a.4 |
| वीर निर्वाण संवत् नववर्ष | Kartika S1 | Same day as `govardhan-puja` |
| मौन एकादशी | Margashirsha S11 | Same day as Mokshada Ekadashi; already an alias in `searchTerms` |
| पौष दशमी (पार्श्वनाथ जन्म कल्याणक) | Pausha K10–K11 | |
| नवपद ओली | Chaitra & Ashvina S7–S15, 9 days ×2 | Arc ×2 |
| अष्टाह्निका पर्व | Kartika / Phalguna / Ashadha S8–S15 | Arc ×3 |

Three things this wave must get right, or it should not ship:

1. **Both lineages, both named.** Paryushana and Das Lakshan are not variants of one entry; they are two observances that happen to abut. Never collapse them, never label one "main".
2. **Content is instruction and remembrance only.** No liturgical text is generated (§11.3); the Navkar and the Micchāmi Dukkaḍaṃ formula are transcribed from a published source or absent.
3. **Sibling-day tests.** Mahavir Nirvana ≡ `diwali`, Veer Nirvana Samvat ≡ `govardhan-puja`, Maun Ekadashi ≡ `mokshada-ekadashi`, Das Lakshan's close ≡ `anant-chaturdashi` (§23a.4).

## 6. Wave 4 — the other states

Ordered by how badly the current catalog serves them. Every row is again a **candidate**, not a verified rule.

| Lens | Highest-value gaps |
|---|---|
| `maharashtra-konkan` | गुड़ी पड़वा (currently folded into `chaitra-navratri-start`; may want its own lensed rule), वट पूर्णिमा (Jyeshtha S15 — the app ships only the Amavasya Vat Savitri, which is the *Bihari/North* form), आषाढ़ी वारी, नागपंचमी variants |
| `bengal-odisha` | रथ यात्रा (Ashadha S2 — a major absence at any scale), काली पूजा (Kartika Amavasya, sibling of `diwali`), जगद्धात्री पूजा, नुआखाई (Bhadrapada S5), रज पर्व |
| `gujarat` | शीतला सातम (Shravana K7), जयापार्वती व्रत (Ashadha S13 — already a `hidden()` rule with a katha and no date: the §1.1 defect again), रांधण छठ |
| `punjab-haryana` | लोहड़ी (Makar Sankranti eve — needs §7.2), बैसाखी (alias, shipped) |
| `tamil` | कार्तिगई दीपम (`karthigai-vrat` needs a real nakshatra rule type), तै पूसम, पंगुनी उत्तिरम्, आदि पेरुक्कु |
| `kerala` | ओणम (Thiruvonam nakshatra in Simha — needs the nakshatra-in-solar-month rule type), विषु (alias, shipped) |
| `telugu-kannada` | उगादि (folded into `chaitra-navratri-start`), बतुकम्मा (Bhadrapada Amavasya → Ashvina S9, an arc), नागुल चविति |
| `assam-northeast` | बोहाग / माघ / काति बिहू (two of the three are sankranti days; Kati Bihu is Kartika Amavasya) |

## 7. Engine work these waves depend on

### 7.1 `dayRule: 'pradosh'`
The three-part job RULEBOOK §23.7 describes: the enum value, a `tithiAtPradosh` instant solver (`engine.ts`, gated on the expected tithi index exactly like `tithiAtMoonrise` / `tithiAtMadhyahna`, reusing the shared `matchesInstantVyapiniRuleOnDate`), and published-date tests across several years. It closes `bachh-baras` — and, on a separate and far more carefully verified change, `dhanteras` and `diwali`, which have been ±1 day since the engine shipped. **Do not retag Diwali in the same PR as a regional wave**: it moves the single most-viewed date in the app.

### 7.2 `ruleType: 'solar-offset'`
A solar ingress plus a fixed civil-day offset. Needed for जुड़ शीतल (Mesha Sankranti + 1) and लोहड़ी (Makar Sankranti − 1). `findSolarFestivalDate` already caches the ingress day per rule per year; the offset applies after it.

### 7.3 Nakshatra rule types
`ruleType: 'nakshatra'` exists in the type union but nothing resolves it — `karthigai-vrat` and `rohini-vrat` are `catalog-only` in practice. Onam additionally needs *nakshatra within a named solar month*. This is the largest of the three and gates the `tamil` and `kerala` lenses.

### 7.4 Multi-day parvas reuse PRD-28
Paryushana, Das Lakshan, Navpad Oli, Ashtahnika, Sama Chakeva's nine days and Bathukamma are **arcs**, and PRD-28's `ARC_DEFINITIONS` already models an observance seen across days with a sthapana and a close. Adding them means adding definitions, not a second multi-day mechanism (§26.6: never invent a rule just to make a strip look complete).

## 8. Verification

Per wave, unchanged from RULEBOOK §23a: two independent published sources per rule with the second in a code comment; published civil dates pinned in `observanceDates.test.ts`; a row in `verify-observances.mts` `ANNUAL` carrying the rule's **real** muhurta; sibling-day assertions; the precomputed table regenerated and diffed by rule id with **no existing date moved**; `CACHE_VERSION` bumped; design.md §33 and this file updated in the same PR.

For wave 2 specifically, add: a lens-filter test proving a lensed rule is absent with the lens off and present with it on, on **all** of day / month / upcoming / catalog; a `dayAnga` test proving a lensed observance never titles a notification; and a launch-path test proving the lens preference rides the existing `multiGet` and adds no round trip.

## 9. Open questions

1. Does a lens seeded from the city ever *un*-seed when the user travels? Proposal: no — a lens is sticky once shown, because moving cities for a week should not delete someone's festivals.
2. Should the `jain` lens also suppress universal rules a Jain household does not keep? Proposal: **no** — a lens only ever adds. Subtraction is a religion question in disguise.
3. Purnimant/amanta already toggles; do any lensed rules need the toggle *forced* (Sama Chakeva is reckoned Maithil-purnimant)? Needs a per-rule check before wave 2.
