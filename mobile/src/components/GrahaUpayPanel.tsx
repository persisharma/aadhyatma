/**
 * One graha's upay — day, daan, seva, beej mantra, then its two practice pills
 * (RULEBOOK §14.3.5, design.md §78). The single treatment for a `GRAHA_UPAY`
 * row: the compiled report's graha cards and the Kundali Dasha tab both render
 * it, so the practice reads the same wherever it is prescribed.
 *
 * `scale` is the in-app reading size (`useFontScale().factor`) for surfaces
 * that honour it; the report leaves it at 1. `stacked` puts each label above
 * its value for compact widths and enlarged text.
 */
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Lang } from '@/data/gita/language';
import { GRAHA_BEEJ_JAPA_ID } from '@/data/japam/grahaBeej';
import { library } from '@/data/texts';
import type { Graha } from '@/panchang/kundali';
import type { KundaliGrahaUpay } from '@/panchang/kundaliReportModel';
import { useTheme } from '@/theme/ThemeContext';
import { fontFamilies } from '@/theme/typography';
import { contentByLang, meaningByLang } from '@/utils/localize';
import { pillTextStyle, scriptBodyFont } from '@/utils/langType';

type Props = {
  graha: Graha;
  upay: Omit<KundaliGrahaUpay, 'introHi' | 'introEn'>;
  lang: Lang;
  /** Opens a library entry by id — the beej mantra's counter or the paath. */
  onPractice: (sourceId: string) => void;
  /** The panel's own heading; omit it when the host card already names the upay. */
  labelHi?: string;
  labelEn?: string;
  /** False where the host already offers the beej-mantra counter beside the panel. */
  showJapa?: boolean;
  scale?: number;
  stacked?: boolean;
  testID?: string;
};

export default function GrahaUpayPanel({
  graha,
  upay,
  lang,
  onPractice,
  labelHi,
  labelEn,
  showJapa = true,
  scale = 1,
  stacked = false,
  testID,
}: Props) {
  const { colors, typography, radii } = useTheme();
  const labelSize = (lang === 'en' ? 10 : 12) * scale;
  const row = (rowLabelHi: string, rowLabelEn: string, hi: string, en: string) => (
    <View style={[styles.row, stacked && styles.rowStacked]}>
      <Text
        maxFontSizeMultiplier={1.25}
        style={[
          pillTextStyle(lang, typography.sectionLabel),
          styles.rowLabel,
          { color: colors.inkMuted, fontSize: labelSize },
          stacked ? styles.rowLabelStacked : { width: 64 * scale },
        ]}
      >
        {contentByLang(lang, rowLabelHi, rowLabelEn)}
      </Text>
      <Text
        style={[
          {
            color: colors.ink,
            fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily),
            fontSize: 12 * scale,
            lineHeight: 19 * scale,
          },
          !stacked && { flex: 1 },
        ]}
      >
        {meaningByLang(lang, hi, en)}
      </Text>
    </View>
  );

  return (
    <View
      testID={testID}
      style={[styles.panel, { borderColor: colors.divider, backgroundColor: colors.goldTint, borderRadius: radii.md }]}
    >
      {labelHi !== undefined && labelEn !== undefined && (
        <Text
          style={[
            pillTextStyle(lang, typography.sectionLabel),
            styles.label,
            { color: colors.saffronDeep, fontSize: labelSize },
          ]}
        >
          {contentByLang(lang, labelHi, labelEn)}
        </Text>
      )}
      {row('वार', 'Day', upay.vaarHi, upay.vaarEn)}
      {row('दान', 'Daan', upay.daanHi, upay.daanEn)}
      {row('सेवा', 'Seva', upay.sevaHi, upay.sevaEn)}
      {row('मंत्र', 'Mantra', `${upay.mantraHi} — ${upay.mantraCountHi}`, `${upay.mantraEn} — ${upay.mantraCountEn}`)}
      {showJapa && (
        <PracticeLink sourceId={GRAHA_BEEJ_JAPA_ID[graha]} lang={lang} onPractice={onPractice} scale={scale} japa />
      )}
      <PracticeLink sourceId={upay.practiceSourceId} lang={lang} onPractice={onPractice} scale={scale} />
    </View>
  );
}

/** The paath pill, or with `japa` the beej mantra's counter (`Chant … on the mala`). */
function PracticeLink({
  sourceId,
  lang,
  onPractice,
  scale,
  japa = false,
}: {
  sourceId: string;
  lang: Lang;
  onPractice: (sourceId: string) => void;
  scale: number;
  japa?: boolean;
}) {
  const { colors, radii } = useTheme();
  const entry = library.find((candidate) => candidate.id === sourceId && candidate.status === 'active');
  if (!entry) return null;
  return (
    <Pressable
      onPress={() => onPractice(entry.id)}
      hitSlop={{ top: 3, bottom: 3 }}
      accessibilityRole="button"
      accessibilityLabel={japa ? `Chant ${entry.nameEn} on the mala` : `Open ${entry.nameEn} practice`}
      style={({ pressed }) => [
        styles.practiceLink,
        { borderColor: colors.divider, backgroundColor: colors.cardSurface, borderRadius: radii.pill },
        pressed && { opacity: 0.7 },
      ]}
    >
      <Text style={[styles.practiceLinkText, { color: colors.saffronDeep, fontSize: 10 * scale }]}>
        {japa
          ? contentByLang(lang, `माला पर जप करें`, `Chant on the mala`)
          : contentByLang(lang, `${entry.nameHi} पढ़ें`, `Read ${entry.nameEn}`)} ›
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  panel: {
    marginTop: 12,
    padding: 10,
    borderWidth: 1,
  },
  label: { marginTop: 12, marginBottom: 2 },
  row: { flexDirection: 'row', gap: 8, marginTop: 6 },
  rowStacked: { flexDirection: 'column', gap: 2 },
  // 64 pt fits MANTRA at the section-label tracking (2.4) without breaking the word.
  rowLabel: { paddingTop: 2 },
  rowLabelStacked: { paddingTop: 0 },
  practiceLink: {
    minHeight: 38,
    maxWidth: '100%',
    marginTop: 10,
    paddingHorizontal: 13,
    paddingVertical: 6,
    borderWidth: 1,
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
  practiceLinkText: {
    fontFamily: fontFamilies.interSemiBold,
  },
});
