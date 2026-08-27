import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import ObservanceDetailHero from '@/components/ObservanceDetailHero';
import BhogGuidancePanel from '@/components/BhogGuidancePanel';
import { useTheme } from '@/theme/ThemeContext';
import { fontFamilies } from '@/theme/typography';
import { useGitaLanguage, type Lang } from '@/data/gita/language';
import { usePanchangCalendarSystem } from '@/panchang/usePanchang';
import { getKathaContent } from '@/panchang/kathaContent';
import { getUpvasInfo } from '@/panchang/upvasContent';
import { getBhogContent } from '@/panchang/bhogContent';
import { useUpvasParana } from '@/panchang/useUpvasParana';
import { formatClock, formatRangeCompact, formatEndInstant, isSameLocalDay } from '@/panchang/muhuratFormat';
import { getNextOccurrence, getRuleById } from '@/panchang/vratCatalog';
import { getVidhiForFestival } from '@/data/vidhi';
import { usePanchangLocation } from '@/contexts/PanchangLocationContext';
import { useVratFollows } from '@/contexts/VratFollowContext';
import type { PanchangStackParamList } from '@/navigation/types';
import { captionFont } from '@/utils/scriptFont';
import { contentByLang, meaningByLang } from '@/utils/localize';
import { scriptTitleFont, scriptBodyFont, pillTextStyle } from '@/utils/langType';
import { transliterateDevanagari } from '@/utils/transliterate';
import type { UpvasFastType } from '@/panchang/types';

type Props = NativeStackScreenProps<PanchangStackParamList, 'ObservanceDetail'>;

const MONTHS_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_HI = ['जन', 'फ़र', 'मार्च', 'अप्रै', 'मई', 'जून', 'जुल', 'अग', 'सित', 'अक्टू', 'नवं', 'दिसं'];

function startOfLocalDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function formatDate(date: Date, lang: Lang): string {
  const months =
    lang === 'en' ? MONTHS_EN : lang === 'hi' ? MONTHS_HI : MONTHS_HI.map((m) => transliterateDevanagari(m, lang));
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

function relativeLabel(date: Date, from: Date, lang: Lang): string {
  const days = Math.round((startOfLocalDay(date).getTime() - startOfLocalDay(from).getTime()) / 86400000);
  if (days <= 0) return contentByLang(lang, 'आज', 'Today');
  if (days === 1) return contentByLang(lang, 'कल', 'Tomorrow');
  return contentByLang(lang, `${days} दिन में`, `in ${days} days`);
}

function categoryLabel(category: string, lang: Lang): string {
  if (category === 'vrat') return contentByLang(lang, 'व्रत', 'Vrat');
  if (category === 'upavas') return contentByLang(lang, 'उपवास', 'Upvas');
  return contentByLang(lang, 'पर्व', 'Festival');
}

/** The fast-type chip's label (design.md — saffron pill language, Devanagari-safe). */
function fastTypeLabel(fastType: UpvasFastType, lang: Lang): string {
  switch (fastType) {
    case 'nirjala':
      return contentByLang(lang, 'निर्जला', 'Nirjala');
    case 'phalahar':
      return contentByLang(lang, 'फलाहार', 'Phalahar');
    case 'one-meal':
      return contentByLang(lang, 'एक समय भोजन', 'One meal');
    case 'night-vigil':
      return contentByLang(lang, 'रात्रि जागरण', 'Night vigil');
  }
}

export default function ObservanceDetailScreen({ route, navigation }: Props) {
  const { colors, typography, spacing, radii, elevation } = useTheme();
  const { lang } = useGitaLanguage();
  const rootNav = useNavigation<any>();
  const [calendarSystem] = usePanchangCalendarSystem();

  const rule = getRuleById(route.params.ruleId);
  const today = useMemo(() => startOfLocalDay(new Date()), []);
  const next = useMemo(
    () => (rule ? getNextOccurrence(rule.id, today, calendarSystem) : null),
    [rule, today, calendarSystem]
  );
  const katha = rule?.kathaId ? getKathaContent(rule.kathaId) : null;
  const vidhi = rule ? getVidhiForFestival(rule.id) : null;
  // Verified fasting facts only — a draft entry resolves to null, so the
  // section stays absent with zero status logic here (PRD-09/P4 §8).
  const upvas = rule?.upvasId ? getUpvasInfo(rule.upvasId) : null;
  // PRD-23 follows the same verified-only contract as upvas content. Draft
  // food guidance never produces a placeholder or review-status UI.
  const bhog = rule?.bhogId ? getBhogContent(rule.bhogId) : null;
  const { location } = usePanchangLocation();
  // The derived parana date/time line (null for text-only kinds, while the
  // solve is in flight, or on an honest derivation miss — text renders alone).
  const paranaDisplay = useUpvasParana(upvas?.parana ?? null, next?.date ?? null);

  const { isFollowing, follow, unfollow } = useVratFollows();
  const following = rule ? isFollowing(rule.id) : false;
  const [justAdded, setJustAdded] = useState(false);

  // The "Added — View in My Vrat" confirmation auto-dismisses.
  useEffect(() => {
    if (!justAdded) return undefined;
    const t = setTimeout(() => setJustAdded(false), 3500);
    return () => clearTimeout(t);
  }, [justAdded]);

  const toggleFollow = () => {
    if (!rule) return;
    if (following) {
      unfollow(rule.id);
      setJustAdded(false);
    } else {
      follow(rule.id);
      setJustAdded(true);
    }
  };

  const openKatha = () => {
    if (rule?.kathaId) {
      rootNav.navigate('HomeTab', { screen: 'VratKathaReader', params: { kathaId: rule.kathaId } });
    }
  };

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[colors.parchmentHighlight, colors.parchmentGradientEnd]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <View style={styles.topBar}>
          <Pressable
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel={contentByLang(lang, 'वापस', 'Back')}
            hitSlop={12}
            style={({ pressed }) => [styles.backButton, { borderColor: colors.divider }, pressed && { opacity: 0.6 }]}
          >
            <Text style={{ color: colors.inkSoft, fontSize: 20 }}>‹</Text>
          </Pressable>
          <Text style={{ fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily), fontSize: 15, color: colors.ink }}>
            {contentByLang(lang, 'व्रत विवरण', 'Observance')}
          </Text>
          <View style={{ width: 36 }} />
        </View>

        {!rule ? (
          <View style={styles.centered}>
            <Text style={{ fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily), fontSize: 14, color: colors.inkMuted }}>
              {contentByLang(lang, 'यह व्रत नहीं मिला।', 'Observance not found.')}
            </Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={[styles.scroll, { paddingHorizontal: spacing.xxl }]}
            showsVerticalScrollIndicator={false}
          >
            <ObservanceDetailHero
              leading={(
                <View style={styles.heroTags}>
                  <View style={[styles.pill, { backgroundColor: rule.category === 'festival' ? colors.saffronTint : colors.goldTint, borderRadius: radii.pill }]}>
                    <Text style={{ fontFamily: fontFamilies.interSemiBold, fontSize: 11, color: colors.saffronDeep }}>
                      {categoryLabel(rule.category, lang)}
                    </Text>
                  </View>
                  <Text style={{ fontFamily: fontFamilies.latin, fontSize: 13, color: colors.inkMuted }}>
                    {contentByLang(lang, rule.deityHi, rule.deityEn)}
                  </Text>
                </View>
              )}
              title={contentByLang(lang, rule.nameHi, rule.nameEn)}
              caption={(
                <Text style={{ ...captionFont(lang === 'en' ? rule.nameHi : rule.nameEn), fontSize: 15, color: colors.inkMuted, textAlign: 'center' }}>
                  {lang === 'en' ? rule.nameHi : rule.nameEn}
                </Text>
              )}
              nextLabel={next
                ? `${contentByLang(lang, 'अगला', 'Next')} · ${formatDate(next.date, lang)} · ${relativeLabel(next.date, today, lang)}`
                : null}
            />

            {/* Actions (P2: Follow + Read Katha; Remind arrives in P3) */}
            <View style={styles.actionRow}>
              <Pressable
                onPress={toggleFollow}
                accessibilityRole="button"
                accessibilityState={{ selected: following }}
                accessibilityLabel={following ? 'Following' : 'Follow'}
                style={({ pressed }) => [
                  styles.actionBtn,
                  {
                    borderRadius: radii.pill,
                    backgroundColor: following ? colors.saffron : 'transparent',
                    borderColor: colors.saffron,
                  },
                  pressed && { opacity: 0.8 },
                ]}
              >
                <Text style={{ fontFamily: fontFamilies.interSemiBold, fontSize: 13, color: following ? colors.parchment : colors.saffronDeep }}>
                  {following ? (contentByLang(lang, '✓ फ़ॉलो किया', '✓ Following')) : contentByLang(lang, '★ फ़ॉलो करें', '★ Follow')}
                </Text>
              </Pressable>
              {katha && (
                <Pressable
                  onPress={openKatha}
                  accessibilityRole="button"
                  accessibilityLabel={`Read katha ${katha.titleEn}`}
                  style={({ pressed }) => [
                    styles.actionBtn,
                    { borderRadius: radii.pill, backgroundColor: colors.saffron, borderColor: colors.saffron },
                    pressed && { opacity: 0.8 },
                  ]}
                >
                  <Text style={{ fontFamily: fontFamilies.interSemiBold, fontSize: 13, color: colors.parchment }}>
                    {contentByLang(lang, '॥ कथा पढ़ें', '॥ Read Katha')}
                  </Text>
                </Pressable>
              )}
            </View>
            {justAdded && (
              <Pressable
                onPress={() => navigation.navigate('MyVrat')}
                accessibilityRole="button"
                accessibilityLabel="Added — View in My Vrat"
                style={[styles.confirmBar, { backgroundColor: colors.goldTint, borderColor: colors.gold, borderRadius: radii.md }]}
              >
                <Text style={{ flex: 1, fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily), fontSize: 13, color: colors.inkSoft }}>
                  {contentByLang(lang, 'मेरा व्रत में जोड़ा', 'Added to My Vrat')}
                </Text>
                <Text style={{ fontFamily: fontFamilies.interSemiBold, fontSize: 12, color: colors.saffronDeep }}>
                  {contentByLang(lang, 'देखें →', 'View →')}
                </Text>
              </Pressable>
            )}

            {/* About */}
            <View style={styles.block}>
              <Text style={[styles.blockHeading, { color: colors.ink, fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily) }]}>
                {contentByLang(lang, 'महत्व', 'About')}
              </Text>
              <Text style={{ fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily), fontSize: 14, lineHeight: 22, color: colors.inkSoft }}>
                {meaningByLang(lang, rule.shortDescriptionHi, rule.shortDescriptionEn)}
              </Text>
            </View>

            {/* Story / Katha */}
            {katha && (
              <View style={styles.block}>
                <Text style={[styles.blockHeading, { color: colors.ink, fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily) }]}>
                  {contentByLang(lang, 'कथा', 'Story')}
                </Text>
                <Pressable
                  onPress={openKatha}
                  accessibilityRole="button"
                  accessibilityLabel={`Read katha ${katha.titleEn}`}
                  style={({ pressed }) => [styles.kathaCard, { backgroundColor: colors.parchmentSoft, borderColor: colors.divider, borderRadius: radii.lg }, elevation.card, pressed && { opacity: 0.8 }]}
                >
                  <Text style={{ fontSize: 22, color: colors.saffron, marginRight: 12 }}>॥</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily), fontSize: 15, color: colors.ink }}>
                      {contentByLang(lang, katha.titleHi, katha.titleEn)}
                    </Text>
                    <Text style={{ ...captionFont(lang === 'en' ? katha.titleHi : katha.titleEn), fontSize: 13, color: colors.inkMuted, marginTop: 2 }}>
                      {lang === 'en' ? katha.titleHi : katha.titleEn} · {katha.sections.length} {contentByLang(lang, 'खंड', 'sections')}
                    </Text>
                  </View>
                  <Text style={{ fontSize: 20, color: colors.inkMuted }}>›</Text>
                </Pressable>
              </View>
            )}
            {/* "How to observe" — ONE home, four states (PRD-09/P4 §6.3):
                (1) verified upvas facts only, (2) vidhi only — exactly the
                shipped PRD-19 Phase 2B block, (3) both — facts frame the
                procedure, vidhi card beneath them inside the same section,
                (4) neither — no section at all. Never a placeholder, never
                "coming soon" (the parent PRD's §6.2 slot is retired). */}
            {(upvas || vidhi) && (
              <View style={styles.block}>
                <Text style={[styles.blockHeading, { color: colors.ink, fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily) }]}>
                  {contentByLang(lang, upvas ? 'उपवास विधि' : 'पूजा विधि', 'How to observe')}
                </Text>
                {upvas && (
                  <View
                    testID="observance-upvas-panel"
                    style={[styles.upvasPanel, { backgroundColor: colors.parchmentSoft, borderColor: colors.divider, borderRadius: radii.lg }, elevation.card]}
                  >
                    {/* Fast-type chip + one-line note — the two facts scanned first. */}
                    <View style={[styles.upvasChipRow, { borderBottomColor: colors.divider }]}>
                      <View style={[styles.upvasChip, { backgroundColor: colors.saffron, borderRadius: radii.pill }]}>
                        <Text
                          maxFontSizeMultiplier={1.15}
                          style={[pillTextStyle(lang, { fontFamily: fontFamilies.interSemiBold, fontSize: 12, letterSpacing: 0.4 }), { color: colors.parchment }]}
                        >
                          {fastTypeLabel(upvas.fastType, lang)}
                        </Text>
                      </View>
                      <Text style={{ flex: 1, fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily), fontSize: 12, lineHeight: 18, color: colors.inkMuted }}>
                        {contentByLang(lang, upvas.fastTypeNoteHi, upvas.fastTypeNoteEn)}
                      </Text>
                    </View>

                    {/* उपवास काल — quiet fact row, non-interactive, no chevron. */}
                    <View style={[styles.upvasRow, styles.upvasRowDivided, { borderBottomColor: colors.divider }]}>
                      <Text
                        maxFontSizeMultiplier={1.25}
                        style={[styles.upvasRowLabel, pillTextStyle(lang, { fontFamily: fontFamilies.interSemiBold, fontSize: 11, letterSpacing: 0.6 }), { color: colors.saffronDeep }]}
                      >
                        {contentByLang(lang, 'उपवास काल', 'Window')}
                      </Text>
                      <Text style={[styles.upvasRowValueText, { fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily), color: colors.inkSoft }]}>
                        {meaningByLang(lang, upvas.window.textHi, upvas.window.textEn)}
                      </Text>
                    </View>

                    {/* पारण — the verified rule TEXT always renders; the computed
                        date/time line beneath it only when derivable (§5.2). */}
                    {upvas.parana && (
                      <View style={styles.upvasRow}>
                        <Text
                          maxFontSizeMultiplier={1.25}
                          style={[styles.upvasRowLabel, pillTextStyle(lang, { fontFamily: fontFamilies.interSemiBold, fontSize: 11, letterSpacing: 0.6 }), { color: colors.saffronDeep }]}
                        >
                          {contentByLang(lang, 'पारण', 'Parana')}
                        </Text>
                        <View style={styles.upvasRowValueCol}>
                          <Text style={{ fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily), fontSize: 13, lineHeight: 20, color: colors.inkSoft }}>
                            {meaningByLang(lang, upvas.parana.textHi, upvas.parana.textEn)}
                          </Text>
                          {paranaDisplay && (
                            <View
                              testID="observance-upvas-parana-computed"
                              style={[styles.upvasComputed, { backgroundColor: colors.goldTint, borderRadius: radii.md }]}
                            >
                              <Text maxFontSizeMultiplier={1.25} style={{ fontFamily: fontFamilies.interSemiBold, fontSize: 12, color: colors.saffronDeep }}>
                                {paranaDisplay.kind === 'window'
                                  ? `${contentByLang(lang, 'पारण', 'Parana')} · ${formatDate(paranaDisplay.date, lang)} · ${
                                      isSameLocalDay(paranaDisplay.start, paranaDisplay.end)
                                        ? formatRangeCompact(paranaDisplay.start, paranaDisplay.end)
                                        : `${formatClock(paranaDisplay.start)} – ${formatEndInstant(paranaDisplay.end, paranaDisplay.date, lang)}`
                                    }`
                                  : `${contentByLang(lang, 'चंद्रोदय', 'Moonrise')} · ${formatDate(paranaDisplay.date, lang)} · ${formatClock(paranaDisplay.at)}`}
                              </Text>
                              <Text style={{ fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily), fontSize: 10, lineHeight: 15, color: colors.inkMuted, marginTop: 1 }}>
                                {paranaDisplay.kind === 'window'
                                  ? contentByLang(
                                      lang,
                                      `आपके पंचांग स्थान (${location.labelHi}) के सूर्योदय व तिथि-समाप्ति से परिकलित`,
                                      `Computed from sunrise and tithi end at your Panchang location (${location.labelEn})`
                                    )
                                  : contentByLang(
                                      lang,
                                      `आपके पंचांग स्थान (${location.labelHi}) के चंद्रोदय से परिकलित`,
                                      `Computed from moonrise at your Panchang location (${location.labelEn})`
                                    )}
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>
                    )}

                    {/* Strictness/variants footnote, then optional who-observes. */}
                    <Text style={[styles.upvasFootnote, { fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily), color: colors.inkMuted }]}>
                      {meaningByLang(lang, upvas.strictnessHi, upvas.strictnessEn)}
                    </Text>
                    {upvas.whoObservesHi && upvas.whoObservesEn && (
                      <Text style={[styles.upvasFootnote, { fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily), color: colors.inkMuted }]}>
                        {meaningByLang(lang, upvas.whoObservesHi, upvas.whoObservesEn)}
                      </Text>
                    )}

                    {/* §6.3 state 3 — the shipped vidhi card, inside the same
                        "How to observe" home, beneath the fast facts, keeping
                        its own ॥ पूजा विधि identity in the subtitle. */}
                    {vidhi && (
                      <View style={styles.upvasVidhiInner}>
                        <Pressable
                          onPress={() =>
                            navigation.navigate('VidhiDetail', {
                              vidhiId: vidhi.id,
                              ...(next ? { dateMs: next.date.getTime() } : {}),
                            })
                          }
                          testID="observance-vidhi-card"
                          accessibilityRole="button"
                          accessibilityLabel={contentByLang(
                            lang,
                            `${vidhi.titleHi} पूजा विधि खोलें`,
                            `Open ${vidhi.titleEn} puja vidhi`
                          )}
                          style={({ pressed }) => [styles.kathaCard, { backgroundColor: colors.parchment, borderColor: colors.divider, borderRadius: radii.lg }, pressed && { opacity: 0.8 }]}
                        >
                          <Text style={{ fontSize: 22, color: colors.saffron, marginRight: 12 }}>॥</Text>
                          <View style={{ flex: 1 }}>
                            <Text style={{ fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily), fontSize: 15, color: colors.ink }}>
                              {contentByLang(lang, vidhi.titleHi, vidhi.titleEn)}
                            </Text>
                            <Text style={{ ...captionFont(lang === 'en' ? vidhi.titleHi : vidhi.titleEn), fontSize: 13, color: colors.inkMuted, marginTop: 2 }}>
                              {contentByLang(
                                lang,
                                `पूजा विधि · ${vidhi.steps.length} चरण · लगभग ${vidhi.durationHintMin} मिनट`,
                                `Puja vidhi · ${vidhi.steps.length} steps · About ${vidhi.durationHintMin} min`
                              )}
                            </Text>
                          </View>
                          <Text style={{ fontSize: 20, color: colors.inkMuted }}>›</Text>
                        </Pressable>
                      </View>
                    )}
                  </View>
                )}
                {/* §6.3 state 2 — no verified upvas entry: exactly the shipped
                    PRD-19 Phase 2B block, unchanged. Zero regression for the
                    six current festivals. */}
                {!upvas && vidhi && (
                  <Pressable
                    onPress={() =>
                      navigation.navigate('VidhiDetail', {
                        vidhiId: vidhi.id,
                        ...(next ? { dateMs: next.date.getTime() } : {}),
                      })
                    }
                    testID="observance-vidhi-card"
                    accessibilityRole="button"
                    accessibilityLabel={contentByLang(
                      lang,
                      `${vidhi.titleHi} पूजा विधि खोलें`,
                      `Open ${vidhi.titleEn} puja vidhi`
                    )}
                    style={({ pressed }) => [styles.kathaCard, { backgroundColor: colors.parchmentSoft, borderColor: colors.divider, borderRadius: radii.lg }, elevation.card, pressed && { opacity: 0.8 }]}
                  >
                    <Text style={{ fontSize: 22, color: colors.saffron, marginRight: 12 }}>॥</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily), fontSize: 15, color: colors.ink }}>
                        {contentByLang(lang, vidhi.titleHi, vidhi.titleEn)}
                      </Text>
                      <Text style={{ ...captionFont(lang === 'en' ? vidhi.titleHi : vidhi.titleEn), fontSize: 13, color: colors.inkMuted, marginTop: 2 }}>
                        {contentByLang(
                          lang,
                          `${vidhi.steps.length} चरण · लगभग ${vidhi.durationHintMin} मिनट`,
                          `${vidhi.steps.length} steps · About ${vidhi.durationHintMin} min`
                        )}
                      </Text>
                    </View>
                    <Text style={{ fontSize: 20, color: colors.inkMuted }}>›</Text>
                  </Pressable>
                )}
              </View>
            )}
            {bhog && (
              <View style={styles.block}>
                <Text style={[styles.blockHeading, { color: colors.ink, fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily) }]}>
                  {contentByLang(lang, 'भोग · नैवेद्य · भोजन', 'Offerings & food')}
                </Text>
                <BhogGuidancePanel entry={bhog} testID="observance-bhog-panel" />
              </View>
            )}
          </ScrollView>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 8 },
  backButton: { width: 36, height: 36, borderWidth: 1, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  scroll: { paddingTop: 8, paddingBottom: 32 },
  heroTags: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pill: { paddingHorizontal: 10, paddingVertical: 4 },
  actionRow: { flexDirection: 'row', gap: 8, marginTop: 4, marginBottom: 4 },
  actionBtn: { flex: 1, minHeight: 40, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 14, borderWidth: 1.5 },
  confirmBar: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, paddingHorizontal: 12, paddingVertical: 9, marginTop: 8 },
  block: { marginTop: 18 },
  blockHeading: { fontSize: 15, marginBottom: 8 },
  kathaCard: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, padding: 13 },
  // उपवास विधि facts panel (PRD-09/P4 §6.2) — a non-interactive information
  // panel in the Pitru-detail fact-row language: no chevron, no navigation.
  upvasPanel: { borderWidth: 1, paddingHorizontal: 14, paddingTop: 14, paddingBottom: 12 },
  upvasChipRow: { flexDirection: 'row', alignItems: 'center', gap: 9, flexWrap: 'wrap', paddingBottom: 11, borderBottomWidth: 1 },
  upvasChip: { paddingHorizontal: 12, paddingVertical: 4, minHeight: 24, justifyContent: 'center' },
  upvasRow: { flexDirection: 'row', gap: 10, paddingVertical: 10 },
  upvasRowDivided: { borderBottomWidth: 1 },
  upvasRowLabel: { width: 84, paddingTop: 2 },
  upvasRowValueText: { flex: 1, fontSize: 13, lineHeight: 20 },
  upvasRowValueCol: { flex: 1 },
  upvasComputed: { marginTop: 6, paddingHorizontal: 10, paddingVertical: 7 },
  upvasFootnote: { marginTop: 9, fontSize: 12, lineHeight: 18 },
  upvasVidhiInner: { marginTop: 12 },
});
