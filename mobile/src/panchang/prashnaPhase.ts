import { computeGocharSnapshot, type GocharSnapshot } from './gochar';
import { GRAHA_NAMES_EN, GRAHA_NAMES_HI, getCurrentDasha, indiaDateKey, type Graha, type KundaliChart, type DashaSubPeriod } from './kundali';
import { dignityOfPosition, type BasisNode } from './kundaliBasis';
import { RASHI_LORD_BY_INDEX } from './kundaliYoga';
import { ageYears, formatIstDateEn, formatIstDateHi } from './reportFormat';
import { questionForPurpose, readingText as T, type ReadingText } from './prashnaQuestions';
import type { PurposeId } from './prashnaPurposes';

/** Career/business pilot. This is an explicit, limited D1 convention, not a
 * complete Jyotish judgement. Rule/source review is recorded separately from
 * calculation tests; see docs/roadmap/conventions/prashna-phase-v1.md. */
export type PhasePurpose = 'naukri' | 'vyapar';
export type PhaseTone = 'supportive' | 'mixed' | 'effort' | 'active' | 'limited';
export type PhaseSignal = {
  id: string; layer: 'natal' | 'dasha' | 'gochar'; graha: Graha;
  houses: readonly number[]; support: boolean; challenge: boolean;
  title: ReadingText; meaning: ReadingText; text: ReadingText; basis: readonly BasisNode[]; ruleIds: readonly string[];
};
export type PhaseDirection = {
  id: string; label: ReadingText; text: ReadingText;
  /** Direction is an editorial interpretation of named signals, never a fact. */
  origin: 'phase-interpretation'; signalIds: readonly string[];
};
export type PhaseDecisionReason = { signalId: string; title: ReadingText; text: ReadingText; reference: ReadingText };
export type PhaseDecision = {
  headline: ReadingText; nextStep: ReadingText;
  inFavour: readonly PhaseDecisionReason[]; against: readonly PhaseDecisionReason[];
  signalIds: readonly string[];
};
export type PrashnaPhase = {
  version: 1; purposeId: PhasePurpose; questionId: string; question: ReadingText;
  asOf: string; dateKey: string; transitAnchor: '06:00 Asia/Kolkata';
  tone: PhaseTone; focusHouse: number | null; title: ReadingText; summary: ReadingText;
  currentPeriod: null | { maha: Graha; antar: Graha | null; label: ReadingText; start: string; end: string };
  signals: readonly PhaseSignal[]; directions: readonly PhaseDirection[];
  decision: PhaseDecision | null;
  next: null | { at: string; date: ReadingText; title: ReadingText; text: ReadingText; basis: readonly BasisNode[] };
  limitation: ReadingText;
  source: { verified: false; convention: string; referenceUrls: readonly string[] };
};

export const PHASE_SOURCE = {
  verified: false as const,
  convention: 'prashna-phase-v1: D1 lordship/placement/dignity, Vimshottari maha/antar, Moon-relative Jupiter/Saturn with vedha; pilot review pending',
  referenceUrls: [
    'https://www.wisdomlib.org/hinduism/book/phaladeepika-by-mantreswara-text-and-translation/d/doc1621592.html',
    'https://www.wisdomlib.org/hinduism/book/phaladeepika-by-mantreswara-text-and-translation/d/doc1621598.html',
    'https://www.vedicastrologer.org/articles/vedic_astro_textbook.pdf',
  ],
};
const AREAS: Record<number, ReadingText> = {
  1: T('अपनी दिशा', 'personal direction'), 2: T('संसाधन और संवाद', 'resources and communication'),
  3: T('पहल और प्रयास', 'initiative and effort'), 4: T('स्थिर आधार', 'a stable foundation'),
  5: T('सीखने और रचनात्मक काम', 'learning and creative work'), 6: T('प्रतिस्पर्धा और रोज़ के काम', 'competition and daily work'),
  7: T('साझेदारी और ग्राहक-संबंध', 'partnerships and client relationships'), 8: T('अनिश्चितता और बदलाव', 'uncertainty and change'),
  9: T('मार्गदर्शन और अध्ययन', 'guidance and learning'), 10: T('भूमिका और ज़िम्मेदारी', 'role and responsibility'),
  11: T('संपर्क और काम से मिलने वाले लाभ', 'contacts and gains from work'), 12: T('ख़र्च और पर्दे के पीछे की तैयारी', 'expenses and preparation behind the scenes'),
};
const PHASE_TITLES: Record<PhaseTone, ReadingText> = {
  supportive: T('आगे बढ़ने को सहारा मिलता है', 'There is support for moving forward'),
  mixed: T('आगे बढ़ने की गुंजाइश है, साथ में अड़चनें भी', 'Room to move forward, with competing pressures'),
  effort: T('प्रगति के लिए अधिक प्रयास वाला समय', 'A phase that asks for more effort'),
  active: T('यह विषय सक्रिय है; दिशा सोच-समझकर चुनें', 'This topic is active; choose your direction carefully'),
  limited: T('इस प्रश्न के समय पर संकेत अभी स्पष्ट नहीं हैं', 'Timing for this question is not clear yet'),
};
const pos = (chart: KundaliChart, g: Graha) => chart.grahas.find(p => p.graha === g)!;
const lordOf = (chart: KundaliChart, house: number) => RASHI_LORD_BY_INDEX[chart.houses[house - 1]];
const names = (g: Graha) => T(GRAHA_NAMES_HI[g], GRAHA_NAMES_EN[g]);
const joinAreas = (houses: readonly number[]): ReadingText => T(houses.map(h => AREAS[h].hi).join(' तथा '), houses.map(h => AREAS[h].en).join(' and '));
const grahaBasis = (chart: KundaliChart, g: Graha): BasisNode => {
  const p = pos(chart, g);
  return { kind: 'graha', graha: g, house: p.house, dignity: dignityOfPosition(p), retrograde: p.retrograde };
};

