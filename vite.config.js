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

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),

    // PWA Configuration
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'manifest.json'],
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
        // Cache all assets for offline use
        globPatterns: ['**/*.{js,css,html,ico,png,svg,gz,br}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // < 1 year
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

    // Docs: https://github.com/vuetifyjs/vuetify-loader/tree/master/packages/vite-plugin
    vuetify({
      autoImport: true, // Enable auto-import for better tree-shaking
      styles: {
        configFile: 'src/assets/styles/variables/_vuetify.scss',
      },
      defaults: {
        VTextField: {
          hideDetails: 'auto',
        },
        VSelect: {
          hideDetails: 'auto',
        },
        VTextarea: {
          hideDetails: 'auto',
        },
      },
    }),
    Components({
      dirs: ['src/@ui/components', 'src/components'],
      dts: true,
      resolvers: [
        componentName => {
          // Auto import `VueApexCharts`
          if (componentName === 'VueApexCharts') return { name: 'default', from: 'vue3-apexcharts', as: 'VueApexCharts' };
        },
      ],
    }),

    // Docs: https://github.com/antfu/unplugin-auto-import#unplugin-auto-import
    AutoImport({
      imports: ['vue', 'vue-router', '@vueuse/core', '@vueuse/math', 'pinia'],
      vueTemplate: true,

      // ℹ️ Disabled to avoid confusion & accidental usage
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
    // Vue feature flags - suppress warnings
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'false',
    __VUE_OPTIONS_API__: 'true',
    __VUE_PROD_DEVTOOLS__: 'false',
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
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
      },
      '/storage': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 5000,
    // CSS Code Splitting
    cssCodeSplit: true,
    // Terser minification disabled temporarily due to build issues
    // Will use default esbuild minification
    // minify: 'terser',
    // terserOptions: {
    //   compress: {
    //     drop_console: true,
    //     drop_debugger: true,
    //   },
    // },
    // Manual chunks for better code splitting
    rollupOptions: {
      output: {
        manualChunks: {
          // Vue core libraries
          'vendor-vue': ['vue', 'vue-router', 'pinia'],
          // Vuetify
          'vendor-vuetify': ['vuetify'],
          // Charts libraries
          'vendor-charts': ['apexcharts', 'vue3-apexcharts', 'chart.js', 'vue-chartjs'],
          // Utility libraries
          'vendor-utils': ['dayjs', 'axios', '@vueuse/core', '@vueuse/math'],
          // Print/image related
          'vendor-print': ['jsbarcode', 'qrcode.vue', 'html2canvas'],
        },
      },
    },
  },
  optimizeDeps: {
    entries: ['./src/**/*.vue'],
    include: ['vue', 'vue-router', 'pinia', 'vuetify', 'axios', 'dayjs', '@vueuse/core'],
    exclude: ['chart.js', 'html2canvas'],
  },
});
