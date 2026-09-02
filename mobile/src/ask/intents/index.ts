/**
 * The v1 intent slate for जिज्ञासा (PRD-25 §5). Every `resolve` calls an engine
 * or registry that already ships — this file adds NO domain logic. Returning
 * `null` means abstain (a draft entry, a rule with no upvas profile, …).
 *
 * Registering an intent is part of the add-a-feature contract (RULEBOOK §23):
 * triggers in hi / en / Hinglish, the slots it needs, at least one example
 * question (chips + rotating placeholder), and a corpus entry.
 */
import { deities } from '@/data/deities';
import { japamMantras } from '@/data/japam';
import { VIDHI_ENTRIES, getVidhiById, getVidhiForFestival } from '@/data/vidhi';
import { getVastuRoomEntry } from '@/data/vastu/roomGuidance';
import { BHOG_CONTENT, getBhogContent } from '@/panchang/bhogContent';
import { EVENT_RULES, DISHA_LABELS } from '@/panchang/eventMuhurat';
import { getObservancesForDate } from '@/panchang/festivalEngine';
import { getKathaContent } from '@/panchang/kathaContent';
import { classifyNow, computeMuhuratDay } from '@/panchang/muhurat';
import { formatRangeCompact, formatShortDate, formatClock } from '@/panchang/muhuratFormat';
import { PAKSHA_NAMES_EN, PAKSHA_NAMES_HI } from '@/panchang/names';
import { cachedDayInputs, dayStoreFor, scopeKeyFor } from '@/panchang/panchangDayStore';
import type { PanchangData, ResolvedObservance } from '@/panchang/types';
import { getUpvasInfo } from '@/panchang/upvasContent';
import { getNextOccurrence, getRuleById } from '@/panchang/vratCatalog';
import { fold } from '../fold';
import { observanceIdsFor } from '../lexicon';
import type { AskAction, AskContext, AskIntent, AskLine, LexEntry, Localized, ResolvedSlots } from '../types';

/* ------------------------------------------------------------------ */
/*  helpers                                                            */
/* ------------------------------------------------------------------ */

const L = (hi: string, en: string): Localized => ({ hi, en });

function dayAt(ctx: AskContext, offset = 0): Date {
  const d = new Date(ctx.now);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + offset);
  return d;
}

/** The day's PanchangData from the shared, persisted day store (cache-first). */
function panchangFor(ctx: AskContext, date: Date): PanchangData {
  const opts = { calendarSystem: ctx.calendarSystem, location: ctx.location };
  const map = dayStoreFor(scopeKeyFor(ctx.location, ctx.calendarSystem));
  return cachedDayInputs(map, date, opts).inputs.p;
}

function dateLabel(d: Date, ctx: AskContext): Localized {
  return L(formatShortDate(d, 'hi'), formatShortDate(d, 'en'));
}

function relDay(offset: number | undefined): Localized {
  if (offset === 1) return L('कल', 'Tomorrow');
  if (offset === 2) return L('परसों', 'Day after tomorrow');
  return L('आज', 'Today');
}

const observanceAction = (ruleId: string, label = L('विवरण', 'Details')): AskAction => ({
  label,
  target: { tab: 'panchang', screen: 'ObservanceDetail', params: { ruleId } },
});

/** Soonest occurrence across a class's members, or the instance itself. */
function nextOf(entry: LexEntry, ctx: AskContext, from: Date): ResolvedObservance | null {
  let best: ResolvedObservance | null = null;
  for (const id of observanceIdsFor(entry)) {
    const occ = getNextOccurrence(id, from, ctx.calendarSystem);
    if (occ && (!best || occ.date.getTime() < best.date.getTime())) best = occ;
  }
  return best;
}

/** Is any member of `entry` observed on `date`? */
function observedOn(entry: LexEntry, ctx: AskContext, date: Date): ResolvedObservance | null {
  const ids = new Set(observanceIdsFor(entry));
  const todays = getObservancesForDate(date, ctx.calendarSystem, ctx.location);
  return todays.find((o) => ids.has(o.rule.id)) ?? null;
}

/** Bhog profile for a deity, derived — never a hand map (§4.3). */
function bhogForDeity(deityId: string) {
  const d = deities.find((x) => x.id === deityId);
  if (!d) return null;
  const en = fold(d.nameEn.replace(/^Shri\s+/i, ''));
  const hi = fold(d.nameHi.replace(/^श्री\s+/, ''));
  const viaVidhi = new Set(VIDHI_ENTRIES.filter((v) => v.deities.includes(deityId)).map((v) => v.id));
  for (const entry of BHOG_CONTENT) {
    if (!getBhogContent(entry.id)) continue; // verified-only gate
    if (entry.vidhiIds.some((v) => viaVidhi.has(v))) return entry;
    for (const ruleId of entry.observanceIds) {
      const rule = getRuleById(ruleId);
      if (!rule) continue;
      const rd = ` ${fold(rule.deityEn)} ${fold(rule.deityHi)} `;
      if (rd.includes(` ${en} `) || rd.includes(` ${hi} `)) return entry;
    }
  }
  return null;
}

/* ------------------------------------------------------------------ */
/*  panchang.day                                                       */
/* ------------------------------------------------------------------ */

