# Occasion timing source audit — 6 November 2026

## Scope and result

Reviewed all **53 registered profiles** against Drik Panchang's own festival,
vrat and daily Panchang pages. Sri Mandir's Magha Navratri article independently
agrees on 19 January 2026; it is a date corroboration, not an exact clock source.
This is an independent comparison of Vedansh's calculations with published
references, not two independent publishers verifying every clock.

`mobile/src/panchang/__tests__/fixtures/occasionPublished.ts` records 115
manually transcribed references: **109 clock fixtures / 116 windows**, plus
**six guidance-only cases for the four Ghatasthapana profiles**. Every fixture
runs through the actual date matcher and solver under both Purnimant and
Amanta. Endpoint civil dates must match exactly, including after midnight;
clock differences must be at most three minutes. The measured moonrise
differences after correction are under one minute in the 13 Delhi samples.

The audit tests pass (137 tests). Six withholding checks are NOT passes for
Ghatasthapana's preferred clocks. Do not claim that all 53 profiles have
verified exact muhurats. Reference coverage is mainly New Delhi in 2026, with
2025/2027 boundary cases and the earlier Bengaluru Diwali fixture. It does not
certify every future year, city, DST setting or traditional exception.

## Corrections

1. **After-midday Smarta parana:** end at the end of Aparahna (fourth daylight
   fifth), rather than sunset. The old Yogini 2026 end was 19:21; the published
   end is 16:36. Dev Uthani and both Putrada seasons exercise the same rule.
2. **Shravana Putrada missing:** the two Putrada month rules share an ID.
   Deduplication had retained Pausha only. Match every catalog variant, carry
   the matched rule into the solver, and retain one profile per stable ID.
   August 2026 and January 2027 now both have published parana regressions.
3. **Moonrise convention:** `SearchRiseSet` returned upper-limb/refraction times
   about 4–5 minutes before the Drik clocks. The shared engine now solves
   topocentric Moon centre at geometric altitude zero. This convention is an
   inference tested against all 13 published 2026 Delhi Sankashti events and
   Karwa Chauth; it is not a claim that Drik published its source algorithm.
   No fixed time offset is added. The Panchang, vrat date matcher and occasion
   card read the same result. Persisted day and observance cache versions are
   bumped. Regenerating the Ujjain 2024–2031 table in both systems produced
   no changes, so the generated file is deliberately absent from the diff.
4. **Ghatasthapana:** first-third daylight intersected with Pratipada is only
   a general preference. It did not match Drik's Chaitra preferred windows:
   2026 06:52–07:43 (Meena lagna) and 2027 06:05–07:26. The same page gives
   2025 06:13–10:22, so blindly clipping every year to Meena is also wrong.
   Exact clocks are withheld for all four Navratris until the complete priority
   and exception selection is verified. Guidance remains on app/share/text;
   the compact export says to confirm local timing. No year-specific clocks
   are hardcoded in production.
5. Corrected broken/overgeneral source paths for Janmashtami, Pradosh,
   Ekadashi, Ganesh Jayanti, monthly Shivaratri and the four Navratris.
   Bahula/Bhadwa expose an astronomical moonrise event, not an assertion that
   every regional fast must be broken then. The note now makes this explicit.

## Rule-family comparison

