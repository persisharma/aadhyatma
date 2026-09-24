/**
 * पितृ पक्ष परिचय (PRD-44, design.md §74) — the education layer that sits
 * beside the shipped reminder (public season notices) and the shipped guide
 * (the tila-tarpana vidhi). Everything renders from verified-only accessors;
 * a section with no verified rows is absent, never a placeholder. Tone is
 * Pitru Smaran's (§63): muted gold-and-ink, no saffron celebration, no
 * streaks, no "must".
 *
 * Sept 2026 UX review — a HUB, shaped by how each kind of content is used.
 * It used to be one scroll of six content types with three interaction models
 * (unlock a lesson, read a verse card, tap into a story) and ~39 blocks; the
 * content was fine, the stacking was the problem. Now:
 *   - the introduction is READ: one card opens the paged reader
 *     (`PitruParichayReader`, the Vrat Katha shell) — no और पढ़ें to unlock;
 *   - the questions people arrive with are SCANNED: an accordion, second;
 *   - verses and stories are BROWSED: the carousel and tile shelf §73 uses;
 *   - the glossary is LOOKED UP: a door that unfolds a ruled list;
 *   - the three doors the fortnight already has close the screen.
 * The fortnight itself is not listed here — it is the dated overview's.
 */
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
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
  type PitruReaderRef,
} from '@/data/pitru';
import { getVidhiById } from '@/data/vidhi';
import type { MoreStackParamList } from '@/navigation/types';
import { useTheme } from '@/theme/ThemeContext';
import { commentaryByLang, contentByLang, meaningByLang, verseLinesByLang } from '@/utils/localize';
import { scriptBodyFont, scriptTitleFont } from '@/utils/langType';

type Props = NativeStackScreenProps<MoreStackParamList, 'PitruPakshaShiksha'>;

/** The peek of the next verse card that tells the reader the shelf scrolls — §73's values. */
const CAROUSEL_PEEK = 28;
const CAROUSEL_GAP = 10;
const KATHA_TILE_WIDTH = 156;

/** Reader hand-off caption — the category-aware rule: पाठ for scripture, never आरती. */
function refCaption(ref: PitruReaderRef, lang: Lang): string {
  return ref.kind === 'gita'
    ? contentByLang(lang, 'गीता में पढ़ें ›', 'Read in the Gita ›')
    : contentByLang(lang, 'रामायण में पढ़ें ›', 'Read in the Ramayana ›');
}

