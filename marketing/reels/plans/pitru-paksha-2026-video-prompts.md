# पितृ पक्ष 2026 — video-generator shot scripts

Companion to `pitru-paksha-2026.md` (the slate) and `docs/pitru-paksha-reels-prototype.html` (the frames).
This file is what you paste into a video generator (Veo / Kling / Runway / Sora / Pika — model-agnostic).

---

## 0. How these scripts work — read once

**The generator makes pictures only. It never makes the words.**
Every Devanagari line in these reels is burned in afterwards by `make-content.mjs` (or your editor).
No current video model renders Devanagari reliably — मात्राएँ detach, conjuncts break, and a broken
shloka on a devotional reel is worse than no reel. So every prompt below ends with a no-text negative,
and the Hindi copy is listed separately as **OVERLAY** (on-screen) and **VO** (spoken).

**Pipeline per reel**
1. Generate each shot from the prompt block (1080×1920, 24 or 30 fps, the stated duration).
2. Cut them in order; no crossfades, hard cuts only.
3. Burn the OVERLAY text in the brand's type (Noto Serif Devanagari 600/700, cream `#F3E7C9`,
   gold sub-line `#E8C887`, the 1 px gold inner frame and the `ॐ वेदांश़` watermark).
4. Lay the VO under it, then add audio in the Instagram composer at upload.

**Three rules that are not negotiable**

- **No faces of deities, and no faces of Rama, Sita, Lakshmana, Bharata or any named figure.**
  Every mythic beat below is staged through hands, silhouette-at-distance, objects, water and light.
  This is an editorial choice, not a workaround: the app ships no deity photography either, generators
  render devotional figures poorly, and a wrong face on a Pitru Paksha reel is the one mistake the
  audience will not forgive. Where a person must appear, it is **hands only, or a back-turned figure
  at distance in low light**.
- **No mourning theatre.** No weeping faces, no funeral pyres with a body, no black-and-white
  photo-of-the-departed clichés, no graveyards. The register is quiet reverence, not grief porn.
- **No app screens from the generator.** R5, R8 and R12's app beat are real simulator captures
  (`make-reel.mjs`). A rendered fake of your own product is both dishonest and instantly recognisable.

---

## 1. The look lock — paste this into every prompt

Keep this block identical across all shots so the twelve reels read as one season.

```
STYLE: cinematic devotional realism, warm low-key earthen palette — deep umber and burnt
sienna shadows, saffron and brass highlights, cream and pale gold accents. Soft directional
morning or late-afternoon light, visible haze in the light beam, shallow depth of field,
gentle natural film grain, no colour cast toward blue or green. Unhurried, reverent, still.
Shot on 50mm at f/2, subtle handheld micro-movement. Vertical 9:16, 1080x1920.
```

```
NEGATIVE: text, lettering, captions, subtitles, watermarks, logos, signage, Devanagari or
Latin characters, numbers; faces of deities or mythological figures, statues of gods with
visible faces, idols; human faces in close-up, direct eye contact; crying, distress,
dead bodies, coffins, tombstones, skulls; modern clothing, plastic, packaging, electronics,
phones, wristwatches; neon, lens flare, HDR, oversaturation, cartoon, anime, 3D render,
CGI look, plastic skin, extra fingers, malformed hands, warped water.
```

**Continuity tokens** — reuse the same nouns across a reel so shots cut together:
*same pair of weathered adult male hands* · *same brass lota with a beaded rim* ·
*same river with dark rounded stones* · *same bed of darbha grass on a stone slab*.

---

## 2. Which reels get AI video, and which do not

| Reel | Treatment |
|---|---|
| R1 · R2 · R4 · R6 · R7 · R9 · R10 · R11 | **AI-generated b-roll** — scripts below. |
| R5 (Pitru Smaran) · R8 (tila-tarpana vidhi) | **Simulator capture only.** The product is the content. |
| R3 · R12 (date reels) | **Typographic**, from the Instagram kit. An AI establishing shot may open R12 (§4.9). |

---

## 3. Shot scripts — content reels

Durations are the generator's clip length. They are ~0.3 s longer than the frame timings in the
prototype so the editor has handles to cut on.

---

### R1 · पितृ पक्ष सोलह दिन क्यों? — 4 shots, ~15 s

