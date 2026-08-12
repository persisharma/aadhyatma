import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type ViewToken,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { useTheme } from '@/theme/ThemeContext';
import { radii, spacing } from '@/theme/spacing';
import { fontFamilies } from '@/theme/typography';
import { useGitaLanguage } from '@/data/gita/language';
import { contentByLang, meaningByLang } from '@/utils/localize';
import { meaningToken, scriptBodyFont, scriptTitleFont } from '@/utils/langType';
import { getVidhiById, type VidhiPhase, type VidhiStep } from '@/data/vidhi';
import { clearConductStep, saveConductStep, vidhiDateKey } from '@/data/vidhi/checklistStore';
import { library } from '@/data/texts';
import { getKathaContent } from '@/panchang/kathaContent';
import { buildEntryStartTarget } from '@/navigation/entryRoutes';
import ReaderHeader from '@/components/ReaderHeader';
import ReadAloudButton from '@/components/readAloud/ReadAloudButton';
import { useReaderReadAloud } from '@/screens/_useReaderReadAloud';
import { clampIndex } from '@/utils/clamp';
import type { PanchangStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<PanchangStackParamList, 'VidhiConduct'>;

const PHASE_LABELS: Record<VidhiPhase, { hi: string; en: string }> = {
  prep: { hi: 'आरम्भ', en: 'Preparation' },
  main: { hi: 'मुख्य पूजा', en: 'Main Puja' },
  closing: { hi: 'समापन', en: 'Closing' },
};

/**
 * A conduct page. Mantra steps expose `lines`/`linesEn` (Devanagari/IAST) and
 * instruction-only steps expose `bodyHi`/`bodyEn`, so the shared read-aloud
 * adapter (`toReadableVerse`) can speak each page without vidhi-specific
 * wiring. The completion page carries `__type` so read-aloud treats it as a
 * boundary sentinel and stops rather than reading past the last step.
 */
type ConductStep = Omit<VidhiStep, 'mantra'> & {
  /** The mantra WITHOUT its review-only sourceUrl — citations never enter the render tree. */
  mantra?: { devanagari: string; iast: string };
};

type ConductPage =
  | {
      kind: 'step';
      id: string;
      step: ConductStep;
      stepIndex: number;
      lines?: string[];
      linesEn?: string[];
      bodyHi?: string[];
      bodyEn?: string[];
      meaningHi?: string;
      meaningEn?: string;
    }
  | { kind: 'completion'; id: 'completion'; __type: 'vidhi-completion' };

/**
 * पूजा conduct mode (PRD-19 §5.2, design.md §61.3): full-screen, one step per
 * page, paged horizontally like the readers. Mantras render in a gold-border
 * box with IAST and the shared read-aloud control; shipped-text steps hand off
 * to the katha/aarti readers by id; completion is a quiet static ॐ seal — the
 * routine celebration is deliberately not wired.
 *
 * Keep-awake is a noted follow-up: expo-keep-awake is not a dependency yet and
 * PRD-19 ships bundle-only (no new native deps in this PR).
 */
export default function VidhiConductScreen({ navigation, route }: Props) {
  const { colors, typography } = useTheme();
  const { lang } = useGitaLanguage();
  const rootNav = useNavigation<never>();
  const { width } = useWindowDimensions();
  const vidhi = getVidhiById(route.params.vidhiId);
  const steps = useMemo(() => vidhi?.steps ?? [], [vidhi]);
  const todayKey = vidhiDateKey(new Date());

  const pages = useMemo<ConductPage[]>(() => {
    const stepPages = steps.map<ConductPage>((step, stepIndex) => {
      // Strip the review-only citation before the step enters the FlatList
      // data — source/sourceUrl must never reach the render tree (PRD-19).
      const { mantra, ...rest } = step;
      const conductStep: ConductStep = mantra
        ? { ...rest, mantra: { devanagari: mantra.devanagari, iast: mantra.iast } }
        : rest;
      return {
        kind: 'step' as const,
        id: step.id,
        step: conductStep,
        stepIndex,
        ...(mantra
          ? {
              lines: mantra.devanagari.split('\n'),
              linesEn: mantra.iast.split('\n'),
              meaningHi: step.instructionHi,
              meaningEn: step.instructionEn,
            }
          : { bodyHi: [step.instructionHi], bodyEn: [step.instructionEn] }),
      };
    });
    return [...stepPages, { kind: 'completion', id: 'completion', __type: 'vidhi-completion' }];
  }, [steps]);

  const initialIndex = clampIndex(route.params.initialStep, Math.max(steps.length, 1));
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const listRef = useRef<FlatList<ConductPage>>(null);

  const readAloud = useReaderReadAloud({
    sourceId: `vidhi-${route.params.vidhiId}`,
    data: pages,
    offset: 0,
    verseCount: steps.length,
    currentIndex,
    listRef,
  });

  const persistIndex = useCallback(
    (index: number) => {
      if (!vidhi) return;
      if (index >= steps.length) {
        // Completion reached — clear the resume state so the next entry starts fresh.
        void clearConductStep(vidhi.id);
      } else {
        void saveConductStep(vidhi.id, todayKey, index);
      }
    },
    [vidhi, steps.length, todayKey]
  );

  const setIndex = useCallback(
    (index: number) => {
      setCurrentIndex((prev) => {
        if (prev !== index && index >= 0 && index < pages.length) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
          persistIndex(index);
          return index;
        }
        return prev;
      });
    },
    [pages.length, persistIndex]
  );

  const setIndexRef = useRef(setIndex);
  setIndexRef.current = setIndex;
  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 60 }).current;
  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    const first = viewableItems[0];
    if (first?.index != null) setIndexRef.current(first.index);
  }).current;

  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      setIndex(Math.round(e.nativeEvent.contentOffset.x / width));
    },
    [setIndex, width]
  );

  const getItemLayout = useCallback(
    (_: unknown, index: number) => ({ length: width, offset: width * index, index }),
    [width]
  );

  const goTo = (index: number) => {
    if (index < 0 || index >= pages.length) return;
    listRef.current?.scrollToIndex({ index, animated: true });
  };

  if (!vidhi) {
    navigation.goBack();
    return null;
  }

  const openRef = (step: VidhiStep) => {
    if (!step.ref) return;
    if (step.ref.kind === 'katha') {
      (rootNav as { navigate: (name: string, params: unknown) => void }).navigate('HomeTab', {
        screen: 'VratKathaReader',
        params: { kathaId: step.ref.id },
      });
      return;
    }
    const entry = library.find((item) => item.id === (step.ref as { id: string }).id);
    const target = entry ? buildEntryStartTarget(entry) : null;
    if (target) {
      (rootNav as { navigate: (name: string, params: unknown) => void }).navigate('HomeTab', target);
    }
  };

  const bodyFont = scriptBodyFont(lang, fontFamilies.devanagari);
  const onStepPage = currentIndex < steps.length;
  const counterIndex = Math.min(currentIndex + 1, steps.length);

  return (
    <View style={[styles.root, { backgroundColor: colors.parchment }]}>
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
        <ReaderHeader
          title={contentByLang(lang, vidhi.titleHi, vidhi.titleEn)}
          onBack={() => navigation.goBack()}
          backAccessibilityLabel="Back to vidhi overview"
          right={
            <Text
              style={{
                color: colors.inkMuted,
                fontFamily: typography.pageCounter.fontFamily,
                fontSize: typography.pageCounter.fontSize,
                fontStyle: 'italic',
              }}
            >
              {`${counterIndex} / ${steps.length}`}
            </Text>
          }
          sideWidth={60}
        />

        {/* Read-aloud renders ONCE at screen level (RULEBOOK §3 — never a copy
            per page): it speaks the current page, mantra + instruction. The
            lenient hook renders nothing without a provider/voice. */}
        <View style={styles.readAloudSlot}>
          <ReadAloudButton control={readAloud} />
        </View>

        {/* Progress dots — one per step, reader spec (§5). */}
        <View style={styles.dots} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          {steps.map((step, i) => (
            <View
              key={step.id}
              style={[
                styles.dot,
                { backgroundColor: i === currentIndex ? colors.saffronDeep : colors.divider },
                i === currentIndex && styles.dotActive,
              ]}
            />
          ))}
        </View>

        <FlatList
          ref={listRef}
          data={pages}
          keyExtractor={(page) => page.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={initialIndex}
          getItemLayout={getItemLayout}
          onMomentumScrollEnd={handleScroll}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          extraData={lang}
          renderItem={({ item }) =>
            item.kind === 'completion' ? (
              <CompletionPage
                width={width}
                vidhiTitleHi={vidhi.titleHi}
                vidhiTitleEn={vidhi.titleEn}
                conventionHi={vidhi.conventionLineHi}
                conventionEn={vidhi.conventionLineEn}
                stepCount={steps.length}
                kathaStep={steps.find((step) => step.ref?.kind === 'katha')}
                onOpenRef={openRef}
              />
            ) : (
              <StepPage width={width} page={item} />
            )
          }
        />

        {/* Prev/next bar — the same page turn as a swipe, for wet hands. */}
        <View style={[styles.navBar, { paddingHorizontal: spacing.readingGutter }]}>
          <Pressable
            onPress={() => goTo(currentIndex - 1)}
            disabled={currentIndex === 0}
            testID="vidhi-prev"
            accessibilityRole="button"
            accessibilityLabel="Previous step"
            style={({ pressed }) => [
              styles.prevButton,
              {
                backgroundColor: colors.parchmentSoft,
                borderColor: colors.divider,
                borderRadius: radii.md,
                opacity: currentIndex === 0 ? 0.4 : pressed ? 0.7 : 1,
              },
            ]}
          >
            <Text style={{ fontFamily: bodyFont, fontSize: 14, color: colors.saffron }}>
              ‹ {contentByLang(lang, 'पिछला', 'Previous')}
            </Text>
          </Pressable>
          {onStepPage ? (
            <Pressable
              onPress={() => goTo(currentIndex + 1)}
              testID="vidhi-next"
              accessibilityRole="button"
              accessibilityLabel="Next step"
              style={({ pressed }) => [
                styles.nextButton,
                { backgroundColor: colors.saffron, borderRadius: radii.md },
                pressed && { opacity: 0.85 },
              ]}
            >
              <Text style={{ fontFamily: bodyFont, fontSize: 14, color: colors.parchment }}>
                {currentIndex === steps.length - 1
                  ? contentByLang(lang, 'पूजा सम्पन्न ›', 'Complete the puja ›')
                  : contentByLang(lang, 'अगला चरण ›', 'Next step ›')}
              </Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={() => navigation.goBack()}
              testID="vidhi-done"
              accessibilityRole="button"
              accessibilityLabel="Close conduct mode"
              style={({ pressed }) => [
                styles.nextButton,
                { backgroundColor: colors.saffron, borderRadius: radii.md },
                pressed && { opacity: 0.85 },
              ]}
            >
              <Text style={{ fontFamily: bodyFont, fontSize: 14, color: colors.parchment }}>
                {contentByLang(lang, 'समाप्त', 'Done')}
              </Text>
            </Pressable>
          )}
        </View>

        {/* Follow-up (PRD-19): keep-awake for the conduct session once
            expo-keep-awake ships as a dependency — no new deps in this PR. */}
      </SafeAreaView>
    </View>
  );
}

