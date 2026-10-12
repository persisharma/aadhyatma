# R2 delivery

Upload the 87 `.webp` files in `kids-stories/` to the existing R2 bucket using the exact object keys in `manifest.json`. Bucket default: `vedansh`. Content-Type: `image/webp`. Keep the `kids-stories/` prefix and hashed filenames; do not upload `rb-01.webp` or rename objects.

The app manifest already contains these final hashes. The same bytes are in native and browser review copies. Existing story files are not replaced by this bundle. The initial package was prepared without workspace upload credentials. The user subsequently uploaded it; production CDN verification passed for all 144 manifest objects, including all 87 new illustrations. See the verification result below.

From the repository root, with R2_ACCOUNT_ID, R2_ACCESS_KEY_ID and R2_SECRET_ACCESS_KEY supplied securely:

```sh
node scripts/upload-r2-assets.mjs --dir tmp/kids-stories-durga-r2/kids-stories --prefix kids-stories --manifest tmp/kids-stories-durga-r2/upload-result.json
```

This command writes its partial upload result to the bundle, preserving the complete app manifest at `mobile/src/data/kidsStoryAssetManifest.json`.

After upload, check each `/kids-stories/<hash>.webp` through the app's configured asset base URL/worker, then use a fresh device cache to verify download, offline reuse and all covers. A locally seeded simulator cache does not verify remote CDN publication.

Package: `tmp/kids-stories-durga-r2.zip`

87 illustrations, 29,605,018 uncompressed bytes. ZIP SHA-256: `b6da6c63b66b657553f8c5da06aba11a8819aa5fae98238ec4d719e54bfe0d4f`.


## Paths and runtime integration

Worktree: `/Users/prashant/.codex/worktrees/a205/Aadhyatma`; branch: `codex/kids-durga-navaratri`.

- Upload-ready hashed objects: `tmp/kids-stories-durga-r2/kids-stories/` (87 files).
- Upload-ready archive: `tmp/kids-stories-durga-r2.zip` (contains `manifest.json` and `kids-stories/`).
- Every new source, object key, default CDN URL and full SHA-256: [r2-assets.csv](r2-assets.csv).
- Review/export sources: `mobile/assets/kids-stories/`; browser copies: `docs/assets/kids-stories/`. Those folders also contain earlier stories. Upload the prepared 87-object folder to avoid renaming mistakes.
- App mapping: `mobile/src/data/kidsStoryAssetManifest.json`; reviewed rendering frames: `mobile/src/components/kidsStoryArtFrames.json`.

The local upload package is gitignored and stays in this worktree. The PR includes all source WebPs and the exact key inventory; it does not include the ZIP.

A story's art ID (for example `rb01`) resolves through `KidsStoryArt` to `rb-01` in the app manifest, then to `/kids-stories/<hash16>.webp`. `assetManifest.ts` uses `EXPO_PUBLIC_ASSET_BASE_URL` when supplied, otherwise `https://cdn.vedansh.app`. The existing asset worker serves R2. `assetCache.ts` downloads to a temporary `.part` file, atomically moves it into the device Documents `kids-stories/` folder, and reuses that hash-named file on later views/offline. These source files are not bundled as a native runtime fallback. Before upload, a fresh device displays the labelled placeholder; illustrated sharing fails with retry feedback rather than exporting a placeholder. Simulator proofs used explicitly seeded cache files.

In Cloudflare's R2 UI, upload the prepared files into the existing bucket's `kids-stories/` folder. Preserve filenames and use `image/webp`. Do not create `kids-stories/kids-stories/`. No app-manifest update is needed after uploading the exact files. Verify URLs from the inventory through the configured CDN, then verify on a fresh device cache.


## Verified after upload

Checked at `2026-10-09T18:10:37.240Z` using unauthenticated HTTPS GET requests to `https://cdn.vedansh.app`:

- **144/144 objects returned HTTP 200**, including **87/87 new images**.
- All 87 new responses match their full source SHA-256; all legacy responses match the committed 16-character manifest hash.
- All 144 responses fully decode as WebP and report `Content-Type: image/webp` plus `Cache-Control: public, max-age=31536000, immutable`.
- Total bytes verified: **44,964,738**. Per-object URLs, dimensions, HTTP/cache headers and hashes are recorded in [cdn-evidence.json](cdn-evidence.json).

Fresh native device-cache download and offline reuse remain separate pending checks; the earlier simulator artwork review used seeded cache files.

## App size versus source files

The committed WebPs are source/review copies. Actual production Metro/Hermes exports for both iOS and Android include **zero of all 144 story images**: **0 story image bytes bundled**, including the Home `story-library.webp` icon. Home now uses the same CDN manifest and cache as reader art. Exact export asset-map/log hashes are in [bundle-evidence.json](bundle-evidence.json).

These files increase checkout/repository storage and can increase build-source upload size. App code, text and manifests still add bundle bytes; this check does not claim an unchanged IPA/AAB size. Story images download from the CDN on demand and then occupy persistent device cache storage. The first fetch needs network access; later reading reuses the cached file.


## Repeatable delivery gates

From the repository root, run both production exports with `--dump-assetmap`, then:

```sh
node scripts/verify-kids-story-assets.mjs --cdn --assetmap <ios/assetmap.json> --assetmap <android/assetmap.json> --output <evidence.json>
```

The checker GETs every manifest URL and compares full source SHA-256, WebP container and MIME type. It rejects story paths or identical image bytes in either export, even when renamed. [Current full-manifest gate evidence](asset-gate-evidence.json) complements the original full-decode CDN evidence. CI runs both production exports and this full CDN/export gate, retaining JSON evidence. The data suite rejects production image imports and tests renamed-image detection; RULEBOOK §29.2 requires dated export/CDN proof before merge.

A fresh simulator Home-art download failed with a TLS trust error on this network. The host CDN certificate issuer is the corporate `ca.gokwik.goskope.com` interception CA; host GET success does not prove simulator trust or production-device failure. TLS settings were not changed. Fresh native download and offline reuse remain pending.
