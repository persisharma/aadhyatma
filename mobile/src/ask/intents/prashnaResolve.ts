/**
 * prashna.purpose — the resolver body, loaded by `intents/index.ts` through a
 * require() thunk so the composer's dependency tree stays off Home's static
 * launch graph (launchGraph budget test). Everything here is pure: the chart is
 * computed from the birth INPUT the UI put in `ctx.kundali` (RULEBOOK §25.4/§25.7).
 */
import { basisLabelEn, basisLabelHi } from '@/panchang/kundaliBasis';
import { computeKundali, type KundaliChart, type KundaliInput } from '@/panchang/kundali';
import { buildPrashnaAnswer, STRENGTH_LABEL_EN, STRENGTH_LABEL_HI } from '@/panchang/prashna';
import { getPurpose, isPurposeId } from '@/panchang/prashnaPurposes';
import type { AskAction, AskAnswer, AskContext, Localized, ResolvedSlots } from '../types';

const L = (hi: string, en: string): Localized => ({ hi, en });

/** One-entry chart memo keyed on the birth input — the same person asks many
 * questions in a session; no wall clock, no storage. */
let chartMemo: { key: string; chart: KundaliChart } | null = null;
function chartFor(input: KundaliInput): KundaliChart {
  const key = `${input.date.getTime()}|${input.latitude}|${input.longitude}|${input.elevation ?? ''}`;
  if (chartMemo?.key !== key) chartMemo = { key, chart: computeKundali(input) };
  return chartMemo.chart;
}

export function resolvePrashna(intentId: string, ctx: AskContext, slots: ResolvedSlots): AskAnswer | null {
  const id = slots.purpose!.id;
  if (!isPurposeId(id)) return null;
  // Abstain without a saved chart (§25.4) — the did-you-mean path then offers
  // the example question, and the Kundali door is one tap away.
  const saved = ctx.kundali;
  if (!saved) return null;
  const purpose = getPurpose(id);
  // The slow-transit scan stays on the screen; the card answers from the
  // natal + dasha passes alone so Ask keeps its latency budget (§13.7).
  const answer = buildPrashnaAnswer(chartFor(saved.input), id, ctx.now, { gocharScanDays: 0 });
  const open: AskAction = { label: L('पूरा उत्तर', 'Full answer'), target: { tab: 'panchang', screen: 'Prashna', params: { purposeId: id } } };
  const who = saved.name ? L(`${saved.name} की कुंडली से`, `From ${saved.name}’s chart`) : L('आपकी कुंडली से', 'From your chart');
  if (answer.gated) {
    return {
      intentId,
      family: 'jyotish',
      tag: L(`प्रश्न · ${purpose.nameHi}`, `Prashna · ${purpose.nameEn}`),
      headline: L(answer.gateReasonHi!, answer.gateReasonEn!),
      sub: who,
      lines: [],
      working: [`buildPrashnaAnswer(${id}) · age ${answer.ageLabelEn} < minAge ${purpose.minAge} → gated (RULEBOOK §14.3.5)`],
      actions: [open],
      confidence: 'exact',
    };
  }
  const first = answer.windows.find((w) => w.current && w.relevant) ?? answer.windows[0];
  return {
    intentId,
    family: 'jyotish',
    tag: L(`प्रश्न · ${purpose.nameHi}`, `Prashna · ${purpose.nameEn}`),
    headline: L(answer.saarTitleHi, answer.saarTitleEn),
    sub: L(`${who.hi} · ${STRENGTH_LABEL_HI[answer.strength!]} संकेत`, `${who.en} · ${STRENGTH_LABEL_EN[answer.strength!]} indication`),
    lines: [
      { label: L('बल', 'Supports'), value: L(`${answer.supportGroups} कारक`, `${answer.supportGroups} factor${answer.supportGroups === 1 ? '' : 's'}`) },
      { label: L('बाधा', 'Resists'), value: L(`${answer.resistGroups} कारक`, `${answer.resistGroups} factor${answer.resistGroups === 1 ? '' : 's'}`), tone: answer.resistGroups > 0 ? 'avoid' : 'neutral' },
      ...(first ? [{ label: L('काल', 'Window'), value: L(`${first.labelHi}${first.current ? ' · अभी' : ''}`, `${first.labelEn}${first.current ? ' · now' : ''}`) }] : []),
    ],
    // The आधार chain of the leading factors IS the working (§25.6 / §14.3.1).
    working: [
      `buildPrashnaAnswer(${id}) · ${answer.supportGroups} support / ${answer.resistGroups} resist groups → ${answer.strength}`,
      ...answer.chains.slice(0, 2).map((chain) => `${chain.labelEn}: ${chain.basis.map((node) => basisLabelEn(node)).join(' → ')}`),
      ...(ctx.lang === 'hi' && answer.chains[0] ? [answer.chains[0].basis.map((node) => basisLabelHi(node)).join(' → ')] : []),
    ],
    actions: [
      open,
      ...(['vyapar', 'yatra', 'vivah'].includes(id) ? [{ label: L('मुहूर्त', 'Muhurat'), target: { tab: 'panchang', screen: 'MuhuratFinder' } } as AskAction] : []),
    ],
    confidence: 'exact',
  };
}
