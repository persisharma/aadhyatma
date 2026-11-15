import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import HomeStackNavigator from "../HomeStackNavigator";
const mockStack: {
  props?: { initialRouteName?: string; children?: React.ReactNode };
} = {};
jest.mock("@react-navigation/native-stack", () => ({
  createNativeStackNavigator: () => ({
    Navigator: (props: { children?: React.ReactNode }) => {
      mockStack.props = props;
      return props.children;
    },
    Screen: () => null,
  }),
}));
jest.mock("@/screens/HomeScreen", () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock("../lazyScreen", () => ({ lazyScreen: () => () => null }));
// A Home mount must never evaluate the native WebView/player route.
jest.mock("@/screens/DarshanPlayerScreen", () => {
  throw new Error("Darshan player evaluated at startup");
});
it("keeps Home as the initial screen and all Darshan destinations behind on-demand loaders", () => {
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => {
    tree = TestRenderer.create(<HomeStackNavigator />);
  });
  expect(mockStack.props?.initialRouteName).toBe("Home");
  const screens = React.Children.toArray(
    mockStack.props?.children,
  ) as React.ReactElement<{
    name: string;
    getComponent?: () => unknown;
    component?: unknown;
    options?: { presentation?: string };
  }>[];
  expect(screens[0].props.name).toBe("Home");
  for (const name of ["DarshanQuick", "DarshanList", "DarshanPlayer"]) {
    const route = screens.find((s) => s.props.name === name)!;
    expect(route.props.getComponent).toEqual(expect.any(Function));
    expect(route.props.component).toBeUndefined();
  }
  expect(
    screens.find((s) => s.props.name === "DarshanQuick")?.props.options
      ?.presentation,
  ).toBe("transparentModal");
  act(() => tree.unmount());
});
