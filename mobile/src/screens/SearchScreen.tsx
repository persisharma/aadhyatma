import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  FlatList,
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import {
  getSearchIndex,
  runSearch,
  type SearchHit,
  type SearchSectionEntry,
  type SearchDeityEntry,
  type SearchVerseEntry,
} from '@/data/searchIndex';
import { library } from '@/data/texts';
import { useNewContent } from '@/contexts/NewContentContext';
import { orderTitlesByLanguage, type TitleScript } from '@/utils/titleByLanguage';
import {
  buildProgressTarget,
  navigateToEntryStart,
} from '@/navigation/entryRoutes';
import type { HomeStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<HomeStackParamList, 'Search'>;

const RECENT_KEY = '@vedansh/search-recent';
const RECENT_CAP = 6;

const POPULAR_FALLBACK_IDS = [
  'hanuman-chalisa',
  'bhagavad-gita',
  'sundarkand',
  'shiva-strotam',
] as const;

export default function SearchScreen({ navigation }: Props) {
  const { colors, typography, spacing, radii } = useTheme();
  const { lang } = useGitaLanguage();
  const { markSeen } = useNewContent();
  const inputRef = useRef<TextInput>(null);
  const [query, setQuery] = useState('');
  const [recent, setRecent] = useState<string[]>([]);

  // Hydrate recent searches from storage.
  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(RECENT_KEY)
      .then((raw) => {
        if (cancelled || !raw) return;
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            const cleaned = parsed
              .filter((s): s is string => typeof s === 'string' && s.trim().length > 0)
              .slice(0, RECENT_CAP);
            setRecent(cleaned);
          }
        } catch {
          /* ignore — corrupt blob is just an empty list */
        }
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  // Auto-focus the input on mount.
  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 200);
    return () => clearTimeout(t);
  }, []);

  // Build the index lazily on first user interaction (mount = first interaction
  // from the user's perspective — they tapped search to get here).
  const index = useMemo(() => getSearchIndex(), []);

  const results = useMemo(() => runSearch(query, index), [query, index]);

  const trimmed = query.trim();
  const hasQuery = trimmed.length > 0;
  const isHi = lang === 'hi';

  const popular = useMemo(() => {
    return POPULAR_FALLBACK_IDS
      .map((id) => library.find((e) => e.id === id))
      .filter((e): e is NonNullable<typeof e> => e != null && e.status === 'active' && !e.hidden)
      .slice(0, 4);
  }, []);

  const commitRecent = useCallback(async (q: string) => {
    const trimmedQ = q.trim();
    if (trimmedQ.length === 0) return;
    const updated = [trimmedQ, ...recent.filter((r) => r !== trimmedQ)].slice(0, RECENT_CAP);
    setRecent(updated);
    AsyncStorage.setItem(RECENT_KEY, JSON.stringify(updated)).catch(() => undefined);
  }, [recent]);

  const removeRecent = useCallback((q: string) => {
    setRecent((prev) => {
      const updated = prev.filter((r) => r !== q);
      AsyncStorage.setItem(RECENT_KEY, JSON.stringify(updated)).catch(() => undefined);
      return updated;
    });
  }, []);

  const clearAllRecent = useCallback(() => {
    setRecent([]);
    AsyncStorage.removeItem(RECENT_KEY).catch(() => undefined);
  }, []);

  const openSection = useCallback(
    (sourceId: string) => {
      const entry = library.find((e) => e.id === sourceId);
      if (!entry) return;
      markSeen(sourceId);
      commitRecent(query);
      Keyboard.dismiss();
      navigateToEntryStart(navigation as never, entry);
    },
    [navigation, query, commitRecent, markSeen]
  );

  const openVerse = useCallback(
    (hit: SearchVerseEntry) => {
      markSeen(hit.sourceId);
      const target = buildProgressTarget({
        sourceId: hit.sourceId,
        chapter: hit.chapter,
        verseIndex: hit.verseIndex,
      });
      commitRecent(query);
      Keyboard.dismiss();
      if (target) {
        (navigation as never as { navigate: (n: string, p: object) => void })
          .navigate(target.screen, target.params);
        return;
      }
      // Fallback: open the section from the start (e.g. unknown shape).
      const entry = library.find((e) => e.id === hit.sourceId);
      if (entry) navigateToEntryStart(navigation as never, entry);
    },
    [navigation, query, commitRecent, markSeen]
  );

  const openDeity = useCallback(
    (deityId: string) => {
      commitRecent(query);
      Keyboard.dismiss();
      (navigation as never as { navigate: (n: string, p: object) => void })
        .navigate('DeityList', { deityId });
    },
    [navigation, query, commitRecent]
  );

  const onClear = useCallback(() => {
    setQuery('');
    inputRef.current?.focus();
  }, []);

  const totalHits =
    results.sections.length + results.deities.length + results.verses.length;

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[colors.parchmentHighlight, colors.parchmentGradientEnd]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        {/* Top bar */}
        <View style={styles.topBar}>
          <Pressable
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel="Back"
            hitSlop={16}
            style={({ pressed }) => [
              styles.back,
              {
                backgroundColor: colors.parchmentSoft,
                borderColor: colors.divider,
              },
              pressed && { opacity: 0.7 },
            ]}
          >
            <Text style={[styles.backGlyph, { color: colors.inkSoft }]}>‹</Text>
          </Pressable>
          <View
            style={[
              styles.searchPill,
              {
                backgroundColor: colors.parchmentSoft,
                borderColor: colors.divider,
                borderRadius: radii.md,
              },
            ]}
          >
            <Text style={[styles.searchGlyph, { color: colors.saffron }]}>⌕</Text>
            <TextInput
              ref={inputRef}
              value={query}
              onChangeText={setQuery}
              placeholder={isHi ? 'श्लोक, पाठ, मंत्र खोजें…' : 'Search verses, sections, mantras…'}
              placeholderTextColor={colors.inkMuted}
              style={[
                styles.input,
                {
                  color: colors.ink,
                  fontFamily: 'Inter_500Medium',
                },
              ]}
              accessibilityLabel="Search input"
              autoCorrect={false}
              autoCapitalize="none"
              returnKeyType="search"
              onSubmitEditing={() => commitRecent(query)}
            />
            {hasQuery ? (
              <Pressable
                onPress={onClear}
                accessibilityRole="button"
                accessibilityLabel="Clear search"
                hitSlop={12}
                style={({ pressed }) => [styles.clearBtn, pressed && { opacity: 0.6 }]}
              >
                <Text style={[styles.clearGlyph, { color: colors.inkMuted }]}>✕</Text>
              </Pressable>
            ) : null}
          </View>
        </View>

        {/* Content */}
        {!hasQuery ? (
          <EmptyState
            recent={recent}
            popular={popular}
            colors={colors}
            typography={typography}
            spacing={spacing}
            radii={radii}
            onRecentPress={(q) => {
              setQuery(q);
              inputRef.current?.focus();
            }}
            onRecentRemove={removeRecent}
            onRecentClearAll={clearAllRecent}
            onPopularPress={(id) => openSection(id)}
            isHi={isHi}
          />
        ) : totalHits === 0 ? (
          <ZeroState colors={colors} typography={typography} isHi={isHi} />
        ) : (
          <ResultsList
            results={results}
            colors={colors}
            typography={typography}
            spacing={spacing}
            radii={radii}
            isHi={isHi}
            onSectionPress={(h) => openSection(h.entry.sourceId)}
            onDeityPress={(h) => openDeity(h.entry.deityId)}
            onVersePress={(h) => openVerse(h.entry)}
          />
        )}
      </SafeAreaView>
    </View>
  );
}

