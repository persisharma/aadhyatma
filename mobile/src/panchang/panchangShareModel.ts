// The पूर्ण पंचांग share card's text (design.md §33a): one day, every detail
// the day panel shows, shaped into the short strings a 540×675 card can hold.
// Pure over the day's solved panchang + muhurat; no engine call, so it can run
// on the share tap without a solve.
import type { Lang } from '@/data/gita/language';
import { contentByLang } from '@/utils/localize';
import { formatClock, formatEndInstant, formatRangeCompact } from './muhuratFormat';
import type { ChoghadiyaPeriod, MuhuratDay } from './muhurat';
import {
  KARANA_NAMES_EN,
  KARANA_NAMES_HI,
  NAKSHATRA_NAMES_EN,
  NAKSHATRA_NAMES_HI,
  PAKSHA_NAMES_EN,
  PAKSHA_NAMES_HI,
  TITHI_NAMES_EN,
  TITHI_NAMES_HI,
  YOGA_NAMES_EN,
  YOGA_NAMES_HI,
} from './names';
import { DISHA_LABELS } from './eventMuhurat';
import { AGNI_VAAS_LABELS, DIRECTION_LABELS, chandraVaasFavourableDirections, dayVaas, havanVerdict } from './vaas';
import type { CalendarSystem, PanchangData, PanchangElement, ResolvedObservance } from './types';

const MONTHS_FULL_HI = ['जनवरी', 'फ़रवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'];
const MONTHS_FULL_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export type ShareAnga = { name: string; lines: string[] };
export type ShareChoghadiya = { name: string; start: string; auspicious: boolean };
export type ShareVaas = { value: string; line: string; valueWarn: boolean; lineWarn: boolean };

export type PanchangShareModel = {
  /** "बेंगलुरु" — every time on the card depends on it. A pincode label can run
   * to "३९६२१० · दादरा और नगर हवेली और दमन और दीव", so it has the chip to itself. */
  place: string;
  /** "सोमवार, 26 अक्टूबर 2026" */
  date: string;
  /** "आश्विन शुक्ल पूर्णिमा · पूर्णिमांत · विक्रम संवत् 2083" — the month convention
   * sits beside the masa it names. */
  identity: string;
  brahma: string;
  sunrise: string;
  sunset: string;
  /** Null on the rare day the Moon does not rise. */
  moonrise: string | null;
  /** The first observance (name · deity) and how many more share the day. */
  festival: { name: string; more: number } | null;
  tithi: ShareAnga;
  nakshatra: ShareAnga;
  yoga: ShareAnga;
  karana: ShareAnga;
  day: ShareChoghadiya[];
  night: ShareChoghadiya[];
  /** Daytime windows, so no AM/PM: "11:40 – 12:26". Abhijit is null when it collapses. */
  abhijit: string | null;
  rahu: string;
  gulika: string;
  yamaganda: string;
  surya: ShareVaas;
  chandra: ShareVaas;
  dishaShool: ShareVaas;
  agni: ShareVaas;
};

const bareClock = (d: Date) => formatClock(d).replace(/ [AP]M$/, '');
const span = (a: Date, b: Date) => `${bareClock(a)} – ${bareClock(b)}`;
const name = (lang: Lang, hi: string, en: string) => contentByLang(lang, hi, en);

/** The tithi running at `at` — the sunrise tithi, its kshaya follower, or the next. */
function tithiIndexAt(p: PanchangData, at: Date): number {
  const before = (e: PanchangElement) => e.endTime == null || at.getTime() < e.endTime.getTime() - 60_000;
  if (before(p.tithi)) return p.tithi.index;
  if (p.kshayaTithi && before(p.kshayaTithi)) return p.kshayaTithi.index;
  return ((p.kshayaTithi ?? p.tithi).index + 1) % 30;
}

/**
 * The karana after the sunrise one. The seven movable karanas cycle बव … विष्टि;
 * the four fixed ones close the month (शकुनि, चतुष्पद, नाग, then किंस्तुघ्न before
 * बव). विष्टि hands over to शकुनि only in its last slot, the first half of कृष्ण
 * चतुर्दशी (tithi 28); everywhere else it is followed by बव.
 */