const panchangDay: AskIntent = {
  id: 'panchang.day',
  family: 'panchang',
  triggers: [
    'aaj kya hai', 'aaj kaun si tithi', 'aaj ki tithi', 'kaun si tithi', 'tithi kya hai', 'tithi hai',
    'aaj kya tithi', 'kal kya tithi', 'kal kaun si tithi', 'nakshatra kya', 'aaj ka nakshatra', 'kal ka nakshatra',
    'aaj ka panchang', 'kal ka panchang', 'panchang', 'what is today', 'todays tithi', 'today tithi',
    'tomorrow tithi', 'which tithi', 'what tithi', 'आज की तिथि', 'आज क्या है', 'तिथि क्या है',
    'आज का पंचांग', 'कौन सी तिथि', 'आज कौन सा नक्षत्र', 'नक्षत्र क्या है',
  ],
  slots: [],
  examples: [L('आज की तिथि क्या है?', "What is today's tithi?"), L('कल कौन सी तिथि है?', 'Which tithi is tomorrow?')],
  resolve(ctx, slots) {
    const offset = slots.dayOffset ?? 0;
    const date = dayAt(ctx, offset);
    const p = panchangFor(ctx, date);
    const obs = getObservancesForDate(date, ctx.calendarSystem, ctx.location);
    const lines = [
      { label: L('तिथि', 'Tithi'), value: L(`${PAKSHA_NAMES_HI[p.tithi.paksha]} ${p.tithi.nameHi}`, `${PAKSHA_NAMES_EN[p.tithi.paksha]} ${p.tithi.nameEn}`) },
      { label: L('नक्षत्र', 'Nakshatra'), value: L(p.nakshatra.endTime ? `${p.nakshatra.nameHi} · ${formatClock(p.nakshatra.endTime)} तक` : p.nakshatra.nameHi, p.nakshatra.endTime ? `${p.nakshatra.nameEn} · until ${formatClock(p.nakshatra.endTime)}` : p.nakshatra.nameEn) },
      { label: L('मास', 'Month'), value: L(`${p.lunarMonth.nameHi}${p.lunarMonth.isAdhik ? ' (अधिक)' : ''}`, `${p.lunarMonth.nameEn}${p.lunarMonth.isAdhik ? ' (Adhik)' : ''}`) },
      { label: L('संवत्', 'Samvat'), value: L(`विक्रम ${p.vikramSamvat}`, `Vikram ${p.vikramSamvat}`) },
    ];
    if (obs.length > 0) {
      lines.push({ label: L('पर्व', 'Observance'), value: L(obs.map((o) => o.rule.nameHi).join(' · '), obs.map((o) => o.rule.nameEn).join(' · ')) });
    }
    const rel = relDay(offset);
    return {
      intentId: this.id,
      family: 'panchang',
      tag: L(`${rel.hi} · ${p.vara.nameHi}`, `${rel.en} · ${p.vara.nameEn}`),
      headline: L(`${PAKSHA_NAMES_HI[p.tithi.paksha]} ${p.tithi.nameHi}`, `${PAKSHA_NAMES_EN[p.tithi.paksha]} ${p.tithi.nameEn}`),
      sub: dateLabel(date, ctx),
      lines,
      working: [
        `computePanchangForDate(${date.toDateString()}, ${ctx.location.cityId ?? `${ctx.location.latitude.toFixed(2)},${ctx.location.longitude.toFixed(2)}`}, ${ctx.calendarSystem})`,
        `sunrise ${formatClock(p.sunrise)} · tithi at sunrise · astronomy-engine`,
      ],
      actions: [
        { label: L('पंचांग खोलें', 'Open Panchang'), target: { tab: 'panchang', screen: 'PanchangHome', params: { dateMs: date.getTime() } } },
        ...obs.slice(0, 1).map((o) => observanceAction(o.rule.id, L(o.rule.nameHi, o.rule.nameEn))),
      ],
      confidence: 'exact',
    };
  },
};

/* ------------------------------------------------------------------ */
/*  muhurat.now                                                        */
/* ------------------------------------------------------------------ */

