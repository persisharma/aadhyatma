/**
 * The personalised Tarabala/Chandrabala strip (PRD-16 Phase 4, prototype
 * phones c–d). Two variants:
 *  - `row`   — a quiet personal block under a result card's best window: the
 *              आपके लिए label on its own line, both pills together beneath it;
 *  - `card`  — the full-width आपके लिए strip on the day detail, with the
 *              one-line explainer naming the janma nakshatra it counted from.
 *
 * ANNOTATES, NEVER RE-GRADES: purely presentational — it receives a computed
 * `MuhuratBala` and renders words + tints (never colour alone, design.md §12).
 * It must never reach the share card or any notification (absence
 * test-pinned), and it renders nothing when no bala is supplied.
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage, type Lang } from '@/data/gita/language';
import { contentByLang } from '@/utils/localize';
import { scriptTitleFont } from '@/utils/langType';
import { transliterateDevanagari } from '@/utils/transliterate';
import { NAKSHATRA_NAMES_HI, NAKSHATRA_NAMES_EN } from '@/panchang/names';
import { RASHI_NAMES_HI, RASHI_NAMES_EN } from '@/panchang/kundali';
import {
  CHANDRASHTAMA_POSITION,
  TARA_NAMES_EN,
  TARA_NAMES_HI,
  type TaraClass,
} from '@/panchang/taraChandraBala';
import type { MuhuratBala } from '@/panchang/useMuhuratBala';

const CLASS_LABELS: Readonly<Record<TaraClass, { hi: string; en: string }>> = {
  favourable: { hi: 'अनुकूल', en: 'Favourable' },
  unfavourable: { hi: 'प्रतिकूल', en: 'Unfavourable' },
  // The जन्म tara's word is an open review question (§14.3); v1 says
  // "views differ" rather than picking a side.
  contested: { hi: 'मत भिन्न', en: 'Views differ' },
};

function taraLine(bala: MuhuratBala, lang: Lang): string {
  const name =
    lang === 'en'
      ? TARA_NAMES_EN[bala.tara.tara - 1]
      : lang === 'hi'
        ? TARA_NAMES_HI[bala.tara.tara - 1]
        : transliterateDevanagari(TARA_NAMES_HI[bala.tara.tara - 1], lang);
  return `${name} ${contentByLang(lang, 'तारा', 'tara')}`;
}

function chandraLine(bala: MuhuratBala, lang: Lang): string {
  if (bala.chandra.position === CHANDRASHTAMA_POSITION) {
    // The strongest warm-avoid word the strip can show — still moves nothing.
    return contentByLang(lang, 'चंद्राष्टम', 'Chandrashtama');
  }
  return contentByLang(lang, `चन्द्र ${bala.chandra.position}वाँ`, `Chandra ${bala.chandra.position}th`);
}

export default function MuhuratBalaStrip({
  bala,
  variant,
}: {
  bala: MuhuratBala | null | undefined;
  variant: 'row' | 'card';
}) {
  const { colors, typography, spacing, radii, elevation } = useTheme();
  const { lang } = useGitaLanguage();
  const titleFont = scriptTitleFont(lang, typography.cardHindi.fontFamily);
  if (!bala) return null;

  // A real View-wrapped pill: nested/standalone Text ignores borderRadius and
  // padding on iOS, which shipped as square, cramped highlights.
  const pill = (text: string, cls: TaraClass) => (
    <View
      style={{
        backgroundColor: cls === 'unfavourable' ? colors.avoidChipBg : colors.goldTint,
        borderRadius: 6,
        paddingHorizontal: variant === 'row' ? 7 : 9,
        paddingVertical: variant === 'row' ? 2 : 3,
      }}
    >
      <Text
        style={{
          fontFamily: titleFont,
          fontSize: variant === 'row' ? 11.5 : 13,
          lineHeight: variant === 'row' ? 16 : 19,
          color: cls === 'unfavourable' ? colors.avoidDeep : colors.saffronDeep,
        }}
      >
        {text} — {contentByLang(lang, CLASS_LABELS[cls].hi, CLASS_LABELS[cls].en)}
      </Text>
    </View>
  );

  const label = (
    <Text
      style={{
        fontFamily: typography.sectionLabel.fontFamily,
        fontSize: variant === 'row' ? 9 : 10,
        letterSpacing: lang === 'en' ? 1.2 : 0,
        textTransform: 'uppercase',
        color: colors.inkMuted,
      }}
    >
      {contentByLang(lang, 'आपके लिए', 'For you')}
    </Text>
  );

  if (variant === 'row') {
    // The label owns its own line so the two pills share the next one — a
    // wrapped pill (large font scales) lands under the FIRST PILL, never
    // flush under the label.
    return (
      <View testID="muhurat-bala-row" style={styles.row}>
        {label}
        <View style={styles.pillRow}>
          {pill(taraLine(bala, lang), bala.tara.cls)}
          {pill(chandraLine(bala, lang), bala.chandra.cls)}
        </View>
      </View>
    );
  }

  const janmaNak =
    lang === 'en'
      ? NAKSHATRA_NAMES_EN[bala.janmaNakshatraIndex]
      : lang === 'hi'
        ? NAKSHATRA_NAMES_HI[bala.janmaNakshatraIndex]
        : transliterateDevanagari(NAKSHATRA_NAMES_HI[bala.janmaNakshatraIndex], lang);
  const janmaRashi =
    lang === 'en'
      ? RASHI_NAMES_EN[bala.janmaRashiIndex]
      : lang === 'hi'
        ? RASHI_NAMES_HI[bala.janmaRashiIndex]
        : transliterateDevanagari(RASHI_NAMES_HI[bala.janmaRashiIndex], lang);

  return (
    <View
      testID="muhurat-bala-strip"
      style={[
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radii.md, marginTop: spacing.md },
        elevation.subtle,
      ]}
    >
      {label}
      <View style={styles.cardRow}>
        {pill(taraLine(bala, lang), bala.tara.cls)}
        {pill(chandraLine(bala, lang), bala.chandra.cls)}
      </View>
      <Text
        style={{
          fontFamily: typography.cardLatin.fontFamily,
          fontStyle: 'italic',
          fontSize: 11.5,
          color: colors.inkMuted,
          lineHeight: 18,
          marginTop: 4,
        }}
      >
        {contentByLang(
          lang,
          `जन्म नक्षत्र ${janmaNak} व राशि ${janmaRashi} से गिनकर · निजी — साझा कार्ड पर कभी नहीं। यह दिन की श्रेणी नहीं बदलता।`,
          `Counted from your janma nakshatra (${janmaNak}) and rashi (${janmaRashi}). Private — never on the share card. It never changes the day's tier.`
        )}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { marginTop: 5 },
  pillRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 5, marginTop: 3 },
  card: { borderWidth: 1, paddingHorizontal: 16, paddingVertical: 10 },
  cardRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6, marginTop: 5 },
});