function StepPage({ width, page }: { width: number; page: Extract<ConductPage, { kind: 'step' }> }) {
  const { colors, typography } = useTheme();
  const { lang } = useGitaLanguage();
  const { step } = page;
  const bodyFont = scriptBodyFont(lang, fontFamilies.devanagari);
  const titleFont = scriptTitleFont(lang, typography.readerTitle.fontFamily);
  const instructionToken = meaningToken(lang, typography);

  return (
    <View style={{ width }}>
      <ScrollView
        contentContainerStyle={[styles.pageScroll, { paddingHorizontal: spacing.readingGutter + 6 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.phase, { color: colors.saffronDeep, fontFamily: titleFont }]}>
          {contentByLang(lang, PHASE_LABELS[step.phase].hi, PHASE_LABELS[step.phase].en)}
        </Text>
        <Text
          style={{
            fontFamily: lang === 'en' ? fontFamilies.latinItalic : bodyFont,
            fontStyle: lang === 'en' ? 'italic' : 'normal',
            fontSize: 12,
            color: colors.inkMuted,
            textAlign: 'center',
            marginTop: 2,
          }}
        >
          {contentByLang(lang, `चरण ${page.stepIndex + 1}`, `Step ${page.stepIndex + 1}`)}
        </Text>
        <Text style={[styles.stepTitle, { color: colors.ink, fontFamily: titleFont }]}>
          {contentByLang(lang, step.titleHi, step.titleEn)}
        </Text>
        <Text
          style={[
            styles.instruction,
            {
              color: colors.inkSoft,
              fontFamily: instructionToken.fontFamily,
              fontSize: instructionToken.fontSize,
              lineHeight: instructionToken.lineHeight,
            },
          ]}
        >
          {meaningByLang(lang, step.instructionHi, step.instructionEn)}
        </Text>

        {step.mantra && (
          <View
            style={[
              styles.mantraBox,
              { borderColor: colors.gold, backgroundColor: colors.parchmentHighlight, borderRadius: radii.lg },
            ]}
          >
            <Text style={[styles.mantraOrnament, { color: colors.gold, fontFamily: fontFamilies.devanagari }]}>
              ॥ ॐ ॥
            </Text>
            <Text
              style={{
                fontFamily: fontFamilies.devanagari,
                fontSize: typography.footerMantra.fontSize,
                lineHeight: typography.footerMantra.fontSize * 2,
                color: colors.ink,
                textAlign: 'center',
                marginTop: 8,
              }}
            >
              {step.mantra.devanagari}
            </Text>
            <Text
              style={{
                fontFamily: fontFamilies.latinItalic,
                fontStyle: 'italic',
                fontSize: 12.5,
                lineHeight: 21,
                color: colors.inkMuted,
                textAlign: 'center',
                marginTop: 8,
              }}
            >
              {step.mantra.iast}
            </Text>
          </View>
        )}

        {step.ref && (
          <StepHandoffCard step={step} />
        )}
      </ScrollView>
    </View>
  );
}

/** Hand-off card: the step IS a shipped text — deep-link, never re-type (§11.11). */
function StepHandoffCard({ step }: { step: ConductStep }) {
  const { colors, typography } = useTheme();
  const { lang } = useGitaLanguage();
  const rootNav = useNavigation<never>();
  const titleFont = scriptTitleFont(lang, typography.readerTitle.fontFamily);
  if (!step.ref) return null;

  const isKatha = step.ref.kind === 'katha';
  const katha = isKatha ? getKathaContent(step.ref.id) : null;
  const entry = !isKatha ? library.find((item) => item.id === (step.ref as { id: string }).id) : null;
  const titleHi = isKatha ? (katha?.titleHi ?? step.titleHi) : (entry?.nameHi ?? step.titleHi);
  const titleEn = isKatha ? (katha?.titleEn ?? step.titleEn) : (entry?.nameEn ?? step.titleEn);

  const open = () => {
    const nav = rootNav as { navigate: (name: string, params: unknown) => void };
    if (isKatha) {
      nav.navigate('HomeTab', { screen: 'VratKathaReader', params: { kathaId: step.ref!.id } });
    } else if (entry) {
      const target = buildEntryStartTarget(entry);
      if (target) nav.navigate('HomeTab', target);
    }
  };

  return (
    <Pressable
      onPress={open}
      testID={`vidhi-handoff-${step.id}`}
      accessibilityRole="button"
      accessibilityLabel={`Open ${titleEn}`}
      style={({ pressed }) => [
        styles.handoffCard,
        { borderColor: colors.saffron, backgroundColor: colors.parchmentSoft, borderRadius: radii.lg },
        pressed && { opacity: 0.85 },
      ]}
    >
      <Text style={{ fontFamily: titleFont, fontSize: 16, color: colors.ink, textAlign: 'center' }}>
        {contentByLang(lang, titleHi, titleEn)} ›
      </Text>
      <Text
        style={{
          fontFamily: lang === 'en' ? fontFamilies.latinItalic : scriptBodyFont(lang, fontFamilies.devanagari),
          fontStyle: lang === 'en' ? 'italic' : 'normal',
          fontSize: 12,
          color: colors.inkMuted,
          textAlign: 'center',
          marginTop: 3,
        }}
      >
        {contentByLang(
          lang,
          'ऐप में उपलब्ध पाठ खुलेगा — पढ़कर यहीं लौट आएँ',
          'Opens the shipped text — return here after reading'
        )}
      </Text>
    </Pressable>
  );
}

/** Quiet completion — a static ॐ seal, no celebration animation (PRD-19 §5.2). */
function CompletionPage({
  width,
  vidhiTitleHi,
  vidhiTitleEn,
  conventionHi,
  conventionEn,
  stepCount,
  kathaStep,
  onOpenRef,
}: {
  width: number;
  vidhiTitleHi: string;
  vidhiTitleEn: string;
  conventionHi: string;
  conventionEn: string;
  stepCount: number;
  kathaStep: VidhiStep | undefined;
  onOpenRef: (step: VidhiStep) => void;
}) {
  const { colors, typography } = useTheme();
  const { lang } = useGitaLanguage();
  const bodyFont = scriptBodyFont(lang, fontFamilies.devanagari);
  const titleFont = scriptTitleFont(lang, typography.readerTitle.fontFamily);

  return (
    <View style={{ width }}>
      <ScrollView
        contentContainerStyle={[styles.pageScroll, { paddingHorizontal: spacing.readingGutter + 6 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.seal, { borderColor: colors.gold, backgroundColor: colors.goldTint }]}>
          <Text style={{ fontFamily: fontFamilies.devanagari, fontSize: 36, color: colors.saffronDeep }}>
            ॐ
          </Text>
        </View>
        <Text style={[styles.completeTitle, { color: colors.ink, fontFamily: titleFont }]}>
          {contentByLang(lang, 'पूजा सम्पन्न', 'Puja complete')}
        </Text>
        <Text
          style={{
            fontFamily: lang === 'en' ? fontFamilies.latinItalic : bodyFont,
            fontStyle: lang === 'en' ? 'italic' : 'normal',
            fontSize: 13,
            lineHeight: 22,
            color: colors.inkMuted,
            textAlign: 'center',
            marginTop: 4,
          }}
        >
          {`${contentByLang(lang, vidhiTitleHi, vidhiTitleEn)} · ${stepCount} ${contentByLang(lang, 'चरण', 'steps')}\n${contentByLang(lang, conventionHi, conventionEn)}`}
        </Text>

        {kathaStep && (
          <Pressable
            onPress={() => onOpenRef(kathaStep)}
            testID="vidhi-completion-katha"
            accessibilityRole="button"
            accessibilityLabel="Read the vrat katha"
            style={({ pressed }) => [
              styles.completionRow,
              { backgroundColor: colors.parchmentSoft, borderColor: colors.divider, borderRadius: radii.md },
              pressed && { opacity: 0.8 },
            ]}
          >
            <View style={[styles.completionGlyph, { borderColor: colors.goldTint, backgroundColor: colors.parchmentHighlight }]}>
              <Text style={{ fontFamily: fontFamilies.devanagari, fontSize: 14, color: colors.saffronDeep }}>क</Text>
            </View>
            <Text style={{ flex: 1, fontFamily: bodyFont, fontSize: 14.5, color: colors.ink }}>
              {contentByLang(lang, 'व्रत कथा पढ़ें', 'Read the vrat katha')}
            </Text>
            <Text style={{ color: colors.saffron, fontSize: 17 }}>›</Text>
          </Pressable>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  pageScroll: { paddingTop: 6, paddingBottom: 96 },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
    marginBottom: 10,
    flexWrap: 'wrap',
    paddingHorizontal: spacing.readingGutter,
  },
  dot: { width: 6, height: 6, borderRadius: 3 }, // circle = half its box (design.md §4)
  dotActive: { width: 16, borderRadius: 3 },
  phase: { fontSize: 12, letterSpacing: 0.6, textTransform: 'uppercase', textAlign: 'center', marginTop: 4 },
  stepTitle: { fontSize: 21, textAlign: 'center', marginTop: 10, marginBottom: 10 },
  instruction: { textAlign: 'center' },
  mantraBox: { borderWidth: 1, padding: 16, marginTop: 16, alignItems: 'center' },
  mantraOrnament: { fontSize: 13, letterSpacing: 5 },
  readAloudSlot: { marginTop: 12, alignItems: 'center' },
  handoffCard: { borderWidth: 1.4, padding: 15, marginTop: 16 },
  navBar: { flexDirection: 'row', gap: 10, paddingTop: 10, paddingBottom: 12 },
  prevButton: {
    flex: 1,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    minHeight: 48,
  },
  nextButton: { flex: 2, alignItems: 'center', justifyContent: 'center', paddingVertical: 13, minHeight: 48 },
  seal: {
    width: 84,
    height: 84,
    borderRadius: 42, // circle = half its box (design.md §4)
    borderWidth: 2,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 26,
    marginBottom: 10,
  },
  completeTitle: { fontSize: 20, textAlign: 'center' },
  completionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 13,
    marginTop: 22,
    minHeight: 48,
  },
  completionGlyph: {
    width: 34,
    height: 34,
    borderRadius: 17, // circle = half its box (design.md §4)
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