const muhuratNow: AskIntent = {
  id: 'muhurat.now',
  family: 'muhurat',
  triggers: [
    'rahu kal', 'rahukal', 'rahu kaal', 'rahu ka samay', 'choghadiya', 'chaughadiya', 'abhi shubh', 'abhi shubh hai',
    'shubh samay', 'shubh muhurat aaj', 'aaj ka muhurat', 'aaj shubh samay', 'abhijit', 'gulik', 'yamaghant', 'yamganda',
    'राहु काल', 'राहुकाल', 'चौघड़िया', 'अभिजित', 'शुभ समय', 'अभी शुभ', 'आज का मुहूर्त', 'कल का मुहूर्त', 'kal ka muhurat',
    'kal rahu', 'rahu kaal kal',
  ],
  slots: [],
  examples: [L('राहु काल कब है?', 'When is Rahu Kaal?'), L('अभी शुभ चौघड़िया है क्या?', 'Is now an auspicious choghadiya?')],
  resolve(ctx, slots) {
    const offset = slots.dayOffset ?? 0;
    const date = dayAt(ctx, offset);
    const p = panchangFor(ctx, date);
    const next = panchangFor(ctx, dayAt(ctx, offset + 1));
    const md = computeMuhuratDay(p.sunrise, p.sunset, next.sunrise, p.vara.index);
    const rel = relDay(offset);
    const rahu = formatRangeCompact(md.rahu.start, md.rahu.end);
    const lines: AskLine[] = [{ label: L('राहु काल', 'Rahu Kaal'), value: L(rahu, rahu), tone: 'avoid' }];
    if (md.abhijit) {
      const ab = formatRangeCompact(md.abhijit.start, md.abhijit.end);
      lines.push({ label: L('अभिजित', 'Abhijit'), value: L(ab, ab) });
    }
    if (offset === 0) {
      const { nowChoghadiya, nowKaal } = classifyNow(md, ctx.now);
      if (nowChoghadiya) {
        lines.unshift({
          label: L('अभी', 'Now'),
          value: L(`${nowChoghadiya.nameHi} चौघड़िया · ${formatClock(nowChoghadiya.end)} तक`, `${nowChoghadiya.nameEn} choghadiya · until ${formatClock(nowChoghadiya.end)}`),
          tone: nowChoghadiya.quality === 'avoid' ? 'avoid' : 'neutral',
        });
      }
      if (nowKaal) {
        lines.unshift({ label: L('सावधान', 'Note'), value: L(`अभी ${nowKaal.nameHi} चल रहा है · ${formatClock(nowKaal.end)} तक`, `${nowKaal.nameEn} is running · until ${formatClock(nowKaal.end)}`), tone: 'avoid' as const });
      }
    }
    return {
      intentId: this.id,
      family: 'muhurat',
      tag: L(`${rel.hi} · ${p.vara.nameHi}`, `${rel.en} · ${p.vara.nameEn}`),
      headline: L(`राहु काल ${formatRangeCompact(md.rahu.start, md.rahu.end)}`, `Rahu Kaal ${formatRangeCompact(md.rahu.start, md.rahu.end)}`),
      sub: dateLabel(date, ctx),
      lines,
      working: [
        `computeMuhuratDay(sunrise ${formatClock(p.sunrise)}, sunset ${formatClock(p.sunset)}, weekday ${p.vara.index})`,
        'Choghadiya · Rahu Kaal · Abhijit — pure, DrikPanchang wheel',
      ],
      actions: [{ label: L('आज का मुहूर्त', 'Daily Muhurat'), target: { tab: 'panchang', screen: 'MuhuratDetail', params: { dateMs: date.getTime() } } }],
      confidence: 'exact',
    };
  },
};

/* ------------------------------------------------------------------ */
/*  observance.next                                                    */
/* ------------------------------------------------------------------ */

const observanceNext: AskIntent = {
  id: 'observance.next',
  family: 'observance',
  triggers: [
    'kab hai', 'kab h', 'kb hai', 'kab se', 'hai kya', 'h kya', 'kab aa', 'kab padegi', 'kab padega', 'kab padti', 'kitni tarikh',
    'kis din', 'kis tarikh', 'kab manaya', 'kab manai', 'agli', 'agla', 'next', 'when is', 'when does', 'date of',
    'कब है', 'कब आ', 'कब पड़', 'है क्या', 'किस दिन', 'अगली', 'अगला', 'कौन सी तारीख',
  ],
  slots: ['observance'],
  examples: [L('एकादशी कब है?', 'When is Ekadashi?'), L('कल शिवरात्रि है क्या?', 'Is tomorrow Shivaratri?')],
  resolve(ctx, slots) {
    const entry = slots.observance!;
    const asksAboutDay = slots.dayOffset !== undefined;
    if (asksAboutDay) {
      const date = dayAt(ctx, slots.dayOffset);
      const on = observedOn(entry, ctx, date);
      const rel = relDay(slots.dayOffset);
      if (on) {
        return {
          intentId: this.id,
          family: 'observance',
          tag: L(rel.hi, rel.en),
          headline: L(`हाँ — ${rel.hi} ${on.rule.nameHi} है`, `Yes — ${on.rule.nameEn} is ${rel.en.toLowerCase()}`),
          sub: dateLabel(date, ctx),
          lines: [{ label: L('पर्व', 'Observance'), value: L(on.rule.nameHi, on.rule.nameEn) }],
          working: [`getObservancesForDate(${date.toDateString()}) ∋ ${on.rule.id}`],
          actions: [observanceAction(on.rule.id, L('व्रत विवरण', 'Details'))],
          confidence: 'exact',
        };
      }
      const nxt = nextOf(entry, ctx, dayAt(ctx, 0));
      if (!nxt) return null;
      return {
        intentId: this.id,
        family: 'observance',
        tag: L(rel.hi, rel.en),
        headline: L(`नहीं — अगली ${entry.label} ${formatShortDate(nxt.date, 'hi')} को है`, `No — the next ${entry.isClass ? entry.label : nxt.rule.nameEn} is on ${formatShortDate(nxt.date, 'en')}`),
        sub: L(nxt.rule.nameHi, nxt.rule.nameEn),
        lines: [{ label: L('तिथि', 'Date'), value: dateLabel(nxt.date, ctx) }],
        working: [`getObservancesForDate(${date.toDateString()}) ∌ ${observanceIdsFor(entry).length} rule(s)`, `getNextOccurrence → ${nxt.rule.id} @ ${nxt.date.toDateString()}`],
        actions: [observanceAction(nxt.rule.id)],
        confidence: 'exact',
      };
    }
    const nxt = nextOf(entry, ctx, dayAt(ctx, 0));
    if (!nxt) return null;
    const isToday = nxt.date.getTime() === dayAt(ctx, 0).getTime();
    const upvas = nxt.rule.upvasId ? getUpvasInfo(nxt.rule.upvasId) : null;
    const lines = [
      { label: L('तिथि', 'Date'), value: L(`${formatShortDate(nxt.date, 'hi')} · ${panchangFor(ctx, nxt.date).vara.nameHi}`, `${formatShortDate(nxt.date, 'en')} · ${panchangFor(ctx, nxt.date).vara.nameEn}`) },
    ];
    if (upvas?.parana) lines.push({ label: L('पारण', 'Parana'), value: L(upvas.parana.textHi, upvas.parana.textEn) });
    return {
      intentId: this.id,
      family: 'observance',
      tag: L(entry.isClass ? 'अगली' : 'तिथि', entry.isClass ? 'Next' : 'Date'),
      headline: L(isToday ? `आज — ${nxt.rule.nameHi}` : `${nxt.rule.nameHi} — ${formatShortDate(nxt.date, 'hi')}`, isToday ? `Today — ${nxt.rule.nameEn}` : `${nxt.rule.nameEn} — ${formatShortDate(nxt.date, 'en')}`),
      sub: nxt.rule.shortDescriptionHi ? L(nxt.rule.shortDescriptionHi, nxt.rule.shortDescriptionEn) : undefined,
      lines,
      working: [
        entry.isClass ? `class ${entry.id}: min over ${observanceIdsFor(entry).length} rules` : `rule ${entry.id}`,
        `getNextOccurrence(from ${dayAt(ctx, 0).toDateString()}, ${ctx.calendarSystem}) → ${nxt.date.toDateString()}`,
      ],
      actions: [
        observanceAction(nxt.rule.id, L('व्रत विवरण', 'Details')),
        ...(nxt.rule.kathaId && getKathaContent(nxt.rule.kathaId) ? [{ label: L('कथा', 'Katha'), target: { tab: 'home', screen: 'VratKathaReader', params: { kathaId: nxt.rule.kathaId } } } as AskAction] : []),
      ],
      confidence: 'exact',
    };
  },
};

