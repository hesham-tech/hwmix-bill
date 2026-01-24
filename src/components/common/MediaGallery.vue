<template>
  <v-dialog v-model="show" max-width="900" scrollable persistent transition="dialog-bottom-transition" class="media-gallery-dialog">
    <v-card class="rounded-lg overflow-hidden">
      <!-- Header -->
      <v-toolbar color="primary" density="comfortable" flat>
        <v-icon icon="ri-gallery-line" class="ms-4 me-2" />
        <v-toolbar-title class="text-h6 font-weight-bold">معرض الصور</v-toolbar-title>
        <v-spacer />
        <v-btn icon="ri-close-line" @click="close" />
      </v-toolbar>

      <v-card-text class="pa-0 flex-grow-1 overflow-hidden d-flex flex-column">
        <!-- Action Bar: Search & Upload -->
        <div class="pa-4 bg-grey-lighten-4 border-b d-flex align-center flex-wrap gap-4">
          <v-text-field
            v-model="search"
            label="بحث في الصور..."
            prepend-inner-icon="ri-search-line"
            variant="solo"
            density="compact"
            hide-details
            class="max-width-300 elevation-0 border rounded-lg"
          />

          <v-spacer />

          <v-btn color="success" prepend-icon="ri-upload-cloud-2-line" elevation="1" :loading="uploading" @click="$refs.fileInput.click()">
            {{ multiple ? 'رفع مجموعة صور' : 'رفع صورة جديدة' }}
          </v-btn>
          <input ref="fileInput" type="file" accept="image/*" :multiple="multiple" class="d-none" @change="handleFileUpload" />
        </div>

        <!-- Images Grid -->
        <div class="flex-grow-1 overflow-y-auto pa-4 custom-scrollbar">
          <div v-if="loading && !images.length" class="d-flex flex-column align-center justify-center py-12">
            <v-progress-circular indeterminate color="primary" size="64" />
            <div class="mt-4 text-grey">جاري تحميل الصور...</div>
          </div>

          <div v-else-if="!images.length" class="d-flex flex-column align-center justify-center py-12 opacity-60">
            <v-icon icon="ri-image-2-line" size="80" color="grey-lighten-1" />
            <div class="text-h6 mt-4">المعرض فارغ حالياً</div>
            <p class="text-body-2">لم يتم العثور على أي صور غير مستخدمة</p>
          </div>

          <v-row v-else>
            <v-col v-for="image in filteredImages" :key="image.id" cols="6" sm="4" md="3">
              <v-card
                class="image-item-card overflow-hidden position-relative"
                :class="{ 'selected-border': isSelected(image.id) }"
                elevation="1"
                @click="toggleSelection(image.id)"
              >
                <!-- Selection Checkbox UI -->
                <div class="selection-checkbox" :class="{ 'is-checked': isSelected(image.id) }">
                  <v-icon :icon="isSelected(image.id) ? 'ri-checkbox-fill' : 'ri-checkbox-blank-line'" />
                </div>

                <!-- Selection Overlay (Mobile/Visual) -->
                <div v-if="isSelected(image.id)" class="selection-overlay" />

                <v-img :src="image.url" aspect-ratio="1" cover crossorigin="anonymous" class="bg-grey-lighten-3">
                  <template #placeholder>
                    <v-row class="fill-height ma-0" align="center" justify="center">
                      <v-progress-circular indeterminate color="grey-lighten-5" />
                    </v-row>
                  </template>
                </v-img>

                <!-- Floating Delete Button -->
                <v-btn
                  icon="ri-delete-bin-7-fill"
                  color="error"
                  size="x-small"
                  variant="elevated"
                  class="delete-btn position-absolute"
                  @click.stop="confirmDelete(image)"
                />
              </v-card>
            </v-col>
          </v-row>
        </div>
      </v-card-text>

      <v-divider />

      <!-- Footer Actions -->
      <v-card-actions class="pa-4 bg-grey-lighten-5">
        <v-btn variant="text" color="grey-darken-1" prepend-icon="ri-close-line" @click="close"> إلغاء </v-btn>

        <v-spacer />

        <v-btn color="primary" size="large" elevation="2" class="px-8 font-weight-bold" :disabled="!selectedIds.length" @click="confirmSelection">
          {{ multiple ? `تعيين الصور المختارة (${selectedIds.length})` : 'تعيين الصورة المختارة' }}
        </v-btn>
      </v-card-actions>
    </v-card>

    <!-- Internal Confirm Delete Dialog -->
    <AppConfirmDialog
      v-model="deleteConfirmDialog"
      title="حذف الصورة نهائياً؟"
      message="سيتم حذف الملف من السيرفر ولا يمكن التراجع عن هذا الإجراء."
      confirm-text="نعم، حذف"
      type="error"
      :loading="deleting"
      @confirm="doDelete"
      @cancel="deleteConfirmDialog = false"
    />

    <!-- Image Cropper Dialog -->
    <AppImageCropper
      v-model="showCropper"
      :image-src="cropperImageSrc"
      :crop-type="cropperType"
      @cropped="handleCroppedImage"
      @skip="handleSkipCropping"
    />
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useApi } from '@/composables/useApi';
import AppConfirmDialog from './AppConfirmDialog.vue';
import AppImageCropper from './AppImageCropper.vue';

const props = defineProps({
  modelValue: Boolean,
  multiple: {
    type: Boolean,
    default: false,
  },
  type: {
    type: String,
    default: 'logo',
  },
});

const emit = defineEmits(['update:modelValue', 'select']);

const api = useApi('/api/images');
const images = ref([]);
const loading = ref(false);
const uploading = ref(false);
const deleting = ref(false);
const search = ref('');
const selectedIds = ref([]); // Now an array
const deleteConfirmDialog = ref(false);
const imageToDelete = ref(null);

