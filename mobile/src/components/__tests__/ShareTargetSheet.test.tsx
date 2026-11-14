import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { ThemeProvider } from '@/theme/ThemeContext';
import ShareTargetSheet from '../ShareTargetSheet';
import { buildVerseHashtags, formatHashtags } from '@/data/shareHashtags';

/**
 * The share button's target picker (design.md §39). Pins the two things a reader
 * depends on: the Instagram row exists and is reachable from every share surface,
 * and the hashtags it previews are the ones built for *this* verse.
 */

const hashtags = formatHashtags(
  buildVerseHashtags({
    sourceId: 'hanuman-chalisa',
    sectionNameHi: 'हनुमान चालीसा',
    sectionNameEn: 'Hanuman Chalisa',
    verseLabelEn: 'Verse 12',
    lang: 'en',
  })
);

async function renderSheet(props: Partial<React.ComponentProps<typeof ShareTargetSheet>> = {}) {
  let tree: TestRenderer.ReactTestRenderer;
  await act(async () => {
    tree = TestRenderer.create(
      <ThemeProvider>
        <ShareTargetSheet
          visible
          lang="en"
          hashtagPreview={hashtags}
          onShareSystem={jest.fn()}
          onShareInstagramPost={jest.fn()}
          onShareInstagramStory={jest.fn()}
          onClose={jest.fn()}
          {...props}
        />
      </ThemeProvider>
    );
  });
  return tree!;
}

function byLabel(tree: TestRenderer.ReactTestRenderer, label: string) {
  return tree.root.findAll(
    (n) => n.props.accessibilityLabel === label && typeof n.props.onPress === 'function'
  )[0];
}

