# Maa Durga / Navaratri kids-story collection

Integrated locally on 2026-10-09. Home’s old Krishna/Ganesha/Hanuman metadata has been removed; existing stories are retained. The Maa Durga shelf has a Navaratri introduction, nine ordered day/form links, and four additional stories. Hindi, English, Gujarati and Kannada share 87 text-free portrait illustrations matching the earlier storybook recipe.

| Reading | Type | Pages | Cover |
| --- | --- | --- | --- |
| Brahmacharini: Parvati’s Resolve | story | 7 | `br02` |
| Chandraghanta: Parvati’s Wedding | story | 5 | `cg05` |
| Kalaratri: A Fearless Protector | introduction | 2 | `kr01` |
| Kushmanda: Light and Creation | introduction | 3 | `ku01` |
| Mahagauri: Gauri and the Tiger | story | 7 | `mg07` |
| Durga and Mahishasura | story | 12 | `dm04` |
| Navaratri: Nine Forms of Maa Durga | introduction | 3 | `nv01` |
| Durga, Kali and Raktabeej | story | 7 | `rb05` |
| Shailaputri: Daughter of the Mountain | story | 4 | `sp04` |
| Shakambhari: The Mother Who Nourishes | story | 8 | `sa05` |
| Durga, Shumbha and Nishumbha | story | 14 | `sn11` |
| Siddhidatri: The Giver of Attainments | introduction | 3 | `si01` |
| Skandamata: Kartikeya Comes Home | story | 5 | `sk05` |
| Suratha and Samadhi Seek the Mother | story | 7 | `su06` |

Katyayani’s day-6 card opens Mahishasura. Kushmanda, Kalaratri and Siddhidatri are introductions with attributed traditional accounts rather than invented adventures. Related Parvati stories identify the connection in source notes. Kali/Chamunda in Raktabeej keeps the source narrative’s name.

- [Complete pre-art source arc](outline.md)
- [Publication manifest and variant boundaries](source-manifest.json)
- [Every-page causal and four-language review](pacing-review.md)
- [Exact final art prompts and PNG provenance](art-generation.json)
- [Final WebP and cover review](art-review.json)
- [Validation and remaining checks](validation.md)
- [Original native sequence and hash evidence](native-evidence.json)
- [Individual post-main painted-boundary review](layout-review.json)
- [Post-change native layout evidence](layout-native-evidence.json)
- [Native multi-card export evidence](sharing-native-evidence.json)
- [Artwork and export screenshots before the share-position adjustment](post-change-preview.jpg)
- [Current right-side share screenshots](right-share-preview.jpg)
- [Latest-main tests and share-placement evidence](pr-preparation-evidence.json)
- [R2 upload package, verified delivery and app-size explanation](upload.md)
- [All 144 live CDN response/hash checks](cdn-evidence.json)
- [iOS/Android production export asset evidence](bundle-evidence.json)
- [All 87 R2 object keys, source paths and hashes](r2-assets.csv)

The 87 new R2 objects are ready in `tmp/kids-stories-durga-r2.zip`. The final app manifest has 144 assets, preserving all 57 prior entries; 143 story illustrations have hash-pinned frames and the remaining entry is the CDN-cached Home icon. The user uploaded the package; all 144 manifest objects (including all 87 new images) now pass production CDN HTTP, hash and WebP-decode checks. Both iOS/Android production exports include zero story images across all 144 manifest entries, including Home art. RULEBOOK §29.2 and regression tests enforce CDN-only delivery. Full-source hash/no-bundle checks are in [asset-gate-evidence.json](asset-gate-evidence.json), with [current-main tests and limitations](current-main-checks.json). Fresh native cache/offline checks remain separate from CDN publication.

Multi-card sharing is integrated through the existing ShareProvider. Scene illustrations alternate with complete, readable narration cards. Longer stories have explicitly numbered parts of at most ten cards, with a separate current-scene option; the final part retains the takeaway and adaptation/source note. Missing R2 art aborts illustrated export instead of capturing a placeholder. Scene art uses the measured title height and the individually reviewed frame, filling the available space without a fixed three-line title reserve.
