import React from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { useGitaLanguage } from '@/data/gita/language';
import { useFontScale } from '@/contexts/FontScaleContext';
import { useTheme } from '@/theme/ThemeContext';
import { fontFamilies } from '@/theme/typography';
import { scriptBodyFont, scriptTitleFont } from '@/utils/langType';
import { pick } from '@/utils/localize';

export default function JanmaReminderPaused({ onDisable }: { onDisable: () => void }) {
  const { lang } = useGitaLanguage();
  const { colors, typography, radii } = useTheme();
  const fontFamily = scriptBodyFont(lang, typography.meaning.fontFamily);
  const { factor } = useFontScale();
  const body = {
    fontFamily,
    fontSize: Math.round(typography.catalogBody.fontSize * factor),
    lineHeight: Math.round(typography.catalogBody.lineHeight * factor),
  };
  const settings = pick(lang, {
    hi: 'फ़ोन की सेटिंग खोलें',
    en: 'Open phone settings',
    gu: 'ફોન સેટિંગ્સ ખોલો',
    kn: 'ಫೋನ್ ಸೆಟ್ಟಿಂಗ್‌ಗಳನ್ನು ತೆರೆಯಿರಿ',
  });
  const disable = pick(lang, {
    hi: 'इस व्यक्ति का स्मरण बंद करें',
    en: 'Turn off this person’s reminder',
    gu: 'આ વ્યક્તિનું સ્મરણ બંધ કરો',
    kn: 'ಈ ವ್ಯಕ್ತಿಯ ಜ್ಞಾಪನೆಯನ್ನು ಆಫ್ ಮಾಡಿ',
  });
  return (
    <View style={[styles.card, { borderRadius: radii.md, borderColor: colors.divider, backgroundColor: colors.parchmentSoft }]}>
      <Text style={{ ...typography.catalogMeta, fontFamily, color: colors.inkMuted }}>
        {pick(lang, { hi: 'स्मरण', en: 'REMINDER', gu: 'સ્મરણ', kn: 'ಜ್ಞಾಪನೆ' })}
      </Text>
      <Text accessibilityRole="header" accessibilityLiveRegion="polite" style={{ ...typography.catalogTitle, fontFamily: scriptTitleFont(lang, fontFamilies.devanagariBold), color: colors.saffronDeep }}>
        {pick(lang, {
          hi: 'स्मरण रुका है',
          en: 'Reminder paused',
          gu: 'સ્મરણ અટકેલું છે',
          kn: 'ಜ್ಞಾಪನೆಯನ್ನು ವಿರಾಮಗೊಳಿಸಲಾಗಿದೆ',
        })}
      </Text>
      <Text style={{ ...body, color: colors.inkSoft }}>
        {pick(lang, {
          hi: 'फ़ोन में वेदांश की सूचनाएँ बंद हैं।',
          en: 'Phone notifications for Vedansh are off.',
          gu: 'ફોનમાં વેદાંશની સૂચનાઓ બંધ છે.',
          kn: 'ಫೋನ್‌ನಲ್ಲಿ ವೇದಾಂಶದ ಅಧಿಸೂಚನೆಗಳು ಆಫ್ ಆಗಿವೆ.',
        })}
      </Text>
      <Pressable
        testID="janma-reminder-settings"
        accessibilityRole="button"
        accessibilityLabel={settings}
        onPress={() => Linking.openSettings().catch(() => undefined)}
        style={[styles.action, { backgroundColor: colors.saffronDeep, borderRadius: radii.md }]}
      >
        <Text style={{ ...body, color: colors.parchmentSoft, textAlign: 'center' }}>{settings}</Text>
      </Pressable>
      <Pressable
        testID="janma-reminder-disable"
        accessibilityRole="button"
        accessibilityLabel={disable}
        onPress={onDisable}
        style={styles.action}
      >
        <Text style={{ ...body, color: colors.saffronDeep, textAlign: 'center' }}>{disable}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 14, marginBottom: 10, gap: 4, borderWidth: 1 },
  action: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 12 },
});