/** Question changes the priority, not the underlying astronomical facts. */
export function phaseHouses(purpose: PhasePurpose, question: string): readonly number[] {
  if (question === 'business-partner') return [7, 10, 11, 3];
  if (question === 'business-start') return [3, 10, 7, 11];
  if (question === 'job-first') return [6, 10, 11];
  return purpose === 'naukri' ? [10, 11, 6] : [10, 7, 11, 3];
}

function condition(chart: KundaliChart, graha: Graha) {
  const p = pos(chart, graha), dignity = dignityOfPosition(p), n = names(graha);
  // A node's occupied house identifies the topic, but cannot substitute for
  // its dispositor/association judgement. Do not apply the generic dusthana
  // polarity to Rahu/Ketu or turn the competing upachaya rule into a verdict.
  if (graha === 'rahu' || graha === 'ketu') return {
    support: false, challenge: false,
    text: T(`${n.hi} के फल के लिए राशि-स्वामी और साथ बैठे ग्रहों का विवेचन भी चाहिए। यहाँ केवल भाव-संबंध लिया गया है; उससे अनुकूलता या बाधा तय नहीं की गई।`, `${n.en}'s results also require its sign ruler and planetary associations. Here the occupied house establishes a topic link, without assigning support or difficulty.`),
  };
  const dignified = dignity === 'own' || dignity === 'exalted';
  const wellPlaced = [1, 4, 5, 7, 9, 10, 11].includes(p.house);
  const support = dignified || wellPlaced;
  const challenge = dignity === 'debilitated' || [6, 8, 12].includes(p.house);
  const pieces: ReadingText[] = [];
  if (dignified) pieces.push(T(`${n.hi} की जन्म-स्थिति ${dignity === 'own' ? 'अपनी राशि में' : 'उच्च राशि में'} होने से सहारा मिलता है।`, `${n.en}'s natal ${dignity === 'own' ? 'own-sign' : 'exalted'} placement adds support.`));
  else if (wellPlaced) pieces.push(T(`जन्मकुंडली में ${AREAS[p.house].hi} से जुड़ी स्थिति सहारा देती है।`, `The natal placement in the area of ${AREAS[p.house].en} adds support.`));
  if (dignity === 'debilitated') pieces.push(T(`${n.hi} की नीच राशि में जन्म-स्थिति के कारण इस संकेत में अतिरिक्त प्रयास की ज़रूरत मानी जाती है।`, `${n.en}'s debilitated natal placement is read as requiring extra effort.`));
  if ([6, 8, 12].includes(p.house)) pieces.push(T(`जन्म-स्थिति का संबंध ${AREAS[p.house].hi} से भी है, इसलिए प्रगति सीधी या सहज मानना उचित नहीं।`, `The natal placement also involves ${AREAS[p.house].en}, so progress is not read as straightforward.`));
  if (!pieces.length) pieces.push(T('राशि-स्थिति से न विशेष सहारा, न स्पष्ट बाधा तय होती है।', 'The sign placement alone gives neither distinct support nor a clear obstacle.'));
  return { support, challenge, text: T(pieces.map(p => p.hi).join(' '), pieces.map(p => p.en).join(' ')) };
}

function natalSignal(chart: KundaliChart, house: number): PhaseSignal {
  const g = lordOf(chart, house), p = pos(chart, g), n = names(g), c = condition(chart, g);
  const destination = AREAS[p.house], subject = AREAS[house];
  return {
    id: `natal-${house}`, layer: 'natal', graha: g, houses: [house], support: c.support, challenge: c.challenge,
    title: T('जन्मकुंडली का आधार', 'The natal foundation'),
    meaning: house === 10 && p.house === 11
      ? T(`काम में आगे बढ़ने की दिशा संपर्क और सहयोग से जुड़ती है। इसका आधार जन्मकुंडली में ${n.hi} की स्थिति है।`, `Career development is linked with professional contacts and collaboration, through ${n.en}'s natal placement.`)
      : T(`${subject.hi} का विषय ${destination.hi} के माध्यम से आगे बढ़ता है। इसका आधार जन्मकुंडली में ${n.hi} की स्थिति है।`, `The topic of ${subject.en} develops through ${destination.en}, through ${n.en}'s natal placement.`),
    text: T(`${subject.hi} के स्वामी ${n.hi} जन्मकुंडली में ${destination.hi} से जुड़े हैं। ${c.text.hi}`, `${n.en}, the natal ruler for ${subject.en}, connects this topic with ${destination.en}. ${c.text.en}`),
    basis: [{ kind: 'lord', graha: g, ofHouse: house, inHouse: p.house }, grahaBasis(chart, g)], ruleIds: ['natal-lord-condition'],
  };
}

