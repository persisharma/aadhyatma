import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import Gallery from '../JyotishLandingGallery';
import type { Lang } from '@/data/gita/language';
let mockScale = 'M';
let mockWidth = 390;
let mockSystemScale = 1;
jest.mock('@/contexts/FontScaleContext', () => ({ useFontScale: () => ({ scale: mockScale, factor: mockScale === 'L' ? 1.15 : 1 }) }));
jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({ __esModule: true, default: () => ({ width: mockWidth, height: 844, fontScale: mockSystemScale, scale: 2 }) }));
jest.mock('react-native-safe-area-context', () => ({ SafeAreaView: ({ children }: React.PropsWithChildren) => <>{children}</> }));
const actions = { onOpenKundali: jest.fn(), onOpenRashifal: jest.fn(), onOpenGunaMilan: jest.fn(), onOpenNamkaran: jest.fn(), onOpenNavagraha: jest.fn() };
function render(node: React.ReactElement) { let tree!: ReactTestRenderer; act(() => { tree = create(node); }); return tree; }
function press(tree: ReactTestRenderer, label: string) { act(() => tree.root.findByProps({ accessibilityLabel: label, accessibilityRole: 'button' }).props.onPress()); }
beforeEach(() => { mockScale = 'M'; mockWidth = 390; mockSystemScale = 1; jest.clearAllMocks(); });
describe.each<Lang>(['hi', 'en', 'gu', 'kn'])('%s gallery', lang => {
  test.each(['M', 'L'])('%s keeps full copy and all routes; education opens and closes', scale => {
    mockScale = scale;
    const tree = render(<Gallery {...actions} lang={lang} />);
    for (const [label, action] of [['Create Kundali', actions.onOpenKundali], ['Open Daily Rashifal', actions.onOpenRashifal], ['Open Guna Milan', actions.onOpenGunaMilan], ['Open Namkaran', actions.onOpenNamkaran], ['Open Navagraha Stotram', actions.onOpenNavagraha]] as const) { press(tree, label); expect(action).toHaveBeenCalledTimes(1); }
    for (const node of tree.root.findAllByType(Text)) { expect(node.props.numberOfLines).toBeUndefined(); expect(node.props.adjustsFontSizeToFit).toBeUndefined(); }
    const first = tree.root.findByProps({ accessibilityLabel: 'Create Kundali', accessibilityRole: 'button' });
    expect(StyleSheet.flatten(first.props.style({ pressed: false })).width).toBe(scale === 'L' ? '100%' : '48.5%');
    press(tree, 'How Jyotish works');
    expect(tree.root.findByProps({ accessibilityViewIsModal: true })).toBeTruthy();
    press(tree, 'Close Jyotish explanation');
    expect(tree.root.findAllByProps({ accessibilityViewIsModal: true })).toHaveLength(0);
    act(() => tree.unmount());
  });
});
test.each([[320, 1], [390, 1.6]])('width %s / system scale %s reflows', (width, systemScale) => {
  mockWidth = width; mockSystemScale = systemScale;
  const tree = render(<Gallery lang="kn" {...actions} />);
  const first = tree.root.findByProps({ accessibilityLabel: 'Create Kundali', accessibilityRole: 'button' });
  expect(StyleSheet.flatten(first.props.style({ pressed: false })).width).toBe('100%');
  act(() => tree.unmount());
});
test('saved gallery keeps daily content and supplementary tools, with unambiguous daily action', () => {
  const tree = render(<Gallery {...actions} saved lang="en" additionalTools={<Text testID="gochar">Gochar</Text>}><Text testID="daily">Existing daily Rashifal</Text></Gallery>);
  expect(tree.root.findByProps({ testID: 'daily' })).toBeTruthy();
  expect(tree.root.findByProps({ testID: 'gochar' })).toBeTruthy();
  press(tree, 'Browse Daily Rashifal'); expect(actions.onOpenRashifal).toHaveBeenCalled();
  expect(tree.root.findAllByProps({ accessibilityLabel: 'Open Daily Rashifal' })).toHaveLength(0);
  act(() => tree.unmount());
});
