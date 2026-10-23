# प्रश्न-संकलन मार्गदर्शिका · Question Curation Guide (DRAFT)

| | |
|---|---|
| **Status** | Draft for review — proposes the question types for the PRD-46 question book; not yet implemented |
| **Governs** | `mobile/src/data/prashnottari/` · contract in RULEBOOK §32 · product spec in [PRD-46](../../roadmap/prds/46-bal-prashnottari.md) |
| **Replaces** | The current book's single form (verse-cited multiple choice) — see §6 for how the 94 existing questions move |
| **Every example below** | Uses the app's actual text, copied from the bundled corpus on 2026-10-23 (Gita `chapter-12.json` / `chapter-15.json`, `comicBooks/balakanda.json`, `kidsStories/hanuman-sun.json`) |

---

## 1. Principles (apply to every type)

1. **Grounded.** Every answer lives in content the app ships. A question names its source (`ref`) and quotes it verbatim (`evidence`); CI fails a quote that is not in the corpus at that ref.
2. **Understanding, not addresses.** Never ask a child to recall *which verse number* says something, or how many verses a chapter has. Verse numbers appear only on the answer screen as the source line ("स्रोत: गीता 12.9 · पढ़ें ›"). This follows how real Gita exams work: references are printed beside questions as pointers, and the memory part of the tradition is reciting verse *text*, which PRD-42 कण्ठस्थ owns.
3. **Show, then ask.** Where a question is about a verse or a passage, the screen shows that verse or passage. The child reads and answers; what they bring is comprehension.
4. **Scripture is shown from the corpus, never retyped.** Verses, blanked lines and passages are all rendered at runtime from the ref. Authored lines carry no Sanskrit verse text.
5. **Kid-safe.** No fear, shame, ranking or "wrong!" language; frightening story beats are not quiz subjects; a wrong answer leads to the source, never a red cross.
6. **The bank is the study book.** As in real exams (ISKCON GCL's 1,250-question booklet, Gita Talent Search's 50 published verses), children may browse every question in a level before the paper. The paper draws from it.

---

## 2. The eight types at a glance

| # | Type | Tests | Age band | Draws from | Screen shows |
|---|---|---|---|---|---|
| 1 | **श्लोकार्थ** · verse meaning | What a shown verse says | 8–12 | Gita verse (Sanskrit + IAST shown, meaning hidden) | The verse |
| 2 | **सिद्धांत** · teaching | The idea a chapter teaches | 8–12 | Gita meaning | The question only |
| 3 | **किसने किससे कहा** · who said it | Speaker and listener | 8–12 | Gita speaker headings; comic `speaker` | The quoted line |
| 4 | **पद-पूर्ति** · fill the word | Recall of a verse word, with options | 8–12 | Gita Sanskrit lines | The line with one word blanked |
| 5 | **पढ़ो और बताओ** · read and answer | Reading comprehension | 5–8 | Story page; comic narration | The passage |
| 6 | **क्रम** · put in order | Story sequence | 5–8 and 8–12 | Comic panels; story pages | 3–4 event cards to order |
| 7 | **पात्र पहचानो** · who is this | Recognising a character | 5–8 | Story / comic art | A picture |
| 8 | **प्रसंग** · context | Chapter names, setting, a few general facts | 8–12 | Chapter titles and summaries; corpus facts | The question only |

---

## 3. The types, one by one

Each type lists: what it tests, the real-world precedent, how to curate it, rules, one **good example**, one **anti-pattern**, and the CI check that keeps it honest.

### 3.1 श्लोकार्थ — verse meaning

- **Tests:** can the child tell what a verse means when they see it?
- **Precedent:** "verse meaning" multiple choice in Gita practice apps; Gita Talent Search's exam on 50 published verses.
- **Curate:** pick a verse whose meaning carries one clear, child-graspable idea. The correct option paraphrases the corpus meaning; distractors are plausible but plainly not what the verse says.
- **Rules:** the prompt says "इस श्लोक में…" (in this shloka…) — never a verse number. The meaning must not be visible on the question screen.

**Example (Gita 12.13).** Screen shows:

> अद्वेष्टा सर्वभूतानां मैत्रः करुण एव च। / निर्ममो निरहङ्कारः समदुःखसुखः क्षमी।।
> *adveṣhṭā sarva-bhūtānāṁ maitraḥ karuṇa eva cha / nirmamo nirahankāraḥ sama-duḥkha-sukhaḥ kṣhamī*

