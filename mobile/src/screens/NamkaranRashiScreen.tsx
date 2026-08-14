import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import ListCard, { CardThumb } from '@/components/ListCard';
import ReaderHeader from '@/components/ReaderHeader';
import { useGitaLanguage, type Lang } from '@/data/gita/language';
import { loadNamkaranNames } from '@/data/namkaran';
import type { PanchangStackParamList } from '@/navigation/types';
import { RASHI_NAMES_EN, RASHI_NAMES_HI } from '@/panchang/kundali';
import { NAKSHATRA_NAMES_EN, NAKSHATRA_NAMES_HI } from '@/panchang/names';
import { rashiCharanaEntries } from '@/panchang/namkaran';
import type { CharanaEntry } from '@/panchang/namkaranConvention';
import { useTheme } from '@/theme/ThemeContext';
import { fontFamilies } from '@/theme/typography';
import { contentByLang, meaningByLang } from '@/utils/localize';
import { scriptBodyFont, scriptTitleFont } from '@/utils/langType';

type Props = NativeStackScreenProps<PanchangStackParamList, 'NamkaranRashi'>;

/**
 * The rashi-level naming detail.
 *
 * A rashi spans exactly 30° = 9 charanas, so everything here is derived from
 * the same 108-cell convention table (convention §4) — there is deliberately no
 * second rashi-letter table. The screen exists because the charana is the
 * *finer* answer, not the only tradition in use: families who name by the Moon
 * sign need the nine charanas as real, tappable destinations rather than a
 * read-only strip of glyphs.
 */
