/**
 * नया दान — the 10-second entry form (PRD-26 §4b U6, design.md §73). Only
 * date (auto) + category are required; everything else optional. The गुप्त
 * switch removes the detail fields from the tree — combined with the
 * ledger-core sanitizer, a gupt entry's note/amount is never captured, not
 * merely hidden. Amounts never render outside this ledger and its export.
 */
import React, { useState } from 'react';
import { AccessibilityInfo, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import ReaderHeader from '@/components/ReaderHeader';
import TextField from '@/components/TextField';
import { parseDaanAmount } from '@/data/daan/amount';
import { useDaanLedger } from '@/contexts/DaanLedgerContext';
import { useGitaLanguage } from '@/data/gita/language';
import {
  DAAN_CATEGORIES,
  DAAN_CATEGORY_LABELS,
  makeTithiStamp,
  type DaanCategory,
  type DaanLedgerEntry,
} from '@/data/daan';
import { usePanchangCalendarSystem, useTodayPanchang } from '@/panchang/usePanchang';
import type { DaanStackParamList } from '@/navigation/types';
import { useTheme } from '@/theme/ThemeContext';
import { contentByLang, pick } from '@/utils/localize';
import { scriptBodyFont, scriptTitleFont } from '@/utils/langType';

type Props = NativeStackScreenProps<DaanStackParamList, 'DaanEntry'>;

function localIsoDate(d: Date): string {
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

export default function DaanEntryScreen({ navigation, route }: Props) {
  const { colors, typography, spacing, radii } = useTheme();
  const { lang } = useGitaLanguage();
  const { addEntry, isLoading } = useDaanLedger();
  const titleFont = scriptTitleFont(lang, typography.readerTitle.fontFamily);
  const bodyFont = scriptBodyFont(lang, typography.meaning.fontFamily);

  const [calendarSystem] = usePanchangCalendarSystem();
  const { today } = useTodayPanchang(calendarSystem);
  const stamp = makeTithiStamp(today);

  const [category, setCategory] = useState<DaanCategory>('anna');
  const [gupt, setGupt] = useState(false);
  const [note, setNote] = useState('');
  const [amountText, setAmountText] = useState('');

  const [amountTouched, setAmountTouched] = useState(false);
  const amount = gupt ? { kind: 'blank' as const } : parseDaanAmount(amountText);
  const amountError = pick(lang, {
    hi: 'राशि जाँचें। उदाहरण: 1,000 या 1,000.50। दशमलव के बाद अधिकतम 2 अंक रखें।',
    en: 'Check the amount. Use 1,000 or 1,000.50, with at most 2 decimal places.',
    gu: 'રકમ તપાસો. ઉદાહરણ: 1,000 અથવા 1,000.50. દશાંશ પછી વધુમાં વધુ 2 અંક રાખો.',
    kn: 'ಮೊತ್ತ ಪರಿಶೀಲಿಸಿ. ಉದಾಹರಣೆ: 1,000 ಅಥವಾ 1,000.50. ದಶಮಾಂಶದ ನಂತರ ಗರಿಷ್ಠ 2 ಅಂಕಿಗಳಿರಲಿ.',
  });
  const amountLabel = pick(lang, {
    hi: 'राशि (₹) — वैकल्पिक · निजी', en: 'Amount (₹) — optional · private',
    gu: 'રકમ (₹) — વૈકલ્પિક · ખાનગી', kn: 'ಮೊತ್ತ (₹) — ಐಚ್ಛಿಕ · ಖಾಸಗಿ',
  });
  const showAmountError = amountTouched && amount.kind === 'invalid';

  const onSave = () => {
    if (isLoading) return;
    if (amount.kind === 'invalid') {
      setAmountTouched(true);
      AccessibilityInfo.announceForAccessibility(amountError);
      return;
    }
    const now = Date.now();
    const entry: DaanLedgerEntry = {
      id: `daan-${now}`,
      isoDate: localIsoDate(new Date()),
      tithiHi: stamp.hi,
      tithiEn: stamp.en,
      category,
      gupt,
      createdAtMs: now,
      // The context sanitizer strips these when gupt — belt and braces.
      ...(gupt ? {} : {
        occasionId: route.params?.occasionId,
        note: note.trim() ? note.trim() : undefined,
        amountInr: amount.kind === 'valid' ? amount.value : undefined,
      }),
    };
    addEntry(entry);
    navigation.goBack();
  };

  const fieldLabelStyle = {
    fontFamily: typography.sectionLabel.fontFamily,
    fontSize: typography.sectionLabel.fontSize,
    letterSpacing: lang === 'en' ? typography.sectionLabel.letterSpacing : 0,
    color: colors.gold,
    textTransform: 'uppercase' as const,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={['top']} testID="daan-entry-screen">
      <ReaderHeader
        title={contentByLang(lang, 'नया दान', 'New daan')}
        variant="index"
        onBack={() => navigation.goBack()}
      />
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: spacing.readingGutter, paddingBottom: spacing.xxl }}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={fieldLabelStyle}>{contentByLang(lang, 'तिथि — स्वतः', 'Tithi — automatic')}</Text>
        <View
          testID="daan-entry-tithi"
          style={[styles.tithiBox, { backgroundColor: colors.parchmentSoft, borderColor: colors.divider, borderRadius: radii.md }]}
        >
          <Text style={{ fontFamily: bodyFont, fontSize: 13, lineHeight: 20, color: colors.inkSoft }}>
            {contentByLang(lang, stamp.hi, stamp.en)}
          </Text>
        </View>

        <Text style={fieldLabelStyle}>
          {contentByLang(lang, 'प्रकार — बस इतना अनिवार्य है', 'Category — the only required choice')}
        </Text>
        <View style={styles.chips}>
          {DAAN_CATEGORIES.map((cat) => {
            const active = cat === category;
            return (
              <Pressable
                key={cat}
                testID={`daan-cat-${cat}`}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                accessibilityLabel={`Category ${DAAN_CATEGORY_LABELS[cat].en}`}
                onPress={() => setCategory(cat)}
                style={[
                  styles.chip,
                  {
                    borderColor: active ? colors.cardActiveBorder : colors.border,
                    backgroundColor: active ? colors.goldChipBg : colors.surface,
                    borderRadius: radii.pill,
                  },
                ]}
              >
                <Text style={{ fontFamily: titleFont, fontSize: 12.5, lineHeight: 19, color: active ? colors.saffronDeep : colors.inkSoft }}>
                  {contentByLang(lang, DAAN_CATEGORY_LABELS[cat].hi, DAAN_CATEGORY_LABELS[cat].en)}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={[styles.guptRow, { backgroundColor: colors.goldChipBg, borderColor: colors.divider, borderRadius: radii.lg }]}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: titleFont, fontSize: 14, lineHeight: 21, color: colors.ink }}>
              {contentByLang(lang, 'गुप्त दान', 'Gupt daan')}
            </Text>
            <Text style={{ fontFamily: bodyFont, fontSize: 11.5, lineHeight: 17, color: colors.inkMuted, marginTop: 2 }}>
              {contentByLang(lang, 'केवल तिथि दर्ज होगी — राशि, विवरण कुछ नहीं', 'Only the tithi is recorded — no amount, no detail')}
            </Text>
          </View>
          <Switch
            testID="daan-gupt-switch"
            value={gupt}
            onValueChange={setGupt}
            trackColor={{ false: colors.border, true: colors.saffron }}
            thumbColor={colors.parchment}
            accessibilityLabel="Gupt daan"
          />
        </View>

        {!gupt ? (
          <View testID="daan-entry-detail-fields">
            <Text style={fieldLabelStyle}>{contentByLang(lang, 'विवरण — वैकल्पिक', 'Note — optional')}</Text>
            <TextField
              variant="form"
              testID="daan-entry-note"
              value={note}
              onChangeText={setNote}
              placeholder={pick(lang, {
                hi: 'जैसे: खिचड़ी, मंदिर अन्नक्षेत्र में…',
                en: 'e.g. khichdi, at the temple anna-kshetra…',
                gu: 'જેમ કે: ખીચડી, મંદિર અન્નક્ષેત્રમાં…',
                kn: 'ಉದಾ: ಖಿಚಡಿ, ದೇವಸ್ಥಾನದ ಅನ್ನಕ್ಷೇತ್ರದಲ್ಲಿ…',
              })}
            />
            <Text style={fieldLabelStyle}>
              {amountLabel}
            </Text>
            <TextField
              variant="form"
              testID="daan-entry-amount"
              value={amountText}
              onChangeText={setAmountText}
              keyboardType="decimal-pad"
              onBlur={() => setAmountTouched(true)}
              accessibilityLabel={amountLabel}
              accessibilityHint={showAmountError ? amountError : undefined}
              style={{ height: 'auto', minHeight: 48, paddingVertical: 12, fontFamily: bodyFont }}
              placeholder={pick(lang, {
                hi: 'कभी किसी सूची या share card में नहीं दिखती',
                en: 'Never shown on any list or share card',
                gu: 'ક્યારેય કોઈ યાદી કે share cardમાં દેખાતી નથી',
                kn: 'ಯಾವುದೇ ಪಟ್ಟಿ ಅಥವಾ share cardನಲ್ಲಿ ಕಾಣುವುದಿಲ್ಲ',
              })}
            />
            {showAmountError ? (
              <Text testID="daan-amount-error" accessibilityRole="alert" accessibilityLiveRegion="polite"
                style={{ fontFamily: bodyFont, fontSize: typography.meaning.fontSize, lineHeight: typography.meaning.lineHeight, color: colors.saffronDeep, marginTop: spacing.sm }}>
                {amountError}
              </Text>
            ) : amount.kind === 'valid' ? (
              <Text testID="daan-amount-preview"
                style={{ fontFamily: bodyFont, fontSize: typography.meaning.fontSize, lineHeight: typography.meaning.lineHeight, color: colors.inkSoft, marginTop: spacing.sm }}>
                {pick(lang, { hi: 'दर्ज होने वाली राशि', en: 'Amount to record', gu: 'નોંધવાની રકમ', kn: 'ದಾಖಲಿಸಬೇಕಾದ ಮೊತ್ತ' })}: {amount.display}
              </Text>
            ) : null}
          </View>
        ) : null}

        <Pressable
          testID="daan-entry-save"
          accessibilityRole="button"
          accessibilityLabel="Save this daan"
          onPress={onSave}
          disabled={isLoading}
          accessibilityState={{ disabled: isLoading }}
          style={[styles.saveBtn, { backgroundColor: colors.saffron, borderRadius: radii.pill }]}
        >
          <Text style={{ fontFamily: titleFont, fontSize: 13.5, color: colors.onPrimary }}>
            {contentByLang(lang, 'दर्ज करें', 'Record')}
          </Text>
        </Pressable>

        <Text style={{ fontFamily: bodyFont, fontSize: 11.5, lineHeight: 18, color: colors.inkMuted, textAlign: 'center', marginTop: spacing.md }}>
          {contentByLang(
            lang,
            'गेट पर, हुंडी में, पड़ोस में दिया दान भी यहाँ दर्ज किया जा सकता है।',
            'Daan given at the gate, in the hundi, or to a neighbour can be recorded here too.'
          )}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  tithiBox: { borderWidth: 1, paddingHorizontal: 13, paddingVertical: 12 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  chip: { borderWidth: 1, paddingHorizontal: 13, paddingVertical: 7 },
  guptRow: { borderWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 13, paddingVertical: 11, marginTop: 16 },
  saveBtn: { minHeight: 46, alignItems: 'center', justifyContent: 'center', marginTop: 20 },
});
