import { GRAHA_NAMES_EN, GRAHA_NAMES_HI, GRAHA_ORDER, RASHI_NAMES_EN, RASHI_NAMES_HI, RASHI_NAMES_WESTERN } from './kundali';
import type { Graha } from './kundali';
import { COMBUSTION_ORB_DEG, maitriRow, signLordOf } from './kundaliBasis';
import { grahaInSentenceEn, houseFactor, ruledLabel } from './grahaReading';
import {
  BHAVA_PLAIN,
  FACTOR_REASON,
  GRAHA_BHAVA_READINGS,
  GRAHA_PLAIN,
  GRAHA_READING_REVIEW,
  GRAHA_SECTION_COPY,
  GRAHA_UPAY,
  MANTRA_COUNT,
  RETROGRADE_NOTE,
  SIGN_STRENGTH,
  TONE_LABEL,
  TONE_LINE,
  UPAY_INTRO,
  type Bilingual,
  type GrahaFactorId,
  type SignContext,
} from './grahaReadingContent';
import { BHAVA_ORDINAL_HI, bhavaLabelHi, ordinalEn } from './reportFormat';

/**
 * The jyotishi review sheet for the graha cards (RULEBOOK §14.7.7) — every
 * reviewable string, rendered from the tables so the sheet can never drift
 * from what the app shows. `npm run export:graha-review` writes it to
 * docs/reviews/graha-readings-jyotishi-review.md; an engine test fails when
 * the committed sheet is stale. Not imported by the app.
 */

function cell(text: string): string {
  return text.replace(/\|/g, '\\|');
}

/** A bullet list inside one table cell, as the card shows it. */
function bulletsCell(items: readonly string[]): string {
  return items.map((item) => `• ${cell(item)}`).join('<br>');
}

/** One worked example per strength word: the graha and the sign it is read in. */
export const STRENGTH_SAMPLES: Readonly<Record<keyof typeof SIGN_STRENGTH, { graha: Graha; rashiIndex: number }>> = {
  exalted: { graha: 'jupiter', rashiIndex: 3 },
  own: { graha: 'moon', rashiIndex: 3 },
  debilitated: { graha: 'saturn', rashiIndex: 0 },
  friend: { graha: 'mars', rashiIndex: 4 },
  neutral: { graha: 'moon', rashiIndex: 0 },
  enemy: { graha: 'venus', rashiIndex: 4 },
  node: { graha: 'rahu', rashiIndex: 8 },
};

export function signContextFor(graha: Graha, rashiIndex: number): SignContext {
  const lord = signLordOf(rashiIndex);
  return {
    grahaHi: GRAHA_NAMES_HI[graha],
    grahaEn: grahaInSentenceEn(graha),
    rashiHi: RASHI_NAMES_HI[rashiIndex],
    rashiEn: `${RASHI_NAMES_EN[rashiIndex]} (${RASHI_NAMES_WESTERN[rashiIndex]})`,
    lordHi: GRAHA_NAMES_HI[lord],
    lordEn: grahaInSentenceEn(lord),
  };
}

const REASON_SIGN_SAMPLE: Partial<Record<GrahaFactorId, { graha: Graha; rashiIndex: number }>> = {
  'sign-exalted': STRENGTH_SAMPLES.exalted,
  'sign-own': STRENGTH_SAMPLES.own,
  'sign-friend': STRENGTH_SAMPLES.friend,
  'sign-enemy': STRENGTH_SAMPLES.enemy,
  'sign-debilitated': STRENGTH_SAMPLES.debilitated,
};

/** The house each house reason is sampled in — one that really casts that vote. */
const REASON_HOUSE_SAMPLE: Partial<Record<GrahaFactorId, number>> = {
  'house-digbala': 1,
  'house-benefic-strong': 4,
  'house-malefic-growth': 6,
  'house-benefic-dusthana': 8,
  'house-malefic-hidden': 12,
};

/** The houses each lordship reason is sampled on — a combination that really casts that vote. */
const REASON_RULED_SAMPLE: Partial<Record<GrahaFactorId, readonly number[]>> = {
  'lord-yogakaraka': [4, 9],
  'lord-trikona': [9],
  'lord-demanding': [6, 11],
};

