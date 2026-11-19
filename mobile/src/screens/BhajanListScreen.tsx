import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import { contentByLang, pick } from '@/utils/localize';
import { pillTextStyle } from '@/utils/langType';
import { backLabel } from '@/utils/a11yLabels';
import { orderTitlesByLanguage } from '@/utils/titleByLanguage';
import type { LibraryEntry } from '@/data/texts';
import { categories } from '@/data/categories';
import { getCategoryBackground } from '@/data/backgrounds';
import { bhajanShelfEntries, groupBhajanShelf, type BhajanShelfGroup } from '@/data/bhajan/shelf';
import type { BhajanGroupId } from '@/data/bhajan/ids';
import BackgroundLayer from '@/components/BackgroundLayer';
import FocusedLightStatusBar from '@/components/FocusedLightStatusBar';
import LibraryCard from '@/components/LibraryCard';
import ShareButton from '@/components/ShareButton';
import ResumeReadingSheet from '@/components/ResumeReadingSheet';
import { useResumeSheetCoverage } from '@/components/useResumeSheetCoverage';
import { useShare } from '@/utils/shareVerse';
import { buildListingShare } from '@/utils/listingShare';
import { useReadingProgress } from '@/contexts/ReadingProgressContext';
import { useNewContent } from '@/contexts/NewContentContext';
import { navigateToEntryStart, navigateToProgress } from '@/navigation/entryRoutes';
import { formatLocation } from '@/utils/formatLocation';
import type { BhajanStackParamList } from '@/navigation/types';

// Typed against the shared list: one component serves the Bhajan-tab and Home
// stacks (RULEBOOK §6.0.1).
type Props = NativeStackScreenProps<BhajanStackParamList, 'BhajanList'>;
// entryRoutes is typed for the Home stack; every route it picks for a bhajan
// (`BhajanReader`) is registered on both stacks that host this screen.
type EntryNav = Parameters<typeof navigateToEntryStart>[0];

/**
 * भजन संग्रह — the Bhajan tab's text shelf (design.md §34.1). Verified bhajans,
 * grouped under the deity they address (deities.ts order), then the regional
 * groups. Each group folds open/closed from its header; all start open.
 */
