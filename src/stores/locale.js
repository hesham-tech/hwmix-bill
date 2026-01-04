import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useLocaleStore = defineStore('locale', () => {
  // اللغة المحفوظة أو الافتراضية (العربية)
  const locale = ref(localStorage.getItem('locale') || 'ar');

  // RTL حسب اللغة
  const isRTL = computed(() => locale.value === 'ar');

  // تغيير اللغة
  const setLocale = newLocale => {
    locale.value = newLocale;
    localStorage.setItem('locale', newLocale);

    // تحديث HTML attributes
    document.documentElement.setAttribute('dir', newLocale === 'ar' ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', newLocale);
  };

  // تبديل اللغة
  const toggleLocale = () => {
    setLocale(locale.value === 'ar' ? 'en' : 'ar');
  };

  // Labels للغات
  const locales = {
    ar: { name: 'العربية', dir: 'rtl' },
    en: { name: 'English', dir: 'ltr' },
  };

  return {
    locale,
    isRTL,
    setLocale,
    toggleLocale,
    locales,
  };
});
