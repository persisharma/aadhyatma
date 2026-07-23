import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
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
});
