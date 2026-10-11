# Vedansh Instagram feature carousels

10 features in Hindi and English, three distinct 1080×1350 slides per carousel. These are Instagram marketing posts with feature-specific hooks, concise benefits, calls to action and accompanying captions/hashtags. The flow is **hook → feature walkthrough → typographic CTA**. A cream/copper treatment and the existing brand fonts/icon preserve Vedansh’s identity; the CTA uses a darker copper background.

Real phone-screen pixels from the original listing kit appear on the first two slides. Screens remain whole, with captions outside the UI; the third slide is a distinct text-and-brand composition. Listing image layouts are not repeatedly resized. Hindi uses actual Hindi app screens and English uses English screens. No app UI is invented, no new scripture/story text is authored, and store metadata is unchanged.

## Reproduce

Provide the existing mobile font dependencies and Playwright/Chromium, then run from the repository root:

```sh
node marketing/reels/showcases/listing-carousels/build.mjs
```

Set `NODE_PATH` if Playwright is installed externally. The local listing kit’s `raw/android-phone-{hi,en}` directories must exist under the source in `content.json`; override their parent with `VEDANSH_CAPTURE_ROOT`. An optional first argument chooses another output directory. Outputs, captions, gallery and hashes are git-ignored under `marketing/reels/out/listing-carousels/`. ZIP packaging is a separate delivery step.

The captures show the current UI in the compatible listing capture shell; they are separate from exact-release APK validation. The Kundali/Guna Milan captures use fictional demo inputs. No new device capture, AI-generated app screen, publishing, app change or store-listing change occurs. Reviewed contact sheets and validation are committed; PNGs and ZIPs stay local. Earlier simple listing-layout ZIP retained locally as `marketing/reels/out/listing-carousels-v1.zip`.
