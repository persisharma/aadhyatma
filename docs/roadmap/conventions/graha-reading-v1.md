# Graha-by-graha reading convention — 2 October 2026

Status: **draft, pending jyotishi review** (`GRAHA_READING_REVIEW.status: 'draft'` in `mobile/src/panchang/grahaReadingContent.ts`). The cards render in development builds only until a dated sign-off is recorded (RULEBOOK §14.7.7). This is an editorial convention for a plain-language card — it is not a classical strength formula like shadbala, and it makes no predictive claim.

## What a card is

One card per graha, in `GRAHA_ORDER`, for adult charts only:

**name and meaning → house and life areas → sign and strength → label (and why) → what it gives → where to take care → houses it rules for the Lagna → upay**

The *gives* and *care* lines come from `GRAHA_BHAVA_READINGS` (9 grahas × 12 houses). They describe the placement in the house alone. The sign's strength, the Lagna's lordship and combustion are stated by the card's own strength and reason lines, so the house sentences never repeat or contradict them.

## The label: four votes, counted

Each factor group casts at most one vote, `supports` or `cautions`, or stays silent. The label is then:

| Votes | Label |
| --- | --- |
| at least one `supports`, no `cautions` | `supportive` — सहायक · Helps you |
| at least one `cautions`, no `supports` | `care` — ध्यान दें · Needs care |
| both, or none at all | `mixed` — मिश्रित · Mixed |

This is the same rule as the detailed daily readings (RULEBOOK §14.6). There is no score, no weighting and no ranking of grahas. A care card still shows what the graha gives.

| Group | Rule id | Condition | Vote |
| --- | --- | --- | --- |
| Sign | `sign-exalted` / `sign-own` | exaltation sign / own sign (`kundaliBasis.dignityOf`) | supports |
| Sign | `sign-debilitated` | debilitation sign | cautions |
| Sign | `sign-friend` / `sign-enemy` | otherwise: the graha's naisargika relation to the sign lord (`signRelationOf`, BPHS maitri table) | supports / cautions |
| House | `house-digbala` | dig-bala house: Jupiter and Mercury 1st, Moon and Venus 4th, Saturn 7th, Sun and Mars 10th | supports |
| House | `house-gains` | the 11th, for every graha | supports |
| House | `house-benefic-strong` | natural benefic (Moon, Mercury, Jupiter, Venus) in a kendra or trikona | supports |
| House | `house-benefic-dusthana` | natural benefic in the 6th, 8th or 12th | cautions |
| House | `house-malefic-growth` | natural malefic (Sun, Mars, Saturn, Rahu, Ketu) in the 3rd, 6th or 10th | supports |
| House | `house-malefic-hidden` | natural malefic in the 8th or 12th | cautions |
| Lordship | `lord-lagna` | rules the 1st (the Lagna lord, whatever else it rules) | supports |
| Lordship | `lord-yogakaraka` | rules a kendra (4/7/10) and a trikona (5/9) | supports |
| Lordship | `lord-trikona` | rules the 5th or 9th | supports |
| Lordship | `lord-demanding` | rules any of 3/6/8/11 and no trikona | cautions |
| Combustion | `combust` | within the flat orb of the Sun: Moon 12°, Mars 17°, Mercury 14°, Jupiter 11°, Venus 10°, Saturn 15° | cautions |

Silent cases: a benefic in the 2nd or 3rd; a malefic in the 1st, 2nd, 4th, 5th, 7th or 9th; a graha that rules only houses among 2/4/7/10/12; a neutral sign; the nodes' sign, lordship and combustion (they have none).

## Simplifications the reviewer should confirm

1. The Moon and Mercury count as benefic in every chart. The waxing/waning Moon and Mercury's association are not checked.
2. Kendra lordship is silent. There is no kendradhipati rule for benefics owning kendras, and no badhaka or maraka logic. Maraka is deliberately never read: it is a longevity topic (RULEBOOK §14.3.5).
3. Combustion uses flat orbs. The retrograde variants (Mercury 12°, Venus 8°) are not applied, matching the muhurat engine (PRD-16 §9). Venus 10° and Jupiter 11° are pinned equal to `eventMuhurat.ts`.
4. Rahu and Ketu vote only through their house. Dispositor strength and association are not read, and the nodes have no exaltation table here.
5. Retrograde motion is shown as a fact on the strength line and in the basis. It does not vote, because classical views on it differ.

## Upay table

One row per graha in `GRAHA_UPAY`: day, daan, seva, beej mantra (108, one mala) and one paath from the library.

- **Daan** for the seven weekday grahas is the shared vaar table `mobile/src/data/daan/vaar.ts` (two-source checked on 2026-09-01). The cow-fodder seva (gau-gras) sits with Budh on Wednesday, as that table has it.
- **Rahu and Ketu** take their day from the maxims शनिवत् राहु · कुजवत् केतु: Rahu on Saturday, Ketu on Tuesday. Their daan (Rahu: urad dal and a blanket; Ketu: a blanket and til) and seva (grain for birds; roti for a dog) are common folk practice and need confirmation.
- **Paath** ids are the RULEBOOK §14.3.5 allow-list: Surya Ashtakam, Shiv Chalisa, Hanuman Chalisa, Ganesh Chalisa, Vishnu Sahasranama, Mahalakshmi Ashtakam, Shani Ashtakam, Durga Chalisa, Ganesha Kavacham (plus Navagraha Stotram).
- **Beej mantras** are the standard navagraha forms, ॐ ह्रां ह्रीं ह्रौं सः सूर्याय नमः … ॐ स्रां स्रीं स्रौं सः केतवे नमः.

## References for the reviewer

- Brihat Parashara Hora Shastra: bhava-phala chapters (graha in each bhava); the naisargika maitri table; the functional rules for lords of trikonas, kendras and 3/6/8/11; graha shanti for the daan items.
- Phaladeepika ch. 8 (results of grahas in the bhavas) and Saravali, for the *gives* lines.
- Surya Siddhanta, for the combustion orbs.

These are references for traditional rules, not evidence of predictive accuracy. No source URL was opened for this draft: the review sheet and the jyotishi's sign-off are the source review.

## Review artefacts

- Sheet: `docs/reviews/graha-readings-jyotishi-review.md`, regenerated by `npm run export:graha-review`. A stale sheet fails `grahaReading.engine.test.ts`.
- Sign-off: set `status: 'approved'`, `signOffRef` (the review page link or a ticket id — never a name) and `reviewedOn` in `GRAHA_READING_REVIEW`, and update the test that pins the record to `draft`.
