import React, { useMemo, useState } from 'react';
import {
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

import ReaderHeader from '@/components/ReaderHeader';
import DeityIcon from '@/components/DeityIcon';
import { deities } from '@/data/deities';
import { temples, type TempleEntry } from '@/data/theerth/temples';
import { getObservanceCatalog } from '@/panchang/festivals';
import { useGitaLanguage } from '@/data/gita/language';
import { saveKulRecord, useKulRecord } from '@/panchang/kulParamparaStore';
import type { KulRecord, KuldevKind } from '@/panchang/kulParampara';
import type { Deity } from '@/data/texts';
import { useTheme } from '@/theme/ThemeContext';
import { fontFamilies } from '@/theme/typography';
import { contentByLang } from '@/utils/localize';
import { scriptBodyFont, scriptTitleFont } from '@/utils/langType';
import type { MoreStackParamList } from '@/navigation/types';
import type { ObservanceRule } from '@/panchang/types';

type Props = NativeStackScreenProps<MoreStackParamList, 'KulParamparaEdit'>;

const MAX_SEARCH_ROWS = 6;
/** Dense chrome caps its multiplier so accessibility text cannot clip (§12). */
const CHROME_FONT_CAP = 1.25;

/**
 * कुल परम्परा edit (PRD-29 §3.6) — every field CHOSEN, never inferred: the
 * deity comes from the shipped registry grid or the family's own words, the
 * temple from the Theerth registry with free text as a first-class fallback,
 * the observance from the shipped vrat catalog or free text. There is no
 * gotra→kuldevta mapping in the binary to consult — the absence is the guard.
 */
export default function KulParamparaEditScreen({ navigation }: Props) {
  const { colors, typography, spacing, radii } = useTheme();
  const { lang } = useGitaLanguage();
  const { record, hydrated } = useKulRecord();

  const bodyFont = scriptBodyFont(lang, typography.meaning.fontFamily);
  const titleFont = scriptTitleFont(lang, typography.readerTitle.fontFamily);

  const [kind, setKind] = useState<KuldevKind>(record.kuldev?.kind ?? 'kuldevi');
  const [deityId, setDeityId] = useState<Deity | undefined>(record.kuldev?.deityId);
  const [kuldevCustom, setKuldevCustom] = useState(record.kuldev?.customName ?? '');
  const [templeId, setTempleId] = useState<string | undefined>(record.temple?.templeId);
  const [templeQuery, setTempleQuery] = useState(record.temple?.customName ?? '');
  const [gotra, setGotra] = useState(record.gotra ?? '');
  const [vratRuleId, setVratRuleId] = useState<string | undefined>(record.kulVrat?.ruleId);
  const [vratQuery, setVratQuery] = useState(record.kulVrat?.customText ?? '');
  const [notes, setNotes] = useState(record.notes ?? '');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);
  // Re-seed once when a slow hydrate lands after mount (the common case is warm).
  const [seededFrom, setSeededFrom] = useState(record);
  if (hydrated && seededFrom !== record && !saving) {
    setSeededFrom(record);
    setKind(record.kuldev?.kind ?? 'kuldevi');
    setDeityId(record.kuldev?.deityId);
    setKuldevCustom(record.kuldev?.customName ?? '');
    setTempleId(record.temple?.templeId);
    setTempleQuery(record.temple?.customName ?? '');
    setGotra(record.gotra ?? '');
    setVratRuleId(record.kulVrat?.ruleId);
    setVratQuery(record.kulVrat?.customText ?? '');
    setNotes(record.notes ?? '');
  }

  const templeMatches = useMemo<TempleEntry[]>(() => {
    const q = templeQuery.trim().toLowerCase();
    if (!q || templeId) return [];
    return temples
      .filter(
        (t) =>
          t.nameEn.toLowerCase().includes(q)
          || t.nameHi.includes(templeQuery.trim())
          || t.cityEn.toLowerCase().includes(q)
          || t.cityHi.includes(templeQuery.trim())
      )
      .slice(0, MAX_SEARCH_ROWS);
  }, [templeQuery, templeId]);

  const vratCatalogRules = useMemo(() => getObservanceCatalog(), []);
  const vratMatches = useMemo<ObservanceRule[]>(() => {
    const q = vratQuery.trim().toLowerCase();
    if (!q || vratRuleId) return [];
    const seen = new Set<string>();
    return vratCatalogRules
      .filter((rule) => {
        if (seen.has(rule.id)) return false;
        seen.add(rule.id);
        return rule.nameEn.toLowerCase().includes(q) || rule.nameHi.includes(vratQuery.trim());
      })
      .slice(0, MAX_SEARCH_ROWS);
  }, [vratQuery, vratRuleId, vratCatalogRules]);

  const selectedTemple = templeId ? temples.find((t) => t.id === templeId) : undefined;
  const selectedVrat = vratRuleId ? vratCatalogRules.find((r) => r.id === vratRuleId) : undefined;

  const save = async () => {
    Keyboard.dismiss();
    setSaving(true);
    setSaveError(false);
    const draft: KulRecord = {
      kuldev:
        deityId || kuldevCustom.trim()
          ? { kind, ...(deityId ? { deityId } : { customName: kuldevCustom }) }
          : undefined,
      temple:
        templeId || templeQuery.trim()
          ? templeId
            ? { templeId }
            : { customName: templeQuery }
          : undefined,
      gotra: gotra.trim() || undefined,
      kulVrat:
        vratRuleId || vratQuery.trim()
          ? vratRuleId
            ? { ruleId: vratRuleId }
            : { customText: vratQuery }
          : undefined,
      notes: notes.trim() || undefined,
    };
    try {
      await saveKulRecord(draft);
      navigation.goBack();
    } catch {
      setSaveError(true); // a failed write stays visible and recoverable (RULEBOOK §14.4)
    } finally {
      setSaving(false);
    }
  };

  const sectionHead = (labelHi: string, labelEn: string) => (
    <Text style={[styles.sectionHead, { color: colors.inkMuted }]} maxFontSizeMultiplier={CHROME_FONT_CAP}>
      {contentByLang(lang, labelHi, labelEn)}
    </Text>
  );

  const inputStyle = {
    borderWidth: 1,
    borderColor: colors.divider,
    borderRadius: radii.md,
    backgroundColor: colors.parchmentHighlight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontFamily: typography.meaning.fontFamily,
    fontSize: 15,
    color: colors.ink,
  } as const;

  const searchRow = (label: string, sub: string, a11y: string, onPress: () => void) => (
    <Pressable
      key={a11y}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={a11y}
      style={({ pressed }) => [
        styles.searchRow,
        { backgroundColor: colors.parchmentSoft, borderColor: colors.divider, borderRadius: radii.md },
        pressed && { opacity: 0.7 },
      ]}
    >
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: bodyFont, fontSize: 14, color: colors.ink }} numberOfLines={1}>
          {label}
        </Text>
        {sub ? (
          <Text style={{ fontFamily: bodyFont, fontSize: 12, color: colors.inkMuted, marginTop: 1 }} numberOfLines={1}>
            {sub}
          </Text>
        ) : null}
      </View>
      <Text style={{ fontSize: 15, color: colors.saffron }}>›</Text>
    </Pressable>
  );

  const selectedChip = (label: string, clearA11y: string, onClear: () => void) => (
    <View style={[styles.selectedChip, { backgroundColor: colors.goldTint, borderColor: colors.gold, borderRadius: radii.pill }]}>
      <Text style={{ fontFamily: bodyFont, fontSize: 13, color: colors.saffronDeep, flexShrink: 1 }} numberOfLines={1}>
        {label}
      </Text>
      <Pressable
        onPress={onClear}
        accessibilityRole="button"
        accessibilityLabel={clearA11y}
        hitSlop={10}
        style={({ pressed }) => [styles.clearBtn, pressed && { opacity: 0.6 }]}
      >
        <Text style={{ fontSize: 14, color: colors.saffronDeep }}>✕</Text>
      </Pressable>
    </View>
  );

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[colors.parchmentHighlight, colors.parchmentGradientEnd]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <ReaderHeader
          variant="index"
          title={contentByLang(lang, 'कुल परम्परा — सम्पादन', 'Kul Parampara — Edit')}
          onBack={() => navigation.goBack()}
        />
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingHorizontal: spacing.xxl }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {sectionHead('कुलदेवता / कुलदेवी', 'KULDEVTA / KULDEVI')}
          <Text style={{ fontFamily: fontFamilies.latinItalic, fontSize: 12, lineHeight: 18, color: colors.inkMuted, marginBottom: 10 }}>
            {contentByLang(
              lang,
              'जो आपके परिवार में कहा जाता है, वही चुनें। ऐप अनुमान नहीं लगाता।',
              'Choose what your family has always said. The app never guesses.'
            )}
          </Text>
          <View style={styles.kindRow}>
            {(['kuldevi', 'kuldevta'] as const).map((option) => {
              const selected = kind === option;
              const label = option === 'kuldevi'
                ? contentByLang(lang, 'कुलदेवी', 'Kuldevi')
                : contentByLang(lang, 'कुलदेवता', 'Kuldevta');
              return (
                <Pressable
                  key={option}
                  onPress={() => setKind(option)}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  accessibilityLabel={option === 'kuldevi' ? 'Kuldevi' : 'Kuldevta'}
                  style={({ pressed }) => [
                    styles.kindPill,
                    {
                      borderColor: selected ? colors.saffronDeep : colors.divider,
                      backgroundColor: selected ? colors.saffronTint : colors.parchmentSoft,
                      borderRadius: radii.pill,
                    },
                    pressed && { opacity: 0.7 },
                  ]}
                >
                  <Text
                    maxFontSizeMultiplier={CHROME_FONT_CAP}
                    style={{ fontFamily: bodyFont, fontSize: 13.5, color: selected ? colors.saffronDeep : colors.inkSoft }}
                  >
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.deityGrid}>
            {deities.map((deity) => {
              const selected = deityId === deity.id;
              return (
                <Pressable
                  key={deity.id}
                  onPress={() => {
                    setDeityId(selected ? undefined : deity.id);
                    if (!selected) setKuldevCustom('');
                  }}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  accessibilityLabel={`Choose ${deity.nameEn}`}
                  style={({ pressed }) => [
                    styles.deityCell,
                    {
                      borderColor: selected ? colors.saffronDeep : colors.goldTint,
                      backgroundColor: selected ? colors.saffronTint : colors.parchmentHighlight,
                      borderRadius: radii.md,
                    },
                    pressed && { opacity: 0.7 },
                  ]}
                >
                  <DeityIcon iconKey={deity.iconKey} fallbackText={deity.nameHi.slice(0, 2)} size={34} />
                  <Text
                    numberOfLines={1}
                    maxFontSizeMultiplier={CHROME_FONT_CAP}
                    style={{ fontFamily: bodyFont, fontSize: 10.5, color: selected ? colors.saffronDeep : colors.inkSoft, marginTop: 3 }}
                  >
                    {contentByLang(lang, deity.nameHi, deity.nameEn)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <TextInput
            value={kuldevCustom}
            onChangeText={(text) => {
              setKuldevCustom(text);
              if (text.trim()) setDeityId(undefined);
            }}
            placeholder={contentByLang(lang, 'सूची में नहीं हैं — नाम स्वयं लिखें', 'Not in the list — write the name yourself')}
            placeholderTextColor={colors.inkMuted}
            accessibilityLabel="Kuldev name, free text"
            style={inputStyle}
          />

          {sectionHead('कुल मन्दिर', 'FAMILY TEMPLE')}
          {selectedTemple ? (
            selectedChip(
              contentByLang(lang, `${selectedTemple.nameHi} · ${selectedTemple.cityHi}`, `${selectedTemple.nameEn} · ${selectedTemple.cityEn}`),
              'Clear selected temple',
              () => setTempleId(undefined)
            )
          ) : (
            <>
              <TextInput
                value={templeQuery}
                onChangeText={setTempleQuery}
                placeholder={contentByLang(lang, 'तीर्थ सूची में खोजें, या नाम स्वयं लिखें', 'Search the Theerth registry, or write the name')}
                placeholderTextColor={colors.inkMuted}
                accessibilityLabel="Family temple, search or free text"
                style={inputStyle}
              />
              {templeMatches.map((temple) =>
                searchRow(
                  contentByLang(lang, temple.nameHi, temple.nameEn),
                  contentByLang(lang, `${temple.cityHi} · ${temple.stateHi}`, `${temple.cityEn} · ${temple.stateEn}`),
                  `Link temple ${temple.nameEn}`,
                  () => {
                    setTempleId(temple.id);
                    setTempleQuery('');
                    Keyboard.dismiss();
                  }
                )
              )}
              {templeQuery.trim().length > 0 && (
                <Text style={{ fontFamily: fontFamilies.latinItalic, fontSize: 11.5, color: colors.inkMuted, marginTop: 4 }}>
                  {contentByLang(
                    lang,
                    'सूची में न मिले तो लिखा हुआ नाम ही सहेजा जाएगा।',
                    'If it is not in the registry, the typed name is saved as-is.'
                  )}
                </Text>
              )}
            </>
          )}

          {sectionHead('गोत्र', 'GOTRA')}
          <TextInput
            value={gotra}
            onChangeText={setGotra}
            placeholder={contentByLang(lang, 'जैसे — भारद्वाज (वैकल्पिक)', 'e.g. Bharadwaj (optional)')}
            placeholderTextColor={colors.inkMuted}
            accessibilityLabel="Gotra, free text"
            style={inputStyle}
          />

          {sectionHead('कुल व्रत', 'FAMILY OBSERVANCE')}
          {selectedVrat ? (
            selectedChip(
              contentByLang(lang, selectedVrat.nameHi, selectedVrat.nameEn),
              'Clear selected observance',
              () => setVratRuleId(undefined)
            )
          ) : (
            <>
              <TextInput
                value={vratQuery}
                onChangeText={setVratQuery}
                placeholder={contentByLang(lang, 'व्रत-पर्व सूची में खोजें, या स्वयं लिखें', 'Search the vrat catalog, or write it yourself')}
                placeholderTextColor={colors.inkMuted}
                accessibilityLabel="Family observance, search or free text"
                style={inputStyle}
              />
              {vratMatches.map((rule) =>
                searchRow(
                  contentByLang(lang, rule.nameHi, rule.nameEn),
                  '',
                  `Link observance ${rule.nameEn}`,
                  () => {
                    setVratRuleId(rule.id);
                    setVratQuery('');
                    Keyboard.dismiss();
                  }
                )
              )}
              {vratQuery.trim().length > 0 && (
                <Text style={{ fontFamily: fontFamilies.latinItalic, fontSize: 11.5, color: colors.inkMuted, marginTop: 4 }}>
                  {contentByLang(
                    lang,
                    'नियम से जुड़ने पर हर वर्ष की तिथि स्वयं निकलेगी; लिखा हुआ पाठ बिना तिथि के सहेजा जाएगा।',
                    'Linked to a rule it dates itself every year; free text is saved un-dated.'
                  )}
                </Text>
              )}
            </>
          )}

          {sectionHead('परिवार की बात', 'IN THE FAMILY’S WORDS')}
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder={contentByLang(
              lang,
              'जो केवल परिवार जानता है — मन्नत, रीति, कोई बात…',
              'What only the family knows — a vow, a custom, a story…'
            )}
            placeholderTextColor={colors.inkMuted}
            multiline
            accessibilityLabel="Family notes, free text"
            style={[inputStyle, styles.notesInput]}
          />

          {saveError && (
            <Text style={{ fontFamily: bodyFont, fontSize: 13, color: colors.saffronDeep, marginTop: 10, textAlign: 'center' }}>
              {contentByLang(lang, 'सहेजा नहीं जा सका — फिर प्रयास करें।', 'Could not save — try again.')}
            </Text>
          )}

          <Pressable
            onPress={save}
            disabled={saving || !hydrated}
            testID="kul-parampara-save"
            accessibilityRole="button"
            accessibilityLabel="Save kul parampara record"
            style={({ pressed }) => [
              styles.primaryBtn,
              { backgroundColor: colors.saffron, borderRadius: radii.md },
              (pressed || saving || !hydrated) && { opacity: 0.75 },
            ]}
          >
            <Text style={{ fontFamily: titleFont, fontSize: 14, color: colors.onPrimary }}>
              {contentByLang(lang, saving ? 'सहेजा जा रहा है…' : 'सहेजें', saving ? 'Saving…' : 'Save')}
            </Text>
          </Pressable>

          <Text style={[styles.lock, { borderLeftColor: colors.goldTint, color: colors.inkMuted }]}>
            {contentByLang(
              lang,
              'गोत्र से कुलदेवता का अनुमान कभी नहीं लगाया जाता — न जाति, न समुदाय का कोई वर्गीकरण।',
              'The kuldev is never guessed from the gotra — no caste or community classification exists here.'
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
  sectionHead: { fontFamily: fontFamilies.interSemiBold, fontSize: 11, letterSpacing: 0.7, marginTop: 18, marginBottom: 8 },
  kindRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  kindPill: { borderWidth: 1, minHeight: 44, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center' },
  deityGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  deityCell: { width: 72, minHeight: 64, borderWidth: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 6, paddingHorizontal: 2 },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 8,
    minHeight: 44,
  },
  selectedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    alignSelf: 'flex-start',
    paddingLeft: 14,
    paddingRight: 8,
    minHeight: 40,
    maxWidth: '100%',
  },
  clearBtn: { minWidth: 32, minHeight: 32, alignItems: 'center', justifyContent: 'center' },
  notesInput: { minHeight: 96, textAlignVertical: 'top' },
  primaryBtn: { minHeight: 50, alignItems: 'center', justifyContent: 'center', marginTop: 18 },
  lock: { fontFamily: fontFamilies.latinItalic, fontSize: 11.5, lineHeight: 18, borderLeftWidth: 2, paddingLeft: 10, marginTop: 14 },
});
