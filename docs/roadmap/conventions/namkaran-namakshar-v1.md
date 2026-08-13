# Namkaran Nāmākṣara Convention — v1 (DRAFT)

| | |
|---|---|
| **Convention id** | `namakshar-v1` |
| **Status** | **DRAFT** — `verified: false`. Requires RULEBOOK §11 sign-off (two concordant authoritative sources per row) before any store release exposes the surface. |
| **Consumed by** | [PRD-17](../prds/17-namkaran.md) · [TRD-17](../trds/17-namkaran.trd.md) · `mobile/src/panchang/namkaranConvention.ts` |
| **Scope** | The 108 nakshatra-charana → starting-syllable table, the nakshatra attribute table, and the derivation rules for rashi-level syllable sets. Nothing else. |

This document is the **calculation contract**, in the same role `guna-milan-v1.md` plays for
Ashtakoota: the code mirrors this file, and when the two disagree **this file wins and the code
is wrong**. Changing a syllable here is a versioned change (see §6).

---

## 1. What is being pinned

Traditional Namkaran practice derives the child's name-initial (**नामाक्षर · nāmākṣara**) from the
**charana (pada) of the Moon's nakshatra at the moment of birth**. The zodiac is divided into
27 nakshatras of 13°20′ each; each nakshatra into 4 charanas of 3°20′ each — 108 charanas, each
carrying one conventional syllable.

```
charanaIndex (0..107) = floor(moonSiderealLongitude / (360 / 108))
nakshatraIndex (0..26) = floor(charanaIndex / 4)
pada (1..4)            = (charanaIndex % 4) + 1
```

Longitude is **sidereal (Lahiri)**, taken from the shipped primitive
`getSiderealPlanetLongitude('moon', instant)` — the same ayanamsa the Kundali and Guna Milan
engines use. Never fork it. Normalize to `[0, 360)` before flooring.

## 2. The 108-charana table (DRAFT)

Each cell is `Devanagari · Latin`. Where a charana carries a **second attested syllable**, both are
listed; the app shows the first as primary and the rest as अन्य विकल्प (alternates). The Latin form
is a **pronunciation aid**, not IAST — per design.md §3.1, Devanagari content romanizes by source
language, and these are Hindi-read syllables, not Sanskrit citation forms.

| # | Nakshatra | Pada 1 | Pada 2 | Pada 3 | Pada 4 |
|--:|---|---|---|---|---|
| 1 | अश्विनी · Ashwini | चू · Chu | चे · Che | चो · Cho | ला · La |
| 2 | भरणी · Bharani | ली · Li | लू · Lu | ले · Le | लो · Lo |
| 3 | कृत्तिका · Krittika | अ · A | ई · I | उ · U | ए · E |
| 4 | रोहिणी · Rohini | ओ · O | वा · Va | वी · Vi | वू · Vu |
| 5 | मृगशिरा · Mrigashira | वे · Ve | वो · Vo | का · Ka | की · Ki |
| 6 | आर्द्रा · Ardra | कु · Ku | घ · Gha | ङ · Ang | छ · Chha |
| 7 | पुनर्वसु · Punarvasu | के · Ke | को · Ko | हा · Ha | ही · Hi |
| 8 | पुष्य · Pushya | हू · Hu | हे · He | हो · Ho | डा · Da |
| 9 | आश्लेषा · Ashlesha | डी · Di | डू · Du | डे · De | डो · Do |
| 10 | मघा · Magha | मा · Ma | मी · Mi | मू · Mu | मे · Me |
| 11 | पूर्वा फाल्गुनी · Purva Phalguni | मो · Mo | टा · Ta | टी · Ti | टू · Tu |
| 12 | उत्तरा फाल्गुनी · Uttara Phalguni | टे · Te | टो · To | पा · Pa | पी · Pi |
| 13 | हस्त · Hasta | पू · Pu | ष · Sha | ण · Na | ठ · Tha |
| 14 | चित्रा · Chitra | पे · Pe | पो · Po | रा · Ra | री · Ri |
| 15 | स्वाती · Swati | रू · Ru | रे · Re | रो · Ro | ता · Ta |
| 16 | विशाखा · Vishakha | ती · Ti | तू · Tu | ते · Te | तो · To |
| 17 | अनुराधा · Anuradha | ना · Na | नी · Ni | नू · Nu | ने · Ne |
| 18 | ज्येष्ठा · Jyeshtha | नो · No | या · Ya | यी · Yi | यू · Yu |
| 19 | मूल · Moola | ये · Ye | यो · Yo | भा · Bha | भी · Bhi |
| 20 | पूर्वाषाढ़ा · Purvashadha | भू · Bhu | धा · Dha | फा · Pha | ढा · Dha |
| 21 | उत्तराषाढ़ा · Uttarashadha | भे · Bhe | भो · Bho | जा · Ja | जी · Ji |
| 22 | श्रवण · Shravana | जू · Ju / खी · Khi | जे · Je / खू · Khu | जो · Jo / खे · Khe | घा · Gha / खो · Kho |
| 23 | धनिष्ठा · Dhanishta | गा · Ga | गी · Gi | गू · Gu | गे · Ge |
| 24 | शतभिषा · Shatabhisha | गो · Go | सा · Sa | सी · Si | सू · Su |
| 25 | पूर्वाभाद्रपद · Purva Bhadrapada | से · Se | सो · So | दा · Da | दी · Di |
| 26 | उत्तराभाद्रपद · Uttara Bhadrapada | दू · Du | थ · Tha | झ · Jha | ञ · Nya |
| 27 | रेवती · Revati | दे · De | दो · Do | चा · Cha | ची · Chi |

