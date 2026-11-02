import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import path from 'node:path';

const root = fileURLToPath(new URL('../../', import.meta.url));
function fontCSS() {
  const base = path.join(root, 'node_modules/@expo-google-fonts');
  const rules = [];
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
  esbuild: { jsx: 'automatic' },
  define: { __DEV__: 'false', global: 'globalThis' },
  resolve: {
    alias: [
      { find: /^react-native$/, replacement: 'react-native-web' },
      { find: /^react-native-svg$/, replacement: path.join(root, 'node_modules/react-native-svg/src/ReactNativeSVG.web.ts') },
      { find: /^react-native-safe-area-context$/, replacement: path.join(root, 'visual/kundali/insets.ts') },
      { find: /^@react-native-async-storage\/async-storage$/, replacement: path.join(root, 'visual/kundali/storage.ts') },
      { find: '@', replacement: path.join(root, 'src') },
    ],
    extensions: ['.web.tsx', '.web.ts', '.web.js', '.tsx', '.ts', '.js', '.json'],
  },
  plugins: [{
    name: 'native-preview-adapters', enforce: 'pre',
    transform(code, id) {
      if (!id.endsWith('/KundaliArtwork.tsx')) return;
      return code.replace(/require\(['"]([^'"]+\.png)['"]\)/g, (_, asset) => `({uri:new URL(${JSON.stringify(asset)},import.meta.url).href})`);
    },
    configureServer(server) {
      server.middlewares.use('/fonts.css', (_request, response) => { response.setHeader('content-type', 'text/css'); response.end(fontCSS()); });
    },
  }],
  server: { host: '127.0.0.1', port: 4173, strictPort: true },
});
