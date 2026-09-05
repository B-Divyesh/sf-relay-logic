import { execFileSync } from 'node:child_process';
import { defineConfig } from 'vite';

function buildId(): string {
  if (process.env.VITE_BUILD_SHA) return process.env.VITE_BUILD_SHA.slice(0, 8);
  try {
    return execFileSync('git', ['rev-parse', '--short=8', 'HEAD'], { encoding: 'utf8' }).trim();
  } catch {
    return 'local';
  }
}

export default defineConfig({
  define: {
    __BUILD_ID__: JSON.stringify(buildId()),
  },
  build: {
    target: 'es2022',
    sourcemap: true,
  },
});
