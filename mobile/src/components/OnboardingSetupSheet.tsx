import React, { useEffect, useRef, useState } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '@/theme/ThemeContext';
import { fontFamilies } from '@/theme/typography';
import { useTour } from '@/contexts/TourContext';
import { useGitaLanguage, LANGUAGES } from '@/data/gita/language';
import { useFontScale } from '@/contexts/FontScaleContext';
import { usePanchangLocation } from '@/contexts/PanchangLocationContext';
import {
  CITIES,
  cityMatchesQuery,
  toPanchangLocation,
} from '@/panchang/locations';
import type { PanchangLocation } from '@/panchang/types';
import { sunriseForDate } from '@/panchang/engine';
import { useNotificationPreferences } from '@/contexts/NotificationPreferencesContext';
import { scriptBodyFont } from '@/utils/langType';
import { contentByLang } from '@/utils/localize';
import { startMetaAppEvents } from '@/utils/metaAppEvents';
import { declineLaunchReminder } from './launchAskStore';
import QuietCompanionSheet from './QuietCompanionSheet';
import QuietReminderBody from './QuietReminderBody';
import TextField from './TextField';
import AppIcon from './AppIcon';
import { quietCopy as q } from './quietCompanionCopy';
const STEP_KEY = '@vedansh/setup-step-v1';
export default function OnboardingSetupSheet() {
  const { colors, typography } = useTheme();
  const { lang, setLang } = useGitaLanguage();
  const { scale, setScale } = useFontScale();
  const { width } = useWindowDimensions();
  const { shouldShowOnboardingSetup, markOnboardingSetupCompleted } = useTour();
  const { location, commitLocation, resolveDeviceLocation } =
    usePanchangLocation();
  const { permissionStatus, canAskAgain, enableReminders, declineReminders } =
    useNotificationPreferences();
  const [step, setStep] = useState(1),
    [visible, setVisible] = useState(false),
    [busy, setBusy] = useState(false),
    [query, setQuery] = useState(''),
    [error, setError] = useState('');
  const [choice, setChoice] = useState<PanchangLocation>(location);
  const completeRef = useRef(false);
  useEffect(() => {
    if (!shouldShowOnboardingSetup) return;
    let active = true;
    void AsyncStorage.getItem(STEP_KEY)
      .then((raw) => {
        if (active) {
          setStep(raw === '2' ? 2 : raw === '3' ? 3 : 1);
          setChoice(location);
          setVisible(true);
        }
      })
      .catch(() => {
        if (active) setVisible(true);
      });
    return () => {
      active = false;
    };
  }, [shouldShowOnboardingSetup, location]);
  const go = (n: number) => {
    setStep(n);
    setError('');
    void AsyncStorage.setItem(STEP_KEY, String(n)).catch(() => undefined);
  };
  const finish = () => {
    completeRef.current = true;
    setVisible(false);
    if (Platform.OS !== 'ios') void afterDismiss();
  };
  async function afterDismiss() {
    if (!completeRef.current) return;
    completeRef.current = false;
    try {
      if (Platform.OS === 'ios') await startMetaAppEvents();
    } finally {
      await markOnboardingSetupCompleted();
      setBusy(false);
    }
  }
  async function next() {
    if (busy) return;
    if (step === 1) {
      go(2);
      return;
    }
    if (step === 2) {
      commitLocation(choice);
      go(3);
      return;
    }
    setBusy(true);
    try {
      if (!(await enableReminders())) declineLaunchReminder();
      finish();
    } catch {
      setBusy(false);
      setError(q(lang, 'gpsFailed'));
    }
  }
  async function skip() {
    if (busy) return;
    setBusy(true);
    await declineReminders();
    declineLaunchReminder();
    finish();
  }
  const body = scriptBodyFont(lang, typography.cardHindi.fontFamily),
    factor = scale === 'L' ? 1.15 : 1;
  const para = {
    fontFamily: body,
    fontSize: 15 * factor,
    lineHeight: 25 * factor,
    color: colors.inkSoft,
    marginTop: 14,
  };
  const candidates = query.trim()
    ? CITIES.filter((c) => cityMatchesQuery(c, query)).slice(0, 30)
    : ['varanasi', 'delhi', 'mumbai', 'bengaluru', 'ahmedabad', 'kolkata']
        .map((id) => CITIES.find((c) => c.id === id)!)
        .filter(Boolean);
  const sunrise =
    step === 2
      ? sunriseForDate(new Date(), { location: choice }).toLocaleTimeString(
          lang === 'en' ? 'en-GB' : 'hi-IN',
          { hour: '2-digit', minute: '2-digit', hour12: false },
        )
      : '';
  const title = q(
    lang,
    step === 1 ? 'welcome' : step === 2 ? 'cityTitle' : 'reminderTitle',
  );
  return (
    <QuietCompanionSheet
      visible={visible}
      step={step}
      title={title}
      kicker={q(
        lang,
        step === 1 ? 'language' : step === 2 ? 'city' : 'reminder',
      )}
      art={
        step === 1
          ? 'category-granth-open-scripture'
          : step === 2
            ? 'deity-ganga'
            : 'category-aarti-diya'
      }
      onBack={step > 1 ? () => go(step - 1) : undefined}
      onDismiss={() => {
        void afterDismiss();
      }}
      primary={q(lang, step === 3 ? 'yes' : 'next')}
      primaryLabel={
        step === 1
          ? 'Setup language continue'
          : step === 2
            ? 'Setup city continue'
            : 'Enable reminders'
      }
      onPrimary={() => {
        void next();
      }}
      secondary={step === 3 ? q(lang, 'later') : undefined}
      onSecondary={() => {
        void skip();
      }}
      busy={busy}
      meta={
        step === 1
          ? q(lang, 'settings')
          : step === 3 && permissionStatus !== 'granted' && canAskAgain
            ? q(lang, 'os')
            : undefined
      }
    >
      {step === 1 ? (
        <>
          <Text style={para}>{q(lang, 'languageNote')}</Text>
          <View style={styles.languages}>
            {LANGUAGES.map((opt) => {
              const selected = lang === opt.value;
              const family =
                opt.script === 'gujarati'
                  ? fontFamilies.gujaratiBold
                  : opt.script === 'kannada'
                    ? fontFamilies.kannadaBold
                    : opt.script === 'latin'
                      ? fontFamilies.interSemiBold
                      : fontFamilies.devanagariBold;
              return (
                <Pressable
                  key={opt.value}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  accessibilityLabel={opt.a11yLabel}
                  onPress={() => setLang(opt.value)}
                  style={[
                    styles.language,
                    {
                      width: scale === 'L' || width < 350 ? '100%' : '48%',
                      borderColor: selected
                        ? colors.saffronDeep
                        : colors.divider,
                      backgroundColor: selected
                        ? colors.saffronTint
                        : colors.parchmentHighlight,
                    },
                  ]}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontFamily: family,
                        fontSize: 20 * factor,
                        color: colors.ink,
                      }}
                    >
                      {opt.nativeLabel}
                    </Text>
                    <Text
                      style={{
                        fontFamily: fontFamilies.inter,
                        fontSize: 12,
                        color: colors.inkMuted,
                        marginTop: 3,
                      }}
                    >
                      {opt.a11yLabel}
                    </Text>
                  </View>
                  {selected && (
                    <AppIcon
                      name="check"
                      size={18}
                      color={colors.saffronDeep}
                    />
                  )}
                </Pressable>
              );
            })}
          </View>
          <Text style={para}>
            {contentByLang(lang, 'पढ़ने का आकार', 'Reading size')}
          </Text>
          <View style={styles.sizes}>
            {(['M', 'L'] as const).map((value) => (
              <Pressable
                key={value}
                accessibilityRole="radio"
                accessibilityLabel={`${value === 'M' ? 'Standard' : 'Large'} reading size`}
                accessibilityState={{ selected: scale === value }}
                onPress={() => setScale(value)}
                style={[
                  styles.size,
                  {
                    borderColor:
                      scale === value ? colors.saffronDeep : colors.divider,
                    backgroundColor:
                      scale === value
                        ? colors.saffronTint
                        : colors.parchmentHighlight,
                  },
                ]}
              >
                <Text
                  style={{
                    fontFamily: body,
                    fontSize: 15 * factor,
                    color: colors.ink,
                  }}
                >
                  {contentByLang(
                    lang,
                    value === 'M' ? 'मानक' : 'बड़ा',
                    value === 'M' ? 'Standard' : 'Large',
                  )}
                </Text>
              </Pressable>
            ))}
          </View>
        </>
      ) : step === 2 ? (
        <>
          <Text style={para}>{q(lang, 'cityNote')}</Text>
          <View
            style={[styles.sunrise, { backgroundColor: colors.saffronTint }]}
          >
            <AppIcon name="morning" size={22} color={colors.saffronDeep} />
            <Text
              style={{
                fontFamily: body,
                fontSize: 15 * factor,
                color: colors.ink,
                flex: 1,
              }}
            >
              {contentByLang(lang, choice.labelHi, choice.labelEn)} · {sunrise}
            </Text>
          </View>
          <TextField
            variant="form"
            value={query}
            onChangeText={setQuery}
            placeholder={q(lang, 'search')}
            accessibilityLabel="Search onboarding cities"
          />
          <Pressable
            disabled={busy}
            onPress={() => {
              setBusy(true);
              void resolveDeviceLocation()
                .then((next) => {
                  if (next) setChoice(next);
                  else setError(q(lang, 'gpsFailed'));
                })
                .catch(() => setError(q(lang, 'gpsFailed')))
                .finally(() => setBusy(false));
            }}
            accessibilityRole="button"
            style={styles.gps}
          >
            <AppIcon name="location" size={19} color={colors.saffronDeep} />
            <Text
              style={{
                fontFamily: body,
                fontSize: 14 * factor,
                color: colors.saffronDeep,
                flex: 1,
              }}
            >
              {q(lang, 'gps')}
            </Text>
          </Pressable>
          <View style={styles.languages}>
            {candidates.map((c) => (
              <Pressable
                key={c.id}
                accessibilityRole="radio"
                accessibilityState={{ selected: choice.cityId === c.id }}
                onPress={() => setChoice(toPanchangLocation(c, 'city'))}
                style={[
                  styles.city,
                  {
                    borderColor:
                      choice.cityId === c.id
                        ? colors.saffronDeep
                        : colors.divider,
                    width: scale === 'L' ? '100%' : '48%',
                  },
                ]}
              >
                <Text
                  style={{
                    fontFamily: body,
                    fontSize: 14 * factor,
                    color: colors.ink,
                  }}
                >
                  {contentByLang(lang, c.nameHi, c.nameEn)}
                </Text>
              </Pressable>
            ))}
          </View>
          <Text style={[para, { fontSize: 12 * factor }]}>
            {contentByLang(lang, 'अभी चुना हुआ शहर: ', 'Selected city: ')}
            {contentByLang(lang, choice.labelHi, choice.labelEn)}
          </Text>
        </>
      ) : (
        <QuietReminderBody />
      )}
      {!!error && (
        <Text accessibilityRole="alert" style={para}>
          {error}
        </Text>
      )}
    </QuietCompanionSheet>
  );
}
const styles = StyleSheet.create({
  languages: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 16 },
  language: {
    borderWidth: 1,
    borderRadius: 15,
    padding: 14,
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sizes: { flexDirection: 'row', gap: 12, marginTop: 10 },
  size: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    minHeight: 44,
  },
  city: { borderWidth: 1, borderRadius: 12, padding: 12, minHeight: 44 },
  sunrise: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 13,
    borderRadius: 14,
    marginVertical: 14,
  },
  gps: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    paddingVertical: 10,
  },
});
