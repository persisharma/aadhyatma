import React, { useCallback, useState } from 'react';
import { Alert, AppState, Platform, Pressable, ScrollView, StyleSheet, Text, View, type TextStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import ReaderHeader from '@/components/ReaderHeader';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage, type Lang } from '@/data/gita/language';
import { contentByLang, pick } from '@/utils/localize';
import { fontFamilies } from '@/theme/typography';
import { radii, spacing } from '@/theme/spacing';
import { eyebrowTextStyle, scriptBodyFont, scriptTitleFont } from '@/utils/langType';
import { isWidgetPinSupported, readWidgetPayload, requestPinWidget } from '@/widgets/native';
import { WIDGET_TIME_ZONE, widgetDateKey, type WidgetPayloadState } from '@/widgets/contract';
import { widgetCatalogEntry, widgetSizeLabel, type WidgetContent } from '@/widgets/catalog';
import { flowedVerse } from '@/widgets/planner';
import type { MoreStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<MoreStackParamList, 'WidgetGallery'>;

export default function WidgetGalleryScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const { lang } = useGitaLanguage();
  const [payloadState, setPayloadState] = useState<WidgetPayloadState>({ kind: 'missing' });
  const [pinSupported, setPinSupported] = useState(false);
  const titleFont = scriptTitleFont(lang, fontFamilies.devanagariBold);
  const bodyFont = scriptBodyFont(lang, fontFamilies.devanagari);
  // Card eyebrow follows the app's eyebrow convention (design.md §48/§55): italic
  // Cormorant + tracking for en, script serif with NO tracking for hi/gu/kn — the
  // previous hand-rolled Inter + letterSpacing split the Devanagari shirorekha.
  const eyebrowStyle = eyebrowTextStyle(lang, 11);

  const refresh = useCallback(() => { readWidgetPayload().then(setPayloadState); }, []);
  useFocusEffect(useCallback(() => {
    refresh();
    isWidgetPinSupported().then(setPinSupported);
    const interval = setInterval(refresh, 5_000);
    const sub = AppState.addEventListener('change', (state) => { if (state === 'active') refresh(); });
    return () => { clearInterval(interval); sub.remove(); };
  }, [refresh]));

  const now = new Date();
  const day = payloadState.kind === 'ready'
    ? payloadState.payload.panchang.days.find((item) => item.dateKey === widgetDateKey(now, WIDGET_TIME_ZONE))
    : undefined;
  const verse = payloadState.kind === 'ready'
    ? payloadState.payload.verses.days.find((item) => item.dateKey === widgetDateKey(now, payloadState.payload.verses.timeZone))
    : undefined;
  // The japam slice is a single-day snapshot, not a window: guard it against the
  // day boundary exactly like panchang/verse so a yesterday count is never shown
  // as today's (PRD §3.5; the native iOS widget applies the same guard).
  const japam = payloadState.kind === 'ready'
    && payloadState.payload.japam.dateKey === widgetDateKey(now, payloadState.payload.japam.timeZone)
    ? payloadState.payload.japam
    : undefined;
  const recovery = payloadState.kind === 'expired'
    ? pick(lang, { hi: 'विजेट ताज़ा करने हेतु वेदांश़ खोलें', en: 'Open Vedansh to refresh widgets', gu: 'વિજેટ તાજું કરવા વેદાંશ઼ ખોલો', kn: 'ವಿಜೆಟ್ ನವೀಕರಿಸಲು ವೇದಾಂಶ಼ ತೆರೆಯಿರಿ' })
    : pick(lang, { hi: 'विजेट तैयार करने हेतु वेदांश़ खोलें', en: 'Open Vedansh to prepare widgets', gu: 'વિજેટ તૈયાર કરવા વેદાંશ઼ ખોલો', kn: 'ವಿಜೆಟ್ ಸಿದ್ಧಪಡಿಸಲು ವೇದಾಂಶ಼ ತೆರೆಯಿರಿ' });

  const pin = async (content: WidgetContent) => {
    const opened = await requestPinWidget(content);
    if (!opened) Alert.alert('Widgets', pick(lang, { hi: 'होम स्क्रीन को दबाकर रखें, फिर विजेट चुनें।', en: 'Long-press the Home Screen, then choose Widgets.', gu: 'હોમ સ્ક્રીન દબાવી રાખો, પછી Widgets પસંદ કરો.', kn: 'ಹೋಮ್ ಸ್ಕ್ರೀನ್ ಒತ್ತಿಹಿಡಿದು Widgets ಆಯ್ಕೆಮಾಡಿ.' }));
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.parchment }]} edges={['top', 'left', 'right']}>
      <ReaderHeader title={contentByLang(lang, 'होम-स्क्रीन विजेट', 'Home-Screen Widgets')} onBack={navigation.goBack} variant="index" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={[styles.intro, { color: colors.inkMuted, fontFamily: bodyFont }]}>
          {pick(lang, { hi: 'हर विजेट अलग है — जो चाहें, जिस आकार में चाहें जोड़ें। श्लोक चौड़े आकार में पूरा दिखता है, पंचांग छोटे में एक नज़र का रहता है।', en: 'Each widget is separate — add the one you want, in the size you want. The verse reads whole at Wide; the Panchang stays a glance at Small.', gu: 'દરેક વિજેટ અલગ છે — જે જોઈએ તે, જે કદમાં જોઈએ તે ઉમેરો. શ્લોક પહોળામાં આખો દેખાય છે, પંચાંગ નાનામાં એક નજરનું રહે છે.', kn: 'ಪ್ರತಿ ವಿಜೆಟ್ ಪ್ರತ್ಯೇಕ — ಬೇಕಾದದ್ದನ್ನು, ಬೇಕಾದ ಗಾತ್ರದಲ್ಲಿ ಸೇರಿಸಿ. ಶ್ಲೋಕ ಅಗಲದಲ್ಲಿ ಪೂರ್ಣ ಕಾಣುತ್ತದೆ, ಪಂಚಾಂಗ ಚಿಕ್ಕದರಲ್ಲಿ ಒಂದೇ ನೋಟ.' })}
        </Text>
        <View style={styles.grid}>
          <Preview content="verse" title={contentByLang(lang, 'आज का श्लोक', 'Today’s verse')} accessibilityLabel="Daily verse widget preview" colors={colors} eyebrowStyle={eyebrowStyle} lang={lang} bodyFont={bodyFont} pinSupported={pinSupported} onPin={pin}>
            {/* The facsimile stands in for the recommended (wide) cell, which
                renders the whole verse flowed across three lines — not the
                small-cell excerpt (design.md §59). */}
            <Text numberOfLines={3} style={[styles.verse, { color: colors.ink, fontFamily: bodyFont }]}>{verse ? flowedVerse(verse.lines[lang]) : recovery}</Text>
            {verse ? <Text style={[styles.meta, { color: colors.inkMuted }]}>{verse.source[lang]}</Text> : null}
          </Preview>
          <Preview content="panchang" title={contentByLang(lang, 'आज का पंचांग', 'Today’s Panchang')} accessibilityLabel="Panchang widget preview" colors={colors} eyebrowStyle={eyebrowStyle} lang={lang} bodyFont={bodyFont} pinSupported={pinSupported} onPin={pin}>
            <Text style={[styles.headline, { color: colors.ink, fontFamily: titleFont }]}>{day?.tithi[lang] ?? recovery}</Text>
            {day ? <Text style={[styles.meta, { color: colors.inkMuted }]}>{day.representedDate[lang]} · {day.sunrise[lang]} · {day.rahuKaal[lang]}</Text> : null}
          </Preview>
          <Preview content="japam" title={contentByLang(lang, 'जप-साधना', 'Japam practice')} accessibilityLabel="Japam widget preview" colors={colors} eyebrowStyle={eyebrowStyle} lang={lang} bodyFont={bodyFont} pinSupported={pinSupported} onPin={pin}>
            <Text style={[styles.headline, { color: colors.ink, fontFamily: titleFont }]}>{japam ? `${japam.totalBeads} / 108` : recovery}</Text>
            {japam ? <Text style={[styles.meta, { color: colors.inkMuted }]}>{japam.totalRounds} {contentByLang(lang, 'माला', 'rounds')} · {japam.japaStreak} {contentByLang(lang, 'जप-दिन', 'Japam days')}</Text> : null}
          </Preview>
        </View>
        <View style={[styles.instructions, { backgroundColor: colors.parchmentSoft, borderColor: colors.divider }]}>
          <Text style={[styles.instructionsTitle, { color: colors.ink, fontFamily: titleFont }]}>{contentByLang(lang, 'कैसे जोड़ें', 'How to add')}</Text>
          <Text style={[styles.instruction, { color: colors.inkSoft, fontFamily: bodyFont }]}>{Platform.OS === 'ios'
            ? pick(lang, { hi: '1. होम स्क्रीन को दबाकर रखें  2. संपादित करें या + चुनें  3. “Vedansh” खोजें  4. विजेट चुनें, बग़ल में स्वाइप कर आकार चुनें, फिर जोड़ें', en: '1. Long-press the Home Screen  2. Tap Edit or +  3. Search “Vedansh”  4. Pick a widget, swipe sideways for its size, then add it', gu: '1. હોમ સ્ક્રીન દબાવી રાખો  2. Edit અથવા +  3. “Vedansh” શોધો  4. વિજેટ પસંદ કરો, બાજુમાં સ્વાઇપ કરી કદ પસંદ કરો, પછી ઉમેરો', kn: '1. ಹೋಮ್ ಸ್ಕ್ರೀನ್ ಒತ್ತಿಹಿಡಿಯಿರಿ  2. Edit ಅಥವಾ +  3. “Vedansh” ಹುಡುಕಿ  4. ವಿಜೆಟ್ ಆಯ್ಕೆಮಾಡಿ, ಪಕ್ಕಕ್ಕೆ ಸ್ವೈಪ್ ಮಾಡಿ ಗಾತ್ರ ಆರಿಸಿ, ನಂತರ ಸೇರಿಸಿ' })
            : pick(lang, { hi: 'होम स्क्रीन को दबाकर रखें, Widgets खोलें और Vedansh चुनें। जोड़ने के बाद विजेट को दबाकर रखें और किनारे खींचकर आकार बदलें।', en: 'Long-press the Home Screen, open Widgets, and choose Vedansh. After adding, long-press the widget and drag its edges to resize.', gu: 'હોમ સ્ક્રીન દબાવી રાખો, Widgets ખોલો અને Vedansh પસંદ કરો. ઉમેર્યા પછી વિજેટ દબાવી રાખી કિનારી ખેંચીને કદ બદલો.', kn: 'ಹೋಮ್ ಸ್ಕ್ರೀನ್ ಒತ್ತಿಹಿಡಿದು Widgets ತೆರೆಯಿರಿ ಮತ್ತು Vedansh ಆಯ್ಕೆಮಾಡಿ. ಸೇರಿಸಿದ ನಂತರ ವಿಜೆಟ್ ಒತ್ತಿಹಿಡಿದು ಅಂಚುಗಳನ್ನು ಎಳೆದು ಗಾತ್ರ ಬದಲಿಸಿ.' })}</Text>
        </View>
        <Text style={[styles.note, { color: colors.inkMuted, fontFamily: bodyFont }]}>{contentByLang(lang, 'विजेट पुराने आँकड़ों को आज का बताकर नहीं दिखाते।', 'Widgets never present stale information as today’s.')}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

