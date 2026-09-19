# पितृ पक्ष 2026 — reel campaign plan

**Window (solved with the app's own engine, not a calendar site):**

| | Date | Tithi |
|---|---|---|
| पूर्णिमा श्राद्ध | **Sat 26 Sep 2026** | भाद्रपद शुक्ल पूर्णिमा |
| प्रतिपदा श्राद्ध (fortnight starts) | Sun 27 Sep 2026 | आश्विन कृष्ण प्रतिपदा |
| **सर्वपितृ अमावस्या** (fortnight ends) | **Sat 10 Oct 2026** | आश्विन कृष्ण अमावस्या |

Reproduce: `pitruPakshaWindow(2026)` in `mobile/src/panchang/pitruSmaran.ts` (sunrise/udaya-vyapini anga,
purnimant rules, Ujjain default). Today is 19 Sep 2026 → **7 days of pre-season runway, 15 season days.**

---

## 1. Strategy — "educate to all"

The reference material (Sri Mandir's Panchbali carousel + "Be a part of this seva" reel) is a **seva
funnel**: emotional hook → taxonomy card → paid offering with video proof. We are not selling a ritual.
Vedansh's asset is that it is the only app in this space that **teaches the fortnight and then gets out
of the way** — no priest marketplace, no donation rail, no ancestor data leaving the phone.

So the campaign is a three-rung ladder, and the rung ratio is the whole plan:

| Rung | What it does | Share of slate | Format |
|---|---|---|---|
| **1 · शिक्षा (educate)** | Answers the questions people actually search: what, why, which day, why a tithi. App is a watermark only. | **~60%** (10 reels) | `content/*.content.mjs` — full-frame typographic cards (`make-content.mjs`) |
| **2 · व्यवहार (enable)** | What a household can honestly do: tila-tarpana, anna-daan, the day-by-day map, what we deliberately leave to your kul. | **~30%** (5 reels) | same content pipeline |
| **3 · उत्पाद (product)** | One soft proof per week — the fortnight overview lighting up your family's day; the privacy stance. | **~10%** (2 reels) | `reels/*.reel.mjs` — Maestro-driven live app capture |

Educate reels carry a **send-CTA** (`send:` field), not a download card: "जिनके घर में यह पक्ष मनता है —
उन्हें भेजिए." Shares are the distribution engine during Pitru Paksha; installs follow the two product reels.

**House rules for the whole slate (non-negotiable):**
- No selling, no booking, no "we will perform it for you", no money on screen. Ever.
- No promised result ("पितृ प्रसन्न होंगे, बाधा टलेगी") — remembrance is the frame, not transaction.
- **Mantra-free**, exactly like the shipped vidhi. We do not voice a formula, gotra pattern or sankalp
  we have not sourced (`mobile/src/data/vidhi/shraddha-tarpan-vidhi.ts` stance).
- Every reel that touches procedure must say the variance line once: **"परम्परा भिन्न-भिन्न है — अपने कुल की
  विधि ही मानें।"**
- No AI "ancestors rising into the clouds" imagery (the reference does this), no funeral/mourning stock,
  no real family photographs. Brand cards + the app's own shipped visuals only.
- No user data, ever — no names, no counts, no ledger. That restraint is itself reel #17's content.
- Any factual claim must trace to `docs/roadmap/conventions/shraddha-tarpan-source-dossier.md`
  (Gita Press code 592, Dharma Sindhu ch. 26, Drik shraddha pages) or to shipped app copy.

---

## 2. The slate — 17 reels

`fmt`: **C** = content reel (`content/<slug>.content.mjs`, ≤17 s, no simulator) · **A** = app reel
(`reels/<slug>.reel.mjs`, needs a booted sim + Maestro + native build).

### Rung 1 — शिक्षा · pre-season (Sun 20 – Fri 25 Sep)

| # | slug | ship | fmt | hook (spoken + big on frame 0) | grounding |
|---|---|---|---|---|---|
| 1 | `pitru-paksha-kya` | 20 Sep | C | पितृ पक्ष है क्या — और 26 सितम्बर से क्यों? | `pitruSmaran.ts` window · **built** ✅ |
| 2 | `pitru-rin` | 21 Sep | C | तीन ऋण लेकर जन्मे हैं — एक पितृ-ऋण है। | dossier (Dharma Sindhu ch. 26) |
| 3 | `shraddha-shabd` | 22 Sep | C | 'श्राद्ध' का अर्थ 'मृत्यु' नहीं — 'श्रद्धा' है। | `data/daan/principles.ts` (`shraddhaya-deyam`) |
| 4 | `tithi-kyon` | 23 Sep | C | तारीख़ याद है, फिर भी श्राद्ध तिथि से क्यों? | `pitruSmaran.ts` TithiRule model |
| 5 | `sarvapitri-kise` | 24 Sep | C | तिथि पता ही नहीं — तो श्राद्ध किस दिन? | `'sarvapitri'` fallback in `SmaranEntry` |
| 6 | `solah-din` | 25 Sep | C | सोलह दिन, और हर दिन किसी न किसी का। | fortnight table (see §4 risk) |

### Rung 2 — व्यवहार + rung 1 continued · in-season (Sat 26 Sep – Sat 10 Oct)

| # | slug | ship | fmt | hook | grounding |
|---|---|---|---|---|---|
| 7 | `purnima-shraddha` | 26 Sep (day-of) | C | आज पूर्णिमा श्राद्ध — पक्ष यहीं से शुरू। | engine |
| 8 | `tarpan-kaise` | 27 Sep | C | जल, काला तिल, और दो हथेलियाँ — तर्पण इतना ही है। | `shraddha-tarpan-vidhi.ts` samagri/steps |
| 9 | `kya-nahi-batate` | 29 Sep | C | जो हम आपको नहीं बताएँगे — और क्यों नहीं। | vidhi's own omissions (gotra, पिण्ड, होम, यज्ञोपवीत) |
| 10 | `anna-daan` | 1 Oct | C | श्राद्ध का केन्द्र कर्मकाण्ड नहीं — भोजन है। | `data/daan/occasions.ts` (`pitru-paksha`) |
| 11 | `panchbali` | 3 Oct | C | गाय, श्वान, काक, देव, पिपीलिका — पंचबलि क्या है? | **content-only; cite sources on card (§4)** |
| 12 | `matri-navami` | 4 Oct | C | नवमी माताओं की — सौभाग्यवती श्राद्ध। | Drik shraddha-days |
| 13 | `gaya-kyon` | 6 Oct | C | गया में ही पिण्ड क्यों? गयासुर की कथा। | `theerth/temples.ts` `vishnupad-gaya` shipped significance/origin |
| 14 | `chaturdashi-kiske` | 9 Oct | C | चतुर्दशी — अकाल मृत्यु वालों का दिन। | Drik shraddha-days |
| 15 | `sarvapitri-amavasya` | 10 Oct (day-of) | C | जिनका नाम नहीं ले पाए — आज का दिन उन्हीं का। | engine + `'sarvapitri'` |

### Rung 3 — उत्पाद (one per week)

| # | slug | ship | fmt | story | capture path |
|---|---|---|---|---|---|
| 16 | `pitru-paksha-overview` | 28 Sep | A | सोलह दिन एक पन्ने पर — और आपके परिवार का दिन ख़ुद जल उठता है। | preroll: `tabId more` → `more-pitru-smaran` → `॥ पितृ पक्ष चल रहा है` door → `PitruPakshaOverview`; beat: scroll the fortnight rows, hold on a saffron family-matched row; door `pitru-paksha-vidhi-door` |
| 17 | `smaran-niji` | 5 Oct | A | नाम आपके फ़ोन से बाहर नहीं जाता। कोई सर्वर नहीं, कोई गिनती नहीं। | preroll: More → Pitru Smaran → detail; beat: reminder switch + the "on this device" line. **Show no real name — seed a relation-only entry (पिताजी).** |

### Closer

| # | slug | ship | fmt | hook |
|---|---|---|---|---|
| — | `paksha-ke-baad` | 11 Oct | C | पक्ष पूरा हुआ — स्मरण नहीं होता। |

**If bandwidth is short, ship these 10 and drop the rest:** 1, 4, 5, 6, 8, 10, 11, 15, 16, 17.

---

## 3. Scripts — the first four, ready to paste

Drop each into `marketing/reels/content/<slug>.content.mjs`. Shape and pacing follow
`content/ekadashi-why.content.mjs` (hook + 2 beats + send-CTA, ≤17 s).

```js
// 1 — pitru-paksha-kya
export default {
  slug: 'pitru-paksha-kya', bg: 'vishnu',
  hook: { hi: 'पितृ पक्ष 26 सितम्बर से —\nहै क्या यह?', en: 'Pitru Paksha begins 26 September — what is it?' },
  beats: [
    { text: { hi: 'भाद्रपद पूर्णिमा से\nआश्विन अमावस्या तक —\nसोलह दिन।', en: 'Bhadrapada Purnima to Ashvina Amavasya — sixteen days.' },
      narration: { hi: 'भाद्रपद पूर्णिमा से आश्विन अमावस्या तक, सोलह दिन।', en: 'Bhadrapada Purnima to Ashvina Amavasya — sixteen days.' } },
    { text: { hi: 'शोक का पक्ष नहीं —\nस्मरण का पक्ष।', en: 'Not a fortnight of grief — of remembrance.' },
      narration: { hi: 'यह शोक का पक्ष नहीं, स्मरण का पक्ष है।', en: 'This is not a fortnight of grief. It is one of remembrance.' } },
  ],
  cta: { hi: 'जिनके घर यह पक्ष मनता है, उन्हें भेजिए।', en: 'Send it to the homes that keep it.' },
  send: { hi: 'जिनके घर यह पक्ष मनता है —\nउन्हें भेजिए', en: 'Send it to the homes that keep it' },
};
```

```js
// 4 — tithi-kyon
export default {
  slug: 'tithi-kyon', bg: 'vishnu',
  hook: { hi: 'तारीख़ याद है —\nफिर श्राद्ध तिथि से क्यों?', en: 'You remember the date — so why go by tithi?' },
  beats: [
    { text: { hi: 'जिस तिथि पर वे गए,\nवही हर वर्ष लौटती है —\nतारीख़ नहीं।', en: 'The tithi they left on returns every year — the calendar date does not.' },
      narration: { hi: 'जिस तिथि पर वे गए, वही हर वर्ष लौटती है — तारीख़ नहीं।', en: 'The tithi they left on returns each year. The calendar date does not.' } },
    { text: { hi: 'इसीलिए श्राद्ध\nहर साल अलग दिन पड़ता है।', en: 'That is why shraddha falls on a different day each year.' },
      narration: { hi: 'इसीलिए श्राद्ध हर साल अलग दिन पड़ता है।', en: 'That is why the shraddha day moves every year.' } },
  ],
  cta: { hi: 'जिन्हें तिथि निकालनी है, उन्हें भेजिए।', en: 'Send it to whoever must work out the tithi.' },
  send: { hi: 'जिन्हें तिथि निकालनी है —\nउन्हें भेजिए', en: 'Send it to whoever must work out the tithi' },
};
```

```js
// 8 — tarpan-kaise  (samagri + the honesty beat, straight from the shipped vidhi)
export default {
  slug: 'tarpan-kaise', bg: 'vishnu',
  hook: { hi: 'तर्पण के लिए\nक्या-क्या चाहिए?', en: 'What does tarpana actually need?' },
  beats: [
    { text: { hi: 'शुद्ध जल · काला तिल ·\nपात्र · कुश · स्वच्छ आसन', en: 'Clean water · black sesame · a vessel · kusha · a clean seat' },
      narration: { hi: 'शुद्ध जल, काला तिल, तर्पण पात्र, कुश और स्वच्छ आसन।', en: 'Clean water, black sesame, a vessel, kusha, a clean seat.' } },
    { text: { hi: 'मन्त्र, गोत्र, संकल्प —\nअपने कुल की विधि\nया पुरोहित से।', en: 'Mantra, gotra, sankalpa — from your family tradition or your purohit.' },
      narration: { hi: 'मन्त्र, गोत्र और संकल्प अपने कुल की विधि से लें — परम्परा भिन्न-भिन्न है।', en: 'Take the mantra, gotra and sankalpa from your own tradition — these differ sharply.' } },
  ],
  cta: { hi: 'घर में तर्पण करने वालों को भेजिए।', en: 'Send it to those doing tarpana at home.' },
  send: { hi: 'घर में तर्पण करने वालों को —\nभेजिए', en: 'Send it to those doing tarpana at home' },
};
```

```js
// 15 — sarvapitri-amavasya  (10 Oct, the volume day)
export default {
  slug: 'sarvapitri-amavasya', bg: 'vishnu',
  hook: { hi: 'जिनकी तिथि\nकिसी को याद नहीं —\nआज का दिन उन्हीं का।', en: 'For those whose tithi no one remembers — today is theirs.' },
  beats: [
    { text: { hi: 'सर्वपितृ अमावस्या —\nपक्ष का अन्तिम दिन।', en: 'Sarvapitri Amavasya — the last day of the fortnight.' },
      narration: { hi: 'सर्वपितृ अमावस्या — पितृ पक्ष का अन्तिम दिन।', en: 'Sarvapitri Amavasya, the last day of Pitru Paksha.' } },
    { text: { hi: 'जो छूट गए, जो अनजाने रहे —\nसबका श्राद्ध आज।', en: 'Everyone missed, everyone unnamed — today is for all of them.' },
      narration: { hi: 'जो छूट गए और जो अनजाने रह गए — सबका स्मरण आज।', en: 'Everyone missed, everyone unnamed — all of them are remembered today.' } },
  ],
  cta: { hi: 'परिवार के समूह में भेज दीजिए।', en: 'Send it to the family group.' },
  send: { hi: 'परिवार के समूह में —\nभेज दीजिए', en: 'Send it to the family group' },
};
```

**Built:** `content/pitru-paksha-kya.content.mjs` → `out/vedansh-content-pitru-paksha-kya-hi.mp4`
(1080×1920, 30 fps, **15.5 s**). Rendered here with `--tts silence` because this build host cannot
reach any TTS engine — the cut, the cards and the length are final; **re-run
`node make-content.mjs pitru-paksha-kya --lang hi` on a machine with edge-TTS reach to lay the Hindi
voice into the same timing before publishing.**

Remaining 13 scripts follow the same shape; hooks are fixed in §2 so they can be written straight into the files.

---

## 4. Verification gates (do these before any day-specific reel ships)

1. **The day-by-day map (`solah-din`, `matri-navami`, `chaturdashi-kiske`) is the one real risk.**
   The engine's 2026 sunrise anga skips अष्टमी entirely: 3 Oct is सप्तमी at sunrise, 4 Oct is नवमी.
   Shraddha days are traditionally reckoned **अपराह्न-व्यापिनी**, not by sunrise, so the app's chip and
   Drik can legitimately disagree on a kshaya day. **Cross-check every named day against
   drikpanchang.com/shraddha/pitru-paksha-shraddha-dates.html before recording, and do not voice a day
   where the two disagree** — say "अपने पंचांग में देखें" instead. Log the comparison in the PR.
2. **`panchbali` is content-only.** The app ships no panchbali procedure; do not imply it does, and put
   the source line on the card (Dharma Sindhu / Gita Press 592, dossier §). Voice the regional-variance
   line in-frame.
3. **`gaya-kyon` must quote the shipped copy**, not a rewrite: `theerth/temples.ts` →
   `vishnupad-gaya` `originStory*` / `significance*`.
4. **App reels capture a seeded device only** — a relation-only Pitru Smaran entry (पिताजी, no name).
   Screenshot-review every frame for a leaked name before assembly, per the PRD-17 privacy stance.
5. Re-run the window solve on the recording day; a reel that names a date is wrong forever if it is off.

---

## 5. Production

**Content reels (C)** — `cd marketing/reels && node make-content.mjs <slug> --lang hi`
Needs `ffmpeg`, headless Chrome, edge-TTS (`edge_synth.py`). No simulator, no Maestro, so these can be
batched: write all 15 defs, render in one pass, review as a set.
- `bg:` — there is **no pitru-specific background asset** in `make-content.mjs`'s `BG` map. Use
  `'vishnu'` (`source-vishnu-narayana.webp`, the Gaya/Vishnupad thread) or omit `bg` for the plain
  gradient. If a dedicated still is wanted (a river ghat at dawn, a diya, til in a bowl), add the asset
  under `mobile/assets/backgrounds/` and one key to `BG` — one small PR, not a blocker.
- Hindi is primary. Render `--lang en` only for 1, 4, 11, 16, 17 (the explainers that travel).

**App reels (A)** — `REEL_APP_ID=com.prashantsharma.vedansh node make-reel.mjs <slug> --lang hi`
Needs one booted iOS sim with a native build + Maestro. Keep navigation in `preroll` (camera off) and
leave **one motion-rich beat**, per the `ganesh-utsav` lesson — split beats with no motion get starved
to ~0.1 s clips.

**Cadence:** 1 reel/day, published **19:30–20:30 IST** (evening, family-phone hours). Day-of reels
(#7, #15) go out by **07:30 IST** so they are useful that morning.

**Distribution per reel:** IG Reels (primary) → YouTube Shorts (same file) → WhatsApp Status (same
file) → the send-CTA does the rest. Caption pattern borrowed from the reference, minus the funnel:
2-line hook, 3–4 emoji bullets, the variance line, **no link in the first 3 lines**; app link only in
the last line of the caption, never in the voiceover for rung-1 reels.

---

## 6. Success signals

Reels are judged on **sends/saves, not views** — a reel that is forwarded into a family WhatsApp group
did its job. Track, per reel: shares ÷ views (target ≥ 4% for rung 1), saves ÷ views (≥ 2%), watch-through
(≥ 70%, which is what ≤17 s buys), and — for #16/#17 only — profile taps. If rung-1 share rate holds but
product-reel taps do not, add a third product reel on 8 Oct rather than converting educate reels.

---

## 7. Open decisions

- **Dedicated background asset** for the pitru set — ship the plain gradient, or add one still? (§5)
- **`solah-din` day map**: publish only if engine and Drik agree on every day; otherwise reframe the reel
  as "हर दिन किसी का — अपना दिन पंचांग में देखिए" with no day named. (§4.1)
- **English renders**: 5 of 17 as proposed. Widen only if the en cuts of #1/#4 hold watch-through.
