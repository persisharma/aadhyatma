import React, { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import { usePanchangLocation } from '@/contexts/PanchangLocationContext';
import { CITIES, cityMatchesQuery, type City } from '@/panchang/locations';
import { captionFont } from '@/utils/scriptFont';
import { contentByLang, meaningByLang } from '@/utils/localize';
import { scriptTitleFont, scriptBodyFont } from '@/utils/langType';

type Row = { kind: 'header'; id: string; hi: string; en: string } | { kind: 'city'; city: City };

/**
 * City/GPS picker for the panchang reference location. GPS fixes are snapped to
 * the nearest bundled city (offline labels, finite observance-cache keys), so
 * the list below is the complete set of locations the engine computes for.
 *
 * `CITIES` is two tiers — nationwide cities, then Rajasthan tehsils — and the tehsils
 * outnumber the cities several times over, so the list is split under two group
 * headers rather than rendered as one flat 390-row scroll. A tehsil is identified by
 * carrying a `districtEn`.
 */
export default function LocationPickerModal({ visible, onClose }: {
  visible: boolean;
  onClose: () => void;
}) {
  const { colors, typography, spacing, radii } = useTheme();
  const { lang } = useGitaLanguage();
  const { location, gpsStatus, selectCity, requestDeviceLocation } = usePanchangLocation();
  const [query, setQuery] = useState('');

  const rows = useMemo<Row[]>(() => {
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
              placeholder={contentByLang(lang, 'शहर खोजें…', 'Search city…')}
              placeholderTextColor={colors.inkMuted}
              accessibilityLabel={contentByLang(lang, 'शहर खोजें', 'Search city')}
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
                'भारत के प्रमुख शहर व राजस्थान की तहसीलें — सूर्योदय व तिथि की गणना इसी स्थान के लिए होगी।',
                'Major Indian cities plus every Rajasthan tehsil — sunrise and tithi are computed for this place.'
              )}
            </Text>
          </View>

          <FlatList
            data={rows}
            keyExtractor={(row) => (row.kind === 'header' ? row.id : row.city.id)}
            contentContainerStyle={{ paddingHorizontal: spacing.xxl, paddingVertical: spacing.lg }}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item: row }) => {
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
