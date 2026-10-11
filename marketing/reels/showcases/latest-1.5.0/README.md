# Vedansh 1.5.0 bilingual showcase

Two 30–40-second vertical videos: illustrated Maa Durga stories, prebuilt Sankalp choices, birth Kundali, and Naam Japa. Hindi narration uses actual Hindi app screens; English narration uses actual English screens. Benefit headlines remain outside the intact UI. Voiceover is synthetic, using Microsoft preset voices Swara and Neerja; no voice cloning. Separate SRT files contain the full narration.

## Reproduce

From the repository root, install the existing mobile dependencies for the bundled brand fonts. Provide Python packages `edge-tts` and `truststore`, a Playwright installation with Chromium, and `ffmpeg`/`ffprobe`. No API key is required. TLS verification remains enabled through the operating-system trust store.

```sh
python marketing/reels/showcases/latest-1.5.0/narrate.py
node marketing/reels/showcases/latest-1.5.0/build.mjs
```

If Playwright is supplied outside this repository, set `NODE_PATH` to its parent `node_modules` directory. An optional first argument on either command overrides the output directory. Delete cached `voice-*.mp3` files when editing narration. The builder measures each clip, fits the approved 30–40-second duration, exports H.264/AAC at 1080×1920/30fps, validates layout and audio presence/volume, and saves source/output hashes, media probes, SRT files and contact sheets.

Outputs are regenerable and git-ignored under `marketing/reels/out/latest-1.5.0/`. Final files are `vedansh-latest-hi.mp4` and `vedansh-latest-en.mp4`.

## Screen provenance and limits

The eight unaltered PNGs come from the user-reviewed 11 October listing kit's `raw/android-phone-hi` and `raw/android-phone-en` captures. These show current repository UI in a compatible capture shell; they are not screenshots of the exact Play-signed binary. Story illustrations came from the app's persistent cache using approved manifest-matching artwork. Kundali capture uses fictional demo inputs. Screenshots are used to showcase visible features, not to prove fresh CDN delivery, live SDK traffic or a real personal prediction. No new religious narrative or scripture was authored.

Native Android 1.5.0 (12) regression is recorded separately in `docs/releases/1.5.0/`. Fresh native CDN delivery remains unverified in the corporate certificate environment. The English Japa screen contains the shipped “Audio not available” line; this video makes no Japa-audio promise. Promotional titles describe features without offline, implementation, guaranteed-results or conversion claims. These are local review assets; nothing is posted or uploaded by the builder.
