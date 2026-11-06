# Bhagwan Parshuram addition

Base: `1b77c101594991b41b683fcf0cbba69d93acd61f` (main, 6 November 2026). Doha/Japa changes from main are preserved; Parshuram appends after existing daily-pool entries.

The requested surfaces share the stable deity id `parshuram`: Home → By Deity → Bhagwan Parshuram → Parshuram Stotram; Stotram category/search/routine/saved reader entry points; Daily Bhakti's seven complete traditional verses; and eight original Suvichar reflections with three separate frames. Thursday is an editorial Suvichar grouping with Vishnu's forms, not a new prescribed observance. No permission, reminder timing or festival-date rule changes.

## Content

Complete seven-verse Shri Vasudevananda Saraswati (Tembe Swami) stotra, including the final phalashruti, collated from the complete Sanskrit Documents and Stotra Nidhi publications on 6 November 2026. The base recension retains `चिरजीवनम्` in verse 7; Stotra Nidhi's `चिरजीविनम्` is recorded rather than silently mixed in. Verse meanings are editorial Hindi/English translations. Gujarati/Kannada use the app's established Hindi re-scripting policy. Eight `VD-0085`–`VD-0092` Suvichar messages are Vedansh original reflections, never words attributed to Parshuram or a scripture. Existing ids, favorites and deity-specific pools are preserved.

- https://sanskritdocuments.org/doc_vishhnu/parashurAmastotram2.html
- https://stotranidhi.com/hi/sri-parashurama-stotram-in-sanskrit/
- https://stotranidhi.com/en/sri-parashurama-stotram-in-english/

## Artwork and publication

The user's correction is mandatory: **standing, never seated**, closer warrior-sage, exactly two arms, right-hand parashu and left-hand bow. All five complete paintings were revised to the user reference with a large shoulder-held parashu, bow and quiver. The latest paintings and bundled symbolic axe were visually inspected. No seated draft is integrated. `artwork.json` preserves exact generation prompts, source/output hashes, dimensions and measured frame geometry. New exports were normalized and compressed; no existing master was changed.

Remote paintings remain outside the bundle. The new Daily Bhakti portrait has a 250 KiB per-master ceiling while the pre-existing masters retain their 9 MiB aggregate ceiling. Suvichar retains its existing 30 MiB aggregate cap; the three new masters were compressed to fit. Only the small axe icon is bundled.

R2 publishing credentials are unavailable here. Runtime manifests are deliberately unchanged. `parshuramPublication.json` stays pending, so the new deity, library item, Daily Bhakti segment and Suvichar tiles stay hidden. This is prepared implementation, not a live feature.

To finish publication in an authenticated environment:

```sh
node scripts/prepare-parshuram.mjs --publish
node scripts/prepare-parshuram.mjs --verify
```

The publisher verifies the full public SHA-256 of every object before updating any app manifest, writes the activation record last, and preserves unrelated entries. Commit the resulting manifests and publication evidence. Interrupted publication stays inactive. Neutral paper remains the shared offline fallback; no unrelated deity is substituted.

## Acceptance and remaining checks

Applicable: U1–U12; C1/C3/C4/C7/C9. C2/C5/C6/C8/C10 are N/A: no new illustrated story, date engine, reminder/permission, playback implementation or release.

PASS: source collation; full standing art inspected; schema/routing/count data checks; focused registry, pool, attribution and four-script lookup tests. The shared reader is tested with the real language/share providers in all four scripts. These tests are distinct from native visual QA.

PENDING: R2 byte verification/activation; final-head CI and complete suite; native iOS/Android journeys, Standard/Large, compact/enlarged system text, fresh/saved/resume/back, cold restart/offline cache and actual image exports/platform handoffs. `mobile/.maestro/parshuram-smoke.yaml` is authored and not device-executed. Keep the PR draft until required evidence is supplied. No native build, version bump, OTA, merge or release is part of this task.

Integrated-tree evidence: typecheck passed; seven focused Jest suites / 96 tests passed. Artwork publication, full-suite CI and native visual/export verification remain pending.
