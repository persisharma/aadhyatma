import type { Lang } from '@/data/gita/language';
import { contentByLang } from '@/utils/localize';
import { transliterateDevanagari } from '@/utils/transliterate';
import { formatClock, formatEndInstant, formatRange } from './muhuratFormat';
import type { MuhuratDay } from './muhurat';
import type { PanchangData, PanchangElement } from './types';

const MONTHS_EN = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const MONTHS_HI = ['जनवरी','फ़रवरी','मार्च','अप्रैल','मई','जून','जुलाई','अगस्त','सितंबर','अक्तूबर','नवंबर','दिसंबर'];

/** `26 अक्तूबर 2026`; gu/kn re-script the Devanagari month, matching the other Panchang screens. */
export function panchangDateLabel(d: Date, lang: Lang): string {
  const months =
    lang === 'en' ? MONTHS_EN : lang === 'hi' ? MONTHS_HI : MONTHS_HI.map((m) => transliterateDevanagari(m, lang));
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

/** referenceDay = the panchang date, so ends past midnight carry a short-date suffix. */
export function panchangElementLine(e: PanchangElement, referenceDay: Date, lang: Lang): string {
  const name = contentByLang(lang, e.nameHi, e.nameEn);
  return e.endTime ? `${name} · ${formatEndInstant(e.endTime, referenceDay, lang)}` : name;
}

type PanchangShare = { p: PanchangData; md: MuhuratDay; lang: Lang; cityLabel: string; isToday: boolean };

const titleFor = (lang: Lang, isToday: boolean) =>
  isToday ? contentByLang(lang, 'आज का पंचांग', "Today's Panchang") : contentByLang(lang, 'इस दिन का पंचांग', "This Day's Panchang");

/** Caption parts for the Panchang card (design.md §39.10): title · weekday + date, then tithi · nakshatra. */
export function panchangShareCaption({ p, lang, isToday }: Pick<PanchangShare, 'p' | 'lang' | 'isToday'>) {
  return {
    sectionName: titleFor(lang, isToday),
    label: `${contentByLang(lang, p.vara.nameHi, p.vara.nameEn)}, ${panchangDateLabel(p.date, lang)}`,
    firstLine: `${contentByLang(lang, p.tithi.nameHi, p.tithi.nameEn)} · ${contentByLang(lang, p.nakshatra.nameHi, p.nakshatra.nameEn)}`,
  };
}

/**
 * "Send as text" for the Panchang card: the share card's rows as plain lines — tithi,
 * nakshatra, sun, the auspicious day choghadiya, Abhijit and Rahu Kaal. The provider
 * appends the download lines.
 */
export function buildPanchangShareText({ p, md, lang, cityLabel, isToday }: PanchangShare): string {
  const t = (hi: string, en: string) => contentByLang(lang, hi, en);
  const lines = [
    titleFor(lang, isToday),
    `${t(p.vara.nameHi, p.vara.nameEn)}, ${panchangDateLabel(p.date, lang)} · ${t(`संवत ${p.vikramSamvat}`, `Samvat ${p.vikramSamvat}`)}`,
    '',
    `${t('तिथि', 'Tithi')}: ${panchangElementLine(p.tithi, p.date, lang)}`,
  ];
  if (p.kshayaTithi) lines.push(`${t('क्षय तिथि', 'Kshaya Tithi')}: ${panchangElementLine(p.kshayaTithi, p.date, lang)}`);
  lines.push(`${t('नक्षत्र', 'Nakshatra')}: ${panchangElementLine(p.nakshatra, p.date, lang)}`);
  if (p.kshayaNakshatra) lines.push(`${t('क्षय नक्षत्र', 'Kshaya Nakshatra')}: ${panchangElementLine(p.kshayaNakshatra, p.date, lang)}`);
  lines.push(`${t('सूर्योदय', 'Sunrise')}: ${formatClock(md.sunrise)} · ${t('सूर्यास्त', 'Sunset')}: ${formatClock(md.sunset)}`);
  const auspicious = md.dayChoghadiya.filter((c) => c.quality === 'auspicious');
  if (auspicious.length) {
    lines.push('', `${t('शुभ चौघड़िया', 'Auspicious Choghadiya')}:`);
    for (const c of auspicious) lines.push(`• ${t(c.nameHi, c.nameEn)} ${formatRange(c.start, c.end)}`);
  }
  lines.push('');
  if (md.abhijit) lines.push(`${t('अभिजीत मुहूर्त', 'Abhijit Muhurat')}: ${formatRange(md.abhijit.start, md.abhijit.end)}`);
  lines.push(`${t(md.rahu.nameHi, md.rahu.nameEn)} (${t('त्याज्य', 'avoid')}): ${formatRange(md.rahu.start, md.rahu.end)}`);
  lines.push(t(`सभी समय ${cityLabel} के अनुसार`, `All times for ${cityLabel}`));
  return lines.join('\n');
}
