import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Text } from 'react-native';
import ShareCard, { type ShareCardProps } from '../ShareCard';

/**
 * Guard: the ShareCard is a fixed-size promo image, so a long meaning must
 * shrink to fit rather than truncate/ellipsize. This pins the shrink-to-fit
 * props so the meaning can never be silently cut off in a shared image.
 */

const longMeaning =
  'I bow to Goddess Sharada (Saraswati): fair-complexioned, the very essence of ' +
  'contemplation on the Supreme, the primordial power pervading the universe, bearer ' +
  'of veena and book, granter of fearlessness, dispeller of the darkness of ignorance, ' +
  'seated upon the lotus, holding a crystal rosary in her hand.';

const baseProps: ShareCardProps = {
  sectionNameHi: 'सरस्वती वंदना',
  sectionNameEn: 'Saraswati Vandana',
  verseLabelHi: 'श्लोक · 2.2',
  verseLabelEn: 'Shloka · 2.2',
  linesHi: ['शुक्लां ब्रह्मविचारसारपरमामाद्यां जगद्व्यापिनीं'],
  linesEn: ['shuklāṁ brahma-vichāra-sāra-paramām ādyāṁ jagad-vyāpinīṁ'],
  meaningHi: 'श्वेतवर्णा, परब्रह्म के चिन्तन की सार-स्वरूपा भगवती शारदा की मैं वन्दना करता हूँ।',
  meaningEn: longMeaning,
  lang: 'en',
  width: 540,
  height: 675,
};

function meaningNode(props: ShareCardProps) {
  let tree: TestRenderer.ReactTestRenderer | undefined;
  act(() => {
    tree = TestRenderer.create(<ShareCard {...props} />);
  });
  const node = tree!.root.findAllByType(Text).find((n) => n.props.children === props.meaningEn);
  if (!node) throw new Error('meaning Text not found in ShareCard');
  return node;
}

describe('ShareCard meaning fit', () => {
  test('shrinks to fit instead of truncating', () => {
    const node = meaningNode(baseProps);
    expect(node.props.adjustsFontSizeToFit).toBe(true);
    expect(typeof node.props.minimumFontScale).toBe('number');
    expect(node.props.minimumFontScale).toBeLessThan(1);
  });
});
