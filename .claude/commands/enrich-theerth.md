---
description: Enrich ONE Theerth temple with the full RULEBOOK §12.6 reading (sthapana, svarup, parampara, mela, yatra). One temple per session — never batch.
argument-hint: "<temple-id> (e.g. srinathji)"
---

# /enrich-theerth <temple-id> — one temple, one session

Run this in a **fresh session per temple**. The reading for one temple is ~5,000
characters of bilingual prose plus research; two temples in one context bloats it
and degrades the second. Do not loop over ids inside a session.

Reference implementations (read for depth, tone, structure — do not copy):
`salasar-balaji` (first shipped), then the Rajasthan wave (`khatu-shyam`,
`karni-mata`, `jeen-mata`, `gogaji-gogamedi`, `tejaji-kharnal`, `ramdevra`) in
`mobile/src/data/theerth/temples.ts`.

## 0. Preconditions (check before researching)

1. `RULEBOOK.md` §12.6 and `design.md` §27 — read both.
2. The id exists in `temples.ts` and has **no** `sections` yet.
3. **Plate gate.** `backgrounds.coverage.jest.test.ts` fails any temple with
   `sections` but no entry in `theerthBackgroundOverrides`
   (`mobile/src/data/backgrounds.ts`). If the id is missing there and this
   environment cannot generate images, **stop and report** — do not ship text
   without a plate, and do not extend the legacy allowlist. If it can, generate a
   1024×1024 parchment sketch of THIS temple's murti/sanctum with the §11.8
   prompt, save `mobile/assets/backgrounds/theerth-<id>.webp`, register it in
   `mobile/assets/backgrounds/index.ts`, `theerthBackgroundOverrides`, the pinned
   list in `backgrounds.coverage.jest.test.ts`, and design.md §27 item 4.

## 1. Research (≥2 independent sources)

Order: temple trust site → state tourism / district portal → general reference
(never the only one). Gather ALL of: sthapana (VS + CE, tithi/weekday,
consecrator); founding katha (people, village, district, discovery/dream/vow,
how the murti travelled, why here); builders and serving lineage; form of the
deity (murti, throne, sanctum, jyot/dhuni/kund); traditions (bhog, vow customs,
aarti rhythm, peak weekdays); melas by tithi; journey (district, highway,
approx. distances, railheads, airport, paired shrines, satellite shrines).

**Network note (observed Sept 2026):** the remote-session proxy blocks direct
fetches (WebFetch/curl) to temple, tourism and Wikipedia hosts, but `WebSearch`
works and returns summaries of those pages. Run several targeted searches per
item; cite the canonical portal URLs in `sources[]`; list every fact you could
not confirm in the final summary. Never invent a date, name or distance.

## 1b. Fact framing (learned from the Rajasthan-wave review)

- **State directly:** architecture, inscriptions, geography, officially recorded
  dates (consecration by a named ruler, a Census/ASI/tourism-portal date).
- **Frame as tradition** — `परम्परा/लोक-मान्यता के अनुसार` / "by tradition",
  "local tradition holds": miracle narratives, deity biographies (birth years of
  folk deities), medieval encounters (an emperor's raid, a sultan building a
  shrine), "still burns since" claims, sadhana sites, favourite bhog.
- **Inscription dates:** an inscription reads in Vikram Samvat. Never paste the
  VS number as CE — convert (VS − 57) and print both.
- **Contested dates:** give the better-attested one as primary and name the
  variant in the same sentence; never silently pick one.
- **Do not hard-code** highway numbers, trust names or "new temple announced"
  claims without a current official source. Say "on the X–Y road" instead.
- **Skip** religious-boundary details (inscriptions on gates, etc.) that add
  nothing devotional and invite dispute.
- **Distances** only when two sources agree; otherwise a range ("about 25–30 km").

## 2. Implement

- Expand `significanceHi/En` (include the sthapana date) and `originStoryHi/En`
  (legend in ~3 sentences).
- `sections` with exactly `sthapana`, `svarup`, `parampara`, `mela`, `yatra` in
  that order. Titles: `मंदिर स्थापना कथा · Sthapana Katha`, `<देवता> का स्वरूप ·
  The Form of <Deity>`, `<signature tradition> · <English>`, `मेले और उत्सव ·
  Melas and Festivals`, `यात्रा और आसपास · Journey and Around`. One prose block
  per language, ≥80 chars, written independently in Hindi and English, dates in
  both calendars, distances marked approx. Drop a section only if sources
  genuinely have nothing, and say so.
- Add sources to `sources[]` (https only — the data test rejects http).
- Do not touch screen or search code; sections render and index automatically.

## 3. Tests and docs

- `mobile/src/data/__tests__/theerth.test.ts`: remove the id from
  `LEGACY_WITHOUT_SECTIONS`, decrement the pinned size by one, add the id to the
  wave pin map (section order + one distinctive fact per language).
- `mobile/src/screens/__tests__/TheerthDetailScreen.test.tsx`: add the id to the
  render-test table with 4–5 hi and en regexes.
- Confirm a distinctive katha term resolves in Search (`runSearch`, verses with
  `sourceId === 'famous-theerth'`).
- design.md §27 item 4 plate list only if you added a plate; RULEBOOK unchanged.

## 4. Verify, commit, push

```
npm run typecheck
npm run lint            # 0 errors
npx tsx --test src/data/__tests__/theerth.test.ts src/data/__tests__/searchIndex.test.ts
npx jest src/screens/__tests__/TheerthDetailScreen.test.tsx src/data/__tests__/backgrounds.coverage.jest.test.ts
```

One commit per temple: `feat(theerth): full <Name> reading — sthapana katha,
form, traditions, melas, yatra`. Reply with a short summary only, listing facts
you could not verify online.

## Queue (remaining after the Rajasthan wave)

Plate exists, text pending: `khandoba-jejuri`, `mahasu-devta-hanol`,
`sabarimala`, `vetrimalai-murugan`. Everything else (Srinathji, the 12
Jyotirlingas, Char Dham, Shakti Peeths, the rest) needs a plate first.
