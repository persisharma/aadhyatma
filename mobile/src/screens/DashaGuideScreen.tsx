/**
 * Mahadasha guide (design.md §51e) — one period explained step by step: an
 * index of five numbered steps, then one step per screen with a progress bar,
 * Back / Next and a way back to the index.
 *
 * The model is `buildDashaGuide` (pure, reviewed tables + the guide's own
 * explanatory copy). This file only lays it out. Artwork is the app's own:
 * the bundled Jyotish-landing paintings and graha art, the storybook icons,
 * and two published vidhi paintings through the shared artwork cache.
 *
 * Back on a step returns to the index (header, Android back and the iOS edge
 * swipe alike); Back on the index leaves the guide.
 */
import React, { useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, usePreventRemove } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import BasisChain from '@/components/BasisChain';
import CachedArtwork from '@/components/CachedArtwork';
import KundaliArtwork from '@/components/KundaliArtwork';
import { storybookSources } from '@/components/storybookSources';
import { useFontScale } from '@/contexts/FontScaleContext';
import { useGitaLanguage } from '@/data/gita/language';
import { GRAHA_BEEJ_JAPA_ID } from '@/data/japam/grahaBeej';
import { library } from '@/data/texts';
import { vidhiArtworkAsset } from '@/data/vidhiArtworkAsset';
import { buildEntryStartTarget } from '@/navigation/entryRoutes';
import type { PanchangStackParamList } from '@/navigation/types';
import { buildDashaGuide, type DashaGuide, type GuideText } from '@/panchang/dashaGuide';
import { DASHA_GUIDE_COPY } from '@/panchang/dashaGuideContent';
import { GRAHA_NAMES_EN, GRAHA_NAMES_HI } from '@/panchang/kundali';
import { useKundali } from '@/panchang/useKundali';
import { useTheme } from '@/theme/ThemeContext';
import { fontFamilies } from '@/theme/typography';
import { contentByLang, meaningByLang } from '@/utils/localize';
import { isLatinLang, pillTextStyle, scriptBodyFont, scriptTitleFont } from '@/utils/langType';

type Props = NativeStackScreenProps<PanchangStackParamList, 'DashaGuide'>;

