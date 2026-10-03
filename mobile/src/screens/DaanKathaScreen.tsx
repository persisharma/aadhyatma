/**
 * दान-कथा reader (PRD-26 §10.2 Bucket B) — renders one of the five
 * teaching-kathas from data/daan/kathas.ts: story paragraphs (meaning-policy
 * language selection), the शिक्षा panel, and the rendered canonical source
 * line. The shipped katha library renders its own entries via
 * VratKathaReader; this screen exists so the teaching-kathas never pollute
 * that registry.
 *
 * The story never dead-ends (design.md §73): after ॥ ॐ ॥ come the "अगली कथा"
 * row (position dots, the next teaching-katha in registry order, wrapping)
 * and the "इस भाव से" doors — दान करें (→ the daily journey) leading, खाते में
 * दर्ज करें (→ the ledger form) quiet. No closing stance line: the doors speak
 * for themselves. §2.7 holds: no give/pay control, the app never transacts.
 */
import React, { useMemo, useRef } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, type FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import ReaderHeader from '@/components/ReaderHeader';
import Ornament from '@/components/Ornament';
import LanguageToggle from '@/components/LanguageToggle';
import ReadAloudButton from '@/components/readAloud/ReadAloudButton';
import { useReaderReadAloud } from '@/screens/_useReaderReadAloud';
import ShareButton from '@/components/ShareButton';
import { useShare } from '@/utils/shareVerse';
import { daanKathaShareable } from '@/utils/shareContent';
import { useGitaLanguage } from '@/data/gita/language';
import { getDaanKatha, getDaanKathas } from '@/data/daan';
import type { DaanStackParamList } from '@/navigation/types';
import { useTheme } from '@/theme/ThemeContext';
import { commentaryByLang, contentByLang, meaningByLang } from '@/utils/localize';
import { meaningToken, scriptBodyFont, scriptTitleFont } from '@/utils/langType';

type Props = NativeStackScreenProps<DaanStackParamList, 'DaanKatha'>;

