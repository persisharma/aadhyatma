# Occasion date corrections — 6 November 2026

Base: `7d057e95cb3cf0a39aa6d090d7d9a00cc1972755`. Branch: `codex/occasion-date-rules`.

## Rules and verdict

| Occasion | Correction | Example |
| --- | --- | --- |
| Ganga Dussehra | Exclusive Adhik Jyeshtha exception; detect the preceding Adhik lunation from conjunctions and solar signs. Do not repeat the festival in Nija. | 24 June → **25 May 2026** |
| Rishi Panchami | Panchami covering Madhyahna (middle fifth of daylight); both/neither day covered → earlier day. | 16 → **15 September 2026**; 5 → **4 September 2027** |
| Purnima Vrat | Previous Chaturdashi fasting day qualifies only when Purnima already touches Madhyahna. Evening overlap alone is insufficient. | Delhi: **3 January, 3 March, 29 July 2026**, replacing the previous days |
| Monthly Krishna Ashtami | Shared Smarta midnight/Rohini selection, replacing implicit sunrise selection. | **10 January, 1 November 2026** |
| Annual Janmashtami / Vaishnava duplicate | Test exact night midpoint, not arbitrary overlap with the eighth night muhurta. | **1 September 2029**; coincident Vaishnava row suppressed |

No global sunrise, Pradosh, Ekadashi, Amavasya, Rakhi, Holi, Govardhan or regional-calendar adjustment. Stable IDs/follows remain intact. The Adhik preference is metadata on Ganga Dussehra alone. Regenerated all 16 bundled year/system entries for 2024–2031 and bumped observance cache to v12.

## Sources and independent judgment

- Ganga: [Dharmasindhu, Jyeshtha Dashami](https://www.transliteral.org/pages/z80421211729/view) explicitly includes Adhik Jyeshtha. [Kanchi publications](https://kamakoti.github.io/prakashanam/), [Sri Mandir](https://www.srimandir.com/hi/articles/festival/ganga-dussehra-kab-hai-2026) and [Drik 2026](https://www.drikpanchang.com/festivals/ganga-dussehra/ganga-dussehra-date-time.html?year=2026) support 25 May. This does not enable other annual vrats in Adhik months. The full rare forenoon/yoga preference tree is outside this focused month correction; the checked 2026–2029 dates are unambiguous.
- Rishi: [Dharmasindhu](https://www.transliteral.org/pages/z80430223211/view) provides Madhyahna coverage and the earlier-day tie/fallback. [Drik](https://www.drikpanchang.com/festivals/rishi-panchami/rishi-panchami-date-time.html?year=2026) and [Sri Mandir's September calendar](https://www.srimandir.com/panchang/date/01-09-2026) agree with the independent Panchami/Madhyahna calculation.
- Purnima: [Drik's fasting explanation and yearly dates](https://www.drikpanchang.com/vrats/purnimasidates.html?year=2026) distinguish upavasa from snan-daan and require Madhyahna for previous-day fasting. Expected dates use the first **Purnima Vrat** label in each dated block, not an adjacent bathing date. Sri Mandir sometimes gives a different full-moon date; that listing does not itself override this fasting convention. Satyanarayan and Sharad keep their own rules.
- Krishna: [Dharmasindhu's Janmashtami section](https://www.transliteral.org/pages/z80421220129/view) defines Nishitha as ratryardha and explicitly excludes wrong-side partial overlap. On 1 December 2026 Ashtami opens just after the preceding midnight; on 1 September 2029 Rohini does likewise. Mere overlap with the wider muhurta cannot select the prior fasting date. [Actual monthly Drik URL](https://www.drikpanchang.com/vrats/krishna-janmashtami-dates.html?year=2026); [2029 annual page](https://www.drikpanchang.com/dashavatara/lord-krishna/krishna-janmashtami-date-time.html?year=2029). The similarly named `masik-krishna-janmashtami-dates.html` path is not the source.

Monthly Krishna's generalisation is convention-scoped, supported by the primary Krishna rule and opened monthly calendars; it is not a claim that every community keeps a monthly fast identically. Govardhan's tradition/location exceptions and unresolved Durva, Rohini/Karthigai and generic Upakarma choices remain qualified rather than forced into publisher agreement.

`occasion-published-2026-2029.json` preserves **106 source-read Delhi/IST dates**: complete Purnima and annual series; monthly Krishna complete for 2026–2028 and seven dates for 2029. Foreign-city pages were excluded from Delhi fixtures. The other monthly 2029 dates are independently checked, not claimed as fully publisher-verified. Sri Mandir supplied 2026 comparisons; complete Sri Mandir 2027–2029 coverage is not claimed.

## Next three years

| Occasion, New Delhi/IST | 2027 | 2028 | 2029 |
| --- | --- | --- | --- |
| Ganga Dussehra | 13 June | 2 June | 21 June |
| Rishi Panchami | 4 September | 24 August | 12 September |
| Janmashtami | 25 August | 13 August | 1 September |
| Purnima fasts | 12 | 13 | 12 |
| Monthly Krishna occurrences | 12 | 12 | 13 |

Annual Janmashtami clocks: 2027 **00:01–00:45 on 26 August**; 2028 **00:04–00:48 on 14 August**; 2029 **23:58 on 1 September–00:44 on 2 September**. Opened Drik year pages support these windows. Future clock tests require exact endpoint dates and at most one displayed minute difference; the wider existing audit retains its stated three-minute bound.

## Verification and recovery

The initial implementation was locally committed as `7c4b05a` / `6b524bd`, with 871 engine tests passing, 674 independent Swiss/Moshier dates checked in both systems, 16,276 unchanged date rows across six cities/2026–2029/both calendars, and zero failures in the existing 2024–2031 observance verifier. Six unrelated app-suite failures were reproduced on unchanged main (three catalogue Jest assertions, three dohaScopes cases), owned by [PR #632](https://github.com/persisharma/aadhyatma/pull/632). Native iOS/Android acceptance was pending.

The original push was rejected for missing explicit publication authorization. After the user's explicit **Raise pr**, the temporary workspace was found reset and neither commit nor branch existed remotely. This branch restores the recorded implementation on the identical main SHA. Restored-head tests and independent fixtures are being rerun; prior counts alone are not current-head acceptance. The requested PR stays draft while these checks and native evidence remain pending. No release, merge, build, EAS or OTA is included.

U1/U2/U7/U8/U10/U11: source, scoped acceptance, sibling integration, stable IDs and docs are covered. U3/U4: N/A to layout; no UI/art/copy changes. U5/U6/U9: logic/cache checks are being rerun; native journeys/lifecycle acceptance PENDING. U12: publish the requested draft checkpoint promptly, verify remote head and preserve subsequent fixtures/evidence there before cleanup. C5 calendar boundaries and C6 cache/consumer parity apply; release checks are outside scope.
