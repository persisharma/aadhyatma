import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

import ReaderHeader from '@/components/ReaderHeader';
import { useGitaLanguage } from '@/data/gita/language';
import { useTheme } from '@/theme/ThemeContext';
import { contentByLang } from '@/utils/localize';
import { scriptBodyFont, scriptTitleFont } from '@/utils/langType';
import { shortDateWithYear } from '@/panchang/pitruSmaranDisplay';
import type { MoreStackParamList } from '@/navigation/types';
import {
  applyRestore,
  exportBackup,
  pickBackupFile,
  readBackupEnvelope,
  reloadAfterRestore,
} from '@/backup/backupIo';
import { useLastBackupAt } from '@/backup/backupMeta';
import { summarizeEnvelope, type BackupEnvelope, type BackupGroupSummary, type ParseFailure } from '@/backup/envelope';
import { BACKUP_GROUP_LABELS } from '@/backup/registry';

type Props = NativeStackScreenProps<MoreStackParamList, 'Backup'>;

type Notice =
  | { kind: 'none' }
  | { kind: 'export-unavailable' }
  | { kind: 'export-error' }
  | { kind: 'restore-invalid'; reason: ParseFailure }
  | { kind: 'restore-error' }
  | { kind: 'restore-done-restart' };

/**
 * बैकअप व पुनर्स्थापन (PRD-06 Track C). Shows EXACTLY what a backup holds —
 * every date the family typed, the practice history, follows, preferences —
 * then two actions: export (one JSON file to the OS share sheet: Files,
 * iCloud Drive, Gmail, AirDrop — the user's choice) and restore (the OS
 * document picker, a preview of the file, a confirm, then a reload so every
 * store rehydrates). The app never uploads anything; the file is the backup.
 */
