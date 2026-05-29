# Plan: Internet-Verified Content Correctness Audit & Fix

## Summary
Fix all content correctness issues across 75 data JSON files in mobile/src/data/ by replacing incorrect/fabricated/incomplete text with internet-verified canonical versions from authoritative Hindu liturgical sources.

## User Story
As a devotee using the Aadhyatma app,
I want all prayers, aartis, chalisas, and scriptures to contain the correct traditional text,
So that I can trust the app for daily worship without worrying about textual accuracy.

## Problem → Solution
Current state: Multiple content files contain fabricated verses, missing stanzas, wrong metadata, and systematic data corruption. Users performing aarti/path with this app are reciting incomplete or incorrect texts.

Desired state: Every content file matches verified internet sources from at least 2 authoritative websites, with no fabricated content, no missing verses, and correct metadata.

## Metadata
- **Complexity**: Large
- **Source PRD**: N/A
- **PRD Phase**: N/A
- **Estimated Files**: ~30 files to modify (of 75 total)

---

## Mandatory Reading

| Priority | File | Why |
|---|---|---|
| P0 | `src/data/aarti/*.json` | All 7 aarti files need corrections |
| P0 | `src/data/aarti/sankat-mochan.json` | Complete rewrite needed — wrong text |
| P0 | `src/data/hanuman-chalisa/hanuman-chalisa.json` | Verify against canonical |
| P0 | `src/data/durga-chalisa/durga-chalisa.json` | Potentially AI-generated, needs full rewrite |
| P0 | `src/data/japam/japam.json` | Wrong deity tag for Gayatri |
| P1 | `src/data/gita/chapter-*.json` (all 18) | Systematic corruption fixes |
| P1 | `src/data/shiva-strotam/chapter-04.json` | Corrupted transliterations |
| P2 | `src/data/sundarkand/chapter-*.json` | Devanagari leaked into transliteration |

---

## Verified Correct Content (from Internet Sources)

### AARTI — Verified Canonical Texts

#### 1. Hanuman Aarti (13 couplets, deity: hanuman, attribution: Tulsidas)
Sources: ndtv.in, sanatanvaani.in, hindunidhi.com

Complete text:
```
आरती कीजै हनुमान लला की। दुष्ट दलन रघुनाथ कला की॥
जाके बल से गिरिवर कांपे। रोग दोष जाके निकट न झांके॥
अंजनि पुत्र महा बलदाई। संतन के प्रभु सदा सहाई॥
दे बीरा रघुनाथ पठाए। लंका जारि सिया सुधि लाए॥
लंका सो कोट समुद्र सी खाई। जात पवनसुत बार न लाई॥
लंका जारि असुर संहारे। सियारामजी के काज संवारे॥
लक्ष्मण मूर्छित पड़े सकारे। आनि संजीवन प्राण उबारे॥
पैठि पाताल तोरि जमकारे। अहिरावण की भुजा उखारे॥
बाएं भुजा असुर दल मारे। दाहिने भुजा संतजन तारे॥
सुर नर मुनि जन आरती उतारें। जय जय जय हनुमान उचारें॥
कंचन थार कपूर लौ छाई। आरती करत अंजना माई॥
जो हनुमानजी की आरती गावै। बसि बैकुंठ परम पद पावै॥
लंक विध्वंस कीन्ह रघुराई। तुलसीदास प्रभु कीर्ति गाई॥
```
Refrain "आरती कीजै हनुमान लला की" repeats after every 2 couplets.

#### 2. Sankat Mochan Hanumanashtak (8 pada + 1 doha, deity: hanuman, attribution: Tulsidas)
Sources: brandbharat.com, bhaktiraag.com, vignanam.org

Every verse ends with refrain: "को नहिं जानत है जग में कपि, संकटमोचन नाम तिहारो"

Verse 1: "बाल समय रवि भक्षि लियो तब, तीनहुँ लोक भयो अंधियारो..."
Verse 8: "काज किये बड़ देवन के तुम, बीर महाप्रभु देखि बिचारो..."
Closing doha: "लाल देह लाली लसे, अरु धरि लाल लंगूर। बज्र देह दानव दलन, जय जय जय कपि सूर॥"

#### 3. Om Jai Jagdish Hare (9 verses, deity: VISHNU not krishna, attribution: Pt. Shraddha Ram Phillauri)
Sources: drikpanchang.com, sanatanvaani.in
Key fix: deity field "krishna" → "vishnu"

#### 4. Jai Ambe Gauri (12 verses + refrain, deity: durga, attribution: Shivanand Swami)
Sources: timesnowhindi.com, bhajandhaara.in, jansatta.com

#### 5. Aarti Kunj Bihari (4 verses + refrain, deity: krishna)
Sources: bhaktilok.com, timesnowhindi.com
Key fix: Remove non-traditional stanzas (app has 6, canonical has 4)

#### 6. Jai Ganesh Deva (5 verses + refrain, deity: ganesha)
Sources: pavitragranth.com, dharmsaar.com

#### 7. Om Jai Shiv Omkara (8 verses, deity: shiva, attribution: Shivanand Swami)
Sources: divineaarti.com, gyanbhakti.com

