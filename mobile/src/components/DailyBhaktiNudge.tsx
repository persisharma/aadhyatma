import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, ImageBackground, Linking, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@/theme/ThemeContext';
import { fontFamilies } from '@/theme/typography';
import { useGitaLanguage } from '@/data/gita/language';
import { pick } from '@/utils/localize';
import { scriptBodyFont, scriptTitleFont } from '@/utils/langType';
import { useNotificationPreferences } from '@/contexts/NotificationPreferencesContext';
import { readNotificationPermissionState } from '@/notifications/permissionState';
import { hasWidgetHost, isWidgetPinSupported, readWidgetPayload, requestPinWidget } from '@/widgets/native';
import { WIDGET_TEXT_TOKENS, widgetBackgroundName, widgetCatalogEntry, widgetSizeLabel } from '@/widgets/catalog';
import { WIDGET_TIME_ZONE, widgetDateKey, type WidgetPayloadState } from '@/widgets/contract';
import { runningTithi } from '@/widgets/planner';
import { widgetBackgroundImages } from '@assets/widget-backgrounds';
import AppIcon from './AppIcon';
import {
  EMPTY_NUDGE_RECORD,
  NUDGE_STORAGE_KEY,
  isWidgetNudge,
  nudgeCopy,
  nudgeWidgets,
  parseNudgeRecord,
  reminderOnLine,
  selectNudge,
  widgetAddedPatch,
  type NudgeRecord,
  type NudgeWidget,
} from './dailyBhaktiNudgeView';

/** WidgetKit gallery names — `configurationDisplayName` in `VedanshWidgets.swift`. */
const IOS_WIDGET_NAMES: Record<NudgeWidget, string> = {
  verse: 'Vedansh · Verse',
  panchang: 'Vedansh · Panchang',
};

/**
 * Daily Bhakti setup strip (design.md §23). One slim row under the screen title
 * that asks for one thing at a time: switch on the daily-verse reminder, then put
 * the verse + Panchang widgets on the Home Screen. "Not now" rests the reminder ask
 * for NUDGE_SNOOZE_DAYS and ends the widget ask; the strip disappears once nothing
 * is left to ask.
 *
 * `previewLines` are the verse lines the screen shows, reused by the iOS how-to
 * sheet's widget facsimile.
 */
