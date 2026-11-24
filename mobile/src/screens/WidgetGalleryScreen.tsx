import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, AppState, ImageBackground, Platform, Pressable, ScrollView, StyleSheet, Text, View, type TextStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import ReaderHeader from '@/components/ReaderHeader';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage, type Lang } from '@/data/gita/language';
import { contentByLang, pick } from '@/utils/localize';
import { fontFamilies } from '@/theme/typography';
import { radii, spacing } from '@/theme/spacing';
import { eyebrowTextStyle, scriptBodyFont, scriptTitleFont, titleLeading } from '@/utils/langType';
import { isWidgetPinSupported, readWidgetPayload, requestPinWidget } from '@/widgets/native';
import { widgetPayloadKey } from '@/utils/widgetPayloadKey';
import { WIDGET_TIME_ZONE, widgetDateKey, type WidgetPayloadState, widgetText, widgetLines } from '@/widgets/contract';
import { WIDGET_TEXT_TOKENS, widgetBackgroundName, widgetCatalogEntry, widgetSizeLabel, type WidgetContent } from '@/widgets/catalog';
import { widgetBackgroundImages } from '@assets/widget-backgrounds';
import { widgetAppearance, WIDGET_APPEARANCE_TOKENS, type WidgetAppearance } from '@/widgets/appearance';
import { widgetHeritageName } from '@/widgets/heritage';
import { flowedVerse, runningTithi } from '@/widgets/planner';
import type { MoreStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<MoreStackParamList, 'WidgetGallery'>;

export default function WidgetGalleryScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const { lang } = useGitaLanguage();
  const [payloadState, setPayloadState] = useState<WidgetPayloadState>({ kind: 'missing' });
  const [pinSupported, setPinSupported] = useState(false);
  const [heritageImages, setHeritageImages] = useState<Record<string, number>>({});
  useEffect(() => {
    let live = true;
    import('@assets/widget-backgrounds/heritage').then((module) => { if (live) setHeritageImages(module.widgetHeritageImages); });
    return () => { live = false; };
  }, []);
  const titleFont = scriptTitleFont(lang, fontFamilies.devanagariBold);
  const bodyFont = scriptBodyFont(lang, fontFamilies.devanagari);
  // Card eyebrow follows the app's eyebrow convention (design.md §48/§55): italic
  // Cormorant + tracking for en, script serif with NO tracking for hi/gu/kn — the
  // previous hand-rolled Inter + letterSpacing split the Devanagari shirorekha.
  const eyebrowStyle = eyebrowTextStyle(lang, 11);

  // The poll below decodes to a new object every time; only set state when the
  // payload actually changed, so an idle gallery does not re-render every 5 s.
  const lastPayloadKey = useRef('');
  const refresh = useCallback(() => {
    readWidgetPayload()
      .then((next) => {
        const key = widgetPayloadKey(next);
        if (key === lastPayloadKey.current) return;
        lastPayloadKey.current = key;
        setPayloadState(next);
      })
      .catch(() => undefined);
  }, []);
  useFocusEffect(useCallback(() => {
    refresh();
    isWidgetPinSupported().then(setPinSupported).catch(() => undefined);
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
  const previewVerseLength = verse ? flowedVerse(widgetLines(verse.lines, lang), widgetText(verse.source, lang)).length : 0;
  const previewVerseDense = previewVerseLength > 105;
  const previewVerseMedium = previewVerseLength > 64;
  const verseArtPadding = previewVerseDense ? spacing.md : previewVerseMedium ? 52 : 90;
  const panchangPalette = day ? palette : WIDGET_APPEARANCE_TOKENS.day;
  const tithi = day ? runningTithi(day, now) : undefined;
  const recovery = payloadState.kind === 'expired'
    ? pick(lang, { hi: 'विजेट ताज़ा करने हेतु वेदांश़ खोलें', en: 'Open Vedansh to refresh widgets', gu: 'વિજેટ તાજું કરવા વેદાંશ઼ ખોલો', kn: 'ವಿಜೆಟ್ ನವೀಕರಿಸಲು ವೇದಾಂಶ಼ ತೆರೆಯಿರಿ', mr: 'विजेट ताजे करण्यासाठी वेदांश़ उघडा', te: 'విడ్జెట్‌లను రిఫ్రెష్ చేయడానికి వేదాంశ్ తెరవండి' })
    : pick(lang, { hi: 'विजेट तैयार करने हेतु वेदांश़ खोलें', en: 'Open Vedansh to prepare widgets', gu: 'વિજેટ તૈયાર કરવા વેદાંશ઼ ખોલો', kn: 'ವಿಜೆಟ್ ಸಿದ್ಧಪಡಿಸಲು ವೇದಾಂಶ಼ ತೆರೆಯಿರಿ', mr: 'विजेट तयार करण्यासाठी वेदांश़ उघडा', te: 'విడ్జెట్‌లను సిద్ధం చేయడానికి వేదాంశ్ తెరవండి' });

  const pin = async (content: WidgetContent) => {
    const opened = await requestPinWidget(content);
    if (!opened) Alert.alert('Widgets', pick(lang, { hi: 'होम स्क्रीन को दबाकर रखें, फिर विजेट चुनें।', en: 'Long-press the Home Screen, then choose Widgets.', gu: 'હોમ સ્ક્રીન દબાવી રાખો, પછી Widgets પસંદ કરો.', kn: 'ಹೋಮ್ ಸ್ಕ್ರೀನ್ ಒತ್ತಿಹಿಡಿದು Widgets ಆಯ್ಕೆಮಾಡಿ.', mr: 'होम स्क्रीन दाबून धरा, मग Widgets निवडा.', te: 'హోమ్ స్క్రీన్‌ను నొక్కి పట్టుకుని, Widgets ఎంచుకోండి.' }));
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.parchment }]} edges={['top', 'left', 'right']}>
      <ReaderHeader title={contentByLang(lang, 'होम-स्क्रीन विजेट', 'Home-Screen Widgets')} onBack={navigation.goBack} variant="index" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={[styles.intro, { color: colors.inkMuted, fontFamily: bodyFont }]}>
          {pick(lang, { hi: 'हर विजेट का अपना आकार है। चौड़े में श्लोक के लिए अधिक जगह है, लंबे श्लोक टैप करके पूरे पढ़ें। छोटा पंचांग एक नज़र में दिखता है।', en: 'Each widget has its own sizes. Wide gives verses more room, and long verses open fully on tap; Small keeps the Panchang at a glance.', gu: 'દરેક વિજેટ અલગ છે — જે જોઈએ તે, જે કદમાં જોઈએ તે ઉમેરો. પહોળા વિજેટમાં શ્લોકને વધુ જગ્યા મળે છે; લાંબો શ્લોક ટૅપ કરીને આખો વાંચો. પંચાંગ નાનામાં એક નજરનું રહે છે.', kn: 'ಪ್ರತಿ ವಿಜೆಟ್ ಪ್ರತ್ಯೇಕ — ಬೇಕಾದದ್ದನ್ನು, ಬೇಕಾದ ಗಾತ್ರದಲ್ಲಿ ಸೇರಿಸಿ. ಅಗಲದ ವಿಜೆಟ್‌ನಲ್ಲಿ ಶ್ಲೋಕಕ್ಕೆ ಹೆಚ್ಚು ಜಾಗ; ದೀರ್ಘ ಶ್ಲೋಕವನ್ನು ಟ್ಯಾಪ್ ಮಾಡಿ ಸಂಪೂರ್ಣ ಓದಿ. ಪಂಚಾಂಗ ಚಿಕ್ಕದರಲ್ಲಿ ಒಂದೇ ನೋಟ.', mr: 'प्रत्येक विजेटचा स्वतःचा आकार आहे. रुंद विजेटमध्ये श्लोकाला अधिक जागा आहे; लांब श्लोक टॅप करून पूर्ण वाचा. लहान पंचांग एका दृष्टीक्षेपात दिसते.', te: 'ప్రతి విడ్జెట్‌కు దాని సొంత పరిమాణాలు ఉన్నాయి. వెడల్పాటి విడ్జెట్‌లో శ్లోకానికి ఎక్కువ చోటు; పొడవైన శ్లోకాన్ని ట్యాప్ చేసి పూర్తిగా చదవండి. చిన్న పంచాంగం ఒక్క చూపులో కనిపిస్తుంది.' })}
        </Text>
        <View style={styles.grid}>
          <Preview heritageImages={heritageImages} contentReady={!!verse} appearance={verse ? appearance : 'day'} subject={verse?.artKey ?? 'prayer'} content="verse" title={contentByLang(lang, 'आज का श्लोक', 'Today’s verse')} accessibilityLabel="Daily verse widget preview" verseArtPadding={verseArtPadding} colors={colors} eyebrowStyle={eyebrowStyle} lang={lang} bodyFont={bodyFont} pinSupported={pinSupported} onPin={pin}>
            {/* The facsimile stands in for the recommended (wide) cell, which
                renders the whole verse with authored line breaks — not the
                small-cell excerpt (design.md §59). */}
            <Text numberOfLines={4} style={[styles.verse, { color: versePalette.ink, fontFamily: bodyFont, fontSize: previewVerseDense ? 14 : previewVerseMedium ? 16 : 18, lineHeight: previewVerseDense ? 22 : previewVerseMedium ? 25 : 29 }]}>{verse ? flowedVerse(widgetLines(verse.lines, lang), widgetText(verse.source, lang)) : recovery}</Text>
            {verse ? <Text numberOfLines={2} style={[styles.meta, { color: versePalette.inkMuted, fontFamily: bodyFont }]}>{widgetText(verse.source, lang)}</Text> : null}
            {verse && previewVerseDense ? <Text style={[styles.meta, { color: versePalette.accent, fontFamily: bodyFont }]}>{pick(lang, { hi: 'पूरा श्लोक पढ़ें ›', en: 'Tap to read full verse ›', gu: 'આખો શ્લોક વાંચો ›', kn: 'ಪೂರ್ಣ ಶ್ಲೋಕ ಓದಿ ›', mr: 'पूर्ण श्लोक वाचा ›', te: 'పూర్తి శ్లోకం చదవండి ›' })}</Text> : null}
          </Preview>
          <Preview heritageImages={heritageImages} contentReady={!!day} appearance={day ? appearance : 'day'} subject="panchang" content="panchang" title={day && payloadState.kind === 'ready' ? `${widgetText(day.representedDate, lang)} · ${widgetText(payloadState.payload.panchang.cityLabel, lang)}` : contentByLang(lang, 'आज का पंचांग', 'Today’s Panchang')} accessibilityLabel="Panchang widget preview" colors={colors} eyebrowStyle={eyebrowStyle} lang={lang} bodyFont={bodyFont} pinSupported={pinSupported} onPin={pin}>
            {/* This is the small native widget's masthead / tithi / vrat-band /
                sunrise-footer hierarchy, drawn from the same running tithi. */}
            {day && tithi && payloadState.kind === 'ready' ? <View style={{ gap: 7, justifyContent: 'center', flex: 1 }}>
              <Text numberOfLines={1} style={{ fontFamily: bodyFont, fontSize: 10, color: panchangPalette.accent }}>
                {widgetText(day.representedDate, lang)} · {widgetText(payloadState.payload.panchang.cityLabel, lang)}
              </Text>
              <Text numberOfLines={2} style={{ fontFamily: titleFont, fontSize: 25, lineHeight: titleLeading(25), color: panchangPalette.ink }}>{widgetText(tithi.name, lang)}</Text>
              {tithi.till ? <Text numberOfLines={1} style={{ fontFamily: bodyFont, fontSize: 10, color: panchangPalette.inkMuted }}>{widgetText(tithi.till, lang)}</Text> : null}
              {day.vrat ? <View style={{ borderLeftWidth: 3, borderLeftColor: panchangPalette.accent, borderRadius: 7, backgroundColor: appearance === 'night' ? '#24344A' : '#F1E3C6', paddingHorizontal: 7, paddingVertical: 5 }}>
                <Text numberOfLines={2} style={{ fontFamily: bodyFont, fontSize: 11, lineHeight: 17, color: panchangPalette.ink }}>{widgetText(day.vrat, lang)}</Text>
              </View> : null}
              <View style={{ flexDirection: 'row', gap: 5, alignItems: 'center', borderTopWidth: 1, borderTopColor: panchangPalette.gold, paddingTop: 7 }}>
                <Text numberOfLines={1} style={{ flex: 1, fontFamily: bodyFont, fontSize: 10, color: panchangPalette.inkMuted }}>{widgetText(day.sunrise, lang)}</Text>
                <Text style={{ fontFamily: fontFamilies.devanagariBold, fontSize: 10, color: panchangPalette.gold }}>ॐ वेदांश़</Text>
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
            ? pick(lang, { hi: '1. होम स्क्रीन को दबाकर रखें  2. संपादित करें या + चुनें  3. “Vedansh” खोजें  4. विजेट चुनें, बग़ल में स्वाइप कर आकार चुनें, फिर जोड़ें', en: '1. Long-press the Home Screen  2. Tap Edit or +  3. Search “Vedansh”  4. Pick a widget, swipe sideways for its size, then add it', gu: '1. હોમ સ્ક્રીન દબાવી રાખો  2. Edit અથવા +  3. “Vedansh” શોધો  4. વિજેટ પસંદ કરો, બાજુમાં સ્વાઇપ કરી કદ પસંદ કરો, પછી ઉમેરો', kn: '1. ಹೋಮ್ ಸ್ಕ್ರೀನ್ ಒತ್ತಿಹಿಡಿಯಿರಿ  2. Edit ಅಥವಾ +  3. “Vedansh” ಹುಡುಕಿ  4. ವಿಜೆಟ್ ಆಯ್ಕೆಮಾಡಿ, ಪಕ್ಕಕ್ಕೆ ಸ್ವೈಪ್ ಮಾಡಿ ಗಾತ್ರ ಆರಿಸಿ, ನಂತರ ಸೇರಿಸಿ', mr: '1. होम स्क्रीन दाबून धरा  2. Edit किंवा + निवडा  3. “Vedansh” शोधा  4. विजेट निवडा, बाजूला स्वाइप करून आकार निवडा, मग जोडा', te: '1. హోమ్ స్క్రీన్‌ను నొక్కి పట్టుకోండి  2. Edit లేదా + నొక్కండి  3. “Vedansh” వెతకండి  4. విడ్జెట్ ఎంచుకుని, పక్కకు స్వైప్ చేసి పరిమాణం ఎంచుకోండి, ఆపై జోడించండి' })
            : pick(lang, { hi: 'होम स्क्रीन को दबाकर रखें, Widgets खोलें और Vedansh चुनें। जोड़ने के बाद विजेट को दबाकर रखें और किनारे खींचकर आकार बदलें।', en: 'Long-press the Home Screen, open Widgets, and choose Vedansh. After adding, long-press the widget and drag its edges to resize.', gu: 'હોમ સ્ક્રીન દબાવી રાખો, Widgets ખોલો અને Vedansh પસંદ કરો. ઉમેર્યા પછી વિજેટ દબાવી રાખી કિનારી ખેંચીને કદ બદલો.', kn: 'ಹೋಮ್ ಸ್ಕ್ರೀನ್ ಒತ್ತಿಹಿಡಿದು Widgets ತೆರೆಯಿರಿ ಮತ್ತು Vedansh ಆಯ್ಕೆಮಾಡಿ. ಸೇರಿಸಿದ ನಂತರ ವಿಜೆಟ್ ಒತ್ತಿಹಿಡಿದು ಅಂಚುಗಳನ್ನು ಎಳೆದು ಗಾತ್ರ ಬದಲಿಸಿ.', mr: 'होम स्क्रीन दाबून धरा, Widgets उघडा आणि Vedansh निवडा. जोडल्यानंतर विजेट दाबून धरा आणि कडा ओढून आकार बदला.', te: 'హోమ్ స్క్రీన్‌ను నొక్కి పట్టుకుని, Widgets తెరిచి Vedansh ఎంచుకోండి. జోడించిన తర్వాత విడ్జెట్‌ను నొక్కి పట్టుకుని అంచులను లాగి పరిమాణం మార్చండి.' })}</Text>
        </View>
        <Text style={[styles.note, { color: colors.inkMuted, fontFamily: bodyFont }]}>{contentByLang(lang, 'विजेट पुराने आँकड़ों को आज का बताकर नहीं दिखाते।', 'Widgets never present stale information as today’s.')}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

type PreviewProps = {
  heritageImages?: Record<string, number>;
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
function Preview({ heritageImages = {}, contentReady = true, appearance = 'day', subject = 'prayer', verseArtPadding = 90, content, title, accessibilityLabel, colors, eyebrowStyle, lang, bodyFont, pinSupported, onPin, children }: PreviewProps) {
  const entry = widgetCatalogEntry(content);
  const canPin = Platform.OS === 'android' && !!entry.androidProvider;
  const best = pick(lang, { hi: 'सुझाव', en: 'best', gu: 'સૂચિત', kn: 'ಶಿಫಾರಸು', mr: 'शिफारस', te: 'సిఫార్సు' });
  const sizeLabels = entry.sizes.map((size) => `${widgetSizeLabel(size, lang)}${size === entry.recommended ? ` · ${best}` : ''}`);
  // The same sketch plate the native widget draws at this kind's recommended size;
  // without one the card is the plain parchment it was.
  const palette = WIDGET_APPEARANCE_TOKENS[appearance];
  const art = !contentReady || entry.recommended === 'lock' ? undefined : content === 'japam' ? widgetBackgroundImages[widgetBackgroundName(content, entry.recommended)] : heritageImages[widgetHeritageName(subject, entry.recommended, appearance)];
  const cardStyle = [styles.card, { backgroundColor: colors.parchmentSoft, borderColor: colors.divider }];
  const previewStyle = [styles.preview, content === 'panchang' && { width: 190, minHeight: 190 }, { padding: spacing.md, paddingRight: content === 'verse' && art ? verseArtPadding : spacing.md, backgroundColor: palette.background, borderRadius: radii.lg }];
  const previewBody = <View accessible accessibilityRole="image" accessibilityLabel={accessibilityLabel} style={previewStyle}>
    {content === 'panchang' ? null : <Text style={[eyebrowStyle, { color: palette.accent }]}>{title}</Text>}{children}{content === 'panchang' ? null : <Text style={[styles.brand, { color: palette.gold }]}>ॐ वेदांश़</Text>}
  </View>;
  const body = <>
    {art ? <ImageBackground testID={`widget-art-${content}`} source={art} resizeMode="cover" style={[styles.preview, content === 'panchang' && { width: 190, minHeight: 190 }]} imageStyle={styles.cardArt}>
      {React.cloneElement(previewBody, { style: [previewStyle, { backgroundColor: 'transparent' }] })}
    </ImageBackground> : previewBody}
    <View accessible accessibilityLabel={`${pick(lang, { hi: 'आकार', en: 'Sizes', gu: 'કદ', kn: 'ಗಾತ್ರ', mr: 'आकार', te: 'పరిమాణం' })}: ${sizeLabels.join(', ')}`} style={styles.sizeRow}>
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