/* ------------------------------------------------------------------ */
/*  vrat.how · vrat.food · katha.find · vidhi.how                       */
/* ------------------------------------------------------------------ */

/**
 * The rule an observance slot refers to. For a class, prefer the member that
 * actually carries the field the intent needs (a monthly Shivaratri has no
 * upvas profile; Maha Shivaratri does) — nearest occurrence first.
 */
function ruleFor(entry: LexEntry, ctx: AskContext, needs?: 'upvasId' | 'kathaId' | 'bhogId' | 'vidhiId') {
  const ids = observanceIdsFor(entry);
  const nxt = nextOf(entry, ctx, dayAt(ctx, 0));
  if (!needs) return nxt?.rule ?? getRuleById(ids[0]) ?? null;
  if (nxt?.rule[needs]) return nxt.rule;
  const candidates = ids
    .map((id) => ({ rule: getRuleById(id), occ: getNextOccurrence(id, dayAt(ctx, 0), ctx.calendarSystem) }))
    .filter((c) => c.rule?.[needs])
    .sort((a, b) => (a.occ?.date.getTime() ?? Infinity) - (b.occ?.date.getTime() ?? Infinity));
  return candidates[0]?.rule ?? nxt?.rule ?? getRuleById(ids[0]) ?? null;
}

const vratHow: AskIntent = {
  id: 'vrat.how',
  family: 'observance',
  triggers: [
    'vrat kaise', 'kaise kare', 'kaise karen', 'kaise rakhe', 'kaise rakhen', 'vrat vidhi', 'upvas kaise', 'upvas vidhi',
    'kaise manaye', 'how to fast', 'how to observe', 'how to keep', 'fasting rules', 'niyam', 'parana kab', 'paran kab',
    'व्रत कैसे', 'कैसे करें', 'कैसे रखें', 'उपवास कैसे', 'व्रत विधि', 'उपवास विधि', 'नियम', 'पारण कब',
  ],
  slots: ['observance'],
  // "puja kaise kare" / "vidhi" belong to vidhi.how; "kya khaye" to vrat.food.
  blockers: ['puja', 'pooja', 'पूजा', 'samagri', 'sthapana', 'kya kha', 'क्या खा'],
  examples: [L('एकादशी व्रत कैसे करें?', 'How to observe the Ekadashi fast?')],
  resolve(ctx, slots) {
    const rule = ruleFor(slots.observance!, ctx, 'upvasId');
    if (!rule?.upvasId) return null;
    const u = getUpvasInfo(rule.upvasId);
    if (!u) return null; // draft — never answerable
    const lines = [
      { label: L('उपवास', 'Fast'), value: L(u.fastTypeNoteHi, u.fastTypeNoteEn) },
      { label: L('अवधि', 'Window'), value: L(u.window.textHi, u.window.textEn) },
      ...(u.parana ? [{ label: L('पारण', 'Parana'), value: L(u.parana.textHi, u.parana.textEn) }] : []),
      { label: L('कठोरता', 'Strictness'), value: L(u.strictnessHi, u.strictnessEn) },
    ];
    return {
      intentId: this.id,
      family: 'observance',
      tag: L('उपवास विधि', 'Fasting guidance'),
      headline: L(rule.nameHi, rule.nameEn),
      lines,
      working: [`rule ${rule.id} → upvasId ${u.id} (status: verified)`],
      provenance: L('स्रोत-सत्यापित उपवास विधि (PRD-09/P4)', 'Source-verified fasting guidance (PRD-09/P4)'),
      actions: [observanceAction(rule.id, L('पूरा विवरण', 'Full details'))],
      confidence: 'exact',
    };
  },
};

