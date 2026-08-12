import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

import ReaderHeader from '@/components/ReaderHeader';
import TextField from '@/components/TextField';
import { useGitaLanguage, type Lang } from '@/data/gita/language';
import { usePitruSmaran } from '@/contexts/PitruSmaranContext';
import {
  deriveTithiRuleFromDate,
  isValidTithiRule,
  SMARAN_RELATIONS,
  tithiName,
  tithiRuleLabel,
  type SmaranEntry,
  type SmaranRelation,
  type TithiRule,
} from '@/panchang/pitruSmaran';
import { LUNAR_MONTH_NAMES_EN, LUNAR_MONTH_NAMES_HI, PAKSHA_NAMES_EN, PAKSHA_NAMES_HI } from '@/panchang/names';
import { useTheme } from '@/theme/ThemeContext';
import { fontFamilies } from '@/theme/typography';
import { contentByLang } from '@/utils/localize';
import { scriptBodyFont, scriptTitleFont } from '@/utils/langType';
import { transliterateDevanagari } from '@/utils/transliterate';
import type { Paksha } from '@/panchang/types';
import type { MoreStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<MoreStackParamList, 'PitruSmaranEdit'>;

type EntryMode = 'tithi' | 'date';

// Strict DD/MM/YYYY (also accepts - and . separators). Rejects impossible
// calendar dates and anything outside 1800..today.
function parseCivilDate(text: string): Date | null {
  const match = /^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})$/.exec(text.trim());
  if (!match) return null;
  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  if (year < 1800 || month < 1 || month > 12 || day < 1 || day > 31) return null;
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
  if (date.getTime() > Date.now()) return null;
  return date;
}

function localizedHi(text: string, lang: Lang): string {
  return lang === 'hi' || lang === 'en' ? text : transliterateDevanagari(text, lang);
}

/**
 * स्मरण जोड़ें / सम्पादन (PRD-17) — two ways in, one confirmation:
 *  • "तिथि ज्ञात है" — month/paksha/tithi pickers built from the engine's own
 *    name enumerations (names.ts), plus the सर्वपितृ अमावस्या unknown-tithi option.
 *  • "केवल तारीख़ ज्ञात है" — Gregorian date in, computed tithi shown back IN WORDS
 *    in a confirmation card the user must accept. A silent conversion is never
 *    persisted; "तिथि स्वयं चुनें" switches to the manual pickers pre-filled.
 */
