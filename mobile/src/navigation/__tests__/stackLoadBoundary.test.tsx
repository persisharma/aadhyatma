import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Text } from 'react-native';
import StackLoadBoundary from '../StackLoadBoundary';
import { ThemeProvider } from '@/theme/ThemeContext';
import { FontScaleProvider } from '@/contexts/FontScaleContext';
import { GitaLanguageProvider } from '@/data/gita/language';

/**
 * A lazily loaded tab stack that fails to evaluate must cost ONE tab, not the
 * app. Without this boundary the rejected `React.lazy` payload throws past the
 * root, the tree unmounts, and the user sees a dead screen they cannot leave —
 * indistinguishable from a launch that never finishes.
 */
function wrap(children: React.ReactNode) {
  return (
    <FontScaleProvider>
      <ThemeProvider>
        <GitaLanguageProvider>{children}</GitaLanguageProvider>
      </ThemeProvider>
    </FontScaleProvider>
  );
}

const texts = (tree: TestRenderer.ReactTestRenderer) =>
  tree.root.findAllByType(Text).map((n) => String(n.props.children));

function Boom(): React.ReactElement {
  throw new Error('chunk failed to evaluate');
}

describe('StackLoadBoundary', () => {
  let errorSpy: jest.SpyInstance;
  beforeEach(() => {
    // React logs the caught error; the boundary handling it is the point.
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => errorSpy.mockRestore());

  test('renders its children when the stack loads', async () => {
    let tree!: TestRenderer.ReactTestRenderer;
    await act(async () => {
      tree = TestRenderer.create(wrap(<StackLoadBoundary><Text>PanchangStack</Text></StackLoadBoundary>));
    });
    expect(texts(tree)).toContain('PanchangStack');
  });

  test('a stack that throws shows a recoverable surface instead of taking down the tree', async () => {
    let tree!: TestRenderer.ReactTestRenderer;
    await act(async () => {
      tree = TestRenderer.create(wrap(<StackLoadBoundary><Boom /></StackLoadBoundary>));
    });
    // The tab renders something the user can see and act on — never nothing.
    expect(texts(tree).join(' ')).toMatch(/पंचांग खुल नहीं सका|could not open/);
    expect(texts(tree).join(' ')).toMatch(/पुनः प्रयास|Retry/);
    expect(tree.root.findAllByType(Boom)).toHaveLength(0);
  });

  test('Retry re-attempts the stack', async () => {
    let tree!: TestRenderer.ReactTestRenderer;
    await act(async () => {
      tree = TestRenderer.create(wrap(<StackLoadBoundary><Boom /></StackLoadBoundary>));
    });
    const retry = tree.root.findAll((n) => n.props?.accessibilityRole === 'button')[0];
    await act(async () => { retry.props.onPress(); });
    // It threw again (the same failing child), so we are back on the fallback
    // rather than stuck on a blank frame.
    expect(texts(tree).join(' ')).toMatch(/पंचांग खुल नहीं सका|could not open/);
  });
});
