import { isOlderStoreVersion, storeUpdateDue, STORE_UPDATE_REST_MS } from '../storeUpdate';
const NOW = Date.UTC(2026, 10, 3);
test.each(['1.5.3', '1.5.2', '1.4.9', '0.9.0'])('%s qualifies', version => {
  expect(isOlderStoreVersion(version)).toBe(true);
});
test.each(['1.5.4', '1.5.5', '1.5.10', '1.10.0', '2.0.0', '', 'bad', '1.5', '1.5.4-beta', null, undefined])('%s is silent', version => {
  expect(isOlderStoreVersion(version)).toBe(false);
});
test('new campaign, exact 72-hour boundary and clock rollback', () => {
  expect(storeUpdateDue('1.5.3', null, NOW)).toBe(true);
  expect(storeUpdateDue('1.5.3', JSON.stringify(NOW - STORE_UPDATE_REST_MS + 1), NOW)).toBe(false);
  expect(storeUpdateDue('1.5.3', JSON.stringify(NOW - STORE_UPDATE_REST_MS), NOW)).toBe(true);
  expect(storeUpdateDue('1.5.3', JSON.stringify(NOW + 1), NOW)).toBe(false);
  expect(storeUpdateDue('1.5.4', null, NOW)).toBe(false);
});
test.each(['bad', '{}', 'null', '-1', '"yesterday"'])('corrupt storage %s fails closed', raw => {
  expect(storeUpdateDue('1.5.3', raw, NOW)).toBe(false);
});
