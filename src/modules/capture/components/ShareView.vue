<script setup>
import { ref, computed } from 'vue';
import { captureElement, downloadImage, copyImageToClipboard, shareImage } from '../utils/capture';
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
   * Image quality (0 to 1)
   */
  quality: {
    type: Number,
    default: 0.95,
  },
  /**
   * Resolution multiplier (1 to 3)
   */
  pixelRatio: {
    type: Number,
    default: 2,
  },
  /**
   * Positioning offsets for the floating button
   */
  top: { type: String, default: null },
  bottom: { type: String, default: '0px' },
  left: { type: String, default: '0px' },
  right: { type: String, default: null },
  /**
   * Whether the trigger should be absolute within wrapper
   */
  absolute: {
    type: Boolean,
    default: true,
  },
});

const targetElement = ref(null);
const isCapturing = ref(false);
const showPreview = ref(false);
const capturedImageUrl = ref(null);
const capturedBlob = ref(null);

const canNativeShare = computed(() => !!navigator.share);

const triggerStyle = computed(() => {
  if (!props.absolute) return {};
  return {
    position: 'absolute',
    top: props.top,
    bottom: props.bottom,
    left: props.left,
    right: props.right,
    zIndex: 10,
  };
});

const handleCapture = async () => {
  if (!targetElement.value || isCapturing.value) return;

  appState.isCapturing = true;
  appState.captureMessage = 'جاري تجهيز الصورة للمعاينة...';
  isCapturing.value = true;

  // Wait for global overlay to render and DOM to stabilize
  await new Promise(resolve => setTimeout(resolve, 100));

  try {
    const blob = await captureElement(targetElement.value, {
      format: 'blob',
      backgroundColor: props.backgroundColor,
      quality: props.quality,
      pixelRatio: props.pixelRatio,
    });

    capturedBlob.value = blob;
    capturedImageUrl.value = URL.createObjectURL(blob);
    showPreview.value = true;
  } catch (error) {
    console.error('AppShareView Capture Failed:', error);
    toast.error('حدث خطأ أثناء معالجة الصورة');
  } finally {
    appState.isCapturing = false;
    isCapturing.value = false;
  }
};

const handleDownload = () => {
  if (!capturedImageUrl.value) return;
  const fileName = `${props.fileName}-${Date.now()}.png`;
  downloadImage(capturedImageUrl.value, fileName);
  toast.success('تم تحميل الصورة');
};

const handleCopy = async () => {
  if (!capturedBlob.value) return;
  const success = await copyImageToClipboard(capturedBlob.value);
  if (success) toast.success('تم النسخ للحافظة');
  else toast.error('فشل النسخ، يرجى التحميل');
};

const handleShare = async () => {
  if (!capturedBlob.value) return;
  const fileName = `${props.fileName}-${Date.now()}.png`;
  const success = await shareImage(capturedBlob.value, fileName);
  if (success) toast.success('تمت المشاركة');
};

const closePreview = () => {
  showPreview.value = false;
  if (capturedImageUrl.value) {
    URL.revokeObjectURL(capturedImageUrl.value);
    capturedImageUrl.value = null;
    capturedBlob.value = null;
  }
};

defineExpose({
  capture: handleCapture,
});
</script>

<template>
  <div class="app-share-view-wrapper" :class="{ 'is-capturing': isCapturing }">
    <!-- Target Content Container -->
    <div ref="targetElement" class="share-content-target">
      <slot />
    </div>

    <!-- Floating Trigger Icon -->
    <v-tooltip location="top" text="التقاط صورة للمشاركة">
      <template #activator="{ props: tooltipProps }">
        <v-btn
          v-bind="tooltipProps"
          icon="ri-camera-lens-line"
          color="primary"
          density="comfortable"
          elevation="4"
          :style="triggerStyle"
          :loading="isCapturing"
          class="capture-trigger-btn"
          @click="handleCapture"
        />
      </template>
    </v-tooltip>

    <!-- Preview Dialog -->
    <v-dialog v-model="showPreview" max-width="900" class="preview-dialog-wrapper">
      <v-card class="preview-card bg-glass pa-2 rounded-lg border-light">
        <v-card-title class="d-flex align-center justify-space-between pb-2 border-b">
          <div class="d-flex align-center">
            <v-icon icon="ri-image-edit-line" color="primary" class="me-2" />
            <span class="text-h6 font-weight-bold">معاينة الصورة</span>
          </div>
          <v-btn icon="ri-close-line" variant="text" size="small" @click="closePreview" />
        </v-card-title>

        <v-card-text class="pa-4 bg-grey-lighten-4 rounded-lg mt-4 overflow-hidden">
          <v-img :src="capturedImageUrl" width="100%" class="rounded shadow-md preview-img-content" cover />
        </v-card-text>

        <v-card-actions class="pa-4 gap-2">
          <v-btn color="primary" variant="elevated" prepend-icon="ri-download-2-line" class="flex-grow-1 rounded-pill" @click="handleDownload">
            تحميل
          </v-btn>
          <v-btn color="secondary" variant="tonal" prepend-icon="ri-file-copy-line" class="flex-grow-1 rounded-pill" @click="handleCopy"> نسخ </v-btn>
          <v-btn
            v-if="canNativeShare"
            color="info"
            variant="tonal"
            prepend-icon="ri-share-line"
            class="flex-grow-1 rounded-pill"
            @click="handleShare"
          >
            مشاركة
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

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
  filter: brightness(1.02);
}

/* Glassmorphism Classes */
.bg-glass {
  background: rgba(255, 255, 255, 0.7) !important;
  backdrop-filter: blur(20px) !important;
  -webkit-backdrop-filter: blur(20px) !important;
}

.border-light {
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
}

.border-b {
  border-bottom: 1px solid rgba(0, 0, 0, 0.1) !important;
}

.shadow-md {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1) !important;
}

.capture-trigger-btn {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.capture-trigger-btn:hover {
  transform: scale(1.1) rotate(5deg);
}

.preview-img-content {
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.gap-2 {
  gap: 8px;
}
</style>
