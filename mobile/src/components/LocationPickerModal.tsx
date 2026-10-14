import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  InteractionManager,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import { usePanchangLocation } from '@/contexts/PanchangLocationContext';
import { CITIES, cityMatchesQuery, type City } from '@/panchang/locations';
import {
  isPincodeQuery,
  isPlaceQuery,
  lookupPincode,
  pincodeCityId,
  placesForPincode,
  searchPlaces,
  toDevanagariDigits,
  warmPincodeTable,
  warmPlaceIndex,
  type PincodeEntry,
  type PlaceMatch,
} from '@/panchang/pincodes';
import { captionFont } from '@/utils/scriptFont';
import { contentByLang, meaningByLang } from '@/utils/localize';
import { scriptTitleFont, scriptBodyFont } from '@/utils/langType';

type Row =
  | { kind: 'header'; id: string; hi: string; en: string }
  | { kind: 'city'; city: City }
  | { kind: 'pincode'; entry: PincodeEntry }
  | { kind: 'pincode-missing'; query: string }
  | { kind: 'place'; place: PlaceMatch }
  | { kind: 'no-match'; query: string };

/** A town office within this distance of a same-named listed city IS that city. */
const SAME_PLACE_KM = 25;

const DEVANAGARI = /[\u0900-\u097F]/;

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

/** "Kolhapur RS, Shahupuri +11" — what a bare pincode actually covers. */
function placesSummary(pincode: string): string {
  const places = placesForPincode(pincode);
  if (places.length === 0) return '';
  const shown = places.slice(0, 3).join(', ');
  return places.length > 3 ? `${shown} +${places.length - 3}` : shown;
}

/**
 * City/village/pincode/GPS picker for the panchang reference location.
 *
 * FOUR WAYS IN:
 *   - GPS, which snaps to the nearest pincode centroid (see `pincodes.ts`);
 *   - a 6-digit pincode typed into the search box, resolved exactly;
 *   - a town or village name (3+ Latin letters), matched against India Post's ~165k
 *     post offices and listed under the city tiers as "Towns & villages";
 *   - the browsable `CITIES` list.
 *
 * `CITIES` is two tiers — nationwide cities, then Rajasthan tehsils — and the tehsils
 * outnumber the cities several times over, so the list is split under two group
 * headers rather than rendered as one flat 390-row scroll. A tehsil is identified by
 * carrying a `districtEn`.
 *
 * The 19.6k pincodes and their offices are deliberately NOT browsable rows: they have no
 * Devanagari place names (see `pincodes.ts`), and nobody scrolls 165k rows. They surface
 * only when the query is a pincode or a place name, which is also what keeps their 2.5 MB
 * off the launch path — they load when this sheet opens, not when the app starts.
 */
