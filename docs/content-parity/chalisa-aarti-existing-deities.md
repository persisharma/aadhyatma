# Chalisa and Aarti content parity — existing deities only

Research snapshot: **2026-07-31** · status updated **2026-10-15**

## Scope

This is the acquisition manifest for the Chalisa and Aarti gaps identified against
the [VastuCart Stotra collection](https://stotra.vastucart.in/stotra). The
competitor is used only to define the parity set. It is **not** an approved source
for Aadhyatma's base text, transliteration, meanings, or editorial copy.

The manifest deliberately maps every item to one or more of Aadhyatma's existing
21 deity ids. It does not add a deity, icon, hub, background, or category.

Status legend:

- **2C** — two independent source candidates are captured. The text may enter
  line-by-line collation, but is not yet ship-ready.
- **1C** — only one acceptable source candidate is captured. A second source is
  required.
- **HOLD** — identity, variant, provenance, or copyright requires a human
  editorial decision before transcription.

The two Khatu Shyam rows (`khatu-shyam-chalisa`, `khatu-shyam-aarti`) are wired into the reader (October 2026), the two Lakshmi rows ship in 1.5.0, and Shani Aarti plus Marathi Dattatreya Aarti are marked **SHIPPED** in 1.5.2. The maintainer accepted the Khatu Shyam rows on one supplied source (RULEBOOK §11.1 exception), so their second-source collation is still pending. RULEBOOK §10 still requires a complete two-source
comparison, source metadata, clean romanization, and per-verse Hindi and English
meanings before reader integration.

## Chalisas

| Proposed id | Display title | Existing deity id(s) | Identity anchor | Source candidates | Status / editorial note |
|---|---|---|---|---|---|
| `annapurna-chalisa` | अन्नपूर्णा चालीसा · Annapurna Chalisa | `parvati` | `विश्वेश्वर-पदपद्म की, रज निज शीश लगाय` | [DrikPanchang](https://www.drikpanchang.com/lyrics/chalisa/annapurna-mata/annapurna-mata-chalisa.html?lang=hi) · [Pavitra Granth](https://pavitragranth.com/chalisa/shree-annapurna-chalisa) | **2C** — collate spelling and stanza boundaries. |
| `dattatreya-chalisa` | दत्तात्रेय चालीसा · Dattatreya Chalisa | `dattatreya` | `दत्तगुरु के चरणों में, मेरा कोटि प्रणाम` | [Sri Mandir](https://www.srimandir.com/articles/chalisa/dattatreya-chalisa) · [Servpuja](https://www.servpujastore.in/pages/dattatreya-chalisa) | **HOLD** — recent sources need provenance; confirm the same complete composition and named author/edition. |
| `ganga-chalisa` | गंगा चालीसा · Ganga Chalisa | `ganga` | `जय जय जय जग पावनी, जयति देवसरि गंग` | [DrikPanchang](https://www.drikpanchang.com/lyrics/chalisa/ganga-mata/ganga-mata-chalisa.html?lang=hi) · [HinduNidhi](https://hindunidhi.com/deities/ganga/) · [Pavitra Granth](https://pavitragranth.com/chalisa/shree-ganga-chalisa) | **2C** — use the direct Ganga Chalisa text inside HinduNidhi's deity page. |
| `gauri-chalisa` | गौरी चालीसा · Gauri Chalisa | `parvati` | To be fixed after variant review | [HinduNidhi](https://hindunidhi.com/shri-gauri-maa-chalisa-hindi/) | **HOLD** — first prove it is distinct from Parvati Chalisa and obtain a second source. |
| `kali-chalisa` | काली चालीसा · Kali Chalisa | `kali` | `जय काली जगदम्ब जय, हरनि ओघ अघ पुंज` | [DrikPanchang](https://www.drikpanchang.com/lyrics/chalisa/kali-mata/kali-mata-chalisa.html?lang=hi) · [Pavitra Granth](https://pavitragranth.com/chalisa/maa-kali-chalisa) | **2C** — multiple Kali/Mahakali versions exist; retain this opening-line identity. |
| `khatu-shyam-chalisa` | खाटू श्याम चालीसा · Khatu Shyam Chalisa | `krishna` | `श्री गुरु चरण ध्यान धर, सुमिरि सच्चिदानन्द` | [DrikPanchang](https://www.drikpanchang.com/lyrics/chalisa/shri-shyam/shri-shyam-chalisa.html?lang=hi) · [HinduNidhi](https://hindunidhi.com/khatu-shyam-chalisa-hindi/) · [Pavitra Granth](https://pavitragranth.com/chalisa/shree-shyam-chalisa) | **WIRED · collation pending** — shipped as `khatu-shyam-chalisa` (42 verses) from maintainer-supplied text on 2026-10-11; tag `krishna`, no separate Shyam deity. The BhaktiBharat "Khatu Dham Sikar" chalisa is a different, longer composition; keep it out. Clear the JSON's `canonicalEditionStatus` by collating against two of these pages. |
| `kubera-chalisa` | कुबेर चालीसा · Kubera Chalisa | `kubera` | `जैसे अटल हिमालय, और जैसे अडिग सुमेर` | [DrikPanchang](https://www.drikpanchang.com/lyrics/chalisa/lord-kubera/shri-kubera-chalisa.html?lang=hi) · [Pavitra Granth](https://pavitragranth.com/chalisa/shree-kuber-chalisa) | **2C** |
| `lakshmi-chalisa` | लक्ष्मी चालीसा · Lakshmi Chalisa | `lakshmi` | `मातु लक्ष्मी करि कृपा, करो हृदय में वास` | [DrikPanchang](https://www.drikpanchang.com/lyrics/chalisa/lakshmi-mata/lakshmi-mata-chalisa.html?lang=hi) · [Sanskrit Documents](https://sanskritdocuments.org/doc_z_otherlang_hindi/laxmi40.pdf) · [Pavitra Granth](https://pavitragranth.com/chalisa/shree-lakshmi-chalisa) | **SHIPPED 1.5.0** — recovered verbatim from the 2026-06-23 collation (Drik Panchang, Bhakt Vatsal, Brahma Bhakti, SanskritDocuments) on the unmerged Phase-1 branch. Ramdas recension: Doha + Sortha, 39 chaupais, 2 closing dohas; not padded to 40. |
| `lakshminarayan-chalisa` | लक्ष्मीनारायण चालीसा · Lakshminarayan Chalisa | `vishnu`, `lakshmi` | To be fixed after variant review | No acceptable independent pair found | **HOLD** — prove it is distinct from Vishnu Chalisa before adding. |
| `kartikeya-chalisa` | कार्तिकेय चालीसा · Kartikeya Chalisa | `kartikeya` | Variant-dependent | [Sri Mandir](https://www.srimandir.com/articles/chalisa/kartikeya-chalisa) · [Pavitra Granth](https://pavitragranth.com/chalisa/shree-kartikeya-chalisa) | **HOLD** — the sources publish different compositions/openings. Select an attributed traditional edition first. |
| `narasimha-chalisa` | नरसिंह चालीसा · Narasimha Chalisa | `narasimha` | `मास वैशाख कृतिका युत, हरण मही को भार` | [DrikPanchang](https://www.drikpanchang.com/lyrics/chalisa/lord-narasimha/narasimha-chalisa.html?lang=hi) · [Pavitra Granth](https://pavitragranth.com/chalisa/shree-narsingh-chalisa) | **2C** |
| `parvati-chalisa` | पार्वती चालीसा · Parvati Chalisa | `parvati` | `जय गिरि तनये दक्षजे, शम्भु प्रिये गुणखानि` | [DrikPanchang](https://www.drikpanchang.com/lyrics/chalisa/parvati-mata/parvati-mata-chalisa.html?lang=hi) · [Pavitra Granth](https://pavitragranth.com/chalisa/shree-parvati-chalisa) | **2C** |
| `radha-chalisa` | राधा चालीसा · Radha Chalisa | `radha` | Fix to the Drik/Pavitra shared opening during collation | [DrikPanchang](https://www.drikpanchang.com/lyrics/chalisa/shri-radha/shri-radha-chalisa.html?lang=hi) · [Pavitra Granth](https://pavitragranth.com/chalisa/shree-radha-chalisa) | **2C** |
| `santoshi-mata-chalisa` | संतोषी माता चालीसा · Santoshi Mata Chalisa | `durga` | `श्री गणपति पद नाय सिर, धरि हिय शारदा ध्यान` | [DrikPanchang](https://www.drikpanchang.com/lyrics/chalisa/santoshi-mata/santoshi-mata-chalisa.html?lang=hi) · [Ved Puran scan](https://vedpuran.net/wp-content/uploads/2021/05/santoshi-maa-chalisa.pdf) | **2C** — other sites publish a different opening; keep this composition isolated. |
| `satyanarayan-chalisa` | सत्यनारायण चालीसा · Satyanarayan Chalisa | `vishnu` | To be fixed after variant review | [Bhakti Pulse](https://www.bhaktipulse.com/post-96.html) | **HOLD** — only one weak source found; check whether it is merely Vishnu Chalisa retitled. |
| `shani-chalisa` | शनि चालीसा · Shani Chalisa | `shani` | `जयति जयति शनिदेव दयाला` | [DrikPanchang](https://www.drikpanchang.com/lyrics/chalisa/lord-shani/other/shani-dev-chalisa.html?lang=hi) · [Sanskrit Documents](https://sanskritdocuments.org/doc_z_otherlang_hindi/shani40.html) · [Pavitra Granth](https://pavitragranth.com/chalisa/shree-shani-chalisa) | **2C** — strongest first-batch candidate. There is also a second Shani Chalisa; do not merge versions. |
| `shrinathji-chalisa` | श्रीनाथजी चालीसा · Shrinathji Chalisa | `krishna` | Unresolved | No acceptable public-domain text pair found | **HOLD** — search results point to commercial recordings with named modern lyricists. Obtain permission or a clearly public-domain temple edition. |
| `surya-chalisa` | सूर्य चालीसा · Surya Chalisa | `surya` | `कनक बदन कुण्डल मकर, मुक्ता माला अंग` | [DrikPanchang](https://www.drikpanchang.com/lyrics/chalisa/lord-surya/surya-deva-chalisa.html?lang=hi) · [HinduNidhi](https://hindunidhi.com/shri-surya-dev-chalisa-hindi/) · [Pavitra Granth](https://pavitragranth.com/chalisa/shree-surya-chalisa) | **2C** — strongest first-batch candidate. |
| `vaishno-devi-chalisa` | वैष्णो देवी चालीसा · Vaishno Devi Chalisa | `durga` | `गरुड़ वाहिनी वैष्णवी, त्रिकुटा पर्वत धाम` | [DrikPanchang](https://www.drikpanchang.com/lyrics/chalisa/vaishno-mata/vaishno-mata-chalisa.html?lang=hi) · [HinduNidhi](https://hindunidhi.com/mata-vashno-devi-chalisa-hindi/) · [Pavitra Granth](https://pavitragranth.com/chalisa/shree-vaishno-chalisa) | **2C** — tag `durga`; no Vaishno deity id. |
| `vindhyeshwari-chalisa` | विन्ध्येश्वरी चालीसा · Vindhyeshwari Chalisa | `durga` | `नमो नमो विन्ध्येश्वरी, नमो नमो जगदम्ब` | [Sanskrit Documents](https://sanskritdocuments.org/doc_devii/vindhyeshvarIchAlIsA.html) · [HinduNidhi](https://hindunidhi.com/vindhyeshvari-chalisa-hindi/) · [Sri Mandir](https://www.srimandir.com/articles/chalisa/vindhyeshwari-chalisa) | **2C** — strongest first-batch candidate. |

Chalisa status: **12 `2C`, 6 `HOLD`, 1 `WIRED · collation pending`, 1 `SHIPPED`**.

## Aartis

| Proposed id | Display title | Existing deity id(s) | Identity anchor | Source candidates | Status / editorial note |
|---|---|---|---|---|---|
| `badrinath-aarti` | बद्रीनाथ आरती · Badrinath Aarti | `vishnu` | `जय जय श्री बदरीनाथ जयति योग ध्यानी` | [DrikPanchang](https://www.drikpanchang.com/lyrics/aarti/lord-narayan/lord-badarinatha-aarti.html?lang=hi) | **1C** — obtain a Badrinath temple/trust or second established source. |
| `banke-bihari-aarti` | बाँके बिहारी आरती · Banke Bihari Aarti | `krishna` | `श्री बाँकेबिहारी तेरी आरती गाऊँ` | [DrikPanchang](https://www.drikpanchang.com/lyrics/aarti/lord-krishna/shri-banke-bihari-aarti.html?lang=hi) · [HinduNidhi](https://hindunidhi.com/bankebihari-aarti-hindi/) | **2C** — distinct from the existing Aarti Kunj Bihari Ki. |
| `dattatreya-aarti` | दत्तात्रेय आरती · Dattatreya Aarti | `dattatreya` | `त्रिगुणात्मक त्रैमूर्ति दत्त हा जाणा` | [Hindu Janajagruti](https://www.hindujagruti.org/hindi/hinduism/hindu-gods/dattatreya/shri-dattas-arati) · [BhajanUSA](https://www.bhajanusa.com/bhajans/trigunatmaktrimurtidatta/) · [Sanatan Sanstha](https://www.sanatan.org/en/a/129.html) · [Sanskrit Documents Marathi Aarti collection, not collated](https://sanskritdocuments.org/marathi/documents/maaratii.pdf) | **SHIPPED 1.5.2** — Sant Eknath's Marathi aarti; 18 lines, four stanzas and a refrain. Three HTML hosts checked on 2026-10-15; the PDF has no extractable text and is not cited as a checked edition in the JSON. |
| `dwarkadhish-aarti` | द्वारकाधीश आरती · Dwarkadhish Aarti | `krishna` | `जय द्वारकाधीश हरे, प्रभु जय द्वारकाधीश हरे` | No acceptable source outside the parity site found | **HOLD** — do not transcribe the competitor's unattributed composition. |
| `ganga-aarti` | गंगा आरती · Ganga Aarti | `ganga` | `ॐ जय गंगे माता, मैया जय गंगे माता` | [DrikPanchang](https://www.drikpanchang.com/lyrics/aarti/ganga-mata/ganga-mata-aarti.html?lang=hi) · [HinduNidhi](https://hindunidhi.com/deities/ganga/) | **2C** |
| `kali-aarti` | काली आरती · Kali Aarti | `kali` | `मंगल की सेवा, सुन मेरी देवा` | [DrikPanchang](https://www.drikpanchang.com/lyrics/aarti/kali-mata/mahakali-mata-aarti.html?lang=hi) · [HinduNidhi](https://hindunidhi.com/shri-kali-mata-ki-aarti-hindi/) | **2C** — HinduNidhi also labels it a bhajan; retain the Aarti identity used by Drik. |
| `khatu-shyam-aarti` | खाटू श्याम आरती · Khatu Shyam Aarti | `krishna` | `ॐ जय श्री श्याम हरे, बाबा जय श्री श्याम हरे` | [DrikPanchang](https://www.drikpanchang.com/lyrics/aarti/shyam-baba/shyam-baba-aarti.html?lang=hi) · [BhaktiBharat](https://www.bhaktibharat.com/aarti/shri-khatu-shyam-ji-ki-aarti) | **WIRED · collation pending** — shipped as `khatu-shyam-aarti` (8 verses) from maintainer-supplied text on 2026-10-11; tag `krishna`, no new Shyam deity. Clear the JSON's `canonicalEditionStatus` by collating against both pages. |
| `lakshmi-aarti` | लक्ष्मी आरती · Lakshmi Aarti | `lakshmi` | `ॐ जय लक्ष्मी माता, मैया जय लक्ष्मी माता` | [DrikPanchang](https://www.drikpanchang.com/lyrics/aarti/lakshmi-mata/lakshmi-mata-aarti.html?lang=hi) · [HinduNidhi](https://hindunidhi.com/lakshmi-ji-ki-aarti-hindi/) | **SHIPPED 1.5.0** as `om-jai-lakshmi-mata` — recovered from the 2026-06-23 collation (Pavitra Granth, Times of India as second confirmation); refrain + 7 stanzas, the single-source धूप-दीप stanza omitted. |
| `mehandipur-balaji-aarti` | मेहन्दीपुर बालाजी आरती · Mehandipur Balaji Aarti | `hanuman` | `ॐ जय हनुमत वीरा, स्वामी जय हनुमत वीरा` | [DrikPanchang](https://www.drikpanchang.com/lyrics/aarti/shri-balaji/shri-balaji-aarti.html?lang=hi) · [HinduNidhi](https://hindunidhi.com/mehandipur-balaji-aarti-hindi/) | **2C** — tag `hanuman`; do not confuse with Tirupati Balaji. |
| `narasimha-aarti` | नरसिंह आरती · Narasimha Aarti | `narasimha` | `ॐ जय नरसिंह हरे, प्रभु जय नरसिंह हरे` | [DrikPanchang](https://www.drikpanchang.com/lyrics/aarti/lord-narasimha/om-jai-narsingh-hare.html?lang=hi) | **1C** — obtain a second source; do not switch to the distinct Narsingh Kunwar Aarti. |
| `ramayan-aarti` | रामायणजी की आरती · Ramayanji Aarti | `rama` | `आरती श्री रामायण जी की, कीरति कलित ललित सिया-पी की` | [DrikPanchang](https://www.drikpanchang.com/lyrics/aarti/shree-ramayan/shree-ramayan-aarti.html?lang=hi) · [HinduNidhi Aarti Sangrah](https://hindunidhi.com/aarti-sangrah/) | **2C** — this is not the app's current `ram-aarti` alias to Ram Stuti. Use a new canonical id and migrate/rename the misleading alias separately. |
| `santoshi-mata-aarti` | संतोषी माता आरती · Santoshi Mata Aarti | `durga` | `जय सन्तोषी माता, मैया जय सन्तोषी माता` | [DrikPanchang](https://www.drikpanchang.com/lyrics/aarti/santoshi-mata/santoshi-mata-aarti.html?lang=hi) · [HinduNidhi Aarti Sangrah](https://hindunidhi.com/aarti-sangrah/) | **2C** |
| `satyanarayan-aarti` | सत्यनारायण आरती · Satyanarayan Aarti | `vishnu` | `जय लक्ष्मीरमणा श्री जय लक्ष्मीरमणा` | [DrikPanchang](https://www.drikpanchang.com/lyrics/aarti/lord-narayan/shree-satyanarayan-aarti.html?lang=hi) · [HinduNidhi Aarti Sangrah](https://hindunidhi.com/aarti-sangrah/) | **2C** — preserve the Satyanarayan narrative stanzas; do not merge with an unattributed generic Vishnu variant. |
| `shani-aarti` | शनि आरती · Shani Aarti | `shani` | `जय जय श्री शनिदेव भक्तन हितकारी` | [HinduNidhi](https://hindunidhi.com/shanidev-aarti-hindi/) · [Sanskrit Documents, appended after Shani Chalisa](https://sanskritdocuments.org/doc_z_otherlang_hindi/shani40.html) · [Navbharat Times](https://navbharattimes.indiatimes.com/astro/religion-rituals/arti-bhajan/shanidev-aarti-in-hindi/articleshow/91101853.cms) | **SHIPPED 1.5.2** — five stanzas, collated line by line on 2026-10-15; source variants recorded in JSON. DrikPanchang returned HTTP 403 in the authoring environment. |
| `sheetala-mata-aarti` | शीतला माता आरती · Sheetala Mata Aarti | `durga` | `जय शीतला माता, मैया जय शीतला माता` | [DrikPanchang](https://www.drikpanchang.com/lyrics/aarti/shitala-mata/shitala-mata-aarti.html?lang=hi) · [HinduNidhi](https://hindunidhi.com/sheetla-mata-aarti-hindi/) | **2C** — tag `durga`; no Sheetala deity id. |
| `shrinathji-aarti` | श्रीनाथजी आरती · Shrinathji Aarti | `krishna` | Competitor begins `जय श्रीनाथजी प्रभु` | No acceptable temple/tradition edition matching that composition found | **HOLD** — the parity text looks like a modern unattributed synthesis. Obtain a Nathdwara/Pushtimarg edition and rights confirmation. |
| `tulsi-aarti` | तुलसी आरती · Tulsi Aarti | `vishnu` | `जय जय तुलसी माता, सबकी सुखदाता वर माता` | [DrikPanchang](https://www.drikpanchang.com/lyrics/aarti/tulasi-mata/tulasi-mata-aarti.html?lang=hi) · [HinduNidhi](https://hindunidhi.com/tulasi-mata-ki-aarti-hindi/) | **2C** — `vishnu` is a catalog association, not a new Tulsi deity. |
| `vaishno-devi-aarti` | वैष्णो देवी आरती · Vaishno Devi Aarti | `durga` | `जय वैष्णवी माता, मैया जय वैष्णवी माता` | [DrikPanchang](https://www.drikpanchang.com/lyrics/aarti/vaishno-mata/vaishno-mata-aarti.html?lang=hi) · [HinduNidhi Aarti Sangrah](https://hindunidhi.com/aarti-sangrah/) | **2C** |
| `vishnu-lakshmi-ramana-aarti` | विष्णु आरती · Vishnu Aarti (Om Jai Lakshmi Ramana) | `vishnu` | Competitor begins `ॐ जय लक्ष्मी रमणा, स्वामी जय लक्ष्मी रमणा` | No independent source matching the competitor's generic eight-stanza version found | **HOLD** — the established Satyanarayan Aarti has a similar refrain but different narrative. Do not create a duplicate/composite. |

Aarti status: **10 `2C`, 2 `1C`, 3 `HOLD`, 1 `WIRED · collation pending`, 3 `SHIPPED`**.

## Original gathering order (historical)

The first transcription batch should be small enough for line-by-line review:

1. `lakshmi-chalisa`
2. `shani-chalisa`
3. `surya-chalisa`
4. `vindhyeshwari-chalisa`
5. `lakshmi-aarti`
6. `ganga-aarti`
7. `shani-aarti`
8. `dattatreya-aarti`

This was the July 2026 acquisition order, not the current ship queue. Row statuses
above show which texts are now wired or shipped. The order does not imply devotional
importance; it reflected the source and rights risk at the time.

## 2026-10-15 source-access audit for the eleven missing deities

- `www.drikpanchang.com` returned HTTP 403 for every direct candidate probed.
  SanskritDocuments, Pavitra Granth, HinduNidhi, Sanatan Sanstha and Hindu
  Janajagruti returned HTTP 200 with usable text on their HTML candidate pages.
- `shani-chalisa` remains out: the reachable SanskritDocuments closing doha is
  visibly corrupted and differs from Pavitra Granth/HinduNidhi's closing;
  the independent full ending is unresolved.
- `ganga-chalisa` has reachable HinduNidhi and Pavitra Granth text, but their
  opening chaupais already have several substantive word variants. The full
  recension and per-verse editorial meanings remain unapproved. `surya-chalisa`
  also has two reachable candidates; its complete line collation and meanings
  remain to be authored. Neither has been wired.
- `kali-chalisa`, `kali-aarti`, `ganga-aarti`, `parvati-chalisa`,
  `radha-chalisa`, `kubera-chalisa`, `narasimha-chalisa`, and
  `annapurna-chalisa` each lose a required manifest source to Drik's 403.
  `narasimha-aarti` also has only the blocked Drik candidate in this manifest.
- `dattatreya-chalisa`, `kartikeya-chalisa`, and `gauri-chalisa` remain HOLD
  under the editorial-identity rule; the other HOLD rows outside these eleven
  deities remain unchanged.
- Searches for Surya, Radha, Kartikeya, Kubera, Parvati and Navagraha aartis
  surfaced different openings or poorly attributed/modern texts. None passed
  the complete, independent two-source identity gate in this pass. This is a
  research outcome, not a claim that no such traditional aarti exists.

## Acquisition-to-reader gate

For each item:

1. Save the complete Devanagari base text from source A.
2. Compare every line with source B after normalizing only whitespace, dandas,
   and clearly equivalent spelling. Record every substantive variant; never
   silently combine versions.
3. Confirm the opening invocation and catalog deity mapping.
4. Fix stanza/refrain boundaries and compute the actual verse count.
5. Create pronunciation-based ASCII `linesEn` for Hindi/Awadhi/Marathi text.
   Do not paste a site's romanization without checking it.
6. Author `meaningHi` and `meaningEn` as Aadhyatma editorial meanings. Do not
   copy the competitor's meanings.
7. Add `source.baseText`, `source.referenceUrls`, and
   `source.retrievedOn: "2026-07-31"`.
8. Run the duplicate-first-line scan, line-count parity check, transliteration
   residue gate, data tests, and the Chalisa/Aarti Maestro flows.
9. Only then add the item to `chalisaRegistry.ts` or `aarti/index.ts`,
   `texts.ts`, navigation, search, discovery metadata, and progress aliases.

## Explicit exclusions from this phase

These competitor items require deity ids that Aadhyatma does not currently
support and are outside this manifest:

- Chalisas: Agni, Ayyappa, Bhairav, Brahma, Dhanvantari, Indra, Jagannath,
  Sai, Sita, Vishwakarma, Vitthal.
- Aartis: Ayyappa, Bhairav, Jagannath, Sai Aarti, Sai Baba Dhup, Sai Baba
  Shej, Vishwakarma, Vitthal.
