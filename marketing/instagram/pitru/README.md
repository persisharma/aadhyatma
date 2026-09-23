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

> पितृ पक्ष — यानी क्या, और क्यों।
>
> पितृ यानी हमारे पूर्वज। साल में एक बार सोलह दिन उनके नाम रखे जाते हैं। जिस तिथि को किसी का
> देहान्त हुआ था, इन्हीं दिनों में उसी तिथि पर उन्हें याद किया जाता है — यह तारीख़ों का नहीं,
> तिथियों का कैलेण्डर है।
>
> इन दिनों कुछ माँगा नहीं जाता; याद किया जाता है। और सामग्री न हो तो भी बात रुकती नहीं — वन में
> श्रीराम ने इंगुदी के गूदे से पिता के लिए पिण्ड बनाया और कहा: जो हम खाते हैं, वही आपको अर्पित है।
>
> पूरा परिचय — सोलहों तिथियाँ, शास्त्र-वचन और कथाएँ — वेदांश़ ऐप में।
>
> Follow @vedansh.app
>
> #पितृपक्ष #PitruPaksha #श्राद्ध #Shraddha #तर्पण #पूर्वज #Mahalaya #सनातनधर्म #रामायण #Vedansh

The blank line before the tags is deliberate — Instagram collapses a caption after ~3 lines, so
the preview shows the content and not the tag block (same rule as `data/shareHashtags.ts`,
design.md §39.2).

## Notes

- Fonts (Noto Serif Devanagari · Cormorant Garamond · Inter) are fetched into `~/.fonts` on first
  run if fontconfig doesn't already have them.
- Backgrounds are the app's own sketch plates under the parchment overlay stack (design.md §6),
  so the carousel reads as the same object as the app — no stock photography, no AI render.
- `**…**` in a card body marks a `saffron-deep` emphasis run; it is the only accent the cards use.
