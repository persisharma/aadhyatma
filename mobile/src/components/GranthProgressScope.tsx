import React, { createContext, useContext, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import { library } from '@/data/texts';
import { contentByLang, pick } from '@/utils/localize';
import { useReadCoverage } from '@/utils/readCoverageStore';
import { useProgressReset, type ResetTarget } from '@/components/useProgressReset';
import ResetUndoPill from '@/components/ResetUndoPill';
import ReadProgressBar from '@/components/ReadProgressBar';

type ScopeValue = { sourceId: string; askReset: (target: ResetTarget) => void };

/** Present only inside a chapters screen; GitaChapterCard reads it to show per-chapter progress. */
export const GranthProgressContext = createContext<ScopeValue | null>(null);

export function useGranthProgressScope(): ScopeValue | null {
  return useContext(GranthProgressContext);
}

/**
 * Wraps a chapters screen's card list (design.md §84): renders the whole-text
 * summary above the cards, lets each GitaChapterCard show its own read count,
 * and owns the reset confirmation + undo for both. Renders no extra View, so
 * the cards stay direct children of the list's gap container.
 */
export default function GranthProgressScope({ sourceId, children }: { sourceId: string; children: React.ReactNode }) {
  const reset = useProgressReset();
  const value = useMemo(() => ({ sourceId, askReset: reset.ask }), [sourceId, reset.ask]);
  return (
    <GranthProgressContext.Provider value={value}>
      <GranthProgressSummary sourceId={sourceId} onReset={reset.ask} onUndo={reset.undo} />
      {children}
      {reset.dialog}
    </GranthProgressContext.Provider>
  );
}

function GranthProgressSummary({
  sourceId,
  onReset,
  onUndo,
}: {
  sourceId: string;
  onReset: (target: ResetTarget) => void;
  onUndo: (() => void) | null;
}) {
  const { colors, radii } = useTheme();
  const { lang } = useGitaLanguage();
  const cov = useReadCoverage().getSourceCoverage(sourceId);
  if (!cov || (cov.read === 0 && cov.paath === 0 && !onUndo)) return null;

  const entry = library.find((e) => e.id === sourceId);
  const name = entry ? contentByLang(lang, entry.nameHi, entry.nameEn) : sourceId;
  const counts = { read: cov.read, total: cov.total, done: cov.chaptersComplete, chapters: cov.chapters.length };
  const summary = pick(lang, {
    hi: `${counts.read} / ${counts.total} पठित · ${counts.done} / ${counts.chapters} पूर्ण`,
    en: `${counts.read} / ${counts.total} read · ${counts.done} / ${counts.chapters} complete`,
    gu: `${counts.read} / ${counts.total} વાંચ્યા · ${counts.done} / ${counts.chapters} પૂર્ણ`,
    kn: `${counts.read} / ${counts.total} ಓದಲಾಗಿದೆ · ${counts.done} / ${counts.chapters} ಪೂರ್ಣ`,
  });

  return (
    <View style={[styles.card, { backgroundColor: colors.cardSurface, borderColor: colors.divider, borderRadius: radii.lg }]}>
      {/* One a11y element for the figures; the reset control below stays separately reachable. */}
      <View
        testID="granth-progress-summary"
        accessible
        accessibilityLabel={`${cov.read} of ${cov.total} read, ${cov.pct} percent. ${cov.paath} full readings.`}
        style={styles.figures}
      >
        <View style={styles.row}>
          <Text style={[styles.summary, { color: colors.inkSoft }]}>{summary}</Text>
          <Text style={[styles.pct, { color: colors.saffronDeep }]}>{cov.pct}%</Text>
        </View>
        <ReadProgressBar pct={cov.pct} />
        {cov.paath > 0 ? (
          <Text style={[styles.paath, { color: colors.inkMuted }]}>
            {pick(lang, {
              hi: `${cov.paath} पूर्ण पाठ`,
              en: cov.paath === 1 ? '1 full reading' : `${cov.paath} full readings`,
              gu: `${cov.paath} પૂર્ણ પાઠ`,
              kn: `${cov.paath} ಪೂರ್ಣ ಪಾಠ`,
            })}
          </Text>
        ) : null}
      </View>
      {onUndo ? (
        <ResetUndoPill onUndo={onUndo} />
      ) : cov.read > 0 ? (
        <View style={styles.row}>
          <Text style={[styles.hint, { color: colors.inkMuted }]}>
            {pick(lang, {
              hi: 'एक भाग रीसेट करने के लिए उसे दबाकर रखें',
              en: 'Long-press a chapter to reset just that one',
              gu: 'એક ભાગ રીસેટ કરવા તેને દબાવી રાખો',
              kn: 'ಒಂದು ಭಾಗವನ್ನು ಮರುಹೊಂದಿಸಲು ಅದನ್ನು ಒತ್ತಿ ಹಿಡಿಯಿರಿ',
            })}
          </Text>
          <Pressable
            onPress={() => onReset({ sourceId, label: name, readCount: cov.read })}
            accessibilityRole="button"
            accessibilityLabel="Reset progress"
            testID="granth-progress-reset"
            style={styles.resetBtn}
          >
            <Text style={[styles.resetText, { color: colors.avoidDeep }]}>
              {pick(lang, { hi: 'प्रगति रीसेट', en: 'Reset progress', gu: 'પ્રગતિ રીસેટ', kn: 'ಪ್ರಗತಿ ಮರುಹೊಂದಿಸಿ' })}
            </Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 4,
    gap: 8,
  },
  figures: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  summary: {
    fontSize: 13,
    flexShrink: 1,
  },
  pct: {
    fontSize: 13,
    fontWeight: '600',
  },
  paath: {
    fontSize: 12,
  },
  hint: {
    fontSize: 11,
    flexShrink: 1,
  },
  resetBtn: {
    minHeight: 44,
    justifyContent: 'center',
  },
  resetText: {
    fontSize: 12,
    textDecorationLine: 'underline',
  },
});
