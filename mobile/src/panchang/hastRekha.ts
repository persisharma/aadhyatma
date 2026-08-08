/**
 * Hast Rekha (हस्तरेखा) — traditional palm-line reflection engine.
 *
 * Same contract as the Rashifal engine (kundali.ts): pure, deterministic,
 * offline, and guidance-framed. The user self-observes four classical lines
 * on their dominant hand and picks the form that matches; the engine maps
 * each selection to traditional reflection copy. No camera, no image
 * analysis, no randomness, no network, and no predictive verdicts — every
 * body line is a reflection aid, never a diagnosis. The life line is
 * explicitly framed as vitality, never lifespan.
 *
 * UI supplies persistence and "today"; this module takes only the profile.
 */

export type PalmLineId = 'heart' | 'head' | 'life' | 'fate';

export type HeartLineTrait = 'curved' | 'straight' | 'chained';
export type HeadLineTrait = 'long' | 'short' | 'sloping';
export type LifeLineTrait = 'broad' | 'close' | 'faint';
export type FateLineTrait = 'defined' | 'faint' | 'absent';

export type PalmProfile = {
  heart: HeartLineTrait;
  head: HeadLineTrait;
  life: LifeLineTrait;
  fate: FateLineTrait;
};

export type PalmTraitOption = {
  id: string;
  labelHi: string;
  labelEn: string;
  /** How to recognise this form on your own palm — observational, not evaluative. */
  descHi: string;
  descEn: string;
};

export type PalmLineSpec = {
  line: PalmLineId;
  nameHi: string;
  nameEn: string;
  /** Where to look for this line. */
  locateHi: string;
  locateEn: string;
  options: readonly PalmTraitOption[];
};

export type PalmLineInsight = {
  line: PalmLineId;
  eyebrowHi: string;
  eyebrowEn: string;
  titleHi: string;
  titleEn: string;
  bodyHi: string;
  bodyEn: string;
};

export type HastRekhaReading = {
  profile: PalmProfile;
  insights: readonly PalmLineInsight[];
  reflectionHi: string;
  reflectionEn: string;
  practiceHi: string;
  practiceEn: string;
  /** Allow-listed existing reader id — same rule as RashifalGuidance.sourceId. */
  sourceId: 'navagraha-stotram';
};

export const HEART_LINE_TRAITS: readonly HeartLineTrait[] = [
  'curved',
  'straight',
  'chained',
];
export const HEAD_LINE_TRAITS: readonly HeadLineTrait[] = [
  'long',
  'short',
  'sloping',
];
export const LIFE_LINE_TRAITS: readonly LifeLineTrait[] = [
  'broad',
  'close',
  'faint',
];
export const FATE_LINE_TRAITS: readonly FateLineTrait[] = [
  'defined',
  'faint',
  'absent',
];