const vratFood: AskIntent = {
  id: 'vrat.food',
  family: 'bhog',
  triggers: [
    'vrat me kya kha', 'vrat mein kya kha', 'vrat me kya khaye', 'kya kha sakte', 'kya khana chahiye', 'kya khaye', 'kya khayen',
    'phalahar', 'falahar', 'vrat ka khana', 'vrat food', 'what to eat', 'can i eat', 'fasting food', 'kya nahi khana',
    'kya nahi kha', 'व्रत में क्या खा', 'क्या खाएँ', 'क्या खायें', 'क्या खा सकते', 'फलाहार', 'क्या नहीं खा',
  ],
  slots: ['observance'],
  optional: ['observance'],
  examples: [L('एकादशी व्रत में क्या खाएँ?', 'What can I eat on Ekadashi?')],
  resolve(ctx, slots) {
    // Default to the Ekadashi family when no observance was named — it is the
    // fast the question is asked about ~every fortnight.
    const entry = slots.observance;
    const rule = entry ? ruleFor(entry, ctx, 'bhogId') : null;
    const bhogId = rule?.bhogId ?? (entry ? null : 'ekadashi-food');
    if (!bhogId) return null;
    const b = getBhogContent(bhogId);
    if (!b || (!b.permittedDuringFast?.length && !b.abstainedDuringFast?.length)) return null;
    const lines = [
      ...(b.permittedDuringFast ?? []).map((i) => ({ label: L('ग्राह्य', 'Allowed'), value: L(i.textHi, i.textEn) })),
      ...(b.abstainedDuringFast ?? []).map((i) => ({ label: L('वर्जित', 'Abstained'), value: L(i.textHi, i.textEn), tone: 'avoid' as const })),
    ];
    return {
      intentId: this.id,
      family: 'bhog',
      tag: L('व्रत भोजन', 'Fasting food'),
      headline: L(b.titleHi, b.titleEn),
      lines,
      working: [`${rule ? `rule ${rule.id} → ` : 'default → '}bhogId ${b.id} (status: verified)`],
      note: L(b.traditionNoteHi, b.traditionNoteEn),
      provenance: L('स्रोत-सत्यापित (PRD-23)', 'Source-verified (PRD-23)'),
      actions: rule ? [observanceAction(rule.id, L('व्रत विवरण', 'Details'))] : [{ label: L('व्रत सूची', 'Vrat catalog'), target: { tab: 'panchang', screen: 'ObservanceList', params: { category: 'upavas' } } }],
      confidence: entry ? 'exact' : 'likely',
    };
  },
};

const kathaFind: AskIntent = {
  id: 'katha.find',
  family: 'katha',
  triggers: ['katha', 'kahani', 'vrat katha', 'ki katha', 'story of', 'legend', 'कथा', 'कहानी', 'की कथा'],
  slots: ['observance'],
  examples: [L('एकादशी की कथा', 'Ekadashi katha')],
  resolve(ctx, slots) {
    const rule = ruleFor(slots.observance!, ctx, 'kathaId');
    if (!rule?.kathaId) return null;
    const k = getKathaContent(rule.kathaId);
    if (!k) return null;
    return {
      intentId: this.id,
      family: 'katha',
      tag: L('कथा', 'Katha'),
      headline: L(k.titleHi, k.titleEn),
      sub: L(rule.nameHi, rule.nameEn),
      lines: [{ label: L('स्रोत', 'Source'), value: L(k.sourceNoteHi, k.sourceNoteEn) }],
      working: [`rule ${rule.id} → kathaId ${k.id}`],
      actions: [{ label: L('कथा पढ़ें', 'Read katha'), target: { tab: 'home', screen: 'VratKathaReader', params: { kathaId: k.id } } }],
      confidence: 'exact',
    };
  },
};

