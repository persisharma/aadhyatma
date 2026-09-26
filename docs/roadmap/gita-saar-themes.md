# गीता सार — theme roadmap (moods and topics)

The first theme, **सच्चा प्रेम · True Prema** (`data/gita-saar/themes/true-prema.ts`), is live.
This is the plan for the next themes: one **question a person actually arrives with**, answered
only by the Gita's own verses in a considered order, each with a plain-language सार. Every ref
below was resolved against the bundled corpus (`data/gita/chapter-NN.json`) on 2026-09-26; the
chapter 13 numbering is the 35-verse one (13.8 = *amānitvam…*).

Building a theme is three files (RULEBOOK §29.7): `themes/<id>.ts`, the array in
`themes/index.ts`, one manifest row in `index.ts`. **Append only** — registry position is the
chapter number. The content test pins ref resolution, parity, well-formedness and the source
threshold. Reader, search, bookmarks, resume and the routine picker pick the theme up from the
manifest with no UI work. When the second theme lands, move `gita-saar` to the "index leads" list
in `entryRoutes.test.ts` and add the reader to `readerAutoAdvance.test.tsx`.

Two kinds of theme, both welcome:

- **Mood** — the reader is *feeling* something (fear, grief, anger, doubt, loneliness). The
  arc is: name the state → what the Gita says it is → what steadies it → the reply.
- **Topic** — the reader is *asking* something (how to work, how to meditate, what am I). The
  arc is: the question → the answer in order → the one line to carry.

A verse may appear in more than one theme (9.22 sits in three) — a theme is a reading, not a
partition. Keep cross-theme reuse modest so each theme keeps its own voice. **Daan** stays out:
the giving layer (PRD-26) already owns a Gita verse spine on it (RULEBOOK §11.11).

---

## Priority 1 — moods people search at night

### 1. भय और चिंता · When I am afraid (`bhay-chinta`) — 8 verses

*Question:* मन डरता है, चिंता नहीं छूटती — गीता क्या कहती है?

| Group | Refs | Thread |
| --- | --- | --- |
| यह आता-जाता है · It comes and goes | 2.14, 2.56 | Heat and cold, joy and pain arrive and leave; the settled one is not shaken by them. |
| मन को साधा जा सकता है · The mind can be trained | 6.35 | Krishna concedes the mind is restless and names the two tools: practice and dispassion. |
| भार उठाने वाला · Someone carries it | 9.22, 18.58 | For the one who rests in Him, He carries what they lack and preserves what they have; "you will cross every difficulty". |
| डर के पार · Beyond fear | 12.15, 9.31 | The devotee neither disturbs nor is disturbed; "My devotee never perishes" — the line Krishna asks Arjuna to declare. |
| वचन · The promise | 18.66 | Take refuge, do not grieve. |

Closing: डर उस चीज़ से है जो बदलती है; जो नहीं बदलता, उसमें टिको। *Fear is of what changes; rest in what does not.*

### 2. शोक · When someone is gone (`shok`) — 9 verses

*Question:* किसी के जाने का दुःख कैसे सहें?

| Group | Refs | Thread |
| --- | --- | --- |
| कृष्ण का पहला वाक्य · Krishna's first words | 2.11, 2.12, 2.13 | You grieve for what is not worth grief; none of us was ever not, nor will ever cease to be; the body changes, the one within does not. |
| जो नहीं मरता · What does not die | 2.20, 2.22, 2.25 | Unborn, undying; worn clothes exchanged for new; unmanifest, unthinkable — knowing this, do not grieve. |
| निश्चित है · It is certain | 2.27, 2.28 | Death is sure for the born, birth for the dead; beings are unmanifest before and after — why lament the middle? |
| इसलिए · Therefore | 2.30 | The dweller in every body can never be slain — you should not grieve for any being. |

Closing: जो गया वह वस्त्र था; जो था, वह अब भी है। *What left was the garment; what was, still is.*

### 3. क्रोध · When anger rises (`krodh`) — 9 verses

*Question:* गुस्सा क्यों आता है और उसे कैसे रोकें?