export const PALM_LINES: readonly PalmLineSpec[] = [
  {
    line: 'heart',
    nameHi: 'हृदय रेखा',
    nameEn: 'Heart line',
    locateHi: 'हथेली के ऊपरी भाग में, उँगलियों के नीचे आड़ी चलने वाली रेखा।',
    locateEn: 'The horizontal line running just below the fingers, across the top of the palm.',
    options: [
      {
        id: 'curved',
        labelHi: 'घुमावदार',
        labelEn: 'Curved',
        descHi: 'उँगलियों की ओर ऊपर उठती हुई चाप बनाती है।',
        descEn: 'Arches upward toward the fingers.',
      },
      {
        id: 'straight',
        labelHi: 'सीधी',
        labelEn: 'Straight',
        descHi: 'हथेली के आर-पार लगभग सीधी चलती है।',
        descEn: 'Runs nearly straight across the palm.',
      },
      {
        id: 'chained',
        labelHi: 'शृंखलित',
        labelEn: 'Chained',
        descHi: 'महीन कड़ियों या छोटे खंडों से बनी दिखती है।',
        descEn: 'Appears as fine links or small joined segments.',
      },
    ],
  },
  {
    line: 'head',
    nameHi: 'मस्तिष्क रेखा',
    nameEn: 'Head line',
    locateHi: 'हृदय रेखा के नीचे, हथेली के मध्य से आड़ी चलने वाली रेखा।',
    locateEn: 'The horizontal line below the heart line, crossing the middle of the palm.',
    options: [
      {
        id: 'long',
        labelHi: 'लम्बी',
        labelEn: 'Long',
        descHi: 'हथेली के अधिकांश भाग को पार करती है।',
        descEn: 'Crosses most of the palm.',
      },
      {
        id: 'short',
        labelHi: 'छोटी',
        labelEn: 'Short',
        descHi: 'मध्यमा उँगली के नीचे के आसपास समाप्त होती है।',
        descEn: 'Ends around the area below the middle finger.',
      },
      {
        id: 'sloping',
        labelHi: 'ढलवाँ',
        labelEn: 'Sloping',
        descHi: 'कलाई की ओर धीरे-धीरे नीचे झुकती है।',
        descEn: 'Slopes gently downward toward the wrist.',
      },
    ],
  },
  {
    line: 'life',
    nameHi: 'जीवन रेखा',
    nameEn: 'Life line',
    locateHi: 'अँगूठे के चारों ओर चाप बनाती हुई, कलाई की ओर जाने वाली रेखा।',
    locateEn: 'The line arcing around the base of the thumb, toward the wrist.',
    options: [
      {
        id: 'broad',
        labelHi: 'विस्तृत चाप',
        labelEn: 'Broad arc',
        descHi: 'अँगूठे से दूर, हथेली के मध्य की ओर चौड़ी चाप बनाती है।',
        descEn: 'Sweeps in a wide arc, away from the thumb.',
      },
      {
        id: 'close',
        labelHi: 'समीप चाप',
        labelEn: 'Close arc',
        descHi: 'अँगूठे के पास से संकरी चाप में चलती है।',
        descEn: 'Stays in a narrow arc, close to the thumb.',
      },
      {
        id: 'faint',
        labelHi: 'हलकी',
        labelEn: 'Faint',
        descHi: 'हलकी, पतली या बीच-बीच में टूटी दिखती है।',
        descEn: 'Looks light, thin, or broken in places.',
      },
    ],
  },
  {
    line: 'fate',
    nameHi: 'भाग्य रेखा',
    nameEn: 'Fate line',
    locateHi: 'हथेली के मध्य से उँगलियों की ओर ऊपर जाने वाली खड़ी रेखा।',
    locateEn: 'The vertical line rising from the base of the palm toward the fingers.',
    options: [
      {
        id: 'defined',
        labelHi: 'स्पष्ट',
        labelEn: 'Defined',
        descHi: 'स्पष्ट, अखंड खड़ी रेखा दिखती है।',
        descEn: 'A clear, unbroken vertical line.',
      },
      {
        id: 'faint',
        labelHi: 'हलकी',
        labelEn: 'Faint',
        descHi: 'हलकी या खंडों में बँटी दिखती है।',
        descEn: 'Light, or broken into segments.',
      },
      {
        id: 'absent',
        labelHi: 'अनुपस्थित',
        labelEn: 'Not visible',
        descHi: 'कोई स्पष्ट खड़ी रेखा नहीं दिखती — यह भी सामान्य है।',
        descEn: 'No clear vertical line is visible — this too is common.',
      },
    ],
  },
];

const HEART_INSIGHTS: Readonly<Record<HeartLineTrait, { hi: string; en: string }>> = {
  curved: {
    hi: 'परम्परा घुमावदार हृदय रेखा को भावों की सहज, खुली अभिव्यक्ति से जोड़ती है। विचार करें कि आज किस संबंध को आपकी उष्णता चाहिए। यह चिंतन का संकेत है, स्वभाव का निर्णय नहीं।',
    en: 'Tradition links a curved heart line with warmth that is expressed openly. Consider which relationship could receive that warmth today. A reflection cue, not a verdict on your nature.',
  },
  straight: {
    hi: 'परम्परा सीधी हृदय रेखा को संयत, विचारपूर्वक व्यक्त होने वाले भावों से जोड़ती है। विचार करें कि कहाँ शांत शब्द ही पर्याप्त हैं। यह चिंतन का संकेत है, स्वभाव का निर्णय नहीं।',
    en: 'Tradition links a straight heart line with feeling expressed steadily and with thought. Consider where a few calm words are enough. A reflection cue, not a verdict on your nature.',
  },
  chained: {
    hi: 'परम्परा शृंखलित हृदय रेखा को गहरी संवेदनशीलता से जोड़ती है। विचार करें कि अपनी भावनाओं को आज कहाँ विश्राम देना उचित होगा। यह चिंतन का संकेत है, स्वभाव का निर्णय नहीं।',
    en: 'Tradition links a chained heart line with deep sensitivity. Consider where your feelings could be given rest today. A reflection cue, not a verdict on your nature.',
  },
};

