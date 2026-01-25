<template>
  <v-app>
    <router-view />
    <ErrorDialog />
    <CaptureOverlay />

    <!-- Floating Action Button for Manual Reports/Feedback -->
    <v-tooltip location="top">
      <template #activator="{ props: tooltipProps }">
        <v-btn
          v-bind="tooltipProps"
          icon="ri-customer-service-2-line"
          color="error"
          size="large"
          elevation="24"
          class="global-fab-feedback"
          :loading="appState.isCapturing"
          @click="captureAndReport('feedback')"
        />
      </template>
      الدعم الفني والاقتراحات
    </v-tooltip>
  </v-app>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import ErrorDialog from '@/modules/support/components/ErrorDialog.vue';
import CaptureOverlay from '@/modules/capture/components/CaptureOverlay.vue';
import { useLocaleStore } from '@/stores/locale';
import { useUserStore } from '@/stores/user';
import { useNotifications } from '@/plugins/notification';
import { useLocale, useRtl } from 'vuetify';
import { useappState } from '@/stores/appState';

const localeStore = useLocaleStore();
const userStore = useUserStore();
const appState = useappState();
const { requestPermission, setupEchoListeners } = useNotifications();
const { current: currentLocale } = useLocale();
const { isRtl } = useRtl();

const captureAndReport = async (type = 'feedback') => {
  if (appState.isCapturing) return;
  console.log('[App] Starting captureAndReport flow for type:', type);
  const { collectErrorInfo } = await import('@/modules/support/services/error-collector');

  await appState.triggerManualReport(type, (error, context) => {
    console.log('[App] Collector callback triggered');
    return collectErrorInfo(error, {
      ...context,
      onCaptureStart: () => {
        console.log('[App] UI: isCapturing -> true');
        appState.isCapturing = true;
      },
      onCaptureEnd: () => {
        console.log('[App] UI: isCapturing -> false');
        appState.isCapturing = false;
      },
    });
  });
};

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

.global-fab-feedback {
  position: fixed !important;
  bottom: 16px;
  inset-inline-start: 16px;
  z-index: 9999;
  padding: 0 !important;
}
</style>
