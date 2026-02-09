import { createVuetify } from 'vuetify';
import { VBtn } from 'vuetify/components/VBtn';
// Auto-import enabled in vite.config.js - no need to import all components
import defaults from './defaults';
import { icons } from './icons';
import { themes } from './theme';

// Styles
import '@core-styles/template/libs/vuetify/index.scss';
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
  localStorage.setItem('theme', 'light'); // فرض الثيم الفاتح

  const vuetify = createVuetify({
    // Auto-import handles components and directives automatically
    aliases: {
      IconBtn: VBtn,
    },
    defaults,
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
