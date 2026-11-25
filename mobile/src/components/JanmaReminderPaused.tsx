import React from 'react';
import { Linking, Pressable, Text, View } from 'react-native';
import { useGitaLanguage } from '@/data/gita/language';
import { useTheme } from '@/theme/ThemeContext';
import { scriptBodyFont } from '@/utils/langType';
import { pick } from '@/utils/localize';

export default function JanmaReminderPaused({ onDisable }: { onDisable: () => void }) {
  const { lang } = useGitaLanguage();
  const { colors, typography, radii } = useTheme();
  const fontFamily = scriptBodyFont(lang, typography.meaning.fontFamily);
  const body = { ...typography.catalogBody, fontFamily };
  const settings = pick(lang, { hi: 'फ़ोन सेटिंग्स खोलें', en: 'Open phone settings', gu: 'ફોન સેટિંગ્સ ખોલો', kn: 'ಫೋನ್ ಸೆಟ್ಟಿಂಗ್‌ಗಳನ್ನು ತೆರೆಯಿರಿ' });
  const disable = pick(lang, { hi: 'इस व्यक्ति का स्मरण बंद करें', en: 'Turn off this person’s reminder', gu: 'આ વ્યક્તિનું સ્મરણ બંધ કરો', kn: 'ಈ ವ್ಯಕ್ತಿಯ ಜ್ಞಾಪನೆಯನ್ನು ಆಫ್ ಮಾಡಿ' });
  return (
    <View style={{ padding: 14, marginBottom: 10, gap: 4, borderWidth: 1, borderRadius: radii.md, borderColor: colors.divider, backgroundColor: colors.parchmentSoft }}>
      <Text accessibilityRole="header" accessibilityLiveRegion="polite" style={{ ...typography.catalogTitle, fontFamily, color: colors.ink }}>
        {pick(lang, { hi: 'स्मरण रुका हुआ है', en: 'Reminder paused', gu: 'સ્મરણ અટકેલું છે', kn: 'ಜ್ಞಾಪನೆಯನ್ನು ವಿರಾಮಗೊಳಿಸಲಾಗಿದೆ' })}
      </Text>
      <Text style={{ ...body, color: colors.inkSoft }}>
        {pick(lang, { hi: 'फ़ोन की सूचनाएँ बंद हैं। उन्हें चालू करने पर इस व्यक्ति का स्मरण फिर शुरू होगा।', en: 'Phone notifications are off. Turn them on to resume this person’s reminder.', gu: 'ફોનની સૂચનાઓ બંધ છે. તેને ચાલુ કરવાથી આ વ્યક્તિનું સ્મરણ ફરી શરૂ થશે.', kn: 'ಫೋನ್ ಅಧಿಸೂಚನೆಗಳು ಆಫ್ ಆಗಿವೆ. ಅವುಗಳನ್ನು ಆನ್ ಮಾಡಿದಾಗ ಈ ವ್ಯಕ್ತಿಯ ಜ್ಞಾಪನೆ ಪುನರಾರಂಭವಾಗುತ್ತದೆ.' })}
      </Text>
      <Pressable accessibilityRole="button" onPress={() => Linking.openSettings().catch(() => undefined)}
        style={{ minHeight: 44, justifyContent: 'center', paddingHorizontal: 12, backgroundColor: colors.goldTint, borderRadius: radii.md }}>
        <Text style={{ ...body, color: colors.ink }}>{settings}</Text>
      </Pressable>
      <Pressable accessibilityRole="button" onPress={onDisable} style={{ minHeight: 44, justifyContent: 'center', paddingHorizontal: 12 }}>
        <Text style={{ ...body, color: colors.inkSoft, textDecorationLine: 'underline' }}>{disable}</Text>
      </Pressable>
    </View>
  );
}
