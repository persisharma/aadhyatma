import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import type { ReactTestInstance } from 'react-test-renderer';
import { Text } from 'react-native';
import { ThemeProvider } from '@/theme/ThemeContext';
import JumpToStartButton from '@/components/JumpToStartButton';

function render(props: React.ComponentProps<typeof JumpToStartButton>) {
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => {
    tree = TestRenderer.create(
      <ThemeProvider>
        <JumpToStartButton {...props} />
      </ThemeProvider>
    );
  });
  return tree;
}

function button(tree: TestRenderer.ReactTestRenderer): ReactTestInstance {
  return tree.root.findByProps({ accessibilityLabel: 'Jump to beginning' });
}

function labelText(tree: TestRenderer.ReactTestRenderer): string {
  return tree.root
    .findAllByType(Text)
    .map((t) => (Array.isArray(t.props.children) ? t.props.children.join('') : t.props.children))
    .join(' ');
}

describe('JumpToStartButton', () => {
  test('renders the Hindi label "आरंभ" when lang is hi (upright)', () => {
    const tree = render({ onPress: () => {}, lang: 'hi' });
    expect(labelText(tree)).toContain('आरंभ');
    expect(labelText(tree)).not.toContain('Start');
    const label = tree.root.findAllByType(Text).find((t) => t.props.children === 'आरंभ');
    expect(label?.props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ fontStyle: 'normal' })])
    );
  });

  test('renders the English label "Start" when lang is en (italic)', () => {
    const tree = render({ onPress: () => {}, lang: 'en' });
    expect(labelText(tree)).toContain('Start');
    expect(labelText(tree)).not.toContain('आरंभ');
    const label = tree.root.findAllByType(Text).find((t) => t.props.children === 'Start');
    expect(label?.props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ fontStyle: 'italic' })])
    );
  });

  test('exposes the "Jump to beginning" accessibility button', () => {
    const tree = render({ onPress: () => {}, lang: 'hi' });
    expect(button(tree).props.accessibilityRole).toBe('button');
  });

  test('fires onPress when pressed', () => {
    const onPress = jest.fn();
    const tree = render({ onPress, lang: 'en' });
    act(() => {
      button(tree).props.onPress();
    });
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