export default function DailyBhaktiNudge({ previewLines }: { previewLines: readonly string[] }) {
  const { colors, typography, spacing, radii } = useTheme();
  const { lang } = useGitaLanguage();
  const navigation = useNavigation<any>();
  const { prefs, permissionStatus, canAskAgain, isLoading, setDailyVerseEnabled } =
    useNotificationPreferences();
  const [record, setRecord] = useState<NudgeRecord | null>(null);
  const recordRef = useRef<NudgeRecord>(EMPTY_NUDGE_RECORD);
  const [widgetHost] = useState(hasWidgetHost);
  // Set when the reminder was switched on from this strip, so the widget ask that
  // replaces it can confirm the reminder first (design.md §23).
  const [enabledHere, setEnabledHere] = useState(false);
  const [busy, setBusy] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  // Android pins one widget per system dialog. The rest of the pair waits here
  // until that dialog closes — it pauses the app, so the return to `active` is
  // the cue; `left` records that the dialog actually took the foreground.
  const pinQueueRef = useRef<{ next: NudgeWidget[]; left: boolean }>({ next: [], left: false });

  useEffect(() => {
    let alive = true;
    AsyncStorage.getItem(NUDGE_STORAGE_KEY)
      .then((raw) => parseNudgeRecord(raw))
      .catch(() => EMPTY_NUDGE_RECORD)
      .then((loaded) => {
        if (!alive) return;
        recordRef.current = loaded;
        setRecord(loaded);
      });
    return () => {
      alive = false;
    };
  }, []);

  const persist = useCallback((patch: Partial<NudgeRecord>) => {
    const next = { ...recordRef.current, ...patch };
    recordRef.current = next;
    setRecord(next);
    AsyncStorage.setItem(NUDGE_STORAGE_KEY, JSON.stringify(next)).catch(() => undefined);
  }, []);

  const reminderOn = prefs.dailyVerseEnabled && permissionStatus === 'granted';
  const kind = selectNudge({
    ready: !isLoading && record != null,
    dailyVerseEnabled: prefs.dailyVerseEnabled,
    permissionStatus,
    canAskAgain,
    widgetHost,
    record: record ?? EMPTY_NUDGE_RECORD,
    now: Date.now(),
  });

  const turnOn = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    try {
      // The provider owns the OS ask, the persist-only-after-grant rule and the
      // global decline stamp; the strip only reads the outcome.
      await setDailyVerseEnabled(true);
      const { status } = await readNotificationPermissionState();
      if (status === 'granted') setEnabledHere(true);
      // An OS refusal is a "no" — rest this ask rather than turning straight
      // into a Settings plea.
      else persist({ reminderDismissedAt: Date.now() });
    } finally {
      setBusy(false);
    }
  }, [busy, setDailyVerseEnabled, persist]);

  const openGallery = useCallback(() => {
    navigation.navigate('MoreTab', { screen: 'WidgetGallery', initial: false });
  }, [navigation]);

  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const sub = AppState.addEventListener('change', (state) => {
      const queue = pinQueueRef.current;
      if (queue.next.length === 0) return;
      if (state !== 'active') {
        queue.left = true;
        return;
      }
      if (!queue.left) return;
      const [content, ...rest] = queue.next;
      pinQueueRef.current = { next: rest, left: false };
      // A launcher that refuses this one leaves its ask on the strip for a tap.
      requestPinWidget(content)
        .then((opened) => {
          if (opened) persist(widgetAddedPatch(content, Date.now()));
        })
        .catch(() => undefined);
    });
    return () => sub.remove();
  }, [persist]);

  const addWidget = useCallback(async () => {
    if (!kind || !isWidgetNudge(kind)) return;
    if (Platform.OS === 'ios') {
      setSheetOpen(true);
      return;
    }
    // Android launchers can pin directly; one that cannot gets the gallery's steps.
    const [first, ...rest] = nudgeWidgets(kind);
    if (!(await isWidgetPinSupported())) {
      openGallery();
      return;
    }
    // Queued before the request so the dialog's pause is never missed.
    pinQueueRef.current = { next: rest, left: false };
    if (!(await requestPinWidget(first))) {
      pinQueueRef.current = { next: [], left: false };
      openGallery();
      return;
    }
    persist(widgetAddedPatch(first, Date.now()));
  }, [kind, persist, openGallery]);

  const finishSheet = useCallback(
    (thenGallery: boolean) => {
      setSheetOpen(false);
      if (kind && isWidgetNudge(kind)) {
        const at = Date.now();
        persist(Object.assign({}, ...nudgeWidgets(kind).map((content) => widgetAddedPatch(content, at))));
      }
      if (thenGallery) openGallery();
    },
    [kind, persist, openGallery]
  );

  if (!kind) return null;

  const copy = nudgeCopy(kind, lang, prefs.times);
  const widgetKind = isWidgetNudge(kind);
  const confirmation = widgetKind && enabledHere && reminderOn ? reminderOnLine(lang, prefs.times) : null;
  const titleFont = scriptBodyFont(lang, typography.cardHindi.fontFamily);
  const subtitleStyle =
    lang === 'en'
      ? { fontFamily: fontFamilies.latinItalic, fontSize: 14 }
      : { fontFamily: scriptBodyFont(lang, fontFamilies.devanagari), fontSize: 12 };
  const actionFont = lang === 'en' ? fontFamilies.interSemiBold : scriptTitleFont(lang, fontFamilies.devanagariBold);
  const blocked = kind === 'reminderBlocked';
  const onAction = widgetKind ? addWidget : blocked ? () => Linking.openSettings().catch(() => undefined) : turnOn;
  const actionLabel =
    kind === 'widget'
      ? pick(lang, { hi: 'श्लोक और पंचांग विजेट जोड़ें', en: 'Add the verse and Panchang widgets', gu: 'શ્લોક અને પંચાંગ વિજેટ ઉમેરો', kn: 'ಶ್ಲೋಕ ಮತ್ತು ಪಂಚಾಂಗ ವಿಜೆಟ್‌ಗಳನ್ನು ಸೇರಿಸಿ' })
      : kind === 'panchangWidget'
        ? pick(lang, { hi: 'पंचांग विजेट जोड़ें', en: 'Add the Panchang widget', gu: 'પંચાંગ વિજેટ ઉમેરો', kn: 'ಪಂಚಾಂಗ ವಿಜೆಟ್ ಸೇರಿಸಿ' })
      : blocked
        ? pick(lang, { hi: 'सूचना सेटिंग खोलें', en: 'Open notification settings', gu: 'સૂચના સેટિંગ્સ ખોલો', kn: 'ಅಧಿಸೂಚನೆ ಸೆಟ್ಟಿಂಗ್ಸ್ ತೆರೆಯಿರಿ' })
        : pick(lang, { hi: 'दैनिक श्लोक स्मरण चालू करें', en: 'Turn on the daily verse reminder', gu: 'દૈનિક શ્લોક સ્મરણ ચાલુ કરો', kn: 'ದೈನಿಕ ಶ್ಲೋಕ ಸ್ಮರಣೆ ಆನ್ ಮಾಡಿ' });
  const notNow = pick(lang, { hi: 'अभी नहीं', en: 'Not now', gu: 'હમણાં નહીં', kn: 'ಈಗ ಬೇಡ' });

  return (
    <>
      <View
        testID={`daily-bhakti-nudge-${kind}`}
        style={[
          styles.strip,
          {
            backgroundColor: colors.parchmentSoft,
            borderColor: colors.goldChipBg,
            borderRadius: radii.md,
            marginBottom: spacing.md,
            paddingLeft: spacing.md,
          },
        ]}
      >
        <View style={[styles.disc, { backgroundColor: blocked ? colors.goldTint : colors.saffronTint }]}>
          <AppIcon
            name={widgetKind ? 'widgets' : 'bell'}
            size={18}
            color={blocked ? colors.inkMuted : colors.saffronDeep}
          />
        </View>
        <View style={styles.copy}>
          {confirmation ? (
            <Text style={[styles.confirmation, { color: colors.saffronDeep, fontFamily: actionFont }]}>
              ✓ {confirmation}
            </Text>
          ) : null}
          <Text style={[styles.title, { color: colors.ink, fontFamily: titleFont }]}>{copy.title}</Text>
          <Text style={[styles.subtitle, subtitleStyle, { color: colors.inkMuted }]}>{copy.subtitle}</Text>
        </View>
        <Pressable
          testID={`daily-bhakti-nudge-${kind}-action`}
          onPress={onAction}
          disabled={busy}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          hitSlop={4}
          style={({ pressed }) => [
            styles.action,
            blocked
              ? { borderWidth: 1, borderColor: colors.saffronDeep, backgroundColor: 'transparent' }
              : { backgroundColor: colors.saffronDeep },
            { borderRadius: radii.pill, paddingHorizontal: spacing.md, opacity: busy ? 0.6 : pressed ? 0.85 : 1 },
          ]}
        >
          <Text style={[styles.actionText, { fontFamily: actionFont, color: blocked ? colors.saffronDeep : colors.onPrimary }]}>
            {copy.action}
          </Text>
        </Pressable>
        <Pressable
          testID={`daily-bhakti-nudge-${kind}-dismiss`}
          onPress={() => persist(widgetKind ? { widgetDismissedAt: Date.now() } : { reminderDismissedAt: Date.now() })}
          accessibilityRole="button"
          accessibilityLabel={notNow}
          style={({ pressed }) => [styles.dismiss, pressed && { opacity: 0.6 }]}
        >
          <AppIcon name="close" size={16} color={colors.inkMuted} />
        </Pressable>
      </View>
      {Platform.OS === 'ios' ? (
        <WidgetHowToSheet
          visible={sheetOpen}
          widgets={nudgeWidgets(kind)}
          previewLines={previewLines}
          onClose={() => setSheetOpen(false)}
          onDone={() => finishSheet(false)}
          onGallery={() => finishSheet(true)}
        />
      ) : null}
    </>
  );
}

