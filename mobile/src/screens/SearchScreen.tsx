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
import { fontFamilies } from '@/theme/typography';
import { useGitaLanguage, type Lang } from '@/data/gita/language';
import {
  getSearchIndex,
  runSearch,
  type SearchHit,
  type SearchSectionEntry,
  type SearchDeityEntry,
  type SearchVerseEntry,
} from '@/data/searchIndex';
import { library } from '@/data/texts';
import { getVidhiById } from '@/data/vidhi';
import { useNewContent } from '@/contexts/NewContentContext';
import { orderTitlesByLanguage } from '@/utils/titleByLanguage';
import { contentByLang, pick } from '@/utils/localize';
import { pillTextStyle } from '@/utils/langType';
import { buildProgressTarget, navigateToEntryStart } from '@/navigation/entryRoutes';
import type { HomeStackParamList } from '@/navigation/types';
import { useAsk } from '@/ask/useAsk';
import { navigateAskTarget } from '@/ask/actions';
import type { AskTarget } from '@/ask/types';
import AskAnswerCard, { AskAbstainCard } from '@/components/AskAnswerCard';

type Props = NativeStackScreenProps<HomeStackParamList, 'Search'>;

const RECENT_KEY = '@vedansh/search-recent';
const RECENT_CAP = 6;

const POPULAR_FALLBACK_IDS = [
  'hanuman-chalisa',
  'bhagavad-gita',
  'sundarkand',
  'shiva-strotam',
] as const;

