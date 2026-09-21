/**
 * दान-पुण्य home (PRD-26, design.md §73) — the educate-first surface. Opens on
 * महत्व: today's occasion line (panchang-resolved), the vaar-daan row, the verse
 * spine as a horizontal carousel, the teaching-kathas as a horizontal shelf, and
 * the खाता door in the header. THE RELAXED §2.7 CONTRACT LIVES HERE: educate is
 * the default, not a gate. The two standing doors — दान करें (into the journey)
 * and दान-द्वार (into the verified-orgs directory) — sit in a STICKY action bar
 * above the tab bar, so they are one tap away at every scroll position while
 * the content above them stays first. The app still never transacts — the
 * hand-off is the org's own site behind the interstitial — and the खाता
 * (ledger) is never gated.
 */
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Svg, { Path } from 'react-native-svg';

import ReaderHeader from '@/components/ReaderHeader';
import { useGitaLanguage, type Lang } from '@/data/gita/language';
import {
  DAAN_VAAR_ENTRIES,
  getDaanKathas,
  getDaanOccasionForRule,
  getDaanPrinciples,
} from '@/data/daan';
import { usePanchangCalendarSystem, useObservancesForDate } from '@/panchang/usePanchang';
import type { DaanStackParamList } from '@/navigation/types';
import { useTheme } from '@/theme/ThemeContext';
import { contentByLang, meaningByLang, pick, verseLinesByLang } from '@/utils/localize';
import { scriptBodyFont, scriptTitleFont } from '@/utils/langType';

type Props = NativeStackScreenProps<DaanStackParamList, 'DaanPunya'>;

/** Sticky action bar height — the scroll content pads by this so nothing hides under it. */
const ACTION_BAR_HEIGHT = 74;
/** The peek of the next verse card that tells the reader the shelf scrolls. */
const CAROUSEL_PEEK = 28;
const CAROUSEL_GAP = 10;
const KATHA_TILE_WIDTH = 156;

/** "रविवार" → "रवि", "Sunday" → "Sun" — a readable short name, not a two-letter code. */
function vaarShortName(lang: Lang, vaarHi: string, vaarEn: string): string {
  return contentByLang(lang, vaarHi.replace(/वार$/, ''), vaarEn.slice(0, 3));
}