export default function LocationPickerModal({ visible, onClose }: {
  visible: boolean;
  onClose: () => void;
}) {
  const { colors, typography, spacing, radii } = useTheme();
  const { lang } = useGitaLanguage();
  const { location, gpsStatus, selectCity, selectPincode, requestDeviceLocation } = usePanchangLocation();
  const [query, setQuery] = useState('');

  // Parse both tables once the sheet is actually open, so the first pincode or place
  // name typed resolves instantly instead of paying for the load mid-keystroke.
  useEffect(() => {
    if (!visible) return;
    const handle = InteractionManager.runAfterInteractions(() => {
      warmPincodeTable();
      warmPlaceIndex();
    });
    return () => handle.cancel();
  }, [visible]);

  const rows = useMemo<Row[]>(() => {
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
    const out: Row[] = [];
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
  }, [query]);

  const onUseMyLocation = async () => {
    const result = await requestDeviceLocation();
    if (result === 'granted') onClose();
  };

  const onPickCity = (city: City) => {
    selectCity(city.id);
    onClose();
  };

  const onPickPincode = (entry: PincodeEntry) => {
    if (selectPincode(entry.pincode)) onClose();
  };

  const onPickPlace = (place: PlaceMatch) => {
    if (selectPincode(place.entry.pincode, place.name)) onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.root, { backgroundColor: colors.parchment }]}>
        <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
          <View style={[styles.header, { borderBottomColor: colors.divider }]}>
            <Text style={[styles.title, { color: colors.ink, fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily) }]}>
              {contentByLang(lang, 'स्थान चुनें', 'Choose location')}
            </Text>
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel={contentByLang(lang, 'बंद करें', 'Close')}
              hitSlop={16}
              style={({ pressed }) => [styles.close, pressed && { opacity: 0.7 }]}
            >
              <Text style={[styles.closeGlyph, { color: colors.saffron }]}>✕</Text>
            </Pressable>
          </View>

          <View style={{ paddingHorizontal: spacing.xxl, paddingTop: spacing.lg, gap: 10 }}>
            <Pressable
              onPress={onUseMyLocation}
              disabled={gpsStatus === 'locating'}
              accessibilityRole="button"
              accessibilityLabel={contentByLang(lang, 'मेरा स्थान उपयोग करें', 'Use my location')}
              style={({ pressed }) => [
                styles.gpsRow,
                { borderColor: colors.divider, backgroundColor: colors.parchmentSoft, borderRadius: radii.md },
                pressed && { opacity: 0.7 },
              ]}
            >
              {gpsStatus === 'locating'
                ? <ActivityIndicator size="small" color={colors.saffron} />
                : <Text style={{ fontSize: 14 }}>📍</Text>}
              <Text style={{ fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily), fontSize: 15, color: colors.saffronDeep }}>
                {contentByLang(lang, 'मेरा स्थान उपयोग करें', 'Use my location')}
              </Text>
            </Pressable>
            {gpsStatus === 'denied' && (
              <Text style={{ fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily), fontSize: 12, lineHeight: 18, color: colors.inkMuted }}>
                {meaningByLang(
                  lang,
                  'स्थान की अनुमति नहीं मिली — नीचे अपना शहर या गाँव खोजें।',
                  'Location permission was denied — search for your town or village below.'
                )}
              </Text>
            )}
            {gpsStatus === 'error' && (
              <Text style={{ fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily), fontSize: 12, lineHeight: 18, color: colors.inkMuted }}>
                {meaningByLang(
                  lang,
                  'स्थान प्राप्त नहीं हो सका — नीचे अपना शहर या गाँव खोजें।',
                  'Could not get your location — search for your town or village below.'
                )}
              </Text>
            )}
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder={contentByLang(lang, 'शहर, गाँव या पिनकोड खोजें…', 'Search city, village or pincode…')}
              placeholderTextColor={colors.inkMuted}
              accessibilityLabel={contentByLang(lang, 'शहर, गाँव या पिनकोड खोजें', 'Search city, village or pincode')}
              style={[
                styles.search,
                {
                  borderColor: colors.divider,
                  backgroundColor: colors.parchmentSoft,
                  borderRadius: radii.md,
                  color: colors.ink,
                  fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily),
                },
              ]}
            />
            <Text style={{ fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily), fontSize: 11, color: colors.inkMuted }}>
              {meaningByLang(
                lang,
                'कोई भी शहर, कस्बा, गाँव (अंग्रेज़ी अक्षरों में) या पिनकोड लिखें — सूर्योदय व तिथि की गणना इसी स्थान के लिए होगी।',
                'Type any town, village or Indian pincode — sunrise and tithi are computed for this place.'
              )}
            </Text>
          </View>

          <FlatList
            data={rows}
            keyExtractor={(row) => {
              if (row.kind === 'header') return row.id;
              if (row.kind === 'pincode') return `pin-${row.entry.pincode}`;
              if (row.kind === 'pincode-missing') return `missing-${row.query}`;
              if (row.kind === 'place') return `place-${row.place.entry.pincode}-${row.place.name}`;
              if (row.kind === 'no-match') return `no-match-${row.query}`;
              return row.city.id;
            }}
            contentContainerStyle={{ paddingHorizontal: spacing.xxl, paddingVertical: spacing.lg }}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item: row }) => {
              if (row.kind === 'pincode-missing') {
                return (
                  <Text style={{ fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily), fontSize: 12, lineHeight: 18, color: colors.inkMuted }}>
                    {meaningByLang(
                      lang,
                      `पिनकोड ${toDevanagariDigits(row.query)} नहीं मिला — कृपया जाँचें, या सूची से निकटतम शहर चुनें।`,
                      `Pincode ${row.query} was not found — check the digits, or pick the nearest city from the list.`
                    )}
                  </Text>
                );
              }
              if (row.kind === 'no-match') {
                // The directory is Latin-only, so a Devanagari query that found no city
                // is told exactly that rather than left looking at an empty sheet.
                const devanagari = DEVANAGARI.test(row.query);
                return (
                  <Text style={{ fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily), fontSize: 12, lineHeight: 18, color: colors.inkMuted }}>
                    {devanagari
                      ? meaningByLang(
                          lang,
                          'कस्बों व गाँवों के नाम अंग्रेज़ी अक्षरों में खोजें (जैसे “Shahupuri”), या पिनकोड लिखें।',
                          'Search towns and villages in English letters (e.g. “Shahupuri”), or type the pincode.'
                        )
                      : meaningByLang(
                          lang,
                          'यह स्थान नहीं मिला — वर्तनी जाँचें, निकट का कस्बा खोजें, या पिनकोड लिखें।',
                          'No place found — check the spelling, try a nearby town, or type the pincode.'
                        )}
                  </Text>
                );
              }
              if (row.kind === 'place') {
                const { place } = row;
                const { entry } = place;
                const selected =
                  location.cityId === pincodeCityId(entry.pincode) && location.labelEn.startsWith(`${place.name} · `);
                // Title line is Latin in every language (the directory has no Devanagari
                // names); the caption carries the Hindi — pincode digits and state.
                const title = `${place.name} · ${entry.districtEn}`;
                return (
                  <Pressable
                    onPress={() => onPickPlace(place)}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    accessibilityLabel={`${place.name}, ${entry.districtEn}, ${entry.stateEn}, pincode ${entry.pincode}${selected ? ', selected' : ''}`}
                    style={({ pressed }) => [
                      styles.cityRow,
                      { borderBottomColor: colors.divider },
                      pressed && { opacity: 0.7 },
                    ]}
                  >
                    <View style={{ flex: 1 }}>
                      <Text
                        numberOfLines={1}
                        style={{ fontFamily: typography.readerTitle.fontFamily, fontSize: 15, color: colors.ink }}
                      >
                        {title}
                      </Text>
                      <Text style={{ fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily), fontSize: 11, lineHeight: 16, color: colors.inkMuted }}>
                        {contentByLang(lang, `${toDevanagariDigits(entry.pincode)} · ${entry.stateHi}`, `${entry.pincode} · ${entry.stateEn}`)}
                      </Text>
                    </View>
                    {selected && <Text style={{ fontSize: 15, color: colors.saffronDeep }}>✓</Text>}
                  </Pressable>
                );
              }
              if (row.kind === 'pincode') {
                const { entry } = row;
                const selected = location.cityId === pincodeCityId(entry.pincode);
                // District, then the offices the code serves — "Kamrup Metro · Guwahati GPO,
                // Fancy Bazar, Uzanbazar" — because the district alone is often not the name
                // a user knows. Latin in every language: neither source dataset has
                // Devanagari place names, and guessing the spelling would be worse.
                const served = placesSummary(entry.pincode);
                const place = served ? `${entry.districtEn} · ${served}` : entry.districtEn;
                return (
                  <Pressable
                    onPress={() => onPickPincode(entry)}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    accessibilityLabel={`Pincode ${entry.pincode}, ${place}, ${entry.stateEn}${selected ? ', selected' : ''}`}
                    style={({ pressed }) => [
                      styles.cityRow,
                      { borderBottomColor: colors.divider },
                      pressed && { opacity: 0.7 },
                    ]}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily), fontSize: 15, color: colors.ink }}>
                        {contentByLang(lang, `${toDevanagariDigits(entry.pincode)} · ${entry.stateHi}`, `${entry.pincode} · ${entry.stateEn}`)}
                      </Text>
                      <Text style={{ ...captionFont(place), fontSize: 11, color: colors.inkMuted }}>
                        {place}
                      </Text>
                    </View>
                    {selected && <Text style={{ fontSize: 15, color: colors.saffronDeep }}>✓</Text>}
                  </Pressable>
                );
              }
              if (row.kind === 'header') {
                return (
                  <Text
                    style={[
                      styles.groupHeader,
                      {
                        color: colors.inkMuted,
                        fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily),
                      },
                    ]}
                  >
                    {contentByLang(lang, row.hi, row.en)}
                  </Text>
                );
              }
              const { city } = row;
              const selected = city.id === location.cityId;
              // Both halves of the title are in the same language, so one script font
              // covers them; the caption line stays single-script for the same reason.
              const district = contentByLang(lang, city.districtHi ?? '', city.districtEn ?? '');
              return (
                <Pressable
                  onPress={() => onPickCity(city)}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  accessibilityLabel={`${city.nameEn}${city.districtEn ? `, ${city.districtEn} district` : ''}${selected ? ', selected' : ''}`}
                  style={({ pressed }) => [
                    styles.cityRow,
                    { borderBottomColor: colors.divider },
                    pressed && { opacity: 0.7 },
                  ]}
                >
                  <View style={{ flex: 1 }}>
                    <View style={styles.titleLine}>
                      <Text style={{ fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily), fontSize: 15, color: colors.ink }}>
                        {contentByLang(lang, city.nameHi, city.nameEn)}
                      </Text>
                      {district !== '' && (
                        <Text
                          numberOfLines={1}
                          style={{ flexShrink: 1, fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily), fontSize: 12, lineHeight: 18, color: colors.inkMuted }}
                        >
                          {`· ${district}`}
                        </Text>
                      )}
                    </View>
                    <Text style={{ ...captionFont(lang === 'en' ? city.nameHi : city.nameEn), fontSize: 11, color: colors.inkMuted }}>
                      {lang === 'en' ? city.nameHi : city.nameEn}
                    </Text>
                  </View>
                  {selected && (
                    <Text style={{ fontSize: 15, color: colors.saffronDeep }}>✓</Text>
                  )}
                </Pressable>
              );
            }}
          />
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    includeFontPadding: false,
  },
  close: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeGlyph: {
    fontSize: 20,
    fontWeight: '600',
  },
  gpsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    paddingHorizontal: 14,
    minHeight: 48,
  },
  search: {
    borderWidth: 1,
    paddingHorizontal: 14,
    minHeight: 44,
    fontSize: 14,
  },
  cityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    minHeight: 52,
  },
  titleLine: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 5,
  },
  groupHeader: {
    fontSize: 12,
    lineHeight: 18,
    letterSpacing: 0.4,
    paddingTop: 14,
    paddingBottom: 4,
    includeFontPadding: false,
  },
});
