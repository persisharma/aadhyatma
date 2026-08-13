import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { useTheme } from '@/theme/ThemeContext';
import { elevation } from '@/theme/elevation';
import { spacing } from '@/theme/spacing';
import { fontFamilies } from '@/theme/typography';
import { useGitaLanguage } from '@/data/gita/language';
import { contentByLang } from '@/utils/localize';
import { scriptBodyFont, scriptTitleFont } from '@/utils/langType';
import { getVidhiById, type VidhiPhase, type VidhiStep } from '@/data/vidhi';
import {
  conductStepFor,
  loadVidhiState,
  samagriCheckedFor,
  saveSamagriChecked,
  vidhiDateKey,
} from '@/data/vidhi/checklistStore';
import ReaderHeader from '@/components/ReaderHeader';
import type { PanchangStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<PanchangStackParamList, 'VidhiDetail'>;

type Mode = 'samagri' | 'steps';

const PHASE_LABELS: Record<VidhiPhase, { hi: string; en: string }> = {
  prep: { hi: 'आरम्भ', en: 'Preparation' },
  main: { hi: 'मुख्य पूजा', en: 'Main Puja' },
  closing: { hi: 'समापन', en: 'Closing' },
};

/**
 * Vidhi overview (PRD-19 §5, design.md §61): duration under the title, then a
 * two-segment तैयारी/पूजा control — the samagri checklist (persisted per
 * festival date) reuses Today's Practice's summary accordion + ledger, while
 * the phase-grouped step list leads into conduct mode. Source/tradition fields
 * remain review-only data and never render.
 */
export default function VidhiDetailScreen({ navigation, route }: Props) {
  const { colors, typography, radii } = useTheme();
  const { lang } = useGitaLanguage();
  const vidhi = getVidhiById(route.params.vidhiId);
  const dateKey = vidhiDateKey(route.params.dateMs ? new Date(route.params.dateMs) : new Date());
  const todayKey = vidhiDateKey(new Date());
  const [mode, setMode] = useState<Mode>('samagri');
  const [checked, setChecked] = useState<ReadonlySet<string>>(new Set());
  const [samagriExpanded, setSamagriExpanded] = useState(true);
  const [resumeStep, setResumeStep] = useState<number | null>(null);

  // Hydrate checklist + same-day conduct progress; re-read on focus so
  // returning from conduct mode refreshes the resume offer.
  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      loadVidhiState().then((state) => {
        if (cancelled || !vidhi) return;
        setChecked(new Set(samagriCheckedFor(state, vidhi.id, dateKey)));
        setResumeStep(conductStepFor(state, vidhi.id, todayKey));
      });
      return () => {
        cancelled = true;
      };
    }, [vidhi, dateKey, todayKey])
  );

  useEffect(() => {
    if (!vidhi) navigation.goBack();
  }, [vidhi, navigation]);

  const grouped = useMemo(() => {
    if (!vidhi) return [] as { phase: VidhiPhase; steps: { step: VidhiStep; index: number }[] }[];
    const order: VidhiPhase[] = ['prep', 'main', 'closing'];
    return order
      .map((phase) => ({
        phase,
        steps: vidhi.steps
          .map((step, index) => ({ step, index }))
          .filter(({ step }) => step.phase === phase),
      }))
      .filter((group) => group.steps.length > 0);
  }, [vidhi]);

  if (!vidhi) return null;

  const toggleItem = (itemEn: string) => {
    const next = new Set(checked);
    if (next.has(itemEn)) next.delete(itemEn);
    else next.add(itemEn);
    setChecked(next);
    void saveSamagriChecked(vidhi.id, dateKey, [...next]);
  };

  const shareList = () => {
    const lines = vidhi.samagri.map((item) => {
      const qty = item.qty ? ` (${item.qty})` : '';
      const opt = item.optional ? contentByLang(lang, ' — वैकल्पिक', ' — optional') : '';
      return `• ${contentByLang(lang, item.itemHi, item.itemEn)}${qty}${opt}`;
    });
    const title = contentByLang(lang, vidhi.titleHi, vidhi.titleEn);
    const heading = contentByLang(lang, 'सामग्री सूची', 'Samagri list');
    void Share.share(
      { message: `${title} — ${heading}\n\n${lines.join('\n')}` },
      { dialogTitle: heading }
    ).catch(() => undefined);
  };

  const startConduct = (initialStep?: number) =>
    navigation.navigate('VidhiConduct', {
      vidhiId: vidhi.id,
      dateMs: route.params.dateMs,
      ...(initialStep !== undefined ? { initialStep } : {}),
    });

  const bodyFont = scriptBodyFont(lang, fontFamilies.devanagari);
  const titleFont = scriptTitleFont(lang, typography.readerTitle.fontFamily);
  const checkedCount = checked.size;
  const samagriTotal = vidhi.samagri.length;
  const remainingCount = Math.max(0, samagriTotal - checkedCount);
  const checkedPct = samagriTotal > 0 ? Math.round((checkedCount / samagriTotal) * 100) : 0;

  return (
    <View style={[styles.root, { backgroundColor: colors.parchment }]}>
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <ReaderHeader
          variant="index"
          title={contentByLang(lang, vidhi.titleHi, vidhi.titleEn)}
          onBack={() => navigation.goBack()}
        />
        <Text
          style={[
            styles.duration,
            {
              color: colors.inkMuted,
              fontFamily: lang === 'en' ? fontFamilies.latinItalic : bodyFont,
              fontStyle: lang === 'en' ? 'italic' : 'normal',
            },
          ]}
        >
          {contentByLang(
            lang,
            `लगभग ${vidhi.durationHintMin} मिनट`,
            `About ${vidhi.durationHintMin} min`
          )}
        </Text>

        {/* Two-segment mode control — same 13pt segmented-pill pattern as the
            Panchang surface modes (design.md §33.1). */}
        <View
          style={[
            styles.segmented,
            {
              backgroundColor: colors.parchmentSoft,
              borderColor: colors.divider,
              borderRadius: radii.pill,
              marginHorizontal: spacing.screenGutter,
            },
          ]}
        >
          {(
            [
              { key: 'samagri' as Mode, hi: 'तैयारी · सामग्री', en: 'Prepare · Samagri' },
              {
                key: 'steps' as Mode,
                hi: `पूजा · ${vidhi.steps.length} चरण`,
                en: `Puja · ${vidhi.steps.length} steps`,
              },
            ] as const
          ).map((segment) => {
            const selected = mode === segment.key;
            return (
              <Pressable
                key={segment.key}
                onPress={() => setMode(segment.key)}
                testID={`vidhi-mode-${segment.key}`}
                accessibilityRole="tab"
                accessibilityState={{ selected }}
                accessibilityLabel={segment.en}
                style={({ pressed }) => [
                  styles.segmentOption,
                  { borderRadius: radii.pill },
                  selected && { backgroundColor: colors.saffronTint },
                  pressed && !selected && { opacity: 0.7 },
                ]}
              >
                <Text
                  style={{
                    fontFamily: titleFont,
                    fontSize: 13,
                    color: selected ? colors.saffronDeep : colors.inkMuted,
                  }}
                >
                  {contentByLang(lang, segment.hi, segment.en)}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingHorizontal: spacing.screenGutter }]}
          showsVerticalScrollIndicator={false}
        >
          {mode === 'samagri' ? (
            <>
              <Pressable
                onPress={() => setSamagriExpanded((value) => !value)}
                testID="vidhi-samagri-summary"
                accessibilityRole="button"
                accessibilityState={{ expanded: samagriExpanded }}
                accessibilityLabel={contentByLang(lang, 'सामग्री तैयारी', 'Samagri preparation')}
                accessibilityHint={contentByLang(
                  lang,
                  samagriExpanded ? 'सूची छिपाने के लिए टैप करें' : 'सूची दिखाने के लिए टैप करें',
                  samagriExpanded ? 'Tap to hide the checklist' : 'Tap to show the checklist'
                )}
                style={[
                  styles.summary,
                  {
                    backgroundColor: colors.parchmentSoft,
                    borderColor: colors.goldTint,
                    borderRadius: radii.lg,
                  },
                  elevation.card,
                ]}
              >
                <Text style={[styles.summaryBig, { color: colors.ink, fontFamily: titleFont }]}>
                  {contentByLang(
                    lang,
                    `${checkedCount} / ${samagriTotal} सामग्री तैयार`,
                    `${checkedCount} / ${samagriTotal} items ready`
                  )}
                </Text>
                <Text style={[styles.summarySmall, { color: colors.inkSoft, fontFamily: bodyFont }]}>
                  {remainingCount === 0
                    ? contentByLang(lang, 'सभी सामग्री तैयार है', 'Everything is ready')
                    : contentByLang(
                        lang,
                        `${remainingCount} वस्तुएँ बाकी हैं`,
                        `${remainingCount} items remaining`
                      )}
                </Text>
                <View style={[styles.track, { backgroundColor: colors.parchmentDeep, borderRadius: radii.pill }]}>
                  <LinearGradient
                    colors={[colors.gold, colors.saffron]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{ width: `${checkedPct}%`, height: '100%', borderRadius: radii.pill }}
                  />
                </View>
                <Text
                  style={[
                    styles.summaryCaret,
                    { color: colors.saffron, transform: [{ rotate: samagriExpanded ? '-90deg' : '90deg' }] },
                  ]}
                >
                  ›
                </Text>
              </Pressable>

              {samagriExpanded && (
                <View testID="vidhi-samagri-ledger" style={styles.samagriLedger}>
                  {vidhi.samagri.map((item, index) => {
                    const done = checked.has(item.itemEn);
                    const primary = contentByLang(lang, item.itemHi, item.itemEn);
                    const alternate = lang === 'en' ? item.itemHi : item.itemEn;
                    const meta = [alternate, item.qty].filter(Boolean).join(' · ');
                    const last = index === vidhi.samagri.length - 1;
                    return (
                      <Pressable
                        key={item.itemEn}
                        onPress={() => toggleItem(item.itemEn)}
                        testID={`vidhi-samagri-${item.itemEn}`}
                        accessibilityRole="checkbox"
                        accessibilityState={{ checked: done }}
                        accessibilityLabel={item.itemEn}
                        style={[
                          styles.samagriRow,
                          { borderBottomColor: colors.divider, borderBottomWidth: last ? 0 : 1 },
                        ]}
                      >
                        <View
                          style={[
                            styles.checkCircle,
                            {
                              borderColor: colors.saffron,
                              backgroundColor: done ? colors.saffron : 'transparent',
                            },
                          ]}
                        >
                          {done ? <Text style={[styles.checkMark, { color: colors.onPrimary }]}>✓</Text> : null}
                        </View>
                        <View style={styles.samagriInfo}>
                          <Text
                            style={[
                              styles.samagriText,
                              { fontFamily: titleFont, color: done ? colors.inkMuted : colors.ink },
                            ]}
                          >
                            {primary}
                          </Text>
                          <Text
                            style={[
                              styles.samagriMeta,
                              {
                                fontFamily:
                                  lang === 'en'
                                    ? typography.cardMeta.fontFamily
                                    : scriptBodyFont(lang, typography.meaning.fontFamily),
                                color: done ? colors.inkMuted : colors.saffronDeep,
                              },
                            ]}
                          >
                            {meta}
                          </Text>
                        </View>
                        {item.optional ? (
                          <View style={[styles.optChip, { borderColor: colors.divider, borderRadius: radii.sm }]}>
                            <Text style={{ fontFamily: bodyFont, fontSize: 10, lineHeight: 15, color: colors.inkMuted }}>
                              {contentByLang(lang, 'वैकल्पिक', 'optional')}
                            </Text>
                          </View>
                        ) : null}
                      </Pressable>
                    );
                  })}
                </View>
              )}
              <Pressable
                onPress={shareList}
                testID="vidhi-share-list"
                accessibilityRole="button"
                accessibilityLabel="Share samagri list"
                style={({ pressed }) => [
                  styles.ghostButton,
                  { borderColor: colors.goldTint, borderRadius: radii.md },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Text style={{ fontFamily: bodyFont, fontSize: 15, color: colors.saffron }}>
                  {contentByLang(lang, 'सूची साझा करें', 'Share list')}
                </Text>
              </Pressable>
              <Text
                style={[
                  styles.note,
                  {
                    color: colors.inkMuted,
                    fontFamily: lang === 'en' ? fontFamilies.latinItalic : bodyFont,
                    fontStyle: lang === 'en' ? 'italic' : 'normal',
                  },
                ]}
              >
                {contentByLang(
                  lang,
                  'सूची की स्थिति इसी पर्व-तिथि के लिए सहेजी जाती है',
                  'Checklist state is saved for this festival date'
                )}
              </Text>
            </>
          ) : (
            <>
              {resumeStep !== null && resumeStep > 0 && (
                <Pressable
                  onPress={() => startConduct(resumeStep)}
                  testID="vidhi-resume"
                  accessibilityRole="button"
                  accessibilityLabel={`Resume from step ${resumeStep + 1}`}
                  style={({ pressed }) => [
                    styles.resumeRow,
                    { backgroundColor: colors.goldTint, borderRadius: radii.md },
                    pressed && { opacity: 0.8 },
                  ]}
                >
                  <Text style={{ fontFamily: bodyFont, fontSize: 14, color: colors.saffronDeep }}>
                    {`${contentByLang(lang, 'जहाँ थे वहीं से', 'Resume where you were')} · ${resumeStep + 1}/${vidhi.steps.length} ›`}
                  </Text>
                </Pressable>
              )}
              {grouped.map((group) => (
                <View key={group.phase}>
                  <Text style={[styles.phaseLabel, { color: colors.saffronDeep, fontFamily: titleFont }]}>
                    {contentByLang(lang, PHASE_LABELS[group.phase].hi, PHASE_LABELS[group.phase].en)}
                  </Text>
                  {group.steps.map(({ step, index }) => (
                    <Pressable
                      key={step.id}
                      onPress={() => startConduct(index)}
                      testID={`vidhi-step-${step.id}`}
                      accessibilityRole="button"
                      accessibilityLabel={`Step ${index + 1}. ${step.titleEn}`}
                      style={({ pressed }) => [
                        styles.stepRow,
                        {
                          backgroundColor: colors.parchmentSoft,
                          borderColor: colors.divider,
                          borderRadius: radii.md,
                        },
                        pressed && { opacity: 0.8 },
                      ]}
                    >
                      <View style={[styles.stepNum, { borderColor: colors.goldTint, backgroundColor: colors.parchmentHighlight }]}>
                        <Text style={{ fontFamily: fontFamilies.latinSemiBold, fontSize: 13, color: colors.saffronDeep }}>
                          {index + 1}
                        </Text>
                      </View>
                      <View style={styles.stepMeta}>
                        <Text style={{ fontFamily: titleFont, fontSize: 14.5, color: colors.ink }}>
                          {contentByLang(lang, step.titleHi, step.titleEn)}
                        </Text>
                        {(step.mantra || step.ref) && (
                          <Text
                            style={{
                              fontFamily: lang === 'en' ? fontFamilies.latinItalic : bodyFont,
                              fontStyle: lang === 'en' ? 'italic' : 'normal',
                              fontSize: 11.5,
                              color: colors.inkMuted,
                              marginTop: 1,
                            }}
                          >
                            {step.mantra
                              ? contentByLang(lang, '॥ मन्त्र सहित', '॥ with mantra')
                              : step.ref?.kind === 'katha'
                                ? contentByLang(lang, 'कथा पाठ', 'Katha reading')
                                : contentByLang(lang, 'आरती', 'Aarti')}
                          </Text>
                        )}
                      </View>
                      <Text style={{ color: colors.saffron, fontSize: 17 }}>›</Text>
                    </Pressable>
                  ))}
                </View>
              ))}
              <Pressable
                onPress={() => startConduct(0)}
                testID="vidhi-begin"
                accessibilityRole="button"
                accessibilityLabel="Begin puja"
                style={({ pressed }) => [
                  styles.primaryButton,
                  { backgroundColor: colors.saffron, borderRadius: radii.md },
                  pressed && { opacity: 0.85 },
                ]}
              >
                <Text style={{ fontFamily: bodyFont, fontSize: 15, color: colors.parchment }}>
                  {contentByLang(lang, 'पूजा प्रारम्भ करें', 'Begin the puja')}
                </Text>
              </Pressable>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  scroll: { paddingTop: 14, paddingBottom: 32 },
  duration: { fontSize: 12, textAlign: 'center', marginBottom: 12 },
  segmented: { flexDirection: 'row', borderWidth: 1, padding: 3 },
  segmentOption: { flex: 1, alignItems: 'center', paddingVertical: 9, minHeight: 38, justifyContent: 'center' },
  samagriRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    paddingVertical: 14,
    minHeight: 52,
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14, // circle = half its box — stays a literal (design.md §4)
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -2,
  },
  checkMark: { fontSize: 13, lineHeight: 18 },
  summary: { alignItems: 'center', borderWidth: 1, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 12 },
  summaryBig: { fontSize: 23, textAlign: 'center' },
  summarySmall: { fontSize: 12.5, lineHeight: 19, textAlign: 'center', marginTop: 2 },
  track: { height: 7, width: '100%', overflow: 'hidden', marginTop: 12 },
  summaryCaret: { fontSize: 20, lineHeight: 20, marginTop: 7 },
  samagriLedger: { marginTop: 8 },
  samagriInfo: { flex: 1, minWidth: 0 },
  samagriText: { fontSize: 16, lineHeight: 24 },
  samagriMeta: { fontSize: 12, lineHeight: 18, marginTop: 2 },
  optChip: { borderWidth: 1, paddingHorizontal: 7, paddingVertical: 2, marginTop: 3 },
  ghostButton: {
    borderWidth: 1,
    alignItems: 'center',
    paddingVertical: 14,
    minHeight: 48,
    marginTop: 12,
    justifyContent: 'center',
  },
  note: { fontSize: 12, textAlign: 'center', marginTop: 12, lineHeight: 18 },
  resumeRow: { alignItems: 'center', paddingVertical: 12, minHeight: 44, justifyContent: 'center', marginBottom: 10 },
  phaseLabel: { fontSize: 12, marginTop: 14, marginBottom: 8, letterSpacing: 0.4 },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    paddingHorizontal: 13,
    paddingVertical: 12,
    marginBottom: 8,
    minHeight: 48,
  },
  stepNum: {
    width: 30,
    height: 30,
    borderRadius: 15, // circle = half its box — stays a literal (design.md §4)
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepMeta: { flex: 1, minWidth: 0 },
  primaryButton: {
    alignItems: 'center',
    paddingVertical: 14,
    minHeight: 48,
    marginTop: 12,
    justifyContent: 'center',
  },
});
