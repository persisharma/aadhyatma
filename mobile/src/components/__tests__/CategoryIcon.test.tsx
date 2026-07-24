import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { purposes } from '@/data/purposes';
import CategoryIcon, { type CategoryIconKey } from '../CategoryIcon';

function renderIcon(iconKey: CategoryIconKey) {
  let tree: TestRenderer.ReactTestRenderer | undefined;
  act(() => {
    tree = TestRenderer.create(<CategoryIcon iconKey={iconKey} />);
  });
  if (!tree) throw new Error('CategoryIcon did not render');
  return tree.root;
}

function expectParts(iconKey: CategoryIconKey, partIds: string[]) {
  const root = renderIcon(iconKey);
  for (const partId of partIds) {
    expect(root.findByProps({ testID: partId })).toBeTruthy();
  }
}

describe('CategoryIcon', () => {
  it('renders Vrat as a ritual kalash with stronger silhouette parts', () => {
    expectParts('vrat', [
      'category-icon-vrat-coconut',
      'category-icon-vrat-left-leaf',
      'category-icon-vrat-pot',
      'category-icon-vrat-band',
    ]);
  });

  it('renders Kavach as a protective crest with devotional details', () => {
    expectParts('kavacham', [
      'category-icon-kavach-shield',
      'category-icon-kavach-spine',
      'category-icon-kavach-crossbar',
      'category-icon-kavach-arc',
      'category-icon-kavach-bindu',
    ]);
  });

  it('renders Suktam as manuscript hymn leaves rather than generic bars', () => {
    expectParts('suktam', [
      'category-icon-suktam-leaf-top',
      'category-icon-suktam-leaf-bottom',
      'category-icon-suktam-rule-top',
      'category-icon-suktam-bindu',
    ]);
  });

  it('renders Purpose as an intent compass rather than reused armour', () => {
    expectParts('purpose', [
      'category-icon-purpose-ring',
      'category-icon-purpose-arrow',
      'category-icon-purpose-bindu',
    ]);
  });

  it('renders Insight as an inner-seeing glyph rather than a generic book', () => {
    expectParts('insight', [
      'category-icon-insight-eye',
      'category-icon-insight-pupil',
      'category-icon-insight-ray',
    ]);
  });

  it('renders a dedicated glyph for every shipped purpose icon', () => {
    for (const purpose of purposes) {
      expect(purpose.iconKey).toMatch(/^purpose-/);
      expectParts(purpose.iconKey, [`category-icon-${purpose.iconKey}`]);
    }
  });
});