const LANDING_ART = {
  hero: require('@assets/jyotish-landing/hero.webp'),
  navagraha: require('@assets/jyotish-landing/navagraha.webp'),
  kundali: require('@assets/jyotish-landing/kundali.webp'),
  learn: require('@assets/jyotish-landing/learn.webp'),
};
const STEP_COUNT = 5;
/** A bundled Image must fill its View-owned frame on both axes, or Android keeps its intrinsic size. */
const IMAGE_FILL = { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' } as const;

function devotionalTarget(sourceId: string) {
  const entry = library.find((candidate) => candidate.id === sourceId && candidate.status === 'active');
  return entry ? buildEntryStartTarget(entry) : null;
}

export default function DashaGuideScreen({ navigation, route }: Props) {
  const { colors, typography, radii, elevation } = useTheme();
  const { lang } = useGitaLanguage();
  const { factor } = useFontScale();
  const { width, fontScale } = useWindowDimensions();
  const compact = width < 360 || factor > 1 || fontScale > 1.2;
  const rootNav = useNavigation<any>();
  const { chart, hydrated } = useKundali();
  // One instant per visit: the guide describes the period as it stood when opened.
  const [now] = useState(() => new Date());
  const guide = useMemo(() => (chart ? buildDashaGuide(chart, route.params.lord, now) : null), [chart, route.params.lord, now]);
  const [step, setStep] = useState(0);
  const [seen, setSeen] = useState<ReadonlySet<number>>(() => new Set());
  const [basisOpen, setBasisOpen] = useState(false);
  const scroll = useRef<ScrollView>(null);
  const leaving = useRef(false);

  const goTo = (target: number) => {
    if (step > 0) setSeen((current) => new Set(current).add(step));
    setStep(target);
    setBasisOpen(false);
    scroll.current?.scrollTo({ y: 0, animated: false });
  };
  // On a step, every Back (header, Android, iOS swipe) means "to the index".
  usePreventRemove(step > 0, ({ data }) => {
    if (leaving.current) navigation.dispatch(data.action);
    else goTo(0);
  });
  const leave = () => {
    leaving.current = true;
    navigation.goBack();
  };
  const openLibrary = (sourceId: string) => {
    const target = devotionalTarget(sourceId);
    if (target) rootNav.navigate('HomeTab', target);
  };

  const s = useMemo(() => buildStyles(factor, isLatinLang(lang)), [factor, lang]);
  const c = (text: GuideText) => contentByLang(lang, text.hi, text.en);
  const m = (text: GuideText) => meaningByLang(lang, text.hi, text.en);
  const lines = (list: { hi: readonly string[]; en: readonly string[] }) =>
    lang === 'en' ? list.en : list.hi.map((line) => contentByLang(lang, line, line));
  const titleFont = scriptTitleFont(lang, typography.readerTitle.fontFamily);
  const bodyFont = scriptBodyFont(lang, typography.meaning.fontFamily);
  const label = pillTextStyle(lang, typography.sectionLabel);
  const labelSize = (lang === 'en' ? 10 : 12) * factor;
  const warm = [colors.panchangTileFrom, colors.panchangTileTo] as const;
  const night = [colors.skyNightTop, colors.skyNightUpper, colors.skyNightHorizon] as const;

  const header = (title: string) => (
    <View style={s.header}>
      <Pressable
        testID="dasha-guide-back"
        onPress={() => (step > 0 ? goTo(0) : leave())}
        accessibilityRole="button"
        accessibilityLabel={step > 0 ? 'Back to the guide index' : 'Back to the Dasha tab'}
        style={({ pressed }) => [s.roundButton, { borderColor: colors.panchangTileBorder, backgroundColor: colors.panchangTileFrom }, elevation.subtle, pressed && s.pressed]}
      >
        <Text style={[s.backGlyph, { color: colors.saffronDeep }]} accessibilityElementsHidden importantForAccessibility="no">‹</Text>
      </Pressable>
      <Text style={[s.headerTitle, { color: colors.ink, fontFamily: titleFont }]} accessibilityRole="header">{title}</Text>
      {step > 0 && (
        <Pressable
          testID="dasha-guide-index"
          onPress={() => goTo(0)}
          accessibilityRole="button"
          accessibilityLabel="Guide index"
          style={({ pressed }) => [s.indexButton, { borderColor: colors.panchangTileBorder, backgroundColor: colors.panchangTileFrom }, pressed && s.pressed]}
        >
          <Text maxFontSizeMultiplier={1.25} style={[s.indexButtonText, { color: colors.saffronDeep }]}>{contentByLang(lang, 'सूची', 'Index')}</Text>
        </Pressable>
      )}
    </View>
  );

  if (!hydrated) {
    return (
      <SafeAreaView style={[s.root, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={s.center}><ActivityIndicator color={colors.saffron} /></View>
      </SafeAreaView>
    );
  }
  if (!guide) {
    return (
      <SafeAreaView style={[s.root, { backgroundColor: colors.background }]} edges={['top']}>
        {header(contentByLang(lang, `${GRAHA_NAMES_HI[route.params.lord]} महादशा`, `${GRAHA_NAMES_EN[route.params.lord]} Mahadasha`))}
        <View testID="dasha-guide-unavailable" style={[s.card, s.pad, { borderColor: colors.panchangTileBorder, backgroundColor: colors.panchangTileFrom, borderRadius: radii.lg, margin: 16 }]}>
          <Text style={[s.body, { color: colors.inkSoft, fontFamily: bodyFont }]}>
            {meaningByLang(
              lang,
              'यह मार्गदर्शिका चल रही या आने वाली महादशा के लिए, वयस्क की कुंडली पर खुलती है। चुने हुए व्यक्ति की कुंडली में यह अवधि अब उपलब्ध नहीं है।',
              'This guide opens for a running or upcoming Mahadasha on an adult’s chart. It is not available for this period in the selected person’s chart.'
            )}
          </Text>
          <Pressable onPress={leave} accessibilityRole="button" style={({ pressed }) => [s.secondaryButton, { borderColor: colors.cardActiveBorder, marginTop: 12 }, pressed && s.pressed]}>
            <Text style={[s.secondaryButtonText, { color: colors.saffronDeep }]}>{contentByLang(lang, '‹ दशा पर लौटें', '‹ Back to Dasha')}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const g: DashaGuide = guide;
  const stepTitles: GuideText[] = [
    { hi: 'यह अवधि क्या है', en: 'What this period is' },
    { hi: `${GRAHA_NAMES_HI[g.lord]} का अर्थ`, en: `What ${GRAHA_NAMES_EN[g.lord]} stands for` },
    { hi: 'आपकी कुंडली में', en: 'In your chart' },
    g.status === 'current' ? { hi: 'क्या करें', en: 'What to do' } : { hi: 'इस अवधि में क्या करें', en: 'What to do in this period' },
    { hi: 'यह उपाय क्यों', en: 'Why this practice' },
  ];
  const stepLedes: GuideText[] = [
    { hi: 'महादशा क्या होती है, और यह कब से कब तक है।', en: 'What a Mahadasha is, and when this one runs.' },
    DASHA_GUIDE_COPY.standsLede,
    { hi: 'यही ग्रह आपकी कुंडली में कहाँ है, और इसका क्या अर्थ है।', en: 'Where this graha sits in your own chart, and what that means.' },
    { hi: 'चार सरल बातें — दिन, दान, सेवा और मंत्र।', en: 'Four simple things — the day, giving, helping and a chant.' },
    { hi: 'हर बात के पीछे का कारण, प्रश्न-उत्तर में।', en: 'The reason behind each part, as questions and answers.' },
  ];
  const stepSummaries: GuideText[] = [
    { hi: g.datesEn, en: g.datesEn },
    { hi: g.signifies.hi.join(' · '), en: g.signifies.en.join(' · ') },
    { hi: `${g.houseTile.value.hi} · ${g.signTile.value.hi}`, en: `${g.houseTile.value.en} · ${g.signTile.value.en}` },
    { hi: `${g.upay.vaarHi} · दान · सेवा · मंत्र`, en: `${g.upay.vaarEn} · daan · seva · mantra` },
    { hi: 'पाँच प्रश्न, पाँच सीधे उत्तर', en: 'Five questions, five plain answers' },
  ];

  const banner = (testID: string, source: number | ReturnType<typeof vidhiArtworkAsset>) => (
    <View testID={testID} style={[s.banner, { borderColor: colors.panchangTileBorder, borderRadius: radii.lg }, elevation.card]} accessible={false} importantForAccessibility="no-hide-descendants">
      {typeof source === 'number'
        ? <Image source={source} resizeMode="cover" style={IMAGE_FILL} accessible={false} />
        : <CachedArtwork source={source} style={StyleSheet.absoluteFill} resizeMode="cover" />}
    </View>
  );
  const warmCard = (children: React.ReactNode, testID?: string) => (
    <LinearGradient testID={testID} colors={warm} style={[s.card, s.pad, { borderColor: colors.panchangTileBorder, borderRadius: radii.lg }, elevation.subtle]}>
      {children}
    </LinearGradient>
  );
  const nightPanel = (children: React.ReactNode, testID?: string) => (
    <LinearGradient testID={testID} colors={night} style={[s.card, s.pad, { borderColor: colors.gold, borderRadius: radii.lg }, elevation.card]}>
      {STARS.map((star, index) => (
        <View key={index} style={[s.star, { left: star.left, top: star.top, width: star.size, height: star.size, borderRadius: star.size / 2, backgroundColor: colors.starLight }]} accessible={false} />
      ))}
      {children}
    </LinearGradient>
  );
  const eyebrow = (text: GuideText, color = colors.saffronDeep) => (
    <Text style={[label, s.eyebrow, { color, fontSize: labelSize }]}>{c(text)}</Text>
  );
  const bullet = (text: string, key: string, color: string = colors.inkSoft, size = 14) => (
    <View key={key} style={s.bulletRow}>
      <LinearGradient colors={[colors.nightGold, colors.gold]} style={s.bulletDot} />
      <Text style={[s.bulletText, { color, fontFamily: bodyFont, fontSize: size * factor, lineHeight: Math.ceil(size * (isLatinLang(lang) ? 1.6 : 1.7) * factor) }]}>{text}</Text>
    </View>
  );
  const darkTile = (tile: { label: GuideText; value: GuideText; sub: GuideText }, key: string, valueLatin = false) => (
    <View key={key} style={[s.darkTile, { backgroundColor: colors.saffronDeep, borderRadius: radii.md }, compact && s.fullWidth]}>
      <Text maxFontSizeMultiplier={1.25} style={[label, { color: colors.nightGold, fontSize: labelSize }]}>{c(tile.label)}</Text>
      <Text style={[s.darkTileValue, { color: colors.cardActiveFrom, fontFamily: valueLatin ? fontFamilies.interSemiBold : titleFont }]}>{c(tile.value)}</Text>
      <Text style={[s.darkTileSub, { color: colors.nightInkSoft, fontFamily: bodyFont }]}>{c(tile.sub)}</Text>
    </View>
  );
  const remember = (
    <View style={[s.rememberBox, { backgroundColor: colors.saffronTint, borderRadius: radii.sm }]}>
      <Text style={[s.smallBody, { color: colors.inkSoft, fontFamily: bodyFont }]}>
        <Text style={{ color: colors.saffronDeep, fontFamily: scriptBodyFont(lang, fontFamilies.interSemiBold) }}>{contentByLang(lang, 'याद रखें: ', 'Remember: ')}</Text>
        {m(g.note)}
      </Text>
    </View>
  );
  const highlight = (on: boolean) => on
    ? { backgroundColor: colors.skyNightUpper, borderColor: colors.nightGold, color: colors.nightGold }
    : { backgroundColor: colors.catalogSurface, borderColor: colors.panchangTileBorder, color: colors.inkMuted };

  const indexView = (
    <View testID="dasha-guide-index-view" style={s.stack}>
      <LinearGradient colors={warm} style={[s.card, { borderColor: colors.panchangTileBorder, borderRadius: radii.lg, overflow: 'hidden' }, elevation.card]}>
        <View style={s.heroArt} accessible={false} importantForAccessibility="no-hide-descendants">
          <Image source={LANDING_ART.hero} resizeMode="cover" style={IMAGE_FILL} accessible={false} />
        </View>
        <View style={s.heroBody}>
          <LinearGradient colors={night} style={[s.heroDisc, { borderColor: colors.gold }, elevation.card]}>
            <KundaliArtwork name={g.lord} size={84} />
          </LinearGradient>
          <View style={[s.statusPill, { backgroundColor: colors.saffronDeep }]}>
            <Text maxFontSizeMultiplier={1.25} style={[label, { color: colors.cardActiveFrom, fontSize: labelSize }]}>
              {g.status === 'current' ? contentByLang(lang, 'वर्तमान अवधि', 'Current period') : contentByLang(lang, 'आगामी अवधि', 'Upcoming period')}
            </Text>
          </View>
          <Text style={[s.heroTitle, { color: colors.ink, fontFamily: titleFont }]}>{c(g.title)}</Text>
          <Text style={[s.caption, { color: colors.inkMuted }]}>{g.datesEn} · {contentByLang(lang, `${g.years} वर्ष`, `${g.years} years`)}</Text>
          {g.progress && (
            <View style={s.fullWidth}>
              <View accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: Math.round(g.progress.percent) }} style={[s.track, { backgroundColor: colors.divider }]}>
                <View style={[s.trackFill, { width: `${g.progress.percent}%`, backgroundColor: colors.saffron }]} />
              </View>
              <View style={s.trackLabels}>
                <Text style={[s.caption, { color: colors.inkMuted }]}>{g.progress.elapsedEn} {contentByLang(lang, 'पूरे', 'elapsed')}</Text>
                <Text style={[s.caption, { color: colors.inkMuted }]}>{g.progress.leftEn} {contentByLang(lang, 'शेष', 'left')}</Text>
              </View>
            </View>
          )}
          {g.begins && <Text style={[s.caption, { color: colors.inkMuted, marginTop: 6 }]}>{c(g.begins)}</Text>}
          <Text style={[s.smallBody, { color: colors.inkSoft, fontFamily: bodyFont, textAlign: 'center', marginTop: 8 }]}>{m(DASHA_GUIDE_COPY.promise)}</Text>
        </View>
      </LinearGradient>

      <Text style={[label, s.sectionEyebrow, { color: colors.saffronDeep, fontSize: labelSize }]}>
        {contentByLang(lang, `इस मार्गदर्शिका में · ${STEP_COUNT} चरण`, `In this guide · ${STEP_COUNT} steps`)}
      </Text>
      {stepTitles.map((title, index) => {
        const number = index + 1;
        const read = seen.has(number);
        const action = index === 3;
        return (
          <Pressable
            key={number}
            testID={`dasha-guide-step-row-${number}`}
            onPress={() => goTo(number)}
            accessibilityRole="button"
            accessibilityLabel={`Step ${number} of ${STEP_COUNT}: ${title.en}${read ? ', read' : ''}`}
            style={({ pressed }) => [pressed && s.pressed]}
          >
            <LinearGradient
              colors={action ? [colors.cardActiveFrom, colors.cardActiveTo] : warm}
              style={[s.stepRow, { borderColor: action ? colors.gold : colors.panchangTileBorder, borderRadius: radii.md }, elevation.subtle]}
            >
              <View style={s.stepThumbWrap}>
                {stepThumb(index, g, colors, night)}
                <View style={[s.stepBadge, { backgroundColor: read ? colors.skyNightUpper : colors.saffronDeep, borderColor: colors.panchangTileFrom }]}>
                  <Text maxFontSizeMultiplier={1.2} style={[s.stepBadgeText, { color: read ? colors.nightGold : colors.cardActiveFrom }]}>{number}</Text>
                </View>
              </View>
              <View style={s.flex}>
                <Text style={[s.stepRowTitle, { color: colors.ink, fontFamily: titleFont }]}>{c(title)}</Text>
                <Text style={[s.caption, { color: colors.inkMuted, fontFamily: bodyFont }]}>{c(stepSummaries[index])}</Text>
              </View>
              <Text style={[s.chevron, { color: colors.saffronDeep }]} accessibilityElementsHidden importantForAccessibility="no">›</Text>
            </LinearGradient>
          </Pressable>
        );
      })}
    </View>
  );

  const step1 = (
    <View testID="dasha-guide-step-1" style={s.stack}>
      {banner('dasha-guide-banner-1', LANDING_ART.navagraha)}
      {warmCard(<>
        {eyebrow({ hi: 'सरल शब्दों में', en: 'In simple words' })}
        <Text style={[s.lead, { color: colors.ink, fontFamily: bodyFont }]}>{m(DASHA_GUIDE_COPY.analogy)}</Text>
      </>)}
      {warmCard(<>
        {eyebrow({ hi: 'नौ बारियाँ · कुल 120 वर्ष', en: 'Nine turns · 120 years in all' })}
        <View style={s.grid3}>
          {g.cycle.map((turn, index) => {
            const tone = turn.isThis
              ? { bg: colors.skyNightUpper, border: colors.nightGold, ink: colors.nightInk, sub: colors.nightInkSoft }
              : { bg: colors.catalogSurface, border: turn.isNow ? colors.gold : colors.panchangTileBorder, ink: colors.ink, sub: colors.inkMuted };
            const tag = turn.isThis
              ? (turn.isNow ? { hi: 'अभी चल रही', en: 'Now' } : { hi: 'यह अवधि', en: 'This one' })
              : turn.isNow ? { hi: 'अभी', en: 'Now' } : null;
            return (
              <View
                key={turn.lord}
                testID={`dasha-guide-turn-${turn.lord}`}
                accessible
                accessibilityLabel={`${index + 1}. ${GRAHA_NAMES_EN[turn.lord]}, ${turn.years} years${turn.isThis ? ', this period' : ''}${turn.isNow ? ', running now' : ''}`}
                style={[s.turn, { backgroundColor: tone.bg, borderColor: tone.border, borderWidth: turn.isThis || turn.isNow ? 2 : 1, borderRadius: radii.md }]}
              >
                <Text style={[s.turnIndex, { color: tone.sub }]}>{index + 1}</Text>
                <KundaliArtwork name={turn.lord} size={40 * Math.min(factor, 1.2)} />
                <Text style={[s.turnName, { color: tone.ink, fontFamily: titleFont }]}>{contentByLang(lang, GRAHA_NAMES_HI[turn.lord], GRAHA_NAMES_EN[turn.lord])}</Text>
                <Text style={[s.turnYears, { color: tone.sub }]}>{contentByLang(lang, `${turn.years} वर्ष`, `${turn.years} years`)}</Text>
                {tag && (
                  <View style={[s.turnTag, { backgroundColor: turn.isThis ? colors.nightGold : colors.saffronDeep }]}>
                    <Text maxFontSizeMultiplier={1.2} style={[s.turnTagText, { color: turn.isThis ? colors.skyNightUpper : colors.cardActiveFrom, fontFamily: scriptBodyFont(lang, fontFamilies.interSemiBold) }]}>{c(tag)}</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>
        <Text style={[s.body, { color: colors.inkSoft, fontFamily: bodyFont, marginTop: 12 }]}>{m(g.turn)}</Text>
      </>)}
      <View style={[s.row3, compact && s.wrapColumn]}>
        {g.facts.map((fact, index) => darkTile(fact, `fact-${index}`, index < 2))}
      </View>
      {warmCard(<>
        <Text style={[s.question, { color: colors.ink, fontFamily: titleFont }]}>{c(DASHA_GUIDE_COPY.howQ)}</Text>
        <Text style={[s.body, { color: colors.inkSoft, fontFamily: bodyFont }]}>{m(DASHA_GUIDE_COPY.howA)}</Text>
      </>)}
      {g.antars.length > 0 && warmCard(<>
        <Text style={[s.question, { color: colors.ink, fontFamily: titleFont }]}>{c(DASHA_GUIDE_COPY.antarQ)}</Text>
        <Text style={[s.body, { color: colors.inkSoft, fontFamily: bodyFont }]}>{m(DASHA_GUIDE_COPY.antarA)}</Text>
        <View style={{ marginTop: 8 }}>
          {g.antars.map((antar) => (
            <View key={`${antar.lord}-${antar.datesEn}`} style={[s.antarRow, { borderTopColor: colors.divider }, compact && s.wrapColumnStart]}>
              <Text style={[s.antarName, { color: antar.isNow ? colors.saffronDeep : colors.ink, fontFamily: scriptBodyFont(lang, fontFamilies.interSemiBold) }]}>
                {contentByLang(lang, GRAHA_NAMES_HI[antar.lord], GRAHA_NAMES_EN[antar.lord])}{antar.isNow ? ` · ${contentByLang(lang, 'अब', 'Now')}` : ''}
              </Text>
              <Text style={[s.caption, { color: colors.inkMuted }]}>{antar.datesEn}</Text>
            </View>
          ))}
        </View>
      </>, 'dasha-guide-antars')}
    </View>
  );

  const step2 = (
    <View testID="dasha-guide-step-2" style={s.stack}>
      {nightPanel(<View style={s.centered}>
        <View style={[s.glow, { shadowColor: colors.nightGold }]}>
          <KundaliArtwork name={g.lord} size={148} />
        </View>
        <Text style={[s.nightTitle, { color: colors.nightInk, fontFamily: titleFont }]}>{m(g.meaning)}</Text>
        <View style={s.chips}>
          {lines(g.signifies).map((word) => (
            <View key={word} style={[s.chip, { borderColor: colors.nightGoldTrack, backgroundColor: colors.nightGlass }]}>
              <Text style={[s.chipText, { color: colors.nightGold, fontFamily: scriptBodyFont(lang, fontFamilies.interSemiBold) }]}>{word}</Text>
            </View>
          ))}
        </View>
      </View>, 'dasha-guide-graha-panel')}
      {warmCard(<>
        {eyebrow({ hi: 'सरल शब्दों में', en: 'In simple words' })}
        <Text style={[s.lead, { color: colors.ink, fontFamily: bodyFont }]}>{m(g.nature)}</Text>
      </>)}
      {warmCard(<>
        {eyebrow(g.lessonsTitle)}
        {g.lessons.map((lesson, index) => (
          <View key={index} style={[s.lessonRow, { backgroundColor: colors.catalogSurface, borderColor: colors.panchangTileBorder, borderRadius: radii.md }]}>
            <LinearGradient colors={[colors.nightGold, colors.gold]} style={s.numberDisc}>
              <Text maxFontSizeMultiplier={1.2} style={[s.numberDiscText, { color: colors.skyNightUpper }]}>{index + 1}</Text>
            </LinearGradient>
            <View style={s.flex}>
              <Text style={[s.lessonWord, { color: colors.ink, fontFamily: titleFont }]}>{c(lesson.word)}</Text>
              <Text style={[s.smallBody, { color: colors.inkSoft, fontFamily: bodyFont }]}>{m(lesson.plain)}</Text>
            </View>
          </View>
        ))}
        <Text style={[s.smallBody, { color: colors.inkMuted, fontFamily: bodyFont, marginTop: 10 }]}>{m(g.theme)}</Text>
      </>, 'dasha-guide-lessons')}
    </View>
  );

  const step3 = (
    <View testID="dasha-guide-step-3" style={s.stack}>
      {banner('dasha-guide-banner-3', LANDING_ART.kundali)}
      {warmCard(<>
        <View style={s.rowCenter}>
          <LinearGradient colors={night} style={[s.smallDisc, { borderColor: colors.gold }]}>
            <KundaliArtwork name={g.lord} size={44} />
          </LinearGradient>
          <Text style={[s.body, s.flex, { color: colors.ink, fontFamily: bodyFont }]}>{m(g.houseHelp)}</Text>
        </View>
        <View style={s.houseGrid} accessible accessibilityLabel={`House ${g.house} of 12 is highlighted`}>
          {Array.from({ length: 12 }, (_, index) => index + 1).map((house) => {
            const tone = highlight(house === g.house);
            return (
              <View key={house} testID={house === g.house ? 'dasha-guide-house-on' : undefined} style={[s.houseCell, { backgroundColor: tone.backgroundColor, borderColor: tone.borderColor, borderRadius: radii.sm }]}>
                <Text maxFontSizeMultiplier={1.2} style={[s.houseNumber, { color: tone.color }]}>{house}</Text>
              </View>
            );
          })}
        </View>
      </>)}
      <View style={[s.row2, compact && s.wrapColumn]}>
        {darkTile({ label: { hi: 'भाव', en: 'House' }, ...g.houseTile }, 'house')}
        {darkTile({ label: { hi: 'राशि', en: 'Sign' }, ...g.signTile }, 'sign')}
      </View>
      {warmCard(<>
        {eyebrow({ hi: 'आपके लिए इसका अर्थ', en: 'What this means for you' })}
        {lines(g.reading).map((line, index) => bullet(line, `reading-${index}`, colors.ink))}
        <View style={[s.tendBox, { backgroundColor: colors.saffronDeep, borderRadius: radii.sm }]}>
          <Text style={[s.smallBody, { color: colors.cardActiveFrom, fontFamily: bodyFont }]}>
            <Text style={{ color: colors.nightGold, fontFamily: scriptBodyFont(lang, fontFamilies.interSemiBold) }}>{contentByLang(lang, 'एक बात का ध्यान: ', 'One thing to tend: ')}</Text>
            {m(g.tend)}
          </Text>
        </View>
      </>, 'dasha-guide-reading')}
      {g.rules.en.length > 0 && warmCard(<>
        {eyebrow({ hi: `${GRAHA_NAMES_HI[g.lord]} इन भावों का भी स्वामी है`, en: `${GRAHA_NAMES_EN[g.lord]} also looks after these houses` })}
        {lines(g.rules).map((line, index) => bullet(line, `rule-${index}`, colors.inkSoft, 13))}
      </>)}
    </View>
  );

  const practiceHead = (icon: React.ReactNode, title: GuideText, help: GuideText, onNight = false) => (
    <View style={s.rowCenter}>
      {icon}
      <View style={s.flex}>
        <Text style={[s.practiceTitle, { color: onNight ? colors.nightInk : colors.ink, fontFamily: titleFont }]}>{c(title)}</Text>
        <Text style={[s.smallBody, { color: onNight ? colors.nightInkSoft : colors.inkMuted, fontFamily: bodyFont }]}>{m(help)}</Text>
      </View>
    </View>
  );
  const WEEK: GuideText[] = [
    { hi: 'रवि', en: 'Sun' }, { hi: 'सोम', en: 'Mon' }, { hi: 'मंगल', en: 'Tue' }, { hi: 'बुध', en: 'Wed' },
    { hi: 'गुरु', en: 'Thu' }, { hi: 'शुक्र', en: 'Fri' }, { hi: 'शनि', en: 'Sat' },
  ];
  const step4 = (
    <View testID="dasha-guide-step-4" style={s.stack}>
      {banner('dasha-guide-banner-4', vidhiArtworkAsset('deepmala'))}
      {warmCard(<>
        {practiceHead(
          <Image source={storybookSources.muhurat} style={s.icon} resizeMode="contain" accessible={false} />,
          { hi: `वार · ${g.upay.vaarHi}`, en: `Day · ${g.upay.vaarEn}` },
          g.dayHelp,
        )}
        <View style={s.weekRow} accessible accessibilityLabel={`${g.upay.vaarEn} is highlighted`}>
          {WEEK.map((day, index) => {
            const tone = highlight(index === g.weekday);
            return (
              <View key={day.en} testID={index === g.weekday ? 'dasha-guide-day-on' : undefined} style={[s.weekCell, { backgroundColor: tone.backgroundColor, borderColor: tone.borderColor, borderRadius: radii.sm }]}>
                <Text maxFontSizeMultiplier={1.2} style={[s.weekText, { color: tone.color, fontFamily: scriptBodyFont(lang, fontFamilies.interSemiBold) }]}>{c(day)}</Text>
              </View>
            );
          })}
        </View>
      </>, 'dasha-guide-day')}
      {warmCard(<>
        {practiceHead(
          <Image source={storybookSources.daan} style={s.icon} resizeMode="contain" accessible={false} />,
          { hi: 'दान · देना', en: 'Daan · giving' },
          DASHA_GUIDE_COPY.daanHelp,
        )}
        <View style={s.chips}>
          {lines(g.daanItems).map((item) => (
            <View key={item} style={[s.solidChip, { backgroundColor: colors.saffronDeep }]}>
              <Text style={[s.solidChipText, { color: colors.cardActiveFrom, fontFamily: bodyFont }]}>{item}</Text>
            </View>
          ))}
        </View>
        {g.daanNote && <Text style={[s.smallBody, { color: colors.inkMuted, fontFamily: bodyFont, marginTop: 6 }]}>{c(g.daanNote)}</Text>}
        <View testID="dasha-guide-daan-dwaar" style={[s.innerBox, { backgroundColor: colors.catalogSurface, borderColor: colors.panchangTileBorder, borderRadius: radii.md }]}>
          <Text style={[s.question, { color: colors.ink, fontFamily: titleFont }]}>{contentByLang(lang, 'दान-द्वार · कहाँ दें', 'Daan-dwaar · where to give')}</Text>
          <Text style={[s.smallBody, { color: colors.inkMuted, fontFamily: bodyFont }]}>{m(DASHA_GUIDE_COPY.dwaarHelp)}</Text>
          {g.daanCauses.length > 0 && (
            <View style={s.chips}>
              {g.daanCauses.map((cause) => (
                <View key={cause.id} style={[s.chip, { borderColor: colors.cardActiveBorder }]}>
                  <Text style={[s.chipText, { color: colors.saffronDeep, fontFamily: scriptBodyFont(lang, fontFamilies.interSemiBold) }]}>{c(cause.name)}</Text>
                </View>
              ))}
            </View>
          )}
          <Pressable
            testID="dasha-guide-open-daan"
            onPress={() => rootNav.navigate('HomeTab', { screen: 'DaanPunya' })}
            accessibilityRole="button"
            accessibilityLabel="Open Daan-Punya to read about these causes and see verified organisations"
            style={({ pressed }) => [s.secondaryButton, { borderColor: colors.saffron, marginTop: 10 }, pressed && s.pressed]}
          >
            <Text style={[s.secondaryButtonText, { color: colors.saffronDeep }]}>{contentByLang(lang, 'दान-पुण्य खोलें ›', 'Open Daan-Punya ›')}</Text>
          </Pressable>
        </View>
      </>, 'dasha-guide-daan')}
      {warmCard(<>
        {practiceHead(
          <View style={[s.iconRound, { borderColor: colors.gold }]}>
            <CachedArtwork source={vidhiArtworkAsset('prayer')} style={StyleSheet.absoluteFill} resizeMode="cover" />
          </View>,
          { hi: 'सेवा · मदद करना', en: 'Seva · helping' },
          DASHA_GUIDE_COPY.sevaHelp,
        )}
        <View style={{ marginTop: 8, gap: 6 }}>
          {lines(g.sevaItems).map((item, index) => (
            <View key={index} style={[s.sevaRow, { backgroundColor: colors.catalogSurface, borderColor: colors.panchangTileBorder, borderRadius: radii.sm }]}>
              {bullet(item, `seva-${index}`, colors.ink)}
            </View>
          ))}
        </View>
      </>, 'dasha-guide-seva')}
      {nightPanel(<>
        {practiceHead(
          <Image source={storybookSources.japam} style={s.icon} resizeMode="contain" accessible={false} />,
          { hi: 'मंत्र · जप', en: 'Mantra · a chant' },
          DASHA_GUIDE_COPY.mantraHelp,
          true,
        )}
        <View style={[s.mantraBox, { borderColor: colors.nightGoldTrack, backgroundColor: colors.nightGlass, borderRadius: radii.md }]}>
          <Text style={[s.mantra, { color: colors.nightGold, fontFamily: fontFamilies.devanagariBold }]}>{g.upay.mantraHi}</Text>
          <Text style={[s.caption, { color: colors.nightInkSoft, textAlign: 'center' }]}>{g.upay.mantraEn}</Text>
        </View>
        <View style={[s.rowCenter, { marginTop: 12 }]}>
          <View style={[s.mala, { borderColor: colors.nightGold }]} accessible={false}>
            <Text maxFontSizeMultiplier={1.2} style={[s.malaText, { color: colors.nightGold }]}>108</Text>
          </View>
          <Text style={[s.smallBody, s.flex, { color: colors.nightInk, fontFamily: bodyFont }]}>{m(g.malaHelp)}</Text>
        </View>
        <Pressable
          testID="dasha-guide-chant"
          onPress={() => openLibrary(GRAHA_BEEJ_JAPA_ID[g.lord])}
          accessibilityRole="button"
          accessibilityLabel={`Chant the ${GRAHA_NAMES_EN[g.lord]} beej mantra on the mala`}
          style={({ pressed }) => [pressed && s.pressed]}
        >
          <LinearGradient colors={[colors.nightGold, colors.choghadiyaShubh]} style={s.primaryOnNight}>
            <Text style={[s.primaryOnNightText, { color: colors.skyNightUpper }]}>{contentByLang(lang, 'माला पर जप करें ›', 'Chant on the mala ›')}</Text>
          </LinearGradient>
        </Pressable>
        {(() => {
          const paath = library.find((entry) => entry.id === g.upay.practiceSourceId && entry.status === 'active');
          if (!paath) return null;
          return (
            <Pressable
              testID="dasha-guide-paath"
              onPress={() => openLibrary(paath.id)}
              accessibilityRole="button"
              accessibilityLabel={`Open ${paath.nameEn} practice`}
              style={({ pressed }) => [s.secondaryOnNight, { borderColor: colors.nightGoldTrack }, pressed && s.pressed]}
            >
              <Text style={[s.secondaryButtonText, { color: colors.nightGold }]}>{contentByLang(lang, `${paath.nameHi} पढ़ें ›`, `Read ${paath.nameEn} ›`)}</Text>
            </Pressable>
          );
        })()}
      </>, 'dasha-guide-mantra')}
      {remember}
    </View>
  );

  const step5 = (
    <View testID="dasha-guide-step-5" style={s.stack}>
      {banner('dasha-guide-banner-5', LANDING_ART.learn)}
      {[...g.why, g.chartQuestion].map((item, index) => {
        const chart = index === g.why.length;
        return (
          <LinearGradient key={index} testID={chart ? 'dasha-guide-chart-question' : undefined} colors={warm} style={[s.qaCard, { borderColor: colors.panchangTileBorder, borderRadius: radii.md }, elevation.subtle]}>
            <LinearGradient colors={[colors.nightGold, colors.gold]} style={s.qMark}>
              <Text style={[s.qMarkText, { color: colors.skyNightUpper }]} accessibilityElementsHidden importantForAccessibility="no">?</Text>
            </LinearGradient>
            <View style={s.flex}>
              <Text style={[s.question, { color: colors.ink, fontFamily: titleFont }]}>{c(item.q)}</Text>
              <Text style={[s.smallBody, { color: colors.inkSoft, fontFamily: bodyFont }]}>{m(item.a)}</Text>
              {chart && (
                <>
                  <View style={[s.quoteBox, { backgroundColor: colors.saffronDeep, borderRadius: radii.sm }]}>
                    <Text maxFontSizeMultiplier={1.25} style={[label, { color: colors.nightGold, fontSize: labelSize }]}>{contentByLang(lang, 'आपकी कुंडली का पाठ', 'Your chart’s reading')}</Text>
                    <Text style={[s.quote, { color: colors.cardActiveFrom, fontFamily: bodyFont }]}>{m(g.chartQuestion.quote)}</Text>
                  </View>
                  <Text style={[s.smallBody, { color: colors.inkMuted, fontFamily: bodyFont, marginTop: 6 }]}>{m(g.chartQuestion.caveat)}</Text>
                  {g.chartQuestion.prashnaPurpose && (
                    <Pressable
                      testID="dasha-guide-prashna"
                      onPress={() => navigation.navigate('Prashna', { purposeId: g.chartQuestion.prashnaPurpose! })}
                      accessibilityRole="button"
                      accessibilityLabel="Ask about this in Prashna"
                      style={({ pressed }) => [s.secondaryButton, { borderColor: colors.saffron, marginTop: 8 }, pressed && s.pressed]}
                    >
                      <Text style={[s.secondaryButtonText, { color: colors.saffronDeep }]}>{contentByLang(lang, 'प्रश्न में इस पर पूछें ›', 'Ask about this in Prashna ›')}</Text>
                    </Pressable>
                  )}
                </>
              )}
            </View>
          </LinearGradient>
        );
      })}
      {remember}
      <Pressable
        testID="dasha-guide-basis-toggle"
        onPress={() => setBasisOpen((open) => !open)}
        accessibilityRole="button"
        accessibilityState={{ expanded: basisOpen }}
        style={({ pressed }) => [s.linkButton, pressed && s.pressed]}
      >
        <Text style={[s.linkText, { color: colors.saffronDeep }]}>
          {basisOpen ? contentByLang(lang, 'आधार छिपाएँ', 'Hide the basis') : contentByLang(lang, 'आधार देखें — यह कैसे निकाला गया', 'See the basis — how this was worked out')}
        </Text>
      </Pressable>
      {basisOpen && <BasisChain basis={g.basis} lang={lang} testID="dasha-guide-basis" />}
    </View>
  );

  const body = [indexView, step1, step2, step3, step4, step5][step];
  const nextTitle = step > 0 && step < STEP_COUNT ? stepTitles[step] : null;

  // The tab bar owns the bottom inset; a second one here left an empty band
  // under the footer.
  return (
    <SafeAreaView style={[s.root, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      {header(c(g.title))}
      {step > 0 && (
        <View style={s.stepHead}>
          <View style={s.segments} accessible={false} importantForAccessibility="no-hide-descendants">
            {stepTitles.map((_, index) => (
              <View key={index} style={[s.segment, { backgroundColor: index < step ? colors.gold : colors.divider }]} />
            ))}
          </View>
          <Text style={[label, s.eyebrow, { color: colors.saffronDeep, fontSize: labelSize, marginTop: 10 }]}>
            {contentByLang(lang, `चरण ${step} / ${STEP_COUNT}`, `Step ${step} of ${STEP_COUNT}`)}
          </Text>
          <Text testID="dasha-guide-step-title" style={[s.stepTitle, { color: colors.ink, fontFamily: titleFont }]} accessibilityRole="header">{c(stepTitles[step - 1])}</Text>
          <Text style={[s.smallBody, { color: colors.inkMuted, fontFamily: bodyFont }]}>{m(stepLedes[step - 1])}</Text>
        </View>
      )}
      <ScrollView ref={scroll} contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {body}
      </ScrollView>
      <View style={[s.footer, { borderTopColor: colors.panchangTileBorder, backgroundColor: colors.panchangTileFrom }, compact && s.footerStack]}>
        {step === 0 ? (
          <Pressable testID="dasha-guide-start" onPress={() => goTo(1)} accessibilityRole="button" style={({ pressed }) => [s.flex, pressed && s.pressed]}>
            <LinearGradient colors={[colors.saffron, colors.saffronDeep]} style={s.primaryButton}>
              <Text style={[s.primaryButtonText, { color: colors.cardActiveFrom, fontFamily: scriptBodyFont(lang, fontFamilies.interSemiBold) }]}>{contentByLang(lang, 'चरण 1 से शुरू करें ›', 'Start from step 1 ›')}</Text>
            </LinearGradient>
          </Pressable>
        ) : (
          <>
            <Pressable testID="dasha-guide-prev" onPress={() => goTo(step - 1)} accessibilityRole="button" style={({ pressed }) => [s.secondaryButton, s.footerSecondary, { borderColor: colors.cardActiveBorder }, pressed && s.pressed]}>
              <Text style={[s.secondaryButtonText, { color: colors.saffronDeep, fontFamily: scriptBodyFont(lang, fontFamilies.interSemiBold) }]}>{contentByLang(lang, '‹ पीछे', '‹ Back')}</Text>
            </Pressable>
            <Pressable
              testID={nextTitle ? 'dasha-guide-next' : 'dasha-guide-done'}
              onPress={() => (nextTitle ? goTo(step + 1) : leave())}
              accessibilityRole="button"
              style={({ pressed }) => [s.footerPrimary, pressed && s.pressed]}
            >
              <LinearGradient colors={[colors.saffron, colors.saffronDeep]} style={s.primaryButton}>
                <Text style={[s.primaryButtonText, { color: colors.cardActiveFrom, fontFamily: scriptBodyFont(lang, fontFamilies.interSemiBold) }]}>
                  {nextTitle
                    ? `${contentByLang(lang, 'आगे · ', 'Next · ')}${c(nextTitle)} ›`
                    : contentByLang(lang, 'पूरा हुआ · दशा पर लौटें', 'Done · back to Dasha')}
                </Text>
              </LinearGradient>
            </Pressable>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

/** A handful of fixed stars for the night panels — decoration, never content. */
const STARS = [
  { left: '8%', top: 14, size: 3 }, { left: '22%', top: 46, size: 2 }, { left: '84%', top: 12, size: 3 },
  { left: '70%', top: 58, size: 2 }, { left: '92%', top: 96, size: 2 }, { left: '6%', top: 120, size: 2 },
  { left: '48%', top: 8, size: 2 },
] as const;

function stepThumb(index: number, guide: DashaGuide, colors: any, night: readonly [string, string, string]) {
  const frame = { width: 48, height: 48, borderRadius: 12, overflow: 'hidden' as const, borderWidth: 1, borderColor: colors.panchangTileBorder };
  if (index === 1) {
    return (
      <LinearGradient colors={night} style={[frame, { alignItems: 'center', justifyContent: 'center' }]}>
        <KundaliArtwork name={guide.lord} size={40} />
      </LinearGradient>
    );
  }
  const source = index === 0 ? LANDING_ART.navagraha : index === 2 ? LANDING_ART.kundali : index === 4 ? LANDING_ART.learn : null;
  return (
    <View style={[frame, { backgroundColor: colors.panchangTileFrom }]} accessible={false}>
      {source !== null
        ? <Image source={source} resizeMode="cover" style={IMAGE_FILL} accessible={false} />
        : <CachedArtwork source={vidhiArtworkAsset('deepmala')} style={StyleSheet.absoluteFill} resizeMode="cover" />}
    </View>
  );
}

function buildStyles(factor: number, latin: boolean) {
  const f = (size: number) => size * factor;
  // Indic lines need >=1.65em inside their own box or matras and the
  // shirorekha clip on iOS (RULEBOOK §3; typography.ts listing tokens). Latin
  // keeps its authored leading; hi/gu/kn take 1.7em.
  const lead = (size: number, latinLeading: number) => (latin ? f(latinLeading) : Math.ceil(f(size) * 1.7));
  return StyleSheet.create({
    root: { flex: 1 },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    flex: { flex: 1, minWidth: 0 },
    fullWidth: { width: '100%' },
    pressed: { opacity: 0.75 },
    header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingTop: 8 },
    roundButton: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
    backGlyph: { fontSize: 26, lineHeight: 28, marginTop: -2 },
    headerTitle: { flex: 1, fontSize: f(20), lineHeight: lead(20, 28) },
    indexButton: { minHeight: 44, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1, justifyContent: 'center' },
    indexButtonText: { fontFamily: fontFamilies.interSemiBold, fontSize: 12 },
    stepHead: { paddingHorizontal: 16, paddingTop: 12 },
    segments: { flexDirection: 'row', gap: 4 },
    segment: { flex: 1, height: 6, borderRadius: 999 },
    stepTitle: { fontSize: f(23), lineHeight: lead(23, 32), marginTop: 2 },
    scroll: { padding: 16, paddingBottom: 24 },
    stack: { gap: 12 },
    card: { borderWidth: 1 },
    pad: { padding: 14 },
    banner: { width: '100%', aspectRatio: 1.9, borderWidth: 1, overflow: 'hidden' },
    heroArt: { width: '100%', height: 112 },
    heroBody: { alignItems: 'center', paddingHorizontal: 14, paddingBottom: 14 },
    heroDisc: { width: 104, height: 104, borderRadius: 52, borderWidth: 2, marginTop: -56, alignItems: 'center', justifyContent: 'center' },
    statusPill: { marginTop: 8, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999 },
    heroTitle: { fontSize: f(23), lineHeight: lead(23, 32), marginTop: 4, textAlign: 'center' },
    caption: { fontFamily: fontFamilies.inter, fontSize: f(12), lineHeight: f(18) },
    track: { height: 6, borderRadius: 999, overflow: 'hidden', marginTop: 10 },
    trackFill: { height: '100%', borderRadius: 999 },
    trackLabels: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginTop: 5 },
    sectionEyebrow: { marginTop: 4 },
    eyebrow: {},
    stepRow: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 64, paddingVertical: 8, paddingLeft: 10, paddingRight: 12, borderWidth: 1 },
    stepThumbWrap: { width: 48, height: 48 },
    stepBadge: { position: 'absolute', top: -6, left: -6, minWidth: 20, height: 20, borderRadius: 10, borderWidth: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 },
    stepBadgeText: { fontFamily: fontFamilies.interSemiBold, fontSize: 11 },
    stepRowTitle: { fontSize: f(15), lineHeight: lead(15, 22) },
    chevron: { fontSize: 22, lineHeight: 24 },
    lead: { fontSize: f(15), lineHeight: lead(15, 25), marginTop: 6 },
    body: { fontSize: f(14), lineHeight: lead(14, 23) },
    smallBody: { fontSize: f(13), lineHeight: lead(13, 21) },
    question: { fontSize: f(15), lineHeight: lead(15, 23) },
    grid3: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
    turn: { flexBasis: '30%', flexGrow: 1, alignItems: 'center', paddingTop: 10, paddingBottom: 8, paddingHorizontal: 4 },
    turnIndex: { position: 'absolute', top: 5, left: 8, fontFamily: fontFamilies.interSemiBold, fontSize: 11 },
    turnName: { fontSize: f(13), lineHeight: lead(13, 19), marginTop: 4, textAlign: 'center' },
    turnYears: { fontFamily: fontFamilies.inter, fontSize: f(11), lineHeight: f(16) },
    turnTag: { marginTop: 4, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
    turnTagText: { fontSize: 11 },
    row3: { flexDirection: 'row', gap: 8 },
    row2: { flexDirection: 'row', gap: 8 },
    wrapColumn: { flexDirection: 'column' },
    wrapColumnStart: { flexDirection: 'column', alignItems: 'flex-start' },
    darkTile: { flex: 1, padding: 12 },
    darkTileValue: { fontSize: f(14), lineHeight: lead(14, 21), marginTop: 4 },
    darkTileSub: { fontSize: f(12), lineHeight: lead(12, 18), marginTop: 2 },
    antarRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, minHeight: 30, paddingVertical: 4, borderTopWidth: 1 },
    antarName: { fontSize: f(12) },
    centered: { alignItems: 'center' },
    glow: { shadowOpacity: 0.55, shadowRadius: 22, shadowOffset: { width: 0, height: 0 } },
    nightTitle: { fontSize: f(17), lineHeight: lead(17, 27), marginTop: 10, textAlign: 'center' },
    chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
    chip: { paddingHorizontal: 12, paddingVertical: 5, borderWidth: 1, borderRadius: 999 },
    chipText: { fontSize: f(12) },
    solidChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999 },
    solidChipText: { fontSize: f(13), lineHeight: lead(13, 20) },
    lessonRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderWidth: 1, marginTop: 8 },
    numberDisc: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
    numberDiscText: { fontFamily: fontFamilies.interSemiBold, fontSize: 15 },
    lessonWord: { fontSize: f(15), lineHeight: lead(15, 22) },
    rowCenter: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    smallDisc: { width: 56, height: 56, borderRadius: 28, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
    houseGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 12 },
    houseCell: { width: '14.4%', flexGrow: 1, minHeight: 40, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
    houseNumber: { fontFamily: fontFamilies.interSemiBold, fontSize: 14 },
    bulletRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginTop: 8 },
    bulletDot: { width: 8, height: 8, borderRadius: 4, marginTop: 8 },
    bulletText: { flex: 1 },
    tendBox: { marginTop: 12, paddingVertical: 10, paddingHorizontal: 12 },
    practiceTitle: { fontSize: f(17), lineHeight: lead(17, 25) },
    icon: { width: 60, height: 60 },
    iconRound: { width: 60, height: 60, borderRadius: 30, borderWidth: 2, overflow: 'hidden' },
    weekRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 12 },
    weekCell: { flexBasis: '12%', flexGrow: 1, minHeight: 38, paddingVertical: 4, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
    weekText: { fontSize: 12, textAlign: 'center' },
    innerBox: { marginTop: 12, padding: 12, borderWidth: 1 },
    sevaRow: { paddingHorizontal: 12, paddingBottom: 8, borderWidth: 1 },
    mantraBox: { marginTop: 12, paddingVertical: 14, paddingHorizontal: 12, borderWidth: 1, alignItems: 'center' },
    mantra: { fontSize: f(19), lineHeight: lead(19, 32), textAlign: 'center' },
    mala: { width: 64, height: 64, borderRadius: 32, borderWidth: 4, borderStyle: 'dotted', alignItems: 'center', justifyContent: 'center' },
    malaText: { fontFamily: fontFamilies.interSemiBold, fontSize: 16 },
    primaryOnNight: { minHeight: 48, marginTop: 14, borderRadius: 999, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16, paddingVertical: 8 },
    primaryOnNightText: { fontFamily: fontFamilies.interSemiBold, fontSize: f(14), textAlign: 'center' },
    secondaryOnNight: { minHeight: 48, marginTop: 8, borderRadius: 999, borderWidth: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16, paddingVertical: 8 },
    rememberBox: { paddingVertical: 10, paddingHorizontal: 12 },
    qaCard: { flexDirection: 'row', gap: 12, padding: 14, borderWidth: 1 },
    qMark: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
    qMarkText: { fontFamily: fontFamilies.interSemiBold, fontSize: 16 },
    quoteBox: { marginTop: 8, paddingVertical: 10, paddingHorizontal: 12 },
    quote: { fontSize: f(14), lineHeight: lead(14, 23), marginTop: 4 },
    star: { position: 'absolute', opacity: 0.85 },
    linkButton: { minHeight: 44, justifyContent: 'center', alignSelf: 'flex-start' },
    linkText: { fontFamily: fontFamilies.interSemiBold, fontSize: 12 },
    secondaryButton: { minHeight: 48, borderRadius: 999, borderWidth: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 14, paddingVertical: 8, alignSelf: 'flex-start' },
    secondaryButtonText: { fontFamily: fontFamilies.interSemiBold, fontSize: f(13), textAlign: 'center' },
    primaryButton: { minHeight: 50, borderRadius: 999, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 14, paddingVertical: 8 },
    primaryButtonText: { fontSize: f(14), textAlign: 'center' },
    footer: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12, borderTopWidth: 1 },
    footerStack: { flexDirection: 'column-reverse' },
    footerSecondary: { flex: 1, alignSelf: 'stretch' },
    footerPrimary: { flex: 2, minWidth: 0 },
  });
}
