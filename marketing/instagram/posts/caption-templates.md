# Instagram caption templates

Copy-paste, then edit the `{…}` slots. Rules these all follow (see `../README.md` §5):

1. **Line 1 is the searchable question**, in Hindi, phrased the way someone types it.
   Only the first ~2 lines show before "more" — the keyword must be there.
2. **The answer is in the caption**, not just the video. People search and save captions.
3. **One explicit send prompt.** Ask for the action you want.
4. **3–5 relevant hashtags**, at the end. Not a wall.
5. **No link in the caption** — Instagram doesn't make it tappable. Link stays in bio:
   `https://persisharma.github.io/get-vedansh/` (`mobile/src/data/shareLinks.ts`).

---

## A. Timeliness reel — vrat / festival eve

**Pair with:** `vedansh-ig-tithi.mp4` · **Post:** the evening *before*, not on the day.
This is the highest-reach format. See README §1.5.

```
{एकादशी} कब है? {24 अगस्त, रविवार} 🪔

तिथि आरंभ · {23 अगस्त, रात 09:14}
तिथि समाप्त · {24 अगस्त, रात 11:02}
पारण का समय · {25 अगस्त, प्रातः 06:12 – 08:34}

(तिथि सूर्योदय के अनुसार बदलती है — अपने शहर का समय ज़रूर देखें।)

व्रत विधि, कथा और पारण का समय — सब एक जगह।

जो {एकादशी} का व्रत रखते हैं, उन्हें यह भेज दीजिए 🙏

#एकादशी #व्रत #पंचांग #हिंदूकैलेंडर
```

> Swap `{एकादशी}` for the occasion: प्रदोष, संकष्टी, करवा चौथ, अहोई अष्टमी, सत्यनारायण…
> The template doesn't change. That's the point — it's a weekly recurring post.

---

## B. Verse reel — Gita / Chalisa / stotram

**Pair with:** `vedansh-ig-gita.mp4` · **Post:** 2× / week.
Built to be forwarded. Full value in the frame, nothing gated.

```
{कर्मण्येवाधिकारस्ते} — गीता का सबसे ज़्यादा कहा और सबसे कम समझा गया श्लोक।

"{कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।
मा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥}"
— भगवद्गीता {2.47}

अर्थ · {कर्म करने में ही तेरा अधिकार है, फल में कभी नहीं।}

पर ध्यान दीजिए — श्लोक यहीं ख़त्म नहीं होता। आगे कहा है "अकर्मणि" में भी
आसक्ति न हो। यानी फल छोड़ने का अर्थ काम छोड़ना नहीं है।

किसे यह श्लोक याद दिलाना है? टैग कीजिए 👇

#भगवद्गीता #गीता #श्लोक #सनातनधर्म
```

---

## C. Carousel — the static cards, upgraded

**Pair with:** `carousel/{reel}-1.png … -N.png` · **Post:** 1× / week.
Slide 1 is the hook. Add **alt text** to every slide — it's a real indexing surface.

```
{फल की चिंता छोड़ो} — {5} स्लाइड में।

{भगवद्गीता 2.47} का पूरा अर्थ, हिंदी और अंग्रेज़ी में।
→ स्वाइप कीजिए

सहेज लीजिए (save) — बाद में पढ़ने के लिए 🔖

#भगवद्गीता #श्लोक #अर्थ #सनातनधर्म
```

---

## D. Product reel — the 1-in-5

**Pair with:** `vedansh-ig-app.mp4` · **Post:** at most 1 in every 5 feed posts.
This is a *conversion* post. Do not expect reach from it (README §1.1).

```
{व्रत फिर छूट गया?} 😔

तारीख़ याद नहीं रही, कथा ढूँढते रह गए, और पता तब चला जब दिन निकल गया।

Vedansh में सब एक जगह है:
• पंचांग — तिथि, नक्षत्र, सूर्योदय, ब्रह्म मुहूर्त — आपके शहर का
• व्रत और पर्व का कैलेंडर — करवा चौथ, एकादशी, सत्यनारायण
• व्रत कथा — हिंदी और अंग्रेज़ी में
• याद दिलाने वाले reminders — एक रात पहले, और सुबह भी
• पूरी तरह ऑफ़लाइन। कोई अकाउंट नहीं, कोई विज्ञापन नहीं।

मुफ़्त · iPhone और Android
लिंक बायो में 🔗

#व्रत #पंचांग #हिंदूकैलेंडर #भगवद्गीता
```

---

## Stories (daily)

Stories don't earn reach — they're for the people you already have, and they're the
right home for the app screenshots currently taking up feed slots (README §4).

Worth running daily, cheap to make:

- **आज की तिथि** — today's Panchang, straight screenshot from the app.
- **Countdown sticker** to the next vrat.
- **Poll** — "इस बार एकादशी का व्रत रख रहे हैं?" हाँ / नहीं
- **Question box** — "कौन सा व्रत समझना है?" → answers become next week's reels.
- Re-share anyone who sends or tags a post.
