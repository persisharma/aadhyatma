import type { VerseCardStyle } from '@/utils/shareVerse';
import AppIcon, { type AppIconName } from './AppIcon';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { LANGUAGES, type Lang } from '@/data/gita/language';
import { pick } from '@/utils/localize';
import { cardFontByLang, eyebrowTextStyle, indicSafeTag } from '@/utils/langType';
import { MAX_SHARE_PAGES, cardMetricsFor, type ShareCardLayout } from '@/utils/shareCardPages';
import SharePagesStrip, { type ShareScopeOption } from './SharePagesStrip';
import SharePagePreview from './SharePagePreview';

/**
 * Share-target picker for the verse share flow (design.md §39).
 *
 * The share button used to go straight to the OS sheet. It now opens this sheet
 * first, because the two destinations want different payloads: WhatsApp and
 * Messages take the image + a short caption, while Instagram wants the same image
 * with a hashtag block derived from the verse. Instagram gives no API for
 * pre-filling a caption, so the Instagram row copies the caption to the clipboard
 * and says so — the reader long-presses the caption field and pastes.
 *
 * The hashtags are previewed here on purpose: they change with every verse, and a
 * reader about to post wants to see what is going out with their name on it (and
 * can trim tags after pasting).
 *
 * Instagram is two rows, not one, because the destination decides the aspect: a
 * feed post shows the 4:5 card whole, while a Story or Reel is 9:16 and crops a
 * 4:5 image top and bottom — taking the card's header and branding footer with it.
 * The story row exports a real 1080×1920 frame instead (design.md §39.3).
 *
 * **Series (PRD-45, §39.5–§39.6).** When the content paginates to more than one card
 * the sheet grows a pages strip, two all-pages rows (share every selected page at
 * once; Instagram carousel) and relabels the three rows above as "this page". With a
 * single page none of that renders — a verse share is exactly the sheet it always was.
 *
 * **Card language and text (§39.8).** `lang` is the sheet's own chrome; `cardLang` is
 * what the card, caption and hashtags are written in — the reader's language by default,
 * switchable per share so a Hindi reader can send English (or Gujarati) to a relative.
 * "Send as text" hands the same reading over as one plain message, no image.
 */

export type ShareSeriesView = 'targets' | 'preview' | 'progress' | 'carouselReady';

export type ShareSeriesProps = {
  pageCount: number;
  selected: readonly boolean[];
  highlighted: number;
  renderPage: (index: number) => React.ReactNode;
  onHighlight: (index: number) => void;
  onToggle: (index: number) => void;
  scopes: readonly ShareScopeOption[];
  scopeIndex: number;
  onScope: (index: number) => void;
  /** False on a binary that predates the multi-image module — rows show, disabled. */
  multiShareAvailable: boolean;
  onShareAll: () => void;
  /** Every selected page straight into WhatsApp (§39.11). Absent → no row. */
  onShareAllWhatsApp?: () => void;
  onInstagramCarousel: () => void;
  view: ShareSeriesView;
  onView: (view: ShareSeriesView) => void;
  onPreviewStep: (delta: -1 | 1) => void;
  progress?: { done: number; total: number };
  /** Carousel pages are rendered; opens the OS sheet. */
  onContinueCarousel: () => void;
};

type Props = {
  singleCardPreview?: React.ReactNode;
  /** Offered for scripture only. */
  cardStyle?: VerseCardStyle;
  renderStylePreview?: (style: VerseCardStyle, width: number) => React.ReactNode;
  onCardStyle?: (style: VerseCardStyle) => void;
  visible: boolean;
  lang: Lang;
  /** Sheet title; defaults to "Share this verse". */
  title?: string;
  /** The hashtag line exactly as it will be pasted (`#A #B …`). */
  hashtagPreview: string;
  onShareSystem: () => void;
  /**
   * Opens WhatsApp itself rather than the OS list (§39.11). The provider passes it only
   * when WhatsApp can be opened directly (Android); absent → no row, as before.
   */
  onShareWhatsApp?: () => void;
  /** 4:5 — the tallest a feed post shows whole. */
  onShareInstagramPost: () => void;
  /** 9:16 — the card inside the Story/Reel safe area, so nothing is cropped. Opens the story editor. */
  onShareInstagramStory: () => void;
  /**
   * The same 9:16 export through the OS sheet, where Instagram's extension offers Reel —
   * its story hand-off cannot make one (§39.11). Absent → no row.
   */
  onShareInstagramReel?: () => void;
  onClose: () => void;
  /** True while a capture/share is running — every row disables. */
  busy?: boolean;
  /** Present for multi-page content. Ignored when `pageCount` is 1. */
  series?: ShareSeriesProps;
  /**
   * The card the pages are laid out for. The picture card (kids stories, §76) is 9:16
   * whatever the target, so the 4:5 Instagram-post row is not offered for it.
   */
  cardLayout?: ShareCardLayout;
  /** Verse images grow vertically to preserve the complete reading. */
  fullVerseImage?: boolean;
  /** A self-drawn card (Panchang, Jyotish, Suvichar — §39.10): the same tall-image rows, card wording. */
  wholeCard?: boolean;
  /** One muted line under the preview (a privacy statement), already localized. */
  note?: string;
  /** Card settings under the preview (Panchang co-branding); single cards only. */
  controls?: React.ReactNode;
  /** Text-row overrides, already localized (a caller-owned hand-off such as the Kundali report text). */
  textTitle?: string;
  textSub?: string;
  textA11y?: string;
  /** Language the card + caption are written in; with `onCardLang`, shows the chips. */
  cardLang?: Lang;
  onCardLang?: (lang: Lang) => void;
  /** The reading as one plain message (verse, or every selected page). Absent → no row. */
  onShareText?: () => void;
};

