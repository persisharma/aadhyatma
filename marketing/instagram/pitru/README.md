# पितृ पक्ष — 5-card carousel

Rendered by [`../pitru-cards.mjs`](../pitru-cards.mjs): `node marketing/instagram/pitru-cards.mjs`.
1080×1350 (4:5), the same aspect the in-app share card exports (design.md §39).

Every card condenses a **verified** row of `mobile/src/data/pitru/lessons.ts` (PRD-44, RULEBOOK
§28) — nothing here asserts more than the app does, and the stance rule holds: explain, never
prescribe. No "must", no dosha, no fear copy. Re-run the script after editing a lesson so the
cards and the app stay in step.

| # | File | Lesson id | Background plate |
|---|------|-----------|------------------|
| 1 | `pitru-1-kya-hai.png` | `kya-hai` | `deity-navagraha-icons` |
| 2 | `pitru-2-shraddha-tarpan.png` | `shraddha-aur-tarpan` | `category-aarti-diya` |
| 3 | `pitru-3-jal-kyon.png` | `jal-kyon` | `deity-ganga` |
| 4 | `pitru-4-kiske-liye.png` | `kiske-liye` | `deity-rama-darbar` |
| 5 | `pitru-5-samay.png` | `samay` | `deity-surya` |

Post in that order — 1 is the hook, 5 closes on "consult your own panchang", which is the line
that earns a save rather than a scroll.

## Caption

> पितृ पक्ष: सोलह दिन, और वे पाँच बातें जो प्रायः पूछी जाती हैं।
>
> यह पक्ष तारीख़ों का नहीं, तिथियों का कैलेण्डर है। तर्पण श्राद्ध का एक अंग है, पूरा श्राद्ध नहीं।
> रामायण में पितृ-कर्म बार-बार एक ही रूप में मिलता है — अञ्जलि भर जल। और जटायु के प्रसंग में
> स्मरण का द्वार किसी वंश-सूची से नहीं, भाव से खुलता है।
>
> पूरा परिचय — सोलहों तिथियाँ, शास्त्र-वचन और कथाएँ — वेदांश़ ऐप में।
>
> निश्चित समय के लिए अपने स्थान का पंचांग या पुरोहित देखें।
>
> Follow @vedansh.app
>
> #पितृपक्ष #PitruPaksha #श्राद्ध #Shraddha #तर्पण #Mahalaya #सनातनधर्म #रामायण #Vedansh

The blank line before the tags is deliberate — Instagram collapses a caption after ~3 lines, so
the preview shows the content and not the tag block (same rule as `data/shareHashtags.ts`,
design.md §39.2).

## Notes

- Fonts (Noto Serif Devanagari · Cormorant Garamond · Inter) are fetched into `~/.fonts` on first
  run if fontconfig doesn't already have them.
- Backgrounds are the app's own sketch plates under the parchment overlay stack (design.md §6),
  so the carousel reads as the same object as the app — no stock photography, no AI render.
- `**…**` in a card body marks a `saffron-deep` emphasis run; it is the only accent the cards use.
