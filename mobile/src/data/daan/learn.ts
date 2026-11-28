/**
 * "Learn daan in three short reads" — the plain-language teaching behind the
 * दान-पुण्य home's three read cards (design.md §73, approved revamp canvas:
 * Option B links its reads to the guide's steps 1, 2 and 5).
 *
 * Every verse, cite and verse meaning comes from the verified principle registry
 * (`principles.ts`: `dana-sukta`, `shraddhaya-deyam`, `sattvik-daan`). This file
 * holds only the plain glosses around them — what the six Upanishad words mean,
 * the Gita's three checks and three kinds of giving, everyday examples of daan,
 * and the register's facts — authored for the approved prototype and kept
 * stance-free (facts, never pressure; no totals, scores or fear copy).
 */
import type { DaanCause } from './types';

import type { Bi } from './learnReads';

export { DAAN_LEARN_READS } from './learnReads';
export type { DaanLearnRead, DaanLearnReadId, DaanLearnStep } from './learnReads';

/** The guide's five steps (design: Main.dc.html). Step 3's lede is built from today's vaar. */
export const DAAN_LEARN_STEPS: readonly { title: Bi; lede: Bi }[] = [
  { title: { hi: 'दान क्या है', en: 'What daan is' }, lede: { hi: 'जो आपके पास है, उसका एक भाग बाँटना', en: 'Sharing a part of what you have' } },
  { title: { hi: 'कैसे दें', en: 'How to give' }, lede: { hi: 'श्रद्धा से, सामर्थ्य के अनुसार, विनम्रता से', en: 'With faith, by your means, with humility' } },
  { title: { hi: 'आज क्या दें', en: 'What to give today' }, lede: { hi: 'आज के वार का दान', en: 'Today’s vaar and its daan' } },
  { title: { hi: 'किस तक पहुँचे', en: 'Whom it reaches' }, lede: { hi: 'सेवा के प्रकार, और उन्हें करने वाले स्थान', en: 'The kinds of seva, and places that do them' } },
  { title: { hi: 'चुपचाप याद रखें', en: 'Remember it quietly' }, lede: { hi: 'आपका खाता, और गुप्त दान', en: 'Your register, and gupt daan' } },
];

// ── Step 3 · What to give today ───────────────────────────────────────────
export const DAAN_LEARN_TODAY = {
  noteFallback: { hi: 'इस वार का पारम्परिक दान', en: 'The traditional daan of this vaar' },
  servesLabel: { hi: 'यह किस तक पहुँचता है — छूकर देखें', en: 'Who this reaches — tap to see' },
  weekLabel: { hi: 'हर वार का अपना दान', en: 'Every day has its daan' },
  weekHint: { hi: 'किसी वार को छूकर देखें कि उस दिन परम्परा क्या देती है।', en: 'Tap a day to see what the tradition gives on it.' },
  howMuchLabel: { hi: 'कितना दूँ?', en: 'How much should I give?' },
  howMuch: { hi: 'कोई निश्चित मात्रा नहीं। उपनिषद् कहता है — अपने सामर्थ्य के अनुसार दो।', en: 'There is no fixed amount. The Upanishad says: give by your means.' },
  howMuchSudama: { hi: 'सुदामा मुट्ठी भर पोहा लाए, और वह पूर्ण था। मापदण्ड भाव है, मात्रा नहीं।', en: 'Sudama brought a fistful of poha, and it was complete. Bhaav is the measure, never the amount.' },
  readSudama: { hi: 'सुदामा की कथा पढ़ें', en: 'Read Sudama’s story' },
} as const;

// ── Step 4 · Whom it reaches ──────────────────────────────────────────────
export const DAAN_LEARN_CAUSES = {
  intro: { hi: 'हर दान किसी की सेवा करता है। किसी सेवा को छूकर देखें कि वह क्यों प्रिय मानी गई, और कौन-से स्थान यह कार्य करते हैं।', en: 'Every daan serves someone. Tap a seva to see why it is held dear, and places that do this work.' },
  whyDear: { hi: 'यह दान क्यों प्रिय है', en: 'Why this daan is held dear' },
  placesLabel: { hi: 'जो स्थान यह सेवा करते हैं', en: 'Places that serve it' },
  openDwaar: { hi: 'दान-द्वार खोलें · ', en: 'Open Daan-dwaar · ' },
  noMoney: { hi: 'दान संस्था की अपनी वेबसाइट पर होगा — ऐप किसी लेन-देन का हिस्सा नहीं है।', en: 'The giving happens on the organization’s own website — the app is never part of any transaction.' },
} as const;

