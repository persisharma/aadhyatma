# Latest checkpoint — 11 October 2026, approved integration

The user accepted the set, requested two Hanuman gada corrections, then authorized integration.
All 43 corrected/accepted banners are published on R2 and active for 44 semantic reading slots.
Public HTTPS GETs verify HTTP 200, image/webp, full approved SHA-256 and byte length for every
asset. Backgrounds and the shared lifetime cache remain unchanged. Eight focused suites/205
tests and TypeScript pass. Production iOS/Android exports contain no new banner files; the
existing paper fallback is 3,102 B. Files total 4.45 MiB (61–132 KiB each), shown whole at 2:1.
Scoped standalone native fallback, cached framing, Katha scrolling and controlled-fixture
relaunch checks pass. Successful native CDN delivery fails simulator TLS validation (-1200);
the full reader matrix and physical performance remain open.
See `../reading-visuals-2026-10-11/style3-full-set/review.md` for current evidence.

The earlier checkpoints below are historical.

---

# Earlier checkpoint — 11 October 2026, before approval

The three detailed Style 3 samples are accepted. Forty matching new paintings are generated
and locally reviewed. The 43-painting/44-slot gallery, selected hashes, inactive candidate and
browser/test evidence are in `../reading-visuals-2026-10-11/style3-full-set/review.md`.
All 86 comparison images load; all 43 new frames use compact 2:1 contain framing at desktop
and phone widths. Four focused suites/38 tests pass. Existing background and cache hashes are
unchanged. The new 40 await visual approval; no new R2 upload or app activation has occurred.
Native delivery/fallback/relaunch and physical performance checks remain pending.

The following audit is retained as historical implementation evidence.

---

# Current goal audit — 10 October 2026

The user specified the Krishna kids-story style and separate image purposes. Four detailed
painting drafts are superseded. Reader illustrations now have a separate asset folder, typed
descriptor, semantic aliases, manifest and configured R2 prefix. Backgrounds and banners share
the deferred CachedArtwork loader and existing lifetime hash cache. The new manifest is empty;
no new artwork is approved, adopted or published. 43 reference-based briefs cover 44 slots.
Built-in generation is restored. Three new Krishna storybook drafts for Daan, Hanuman–Sita and
Vishvarupa are ready; the remaining 40 briefs are held for the user's style choice.

| Requirement | Current evidence | Status |
| --- | --- | --- |
| App-themed art | Actual unchanged kj-08/kj-11 references, style contract and 43 complete reference-based briefs | Three storybook drafts ready; wider generation held for style choice |
| Separate category | reader-illustrations folder, descriptor, aliases, manifest, publisher and configured R2 prefix | Implemented locally; no approved assets yet |
| Short complete banners | Dedicated illustrations use contain in existing 360×180pt maximum frame | Source/test and complete 2:1 draft canvases verified; user/native visual approval pending |
| Nonblocking lifetime reuse | Shared loader and unchanged persistent cache; no second queue or asset move | Focused regression checks pass; physical performance remains pending |
| Current preview | all-image-fit.html compares 3 scenes × 3 styles; all 11 images loaded, no horizontal overflow or browser warning/error | Visually verified at 847px; three-scenes-three-styles.png saved; artwork gallery only |
| Verification | TypeScript, focused ESLint, eight suites/205 tests; category staging/verification and local HTTP/image hash checks | Pass; native/device/R2 replacement checks still open |

No commit, PR or release requested or performed. The overall goal remains incomplete. The
following audit records older intermediate implementation evidence, not the current artwork
proposal or acceptance.

## Historical compact-crop audit

| Requirement | Current authoritative evidence | Status |
| --- | --- | --- |
| Consistent reading/card visuals | Source inventory of 113 screen files; seven canonical layouts covering 21 readers plus relevant prose/education/guide families use shared art | Source integration complete; exhaustive native walkthrough unproven |
| Compact rectangular art | ReadingBanner reserves 2:1 bounds up to 360×180pt across shared reading art and Theerth; per-image focal registry and three complete-composition exceptions | Source and 44-image gallery verified; current native recheck pending |
| Concrete before/after | compact-banner-comparison.html and compact-banner-before-after.png compare the same Daan painting in equal card widths; all-image-fit.html shows all 44 banners | Reviewable; rejected natural-height evidence archived as historical |
| R2 and limited fallback | Existing 45 R2 objects unchanged; all 44 gallery paintings load; current production exports contain only the 3,102-byte paper from the set | Browser/assets and bundle membership verified |
| Lifetime once-per-content reuse | Persistent Documents hash/extension keys, no TTL/HEAD/revalidation/automatic eviction; existing 23 cache regressions and fixture persistence evidence | Contract unchanged; successful in-app online download/reuse trace pending |
| Fast reading/navigation | No size probe or layout callback; static frame before decode; existing deferred async cache and bounded downloads; 183 focused tests, TypeScript, lint, manifest verification and both production exports pass | Architecture/regressions verified; physical frame/memory behaviour unproven |
| Native R2/fallback/recovery | Prior simulator -1200 failures and seeded-cache decoding; host URLSession HTTP 200 with matching SHA; exact earlier TLS cause unconfirmed | Prior fallback/cache and host transport verified; current successful in-app R2 download unproven |
| Long-reading/accessibility | Prior scoped language/Large captures; compact banner now bounds art height | Current native text endpoints, gestures and remaining size/language matrix pending |
| Device/Android performance | Prior iPhone Developer Mode unavailable and adb absent; latest isolated simulator did not yield verified current bundle reload | Pending usable native/device verification |

## Current verification boundary

The browser gallery verifies the art layout, not native typography, gestures, CDN transport or
physical performance. The fresh simulator check showed the previous Daily Gita 5.26 layout;
Expo/menu/key actions did not produce a verified reload of current source. Historical captures
must not be labelled current banner evidence. Recheck the updated app, reading endpoints and R2
transport when native control is usable. No security/trust settings were changed.

The banner change keeps original image bytes, R2 URLs/hashes and persistent cache keys, so valid
cached paintings require no new download. It adds no bitmap and uses the existing local fallback.
The previous natural-fit exports/evidence are retained as historical, superseded material.

Current evidence: compact-banner-checks.json, compact-banner-before-after.png,
compact-banner-gallery.png, bundle-assets.json and root design-qa.md. Host transport and original
cache checks remain in host-urlsession-r2-verification.json and cache-follow-up.md.

Live comparison: http://127.0.0.1:8095/reading-visuals-2026-10-10/compact-banner-comparison.html.
