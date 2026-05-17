import { createApp } from 'vue';
import App from '@/App.vue';
import { registerPlugins } from '@utils/helpers/plugins';
import { useUserStore } from './stores/user';
import setupAutoSelectOnFocus from './utils/auto-select-on-focus';
import draggable from '@/directives/draggable';

// Styles
import '@core-styles/template/index.scss';
import '@layouts/styles/index.scss';

// إنشاء تطبيق Vue
const app = createApp(App);

// كتم تحذيرات Suspense التجريبية
app.config.warnHandler = (msg, vm, trace) => {
  if (msg.includes('Suspense is an experimental feature')) return;
  console.warn(msg, trace);
};

// معالج أخطاء النظام الشامل (Error Sentinel)
const handleGlobalError = error => {
  const errorMessage = error?.message || error?.toString() || '';

  // 1. كتم خطأ ResizeObserver المزعج
  if (errorMessage.includes('ResizeObserver loop completed with undelivered notifications.')) {
    return true;
  }

  // 2. معالجة فشل تحميل الملفات (Chunk Load Error)
  // يحدث هذا عند تحديث النظام ووجود ملفات قديمة في كاش المتصفح
  const chunkFailedWords = ['Failed to fetch dynamically imported module', 'Loading chunk', 'MIME type of "text/html"'];
  const isChunkError = chunkFailedWords.some(word => errorMessage.includes(word));

  if (isChunkError) {
    const lastReload = sessionStorage.getItem('last-chunk-reload');
    const now = Date.now();

    // منع حلقة إعادة تحميل لانهائية (لا نكرر العملية إلا بعد 10 ثواني على الأقل)
    if (!lastReload || now - parseInt(lastReload) > 10000) {
      sessionStorage.setItem('last-chunk-reload', now.toString());
      console.warn('Chunk loading failed! Auto-reloading to fetch latest version...', errorMessage);
      window.location.reload();
    }
  }
  return false;
};

window.addEventListener('error', e => {
  if (handleGlobalError(e)) {
    e.stopImmediatePropagation();
  }
});

window.addEventListener('unhandledrejection', e => {
  if (handleGlobalError(e.reason)) {
    e.stopImmediatePropagation();
  }
});

// 1. التسجيل المتزامن للـ plugins الأساسية (Vuetify, Pinia, Router)
// هذا ضروري قبل الـ mount لأن المكونات تعتمد عليها
registerPlugins(app);

// تسجيل الـ directives الضرورية للواجهة الأولية
app.directive('draggable', draggable);

// 2. Mount vue app فوراً لاستبدال الـ Splash Screen بأسرع وقت
app.mount('#app');

// 3. تحميل المزايا والـ Directives غير الحرجة في الخلفية
// نستخدم requestIdleCallback لضمان استقرار الواجهة أولاً
if ('requestIdleCallback' in window) {
  requestIdleCallback(async () => {
    initializeSecondaryFeatures(app);
  });
} else {
  setTimeout(() => {
    initializeSecondaryFeatures(app);
  }, 100);
}

// دالة لمعالجة المزايا الثانوية بعد التحميل
async function initializeSecondaryFeatures(appInstance) {
  // Global Error Logging System
  import('@/utils/logger')
    .then(({ default: logger }) => {
      appInstance.use(logger);
    })
    .catch(e => console.warn('Failed to initialize logger:', e));

  // Initialize print system
  import('@/modules/print').catch(e => {
    console.warn('Failed to initialize print system:', e);
  });

  // Prefetch common routes
  import('@/router/prefetch')
    .then(({ prefetchCommonRoutes }) => {
      prefetchCommonRoutes();
    })
    .catch(e => console.warn('Failed to initialize route prefetching:', e));
}
setupAutoSelectOnFocus(); // 👈 تطبيق السلوك على كامل النظام

async function getUserApi() {
  const userStore = useUserStore();
  await userStore.fetchUser();
}
