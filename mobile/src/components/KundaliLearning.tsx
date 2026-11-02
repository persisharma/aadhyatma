import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFontScale } from '@/contexts/FontScaleContext';
import { useGitaLanguage } from '@/data/gita/language';
import { GRAHA_NAMES_EN, GRAHA_NAMES_HI, RASHI_NAMES_EN, RASHI_NAMES_HI, RASHI_NAMES_WESTERN, getCurrentDasha, type Graha, type GrahaPosition, type KundaliChart, type KundaliResultTab } from '@/panchang/kundali';
import { NAKSHATRA_NAMES_EN, NAKSHATRA_NAMES_HI } from '@/panchang/names';
import { GRAHA_REFERENCE } from '@/panchang/grahaReference';
import { basisLabelEn, basisLabelHi, signLordOf } from '@/panchang/kundaliBasis';
import { houseLesson, learningReadings, placementKind, PLACEMENT_LABELS, readingParagraph } from '@/panchang/kundaliLearning';
import type { KundaliGrahaCard } from '@/panchang/kundaliReportModel';
import { useTheme } from '@/theme/ThemeContext';
import { fontFamilies } from '@/theme/typography';
import { contentByLang, meaningByLang, pick } from '@/utils/localize';
import { scriptBodyFont, scriptTitleFont } from '@/utils/langType';
import KundaliArtwork, { type KundaliArtworkName } from './KundaliArtwork';
import NorthIndianChart from './NorthIndianChart';

function useReadingUI() {
  const { lang } = useGitaLanguage();
  const { colors, typography, radii } = useTheme();
  const { factor } = useFontScale();
  const c = (hi: string, en: string) => contentByLang(lang, hi, en);
  const m = (hi: string, en: string) => meaningByLang(lang, hi, en);
  return {
    lang, colors, radii, factor, c, m,
    name: (graha: Graha) => c(GRAHA_NAMES_HI[graha], GRAHA_NAMES_EN[graha]),
    sign: (index: number) => c(RASHI_NAMES_HI[index], `${RASHI_NAMES_EN[index]} · ${RASHI_NAMES_WESTERN[index]}`),
    body: { color: colors.inkSoft, fontFamily: lang === 'en' ? typography.meaningEnglish.fontFamily : scriptBodyFont(lang, typography.meaning.fontFamily), fontSize: 14 * factor, lineHeight: 23 * factor },
    title: { color: colors.ink, fontFamily: lang === 'en' ? fontFamilies.latinSemiBold : scriptTitleFont(lang, typography.readerTitle.fontFamily), fontSize: 21 * factor, lineHeight: 30 * factor },
    label: { color: colors.saffronDeep, fontFamily: lang === 'en' ? fontFamilies.interSemiBold : scriptBodyFont(lang, typography.meaning.fontFamily), fontSize: 13 * factor, lineHeight: 21 * factor },
    card: { borderColor: colors.divider, backgroundColor: colors.parchmentSoft, borderRadius: radii.lg, borderWidth: 1 },
  };
}

type Selection = { kind: 'house'; house: number } | { kind: 'graha'; graha: Graha } | { kind: 'anchor'; anchor: 'lagna' | 'moon' | 'nakshatra' } | { kind: 'guide' };

