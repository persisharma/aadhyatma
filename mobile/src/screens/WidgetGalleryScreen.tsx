import React, { useCallback, useEffect, useState } from 'react';
import { Alert, AppState, Image, ImageBackground, Platform, Pressable, ScrollView, StyleSheet, Text, View, type TextStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
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
import { WIDGET_TEXT_TOKENS, widgetBackgroundName, widgetCatalogEntry, widgetSizeLabel, type WidgetContent } from '@/widgets/catalog';
import { widgetBackgroundImages } from '@assets/widget-backgrounds';
import { widgetAppearance, WIDGET_APPEARANCE_TOKENS, type WidgetAppearance } from '@/widgets/appearance';
import { widgetHeritageName } from '@/widgets/heritage';
import { flowedVerse, runningTithi } from '@/widgets/planner';
import type { MoreStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<MoreStackParamList, 'WidgetGallery'>;

function istClock(raw: string): string {
  const minute = Math.floor(Date.parse(raw) / 60000);
  if (!Number.isFinite(minute)) return '—';
  const ist = ((minute + 330) % 1440 + 1440) % 1440;
  return String(Math.floor(ist / 60)).padStart(2, '0') + ':' + String(ist % 60).padStart(2, '0');
}


export default function WidgetGalleryScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const { lang } = useGitaLanguage();
  const [payloadState, setPayloadState] = useState<WidgetPayloadState>({ kind: 'missing' });
  const [pinSupported, setPinSupported] = useState(false);
  const [heritageImages, setHeritageImages] = useState<Record<string, number>>({});
  const [vividImages, setVividImages] = useState<Record<string, number>>({});
  useEffect(() => {
    let live = true;
    import('@assets/widget-backgrounds/heritage').then((module) => { if (live) setHeritageImages(module.widgetHeritageImages); });
    import('@/widgets/approvedPaintings').then((module) => { if (live) setVividImages(module.vividHeritageImages); });
    return () => { live = false; };
  }, []);
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
  const appearance = payloadState.kind === 'ready' ? widgetAppearance(payloadState.payload, now) : 'day';
  const palette = WIDGET_APPEARANCE_TOKENS[appearance];
  const versePalette = verse ? palette : WIDGET_APPEARANCE_TOKENS.day;
  // The gallery is a medium-cell facsimile. The native iOS widget measures
  // actual glyphs with ViewThatFits; this conservative approximation similarly
  // gives text more width before shrinking it on a crowded verse.
  const previewVerseLength = verse ? flowedVerse(verse.lines[lang]).length : 0;
  const previewVerseDense = previewVerseLength > 105;
  const previewVerseMedium = previewVerseLength > 64;
  const verseArtPadding = previewVerseDense ? spacing.md : previewVerseMedium ? 52 : 90;
  const panchangPalette = day ? palette : WIDGET_APPEARANCE_TOKENS.day;
  const tithi = day ? runningTithi(day, now) : undefined;
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
          {pick(lang, { hi: 'हर विजेट का अपना आकार है। चौड़े में श्लोक के लिए अधिक जगह है, लंबे श्लोक टैप करके पूरे पढ़ें। छोटा पंचांग एक नज़र में दिखता है।', en: 'Each widget has its own sizes. Wide gives verses more room, and long verses open fully on tap; Small keeps the Panchang at a glance.', gu: 'દરેક વિજેટ અલગ છે — જે જોઈએ તે, જે કદમાં જોઈએ તે ઉમેરો. પહોળા વિજેટમાં શ્લોકને વધુ જગ્યા મળે છે; લાંબો શ્લોક ટૅપ કરીને આખો વાંચો. પંચાંગ નાનામાં એક નજરનું રહે છે.', kn: 'ಪ್ರತಿ ವಿಜೆಟ್ ಪ್ರತ್ಯೇಕ — ಬೇಕಾದದ್ದನ್ನು, ಬೇಕಾದ ಗಾತ್ರದಲ್ಲಿ ಸೇರಿಸಿ. ಅಗಲದ ವಿಜೆಟ್‌ನಲ್ಲಿ ಶ್ಲೋಕಕ್ಕೆ ಹೆಚ್ಚು ಜಾಗ; ದೀರ್ಘ ಶ್ಲೋಕವನ್ನು ಟ್ಯಾಪ್ ಮಾಡಿ ಸಂಪೂರ್ಣ ಓದಿ. ಪಂಚಾಂಗ ಚಿಕ್ಕದರಲ್ಲಿ ಒಂದೇ ನೋಟ.' })}
        </Text>
        <View style={styles.grid}>
          <Preview heritageImages={heritageImages} vividImages={vividImages} contentReady={!!verse} appearance={verse ? appearance : 'day'} subject={verse?.artKey ?? 'prayer'} content="verse" title={contentByLang(lang, 'आज का श्लोक', 'Today’s verse')} accessibilityLabel="Daily verse widget preview" verseArtPadding={verseArtPadding} colors={colors} eyebrowStyle={eyebrowStyle} lang={lang} bodyFont={bodyFont} pinSupported={pinSupported} onPin={pin}>
            {/* The facsimile stands in for the recommended (wide) cell, which
                renders the whole verse flowed across three lines — not the
                small-cell excerpt (design.md §59). */}
            <Text numberOfLines={4} style={[styles.verse, { color: versePalette.ink, fontFamily: bodyFont, fontSize: previewVerseDense ? 14 : previewVerseMedium ? 16 : 18, lineHeight: previewVerseDense ? 22 : previewVerseMedium ? 25 : 29 }]}>{verse ? flowedVerse(verse.lines[lang]) : recovery}</Text>
            {verse ? <Text numberOfLines={2} style={[styles.meta, { color: versePalette.inkMuted, fontFamily: bodyFont }]}>{verse.source[lang]}</Text> : null}
            {verse && previewVerseDense ? <Text style={[styles.meta, { color: versePalette.accent, fontFamily: bodyFont }]}>{pick(lang, { hi: 'पूरा श्लोक पढ़ें ›', en: 'Tap to read full verse ›', gu: 'આખો શ્લોક વાંચો ›', kn: 'ಪೂರ್ಣ ಶ್ಲೋಕ ಓದಿ ›' })}</Text> : null}
          </Preview>
          <Preview heritageImages={heritageImages} vividImages={vividImages} contentReady={!!day} appearance={day ? appearance : 'day'} subject="panchang" content="panchang" title={day && payloadState.kind === 'ready' ? `${day.representedDate[lang]} · ${payloadState.payload.panchang.cityLabel[lang]}` : contentByLang(lang, 'आज का पंचांग', 'Today’s Panchang')} accessibilityLabel="Panchang widget preview" colors={colors} eyebrowStyle={eyebrowStyle} lang={lang} bodyFont={bodyFont} pinSupported={pinSupported} onPin={pin}>
            {day && tithi && payloadState.kind === 'ready' ? <View style={{ gap: 6, justifyContent: 'center', flex: 1 }}>
              <Text numberOfLines={1} style={{ color: panchangPalette.accent, fontSize: 11, fontFamily: bodyFont }}>{day.representedDate[lang]} · {payloadState.payload.panchang.cityLabel[lang]}</Text>
              <View style={{ flexDirection: 'row', gap: 7, alignItems: 'center' }}>
                <View style={{ height: 36, width: 36, borderRadius: 18, borderWidth: 1, borderColor: panchangPalette.gold, alignItems: 'center', justifyContent: 'center', backgroundColor: appearance === 'night' ? '#182C43' : '#F0DFBD' }}>
                  <View style={{ width: 23, height: 23, borderRadius: 12, backgroundColor: panchangPalette.inkMuted }}>
                    <View style={{ position: 'absolute', top: -2, right: -5, width: 23, height: 23, borderRadius: 12, backgroundColor: appearance === 'night' ? '#182C43' : '#F0DFBD' }} />
                  </View>
                </View>
                <Text numberOfLines={2} style={{ color: panchangPalette.ink, fontFamily: titleFont, fontSize: 23, lineHeight: 32, flexShrink: 1 }}>{tithi.name[lang]}</Text>
              </View>
              {tithi.till ? <Text numberOfLines={1} style={{ fontSize: 10, color: panchangPalette.inkMuted, fontFamily: bodyFont }}>{tithi.till[lang]}</Text> : null}
              {day.vrat ? <Text numberOfLines={2} style={{ fontSize: 13, lineHeight: 20, color: panchangPalette.ink, fontFamily: bodyFont }}>✦ {day.vrat[lang]}</Text> : null}
              <View style={{ height: 1, backgroundColor: panchangPalette.gold, opacity: 0.65 }} />
              <View style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' }}>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: 10, color: panchangPalette.accent, fontFamily: bodyFont }}>{pick(lang, { hi: 'सूर्योदय', en: 'Sunrise', gu: 'સૂર્યોદય', kn: 'ಸೂರ್ಯೋದಯ' })}</Text>
                  <Text style={{ fontSize: 14, color: panchangPalette.ink, fontFamily: bodyFont }}>{day.sunrise[lang].split(' ').slice(-1)[0]}</Text>
                </View>
                {day.sunsetAt ? <View style={{ alignItems: 'center', borderLeftWidth: 1, borderLeftColor: panchangPalette.gold, paddingLeft: 12 }}>
                  <Text style={{ fontSize: 10, color: panchangPalette.accent, fontFamily: bodyFont }}>{pick(lang, { hi: 'सूर्यास्त', en: 'Sunset', gu: 'સૂર્યાસ્ત', kn: 'ಸೂರ್ಯಾಸ್ತ' })}</Text>
                  <Text style={{ fontSize: 14, color: panchangPalette.ink, fontFamily: bodyFont }}>{istClock(day.sunsetAt)}</Text>
                </View> : null}
              </View>
            </View> : <Text style={[styles.headline, { color: panchangPalette.ink, fontFamily: titleFont }]}>{recovery}</Text>}
          </Preview>
          <Preview content="japam" title={contentByLang(lang, 'जप-साधना', 'Japam practice')} accessibilityLabel="Japam widget preview" colors={colors} eyebrowStyle={eyebrowStyle} lang={lang} bodyFont={bodyFont} pinSupported={pinSupported} onPin={pin}>
            <Text style={[styles.headline, { color: colors.ink, fontFamily: titleFont }]}>{japam ? `${japam.totalBeads} / 108` : recovery}</Text>
            {japam ? <Text style={[styles.meta, { color: WIDGET_TEXT_TOKENS.inkMuted }]}>{japam.totalRounds} {contentByLang(lang, 'माला', 'rounds')} · {japam.japaStreak} {contentByLang(lang, 'जप-दिन', 'Japam days')}</Text> : null}
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
  heritageImages?: Record<string, number>;
  vividImages?: Record<string, number>;
  contentReady?: boolean;
  appearance?: WidgetAppearance;
  subject?: string;
  verseArtPadding?: number;
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
function Preview({ heritageImages = {}, vividImages = {}, contentReady = true, appearance = 'day', subject = 'prayer', verseArtPadding = 90, content, title, accessibilityLabel, colors, eyebrowStyle, lang, bodyFont, pinSupported, onPin, children }: PreviewProps) {
  const entry = widgetCatalogEntry(content);
  const canPin = Platform.OS === 'android' && !!entry.androidProvider;
  const best = pick(lang, { hi: 'सुझाव', en: 'best', gu: 'સૂચિત', kn: 'ಶಿಫಾರಸು' });
  const sizeLabels = entry.sizes.map((size) => `${widgetSizeLabel(size, lang)}${size === entry.recommended ? ` · ${best}` : ''}`);
  // The same sketch plate the native widget draws at this kind's recommended size;
  // without one the card is the plain parchment it was.
  const palette = WIDGET_APPEARANCE_TOKENS[appearance];
  const art = !contentReady || entry.recommended === 'lock' ? undefined : content === 'japam' ? widgetBackgroundImages[widgetBackgroundName(content, entry.recommended)] : heritageImages[widgetHeritageName(subject, entry.recommended, appearance)];
  const vivid = contentReady && appearance === 'day' && content !== 'japam' ? vividImages[subject] : undefined;
  const cardStyle = [styles.card, { backgroundColor: colors.parchmentSoft, borderColor: colors.divider }];
  const previewStyle = [styles.preview, content === 'panchang' && { width: 190, minHeight: 190 }, { padding: spacing.md, paddingRight: content === 'verse' && art ? verseArtPadding : spacing.md, backgroundColor: palette.background, borderRadius: radii.lg }];
  const previewBody = <View accessible accessibilityRole="image" accessibilityLabel={accessibilityLabel} style={previewStyle}>
    {vivid ? <View pointerEvents="none" style={[StyleSheet.absoluteFillObject, { overflow: 'hidden', borderRadius: radii.lg }]}>
      <Image source={vivid} resizeMode="cover" style={{ position: 'absolute', right: 0, top: 0, width: content === 'panchang' ? '38%' : '55%', height: content === 'panchang' ? '53%' : '100%' }} />
      <LinearGradient colors={[palette.background, palette.background + 'CC', palette.background + '00']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFillObject} />
    </View> : null}
    {content === 'verse' ? <>
      <Text style={{ textAlign: 'center', fontFamily: fontFamilies.devanagariBold, fontSize: 15, color: palette.ink }}>✦ ॐ वेदांश ✦</Text>
      <View style={{ backgroundColor: palette.accent, paddingVertical: 4, paddingHorizontal: 8, borderRadius: 7, alignSelf: 'flex-start' }}>
        <Text style={[eyebrowStyle, { color: appearance === 'night' ? '#091A32' : '#FFF4DC', fontSize: 11 }]}>{title}</Text>
      </View>
    </> : content === 'japam' ? <Text style={[eyebrowStyle, { color: palette.accent }]}>{title}</Text> : null}
    {children}
    {content === 'japam' ? <Text style={[styles.brand, { color: palette.gold }]}>ॐ वेदांश़</Text> : null}
    {content !== 'japam' ? <View pointerEvents="none" style={[StyleSheet.absoluteFillObject, { borderWidth: 1, borderColor: palette.gold, borderRadius: radii.lg }]} /> : null}
  </View>;
  const body = <>
    {art ? <ImageBackground testID={`widget-art-${content}`} source={art} resizeMode="cover" style={[styles.preview, content === 'panchang' && { width: 190, minHeight: 190 }]} imageStyle={styles.cardArt}>
      {React.cloneElement(previewBody, { style: [previewStyle, { backgroundColor: 'transparent' }] })}
    </ImageBackground> : previewBody}
    <View accessible accessibilityLabel={`${pick(lang, { hi: 'आकार', en: 'Sizes', gu: 'કદ', kn: 'ಗಾತ್ರ' })}: ${sizeLabels.join(', ')}`} style={styles.sizeRow}>
      {entry.sizes.map((size, index) => {
        const recommended = size === entry.recommended;
        return <View key={size} style={[styles.sizeChip, { backgroundColor: recommended ? colors.saffronTint : 'transparent', borderColor: colors.divider }]}>
          <Text style={[styles.sizeText, { color: recommended ? WIDGET_TEXT_TOKENS.saffronDeep : WIDGET_TEXT_TOKENS.inkMuted, fontFamily: bodyFont }]}>{sizeLabels[index]}</Text>
        </View>;
      })}
    </View>
    {canPin ? <Pressable testID={`widget-add-${content}`} accessibilityRole="button" accessibilityLabel={`Add Vedansh ${content} widget`} onPress={() => onPin(content)} style={({ pressed }) => [styles.button, { backgroundColor: colors.saffronDeep }, pressed && { opacity: .75 }]}>
      <Text style={[styles.buttonText, { color: colors.onPrimary }]}>{pinSupported ? contentByLang(lang, 'यह विजेट जोड़ें', 'Add this widget') : contentByLang(lang, 'जोड़ने के चरण देखें', 'View add steps')}</Text>
    </Pressable> : null}
  </>;
  return <View style={cardStyle}>{body}</View>;
}

const styles = StyleSheet.create({
  // Geometry snaps to the shared spacing/radii scales (design.md §3/§4). The
  // preview cards borrow the card-family corner (radii.lg) and the CTA is a pill.
  // Font sizes here are layout-tuned facsimile chrome for the widget previews (see
  // design.md §59) and stay ≥10 pt per the chrome floor.
  root: { flex: 1 }, scroll: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl + spacing.lg }, intro: { fontSize: 15, lineHeight: 23, marginBottom: spacing.xl }, grid: { gap: spacing.md }, card: { borderRadius: radii.lg, borderWidth: 1, padding: spacing.lg }, cardArt: { borderRadius: radii.lg }, preview: { minHeight: 142, justifyContent: 'space-between' }, verse: { fontSize: 18, lineHeight: 29, marginVertical: spacing.md }, headline: { fontSize: 22, lineHeight: 33, marginVertical: spacing.md }, meta: { fontFamily: fontFamilies.inter, fontSize: 12, lineHeight: 18 }, brand: { fontFamily: fontFamilies.devanagariBold, fontSize: 11, marginTop: spacing.md }, sizeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.md }, sizeChip: { borderWidth: 1, borderRadius: radii.pill, paddingHorizontal: spacing.sm, paddingVertical: 4 }, sizeText: { fontSize: 12, lineHeight: 18 }, instructions: { borderWidth: 1, borderRadius: radii.lg, padding: spacing.lg, marginTop: spacing.xxl }, instructionsTitle: { fontSize: 20, marginBottom: spacing.sm }, instruction: { fontSize: 14, lineHeight: 23 }, button: { minHeight: 48, borderRadius: radii.pill, alignItems: 'center', justifyContent: 'center', marginTop: spacing.md }, buttonText: { fontFamily: fontFamilies.interSemiBold, fontSize: 15 }, note: { fontSize: 13, lineHeight: 20, textAlign: 'center', marginTop: spacing.lg },
});