**Focus:** the fortnight is a calendar of tithis, not of dates.

**Shot 1 — 2.0 s — the hook plate**
```
A single brass oil lamp burning in deep shadow on a worn stone ledge, the flame very still.
Darkness fills most of the frame; the lamp sits low and slightly right of centre, leaving the
upper two-thirds dark and empty. Thin smoke rises straight. Camera static.
[STYLE] [NEGATIVE]
```
- **OVERLAY:** `पितृ पक्ष / सोलह दिन क्यों?` (kicker `रुकिए`) — placed in the empty upper area.
- **VO (hi):** पितृ पक्ष — सोलह दिन क्यों?
- *Why:* empty top third exists so the hook text has somewhere to live without covering the lamp.

**Shot 2 — 4.2 s — the fortnight as sky**
```
Slow timelapse of the moon waning over sixteen nights above a quiet river horizon, the disc
shrinking phase by phase, deep indigo-brown sky, a faint band of warm haze on the horizon.
Steady locked-off camera, the moon tracking gently across frame. No stars trails, no city lights.
[STYLE] [NEGATIVE]
```
- **OVERLAY:** `भाद्रपद पूर्णिमा से / आश्विन अमावस्या तक` · sub `२६ सितम्बर – १० अक्टूबर २०२६`
- **VO (hi):** भाद्रपद पूर्णिमा से आश्विन अमावस्या तक का यह पखवाड़ा पितृ पक्ष है।

**Shot 3 — 4.6 s — tithis, not dates**
```
Overhead shot of an old handwritten Indian almanac lying open on a cloth, its pages yellowed and
soft-focused so no characters are legible; a weathered adult hand moves slowly across the page,
one fingertip tracing down a column, pausing. Warm lamp light from the left. Camera static overhead,
very slight drift.
[STYLE] [NEGATIVE]
```
- **OVERLAY:** `यह तिथियों का कैलेण्डर है — / तारीख़ों का नहीं`
- **VO (hi):** जिस तिथि को किसी का देहान्त हुआ, इस पक्ष की उसी तिथि पर उनका स्मरण — इसलिए हर दिन किसी न किसी का है।
- *Note:* "soft-focused so no characters are legible" is load-bearing — it stops the model inventing script.

