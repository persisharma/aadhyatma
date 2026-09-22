/**
 * पितृ पक्ष परिचय (PRD-44, design.md §74) — the education layer that sits
 * beside the shipped reminder (public season notices) and the shipped guide
 * (the tila-tarpana vidhi). One reverent scroll in reading order: परिचय
 * (what / why / when), the fortnight's tithis, शास्त्र-वचन pointing into the
 * bundled readers, the कथाएँ, प्रश्नोत्तर, and — last — the three doors the
 * fortnight already has (तिथियाँ · विधि · स्मरण). Everything renders from
 * verified-only accessors; a section with no verified rows is absent, never a
 * placeholder. Tone is Pitru Smaran's (§63): muted gold-and-ink, no saffron
 * celebration, no streaks, no "must".
 *
 * Sept 2026 UX review: reading order is unchanged and no door moved above the
 * lessons — but a sticky chip rail now gets the reader BACK through a
 * thirty-nine-block scroll, and पक्ष की तिथियाँ names all sixteen days of the
 * fortnight instead of the two it can currently teach. The names come from the
 * engine (`TITHI_NAMES_*`), never from the draft registry rows: a day the app
 * cannot yet explain carries its name and a hollow marker, which is true, where
 * a section listing only the first and last day of a fortnight read as broken.
 */
