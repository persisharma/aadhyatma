import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '@/theme/ThemeContext';
import {
  upanishadCatalogue,
  upanishadCategories,
  upanishadTitleEn,
  upanishadTitleHi,
  upanishadTitleEnOf,
  upanishadTitleHiOf,
  upanishadVedas,
  type UpanishadCatalogueRow,
  type UpanishadCategory,
} from '@/data/upanishad';
import { useGitaLanguage } from '@/data/gita/language';
import { contentByLang, pick } from '@/utils/localize';
import { cardFontByLang, isLatinLang, pillTextStyle } from '@/utils/langType';
import { getSourceBackground } from '@/data/backgrounds';
import ReaderHeader from '@/components/ReaderHeader';
import BackgroundLayer from '@/components/BackgroundLayer';
import LanguageToggle from '@/components/LanguageToggle';
import GitaChapterCard from '@/components/GitaChapterCard';
import UpanishadCategoryChips, {
  type UpanishadCategoryFilter,
} from '@/components/UpanishadCategoryChips';
import { useReadingProgress } from '@/contexts/ReadingProgressContext';
import type { RootStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'UpanishadChapters'>;

/**
 * The Upanishads index: all 108 texts of the Muktikā canon, grouped by the
 * traditional seven categories with a chip filter (design.md §75). Texts that
 * have shipped open the reader; the rest are listed as coming, so the shape of
 * the canon is visible before every text is in.
 */
export default function UpanishadChaptersScreen({ navigation }: Props) {
  const { colors, spacing, typography } = useTheme();
  const { lang } = useGitaLanguage();
  const { getChapterProgress } = useReadingProgress();
  const [filter, setFilter] = useState<UpanishadCategoryFilter>('all');

  const title = contentByLang(lang, upanishadTitleHi, upanishadTitleEn);
  const catalogue = useMemo(() => upanishadCatalogue(), []);

  const counts = useMemo(() => {
    const out = {} as Record<UpanishadCategory, { total: number; available: number }>;
    for (const c of upanishadCategories) out[c.id] = { total: 0, available: 0 };
    for (const row of catalogue) {
      out[row.category].total++;
      if (row.summary) out[row.category].available++;
    }
    return out;
  }, [catalogue]);

  const rows = useMemo(
    () => (filter === 'all' ? catalogue : catalogue.filter((r) => r.category === filter)),
    [catalogue, filter]
  );
  const available = rows.filter((r) => r.summary != null).length;

  const summaryLine = pick(lang, {
    hi: `${rows.length} उपनिषद् · ${available} पठनीय`,
    en: `${rows.length} Upanishads · ${available} readable`,
    gu: `${rows.length} ઉપનિષદ · ${available} વાંચી શકાય`,
    kn: `${rows.length} ಉಪನಿಷದ್ · ${available} ಓದಬಹುದು`,
  });
  const groupDesc =
    filter === 'all'
      ? pick(lang, {
          hi: 'मुक्तिकोपनिषद् की १०८ की सूची — सात परम्परागत वर्ग',
          en: 'The 108 of the Muktika canon, in its seven traditional groups',
          gu: 'મુક્તિકોપનિષદની ૧૦૮ની સૂચિ — સાત પરંપરાગત વર્ગ',
          kn: 'ಮುಕ್ತಿಕೋಪನಿಷದ್‌ನ ೧೦೮ರ ಪಟ್ಟಿ — ಏಳು ಪಾರಂಪರಿಕ ವರ್ಗ',
        })
      : (() => {
          const c = upanishadCategories.find((x) => x.id === filter);
          return c ? contentByLang(lang, c.descHi, c.descEn) : '';
        })();

  return (
    <View style={[styles.root, { backgroundColor: colors.parchment }]}>
      <BackgroundLayer source={getSourceBackground('upanishad')} />

      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
        <ReaderHeader title={title} onBack={() => navigation.goBack()} variant="index" />

        <View style={styles.toggleRow}>
          <LanguageToggle />
        </View>

        <UpanishadCategoryChips value={filter} lang={lang} counts={counts} onChange={setFilter} />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingHorizontal: spacing.screenGutter, gap: spacing.md },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.summary} accessibilityRole="header" accessibilityLabel={`${rows.length} Upanishads. ${available} readable.`}>
            <Text
              style={{
                color: colors.saffronDeep,
                fontFamily: cardFontByLang(lang),
                fontSize: typography.cardMeta.fontSize,
                letterSpacing: typography.cardMeta.letterSpacing,
              }}
            >
              {summaryLine}
            </Text>
            <Text
              style={{
                color: colors.inkMuted,
                fontFamily: cardFontByLang(lang),
                fontSize: isLatinLang(lang) ? 13 : 14,
                fontStyle: lang === 'en' ? 'italic' : 'normal',
              }}
            >
              {groupDesc}
            </Text>
          </View>

          {rows.map((row) =>
            row.summary ? (
              <GitaChapterCard
                key={row.muktika}
                // The card's count is the mantras proper; the śānti-pāṭha page is
                // not a mantra of the text, so `verseCount` (pages) would overstate
                // it by one (design.md §75).
                chapter={{
                  chapter: row.muktika,
                  titleHi: row.summary.titleHi,
                  titleEn: row.summary.titleEn,
                  verseCount: row.summary.mantraCount,
                }}
                // The subsection unit is the Upanishad itself, numbered by the
                // Muktikā canon, and each one holds mantras (§3 pill vocabulary).
                chapterLabelHi="उपनिषद्"
                chapterLabelEn="Upanishad"
                unitLabelHi="मन्त्र"
                unitLabelEn="mantras"
                unitLabelEnSingular="mantra"
                onPress={() => {
                  const resumeIndex =
                    getChapterProgress('upanishad', row.muktika)?.verseIndex ?? 0;
                  navigation.navigate('UpanishadReader', {
                    chapter: row.muktika,
                    initialIndex: resumeIndex,
                  });
                }}
              />
            ) : (
              <ComingRow key={row.muktika} row={row} lang={lang} />
            )
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

/** A catalogue row whose text has not shipped yet — listed, dimmed, not tappable. */
function ComingRow({ row, lang }: { row: UpanishadCatalogueRow; lang: ReturnType<typeof useGitaLanguage>['lang'] }) {
  const { colors, typography, radii } = useTheme();
  const veda = upanishadVedas[row.veda];
  const name = contentByLang(lang, upanishadTitleHiOf(row), upanishadTitleEnOf(row));
  const tag = `${contentByLang(lang, 'उपनिषद्', 'Upanishad')} ${row.muktika}`;
  const meta = contentByLang(lang, veda.nameHi, veda.nameEn);
  const soon = pick(lang, { hi: 'शीघ्र', en: 'Soon', gu: 'ટૂંક સમયમાં', kn: 'ಶೀಘ್ರದಲ್ಲಿ' });
  return (
    <View
      accessible
      accessibilityLabel={`${tag}. ${upanishadTitleEnOf(row)}. ${veda.nameEn}. Coming soon.`}
      accessibilityState={{ disabled: true }}
      style={[
        styles.coming,
        { borderRadius: radii.lg, borderColor: colors.divider, backgroundColor: colors.parchmentSoft },
      ]}
    >
      <View style={[styles.comingThumb, { borderRadius: radii.md, borderColor: colors.divider }]}>
        <Text style={{ color: colors.inkMuted, fontFamily: typography.thumb.fontFamily, fontSize: 18 }}>
          {row.muktika}
        </Text>
      </View>
      <View style={styles.comingMeta}>
        <Text style={[pillTextStyle(lang, typography.versePill), { color: colors.inkMuted }]}>
          {tag.toUpperCase()}
        </Text>
        <Text
          numberOfLines={2}
          style={{
            color: colors.inkSoft,
            fontFamily: cardFontByLang(lang),
            fontSize: isLatinLang(lang) ? 16 : 17,
            fontStyle: lang === 'en' ? 'italic' : 'normal',
          }}
        >
          {name}
        </Text>
        <Text
          style={{
            color: colors.inkMuted,
            fontSize: typography.cardMeta.fontSize,
            letterSpacing: typography.cardMeta.letterSpacing,
          }}
        >
          {meta}
        </Text>
      </View>
      <Text
        style={[
          pillTextStyle(lang, typography.versePill),
          styles.soon,
          { color: colors.inkMuted, borderColor: colors.divider, borderRadius: radii.pill },
        ]}
      >
        {soon}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  safe: {
    flex: 1,
  },
  toggleRow: {
    paddingVertical: 8,
    paddingBottom: 12,
    alignItems: 'center',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  summary: {
    gap: 2,
    paddingBottom: 4,
  },
  coming: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    opacity: 0.78,
  },
  comingThumb: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  comingMeta: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  soon: {
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
});