/* ============================================================ */
/*                         Subcomponents                        */
/* ============================================================ */

type Theme = ReturnType<typeof useTheme>;

function GroupHeader({
  label,
  count,
  colors,
  typography,
}: {
  label: string;
  count: number;
  colors: Theme['colors'];
  typography: Theme['typography'];
}) {
  return (
    <Text
      style={[
        styles.groupHeader,
        {
          color: colors.inkMuted,
          fontSize: typography.sectionLabel.fontSize,
          fontWeight: typography.sectionLabel.fontWeight,
          letterSpacing: typography.sectionLabel.letterSpacing,
        },
      ]}
    >
      {label} · {count}
    </Text>
  );
}

function PopularName({
  nameHi,
  nameEn,
  isHi,
  colors,
  typography,
}: {
  nameHi: string;
  nameEn: string;
  isHi: boolean;
  colors: Theme['colors'];
  typography: Theme['typography'];
}) {
  const { primary, secondary } = orderTitlesByLanguage(isHi ? 'hi' : 'en', nameHi, nameEn, {
    devPrimary: 14,
    devSecondary: 12,
    latPrimary: 13,
    latSecondary: 11,
  });
  const fontFor = (script: TitleScript) =>
    script === 'devanagari' ? typography.readerTitle.fontFamily : typography.cardLatin.fontFamily;

  return (
    <View style={styles.popularMeta}>
      <Text
        numberOfLines={1}
        style={[
          styles.popularNameHi,
          {
            color: colors.ink,
            fontFamily: fontFor(primary.script),
            fontSize: primary.fontSize,
            fontStyle: primary.script === 'latin' ? 'italic' : 'normal',
          },
        ]}
      >
        {primary.text}
      </Text>
      <Text
        numberOfLines={1}
        style={[
          styles.popularNameEn,
          {
            color: colors.inkMuted,
            fontFamily: fontFor(secondary.script),
            fontSize: secondary.fontSize,
            fontStyle: secondary.script === 'latin' ? 'italic' : 'normal',
          },
        ]}
      >
        {secondary.text}
      </Text>
    </View>
  );
}

