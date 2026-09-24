# पितृ पक्ष — 5-card carousel

Rendered by [`../pitru-cards.mjs`](../pitru-cards.mjs): `node marketing/instagram/pitru-cards.mjs`.
1080×1350 (4:5), the same aspect the in-app share card exports (design.md §39).

Every card condenses a **verified** row of `mobile/src/data/pitru/lessons.ts` (PRD-44, RULEBOOK
§28) — nothing here asserts more than the app does, and the stance rule holds: explain, never
prescribe. No "must", no dosha, no fear copy. Re-run the script after editing a lesson so the
cards and the app stay in step.

| # | File | Source rows | Background plate |
|---|------|-------------|------------------|
| 1 | `pitru-1-kya-hai.png` | `kya-hai` | `deity-navagraha-icons` |
| 2 | `pitru-2-kyon.png` | `kya-hai` + `gita-1-42` / `gita-9-25` (principles) | `source-vishnu-narayana` |
| 3 | `pitru-3-shraddha-tarpan.png` | `shraddha-aur-tarpan` | `category-aarti-diya` |
| 4 | `pitru-4-jal-kyon.png` | `jal-kyon` | `deity-ganga` |
| 5 | `pitru-5-kiske-liye.png` | `kiske-liye` + `kya-arpan-karein` (prashna) | `deity-rama-darbar` |

Post in that order. 1 defines the fortnight in the plainest words available (पितृ = पूर्वज, and
what the sixteen days are); 2 answers "why keep it at all" before any procedure is described; 5
closes on Rama offering forest roots — "जो हम खाते हैं, वही आपको अर्पित है" — which is the line
that earns a save rather than a scroll.

**`samay` (श्राद्ध का काल — Kutapa / Rohina / aparahna) is deliberately not a card.** It is
correct and it is in the app, but it needs three unfamiliar terms before it pays off, and a feed
card has no room to teach them. It belongs in the reading screen, not the carousel.

## Caption

Bilingual — all Hindi, then all English (2127 of Instagram's 2200 characters; add nothing
without cutting something). Paste as-is:

```text
🪔 पितृ पक्ष — क्या है, और क्यों?

1️⃣ पितृ यानी हमारे पूर्वज — माता-पिता, दादा-दादी, नाना-नानी और उनसे पहले की पीढ़ियाँ। साल में एक बार सोलह दिन उनके नाम रखे जाते हैं। जिस तिथि को किसी का देहान्त हुआ था, इन्हीं दिनों में उसी तिथि पर उन्हें याद किया जाता है। जिनकी तिथि याद नहीं, उनके लिए सर्वपितृ अमावस्या।

2️⃣ ये दिन माँगने के लिए नहीं, याद रखने के लिए हैं। गीता (९.२५) में श्रीकृष्ण कहते हैं — पितरों के उपासक पितरों को प्राप्त होते हैं।

3️⃣ तर्पण तिल मिले जल का अर्पण है — श्राद्ध का एक अंग, पूरा श्राद्ध नहीं।

4️⃣ रामायण में पितृ-कर्म एक ही रूप में मिलता है: अञ्जलि भर जल, दक्षिण की ओर मुख। श्रीराम ने यही दशरथ के लिए किया, और जटायु के लिए भी।

5️⃣ वन में श्रीराम के पास राजसी पदार्थ नहीं थे। इंगुदी के गूदे से पिता के लिए पिण्ड बनाया और कहा — "जो हम खाते हैं, वही आपको अर्पित है।" सामग्री नहीं, भाव देखा जाता है।

📖 सोलहों तिथियाँ, गीता-रामायण के वचन और कथाएँ — वेदांश़ ऐप में।
🙏 ऐसी और बातों के लिए @vedansh.app को फ़ॉलो करें।
📲 ऐप मुफ़्त है — iPhone और Android। डाउनलोड लिंक प्रोफ़ाइल (bio) में।

—

🪔 Pitru Paksha — what it is, and why

1️⃣ Pitr means our ancestors — parents, grandparents and the generations before them. Once a year, sixteen days are kept in their name. Each one is remembered on the tithi of their passing. For those whose tithi is no longer known, there is Sarvapitri Amavasya.

2️⃣ These days are not for asking — they are for remembering. In the Gita (9.25) Krishna says: those devoted to the pitrs reach the pitrs.

3️⃣ Tarpana is an offering of water with sesame — one limb of shraddha, not the whole of it.

4️⃣ In the Ramayana the rite takes one form again and again: cupped hands of water, face turned south. Rama offered it for Dasharatha, and for Jatayu too.

5️⃣ In the forest Rama had no royal fare. He made his father's pinda from ingudi pulp and said — "What we eat is what we offer you." It is the bhava that is seen, not the materials.

📖 All 16 tithis, the verses and the kathas — in the Vedansh app.
🙏 Follow @vedansh.app for more.
📲 Free on iPhone & Android. Download link in bio.

#पितृपक्ष #PitruPaksha #श्राद्ध #Shraddha #तर्पण #Tarpan #पूर्वज #Mahalaya #सनातनधर्म #Vedansh
```

The blank line before the tags is deliberate — Instagram collapses a caption after ~3 lines, so
the preview shows the content and not the tag block (same rule as `data/shareHashtags.ts`,
design.md §39.2).

## Notes

- Fonts (Noto Serif Devanagari · Cormorant Garamond · Inter) are fetched into `~/.fonts` on first
  run if fontconfig doesn't already have them.
- Backgrounds are the app's own sketch plates under the parchment overlay stack (design.md §6),
  so the carousel reads as the same object as the app — no stock photography, no AI render.
- `**…**` in a card body marks a `saffron-deep` emphasis run; it is the only accent the cards use.

## Reel companion

```bash
node marketing/instagram/make-reel.js pitru          # → marketing/instagram/vedansh-ig-pitru.mp4
node marketing/instagram/make-reel.js pitru --safe   # preview with IG's chrome zones burned in
```

20 s, 7 hard-cut beats, 1080×1920: hook `पितृ पक्ष क्या है?` → one beat per carousel card → CTA
that repeats the hook so the loop seam is invisible. Same verified content, same sketch plates,
rendered in the manifest's `theme: 'parchment'` (a `make-reel.js` option: parchment base, the
slide's `plate` full-bleed, wash heaviest behind the live box).

**The reel is not the five PNGs played in sequence**, on purpose. The cards carry ~60 words each
(~12 s of reading per card), and IG's own chrome covers the bottom 540 px and the right 250 px of
a reel — exactly where each card's footer and right-hand text sit. So the reel cuts each card
down to one line that fits the safe box and passes the `reel-checklist.md` lint; the carousel
carries the full text. Post both: the reel for reach, the carousel for saves.

The MP4 is gitignored (`marketing/instagram/*.mp4`) — regenerate it. It needs an ffmpeg with
libx264 (`FFMPEG_BIN`); Playwright's bundled ffmpeg is VP8-only and will not do. Add audio in the
Instagram composer — the file is silent by design (README §5).
