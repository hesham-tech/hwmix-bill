<template>
  <AppDialog
    v-model="isOpen"
    title="مشاركة المستند"
    subtitle="اختر الطريقة المناسبة لمشاركة الملف كـ PDF"
    icon="ri-share-forward-line"
    max-width="500"
    hide-actions
  >
    <div class="pa-4 text-center">
      <!-- File Preview (Optional) -->
      <div class="mb-6 py-8 rounded-lg bg-grey-lighten-4 d-flex flex-column align-center justify-center border-dashed">
        <v-icon icon="ri-file-pdf-2-line" size="64" color="error" class="mb-2" />
        <div class="text-subtitle-1 font-weight-bold text-truncate px-4 w-100">
          {{ fileName }}
        </div>
      </div>

      <div class="d-flex flex-column gap-3">
        <!-- Download Action -->
        <v-btn
          color="primary"
          block
          size="large"
          variant="elevated"
          prepend-icon="ri-download-2-line"
          class="rounded-pill font-weight-bold shadow-sm"
          @click="handleDownload"
        >
          تحميل كـ PDF
        </v-btn>

        <!-- Share Action (Mobile/Native) -->
        <v-btn
          v-if="canShare"
          color="success"
          block
          size="large"
          variant="elevated"
          prepend-icon="ri-whatsapp-line"
          class="rounded-pill font-weight-bold shadow-sm"
          @click="handleShare"
        >
          مشاركة الملف
        </v-btn>

        <!-- Copy File (Hidden on mobile) -->
        <v-btn
          v-if="!isMobile"
          color="indigo"
          block
          size="large"
          variant="tonal"
          prepend-icon="ri-file-copy-2-line"
          class="rounded-pill font-weight-bold"
          @click="handleCopy"
        >
          نسخ الملف (Clipboard)
        </v-btn>
      </div>

      <div class="mt-6 text-caption text-grey">* يتم توليد الملف بصيغة A4 قياسية لملاءمة الطباعة والمشاركة.</div>
    </div>

    <!-- Copy Success Snackbar -->
    <v-snackbar v-slot:actions v-model="copySuccess" color="success" timeout="2000" location="top"> تم نسخ الملف إلى الحافظة بنجاح </v-snackbar>
  </AppDialog>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useDisplay } from 'vuetify';
import AppDialog from './AppDialog.vue';

const props = defineProps({
  modelValue: Boolean,
  pdfBlob: { type: [Blob, Object], default: null },
  fileName: { type: String, default: 'document.pdf' },
});

const emit = defineEmits(['update:modelValue', 'download', 'share', 'copy']);

const { smAndDown: isMobile } = useDisplay();
const copySuccess = ref(false);

const isOpen = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val),
});

const canShare = computed(() => typeof navigator.share === 'function');

const handleDownload = () => {
  emit('download');
  isOpen.value = false;
};
const handleShare = () => {
  emit('share');
  isOpen.value = false;
};
const handleCopy = () => {
  emit('copy', {
    onSuccess: () => {
      copySuccess.value = true;
      setTimeout(() => {
        isOpen.value = false;
      }, 1500);
    },
  });
};
</script>

<style scoped>
.border-dashed {
  border: 2px dashed #e0e0e0;
}
.gap-3 {
  gap: 12px;
}
</style>
