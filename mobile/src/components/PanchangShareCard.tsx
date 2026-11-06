import { formatEndInstant, isSameLocalDay } from '@/panchang/muhuratFormat';
import FestiveCorners from './FestiveCorners';
import FestivalMotif from './FestivalMotif';
import { occasionRange } from '@/panchang/occasionTimingFormat';
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
import VedanshWordmark from './VedanshWordmark';
import type { PanchangShareModel, ShareAnga, ShareChoghadiya, ShareVaas } from '@/panchang/panchangShareModel';
import { brandTextLang, shareBrandTextLine, type ResolvedShareBrand } from '@/data/shareBrand';

const brandMark = require('@assets/splash-icon.png');

/** The card's layout box (dp). Captured at 2× → 1080×1350, the 4:5 feed/WhatsApp size. */
export const PANCHANG_SHARE_WIDTH = 540;
export const PANCHANG_SHARE_HEIGHT = 675;

const SKY_HEIGHT = 144;

// Optical centers measured in the shipped font faces (em). Noto's deep
// descender reserve makes visible Indic labels sit high in centered line boxes.
// Keep this local to fixed-image chrome; reader headroom/scaling is unchanged.
const chromeOpticalOffsets = {
  hi: { place: 0.295, download: 0.285 },
  gu: { place: 0.17, download: 0.175 },
  kn: { place: 0.26, download: 0.275 },
  en: { place: 0.04, download: -0.01 },
} as const;

/**
 * पूर्ण पंचांग share card (design.md §33a): one day, everything the day panel
 * shows, in one 4:5 image — a day-sky header (brand, city, date, sun and moon
 * times), today's पर्व, the angas with end times and what follows, all 16
 * चौघड़िया with start times, the four kaal windows, the four वास tiles, and a
 * dark footer with the app icon and the download link.
 *
 * `brand` (the sharer's co-branding, §33a *Co-branding*) replaces the footer's
 * feature line with `<name>` or `<name> · <title> · <contact>`; the header is never
 * touched. Without it the card is unchanged; the Vedansh icon, wordmark and
 * download pill never move.
 *
 * Every line is a fixed size that was fit-tested against the longest strings
 * (long city, अधिक मास, a क्षय tithi, the longest nakshatra/yoga/karana, a long
 * festival); single-line values only shrink as a last resort. Indic lines set
 * tight leading, so each one takes the mark headroom (utils/markHeadroom.ts) or
 * iOS/Android would clip its matras.
 */
