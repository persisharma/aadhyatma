# PRD-23 — भोग · नैवेद्य · व्रत भोजन

| | |
|---|---|
| **Status** | All product phases implemented 2026-08-26 — 39 verified profiles cover every genuine vrat/upavas rule (68/68), with ritual-calendar taxonomy corrected; full regression and device gates recorded below |
| **Parent** | [2026 Q4 candidates — PRD-23](../2026-Q4-candidates.md#prd-23--भोग--नैवेद्य--व्रत-भोजन--what-to-offer-what-to-eat-what-never-to-offer) |
| **T-shirt size** | M — small offline data/surface change; source review is the principal cost |
| **Delivery** | OTA-safe TypeScript/data only; no native dependency, network, account, or engine/cache change |

## 1. Problem and outcome

The app already tells a devotee when a vrat occurs, how the fast is kept, when parana falls, and—where published—how to perform the puja. It did not answer the household question that connects those facts: **what may be eaten, what is offered, what should not be offered, and what is needed from the kitchen**.

PRD-23 adds one source-reviewed content family that keeps four concepts separate:

1. deity/festival **naivedya**;
2. food **permitted during the fast**;
3. food **abstained during the fast**;
4. a **parana meal** after the fast.

An abhisheka ingredient is not automatically a drink or naivedya, and food permitted to a fasting person is not automatically fit to offer. The data model and tests preserve those distinctions.

## 2. Product principles

- **Traditional practice, not nutrition advice.** Copy makes no detox, cure, weight, or health claim.
- **Family and sampradaya variance is content.** A common regional form is named as such; it is never promoted to a universal command.
- **Simple offerings remain valid.** The feature does not turn devotion into an expensive shopping list.
- **No editorial state in customer UI.** Draft, verified, review, source, and release metadata remain private.
- **Offline and local.** All guidance is bundled. Grocery checks reuse the existing occurrence-scoped Vidhi checklist store.

## 3. Phased scope shipped

### Phase 1 — core household journeys (2026-08-25)

Ten verified profiles cover the highest-use v1 set:

| Profile | Observance / Vidhi coverage | Principal guidance |
|---|---|---|
| `ekadashi-food` | Ekadashi family except Nirjala | fruit-fare, grains/beans abstained, Dwadashi parana |
| `nirjala-ekadashi-food` | Nirjala Ekadashi | strict waterless form, traditional leniency, Dwadashi parana |
| `ganesha-bhog` | Ganesh Chaturthi, Sankashti, Vinayaka; Ganesh Sthapana Vidhi | modak/laddoo, fruit/coconut, durva, ordinary Tulsi restriction and festival exception |
| `maha-shivaratri-bhog` | Maha Shivaratri; Shiva Puja Vidhi | fruit/bilva, vigil food distinction, ketaki/champaka restriction, abhisheka distinction |
| `janmashtami-bhog` | Janmashtami | simple sattvik bhog, fruit/root/milk fast, Vaishnava/Smarta parana difference |
| `navratri-bhog` | Navratri start; Ghatasthapana Vidhi | common North Indian vrat staples, rock salt, Kanya Pujan prasad |
| `karwa-chauth-bhog` | Karwa Chauth; Karwa Chauth Vidhi | pre-dawn sargi, sunrise-to-moonrise strict form, water-first parana |
| `diwali-lakshmi-bhog` | Diwali; Lakshmi-Ganesha Vidhi | fruit/sweets and common North Indian khil-batasha form |
| `satyanarayan-bhog` | Purnima/Satyanarayan; Satyanarayan Vidhi | sheera/panjiri or regional rava-kesari form, fruit/Tulsi, prasad first |
| `hanuman-jayanti-bhog` | Hanuman Jayanti | laddoo or household sweet, fruit/coconut; regional Anjaneya butter/vada/payasam/aval variants |

### Phase 2 — recurring and named annual vrats (2026-08-26)

Phase 2 adds directly sourced profiles for Hartalika Teej, Rishi Panchami, Durva Ashtami, Anant Chaturdashi, Kojagara, Ahoi Ashtami, Chhath, Akshaya Navami, both Pradosh fortnights, both Dwadashi fortnights, Masik Shivaratri, Sawan Somwar, Amavasya, Skanda Sashti, Masik Durgashtami, Masik Kalashtami, Masik Krishna Janmashtami, Mangala Gauri, Varalakshmi, Vat Savitri, Jivitputrika, and Mahalakshmi Vrat.

### Phase 3 — advanced catalogue and regional variance (2026-08-26)

Phase 3 covers Mahadwadashi and ISKCON Ekadashi through the adjudicated Ekadashi profile, Sakat Chauth through the Ganesha/Sankashti profile, and adds dedicated profiles for Purushottam Maas, Chaturmasa, weekday deity/navagraha fasts, Dashavatara Vrat, Gangaur, Jayaparvati, Ashoka Ashtami, Asha Dashami, Shitala Saptami, and Bachh Baras.

Three advanced rows had been incorrectly counted as fasting content because the catalogue helper defaulted them to `vrat`: `chandra-darshan`, `ishti-anvadhan`, and `shraddha-dates`. Chandra Darshan and Ishti/Anvadhan are now classified as ritual-calendar festivals and do not receive invented fasting menus. Shraddha is also correctly classified as ritual-calendar content, but it retains the independently sourced `pitru-offering` profile for tarpana, pinda, and food-offering distinctions.

The completion invariant is now executable: every rule whose category is genuinely `vrat` or `upavas` must carry a `bhogId`, and that id must resolve through the verified-only accessor. Current result: **68/68**.

## 4. Source method and adjudication

Every verified profile has at least two independent published URLs and a dated verification note. Preference order was: government cultural publications, temple or sampradaya institutions, published procedural references, and scripture/translation where a prohibition needed textual support. A source may establish only the claim it actually supports; two sources on the festival generally do not authorize an unrelated food rule.

The phase 1 dossier uses these source groups:

- **Ekadashi / Nirjala:** DrikPanchang food, vidhi and parana pages; ISKCON Bangalore Ekadashi guidance.
- **Ganesha:** Government of India Ministry of Tourism; Siddhivinayak Devsthan; Shree Siddhivinayak Ganapati Mandir Trust.
- **Shivaratri:** Ministry of Tourism; DrikPanchang; *Satsangi Jivan* and *Shiva Purana* translations for the flower restriction.
- **Janmashtami:** ISKCON Bangalore vrata manual; Ministry of Tourism Janmashtami and Mathura food pages.
- **Navratri:** Government of India NCHMCT *Indian Food Heritage*; Akashvani; Ministry of Tourism Utsav.
- **Karwa Chauth:** DrikPanchang and Ministry of Tourism.
- **Diwali:** DrikPanchang Lakshmi Puja samagri and Chinmaya Mission puja guide.
- **Satyanarayan:** DrikPanchang and two published Hindu temple/community puja sheets.
- **Hanuman Jayanti:** Ministry of Tourism temple pages, ISKCON Bangalore, Sree Hanuman Swamy Temple Pangode, and DrikPanchang.

The phase 2/3 dossier adds government tourism and cultural publications, Census/Gazetteer records, TTD and established temple/sampradaya publications, and published procedural references. The highest-risk distinctions are pinned in copy and tests:

- Chhath separates Kharna’s single prasad meal, the following waterless period, arghya offerings, and Usha-Arghya parana.
- Kojagara names Maharashtrian rice/coconut and milk/kheer forms without applying either to every Lakshmi tradition.
- Jivitputrika names Bihar-area Nahai-Khai and parana dishes as regional, not universal.
- Chaturmasa’s ingredient exclusions are explicitly labelled BAPS practice; no cross-sampradaya master prohibition list is claimed.
- Weekday fasts refuse a fabricated universal planet-colour-food matrix.
- Shraddha keeps tarpana, pinda, feeding others, and the performer’s meal discipline separate.
- Shitala and Bachh Baras explicitly name their regional scope.

### Corrections made during source review

- The candidate brief said **“Tulsi not plucked on Ekadashi.”** The reviewed Vaishnava sources commonly attach the no-plucking rule to Dwadashi, while another procedural source gives a broader Ekadashi leaf rule. The app does not ship a universal claim.
- The candidate brief said **“no durva outside Ganesha puja.”** The review did not establish a universal prohibition, so it is not shipped.
- Ordinary Ganesha worship sources say not to offer Tulsi, while some Ganesh Chaturthi procedures state a festival-day exception. The entry states both rather than erasing the disagreement.
- Milk, curd, ghee, honey, and sugar in the Shivaratri procedure are identified as **abhisheka materials**; they are not silently recast as a required drink or food offering.
- The candidate named **boondi/besan laddoo and gur-chana** for Hanuman Jayanti. Stronger government, temple, and sampradaya sources established laddoo, simple fruit/coconut, and distinct North/South temple forms, but not those recipes as universal rules; the shipped copy was narrowed accordingly.
- Chhapan bhog and large thalis are never requirements; simple available sattvik offerings remain explicit.

## 5. Data and release gate

`BhogContentEntry` contains bilingual titles and rows, observance/Vidhi hooks, separate offerings/permitted/abstained/do-not-offer collections, optional parana text, a required tradition note, optional additive groceries, `status`, and private source metadata.

`getBhogContent` and `getBhogForVidhi` return **verified entries only**. Draft and unknown entries both resolve to `null`, so screens cannot leak a placeholder or editorial status. A module-scope invariant and `bhogContent.test.ts` pin unique ids, bilingual content, independent domains, dated verification, bidirectional hooks, the draft filter, and the separation of eating/offering/abhisheka claims.

## 6. Surfaces

### Observance Detail

A verified `bhogId` adds a final, independent **भोग · नैवेद्य · भोजन / Offerings & food** block. It does not alter the existing Upvas/Vidhi four-state “How to observe” contract. The shared read-only panel presents only applicable sections: Offer, During the fast, Avoid during the fast, Do not offer, Parana meal, and the tradition note.

### Vidhi preparation

`VidhiDetailScreen` resolves any verified profile linked to the Vidhi and shows the same guidance above the samagri summary. Additive kitchen items render in a separate **Bhog & kitchen shopping** ledger so groceries do not masquerade as ritual samagri.

Grocery check keys use `bhog:<profile>:<item>` inside the existing `{vidhi, occurrence-date}` checklist record. They persist and share with the list, but do not change the samagri progress numerator or denominator.

## 7. Non-goals

- Recipes, quantities for feeding groups, calorie/nutrition information, medical fasting advice, commerce, delivery, and ingredient substitution engines.
- A universal “Hindu menu” that erases family, region, or sampradaya practice.
- Replacing the Upvas fast-window/parana engine or the Vidhi samagri list.
- Rendering citations or content-review state to customers.

## 8. Acceptance and release gates

- [x] Thirty-nine profiles carry bilingual content and two or more independent source domains.
- [x] All 68 genuine vrat/upavas rules resolve to verified guidance; the three ritual-calendar rows are correctly classified.
- [x] Draft profiles are invisible through both accessors.
- [x] Observance and Vidhi hooks round-trip without dangling ids.
- [x] Offerings, fast food, abstentions, prohibitions, and abhisheka materials remain distinct.
- [x] Observance Detail and Vidhi preparation render verified content only.
- [x] Grocery checks persist per Vidhi occurrence and do not change samagri progress.
- [x] Shared list includes the kitchen section without exposing provenance.
- [x] Typecheck, engine/content tests, focused screen tests, full Jest/data/lint checks pass.
- [x] Run `mobile/.maestro/vidhi-smoke.yaml` on iOS for the all-phases bundle.
- [ ] Run the same all-phases bundle on Android; report it independently from the 2026-08-25 v1 Android pass.

Green automation confirms the implementation and pinned source metadata; it does not replace future human review when a profile changes.

### 2026-08-25 verification record

- Registry audit: 10/10 profiles are verified, with 31 published reference URLs across 15 domains; every profile has at least two independent source domains and a dated adjudication note.
- `npm test` passed end to end: TypeScript, 25 widget tests, 163/163 Jest suites (1,217/1,217 tests), 303/303 engine tests, and 75/75 data tests.
- ESLint completed with zero errors and 118 existing warnings. Wiki ingest and lint completed with no orphan or dead links, duplicate subsystem, current `needs-review` page, or contradiction marker.
- **iOS 26.4:** the native development build installed with zero errors and zero warnings; `mobile/.maestro/vidhi-smoke.yaml` passed through the PRD-23 guidance, independent kitchen/samagri checked states, Puja phases, conduct paging, back navigation, and language restoration.
- **Android 16 / API 36:** the release APK built successfully with the current worktree bundle embedded, installed on `vedansh_test`, and the same Maestro flow passed all PRD-23 assertions and cleanup. Network was disabled after install so an OTA or unrelated Metro server could not substitute a different bundle.

### 2026-08-26 all-phases verification record

- Registry audit: 39/39 profiles are verified, with 108 published reference URLs across 50 domains; every profile has at least two independent source domains and a dated adjudication note.
- Coverage audit: 68/68 rules classified as `vrat` or `upavas` carry a verified, exposed `bhogId`; no eligible rule is missing content.
- Taxonomy audit: Chandra Darshan, Ishti/Anvadhan, and Shraddha Dates are ritual-calendar records rather than fasting categories. Shraddha still exposes sourced ancestor-offering guidance.
- `npm test` passed end to end against the merged `main`, including typecheck, 25 widget tests, 304/304 engine tests and 77/77 data/content tests. ESLint completed with zero errors (118 pre-existing warnings), and wiki lint found no dead wikilinks.
- **iOS 26.4:** a fresh bundle from this worktree passed `mobile/.maestro/vidhi-smoke.yaml` end to end on iPhone 17 Pro. The first attempt lost the XCUITest driver connection during launch; the clean retry passed every app assertion and cleanup step.
- **Android:** the 2026-08-25 v1 release bundle passed on Android 16/API 36, but the all-phases bundle has not been rerun because this workspace has no Android SDK/device. This remains a separate release gate; static coverage and the iOS pass do not substitute for it.