function periodSignal(chart: KundaliChart, houses: readonly number[], period: DashaSubPeriod, level: 'maha' | 'antar'): PhaseSignal {
  const g = period.lord, n = names(g), p = pos(chart, g);
  const owned = houses.filter(h => lordOf(chart, h) === g);
  const occupied = houses.includes(p.house) ? [p.house] : [];
  const touched = houses.filter(h => owned.includes(h) || occupied.includes(h));
  const c = condition(chart, g);
  const label = level === 'maha' ? T('महादशा', 'Mahadasha') : T('अन्तर्दशा', 'Antardasha');
  const parts: ReadingText[] = [];
  if (owned.length) {
    const a = joinAreas(owned);
    parts.push(T(`${n.hi} ${a.hi} के स्वामी हैं।`, `${n.en} rules ${a.en} in the natal chart.`));
  }
  if (occupied.length && !owned.includes(p.house)) parts.push(T(`जन्मकुंडली में ${n.hi} ${AREAS[p.house].hi} के भाव में स्थित हैं।`, `Natally, ${n.en} occupies the house of ${AREAS[p.house].en}.`));
  if (!touched.length) parts.push(T(`इस प्रश्न के भावों से इस अवधि का सीधा स्वामित्व या स्थिति-संबंध नहीं मिलता। इसका मुख्य संदर्भ ${AREAS[p.house].hi} है।`, `This period has no direct lordship or occupancy link to this question's houses. Its natal placement mainly concerns ${AREAS[p.house].en}.`));
  else parts.push(c.text);
  return {
    id: `dasha-${level}`, layer: 'dasha', graha: g, houses: touched,
    support: touched.length > 0 && c.support, challenge: touched.length > 0 && c.challenge,
    title: T(`${n.hi} ${label.hi}`, `${n.en} ${label.en}`),
    meaning: touched.length ? T(`${joinAreas(touched).hi} पर इस अवधि का ज़ोर है। ${c.support && c.challenge ? 'सहारा और अतिरिक्त प्रयास दोनों के संकेत हैं।' : c.challenge ? 'इसे अधिक प्रयास से आगे बढ़ने का समय समझें।' : c.support ? 'जन्म-स्थिति से इस दिशा को सहारा मिलता है।' : 'इस संबंध से अकेले आसानी या कठिनाई तय नहीं होती।'}`, `This period emphasises ${joinAreas(touched).en}. ${c.support && c.challenge ? 'Support and extra demands coexist.' : c.challenge ? 'Read it as a phase of working through greater demands.' : c.support ? 'The natal placement supports this direction.' : 'This connection alone does not establish ease or difficulty.'}`)
      : T(`इस अवधि का मुख्य ज़ोर ${AREAS[p.house].hi} पर है; इस प्रश्न के समय पर सीधा निष्कर्ष सीमित है।`, `This period mainly concerns ${AREAS[p.house].en}; its direct timing indication for this question is limited.`),
    text: T(parts.map(p => p.hi).join(' '), parts.map(p => p.en).join(' ')),
    basis: [{ kind: 'dasha', level, lord: g, startKey: indiaDateKey(period.start), endKey: indiaDateKey(period.end) },
      ...owned.map(h => ({ kind: 'lord', graha: g, ofHouse: h, inHouse: p.house } as BasisNode)), grahaBasis(chart, g)],
    ruleIds: ['dasha-activation', 'natal-lord-condition'],
  };
}

/** Phaladeepika 26.5,7; PVR Narasimha Rao table 63. Saturn/Sun exception.
 * No inverse-vedha, ashtakavarga or node dignity inference in this pilot. */
