# Full Puja Vidhi image/text audit — 21 October 2026

Reviewed all 106 published steps across seven vidhis. Updated imagery/sequences for 52 steps. All authored Hindi/English instructions and mantras remain unchanged. Draft visarjan guides are excluded.

35 new saved paintings; 63 selected images resolve through R2. Sources total 20.32 MiB. No step painting is bundled. Existing persistent cache supplies previously downloaded images offline; uncached/unavailable art leaves neutral paper and usable complete instructions.

**Delivery:** R2 wiring and hash manifest are prepared for the user's later push. No upload, CDN availability check, commit, git push or release was performed. The new remote images will appear only after their R2 objects are pushed.

[Open all 106 image/text pairs](full-review.html). `step-review.json` pins the exact bilingual instruction hashes, ordered painting hashes, observed subjects and depiction limits. Tests protect those reviewed pairings; tests cannot recognize flowers or certify ritual correctness.

| Guide | Steps checked | Image/sequence updates |
|---|---:|---:|
| Shri Satyanarayan Puja | 16 | 11 |
| Diwali Lakshmi-Ganesh Pujan | 20 | 15 |
| Ganesh Chaturthi Sthapana | 17 | 8 |
| Navratri Ghatasthapana | 15 | 5 |
| Karwa Chauth Pujan | 12 | 4 |
| Maha Shivaratri Pujan | 16 | 9 |
| Pitru Tila-Tarpana Remembrance | 10 | 0 |

## Flower and leaf choices

- Ganesh: red hibiscus and durva in the explicit durva steps; no tulsi introduced. Ganesh Chaturthi exceptions in some traditions are documented by Drik, so no universal prohibition is added to app copy.
- Lakshmi: pink lotus is the principal offered flower; garland/akshat remain visible. Available seasonal/red-flower alternatives stay in the original text.
- Satyanarayan/Vishnu: lotus/white garland replace generic hibiscus reuse; tulsi stays on the already-authored prasad.
- Shiva: white aak for sankalp/invocation; intact bilva and white datura for the authored leaf/flower step. Shared aarti, dhoop and water scenes are flower-free; no hibiscus, ketaki, champaka or tulsi introduced.
- Durga/Parvati: red flower/hibiscus cue. Navratri kalash ingredients retain the explicitly authored durva inside the kalash; this is not a new direct Durga leaf-offering instruction.
- These are conservative illustrated examples within the existing instructions, not an exhaustive or universal list of favourites/prohibitions. Tradition-specific exceptions remain with family practice.

### Sources opened in this audit

