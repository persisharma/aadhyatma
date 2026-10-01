# Krishna Janma picture book — image prompts

For ChatGPT image generation. Prototype layout: `docs/katha-comic-prototype.html`.

## How to keep characters consistent

1. Generate the **character sheet** (step 0) first. Keep regenerating until you like it.
2. For every page, in the **same chat**, upload the character sheet and say "use these exact characters". Starting a new chat per page makes the faces drift.
3. Ask for **4:5 portrait, 1024×1280**, and repeat "no text, no letters" every time. The model likes to add captions, and the book already has them.
4. Use `docs/assets/krishna-janma/kj-08.webp` as the approved style reference for every page, alongside the character sheet. Match its muted palette, fine linework and face treatment; do not copy its river setting onto other scenes. The Yamuna should remain powerful and flooded despite the quiet colours.
5. Keep all critical figures inside the frame. Captions are rendered separately by the prototype; speech-bubble pages must retain the specified clear areas. Do not generate screenshot controls, usernames or other UI.
6. Save the files as `kj-01.png` … `kj-10.png`, in page order, and send them to me.

**Style block (paste at the end of every prompt):**

> Soft Indian devotional storybook illustration with thin warm-grey and brown outlines, graceful expressive almond-shaped eyes, smooth broad pastel fills and minimal gentle cel shading. Muted low-saturation palette: warm ivory parchment, powder-blue divine skin, dusty saffron and terracotta, sage and slate blue-grey water, restrained matte gold. Subtle paper texture, faint washed-out architecture, clear characters and simplified background detail. Devotional, dignified and suitable for children. Convey action through poses and shapes rather than loud colour or theatrical lighting. No heavy black comic outlines, saturated cobalt, vivid orange, photorealism, 3D, ornate borders or dense ornamentation. No text, no letters, no watermark. 4:5 portrait.

## 0. Character sheet

> A character reference sheet showing five figures standing side by side on a plain cream ground, arranged by position with no labels or text: (1) Vasudeva — warm wheat skin, black beard and moustache, hair tied in a top bun with a gold band, cream dhoti with red border, dusty saffron shoulder cloth, gold necklace, red tilak. (2) Devaki — fair skin, muted terracotta sari with restrained gold border draped over her head, dusty blue blouse, gold nose ring, red bindi. (3) Kansa — tan skin, tall gold crown with red jewels, thick curled moustache, fierce angled brow, muted sage dhoti with gold border, dusty maroon sash. (4) Baby Krishna — pale powder-blue skin, black curls, peacock feather in his hair, wrapped in pale butter-yellow cloth. (5) A palace guard — helmet with spike, muted terracotta tunic, ochre trousers, spear and round shield. [STYLE BLOCK]

## Pages

**kj-01 · Cover**
> Night inside a stone prison cell. A barred arched window at the top shows a half moon and stars. On a muted terracotta cloth in the centre lies newborn baby Krishna, glowing with golden light. Devaki kneels on the left and Vasudeva on the right, both with folded hands, gazing at him in awe. Iron chains on the walls. [STYLE BLOCK]

**kj-02 · The voice from the sky** (keep the top quarter calm for a speech bubble)
> A royal wedding chariot against a faint warm parchment palace setting: Kansa, crowned, drives it holding the reins of a white horse with a dusty terracotta saddle cloth. Devaki and Vasudeva stand behind him, newly married. Above them, a restrained soft golden light breaks through the sky as a divine voice speaks. Kansa looks up, startled. [STYLE BLOCK]

**kj-03 · The sword** (keep the top-left quarter clear)
> Kansa, furious, grips Devaki's hair with one hand and raises a sword high with the other. Devaki turns away in fear. Vasudeva steps forward calmly, hands open, pleading and reasoning with him. Faint warm-grey palace background on parchment. [STYLE BLOCK]

**kj-04 · Six lamps**
> A dark prison cell with chains on the walls. Devaki and Vasudeva stand in sorrow, shackled. On the floor, six small clay lamps have gone out, thin smoke rising from each. A single soft orb of light floats upward and away through the wall, symbolising the seventh child carried to Rohini. [STYLE BLOCK]

**kj-05 · Midnight**
> Midnight in the prison. Through the barred window a half moon glows among stars. A guard with a spear stands awake near the door. Devaki and Vasudeva wait in deep shadow on the right. Quiet and tense. [STYLE BLOCK]

**kj-06 · The four-armed Lord** (keep the top-left quarter clear)
> Lord Vishnu appears in the prison in a soft warm golden glow: pale powder-blue skin, four arms holding a conch, a discus, a mace and a pink lotus, a tall gold crown, pale butter-yellow silk dhoti, a forest garland, the red Kaustubha gem on his chest, standing on a lotus. A gold halo behind his head. Devaki on the left and Vasudeva on the right bow with folded hands. [STYLE BLOCK]

**kj-07 · The doors open**
> Two prison guards slump asleep against the wall with their spears. The huge prison door has swung open onto a night rainstorm. Vasudeva walks out carrying a basket on his head, the gently glowing powder-blue baby Krishna inside. [STYLE BLOCK]

**kj-08 · The Yamuna**
> A stormy night with rain and lightning. The flooded Yamuna river parts to open a path. Vasudeva walks through the middle carrying baby Krishna in a basket on his head. Behind him, the great five-hooded serpent Shesha rises and spreads his hoods over the basket like an umbrella. Keep the powerful flooded flow: large curling waves, sweeping currents and ivory foam around Vasudeva, like the earlier dynamic crossing compositions. Render water in desaturated slate blue-grey and sage with delicate outlines; do not make the river calm merely because the palette is muted. Keep the basket and faces unobstructed. The lower fifth fades into warm parchment. Small fish may be softly suggested. [STYLE BLOCK]

**kj-09 · Gokul**
> Night in Gokul village, with kadamba trees and a mud hut with a thatched roof. Inside the lamp-lit doorway, Yashoda sleeps on a cot and baby Krishna lies beside her. Outside, Vasudeva walks away carrying a basket with a newborn baby girl, wrapped in pink. [STYLE BLOCK]

**kj-10 · The Devi** (keep the bottom-left quarter clear)
> Inside the prison, the baby girl has risen into the air as the eight-armed Devi, radiant, in a muted terracotta sari with a gold crown, holding a trident, sword, discus, conch, bow, lotus, bell and shield, with a halo behind her. Below, Kansa looks up with his sword raised, small and afraid. [STYLE BLOCK]
