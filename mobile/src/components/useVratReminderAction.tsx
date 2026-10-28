import React, { useState } from 'react';
import { Keyboard } from 'react-native';
import { useVratFollows, type VratReminderPref } from '@/contexts/VratFollowContext';
import { useNotificationPreferences } from '@/contexts/NotificationPreferencesContext';
import { useGitaLanguage } from '@/data/gita/language';
import { contentByLang } from '@/utils/localize';
import type { ObservanceRule } from '@/panchang/types';
import VratReminderSheet from './VratReminderSheet';

type Target = Pick<ObservanceRule, 'id' | 'nameHi' | 'nameEn'>;
type Pending = { rule: Target; onAdded?: () => void };

/** One action for catalog, search, lists and detail. Vrat preferences are owned
 * by VratFollowContext; Daily Bhakti is consulted only for the OS permission. */
export function useVratReminderAction() {
  const { follows, isLoading, isFollowing, follow, unfollow, reminderDefault,
    savedReminderPreference, hasSavedReminderDefault, setReminderDefault } = useVratFollows();
  const { permissionStatus, canAskAgain, requestPermission } = useNotificationPreferences();
  const { lang } = useGitaLanguage();
  const [pending, setPending] = useState<Pending | null>(null);

  const add = (target: Pending, pref: VratReminderPref, rememberDefault = false) => {
    if (rememberDefault) setReminderDefault(pref);
    follow(target.rule.id, rememberDefault || hasSavedReminderDefault ? undefined : pref);
    // Ask only following an explicit reminder action, never from a scheduler,
    // and never re-prompt a denial or alter Daily Bhakti's enable/time settings.
    if ((pref.dayOf || pref.advanceDays > 0) && permissionStatus === 'undetermined' && canAskAgain) {
      void requestPermission().catch(() => undefined);
    }
    target.onAdded?.();
  };

  const toggleReminder = (rule: Target, onAdded?: () => void) => {
    if (isLoading) return;
    if (isFollowing(rule.id)) { unfollow(rule.id); return; }
    const target = { rule, onAdded };
    if (savedReminderPreference) add(target, savedReminderPreference);
    else { Keyboard.dismiss(); setPending(target); }
  };

  const reminderSheet = pending ? <VratReminderSheet visible testID="vrat-reminder-setup"
    titleName={contentByLang(lang, pending.rule.nameHi, pending.rule.nameEn)}
    initial={reminderDefault} onClose={() => setPending(null)}
    subtitle={contentByLang(lang,
      'व्रत के स्मरण का समय चुनें। यह व्रत मेरे व्रत में जुड़ेगा और आगे यही समय काम आएगा।',
      'Choose Vrat reminder timings. This saves the vrat to My Vrat and reuses these timings next time.')}
    footnote={contentByLang(lang, 'ये व्रत के स्मरण हैं। दैनिक भक्ति के स्मरण अलग रहेंगे।',
      'Vrat reminders are separate from Daily Bhakti reminders.')}
    onSave={pref => add(pending, pref, true)} /> : null;

  const reminderOnFor = (ruleId: string) => {
    const pref = follows.find(f => f.ruleId === ruleId)?.reminder ?? reminderDefault;
    return Boolean(pref.dayOf || pref.advanceDays > 0);
  };
  return { toggleReminder, reminderSheet, reminderOnFor };
}
