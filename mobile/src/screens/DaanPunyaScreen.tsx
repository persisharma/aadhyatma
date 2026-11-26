/**
 * दान-पुण्य home (PRD-26, design.md §73) — the educate-first surface, V4 layout.
 * One skippable vertical scroll with a hero, a jump-chip rail, then the teaching
 * in sections: दान क्या है (the Ṛgveda dāna-sūkta as ONE signature night panel),
 * शास्त्र (the remaining verses as quiet parchment scripture cards, each keeping
 * its share + Gita link), आज के दान (today's occasion + the vaar row), and
 * दान की कथाएँ (the teaching-katha shelf). Each section is led by a painted
 * Storybook icon. THE RELAXED §2.7 CONTRACT LIVES HERE: educate is the default,
 * not a gate. The two standing doors — दान करें (journey) and दान-द्वार
 * (directory) — sit in a STICKY action bar above the tab bar, one tap away at
 * every scroll position; the खाता (ledger) door is in the header, ungated.
 *
 * The app still never transacts (hand-off is the org's own site behind the
 * interstitial). NO stance captions and NO line about where the register is
 * stored — both are banned (design.md §1 / `userFacingImplementationCopy.test.ts`).
 */
import React, { useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';

import BackgroundLayer from '@/components/BackgroundLayer';
import ReadingArtwork from '@/components/ReadingArtwork';
import ReaderHeader from '@/components/ReaderHeader';
import StoryIcon, { type StoryIconName } from '@/components/StoryIcon';
import { getDaanBackground } from '@/data/backgrounds';
import { useTodayKey } from '@/utils/useTodayKey';
import ShareButton from '@/components/ShareButton';
import { useShare } from '@/utils/shareVerse';
import { daanPrincipleShareable } from '@/utils/shareContent';
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
import { contentByLang, meaningByLang, verseLinesByLang } from '@/utils/localize';
import { scriptBodyFont, scriptTitleFont } from '@/utils/langType';

type Props = NativeStackScreenProps<DaanStackParamList, 'DaanPunya'>;

/** Sticky action bar height — the scroll content pads by this so nothing hides under it. */
const ACTION_BAR_HEIGHT = 74;
const CAROUSEL_GAP = 10;
const KATHA_TILE_WIDTH = 156;
/** The dāna-sūkta leads as the signature night panel; the rest are scripture cards. */
const SIGNATURE_PRINCIPLE_ID = 'dana-sukta';

/** "रविवार" → "रवि", "Sunday" → "Sun" — a readable short name, not a two-letter code. */
function vaarShortName(lang: Lang, vaarHi: string, vaarEn: string): string {
  return contentByLang(lang, vaarHi.replace(/वार$/, ''), vaarEn.slice(0, 3));
}

type JumpKey = 'what' | 'shastra' | 'today' | 'katha';

export default function DaanPunyaScreen({ navigation }: Props) {
  const { colors, typography, spacing, radii, elevation } = useTheme();
  const { lang } = useGitaLanguage();
  const { share, busy: shareBusy } = useShare();
  const rootNav = useNavigation<any>();
  const titleFont = scriptTitleFont(lang, typography.readerTitle.fontFamily);
  const bodyFont = scriptBodyFont(lang, typography.meaning.fontFamily);

  const [calendarSystem] = usePanchangCalendarSystem();
  // Stable per calendar day — an inline `new Date()` makes useObservancesForDate's
  // selectionKey churn into a setState loop ("Maximum update depth").
  const todayKey = useTodayKey();
  const today = useMemo(() => new Date(todayKey), [todayKey]);
  const observances = useObservancesForDate(today, calendarSystem);
  const todayMatch = observances
    .map((o) => ({ occasion: getDaanOccasionForRule(o.rule.id), ruleId: o.rule.id }))
    .find((m) => m.occasion != null);
  const todayIdx = today.getDay();
  const [vaarIdx, setVaarIdx] = useState(todayIdx);
  const vaar = DAAN_VAAR_ENTRIES[vaarIdx];
  const todayVaar = DAAN_VAAR_ENTRIES[todayIdx];

  const principles = getDaanPrinciples();
  const signature = principles.find((p) => p.id === SIGNATURE_PRINCIPLE_ID);
  const scriptures = principles.filter((p) => p.id !== SIGNATURE_PRINCIPLE_ID);
  const kathas = getDaanKathas();

  // Jump-chip rail: scroll the page to a section's captured Y (skippable nav, not a gate).
  const scrollRef = useRef<ScrollView>(null);
  const sectionY = useRef<Record<JumpKey, number>>({ what: 0, shastra: 0, today: 0, katha: 0 });
  const onSectionLayout = (key: JumpKey) => (e: { nativeEvent: { layout: { y: number } } }) => {
    sectionY.current[key] = e.nativeEvent.layout.y;
  };
  const jumpTo = (key: JumpKey) =>
    scrollRef.current?.scrollTo({ y: Math.max(0, sectionY.current[key] - 8), animated: true });

  const sectionLabelStyle = {
    fontFamily: typography.sectionLabel.fontFamily,
    fontSize: typography.sectionLabel.fontSize,
    letterSpacing: lang === 'en' ? typography.sectionLabel.letterSpacing : 0,
    color: colors.inkMuted,
    textTransform: 'uppercase' as const,
  };
  const quietLinkStyle = { fontFamily: titleFont, fontSize: 12.5, color: colors.saffronDeep };

  const JUMP_CHIPS: { key: JumpKey; hi: string; en: string }[] = [
    { key: 'what', hi: 'दान क्या है', en: 'What daan is' },
    { key: 'shastra', hi: 'शास्त्र', en: 'Scripture' },
    { key: 'today', hi: 'आज', en: 'Today' },
    { key: 'katha', hi: 'कथाएँ', en: 'Stories' },
  ];

  const SectionHeader = ({ icon, hi, en, right }: { icon: StoryIconName; hi: string; en: string; right?: React.ReactNode }) => (
    <View style={[styles.sectionHead, { paddingHorizontal: spacing.readingGutter }]}>
      <StoryIcon name={icon} size={30} />
      <Text style={[sectionLabelStyle, { flex: 1 }]}>{contentByLang(lang, hi, en)}</Text>
      {right}
    </View>
  );

  const ScriptureBody = ({ entry, onDark }: { entry: (typeof principles)[number]; onDark?: boolean }) => (
    <>
      {entry.verseLines ? (
        <Text style={{ fontFamily: titleFont, fontSize: 14.5, lineHeight: 24, color: onDark ? colors.nightGold : colors.ink, textAlign: 'center' }}>
          {verseLinesByLang(lang, entry.verseLines, entry.iastLines ?? entry.verseLines).join('\n')}
        </Text>
      ) : (
        <Text style={{ fontFamily: titleFont, fontSize: 15, lineHeight: 22, color: onDark ? colors.nightGold : colors.ink }}>
          {contentByLang(lang, entry.titleHi, entry.titleEn)}
        </Text>
      )}
      <Text style={{ fontFamily: typography.sectionLabel.fontFamily, fontSize: 10.5, letterSpacing: lang === 'en' ? 0.6 : 0, color: onDark ? colors.nightInkMuted : colors.inkMuted, textAlign: 'center', textTransform: 'uppercase', marginTop: 8 }}>
        {contentByLang(lang, entry.citeHi, entry.citeEn)}
      </Text>
      <Text style={{ fontFamily: bodyFont, fontSize: 13, lineHeight: 21, color: onDark ? colors.nightInkSoft : colors.inkSoft, marginTop: 8 }}>
        {meaningByLang(lang, entry.meaningHi, entry.meaningEn)}
      </Text>
    </>
  );

  const VerseActions = ({ entry }: { entry: (typeof principles)[number] }) => (
    <View style={styles.cardActions}>
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
      <View style={styles.shareEnd}>
        <ShareButton
          onPress={() => void share(daanPrincipleShareable(entry), lang)}
          busy={shareBusy}
          accessibilityLabel="Share verse"
          accessibilityHint="Opens share options for this verse and its meaning"
        />
      </View>
    </View>
  );

  return (
    <View style={[styles.root, { backgroundColor: colors.parchment }]}>
      <BackgroundLayer source={getDaanBackground()} />
      <SafeAreaView style={styles.root} edges={['top']} testID="daan-punya-screen">
        <ReaderHeader
          title={contentByLang(lang, 'दान-पुण्य', 'Daan Punya')}
          variant="index"
          onBack={() => navigation.goBack()}
          sideWidth={44}
          right={
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
          ref={scrollRef}
          contentContainerStyle={{ paddingBottom: spacing.xxl + ACTION_BAR_HEIGHT }}
          showsVerticalScrollIndicator={false}
        >
          {/* HERO — the complete Annapurna painting, framed as the teaching opener. */}
          <View style={{ marginHorizontal: spacing.readingGutter, marginTop: spacing.xs }}>
            <ReadingArtwork source={getDaanBackground()} />
          </View>
          <Text style={{ fontFamily: bodyFont, fontSize: 13, lineHeight: 20, color: colors.inkSoft, textAlign: 'center', marginTop: spacing.sm, paddingHorizontal: spacing.readingGutter }}>
            {contentByLang(lang, 'जप · व्रत · दान — साधना का तीसरा चरण', 'Japa · vrat · daan — the third limb of sadhana')}
          </Text>

          {/* JUMP CHIPS — skippable; each scrolls to its section (not a gate). */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: spacing.readingGutter, gap: 8, paddingTop: spacing.md }}
          >
            {JUMP_CHIPS.map((c) => (
              <Pressable
                key={c.key}
                testID={`daan-jump-${c.key}`}
                accessibilityRole="button"
                accessibilityLabel={`Jump to ${c.en}`}
                onPress={() => jumpTo(c.key)}
                style={({ pressed }) => [
                  styles.jumpChip,
                  { borderColor: colors.border, backgroundColor: colors.parchmentSoft, borderRadius: radii.pill },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Text style={{ fontFamily: titleFont, fontSize: 12.5, color: colors.saffronDeep }}>
                  {contentByLang(lang, c.hi, c.en)}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          {/* दान क्या है — the dāna-sūkta as the ONE signature night panel. */}
          {signature ? (
            <View onLayout={onSectionLayout('what')}>
              <SectionHeader icon="daan" hi="दान क्या है" en="What daan is" />
              <View style={{ paddingHorizontal: spacing.readingGutter }}>
                <LinearGradient
                  testID={`daan-principle-${signature.id}`}
                  colors={[colors.skyNightTop, colors.skyNightUpper, colors.skyNightLower, colors.skyNightHorizon]}
                  style={[styles.card, styles.nightCard, { borderColor: colors.gold, borderRadius: radii.lg }]}
                >
                  <ScriptureBody entry={signature} onDark />
                  <VerseActions entry={signature} />
                </LinearGradient>
              </View>
            </View>
          ) : null}

          {/* शास्त्र — the remaining verses as quiet parchment scripture cards. */}
          <View onLayout={onSectionLayout('shastra')} style={{ marginTop: spacing.xl }}>
            <SectionHeader
              icon="granth"
              hi="शास्त्र क्या कहते हैं"
              en="What the shastra says"
            />
            <View style={{ paddingHorizontal: spacing.readingGutter, gap: CAROUSEL_GAP }}>
              {scriptures.map((entry) => (
                <View
                  key={entry.id}
                  testID={`daan-principle-${entry.id}`}
                  style={[styles.card, { backgroundColor: colors.parchmentSoft, borderColor: colors.divider, borderRadius: radii.lg }, elevation.card]}
                >
                  <ScriptureBody entry={entry} />
                  <VerseActions entry={entry} />
                </View>
              ))}
            </View>
          </View>

          {/* आज के दान — today's occasion (if covered) + the vaar-daan row. */}
          <View onLayout={onSectionLayout('today')} style={{ marginTop: spacing.xl }}>
            <SectionHeader
              icon="muhurat"
              hi="आज का दान"
              en="Today's daan"
              right={<Text style={quietLinkStyle}>{contentByLang(lang, `${todayVaar.vaarHi}`, `${todayVaar.vaarEn}`)}</Text>}
            />
            {todayMatch?.occasion ? (
              <View style={{ paddingHorizontal: spacing.readingGutter }}>
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
            <View style={[styles.vaarRow, { paddingHorizontal: spacing.readingGutter, marginTop: spacing.md }]}>
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
                      <Text numberOfLines={1} style={{ fontFamily: titleFont, fontSize: 12, lineHeight: 18, color: active ? colors.saffronDeep : colors.inkSoft }}>
                        {vaarShortName(lang, entry.vaarHi, entry.vaarEn)}
                      </Text>
                    </Pressable>
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
          </View>

          {/* दान की कथाएँ — a horizontal shelf of story tiles. */}
          <View onLayout={onSectionLayout('katha')} style={{ marginTop: spacing.xl }}>
            <SectionHeader icon="suktam" hi="दान की कथाएँ" en="Stories of giving" />
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
                  <Text numberOfLines={2} style={{ fontFamily: titleFont, fontSize: 14.5, lineHeight: 22, color: colors.ink, marginTop: 6 }}>
                    {contentByLang(lang, katha.titleHi, katha.titleEn)}
                  </Text>
                  <Text numberOfLines={2} style={{ fontFamily: bodyFont, fontSize: 11.5, lineHeight: 17, color: colors.inkMuted, marginTop: 4 }}>
                    {contentByLang(lang, katha.subtitleHi, katha.subtitleEn)}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
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
              navigation.navigate('DaanJourney', todayMatch?.occasion ? { occasionId: todayMatch.occasion.id } : {})
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
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  headerBtn: { width: 44, height: 44, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8, marginBottom: 10 },
  card: { borderWidth: 1, paddingHorizontal: 14, paddingTop: 13, paddingBottom: 13 },
  nightCard: { overflow: 'hidden' },
  cardActions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10, gap: 8 },
  shareEnd: { marginLeft: 'auto' },
  chip: { borderWidth: 1.5, paddingHorizontal: 12, paddingVertical: 5 },
  jumpChip: { borderWidth: 1, paddingHorizontal: 14, height: 36, alignItems: 'center', justifyContent: 'center' },
  journeyBtn: { borderWidth: 1.5, paddingHorizontal: 14, paddingVertical: 7, marginTop: 11, alignSelf: 'flex-start' },
  vaarRow: { flexDirection: 'row', gap: 6 },
  vaarCol: { flex: 1, alignItems: 'center', gap: 4 },
  vaarChip: { width: '100%', borderWidth: 1, height: 36, alignItems: 'center', justifyContent: 'center' },
  todayDot: { width: 5, height: 5, borderRadius: 3 },
  vaarLine: { paddingHorizontal: 12, paddingVertical: 9, marginTop: 10 },
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
