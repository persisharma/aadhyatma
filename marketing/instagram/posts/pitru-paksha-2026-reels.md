# Pitru Paksha 2026 — reel plan (26 Sep → 10 Oct)

A 16-day content calendar for `@vedansh.app`. Every fact below comes from the app's own
verified Pitru registry (`mobile/src/data/pitru/` — lessons, verse spine, kathas, प्रश्नोत्तर)
and the engine's dated fixtures (`mobile/src/panchang/__tests__/pitruSmaran.test.ts`).
Rendered with the content-first pipeline:

```bash
cd marketing/reels
node make-content.mjs pitru-paksha-kya-hai --lang hi     # → out/vedansh-content-pitru-paksha-kya-hai-hi.mp4
```

The reel defs live in `marketing/reels/content/pitru-*.content.mjs`.

## Ground rules (from the registry's stance guard)

- **Explain, never prescribe.** No "आपको … करना चाहिए", no "अवश्य करें", no fear copy —
  the words पितृ दोष / अशुभ / श्राप never appear. The app passes no verdict on any day, and
  neither do the reels. This is also what makes them forwardable to a family group.
- **Scripture is quoted only where the app quotes it** (Gita 1.42 / 9.16 / 9.25 / 10.29 / 2.20,
  Valmiki 2.102.27 / 1.41.19). Everything else is meaning-only.
- **No mantra, no gotra-vakya, no direction-vidhi.** The app's tarpan guide omits them on
  purpose (they vary by shakha); a reel that "teaches the vidhi" contradicts the product.
- **Post the evening before** the day the reel is about (reel-checklist §1). Caption line 1 is
  the searchable Hindi question. One send-prompt. 3–5 hashtags.

## 2026 dates (sunrise-tithi convention, as the app's table)

| Date | Day | Tithi | Confirmed by |
|---|---|---|---|
| 26 Sep | Sat | पूर्णिमा श्राद्ध (प्रोष्ठपदी पूर्णिमा) | engine fixture |
| 27 Sep | Sun | प्रतिपदा | engine fixture |
| 28 Sep – 2 Oct | Mon–Fri | द्वितीया … सप्तमी — **one tithi is kshaya** this week; that day carries both names | derived — match against a printed panchang before naming a day |
| 3 Oct | Sat | अष्टमी | engine fixture |
| 4 Oct | Sun | नवमी · मातृ नवमी | derived |
| 5 Oct | Mon | दशमी | derived |
| 6 Oct | Tue | एकादशी (इन्दिरा एकादशी) | derived |
| 7 Oct | Wed | द्वादशी | derived |
| 8 Oct | Thu | त्रयोदशी | derived |
| 9 Oct | Fri | चतुर्दशी · घात चतुर्दशी | derived |
| 10 Oct | Sat | सर्वपितृ अमावस्या | engine fixture |

Shraddha is an aparahna rite, so classical reckoning and printed tables can differ by a day
when the tithi flips after noon (प्रश्नोत्तर `calendar-antar`). Say so in every dated caption.

## The calendar

Reach reels first (Hindi-first, complete in the frame, built to be sent). Product reels are
conversion, not reach — at most two in the fortnight.

| Post on | About | Reel (slug) | Job | Hook |
|---|---|---|---|---|
| **25 Sep (tonight)** | Paksha begins tomorrow | `pitru-paksha-kya-hai` | reach | पितृ पक्ष कल से — क्या है? |
| 26 Sep | Purnima Shraddha / whose day is which | `pitru-kis-din-kiska` | reach | किस दिन किसका श्राद्ध? |
| 27 Sep | Tarpan vs shraddha | `pitru-tarpan-vs-shraddha` | reach | तर्पण = श्राद्ध? नहीं। |
| 28 Sep | Why water | `pitru-jal-hi-kyon` | reach | तर्पण में जल ही क्यों? |
| 29 Sep | Katha: Rama's jalanjali (Valmiki 2.102.27) | `pitru-rama-jalanjali` | reach | श्रीराम ने पिता को क्या दिया? |
| 30 Sep | Katha: Bhagirath, three generations of one question | `pitru-bhagirath` *(to write)* | reach | तीन पीढ़ियाँ, एक प्रश्न |
| 1 Oct | "We don't have the samagri" | `pitru-samagri-nahi` | reach | सामग्री नहीं है — तो? |
| 2 Oct | Ashtami eve: Gita 9.25 | `pitru-gita-9-25` | reach | गीता पितरों पर क्या कहती है? |
| 3 Oct | Matri Navami eve | `pitru-matri-navami` | reach | नवमी माँ के नाम क्यों? |
| 4 Oct | **Product:** Pitru Smaran ledger + reminder | (app reel — screenshots, `make-reel.js`) | convert | तिथि याद रखना अब ऐप का काम |
| 5 Oct | Two ancestors, same tithi | short from प्रश्नोत्तर `do-log-ek-tithi` | reach | दो पितर, एक तिथि? |
| 6 Oct | Ekadashi: Gita 2.20 — why Chapter 2 is read | `pitru-gita-2-20` | reach | शोक में अध्याय २ ही क्यों? |
| 7 Oct | Katha: Jatayu — pitru-karma for one not of your kula | `pitru-jatayu` *(to write)* | reach | जो कुल का न था, उसके लिए? |
| 8 Oct | Ghata Chaturdashi eve | `pitru-ghata-chaturdashi` *(to write)* | reach | चतुर्दशी किनके लिए? |
| 9 Oct | **Sarvapitri Amavasya eve** — tithi unknown? | `pitru-tithi-agyat` | reach (biggest day) | पितरों की तिथि नहीं मालूम? |
| 10 Oct | **Product:** the "तिथि अज्ञात" entry lands on Amavasya | (app reel) | convert | तिथि अज्ञात — फिर भी स्मरण |