**Open rows flagged for §11 review** (do not ship `verified: true` until each is closed):

1. **Shravana (22)** — the dual `ज/ख` series is the widest divergence between published tables; some
   almanacs give only the `ज` series, some only `ख`. v1 keeps both with `ज` primary. Needs an explicit
   editorial ruling, not a merge.
2. **Ardra pada 3 (ङ)** and **Uttara Bhadrapada pada 4 (ञ)** — nasal syllables that begin
   essentially no modern given name. The convention keeps the traditional cell, and the corpus
   requirement in PRD-17 §5.3 handles the practical consequence (these two padas fall back to the
   **nakshatra-level** syllable set, never to an invented syllable).
3. **Hasta padas 2–4 (ष / ण / ठ)** and **Uttara Bhadrapada pada 2 (थ)** — same shape as (2):
   traditionally attested, thin in practice.
4. **Purvashadha 2 vs 4 (धा / ढा)** — the two are transcribed identically in Latin sources; keep the
   Devanagari distinct and never de-duplicate them on the Latin form.

## 3. Nakshatra attribute table (DRAFT, display-only)

Used only to give the parent context beside the syllable. **None of these values may drive a
judgment, a score, or a claim about the child** (PRD-17 §7).

| # | Nakshatra | Vimshottari lord | Gana | Presiding देवता |
|--:|---|---|---|---|
| 1 | अश्विनी | केतु · Ketu | देव | अश्विनी कुमार |
| 2 | भरणी | शुक्र · Shukra | मनुष्य | यम |
| 3 | कृत्तिका | सूर्य · Surya | राक्षस | अग्नि |
| 4 | रोहिणी | चन्द्र · Chandra | मनुष्य | ब्रह्मा (प्रजापति) |
| 5 | मृगशिरा | मंगल · Mangal | देव | चन्द्र (सोम) |
| 6 | आर्द्रा | राहु · Rahu | मनुष्य | रुद्र |
| 7 | पुनर्वसु | गुरु · Guru | देव | अदिति |
| 8 | पुष्य | शनि · Shani | देव | बृहस्पति |
| 9 | आश्लेषा | बुध · Budh | राक्षस | सर्प (नाग) |
| 10 | मघा | केतु · Ketu | राक्षस | पितर |
| 11 | पूर्वा फाल्गुनी | शुक्र · Shukra | मनुष्य | भग |
| 12 | उत्तरा फाल्गुनी | सूर्य · Surya | मनुष्य | अर्यमन् |
| 13 | हस्त | चन्द्र · Chandra | देव | सविता |
| 14 | चित्रा | मंगल · Mangal | राक्षस | विश्वकर्मा (त्वष्टा) |
| 15 | स्वाती | राहु · Rahu | देव | वायु |
| 16 | विशाखा | गुरु · Guru | राक्षस | इन्द्राग्नि |
| 17 | अनुराधा | शनि · Shani | देव | मित्र |
| 18 | ज्येष्ठा | बुध · Budh | राक्षस | इन्द्र |
| 19 | मूल | केतु · Ketu | राक्षस | निरृति |
| 20 | पूर्वाषाढ़ा | शुक्र · Shukra | मनुष्य | आपः (जल) |
| 21 | उत्तराषाढ़ा | सूर्य · Surya | मनुष्य | विश्वेदेवा |
| 22 | श्रवण | चन्द्र · Chandra | देव | विष्णु |
| 23 | धनिष्ठा | मंगल · Mangal | राक्षस | अष्ट वसु |
| 24 | शतभिषा | राहु · Rahu | राक्षस | वरुण |
| 25 | पूर्वाभाद्रपद | गुरु · Guru | मनुष्य | अज एकपाद |
| 26 | उत्तराभाद्रपद | शनि · Shani | मनुष्य | अहिर्बुध्न्य |
| 27 | रेवती | बुध · Budh | देव | पूषा |

