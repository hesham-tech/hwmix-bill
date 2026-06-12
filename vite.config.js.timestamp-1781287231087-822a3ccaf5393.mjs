// vite.config.js
import { fileURLToPath } from "node:url";
import vue from "file:///D:/Dev/projects/hwnix-bill/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import vueJsx from "file:///D:/Dev/projects/hwnix-bill/node_modules/@vitejs/plugin-vue-jsx/dist/index.mjs";
import AutoImport from "file:///D:/Dev/projects/hwnix-bill/node_modules/unplugin-auto-import/dist/vite.js";
import Components from "file:///D:/Dev/projects/hwnix-bill/node_modules/unplugin-vue-components/dist/vite.js";
import { defineConfig } from "file:///D:/Dev/projects/hwnix-bill/node_modules/vite/dist/node/index.js";
import vuetify from "file:///D:/Dev/projects/hwnix-bill/node_modules/vite-plugin-vuetify/dist/index.mjs";
import svgLoader from "file:///D:/Dev/projects/hwnix-bill/node_modules/vite-svg-loader/index.js";
import viteCompression from "file:///D:/Dev/projects/hwnix-bill/node_modules/vite-plugin-compression/dist/index.mjs";
import { VitePWA } from "file:///D:/Dev/projects/hwnix-bill/node_modules/vite-plugin-pwa/dist/index.js";

// package.json
var package_default = {
  name: "hwnix-bill",
  version: "2.3.3",
  private: true,
  type: "module",
  scripts: {
    dev: "vite",
    build: "vite build",
    preview: "vite preview --port 5050",
    lint: "eslint . -c .eslintrc.cjs --fix --ext .ts,.js,.cjs,.vue,.tsx,.jsx",
    "build:icons": "tsx src/plugins/iconify/build-icons.js",
    postinstall: "npm run build:icons"
  },
  dependencies: {
    "@floating-ui/dom": "1.6.8",
    "@iconify-json/bxl": "^1.1.10",
    "@vueuse/core": "^10.5.0",
    "@vueuse/math": "^10.5.0",
    "@zxing/browser": "^0.1.5",
    apexcharts: "^4.1.0",
    axios: "^1.7.8",
    "chart.js": "^4.5.1",
    dayjs: "^1.11.13",
    html2canvas: "^1.4.1",
    jsbarcode: "^3.12.3",
    jspdf: "^4.1.0",
    notiwind: "^2.1.0",
    "object-to-formdata": "^4.5.1",
    pinia: "^2.1.7",
    prismjs: "^1.29.0",
    "qrcode.vue": "^3.6.0",
    "roboto-fontface": "^0.10.0",
    sass: "1.76.0",
    vue: "^3.5.13",
    "vue-advanced-cropper": "^2.8.9",
    "vue-chartjs": "^5.3.3",
    "vue-flatpickr-component": "11.0.5",
    "vue-prism-component": "^2.0.0",
    "vue-router": "^4.3.0",
    "vue3-apexcharts": "^1.8.0",
    "vue3-barcode": "^1.0.1",
    "vue3-perfect-scrollbar": "^2.0.0",
    "vue3-toastify": "^0.2.8",
    vuetify: "3.6.13",
    webfontloader: "^1.6.28",
    xlsx: "^0.18.5"
  },
  devDependencies: {
    "@antfu/eslint-config-vue": "^0.43.1",
    "@antfu/utils": "^0.7.6",
    "@iconify-json/ri": "^1.1.21",
    "@iconify/tools": "^4.0.0",
    "@iconify/utils": "^2.1.13",
    "@iconify/vue": "4.1.2",
    "@vitejs/plugin-vue": "^5.0.2",
    "@vitejs/plugin-vue-jsx": "^4.0.0",
    "eslint-config-airbnb-base": "^15.0.0",
    "eslint-import-resolver-typescript": "^3.6.1",
    "eslint-plugin-case-police": "^0.6.1",
    "eslint-plugin-import": "^2.29.1",
    "eslint-plugin-promise": "^6.1.1",
    "eslint-plugin-regex": "^1.10.0",
    "eslint-plugin-regexp": "^2.6.0",
    "eslint-plugin-sonarjs": "^0.24.0",
    "eslint-plugin-unicorn": "^51.0.1",
    "eslint-plugin-vue": "^9.19.2",
    "laravel-echo": "^2.3.0",
    "postcss-html": "^1.5.0",
    "postcss-scss": "^4.0.9",
    "pusher-js": "^8.4.0",
    tsx: "^4.7.0",
    "unplugin-auto-import": "^0.18.2",
    "unplugin-vue-components": "^0.27.3",
    vite: "^5.3.1",
    "vite-plugin-compression": "^0.5.1",
    "vite-plugin-pwa": "^1.2.0",
    "vite-plugin-vue-layouts": "^0.11.0",
    "vite-plugin-vuetify": "2.0.3",
    "vite-svg-loader": "^5.1.0"
  },
  resolutions: {}
};

