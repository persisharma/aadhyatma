import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { fontFamilies } from '@/theme/typography';
import type { Lang } from '@/data/gita/language';
import { contentByLang } from '@/utils/localize';
import { scriptBodyFont, scriptTitleFont } from '@/utils/langType';
import { formatEndInstant } from '@/panchang/muhuratFormat';
import {
  AGNI_VAAS_LABELS,
  DIRECTION_LABELS,
  chandraVaasFavourableDirections,
  dayVaas,
  vaasTiles,
} from '@/panchang/vaas';
import type { PanchangData } from '@/panchang/types';

/**
 * The day panel's four vaas cards (design.md §33), under Nitya Yoga · Karana — a
 * 2×2 grid of slim cards that replaced the old tall यात्रा (104px compass) + हवन
 * pair. Each card mirrors the anga-tile shape: a header row (label left, its chip
 * right when it has one), the value, and — only when it adds something the label
 * does not already say — one context line. No icons.
 *   • सूर्य — the Sun's rashi (solar month). Label + value only; the "सूर्य राशि"
 *     caption is dropped as pure duplication of the label.
 *   • चन्द्रमा — the Moon's rashi · चन्द्र वास direction, with the favourable travel
 *     directions as a gold chip in the header, and the "चन्द्र वास" caption line.
 *   • दिशा शूल — the vara's barred travel direction, with a "यात्रा टालें" chip and
 *     the weekday context line.
 *   • अग्नि वास — where Agni resides, with a "हवन वर्जित" chip when havan is barred
 *     and the change-time line.
 * Pure over the solved day (`panchang/vaas.ts`); no engine call on the scroll
 * path. Colour never carries meaning alone — every chip carries a word.
 */
