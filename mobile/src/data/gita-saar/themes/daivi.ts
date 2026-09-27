/**
 * दैवी सम्पदा — how to live well: the qualities the Gita lists.
 * Refs resolved against the bundled corpus on 2026-09-27 (chapter 13 uses
 * the 35-verse numbering: 13.8 = amānitvam…).
 */
import type { GitaSaarTheme } from '../types';

const GITA_CORPUS = 'repo:mobile/src/data/gita/';
const GITA_HOLY = 'https://www.holy-bhagavad-gita.org/chapter/';

export const DAIVI_THEME: GitaSaarTheme = {
  id: 'daivi',
  titleHi: 'दैवी सम्पदा',
  titleEn: 'How to live well',
  ledeHi:
    'अच्छा जीवन क्या है? गीता इसका उत्तर सिद्धांत में नहीं, सूची में देती है — गुण, जिन्हें रोज़ जिया जाता है। तीन जगह ये सूचियाँ आती हैं; तीनों यहाँ हैं।',
  ledeEn:
    'What is a good life? The Gita answers not with a theory but with lists: qualities that are lived daily. The lists come in three places; all three are here.',
  groups: [
    {
      id: 'chhabbis-gun',
      titleHi: 'छब्बीस गुण',
      titleEn: 'The twenty-six qualities',
      introHi: 'सोलहवें अध्याय की शुरुआत: दैवी सम्पदा की पूरी सूची।',
      introEn: 'The opening of the sixteenth chapter: the whole list of the divine endowment.',
      verses: [
        {
          ref: { chapter: 16, verse: 1 },
          themeHi: 'अभय से सरलता तक',
          themeEn: 'From fearlessness to straightness',
          saarHi: 'निर्भयता, मन की शुद्धि, ज्ञान और योग में दृढ़ता, दान, इन्द्रिय-संयम, यज्ञ, स्वाध्याय, तप और सरलता।',
          saarEn: 'Fearlessness, purity of heart, steadiness in knowledge and yoga, giving, restraint of the senses, sacrifice, study, austerity and straightforwardness.',
        },
        {
          ref: { chapter: 16, verse: 2 },
          themeHi: 'अहिंसा से अचंचलता तक',
          themeEn: 'From non-harm to steadiness',
          saarHi: 'अहिंसा, सत्य, क्रोध न करना, त्याग, शांति, चुगली न करना, प्राणियों पर दया, लालच न करना, कोमलता, लज्जा और चंचलता का न होना।',
          saarEn: 'Non-harm, truth, freedom from anger, renunciation, calm, no slander, compassion for beings, no greed, gentleness, modesty and no fickleness.',
        },
        {
          ref: { chapter: 16, verse: 3 },
          themeHi: 'तेज से अमानिता तक',
          themeEn: 'From vigour to humility',
          saarHi: 'तेज, क्षमा, धैर्य, शुद्धि, किसी से बैर न रखना और मान की चाह न होना — ये दैवी सम्पदा को पाए हुए व्यक्ति के लक्षण हैं।',
          saarEn: 'Vigour, forgiveness, fortitude, purity, freedom from hatred and freedom from pride: these belong to one born to the divine state.',
        },
      ],
    },
    {
      id: 'gyan-kise-kahte',
      titleHi: 'ज्ञान किसे कहते हैं',
      titleEn: 'What counts as knowledge',
      introHi: 'तेरहवाँ अध्याय ज्ञान की परिभाषा जानकारी से नहीं, स्वभाव से देता है।',
      introEn: 'The thirteenth chapter defines knowledge not as information but as character.',
      verses: [
        {
          ref: { chapter: 13, verse: 8 },
          themeHi: 'अमानित्व, अदम्भित्व',
          themeEn: 'Humility, no pretence',
          saarHi: 'अपने में बड़प्पन का भाव न होना, दिखावा न करना, अहिंसा, क्षमा, सरलता, गुरु की सेवा, भीतर-बाहर की शुद्धि, स्थिरता और मन का वश में होना।',
          saarEn: 'No sense of one\'s own greatness, no pretence, non-harm, forgiveness, straightness, service to the teacher, purity within and without, steadiness and self-control.',
        },
        {
          ref: { chapter: 13, verse: 9 },
          themeHi: 'वैराग्य, अनहंकार',
          themeEn: 'Dispassion, no ego',
          saarHi: 'इन्द्रियों के विषयों में वैराग्य, अहंकार का न होना, और जन्म, मृत्यु, बुढ़ापे और रोग में दुःख को बार-बार देखना।',
          saarEn: 'Dispassion toward the objects of the senses, absence of ego, and seeing again and again the sorrow in birth, death, old age and sickness.',
        },
        {
          ref: { chapter: 13, verse: 10 },
          themeHi: 'अनासक्ति, समता',
          themeEn: 'Non-attachment, evenness',
          saarHi: 'आसक्ति न होना; पुत्र, स्त्री, घर आदि में अपने को घोल न देना; और अनुकूल-प्रतिकूल के आने पर मन का सदा सम रहना।',
          saarEn: 'Non-attachment; not losing oneself in son, spouse, home and the rest; and a mind that stays even when the wanted and the unwanted arrive.',
        },
        {
          ref: { chapter: 13, verse: 11 },
          themeHi: 'अनन्य भक्ति',
          themeEn: 'Steady devotion',
          saarHi: 'मुझमें अनन्य योग से अटूट भक्ति, एकांत में रहने का स्वभाव, और भीड़ में रस न होना — यह ज्ञान है; इससे उलटा अज्ञान।',
          saarEn: 'Unswerving devotion to Me through one-pointed yoga, a liking for solitude, and no taste for crowds: this is called knowledge; the opposite is ignorance.',
        },
      ],
    },
    {
      id: 'teen-tap',
      titleHi: 'शरीर, वाणी, मन का तप',
      titleEn: 'Austerity of body, speech and mind',
      introHi: 'सत्रहवाँ अध्याय अच्छे जीवन को तीन जगह बाँटता है।',
      introEn: 'The seventeenth chapter divides a good life into three places.',
      verses: [
        {
          ref: { chapter: 17, verse: 14 },
          themeHi: 'शरीर का तप',
          themeEn: 'Of the body',
          saarHi: 'देवता, ज्ञानी, गुरु और विद्वानों का आदर, शुद्धि, सरलता, ब्रह्मचर्य और अहिंसा — यह शरीर का तप है।',
          saarEn: 'Honouring the gods, the wise, teachers and the learned; purity; straightness; restraint; non-harm. This is austerity of the body.',
        },
        {
          ref: { chapter: 17, verse: 15 },
          themeHi: 'वाणी का तप',
          themeEn: 'Of speech',
          saarHi: 'जो वचन उद्वेग न करे, सत्य हो, प्रिय हो, हितकारी हो — और स्वाध्याय का अभ्यास — यह वाणी का तप है। अच्छे बोलने का पूरा नियम एक पंक्ति में।',
          saarEn: 'Words that cause no hurt, are true, pleasant and beneficial, and the practice of study. This is austerity of speech; the whole rule of good speech in one line.',
        },
        {
          ref: { chapter: 17, verse: 16 },
          themeHi: 'मन का तप',
          themeEn: 'Of the mind',
          saarHi: 'मन की प्रसन्नता, सौम्यता, मौन, आत्म-संयम और भावों की शुद्धि — यह मन का तप है।',
          saarEn: 'Serenity of mind, gentleness, quiet, self-restraint and purity of feeling. This is austerity of the mind.',
        },
      ],
    },
  ],
  closingHi: 'अच्छा जीवन बड़े कर्मों से नहीं, रोज़ के गुणों से बनता है।',
  closingEn: 'A good life is built of daily qualities, not great deeds.',
  status: 'verified',
  source: {
    referenceUrls: [`${GITA_CORPUS}chapter-16.json`, `${GITA_CORPUS}chapter-13.json`, `${GITA_CORPUS}chapter-17.json`, `${GITA_HOLY}16`, `${GITA_HOLY}17`],
    verificationNote:
      '2026-09-27: every ref opened in the bundled corpus JSON (chapter 13 in the corpus\'s 35-verse numbering); saar lines paraphrase the bundled meanings and add nothing the verse does not say.',
  },
};