function EmptyState({
  recent,
  popular,
  colors,
  typography,
  spacing,
  radii,
  onRecentPress,
  onRecentRemove,
  onRecentClearAll,
  onPopularPress,
  isHi,
}: {
  recent: string[];
  popular: { id: string; nameHi: string; nameEn: string; thumb: string }[];
  colors: Theme['colors'];
  typography: Theme['typography'];
  spacing: Theme['spacing'];
  radii: Theme['radii'];
  onRecentPress: (q: string) => void;
  onRecentRemove: (q: string) => void;
  onRecentClearAll: () => void;
  onPopularPress: (sourceId: string) => void;
  isHi: boolean;
}) {
  return (
    <FlatList
      data={[]}
      renderItem={null as never}
      keyExtractor={() => 'noop'}
      keyboardShouldPersistTaps="handled"
      ListHeaderComponent={
        <View style={[styles.emptyContent, { paddingHorizontal: spacing.xxl }]}>
          {recent.length > 0 ? (
            <>
              <View style={styles.recentHeader}>
                <GroupHeader
                  label={isHi ? 'हाल ही में' : 'Recent'}
                  count={recent.length}
                  colors={colors}
                  typography={typography}
                />
                <Pressable
                  onPress={onRecentClearAll}
                  accessibilityRole="button"
                  accessibilityLabel={isHi ? 'सभी हटाएं' : 'Clear all'}
                  hitSlop={8}
                  style={({ pressed }) => [{ opacity: pressed ? 0.5 : 1 }]}
                >
                  <Text style={{ color: colors.saffron, fontFamily: 'Inter_500Medium', fontSize: 12 }}>
                    {isHi ? 'सभी हटाएं' : 'Clear All'}
                  </Text>
                </Pressable>
              </View>
              <View style={styles.recentRow}>
                {recent.map((q) => (
                  <View key={q} style={[
                    styles.recentChip,
                    {
                      backgroundColor: colors.parchmentSoft,
                      borderColor: colors.divider,
                      borderRadius: radii.pill,
                    },
                  ]}>
                    <Pressable
                      onPress={() => onRecentPress(q)}
                      accessibilityRole="button"
                      accessibilityLabel={`Search again: ${q}`}
                      style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                    >
                      <Text
                        numberOfLines={1}
                        style={[
                          styles.recentChipText,
                          { color: colors.inkSoft, fontFamily: 'Inter_500Medium' },
                        ]}
                      >
                        {q}
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => onRecentRemove(q)}
                      accessibilityRole="button"
                      accessibilityLabel={`Remove ${q} from recent`}
                      hitSlop={6}
                      style={({ pressed }) => [styles.recentRemoveBtn, { opacity: pressed ? 0.4 : 1 }]}
                    >
                      <Text style={[styles.recentRemoveGlyph, { color: colors.inkMuted }]}>✕</Text>
                    </Pressable>
                  </View>
                ))}
              </View>
            </>
          ) : null}

          <GroupHeader
            label={isHi ? 'लोकप्रिय' : 'Popular'}
            count={popular.length}
            colors={colors}
            typography={typography}
          />
          <View style={styles.popularRow}>
            {popular.map((p) => (
              <Pressable
                key={p.id}
                onPress={() => onPopularPress(p.id)}
                accessibilityRole="button"
                accessibilityLabel={`Open ${p.nameEn}`}
                style={({ pressed }) => [
                  styles.popularCell,
                  {
                    backgroundColor: colors.parchmentSoft,
                    borderColor: colors.divider,
                    borderRadius: radii.md,
                    opacity: pressed ? 0.85 : 1,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.popularThumb,
                    {
                      color: colors.saffronDeep,
                      fontFamily: typography.readerTitle.fontFamily,
                    },
                  ]}
                >
                  {p.thumb}
                </Text>
                <PopularName
                  nameHi={p.nameHi}
                  nameEn={p.nameEn}
                  isHi={isHi}
                  colors={colors}
                  typography={typography}
                />
              </Pressable>
            ))}
          </View>
        </View>
      }
    />
  );
}

