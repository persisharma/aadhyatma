import React from 'react';
import { Image, StyleSheet, Text, View, type StyleProp, type TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Path } from 'react-native-svg';
import { useTheme } from '@/theme/ThemeContext';
import { fontFamilies } from '@/theme/typography';
import type { Lang } from '@/data/gita/language';
import { SMART_LINK } from '@/data/shareLinks';
import { contentByLang } from '@/utils/localize';
import { scriptBodyFont, scriptTitleFont } from '@/utils/langType';
import { withMarkHeadroom } from '@/utils/markHeadroom';
import type { PanchangShareModel, ShareAnga, ShareChoghadiya, ShareVaas } from '@/panchang/panchangShareModel';

const brandMark = require('@assets/branding/brand-mark.png');

/** The card's layout box (dp). Captured at 2× → 1080×1350, the 4:5 feed/WhatsApp size. */
export const PANCHANG_SHARE_WIDTH = 540;
export const PANCHANG_SHARE_HEIGHT = 675;

const SKY_HEIGHT = 144;

/**
 * पूर्ण पंचांग share card (design.md §33a): one day, everything the day panel
 * shows, in one 4:5 image — a day-sky header (brand, city, date, sun and moon
 * times), today's पर्व, the angas with end times and what follows, all 16
 * चौघड़िया with start times, the four kaal windows, the four वास tiles, and a
 * dark footer with the app icon and the download link.
 *
 * Every line is a fixed size that was fit-tested against the longest strings
 * (long city, अधिक मास, a क्षय tithi, the longest nakshatra/yoga/karana, a long
 * festival); single-line values only shrink as a last resort. Indic lines set
 * tight leading, so each one takes the mark headroom (utils/markHeadroom.ts) or
 * iOS/Android would clip its matras.
 */
