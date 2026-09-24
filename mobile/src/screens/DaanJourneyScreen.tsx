/**
 * दान-यात्रा (PRD-26 §4a, §2.7 RELAXED) — the daan reading as a single scroll:
 * महत्व → शास्त्र → कथा → क्या दें → संकल्प-भाव. Educate is now the DEFAULT,
 * not a hard gate, so the terminal actions (record + दान-द्वार) are ALWAYS
 * present at the end — no step gating. A quiet skip affordance near the top
 * jumps straight to those terminal actions for the already-informed. The screen
 * has two modes: occasion mode (a specific daan-significant day) and daily mode
 * (today's vaar-daan, when no occasion is routed).
 *
 * RECOMMENDED DAAN: the outlined दान-द्वार door always opens the full listing;
 * the chip row above it (`daan-journey-recommended-*`) names the प्रयोजन the
 * day's items serve (occasion causes, else the vaar row's) and lands on the
 * द्वार filtered to that ONE cause — Wednesday's gau-gras opens गौ-सेवा
 * directly. Chips derive from live causes only (a cause with no verified row
 * never renders a chip).
 */
import React, { useMemo, useRef } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import ReaderHeader from '@/components/ReaderHeader';
import { useGitaLanguage } from '@/data/gita/language';
import {
  DAAN_VAAR_ENTRIES,
  getDaanCause,
  getDaanKatha,
  getDaanOccasion,
  getDaanOrgs,
  getDaanPrinciples,
} from '@/data/daan';
import type { DaanCause } from '@/data/daan';
import { getKathaContent } from '@/panchang/kathaContent';
import type { DaanStackParamList } from '@/navigation/types';
import { useTheme } from '@/theme/ThemeContext';
import { contentByLang, meaningByLang, verseLinesByLang } from '@/utils/localize';
import { scriptBodyFont, scriptTitleFont } from '@/utils/langType';

type Props = NativeStackScreenProps<DaanStackParamList, 'DaanJourney'>;

