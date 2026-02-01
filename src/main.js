// test

import { createApp } from 'vue';
import App from '@/App.vue';
import { registerPlugins } from '@core/utils/plugins';
import { useUserStore } from './stores/user';
import setupAutoSelectOnFocus from './utils/auto-select-on-focus';

// Styles
import '@core/scss/template/index.scss';
import '@layouts/styles/index.scss';

// // Create vue app
// const app = createApp(App);
// // Register plugins
// registerPlugins(app);
// // Mount vue app
// app.mount('#app');

(async () => {
  // Create vue app
  const app = createApp(App);

  await registerPlugins(app);

  console.log('Executing pre-mount operations...');
  //   await getUserApi();

  // Global Error Logging System
  try {
    const logger = (await import('@/utils/logger')).default;
    app.use(logger);
    console.log('Error logging system initialized.');
  } catch (e) {
    console.warn('Failed to initialize logger:', e);
  }

  // Draggable Directive
  try {
    const draggable = (await import('@/directives/draggable')).default;
    app.directive('draggable', draggable);
    console.log('Draggable directive registered.');
  } catch (e) {
    console.warn('Failed to register draggable directive:', e);
  }

  // Mount vue app
  app.mount('#app');
  console.log('Vue app mounted successfully!');
})();
setupAutoSelectOnFocus(); // 👈 تطبيق السلوك على كامل النظام

async function getUserApi() {
  const userStore = useUserStore();
  await userStore.fetchUser();
}
