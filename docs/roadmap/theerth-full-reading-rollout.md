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

### Progress (2026-09-24)

**64 of 71 temples now carry the full reading.** Fifty-three of the sixty legacy rows
were authored in one parallel wave of thirteen sessions, one chunk module each under
`mobile/src/data/theerth/details/` — zero merge conflicts, which is what the chunk
layout was for. `LEGACY_WITHOUT_SECTIONS` stays pinned at 60: it is a historical record
of the rows that predate the rule, not a worklist, so enriching one does not shorten it.

Seven temples still render bare, in two chunk modules that were never authored:

| Chunk module | Temples still bare |
|---|---|
| `jyotirlingaB.ts` | `kedarnath`, `bhimashankar`, `kashi-vishwanath`, `trimbakeshwar` |
| `regional.ts` | `mangueshi`, `iskcon-chandigarh`, `dimapur-kalibari` |

Plates are a separate axis and still stand at 11 of 71 — see §2.

## 2. Plates: decoupled from the text (revised 2026-09-24)

`backgrounds.coverage.jest.test.ts` **used to** fail any temple that had `sections` but
no entry in `theerthBackgroundOverrides`. Every one of the 60 remaining temples lacks a
plate. All eleven shipped plates arrived together on 2026-09-02 in the repo's founding
merge (#311) — they were made outside any session, which is why the eleven enrichment
passes never met this gate. The remote session cannot generate images, so the gate
stalled 60 writable readings behind 60 images nothing in the loop could produce.

**Product decision (2026-09-24): the check is removed; the reading ships first, the
plate follows.** An unplated temple falls back to its deity background, a finished
on-theme surface, and the detail screen already renders no illustration block for it
(design.md §27 item 4), so the reading looks complete rather than broken. Recorded in
RULEBOOK §12.6 under "Plate decoupling".

Plates remain wanted, and the per-wave prompts in §7 are already written — they are now
a parallel track that can land any time, not a gate. Text waves run immediately.

### Where authored readings live

Not in `temples.ts`. Each authoring session writes the complete `TempleDetail` for its
temples into **one chunk module** under `mobile/src/data/theerth/details/`, merged by
`details/index.ts` and spread over the inline `templeDetails` map. One chunk file is
owned by exactly one session, so waves running in parallel never touch the same module.
A chunk entry replaces that temple's legacy two-line detail wholesale.

| Chunk module | Temples |
|---|---|
| `jyotirlingaA.ts` | somnath, mallikarjuna, mahakaleshwar, omkareshwar |
| `jyotirlingaB.ts` | kedarnath, bhimashankar, kashi-vishwanath, trimbakeshwar |
| `jyotirlingaC.ts` | vaidyanath, nageshwar, rameshwaram, grishneshwar |
| `charDham.ts` | badrinath, dwarkadhish, jagannath-puri, yamunotri, gangotri |
| `northShaktiA.ts` | kamakhya, vaishno-devi, kalighat, naina-devi |
| `northShaktiB.ts` | jwala-devi, chamunda-devi, mansa-devi, durgiana |
| `southIconsA.ts` | tirupati-balaji, meenakshi, konark-sun, brihadeeswarar |
| `southIconsB.ts` | padmanabhaswamy, udupi-krishna, bhadrachalam, manakula-vinayagar |
| `vaishnavaNorth.ts` | banke-bihari, srinathji, vishnupad-gaya, lakshmi-narayan |
| `shaktiPeethA.ts` | kamakshi, shrinkhala, chamundeshwari, jogulamba |
| `shaktiPeethB.ts` | bhramaramba, mahalakshmi-kolhapur, ekaveerika-mahur, harsiddhi-ujjain |
| `shaktiPeethC.ts` | puruhutika, biraja, manikyamba, madhaveswari |
| `shaktiPeethD.ts` | mangala-gauri, vishalakshi, danteshwari, tripura-sundari |
| `northeast.ts` | govindajee-imphal, parashuram-kund, nartiang-durga, kirateshwar |
| `regional.ts` | mangueshi, iskcon-chandigarh, dimapur-kalibari |

The test files need no per-temple edits any more: `theerth.test.ts` validates section
order for whatever carries sections, and `TheerthDetailScreen.test.tsx` renders every
enriched temple from the data and checks all five headings in both languages.

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

### Wave 7 — Remaining 51-Shakti-Peeth rows (14)
`danteshwari`, `nartiang-durga`, `shrinkhala`, `jogulamba`, `bhramaramba`,
`mahalakshmi-kolhapur`, `ekaveerika-mahur`, `harsiddhi-ujjain`, `puruhutika`, `biraja`,
`manikyamba`, `madhaveswari`, `mangala-gauri`, `vishalakshi`.
Notes: `sthapana` here is the Sati-anga narrative plus documented rebuilds; several
(Shrinkhala, Puruhutika, Madhaveswari) have thin trust-site coverage — expect
"not recorded" on tithi/weekday and say so per §12.6. Sources: Devi Bhagavata /
Tantra Chudamani listings via Gita Press, state tourism, ASI where listed.

### Wave 8 — Regional / one-per-state rows (9)
`konark-sun`, `vishnupad-gaya`, `lakshmi-narayan`, `durgiana`, `govindajee-imphal`,
`parashuram-kund`, `kirateshwar`, `iskcon-chandigarh`, `dimapur-kalibari`.
Notes: Konark is an ASI monument, not a living shrine — `parampara`/`mela` will lean on
Chandrabhaga Mela and Konark Dance Festival; Lakshmi Narayan (Birla Mandir) and ISKCON
Chandigarh have precise 20th-century `sthapana` dates and named consecrators (Gandhi
1939; ISKCON trust). Expect the most "sources genuinely have nothing" drops here;
record each drop in the PR.

## 4. Per-temple checklist (supersedes step 1 and step 4 of `/enrich-theerth`)

1. **No plate gate.** Write the reading whether or not a plate exists. The command file
   still says "stop if the plate is missing" — that instruction is dead as of
   2026-09-24; see §2.
2. Research ≥2 independent sources, trust site first; §1b fact-framing rules.
3. `significanceHi/En` (+ sthapana date), `originStoryHi/En` (~3 sentences), five
   `sections` in fixed order, `sources[]` https-only — written into this temple's chunk
   module under `mobile/src/data/theerth/details/`, **not** `temples.ts`.
4. **No test edits.** `LEGACY_WITHOUT_SECTIONS` stays pinned at 60 (historical record)
   and `TheerthDetailScreen.test.tsx` picks enriched temples up from the data.
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
- **The plate check is restored** — see below.

### Restoring the plate check once coverage is complete

The check removed on 2026-09-24 was not wrong in principle, only wrong in placement:
it was a ratchet against *regression* that had been armed before the thing it guards
was ever built, so the only work it could ever block was the work still being done.
Once all 71 temples have a plate it has nothing left to block and starts earning its
keep — it then only fires when someone deletes a plate or adds a temple without one,
which is exactly what a ratchet is for.

So the final plate PR — the one that brings `dedicatedTheerthBackgroundIds` to 71 —
restores this to `backgrounds.coverage.jest.test.ts` in the same commit:

```ts
test('every temple with an extended reading has its own illustration plate (RULEBOOK §12.6)', () => {
  for (const temple of temples) {
    if (!temple.sections?.length) continue;
    expect(getTheerthIllustration(temple.id)).toBeTruthy();
    expect(getTheerthIllustration(temple.id)).not.toBe(getDeityBackground(temple.deity));
  }
});
```

Re-add `getTheerthIllustration` to the `@/data/backgrounds` import and `temples` to the
`@/data/theerth/temples` import; both were dropped when the test went. Then update
RULEBOOK §12.6 "Plate decoupling" to say the decoupling was temporary and has ended.

**Do not restore it earlier.** Re-arming while any temple still lacks a plate puts the
rollout straight back into the deadlock this document was written to break: the text
cannot land without art, and the art does not come from the sessions writing the text.

## 7. Plate-prompt docs (status 2026-09-21)

Ready-to-paste §11.8 prompts per wave, one branch each, docs-only. Merge, generate the
images locally, register per §2, then start the text sessions for that wave.

| Wave | Doc | Branch |
|------|-----|--------|
| 3 | `docs/theerth-plates/wave-3-jyotirlinga-prompts.md` | `claude/theerth-plates-wave-3` |
| 4 | `docs/theerth-plates/wave-4-char-dham-prompts.md` | `claude/theerth-plates-wave-4` |
| 5 | `docs/theerth-plates/wave-5-north-shakti-prompts.md` | `claude/theerth-plates-wave-5` |
| 6 | `docs/theerth-plates/wave-6-south-icons-prompts.md` | `claude/theerth-plates-wave-6` |
| 7 | `docs/theerth-plates/wave-7-shakti-peeth-prompts.md` | `claude/theerth-plates-wave-7` |
| 8 | `docs/theerth-plates/wave-8-regional-prompts.md` | `claude/theerth-plates-wave-8` |
