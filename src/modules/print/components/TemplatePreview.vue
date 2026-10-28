<template>
  <div class="template-preview" :aria-busy="loading">
    <v-progress-circular v-if="loading" indeterminate size="24" color="primary" />
    <img v-else-if="image" :src="image" alt="معاينة فعلية لقالب الملصق" :style="{ maxHeight: `${maxHeight}px` }" />
    <div v-if="!design.elements?.length" class="text-body-2 pa-5 text-center">ملصق فارغ — أضف عناصر من المحرر قبل النشر.</div>
    <v-alert v-if="error" type="warning" variant="tonal" density="compact">{{ error }}</v-alert>
  </div>
</template>
<script setup>
import { ref, watch, onBeforeUnmount } from 'vue';
import { renderTemplate } from '../templates-editor/templateRenderer';
import { SAMPLE_VALUES } from '../templates-editor/templateSchema';
import { createAssetLoader } from '../templates-editor/templateAssets';
const props = defineProps({
  design: { type: Object, required: true },
  values: { type: Object, default: () => SAMPLE_VALUES },
  monochrome: { type: Boolean, default: true },
  geometry: { type: Object, default: undefined },
  maxHeight: { type: Number, default: 320 },
  dpi: { type: Number, default: 203 },
});
const emit = defineEmits(['valid']);
const image = ref(''),
  error = ref(''),
  loading = ref(false);
let ticket = 0;
const loadImage = createAssetLoader();
watch(
  () => [props.design, props.values, props.monochrome, props.geometry, props.dpi],
  async () => {
    const current = ++ticket;
    loading.value = true;
    error.value = '';
    image.value = '';
    emit('valid', false);
    try {
      if (!props.design.elements?.length) return;
      const canvas = await renderTemplate(props.design, props.values, {
        monochrome: props.monochrome,
        geometry: props.geometry,
        dpi: props.dpi,
        loadImage,
      });
      if (current === ticket) {
        image.value = canvas.toDataURL('image/png');
        emit('valid', true);
      }
    } catch (e) {
      if (current === ticket) {
        error.value = e.message;
        emit('valid', false);
      }
    } finally {
      if (current === ticket) loading.value = false;
    }
  },
  { deep: true, immediate: true }
);
onBeforeUnmount(() => {
  ++ticket;
});
</script>
<style scoped>
.template-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 80px;
  padding: 12px;
  background: repeating-conic-gradient(#edf0f4 0% 25%, #f5f7fa 0% 50%) 50% / 16px 16px;
  border-radius: 8px;
  overflow: auto;
}
.template-preview img {
  display: block;
  max-width: 100%;
  width: auto;
  box-shadow: 0 2px 10px #0002;
  image-rendering: auto;
  background: white;
}
</style>