/** A reason bullet as a card would show it, on a fixed sample. */
export function reasonSample(id: GrahaFactorId): Bilingual {
  const sample = REASON_SIGN_SAMPLE[id] ?? { graha: 'jupiter' as const, rashiIndex: 3 };
  const house = REASON_HOUSE_SAMPLE[id] ?? 4;
  const ruled = REASON_RULED_SAMPLE[id] ?? [];
  return FACTOR_REASON[id]({
    ...signContextFor(sample.graha, sample.rashiIndex),
    houseHi: bhavaLabelHi(house),
    houseEn: `${ordinalEn(house)} house`,
    ruledHi: ruled.length > 0 ? ruledLabel(ruled, true) : '',
    ruledEn: ruled.length > 0 ? ruledLabel(ruled, false) : '',
    ruledCount: ruled.length,
    degreesFromSun: 6,
  });
}

/** Which grahas the house rule supports, and which it asks for care, in one house. */
export function houseVotes(house: number): { supports: readonly Graha[]; cautions: readonly Graha[] } {
  return {
    supports: GRAHA_ORDER.filter((graha) => houseFactor(graha, house)?.vote === 'supports'),
    cautions: GRAHA_ORDER.filter((graha) => houseFactor(graha, house)?.vote === 'cautions'),
  };
}

export function namesBoth(grahas: readonly Graha[]): Bilingual {
  if (grahas.length === 0) return { hi: '—', en: '—' };
  return { hi: grahas.map((graha) => GRAHA_NAMES_HI[graha]).join(', '), en: grahas.map((graha) => GRAHA_NAMES_EN[graha]).join(', ') };
}

const FACTOR_ORDER: readonly GrahaFactorId[] = [
  'sign-exalted',
  'sign-own',
  'sign-friend',
  'sign-enemy',
  'sign-debilitated',
  'house-digbala',
  'house-gains',
  'house-benefic-strong',
  'house-malefic-growth',
  'house-benefic-dusthana',
  'house-malefic-hidden',
  'lord-lagna',
  'lord-yogakaraka',
  'lord-trikona',
  'lord-demanding',
  'combust',
];

