import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage, type Lang } from '@/data/gita/language';
import { pick, type LocalizedStrings } from '@/utils/localize';
import { scriptTitleFont } from '@/utils/langType';
import { useRoutines } from '@/contexts/RoutineContext';
import type { RoutineScheduleMode } from '@/data/routine/types';
import type { HomeStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<HomeStackParamList, 'RoutineCreate'>;

export default function CreateRoutineScreen({ navigation }: Props) {
  const { colors, typography, spacing, radii } = useTheme();
  const { lang } = useGitaLanguage();
  const { createRoutine } = useRoutines();

  const [step, setStep] = useState<'name' | 'mode'>('name');
  const [nameHi, setNameHi] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [mode, setMode] = useState<RoutineScheduleMode | null>(null);

  const nameReady = nameHi.trim().length > 0 || nameEn.trim().length > 0;

  const create = () => {
    if (!mode || !nameReady) return;
    const id = createRoutine(nameHi || nameEn, nameEn || nameHi, mode);
    navigation.replace('RoutineAddItems', { routineId: id });
  };

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[colors.parchmentHighlight, colors.parchmentGradientEnd]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <View style={[styles.topBar, { paddingHorizontal: spacing.xxl }]}>
          <Pressable
            onPress={() => (step === 'mode' ? setStep('name') : navigation.goBack())}
            accessibilityRole="button"
            accessibilityLabel={pick(lang, { hi: 'वापस', en: 'Back', gu: 'પાછા', kn: 'ಹಿಂದೆ' })}
            hitSlop={16}
            style={[styles.backBtn, { backgroundColor: colors.parchmentSoft, borderColor: colors.divider }]}
          >
            <Text style={{ color: colors.inkSoft, fontSize: 18 }}>‹</Text>
          </Pressable>
          <Text style={{ fontFamily: typography.readerTitle.fontFamily, fontSize: 16, color: colors.ink }}>
            {pick(lang, { hi: 'नई साधना', en: 'New routine', gu: 'નવી સાધના', kn: 'ಹೊಸ ಸಾಧನೆ' })}
          </Text>
        </View>

        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingHorizontal: spacing.xxl }]}
          showsVerticalScrollIndicator={false}
        >
          {step === 'name' ? (
            <>
              <Heading
                msg={{ hi: 'साधना का नाम', en: 'Name your routine', gu: 'સાધનાનું નામ', kn: 'ನಿಮ್ಮ ಸಾಧನೆಗೆ ಹೆಸರಿಡಿ' }}
                lang={lang}
                colors={colors}
                typography={typography}
              />
              <Field
                label={pick(lang, { hi: 'हिंदी नाम', en: 'Hindi name', gu: 'હિન્દી નામ', kn: 'ಹಿಂದಿ ಹೆಸರು' })}
                placeholder="प्रातः साधना"
                value={nameHi}
                onChangeText={setNameHi}
                colors={colors}
                typography={typography}
                radii={radii}
                spacing={spacing}
              />
              <Field
                label={pick(lang, { hi: 'अंग्रेज़ी नाम', en: 'English name', gu: 'અંગ્રેજી નામ', kn: 'ಇಂಗ್ಲಿಷ್ ಹೆಸರು' })}
                placeholder="Morning Sadhana"
                value={nameEn}
                onChangeText={setNameEn}
                colors={colors}
                typography={typography}
                radii={radii}
                spacing={spacing}
              />
              <PrimaryButton
                label={pick(lang, { hi: 'आगे', en: 'Next', gu: 'આગળ', kn: 'ಮುಂದೆ' })}
                lang={lang}
                disabled={!nameReady}
                onPress={() => setStep('mode')}
                colors={colors}
                typography={typography}
                radii={radii}
                spacing={spacing}
              />
            </>
          ) : (
            <>
              <Heading
                msg={{ hi: 'यह कब चले?', en: 'Same every day, or by weekday?', gu: 'આ ક્યારે ચાલે?', kn: 'ಇದು ಯಾವಾಗ ನಡೆಯಬೇಕು?' }}
                lang={lang}
                colors={colors}
                typography={typography}
              />
              <ModeCard
                selected={mode === 'daily'}
                onPress={() => setMode('daily')}
                title={{ hi: 'दैनिक — हर दिन एक जैसा', en: 'Daily — same every day', gu: 'દૈનિક — દરરોજ એકસરખું', kn: 'ದೈನಿಕ — ಪ್ರತಿದಿನ ಒಂದೇ' }}
                desc={{ hi: 'हर वस्तु प्रतिदिन दिखती है।', en: 'Every item shows every day.', gu: 'દરેક વસ્તુ રોજ દેખાય છે.', kn: 'ಪ್ರತಿ ವಸ್ತುವೂ ಪ್ರತಿದಿನ ಕಾಣಿಸುತ್ತದೆ.' }}
                lang={lang}
                colors={colors}
                typography={typography}
                radii={radii}
                spacing={spacing}
              />
              <ModeCard
                selected={mode === 'weekday'}
                onPress={() => setMode('weekday')}
                title={{ hi: 'वार अनुसार — दिन के हिसाब से', en: 'By weekday — changes per day', gu: 'વાર પ્રમાણે — દિવસ મુજબ', kn: 'ವಾರದ ಪ್ರಕಾರ — ದಿನಕ್ಕೆ ತಕ್ಕಂತೆ' }}
                desc={{ hi: 'हर दिन का अपना देव व पाठ।', en: 'Each day has its own deity and texts.', gu: 'દરેક દિવસનો પોતાનો દેવ અને પાઠ.', kn: 'ಪ್ರತಿ ದಿನಕ್ಕೂ ತನ್ನದೇ ದೇವ ಮತ್ತು ಪಠ್ಯ.' }}
                lang={lang}
                colors={colors}
                typography={typography}
                radii={radii}
                spacing={spacing}
              />
              <PrimaryButton
                label={pick(lang, { hi: 'साधना बनाएँ', en: 'Create routine', gu: 'સાધના બનાવો', kn: 'ಸಾಧನೆ ರಚಿಸಿ' })}
                lang={lang}
                disabled={!mode}
                onPress={create}
                colors={colors}
                typography={typography}
                radii={radii}
                spacing={spacing}
              />
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

type ThemeBits = {
  colors: ReturnType<typeof useTheme>['colors'];
  typography: ReturnType<typeof useTheme>['typography'];
  radii?: ReturnType<typeof useTheme>['radii'];
  spacing?: ReturnType<typeof useTheme>['spacing'];
};

function Heading({ msg, lang, colors, typography }: { msg: LocalizedStrings; lang: Lang } & ThemeBits) {
  // Primary line in the reading language; secondary stays English (Hindi when reading English),
  // matching the listing-card bilingual pattern.
  const secondary = lang === 'en' ? msg.hi : msg.en;
  return (
    <View style={{ alignItems: 'center', marginBottom: 18 }}>
      <Text style={{ fontFamily: typography.screenTitle.fontFamily, fontSize: 22, color: colors.ink }}>
        {pick(lang, msg)}
      </Text>
      <Text
        style={{ fontFamily: typography.cardLatin.fontFamily, fontSize: 14, color: colors.inkMuted, marginTop: 4 }}
      >
        {secondary}
      </Text>
    </View>
  );
}

function Field({
  label,
  placeholder,
  value,
  onChangeText,
  colors,
  typography,
  radii,
  spacing,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (t: string) => void;
} & Required<ThemeBits>) {
  return (
    <View style={{ marginBottom: spacing.md }}>
      <Text
        style={{
          ...typography.sectionLabel,
          color: colors.inkMuted,
          marginBottom: 6,
        }}
      >
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.inkMuted}
        style={{
          borderWidth: 1,
          borderColor: colors.divider,
          borderRadius: radii.md,
          backgroundColor: colors.parchmentHighlight,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.md,
          fontFamily: typography.meaning.fontFamily,
          fontSize: 15,
          color: colors.ink,
        }}
      />
    </View>
  );
}

function ModeCard({
  selected,
  onPress,
  title,
  desc,
  lang,
  colors,
  typography,
  radii,
  spacing,
}: {
  selected: boolean;
  onPress: () => void;
  title: LocalizedStrings;
  desc: LocalizedStrings;
  lang: Lang;
} & Required<ThemeBits>) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={{
        borderWidth: selected ? 1.5 : 1,
        borderColor: selected ? colors.saffron : colors.divider,
        backgroundColor: selected ? colors.parchmentHighlight : colors.parchmentSoft,
        borderRadius: radii.lg,
        padding: spacing.lg,
        marginBottom: spacing.md,
      }}
    >
      <Text style={{ fontFamily: typography.cardHindi.fontFamily, fontSize: 16, color: colors.ink }}>
        {pick(lang, title)}
      </Text>
      <Text style={{ fontFamily: typography.meaning.fontFamily, fontSize: 13, color: colors.inkMuted, marginTop: 6 }}>
        {pick(lang, desc)}
      </Text>
    </Pressable>
  );
}

function PrimaryButton({
  label,
  lang,
  disabled,
  onPress,
  colors,
  typography,
  radii,
  spacing,
}: {
  label: string;
  lang: Lang;
  disabled?: boolean;
  onPress: () => void;
} & Required<ThemeBits>) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      style={{
        backgroundColor: colors.saffron,
        borderRadius: radii.md,
        paddingVertical: spacing.md,
        alignItems: 'center',
        marginTop: spacing.lg,
        opacity: disabled ? 0.4 : 1,
      }}
    >
      <Text
        style={{
          fontFamily:
            lang === 'en'
              ? typography.verseLatin.fontFamily
              : scriptTitleFont(lang, typography.cardHindi.fontFamily),
          fontSize: 16,
          lineHeight: 22,
          color: colors.onPrimary,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  topBar: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 12 },
  backBtn: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { paddingTop: 8, paddingBottom: 40 },
});