| Group | Refs | Thread |
| --- | --- | --- |
| क्रोध की सीढ़ी · The ladder down | 2.62, 2.63 | Dwelling on an object → attachment → desire → anger → delusion → loss of memory → ruin. |
| अर्जुन का प्रश्न · Arjuna's question | 3.36, 3.37 | "What drives a man to wrong even against his will?" — desire, and anger its twin, born of rajas, all-devouring. |
| कहाँ रोकें · Where to stop it | 3.41, 3.43 | Restrain it at the senses first; know the Self above the intellect and steady the mind with the mind. |
| जीत · The victory | 5.23 | The one who can hold back the surge of desire and anger here, before the body falls, is truly happy. |
| तीन द्वार · The three gates | 16.21, 16.22 | Lust, anger and greed are the three gates of ruin; free of them, a person walks toward the highest. |

Closing: क्रोध पहली कड़ी नहीं है — उससे पहले की कड़ी पकड़ो। *Anger is not the first link; catch the one before it.*

### 4. संशय · When I cannot decide (`sanshay`) — 9 verses

*Question:* क्या करूँ, क्या न करूँ — निर्णय कैसे लूँ?

| Group | Refs | Thread |
| --- | --- | --- |
| अर्जुन जैसा · Like Arjuna | 2.7 | "I am confused about my duty — teach me, I am your disciple." The Gita begins with a man who cannot decide. |
| अपना धर्म · Your own path | 3.35 | Your own duty, even imperfect, beats another's done well. |
| संशय का मूल्य · What doubt costs | 4.40, 4.41, 4.42 | The doubter finds no happiness here or beyond; knowledge cuts doubt; "cut this doubt born of ignorance with the sword of knowledge, and stand up". |
| मन ही बाधा है · The mind is the obstacle | 6.33, 6.34 | Arjuna: the mind is restless, turbulent, strong, obstinate — harder to hold than the wind. |
| अंतिम शब्द · The last word | 18.63, 18.73 | "Reflect fully, then do as you wish." — and Arjuna: "my doubt is gone; I will do as You say." |

Closing: गीता निर्णय नहीं देती; वह संशय काटती है और चुनाव तुम्हें लौटा देती है। *The Gita does not decide for you; it cuts the doubt and hands the choice back.*

## Priority 2 — the everyday questions

### 5. कर्म · How should I work? (`karma`) — 12 verses

*Question:* काम में मन नहीं लगता, फल की चिंता रहती है — कैसे करूँ?

| Group | Refs | Thread |
| --- | --- | --- |
| अधिकार · Your right | 2.47, 2.48, 2.50 | Right to the work, never to its fruit; work in yoga, equal in success and failure; skill in action is yoga. |
| करना ज़रूरी है · Work is not optional | 3.8, 3.19, 3.20, 3.21 | Do your appointed work; act without attachment; Janaka reached perfection through action; what the great do, others follow. |
| आसक्त और अनासक्त · The attached and the free | 3.25 | Both work; the wise work for the world's good. |
| अपना कर्म · Your own work | 18.45, 18.46, 18.47, 18.48 | Devoted to one's own work, one reaches perfection; worship Him by your work; one's own duty though flawed; never abandon your born work because it has faults — every undertaking has smoke with its fire. |

Closing: काम पूरा करो, फल छोड़ दो — यही योग है। *Do the work fully, release the fruit — that is yoga.*

### 6. मन · The restless mind (`man`) — 9 verses

*Question:* मन भटकता है, टिकता नहीं — क्या करें?

| Group | Refs | Thread |
| --- | --- | --- |
| मित्र या शत्रु · Friend or enemy | 6.5, 6.6 | Lift yourself by yourself; the mind is the friend of one who has mastered it and the enemy of one who has not. |
| संतुलन · Measure | 6.16, 6.17 | Not too much food or sleep, not too little; balanced eating, rest and effort end sorrow. |
| वापस लाओ · Bring it back | 6.26 | Wherever the restless mind wanders, bring it back and settle it — again and again. |
| अर्जुन और उत्तर · Arjuna and the answer | 6.33, 6.34, 6.35, 6.36 | It is restless, hard as the wind — yes, and it is held by practice and dispassion; without restraint yoga is hard, with effort it is possible. |

