# PRD-46 — बाल प्रश्नोत्तरी · Shastra & Granth Quiz for Kids

| | |
|---|---|
| **Status** | Draft for review — prototype attached |
| **T-shirt size** | M (engine + 3 screens are small; the recurring cost is question-pack authoring, which is editorial, not liturgical) |
| **Prototype** | [`docs/bal-prashnottari-prototype.html`](../../bal-prashnottari-prototype.html) — Kids-library entry, pack shelf, picture-question, gentle reveal with read-the-source hand-off, quiet completion, post-reader invite; every interaction annotated |
| **Feasibility** | ✅ Confirmed against current main — questions anchor to **stable shipped route params** (`ComicReader { comicId, episodeId, panelId }`, `KidsStoryReader { storyId, pageId }`, Gita/chalisa section ids), the pack shelf is the shipped §82 `ListingCard`, picture options reuse the comic/story art pipeline (`ComicArt` / `KidsStoryArt` + asset manifest). Question text is bundled JS — OTA-shippable. |

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

## 4. Where it lands in the app (surfaces)

1. **Kids library — the प्रश्नोत्तरी card** beside the comic card, in the library's own card treatment (painted-art thumb via the shared artwork system — RULEBOOK §3's no-letter-tile rule where art exists). Tap → the pack shelf.
2. **Pack shelf** — a §82 listing: scope line (`N पैक · आयु 5–12 · हर उत्तर कहानी तक`), then one **`ListingCard` per pack** — cover art filling the 4:5 thumb (the episode's curated key scene via `episodeCovers.ts` where the pack tracks a comic episode), eyebrow `पैक N · आयु 5–8`, title, one-line description, meta `N प्रश्न · N मोती`, and the ListingCard's thin **progress bar** showing pearls collected. Planned packs may appear as §82 subdued non-tappable teasers.
3. **Question screen** — reader-grade type, question Hindi-led, three option tiles (art tiles for picture rounds, text rows for story rounds; 44pt+ targets), §5 pager dots for pack progress, "छोड़ें" skip.
4. **Reveal screen** — the source artifact (panel art / story line / shloka with meaning), one gentle line of explanation (RULEBOOK §9 discipline: what + why), the **पढ़ें ›** hand-off, and "आगे ›".
5. **Post-reader invite (Phase 2)** — on finishing a comic episode or kids story that has a pack, the reader's end card offers one quiet chip: "इस कहानी के 5 प्रश्न खेलें?" Opt-in, dismissible, never a modal, never repeated after a dismissal for that story.

Routes live beside the kids routes in the Home stack (`PrashnottariShelf`, `PrashnottariPack { packId }`), loaded lazily like the kids catalog/readers.

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
- **No rewards economy** — pearls unlock nothing and convert to nothing; they are a picture of progress.

## 7. Phasing

1. **Phase 1 (OTA-shippable):** engine + the three screens + the Kids-library card + **one pack family**: Balakanda प्रसंग 1–5 companion packs (~5 packs × 5–8 questions, picture + story mix) — the comic is the most-loved kids asset and its `episodeCovers` give every pack real art. Content gate + Jest + Maestro smoke.
2. **Phase 2:** post-reader invites; packs for the nine kids stories + Hanuman Chalisa; festival "क्यों मनाते हैं?" packs.
3. **Phase 3:** remaining comic episodes as they're authored; pass-the-phone family round; Gita meaning packs (8–12 band).

## 8. Why it fits the moat

Every competing kids' quiz is ads + unverified answers. This one is private by construction, free of manipulation mechanics, and uniquely **auditable**: each answer cites a text the family can open in the same app, in the same tap. For parents it converts the comics' screen time into checkable learning; for the product it closes the loop round-2 left open — कण्ठस्थ teaches the mouth, प्रश्नोत्तरी teaches the mind, the readers feed both.

## 9. Design compliance (design.md is authoritative)

- **Cards/listings** — the shelf is a **§82 `ListingCard`** listing under a scope line, with the ListingCard progress bar; the library entry uses the shared painted-art card treatment (no letter tiles where art exists). No hand-rolled cards (RULEBOOK §3).
- **Type/colour** — theme tokens only; question text at reader-grade sizes respecting the reading-size setting; ≥10pt floor; option tiles 44pt+; bilingual Hindi-led via the hi/en/gu/kn system.
- **Art** — picture options render through the shipped `ComicArt`/`KidsStoryArt` components and asset manifest (the sanctioned art pipeline); no new illustration style introduced.
- **Tone** — wrong answers never red (§2 warm-only chrome); the reveal uses the standard card surfaces; completion is the quiet seal, no confetti.
- **A11y** — options are screen-reader labeled with their text equivalents (art options carry the character/scene name); state never colour-only (§12).
- **Docs** — design.md gains a new numbered section for the three surfaces; RULEBOOK gains the prashnottari content-family row + the question-gate contract, in the same PR (§0.1).