// vite.config.js
var __vite_injected_original_import_meta_url = "file:///D:/Dev/projects/hwnix-bill/vite.config.js";
var vite_config_default = defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    // Custom plugin to replace version placeholder in index.html during build
    {
      name: "html-version-replace",
      transformIndexHtml(html) {
        return html.replace(/__APP_VERSION__/g, package_default.version);
      }
    },
    // PWA Configuration
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "robots.txt", "pwa-192x192.png", "pwa-512x512.png"],
      manifest: {
        name: "HWNix Bill",
        short_name: "HWNix",
        description: "HWNix Bill - Professional Billing System",
        theme_color: "#6200ee",
        icons: [
          {
            src: "favicon.ico",
            sizes: "64x64 32x32 24x24 16x16",
            type: "image/x-icon"
          },
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png"
          }
        ]
      },
      workbox: {
        navigateFallback: null,
        globPatterns: ["assets/main-*.js", "assets/index-*.js", "assets/*.css", "**/*.{ico,png,svg}"],
        globIgnores: ["**/vendor-*.js", "**/Dashboard-*.js", "**/InvoiceList-*.js"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    }),
    // Gzip Compression
    viteCompression({
      algorithm: "gzip",
      ext: ".gz"
    }),
    // Brotli Compression
    viteCompression({
      algorithm: "brotliCompress",
      ext: ".br"
    }),
    vuetify({
      autoImport: true,
      styles: {
        configFile: "src/assets/styles/variables/_vuetify.scss"
      }
    }),
    Components({
      dirs: ["src/@ui/components", "src/components"],
      dts: false,
      resolvers: [
        (componentName) => {
          if (componentName === "VueApexCharts") return { name: "default", from: "vue3-apexcharts", as: "VueApexCharts" };
        }
      ]
    }),
    AutoImport({
      imports: ["vue", "vue-router", "@vueuse/core", "@vueuse/math", "pinia"],
      vueTemplate: true,
      ignore: ["useCookies", "useStorage"],
      eslintrc: {
        enabled: true,
        filepath: "./.eslintrc-auto-import.json"
      }
    }),
    svgLoader()
  ],
  define: {
    "process.env": {},
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: "false",
    __VUE_OPTIONS_API__: "true",
    __VUE_PROD_DEVTOOLS__: "false",
    __APP_VERSION__: JSON.stringify(package_default.version)
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", __vite_injected_original_import_meta_url)),
      "@core": fileURLToPath(new URL("./src/@core", __vite_injected_original_import_meta_url)),
      "@ui": fileURLToPath(new URL("./src/@ui", __vite_injected_original_import_meta_url)),
      "@utils": fileURLToPath(new URL("./src/@utils", __vite_injected_original_import_meta_url)),
      "@core-styles": fileURLToPath(new URL("./src/@core-styles", __vite_injected_original_import_meta_url)),
      "@layouts": fileURLToPath(new URL("./src/@layouts", __vite_injected_original_import_meta_url)),
      "@images": fileURLToPath(new URL("./src/assets/images/", __vite_injected_original_import_meta_url)),
      "@styles": fileURLToPath(new URL("./src/assets/styles/", __vite_injected_original_import_meta_url)),
      "@configured-variables": fileURLToPath(new URL("./src/assets/styles/variables/_template.scss", __vite_injected_original_import_meta_url))
    }
  },
  build: {
    chunkSizeWarningLimit: 5e3,
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL("./index.html", __vite_injected_original_import_meta_url)),
        saas: fileURLToPath(new URL("./saas/index.html", __vite_injected_original_import_meta_url)),
        store: fileURLToPath(new URL("./store/index.html", __vite_injected_original_import_meta_url))
      },
      output: {
        manualChunks: {
          "vendor-vue": ["vue", "vue-router", "pinia"],
          "vendor-vuetify": ["vuetify"],
          "vendor-charts": ["apexcharts", "vue3-apexcharts", "chart.js", "vue-chartjs"],
          "vendor-utils": ["dayjs", "axios", "@vueuse/core", "@vueuse/math"],
          "vendor-print": ["jsbarcode", "qrcode.vue", "html2canvas"]
        }
      }
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiLCAicGFja2FnZS5qc29uIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiRDpcXFxcRGV2XFxcXHByb2plY3RzXFxcXGh3bml4LWJpbGxcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkQ6XFxcXERldlxcXFxwcm9qZWN0c1xcXFxod25peC1iaWxsXFxcXHZpdGUuY29uZmlnLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9EOi9EZXYvcHJvamVjdHMvaHduaXgtYmlsbC92aXRlLmNvbmZpZy5qc1wiO2ltcG9ydCB7IGZpbGVVUkxUb1BhdGggfSBmcm9tICdub2RlOnVybCc7XHJcbmltcG9ydCB2dWUgZnJvbSAnQHZpdGVqcy9wbHVnaW4tdnVlJztcclxuaW1wb3J0IHZ1ZUpzeCBmcm9tICdAdml0ZWpzL3BsdWdpbi12dWUtanN4JztcclxuaW1wb3J0IEF1dG9JbXBvcnQgZnJvbSAndW5wbHVnaW4tYXV0by1pbXBvcnQvdml0ZSc7XHJcbmltcG9ydCBDb21wb25lbnRzIGZyb20gJ3VucGx1Z2luLXZ1ZS1jb21wb25lbnRzL3ZpdGUnO1xyXG5pbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcclxuaW1wb3J0IHZ1ZXRpZnkgZnJvbSAndml0ZS1wbHVnaW4tdnVldGlmeSc7XHJcbmltcG9ydCBzdmdMb2FkZXIgZnJvbSAndml0ZS1zdmctbG9hZGVyJztcclxuaW1wb3J0IHZpdGVDb21wcmVzc2lvbiBmcm9tICd2aXRlLXBsdWdpbi1jb21wcmVzc2lvbic7XHJcbmltcG9ydCB7IFZpdGVQV0EgfSBmcm9tICd2aXRlLXBsdWdpbi1wd2EnO1xyXG5pbXBvcnQgcGFja2FnZUpzb24gZnJvbSAnLi9wYWNrYWdlLmpzb24nO1xyXG5cclxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcclxuICBwbHVnaW5zOiBbXHJcbiAgICB2dWUoKSxcclxuICAgIHZ1ZUpzeCgpLFxyXG5cclxuICAgIC8vIEN1c3RvbSBwbHVnaW4gdG8gcmVwbGFjZSB2ZXJzaW9uIHBsYWNlaG9sZGVyIGluIGluZGV4Lmh0bWwgZHVyaW5nIGJ1aWxkXHJcbiAgICB7XHJcbiAgICAgIG5hbWU6ICdodG1sLXZlcnNpb24tcmVwbGFjZScsXHJcbiAgICAgIHRyYW5zZm9ybUluZGV4SHRtbChodG1sKSB7XHJcbiAgICAgICAgcmV0dXJuIGh0bWwucmVwbGFjZSgvX19BUFBfVkVSU0lPTl9fL2csIHBhY2thZ2VKc29uLnZlcnNpb24pO1xyXG4gICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIC8vIFBXQSBDb25maWd1cmF0aW9uXHJcbiAgICBWaXRlUFdBKHtcclxuICAgICAgcmVnaXN0ZXJUeXBlOiAnYXV0b1VwZGF0ZScsXHJcbiAgICAgIGluY2x1ZGVBc3NldHM6IFsnZmF2aWNvbi5pY28nLCAncm9ib3RzLnR4dCcsICdwd2EtMTkyeDE5Mi5wbmcnLCAncHdhLTUxMng1MTIucG5nJ10sXHJcbiAgICAgIG1hbmlmZXN0OiB7XHJcbiAgICAgICAgbmFtZTogJ0hXTml4IEJpbGwnLFxyXG4gICAgICAgIHNob3J0X25hbWU6ICdIV05peCcsXHJcbiAgICAgICAgZGVzY3JpcHRpb246ICdIV05peCBCaWxsIC0gUHJvZmVzc2lvbmFsIEJpbGxpbmcgU3lzdGVtJyxcclxuICAgICAgICB0aGVtZV9jb2xvcjogJyM2MjAwZWUnLFxyXG4gICAgICAgIGljb25zOiBbXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIHNyYzogJ2Zhdmljb24uaWNvJyxcclxuICAgICAgICAgICAgc2l6ZXM6ICc2NHg2NCAzMngzMiAyNHgyNCAxNngxNicsXHJcbiAgICAgICAgICAgIHR5cGU6ICdpbWFnZS94LWljb24nLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgc3JjOiAncHdhLTE5MngxOTIucG5nJyxcclxuICAgICAgICAgICAgc2l6ZXM6ICcxOTJ4MTkyJyxcclxuICAgICAgICAgICAgdHlwZTogJ2ltYWdlL3BuZycsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBzcmM6ICdwd2EtNTEyeDUxMi5wbmcnLFxyXG4gICAgICAgICAgICBzaXplczogJzUxMng1MTInLFxyXG4gICAgICAgICAgICB0eXBlOiAnaW1hZ2UvcG5nJyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgXSxcclxuICAgICAgfSxcclxuICAgICAgd29ya2JveDoge1xyXG4gICAgICAgIG5hdmlnYXRlRmFsbGJhY2s6IG51bGwsXHJcbiAgICAgICAgZ2xvYlBhdHRlcm5zOiBbJ2Fzc2V0cy9tYWluLSouanMnLCAnYXNzZXRzL2luZGV4LSouanMnLCAnYXNzZXRzLyouY3NzJywgJyoqLyoue2ljbyxwbmcsc3ZnfSddLFxyXG4gICAgICAgIGdsb2JJZ25vcmVzOiBbJyoqL3ZlbmRvci0qLmpzJywgJyoqL0Rhc2hib2FyZC0qLmpzJywgJyoqL0ludm9pY2VMaXN0LSouanMnXSxcclxuICAgICAgICBydW50aW1lQ2FjaGluZzogW1xyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICB1cmxQYXR0ZXJuOiAvXmh0dHBzOlxcL1xcL2ZvbnRzXFwuZ29vZ2xlYXBpc1xcLmNvbVxcLy4qL2ksXHJcbiAgICAgICAgICAgIGhhbmRsZXI6ICdDYWNoZUZpcnN0JyxcclxuICAgICAgICAgICAgb3B0aW9uczoge1xyXG4gICAgICAgICAgICAgIGNhY2hlTmFtZTogJ2dvb2dsZS1mb250cy1jYWNoZScsXHJcbiAgICAgICAgICAgICAgZXhwaXJhdGlvbjoge1xyXG4gICAgICAgICAgICAgICAgbWF4RW50cmllczogMTAsXHJcbiAgICAgICAgICAgICAgICBtYXhBZ2VTZWNvbmRzOiA2MCAqIDYwICogMjQgKiAzNjUsXHJcbiAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICBjYWNoZWFibGVSZXNwb25zZToge1xyXG4gICAgICAgICAgICAgICAgc3RhdHVzZXM6IFswLCAyMDBdLFxyXG4gICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIF0sXHJcbiAgICAgIH0sXHJcbiAgICB9KSxcclxuXHJcbiAgICAvLyBHemlwIENvbXByZXNzaW9uXHJcbiAgICB2aXRlQ29tcHJlc3Npb24oe1xyXG4gICAgICBhbGdvcml0aG06ICdnemlwJyxcclxuICAgICAgZXh0OiAnLmd6JyxcclxuICAgIH0pLFxyXG5cclxuICAgIC8vIEJyb3RsaSBDb21wcmVzc2lvblxyXG4gICAgdml0ZUNvbXByZXNzaW9uKHtcclxuICAgICAgYWxnb3JpdGhtOiAnYnJvdGxpQ29tcHJlc3MnLFxyXG4gICAgICBleHQ6ICcuYnInLFxyXG4gICAgfSksXHJcblxyXG4gICAgdnVldGlmeSh7XHJcbiAgICAgIGF1dG9JbXBvcnQ6IHRydWUsXHJcbiAgICAgIHN0eWxlczoge1xyXG4gICAgICAgIGNvbmZpZ0ZpbGU6ICdzcmMvYXNzZXRzL3N0eWxlcy92YXJpYWJsZXMvX3Z1ZXRpZnkuc2NzcycsXHJcbiAgICAgIH0sXHJcbiAgICB9KSxcclxuICAgIENvbXBvbmVudHMoe1xyXG4gICAgICBkaXJzOiBbJ3NyYy9AdWkvY29tcG9uZW50cycsICdzcmMvY29tcG9uZW50cyddLFxyXG4gICAgICBkdHM6IGZhbHNlLFxyXG4gICAgICByZXNvbHZlcnM6IFtcclxuICAgICAgICBjb21wb25lbnROYW1lID0+IHtcclxuICAgICAgICAgIGlmIChjb21wb25lbnROYW1lID09PSAnVnVlQXBleENoYXJ0cycpIHJldHVybiB7IG5hbWU6ICdkZWZhdWx0JywgZnJvbTogJ3Z1ZTMtYXBleGNoYXJ0cycsIGFzOiAnVnVlQXBleENoYXJ0cycgfTtcclxuICAgICAgICB9LFxyXG4gICAgICBdLFxyXG4gICAgfSksXHJcblxyXG4gICAgQXV0b0ltcG9ydCh7XHJcbiAgICAgIGltcG9ydHM6IFsndnVlJywgJ3Z1ZS1yb3V0ZXInLCAnQHZ1ZXVzZS9jb3JlJywgJ0B2dWV1c2UvbWF0aCcsICdwaW5pYSddLFxyXG4gICAgICB2dWVUZW1wbGF0ZTogdHJ1ZSxcclxuICAgICAgaWdub3JlOiBbJ3VzZUNvb2tpZXMnLCAndXNlU3RvcmFnZSddLFxyXG4gICAgICBlc2xpbnRyYzoge1xyXG4gICAgICAgIGVuYWJsZWQ6IHRydWUsXHJcbiAgICAgICAgZmlsZXBhdGg6ICcuLy5lc2xpbnRyYy1hdXRvLWltcG9ydC5qc29uJyxcclxuICAgICAgfSxcclxuICAgIH0pLFxyXG4gICAgc3ZnTG9hZGVyKCksXHJcbiAgXSxcclxuICBkZWZpbmU6IHtcclxuICAgICdwcm9jZXNzLmVudic6IHt9LFxyXG4gICAgX19WVUVfUFJPRF9IWURSQVRJT05fTUlTTUFUQ0hfREVUQUlMU19fOiAnZmFsc2UnLFxyXG4gICAgX19WVUVfT1BUSU9OU19BUElfXzogJ3RydWUnLFxyXG4gICAgX19WVUVfUFJPRF9ERVZUT09MU19fOiAnZmFsc2UnLFxyXG4gICAgX19BUFBfVkVSU0lPTl9fOiBKU09OLnN0cmluZ2lmeShwYWNrYWdlSnNvbi52ZXJzaW9uKSxcclxuICB9LFxyXG4gIHJlc29sdmU6IHtcclxuICAgIGFsaWFzOiB7XHJcbiAgICAgICdAJzogZmlsZVVSTFRvUGF0aChuZXcgVVJMKCcuL3NyYycsIGltcG9ydC5tZXRhLnVybCkpLFxyXG4gICAgICAnQGNvcmUnOiBmaWxlVVJMVG9QYXRoKG5ldyBVUkwoJy4vc3JjL0Bjb3JlJywgaW1wb3J0Lm1ldGEudXJsKSksXHJcbiAgICAgICdAdWknOiBmaWxlVVJMVG9QYXRoKG5ldyBVUkwoJy4vc3JjL0B1aScsIGltcG9ydC5tZXRhLnVybCkpLFxyXG4gICAgICAnQHV0aWxzJzogZmlsZVVSTFRvUGF0aChuZXcgVVJMKCcuL3NyYy9AdXRpbHMnLCBpbXBvcnQubWV0YS51cmwpKSxcclxuICAgICAgJ0Bjb3JlLXN0eWxlcyc6IGZpbGVVUkxUb1BhdGgobmV3IFVSTCgnLi9zcmMvQGNvcmUtc3R5bGVzJywgaW1wb3J0Lm1ldGEudXJsKSksXHJcbiAgICAgICdAbGF5b3V0cyc6IGZpbGVVUkxUb1BhdGgobmV3IFVSTCgnLi9zcmMvQGxheW91dHMnLCBpbXBvcnQubWV0YS51cmwpKSxcclxuICAgICAgJ0BpbWFnZXMnOiBmaWxlVVJMVG9QYXRoKG5ldyBVUkwoJy4vc3JjL2Fzc2V0cy9pbWFnZXMvJywgaW1wb3J0Lm1ldGEudXJsKSksXHJcbiAgICAgICdAc3R5bGVzJzogZmlsZVVSTFRvUGF0aChuZXcgVVJMKCcuL3NyYy9hc3NldHMvc3R5bGVzLycsIGltcG9ydC5tZXRhLnVybCkpLFxyXG4gICAgICAnQGNvbmZpZ3VyZWQtdmFyaWFibGVzJzogZmlsZVVSTFRvUGF0aChuZXcgVVJMKCcuL3NyYy9hc3NldHMvc3R5bGVzL3ZhcmlhYmxlcy9fdGVtcGxhdGUuc2NzcycsIGltcG9ydC5tZXRhLnVybCkpLFxyXG4gICAgfSxcclxuICB9LFxyXG4gIGJ1aWxkOiB7XHJcbiAgICBjaHVua1NpemVXYXJuaW5nTGltaXQ6IDUwMDAsXHJcbiAgICByb2xsdXBPcHRpb25zOiB7XHJcbiAgICAgIGlucHV0OiB7XHJcbiAgICAgICAgbWFpbjogZmlsZVVSTFRvUGF0aChuZXcgVVJMKCcuL2luZGV4Lmh0bWwnLCBpbXBvcnQubWV0YS51cmwpKSxcclxuICAgICAgICBzYWFzOiBmaWxlVVJMVG9QYXRoKG5ldyBVUkwoJy4vc2Fhcy9pbmRleC5odG1sJywgaW1wb3J0Lm1ldGEudXJsKSksXHJcbiAgICAgICAgc3RvcmU6IGZpbGVVUkxUb1BhdGgobmV3IFVSTCgnLi9zdG9yZS9pbmRleC5odG1sJywgaW1wb3J0Lm1ldGEudXJsKSksXHJcbiAgICAgIH0sXHJcbiAgICAgIG91dHB1dDoge1xyXG4gICAgICAgIG1hbnVhbENodW5rczoge1xyXG4gICAgICAgICAgJ3ZlbmRvci12dWUnOiBbJ3Z1ZScsICd2dWUtcm91dGVyJywgJ3BpbmlhJ10sXHJcbiAgICAgICAgICAndmVuZG9yLXZ1ZXRpZnknOiBbJ3Z1ZXRpZnknXSxcclxuICAgICAgICAgICd2ZW5kb3ItY2hhcnRzJzogWydhcGV4Y2hhcnRzJywgJ3Z1ZTMtYXBleGNoYXJ0cycsICdjaGFydC5qcycsICd2dWUtY2hhcnRqcyddLFxyXG4gICAgICAgICAgJ3ZlbmRvci11dGlscyc6IFsnZGF5anMnLCAnYXhpb3MnLCAnQHZ1ZXVzZS9jb3JlJywgJ0B2dWV1c2UvbWF0aCddLFxyXG4gICAgICAgICAgJ3ZlbmRvci1wcmludCc6IFsnanNiYXJjb2RlJywgJ3FyY29kZS52dWUnLCAnaHRtbDJjYW52YXMnXSxcclxuICAgICAgICB9LFxyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICB9LFxyXG59KTtcclxuIiwgIntcbiAgXCJuYW1lXCI6IFwiaHduaXgtYmlsbFwiLFxuICBcInZlcnNpb25cIjogXCIyLjMuM1wiLFxuICBcInByaXZhdGVcIjogdHJ1ZSxcbiAgXCJ0eXBlXCI6IFwibW9kdWxlXCIsXG4gIFwic2NyaXB0c1wiOiB7XG4gICAgXCJkZXZcIjogXCJ2aXRlXCIsXG4gICAgXCJidWlsZFwiOiBcInZpdGUgYnVpbGRcIixcbiAgICBcInByZXZpZXdcIjogXCJ2aXRlIHByZXZpZXcgLS1wb3J0IDUwNTBcIixcbiAgICBcImxpbnRcIjogXCJlc2xpbnQgLiAtYyAuZXNsaW50cmMuY2pzIC0tZml4IC0tZXh0IC50cywuanMsLmNqcywudnVlLC50c3gsLmpzeFwiLFxuICAgIFwiYnVpbGQ6aWNvbnNcIjogXCJ0c3ggc3JjL3BsdWdpbnMvaWNvbmlmeS9idWlsZC1pY29ucy5qc1wiLFxuICAgIFwicG9zdGluc3RhbGxcIjogXCJucG0gcnVuIGJ1aWxkOmljb25zXCJcbiAgfSxcbiAgXCJkZXBlbmRlbmNpZXNcIjoge1xuICAgIFwiQGZsb2F0aW5nLXVpL2RvbVwiOiBcIjEuNi44XCIsXG4gICAgXCJAaWNvbmlmeS1qc29uL2J4bFwiOiBcIl4xLjEuMTBcIixcbiAgICBcIkB2dWV1c2UvY29yZVwiOiBcIl4xMC41LjBcIixcbiAgICBcIkB2dWV1c2UvbWF0aFwiOiBcIl4xMC41LjBcIixcbiAgICBcIkB6eGluZy9icm93c2VyXCI6IFwiXjAuMS41XCIsXG4gICAgXCJhcGV4Y2hhcnRzXCI6IFwiXjQuMS4wXCIsXG4gICAgXCJheGlvc1wiOiBcIl4xLjcuOFwiLFxuICAgIFwiY2hhcnQuanNcIjogXCJeNC41LjFcIixcbiAgICBcImRheWpzXCI6IFwiXjEuMTEuMTNcIixcbiAgICBcImh0bWwyY2FudmFzXCI6IFwiXjEuNC4xXCIsXG4gICAgXCJqc2JhcmNvZGVcIjogXCJeMy4xMi4zXCIsXG4gICAgXCJqc3BkZlwiOiBcIl40LjEuMFwiLFxuICAgIFwibm90aXdpbmRcIjogXCJeMi4xLjBcIixcbiAgICBcIm9iamVjdC10by1mb3JtZGF0YVwiOiBcIl40LjUuMVwiLFxuICAgIFwicGluaWFcIjogXCJeMi4xLjdcIixcbiAgICBcInByaXNtanNcIjogXCJeMS4yOS4wXCIsXG4gICAgXCJxcmNvZGUudnVlXCI6IFwiXjMuNi4wXCIsXG4gICAgXCJyb2JvdG8tZm9udGZhY2VcIjogXCJeMC4xMC4wXCIsXG4gICAgXCJzYXNzXCI6IFwiMS43Ni4wXCIsXG4gICAgXCJ2dWVcIjogXCJeMy41LjEzXCIsXG4gICAgXCJ2dWUtYWR2YW5jZWQtY3JvcHBlclwiOiBcIl4yLjguOVwiLFxuICAgIFwidnVlLWNoYXJ0anNcIjogXCJeNS4zLjNcIixcbiAgICBcInZ1ZS1mbGF0cGlja3ItY29tcG9uZW50XCI6IFwiMTEuMC41XCIsXG4gICAgXCJ2dWUtcHJpc20tY29tcG9uZW50XCI6IFwiXjIuMC4wXCIsXG4gICAgXCJ2dWUtcm91dGVyXCI6IFwiXjQuMy4wXCIsXG4gICAgXCJ2dWUzLWFwZXhjaGFydHNcIjogXCJeMS44LjBcIixcbiAgICBcInZ1ZTMtYmFyY29kZVwiOiBcIl4xLjAuMVwiLFxuICAgIFwidnVlMy1wZXJmZWN0LXNjcm9sbGJhclwiOiBcIl4yLjAuMFwiLFxuICAgIFwidnVlMy10b2FzdGlmeVwiOiBcIl4wLjIuOFwiLFxuICAgIFwidnVldGlmeVwiOiBcIjMuNi4xM1wiLFxuICAgIFwid2ViZm9udGxvYWRlclwiOiBcIl4xLjYuMjhcIixcbiAgICBcInhsc3hcIjogXCJeMC4xOC41XCJcbiAgfSxcbiAgXCJkZXZEZXBlbmRlbmNpZXNcIjoge1xuICAgIFwiQGFudGZ1L2VzbGludC1jb25maWctdnVlXCI6IFwiXjAuNDMuMVwiLFxuICAgIFwiQGFudGZ1L3V0aWxzXCI6IFwiXjAuNy42XCIsXG4gICAgXCJAaWNvbmlmeS1qc29uL3JpXCI6IFwiXjEuMS4yMVwiLFxuICAgIFwiQGljb25pZnkvdG9vbHNcIjogXCJeNC4wLjBcIixcbiAgICBcIkBpY29uaWZ5L3V0aWxzXCI6IFwiXjIuMS4xM1wiLFxuICAgIFwiQGljb25pZnkvdnVlXCI6IFwiNC4xLjJcIixcbiAgICBcIkB2aXRlanMvcGx1Z2luLXZ1ZVwiOiBcIl41LjAuMlwiLFxuICAgIFwiQHZpdGVqcy9wbHVnaW4tdnVlLWpzeFwiOiBcIl40LjAuMFwiLFxuICAgIFwiZXNsaW50LWNvbmZpZy1haXJibmItYmFzZVwiOiBcIl4xNS4wLjBcIixcbiAgICBcImVzbGludC1pbXBvcnQtcmVzb2x2ZXItdHlwZXNjcmlwdFwiOiBcIl4zLjYuMVwiLFxuICAgIFwiZXNsaW50LXBsdWdpbi1jYXNlLXBvbGljZVwiOiBcIl4wLjYuMVwiLFxuICAgIFwiZXNsaW50LXBsdWdpbi1pbXBvcnRcIjogXCJeMi4yOS4xXCIsXG4gICAgXCJlc2xpbnQtcGx1Z2luLXByb21pc2VcIjogXCJeNi4xLjFcIixcbiAgICBcImVzbGludC1wbHVnaW4tcmVnZXhcIjogXCJeMS4xMC4wXCIsXG4gICAgXCJlc2xpbnQtcGx1Z2luLXJlZ2V4cFwiOiBcIl4yLjYuMFwiLFxuICAgIFwiZXNsaW50LXBsdWdpbi1zb25hcmpzXCI6IFwiXjAuMjQuMFwiLFxuICAgIFwiZXNsaW50LXBsdWdpbi11bmljb3JuXCI6IFwiXjUxLjAuMVwiLFxuICAgIFwiZXNsaW50LXBsdWdpbi12dWVcIjogXCJeOS4xOS4yXCIsXG4gICAgXCJsYXJhdmVsLWVjaG9cIjogXCJeMi4zLjBcIixcbiAgICBcInBvc3Rjc3MtaHRtbFwiOiBcIl4xLjUuMFwiLFxuICAgIFwicG9zdGNzcy1zY3NzXCI6IFwiXjQuMC45XCIsXG4gICAgXCJwdXNoZXItanNcIjogXCJeOC40LjBcIixcbiAgICBcInRzeFwiOiBcIl40LjcuMFwiLFxuICAgIFwidW5wbHVnaW4tYXV0by1pbXBvcnRcIjogXCJeMC4xOC4yXCIsXG4gICAgXCJ1bnBsdWdpbi12dWUtY29tcG9uZW50c1wiOiBcIl4wLjI3LjNcIixcbiAgICBcInZpdGVcIjogXCJeNS4zLjFcIixcbiAgICBcInZpdGUtcGx1Z2luLWNvbXByZXNzaW9uXCI6IFwiXjAuNS4xXCIsXG4gICAgXCJ2aXRlLXBsdWdpbi1wd2FcIjogXCJeMS4yLjBcIixcbiAgICBcInZpdGUtcGx1Z2luLXZ1ZS1sYXlvdXRzXCI6IFwiXjAuMTEuMFwiLFxuICAgIFwidml0ZS1wbHVnaW4tdnVldGlmeVwiOiBcIjIuMC4zXCIsXG4gICAgXCJ2aXRlLXN2Zy1sb2FkZXJcIjogXCJeNS4xLjBcIlxuICB9LFxuICBcInJlc29sdXRpb25zXCI6IHt9XG59XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQXdRLFNBQVMscUJBQXFCO0FBQ3RTLE9BQU8sU0FBUztBQUNoQixPQUFPLFlBQVk7QUFDbkIsT0FBTyxnQkFBZ0I7QUFDdkIsT0FBTyxnQkFBZ0I7QUFDdkIsU0FBUyxvQkFBb0I7QUFDN0IsT0FBTyxhQUFhO0FBQ3BCLE9BQU8sZUFBZTtBQUN0QixPQUFPLHFCQUFxQjtBQUM1QixTQUFTLGVBQWU7OztBQ1R4QjtBQUFBLEVBQ0UsTUFBUTtBQUFBLEVBQ1IsU0FBVztBQUFBLEVBQ1gsU0FBVztBQUFBLEVBQ1gsTUFBUTtBQUFBLEVBQ1IsU0FBVztBQUFBLElBQ1QsS0FBTztBQUFBLElBQ1AsT0FBUztBQUFBLElBQ1QsU0FBVztBQUFBLElBQ1gs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