const vidhiHow: AskIntent = {
  id: 'vidhi.how',
  family: 'vidhi',
  triggers: [
    'puja vidhi', 'pooja vidhi', 'puja kaise', 'pooja kaise', 'kaise kare puja', 'vidhi', 'samagri', 'saman', 'puja me kya chahiye',
    'how to do puja', 'puja steps', 'sthapana kaise', 'पूजा विधि', 'पूजा कैसे', 'विधि', 'सामग्री', 'स्थापना कैसे',
  ],
  slots: ['observance', 'vidhi', 'deity'],
  optional: ['observance', 'vidhi', 'deity'],
  examples: [L('सत्यनारायण पूजा विधि', 'Satyanarayan puja vidhi'), L('करवा चौथ की पूजा कैसे करें?', 'How to do the Karwa Chauth puja?')],
  resolve(ctx, slots) {
    let v = slots.vidhi ? getVidhiById(slots.vidhi.id) : null;
    if (!v && slots.observance) {
      const rule = ruleFor(slots.observance, ctx, 'vidhiId');
      v = rule ? getVidhiForFestival(rule.id) : null;
      if (!v) for (const id of observanceIdsFor(slots.observance)) { v = getVidhiForFestival(id); if (v) break; }
    }
    if (!v && slots.deity) v = VIDHI_ENTRIES.find((e) => e.deities.includes(slots.deity!.id)) ?? null;
    if (!v) return null;
    const nxtRule = v.festivalIds.map((id) => getNextOccurrence(id, dayAt(ctx, 0), ctx.calendarSystem)).filter(Boolean).sort((a, b) => a!.date.getTime() - b!.date.getTime())[0] ?? null;
    return {
      intentId: this.id,
      family: 'vidhi',
      tag: L('पूजा विधि', 'Guided puja'),
      headline: L(v.titleHi, v.titleEn),
      sub: nxtRule ? L(`अगली तिथि ${formatShortDate(nxtRule.date, 'hi')}`, `Next on ${formatShortDate(nxtRule.date, 'en')}`) : undefined,
      lines: [
        { label: L('चरण', 'Steps'), value: L(`${v.steps.length} चरण · लगभग ${v.durationHintMin} मिनट`, `${v.steps.length} steps · about ${v.durationHintMin} min`) },
        { label: L('सामग्री', 'Samagri'), value: L(`${v.samagri.length} वस्तुएँ — तैयारी में सूची`, `${v.samagri.length} items — checklist in preparation`) },
      ],
      working: [`vidhi ${v.id}${slots.observance ? ` ← observance ${slots.observance.id}` : ''}`],
      actions: [
        { label: L('विधि खोलें', 'Open vidhi'), target: { tab: 'home', screen: 'VidhiDetail', params: { vidhiId: v.id, ...(nxtRule ? { dateMs: nxtRule.date.getTime() } : {}) } } },
      ],
      confidence: 'exact',
    };
  },
};

/* ------------------------------------------------------------------ */
/*  bhog.offer · bhog.avoid                                            */
/* ------------------------------------------------------------------ */

function bhogEntryFor(slots: ResolvedSlots, ctx: AskContext) {
  if (slots.observance) {
    const rule = ruleFor(slots.observance, ctx);
    if (rule?.bhogId) { const b = getBhogContent(rule.bhogId); if (b) return { b, via: `rule ${rule.id}` }; }
  }
  if (slots.deity) {
    const b = bhogForDeity(slots.deity.id);
    if (b) return { b, via: `deity ${slots.deity.id}` };
  }
  return null;
}

const bhogOffer: AskIntent = {
  id: 'bhog.offer',
  family: 'bhog',
  triggers: [
    'kya chadhaye', 'kya chadhayen', 'kya chadhaen', 'kya chadhana', 'kya chadhate', 'chadhaya jata', 'kya arpan', 'kya arpit',
    'bhog', 'naivedya', 'prasad kya', 'kya prasad', 'priya bhog', 'pasand', 'what to offer', 'offering for', 'offerings',
    'क्या चढ़ा', 'क्या अर्पण', 'क्या अर्पित', 'भोग', 'नैवेद्य', 'प्रसाद क्या', 'प्रिय भोग',
  ],
  slots: ['deity', 'observance'],
  optional: ['deity', 'observance'],
  examples: [L('गणेश जी को क्या चढ़ाएँ?', 'What to offer Ganesha?'), L('शिव जी का भोग क्या है?', "What is Shiva's bhog?")],
  resolve(ctx, slots) {
    if (!slots.deity && !slots.observance) return null;
    const hit = bhogEntryFor(slots, ctx);
    if (!hit) return null;
    const { b, via } = hit;
    const lines = [
      ...b.offerings.map((i) => ({ label: L('अर्पित', 'Offer'), value: L(i.textHi, i.textEn) })),
      ...(b.doNotOffer ?? []).map((i) => ({ label: L('न चढ़ाएँ', 'Do not offer'), value: L(i.textHi, i.textEn), tone: 'avoid' as const })),
    ];
    return {
      intentId: this.id,
      family: 'bhog',
      tag: L(slots.deity ? `नैवेद्य · ${slots.deity.label}` : 'नैवेद्य', 'Naivedya'),
      headline: L(b.titleHi, b.titleEn),
      lines,
      working: [`${via} → bhogId ${b.id} (status: verified)`],
      note: L(b.traditionNoteHi, b.traditionNoteEn),
      provenance: L('स्रोत-सत्यापित भोग (PRD-23)', 'Source-verified offerings (PRD-23)'),
      actions: [
        ...(b.observanceIds[0] ? [observanceAction(b.observanceIds[0], L('व्रत/पर्व विवरण', 'Observance'))] : []),
        ...(b.vidhiIds[0] ? [{ label: L('पूजा विधि', 'Puja vidhi'), target: { tab: 'home', screen: 'VidhiDetail', params: { vidhiId: b.vidhiIds[0] } } } as AskAction] : []),
      ],
      confidence: 'exact',
    };
  },
};

