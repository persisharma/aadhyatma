# Theerth — Per-State Temple & Lokdevta Catalog

Research backlog for the Theerth pilgrimage map. One section per state/UT (all 36),
listing up to ~10 famous Hindu temples or lokdevta each.

**Legend**
- **✓ live `id`** — plotted on the map now (in `mobile/src/data/theerth/temples.ts`), with
  source-verified coordinates + bilingual prose + an `https` source (enforced by
  `src/data/__tests__/theerth.test.ts`).
- **—** — identified candidate, not yet wired into the live data (a future enrichment pick).
- **SP** — Shakti Peeth (tagged `shakti-peeth`); **A18** — one of the 18 Ashtadasha Maha Shakti Peeths.
- **deity** — the app's mapped deity tag (one of: rama, krishna, vishnu, shiva, hanuman, durga, ganesha, savitr).
  Lokdevta map to the nearest of these (noted inline).

**Enrichment summary (this branch)**
- Total live temples: **68** (was 44) across **32 of 36** states/UTs.
- Shakti Peeths: **7 → 21** plotted, covering all **16 India-located Ashtadasha** Maha Shakti Peeths
  (the 2 abroad — Shankari/Trincomalee, Sri Lanka and Sharada-Saraswati/PoK — are documented below, not pinned).
- Lokdevta added: Khatu Shyam, Khandoba, Gogaji, Sabarimala (Ayyappan), Mahasu Devta, Tejaji, Baba Ramdev.
- Gap states newly covered: Andaman & Nicobar, Chandigarh, Nagaland.
- Genuinely no marquee Hindu shrine (documented, not invented): **Ladakh, Mizoram, Lakshadweep**, and
  **Dadra & Nagar Haveli and Daman and Diu** (Diu's famous Gangeshwar Mahadev is on Diu island, which the
  current map outline omits, so it cannot be pinned).

> Sources: live (✓) rows carry their verified `https` source in `temples.ts`. Candidate (—) rows are
> well-known shrines for future selection; verify a resolving source + in-state coordinates before promoting
> any of them to the live data (the data-contract test enforces both).

---

## The 18 Ashtadasha Maha Shakti Peeths (Adi Shankara's stotram)

| # | Shrine | Place | State / Country | Status |
|---|--------|-------|-----------------|--------|
| 1 | Shankari | Trincomalee | **Sri Lanka** | abroad — not on map |
| 2 | Kamakshi | Kanchipuram | Tamil Nadu | ✓ `kamakshi` |
| 3 | Shrinkhala | Pandua | West Bengal | ✓ `shrinkhala` |
| 4 | Chamundeshwari | Mysuru | Karnataka | ✓ `chamundeshwari` |
| 5 | Jogulamba | Alampur | Telangana | ✓ `jogulamba` |
| 6 | Bhramaramba | Srisailam | Andhra Pradesh | ✓ `bhramaramba` |
| 7 | Mahalakshmi | Kolhapur | Maharashtra | ✓ `mahalakshmi-kolhapur` |
| 8 | Ekaveerika (Renuka) | Mahur | Maharashtra | ✓ `ekaveerika-mahur` |
| 9 | Mahakali (Harsiddhi) | Ujjain | Madhya Pradesh | ✓ `harsiddhi-ujjain` |
| 10 | Puruhutika | Pithapuram | Andhra Pradesh | ✓ `puruhutika` |
| 11 | Girija (Biraja) | Jajpur | Odisha | ✓ `biraja` |
| 12 | Manikyamba | Draksharama | Andhra Pradesh | ✓ `manikyamba` |
| 13 | Kamarupa (Kamakhya) | Guwahati | Assam | ✓ `kamakhya` |
| 14 | Madhaveswari (Alopi) | Prayagraj | Uttar Pradesh | ✓ `madhaveswari` |
| 15 | Vaishnavi (Jwalamukhi) | Kangra | Himachal Pradesh | ✓ `jwala-devi` |
| 16 | Mangala Gauri | Gaya | Bihar | ✓ `mangala-gauri` |
| 17 | Vishalakshi | Varanasi | Uttar Pradesh | ✓ `vishalakshi` |
| 18 | Saraswati (Sharada) | Sharada Peeth | **PoK / Kashmir** | abroad — not on map |

Body-part / Devi-form associations vary by text (Tantrachudamani vs temple tradition); live prose only
asserts a body part where a source firmly attests one.