export function renderGrahaReviewSheet(): string {
  const lines: string[] = [];
  const push = (...rows: string[]) => lines.push(...rows);

  push('# नवग्रह विवेचन — jyotishi review sheet');
  push('');
  push('<!-- Generated by `npm run export:graha-review` from mobile/src/panchang/grahaReadingContent.ts. Do not edit by hand: edit the tables, then regenerate. -->');
  push('');
  push(`**Status:** ${GRAHA_READING_REVIEW.status}${GRAHA_READING_REVIEW.signOffRef ? ` · sign-off ${GRAHA_READING_REVIEW.signOffRef}` : ''}${GRAHA_READING_REVIEW.reviewedOn ? ` · ${GRAHA_READING_REVIEW.reviewedOn}` : ''}`);
  push('');
  push(`**Scope:** ${GRAHA_READING_REVIEW.scope}.`);
  push('');
  push('## How to review');
  push('');
  push('1. Read each graha table. For every house row, tick **OK** or write the correction in **Notes** — wording, classical accuracy, and tone (plain words, no fear, no event or illness, no fate).');
  push('2. Check the upay row for each graha: day, daan, seva, beej mantra and the paath.');
  push('3. Check the label convention in `docs/roadmap/conventions/graha-reading-v1.md` and the reason lines below.');
  push('4. Sign off at the end. The app shows these cards in store builds only after the sign-off reference and date are recorded in `GRAHA_READING_REVIEW`.');
  push('');
  push('Every card is built as: **about this graha (meaning, sign and strength, karaka) → friends and enemies → why the label → what it gives → where to take care → houses it rules for the Lagna → upay**. Each block is a short bullet list, one idea per bullet; a reason reads + when it helps and − when it asks for care.');
  push('');

  push('## Section copy');
  push('');
  push('| Hindi | English | OK | Notes |');
  push('|---|---|---|---|');
  push(`| ${cell(GRAHA_SECTION_COPY.title.hi)} | ${cell(GRAHA_SECTION_COPY.title.en)} | ☐ | |`);
  for (const bullet of GRAHA_SECTION_COPY.body) push(`| • ${cell(bullet.hi)} | • ${cell(bullet.en)} | ☐ | |`);
  push('');

  push('## What each graha stands for');
  push('');
  push('| Graha | Hindi | English | OK | Notes |');
  push('|---|---|---|---|---|');
  for (const graha of GRAHA_ORDER) {
    const plain = GRAHA_PLAIN[graha];
    push(`| ${plain.nameHi} · ${plain.nameEn} | ${cell(plain.meaningHi)} | ${cell(plain.meaningEn)} | ☐ | |`);
  }
  push('');

  push('## Friends and enemies (naisargika maitri)');
  push('');
  push('Every sign has a lord; a graha in a sign works with ease or with effort depending on how it regards that lord. Rahu and Ketu have no classical row and are not graded by sign.');
  push('');
  push('| Graha | मित्र · Friends | सम · Neutral | शत्रु · Enemies | OK | Notes |');
  push('|---|---|---|---|---|---|');
  for (const graha of GRAHA_ORDER) {
    const row = maitriRow(graha);
    if (!row) continue;
    const both = (grahas: readonly Graha[]) => {
      const names = namesBoth(grahas);
      return names.hi === '—' ? '—' : `${names.hi} (${names.en})`;
    };
    push(`| ${GRAHA_NAMES_HI[graha]} · ${GRAHA_NAMES_EN[graha]} | ${both(row.friends)} | ${both(row.neutral)} | ${both(row.enemies)} | ☐ | |`);
  }
  push('');

  push('## What each house covers, its karaka, and who does well there');
  push('');
  push('“Does well / needs care here” is the house vote of the label convention (graha-reading-v1).');
  push('');
  push('| House | Hindi | English | Karaka | Does well here | Needs care here | OK | Notes |');
  push('|---|---|---|---|---|---|---|---|');
  BHAVA_PLAIN.forEach((house, index) => {
    const karaka = namesBoth(house.karakas);
    const votes = houseVotes(index + 1);
    const supports = namesBoth(votes.supports);
    const cautions = namesBoth(votes.cautions);
    push(
      `| ${BHAVA_ORDINAL_HI[index]} · ${ordinalEn(index + 1)} | ${cell(house.hi)} | ${cell(house.en)} | ${karaka.hi} (${karaka.en}) | ${supports.en} | ${cautions.en} | ☐ | |`
    );
  });
  push('');

  push('## Strength words');
  push('');
  push('Each sign bullet names the sign, its lord and the relation; shown here on one worked example each. Retrograde motion is its own bullet and casts no vote; combustion has no separate note because its reason bullet (below) says it.');
  push('');
  push('| Key | Hindi | English | OK | Notes |');
  push('|---|---|---|---|---|');
  for (const key of Object.keys(SIGN_STRENGTH) as (keyof typeof SIGN_STRENGTH)[]) {
    const sample = STRENGTH_SAMPLES[key];
    const phrase = SIGN_STRENGTH[key](signContextFor(sample.graha, sample.rashiIndex));
    push(`| ${key} | ${cell(phrase.hi)} | ${cell(phrase.en)} | ☐ | |`);
  }
  push(`| retrograde | ${cell(RETROGRADE_NOTE.hi)} | ${cell(RETROGRADE_NOTE.en)} | ☐ | |`);
  push('');
  push(`Combustion orbs (degrees from the Sun): ${Object.entries(COMBUSTION_ORB_DEG).map(([graha, orb]) => `${GRAHA_NAMES_EN[graha as keyof typeof GRAHA_NAMES_EN]} ${orb}°`).join(', ')}.`);
  push('');

  push('## Labels and the reasons behind them');
  push('');
  push('| Label | Hindi | English | OK | Notes |');
  push('|---|---|---|---|---|');
  for (const tone of ['supportive', 'mixed', 'care'] as const) {
    push(`| ${tone} | ${cell(`${TONE_LABEL[tone].hi} — ${TONE_LINE[tone].hi}`)} | ${cell(`${TONE_LABEL[tone].en} — ${TONE_LINE[tone].en}`)} | ☐ | |`);
  }
  push(`| mixed, no vote | ${cell(TONE_LINE.quiet.hi)} | ${cell(TONE_LINE.quiet.en)} | ☐ | |`);
  push('');
  push('Reason bullets as they read on a card, each on a sample that really casts it: sign reasons on the worked examples above; house reasons in the 1st (dig-bala), 4th (kind planet), 6th (strict planet), 8th (kind planet) and 12th (strict planet); lordship reasons ruling the 4th and 9th (yogakaraka), the 9th (trikona), and the 6th and 11th (effort); combustion at 6° from the Sun:');
  push('');
  push('| Reason | Hindi | English | OK | Notes |');
  push('|---|---|---|---|---|');
  for (const id of FACTOR_ORDER) {
    const text = reasonSample(id);
    push(`| ${id} | ${cell(text.hi)} | ${cell(text.en)} | ☐ | |`);
  }
  push('');

  for (const graha of GRAHA_ORDER) {
    const plain = GRAHA_PLAIN[graha];
    const upay = GRAHA_UPAY[graha];
    push(`## ${GRAHA_NAMES_HI[graha]} · ${plain.nameEn}`);
    push('');
    push('| House | What it gives (Hindi) | Where to take care (Hindi) | What it gives (English) | Where to take care (English) | OK | Notes |');
    push('|---|---|---|---|---|---|---|');
    GRAHA_BHAVA_READINGS[graha].forEach((reading, index) => {
      push(
        `| ${BHAVA_ORDINAL_HI[index]} · ${ordinalEn(index + 1)} | ${bulletsCell(reading.givesHi)} | ${bulletsCell(reading.careHi)} | ${bulletsCell(reading.givesEn)} | ${bulletsCell(reading.careEn)} | ☐ | |`
      );
    });
    push('');
    push(`**Upay** (shown as “${UPAY_INTRO.keep.en}” on a supportive card, “${UPAY_INTRO.steady.en}” otherwise):`);
    push('');
    push('| Part | Hindi | English | OK | Notes |');
    push('|---|---|---|---|---|');
    push(`| Day | ${upay.vaarHi} | ${upay.vaarEn} | ☐ | |`);
    push(`| Daan | ${cell(upay.daanHi)} | ${cell(upay.daanEn)} | ☐ | |`);
    push(`| Seva | ${cell(upay.sevaHi)} | ${cell(upay.sevaEn)} | ☐ | |`);
    push(`| Mantra | ${upay.mantraHi} — ${MANTRA_COUNT.hi} | ${upay.mantraEn} — ${MANTRA_COUNT.en} | ☐ | |`);
    push(`| Paath | \`${upay.practiceSourceId}\` | \`${upay.practiceSourceId}\` | ☐ | |`);
    push('');
  }

  push('## Open questions for the reviewer');
  push('');
  push('- Rahu and Ketu have no weekday of their own: the draft follows शनिवत् राहु · कुजवत् केतु (Rahu on Saturday, Ketu on Tuesday). Their daan (urad dal and a blanket; a blanket and til) and seva (grain for birds; roti for a dog) are common folk practice — confirm or correct.');
  push('- The cow-fodder seva (gau-gras) sits with Budh on Wednesday, matching the shared vaar-daan table. Some families give it on Friday for Shukra — confirm.');
  push('- The label treats the Moon and Mercury as benefic in every chart (no waxing/waning or association check), and kendra lordship as neutral (no kendradhipati rule). Confirm these simplifications are acceptable for a first version.');
  push('- Combustion uses flat orbs; the retrograde variants for Mercury (12°) and Venus (8°) are not applied.');
  push('- The 2nd house casts no vote for any graha (nor the 3rd for a benefic), so its “does well here” is empty. Classically benefics in the 2nd give wealth and sweet speech and malefics make speech harsh — should the 2nd support benefics and ask malefics for care?');
  push('');
  push('## Sign-off');
  push('');
  push('Record who reviewed outside the repository — no names or contact details go in code or in this sheet.');
  push('');
  push('- Sign-off reference (review page link or ticket id): ____________________');
  push('- Date (YYYY-MM-DD): ____________________');
  push('- Approved as corrected above: ☐ yes ☐ no');
  push('');
  return lines.join('\n');
}
