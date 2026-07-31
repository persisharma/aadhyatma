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
  it('draws the note head as a FILLED disc, not a hollow ring', () => {
    // Regression guard. The head was once authored as a bordered ring
    // (borderWidth only, no fill), which reads as a broken glyph rather than a
    // music note — the Bhajan tab icon looked broken in the bar. A note head
    // must be a solid disc. See design.md §17 and tabBarIcons.tsx.
    const color = '#B8621B'; // saffron — the active tint
    const size = 25; // React Navigation's default tabBarIcon size
    const root = render(<MusicIcon color={color} size={size} />);

    const style = root.findByProps({ testID: 'tab-music-icon-head' }).props.style;

    // Filled: a solid background in the tint colour.
    expect(style.backgroundColor).toBe(color);
    // NOT a hollow ring — the head carries no stroked border.
    expect(style.borderWidth).toBeUndefined();
    expect(style.borderColor).toBeUndefined();
    // A circular head: a square box with a full-radius corner.
    expect(style.width).toBe(style.height);
    expect(style.borderRadius).toBeCloseTo(style.width / 2);
  });

  it('tints the stem and flag so the whole glyph reads as a note', () => {
    const color = '#6E5230'; // ink-muted — the inactive tint
    const root = render(<MusicIcon color={color} size={25} />);

    for (const testID of ['tab-music-icon-stem', 'tab-music-icon-flag']) {
      expect(root.findByProps({ testID }).props.style.backgroundColor).toBe(color);
    }
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
