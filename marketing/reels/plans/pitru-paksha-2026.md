# पितृ पक्ष 2026 — reels plan (built on what the app already ships)

- **Written:** 2026-09-20 (Sunday) · six days before the fortnight opens
- **Window (engine-pinned, `pitruSmaran.test.ts`):** Purnima Shraddha **Sat 26 Sep** · Pratipada **Sun 27 Sep** ·
  Ashtami Shraddha **Sat 3 Oct** · Sarvapitri Amavasya **Sat 10 Oct** (Navratri opens the next day).
  All other per-day dates: read them off the app's `PitruPakshaOverview` table before posting — one tithi
  is kshaya this year (16 tithis in 15 civil days), so do not count forward by hand.
- **Kits:** content reels → `marketing/reels/make-content.mjs` (≤17s, full-frame Hindi type, send-CTA);
  feature reels → `marketing/reels/make-reel.mjs` (~10–12s, live sim capture, Hindi UI, native build);
  date reels → `marketing/instagram/make-reel.js` `tithi` format + caption template A.
- **Source of truth for every claim:** `mobile/src/data/pitru/` (verified rows only), `data/vidhi/shraddha-tarpan-vidhi.ts`,
  `data/daan/occasions.ts` (`pitru-paksha`). A reel says nothing the app's verified rows do not say.

---

## 1. Stance for the season (same guard the app enforces)

The app's stance guard (`pitruShikshaContent.test.ts`) bans `पितृ दोष`, `अशुभ`, `श्राप`, `अवश्य करें`,
`आपको … करना चाहिए`, `must`, `you should`, `inauspicious`, `dosha`, `curse`. **Marketing copy follows the same
list.** This is the differentiator: every incumbent's Pitru Paksha reel is fear copy + a pandit-booking CTA.
Ours explain, cite, and defer to the family ("परिवार की रीति सर्वोपरि").

House rules from the reels spec still apply: Hindi-first, storytelling not feature-telling, no
"free / offline / नि:शुल्क / बिना नेट" claims, no download-CTA on content reels (send-CTA only, app = watermark).

**Send line for the season** (reuse on every content reel):
`जो अपने पितरों का स्मरण करते हैं — उन्हें भेजिए` / `Send it to those who remember their ancestors.`

**Hashtags (3–5):** `#पितृपक्ष #श्राद्ध #तर्पण #सर्वपितृअमावस्या #पंचांग`

---

## 2. What the app can already say (verified inventory → reel angle)

| App row (verified) | What it lets a reel say | Reel |
|---|---|---|
| lesson `kya-hai` | 16 days Bhadrapada Purnima → Ashwin Amavasya; a calendar of **tithis, not dates**; Sarvapitri for unknown tithis | R1, R11 |
| lesson `shraddha-aur-tarpan` | tarpana ≠ shraddha; tarpana is one limb / anukalpa; full parvana has pinda, agnaukarana, bhojana | R4 |
| lesson `jal-kyon` + verse Valmiki 1.41.19 | water is the oldest form; Garuda: "लौकिक जल नहीं — गंगा" ; Bhagiratha's three generations | R6 |
| lesson `kiske-liye` + katha `jatayu-antim-sanskar` | Rama's rite for Jatayu — neither kin nor human; remembrance opens by bond | R9 |
| lesson `samay` + prashna `calendar-antar` | shraddha is an **afternoon** act (Kutapa / aparahna) → why the printed calendar looks a day off | R7 |
| lesson `kis-din-kiska` | tithi of passing → same krishna tithi of the paksha; purnima rule; kshaya two-name day | R7 |
| katha `rama-jalanjali` (Ayodhya 102) | Rama offered ingudi pulp + jujube on darbha: "जो हम खाते हैं, वही आपको अर्पित" — the heart is shraddha, not samagri | R2 |
| prashna `kya-arpan-karein` | "we lack the materials" → the forest pinda answer | R2 (CTA beat) |
| prashna `tithi-agyat` + lesson `tithi-amavasya` | unknown tithi → Sarvapitri Amavasya | R11, R12 |
| verses Gita 9.16 / 9.25 / 10.29 / 1.42 | "स्वधाऽहम्" — the offering reaches Him; "पितॄणामर्यमा"; Arjuna's worry about lapsed pinda-udaka | R10 |
| verse Gita 2.20 + vidhi steps `gita-15`, `gita-2` | why chapter 2 / 15 are read in remembrance | R8, R10 |
| vidhi `shraddha-tarpan-vidhi` (10 steps, mantra-free) | a **limited household** tila-tarpana: clean place, tila-jal, silent remembrance, optional Gita paath | R8 |
| daan occasion `pitru-paksha` | anna-daan · til · vastra as the household shraddha gifts | R8 (caption) |
| engine `pitruPakshaWindow` + overview table | the fortnight's dates, this year | R3, R12 |
| Pitru Smaran ledger (PRD-17) | save a relation + tithi once → app answers "next date" every year, private, reminder day-before | R5 |