- [Drik: Ganesha puja](https://www.drikpanchang.com/festivals/ganesh-chaturthi/ganesha-chaturthi-puja-vidhi.html?lang=en): asana, garland and durva offering contexts.
- [Drik: 21 Patra](https://news.drikpanchang.com/2013/09/21-patra-for-ganesha-chaturthi.html): durva identity and tradition-specific tulsi exception.
- [Drik: Lakshmi symbols](https://www.drikpanchang.com/hindu-goddesses/lakshmi/lakshmi-symbols/lakshmi-symbols.html?lang=en): lotus offering.
- [Drik: Satyanarayan puja](https://www.drikpanchang.com/hindu-gods/trimurti/lord-vishnu/puja-vidhi/satyanarayan-puja-vidhi.html?lang=en): five-flower asana and flower offering.
- [Sanatan Sanstha: Vishnu worship](https://www.sanatan.org/en/a/88741.html): lotus as a preferred available choice; this source's other claims are not adopted.
- [Kanchi Kamakoti Peetham: Narada Purana, Deva Puja](https://www.kamakoti.org/kamakoti/details/naradapurana12.html): flower distinctions and cloth colours. The non-www host was initially blocked; the www page opened successfully.
- Existing authored Shivaratri instruction explicitly supplies bilva, white flowers and optional datura/aak. No mantra or ritual sequence was rewritten.

## Review limits

The saved compositions and all text/image assignments were reviewed; this is not independent collation of all ritual sources or human liturgical approval. Some images show the named materials or central action, not every conditional act, spoken prayer, singing, application or hand movement. Each such limit is recorded below. No full 106-page native/device/language walkthrough or remote CDN delivery is claimed. Original and final images were inspected; one unsafe incense-touching draft and vessel/flower/mark mismatches in drafts were rejected and corrected.

## Upload handoff

```sh
node scripts/prepare-vidhi-artwork.mjs
node scripts/prepare-vidhi-artwork.mjs --verify
# Later, when pushing the reviewed objects:
node scripts/prepare-vidhi-artwork.mjs --upload --wrangler
node scripts/prepare-vidhi-artwork.mjs --verify --cdn
```

Default staging is local-only. The upload uses the existing uploader; `--cdn` GETs and compares every complete SHA-256. The app manifest is already wired as requested, so deploy only after the objects are uploaded and verified.

## All 106 step checks

### Shri Satyanarayan Puja

| # / step | Image subject checked | Depiction limit |
|---|---|---|
| 1. Prepare the space & place the deity | Cloth is being spread on the chowki. | Shows space preparation; deity placement and cleaning remain in text. |
| 2. Set the kalash & light the lamp | Prepared leafy coconut kalash, then a flower-free ghee-lamp plate. | Both named objects shown; the text explains symbolism. |
| 3. Sankalp (vow) | Right palm holds water, akshat and a pink lotus. | Lotus is a Vishnu-appropriate example; personal names, tithi and water release remain text. |
| 4. Dhyana (meditation) | Seated devotee with folded hands. | Meditative focus; does not invent mantra or deity form. |
| 5. Avahana (invocation) | Cupped hands hold a lotus and akshat before a plate. | White garland is a Vishnu offering; invocation words remain text/mantra. |
| 6. Asana (offering a seat) | Exactly five pink lotus blossoms held in joined palms. | Five visible centres counted; symbolic asana, not a physical chair. |
| 7. Snana (bathing) | Panchamrit poured over a metallic four-armed Vishnu murti in a receiving tray; clean water alongside. | Illustrates the central bath; the water–panchamrit–water order remains in text. |
| 8. Vastra & yajnopavita | Yellow angavastram, loose white yajnopavita and separate mauli. | Includes sacred thread; no person/thread-side convention demonstrated. |
| 9. Gandha & akshat | Beige sandal paste, red roli and white akshat. | Removed unrelated turmeric/sindoor assortment from this step. |
| 10. Pushpa (flowers) | Lotus and akshat offered, complete white flower garland alongside. | Flowers and garland shown; no hibiscus or durva reuse. |
| 11. Dhoop (incense) | One smoking dhoop burner. | Incense only; no lamp or deity-specific flowers added. |
| 12. Dipa (lamp) | Hand holds a brass plate with a ghee lamp. | Shows the named lamp option; no cross-deity flower decoration. |
| 13. Naivedya (food offering) | Panjiri/semolina bowl, banana, fruit and panchamrit with tulsi. | Matches this specific prasad; no generic modak plate. |
| 14. Satyanarayan vrat katha | Open book on a reading stand. | Reading cue only; exact five-chapter katha is provided by the hand-off. |
| 15. Aarti | Ghee lamp on an aarti plate. | Shows the allowed ghee-lamp option; family singing/camphor alternative remain text. |
| 16. Kshama-prarthana & prasad | The same Satyanarayan panjiri, fruit and panchamrit prasad. | Shows correct prasad; circumambulation, prayer and distribution are text instructions. |

### Diwali Lakshmi-Ganesh Pujan

| # / step | Image subject checked | Depiction limit |
|---|---|---|
| 1. Clean the space & prepare the chowki | Hands spread red cloth on a clean chowki. | Shows altar preparation; rangoli and safe lamp spaces remain in text. |
| 2. Place Lakshmi and Ganesha | Ganesh at image left, Lakshmi at image right, coins and account book before them. | Matches the stored household placement instruction; no new direction rule. |
| 3. Achamana & self-purification | Devotee sprinkles clear water toward self and clean vessels. | Self/material purification, not a deity bath; achamana remains text. |
| 4. Sankalp (vow) | Right palm holds water, akshat and lotus. | A suitable flower for the combined worship; personal formula remains text. |
| 5. Set the kalash & light the lamp | Prepared coconut-leaf kalash followed by a flower-free ghee lamp. | Both installation and lamp actions represented; flame supervision remains text. |
| 6. Ganesha dhyana & avahana | Flower/akshat offering hands, followed by a clear-water spoon offering. | Removed later durva scene from invocation; named water upacharas remain symbolic. |
| 7. Ganesha vandana | Folded-hands seated prayer. | The exact Ganesha vandana remains the shipped-text hand-off. |
| 8. Ganesha snana & offerings | Symbolic Ganesh flower-water bath, then durva/hibiscus/akshat with cloth, mauli, chandan and sindoor. | Two original clauses paired with their images; no food/panchamrit ingredient picture. |
| 9. Ganesha naivedya | Sweets, fruit and water, followed by dhoop and ghee lamp. | Both authored clauses represented; modak/laddoo are examples within sweets. |
| 10. Mahalakshmi dhyana & avahana | Pink lotus offered to Maa Lakshmi with akshat. | Lotus replaces the generic hibiscus focus; red-flower alternative remains allowed by text. |
| 11. Lakshmi snana | Metal Lakshmi murti receives panchamrit; separate clay Lakshmi gets a few lotus-water droplets. | These are material-dependent alternatives, explicitly captioned from original text, not two required baths. |
| 12. Vastra & adornment | Folded red cloth/mauli and shringar bowls. | Relevant materials; perfume and each application are not separately demonstrated. |
| 13. Flowers & akshat | Pink lotus and akshat offered to Lakshmi, with a complete flower garland. | Matches lotus/flowers/garland/akshat; no grass or tulsi accidentally substituted. |
| 14. Dhoop & dipa | Smoking dhoop and ghee lamp on a clean stone surface. | No flowers near flame; deity identity and circling action remain text. |
| 15. Naivedya | Distinct kheel, batasha, mithai, dry fruits, fresh fruit and water. | Replaces generic modak/coconut tray; optional family meal remains text. |
| 16. Mahalakshmi prayer | Open book on a stand. | The Mahalakshmi Ashtakam is identified by the hand-off, not generated lettering. |
| 17. Shri Ganesha aarti | Flower-free ghee-lamp aarti plate. | Singing and camphor alternative remain text; no invented flower offering. |
| 18. Mahalakshmi aarti & pushpanjali | Aarti plate, followed by Lakshmi lotus/akshat offering. | Lamp and pushpanjali cues; flowers are also offered to Ganesh as the unchanged text directs. |
| 19. Deepa shloka | Single ghee-lamp aarti plate. | Light salutation; exact Shubham Karoti reading remains the hand-off. |
| 20. Deepmala & forgiveness prayer | A hand sets spaced clay diyas on a stone home ledge. | Deepmala action replaces incense still-life; forgiveness and sharing prasad remain text. |

### Ganesh Chaturthi Sthapana

| # / step | Image subject checked | Depiction limit |
|---|---|---|
| 1. Prepare the shrine and chowki | Red cloth spread over clean chowki. | Illustrates preparation; akshat seat described in text. |
| 2. Prepare the kalash and murti | Covered Ganesh murti beside an unoccupied chowki, with kalash nearby. | No pre-installation bath or exposed bathing action. |
| 3. Sankalp (vow) | Right palm with water, akshat and red hibiscus. | Ganesha-suitable red flower; no tulsi. |
| 4. Avahana & pratishthapana | Hands seat complete Ganesh murti onto white akshat. | Installation replaces the later durva-offering scene; permanent-murti exception remains text. |
| 5. Ganesha vandana | Seated folded-hands prayer. | Exact vandana supplied through hand-off. |
| 6. Asana & padya | Exactly five red hibiscus flowers in joined palms, followed by a little clear-water offering. | Both asana and padya shown; five flower heads counted. |
| 7. Arghya & achamana | Clear water from a brass spoon into a receiving bowl; a separate water pot. | Symbolic arghya/achamana, no milk or unrelated deity. |
| 8. Snana | Clay Ganesh receives a few clear-water droplets from a flower. | Shows the clay-murti option; metal/panchamrit alternative remains conditional in text. |
| 9. Vastra & yajnopavita | Red cloth, mauli and a separate loose white sacred thread. | No tight tying or thread position depicted. |
| 10. Gandha & sindoor | Chandan and coloured powder bowls with akshat. | Matches chandan/ashtagandha, turmeric, roli and sindoor material group; minimal liquid remains text. |
| 11. Flowers & durva | Fresh green durva and red hibiscus offered to Ganesh. | Correct grass and red flower; illustration does not prescribe a blade count; 21 remains conditional in text. |
| 12. Dhoop & dipa | Dhoop and ghee lamp well apart on stone. | No flowers or cloth beside flames; circling remains text. |
| 13. Modak naivedya | Modaks/laddoos, fruit, coconut and clear-water cup. | Matches the explicitly named Ganesh naivedya. |
| 14. Ganesh Chaturthi vrat katha | Open book on a stand. | Exact Ganesh Chaturthi story remains a hand-off. |
| 15. Aarti | Flower-free ghee-lamp aarti plate. | Matches ghee-lamp alternative; exact Jai Ganesh Deva remains a hand-off. |
| 16. Pushpanjali & forgiveness prayer | Flowers and akshat held over a plate. | Red hibiscus is a suitable example for Ganesh; forgiveness remains text. |
| 17. Resolve the daily seva | Ganesh with flower/akshat offering, food and a supervised lamp. | All three daily-seva categories visible; this is worship, not immersion, and permanent-murti warning remains text. |

### Navratri Ghatasthapana

| # / step | Image subject checked | Depiction limit |
|---|---|---|
| 1. Choose the muhurat and place | Panchang celestial/calendar painting. | Timing cue only; actual city/date/night restriction remain text, no invented clock time. |
| 2. Arrange the materials | Unassembled soil, seeds, kalash, water, leaves, coconut, cloth and five offerings. | Preparation replaces an already-sowing-only scene; lamp/incense are unlit. |
| 3. Navratri sankalp | Water, akshat and red flower in right palm. | Devi-appropriate flower; no durva or tulsi offering shown. |
| 4. First layer of soil | Hand spreads grain seeds on the first soil layer. | Unsprouted stage, no finished ghata. |
| 5. Build the grain bed | Soil being layered over seeds, then a few water droplets settle the bed. | Distinct from first sowing; paired original clauses retain layer sequence. |
| 6. Fill the kalash | Kalash filled with clear water; mauli, betel nut, coin, akshat and durva beside it. | These leaves belong to the authored kalash ingredients, not a direct Durga-flower offering; perfume remains text. |
| 7. Arrange leaves and lid | Leaves at kalash mouth and a rice-filled lid/bowl. | Exactly five leaves are the textual instruction; no coconut added prematurely. |
| 8. Prepare the coconut | Whole coconut wrapped with red cloth and tied mauli. | Coconut preparation matches; upright placement remains text. |
| 9. Install the ghata | Hands place prepared wrapped-coconut kalash in the unsprouted grain bed; garland and simple kumkum/chandan dots. | Replaces standalone kalash on a stool; no premature green shoots or Shiva tripundra. |
| 10. Invoke Maa Durga | Red flower and akshat in joined palms. | Devi invocation, no grass or prohibited leaf reuse. |
| 11. Panchopachara puja | Five offering groups: fragrance, flowers, dhoop, diya, fruit/mithai. | All five represented, replacing the former two-item dhoop/deep image. |
| 12. Ya Devi Sarvabhuteshu — Devi stuti | Folded-hands seated prayer. | Exact Ya Devi Sarvabhuteshu text remains the shipped-text hand-off. |
| 13. Navratri opening reading | Open book. | Exact day-one/Shailaputri reading remains the hand-off; no wrong deity artwork. |
| 14. Maa Durga aarti | Flower-free ghee-lamp aarti plate. | Exact Jai Ambe Gauri remains a hand-off. |
| 15. Care through the nine days | Light moistening of living sprouts around the installed kalash. | Correct later growing stage; supervised lamp and tradition-dependent Dashami conclusion remain text. |

### Karwa Chauth Pujan

| # / step | Image subject checked | Depiction limit |
|---|---|---|
| 1. Morning vrat sankalp | Quiet folded-hands prayer. | Sankalp cue; health/custom/moon completion conditions remain text. |
| 2. Prepare the puja altar | Hands cover the chowki with red cloth. | Shows preparation only; Gaura/Chauth Mata and Shiva-family image placement remain text, no unrelated deity shown. |
| 3. Prepare the karwa and thali | Spouted clay karwa with lid, mauli, roli/akshat, fruit and sweets. | Matches the karwa/thali materials; filling with water/milk remains text. |
| 4. Lamp and Ganesha worship | Ganesh receives red flower/akshat with chandan, food and lamp nearby. | Matches the named offerings; no durva or tulsi added to this step. |
| 5. Gaura and Chauth Mata puja | Red flower and akshat held for offering. | Relevant Parvati/Chauth Mata flower cue; roli/sindoor/naivedya remain text. |
| 6. Shiva family worship | Lotus and akshat in an offering palm. | Suitable flower example without reused hibiscus aimed at Shiva; deity order and naivedya remain text. |
| 7. Offer the karwa | Filled decorated spouted karwa and roli/akshat materials. | Relevant vessel offering; Chauth Mata placement/prayer remain text. |
| 8. Karwa Chauth vrat katha | Open book. | The exact Karwa Chauth katha is handed off; prepared karwa/thali remains a text condition. |
| 9. Pass the thali and receive blessings | Two pairs of hands pass a thali; a spouted, lidded karwa nearby. | Actual passing replaces static karwa image; custom remains conditional and no rotation direction is invented. |
| 10. Karwa dana | Hands give a spouted, lidded karwa on folded cloth with dakshina to receiving hands. | Actual donation; no invented caste marker, amount or mandatory recipient. |
| 11. Moon sighting & arghya | Clear water poured as arghya under visible Moon; lamp separated safely. | No sieve shown as mandatory; custom qualifier remains text. |
| 12. Parana & prasad | Hands share prasad; a separate glass of water visible. | Relevant sharing and water cue; receiving/drinking/bowing and health priority remain text. |

### Maha Shivaratri Pujan

| # / step | Image subject checked | Depiction limit |
|---|---|---|
| 1. Prepare for the fast and night puja | Clean folded white kurta and towel with a water pot. | Personal preparation, not deity shringar; removed hibiscus basket. |
| 2. Place the Shiva-linga | Hands place Shiva-linga in a receiving tray. | Correct object and collection tray; no liquids poured over a picture. |
| 3. Shivaratri sankalp | Right palm holds water, akshat and identifiable white aak flower. | Replaces generic red hibiscus; no tulsi/ketaki/champaka. |
| 4. Dhyana & avahana | Hand offers a white aak flower beside the linga. | Flower invocation replaces the unrelated placement action; meditation remains text. |
| 5. Asana, padya & arghya | A little clear water spooned into receiving bowl. | No hibiscus decoration; symbolic seat/flower offering remains text. |
| 6. Water abhisheka | Thin transparent water stream over linga into receiving tray. | Clean-water bath, no milk stream or overflow. |
| 7. Panchamrit abhisheka | Small milky stream over linga into tray. | Actual milk bath replaces ingredient-only picture; curd/ghee/honey/sugar order and shorter alternative remain text. |
| 8. Final clean-water bath | Thin clear-water stream rinses linga into receiving tray. | Distinct from milk/panchamrit image. |
| 9. Chandan & sacred ash | Separate beige chandan and white sacred-ash bowls. | No red kumkum or yellow turmeric applied to linga; exclusion remains text. |
| 10. Bilva leaves & flowers | Intact three-leaflet bilva sprig and recognizable white datura trumpets at linga. | Replaces ambiguous jasmine-like blossoms; optional datura is explicitly allowed by authored text; leaf placement/orientation remains text. |
| 11. Dhoop & dipa | Dhoop and lamp well separated on stone. | No hibiscus or cloth near flame; bilva kept away as text directs. |
| 12. Naivedya | Fruit, plain milk-sweet examples, dry fruits and water. | No modaks or grain pastries implying a vrat recipe; actual fasting ingredients still follow family practice. |
| 13. Panchakshara Shiva japa | Seated folded-hands devotee. | Quiet japa cue; no invented count or generated mantra. |
| 14. Maha Shivaratri vrat katha | Open book on a stand. | Exact Shivaratri katha remains hand-off. |
| 15. Shiva aarti | Flower-free ghee-lamp aarti plate. | No unsuitable flower decoration; exact Om Jai Shiv Omkara remains hand-off. |
| 16. Forgiveness, vigil & parana | Quiet seated prayer. | Forgiveness/vigil cue; optional prahara abhisheka and actual Panchang parana time remain text. |

### Pitru Tila-Tarpana Remembrance

| # / step | Image subject checked | Depiction limit |
|---|---|---|
| 1. Know the scope of this guide | Separate offering and collecting vessels, black sesame and clean cloth. | Flame-free remembrance materials; does not imply complete Shraddha rites. |
| 2. Confirm the date and family practice | Panchang calendar/celestial cue. | No fixed tithi/time/direction introduced. |
| 3. Prepare a clean place | Separate clean vessels and cloth. | Clean place/materials cue; no flame or water body. |
| 4. Set the remembrance intention | Quiet folded-hands remembrance. | No names, gotra formula, ritual thread position or mantra invented. |
| 5. Prepare sesame water | Black sesame added to clean water. | No kusha shown as mandatory. |
| 6. Offer the sesame water | Visible sesame grains in a small stream poured into a separate collecting vessel. | Not plain water; no count/direction/thread rule or portrait. |
| 7. Pause in remembrance | Quiet seated folded-hands devotee. | Reflective pause only, no deity/ancestor portrait. |
| 8. Optional Gita reading — Chapter 15 | Open book on a stand. | Optional exact Gita 15 hand-off; no generated substitute verse. |
| 9. Optional Gita reading — Chapter 2 | Open book on a stand. | Optional exact Gita 2 hand-off; no new mandatory rite. |
| 10. Conclude and clean up | Clean separated vessels and cloth. | Conclusion/cleanup materials cue; disposal method and hygiene remain text. |

