<template>
  <div class="app-share-view-wrapper" :class="{ 'is-capturing': isCapturing }">
    <!-- Target Content Container -->
    <div ref="targetElement" class="share-content-target">
      <slot />
    </div>

    <!-- Share UI Controller -->
    <div v-if="!hideController" class="share-controller mt-4 d-flex justify-center flex-wrap gap-2">
      <slot name="trigger" :capture="handleCapture">
        <v-menu v-model="menu" location="top center" transition="scale-transition" :close-on-content-click="false">
          <template #activator="{ props }">
            <v-btn
              v-bind="props"
              color="primary"
              variant="elevated"
              rounded="pill"
              class="px-6 shadow-lg"
              :loading="isCapturing"
              prepend-icon="ri-share-forward-line"
            >
              مشاركة كصورة
            </v-btn>
          </template>

          <v-card min-width="240" class="rounded-xl mt-2 overflow-hidden border shadow-xl">
            <v-list density="comfortable" class="pa-2">
              <div class="text-caption text-grey px-3 mb-1">خيارات المشاركة</div>

              <v-list-item prepend-icon="ri-download-2-line" title="تحميل بجودة عالية" @click="handleAction('download')" />

              <v-list-item prepend-icon="ri-file-copy-line" title="نسخ للواتساب / الحافظة" @click="handleAction('copy')" />

              <v-list-item v-if="canNativeShare" prepend-icon="ri-share-line" title="مشاركة عبر النظام" @click="handleAction('share')" />
            </v-list>
          </v-card>
        </v-menu>
      </slot>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { captureElement, downloadImage, copyImageToClipboard, shareImage } from '@/utils/capture';
import { toast } from 'vue3-toastify';
import { useappState } from '@/stores/appState';

const appState = useappState();

const props = defineProps({
  /**
   * Base name for the generated file
   */
  fileName: {
    type: String,
    default: 'share-view',
  },
  /**
   * Background color for the generated image
   */
  backgroundColor: {
    type: String,
    default: '#ffffff',
  },
  /**
   * Hide the default share button/controller
   */
  hideController: {
    type: Boolean,
    default: false,
  },
});

const targetElement = ref(null);
const isCapturing = ref(false);
const menu = ref(false);

const canNativeShare = computed(() => !!navigator.share);

const handleAction = async action => {
  menu.value = false;
  await handleCapture(action);
};

const handleCapture = async (action = 'download') => {
  if (!targetElement.value || isCapturing.value) return;

  appState.isCapturing = true;
  appState.captureMessage = 'جاري تحويل العرض إلى صورة...';
  isCapturing.value = true;

  // Wait for global overlay to render and DOM to stabilize
  await new Promise(resolve => setTimeout(resolve, 800));

  try {
    const fileName = `${props.fileName}-${new Date().getTime()}.png`;

    if (action === 'download') {
      const dataUrl = await captureElement(targetElement.value, {
        format: 'png',
        backgroundColor: props.backgroundColor,
      });
      downloadImage(dataUrl, fileName);
      toast.success('تم تحميل الصورة بنجاح');
    } else if (action === 'copy' || action === 'share') {
      const blob = await captureElement(targetElement.value, {
        format: 'blob',
        backgroundColor: props.backgroundColor,
      });

      if (action === 'copy') {
        const success = await copyImageToClipboard(blob);
        if (success) toast.success('تم نسخ الصورة للحافظة');
        else toast.error('فشل نسخ الصورة، يرجى التحميل بدلاً من ذلك');
      } else if (action === 'share') {
        const success = await shareImage(blob, fileName);
        if (success) toast.success('تمت المشاركة بنجاح');
      }
    }
  } catch (error) {
    console.error('AppShareView Capture Failed:', error);
    toast.error('حدث خطأ أثناء معالجة الصورة');
  } finally {
    appState.isCapturing = false;
    isCapturing.value = false;
  }
};

defineExpose({
  capture: handleCapture,
});
</script>

<style>
/* Global styles for teleported overlay */
.native-capture-overlay {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
  background: rgba(0, 0, 0, 0.85) !important;
  backdrop-filter: blur(10px) !important;
  -webkit-backdrop-filter: blur(10px) !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  z-index: 1000000 !important;
  direction: rtl;
}

.capture-card {
  text-align: center !important;
  color: #ffffff !important;
  padding: 60px !important;
  background: #111111 !important; /* خلفية سوداء صلبة */
  border-radius: 40px !important;
  border: 2px solid #333333 !important;
  box-shadow: 0 0 100px rgba(0, 0, 0, 0.9) !important;
  max-width: 90% !important;
  display: block !important;
}

.capture-text-wrapper {
  display: block !important;
}

.capture-spinner {
  width: 100px;
  height: 100px;
  border: 10px solid rgba(255, 255, 255, 0.05);
  border-top: 10px solid #2196f3;
  border-radius: 50%;
  margin: 0 auto 40px;
  animation: capture-spin 1s linear infinite;
  display: block !important;
}

@keyframes capture-spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.capture-title {
  font-size: 2.5rem !important;
  font-weight: 900 !important;
  margin-bottom: 15px !important;
  color: #ffffff !important;
  display: block !important;
}

.capture-subtitle {
  font-size: 1.4rem !important;
  color: #aaaaaa !important;
  display: block !important;
}
</style>

<style scoped>
.app-share-view-wrapper {
  position: relative;
  width: 100%;
}

.share-content-target {
  transition: transform 0.3s ease;
  border-radius: inherit;
}

.is-capturing .share-content-target {
  /* Subtle visual cue during capture */
  filter: brightness(1.02);
}

.glass-text {
  text-shadow: 0 2px 10px rgba(var(--v-theme-primary), 0.2);
}

.shadow-lg {
  box-shadow:
    0 10px 25px -5px rgba(0, 0, 0, 0.1),
    0 8px 10px -6px rgba(0, 0, 0, 0.1) !important;
}

.shadow-xl {
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
}
</style>
