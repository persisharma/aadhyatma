# A2 — Vaishno Devi Chalisa

## Scope and edition decision

Only A2, `vaishno-devi-chalisa`, category `chalisa`, deity `durga`, content version 1.5.7. Reuse the existing reader, background, opening illustration and controls. No audio, new deity, version bump, OTA, merge or A3.

On 2026-11-16 Prashant explicitly selected the complete Sri Mandir edition, with alternate readings documented, and authorized current repository rules and the existing Chalisa pattern in place of the missing `competitor-analysis/2026-10-19/claude-code-plan.md` §4a. This does not assert an independent majority or silently combine editions.

## Full-source comparison

All four complete prayer texts were read on 2026-11-16:

| Publication | URL | Access | Body / signature |
|---|---|---|---|
| Sri Mandir (chosen) | https://www.srimandir.com/articles/chalisa/vaishno-devi-chalisa | direct HTTP 200; full web reading | 40 / शर्मा |
| HinduNidhi | https://hindunidhi.com/mata-vashno-devi-chalisa-hindi/ | direct HTTP 200; full web reading | 39 / कमल; omits Ashvin/Chaitra stanza |
| Bhakti Bharat | https://www.bhaktibharat.com/chalisa/vaishno-chalisha | direct HTTP 200; full web reading | 40 / शर्मा |
| Drik Panchang | https://www.drikpanchang.com/lyrics/chalisa/vaishno-mata/vaishno-mata-chalisa.html?lang=hi | full web retrieval; direct HTTP 403 | 40 / शर्मा |

Pavitra Granth returned HTTP 403 and was **not** counted as read. Different domains do not establish independent textual lineages: Drik and Bhakti Bharat share unusual readings; Sri Mandir shares several HinduNidhi readings. Neither source count nor popularity resolves the disagreement; the explicit edition decision does.

| Body stanza | Sri Mandir retained | Alternatives |
|---|---|---|
| 8 | पोषण | Drik/Bhakti Bharat: शोषण |
| 19 | दीनी | Drik/Bhakti Bharat: दीना |
| 25 | कहलाए आदि कुंवारी | Drik: कहलाई माँ आद कुंवारी |
| 26 | लांगू वीर | Drik: लांगुर वीर |
| 32 | बर्वत | Drik/Bhakti Bharat: बरवन |
| 34 | पूजन कीन / वर लीन | Drik: पूजन कीना / वर लीना |
| 35 | तुमको ध्याना | Drik: तुमको ध्याया |
| 39–40 | Navratri stanza + शर्मा | HinduNidhi omits 39 and reads कमल |

Every chosen word and punctuation mark is preserved; whitespace is collapsed and couplets are visually split after the source comma. The 42-unit source digest is `201a31b871b2f81d2dce2906c198010a75f9f6f4f244c68b1ab336d2292c51ce`. The regression assertion covers the entire prayer, not just its opening. Romanization and meanings are original editorial work, not copied from modern website explanations. The obscure बर्वत reading is not silently changed to पर्वत or given an invented etymology; its meaning summarizes the named figures and the attested remembrance clause. Benefits remain devotional claims. No author identity or historical dating is invented from the signature.

## Integration and acceptance

- Reader ID and saved IDs append without altering existing values; actual registry dispatch, search and route tests cover the new payload.
- Existing Durga background/reader illustration mapping is reused. No manifest publication required.
- No production UI code changed; the actual common reader handles language, large text, sharing, bookmarks, auto-slide and read-aloud.
- Source provenance remains internal under RULEBOOK §11.16.
- Status remains WIRED/native pending in parity documentation rather than claiming released SHIPPED.

## Verification

TypeScript PASS. Widget, all three reader shards, engine, data (242 tests), and Ask test groups PASS. Lint PASS with 0 errors / 471 warnings. `git diff --check` PASS. The standard `npm test` command stops at the tsx CLI IPC socket restriction; all its constituent groups were executed successfully using `node --import tsx` for tsx groups and the unchanged Jest commands. One new generated-export expectation was corrected before the successful full data rerun.

Actual-screen visual evidence remains PENDING: the production-reader web adapter bundles successfully, but local Chromium aborts with `socket() failed: Operation not permitted`; the cloud browser cannot reach localhost. No screenshot or mockup is presented as built-screen proof. Reproduction instructions and the adapter are in `mobile/visual/vaishno-chalisa/`. Native services in that harness are explicitly stubbed; production screen code is imported unchanged. Required native acceptance stays PENDING; this Linux environment has neither adb/emulator nor Maestro/iOS simulator. A web/component render is distinct from installed native evidence.

Applicable: U1–U12; C1, C3, C4, C7, C8, C9. C2/C5/C6/C10 N/A: no stories, calendar, reminders or release changes.

Native matrix: Hindi/English/Gujarati/Kannada × Standard/Large × iOS/Android all PENDING. Compact/enlarged system text, offline, saved-state cold launch, native exports/read-aloud and lower-end Android responsiveness remain PENDING. Run `chalisa-smoke.yaml`, inspect first/longest/closing pages, saved/resume/Back and exports before marking ready. YAML checks and unit renders do not establish native success.
