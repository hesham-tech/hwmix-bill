<template>
  <div class="error-boundary-wrapper">
    <slot v-if="!hasError"></slot>
    <div v-else class="error-boundary-card pa-4 rounded-lg d-flex flex-column align-center justify-center text-center">
      <v-icon icon="ri-error-warning-line" size="40" color="error" class="mb-2" />
      <h3 class="text-subtitle-1 font-weight-bold error--text mb-1">عذراً، فشل تحميل هذا الجزء</h3>
      <p class="text-caption text-grey mb-3">حدث خطأ داخلي أثناء معالجة هذا المكون المالي أو التشغيلي.</p>
      <div class="d-flex gap-2">
        <v-btn size="small" color="primary" variant="tonal" prepend-icon="ri-refresh-line" @click="retry">
          إعادة المحاولة
        </v-btn>
        <v-btn v-if="debug" size="small" color="grey" variant="text" @click="showDetails = !showDetails">
          {{ showDetails ? 'إخفاء التفاصيل' : 'عرض التفاصيل' }}
        </v-btn>
      </div>
      <pre v-if="showDetails && error" class="mt-3 pa-2 text-left text-xxs bg-light rounded text-error border text-pre-wrap">
        {{ error.stack || error.message || error }}
      </pre>
    </div>
  </div>
</template>

<script setup>
import { ref, onErrorCaptured } from 'vue';

const props = defineProps({
  debug: {
    type: Boolean,
    default: () => process.env.NODE_ENV === 'development'
  }
});

const emit = defineEmits(['error', 'retry']);

const hasError = ref(false);
const error = ref(null);
const showDetails = ref(false);

onErrorCaptured((err, instance, info) => {
  hasError.value = true;
  error.value = err;
  
  // بث الحدث للمحرك للتوثيق والمراقبة (Observability)
  emit('error', { error: err, info });
  
  // إيقاف انتشار الخطأ للأعلى لمنع انهيار الصفحة كلياً
  return false;
});

const retry = () => {
  hasError.value = false;
  error.value = null;
  showDetails.value = false;
  emit('retry');
};
</script>

<script>
/**
 * حاجز الأخطاء المعزول للمكونات المالية والتشغيلية في لوحة التحكم
 */
export default {
  name: 'ErrorBoundary'
}
</script>

<style scoped>
.error-boundary-wrapper {
  width: 100%;
  height: 100%;
}
.error-boundary-card {
  border: 1px dashed rgb(var(--v-theme-error));
  background: rgba(var(--v-theme-error), 0.02);
  min-height: 150px;
  height: 100%;
}
.text-xxs {
  font-size: 10px;
  line-height: 1.2;
}
.text-pre-wrap {
  white-space: pre-wrap;
  word-break: break-all;
}
.gap-2 {
  gap: 8px;
}
</style>
