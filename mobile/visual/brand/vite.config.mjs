import { defineConfig } from '../kundali/node_modules/vite/dist/node/index.js';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import path from 'node:path';

const root = fileURLToPath(new URL('../../', import.meta.url));
const browserModules = path.join(root, 'visual/kundali/node_modules');
const webExtensions = ['.web.tsx', '.web.ts', '.web.jsx', '.web.js', '.tsx', '.ts', '.jsx', '.js', '.json'];
function fontCSS() {
  const base = path.join(root, 'node_modules/@expo-google-fonts');
  const rules = ['@font-face{font-family:VedanshDevotionalText;src:url("/assets/fonts/VedanshDevotionalText.ttf") format("truetype");font-display:block}'];
  function walk(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const p = path.join(directory, entry.name);
      if (entry.isDirectory()) walk(p);
      else if (entry.name.endsWith('.ttf')) rules.push(`@font-face{font-family:"${path.basename(entry.name, '.ttf')}";src:url("/${path.relative(root, p).split(path.sep).join('/')}") format("truetype");font-display:block}`);
    }
  }
  walk(base); return rules.join('\n');
}

export default defineConfig({
  root,
  build: { rollupOptions: { input: path.join(root, 'visual/brand/index.html') } },
  esbuild: { jsx: 'automatic' },
  define: { __DEV__: 'false', global: 'globalThis' },
  optimizeDeps: { esbuildOptions: { resolveExtensions: webExtensions } },
  resolve: {
    alias: [
      { find: 'react', replacement: path.join(root, 'node_modules/react') },
      { find: /^react-native$/, replacement: path.join(browserModules, 'react-native-web/dist/index.js') },
      { find: /^react-native-svg$/, replacement: path.join(root, 'visual/kundali/svg.jsx') },
      { find: /^react-native-svg-web$/, replacement: path.join(root, 'node_modules/react-native-svg/src/ReactNativeSVG.web.ts') },
      { find: /^react-native-safe-area-context$/, replacement: path.join(root, 'visual/kundali/insets.ts') },
      { find: /^@react-native-async-storage\/async-storage$/, replacement: path.join(root, 'visual/kundali/storage.ts') },
      { find: '@assets', replacement: path.join(root, 'assets') },
      { find: '@', replacement: path.join(root, 'src') },
    ],
    extensions: webExtensions,
  },
  plugins: [{
    name: 'native-preview-adapters', enforce: 'pre',
    transform(code, id) {
      if (!id.endsWith('/VedanshWordmark.tsx')) return;
      return code.replace(/require\(['"]([^'"]+\.png)['"]\)/g, (_, asset) => `({uri:new URL(${JSON.stringify(asset.replace('@assets/', '/assets/'))},window.location.origin).href})`);
    },
    configureServer(server) {
      server.middlewares.use('/fonts.css', (_request, response) => { response.setHeader('content-type', 'text/css'); response.end(fontCSS()); });
    },
  }],
  server: { host: '127.0.0.1', port: 4184, strictPort: true },
});