// ── Read 1 · What daan is ────────────────────────────────────────────────
export const DAAN_LEARN_ONE_LINE: Bi = {
  hi: 'दान का अर्थ है — जो आपके पास है उसका एक भाग ज़रूरतमंद को देना, और बदले में कुछ न चाहना।',
  en: 'Daan means giving a part of what you have to someone who needs it — and wanting nothing back.',
};

export const DAAN_LEARN_EXAMPLES: readonly { cause: DaanCause; title: Bi; why: Bi }[] = [
  {
    cause: 'gau',
    title: { hi: 'पहली रोटी, गाय के लिए', en: 'The first roti, set aside for the cow' },
    why: { hi: 'दान की शुरुआत उससे जो माँग नहीं सकता।', en: 'Giving begins with the one who cannot ask.' },
  },
  {
    cause: 'jeev',
    title: { hi: 'ग्रीष्म में पक्षियों के लिए जल-पात्र', en: 'A bowl of water for birds in summer' },
    why: { hi: 'ऐसा दान जिसका न प्रत्युपकार, न धन्यवाद।', en: 'A gift that brings back no return and no thanks.' },
  },
  {
    cause: 'vidya',
    title: { hi: 'जिस बच्चे के पास पुस्तक नहीं, उसे पुस्तक', en: 'A book for a child who has none' },
    why: { hi: 'विद्या देने से घटती नहीं।', en: 'Knowledge does not diminish in the giving.' },
  },
];

/** "Daan is not only money" — `cause: null` is one's own time and work (no cause icon). */
export const DAAN_LEARN_NOT_MONEY: readonly { cause: DaanCause | null; label: Bi }[] = [
  { cause: 'anna', label: { hi: 'अन्न', en: 'Food' } },
  { cause: 'vastra', label: { hi: 'वस्त्र', en: 'Cloth' } },
  { cause: 'vidya', label: { hi: 'पुस्तक', en: 'Books' } },
  { cause: null, label: { hi: 'समय और श्रम', en: 'Your time & work' } },
  { cause: 'arogya', label: { hi: 'रक्त', en: 'Blood' } },
  { cause: 'jeev', label: { hi: 'पशु-पक्षी को दाना-पानी', en: 'Grain & water for animals' } },
];

// ── Read 2 · How to give ─────────────────────────────────────────────────
/** The Taittirīya's six words (1.11.3), each with a plain gloss; `not` marks "never without faith". */
export type DaanLearnWayIcon = 'faith' | 'no' | 'means' | 'humble' | 'awe' | 'know';

export const DAAN_LEARN_SIX_WAYS: readonly { word: string; icon: DaanLearnWayIcon; plain: Bi; child: Bi; not?: true }[] = [
  { word: 'श्रद्धया', icon: 'faith', plain: { hi: 'श्रद्धा से', en: 'With faith' }, child: { hi: 'मन से मानकर दें।', en: 'Give because you believe in it.' } },
  { word: 'अश्रद्धया अदेयम्', icon: 'no', plain: { hi: 'बिना श्रद्धा के नहीं', en: 'Never without faith' }, child: { hi: 'मन न हो तो न दें।', en: 'If your heart is not in it, don’t give.' }, not: true },
  { word: 'श्रिया', icon: 'means', plain: { hi: 'सामर्थ्य के अनुसार', en: 'By your means' }, child: { hi: 'जितना सम्भव हो, उतना दें।', en: 'Give what you can manage.' } },
  { word: 'ह्रिया', icon: 'humble', plain: { hi: 'विनम्रता से', en: 'With humility' }, child: { hi: 'लेने वाले को छोटा न समझें।', en: 'Never look down on the one who receives.' } },
  { word: 'भिया', icon: 'awe', plain: { hi: 'संकोच सहित', en: 'With awe' }, child: { hi: 'धीरे से दें, गर्व से नहीं।', en: 'Give gently, never proudly.' } },
  { word: 'संविदा', icon: 'know', plain: { hi: 'समझ के साथ', en: 'With understanding' }, child: { hi: 'जानें किसे दे रहे हैं, और क्यों।', en: 'Know whom you give to, and why.' } },
];