const VEDHA: Record<'jupiter' | 'saturn', Readonly<Record<number, number>>> = {
  jupiter: { 2: 12, 5: 4, 7: 3, 9: 10, 11: 8 }, saturn: { 3: 12, 6: 9, 11: 5 },
};
export function phaseTransitStatus(snapshot: GocharSnapshot, graha: 'jupiter' | 'saturn') {
  const t = snapshot.transits.find(t => t.graha === graha)!;
  const vedhaHouse = VEDHA[graha][t.houseFromMoon] ?? null;
  const blockers = vedhaHouse === null ? [] : snapshot.transits.filter(p => p.graha !== graha && !(graha === 'saturn' && p.graha === 'sun') && p.houseFromMoon === vedhaHouse);
  return { transit: t, vedhaHouse, blockers, support: vedhaHouse !== null && !blockers.length, challenge: vedhaHouse === null || blockers.length > 0 };
}
export function phaseAspectHouses(house: number, graha: 'jupiter' | 'saturn'): number[] {
  return (graha === 'jupiter' ? [5, 7, 9] : [3, 7, 10]).map(offset => (house + offset - 2) % 12 + 1);
}
function transitSignal(snapshot: GocharSnapshot, houses: readonly number[], graha: 'jupiter' | 'saturn'): PhaseSignal {
  const status = phaseTransitStatus(snapshot, graha), { transit: t, blockers } = status;
  const aspects = phaseAspectHouses(t.houseFromLagna, graha).filter(h => houses.includes(h));
  const touched = houses.filter(h => h === t.houseFromLagna || aspects.includes(h));
  const relevant = touched.length > 0, n = names(graha);
  const place = T(`${n.hi} का वर्तमान गोचर लग्न से ${t.houseFromLagna}वें और जन्म-चन्द्र से ${t.houseFromMoon}वें भाव में है।`, `${n.en} currently transits house ${t.houseFromLagna} from Lagna and house ${t.houseFromMoon} from the natal Moon.`);
  const tone = status.support
    ? T('चन्द्र से यह स्थिति सहायक मानी जाती है और अभी उसका वेध नहीं है।', 'The Moon-relative position is supportive, with no current vedha obstruction.')
    : blockers.length ? T(`चन्द्र से स्थिति सहायक है, पर ${blockers.map(p => names(p.graha).hi).join(', ')} का वेध उस सहारे को सीमित करता है।`, `The Moon-relative position is supportive, but obstruction by ${blockers.map(p => names(p.graha).en).join(', ')} limits that support.`)
      : T('चन्द्र से यह स्थिति सरल सहारे वाली नहीं मानी जाती।', 'The Moon-relative position is not read as an easy source of support.');
  const areas = joinAreas(touched);
  const link = relevant ? T(`स्थिति${aspects.length ? ' और दृष्टि' : ''} से ${areas.hi} का संबंध बनता है।`, `Its placement${aspects.length ? ' and aspects' : ''} connect with ${areas.en}.`)
    : T('इस प्रश्न से सीधा भाव-संबंध नहीं है; इसे पृष्ठभूमि में रखा गया है।', 'It has no direct house link to this question and stays in the background.');
  const node = (g: Graha): BasisNode => {
    const p = snapshot.transits.find(t => t.graha === g)!;
    return { kind: 'gochar', graha: g, fromMoonHouse: p.houseFromMoon, fromLagnaHouse: p.houseFromLagna, ...(g === graha && aspects.length ? { aspectsFromLagna: aspects } : {}), asOfKey: snapshot.dateKey };
  };
  return {
    id: `transit-${graha}`, layer: 'gochar', graha, houses: touched,
    support: relevant && status.support, challenge: relevant && status.challenge,
    title: T(`${n.hi} का वर्तमान गोचर`, `${n.en}'s current transit`),
    meaning: relevant ? T(`अभी ${areas.hi} पर इसका प्रभाव पढ़ा जाता है। ${status.support ? 'इस दिशा को आज के गोचर से सहारा है।' : blockers.length ? 'सहायक स्थिति है, पर दूसरे ग्रह का वेध इसे सीमित करता है।' : 'आज का गोचर इस दिशा में सहज सहारा नहीं जोड़ता।'}`, `It currently touches ${areas.en}. ${status.support ? 'Today’s transit adds support in this area.' : blockers.length ? 'Another planet obstructs an otherwise supportive position.' : 'Today’s transit does not add easy support in this area.'}`)
      : T('इस प्रश्न पर इसका सीधा प्रभाव नहीं जोड़ा गया है।', 'No direct influence on this question is inferred here.'),
    text: T(`${place.hi} ${tone.hi} ${link.hi}`, `${place.en} ${tone.en} ${link.en}`),
    basis: [node(graha), ...blockers.map(b => node(b.graha))], ruleIds: ['transit-reference', 'transit-aspect', 'transit-vedha'],
  };
}

/** No sum or majority vote: repetition of the same natal fact across maha,
 * antar and natal never manufactures independent support. A positive phase
 * needs direct dasha activation, an active lord's dignity support AND a
 * relevant unobstructed transit; any relevant contradiction survives. */
export function resolvePhaseTone(signals: readonly PhaseSignal[]): PhaseTone {
  const active = signals.filter(s => s.layer === 'dasha' && s.houses.length);
  if (!active.length) return 'limited';
  const relevant = signals.filter(s => s.houses.length);
  const support = relevant.some(s => s.support), challenge = relevant.some(s => s.challenge);
  if (challenge) return support ? 'mixed' : 'effort';
  return active.some(s => s.support) && relevant.some(s => s.layer === 'gochar' && s.support) ? 'supportive' : 'active';
}