---

## States & UTs

### Andaman and Nicobar Islands
- ✓ `vetrimalai-murugan` — Sri Vetrimalai Murugan Temple, Port Blair (shiva ← Murugan) — islands' foremost Hindu shrine.

### Andhra Pradesh
- ✓ `tirupati-balaji` — Venkateswara, Tirumala (vishnu) — among the most-visited shrines on earth.
- ✓ `mallikarjuna` — Srisailam (shiva) — Jyotirlinga.
- ✓ `bhramaramba` — Srisailam (durga, SP/A18).
- ✓ `puruhutika` — Pithapuram (durga, SP/A18).
- ✓ `manikyamba` — Draksharama (durga, SP/A18).
- — Simhachalam (Varaha Narasimha), Visakhapatnam (vishnu).
- — Kanaka Durga, Vijayawada (durga).
- — Lepakshi Veerabhadra (shiva).

### Arunachal Pradesh
- ✓ `parashuram-kund` — Lohit River (vishnu ← Parashurama) — Makar Sankranti bathing tirtha.
- — Malinithan, Likabali (durga) — ancient ruined Shakta site.

### Assam
- ✓ `kamakhya` — Guwahati (durga, SP/A18) — pre-eminent Tantric Shakta seat.
- — Umananda (Shiva), Peacock Island, Guwahati (shiva).
- — Navagraha Temple, Guwahati (savitr/nine-planets).
- — Hajo Hayagriva Madhava (vishnu).

### Bihar
- ✓ `vishnupad-gaya` — Gaya (vishnu) — Vishnu footprint; pitru-shraddha tirtha.
- ✓ `mangala-gauri` — Gaya (durga, SP/A18).
- — Mahabodhi-adjacent Hindu shrines, Bodh Gaya.
- — Mundeshwari, Kaimur (durga) — among India's oldest functioning temples.

### Chandigarh
- ✓ `iskcon-chandigarh` — Hare Krishna Dham, Sector 36 (krishna) — leading active Hindu temple within the UT.
- — Nada Sahib vicinity Shiva/Devi sector mandirs (candidates if a non-ISKCON pick is preferred).

### Chhattisgarh
- ✓ `danteshwari` — Dantewada (durga, SP) — kuldevi of Bastar; Bastar Dussehra.
- — Bhoramdeo, Kawardha (shiva) — "Khajuraho of Chhattisgarh".
- — Mahamaya, Ratanpur (durga).

### Dadra and Nagar Haveli and Daman and Diu
- _(none plotted)_ — Gangeshwar Mahadev (shiva), a five-linga seashore cave shrine at Fudam, Diu, is the
  famous Hindu temple here, but Diu island lies outside the current India map outline, so it cannot be pinned.
  Extending the map geometry to include Diu would let it be added.

### Delhi
- ✓ `lakshmi-narayan` — Birla Mandir, New Delhi (vishnu) — landmark modern Vishnu-Lakshmi temple.
- — Akshardham (vishnu/Swaminarayan).
- — Chhatarpur Mandir (durga).
- — Kalkaji Mandir (durga).
- — Yogmaya Temple, Mehrauli (durga).

### Goa
- ✓ `mangueshi` — Ponda (shiva) — pre-eminent Saraswat shrine.
- — Shanta Durga, Kavlem (durga).
- — Mahalasa Narayani, Mardol (vishnu).

### Gujarat
- ✓ `somnath` — Veraval (shiva) — first Jyotirlinga.
- ✓ `dwarkadhish` — Dwarka (krishna) — Char Dham.
- ✓ `nageshwar` — Dwarka (shiva) — Jyotirlinga.
- — Ambaji, Banaskantha (durga, SP) — major Shakti shrine.
- — Pavagadh Mahakali, Panchmahal (durga).
- — Modhera Sun Temple (savitr).
- — Bahucharaji (durga); — Dakor Ranchhodrai (krishna).

### Haryana
- ✓ `mansa-devi` — Panchkula (durga) — major Shivalik Navratri shrine.
- — Sthaneshwar Mahadev, Thanesar (shiva).
- — Brahma Sarovar / Jyotisar, Kurukshetra (krishna — Gita upadesha site).