export default function DaanPunyaScreen({ navigation }: Props) {
  const { colors, typography, spacing, radii, elevation } = useTheme();
  const { lang } = useGitaLanguage();
  const rootNav = useNavigation<any>();
  const { width } = useWindowDimensions();
  const titleFont = scriptTitleFont(lang, typography.readerTitle.fontFamily);
  const bodyFont = scriptBodyFont(lang, typography.meaning.fontFamily);

  const [calendarSystem] = usePanchangCalendarSystem();
  const today = new Date();
  const observances = useObservancesForDate(today, calendarSystem);
  // First covered observance wins the "आज" card; no match ⇒ the card is absent
  // (never a placeholder), and the vaar row still serves the guest (U2).
  const todayMatch = observances
    .map((o) => ({ occasion: getDaanOccasionForRule(o.rule.id), ruleId: o.rule.id }))
    .find((m) => m.occasion != null);
  const todayIdx = today.getDay();
  const [vaarIdx, setVaarIdx] = useState(todayIdx);
  const vaar = DAAN_VAAR_ENTRIES[vaarIdx];
  const todayVaar = DAAN_VAAR_ENTRIES[todayIdx];

  const principles = getDaanPrinciples();
  const kathas = getDaanKathas();

  // Verse carousel: which card is in view (dots) and which meanings are unfolded.
  const [verseIdx, setVerseIdx] = useState(0);
  const [openMeanings, setOpenMeanings] = useState<Record<string, boolean>>({});
  const cardWidth = width - spacing.readingGutter * 2 - CAROUSEL_PEEK;
  const snap = cardWidth + CAROUSEL_GAP;

  const sectionLabelStyle = {
    fontFamily: typography.sectionLabel.fontFamily,
    fontSize: typography.sectionLabel.fontSize,
    letterSpacing: lang === 'en' ? typography.sectionLabel.letterSpacing : 0,
    color: colors.inkMuted,
    textTransform: 'uppercase' as const,
  };
  const quietLinkStyle = { fontFamily: titleFont, fontSize: 12.5, color: colors.saffronDeep };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={['top']} testID="daan-punya-screen">
      <ReaderHeader
        title={contentByLang(lang, 'दान-पुण्य', 'Daan Punya')}
        variant="index"
        onBack={() => navigation.goBack()}
        sideWidth={44}
        right={
          // The खाता door lives in the header (44pt circle) — ungated, always in reach.
          <Pressable
            testID="daan-ledger-door"
            accessibilityRole="button"
            accessibilityLabel="Daan ledger"
            hitSlop={8}
            onPress={() => navigation.navigate('DaanLedger')}
            style={({ pressed }) => [
              styles.headerBtn,
              { backgroundColor: colors.parchmentSoft, borderColor: colors.divider, borderRadius: radii.xl },
              pressed && { opacity: 0.7 },
            ]}
          >
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Path d="M4 4h12a2 2 0 0 1 2 2v14H6a2 2 0 0 1-2-2z" stroke={colors.saffronDeep} strokeWidth={2} strokeLinejoin="round" />
              <Path d="M4 18a2 2 0 0 1 2-2h12M8 8h6" stroke={colors.saffronDeep} strokeWidth={2} strokeLinecap="round" />
            </Svg>
          </Pressable>
        }
      />
      <ScrollView
        contentContainerStyle={{ paddingBottom: spacing.xxl + ACTION_BAR_HEIGHT }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={{ fontFamily: bodyFont, fontSize: 13, lineHeight: 20, color: colors.inkSoft, textAlign: 'center', marginTop: spacing.xs, paddingHorizontal: spacing.readingGutter }}>
          {contentByLang(lang, 'जप · व्रत · दान — साधना का तीसरा चरण', 'Japa · vrat · daan — the third limb of sadhana')}
        </Text>

        {todayMatch?.occasion ? (
          <View style={{ paddingHorizontal: spacing.readingGutter }}>
            <Text style={[sectionLabelStyle, { marginTop: spacing.xl, marginBottom: spacing.sm }]}>
              {contentByLang(lang, 'आज के दान का महत्व', "Today's daan")}
            </Text>
            <View
              testID="daan-today-card"
              style={[styles.card, { backgroundColor: colors.parchmentSoft, borderColor: colors.cardActiveBorder, borderRadius: radii.lg }, elevation.card]}
            >
              <Text style={{ fontFamily: titleFont, fontSize: 15, lineHeight: 22, color: colors.ink }}>
                {contentByLang(lang, todayMatch.occasion.titleHi, todayMatch.occasion.titleEn)}
              </Text>
              <Text style={{ fontFamily: bodyFont, fontSize: 13, lineHeight: 21, color: colors.inkSoft, marginTop: 6 }}>
                {meaningByLang(lang, todayMatch.occasion.whyHi, todayMatch.occasion.whyEn)}
              </Text>
              <Pressable
                testID="daan-today-journey"
                accessibilityRole="button"
                accessibilityLabel="Open today's daan journey"
                onPress={() => navigation.navigate('DaanJourney', { occasionId: todayMatch.occasion!.id })}
                style={[styles.journeyBtn, { borderColor: colors.saffron, borderRadius: radii.pill }]}
              >
                <Text style={{ fontFamily: titleFont, fontSize: 13, color: colors.saffronDeep }}>
                  {contentByLang(lang, 'इस दिन की दान-यात्रा ›', "This day's daan journey ›")}
                </Text>
              </Pressable>
            </View>
          </View>
        ) : null}

        {/* इस वार का दान — full short names, today named on the right. */}
        <View style={[styles.labelRow, { paddingHorizontal: spacing.readingGutter, marginTop: spacing.xl }]}>
          <Text style={sectionLabelStyle}>{contentByLang(lang, 'इस वार का दान', 'This vaar')}</Text>
          <Text style={quietLinkStyle}>
            {contentByLang(lang, `आज · ${todayVaar.vaarHi}`, `Today · ${todayVaar.vaarEn}`)}
          </Text>
        </View>
        <View style={[styles.vaarRow, { paddingHorizontal: spacing.readingGutter }]}>
          {DAAN_VAAR_ENTRIES.map((entry) => {
            const active = entry.weekday === vaarIdx;
            const isToday = entry.weekday === todayIdx;
            return (
              <View key={entry.weekday} style={styles.vaarCol}>
                <Pressable
                  testID={`daan-vaar-${entry.weekday}`}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  accessibilityLabel={`Vaar ${entry.vaarEn}`}
                  onPress={() => setVaarIdx(entry.weekday)}
                  style={[
                    styles.vaarChip,
                    {
                      borderColor: active ? colors.cardActiveBorder : colors.border,
                      backgroundColor: active ? colors.goldChipBg : colors.surface,
                      borderRadius: radii.pill,
                    },
                  ]}
                >
                  <Text
                    numberOfLines={1}
                    style={{ fontFamily: titleFont, fontSize: 12, lineHeight: 18, color: active ? colors.saffronDeep : colors.inkSoft }}
                  >
                    {vaarShortName(lang, entry.vaarHi, entry.vaarEn)}
                  </Text>
                </Pressable>
                {/* The "today" dot — colour never alone: the label row above names the day. */}
                <View style={[styles.todayDot, { backgroundColor: isToday ? colors.saffron : 'transparent' }]} />
              </View>
            );
          })}
        </View>
        <View
          testID="daan-vaar-line"
          style={[styles.vaarLine, { backgroundColor: colors.goldChipBg, borderRadius: radii.md, marginHorizontal: spacing.readingGutter }]}
        >
          <Text style={{ fontFamily: bodyFont, fontSize: 13, lineHeight: 20, color: colors.inkSoft }}>
            <Text style={{ fontFamily: titleFont, color: colors.ink }}>
              {contentByLang(lang, `${vaar.vaarHi} — ${vaar.grahaHi}: `, `${vaar.vaarEn} — ${vaar.grahaEn}: `)}
            </Text>
            {contentByLang(lang, vaar.itemsHi, vaar.itemsEn)}
          </Text>
        </View>

        {/* शास्त्र — the verse spine as a horizontal carousel; meaning unfolds in place. */}
        <View style={[styles.labelRow, { paddingHorizontal: spacing.readingGutter, marginTop: spacing.xl }]}>
          <Text style={sectionLabelStyle}>{contentByLang(lang, 'शास्त्र क्या कहते हैं', 'What the shastra says')}</Text>
          <Text style={{ fontFamily: bodyFont, fontSize: 11.5, color: colors.inkMuted }}>
            {contentByLang(lang, 'स्वाइप करें →', 'Swipe →')}
          </Text>
        </View>
        <ScrollView
          testID="daan-principle-carousel"
          horizontal
          showsHorizontalScrollIndicator={false}
          decelerationRate="fast"
          snapToInterval={snap}
          snapToAlignment="start"
          contentContainerStyle={{ paddingHorizontal: spacing.readingGutter, gap: CAROUSEL_GAP }}
          onMomentumScrollEnd={(e) => {
            const idx = Math.round(e.nativeEvent.contentOffset.x / snap);
            setVerseIdx(Math.max(0, Math.min(principles.length - 1, idx)));
          }}
        >
          {principles.map((entry) => {
            const open = openMeanings[entry.id] === true;
            return (
              <View
                key={entry.id}
                testID={`daan-principle-${entry.id}`}
                style={[
                  styles.card,
                  styles.verseCard,
                  { width: cardWidth, backgroundColor: colors.parchmentSoft, borderColor: colors.divider, borderRadius: radii.lg },
                  elevation.card,
                ]}
              >
                <View>
                  {entry.verseLines ? (
                    <Text style={{ fontFamily: titleFont, fontSize: 14.5, lineHeight: 24, color: colors.ink, textAlign: 'center' }}>
                      {verseLinesByLang(lang, entry.verseLines, entry.iastLines ?? entry.verseLines).join('\n')}
                    </Text>
                  ) : (
                    <Text style={{ fontFamily: titleFont, fontSize: 15, lineHeight: 22, color: colors.ink }}>
                      {contentByLang(lang, entry.titleHi, entry.titleEn)}
                    </Text>
                  )}
                  <Text style={{ fontFamily: typography.sectionLabel.fontFamily, fontSize: 10.5, letterSpacing: lang === 'en' ? 0.6 : 0, color: colors.inkMuted, textAlign: 'center', textTransform: 'uppercase', marginTop: 8 }}>
                    {contentByLang(lang, entry.citeHi, entry.citeEn)}
                  </Text>
                  <Text
                    numberOfLines={open ? undefined : 2}
                    style={{ fontFamily: bodyFont, fontSize: 13, lineHeight: 20, color: colors.inkSoft, marginTop: 8 }}
                  >
                    {meaningByLang(lang, entry.meaningHi, entry.meaningEn)}
                  </Text>
                </View>
                <View style={styles.cardActions}>
                  <Pressable
                    testID={`daan-principle-meaning-${entry.id}`}
                    accessibilityRole="button"
                    accessibilityLabel={open ? 'Collapse meaning' : 'Expand meaning'}
                    onPress={() => setOpenMeanings((m) => ({ ...m, [entry.id]: !open }))}
                    style={styles.inlineLink}
                  >
                    <Text style={{ fontFamily: titleFont, fontSize: 13, color: colors.saffronDeep }}>
                      {open
                        ? contentByLang(lang, 'संक्षेप ‹', 'Less ‹')
                        : contentByLang(lang, 'पूरा अर्थ ›', 'Full meaning ›')}
                    </Text>
                  </Pressable>
                  {entry.gitaRef ? (
                    <Pressable
                      testID="daan-gita-link"
                      accessibilityRole="button"
                      accessibilityLabel="Read in the Gita reader"
                      onPress={() =>
                        rootNav.navigate('HomeTab', {
                          screen: 'GitaReader',
                          params: { chapter: entry.gitaRef!.chapter, initialIndex: entry.gitaRef!.verseIndex },
                        })
                      }
                      style={[styles.chip, { borderColor: colors.saffron, borderRadius: radii.pill }]}
                    >
                      <Text style={{ fontFamily: titleFont, fontSize: 12.5, color: colors.saffronDeep }}>
                        {contentByLang(lang, 'गीता में पढ़ें ›', 'Read in the Gita ›')}
                      </Text>
                    </Pressable>
                  ) : null}
                </View>
              </View>
            );
          })}
        </ScrollView>
        <View style={styles.dots} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          {principles.map((entry, i) => (
            <View
              key={entry.id}
              style={[
                styles.dot,
                { backgroundColor: i === verseIdx ? colors.saffron : colors.dotRest, width: i === verseIdx ? 16 : 6 },
              ]}
            />
          ))}
        </View>

        {/* दान की कथाएँ — a horizontal shelf of story tiles. */}
        <Text style={[sectionLabelStyle, { paddingHorizontal: spacing.readingGutter, marginTop: spacing.lg, marginBottom: spacing.sm }]}>
          {contentByLang(lang, 'दान की कथाएँ', 'Stories of giving')}
        </Text>
        <ScrollView
          testID="daan-katha-shelf"
          horizontal
          showsHorizontalScrollIndicator={false}
          decelerationRate="fast"
          snapToInterval={KATHA_TILE_WIDTH + CAROUSEL_GAP}
          snapToAlignment="start"
          contentContainerStyle={{ paddingHorizontal: spacing.readingGutter, gap: CAROUSEL_GAP }}
        >
          {kathas.map((katha) => (
            <Pressable
              key={katha.id}
              testID={`daan-katha-${katha.id}`}
              accessibilityRole="button"
              accessibilityLabel={`Story ${katha.titleEn}`}
              onPress={() => navigation.navigate('DaanKatha', { kathaId: katha.id })}
              style={[
                styles.kathaTile,
                { width: KATHA_TILE_WIDTH, backgroundColor: colors.parchmentSoft, borderColor: colors.divider, borderRadius: radii.md },
                elevation.card,
              ]}
            >
              <Text style={{ fontFamily: titleFont, fontSize: 14, lineHeight: 16, color: colors.gold }}>॥</Text>
              {/* 22 leading, not 20: at 14.5 the semibold Devanagari matras (दानवीर, शिबि) sit
                  above a 1.45× box and the tile sliced their tops — §2 floor is ≥1.5×. */}
              <Text numberOfLines={2} style={{ fontFamily: titleFont, fontSize: 14.5, lineHeight: 22, color: colors.ink, marginTop: 6 }}>
                {contentByLang(lang, katha.titleHi, katha.titleEn)}
              </Text>
              <Text numberOfLines={2} style={{ fontFamily: bodyFont, fontSize: 11.5, lineHeight: 17, color: colors.inkMuted, marginTop: 4 }}>
                {contentByLang(lang, katha.subtitleHi, katha.subtitleEn)}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <Text style={{ fontFamily: bodyFont, fontSize: 11.5, lineHeight: 17, color: colors.inkMuted, marginTop: spacing.xl, textAlign: 'center', paddingHorizontal: spacing.readingGutter }}>
          {pick(lang, {
            hi: 'खाता निजी है — केवल इस डिवाइस पर।',
            en: 'The register is private — on this device only.',
            gu: 'ખાતું ખાનગી છે — માત્ર આ ડિવાઇસ પર.',
            kn: 'ಖಾತೆ ಖಾಸಗಿ — ಈ ಸಾಧನದಲ್ಲಿ ಮಾತ್ರ.',
          })}
        </Text>
      </ScrollView>

      {/* The sticky action bar — both standing doors, one tap from any scroll position. */}
      <View
        testID="daan-home-actions"
        style={[
          styles.actionBar,
          { backgroundColor: colors.parchmentHighlight, borderTopColor: colors.divider, paddingHorizontal: spacing.readingGutter },
          elevation.lifted,
        ]}
      >
        <Pressable
          testID="daan-home-dwaar"
          accessibilityRole="button"
          accessibilityLabel={contentByLang(lang, 'दान-द्वार — सत्यापित संस्थाएँ', 'Daan-dwaar — verified orgs')}
          onPress={() => navigation.navigate('DaanDirectory', {})}
          style={({ pressed }) => [
            styles.actionBtn,
            { flex: 1, borderColor: colors.saffron, borderRadius: radii.pill },
            pressed && { opacity: 0.7 },
          ]}
        >
          <Text style={{ fontFamily: titleFont, fontSize: 15, color: colors.saffronDeep }}>
            {contentByLang(lang, 'दान-द्वार ›', 'Daan-dwaar ›')}
          </Text>
        </Pressable>
        <Pressable
          testID="daan-home-donate"
          accessibilityRole="button"
          accessibilityLabel={contentByLang(lang, 'दान करें', 'Donate')}
          onPress={() =>
            navigation.navigate(
              'DaanJourney',
              todayMatch?.occasion ? { occasionId: todayMatch.occasion.id } : {}
            )
          }
          style={({ pressed }) => [
            styles.actionBtn,
            { flex: 1.3, backgroundColor: colors.saffron, borderColor: colors.saffron, borderRadius: radii.pill },
            pressed && { opacity: 0.85 },
          ]}
        >
          <Text style={{ fontFamily: titleFont, fontSize: 16, color: colors.onPrimary }}>
            {contentByLang(lang, 'दान करें', 'Donate')}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  headerBtn: { width: 44, height: 44, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  card: { borderWidth: 1, paddingHorizontal: 14, paddingTop: 13, paddingBottom: 13 },
  verseCard: { justifyContent: 'space-between' },
  cardActions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6, gap: 8 },
  inlineLink: { minHeight: 32, justifyContent: 'center' },
  chip: { borderWidth: 1.5, paddingHorizontal: 12, paddingVertical: 5 },
  journeyBtn: { borderWidth: 1.5, paddingHorizontal: 14, paddingVertical: 7, marginTop: 11, alignSelf: 'flex-start' },
  labelRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 },
  vaarRow: { flexDirection: 'row', gap: 6 },
  vaarCol: { flex: 1, alignItems: 'center', gap: 4 },
  vaarChip: { width: '100%', borderWidth: 1, height: 36, alignItems: 'center', justifyContent: 'center' },
  todayDot: { width: 5, height: 5, borderRadius: 3 },
  vaarLine: { paddingHorizontal: 12, paddingVertical: 9, marginTop: 4 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 10 },
  dot: { height: 6, borderRadius: 3 },
  kathaTile: { borderWidth: 1, paddingHorizontal: 12, paddingTop: 12, paddingBottom: 10, minHeight: 96 },
  actionBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: ACTION_BAR_HEIGHT,
    borderTopWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  actionBtn: { height: 50, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
});
