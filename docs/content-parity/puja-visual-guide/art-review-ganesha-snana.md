# Ganesh snana correction

Current full-audit update: Diwali now pairs `ganesha-snana.webp` with the more complete `ganesha-upachara.webp` (durva, hibiscus, akshat, cloth, mauli, chandan and sindoor). Ganesh Chaturthi retains the snana image. All consuming images now resolve via R2 descriptors, not bundled requires. The earlier follow-up and native screenshots below are historical; see `semantic-audit.md` for the current assignments and pending upload/CDN evidence.

## Follow-up: include upachara and durva

The Diwali step combines snana and upachara. Its initial snana-only correction below did not illustrate the durva offering. Current conduct renders `ganesha-snana.webp` followed by the existing `ganesha-offering.webp`, pairing the two existing instruction clauses with those actions. The overview uses the durva-offering thumbnail. The second image visibly shows green durva, a red flower and akshat at Ganesh's feet; it does not depict every text-listed material (cloth/mauli/chandan/sindoor remain in the unchanged instruction). No new ritual copy, counts or mantras. Both images preserve their full canvases. Captions remain readable if either image fails. Native Hindi step 8 was reviewed at the top and after accessibility scrolling to the lower durva clause. Evidence: `ganesha-upachara-snana-top.png` and `ganesha-upachara-durva.png` under `docs/evaluations/puja-visual-guide-2026-10-20/`. No automated tests run for this follow-up. The earlier single-image evidence below is historical.

Date: 2026-10-21. Built-in imagegen; no CLI/API fallback.

- Issue: Diwali Ganesh snana showed panchamrit ingredients; Ganesh Chaturthi snana showed water poured into a bowl. Neither depicted the Ganesh bathing instruction.
- Final asset: `mobile/assets/vidhi-steps/ganesha-snana.webp`, 1200 × 800, full canvas retained, cwebp quality 95.
- Final SHA-256: `ea8268beb36871600d8cff030bae1de3c86b07a3ec375da11d3672639203ccce`; 289,998 bytes.
- Original: `/Users/prashant/.codex/generated_images/01a15291-2167-7273-a723-7e43c8ea58a5/exec-b42fce50-1750-4c59-8c3a-fb7c6393be3f.png`, 1536 × 1024.
- Style/subject reference: `mobile/assets/vidhi-steps/ganesha-offering.webp`.
- Explicit assignments: Diwali `ganesh-upachara` and Ganesh Chaturthi `snana`.
- Existing bilingual ritual text is unchanged. This image illustrates the symbolic-snana option, not the metal-murti bathing alternative or every subsequent offering.
- Visually inspected original and final WebP: complete Ganesh murti, flower held above crown, clear droplets, water bowl; no panchamrit, milk stream, immersion, unrelated deity, lettering or cropped pedestal.
- Native Diwali step 8 reviewed: image and complete Hindi instruction visible with adjacent timeline rows. Evidence: `docs/evaluations/puja-visual-guide-2026-10-20/ganesha-snana-corrected.png`. Ganesh Chaturthi consumes the same bundled asset; its native page was not separately reviewed.
- No automated tests run for this correction. No release, upload or commit.

## Exact prompt

```text
Use case: illustration-story
Asset type: one standalone actionable illustration for the Ganesh snana step in a mobile puja guide.
Input image: reference for painting style, warm parchment palette and Ganesh clay murti identity only.
Primary request: depict symbolic snana of a small seated terracotta Ganesh murti using a flower wetted with clean water. A natural adult right hand holds a small fresh flower above and beside Ganesh's crown, gently sprinkling a few distinct transparent water droplets toward the murti. Show the action clearly; do not simply place a flower at his feet.
Subject: recognizable respectful seated elephant-headed Ganesh clay murti with intact crown, trunk, ears, four arms and complete pedestal. One small brass bowl of clear water beside the pedestal, with its surface visible. Only a few water droplets, no bath stream, no immersion, no milk or panchamrit. No ingredients still-life.
Scene: simple clean low wooden surface on soft warm pale parchment background. A single compact red cloth beneath the murti is acceptable.
Style: match reference richly painted Indian storybook detail, warm terracotta, brass, restrained red accents, fine brushwork, feathered edges.
Composition: landscape 3:2, requested 1200 x 800. Entire murti, crown, pedestal, bowl, flower and all fingers inside frame. A short wrist may fade gently at left edge. Ganesh and the flower-sprinkling action should read clearly on a phone. No crop or blank caption band.
Text: none.
Constraints: no pouring vessel above murti, no white liquid, no shower, no extra deities, no Shiva linga, no flames, no labels, no text, no UI, no border or watermark. Preserve complete Ganesh form. Follow the existing instruction: symbolic sprinkling of water with a flower for a clay murti.
```
