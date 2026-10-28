import { createServer } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../..', import.meta.url))
  .replaceAll('\\', '/')
  .replace(/\/$/, '');
const aliases = {
  '@': 'src',
  '@core': 'src/@core',
  '@ui': 'src/@ui',
  '@utils': 'src/@utils',
  '@core-styles': 'src/@core-styles',
  '@layouts': 'src/@layouts',
  '@images': 'src/assets/images',
  '@styles': 'src/assets/styles',
  '@configured-variables': 'src/assets/styles/variables/_template.scss',
};
const server = await createServer({
  root,
  cacheDir: `${root}/node_modules/.vite-label-qa`,
  configFile: false,
  plugins: [vue()],
  resolve: { alias: Object.fromEntries(Object.entries(aliases).map(([key, path]) => [key, `${root}/${path}`])) },
  define: { 'process.env': {}, __APP_VERSION__: JSON.stringify('label-qa') },
  server: { host: '127.0.0.1', port: 5175, strictPort: true },
  optimizeDeps: {
    entries: ['tests/e2e/fixtures/label-template-harness.html'],
    include: [
      'vue',
      'pinia',
      'vue-router',
      'vuetify',
      'vuetify/components',
      'vuetify/directives',
      '@zxing/browser',
      'konva',
      'vue-konva',
      'jspdf',
      'jsbarcode',
      'qrcode',
    ],
  },
});
await server.listen();
server.printUrls();
