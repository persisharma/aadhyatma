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
import { useNavigation } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { useTheme } from '@/theme/ThemeContext';
import { radii, spacing } from '@/theme/spacing';
import { fontFamilies } from '@/theme/typography';
import { useGitaLanguage } from '@/data/gita/language';
import { contentByLang, meaningByLang } from '@/utils/localize';
import { meaningToken, scriptBodyFont, scriptTitleFont } from '@/utils/langType';
import { getVidhiById, type VidhiPhase, type VidhiStep } from '@/data/vidhi';
import { getVidhiVisualInstructionParts } from '@/data/vidhi/stepVisuals';
import { clearConductStep, saveConductStep, vidhiDateKey } from '@/data/vidhi/checklistStore';
import { library } from '@/data/texts';
import { gitaChaptersManifest } from '@/data/gita';
import { getKathaContent } from '@/panchang/kathaContent';
import { buildEntryStartTarget, navigateToHomeStackTarget } from '@/navigation/entryRoutes';
import BackgroundLayer from '@/components/BackgroundLayer';
import VidhiStepArtwork from '@/components/VidhiStepArtwork';
import ReadingProgressBar from '@/components/ReadingProgressBar';
import { readingParchment } from '@/data/backgroundAsset';
import ReaderHeader from '@/components/ReaderHeader';
import ShareButton from '@/components/ShareButton';
import { useShare } from '@/utils/shareVerse';
import { vidhiMantraShareable } from '@/utils/shareContent';
import Ornament from '@/components/Ornament';
import ReadAloudButton from '@/components/readAloud/ReadAloudButton';
import AutoSlideButton from '@/components/AutoSlideButton';
import AutoSlideScrollView from '@/components/AutoSlideScrollView';
import { useReaderPlayback } from '@/screens/_useAutoSlide';
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
 * page, paged horizontally like the readers. Each page is an illustrated
 * timeline: the current action is expanded between its compact neighbours.
 * Swiping or selecting a neighbour turns the page. Full instructions, verified
 * mantras and reader hand-offs remain scrollable; completion is a quiet ॐ seal.
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

  // Auto-slide paces a step by its reading time, not the time the ritual takes;
  // the completion page ends the slideshow.
  const { readAloud, autoSlide } = useReaderPlayback({
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

  // Persist the active position on entry and on turns. If the civil day changes
  // during a long session, keep the current step rather than the initial one.
  const previousIndex = useRef(currentIndex);
  useEffect(() => {
    if (previousIndex.current !== currentIndex) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
      previousIndex.current = currentIndex;
    }
    persistIndex(currentIndex);
  }, [currentIndex, persistIndex]);

  const setIndex = useCallback(
    (index: number) => {
      if (index >= 0 && index < pages.length) setCurrentIndex(index);
    },
    [pages.length]
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

  const goToStep = useCallback((index: number) => {
    if (index < 0 || index >= pages.length) return;
    listRef.current?.scrollToIndex({ index, animated: true });
    setIndex(index);
  }, [pages.length, setIndex]);

  // A window resize changes every page's offset. Preserve the active step.
  const previousWidth = useRef(width);
  useEffect(() => {
    if (previousWidth.current === width) return;
    previousWidth.current = width;
    const frame = requestAnimationFrame(() => {
      listRef.current?.scrollToIndex({ index: currentIndex, animated: false });
    });
    return () => cancelAnimationFrame(frame);
  }, [width, currentIndex]);

  if (!vidhi) {
    navigation.goBack();
    return null;
  }

  const onStepPage = currentIndex < steps.length;
  const counterIndex = Math.min(currentIndex + 1, steps.length);
  const activePhase = steps[Math.min(currentIndex, steps.length - 1)]?.phase ?? 'closing';

  return (
    <View style={[styles.root, { backgroundColor: colors.parchment }]}>
      <BackgroundLayer source={readingParchment} />
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

        <ReadingProgressBar current={counterIndex} total={steps.length} />

        {/* Read-aloud renders ONCE at screen level (RULEBOOK §3 — never a copy
            per page): it speaks the current page, mantra + instruction. The
            lenient hook renders nothing without a provider/voice. */}
        <View style={styles.readAloudSlot}>
          {onStepPage && (
            <>
              <Text style={[styles.phase, { color: colors.inkMuted, fontFamily: scriptBodyFont(lang, fontFamilies.devanagari) }]}>
                {contentByLang(lang,
                  isPersonalTithi && activePhase === 'main' ? 'तर्पण व स्मरण' : PHASE_LABELS[activePhase].hi,
                  isPersonalTithi && activePhase === 'main' ? 'Tarpana & remembrance' : PHASE_LABELS[activePhase].en
                )}
              </Text>
              <View style={styles.handsFree}>
                <AutoSlideButton control={autoSlide} floating={false} />
                <ReadAloudButton control={readAloud} />
              </View>
            </>
          )}
        </View>

        <View style={styles.listContainer}>
          <FlatList
            ref={listRef}
            CellRendererComponent={autoSlide.Cell}
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
            extraData={`${lang}-${width}-${currentIndex}`}
            onScrollToIndexFailed={({ index }) => {
              listRef.current?.scrollToOffset({ offset: width * index, animated: false });
            }}
            renderItem={({ item }) =>
              item.kind === 'completion' ? (
                <CompletionPage
                  width={width}
                  vidhiTitleHi={vidhi.titleHi}
                  vidhiTitleEn={vidhi.titleEn}
                  stepCount={steps.length}
                  isPersonalTithi={isPersonalTithi}
                  active={currentIndex === steps.length}
                />
              ) : (
                <StepPage
                  width={width}
                  page={item}
                  active={currentIndex === item.stepIndex}
                  previous={pages[item.stepIndex - 1]}
                  next={pages[item.stepIndex + 1]}
                  onMove={goToStep}
                  isPersonalTithi={isPersonalTithi}
                  vidhi={vidhi}
                />
              )
            }
          />

        </View>

      </SafeAreaView>
    </View>
  );
}

function StepPage({
  width,
  page,
  active,
  previous,
  next,
  onMove,
  isPersonalTithi,
  vidhi,
}: {
  width: number;
  page: Extract<ConductPage, { kind: 'step' }>;
  active: boolean;
  previous?: ConductPage;
  next?: ConductPage;
  onMove: (index: number) => void;
  isPersonalTithi: boolean;
  vidhi: { id: string; titleHi: string; titleEn: string; deities: string[]; anchor?: string };
}) {
  const { colors, typography } = useTheme();
  const { lang } = useGitaLanguage();
  const { share, busy: shareBusy } = useShare();
  const { step } = page;
  const bodyFont = scriptBodyFont(lang, fontFamilies.devanagari);
  const titleFont = scriptTitleFont(lang, typography.readerTitle.fontFamily);
  const instructionToken = meaningToken(lang, typography);
  const tint = isPersonalTithi ? colors.inkSoft : colors.saffron;
  const instruction = meaningByLang(lang, step.instructionHi, step.instructionEn);
  // Split the original bilingual copy before localization, preserving gu/kn derivation.
  const actionInstructions = getVidhiVisualInstructionParts(vidhi.id, step.id, step.instructionHi, step.instructionEn)
    ?.map(part => meaningByLang(lang, part.hi, part.en));
  const renderInstruction = (text: string) => (
    <Text style={{
      color: colors.inkSoft,
      fontFamily: instructionToken.fontFamily,
      fontSize: instructionToken.fontSize,
      lineHeight: instructionToken.lineHeight,
    }}>{text}</Text>
  );

  return (
    <View testID={`vidhi-timeline-page-${step.id}`} style={{ width }} accessibilityElementsHidden={!active} importantForAccessibility={active ? 'auto' : 'no-hide-descendants'}>
      <AutoSlideScrollView
        contentContainerStyle={[styles.pageScroll, { paddingHorizontal: spacing.readingGutter }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.timelineLine, { backgroundColor: colors.gold }]} />
        {previous?.kind === 'step' && (
          <TimelineNeighbour page={previous} vidhiId={vidhi.id} onPress={() => onMove(previous.stepIndex)} />
        )}
        <View
          testID={`vidhi-reading-card-${step.id}`}
          style={styles.readingCard}
        >
          <View style={styles.stepHeading}>
            <View style={[styles.activeMarker, { backgroundColor: tint }]} accessibilityElementsHidden>
              <Text style={[styles.markerNumber, { color: colors.parchmentSoft, fontFamily: fontFamilies.latinSemiBold }]}>
                {page.stepIndex + 1}
              </Text>
            </View>
            <Text accessibilityRole="header" style={[styles.stepTitle, { color: colors.ink, fontFamily: titleFont }]}>
              {contentByLang(lang, step.titleHi, step.titleEn)}
            </Text>
          </View>
          <View style={styles.stepContent}>
          <VidhiStepArtwork
            vidhiId={vidhi.id}
            stepId={step.id}
            renderCaption={actionInstructions ? (index) => renderInstruction(actionInstructions[index]) : undefined}
          />
          {!actionInstructions && renderInstruction(instruction)}

          {(step.mantra || step.ref) && <Ornament />}

          {step.mantra && (
            <View style={styles.mantraSection}>
              <View style={styles.mantraLabelRow}>
                <Text
                  style={[
                    styles.sectionLabel,
                    { color: colors.saffronDeep, fontFamily: titleFont },
                  ]}
                >
                  {contentByLang(lang, 'मन्त्र · Mantra', 'Mantra · मन्त्र')}
                </Text>
                {/* The unit shared is the mantra, not the step (design.md §39.4).
                    Never on the personal-tithi (tila-tarpana) vidhi: that guide keeps
                    Pitru Smaran's no-share register (§63). */}
                {!isPersonalTithi && (
                  <View style={styles.mantraShare}>
                    <ShareButton
                      onPress={() => {
                        const mantra = step.mantra;
                        if (mantra) void share(vidhiMantraShareable(vidhi, { ...step, mantra }), lang);
                      }}
                      busy={shareBusy}
                      accessibilityLabel="Share mantra"
                      accessibilityHint="Opens share options for this mantra"
                    />
                  </View>
                )}
              </View>
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
        </View>
        {next?.kind === 'step' ? (
          <TimelineNeighbour page={next} vidhiId={vidhi.id} onPress={() => onMove(next.stepIndex)} />
        ) : (
          <Pressable
            testID="vidhi-timeline-finish"
            accessibilityRole="button"
            onPress={() => onMove(page.stepIndex + 1)}
            style={[styles.finish, { borderColor: colors.divider }]}
          >
            <Text style={{ color: tint, fontFamily: titleFont, fontSize: 16 }}>
              {contentByLang(lang, isPersonalTithi ? 'स्मरण पूर्ण करें' : 'पूजा पूर्ण करें', isPersonalTithi ? 'Conclude remembrance' : 'Conclude puja')}
            </Text>
          </Pressable>
        )}
        <View style={styles.phaseFooter}>
          <View style={[styles.footerRule, { backgroundColor: colors.divider }]} />
          <Text style={[styles.phase, { fontFamily: bodyFont, color: colors.inkMuted }]}>
            {contentByLang(lang,
              isPersonalTithi && step.phase === 'main' ? 'तर्पण व स्मरण' : PHASE_LABELS[step.phase].hi,
              isPersonalTithi && step.phase === 'main' ? 'Tarpana & remembrance' : PHASE_LABELS[step.phase].en
            )}
          </Text>
          <View style={[styles.footerRule, { backgroundColor: colors.divider }]} />
        </View>
      </AutoSlideScrollView>
    </View>
  );
}

function TimelineNeighbour({ page, vidhiId, onPress }: {
  page: Extract<ConductPage, { kind: 'step' }>;
  vidhiId: string;
  onPress: () => void;
}) {
  const { colors, typography } = useTheme();
  const { lang } = useGitaLanguage();
  const title = contentByLang(lang, page.step.titleHi, page.step.titleEn);
  return (
    <Pressable
      testID={`vidhi-timeline-step-${page.stepIndex}`}
      accessibilityRole="button"
      accessibilityLabel={contentByLang(lang, `चरण ${page.stepIndex + 1}: ${title}`, `Step ${page.stepIndex + 1}: ${title}`)}
      accessibilityHint={contentByLang(lang, 'इस चरण पर जाएँ', 'Open this step')}
      onPress={onPress}
      style={({ pressed }) => [styles.neighbour, pressed && { opacity: 0.7 }]}
    >
      <View style={[styles.restMarker, { borderColor: colors.divider, backgroundColor: colors.parchmentSoft }]}>
        <Text style={[styles.restNumber, { color: colors.inkSoft, fontFamily: fontFamilies.latin }]}>{page.stepIndex + 1}</Text>
      </View>
      <Text style={[styles.neighbourTitle, { color: colors.inkSoft, fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily) }]}>{title}</Text>
      <VidhiStepArtwork vidhiId={vidhiId} stepId={page.step.id} compact />
    </Pressable>
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
  active,
}: {
  width: number;
  vidhiTitleHi: string;
  vidhiTitleEn: string;
  stepCount: number;
  isPersonalTithi: boolean;
  active: boolean;
}) {
  const { colors, typography } = useTheme();
  const { lang } = useGitaLanguage();
  const bodyFont = scriptBodyFont(lang, fontFamilies.devanagari);
  const titleFont = scriptTitleFont(lang, typography.readerTitle.fontFamily);

  return (
    <View style={{ width }} accessibilityElementsHidden={!active} importantForAccessibility={active ? 'auto' : 'no-hide-descendants'}>
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
  pageScroll: { paddingTop: 16, paddingBottom: 26 },
  timelineLine: { position: 'absolute', left: spacing.readingGutter + 17, top: 32, bottom: 68, width: 1 },
  readingCard: { paddingVertical: 14 },
  stepHeading: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  activeMarker: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  markerNumber: { fontSize: 23 },
  stepTitle: { flex: 1, fontSize: 23, paddingTop: 3 },
  stepContent: { marginLeft: 48 },
  neighbour: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 80, paddingVertical: 7 },
  restMarker: { width: 34, height: 34, borderRadius: 17, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  restNumber: { fontSize: 21 },
  neighbourTitle: { fontSize: 16, flex: 1 },
  finish: { marginLeft: 48, marginTop: 10, paddingVertical: 15, borderTopWidth: 1, minHeight: 48 },
  phase: { fontSize: 12 },
  phaseFooter: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 20 },
  footerRule: { height: 1, flex: 1 },
  mantraSection: { alignItems: 'center' },
  // Label centred; the share circle pinned right so it never shifts the label.
  mantraLabelRow: { alignSelf: 'stretch', alignItems: 'center', justifyContent: 'center', minHeight: 34 },
  mantraShare: { position: 'absolute', right: 0, top: 0, bottom: 0, justifyContent: 'center' },
  sectionLabel: { fontSize: 11, textAlign: 'center', textTransform: 'uppercase' },
  readAloudSlot: { minHeight: 46, paddingHorizontal: spacing.readingGutter, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  handsFree: { flexDirection: 'row', alignItems: 'center', gap: 8 },
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