| Profiles / occasions | Published convention compared | Result and boundaries |
| --- | --- | --- |
| Diwali, Dhanteras | Worship tithi ∩ Pradosh ∩ Vrishabha lagna | Reference clocks agree; evening household puja, not shopping or every alternative lagna. |
| Ganesh Chaturthi, Ganesh Jayanti, monthly Vinayaka | Madhyahna ∩ Chaturthi | Annual cases and all 12 monthly 2026 dates agree. |
| Ram Navami | Full Madhyahna on Smarta date | Agrees; do not substitute ISKCON's 27 March date for 26 March 2026. |
| Maha / Masik Shivaratri | Nishita; annual four equal night prahars | Annual five windows and all 12 monthly 2026 dates agree. Shivaratri parana is not implemented. |
| Shastra / Ayudha | Vijay muhurta on the respective Dashami / Navami observance | Both Delhi 20 October 2026 references agree, 13:59–14:45 within tolerance. Regional Mysore/Bengal dates remain distinct. |
| Four Navratri Ghatasthapanas | Pratipada, lagna/yoga preferences and exceptions | Date checked; exact preferred clocks PENDING and withheld. |
| Holika Dahan | Purnima/Pradosh, Bhadra exclusion and shifted evening | 3 March 2026 agrees. Unverified Punchha/Mukha exception years show guidance, not an invented clock. |
| Raksha Bandhan | Bhadra-free Purnima; Aparahna/Pradosh preference | 2025/2026 Delhi clocks agree; preferences do not certify all years' complete available windows. |
| Smarta / Vaishnava Janmashtami | Separate catalog dates, Nishita puja | Split 15/16 August 2025 and shared 4 September 2026 checked. Shared-day Vaishnava row intentionally deduplicated. Janmashtami parana is not implemented. |
| Karwa Chauth | First tenth of night plus Moon event | Both 2026 evening puja and corrected Moon clock agree. Actual sighting remains required by tradition. |
| Sankashti, Sakat, Bahula, Bhadwa | City-specific astronomical chandrodaya | 13 monthly samples plus named siblings agree; no universal regional fasting instruction inferred. |
| Kartik / Chaiti Chhath | Evening sunset and next-day sunrise events | Kartik published calendar and Chaitra daily sky events agree; Chaiti's named festival date is corroborated separately below. |
| Bhai Dooj | Aparahna ∩ Dwitiya | 11 November 2026 reference agrees. |
| Akshaya Tritiya | Forenoon ∩ Tritiya | 19 April 2026 reference agrees; gold purchase periods are separate. |
| Govardhan | Pratahkal ∩ Pratipada | 10 November 2026 reference agrees. |
| Shukla / Krishna Pradosh | Pradosh ∩ Trayodashi | All 25 Delhi 2026 dates agree, including late starts and early tithi endings. |
| 23 named Smarta Ekadashi profile IDs | Actual Dwadashi quarter, morning preference, Aparahna fallback | All IDs represented; two Putrada months; Saphala in January 2027. Vaishnava/Mahadvadashi parana is not inferred. Adhik Padmini/Parama lack profiles in the existing catalog and are outside enabled coverage. |

## Primary reference index

The fixture file gives a per-row URL and exact civil date/clocks. These links
are publisher pages, not an API dependency or a source of production year tables.
Select **New Delhi**, the stated year and local IST before comparing. Unqualified
Drik URLs can render a previously selected/default city; the city heading was
read with the clocks. A page for Washington, Chicago or Chennai was not used
as a Delhi reference.