export default function PanchangShareCard({ model, lang, onIconLoad }: { model: PanchangShareModel; lang: Lang; onIconLoad?: () => void }) {
  const { colors } = useTheme();
  const en = lang === 'en';
  const t = (hi: string, enText: string) => contentByLang(lang, hi, enText);

  const titleFace = en ? fontFamilies.latinBold : scriptTitleFont(lang, fontFamilies.devanagariBold);
  const bodyFace = en ? fontFamilies.latinSemiBold : scriptBodyFont(lang, fontFamilies.devanagari);
  // Times use Noto Serif's lining digits in every language: Cormorant's are
  // old-style, so "11:40" read as "II:40" at phone size.
  const clockFace = fontFamilies.devanagariBold;

  const fit = (style: StyleProp<TextStyle>) => (en ? style : withMarkHeadroom(style));
  const label: TextStyle = en
    ? { fontFamily: fontFamilies.interSemiBold, fontSize: 12, lineHeight: 16, letterSpacing: 0.4, textTransform: 'uppercase', color: colors.saffronDeep }
    : { fontFamily: scriptTitleFont(lang, fontFamilies.devanagariBold), fontSize: 12, lineHeight: 16, color: colors.saffronDeep };
  const line: TextStyle = en
    ? { fontFamily: bodyFace, fontSize: 14, lineHeight: 17.5, color: colors.inkSoft }
    : { fontFamily: bodyFace, fontSize: 13, lineHeight: 17, color: colors.inkSoft };
  const value = (size: number): TextStyle =>
    en ? { fontFamily: titleFace, fontSize: size + 1, lineHeight: (size + 1) * 1.2, color: colors.ink } : { fontFamily: titleFace, fontSize: size, lineHeight: size * 1.3, color: colors.ink };
  const clock = (size: number): TextStyle => ({ fontFamily: clockFace, fontSize: size, lineHeight: size * 1.25, color: colors.ink });

  const One = ({ style, children }: { style: StyleProp<TextStyle>; children: React.ReactNode }) => (
    <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.85} style={fit(style)}>
      {children}
    </Text>
  );

  const Anga = ({ title, a, size }: { title: string; a: ShareAnga; size: number }) => (
    <View style={styles.angaCell}>
      <One style={label}>{title}</One>
      <One style={value(size)}>{a.name}</One>
      {a.lines.map((l, i) => (
        <One key={i} style={line}>{l}</One>
      ))}
    </View>
  );

  const Strip = ({ title, periods }: { title: string; periods: ShareChoghadiya[] }) => (
    <View style={styles.stripRow}>
      <Text style={[fit(label), styles.stripLabel]}>{title}</Text>
      {periods.map((c, i) => (
        <View key={i} style={styles.stripCol}>
          <View style={[styles.bar, { backgroundColor: c.auspicious ? colors.choghadiyaShubh : colors.choghadiyaAvoid }]} />
          <One style={en ? { fontFamily: fontFamilies.latinBold, fontSize: 14, lineHeight: 17, color: colors.ink, textAlign: 'center' } : { fontFamily: bodyFace, fontSize: 13, lineHeight: 17, color: colors.ink, textAlign: 'center' }}>
            {c.name}
          </One>
          <Text style={[clock(13), styles.center]}>{c.start}</Text>
        </View>
      ))}
    </View>
  );

  const Kaal = ({ title, time, good }: { title: string; time: string; good?: boolean }) => (
    <View style={[styles.tile, { backgroundColor: good ? colors.goldTint : colors.avoidTint, borderColor: good ? colors.goldChipBg : colors.avoidTint }]}>
      <View style={styles.kaalHead}>
        <View style={[styles.dot, { backgroundColor: good ? colors.gold : colors.avoid }]} />
        <One style={[label, { color: good ? colors.saffronDeep : colors.avoid }]}>{title}</One>
      </View>
      <One style={clock(16)}>{time}</One>
    </View>
  );

  const Vaas = ({ title, v, weight }: { title: string; v: ShareVaas; weight: number }) => (
    <View style={[styles.tile, { flex: weight, backgroundColor: colors.parchmentSoft, borderColor: colors.divider }]}>
      <One style={label}>{title}</One>
      <One style={[value(15), v.valueWarn && { color: colors.avoid }]}>{v.value}</One>
      <Text numberOfLines={2} style={fit([line, v.lineWarn && { color: colors.avoid, fontFamily: en ? fontFamilies.latinBold : scriptTitleFont(lang, fontFamilies.devanagariBold) }])}>
        {v.line}
      </Text>
    </View>
  );

  const SkyTime = ({ k, v, right }: { k: string; v: string; right?: boolean }) => (
    <Text numberOfLines={1} style={[fit(line), right && styles.right]}>
      {k} <Text style={clock(14)}>{v}</Text>
    </Text>
  );

  return (
    <View style={[styles.card, { backgroundColor: colors.parchment }]}>
      {/* ---- day sky: brand, city, date, sun and moon times */}
      <View style={styles.sky}>
        <LinearGradient colors={[colors.skyDayTop, colors.skyDayUpper, colors.skyDayLower, colors.skyDayHorizon]} locations={[0, 0.42, 0.8, 1]} style={StyleSheet.absoluteFill} />
        <Svg width={PANCHANG_SHARE_WIDTH} height={SKY_HEIGHT} viewBox={`0 6 ${PANCHANG_SHARE_WIDTH} ${SKY_HEIGHT}`} style={StyleSheet.absoluteFill}>
          <Path d="M220 140 Q270 86 320 140" fill="none" stroke={colors.skyArcDay} strokeWidth={1.4} strokeDasharray="3 4" strokeLinecap="round" />
          <Circle cx={270} cy={113} r={16} fill={colors.sunHalo} />
          <Circle cx={270} cy={113} r={10} fill={colors.sunCore} />
          <Path
            d="M270 95v-4M270 131v4M252 113h-4M288 113h4M257.3 100.3l-2.8-2.8M282.7 125.7l2.8 2.8M257.3 125.7l-2.8 2.8M282.7 100.3l2.8-2.8"
            stroke={colors.sunCore}
            strokeOpacity={0.6}
            strokeWidth={1.4}
            strokeLinecap="round"
          />
          <Circle cx={220} cy={140} r={2.5} fill={colors.saffronDeep} />
          <Circle cx={320} cy={140} r={2.5} fill={colors.saffronDeep} />
          <Path d="M0 142 C 90 137, 170 146, 270 141 S 450 135, 540 143 L 540 150 L 0 150 Z" fill={colors.skyHillsDay} />
        </Svg>
        <View style={styles.brandRow}>
          <View style={styles.brand}>
            <Image source={brandMark} onLoad={onIconLoad} style={styles.brandIcon} accessibilityIgnoresInvertColors />
            <View>
              <Text style={withMarkHeadroom({ fontFamily: fontFamilies.devanagariBold, fontSize: 16, lineHeight: 18, color: colors.ink })}>वेदांश़</Text>
              <Text style={fit({ fontFamily: fontFamilies.latinSemiBoldItalic, fontSize: 12, lineHeight: 14, color: colors.saffronDeep })}>
                Vedansh · <Text style={en ? undefined : { fontFamily: scriptTitleFont(lang, fontFamilies.devanagariBold), fontSize: 11.5 }}>{t('पूर्ण पंचांग', 'Full Panchang')}</Text>
              </Text>
            </View>
          </View>
          <View style={[styles.cityChip, { backgroundColor: colors.dayGlass, borderColor: colors.dayGlassBorder }]}>
            <View style={[styles.pin, { backgroundColor: colors.saffron }]} />
            <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8} style={[fit({ fontFamily: en ? fontFamilies.latinBold : scriptTitleFont(lang, fontFamilies.devanagariBold), fontSize: en ? 14 : 13, lineHeight: 17, color: colors.ink }), styles.shrink]}>
              {model.place}
            </Text>
          </View>
        </View>
        <View style={styles.dateBlock}>
          <One style={[en ? { fontFamily: fontFamilies.latinBold, fontSize: 25, lineHeight: 28 } : { fontFamily: titleFace, fontSize: 22, lineHeight: 28.5 }, { color: colors.ink, textAlign: 'center' }]}>{model.date}</One>
          <One style={[line, { fontSize: en ? 15 : 13, textAlign: 'center' }]}>{model.identity}</One>
        </View>
        <View style={[styles.skyTimes, { left: 14 }]}>
          <SkyTime k={t('ब्रह्म मुहूर्त', 'Brahma Muhurta')} v={model.brahma} />
          <SkyTime k={t('सूर्योदय', 'Sunrise')} v={model.sunrise} />
        </View>
        <View style={[styles.skyTimes, { right: 14 }]}>
          <SkyTime right k={t('सूर्यास्त', 'Sunset')} v={model.sunset} />
          <SkyTime right k={t('चंद्रोदय', 'Moonrise')} v={model.moonrise ?? '—'} />
        </View>
      </View>

      <View style={styles.body}>
        {/* ---- today's पर्व */}
        {model.festival && (
          <View style={[styles.ribbon, { backgroundColor: colors.cardActiveFrom, borderColor: colors.goldChipBg }]}>
            <View style={[styles.moonMark, { backgroundColor: colors.skyNightTop }]}>
              <View style={[styles.moonDisc, { backgroundColor: colors.moonLight }]} />
            </View>
            <One style={[value(15), styles.shrink]}>
              <Text style={{ color: colors.saffronDeep, fontSize: 12, fontFamily: bodyFace }}>{t('आज', 'Today')} · </Text>
              {model.festival.name}
            </One>
            {model.festival.more > 0 && (
              <View style={[styles.more, { backgroundColor: colors.goldChipBg }]}>
                <Text style={{ fontFamily: fontFamilies.interSemiBold, fontSize: 12, color: colors.saffronDeep }}>+{model.festival.more}</Text>
              </View>
            )}
          </View>
        )}

        {/* ---- angas: तिथि · नक्षत्र lead; वार is already in the date line */}
        <LinearGradient colors={[colors.cardActiveFrom, colors.parchmentGradientEnd]} style={[styles.section, { borderColor: colors.goldChipBg }]}>
          <View style={styles.angaRow}>
            <Anga title={t('तिथि', 'Tithi')} a={model.tithi} size={19} />
            <Anga title={t('नक्षत्र', 'Nakshatra')} a={model.nakshatra} size={19} />
          </View>
          <View style={[styles.angaRow, styles.angaRowRule, { borderTopColor: colors.divider }]}>
            <Anga title={t('नित्य योग', 'Nitya Yoga')} a={model.yoga} size={16} />
            <Anga title={t('करण', 'Karana')} a={model.karana} size={16} />
          </View>
        </LinearGradient>

        {/* ---- all 16 choghadiya with start times */}
        <View style={[styles.section, { backgroundColor: colors.parchmentSoft, borderColor: colors.divider, gap: 4 }]}>
          <View style={styles.chogHead}>
            <Text style={fit(label)}>{t('चौघड़िया · आरंभ समय', 'Choghadiya · start times')}</Text>
            <View style={styles.legend}>
              <View style={[styles.legendSwatch, { backgroundColor: colors.choghadiyaShubh }]} />
              <Text style={fit([label, { color: colors.inkMuted }])}>{t('शुभ', 'auspicious')}</Text>
              <View style={[styles.legendSwatch, { backgroundColor: colors.choghadiyaAvoid, marginLeft: 8 }]} />
              <Text style={fit([label, { color: colors.inkMuted }])}>{t('त्याज्य', 'avoid')}</Text>
            </View>
          </View>
          <Strip title={t('दिन', 'Day')} periods={model.day} />
          <Strip title={t('रात', 'Night')} periods={model.night} />
        </View>

        {/* ---- kaal windows (all daytime, so no AM/PM) */}
        <View style={styles.tileRow}>
          <Kaal good title={t('अभिजीत', 'Abhijit')} time={model.abhijit ?? '—'} />
          <Kaal title={t('राहु काल', 'Rahu Kaal')} time={model.rahu} />
          <Kaal title={t('गुलिक काल', 'Gulika Kaal')} time={model.gulika} />
          <Kaal title={t('यमगण्ड', 'Yamaganda')} time={model.yamaganda} />
        </View>

        {/* ---- the four वास. Widths follow content: अग्नि वास carries the only line
            that can run long ("हवन वर्जित · 2:04 AM, 1 अक्टू से पाताल"), so it takes
            what the one-word सूर्य tile does not need and still holds two lines. */}
        <View style={styles.tileRow}>
          <Vaas weight={0.75} title={t('सूर्य', 'Sun')} v={model.surya} />
          <Vaas weight={1.05} title={t('चन्द्रमा · चन्द्र वास', 'Moon · Vaas')} v={model.chandra} />
          <Vaas weight={0.9} title={t('दिशा शूल', 'Disha Shool')} v={model.dishaShool} />
          <Vaas weight={1.3} title={t('अग्नि वास', 'Agni Vaas')} v={model.agni} />
        </View>
      </View>

      {/* ---- footer: app icon, what the app does, the download link */}
      <LinearGradient colors={[colors.skyNightUpper, colors.skyNightTop]} style={styles.footer}>
        <Image source={brandMark} style={[styles.footerIcon, { borderColor: colors.nightGold }]} accessibilityIgnoresInvertColors />
        <View style={styles.footerText}>
          <One style={{ fontFamily: en ? fontFamilies.latinBold : titleFace, fontSize: en ? 16 : 14, lineHeight: en ? 19 : 17.5, color: colors.nightInk }}>
            {t('रोज़ का पूरा पंचांग — वेदांश़ ऐप', 'Full panchang daily — Vedansh app')}
          </One>
          <One style={{ fontFamily: en ? fontFamilies.latinSemiBold : bodyFace, fontSize: en ? 13 : 12, lineHeight: 15.5, color: colors.nightInkSoft }}>
            {t('मुहूर्त · चौघड़िया · व्रत-त्योहार · कुंडली · पाठ', 'Muhurat · Choghadiya · Festivals · Kundali')}
          </One>
        </View>
        <View style={[styles.pill, { backgroundColor: colors.nightGold }]}>
          <Text style={fit({ fontFamily: en ? fontFamilies.interSemiBold : scriptTitleFont(lang, fontFamilies.devanagariBold), fontSize: 12, lineHeight: 15, color: colors.ink })}>
            {t('डाउनलोड', 'Download')}
          </Text>
          <Text style={{ fontFamily: fontFamilies.interSemiBold, fontSize: 12, lineHeight: 15, color: colors.ink }}>{SMART_LINK.replace(/^https:\/\//, '')}</Text>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { width: PANCHANG_SHARE_WIDTH, height: PANCHANG_SHARE_HEIGHT, overflow: 'hidden' },
  sky: { height: SKY_HEIGHT, borderBottomLeftRadius: 22, borderBottomRightRadius: 22, overflow: 'hidden' },
  brandRow: { position: 'absolute', left: 14, right: 14, top: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  brandIcon: { width: 32, height: 32, borderRadius: 8 },
  cityChip: { flexShrink: 1, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 11, paddingVertical: 4, borderRadius: 14, borderWidth: 1 },
  pin: { width: 9, height: 9, borderTopLeftRadius: 5, borderTopRightRadius: 5, borderBottomRightRadius: 5, transform: [{ rotate: '-45deg' }] },
  dateBlock: { position: 'absolute', left: 14, right: 14, top: 42 },
  skyTimes: { position: 'absolute', top: 92, width: 196 },
  right: { textAlign: 'right' },
  center: { textAlign: 'center' },
  shrink: { flexShrink: 1, minWidth: 0 },
  body: { flex: 1, paddingTop: 7, paddingHorizontal: 12, rowGap: 5, justifyContent: 'space-between' },
  ribbon: { height: 36, flexDirection: 'row', alignItems: 'center', gap: 9, paddingLeft: 6, paddingRight: 12, borderRadius: 14, borderWidth: 1 },
  moonMark: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  moonDisc: { width: 12, height: 12, borderRadius: 6 },
  more: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: 8 },
  section: { paddingTop: 6, paddingBottom: 7, paddingHorizontal: 12, borderRadius: 14, borderWidth: 1 },
  angaRow: { flexDirection: 'row', columnGap: 14 },
  angaRowRule: { marginTop: 5, paddingTop: 5, borderTopWidth: 1 },
  angaCell: { flex: 1, minWidth: 0 },
  chogHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  legend: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendSwatch: { width: 10, height: 7, borderRadius: 3 },
  stripRow: { flexDirection: 'row', alignItems: 'center', columnGap: 3 },
  stripLabel: { width: 43 },
  stripCol: { flex: 1, minWidth: 0, alignItems: 'stretch' },
  bar: { height: 8, borderRadius: 4, marginBottom: 1 },
  tileRow: { flexDirection: 'row', columnGap: 5 },
  tile: { flex: 1, minWidth: 0, paddingVertical: 5, paddingHorizontal: 8, borderRadius: 11, borderWidth: 1 },
  kaalHead: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  footer: { height: 50, marginTop: 6, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 10 },
  footerIcon: { width: 36, height: 36, borderRadius: 9, borderWidth: 1 },
  footerText: { flex: 1, minWidth: 0 },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, marginLeft: 'auto' },
});