// Cropper State
const showCropper = ref(false);
const cropperImageSrc = ref('');
const originalFile = ref(null);
const cropperType = computed(() => (props.type === 'avatar' ? 'circle' : 'square'));

const show = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value),
});

const filteredImages = computed(() => {
  if (!search.value) return images.value;
  return images.value.filter(
    img => img.file_name?.toLowerCase().includes(search.value.toLowerCase()) || img.type?.toLowerCase().includes(search.value.toLowerCase())
  );
});

const fetchImages = async () => {
  loading.value = true;
  try {
    const response = await api.get({ linked: '0' });
    images.value = response.data || [];
  } catch (error) {
    console.error('Failed to fetch images:', error);
  } finally {
    loading.value = false;
  }
};

const handleFileUpload = async event => {
  const files = event.target.files;
  if (!files.length) return;

  // For single uploads (like profile/avatar), show cropper first
  if (!props.multiple && files.length === 1) {
    originalFile.value = files[0];
    const reader = new FileReader();
    reader.onload = e => {
      cropperImageSrc.value = e.target.result;
      showCropper.value = true;
    };
    reader.readAsDataURL(files[0]);
    // Reset input so same file can be selected again if needed
    event.target.value = '';
    return;
  }

  // Fallback for multiple files or if skipping cropper
  uploading.value = true;
  const formData = new FormData();
  for (let i = 0; i < files.length; i++) {
    formData.append('images[]', files[i]);
  }
  formData.append('type', props.type);

  try {
    await api.create(formData, { showSuccessMessage: true });
    await fetchImages();
  } catch (error) {
    console.error('Upload failed:', error);
  } finally {
    uploading.value = false;
    event.target.value = '';
  }
};

const handleCroppedImage = async blob => {
  uploading.value = true;
  const formData = new FormData();
  const file = new File([blob], `cropped_${Date.now()}.jpg`, { type: 'image/jpeg' });
  formData.append('images[]', file);
  formData.append('type', props.type);

  try {
    const res = await api.create(formData, { showSuccessMessage: true });
    await fetchImages();
    // Auto-select the newly uploaded image if it's a single select gallery
    if (!props.multiple && res.data && res.data.length > 0) {
      const newImage = res.data[0];
      selectedIds.value = [newImage.id];
      // Automatically confirm selection for better UX in profile
      confirmSelection();
    }
  } catch (error) {
    console.error('Cropped upload failed:', error);
  } finally {
    uploading.value = false;
    showCropper.value = false;
  }
};

const handleSkipCropping = async () => {
  if (!originalFile.value) return;

  uploading.value = true;
  const formData = new FormData();
  formData.append('images[]', originalFile.value);
  formData.append('type', props.type);

  try {
    const res = await api.create(formData, { showSuccessMessage: true });
    await fetchImages();
    if (!props.multiple && res.data && res.data.length > 0) {
      const newImage = res.data[0];
      selectedIds.value = [newImage.id];
      confirmSelection();
    }
  } catch (error) {
    console.error('Skip cropping upload failed:', error);
  } finally {
    uploading.value = false;
    showCropper.value = false;
    originalFile.value = null;
  }
};

const confirmDelete = image => {
  imageToDelete.value = image;
  deleteConfirmDialog.value = true;
};

const doDelete = async () => {
  if (!imageToDelete.value) return;

  deleting.value = true;
  try {
    await api.request('POST', 'delete', { ids: [imageToDelete.value.id] });
    images.value = images.value.filter(img => img.id !== imageToDelete.value.id);
    selectedIds.value = selectedIds.value.filter(id => id !== imageToDelete.value.id);
    deleteConfirmDialog.value = false;
  } catch (error) {
    console.error('Delete failed:', error);
  } finally {
    deleting.value = false;
    imageToDelete.value = null;
  }
};

const toggleSelection = id => {
  if (props.multiple) {
    const index = selectedIds.value.indexOf(id);
    if (index > -1) {
      selectedIds.value.splice(index, 1);
    } else {
      selectedIds.value.push(id);
    }
  } else {
    // Single selection: if clicking same, deselect; if other, select only that
    selectedIds.value = selectedIds.value[0] === id ? [] : [id];
  }
};

const isSelected = id => selectedIds.value.includes(id);

const close = () => {
  emit('update:modelValue', false);
};

const confirmSelection = () => {
  const selected = images.value.filter(img => selectedIds.value.includes(img.id));
  if (selected.length) {
    // If multiple is false, send the single object, otherwise send array
    emit('select', props.multiple ? selected : selected[0]);
    close();
  }
};

onMounted(() => {
  if (props.modelValue) fetchImages();
});

watch(
  () => props.modelValue,
  newVal => {
    if (newVal) {
      selectedIds.value = []; // Reset on open
      fetchImages();
    }
  }
);
</script>

<style scoped>
.image-item-card {
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  border-radius: 12px;
  border: 2px solid transparent;
}

.image-item-card:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
}

.selected-border {
  border-color: rgb(var(--v-theme-primary)) !important;
  transform: scale(0.98);
}

.selection-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(var(--v-theme-primary), 0.15);
  z-index: 1;
  pointer-events: none;
}

.selection-checkbox {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 10;
  background: white;
  border-radius: 4px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  color: #ccc;
  transition: all 0.2s;
}

.selection-checkbox.is-checked {
  background: rgb(var(--v-theme-primary));
  color: white;
}

.delete-btn {
  opacity: 0;
  transition: all 0.2s;
  z-index: 10;
  bottom: 8px;
  left: 50%;
  transform: translateX(-50%) translateY(20px);
}

.image-item-card:hover .delete-btn {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

.max-width-300 {
  max-width: 300px;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #aaa;
}
</style>