**Not usable yet (draft rows — dark in the app, so a reel must not lean on them):** पितृ-ऋण / three debts,
महालय name, the **Karna folk katha**, all **14 per-tithi assignments** (Matri Navami, Kunwara Panchami, Ghata
Chaturdashi, Sannyasi Dwadashi…), गोत्र, "who may perform". See §5.

---

## 3. The slate — 12 reels over 16 days, six of them P0

Post the **evening before** the moment (Instagram README §5.9). One idea per reel. Content reels ≤17s,
feature reels ≤12s. P0 = make these even if nothing else ships.

| # | Post (evening) | Pri | Kit | Title / hook (hi) | Angle |
|---|---|---|---|---|---|
| R1 | Thu 24 Sep | P0 | content | पितृ पक्ष सोलह दिन क्यों? | what the fortnight is |
| R2 | Fri 25 Sep | P0 | content | राम ने पिता को क्या अर्पित किया? | shraddha > samagri (Ayodhya 102) |
| R3 | Fri 25 Sep | P0 | tithi/date | पितृ पक्ष कब से? · २६ सितम्बर | the dates + the table |
| R4 | Sun 27 Sep | P1 | content | तर्पण और श्राद्ध — एक ही बात? | two words, two acts |
| R5 | Mon 28 Sep | P0 | feature | दादाजी की तिथि याद है? | Pitru Smaran ledger + reminder |
| R6 | Wed 30 Sep | P1 | content | तर्पण में जल ही क्यों? | Garuda / Bhagiratha |
| R7 | Thu 1 Oct | P1 | content | पंचांग में श्राद्ध की तारीख़ अलग क्यों? | afternoon rule |
| R8 | Fri 2 Oct | P0 | feature | घर पर तिल-तर्पण — कैसे? | the household vidhi (eve of Ashtami) |
| R9 | Sun 4 Oct | P1 | content | जो कुल का नहीं था — उसके लिए भी | Jatayu (Aranya 68) |
| R10 | Tue 6 Oct | P1 | content | गीता पितरों के बारे में क्या कहती है? | 9.16 · 9.25 · 10.29 |
| R11 | Thu 8 Oct | P0 | content | पितरों की तिथि नहीं मालूम? | Sarvapitri as the open door |
| R12 | Fri 9 Oct | P0 | tithi/date + feature | सर्वपितृ अमावस्या कब? · १० अक्टूबर | the last day + vidhi chip |

Spacing is roughly alternate days; skip a P1 rather than post two on one day. R3 and R12 are the two
"timeliness" posts and historically the highest-reach format — do not skip them.

---

## 4. Scripts

