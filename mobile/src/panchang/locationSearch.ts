/**
 * The ONE location search behind every place picker: the Panchang location sheet
 * (`LocationPickerModal`) and the Kundali birth-place sheet (`KundaliScreen`).
 *
 * WHY SHARED. Until Nov 2026 the two pickers were in lockstep only through
 * `cityMatchesQuery`; the pincode tier (Aug 2026) and the 165k town/village names
 * (Oct 2026) were wired into the Panchang sheet alone, so a user born in North
 * Lakhimpur could set it as their Panchang location but not as their birth place.
 * Building the rows here means the next tier lands in both sheets or neither.
 *
 * Pure over the bundled list and the lazy pincode tables — no React, no storage. The
 * tables load on the first pincode or place-name query; callers warm them when their
 * sheet opens (`warmPincodeTable`/`warmPlaceIndex`) so that first query is instant.
 */
import { CITIES, cityMatchesQuery, type City } from './locations';
import {
  isPincodeQuery,
  isPlaceQuery,
  lookupPincode,
  placesForPincode,
  searchPlaces,
  type PincodeEntry,
  type PlaceMatch,
} from './pincodes';

export type LocationSearchRow =
  | { kind: 'header'; id: string; hi: string; en: string }
  | { kind: 'city'; city: City }
  | { kind: 'pincode'; entry: PincodeEntry }
  | { kind: 'pincode-missing'; query: string }
  | { kind: 'place'; place: PlaceMatch }
  | { kind: 'no-match'; query: string };

/** A town office within this distance of a same-named listed city IS that city. */
const SAME_PLACE_KM = 25;

function sameNamedCityNearby(place: PlaceMatch, cities: City[]): boolean {
  const name = place.name.toLowerCase();
  return cities.some((city) => {
    if (city.nameEn.toLowerCase() !== name) return false;
    const cosLat = Math.cos((city.latitude * Math.PI) / 180);
    const dLat = city.latitude - place.entry.latitude;
    const dLng = (city.longitude - place.entry.longitude) * cosLat;
    return Math.sqrt(dLat * dLat + dLng * dLng) * 111.2 <= SAME_PLACE_KM;
  });
}

/**
 * Rows for a query, in display order: an exact 6-digit pincode short-circuits to its one
 * row (or a not-found line); otherwise listed cities, then Rajasthan tehsils, then towns
 * and villages, then a no-match line when all three are empty. An empty query lists every
 * bundled city — the browsable default both sheets open on.
 */
export function buildLocationSearchRows(query: string): LocationSearchRow[] {
  const trimmed = query.trim();
  if (isPincodeQuery(trimmed)) {
    const entry = lookupPincode(trimmed);
    return entry
      ? [
          { kind: 'header', id: 'h-pincode', hi: 'पिनकोड', en: 'Pincode' },
          { kind: 'pincode', entry },
        ]
      : [{ kind: 'pincode-missing', query: trimmed }];
  }
  const matches = CITIES.filter((city) => cityMatchesQuery(city, query));
  const cities = matches.filter((city) => !city.districtEn);
  const tehsils = matches.filter((city) => city.districtEn);
  // A town office that is a listed city (Pokaran S.O beside the Pokaran tehsil) would
  // only repeat it in Latin; the bilingual city row is the better answer.
  const places = isPlaceQuery(trimmed)
    ? searchPlaces(trimmed).filter((place) => !sameNamedCityNearby(place, matches))
    : [];
  const out: LocationSearchRow[] = [];
  if (cities.length > 0) {
    out.push({ kind: 'header', id: 'h-cities', hi: 'प्रमुख शहर', en: 'Major cities' });
    out.push(...cities.map((city) => ({ kind: 'city' as const, city })));
  }
  if (tehsils.length > 0) {
    out.push({ kind: 'header', id: 'h-tehsils', hi: 'राजस्थान · तहसील', en: 'Rajasthan · tehsils' });
    out.push(...tehsils.map((city) => ({ kind: 'city' as const, city })));
  }
  if (places.length > 0) {
    out.push({ kind: 'header', id: 'h-places', hi: 'कस्बे व गाँव', en: 'Towns & villages' });
    out.push(...places.map((place) => ({ kind: 'place' as const, place })));
  }
  if (out.length === 0 && trimmed.length > 0) out.push({ kind: 'no-match', query: trimmed });
  return out;
}

/** Stable FlatList key for a row. */
export function locationSearchRowKey(row: LocationSearchRow): string {
  if (row.kind === 'header') return row.id;
  if (row.kind === 'pincode') return `pin-${row.entry.pincode}`;
  if (row.kind === 'pincode-missing') return `missing-${row.query}`;
  if (row.kind === 'place') return `place-${row.place.entry.pincode}-${row.place.name}`;
  if (row.kind === 'no-match') return `no-match-${row.query}`;
  return row.city.id;
}

/** "Kolhapur RS, Shahupuri +11" — what a bare pincode actually covers. */
export function placesSummary(pincode: string): string {
  const places = placesForPincode(pincode);
  if (places.length === 0) return '';
  const shown = places.slice(0, 3).join(', ');
  return places.length > 3 ? `${shown} +${places.length - 3}` : shown;
}

/**
 * Whether a stored English label is the one a picked PLACE row writes (`toPincodeLocation`
 * puts the office name first): two offices share one `pin-` id, so the id alone cannot
 * say which of them the user picked.
 */
export function labelIsPlace(labelEn: string | undefined, placeName: string): boolean {
  return labelEn?.startsWith(`${placeName} · `) ?? false;
}
