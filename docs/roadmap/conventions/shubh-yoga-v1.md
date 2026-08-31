# Shubh Yoga convention — Vedansh v1 (DRAFT)

**Convention id:** `vedansh-shubh-yoga-v1`
**Status:** **DRAFT — NOT signed off.** Authored 2026-08-31. Direct content egress remains blocked in the authoring environment (every panchang-site fetch attempted on 2026-08-31 — drikpanchang.com, prokerala.com, panchangbodh.com, shubhpanchang.com, astroask.com — was refused by the network proxy), so the rows below are pinned from **search-index snippets of published tables retrieved 2026-08-31**, recorded per row. Snippets are not the §10 standard: the two-source review (edition/page or stable URL + retrieval date + named reviewer, claim-level concordance checked) is **outstanding and release-gating** (RULEBOOK §23), exactly like the masa/lagna/tarabala tables.
**Scope:** PRD-27 — the five शुभ योग tables `panchang/shubhYoga.ts` implements, and the annotate-only product contract every surface obeys.

This document is part of the calculation contract. A table or rule change requires a new convention id and fixture review; it must not silently change old results. `shubhYoga.test.ts` pins every table below **row-for-row against this document**.

## The v1 set, and what is deliberately out

v1 ships **सर्वार्थ सिद्धि**, **अमृत सिद्धि**, **रवि**, **द्विपुष्कर**, **त्रिपुष्कर**. Guru Pushya / Ravi Pushya already ship as computed *abujh* days (`abujhMuhurat.ts` `pushyaYogaFor`) and are NOT duplicated into this table — one concept, one home (a Sunday-Pushya day may legitimately carry both the abujh card and, via the Sunday row below, a सर्वार्थ सिद्धि chip; that overlap is real and stated, not deduplicated). Anandadi yogas, Siddha yoga and activity-specific pushya rules are out of v1.

## Window convention (wired)