**Shot 4 — 3.8 s — the last day**
```
A new-moon night: the river surface almost black, a single small oil lamp floating on it,
its reflection stretching toward camera. The far bank is a low dark line. Water moves slowly.
Camera static, low to the water.
[STYLE] [NEGATIVE]
```
- **OVERLAY:** `तिथि न मालूम हो? / सर्वपितृ अमावस्या` · sub `पक्ष का अन्तिम दिन — शनिवार, १० अक्टूबर`
- **VO (hi):** और जिनकी तिथि परिवार को ज्ञात नहीं — उनके लिए अन्तिम दिन, सर्वपितृ अमावस्या।
- **Send card** (no generation — the kit's send scene): `जो अपने पितरों का स्मरण करते हैं — उन्हें भेजिए`

---

### R2 · राम ने पिता को क्या अर्पित किया? — 4 shots, ~17 s

**Focus:** he offered forest pulp on grass, and it was enough.
**Staging rule:** Rama is never shown. Hands, distance silhouette, and the offering itself carry it.

**Shot 1 — 2.1 s — the hook plate**
```
A shallow clay bowl holding a few forest berries and a pale fruit pulp, resting on a bed of dry
darbha grass on a flat river stone. Early morning light rakes across from the left. The background
is a dark blurred riverbank. Camera slowly pushes in a few centimetres.
[STYLE] [NEGATIVE]
```
- **OVERLAY:** `राम ने पिता को / क्या अर्पित किया?` (kicker `रुकिए`)
- **VO (hi):** राम ने अपने पिता को क्या अर्पित किया?

**Shot 2 — 4.8 s — the river, facing south**
```
Wide shot at dawn: a clear fast shallow river between forested hills, mist on the water. Far from
camera, a lone barefoot figure in simple bark-coloured cloth stands knee-deep, seen from behind in
silhouette against the mist, motionless, head bowed. The figure is small in frame, no face visible,
no ornament. Camera static, very slow drift forward.
[STYLE] [NEGATIVE]
```
- **OVERLAY:** `चित्रकूट · मन्दाकिनी तट / दक्षिण दिशा, अञ्जलि भर जल`
- **VO (hi):** दशरथ के देहान्त का समाचार मिला, तो राम मन्दाकिनी तट पर गए — दक्षिण की ओर मुख, अञ्जलि में जल।
- *Prompt guard:* "seen from behind", "no face visible", "small in frame" — all three, every time.

**Shot 3 — 4.8 s — what the forest gave**
```
Extreme close-up: two weathered hands press pale fruit pulp and dark berries together into a small
round offering, then set it down on a woven bed of dry darbha grass. Slow deliberate movement,
morning light from the left, dark blurred background. Camera static macro.
[STYLE] [NEGATIVE]
```
- **OVERLAY:** `राजसी पदार्थ नहीं — / वन का इंगुदी-पिण्याक और बेर`
- **VO (hi):** पिण्ड के लिए राजसी सामग्री नहीं थी। वन में जो था — इंगुदी का गूदा और बेर — वही दर्भ पर रखा।

**Shot 4 — 4.3 s — the water released**
```
Close-up from the side: cupped hands lift from a river and open, letting a thin ribbon of water
fall back to the surface, catching gold light as it falls. Droplets, slow ripples spreading.
Dark water, warm backlight. Camera static, slight slow motion.
[STYLE] [NEGATIVE]
```
- **OVERLAY:** `“जो हम खाते हैं, / वही आपको अर्पित है”` · sub `वाल्मीकि रामायण · अयोध्याकाण्ड १०२`
- **VO (hi):** और कहा — जो हम खाते हैं, वही आपको अर्पित है। श्राद्ध का मूल सामग्री में नहीं, श्रद्धा में है।
- **Send card:** `जिनके पास सब सामग्री नहीं — उन्हें भेजिए`

---

### R4 · तर्पण और श्राद्ध — एक ही बात? — 4 shots, ~16 s

**Focus:** two words, two acts — and the app's guide is the smaller one.

**Shot 1 — 2.1 s — the hook plate**
```
Top-down macro: a small brass bowl of clear water with black sesame seeds scattered across the
surface, sinking slowly. Warm light from one side, dark stone underneath. Camera static, seeds drift.
[STYLE] [NEGATIVE]
```
- **OVERLAY:** `तर्पण और श्राद्ध — / एक ही बात?` (kicker `रुकिए`)
- **VO (hi):** तर्पण और श्राद्ध — क्या एक ही बात है?

**Shot 2 — 4.4 s — the smaller act**
```
Close-up: a weathered hand tilts a small brass lota and pours a thin steady stream of water with
black sesame into a shallow catching vessel below. Nothing else in frame. Soft side light, dark
background, water sound implied by the steady stream. Camera static.
[STYLE] [NEGATIVE]
```
- **OVERLAY:** `तर्पण = तिल मिले / जल का अर्पण`
- **VO (hi):** तर्पण जल का अर्पण है — प्रायः तिल मिले जल का — पितरों की तृप्ति के भाव से।

**Shot 3 — 5.2 s — the larger rite, at distance**
```
Wide interior of a traditional courtyard at midday: a low fire in a small square brick altar,
smoke rising into a shaft of light; around it, arranged on banana leaves and brass plates, an
elaborate spread of cooked food, grass bundles and vessels. No people in frame. Camera slowly
cranes up and back, revealing how much is laid out.
[STYLE] [NEGATIVE]
```
- **OVERLAY:** `श्राद्ध उससे बड़ा है — / पिण्डदान · अग्नौकरण · भोजन`
- **VO (hi):** पूर्ण श्राद्ध में इससे बहुत अधिक है — पिण्डदान, अग्नौकरण, ब्राह्मण-भोजन; और इनका क्रम शाखा और पुरोहित से बदलता है।
- *Why the crane-back:* scale is the argument. The frame has to get bigger than shot 2.

**Shot 4 — 4.2 s — back to the household**
```
Return to the intimate scale of shot 2: the same brass lota and catching vessel on a clean floor
mat in a quiet home, morning light through a doorway, a folded cotton cloth beside them. Still,
modest, nobody present. Camera static, slow push in.
[STYLE] [NEGATIVE]
```
- **OVERLAY:** `घर का तिल-तर्पण / सीमित स्मरण है — श्राद्ध नहीं`
- **VO (hi):** इसलिए घर पर किया तिल-तर्पण एक सीमित स्मरण है — वह श्राद्ध की जगह नहीं लेता।
- **Send card:** season line.

---

### R6 · तर्पण में जल ही क्यों? — 4 shots, ~18 s

**Focus:** water is not a formality — three generations waited for the right water.

**Shot 1 — 2.0 s — the hook plate**
```
Macro, top-down: a single drop falls into still dark water and one perfect ring spreads outward,
gold rim-light on the ripple. Black background, nothing else in frame. Slow motion. Camera static.
[STYLE] [NEGATIVE]
```
- **OVERLAY:** `तर्पण में / जल ही क्यों?` (kicker `रुकिए`)
- **VO (hi):** तर्पण में जल ही क्यों?

**Shot 2 — 4.8 s — the oldest form**
```
Close-up from the side at a river's edge at sunrise: cupped hands rise out of the water, full,
and hold steady; light comes from low ahead so the water glows at the rim of the hands. The river
runs dark behind. Camera static, minimal movement, reverent stillness.
[STYLE] [NEGATIVE]
```
- **OVERLAY:** `अञ्जलि भर जल, / दक्षिण की ओर मुख` · sub `रामायण में बार-बार, एक ही रूप में`
- **VO (hi):** रामायण में पितृ-कर्म बार-बार एक ही रूप में मिलता है — अञ्जलि भर जल, दक्षिण दिशा की ओर मुख।

**Shot 3 — 5.4 s — ordinary water will not do**
```
A vast dry riverbed of cracked pale earth under a hard white sky, stretching to the horizon;
a thin wisp of ash blows across the ground. Utterly empty, no vegetation, no people. Camera drifts
slowly forward low over the cracked ground.
[STYLE] [NEGATIVE]
```
- **OVERLAY:** `“इनके लिए लौकिक जल नहीं — / गंगा का जल चाहिए”` · sub `गरुड़ का वचन · बालकाण्ड १.४१.१९`
- **VO (hi):** सगर के साठ हज़ार पुत्रों के लिए गरुड़ ने अंशुमान् से कहा — लौकिक जल पर्याप्त नहीं, इनके लिए गंगा चाहिए।
- *Why drought:* Garuda is not shown. The absence of water is the line.

**Shot 4 — 5.0 s — the river arrives**
```
A great river bursting down a Himalayan gorge in full flow, white water and spray catching golden
morning light, mist rising, dark wet rock on both sides. Powerful but not violent. Camera pulls back
steadily to reveal the scale of the descent.
[STYLE] [NEGATIVE]
```
- **OVERLAY:** `तीन पीढ़ियाँ · एक प्रश्न / भगीरथ ने गंगा उतारी`
- **VO (hi):** तीन पीढ़ियाँ उसी एक प्रश्न में बीत गईं — और भगीरथ ने गंगा उतारकर उसे पूरा किया। जल औपचारिकता नहीं है।
- **Send card:** season line.

---

### R7 · श्राद्ध की तारीख़ अलग क्यों दिखती है? — 4 shots, ~17 s

**Focus:** shraddha belongs to the afternoon, so the day is chosen by the afternoon.

**Shot 1 — 2.1 s — the hook plate**
```
Two old printed almanacs lying side by side on a wooden table, pages open, both deliberately
out of focus so no characters read; a hand rests on one, hesitating between them. Warm window
light. Camera static overhead.
[STYLE] [NEGATIVE]
```
- **OVERLAY:** `श्राद्ध की तारीख़ / अलग क्यों दिखती है?` (kicker `रुकिए`)
- **VO (hi):** छपे पंचांग में श्राद्ध की तारीख़ अलग क्यों दिखती है?

**Shot 2 — 4.6 s — not a sunrise act**
```
The sun's disc low on the horizon at dawn behind river mist, pale and cool; the frame is quiet
and empty. Then hold. Camera locked off, the light slowly strengthening.
[STYLE] [NEGATIVE]
```
- **OVERLAY:** `श्राद्ध सूर्योदय का / कर्म नहीं — अपराह्न का है` · sub `कुतप काल · रौहिण · अपराह्न`
- **VO (hi):** श्राद्ध दिन के उत्तरार्ध का कर्म है — कुतप काल और अपराह्न। सूर्योदय का नहीं।

**Shot 3 — 5.2 s — the afternoon shadow**
```
A courtyard floor in strong afternoon light; the long shadow of a pillar sweeps slowly across the
stone as the sun moves — timelapse, two hours compressed. Warm ochre stone, dust in the air.
No people. Camera locked off.
[STYLE] [NEGATIVE]
```
- **OVERLAY:** `तिथि जिस दिन के / अपराह्न में हो — वही दिन`
- **VO (hi):** इसलिए किसी तिथि का श्राद्ध उस दिन पड़ता है जिसके अपराह्न में वह तिथि व्याप्त हो — और वह कभी एक दिन आगे-पीछे दिखता है।
- *Why:* the moving shadow *is* the aparahna rule. One shot does the whole explanation.

**Shot 4 — 4.2 s — the family's own way**
```
Interior, late afternoon: an older woman's hands, seen from behind and above, arranging a small
brass plate and a folded cloth on a home altar ledge; warm light from a window, the rest of the
room in soft shadow. Unhurried, domestic, no face in frame. Camera static.
[STYLE] [NEGATIVE]
```
- **OVERLAY:** `परिवार की रीति / सर्वोपरि`
- **VO (hi):** दोनों पद्धतियाँ हैं। जो आपके परिवार की रीति कहे — वही सही है।
- **Send card:** season line.

---

### R9 · जो न कुल का था, न मनुष्य — 4 shots, ~17 s

**Focus:** the rite performed for one who had no claim on it.
**Staging rule:** no dying bird, no body. A feather, gathered wood, smoke, water.

**Shot 1 — 2.1 s — the hook plate**
```
A single large dark feather lying on wet river stones, rain-damp, one edge catching low gold light.
Everything else dark and out of focus. Camera static, a slow breath of wind moves the feather's edge.
[STYLE] [NEGATIVE]
```
- **OVERLAY:** `जो न कुल का था, / न मनुष्य —` (kicker `रुकिए`)
- **VO (hi):** जो न कुल का था, न मनुष्य —

**Shot 2 — 4.2 s — a great bird, alive and distant**
```
A very large eagle-like bird in slow flight high above a forested river valley at first light,
seen from far below in silhouette against a pale gold sky, wings fully spread, unhurried.
Camera tilts up slowly to follow. Majestic, not distressed.
[STYLE] [NEGATIVE]
```
- **OVERLAY:** `जटायु — पिता के मित्र, / एक पक्षी`
- **VO (hi):** जटायु राम के कुल के नहीं थे, मनुष्य भी नहीं — पिता के मित्र, एक पक्षी।

**Shot 3 — 5.4 s — the rite, by hand**
```
Close-up sequence at a forest riverbank: weathered hands gather and stack dry wood into a neat
low pile, then spread a bed of dry darbha grass on a flat stone beside it. Thin smoke begins to
drift through the frame from the left. Low warm light through trees, no fire visible, no body,
no people beyond the hands. Camera static, slight drift.
[STYLE] [NEGATIVE]
```
- **OVERLAY:** `राम ने स्वयं चिता सजाई, / दर्भ पर पिण्ड, / गोदावरी में जलाञ्जलि` · sub `अरण्यकाण्ड ६७–६८`
- **VO (hi):** राम ने स्वयं लकड़ी इकट्ठी की, चिता सजाई, दर्भ पर पिण्ड रखा और गोदावरी में जलाञ्जलि दी।

**Shot 4 — 4.3 s — the door is not a list**
```
A simple open wooden doorway in an old stone wall at dawn, seen straight on from inside a dark
room; beyond it, a bright misty riverbank. Nobody in the frame. Dust turns slowly in the shaft of
light. Camera pushes very slowly toward the doorway.
[STYLE] [NEGATIVE]
```
- **OVERLAY:** `स्मरण का द्वार / सूची से नहीं — भाव से खुलता है`
- **VO (hi):** परिवार में कौन क्या करे, वह परिवार का विषय है। पर इस प्रसंग में स्मरण का द्वार सूची से नहीं — भाव से खुला।
- **Send card:** season line.

---

### R10 · गीता पितरों के बारे में क्या कहती है? — 4 shots, ~18 s

**Focus:** three verses; the tradition speaking for itself.
**Treatment note:** the verses must stay legible, so these plates are quieter and emptier than the
rest — the generated image is a *ground* for type, not a competing picture.

**Shot 1 — 2.2 s — the hook plate**
```
An old cloth-bound book resting closed on a low wooden stand, wrapped in saffron cloth, a single
oil lamp beside it. Deep shadow all around, the lamp the only light. No text visible on the cover.
Camera static, flame flickers.
[STYLE] [NEGATIVE]
```
- **OVERLAY:** `गीता पितरों के बारे में / क्या कहती है?` (kicker `रुकिए`)
- **VO (hi):** गीता पितरों के बारे में क्या कहती है?

**Shot 2 — 5.5 s — offering meets fire**
```
Slow-motion macro: grains and ghee fall into a small ritual fire, sparks rising in a thin column
through a dark frame, smoke curling. The fire sits low in the lower third; the upper two-thirds are
dark and empty. Camera static.
[STYLE] [NEGATIVE]
```
- **OVERLAY (verse):** `अहं क्रतुरहं यज्ञः / स्वधाऽहमहमौषधम् ।` · sub `भगवद्गीता ९.१६ — स्वधा (पितरों का अर्पण) भी मैं ही हूँ`
- **VO (hi):** स्वधा मैं हूँ — पितरों को जो अर्पण जाता है, वह भी मुझ तक पहुँचता है।
- *Empty upper two-thirds is required* — that is where the shloka sits.

**Shot 3 — 4.6 s — two paths**
```
A pre-dawn sky, deep indigo fading to warm gold at the horizon, a single thin band of cloud,
nothing else — no land, no birds, no sun disc. Very slow drift upward. Almost abstract.
[STYLE] [NEGATIVE]
```
- **OVERLAY (verse):** `यान्ति देवव्रता देवान् / पितृन् यान्ति पितृव्रताः ।` · sub `भगवद्गीता ९.२५`
- **VO (hi):** जो पितरों के व्रती हैं, वे पितरों को पाते हैं।

**Shot 4 — 4.5 s — Aryaman**
```
The sun just breaking the horizon over still water, its light laying a single straight golden path
across the surface toward camera. Mist on the water, no land, no people, no birds. Camera static,
the light strengthening.
[STYLE] [NEGATIVE]
```
- **OVERLAY:** `पितॄणामर्यमा च अस्मि / — पितरों में मैं अर्यमा हूँ` · sub `भगवद्गीता १०.२९ · विभूति-योग`
- **VO (hi):** और विभूति-योग में — पितरों में मैं अर्यमा हूँ।
- **Send card:** `जो गीता पढ़ते हैं — उन्हें भेजिए`

---

### R11 · पितरों की तिथि नहीं मालूम? — 4 shots, ~16 s

**Focus:** not knowing is normal, and the tradition already built the door for it.
**Tone guard:** nothing in these shots may look like failure or neglect. Warm, not desolate.

**Shot 1 — 2.0 s — the hook plate**
```
A worn family notebook lying open on a cloth, its pages soft-focused and unreadable, the lower
half of the page blank and empty. A hand rests beside it, not writing. Warm window light from
the left, quiet domestic interior. Camera static.
[STYLE] [NEGATIVE]
```
- **OVERLAY:** `पितरों की तिथि / नहीं मालूम?` (kicker `रुकिए`)
- **VO (hi):** पितरों की तिथि नहीं मालूम?
- *No deity background on this reel* — a deity behind this question reads as judgement.

**Shot 2 — 4.8 s — it is normal**
```
Close-up of hands turning the pages of an old cloth-wrapped family register; the pages are
yellowed, some torn, some blank, all deliberately out of focus so nothing is legible. Dust motes
in warm light. Unhurried, gentle, no frustration in the movement. Camera static overhead.
[STYLE] [NEGATIVE]
```
- **OVERLAY:** `बहुत परिवारों को / नहीं मालूम — / यह सामान्य है`
- **VO (hi):** बहुत परिवारों को नहीं मालूम — दो पीढ़ी पीछे की तिथि कौन लिखता है। यह सामान्य है।

**Shot 3 — 5.0 s — the day that was kept for this**
```
Dusk on a wide calm river at new moon: many small oil lamps set afloat near the bank, drifting
together, their reflections doubling on the dark water. The far shore is a low warm line of light.
Camera glides slowly forward just above the water.
[STYLE] [NEGATIVE]
```
- **OVERLAY:** `इसीलिए पक्ष का अन्तिम दिन — / सर्वपितृ अमावस्या` · sub `शनिवार · १० अक्टूबर`
- **VO (hi):** इसीलिए पक्ष का अन्तिम दिन रखा गया — सर्वपितृ अमावस्या — सब पितरों की, जिनकी तिथि ज्ञात नहीं या जिनका दिन छूट गया।

**Shot 4 — 3.6 s — the door is open**
```
An old wooden double door in a warm stone wall, standing open onto soft morning light; the
threshold is swept clean and a small lamp burns beside it on the step. Nobody in frame.
Camera static, one slow push in toward the opening.
[STYLE] [NEGATIVE]
```
- **OVERLAY:** `द्वार खुला है`
- **VO (hi):** कोई न छूटे — द्वार खुला है।
- **Send card:** `जिन्हें अपने पितरों की तिथि नहीं मालूम — उन्हें भेजिए`

---

### R12 (opener only) · सर्वपितृ अमावस्या — 1 shot, ~2.5 s

R12 is otherwise typographic. One generated establishing plate may open it:
```
Pre-dawn on a wide river ghat at new moon, the stone steps empty and wet, a row of small oil lamps
burning along the lowest step, dark water beyond. Deep blue-brown darkness, warm lamp pools.
No people. Camera static, very slow push in.
[STYLE] [NEGATIVE]
```
- **OVERLAY:** `सर्वपितृ / अमावस्या कब?`

---

## 4. Voice-over

Record all VO in **one session, one voice** — the brand voice (`viraj`), warm, unhurried,
slightly lowered register for this season. If you are synthesising: ElevenLabs for published cuts;
the repo's local XTTS clone is **non-commercial** and must not be used on a published reel.

Pacing: Hindi TTS runs long. If a line overruns its shot, cut words, never speed the audio.

**Transliteration for TTS tools that need Latin input** — the eight hooks:

| Reel | Hindi | Latin |
|---|---|---|
| R1 | पितृ पक्ष — सोलह दिन क्यों? | Pitru Paksha — solah din kyon? |
| R2 | राम ने अपने पिता को क्या अर्पित किया? | Rama ne apne pita ko kya arpit kiya? |
| R4 | तर्पण और श्राद्ध — क्या एक ही बात है? | Tarpan aur shraddha — kya ek hi baat hai? |
| R6 | तर्पण में जल ही क्यों? | Tarpan mein jal hi kyon? |
| R7 | छपे पंचांग में श्राद्ध की तारीख़ अलग क्यों दिखती है? | Chhape panchang mein shraddha ki tareekh alag kyon dikhti hai? |
| R9 | जो न कुल का था, न मनुष्य — | Jo na kul ka tha, na manushya — |
| R10 | गीता पितरों के बारे में क्या कहती है? | Gita pitron ke baare mein kya kehti hai? |
| R11 | पितरों की तिथि नहीं मालूम? | Pitron ki tithi nahin maaloom? |

---

## 5. Acceptance check before you publish a generated cut

1. **No characters anywhere in the generated footage.** One hallucinated glyph on a devotional
   reel and the whole cut is unusable. Scrub frame by frame at 2× if unsure.
2. **No face of any named or divine figure.** If a shot rendered one, regenerate — do not crop.
3. **Hands are correct.** Five fingers, no fusion, no extra thumbs — generators fail most often on
   exactly the close-up hand shots this season depends on.
4. **Water looks like water.** Warped or looping water reads as fake instantly on a ghat shot.
5. **Frame 0 is bright and legible**, and the overlay text sits inside the safe area
   (`node make-reel.js <reel> --slides-only --safe` from the Instagram kit shows the boundary).
6. **The claim still matches the source row** named in `pitru-paksha-2026.md`. Generated visuals
   must not imply anything the verified text does not say — no pinda procedure, no mantra being
   spoken, no purohit officiating.
7. **Run the stance scan** on the final copy: no `पितृ दोष`, `अशुभ`, `श्राप`, `अवश्य करें`,
   `आपको … करना चाहिए`.
