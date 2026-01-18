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

  // Error Handling
  app.config.errorHandler = (err, instance, info) => {
    console.error('Vue Error:', err, info);
    import('@/utils/error-collector').then(m => {
      m.collectErrorInfo(err, { type: 'vue_error', extraData: { info } }).then(report => {
        import('@/stores/appState').then(s => {
          s.useappState().pendingReport = report;
        });
      });
    });
  };

  window.onerror = (message, source, lineno, colno, error) => {
    if (error) {
      import('@/utils/error-collector').then(m => {
        m.collectErrorInfo(error, { type: 'runtime_error' }).then(report => {
          import('@/stores/appState').then(s => {
            s.useappState().pendingReport = report;
          });
        });
      });
    }
  };

  // Mount vue app
  app.mount('#app');
  console.log('Vue app mounted successfully!');
})();
setupAutoSelectOnFocus(); // 👈 تطبيق السلوك على كامل النظام

async function getUserApi() {
  const userStore = useUserStore();
  await userStore.fetchUser();
}
