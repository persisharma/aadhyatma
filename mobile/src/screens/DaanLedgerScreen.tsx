import { useRatingShare } from '@/utils/useRatingShare';
/**
 * दान-पुण्य खाता (PRD-26 §5, design.md §73) — the smaran register. Entries
 * grouped by civil month, each carrying its panchang tithi stamp. NO totals,
 * NO streaks, NO charts — the CSV share-sheet export is the only aggregation,
 * and it leaves the device only by the user's hand (PRD-06 posture). Gupt
 * entries render as date + "गुप्त दान" only (their detail was never stored).
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
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
  const shareWithRating = useRatingShare();
  const { colors, typography, spacing, radii, elevation } = useTheme();
  const { lang } = useGitaLanguage();
  const { entries, removeEntry } = useDaanLedger();
  const [pendingId, setPendingId] = useState<string | null>(null);
  // Consume synchronously: two taps before React commits still delete once.
  const pendingRef = useRef<string | null>(null);
  const pendingEntry = entries.find((entry) => entry.id === pendingId);
  const cancelRemove = () => { pendingRef.current = null; setPendingId(null); };
  useEffect(() => navigation.addListener('blur', cancelRemove), [navigation]);
  const requestRemove = (id: string) => {
    if (pendingRef.current !== null) return;
    pendingRef.current = id;
    setPendingId(id);
  };
  const confirmRemove = () => {
    const id = pendingRef.current;
    if (id !== pendingId) return;
    cancelRemove();
    if (id !== null && entries.some((entry) => entry.id === id)) removeEntry(id);
  };
  const removeLabel = pick(lang, { hi: 'प्रविष्टि हटाएँ', en: 'Remove entry', gu: 'નોંધ દૂર કરો', kn: 'ದಾಖಲೆ ತೆಗೆದುಹಾಕಿ' });
  const cancelLabel = pick(lang, { hi: 'रद्द करें', en: 'Cancel', gu: 'રદ કરો', kn: 'ರದ್ದುಮಾಡಿ' });
  const entryLabel = (entry: DaanLedgerEntry) => entry.gupt
    ? pick(lang, { hi: 'गुप्त दान', en: 'Gupt daan', gu: 'ગુપ્ત દાન', kn: 'ಗುಪ್ತ ದಾನ' })
    : contentByLang(lang, DAAN_CATEGORY_LABELS[entry.category].hi, DAAN_CATEGORY_LABELS[entry.category].en);
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
    shareWithRating({ message: buildLedgerCsv(entries) }).catch(() => undefined);
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
                'अभी कोई दान दर्ज नहीं है। ऊपर से पहला दान दर्ज करें, या सुदामा की कथा पढ़ें।',
                'No daan recorded yet. Record your first one above, or read Sudama’s story.'
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
                    accessibilityLabel={`${removeLabel}: ${entryLabel(entry)}, ${entry.isoDate}`}
                    onPress={() => requestRemove(entry.id)}
                    style={styles.removeButton}
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
      {pendingEntry ? (
        <Modal transparent animationType="fade" onRequestClose={cancelRemove}>
          <View style={[styles.backdrop, { backgroundColor: colors.modalBackdrop }]}>
            <Pressable testID="daan-remove-backdrop" accessible={false} style={StyleSheet.absoluteFill} onPress={cancelRemove} />
            <View testID="daan-remove-dialog" accessibilityViewIsModal importantForAccessibility="yes"
              onAccessibilityEscape={cancelRemove}
              style={[styles.confirmCard, { backgroundColor: colors.parchment, borderColor: colors.cardActiveBorder, borderRadius: radii.lg }]}>
              <ScrollView style={styles.confirmScroll} contentContainerStyle={styles.confirmContent}>
                <Text accessibilityRole="header" style={[styles.confirmTitle, { fontFamily: titleFont, color: colors.ink }]}>
                  {pick(lang, { hi: 'यह दान प्रविष्टि हटाएँ?', en: 'Remove this daan entry?', gu: 'આ દાનની નોંધ દૂર કરવી?', kn: 'ಈ ದಾನದ ದಾಖಲೆ ತೆಗೆದುಹಾಕಬೇಕೆ?' })}
                </Text>
                <Text testID="daan-remove-identity" style={[styles.confirmIdentity, { fontFamily: titleFont, color: colors.ink }]}>
                  {entryLabel(pendingEntry)} · {pendingEntry.isoDate}
                </Text>
                {!pendingEntry.gupt && pendingEntry.note ? (
                  <Text testID="daan-remove-note" style={[typography.meaning, styles.confirmText, { fontFamily: bodyFont, color: colors.inkSoft }]}>{pendingEntry.note}</Text>
                ) : null}
                <Text style={[typography.meaning, styles.confirmText, { fontFamily: bodyFont, color: colors.inkSoft, marginTop: spacing.md }]}>
                  {pick(lang, {
                    hi: 'यह प्रविष्टि आपके खाते से हट जाएगी। खाते में इसे वापस लाने का विकल्प नहीं है।',
                    en: 'This entry will leave your register. There is no undo in the register.',
                    gu: 'આ નોંધ તમારા ખાતામાંથી દૂર થશે. ખાતામાં તેને પાછી લાવવાનો વિકલ્પ નથી.',
                    kn: 'ಈ ದಾಖಲೆ ನಿಮ್ಮ ಖಾತೆಯಿಂದ ತೆಗೆದುಹಾಕಲಾಗುತ್ತದೆ. ಖಾತೆಯಲ್ಲಿ ಇದನ್ನು ಹಿಂದಿರುಗಿಸುವ ಆಯ್ಕೆ ಇಲ್ಲ.',
                  })}
                </Text>
              </ScrollView>
              <Pressable testID="daan-remove-confirm" accessibilityRole="button" accessibilityLabel={removeLabel} onPress={confirmRemove}
                style={[styles.confirmPrimary, { backgroundColor: colors.saffron, borderRadius: radii.md }]}>
                <Text style={{ fontFamily: titleFont, fontSize: 16, color: colors.onPrimary, textAlign: 'center' }}>{removeLabel}</Text>
              </Pressable>
              <Pressable testID="daan-remove-cancel" accessibilityRole="button" accessibilityLabel={cancelLabel} onPress={cancelRemove} style={styles.confirmCancel}>
                <Text style={{ fontFamily: bodyFont, fontSize: 15, color: colors.inkMuted, textAlign: 'center' }}>{cancelLabel}</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  removeButton: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  backdrop: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  confirmCard: { width: '100%', maxWidth: 420, maxHeight: '90%', padding: 20, borderWidth: 1 },
  confirmScroll: { flexGrow: 0, flexShrink: 1 },
  confirmContent: { paddingBottom: 20 },
  confirmTitle: { fontSize: 20, lineHeight: 30, textAlign: 'center', marginBottom: 16 },
  confirmIdentity: { fontSize: 16, lineHeight: 25, textAlign: 'center', marginBottom: 6 },
  confirmText: { textAlign: 'center' },
  confirmPrimary: { minHeight: 48, paddingVertical: 12, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center' },
  confirmCancel: { minHeight: 48, padding: 12, alignItems: 'center', justifyContent: 'center' },
  addBtn: { minHeight: 44, alignItems: 'center', justifyContent: 'center', marginTop: 12 },
  card: { borderWidth: 1, paddingHorizontal: 14, paddingVertical: 14 },
  chipBtn: { borderWidth: 1.5, paddingHorizontal: 14, paddingVertical: 7, marginTop: 11 },
  entry: { borderWidth: 1, paddingHorizontal: 13, paddingVertical: 11, marginBottom: 8, flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  exportBtn: { borderWidth: 1.5, minHeight: 42, alignItems: 'center', justifyContent: 'center', marginTop: 16 },
});
