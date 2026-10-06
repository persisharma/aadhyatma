# Picture-story illustration style

Use this for future illustrated stories. The Krishna Janma scene prompts and character notes remain in [`krishna-janma-art-prompts.md`](krishna-janma-art-prompts.md).

## Visual reference and format

- Use [`kj-08.webp`](../assets/krishna-janma/kj-08.webp) for the approved storybook rendering: fine warm outlines, expressive faces, muted colours and soft paper texture. Use [`kj-11.webp`](../assets/krishna-janma/kj-11.webp) for the warm, intimate closing-page treatment and lower parchment fade.
- Make one new image per distinct scene. Refer to the preceding approved page and a character sheet to keep faces, clothing and scale consistent within the story. A style reference supplies technique and palette, not its setting or characters.
- Deliver a text-free 4:5 portrait image. Keep faces and essential action in the upper four-fifths; fade the lower fifth gently into warm parchment. The reader places native text beneath the image and may crop only the bottom.
- The shipped WebP files are 1122 × 1402 pixels in both `mobile/assets/kids-stories/` and `docs/assets/krishna-janma/`. If a generator returns another size, crop deliberately with the story action visible and inspect the result before export.

## Reusable prompt block

> Soft Indian devotional children's storybook illustration. Thin warm-grey and brown outlines, graceful expressive eyes, smooth broad pastel fills, gentle shading, subtle paper texture. Muted low-saturation palette: warm ivory parchment, dusty saffron and terracotta, sage, slate blue-grey, restrained matte gold. Clear characters, simple background detail, dignified and child friendly. Convey action through poses and composition. Match the attached approved style reference, but depict only the scene described for this page. 4:5 portrait. Leave the lower fifth fading to blank warm parchment for safe cropping. No text, letters, captions, speech bubbles, watermark, border, screenshot controls, photorealism, 3D, saturated cobalt or vivid orange.

Add for each page: the exact sentence or scene from the story data, location and time, named characters and their reference-image roles, required action and emotion, framing, objects that must appear, and objects from adjacent scenes that must **not** carry over. For source-sensitive events, check the cited passage and distinguish scripture from folk illustration before prompting.

## Workflow and acceptance check

1. Read the story page in `mobile/src/data/kidsStories/<story>.json` and its adjacent pages. Write the visual action in one sentence. Do not infer an ending from the cover.
2. Use the built-in image generation tool with the approved style image and the nearest character reference. For the Krishna closing page, `kj-09` fixed Yashoda and baby Krishna's appearance; `kj-08` supplied overall style.
3. Inspect the image at full size: correct place, time, people, action, age and count; no copied prison/river/other-scene objects; consistent faces and clothing; no in-image text; safe crop. Check each hand's thumb side, finger count and wrist connection; two open palms must form a plausible left/right pair. Check the specified deity arm count and one attached hand per arm, with no detached hands or ghost duplicate weapons. Regenerate if a required detail is wrong.
4. Export the selected image as a WebP, keep its new scene filename, copy the same bytes to the app and prototype asset directories, and register its art key in `KidsStoryArt.tsx` and the browser prototype. Keep the library cover separate from closing art.
5. Open the final card in the native reader and browser prototype with the caption visible; check that the image and narration describe the same event. Run the story asset test.

The closing-page example was generated as a new image with `kj-09` and `kj-08` as references, then converted to WebP with `cwebp -q 86`. It uses dawn and Yashoda's lap to express the final page's hope, without repeating the prison cover.

## Library icon

The Home category uses [`story-library.webp`](../assets/kids-stories/story-library.webp): one open picture book with a peacock feather, modak and gada, each equally weighted to hint at the Krishna, Ganesha and Hanuman shelves. It uses the same soft outlines, muted palette and paper texture, but avoids a scene from any one story. Future multi-deity category art should likewise show the collection rather than promoting a single story as the whole library.
