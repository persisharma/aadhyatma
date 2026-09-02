/**
 * दान-पुण्य खाता (PRD-26 §5, design.md §69) — the smaran register. Entries
 * grouped by civil month, each carrying its panchang tithi stamp. NO totals,
 * NO streaks, NO charts — the CSV share-sheet export is the only aggregation,
 * and it leaves the device only by the user's hand (PRD-06 posture). Gupt
 * entries render as date + "गुप्त दान" only (their detail was never stored).
 */
import React, { useMemo } from 'react';
import { Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import ReaderHeader from '@/components/ReaderHeader';
import { useDaanLedger } from '@/contexts/DaanLedgerContext';
import { useGitaLanguage, type Lang } from '@/data/gita/language';
import { DAAN_CATEGORY_LABELS, buildLedgerCsv, type DaanLedgerEntry } from '@/data/daan';
import type { DaanStackParamList } from '@/navigation/types';
import { useTheme } from '@/theme/ThemeContext';
import { contentByLang, pick } from '@/utils/localize';
import { scriptBodyFont, scriptTitleFont } from '@/utils/langType';
import { transliterateDevanagari } from '@/utils/transliterate';

type Props = NativeStackScreenProps<DaanStackParamList, 'DaanLedger'>;

const MONTHS_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_HI = ['जनवरी', 'फ़रवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'];

function monthLabel(isoMonth: string, lang: Lang): string {
  const [year, month] = isoMonth.split('-').map((n) => parseInt(n, 10));
  const hi = `${MONTHS_HI[month - 1]} ${year}`;
  if (lang === 'hi') return hi;
  if (lang === 'en') return `${MONTHS_EN[month - 1]} ${year}`;
  return transliterateDevanagari(hi, lang);
}

export default function DaanLedgerScreen({ navigation }: Props) {
  const { colors, typography, spacing, radii, elevation } = useTheme();
  const { lang } = useGitaLanguage();
  const { entries, removeEntry } = useDaanLedger();
  const titleFont = scriptTitleFont(lang, typography.readerTitle.fontFamily);
  const bodyFont = scriptBodyFont(lang, typography.meaning.fontFamily);

  const groups = useMemo(() => {
    const sorted = [...entries].sort((a, b) =>
      a.isoDate < b.isoDate ? 1 : a.isoDate > b.isoDate ? -1 : b.createdAtMs - a.createdAtMs
    );
    const byMonth = new Map<string, DaanLedgerEntry[]>();
    for (const entry of sorted) {
      const key = entry.isoDate.slice(0, 7);
      const list = byMonth.get(key) ?? [];
      list.push(entry);
      byMonth.set(key, list);
    }
    return [...byMonth.entries()];
  }, [entries]);

  const onExport = () => {
    // Device-only: the CSV goes wherever the user's own share sheet sends it.
    Share.share({ message: buildLedgerCsv(entries) }).catch(() => undefined);
  };

  const sectionLabelStyle = {
    fontFamily: typography.sectionLabel.fontFamily,
    fontSize: typography.sectionLabel.fontSize,
    letterSpacing: lang === 'en' ? typography.sectionLabel.letterSpacing : 0,
    color: colors.inkMuted,
    textTransform: 'uppercase' as const,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={['top']} testID="daan-ledger-screen">
      <ReaderHeader
        title={contentByLang(lang, 'दान-पुण्य खाता', 'Daan Punya register')}
        variant="index"
        onBack={() => navigation.goBack()}
      />
      <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.readingGutter, paddingBottom: spacing.xxl }}>
        <Text style={{ fontFamily: bodyFont, fontSize: 12.5, lineHeight: 19, color: colors.inkMuted, textAlign: 'center', marginTop: spacing.sm }}>
          {contentByLang(lang, 'स्मरण, अंक नहीं — निजी, केवल इस डिवाइस पर', 'A remembrance, never a score — private, on this device only')}
        </Text>

        <Pressable
          testID="daan-ledger-add"
          accessibilityRole="button"
          accessibilityLabel="Record a new daan"
          onPress={() => navigation.navigate('DaanEntry', {})}
          style={[styles.addBtn, { backgroundColor: colors.saffron, borderRadius: radii.pill }]}
        >
          <Text style={{ fontFamily: titleFont, fontSize: 13.5, color: colors.onPrimary }}>
            {contentByLang(lang, 'नया दान दर्ज करें', 'Record a new daan')}
          </Text>
        </Pressable>

        {entries.length === 0 ? (
          <View style={[styles.card, { backgroundColor: colors.parchmentSoft, borderColor: colors.divider, borderRadius: radii.lg, marginTop: spacing.lg }, elevation.card]}>
            <Text style={{ fontFamily: bodyFont, fontSize: 13, lineHeight: 21, color: colors.inkSoft, textAlign: 'center' }}>
              {contentByLang(
                lang,
                'सुदामा की मुट्ठी भर पोहा भी पूर्ण दान था — यहाँ मात्रा नहीं, स्मरण दर्ज होता है। पहला दान दर्ज करें, या पहले उसकी कथा पढ़ें।',
                'Sudama’s fistful of poha was a complete gift — this register keeps remembrance, not amounts. Record your first daan, or read his story first.'
              )}
            </Text>
            <Pressable
              testID="daan-ledger-empty-katha"
              accessibilityRole="button"
              accessibilityLabel="Read Sudama's story"
              onPress={() => navigation.navigate('DaanKatha', { kathaId: 'sudama' })}
              style={[styles.chipBtn, { borderColor: colors.saffron, borderRadius: radii.pill, alignSelf: 'center' }]}
            >
              <Text style={{ fontFamily: titleFont, fontSize: 12.5, color: colors.saffronDeep }}>
                {contentByLang(lang, 'सुदामा का पोहा ›', 'Sudama’s poha ›')}
              </Text>
            </Pressable>
          </View>
        ) : (
          groups.map(([isoMonth, monthEntries]) => (
            <View key={isoMonth}>
              <Text style={sectionLabelStyle}>{monthLabel(isoMonth, lang)}</Text>
              {monthEntries.map((entry) => (
                <View
                  key={entry.id}
                  testID={`daan-entry-${entry.id}`}
                  style={[
                    styles.entry,
                    { backgroundColor: entry.gupt ? colors.goldChipBg : colors.parchmentSoft, borderColor: colors.divider, borderRadius: radii.lg },
                    elevation.card,
                  ]}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: titleFont, fontSize: 14, lineHeight: 21, color: colors.ink }}>
                      {entry.gupt
                        ? contentByLang(lang, 'गुप्त दान', 'Gupt daan')
                        : contentByLang(lang, DAAN_CATEGORY_LABELS[entry.category].hi, DAAN_CATEGORY_LABELS[entry.category].en)}
                    </Text>
                    <Text style={{ fontFamily: bodyFont, fontSize: 11.5, lineHeight: 17, color: colors.inkMuted, marginTop: 2 }}>
                      {contentByLang(lang, entry.tithiHi, entry.tithiEn)} · {entry.isoDate}
                    </Text>
                    {!entry.gupt && entry.note ? (
                      <Text style={{ fontFamily: bodyFont, fontSize: 12, lineHeight: 18, color: colors.inkSoft, marginTop: 3 }}>
                        {entry.note}
                      </Text>
                    ) : null}
                  </View>
                  <Pressable
                    testID={`daan-entry-remove-${entry.id}`}
                    accessibilityRole="button"
                    accessibilityLabel="Remove this entry"
                    onPress={() => removeEntry(entry.id)}
                    hitSlop={8}
                  >
                    <Text style={{ fontSize: 15, color: colors.inkMuted }}>✕</Text>
                  </Pressable>
                </View>
              ))}
            </View>
          ))
        )}

        {entries.length > 0 ? (
          <Pressable
            testID="daan-ledger-export"
            accessibilityRole="button"
            accessibilityLabel="Export the ledger as CSV"
            onPress={onExport}
            style={[styles.exportBtn, { borderColor: colors.saffron, borderRadius: radii.pill }]}
          >
            <Text style={{ fontFamily: titleFont, fontSize: 13, color: colors.saffronDeep }}>
              {pick(lang, {
                hi: 'निर्यात करें (CSV) — share sheet से',
                en: 'Export (CSV) — via the share sheet',
                gu: 'નિકાસ કરો (CSV) — share sheet થી',
                kn: 'ರಫ್ತು ಮಾಡಿ (CSV) — share sheet ಮೂಲಕ',
              })}
            </Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  addBtn: { minHeight: 44, alignItems: 'center', justifyContent: 'center', marginTop: 12 },
  card: { borderWidth: 1, paddingHorizontal: 14, paddingVertical: 14 },
  chipBtn: { borderWidth: 1.5, paddingHorizontal: 14, paddingVertical: 7, marginTop: 11 },
  entry: { borderWidth: 1, paddingHorizontal: 13, paddingVertical: 11, marginBottom: 8, flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  exportBtn: { borderWidth: 1.5, minHeight: 42, alignItems: 'center', justifyContent: 'center', marginTop: 16 },
});