- **प्रश्न:** इस श्लोक में भगवान अपने प्रिय भक्त का कौन-सा गुण बताते हैं? *(Which quality of His dear devotee does the Lord describe in this shloka?)*
- ✓ किसी से द्वेष नहीं — सबका मित्र और दयालु *(hates no one — a friend to all, and kind)*
- केवल अपने लोगों का मित्र *(a friend only to his own people)*
- सबसे दूर रहने वाला *(keeps away from everyone)*
- **Evidence:** "सबका मित्र (प्रेमी) और दयालु" / "is friendly and compassionate to all"

✗ **Anti-pattern:** "श्लोक 12.13 के अनुसार प्रिय भक्त कैसा होता है?" — this tests whether the child remembers that 12.13 is the verse about friendliness.

**CI:** ref resolves; evidence is in `meaningHi`/`meaningEn`; prompt has no verse number (`/\d+\.\d+/`).

### 3.2 सिद्धांत — teaching

- **Tests:** has the child understood what the chapter teaches, without being shown a verse?
- **Precedent:** ISKCON chapter worksheets ("Who are called bhakti-yogīs?"); Pune's value-based papers.
- **Curate:** frame the question around an idea or a situation, and name the chapter if needed (भक्तियोग, पुरुषोत्तमयोग are part of the declared syllabus).
- **Rules:** no verse number; one idea per question; the correct option must not need knowledge from outside the shipped meaning.

**Example (Gita 12.9).**
- **प्रश्न:** भक्तियोग में, यदि मन भगवान में स्थिर न रह सके, तो भगवान पहला कौन-सा उपाय बताते हैं? *(In Bhakti Yoga, if the mind cannot stay fixed on the Lord, what is the first remedy He gives?)*
- ✓ अभ्यास — बार-बार प्रयास करना *(practice — trying again and again)*
- साधना छोड़ देना *(giving up the practice)*
- किसी और को साधना करने देना *(letting someone else practise)*
- **Evidence:** "अभ्यासयोगके द्वारा तू मेरी प्राप्तिकी इच्छा कर" / "the yoga of constant practice"
- **Answer screen:** "स्रोत: गीता 12.9 · पढ़ें ›" *(Source: Gita 12.9 · read)*

✗ **Anti-pattern:** "अध्याय 12 के नौवें श्लोक में क्या कहा गया है?" — the same number-recall problem.

**CI:** as 3.1, plus the prompt must not contain the chapter's *verse* number (chapter names are allowed).

### 3.3 किसने किससे कहा — who said it to whom

- **Tests:** who is speaking, and to whom — the Gita's frame (Dhritarashtra → Sanjaya; Arjuna ↔ Krishna) and the comic's characters.
- **Precedent:** ISKCON chapter 1 worksheet ("Who started the conversation at Kurukshetra?").
- **Curate:** use only speakers the corpus names — Gita headings (अर्जुन उवाच, श्री भगवानुवाच) and the comic's `speaker` field.
- **Rules:** within the स्तर 1 syllabus (अध्याय 12 + 15) only Arjuna and the Lord speak, so this type is capped at about 2 questions per paper there. It grows in later levels (अध्याय 1 and 2 bring Dhritarashtra and Sanjaya).

**Example A (Gita 12.1).**
- **प्रश्न:** बारहवें अध्याय के आरम्भ में प्रश्न कौन पूछता है, और किससे? *(At the start of chapter 12, who asks the question, and to whom?)*
- ✓ अर्जुन, भगवान श्रीकृष्ण से *(Arjuna, to Lord Krishna)*
- संजय, धृतराष्ट्र से *(Sanjaya, to Dhritarashtra)*
- श्रीकृष्ण, अर्जुन से *(Krishna, to Arjuna)*
- **Evidence:** "अर्जुन उवाच" / "Arjuna said"

**Example B (comic, प्रसंग 1, panel bk-01-01).** Screen shows the line: "गुण, साहस और सत्य का आदर्श कौन है?" *("Who embodies virtue, courage and truth?")*
- **प्रश्न:** यह प्रश्न किसने पूछा? *(Who asked this?)*
- ✓ वाल्मीकि *(Valmiki)* · नारद *(Narada)* · ब्रह्मा *(Brahma)*
- **Evidence:** the panel's `speaker` field: `Valmiki`

