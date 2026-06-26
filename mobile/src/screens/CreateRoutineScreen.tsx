import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import { useRoutines } from '@/contexts/RoutineContext';
import type { RoutineScheduleMode } from '@/data/routine/types';
import type { HomeStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<HomeStackParamList, 'RoutineCreate'>;

export default function CreateRoutineScreen({ navigation }: Props) {
  const { colors, typography, spacing, radii } = useTheme();
  const { lang } = useGitaLanguage();
  const { createRoutine } = useRoutines();
  const isHi = lang === 'hi';

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
            accessibilityLabel={isHi ? 'वापस' : 'Back'}
            hitSlop={16}
            style={[styles.backBtn, { backgroundColor: colors.parchmentSoft, borderColor: colors.divider }]}
          >
            <Text style={{ color: colors.inkSoft, fontSize: 18 }}>‹</Text>
          </Pressable>
          <Text style={{ fontFamily: typography.readerTitle.fontFamily, fontSize: 16, color: colors.ink }}>
            {isHi ? 'नई साधना' : 'New routine'}
          </Text>
        </View>

        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingHorizontal: spacing.xxl }]}
          showsVerticalScrollIndicator={false}
        >
          {step === 'name' ? (
            <>
              <Heading hi="साधना का नाम" en="Name your routine" isHi={isHi} colors={colors} typography={typography} />
              <Field
                label={isHi ? 'हिंदी नाम' : 'Hindi name'}
                placeholder="प्रातः साधना"
                value={nameHi}
                onChangeText={setNameHi}
                colors={colors}
                typography={typography}
                radii={radii}
                spacing={spacing}
              />
              <Field
                label={isHi ? 'अंग्रेज़ी नाम' : 'English name'}
                placeholder="Morning Sadhana"
                value={nameEn}
                onChangeText={setNameEn}
                colors={colors}
                typography={typography}
                radii={radii}
                spacing={spacing}
              />
              <PrimaryButton
                label={isHi ? 'आगे' : 'Next'}
                isHi={isHi}
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
                hi="यह कब चले?"
                en="Same every day, or by weekday?"
                isHi={isHi}
                colors={colors}
                typography={typography}
              />
              <ModeCard
                selected={mode === 'daily'}
                onPress={() => setMode('daily')}
                titleHi="दैनिक — हर दिन एक जैसा"
                titleEn="Daily — same every day"
                descHi="हर वस्तु प्रतिदिन दिखती है।"
                descEn="Every item shows every day."
                isHi={isHi}
                colors={colors}
                typography={typography}
                radii={radii}
                spacing={spacing}
              />
              <ModeCard
                selected={mode === 'weekday'}
                onPress={() => setMode('weekday')}
                titleHi="वार अनुसार — दिन के हिसाब से"
                titleEn="By weekday — changes per day"
                descHi="हर दिन का अपना देव व पाठ।"
                descEn="Each day has its own deity and texts."
                isHi={isHi}
                colors={colors}
                typography={typography}
                radii={radii}
                spacing={spacing}
              />
              <PrimaryButton
                label={isHi ? 'साधना बनाएँ' : 'Create routine'}
                isHi={isHi}
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

function Heading({ hi, en, isHi, colors, typography }: { hi: string; en: string; isHi: boolean } & ThemeBits) {
  return (
    <View style={{ alignItems: 'center', marginBottom: 18 }}>
      <Text style={{ fontFamily: typography.screenTitle.fontFamily, fontSize: 22, color: colors.ink }}>
        {isHi ? hi : en}
      </Text>
      <Text
        style={{ fontFamily: typography.cardLatin.fontFamily, fontSize: 14, color: colors.inkMuted, marginTop: 4 }}
      >
        {isHi ? en : hi}
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
  titleHi,
  titleEn,
  descHi,
  descEn,
  isHi,
  colors,
  typography,
  radii,
  spacing,
}: {
  selected: boolean;
  onPress: () => void;
  titleHi: string;
  titleEn: string;
  descHi: string;
  descEn: string;
  isHi: boolean;
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
        {isHi ? titleHi : titleEn}
      </Text>
      <Text style={{ fontFamily: typography.meaning.fontFamily, fontSize: 13, color: colors.inkMuted, marginTop: 6 }}>
        {isHi ? descHi : descEn}
      </Text>
    </Pressable>
  );
}

function PrimaryButton({
  label,
  isHi,
  disabled,
  onPress,
  colors,
  typography,
  radii,
  spacing,
}: {
  label: string;
  isHi: boolean;
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
          fontFamily: isHi ? typography.cardHindi.fontFamily : typography.verseLatin.fontFamily,
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
