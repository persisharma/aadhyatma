import type { Lang } from '@/data/gita/language';
import { contentByLang } from '@/utils/localize';
import { transliterateDevanagari } from '@/utils/transliterate';
import { TIER_LABELS, type DayVerdict, type EventRule } from './eventMuhurat';
import { formatRangeCompact } from './muhuratFormat';
import { VARA_NAMES_EN, VARA_NAMES_HI } from './names';
import { panchangDateLabel } from './panchangShareText';
import type { PanchangData } from './types';

type MuhuratDayShare = { rule: EventRule; verdict: DayVerdict; p: PanchangData; lang: Lang; cityLabel: string };

const weekdayLabel = (d: Date, lang: Lang) =>
  lang === 'en' ? VARA_NAMES_EN[d.getDay()] : lang === 'hi' ? VARA_NAMES_HI[d.getDay()] : transliterateDevanagari(VARA_NAMES_HI[d.getDay()], lang);

/** Caption parts for the Muhurat Finder day card (design.md §39.10, §60). */
export function muhuratDayShareCaption({ rule, verdict, lang }: Pick<MuhuratDayShare, 'rule' | 'verdict' | 'lang'>) {
  const date = new Date(verdict.dateMs);
  const tier = verdict.tier === 'shreshtha' ? TIER_LABELS.shreshtha : TIER_LABELS.madhyam;
  const best = verdict.windows[0];
  return {
    sectionName: contentByLang(lang, rule.nameHi, rule.nameEn),
    label: `${weekdayLabel(date, lang)}, ${panchangDateLabel(date, lang)}`,
    firstLine: best
      ? `${contentByLang(lang, tier.hi, tier.en)} · ${formatRangeCompact(best.start, best.end)}`
      : contentByLang(lang, tier.hi, tier.en),
  };
}

/**
 * "Send as text" for the finder day card: the same no-personal-data fields as the card
 * (occasion, date, panchang line, tier, windows, city). The provider appends the
 * download lines.
 */
export function buildMuhuratDayShareText({ rule, verdict, p, lang, cityLabel }: MuhuratDayShare): string {
  const t = (hi: string, en: string) => contentByLang(lang, hi, en);
  const date = new Date(verdict.dateMs);
  const tier = verdict.tier === 'shreshtha' ? TIER_LABELS.shreshtha : TIER_LABELS.madhyam;
  const lines = [
    t(rule.nameHi, rule.nameEn),
    `${weekdayLabel(date, lang)}, ${panchangDateLabel(date, lang)}`,
    `${t(p.tithi.nameHi, p.tithi.nameEn)} · ${t(p.nakshatra.nameHi, p.nakshatra.nameEn)}`,
    `${t(tier.hi, tier.en)}${t(' · दृक्पंचांग पद्धति', ' · DrikPanchang convention')}`,
  ];
  const windows = verdict.windows.slice(0, 3);
  if (windows.length) {
    lines.push('', `${t('शुभ समय', 'Auspicious windows')}:`);
    for (const w of windows) lines.push(`• ${t(w.nameHi, w.nameEn)} ${formatRangeCompact(w.start, w.end)}`);
  }
  lines.push('', t('परम्परागत मार्गदर्शन — पुरोहित से पुष्टि करें।', 'Traditional guidance — confirm with your purohit.'));
  lines.push(t(`सभी समय ${cityLabel} के अनुसार`, `All times for ${cityLabel}`));
  return lines.join('\n');
}
