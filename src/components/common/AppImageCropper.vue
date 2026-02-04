<template>
  <AppDialog v-model="isOpen" title="تعديل الصورة" icon="ri-crop-2-line" max-width="600" @confirm="handleCrop" @cancel="handleCancel">
    <div class="cropper-wrapper position-relative">
      <div class="cropper-controls d-flex flex-column ga-2 position-absolute pa-2 z-index-10">
        <v-btn
          icon="ri-checkbox-blank-circle-line"
          :color="currentCropType === 'circle' ? 'primary' : 'white'"
          size="small"
          elevation="4"
          @click="currentCropType = 'circle'"
        />
        <v-btn
          icon="ri-checkbox-blank-line"
          :color="currentCropType === 'square' ? 'primary' : 'white'"
          size="small"
          elevation="4"
          @click="currentCropType = 'square'"
        />
        <v-btn icon="ri-aspect-ratio-line" color="white" size="small" elevation="4" title="تحديد الصورة كاملة" @click="resetCropper" />
      </div>

      <cropper
        ref="cropperRef"
        class="cropper"
        :src="imageSrc"
        :stencil-component="stencilComponent"
        :stencil-props="stencilProps"
        image-restriction="stencil"
      />
    </div>

    <template #actions>
      <AppButton variant="text" color="info" prepend-icon="ri-image-line" @click="handleSkip">رفع الصورة الأصلية</AppButton>
      <v-spacer />
      <AppButton variant="text" color="grey" @click="handleCancel">إلغاء</AppButton>
      <AppButton color="primary" prepend-icon="ri-check-line" @click="handleCrop">حفظ الصورة المقصوصة</AppButton>
    </template>
  </AppDialog>
</template>

<script setup>
import { ref, computed } from 'vue';
import { Cropper, CircleStencil, RectangleStencil } from 'vue-advanced-cropper';
import 'vue-advanced-cropper/dist/style.css';
import AppDialog from '@/components/common/AppDialog.vue';
import AppButton from '@/components/common/AppButton.vue';

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  imageSrc: { type: String, required: true },
  cropType: { type: String, default: 'square' },
});

const emit = defineEmits(['update:modelValue', 'cropped', 'cancel', 'skip']);

const cropperRef = ref(null);
const currentCropType = ref('square'); // Default to square

const isOpen = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value),
});

const stencilComponent = computed(() => {
  return currentCropType.value === 'circle' ? CircleStencil : RectangleStencil;
});

const stencilProps = computed(() => {
  if (currentCropType.value === 'circle') {
    return { aspectRatio: 1 };
  }
  return {};
});

const resetCropper = () => {
  if (cropperRef.value) {
    cropperRef.value.setCoordinates(({ imageSize }) => ({
      width: imageSize.width,
      height: imageSize.height,
      left: 0,
      top: 0,
    }));
  }
};

const handleCrop = () => {
  const { canvas } = cropperRef.value.getResult();
  if (canvas) {
    // Convert canvas to blob for uploading
    canvas.toBlob(
      blob => {
        emit('cropped', blob);
        emit('update:modelValue', false);
      },
      'image/jpeg',
      0.9
    );
  }
};

const handleSkip = () => {
  emit('skip');
  emit('update:modelValue', false);
};

const handleCancel = () => {
  emit('update:modelValue', false);
  emit('cancel');
};
</script>

<style scoped>
.cropper-wrapper {
  max-width: 100%;
  max-height: 500px;
  background: #f8f9fa;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
}

.cropper {
  width: 100%;
  height: 400px;
}

.cropper-controls {
  top: 10px;
  right: 10px;
}

.z-index-10 {
  z-index: 10;
}
</style>
