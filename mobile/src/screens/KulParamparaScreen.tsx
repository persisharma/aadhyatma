import React, { useEffect, useState } from 'react';
import { ActivityIndicator, InteractionManager, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation, type NavigationProp } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

import ReaderHeader from '@/components/ReaderHeader';
import DeityIcon from '@/components/DeityIcon';
import { deityIconKey } from '@/data/deities';
import { getTempleById } from '@/data/theerth/temples';
import { useGitaLanguage } from '@/data/gita/language';
import { isEmptyKulRecord, kuldevDisplayName } from '@/panchang/kulParampara';
import { kulVratRuleById, nextKulVratOccurrence, useKulRecord } from '@/panchang/kulParamparaStore';
import { shortDateWithYear, startOfLocalDay } from '@/panchang/pitruSmaranDisplay';
import { useTheme } from '@/theme/ThemeContext';
import { fontFamilies } from '@/theme/typography';
import { contentByLang } from '@/utils/localize';
import { transliterateDevanagari } from '@/utils/transliterate';
import { scriptBodyFont, scriptTitleFont } from '@/utils/langType';
import { panchangTabTarget } from '@/navigation/entryRoutes';
import type { MoreStackParamList, TabParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<MoreStackParamList, 'KulParampara'>;

/**
 * कुल परम्परा record (PRD-29 §3.6) — the one private family record: kuldev,
 * family temple, gotra, the family's kept observance (dating itself off a real
 * vrat rule), and the family's own words. All chosen, never inferred; nothing
 * leaves the device except through the explicit export door (§3.7).
 */
export default function KulParamparaScreen({ navigation }: Props) {
  const { colors, typography, spacing, radii } = useTheme();
  const { lang } = useGitaLanguage();
  const rootNav = useNavigation<NavigationProp<TabParamList>>();
  const { record, hydrated } = useKulRecord();

  const bodyFont = scriptBodyFont(lang, typography.meaning.fontFamily);
  const titleFont = scriptTitleFont(lang, typography.readerTitle.fontFamily);

  const empty = hydrated && isEmptyKulRecord(record);
  // gu/kn re-script the Devanagari at runtime ([[languages]]); en callers pass their own string.
  const devanagariOr = (hi: string): string => (lang === 'gu' || lang === 'kn' ? transliterateDevanagari(hi, lang) : hi);

  // The linked kul vrat's next date — a precomputed-table read, but still off
  // the render path (the MoreScreen row's own deferral rule).
  const vratRule = record.kulVrat?.ruleId ? kulVratRuleById(record.kulVrat.ruleId) : null;
  const [vratNext, setVratNext] = useState<Date | null>(null);
  useEffect(() => {
    if (!vratRule) {
      setVratNext(null);
      return undefined;
    }
    let cancelled = false;
    const task = InteractionManager.runAfterInteractions(() => {
      const next = nextKulVratOccurrence(vratRule.id, startOfLocalDay(new Date()));
      if (!cancelled) setVratNext(next);
    });
    return () => {
      cancelled = true;
      task.cancel();
    };
  }, [vratRule]);

  const temple = record.temple?.templeId ? getTempleById(record.temple.templeId) : undefined;

  const kuldevKindLabel = record.kuldev
    ? record.kuldev.kind === 'kuldevi'
      ? contentByLang(lang, 'कुलदेवी', 'Kuldevi')
      : contentByLang(lang, 'कुलदेवता', 'Kuldevta')
    : '';

  const field = (labelHi: string, labelEn: string, children: React.ReactNode, onPress?: () => void, a11y?: string) => {
    const inner = (
      <>
        <Text style={[styles.fieldLabel, { color: colors.inkMuted }]}>
          {contentByLang(lang, labelHi, labelEn)}
        </Text>
        {children}
      </>
    );
    if (!onPress) {
      return (
        <View style={[styles.field, { backgroundColor: colors.parchmentSoft, borderColor: colors.divider, borderRadius: radii.md }]}>
          <View style={styles.fieldMain}>{inner}</View>
        </View>
      );
    }
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={a11y ?? labelEn}
        style={({ pressed }) => [
          styles.field,
          { backgroundColor: colors.parchmentSoft, borderColor: colors.divider, borderRadius: radii.md },
          pressed && { opacity: 0.7 },
        ]}
      >
        <View style={styles.fieldMain}>{inner}</View>
        <Text style={{ fontSize: 17, color: colors.saffron }}>›</Text>
      </Pressable>
    );
  };

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[colors.parchmentHighlight, colors.parchmentGradientEnd]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <ReaderHeader
          variant="index"
          title={contentByLang(lang, 'कुल परम्परा', 'Kul Parampara')}
          onBack={() => navigation.goBack()}
          right={
            hydrated && !empty ? (
              <Pressable
                onPress={() => navigation.navigate('KulParamparaEdit')}
                accessibilityRole="button"
                accessibilityLabel="Edit kul parampara"
                hitSlop={12}
                style={({ pressed }) => pressed && { opacity: 0.6 }}
              >
                <Text style={{ fontFamily: fontFamilies.interSemiBold, fontSize: 12, color: colors.saffron }}>
                  {contentByLang(lang, 'सम्पादन', 'Edit')}
                </Text>
              </Pressable>
            ) : undefined
          }
          sideWidth={64}
        />

        {!hydrated ? (
          <View style={styles.centered}>
            <ActivityIndicator color={colors.saffron} />
          </View>
        ) : empty ? (
          <ScrollView contentContainerStyle={[styles.scroll, { paddingHorizontal: spacing.xxl }]} showsVerticalScrollIndicator={false}>
            <View style={styles.empty}>
              <Text style={{ fontSize: 30, color: colors.gold }}>॥</Text>
              <Text style={{ fontFamily: titleFont, fontSize: 15, color: colors.ink, textAlign: 'center', marginTop: 10 }}>
                {contentByLang(lang, 'जो एक पीढ़ी में खो जाता है', 'What a family loses in one generation')}
              </Text>
              <Text style={{ fontFamily: bodyFont, fontSize: 13, lineHeight: 21, color: colors.inkSoft, textAlign: 'center', marginTop: 6 }}>
                {contentByLang(
                  lang,
                  'कुलदेवता-कुलदेवी, कुल मन्दिर, गोत्र, कुल का व्रत — परिवार की स्मृति का अभिलेख। सब कुछ आप स्वयं लिखते हैं; ऐप कोई अनुमान नहीं लगाता।',
                  'Kuldevta or kuldevi, the family temple, the gotra, the observance the family keeps — a record of family memory. You enter everything yourself; the app infers nothing.'
                )}
              </Text>
              <Pressable
                onPress={() => navigation.navigate('KulParamparaEdit')}
                testID="kul-parampara-create"
                accessibilityRole="button"
                accessibilityLabel="Create kul parampara record"
                style={({ pressed }) => [
                  styles.primaryBtn,
                  { backgroundColor: colors.saffron, borderRadius: radii.md },
                  pressed && { opacity: 0.85 },
                ]}
              >
                <Text style={{ fontFamily: titleFont, fontSize: 14, color: colors.onPrimary }}>
                  {contentByLang(lang, 'अभिलेख बनाएँ', 'Create the record')}
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        ) : (
          <ScrollView contentContainerStyle={[styles.scroll, { paddingHorizontal: spacing.xxl }]} showsVerticalScrollIndicator={false}>
            {record.kuldev && (
              <View style={[styles.kuldevCard, { backgroundColor: colors.parchmentSoft, borderColor: colors.divider, borderRadius: radii.lg }]}>
                {record.kuldev.deityId ? (
                  <DeityIcon iconKey={deityIconKey(record.kuldev.deityId)} fallbackText={kuldevDisplayName(record.kuldev, 'hi').slice(0, 2)} size={54} />
                ) : (
                  <View style={[styles.customGlyph, { borderColor: colors.goldTint, backgroundColor: colors.parchmentHighlight }]}>
                    <Text style={{ fontFamily: typography.readerTitle.fontFamily, fontSize: 20, color: colors.saffronDeep }}>
                      {(record.kuldev.customName ?? '॥').slice(0, 2)}
                    </Text>
                  </View>
                )}
                <Text style={{ fontFamily: titleFont, fontSize: 17, color: colors.ink, marginTop: 9, textAlign: 'center' }}>
                  {kuldevKindLabel} · {lang === 'en' ? kuldevDisplayName(record.kuldev, 'en') : devanagariOr(kuldevDisplayName(record.kuldev, 'hi'))}
                </Text>
                <Text style={{ fontFamily: fontFamilies.latinItalic, fontSize: 11.5, color: colors.inkMuted, marginTop: 3 }}>
                  {contentByLang(lang, 'जैसा परिवार में कहा जाता है', 'As the family has always said it')}
                </Text>
              </View>
            )}

            {record.temple &&
              field(
                'कुल मन्दिर',
                'FAMILY TEMPLE',
                <>
                  <Text style={{ fontFamily: bodyFont, fontSize: 14, color: colors.ink, marginTop: 3 }}>
                    {temple
                      ? lang === 'en' ? temple.nameEn : devanagariOr(temple.nameHi)
                      : record.temple.customName}
                  </Text>
                  {temple && (
                    <Text style={[styles.chip, { color: colors.saffronDeep, backgroundColor: colors.goldTint, fontFamily: bodyFont }]}>
                      {contentByLang(lang, `तीर्थ सूची से · ${temple.cityHi}`, `From the Theerth registry · ${temple.cityEn}`)}
                    </Text>
                  )}
                </>,
                temple
                  ? () => rootNav.navigate('HomeTab', { screen: 'TheerthDetail', params: { templeId: temple.id } } as never)
                  : undefined,
                temple ? `Open ${temple.nameEn} in Theerth` : undefined
              )}

            {record.gotra &&
              field(
                'गोत्र',
                'GOTRA',
                <Text style={{ fontFamily: bodyFont, fontSize: 14, color: colors.ink, marginTop: 3 }}>
                  {record.gotra}
                </Text>
              )}

            {record.kulVrat &&
              field(
                'कुल व्रत',
                'FAMILY OBSERVANCE',
                <>
                  <Text style={{ fontFamily: bodyFont, fontSize: 14, color: colors.ink, marginTop: 3 }}>
                    {vratRule
                      ? contentByLang(lang, vratRule.nameHi, vratRule.nameEn)
                      : record.kulVrat.customText}
                  </Text>
                  {vratRule && (
                    <Text style={[styles.chip, { color: colors.saffronDeep, backgroundColor: colors.goldTint, fontFamily: bodyFont }]}>
                      {vratNext
                        ? contentByLang(lang, `अगली तिथि · ${shortDateWithYear(vratNext, 'hi')}`, `Next · ${shortDateWithYear(vratNext, 'en')}`)
                        : contentByLang(lang, 'पर्व नियम से जुड़ा — हर वर्ष तिथि निकलेगी', 'Linked to a vrat rule — dates itself every year')}
                    </Text>
                  )}
                </>,
                vratRule
                  ? () => rootNav.navigate('PanchangTab', panchangTabTarget('ObservanceDetail', { ruleId: vratRule.id }))
                  : undefined,
                vratRule ? `Open ${vratRule.nameEn} observance` : undefined
              )}

            {record.notes &&
              field(
                'परिवार की बात',
                'IN THE FAMILY’S WORDS',
                <Text style={{ fontFamily: bodyFont, fontSize: 13, lineHeight: 22, color: colors.ink, marginTop: 3 }}>
                  {record.notes}
                </Text>
              )}

            <Pressable
              onPress={() => navigation.navigate('KulParamparaExport')}
              testID="kul-parampara-export-door"
              accessibilityRole="button"
              accessibilityLabel="Hand the record on"
              style={({ pressed }) => [
                styles.exportBtn,
                { borderColor: colors.gold, backgroundColor: colors.parchmentHighlight, borderRadius: radii.md },
                pressed && { opacity: 0.8 },
              ]}
            >
              <Text style={{ fontFamily: titleFont, fontSize: 14, color: colors.saffronDeep }}>
                {contentByLang(lang, 'आगे सौंपें ›', 'Hand it on ›')}
              </Text>
            </Pressable>

            <Text style={[styles.lock, { borderLeftColor: colors.goldTint, color: colors.inkMuted }]}>
              {contentByLang(
                lang,
                'यह अभिलेख इसी उपकरण पर रहता है। कहीं भेजा नहीं जाता, किसी सूची में नहीं जुड़ता।',
                'This record lives on this device. It is sent nowhere and joins no list.'
              )}
            </Text>
          </ScrollView>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  scroll: { paddingTop: 4, paddingBottom: 40 },
  empty: { alignItems: 'center', paddingVertical: 28, paddingHorizontal: 12 },
  primaryBtn: { minHeight: 50, alignItems: 'center', justifyContent: 'center', marginTop: 18, alignSelf: 'stretch' },
  kuldevCard: { borderWidth: 1, alignItems: 'center', paddingVertical: 18, paddingHorizontal: 16, marginBottom: 12 },
  customGlyph: { width: 54, height: 54, borderRadius: 27, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
    minHeight: 44,
  },
  fieldMain: { flex: 1 },
  fieldLabel: { fontFamily: fontFamilies.interSemiBold, fontSize: 10.5, letterSpacing: 0.6 },
  chip: {
    alignSelf: 'flex-start',
    fontSize: 10.5,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 999,
    overflow: 'hidden',
    marginTop: 6,
  },
  exportBtn: { borderWidth: 1.5, minHeight: 50, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  lock: { fontFamily: fontFamilies.latinItalic, fontSize: 11.5, lineHeight: 18, borderLeftWidth: 2, paddingLeft: 10, marginTop: 14 },
});
