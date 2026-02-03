/**
 * This is helper function to register plugins like a nuxt
 * To register a plugin just export a const function `defineVuePlugin` that takes `app` as argument and call `app.use`
 * For Scanning plugins it will include all files in `src/plugins` and `src/plugins/**\/index.ts`
 *
 *
 * @param {App} app Vue app instance
 * @returns void
 *
 * @example
 * ```ts
 * // File: src/plugins/vuetify/index.ts
 *
 * import type { App } from 'vue'
 * import { createVuetify } from 'vuetify'
 *
 * const vuetify = createVuetify({ ... })
 *
 * export default function (app: App) {
 *   app.use(vuetify)
 * }
 * ```
 *
 * All you have to do is use this helper function in `main.ts` file like below:
 * ```ts
 * // File: src/main.ts
 * import { registerPlugins } from '@utils/helpers/plugins'
 * import { createApp } from 'vue'
 * import App from '@/App.vue'
 *
 * // Create vue app
 * const app = createApp(App)
 *
 * // Register plugins
 * registerPlugins(app) // [!code focus]
 *
 * // Mount vue app
 * app.mount('#app')
 * ```
 */

export const registerPlugins = app => {
  // تحميل فوري للـ plugins الضرورية فقط (router, vuetify, pinia)
  const criticalImports = import.meta.glob(['../../plugins/1.router.js', '../../plugins/vuetify/index.js', '../../plugins/apinia/index.js'], {
    eager: true,
  });

  // تحميل متأخر للـ plugins الأخرى (apexcharts, echo, notiwind, toastify, webfontloader)
  const lazyImports = import.meta.glob(['../../plugins/*.{ts,js}', '../../plugins/*/index.{ts,js}'], { eager: false });

  // تحميل الـ critical plugins فوراً
  const criticalPaths = Object.keys(criticalImports).sort();
  criticalPaths.forEach(path => {
    criticalImports[path].default?.(app);
  });

  // تحميل باقي الـ plugins بشكل متأخر جداً (Idle)
  const loadLazyPlugins = () => {
    const lazyPaths = Object.keys(lazyImports)
      .filter(path => !criticalPaths.includes(path))
      .sort();

    lazyPaths.forEach(async path => {
      try {
        const module = await lazyImports[path]();
        module.default?.(app);
      } catch (error) {
        console.warn(`Failed to load plugin: ${path}`, error);
      }
    });
  };

  if ('requestIdleCallback' in window) {
    requestIdleCallback(loadLazyPlugins);
  } else {
    setTimeout(loadLazyPlugins, 200);
  }
};
