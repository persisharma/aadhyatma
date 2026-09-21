import fs from 'node:fs';
import path from 'node:path';

jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: () => ({ Navigator: 'Navigator', Screen: 'Screen' }),
}));
jest.mock('@/screens/MoreScreen', () => ({ __esModule: true, default: () => null }));
jest.mock('@/screens/GitaReaderScreen', () => ({ __esModule: true, default: () => null }));

test('More destination modules load only when their registered route is opened', () => {
  const source = fs.readFileSync(path.resolve(__dirname, '../MoreStackNavigator.tsx'), 'utf8');
  const destinations = [...source.matchAll(/name="([^"]+)" getComponent=\{\(\) => require\('([^']+)'\)\.default\}/g)];
  const loaded: string[] = [];
  const screens = new Map<string, () => null>();
  for (const [, route, module] of destinations) {
    const Screen = () => null;
    screens.set(route, Screen);
    jest.doMock(module, () => { loaded.push(route); return { __esModule: true, default: Screen }; });
  }
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Navigator = require('../MoreStackNavigator').default;
  const element = Navigator();
  expect(loaded).toEqual([]);
  expect(destinations.length).toBeGreaterThan(25);
  const routes = element.props.children.filter(Boolean);
  expect(routes.find((r: { props: { name: string } }) => r.props.name === 'MoreHome').props.component).toBeDefined();
  for (const [, route] of destinations) {
    const screen = routes.find((r: { props: { name: string } }) => r.props.name === route);
    expect(screen.props.getComponent()).toBe(screens.get(route));
    expect(loaded.filter((name) => name === route)).toHaveLength(1);
    expect(screen.props.getComponent()).toBe(screens.get(route));
    expect(loaded.filter((name) => name === route)).toHaveLength(1);
  }
});
