# सनातन परिचय — Draft feature scope

**Draft for product and content review · 2 November 2026**

सनातन परिचय is Vedansh’s illustrated learning section for understanding deities, sacred symbols, worship objects and the traditions connected with them. It should help someone move from a familiar question—“पूजा में स्वस्तिक क्यों बनाते हैं?” or “दस दिक्पाल कौन हैं?”—to a clear explanation, a visual overview and relevant content already available in the app.

The first release contains two complete collections—दस दिशाएँ और दस दिक्पाल and 33 कोटि देवता—plus twelve symbol and worship-object introductions, six foundational lessons and links to existing deity and Navgraha introductions. The wider catalogue below defines the expansion path.

## Product purpose

The section serves curious devotees and families who recognize a name, image or practice but want to understand its meaning. Readings should be approachable without requiring a Kundali, birth details or specialist vocabulary.

A successful journey answers the user’s original question, makes the source context understandable and offers a useful next reading. Learning content connects to existing devotional readers and Puja Vidhi when a relevant verified destination exists.

## Placement in Vedansh

Use one permanent Home entry named **सनातन परिचय**. Within it, **देव परिचय** and **शुभ चिह्न और पूजा के प्रतीक** are the first two principal collections. Do not add a new bottom-navigation tab or separate Home tiles for every collection.

| Entry point | Destination |
| --- | --- |
| Home entry | सनातन परिचय learning hub |
| Existing deity pages | Relevant introduction and related learning |
| Jyotish hub | Existing नवग्रह परिचय, also linked from the learning hub |
| वास्तु दिशा | दिशाएँ और दिक्पाल collection |
| ऐसा क्यों or प्रथा और मान्यता | Related explanation with a return path to the practice |
| Search and जिज्ञासा | Exact profile, lesson, symbol or source-specific group |
| Saved items and resume | Saved unit or last reading position |