Format for content reels: `hook` (≤6 words / ≤30 chars hi) → 2–3 `beats` (`text` big on screen, `narration`
spoken, optional `sub`) → `cta` + `send`. `bg` keys available today: `rama`, `gita`, `vishnu`, `krishna`
(no pitru-specific visual exists yet — see §5, asset gap). Format for feature reels: `preroll` (unrecorded
navigation) → 1–2 motion-rich `beats` → `cta`.

### R1 · पितृ पक्ष सोलह दिन क्यों? — content (`pitru-kya-hai`)
- **bg:** none (gradient) or `rama`
- **hook:** `पितृ पक्ष\nसोलह दिन क्यों?` / `Why sixteen days?`
- **beat 1 text:** `भाद्रपद पूर्णिमा से\nआश्विन अमावस्या तक` · **sub:** `२६ सितम्बर – १० अक्टूबर` · **narration:** `भाद्रपद पूर्णिमा से आश्विन अमावस्या तक का यह पखवाड़ा पितृ पक्ष है।`
- **beat 2 text:** `यह तिथियों का\nकैलेण्डर है — तारीख़ों का नहीं` · **narration:** `जिस तिथि को किसी का देहान्त हुआ, इस पक्ष की उसी तिथि पर उनका स्मरण — इसलिए हर दिन किसी का है।`
- **beat 3 text:** `तिथि न मालूम हो?\nसर्वपितृ अमावस्या` · **narration:** `और जिनकी तिथि परिवार को ज्ञात नहीं — उनके लिए अन्तिम दिन, सर्वपितृ अमावस्या।`
- **cta/send:** season send line.
- **source:** lesson `kya-hai` (verified), `tithi-amavasya`.

### R2 · राम ने पिता को क्या अर्पित किया? — content (`pitru-rama-pinda`)
- **bg:** `rama`
- **hook:** `राम ने पिता को\nक्या अर्पित किया?` / `What did Rama offer his father?`
- **beat 1 text:** `चित्रकूट · मन्दाकिनी तट\nदक्षिण दिशा, अञ्जलि भर जल` · **narration:** `दशरथ के देहान्त का समाचार मिला, तो राम मन्दाकिनी तट पर गए — दक्षिण दिशा की ओर मुख, अञ्जलि में जल।`
- **beat 2 text:** `राजसी पदार्थ नहीं —\nवन का इंगुदी-पिण्याक और बेर` · **narration:** `पिण्ड के लिए राजसी सामग्री नहीं थी। वन में जो था — इंगुदी का गूदा और बेर — वही दर्भ पर रखा।`
- **beat 3 text:** `“जो हम खाते हैं,\nवही आपको अर्पित है”` · **sub:** `वाल्मीकि रामायण · अयोध्याकाण्ड १०२` · **narration:** `और कहा — जो हम खाते हैं, वही आपको अर्पित है। श्राद्ध का मूल सामग्री में नहीं, श्रद्धा में है।`
- **cta:** `जिनके पास सब सामग्री नहीं — उन्हें भेजिए।` · **send:** `जिनके पास सब सामग्री नहीं —\nउन्हें भेजिए`
- **source:** katha `rama-jalanjali` (verified, corpus 2.102.20–35), prashna `kya-arpan-karein`.
- **caption line 1:** `श्राद्ध में क्या अर्पित करें? रामायण का उत्तर 🙏` then the teaching line, then the send prompt.

### R3 · पितृ पक्ष कब से? — date reel (instagram kit, `tithi` format)
- Slides: hook `पितृ पक्ष कब से?` → `पूर्णिमा श्राद्ध · शनिवार २६ सितम्बर` → `प्रतिपदा · रविवार २७ सितम्बर` →
  `अष्टमी श्राद्ध · शनिवार ३ अक्टूबर` → `सर्वपितृ अमावस्या · शनिवार १० अक्टूबर` → `shot`: the app's
  `PitruPakshaOverview` table (screenshot) → cta repeats the hook verbatim (loop seam rule).
