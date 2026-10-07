# Four new kids stories — implementation and verification

Date: 2026-10-07. Workspace: `/Users/prashant/.codex/worktrees/e02b/Aadhyatma`, branch `codex/kids-four-stories`. Validation ran on the feature changes above `cf340d46`. PR preparation rebases the feature onto `b18a0356` (`main`, merged PR #421), whose tree is identical to that validation base. No OTA has been published.

## Delivered behavior

| Shelf | Added story | Distinct scenes |
| --- | --- | ---: |
| Krishna | Krishna and Putana | 6 |
| Krishna | Krishna and Kaliya Nag | 7 |
| Ganesha | The Birth of Ganesha | 7 |
| Hanuman | Hanuman and the Sun | 6 |

Krishna Janma remains available. The catalog now shows 3/1/1 stories, and the disabled Kaliya teaser is removed. All four additions use the existing native reader without changing its layout, horizontal paging, header, progress indicator, language toggle or scrollable ending. Hindi, English, Gujarati and Kannada have authored narration, titles, takeaways and source notes. Art remains shared across languages and bundled offline.

Canonical records: `mobile/src/data/kidsStories/{putana,kaliya-nag,ganesha-birth,hanuman-sun}.json`. Integration: `index.ts`, `KidsStoryArt.tsx`, and the catalog's English count plural. The four browser review files are generated from these same JSON records; data tests check content and asset-byte parity.

## Source and illustration review

See [sources.md](sources.md) for the passages actually opened and adaptation boundaries, and [artwork.json](artwork.json) for all 26 generation prompts, master locations and review records. These are original children's adaptations, not quoted liturgical text. Regional expert editorial approval has not been claimed.

Each scene was inspected against its own narrative. All 26 native Standard-size screenshots were viewed. Each ending has distinct artwork rather than substituting its cover. Ganesha's human/elephant-head sequence, Hanuman's consistent childhood appearance and Vayu, Airavata's four tusks, covered Putana nursing, Kaliya's dance and restored river were checked. Two rejected Hanuman generations and their corrections are retained in the provenance record.

The first Gujarati/Kannada Large-size flow passed its text/navigation assertions, but visual inspection caught Krishna's face clipped on Kaliya page 3 in Kannada. The Kannada caption was shortened while retaining the coils, frightened community, Balarama's restraint and Krishna's enlargement/escape. The native reader and artwork were unchanged. The browser copy and Maestro text assertion were synchronized, and the installed Release build was rebuilt. The [corrected Large Kannada capture](screenshots/kaliya-kannada-large.png) was inspected: Krishna's complete face, the coils, Balarama's gesture and the full caption are now visible.

## Automated checks

- Final literal `npm test`: exit 0, **2,957 passing tests**: widgets 37, Jest/UI 2,115 across 228 suites, engine 589, data 167, Ask 49. Includes TypeScript checking. Log: `/tmp/vedansh-kids-npm-test-final.log`.
- Changed TypeScript/TSX lint: 0 errors; 7 existing-style CommonJS `require` warnings in Jest mocks. Log: `/tmp/vedansh-kids-lint.log`.
- `git diff --check`: clean.
- Data coverage includes the 3/1/1 shelves, complete translations, per-page citations, dated publication provenance, 26 distinct SHA-256 asset hashes, final static WebP imports, closing-scene separation, and native/browser JSON and byte parity. UI coverage exercises each story, all language choices, index preservation, final scrolling, viewport resizing and invalid IDs.

## Native verification

Device: `5799D1D7-B645-4613-8058-822E63009C0F`, Vedansh-Upanishad-QA, iOS 26.5. App: `com.prashantsharma.vedansh`. Screenshot resolution: 942×2048. Native evidence is simulator evidence, not Android or physical-device certification.

Final Release build: exit 0, 0 errors, 1 warning; installed and launched. Log: `/tmp/vedansh-kids-ios-release-final.log`. Command from `mobile/`:

```sh
PATH=/opt/homebrew/bin:$PATH NODE_OPTIONS=--max-old-space-size=8192 node node_modules/expo/bin/cli run:ios --configuration Release --device 5799D1D7-B645-4613-8058-822E63009C0F --no-bundler
```

| Native flow | Result and scope | Evidence |
| --- | --- | --- |
| `kids-stories-new-stories-smoke.yaml` | Pass: all 26 scenes, page IDs/counters, Hindi/English switching at each ending, full takeaway/source scrolling and return navigation | `/tmp/vedansh-kids-new-native.log`; 30 captures in `/tmp/vedansh-kids-new-native/screenshots/` |
| `kids-stories-smoke.yaml` | Pass: existing Krishna Janma, all 16 scenes, catalog and three-story Krishna shelf | `/tmp/vedansh-kids-krishna-native.log`; captures in `/tmp/vedansh-kids-krishna-native/screenshots/` |
| `kids-stories-regional-smoke.yaml` | Pass: all 26 scenes in Gujarati and all 26 in Kannada at Large reading size, full non-ending captions, source-note scrolling and return navigation; corrected Kannada crop visually verified | `/tmp/vedansh-kids-regional-native-final.log`; 60 captures in `/tmp/vedansh-kids-regional-native-final/screenshots/` |

The Standard new-story and Krishna flows ran before the final Kannada-only caption correction. Their checked Standard narration, assets, reader code and navigation are unchanged. The final regional rerun checks the changed Kannada text in the rebuilt app.

Browser inspection also confirmed all 26 images load at 1122×1402 and language changes preserve the final page. Browser checks complement native evidence.

Retained native captures: [catalog](screenshots/catalog.png), [Krishna shelf](screenshots/krishna-shelf.png), [Putana](screenshots/putana.png), [Kaliya Nag](screenshots/kaliya-nag.png), [Ganesha birth](screenshots/ganesha-birth.png), [Hanuman and the sun](screenshots/hanuman-sun.png). These files are review evidence outside the app bundle.

## Size and release boundary

The 26 new WebP illustrations total **7,677,712 bytes (7.68 MB / 7.32 MiB)**. Four story JSON files total 59,997 bytes. This measures added asset/source payload; an App Store compressed download or installed-size delta was not measured. Browser duplicates, PNG masters and review screenshots are outside the mobile bundle. No dependency or native-module additions are required.

Regional editorial review remains a release check under RULEBOOK §29. This delivery does not claim a production publication, new recordings, read-aloud, bookmarks, sharing or progress persistence.
