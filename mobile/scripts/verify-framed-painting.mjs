import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { mkdtempSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const yoga = path.join(path.dirname(require.resolve('react-native/package.json')), 'ReactCommon/yoga');
const walk = directory => readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
  const file = path.join(directory, entry.name);
  return entry.isDirectory() ? walk(file) : file.endsWith('.cpp') ? [file] : [];
});
const temporary = mkdtempSync(path.join(tmpdir(), 'vedansh-image-geometry-'));
try {
  const executable = path.join(temporary, 'verify');
  execFileSync(process.env.CXX || 'c++', ['-std=c++20', '-O0', '-I', yoga,
    ...walk(path.join(yoga, 'yoga')), fileURLToPath(new URL('./verify-framed-painting.cpp', import.meta.url)), '-o', executable],
  { stdio: 'inherit' });
  execFileSync(executable, [], { stdio: 'inherit' });
} finally {
  rmSync(temporary, { recursive: true, force: true });
}
