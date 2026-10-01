import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Path, Text as SvgText } from 'react-native-svg';
import { useTheme } from '@/theme/ThemeContext';
import { fontFamilies } from '@/theme/typography';
import type { Lang } from '@/data/gita/language';
import { contentByLang } from '@/utils/localize';
import { scriptBodyFont, scriptTitleFont } from '@/utils/langType';
import { formatEndInstant } from '@/panchang/muhuratFormat';
import { AGNI_VAAS_LABELS, dayVaas, vaasTiles, type Direction } from '@/panchang/vaas';
import type { DishaDirection } from '@/panchang/eventMuhurat';
import type { PanchangData } from '@/panchang/types';

/**
 * The day panel's two vaas cards (design.md §33), under Nitya Yoga · Karana:
 *   • यात्रा — a small compass marking चन्द्र वास (crescent) and दिशा शूल (✕),
 *     with चन्द्रमा's rashi beside them: the three readings a traveller asks
 *     together, so they share one card instead of three tiles.
 *   • हवन — अग्नि वास with its verdict pill, the instant it changes and what
 *     follows.
 * Pure over the solved day (`panchang/vaas.ts`); no engine call on the scroll
 * path. Colour never carries meaning alone: the shool mark is a ✕ and the
 * verdict is a word.
 */
const COMPASS = 104;
const C = COMPASS / 2;
const RIM = 38;

// Screen-map orientation: north up, east right.
const UNIT: Record<Direction, [number, number]> = {
  north: [0, -1],
  east: [1, 0],
  south: [0, 1],
  west: [-1, 0],
};
const LETTERS: Record<Direction, { hi: string; en: string }> = {
  north: { hi: 'उ', en: 'N' },
  east: { hi: 'पू', en: 'E' },
  south: { hi: 'द', en: 'S' },
  west: { hi: 'प', en: 'W' },
};

function at(dir: Direction, r: number): [number, number] {
  const [dx, dy] = UNIT[dir];
  return [C + dx * r, C + dy * r];
}

function Compass({ moon, shool, lang, colors }: { moon: Direction; shool: DishaDirection; lang: Lang; colors: any }) {
  const [mx, my] = at(moon, RIM);
  // दिशा शूल is always cardinal (DISHA_SHOOL_BY_VARA); when it shares the Moon's
  // direction its mark moves inward so neither hides the other.
  const shoolDir = shool as Direction;
  const [sx, sy] = at(shoolDir, shoolDir === moon ? 20 : RIM);
  return (
    <Svg width={COMPASS} height={COMPASS}>
      <Circle cx={C} cy={C} r={RIM} fill="none" stroke={colors.gold} strokeWidth={1.2} />
      <Line x1={C} y1={C - RIM} x2={C} y2={C + RIM} stroke={colors.divider} strokeWidth={1} />
      <Line x1={C - RIM} y1={C} x2={C + RIM} y2={C} stroke={colors.divider} strokeWidth={1} />
      <Circle cx={C} cy={C} r={3} fill={colors.gold} />
      {(Object.keys(LETTERS) as Direction[]).map((d) => {
        const [x, y] = at(d, 22);
        return (
          <SvgText key={d} x={x} y={y + 4} fontSize={10} textAnchor="middle" fill={colors.inkMuted} fontFamily={lang === 'en' ? fontFamilies.latinSemiBold : fontFamilies.devanagari}>
            {contentByLang(lang, LETTERS[d].hi, LETTERS[d].en)}
          </SvgText>
        );
      })}
      <Circle cx={mx} cy={my} r={10} fill={colors.goldChipBg} stroke={colors.gold} strokeWidth={1.2} />
      <Path d={`M${mx + 3} ${my - 5} a6 6 0 1 0 0 10 a4.6 4.6 0 1 1 0 -10z`} fill={colors.saffronDeep} />
      <Circle cx={sx} cy={sy} r={10} fill={colors.avoidTint} stroke={colors.avoid} strokeWidth={1.2} />
      <Line x1={sx - 5} y1={sy - 5} x2={sx + 5} y2={sy + 5} stroke={colors.avoid} strokeWidth={1.8} />
      <Line x1={sx + 5} y1={sy - 5} x2={sx - 5} y2={sy + 5} stroke={colors.avoid} strokeWidth={1.8} />
    </Svg>
  );
}

