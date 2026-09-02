import {
  GRAHA_NAMES_EN,
  GRAHA_NAMES_HI,
  RASHI_NAMES_EN,
  RASHI_NAMES_HI,
  RASHI_NAMES_WESTERN,
  indiaDateKey,
} from './kundali';
import type { KundaliChart } from './kundali';
import { NAKSHATRA_NAMES_EN, NAKSHATRA_NAMES_HI } from './names';
import type { KundaliReportModel } from './kundaliReportModel';

/**
 * Full-text report handoff — PRD-20.
 *
 * Renders the compiled report plus the raw chart data as ONE plain-text
 * document the user can paste into notes or any AI assistant of their
 * choice. Pure and offline: the app never contacts a service — the user
 * hands the text over themselves through the OS share sheet, behind the
 * same birth-details warning as the Kundali image share (RULEBOOK §14.5).
 * The machine-readable tail is the serializable `KundaliReportModel`, the
 * designed AI grounding object (PRD-20 §5).
 */

function degreesLabel(value: number): string {
  const degrees = Math.floor(value);
  const minutes = Math.round((value - degrees) * 60);
  return `${degrees}°${String(minutes).padStart(2, '0')}′`;
}

function grahaTable(chart: KundaliChart): string {
  const rows = chart.grahas.map((position) => {
    const rashi = `${RASHI_NAMES_EN[position.rashiIndex]} (${RASHI_NAMES_HI[position.rashiIndex]} · ${RASHI_NAMES_WESTERN[position.rashiIndex]})`;
    const nakshatra = `${NAKSHATRA_NAMES_EN[position.nakshatraIndex]} (${NAKSHATRA_NAMES_HI[position.nakshatraIndex]}) pada ${position.pada}`;
    return `- ${GRAHA_NAMES_EN[position.graha]} (${GRAHA_NAMES_HI[position.graha]}): ${rashi} ${degreesLabel(position.degreeInRashi)}, ${nakshatra}, house ${position.house}${position.retrograde ? ', retrograde' : ''}`;
  });
  return rows.join('\n');
}

function vimshottariTable(chart: KundaliChart): string {
  return chart.vimshottari
    .map(
      (period) =>
        `- ${GRAHA_NAMES_EN[period.lord]} Mahadasha: ${indiaDateKey(period.start)} → ${indiaDateKey(period.end)}`
    )
    .join('\n');
}

/**
 * The complete report + chart export. Contains every birth detail the
 * report screen shows — callers MUST present the birth-details warning
 * before handing this to the OS share sheet.
 */
export function buildKundaliHandoffText(
  chart: KundaliChart,
  model: KundaliReportModel
): string {
  const lines: string[] = [];
  lines.push('# Janma Kundali — full reading export (Vedansh)');
  lines.push('');
  lines.push(
    'Context for any reader (human or AI assistant): this is a complete Vedic astrology (Jyotish) chart export — sidereal Lahiri/Chitrapaksha ayanamsa, whole-sign houses, Vimshottari dasha. The interpretation sections are structural, tradition-framed guidance, not predictions.'
  );
  lines.push('');
  lines.push('## Birth details');
  if (model.name) lines.push(`- Name: ${model.name}`);
  lines.push(`- Birth date: ${model.birthDateLabelEn} (${model.birthDateLabelHi})`);
  if (model.birthTimeLabel) lines.push(`- Birth time: ${model.birthTimeLabel} IST`);
  lines.push(`- Birth place: ${model.cityNameEn} (${model.cityNameHi}), India`);
  lines.push(`- Generated for India civil date: ${model.generatedDateKey}`);
  lines.push('');
  lines.push('## Chart data (sidereal, Lahiri ayanamsa, whole-sign houses)');
  lines.push(`- Ayanamsa: ${chart.ayanamsa.toFixed(4)}°`);
  lines.push(
    `- Lagna (ascendant): ${RASHI_NAMES_EN[chart.lagnaRashiIndex]} (${RASHI_NAMES_HI[chart.lagnaRashiIndex]} · ${RASHI_NAMES_WESTERN[chart.lagnaRashiIndex]} rising), ${degreesLabel(chart.lagnaLongitude % 30)} in sign`
  );
  lines.push(grahaTable(chart));
  lines.push('');
  lines.push('## Vimshottari Mahadasha table (dates are India civil days)');
  lines.push(vimshottariTable(chart));
  lines.push('');
  for (const section of model.sections) {
    lines.push(`## ${section.titleEn} (${section.titleHi})`);
    for (const fact of section.facts) {
      lines.push(`- ${fact.labelEn}: ${fact.valueEn}`);
    }
    if (section.facts.length > 0) lines.push('');
    for (const paragraph of section.bodyEn) {
      lines.push(paragraph);
      lines.push('');
    }
  }
  lines.push('## Disclaimer');
  lines.push(model.disclaimerEn);
  lines.push(model.disclaimerHi);
  lines.push('');
  lines.push('## Machine-readable report model (JSON)');
  lines.push('```json');
  lines.push(JSON.stringify(model));
  lines.push('```');
  return lines.join('\n');
}