- [Diwali](https://www.drikpanchang.com/festivals/lakshmipuja/festivals-lakshmipuja-timings.html?year=2026), [Dhanteras](https://www.drikpanchang.com/festivals/dhanteras/festivals-dhanteras-puja-timings.html?year=2026).
- [Monthly Vinayaka](https://www.drikpanchang.com/vrats/vinayaka-chaturthi-dates.html?year=2026), [Ganesh Jayanti](https://www.drikpanchang.com/hindu-gods/ganesha/ganesha-jayanti/ganesha-jayanti-date-time.html?year=2026), [Ram Navami](https://www.drikpanchang.com/dashavatara/rama-navami/rama-navami-date-time.html?year=2026).
- [Maha Shivaratri](https://www.drikpanchang.com/festivals/maha-shivaratri/maha-shivaratri-date-time.html?year=2026), [monthly Shivaratri](https://www.drikpanchang.com/vrats/masik-shivaratri-dates.html?year=2026), [Pradosh](https://www.drikpanchang.com/vrats/pradoshdates.html?year=2026).
- [Ayudha](https://www.drikpanchang.com/navratri/durga-puja/ayudha-puja-date-time.html?year=2026), [Vijayadashami](https://www.drikpanchang.com/festivals/vijayadashami/vijayadashami-date-time.html?year=2026).
- [Holika](https://www.drikpanchang.com/festivals/holi/festivals-holika-dahan-timings.html?year=2026), [Rakhi](https://www.drikpanchang.com/festivals/raksha-bandhan/raksha-bandhan-date-time.html?year=2026), [Janmashtami](https://www.drikpanchang.com/dashavatara/lord-krishna/krishna-janmashtami-date-time.html?year=2025), [ISKCON](https://www.drikpanchang.com/iskcon/lord/krishna-janmashtami-date-time.html?year=2026).
- [Karwa Chauth](https://www.drikpanchang.com/festivals/karwa-chauth/karwa-chauth-date-time.html?year=2026), [Sankashti moonrise](https://www.drikpanchang.com/vrats/sankashti-chaturthi-dates.html?year=2026).
- [Chhath calendar](https://www.drikpanchang.com/chhath/chhath-puja-calendar.html?year=2026), [24 March sky](https://www.drikpanchang.com/panchang/day-panchang.html?date=24/03/2026), [25 March sky](https://www.drikpanchang.com/panchang/day-panchang.html?date=25/03/2026). Chaiti named date corroboration: [Times of India](https://timesofindia.indiatimes.com/chaiti-chhath-puja-date-timings-and-significance/articleshow/98094277.cms), 24 March evening / 25 March dawn; this is secondary date support, not a Drik/Sri Mandir named-date confirmation.
- [Bhai Dooj](https://www.drikpanchang.com/festivals/bhai-dooj/bhai-dooj-date-time.html?lang=en), [Akshaya Tritiya](https://www.drikpanchang.com/festivals/akshaya-tritiya/akshaya-tritiya-date-time.html?year=2026), [Govardhan](https://www.drikpanchang.com/festivals/govardhan-puja/govardhan-puja-date-time.html?year=2026).
- [Ekadashi dates](https://www.drikpanchang.com/vrats/ekadashidates.html?year=2026); the individual Ekadashi pages (linked per fixture) provide parana clocks. In particular [Yogini](https://www.drikpanchang.com/ekadashis/yogini/yogini-ekadashi-date-time.html?year=2026), [Shravana Putrada](https://www.drikpanchang.com/ekadashis/putrada/shravana-putrada-ekadashi-date-time.html?year=2026), [Pausha Putrada](https://www.drikpanchang.com/ekadashis/putrada/pausha-putrada-ekadashi-date-time.html?year=2027), [Dev Uthani](https://www.drikpanchang.com/ekadashis/prabodhini/prabodhini-ekadashi-date-time.html?year=2026).
- [Chaitra 2025](https://www.drikpanchang.com/navratri/chaitra-navratri-ghatasthapana.html?year=2025), [2026](https://www.drikpanchang.com/navratri/chaitra-navratri-ghatasthapana.html?year=2026), [2027](https://www.drikpanchang.com/navratri/chaitra-navratri-ghatasthapana.html?year=2027); [Sharad](https://www.drikpanchang.com/navratri/shardiya-navratri-ghatasthapana.html?year=2026), [Ashadha](https://www.drikpanchang.com/navratri/ashadha/ashadha-gupta-navratri-ghatasthapana.html?year=2026), [Magha](https://www.drikpanchang.com/navratri/magha/magha-gupta-navratri-ghatasthapana.html?time-format=24hour&year=2026), [Sri Mandir Magha date](https://www.srimandir.com/en/articles/vrat-prav-tyohar/Magha%20Navratri).

## Acceptance boundaries

Native iOS run 42199255156 failed waiting for Maestro's iOS driver during the
Settings preflight; no installed Vedansh screenshot/export pass is established.
Required native acceptance remains pending. PR #627 must not be described as
ready to merge. PR #627 was merged during the audit (6dfc9fc); the attempted
draft conversion was denied because that PR is closed. These corrections
belong in a separate draft follow-up based on current main dcb52fa.
The generated single-occasion design variants are concepts, not shipped UI or
evidence of native layout fidelity.