describe('ShareTargetSheet', () => {
  test('verse exports explain the taller image without promising a fixed Instagram crop', async () => {
    const tree = await renderSheet({ fullVerseImage: true });
    expect(tree.root.findAll(n => n.props.children === '4:5' || n.props.children === '9:16')).toHaveLength(0);
    expect(tree.root.findAll(n => n.props.children === 'Long verses use one taller image. You may need to adjust its framing in Instagram.').length).toBeGreaterThan(0);
    expect(byLabel(tree, 'Share to other apps')).toBeDefined();
    expect(byLabel(tree, 'Share as Instagram story').props.accessibilityHint).not.toContain('nothing cropped');
  });

  test('offers all three destinations, post and story separately', async () => {
    const tree = await renderSheet();
    expect(byLabel(tree, 'Share to other apps')).toBeDefined();
    expect(byLabel(tree, 'Share on Instagram')).toBeDefined();
    expect(byLabel(tree, 'Share as Instagram story')).toBeDefined();
  });

  test('picking a destination calls the matching handler', async () => {
    const onShareSystem = jest.fn();
    const onShareInstagramPost = jest.fn();
    const onShareInstagramStory = jest.fn();
    const tree = await renderSheet({
      onShareSystem,
      onShareInstagramPost,
      onShareInstagramStory,
    });

    await act(async () => byLabel(tree, 'Share on Instagram').props.onPress());
    expect(onShareInstagramPost).toHaveBeenCalledTimes(1);
    expect(onShareInstagramStory).not.toHaveBeenCalled();
    expect(onShareSystem).not.toHaveBeenCalled();

    await act(async () => byLabel(tree, 'Share as Instagram story').props.onPress());
    expect(onShareInstagramStory).toHaveBeenCalledTimes(1);
    expect(onShareInstagramPost).toHaveBeenCalledTimes(1);

    await act(async () => byLabel(tree, 'Share to other apps').props.onPress());
    expect(onShareSystem).toHaveBeenCalledTimes(1);
  });

  test('each Instagram row states its aspect, so the crop trade-off is visible', async () => {
    const tree = await renderSheet();
    // Each label matches twice — the composite <Text> and its host node — so
    // dedupe while keeping render order.
    const chips = [
      ...new Set(
        tree.root
          .findAll((n) => n.props.children === '4:5' || n.props.children === '9:16')
          .map((n) => n.props.children as string)
      ),
    ];
    expect(chips).toEqual(['4:5', '9:16']);
  });

  test('previews the verse hashtags so the reader sees what is being pasted', async () => {
    const tree = await renderSheet();
    const preview = tree.root.findAll(
      (n) => typeof n.props.accessibilityLabel === 'string' && n.props.accessibilityLabel.startsWith('Hashtags: ')
    )[0];
    expect(preview.props.children).toBe(hashtags);
    expect(hashtags).toContain('#HanumanChalisa');
    expect(hashtags).toContain('#JaiHanuman');
  });

  test('every row disables while a capture is in flight', async () => {
    const tree = await renderSheet({ busy: true });
    expect(byLabel(tree, 'Share to other apps').props.disabled).toBe(true);
    expect(byLabel(tree, 'Share on Instagram').props.disabled).toBe(true);
    expect(byLabel(tree, 'Share as Instagram story').props.disabled).toBe(true);
  });

  test('WhatsApp row (§39.11): only when WhatsApp opens directly, first, localized, and disabled while busy', async () => {
    const none = await renderSheet();
    expect(byLabel(none, 'Share on WhatsApp')).toBeUndefined();
    const onShareWhatsApp = jest.fn();
    const subs = {
      hi: 'सीधे WhatsApp में — कार्ड और ऐप का लिंक',
      en: 'Straight to WhatsApp — the card and the app link',
      gu: 'સીધું WhatsApp માં — કાર્ડ અને ઍપની લિંક',
      kn: 'ನೇರವಾಗಿ WhatsApp ಗೆ — ಕಾರ್ಡ್ ಮತ್ತು ಆ್ಯಪ್ ಲಿಂಕ್',
    } as const;
    for (const lang of ['hi', 'en', 'gu', 'kn'] as const) {
      const tree = await renderSheet({ lang, onShareWhatsApp });
      expect(tree.root.findAll((n) => n.props.children === subs[lang]).length).toBeGreaterThan(0);
    }
    const tree = await renderSheet({ onShareWhatsApp });
    const labels = tree.root
      .findAll((n) => typeof n.props.onPress === 'function' && typeof n.props.accessibilityLabel === 'string')
      .map((n) => n.props.accessibilityLabel);
    expect(labels.indexOf('Share on WhatsApp')).toBeLessThan(labels.indexOf('Share to other apps'));
    await act(async () => byLabel(tree, 'Share on WhatsApp').props.onPress());
    expect(onShareWhatsApp).toHaveBeenCalledTimes(1);
    const busy = await renderSheet({ onShareWhatsApp, busy: true });
    expect(byLabel(busy, 'Share on WhatsApp').props.disabled).toBe(true);
    const whole = await renderSheet({ onShareWhatsApp, fullVerseImage: true });
    expect(whole.root.findAll((n) => n.props.children === 'Straight to WhatsApp — the whole image and the app link').length).toBeGreaterThan(0);
  });

  test('Reel row (§39.11): only when offered, after the story row, localized, busy-disabled', async () => {
    expect(byLabel(await renderSheet(), 'Share as Instagram reel')).toBeUndefined();
    const onShareInstagramReel = jest.fn();
    const subs = {
      hi: 'वही 9:16 फ्रेम — Instagram में रील चुनें',
      en: 'The same 9:16 frame — pick Reel in Instagram',
      gu: 'એ જ 9:16 ફ્રેમ — Instagram માં રીલ પસંદ કરો',
      kn: 'ಅದೇ 9:16 ಚೌಕಟ್ಟು — Instagram ನಲ್ಲಿ ರೀಲ್ ಆಯ್ಕೆಮಾಡಿ',
    } as const;
    for (const lang of ['hi', 'en', 'gu', 'kn'] as const) {
      const tree = await renderSheet({ lang, onShareInstagramReel });
      expect(tree.root.findAll((n) => n.props.children === subs[lang]).length).toBeGreaterThan(0);
    }
    const tree = await renderSheet({ onShareInstagramReel });
    const labels = tree.root
      .findAll((n) => typeof n.props.onPress === 'function' && typeof n.props.accessibilityLabel === 'string')
      .map((n) => n.props.accessibilityLabel);
    expect(labels.indexOf('Share as Instagram story')).toBeLessThan(labels.indexOf('Share as Instagram reel'));
    expect(tree.root.findAll((n) => n.props.children === 'Instagram story').length).toBeGreaterThan(0);
    await act(async () => byLabel(tree, 'Share as Instagram reel').props.onPress());
    expect(onShareInstagramReel).toHaveBeenCalledTimes(1);
    expect(byLabel(await renderSheet({ onShareInstagramReel, busy: true }), 'Share as Instagram reel').props.disabled).toBe(true);
  });

  test('Instagram rows announce that they open Instagram', async () => {
    const tree = await renderSheet();
    expect(byLabel(tree, 'Share on Instagram').props.accessibilityHint).toMatch(/then opens Instagram$/);
    expect(byLabel(tree, 'Share as Instagram story').props.accessibilityHint).toMatch(/then opens Instagram$/);
  });

  test('Send as text appears only when offered, and calls its handler', async () => {
    const without = await renderSheet();
    expect(byLabel(without, 'Send as text')).toBeUndefined();
    const onShareText = jest.fn();
    const tree = await renderSheet({ fullVerseImage: true, onShareText });
    await act(async () => byLabel(tree, 'Send as text').props.onPress());
    expect(onShareText).toHaveBeenCalledTimes(1);
    expect(tree.root.findAll(n => n.props.children === 'Full verse and meaning — no image').length).toBeGreaterThan(0);
  });

  test('card-language chips: four languages, current one selected, a tap reports the pick', async () => {
    const onCardLang = jest.fn();
    const tree = await renderSheet({ cardLang: 'hi', onCardLang });
    const chips = tree.root.findAll(
      n => typeof n.props.testID === 'string' && n.props.testID.startsWith('share-card-lang-') && typeof n.props.onPress === 'function'
    );
    expect(chips.map(c => c.props.testID)).toEqual(['share-card-lang-hi', 'share-card-lang-en', 'share-card-lang-gu', 'share-card-lang-kn']);
    expect(byLabel(tree, 'Card language: Hindi').props.accessibilityState).toEqual({ selected: true });
    expect(byLabel(tree, 'Card language: Hindi').props.disabled).toBe(true);
    await act(async () => byLabel(tree, 'Card language: Gujarati').props.onPress());
    expect(onCardLang).toHaveBeenCalledWith('gu');
  });

  test('no chips without a card-language handler', async () => {
    const tree = await renderSheet({ cardLang: 'hi' });
    expect(byLabel(tree, 'Card language: Hindi')).toBeUndefined();
  });

  test('cancel closes without sharing', async () => {
    const onClose = jest.fn();
    const onShareSystem = jest.fn();
    const tree = await renderSheet({ onClose, onShareSystem });
    await act(async () => byLabel(tree, 'Cancel').props.onPress());
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onShareSystem).not.toHaveBeenCalled();
  });
});