function Relationship({ position }: { position: GrahaPosition }) {
  const ui = useReadingUI();
  const kind = placementKind(position);
  const label = PLACEMENT_LABELS[kind];
  const lord = signLordOf(position.rashiIndex);
  const explanation = {
    own: ['इस राशि के स्वामी स्वयं यही ग्रह हैं।', 'This graha rules the sign it occupies.'],
    exalted: ['उच्च इस ग्रह की राशि-स्थिति का शास्त्रीय नाम है। उच्च, नीच और स्वराशि की तालिका से यह नाम मिलता है।', 'Exaltation is the classical name for this sign placement, taken from the shared dignity table.'],
    debilitated: ['नीच इस राशि-स्थिति का शास्त्रीय नाम है। यह ग्रह की उच्च राशि से सातवीं राशि होती है।', 'Debilitation is the classical name for this placement, seven signs from the graha’s exaltation sign.'],
    friend: [`${ui.name(position.graha)} की दृष्टि से ${ui.name(lord)} नैसर्गिक मित्र हैं। इसलिए इसे मित्र की राशि में स्थित कहते हैं।`, `${ui.name(position.graha)} regards ${ui.name(lord)} as a natural friend, so this is called placement in a friend’s sign.`],
    neutral: [`${ui.name(position.graha)} की दृष्टि से ${ui.name(lord)} का नैसर्गिक संबंध सम है। सम का अर्थ मैत्री तालिका में बीच का संबंध है।`, `${ui.name(position.graha)} has a neutral natural relationship toward ${ui.name(lord)}. Neutral is the middle category in the friendship table.`],
    enemy: [`${ui.name(position.graha)} की दृष्टि से ${ui.name(lord)} का नैसर्गिक संबंध शत्रु है। ग्रहों के इस संबंध को शत्रु-राशि कहा जाता है।`, `${ui.name(position.graha)} regards ${ui.name(lord)} as a natural adversary. The sign relationship takes its name from this graha-to-graha relationship.`],
    node: ['राहु और केतु चन्द्र कक्षा के दो पात हैं। उनकी उच्च-नीच और मैत्री की अलग परम्पराएँ हैं; यहाँ उनका भाव और राशि पढ़ें।', 'Rahu and Ketu are the two lunar orbital nodes. Traditions differ about their dignity and friendship; this view shows their house and sign.'],
  }[kind];
  return <View style={[ui.card, styles.inset]}>
    <Text style={ui.label}>{pick(ui.lang, { hi: 'राशि से संबंध', en: 'Relationship with this sign', gu: 'રાશિ સાથેનો સંબંધ', kn: 'ರಾಶಿಯೊಂದಿಗಿನ ಸಂಬಂಧ' })}</Text>
    <Text style={[ui.title, { fontSize: 18 * ui.factor }]}>{ui.c(label.hi, label.en)}</Text>
    <Text style={ui.body}>{ui.m(explanation[0], explanation[1])}</Text>
  </View>;
}

function PersonalReading({ card }: { card: KundaliGrahaCard | undefined }) {
  const ui = useReadingUI();
  const [why, setWhy] = useState(false);
  if (!card) return null;
  const paragraph = readingParagraph(card);
  return <View testID={`kundali-reading-${card.graha}`} style={styles.block}>
    <Text style={ui.label}>{pick(ui.lang, { hi: 'इस स्थिति का अर्थ', en: 'What this placement suggests', gu: 'આ સ્થિતિનો અર્થ', kn: 'ಈ ಸ್ಥಾನದ ಅರ್ಥ' })}</Text>
    <Text style={[ui.label, { color: ui.colors.ink }]}>{ui.c(card.toneLabelHi, card.toneLabelEn)}</Text>
    <Text style={ui.body}>{ui.m(paragraph.hi, paragraph.en)}</Text>
    {!!paragraph.careHi && <><Text style={ui.label}>{pick(ui.lang, { hi: 'किस पर ध्यान दें', en: 'What to pay attention to', gu: 'શેનું ધ્યાન રાખવું', kn: 'ಯಾವುದರತ್ತ ಗಮನ ಕೊಡಬೇಕು' })}</Text><Text style={ui.body}>{ui.m(paragraph.careHi, paragraph.careEn)}</Text></>}
    <Pressable testID={`kundali-why-${card.graha}`} accessibilityRole="button" accessibilityState={{ expanded: why }} onPress={() => setWhy(value => !value)} style={styles.action}>
      <Text style={ui.label}>{pick(ui.lang, { hi: 'ऐसा क्यों कहा?', en: 'Why this reading?', gu: 'આવું કેમ કહેવાયું?', kn: 'ಹೀಗೆ ಹೇಳಲು ಕಾರಣವೇನು?' })} {why ? '−' : '+'}</Text>
    </Pressable>
    {why && <View style={[ui.card, styles.inset]}>
      {card.reasons.map(reason => <Text key={reason.id} style={ui.body}>{reason.vote === 'supports' ? '+ ' : '− '}{ui.m(reason.textHi, reason.textEn)}</Text>)}
      <Text style={ui.label}>{ui.c('आधार', 'Basis')}</Text>
      {card.basis.map((node, index) => <Text key={index} style={ui.body}>{ui.c(basisLabelHi(node), basisLabelEn(node))}</Text>)}
    </View>}
  </View>;
}

