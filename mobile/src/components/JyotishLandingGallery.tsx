import React, { useState } from 'react';
import { Image, Modal, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowRightIcon } from 'phosphor-react-native/src/icons/ArrowRight';
import AppIcon from './AppIcon';
import { useFontScale } from '@/contexts/FontScaleContext';
import type { Lang } from '@/data/gita/language';
import { useTheme } from '@/theme/ThemeContext';
import { scriptBodyFont, scriptTitleFont } from '@/utils/langType';
import { pick } from '@/utils/localize';
import copy from './jyotishLandingCopy.json';

const art = {
  kundali: require('@assets/jyotish-landing/kundali.webp'),
  rashifal: require('@assets/jyotish-landing/rashifal.webp'),
  milan: require('@assets/jyotish-landing/milan.webp'),
  namkaran: require('@assets/jyotish-landing/namkaran.webp'),
  hero: require('@assets/jyotish-landing/hero.webp'),
  learn: require('@assets/jyotish-landing/learn.webp'),
  navagraha: require('@assets/jyotish-landing/navagraha.webp'),
};
const lessons = [
  { hi: 'जन्म की तारीख, समय और स्थान से लग्न, ग्रहों की स्थिति और भावों की गणना होती है।', en: 'Your birth date, time and place determine the Lagna, planetary positions and houses.', gu: 'જન્મની તારીખ, સમય અને સ્થળ પરથી લગ્ન, ગ્રહોની સ્થિતિ અને ભાવોની ગણતરી થાય છે.', kn: 'ಜನ್ಮ ದಿನಾಂಕ, ಸಮಯ ಮತ್ತು ಸ್ಥಳದಿಂದ ಲಗ್ನ, ಗ್ರಹಗಳ ಸ್ಥಾನ ಮತ್ತು ಭಾವಗಳನ್ನು ಲೆಕ್ಕಹಾಕಲಾಗುತ್ತದೆ.' },
  { hi: 'चन्द्र राशि और आज के गोचर से दैनिक मार्गदर्शन मिलता है। सहेजी कुंडली होने पर लग्न और दशा का संदर्भ भी जुड़ता है।', en: 'Daily guidance uses the Moon sign and current transits. A saved chart adds Lagna and Dasha context.', gu: 'ચંદ્ર રાશિ અને આજના ગોચર પરથી દૈનિક માર્ગદર્શન મળે છે. સાચવેલી કુંડળીથી લગ્ન અને દશાનો સંદર્ભ પણ મળે છે.', kn: 'ದಿನದ ಮಾರ್ಗದರ್ಶನವು ಚಂದ್ರ ರಾಶಿ ಮತ್ತು ಪ್ರಸ್ತುತ ಗೋಚಾರವನ್ನು ಬಳಸುತ್ತದೆ. ಉಳಿಸಿದ ಕುಂಡಲಿಯಿದ್ದರೆ ಲಗ್ನ ಮತ್ತು ದಶೆಯ ಸಂದರ್ಭವೂ ಸೇರುತ್ತದೆ.' },
  { hi: 'अष्टकूट मिलान में दोनों के जन्म-चन्द्र और नक्षत्र से आठ कूटों के गुण निकाले जाते हैं।', en: 'Ashtakoota matching compares the two birth Moons and nakshatras across eight kootas.', gu: 'અષ્ટકૂટ મિલાનમાં બંનેના જન્મના ચંદ્ર અને નક્ષત્ર પરથી આઠ કૂટોના ગુણ ગણાય છે.', kn: 'ಅಷ್ಟಕೂಟ ಮಿಲಾನದಲ್ಲಿ ಇಬ್ಬರ ಜನ್ಮ ಚಂದ್ರ ಮತ್ತು ನಕ್ಷತ್ರಗಳನ್ನು ಎಂಟು ಕೂಟಗಳಲ್ಲಿ ಹೋಲಿಸಲಾಗುತ್ತದೆ.' },
];
type Props = React.PropsWithChildren<{
  lang: Lang; saved?: boolean; additionalTools?: React.ReactNode;
  onOpenKundali: () => void; onOpenRashifal: () => void;
  onOpenGunaMilan: () => void; onOpenNamkaran: () => void; onOpenNavagraha: () => void;
}>;
export default function JyotishLandingGallery({ lang, saved = false, children, additionalTools, ...actions }: Props) {
  const { colors, typography } = useTheme();
  const { factor, scale } = useFontScale();
  const { width, fontScale } = useWindowDimensions();
  const large = scale === 'L' || fontScale > 1.2 || width < 350;
  const [learnVisible, setLearnVisible] = useState(false);
  const t = copy[lang];
  const title = { fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily), color: colors.catalogAccent };
  const body = { fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily), color: colors.inkMuted, fontSize: 13 * factor, lineHeight: 21 * factor };
  const doors = [
    { id: 'kundali', source: art.kundali, action: actions.onOpenKundali, label: saved ? 'Open Kundali' : 'Create Kundali' },
    { id: 'rashifal', source: art.rashifal, action: actions.onOpenRashifal, label: saved ? 'Browse Daily Rashifal' : 'Open Daily Rashifal' },
    { id: 'milan', source: art.milan, action: actions.onOpenGunaMilan, label: 'Open Guna Milan' },
    { id: 'namkaran', source: art.namkaran, action: actions.onOpenNamkaran, label: 'Open Namkaran' },
  ];
  const painting = (source: number, style: object) => <Image source={source} resizeMode="cover" style={style} accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" />;
  const arrow = <View style={[styles.arrow, { backgroundColor: colors.saffronTint }]}><ArrowRightIcon size={20} color={colors.catalogAccent} /></View>;
  return <View testID="jyotish-illustrated-landing" accessibilityLabel={saved ? 'Jyotish tools landing, saved profile' : 'Jyotish tools landing'}>
    <View style={styles.hero}>
      {painting(art.hero, styles.heroArt)}
      <View style={styles.heroCopy}>
        <Text accessibilityRole="header" style={[title, { fontSize: 42, lineHeight: 64 }]}>{t.title}</Text>
        <View style={[styles.rule, { backgroundColor: colors.gold }]} />
        <Text style={[body, { fontSize: 15 * factor, lineHeight: 24 * factor }]}>{t.subtitle}</Text>
      </View>
    </View>
    {children}
    <Text accessibilityRole="header" style={[title, styles.sectionTitle]}>{t.choose}</Text>
    <View testID="jyotish-gallery" style={styles.grid}>
      {doors.map((door, index) => <Pressable key={door.id} onPress={door.action} accessibilityRole="button" accessibilityLabel={door.label}
        style={({ pressed }) => [styles.card, { width: large ? '100%' : '48.5%', backgroundColor: colors.catalogSurface, borderColor: colors.catalogBorder }, large && styles.cardLarge, pressed && styles.pressed]}>
        {painting(door.source, large ? styles.artLarge : styles.art)}
        <View style={[styles.cardCopy, large && styles.flex]}>
          <Text style={[title, { fontSize: 18 * factor, lineHeight: 29 * factor }]}>{t.cards[index][0]}</Text>
          <Text style={[body, { marginTop: 5 }]}>{t.cards[index][1]}</Text>
          <View style={styles.arrowEnd}>{arrow}</View>
        </View>
      </Pressable>)}
    </View>
    {additionalTools}
    <Pressable onPress={() => setLearnVisible(true)} accessibilityRole="button" accessibilityLabel="How Jyotish works"
      style={({ pressed }) => [styles.info, { backgroundColor: colors.catalogSurface, borderColor: colors.gold }, pressed && styles.pressed]}>
      {painting(art.learn, styles.book)}
      <View style={styles.flex}><Text style={[title, { fontSize: 17 * factor, lineHeight: 27 * factor }]}>{t.learn}</Text><Text style={body}>{t.learnSub}</Text></View>
      {!large && arrow}
    </Pressable>
    <Pressable onPress={actions.onOpenNavagraha} accessibilityRole="button" accessibilityLabel="Open Navagraha Stotram"
      style={({ pressed }) => [styles.practice, { backgroundColor: colors.catalogSurface, borderColor: colors.catalogBorder }, pressed && styles.pressed]}>
      {painting(art.navagraha, large ? styles.planetsLarge : styles.planets)}
      <View style={styles.flex}><Text style={[body, { color: colors.saffronDeep, fontSize: 11 * factor }]}>{t.practice}</Text>
        <Text style={[title, { fontSize: 20 * factor, lineHeight: 32 * factor }]}>{t.prayer}</Text><Text style={body}>{t.prayerSub}</Text></View>
      {!large && arrow}
    </Pressable>
    <Modal visible={learnVisible} transparent animationType="slide" onRequestClose={() => setLearnVisible(false)}>
      <View style={[styles.backdrop, { backgroundColor: colors.modalBackdrop }]}>
        <SafeAreaView edges={['bottom', 'left', 'right']} style={[styles.sheet, { backgroundColor: colors.catalogSurface }]} accessibilityViewIsModal>
          <View style={styles.sheetHead}><Text accessibilityRole="header" style={[title, styles.flex, { fontSize: 22, lineHeight: 34 }]}>{t.learn}</Text>
            <Pressable onPress={() => setLearnVisible(false)} accessibilityRole="button" accessibilityLabel="Close Jyotish explanation" style={styles.close}><AppIcon name="close" size={23} /></Pressable></View>
          <ScrollView contentContainerStyle={styles.lesson}>
            {lessons.map((item, index) => <View key={index} style={styles.lessonItem}><Text style={[title, { fontSize: 20, lineHeight: 32 }]}>{t.cards[index][0]}</Text><Text style={[body, { fontSize: 16 * factor, lineHeight: 27 * factor }]}>{pick(lang, item)}</Text></View>)}
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  </View>;
}
const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  hero: { minHeight: 155, justifyContent: 'center', marginVertical: 10 },
  heroArt: { position: 'absolute', top: 0, right: -14, width: '63%', height: '100%', opacity: 0.75 },
  heroCopy: { width: '62%', paddingVertical: 8 }, rule: { height: 1, width: 105, marginBottom: 9 },
  sectionTitle: { fontSize: 21, lineHeight: 34, marginTop: 16, marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 12 },
  card: { borderWidth: 1, borderRadius: 14, overflow: 'hidden' }, cardLarge: { flexDirection: 'row', alignItems: 'center' },
  art: { width: '100%', aspectRatio: 1.5 }, artLarge: { width: '36%', aspectRatio: 1 },
  cardCopy: { flexGrow: 1, flexShrink: 1, minWidth: 0, padding: 12 }, arrowEnd: { alignItems: 'flex-end', marginTop: 8 },
  arrow: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  info: { borderWidth: 1, borderRadius: 14, padding: 12, gap: 12, marginTop: 16, flexDirection: 'row', alignItems: 'center', minHeight: 88 },
  book: { width: 55, height: 60 },
  practice: { borderWidth: 1, borderRadius: 14, padding: 12, gap: 12, marginTop: 12, marginBottom: 12, flexDirection: 'row', alignItems: 'center', minHeight: 110 },
  planets: { width: 100, height: 100 }, planetsLarge: { width: 66, height: 66 }, pressed: { opacity: 0.72 },
  backdrop: { flex: 1, justifyContent: 'flex-end' }, sheet: { maxHeight: '85%', borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  sheetHead: { flexDirection: 'row', alignItems: 'flex-start', padding: 20, gap: 12 },
  close: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  lesson: { padding: 20, paddingTop: 0 }, lessonItem: { marginBottom: 22 },
});
