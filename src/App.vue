<template>
  <v-app>
    <router-view />
  </v-app>
</template>

<script setup>
import { onMounted, watch } from 'vue';
import { useLocaleStore } from '@/stores/locale';
import { useLocale, useRtl } from 'vuetify';

const localeStore = useLocaleStore();
const { current: currentLocale } = useLocale();
const { isRtl } = useRtl();

// ✅ تطبيق اللغة عند بدء التطبيق
onMounted(() => {
  const locale = localeStore.locale;
  document.documentElement.setAttribute('dir', locale === 'ar' ? 'rtl' : 'ltr');
  document.documentElement.setAttribute('lang', locale);

  // تحديث Vuetify
  currentLocale.value = locale;
  isRtl.value = locale === 'ar';
});

// ✅ مراقبة تغيير اللغة
watch(
  () => localeStore.locale,
  newLocale => {
    document.documentElement.setAttribute('dir', newLocale === 'ar' ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', newLocale);

    // تحديث Vuetify ديناميكياً
    currentLocale.value = newLocale;
    isRtl.value = newLocale === 'ar';

    // إعادة تحميل الصفحة لتطبيق التغييرات بشكل كامل
    window.location.reload();
  }
);
</script>

<style>
* {
  font-family: 'Tajawal', sans-serif;
}
</style>