function decisionReason(chart: KundaliChart, signal: PhaseSignal, side: 'support' | 'challenge'): PhaseDecisionReason {
  const n = names(signal.graha);
  const placement = pos(chart, signal.graha);
  const dignity = dignityOfPosition(placement);
  if (signal.layer === 'natal') {
    const text = side === 'support'
      ? dignity === 'own' || dignity === 'exalted'
        ? T(`${n.hi} अपनी अनुकूल जन्म-राशि में हैं; करियर के प्रश्न में यह सहारा है।`, `${n.en} has a strong birth-sign placement, which supports the career question.`)
        : T(`करियर के स्वामी ${n.hi} का जन्म-स्थान ${AREAS[placement.house].hi} से जुड़ता है; इस नियम में इसे सहारा माना गया है।`, `The career ruler ${n.en} is placed in ${AREAS[placement.house].en}; this rule treats that placement as support.`)
      : dignity === 'debilitated'
        ? T(`करियर के स्वामी ${n.hi} की जन्म-राशि कमज़ोर मानी जाती है; इससे बदलाव में अतिरिक्त प्रयास का संकेत है।`, `The career ruler ${n.en} is in a traditionally weak birth-sign position, pointing to extra effort around a change.`)
        : T(`करियर के स्वामी ${n.hi} का जन्म-स्थान ${AREAS[placement.house].hi} में है; इससे बदलाव को सरल मानना उचित नहीं।`, `The career ruler ${n.en} is placed in ${AREAS[placement.house].en}, so this rule does not treat a change as straightforward.`);
    return { signalId: signal.id, title: T(`जन्मकुंडली में ${n.hi}`, `${n.en} in the birth chart`), text,
      reference: T(`जन्मकुंडली: ${n.hi} 10वें भाव के स्वामी, ${placement.house}वें भाव में।`, `Birth chart: ${n.en} rules the 10th house and sits in house ${placement.house}.`) };
  }
  if (signal.layer === 'dasha') {
    const level = signal.id === 'dasha-maha' ? T('महादशा', 'Mahadasha') : T('अन्तर्दशा', 'Antardasha');
    const areas = joinAreas(signal.houses);
    return { signalId: signal.id, title: signal.title,
      text: side === 'support'
        ? T(`${n.hi} की चल रही अवधि ${areas.hi} को सक्रिय करती है; जन्म-स्थिति से इस दिशा को सहारा मिलता है।`, `The running ${n.en} period activates ${areas.en}; its natal placement adds support.`)
        : T(`${n.hi} की चल रही अवधि ${areas.hi} को सक्रिय करती है, पर जन्म-स्थिति अधिक प्रयास का संकेत देती है।`, `The running ${n.en} period activates ${areas.en}, but its natal placement points to greater demands.`),
      reference: T(`चल रही ${level.hi}: ${n.hi} · सम्बद्ध भाव ${signal.houses.join(', ')}।`, `Current ${level.en}: ${n.en} · linked houses ${signal.houses.join(', ')}.`) };
  }
  const gochar = signal.basis.find(b => b.kind === 'gochar' && b.graha === signal.graha);
  const blockers = signal.basis.filter((b): b is Extract<BasisNode, { kind: 'gochar' }> => b.kind === 'gochar' && b.graha !== signal.graha);
  const blockerNames = T(blockers.map(b => names(b.graha).hi).join(', '), blockers.map(b => names(b.graha).en).join(', '));
  const transitText = side === 'challenge' && blockers.length
    ? T(`${n.hi} काम के भावों से जुड़ते हैं, लेकिन ${blockerNames.hi} का वेध उनके सहारे को सीमित करता है।`, `${n.en} touches work-related houses, but obstruction by ${blockerNames.en} limits an otherwise supportive transit placement.`)
    : signal.meaning;
  return { signalId: signal.id, title: signal.title, text: transitText,
    reference: gochar && gochar.kind === 'gochar'
      ? T(`आज का गोचर: जन्म-चन्द्र से ${gochar.fromMoonHouse}वाँ भाव; काम से जुड़े भाव ${signal.houses.join(', ')}।`, `Today's transit: house ${gochar.fromMoonHouse} from your Moon; work-related houses ${signal.houses.join(', ')}.`)
      : T('आज का गोचर', "Today's transit") };
}