### CHALISA — Verified

#### Hanuman Chalisa: CORRECT in app (minor translation issue: bajra = thunderbolt not mace)
#### Durga Chalisa: App version is non-traditional. Canonical starts "नमो नमो दुर्गे सुख करनी" (author: Devidas). Sources: sanatanweb.com, timesnowhindi.com, patrika.com
#### Ganesh Chalisa: App version partially correct. Canonical author: Ramsundar Prabhudas. Sources: hindunidhi.com, zeenews.india.com
#### Shiv Chalisa: App mostly correct. Fix "दिनदयाला" → "दीनदयाला" in opening. Sources: chalisa-pdf.com, jansatta.com, timesnowhindi.com

### JAPAM — Fixes Needed
- Gayatri Mantra: deity tag "durga" → "savitr" (addressed to solar deity Savitri, confirmed by Wikipedia, WisdomLib, DevduttPattanaik)

### GITA — Systematic Fixes (data corruption, not content rewrite)
- 4,261 instances of ? used as comma in commentaryEn
- 1,567 instances of missing space after period
- 47 verses with empty commentaryEn (Ch1: 38, Ch4: 2, Ch5: 1, Ch8: 1, Ch10: 2, Ch11: 3)
- 252 Bengali danda (৷) characters in commentaryHi
- 19 transliteration spillover/corruption defects
- 1 placeholder text in BG 18.2 meaningHi

### STOTRAM — Fixes Needed
- Mahishasura Mardini verse 3: Replace with correct "अयि जगदम्ब मदम्ब कदम्ब..." (source: sanskritdocuments.org)
- Shiv Tandav: transliteration corruption in verses 3, 6, 13, 14
- Durga Stotram Ch1: verse 1 meaning is duplicated from verse 0

---

## NOT Building

- New content/sections not currently in the app
- UI/screen changes
- New features or navigation changes
- Commentary rewrites (only fixing corruption patterns)
- Translations for the 47 empty commentaryEn verses (marking as known gap)
- Filling BG 18.2 meaningHi with actual translation (would require authoritative source)

---

## Step-by-Step Tasks

### Task 1: Fix Aarti Files (7 files)
- **ACTION**: Replace all 7 aarti JSON files with verified canonical text
- **IMPLEMENT**: Rewrite hanuman-aarti.json (6→13 verses), sankat-mochan.json (complete rewrite with authentic Tulsidas text), jai-ambe-gauri.json (add missing stanzas to reach 12), om-jai-jagdish.json (fix deity:"krishna"→"vishnu", add missing verses to reach 9), aarti-kunj-bihari.json (remove non-traditional stanzas, fix to 4 verses), om-jai-shiv-omkara.json (add missing 2 stanzas to reach 8), jai-ganesh-deva.json (verify/fix to 5 stanzas)
- **MIRROR**: Existing JSON schema (id, type, section, number, labelHi, labelEn, lines, linesEn, meaningHi, meaningEn)
- **GOTCHA**: Must maintain existing id prefix patterns (ha-, sm-, jag-, jgd-, ojj-, ojso-, akb-) for any code that references them
- **VALIDATE**: Verse count in JSON matches internet source; no fabricated lines

### Task 2: Fix Chalisa Files (2-3 files)
- **ACTION**: Replace durga-chalisa.json with verified canonical text; fix shiv-chalisa opening doha spelling
- **IMPLEMENT**: Full rewrite of durga-chalisa with Devidas text (40 chaupais starting "नमो नमो दुर्गे सुख करनी"); fix "दिनदयाला"→"दीनदयाला" in shiv-chalisa; verify ganesh-chalisa against canonical
- **MIRROR**: Existing chalisa schema (doha/chaupai types with number field)
- **VALIDATE**: 40 chaupais present; doha structure correct

### Task 3: Fix Japam Deity Tag
- **ACTION**: Change Gayatri Mantra deity from "durga" to "savitr"
- **IMPLEMENT**: Single field change in japam.json
- **VALIDATE**: deity field says "savitr"

### Task 4: Fix Gita Systematic Corruption
- **ACTION**: Script-fix all 18 chapter files for: ? → comma, missing spaces, Bengali dandas
- **IMPLEMENT**: Write a Node script that:
  1. Replaces ? with , in commentaryEn where pattern matches word? word (not at end of sentence, not in quotes)
  2. Adds space after . where pattern matches .[A-Z] (not URLs, not abbreviations like "e.g.")
  3. Replaces Bengali ৷ with Devanagari । in commentaryHi
  4. Fixes BG 18.2 meaningHi placeholder (replace with empty string or note)
- **GOTCHA**: Must not replace legitimate question marks. Pattern: only replace ? preceded by [a-z] and followed by space+[a-zA-Z]
- **VALIDATE**: Re-run grep counts; all should be 0 or near-0

### Task 5: Fix Gita Transliteration Spillover (11 verse pairs)
- **ACTION**: Manually fix transliteration arrays for affected verses
- **IMPLEMENT**: For each spillover pair, move the extra lines from verse N to verse N+1. For Ch10 v33 and Ch11 v19, replace Devanagari with correct romanized transliteration.
- **VALIDATE**: Every verse's transliteration line count matches its Sanskrit line count