const HEAD_INSIGHTS: Readonly<Record<HeadLineTrait, { hi: string; en: string }>> = {
  long: {
    hi: 'परम्परा लम्बी मस्तिष्क रेखा को विषय को पूरी गहराई तक विचारने की प्रवृत्ति से जोड़ती है। विचार करें कि कौन-सा निर्णय आज और मनन चाहता है। यह चिंतन का सहारा है, बुद्धि का मापन नहीं।',
    en: 'Tradition links a long head line with an inclination to think matters through fully. Consider which decision deserves more deliberation today. A reflection aid, not a measure of intellect.',
  },
  short: {
    hi: 'परम्परा छोटी मस्तिष्क रेखा को सीधे, व्यावहारिक विचार से जोड़ती है। विचार करें कि किस कार्य को आज सरल पहले कदम की आवश्यकता है। यह चिंतन का सहारा है, बुद्धि का मापन नहीं।',
    en: 'Tradition links a short head line with direct, practical thinking. Consider which task needs one simple first step today. A reflection aid, not a measure of intellect.',
  },
  sloping: {
    hi: 'परम्परा ढलवाँ मस्तिष्क रेखा को कल्पना और सर्जनात्मक दृष्टि से जोड़ती है। विचार करें कि आपकी कल्पना आज किस काम को नया रूप दे सकती है। यह चिंतन का सहारा है, बुद्धि का मापन नहीं।',
    en: 'Tradition links a sloping head line with imagination and a creative eye. Consider what your imagination could reshape today. A reflection aid, not a measure of intellect.',
  },
};

const LIFE_INSIGHTS: Readonly<Record<LifeLineTrait, { hi: string; en: string }>> = {
  broad: {
    hi: 'परम्परा विस्तृत चाप वाली जीवन रेखा को उत्साहपूर्ण ऊर्जा से जोड़ती है — यह रेखा जीवन-शक्ति की दृष्टि है, जीवन की लम्बाई नहीं। विचार करें कि यह ऊर्जा आज किस दिशा में सार्थक लगे।',
    en: 'Tradition links a broad life-line arc with abundant energy — in this tradition the line reflects vitality, never length of life. Consider where that energy would be most meaningful today.',
  },
  close: {
    hi: 'परम्परा समीप चाप वाली जीवन रेखा को संयमित, नपी-तुली ऊर्जा से जोड़ती है — यह रेखा जीवन-शक्ति की दृष्टि है, जीवन की लम्बाई नहीं। विचार करें कि आज शक्ति कहाँ बचाकर लगानी है।',
    en: 'Tradition links a close life-line arc with measured, deliberate energy — in this tradition the line reflects vitality, never length of life. Consider where to spend your strength selectively today.',
  },
  faint: {
    hi: 'परम्परा हलकी जीवन रेखा को कोमल गति और विश्राम की आवश्यकता से जोड़ती है — यह रेखा जीवन-शक्ति की दृष्टि है, जीवन की लम्बाई नहीं। विचार करें कि आज विश्राम को कहाँ स्थान देना है।',
    en: 'Tradition links a faint life line with a gentler pace and a need for rest — in this tradition the line reflects vitality, never length of life. Consider where rest deserves a place today.',
  },
};