function jobSwitchDecision(chart: KundaliChart, tone: PhaseTone, signals: readonly PhaseSignal[]): PhaseDecision {
  const ordered = [...signals].sort((a, b) => {
    const rank = (s: PhaseSignal) => s.layer === 'dasha' ? 0 : s.layer === 'gochar' ? 1 : 2;
    return rank(a) - rank(b);
  });
  const reasons = (side: 'support' | 'challenge') => ordered
    .filter(s => s.houses.length && s[side])
    // The same natal placement repeated in a Maha/Antardasha is one reason.
    .filter((s, i, all) => !all.slice(0, i).some(other => other.graha === s.graha && other.layer !== 'gochar' && s.layer !== 'gochar'))
    .slice(0, 2)
    .map(s => decisionReason(chart, s, side));
  const headline: Record<PhaseTone, ReadingText> = {
    supportive: T('हाँ, बदलाव की तलाश आगे बढ़ाएँ', 'Yes, pursue a job change now'),
    mixed: T('अभी तलाश करें; नौकरी छोड़ने का निर्णय रोकें', 'Search now; hold off on resigning'),
    effort: T('अभी तुरंत बदलाव के बजाय तैयारी करें', 'Prepare before making an immediate switch'),
    active: T('अभी बदलाव के पक्ष में स्पष्ट संकेत नहीं', 'No clear case for switching right now'),
    limited: T('अभी बदलाव के समय पर स्पष्ट उत्तर नहीं', 'No clear timing answer for a switch yet'),
  };
  const nextStep: Record<PhaseTone, ReadingText> = {
    supportive: T('नई भूमिका पर बात आगे बढ़ाएँ। काम, वेतन और शुरू करने की तारीख लिखित रूप में स्पष्ट होने पर ही अंतिम निर्णय लें।', 'Advance interviews. Make the final decision after the role, pay and start date are clear in writing.'),
    mixed: T('आवेदन और बातचीत जारी रखें। कोई प्रस्ताव मिले तो नई ज़िम्मेदारी और काम का दबाव अपनी मौजूदा भूमिका से मिलाएँ; उसके बाद ही छोड़ने का निर्णय लें।', 'Keep applying and interviewing. Compare an offer’s responsibilities and workload with your current role before deciding to leave.'),
    effort: T('विकल्प खोजें, कौशल और संपर्क तैयार करें। केवल इस समय-संकेत के आधार पर जल्दबाज़ी में इस्तीफ़ा न दें।', 'Explore openings and prepare your skills and contacts. Avoid a rushed resignation based on this timing indication alone.'),
    active: T('बदलाव का निर्णय वास्तविक प्रस्ताव और अपनी प्राथमिकताओं के आधार पर लें। इस गणना से बेहतर परिणाम का पक्ष तय नहीं होता।', 'Decide from an actual offer and your priorities. This reading does not establish that a switch would work out better.'),
    limited: T('इस गणना में चल रही दशा से नौकरी बदलने का सीधा समय-संकेत नहीं मिलता। कोई प्रस्ताव हो तो उसकी शर्तें परखकर निर्णय लें।', 'The running dasha has no direct job-change timing link in this calculation. If you have an offer, judge its actual terms.'),
  };
  const inFavour = reasons('support');
  const against = reasons('challenge');
  if ((tone === 'mixed' || tone === 'effort') && against.length < 2) {
    const neutral = ordered.find(s => s.layer === 'dasha' && s.houses.length && !s.support && !s.challenge);
    if (neutral) against.push({
      signalId: neutral.id,
      title: T(`${names(neutral.graha).hi} की चल रही अवधि`, `Current ${names(neutral.graha).en} period`),
      text: neutral.meaning,
      reference: T(`चल रही ${neutral.id === 'dasha-maha' ? 'महादशा' : 'अन्तर्दशा'}: ${names(neutral.graha).hi} · सम्बद्ध भाव ${neutral.houses.join(', ')}।`, `Current ${neutral.id === 'dasha-maha' ? 'Mahadasha' : 'Antardasha'}: ${names(neutral.graha).en} · linked houses ${neutral.houses.join(', ')}.`),
    });
  }
  // Absence of a direct link is uncertainty, not an adverse planetary signal.
  if (tone === 'limited' || (!against.length && tone === 'active')) {
    const period = ordered.find(s => s.layer === 'dasha' && (tone === 'limited' ? !s.houses.length : !!s.houses.length));
    if (period) against.unshift({
      signalId: period.id,
      title: tone === 'limited' ? T('समय-संकेत सीमित', 'Limited timing signal') : T('अवधि का सहारा स्पष्ट नहीं', 'Period support is unclear'),
      text: period.meaning,
      reference: tone === 'limited'
        ? T(`चल रही ${period.id === 'dasha-maha' ? 'महादशा' : 'अन्तर्दशा'}: ${names(period.graha).hi} · इस प्रश्न के भावों से सीधा संबंध नहीं।`, `Current ${period.id === 'dasha-maha' ? 'Mahadasha' : 'Antardasha'}: ${names(period.graha).en} · no direct link to this question's houses.`)
        : T(`चल रही ${period.id === 'dasha-maha' ? 'महादशा' : 'अन्तर्दशा'}: ${names(period.graha).hi} · सम्बद्ध भाव ${period.houses.join(', ')}।`, `Current ${period.id === 'dasha-maha' ? 'Mahadasha' : 'Antardasha'}: ${names(period.graha).en} · linked houses ${period.houses.join(', ')}.`),
    });
    if (tone === 'limited') against.splice(2);
  }
  return { headline: headline[tone], nextStep: nextStep[tone], inFavour, against,
    signalIds: [...new Set([...inFavour, ...against].map(reason => reason.signalId))] };
}

