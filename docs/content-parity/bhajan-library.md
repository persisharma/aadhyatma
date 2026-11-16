# Bhajan text library — acquisition manifest

Research snapshot: **2026-11-15** · owner request: add a text-only bhajan shelf (with
meaning) inside the Bhajan tab, plus famous Rajasthani and other local/regional bhajans.
Scope (owner, 2026-11-16): **devotional only** — local bhajans, not secular folk songs.

## Scope

This manifest lists the bhajans to acquire for the भजन संग्रह shelf (design.md §34.1,
RULEBOOK §32). A third-party bhajan listing (vedpath.org, shared as screenshots on
2026-11-05) was used **only to define the parity set**. It is **not** an approved
source for base text, romanization, meanings or grouping copy. Every text below must
still clear RULEBOOK §11.1–§11.6 (two independent published sources, verbatim lines,
complete text, faithful meanings) before it gets a JSON file and a library entry.

Nothing ships from this list until its row reaches **READY**. The shelf's door in the
Bhajan tab stays hidden while no verified bhajan is registered.

Status legend:

- **TODO** — public-domain candidate (traditional, or a saint-poet who died centuries
  ago). Capture two independent sources, collate line by line, then write meanings.
- **HOLD-©** — likely a film or modern composition that is still in copyright. Do not
  transcribe unless the maintainer records distribution rights.
- **HOLD-ID** — authorship/identity unknown. Establish the poet or confirm it is a
  traditional/folk text before transcription.
- **DUP** — already shipped elsewhere in the app; RULEBOOK §11.11 forbids a copy.
- **AARTI** — an aarti, so it belongs in the Aarti category, not on the bhajan shelf.

Blocked on 2026-11-15: this build environment's network policy rejects every lyrics
host tried (kavitakosh.org, bhaktibharat.com, bhajansandhya.com, hi.wikisource.org,
hindi.webdunia.com). No source was opened, so no row is past TODO. Allow those hosts
under the environment's network settings, then work the TODO rows.

Suggested authorities (none consulted yet): Kavita Kosh (saint-poet padas and the
regional लोकगीत sections), Gita Press editions (Tulsidas *Gitavali*, Meera/Surdas
padavalis), Hindi Wikisource, BhaktiBharat, Bhajan Sandhya.

## From the parity list

| Proposed id | Title | Group / deity | Attribution | Status / note |
|---|---|---|---|---|
| `baratiya-le-ke-aaye-bam-bhola` | बरतिया ले के आये गयो रे बम बम भोला | `shiva` | unknown | **HOLD-ID** |
| `bolo-shiv-shiv-shambhu` | बोलो शिव शिव शम्भू, बम बम बम | `shiva` | unknown | **HOLD-ID** |
| `chandrama-lalat-sohe` | चन्द्रमा ललाट सोहे | `shiva` | unknown | **HOLD-ID** |
| `jai-bhola-bhandari` | जय भोला भंडारी शिव हर | `shiva` | unknown | **HOLD-ID** |
| `jai-bhole-bam-bam-bhole` | जय भोले बम बम भोले | `shiva` | unknown | **HOLD-ID** |
| `jai-shankar-bhole` | जय शंकर भोले जय शिव शंकर | `shiva` | unknown | **HOLD-ID** |
| `om-namah-shivay-har-har-bole` | ॐ नमः शिवाय, हर हर बोले नमः शिवाय | `shiva` | likely a modern cassette-era bhajan | **HOLD-©** |
| `shiv-shankar-rakhwala` | शिव शंकर रखवाला, मेरा शम्भू भोला भाला | `shiva` | unknown | **HOLD-ID** |
| `aana-ambe-maa` | आना अम्बे माँ | `durga` | unknown | **HOLD-ID** |
| `ambe-ke-bhavan-mein` | अम्बे के भवन में आओ रे | `durga` | unknown | **HOLD-ID** |
| — | अम्बे तू है जगदम्बे काली | `durga` | — | **DUP** — shipped as aarti `ambe-tu-hai-jagdambe-kali` |
| `durge-durge-jai-jai-maa` | दुर्गे दुर्गे जय जय माँ | `durga` | unknown | **HOLD-ID** |
| `he-bhavani-bhagwati-maa` | हे भवानी भगवती माँ तुझ नमो तुझ नमो | `durga` | unknown | **HOLD-ID** |
| `jai-durge-durgati-pariharini` | जय दुर्गे दुर्गति परिहारिणी | `durga` | Sanskrit stuti | **TODO** — confirm it is not already inside `durga-stotram` |
| `nav-durga-ki-jot` | नव दुर्गा की जोत जगाओ रे | `durga` | unknown | **HOLD-ID** |
| `ganesh-pratham-smaranam` | गणेश प्रथम स्मरणम् | `ganesha` | unknown | **HOLD-ID** |
| `ganesh-sharanam` | गणेश शरणम्, शरणम् गणेश | `ganesha` | traditional nama-kirtan | **TODO** |
| `jai-ganesh-pyare` | जय गणेश जय गणेश जय गणेश प्यारे | `ganesha` | unknown | **HOLD-ID** |
| `jai-jai-ganpati-jayati-ganesh` | जय जय गणपति जयति गणेश | `ganesha` | unknown | **HOLD-ID** |
| — | श्री गणेश अथर्वशीर्ष | `ganesha` | — | **DUP** — shipped in `ganesh-stotram/chapter-02.json` |
| `payo-ji-maine-ram-ratan-dhan` | पायो जी मैंने राम रतन धन पायो | `rama` | Meerabai | **TODO** |
| `raghupati-raghav-rajaram` | रघुपति राघव राजाराम | `rama` | traditional Ram-dhun | **TODO** — ship the traditional dhun, not a later political variant, and note which one |
| `thumak-chalat-ramchandra` | ठुमक चलत रामचन्द्र | `rama` | Tulsidas, *Gitavali* | **TODO** |
| — | इतनी शक्ति हमें देना दाता | other | film *Ankush* (1986) | **HOLD-©** — exclude |
| `chhup-chhup-aaye-shyam` | छुप छुप आये श्याम ले के ग्वाल बाल | `krishna` | unknown | **HOLD-ID** |
| — | दर्शन दो घनश्याम नाथ मेरी अखियाँ प्यासी | `krishna` | film *Narsi Bhagat* (1957) | **HOLD-©** — exclude |
| `gokul-mein-bajat-badhai` | गोकुल में बजत बधाई | `krishna` | traditional / Braj | **TODO** — establish the poet |
| `hari-sundar-nand-mukund` | हरि सुन्दर नन्द मुकुन्द | `krishna` | traditional nama-kirtan | **TODO** |
| `jag-mein-sundar-hain-do-naam` | जग में सुन्दर हैं दो नाम | `krishna`, `rama` | unknown | **HOLD-ID** |
| `jai-jai-radha-raman-hari-bol` | जय जय राधा रमण हरि बोल | `krishna`, `radha` | traditional nama-kirtan | **TODO** |
| `koi-kahe-kanha-koi-kahe-shyam` | कोई कहे कान्हा कोई कहे श्याम | `krishna` | unknown | **HOLD-ID** |
| — | कृष्ण जिनका नाम है गोकुल जिनका धाम है | `krishna` | likely modern | **HOLD-©** |
| `lalla-ki-painjaniya` | लल्ला की पैंजनिया बाजे रे | `krishna` | unknown | **HOLD-ID** |
| — | राधे राधे जपो, चले आयेंगे बिहारी | `krishna` | modern | **HOLD-©** — exclude |
| `shri-krishna-govind-hare-murari` | श्री कृष्ण गोविन्द हरे मुरारी | `krishna` | traditional nama-kirtan | **TODO** |
| — | आरती कीजे शैल सुता की | `parvati` | — | **AARTI** — not in the app yet; add to the Aarti category instead |

