import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import { useFontScale } from '@/contexts/FontScaleContext';
import { scriptBodyFont, scriptTitleFont } from '@/utils/langType';
import { FESTIVE_REMINDERS } from '@/notifications/festiveReminders';
import {
  FESTIVE_HOUR,
  FESTIVE_MINUTE,
} from '@/notifications/festiveReminderPure';
import { useNotificationPreferences } from '@/contexts/NotificationPreferencesContext';
import AppIcon from './AppIcon';
import { quietCopy } from './quietCompanionCopy';
export default function QuietReminderBody() {
  const { colors, typography } = useTheme();
  const { lang } = useGitaLanguage();
  const { scale } = useFontScale();
  const { prefs } = useNotificationPreferences();
  const f = scale === 'L' ? 1.15 : 1;
  const body = scriptBodyFont(lang, typography.cardHindi.fontFamily),
    bold = scriptTitleFont(lang, typography.readerTitle.fontFamily);
  const time = prefs.times
    .map(
      (t) =>
        `${String(t.hour).padStart(2, '0')}:${String(t.minute).padStart(2, '0')}`,
    )
    .join(' · ');
  return (
    <View>
      <View
        accessibilityLabel={quietCopy(lang, 'preview')}
        style={[
          styles.preview,
          {
            backgroundColor: colors.parchmentHighlight,
            borderColor: colors.divider,
          },
        ]}
      >
        <View style={styles.row}>
          <AppIcon name="bell" size={15} color={colors.saffronDeep} />
          <Text
            style={{ fontFamily: body, fontSize: 12, color: colors.inkMuted }}
          >
            VEDANSH · {time}
          </Text>
        </View>
        <Text
          style={{
            fontFamily: bold,
            fontSize: 16 * f,
            lineHeight: 26 * f,
            color: colors.ink,
            marginTop: 10,
          }}
        >
          {quietCopy(lang, 'verse')}
        </Text>
        <Text
          style={{
            fontFamily: body,
            fontSize: 14 * f,
            lineHeight: 24 * f,
            color: colors.inkSoft,
          }}
        >
          {quietCopy(lang, 'daily')}
        </Text>
      </View>
      {(
        [
          { icon: 'sun', title: quietCopy(lang, 'verse'), time },
          {
            icon: 'date',
            title: `${FESTIVE_REMINDERS.length} ${quietCopy(lang, 'festivals')}`,
            time: `${String(FESTIVE_HOUR).padStart(2, '0')}:${String(FESTIVE_MINUTE).padStart(2, '0')}`,
          },
        ] as const
      ).map((row) => (
        <View
          key={row.icon}
          style={[styles.benefit, { borderBottomColor: colors.divider }]}
        >
          <AppIcon name={row.icon} size={21} color={colors.saffronDeep} />
          <Text
            style={{
              flex: 1,
              fontFamily: body,
              fontSize: 14 * f,
              color: colors.ink,
            }}
          >
            {row.title}
          </Text>
          <Text
            style={{
              fontFamily: body,
              fontSize: 13 * f,
              color: colors.saffronDeep,
              flexShrink: 1,
            }}
          >
            {row.time}
          </Text>
        </View>
      ))}
      <Text
        style={{
          fontFamily: body,
          fontSize: 13 * f,
          lineHeight: 22 * f,
          color: colors.inkMuted,
          marginTop: 12,
        }}
      >
        {quietCopy(lang, 'reminderNote')}
      </Text>
    </View>
  );
}
const styles = StyleSheet.create({
  preview: {
    padding: 16,
    borderWidth: 1,
    borderRadius: 18,
    marginTop: 20,
    marginBottom: 10,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  benefit: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
});