### Himachal Pradesh
- ✓ `jwala-devi` — Kangra (durga, SP/A18) — eternal-flame Devi shrine.
- ✓ `naina-devi` — Bilaspur (durga, SP).
- ✓ `chamunda-devi` — Dharamshala (durga).
- — Chintpurni, Una (durga, SP).
- — Brajeshwari, Kangra (durga, SP).
- — Hidimba Devi, Manali (durga).

### Jammu & Kashmir
- ✓ `vaishno-devi` — Katra (durga) — one of India's most-visited Devi yatras.
- — Raghunath Temple, Jammu (rama).
- — Kheer Bhawani, Ganderbal (durga).
- — Shankaracharya Temple, Srinagar (shiva).
- — Amarnath Cave (shiva) — seasonal ice-linga yatra.

### Jharkhand
- ✓ `vaidyanath` — Deoghar (shiva) — Jyotirlinga; Shravani Mela.
- — Chhinnamasta, Rajrappa (durga, SP).
- — Parasnath / Jain hills vicinity Hindu shrines.

### Karnataka
- ✓ `udupi-krishna` — Udupi (krishna) — Madhva centre; Kanakana Kindi.
- ✓ `chamundeshwari` — Mysuru (durga, SP/A18).
- — Murudeshwara (shiva).
- — Gokarna Mahabaleshwar (shiva).
- — Kollur Mookambika (durga); — Dharmasthala Manjunatha (shiva); — Hampi Virupaksha (shiva).

### Kerala
- ✓ `padmanabhaswamy` — Thiruvananthapuram (vishnu) — reclining Vishnu; Travancore tradition.
- ✓ `sabarimala` — Pathanamthitta (shiva ← Ayyappan) — one of the largest annual pilgrimages on earth.
- — Guruvayur Sri Krishna (krishna).
- — Chottanikkara Bhagavathy (durga); — Attukal Bhagavathy (durga).

### Ladakh
- _(none)_ — predominantly Tibetan-Buddhist / Muslim; no marquee Hindu temple. (Candidates floated online —
  Spituk "Kali" is actually Buddhist Mahakala; Sindhu Ghat is a river-veneration site, not a deity temple.)

### Lakshadweep
- _(none)_ — Muslim-majority (~96%); no Hindu temple attested.

### Madhya Pradesh
- ✓ `mahakaleshwar` — Ujjain (shiva) — Jyotirlinga; Bhasma Aarti.
- ✓ `omkareshwar` — Khandwa (shiva) — Jyotirlinga.
- ✓ `harsiddhi-ujjain` — Ujjain (durga, SP/A18).
- — Khajuraho temple group (shiva/vishnu) — UNESCO.
- — Maihar Sharda Devi (durga); — Pitambara Peeth, Datia (durga).

### Maharashtra
- ✓ `bhimashankar` — Pune (shiva) — Jyotirlinga.
- ✓ `trimbakeshwar` — Nashik (shiva) — Jyotirlinga; Godavari source.
- ✓ `grishneshwar` — Aurangabad (shiva) — Jyotirlinga.
- ✓ `khandoba-jejuri` — Jejuri (shiva ← Khandoba) — major lokdevta shrine.
- ✓ `mahalakshmi-kolhapur` — Kolhapur (durga, SP/A18).
- ✓ `ekaveerika-mahur` — Mahur (durga, SP/A18).
- — Siddhivinayak, Mumbai (ganesha); — Ashtavinayak circuit (ganesha).
- — Shirdi Sai (—, outside the 8-deity model); — Tuljapur Bhavani (durga); — Pandharpur Vitthal (vishnu).

### Manipur
- ✓ `govindajee-imphal` — Imphal (krishna) — royal Radha-Krishna shrine; Ras Lila.
- — Mahabali / Hanuman Thakur, Imphal (hanuman).

### Meghalaya
- ✓ `nartiang-durga` — Nartiang (durga, SP) — Jayanti Shakti Peeth.

### Mizoram
- _(none)_ — Christian-majority (~87%); no marquee Hindu temple (only a minor Aizawl Shiv Mandir).

### Nagaland
- ✓ `dimapur-kalibari` — Dimapur (durga ← Kali) — principal Hindu temple of the state.

### Odisha
- ✓ `jagannath-puri` — Puri (krishna) — Char Dham; Rath Yatra.
- ✓ `konark-sun` — Konark (savitr) — UNESCO sun-chariot temple.
- ✓ `biraja` — Jajpur (durga, SP/A18).
- — Lingaraja, Bhubaneswar (shiva).
- — Tara Tarini, Ganjam (durga, SP).

