// Display helpers for the पितृ स्मरण surfaces (PRD-17) — pure, RN-free, following
// the gunaMilanDisplay.ts pattern. Screens format dates through these so the list,
// detail, overview and More-row subtitle cannot drift apart.

import type { Lang } from '@/data/gita/language';
import { contentByLang } from '@/utils/localize';
import { transliterateDevanagari } from '@/utils/transliterate';
import { relationLabels, tithiRuleLabel, type SmaranEntry } from './pitruSmaran';

const MONTHS_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_HI = ['जन', 'फ़र', 'मार्च', 'अप्रै', 'मई', 'जून', 'जुल', 'अग', 'सित', 'अक्टू', 'नवं', 'दिसं'];

export function startOfLocalDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function monthName(monthIndex: number, lang: Lang): string {
  if (lang === 'en') return MONTHS_EN[monthIndex];
  const hi = MONTHS_HI[monthIndex];
  return lang === 'hi' ? hi : transliterateDevanagari(hi, lang);
}

/** `21 सित` — the ObservanceList right-column short date. */
export function shortDate(date: Date, lang: Lang): string {
  return `${date.getDate()} ${monthName(date.getMonth(), lang)}`;
}

/** `21 सित 2026` — short date with year (list rows can cross the year boundary). */
export function shortDateWithYear(date: Date, lang: Lang): string {
  return `${shortDate(date, lang)} ${date.getFullYear()}`;
}

/** `21 सितम्बर 2026`-class full date used by the detail hero pill. */
export function fullDate(date: Date, lang: Lang): string {
  return shortDateWithYear(date, lang);
}

export function daysUntil(date: Date, from: Date): number {
  return Math.round((startOfLocalDay(date).getTime() - startOfLocalDay(from).getTime()) / 86400000);
}

/** `आज` / `कल` / `41द` — the ObservanceList relative label (§33 row pattern). */
export function relativeDayLabel(date: Date, from: Date, lang: Lang): string {
  const days = daysUntil(date, from);
  if (days <= 0) return contentByLang(lang, 'आज', 'today');
  if (days === 1) return contentByLang(lang, 'कल', '1d');
  return contentByLang(lang, `${days}द`, `${days}d`);
}

/** `आज` / `कल` / `173 दिन में` — the detail-hero "in N days" phrasing. */
export function inDaysLabel(date: Date, from: Date, lang: Lang): string {
  const days = daysUntil(date, from);
  if (days <= 0) return contentByLang(lang, 'आज', 'Today');
  if (days === 1) return contentByLang(lang, 'कल', 'Tomorrow');
  return contentByLang(lang, `${days} दिन में`, `in ${days} days`);
}

/** The caption line under a person row: tithi in words, or the unknown-tithi form. */
export function entryCaption(entry: Pick<SmaranEntry, 'tithiRule'>, lang: Lang): string {
  if (entry.tithiRule === 'sarvapitri') {
    return contentByLang(lang, 'तिथि अज्ञात — सर्वपितृ अमावस्या', 'Tithi unknown — Sarvapitri Amavasya');
  }
  const hi = tithiRuleLabel(entry.tithiRule, 'hi');
  return lang === 'en' ? tithiRuleLabel(entry.tithiRule, 'en') : lang === 'hi' ? hi : transliterateDevanagari(hi, lang);
}

/** The row's display name: relation, with the optional personal name appended. */
export function entryDisplayName(entry: Pick<SmaranEntry, 'relation' | 'name'>, lang: Lang): string {
  const labels = relationLabels(entry.relation);
  const relation = lang === 'en'
    ? labels.labelEn
    : lang === 'hi'
      ? labels.labelHi
      : transliterateDevanagari(labels.labelHi, lang);
  const name = entry.name?.trim();
  return name ? `${relation} · ${name}` : relation;
}
