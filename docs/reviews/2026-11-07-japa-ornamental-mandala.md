# Japa ornamental mandala acceptance

Base: `ff40c7592e46c4b09432d90944d2f2d9efa15f54`.

The owner approved the first animated preview with an ornamental frame, then requested Gayatri/long-shloka fitting, implementation and post-build verification. The Hanuman/Shiva raster screen mockups were explicitly rejected as the implementation direction. The approved frame has lotus motifs, beaded edging, patterned bands and opposing circular text motion. The browser design reference is preserved in `japa-ornamental-animation-reference.html`; it is not native verification evidence.

## Result and preserved behaviour

- Infinity shows the complete ornamental frame above the complete reading passage. Mala remains unchanged.
- Native script syllables preserve combining signs, conjuncts, reph and joiners. Long compounds continue at complete syllable boundaries; the primary verse is never shortened or reduced to fit decoration.
- The frame measures the selected script, contains each allocated text rectangle and separates angular sectors. A long passage can use both bands and phase-owned decorative windows.
- The ∞ is smaller, with its full jyoti halo inside the available region. Exceptionally tight centres place it below; the readable counter sits below the frame.
- Counting, 108 rollover, audio ownership, tempo, canonical Gayatri 4000ms at 1×, karaoke, share, reset, saved counts and style hydration remain on their existing paths.
- Two native ring turns stop on pause/background/blur/unmount. Measurements are batched once; count updates reuse decorative paths/nodes and the loop graph. No added native package, WebView, runtime image decode or JS animation timer.

## Acceptance evidence

| Check | Status | Evidence / limitation |
| --- | --- | --- |
| U1 current branch and related work | PASS | Current main and Japa wiki/policy inspected; merged #638/#643 are the base; #644 does not overlap this UI |
| U2 scope | PASS | Infinity presentation, full passage and existing controls; no release/OTA/version change |
| U3 native design fidelity | PENDING | Approved browser animation is a design reference; native screenshots are not available on this host |
| U4 four scripts / Standard-Large / compact | PASS (geometry) / PENDING (native) | Actual locked-font fixtures for all 22 mantras + 16 Tandav verses, four scripts and three frame sizes; full native layout/large-system-text review still required |
| U5 journey / Back / saved state | PASS (integration) / PENDING (native) | Existing Japa provider/route suites; Maestro flow retained/extended, not executed here |
| U6 lifecycle / cancellation | PASS (automated) | Paused/background/unmounted rings cannot restart; stale count callbacks rejected; no new persistence/network path |
| U7 content / artwork | N/A | No content changes or new artwork; existing per-mantra backgrounds retained |
| U8 sibling surfaces | PASS | Mala, shared karaoke and audio/count paths inspected; ornamental layout isolated to Infinity |
| U9 tests / bundle | PASS (automated) / PENDING (native) | 366 Jest suites / 3,619 tests, 1,140 pure tests, 101 post-build checks and both Hermes bundles pass; native Maestro not executed |
| U10 / U10.1 performance / ANR | PENDING | Native-driver/memoization/lifecycle tests are structural evidence. No representative low-end Android release device, 20-minute soak, ANR traces/vitals or iOS hang evidence on this host |
| U11 integration / docs | PASS (local) / PENDING (CI) | design.md §35, RULEBOOK §3 and Japa wiki updated; final remote head/CI recorded in PR |
| U12 remote preservation | PENDING | Implementation, tests, reference and evidence are committed locally; verify the published branch/tree and record its checkpoint before completion |

Conditional groups: C1 (full reading text), C7 (saved counters/navigation), C8 (Japa/audio ownership), C9 (script sizing/accessibility), C10 (tests/docs/runtime cost). Other content/calendar/reminder/export-specific changes are N/A.

## Reproducible font evidence

`mobile/scripts/measure-japam-mandala.mts` creates the test fixture from the actual locked Noto Serif Devanagari/Gujarati/Kannada and Cormorant italic font files at 20dp. It requires optional verification-only `@napi-rs/canvas` (provided by the Codex primary runtime, or installed locally without changing the app). The app does not import this rasterizer. Run with `node --import tsx scripts/measure-japam-mandala.mts` from `mobile/`.

The normal Jest suite needs no rasterizer: it validates fixture font hashes, current canonical/transliterated text, every run's full radial rectangle, adjacent-run angular clearance, complete text order, bounded nodes and conjunct boundaries. This measures layout safety; it does not prove native font rendering or device frame rate.

## Verification results and remaining work

- Implementation checkpoint: `f6d7d5b`; the final verification follow-up changes test harnesses/documentation only.
- `npm run typecheck`: PASS.
- `npm run lint`: PASS, 0 errors (445 inherited warnings). Three existing test files received names/JSX keys to remove the five pre-existing lint errors; the inherited `ringWordFade` literal-array type inference error was also corrected.
- `npm run test:readers:1`, `:2`, `:3`: PASS, 366 suites / 3,619 tests. The eight added compact Gayatri Standard/Large cases were then exercised post-build with the other affected suites: 6 suites / 101 tests PASS.
- Widgets: 46 PASS; Panchang/engine: 822 PASS; data: 223 PASS; Ask: 49 PASS. These used the exact package scripts with `node --import tsx --test --test-concurrency=2` in place of the tsx CLI, whose optional IPC listener is denied by this host.
- All 456 font/layout combinations PASS: 22 catalogue mantras + 16 Tandav shlokas × four scripts × 280/296/340dp. Tests verify glyph-run containment, angular clearance, no omitted or reordered recitation text, valid native opacity ranges and a bounded node count.
- `npx expo export --platform ios --platform android --max-workers 2`: PASS; both minified Hermes bundles produced (51.4MB each, existing app corpus included).
- `node scripts/verify-agent-instructions.mjs` and `git diff --check`: PASS.
- Remote branch, commit and exact tree verification are recorded in the publication checkpoint below.
- This Linux host has no `adb`, Android emulator, `xcrun` or Maestro executable. Native journeys and physical-device ANR profiling remain pending; they must not be inferred from a bundle export.
- Keep the PR draft pending native visual/E2E and U10.1 evidence. No release/OTA is authorized or performed as part of this change.