function ZeroState({
  colors,
  typography,
  isHi,
}: {
  colors: Theme['colors'];
  typography: Theme['typography'];
  isHi: boolean;
}) {
  return (
    <View style={styles.zero}>
      <Text
        style={[
          styles.zeroGlyph,
          { color: colors.inkMuted, fontFamily: typography.verse.fontFamily },
        ]}
      >
        ॥
      </Text>
      <Text
        style={[
          styles.zeroPrimary,
          { color: colors.ink, fontFamily: typography.readerTitle.fontFamily },
        ]}
      >
        {isHi ? 'कोई परिणाम नहीं' : 'No matches found'}
      </Text>
      <Text
        style={[
          styles.zeroSecondary,
          { color: colors.inkMuted, fontFamily: typography.meaning.fontFamily },
        ]}
      >
        {isHi
          ? 'देवनागरी शब्द या पाठ का नाम आज़माएँ।'
          : 'Try a Devanagari word or a section name.'}
      </Text>
    </View>
  );
}

type Row =
  | { kind: 'header'; key: string; label: string; count: number }
  | { kind: 'section'; key: string; hit: SearchHit<SearchSectionEntry> }
  | { kind: 'deity'; key: string; hit: SearchHit<SearchDeityEntry> }
  | { kind: 'verse'; key: string; hit: SearchHit<SearchVerseEntry> }
  | { kind: 'capped'; key: string; label: string };