type RowProps = {
  icon: AppIconName;
  title: string;
  sub: string;
  chips?: string[];
  hotChip?: boolean;
  lang: Lang;
  onPress: () => void;
  disabled?: boolean;
  divider?: boolean;
  accessibilityLabel: string;
  accessibilityHint?: string;
};

function TargetRow(p: RowProps) {
  const { colors } = useTheme();
  const titleFont = cardFontByLang(p.lang);
  return (
    <Pressable
      onPress={p.onPress}
      disabled={p.disabled}
      accessibilityRole="button"
      accessibilityLabel={p.accessibilityLabel}
      accessibilityHint={p.accessibilityHint}
      style={({ pressed }) => [
        styles.row,
        p.divider !== false && { borderBottomWidth: 1, borderBottomColor: colors.divider },
        { opacity: p.disabled ? 0.5 : pressed ? 0.7 : 1 },
      ]}
    >
      <AppIcon name={p.icon} size={22} color={colors.saffron} />
      <View style={styles.rowText}>
        <Text style={{ fontFamily: titleFont, fontSize: 17, color: colors.ink }}>{p.title}</Text>
        <Text style={[eyebrowTextStyle(p.lang, 12), { color: colors.inkMuted }]}>{p.sub}</Text>
      </View>
      {(p.chips ?? []).map((chip) => (
        <Text
          key={chip}
          style={[
            styles.ratio,
            p.hotChip
              ? { color: colors.saffronDeep, borderColor: colors.cardActiveBorder, backgroundColor: colors.saffronTint }
              : { color: colors.inkMuted, borderColor: colors.divider },
          ]}
        >
          {chip}
        </Text>
      ))}
    </Pressable>
  );
}

