// test

import { createApp } from 'vue';
import App from '@/App.vue';
import { registerPlugins } from '@core/utils/plugins';
import { useUserStore } from './stores/user';
import setupAutoSelectOnFocus from './utils/auto-select-on-focus';

// Styles
import '@core/scss/template/index.scss';
import '@layouts/styles/index.scss';

// Initialize print system (register templates)
import '@/modules/print';

// // Create vue app
// const app = createApp(App);
// // Register plugins
// registerPlugins(app);
// // Mount vue app
// app.mount('#app');

(async () => {
  // Create vue app
  const app = createApp(App);

  // Suppress Suspense experimental warning
  app.config.warnHandler = msg => {
    if (msg.includes('Suspense is an experimental feature')) return;
    console.warn(msg);
  };

  await registerPlugins(app);

  //   await getUserApi();

  // Global Error Logging System
  try {
    const logger = (await import('@/utils/logger')).default;
    app.use(logger);
  } catch (e) {
    console.warn('Failed to initialize logger:', e);
  }

  // Draggable Directive
  try {
    const draggable = (await import('@/directives/draggable')).default;
    app.directive('draggable', draggable);
  } catch (e) {
    console.warn('Failed to register draggable directive:', e);
  }

  // Mount vue app
  app.mount('#app');
})();
setupAutoSelectOnFocus(); // 👈 تطبيق السلوك على كامل النظام

async function getUserApi() {
  const userStore = useUserStore();
  await userStore.fetchUser();
}
