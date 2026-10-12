# Vedansh Instagram feature journeys

10 features in Hindi and English, three 1080×1350 marketing cards each. V3 replaces the repeated dark CTA with a light cream/copper journey: **choose or enter details → begin → explore the result**. Each feature has its own three-step copy and Instagram caption.

The first card uses editorial diagrams, not invented app forms. Kundali explains name, date, time and place; Guna Milan explains both people’s names and birth details, chart generation and the actual matching result. The second card shows a whole real locale-matched app screen. The third shows a feature-specific detail from a real capture, with a light CTA. Chart geometry, scores and displayed app content are unchanged. Crops are set per feature and visually reviewed. The source captures use demo inputs; no new scripture, app UI or store metadata is authored.

Latest review and downloadable ZIPs: `marketing/reels/out/instagram-journeys-v3/review-v3.html`. Older V2 outputs are retained for comparison. Nothing has been posted or uploaded.

## Reproduce

Provide the existing mobile font dependencies and Playwright/Chromium, then run from the repository root:

```sh
node marketing/reels/showcases/listing-carousels/build.mjs
```

Set `NODE_PATH` if Playwright is installed externally. The local listing kit’s `raw/android-phone-{hi,en}` directories must exist under the source in `content.json`; override their parent with `VEDANSH_CAPTURE_ROOT`. An optional first argument chooses another output directory. Outputs, captions, gallery and hashes are git-ignored under `marketing/reels/out/listing-carousels/`. ZIP packaging is a separate delivery step.

The captures show the current UI in the compatible listing capture shell; they are separate from exact-release APK validation. The Kundali/Guna Milan captures use fictional demo inputs. No new device capture, AI-generated app screen, publishing, app change or store-listing change occurs. Reviewed contact sheets and validation are committed; PNGs and ZIPs stay local. Earlier simple listing-layout ZIP retained locally as `marketing/reels/out/listing-carousels-v1.zip`.