function CalculationDetails({ position }: { position: GrahaPosition }) {
  const ui = useReadingUI();
  const [open, setOpen] = useState(false);
  return <View>
    <Pressable accessibilityRole="button" accessibilityState={{ expanded: open }} onPress={() => setOpen(value => !value)} style={styles.action}><Text style={ui.label}>{pick(ui.lang, { hi: 'गणना का विवरण', en: 'Calculation details', gu: 'ગણતરીની વિગતો', kn: 'ಲೆಕ್ಕಾಚಾರದ ವಿವರಗಳು' })} {open ? '−' : '+'}</Text></Pressable>
    {open && <Text style={ui.body}>{ui.c(`${Math.floor(position.degreeInRashi)}° ${Math.floor(position.degreeInRashi % 1 * 60)}′ · ${NAKSHATRA_NAMES_HI[position.nakshatraIndex]} · पद ${position.pada}${position.retrograde ? ' · वक्री' : ''}`, `${Math.floor(position.degreeInRashi)}° ${Math.floor(position.degreeInRashi % 1 * 60)}′ · ${NAKSHATRA_NAMES_EN[position.nakshatraIndex]} · Pada ${position.pada}${position.retrograde ? ' · Retrograde' : ''}`)}</Text>}
  </View>;
}

function LearningSheet({ chart, selection, onClose, onReference }: { chart: KundaliChart; selection: Selection | null; onClose: () => void; onReference?: (graha: Graha) => void }) {
  return selection ? <SheetContent chart={chart} selection={selection} onClose={onClose} onReference={onReference} /> : null;
}

