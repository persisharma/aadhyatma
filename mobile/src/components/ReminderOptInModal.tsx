import React, { useState } from 'react';
import { Pressable, Text } from 'react-native';
import { useNotificationPreferences } from '@/contexts/NotificationPreferencesContext';
import { useGitaLanguage } from '@/data/gita/language';
import { useTheme } from '@/theme/ThemeContext';
import { scriptBodyFont } from '@/utils/langType';
import QuietCompanionSheet from './QuietCompanionSheet';
import QuietReminderBody from './QuietReminderBody';
import { quietCopy as q } from './quietCompanionCopy';
import { declineLaunchReminder, useLaunchAsks } from './launchAskStore';
export default function ReminderOptInModal({
  onClose = () => undefined,
}: {
  onClose?: () => void;
}) {
  const { lang } = useGitaLanguage();
  const { colors, typography } = useTheme();
  const { record } = useLaunchAsks();
  const { enableReminders, declineReminders, permissionStatus, canAskAgain } =
    useNotificationPreferences();
  const [busy, setBusy] = useState(false),
    [visible, setVisible] = useState(true);
  const close = async (never = false) => {
    if (busy) return;
    setBusy(true);
    await declineReminders();
    declineLaunchReminder(never);
    setVisible(false);
  };
  const yes = async () => {
    if (busy) return;
    setBusy(true);
    try {
      if (!(await enableReminders())) declineLaunchReminder();
      setVisible(false);
    } finally {
      setBusy(false);
    }
  };
  return (
    <QuietCompanionSheet
      visible={visible}
      title={q(lang, 'reminderTitle')}
      kicker={q(lang, 'reminder')}
      art="category-aarti-diya"
      primary={q(lang, 'yes')}
      onPrimary={() => {
        void yes();
      }}
      secondary={q(lang, 'later')}
      onSecondary={() => {
        void close();
      }}
      onDismiss={onClose}
      busy={busy}
      meta={
        permissionStatus !== 'granted' && canAskAgain
          ? q(lang, 'os')
          : undefined
      }
    >
      <QuietReminderBody />
      {record.declines >= 2 && (
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            void close(true);
          }}
          style={{ minHeight: 44, justifyContent: 'center', marginTop: 12 }}
        >
          <Text
            style={{
              fontFamily: scriptBodyFont(lang, typography.cardHindi.fontFamily),
              color: colors.inkMuted,
              fontSize: 14,
              textAlign: 'center',
            }}
          >
            {q(lang, 'never')}
          </Text>
        </Pressable>
      )}
    </QuietCompanionSheet>
  );
}
