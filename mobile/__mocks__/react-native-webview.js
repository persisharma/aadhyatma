// Global Jest stub for the native WebView: the RN preset does not transform
// react-native-webview, so any screen that imports the docked YouTube player would
// otherwise fail to load. Renders nothing and exposes the imperative handle the
// player calls (injectJavaScript / reload) as no-ops.
const React = require('react');

const WebView = React.forwardRef((_props, ref) => {
  React.useImperativeHandle(ref, () => ({
    injectJavaScript: () => {},
    reload: () => {},
  }));
  return null;
});
WebView.displayName = 'WebView';

module.exports = { __esModule: true, WebView, default: WebView };