function SheetContent({ chart, selection, onClose, onReference }: { chart: KundaliChart; selection: Selection; onClose: () => void; onReference?: (graha: Graha) => void }) {
  const ui = useReadingUI();
  const insets = useSafeAreaInsets();
  const [trail, setTrail] = useState<Selection[]>([selection]);
  const current = trail[trail.length - 1];
  const cards = useMemo(() => learningReadings(chart, new Date()), [chart]);
  const open = (next: Selection) => setTrail(previous => [...previous, next]);
  const back = () => trail.length > 1 ? setTrail(previous => previous.slice(0, -1)) : onClose();
  const house = current.kind === 'house' ? houseLesson(chart, current.house) : undefined;
  const position = current.kind === 'graha' ? chart.grahas.find(item => item.graha === current.graha) : undefined;
  const moon = chart.grahas.find(item => item.graha === 'moon');
  const art: KundaliArtworkName = position?.graha ?? (current.kind === 'anchor' ? current.anchor : 'lagna');
  const title = house ? ui.c(`भाव ${house.house} · ${house.meaning.shortHi}`, `House ${house.house} · ${house.meaning.shortEn}`) : position ? ui.name(position.graha) : current.kind === 'guide' ? ui.c('अपनी कुंडली कैसे पढ़ें', 'How to read your chart') : current.kind === 'anchor' && current.anchor === 'moon' ? ui.c('चन्द्र राशि', 'Moon sign') : current.kind === 'anchor' && current.anchor === 'nakshatra' ? ui.c('जन्म नक्षत्र', 'Birth nakshatra') : ui.c('लग्न · शुरुआत का बिंदु', 'Lagna · your starting point');
  return <Modal visible transparent animationType="slide" onRequestClose={back}>
    <View style={[styles.scrim, { backgroundColor: ui.colors.modalBackdrop }]}>
      <Pressable accessible={false} style={StyleSheet.absoluteFill} onPress={onClose} />
      <View accessibilityViewIsModal style={[styles.sheet, { backgroundColor: ui.colors.parchment, paddingBottom: Math.max(insets.bottom, 12), borderColor: ui.colors.divider }]}>
        <View style={styles.sheetHeader}><KundaliArtwork name={art} size={64} /><Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Close Kundali explanation" style={styles.close}><Text style={ui.title}>×</Text></Pressable></View>
        <ScrollView key={`${current.kind}-${trail.length}-${title}`} contentContainerStyle={styles.sheetBody}>
          <Text accessibilityRole="header" style={ui.title}>{title}</Text>
          {house && <>
            <Text style={ui.label}>{ui.sign(house.rashiIndex)}</Text><Text style={ui.body}>{ui.m(house.meaning.hi, house.meaning.en)}</Text>
            <Text style={ui.label}>{pick(ui.lang, { hi: 'इस भाव में ग्रह', en: 'Grahas in this house', gu: 'આ ભાવમાં ગ્રહો', kn: 'ಈ ಭಾವದಲ್ಲಿರುವ ಗ್ರಹಗಳು' })}</Text>
            {house.occupants.length === 0 ? <Text testID="kundali-empty-house" style={ui.body}>{ui.m('जन्म के समय इस भाव में कोई ग्रह नहीं था। खाली भाव सामान्य हैं। इस जीवन-क्षेत्र को इसकी राशि और राशि-स्वामी की स्थिति से पढ़ते हैं।', 'No graha occupied this house at birth. Empty houses are normal. Read this life area through its sign and the placement of its ruler.')}</Text> : house.occupants.map(item => <View key={item.graha} style={styles.block}>
              <Pressable onPress={() => open({ kind: 'graha', graha: item.graha })} accessibilityRole="button" accessibilityLabel={`Learn about ${GRAHA_NAMES_EN[item.graha]}`} style={styles.grahaRow}><KundaliArtwork name={item.graha} size={52} /><View style={styles.flexCopy}><Text style={ui.title}>{ui.name(item.graha)} ›</Text><Text style={ui.body}>{ui.m(GRAHA_REFERENCE[item.graha].signifiesHi, GRAHA_REFERENCE[item.graha].signifiesEn)}</Text></View></Pressable>
              <PersonalReading card={cards.find(card => card.graha === item.graha)} /><Relationship position={item} />
            </View>)}
            <Text style={ui.label}>{pick(ui.lang, { hi: 'भाव का स्वामी कहाँ है?', en: 'Where is this house’s ruler?', gu: 'ભાવનો સ્વામી ક્યાં છે?', kn: 'ಈ ಭಾವದ ಅಧಿಪತಿ ಎಲ್ಲಿದ್ದಾನೆ?' })}</Text>
            <Text style={ui.body}>{ui.m(`${ui.sign(house.rashiIndex)} राशि का स्वामी ${ui.name(house.lord)} है। ${house.lordPosition ? `आपकी कुंडली में वह भाव ${house.lordPosition.house} में है।` : ''} भाव का स्वामी (भावेश) इस जीवन-क्षेत्र को समझने का अगला कदम है।`, `${ui.name(house.lord)} rules ${ui.sign(house.rashiIndex)}. ${house.lordPosition ? `In this chart it occupies house ${house.lordPosition.house}.` : ''} The house ruler, called bhavesh, is the next step in understanding this life area.`)}</Text>
            {house.lordPosition && <Pressable accessibilityRole="button" accessibilityLabel={`Follow house ruler ${GRAHA_NAMES_EN[house.lord]}`} style={styles.action} onPress={() => open({ kind: 'graha', graha: house.lord })}><Text style={ui.label}>{ui.name(house.lord)} · {ui.c(`भाव ${house.lordPosition.house} समझें`, `Explore house ${house.lordPosition.house}`)} ›</Text></Pressable>}
          </>}
          {position && <>
            <Text style={ui.label}>{ui.c(`भाव ${position.house}`, `House ${position.house}`)} · {ui.sign(position.rashiIndex)}</Text>
            <Text style={ui.label}>{pick(ui.lang, { hi: 'राशि से संबंध', en: 'Relationship with this sign', gu: 'રાશિ સાથેનો સંબંધ', kn: 'ರಾಶಿಯೊಂದಿಗಿನ ಸಂಬಂಧ' })} · {ui.c(PLACEMENT_LABELS[placementKind(position)].hi, PLACEMENT_LABELS[placementKind(position)].en)}</Text>
            <Text style={ui.body}>{ui.m(GRAHA_REFERENCE[position.graha].signifiesHi, GRAHA_REFERENCE[position.graha].signifiesEn)}</Text>
            <PersonalReading key={`reading-${position.graha}`} card={cards.find(card => card.graha === position.graha)} />
            <Relationship key={position.graha} position={position} />
            <Text style={ui.label}>{pick(ui.lang, { hi: 'ग्रह परिचय', en: 'About this graha', gu: 'ગ્રહ પરિચય', kn: 'ಗ್ರಹದ ಪರಿಚಯ' })}</Text>
            <Text style={ui.body}>{ui.m(GRAHA_REFERENCE[position.graha].natureHi, GRAHA_REFERENCE[position.graha].natureEn)}</Text>
            <Pressable onPress={() => open({ kind: 'house', house: position.house })} accessibilityRole="button" style={styles.action}><Text style={ui.label}>{ui.c(`भाव ${position.house} का अर्थ समझें`, `Understand house ${position.house}`)} ›</Text></Pressable>
            <CalculationDetails key={`details-${position.graha}`} position={position} />
            {onReference && <Pressable onPress={() => { onClose(); onReference(position.graha); }} accessibilityRole="button" style={styles.action}><Text style={ui.label}>{pick(ui.lang, { hi: 'ग्रह परिचय और नैसर्गिक मैत्री', en: 'Graha introduction and natural friendships', gu: 'ગ્રહ પરિચય અને નૈસર્ગિક મૈત્રી', kn: 'ಗ್ರಹ ಪರಿಚಯ ಮತ್ತು ನೈಸರ್ಗಿಕ ಮೈತ್ರಿ' })} ›</Text></Pressable>}
          </>}
          {current.kind === 'anchor' && <>
            <Text style={ui.body}>{current.anchor === 'lagna' ? ui.m(`जन्म के समय पूर्वी क्षितिज पर ${ui.sign(chart.lagnaRashiIndex)} राशि उदित थी। यही लग्न है और कुंडली का पहला भाव तय करती है।`, `${ui.sign(chart.lagnaRashiIndex)} was rising on the eastern horizon at birth. This is the Lagna; it sets house 1 in this chart.`) : current.anchor === 'moon' && moon ? ui.m(`जन्म के समय चन्द्र ${ui.sign(moon.rashiIndex)} राशि में था। चन्द्र राशि से मन, भावनाओं और भीतर की लय को पढ़ते हैं।`, `The Moon was in ${ui.sign(moon.rashiIndex)} at birth. The Moon sign is used to read feelings, the mind and inner rhythm.`) : moon ? ui.m(`जन्म के समय चन्द्र ${NAKSHATRA_NAMES_HI[moon.nakshatraIndex]} नक्षत्र, पद ${moon.pada} में था। नक्षत्र आकाश के 27 खंडों में से एक है; पद उसका चौथा हिस्सा है। इसी चन्द्र-स्थिति से विम्शोत्तरी दशा का आरम्भ निकलता है।`, `The Moon was in ${NAKSHATRA_NAMES_EN[moon.nakshatraIndex]}, pada ${moon.pada}. A nakshatra is one of 27 sky divisions; a pada is one quarter of it. This Moon position sets the starting point for the Vimshottari period sequence.`) : ''}</Text>
            <Pressable onPress={() => open(current.anchor === 'lagna' ? { kind: 'house', house: 1 } : { kind: 'graha', graha: 'moon' })} accessibilityRole="button" style={styles.action}><Text style={ui.label}>{ui.c('स्थिति समझें', 'Explore the placement')} ›</Text></Pressable>
          </>}
          {current.kind === 'guide' && <>
            {[
              ['1 · भाव = जीवन का विषय', '1 · House = a life area', 'ऊपर का बीच वाला खाना भाव 1 है। फिर बाईं ओर से भाव 2–12 क्रम में आते हैं। किसी खाने को छूकर उसका अर्थ पढ़ें।', 'The top central diamond is house 1. Houses continue counterclockwise. Tap a cell to read its life area.'],
              ['2 · राशि = उस भाव की राशि', '2 · Sign = the sign in that house', 'कन्या राशि का पारम्परिक अंक 6 है। यहाँ खाने में भाव संख्या और राशि का नाम साथ लिखे हैं; इससे भाव 1 और राशि 6 में भ्रम नहीं होता।', 'Virgo’s traditional sign number is 6. This chart writes the house number and sign name together, keeping house 1 distinct from sign 6.'],
              ['3 · ग्रह = उस विषय के कारक', '3 · Graha = a significator', 'ग्रह को छूकर उसका परिचय, इस स्थिति का अर्थ और राशि-संबंध पढ़ें। खाली भाव को उसके राशि-स्वामी की स्थिति से समझें।', 'Tap a graha for its introduction, the meaning of its placement and its sign relationship. Explore an empty house through the placement of its sign ruler.'],
            ].map(([hi, en, bodyHi, bodyEn]) => <View key={en} style={styles.block}><Text style={ui.title}>{ui.c(hi, en)}</Text><Text style={ui.body}>{ui.m(bodyHi, bodyEn)}</Text></View>)}
          </>}
        </ScrollView>
        <Pressable onPress={back} accessibilityRole="button" accessibilityLabel={trail.length > 1 ? 'Back in Kundali explanation' : 'Done with Kundali explanation'} style={[styles.done, { backgroundColor: ui.colors.saffronTint }]}><Text style={ui.label}>{trail.length > 1 ? pick(ui.lang, { hi: 'पीछे', en: 'Back', gu: 'પાછળ', kn: 'ಹಿಂದೆ' }) : pick(ui.lang, { hi: 'समझ गए', en: 'Done', gu: 'સમજાયું', kn: 'ಆಯಿತು' })}</Text></Pressable>
      </View>
    </View>
  </Modal>;
}