The Vimshottari lord column **must equal** `DASHA_ORDER[nakshatraIndex % 9]` as already computed by
`kundali.ts`. A test asserts that equality rather than trusting two hand-typed lists.

> **Gana is display-only and carries a copy constraint.** The traditional gana names include
> राक्षस. This app renders gana as neutral classificatory vocabulary with a one-line neutral gloss
> and **never** as a temperament, warning, or quality of the newborn. If that cannot be phrased
> neutrally in all four reading languages, drop the gana row from the surface — do not soften the
> traditional term itself.

## 4. Derived rule — rashi-level syllable sets

Many families name by **Moon-sign (rashi) letter** rather than by charana. A rashi spans exactly
30° = 9 charanas, so the rashi set is **derived, never a second data table**:

```
rashiCharanas(rashiIndex) = [rashiIndex * 9 .. rashiIndex * 9 + 8]   // 9 charanas
rashiSyllables(rashiIndex) = union of those 9 charanas' syllables, in charana order
```

This is exact by construction and cannot drift from §2. Any implementation that hard-codes a
12-row rashi-letter table is a defect — delete the table, derive it.

## 5. Boundary and rounding rules

1. **Charana boundaries are at exact multiples of 3°20′ (= 200′).** A longitude of exactly
   `k × 3°20′` belongs to charana `k` (half-open `[start, end)`), matching the `Math.floor`
   convention already used for `pada` in `computeGrahaPositions`.
2. **Never round the displayed degree and then re-derive** the charana from the rounded value.
   Derive from the raw longitude, then format for display.
3. **A birth-time interval yields a set, never a midpoint.** When the birth time is unknown, the
   Moon can cross one or more charana boundaries (the Moon moves ≈ 12–15°/day ≈ 3.6–4.5 charanas
   per civil day), so the honest answer is every charana touched in `00:00–23:59:59` IST — see
   PRD-17 §5.2. Substituting noon is prohibited, exactly as in `guna-milan-v1.md`.
4. **IST is fixed** for v1 civil-time interpretation; the result must not depend on the device
   timezone.

## 6. Versioning

`NAMAKSHAR_CONVENTION_VERSION` lives beside the table. Bump it when **any** syllable, alternate,
attribute, or derivation rule changes. Persisted user artefacts (a saved shortlist, a saved
namkaran session) record the version they were produced under, so a later convention change can be
detected and re-derived rather than silently mixed.

## 7. Sources — to be completed before `verified: true`

| Row group | Source A | Source B | Retrieved | Reviewer |
|---|---|---|---|---|
| 108-charana syllables | _pending_ | _pending_ | _pending_ | _pending_ |
| Nakshatra lords | derived from `kundali.ts` `DASHA_ORDER` (test-asserted) | _pending_ | — | — |
| Gana | _pending_ | _pending_ | _pending_ | _pending_ |
| Presiding deities | _pending_ | _pending_ | _pending_ | _pending_ |

RULEBOOK §11 requires **two concordant authoritative sources** with edition/page and retrieval
date, plus a named reviewer, for each row group. Until every row is filled, `namkaranConvention.ts`
must export `source: { verified: false, ... }` and a test must pin that `false` — the same gate
`EVENT_RULES` carries today (RULEBOOK §17).