/** Gita 17.20's desha · kaala · patra. */
export const DAAN_LEARN_CHECKS: readonly { word: Bi; plain: Bi }[] = [
  { word: { hi: 'देश', en: 'Desha' }, plain: { hi: 'उचित स्थान', en: 'the right place' } },
  { word: { hi: 'काल', en: 'Kaala' }, plain: { hi: 'उचित समय', en: 'the right time' } },
  { word: { hi: 'पात्र', en: 'Patra' }, plain: { hi: 'उचित व्यक्ति', en: 'the right person' } },
];

/** Gita 17.20–22's three kinds of giving. */
export const DAAN_LEARN_KINDS: readonly { id: 'sattvik' | 'rajasik' | 'tamasik'; name: Bi; plain: Bi }[] = [
  {
    id: 'sattvik',
    name: { hi: 'सात्त्विक', en: 'Sattvik' },
    plain: { hi: 'कर्तव्य मानकर, बदले की आशा बिना — उचित स्थान, समय और पात्र को।', en: 'Given as a duty, expecting nothing back — at the right place, time and to the right person.' },
  },
  {
    id: 'rajasik',
    name: { hi: 'राजसिक', en: 'Rajasik' },
    plain: { hi: 'बदले में कुछ पाने के लिए, या मन मारकर दिया गया।', en: 'Given to get something back, or given unwillingly.' },
  },
  {
    id: 'tamasik',
    name: { hi: 'तामसिक', en: 'Tamasik' },
    plain: { hi: 'अनुचित स्थान या समय पर, अनुचित पात्र को, या बिना आदर के।', en: 'Given at the wrong place or time, to the wrong person, or without respect.' },
  },
];

// ── Read 3 · Remember it quietly ─────────────────────────────────────────
export const DAAN_LEARN_REGISTER = {
  title: { hi: 'आपका दान-खाता', en: 'Your daan register' },
  body: { hi: 'जो दिया, वह लिख लें। उस दिन की तिथि अपने-आप जुड़ जाती है।', en: 'Write down what you gave. The day’s tithi is added for you.' },
  sampleCat: { hi: 'अन्न · चावल', en: 'Anna · rice' },
  sampleTithi: { hi: '[उस दिन की तिथि] · शुक्रवार', en: '[tithi of the day] · Shukravar' },
  sampleNote: { hi: 'मन्दिर की रसोई के लिए चावल', en: 'Rice for the temple kitchen' },
  guptName: { hi: 'गुप्त दान', en: 'Gupt daan' },
  sampleDate: { hi: '20 नवं॰', en: '20 Nov' },
  guptDate: { hi: '18 नवं॰', en: '18 Nov' },
  guptRow: { hi: 'केवल तिथि रहती है — न राशि, न विवरण, न पात्र।', en: 'Only the date is kept — no amount, no note, no recipient.' },
  guptLabel: { hi: 'गुप्त दान पहले क्यों', en: 'Why gupt daan comes first' },
  guptMeaning: {
    hi: 'परम्परा उस दान को सबसे ऊँचा कहती है जो बिना बताए दिया जाए — जिसका उल्लेख देने वाला स्वयं भी न करे।',
    en: 'Tradition holds the unannounced gift highest — the one the giver never mentions, even to themselves.',
  },
  sudamaLabel: { hi: 'सुदामा की कथा से', en: 'From Sudama’s story' },
  sudamaTeaching: {
    hi: 'भाव ही मापदण्ड है — मुट्ठी भर पोहा भी प्रेम से दिया जाए तो पूर्ण है। इसीलिए इस खाते में कोई योग नहीं।',
    en: 'Bhaav is the only measure — a fistful of poha, given with love, is complete. This is why the register keeps no totals.',
  },
} as const;