type PreviewProps = {
  content: WidgetContent;
  title: string;
  accessibilityLabel: string;
  colors: ReturnType<typeof useTheme>['colors'];
  eyebrowStyle: TextStyle;
  lang: Lang;
  bodyFont: string;
  pinSupported: boolean;
  onPin: (content: WidgetContent) => void;
  children: React.ReactNode;
};

// One card per widget kind: the facsimile, the sizes that kind can be placed at
// (its best size marked), and — where the launcher supports pinning — an add
// action for that kind alone. The sizes come from the shared catalog the native
// surfaces mirror, so this screen can never advertise a size iOS/Android refuses.
function Preview({ content, title, accessibilityLabel, colors, eyebrowStyle, lang, bodyFont, pinSupported, onPin, children }: PreviewProps) {
  const entry = widgetCatalogEntry(content);
  const canPin = Platform.OS === 'android' && !!entry.androidProvider;
  const best = pick(lang, { hi: 'सुझाव', en: 'best', gu: 'સૂચિત', kn: 'ಶಿಫಾರಸು' });
  const sizeLabels = entry.sizes.map((size) => `${widgetSizeLabel(size, lang)}${size === entry.recommended ? ` · ${best}` : ''}`);
  return <View style={[styles.card, { backgroundColor: colors.parchmentSoft, borderColor: colors.divider }]}>
    {/* Eyebrow row: section label left, ॐ mark right — the mark owns no line of
        its own on any Vedansh widget (design.md §59), and the facsimile has to
        show the same card the launcher will. */}
    <View accessible accessibilityRole="image" accessibilityLabel={accessibilityLabel} style={styles.preview}>
      <View style={styles.eyebrowRow}>
        <Text numberOfLines={1} style={[eyebrowStyle, styles.eyebrow, { color: colors.saffronDeep }]}>{title}</Text>
        <Text style={[styles.brand, { color: colors.gold }]}>ॐ वेदांश़</Text>
      </View>
      {children}
    </View>
    <View accessible accessibilityLabel={`${pick(lang, { hi: 'आकार', en: 'Sizes', gu: 'કદ', kn: 'ಗಾತ್ರ' })}: ${sizeLabels.join(', ')}`} style={styles.sizeRow}>
      {entry.sizes.map((size, index) => {
        const recommended = size === entry.recommended;
        return <View key={size} style={[styles.sizeChip, { backgroundColor: recommended ? colors.saffronTint : 'transparent', borderColor: colors.divider }]}>
          <Text style={[styles.sizeText, { color: recommended ? colors.saffronDeep : colors.inkMuted, fontFamily: bodyFont }]}>{sizeLabels[index]}</Text>
        </View>;
      })}
    </View>
    {canPin ? <Pressable testID={`widget-add-${content}`} accessibilityRole="button" accessibilityLabel={`Add Vedansh ${content} widget`} onPress={() => onPin(content)} style={({ pressed }) => [styles.button, { backgroundColor: colors.saffronDeep }, pressed && { opacity: .75 }]}>
      <Text style={[styles.buttonText, { color: colors.onPrimary }]}>{pinSupported ? contentByLang(lang, 'यह विजेट जोड़ें', 'Add this widget') : contentByLang(lang, 'जोड़ने के चरण देखें', 'View add steps')}</Text>
    </Pressable> : null}
  </View>;
}