/**
 * iOS cannot place a widget for the app, so "Add" opens this sheet instead: a
 * facsimile of each offered widget on its own sketch plate (design.md §59) — the
 * verse at Wide above the Panchang at Small — and the WidgetKit steps that add them.
 * Android never mounts it — its launcher shows the system pin dialog.
 */
function WidgetHowToSheet({
  visible,
  widgets,
  previewLines,
  onClose,
  onDone,
  onGallery,
}: {
  visible: boolean;
  widgets: readonly NudgeWidget[];
  previewLines: readonly string[];
  onClose: () => void;
  onDone: () => void;
  onGallery: () => void;
}) {
  const { colors, spacing, radii } = useTheme();
  const { lang } = useGitaLanguage();
  const [payload, setPayload] = useState<WidgetPayloadState>({ kind: 'missing' });
  const showsPanchang = widgets.includes('panchang');
  useEffect(() => {
    if (!visible || !showsPanchang) return;
    let alive = true;
    readWidgetPayload()
      .then((state) => {
        if (alive) setPayload(state);
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, [visible, showsPanchang]);

  const titleFont = scriptTitleFont(lang, fontFamilies.devanagariBold);
  const bodyFont = scriptBodyFont(lang, fontFamilies.devanagari);
  const steps = [
    pick(lang, { hi: 'होम स्क्रीन को दबाकर रखें', en: 'Long-press the Home Screen', gu: 'હોમ સ્ક્રીન દબાવી રાખો', kn: 'ಹೋಮ್ ಸ್ಕ್ರೀನ್ ಒತ್ತಿಹಿಡಿಯಿರಿ' }),
    pick(lang, { hi: 'संपादित करें या + चुनें', en: 'Tap Edit or +', gu: 'Edit અથવા + પસંદ કરો', kn: 'Edit ಅಥವಾ + ಆಯ್ಕೆಮಾಡಿ' }),
    ...widgets.map((content, index) => {
      const name = IOS_WIDGET_NAMES[content];
      const size = widgetSizeLabel(widgetCatalogEntry(content).recommended, lang);
      return index === 0
        ? pick(lang, {
            hi: `“Vedansh” खोजें, “${name}” को ${size} आकार में जोड़ें`,
            en: `Search “Vedansh”, add “${name}” at ${size}`,
            gu: `“Vedansh” શોધો, “${name}” ${size} કદમાં ઉમેરો`,
            kn: `“Vedansh” ಹುಡುಕಿ, “${name}” ಅನ್ನು ${size} ಗಾತ್ರದಲ್ಲಿ ಸೇರಿಸಿ`,
          })
        : pick(lang, {
            hi: `फिर + चुनें, “${name}” को ${size} आकार में जोड़ें`,
            en: `Tap + again, add “${name}” at ${size}`,
            gu: `ફરી + પસંદ કરો, “${name}” ${size} કદમાં ઉમેરો`,
            kn: `ಮತ್ತೆ + ಆಯ್ಕೆಮಾಡಿ, “${name}” ಅನ್ನು ${size} ಗಾತ್ರದಲ್ಲಿ ಸೇರಿಸಿ`,
          });
    }),
  ];
  const brand = <Text style={[styles.sheetBrand, { color: WIDGET_TEXT_TOKENS.gold }]}>ॐ वेदांश़</Text>;

  // The Panchang facsimile reads the published widget snapshot, so it shows what the
  // placed widget will: the tithi running now, its तक line and sunrise. Before the
  // snapshot exists it keeps the eyebrow alone rather than inventing a day.
  const now = new Date();
  const day =
    payload.kind === 'ready'
      ? payload.payload.panchang.days.find((item) => item.dateKey === widgetDateKey(now, WIDGET_TIME_ZONE))
      : undefined;
  const tithi = day ? runningTithi(day, now) : undefined;
  const panchangEyebrow =
    day && payload.kind === 'ready'
      ? `${day.representedDate[lang]} · ${payload.payload.panchang.cityLabel[lang]}`
      : pick(lang, { hi: 'आज का पंचांग', en: 'Today’s Panchang', gu: 'આજનું પંચાંગ', kn: 'ಇಂದಿನ ಪಂಚಾಂಗ' });

  const preview = (content: NudgeWidget) => {
    const size = widgetCatalogEntry(content).recommended;
    const art = size === 'lock' ? undefined : widgetBackgroundImages[widgetBackgroundName(content, size)];
    const style = [
      content === 'verse' ? styles.sheetPreview : styles.sheetPanchang,
      { backgroundColor: colors.parchmentSoft, borderColor: colors.divider, borderRadius: radii.xl },
    ];
    const body =
      content === 'verse' ? (
        <>
          <Text style={[styles.sheetEyebrow, { color: WIDGET_TEXT_TOKENS.saffronDeep, fontFamily: titleFont }]}>
            {pick(lang, { hi: 'आज का श्लोक', en: 'Today’s verse', gu: 'આજનો શ્લોક', kn: 'ಇಂದಿನ ಶ್ಲೋಕ' })}
          </Text>
          <Text numberOfLines={3} style={[styles.sheetVerse, { color: WIDGET_TEXT_TOKENS.ink, fontFamily: bodyFont }]}>
            {previewLines.join(' · ')}
          </Text>
          {brand}
        </>
      ) : (
        <>
          <Text numberOfLines={1} style={[styles.sheetEyebrow, { color: WIDGET_TEXT_TOKENS.saffronDeep, fontFamily: titleFont }]}>
            {panchangEyebrow}
          </Text>
          <View>
            {tithi ? (
              <Text numberOfLines={1} style={[styles.sheetTithi, { color: WIDGET_TEXT_TOKENS.ink, fontFamily: titleFont }]}>
                {tithi.name[lang]}
              </Text>
            ) : null}
            {[tithi?.till?.[lang], day?.sunrise[lang]].filter(Boolean).map((line) => (
              <Text key={line} numberOfLines={1} style={[styles.sheetMeta, { color: WIDGET_TEXT_TOKENS.inkMuted }]}>
                {line}
              </Text>
            ))}
          </View>
          {brand}
        </>
      );
    return (
      <View
        key={content}
        accessible
        accessibilityRole="image"
        accessibilityLabel={content === 'verse' ? 'Daily verse widget preview' : 'Panchang widget preview'}
      >
        {art ? (
          <ImageBackground source={art} resizeMode="cover" style={style} imageStyle={{ borderRadius: radii.xl }}>
            {body}
          </ImageBackground>
        ) : (
          <View style={style}>{body}</View>
        )}
      </View>
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.sheetRoot}>
        <Pressable
          style={styles.backdrop}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel={pick(lang, { hi: 'बंद करें', en: 'Close', gu: 'બંધ કરો', kn: 'ಮುಚ್ಚಿ' })}
        />
        <View testID="daily-bhakti-widget-sheet" style={[styles.sheet, { backgroundColor: colors.parchmentSoft }]}>
          <View style={[styles.grabber, { backgroundColor: colors.divider }]} />
          {/* Two facsimiles and four steps outgrow a small phone — the sheet scrolls. */}
          <ScrollView
            bounces={false}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: spacing.xxl, paddingTop: spacing.sm, gap: spacing.lg }}
          >
            <Text style={[styles.sheetTitle, { color: colors.ink, fontFamily: titleFont }]}>
              {showsPanchang && widgets.includes('verse')
                ? pick(lang, { hi: 'होम-स्क्रीन पर श्लोक और पंचांग', en: 'Verse & Panchang on your Home Screen', gu: 'હોમ સ્ક્રીન પર શ્લોક અને પંચાંગ', kn: 'ಹೋಮ್ ಸ್ಕ್ರೀನ್‌ನಲ್ಲಿ ಶ್ಲೋಕ ಮತ್ತು ಪಂಚಾಂಗ' })
                : showsPanchang
                  ? pick(lang, { hi: 'होम-स्क्रीन पर पंचांग', en: 'Panchang on your Home Screen', gu: 'હોમ સ્ક્રીન પર પંચાંગ', kn: 'ಹೋಮ್ ಸ್ಕ್ರೀನ್‌ನಲ್ಲಿ ಪಂಚಾಂಗ' })
                  : pick(lang, { hi: 'होम-स्क्रीन पर श्लोक', en: 'Verse on your Home Screen', gu: 'હોમ સ્ક્રીન પર શ્લોક', kn: 'ಹೋಮ್ ಸ್ಕ್ರೀನ್‌ನಲ್ಲಿ ಶ್ಲೋಕ' })}
            </Text>
            {widgets.map(preview)}
            <View style={{ gap: spacing.sm }}>
              {steps.map((step, index) => (
                <View key={index} style={styles.step}>
                  <View style={[styles.stepNumber, { backgroundColor: colors.saffronTint }]}>
                    <Text style={[styles.stepNumberText, { color: colors.saffronDeep }]}>{index + 1}</Text>
                  </View>
                  <Text style={[styles.stepText, { color: colors.inkSoft, fontFamily: bodyFont }]}>{step}</Text>
                </View>
              ))}
            </View>
            <Pressable
              testID="daily-bhakti-widget-sheet-done"
              onPress={onDone}
              accessibilityRole="button"
              accessibilityLabel={pick(lang, { hi: 'समझ गया', en: 'Got it', gu: 'સમજાઈ ગયું', kn: 'ಅರ್ಥವಾಯಿತು' })}
              style={({ pressed }) => [styles.sheetPrimary, { backgroundColor: colors.saffronDeep, borderRadius: radii.pill }, pressed && { opacity: 0.85 }]}
            >
              <Text style={[styles.sheetPrimaryText, { color: colors.onPrimary, fontFamily: lang === 'en' ? fontFamilies.interSemiBold : titleFont }]}>
                {pick(lang, { hi: 'समझ गया', en: 'Got it', gu: 'સમજાઈ ગયું', kn: 'ಅರ್ಥವಾಯಿತು' })}
              </Text>
            </Pressable>
            <Pressable
              testID="daily-bhakti-widget-sheet-gallery"
              onPress={onGallery}
              accessibilityRole="link"
              style={({ pressed }) => [styles.sheetLink, pressed && { opacity: 0.6 }]}
            >
              <Text style={[styles.sheetLinkText, { color: colors.saffronDeep, fontFamily: bodyFont }]}>
                {pick(lang, { hi: 'सभी विजेट देखें', en: 'See all widgets', gu: 'બધા વિજેટ જુઓ', kn: 'ಎಲ್ಲಾ ವಿಜೆಟ್‌ಗಳನ್ನು ನೋಡಿ' })}
              </Text>
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  strip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    paddingVertical: 8,
  },
  disc: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  copy: { flex: 1, minWidth: 0 },
  confirmation: { fontSize: 11, lineHeight: 16 },
  title: { fontSize: 14, lineHeight: 20 },
  subtitle: { lineHeight: 18 },
  action: { minHeight: 40, alignItems: 'center', justifyContent: 'center' },
  actionText: { fontSize: 13 },
  dismiss: { width: 36, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  sheetRoot: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(26, 14, 3, 0.45)' },
  sheet: { maxHeight: '92%', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 10, paddingBottom: 34 },
  grabber: { alignSelf: 'center', width: 40, height: 5, borderRadius: 3 },
  sheetTitle: { fontSize: 20, textAlign: 'center' },
  sheetPreview: { minHeight: 142, borderWidth: 1, padding: 16, justifyContent: 'space-between', overflow: 'hidden' },
  sheetEyebrow: { fontSize: 12 },
  sheetVerse: { fontSize: 16, lineHeight: 26, marginVertical: 8 },
  // The Small cell: a square half the sheet wide, left-aligned as it sits on the Home Screen.
  sheetPanchang: { width: 148, aspectRatio: 1, borderWidth: 1, padding: 14, justifyContent: 'space-between', overflow: 'hidden' },
  sheetTithi: { fontSize: 22, lineHeight: 33 },
  sheetMeta: { fontFamily: fontFamilies.inter, fontSize: 12, lineHeight: 18 },
  sheetBrand: { fontFamily: fontFamilies.devanagariBold, fontSize: 11 },
  step: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepNumber: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  stepNumberText: { fontFamily: fontFamilies.interSemiBold, fontSize: 13 },
  stepText: { flex: 1, fontSize: 14, lineHeight: 21 },
  sheetPrimary: { minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  sheetPrimaryText: { fontSize: 15 },
  sheetLink: { alignSelf: 'center', minHeight: 44, justifyContent: 'center', paddingHorizontal: 12 },
  sheetLinkText: { fontSize: 13 },
});
