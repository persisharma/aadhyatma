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
          onShareInstagram={jest.fn()}
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
  test('offers both destinations', async () => {
    const tree = await renderSheet();
    expect(byLabel(tree, 'Share to other apps')).toBeDefined();
    expect(byLabel(tree, 'Share on Instagram')).toBeDefined();
  });

  test('picking a destination calls the matching handler', async () => {
    const onShareSystem = jest.fn();
    const onShareInstagram = jest.fn();
    const tree = await renderSheet({ onShareSystem, onShareInstagram });

    await act(async () => byLabel(tree, 'Share on Instagram').props.onPress());
    expect(onShareInstagram).toHaveBeenCalledTimes(1);
    expect(onShareSystem).not.toHaveBeenCalled();

    await act(async () => byLabel(tree, 'Share to other apps').props.onPress());
    expect(onShareSystem).toHaveBeenCalledTimes(1);
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

  test('both rows disable while a capture is in flight', async () => {
    const tree = await renderSheet({ busy: true });
    expect(byLabel(tree, 'Share to other apps').props.disabled).toBe(true);
    expect(byLabel(tree, 'Share on Instagram').props.disabled).toBe(true);
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
