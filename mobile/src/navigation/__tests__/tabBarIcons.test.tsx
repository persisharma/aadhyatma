import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';

import { MusicIcon, HomeIcon, BhaktiIcon, PanchangIcon, MoreIcon } from '../tabBarIcons';

function render(el: React.ReactElement) {
  let tree: TestRenderer.ReactTestRenderer | undefined;
  act(() => {
    tree = TestRenderer.create(el);
  });
  if (!tree) throw new Error('icon did not render');
  return tree.root;
}

describe('tabBarIcons — MusicIcon (Bhajan tab)', () => {
  it('draws the classic filled eighth-note glyph', () => {
    // Regression guard for the user-approved reference icon: a filled head,
    // vertical stem, and square flag. See design.md §17 and tabBarIcons.tsx.
    const color = '#B8621B'; // saffron — the active tint
    const size = 25; // React Navigation's default tabBarIcon size
    const root = render(<MusicIcon color={color} size={size} />);

    const path = root.findByProps({ testID: 'tab-music-icon-path' }).props;

    expect(path.fill).toBe(color);
    expect(path.d).toBe('M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z');
  });

  it('tints the whole glyph so it reads as a note', () => {
    const color = '#6E5230'; // ink-muted — the inactive tint
    const root = render(<MusicIcon color={color} size={25} />);

    expect(root.findByProps({ testID: 'tab-music-icon-path' }).props.fill).toBe(color);
  });
});

describe('tabBarIcons — the five icons render', () => {
  it('renders every tab icon without crashing', () => {
    const color = '#B8621B';
    const size = 25;
    expect(() => render(<HomeIcon color={color} size={size} />)).not.toThrow();
    expect(() => render(<BhaktiIcon color={color} accentColor={color} size={size} />)).not.toThrow();
    expect(() => render(<PanchangIcon color={color} size={size} />)).not.toThrow();
    expect(() => render(<MusicIcon color={color} size={size} />)).not.toThrow();
    expect(() => render(<MoreIcon color={color} size={size} />)).not.toThrow();
  });
});