function ResultsList({
  results,
  colors,
  typography,
  spacing,
  radii,
  isHi,
  onSectionPress,
  onDeityPress,
  onVersePress,
}: {
  results: ReturnType<typeof runSearch>;
  colors: Theme['colors'];
  typography: Theme['typography'];
  spacing: Theme['spacing'];
  radii: Theme['radii'];
  isHi: boolean;
  onSectionPress: (h: SearchHit<SearchSectionEntry>) => void;
  onDeityPress: (h: SearchHit<SearchDeityEntry>) => void;
  onVersePress: (h: SearchHit<SearchVerseEntry>) => void;
}) {
  const rows: Row[] = useMemo(() => {
    const out: Row[] = [];
    if (results.sections.length > 0) {
      out.push({
        kind: 'header',
        key: 'h-sections',
        label: isHi ? 'पाठ' : 'Sections',
        count: results.sections.length,
      });
      results.sections.forEach((h) =>
        out.push({ kind: 'section', key: h.entry.id, hit: h })
      );
    }
    if (results.deities.length > 0) {
      out.push({
        kind: 'header',
        key: 'h-deities',
        label: isHi ? 'देवता' : 'Deities',
        count: results.deities.length,
      });
      results.deities.forEach((h) =>
        out.push({ kind: 'deity', key: h.entry.id, hit: h })
      );
    }
    if (results.verses.length > 0) {
      out.push({
        kind: 'header',
        key: 'h-verses',
        label: isHi ? 'श्लोक' : 'Verses',
        count: results.verses.length,
      });
      results.verses.forEach((h) =>
        out.push({ kind: 'verse', key: h.entry.id, hit: h })
      );
      if (results.versesCapped) {
        out.push({
          kind: 'capped',
          key: 'capped',
          label: isHi
            ? 'और परिणाम — विशिष्ट खोजें टाइप करें'
            : 'More results — type a more specific query',
        });
      }
    }
    return out;
  }, [results, isHi]);

  return (
    <FlatList
      data={rows}
      keyExtractor={(r) => r.key}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      contentContainerStyle={{
        paddingHorizontal: spacing.xxl,
        paddingBottom: spacing.xxl * 3,
      }}
      renderItem={({ item }) => {
        if (item.kind === 'header') {
          return (
            <GroupHeader
              label={item.label}
              count={item.count}
              colors={colors}
              typography={typography}
            />
          );
        }
        if (item.kind === 'section') {
          const s = item.hit.entry;
          return (
            <Pressable
              onPress={() => onSectionPress(item.hit)}
              accessibilityRole="button"
              accessibilityLabel={`Open ${s.displayEn}`}
              style={({ pressed }) => [
                styles.resultRow,
                {
                  backgroundColor: colors.parchmentSoft,
                  borderColor: colors.divider,
                  borderRadius: radii.md,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
            >
              <Text
                style={[
                  styles.sectionThumb,
                  { color: colors.saffronDeep, fontFamily: typography.readerTitle.fontFamily },
                ]}
              >
                {s.thumb}
              </Text>
              <View style={styles.resultBody}>
                <Text
                  style={[styles.resultPrimary, { color: colors.ink, fontFamily: typography.readerTitle.fontFamily }]}
                  numberOfLines={1}
                >
                  {isHi ? s.displayHi : s.displayEn}
                </Text>
                <Text
                  style={[styles.resultSecondary, { color: colors.inkMuted, fontFamily: 'Inter_500Medium' }]}
                  numberOfLines={1}
                >
                  {s.subtitleHi}
                </Text>
              </View>
              <Text style={[styles.chevron, { color: colors.saffron }]}>›</Text>
            </Pressable>
          );
        }
        if (item.kind === 'deity') {
          const d = item.hit.entry;
          return (
            <Pressable
              onPress={() => onDeityPress(item.hit)}
              accessibilityRole="button"
              accessibilityLabel={`Open ${d.displayEn}`}
              style={({ pressed }) => [
                styles.resultRow,
                {
                  backgroundColor: colors.parchmentSoft,
                  borderColor: colors.divider,
                  borderRadius: radii.md,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
            >
              <Text
                style={[
                  styles.sectionThumb,
                  { color: colors.gold, fontFamily: typography.readerTitle.fontFamily },
                ]}
              >
                ॐ
              </Text>
              <View style={styles.resultBody}>
                <Text
                  style={[styles.resultPrimary, { color: colors.ink, fontFamily: typography.readerTitle.fontFamily }]}
                  numberOfLines={1}
                >
                  {isHi ? d.displayHi : d.displayEn}
                </Text>
                <Text
                  style={[styles.resultSecondary, { color: colors.inkMuted, fontFamily: 'Inter_500Medium' }]}
                  numberOfLines={1}
                >
                  {isHi ? 'देवता' : 'Deity'}
                </Text>
              </View>
              <Text style={[styles.chevron, { color: colors.saffron }]}>›</Text>
            </Pressable>
          );
        }
        if (item.kind === 'verse') {
          const v = item.hit.entry;
          return (
            <Pressable
              onPress={() => onVersePress(item.hit)}
              accessibilityRole="button"
              accessibilityLabel={`Open ${v.sectionNameEn} ${v.labelEn}`}
              style={({ pressed }) => [
                styles.resultRow,
                {
                  backgroundColor: colors.parchmentSoft,
                  borderColor: colors.divider,
                  borderRadius: radii.md,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
            >
              <View style={styles.resultBody}>
                <Text
                  numberOfLines={1}
                  style={[
                    styles.verseLine,
                    { color: colors.ink, fontFamily: typography.verse.fontFamily },
                  ]}
                >
                  {isHi ? v.firstLineHi : v.firstLineEn || v.firstLineHi}
                </Text>
                <Text
                  numberOfLines={1}
                  style={[
                    styles.verseMeta,
                    { color: colors.inkMuted, fontFamily: 'CormorantGaramond_400Regular_Italic' },
                  ]}
                >
                  {(isHi ? v.sectionNameHi : v.sectionNameEn)} · {(isHi ? v.labelHi : v.labelEn)}
                </Text>
              </View>
              <Text style={[styles.chevron, { color: colors.saffron }]}>›</Text>
            </Pressable>
          );
        }
        // capped
        return (
          <Text
            style={[
              styles.cappedNote,
              { color: colors.inkMuted, fontFamily: 'CormorantGaramond_400Regular_Italic' },
            ]}
          >
            {item.label}
          </Text>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  topBar: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  back: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backGlyph: {
    fontSize: 22,
    lineHeight: 24,
    marginTop: -2,
    includeFontPadding: false,
  },
  searchPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    gap: 8,
  },
  searchGlyph: {
    fontSize: 24,
    includeFontPadding: false,
  },
  input: {
    flex: 1,
    fontSize: 15,
    includeFontPadding: false,
    paddingVertical: 0,
  },
  clearBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearGlyph: {
    fontSize: 14,
    fontWeight: '600',
  },
  groupHeader: {
    textTransform: 'uppercase',
    marginTop: 14,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderWidth: 1,
    gap: 12,
    marginBottom: 8,
  },
  sectionThumb: {
    fontSize: 22,
    width: 32,
    textAlign: 'center',
    includeFontPadding: false,
  },
  resultBody: {
    flex: 1,
  },
  resultPrimary: {
    fontSize: 16,
    includeFontPadding: false,
  },
  resultSecondary: {
    fontSize: 12,
    marginTop: 2,
    includeFontPadding: false,
  },
  verseLine: {
    fontSize: 17,
    lineHeight: 24,
    includeFontPadding: false,
  },
  verseMeta: {
    fontSize: 13,
    marginTop: 3,
    includeFontPadding: false,
  },
  chevron: {
    fontSize: 22,
    includeFontPadding: false,
  },
  cappedNote: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 24,
    includeFontPadding: false,
  },
  emptyContent: {
    paddingTop: 4,
  },
  recentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  recentRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 4,
  },
  recentChip: {
    borderWidth: 1,
    paddingVertical: 6,
    paddingLeft: 12,
    paddingRight: 6,
    maxWidth: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  recentChipText: {
    fontSize: 13,
    includeFontPadding: false,
  },
  recentRemoveBtn: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recentRemoveGlyph: {
    fontSize: 10,
    includeFontPadding: false,
  },
  popularRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  popularCell: {
    width: '48%',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  popularThumb: {
    fontSize: 22,
    includeFontPadding: false,
  },
  popularMeta: {
    flex: 1,
  },
  popularNameHi: {
    fontSize: 14,
    includeFontPadding: false,
  },
  popularNameEn: {
    fontSize: 11,
    marginTop: 2,
    fontStyle: 'italic',
    includeFontPadding: false,
  },
  zero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  zeroGlyph: {
    fontSize: 32,
    opacity: 0.35,
    marginBottom: 16,
    includeFontPadding: false,
  },
  zeroPrimary: {
    fontSize: 18,
    marginBottom: 8,
    includeFontPadding: false,
  },
  zeroSecondary: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    includeFontPadding: false,
  },
});
