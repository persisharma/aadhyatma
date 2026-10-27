import type { StoryIconName } from '@/components/StoryIcon';
import type { Lang } from '@/data/gita/language';
import type { ObservanceRule } from './types';
import { contentByLang } from '@/utils/localize';

// Explicit identities only: unknown saints, regional forms and composite deities
// keep a neutral ritual painting instead of borrowing a different deity's face.
const DEITY_ART: Readonly<Record<string, StoryIconName>> = {
  'Lord Vishnu': 'vishnu', 'Shri Vishnu': 'vishnu', 'Shree Satyanarayan': 'vishnu',
  'Lord Shiva': 'shiva', 'Shri Ganesh': 'ganesha', 'Shri Krishna': 'krishna',
  'Shri Ram': 'rama', 'Sita Ram': 'rama', 'Hanuman Ji': 'hanuman',
  'Maa Durga': 'durga', 'Maa Lakshmi': 'lakshmi', 'Maa Saraswati': 'saraswati',
  'Maa Parvati': 'parvati', 'Maa Gauri': 'parvati', 'Surya Deva': 'surya',
  'Shani Deva': 'shani', 'Radha Rani': 'radha', 'Shri Radha-Krishna': 'radha',
  'Lord Kartikeya': 'kartikeya', 'Lord Murugan': 'kartikeya',
  'Lord Narasimha': 'narasimha', 'Maa Ganga': 'ganga',
  'Maharishi Valmiki': 'granth', 'Veda Parampara': 'granth',
  'Guru Parampara': 'granth', 'Rishi Parampara': 'granth',
};

export function observanceIcon(rule: Pick<ObservanceRule, 'deityEn' | 'category'>): StoryIconName {
  return DEITY_ART[rule.deityEn] ?? (rule.category === 'festival' ? 'aarti' : 'vrat');
}

const MONTHS_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MONTHS_HI = ['जनवरी', 'फ़रवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'];

export function observanceMonth(date: Date | null, today: Date, lang: Lang): string {
  if (!date) return contentByLang(lang, 'अन्य व्रत-पर्व', 'Other observances');
  const month = contentByLang(lang, MONTHS_HI[date.getMonth()], MONTHS_EN[date.getMonth()]);
  return date.getFullYear() === today.getFullYear() ? month : `${month} ${date.getFullYear()}`;
}

export function observanceCountdown(date: Date, today: Date, lang: Lang): string {
  // Compare civil days, not elapsed hours (DST days can be 23 or 25 hours).
  const civil = (d: Date) => Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
  const days = Math.round((civil(date) - civil(today)) / 86400000);
  if (days <= 0) return contentByLang(lang, 'आज', 'Today');
  if (days === 1) return contentByLang(lang, 'कल', 'Tomorrow');
  return contentByLang(lang, `${days} दिन शेष`, `In ${days} days`);
}
