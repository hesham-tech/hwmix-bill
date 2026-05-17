import { fileURLToPath } from 'node:url';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { defineConfig } from 'vite';
import vuetify from 'vite-plugin-vuetify';
import svgLoader from 'vite-svg-loader';
import viteCompression from 'vite-plugin-compression';
import { VitePWA } from 'vite-plugin-pwa';
import packageJson from './package.json';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),

    // Custom plugin to replace version placeholder in index.html during build
    {
      name: 'html-version-replace',
      transformIndexHtml(html) {
        return html.replace(/__APP_VERSION__/g, packageJson.version);
      }
    },

    // PWA Configuration
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt'],
      manifest: {
        name: 'HWNix Bill',
        short_name: 'HWNix',
        description: 'HWNix Bill - Professional Billing System',
        theme_color: '#6200ee',
        icons: [
          {
            src: 'favicon.ico',
            sizes: '64x64 32x32 24x24 16x16',
            type: 'image/x-icon',
          },
        ],
      },
      workbox: {
        navigateFallback: null,
        globPatterns: ['assets/main-*.js', 'assets/index-*.js', 'assets/*.css', '**/*.{ico,png,svg}'],
        globIgnores: ['**/vendor-*.js', '**/Dashboard-*.js', '**/InvoiceList-*.js'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
    }),

    // Gzip Compression
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
    }),

    // Brotli Compression
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
    }),

    vuetify({
      autoImport: true,
      styles: {
        configFile: 'src/assets/styles/variables/_vuetify.scss',
      },
    }),
    Components({
      dirs: ['src/@ui/components', 'src/components'],
      dts: false,
      resolvers: [
        componentName => {
          if (componentName === 'VueApexCharts') return { name: 'default', from: 'vue3-apexcharts', as: 'VueApexCharts' };
        },
      ],
    }),

    AutoImport({
      imports: ['vue', 'vue-router', '@vueuse/core', '@vueuse/math', 'pinia'],
      vueTemplate: true,
      ignore: ['useCookies', 'useStorage'],
      eslintrc: {
        enabled: true,
        filepath: './.eslintrc-auto-import.json',
      },
    }),
    svgLoader(),
  ],
  define: {
    'process.env': {},
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'false',
    __VUE_OPTIONS_API__: 'true',
    __VUE_PROD_DEVTOOLS__: 'false',
    __APP_VERSION__: JSON.stringify(packageJson.version),
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@core': fileURLToPath(new URL('./src/@core', import.meta.url)),
      '@ui': fileURLToPath(new URL('./src/@ui', import.meta.url)),
      '@utils': fileURLToPath(new URL('./src/@utils', import.meta.url)),
      '@core-styles': fileURLToPath(new URL('./src/@core-styles', import.meta.url)),
      '@layouts': fileURLToPath(new URL('./src/@layouts', import.meta.url)),
      '@images': fileURLToPath(new URL('./src/assets/images/', import.meta.url)),
      '@styles': fileURLToPath(new URL('./src/assets/styles/', import.meta.url)),
      '@configured-variables': fileURLToPath(new URL('./src/assets/styles/variables/_template.scss', import.meta.url)),
    },
  },
  build: {
    chunkSizeWarningLimit: 5000,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-vue': ['vue', 'vue-router', 'pinia'],
          'vendor-vuetify': ['vuetify'],
          'vendor-charts': ['apexcharts', 'vue3-apexcharts', 'chart.js', 'vue-chartjs'],
          'vendor-utils': ['dayjs', 'axios', '@vueuse/core', '@vueuse/math'],
          'vendor-print': ['jsbarcode', 'qrcode.vue', 'html2canvas'],
        },
      },
    },
  },
});
