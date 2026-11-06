import pinia from '@/plugins/apinia';
import router from '@/plugins/1.router';
import appRouter from '@/router';
import { preloadInitialRoute } from '@/router/prefetch';
import toastify from '@/plugins/toastify';
import { defineAsyncComponent } from 'vue';
import '@/plugins/iconify/icons.css';

export const prepareInitialRoute = () => preloadInitialRoute(appRouter);

// Optional features load from their screens, never from a background glob.
export const registerPlugins = (app, installDesign) => {
  pinia(app);
  installDesign(app);
  router(app);
  toastify(app);
  app.component('apexchart', defineAsyncComponent(() => import('vue3-apexcharts')));
};