export default function DayVaasCards({ p, lang }: { p: PanchangData; lang: Lang }) {
  const { colors, typography, radii, elevation } = useTheme();
  const v = dayVaas(p);
  const t = vaasTiles(v, p.moonRashi);

  const body = lang === 'en' ? fontFamilies.latinSemiBold : scriptBodyFont(lang, typography.meaning.fontFamily);
  const title = scriptTitleFont(lang, typography.readerTitle.fontFamily);
  const label = {
    fontSize: 12,
    color: colors.saffronDeep,
    fontFamily: lang === 'en' ? fontFamilies.latinSemiBold : scriptTitleFont(lang, typography.cardHindi.fontFamily),
    letterSpacing: lang === 'en' ? 1 : 0,
    textTransform: (lang === 'en' ? 'uppercase' : 'none') as 'uppercase' | 'none',
  };
  const card = [
    styles.card,
    { backgroundColor: colors.parchmentSoft, borderColor: colors.divider, borderRadius: radii.lg },
    elevation.card,
  ];

  const vara = contentByLang(lang, p.vara.nameHi, p.vara.nameEn);
  const havanFavourable = AGNI_VAAS_LABELS[v.agni.value].favourableForHavan;

  // चन्द्र वास — the Moon's direction, and the two travel directions it marks शुभ
  // (ahead or to the right). Rendered as listed; the दिशा शूल overlap is not
  // reconciled here (see chandraVaasFavourableDirections' TODO).
  const [fav1, fav2] = chandraVaasFavourableDirections(v.chandra.value);
  const chandraChip = contentByLang(
    lang,
    `${DIRECTION_LABELS[fav1].hi}, ${DIRECTION_LABELS[fav2].hi} शुभ`,
    `${DIRECTION_LABELS[fav1].en}, ${DIRECTION_LABELS[fav2].en} favoured`,
  );

  const agniLine =
    t.agni.element.endTime && t.agni.successor
      ? contentByLang(
          lang,
          `तक ${formatEndInstant(t.agni.element.endTime, p.date, lang)}, फिर ${t.agni.successor.nameHi}`,
          `till ${formatEndInstant(t.agni.element.endTime, p.date, lang)}, then ${t.agni.successor.nameEn}`,
        )
      : contentByLang(lang, 'आज पूरे दिन', 'all day today');

  // Header row: the label, and the card's chip (when it has one) pushed to the
  // right — the chip rides the header instead of a fourth row, so the card stays
  // as short as the anga tiles.
  const Head = ({ text, chip }: { text: string; chip?: { text: string; bg: string; fg: string } | null }) => (
    <View style={styles.head}>
      <Text style={[label, styles.labelFlex]} numberOfLines={1}>{text}</Text>
      {chip ? (
        <View style={[styles.chip, { backgroundColor: chip.bg }]}>
          <Text style={{ fontFamily: body, fontSize: 11.5, color: chip.fg }}>{chip.text}</Text>
        </View>
      ) : null}
    </View>
  );

  const Value = ({ children, color }: { children: React.ReactNode; color?: string }) => (
    <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8} style={{ fontFamily: title, fontSize: 19, color: color ?? colors.ink, marginTop: 4 }}>
      {children}
    </Text>
  );

  const Line_ = ({ children }: { children: React.ReactNode }) => (
    <Text style={{ fontFamily: body, fontSize: 13, color: colors.inkMuted, marginTop: 2 }}>{children}</Text>
  );

  return (
    <View style={styles.grid}>
      <View style={styles.row}>
        <View
          testID="vaas-surya-card"
          accessible
          accessibilityLabel={contentByLang(lang, `सूर्य राशि ${p.sunRashi.nameHi}`, `Sun sign ${p.sunRashi.nameEn}`)}
          style={card}
        >
          <Head text={contentByLang(lang, 'सूर्य', 'Sun')} />
          <Value>{contentByLang(lang, p.sunRashi.nameHi, p.sunRashi.nameEn)}</Value>
        </View>

        <View
          testID="vaas-chandra-card"
          accessible
          accessibilityLabel={contentByLang(
            lang,
            `चन्द्रमा ${p.moonRashi.nameHi} में, चन्द्र वास ${DIRECTION_LABELS[v.chandra.value].hi}; ${chandraChip}`,
            `Moon in ${p.moonRashi.nameEn}, Chandra vaas ${DIRECTION_LABELS[v.chandra.value].en}; ${chandraChip}`,
          )}
          style={card}
        >
          <Head text={contentByLang(lang, 'चन्द्रमा', 'Moon')} chip={{ text: chandraChip, bg: colors.goldChipBg, fg: colors.inkSoft }} />
          <Value>
            {contentByLang(
              lang,
              `${p.moonRashi.nameHi} · ${DIRECTION_LABELS[v.chandra.value].hi}`,
              `${p.moonRashi.nameEn} · ${DIRECTION_LABELS[v.chandra.value].en}`,
            )}
          </Value>
          <Line_>{contentByLang(lang, 'चन्द्र वास', 'Chandra vaas')}</Line_>
        </View>
      </View>

      <View style={styles.row}>
        <View
          testID="vaas-shool-card"
          accessible
          accessibilityLabel={contentByLang(
            lang,
            `दिशा शूल ${t.dishaShool.element.nameHi}; ${vara} को इस दिशा की यात्रा टालें`,
            `Disha shool ${t.dishaShool.element.nameEn}; avoid travelling this way on ${vara}`,
          )}
          style={card}
        >
          <Head text={contentByLang(lang, 'दिशा शूल', 'Disha Shool')} chip={{ text: contentByLang(lang, 'यात्रा टालें', 'avoid travel'), bg: colors.avoidChipBg, fg: colors.avoidDeep }} />
          <Value color={colors.avoidDeep}>{contentByLang(lang, t.dishaShool.element.nameHi, t.dishaShool.element.nameEn)}</Value>
          <Line_>{contentByLang(lang, `${vara} — इस दिशा की`, `${vara} — this way`)}</Line_>
        </View>

        <View
          testID="vaas-agni-card"
          accessible
          accessibilityLabel={contentByLang(
            lang,
            `अग्नि वास ${t.agni.element.nameHi}; ${havanFavourable ? 'हवन शुभ' : 'हवन वर्जित'}`,
            `Agni vaas ${t.agni.element.nameEn}; ${havanFavourable ? 'havan favoured' : 'avoid havan'}`,
          )}
          style={card}
        >
          <Head text={contentByLang(lang, 'अग्नि वास', 'Agni vaas')} chip={havanFavourable ? null : { text: contentByLang(lang, 'हवन वर्जित', 'avoid havan'), bg: colors.avoidChipBg, fg: colors.avoidDeep }} />
          <Value>{contentByLang(lang, t.agni.element.nameHi, t.agni.element.nameEn)}</Value>
          <Line_>{agniLine}</Line_>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { marginTop: 8, gap: 8 },
  row: { flexDirection: 'row', gap: 8, alignItems: 'stretch' },
  card: { flexGrow: 1, flexBasis: '47%', borderWidth: 1, paddingVertical: 10, paddingHorizontal: 14 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  labelFlex: { flexShrink: 1 },
  chip: { marginLeft: 'auto', flexShrink: 0, paddingVertical: 2, paddingHorizontal: 9, borderRadius: 999 },
});