- Caption = template A, with the line `(तिथि सूर्योदय के अनुसार — अपराह्न-आधारित परम्परा हो तो उसे प्राथमिकता दें।)`
  — that is the app's own caveat (lesson `kis-din-kiska`), and it pre-empts the "your date is wrong" comments.
- Fill the remaining per-day rows from the app table, never by counting forward (kshaya tithi this year).

### R4 · तर्पण और श्राद्ध — एक ही बात? — content (`pitru-tarpan-vs-shraddha`)
- **hook:** `तर्पण और श्राद्ध —\nएक ही बात?` / `Tarpana and shraddha — the same?`
- **beat 1 text:** `तर्पण = तिल मिले जल\nका अर्पण` · **narration:** `तर्पण जल का अर्पण है — प्रायः तिल मिले जल का — पितरों की तृप्ति के भाव से।`
- **beat 2 text:** `श्राद्ध उससे बहुत बड़ा है —\nपिण्डदान · होम · भोजन` · **narration:** `पूर्ण श्राद्ध में इससे बहुत अधिक है — पिण्डदान, अग्नौकरण, ब्राह्मण-भोजन। और इनका क्रम शाखा और पुरोहित से बदलता है।`
- **beat 3 text:** `घर का तिल-तर्पण\nसीमित स्मरण है — श्राद्ध नहीं` · **narration:** `इसलिए घर पर किया तिल-तर्पण एक सीमित स्मरण है — वह श्राद्ध की जगह नहीं लेता।`
- **cta/send:** season send line.
- **source:** lesson `shraddha-aur-tarpan`, prashna `ghar-par-tarpan` (both verified). This reel is the honesty
  differentiator — it says out loud what the app's own guide says about itself.

### R5 · दादाजी की तिथि याद है? — feature reel (`pitru-smaran`)
- **Flow (native, Hindi UI):** `tab-more` → `more-pitru-smaran` → **+ स्मरण जोड़ें** → relation chip `दादाजी` →
  `तिथि ज्ञात है` → month/paksha/tithi chips → save → Detail hero pill `अगला · <date> · N दिन में` → reminder switch.
  Verify selectors live first (relation chips expose English a11y per `SMARAN_RELATIONS`? — check; else `tapPoint`).
- **preroll:** tab-more → Pitru Smaran list → tap **+ स्मरण जोड़ें** (open the form before the camera rolls).
- **hook:** `दादाजी की तिथि तो याद है —\nपर इस साल की तारीख़?` / `You know the tithi — but this year's date?`
- **beat 1 (pick relation + tithi + save):** narration `एक बार तिथि लिखिए — माघ कृष्ण अष्टमी —` · caption `तिथि एक बार लिखिए`
- **beat 2 (detail pill + Paksha row + reminder switch):** narration `और हर वर्ष की तारीख़, पितृ पक्ष का दिन, और एक दिन पहले याद — अपने आप।` · caption `हर साल की तारीख़ · याद अपने आप`
- **cta:** `स्मरण की ज़िम्मेदारी वेदांश की — पितरों का भाव आपका।` / `Vedansh keeps the date. The remembrance stays yours.`
- **Do NOT show a real name in the capture** (privacy footer is the product stance); leave the name field empty.
- **caption line 1:** `पितरों की श्राद्ध तिथि की तारीख़ हर साल कैसे निकालें?` — the searchable question.