export default function BhajanListScreen({ navigation }: Props) {
  const { colors, spacing, typography, radii } = useTheme();
  const { lang } = useGitaLanguage();
  const { share, busy: shareBusy } = useShare();
  const { getProgress, isLoading } = useReadingProgress();
  const { markSeen } = useNewContent();
  const [pendingEntry, setPendingEntry] = useState<LibraryEntry | null>(null);
  const [collapsed, setCollapsed] = useState<ReadonlySet<BhajanGroupId>>(() => new Set());
  const entryNav = navigation as unknown as EntryNav;

  const entries = useMemo(() => bhajanShelfEntries(), []);
  const groups = useMemo(() => groupBhajanShelf(entries), [entries]);
  const backgroundImage = useMemo(() => getCategoryBackground('bhajan'), []);
  const categoryMeta = categories.find((c) => c.id === 'bhajan');
  const title = orderTitlesByLanguage(lang, categoryMeta?.nameHi ?? 'भजन', categoryMeta?.nameEn ?? 'Bhajans', {
    devPrimary: 16,
    devSecondary: 12,
    latPrimary: 18,
    latSecondary: 12,
  });

  const toggle = (id: BhajanGroupId) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const open = (entry: LibraryEntry) => {
    const progress = isLoading ? undefined : getProgress(entry.id);
    if (progress && progress.verseIndex > 0) {
      setPendingEntry(entry);
      return;
    }
    markSeen(entry.id);
    navigateToEntryStart(entryNav, entry);
  };

  const pendingProgress = pendingEntry ? getProgress(pendingEntry.id) : undefined;
  const location = pendingProgress ? formatLocation(pendingProgress) : null;
  const resumeCoverage = useResumeSheetCoverage(pendingEntry, pendingProgress, entryNav, () => {
    if (pendingEntry) markSeen(pendingEntry.id);
    setPendingEntry(null);
  });

  return (
    <View style={styles.root} testID="bhajan-list">
      <FocusedLightStatusBar />
      <BackgroundLayer source={backgroundImage} />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <View style={[styles.topBar, { paddingHorizontal: spacing.xxl }]}>
          <Pressable
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel={backLabel(lang)}
            hitSlop={16}
            style={({ pressed }) => [
              styles.backBtn,
              { backgroundColor: colors.parchmentSoft, borderColor: colors.divider },
              pressed && { opacity: 0.7 },
            ]}
          >
            <Text style={{ color: colors.inkSoft, fontSize: 18 }}>‹</Text>
          </Pressable>
          <View style={styles.titleRow}>
            <Text
              style={{
                fontFamily: title.primary.fontFamily,
                fontSize: title.primary.fontSize,
                fontStyle: title.primary.fontStyle,
                letterSpacing: title.primary.letterSpacing,
                color: colors.ink,
              }}
            >
              {title.primary.text}
            </Text>
            <Text
              style={{
                fontFamily: title.secondary.fontFamily,
                fontSize: title.secondary.fontSize,
                fontStyle: title.secondary.fontStyle,
                color: colors.inkMuted,
                marginLeft: 6,
              }}
            >
              · {title.secondary.text}
            </Text>
          </View>
          {entries.length > 0 && (
            <ShareButton
              busy={shareBusy}
              accessibilityLabel="Share bhajan listing"
              accessibilityHint="Share the complete list as post, Story, or Reel cards"
              onPress={() => {
                void share(buildListingShare({
                  sourceId: 'category-bhajan',
                  titleHi: categoryMeta?.nameHi ?? 'भजन',
                  titleEn: categoryMeta?.nameEn ?? 'Bhajans',
                  background: backgroundImage,
                  items: entries.map((entry) => ({
                    titleHi: entry.nameHi, titleEn: entry.nameEn,
                    detailHi: entry.sub, detailEn: entry.subEn,
                  })),
                }), lang);
              }}
            />
          )}
        </View>

        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingHorizontal: spacing.xxl, gap: spacing.lg }]}
          showsVerticalScrollIndicator={false}
        >
          {groups.length === 0 ? (
            <Text
              testID="bhajan-list-empty"
              style={{ color: colors.inkMuted, fontFamily: typography.meaning.fontFamily, fontSize: 15, lineHeight: 22, textAlign: 'center', marginTop: 32 }}
            >
              {pick(lang, {
                hi: 'भजन जाँच के बाद यहाँ जुड़ेंगे।',
                en: 'Bhajans appear here once their text is verified.',
                gu: 'ભજન ચકાસણી પછી અહીં ઉમેરાશે.',
                kn: 'ಪಠ್ಯ ಪರಿಶೀಲನೆಯಾದ ನಂತರ ಭಜನೆಗಳು ಇಲ್ಲಿ ಸೇರುತ್ತವೆ.',
              })}
            </Text>
          ) : (
            groups.map((group) => (
              <BhajanGroupSection
                key={group.id}
                group={group}
                expanded={!collapsed.has(group.id)}
                onToggle={() => toggle(group.id)}
                onOpen={open}
                radius={radii.lg}
              />
            ))
          )}
        </ScrollView>
      </SafeAreaView>

      {pendingEntry && pendingProgress && location && (
        <ResumeReadingSheet
          visible
          titleHi={pendingEntry.nameHi}
          titleEn={pendingEntry.nameEn}
          locationHi={location.hi}
          locationEn={location.en}
          onResume={() => {
            const progress = pendingProgress;
            markSeen(pendingEntry.id);
            setPendingEntry(null);
            navigateToProgress(entryNav, progress);
          }}
          onStartOver={() => {
            const entry = pendingEntry;
            markSeen(entry.id);
            setPendingEntry(null);
            navigateToEntryStart(entryNav, entry);
          }}
          onDismiss={() => setPendingEntry(null)}
          {...resumeCoverage}
        />
      )}
    </View>
  );
}

function BhajanGroupSection({
  group,
  expanded,
  onToggle,
  onOpen,
  radius,
}: {
  group: BhajanShelfGroup;
  expanded: boolean;
  onToggle: () => void;
  onOpen: (entry: LibraryEntry) => void;
  radius: number;
}) {
  const { colors, typography, spacing } = useTheme();
  const { lang } = useGitaLanguage();
  const name = contentByLang(lang, group.nameHi, group.nameEn);
  return (
    <View style={[styles.group, { borderColor: colors.cardActiveBorder, borderRadius: radius, backgroundColor: colors.cardSurface }]}>
      <Pressable
        onPress={onToggle}
        testID={`bhajan-group-${group.id}`}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        accessibilityLabel={`${group.nameEn}, ${group.entries.length} bhajans. ${expanded ? 'Collapse' : 'Expand'}.`}
        style={({ pressed }) => [styles.groupHeader, { paddingHorizontal: spacing.lg }, pressed && { opacity: 0.7 }]}
      >
        <Text style={[styles.groupName, { color: colors.saffronDeep }, pillTextStyle(lang, typography.sectionLabel)]}>
          {name}
        </Text>
        <Text style={[styles.groupCount, { color: colors.inkMuted }]}>{group.entries.length}</Text>
        <Text style={{ color: colors.saffronDeep, fontSize: 16 }}>{expanded ? '⌃' : '⌄'}</Text>
      </Pressable>
      {expanded && (
        <View style={[styles.groupBody, { paddingHorizontal: spacing.md, paddingBottom: spacing.md, gap: spacing.md }]}>
          {group.entries.map((entry) => (
            <LibraryCard key={entry.id} entry={entry} onPress={() => onOpen(entry)} />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleRow: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  scroll: {
    paddingTop: 8,
    paddingBottom: 150,
  },
  group: { borderWidth: 1, overflow: 'hidden' },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    gap: 12,
  },
  groupName: { flex: 1 },
  groupCount: { fontSize: 13, includeFontPadding: false },
  groupBody: {},
});