function directionText(question: string, tone: PhaseTone, focus: number | null): ReadingText {
  const advance = tone === 'supportive', caution = tone === 'effort' || tone === 'mixed';
  switch (question) {
    case 'job-first': return advance
      ? T('पहली नौकरी के लिए आवेदन और चयन की प्रक्रिया आगे बढ़ाने का सहारा है।', 'There is support for moving first-job applications and selection conversations forward.')
      : T('पहली नौकरी की तलाश में लगातार प्रयास का पक्ष उभरता है; जल्दी चयन होने की धारणा पर योजना न टिकाएँ।', 'For a first job, the reading points toward sustained attempts; plan without assuming quick selection.');
    case 'job-switch': return advance
      ? T('नौकरी बदलने के विकल्पों पर बातचीत आगे बढ़ाएँ; भूमिका में वास्तविक बढ़त को प्राथमिकता दें।', 'Move conversations about a job change forward, prioritising a real step up in responsibility.')
      : caution ? T('बदलाव की तलाश जारी रख सकते हैं, पर अभी केवल जल्दी निकलने के लिए भूमिका न चुनें। नई ज़िम्मेदारी और काम का दबाव साथ परखें।', 'You can keep exploring a change, but avoid choosing a role simply to make a quick exit. Weigh the new responsibility alongside its demands.')
        : T('नौकरी बदलने की संभावना टटोलें; इस अवधि से अकेले बदलाव को बेहतर विकल्प नहीं कहा जा सकता।', 'Explore a possible change; this period alone does not establish that switching is the better option.');
    case 'job-growth': return advance
      ? T('अधिक ज़िम्मेदारी या भूमिका में विस्तार की बातचीत आगे बढ़ाने का समय समझें।', 'Read this as a phase for advancing conversations about greater responsibility or a wider role.')
      : T('मौजूदा भूमिका में पकड़ और काम की पहचान बढ़ाने पर ज़ोर रखें; तत्काल पदोन्नति का समय तय नहीं होता।', 'Emphasise command of your work and recognition in the current role; an immediate promotion is not established.');
    case 'business-partner': return advance
      ? T('साझेदारी की बातचीत आगे बढ़ाने का सहारा है; काम बाँटने की दिशा को केंद्र में रखें।', 'There is support for advancing partnership discussions, centred on how the work would be shared.')
      : T('साझेदारी पर अभी चरणों में आगे बढ़ने की दिशा है; केवल उत्साह के आधार पर स्थायी बँटवारा तय न मानें।', 'The direction is to approach partnership in stages; enthusiasm alone is not a basis for a permanent arrangement.');
    case 'business-start': return advance
      ? T('उद्यम की शुरुआत की तैयारी को आगे बढ़ाने का सहारा है; पहल को ठोस काम में बदलें।', 'There is support for advancing preparations for a venture and turning initiative into concrete work.')
      : T('शुरुआत को चरणों में रखने की दिशा है; तत्काल बड़े विस्तार को इस अवधि का निष्कर्ष न मानें।', 'The direction is a staged beginning; this phase does not establish an immediate large expansion.');
    default: return focus === 7 ? T('साझेदारी और ग्राहकों के साथ काम करने की दिशा पर ध्यान दें।', 'Give attention to working with partners and clients.')
      : focus === 6 ? T('इस समय प्रतिस्पर्धा और रोज़ के काम में पकड़ बनाना मुख्य दिशा है।', 'The main direction now is building your footing in competition and daily work.')
        : T('भूमिका और ज़िम्मेदारी को आगे बढ़ाने के विकल्प देखें, गति को मिले-जुले संकेतों के अनुसार रखें।', 'Explore ways to develop your role and responsibility, with a pace that reflects the combined indications.');
  }
}

function nextPeriod(chart: KundaliChart, now: Date, houses: readonly number[], currentMaha: Graha): PrashnaPhase['next'] {
  const next = chart.vimshottari.flatMap(maha => maha.antardashas.map(antar => ({ maha, antar })))
    .filter(p => p.antar.start.getTime() > now.getTime()).sort((a, b) => a.antar.start.getTime() - b.antar.start.getTime())[0];
  if (!next) return null;
  const signal = periodSignal(chart, houses, next.antar, 'antar');
  const newMaha = next.maha.lord !== currentMaha;
  const pair = T(`${names(next.maha.lord).hi}–${names(next.antar.lord).hi}`, `${names(next.maha.lord).en}–${names(next.antar.lord).en}`);
  return {
    at: next.antar.start.toISOString(), date: T(formatIstDateHi(next.antar.start), formatIstDateEn(next.antar.start)),
    title: T(`${pair.hi}: ${newMaha ? 'नई महादशा शुरू होगी' : 'अन्तर्दशा बदलेगी'}`, `${pair.en}: ${newMaha ? 'a new Mahadasha begins' : 'the Antardasha changes'}`),
    text: T(`${signal.meaning.hi} उस समय का गोचर साथ पढ़ना होगा; यह बदलाव बेहतर परिणाम की तारीख नहीं है।`, `${signal.meaning.en} Read this with the transits at that time; the change is not a date of assured improvement.`),
    basis: [...(newMaha ? [{ kind: 'dasha', level: 'maha', lord: next.maha.lord, startKey: indiaDateKey(next.maha.start), endKey: indiaDateKey(next.maha.end) } as BasisNode] : []), ...signal.basis],
  };
}

