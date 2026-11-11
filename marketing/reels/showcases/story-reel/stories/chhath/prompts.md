# Chhath Puja reel: script and image prompts

Source: the app's `mobile/src/panchang/kathaContent/entries/chhath-puja-katha.ts`, sections 3–4 (King Priyavrat
and Queen Malini; Devi Shashthi's boon). Date: `chhath-puja` = 15 Nov 2026 (`precomputedObservances.ts`).
Format: about 38 s, Instagram format. Hook rules: the climax image on frame 1, speech from 0 s, big
on-screen text, and the answer held to the end. The user generates the images with an AI image tool
(commercial use permitted); this kit adds pan/zoom, captions, voice and branding.

## Script

| # | Image | Narration |
|---|---|---|
| 1 HOOK | 01-arghya | छठ में सूर्य देव के साथ जिनकी पूजा होती है, वो छठी मैया कौन हैं? |
| 2 | 02-palace | राजा प्रियव्रत और रानी मालिनी की कोई संतान नहीं थी। |
| 3 | 03-yagya | महर्षि कश्यप के यज्ञ से पुत्र तो हुआ, पर मृत। |
| 4 | 04-grief | दुखी राजा शिशु को लेकर श्मशान पहुँचे, और प्राण त्यागने को तैयार हो गए। |
| 5 | 05-devi | तभी आकाश से उतरीं देवी षष्ठी, यानी छठी मैया! |
| 6 | 06-alive | उन्होंने शिशु पर हाथ फेरा, और बालक जी उठा! |
| 7 | 07-ghat | देवी ने कहा, कार्तिक शुक्ल षष्ठी को डूबते और उगते सूर्य को अर्घ्य दो, संतान और आरोग्य मिलेगा। तभी से मनता है छठ महापर्व। |
| 8 CTA | 01-arghya (reused) | छठ की पूरी कथा और प्रसाद, वेदांश ऐप में। जय छठी मैया! |

## Shared style block (paste at the start of every prompt)

```text
Vertical 9:16 portrait, 1080x1920. Detailed Indian devotional storybook painting in the Vedansh
"Style 3" look: fine warm-brown outlines, graceful expressive faces, soft layered painterly shading,
restrained matte gold, subtle paper grain, rich environmental detail (cloth folds, jewellery,
foliage, architecture). For social video make it warmer and brighter than the app banners:
golden-hour light, clear tonal separation, readable on a phone. Main subject large, filling the
middle and lower two-thirds of the frame. Keep the TOP 30% calm (sky, wall or soft background,
no faces) for captions. No text, letters, watermark, border or logo. Not photorealistic, no 3D
gloss, no neon, no harsh black outlines.
```

## Fixed characters (keep identical across images)

- **Vrati (scene 1):** an Indian woman of about 35, in a yellow saree with a red border, a long
  orange sindoor line from the nose to the hair parting, a gold nath, and glass bangles.
- **King Priyavrat:** about 35, trimmed dark beard, tall gold crown, maroon-and-gold dhoti,
  ivory uttariya, pearl necklace.
- **Queen Malini:** about 30, gold tiara, deep green saree with a gold border, gentle face.
- **Maharshi Kashyap:** elderly sage with a long white beard and jata, saffron cloth and rudraksha.
- **Devi Shashthi (Chhathi Maiya):** a motherly goddess with TWO arms, red saree with gold
  border, gold crown, calm loving smile, soft golden aura. No vahana, no weapons.
- **Infant:** a newborn wrapped in plain white cloth.

## Scene prompts (paste each after the style block)

1. **01-arghya (HOOK and CTA)**: Scene: Chhath Puja evening arghya. The Vrati stands waist-deep
   in a calm river, facing a huge glowing orange setting sun. She raises a bamboo soop (winnowing
   tray) with thekua, bananas, a coconut, sugarcane and a small lit diya; water drips from the
   soop. Behind her, a ghat with sugarcane canopies and diyas on the steps, and other devotees
   blurred in the distance. Emotion: devotion, peace. The sun and the soop sit in the centre of
   the frame.
2. **02-palace**: Scene: a palace chamber at dusk. King Priyavrat and Queen Malini sit together
   on a carved seat, sad. The queen looks at an empty wooden cradle beside them; the king rests a
   hand on her shoulder. Oil lamps, carved pillars, silk curtains. Emotion: quiet longing.
3. **03-yagya**: Scene: a palace courtyard yagya. Maharshi Kashyap offers ghee into a bright
   fire altar; King Priyavrat and Queen Malini sit with folded hands; the sage hands the queen a
   small bowl of kheer prasad. Smoke rises; marigold garlands. Emotion: hope.
4. **04-grief**: Scene: a riverside cremation ground at dusk, dry trees, ash, faint smoke, empty
   pyre frame in the background. King Priyavrat kneels alone, holding the swaddled infant close to
   his chest, eyes closed in grief, crown fallen beside him. No fire on any person, no injury, no
   blood. Emotion: deep sorrow.
5. **05-devi**: Scene: the same cremation ground. From a glowing golden sky, a small ornate
   flower-decked celestial vimana descends. Devi Shashthi stands in it with soft golden light
   around her, looking down with compassion. The kneeling king, holding the infant, looks up in
   awe. Emotion: wonder.
6. **06-alive**: Scene: Devi Shashthi gently places her right hand on the infant's head; the
   newborn opens its eyes and smiles, one tiny hand reaching up. King Priyavrat, still kneeling,
   weeps with joy. Petals falling, warm golden light replaces the dusk. Emotion: joy, relief.
7. **07-ghat**: Scene: a grand Chhath ghat at sunrise. Rows of women in colourful sarees stand
   waist-deep in the river raising soops toward the rising sun; men carry daura baskets on their
   heads; sugarcane canopies, diyas and rangoli on the steps; a faint image of Chhathi Maiya's
   kind face in the morning sky. Emotion: celebration, faith.

## Review before use

- Two arms on Devi Shashthi. The app text does not specify iconography; two arms and no vahana is
  a deliberate, simple choice and needs the user's approval.
- No extra fingers, merged limbs or garbled text-like marks; the infant is safely held; the sindoor
  line and nath are on the Vrati only.
- Save the approved files as `01-arghya.png` … `07-ghat.png` in this folder.