describe('ShareTargetSheet · series (design.md §39.5)', () => {
  const series = (over: Partial<React.ComponentProps<typeof ShareTargetSheet>['series'] & object> = {}) => ({
    pageCount: 3,
    selected: [true, true, true],
    highlighted: 1,
    renderPage: () => null,
    onHighlight: jest.fn(),
    onToggle: jest.fn(),
    scopes: [{ label: 'This part', pageCount: 3 }],
    scopeIndex: 0,
    onScope: jest.fn(),
    multiShareAvailable: true,
    onShareAll: jest.fn(),
    onInstagramCarousel: jest.fn(),
    view: 'targets' as const,
    onView: jest.fn(),
    onPreviewStep: jest.fn(),
    onContinueCarousel: jest.fn(),
    ...over,
  });

  test('a verse sheet has no series rows', async () => {
    const tree = await renderSheet();
    expect(byLabel(tree, 'Share all pages')).toBeUndefined();
    expect(byLabel(tree, 'Share as Instagram carousel')).toBeUndefined();
  });

  test('a one-page series renders exactly the verse sheet rows', async () => {
    const tree = await renderSheet({ series: series({ pageCount: 1, selected: [true], highlighted: 0 }) });
    expect(byLabel(tree, 'Share all pages')).toBeUndefined();
    expect(byLabel(tree, 'Page 1')).toBeUndefined();
  });

  test('a multi-page series adds the strip, the all-pages rows and a page chip', async () => {
    const s = series();
    const tree = await renderSheet({ series: s });
    expect(byLabel(tree, 'Page 1')).toBeDefined();
    expect(byLabel(tree, 'Page 3')).toBeDefined();
    await act(async () => byLabel(tree, 'Share all pages').props.onPress());
    expect(s.onShareAll).toHaveBeenCalledTimes(1);
    await act(async () => byLabel(tree, 'Share as Instagram carousel').props.onPress());
    expect(s.onInstagramCarousel).toHaveBeenCalledTimes(1);
    const chips = tree.root.findAll((n) => n.props.children === 'page 2');
    expect(chips.length).toBeGreaterThan(0);
  });

  test('tapping a thumbnail highlights it; tapping the highlighted one toggles it', async () => {
    const s = series();
    const tree = await renderSheet({ series: s });
    await act(async () => byLabel(tree, 'Page 3').props.onPress());
    expect(s.onHighlight).toHaveBeenCalledWith(2);
    await act(async () => byLabel(tree, 'Page 2').props.onPress());
    expect(s.onToggle).toHaveBeenCalledWith(1);
  });

  test('all-pages rows disable without the multi-image module, or past the page cap', async () => {
    const off = await renderSheet({ series: series({ multiShareAvailable: false }) });
    expect(byLabel(off, 'Share all pages').props.disabled).toBe(true);
    const many = await renderSheet({
      series: series({ pageCount: 12, selected: Array(12).fill(true), highlighted: 0 }),
    });
    expect(byLabel(many, 'Share all pages').props.disabled).toBe(true);
    expect(byLabel(many, 'Share to other apps').props.disabled).toBeFalsy();
  });

  test('a series puts the WhatsApp album in the all-pages group, never as a single-page row', async () => {
    const onShareAllWhatsApp = jest.fn();
    const tree = await renderSheet({ series: series({ onShareAllWhatsApp }), onShareWhatsApp: jest.fn() });
    expect(byLabel(tree, 'Share on WhatsApp')).toBeUndefined();
    await act(async () => byLabel(tree, 'Share all pages on WhatsApp').props.onPress());
    expect(onShareAllWhatsApp).toHaveBeenCalledTimes(1);
    const capped = await renderSheet({
      series: series({ pageCount: 12, selected: Array(12).fill(true), highlighted: 0, onShareAllWhatsApp }),
    });
    expect(byLabel(capped, 'Share all pages on WhatsApp').props.disabled).toBe(true);
    const plain = await renderSheet({ series: series() });
    expect(byLabel(plain, 'Share all pages on WhatsApp')).toBeUndefined();
  });

  test('the carousel-ready view offers Continue', async () => {
    const s = series({ view: 'carouselReady', progress: { done: 3, total: 3 } });
    const tree = await renderSheet({ series: s });
    await act(async () => byLabel(tree, 'Continue to Instagram').props.onPress());
    expect(s.onContinueCarousel).toHaveBeenCalledTimes(1);
  });

  test('the picture layout drops the 4:5 Instagram-post row: both Instagram routes would export the same 9:16 card', async () => {
    const plain = await renderSheet();
    expect(byLabel(plain, 'Share on Instagram')).toBeDefined();
    expect(byLabel(plain, 'Share as Instagram story')).toBeDefined();
    const picture = await renderSheet({ cardLayout: 'picture' });
    expect(byLabel(picture, 'Share on Instagram')).toBeUndefined();
    expect(byLabel(picture, 'Share as Instagram story')).toBeDefined();
    expect(byLabel(picture, 'Share to other apps')).toBeDefined();
  });
});