## Rajasthani bhajans (owner request)

| Proposed id | Title | Group / deity | Attribution | Status / note |
|---|---|---|---|---|
| `thali-bhar-kar-layi-khichdo` | थाली भरकर ल्याई रे खीचड़ो | `krishna` · राजस्थानी | traditional, Karma Bai | **TODO** — many sung variants; collate stanza order |
| `mhane-chakar-rakho-ji` | म्हाने चाकर राखो जी | `krishna` · राजस्थानी | Meerabai | **TODO** |
| `pag-ghungroo-bandh-meera-nachi` | पग घुँघरू बाँध मीरा नाची रे | `krishna` · राजस्थानी | Meerabai | **TODO** |
| `mere-to-girdhar-gopal` | मेरे तो गिरधर गोपाल दूसरो न कोई | `krishna` · राजस्थानी | Meerabai | **TODO** |
| `khamma-khamma-runicha-ra-dhani` | खम्मा खम्मा ओ धणी रुणिचा रा | Baba Ramdev · राजस्थानी | traditional | **TODO** — needs a decision on a non-registry deity (Ramdev Pir); file under the regional group, not a new deity id |
| `man-lago-mero-yaar-fakiri-mein` | मन लागो मेरो यार फकीरी में | निर्गुण · राजस्थानी/मालवी | Kabir | **TODO** |
| `jhini-jhini-bini-chadariya` | झीनी झीनी बीनी चदरिया | निर्गुण | Kabir | **TODO** |

## Regional / local bhajans (owner request)

| Proposed id | Title | Region | Subject | Status / note |
|---|---|---|---|---|
| `kanch-hi-bans-ke-bahangiya` | काँच ही बाँस के बहँगिया | Bhojpuri / Magahi | Chhath (`surya`) | **TODO** |
| `kelwa-ke-paat-par` | केलवा के पात पर उगेलन सूरजमल | Bhojpuri | Chhath (`surya`) | **TODO** |
| `aaj-biraj-mein-hori-re-rasiya` | आज बिरज में होरी रे रसिया | Braj | Holi rasiya (`krishna`) | **TODO** |
| `jay-jay-bhairavi` | जय जय भैरवि असुर भयाउनि | Maithili | Vidyapati (`durga`) | **TODO** |
| `vaishnav-jan-to` | वैष्णव जन तो तेने कहिये | Gujarati | Narsinh Mehta | **TODO** |
| `sundar-te-dhyan` | सुंदर ते ध्यान उभे विटेवरी | Marathi | Tukaram abhang (`vishnu`/Vitthal) | **TODO** |

## Collation rules for this shelf

1. Two independent published sources per text (RULEBOOK §11.1); record both in
   `source.referenceUrls` and the date in `source.retrievedOn`.
2. Folk and saint-poet texts have many sung variants. Ship the reading the two sources
   share, and note other verses in `source.notes`. Never splice verses from different
   recensions (§11.6).
3. Meanings (`meaningHi`, `meaningEn`, optional `meaningGu`/`meaningKn`) are editorial,
   plain, and faithful to the line (§11.13). Rajasthani, Bhojpuri, Braj and Maithili
   lines also need a Hindi gloss in `meaningHi`.
4. Group: a deity id from `deities.ts` when the bhajan addresses one; otherwise the
   regional group (`rajasthani`, `lok-bhajan`). Do not add a deity id for a folk deity.
5. Devotional only (RULEBOOK §32.5). Dropped on 2026-11-16 as secular folk songs, not
   bhajans: Kesariya Balam, Ghoomar, Gorband, Panihari, Bedu Pako. Do not re-add them.