function useSelection(chart: KundaliChart) {
  const [state, setState] = useState<{ chart: KundaliChart; value: Selection } | null>(null);
  useEffect(() => setState(null), [chart]);
  return { selection: state?.chart === chart ? state.value : null, select: (value: Selection) => setState({ chart, value }), close: () => setState(null) };
}

export function KundaliSummary({ chart, at, onOpenTab }: { chart: KundaliChart; at: Date; onOpenTab: (tab: KundaliResultTab) => void }) {
  const ui = useReadingUI();
  const { selection, select, close } = useSelection(chart);
  const moon = chart.grahas.find(item => item.graha === 'moon');
  const dasha = getCurrentDasha(chart, at);
  const anchors = [
    { id: 'lagna' as const, hi: 'लग्न', en: 'Lagna', value: ui.sign(chart.lagnaRashiIndex), meaning: ui.m('उदित राशि · भाव 1 का आरम्भ', 'The rising sign · where house 1 begins') },
    { id: 'moon' as const, hi: 'चन्द्र राशि', en: 'Moon sign', value: moon ? ui.sign(moon.rashiIndex) : '—', meaning: ui.m('मन और भावनाओं की लय', 'The mind and the rhythm of feeling') },
    { id: 'nakshatra' as const, hi: 'जन्म नक्षत्र', en: 'Birth nakshatra', value: moon ? ui.c(`${NAKSHATRA_NAMES_HI[moon.nakshatraIndex]} · पद ${moon.pada}`, `${NAKSHATRA_NAMES_EN[moon.nakshatraIndex]} · Pada ${moon.pada}`) : '—', meaning: ui.m('चन्द्र का आकाश-खंड · दशा का आधार', 'The Moon’s sky division · the basis for dasha') },
  ];
  return <View>
    <Text style={ui.title}>{pick(ui.lang, { hi: 'आपकी कुंडली, सरल शब्दों में', en: 'Your chart, in simple words', gu: 'તમારી કુંડળી, સરળ શબ્દોમાં', kn: 'ನಿಮ್ಮ ಕುಂಡಲಿ, ಸರಳ ಮಾತುಗಳಲ್ಲಿ' })}</Text>
    <Text style={[ui.body, { marginTop: 6, marginBottom: 16 }]}>{pick(ui.lang, { hi: 'तीन शुरुआत के बिंदु। किसी को छूकर उसका अर्थ जानें।', en: 'Three starting points. Tap any one to understand it.', gu: 'શરૂઆતના ત્રણ મુદ્દા. અર્થ જાણવા કોઈ એકને સ્પર્શ કરો.', kn: 'ಆರಂಭದ ಮೂರು ಅಂಶಗಳು. ಅರ್ಥ ತಿಳಿಯಲು ಒಂದನ್ನು ಸ್ಪರ್ಶಿಸಿ.' })}</Text>
    <View style={[ui.card, { marginBottom: 16 }]}>{anchors.map((anchor, index) => <Pressable key={anchor.id} testID={`kundali-summary-${anchor.id}`} accessibilityRole="button" accessibilityLabel={`Explain ${anchor.en}`} onPress={() => select({ kind: 'anchor', anchor: anchor.id })} style={[styles.anchor, index > 0 && { borderTopWidth: 1, borderTopColor: ui.colors.divider }]}>
      <KundaliArtwork name={anchor.id} size={64} /><View style={styles.flexCopy}><Text style={ui.label}>{ui.c(anchor.hi, anchor.en)}</Text><Text style={[ui.title, { fontSize: 18 * ui.factor }]}>{anchor.value}</Text><Text style={ui.body}>{anchor.meaning}</Text></View><Text style={ui.label}>›</Text>
    </Pressable>)}</View>
    {dasha && <Pressable onPress={() => onOpenTab('dasha')} accessibilityRole="button" accessibilityLabel="Explore current Dasha" style={[ui.card, styles.inset, { marginBottom: 16 }]}>
      <View style={styles.grahaRow}><KundaliArtwork name={dasha.maha.lord} size={64} />{dasha.antar && <KundaliArtwork name={dasha.antar.lord} size={44} />}<Text style={[ui.label, styles.flexCopy]}>{ui.c('अभी चल रही अवधि', 'Your current period')}</Text></View>
      <Text style={ui.title}>{ui.name(dasha.maha.lord)} {ui.c('महादशा', 'Mahadasha')}</Text>{dasha.antar && <Text style={ui.body}>{ui.name(dasha.antar.lord)} {ui.c('अन्तर्दशा', 'Antardasha')}</Text>}
      <Text style={ui.label}>{pick(ui.lang, { hi: 'समयरेखा और अर्थ देखें', en: 'Explore the timeline and meaning', gu: 'સમયરેખા અને અર્થ જુઓ', kn: 'ಕಾಲರೇಖೆ ಮತ್ತು ಅರ್ಥ ನೋಡಿ' })} ›</Text>
    </Pressable>}
    <Pressable onPress={() => onOpenTab('chart')} accessibilityRole="button" style={[styles.done, { backgroundColor: ui.colors.saffronTint }]}><Text style={ui.label}>{pick(ui.lang, { hi: 'अपनी कुंडली को छूकर समझें', en: 'Explore your chart by touch', gu: 'તમારી કુંડળી સ્પર્શ કરીને સમજો', kn: 'ನಿಮ್ಮ ಕುಂಡಲಿಯನ್ನು ಸ್ಪರ್ಶಿಸಿ ತಿಳಿಯಿರಿ' })} ›</Text></Pressable>
    <LearningSheet chart={chart} selection={selection} onClose={close} />
  </View>;
}

