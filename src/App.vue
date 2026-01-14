<template>
  <v-app>
    <router-view />
  </v-app>
</template>

<script setup>
import { onMounted, watch } from 'vue';
import { useLocaleStore } from '@/stores/locale';
import { useUserStore } from '@/stores/user';
import { useNotifications } from '@/plugins/notification';
import { useLocale, useRtl } from 'vuetify';

const localeStore = useLocaleStore();
const userStore = useUserStore();
const { requestPermission, setupEchoListeners } = useNotifications();
const { current: currentLocale } = useLocale();
const { isRtl } = useRtl();

// ✅ تطبيق اللغة وإعداد الإشعارات عند بدء التطبيق
onMounted(() => {
  const locale = localeStore.locale;
  document.documentElement.setAttribute('dir', locale === 'ar' ? 'rtl' : 'ltr');
  document.documentElement.setAttribute('lang', locale);

  // تحديث Vuetify
  currentLocale.value = locale;

  // إعداد مستمعي الإشعارات
  if (userStore.currentUser) {
    setupEchoListeners(userStore.currentUser);
    requestPermission();
  }
});

// ✅ مراقبة تسجيل الدخول لإعادة تهيئة المستمعين
watch(
  () => userStore.currentUser,
  newUser => {
    if (newUser) {
      setupEchoListeners(newUser);
      requestPermission();
    }
  }
);

// ✅ مراقبة تغيير اللغة
watch(
  () => localeStore.locale,
  newLocale => {
    document.documentElement.setAttribute('dir', newLocale === 'ar' ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', newLocale);

    // تحديث Vuetify ديناميكياً
    currentLocale.value = newLocale;

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