### Puducherry
- ✓ `manakula-vinayagar` — Puducherry (ganesha) — seaside Ganesha shrine.
- — Manakula-adjacent Vedapureeswarar (shiva).

### Punjab
- ✓ `durgiana` — Amritsar (durga) — sarovar-centred Devi/Lakshmi-Narayan temple.
- — Devi Talab Mandir, Jalandhar (durga, SP).
- — Achaleshwar Dham, Gurdaspur (shiva).

### Rajasthan
- ✓ `srinathji` — Nathdwara (krishna) — central Pushtimarg shrine.
- ✓ `khatu-shyam` — Khatu, Sikar (krishna ← Barbarika) — hugely popular lokdevta.
- ✓ `gogaji-gogamedi` — Gogamedi, Hanumangarh (shiva ← Gogaji) — serpent-protector lokdevta.
- ✓ `tejaji-kharnal` — Kharnal, Nagaur (shiva ← Tejaji) — folk warrior-saint.
- ✓ `ramdevra` — Pokhran, Jaisalmer (krishna ← Baba Ramdev) — major lokdevta samadhi.
- — Karni Mata, Deshnoke (durga); — Eklingji, Udaipur (shiva); — Brahma Temple, Pushkar (vishnu/Brahma);
  — Salasar Balaji (hanuman); — Galtaji, Jaipur (hanuman).

### Sikkim
- ✓ `kirateshwar` — Legship (shiva) — Rangeet-side Shiva shrine; Arjuna–Kirata legend.

### Tamil Nadu
- ✓ `rameshwaram` — Rameswaram (shiva) — Jyotirlinga + Char Dham.
- ✓ `meenakshi` — Madurai (durga) — Meenakshi-Sundareswarar.
- ✓ `brihadeeswarar` — Thanjavur (shiva) — Great Living Chola Temple (UNESCO).
- ✓ `kamakshi` — Kanchipuram (durga, SP/A18).
- — Ranganathaswamy, Srirangam (vishnu) — largest functioning temple complex.
- — Palani Murugan, Tiruchendur, Thiruttani (Arupadai Veedu) (shiva ← Murugan); — Chidambaram Nataraja (shiva).

### Telangana
- ✓ `bhadrachalam` — Bhadrachalam (rama) — Dakshina Ayodhya.
- ✓ `jogulamba` — Alampur (durga, SP/A18).
- — Yadagirigutta Lakshmi Narasimha (vishnu).
- — Thousand Pillar Temple, Warangal (shiva).

### Tripura
- ✓ `tripura-sundari` — Udaipur (durga, SP) — Matabari; state Devi tradition.

### Uttar Pradesh
- ✓ `kashi-vishwanath` — Varanasi (shiva) — Jyotirlinga.
- ✓ `banke-bihari` — Vrindavan (krishna).
- ✓ `madhaveswari` — Prayagraj (durga, SP/A18).
- ✓ `vishalakshi` — Varanasi (durga, SP/A18).
- — Ram Janmabhoomi, Ayodhya (rama); — Krishna Janmabhoomi, Mathura (krishna).
- — Vindhyavasini, Mirzapur (durga, SP); — Gorakhnath, Gorakhpur (shiva).

### Uttarakhand
- ✓ `kedarnath` — Rudraprayag (shiva) — Jyotirlinga + Chota Char Dham.
- ✓ `badrinath` — Chamoli (vishnu) — Char Dham + Chota Char Dham.
- ✓ `gangotri` — Uttarkashi (durga ← Ganga) — Chota Char Dham.
- ✓ `yamunotri` — Uttarkashi (durga ← Yamuna) — Chota Char Dham.
- ✓ `mahasu-devta-hanol` — Hanol (shiva ← Mahasu Devta) — Jaunsar presiding deity.
- — Neelkanth Mahadev, Rishikesh (shiva); — Surkanda / Kunjapuri (durga, SP); — Naina Devi, Nainital (durga).

### West Bengal
- ✓ `kalighat` — Kolkata (durga, SP) — pre-eminent Kali shrine.
- ✓ `shrinkhala` — Pandua (durga, SP/A18).
- — Dakshineswar Kali, Kolkata (durga); — Tarapith, Birbhum (durga, SP); — Belur Math (—, Ramakrishna).