export default function BackupScreen({ navigation }: Props) {
  const { colors, typography, spacing, radii } = useTheme();
  const { lang } = useGitaLanguage();
  const lastBackupAt = useLastBackupAt();

  const [summary, setSummary] = useState<BackupGroupSummary[] | null>(null);
  const [busy, setBusy] = useState<'none' | 'export' | 'restore'>('none');
  const [notice, setNotice] = useState<Notice>({ kind: 'none' });

  const bodyFont = scriptBodyFont(lang, typography.meaning.fontFamily);
  const titleFont = scriptTitleFont(lang, typography.readerTitle.fontFamily);
  const t = (hi: string, en: string) => contentByLang(lang, hi, en);

  // What THIS device would export — the same reader the export uses, so the
  // preview can never disagree with the file.
  useEffect(() => {
    let cancelled = false;
    readBackupEnvelope()
      .then((envelope) => {
        if (!cancelled) setSummary(summarizeEnvelope(envelope));
      })
      .catch(() => {
        if (!cancelled) setSummary([]);
      });
    return () => {
      cancelled = true;
    };
  }, [busy]);

  const onExport = useCallback(async () => {
    setBusy('export');
    setNotice({ kind: 'none' });
    try {
      const outcome = await exportBackup();
      if (outcome === 'unavailable') setNotice({ kind: 'export-unavailable' });
    } catch {
      setNotice({ kind: 'export-error' });
    } finally {
      setBusy('none');
    }
  }, []);

  const confirmRestore = useCallback(
    (envelope: BackupEnvelope) =>
      new Promise<boolean>((resolve) => {
        const groups = summarizeEnvelope(envelope).filter((g) => g.stores > 0);
        const lines = groups
          .map((g) => `${contentByLang(lang, BACKUP_GROUP_LABELS[g.group].hi, BACKUP_GROUP_LABELS[g.group].en)} · ${g.items}`)
          .join('\n');
        const when = envelope.exportedAt ? shortDateWithYear(new Date(envelope.exportedAt), lang) : '';
        Alert.alert(
          t('इस फ़ाइल से पुनर्स्थापित करें?', 'Restore from this file?'),
          `${when ? `${t('बैकअप', 'Backup')} · ${when}\n\n` : ''}${lines}\n\n${t(
            'इन विभागों का अभी सहेजा डेटा फ़ाइल से बदल दिया जाएगा। फिर ऐप पुनः आरम्भ होगा।',
            'Current saved data for these sections will be replaced by the file. The app then restarts.'
          )}`,
          [
            { text: t('रद्द करें', 'Cancel'), style: 'cancel', onPress: () => resolve(false) },
            { text: t('पुनर्स्थापित करें', 'Restore'), style: 'destructive', onPress: () => resolve(true) },
          ],
          { cancelable: true, onDismiss: () => resolve(false) }
        );
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [lang]
  );

  const onRestore = useCallback(async () => {
    setBusy('restore');
    setNotice({ kind: 'none' });
    try {
      const picked = await pickBackupFile();
      if (!picked.picked) return;
      if (!picked.result.ok) {
        setNotice({ kind: 'restore-invalid', reason: picked.result.reason });
        return;
      }
      const envelope = picked.result.envelope;
      const confirmed = await confirmRestore(envelope);
      if (!confirmed) return;
      await applyRestore(envelope);
      const reloaded = await reloadAfterRestore();
      if (!reloaded) setNotice({ kind: 'restore-done-restart' });
    } catch {
      setNotice({ kind: 'restore-error' });
    } finally {
      setBusy('none');
    }
  }, [confirmRestore]);

  const noticeText = describeNotice(notice, t);
  const lastBackupText =
    lastBackupAt === undefined
      ? ''
      : lastBackupAt === null
        ? t('अभी तक कोई बैकअप नहीं', 'No backup yet')
        : `${t('अंतिम बैकअप', 'Last backup')} · ${shortDateWithYear(new Date(lastBackupAt), lang)}`;

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[colors.parchmentHighlight, colors.parchmentGradientEnd]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <ReaderHeader
          variant="index"
          title={t('बैकअप व पुनर्स्थापन', 'Backup & Restore')}
          onBack={() => navigation.goBack()}
        />
        <ScrollView contentContainerStyle={[styles.scroll, { paddingHorizontal: spacing.xxl }]} showsVerticalScrollIndicator={false}>
          <Text style={{ fontFamily: bodyFont, fontSize: 14, lineHeight: 21, color: colors.inkSoft, marginBottom: 14 }}>
            {t(
              'आपकी जन्म तिथियाँ, पितृ तिथियाँ, कुल परम्परा, सहेजे श्लोक, साधना और पसंद — सब आपके पास, आपके फ़ोन में रहते हैं। फ़ोन बदलने या ऐप हटाने से पहले एक बैकअप फ़ाइल बनाएँ और उसे Files, Gmail या किसी भी सुरक्षित स्थान पर रखें। Vedansh कुछ भी अपलोड नहीं करता।',
              'Your birth dates, pitru tithis, kul parampara, saved verses, practice and preferences stay with you, in your phone. Before changing phones or uninstalling, make a backup file and keep it in Files, Gmail or anywhere safe. Vedansh uploads nothing.'
            )}
          </Text>

          {/* ── What a backup holds ── */}
          <View style={[styles.card, { backgroundColor: colors.parchmentSoft, borderColor: colors.divider, borderRadius: radii.lg }]}>
            <Text style={{ fontFamily: titleFont, fontSize: 15.5, color: colors.ink }}>
              {t('बैकअप में क्या जाएगा', 'What a backup holds')}
            </Text>
            {lastBackupText ? (
              <Text style={{ fontFamily: bodyFont, fontSize: 12.5, color: colors.inkMuted, marginTop: 3 }} testID="backup-last">
                {lastBackupText}
              </Text>
            ) : null}
            <View style={[styles.divider, { backgroundColor: colors.divider }]} />
            {summary === null ? (
              <Text style={{ fontFamily: bodyFont, fontSize: 13, color: colors.inkMuted }}>{t('गिना जा रहा है…', 'Counting…')}</Text>
            ) : (
              summary.map((row) => (
                <View key={row.group} style={styles.kv}>
                  <Text style={{ fontFamily: bodyFont, fontSize: 13.5, color: colors.ink }}>
                    {t(BACKUP_GROUP_LABELS[row.group].hi, BACKUP_GROUP_LABELS[row.group].en)}
                  </Text>
                  <Text style={{ fontFamily: bodyFont, fontSize: 13.5, color: row.items > 0 ? colors.ink : colors.inkMuted }} testID={`backup-count-${row.group}`}>
                    {row.items > 0 ? `${row.items}` : t('कुछ नहीं', 'Nothing yet')}
                  </Text>
                </View>
              ))
            )}

            <Pressable
              onPress={onExport}
              disabled={busy !== 'none'}
              testID="backup-export"
              accessibilityRole="button"
              accessibilityLabel="Export backup file"
              style={({ pressed }) => [
                styles.primaryBtn,
                { backgroundColor: colors.saffron, borderRadius: radii.md },
                (pressed || busy !== 'none') && { opacity: 0.8 },
              ]}
            >
              <Text style={{ fontFamily: titleFont, fontSize: 14.5, color: colors.onPrimary }}>
                {busy === 'export' ? t('तैयार हो रहा है…', 'Preparing…') : t('बैकअप फ़ाइल बनाएँ', 'Export backup file')}
              </Text>
            </Pressable>
            <Text style={{ fontFamily: bodyFont, fontSize: 12.5, lineHeight: 18, color: colors.inkMuted, marginTop: 10, textAlign: 'center' }}>
              {t(
                'साझा-पत्रक खुलेगा — Files में सहेजें या स्वयं को Gmail करें।',
                'The share sheet opens — save to Files or email it to yourself on Gmail.'
              )}
            </Text>
          </View>

          {/* ── Restore ── */}
          <View style={[styles.card, { backgroundColor: colors.parchmentSoft, borderColor: colors.divider, borderRadius: radii.lg, marginTop: 16 }]}>
            <Text style={{ fontFamily: titleFont, fontSize: 15.5, color: colors.ink }}>
              {t('नए फ़ोन पर वापस लाएँ', 'Bring it back on a new phone')}
            </Text>
            <Text style={{ fontFamily: bodyFont, fontSize: 13, lineHeight: 19.5, color: colors.inkSoft, marginTop: 8 }}>
              {t(
                'वह vedansh-backup फ़ाइल चुनें जो आपने सहेजी थी। पहले दिखेगा कि उसमें क्या है, फिर आपकी पुष्टि पर ही लिखा जाएगा।',
                'Choose the vedansh-backup file you saved. You will see what it holds first; nothing is written until you confirm.'
              )}
            </Text>
            <Pressable
              onPress={onRestore}
              disabled={busy !== 'none'}
              testID="backup-restore"
              accessibilityRole="button"
              accessibilityLabel="Restore from backup file"
              style={({ pressed }) => [
                styles.secondaryBtn,
                { borderColor: colors.saffron, borderRadius: radii.md },
                (pressed || busy !== 'none') && { opacity: 0.8 },
              ]}
            >
              <Text style={{ fontFamily: titleFont, fontSize: 14.5, color: colors.saffronDeep }}>
                {busy === 'restore' ? t('फ़ाइल पढ़ी जा रही है…', 'Reading file…') : t('फ़ाइल से पुनर्स्थापित करें', 'Restore from file')}
              </Text>
            </Pressable>
          </View>

          {noticeText ? (
            <Text
              testID="backup-notice"
              style={{ fontFamily: bodyFont, fontSize: 13, lineHeight: 19.5, color: colors.saffronDeep, marginTop: 14, textAlign: 'center' }}
            >
              {noticeText}
            </Text>
          ) : null}

          <Text style={{ fontFamily: bodyFont, fontSize: 12.5, lineHeight: 18.5, color: colors.inkMuted, marginTop: 18 }}>
            {t(
              'फ़ाइल ही बैकअप है — Vedansh के पास इसकी कोई प्रति नहीं होती। फ़ाइल खो गई तो डेटा वापस नहीं आ सकता, इसलिए समय-समय पर नया बैकअप बनाएँ।',
              'The file is the backup — Vedansh keeps no copy. A lost file cannot be recovered, so make a fresh backup from time to time.'
            )}
          </Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function describeNotice(notice: Notice, t: (hi: string, en: string) => string): string {
  switch (notice.kind) {
    case 'none':
      return '';
    case 'export-unavailable':
      return t('साझा-पत्रक उपलब्ध नहीं है।', 'The share sheet is not available here.');
    case 'export-error':
      return t('बैकअप नहीं बन सका — फिर प्रयास करें।', 'Could not create the backup — try again.');
    case 'restore-error':
      return t('पुनर्स्थापन नहीं हो सका — फिर प्रयास करें।', 'Could not restore — try again.');
    case 'restore-done-restart':
      return t(
        'पुनर्स्थापित हो गया। बदलाव देखने के लिए Vedansh को बंद करके फिर खोलें।',
        'Restored. Close and reopen Vedansh to see your data.'
      );
    case 'restore-invalid':
      switch (notice.reason) {
        case 'newer-version':
          return t(
            'यह बैकअप नए Vedansh संस्करण का है — पहले ऐप अपडेट करें।',
            'This backup is from a newer Vedansh version — update the app first.'
          );
        case 'kul-parampara-file':
          return t(
            'यह कुल परम्परा की "आगे सौंपें" फ़ाइल है, पूरा बैकअप नहीं।',
            'This is a Kul Parampara hand-on file, not a full backup.'
          );
        case 'empty':
          return t('इस बैकअप में कुछ सहेजा नहीं है।', 'This backup holds nothing to restore.');
        case 'not-a-backup':
        case 'corrupt':
        default:
          return t('यह Vedansh बैकअप फ़ाइल नहीं है।', 'This is not a Vedansh backup file.');
      }
    default:
      return '';
  }
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  scroll: { paddingTop: 4, paddingBottom: 40 },
  card: { borderWidth: 1, padding: 16 },
  divider: { height: 1, marginVertical: 12 },
  kv: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, paddingVertical: 7 },
  primaryBtn: { minHeight: 50, alignItems: 'center', justifyContent: 'center', marginTop: 16 },
  secondaryBtn: { minHeight: 50, alignItems: 'center', justifyContent: 'center', marginTop: 14, borderWidth: 1.5 },
});