### R6 · तर्पण में जल ही क्यों? — content (`pitru-jal-kyon`)
- **bg:** `rama`
- **hook:** `तर्पण में\nजल ही क्यों?` / `Why water, of all things?`
- **beat 1 text:** `रामायण में पितृ-कर्म\nबार-बार एक ही रूप में —\nअञ्जलि भर जल, दक्षिण मुख` · **narration:** `रामायण में पितृ-कर्म बार-बार एक ही रूप में मिलता है — अञ्जलि भर जल, दक्षिण दिशा की ओर मुख।`
- **beat 2 text:** `गरुड़ ने कहा —\n“इनके लिए लौकिक जल नहीं,\nगंगा का जल चाहिए”` · **sub:** `बालकाण्ड १.४१.१९` · **narration:** `सगर के साठ हज़ार पुत्रों के लिए गरुड़ ने अंशुमान् से कहा — लौकिक जल पर्याप्त नहीं, इनके लिए गंगा चाहिए।`
- **beat 3 text:** `तीन पीढ़ियाँ · एक प्रश्न\nभगीरथ ने गंगा उतारी` · **narration:** `तीन पीढ़ियाँ उसी एक प्रश्न में बीत गईं — और भगीरथ ने गंगा को उतारकर उसे पूरा किया। जल औपचारिकता नहीं है।`
- **cta/send:** season send line.
- **source:** lesson `jal-kyon`, verse `valmiki-1-41-19`, katha `bhagirath-sagar` (all verified).

### R7 · पंचांग में श्राद्ध की तारीख़ अलग क्यों? — content (`pitru-aparahna`)
- **hook:** `छपे पंचांग में श्राद्ध की\nतारीख़ अलग क्यों?` / `Why does the printed calendar differ?` (trim to ≤30 chars: `श्राद्ध की तारीख़\nअलग क्यों दिखती है?`)
- **beat 1 text:** `श्राद्ध सूर्योदय का कर्म नहीं —\nअपराह्न का है` · **sub:** `कुतप काल · अपराह्न` · **narration:** `श्राद्ध दिन के उत्तरार्ध का कर्म है — कुतप काल और अपराह्न। सूर्योदय का नहीं।`
- **beat 2 text:** `तिथि जिस दिन के\nअपराह्न में हो — वही दिन` · **narration:** `इसलिए किसी तिथि का श्राद्ध उस दिन पड़ता है जिसके अपराह्न में वह तिथि व्याप्त हो — और वह कभी एक दिन आगे-पीछे दिखता है।`
- **beat 3 text:** `परिवार की रीति\nसर्वोपरि` · **narration:** `दोनों पद्धतियाँ हैं। जो आपके परिवार की रीति कहे — वही सही है।`
- **cta/send:** season send line.
- **source:** lesson `samay`, prashna `calendar-antar`, lesson `kis-din-kiska` (verified).

### R8 · घर पर तिल-तर्पण — कैसे? — feature reel (`pitru-tarpan-vidhi`)
- **Flow:** `tab-more` → `more-pitru-smaran` → season banner → `PitruPakshaOverview` → scroll → **पितृ तिल-तर्पण स्मरण** door
  (`pitru-paksha-vidhi-door`) → VidhiDetail: scope step → `vidhi-mode-steps` → swipe through तिल-जल तैयार करें → अर्पित करें → मौन स्मरण → गीता १५ row.
- **preroll:** everything up to the overview (unrecorded).
- **hook:** `पंडित नहीं मिले —\nतो घर पर क्या करें?` / `No purohit this year — what can a family do at home?`
- **beat 1 (open the vidhi, first step visible):** narration `एक सीमित गृहस्थ स्मरण है — मन्त्र-रहित, दस चरण, बीस मिनट।` · caption `सीमित स्मरण · १० चरण`
- **beat 2 (swipe: तिल-जल → अर्पण → मौन → गीता १५):** narration `स्वच्छ स्थान, तिल मिला जल, मौन स्मरण — और चाहें तो गीता का पन्द्रहवाँ अध्याय।` · caption `तिल-जल · मौन · गीता १५`
- **cta:** `यह श्राद्ध का स्थान नहीं लेता — पर स्मरण का द्वार खुला रखता है।` / `Not a substitute for shraddha — a door kept open.`
- The honesty line is the payoff, not a disclaimer: it is the thing no competitor's reel says.
- **caption:** add the daan row — `अन्न-दान · तिल · वस्त्र — श्राद्ध-दान की गृहस्थ सूची` (from `daan/occasions.ts pitru-paksha`).