### Task 6: Fix Stotram Issues
- **ACTION**: Fix Mahishasura Mardini verse 3; fix Shiv Tandav transliterations; fix Durga Stotram Ch1 meaning duplication
- **IMPLEMENT**: Replace verse 3 with correct "अयि जगदम्ब मदम्ब कदम्ब..." text; fix garbled transliterations in Shiv Tandav v3, v6, v13, v14
- **VALIDATE**: Text matches sanskritdocuments.org source

### Task 7: Fix Sundarkand Transliteration Leaks (7 instances)
- **ACTION**: Replace raw Devanagari in linesEn fields with proper romanized transliteration
- **IMPLEMENT**: Fix specific verses in chapters 3, 8, 9, 10, 11, 12 where linesEn contains Devanagari
- **VALIDATE**: No Devanagari characters in any linesEn field across all Sundarkand files

---

## Testing Strategy

### Unit Tests (to write in TDD phase)

| Test | Input | Expected Output |
|---|---|---|
| Aarti verse count matches canonical | Read each aarti JSON | hanuman=13+refrain, sankat-mochan=8+doha, ambe-gauri=12+refrain, etc. |
| No Devanagari in transliteration fields | Scan all linesEn/transliteration arrays | Zero matches for Unicode range U+0900-U+097F |
| Correct deity tags | Read metadata from all files | om-jai-jagdish=vishnu, gayatri=savitr |
| No ? as comma in Gita commentary | Grep pattern in commentaryEn | Zero matches for /[a-z]\? [a-zA-Z]/ |
| No Bengali characters in Gita Hindi commentary | Grep for ৷ | Zero matches |
| Sankat Mochan has correct refrain | Check all 8 verses | Each ends with "संकटमोचन नाम तिहारो" |
| All transliteration arrays match Sanskrit line counts | Compare array lengths | Equal for every verse |

### Edge Cases Checklist
- [ ] Legitimate question marks preserved (actual questions in commentary)
- [ ] URLs in commentary not broken by space-after-period fix
- [ ] Abbreviations like "e.g." not broken
- [ ] Refrain verses in aartis correctly structured
- [ ] ID prefixes maintained for backward compatibility

---

## Validation Commands

### Static Analysis
```bash
npx tsc --noEmit
```
EXPECT: Zero type errors

### Unit Tests
```bash
npx tsx src/data/__tests__/contentCorrectness.test.ts
```
EXPECT: All content validation tests pass

### Regex Verification
```bash
# No ? as comma remaining
grep -rP '[a-z]\? [a-zA-Z]' src/data/gita/ | wc -l
# Should be 0 or near-0

# No Bengali dandas
grep -rP '৷' src/data/gita/ | wc -l
# Should be 0

# No Devanagari in transliteration fields (linesEn)
grep -rP '"linesEn".*[ऀ-ॿ]' src/data/ | wc -l
# Should be 0
```

---

## Acceptance Criteria
- [ ] All 7 aarti files contain complete verified canonical text (no missing stanzas)
- [ ] Sankat Mochan file contains authentic Tulsidas Hanumanashtak with correct refrain
- [ ] Om Jai Jagdish deity field = "vishnu"
- [ ] Gayatri mantra deity field = "savitr"
- [ ] Durga Chalisa matches verified Devidas canonical text
- [ ] Zero fabricated/non-traditional verses in any aarti file
- [ ] Gita ? as comma count reduced from 4,261 to <10 (legitimate questions only)
- [ ] Gita Bengali danda count reduced from 252 to 0
- [ ] All transliteration spillover defects fixed (19 verses)
- [ ] No Devanagari in any transliteration/linesEn field
- [ ] BG 18.2 meaningHi placeholder removed
- [ ] All existing tests still pass (no regressions)

## Risks
| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Regex ? replacement hits legitimate questions | Medium | Low | Use conservative pattern; manual review of edge cases |
| Missing meanings for new verses in expanded aartis | High | Medium | Write new meaningHi/meaningEn for added verses |
| ID changes break UI code | Low | High | Preserve existing ID prefixes; only add new IDs for new verses |
| Regional variant differences | Medium | Low | Use most widely attested version from 2+ sources |

## Notes
- The Hanuman Aarti currently has a completely fabricated closing verse ("मन कर्म वचन ध्यान जो लावे। हनुमत बीर सकल दुख भावे") that appears in NO internet source
- The Sankat Mochan file is the worst — it's a composite mixing Hanuman Chalisa lines with paraphrased content, masquerading as the Tulsidas Hanumanashtak
- The Gita corruption (4,261 ? as comma) suggests an OCR/copy-paste error during initial data ingestion
- Internet sources used: hindunidhi.com, sanatanvaani.in, ndtv.in, drikpanchang.com, brandbharat.com, bhaktiraag.com, sanskritdocuments.org, vignanam.org, bhajandhaara.in, chalisa-pdf.com, timesnowhindi.com, patrika.com, zeenews.india.com (all cross-referenced)
