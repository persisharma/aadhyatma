/**
 * नवग्रह परिचय — "Know the nine grahas" (design.md §79).
 *
 * The GENERIC reference surface: what each graha is, for anyone, independent of
 * a chart. Open to everyone (no birth data needed). Reached from the launcher
 * card in the Jyotish hub, and from the "Know this graha" link on a personal
 * graha card (which deep-links with `focusGraha`). Nature and signifies lines
 * are authored (`grahaReference.ts`); meaning, maitri and weekday are reused
 * from the already-reviewed reading tables.
 */
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { maitriNames } from '@/panchang/grahaReading';
import { GRAHA_PLAIN, GRAHA_UPAY, MAITRI_LABELS } from '@/panchang/grahaReadingContent';
import { GRAHA_REFERENCE } from '@/panchang/grahaReference';
import { GRAHA_NAMES_EN, GRAHA_NAMES_HI, GRAHA_ORDER } from '@/panchang/kundali';
import type { Graha } from '@/panchang/kundali';
import { useGitaLanguage } from '@/data/gita/language';
import type { PanchangStackParamList } from '@/navigation/types';
import { useTheme } from '@/theme/ThemeContext';
import { contentByLang, meaningByLang } from '@/utils/localize';
import { pillTextStyle, scriptBodyFont, scriptTitleFont } from '@/utils/langType';

type Props = NativeStackScreenProps<PanchangStackParamList, 'GrahaReference'>;

export default function GrahaReferenceScreen({ navigation, route }: Props) {
  const { colors, typography, radii } = useTheme();
  const { lang } = useGitaLanguage();
  const focusGraha = route.params?.focusGraha;
  const [open, setOpen] = useState<ReadonlySet<Graha>>(() => (focusGraha ? new Set([focusGraha]) : new Set()));

  const toggle = (graha: Graha) =>
    setOpen((current) => {
      const next = new Set(current);
      if (next.has(graha)) next.delete(graha);
      else next.add(graha);
      return next;
    });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={10}
          style={styles.back}
        >
          <Text style={{ color: colors.inkSoft, fontSize: 22 }}>‹</Text>
        </Pressable>
        <Text
          style={{
            flex: 1,
            color: colors.ink,
            fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily),
            fontSize: 20,
          }}
        >
          {contentByLang(lang, 'नवग्रह — परिचय', 'Know the nine grahas')}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text
          style={{
            color: colors.inkMuted,
            fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily),
            fontSize: 12.5,
            lineHeight: 20,
            marginBottom: 6,
          }}
        >
          {meaningByLang(
            lang,
            'नौ ग्रह और वे किसके कारक हैं — सामान्य परिचय, किसी कुंडली से स्वतंत्र। किसी ग्रह को छूकर उसका विवरण खोलें।',
            'The nine grahas and what each one governs — a general introduction, independent of any chart. Tap a graha to open its detail.',
          )}
        </Text>

        {GRAHA_ORDER.map((graha) => {
          const expanded = open.has(graha);
          const ref = GRAHA_REFERENCE[graha];
          const plain = GRAHA_PLAIN[graha];
          const maitri = maitriNames(graha);
          const upay = GRAHA_UPAY[graha];
          return (
            <View
              key={graha}
              style={[styles.card, { borderColor: colors.divider, backgroundColor: colors.parchmentSoft, borderRadius: radii.md }]}
            >
              <Pressable
                testID={`graha-ref-row-${graha}`}
                onPress={() => toggle(graha)}
                accessibilityRole="button"
                accessibilityLabel={`${GRAHA_NAMES_EN[graha]} — ${ref.signifiesEn}`}
                accessibilityState={{ expanded }}
                style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}
              >
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      color: colors.ink,
                      fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily),
                      fontSize: 16,
                    }}
                  >
                    {contentByLang(lang, GRAHA_NAMES_HI[graha], GRAHA_NAMES_EN[graha])}
                  </Text>
                  <Text
                    style={{
                      color: colors.inkMuted,
                      fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily),
                      fontSize: 11.5,
                      lineHeight: 17,
                      marginTop: 2,
                    }}
                  >
                    {contentByLang(lang, ref.signifiesHi, ref.signifiesEn)}
                  </Text>
                </View>
                <Text style={{ color: colors.saffron, fontSize: 14 }}>{expanded ? '▴' : '▾'}</Text>
              </Pressable>

              {expanded && (
                <View testID={`graha-ref-detail-${graha}`} style={styles.detail}>
                  <Text
                    style={{
                      color: colors.ink,
                      fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily),
                      fontSize: 14,
                      lineHeight: 23,
                    }}
                  >
                    {contentByLang(lang, ref.natureHi, ref.natureEn)}
                  </Text>

                  <Detail lang={lang} labelHi="अर्थ" labelEn="Meaning" hi={plain.meaningHi} en={plain.meaningEn} />
                  <Detail lang={lang} labelHi="किसका कारक" labelEn="Governs" hi={ref.signifiesHi} en={ref.signifiesEn} />
                  {maitri && (
                    <Detail
                      lang={lang}
                      labelHi={MAITRI_LABELS.friends.hi + ' / ' + MAITRI_LABELS.enemies.hi}
                      labelEn={MAITRI_LABELS.friends.en + ' / ' + MAITRI_LABELS.enemies.en}
                      hi={`${maitri.friendsHi} · ${maitri.enemiesHi}`}
                      en={`${maitri.friendsEn} · ${maitri.enemiesEn}`}
                    />
                  )}
                  <Detail lang={lang} labelHi="वार" labelEn="Day" hi={upay.vaarHi} en={upay.vaarEn} />
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

function Detail({ lang, labelHi, labelEn, hi, en }: { lang: ReturnType<typeof useGitaLanguage>['lang']; labelHi: string; labelEn: string; hi: string; en: string }) {
  const { colors, typography } = useTheme();
  return (
    <View style={styles.detailRow}>
      <Text
        style={[
          pillTextStyle(lang, typography.sectionLabel),
          { width: 96, color: colors.saffronDeep, fontSize: lang === 'en' ? 10 : 12 },
        ]}
      >
        {contentByLang(lang, labelHi, labelEn)}
      </Text>
      <Text
        style={{
          flex: 1,
          color: colors.inkSoft,
          fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily),
          fontSize: 12.5,
          lineHeight: 19,
        }}
      >
        {meaningByLang(lang, hi, en)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 10 },
  back: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  scroll: { paddingHorizontal: 16, paddingBottom: 48, gap: 10 },
  card: { borderWidth: 1, paddingHorizontal: 13, paddingVertical: 4 },
  row: { minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: 8 },
  detail: { paddingBottom: 12, paddingTop: 2, gap: 2 },
  detailRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
});