**CI:** the correct speaker equals the corpus heading or the panel's `speaker` field.

### 3.4 पद-पूर्ति — fill the missing word

- **Tests:** recall of a verse's words, supported by options — the bridge between understanding and recitation.
- **Precedent:** fill-in-the-blank Sanskrit words in Gita practice apps; Chinmaya's chanting competition (its 2026 Pune round uses अध्याय 12).
- **Curate:** choose a line where the blanked word is meaningful (a noun or key verb, never a particle like च or एव). Distractors are **real words from the same syllabus chapters**, never invented Sanskrit.
- **Rules:** the blank is created at runtime from the corpus by (line, word index), so the data never retypes the verse. Never blank a speaker heading (the corpus puts "श्री भगवानुवाच" on the same line as verse words in 12.2 and 15.1) or a verse-end marker ("।।12.8।।").

**Example (Gita 12.8, line 1).** Screen shows:

> मय्येव मन आधत्स्व मयि ______ निवेशय।

- **प्रश्न:** खाली स्थान में कौन-सा शब्द आएगा? *(Which word fills the blank?)*
- ✓ बुद्धिं *(the intellect)*
- श्रद्धया *(with faith — from 12.2)*
- प्रियः *(dear — from 12.14–12.17)*
- **Answer screen:** the full line, then its meaning: "तू मेरेमें मनको लगा और मेरेमें ही बुद्धिको लगा" / "Fix your mind on Me, and your intellect in Me"

✗ **Anti-pattern:** a distractor like "बलं" that never occurs in the syllabus — it is invented Sanskrit in a verse's place.

**CI:** the blanked word is the token at (line, word) after removing markers and headings; each distractor occurs as a token somewhere in the syllabus chapters; the three options are distinct.

### 3.5 पढ़ो और बताओ — read and answer

- **Tests:** reading comprehension of a short passage. The answer is on the screen, so nothing has to be remembered — ideal for 5–8.
- **Precedent:** ISKCON Pune's values exam, where most questions are on a paragraph printed in the paper; the Kurukshetra Gita Mahotsav quiz, which asks children to find answers in the book.
- **Curate:** use one story page or comic narration of 2–4 sentences, and ask about something stated in it.
- **Rules:** the answer must be stated in the passage, not inferred; one question per passage for 5–8, up to two for 8–12.

**Example (Hanuman and the Sun, page `hungry-at-dawn`).** Screen shows:

> सुबह का लाल सूरज उग रहा था। हनुमान को वह बड़ा, पका हुआ फल लगा। वे अभी बहुत छोटे थे और अंतर नहीं जानते थे। उसे पाने के लिए वे आकाश में उछल पड़े।
> *(The red morning sun was rising. To Hanuman, it looked like a large, ripe fruit. He was still too young to know the difference. Eager to reach it, he sprang into the sky.)*

