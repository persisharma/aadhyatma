import React, { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import { usePanchangLocation } from '@/contexts/PanchangLocationContext';
import { CITIES, type City } from '@/panchang/locations';
import { captionFont } from '@/utils/scriptFont';
import { contentByLang, meaningByLang } from '@/utils/localize';
import { scriptTitleFont, scriptBodyFont } from '@/utils/langType';

/**
 * City/GPS picker for the panchang reference location. GPS fixes are snapped to
 * the nearest bundled city (offline labels, finite observance-cache keys), so
 * the list below is the complete set of locations the engine computes for.
 */
export default function LocationPickerModal({ visible, onClose }: {
  visible: boolean;
  onClose: () => void;
}) {
  const { colors, typography, spacing, radii } = useTheme();
  const { lang } = useGitaLanguage();
  const { location, gpsStatus, selectCity, requestDeviceLocation } = usePanchangLocation();
  const [query, setQuery] = useState('');

  const filteredCities = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return CITIES;
    return CITIES.filter(
      (city) => city.nameEn.toLowerCase().includes(needle) || city.nameHi.includes(needle)
    );
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
                'भारत के प्रमुख शहर — सूर्योदय व तिथि की गणना इसी स्थान के लिए होगी।',
                'Major cities of India — sunrise and tithi are computed for this place.'
              )}
            </Text>
          </View>

          <FlatList
            data={filteredCities}
            keyExtractor={(city) => city.id}
            contentContainerStyle={{ paddingHorizontal: spacing.xxl, paddingVertical: spacing.lg }}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item: city }) => {
              const selected = city.id === location.cityId;
              return (
                <Pressable
                  onPress={() => onPickCity(city)}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  accessibilityLabel={`${city.nameEn}${selected ? ', selected' : ''}`}
                  style={({ pressed }) => [
                    styles.cityRow,
                    { borderBottomColor: colors.divider },
                    pressed && { opacity: 0.7 },
                  ]}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily), fontSize: 15, color: colors.ink }}>
                      {contentByLang(lang, city.nameHi, city.nameEn)}
                    </Text>
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
});
