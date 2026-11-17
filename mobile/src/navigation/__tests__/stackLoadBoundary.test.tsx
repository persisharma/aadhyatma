import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Text } from 'react-native';
import StackLoadBoundary, { onStackRetry, setErrorBoundaryHomeAction } from '../StackLoadBoundary';
import { lazyScreen } from '../lazyScreen';

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
    expect(texts(tree).join(' ')).toMatch(/कुछ खुल नहीं सका|could not open/);
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
    expect(texts(tree).join(' ')).toMatch(/कुछ खुल नहीं सका|could not open/);
  });

  test('Retry remounts the subtree and recovers once the child stops throwing', async () => {
    let healthy = false;
    function Flaky() {
      if (!healthy) throw new Error('render failed');
      return <Text>Recovered</Text>;
    }
    let tree!: TestRenderer.ReactTestRenderer;
    await act(async () => {
      tree = TestRenderer.create(wrap(<StackLoadBoundary><Flaky /></StackLoadBoundary>));
    });
    expect(texts(tree)).not.toContain('Recovered');
    healthy = true;
    await act(async () => { tree.root.findByProps({ testID: 'error-boundary-retry' }).props.onPress(); });
    expect(texts(tree)).toContain('Recovered');
  });

  test('Home runs the registered action and remounts', async () => {
    const home = jest.fn();
    setErrorBoundaryHomeAction(home);
    let tree!: TestRenderer.ReactTestRenderer;
    await act(async () => {
      tree = TestRenderer.create(wrap(<StackLoadBoundary><Boom /></StackLoadBoundary>));
    });
    await act(async () => { tree.root.findByProps({ testID: 'error-boundary-home' }).props.onPress(); });
    expect(home).toHaveBeenCalledTimes(1);
    setErrorBoundaryHomeAction(null);
  });

  test('the fallback renders with no providers at all (broken contexts)', async () => {
    let tree!: TestRenderer.ReactTestRenderer;
    await act(async () => {
      tree = TestRenderer.create(<StackLoadBoundary><Boom /></StackLoadBoundary>);
    });
    expect(texts(tree).join(' ')).toMatch(/कुछ खुल नहीं सका/);
    expect(tree.root.findAllByProps({ testID: 'error-boundary-retry' }).length).toBeGreaterThan(0);
  });

  test.each([
    ['en', /Something could not open/],
    ['gu', /[\u0A80-\u0AFF]/],
    ['kn', /[\u0C80-\u0CFF]/],
  ] as const)('fallback is localized for %s', async (lang, expected) => {
    let tree!: TestRenderer.ReactTestRenderer;
    await act(async () => {
      tree = TestRenderer.create(
        <FontScaleProvider><ThemeProvider>
          <GitaLanguageProvider initialLang={lang}><StackLoadBoundary><Boom /></StackLoadBoundary></GitaLanguageProvider>
        </ThemeProvider></FontScaleProvider>,
      );
    });
    const all = texts(tree).join(' ');
    expect(all).not.toMatch(/[\u0900-\u097F]/);
    expect(all).toMatch(expected);
  });

  test('a failed lazy screen re-attempts its import on Retry instead of rethrowing the cached failure', async () => {
    let calls = 0;
    const Loaded = () => <Text>LoadedScreen</Text>;
    const Screen = lazyScreen('RetryProbe', 9, (): Promise<{ default: React.ComponentType<object> }> => {
      calls += 1;
      return calls === 1
        ? Promise.reject(new Error('chunk failed'))
        : Promise.resolve({ default: Loaded });
    });
    let tree!: TestRenderer.ReactTestRenderer;
    await act(async () => {
      tree = TestRenderer.create(wrap(<StackLoadBoundary><Screen /></StackLoadBoundary>));
    });
    expect(texts(tree).join(' ')).toMatch(/could not open|खुल नहीं सका/);
    await act(async () => { tree.root.findByProps({ testID: 'error-boundary-retry' }).props.onPress(); });
    expect(calls).toBe(2);
    expect(texts(tree)).toContain('LoadedScreen');
  });

  test('Retry notifies stack-retry listeners (the Panchang lazy drops its cached rejection through this)', async () => {
    const listener = jest.fn();
    const off = onStackRetry(listener);
    let tree!: TestRenderer.ReactTestRenderer;
    await act(async () => {
      tree = TestRenderer.create(wrap(<StackLoadBoundary><Boom /></StackLoadBoundary>));
    });
    await act(async () => { tree.root.findByProps({ testID: 'error-boundary-retry' }).props.onPress(); });
    expect(listener).toHaveBeenCalledTimes(1);
    off();
  });
});