export function buildPrashnaPhase(chart: KundaliChart, purpose: PurposeId, now: Date, questionId?: string): PrashnaPhase | null {
  if (!['naukri', 'vyapar'].includes(purpose) || now.getTime() < chart.input.date.getTime() || ageYears(chart.input.date, now) < 18) return null;
  const purposeId = purpose as PhasePurpose, q = questionForPurpose(purpose, questionId), houses = phaseHouses(purposeId, q.id);
  const current = getCurrentDasha(chart, now), snapshot = computeGocharSnapshot(chart, now);
  const periods = current ? [periodSignal(chart, houses, current.maha, 'maha'), ...(current.antar ? [periodSignal(chart, houses, current.antar, 'antar')] : [])] : [];
  const focus = houses.find(h => periods.some(s => s.houses.includes(h))) ?? null;
  const natal = natalSignal(chart, houses[0]);
  const signals = [natal, ...periods, transitSignal(snapshot, houses, 'jupiter'), transitSignal(snapshot, houses, 'saturn')];
  const tone = resolvePhaseTone(signals), title = PHASE_TITLES[tone];
  const active = periods.filter(p => p.houses.length);
  const periodLabel = current ? T(`${names(current.maha.lord).hi} महादशा${current.antar ? ` · ${names(current.antar.lord).hi} अन्तर्दशा` : ''}`, `${names(current.maha.lord).en} Mahadasha${current.antar ? ` · ${names(current.antar.lord).en} Antardasha` : ''}`) : T('दशा उपलब्ध नहीं', 'Dasha unavailable');
  const lead = focus ? T(`चल रही अवधि में ${AREAS[focus].hi} का विषय उभरता है।`, `The running period brings ${AREAS[focus].en} into focus.`) : T('चल रही दशा से इस प्रश्न के लिए सीधा समय-संकेत नहीं मिलता।', 'The running dasha does not give a direct timing indication for this question.');
  const reasons = signals.filter(s => s.houses.length && (s.support || s.challenge));
  const support = reasons.find(s => s.support), challenge = reasons.find(s => s.challenge);
  const conclusion = tone === 'mixed' && support && challenge ? T(`${names(support.graha).hi} की ${support.layer === 'gochar' ? 'वर्तमान गोचर-स्थिति' : support.layer === 'dasha' ? 'चल रही अवधि' : 'जन्म-स्थिति'} से सहारा है, जबकि ${names(challenge.graha).hi} की ${challenge.layer === 'gochar' ? 'वर्तमान गोचर-स्थिति' : challenge.layer === 'dasha' ? 'चल रही अवधि' : 'जन्म-स्थिति'} अधिक प्रयास माँगती है।`, `${support.layer === 'gochar' ? 'The current transit of' : support.layer === 'dasha' ? 'The running period of' : 'The natal placement of'} ${names(support.graha).en} adds support, while ${challenge.layer === 'gochar' ? 'the current transit of' : challenge.layer === 'dasha' ? 'the running period of' : 'the natal placement of'} ${names(challenge.graha).en} adds demands.`)
    : tone === 'effort' && challenge ? T(`${names(challenge.graha).hi} से जुड़ी चुनौती के कारण तेज़ नतीजे के बजाय प्रयास और तैयारी को अधिक जगह दें।`, `The challenge associated with ${names(challenge.graha).en} points toward allowing for effort and preparation rather than a quick result.`)
      : tone === 'supportive' ? T('चल रही दशा और संबंधित गोचर दोनों से सहारा मिलता है।', 'The active period and a relevant current transit both add support.')
        : T('विषय सक्रिय होना अपने-आप आसान प्रगति का संकेत नहीं है।', 'An active topic does not by itself mean easy progress.');
  const direction = tone === 'limited' ? T('इस गणना से आगे बढ़ने या रुकने का समय तय नहीं होता। समय पर निष्कर्ष के लिए कुंडली का अधिक विस्तृत विवेचन चाहिए।', 'This calculation does not establish a time to advance or pause. A broader chart interpretation is needed for a timing conclusion.') : directionText(q.id, tone, focus);
  const focusPlanets = [...new Set(active.filter(s => s.houses.includes(focus!)).map(s => s.graha))];
  const focusText = focus ? T(`${focusPlanets.map(g => names(g).hi).join(' और ')} की अवधि में ${AREAS[focus].hi} पर ज़ोर है।`, `The ${focusPlanets.map(g => names(g).en).join(' and ')} period puts emphasis on ${AREAS[focus].en}.`) : lead;
  return {
    version: 1, purposeId, questionId: q.id, question: q.label,
    asOf: now.toISOString(), dateKey: indiaDateKey(now), transitAnchor: '06:00 Asia/Kolkata',
    tone, focusHouse: focus, title,
    summary: T(`${lead.hi} ${tone === 'limited' ? '' : conclusion.hi}`.trim(), `${lead.en} ${tone === 'limited' ? '' : conclusion.en}`.trim()),
    currentPeriod: current ? { maha: current.maha.lord, antar: current.antar?.lord ?? null, label: periodLabel, start: (current.antar ?? current.maha).start.toISOString(), end: (current.antar ?? current.maha).end.toISOString() } : null,
    signals,
    decision: q.id === 'job-switch' ? jobSwitchDecision(chart, tone, signals) : null,
    directions: [{ id: 'phase-focus', label: T('इस समय दिशा', 'Direction for this phase'), text: direction, origin: 'phase-interpretation', signalIds: [...new Set([natal.id, ...active.map(s => s.id), ...reasons.map(s => s.id)])] },
      { id: 'phase-reason', label: T('इस दिशा का कारण', 'Why this direction'), text: focusText, origin: 'phase-interpretation', signalIds: signals.filter(s => s.layer !== 'natal' || s.support || s.challenge).map(s => s.id) }],
    next: current ? nextPeriod(chart, now, houses, current.maha.lord) : null,
    limitation: T('यह पारम्परिक ज्योतिषीय विवेचन है, परिणाम की गारंटी नहीं। वर्तमान गोचर का संकेत आज के लिए है; दशा की पूरी अवधि का एक जैसा फल नहीं।', 'This is a traditional Jyotish interpretation, not an assured outcome. Current transit indications apply to today, not uniformly to the whole dasha period.'),
    source: PHASE_SOURCE,
  };
}