- These yogas run **nakshatra-to-nakshatra, not midnight-to-midnight**. A yoga holds while its forming factors hold simultaneously; the vāra changes at sunrise (vedic day), so evaluation covers **[sunrise, next sunrise)** and a window never crosses the next sunrise (published lists show the same daily bound).
- `computeShubhYogas` cuts the day at every solved anga end (`tithi.endTime`, `nakshatra.endTime`, and both kshaya ends — kshaya-aware via the shipped `angaAt`, never `index + 1` across a kshaya) and evaluates each segment at its **start instant**; adjacent matching segments merge into one window.
- **Ravi yoga's Sun nakshatra is read at each segment start** via the shipped `getSiderealPlanetLongitude('sun', …)`. The Sun crosses a nakshatra boundary about once in 13.6 days; a crossing *inside* a segment is not itself a cut in v1 (recorded variant — the error is at most one segment on ~2% of days; the §10 review may tighten it).
- **Display:** every window end renders through the shipped `formatEndInstant` (12-hour clock + a short-date suffix when the end lands on a different civil day — `2:12 AM, 15 अक्टू`). The printed-panchang extended-hour style (`26:12`) is used **nowhere** in this app and must not be introduced. Panchang surfaces that follow the end-only anga convention (the Daily Muhurat card's rows) may render end-only **only when the window starts at sunrise**; a mid-day onset always shows its start.

## सर्वार्थ सिद्धि योग — vāra × nakshatra (DRAFT rows)

0-based nakshatra indexes into the shipped 27-name tables (`names.ts`).

| Vāra | Nakshatras | Indexes |
|---|---|---|
| रविवार Sun | अश्विनी · पुष्य · उत्तरा फाल्गुनी · हस्त · मूल · उत्तराषाढ़ा · उत्तराभाद्रपद | 0, 7, 11, 12, 18, 20, 25 |
| सोमवार Mon | रोहिणी · मृगशिरा · पुष्य · अनुराधा · श्रवण | 3, 4, 7, 16, 21 |
| मंगलवार Tue | अश्विनी · कृत्तिका · आश्लेषा · उत्तराभाद्रपद | 0, 2, 8, 25 |
| बुधवार Wed | कृत्तिका · रोहिणी · मृगशिरा · हस्त · अनुराधा | 2, 3, 4, 12, 16 |
| गुरुवार Thu | अश्विनी · पुनर्वसु · पुष्य · अनुराधा · रेवती | 0, 6, 7, 16, 26 |
| शुक्रवार Fri | अश्विनी · पुनर्वसु · अनुराधा · श्रवण · रेवती | 0, 6, 16, 21, 26 |
| शनिवार Sat | रोहिणी · स्वाती · श्रवण | 3, 14, 21 |

**Recorded variance (2026-08-31 snippets):** one published recension (shubhpanchang.com) lists Sunday as Hasta/Mula/U.Phalguni/U.Ashadha/U.Bhadrapada/**Pushya/Ashlesha** (Ashlesha in, Ashwini out) and shortens Thursday to Revati/Anuradha/Punarvasu and Friday to Revati/Shravana/Anuradha. The fuller rows above match the DrikPanchang-family table echoed by multiple sites (drikpanchang.com yoga pages via search index; astroyogi.com; panchang.astrosage.com). The §10 review must settle the Sunday Ashwini/Ashlesha and the Thu/Fri short-row recensions explicitly.

## अमृत सिद्धि योग — one nakshatra per vāra (DRAFT rows)

| Vāra | Nakshatra | Index |
|---|---|---|
| रविवार Sun | हस्त | 12 |
| सोमवार Mon | मृगशिरा | 4 |
| मंगलवार Tue | अश्विनी | 0 |
| बुधवार Wed | अनुराधा | 16 |
| गुरुवार Thu | पुष्य | 7 |
| शुक्रवार Fri | रेवती | 26 |
| शनिवार Sat | रोहिणी | 3 |

Sources concordant in the 2026-08-31 snippets (drikpanchang.com amritsiddhi pages via search index; panchangbodh.com; onlinejyotish.com). **Invariant, test-pinned:** every अमृत सिद्धि pair is also a सर्वार्थ सिद्धि row, so an ASY day always carries both windows — both are reported; the UI orders अमृत सिद्धि first as the traditionally stronger *name*, never as a score. **Recorded variance for review:** several recensions carry activity exceptions (e.g. शनि+रोहिणी avoided for travel, गुरु+पुष्य for vivaha); v1 does not model activity exceptions — the chip states presence only, and the finder's own occasion tables stay the only activity filter.

## रवि योग — Sun→Moon nakshatra count (DRAFT rule)

Count **inclusively from the Sun's nakshatra to the Moon's nakshatra** in the 27-cycle: `count = ((moon − sun + 27) % 27) + 1`. रवि योग forms when the count is **4, 6, 9, 10, 13 or 20**. Concordant across the 2026-08-31 snippets (jothishi.com — "inclusive of both the nakshatra in 27 star scheme"; drikpanchang.com ravi-yoga pages via search index; omastrology.com). The Sun's nakshatra derives from the same Lahiri `getSiderealPlanetLongitude` primitive Kundali uses, floor-divided by the shipped `NAKSHATRA_SPAN` — never a second 13°20′ constant.

## द्विपुष्कर / त्रिपुष्कर योग — tithi × vāra × nakshatra (DRAFT rows)

All three factors must hold at once:

- **Tithis (both pakshas):** द्वितीया · सप्तमी · द्वादशी — the भद्रा tithis; 0-based indexes `i % 5 === 1` (1, 6, 11, 16, 21, 26).
- **Vāras:** रविवार · मंगलवार · शनिवार (0, 2, 6).
- **द्विपुष्कर nakshatras:** मृगशिरा · चित्रा · धनिष्ठा (4, 13, 22) — the three nakshatras split 2+2 padas across two rashis (the structural reading in Hora Sarvam, 2026-08-31 snippet).
- **त्रिपुष्कर nakshatras:** कृत्तिका · पुनर्वसु · उत्तरा फाल्गुनी · विशाखा · उत्तराषाढ़ा · पूर्वाभाद्रपद (2, 6, 11, 15, 20, 24) — the six nakshatras split 3+1/1+3 across two rashis.

**Recorded variance:** one 2026-08-31 snippet (astroyogi.com) prints **पूर्वा फाल्गुनी** where the pada-split derivation and the DrikPanchang-family list have **उत्तरा फाल्गुनी**; the structural rule (only U.Phalguni spans two rashis) supports the row above, but the review must record which published tables carry the discord. The "doubles/triples what is begun" meaning is transcribed as traditional framing only — the app never turns it into a score or a recommendation to spend.

## Annotate-only — the product contract (wired, test-pinned)

A shubh yoga **annotates and never re-grades**:

- The Event Muhurat Finder's verdicts, tiers, ordering, sections, empty-state and windows are byte-identical with and without this module. `eventMuhurat.ts` does not import `shubhYoga.ts` — a source-guard test pins the direction of that dependency, so an offset can never creep in as a "small" edit.
- No day-quality score, no percentage, no "luckiest day", no netting: a day can carry both a भद्रा exclusion and an अमृत सिद्धि chip, and the app states both without arbitration. Round 1 §3 rejected standalone dosha warnings as fear copy; this feature is the additive inverse and is **not** licence to start scoring days in either direction.
- An **offset** (a yoga lifting a dosha, as some traditions allow for अमृत/सर्वार्थ सिद्धि) is explicitly **rejected for v1**: it would retroactively change every ranking the shipped finder has produced. Reopening it is a product decision requiring a new convention id, not a table edit.

## Naming — the योग collision (wired)

The Panchang day card already carries a field named **योग**: one of the 27 **nitya** yogas (a Sun+Moon longitude sum), one of which is literally named सिद्धि. These are unrelated systems. The contract:

- The nitya-yoga field is labelled **नित्य योग / Nitya Yoga** on every surface (day-card anga tile, Daily Muhurat card) — never bare योग.
- A shubh yoga always renders under a **शुभ योग** group label and always carries its full name ending in **… योग** (e.g. सर्वार्थ सिद्धि योग), chip or row — never as a value of the नित्य योग field, and the नित्य योग value never renders as a chip.

## Review procedure

For each table: ≥2 authoritative concordant sources (edition/page or stable URL + retrieval date — a search-index snippet does not qualify), claim-level concordance checked, recension variance recorded (especially the सर्वार्थ सिद्धि Sunday/Thursday/Friday rows and the त्रिपुष्कर U./P. Phalguni discord), a named reviewer, then update the Status line above and flip `SHUBH_YOGA_SOURCE.verified`. These tables are printed in every published panchang, so this is the cheapest §10 in the roadmap — but until it lands, `verified: false` is a release blocker for any store build exposing the chips (RULEBOOK §23). The engine tables must not change without a new convention id.
