<template>
  <div class="product-media-manager overflow-hidden">
    <!-- Drag & Drop Area -->
    <div
      class="upload-zone pa-2 rounded-xl border-dashed border-2 text-center transition-all"
      :class="{ 'border-primary bg-primary-lighten-5 scale-98': isDragging }"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="handleDrop"
      @click="$refs.fileInput.click()"
    >
      <input ref="fileInput" type="file" multiple accept="image/*" class="d-none" @change="handleFileSelect" />

      <v-avatar size="32" color="primary-lighten-5" class="mb-2">
        <v-icon icon="ri-upload-cloud-2-line" color="primary" size="18" />
      </v-avatar>
      <h3 class="text-subtitle-2 font-weight-black mb-1">اسحب وأفلت صور المنتج هنا</h3>
      <p class="text-body-2 text-grey-darken-1">أو اضغط لاختيار ملفات من جهازك (يدعم JPG, PNG, WebP)</p>
      <v-chip size="small" variant="tonal" color="primary" class="mt-2 text-caption"> يسع حتى 10 صور بدقة عالية </v-chip>
    </div>

    <!-- Media Grid / Sortable -->
    <v-row v-if="images.length" class="mt-6" dense>
      <v-col v-for="(image, index) in images" :key="image.id || index" cols="6" sm="4" md="3" lg="2">
        <v-hover v-slot="{ isHovering, props }">
          <v-card v-bind="props" class="media-item-card rounded-xl overflow-hidden elevation-1 relative" :class="{ 'is-primary': index === 0 }">
            <v-img :src="image.preview || image.url" aspect-ratio="1" cover>
              <div v-if="isHovering" class="overlay-actions d-flex align-center justify-center gap-2">
                <v-btn icon="ri-delete-bin-line" color="error" size="x-small" variant="flat" @click.stop="removeImage(index)" />
                <v-btn
                  v-if="index !== 0"
                  icon="ri-star-line"
                  color="primary"
                  size="x-small"
                  variant="flat"
                  title="تعيين كصورة أساسية"
                  @click.stop="setPrimary(index)"
                />
              </div>
              <v-chip v-if="index === 0" size="x-small" color="primary" variant="flat" class="primary-label px-2"> الأساسية </v-chip>
              <div class="drag-handle" v-if="isHovering">
                <v-icon icon="ri-drag-move-2-line" color="white" size="18" />
              </div>
            </v-img>
          </v-card>
        </v-hover>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['update:modelValue']);

const isDragging = ref(false);
const images = ref([...props.modelValue]);

const handleDrop = e => {
  isDragging.value = false;
  const files = Array.from(e.dataTransfer.files);
  processFiles(files);
};

const handleFileSelect = e => {
  const files = Array.from(e.target.files);
  processFiles(files);
};

const processFiles = files => {
  const newImages = files
    .filter(f => f.type.startsWith('image/'))
    .map(file => ({
      file,
      preview: URL.createObjectURL(file),
      id: Math.random().toString(36).substr(2, 9),
    }));

  images.value = [...images.value, ...newImages];
  emit('update:modelValue', images.value);
};

const removeImage = index => {
  images.value.splice(index, 1);
  emit('update:modelValue', images.value);
};

const setPrimary = index => {
  const primary = images.value.splice(index, 1)[0];
  images.value.unshift(primary);
  emit('update:modelValue', images.value);
};

// Note: Real sorting logic would ideally use a library like vuedraggable
// For now, we implement the primary-selection and removal features.
</script>

<style scoped>
.upload-zone {
  cursor: pointer;
  border-color: #e2e8f0 !important;
  background-color: #f8fafc;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.upload-zone:hover {
  border-color: rgba(var(--v-theme-primary), 0.5) !important;
  background-color: rgba(var(--v-theme-primary), 0.02);
}

.scale-98 {
  transform: scale(0.98);
}

.media-item-card {
  position: relative;
  border: 2px solid transparent !important;
  transition: all 0.3s ease;
}

.media-item-card.is-primary {
  border-color: rgba(var(--v-theme-primary), 0.5) !important;
}

.overlay-actions {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(2px);
  z-index: 2;
}

.primary-label {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 3;
  font-weight: 800;
}

.drag-handle {
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 3;
  cursor: move;
}

.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
