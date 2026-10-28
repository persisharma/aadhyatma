import React from 'react';
import { Linking, Pressable, Text } from 'react-native';
import { useNotificationPreferences } from '@/contexts/NotificationPreferencesContext';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import { contentByLang } from '@/utils/localize';
import { scriptBodyFont } from '@/utils/langType';

/** Saved preferences survive an OS denial; explain delivery without a popup. */
export default function VratReminderPermissionNotice() {
  const { isLoading, permissionStatus, canAskAgain, requestPermission } = useNotificationPreferences();
  const { colors, typography } = useTheme();
  const { lang } = useGitaLanguage();
  if (isLoading || permissionStatus === 'granted') return null;
  return <Pressable testID="vrat-permission-notice" accessibilityRole="button"
    accessibilityLabel="Enable Vrat notifications in system settings"
    onPress={() => { void (permissionStatus === 'undetermined' && canAskAgain ? requestPermission() : Linking.openSettings()).catch(() => undefined); }}
    style={{ marginVertical: 8, padding: 12, borderWidth: 1, borderColor: colors.catalogBorder, borderRadius: 14, backgroundColor: colors.catalogSurface }}>
    <Text style={{ fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily), fontSize: 13, lineHeight: 21, color: colors.inkSoft }}>
      {contentByLang(lang, 'व्रत सहेजे गए हैं। स्मरण पाने के लिए फ़ोन की सेटिंग्स में सूचनाएँ चालू करें।',
        'Your vrats are saved. Enable notifications in system settings to receive reminders.')}
    </Text>
  </Pressable>;
}