export default function DayVaasCards({ p, lang }: { p: PanchangData; lang: Lang }) {
  const { colors, typography, radii, elevation } = useTheme();
  const v = dayVaas(p);
  const t = vaasTiles(v, p.moonRashi);
  const L = (l: { nameHi: string; nameEn: string } | { hi: string; en: string }) =>
    'nameHi' in l ? contentByLang(lang, l.nameHi, l.nameEn) : contentByLang(lang, l.hi, l.en);
  const body = lang === 'en' ? fontFamilies.latinSemiBold : scriptBodyFont(lang, typography.meaning.fontFamily);
  const title = scriptTitleFont(lang, typography.readerTitle.fontFamily);
  const eyebrow = {
    fontSize: 10,
    color: colors.saffronDeep,
    fontFamily: lang === 'en' ? fontFamilies.latinSemiBold : scriptTitleFont(lang, typography.cardHindi.fontFamily),
    letterSpacing: lang === 'en' ? 1 : 0,
    textTransform: (lang === 'en' ? 'uppercase' : 'none') as 'uppercase' | 'none',
  };
  const card = [styles.card, { backgroundColor: colors.parchmentSoft, borderColor: colors.divider, borderRadius: radii.lg }, elevation.card];

  const moonUntil = t.chandrama.element.endTime;
  const moonNext = t.chandrama.successor;
  const dirNext = t.chandra.successor;
  const vara = contentByLang(lang, p.vara.nameHi, p.vara.nameEn);
  const favourable = AGNI_VAAS_LABELS[v.agni.value].favourableForHavan;

  const a11y = contentByLang(
    lang,
    `यात्रा: चन्द्रमा ${p.moonRashi.nameHi} में, चन्द्र वास ${t.chandra.element.nameHi}; दिशा शूल ${t.dishaShool.element.nameHi}`,
    `Travel: Moon in ${p.moonRashi.nameEn}, Chandra vaas ${t.chandra.element.nameEn}; Disha shool ${t.dishaShool.element.nameEn}`,
  );

  return (
    <>
      <View testID="vaas-yatra-card" accessible accessibilityLabel={a11y} style={[card, styles.yatra]}>
        <Compass moon={v.chandra.value} shool={v.dishaShool} lang={lang} colors={colors} />
        <View style={styles.yatraText}>
          <Text style={eyebrow}>{contentByLang(lang, 'आज यात्रा', 'Travel today')}</Text>
          <View>
            <Text style={{ fontFamily: title, fontSize: 16, color: colors.ink }}>
              {contentByLang(lang, `चन्द्रमा ${p.moonRashi.nameHi} में · ${t.chandra.element.nameHi}`, `Moon in ${p.moonRashi.nameEn} · ${t.chandra.element.nameEn}`)}
            </Text>
            <Text style={{ fontFamily: body, fontSize: 11, color: colors.inkSoft, marginTop: 2 }}>
              {moonUntil && moonNext && dirNext
                ? contentByLang(
                    lang,
                    `${formatEndInstant(moonUntil, p.date, lang)} से ${moonNext.nameHi} · ${dirNext.nameHi}`,
                    `from ${formatEndInstant(moonUntil, p.date, lang)} ${moonNext.nameEn} · ${dirNext.nameEn}`,
                  )
                : contentByLang(lang, 'चन्द्र वास — सम्मुख या दाहिने शुभ', 'Chandra vaas — ahead or to the right is favourable')}
            </Text>
          </View>
          <View>
            <Text style={{ fontFamily: title, fontSize: 16, color: colors.avoidDeep }}>
              {contentByLang(lang, `शूल ${t.dishaShool.element.nameHi}`, `Shool · ${t.dishaShool.element.nameEn}`)}
            </Text>
            <Text style={{ fontFamily: body, fontSize: 11, color: colors.inkSoft, marginTop: 2 }}>
              {contentByLang(lang, `${vara} — इस दिशा की यात्रा टालें`, `${vara} — avoid travelling this way`)}
            </Text>
          </View>
        </View>
      </View>

      <View testID="vaas-havan-card" style={[card, styles.havan]}>
        <View style={styles.havanHead}>
          <Text style={eyebrow}>{contentByLang(lang, 'अग्नि वास · हवन', 'Agni vaas · havan')}</Text>
          {t.agni.note && (
            <View style={[styles.pill, { backgroundColor: favourable ? colors.goldChipBg : colors.avoidChipBg }]}>
              <Text style={{ fontFamily: body, fontSize: 11, color: favourable ? colors.saffronDeep : colors.avoidDeep }}>{L(t.agni.note)}</Text>
            </View>
          )}
        </View>
        <Text style={{ fontFamily: title, fontSize: 18, color: colors.ink }}>
          {L(t.agni.element)}
          {t.agni.element.endTime && (
            <Text style={{ fontFamily: body, fontSize: 12, color: colors.inkSoft }}>
              {contentByLang(lang, ' · तक ', ' · till ')}
              {formatEndInstant(t.agni.element.endTime, p.date, lang)}
            </Text>
          )}
        </Text>
        {t.agni.successor && t.agni.nextNote && (
          <Text style={{ fontFamily: body, fontSize: 12, color: colors.inkMuted }}>
            {contentByLang(
              lang,
              `फिर ${t.agni.successor.nameHi} — ${t.agni.nextNote.hi}, शेष दिन`,
              `then ${t.agni.successor.nameEn} — ${t.agni.nextNote.en}, rest of day`,
            )}
          </Text>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, marginTop: 8, paddingVertical: 14, paddingHorizontal: 16 },
  yatra: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  yatraText: { flex: 1, gap: 10 },
  havan: { gap: 6 },
  havanHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pill: { paddingVertical: 3, paddingHorizontal: 10, borderRadius: 999 },
});
