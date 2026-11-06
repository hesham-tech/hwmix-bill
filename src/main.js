// Harmless comment to trigger deployment test
import '@/utils/console-guard';
import { createApp } from 'vue';
import { createAppHead } from '@/utils/createAppHead';
import App from '@/App.vue';
import { registerPlugins } from '@utils/helpers/plugins';
import setupAutoSelectOnFocus from './utils/auto-select-on-focus';
import draggable from '@/directives/draggable';

import { loadSelectedDesign } from '@/designs/registry';
import { claimReleaseRecovery } from '@/utils/releaseRecovery';

async function bootstrap() {
const design = await loadSelectedDesign();
// إنشاء تطبيق Vue
const app = createApp(App);
const head = createAppHead();
app.use(head);

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
    // محاولة واحدة لكل إصدار، مع الاحتفاظ بالجلسة ومنع حلقات إعادة التحميل.
    if (claimReleaseRecovery()) {
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
registerPlugins(app, design.install);

// تسجيل الـ directives الضرورية للواجهة الأولية
app.directive('draggable', draggable);

// 2. Mount vue app فوراً لاستبدال الـ Splash Screen بأسرع وقت
app.mount('#app');

if (import.meta.env.PROD) {
  import('virtual:pwa-register').then(({ registerSW }) => {
    const update = registerSW({
      onNeedRefresh() {
        window.dispatchEvent(new CustomEvent('hwnix-update-available', { detail: () => update(true) }));
      },
    });
  });
}

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

}
setupAutoSelectOnFocus(); // 👈 تطبيق السلوك على كامل النظام

}

bootstrap().catch(error => {
  console.error('Application startup failed:', error);
  const root = document.getElementById('app');
  if (root) root.textContent = 'تعذر تحميل الواجهة. يرجى إعادة تحميل الصفحة.';
});