export default function SearchScreen({ navigation, route }: Props) {
  const { colors, typography, spacing, radii } = useTheme();
  const { lang } = useGitaLanguage();
  const { markSeen } = useNewContent();
  const inputRef = useRef<TextInput>(null);
  const [query, setQuery] = useState(route.params?.initialQuery ?? '');
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

  // जिज्ञासा (PRD-31): the same box answers a *question* above the library
  // results. The engine loads lazily (one dynamic import) and warms on mount,
  // so it is ready by the first keystroke; a plain query never sees an abstain.
  const { ready: askReady, ask, looksLikeQuestion, examples: askExamples } = useAsk(route.params?.seed);
  const resolution = useMemo(() => (hasQuery && askReady ? ask(trimmed) : null), [hasQuery, askReady, ask, trimmed]);
  // Only a multi-word (or "?"-terminated) question may show the abstain card:
  // a single interrogative mid-typing ("kab") must not flash "can't answer"
  // before the sentence exists. Answers are unaffected — they show as soon as
  // the resolver has one.
  const isQuestion = hasQuery && looksLikeQuestion(trimmed) && (trimmed.includes(' ') || trimmed.endsWith('?'));

  // Rotating placeholder: real answerable questions are the feature's own
  // discovery surface. Paused while the user is typing.
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  useEffect(() => {
    if (hasQuery || askExamples.length === 0) return;
    const t = setInterval(() => setPlaceholderIdx((i) => (i + 1) % askExamples.length), 3200);
    return () => clearInterval(t);
  }, [hasQuery, askExamples.length]);

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
      // Vidhi rows (PRD-19 Phase 2B) are procedures, not library readers, so
      // they open VidhiDetail rather than routing through `navigateToEntryStart`.
      // The vidhi flow is registered on the Home stack too, so this pushes in
      // place and back returns to the search results.
      if (getVidhiById(sourceId)) {
        commitRecent(query);
        Keyboard.dismiss();
        navigation.navigate('VidhiDetail', { vidhiId: sourceId });
        return;
      }
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

  const onAskAction = useCallback(
    (target: AskTarget) => {
      commitRecent(query);
      Keyboard.dismiss();
      navigateAskTarget(navigation as never, target);
    },
    [navigation, query, commitRecent]
  );

  const totalHits =
    results.sections.length + results.deities.length + results.verses.length;

  const askExample = askExamples[placeholderIdx % Math.max(1, askExamples.length)];
  const placeholder = askExample
    ? contentByLang(lang, askExample.hi, askExample.en)
    : pick(lang, { hi: 'श्लोक, पाठ, मंत्र खोजें…', en: 'Search verses, sections, mantras…', gu: 'શ્લોક, પાઠ, મંત્ર શોધો…', kn: 'ಶ್ಲೋಕ, ಪಠ್ಯ, ಮಂತ್ರ ಹುಡುಕಿ…' });

  // The answer (or, for a question-shaped query, the abstain card) heads the
  // results list. A non-question query with no answer renders exactly as 1.4.6.
  const askHeader =
    hasQuery && resolution ? (
      resolution.kind === 'answer' ? (
        <View style={{ marginTop: spacing.sm, marginBottom: spacing.md }}>
          <AskAnswerCard answer={resolution.answer} lang={lang} onAction={onAskAction} />
        </View>
      ) : isQuestion ? (
        <View style={{ marginTop: spacing.sm, marginBottom: spacing.md }}>
          <AskAbstainCard
            kind={resolution.kind}
            suggestions={resolution.kind === 'none' ? resolution.suggestions : []}
            lang={lang}
            libraryEmpty={totalHits === 0}
            onSuggestion={(q) => {
              setQuery(q);
              inputRef.current?.focus();
            }}
          />
        </View>
      ) : null
    ) : null;

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
              placeholder={placeholder}
              placeholderTextColor={colors.inkMuted}
              style={[
                styles.input,
                {
                  color: colors.ink,
                  fontFamily: fontFamilies.inter,
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
            onTodayVidhan={() => navigation.navigate('TodayVidhan')}
            lang={lang}
          />
        ) : (
          <ResultsList
            results={results}
            colors={colors}
            typography={typography}
            spacing={spacing}
            radii={radii}
            lang={lang}
            header={askHeader}
            empty={askHeader ? null : <ZeroState colors={colors} typography={typography} lang={lang} />}
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
  lang,
  colors,
  typography,
}: {
  label: string;
  count: number;
  lang: Lang;
  colors: Theme['colors'];
  typography: Theme['typography'];
}) {
  return (
    <Text
      style={[
        styles.groupHeader,
        {
          color: colors.inkMuted,
          // pillTextStyle: sectionLabel's Latin tracking splits the shirorekha
          // on the localized hi/gu/kn group names.
          ...pillTextStyle(lang, typography.sectionLabel),
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
  lang,
  colors,
}: {
  nameHi: string;
  nameEn: string;
  lang: Lang;
  colors: Theme['colors'];
}) {
  const { primary, secondary } = orderTitlesByLanguage(lang, nameHi, nameEn, {
    devPrimary: 14,
    devSecondary: 12,
    latPrimary: 14,
    latSecondary: 11,
  });

  return (
    <View style={styles.popularMeta}>
      <Text
        numberOfLines={1}
        style={[
          styles.popularNameHi,
          {
            color: colors.ink,
            fontFamily: primary.fontFamily,
            fontSize: primary.fontSize,
            fontStyle: primary.fontStyle,
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
            fontFamily: secondary.fontFamily,
            fontSize: secondary.fontSize,
            fontStyle: secondary.fontStyle,
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
  onTodayVidhan,
  lang,
}: {
  recent: string[];
  popular: { id: string; nameHi: string; nameEn: string; thumb: string }[];
  /** जिज्ञासा (PRD-31): the briefing door in the question box's empty state. */
  onTodayVidhan: () => void;
  colors: Theme['colors'];
  typography: Theme['typography'];
  spacing: Theme['spacing'];
  radii: Theme['radii'];
  onRecentPress: (q: string) => void;
  onRecentRemove: (q: string) => void;
  onRecentClearAll: () => void;
  onPopularPress: (sourceId: string) => void;
  lang: Lang;
}) {
  return (
    <FlatList
      data={[]}
      renderItem={null as never}
      keyExtractor={() => 'noop'}
      keyboardShouldPersistTaps="handled"
      ListHeaderComponent={
        <View style={[styles.emptyContent, { paddingHorizontal: spacing.xxl }]}>
          <Pressable
            onPress={onTodayVidhan}
            accessibilityRole="button"
            accessibilityLabel="Open Today's Vidhan"
            style={({ pressed }) => [
              styles.vidhanRow,
              { backgroundColor: colors.parchmentSoft, borderColor: colors.divider, borderRadius: radii.md, opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <Text style={[styles.vidhanGlyph, { color: colors.saffron }]}>?</Text>
            <View style={styles.resultBody}>
              <Text style={[styles.resultPrimary, { color: colors.ink, fontFamily: typography.readerTitle.fontFamily }]} numberOfLines={1}>
                {pick(lang, { hi: 'आज का विधान', en: "Today's Vidhan", gu: 'આજનું વિધાન', kn: 'ಇಂದಿನ ವಿಧಾನ' })}
              </Text>
              <Text style={[styles.resultSecondary, { color: colors.inkMuted, fontFamily: fontFamilies.inter }]} numberOfLines={1}>
                {pick(lang, { hi: 'आज की तिथि · व्रत · शुभ समय · संकल्प', en: 'Tithi · observance · windows · sankalp', gu: 'તિથિ · વ્રત · શુભ સમય · સંકલ્પ', kn: 'ತಿಥಿ · ವ್ರತ · ಶುಭ ಸಮಯ · ಸಂಕಲ್ಪ' })}
              </Text>
            </View>
            <Text style={[styles.chevron, { color: colors.saffron }]}>›</Text>
          </Pressable>
          {recent.length > 0 ? (
            <>
              <View style={styles.recentHeader}>
                <GroupHeader
                  label={pick(lang, { hi: 'हाल ही में', en: 'Recent', gu: 'તાજેતરનું', kn: 'ಇತ್ತೀಚಿನ' })}
                  count={recent.length}
                  lang={lang}
                  colors={colors}
                  typography={typography}
                />
                <Pressable
                  onPress={onRecentClearAll}
                  accessibilityRole="button"
                  accessibilityLabel={pick(lang, { hi: 'सभी हटाएं', en: 'Clear all', gu: 'બધું સાફ કરો', kn: 'ಎಲ್ಲವನ್ನು ತೆರವುಗೊಳಿಸಿ' })}
                  hitSlop={8}
                  style={({ pressed }) => [{ opacity: pressed ? 0.5 : 1 }]}
                >
                  <Text style={{ color: colors.saffron, fontFamily: fontFamilies.inter, fontSize: 12 }}>
                    {pick(lang, { hi: 'सभी हटाएं', en: 'Clear All', gu: 'બધું સાફ કરો', kn: 'ಎಲ್ಲವನ್ನು ತೆರವುಗೊಳಿಸಿ' })}
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
                          { color: colors.inkSoft, fontFamily: fontFamilies.inter },
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
            label={pick(lang, { hi: 'लोकप्रिय', en: 'Popular', gu: 'લોકપ્રિય', kn: 'ಜನಪ್ರಿಯ' })}
            count={popular.length}
            lang={lang}
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
                  lang={lang}
                  colors={colors}
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
  lang,
}: {
  colors: Theme['colors'];
  typography: Theme['typography'];
  lang: Lang;
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
        {pick(lang, { hi: 'कोई परिणाम नहीं', en: 'No matches found', gu: 'કોઈ પરિણામ નથી', kn: 'ಯಾವುದೇ ಫಲಿತಾಂಶವಿಲ್ಲ' })}
      </Text>
      <Text
        style={[
          styles.zeroSecondary,
          { color: colors.inkMuted, fontFamily: typography.meaning.fontFamily },
        ]}
      >
        {pick(lang, { hi: 'देवनागरी शब्द या पाठ का नाम आज़माएँ।', en: 'Try a Devanagari word or a section name.', gu: 'દેવનાગરી શબ્દ કે પાઠનું નામ અજમાવો.', kn: 'ದೇವನಾಗರಿ ಪದ ಅಥವಾ ಪಠ್ಯದ ಹೆಸರನ್ನು ಪ್ರಯತ್ನಿಸಿ.' })}
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
  lang,
  header,
  empty,
  onSectionPress,
  onDeityPress,
  onVersePress,
}: {
  results: ReturnType<typeof runSearch>;
  colors: Theme['colors'];
  typography: Theme['typography'];
  spacing: Theme['spacing'];
  radii: Theme['radii'];
  lang: Lang;
  /** जिज्ञासा answer / abstain card, rendered above the first group. */
  header?: React.ReactElement | null;
  /** Rendered when there are no library rows (and no ask header owns the space). */
  empty?: React.ReactElement | null;
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
        label: pick(lang, { hi: 'पाठ', en: 'Sections', gu: 'પાઠ', kn: 'ಪಠ್ಯಗಳು' }),
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
        label: pick(lang, { hi: 'देवता', en: 'Deities', gu: 'દેવતા', kn: 'ದೇವತೆಗಳು' }),
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
        label: pick(lang, { hi: 'श्लोक', en: 'Verses', gu: 'શ્લોક', kn: 'ಶ್ಲೋಕಗಳು' }),
        count: results.verses.length,
      });
      results.verses.forEach((h) =>
        out.push({ kind: 'verse', key: h.entry.id, hit: h })
      );
      if (results.versesCapped) {
        out.push({
          kind: 'capped',
          key: 'capped',
          label: pick(lang, { hi: 'और परिणाम — विशिष्ट खोजें टाइप करें', en: 'More results — type a more specific query', gu: 'વધુ પરિણામ — વધુ ચોક્કસ શોધ ટાઇપ કરો', kn: 'ಹೆಚ್ಚಿನ ಫಲಿತಾಂಶ — ಹೆಚ್ಚು ನಿರ್ದಿಷ್ಟ ಹುಡುಕಾಟ ಟೈಪ್ ಮಾಡಿ' }),
        });
      }
    }
    return out;
  }, [results, lang]);

  return (
    <FlatList
      data={rows}
      keyExtractor={(r) => r.key}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      ListHeaderComponent={header ?? undefined}
      ListEmptyComponent={empty ?? undefined}
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
              lang={lang}
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
                  {contentByLang(lang, s.displayHi, s.displayEn)}
                </Text>
                <Text
                  style={[styles.resultSecondary, { color: colors.inkMuted, fontFamily: fontFamilies.inter }]}
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
                  {contentByLang(lang, d.displayHi, d.displayEn)}
                </Text>
                <Text
                  style={[styles.resultSecondary, { color: colors.inkMuted, fontFamily: fontFamilies.inter }]}
                  numberOfLines={1}
                >
                  {pick(lang, { hi: 'देवता', en: 'Deity', gu: 'દેવતા', kn: 'ದೇವತೆ' })}
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
                  {contentByLang(lang, v.firstLineHi, v.firstLineEn || v.firstLineHi)}
                </Text>
                <Text
                  numberOfLines={1}
                  style={[
                    styles.verseMeta,
                    { color: colors.inkMuted, fontFamily: fontFamilies.latinItalic },
                  ]}
                >
                  {contentByLang(lang, v.sectionNameHi, v.sectionNameEn)} · {contentByLang(lang, v.labelHi, v.labelEn)}
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
              { color: colors.inkMuted, fontFamily: fontFamilies.latinItalic },
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
  vidhanRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1, marginTop: 12, marginBottom: 6 },
  vidhanGlyph: { fontSize: 22, width: 28, textAlign: 'center' },
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