export function karanaSuccessorIndex(p: PanchangData): number {
  const k = p.karana.index;
  if (k === 6) return p.karana.endTime && tithiIndexAt(p, p.karana.endTime) === 28 ? 7 : 0;
  return k === 10 ? 0 : k + 1;
}

/** "9:41 AM तक, फिर प्रतिपदा" — or "पूरे दिन" when the anga holds to the next sunrise. */
function untilLine(lang: Lang, e: PanchangElement, next: { hi: string; en: string } | null, day: Date): string {
  if (!e.endTime) return name(lang, 'पूरे दिन', 'all day');
  const end = formatEndInstant(e.endTime, day, lang);
  if (!next) return name(lang, `${end} तक`, `till ${end}`);
  return name(lang, `${end} तक, फिर ${next.hi}`, `till ${end}, then ${next.en}`);
}

/**
 * The anga, how long it runs and what follows. A kshaya anga (it begins and ends
 * between two sunrises) gets the second line, so the day reads
 * "6:20 AM तक, फिर चतुर्दशी (क्षय)" · "4:10 AM, 1 अक्टू तक, फिर अमावस्या".
 */
function anga(
  lang: Lang,
  e: PanchangElement,
  kshaya: PanchangElement | null,
  names: { hi: readonly string[]; en: readonly string[] },
  day: Date,
): ShareAnga {
  const count = names.hi.length;
  const at = (i: number) => ({ hi: names.hi[i % count], en: names.en[i % count] });
  if (kshaya) {
    return {
      name: name(lang, e.nameHi, e.nameEn),
      lines: [
        untilLine(lang, e, { hi: `${kshaya.nameHi} (क्षय)`, en: `${kshaya.nameEn} (kshaya)` }, day),
        untilLine(lang, kshaya, at(kshaya.index + 1), day),
      ],
    };
  }
  return { name: name(lang, e.nameHi, e.nameEn), lines: [untilLine(lang, e, e.endTime ? at(e.index + 1) : null, day)] };
}

const chog = (lang: Lang) => (c: ChoghadiyaPeriod): ShareChoghadiya => ({
  name: name(lang, c.nameHi, c.nameEn),
  start: bareClock(c.start),
  auspicious: c.quality === 'auspicious',
});

/**
 * The four angas, each with how long it runs and what follows — what the share
 * card prints and the day panel's anga card (`PanchangAngaCard`) shows.
 */
export function buildAngaLines(p: PanchangData, lang: Lang): Pick<PanchangShareModel, 'tithi' | 'nakshatra' | 'yoga' | 'karana'> {
  const day = p.date;
  return {
    tithi: anga(lang, p.tithi, p.kshayaTithi, { hi: TITHI_NAMES_HI, en: TITHI_NAMES_EN }, day),
    nakshatra: anga(lang, p.nakshatra, p.kshayaNakshatra, { hi: NAKSHATRA_NAMES_HI, en: NAKSHATRA_NAMES_EN }, day),
    yoga: anga(lang, p.yoga, null, { hi: YOGA_NAMES_HI, en: YOGA_NAMES_EN }, day),
    karana: {
      name: name(lang, p.karana.nameHi, p.karana.nameEn),
      lines: [
        untilLine(
          lang,
          p.karana,
          p.karana.endTime ? { hi: KARANA_NAMES_HI[karanaSuccessorIndex(p)], en: KARANA_NAMES_EN[karanaSuccessorIndex(p)] } : null,
          day,
        ),
      ],
    },
  };
}