Ten reels are authored in `marketing/reels/content/pitru-*.content.mjs`; the three marked
*(to write)* follow the same shape from the verified kathas (`bhagirath-sagar`, `jatayu-antim-sanskar`)
and the `tithi-14` row. Day-specific reels (`matri-navami`, `ghata-chaturdashi`, and Bharani /
Kunwara Panchami if added) rest on registry rows that are **still `draft`** — their copy says
"कई परम्पराओं में" for that reason. Keep that hedge; do not harden it into a rule.

## Hooks that were rejected, and why

- "पितृ पक्ष में ये 5 काम न करें" — fear copy; the registry answers this question as an explicit
  non-verdict (`shubh-karya`). Silence cedes the ground, so the plan runs the honest version on
  2 Oct's caption instead: *परिवार की रीति पूछिए — ऐप कोई निर्णय नहीं सुनाता.*
- "तर्पण की सही विधि" — the app deliberately ships no mantra/direction; a reel promising it
  would be gated ("link in bio") or wrong.
- "पितृ दोष से मुक्ति" — banned word; not in the sources the app opened.

## Captions (template A/B from `caption-templates.md`, filled)

### 25 Sep — `pitru-paksha-kya-hai`
```
पितृ पक्ष 2026 कब से है? कल — 26 सितम्बर, शनिवार से 10 अक्टूबर तक 🪔

पूर्णिमा श्राद्ध · 26 सितम्बर
अष्टमी श्राद्ध · 3 अक्टूबर
सर्वपितृ अमावस्या · 10 अक्टूबर

भाद्रपद पूर्णिमा से आश्विन अमावस्या तक के सोलह दिन — जब परिवार अपने
दिवंगत पितरों को उनकी तिथि पर याद करता है।

(श्राद्ध अपराह्न का कर्म है — छपे पंचांग और तालिकाओं में एक दिन का अन्तर
दिख सकता है। अपने परिवार या पुरोहित की पद्धति को ही मानिए।)

जो इन दिनों पितरों को याद करते हैं, उन्हें भेज दीजिए 🙏

#पितृपक्ष #श्राद्ध #पितृपक्ष2026 #पंचांग
```

### 26 Sep — `pitru-kis-din-kiska`
```
किस दिन किसका श्राद्ध होता है? देहान्त की तिथि से।

माघ कृष्ण अष्टमी को गए पितर → पितृ पक्ष की अष्टमी (3 अक्टूबर)
पूर्णिमा को गए पितर → पक्ष की पहली पूर्णिमा (26 सितम्बर)
तिथि मालूम नहीं → सर्वपितृ अमावस्या (10 अक्टूबर)

जिस वर्ष कोई तिथि क्षय हो, वह दिन दोनों नामों से जाना जाता है — जैसा छपे
श्राद्ध-कैलेण्डर करते हैं।

जिन्हें अपने घर की तिथि पूछनी हो, उन्हें भेजिए 🙏

#पितृपक्ष #श्राद्ध #तिथि #पंचांग
```

### 27 Sep — `pitru-tarpan-vs-shraddha`
```
क्या घर पर किया तिल-तर्पण पूरा श्राद्ध है? नहीं — पर व्यर्थ भी नहीं।

तर्पण = तिल मिले जल का अर्पण, तृप्ति के भाव से। धर्मसिन्धु इसे श्राद्ध का
अंग, या विशेष स्थिति में उसका अनुकल्प मानता है।
पूर्ण पार्वण श्राद्ध में पिण्डदान, अग्नौकरण और ब्राह्मण-भोजन भी हैं — जिनका
क्रम शाखा और पुरोहित से तय होता है।

जो इस साल पहली बार कर रहे हैं, उन्हें भेजिए 🙏

#पितृपक्ष #तर्पण #श्राद्ध #सनातनधर्म
```

