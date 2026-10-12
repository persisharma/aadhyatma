import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Image } from 'react-native';
import { purposes } from '@/data/purposes';
import CategoryIcon, { type CategoryIconKey } from '../CategoryIcon';

jest.mock('../LotusMark', () => 'LotusMark');
function render(iconKey: CategoryIconKey) {
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => { tree = TestRenderer.create(<CategoryIcon iconKey={iconKey} />); });
  return tree.root;
}
it('renders every category through bundled artwork without a duplicate accessible label', () => {
  const keys: CategoryIconKey[] = ['granth', 'stotram', 'chalisa', 'japam', 'deity', 'aarti', 'theerth', 'sanskar', 'kavacham', 'ashtakam', 'suktam', 'vrat', 'purpose', 'insight', 'muhurat', 'daan'];
  for (const key of keys) {
    const art = render(key).findByType(Image);
    expect(art.props.source).toBeTruthy();
    expect(art.props.source.uri).toBeUndefined();
    expect(art.props.accessible).toBe(false);
    expect(art.props.resizeMode).toBe('contain');
    expect(art.props.testID).toBe(`category-icon-${key}`);
  }
});
it('keeps the animated practice mark and gives each purpose an appropriate library icon', () => {
  expect(render('routine').findByType('LotusMark' as any)).toBeTruthy();
  for (const purpose of purposes) expect(() => render(purpose.iconKey)).not.toThrow();
});