export function KundaliExplorer({ chart, mode, onReference }: { chart: KundaliChart; mode: 'chart' | 'grahas'; onReference: (graha: Graha) => void }) {
  const ui = useReadingUI();
  const { width, fontScale } = useWindowDimensions();
  const [view, setView] = useState<'picture' | 'topics'>('picture');
  const { selection, select, close } = useSelection(chart);
  useEffect(() => setView('picture'), [chart, mode]);
  const singleColumn = width < 390 || ui.factor > 1 || fontScale > 1.2;
  return <View>
    {mode === 'chart' ? <>
      <View accessibilityRole="tablist" style={[styles.switcher, { borderColor: ui.colors.divider }]}>{(['picture', 'topics'] as const).map(id => <Pressable key={id} testID={`kundali-view-${id}`} accessibilityRole="tab" accessibilityState={{ selected: view === id }} onPress={() => setView(id)} style={[styles.switchButton, { backgroundColor: view === id ? ui.colors.saffronTint : 'transparent' }]}><Text style={ui.label}>{id === 'picture' ? pick(ui.lang, { hi: 'कुंडली चित्र', en: 'Chart picture', gu: 'કુંડળી ચિત્ર', kn: 'ಕುಂಡಲಿ ಚಿತ್ರ' }) : pick(ui.lang, { hi: 'जीवन के विषय', en: 'Life areas', gu: 'જીવનના વિષયો', kn: 'ಜೀವನದ ವಿಷಯಗಳು' })}</Text></Pressable>)}</View>
      <Pressable onPress={() => select({ kind: 'guide' })} accessibilityRole="button" style={styles.action}><Text style={ui.label}>{pick(ui.lang, { hi: 'इसे कैसे पढ़ें?', en: 'How do I read this?', gu: 'આ કેવી રીતે વાંચવું?', kn: 'ಇದನ್ನು ಹೇಗೆ ಓದುವುದು?' })} ›</Text></Pressable>
      {view === 'picture' ? <View style={[ui.card, styles.inset]}>
        <Text style={ui.body}>{pick(ui.lang, { hi: 'हर खाना जीवन का एक विषय है। भाव संख्या और राशि का नाम साथ पढ़ें; अर्थ जानने के लिए खाने को छुएँ।', en: 'Each cell is a life area. Read its house number and sign name together; tap a cell to understand it.', gu: 'દરેક ખાનું જીવનનો એક વિષય છે. ભાવનો નંબર અને રાશિનું નામ સાથે વાંચો; અર્થ જાણવા ખાનાને સ્પર્શ કરો.', kn: 'ಪ್ರತಿ ಖಾನೆಯು ಜೀವನದ ಒಂದು ವಿಷಯ. ಭಾವದ ಸಂಖ್ಯೆ ಮತ್ತು ರಾಶಿಯ ಹೆಸರನ್ನು ಜೊತೆಯಾಗಿ ಓದಿ; ಅರ್ಥ ತಿಳಿಯಲು ಖಾನೆಯನ್ನು ಸ್ಪರ್ಶಿಸಿ.' })}</Text>
        <NorthIndianChart chart={chart} size={Math.max(200, Math.min(width - 88, 380))} lang={ui.lang} onSelectHouse={house => select({ kind: 'house', house })} />
      </View> : <View>{chart.houses.map((_, index) => { const lesson = houseLesson(chart, index + 1); return <Pressable key={index} testID={`kundali-house-topic-${index + 1}`} accessibilityRole="button" accessibilityLabel={`Explore house ${index + 1}, ${lesson.meaning.shortEn}`} onPress={() => select({ kind: 'house', house: index + 1 })} style={[ui.card, styles.topic]}>
        <Text style={ui.label}>{ui.c(`भाव ${index + 1}`, `House ${index + 1}`)} · {ui.sign(lesson.rashiIndex)}</Text><Text style={[ui.title, { fontSize: 18 * ui.factor }]}>{ui.m(lesson.meaning.shortHi, lesson.meaning.shortEn)} ›</Text><Text style={ui.body}>{lesson.occupants.length ? lesson.occupants.map(item => ui.name(item.graha)).join(' · ') : ui.c('खाली भाव · अर्थ जानें', 'Empty house · understand its meaning')}</Text>
      </Pressable>; })}</View>}
    </> : <>
      <Text style={ui.title}>{pick(ui.lang, { hi: 'अपने ग्रहों को जानें', en: 'Meet your grahas', gu: 'તમારા ગ્રહોને જાણો', kn: 'ನಿಮ್ಮ ಗ್ರಹಗಳನ್ನು ತಿಳಿಯಿರಿ' })}</Text>
      <Text style={[ui.body, { marginTop: 6, marginBottom: 16 }]}>{pick(ui.lang, { hi: 'ग्रह को छूकर उसका परिचय, स्थिति का अर्थ और राशि से संबंध समझें।', en: 'Tap a graha for its nature, the meaning of its placement and its sign relationship.', gu: 'ગ્રહનો પરિચય, સ્થિતિનો અર્થ અને રાશિ સાથેનો સંબંધ જાણવા તેને સ્પર્શ કરો.', kn: 'ಗ್ರಹದ ಸ್ವಭಾವ, ಸ್ಥಾನದ ಅರ್ಥ ಮತ್ತು ರಾಶಿಯೊಂದಿಗಿನ ಸಂಬಂಧ ತಿಳಿಯಲು ಅದನ್ನು ಸ್ಪರ್ಶಿಸಿ.' })}</Text>
      <View style={styles.grid}>{chart.grahas.map(position => <Pressable key={position.graha} testID={`kundali-graha-${position.graha}`} accessibilityRole="button" accessibilityLabel={`Learn about ${GRAHA_NAMES_EN[position.graha]}`} onPress={() => select({ kind: 'graha', graha: position.graha })} style={[ui.card, styles.tile, { width: singleColumn ? '100%' : '48%' }]}>
        <KundaliArtwork name={position.graha} size={80} /><Text style={[ui.title, { fontSize: 19 * ui.factor }]}>{ui.name(position.graha)}</Text><Text style={ui.label}>{ui.c(`भाव ${position.house}`, `House ${position.house}`)} · {ui.sign(position.rashiIndex)}</Text><Text style={ui.body}>{ui.m(GRAHA_REFERENCE[position.graha].signifiesHi, GRAHA_REFERENCE[position.graha].signifiesEn)}</Text><Text style={ui.label}>{ui.c('स्थिति समझें', 'Understand the placement')} ›</Text>
      </Pressable>)}</View>
    </>}
    <LearningSheet chart={chart} selection={selection} onClose={close} onReference={onReference} />
  </View>;
}

const styles = StyleSheet.create({
  scrim: { flex: 1, justifyContent: 'flex-end' },
  sheet: { maxHeight: '90%', borderTopLeftRadius: 28, borderTopRightRadius: 28, borderWidth: 1 },
  sheetHeader: { paddingHorizontal: 20, paddingTop: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sheetBody: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 24, gap: 14 },
  close: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  done: { minHeight: 48, marginHorizontal: 16, marginTop: 8, borderRadius: 16, padding: 12, alignItems: 'center', justifyContent: 'center' },
  action: { minHeight: 44, paddingVertical: 12, justifyContent: 'center' },
  inset: { padding: 16, gap: 8 },
  block: { gap: 10, marginVertical: 6 },
  grahaRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  flexCopy: { flex: 1, minWidth: 0 },
  anchor: { padding: 16, flexDirection: 'row', alignItems: 'center', gap: 10 },
  switcher: { flexDirection: 'row', borderWidth: 1, borderRadius: 16, padding: 4, gap: 4 },
  switchButton: { flex: 1, minHeight: 48, padding: 10, alignItems: 'center', justifyContent: 'center', borderRadius: 12 },
  topic: { padding: 14, gap: 4, marginTop: 10 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 },
  tile: { padding: 16, gap: 6 },
});
