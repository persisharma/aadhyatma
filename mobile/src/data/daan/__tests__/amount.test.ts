import { parseDaanAmount } from '../amount';
import { buildLedgerCsv, parseLedgerPayload, sanitizeLedgerEntry, type DaanLedgerEntry } from '../ledger';

const accepted: [string, number][] = [
  ['1,000', 1000], ['₹500', 500], ['५००', 500], ['૫૦૦', 500], ['೫೦೦', 500],
  ['₹ १,२३,४५६.७८', 123456.78], ['1,234,567.89', 1234567.89],
  ['1,23,45,678', 12345678], ['0', 0], ['000.10', 0.1], ['0.29', 0.29],
  ['  ₹\u00a0૫૦૦.૫૦  ', 500.5], ['೫,೦೦೦.೯೯', 5000.99],
];
it.each(accepted)('parses complete input %s', (input, value) => {
  expect(parseDaanAmount(input)).toMatchObject({ kind: 'valid', value });
});
it.each(['500abc', '1,00', '1,000,00', '1.000,50', '1 000', '500₹', '₹', '-1', '+1', '1e3', 'Infinity', 'NaN', '1.234', '.50', '500.', '1\n000', '١٢٣', '1，000', '00,123', '9007199254740991', '9'.repeat(129)])('rejects ambiguous/invalid %s', input => {
  expect(parseDaanAmount(input).kind).toBe('invalid');
});
it.each(['', ' ', '\n\t'])('keeps blank optional', input => expect(parseDaanAmount(input).kind).toBe('blank'));
it('displays one unambiguous INR interpretation', () => {
  expect(parseDaanAmount('1234567.8')).toEqual({ kind: 'valid', value: 1234567.8, display: '₹12,34,567.80' });
});
it.each(accepted)('round-trips %s through ledger payload and CSV', (input, value) => {
  const result = parseDaanAmount(input);
  if (result.kind !== 'valid') throw new Error('Expected valid amount');
  const entry: DaanLedgerEntry = { id: 'new', isoDate: '2026-11-18', tithiHi: 'तिथि', tithiEn: 'Tithi', category: 'anna', gupt: false, createdAtMs: 1, amountInr: result.value };
  const restored = parseLedgerPayload(JSON.stringify({ version: 1, entries: [entry] }));
  expect(restored[0].amountInr).toBe(value);
  expect(buildLedgerCsv(restored).split('\n')[1].split(',')).toContain(String(value));
  const gupt = sanitizeLedgerEntry({ ...entry, gupt: true });
  expect(gupt.amountInr).toBeUndefined();
});
it('does not reparse or rewrite historic decimal values', () => {
  const entry = { id: 'old', isoDate: '2026-11-01', tithiHi: '', tithiEn: '', category: 'anna', gupt: false, createdAtMs: 1, amountInr: 1.234 };
  expect(parseLedgerPayload(JSON.stringify({ version: 1, entries: [entry] }))[0]).toEqual(entry);
});
