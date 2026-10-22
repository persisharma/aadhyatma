import CategoryIcon from './CategoryIcon';
import DeityIcon from './DeityIcon';
import ListCard, { CARD_TITLE_SIZES, CardRoutineTail, CardThumb, CardTitles } from './ListCard';
import { deityIconKey } from '@/data/deities';
import React from 'react';
import { StyleSheet, type StyleProp, Text, View, type ViewStyle } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import type { LibraryEntry } from '@/data/texts';
import { useNewContent } from '@/contexts/NewContentContext';
import { useGitaLanguage } from '@/data/gita/language';
import { orderTitlesByLanguage } from '@/utils/titleByLanguage';
import { useReadCoverage } from '@/utils/readCoverageStore';
import { useReadingProgress } from '@/contexts/ReadingProgressContext';
import { useProgressReset } from '@/components/useProgressReset';
import LibraryCardProgress from '@/components/LibraryCardProgress';

type Props = {
  entry: LibraryEntry;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

export default function LibraryCard({ entry, onPress, style }: Props) {
  const { colors, radii } = useTheme();
  const { isNew } = useNewContent();
  const { lang } = useGitaLanguage();
  const { primary, secondary } = orderTitlesByLanguage(lang, entry.nameHi, entry.nameEn, CARD_TITLE_SIZES);
  const isActive = entry.status === 'active';
  const showNew = isActive && isNew(entry.id);
  const sub = lang === 'en' ? entry.subEn : entry.sub;

  // Read coverage (design.md §84): only on active cards.
  const reset = useProgressReset();
  const { getSourceCoverage } = useReadCoverage();
  const { getProgress } = useReadingProgress();
  const coverage = isActive ? getSourceCoverage(entry.id) : null;
  const readCount = coverage?.read ?? 0;
  const askReset = () => {
    if (readCount > 0) reset.ask({ sourceId: entry.id, label: primary.text, readCount });
  };

  const accessibilityLabel = `${entry.nameEn}. ${entry.subEn}.${showNew ? ' New.' : ''} ${isActive ? 'Tap to open.' : 'Coming soon.'}`;

  const firstDeity = entry.deities?.[0];
  const thumbnail = firstDeity
    ? <DeityIcon iconKey={deityIconKey(firstDeity)} />
    : <CategoryIcon iconKey={entry.category} />;

  const badge = !isActive ? (
    <View style={[styles.badge, { backgroundColor: colors.goldTint, borderRadius: radii.pill }]}>
      <Text style={[styles.badgeText, { color: colors.inkMuted, letterSpacing: 1.6 }]}>SOON</Text>
    </View>
  ) : showNew ? (
    <View
      style={[styles.badge, { backgroundColor: colors.newBadgeBg, borderRadius: radii.pill }]}
      pointerEvents="none"
    >
      <Text style={[styles.badgeText, { color: colors.newBadgeText, letterSpacing: 1.6 }]}>NEW</Text>
    </View>
  ) : null;

  // The reset dialog sits beside the card, not inside it, so a tap in the
  // dialog can never reach the card's own press handlers.
  return (
    <>
      <ListCard
        disabled={!isActive}
        onPress={onPress}
        onLongPress={readCount > 0 ? askReset : undefined}
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{ disabled: !isActive }}
        accessibilityValue={coverage && (readCount > 0 || coverage.paath > 0) ? { text: `${coverage.pct} percent read, ${coverage.paath} full readings` } : undefined}
        // The inline undo sits inside the card, which VoiceOver reads as one
        // element, so it is offered as a custom action too.
        accessibilityActions={
          reset.undo
            ? [{ name: 'undo', label: 'Undo reset' }]
            : readCount > 0
              ? [{ name: 'longpress', label: 'Reset progress' }]
              : undefined
        }
        onAccessibilityAction={(e) => {
          if (e.nativeEvent.actionName === 'longpress') askReset();
          if (e.nativeEvent.actionName === 'undo') reset.undo?.();
        }}
        // Library lists space their cards with the container's `gap`.
        style={[styles.inList, style]}
        leading={<CardThumb>{thumbnail}</CardThumb>}
        // Theerth (pilgrimage) entries can't be added to a routine — they open a
        // map + temple detail, not a reader — so they get the plain chevron.
        right={isActive && entry.category !== 'theerth'
          ? <CardRoutineTail sourceId={entry.id} nameEn={entry.nameEn} />
          : undefined}
        overlay={badge}
      >
        <CardTitles primary={primary} secondary={secondary} meta={sub} />
        {coverage ? (
          <LibraryCardProgress coverage={coverage} pin={getProgress(entry.id)} onUndo={reset.undo} />
        ) : null}
      </ListCard>
      {reset.dialog}
    </>
  );
}

const styles = StyleSheet.create({
  inList: { marginBottom: 0 },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    position: 'absolute',
    top: 12,
    right: 12,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
});
