/**
 * दान-पुण्य home (PRD-26, design.md §73) — the educate-first surface, laid out
 * TODAY-FIRST (Option B, Nov 2026): what the tradition gives today (the day's
 * covered observance, then the vaar's items and the प्रयोजन they serve), every
 * vaar's daan, the nine sevas with their painted icons, the verse spine, the
 * teaching-kathas and the खाता. THE RELAXED §2.7 CONTRACT LIVES HERE: educate
 * is the default, not a gate. The two standing doors — दान करें (into the
 * journey) and दान-द्वार (into the verified-orgs directory) — sit in a STICKY
 * action bar above the tab bar. The app still never transacts — the hand-off is
 * the org's own site behind the interstitial — and the खाता is never gated.
 *
 * Every word on this screen comes from the verified registries
 * (`data/daan/*`): no second, hand-copied dataset. "Today" is derived from the
 * device date. Lines carry facts, never stance (design.md §73 copy rule), and
 * nothing narrates where the register is stored
 * (`userFacingImplementationCopy.test.ts`).
 */
import React, { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Svg, { Path } from 'react-native-svg';

import BackgroundLayer from '@/components/BackgroundLayer';
import DaanCauseIcon from '@/components/DaanCauseIcon';
import ReadingArtwork from '@/components/ReadingArtwork';
import ReaderHeader from '@/components/ReaderHeader';
import { storybookSources } from '@/components/storybookSources';
import { getDaanBackground } from '@/data/backgrounds';
import { useTodayKey } from '@/utils/useTodayKey';
import ShareButton from '@/components/ShareButton';
import { useShare } from '@/utils/shareVerse';
import { daanPrincipleShareable } from '@/utils/shareContent';
import { useGitaLanguage, type Lang } from '@/data/gita/language';
import {
  DAAN_CAUSES,
  DAAN_VAAR_ENTRIES,
  getDaanKathas,
  getDaanOccasionForRule,
  getDaanOrgs,
  getDaanPrinciples,
  type DaanCause,
} from '@/data/daan';
import { usePanchangCalendarSystem, useObservancesForDate } from '@/panchang/usePanchang';
import type { DaanStackParamList } from '@/navigation/types';
import { useTheme } from '@/theme/ThemeContext';
import { contentByLang, meaningByLang, verseLinesByLang } from '@/utils/localize';
import { isLatinLang, scriptBodyFont, scriptTitleFont } from '@/utils/langType';

type Props = NativeStackScreenProps<DaanStackParamList, 'DaanPunya'>;

/** Sticky action bar height — the scroll content pads by this so nothing hides under it. */
const ACTION_BAR_HEIGHT = 74;
/** The peek of the next verse card that tells the reader the shelf scrolls. */
const CAROUSEL_PEEK = 28;
const CAROUSEL_GAP = 10;

/** "रविवार" → "रवि", "Sunday" → "Sun" — a readable short name, not a two-letter code. */
function vaarShortName(lang: Lang, vaarHi: string, vaarEn: string): string {
  return contentByLang(lang, vaarHi.replace(/वार$/, ''), vaarEn.slice(0, 3));
}

/**
 * A vaar row's items as separate tags plus its trailing note: the registry
 * writes "chana dal, haldi, banana, books — the vaar of vidya-daan". The note
 * after the dash stays a line; the comma list becomes tags.
 */
export function splitVaarItems(items: string): { tags: string[]; note: string | null } {
  const [list, ...rest] = items.split(' — ');
  const tags = list.split(/,\s*/).map((tag) => tag.trim()).filter(Boolean);
  const note = rest.join(' — ').trim();
  return { tags, note: note.length > 0 ? note : null };
}

export default function DaanPunyaScreen({ navigation }: Props) {
  const { colors, typography, spacing, radii, elevation } = useTheme();
  const { lang } = useGitaLanguage();
  const { share, busy: shareBusy } = useShare();
  const rootNav = useNavigation<any>();
  const { width } = useWindowDimensions();
  const titleFont = scriptTitleFont(lang, typography.readerTitle.fontFamily);
  const bodyFont = scriptBodyFont(lang, typography.meaning.fontFamily);
  // Indic lines reserve >=1.65em or matras clip on iOS (RULEBOOK §3); Latin
  // keeps its authored leading.
  const latin = isLatinLang(lang);
  const lead = (size: number, latinLeading: number) => (latin ? latinLeading : Math.ceil(size * 1.7));

  const [calendarSystem] = usePanchangCalendarSystem();
  // Stable per calendar day — an inline `new Date()` changes every render, which
  // makes useObservancesForDate's selectionKey churn and drives its effect into a
  // setState loop ("Maximum update depth"). Mirror the Home Today surfaces.
  const todayKey = useTodayKey();
  const today = useMemo(() => new Date(todayKey), [todayKey]);
  const observances = useObservancesForDate(today, calendarSystem);
  // First covered observance wins the "आज" card; no match ⇒ the card is absent
  // (never a placeholder), and the vaar card still serves the guest (U2).
  const todayMatch = observances
    .map((o) => ({ occasion: getDaanOccasionForRule(o.rule.id), ruleId: o.rule.id }))
    .find((m) => m.occasion != null);
  const todayIdx = today.getDay();
  const [vaarIdx, setVaarIdx] = useState(todayIdx);
  const vaar = DAAN_VAAR_ENTRIES[vaarIdx];
  const todayVaar = DAAN_VAAR_ENTRIES[todayIdx];
  const todayItems = splitVaarItems(contentByLang(lang, todayVaar.itemsHi, todayVaar.itemsEn));

  // A cause shows only where a verified org serves it (§27.12 — never an empty shelf).
  const liveCauses = useMemo(() => {
    const orgs = getDaanOrgs(today);
    return DAAN_CAUSES.filter((cause) => orgs.some((org) => org.causes.includes(cause.id)));
  }, [today]);
  const liveIds = useMemo(() => new Set(liveCauses.map((cause) => cause.id)), [liveCauses]);
  const todayCauses = (todayVaar.causes ?? []).filter((id) => liveIds.has(id));
  const causeName = (id: DaanCause) => {
    const meta = DAAN_CAUSES.find((cause) => cause.id === id)!;
    return contentByLang(lang, meta.nameHi, meta.nameEn);
  };
  const openCause = (id: DaanCause) => navigation.navigate('DaanDirectory', { causes: [id] });

  const principles = getDaanPrinciples();
  const kathas = getDaanKathas();

  // Verse carousel: which card is in view (dots).
  const [verseIdx, setVerseIdx] = useState(0);
  const cardWidth = width - spacing.readingGutter * 2 - CAROUSEL_PEEK;
  const snap = cardWidth + CAROUSEL_GAP;

  const sectionLabelStyle = {
    fontFamily: typography.sectionLabel.fontFamily,
    fontSize: typography.sectionLabel.fontSize,
    letterSpacing: lang === 'en' ? typography.sectionLabel.letterSpacing : 0,
    color: colors.inkMuted,
    textTransform: 'uppercase' as const,
  };
  const sectionTitle = { fontFamily: titleFont, fontSize: 18, lineHeight: lead(18, 26), color: colors.ink };
  const cardShell = [styles.card, { backgroundColor: colors.parchmentSoft, borderColor: colors.divider, borderRadius: radii.lg }, elevation.card];

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
        {/* ── आज का दान — today first ───────────────────────────────────── */}
        <View style={{ paddingHorizontal: spacing.readingGutter, gap: spacing.md, marginTop: spacing.sm }}>
          {todayMatch?.occasion ? (
            <View testID="daan-today-card" style={[...cardShell, { borderColor: colors.cardActiveBorder }]}>
              <Text style={sectionLabelStyle}>{contentByLang(lang, 'आज का पर्व-दान', "Today's festival daan")}</Text>
              <Text style={{ fontFamily: titleFont, fontSize: 16, lineHeight: lead(16, 23), color: colors.ink, marginTop: 4 }}>
                {contentByLang(lang, todayMatch.occasion.titleHi, todayMatch.occasion.titleEn)}
              </Text>
              <Text style={{ fontFamily: bodyFont, fontSize: 13, lineHeight: lead(13, 21), color: colors.inkSoft, marginTop: 6 }}>
                {meaningByLang(lang, todayMatch.occasion.whyHi, todayMatch.occasion.whyEn)}
              </Text>
              <Pressable
                testID="daan-today-journey"
                accessibilityRole="button"
                accessibilityLabel="Open today's daan journey"
                onPress={() => navigation.navigate('DaanJourney', { occasionId: todayMatch.occasion!.id })}
                style={[styles.journeyBtn, { borderColor: colors.saffron, borderRadius: radii.pill }]}
              >
                <Text style={{ fontFamily: titleFont, fontSize: 13, lineHeight: lead(13, 18), color: colors.saffronDeep }}>
                  {contentByLang(lang, 'इस दिन की दान-यात्रा ›', "This day's daan journey ›")}
                </Text>
              </Pressable>
            </View>
          ) : null}

          <View testID="daan-today-hero" style={[...cardShell, styles.heroCard]}>
            <ReadingArtwork source={getDaanBackground()} />
            <View style={styles.heroBody}>
              <Text style={[sectionLabelStyle, { color: colors.saffronDeep }]}>
                {contentByLang(
                  lang,
                  `आज · ${todayVaar.vaarHi} · ${todayVaar.grahaHi} का वार`,
                  `Today · ${todayVaar.vaarEn} · ${todayVaar.grahaEn}’s day`
                )}
              </Text>
              <View testID="daan-today-items" style={styles.tagRow}>
                {todayItems.tags.map((tag) => (
                  <View key={tag} style={[styles.tag, { backgroundColor: colors.goldChipBg, borderRadius: radii.sm }]}>
                    <Text style={{ fontFamily: titleFont, fontSize: 15, lineHeight: lead(15, 21), color: colors.saffronDeep }}>
                      {latin ? tag.charAt(0).toUpperCase() + tag.slice(1) : tag}
                    </Text>
                  </View>
                ))}
              </View>
              {todayItems.note ? (
                <Text style={{ fontFamily: bodyFont, fontSize: 13, lineHeight: lead(13, 20), color: colors.inkMuted, marginTop: 8 }}>
                  {todayItems.note}
                </Text>
              ) : null}
              {todayCauses.length > 0 ? (
                <>
                  <Text style={{ fontFamily: bodyFont, fontSize: 12.5, lineHeight: lead(12.5, 19), color: colors.inkSoft, marginTop: 12 }}>
                    {contentByLang(lang, 'यह सेवा किस तक पहुँचती है', 'Who this daan serves')}
                  </Text>
                  <View style={[styles.tagRow, { marginTop: 6 }]}>
                    {todayCauses.map((id) => (
                      <Pressable
                        key={id}
                        testID={`daan-today-cause-${id}`}
                        accessibilityRole="button"
                        accessibilityLabel={`${DAAN_CAUSES.find((cause) => cause.id === id)!.nameEn}: places that serve it`}
                        onPress={() => openCause(id)}
                        style={({ pressed }) => [
                          styles.causeChip,
                          { borderColor: colors.gold, backgroundColor: colors.panchangTileFrom, borderRadius: radii.pill },
                          pressed && { opacity: 0.75 },
                        ]}
                      >
                        <DaanCauseIcon cause={id} size={36} testID={`daan-today-cause-icon-${id}`} />
                        <Text style={{ fontFamily: titleFont, fontSize: 13.5, lineHeight: lead(13.5, 19), color: colors.ink }}>{causeName(id)}</Text>
                        <Text style={{ fontFamily: titleFont, fontSize: 15, color: colors.saffronDeep }}>›</Text>
                      </Pressable>
                    ))}
                  </View>
                </>
              ) : null}
            </View>
          </View>
        </View>

        {/* ── हर वार का दान — any day, today marked ───────────────────────── */}
        <View style={[styles.labelRow, { paddingHorizontal: spacing.readingGutter, marginTop: spacing.xl }]}>
          <Text style={sectionTitle}>{contentByLang(lang, 'हर वार का दान', 'Every day has its daan')}</Text>
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
                  accessibilityLabel={`Vaar ${entry.vaarEn}${isToday ? ', today' : ''}`}
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
                    style={{ fontFamily: titleFont, fontSize: 12, lineHeight: lead(12, 18), color: active ? colors.saffronDeep : colors.inkSoft }}
                  >
                    {vaarShortName(lang, entry.vaarHi, entry.vaarEn)}
                  </Text>
                </Pressable>
                {/* The "today" dot — colour never alone: the chip's label names today. */}
                <View style={[styles.todayDot, { backgroundColor: isToday ? colors.saffron : 'transparent' }]} />
              </View>
            );
          })}
        </View>
        <View
          testID="daan-vaar-line"
          style={[styles.vaarLine, { backgroundColor: colors.goldChipBg, borderRadius: radii.md, marginHorizontal: spacing.readingGutter }]}
        >
          <Text style={{ fontFamily: bodyFont, fontSize: 13, lineHeight: lead(13, 20), color: colors.inkSoft }}>
            <Text style={{ fontFamily: titleFont, color: colors.ink }}>
              {contentByLang(lang, `${vaar.vaarHi} — ${vaar.grahaHi}: `, `${vaar.vaarEn} — ${vaar.grahaEn}: `)}
            </Text>
            {contentByLang(lang, vaar.itemsHi, vaar.itemsEn)}
          </Text>
        </View>

        {/* ── नौ प्रकार की सेवा — the दान-द्वार's causes, painted ─────────────── */}
        <Text style={[sectionTitle, { paddingHorizontal: spacing.readingGutter, marginTop: spacing.xl, marginBottom: spacing.sm }]}>
          {contentByLang(lang, 'सेवा के प्रकार', 'Kinds of seva')}
        </Text>
        <View testID="daan-seva-grid" style={[styles.sevaGrid, { paddingHorizontal: spacing.readingGutter }]}>
          {liveCauses.map((cause) => (
            <Pressable
              key={cause.id}
              testID={`daan-seva-${cause.id}`}
              accessibilityRole="button"
              accessibilityLabel={`${cause.nameEn}: why it is held dear, and places that serve it`}
              onPress={() => openCause(cause.id)}
              style={({ pressed }) => [
                styles.sevaTile,
                { backgroundColor: colors.parchmentSoft, borderColor: colors.divider, borderRadius: radii.lg },
                elevation.card,
                pressed && { opacity: 0.8 },
              ]}
            >
              <DaanCauseIcon cause={cause.id} size={52} testID={`daan-seva-icon-${cause.id}`} />
              <Text style={{ fontFamily: titleFont, fontSize: 13, lineHeight: lead(13, 18), color: colors.ink, textAlign: 'center' }}>
                {contentByLang(lang, cause.nameHi, cause.nameEn)}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* ── शास्त्र — the verse spine as a horizontal carousel ─────────────── */}
        <View style={[styles.labelRow, { paddingHorizontal: spacing.readingGutter, marginTop: spacing.xl }]}>
          <Text style={sectionTitle}>{contentByLang(lang, 'शास्त्र क्या कहते हैं', 'What the shastra says')}</Text>
          <Text style={{ fontFamily: bodyFont, fontSize: 11.5, lineHeight: lead(11.5, 16), color: colors.inkMuted }}>
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
          {principles.map((entry) => (
            <View
              key={entry.id}
              testID={`daan-principle-${entry.id}`}
              style={[...cardShell, styles.verseCard, { width: cardWidth }]}
            >
              <View>
                {entry.verseLines ? (
                  <Text style={{ fontFamily: titleFont, fontSize: 14.5, lineHeight: lead(14.5, 24), color: colors.ink, textAlign: 'center' }}>
                    {verseLinesByLang(lang, entry.verseLines, entry.iastLines ?? entry.verseLines).join('\n')}
                  </Text>
                ) : (
                  <Text style={{ fontFamily: titleFont, fontSize: 15, lineHeight: lead(15, 22), color: colors.ink }}>
                    {contentByLang(lang, entry.titleHi, entry.titleEn)}
                  </Text>
                )}
                <Text style={{ fontFamily: typography.sectionLabel.fontFamily, fontSize: 10.5, lineHeight: lead(10.5, 15), letterSpacing: lang === 'en' ? 0.6 : 0, color: colors.inkMuted, textAlign: 'center', textTransform: 'uppercase', marginTop: 8 }}>
                  {contentByLang(lang, entry.citeHi, entry.citeEn)}
                </Text>
                <Text style={{ fontFamily: bodyFont, fontSize: 13, lineHeight: lead(13, 20), color: colors.inkSoft, marginTop: 8 }}>
                  {meaningByLang(lang, entry.meaningHi, entry.meaningEn)}
                </Text>
              </View>
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
                    <Text style={{ fontFamily: titleFont, fontSize: 12.5, lineHeight: lead(12.5, 18), color: colors.saffronDeep }}>
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
            </View>
          ))}
        </ScrollView>
        <View style={styles.dots} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          {principles.map((entry, i) => (
            <View
              key={entry.id}
              style={[styles.dot, { backgroundColor: i === verseIdx ? colors.saffron : colors.dotRest, width: i === verseIdx ? 16 : 6 }]}
            />
          ))}
        </View>

        {/* ── दान की कथाएँ — two-up story cards ───────────────────────────── */}
        <Text style={[sectionTitle, { paddingHorizontal: spacing.readingGutter, marginTop: spacing.lg, marginBottom: spacing.sm }]}>
          {contentByLang(lang, 'दान की कथाएँ', 'Stories of giving')}
        </Text>
        <View testID="daan-katha-shelf" style={[styles.kathaGrid, { paddingHorizontal: spacing.readingGutter }]}>
          {kathas.map((katha, index) => (
            <Pressable
              key={katha.id}
              testID={`daan-katha-${katha.id}`}
              accessibilityRole="button"
              accessibilityLabel={`Story ${katha.titleEn}`}
              onPress={() => navigation.navigate('DaanKatha', { kathaId: katha.id })}
              style={({ pressed }) => [
                styles.kathaTile,
                // An odd last card spans the row instead of leaving a hole.
                kathas.length % 2 === 1 && index === kathas.length - 1 && styles.kathaTileWide,
                { backgroundColor: colors.parchmentSoft, borderColor: colors.divider, borderRadius: radii.lg },
                elevation.card,
                pressed && { opacity: 0.8 },
              ]}
            >
              <View style={[styles.kathaBand, { backgroundColor: colors.goldChipBg, borderTopLeftRadius: radii.lg, borderTopRightRadius: radii.lg }]}>
                <Text style={{ fontFamily: titleFont, fontSize: 20, lineHeight: lead(20, 26), color: colors.gold }} accessibilityElementsHidden importantForAccessibility="no">॥</Text>
              </View>
              <View style={styles.kathaBody}>
                <Text style={{ fontFamily: titleFont, fontSize: 14.5, lineHeight: lead(14.5, 22), color: colors.ink }}>
                  {contentByLang(lang, katha.titleHi, katha.titleEn)}
                </Text>
                <Text style={{ fontFamily: bodyFont, fontSize: 12, lineHeight: lead(12, 18), color: colors.inkMuted, marginTop: 2 }}>
                  {contentByLang(lang, katha.subtitleHi, katha.subtitleEn)}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>

        {/* ── खाता — the register, one tap from the end of the read ────────── */}
        <View
          testID="daan-register-card"
          style={[...cardShell, styles.registerCard, { backgroundColor: colors.goldChipBg, borderColor: colors.cardActiveBorder, marginHorizontal: spacing.readingGutter }]}
        >
          <Image source={storybookSources.granth} style={styles.registerIcon} resizeMode="contain" accessibilityElementsHidden importantForAccessibility="no" />
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={{ fontFamily: titleFont, fontSize: 16, lineHeight: lead(16, 23), color: colors.ink }}>
              {contentByLang(lang, 'आपका दान-खाता', 'Your daan register')}
            </Text>
            <Text style={{ fontFamily: bodyFont, fontSize: 12.5, lineHeight: lead(12.5, 19), color: colors.inkSoft, marginTop: 2 }}>
              {contentByLang(
                lang,
                'जो दिया, लिखें — उस दिन की तिथि अपने-आप जुड़ती है। गुप्त प्रविष्टि में केवल तिथि रहती है।',
                'Write down what you gave; the day’s tithi is added for you. A gupt entry keeps only the date.'
              )}
            </Text>
          </View>
          <Pressable
            testID="daan-register-record"
            accessibilityRole="button"
            accessibilityLabel="Record a daan"
            onPress={() => navigation.navigate('DaanEntry', todayMatch?.occasion ? { occasionId: todayMatch.occasion.id } : undefined)}
            style={({ pressed }) => [styles.recordBtn, { backgroundColor: colors.saffronDeep, borderRadius: radii.pill }, pressed && { opacity: 0.85 }]}
          >
            <Text style={{ fontFamily: titleFont, fontSize: 13.5, lineHeight: lead(13.5, 19), color: colors.onPrimary }}>
              {contentByLang(lang, 'दर्ज करें', 'Record')}
            </Text>
          </Pressable>
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
          <Text style={{ fontFamily: titleFont, fontSize: 15, lineHeight: lead(15, 21), color: colors.saffronDeep }}>
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
            // saffronDeep, not saffron: white on saffron is 4.37:1, under AA's 4.5:1.
            { flex: 1.3, backgroundColor: colors.saffronDeep, borderColor: colors.saffronDeep, borderRadius: radii.pill },
            pressed && { opacity: 0.85 },
          ]}
        >
          <Text style={{ fontFamily: titleFont, fontSize: 16, lineHeight: lead(16, 22), color: colors.onPrimary }}>
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
  card: { borderWidth: 1, paddingHorizontal: 14, paddingTop: 13, paddingBottom: 13 },
  heroCard: { paddingHorizontal: 0, paddingTop: 0, overflow: 'hidden' },
  heroBody: { paddingHorizontal: 14, paddingTop: 12 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  tag: { paddingHorizontal: 12, paddingVertical: 4, minHeight: 32, justifyContent: 'center' },
  causeChip: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 48, borderWidth: 1, paddingLeft: 4, paddingRight: 14 },
  verseCard: { justifyContent: 'space-between' },
  cardActions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6, gap: 8 },
  shareEnd: { marginLeft: 'auto' },
  chip: { borderWidth: 1.5, paddingHorizontal: 12, paddingVertical: 5 },
  journeyBtn: { borderWidth: 1.5, paddingHorizontal: 14, paddingVertical: 7, marginTop: 11, alignSelf: 'flex-start', minHeight: 44, justifyContent: 'center' },
  labelRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 },
  vaarRow: { flexDirection: 'row', gap: 6 },
  vaarCol: { flex: 1, alignItems: 'center', gap: 4 },
  vaarChip: { width: '100%', borderWidth: 1, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  todayDot: { width: 5, height: 5, borderRadius: 3 },
  vaarLine: { paddingHorizontal: 12, paddingVertical: 9, marginTop: 4 },
  sevaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  sevaTile: { width: '31.5%', flexGrow: 1, minHeight: 104, borderWidth: 1, alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, paddingHorizontal: 4 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 10 },
  dot: { height: 6, borderRadius: 3 },
  kathaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  kathaTile: { width: '48%', flexGrow: 1, borderWidth: 1, overflow: 'hidden' },
  kathaTileWide: { width: '100%' },
  kathaBand: { height: 40, alignItems: 'center', justifyContent: 'center' },
  kathaBody: { paddingHorizontal: 12, paddingTop: 8, paddingBottom: 12 },
  registerCard: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 22 },
  registerIcon: { width: 52, height: 52 },
  recordBtn: { minHeight: 44, paddingHorizontal: 14, alignItems: 'center', justifyContent: 'center' },
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
