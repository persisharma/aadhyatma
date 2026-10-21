# PRD-46 — बाल प्रश्नोत्तरी व गीता परीक्षा · Kids Quiz + Gita Exam

| | |
|---|---|
| **Status** | **Question book built** (data + CI gate, RULEBOOK §32) — 94 questions in 7 draft packs, every answer grounded in shipped content: गीता परीक्षा स्तर 1 bank (48, अध्याय 12 + 15), Balakanda प्रसंग 1–5 (24 across 3 packs), Krishna Janma / Ganesha / Hanuman stories (22 across 3 packs). Screens not yet built; packs await editorial review (`draft`); exam syllabus = open decision §10 |
| **T-shirt size** | M–L (quiz engine + 3 screens small; परीक्षा mode adds the ladder/paper/certificate layer; recurring cost is question authoring — editorial, not liturgical) |
| **Prototype** | [`docs/bal-prashnottari-prototype.html`](../../bal-prashnottari-prototype.html) — Kids-library entry, pack shelf, picture-question, gentle reveal with read-the-source hand-off, quiet completion, post-reader invite, **and the गीता परीक्षा mode: level ladder, exam paper, result + certificate**; every interaction annotated |
| **Feasibility** | ✅ Confirmed against current main — questions anchor to **stable shipped route params** (`ComicReader { comicId, episodeId, panelId }`, `KidsStoryReader { storyId, pageId }`, Gita/chalisa section ids), the pack shelf is the shipped §82 `ListingCard`, picture options reuse the comic/story art pipeline, the certificate rides the shipped share-card pipeline, and Gita Jayanti comes from the festival engine. Question text is bundled JS — OTA-shippable. |

