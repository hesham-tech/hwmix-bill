import installVuetify from '@/plugins/vuetify';
import '@core-styles/template/index.scss';
import '@layouts/styles/index.scss';
import '@/assets/styles/mobile-app.scss';
import '@fontsource/tajawal/400.css';
import '@fontsource/tajawal/700.css';
import '@fontsource/cairo/400.css';
import '@fontsource/cairo/700.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/700.css';

export const install = installVuetify;
export const loadLayout = () => import('@/layouts/MainLayout.vue');