import React, { useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import ReaderHeader from '@/components/ReaderHeader';
import { useGitaLanguage, type Lang } from '@/data/gita/language';
import {
  getPitruKathas,
  getPitruLessons,
  getPitruPrashna,
  getPitruPrinciples,
  type PitruFortnightDay,
  type PitruLessonEntry,
  type PitruReaderRef,
} from '@/data/pitru';
import { getVidhiById } from '@/data/vidhi';
import type { MoreStackParamList } from '@/navigation/types';
import { TITHI_NAMES_EN, TITHI_NAMES_HI } from '@/panchang/names';
import { useTheme } from '@/theme/ThemeContext';
import { fontFamilies } from '@/theme/typography';
import { commentaryByLang, contentByLang, meaningByLang, verseLinesByLang } from '@/utils/localize';
import { scriptBodyFont, scriptTitleFont } from '@/utils/langType';

type Props = NativeStackScreenProps<MoreStackParamList, 'PitruPakshaShiksha'>;

/** The rail's sections, in reading order. A section absent from the scroll drops its chip. */
type SectionKey = 'parichay' | 'tithi' | 'vachan' | 'katha' | 'prashna' | 'shabd';

/** purnima · krishna 1–14 · amavasya — the fortnight, in the order it is kept. */
const FORTNIGHT_DAYS: readonly PitruFortnightDay[] = [
  'purnima', 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 'amavasya',
];

/**
 * The engine's own name for a day of the fortnight. Krishna-paksha tithis live
 * at indices 15–29 of the tithi tables, so day n is `14 + n`.
 */
function fortnightDayName(day: PitruFortnightDay): { hi: string; en: string } {
  if (day === 'purnima') return { hi: 'पूर्णिमा श्राद्ध', en: 'Purnima Shraddha' };
  if (day === 'amavasya') return { hi: 'सर्वपितृ अमावस्या', en: 'Sarvapitri Amavasya' };
  return { hi: `${TITHI_NAMES_HI[14 + day]} श्राद्ध`, en: `${TITHI_NAMES_EN[14 + day]} Shraddha` };
}

/** Reader hand-off caption — the category-aware rule: पाठ for scripture, never आरती. */
function refCaption(ref: PitruReaderRef, lang: Lang): string {
  return ref.kind === 'gita'
    ? contentByLang(lang, 'गीता में पढ़ें ›', 'Read in the Gita ›')
    : contentByLang(lang, 'रामायण में पढ़ें ›', 'Read in the Ramayana ›');
}

export default function PitruPakshaShikshaScreen({ navigation }: Props) {
  const { colors, typography, spacing, radii } = useTheme();
  const { lang } = useGitaLanguage();
  const rootNav = useNavigation<any>();
  const titleFont = scriptTitleFont(lang, typography.readerTitle.fontFamily);
  const bodyFont = scriptBodyFont(lang, typography.meaning.fontFamily);

  const parichay = getPitruLessons('parichay');
  const tithis = getPitruLessons('tithi');
  const shabd = getPitruLessons('shabd');
  const principles = getPitruPrinciples();
  const kathas = getPitruKathas();
  const prashna = getPitruPrashna();
  const shraddhaVidhi = getVidhiById('shraddha-tarpan-vidhi');

  // Concept lessons open on their first paragraph; the rest unfolds in place
  // (one scroll, no per-lesson screen — a परिचय is read, not navigated).
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const toggle = (id: string) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  // The rail: one offset per rendered section, and the chip the scroll is in.
  const scrollRef = useRef<ScrollView | null>(null);
  const offsets = useRef<Partial<Record<SectionKey, number>>>({});
  const [activeSection, setActiveSection] = useState<SectionKey | null>(null);

  const sections = useMemo(() => {
    const rows: { key: SectionKey; labelHi: string; labelEn: string }[] = [];
    if (parichay.length > 0) rows.push({ key: 'parichay', labelHi: 'परिचय', labelEn: 'Intro' });
    rows.push({ key: 'tithi', labelHi: 'तिथियाँ', labelEn: 'Days' });
    if (principles.length > 0) rows.push({ key: 'vachan', labelHi: 'वचन', labelEn: 'Texts' });
    if (kathas.length > 0) rows.push({ key: 'katha', labelHi: 'कथाएँ', labelEn: 'Kathas' });
    if (prashna.length > 0) rows.push({ key: 'prashna', labelHi: 'प्रश्न', labelEn: 'Questions' });
    if (shabd.length > 0) rows.push({ key: 'shabd', labelHi: 'शब्द', labelEn: 'Glossary' });
    return rows;
  }, [parichay.length, principles.length, kathas.length, prashna.length, shabd.length]);

  /** Verified tithi teachings, keyed by the day they describe. */
  const tithiLessons = useMemo(() => {
    const byDay = new Map<PitruFortnightDay, PitruLessonEntry>();
    for (const lesson of tithis) {
      if (lesson.fortnightDay !== undefined) byDay.set(lesson.fortnightDay, lesson);
    }
    return byDay;
  }, [tithis]);

  const markSection = (key: SectionKey) => (e: { nativeEvent: { layout: { y: number } } }) => {
    offsets.current[key] = e.nativeEvent.layout.y;
    if (activeSection === null && key === sections[0]?.key) setActiveSection(key);
  };

  const openRef = (ref: PitruReaderRef) => {
    if (ref.kind === 'gita') {
      // GitaReader is registered on the More stack (PRD-19 P3), so Back returns here.
      navigation.navigate('GitaReader', { chapter: ref.chapter, initialIndex: ref.verseIndex });
      return;
    }
    rootNav.navigate('HomeTab', {
      screen: 'ValmikiRamayanReader',
      params: { chapter: ref.chapter, initialIndex: ref.verseIndex },
    });
  };

  const sectionLabelStyle = {
    fontFamily: typography.sectionLabel.fontFamily,
    fontSize: typography.sectionLabel.fontSize,
    letterSpacing: lang === 'en' ? typography.sectionLabel.letterSpacing : 0,
    color: colors.inkMuted,
    textTransform: 'uppercase' as const,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  };
  const card = [styles.card, { backgroundColor: colors.parchmentSoft, borderColor: colors.divider, borderRadius: radii.md }];

  const renderLesson = (lesson: PitruLessonEntry) => {
    const paragraphs = commentaryByLang(lang, lesson.bodyHi, lesson.bodyEn);
    const open = expanded[lesson.id] === true || paragraphs.length === 1;
    const shown = open ? paragraphs : paragraphs.slice(0, 1);
    return (
      <View key={lesson.id} style={card} testID={`pitru-lesson-${lesson.id}`}>
        <Text style={{ fontFamily: titleFont, fontSize: 16, lineHeight: 23, color: colors.ink }}>
          {contentByLang(lang, lesson.titleHi, lesson.titleEn)}
        </Text>
        {/* Body stays in `inkSoft` — the app's Hindi meaning/commentary register (verse pages,
            the katha screens this card links to) — but at reading scale: at 13.5/22 the clipped
            excerpt read as a dull caption; 15/25 carries the contrast the way the readers do. */}
        {shown.map((paragraph, idx) => (
          <Text
            key={`${lesson.id}-${idx}`}
            style={{ fontFamily: bodyFont, fontSize: 15, lineHeight: 25, color: colors.inkSoft, marginTop: idx === 0 ? 8 : 10 }}
          >
            {paragraph}
          </Text>
        ))}
        {paragraphs.length > 1 && (
          <Pressable
            onPress={() => toggle(lesson.id)}
            accessibilityRole="button"
            accessibilityLabel={`${open ? 'Collapse' : 'Expand'} lesson ${lesson.id}`}
            hitSlop={8}
            style={{ alignSelf: 'flex-start', marginTop: 10, minHeight: 32, justifyContent: 'center' }}
          >
            <Text style={{ fontFamily: titleFont, fontSize: 14.5, lineHeight: 21, color: colors.saffronDeep }}>
              {open ? contentByLang(lang, 'कम दिखाएँ', 'Show less') : contentByLang(lang, 'और पढ़ें ›', 'Read more ›')}
            </Text>
          </Pressable>
        )}
      </View>
    );
  };

  return (
    <View style={styles.root} testID="pitru-shiksha-screen">
      <LinearGradient colors={[colors.parchmentHighlight, colors.parchmentGradientEnd]} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <ReaderHeader
          variant="index"
          title={contentByLang(lang, 'पितृ पक्ष — परिचय', 'Pitru Paksha — an introduction')}
          onBack={() => navigation.goBack()}
        />

        {/* A way BACK through the scroll, not a new IA: reading order is
            unchanged and the chips open nothing the scroll does not already hold. */}
        <View testID="pitru-shiksha-rail" style={[styles.rail, { borderBottomColor: colors.divider }]}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: spacing.xxl, gap: 7 }}
          >
            {sections.map((section) => {
              const active = activeSection === section.key;
              return (
                <Pressable
                  key={section.key}
                  testID={`pitru-shiksha-rail-${section.key}`}
                  accessibilityRole="button"
                  accessibilityLabel={`Go to section ${section.key}`}
                  onPress={() => {
                    const y = offsets.current[section.key];
                    if (y !== undefined) {
                      setActiveSection(section.key);
                      scrollRef.current?.scrollTo({ y: Math.max(0, y - 8), animated: true });
                    }
                  }}
                  style={({ pressed }) => [
                    styles.chip,
                    {
                      borderColor: active ? colors.saffronDeep : colors.divider,
                      backgroundColor: active ? colors.saffronTint : colors.parchmentSoft,
                      borderRadius: radii.pill,
                    },
                    pressed && { opacity: 0.75 },
                  ]}
                >
                  <Text style={{ fontFamily: bodyFont, fontSize: 12, color: active ? colors.saffronDeep : colors.inkMuted }}>
                    {contentByLang(lang, section.labelHi, section.labelEn)}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <ScrollView
          ref={scrollRef}
          contentContainerStyle={[styles.scroll, { paddingHorizontal: spacing.xxl }]}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={64}
          onScroll={(e) => {
            const y = e.nativeEvent.contentOffset.y + 40;
            let current: SectionKey | null = null;
            for (const section of sections) {
              const offset = offsets.current[section.key];
              if (offset !== undefined && offset <= y) current = section.key;
            }
            if (current !== null && current !== activeSection) setActiveSection(current);
          }}
        >
          <Text style={{ fontFamily: titleFont, fontSize: 15, color: colors.gold, textAlign: 'center', letterSpacing: 6 }}>॥ ॐ ॥</Text>

          {parichay.length > 0 && (
            <View onLayout={markSection('parichay')}>
              <Text style={sectionLabelStyle}>{contentByLang(lang, 'परिचय', 'Introduction')}</Text>
              {parichay.map(renderLesson)}
            </View>
          )}

          {/* All sixteen days. A day the registry can teach carries its lesson
              and a gold marker; one it cannot carries the engine's name for it
              and a hollow marker — named, not yet explained. */}
          <View onLayout={markSection('tithi')}>
            <Text style={sectionLabelStyle}>{contentByLang(lang, 'पक्ष की तिथियाँ', 'Days of the fortnight')}</Text>
            {FORTNIGHT_DAYS.map((day, idx) => {
              const lesson = tithiLessons.get(day);
              const name = fortnightDayName(day);
              const paragraphs = lesson ? commentaryByLang(lang, lesson.bodyHi, lesson.bodyEn) : [];
              return (
                <View
                  key={String(day)}
                  style={[styles.tithiRow, { borderBottomColor: colors.divider, borderBottomWidth: idx === FORTNIGHT_DAYS.length - 1 ? 0 : 1 }]}
                  testID={lesson ? `pitru-tithi-${lesson.id}` : `pitru-tithi-day-${String(day)}`}
                >
                  <View
                    style={[
                      styles.marker,
                      lesson
                        ? { backgroundColor: colors.gold }
                        : { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.divider },
                    ]}
                  />
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={{ fontFamily: titleFont, fontSize: 14.5, lineHeight: 22, color: lesson ? colors.ink : colors.inkMuted }}>
                      {lesson ? contentByLang(lang, lesson.titleHi, lesson.titleEn) : contentByLang(lang, name.hi, name.en)}
                    </Text>
                    {paragraphs.map((paragraph, i) => (
                      <Text key={i} style={{ fontFamily: bodyFont, fontSize: 13, lineHeight: 20, color: colors.inkSoft, marginTop: 4 }}>
                        {paragraph}
                      </Text>
                    ))}
                  </View>
                </View>
              );
            })}
          </View>

          {principles.length > 0 && (
            <View onLayout={markSection('vachan')}>
              <Text style={sectionLabelStyle}>{contentByLang(lang, 'शास्त्र-वचन', 'From the texts')}</Text>
              {principles.map((entry) => (
                <View key={entry.id} style={card} testID={`pitru-principle-${entry.id}`}>
                  <Text style={{ fontFamily: titleFont, fontSize: 14.5, lineHeight: 21, color: colors.ink }}>
                    {contentByLang(lang, entry.titleHi, entry.titleEn)}
                  </Text>
                  {entry.verseLines && entry.iastLines
                    ? verseLinesByLang(lang, entry.verseLines, entry.iastLines).map((line, idx) => (
                        <Text
                          key={`${entry.id}-v${idx}`}
                          style={{ fontFamily: lang === 'en' ? fontFamilies.latinItalic : titleFont, fontSize: 14.5, lineHeight: 24, color: colors.saffronDeep, textAlign: 'center', marginTop: idx === 0 ? 10 : 0 }}
                        >
                          {line}
                        </Text>
                      ))
                    : null}
                  <Text style={{ fontFamily: fontFamilies.latinItalic, fontSize: 11.5, color: colors.gold, textAlign: 'center', marginTop: 6 }}>
                    {contentByLang(lang, entry.citeHi, entry.citeEn)}
                  </Text>
                  <Text style={{ fontFamily: bodyFont, fontSize: 13.5, lineHeight: 22, color: colors.inkSoft, marginTop: 8 }}>
                    {meaningByLang(lang, entry.meaningHi, entry.meaningEn)}
                  </Text>
                  {entry.ref && (
                    <Pressable
                      onPress={() => openRef(entry.ref!)}
                      accessibilityRole="button"
                      accessibilityLabel={`Open ${entry.ref.kind} reader for ${entry.id}`}
                      testID={`pitru-principle-ref-${entry.id}`}
                      style={[styles.refPill, { borderColor: colors.gold, borderRadius: radii.pill }]}
                    >
                      <Text style={{ fontFamily: titleFont, fontSize: 12.5, color: colors.saffronDeep }}>{refCaption(entry.ref, lang)}</Text>
                    </Pressable>
                  )}
                </View>
              ))}
            </View>
          )}

          {kathas.length > 0 && (
            <View onLayout={markSection('katha')}>
              <Text style={sectionLabelStyle}>{contentByLang(lang, 'कथाएँ', 'Kathas')}</Text>
              {kathas.map((katha) => (
                <Pressable
                  key={katha.id}
                  onPress={() => navigation.navigate('PitruKatha', { kathaId: katha.id })}
                  accessibilityRole="button"
                  accessibilityLabel={`Open katha ${katha.id}`}
                  testID={`pitru-katha-${katha.id}`}
                  style={({ pressed }) => [styles.doorRow, { backgroundColor: colors.parchmentSoft, borderColor: colors.divider, borderRadius: radii.md }, pressed && { opacity: 0.8 }]}
                >
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={{ fontFamily: titleFont, fontSize: 15, color: colors.ink }}>
                      ॥ {contentByLang(lang, katha.titleHi, katha.titleEn)}
                    </Text>
                    <Text style={{ fontFamily: bodyFont, fontSize: 12, lineHeight: 18, color: colors.inkMuted, marginTop: 2 }}>
                      {contentByLang(lang, katha.subtitleHi, katha.subtitleEn)}
                    </Text>
                  </View>
                  <Text style={{ color: colors.inkSoft, fontSize: 17 }}>›</Text>
                </Pressable>
              ))}
            </View>
          )}

          {prashna.length > 0 && (
            <View onLayout={markSection('prashna')}>
              <Text style={sectionLabelStyle}>{contentByLang(lang, 'प्रश्नोत्तर', 'Questions people ask')}</Text>
              {prashna.map((entry) => (
                <View key={entry.id} style={card} testID={`pitru-prashna-${entry.id}`}>
                  <Text style={{ fontFamily: titleFont, fontSize: 14.5, lineHeight: 21, color: colors.ink }}>
                    {contentByLang(lang, entry.questionHi, entry.questionEn)}
                  </Text>
                  <Text style={{ fontFamily: bodyFont, fontSize: 13.5, lineHeight: 22, color: colors.inkSoft, marginTop: 6 }}>
                    {meaningByLang(lang, entry.answerHi, entry.answerEn)}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {shabd.length > 0 && (
            <View onLayout={markSection('shabd')}>
              <Text style={sectionLabelStyle}>{contentByLang(lang, 'शब्द', 'Glossary')}</Text>
              {/* One card, but ruled: eleven terms stacked on 10 px of margin read
                  as a single paragraph — this is the section people scan. */}
              <View style={[styles.card, styles.glossary, { backgroundColor: colors.parchmentSoft, borderColor: colors.divider, borderRadius: radii.md }]}>
                {shabd.map((term, idx) => (
                  <View
                    key={term.id}
                    testID={`pitru-shabd-${term.id}`}
                    style={[
                      styles.glossaryRow,
                      { borderBottomColor: colors.divider, borderBottomWidth: idx === shabd.length - 1 ? 0 : 1 },
                    ]}
                  >
                    <Text style={{ fontFamily: titleFont, fontSize: 14, lineHeight: 21, color: colors.ink }}>
                      {contentByLang(lang, term.titleHi, term.titleEn)}
                    </Text>
                    <Text style={{ fontFamily: bodyFont, fontSize: 13, lineHeight: 20, color: colors.inkSoft, marginTop: 2 }}>
                      {commentaryByLang(lang, term.bodyHi, term.bodyEn).join(' ')}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* The three doors the fortnight already has — reached LAST, once the
              reader knows what they open. */}
          <Text style={sectionLabelStyle}>{contentByLang(lang, 'अब', 'Now')}</Text>
          <Pressable
            onPress={() => navigation.navigate('PitruPakshaOverview')}
            accessibilityRole="button"
            accessibilityLabel="Open Pitru Paksha overview"
            testID="pitru-shiksha-overview-door"
            style={({ pressed }) => [styles.doorRow, { backgroundColor: colors.goldTint, borderColor: colors.gold, borderRadius: radii.md }, pressed && { opacity: 0.8 }]}
          >
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={{ fontFamily: titleFont, fontSize: 15, color: colors.ink }}>
                {contentByLang(lang, 'इस वर्ष की तिथियाँ', 'This year’s dates')}
              </Text>
              <Text style={{ fontFamily: bodyFont, fontSize: 12, lineHeight: 18, color: colors.inkMuted, marginTop: 2 }}>
                {contentByLang(lang, 'पखवाड़े की तालिका · आपके परिवार के दिन', 'The fortnight table · your family’s days')}
              </Text>
            </View>
            <Text style={{ color: colors.inkSoft, fontSize: 17 }}>›</Text>
          </Pressable>
          {shraddhaVidhi && (
            <Pressable
              onPress={() => navigation.navigate('VidhiDetail', { vidhiId: shraddhaVidhi.id })}
              accessibilityRole="button"
              accessibilityLabel="Open Tila-Tarpana remembrance guide"
              testID="pitru-shiksha-vidhi-door"
              style={({ pressed }) => [styles.doorRow, { backgroundColor: colors.goldTint, borderColor: colors.gold, borderRadius: radii.md }, pressed && { opacity: 0.8 }]}
            >
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={{ fontFamily: titleFont, fontSize: 15, color: colors.ink }}>
                  ॥ {contentByLang(lang, shraddhaVidhi.titleHi, shraddhaVidhi.titleEn)}
                </Text>
                <Text style={{ fontFamily: bodyFont, fontSize: 12, lineHeight: 18, color: colors.inkMuted, marginTop: 2 }}>
                  {contentByLang(lang, 'सीमित गृहस्थ मार्गदर्शिका', 'Limited household guide')}
                </Text>
              </View>
              <Text style={{ color: colors.inkSoft, fontSize: 17 }}>›</Text>
            </Pressable>
          )}
          <Pressable
            onPress={() => navigation.navigate('PitruSmaranList')}
            accessibilityRole="button"
            accessibilityLabel="Open Pitru Smaran list"
            testID="pitru-shiksha-smaran-door"
            style={({ pressed }) => [styles.doorRow, { backgroundColor: colors.goldTint, borderColor: colors.gold, borderRadius: radii.md }, pressed && { opacity: 0.8 }]}
          >
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={{ fontFamily: titleFont, fontSize: 15, color: colors.ink }}>
                ॥ {contentByLang(lang, 'पितृ स्मरण', 'Pitru Smaran')}
              </Text>
              <Text style={{ fontFamily: bodyFont, fontSize: 12, lineHeight: 18, color: colors.inkMuted, marginTop: 2 }}>
                {contentByLang(lang, 'अपने पितरों की तिथियाँ सहेजें', 'Save your ancestors’ tithis')}
              </Text>
            </View>
            <Text style={{ color: colors.inkSoft, fontSize: 17 }}>›</Text>
          </Pressable>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  scroll: { paddingTop: 10, paddingBottom: 40 },
  rail: { paddingVertical: 9, borderBottomWidth: 1 },
  chip: { borderWidth: 1, paddingHorizontal: 11, paddingVertical: 5, minHeight: 30, justifyContent: 'center' },
  card: { borderWidth: 1, paddingHorizontal: 14, paddingVertical: 13, marginBottom: 10 },
  glossary: { paddingVertical: 0 },
  glossaryRow: { paddingVertical: 11 },
  tithiRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 11 },
  marker: { width: 8, height: 8, borderRadius: 4, marginTop: 7 },
  refPill: { alignSelf: 'center', borderWidth: 1, paddingHorizontal: 14, paddingVertical: 7, marginTop: 10, minHeight: 32, justifyContent: 'center' },
  doorRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, paddingHorizontal: 14, paddingVertical: 13, marginBottom: 10, minHeight: 52 },
});
