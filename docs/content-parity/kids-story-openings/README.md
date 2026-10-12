# Gentler openings for the four new kids stories

Date: 2026-10-07. Workspace: `/Users/prashant/.codex/worktrees/e02b/Aadhyatma`. Follow-up branch: `codex/kids-story-openings`, based on `f058bb2a` after PR #422 merged. Validation covers local implementation and native verification; no production publication was performed.

## Changed behavior

Each story now introduces its characters and setting on one illustrated page before the existing action. The reader layout, existing scenes, covers and navigation stay the same.

| Story | New opening | Total pages |
| --- | --- | ---: |
| Putana | Little Krishna in Gokul with Yashoda and Nanda | 7 |
| Kaliya Nag | Krishna's ordinary cowherd life with his friends | 8 |
| Ganesha Birth | Parvati speaks with her friends on Kailasa | 8 |
| Hanuman and the Sun | Anjana and little Hanuman near Sumeru | 7 |

Putana's following page also introduces Kansa as Mathura's king and his fear of Devaki's eighth child before his commission. It does not claim he already knew Krishna's location. All new narration/titles are authored in Hindi, English, Gujarati and Kannada; art is shared across languages.

Sources and adaptation boundaries: [source review](../kids-stories-expansion/sources.md#opening-page-follow-up-2026-10-07). The four new generation prompts, master paths, accepted exports and Hanuman retry are recorded in [artwork.json](../kids-stories-expansion/artwork.json). Each image was inspected against its opening narrative and exported at 1122×1402; essential faces occupy the upper part of the image for native caption cropping.

## Verification

- Literal `npm test`: exit 0; 2,957 passing tests (widgets 37, Jest/UI 2,115 across 228 suites, engine 589, data 167, Ask 49). Includes TypeScript. Log: `/tmp/vedansh-kids-openings-npm-test.log`.
- Changed TypeScript/TSX lint: exit 0, no warnings or errors.
- Data coverage checks 30 distinct scene hashes, all translations/citations and synchronized native/browser content and artwork bytes.
- iOS Release build: exit 0, 0 errors and 0 warnings; installed on simulator `5799D1D7-B645-4613-8058-822E63009C0F`, iOS 26.5, app `com.prashantsharma.vedansh`. Log: `/tmp/vedansh-kids-openings-ios-release.log`.
- Standard native walkthrough: exit 0; all 30 scenes, four Hindi/English opening switches, ending counters/source-note scrolling and shelf return. 38 captures: `/tmp/vedansh-kids-openings-native/screenshots/`. All eight opening captures and the revised Putana transition were visually inspected.
- Large Gujarati/Kannada walkthrough: exit 0; all 30 pages in each locale, full non-ending captions, source-note scrolling and return navigation. 68 captures: `/tmp/vedansh-kids-openings-regional-isolated/screenshots/`; log: `/tmp/vedansh-kids-openings-regional-isolated.log`. All eight Large opening captures and both revised regional Putana transitions were visually inspected: full captions and all focal faces are visible.
- Regional flow used a separate fresh iPhone 17 simulator, `F6DC4B82-AD6C-4C6B-B677-D50F249857D6` (Vedansh-Kids-Openings-QA, iOS 26.5), with the same Release app. The first attempt on the shared device stopped at its Home canary while unrelated screens appeared; no reader assertions from that attempt count as verification. The isolated boot emitted logging errors when disk space was exhausted; this checkout's generated Xcode build intermediates were cleared before story screenshots, and all 68 captures were successfully saved.
- Final `git diff --check`: clean.

Retained opening captures: [Putana](screenshots/kids-putana-hi-00.png), [Kaliya Nag](screenshots/kids-kaliya-nag-hi-00.png), [Ganesha Birth](screenshots/kids-ganesha-birth-hi-00.png), [Hanuman](screenshots/kids-hanuman-sun-hi-00.png). Large examples: [Putana in Gujarati](screenshots/kids-putana-gu-large-00.png), [Ganesha in Kannada](screenshots/kids-ganesha-birth-kn-large-00.png). Native PNGs are 1206×2622; in-chat previews may be resized.

The original 26-scene delivery evidence remains in [the previous validation report](../kids-stories-expansion/validation.md). Existing Krishna Janma text, artwork and reader code are unchanged. Simulator checks do not establish physical-device or Android coverage, and regional editorial approval remains a separate release check.

## Added payload

The four new WebP assets total **1,113,264 bytes (1.11 MB / 1.06 MiB)**. The four canonical story JSON files grow by **7,825 bytes**. Combined new-story art is now 8,790,976 bytes. This measures bundled asset/source payload, not an App Store download or installed-size delta. Browser duplicates and review screenshots are outside the mobile bundle. No dependencies are added.
