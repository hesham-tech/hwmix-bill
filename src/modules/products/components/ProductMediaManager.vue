<template>
  <div class="media-manager">
    <!-- Dropzone -->
    <div
      class="upload-zone d-flex flex-column align-center justify-center border-dashed rounded-md pa-6 mb-4 cursor-pointer transition-all"
      :class="{ 'border-primary bg-blue-lighten-5': isDragging, 'bg-grey-lighten-5': !isDragging }"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="handleDrop"
    >
      <input ref="fileInput" type="file" multiple accept="image/*" class="d-none" @change="handleFileSelect" />

      <v-avatar color="white" size="48" class="elevation-1 mb-2">
        <v-icon :color="isDragging ? 'primary' : 'grey'" size="small">
          {{ loading ? 'ri-loader-4-line rotate-animation' : 'ri-image-add-line' }}
        </v-icon>
      </v-avatar>

      <div class="text-subtitle-2 font-weight-bold mb-1 text-center">
        {{ loading ? 'جاري الرفع...' : 'اسحب الصور هنا أو اختر من المعرض' }}
      </div>

      <div class="d-flex gap-2 mt-2">
        <v-btn size="small" variant="tonal" color="primary" prepend-icon="ri-upload-line" :loading="loading" @click.stop="$refs.fileInput.click()">
          رفع ملفات
        </v-btn>
        <v-btn size="small" variant="tonal" color="secondary" prepend-icon="ri-gallery-line" @click.stop="showGallery = true"> تصفح المعرض </v-btn>
      </div>
    </div>

    <!-- Images Gallery -->
    <v-row v-if="images.length" dense>
      <v-col v-for="(img, index) in images" :key="img.id || index" cols="4" class="relative">
        <v-card border flat class="rounded-md overflow-hidden aspect-square group">
          <v-img :src="img.url" cover crossorigin="anonymous" class="fill-height bg-grey-lighten-4">
            <template #placeholder>
              <div class="d-flex align-center justify-center fill-height">
                <v-progress-circular indeterminate color="grey-lighten-4" size="20" />
              </div>
            </template>

            <!-- Remove Button Overlay -->
            <div class="image-overlay d-flex flex-column align-center justify-center transition-all opacity-0 group-hover-opacity-100 gap-2">
              <v-btn
                :icon="img.is_primary || img.id === primaryImageId || (!primaryImageId && index === 0) ? 'ri-star-fill' : 'ri-star-line'"
                size="x-small"
                :color="img.is_primary || img.id === primaryImageId || (!primaryImageId && index === 0) ? 'warning' : 'white'"
                variant="flat"
                class="rounded-md mb-1"
                @click.stop="togglePrimary(img)"
              />
              <v-btn icon="ri-delete-bin-line" size="x-small" color="error" variant="flat" class="rounded-md" @click.stop="removeImage(index)" />
            </div>

            <!-- Primary Badge -->
            <v-btn
              v-if="img.is_primary || img.id === primaryImageId || (!primaryImageId && index === 0)"
              icon="ri-star-fill"
              size="x-small"
              color="warning"
              variant="flat"
              class="position-absolute"
              style="top: 4px; right: 4px; z-index: 1; width: 20px; height: 20px"
              readonly
            />
          </v-img>
        </v-card>
      </v-col>
    </v-row>

    <!-- Media Gallery Component -->
    <MediaGallery v-model="showGallery" multiple :type="type" @select="handleGallerySelect" />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useApi } from '@/composables/useApi';
import MediaGallery from '@/components/common/MediaGallery.vue';

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => [],
  },
  type: {
    type: String,
    default: 'gallery',
  },
  primaryImageId: {
    type: [Number, String],
    default: null,
  },
});

const emit = defineEmits(['update:modelValue', 'update:primaryImageId']);

const images = ref([]);
const isDragging = ref(false);
const showGallery = ref(false);

const { create, loading } = useApi('/api/images');

// Watch for initial load or changes from parent
watch(
  () => props.modelValue,
  newVal => {
    if (Array.isArray(newVal)) {
      images.value = newVal;
    }
  },
  { immediate: true }
);

const handleDrop = e => {
  isDragging.value = false;
  const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
  if (files.length) uploadFiles(files);
};

const handleFileSelect = e => {
  const files = Array.from(e.target.files);
  if (files.length) uploadFiles(files);
  e.target.value = ''; // Reset input
};

const uploadFiles = async files => {
  const formData = new FormData();
  files.forEach(file => formData.append('images[]', file));
  formData.append('type', props.type);

  try {
    const response = await create(formData, { showSuccess: true });
    if (response) {
      const newImages = response.data;
      images.value = [...images.value, ...newImages];
      updateParent();
    }
  } catch (error) {
    console.error('Upload failed:', error);
  }
};

const handleGallerySelect = selected => {
  const selectedArray = Array.isArray(selected) ? selected : [selected];

  // Filter out images that are already in the list
  const newImages = selectedArray.filter(s => !images.value.some(img => img.id === s.id));

  images.value = [...images.value, ...newImages];
  updateParent();
};

const removeImage = index => {
  const removedId = images.value[index].id;
  images.value.splice(index, 1);
  if (props.primaryImageId === removedId) {
    emit('update:primaryImageId', images.value[0]?.id || null);
  }
  updateParent();
};

const { request: imageRequest } = useApi('/api/images');

const togglePrimary = async img => {
  const isLinked = img.id && !img.is_temp && img.imageable_id;

  if (isLinked) {
    try {
      await imageRequest('POST', `${img.id}/set-primary`);
      // Update UI only after API success
      images.value.forEach(i => {
        i.is_primary = i.id === img.id;
      });
      images.value = [...images.value];
      emit('update:primaryImageId', img.id);
    } catch (error) {
      console.error('Failed to set primary image:', error);
    }
  } else {
    // Local update for temp/new images
    images.value.forEach(i => {
      i.is_primary = i.id === img.id;
    });
    images.value = [...images.value];
    emit('update:primaryImageId', img.id);
  }
};

const updateParent = () => {
  emit('update:modelValue', images.value);
  // Auto-set primary if none selected
  if (images.value.length > 0 && !props.primaryImageId) {
    emit('update:primaryImageId', images.value[0].id);
  }
};
</script>

<style scoped>
.upload-zone {
  border: 2px dashed rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.upload-zone:hover {
  border-color: var(--v-theme-primary);
  background-color: #f8fbff;
}

.aspect-square {
  aspect-ratio: 1 / 1;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
}

.group:hover .group-hover-opacity-100 {
  opacity: 1 !important;
}

.opacity-0 {
  opacity: 0;
}

.rotate-animation {
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.cursor-pointer {
  cursor: pointer;
}
</style>