export function buildPanchangShareModel(input: {
  p: PanchangData;
  md: MuhuratDay;
  observances: readonly ResolvedObservance[];
  placeHi: string;
  placeEn: string;
  calendarSystem: CalendarSystem;
  lang: Lang;
}): PanchangShareModel {
  const { p, md, observances, lang } = input;
  const day = p.date;
  const system = input.calendarSystem === 'amanta' ? { hi: 'अमान्त', en: 'Amanta' } : { hi: 'पूर्णिमांत', en: 'Purnimant' };
  const masaHi = `${p.lunarMonth.nameHi}${p.lunarMonth.isAdhik ? ' (अधिक)' : ''}`;
  const masaEn = `${p.lunarMonth.nameEn}${p.lunarMonth.isAdhik ? ' (Adhik)' : ''}`;

  const first = observances[0]?.rule;
  const festival = first
    ? {
        name: [name(lang, first.nameHi, first.nameEn), name(lang, first.deityHi, first.deityEn)].filter(Boolean).join(' · '),
        more: observances.length - 1,
      }
    : null;

  const v = dayVaas(p);
  const [fav1, fav2] = chandraVaasFavourableDirections(v.chandra.value);
  const agni = AGNI_VAAS_LABELS[v.agni.value];
  const verdict = havanVerdict(v.agni.value);
  const agniNext = v.agni.until && v.agni.next ? { at: formatEndInstant(v.agni.until, day, lang), place: AGNI_VAAS_LABELS[v.agni.next] } : null;

  return {
    place: name(lang, input.placeHi, input.placeEn),
    date: name(
      lang,
      `${p.vara.nameHi}, ${day.getDate()} ${MONTHS_FULL_HI[day.getMonth()]} ${day.getFullYear()}`,
      `${p.vara.nameEn}, ${day.getDate()} ${MONTHS_FULL_EN[day.getMonth()]} ${day.getFullYear()}`,
    ),
    identity: name(
      lang,
      `${masaHi} ${PAKSHA_NAMES_HI[p.tithi.paksha]} ${p.tithi.nameHi} · ${system.hi} · विक्रम संवत् ${p.vikramSamvat}`,
      `${masaEn} ${PAKSHA_NAMES_EN[p.tithi.paksha]} ${p.tithi.nameEn} · ${system.en} · Vikram Samvat ${p.vikramSamvat}`,
    ),
    brahma: formatRangeCompact(p.brahmaMuhurta.start, p.brahmaMuhurta.end),
    sunrise: formatClock(p.sunrise),
    sunset: formatClock(p.sunset),
    moonrise: p.moonrise ? formatClock(p.moonrise) : null,
    festival,
    ...buildAngaLines(p, lang),
    day: md.dayChoghadiya.map(chog(lang)),
    night: md.nightChoghadiya.map(chog(lang)),
    abhijit: md.abhijit ? span(md.abhijit.start, md.abhijit.end) : null,
    rahu: span(md.rahu.start, md.rahu.end),
    gulika: span(md.gulika.start, md.gulika.end),
    yamaganda: span(md.yamaganda.start, md.yamaganda.end),
    surya: { value: name(lang, p.sunRashi.nameHi, p.sunRashi.nameEn), line: name(lang, 'सूर्य राशि', 'Sun sign'), valueWarn: false, lineWarn: false },
    chandra: {
      value: name(lang, `${p.moonRashi.nameHi} · ${DIRECTION_LABELS[v.chandra.value].hi}`, `${p.moonRashi.nameEn} · ${DIRECTION_LABELS[v.chandra.value].en}`),
      line: name(
        lang,
        `${DIRECTION_LABELS[fav1].hi}, ${DIRECTION_LABELS[fav2].hi} शुभ`,
        `${DIRECTION_LABELS[fav1].en}, ${DIRECTION_LABELS[fav2].en} favoured`,
      ),
      valueWarn: false,
      lineWarn: false,
    },
    dishaShool: {
      value: name(lang, DISHA_LABELS[v.dishaShool].hi, DISHA_LABELS[v.dishaShool].en),
      line: name(lang, 'यात्रा टालें', 'avoid travel'),
      valueWarn: true,
      lineWarn: true,
    },
    agni: {
      value: name(lang, agni.hi, agni.en),
      line: agniNext
        ? name(lang, `${verdict.hi} · ${agniNext.at} से ${agniNext.place.hi}`, `${verdict.en} · ${agniNext.place.en} from ${agniNext.at}`)
        : name(lang, verdict.hi, verdict.en),
      valueWarn: false,
      lineWarn: !agni.favourableForHavan,
    },
  };
}
