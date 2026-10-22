# Daily Bhakti full-resolution delivery compression — 22 October 2026

The user selected **no visible quality loss in the app**, rather than mathematically identical pixels. All nine before/after comparisons were visually reviewed at 540px card width, plus Ganesha at 100% detail. No visible degradation was observed in that review. All nine changed paintings were then reviewed in the iOS simulator. The actual exported Hindi Ganesha PNG was inspected at its full 1080×1456 dimensions: lettering, deity, plaque, continuous parchment, reading frame and footer remain intact.

## Size and encoding

All 28 delivery files: **22,567,642 → 8,953,360 bytes (21.52 → 8.54 MiB), 60.33% smaller**.
Only the nine older lossless paintings were recompressed. Those nine total **18,107,354 → 4,493,072 bytes**, a **75.19% reduction**. The eighteen newer subject masters (4,288,786 bytes) and neutral prayer (171,502 bytes) are byte-identical to the base revision. Count, dimensions, semantic mapping and fitted slice coordinates are unchanged. Per-file sizes are in `sizes.json`.

Delivery uses **cwebp 1.6.0 / libsharpyuv 0.4.2, quality 94, method 6, sharp YUV**, maintaining 1080×1456. This is lossy encoding with visually reviewed appearance, not pixel-identical compression. A trial of exact lossless recompression saved only 1.5% on Ganesha; q94 reduced it from 1,999,782 to 503,004 bytes. The lower q90 candidate was not adopted.

The approved lossless authoring versions remain in Git revision `d98433ad1ea05233e418bfffa720952bae198cfb`; the manifest pins path, SHA-256 and bytes. Zero protected-pixel changes refers to those authoring composites, not decoded delivery pixels. `scripts/optimize-devotional-share.mjs` always reads those pinned originals, never a previously lossy delivery. `reproducibility.json` verifies every original hash and a second independent encoding pass against all nine committed delivery hashes. A shallow checkout must fetch that revision before running the authoring helper. The original PNG/text-clearing composite was not rebuilt in this task.

## Verification

- `npm test`: passed, **3,564 tests** (2,667 Jest in 273 suites, 37 widgets, 617 engine, 194 data, 49 Ask), including typecheck and updated delivery/hash/size regressions. See `test.log`.
- R2: nine new immutable content-hashed objects uploaded; all **28 public response hashes** match the provenance/runtime manifests. `r2-cdn.log`, `r2-upload.log`, `r2-headers.txt` (HTTP 200, correct content length, immutable cache headers and CDN cache hit).
- Production iOS and Android exports passed and each includes **zero Daily Bhakti paintings**, verified against all 28 hashes in `export-r2-verification.json`. See `export.log`.
- Native iOS 26.5 simulator, existing Debug shell, isolated Metro 8093: `daily-bhakti-compression-smoke.yaml` passed all nine decoded subject views, Hindi preview readiness, actual PNG export to the OS chooser and decoded Ganesha view after normal process restart. `native.log`, `native/`, `native-export.json`.
- `native-cache.json`: all nine files downloaded into the app's persistent cache match the optimized source hashes/bytes. Ganesha's cache modification time predates both the first decoded screenshot and the decoded screenshot after restart, proving file reuse.
- Focused lint on the changed test passed; both authoring scripts pass syntax checks. Whole-project lint still reports **three pre-existing missing JSX key errors** in unchanged `ReaderActionTargets.test.tsx` (lines 20–22), plus 374 existing warnings. The unchanged file's last commit is `b18a0356`. See `lint.log` and `focused-lint.log`.

## Limits

No physical-device or Android-native visual review, network-throttled timing measurement, or recipient-side WhatsApp check was performed for this compression change. Smaller transfer sizes are measured; actual latency depends on the connection. Existing cache reuse and nonblocking text behavior remain unchanged. New hashes cause a one-time download of each updated painting; previous objects remain available. No app release, OTA publication or PR merge was performed. Installed-device export and WhatsApp validation remain the existing pre-merge gate in RULEBOOK.

## Reproduce

1. With cwebp 1.6.0/libsharpyuv 0.4.2 and the pinned Git revision available, run `node scripts/optimize-devotional-share.mjs`.
2. Run `node scripts/prepare-devotional-share.mjs` to stage hashes and update the runtime manifest. This does not upload.
3. Publish changed hashes to `vedansh/devotional-share/<hash>.webp` with `image/webp` and `public, max-age=31536000, immutable`.
4. Run `NODE_USE_SYSTEM_CA=1 node scripts/prepare-devotional-share.mjs --verify --cdn`, then the test/export/native checks above before distributing the updated manifest.
