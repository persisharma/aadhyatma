/** Full-input parsing for NEW INR entries only. Never migrates saved amounts. */
export type DaanAmount =
  | { kind: 'blank' }
  | { kind: 'invalid' }
  | { kind: 'valid'; value: number; display: string };

export function parseDaanAmount(input: string): DaanAmount {
  // Bound paste work without silently truncating a user's value.
  if (input.length > 128) return { kind: 'invalid' };
  if (!input.trim()) return { kind: 'blank' };
  const text = input.trim().replace(/^₹[ \u00a0]*/, '').replace(/[०-९૦-૯೦-೯]/g, (digit) => {
    const cp = digit.charCodeAt(0);
    const zero = cp >= 0x0ce6 ? 0x0ce6 : cp >= 0x0ae6 ? 0x0ae6 : 0x0966;
    return String(cp - zero);
  });
  // A period is the decimal separator. Commas must be valid Indian or
  // international grouping; never infer decimal-comma or repair punctuation.
  if (!/^(?:[0-9]+|[1-9][0-9]{0,2}(?:,[0-9]{3})+|[1-9][0-9]?(?:,[0-9]{2})+,[0-9]{3})(?:\.[0-9]{1,2})?$/.test(text)) {
    return { kind: 'invalid' };
  }
  const [whole, fraction = ''] = text.replace(/,/g, '').split('.');
  const canonical = `${whole.replace(/^0+(?=\d)/, '')}.${fraction.padEnd(2, '0')}`;
  const value = Number(canonical);
  // Preserve paise across Number storage/JSON/CSV. Reject values too large
  // to represent safely instead of rounding a donation silently.
  if (!Number.isSafeInteger(Number(whole) * 100 + Number(fraction.padEnd(2, '0'))) || value.toFixed(2) !== canonical) {
    return { kind: 'invalid' };
  }
  const [rupees, paise] = canonical.split('.');
  const grouped = rupees.length > 3
    ? `${rupees.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ',')},${rupees.slice(-3)}`
    : rupees;
  return { kind: 'valid', value, display: `₹${grouped}.${paise}` };
}
