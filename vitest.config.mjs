import { defineConfig, transformWithOxc } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

/**
 * Next.js lets components use JSX in `.js` files; Vite infers the language from
 * the extension, so compile `src/**\/*.js` as JSX before the default pipeline.
 */
const jsxInJs = {
  name: 'nibras:jsx-in-js',
  enforce: 'pre',
  async transform(code, id) {
    if (!/[\\/]src[\\/].*\.js$/.test(id) || !code.includes('<')) return null;
    const result = await transformWithOxc(code, id.replace(/\.js$/, '.jsx'), { jsx: { runtime: 'automatic' } });
    return { code: result.code, map: result.map };
  },
};

export default defineConfig({
  plugins: [jsxInJs, react()],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.mjs'],
    include: ['src/**/*.test.{js,jsx}'],
  },
});