const styles = StyleSheet.create({
  // Geometry snaps to the shared spacing/radii scales (design.md §3/§4). The
  // preview cards borrow the card-family corner (radii.lg) and the CTA is a pill.
  // Font sizes here are layout-tuned facsimile chrome for the widget previews (see
  // design.md §59) and stay ≥10 pt per the chrome floor.
  root: { flex: 1 }, scroll: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl + spacing.lg }, intro: { fontSize: 15, lineHeight: 23, marginBottom: spacing.xl }, grid: { gap: spacing.md }, card: { borderRadius: radii.lg, borderWidth: 1, padding: spacing.lg }, preview: { minHeight: 142, justifyContent: 'space-between' }, verse: { fontSize: 18, lineHeight: 29, marginVertical: spacing.md }, headline: { fontSize: 22, lineHeight: 31, marginVertical: spacing.md }, meta: { fontFamily: fontFamilies.inter, fontSize: 12, lineHeight: 18 }, eyebrowRow: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm }, eyebrow: { flexShrink: 1 }, brand: { fontFamily: fontFamilies.devanagariBold, fontSize: 11, marginLeft: 'auto' }, sizeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.md }, sizeChip: { borderWidth: 1, borderRadius: radii.pill, paddingHorizontal: spacing.sm, paddingVertical: 4 }, sizeText: { fontSize: 12, lineHeight: 18 }, instructions: { borderWidth: 1, borderRadius: radii.lg, padding: spacing.lg, marginTop: spacing.xxl }, instructionsTitle: { fontSize: 20, marginBottom: spacing.sm }, instruction: { fontSize: 14, lineHeight: 23 }, button: { minHeight: 48, borderRadius: radii.pill, alignItems: 'center', justifyContent: 'center', marginTop: spacing.md }, buttonText: { fontFamily: fontFamilies.interSemiBold, fontSize: 15 }, note: { fontSize: 13, lineHeight: 20, textAlign: 'center', marginTop: spacing.lg },
});
