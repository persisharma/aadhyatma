# Graha-by-graha reading convention — 2 October 2026

Status: **approved 7 Oct 2026** (`GRAHA_READING_REVIEW` in `mobile/src/panchang/grahaReadingContent.ts`). The approval was relayed by the product owner: the jyotishi reviewed the content outside the review page, which holds only partial marks (15 of 227 rows, from the first round) and no on-page sign-off. The open questions below were accepted as drafted. The cards now render in every build; the sign-off pins a hash of the reviewed content, so any later edit needs a new review (RULEBOOK §14.7.7). This is an editorial convention for a plain-language card — it is not a classical strength formula like shadbala, and it makes no predictive claim.

## What a card is

One card per graha, in `GRAHA_ORDER`, for adult charts only. The row shows the name, the house and the label; the open card is headed bullet lists:

**about this graha (meaning, sign and strength, retrograde, house karaka) → friends and enemies → why the label (+ helps, − asks for care) → what it gives → where to take care → houses it rules for the Lagna → upay**

Bullets, not paragraphs (review note, 3 Oct 2026): one idea per bullet, no closing full stop. The *gives* (2–4) and *care* (1–3) bullets come from `GRAHA_BHAVA_READINGS` (9 grahas × 12 houses). They describe the placement in the house alone. The sign's strength, the Lagna's lordship and combustion are stated by the card's own sign and reason bullets, so the house bullets never repeat or contradict them. Combustion has no separate note: it votes, so its reason bullet says it.

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

## Names on the card (review note, 2 October 2026)

The first review asked *which graha is an enemy of what* and *which house supports which graha*. So every sign bullet names the sign, its lord and the relation (`In Simha (Leo) — ruled by the Sun, whom Venus counts as an enemy (shatru rashi)`), every planet's card lists its whole maitri row as three bullets (`Friends: Sun, Moon, Mars` · `Enemies: Mercury, Venus` · `Neutral: Saturn`), and every card names its house's karaka from `BHAVA_PLAIN[].karakas`:

| House | Karaka | House | Karaka |
| --- | --- | --- | --- |
| 1st | Sun | 7th | Venus |
| 2nd | Jupiter | 8th | Saturn |
| 3rd | Mars | 9th | Jupiter, Sun |
| 4th | Moon | 10th | Sun, Mercury, Jupiter, Saturn |
| 5th | Jupiter | 11th | Jupiter |
| 6th | Mars, Saturn | 12th | Saturn |

The karaka is information only; it does not vote. The review sheet also shows, per house, which grahas the house rule supports or asks for care.

## Empty houses (review note, 4 October 2026)

Nine grahas share twelve houses, so at least three are always empty (in 3,000 sampled charts, 5–7 empty was typical and 6 the most common). After the nine cards, `buildEmptyHouses` lists each empty house in order as one bullet — the house and its life areas, its lord, and the house the lord sits in — under two intro bullets: empty houses are normal, and an empty house is read through its lord. It carries no label and casts no vote; each entry's basis is the `bhava` node and the `lord` node.

## Simplifications the reviewer should confirm

1. The Moon and Mercury count as benefic in every chart. The waxing/waning Moon and Mercury's association are not checked.
2. Kendra lordship is silent. There is no kendradhipati rule for benefics owning kendras, and no badhaka or maraka logic. Maraka is deliberately never read: it is a longevity topic (RULEBOOK §14.3.5).
3. Combustion uses flat orbs. The retrograde variants (Mercury 12°, Venus 8°) are not applied, matching the muhurat engine (PRD-16 §9). Venus 10° and Jupiter 11° are pinned equal to `eventMuhurat.ts`.
4. Rahu and Ketu vote only through their house. Dispositor strength and association are not read, and the nodes have no exaltation table here.
5. Retrograde motion is shown as its own bullet under *about this graha* and in the basis. It does not vote, because classical views on it differ.
6. The 2nd house casts no vote for anyone (nor the 3rd for a benefic). Classically benefics in the 2nd give wealth and sweet speech and malefics make speech harsh — open for the reviewer.
7. An empty house is read through its lord's seat only. Aspects (drishti) on the house and the house's karaka are not read for it.

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
- Sign-off: set `status: 'approved'`, `signOffRef` (the review page link, a ticket id, or how the approval was relayed — never a name), `reviewedOn` and `reviewedSheetSha256` (the hash the engine test prints when it fails) in `GRAHA_READING_REVIEW`. After any later content edit, set the record back to `draft` until the jyotishi has seen the change.
