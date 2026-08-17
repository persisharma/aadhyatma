import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Text } from 'react-native';
import ShareCard, { type ShareCardProps } from '../ShareCard';

/**
 * Guard: the ShareCard is a fixed-size promo image, so a long meaning must be
 * fitted rather than clipped — but fitted *legibly*. The card used to hand that
 * job to `adjustsFontSizeToFit` over `numberOfLines={5}` with a fixed
 * `lineHeight: 24`, which drove real meanings to 7 pt inside 24 pt of leading
 * (unreadable at thumbnail size, and the exact iOS auto-fit trap already
 * recorded on CategoryCard). Sizing now happens in JS — `utils/shareCardType.ts`
 * — so these pin: no platform auto-fit, a readable size, leading that scales
 * with it, and no synthesised italic over Indic faces.
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

function meaningNode(props: ShareCardProps, text: string) {
  let tree: TestRenderer.ReactTestRenderer | undefined;
  act(() => {
    tree = TestRenderer.create(<ShareCard {...props} />);
  });
  const node = tree!.root.findAllByType(Text).find((n) => n.props.children === text);
  if (!node) throw new Error('meaning Text not found in ShareCard');
  return node;
}

/** Flattened style of the meaning Text, as rendered. */
function meaningStyle(props: ShareCardProps, text: string) {
  const style = meaningNode(props, text).props.style as unknown;
  return Object.assign({}, ...[style].flat(Infinity).filter(Boolean)) as Record<string, unknown>;
}

describe('ShareCard meaning fit', () => {
  test('does not hand sizing to platform auto-fit', () => {
    const node = meaningNode(baseProps, longMeaning);
    expect(node.props.adjustsFontSizeToFit).toBeFalsy();
    expect(node.props.minimumFontScale).toBeUndefined();
  });

  test('fits by size + line budget, not a hard-coded five lines', () => {
    const node = meaningNode(baseProps, longMeaning);
    expect(node.props.numberOfLines).toBeGreaterThan(5);
  });

  test('a long meaning still renders at a readable size with scaled leading', () => {
    const style = meaningStyle(baseProps, longMeaning);
    const fontSize = style.fontSize as number;
    const lineHeight = style.lineHeight as number;
    expect(fontSize).toBeGreaterThanOrEqual(12);
    expect(lineHeight / fontSize).toBeGreaterThanOrEqual(1.4);
    expect(lineHeight / fontSize).toBeLessThanOrEqual(1.7);
  });

  test('Indic meanings are upright; only the Latin face uses its real italic', () => {
    const hi = meaningStyle({ ...baseProps, lang: 'hi' }, baseProps.meaningHi!);
    expect(hi.fontStyle).toBe('normal');
    const en = meaningStyle(baseProps, longMeaning);
    expect(en.fontStyle).toBe('italic');
  });
});

describe('ShareCard native meaning override', () => {
  // Guard: for sections with a verified native meaningGu/meaningKn, the shared
  // card must render that native translation — not the Hindi meaning re-scripted
  // into the target script (the transliteration fallback). Regression for the
  // report that shared cards showed transliterated Hindi for natively-available
  // content while the in-app reader showed the native translation.
  const meaningHi =
    'गुरुचरणों की कृपा से मन को निर्मल करके मैं श्रीराम के पवित्र यश का वर्णन करता हूँ।';
  const nativeGu =
    'ગુરુના ચરણોની કૃપાથી મનને નિર્મળ કરીને હું શ્રીરામના પવિત્ર યશનું વર્ણન કરું છું.';

  function renderCard(props: ShareCardProps) {
    let tree: TestRenderer.ReactTestRenderer | undefined;
    act(() => {
      tree = TestRenderer.create(<ShareCard {...props} />);
    });
    return tree!;
  }

  const guProps: ShareCardProps = {
    ...baseProps,
    lang: 'gu',
    meaningHi,
    meaningEn: 'By the grace of the Guru...',
    meaningGu: nativeGu,
  };

  test('renders verified meaningGu, not transliterated Hindi', () => {
    const tree = renderCard(guProps);
    const rendered = tree.root
      .findAllByType(Text)
      .some((n) => n.props.children === nativeGu);
    expect(rendered).toBe(true);
  });

  test('falls back to transliteration when meaningGu is absent', () => {
    const tree = renderCard({ ...guProps, meaningGu: undefined });
    // Fallback re-scripts the Hindi wording, so the native translation must NOT appear.
    const nativeShown = tree.root
      .findAllByType(Text)
      .some((n) => n.props.children === nativeGu);
    expect(nativeShown).toBe(false);
  });
});
