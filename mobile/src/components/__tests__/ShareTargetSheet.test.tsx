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
  test('offers all three destinations, post and story separately', async () => {
    const tree = await renderSheet();
    expect(byLabel(tree, 'Share to other apps')).toBeDefined();
    expect(byLabel(tree, 'Share on Instagram')).toBeDefined();
    expect(byLabel(tree, 'Share as Instagram story or reel')).toBeDefined();
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

    await act(async () => byLabel(tree, 'Share as Instagram story or reel').props.onPress());
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
    expect(byLabel(tree, 'Share as Instagram story or reel').props.disabled).toBe(true);
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
