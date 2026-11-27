/**
 * दान-पुण्य home (PRD-26, design.md §73) — the educate-first surface, built to
 * the approved Option B design (Nov 2026, revamp prototype
 * `docs/evaluations/daan-punya-revamp-2026-11-20`):
 *
 *   1. a tall painted TODAY card — the day's daan over the Annapurna painting
 *      (the covered festival on a festival day, else the vaar), its items as
 *      glass tiles and the प्रयोजन it serves as painted chips;
 *   2. the two standing doors right under it (दान-द्वार, दान करें);
 *   3. every vaar's daan (chips + the selected day's card);
 *   4. three short reads → the Learn reader (DaanLearnScreen) at that page;
 *   5. the nine kinds of seva with their painted icons;
 *   6. the verse spine as night panels;
 *   7. the teaching-kathas as two-up cards;
 *   8. the खाता card.
 *
 * THE RELAXED §2.7 CONTRACT HOLDS: educate is the default, not a gate; both
 * standing doors are present every day; the app never transacts; the खाता is
 * never gated. Every word comes from the verified registries (`data/daan/*`);
 * "today" is the device date. Lines carry facts, never stance (design.md §73),
 * and nothing narrates where the register is stored
 * (`userFacingImplementationCopy.test.ts`).
 */
import React, { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';

import BackgroundArtwork from '@/components/BackgroundArtwork';
import DaanCauseIcon from '@/components/DaanCauseIcon';
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
import { DAAN_LEARN_READS } from '@/data/daan/learnReads';
import { usePanchangCalendarSystem, useObservancesForDate } from '@/panchang/usePanchang';
import type { DaanStackParamList } from '@/navigation/types';
import { useTheme } from '@/theme/ThemeContext';
import { contentByLang, meaningByLang, verseLinesByLang } from '@/utils/localize';
import { isLatinLang, scriptBodyFont, scriptTitleFont } from '@/utils/langType';

type Props = NativeStackScreenProps<DaanStackParamList, 'DaanPunya'>;

/** The painted today card's height — the design's portrait hero. */
const HERO_HEIGHT = 440;
/** The peek of the next verse panel that tells the reader the shelf scrolls. */
const CAROUSEL_PEEK = 28;
const CAROUSEL_GAP = 10;
const READ_CARD_WIDTH = 220;

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
  const cap = (text: string) => (latin ? text.charAt(0).toUpperCase() + text.slice(1) : text);


  const [calendarSystem] = usePanchangCalendarSystem();
  // Stable per calendar day — an inline `new Date()` changes every render, which
  // makes useObservancesForDate's selectionKey churn and drives its effect into a
  // setState loop ("Maximum update depth"). Mirror the Home Today surfaces.
  const todayKey = useTodayKey();
  const today = useMemo(() => new Date(todayKey), [todayKey]);
  const observances = useObservancesForDate(today, calendarSystem);
  // A covered observance takes the today card; otherwise the vaar does.
  const todayOccasion = observances
    .map((o) => getDaanOccasionForRule(o.rule.id))
    .find((occasion) => occasion != null) ?? null;
  const todayIdx = today.getDay();
  const [vaarIdx, setVaarIdx] = useState(todayIdx);
  const vaar = DAAN_VAAR_ENTRIES[vaarIdx];
  const todayVaar = DAAN_VAAR_ENTRIES[todayIdx];

  // A cause shows only where a verified org serves it (§27.12 — never an empty shelf).
  const liveCauses = useMemo(() => {
    const orgs = getDaanOrgs(today);
    return DAAN_CAUSES.filter((cause) => orgs.some((org) => org.causes.includes(cause.id)));
  }, [today]);
  const liveIds = useMemo(() => new Set(liveCauses.map((cause) => cause.id)), [liveCauses]);
  const causeMeta = (id: DaanCause) => DAAN_CAUSES.find((cause) => cause.id === id)!;
  const openCause = (id: DaanCause) => navigation.navigate('DaanDirectory', { causes: [id] });

  // ── Today: the festival's daan when one is covered, else the vaar's ──
  const vaarItems = splitVaarItems(contentByLang(lang, todayVaar.itemsHi, todayVaar.itemsEn));
  const heroEyebrow = todayOccasion
    ? contentByLang(lang, `आज · ${todayOccasion.titleHi}`, `Today · ${todayOccasion.titleEn}`)
    : contentByLang(lang, `आज · ${todayVaar.vaarHi} · ${todayVaar.grahaHi} का वार`, `Today · ${todayVaar.vaarEn} · ${todayVaar.grahaEn}’s day`);
  const heroTags = todayOccasion
    ? todayOccasion.items.map((item) => contentByLang(lang, item.nameHi, item.nameEn))
    : vaarItems.tags.map(cap);
  const heroTitle = heroTags.join(latin ? ', ' : ', ');
  const heroNote = todayOccasion ? null : vaarItems.note;
  const todayCauses = ((todayOccasion?.causes ?? todayVaar.causes) ?? []).filter((id) => liveIds.has(id));

  const principles = getDaanPrinciples();
  const kathas = getDaanKathas();

  // Verse carousel: which panel is in view (dots).
  const [verseIdx, setVerseIdx] = useState(0);
  const cardWidth = width - spacing.readingGutter * 2 - CAROUSEL_PEEK;
  const snap = cardWidth + CAROUSEL_GAP;

  const night = [colors.skyNightTop, colors.skyNightUpper, colors.skyNightHorizon] as const;
  const sectionTitle = { fontFamily: titleFont, fontSize: 19, lineHeight: lead(19, 27), color: colors.ink };
  const eyebrow = (color: string) => ({
    fontFamily: typography.sectionLabel.fontFamily,
    fontSize: 11,
    lineHeight: lead(11, 16),
    letterSpacing: latin ? 1.1 : 0,
    textTransform: 'uppercase' as const,
    color,
  });

  // The three short reads open the Learn reader at that page (design: the
  // guide's steps 1, 2 and 5). Their lines come from `data/daan/learnReads.ts`.
  const readGradients = [
    [colors.skyNightTop, colors.skyNightUpper],
    [colors.skyNightUpper, colors.skyNightLower],
    [colors.skyNightLower, colors.skyNightHorizon],
  ] as const;
  const readIcons = [storybookSources.daan, storybookSources.suktam, storybookSources.granth] as const;
  const reads = DAAN_LEARN_READS.map((entry, i) => ({
    id: entry.id,
    icon: readIcons[i],
    title: contentByLang(lang, entry.title.hi, entry.title.en),
    sub: contentByLang(lang, entry.card.hi, entry.card.en),
    open: () => navigation.navigate('DaanLearn', { read: entry.id }),
    gradient: readGradients[i],
  }));

  return (
    <View style={[styles.root, { backgroundColor: colors.parchment }]}>
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
        contentContainerStyle={{ paddingHorizontal: spacing.readingGutter, paddingTop: spacing.sm, paddingBottom: spacing.xxl, gap: 22 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── 1. The painted today card ─────────────────────────────────── */}
        <View testID="daan-today-hero" style={[styles.hero, { borderRadius: radii.xl }, elevation.lifted]}>
          <BackgroundArtwork source={getDaanBackground()} style={StyleSheet.absoluteFill} resizeMode="cover" />
          <LinearGradient
            colors={['rgba(22, 10, 3, 0)', 'rgba(22, 10, 3, 0.86)', 'rgba(22, 10, 3, 0.96)']}
            locations={[0, 0.34, 1]}
            style={styles.heroShade}
          >
            <Text style={eyebrow(colors.nightGold)}>{heroEyebrow}</Text>
            <Text testID={todayOccasion ? 'daan-today-card' : undefined} style={{ fontFamily: titleFont, fontSize: 24, lineHeight: lead(24, 32), color: colors.nightInk, marginTop: 4 }}>
              {heroTitle}
            </Text>
            {heroNote ? (
              <Text style={{ fontFamily: bodyFont, fontSize: 14, lineHeight: lead(14, 21), color: colors.nightInkSoft }}>{heroNote}</Text>
            ) : null}
            {todayOccasion ? (
              <Pressable
                testID="daan-today-journey"
                accessibilityRole="button"
                accessibilityLabel="Open today's daan journey"
                onPress={() => navigation.navigate('DaanJourney', { occasionId: todayOccasion.id })}
                style={styles.heroLink}
              >
                <Text style={{ fontFamily: titleFont, fontSize: 14, lineHeight: lead(14, 20), color: colors.nightGold }}>
                  {contentByLang(lang, 'इस दिन की दान-यात्रा ›', "This day's daan journey ›")}
                </Text>
              </Pressable>
            ) : null}
            <View testID="daan-today-items" style={styles.tileRow}>
              {heroTags.map((tag) => (
                <View key={tag} style={[styles.glassTile, { backgroundColor: colors.nightGlass, borderColor: colors.nightGlassBorder, borderRadius: radii.lg }]}>
                  <Text style={{ fontFamily: titleFont, fontSize: 13.5, lineHeight: lead(13.5, 19), color: colors.nightInk, textAlign: 'center' }}>{tag}</Text>
                </View>
              ))}
            </View>
            {todayCauses.length > 0 ? (
              <View style={[styles.tileRow, { alignItems: 'center' }]}>
                <Text style={{ fontFamily: bodyFont, fontSize: 12.5, lineHeight: lead(12.5, 18), color: colors.nightInkSoft }}>
                  {contentByLang(lang, 'सेवा ·', 'Serves ·')}
                </Text>
                {todayCauses.map((id) => (
                  <Pressable
                    key={id}
                    testID={`daan-today-cause-${id}`}
                    accessibilityRole="button"
                    accessibilityLabel={`${causeMeta(id).nameEn}: places that serve it`}
                    onPress={() => openCause(id)}
                    style={({ pressed }) => [
                      styles.causeChip,
                      { backgroundColor: colors.nightGlass, borderColor: colors.nightGlassBorder, borderRadius: radii.pill },
                      pressed && { opacity: 0.75 },
                    ]}
                  >
                    <DaanCauseIcon cause={id} size={30} testID={`daan-today-cause-icon-${id}`} />
                    <Text style={{ fontFamily: titleFont, fontSize: 13, lineHeight: lead(13, 18), color: colors.nightInk }}>
                      {contentByLang(lang, causeMeta(id).nameHi, causeMeta(id).nameEn)}
                    </Text>
                  </Pressable>
                ))}
              </View>
            ) : null}
          </LinearGradient>
        </View>

        {/* ── 2. The standing doors (§27.1) ─────────────────────────────── */}
        <View testID="daan-home-actions" style={styles.doorRow}>
          <Pressable
            testID="daan-home-dwaar"
            accessibilityRole="button"
            accessibilityLabel={contentByLang(lang, 'दान-द्वार — सत्यापित संस्थाएँ', 'Daan-dwaar — verified orgs')}
            onPress={() => navigation.navigate('DaanDirectory', {})}
            style={({ pressed }) => [styles.door, { flex: 1, borderColor: colors.saffron, borderRadius: radii.pill }, pressed && { opacity: 0.7 }]}
          >
            <Text style={{ fontFamily: titleFont, fontSize: 15, lineHeight: lead(15, 21), color: colors.saffronDeep }}>
              {contentByLang(lang, 'दान-द्वार ›', 'Daan-dwaar ›')}
            </Text>
          </Pressable>
          <Pressable
            testID="daan-home-donate"
            accessibilityRole="button"
            accessibilityLabel={contentByLang(lang, 'दान करें', 'Donate')}
            onPress={() => navigation.navigate('DaanJourney', todayOccasion ? { occasionId: todayOccasion.id } : {})}
            style={({ pressed }) => [
              styles.door,
              // saffronDeep, not saffron: white on saffron is 4.37:1, under AA's 4.5:1.
              { flex: 1.3, backgroundColor: colors.saffronDeep, borderColor: colors.saffronDeep, borderRadius: radii.pill },
              pressed && { opacity: 0.85 },
            ]}
          >
            <Text style={{ fontFamily: titleFont, fontSize: 15.5, lineHeight: lead(15.5, 21), color: colors.onPrimary }}>
              {contentByLang(lang, 'दान करें', 'Donate')}
            </Text>
          </Pressable>
        </View>

        {/* ── 3. Every day has its daan ─────────────────────────────────── */}
        <View>
          <Text style={[sectionTitle, { marginBottom: 10 }]}>{contentByLang(lang, 'हर वार का दान', 'Every day has its daan')}</Text>
          <View style={styles.vaarRow}>
            {DAAN_VAAR_ENTRIES.map((entry) => {
              const active = entry.weekday === vaarIdx;
              const isToday = entry.weekday === todayIdx;
              return (
                <Pressable
                  key={entry.weekday}
                  testID={`daan-vaar-${entry.weekday}`}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  accessibilityLabel={`Vaar ${entry.vaarEn}${isToday ? ', today' : ''}`}
                  onPress={() => setVaarIdx(entry.weekday)}
                  style={[
                    styles.vaarChip,
                    {
                      backgroundColor: active ? colors.skyNightUpper : colors.parchmentSoft,
                      borderColor: active ? colors.skyNightUpper : colors.divider,
                      borderRadius: radii.md,
                    },
                  ]}
                >
                  <Text numberOfLines={1} style={{ fontFamily: titleFont, fontSize: 12, lineHeight: lead(12, 17), color: active ? colors.nightGold : colors.inkSoft }}>
                    {vaarShortName(lang, entry.vaarHi, entry.vaarEn)}
                  </Text>
                  {/* The "today" dot — colour never alone: the chip's a11y label names today. */}
                  <View style={[styles.todayDot, { backgroundColor: isToday ? (active ? colors.nightGold : colors.saffron) : 'transparent' }]} />
                </Pressable>
              );
            })}
          </View>
          <View
            testID="daan-vaar-line"
            style={[styles.dayCard, { backgroundColor: colors.parchmentSoft, borderColor: colors.divider, borderRadius: radii.lg }]}
          >
            {vaar.causes?.[0] ? <DaanCauseIcon cause={vaar.causes[0]} size={44} testID="daan-vaar-icon" /> : null}
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={eyebrow(colors.saffronDeep)}>
                {(vaarIdx === todayIdx ? contentByLang(lang, 'आज · ', 'Today · ') : '') +
                  contentByLang(lang, `${vaar.vaarHi} · ${vaar.grahaHi} का वार`, `${vaar.vaarEn} · ${vaar.grahaEn}’s day`)}
              </Text>
              <Text style={{ fontFamily: titleFont, fontSize: 15, lineHeight: lead(15, 22), color: colors.ink }}>
                {cap(contentByLang(lang, vaar.itemsHi, vaar.itemsEn))}
              </Text>
            </View>
          </View>
        </View>

        {/* ── 4. Learn daan in three short reads ────────────────────────── */}
        <View>
          <Text style={[sectionTitle, { marginBottom: 10 }]}>{contentByLang(lang, 'दान को तीन छोटे पाठों में समझें', 'Learn daan in three short reads')}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -spacing.readingGutter }} contentContainerStyle={{ paddingHorizontal: spacing.readingGutter, gap: 10 }}>
            {reads.map((read) => (
              <Pressable
                key={read.id}
                testID={`daan-read-${read.id}`}
                accessibilityRole="button"
                accessibilityLabel={`Read ${read.id}: ${read.title}`}
                onPress={read.open}
                style={({ pressed }) => [pressed && { opacity: 0.85 }]}
              >
                <LinearGradient colors={read.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.readCard, { borderRadius: radii.xl }]}>
                  <Image source={read.icon} style={styles.readIcon} resizeMode="contain" accessibilityElementsHidden importantForAccessibility="no" />
                  <Text style={eyebrow(colors.nightGold)}>{contentByLang(lang, `पाठ ${read.id}`, `Read ${read.id}`)}</Text>
                  <Text style={{ fontFamily: titleFont, fontSize: 17, lineHeight: lead(17, 25), color: colors.nightInk }}>{read.title}</Text>
                  <Text style={{ fontFamily: bodyFont, fontSize: 13, lineHeight: lead(13, 20), color: colors.nightInkSoft }}>{read.sub}</Text>
                </LinearGradient>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* ── 5. Nine kinds of seva — the दान-द्वार's causes, painted ─────── */}
        <View>
          <Text style={[sectionTitle, { marginBottom: 10 }]}>
            {liveCauses.length === 9
              ? contentByLang(lang, 'नौ प्रकार की सेवा', 'Nine kinds of seva')
              : contentByLang(lang, 'सेवा के प्रकार', 'Kinds of seva')}
          </Text>
          <View testID="daan-seva-grid" style={styles.sevaGrid}>
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
        </View>

        {/* ── 6. What the shastra says — night panels ───────────────────── */}
        <View>
          <View style={styles.labelRow}>
            <Text style={sectionTitle}>{contentByLang(lang, 'शास्त्र क्या कहते हैं', 'What the shastra says')}</Text>
            <Text style={{ fontFamily: bodyFont, fontSize: 11.5, lineHeight: lead(11.5, 16), color: colors.inkMuted }}>
              {`${verseIdx + 1} / ${principles.length}`}
            </Text>
          </View>
          <ScrollView
            testID="daan-principle-carousel"
            horizontal
            showsHorizontalScrollIndicator={false}
            decelerationRate="fast"
            snapToInterval={snap}
            snapToAlignment="start"
            style={{ marginHorizontal: -spacing.readingGutter }}
            contentContainerStyle={{ paddingHorizontal: spacing.readingGutter, gap: CAROUSEL_GAP }}
            onMomentumScrollEnd={(e) => {
              const idx = Math.round(e.nativeEvent.contentOffset.x / snap);
              setVerseIdx(Math.max(0, Math.min(principles.length - 1, idx)));
            }}
          >
            {principles.map((entry) => (
              <LinearGradient
                key={entry.id}
                testID={`daan-principle-${entry.id}`}
                colors={night}
                locations={[0, 0.55, 1]}
                style={[styles.versePanel, { width: cardWidth, borderColor: colors.gold, borderRadius: radii.xl }]}
              >
                <View>
                  {entry.verseLines ? (
                    <Text style={{ fontFamily: titleFont, fontSize: 16, lineHeight: lead(16, 28), color: colors.nightGold, textAlign: 'center' }}>
                      {verseLinesByLang(lang, entry.verseLines, entry.iastLines ?? entry.verseLines).join('\n')}
                    </Text>
                  ) : (
                    <Text style={{ fontFamily: titleFont, fontSize: 16, lineHeight: lead(16, 24), color: colors.nightGold, textAlign: 'center' }}>
                      {contentByLang(lang, entry.titleHi, entry.titleEn)}
                    </Text>
                  )}
                  <Text style={[eyebrow(colors.nightInkMuted), { textAlign: 'center', marginTop: 8 }]}>
                    {contentByLang(lang, entry.citeHi, entry.citeEn)}
                  </Text>
                  <Text style={{ fontFamily: bodyFont, fontSize: 13.5, lineHeight: lead(13.5, 21), color: colors.nightInkSoft, marginTop: 10 }}>
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
                      style={[styles.chip, { borderColor: colors.nightGold, borderRadius: radii.pill }]}
                    >
                      <Text style={{ fontFamily: titleFont, fontSize: 12.5, lineHeight: lead(12.5, 18), color: colors.nightGold }}>
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
              </LinearGradient>
            ))}
          </ScrollView>
          <View style={styles.dots} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
            {principles.map((entry, i) => (
              <View key={entry.id} style={[styles.dot, { backgroundColor: i === verseIdx ? colors.saffronDeep : colors.dotRest, width: i === verseIdx ? 18 : 6 }]} />
            ))}
          </View>
        </View>

        {/* ── 7. Stories of giving — two-up cards ──────────────────────── */}
        <View>
          <Text style={[sectionTitle, { marginBottom: 10 }]}>{contentByLang(lang, 'दान की कथाएँ', 'Stories of giving')}</Text>
          <View testID="daan-katha-shelf" style={styles.kathaGrid}>
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
                <LinearGradient colors={night} locations={[0, 0.55, 1]} style={styles.kathaBand}>
                  <Text style={{ fontFamily: titleFont, fontSize: 22, lineHeight: lead(22, 28), color: colors.nightGold }} accessibilityElementsHidden importantForAccessibility="no">॥</Text>
                  <Text style={{ fontFamily: typography.sectionLabel.fontFamily, fontSize: 11, lineHeight: lead(11, 16), color: colors.nightInkSoft }}>{`${index + 1} / ${kathas.length}`}</Text>
                </LinearGradient>
                <View style={styles.kathaBody}>
                  <Text style={{ fontFamily: titleFont, fontSize: 15, lineHeight: lead(15, 22), color: colors.ink }}>
                    {contentByLang(lang, katha.titleHi, katha.titleEn)}
                  </Text>
                  <Text style={{ fontFamily: bodyFont, fontSize: 12.5, lineHeight: lead(12.5, 19), color: colors.inkMuted, marginTop: 2 }}>
                    {contentByLang(lang, katha.subtitleHi, katha.subtitleEn)}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        </View>

        {/* ── 8. The खाता card ──────────────────────────────────────────── */}
        <View
          testID="daan-register-card"
          style={[styles.registerCard, { backgroundColor: colors.goldChipBg, borderColor: colors.cardActiveBorder, borderRadius: radii.lg }]}
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
            onPress={() => navigation.navigate('DaanEntry', todayOccasion ? { occasionId: todayOccasion.id } : undefined)}
            style={({ pressed }) => [styles.recordBtn, { backgroundColor: colors.saffronDeep, borderRadius: radii.pill }, pressed && { opacity: 0.85 }]}
          >
            <Text style={{ fontFamily: titleFont, fontSize: 13.5, lineHeight: lead(13.5, 19), color: colors.onPrimary }}>
              {contentByLang(lang, 'दर्ज करें', 'Record')}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  headerBtn: { width: 44, height: 44, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  hero: { height: HERO_HEIGHT, overflow: 'hidden' },
  heroShade: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingTop: 72, paddingHorizontal: 18, paddingBottom: 18, gap: 4 },
  heroLink: { minHeight: 44, justifyContent: 'center', alignSelf: 'flex-start' },
  tileRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  glassTile: { flexGrow: 1, minWidth: 84, minHeight: 44, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 8, alignItems: 'center', justifyContent: 'center' },
  causeChip: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 44, borderWidth: 1, paddingLeft: 4, paddingRight: 12 },
  doorRow: { flexDirection: 'row', gap: 10, marginTop: -8 },
  door: { minHeight: 52, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12 },
  labelRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 },
  vaarRow: { flexDirection: 'row', gap: 5 },
  vaarChip: { flex: 1, minHeight: 52, borderWidth: 1, alignItems: 'center', justifyContent: 'center', gap: 4 },
  todayDot: { width: 5, height: 5, borderRadius: 3 },
  dayCard: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12, marginTop: 10 },
  readCard: { width: READ_CARD_WIDTH, padding: 16, gap: 6, minHeight: 200 },
  readIcon: { width: 56, height: 56 },
  sevaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  sevaTile: { width: '31.5%', flexGrow: 1, minHeight: 104, borderWidth: 1, alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, paddingHorizontal: 4 },
  versePanel: { borderWidth: 1, paddingHorizontal: 18, paddingTop: 20, paddingBottom: 14, justifyContent: 'space-between' },
  cardActions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10, gap: 8 },
  shareEnd: { marginLeft: 'auto' },
  chip: { borderWidth: 1.5, paddingHorizontal: 12, minHeight: 44, justifyContent: 'center' },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 12 },
  dot: { height: 6, borderRadius: 3 },
  kathaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  kathaTile: { width: '48%', flexGrow: 1, borderWidth: 1, overflow: 'hidden' },
  kathaTileWide: { width: '100%' },
  kathaBand: { height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14 },
  kathaBody: { paddingHorizontal: 12, paddingTop: 10, paddingBottom: 14 },
  registerCard: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 14 },
  registerIcon: { width: 56, height: 56 },
  recordBtn: { minHeight: 44, paddingHorizontal: 14, alignItems: 'center', justifyContent: 'center' },
});
