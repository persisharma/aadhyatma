import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage, type Lang } from '@/data/gita/language';
import { contentByLang } from '@/utils/localize';
import { scriptTitleFont, scriptBodyFont } from '@/utils/langType';
import { formatClock, formatRange } from '@/panchang/muhuratFormat';
import type { PanchangData, PanchangElement } from '@/panchang/types';
import type { ChoghadiyaKey, ChoghadiyaPeriod, KaalWindow, MuhuratDay } from '@/panchang/muhurat';

const MONTHS_EN = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const MONTHS_HI = ['जनवरी','फ़रवरी','मार्च','अप्रैल','मई','जून','जुलाई','अगस्त','सितंबर','अक्तूबर','नवंबर','दिसंबर'];

function fmtDate(d: Date, lang: Lang): string {
  const months = lang === 'en' ? MONTHS_EN : MONTHS_HI;
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}
function elementLine(e: PanchangElement, lang: Lang): string {
  const name = contentByLang(lang, e.nameHi, e.nameEn);
  return e.endTime ? `${name} · ${formatClock(e.endTime)}` : name;
}

/**
 * The reverent, gold-॥-framed "आज का पंचांग" card body (design.md §5). Shared by
 * the Muhurat detail screen (`variant="full"`) and the shareable image
 * (`variant="share"` + `brand`). Dark `ink` text throughout; the auspicious tint
 * signals quality behind the text, never graying it (design.md §12).
 */
