import React from 'react';
import { Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import type { Lang } from '@/data/gita/language';
import { pick } from '@/utils/localize';
import { cardFontByLang, eyebrowTextStyle, indicSafeTag } from '@/utils/langType';
import { MAX_SHARE_PAGES } from '@/utils/shareCardPages';
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
  onInstagramCarousel: () => void;
  view: ShareSeriesView;
  onView: (view: ShareSeriesView) => void;
  onPreviewStep: (delta: -1 | 1) => void;
  progress?: { done: number; total: number };
  /** Carousel pages are rendered; opens the OS sheet. */
  onContinueCarousel: () => void;
};

type Props = {
  visible: boolean;
  lang: Lang;
  /** Sheet title; defaults to "Share this verse". */
  title?: string;
  /** The hashtag line exactly as it will be pasted (`#A #B …`). */
  hashtagPreview: string;
  onShareSystem: () => void;
  /** 4:5 — the tallest a feed post shows whole. */
  onShareInstagramPost: () => void;
  /** 9:16 — the card inside the Story/Reel safe area, so nothing is cropped. */
  onShareInstagramStory: () => void;
  onClose: () => void;
  /** True while a capture/share is running — every row disables. */
  busy?: boolean;
  /** Present for multi-page content. Ignored when `pageCount` is 1. */
  series?: ShareSeriesProps;
};

