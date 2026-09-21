# Theerth full-reading rollout — plan for all 71 temples

Status as of 2026-09-21 (`main` @ 05d2a67). Governs the remaining work to bring every
`TempleEntry` in `mobile/src/data/theerth/temples.ts` up to the RULEBOOK §12.6 reading
(`sthapana` · `svarup` · `parampara` · `mela` · `yatra`) with a commissioned plate.

## 1. Where it already exists

11 of 71 temples carry the full reading **and** a dedicated plate. All eleven are in
`theerthBackgroundOverrides` (`mobile/src/data/backgrounds.ts`), the pinned list in
`backgrounds.coverage.jest.test.ts`, the wave pin map in `theerth.test.ts`, the render
table in `TheerthDetailScreen.test.tsx`, and design.md §27 items 4 and 9.

| # | id | Temple | Shipped in | Signature-tradition title |
|---|----|--------|-----------|---------------------------|
| 1 | `salasar-balaji` | Salasar Balaji, Rajasthan | #356 (reference implementation) | सवामणी और मनौती · Savamani and Vows |
| 2 | `khatu-shyam` | Khatu Shyam Ji, Rajasthan | #359 | निशान यात्रा और एकादशी |
| 3 | `karni-mata` | Karni Mata, Deshnoke | #359 | काबा और कुलदेवी परम्परा |
| 4 | `jeen-mata` | Jeen Mata, Sikar | #359 | कुलदेवी की धोक और जात |
| 5 | `gogaji-gogamedi` | Gogaji, Gogamedi | #359 | छड़ी और सर्प-रक्षा |
| 6 | `tejaji-kharnal` | Veer Tejaji, Kharnal | #359 | तांती और गौ-रक्षा |
| 7 | `ramdevra` | Baba Ramdev, Ramdevra | #359 | कपड़े का घोड़ा और बाबा री बीज |
| 8 | `khandoba-jejuri` | Khandoba, Jejuri | #360 | भंडारा और येळकोट |
| 9 | `mahasu-devta-hanol` | Mahasu Devta, Hanol | #361 | महासू का न्याय-दरबार |
| 10 | `sabarimala` | Sabarimala Ayyappan | #361 | व्रत, इरुमुडि और अठारह सीढ़ियाँ |
| 11 | `vetrimalai-murugan` | Vetrimalai Murugan, Andaman | #361 | कावडि और मुरुगन-व्रत |

The 60 remaining ids sit in `LEGACY_WITHOUT_SECTIONS` in
`mobile/src/data/__tests__/theerth.test.ts` (pinned at 60) and render on their generic
deity plate with only `significance` + `originStory`.

## 2. The one hard blocker: plates

`backgrounds.coverage.jest.test.ts` fails any temple that has `sections` but no entry in
`theerthBackgroundOverrides`. Every one of the 60 remaining temples lacks a plate. All
eleven shipped plates were generated **outside** the enrichment sessions and landed
together in PR #311 (2026-09-02); the text waves then consumed that stock. The remote
Claude session cannot generate images, so **text work cannot start on any temple until
its plate exists.** Plate production is therefore the critical path and must run ahead
of the text waves, in batches.