### R9 · जो कुल का नहीं था — उसके लिए भी — content (`pitru-jatayu`)
- **bg:** `rama`
- **hook:** `जो न कुल का था,\nन मनुष्य —` / `Neither kin nor human —`
- **beat 1 text:** `जटायु — पिता के मित्र,\nएक पक्षी` · **narration:** `जटायु राम के कुल के नहीं थे, मनुष्य भी नहीं — पिता के मित्र, एक पक्षी।`
- **beat 2 text:** `राम ने स्वयं चिता सजाई,\nदर्भ पर पिण्ड, गोदावरी में जलाञ्जलि` · **sub:** `अरण्यकाण्ड ६७–६८` · **narration:** `राम ने स्वयं लकड़ी इकट्ठी की, चिता सजाई, दर्भ पर पिण्ड रखा और गोदावरी में जलाञ्जलि दी।`
- **beat 3 text:** `स्मरण का द्वार\nसूची से नहीं — भाव से खुलता है` · **narration:** `परिवार में कौन क्या करे, वह परिवार का विषय है। पर इस प्रसंग में स्मरण का द्वार सूची से नहीं — भाव से खुला।`
- **cta/send:** season send line.
- **source:** lesson `kiske-liye`, katha `jatayu-antim-sanskar` (verified). Keep the "who may perform" question
  untouched — the app's own answer is still draft.