Current main already contains deity essays in DeityDetailScreen, the Navgraha reference in GrahaReferenceScreen and eight directional-guardian labels in the Vastu mandala. Reuse their identities and reviewed content. The Pratha integration depends on the work in [PR 564](https://github.com/persisharma/aadhyatma/pull/564), which was open when checked on 2 November 2026.

## Complete content catalogue

The catalogue is a long-term editorial scope. Only collections with complete published content appear in the app.

| Collection | Included topics | Delivery |
| --- | --- | --- |
| पहले यह समझें | Six foundational lessons on terminology, deity forms and reading different kinds of religious explanations | First release |
| देव परिचय | Existing deity introductions, their names, attributes, stories and links to devotional texts | Reuse first, deepen later |
| देवताओं के समूह | 33 देवता, अष्टवसु, एकादश रुद्र, द्वादश आदित्य; later पंचदेव, त्रिदेव and त्रिदेवी | 33-devata collection first |
| दिशाएँ और दिक्पाल | Ten directions, guardians, iconography and worship context | First release |
| नवग्रह परिचय | Existing general nine-graha reference, connected to relevant learning | Reuse first |
| शुभ चिह्न और पूजा के प्रतीक | स्वस्तिक, ॐ, श्री and the first twelve symbol and worship-object introductions | First release |
| स्वरूप और अवतार | दशावतार, नवदुर्गा, अष्टलक्ष्मी and selected deity forms | Expansion |
| पूजा सामग्री और पवित्र वनस्पतियाँ | रोली, चंदन, धूप, कपूर, तुलसी, बिल्वपत्र, दूर्वा, पीपल, वट and आम के पत्ते | Expansion |
| प्रकृति और तत्त्व | पंचमहाभूत and selected traditional cosmological concepts | Expansion |
| काल और पंचांग की समझ | तिथि, पक्ष, मास, अधिक मास, अयन, ऋतु, वार and नक्षत्र as educational concepts | Expansion |
| ग्रंथ परिचय | Veda, Upanishad, Purana, Itihasa, Gita and devotional-text forms, with a beginner reading guide | Expansion |
| मंदिर और दर्शन | Temple spaces, ध्वज, घंटी, दीप, दर्शन, प्रदक्षिणा and प्रसाद, with regional and temple-specific context | Expansion |
| ऋषि और ज्ञान परम्परा | सप्तऋषि and selected teachers, distinguished from deity groups | Later reference expansion |

**काल और पंचांग की समझ**, **ग्रंथ परिचय** and **मंदिर और दर्शन** cover familiar questions about calendar vocabulary, religious literature and temple visits. They extend the same learning structure beyond deity identities and symbols.

Questions, glossary definitions and related stories are available across collections. They do not create additional top-level shelves.

## First release content

### Six foundational lessons

These are proposed lesson titles. Their explanations require the same editorial sourcing as the main collections.

1. देव देवी और देवता

2. ईश्वर भगवान और ब्रह्म को समझने की अलग परम्पराएँ

3. अवतार स्वरूप और देवसमूह

4. एक देवता के अनेक नाम और रूप

5. कथा प्रतीक और परम्परा को कैसे समझें

6. ग्रंथ संदर्भ और क्षेत्रीय मान्यता में भेद

Each lesson begins with a simple question, introduces only the vocabulary needed to answer it and links to one relevant collection.

### दस दिशाएँ और दस दिक्पाल

Provide an opening explanation, an interactive visual and ten source-specific guardian introductions.

- Show eight horizontal directions on a north-up direction wheel. Present ऊर्ध्व and अधो separately.

- Keep direction labels consistent with the existing app vocabulary.

- Explain each selected guardian’s name, associated direction and traditional role.

- Add attributes, vehicle, stories and worship references only where supported by the chosen source.

- Keep alternative enumerations or depictions attached to their relevant tradition.

- Offer a complete text-list alternative for accessibility and quick reference.

This is an educational diagram. It does not require compass sensors or location permission. The Vastu mandala’s centre is not a substitute for either vertical direction. Source-specific guardian associations must be reviewed before publication.

### 33 कोटि देवता

Use the familiar title as the entrance to a source-based explanation of the thirty-three deities.

The core reading uses **बृहदारण्यक उपनिषद् 3.9.1–9** as a defined reference. Verse 3.9.2 enumerates eight Vasus, eleven Rudras, twelve Adityas, Indra and Prajapati. The succeeding explanations belong with that enumeration; later named lists must be presented separately rather than substituted into it.

Include:

- The opening question “33 कोटि देवता कौन हैं?”

- An accessible explanation of the selected passage.

- Three expandable group views and the two additional entries in that enumeration.

- A complete roster according to that source, with source-appropriate explanations.

- A discussion of the popular expression “33 करोड़” and interpretations of “कोटि.”

- Relevant differences between Vedic explanations and later traditions.

- Links to shared profiles where an identity already exists in Vedansh.

Avoid presenting “कोटि means प्रकार” as the complete explanation. Do not imply that this passage is an exhaustive inventory of every deity worshipped in every Hindu tradition. A conceptual entry does not require an invented personality, biography or portrait.

### Twelve symbols and worship objects

Publish introductions to **स्वस्तिक, ॐ, श्री, कलश, नारियल, दीपक, शंख, घंटी, कमल, तिलक, मौली and अक्षत**.

Each introduction covers identification, source-backed meanings, uses in relevant traditions, associated stories where available, regional differences and links to an existing practice or Vidhi.

For स्वस्तिक, include a clear illustration, documented interpretations, worship and household contexts, and relevant variations in form and terminology. Any drawing guide must name the convention it follows.

The later symbol catalogue adds चरण-चिह्न, शुभ–लाभ, रुद्राक्ष, तुलसी माला, यज्ञोपवीत, भस्म, तोरण, रंगोली, ध्वजा, मंडल and यंत्र. Treat words, objects, worn items and diagrams as distinct content types.

## Relationship with existing sections

| Section | Main question | Ownership |
| --- | --- | --- |
| देव परिचय | ये कौन हैं | Identity, forms, groups and relationships |
| शुभ चिह्न और पूजा के प्रतीक | इसका क्या अर्थ है | Symbols, objects and attributed meanings |
| ऐसा क्यों or प्रथा और मान्यता | हम यह करते क्यों हैं | Practices and their explanations |
| पूजा विधि | इसे कैसे करें | Existing verified guidance for performing a practice |
| पंचांग | यह कब है | Existing calendar calculations and observances |
| काल और पंचांग की समझ | इन शब्दों का अर्थ क्या है | Educational explanations linking to the live calendar |

A कलश introduction can lead to “कलश स्थापना क्यों?” and then to the relevant verified Vidhi. A तिथि lesson can lead to the current Panchang. The educational article does not reproduce the calculation engine or the full ritual.

Reuse existing stories, deity essays, Navgraha references and liturgical texts through stable references. Create new explanation only where it adds a distinct learning purpose.

## Screens and user journeys

| Screen | Main content and action |
| --- | --- |
| Learning hub | Featured question, continue reading, published collections and access to saved learning |
| Collection overview | Short introduction, visual summary, lessons and reading order |
| Interactive overview | Direction wheel, group diagram or annotated illustration |
| Profile | Deity, concept, symbol or object introduction with related content |
| Lesson reader | Illustrated explanation with existing reader controls |
| Source and glossary sheet | Definitions, passage references, tradition labels and edition credits |

The first visit highlights the two complete deity collections and the symbols collection. Returning users see a compact continue-reading card without losing direct access to the catalogue.

**Journey examples**

1. Home → सनातन परिचय → दिशाएँ और दिक्पाल → guardian profile → related lesson → Back to the same diagram selection.

2. Search “swastik kyu banate hain” → exact published answer → स्वस्तिक introduction → save or share.

3. Jyotish → नवग्रह परिचय → related learning → Back to the same graha.

4. Vastu → guardian explanation → Back to the retained Vastu state.

5. Saved item → exact lesson position → continue reading.

Target two taps from Home to a collection overview and three to a profile. Search results should open the matched unit directly.

### Profile and lesson structure

Use the blocks appropriate to the subject:

- परिचय

- नाम और पहचान

- भूमिका या समूह

- प्रतीक और पारम्परिक विशेषताएँ

- कथा या ग्रंथ संदर्भ

- अर्थ और व्याख्या

- परम्पराओं में भिन्नता

- आगे क्या पढ़ें

Do not force every subject into every block. Teach one main idea per reading page, with a short overview before the deeper explanation. Reader pages can scroll to preserve complete content.

## Visual and interaction direction

Use Vedansh’s warm parchment, painted devotional artwork, existing typography and shared reader controls. Keep text native and separate from artwork so language and text-size changes remain usable.

| Subject | Visual treatment |
| --- | --- |
| Dikpal | Eight-direction wheel, separate vertical-direction controls and reviewed guardian art |
| Thirty-three deities | Expandable groups and source-specific membership views |
| Sacred symbols | Clean diagram or annotated object illustration |
| Avatars and forms | Illustrated sequence or collection of distinct profiles |
| Deity introductions | One opening painting followed by readable explanation |
| Time and scriptures | Simple timelines, structured comparisons and links to existing readers |

Use exact diagrams for counts, relationships and directions. Decorative generated artwork must not carry information that needs to be precise. Match every depiction to the chosen traditional context, including attributes, hands and vehicles.

The two-sisters treatment remains specific to children’s stories. General devotional learning uses an adult-friendly presentation.

## Shared feature behaviour

| Capability | Required behaviour |
| --- | --- |
| Language | Author Hindi and English. Follow current Gujarati and Kannada script-conversion behaviour and do not describe that output as native translation |
| Reading size | Support Standard, Large and enlarged system text without clipping or shrinking text to fit |
| Read aloud | Reuse the existing reader controls; start only after a user action |
| Auto slide | Use the existing mechanism for paged lessons where applicable |
| Save and resume | Save a unit and restore the collection, selection and reading position through cold restart |
| Read progress | Follow existing coverage behaviour; count meaningful reading rather than an opening tap |
| Search | Index published text, names, alternate spellings and Hindi, English and Hinglish aliases |
| जिज्ञासा | Resolve from verified data and open the exact unit; abstain when no supported answer exists |
| Sharing | Use existing share infrastructure, exact current branding and readable source credit |
| Offline | Keep core text available offline and reuse downloaded artwork |
| Accessibility | Provide labelled controls, screen-reader ordering and a text alternative to every interactive diagram |
| Navigation | Preserve the originating screen, query, scroll position and expected Back stack |

Source credits inside the app follow the repository’s existing attribution policy. Store research URLs in content provenance; display the appropriate textual reference and edition credit in the app.

## States and edge cases

Support fresh and returning visits; saved and unsaved units; first and last reading pages; and entry through Search, a cross-link or a deep link.

- Render text immediately while artwork loads. Use the established neutral fallback when artwork is unavailable.

- Handle image failure, retry and interrupted downloads without blocking reading.

- Keep text and valid cached art available after an offline restart.

- Hide unpublished units and empty categories. Do not show dead cards for the later catalogue.

- Give an unavailable or retired deep link a clear return path.

- Preserve the user’s language, text size, reading position and selected diagram item.

- Cancel read-aloud, animation and outstanding work according to the shared lifecycle behaviour.

- Make diagram interactions work without gestures through an equivalent list.

## Content model and publication

Represent a learning unit as a deity, concept, group, symbol, object, lesson or glossary definition. A learning entity can map to an existing devotional deity identity, but adding a conceptual entry must not automatically expand every devotional filter.

| Data | Purpose |
| --- | --- |
| Stable unit ID and content type | Identity across routes, saves, search and updates |
| Hindi and English title and explanation | Authored content and derived display variants |
| Source and passage references | Edition, chapter or verse, opened research URLs and verification date |
| Tradition and interpretation context | Scope of the explanation and recorded variants |
| Group membership with source context | Accurate enumerations without mixing lists |
| Related unit and existing-content IDs | Cross-links without duplicated content |
| Artwork descriptors and reviewed mapping | Correct identity, layout and delivery |
| Publication status | Draft, review and published visibility |
| Revision information | Content corrections that preserve saved IDs |

An entity may have several roles. Indra’s appearance in a directional collection and a source-specific enumeration should reuse identity while allowing a different contextual explanation.

### Editorial rules

1. Verify religious claims and quoted text against the applicable repository source requirements. Record the exact publications actually consulted.

2. Distinguish scripture, translation, traditional interpretation, regional custom and Vedansh-written explanation.

3. Keep lists, counts and meanings tied to their source. Do not combine conflicting enumerations into a universal list.

4. Never invent a mantra, quotation, story, attribution or deity depiction to fill a gap.

5. Preserve complete quoted texts, or clearly identify an allowed selection under the repository policy.

6. Explain symbolism as an attributed interpretation. Do not turn it into unsupported scientific proof or a guaranteed personal outcome.

7. Review translations, script conversion, complete narratives and every illustration before publication.

8. Publish only complete verified units. Drafts remain hidden.

यंत्र and mandala content begins with educational introductions. Detailed ritual instructions require their own source and editorial review.

## Delivery plan

### Phase 1

Deliver the learning hub, six screen types, two complete deity collections, six foundational lessons and twelve symbol introductions. Reuse the existing deity and Navgraha content. Include save, resume, search, जिज्ञासा integration, sharing, read-aloud, accessibility and offline behaviour.

Content completeness means ten guardian introductions in a declared traditional context, a complete roster for the selected thirty-three-deity source, all twelve symbol introductions and all six foundational lessons. It does not mean thirty-three newly invented biographies or portraits.

### Phase 2

Expand vehicles and attributes, Panchadev, Tridev, Tridevi, selected avatars and goddess forms, sacred plants and worship materials. Add richer Pratha, Vidhi, deity and festival cross-links.

### Phase 3

Add sacred time, scripture orientation, temple learning, selected cosmology and rishi traditions. Optional knowledge checks can follow the completed learning content.

### Outside the first release

Recorded narration, a new notification programme, a new bottom tab, new compass permissions, a ritual-prescription engine, an open-ended AI religious-answer system and a points or streak system are outside this release.

The feature draft does not authorize a build, store submission, OTA publication or changes to existing personal astrology behaviour.

## Acceptance criteria

### Product and content

- Both flagship collections, the twelve symbol introductions and the six foundational lessons are complete and accessible.

- Every published group has a source-specific roster and internally consistent counts.

- Every claimed fact, quotation and illustration clears its applicable editorial review.

- Shared identities and existing devotional content remain consistent across entry points.

- All displayed categories contain published content.

### Behaviour

- Users can reach collection overviews within two taps from Home.

- Search and जिज्ञासा open exact units and handle unsupported queries without invented answers.

- Save, resume and reading position survive a cold restart.

- Every entry route returns to the expected origin without losing its state.

- Offline text and cached artwork work without sensor or location access.

- Actual exported shares preserve complete selected content, readable type, source credit and current branding.

### Verification

- Verify the full journey on iOS and Android.

- Cover Hindi, English, Gujarati and Kannada display modes at Standard and Large, compact widths and enlarged system text.

- Test source visibility, publication filtering, source-specific membership, relationship targets, persistence and search resolution.

- Exercise offline, failed art, retry, cancellation, backgrounding and restart.

- Execute the relevant native journeys and inspect real screens and share files.

- Confirm the asset registry, published artwork and cache path reach the visible screen.

- Keep payloads lazy and protect current startup performance.

- Update design, integration rules, feature documentation and meaningful regression tests with implementation.

A prototype, successful bundle or parsed native-test file does not establish native verification. Report implementation, integration, tests, native verification and release as separate states.

## Delivery outputs and dependencies

The implementation work should produce the content registry and provenance ledger, reviewed artwork manifest, integrated screens and routes, search and जिज्ञासा entries, persistence, share support, tests and a matching feature handover.

Before implementation, resolve overlap with active Pratha and navigation work. Validate the existing deity essays and graha content before reusing individual claims. Use the current repository checklist and any updated rules when work begins.

## Reference material

The following references ground the existing integration points and the defined thirty-three-deity passage. They do not constitute completed verification of the planned catalogue.

- [Vedansh shared build checklist](https://github.com/persisharma/aadhyatma/blob/main/docs/engineering/vedansh-build-checklist.md)

- [Vedansh content and integration rulebook](https://github.com/persisharma/aadhyatma/blob/main/RULEBOOK.md)

- [Vedansh design system](https://github.com/persisharma/aadhyatma/blob/main/design.md)

- [Existing deity detail screen](https://github.com/persisharma/aadhyatma/blob/main/mobile/src/screens/DeityDetailScreen.tsx)

- [Existing Navgraha reference screen](https://github.com/persisharma/aadhyatma/blob/main/mobile/src/screens/GrahaReferenceScreen.tsx)

- [Existing Vastu mandala and guardian labels](https://github.com/persisharma/aadhyatma/blob/main/mobile/src/data/vastu/mandala.ts)

- [Pratha integration work in PR 564](https://github.com/persisharma/aadhyatma/pull/564)

- [Brihadaranyaka Upanishad section 3.9 with Sanskrit and translation](https://www.wisdomlib.org/hinduism/book/the-brihadaranyaka-upanishad/d/doc118360.html)
