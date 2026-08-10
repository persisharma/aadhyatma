import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import TextField from './TextField';
import type { Lang } from '@/data/gita/language';
import type { GunaMilanPersonInput } from '@/panchang/gunaMilan';
import type { PersonInputErrors } from '@/panchang/gunaMilanState';
import { useTheme } from '@/theme/ThemeContext';
import { fontFamilies } from '@/theme/typography';
import { contentByLang, meaningByLang } from '@/utils/localize';
import { scriptBodyFont, scriptTitleFont } from '@/utils/langType';

type Props = {
  role: 'groom' | 'bride';
  lang: Lang;
  value: GunaMilanPersonInput;
  onChange: (value: GunaMilanPersonInput) => void;
  errors?: PersonInputErrors;
  savedAvailable?: boolean;
  onUseSaved?: () => void;
  disabled?: boolean;
};

export default function BirthDetailsForm({
  role,
  lang,
  value,
  onChange,
  errors = {},
  savedAvailable,
  onUseSaved,
  disabled,
}: Props) {
  const { colors, typography, radii } = useTheme();
  const roleEn = role === 'groom' ? 'Groom' : 'Bride';
  const roleHi = role === 'groom' ? 'वर' : 'वधू';
  const update = (patch: Partial<GunaMilanPersonInput>) => onChange({ ...value, ...patch });
  return (
    <View
      accessibilityLabel={contentByLang(lang, `${roleHi} जन्म विवरण, समय IST में`, `${roleEn} birth details, time in IST`)}
      style={[styles.card, { backgroundColor: colors.parchmentSoft, borderColor: colors.divider, borderRadius: radii.lg }]}
    >
      <View style={styles.headingRow}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.ink, fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily), fontSize: 20 }}>
            {contentByLang(lang, roleHi, roleEn)}
          </Text>
          <Text style={[styles.role, { color: colors.inkMuted }]}>{roleEn.toUpperCase()}</Text>
        </View>
        {savedAvailable && onUseSaved ? (
          <Pressable
            onPress={onUseSaved}
            disabled={disabled}
            accessibilityRole="button"
            accessibilityLabel={contentByLang(lang, `${roleHi} के लिए मेरे सहेजे गए कुंडली विवरण का उपयोग करें`, `Use my saved Kundali details for ${roleEn}`)}
            style={[styles.saved, { borderColor: colors.saffronDeep, borderRadius: radii.pill }]}
          >
            <Text style={[styles.savedText, { color: colors.saffronDeep }]}>
              {contentByLang(lang, 'मेरे विवरण यहाँ', 'Use my details')}
            </Text>
          </Pressable>
        ) : null}
      </View>
      <Text style={[styles.label, { color: colors.inkMuted }]}>{contentByLang(lang, 'नाम · वैकल्पिक', 'Name · optional')}</Text>
      <TextField
        variant="form"
        value={value.name ?? ''}
        onChangeText={(name) => update({ name })}
        editable={!disabled}
        placeholder={contentByLang(lang, 'नाम', 'Name')}
        accessibilityLabel={contentByLang(lang, `${roleHi} का नाम, वैकल्पिक`, `${roleEn} name, optional`)}
      />
      <Text style={[styles.label, { color: colors.inkMuted }]}>{contentByLang(lang, 'जन्म तिथि', 'Birth date')}</Text>
      <TextField
        variant="form"
        value={value.date}
        onChangeText={(date) => update({ date })}
        editable={!disabled}
        placeholder="YYYY-MM-DD"
        keyboardType="numbers-and-punctuation"
        accessibilityLabel={contentByLang(lang, `${roleHi} की जन्म तिथि, YYYY-MM-DD`, `${roleEn} birth date, YYYY-MM-DD`)}
      />
      {errors.date ? <Text style={[styles.error, { color: colors.avoidDeep }]}>{errors.date}</Text> : null}
      <View style={styles.timeHeading}>
        <Text style={[styles.label, styles.timeLabel, { color: colors.inkMuted }]}>{contentByLang(lang, 'जन्म समय · IST', 'Birth time · IST')}</Text>
        <Pressable
          onPress={() => update({ time: value.time === null ? '' : null })}
          disabled={disabled}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: value.time === null }}
          accessibilityLabel={contentByLang(lang, `${roleHi} का जन्म समय ज्ञात नहीं`, `${roleEn} birth time unknown`)}
          style={styles.unknown}
        >
          <Text style={[styles.check, { color: colors.saffronDeep }]}>{value.time === null ? '☑' : '☐'}</Text>
          <Text style={[styles.unknownText, { color: colors.ink }]}>{contentByLang(lang, 'ज्ञात नहीं', 'Unknown')}</Text>
        </Pressable>
      </View>
      {value.time !== null ? (
        <TextField
          variant="form"
          value={value.time}
          onChangeText={(time) => update({ time })}
          editable={!disabled}
          placeholder="HH:mm"
          keyboardType="numbers-and-punctuation"
          accessibilityLabel={contentByLang(lang, `${roleHi} का जन्म समय, 24 घंटे IST`, `${roleEn} birth time, 24 hour IST`)}
        />
      ) : (
        <Text style={{ color: colors.inkMuted, fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily), fontSize: 12, lineHeight: 18 }}>
          {meaningByLang(lang, 'पूरे IST दिन की सभी सम्भावनाएँ जाँची जाएँगी; दोपहर का समय नहीं माना जाएगा।', 'Every possibility across the IST civil day will be checked; noon is never assumed.')}
        </Text>
      )}
      {errors.time ? <Text style={[styles.error, { color: colors.avoidDeep }]}>{errors.time}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, padding: 16, gap: 8 },
  headingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  role: { fontFamily: fontFamilies.interSemiBold, fontSize: 10, letterSpacing: 1.2, marginTop: 2 },
  saved: { minHeight: 44, paddingHorizontal: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  savedText: { fontFamily: fontFamilies.interSemiBold, fontSize: 11 },
  label: { fontFamily: fontFamilies.interSemiBold, fontSize: 11, marginTop: 4 },
  error: { fontFamily: fontFamilies.inter, fontSize: 11 },
  timeHeading: { minHeight: 44, flexDirection: 'row', alignItems: 'center' },
  timeLabel: { flex: 1, marginTop: 0 },
  unknown: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 5 },
  check: { fontSize: 18 },
  unknownText: { fontFamily: fontFamilies.interSemiBold, fontSize: 12 },
});