- **प्रश्न:** हनुमान ने सूरज को फल क्यों समझ लिया? *(Why did Hanuman mistake the sun for a fruit?)*
- ✓ वे अभी बहुत छोटे थे *(he was still very young)*
- वे बहुत भूखे नहीं थे *(he wasn't very hungry)*
- रात का समय था *(it was night-time)*
- **Evidence:** "वे अभी बहुत छोटे थे और अंतर नहीं जानते थे" / "He was still too young to know the difference"

**CI:** evidence is a substring of the shown passage itself (the passage ref and the evidence ref must be the same page).

### 3.6 क्रम — put the events in order

- **Tests:** following a story's sequence — cause and effect.
- **Precedent:** word- and event-ordering exercises in practice apps; story-sequencing in primary-school comprehension.
- **Curate:** pick 3 events (4 for 8–12) from one episode or story, far enough apart to be distinct. Each card is a short authored caption plus the panel's or page's art.
- **Rules:** the correct order is the corpus order. Captions describe events in plain words and must not give away the order ("पहले…", "अन्त में…").

**Example (comic प्रसंग 1).** Cards, shown shuffled:

| Card | Caption | Source panel (corpus order) |
|---|---|---|
| A | वाल्मीकि ने नारद से आदर्श मनुष्य के बारे में पूछा *(Valmiki asks Narada about the ideal person)* | bk-01-01 (1st) |
| B | शिकारी ने क्रौंच पक्षी को मारा *(a hunter kills a crane)* | bk-01-03 (3rd) |
| C | ब्रह्मा ने रामकथा कहने को कहा *(Brahma asks for Rama's story)* | bk-01-04 (5th) |
| D | लव और कुश ने रामकथा सीखी *(Lava and Kusha learn the story)* | bk-01-05 (7th) |

- **प्रश्न:** इन घटनाओं को सही क्रम में लगाओ। *(Put these events in order.)* ✓ A → B → C → D

**CI:** every card's panel or page exists, all are in one episode or story, and the answer order matches their positions in the corpus.

### 3.7 पात्र पहचानो — who is this

- **Tests:** recognising characters — the earliest, pre-reading form of the quiz.
- **Precedent:** picture rounds in children's quizzes; the scholarship test's "Krishna pastimes" section for the youngest age group.
- **Curate:** use an illustration whose page text names the character. Options are characters from the same shelf.
- **Rules:** use only artwork that already ships and has a reviewed frame (some newer stories reference art keys that are not delivered yet — see the kids-stories wiki gotcha). The character must be clearly the subject of the image.

**Example (Hanuman and the Sun, art `hs01`).** Screen shows that page's illustration.
- **प्रश्न:** चित्र में यह नन्हा बालक कौन है? *(Who is this little boy in the picture?)*
- ✓ हनुमान *(Hanuman)* · कृष्ण *(Krishna)* · गणेश *(Ganesha)*
- **Evidence:** "हनुमान को वह बड़ा, पका हुआ फल लगा" / "To Hanuman, it looked like a large, ripe fruit"

**CI:** the art key is in the shipped asset manifest; the correct option's name occurs in that page's text.

### 3.8 प्रसंग — context

- **Tests:** the frame around the text — chapter names, where and when, and a few general facts.
- **Precedent:** ISKCON's chapter 1 worksheet ("How many chapters are there in Bhagavad Gita?"); Gita Jayanti school quizzes on chapters and key teachings.
- **Curate:** chapter names (from `titleHi`/`titleEn`), which chapter teaches what (chapter level only), and **general facts the corpus can prove** — the Gita has 18 chapters (18 chapter files ship).
- **Rules:** **never** "how many verses does chapter N have" or any verse-number question. A general fact needs a CI-computable source.

**Example A (chapter name).**
- **प्रश्न:** भगवान ने अपने प्रिय भक्त के लक्षण किस अध्याय में बताए? *(In which chapter does the Lord describe the marks of His dear devotee?)*
- ✓ भक्तियोग *(Bhakti Yoga)* · पुरुषोत्तमयोग *(Purushottama Yoga)* · सांख्ययोग *(Sankhya Yoga)*
- **Evidence:** chapter 12 `titleHi`: "भक्तियोग"

**Example B (general fact).**
- **प्रश्न:** श्रीमद्भगवद्गीता में कितने अध्याय हैं? *(How many chapters does the Bhagavad Gita have?)*
- ✓ 18 · 12 · 24
- **Evidence:** computed — the corpus ships 18 chapter files

✗ **Anti-pattern:** "भक्तियोग अध्याय में कितने श्लोक हैं?" *("How many shlokas are in the Bhakti Yoga chapter?")* — this is verse-count trivia, not understanding.

**CI:** chapter facts resolve to `titleHi`/`summaryHi`; computed facts are recomputed from the corpus in the test.

---

## 4. Blueprints — what a paper or pack contains

### 4.1 गीता परीक्षा स्तर 1 (25 questions · syllabus अध्याय 12 + 15)

| Section | Types | Questions |
|---|---|---|
| श्लोकार्थ | 3.1 verse meaning | 7 |
| पद-पूर्ति | 3.4 fill the word | 5 |
| सिद्धांत | 3.2 teaching | 6 |
| प्रसंग | 3.8 context (3) + 3.3 who said (2) | 5 |
| अनुच्छेद | 3.5 read and answer, on a shown verse meaning | 2 |
| **Total** | | **25** |

The bank keeps more questions than the paper needs in every section, so a retake draws fresh questions throughout.

### 4.2 अभ्यास pack, आयु 5–8 (6–8 questions per story or episode)

2 × पढ़ो और बताओ · 2 × पात्र पहचानो · 2 × story questions (multiple choice on what happened) · 1 × क्रम (3 cards)

### 4.3 अभ्यास pack, आयु 8–12 (8–10 questions)

4 × story questions · 2 × किसने किससे कहा (comic `speaker`) · 1 × क्रम (4 cards) · 1–2 × पढ़ो और बताओ

---

## 5. Editor's review checklist

Before flipping a pack from `draft` to `verified`:

- [ ] Does any prompt ask for a verse number or a verse count? (CI catches digits; also read for "नौवें श्लोक"-style wording.)
- [ ] Could a child who understood the text, but memorised nothing, answer it with what the screen shows?
- [ ] Is exactly one option right, and is each wrong option clearly wrong to an adult reader of the source?
- [ ] Are distractors kind and sensible — no mocking, no false facts presented as real places or people?
- [ ] For पद-पूर्ति: is the blank a meaningful word, and are the distractors real words from the syllabus?
- [ ] For क्रम: are the events far enough apart, and do the captions avoid giving away the order?
- [ ] For पात्र पहचानो: is the character clearly the subject of the picture?
- [ ] Is the reveal line accurate to the source, and free of verdicts on the child?
- [ ] Does the pack avoid the story's frightening beats?

---

## 6. How the existing 94 questions move

| Current group | Count | Becomes |
|---|---|---|
| Gita questions citing "श्लोक 12.x / 15.x के अनुसार" | 40 | Mostly **श्लोकार्थ** (verse shown, number removed); idea-led ones become **सिद्धांत** |
| Gita questions citing "the last verse of the chapter" | 2 | **सिद्धांत**, asked by idea |
| Gita chapter-name and speaker questions | 4 | **प्रसंग** and **किसने किससे कहा** (already number-free) |
| Gita idea-only questions | 2 | **सिद्धांत**, unchanged |
| Comic and story questions | 46 | Stay as story multiple choice; new **पढ़ो और बताओ**, **क्रम** and **पात्र पहचानो** questions are added to reach the §4.2–4.3 mixes |

Every existing `evidence` quote carries over, so the grounding check keeps covering all of them. New: about 10 **पद-पूर्ति** questions for the स्तर 1 bank, plus one **क्रम** and two **पात्र पहचानो** per kids pack.

---

## 7. Data shape changes this implies (sketch, not yet built)

```ts
type PrashnaForm =
  | { kind: 'mcq' }                                                    // story MCQ, सिद्धांत, प्रसंग
  | { kind: 'shlokarth'; show: { chapter: number; verse: number } }    // verse rendered from the corpus, meaning hidden
  | { kind: 'padPurti'; verse: { chapter: number; verse: number }; line: number; word: number;
      distractors: readonly [string, string] }                         // blank and options checked against corpus tokens
  | { kind: 'kram'; items: readonly { ref: PrashnaRef; caption: Bilingual }[] } // answer = corpus order
  | { kind: 'padho'; passage: PrashnaRef }                             // passage rendered; evidence must be inside it
  | { kind: 'pehchano'; art: string };                                 // shipped, frame-reviewed art key
```

A new CI rule per type, as listed under each type in §3. Prompts get a hard check: no verse-number pattern in any Gita prompt.

---

## 8. Research basis

Formats observed (via search-result excerpts, 2026-10-21; several host pages could not be opened from the build environment):

- ISKCON Gita Champions League — 100 MCQs from a 1,250-question booklet given at registration.
- ISKCON Gita Talent Search / International Gita Scholarship Test — MCQs on 50 published verses; under-15s get Krishna-pastime questions; "comprehension and reflection over memorisation".
- ISKCON Pune values exam — 30% from the introduction, the rest on a paragraph printed in the paper.
- ISKCON chapter worksheets — MCQ and short answer, verse references printed beside the questions.
- Ahobilam Math quiz corner — Basic, Intermediary and Advanced sets of 25.
- Chinmaya Geeta Chanting — one chapter per year (the 2026 Pune round: अध्याय 12), verse counts by age group, scored on memory and pronunciation, certificate for 2+ verses.
- Gita practice apps — fill-the-word, word and verse meaning, matching, ordering.
- Gita Jayanti school quizzes and the Kurukshetra Gita Mahotsav quiz — chapters, slokas, teachings; answers found in the book.

Still open: the Gayatri Pariwar exam paper itself could not be found publicly; the स्तर 1 syllabus stays a placeholder until it is supplied (PRD-46 §10).