export default function ShareTargetSheet({
  visible,
  lang,
  title,
  hashtagPreview,
  onShareSystem,
  onShareWhatsApp,
  onShareInstagramPost,
  onShareInstagramStory,
  onShareInstagramReel,
  onClose,
  busy,
  series,
  cardLayout,
  fullVerseImage,
  cardLang,
  onCardLang,
  onShareText,
  singleCardPreview,
  cardStyle,
  renderStylePreview,
  onCardStyle,
  wholeCard,
  note,
  controls,
  textTitle,
  textSub,
  textA11y,
}: Props) {
  const { colors, spacing, radii } = useTheme();
  const [stylePicked, setStylePicked] = useState(false);
  const { width: windowWidth, fontScale } = useWindowDimensions();
  const choosingStyle = !!cardStyle && !!onCardStyle && !stylePicked;
  const stackedChoices = fontScale > 1.3;
  const thumbWidth = Math.max(90, Math.min(170, (windowWidth - spacing.xxl * 2 - 12) / (stackedChoices ? 1 : 2) - 18));
  const backToStyles = () => { if (!busy) setStylePicked(false); };
  const cardSize = cardMetricsFor(cardLayout);
  const wholeImage = fullVerseImage || wholeCard;
  const subLabel = eyebrowTextStyle(lang, 12);
  const titleFont = cardFontByLang(lang);
  const multi = series && series.pageCount > 1 ? series : null;
  const selectedCount = multi ? multi.selected.filter(Boolean).length : 0;
  const allDisabled = !!busy || !multi?.multiShareAvailable || selectedCount > MAX_SHARE_PAGES;
  const pageChip = multi
    ? [pick(lang, { hi: `पृष्ठ ${multi.highlighted + 1}`, en: `page ${multi.highlighted + 1}`, gu: `પૃષ્ઠ ${multi.highlighted + 1}`, kn: `ಪುಟ ${multi.highlighted + 1}` })]
    : [];
  const eyebrow = [indicSafeTag(lang, 1.6), { fontSize: 10, color: colors.inkMuted, marginTop: spacing.md }];

  const heading = (
    <Text
      accessibilityRole="header"
      style={{ fontFamily: titleFont, fontSize: 18, color: colors.ink, textAlign: 'center', marginBottom: multi ? 2 : spacing.md }}
    >
      {choosingStyle ? pick(lang, { hi: 'कैसा कार्ड साझा करें?', en: 'Which card would you like to share?', gu: 'કયું કાર્ડ શેર કરવું છે?', kn: 'ಯಾವ ಕಾರ್ಡ್ ಹಂಚಿಕೊಳ್ಳಲು ಬಯಸುತ್ತೀರಿ?' }) : title ??
        pick(lang, { hi: 'श्लोक साझा करें', en: 'Share this verse', gu: 'શ્લોક શેર કરો', kn: 'ಶ್ಲೋಕ ಹಂಚಿಕೊಳ್ಳಿ' })}
    </Text>
  );

  const textRow = onShareText ? (
    <TargetRow
      lang={lang}
      icon="text"
      title={textTitle ?? pick(lang, { hi: 'टेक्स्ट में भेजें', en: 'Send as text', gu: 'લખાણ તરીકે મોકલો', kn: 'ಪಠ್ಯವಾಗಿ ಕಳುಹಿಸಿ' })}
      sub={textSub ? textSub : multi
        ? pick(lang, { hi: 'चुने पृष्ठ एक संदेश में — बिना चित्र', en: 'Selected pages as one message — no image', gu: 'પસંદ પૃષ્ઠ એક સંદેશમાં — ચિત્ર વિના', kn: 'ಆಯ್ಕೆಯ ಪುಟಗಳು ಒಂದು ಸಂದೇಶದಲ್ಲಿ — ಚಿತ್ರವಿಲ್ಲ' })
        : fullVerseImage
        ? pick(lang, { hi: 'पूरा श्लोक और अर्थ — बिना चित्र', en: 'Full verse and meaning — no image', gu: 'સંપૂર્ણ શ્લોક અને અર્થ — ચિત્ર વિના', kn: 'ಸಂಪೂರ್ಣ ಶ್ಲೋಕ ಮತ್ತು ಅರ್ಥ — ಚಿತ್ರವಿಲ್ಲ' })
        : pick(lang, { hi: 'पूरा पाठ एक संदेश में — बिना चित्र', en: 'The full text as one message — no image', gu: 'આખું લખાણ એક સંદેશમાં — ચિત્ર વિના', kn: 'ಸಂಪೂರ್ಣ ಪಠ್ಯ ಒಂದು ಸಂದೇಶದಲ್ಲಿ — ಚಿತ್ರವಿಲ್ಲ' })}
      chips={multi ? [String(selectedCount)] : undefined}
      onPress={onShareText}
      disabled={busy}
      divider={false}
      accessibilityLabel={textA11y ?? 'Send as text'}
      accessibilityHint="Opens the share sheet with the reading as a plain message, without an image"
    />
  ) : null;

  const langChips = cardLang && onCardLang ? (
    <View style={styles.langWrap}>
      <Text style={[indicSafeTag(lang, 1.6), { fontSize: 10, color: colors.inkMuted }]}>
        {pick(lang, { hi: 'कार्ड की भाषा', en: 'CARD LANGUAGE', gu: 'કાર્ડની ભાષા', kn: 'ಕಾರ್ಡ್ ಭಾಷೆ' })}
      </Text>
      <View style={styles.langRow} accessibilityRole="radiogroup" accessibilityLabel="Card language">
        {LANGUAGES.map((opt) => {
          const on = opt.value === cardLang;
          return (
            <Pressable
              key={opt.value}
              onPress={() => onCardLang(opt.value)}
              disabled={busy || on}
              accessibilityRole="radio"
              accessibilityState={{ selected: on }}
              accessibilityLabel={`Card language: ${opt.a11yLabel}`}
              testID={`share-card-lang-${opt.value}`}
              hitSlop={6}
              style={({ pressed }) => [
                styles.langChip,
                { borderRadius: radii.pill, borderColor: on ? colors.cardActiveBorder : colors.divider },
                on && { backgroundColor: colors.saffronTint },
                pressed && !on && { opacity: 0.7 },
              ]}
            >
              <Text style={{ fontFamily: cardFontByLang(opt.value), fontSize: 14, color: on ? colors.saffronDeep : colors.inkMuted }}>
                {opt.nativeLabel}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  ) : null;

  const styleChoices = cardStyle && onCardStyle ? (
    <View testID="share-card-styles" style={{ gap: 12, marginVertical: spacing.sm, flexDirection: stackedChoices ? 'column' : 'row', alignItems: 'stretch' }}>
      {([
        { value: 'current', label: { hi: 'मौजूदा कार्ड', en: 'Current card', gu: 'હાલનું કાર્ડ', kn: 'ಪ್ರಸ್ತುತ ಕಾರ್ಡ್' },
          detail: { hi: 'सादा पाठ और अर्थ', en: 'Classic verse and meaning', gu: 'સાદો પાઠ અને અર્થ', kn: 'ಸರಳ ಪಠ್ಯ ಮತ್ತು ಅರ್ಥ' } },
        { value: 'daily-bhakti', label: { hi: 'दैनिक भक्ति कार्ड', en: 'Daily Bhakti card', gu: 'દૈનિક ભક્તિ કાર્ડ', kn: 'ದೈನಂದಿನ ಭಕ್ತಿ ಕಾರ್ಡ್' },
          detail: { hi: 'चित्र के साथ पाठ और अर्थ', en: 'Illustrated verse and meaning', gu: 'ચિત્ર સાથે પાઠ અને અર્થ', kn: 'ಚಿತ್ರದೊಂದಿಗೆ ಪಠ್ಯ ಮತ್ತು ಅರ್ಥ' } },
      ] as const).map(option => {
        const selected = cardStyle === option.value;
        return <Pressable key={option.value} testID={`share-card-style-${option.value}`}
          accessibilityRole="button" accessibilityLabel={`Card style: ${option.value === 'current' ? 'Current card' : 'Daily Bhakti card'}`}
          accessibilityState={{ checked: selected, disabled: !!busy }} disabled={busy}
          onPress={() => { onCardStyle(option.value); setStylePicked(true); }}
          style={({ pressed }) => ({ flex: stackedChoices ? undefined : 1, minWidth: 0, minHeight: 48, borderWidth: 1, borderRadius: radii.md, padding: 8,
            backgroundColor: selected ? colors.saffronTint : colors.parchmentSoft,
            borderColor: selected ? colors.saffron : colors.divider, opacity: busy ? .5 : pressed ? .7 : 1 })}>
          {renderStylePreview ? <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ height: 180, alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
            {renderStylePreview(option.value, thumbWidth)}
          </View> : null}
          <Text style={{ fontFamily: titleFont, fontSize: 16, color: selected ? colors.saffronDeep : colors.ink }}>
            {pick(lang, option.label)}
          </Text>
          <Text style={[subLabel, { color: colors.inkMuted }]}>{pick(lang, option.detail)}</Text>
          <Text style={[subLabel, { color: colors.saffronDeep, marginTop: 12, paddingVertical: 8 }]}>
            {pick(lang, { hi: 'यह कार्ड चुनें →', en: 'Choose this card →', gu: 'આ કાર્ડ પસંદ કરો →', kn: 'ಈ ಕಾರ್ಡ್ ಆರಿಸಿ →' })}
          </Text>
        </Pressable>;
      })}
    </View>
  ) : null;

  let body: React.ReactNode;
  if (multi && multi.view === 'preview') {
    body = (
      <SharePagePreview
        lang={lang}
        index={multi.highlighted}
        count={multi.pageCount}
        included={multi.selected[multi.highlighted]}
        renderPage={multi.renderPage}
        cardSize={cardSize}
        onStep={multi.onPreviewStep}
        onToggle={() => multi.onToggle(multi.highlighted)}
        onDone={() => multi.onView('targets')}
      />
    );
  } else if (multi && multi.view === 'progress') {
    const done = multi.progress?.done ?? 0;
    const total = Math.max(1, multi.progress?.total ?? selectedCount);
    body = (
      <View style={styles.center} accessibilityLiveRegion="polite">
        <Text style={{ fontFamily: titleFont, fontSize: 17, color: colors.ink, textAlign: 'center' }}>
          {pick(lang, {
            hi: `पृष्ठ ${Math.min(done + 1, total)} / ${total} बन रहा है…`,
            en: `Rendering page ${Math.min(done + 1, total)} of ${total}…`,
            gu: `પૃષ્ઠ ${Math.min(done + 1, total)} / ${total} બની રહ્યું છે…`,
            kn: `ಪುಟ ${Math.min(done + 1, total)} / ${total} ತಯಾರಾಗುತ್ತಿದೆ…`,
          })}
        </Text>
        <View style={[styles.bar, { backgroundColor: colors.saffronTint }]}>
          <View style={[styles.barFill, { width: `${Math.round((done / total) * 100)}%`, backgroundColor: colors.saffron }]} />
        </View>
      </View>
    );
  } else if (multi && multi.view === 'carouselReady') {
    const n = multi.progress?.total ?? selectedCount;
    const steps =
      Platform.OS === 'ios'
        ? [
            pick(lang, { hi: 'अगली शीट में Instagram चुनें — सभी पृष्ठ एक पोस्ट में आएँगे', en: 'In the next sheet pick Instagram — all pages go into one post', gu: 'આગળની શીટમાં Instagram પસંદ કરો', kn: 'ಮುಂದಿನ ಶೀಟ್‌ನಲ್ಲಿ Instagram ಆರಿಸಿ' }),
            pick(lang, { hi: `Instagram एक ही चित्र ले तो: “Save ${n} Images” चुनें, फिर Instagram → + → Select multiple`, en: `If Instagram takes only one: choose “Save ${n} Images”, then Instagram → + → Select multiple`, gu: `Instagram એક જ ચિત્ર લે તો: “Save ${n} Images”, પછી Instagram → + → Select multiple`, kn: `Instagram ಒಂದೇ ಚಿತ್ರ ತೆಗೆದುಕೊಂಡರೆ: “Save ${n} Images”, ನಂತರ Instagram → + → Select multiple` }),
          ]
        : [
            pick(lang, { hi: 'अगली शीट में Instagram → Feed चुनें — सभी पृष्ठ एक पोस्ट में आएँगे', en: 'In the next sheet pick Instagram → Feed — all pages go into one post', gu: 'આગળની શીટમાં Instagram → Feed પસંદ કરો', kn: 'ಮುಂದಿನ ಶೀಟ್‌ನಲ್ಲಿ Instagram → Feed ಆರಿಸಿ' }),
            pick(lang, { hi: 'Instagram एक ही चित्र ले तो: पृष्ठ Photos/Gallery में सहेजें, फिर Instagram → + → Select multiple', en: 'If Instagram takes only one: save the pages to Photos/Gallery, then Instagram → + → Select multiple', gu: 'Instagram એક જ ચિત્ર લે તો: Photos/Gallery માં સાચવો, પછી Instagram → + → Select multiple', kn: 'Instagram ಒಂದೇ ಚಿತ್ರ ತೆಗೆದುಕೊಂಡರೆ: Photos/Gallery ನಲ್ಲಿ ಉಳಿಸಿ, ನಂತರ Instagram → + → Select multiple' }),
          ];
    steps.push(
      pick(lang, { hi: 'कैप्शन और हैशटैग कॉपी हो चुके हैं — कैप्शन में लंबा दबाकर पेस्ट करें', en: 'Caption + hashtags are copied — long-press the caption and paste', gu: 'કૅપ્શન અને હૅશટૅગ કૉપી થઈ ગયા છે — પેસ્ટ કરો', kn: 'ಶೀರ್ಷಿಕೆ ಮತ್ತು ಹ್ಯಾಶ್‌ಟ್ಯಾಗ್ ಕಾಪಿ ಆಗಿದೆ — ಪೇಸ್ಟ್ ಮಾಡಿ' })
    );
    body = (
      <View style={styles.ready}>
        <Text style={{ fontFamily: titleFont, fontSize: 17, color: colors.ink, textAlign: 'center' }}>
          {pick(lang, { hi: `${n} पृष्ठ तैयार`, en: `${n} pages ready`, gu: `${n} પૃષ્ઠ તૈયાર`, kn: `${n} ಪುಟಗಳು ಸಿದ್ಧ` })}
        </Text>
        {steps.map((step, i) => (
          <View key={i} style={styles.step}>
            <Text style={[styles.stepNo, { color: colors.saffronDeep, backgroundColor: colors.saffronTint }]}>{i + 1}</Text>
            <Text style={[subLabel, { color: colors.inkSoft, flex: 1, fontSize: 13, lineHeight: 20 }]}>{step}</Text>
          </View>
        ))}
        <Pressable
          onPress={multi.onContinueCarousel}
          accessibilityRole="button"
          accessibilityLabel="Continue to Instagram"
          style={({ pressed }) => [
            styles.primary,
            { backgroundColor: colors.saffron, borderRadius: radii.md },
            pressed && { opacity: 0.8 },
          ]}
        >
          <Text style={{ fontFamily: titleFont, fontSize: 15, color: colors.onPrimary }}>
            {pick(lang, { hi: 'आगे बढ़ें', en: 'Continue', gu: 'આગળ વધો', kn: 'ಮುಂದುವರಿಸಿ' })}
          </Text>
        </Pressable>
      </View>
    );
  } else {
    const allSub = !multi?.multiShareAvailable
      ? pick(lang, { hi: 'ऐप के नए अपडेट में उपलब्ध', en: 'Needs the latest app update', gu: 'ઍપના નવા અપડેટમાં', kn: 'ಹೊಸ ಆ್ಯಪ್ ಅಪ್‌ಡೇಟ್‌ನಲ್ಲಿ' })
      : null;
    body = (
      <>
        {multi ? (
          <>
            <Text style={[subLabel, { color: colors.inkMuted, textAlign: 'center', marginBottom: spacing.md }]}>
              {pick(lang, {
                hi: 'एक कार्ड में नहीं समाता — कार्ड्स की शृंखला बनी',
                en: 'Too long for one card — split into a series',
                gu: 'એક કાર્ડમાં સમાતું નથી — કાર્ડની શ્રેણી બની',
                kn: 'ಒಂದು ಕಾರ್ಡ್‌ಗೆ ಉದ್ದ — ಕಾರ್ಡ್‌ಗಳ ಸರಣಿ',
              })}
            </Text>
            <SharePagesStrip
              lang={lang}
              pageCount={multi.pageCount}
              selected={multi.selected}
              highlighted={multi.highlighted}
              renderPage={multi.renderPage}
        cardSize={cardSize}
              onHighlight={multi.onHighlight}
              onToggle={multi.onToggle}
              onPreview={() => multi.onView('preview')}
              scopes={multi.scopes}
              scopeIndex={multi.scopeIndex}
              onScope={multi.onScope}
              disabled={busy}
            />
            <Text style={eyebrow}>
              {pick(lang, { hi: `सभी चुने पृष्ठ · ${selectedCount}`, en: `ALL SELECTED PAGES · ${selectedCount}`, gu: `બધાં પસંદ પૃષ્ઠ · ${selectedCount}`, kn: `ಆಯ್ಕೆಯ ಎಲ್ಲ ಪುಟಗಳು · ${selectedCount}` })}
            </Text>
            {multi.onShareAllWhatsApp ? (
              <TargetRow
                lang={lang}
                icon="whatsapp"
                title={pick(lang, { hi: 'WhatsApp एल्बम', en: 'WhatsApp album', gu: 'WhatsApp આલ્બમ', kn: 'WhatsApp ಆಲ್ಬಮ್' })}
                sub={pick(lang, { hi: 'सभी चुने पृष्ठ सीधे WhatsApp में', en: 'Every selected page, straight to WhatsApp', gu: 'બધાં પસંદ પૃષ્ઠ સીધાં WhatsApp માં', kn: 'ಆಯ್ಕೆಯ ಎಲ್ಲ ಪುಟಗಳು ನೇರವಾಗಿ WhatsApp ಗೆ' })}
                chips={[String(selectedCount)]}
                hotChip
                onPress={multi.onShareAllWhatsApp}
                disabled={allDisabled}
                accessibilityLabel="Share all pages on WhatsApp"
                accessibilityHint="Renders every selected page, then opens WhatsApp with them and the app link"
              />
            ) : null}
            <TargetRow
              lang={lang}
              icon="share"
              title={pick(lang, { hi: 'सभी पृष्ठ साझा करें', en: 'Share all pages', gu: 'બધાં પૃષ્ઠ શેર કરો', kn: 'ಎಲ್ಲ ಪುಟ ಹಂಚಿಕೊಳ್ಳಿ' })}
              sub={allSub ?? pick(lang, { hi: 'WhatsApp एल्बम, संदेश, Photos में सहेजें', en: 'WhatsApp album, Messages, Save to Photos', gu: 'WhatsApp આલ્બમ, સંદેશ, Photos', kn: 'WhatsApp ಆಲ್ಬಮ್, ಸಂದೇಶ, Photos' })}
              chips={[String(selectedCount)]}
              hotChip
              onPress={multi.onShareAll}
              disabled={allDisabled}
              accessibilityLabel="Share all pages"
            />
            <TargetRow
              lang={lang}
              icon="instagram"
              title={pick(lang, { hi: 'Instagram कैरोसेल', en: 'Instagram carousel', gu: 'Instagram કૅરોસેલ', kn: 'Instagram ಕ್ಯಾರೋಸೆಲ್' })}
              sub={allSub ?? pick(lang, { hi: 'सभी पृष्ठ एक पोस्ट में — कैप्शन कॉपी होगा', en: 'All pages as one post — caption is copied', gu: 'બધાં પૃષ્ઠ એક પોસ્ટમાં', kn: 'ಎಲ್ಲ ಪುಟಗಳು ಒಂದು ಪೋಸ್ಟ್‌ನಲ್ಲಿ' })}
              chips={[String(selectedCount)]}
              hotChip
              onPress={multi.onInstagramCarousel}
              disabled={allDisabled}
              divider={!!textRow}
              accessibilityLabel="Share as Instagram carousel"
              accessibilityHint="Renders every selected page, copies the caption, then opens the share sheet"
            />
            {textRow}
            <Text style={eyebrow}>
              {pick(lang, { hi: `केवल यह पृष्ठ · ${multi.highlighted + 1}`, en: `JUST THIS PAGE · ${multi.highlighted + 1}`, gu: `માત્ર આ પૃષ્ઠ · ${multi.highlighted + 1}`, kn: `ಈ ಪುಟ ಮಾತ್ರ · ${multi.highlighted + 1}` })}
            </Text>
          </>
        ) : null}

        {onShareWhatsApp && !multi ? (
          <TargetRow
            lang={lang}
            icon="whatsapp"
            title="WhatsApp"
            sub={wholeImage
              ? pick(lang, { hi: 'सीधे WhatsApp में — पूरा चित्र और ऐप का लिंक', en: 'Straight to WhatsApp — the whole image and the app link', gu: 'સીધું WhatsApp માં — આખું ચિત્ર અને ઍપની લિંક', kn: 'ನೇರವಾಗಿ WhatsApp ಗೆ — ಇಡೀ ಚಿತ್ರ ಮತ್ತು ಆ್ಯಪ್ ಲಿಂಕ್' })
              : pick(lang, { hi: 'सीधे WhatsApp में — कार्ड और ऐप का लिंक', en: 'Straight to WhatsApp — the card and the app link', gu: 'સીધું WhatsApp માં — કાર્ડ અને ઍપની લિંક', kn: 'ನೇರವಾಗಿ WhatsApp ಗೆ — ಕಾರ್ಡ್ ಮತ್ತು ಆ್ಯಪ್ ಲಿಂಕ್' })}
            onPress={onShareWhatsApp}
            disabled={busy}
            accessibilityLabel="Share on WhatsApp"
            accessibilityHint="Opens WhatsApp with the image and the app link"
          />
        ) : null}
        <TargetRow
          lang={lang}
          icon="share"
          title={pick(lang, { hi: 'शेयर करें', en: 'Share', gu: 'શેર કરો', kn: 'ಹಂಚಿಕೊಳ್ಳಿ' })}
          sub={pick(lang, { hi: 'WhatsApp, संदेश या कहीं भी', en: 'WhatsApp, Messages, anywhere', gu: 'WhatsApp, સંદેશ કે ગમે ત્યાં', kn: 'WhatsApp, ಸಂದೇಶ ಅಥವಾ ಎಲ್ಲಿಯಾದರೂ' })}
          chips={pageChip}
          onPress={onShareSystem}
          disabled={busy}
          accessibilityLabel="Share to other apps"
        />
        {cardLayout === 'picture' ? null : (
          <TargetRow
            lang={lang}
            icon="instagram"
            title={pick(lang, { hi: 'Instagram पोस्ट', en: 'Instagram post', gu: 'Instagram પોસ્ટ', kn: 'Instagram ಪೋಸ್ಟ್' })}
            sub={wholeCard
              ? pick(lang, { hi: 'पूरा कार्ड 4:5 फ़्रेम में — कुछ नहीं कटेगा', en: 'The whole card in a 4:5 frame — nothing cropped', gu: 'આખું કાર્ડ 4:5 ફ્રેમમાં — કશું કપાશે નહીં', kn: 'ಇಡೀ ಕಾರ್ಡ್ 4:5 ಚೌಕಟ್ಟಿನಲ್ಲಿ — ಏನೂ ಕತ್ತರಿಸುವುದಿಲ್ಲ' })
              : fullVerseImage ? pick(lang, { hi: 'पूरा श्लोक और अर्थ एक चित्र में', en: 'Complete verse and meaning in one image', gu: 'સંપૂર્ણ શ્લોક અને અર્થ એક ચિત્રમાં', kn: 'ಸಂಪೂರ್ಣ ಶ್ಲೋಕ ಮತ್ತು ಅರ್ಥ ಒಂದೇ ಚಿತ್ರದಲ್ಲಿ' }) : pick(lang, { hi: 'फ़ीड के लिए 4:5 कार्ड', en: '4:5 card — for the feed', gu: 'ફીડ માટે 4:5 કાર્ડ', kn: 'ಫೀಡ್‌ಗಾಗಿ 4:5 ಕಾರ್ಡ್' })}
            chips={wholeImage ? pageChip : [...pageChip, '4:5']}
            onPress={onShareInstagramPost}
            disabled={busy}
            accessibilityLabel="Share on Instagram"
            accessibilityHint={wholeCard ? 'The whole card in a 4 by 5 frame. Copies the caption and hashtags, then opens Instagram' : fullVerseImage ? 'Complete verse image. Copies the caption and hashtags, then opens Instagram' : 'Instagram post, 4 by 5. Copies the caption and hashtags, then opens Instagram'}
          />
        )}
        <TargetRow
          lang={lang}
          icon="instagram"
          title={pick(lang, { hi: 'Instagram स्टोरी', en: 'Instagram story', gu: 'Instagram સ્ટોરી', kn: 'Instagram ಸ್ಟೋರಿ' })}
          sub={wholeCard
            ? pick(lang, { hi: 'स्टोरी फ्रेम में पूरा कार्ड', en: 'Story frame with the whole card', gu: 'સ્ટોરી ફ્રેમમાં આખું કાર્ડ', kn: 'ಸ್ಟೋರಿ ಚೌಕಟ್ಟಿನಲ್ಲಿ ಇಡೀ ಕಾರ್ಡ್' })
            : fullVerseImage
            ? pick(lang, { hi: 'स्टोरी फ्रेम में पूरा श्लोक और अर्थ', en: 'Story frame with the complete verse and meaning', gu: 'સ્ટોરી ફ્રેમમાં સંપૂર્ણ શ્લોક અને અર્થ', kn: 'ಸ್ಟೋರಿ ಚೌಕಟ್ಟಿನಲ್ಲಿ ಸಂಪೂರ್ಣ ಶ್ಲೋಕ ಮತ್ತು ಅರ್ಥ' })
            : pick(lang, { hi: 'पूरी स्क्रीन 9:16 — कुछ भी नहीं कटेगा', en: 'Full screen 9:16 — nothing gets cropped', gu: 'આખી સ્ક્રીન 9:16 — કશું કપાશે નહીં', kn: 'ಪೂರ್ಣ ಪರದೆ 9:16 — ಏನೂ ಕತ್ತರಿಸುವುದಿಲ್ಲ' })}
          chips={wholeImage ? pageChip : [...pageChip, '9:16']}
          onPress={onShareInstagramStory}
          disabled={busy}
          divider={onShareInstagramReel ? true : !multi && !!textRow}
          accessibilityLabel="Share as Instagram story"
          accessibilityHint={wholeCard ? 'The whole card in a story frame. Copies the caption and hashtags, then opens Instagram' : fullVerseImage ? 'Complete verse image in a story frame. Copies the caption and hashtags, then opens Instagram' : 'Full screen 9 by 16, nothing cropped. Copies the caption and hashtags, then opens Instagram'}
        />
        {onShareInstagramReel ? (
          <TargetRow
            lang={lang}
            icon="instagram"
            title={pick(lang, { hi: 'Instagram रील', en: 'Instagram reel', gu: 'Instagram રીલ', kn: 'Instagram ರೀಲ್' })}
            sub={pick(lang, { hi: 'वही 9:16 फ्रेम — Instagram में रील चुनें', en: 'The same 9:16 frame — pick Reel in Instagram', gu: 'એ જ 9:16 ફ્રેમ — Instagram માં રીલ પસંદ કરો', kn: 'ಅದೇ 9:16 ಚೌಕಟ್ಟು — Instagram ನಲ್ಲಿ ರೀಲ್ ಆಯ್ಕೆಮಾಡಿ' })}
            chips={wholeImage ? pageChip : [...pageChip, '9:16']}
            onPress={onShareInstagramReel}
            disabled={busy}
            divider={!multi && !!textRow}
            accessibilityLabel="Share as Instagram reel"
            accessibilityHint="The same 9 by 16 frame. Copies the caption and hashtags, then opens the share sheet; choose Instagram, then Reel"
          />
        ) : null}
        {multi ? null : textRow}

        {wholeCard ? (
          <Text style={[subLabel, styles.copyNote, { color: colors.inkMuted }]}>
            {pick(lang, {
              hi: 'WhatsApp पर पूरा कार्ड एक चित्र में जाएगा, साथ में ऐप का लिंक।',
              en: 'WhatsApp gets the whole card as one image, with the app link.',
              gu: 'WhatsApp પર આખું કાર્ડ એક ચિત્રમાં જશે, સાથે ઍપની લિંક.',
              kn: 'WhatsApp ಗೆ ಇಡೀ ಕಾರ್ಡ್ ಒಂದೇ ಚಿತ್ರವಾಗಿ, ಆ್ಯಪ್ ಲಿಂಕ್ ಜೊತೆ ಹೋಗುತ್ತದೆ.',
            })}
          </Text>
        ) : fullVerseImage ? (
          <Text style={[subLabel, styles.copyNote, { color: colors.inkMuted }]}>
            {pick(lang, {
              hi: 'लंबे श्लोक एक ऊँचे चित्र में आएँगे। Instagram में चित्र का फ्रेम समायोजित करना पड़ सकता है।',
              en: 'Long verses use one taller image. You may need to adjust its framing in Instagram.',
              gu: 'લાંબા શ્લોક એક ઊંચા ચિત્રમાં આવશે. Instagram માં ચિત્રની ફ્રેમ ગોઠવવી પડી શકે છે.',
              kn: 'ಉದ್ದವಾದ ಶ್ಲೋಕಗಳು ಒಂದೇ ಎತ್ತರದ ಚಿತ್ರದಲ್ಲಿ ಬರುತ್ತವೆ. Instagram ನಲ್ಲಿ ಚಿತ್ರದ ಚೌಕಟ್ಟನ್ನು ಹೊಂದಿಸಬೇಕಾಗಬಹುದು.',
            })}
          </Text>
        ) : null}

        <Text style={[subLabel, styles.copyNote, { color: colors.inkMuted }]}>
          {pick(lang, {
            hi: 'Instagram के हर विकल्प में कैप्शन और हैशटैग कॉपी हो जाएँगे — Instagram में पेस्ट कर दें',
            en: 'Every Instagram option copies the caption + hashtags — just paste in Instagram',
            gu: 'Instagram ના દરેક વિકલ્પમાં કૅપ્શન અને હૅશટૅગ કૉપી થશે — Instagram માં પેસ્ટ કરો',
            kn: 'ಪ್ರತಿ Instagram ಆಯ್ಕೆಯಲ್ಲೂ ಶೀರ್ಷಿಕೆ ಮತ್ತು ಹ್ಯಾಶ್‌ಟ್ಯಾಗ್ ಕಾಪಿ ಆಗುತ್ತವೆ — Instagram ನಲ್ಲಿ ಪೇಸ್ಟ್ ಮಾಡಿ',
          })}
        </Text>

        <View
          style={[
            styles.preview,
            {
              backgroundColor: colors.parchmentSoft,
              borderColor: colors.divider,
              borderRadius: radii.md,
              marginTop: spacing.sm,
            },
          ]}
        >
          <Text style={[indicSafeTag(lang, 1.6), { fontSize: 10, color: colors.inkMuted, marginBottom: 6 }]}>
            {pick(lang, { hi: 'हैशटैग', en: 'HASHTAGS', gu: 'હૅશટૅગ', kn: 'ಹ್ಯಾಶ್‌ಟ್ಯಾಗ್' })}
          </Text>
          <ScrollView style={styles.previewScroll} nestedScrollEnabled>
            <Text
              accessibilityLabel={`Hashtags: ${hashtagPreview}`}
              style={{ fontSize: 12, lineHeight: 18, color: colors.saffronDeep }}
            >
              {hashtagPreview}
            </Text>
          </ScrollView>
        </View>
      </>
    );
  }

  const showCancel = !multi || multi.view === 'targets' || multi.view === 'carouselReady';

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={cardStyle && stylePicked ? backToStyles : onClose}>
      {/* Card settings can hold text fields (co-branding): keep them above the iOS keyboard. */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboard}>
      <Pressable
        accessible={false}
        style={[styles.backdrop, { backgroundColor: colors.modalBackdrop }]}
        onPress={multi?.view === 'progress' ? undefined : onClose}
      >
        <Pressable
          accessible={false}
          onPress={(e) => e.stopPropagation()}
          style={[
            styles.sheet,
            { backgroundColor: colors.parchmentHighlight, paddingHorizontal: spacing.xxl },
          ]}
        >
          <View style={[styles.grabber, { backgroundColor: colors.divider }]} />
          {multi?.view === 'preview' ? null : heading}
          {/* Always scrollable: the language chips and text row make even the verse
              sheet taller than a small phone's 92 %. */}
          <ScrollView key={choosingStyle ? 'styles' : 'targets'} style={styles.body} bounces={false} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {!choosingStyle && (!multi || multi.view === 'targets') ? langChips : null}
            {choosingStyle ? <>
              <Text style={[subLabel, { color: colors.inkMuted, textAlign: 'center' }]}>{pick(lang, { hi: 'दो रूप, वही श्लोक और पूरा अर्थ।', en: 'Two styles. The same complete verse and meaning.', gu: 'બે શૈલી, એ જ સંપૂર્ણ શ્લોક અને અર્થ.', kn: 'ಎರಡು ಶೈಲಿಗಳು. ಅದೇ ಸಂಪೂರ್ಣ ಶ್ಲೋಕ ಮತ್ತು ಅರ್ಥ.' })}</Text>
              {styleChoices}
              <Text style={[subLabel, { color: colors.inkMuted, textAlign: 'center' }]}>{pick(lang, { hi: 'कार्ड चुनते ही साझा करने के विकल्प खुलेंगे।', en: 'Tap a card to open sharing options.', gu: 'શેર કરવાના વિકલ્પો માટે કાર્ડ પસંદ કરો.', kn: 'ಹಂಚಿಕೆ ಆಯ್ಕೆಗಳಿಗೆ ಕಾರ್ಡ್ ಆರಿಸಿ.' })}</Text>
            </> : cardStyle ? <Pressable onPress={backToStyles} disabled={busy} accessibilityRole="button" accessibilityLabel="Change card style" style={{ minHeight: 44, justifyContent: 'center' }}>
              <Text style={{ fontFamily: titleFont, color: colors.saffronDeep }}>{pick(lang, { hi: '← कार्ड बदलें', en: '← Change card', gu: '← કાર્ડ બદલો', kn: '← ಕಾರ್ಡ್ ಬದಲಿಸಿ' })}</Text>
            </Pressable> : null}
            {!choosingStyle && !multi && singleCardPreview ? <View style={{ alignItems: 'center', marginVertical: 12, flexDirection: cardStyle ? 'row' : 'column', gap: 16 }}>
              {cardStyle && renderStylePreview ? <>
                {renderStylePreview(cardStyle, 64)}
                <Text style={{ flex: 1, fontFamily: titleFont, fontSize: 16, color: colors.ink }}>{cardStyle === 'current'
                  ? pick(lang, { hi: 'मौजूदा कार्ड', en: 'Current card', gu: 'હાલનું કાર્ડ', kn: 'ಪ್ರಸ್ತುತ ಕಾರ್ಡ್' })
                  : pick(lang, { hi: 'दैनिक भक्ति कार्ड', en: 'Daily Bhakti card', gu: 'દૈનિક ભક્તિ કાર્ડ', kn: 'ದೈನಂದಿನ ಭಕ್ತಿ ಕಾರ್ಡ್' })}</Text>
              </> : singleCardPreview}
            </View> : null}
            {!multi && note ? (
              <Text testID="share-sheet-note" style={[subLabel, { color: colors.inkMuted, textAlign: 'center', marginBottom: spacing.sm }]}>✓ {note}</Text>
            ) : null}
            {!multi && controls ? <View testID="share-sheet-controls" style={{ marginBottom: spacing.md }}>{controls}</View> : null}
            {!choosingStyle ? body : null}
          </ScrollView>
          {showCancel ? (
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Cancel"
              style={({ pressed }) => [styles.cancel, pressed && { opacity: 0.7 }]}
            >
              <Text style={[eyebrowTextStyle(lang, 13), { color: colors.inkMuted }]}>
                {pick(lang, { hi: 'रद्द करें', en: 'Cancel', gu: 'રદ કરો', kn: 'ರದ್ದುಮಾಡಿ' })}
              </Text>
            </Pressable>
          ) : null}
        </Pressable>
      </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  keyboard: { flex: 1 },
  backdrop: { flex: 1, justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: 22, borderTopRightRadius: 22, paddingTop: 10, paddingBottom: 28, maxHeight: '92%' },
  grabber: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 12 },
  body: { flexGrow: 0 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, gap: 14, minHeight: 44 },
  rowText: { flex: 1, gap: 2 },
  // Aspect chip on the two Instagram rows — the size difference IS the choice,
  // so it is stated numerically as well as in the sub-label.
  ratio: {
    fontSize: 10,
    letterSpacing: 0.6,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 2,
    overflow: 'hidden',
  },
  copyNote: { marginTop: 10 },
  preview: { borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10 },
  previewScroll: { maxHeight: 76 },
  cancel: { minHeight: 44, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  center: { alignItems: 'center', gap: 14, paddingVertical: 28 },
  bar: { alignSelf: 'stretch', height: 6, borderRadius: 3, overflow: 'hidden' },
  barFill: { height: '100%' },
  ready: { gap: 12, paddingVertical: 8 },
  step: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  stepNo: { width: 22, height: 22, borderRadius: 11, textAlign: 'center', lineHeight: 22, fontSize: 11, fontWeight: '600', overflow: 'hidden' },
  primary: { minHeight: 44, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  langWrap: { alignItems: 'center', gap: 8, marginBottom: 12 },
  langRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 },
  langChip: { borderWidth: 1, paddingHorizontal: 12, minHeight: 36, justifyContent: 'center' },
});