Closing: मन को दबाओ मत, लौटाओ — हर बार। *Do not force the mind; bring it back — every time.*

### 7. गुण · Why do I feel this way? (`guna`) — 12 verses

*Question:* कभी हल्का, कभी बेचैन, कभी भारी — मूड क्यों बदलते हैं?

| Group | Refs | Thread |
| --- | --- | --- |
| तीन धागे · Three strands | 14.5, 14.6, 14.7, 14.8 | Sattva, rajas, tamas bind the embodied: clarity, restlessness, dullness. |
| कौन कब जीतता है · Which one is up | 14.9, 14.10 | Sattva binds to happiness, rajas to action, tamas to negligence; they rise and fall over each other. |
| पहचान · How to tell | 14.11, 14.12, 14.13 | Light at every gate = sattva; greed, activity, unrest = rajas; darkness, inertia, delusion = tamas. |
| फल और पार · What each yields, and beyond | 14.17, 14.20, 17.2 | Knowledge, greed, delusion; the one who crosses the three is free; even faith takes the colour of one's guna. |

Closing: मूड तुम नहीं हो — वह गुण है जो अभी ऊपर है। *The mood is not you; it is the strand that is up right now.*

### 8. श्रद्धा और शरणागति · Faith and surrender (`sharanagati`) — 11 verses

*Question:* भरोसा कैसे करें? शरण लेने का क्या अर्थ है?

| Group | Refs | Thread |
| --- | --- | --- |
| श्रद्धा पाती है · Faith receives | 4.39, 17.3 | The faithful attain knowledge and peace; a person is their faith. |
| माया के पार · Past the veil | 7.14 | This divine maya is hard to cross; those who take refuge in Me cross it. |
| कोई बाहर नहीं · No one is outside | 9.30, 9.31, 9.22 | Even the worst, if one-pointed, is to be counted good and soon becomes righteous; He carries what His devotees lack. |
| उद्धार · The rescue | 12.6, 12.7 | Those who offer all action to Him and meditate on Him — "I am their swift deliverer from the ocean of death". |
| शरण · Refuge | 9.34, 18.62, 18.66 | Fix your mind on Me; take refuge in Him with your whole being; abandon all dharmas, come to Me alone. |

Closing: शरणागति हार नहीं है — वह भार उतारना है। *Surrender is not defeat; it is setting the load down.*

## Priority 3 — the deeper topics

### 9. स्थितप्रज्ञ · What does a settled person look like? (`sthitaprajna`) — 10 verses