export default function DaanKathaScreen({ navigation, route }: Props) {
  const { colors, typography, spacing, radii, elevation } = useTheme();
  const { lang } = useGitaLanguage();
  const { share, busy: shareBusy } = useShare();
  const titleFont = scriptTitleFont(lang, typography.readerTitle.fontFamily);
  const bodyFont = scriptBodyFont(lang, typography.meaning.fontFamily);

  const katha = getDaanKatha(route.params.kathaId);

  // Read-aloud over the story prose — same hook every reader uses (RULEBOOK §3,
  // never call Speech.speak from a screen). The teaching-katha section carries
  // `paragraphs*`; map it to the adapter's prose shape (`body*`). These are short
  // single-section stories read as one continuous scroll, so there is no paging:
  // `currentIndex` is pinned to 0 and the unattached `listRef` is never scrolled
  // (the controller only auto-advances across pages, of which there is one).
  const readAloudData = useMemo(
    () => (katha?.sections ?? []).map((s) => ({ bodyHi: s.paragraphsHi, bodyEn: s.paragraphsEn })),
    [katha]
  );
  const listRef = useRef<FlatList<{ bodyHi: readonly string[]; bodyEn: readonly string[] }>>(null);
  const readAloud = useReaderReadAloud({
    sourceId: `daan-katha-${route.params.kathaId}`,
    data: readAloudData,
    offset: 0,
    verseCount: readAloudData.length,
    currentIndex: 0,
    listRef,
  });

  if (!katha) {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={['top']}>
        <ReaderHeader title={contentByLang(lang, 'कथा', 'Katha')} variant="index" onBack={() => navigation.goBack()} />
      </SafeAreaView>
    );
  }

  // Position among the verified teaching-kathas, and the next one (wrapping).
  const kathas = getDaanKathas();
  const position = Math.max(0, kathas.findIndex((k) => k.id === katha.id));
  const next = kathas.length > 1 ? kathas[(position + 1) % kathas.length] : null;

  const sectionLabelStyle = {
    fontFamily: typography.sectionLabel.fontFamily,
    fontSize: typography.sectionLabel.fontSize,
    letterSpacing: lang === 'en' ? typography.sectionLabel.letterSpacing : 0,
    color: colors.inkMuted,
    textTransform: 'uppercase' as const,
  };

  // Story prose uses the shared reading token (like KathaSectionPage), so the
  // daan story reads at the same size/rhythm as every other katha reader.
  const meaning = meaningToken(lang, typography);
  const storyBodyStyle = {
    color: lang === 'en' ? colors.ink : colors.inkSoft,
    fontFamily: meaning.fontFamily,
    fontSize: meaning.fontSize,
    lineHeight: meaning.lineHeight,
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={['top']} testID="daan-katha-screen">
      <ReaderHeader
        title={contentByLang(lang, katha.titleHi, katha.titleEn)}
        variant="index"
        onBack={() => navigation.goBack()}
      />
      <View style={styles.toggleRow}>
        {/* Share pinned left, read-aloud pinned right — the katha reader row (design.md §39.4). */}
        <View style={styles.shareSlot}>
          <ShareButton
            onPress={() => void share(daanKathaShareable(katha), lang)}
            busy={shareBusy}
            accessibilityLabel="Share katha"
            accessibilityHint="Opens share options for this katha and its teaching"
          />
        </View>
        <LanguageToggle />
        {/* Pinned right so the toggle stays centred (design.md §56.2). */}
        <View style={styles.readAloudSlot}>
          <ReadAloudButton control={readAloud} />
        </View>
      </View>
      <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.readingGutter, paddingBottom: spacing.xxl }}>
        <Text style={{ fontFamily: bodyFont, fontSize: 12.5, lineHeight: 19, color: colors.inkMuted, textAlign: 'center', marginTop: spacing.sm }}>
          {contentByLang(lang, katha.subtitleHi, katha.subtitleEn)}
        </Text>

        {/* Ornament divider — the title→ornament→prose rhythm every reader shares. */}
        <Ornament />

        {katha.sections.map((section) => (
          <View key={section.id}>
            {commentaryByLang(lang, section.paragraphsHi, section.paragraphsEn).map((paragraph, idx) => (
              <Text
                key={`${section.id}-${idx}`}
                style={[storyBodyStyle, { marginBottom: spacing.md }]}
              >
                {paragraph}
              </Text>
            ))}
          </View>
        ))}

        <View
          testID="daan-katha-teaching"
          style={[styles.teaching, { backgroundColor: colors.goldTint, borderColor: colors.gold, borderRadius: radii.lg }, elevation.card]}
        >
          <Text style={{ fontFamily: titleFont, fontSize: 12.5, color: colors.saffronDeep, marginBottom: 6 }}>
            {contentByLang(lang, 'शिक्षा', 'The teaching')}
          </Text>
          <Text style={{ fontFamily: titleFont, fontSize: 16, lineHeight: 26, color: colors.saffronDeep }}>
            {meaningByLang(lang, katha.teachingHi, katha.teachingEn)}
          </Text>
        </View>

        <Text style={{ fontFamily: bodyFont, fontSize: 12, lineHeight: 18, color: colors.inkMuted, textAlign: 'center', marginTop: spacing.md }}>
          {contentByLang(lang, `स्रोत: ${katha.canonHi}`, `Source: ${katha.canonEn}`)}
        </Text>
        <Text style={{ fontFamily: titleFont, fontSize: 16, color: colors.gold, textAlign: 'center', marginTop: spacing.md, opacity: 0.8 }}>
          ॥ ॐ ॥
        </Text>

        {/* The way onward — never a dead end. */}
        <View style={[styles.onward, { borderTopColor: colors.divider }]}>
          {next ? (
            <>
              <View style={styles.labelRow}>
                <Text style={sectionLabelStyle}>{contentByLang(lang, 'अगली कथा', 'Next story')}</Text>
                <View style={styles.dots} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
                  {kathas.map((k, i) => (
                    <View
                      key={k.id}
                      style={[styles.dot, { backgroundColor: i === position ? colors.saffron : colors.dotRest, width: i === position ? 14 : 6 }]}
                    />
                  ))}
                </View>
              </View>
              <Pressable
                testID="daan-katha-next"
                accessibilityRole="button"
                accessibilityLabel={`Next story ${next.titleEn}`}
                onPress={() => navigation.replace('DaanKatha', { kathaId: next.id })}
                style={({ pressed }) => [
                  styles.rowCard,
                  { backgroundColor: colors.parchmentSoft, borderColor: colors.divider, borderRadius: radii.lg },
                  elevation.card,
                  pressed && { opacity: 0.8 },
                ]}
              >
                <View style={[styles.glyph, { backgroundColor: colors.goldTint, borderRadius: radii.xl }]}>
                  <Text style={{ fontFamily: titleFont, fontSize: 16, color: colors.gold }}>॥</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: titleFont, fontSize: 15.5, lineHeight: 24, color: colors.ink }}>
                    {contentByLang(lang, next.titleHi, next.titleEn)}
                  </Text>
                  <Text style={{ fontFamily: bodyFont, fontSize: 12, lineHeight: 18, color: colors.inkMuted }}>
                    {contentByLang(lang, next.subtitleHi, next.subtitleEn)}
                  </Text>
                </View>
                <Text style={{ fontSize: 18, color: colors.saffronDeep }}>›</Text>
              </Pressable>
            </>
          ) : null}

          <Text style={[sectionLabelStyle, { marginTop: spacing.xl, marginBottom: spacing.sm }]}>
            {contentByLang(lang, 'इस भाव से', 'In this bhaav')}
          </Text>
          <Pressable
            testID="daan-katha-donate"
            accessibilityRole="button"
            accessibilityLabel={contentByLang(lang, 'दान करें', 'Donate')}
            onPress={() => navigation.navigate('DaanJourney', {})}
            style={({ pressed }) => [
              styles.donateBtn,
              { backgroundColor: colors.saffron, borderRadius: radii.pill },
              elevation.card,
              pressed && { opacity: 0.85 },
            ]}
          >
            <Text style={{ fontFamily: titleFont, fontSize: 16, color: colors.onPrimary }}>
              {contentByLang(lang, 'दान करें', 'Donate')}
            </Text>
          </Pressable>
          <Pressable
            testID="daan-katha-record"
            accessibilityRole="button"
            accessibilityLabel="Record in my daan ledger"
            onPress={() => navigation.navigate('DaanEntry', {})}
            style={styles.quietLink}
          >
            <Text style={{ fontFamily: titleFont, fontSize: 13.5, color: colors.saffronDeep }}>
              {contentByLang(lang, 'खाते में दर्ज करें', 'Record in my register')}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  toggleRow: { flexDirection: 'row', justifyContent: 'center', paddingTop: 6, paddingBottom: 6, alignItems: 'center' },
  readAloudSlot: { position: 'absolute', right: 16, top: 6, bottom: 6, justifyContent: 'center' },
  shareSlot: { position: 'absolute', left: 16, top: 6, bottom: 6, justifyContent: 'center' },
  teaching: { borderWidth: 1, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 16, marginTop: 6 },
  onward: { borderTopWidth: 1, marginTop: 20, paddingTop: 18 },
  labelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  dots: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  dot: { height: 6, borderRadius: 3 },
  rowCard: { borderWidth: 1, paddingHorizontal: 14, paddingVertical: 10, minHeight: 62, flexDirection: 'row', alignItems: 'center', gap: 12 },
  glyph: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  donateBtn: { height: 52, alignItems: 'center', justifyContent: 'center' },
  quietLink: { alignSelf: 'center', minHeight: 36, justifyContent: 'center', marginTop: 4, paddingHorizontal: 12 },
});
