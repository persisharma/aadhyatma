import type { BasisNode } from './kundaliBasis';
import type { KundaliChart } from './kundali';
import { buildPrashnaAnswer, type PrashnaAnswer, type PrashnaFactor, type PrashnaOptions } from './prashna';
import { getPurpose, type PurposeId } from './prashnaPurposes';
import { questionForPurpose, readingText as T, type ReadingText } from './prashnaQuestions';
import { buildPrashnaPhase, type PrashnaPhase } from './prashnaPhase';

export type GuidanceTone = 'supportive' | 'mixed' | 'careful' | 'limited';
export type GuidanceInsight = { id: string; title: ReadingText; meaning: ReadingText; tone: GuidanceTone; factorIds: readonly string[]; basis: readonly BasisNode[]; source: { verified: boolean; referenceUrls: readonly string[]; notes: string } };
export type GuidanceAction = { id: string; text: ReadingText; origin: 'editorial'; insightIds: readonly string[] };
export type PrashnaGuidance = {
  version: 1; questionId: string; question: ReadingText; title: ReadingText; summary: ReadingText;
  insights: readonly GuidanceInsight[]; actions: readonly GuidanceAction[]; caution: ReadingText;
  timing: { status: 'relevant' | 'insufficient'; text: ReadingText; windowIds: readonly string[] };
  parentNote: ReadingText | null;
};
export type PrashnaReading = { analysis: PrashnaAnswer; guidance: PrashnaGuidance | null; phase: PrashnaPhase | null };
type Theme = { title: ReadingText; support: ReadingText; caution: ReadingText; action: ReadingText };
/** Editorial translations of existing house/factor rules; source review remains explicit. */
const THEMES = {
  work: { title: T('काम और ज़िम्मेदारी', 'Work and responsibility'), support: T('पारम्परिक विवेचन में ज़िम्मेदारी और योगदान को सहारा मिलता है। वास्तविक अवसर में देखें कि आपके काम को पहचान कैसे मिलेगी।', 'The traditional reading supports responsibility and contribution. In a real opportunity, check how your work would be recognised.'), caution: T('काम और पहचान से जुड़े संकेत अतिरिक्त प्रयास की ओर ध्यान दिलाते हैं। भूमिका और अपेक्षाएँ स्पष्ट करें।', 'Work and recognition indications draw attention to extra effort. Clarify the role and expectations.'), action: T('अगली भूमिका या अवसर में सफलता के मानदंड पूछें।', 'Ask how success would be assessed in the next role or opportunity.') },
  workload: { title: T('काम की गति और व्यवस्था', 'Workload and structure'), support: T('नियमित प्रयास और काम की व्यवस्था को सहारा मिलता है। स्पष्ट प्रक्रिया वाले वातावरण को अपने अनुभव से परखें।', 'Regular effort and work structure receive support. Consider how a clearly organised environment fits your experience.'), caution: T('प्रगति के साथ काम सँभालने में अधिक प्रयास का संकेत है। अतिरिक्त ज़िम्मेदारी के साथ समय और सहायता भी देखें।', 'The reading suggests extra effort in managing work alongside progress. Consider time and support when taking on responsibility.'), action: T('समय, काम के बोझ और सहायता की अपेक्षाएँ पहले पूछें।', 'Ask about hours, workload and support before committing.') },
  network: { title: T('सहयोग और अवसर', 'Support and opportunities'), support: T('सहयोग और संपर्क के माध्यम से अवसर तलाशने को सहारा मिलता है। इसे वास्तविक बातचीत से परखें।', 'Exploring opportunities through support and contacts is favoured in the reading. Test this through actual conversations.'), caution: T('सहयोग से लाभ के संकेत सीमित या मिश्रित हैं। वादे और वास्तविक सहयोग को अलग देखें।', 'Indications of benefit through support are limited or mixed. Distinguish promises from actual help.'), action: T('अनुभवी व्यक्ति से एक ठोस प्रश्न पर प्रतिक्रिया लें।', 'Ask someone experienced for feedback on one concrete question.') },
  learning: { title: T('समझ और सीखना', 'Understanding and learning'), support: T('पढ़ाई और विचारों को समझने के संकेत सहायक हैं। यह अंकों का अनुमान नहीं; देखें कि कौन-सा अभ्यास समझ बढ़ाता है।', 'The reading contains support for study and understanding ideas. This does not predict marks; notice which exercises help you understand.'), caution: T('सीखने के संकेत अतिरिक्त प्रयास की ओर ध्यान दिलाते हैं। कठिनाई समझ, याद रखने या अभ्यास में कहाँ है, अलग परखें।', 'Learning indications draw attention to extra effort. Check whether the difficulty is understanding, recall or practice.'), action: T('एक अभ्यास करके देखें कि किस हिस्से में मदद चाहिए।', 'Try one exercise and identify where help is needed.') },
  foundation: { title: T('सीखने का आधार', 'A foundation for learning'), support: T('पढ़ाई के वातावरण और आधार को सहारा मिलता है। उपयोगी संसाधन और पढ़ने की व्यवस्था पहचानें।', 'The reading supports the foundations and environment for learning. Identify the resources and study setting that work for you.'), caution: T('पढ़ाई के आधार में अधिक ध्यान का संकेत है। दिशा बदलने से पहले समझ और उपलब्ध सहायता परखें।', 'The learning foundation asks for attention. Check understanding and available help before changing direction.'), action: T('कठिन हिस्सा समझाने के लिए शिक्षक या साथी की मदद लें।', 'Ask a teacher or peer to explain a difficult part.') },
  mentor: { title: T('मार्गदर्शन और विस्तार', 'Guidance and exploration'), support: T('मार्गदर्शन और नए दृष्टिकोण से सीखने को सहारा मिलता है। अनुभवी व्यक्ति के अनुभव से विकल्प समझें।', 'Guidance and learning from a wider perspective receive support. Use an experienced person’s perspective to understand your options.'), caution: T('मार्गदर्शन के संकेत सीधा निष्कर्ष नहीं देते। किसी एक राय पर निर्भर होने से पहले अपने अनुभव से तुलना करें।', 'Guidance indications do not give a simple conclusion. Compare advice with your own experience.'), action: T('दो विकल्पों के वास्तविक काम या अनुभव की तुलना करें।', 'Compare the actual work or experience involved in two options.') },
  partnership: { title: T('साझेदारी और संवाद', 'Partnership and communication'), support: T('साथ काम करने या संबंध बनाने के संकेत सहायक हैं। इन्हें दूसरे व्यक्ति की सहमति, अपेक्षाओं और व्यवहार से मिलाकर देखें।', 'The reading supports collaboration or connection. Consider the other person’s consent, expectations and actual behaviour.'), caution: T('साझेदारी में समायोजन की ज़रूरत का संकेत है। अपेक्षाएँ और मतभेद साफ़ शब्दों में समझें।', 'Partnership indications suggest a need for adjustment. Discuss expectations and disagreements plainly.'), action: T('दोनों की ज़िम्मेदारियों और अपेक्षाओं पर स्पष्ट बातचीत करें।', 'Have a clear conversation about both people’s responsibilities and expectations.') },
  initiative: { title: T('पहल और अभ्यास', 'Initiative and practice'), support: T('स्वयं पहल करने और अभ्यास से सीखने को सहारा मिलता है। बड़े निष्कर्ष से पहले छोटा प्रयोग उपयोगी हो सकता है।', 'Initiative and learning through practice receive support. A small experiment can help before a larger conclusion.'), caution: T('पहल में अतिरिक्त प्रयास का संकेत है। सीमित काम आज़माकर अपनी तैयारी समझें।', 'Initiative asks for extra effort. Try a limited task to understand readiness.'), action: T('सीमित प्रयोग और उससे सीखने का एक लक्ष्य तय करें।', 'Define a limited experiment and one thing to learn from it.') },
  resources: { title: T('संसाधन और प्राथमिकताएँ', 'Resources and priorities'), support: T('संसाधनों को सँभालने के संकेत सहायक हैं। निर्णय अपनी वास्तविक आय, ख़र्च और प्रतिबद्धताओं से लें।', 'The reading has supportive resource indications. Base decisions on actual income, expenses and commitments.'), caution: T('संसाधनों के संकेत सावधानी की ओर ध्यान दिलाते हैं। अनुमान के बजाय अपनी वास्तविक व्यवस्था स्पष्ट करें।', 'Resource indications draw attention to care. Clarify the actual situation instead of relying on assumptions.'), action: T('अपनी ज़रूरी प्रतिबद्धताओं और उपलब्ध संसाधनों की सूची बनाएँ।', 'List essential commitments and available resources.') },
  home: { title: T('घर और स्थिरता', 'Home and stability'), support: T('घर और स्थिरता के संकेत सहायक हैं। इससे संपत्ति या संबंध का परिणाम तय नहीं होता।', 'The reading has support around home and stability. It does not establish a property or relationship outcome.'), caution: T('घर और स्थिरता में समायोजन का संकेत है। परिवार की वास्तविक ज़रूरतों पर बात करें।', 'The reading suggests adjustment around home and stability. Discuss the family’s actual needs.'), action: T('घर और ज़िम्मेदारियों को लेकर प्राथमिकताएँ साझा करें।', 'Share priorities around home and responsibilities.') },
  family: { title: T('परिवार के बारे में विचार', 'Reflection on family'), support: T('परिवार के पारम्परिक संकेत विचार का आधार हैं। इनसे संतान होने की सम्भावना या समय नहीं निकाला जाता।', 'Traditional family indications are for reflection. They do not assess fertility or predict timing.'), caution: T('परिवार के संकेतों को स्वास्थ्य या संतान का निष्कर्ष न मानें। वास्तविक सहायता पर ध्यान दें।', 'Do not turn family indications into health or fertility conclusions. Focus on actual support.'), action: T('देखभाल और व्यावहारिक सहायता पर साथ विचार करें।', 'Consider caregiving and practical support together.') },
  routine: { title: T('दिनचर्या पर ध्यान', 'Attention to routine'), support: T('इस विषय को दिनचर्या पर विचार के लिए पढ़ें। ग्रह-स्थितियाँ शरीर या मन की वास्तविक स्थिति नहीं बतातीं।', 'Use this theme to reflect on routine. Planetary placements do not establish your physical or mental condition.'), caution: T('ये संकेत स्वास्थ्य का आकलन नहीं हैं। अपने वास्तविक अनुभव और ज़रूरत के अनुसार सहायता लें।', 'These indications are not a health assessment. Seek support according to actual experience and needs.'), action: T('नींद, विश्राम और दिनचर्या में अपने अनुभव को देखें।', 'Notice your actual experience of sleep, rest and routine.') },
  movement: { title: T('यात्रा और बदलाव', 'Travel and change'), support: T('यात्रा और नए अनुभव की दिशा में सहायक संकेत हैं। वास्तविक अवसर, दस्तावेज़ और ज़िम्मेदारियाँ फिर भी परखें।', 'The reading has support for travel and new experiences. Still check actual opportunities, documents and responsibilities.'), caution: T('यात्रा के संकेत अधिक तैयारी की ओर ध्यान दिलाते हैं। इससे यात्रा असफल होने का निष्कर्ष नहीं निकलता।', 'Travel indications draw attention to preparation. They do not establish that travel will fail.'), action: T('दस्तावेज़, रहने की व्यवस्था और ज़िम्मेदारियों की पुष्टि करें।', 'Confirm documents, accommodation and responsibilities.') },
} satisfies Record<string, Theme>;
type ThemeId = keyof typeof THEMES;
const PURPOSE_THEMES: Record<PurposeId, readonly (readonly [number, ThemeId])[]> = {
  naukri: [[10, 'work'], [6, 'workload'], [11, 'network']], vyapar: [[10, 'work'], [7, 'partnership'], [11, 'network'], [3, 'initiative']],
  vidya: [[5, 'learning'], [4, 'foundation'], [9, 'mentor']], dhan: [[2, 'resources'], [11, 'network'], [4, 'home']],
  vivah: [[7, 'partnership'], [2, 'home'], [11, 'network']], santan: [[5, 'family'], [9, 'mentor']],
  swasthya: [[1, 'routine'], [6, 'routine'], [8, 'routine']], yatra: [[9, 'movement'], [3, 'initiative'], [12, 'movement']], man: [[4, 'routine'], [1, 'routine'], [12, 'routine']],
};
const CONNECTIONS: Record<number, ReadingText> = {
  1: T('अपनी पहल और दिशा', 'personal initiative and direction'), 2: T('संसाधन और संवाद', 'resources and communication'),
  3: T('अभ्यास और स्वयं प्रयास', 'practice and personal effort'), 4: T('घर और स्थिर आधार', 'home and a stable foundation'),
  5: T('सीखने और रचनात्मक प्रयास', 'learning and creative effort'), 6: T('नियमित काम और चुनौतियों', 'daily work and challenges'),
  7: T('साझेदारी और दूसरे लोगों', 'partnership and other people'), 8: T('बदलाव और अनिश्चितता सँभालने', 'handling change and uncertainty'),
  9: T('मार्गदर्शन और व्यापक सीख', 'guidance and wider learning'), 10: T('काम और ज़िम्मेदारी', 'work and responsibility'),
  11: T('संपर्क और साझा लक्ष्यों', 'contacts and shared goals'), 12: T('विश्राम, दूरी और ख़र्च', 'rest, distance and expenses'),
};
function uniqueBasis(factors: readonly PrashnaFactor[]): BasisNode[] {
  return [...new Map(factors.flatMap(f => f.basis).map(n => [JSON.stringify(n), n])).values()];
}
export function composePrashnaGuidance(answer: PrashnaAnswer, questionId?: string): PrashnaGuidance | null {
  if (answer.gated) return null;
  const purpose = getPurpose(answer.purposeId), question = questionForPurpose(answer.purposeId, questionId);
  const factors = [...answer.supports, ...answer.resists, ...answer.qualifies];
  const candidates: GuidanceInsight[] = [];
  const groups = new Map<ThemeId, number[]>();
  for (const [house, themeId] of PURPOSE_THEMES[answer.purposeId]) groups.set(themeId, [...(groups.get(themeId) ?? []), house]);
  for (const [themeId, houses] of groups) {
    const relevant = factors.filter(f => houses.some(house => f.id.startsWith(`lord-${house}-`) || f.id.startsWith(`occ-${house}-`)));
    if (!relevant.length) continue;
    const support = relevant.some(f => f.polarity === 'support'), resist = relevant.some(f => f.polarity === 'resist');
    const tone: GuidanceTone = support && resist ? 'mixed' : resist ? 'careful' : support ? 'supportive' : 'limited';
    const theme = THEMES[themeId];
    let meaning = tone === 'supportive' ? theme.support : tone === 'limited'
      ? T(`इस विषय पर स्पष्ट निष्कर्ष के लिए आधार सीमित है। ${theme.action.hi}`, `There is limited basis for a clear conclusion on this theme. ${theme.action.en}`)
      : tone === 'mixed' ? T(`${theme.support.hi} साथ ही, ${theme.caution.hi}`, `${theme.support.en} At the same time, ${theme.caution.en.charAt(0).toLowerCase()}${theme.caution.en.slice(1)}`) : theme.caution;
    const link = relevant.flatMap(f => f.basis).find(n => n.kind === 'lord' && houses.includes(n.ofHouse));
    if (link?.kind === 'lord' && !['routine', 'family'].includes(themeId)) {
      const destination = CONNECTIONS[link.inHouse];
      if (destination) meaning = T(`इस विषय का संबंध ${destination.hi} से बनता है। ${meaning.hi}`, `Traditionally, this theme connects with ${destination.en}. ${meaning.en}`);
    }
    candidates.push({ id: themeId, title: theme.title, meaning, tone, factorIds: relevant.map(f => f.id), basis: uniqueBasis(relevant), source: { ...purpose.source, notes: `${purpose.source.notes} Plain-language grouping is editorial, not a new classical formula.` } });
  }
  const first = candidates[0], contrasting = candidates.slice(1).find(c => c.tone === 'mixed' || c.tone === 'careful');
  const insights = [first, contrasting ?? candidates[1]].filter((x): x is GuidanceInsight => Boolean(x));
  const supported = insights.find(i => i.tone === 'supportive' || i.tone === 'mixed');
  const cautionTheme = contrasting ?? insights.find(i => i.tone === 'careful' || i.tone === 'mixed');
  const title = supported && cautionTheme
    ? supported.id === cautionTheme.id
      ? T(`${supported.title.hi} में सहारा है, पर समायोजन भी चाहिए।`, `${supported.title.en} has support, with adjustments to consider.`)
      : T(`${supported.title.hi}: आगे की दिशा परखें। ${cautionTheme.title.hi}: यहाँ अधिक ध्यान दें।`, `Explore ${supported.title.en.toLowerCase()}; give ${cautionTheme.title.en.toLowerCase()} extra attention.`)
    : supported ? T(`${supported.title.hi}: सहायक संकेतों को अपने अनुभव से परखें।`, `Test the support for ${supported.title.en.toLowerCase()} against your experience.`)
    : cautionTheme ? T(`${cautionTheme.title.hi}: तैयारी और सहायता पर ध्यान दें।`, `Give preparation and support more attention around ${cautionTheme.title.en.toLowerCase()}.`)
    : T('स्पष्ट निष्कर्ष के लिए आधार सीमित है।', 'There is limited basis for a clear conclusion.');
  const summary = T(insights.map(i => `${i.title.hi}: ${i.tone === 'supportive' ? 'सहायक संकेत' : i.tone === 'mixed' ? 'सहारा और समायोजन दोनों' : i.tone === 'careful' ? 'अधिक प्रयास का संकेत' : 'आधार सीमित'}`).join('। ') + '।', insights.map(i => `${i.title.en}: ${i.tone === 'supportive' ? 'supportive indications' : i.tone === 'mixed' ? 'support alongside adjustment' : i.tone === 'careful' ? 'extra effort indicated' : 'limited evidence'}`).join('. ') + '.');
  const actionInsight = contrasting ?? first;
  const actions: GuidanceAction[] = question.actions.slice(0, 2).map((text, index) => ({ id: `${question.id}-${index}`, text, origin: 'editorial', insightIds: [] }));
  // The switch question already asks about workload; use its distinct role check.
  if (question.id === 'job-switch' && actionInsight?.id === 'workload') actions.push({ id: 'job-switch-2', text: question.actions[2], origin: 'editorial', insightIds: [] });
  else if (actionInsight) actions.push({ id: `theme-${actionInsight.id}`, text: THEMES[actionInsight.id as ThemeId].action, origin: 'editorial', insightIds: [actionInsight.id] });
  const protectedPurpose = ['swasthya', 'santan', 'man'].includes(answer.purposeId);
  const protectedTitle: Partial<Record<PurposeId, ReadingText>> = {
    swasthya: T('कुंडली से स्वास्थ्य या लक्षणों का आकलन नहीं होता।', 'A chart cannot assess health or symptoms.'),
    santan: T('कुंडली से संतान होने की सम्भावना या समय तय नहीं होता।', 'A chart cannot establish fertility or its timing.'),
    man: T('कुंडली से मानसिक स्वास्थ्य का आकलन नहीं होता।', 'A chart cannot assess mental health.'),
  };
  const windows = answer.windows.filter(w => w.relevant).sort((a, b) => Number(b.current) - Number(a.current) || Number(b.id.startsWith('antar-')) - Number(a.id.startsWith('antar-')) || a.startKey.localeCompare(b.startKey));
  const parentNote = answer.ageBand !== 'adult' ? T('अभिभावक के लिए: बच्चे की रुचि और अनुभव समझें; क्षमता या भविष्य का निर्णय न करें।', 'For a parent: understand the child’s interests and experience without judging ability or future outcomes.') : null;
  return {
    version: 1, questionId: question.id, question: question.label,
    title: protectedTitle[answer.purposeId] ?? title,
    summary: protectedPurpose ? question.caution : summary, insights,
    actions: parentNote && question.id === 'study-exam' ? [
      { id: 'parent-exercise', text: T('बच्चे के साथ एक छोटा अभ्यास चुनें और देखें कहाँ मदद चाहिए।', 'Choose a short exercise with the child and notice where help is needed.'), origin: 'editorial', insightIds: [] },
      { id: 'parent-mistakes', text: T('गलतियों पर बिना तुलना किए बात करें: समझ, याद रखना या समय।', 'Discuss mistakes without comparison: understanding, recall or time.'), origin: 'editorial', insightIds: [] },
      { id: 'parent-practice', text: T('बच्चे के साथ आसान अभ्यास-योजना बनाएँ और फिर अनुभव पूछें।', 'Agree on a manageable practice plan with the child, then ask how it felt.'), origin: 'editorial', insightIds: [] },
    ] : parentNote ? [
      { id: 'parent-listen', text: T('बच्चे से पूछें कि क्या सहज लगता है और कहाँ मदद चाहिए।', 'Ask the child what feels comfortable and where help is needed.'), origin: 'editorial', insightIds: [] },
      { id: 'parent-observe', text: T('रुचि और कठिनाई को बिना लेबल लगाए साथ समझें।', 'Explore interests and difficulties together without applying labels.'), origin: 'editorial', insightIds: [] },
    ] : actions,
    caution: question.caution,
    timing: { status: windows.length && !protectedPurpose ? 'relevant' : 'insufficient', text: protectedPurpose ? T('इस विषय में घटना या स्वास्थ्य-परिणाम का समय नहीं निकाला जाता।', 'No event or health-outcome timing is inferred for this topic.') : windows.length ? T('ये अवधियाँ इस विषय से जुड़ी हैं। संबंध अपने-आप अनुकूलता नहीं है; इससे परिणाम या सबसे अच्छी तारीख तय नहीं होती।', 'These periods connect with this topic. Relevance does not establish favourability, an outcome or the best date.') : T('इस विषय की उपयोगी अवधि तय नहीं हुई। व्यावहारिक कदम के लिए किसी तारीख की प्रतीक्षा आवश्यक नहीं।', 'The calculation does not establish a useful period for this topic. Practical steps do not require waiting for a date.'), windowIds: protectedPurpose ? [] : windows.slice(0, 2).map(w => w.id) },
    parentNote,
  };
}
export function buildPrashnaReading(chart: KundaliChart, purposeId: PurposeId, now: Date, options?: PrashnaOptions & { questionId?: string }): PrashnaReading {
  const analysis = buildPrashnaAnswer(chart, purposeId, now, options);
  return { analysis, guidance: composePrashnaGuidance(analysis, options?.questionId), phase: buildPrashnaPhase(chart, purposeId, now, options?.questionId) };
}