Refs in order: 2.54 (Arjuna's question), 2.55, 2.56, 2.57, 2.58 (the portrait), 2.64, 2.66 (senses and peace), 2.70 (the ocean), 2.71, 2.72 (the final state). Closing: समुद्र भरता रहता है, फिर भी नहीं उफनता। *The ocean keeps filling and never overflows.*

### 10. कामना और संतोष · Desire and contentment (`kamna-santosh`) — 9 verses

Refs: 3.37, 3.39, 3.41 (desire as the enemy, and where to check it) → 5.21, 5.22 (pleasures that begin and end are wombs of sorrow; joy within) → 6.4, 2.71, 2.70 (unattached, desireless, peace) → 16.21 (the gate). Closing: जो बाहर ढूँढते हो, वह भीतर पहले से है। *What you seek outside is already within.*

### 11. सफलता-असफलता · Success and failure (`safalta`) — 8 verses

Refs: 2.38 (equal in gain and loss, victory and defeat) → 2.47, 2.48, 2.50 (right to work, equanimity is yoga) → 4.22, 5.10 (content with what comes; untouched like a lotus leaf) → 18.26, 18.59 (the sattvic doer: unattached, steady, unmoved by success or failure; refusing out of ego will not hold). Closing: जीत-हार परिणाम हैं; तुम प्रयास हो। *Win and loss are outcomes; you are the effort.*

### 12. मृत्यु और आत्मा · What am I? (`atma`) — 11 verses

Refs: 2.17, 2.18, 2.19 (the indestructible pervades all; bodies end, the dweller does not) → 2.20, 2.22, 2.23, 2.24, 2.25 (unborn, undying; clothes; weapons, fire, water, wind cannot touch it) → 8.5, 8.6 (whatever one remembers at the end, one reaches) → 15.7 (an eternal fragment of Me). Overlaps with शोक on 2.20/2.22/2.25 by design — one is a mood, the other a topic.

### 13. क्या मैं अकेला हूँ · Am I alone? (`akela`) — 8 verses

Refs: 6.30, 6.31 (who sees Me everywhere, I never lose him) → 10.20, 15.15, 18.61 (I am the Self in every heart; seated in the heart; the Lord dwells in all beings) → 10.41 (every glory is a spark of Me) → 9.29, 9.22 (in Me and I in them; I carry what they lack). Closing: जिसे ढूँढ रहे हो, वह हृदय में बैठा है। *The one you look for is seated in the heart.*

### 14. दैवी सम्पदा · How to live well (`daivi`) — 11 verses

Refs: 16.1, 16.2, 16.3 (the 26 divine qualities) → 13.8, 13.9, 13.10, 13.11 (what counts as knowledge: humility, non-violence, detachment, steady devotion) → 17.14, 17.15, 17.16 (austerity of body, speech and mind — 17.15 alone is the whole rule of good speech). Closing: अच्छा जीवन बड़े कर्मों से नहीं, रोज़ के गुणों से बनता है। *A good life is built of daily qualities, not great deeds.*

### 15. ध्यान · How to meditate (`dhyan`) — 11 verses

Refs: 6.10, 6.11, 6.12, 6.13, 6.14, 6.15 (place, seat, posture, gaze, the vow, the practice) → 6.19 (the lamp in a windless place) → 6.20, 6.21, 6.22, 6.23 (what the settled mind finds: joy beyond the senses, the gain beyond which none is greater, the undoing of sorrow's union). A **topic** theme; sits beside the Japam counter and the routine. Closing: हवा-रहित जगह का दीपक — यही ध्यान की उपमा है। *A lamp in a windless place — that is the image of meditation.*

### 16. आहार और दिनचर्या · Food and habits (`aahar`) — 5 verses (short; may fold into ध्यान as "the yogi's day")

Refs: 6.16, 6.17 (measure in food, sleep, work) → 17.8, 17.9, 17.10 (sattvic, rajasic, tamasic food). Sanskar-adjacent; keep the सार descriptive, never prescriptive (§29.3).

---

## Suggested build order

| # | Theme | Kind | Verses | Why now |
| --- | --- | --- | --- | --- |
| 2 | भय और चिंता | mood | 8 | The most-searched state; short; strongest closing. |
| 3 | शोक | mood | 9 | One chapter, one arc — the Gita's own first teaching. |
| 4 | क्रोध | mood | 9 | Chapter 2 → 3 → 5 → 16 in a clean causal ladder. |
| 5 | कर्म | topic | 12 | The verse people already know (2.47) with its whole context. |
| 6 | गुण | mood | 12 | The only theme that explains *moods themselves*; pairs with Rashifal's daily register. |
| 7 | मन | mood | 9 | Chapter 6 nearly whole; natural door to ध्यान. |
| 8 | संशय | mood | 9 | Frames the entire Gita as an answer to indecision. |
| 9 | शरणागति | topic | 11 | Completes the bhakti thread True Prema opened. |
| 10–16 | the rest | | | In the order above; ध्यान + आहार together as one 16-verse theme if आहार stays short. |

## Verification notes for authors

- Open every ref in `data/gita/chapter-NN.json`; the test will, but read the meaning first — the
  सार must add nothing the bundled meaning does not carry.
- 6.35, 2.11, 2.55, 3.37, 16.1, 17.2 begin with the speaker line (`श्री भगवानुवाच`) in the corpus;
  3.36, 2.54, 6.33, 18.73 with `अर्जुन उवाच`. That is the corpus text and renders as such.
- Known corpus defect `भक्ित` (7.17, 12.17, 12.19, 13.11): shows through by design; fix upstream in
  `scripts/parse-gita.mjs`, never in a theme file.
- Stance (§29.3): describe, never prescribe — no `must`, `अवश्य`, no fruit-claims, no verdicts on
  the reader's state. A mood theme names the state and what the text says about it.