test.each(['hi', 'en', 'gu', 'kn'] as const)('offers accessible reflowing style choices in %s and disables them while busy', async lang => {
  const onCardStyle = jest.fn();
  const tree = await renderSheet({ lang, cardStyle: 'current', onCardStyle });
  const current = byLabel(tree, 'Card style: Current card');
  const bhakti = byLabel(tree, 'Card style: Daily Bhakti card');
  expect(current.props.accessibilityState.checked).toBe(true);
  expect(bhakti.props.accessibilityState.checked).toBe(false);
  expect(bhakti.props.accessibilityRole).toBe('button');
  act(() => bhakti.props.onPress());
  expect(onCardStyle).toHaveBeenCalledWith('daily-bhakti');
  act(() => tree.unmount());
  const locked = await renderSheet({ lang, cardStyle: 'daily-bhakti', onCardStyle, busy: true });
  expect(byLabel(locked, 'Card style: Current card').props.disabled).toBe(true);
  expect(byLabel(locked, 'Card style: Daily Bhakti card').props.disabled).toBe(true);
  act(() => locked.unmount());
});

test('other card and prose pickers do not receive scripture style options', async () => {
  const tree = await renderSheet();
  expect(byLabel(tree, 'Card style: Daily Bhakti card')).toBeUndefined();
  act(() => tree.unmount());
});


test('one card tap opens destinations; change card returns without sharing or an extra Continue step', async () => {
  const choose = jest.fn(); const send = jest.fn();
  const tree = await renderSheet({ cardStyle: 'current', onCardStyle: choose, onShareSystem: send,
    renderStylePreview: style => <></> });
  expect(byLabel(tree, 'Share to other apps')).toBeUndefined();
  expect(byLabel(tree, 'Send as text')).toBeUndefined();
  act(() => byLabel(tree, 'Card style: Daily Bhakti card').props.onPress());
  expect(choose).toHaveBeenCalledWith('daily-bhakti');
  expect(byLabel(tree, 'Share to other apps')).toBeDefined();
  expect(byLabel(tree, 'Card style: Current card')).toBeUndefined();
  expect(send).not.toHaveBeenCalled();
  act(() => byLabel(tree, 'Change card style').props.onPress());
  expect(byLabel(tree, 'Card style: Current card')).toBeDefined();
  expect(byLabel(tree, 'Share to other apps')).toBeUndefined();
  act(() => tree.unmount());
});
