import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AccessibilityInfo,
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
import { useKeepAwake } from 'expo-keep-awake';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { useTheme } from '@/theme/ThemeContext';
import { elevation } from '@/theme/elevation';
import { radii, spacing } from '@/theme/spacing';
import { fontFamilies } from '@/theme/typography';
import { useGitaLanguage } from '@/data/gita/language';
import { contentByLang, meaningByLang } from '@/utils/localize';
import { meaningToken, scriptBodyFont, scriptTitleFont } from '@/utils/langType';
import { getVidhiById, type VidhiPhase, type VidhiStep } from '@/data/vidhi';
import { clearConductStep, saveConductStep, vidhiDateKey } from '@/data/vidhi/checklistStore';
import { library } from '@/data/texts';
import { gitaChaptersManifest } from '@/data/gita';
import { getKathaContent } from '@/panchang/kathaContent';
import { buildEntryStartTarget, navigateToHomeStackTarget } from '@/navigation/entryRoutes';
import ReaderHeader from '@/components/ReaderHeader';
import Ornament from '@/components/Ornament';
import ReadAloudButton from '@/components/readAloud/ReadAloudButton';
import { useReaderReadAloud } from '@/screens/_useReaderReadAloud';
import { clampIndex } from '@/utils/clamp';
import type { VidhiStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<VidhiStackParamList, 'VidhiConduct'>;

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
 * page, paged horizontally like the readers. Each step reuses the Daily Bhakti
 * reading-card shell, with a phase pill, instruction, ornament, mantra/IAST or
 * shipped-text hand-off. Navigation is swipe-only, with the standard reader
 * dots at the bottom; completion is a quiet static ॐ seal.
 *
 * The screen keeps the display awake for the whole conduct session (Phase 2B —
 * wet hands cannot re-wake a locked phone mid-puja) and announces this to
 * screen readers on entry (design.md §12).
 */
export default function VidhiConductScreen({ navigation, route }: Props) {
  const { colors, typography } = useTheme();
  const { lang } = useGitaLanguage();
  const vidhi = getVidhiById(route.params.vidhiId);
  const isPersonalTithi = vidhi?.anchor === 'personal-tithi';
  useKeepAwake();
  useEffect(() => {
    AccessibilityInfo.announceForAccessibility(
      contentByLang(
        lang,
        isPersonalTithi ? 'विधि के दौरान स्क्रीन जागृत रहेगी।' : 'पूजा के दौरान स्क्रीन जागृत रहेगी।',
        isPersonalTithi ? 'The screen will stay awake during the guide.' : 'The screen will stay awake during the puja.'
      )
    );
    // Announce once per conduct session, in the language active on entry.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const { width } = useWindowDimensions();
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

  // Include the completion sentinel in the clamp. Besides making a direct
  // completion route deterministic, this keeps the initial visual state (and
  // therefore the dots) aligned with the page the FlatList opens on.
  const initialIndex = clampIndex(route.params.initialStep, Math.max(pages.length, 1));
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

  if (!vidhi) {
    navigation.goBack();
    return null;
  }

  const onStepPage = currentIndex < steps.length;
  const counterIndex = Math.min(currentIndex + 1, steps.length);

  return (
    <View style={[styles.root, { backgroundColor: colors.parchment }]}>
      <LinearGradient
        colors={[colors.parchmentHighlight, colors.parchmentGradientEnd]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
        <ReaderHeader
          title={contentByLang(lang, vidhi.titleHi, vidhi.titleEn)}
          onBack={() => navigation.goBack()}
          backAccessibilityLabel={contentByLang(
            lang,
            isPersonalTithi ? 'विधि विवरण पर वापस जाएँ' : 'पूजा विवरण पर वापस जाएँ',
            isPersonalTithi ? 'Back to guide overview' : 'Back to puja overview'
          )}
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

        <View style={styles.listContainer}>
          <FlatList
            ref={listRef}
            testID="vidhi-conduct-pager"
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
                  stepCount={steps.length}
                  isPersonalTithi={isPersonalTithi}
                />
              ) : (
                <StepPage width={width} page={item} isPersonalTithi={isPersonalTithi} />
              )
            }
          />

          {onStepPage && (
            <View
              testID="vidhi-pager-dots"
              pointerEvents="none"
              style={styles.dotsOverlay}
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
            >
              <View style={styles.dots}>
                {steps.map((step, i) => (
                  <View
                    key={step.id}
                    style={
                      i === currentIndex
                        ? [styles.dotActive, { backgroundColor: isPersonalTithi ? colors.inkSoft : colors.saffronDeep }]
                        : [styles.dot, { backgroundColor: colors.dotRest }]
                    }
                  />
                ))}
              </View>
            </View>
          )}
        </View>

      </SafeAreaView>
    </View>
  );
}

function StepPage({
  width,
  page,
  isPersonalTithi,
}: {
  width: number;
  page: Extract<ConductPage, { kind: 'step' }>;
  isPersonalTithi: boolean;
}) {
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
        <View
          testID={`vidhi-reading-card-${step.id}`}
          style={[
            styles.readingCard,
            {
              backgroundColor: colors.parchmentSoft,
              borderColor: colors.divider,
              borderRadius: radii.lg,
            },
            elevation.raised,
          ]}
        >
          <View style={styles.cardHeader}>
            <View style={[styles.phasePill, { backgroundColor: isPersonalTithi ? colors.goldTint : colors.saffronTint, borderRadius: radii.pill }]}>
              <Text style={[styles.phase, { color: isPersonalTithi ? colors.inkSoft : colors.saffronDeep, fontFamily: titleFont }]}>
                {contentByLang(
                  lang,
                  isPersonalTithi && step.phase === 'main' ? 'तर्पण व स्मरण' : PHASE_LABELS[step.phase].hi,
                  isPersonalTithi && step.phase === 'main' ? 'Tarpana & remembrance' : PHASE_LABELS[step.phase].en
                )}
              </Text>
            </View>
            <Text
              style={{
                fontFamily: lang === 'en' ? fontFamilies.latinItalic : bodyFont,
                fontStyle: lang === 'en' ? 'italic' : 'normal',
                fontSize: 12,
                color: colors.inkMuted,
              }}
            >
              {contentByLang(lang, `चरण ${page.stepIndex + 1}`, `Step ${page.stepIndex + 1}`)}
            </Text>
          </View>
          <Text style={[styles.stepTitle, { color: colors.ink, fontFamily: titleFont }]}>
            {contentByLang(lang, step.titleHi, step.titleEn)}
          </Text>
          <Text
            style={{
              color: colors.inkSoft,
              fontFamily: instructionToken.fontFamily,
              fontSize: instructionToken.fontSize,
              lineHeight: instructionToken.lineHeight,
            }}
          >
            {meaningByLang(lang, step.instructionHi, step.instructionEn)}
          </Text>

          {(step.mantra || step.ref) && <Ornament />}

          {step.mantra && (
            <View style={styles.mantraSection}>
              <Text
                style={[
                  styles.sectionLabel,
                  { color: colors.saffronDeep, fontFamily: titleFont },
                ]}
              >
                {contentByLang(lang, 'मन्त्र · Mantra', 'Mantra · मन्त्र')}
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

          {step.ref && <StepHandoffCard step={step} muted={isPersonalTithi} />}
        </View>
      </ScrollView>
    </View>
  );
}

/** Hand-off card: the step IS a shipped text — deep-link, never re-type (§11.11). */
function StepHandoffCard({ step, muted }: { step: ConductStep; muted: boolean }) {
  const { colors, typography } = useTheme();
  const { lang } = useGitaLanguage();
  const rootNav = useNavigation<never>();
  const titleFont = scriptTitleFont(lang, typography.readerTitle.fontFamily);
  const ref = step.ref;
  if (!ref) return null;

  const isKatha = ref.kind === 'katha';
  const isGita = ref.kind === 'gita';
  const katha = ref.kind === 'katha' ? getKathaContent(ref.id) : null;
  const entry = ref.kind === 'section' ? library.find((item) => item.id === ref.id) : null;
  const gitaChapterNumber = ref.kind === 'gita' ? ref.chapter : null;
  const gitaChapter = isGita
    ? gitaChaptersManifest.find((chapter) => chapter.chapter === gitaChapterNumber)
    : null;
  const titleHi = isKatha
    ? (katha?.titleHi ?? step.titleHi)
    : isGita
      ? `भगवद् गीता — अध्याय ${gitaChapterNumber}`
      : (entry?.nameHi ?? step.titleHi);
  const titleEn = isKatha
    ? (katha?.titleEn ?? step.titleEn)
    : isGita
      ? `Bhagavad Gita — ${gitaChapter?.titleEn ?? `Chapter ${gitaChapterNumber}`}`
      : (entry?.nameEn ?? step.titleEn);
  const isAarti = entry?.category === 'aarti';

  const open = () => {
    if (ref.kind === 'katha') {
      navigateToHomeStackTarget(rootNav, {
        screen: 'VratKathaReader',
        params: { kathaId: ref.id },
      });
      return;
    }
    if (ref.kind === 'gita') {
      navigateToHomeStackTarget(rootNav, {
        screen: 'GitaReader',
        params: { chapter: ref.chapter },
      });
      return;
    }
    if (entry) {
      const target = buildEntryStartTarget(entry);
      if (target) navigateToHomeStackTarget(rootNav, target);
    }
  };

  return (
    <Pressable
      onPress={open}
      testID={`vidhi-handoff-${step.id}`}
      accessibilityRole="button"
      accessibilityLabel={contentByLang(lang, `${titleHi} खोलें`, `Open ${titleEn}`)}
      style={({ pressed }) => [
        styles.handoffCard,
        { borderColor: muted ? colors.gold : colors.saffron, backgroundColor: colors.parchmentSoft, borderRadius: radii.lg },
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
          isKatha ? 'कथा पढ़कर यहीं लौटें' : isAarti ? 'आरती पूर्ण कर यहीं लौटें' : 'पाठ पूर्ण कर यहीं लौटें',
          isKatha
            ? 'Read the katha, then return here'
            : isAarti
              ? 'Complete the aarti, then return here'
              : 'Complete the recitation, then return here'
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
  stepCount,
  isPersonalTithi,
}: {
  width: number;
  vidhiTitleHi: string;
  vidhiTitleEn: string;
  stepCount: number;
  isPersonalTithi: boolean;
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
          <Text style={{ fontFamily: fontFamilies.devanagari, fontSize: 36, color: isPersonalTithi ? colors.inkSoft : colors.saffronDeep }}>
            ॐ
          </Text>
        </View>
        <Text style={[styles.completeTitle, { color: colors.ink, fontFamily: titleFont }]}>
          {contentByLang(
            lang,
            isPersonalTithi ? 'स्मरण पूर्ण' : 'पूजा सम्पन्न',
            isPersonalTithi ? 'Remembrance complete' : 'Puja complete'
          )}
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
          {`${contentByLang(lang, vidhiTitleHi, vidhiTitleEn)} · ${contentByLang(
            lang,
            `${stepCount} चरण पूर्ण`,
            `${stepCount} steps complete`
          )}`}
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  listContainer: { flex: 1 },
  pageScroll: { paddingTop: 6, paddingBottom: 52 },
  readingCard: { borderWidth: 1, padding: 20 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  phasePill: { paddingHorizontal: 10, paddingVertical: 4 },
  dotsOverlay: { position: 'absolute', bottom: 4, left: 0, right: 0, alignItems: 'center' },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: { width: 6, height: 6, borderRadius: 3 }, // circle = half its box (design.md §4)
  dotActive: { width: 18, height: 6, borderRadius: 999 },
  phase: { fontSize: 11, textTransform: 'uppercase' },
  stepTitle: { fontSize: 21, marginTop: 14, marginBottom: 6 },
  mantraSection: { alignItems: 'center' },
  sectionLabel: { fontSize: 11, textAlign: 'center', textTransform: 'uppercase' },
  readAloudSlot: { marginTop: 12, alignItems: 'center' },
  handoffCard: { borderWidth: 1.4, padding: 15, marginTop: 14 },
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
});
