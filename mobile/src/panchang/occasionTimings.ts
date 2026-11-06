/** Pure ritual windows, distinct from Choghadiya. Source ledger and exclusions:
 * docs/reviews/festival-muhurat.md. No year-table/fallback-city dates. */
import { OBSERVANCE_RULES } from './festivals';
import { matchesRuleOnDate } from './festivalEngine';
import { crossingAfter, elongationAt, tithiSpan, type Span } from './dayRuleInstants';
import { dayAt, type DayInputs, type ScanOptions } from './panchangDayStore';
import { ruleVisibleForLenses, type ObservanceLens } from './lenses';

export type FestivalMotif = 'diya' | 'fire' | 'shastra' | 'kalash' | 'moon' | 'sun' | 'shiva' | 'ganesh' | 'rakhi' | 'lotus';
type Recipe = 'lakshmi' | 'midday' | 'rama' | 'vijaya' | 'nishita' | 'shiva' | 'holika' | 'moon' | 'karwa' | 'chhath' | 'afternoon' | 'morning' | 'pratah' | 'pradosh' | 'rakhi' | 'ekadashi' | 'ghata';
export type OccasionProfile = { id: string; ruleId: string; recipe: Recipe; motif: FestivalMotif; nameHi?: string; nameEn?: string; before?: number; source: string; sunriseAnchor?: boolean };
export type OccasionWindow = Span & { labelHi: string; labelEn: string; event?: boolean };
export type OccasionTiming = { id: string; ruleId: string; date: Date; nameHi: string; nameEn: string; motif: FestivalMotif; windows: OccasionWindow[]; noteHi?: string; noteEn?: string };
const drik = 'https://www.drikpanchang.com';
const profile = (ruleId: string, recipe: Recipe, motif: FestivalMotif, path: string, extra: Partial<OccasionProfile> = {}): OccasionProfile => ({ id: `${ruleId}-${recipe}`, ruleId, recipe, motif, source: drik + path, ...extra });
const uniqueRules = [...new Map(OBSERVANCE_RULES.map(r => [r.id, r])).values()];
export const OCCASION_PROFILES: readonly OccasionProfile[] = [
  profile('diwali', 'lakshmi', 'diya', '/festivals/lakshmipuja/festivals-lakshmipuja-timings.html', { nameHi: 'दीपावली · लक्ष्मी पूजा', nameEn: 'Diwali · Lakshmi puja' }),
  profile('dhanteras', 'lakshmi', 'diya', '/festivals/dhanteras/festivals-dhanteras-puja-timings.html'),
  ...['ganesh-chaturthi', 'ganesh-jayanti', 'vinayaka-chaturthi-vrat'].map(id => profile(id, 'midday', 'ganesh', '/hindu-festivals/ganesha-chaturthi/ganesha-chaturthi.html')),
  profile('ram-navami', 'rama', 'lotus', '/dashavatara/rama-navami/rama-navami-date-time.html'),
  ...['maha-shivaratri', 'masik-shivaratri'].map(id => profile(id, 'shiva', 'shiva', '/festivals/maha-shivaratri/maha-shivaratri-date-time.html')),
  profile('dussehra', 'vijaya', 'shastra', '/navratri/durga-puja/ayudha-puja-date-time.html', { nameHi: 'विजयादशमी · शस्त्र पूजा', nameEn: 'Vijayadashami · Shastra puja' }),
  profile('maha-navami', 'vijaya', 'shastra', '/navratri/durga-puja/ayudha-puja-date-time.html', { sunriseAnchor: true, nameHi: 'नवमी · आयुध पूजा', nameEn: 'Navami · Ayudha puja' }),
  ...['navratri-start', 'chaitra-navratri-start', 'ashadha-gupt-navratri', 'magha-gupt-navratri'].map(id => profile(id, 'ghata', 'kalash', '/navratri/info/ghatasthapana-puja-vidhi.html')),
  profile('holi', 'holika', 'fire', '/festivals/holi/festivals-holika-dahan-timings.html', { before: 1, nameHi: 'होलिका दहन', nameEn: 'Holika Dahan' }),
  profile('raksha-bandhan', 'rakhi', 'rakhi', '/festivals/raksha-bandhan/raksha-bandhan-date-time.html'),
  ...['janmashtami', 'janmashtami-vaishnava'].map(id => profile(id, 'nishita', 'lotus', '/festivals/janmashtami/krishna-janmashtami-date-time.html')),
  profile('karwa-chauth', 'karwa', 'moon', '/festivals/karwa-chauth/karwa-chauth-date-time.html'),
  ...uniqueRules.filter(r => r.dayRule === 'chandrodaya' && r.id !== 'karwa-chauth').map(r => profile(r.id, 'moon', 'moon', '/vrats/sankashti-chaturthi-dates.html')),
  ...['chhath-puja', 'chaiti-chhath'].map(id => profile(id, 'chhath', 'sun', '/chhath/chhath-puja-calendar.html')),
  profile('bhai-dooj', 'afternoon', 'rakhi', '/festivals/bhai-dooj/bhai-dooj-date-time.html'),
  profile('akshaya-tritiya', 'morning', 'kalash', '/festivals/akshaya-tritiya/akshaya-tritiya-date-time.html'),
  profile('govardhan-puja', 'pratah', 'diya', '/festivals/govardhan-puja/govardhan-puja-date-time.html'),
  ...uniqueRules.filter(r => r.id.startsWith('pradosh-vrat')).map(r => profile(r.id, 'pradosh', 'shiva', '/vrats/pradosh-dates.html')),
  // Vaishnava/Mahadvadashi deadlines cannot inherit Smarta's formula.
  ...uniqueRules.filter(r => r.dayRule === 'ekadashi' && r.category === 'vrat' && r.tithi === 11).map(r => profile(r.id, 'ekadashi', 'lotus', '/ekadashis/parana/ekadashi-vrat-parana.html')),
];
export function intersect(...spans: (Span | null | undefined)[]): Span | null {
  if (!spans.length || spans.some(s => !s)) return null;
  const start = Math.max(...spans.map(s => +s!.start)), end = Math.min(...spans.map(s => +s!.end));
  return end > start ? { start: new Date(start), end: new Date(end) } : null;
}
const fraction = (a: Date, b: Date, from: number, to: number): Span => ({ start: new Date(+a + (+b - +a) * from), end: new Date(+a + (+b - +a) * to) });
export function paranaWindows(dwadashi: Span | null, sunrise: Date, sunset: Date): OccasionWindow[] {
  if (!dwadashi || sunset <= sunrise) return [];
  const morning = fraction(sunrise, sunset, 0, .2);
  const permitted = { start: new Date(Math.max(+sunrise, +dwadashi.start + (+dwadashi.end - +dwadashi.start) / 4)), end: dwadashi.end };
  const slot = dwadashi.end <= sunrise ? morning : intersect(morning, permitted) ?? intersect(fraction(sunrise, sunset, .6, 1), permitted);
  return slot ? [{ ...slot, labelHi: slot.start < fraction(sunrise, sunset, .4, .6).end ? 'पारण · प्रातःकाल' : 'पारण · मध्याह्न के बाद', labelEn: slot.start < fraction(sunrise, sunset, .4, .6).end ? 'Parana · morning' : 'Parana · after midday' }] : [];
}
export type TimingOccurrence = { profile: OccasionProfile; date: Date };
export function* findTimingOccurrences(day: Date, options: ScanOptions, lenses: ReadonlySet<ObservanceLens>, ruleId?: string): Generator<void, TimingOccurrence[], void> {
  const found: TimingOccurrence[] = [];
  for (const p of OCCASION_PROFILES) {
    if (ruleId && p.ruleId !== ruleId) continue;
    const r = uniqueRules.find(r => r.id === p.ruleId);
    if (r && ruleVisibleForLenses(r.lens, lenses) && matchesRuleOnDate(p.sunriseAnchor ? { ...r, dayRule: undefined } : r, dayAt(day, p.before ?? 0), options.calendarSystem, options.location)) found.push({ profile: p, date: dayAt(day, 0) });
    yield;
  }
  return found;
}
export function solveOccasion({ profile: r, date }: TimingOccurrence, days: readonly DayInputs[]): OccasionTiming {
  const rule = uniqueRules.find(p => p.id === r.ruleId)!;
  const at = (offset: number) => days.find(d => +dayAt(d.p.date, 0) === +dayAt(date, offset));
  const current = at(0), tomorrow = at(1);
  const out: OccasionTiming = { id: r.id, ruleId: r.ruleId, date, nameHi: r.nameHi ?? rule.nameHi, nameEn: r.nameEn ?? rule.nameEn, motif: r.motif, windows: [] };
  if (!current || !tomorrow || current.p.sunset <= current.p.sunrise) return out;
  const p = current.p;
  const day = (a: number, b: number) => fraction(p.sunrise, p.sunset, a, b);
  const night = (a: number, b: number) => fraction(p.sunset, tomorrow.p.sunrise, a, b);
  const index = ((rule.paksha === 'krishna' ? 15 : 0) + (rule.tithi ?? 1) - 1) % 30;
  const tithi = tithiSpan(index, new Date(+dayAt(date, 0) - 36 * 3600000));
  const add = (s: Span | null, hi: string, en: string) => { if (s) out.windows.push({ ...s, labelHi: hi, labelEn: en }); };
  const event = (s: Date | null, hi: string, en: string) => { if (s) out.windows.push({ start: s, end: s, labelHi: hi, labelEn: en, event: true }); };
  switch (r.recipe) {
    case 'ghata':
      add(intersect(day(0, 1 / 3), tithi), 'घटस्थापना · प्रथम तिहाई', 'Ghatasthapana · first third');
      add(intersect(day(7 / 15, 8 / 15), tithi), 'अभिजीत · विकल्प', 'Abhijit · alternative');
      out.noteHi = 'चित्रा नक्षत्र व वैधृति योग से बचना सुझाया जाता है; दृक्पंचांग पद्धति में यह पूर्ण निषेध नहीं है। अपनी परंपरा के अनुसार समय चुनें।';
      out.noteEn = 'Avoiding Chitra and Vaidhriti is advised, but not an absolute prohibition in the Drik convention. Choose the period according to your tradition.';
      break;
    case 'lakshmi': for (const lagna of current.lagnas.filter(l => l.rashiIndex === 1)) add(intersect(night(0, .2), tithi, lagna), 'पूजा · प्रदोष व वृषभ लग्न', 'Puja · Pradosh and Vrishabha lagna'); break;
    case 'midday': add(intersect(day(.4, .6), tithi), 'मध्याह्न पूजा', 'Madhyahna puja'); break;
    case 'rama': add(day(.4, .6), 'मध्याह्न पूजा', 'Madhyahna puja'); break;
    case 'vijaya': add(day(10 / 15, 11 / 15), 'विजय मुहूर्त', 'Vijaya muhurat'); break;
    case 'nishita': case 'shiva':
      add(night(7 / 15, 8 / 15), 'निशिता पूजा', 'Nishita puja');
      if (r.ruleId === 'maha-shivaratri') for (let i = 0; i < 4; i++) add(night(i / 4, (i + 1) / 4), `रात्रि प्रहर ${i + 1}`, `Night prahar ${i + 1}`);
      break;
    case 'pradosh': add(intersect(night(0, .2), tithi), 'प्रदोष पूजा', 'Pradosh puja'); break;
    case 'morning': add(intersect(day(0, .5), tithi), 'पूर्वाह्न पूजा', 'Forenoon puja'); break;
    case 'pratah': add(intersect(day(0, .2), tithi), 'प्रातःकाल पूजा', 'Morning puja'); break;
    case 'afternoon': add(intersect(day(.6, .8), tithi), 'अपराह्न तिलक', 'Afternoon tilak'); break;
    case 'karwa': add(night(0, .1), 'संध्या पूजा', 'Evening puja');
    // fall through: moonrise is an event, never guaranteed sighting.
    case 'moon': event(p.moonrise, 'चंद्रोदय', 'Moonrise'); out.noteHi = 'व्रत खोलने से पहले वास्तविक चंद्र दर्शन करें।'; out.noteEn = 'Observe the actual Moon before breaking the fast.'; break;
    case 'chhath': event(p.sunset, 'संध्या अर्घ्य', 'Evening arghya'); event(tomorrow.p.sunrise, 'अगले दिन उषा अर्घ्य', 'Next-day dawn arghya'); break;
    case 'ekadashi': out.windows = paranaWindows(tithiSpan(11 + (rule.paksha === 'krishna' ? 15 : 0), new Date(+date - 12 * 3600000)), tomorrow.p.sunrise, tomorrow.p.sunset); break;
    case 'rakhi': case 'holika': {
      const full = tithiSpan(14, new Date(+dayAt(date, 0) - 36 * 3600000));
      const bhadraEnd = full && crossingAfter(elongationAt, new Date(+full.start + 60000), 174, 30);
      if (!full || !bhadraEnd) break;
      const free = { start: bhadraEnd, end: full.end };
      if (r.recipe === 'rakhi') add(intersect(day(.6, .8), free) ?? intersect(night(0, .2), free) ?? intersect({ start: p.sunrise, end: tomorrow.p.sunrise }, free), 'भद्रा रहित रक्षा बंधन', 'Bhadra-free Rakhi');
      else if (bhadraEnd <= night(.5, .5).start) {
        const slot = intersect(night(0, .2), free) ?? intersect(night(0, .5), free);
        // The existing day resolver can shift Dahan to the next evening,
        // after Purnima has ended (2026); the documented branch permits it.
        add(slot ?? (full.end <= p.sunset ? night(0, .2) : null), 'होलिका दहन', 'Holika Dahan');
      } else { out.noteHi = 'इस वर्ष भद्रा का अपवाद है। दहन का समय स्थानीय परंपरा के अनुसार सुनिश्चित करें।'; out.noteEn = 'A Bhadra exception applies this year. Confirm the Dahan time with your local tradition.'; }
      break;
    }
  }
  return out;
}
/** Windows on this civil day include yesterday's next-day parana/arghya.
 * Keep each named tradition separate; remove monthly Ganesh duplication. */
export function timingsOnDay(items: readonly OccasionTiming[], day: Date): OccasionTiming[] {
  const lo = +dayAt(day, 0), hi = +dayAt(day, 1);
  const filtered = items.map(i => ({ ...i, windows: +i.date === lo ? i.windows : i.windows.filter(w => +w.start >= lo && +w.start < hi || +w.end > lo && +w.start < hi) })).filter(i => i.windows.length || +i.date === lo && i.noteHi);
  return filtered.filter(i => !(i.ruleId === 'vinayaka-chaturthi-vrat' && filtered.some(j => ['ganesh-chaturthi', 'ganesh-jayanti'].includes(j.ruleId))))
    // Today's festival leads over a previous night's window crossing midnight.
    .sort((a, b) => Number(+b.date === lo) - Number(+a.date === lo));
}