> **Answering the round-2 parking verdict first.** Round 2 (§3.3) parked the "children's devotional layer" as *"a real gap and a real audience, but content-heavy and undefined… revisit once 42 has shipped."* Both grounds have since dissolved: the layer **shipped anyway** — the 140-panel bilingual Balakanda comic (#490), nine illustrated Krishna/Ganesha/Hanuman stories (#473), Garud Puran readings — and this PRD is deliberately **not content-heavy**: it authors *no* new shastra. Every question derives from, quotes, and deep-links content already on main. PRD-42 कण्ठस्थ owns the **recitation** half of learning (अभ्यास — drilling shlokas); this owns the **comprehension** half (समझ — did the child understand the story?). Together they are the complete learning loop the kids layer was missing.

---

**Product stance (locked): a quiz that is a door back into the text, not a game about the text.** Every question — answered right *or* wrong — resolves to its source (the comic panel, the story page, the shloka) with a one-tap **"पढ़ें ›"** hand-off into the shipped reader at that exact page. The measurable goal is not score; it is **quiz → reader navigations**. No timers, no lives, no leaderboards, no fail states, no ads, no accounts, **no child profiles or ages stored — ever** (questions carry an age *band* as pack labeling; the app never asks who is playing).

## 1. Problem

Parents in this audience want screen time that teaches shastra; the app now has the content kids love (comics, illustrated stories) but no way to know — or help — whether the child *understood* it. Outside the app, "Hindu quiz for kids" is a wasteland of ad-riddled trivia with unverified answers. The app can do what none of them can: ask questions whose answers are **provably checkable against the canonical text it already ships**, and turn every answer into another reading.

## 2. Goal

After a child reads a comic episode or story, five gentle questions confirm and deepen what they took in — and route them back into the text they half-remembered. Success (per-device local counters only, per the measurement stance): packs completed, and above all **hand-off taps per pack** (the quiz working as a reading pump).

## 3. The learning model (the heart of the feature)

### 3.1 Every question is ref-anchored
```
PrashnaRef =
  | { kind: 'comicPanel'; comicId; episodeId; panelId }
  | { kind: 'storyPage';  storyId; pageId }
  | { kind: 'verse';      sectionId; chapter?; verse }
  | { kind: 'katha';      kathaId; sectionIdInKatha? }
```
The ref is not metadata — it drives the reveal screen (shows the source panel/line) and the **"कहानी में देखें ›" / "श्लोक पढ़ें ›"** hand-off into the shipped reader via the existing routes. A question that cannot name its source does not ship.

### 3.2 Grace mechanics (no fear, no shame)
- **Wrong answer** → the reveal says "फिर से देखें" (let's look again), shows the source, offers the hand-off — and the question quietly returns later in the pack (one spaced re-ask, then rests). It is never marked ✗ in red, never counted against the child.
- **Right answer** → the same reveal (source + hand-off), because the point is the text either way, plus one **ज्ञान-मोती** (a knowledge pearl).
- **Progress = pearls collected per pack** — a collection, never a score against anyone. Pack completion = the quiet ॐ seal (the vidhi completion pattern) + "कहानी फिर पढ़ें" and "अगला पैक". The routine celebration animation is NOT wired.
- No timers anywhere; a "छोड़ें" skip is always available and judgment-free.

### 3.3 Two question forms, by age band (a pack label, not a child property)
- **चित्र-प्रश्न (picture rounds, आयु 5–8):** the question in simple Hindi + English, three **art options** rendered from shipped comic panels / story art ("किसने शिव-धनुष तोड़ा?" with three character panels). Pre-readers can play by recognition.
- **कथा-प्रश्न (story/verse rounds, आयु 8–12):** comprehension and meaning — "विश्वामित्र राम को वन में क्यों ले गए?", "'परित्राणाय साधूनाम्' में भगवान क्या वचन देते हैं?" — with text options, bilingual per the reading-language system.

### 3.4 गीता परीक्षा — the formal exam mode (the Gita-pariksha format)

अभ्यास packs (§3.1–3.3) are the practice layer; **परीक्षा is the formal mode, modeled on India's school Gita/sanskriti parikshas** (the format families already know from Gayatri Pariwar-style sanskriti exams, Samskrita Bharati's Gita Pravesha, Vidya Bharti's Sanskriti Gyan Pariksha, Chinmaya's graded contests). The pinned format:

1. **A leveled ladder, taken in succession.** स्तर 1 → 2 → 3…, each with a **declared syllabus** of specific adhyayas/kathas shown *before* enrolling, with "पाठ्यक्रम पढ़ें ›" deep links into the shipped Gita reader (and the PRD-42 कण्ठस्थ अभ्यास mode for the recitation half, when both ship). Proposed default pending §10: स्तर 1 = अध्याय 12 + 15 (the traditional short entry chapters), स्तर 2 = अध्याय 2, स्तर 3 = अध्याय 9 + कथा section — **to be replaced verbatim by the peeth's published syllabus once supplied**.
2. **A fixed written-style paper.** 25 MCQs drawn **deterministically** from the level's bank (seeded by level + attempt number, so a retake is a fresh paper, not the same one), one sitting, sections in the exam tradition (श्लोकार्थ · प्रसंग · सिद्धांत). **During the paper there are no reveals, no hand-offs, no hints** — the exam is honest. A declared duration (30 min) is displayed as elapsed time; it is never enforced with a cutoff — exam-*like*, without the fear.
3. **Pass threshold and graded result**, per the public conventions: **उत्तीर्ण ≥ 50% · प्रथम श्रेणी ≥ 70% · विशेष योग्यता ≥ 85%**; below 50% earns a **प्रयास-पत्र** (certificate of attempt) — in this exam tradition, *every* child leaves with a certificate.
4. **प्रमाणपत्र — the certificate card.** Rendered through the shipped share-card pipeline: the child's name (typed at generation time, stored only in the local result record, user-deletable), level, grade band, score, and the **panchang date line** — "गीता जयंती वि.सं. 2083, मोक्षदा एकादशी" when taken in the Jayanti window, else the tithi of the day — the one element no competing exam-app can produce. Shared only by the parent's explicit share action.
5. **उत्तर-समीक्षा after submission** — the paper's questions replay through the §3.2 grace reveals (source + पढ़ें › hand-off), so even the exam ends as reading.
6. **Exam season.** The festival engine's Gita Jayanti (Mokshada Ekadashi) anchors a seasonal window: the Kids library card and the post-reader invite surface "गीता जयंती परीक्षा" copy during it, and the Jayanti-window certificate carries the special date line. The परीक्षा is available year-round — the season is an invitation, not a gate.
7. **Still kid-safe:** no leaderboards, no rankings, no comparison with anyone; results and the name live only in `@vedansh/prashnottari` on this device; retakes unlimited and unshamed (best grade shown, attempts not counted publicly anywhere).

## 4. Where it lands in the app (surfaces)

1. **Kids library — the प्रश्नोत्तरी card** beside the comic card, in the library's own card treatment (painted-art thumb via the shared artwork system — RULEBOOK §3's no-letter-tile rule where art exists). Tap → the pack shelf.
2. **Pack shelf** — a §82 listing: scope line (`N पैक · आयु 5–12 · हर उत्तर कहानी तक`), then one **`ListingCard` per pack** — cover art filling the 4:5 thumb (the episode's curated key scene via `episodeCovers.ts` where the pack tracks a comic episode), eyebrow `पैक N · आयु 5–8`, title, one-line description, meta `N प्रश्न · N मोती`, and the ListingCard's thin **progress bar** showing pearls collected. Planned packs may appear as §82 subdued non-tappable teasers.
3. **Question screen** — reader-grade type, question Hindi-led, three option tiles (art tiles for picture rounds, text rows for story rounds; 44pt+ targets), §5 pager dots for pack progress, "छोड़ें" skip.
4. **Reveal screen** — the source artifact (panel art / story line / shloka with meaning), one gentle line of explanation (RULEBOOK §9 discipline: what + why), the **पढ़ें ›** hand-off, and "आगे ›".
5. **Post-reader invite (Phase 2)** — on finishing a comic episode or kids story that has a pack, the reader's end card offers one quiet chip: "इस कहानी के 5 प्रश्न खेलें?" Opt-in, dismissible, never a modal, never repeated after a dismissal for that story.
6. **गीता परीक्षा landing (Phase 2)** — reached from the pack shelf's top card: the level ladder (स्तर cards showing declared syllabus, best grade earned, locked-in-succession state), "पाठ्यक्रम पढ़ें ›" links, and "परीक्षा आरम्भ करें". Result screen → certificate card → उत्तर-समीक्षा.

Routes live beside the kids routes in the Home stack (`PrashnottariShelf`, `PrashnottariPack { packId }`, `GitaPariksha`, `GitaParikshaPaper { level, attempt }`), loaded lazily like the kids catalog/readers.

## 5. Content pipeline & sourcing discipline

Questions are **editorial content authored in-house** — not liturgical text, so RULEBOOK §11.3 does not block authorship — but every answer must be *verifiable against the shipped text*, enforced in CI:

- `mobile/src/data/prashnottari/` — `types.ts`, one pack file per pack, `index.ts` registry (`PACKS_BY_ID`, `getPackForComicEpisode`, `getPackForStory`).
- Each question: `{ id, band: '5-8'|'8-12', form: 'chitra'|'katha', promptHi/En, options[3] (art refs or text, exactly one correct), ref: PrashnaRef, revealHi/En (1–2 lines), sourceQuote? }`.
- **`sourceQuote`, where present, must appear verbatim in the shipped content it refs** — pinned by a `tsx --test` content gate (every ref resolves to a real panel/page/verse; every pack ≥5 questions; both languages present; Devanagari well-formedness; exactly one correct option; art refs resolve in the asset manifest).
- Where an external fact informed a question (a Puranic detail beyond the shipped text), the question carries a **review-only `sourceUrl`** — never rendered, pinned by the same no-source-rendered test the vidhi family uses. Preference order: questions answerable from shipped content alone.
- **Pack scope ladder:** packs track shipped reading units 1:1 so content compounds — per comic-प्रसंग packs (29 eventually), per kids-story packs (9), Hanuman Chalisa, simple Gita-shloka meaning packs, and festival "क्यों मनाते हैं?" packs drawn from the katha corpus.

## 6. What it does NOT do (non-goals)

- **No child profiles, names, ages, or any PII — ever.** Age bands label packs; nothing labels children. State is one anonymous AsyncStorage key (`@vedansh/prashnottari`: per-pack answered-ids + pearls).
- **No leaderboards, streaks, lives, timers, or competitive framing** (PRD-34's sankalp streaks are an adult-practice system; deliberately not reused here).
- **No new liturgical content**, no AI-generated questions shipped unreviewed — packs go through the same PR review as any content section (RULEBOOK §10, one pack family per PR at the start).
- **No multiplayer/network** — a Phase-3 pass-the-phone family round stays device-local (distinct from drafted PRD-36 family japa circles).
- **No rewards economy** — pearls unlock nothing and convert to nothing; certificates are **recognition artifacts** (the exam tradition's own currency), never unlockables, and never ranked against anyone.
- **No ranks, leaderboards, or inter-child comparison — in exam mode included.** The certificate names one child's own result; attempts are never counted or displayed publicly.

## 7. Phasing

1. **Phase 1 (OTA-shippable):** quiz engine + the three screens + the Kids-library card + **one pack family**: Balakanda प्रसंग 1–5 companion packs (~5 packs × 5–8 questions, picture + story mix). Content gate + Jest + Maestro smoke.
2. **Phase 2:** **गीता परीक्षा स्तर 1** (ladder landing, deterministic paper, grades, certificate card via the share pipeline, उत्तर-समीक्षा, Gita Jayanti window copy + date line) — gated on §10's syllabus confirmation; post-reader invites; packs for the nine kids stories + Hanuman Chalisa.
3. **Phase 3:** स्तर 2–3 of the ladder; remaining comic episodes as they're authored; festival "क्यों मनाते हैं?" packs; pass-the-phone family round; Gita meaning packs (8–12 band).

## 8. Why it fits the moat

Every competing kids' quiz is ads + unverified answers. This one is private by construction, free of manipulation mechanics, and uniquely **auditable**: each answer cites a text the family can open in the same app, in the same tap. For parents it converts the comics' screen time into checkable learning; for the product it closes the loop round-2 left open — कण्ठस्थ teaches the mouth, प्रश्नोत्तरी teaches the mind, the readers feed both.

## 9. Design compliance (design.md is authoritative)

- **Cards/listings** — the shelf is a **§82 `ListingCard`** listing under a scope line, with the ListingCard progress bar; the library entry uses the shared painted-art card treatment (no letter tiles where art exists). No hand-rolled cards (RULEBOOK §3).
- **Type/colour** — theme tokens only; question text at reader-grade sizes respecting the reading-size setting; ≥10pt floor; option tiles 44pt+; bilingual Hindi-led via the hi/en/gu/kn system.
- **Art** — picture options render through the shipped `ComicArt`/`KidsStoryArt` components and asset manifest (the sanctioned art pipeline); no new illustration style introduced.
- **Tone** — wrong answers never red (§2 warm-only chrome); the reveal uses the standard card surfaces; completion is the quiet seal, no confetti.
- **A11y** — options are screen-reader labeled with their text equivalents (art options carry the character/scene name); state never colour-only (§12).
- **Docs** — design.md gains a new numbered section for the three surfaces; RULEBOOK gains the prashnottari content-family row + the question-gate contract, in the same PR (§0.1).

## 10. Open decision — the exam syllabus source (release-gating for Phase 2)

The परीक्षा format above is synthesized from the **publicly verifiable conventions** of India's school Gita/sanskriti exams — leveled ladders taken in succession and chapter-scoped syllabi ([Samskrita Bharati's Gita Pravesha exam structure](https://dlp.samskritabharatiusa.org/BP-exams), [its leveled learning path](https://www.samskritabharatiusa.org/index.php/distance-learning-program/dlp-exams/bhashaa-pravesahaadi)), MCQ papers with a ~50% pass and participation certificates ([Bharat Gyan Pariksha, Children's University Gandhinagar](https://quiz.cugujarat.ac.in/AdvertisementEnglish.pdf)), school-wide certificate exams ([Vidya Bharti's Akhil Bharatiya Sanskriti Gyan Pariksha](https://www.madhusthali.edu.in/post/mv-students-shone-in-the-akhil-bhartiya-sanskriti-education-examination-2025)), and graded certificate bands — High Distinction ≥85% downward ([Chinmaya Mission's national Geeta competition](https://www.chinmaya.com.au/products/national-geeta-chanting-competition-2024-archive)).

The **specific Gayatri Peeth / Gita-exam syllabus the product owner has in mind could not be pinned from public sources** in this session's research. Per the repo's §11 sourcing discipline, the proposed स्तर syllabi (अध्याय 12+15 → 2 → 9) are therefore marked **placeholder**: before Phase 2 ships, the owner supplies the peeth's published syllabus booklet / exam notice, its level structure is transcribed verbatim into a checked-in convention doc (`docs/roadmap/conventions/gita-pariksha-v1.md`, with source URLs recorded review-only, the Guna Milan convention-doc pattern), and the ladder, pass bands, and paper length are corrected to match. If the peeth publishes no fixed convention, the synthesized format above stands, declared in-app as "परम्परागत गीता-परीक्षा पद्धति अनुसार" — never attributed to an organization we did not verify.
