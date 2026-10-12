# Exact-source asset correction

Built-in image_gen was used for23 individual transparent assets. Inputs were enlarged close-ups of the selected Option1 board (SHA and crop coordinates in `mobile/assets/icons/storybook/manifest.json`). Enlarging the input before image_gen preserved the original subject much more closely than a generic style prompt. Native exports are512px; visible bounds432px; only normalizing/resampling, alpha cleanup and palette compression followed generation.

Prompt set: “Remove only the parchment from this exact existing illustration. Preserve original subject contours, proportions, pigments, lineweight, arrangement and detail. Source preservation, not redesign. No stronger bright orange, glossy gold, bevel, invented decoration, background, shadow or tile. Genuine transparent alpha around and inside the subject. Center on a square canvas with9% margins.” Each call names its pictured subject and these invariants:

| Subject | Required correction |
| --- | --- |
| Om / Stotram | Matte burnt ochre; original glyph strokes and diamond dot; no bevel or gold outline. |
| Chalisa | Smooth wooden beads, original tilted loop and thin attached tassel. |
| Japa | Smooth dark brown beads, oval loop and large pendant at lower left. |
| Kundali | Thin dark doubled border, original diamond/diagonals, sun and small house marks. |
| Granth | Many layered folios, manuscript marks, brown page edges and tied cord. |
| Aarti / Muhurat | Source shallow bowls/dial, thin foot, original flame or pointer/rays and matte brass pigments. |
| Vrat | Original coconut/olive leaves, pot proportions and painted Om. |
| Sanskar / Theerth / Deities / Purpose / Kavacham / Ashtakam | Preserve exact source book/temple/shrine/compass/shield/petal shapes and pigments. |
| Suktam | Source scroll silhouette and pigment; three abstract manuscript bands instead of fabricated scripture. |
| Daan | Source bowl/etched body and three central seed-shaped offerings; remove extra rear petals, no money motifs. |
| Krishna / Shiva / Rama / Hanuman | Exact source attribute silhouettes, positioning, texture and muted pigments. |
| Practice nudge | Two asymmetric olive leaves with brown stem and original veins. |
| Bhakti / Panchang navigation | Original broad simple trident and sun/moon shapes; fully opaque silhouette for theme tinting at tab size. |

Sixteen other deity subjects are not individually pictured in Option1 and retain their distinct semantic illustrations. Utilities use Phosphor with shared brown ink/active ochre tokens. Native structure, content, fonts and routes follow the original simulator app.
