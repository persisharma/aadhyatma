/**
 * Town / village / pincode BIRTH places (Nov 2026).
 *
 * The report: North Lakhimpur (Assam, 787001) could be set as the Panchang location
 * but not as a Kundali birth place, because the birth-city sheet searched only the
 * 394 bundled cities and a profile could only hold a bundled city id. These pin the
 * shared search both pickers now use and the self-describing `pin-` birth place.
 */
import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  birthCity,
  birthPlaceFromPincode,
  birthProfileToInput,
  normalizeBirthProfile,
  parseStoredRoster,
  serializeRoster,
  validateBirthProfile,
  type BirthProfile,
} from '../birthProfiles';
import { getCityById } from '../locations';
import { buildLocationSearchRows, labelIsPlace, type LocationSearchRow } from '../locationSearch';
import { lookupPincode, parsePincodePlaceRecord, searchPlaces } from '../pincodes';

function placeRows(rows: LocationSearchRow[]) {
  return rows.flatMap((row) => (row.kind === 'place' ? [row.place] : []));
}

function northLakhimpur() {
  const match = searchPlaces('North Lakhimpur').find((place) => place.name === 'North Lakhimpur');
  assert.ok(match, 'North Lakhimpur is in the post-office directory');
  return match;
}

test('the shared search finds North Lakhimpur as a town, under its own header', () => {
  const rows = buildLocationSearchRows('North Lakhimpur');
  const header = rows.findIndex((row) => row.kind === 'header' && row.id === 'h-places');
  const place = rows.findIndex((row) => row.kind === 'place' && row.place.name === 'North Lakhimpur');
  assert.ok(header >= 0 && place > header);
  const [first] = placeRows(rows);
  assert.equal(first.name, 'North Lakhimpur');
  assert.equal(first.kind, 'head');
  assert.equal(first.entry.pincode, '787001');
  assert.equal(first.entry.stateEn, 'Assam');
});

test('the shared search: exact pincode, the bare district name, and the no-match line', () => {
  const pin = buildLocationSearchRows('787001');
  assert.deepEqual(pin.map((row) => row.kind), ['header', 'pincode']);
  assert.equal(lookupPincode('787001')?.districtEn, 'Lakhimpur');

  // "Lakhimpur" alone also reaches the Assam town (and Lakhimpur Kheri's).
  assert.ok(placeRows(buildLocationSearchRows('Lakhimpur')).some((place) => place.entry.pincode === '787001'));

  // An abbreviation is not a spelling variant — the user is told, not shown nothing.
  assert.deepEqual(buildLocationSearchRows('N Lakhimpur').map((row) => row.kind), ['no-match']);
  assert.deepEqual(buildLocationSearchRows('999999').map((row) => row.kind), ['pincode-missing']);
});

test('the shared search keeps the bilingual city row and drops its same-named post office', () => {
  const rows = buildLocationSearchRows('Ujjain');
  assert.ok(rows.some((row) => row.kind === 'city' && row.city.id === 'ujjain'));
  assert.ok(!placeRows(rows).some((place) => place.name.toLowerCase() === 'ujjain'));
  // An empty query is the browsable city list both sheets open on — no towns, no message.
  const empty = buildLocationSearchRows('');
  assert.ok(empty.every((row) => row.kind === 'city' || row.kind === 'header'));
});

test('a picked town becomes a pin- id plus a self-describing place', () => {
  const place = northLakhimpur();
  const picked = birthPlaceFromPincode(place.entry, place.name);
  assert.equal(picked.cityId, 'pin-787001');
  assert.equal(picked.place.labelEn, 'North Lakhimpur · 787001, Assam');
  assert.equal(picked.place.labelHi, '७८७००१ · असम');
  assert.equal(picked.place.latitude, place.entry.latitude);
  assert.equal(picked.place.longitude, place.entry.longitude);
  assert.ok(labelIsPlace(picked.place.labelEn, 'North Lakhimpur'));
  assert.ok(!labelIsPlace(picked.place.labelEn, 'North'));

  // A bare pincode pick labels by district, like the Panchang picker.
  const bare = birthPlaceFromPincode(place.entry);
  assert.equal(bare.place.labelEn, '787001 · Lakhimpur, Assam');
});

test('a pin- birth profile validates, and the chart is cast at the town, not at Guwahati', () => {
  const place = northLakhimpur();
  const profile: BirthProfile = { date: '1990-03-12', time: '06:15', ...birthPlaceFromPincode(place.entry, place.name) };
  assert.deepEqual(validateBirthProfile(profile), {});

  const input = birthProfileToInput(profile);
  assert.equal(input.latitude, place.entry.latitude);
  assert.equal(input.longitude, place.entry.longitude);
  assert.equal(input.elevation, place.entry.elevation);
  const guwahati = getCityById('guwahati')!;
  assert.ok(Math.abs(input.longitude - guwahati.longitude) > 2, 'more than two degrees east of the nearest listed city');

  const city = birthCity(profile)!;
  assert.equal(city.id, 'pin-787001');
  assert.equal(city.nameEn, 'North Lakhimpur · 787001, Assam');
  assert.equal(city.nameHi, '७८७००१ · असम');
});

test('a pin- id without a valid place is "choose a city", never a crash', () => {
  assert.equal(validateBirthProfile({ date: '1990-03-12', time: '06:15', cityId: 'pin-787001' }).cityId, 'Choose an Indian city');
  const outside = { labelHi: 'x', labelEn: 'x', latitude: 51.5, longitude: -0.12, elevation: 11 };
  assert.equal(
    validateBirthProfile({ date: '1990-03-12', time: '06:15', cityId: 'pin-787001', place: outside }).cityId,
    'Choose an Indian city'
  );
  assert.equal(parsePincodePlaceRecord({ labelHi: '', labelEn: 'a', latitude: 27, longitude: 94, elevation: 90 }), null);
  assert.equal(parsePincodePlaceRecord({ labelHi: 'a', labelEn: 'a', latitude: '27', longitude: 94, elevation: 90 }), null);
});

test('a bundled city ignores and sheds a stale place record', () => {
  const place = northLakhimpur();
  const stale: BirthProfile = {
    date: '1990-03-12',
    time: '06:15',
    cityId: 'ujjain',
    place: birthPlaceFromPincode(place.entry, place.name).place,
  };
  assert.equal(birthCity(stale)?.id, 'ujjain');
  assert.equal(birthProfileToInput(stale).latitude, getCityById('ujjain')!.latitude);
  assert.equal('place' in normalizeBirthProfile(stale), false);
});

test('a town place survives the roster round trip; a malformed one drops only that person', () => {
  const place = northLakhimpur();
  const town = { id: 'p-town', date: '1990-03-12', time: '06:15', ...birthPlaceFromPincode(place.entry, place.name) };
  const city = { id: 'p-city', date: '1992-01-01', time: '08:00', cityId: 'ujjain' };
  const raw = serializeRoster({ activeId: 'p-town', people: [town, city] });
  const parsed = parseStoredRoster(raw);
  assert.equal(parsed.unreadable, false);
  assert.equal(parsed.droppedInvalid, false);
  assert.deepEqual(parsed.roster.people[0], town);
  assert.equal(parsed.roster.activeId, 'p-town');

  const broken = JSON.parse(raw);
  broken.people[0].place.latitude = 'not a number';
  const repaired = parseStoredRoster(JSON.stringify(broken));
  assert.equal(repaired.droppedInvalid, true);
  assert.deepEqual(repaired.roster.people.map((person) => person.id), ['p-city']);
});
