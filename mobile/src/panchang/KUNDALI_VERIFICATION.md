# Kundali engine — external verification

PRD-C keeps Kundali computation pure, offline, and on the existing
`astronomy-engine` + shared Panchang Lahiri path. Swiss Ephemeris is used only
as an independent test oracle; it is not an app dependency or a second runtime
astrology stack.

## Reference

- Swiss Ephemeris 2.10.03 through `pyswisseph==2.10.3.2`
- Official Astrodienst source/data commit
  [`59ac051b5a5812c684973ca0fcedb1c8c3e9c5dc`](https://github.com/aloistr/swisseph/tree/59ac051b5a5812c684973ca0fcedb1c8c3e9c5dc)
- Official `sepl_18.se1` and `semo_18.se1` files for the 1800–2399 range;
  their SHA-256 hashes are pinned in the fixture
- `SIDM_LAHIRI`
- UT calculations through `calc_ut` with `FLG_SWIEPH | FLG_SIDEREAL |
  FLG_SPEED`
- Sidereal Ascendant through `houses_ex`
- Mean lunar node for Rahu; Ketu exactly 180° opposite

The reference choices follow the
[Swiss Ephemeris programming interface](https://www.astro.com/swisseph-download/doc/swephprg.2.10.htm)
and Astrodienst's
[Lahiri sidereal ephemeris](https://www.astro.com/swisseph/sweph_sla_n.htm).

## Corpus

`__tests__/fixtures/kundali-swiss-ephemeris-150.json` is a compact matrix of:

- 15 bundled Indian cities spanning north, south, east, west, central India,
  low/high elevation, and the app's longitude range;
- 10 IST birth instants from 1950 through 2026;
- midnight, morning, noon, evening, near-midnight, leap-day, and year-boundary
  cases.

The Cartesian product is 150 complete charts and 1,350 graha placements. The
fixture stores independent ayanamsa, all graha longitudes and speeds, Lagna for
every city, and Vimshottari birth-balance references.

## Measured result

Run on 24 July 2026:

| Check | Result |
|---|---:|
| Charts | 150 |
| Graha placements | 1,350 |
| Maximum ayanamsa difference | 0.004345° |
| Maximum Lagna difference | 0.009195° |
| Maximum graha-longitude difference | 0.009331° |
| Lagna-rashi mismatches | 0 |
| Graha-rashi mismatches | 0 |
| Nakshatra mismatches | 0 |
| Pada mismatches | 0 |
| Whole-sign-house mismatches | 0 |
| Retrograde-state mismatches | 0 |
| First Mahadasha-lord mismatches | 0 |
| Birth Antardasha-lord mismatches | 0 |
| Maximum first-Mahadasha boundary delta | 4.452 days |

The Dasha date delta is the downstream effect of the maximum sub-0.01°
Moon-longitude difference being projected across a multi-year first
Mahadasha. For every case, the test verifies to within one minute that the date
delta is exactly the delta implied by the independently measured Moon
longitude—not a Vimshottari order, duration, or balance-formula error. The app
must therefore be described as following its documented Lahiri approximation,
not as Swiss-identical to the day.

## Regression bounds

`kundali.swiss-corpus.test.ts` pins tighter limits than the original PRD:

- ayanamsa: 0.005°;
- graha longitude: 0.012°;
- Lagna: 0.012°;
- first Mahadasha boundary against the external Moon reference: 5 days;
- exact equality for rashi, nakshatra, pada, whole-sign house, retrograde
  state, first Mahadasha lord, and birth Antardasha lord.

Do not widen these bounds or replace fixture values with app output. Any
ephemeris, ayanamsa, node, Lagna, or Dasha-policy change requires regenerating
the corpus with the independent script and reviewing the measured differences.

## Reproduce

The fixture generator is `scripts/generate-kundali-swiss-corpus.py`. Its module
docstring contains the isolated Python environment, pinned data-download, and
generation commands. Then run:

```sh
npx tsx --test src/panchang/__tests__/kundali.swiss-corpus.test.ts
npm run test:engine
```

The app never executes Python, Swiss Ephemeris, or network calls.