const FATE_INSIGHTS: Readonly<Record<FateLineTrait, { hi: string; en: string }>> = {
  defined: {
    hi: 'परम्परा स्पष्ट भाग्य रेखा को दिशा के स्थिर बोध से जोड़ती है। विचार करें कि आपका वर्तमान मार्ग आपके मूल्यों से कितना मेल खाता है। यह चिंतन का संकेत है, भविष्य की घोषणा नहीं।',
    en: 'Tradition links a defined fate line with a settled sense of direction. Consider how well your current path matches your values. A reflection cue, not an announcement of the future.',
  },
  faint: {
    hi: 'परम्परा हलकी भाग्य रेखा को चरणों में आकार लेती दिशा से जोड़ती है। विचार करें कि इस चरण में कौन-सा छोटा संकल्प उपयुक्त है। यह चिंतन का संकेत है, भविष्य की घोषणा नहीं।',
    en: 'Tradition links a faint fate line with direction that takes shape in phases. Consider which small resolve suits this phase. A reflection cue, not an announcement of the future.',
  },
  absent: {
    hi: 'परम्परा अनुपस्थित भाग्य रेखा को स्वयं गढ़े जाने वाले मार्ग की खुली सम्भावना से जोड़ती है। विचार करें कि आज कौन-सा चुनाव पूर्णतः आपका अपना है। यह चिंतन का संकेत है, भविष्य की घोषणा नहीं।',
    en: 'Tradition reads an absent fate line as openness — a path shaped by one’s own choices. Consider which choice today is entirely your own. A reflection cue, not an announcement of the future.',
  },
};

const FATE_REFLECTIONS: Readonly<Record<FateLineTrait, { hi: string; en: string }>> = {
  defined: {
    hi: 'आज का कौन-सा कार्य आपकी दीर्घ दिशा को सचमुच आगे बढ़ाता है?',
    en: 'Which of today’s tasks truly moves your longer direction forward?',
  },
  faint: {
    hi: 'इस समय के छोटे-छोटे कदम मिलकर कौन-सी दिशा बना रहे हैं?',
    en: 'What direction are this season’s small steps adding up to?',
  },
  absent: {
    hi: 'यदि मार्ग पूर्णतः आपके हाथ में है, तो अगला कदम क्या होगा?',
    en: 'If the path is entirely yours to shape, what is the next step?',
  },
};

export function validatePalmProfile(profile: PalmProfile): string[] {
  const errors: string[] = [];
  if (!HEART_LINE_TRAITS.includes(profile.heart)) errors.push('heart');
  if (!HEAD_LINE_TRAITS.includes(profile.head)) errors.push('head');
  if (!LIFE_LINE_TRAITS.includes(profile.life)) errors.push('life');
  if (!FATE_LINE_TRAITS.includes(profile.fate)) errors.push('fate');
  return errors;
}

export function computeHastRekha(profile: PalmProfile): HastRekhaReading {
  const invalid = validatePalmProfile(profile);
  if (invalid.length > 0) {
    throw new Error(`Invalid palm profile fields: ${invalid.join(', ')}`);
  }
  const heart = HEART_INSIGHTS[profile.heart];
  const head = HEAD_INSIGHTS[profile.head];
  const life = LIFE_INSIGHTS[profile.life];
  const fate = FATE_INSIGHTS[profile.fate];
  const specByLine = new Map(PALM_LINES.map((spec) => [spec.line, spec]));
  const optionLabel = (line: PalmLineId, id: string) =>
    specByLine.get(line)!.options.find((option) => option.id === id)!;

  const insight = (
    line: PalmLineId,
    traitId: string,
    body: { hi: string; en: string }
  ): PalmLineInsight => {
    const spec = specByLine.get(line)!;
    const option = optionLabel(line, traitId);
    return {
      line,
      eyebrowHi: spec.nameHi,
      eyebrowEn: spec.nameEn,
      titleHi: option.labelHi,
      titleEn: option.labelEn,
      bodyHi: body.hi,
      bodyEn: body.en,
    };
  };

  return {
    profile,
    insights: [
      insight('heart', profile.heart, heart),
      insight('head', profile.head, head),
      insight('life', profile.life, life),
      insight('fate', profile.fate, fate),
    ],
    reflectionHi: FATE_REFLECTIONS[profile.fate].hi,
    reflectionEn: FATE_REFLECTIONS[profile.fate].en,
    practiceHi: 'कुछ शांत श्वासों के बाद अपनी चुनी हुई प्रार्थना या स्तोत्र का पाठ करें।',
    practiceEn: 'After a few quiet breaths, recite a prayer or stotra you already trust.',
    sourceId: 'navagraha-stotram',
  };
}