### R10 · गीता पितरों के बारे में क्या कहती है? — content (`pitru-gita`)
- **bg:** `gita`
- **hook:** `गीता पितरों के बारे में\nक्या कहती है?` / `What does the Gita say about the pitrs?`
- **beat 1 text (verse):** `अहं क्रतुरहं यज्ञः\nस्वधाऽहमहमौषधम् ।` · **sub:** `भगवद्गीता ९.१६ — पितरों को दिया अर्पण (स्वधा) भी मैं ही हूँ` · **narration:** `स्वधा मैं हूँ — पितरों को जो अर्पण जाता है, वह भी मुझ तक पहुँचता है।`
- **beat 2 text (verse):** `यान्ति देवव्रता देवान्\nपितृन् यान्ति पितृव्रताः ।` · **sub:** `भगवद्गीता ९.२५` · **narration:** `जो पितरों के व्रती हैं, वे पितरों को पाते हैं।`
- **beat 3 text:** `पितॄणामर्यमा च अस्मि\n— पितरों में मैं अर्यमा हूँ` · **sub:** `भगवद्गीता १०.२९` · **narration:** `और विभूति-योग में — पितरों में मैं अर्यमा हूँ।`
- **cta/send:** season send line (or `जो गीता पढ़ते हैं — उन्हें भेजिए`).
- **source:** principles `gita-9-16`, `gita-9-25`, `gita-10-29` — verse lines are copied from `principles.ts` (already
  normalised for the corpus's `पितृ़` defect), **not** from the corpus JSON.

### R11 · पितरों की तिथि नहीं मालूम? — content (`pitru-tithi-agyat`)
- **hook:** `पितरों की तिथि\nनहीं मालूम?` / `Don't know your ancestors' tithi?`
- **beat 1 text:** `बहुत परिवारों को\nनहीं मालूम — यह सामान्य है` · **narration:** `बहुत परिवारों को नहीं मालूम — दो पीढ़ी पीछे की तिथि कौन लिखता है। यह सामान्य है।`
- **beat 2 text:** `इसीलिए पक्ष का अन्तिम दिन —\nसर्वपितृ अमावस्या` · **sub:** `शनिवार · १० अक्टूबर` · **narration:** `इसीलिए पक्ष का अन्तिम दिन रखा गया — सर्वपितृ अमावस्या — सब पितरों की, जिनकी तिथि ज्ञात नहीं या जिनका दिन छूट गया।`
- **beat 3 text:** `द्वार खुला है` · **narration:** `कोई न छूटे — द्वार खुला है।`
- **cta/send:** `जिन्हें अपने पितरों की तिथि नहीं मालूम — उन्हें भेजिए`
- **source:** prashna `tithi-agyat`, lesson `tithi-amavasya` (verified). This is the reel most likely to be forwarded
  — it removes a guilt nobody else removes.

### R12 · सर्वपितृ अमावस्या कब? — date reel + optional feature beat
- Date reel (instagram kit): hook `सर्वपितृ अमावस्या कब?` → `शनिवार · १० अक्टूबर २०२६` → `जिनकी तिथि ज्ञात नहीं — उन सबका दिन` →
  `कल से शारदीय नवरात्रि` (bridge to the next season's content) → cta = hook verbatim.
- Feature variant (`pitru-sarvapitri`, only if R5/R8 captured cleanly): Panchang tab → 10 Oct day panel → the
  saffron season chip + the muted-gold **॥ तिल-तर्पण विधि** chip (renders on this one day) → vidhi. Hook
  `आज सर्वपितृ अमावस्या —`; one beat; CTA `स्मरण से नवरात्रि तक — वेदांश के साथ।`
- Caption template A; line 1 `सर्वपितृ अमावस्या कब है? १० अक्टूबर, शनिवार 🪔`.

### Held (do not post this season unless the row flips to verified)
- **Karna and the sixteen days** — the story everyone knows and the best hook in the set, but `karna-mahalaya` is
  draft and provenance is लोक-परम्परा (not in the critical Mahabharata). If a reviewer flips it before 3 Oct, post
  it on **Sat 3 Oct** with the on-screen label `लोक-कथा` and never as "महाभारत कहता है".
- **मातृ नवमी / कुँवारा पञ्चमी / घात चतुर्दशी** — per-tithi assignments are draft (PRD-44 OQ1).
- **"क्या इन दिनों नया काम करें?"** — the app answers with a deliberate non-verdict; as a reel it reads as
  either fear copy or a dodge. Skip.

---

## 5. Do we need more content? — yes, in four specific places (and no, in one)

Assessed against `data/pitru/`, the vidhi, bhog, daan and the PRD-44 Phase 2 list. Ordered by what would
help the season most, given the fortnight opens in six days.

### 5.1 Importance / महत्व — the layer is good; its two strongest "why" pieces are dark
- Verified today: 7 concept lessons, 7 verses, 3 kathas, 8 Q/A, 11 glossary rows. Enough to carry ten reels.
- **Draft: `pitru-rin` (three debts · pancha-mahayajna)** — this is *the* traditional answer to "why remember at
  all", and it is invisible. Flipping it needs Manu 3.70 and TS 6.3.10.5 opened at a named edition. **Egress
  from this environment is blocked (403 on every source host, retested 2026-09-19)** — a person on a desktop
  has to open the two pages and record the note; the code change is one field. Worth doing before 26 Sep.
- **Draft: `karna-mahalaya`** — PRD-44 OQ2. Recommend flipping with two published tellings recorded and the
  लोक-परम्परा canon line kept; it is the story people will search for during the fortnight.
- **Draft: `mahalaya-naam`** — cheap flip (one concordant second reference); gives the Bengal audience a hook.
- Not needed: more verses. Seven bundled, reader-linked verses is already more than any incumbent cites.

### 5.2 Vidhi — keep the boundary, fill three real holes
The narrow, mantra-free household tila-tarpana is a **product decision** (RULEBOOK §28.5, PRD-19 P3): no
mantra, gotra formula, direction rule, pinda-daan or brahmana-bhojana sequence. Do not widen it for the
season — it is exactly what R4/R8 are honest about. But inside that boundary:
1. **`samagri: []` is empty** in `shraddha-tarpan-vidhi.ts`, so the kitchen/checklist integration shows nothing
   for this vidhi. The steps already name the materials (काला तिल, स्वच्छ जल, दो पात्र, आसन, optional कुश/दर्भ)
   and the Gita Press Tarpana chapter was opened for exactly "materials" on 2026-08-19. Author the 5–6 row
   samagri list from the steps' own wording. Smallest, highest-value fix.
2. **No "when today" answer.** Lesson `samay` explains Kutapa/aparahna but nothing computes it for the day; the
   Daily Muhurat engine already has the primitives. A per-day annotate-only line during the fortnight
   ("आज अपराह्न · HH:MM–HH:MM · श्राद्ध का पारम्परिक काल") would close the loop R7 opens. Phase 2 candidate,
   not for this week.
3. **Bhog row `pitru-offering` is one title + one tradition note.** If a verified source can be opened, add
   the common household shraddha-bhojan items (खीर, उड़द, तिल-आधारित व्यंजन) with region notes; until
   then the daan row (अन्न · तिल · वस्त्र) is the only "what to give" the app states — fine for R8's caption.

### 5.3 The doors that make a reel land in the app (PRD-44 Phase 2 wiring — pure code, OTA)
A reel that ends "जानें वेदांश में" needs the app to answer the same question when someone opens it and types:
- **जिज्ञासा (Ask): zero pitru intents exist today** (grep of the Ask module returns nothing). `pitru.kya-hai`,
  `pitru.tithi-agyat`, `pitru.tarpan-vs-shraddha`, `pitru.calendar-antar` are four rows answering from
  `getPitruLessons()` / `getPitruPrashna()` with an "परिचय खोलें" action (RULEBOOK §25).
- **Search rows** for verified lessons and kathas (`searchIndex.buildSectionEntries`, `pitru:<id>`), plus Home-stack
  registration of the two routes.
- **Season DISCOVER caption** on the existing Pitru Smaran card → परिचय, during the 30 days before + the fortnight.
- **Observance Detail card** on `darsha-amavasya` during the fortnight.
These four are the difference between "saw the reel" and "found it in the app". Recommend Ask + search first.

### 5.4 Per-tithi content for date reels (blocked on verification, not authoring)
All 16 tithi rows are written; 14 are draft pending a second source (Nirnaya/Dharma Sindhu tithi table vs
Drik's shraddha-days page — PRD-44 OQ1). Until flipped, R3/R12 name **only** the four engine-pinned days and
the generic "N-वीं तिथि के पितरों का दिन" wording; no Matri Navami / Kunwara Panchami reels this year.

### 5.5 Asset gap for the content kit
`make-content.mjs` has no pitru-register background (`BG` keys are deity visuals). A muted, non-deity visual —
brass lota + til, or a diya on water, dimmed to the kit's 0.66–0.82 overlay — would suit R1/R4/R7/R11. Until it
lands, use `rama` for the Ramayana reels and the plain gradient for the rest; do **not** put a deity behind
"तिथि नहीं मालूम?".

### What we do NOT need
- A "complete shraddha vidhi", mantra text, pinda procedure, or a "who may perform" verdict. The stance and
  the source discipline that forbid them are the reason the reels above can be honest.
- A daily-lesson notification (PRD-44 Phase 3) — decision deferred until Phase 2 counters exist.

---

## 6. Production checklist (per reel)
1. Copy every claim from the verified row named in the script's **source** line; if the row is draft, the reel waits.
2. Run the copy against the stance list in §1 (grep the script for the banned tokens before rendering).
3. Content reels: `node make-content.mjs <slug> --lang hi`; ≤17s; frame 0 must be the bright hook (no fade-in).
4. Feature reels: native build, `REEL_APP_ID=com.prashantsharma.vedansh`, Hindi UI; validate selectors live; leave
   the ledger's name field empty in every capture.
5. Date reels: `node make-reel.js <reel> --check` then `--slides-only --safe`; cta = hook verbatim.
6. Upload: audio from Instagram's library, cover = hook frame, caption line 1 = the searchable question, one send
   prompt, 3–5 hashtags, post the evening before.