export default function NamkaranRashiScreen({ navigation, route }: Props) {
  const { rashiIndex } = route.params;
  const { colors, typography, spacing, radii } = useTheme();
  const { lang } = useGitaLanguage();
  const [counts, setCounts] = useState<Readonly<Record<number, number>> | null>(null);

  const entries = useMemo(() => rashiCharanaEntries(rashiIndex), [rashiIndex]);
  const groups = useMemo(() => {
    const byNakshatra = new Map<number, CharanaEntry[]>();
    for (const entry of entries) {
      const bucket = byNakshatra.get(entry.nakshatraIndex);
      if (bucket) bucket.push(entry);
      else byNakshatra.set(entry.nakshatraIndex, [entry]);
    }
    return [...byNakshatra.entries()].map(([nakshatraIndex, items]) => ({ nakshatraIndex, items }));
  }, [entries]);
  const syllableCount = entries.reduce((total, entry) => total + entry.syllables.length, 0);

  // The corpus stays lazily required inside the Panchang stack. A missing count
  // simply hides the count line — it must never block the charana rows, which
  // are convention data and always correct.
  useEffect(() => {
    let active = true;
    void loadNamkaranNames()
      .then((records) => {
        if (!active) return;
        const tally: Record<number, number> = {};
        for (const record of records) {
          for (const charanaIndex of record.charanas) {
            tally[charanaIndex] = (tally[charanaIndex] ?? 0) + 1;
          }
        }
        setCounts(tally);
      })
      .catch(() => { if (active) setCounts({}); });
    return () => { active = false; };
  }, []);

  const rashiName = contentByLang(lang, RASHI_NAMES_HI[rashiIndex], RASHI_NAMES_EN[rashiIndex]);
  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.parchment }]} edges={['top', 'bottom']}>
      <ReaderHeader
        title={contentByLang(lang, `${RASHI_NAMES_HI[rashiIndex]} राशि`, `${RASHI_NAMES_EN[rashiIndex]} rashi`)}
        variant="index"
        onBack={navigation.goBack}
        backAccessibilityLabel="Back to Namkaran"
      />
      <ScrollView contentContainerStyle={[styles.content, { paddingHorizontal: spacing.readingGutter }]}>
        <View testID="namkaran-rashi-summary" style={[styles.summary, { borderColor: colors.divider, borderRadius: radii.lg }]}>
          <Text style={{ color: colors.ink, fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily), fontSize: 22 }}>{rashiName}</Text>
          <Text maxFontSizeMultiplier={1.25} style={[styles.summaryMeta, { color: colors.saffronDeep }]}>
            {contentByLang(lang, `९ चरण · ${syllableCount} अक्षर`, `9 charanas · ${syllableCount} sounds`)}
          </Text>
          <View accessibilityLabel={`Sounds of ${RASHI_NAMES_EN[rashiIndex]} rashi`} style={styles.grid}>
            {entries.map((entry) => (
              <View key={entry.charanaIndex} style={[styles.tile, { backgroundColor: colors.saffronTint, borderColor: colors.goldTint, borderRadius: radii.sm }]}>
                <Text style={{ color: colors.saffronDeep, fontFamily: fontFamilies.devanagariBold, fontSize: entry.syllables.length > 1 ? 13 : 17 }}>
                  {entry.syllables.map((value) => value.hi).join(' / ')}
                </Text>
              </View>
            ))}
          </View>
          <Text style={{ color: colors.inkMuted, fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily), fontSize: 12, lineHeight: 18, marginTop: 10 }}>
            {meaningByLang(
              lang,
              'कुछ परिवार चरण के बजाय चन्द्र राशि से नाम रखते हैं; दोनों परम्पराएँ प्रचलित हैं। किसी भी चरण पर टैप करके उसके नाम देखें।',
              'Some families name by the Moon rashi rather than the charana; both traditions are in use. Tap any charana to see its names.'
            )}
          </Text>
        </View>

        <Text style={[styles.section, { color: colors.inkMuted }]}>{contentByLang(lang, 'राशि के नौ चरण', 'THE NINE CHARANAS')}</Text>
        {groups.map(({ nakshatraIndex, items }) => (
          <View key={nakshatraIndex} testID={`namkaran-rashi-group-${nakshatraIndex + 1}`} style={styles.group}>
            <Text style={{ color: colors.ink, fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily), fontSize: 16 }}>
              {contentByLang(lang, NAKSHATRA_NAMES_HI[nakshatraIndex], NAKSHATRA_NAMES_EN[nakshatraIndex])}
            </Text>
            {items.map((entry) => (
              <CharanaRow
                key={entry.charanaIndex}
                entry={entry}
                lang={lang}
                nameCount={counts?.[entry.charanaIndex] ?? 0}
                onPress={() => navigation.navigate('NamkaranResult', {
                  basis: { kind: 'manual', nakshatraIndex: entry.nakshatraIndex, pada: entry.pada },
                })}
              />
            ))}
          </View>
        ))}

        <Text style={{ color: colors.inkMuted, fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily), fontSize: 11, lineHeight: 17 }}>
          {meaningByLang(
            lang,
            'जन्म के सही चरण से एक ही नामाक्षर मिलता है; राशि उसी तालिका के नौ चरणों को एक साथ दिखाती है।',
            'The exact charana at birth gives a single sound; a rashi gathers nine charanas of that same table.'
          )}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function CharanaRow({ entry, lang, nameCount, onPress }: { entry: CharanaEntry; lang: Lang; nameCount: number; onPress: () => void }) {
  const { colors, typography } = useTheme();
  const hi = entry.syllables.map((value) => value.hi).join(' / ');
  const latin = entry.syllables.map((value) => value.latin).join(' / ');
  const countLabel = nameCount
    ? contentByLang(lang, `${nameCount} नाम`, `${nameCount} ${nameCount === 1 ? 'name' : 'names'}`)
    : null;
  return (
    <ListCard
      testID={`namkaran-rashi-charana-${entry.charanaIndex}`}
      leading={<CardThumb><Text maxFontSizeMultiplier={1.25} style={{ color: colors.saffronDeep, fontFamily: fontFamilies.devanagariBold, fontSize: hi.length > 3 ? 13 : 19 }}>{hi}</Text></CardThumb>}
      onPress={onPress}
      accessibilityLabel={`${NAKSHATRA_NAMES_EN[entry.nakshatraIndex]} pada ${entry.pada}, ${latin}. Open names.`}
    >
      <Text maxFontSizeMultiplier={1.25} style={{ color: colors.ink, fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily), fontSize: 16 }}>
        {contentByLang(lang, `पद ${entry.pada} → ${hi}`, `Pada ${entry.pada} → ${latin}`)}
      </Text>
      <Text maxFontSizeMultiplier={1.25} numberOfLines={2} style={{ color: colors.inkMuted, fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily), fontSize: 11, lineHeight: 17, marginTop: 3 }}>
        {countLabel ? `${countLabel} · ` : ''}
        {entry.thin
          ? meaningByLang(lang, 'इस अक्षर से प्रचलित नाम सीमित हैं', 'Common names for this sound are limited')
          : meaningByLang(lang, 'इस चरण के नाम देखें', 'See the names for this charana')}
      </Text>
    </ListCard>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingBottom: 36, gap: 12 },
  summary: { borderWidth: 1, padding: 14 },
  summaryMeta: { fontFamily: fontFamilies.interSemiBold, fontSize: 11, letterSpacing: 0.4, marginTop: 3 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 11 },
  tile: { width: '31%', minHeight: 40, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  section: { fontFamily: fontFamilies.interSemiBold, fontSize: 10, letterSpacing: 1.2, marginTop: 4 },
  group: { gap: 8 },
});
