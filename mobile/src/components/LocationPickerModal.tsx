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
  lookupPincode,
  pincodeCityId,
  toDevanagariDigits,
  warmPincodeTable,
  type PincodeEntry,
} from '@/panchang/pincodes';
import { captionFont } from '@/utils/scriptFont';
import { contentByLang, meaningByLang } from '@/utils/localize';
import { scriptTitleFont, scriptBodyFont } from '@/utils/langType';

type Row =
  | { kind: 'header'; id: string; hi: string; en: string }
  | { kind: 'city'; city: City }
  | { kind: 'pincode'; entry: PincodeEntry }
  | { kind: 'pincode-missing'; query: string };

/**
 * City/pincode/GPS picker for the panchang reference location.
 *
 * THREE WAYS IN, in increasing precision:
 *   - GPS, which snaps to the nearest pincode centroid (see `pincodes.ts`);
 *   - a 6-digit pincode typed into the search box, resolved exactly;
 *   - the browsable `CITIES` list.
 *
 * `CITIES` is two tiers — nationwide cities, then Rajasthan tehsils — and the tehsils
 * outnumber the cities several times over, so the list is split under two group
 * headers rather than rendered as one flat 390-row scroll. A tehsil is identified by
 * carrying a `districtEn`.
 *
 * The 18,466 pincodes are deliberately NOT browsable rows: they have no Devanagari place
 * names (see `pincodes.ts`), and 18k rows is not a list anyone scrolls. They surface only
 * when the query IS a pincode, which is also what keeps the 566 KB table off the launch
 * path — it loads when this sheet opens, not when the app starts.
 */
export default function LocationPickerModal({ visible, onClose }: {
  visible: boolean;
  onClose: () => void;
}) {
  const { colors, typography, spacing, radii } = useTheme();
  const { lang } = useGitaLanguage();
  const { location, gpsStatus, selectCity, selectPincode, requestDeviceLocation } = usePanchangLocation();
  const [query, setQuery] = useState('');

  // Parse the 566 KB table once the sheet is actually open, so the first pincode typed
  // resolves instantly instead of paying for the load mid-keystroke.
  useEffect(() => {
    if (!visible) return;
    const handle = InteractionManager.runAfterInteractions(() => warmPincodeTable());
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
    const out: Row[] = [];
    if (cities.length > 0) {
      out.push({ kind: 'header', id: 'h-cities', hi: 'प्रमुख शहर', en: 'Major cities' });
      out.push(...cities.map((city) => ({ kind: 'city' as const, city })));
    }
    if (tehsils.length > 0) {
      out.push({ kind: 'header', id: 'h-tehsils', hi: 'राजस्थान · तहसील', en: 'Rajasthan · tehsils' });
      out.push(...tehsils.map((city) => ({ kind: 'city' as const, city })));
    }
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
                  'स्थान की अनुमति नहीं मिली — नीचे सूची से अपना शहर चुनें।',
                  'Location permission was denied — pick your city from the list below.'
                )}
              </Text>
            )}
            {gpsStatus === 'error' && (
              <Text style={{ fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily), fontSize: 12, lineHeight: 18, color: colors.inkMuted }}>
                {meaningByLang(
                  lang,
                  'स्थान प्राप्त नहीं हो सका — नीचे सूची से अपना शहर चुनें।',
                  'Could not get your location — pick your city from the list below.'
                )}
              </Text>
            )}
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder={contentByLang(lang, 'शहर या पिनकोड खोजें…', 'Search city or pincode…')}
              placeholderTextColor={colors.inkMuted}
              accessibilityLabel={contentByLang(lang, 'शहर या पिनकोड खोजें', 'Search city or pincode')}
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
                'कोई भी भारतीय पिनकोड लिखें, या सूची से शहर चुनें — सूर्योदय व तिथि की गणना इसी स्थान के लिए होगी।',
                'Type any Indian pincode, or pick a city from the list — sunrise and tithi are computed for this place.'
              )}
            </Text>
          </View>

          <FlatList
            data={rows}
            keyExtractor={(row) => {
              if (row.kind === 'header') return row.id;
              if (row.kind === 'pincode') return `pin-${row.entry.pincode}`;
              if (row.kind === 'pincode-missing') return `missing-${row.query}`;
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
              if (row.kind === 'pincode') {
                const { entry } = row;
                const selected = location.cityId === pincodeCityId(entry.pincode);
                // District and taluka both, because neither alone is reliably the name a user
                // recognises — 416001 is Kolhapur/Karvir, 781001 is Kamrup/Guwahati. Collapsed
                // when they are equal (Mumbai). Latin in every language: neither source dataset
                // has Devanagari place names, and guessing the spelling would be worse.
                const place =
                  entry.talukaEn && entry.talukaEn !== entry.districtEn
                    ? `${entry.districtEn} · ${entry.talukaEn}`
                    : entry.districtEn;
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