Plate spec (unchanged): 1024×1024 parchment sketch of *this temple's* murti / sanctum
using the RULEBOOK §11.8 prompt with the temple's distinctive form as subject; saved as
`mobile/assets/backgrounds/theerth-<id>.webp`; registered in
`mobile/assets/backgrounds/index.ts`, `theerthBackgroundOverrides`, the pinned list in
`backgrounds.coverage.jest.test.ts`, and design.md §27 item 4. A plate-only PR is
allowed to land before its text (that is exactly how #311 worked).

## 3. Waves (60 temples, 6 waves of ~10)

Ordering favours (a) shrines whose katha has strong trust / state-tourism sourcing,
(b) grouping by region so `yatra` cross-references ("commonly paired in one yatra")
land together, (c) finishing whole traditional circuits so the By-Category view is
uniformly rich. Each wave = one plate PR (all ids in the wave) followed by one
`/enrich-theerth <id>` session **per temple** (never batch text in one session —
see the command file).

### Wave 3 — Dwadash Jyotirlinga (12)
`somnath`, `mallikarjuna`, `mahakaleshwar`, `omkareshwar`, `kedarnath`, `bhimashankar`,
`kashi-vishwanath`, `trimbakeshwar`, `vaidyanath`, `nageshwar`, `rameshwaram`,
`grishneshwar`.
Notes: `sthapana` for these is Purāṇic + rebuild history (Somnath 1951 CE / VS 2008
pran-pratishtha; Kashi 1780 CE Ahilyabai; Mahakal Bhasma Aarti in `parampara`;
Rameshwaram doubles as Char Dham). Sources: temple trust sites, Shiva Purāṇa Koti Rudra
Samhita (Gita Press), state tourism portals. Mallikarjuna/Bhramaramba and
Vaidyanath/Kedarnath pair naturally in `yatra`.

### Wave 4 — Char Dham + Chota Char Dham (5)
`badrinath`, `dwarkadhish`, `jagannath-puri`, `yamunotri`, `gangotri`
(Rameshwaram and Kedarnath already covered in wave 3).
Notes: Jagannath `parampara` = Mahaprasad / Anand Bazaar, `mela` = Rath Yatra by tithi;
Badri-Kedar Temple Committee and Shri Jagannath Temple Administration are the trust
sources; Yamunotri/Gangotri `mela` = Akshaya Tritiya opening, Bhai Dooj closing.

### Wave 5 — North Indian Shakti and popular shrines (10)
`vaishno-devi`, `jwala-devi`, `naina-devi`, `chamunda-devi`, `mansa-devi`, `kamakhya`,
`kalighat`, `tripura-sundari`, `srinathji`, `banke-bihari`.
Notes: Srinathji `sthapana` is well dated (VS 1728 / 1672 CE Sinhad; Pushtimarg lineage
for "builders and lineage"); Banke Bihari (Swami Haridas, VS 1921 / 1864 CE temple);
Kamakhya `mela` = Ambubachi; Vaishno Devi via Shri Mata Vaishno Devi Shrine Board.

### Wave 6 — South Indian icons (10)
`tirupati-balaji`, `meenakshi`, `brihadeeswarar`, `padmanabhaswamy`, `udupi-krishna`,
`kamakshi`, `chamundeshwari`, `bhadrachalam`, `manakula-vinayagar`, `mangueshi`.
Notes: TTD for Tirupati (Brahmotsavam in `mela`, laddu in `parampara`); Udupi Paryaya
(biennial, Makara Sankranti) in `parampara`; Bhadrachalam Sita Rama Kalyanam (Chaitra
Navami); Brihadeeswarar `sthapana` = Rajaraja I, 1010 CE (inscriptional).

### Wave 7 — Remaining 51-Shakti-Peeth rows (12)
`danteshwari`, `nartiang-durga`, `shrinkhala`, `jogulamba`, `bhramaramba`,
`mahalakshmi-kolhapur`, `ekaveerika-mahur`, `harsiddhi-ujjain`, `puruhutika`, `biraja`,
`manikyamba`, `madhaveswari`, `mangala-gauri`, `vishalakshi`.
Notes: `sthapana` here is the Sati-anga narrative plus documented rebuilds; several
(Shrinkhala, Puruhutika, Madhaveswari) have thin trust-site coverage — expect
"not recorded" on tithi/weekday and say so per §12.6. Sources: Devi Bhagavata /
Tantra Chudamani listings via Gita Press, state tourism, ASI where listed.

### Wave 8 — Regional / one-per-state rows (11)
`konark-sun`, `vishnupad-gaya`, `lakshmi-narayan`, `durgiana`, `govindajee-imphal`,
`parashuram-kund`, `kirateshwar`, `iskcon-chandigarh`, `dimapur-kalibari`.
Notes: Konark is an ASI monument, not a living shrine — `parampara`/`mela` will lean on
Chandrabhaga Mela and Konark Dance Festival; Lakshmi Narayan (Birla Mandir) and ISKCON
Chandigarh have precise 20th-century `sthapana` dates and named consecrators (Gandhi
1939; ISKCON trust). Expect the most "sources genuinely have nothing" drops here;
record each drop in the PR.

## 4. Per-temple checklist (unchanged from `/enrich-theerth`)

1. Plate present in `theerthBackgroundOverrides` (gate; else stop).
2. Research ≥2 independent sources, trust site first; §1b fact-framing rules.
3. `significanceHi/En` (+ sthapana date), `originStoryHi/En` (~3 sentences), five
   `sections` in fixed order, `sources[]` https-only.
4. `theerth.test.ts`: remove id from `LEGACY_WITHOUT_SECTIONS`, decrement the pin, add
   to the wave pin map. `TheerthDetailScreen.test.tsx`: add a hi/en render row.
5. design.md §27 item 9 title list (signature-tradition title). Item 4 is updated by the
   plate PR.
6. `npm run typecheck`, `npm run lint`, `npx tsx --test theerth.test.ts searchIndex.test.ts`,
   Jest for `TheerthDetailScreen.test.tsx` + `backgrounds.coverage.jest.test.ts`.
7. One commit per temple: `feat(theerth): full <Name> reading — sthapana katha, form,
   traditions, melas, yatra`.

## 5. Effort and cadence

- Plates: 60 images. One batch PR per wave (5–14 images), produced locally where an
  image model is available, then pushed; the text sessions depend on it.
- Text: 60 sessions at one temple each (~5,000 chars bilingual prose + research per
  temple). At the observed pace (11 temples across 4 PRs in 3 weeks), six waves is
  roughly 12–16 weeks with one contributor; parallel sessions per wave shorten this
  since temples within a wave touch disjoint rows.
- Merge conflicts: every session edits the same three shared lists (`temples.ts`,
  `LEGACY_WITHOUT_SECTIONS` pin, render-test table). Land text PRs serially within a
  wave, rebasing each on the previous.

## 6. Done criteria

- `LEGACY_WITHOUT_SECTIONS` is empty and its pin is 0 (then delete the allowlist and
  the "optional only on legacy rows" clause in RULEBOOK §12.1 / `TempleDetail.sections`
  becomes required).
- `dedicatedTheerthBackgroundIds` lists all 71 ids; design.md §27 item 4 drops the
  per-temple plate list in favour of "every temple".
- RULEBOOK §12.6 "Gates" paragraph rewritten to drop the legacy allowlist sentence.
