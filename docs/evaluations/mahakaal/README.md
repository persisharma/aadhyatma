# Mahakaal addition — 27 October 2026

Four new masters were generated with built-in imagegen, with the existing Shiva masters supplying style and frame references. Exact prompts, source hashes and delivered hashes are in `sources.json`; the Suvichar source index and devotional-share provenance also retain the appropriate records. Existing paintings are unchanged.

The images are artistic interpretations of Mahakaleshwar’s decorated Jyotirlinga shrine, not documentary reproductions of a particular day's shringar. Identity references: [temple committee](https://www.shrimahakaleshwar.mp.gov.in/temple) and [Ujjain district](https://ujjain.nic.in/en/tourist-place/shri-mahakaleshwar-temple/).

## Integration

- Daily Bhakti: Lingashtakam and Om Namah Shivaya select `mahakaal` once the new devotional-share object is verified; until then, the existing Shiva painting is retained. Other Shiva sources keep their art.
- Suvichar: श्री महाकाल / Shri Mahakaal, all three frames, a daily preset and Monday cards. A new subject is hidden in every chooser until all three frame hashes are published.
- Delivery: R2 only, using the existing cache and native card/text/branding layers. No source artwork is bundled.

## Publication

`node scripts/prepare-mahakaal.mjs` checks the four local source hashes without changing runtime manifests.

`node scripts/prepare-mahakaal.mjs --publish` uploads just these four masters through the repository uploader, checks public SHA-256 bytes and then activates both runtime manifests. It uses the uploader’s existing R2 environment variables; `--wrangler` can use an existing Wrangler login.

If the objects were uploaded separately, `node scripts/prepare-mahakaal.mjs --activate` verifies them before activation. `--cdn` verifies public objects without activation. Commit both runtime manifests and the updated devotional-share provenance after successful activation.

Publication was attempted here and failed because `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID` and `R2_SECRET_ACCESS_KEY` are unavailable. The runtime manifests remain unchanged. No live app release was attempted.

## Visual review and remaining checks

All four generated full-resolution images were inspected: shrine identity, stone lingam, tripundra, red tilak, garlands, silver pedestal/canopy, blank reading panels and distinct frame treatments. These contain no human Shiva figure or baked-in captions. Daily Bhakti retains the Shiva frame's measured bands; Suvichar retains each frame's existing hero/footer bands.

Type checking and the seven focused suites passed (85 tests), including simulated absent, partial and complete publication. Widget, engine, data and Ask suites pass. The full Jest run also hits existing react-native-webview ESM transform failures in readerReadAloud, readerProgressBar and ChalisaReaderScreen; those reader modules and the Jest transform configuration are unchanged by this patch.

Native verification remains pending: no Maestro or simulator/emulator is installed in this environment. After publication, run `.maestro/suvichar-mahakaal.yaml`, inspect the two Daily Bhakti sources and verify Standard/Large text plus the full exported WhatsApp card on device. Do not treat source-image review or unit tests as native/export evidence.