const bhogAvoid: AskIntent = {
  id: 'bhog.avoid',
  family: 'bhog',
  triggers: [
    'kya nahi chadha', 'nahi chadha', 'kya na chadha', 'na chadha', 'nahi chadhana', 'varjit', 'nishedh', 'mana hai',
    'must not offer', 'must not be', 'not be offered', 'not to offer', 'should not offer', 'never offer', 'avoid offering', 'forbidden',
    'क्या नहीं चढ़ा', 'नहीं चढ़ा', 'न चढ़ा', 'वर्जित', 'निषेध', 'मना है',
  ],
  slots: ['deity', 'observance'],
  optional: ['deity', 'observance'],
  examples: [L('गणेश जी को क्या नहीं चढ़ाना चाहिए?', 'What must not be offered to Ganesha?')],
  resolve(ctx, slots) {
    if (!slots.deity && !slots.observance) return null;
    const hit = bhogEntryFor(slots, ctx);
    if (!hit || !hit.b.doNotOffer?.length) return null;
    const { b, via } = hit;
    const avoidRows = b.doNotOffer ?? [];
    return {
      intentId: this.id,
      family: 'bhog',
      tag: L('निषेध', 'Not offered'),
      headline: L(`${slots.deity?.label ?? b.titleHi} — क्या न चढ़ाएँ`, `${b.titleEn} — what not to offer`),
      lines: avoidRows.map((i) => ({ label: L('न चढ़ाएँ', 'Do not offer'), value: L(i.textHi, i.textEn), tone: 'avoid' as const })),
      working: [`${via} → bhogId ${b.id}.doNotOffer (status: verified)`],
      note: L(b.traditionNoteHi, b.traditionNoteEn),
      provenance: L('स्रोत-सत्यापित (PRD-23)', 'Source-verified (PRD-23)'),
      actions: [...(b.observanceIds[0] ? [observanceAction(b.observanceIds[0], L('क्या चढ़ाएँ', 'What to offer'))] : [])],
      confidence: 'exact',
    };
  },
};

/* ------------------------------------------------------------------ */
/*  muhurat.event                                                      */
/* ------------------------------------------------------------------ */

const muhuratEvent: AskIntent = {
  id: 'muhurat.event',
  family: 'muhurat',
  triggers: [
    'muhurat', 'muhurt', 'mahurat', 'shubh din', 'shubh tarikh', 'shubh tithi', 'kab kare', 'kab karen', 'kab karna',
    'auspicious', 'good day for', 'best date', 'मुहूर्त', 'शुभ दिन', 'शुभ तारीख', 'कब करें', 'कब करना',
  ],
  slots: ['occasion'],
  examples: [L('गृह प्रवेश का मुहूर्त', 'Griha pravesh muhurat'), L('वाहन खरीदने का शुभ दिन', 'Auspicious day to buy a vehicle')],
  resolve(ctx, slots) {
    const occ = slots.occasion!;
    const rule = EVENT_RULES.find((r) => r.id === occ.id);
    if (!rule) return null;
    return {
      intentId: this.id,
      family: 'muhurat',
      tag: L('शुभ मुहूर्त', 'Muhurat'),
      headline: L(`${rule.nameHi} — शुभ दिन खोजें`, `${rule.nameEn} — find auspicious days`),
      sub: L('नक्षत्र · वार · तिथि · मास के नियमों से', 'By nakshatra, weekday, tithi and month rules'),
      lines: [
        { label: L('टाले जाते', 'Avoided'), value: L(rule.doshas.slice(0, 5).join(' · '), rule.doshas.slice(0, 5).join(' · ')), tone: 'avoid' as const },
      ],
      working: [`EVENT_RULES[${rule.id}] · nakshatras ${rule.nakshatras.length} · tithis ${rule.tithis.length} · varas ${rule.varas.length}`],
      actions: [
        { label: L('शुभ दिन देखें', 'See dates'), target: { tab: 'panchang', screen: 'MuhuratResults', params: { occasionId: rule.id } } },
        ...(rule.id === 'griha-pravesh' ? [{ label: L('वास्तु दिशा', 'Vastu'), target: { tab: 'panchang', screen: 'VastuDisha' } } as AskAction] : []),
      ],
      confidence: 'exact',
    };
  },
};

/* ------------------------------------------------------------------ */
/*  vastu.direction                                                    */
/* ------------------------------------------------------------------ */

const vastuDirection: AskIntent = {
  id: 'vastu.direction',
  family: 'vastu',
  triggers: [
    'kis disha', 'kaun si disha', 'konsi disha', 'kis taraf', 'kis or', 'kidhar', 'disha me', 'disha mein', 'disha kya',
    'which direction', 'which side', 'direction', 'disha', 'where should', 'vastu', 'kaha rakhe', 'kahan rakhe', 'kahan hona',
    'किस दिशा', 'कौन सी दिशा', 'किस तरफ', 'किस ओर', 'किधर', 'दिशा में', 'वास्तु', 'कहाँ रखें', 'कहाँ हो',
  ],
  slots: ['room'],
  examples: [L('मंदिर किस दिशा में होना चाहिए?', 'Which direction should the mandir face?'), L('सोते समय सिर किस दिशा में?', 'Which way should my head point when sleeping?')],
  resolve(ctx, slots) {
    const room = getVastuRoomEntry(slots.room!.id);
    if (!room || room.status !== 'verified') return null;
    const dirs = room.directions.map((d) => DISHA_LABELS[d]);
    const lines = [
      { label: L('दिशा', 'Direction'), value: L(room.isCenter ? 'ब्रह्मस्थान (केंद्र)' : dirs.map((d) => d.hi).join(' · '), room.isCenter ? 'Brahmasthan (centre)' : dirs.map((d) => d.en).join(' · ')) },
      { label: L('परम्परा', 'Convention'), value: L(room.conventionHi, room.conventionEn) },
      { label: L('कारण', 'Reason'), value: L(room.reasonHi, room.reasonEn) },
      ...(room.accommodationHi ? [{ label: L('समायोजन', 'If not possible'), value: L(room.accommodationHi, room.accommodationEn ?? '') }] : []),
    ];
    return {
      intentId: this.id,
      family: 'vastu',
      tag: L('वास्तु दिशा', 'Vastu'),
      headline: L(room.titleHi, room.titleEn),
      lines,
      working: [`VASTU_ROOM_ENTRIES[${room.id}] (status: verified)`],
      provenance: L('शास्त्रीय परम्परा, कारण सहित — आपके घर पर निर्णय नहीं', 'Classical convention with its reason — never a verdict on your home'),
      actions: [{ label: L('दिशा चक्र खोलें', 'Open compass'), target: { tab: 'panchang', screen: 'VastuDisha' } }],
      confidence: 'exact',
    };
  },
};

