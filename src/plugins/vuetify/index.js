import { createVuetify } from 'vuetify';
import { VBtn } from 'vuetify/components/VBtn';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import defaults from './defaults';
import { icons } from './icons';
import { themes } from './theme';

// Styles
import '@core/scss/template/libs/vuetify/index.scss';
import 'vuetify/styles';

// ✅ استيراد اللغات
import { ar, en } from 'vuetify/locale';

export default function (app) {
  // استيراد locale store للحصول على اللغة الحالية
  const getLocale = () => {
    const savedLocale = localStorage.getItem('locale') || 'ar';
    return savedLocale;
  };

  const currentLocale = getLocale();

  const vuetify = createVuetify({
    components,
    directives,
    aliases: {
      IconBtn: VBtn,
    },
    defaults: {
      ...defaults,
      global: {
        ...defaults.global,
        density: 'compact',
      },
    },
    icons,
    theme: {
      defaultTheme: 'light',
      themes,
    },
    locale: {
      locale: currentLocale, // ✅ اللغة الافتراضية من localStorage
      fallback: 'en',
      messages: {
        ar,
        en,
      },
    },
    rtl: currentLocale === 'ar', // ✅ RTL حسب اللغة
  });

  app.use(vuetify);
}
