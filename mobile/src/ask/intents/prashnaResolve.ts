/**
 * prashna.purpose — the resolver body, loaded by `intents/index.ts` through a
 * require() thunk so the composer's dependency tree stays off Home's static
 * launch graph (launchGraph budget test). Everything here is pure: the chart is
 * computed from the birth INPUT the UI put in `ctx.kundali` (RULEBOOK §25.4/§25.7).
 */
import { basisLabelEn, basisLabelHi } from '@/panchang/kundaliBasis';
import { computeKundali, type KundaliChart, type KundaliInput } from '@/panchang/kundali';
import { buildPrashnaReading } from '@/panchang/prashnaGuidance';
import { getPurpose, isPurposeId } from '@/panchang/prashnaPurposes';
import { formatIstDateEn, formatIstDateHi } from '@/panchang/reportFormat';
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
  // Skip future ingress scanning; retain today's transits for screen parity.
  const { analysis: answer, guidance, phase } = buildPrashnaReading(chartFor(saved.input), id, ctx.now, { gocharScanDays: 0 });
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
      working: [],
      actions: [open],
      confidence: 'exact',
    };
  }
  if (phase) return {
    intentId, family: 'jyotish', tag: L(`प्रश्न · ${purpose.nameHi}`, `Prashna · ${purpose.nameEn}`),
    headline: phase.title, sub: who,
    lines: [
      { label: L('अभी का समय', 'Current phase'), value: phase.summary },
      { label: L('इस समय दिशा', 'Direction now'), value: phase.directions[0].text },
      ...(phase.currentPeriod ? [{ label: L('चल रही अवधि', 'Running period'), value: L(`${phase.currentPeriod.label.hi} · ${formatIstDateHi(new Date(phase.currentPeriod.end))} तक`, `${phase.currentPeriod.label.en} · until ${formatIstDateEn(new Date(phase.currentPeriod.end))}`) }] : []),
    ],
    working: phase.signals.map(s => ctx.lang === 'hi'
      ? `${s.title.hi}: ${s.basis.map(basisLabelHi).join(' → ')}`
      : `${s.title.en}: ${s.basis.map(basisLabelEn).join(' → ')}`),
    basis: phase.signals.map(s => L(`${s.title.hi}: ${s.basis.map(basisLabelHi).join(' → ')}`, `${s.title.en}: ${s.basis.map(basisLabelEn).join(' → ')}`)),
    actions: [open, ...(id === 'vyapar' ? [{ label: L('मुहूर्त', 'Muhurat'), target: { tab: 'panchang', screen: 'MuhuratFinder' } } as AskAction] : [])], confidence: 'exact',
  };
  const first = answer.windows.find((w) => w.id === guidance!.timing.windowIds[0]);
  return {
    intentId,
    family: 'jyotish',
    tag: L(`प्रश्न · ${purpose.nameHi}`, `Prashna · ${purpose.nameEn}`),
    headline: L(guidance!.title.hi, guidance!.title.en),
    sub: who,
    lines: [
      { label: L('अर्थ', 'Meaning'), value: L(guidance!.summary.hi, guidance!.summary.en) },
      { label: L('अगला कदम', 'Next step'), value: L(guidance!.actions[0].text.hi, guidance!.actions[0].text.en) },
      ...(first && guidance!.timing.status === 'relevant' ? [{ label: L('अवधि', 'Window'), value: L(`${first.labelHi} · अनुकूलता की पुष्टि नहीं`, `${first.labelEn} · relevance, not confirmed favourability`) }] : []),
    ],
    // The आधार chain of the leading factors IS the working (§25.6 / §14.3.1).
    working: answer.chains.slice(0, 2).map(chain => ctx.lang === 'hi'
      ? `${chain.labelHi}: ${chain.basis.map(basisLabelHi).join(' → ')}`
      : `${chain.labelEn}: ${chain.basis.map(basisLabelEn).join(' → ')}`),
    basis: answer.chains.slice(0, 2).map(chain => L(`${chain.labelHi}: ${chain.basis.map(basisLabelHi).join(' → ')}`, `${chain.labelEn}: ${chain.basis.map(basisLabelEn).join(' → ')}`)),
    actions: [
      open,
      ...(['vyapar', 'yatra', 'vivah'].includes(id) ? [{ label: L('मुहूर्त', 'Muhurat'), target: { tab: 'panchang', screen: 'MuhuratFinder' } } as AskAction] : []),
    ],
    confidence: 'exact',
  };
}
