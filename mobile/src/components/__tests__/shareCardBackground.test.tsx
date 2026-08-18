import React, * as mockReact from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { ImageBackground, View as mockView } from 'react-native';
import ShareCard, { type ShareCardProps } from '../ShareCard';
import { getReaderBackground } from '@/data/backgrounds';

// BackgroundLayer's overlay is an expo-linear-gradient — untranspiled ESM Jest
// cannot parse (same mock as the reader screen suites).
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({
    children,
    ...props
  }: React.PropsWithChildren<Record<string, unknown>>) =>
    mockReact.createElement(mockView, props, children),
}));

/**
 * Guard: the shared verse card must carry the same faded source sketch as the
 * verse's reader page (getReaderBackground), not the plain parchment fill it
 * shipped with. Regression for "share card has a plain background".
 */

const baseProps: ShareCardProps = {
  sourceId: 'bhagavad-gita',
  sectionNameHi: 'भगवद् गीता',
  sectionNameEn: 'Bhagavad Gita',
  verseLabelHi: 'श्लोक · 2.47',
  verseLabelEn: 'Shloka · 2.47',
  linesHi: ['कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।'],
  linesEn: ['karmaṇy evādhikāras te mā phaleṣu kadācana'],
  meaningHi: 'तेरा कर्म करने में ही अधिकार है, उसके फलों में कभी नहीं।',
  meaningEn: 'You have a right to action alone, never to its fruits.',
  lang: 'hi',
  width: 540,
  height: 675,
};

function render(props: ShareCardProps) {
  let tree: TestRenderer.ReactTestRenderer | undefined;
  act(() => {
    tree = TestRenderer.create(<ShareCard {...props} />);
  });
  return tree!;
}

describe('ShareCard background', () => {
  test('renders the source reader sketch behind the verse', () => {
    const tree = render(baseProps);
    const bg = tree.root.findAllByType(ImageBackground);
    expect(bg).toHaveLength(1);
    expect(bg[0].props.source).toBe(getReaderBackground('bhagavad-gita'));
  });

  test('per-subsection sources follow the stanza key (Valmiki kāṇḍa 5 → Sundara plate)', () => {
    const tree = render({ ...baseProps, sourceId: 'valmiki-ramayan', stanza: 5 });
    const bg = tree.root.findAllByType(ImageBackground);
    expect(bg[0].props.source).toBe(getReaderBackground('valmiki-ramayan', { stanza: 5 }));
    expect(bg[0].props.source).not.toBe(getReaderBackground('valmiki-ramayan', { stanza: 1 }));
  });

  test('a source with no plate falls back to the plain parchment gradient', () => {
    const tree = render({ ...baseProps, sourceId: 'unknown-source-id' });
    expect(tree.root.findAllByType(ImageBackground)).toHaveLength(0);
  });
});