export default function DaanJourneyScreen({ navigation, route }: Props) {
  const { colors, typography, spacing, radii, elevation } = useTheme();
  const { lang } = useGitaLanguage();
  const rootNav = useNavigation<any>();
  const titleFont = scriptTitleFont(lang, typography.readerTitle.fontFamily);
  const bodyFont = scriptBodyFont(lang, typography.meaning.fontFamily);

  const occasionId = route.params?.occasionId;
  const occasion = occasionId ? getDaanOccasion(occasionId) : null;

  // Daily mode's shastra spine prefers sattvik-daan; shraddhaya-deyam is the
  // stable fallback (both are verified principles that always exist).
  const principles = getDaanPrinciples();
  const shastra =
    principles.find((p) => p.id === 'sattvik-daan') ??
    principles.find((p) => p.id === 'shraddhaya-deyam') ??
    null;

  const shippedKatha = occasion?.kathaId ? getKathaContent(occasion.kathaId) : null;
  const daanKatha = occasion?.daanKathaId ? getDaanKatha(occasion.daanKathaId) : null;
  const hasKatha = Boolean(shippedKatha || daanKatha);

  // Daily mode: today's vaar row is the data source.
  const vaar = DAAN_VAAR_ENTRIES[new Date().getDay()];

  const title = occasion
    ? contentByLang(lang, occasion.titleHi, occasion.titleEn)
    : contentByLang(lang, 'दान-यात्रा', 'Daan journey');

  // The प्रयोजन the day's daan serves — occasion causes, else the vaar row's.
  const sourceCauses = occasion ? occasion.causes : vaar.causes;
  const causes = useMemo<DaanCause[]>(() => (sourceCauses ? [...sourceCauses] : []), [sourceCauses]);

  // Recommended chips: only causes a verified org actually serves — a chip
  // must land on a shelf, never on an empty grid.
  const recommended = useMemo(() => {
    const orgs = getDaanOrgs();
    return causes
      .filter((id) => orgs.some((org) => org.causes.includes(id)))
      .map((id) => ({ id, meta: getDaanCause(id) }));
  }, [causes]);

  const mahatva = occasion
    ? meaningByLang(lang, occasion.whyHi, occasion.whyEn)
    : meaningByLang(
        lang,
        `${vaar.vaarHi} — ${vaar.grahaHi} का वार। नित्य-परम्परा में इस दिन का दान श्रद्धा और सामर्थ्य से किया जाता है।`,
        `${vaar.vaarEn} — the vaar of ${vaar.grahaEn}. In the nitya tradition, this day's giving is offered with faith and according to one's means.`
      );

  const itemsText = occasion ? null : contentByLang(lang, vaar.itemsHi, vaar.itemsEn);

  // Skip: capture the terminal block's Y and scroll to it.
  const scrollRef = useRef<ScrollView>(null);
  const terminalY = useRef(0);
  const scrollToTerminal = () =>
    scrollRef.current?.scrollTo({ y: terminalY.current, animated: true });

  const sectionLabelStyle = {
    fontFamily: typography.sectionLabel.fontFamily,
    fontSize: typography.sectionLabel.fontSize,
    letterSpacing: lang === 'en' ? typography.sectionLabel.letterSpacing : 0,
    color: colors.gold,
    textTransform: 'uppercase' as const,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={['top']} testID="daan-journey-screen">
      <ReaderHeader title={title} variant="index" onBack={() => navigation.goBack()} />
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={{ paddingHorizontal: spacing.readingGutter, paddingBottom: spacing.xxl }}
      >
        {/* Skip affordance — quiet, jumps to the terminal actions. */}
        <Pressable
          testID="daan-journey-skip"
          accessibilityRole="button"
          accessibilityLabel="Skip to the daan directory"
          onPress={scrollToTerminal}
          style={styles.skip}
        >
          <Text style={{ fontFamily: bodyFont, fontSize: 12.5, color: colors.inkMuted }}>
            {contentByLang(lang, 'पहले से जानता हूँ — सीधे दान-द्वार ›', 'Skip to the daan-dwaar ›')}
          </Text>
        </Pressable>

        {/* महत्व */}
        <Text style={sectionLabelStyle}>{contentByLang(lang, 'महत्व', 'Why')}</Text>
        <View style={[styles.card, { backgroundColor: colors.parchmentSoft, borderColor: colors.divider, borderRadius: radii.lg }, elevation.card]}>
          <Text style={{ fontFamily: bodyFont, fontSize: 13.5, lineHeight: 22, color: colors.inkSoft }}>
            {mahatva}
          </Text>
        </View>

        {/* शास्त्र */}
        {shastra ? (
          <>
            <Text style={sectionLabelStyle}>{contentByLang(lang, 'शास्त्र', 'Shastra')}</Text>
            <View style={[styles.card, { backgroundColor: colors.parchmentSoft, borderColor: colors.divider, borderRadius: radii.lg }, elevation.card]}>
              {shastra.verseLines ? (
                <Text style={{ fontFamily: titleFont, fontSize: 15, lineHeight: 26, color: colors.ink, textAlign: 'center' }}>
                  {verseLinesByLang(lang, shastra.verseLines, shastra.iastLines ?? shastra.verseLines).join('\n')}
                </Text>
              ) : null}
              <Text style={{ fontFamily: typography.sectionLabel.fontFamily, fontSize: 10.5, letterSpacing: lang === 'en' ? 0.6 : 0, color: colors.gold, textAlign: 'center', textTransform: 'uppercase', marginTop: 8 }}>
                {contentByLang(lang, shastra.citeHi, shastra.citeEn)}
              </Text>
              <Text style={{ fontFamily: bodyFont, fontSize: 13, lineHeight: 21, color: colors.inkSoft, marginTop: 8 }}>
                {meaningByLang(lang, shastra.meaningHi, shastra.meaningEn)}
              </Text>
              {shastra.gitaRef ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Read in the Gita reader"
                  onPress={() =>
                    rootNav.navigate('HomeTab', {
                      screen: 'GitaReader',
                      params: { chapter: shastra.gitaRef!.chapter, initialIndex: shastra.gitaRef!.verseIndex },
                    })
                  }
                  style={[styles.chipBtn, { borderColor: colors.saffron, borderRadius: radii.pill, alignSelf: 'center' }]}
                >
                  <Text style={{ fontFamily: titleFont, fontSize: 12.5, color: colors.saffronDeep }}>
                    {contentByLang(lang, 'गीता में पढ़ें ›', 'Read in the Gita ›')}
                  </Text>
                </Pressable>
              ) : null}
            </View>
          </>
        ) : null}

        {/* कथा — only when a katha exists (occasion mode). */}
        {hasKatha ? (
          <>
            <Text style={sectionLabelStyle}>{contentByLang(lang, 'कथा', 'Katha')}</Text>
            {shippedKatha ? (
              <Pressable
                testID="daan-journey-shipped-katha"
                accessibilityRole="button"
                accessibilityLabel={`Read katha ${shippedKatha.titleEn}`}
                onPress={() =>
                  rootNav.navigate('HomeTab', { screen: 'VratKathaReader', params: { kathaId: occasion?.kathaId } })
                }
                style={[styles.rowCard, { backgroundColor: colors.parchmentSoft, borderColor: colors.divider, borderRadius: radii.lg }, elevation.card]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: titleFont, fontSize: 14.5, lineHeight: 21, color: colors.ink }}>
                    {contentByLang(lang, shippedKatha.titleHi, shippedKatha.titleEn)}
                  </Text>
                  <Text style={{ fontFamily: bodyFont, fontSize: 11.5, lineHeight: 17, color: colors.inkMuted, marginTop: 2 }}>
                    {contentByLang(lang, 'कथा-कोश में पढ़ें', 'Read in the katha library')}
                  </Text>
                </View>
                <Text style={{ fontSize: 18, color: colors.inkMuted }}>›</Text>
              </Pressable>
            ) : null}
            {daanKatha ? (
              <Pressable
                testID="daan-journey-daan-katha"
                accessibilityRole="button"
                accessibilityLabel={`Read story ${daanKatha.titleEn}`}
                onPress={() => navigation.navigate('DaanKatha', { kathaId: daanKatha.id })}
                style={[styles.rowCard, { backgroundColor: colors.parchmentSoft, borderColor: colors.divider, borderRadius: radii.lg }, elevation.card]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: titleFont, fontSize: 14.5, lineHeight: 21, color: colors.ink }}>
                    {contentByLang(lang, daanKatha.titleHi, daanKatha.titleEn)}
                  </Text>
                  <Text style={{ fontFamily: bodyFont, fontSize: 11.5, lineHeight: 17, color: colors.inkMuted, marginTop: 2 }}>
                    {contentByLang(lang, daanKatha.subtitleHi, daanKatha.subtitleEn)}
                  </Text>
                </View>
                <Text style={{ fontSize: 18, color: colors.inkMuted }}>›</Text>
              </Pressable>
            ) : null}
          </>
        ) : null}

        {/* क्या दें */}
        <Text style={sectionLabelStyle}>{contentByLang(lang, 'क्या दें', 'What to give')}</Text>
        {occasion ? (
          occasion.items.map((item) => (
            <View
              key={item.id}
              style={[styles.card, { backgroundColor: colors.parchmentSoft, borderColor: colors.divider, borderRadius: radii.lg, marginBottom: 8 }, elevation.card]}
            >
              <Text style={{ fontFamily: titleFont, fontSize: 14, lineHeight: 21, color: colors.ink }}>
                {contentByLang(lang, item.nameHi, item.nameEn)}
              </Text>
              <Text style={{ fontFamily: bodyFont, fontSize: 12, lineHeight: 18, color: colors.inkMuted, marginTop: 3 }}>
                {meaningByLang(lang, item.reasonHi, item.reasonEn)}
              </Text>
            </View>
          ))
        ) : (
          <View style={[styles.card, { backgroundColor: colors.parchmentSoft, borderColor: colors.divider, borderRadius: radii.lg }, elevation.card]}>
            <Text style={{ fontFamily: bodyFont, fontSize: 13.5, lineHeight: 22, color: colors.inkSoft }}>
              {itemsText}
            </Text>
          </View>
        )}

        {/* संकल्प-भाव + the always-present terminal actions. */}
        <Text style={sectionLabelStyle}>{contentByLang(lang, 'संकल्प-भाव', 'Sankalp bhaav')}</Text>
        <View style={[styles.card, { backgroundColor: colors.parchmentSoft, borderColor: colors.divider, borderRadius: radii.lg }, elevation.card]}>
          <Text style={{ fontFamily: titleFont, fontSize: 15, lineHeight: 25, color: colors.ink, textAlign: 'center' }}>
            {contentByLang(lang, 'श्रद्धया देयम् — जो भी दूँ,\nश्रद्धा, सामर्थ्य और विनम्रता से दूँ ॥', 'Shraddhaya deyam — whatever I give,\nmay I give with faith, means and humility.')}
          </Text>
          <Text style={{ fontFamily: bodyFont, fontSize: 11.5, lineHeight: 17, color: colors.inkMuted, textAlign: 'center', marginTop: 8 }}>
            {contentByLang(lang, 'भाव-वाक्य — तैत्तिरीय उपनिषद् १.११.३ पर आधारित', 'The bhaav line — after Taittirīya Upaniṣad 1.11.3')}
          </Text>
        </View>

        <View
          style={[styles.terminal, { borderTopColor: colors.divider }]}
          onLayout={(e) => {
            terminalY.current = e.nativeEvent.layout.y;
          }}
        >
          {/* Recommended daan — the day's प्रयोजन as chips, each landing on
              the द्वार filtered to that one cause (the outlined door below
              keeps the full listing). */}
          {recommended.length > 0 ? (
            <View testID="daan-journey-causes" style={styles.recommendedRow}>
              <Text style={{ fontFamily: bodyFont, fontSize: 12.5, lineHeight: 19, color: colors.saffronDeep }}>
                {contentByLang(lang, occasion ? 'इस दिन का दान —' : 'आज का दान —', occasion ? "This day's daan —" : "Today's daan —")}
              </Text>
              {recommended.map(({ id, meta }) => (
                <Pressable
                  key={id}
                  testID={`daan-journey-recommended-${id}`}
                  accessibilityRole="button"
                  accessibilityLabel={`Recommended daan ${meta?.nameEn ?? id}, opens the directory`}
                  onPress={() => navigation.navigate('DaanDirectory', { causes: [id] })}
                  style={[styles.recommendedChip, { backgroundColor: colors.goldChipBg, borderColor: colors.gold, borderRadius: radii.pill }]}
                >
                  <Text style={{ fontFamily: titleFont, fontSize: 13, color: colors.saffronDeep }}>
                    {meta ? contentByLang(lang, meta.nameHi, meta.nameEn) : id} ›
                  </Text>
                </Pressable>
              ))}
            </View>
          ) : null}
          <View style={styles.actionRow}>
            <Pressable
              testID="daan-journey-record"
              accessibilityRole="button"
              accessibilityLabel="Record in my daan ledger"
              onPress={() => navigation.navigate('DaanEntry', occasion ? { occasionId: occasion.id } : {})}
              style={[styles.actionBtn, { backgroundColor: colors.saffron, borderColor: colors.saffron, borderRadius: radii.pill }]}
            >
              <Text style={{ fontFamily: titleFont, fontSize: 13, color: colors.onPrimary }}>
                {contentByLang(lang, 'खाते में दर्ज करें', 'Record in my register')}
              </Text>
            </Pressable>
            <Pressable
              testID="daan-journey-directory"
              accessibilityRole="button"
              accessibilityLabel="Open the giving directory, external"
              onPress={() =>
                // The door keeps its pre-change contract: an occasion's causes ring
                // the grid; daily mode opens the full listing (the chips recommend).
                navigation.navigate('DaanDirectory', occasion?.causes?.length ? { causes: [...occasion.causes] } : {})
              }
              style={[styles.actionBtn, { borderColor: colors.saffron, borderRadius: radii.pill }]}
            >
              <Text style={{ fontFamily: titleFont, fontSize: 13, color: colors.saffronDeep }}>
                {contentByLang(lang, 'दान-द्वार (बाहरी)', 'Daan dwaar (external)')}
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  skip: { alignSelf: 'flex-end', paddingTop: 12, paddingBottom: 4, paddingHorizontal: 2 },
  card: { borderWidth: 1, paddingHorizontal: 14, paddingTop: 13, paddingBottom: 13, marginBottom: 10 },
  rowCard: { borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 9, flexDirection: 'row', alignItems: 'center', gap: 10 },
  chipBtn: { borderWidth: 1.5, paddingHorizontal: 14, paddingVertical: 7, marginTop: 11 },
  terminal: { borderTopWidth: 1, marginTop: 6, paddingTop: 14 },
  recommendedRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginBottom: 12 },
  recommendedChip: { borderWidth: 1, minHeight: 36, paddingHorizontal: 14, alignItems: 'center', justifyContent: 'center' },
  actionRow: { flexDirection: 'row', gap: 8 },
  actionBtn: { flex: 1, borderWidth: 1.5, minHeight: 42, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8 },
});