export default function PitruPakshaShikshaScreen({ navigation }: Props) {
  const { colors, typography, spacing, radii, elevation } = useTheme();
  const { lang } = useGitaLanguage();
  const { width } = useWindowDimensions();
  const rootNav = useNavigation<any>();
  const titleFont = scriptTitleFont(lang, typography.readerTitle.fontFamily);
  const bodyFont = scriptBodyFont(lang, typography.meaning.fontFamily);

  const parichay = getPitruLessons('parichay');
  const shabd = getPitruLessons('shabd');
  const principles = getPitruPrinciples();
  const kathas = getPitruKathas();
  const prashna = getPitruPrashna();
  const shraddhaVidhi = getVidhiById('shraddha-tarpan-vidhi');

  const [openQuestion, setOpenQuestion] = useState<string | null>(null);
  const [openMeanings, setOpenMeanings] = useState<Record<string, boolean>>({});
  const [glossaryOpen, setGlossaryOpen] = useState(false);
  const [verseIdx, setVerseIdx] = useState(0);

  const gutter = spacing.xxl;
  const cardWidth = width - gutter * 2 - CAROUSEL_PEEK;
  const snap = cardWidth + CAROUSEL_GAP;

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
    paddingHorizontal: gutter,
  };
  const panel = { backgroundColor: colors.parchmentSoft, borderColor: colors.divider, borderRadius: radii.md };
  const first = parichay[0];

  return (
    <View style={styles.root} testID="pitru-shiksha-screen">
      <LinearGradient colors={[colors.parchmentHighlight, colors.parchmentGradientEnd]} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <ReaderHeader
          variant="index"
          title={contentByLang(lang, 'पितृ पक्ष — परिचय', 'Pitru Paksha — an introduction')}
          onBack={() => navigation.goBack()}
        />

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={{ fontFamily: titleFont, fontSize: 15, color: colors.gold, textAlign: 'center', letterSpacing: 6 }}>॥ ॐ ॥</Text>

          {/* 1. The introduction is read — one card, one door into the reader. */}
          {first && (
            <View
              testID={`pitru-lesson-${first.id}`}
              style={[styles.card, panel, { marginHorizontal: gutter, marginTop: spacing.md }]}
            >
              <Text style={{ fontFamily: titleFont, fontSize: 16, lineHeight: 24, color: colors.ink }}>
                {contentByLang(lang, first.titleHi, first.titleEn)}
              </Text>
              <Text style={{ fontFamily: bodyFont, fontSize: 15, lineHeight: 25, color: colors.inkSoft, marginTop: 8 }}>
                {commentaryByLang(lang, first.bodyHi, first.bodyEn)[0]}
              </Text>
              <Pressable
                testID="pitru-shiksha-read"
                accessibilityRole="button"
                accessibilityLabel="Read the introduction"
                onPress={() => navigation.navigate('PitruParichayReader')}
                style={({ pressed }) => [
                  styles.readBtn,
                  { backgroundColor: colors.saffron, borderRadius: radii.sm },
                  pressed && { opacity: 0.85 },
                ]}
              >
                <Text style={{ fontFamily: titleFont, fontSize: 15, lineHeight: 22, color: colors.onPrimary, flex: 1 }}>
                  {contentByLang(lang, 'पूरा परिचय पढ़ें', 'Read the introduction')}
                </Text>
                <Text style={{ fontFamily: bodyFont, fontSize: 12, lineHeight: 18, color: colors.onPrimary, opacity: 0.9 }}>
                  {contentByLang(lang, `${parichay.length} पाठ ›`, `${parichay.length} lessons ›`)}
                </Text>
              </Pressable>
            </View>
          )}

          {/* 2. The questions people arrive with are scanned — an accordion. */}
          {prashna.length > 0 && (
            <>
              <Text style={sectionLabelStyle}>{contentByLang(lang, 'लोग क्या पूछते हैं', 'Questions people ask')}</Text>
              <View testID="pitru-prashna-list" style={[styles.accordion, panel, { marginHorizontal: gutter }]}>
                {prashna.map((entry, idx) => {
                  const open = openQuestion === entry.id;
                  return (
                    <View key={entry.id} style={idx > 0 ? { borderTopWidth: 1, borderTopColor: colors.divider } : undefined}>
                      <Pressable
                        testID={`pitru-prashna-${entry.id}`}
                        accessibilityRole="button"
                        accessibilityLabel={`Question ${entry.id}`}
                        accessibilityState={{ expanded: open }}
                        onPress={() => setOpenQuestion(open ? null : entry.id)}
                        style={({ pressed }) => [styles.question, pressed && { opacity: 0.8 }]}
                      >
                        <Text style={{ flex: 1, fontFamily: titleFont, fontSize: 14.5, lineHeight: 22, color: colors.ink }}>
                          {contentByLang(lang, entry.questionHi, entry.questionEn)}
                        </Text>
                        <Text style={{ color: colors.inkMuted, fontSize: 16, transform: [{ rotate: open ? '90deg' : '0deg' }] }}>›</Text>
                      </Pressable>
                      {open && (
                        <Text
                          testID={`pitru-prashna-answer-${entry.id}`}
                          style={{ fontFamily: bodyFont, fontSize: 13.5, lineHeight: 22, color: colors.inkSoft, paddingHorizontal: 14, paddingBottom: 14 }}
                        >
                          {meaningByLang(lang, entry.answerHi, entry.answerEn)}
                        </Text>
                      )}
                    </View>
                  );
                })}
              </View>
            </>
          )}

          {/* 3. Verses are browsed — the §73 carousel; meaning unfolds in place. */}
          {principles.length > 0 && (
            <>
              <Text style={sectionLabelStyle}>{contentByLang(lang, 'शास्त्र-वचन', 'From the texts')}</Text>
              <ScrollView
                testID="pitru-principle-carousel"
                horizontal
                showsHorizontalScrollIndicator={false}
                decelerationRate="fast"
                snapToInterval={snap}
                snapToAlignment="start"
                contentContainerStyle={{ paddingHorizontal: gutter, gap: CAROUSEL_GAP }}
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
                      testID={`pitru-principle-${entry.id}`}
                      style={[styles.card, styles.verseCard, panel, { width: cardWidth, borderRadius: radii.lg }, elevation.card]}
                    >
                      <View>
                        <Text style={{ fontFamily: titleFont, fontSize: 14.5, lineHeight: 22, color: colors.ink }}>
                          {contentByLang(lang, entry.titleHi, entry.titleEn)}
                        </Text>
                        {entry.verseLines && entry.iastLines ? (
                          <Text style={{ fontFamily: titleFont, fontSize: 14.5, lineHeight: 24, color: colors.saffronDeep, textAlign: 'center', marginTop: 10 }}>
                            {verseLinesByLang(lang, entry.verseLines, entry.iastLines).join('\n')}
                          </Text>
                        ) : null}
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
                          testID={`pitru-principle-meaning-${entry.id}`}
                          accessibilityRole="button"
                          accessibilityLabel={open ? 'Collapse meaning' : 'Expand meaning'}
                          onPress={() => setOpenMeanings((m) => ({ ...m, [entry.id]: !open }))}
                          style={styles.inlineLink}
                        >
                          <Text style={{ fontFamily: titleFont, fontSize: 13, color: colors.saffronDeep }}>
                            {open ? contentByLang(lang, 'संक्षेप ‹', 'Less ‹') : contentByLang(lang, 'पूरा अर्थ ›', 'Full meaning ›')}
                          </Text>
                        </Pressable>
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
                    </View>
                  );
                })}
              </ScrollView>
              <View style={styles.dots} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
                {principles.map((entry, i) => (
                  <View
                    key={entry.id}
                    style={[styles.dot, { backgroundColor: i === verseIdx ? colors.saffron : colors.dotRest, width: i === verseIdx ? 16 : 6 }]}
                  />
                ))}
              </View>
            </>
          )}

          {/* 4. Stories are browsed — the §73 tile shelf. */}
          {kathas.length > 0 && (
            <>
              <Text style={sectionLabelStyle}>{contentByLang(lang, 'कथाएँ', 'Kathas')}</Text>
              <ScrollView
                testID="pitru-katha-shelf"
                horizontal
                showsHorizontalScrollIndicator={false}
                decelerationRate="fast"
                snapToInterval={KATHA_TILE_WIDTH + CAROUSEL_GAP}
                snapToAlignment="start"
                contentContainerStyle={{ paddingHorizontal: gutter, gap: CAROUSEL_GAP }}
              >
                {kathas.map((katha) => (
                  <Pressable
                    key={katha.id}
                    onPress={() => navigation.navigate('PitruKatha', { kathaId: katha.id })}
                    accessibilityRole="button"
                    accessibilityLabel={`Open katha ${katha.id}`}
                    testID={`pitru-katha-${katha.id}`}
                    style={({ pressed }) => [
                      styles.kathaTile,
                      panel,
                      { width: KATHA_TILE_WIDTH },
                      elevation.card,
                      pressed && { opacity: 0.8 },
                    ]}
                  >
                    <Text style={{ fontFamily: titleFont, fontSize: 14, lineHeight: 16, color: colors.gold }}>॥</Text>
                    {/* 22 leading at 14.5 — the §2 ≥1.5× floor that keeps semibold matras unclipped. */}
                    <Text numberOfLines={3} style={{ fontFamily: titleFont, fontSize: 14.5, lineHeight: 22, color: colors.ink, marginTop: 6 }}>
                      {contentByLang(lang, katha.titleHi, katha.titleEn)}
                    </Text>
                    <Text numberOfLines={2} style={{ fontFamily: bodyFont, fontSize: 11.5, lineHeight: 17, color: colors.inkMuted, marginTop: 4 }}>
                      {contentByLang(lang, katha.subtitleHi, katha.subtitleEn)}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </>
          )}

          {/* 5. The glossary is looked up — a door that unfolds a ruled list. */}
          {shabd.length > 0 && (
            <>
              <Text style={sectionLabelStyle}>{contentByLang(lang, 'शब्द', 'Glossary')}</Text>
              <View style={{ marginHorizontal: gutter }}>
                <Pressable
                  testID="pitru-shabd-door"
                  accessibilityRole="button"
                  accessibilityLabel="Glossary"
                  accessibilityState={{ expanded: glossaryOpen }}
                  onPress={() => setGlossaryOpen((o) => !o)}
                  style={({ pressed }) => [
                    styles.doorRow,
                    panel,
                    glossaryOpen && { borderBottomLeftRadius: 0, borderBottomRightRadius: 0, marginBottom: 0 },
                    pressed && { opacity: 0.8 },
                  ]}
                >
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={{ fontFamily: titleFont, fontSize: 15, lineHeight: 22, color: colors.ink }}>
                      {contentByLang(lang, `${shabd.length} शब्द`, `${shabd.length} terms`)}
                    </Text>
                    <Text numberOfLines={1} style={{ fontFamily: bodyFont, fontSize: 12, lineHeight: 18, color: colors.inkMuted, marginTop: 2 }}>
                      {shabd.slice(0, 5).map((t) => contentByLang(lang, t.titleHi, t.titleEn)).join(' · ')} …
                    </Text>
                  </View>
                  <Text style={{ color: colors.inkSoft, fontSize: 17, transform: [{ rotate: glossaryOpen ? '90deg' : '0deg' }] }}>›</Text>
                </Pressable>
                {glossaryOpen && (
                  <View
                    testID="pitru-shabd-list"
                    style={[styles.glossary, panel, { borderTopWidth: 0, borderTopLeftRadius: 0, borderTopRightRadius: 0 }]}
                  >
                    {shabd.map((term, idx) => (
                      <View
                        key={term.id}
                        testID={`pitru-shabd-${term.id}`}
                        style={[styles.glossaryRow, { borderBottomColor: colors.divider, borderBottomWidth: idx === shabd.length - 1 ? 0 : 1 }]}
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
                )}
              </View>
            </>
          )}

          {/* 6. The three doors the fortnight already has — reached LAST, once the
              reader knows what they open. */}
          <Text style={sectionLabelStyle}>{contentByLang(lang, 'अब', 'Now')}</Text>
          <View style={{ paddingHorizontal: gutter }}>
            <Pressable
              onPress={() => navigation.navigate('PitruPakshaOverview')}
              accessibilityRole="button"
              accessibilityLabel="Open Pitru Paksha overview"
              testID="pitru-shiksha-overview-door"
              style={({ pressed }) => [styles.doorRow, { backgroundColor: colors.goldTint, borderColor: colors.gold, borderRadius: radii.md }, pressed && { opacity: 0.8 }]}
            >
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={{ fontFamily: titleFont, fontSize: 15, lineHeight: 22, color: colors.ink }}>
                  {contentByLang(lang, 'पक्ष की सोलह तिथियाँ', 'The fortnight’s sixteen tithis')}
                </Text>
                <Text style={{ fontFamily: bodyFont, fontSize: 12, lineHeight: 18, color: colors.inkMuted, marginTop: 2 }}>
                  {contentByLang(
                    lang,
                    'इस वर्ष की तारीख़ें · किस दिन किसका · आपके परिवार के दिन',
                    'This year’s dates · whose day is which · your family’s days'
                  )}
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
                  <Text style={{ fontFamily: titleFont, fontSize: 15, lineHeight: 22, color: colors.ink }}>
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
                <Text style={{ fontFamily: titleFont, fontSize: 15, lineHeight: 22, color: colors.ink }}>
                  ॥ {contentByLang(lang, 'पितृ स्मरण', 'Pitru Smaran')}
                </Text>
                <Text style={{ fontFamily: bodyFont, fontSize: 12, lineHeight: 18, color: colors.inkMuted, marginTop: 2 }}>
                  {contentByLang(lang, 'अपने पितरों की तिथियाँ सहेजें', 'Save your ancestors’ tithis')}
                </Text>
              </View>
              <Text style={{ color: colors.inkSoft, fontSize: 17 }}>›</Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  scroll: { paddingTop: 6, paddingBottom: 40 },
  card: { borderWidth: 1, paddingHorizontal: 14, paddingVertical: 13 },
  readBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 14, paddingHorizontal: 14, minHeight: 48 },
  accordion: { borderWidth: 1, overflow: 'hidden' },
  question: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingHorizontal: 14, paddingVertical: 12, minHeight: 48 },
  verseCard: { justifyContent: 'space-between' },
  cardActions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 10 },
  inlineLink: { minHeight: 44, justifyContent: 'center' },
  refPill: { borderWidth: 1, paddingHorizontal: 12, minHeight: 36, justifyContent: 'center' },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 10 },
  dot: { height: 6, borderRadius: 3 },
  kathaTile: { borderWidth: 1, padding: 12, minHeight: 132 },
  glossary: { borderWidth: 1, paddingHorizontal: 14 },
  glossaryRow: { paddingVertical: 11 },
  doorRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, paddingHorizontal: 14, paddingVertical: 13, marginBottom: 10, minHeight: 52 },
});
