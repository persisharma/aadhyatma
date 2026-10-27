# Vrat design consistency — 27 October 2026

The Katha category still passed `sanskar`, which had no scene mapping. My Vrat and Katha retained private flat rows. Calendar row press targets used vertical `flex: 1`, and Upcoming bodies retained a zero flex basis; both could prevent copy from increasing card height. Neutral observances still used symbolic fallbacks, while Ahoi/Tulsi used enlarged social-poster crops.

## Result

- Vrat, Parv, Upvas, landing search, My Vrat, Katha and followed muhurats use the existing Kids Stories `ListingCard` shell. Standard story/reading cards keep their original contract.
- Calendar rows have intrinsic height, 78pt square paintings and complete bilingual/date metadata. Normal rows have a 92pt minimum; My Vrat's two independent 44pt controls reserve 104pt. Upcoming is 158pt wide, with a 112×74 painting beside the save star, as in the reference.
- My Vrat keeps next-date order, reminders and unfollow; the old duplicate text-only timeline is removed. Empty content scrolls and retains its tour anchor. Search fields grow with system text.
- Katha's typed `granth` category resolves real scripture art. The same painting appears on the detail Katha door; reading actions use the shared BookOpen utility icon. Detail uses the canonical ReaderHeader.
- All Vrat browsing screens and details share the reference-derived pale paper and faint edge ornaments. Active list filters use the landing's maroon selection token.

## Complete artwork audit

`artwork-coverage.json` records **all 200 rules**, including 188 default / 12 advanced rules. The main catalog exposes 62 Vrats, 91 Parvs and 6 Upvas entries after its existing deduplication/tradition rules. There are 67 unique list paintings / 68 across list and Upcoming variants, **zero missing mappings and zero symbolic fallbacks**.

Every assignment was visually inspected in `catalog-art-01.jpg` through `catalog-art-09.jpg`. All unique Upcoming frames were inspected in `upcoming-art-1.jpg` through `upcoming-art-3.jpg`. This is complete artwork-assignment coverage; it is not 200 separate native detail walkthroughs. Practice/tradition-only rules use neutral painted ritual/scripture scenes rather than invented deity identities.

Eight new square scenes replace Ahoi/Tulsi/Siddhidatri crops and join named composite subjects. One new UI-paper texture follows the references. Built-in Image Gen was used; exact prompts, generation paths, masters, hashes and shipped files are in `masters/` and `generated-artwork-manifest.json`. Their shipped files total **403,812 bytes**. Twenty-six small whole-canvas encodings of existing approved paintings total **1,002,786 bytes**; original paths/hashes and encoding operations are in `thumbnail-manifest.json`. Reading masters and their delivery manifests remain untouched.

## Native evidence and checks

Dedicated simulator: `B70539B2-7F7C-43A2-AA75-20DC7E05E85C`, iPhone 17 Pro / iOS 26.5, 402×874pt, screenshots 1206×2622px.

1. Landing/Upcoming/category doors: healthy; images occupy their reviewed slots and stars remain independent.
2. Vrat/Parv/Upvas lists: healthy in sampled native states; all rule images additionally reviewed through the complete contact sheets.
3. My Vrat: healthy with two saved items, reminder/open/unfollow actions, and the empty browse return.
4. Katha: healthy with illustrated rows and complete titles; system XXXL includes a wrapping title.
5. Observance detail: healthy with shared paper/header, actual scripture/vidhi art and BookOpen reading action.
6. Existing Krishna Kids Stories shelf: healthy after the shared-shell changes.

Hindi Standard, app Large, English, and system XXXL were exercised. English/enlarged captures in `typography-before-paper/` precede the final paper treatment and are retained as typography evidence. The final Hindi captures include the paper treatment. Test follows were removed; Hindi/Standard and normal system text were restored.

- Full `npm test`: **3,781 passed**, including TypeScript and all six test groups.
- Final focused checks after slot/header/utility adjustments: **46 passed**; final TypeScript passed.
- Changed-file ESLint: zero errors; 52 existing deferred-import warnings in PanchangScreen.
- Focused Maestro journeys and screenshots completed; `mobile/.maestro/vrat-design-consistency-smoke.yaml` preserves a consolidated repeatable journey. That new consolidated file has not been run as one complete flow in this session.

## Limits

Android SDK/emulator is unavailable on this host. Android, physical-device/VoiceOver, smallest-phone native QA and a followed-muhurat native walkthrough remain unverified. Existing native safe areas, minimum touch targets and shared card colors intentionally remain; the mock's status bar, dates, counts and six-row density are not copied as fixed UI. Calendar calculations and authored devotional content were not changed. No release, OTA, R2 publication or merge is included.

See `design-qa.md`, `comparison-landing.png`, `comparison-list.png` and `preview.png` for visual evidence.