export default function MuhuratCardBody({
  p,
  md,
  variant,
  nowKey,
  cityLabel,
  brand = false,
}: {
  p: PanchangData;
  md: MuhuratDay;
  variant: 'full' | 'share';
  nowKey?: ChoghadiyaKey | null;
  cityLabel: string;
  brand?: boolean;
}) {
  const { colors, typography, spacing, radii } = useTheme();
  const { lang } = useGitaLanguage();

  const titleFont = scriptTitleFont(lang, typography.cardHindi.fontFamily);
  const bodyFont = scriptBodyFont(lang, typography.meaning.fontFamily);

  const GroupLabel = ({ hi, en }: { hi: string; en: string }) => (
    <Text style={[styles.grplab, { color: colors.saffronDeep, fontFamily: typography.cardLatin.fontFamily }]}>
      {contentByLang(lang, hi, en)}
    </Text>
  );
  const KV = ({ k, v }: { k: string; v: string }) => (
    <View style={styles.kv}>
      <Text style={{ fontFamily: bodyFont, fontSize: 14, color: colors.inkSoft }}>{k}</Text>
      <Text style={{ fontFamily: titleFont, fontSize: 14, color: colors.ink }}>{v}</Text>
    </View>
  );
  const Rule = () => <View style={[styles.rule, { backgroundColor: colors.divider }]} />;

  const Muh = ({ name, time, quality, now }: { name: string; time: string; quality: 'auspicious' | 'avoid'; now?: boolean }) => {
    const bg = quality === 'avoid' ? colors.avoidTint : colors.goldTint;
    const tone = quality === 'avoid' ? colors.avoid : colors.ink;
    return (
      <View style={[styles.muh, { backgroundColor: bg, borderRadius: radii.md }, now && { borderWidth: 1.5, borderColor: colors.saffron }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text style={{ fontFamily: titleFont, fontSize: 14, color: tone }}>{name}</Text>
          {now && (
            <Text style={{ fontFamily: typography.cardLatin.fontFamily, fontSize: 8, fontWeight: '700', color: colors.onPrimary, backgroundColor: colors.saffron, paddingHorizontal: 5, paddingVertical: 1, borderRadius: 5, overflow: 'hidden' }}>
              अभी
            </Text>
          )}
        </View>
        <Text style={{ fontFamily: typography.cardLatin.fontFamily, fontSize: 12, color: quality === 'avoid' ? colors.avoid : colors.inkSoft }}>
          {time}
        </Text>
      </View>
    );
  };

  const chogName = (c: ChoghadiyaPeriod) => contentByLang(lang, c.nameHi, c.nameEn);
  const kaalName = (k: KaalWindow) => contentByLang(lang, k.nameHi, k.nameEn);
  const auspicious = md.dayChoghadiya.filter((c) => c.quality === 'auspicious');

  return (
    <View>
      <Text style={[styles.om, { color: colors.saffron, fontFamily: typography.readerTitle.fontFamily }]}>ॐ</Text>
      <Text style={[styles.title, { color: colors.ink, fontFamily: titleFont }]}>
        {contentByLang(lang, 'आज का पंचांग', "Today's Panchang")}
      </Text>
      <Text style={[styles.dateline, { color: colors.inkMuted, fontFamily: lang === 'en' ? typography.cardLatin.fontFamily : bodyFont }]}>
        {contentByLang(lang, p.vara.nameHi, p.vara.nameEn)}, {fmtDate(p.date, lang)} · {contentByLang(lang, `संवत ${p.vikramSamvat}`, `Samvat ${p.vikramSamvat}`)}
      </Text>

      <View style={[styles.frame, { borderColor: colors.gold, borderRadius: radii.lg, backgroundColor: colors.parchmentSoft }]}>
        <Text style={[styles.ornL, { color: colors.saffron, fontFamily: typography.readerTitle.fontFamily }]}>॥</Text>
        <Text style={[styles.ornR, { color: colors.saffron, fontFamily: typography.readerTitle.fontFamily }]}>॥</Text>

        <GroupLabel hi="पंचांग" en="Panchang" />
        <KV k={contentByLang(lang, 'तिथि', 'Tithi')} v={elementLine(p.tithi, lang)} />
        <KV k={contentByLang(lang, 'नक्षत्र', 'Nakshatra')} v={elementLine(p.nakshatra, lang)} />
        {variant === 'full' && <KV k={contentByLang(lang, 'योग', 'Yoga')} v={elementLine(p.yoga, lang)} />}
        {variant === 'full' && <KV k={contentByLang(lang, 'करण', 'Karana')} v={elementLine(p.karana, lang)} />}
        <Rule />

        <GroupLabel hi="सूर्य" en="Sun" />
        <KV k={contentByLang(lang, 'सूर्योदय', 'Sunrise')} v={formatClock(md.sunrise)} />
        <KV k={contentByLang(lang, 'सूर्यास्त', 'Sunset')} v={formatClock(md.sunset)} />
        <Rule />

        <GroupLabel hi="शुभ मुहूर्त · चौघड़िया" en="Auspicious · Choghadiya" />
        {(variant === 'share' ? auspicious : md.dayChoghadiya).map((c, i) => (
          <Muh key={`d${i}`} name={chogName(c)} time={formatRange(c.start, c.end)} quality={c.quality} now={c.key === nowKey && c.phase === 'day'} />
        ))}

        {variant === 'full' && (
          <>
            <Rule />
            <GroupLabel hi="रात्रि चौघड़िया" en="Night Choghadiya" />
            {md.nightChoghadiya.map((c, i) => (
              <Muh key={`n${i}`} name={chogName(c)} time={formatRange(c.start, c.end)} quality={c.quality} now={c.key === nowKey && c.phase === 'night'} />
            ))}
          </>
        )}

        <Rule />
        <GroupLabel hi="विशेष" en="Special" />
        {md.abhijit && <Muh name={contentByLang(lang, 'अभिजीत मुहूर्त', 'Abhijit Muhurat')} time={formatRange(md.abhijit.start, md.abhijit.end)} quality="auspicious" />}
        <Muh name={kaalName(md.rahu)} time={formatRange(md.rahu.start, md.rahu.end)} quality="avoid" />
        {variant === 'full' && <Muh name={kaalName(md.gulika)} time={formatRange(md.gulika.start, md.gulika.end)} quality="avoid" />}
        {variant === 'full' && <Muh name={kaalName(md.yamaganda)} time={formatRange(md.yamaganda.start, md.yamaganda.end)} quality="avoid" />}

        <Text style={[styles.footnote, { color: colors.inkMuted, fontFamily: lang === 'en' ? typography.cardLatin.fontFamily : bodyFont }]}>
          {contentByLang(lang, `सभी समय ${cityLabel} के अनुसार`, `All times for ${cityLabel}`)}
        </Text>
      </View>

      {brand && (
        <View style={styles.brandRow}>
          <Text style={{ color: colors.saffron, fontFamily: typography.readerTitle.fontFamily, fontSize: 14 }}>ॐ</Text>
          <Text style={{ color: colors.saffronDeep, fontFamily: titleFont, fontSize: 13 }}>वेदांश़</Text>
          <Text style={{ color: colors.inkMuted, fontFamily: typography.cardLatin.fontFamily, fontSize: 11 }}>· {cityLabel}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  om: { textAlign: 'center', fontSize: 22 },
  title: { textAlign: 'center', fontSize: 20, marginTop: 2 },
  dateline: { textAlign: 'center', fontSize: 12.5, marginTop: 3, marginBottom: 12 },
  frame: { borderWidth: 1, padding: 16, position: 'relative' },
  ornL: { position: 'absolute', top: 8, left: 12, fontSize: 14, opacity: 0.55 },
  ornR: { position: 'absolute', top: 8, right: 12, fontSize: 14, opacity: 0.55 },
  grplab: { fontSize: 9, letterSpacing: 0.6, textTransform: 'uppercase', textAlign: 'center', marginTop: 6, marginBottom: 8 },
  kv: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4, paddingHorizontal: 2 },
  rule: { height: 1, marginVertical: 10 },
  muh: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 11, marginBottom: 5 },
  footnote: { fontSize: 11, textAlign: 'center', marginTop: 10, fontStyle: 'italic' },
  brandRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, marginTop: 12 },
});