export default function PitruSmaranEditScreen({ navigation, route }: Props) {
  const { colors, typography, spacing, radii } = useTheme();
  const { lang } = useGitaLanguage();
  const { getEntry, addEntry, updateEntry } = usePitruSmaran();

  const editingId = route.params?.entryId;
  const existing = editingId ? getEntry(editingId) : null;

  const [relation, setRelation] = useState<SmaranRelation>(existing?.relation ?? 'pitaji');
  const [name, setName] = useState(existing?.name ?? '');
  const [mode, setMode] = useState<EntryMode>('tithi');
  const [unknownTithi, setUnknownTithi] = useState(existing?.tithiRule === 'sarvapitri');
  const existingRule = existing && existing.tithiRule !== 'sarvapitri' ? existing.tithiRule : null;
  const [lunarMonth, setLunarMonth] = useState<number | null>(existingRule?.lunarMonth ?? null);
  const [paksha, setPaksha] = useState<Paksha>(existingRule?.paksha ?? 'shukla');
  const [tithi, setTithi] = useState<number | null>(existingRule?.tithi ?? null);
  const [dateText, setDateText] = useState('');
  // The confirmed conversion: rule + the exact date it was derived from. Cleared
  // the moment the typed date changes, so a stale tithi can never be saved.
  const [derived, setDerived] = useState<{ rule: TithiRule; forMs: number } | null>(null);

  const parsedDate = useMemo(() => parseCivilDate(dateText), [dateText]);

  // Deriving the tithi is an astronomy solve — run it off the render path.
  useEffect(() => {
    if (mode !== 'date' || !parsedDate) {
      setDerived(null);
      return undefined;
    }
    let cancelled = false;
    const forMs = parsedDate.getTime();
    const handle = setTimeout(() => {
      try {
        const rule = deriveTithiRuleFromDate(new Date(forMs));
        if (!cancelled) setDerived({ rule, forMs });
      } catch {
        if (!cancelled) setDerived(null);
      }
    }, 0);
    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [mode, parsedDate]);

  const manualRule: TithiRule | null =
    lunarMonth !== null && tithi !== null ? { lunarMonth, paksha, tithi } : null;

  const canSave =
    mode === 'tithi'
      ? unknownTithi || (manualRule !== null && isValidTithiRule(manualRule))
      : derived !== null && parsedDate !== null && derived.forMs === parsedDate.getTime();

  const save = () => {
    if (!canSave) return;
    const tithiRule: SmaranEntry['tithiRule'] =
      mode === 'tithi'
        ? unknownTithi
          ? 'sarvapitri'
          : (manualRule as TithiRule)
        : (derived as { rule: TithiRule; forMs: number }).rule;
    const derivedFromDateMs = mode === 'date' ? derived?.forMs : undefined;
    const trimmed = name.trim();
    if (existing) {
      updateEntry(existing.id, {
        relation,
        name: trimmed.length > 0 ? trimmed : undefined,
        tithiRule,
        derivedFromDateMs,
      });
    } else {
      addEntry({
        id: `smaran-${Date.now()}`,
        relation,
        name: trimmed.length > 0 ? trimmed : undefined,
        tithiRule,
        derivedFromDateMs,
        createdAtMs: Date.now(),
      });
    }
    navigation.goBack();
  };

  const chooseTithiMyself = () => {
    if (derived) {
      setLunarMonth(derived.rule.lunarMonth);
      setPaksha(derived.rule.paksha);
      setTithi(derived.rule.tithi);
    }
    setUnknownTithi(false);
    setMode('tithi');
  };

  const labelFont = scriptTitleFont(lang, typography.readerTitle.fontFamily);
  const bodyFont = scriptBodyFont(lang, typography.meaning.fontFamily);
  const monthNames = lang === 'en' ? LUNAR_MONTH_NAMES_EN : LUNAR_MONTH_NAMES_HI;

  const chip = (selected: boolean) => [
    styles.chip,
    {
      borderRadius: radii.pill,
      backgroundColor: selected ? colors.saffronTint : colors.parchmentSoft,
      borderColor: selected ? colors.saffron : colors.divider,
    },
  ];
  const chipText = (selected: boolean) => ({
    fontFamily: bodyFont,
    fontSize: 13,
    color: selected ? colors.saffronDeep : colors.inkSoft,
  });

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[colors.parchmentHighlight, colors.parchmentGradientEnd]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <ReaderHeader
          variant="index"
          title={existing
            ? contentByLang(lang, 'स्मरण सम्पादन', 'Edit Smaran')
            : contentByLang(lang, 'स्मरण जोड़ें', 'Add Smaran')}
          onBack={() => navigation.goBack()}
        />
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingHorizontal: spacing.xxl }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* सम्बन्ध */}
          <Text style={[styles.fieldLabel, { color: colors.inkMuted }]}>
            {contentByLang(lang, 'सम्बन्ध', 'RELATION')}
          </Text>
          <View style={styles.chipWrap}>
            {SMARAN_RELATIONS.map((r) => {
              const selected = relation === r.id;
              return (
                <Pressable
                  key={r.id}
                  onPress={() => setRelation(r.id)}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  accessibilityLabel={`Relation ${r.labelEn}`}
                  style={({ pressed }) => [...chip(selected), pressed && { opacity: 0.7 }]}
                >
                  <Text style={chipText(selected)}>
                    {lang === 'en' ? r.labelEn : localizedHi(r.labelHi, lang)}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* नाम (वैकल्पिक) */}
          <Text style={[styles.fieldLabel, { color: colors.inkMuted, marginTop: 14 }]}>
            {contentByLang(lang, 'नाम (वैकल्पिक)', 'NAME (OPTIONAL)')}
          </Text>
          <TextField
            variant="form"
            value={name}
            onChangeText={setName}
            maxLength={60}
            placeholder={contentByLang(lang, 'केवल आपके लिए — कहीं और नहीं दिखेगा', 'Only for you — shown nowhere else')}
            accessibilityLabel="Name, optional"
          />

          {/* Mode toggle */}
          <View style={[styles.modeSeg, { backgroundColor: colors.parchmentSoft, borderColor: colors.divider, borderRadius: radii.md }]}>
            {(
              [
                ['tithi', contentByLang(lang, 'तिथि ज्ञात है', 'Tithi known')],
                ['date', contentByLang(lang, 'केवल तारीख़ ज्ञात है', 'Only date known')],
              ] as const
            ).map(([value, label]) => {
              const active = mode === value;
              return (
                <Pressable
                  key={value}
                  onPress={() => setMode(value)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  accessibilityLabel={value === 'tithi' ? 'Tithi known' : 'Only date known'}
                  style={[styles.seg, active && { backgroundColor: colors.parchmentHighlight, borderRadius: radii.sm }]}
                >
                  <Text style={{ fontFamily: bodyFont, fontSize: 13, color: active ? colors.saffronDeep : colors.inkMuted }}>
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {mode === 'tithi' ? (
            <>
              {/* सर्वपितृ अमावस्या fallback for unknown tithis */}
              <Pressable
                onPress={() => setUnknownTithi((v) => !v)}
                accessibilityRole="button"
                accessibilityState={{ selected: unknownTithi }}
                accessibilityLabel="Tithi unknown, save on Sarvapitri Amavasya"
                style={({ pressed }) => [
                  styles.unknownRow,
                  {
                    borderColor: unknownTithi ? colors.gold : colors.divider,
                    backgroundColor: unknownTithi ? colors.goldTint : colors.parchmentSoft,
                    borderRadius: radii.md,
                  },
                  pressed && { opacity: 0.8 },
                ]}
              >
                <Text style={{ fontFamily: bodyFont, fontSize: 13, color: colors.inkSoft, flex: 1 }}>
                  {contentByLang(lang, 'तिथि अज्ञात — सर्वपितृ अमावस्या पर स्मरण', 'Tithi unknown — remember on Sarvapitri Amavasya')}
                </Text>
                <Text style={{ fontSize: 15, color: unknownTithi ? colors.saffronDeep : colors.inkMuted }}>
                  {unknownTithi ? '✓' : '○'}
                </Text>
              </Pressable>

              {!unknownTithi && (
                <>
                  <Text style={[styles.fieldLabel, { color: colors.inkMuted, marginTop: 12 }]}>
                    {contentByLang(lang, 'मास', 'LUNAR MONTH')}
                  </Text>
                  <View style={styles.chipWrap}>
                    {monthNames.map((m, i) => {
                      const selected = lunarMonth === i + 1;
                      return (
                        <Pressable
                          key={m}
                          onPress={() => setLunarMonth(i + 1)}
                          accessibilityRole="button"
                          accessibilityState={{ selected }}
                          accessibilityLabel={`Month ${LUNAR_MONTH_NAMES_EN[i]}`}
                          style={({ pressed }) => [...chip(selected), pressed && { opacity: 0.7 }]}
                        >
                          <Text style={chipText(selected)}>{lang === 'en' ? m : localizedHi(m, lang)}</Text>
                        </Pressable>
                      );
                    })}
                  </View>

                  <Text style={[styles.fieldLabel, { color: colors.inkMuted, marginTop: 12 }]}>
                    {contentByLang(lang, 'पक्ष', 'PAKSHA')}
                  </Text>
                  <View style={styles.chipWrap}>
                    {(['shukla', 'krishna'] as const).map((p) => {
                      const selected = paksha === p;
                      const labelHi = PAKSHA_NAMES_HI[p];
                      return (
                        <Pressable
                          key={p}
                          onPress={() => setPaksha(p)}
                          accessibilityRole="button"
                          accessibilityState={{ selected }}
                          accessibilityLabel={`Paksha ${PAKSHA_NAMES_EN[p]}`}
                          style={({ pressed }) => [...chip(selected), pressed && { opacity: 0.7 }]}
                        >
                          <Text style={chipText(selected)}>
                            {lang === 'en' ? PAKSHA_NAMES_EN[p] : localizedHi(labelHi, lang)}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>

                  <Text style={[styles.fieldLabel, { color: colors.inkMuted, marginTop: 12 }]}>
                    {contentByLang(lang, 'तिथि', 'TITHI')}
                  </Text>
                  <View style={styles.chipWrap}>
                    {Array.from({ length: 15 }, (_, i) => i + 1).map((t) => {
                      const selected = tithi === t;
                      const nameForChip = tithiName({ paksha, tithi: t }, lang === 'en' ? 'en' : 'hi');
                      return (
                        <Pressable
                          key={t}
                          onPress={() => setTithi(t)}
                          accessibilityRole="button"
                          accessibilityState={{ selected }}
                          accessibilityLabel={`Tithi ${tithiName({ paksha, tithi: t }, 'en')}`}
                          style={({ pressed }) => [...chip(selected), pressed && { opacity: 0.7 }]}
                        >
                          <Text style={chipText(selected)}>
                            {lang === 'en' ? nameForChip : localizedHi(nameForChip, lang)}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </>
              )}
            </>
          ) : (
            <>
              <Text style={[styles.fieldLabel, { color: colors.inkMuted }]}>
                {contentByLang(lang, 'देहावसान तिथि (अंग्रेज़ी)', 'DATE OF PASSING (GREGORIAN)')}
              </Text>
              <TextField
                variant="form"
                value={dateText}
                onChangeText={setDateText}
                placeholder={contentByLang(lang, 'दिन/माह/वर्ष — 03/02/1998', 'DD/MM/YYYY — 03/02/1998')}
                keyboardType="numbers-and-punctuation"
                accessibilityLabel="Date of passing"
              />

              {derived && parsedDate && derived.forMs === parsedDate.getTime() ? (
                <View style={[styles.confirmCard, { borderColor: colors.gold, backgroundColor: colors.parchmentHighlight, borderRadius: radii.md }]}>
                  <Text style={[styles.fieldLabel, { color: colors.inkMuted, marginBottom: 0 }]}>
                    {contentByLang(lang, 'पंचांग से निकली तिथि — पुष्टि करें', 'TITHI FROM THE PANCHANG — CONFIRM')}
                  </Text>
                  <Text style={{ fontFamily: labelFont, fontSize: 16, color: colors.ink, marginTop: 4 }}>
                    {lang === 'en'
                      ? tithiRuleLabel(derived.rule, 'en')
                      : localizedHi(tithiRuleLabel(derived.rule, 'hi'), lang)}
                  </Text>
                  <Text style={{ fontFamily: fontFamilies.latinItalic, fontSize: 12, lineHeight: 18, color: colors.inkMuted, marginTop: 3 }}>
                    {contentByLang(
                      lang,
                      `सूर्योदय-तिथि, ${dateText.trim()} — यही तिथि प्रत्येक वर्ष दोहराई जाएगी`,
                      `sunrise-tithi of ${dateText.trim()} · this is what repeats every year`
                    )}
                  </Text>
                </View>
              ) : parsedDate ? (
                <Text style={{ fontFamily: bodyFont, fontSize: 12, color: colors.inkMuted, marginTop: 8 }}>
                  {contentByLang(lang, 'तिथि निकाली जा रही है…', 'Deriving the tithi…')}
                </Text>
              ) : dateText.trim().length > 0 ? (
                <Text style={{ fontFamily: bodyFont, fontSize: 12, color: colors.inkMuted, marginTop: 8 }}>
                  {contentByLang(lang, 'पूरी तारीख़ लिखें — दिन/माह/वर्ष', 'Enter a full date — DD/MM/YYYY')}
                </Text>
              ) : null}
            </>
          )}

          {/* Save */}
          <Pressable
            onPress={save}
            disabled={!canSave}
            accessibilityRole="button"
            accessibilityState={{ disabled: !canSave }}
            accessibilityLabel="Save smaran"
            style={({ pressed }) => [
              styles.saveBtn,
              { backgroundColor: colors.saffron, borderRadius: radii.md },
              !canSave && { opacity: 0.4 },
              pressed && canSave && { opacity: 0.85 },
            ]}
          >
            <Text style={{ fontFamily: labelFont, fontSize: 15, color: colors.onPrimary }}>
              {contentByLang(lang, 'सहेजें', 'Save')}
            </Text>
          </Pressable>

          {mode === 'date' && (
            <Pressable
              onPress={chooseTithiMyself}
              accessibilityRole="button"
              accessibilityLabel="Choose the tithi myself"
              style={({ pressed }) => [
                styles.ghostBtn,
                { borderColor: colors.goldTint, borderRadius: radii.md },
                pressed && { opacity: 0.7 },
              ]}
            >
              <Text style={{ fontFamily: labelFont, fontSize: 14, color: colors.saffron }}>
                {contentByLang(lang, 'तिथि स्वयं चुनें', 'Choose the tithi myself')}
              </Text>
            </Pressable>
          )}

          <Text style={{ fontFamily: fontFamilies.latinItalic, fontSize: 12, lineHeight: 19, color: colors.inkMuted, textAlign: 'center', marginTop: 12 }}>
            {contentByLang(
              lang,
              'तिथि अज्ञात हो तो प्रविष्टि सर्वपितृ अमावस्या पर सहेजी जा सकती है',
              'If the tithi is unknown, the entry can be saved on Sarvapitri Amavasya'
            )}
          </Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  scroll: { paddingTop: 4, paddingBottom: 40 },
  fieldLabel: {
    fontFamily: fontFamilies.interSemiBold,
    fontSize: 11,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderWidth: 1, paddingHorizontal: 12, minHeight: 34, justifyContent: 'center' },
  modeSeg: { flexDirection: 'row', borderWidth: 1, padding: 3, marginTop: 16, marginBottom: 14 },
  seg: { flex: 1, minHeight: 38, alignItems: 'center', justifyContent: 'center' },
  unknownRow: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, paddingHorizontal: 13, paddingVertical: 12, minHeight: 44 },
  confirmCard: { borderWidth: 1, paddingHorizontal: 14, paddingVertical: 13, marginTop: 12 },
  saveBtn: { minHeight: 48, alignItems: 'center', justifyContent: 'center', marginTop: 18 },
  ghostBtn: { minHeight: 44, alignItems: 'center', justifyContent: 'center', borderWidth: 1, marginTop: 8 },
});