/* ------------------------------------------------------------------ */
/*  japam.mantra                                                       */
/* ------------------------------------------------------------------ */

const japamMantra: AskIntent = {
  id: 'japam.mantra',
  family: 'japam',
  triggers: [
    'jap kaise', 'japa kaise', 'jap karna', 'mantra jap', 'kitni bar', 'kitni baar', 'kitne jap', 'mala kaise', 'mala jap',
    'how many times', 'chant', 'japa of', 'jap', 'japa', 'जप कैसे', 'जप करना', 'मंत्र जप', 'कितनी बार', 'माला', 'जप',
  ],
  slots: ['mantra', 'deity'],
  optional: ['mantra', 'deity'],
  examples: [L('ॐ नमः शिवाय का जप कैसे करें?', 'How to do Om Namah Shivaya japa?')],
  resolve(ctx, slots) {
    let m = slots.mantra ? japamMantras.find((x) => x.id === slots.mantra!.id) ?? null : null;
    if (!m && slots.deity) m = japamMantras.find((x) => (x.deities as readonly string[]).includes(slots.deity!.id)) ?? null;
    if (!m) return null;
    return {
      intentId: this.id,
      family: 'japam',
      tag: L('जप', 'Japa'),
      headline: L(m.nameHi, m.nameEn),
      sub: L(m.sub, m.subEn),
      lines: [{ label: L('माला', 'Mala'), value: L('१०८ मनके · जप काउंटर स्वयं गिनता है', '108 beads · the counter keeps count') }],
      working: [`japamMantras[${m.id}]${slots.deity ? ` ← deity ${slots.deity.id}` : ''}`],
      actions: [{ label: L('जप शुरू करें', 'Start japa'), target: { tab: 'home', screen: 'JapamCounter', params: { mantraId: m.id } } }],
      confidence: slots.mantra ? 'exact' : 'likely',
    };
  },
};

/* ------------------------------------------------------------------ */
/*  sadhana.progress                                                   */
/* ------------------------------------------------------------------ */

const sadhanaProgress: AskIntent = {
  id: 'sadhana.progress',
  family: 'sadhana',
  triggers: [
    'mera sankalp', 'mere sankalp', 'sankalp kitna', 'sankalp ka din', 'kaun sa din', 'konsa din', 'kitne din bache', 'kitne din hue',
    'meri sadhana', 'my sankalp', 'my sadhana', 'which day am i', 'how many days left', 'progress',
    'मेरा संकल्प', 'मेरे संकल्प', 'संकल्प कितना', 'कौन सा दिन', 'कितने दिन बचे', 'कितने दिन हुए', 'मेरी साधना',
  ],
  slots: [],
  examples: [L('मेरा संकल्प कितना हुआ?', 'How far is my sankalp?')],
  resolve(ctx) {
    const active = ctx.sadhana ?? [];
    if (active.length === 0) return null;
    const s = active[0];
    return {
      intentId: this.id,
      family: 'sadhana',
      tag: L('आपका संकल्प', 'Your sankalp'),
      headline: L(`${s.titleHi} · दिन ${s.dayIndex} / ${s.total}`, `${s.titleEn} · day ${s.dayIndex} of ${s.total}`),
      lines: [
        { label: L('आज', 'Today'), value: s.doneToday ? L('पूर्ण हुआ', 'Done') : L('अभी बाकी', 'Not yet') },
        { label: L('शेष', 'Remaining'), value: L(`${Math.max(0, s.total - s.dayIndex)} दिन`, `${Math.max(0, s.total - s.dayIndex)} days`) },
        ...active.slice(1).map((o) => ({ label: L('साथ में', 'Also'), value: L(`${o.titleHi} · दिन ${o.dayIndex}/${o.total}`, `${o.titleEn} · day ${o.dayIndex}/${o.total}`) })),
      ],
      working: [`SadhanaContext.activeEnrollments (${active.length})`],
      actions: [{ label: L('आज का पाठ', "Today's unit"), target: { tab: 'home', screen: 'SadhanaProgramDetail', params: { programId: s.programId } } }],
      confidence: 'exact',
    };
  },
};

/* ------------------------------------------------------------------ */

export const INTENTS: readonly AskIntent[] = [
  observanceNext,
  vratHow,
  vratFood,
  kathaFind,
  vidhiHow,
  bhogAvoid, // before bhog.offer: "kya nahi chadhaye" contains "chadhaye"
  bhogOffer,
  muhuratEvent,
  muhuratNow,
  vastuDirection,
  japamMantra,
  sadhanaProgress,
  panchangDay,
];

/** Rotating-placeholder / chip examples, one per intent, in registry order. */
export function exampleQuestions(): Localized[] {
  return INTENTS.flatMap((it) => it.examples.slice(0, 1));
}
