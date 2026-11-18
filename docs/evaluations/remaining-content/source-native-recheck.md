# Source and native availability recheck — 17 November 2026

Continuation of PR #702 at application/capture head `447dcb93576efcda378f39514e59d286405e114d`. This follow-up changes documentation only. No unverified devotional payload, native build, release, OTA or merge was performed.

## Source results: A6 and B2 remain PENDING

### A6 Kubera Chalisa
- The [Internet Archive Kuber record](https://archive.org/details/in.ernet.dli.2015.348511) is dated 1940 and attributed in metadata to Davi Prashad. The metadata API and its `2015.348511.Kuber_djvu.txt` were read directly. The opening identifies a social novel, with an author/preliminary discussion of the novel. It is not a historical Chalisa witness. OCR searches for the Chalisa title, Manas Parivar and opening phrases returned no match; OCR non-matches alone are not proof of absence. No rights or licence field was returned. Do not treat the matching book title/date as evidence for the prayer.
- Exact-text, Gita Press, Hindi Wikisource and licence-oriented searches did not establish a primary historical edition or an explicit literary reuse grant. The modern VedikMarg page supplies another collation lead, but cites other modern websites and describes its author attribution as unconfirmed; it does not close the provenance gap. A recently indexed Sunyra recitation licenses/attributes its pictures separately; picture licences do not license the underlying prayer.
- The existing 48-unit candidate remains excluded. A dated full edition with reliable authorship/publication evidence supporting reuse, or permission covering this exact literary text, is still needed.

### B2 Kali Aarti
- [Red Ribbon Bhakti Ras's official publication](https://www.youtube.com/watch?v=2FGG5rcXlBU) credits Usha Mangeshkar, C Arjun and lyricist Pradeep in its indexed description. Direct YouTube open failed; only the indexed official description was inspected, not the recording or a full print witness. This adds another primary recording-credit lead to the earlier Traditional / Balbir Nirdosh conflict. It does not establish which words were original, adapted or miscredited, nor a right to redistribute the literary composition.
- Official Gita Press listings were found for [Arati Sangraha](https://gitapress.org/product/arati-sangraha-hindi-1) and [Sachitra Arati Sangraha, code 1344](https://gitapress.org/hi/product/sachitra-arati-sangraha-hindi). Indexed catalogue metadata was accessible; direct page opens failed. No complete edition, exact inclusion of this Aarti, publication history or reuse licence was verified. These are acquisition leads, not sourced text.
- [Thakur Prasad's Aarti Sangrah ebook listing](https://thakurprasad.in/product/aarti-sangrah-ebook-pdf/) is a modern 16-page paid ebook listing. The site's “Since 1930” branding does not date this edition or the composition. It was not purchased and no full text or reuse permission was obtained.
- The [Archive item whose identifier mentions Gita Press](https://archive.org/details/rudrashtadhyayi-gita-press-gorakhpur_20230218) returned an Aarti collection without creator/date/licence/rights metadata. Its OCR table of contents is Marathi; searches for the candidate title/opening did not find a match. The identifier alone does not authenticate a Gita Press Hindi edition. This was an OCR/catalogue check, not a complete visual scan review.
- More readable modern witnesses exist, but an independently traceable, rights-supported full base text is still missing. No substitute Aarti, copied modern meaning or unsupported author attribution is added.

Queries additionally included exact openings with “license”, “public domain”, “creative commons”, “1930”, Gita Press and Manas Parivar; this was a bounded search, not an exhaustive bibliography. Direct-access failures are recorded as failures, not absence of a source. No publisher/rights holder was contacted and no purchase was made. The outstanding question is evidence, not an assertion that either composition necessarily has subsisting copyright.

## Native acceptance: PENDING, not executed

### Available execution environment
Executed capability probes found Linux; `ANDROID_HOME`, `ANDROID_SDK_ROOT` and `JAVA_HOME` unset; no `adb`, `emulator`, `xcrun`, `xcodebuild`, `maestro` or `eas` on PATH. Java is present. `/dev/kvm`, the checked standard Android SDK locations and `/Applications/Xcode.app` are absent. No APK/IPA/app bundle was found among the repository's tracked/unignored files. Tool discovery exposed no connected mobile device, simulator or device-farm API. These observations describe this environment, not a claim that no remote runner could be provisioned.

### Existing CI recipes and precise recovery gap
The repository has `native-sanatan.yml`, `native-ios.yml` and other feature-specific native workflows. They are build/test recipes, not evidence that this head ran on a device. They target macOS 26/iOS 26.2 or an API-34 Android emulator and include fresh native compilation when reuse fails.

`mobile/scripts/sanatan-native-sdk.json` points to run `42226325104`, artifact `13507517139`, name `native-ios-42226325104`. The GitHub run-artifacts query returned an empty artifact list on this recheck. Thus that designated binary cannot currently be retrieved through the recorded artifact path; no expiry/deletion cause was asserted. Its compatibility checker also permits only the older Sanatan surface and would not establish compatibility for the broader changed mobile files in #702. The checker was inspected, not weakened or represented as passing. No other current-head reusable host/APK was established.

The available recipes test their own features, not all #702 journeys. Completing acceptance requires freshly available unsigned test hosts for this head and content-specific executed flows, or another verified compatible preserved binary. The repository's `RULEBOOK.md` §0.3 says: “Native builds and store/OTA releases are outward-facing and quota-limited — never start one on your own initiative. Ask first, every time.” The continuation asks to complete native acceptance *if available* and preserve draft if it cannot be established; it is not represented here as an explicit request for a new native build. No EAS build, native CI build dispatch, version change, store submission or OTA was started. Existing unrelated native workflows were not triggered just to produce a misleading green status.

### Required execution matrix once test hosts are available
1. Record exact app/source hash, OS, device/runtime and driver; prove current-head installation and native input.
2. Exercise Home, Search and Hymns entry points; all eight new texts and Vishnu core boundary; C1/C6 canonical destinations; Katha, weekday guide and Saptashati collection; verify Back and retained search/position.
3. Inspect hi/en/gu/kn, Standard/Large, compact width and enlarged system text, including long Bahuk/Kavach/Saptashati units and complete meaning bottoms.
4. Verify bookmark/routine add/remove, saved legacy Durga references, resume/restart and cold-process persistence; cancellation and background/foreground.
5. Verify real share output and native handoff, offline/cache failure/retry, accessibility/focus and representative low-memory Android responsiveness. Emulators alone cannot establish physical low-memory performance.

No cell of that native matrix is marked PASS. Browser capture, JS tests, bundle export maps and native-verification tooling unit tests remain separate evidence.

## Previously executed evidence remains valid for unchanged runtime
- CI run `44184417584` and browser run `44184417549` at `447dcb9` were rechecked: both completed successfully.
- Browser matrix: 224 sampled cases / 400 PNGs; 132 visible scrollable samples reached bottom; no runtime errors, unloaded images, document horizontal overflow or recorded toolbar collisions.
- Thirteen representative screenshots plus two additional long-page bottoms were inspected in the previous pass. They are actual production components rendered with explicit web/native-service adapters, NOT installed native screenshots.
- Browser archive SHA-256: `b03acfc6d34f4b117078d6fd26de4eca83c2faf5c2b4eb6f765a2804ec13ebfd`.
- No runtime changed in this recheck, so these are still applicable runtime checks; do not relabel them as a native run or as a newly executed test suite.

## Durable Library delivery receipts
All entries below have successful upload receipts. No duplicate upload was made during this recheck.

| File | Library ID |
|---|---|
| Vedansh-PR702-01-Saptashati-collection.png | `libfile_557b8ef2bc188191bfd0d60562547e11` |
| Vedansh-PR702-02-Katha-library.png | `libfile_5f813b745d348191ba4464da1bf57f25` |
| Vedansh-PR702-03-Canonical-reading-links.png | `libfile_a16f1a3b74f08191b27cb7e33a96e14b` |
| Vedansh-PR702-04-Weekday-devotion.png | `libfile_462aa9b1c33c819185a6b472acba2a39` |
| Vedansh-PR702-05-Kanakadhara-reader.png | `libfile_845b5836a5ac8191ad55d3388b432c4b` |
| Vedansh-PR702-06-Shri-Suktam-conclusion.png | `libfile_31348f715a5c8191b6b34c5a1ac0852b` |
| Vedansh-PR702-07-Hanuman-Bahuk-long-page-bottom.png | `libfile_92a1260d856881919756f4f3c241e8f1` |
| Vedansh-PR702-08-Devi-Kavach-Gujarati-bottom.png | `libfile_f9ae348a8e0c819191ca749d12dce128` |
| Vedansh-PR702-09-Saptashati-Kannada-bottom.png | `libfile_a4585b89bd408191a432ddc7575c9665` |
| Vedansh-PR702-10-Vishnu-core-conclusion.png | `libfile_dfa1354924c08191bc7081d2635ab598` |
| Vedansh-PR702-11-Kalabhairav-conclusion.png | `libfile_bd77e8cda9f48191864bfb4a967dd694` |
| Vedansh-PR702-12-Argala-conclusion.png | `libfile_b439b02b019c8191a7ea7e76ff7291d8` |
| Vedansh-PR702-13-Kilak-Gujarati-bottom.png | `libfile_9ca9b4d378a4819193bda0c1c3847f72` |
| Vedansh-PR702-447dcb9-browser-evidence.zip | `libfile_3d8d9327b280819189f94f58e592d560` |

PR #702 remains draft and unmerged. A6/B2 source exclusions, native acceptance, and the existing Hindi count-caption fallback in Gujarati/Kannada library cards remain explicit. Audio remains deferred; G3/G4 remain research/decision deliverables.