export default function PanchangShareCard({ model, lang, onIconLoad, brand = null, onFestivalArtLoad }: { onFestivalArtLoad?: (slot: string) => void; model: PanchangShareModel; lang: Lang; onIconLoad?: () => void; brand?: ResolvedShareBrand | null }) {
  const { colors } = useTheme();
  const ritual = model.occasionTimings?.find(i => i.windows.length > 0 || i.noteHi);
  const primary = ritual?.windows[0];
  const referenceDay = model.referenceDay ?? ritual?.date;
  const datedClock = !!primary && !!referenceDay && (!isSameLocalDay(primary.start, referenceDay) || !isSameLocalDay(primary.end, referenceDay));
  const clockText = primary && referenceDay ? (datedClock && !primary.event
    ? `${formatEndInstant(primary.start, referenceDay, lang)}\n– ${formatEndInstant(primary.end, referenceDay, lang)}`
    : occasionRange(primary, referenceDay, lang)) : null;
  const partsHi = ritual?.nameHi.split(' · ') ?? [];
  const partsEn = ritual?.nameEn.split(' · ') ?? [];
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
  // A standalone clock line needs headroom in English too (fit() skips it there): the
  // face is Noto Devanagari, so 1.25 leading clips the digits' tops on device.
  const clockLine = (size: number) => withMarkHeadroom(clock(size));
  // Header chip text (city, sharer's name): centred on each script's optical middle.
  const chipText = (l: Lang): TextStyle => {
    const size = l === 'en' ? 14 : 13;
    return {
      fontFamily: l === 'en' ? fontFamilies.latinBold : scriptTitleFont(l, fontFamilies.devanagariBold),
      fontSize: size, includeFontPadding: false, textAlignVertical: 'center', color: colors.ink,
      transform: [{ translateY: size * chromeOpticalOffsets[l].place }],
    };
  };
  // The sharer typed the name/line in any script; draw it in a face that has its glyphs.
  const brandLine = shareBrandTextLine(brand);
  const brandLineLang = brandLine ? brandTextLang(brandLine) : lang;

  const One = ({ style, children }: { style: StyleProp<TextStyle>; children: React.ReactNode }) => (
    <Text allowFontScaling={false} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.85} style={fit(style)}>
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
      <Text allowFontScaling={false} style={[fit(label), styles.stripLabel]}>{title}</Text>
      {periods.map((c, i) => (
        <View key={i} style={styles.stripCol}>
          <View style={[styles.bar, { backgroundColor: c.auspicious ? colors.choghadiyaShubh : colors.choghadiyaAvoid }]} />
          <One style={en ? { fontFamily: fontFamilies.latinBold, fontSize: 14, lineHeight: 17, color: colors.ink, textAlign: 'center' } : { fontFamily: bodyFace, fontSize: 13, lineHeight: 17, color: colors.ink, textAlign: 'center' }}>
            {c.name}
          </One>
          <Text allowFontScaling={false} style={[clockLine(13), styles.center]}>{c.start}</Text>
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
      <One style={clockLine(16)}>{time}</One>
    </View>
  );

  const Vaas = ({ title, v, weight }: { title: string; v: ShareVaas; weight: number }) => (
    <View style={[styles.tile, { flex: weight, backgroundColor: colors.parchmentSoft, borderColor: colors.divider }]}>
      <One style={label}>{title}</One>
      <One style={[value(15), v.valueWarn && { color: colors.avoid }]}>{v.value}</One>
      <Text allowFontScaling={false} numberOfLines={2} style={fit([line, v.lineWarn && { color: colors.avoid, fontFamily: en ? fontFamilies.latinBold : scriptTitleFont(lang, fontFamilies.devanagariBold) }])}>
        {v.line}
      </Text>
    </View>
  );

  const SkyTime = ({ k, v, right }: { k: string; v: string; right?: boolean }) => (
    <Text allowFontScaling={false} numberOfLines={1} style={[fit(line), right && styles.right]}>
      {k} <Text allowFontScaling={false} style={clock(14)}>{v}</Text>
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
            <View style={styles.brandCopy}>
              <VedanshWordmark lang={lang} compact showTagline={false} fixedExport />
              {/* Chrome reserves its own full line box. Reader headroom's negative
                  margin would pull this subtitle into the wordmark above it. */}
              <Text testID="panchang-share-subtitle" allowFontScaling={false} style={{
                fontFamily: en ? fontFamilies.latinSemiBoldItalic : scriptTitleFont(lang, fontFamilies.devanagariBold),
                fontSize: en ? 12 : 11.5, lineHeight: en ? 18 : 19,
                includeFontPadding: false, color: colors.saffronDeep,
              }}>
                {t('पूर्ण पंचांग', 'Full Panchang')}
              </Text>
            </View>
          </View>
          <View style={styles.chips}>
            <View testID="panchang-share-location-chip" style={[styles.cityChip, { backgroundColor: colors.dayGlass, borderColor: colors.dayGlassBorder }]}>
              <View style={[styles.pin, { backgroundColor: colors.saffron }]} />
              <Text testID="panchang-share-location" allowFontScaling={false} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8} style={[chipText(lang), styles.shrink]}>
                {model.place}
              </Text>
            </View>
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

      <View testID="panchang-share-body" style={[styles.body, ritual && { rowGap: 3 }]}>
        {/* ---- today's पर्व */}
        {ritual ? (
          <View testID="panchang-share-occasion" style={[styles.ritual, { backgroundColor: colors.brandIvory, borderColor: colors.gold }]}>
            <FestiveCorners size={64} onLoad={slot => onFestivalArtLoad?.(slot)} />
            <FestivalMotif motif={ritual.motif} size={54} onLoad={() => onFestivalArtLoad?.('motif')} />
            <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
              <One style={[label, { fontSize: 11, color: colors.saffronDeep }]}>{t(partsHi.length > 1 ? partsHi[0] : datedClock && primary ? primary.labelHi : 'पर्व का मुहूर्त', partsEn.length > 1 ? partsEn[0] : datedClock && primary ? primary.labelEn : 'Festival timings')}</One>
              <One style={[value(18), { color: colors.festivalInk }]}>{t(partsHi.at(-1) ?? ritual.nameHi, partsEn.at(-1) ?? ritual.nameEn)}</One>
            </View>
            <View style={{ width: 194, minHeight: 42, paddingLeft: 12, borderLeftWidth: 1, borderLeftColor: colors.goldChipBg, justifyContent: 'center' }}><Text allowFontScaling={false} numberOfLines={2} style={[clockLine(datedClock ? 17 : 20), { minWidth: 0, textAlign: 'center', color: colors.festivalInk }]}>{primary ? clockText : t('स्थानीय समय सुनिश्चित करें', 'Confirm local timing')}</Text>{!datedClock && primary && <One style={[line, { fontSize: 11, lineHeight: 15, textAlign: 'center' }]}>{t(primary.labelHi, primary.labelEn)}</One>}</View>
          </View>
        ) : model.festival && (
          <View style={[styles.ribbon, { backgroundColor: colors.cardActiveFrom, borderColor: colors.goldChipBg }]}>
            <View style={[styles.moonMark, { backgroundColor: colors.skyNightTop }]}>
              <View style={[styles.moonDisc, { backgroundColor: colors.moonLight }]} />
            </View>
            <One style={[value(15), styles.shrink]}>
              <Text allowFontScaling={false} style={{ color: colors.saffronDeep, fontSize: 12, fontFamily: bodyFace }}>{t('आज', 'Today')} · </Text>
              {model.festival.name}
            </One>
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
            <Text allowFontScaling={false} style={fit(label)}>{t('चौघड़िया · आरंभ समय', 'Choghadiya · start times')}</Text>
            <View style={styles.legend}>
              <View style={[styles.legendSwatch, { backgroundColor: colors.choghadiyaShubh }]} />
              <Text allowFontScaling={false} style={fit([label, { color: colors.inkMuted }])}>{t('शुभ', 'auspicious')}</Text>
              <View style={[styles.legendSwatch, { backgroundColor: colors.choghadiyaAvoid, marginLeft: 8 }]} />
              <Text allowFontScaling={false} style={fit([label, { color: colors.inkMuted }])}>{t('त्याज्य', 'avoid')}</Text>
            </View>
          </View>
          <Strip title={t('दिन', 'Day')} periods={model.day} />
          <Strip title={t('रात', 'Night')} periods={model.night} />
        </View>

        {/* ---- kaal windows (24-hour ranges) */}
        <View style={styles.tileRow}>
          <Kaal good title={t('अभिजीत', 'Abhijit')} time={model.abhijit ?? '—'} />
          <Kaal title={t('राहु काल', 'Rahu Kaal')} time={model.rahu} />
          <Kaal title={t('गुलिक काल', 'Gulika Kaal')} time={model.gulika} />
          <Kaal title={t('यमगण्ड', 'Yamaganda')} time={model.yamaganda} />
        </View>

        {/* ---- the four वास. Widths follow content: अग्नि वास carries the only line
            that can run long ("हवन वर्जित · 02:04, 1 अक्टू से पाताल"), so it takes
            what the one-word सूर्य tile does not need and still holds two lines. */}
        <View style={styles.tileRow}>
          <Vaas weight={0.75} title={t('सूर्य', 'Sun')} v={model.surya} />
          <Vaas weight={1.05} title={t('चन्द्रमा · चन्द्र वास', 'Moon · Vaas')} v={model.chandra} />
          <Vaas weight={0.9} title={t('दिशा शूल', 'Disha Shool')} v={model.dishaShool} />
          <Vaas weight={1.3} title={t('अग्नि वास', 'Agni Vaas')} v={model.agni} />
        </View>
      </View>

      {/* ---- footer: app icon, what the app does, the download link */}
      <LinearGradient testID="panchang-share-footer" colors={[colors.skyNightUpper, colors.skyNightTop]} style={styles.footer}>
        <Image source={brandMark} style={[styles.footerIcon, { borderColor: colors.nightGold }]} accessibilityIgnoresInvertColors />
        <View style={styles.footerText}>
          <One style={{ fontFamily: en ? fontFamilies.latinBold : titleFace, fontSize: en ? 16 : 14, lineHeight: en ? 19 : 17.5, color: colors.nightInk }}>
            {t('रोज़ का पूरा पंचांग — वेदांश़ ऐप', 'Full panchang daily — Vedansh app')}
          </One>
          {brandLine ? (
            // The sharer's name (· title · contact) replaces the feature line; the pill keeps the link.
            <Text testID="panchang-share-brand-line" allowFontScaling={false} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75}
              style={brandLineLang === 'en'
                ? { fontFamily: fontFamilies.latinBold, fontSize: 13, lineHeight: 15.5, color: colors.nightGold }
                : withMarkHeadroom({ fontFamily: scriptTitleFont(brandLineLang, fontFamilies.devanagariBold), fontSize: 12, lineHeight: 15.5, color: colors.nightGold })}>
              {brandLine}
            </Text>
          ) : (
            <One style={{ fontFamily: en ? fontFamilies.latinSemiBold : bodyFace, fontSize: en ? 13 : 12, lineHeight: 15.5, color: colors.nightInkSoft }}>
              {t('मुहूर्त · चौघड़िया · व्रत-त्योहार · कुंडली · पाठ', 'Muhurat · Choghadiya · Festivals · Kundali')}
            </One>
          )}
        </View>
        {/* Center each script's natural line box instead of sharing a baseline
            and pulling the whole label upward with reader mark headroom. */}
        <View testID="panchang-share-download-pill" style={[styles.pill, { backgroundColor: colors.nightGold }]}>
          <Text testID="panchang-share-download-label" allowFontScaling={false} style={{ fontFamily: en ? fontFamilies.interSemiBold : scriptTitleFont(lang, fontFamilies.devanagariBold), fontSize: 12, includeFontPadding: false, textAlignVertical: 'center', color: colors.ink, transform: [{ translateY: 12 * chromeOpticalOffsets[lang].download }] }}>
            {t('डाउनलोड', 'Download')}
          </Text>
          <Text testID="panchang-share-download-link" allowFontScaling={false} style={{ fontFamily: fontFamilies.interSemiBold, fontSize: 12, includeFontPadding: false, textAlignVertical: 'center', color: colors.ink, transform: [{ translateY: -12 * 0.09 }] }}>{SMART_LINK.replace(/^https:\/\//, '')}</Text>
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
  brandCopy: { gap: 3, alignItems: 'flex-start' },
  brandIcon: { width: 32, height: 32, borderRadius: 8 },
  chips: { flexShrink: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 6 },
  cityChip: { flexShrink: 1, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 11, paddingVertical: 4, borderRadius: 14, borderWidth: 1 },
  pin: { width: 9, height: 9, borderTopLeftRadius: 5, borderTopRightRadius: 5, borderBottomRightRadius: 5, transform: [{ rotate: '-45deg' }] },
  dateBlock: { position: 'absolute', left: 14, right: 14, top: 42 },
  skyTimes: { position: 'absolute', top: 92, width: 196 },
  right: { textAlign: 'right' },
  center: { textAlign: 'center' },
  shrink: { flexShrink: 1, minWidth: 0 },
  body: { flex: 1, paddingTop: 7, paddingHorizontal: 12, rowGap: 5, justifyContent: 'space-between' },
  ritual: { minHeight: 66, flexDirection: 'row', alignItems: 'center', gap: 12, paddingLeft: 38, paddingRight: 30, paddingVertical: 5, borderWidth: 1.2, borderRadius: 14 },
  ribbon: { height: 36, flexDirection: 'row', alignItems: 'center', gap: 9, paddingLeft: 6, paddingRight: 12, borderRadius: 14, borderWidth: 1 },
  moonMark: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  moonDisc: { width: 12, height: 12, borderRadius: 6 },
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
  pill: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, marginLeft: 'auto' },
});