### 28 Sep — `pitru-jal-hi-kyon`
```
तर्पण में जल ही क्यों दिया जाता है?

"तर्पण" का अर्थ ही है — तृप्त करना। रामायण में पितृ-कर्म बार-बार एक ही
रूप में मिलता है: अञ्जलि भर जल, और यह भाव कि यह उन तक पहुँचे।
दशरथ के लिए मन्दाकिनी में। जटायु के लिए गोदावरी में।
और सगरपुत्रों के लिए तो जल का प्रश्न तीन पीढ़ियों की कथा बन गया।

कल की रील: वही कथा।

#पितृपक्ष #तर्पण #रामायण #श्राद्ध
```

### 29 Sep — `pitru-rama-jalanjali`
```
श्रीराम ने वन में पिता के लिए क्या किया? — वाल्मीकि रामायण, अयोध्याकाण्ड

"एतत्ते राजशार्दूल विमलं तोयमक्षयम् ।
पितृलोकगतस्याद्य मद्दत्तमुपतिष्ठतु ॥" — २.१०२.२७

अर्थ · पितृलोक में गए हुए आपको मेरा दिया यह निर्मल, अक्षय जल आज प्राप्त हो।

मन्दाकिनी में उतरकर, दक्षिण की ओर मुख कर, अञ्जलि भर जल — भरत और लक्ष्मण
साथ। तर्पण का भाव हज़ारों वर्ष से यही है।

पूरी कथा वेदांश ऐप में, श्लोक-दर-श्लोक।

#रामायण #पितृपक्ष #श्रीराम #तर्पण
```

### 1 Oct — `pitru-samagri-nahi`
```
श्राद्ध की सारी सामग्री नहीं है — क्या तब भी स्मरण होगा?

रामायण का उत्तर सीधा है। वन में श्रीराम के पास राजसी पदार्थ नहीं थे।
उन्होंने वहीं मिले इंगुदी के गूदे में बेर मिलाकर पिता के लिए पिण्ड बनाया और
कहा — जो हम खाते हैं, वही आपको अर्पित है।
जटायु के लिए भी वन के कन्द ही।

जो सोच रहे हैं कि "हमसे नहीं हो पाएगा", उन्हें भेजिए 🙏

#पितृपक्ष #श्राद्ध #रामायण #सनातनधर्म
```

### 2 Oct — `pitru-gita-9-25`
```
गीता पितरों के बारे में क्या कहती है?

"यान्ति देवव्रता देवान् पितृन् यान्ति पितृव्रताः ।" — भगवद्गीता ९.२५

अर्थ · देवताओं के उपासक देवताओं को, पितरों के उपासक पितरों को प्राप्त होते
हैं — और जो मुझे भजते हैं, वे मुझे। गीता पितृ-उपासना को स्वीकार करती है,
और उसे भक्ति के व्यापक सन्दर्भ में रखती है।

(और "इन दिनों नया काम करें या नहीं?" — रीतियाँ परिवार और प्रदेश से अलग हैं।
अपने घर की रीति पूछिए; न ऐप, न यह पेज कोई निर्णय सुनाता है।)

#भगवद्गीता #पितृपक्ष #श्लोक #श्राद्ध
```

### 9 Oct — `pitru-tithi-agyat` (the fortnight's biggest reel — post it early evening)
```
पितरों की तिथि नहीं मालूम — तो श्राद्ध कब करें? सर्वपितृ अमावस्या, कल 10 अक्टूबर 🪔

परम्परा ने इसके लिए ही पक्ष का अन्तिम दिन रखा है — जब अज्ञात तिथि वाले और
छूटे हुए सब पितरों का स्मरण एक साथ किया जाता है। इसीलिए नाम है: सर्व-पितृ।

वेदांश में किसी को "तिथि अज्ञात" सहेजिए — ऐप उन्हें इसी दिन पर रखता है।

घर के सबसे बड़े को भेजिए — उन्हें नाम याद हैं 🙏

#सर्वपितृअमावस्या #पितृपक्ष #श्राद्ध #महालय
```

## Checklist at upload (reel-checklist §7)

- Add audio in the composer — the builder exports silent. Soft bansuri / tanpura, nothing trending-loud; this fortnight's register is muted.
- Cover = the hook frame.
- Trial the 25 Sep hook against non-followers with two variants: *पितृ पक्ष कल से — क्या है?* vs *सोलह दिन, पितरों के नाम*. Keep the winner's pattern for the rest of the fortnight.
- Reply to every "हमारे यहाँ तो ऐसे नहीं होता" comment with *हाँ — परिवार की रीति ही मानिए*. That is the product's stance, and it is the comment that gets the reel sent onward.
