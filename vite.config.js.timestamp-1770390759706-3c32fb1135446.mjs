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
var __vite_injected_original_import_meta_url = "file:///D:/Dev/projects/hwnix-bill/vite.config.js";
var vite_config_default = defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    // PWA Configuration
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "robots.txt", "manifest.json"],
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
          }
        ]
      },
      workbox: {
        // Only pre-cache essential "App Shell" assets to avoid huge request waterfalls
        globPatterns: ["index.html", "assets/main-*.js", "assets/index-*.js", "assets/*.css", "**/*.{ico,png,svg}"],
        // Exclude large or non-essential chunks from pre-caching
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
                // < 1 year
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
    // Docs: https://github.com/vuetifyjs/vuetify-loader/tree/master/packages/vite-plugin
    vuetify({
      autoImport: true,
      // Enable auto-import for better tree-shaking
      styles: {
        configFile: "src/assets/styles/variables/_vuetify.scss"
      },
      defaults: {
        VTextField: {
          hideDetails: "auto"
        },
        VSelect: {
          hideDetails: "auto"
        },
        VTextarea: {
          hideDetails: "auto"
        }
      }
    }),
    Components({
      dirs: ["src/@ui/components", "src/components"],
      dts: true,
      resolvers: [
        (componentName) => {
          if (componentName === "VueApexCharts") return { name: "default", from: "vue3-apexcharts", as: "VueApexCharts" };
        }
      ]
    }),
    // Docs: https://github.com/antfu/unplugin-auto-import#unplugin-auto-import
    AutoImport({
      imports: ["vue", "vue-router", "@vueuse/core", "@vueuse/math", "pinia"],
      vueTemplate: true,
      // ℹ️ Disabled to avoid confusion & accidental usage
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
    // Vue feature flags - suppress warnings
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: "false",
    __VUE_OPTIONS_API__: "true",
    __VUE_PROD_DEVTOOLS__: "false"
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
  server: {
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
        secure: false
      },
      "/storage": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    chunkSizeWarningLimit: 5e3,
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
          "vendor-vue": ["vue", "vue-router", "pinia"],
          // Vuetify
          "vendor-vuetify": ["vuetify"],
          // Charts libraries
          "vendor-charts": ["apexcharts", "vue3-apexcharts", "chart.js", "vue-chartjs"],
          // Utility libraries
          "vendor-utils": ["dayjs", "axios", "@vueuse/core", "@vueuse/math"],
          // Print/image related
          "vendor-print": ["jsbarcode", "qrcode.vue", "html2canvas"]
        }
      }
    }
  },
  optimizeDeps: {
    entries: ["./src/**/*.vue"],
    include: ["vue", "vue-router", "pinia", "vuetify", "axios", "dayjs", "@vueuse/core"],
    exclude: ["chart.js", "html2canvas"]
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxEZXZcXFxccHJvamVjdHNcXFxcaHduaXgtYmlsbFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRDpcXFxcRGV2XFxcXHByb2plY3RzXFxcXGh3bml4LWJpbGxcXFxcdml0ZS5jb25maWcuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Q6L0Rldi9wcm9qZWN0cy9od25peC1iaWxsL3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHsgZmlsZVVSTFRvUGF0aCB9IGZyb20gJ25vZGU6dXJsJztcclxuaW1wb3J0IHZ1ZSBmcm9tICdAdml0ZWpzL3BsdWdpbi12dWUnO1xyXG5pbXBvcnQgdnVlSnN4IGZyb20gJ0B2aXRlanMvcGx1Z2luLXZ1ZS1qc3gnO1xyXG5pbXBvcnQgQXV0b0ltcG9ydCBmcm9tICd1bnBsdWdpbi1hdXRvLWltcG9ydC92aXRlJztcclxuaW1wb3J0IENvbXBvbmVudHMgZnJvbSAndW5wbHVnaW4tdnVlLWNvbXBvbmVudHMvdml0ZSc7XHJcbmltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gJ3ZpdGUnO1xyXG5pbXBvcnQgdnVldGlmeSBmcm9tICd2aXRlLXBsdWdpbi12dWV0aWZ5JztcclxuaW1wb3J0IHN2Z0xvYWRlciBmcm9tICd2aXRlLXN2Zy1sb2FkZXInO1xyXG5pbXBvcnQgdml0ZUNvbXByZXNzaW9uIGZyb20gJ3ZpdGUtcGx1Z2luLWNvbXByZXNzaW9uJztcclxuaW1wb3J0IHsgVml0ZVBXQSB9IGZyb20gJ3ZpdGUtcGx1Z2luLXB3YSc7XHJcblxyXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xyXG4gIHBsdWdpbnM6IFtcclxuICAgIHZ1ZSgpLFxyXG4gICAgdnVlSnN4KCksXHJcblxyXG4gICAgLy8gUFdBIENvbmZpZ3VyYXRpb25cclxuICAgIFZpdGVQV0Eoe1xyXG4gICAgICByZWdpc3RlclR5cGU6ICdhdXRvVXBkYXRlJyxcclxuICAgICAgaW5jbHVkZUFzc2V0czogWydmYXZpY29uLmljbycsICdyb2JvdHMudHh0JywgJ21hbmlmZXN0Lmpzb24nXSxcclxuICAgICAgbWFuaWZlc3Q6IHtcclxuICAgICAgICBuYW1lOiAnSFdOaXggQmlsbCcsXHJcbiAgICAgICAgc2hvcnRfbmFtZTogJ0hXTml4JyxcclxuICAgICAgICBkZXNjcmlwdGlvbjogJ0hXTml4IEJpbGwgLSBQcm9mZXNzaW9uYWwgQmlsbGluZyBTeXN0ZW0nLFxyXG4gICAgICAgIHRoZW1lX2NvbG9yOiAnIzYyMDBlZScsXHJcbiAgICAgICAgaWNvbnM6IFtcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgc3JjOiAnZmF2aWNvbi5pY28nLFxyXG4gICAgICAgICAgICBzaXplczogJzY0eDY0IDMyeDMyIDI0eDI0IDE2eDE2JyxcclxuICAgICAgICAgICAgdHlwZTogJ2ltYWdlL3gtaWNvbicsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIF0sXHJcbiAgICAgIH0sXHJcbiAgICAgIHdvcmtib3g6IHtcclxuICAgICAgICAvLyBPbmx5IHByZS1jYWNoZSBlc3NlbnRpYWwgXCJBcHAgU2hlbGxcIiBhc3NldHMgdG8gYXZvaWQgaHVnZSByZXF1ZXN0IHdhdGVyZmFsbHNcclxuICAgICAgICBnbG9iUGF0dGVybnM6IFsnaW5kZXguaHRtbCcsICdhc3NldHMvbWFpbi0qLmpzJywgJ2Fzc2V0cy9pbmRleC0qLmpzJywgJ2Fzc2V0cy8qLmNzcycsICcqKi8qLntpY28scG5nLHN2Z30nXSxcclxuICAgICAgICAvLyBFeGNsdWRlIGxhcmdlIG9yIG5vbi1lc3NlbnRpYWwgY2h1bmtzIGZyb20gcHJlLWNhY2hpbmdcclxuICAgICAgICBnbG9iSWdub3JlczogWycqKi92ZW5kb3ItKi5qcycsICcqKi9EYXNoYm9hcmQtKi5qcycsICcqKi9JbnZvaWNlTGlzdC0qLmpzJ10sXHJcbiAgICAgICAgcnVudGltZUNhY2hpbmc6IFtcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgdXJsUGF0dGVybjogL15odHRwczpcXC9cXC9mb250c1xcLmdvb2dsZWFwaXNcXC5jb21cXC8uKi9pLFxyXG4gICAgICAgICAgICBoYW5kbGVyOiAnQ2FjaGVGaXJzdCcsXHJcbiAgICAgICAgICAgIG9wdGlvbnM6IHtcclxuICAgICAgICAgICAgICBjYWNoZU5hbWU6ICdnb29nbGUtZm9udHMtY2FjaGUnLFxyXG4gICAgICAgICAgICAgIGV4cGlyYXRpb246IHtcclxuICAgICAgICAgICAgICAgIG1heEVudHJpZXM6IDEwLFxyXG4gICAgICAgICAgICAgICAgbWF4QWdlU2Vjb25kczogNjAgKiA2MCAqIDI0ICogMzY1LCAvLyA8IDEgeWVhclxyXG4gICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgY2FjaGVhYmxlUmVzcG9uc2U6IHtcclxuICAgICAgICAgICAgICAgIHN0YXR1c2VzOiBbMCwgMjAwXSxcclxuICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICBdLFxyXG4gICAgICB9LFxyXG4gICAgfSksXHJcblxyXG4gICAgLy8gR3ppcCBDb21wcmVzc2lvblxyXG4gICAgdml0ZUNvbXByZXNzaW9uKHtcclxuICAgICAgYWxnb3JpdGhtOiAnZ3ppcCcsXHJcbiAgICAgIGV4dDogJy5neicsXHJcbiAgICB9KSxcclxuXHJcbiAgICAvLyBCcm90bGkgQ29tcHJlc3Npb25cclxuICAgIHZpdGVDb21wcmVzc2lvbih7XHJcbiAgICAgIGFsZ29yaXRobTogJ2Jyb3RsaUNvbXByZXNzJyxcclxuICAgICAgZXh0OiAnLmJyJyxcclxuICAgIH0pLFxyXG5cclxuICAgIC8vIERvY3M6IGh0dHBzOi8vZ2l0aHViLmNvbS92dWV0aWZ5anMvdnVldGlmeS1sb2FkZXIvdHJlZS9tYXN0ZXIvcGFja2FnZXMvdml0ZS1wbHVnaW5cclxuICAgIHZ1ZXRpZnkoe1xyXG4gICAgICBhdXRvSW1wb3J0OiB0cnVlLCAvLyBFbmFibGUgYXV0by1pbXBvcnQgZm9yIGJldHRlciB0cmVlLXNoYWtpbmdcclxuICAgICAgc3R5bGVzOiB7XHJcbiAgICAgICAgY29uZmlnRmlsZTogJ3NyYy9hc3NldHMvc3R5bGVzL3ZhcmlhYmxlcy9fdnVldGlmeS5zY3NzJyxcclxuICAgICAgfSxcclxuICAgICAgZGVmYXVsdHM6IHtcclxuICAgICAgICBWVGV4dEZpZWxkOiB7XHJcbiAgICAgICAgICBoaWRlRGV0YWlsczogJ2F1dG8nLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgVlNlbGVjdDoge1xyXG4gICAgICAgICAgaGlkZURldGFpbHM6ICdhdXRvJyxcclxuICAgICAgICB9LFxyXG4gICAgICAgIFZUZXh0YXJlYToge1xyXG4gICAgICAgICAgaGlkZURldGFpbHM6ICdhdXRvJyxcclxuICAgICAgICB9LFxyXG4gICAgICB9LFxyXG4gICAgfSksXHJcbiAgICBDb21wb25lbnRzKHtcclxuICAgICAgZGlyczogWydzcmMvQHVpL2NvbXBvbmVudHMnLCAnc3JjL2NvbXBvbmVudHMnXSxcclxuICAgICAgZHRzOiB0cnVlLFxyXG4gICAgICByZXNvbHZlcnM6IFtcclxuICAgICAgICBjb21wb25lbnROYW1lID0+IHtcclxuICAgICAgICAgIC8vIEF1dG8gaW1wb3J0IGBWdWVBcGV4Q2hhcnRzYFxyXG4gICAgICAgICAgaWYgKGNvbXBvbmVudE5hbWUgPT09ICdWdWVBcGV4Q2hhcnRzJykgcmV0dXJuIHsgbmFtZTogJ2RlZmF1bHQnLCBmcm9tOiAndnVlMy1hcGV4Y2hhcnRzJywgYXM6ICdWdWVBcGV4Q2hhcnRzJyB9O1xyXG4gICAgICAgIH0sXHJcbiAgICAgIF0sXHJcbiAgICB9KSxcclxuXHJcbiAgICAvLyBEb2NzOiBodHRwczovL2dpdGh1Yi5jb20vYW50ZnUvdW5wbHVnaW4tYXV0by1pbXBvcnQjdW5wbHVnaW4tYXV0by1pbXBvcnRcclxuICAgIEF1dG9JbXBvcnQoe1xyXG4gICAgICBpbXBvcnRzOiBbJ3Z1ZScsICd2dWUtcm91dGVyJywgJ0B2dWV1c2UvY29yZScsICdAdnVldXNlL21hdGgnLCAncGluaWEnXSxcclxuICAgICAgdnVlVGVtcGxhdGU6IHRydWUsXHJcblxyXG4gICAgICAvLyBcdTIxMzlcdUZFMEYgRGlzYWJsZWQgdG8gYXZvaWQgY29uZnVzaW9uICYgYWNjaWRlbnRhbCB1c2FnZVxyXG4gICAgICBpZ25vcmU6IFsndXNlQ29va2llcycsICd1c2VTdG9yYWdlJ10sXHJcbiAgICAgIGVzbGludHJjOiB7XHJcbiAgICAgICAgZW5hYmxlZDogdHJ1ZSxcclxuICAgICAgICBmaWxlcGF0aDogJy4vLmVzbGludHJjLWF1dG8taW1wb3J0Lmpzb24nLFxyXG4gICAgICB9LFxyXG4gICAgfSksXHJcbiAgICBzdmdMb2FkZXIoKSxcclxuICBdLFxyXG4gIGRlZmluZToge1xyXG4gICAgJ3Byb2Nlc3MuZW52Jzoge30sXHJcbiAgICAvLyBWdWUgZmVhdHVyZSBmbGFncyAtIHN1cHByZXNzIHdhcm5pbmdzXHJcbiAgICBfX1ZVRV9QUk9EX0hZRFJBVElPTl9NSVNNQVRDSF9ERVRBSUxTX186ICdmYWxzZScsXHJcbiAgICBfX1ZVRV9PUFRJT05TX0FQSV9fOiAndHJ1ZScsXHJcbiAgICBfX1ZVRV9QUk9EX0RFVlRPT0xTX186ICdmYWxzZScsXHJcbiAgfSxcclxuICByZXNvbHZlOiB7XHJcbiAgICBhbGlhczoge1xyXG4gICAgICAnQCc6IGZpbGVVUkxUb1BhdGgobmV3IFVSTCgnLi9zcmMnLCBpbXBvcnQubWV0YS51cmwpKSxcclxuICAgICAgJ0Bjb3JlJzogZmlsZVVSTFRvUGF0aChuZXcgVVJMKCcuL3NyYy9AY29yZScsIGltcG9ydC5tZXRhLnVybCkpLFxyXG4gICAgICAnQHVpJzogZmlsZVVSTFRvUGF0aChuZXcgVVJMKCcuL3NyYy9AdWknLCBpbXBvcnQubWV0YS51cmwpKSxcclxuICAgICAgJ0B1dGlscyc6IGZpbGVVUkxUb1BhdGgobmV3IFVSTCgnLi9zcmMvQHV0aWxzJywgaW1wb3J0Lm1ldGEudXJsKSksXHJcbiAgICAgICdAY29yZS1zdHlsZXMnOiBmaWxlVVJMVG9QYXRoKG5ldyBVUkwoJy4vc3JjL0Bjb3JlLXN0eWxlcycsIGltcG9ydC5tZXRhLnVybCkpLFxyXG4gICAgICAnQGxheW91dHMnOiBmaWxlVVJMVG9QYXRoKG5ldyBVUkwoJy4vc3JjL0BsYXlvdXRzJywgaW1wb3J0Lm1ldGEudXJsKSksXHJcbiAgICAgICdAaW1hZ2VzJzogZmlsZVVSTFRvUGF0aChuZXcgVVJMKCcuL3NyYy9hc3NldHMvaW1hZ2VzLycsIGltcG9ydC5tZXRhLnVybCkpLFxyXG4gICAgICAnQHN0eWxlcyc6IGZpbGVVUkxUb1BhdGgobmV3IFVSTCgnLi9zcmMvYXNzZXRzL3N0eWxlcy8nLCBpbXBvcnQubWV0YS51cmwpKSxcclxuICAgICAgJ0Bjb25maWd1cmVkLXZhcmlhYmxlcyc6IGZpbGVVUkxUb1BhdGgobmV3IFVSTCgnLi9zcmMvYXNzZXRzL3N0eWxlcy92YXJpYWJsZXMvX3RlbXBsYXRlLnNjc3MnLCBpbXBvcnQubWV0YS51cmwpKSxcclxuICAgIH0sXHJcbiAgfSxcclxuICBzZXJ2ZXI6IHtcclxuICAgIHByb3h5OiB7XHJcbiAgICAgICcvYXBpJzoge1xyXG4gICAgICAgIHRhcmdldDogJ2h0dHA6Ly8xMjcuMC4wLjE6ODAwMCcsXHJcbiAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxyXG4gICAgICAgIHNlY3VyZTogZmFsc2UsXHJcbiAgICAgIH0sXHJcbiAgICAgICcvc3RvcmFnZSc6IHtcclxuICAgICAgICB0YXJnZXQ6ICdodHRwOi8vMTI3LjAuMC4xOjgwMDAnLFxyXG4gICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcclxuICAgICAgICBzZWN1cmU6IGZhbHNlLFxyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICB9LFxyXG4gIGJ1aWxkOiB7XHJcbiAgICBjaHVua1NpemVXYXJuaW5nTGltaXQ6IDUwMDAsXHJcbiAgICAvLyBDU1MgQ29kZSBTcGxpdHRpbmdcclxuICAgIGNzc0NvZGVTcGxpdDogdHJ1ZSxcclxuICAgIC8vIFRlcnNlciBtaW5pZmljYXRpb24gZGlzYWJsZWQgdGVtcG9yYXJpbHkgZHVlIHRvIGJ1aWxkIGlzc3Vlc1xyXG4gICAgLy8gV2lsbCB1c2UgZGVmYXVsdCBlc2J1aWxkIG1pbmlmaWNhdGlvblxyXG4gICAgLy8gbWluaWZ5OiAndGVyc2VyJyxcclxuICAgIC8vIHRlcnNlck9wdGlvbnM6IHtcclxuICAgIC8vICAgY29tcHJlc3M6IHtcclxuICAgIC8vICAgICBkcm9wX2NvbnNvbGU6IHRydWUsXHJcbiAgICAvLyAgICAgZHJvcF9kZWJ1Z2dlcjogdHJ1ZSxcclxuICAgIC8vICAgfSxcclxuICAgIC8vIH0sXHJcbiAgICAvLyBNYW51YWwgY2h1bmtzIGZvciBiZXR0ZXIgY29kZSBzcGxpdHRpbmdcclxuICAgIHJvbGx1cE9wdGlvbnM6IHtcclxuICAgICAgb3V0cHV0OiB7XHJcbiAgICAgICAgbWFudWFsQ2h1bmtzOiB7XHJcbiAgICAgICAgICAvLyBWdWUgY29yZSBsaWJyYXJpZXNcclxuICAgICAgICAgICd2ZW5kb3ItdnVlJzogWyd2dWUnLCAndnVlLXJvdXRlcicsICdwaW5pYSddLFxyXG4gICAgICAgICAgLy8gVnVldGlmeVxyXG4gICAgICAgICAgJ3ZlbmRvci12dWV0aWZ5JzogWyd2dWV0aWZ5J10sXHJcbiAgICAgICAgICAvLyBDaGFydHMgbGlicmFyaWVzXHJcbiAgICAgICAgICAndmVuZG9yLWNoYXJ0cyc6IFsnYXBleGNoYXJ0cycsICd2dWUzLWFwZXhjaGFydHMnLCAnY2hhcnQuanMnLCAndnVlLWNoYXJ0anMnXSxcclxuICAgICAgICAgIC8vIFV0aWxpdHkgbGlicmFyaWVzXHJcbiAgICAgICAgICAndmVuZG9yLXV0aWxzJzogWydkYXlqcycsICdheGlvcycsICdAdnVldXNlL2NvcmUnLCAnQHZ1ZXVzZS9tYXRoJ10sXHJcbiAgICAgICAgICAvLyBQcmludC9pbWFnZSByZWxhdGVkXHJcbiAgICAgICAgICAndmVuZG9yLXByaW50JzogWydqc2JhcmNvZGUnLCAncXJjb2RlLnZ1ZScsICdodG1sMmNhbnZhcyddLFxyXG4gICAgICAgIH0sXHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIH0sXHJcbiAgb3B0aW1pemVEZXBzOiB7XHJcbiAgICBlbnRyaWVzOiBbJy4vc3JjLyoqLyoudnVlJ10sXHJcbiAgICBpbmNsdWRlOiBbJ3Z1ZScsICd2dWUtcm91dGVyJywgJ3BpbmlhJywgJ3Z1ZXRpZnknLCAnYXhpb3MnLCAnZGF5anMnLCAnQHZ1ZXVzZS9jb3JlJ10sXHJcbiAgICBleGNsdWRlOiBbJ2NoYXJ0LmpzJywgJ2h0bWwyY2FudmFzJ10sXHJcbiAgfSxcclxufSk7XHJcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBd1EsU0FBUyxxQkFBcUI7QUFDdFMsT0FBTyxTQUFTO0FBQ2hCLE9BQU8sWUFBWTtBQUNuQixPQUFPLGdCQUFnQjtBQUN2QixPQUFPLGdCQUFnQjtBQUN2QixTQUFTLG9CQUFvQjtBQUM3QixPQUFPLGFBQWE7QUFDcEIsT0FBTyxlQUFlO0FBQ3RCLE9BQU8scUJBQXFCO0FBQzVCLFNBQVMsZUFBZTtBQVQySSxJQUFNLDJDQUEyQztBQVlwTixJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTO0FBQUEsSUFDUCxJQUFJO0FBQUEsSUFDSixPQUFPO0FBQUE7QUFBQSxJQUdQLFFBQVE7QUFBQSxNQUNOLGNBQWM7QUFBQSxNQUNkLGVBQWUsQ0FBQyxlQUFlLGNBQWMsZUFBZTtBQUFBLE1BQzVELFVBQVU7QUFBQSxRQUNSLE1BQU07QUFBQSxRQUNOLFlBQVk7QUFBQSxRQUNaLGFBQWE7QUFBQSxRQUNiLGFBQWE7QUFBQSxRQUNiLE9BQU87QUFBQSxVQUNMO0FBQUEsWUFDRSxLQUFLO0FBQUEsWUFDTCxPQUFPO0FBQUEsWUFDUCxNQUFNO0FBQUEs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