type RowProps = {
  glyph: string;
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
      <Text style={[styles.glyph, { color: colors.saffron }]}>{p.glyph}</Text>
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
  onShareInstagramPost,
  onShareInstagramStory,
  onClose,
  busy,
  series,
}: Props) {
  const { colors, spacing, radii } = useTheme();
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
      {title ??
        pick(lang, { hi: 'श्लोक साझा करें', en: 'Share this verse', gu: 'શ્લોક શેર કરો', kn: 'ಶ್ಲೋಕ ಹಂಚಿಕೊಳ್ಳಿ' })}
    </Text>
  );

  let body: React.ReactNode;
  if (multi && multi.view === 'preview') {
    body = (
      <SharePagePreview
        lang={lang}
        index={multi.highlighted}
        count={multi.pageCount}
        included={multi.selected[multi.highlighted]}
        renderPage={multi.renderPage}
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
            <TargetRow
              lang={lang}
              glyph="⇶"
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
              glyph="▤"
              title={pick(lang, { hi: 'Instagram कैरोसेल', en: 'Instagram carousel', gu: 'Instagram કૅરોસેલ', kn: 'Instagram ಕ್ಯಾರೋಸೆಲ್' })}
              sub={allSub ?? pick(lang, { hi: 'सभी पृष्ठ एक पोस्ट में — कैप्शन कॉपी होगा', en: 'All pages as one post — caption is copied', gu: 'બધાં પૃષ્ઠ એક પોસ્ટમાં', kn: 'ಎಲ್ಲ ಪುಟಗಳು ಒಂದು ಪೋಸ್ಟ್‌ನಲ್ಲಿ' })}
              chips={[String(selectedCount)]}
              hotChip
              onPress={multi.onInstagramCarousel}
              disabled={allDisabled}
              divider={false}
              accessibilityLabel="Share as Instagram carousel"
              accessibilityHint="Renders every selected page, copies the caption, then opens the share sheet"
            />
            <Text style={eyebrow}>
              {pick(lang, { hi: `केवल यह पृष्ठ · ${multi.highlighted + 1}`, en: `JUST THIS PAGE · ${multi.highlighted + 1}`, gu: `માત્ર આ પૃષ્ઠ · ${multi.highlighted + 1}`, kn: `ಈ ಪುಟ ಮಾತ್ರ · ${multi.highlighted + 1}` })}
            </Text>
          </>
        ) : null}

        <TargetRow
          lang={lang}
          glyph="↗"
          title={pick(lang, { hi: 'शेयर करें', en: 'Share', gu: 'શેર કરો', kn: 'ಹಂಚಿಕೊಳ್ಳಿ' })}
          sub={pick(lang, { hi: 'WhatsApp, संदेश या कहीं भी', en: 'WhatsApp, Messages, anywhere', gu: 'WhatsApp, સંદેશ કે ગમે ત્યાં', kn: 'WhatsApp, ಸಂದೇಶ ಅಥವಾ ಎಲ್ಲಿಯಾದರೂ' })}
          chips={pageChip}
          onPress={onShareSystem}
          disabled={busy}
          accessibilityLabel="Share to other apps"
        />
        <TargetRow
          lang={lang}
          glyph="◉"
          title={pick(lang, { hi: 'Instagram पोस्ट', en: 'Instagram post', gu: 'Instagram પોસ્ટ', kn: 'Instagram ಪೋಸ್ಟ್' })}
          sub={pick(lang, { hi: 'फ़ीड के लिए 4:5 कार्ड', en: '4:5 card — for the feed', gu: 'ફીડ માટે 4:5 કાર્ડ', kn: 'ಫೀಡ್‌ಗಾಗಿ 4:5 ಕಾರ್ಡ್' })}
          chips={[...pageChip, '4:5']}
          onPress={onShareInstagramPost}
          disabled={busy}
          accessibilityLabel="Share on Instagram"
          accessibilityHint="Instagram post, 4 by 5. Copies the caption and hashtags, then opens the share sheet"
        />
        <TargetRow
          lang={lang}
          glyph="▮"
          title={pick(lang, { hi: 'Instagram स्टोरी / रील', en: 'Instagram story / reel', gu: 'Instagram સ્ટોરી / રીલ', kn: 'Instagram ಸ್ಟೋರಿ / ರೀಲ್' })}
          sub={pick(lang, { hi: 'पूरी स्क्रीन 9:16 — कुछ भी नहीं कटेगा', en: 'Full screen 9:16 — nothing gets cropped', gu: 'આખી સ્ક્રીન 9:16 — કશું કપાશે નહીં', kn: 'ಪೂರ್ಣ ಪರದೆ 9:16 — ಏನೂ ಕತ್ತರಿಸುವುದಿಲ್ಲ' })}
          chips={[...pageChip, '9:16']}
          onPress={onShareInstagramStory}
          disabled={busy}
          divider={false}
          accessibilityLabel="Share as Instagram story or reel"
          accessibilityHint="Full screen 9 by 16, nothing cropped. Copies the caption and hashtags, then opens the share sheet"
        />

        <Text style={[subLabel, styles.copyNote, { color: colors.inkMuted }]}>
          {pick(lang, {
            hi: 'दोनों में कैप्शन और हैशटैग कॉपी हो जाएँगे — Instagram में पेस्ट कर दें',
            en: 'Either way the caption + hashtags are copied — just paste in Instagram',
            gu: 'બંનેમાં કૅપ્શન અને હૅશટૅગ કૉપી થશે — Instagram માં પેસ્ટ કરો',
            kn: 'ಎರಡರಲ್ಲೂ ಶೀರ್ಷಿಕೆ ಮತ್ತು ಹ್ಯಾಶ್‌ಟ್ಯಾಗ್ ಕಾಪಿ ಆಗುತ್ತವೆ — Instagram ನಲ್ಲಿ ಪೇಸ್ಟ್ ಮಾಡಿ',
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
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
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
          {multi ? (
            <ScrollView style={styles.body} bounces={false} showsVerticalScrollIndicator={false}>
              {body}
            </ScrollView>
          ) : (
            body
          )}
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
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: 22, borderTopRightRadius: 22, paddingTop: 10, paddingBottom: 28, maxHeight: '92%' },
  grabber: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 12 },
  body: { flexGrow: 0 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, gap: 14, minHeight: 44 },
  rowText: { flex: 1, gap: 2 },
  glyph: { fontSize: 18, width: 22, textAlign: 'center' },
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
});
