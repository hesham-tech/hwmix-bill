<template>
  <div :class="['app-avatar-wrapper d-inline-block', { 'cursor-pointer': previewable || editable }]">
    <v-avatar
      :size="size"
      :rounded="isStandardRounded ? rounded : undefined"
      :color="imgUrl ? undefined : bgcolor"
      :class="['app-avatar shadow-sm', { 'hover-scale': hoverable, 'cursor-zoom-in': shouldBePreviewable }, customClass]"
      :style="avatarStyle"
      v-bind="$attrs"
      @click="editable ? handleEditClick() : handlePreview($event)"
    >
      <!-- Priority 1: Image -->
      <v-img v-if="imgUrl && !hasImgError" :src="imgUrl" cover crossorigin="anonymous" @error="handleImgError">
        <template #placeholder>
          <div class="d-flex align-center justify-center fill-height bg-grey-lighten-4">
            <v-progress-circular indeterminate size="16" width="2" color="primary" />
          </div>
        </template>
      </v-img>

      <!-- Priority 2: Initials -->
      <span v-else-if="initials && !hasImgError" :class="['font-weight-bold', textClass]" :style="{ fontSize: initialsFontSize }">
        {{ initials }}
      </span>

      <!-- Priority 3: Fallback Icon -->
      <v-icon v-else :icon="fallbackIcon" :size="iconSize" :color="iconColor" />
    </v-avatar>

    <!-- Edit Controls (Outside v-avatar for visibility) -->
    <template v-if="editable">
      <!-- Desktop Hover Overlay -->
      <div class="avatar-edit-overlay d-none d-sm-flex align-center justify-center">
        <div class="d-flex ga-2">
          <v-btn
            icon="ri-camera-switch-line"
            size="x-small"
            color="primary"
            variant="elevated"
            class="edit-btn shadow-md"
            title="تغيير الصورة"
            @click.stop="handleEditClick"
          />
          <v-btn
            v-if="imgUrl"
            icon="ri-crop-2-line"
            size="x-small"
            color="success"
            variant="elevated"
            class="edit-btn shadow-md"
            title="قص الصورة"
            @click.stop="handleCropClick"
          />
        </div>
      </div>

      <!-- Persistent Badge (Pencil) -> Direct Crop -->
      <div class="edit-badge-permanent shadow-lg d-flex align-center justify-center" @click.stop="handleCropClick">
        <v-icon icon="ri-pencil-fill" size="12" color="white" />
      </div>
    </template>

    <!-- Image Preview Dialog -->
    <v-dialog v-model="showPreview" max-width="600px" transition="dialog-bottom-transition">
      <v-card class="preview-dialog-card rounded-md overflow-hidden position-relative">
        <!-- Close Button -->
        <v-btn icon="ri-close-line" variant="elevated" color="white" size="small" class="preview-close-btn shadow-lg" @click="showPreview = false" />

        <v-card-text class="pa-0 bg-grey-lighten-4 d-flex align-center justify-center position-relative" style="min-height: 300px">
          <v-img
            v-if="imgUrl"
            :src="imgUrl"
            max-height="70vh"
            width="100%"
            crossorigin="anonymous"
            class="user-preview-img"
            @error="hasImgError = true"
          >
            <template #placeholder>
              <div class="d-flex align-center justify-center fill-height">
                <v-progress-circular indeterminate color="primary" width="3" />
              </div>
            </template>
          </v-img>
          <div v-else class="pa-10 text-center text-grey">
            <v-icon icon="ri-image-line" size="64" class="mb-2 opacity-50" />
            <div class="text-h6">تعذر تحميل الصورة</div>
          </div>

          <!-- Dialog Actions Overlay (Moved inside card-text for better positioning) -->
          <div v-if="editable" class="preview-actions-bar pa-4 d-flex justify-center ga-3 w-100">
            <v-btn prepend-icon="ri-camera-switch-line" variant="elevated" color="primary" rounded="pill" elevation="8" @click="handleEditClick">
              تغيير الصورة
            </v-btn>
            <v-btn
              v-if="imgUrl"
              prepend-icon="ri-crop-2-line"
              variant="elevated"
              color="success"
              rounded="pill"
              elevation="8"
              @click="handleCropClick"
            >
              قص الصورة
            </v-btn>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
  /**
   * The image URL for the avatar.
   */
  imgUrl: {
    type: String,
    default: null,
  },
  /**
   * The name or title to derive initials from.
   * Derives first two letters from the first two words.
   */
  name: {
    type: String,
    default: '',
  },
  /**
   * Manual initials if derivation is not desired.
   */
  customInitials: {
    type: String,
    default: null,
  },
  /**
   * Size of the avatar (px or string like 'small', 'large').
   */
  size: {
    type: [Number, String],
    default: 40,
  },
  /**
   * Specific rounding for the avatar.
   * 'circle', 'xl', 'lg', 'md', 'sm', '0'
   */
  rounded: {
    type: String,
    default: 'circle',
  },
  /**
   * Background color when showing initials or icon.
   */
  color: {
    type: String,
    default: 'primary-lighten-5',
  },
  /**
   * Text color class for initials.
   */
  textColor: {
    type: String,
    default: 'primary',
  },
  /**
   * Fallback icon when no image or initials are available.
   */
  icon: {
    type: [String, Boolean],
    default: 'ri-user-line',
  },
  /**
   * Type of entity (user, company, brand, product)
   * Automatically sets default icon and color if not provided.
   */
  type: {
    type: String,
    default: 'user',
  },
  /**
   * Whether to add a hover scale effect.
   */
  hoverable: {
    type: Boolean,
    default: false,
  },
  /**
   * Whether to show an image preview dialog on click.
   */
  previewable: {
    type: Boolean,
    default: true,
  },
  /**
   * Custom CSS class for the avatar element.
   */
  customClass: {
    type: String,
    default: '',
  },
  /**
   * Whether to show an edit button in the preview dialog.
   */
  editable: {
    type: Boolean,
    default: false,
  },
});

const hasImgError = ref(false);
const showPreview = ref(false);

const emit = defineEmits(['edit', 'crop']);

const handleImgError = () => {
  hasImgError.value = true;
};

// Reset error state when URL changes to try loading new image
watch(
  () => props.imgUrl,
  () => {
    hasImgError.value = false;
  }
);

const shouldBePreviewable = computed(() => {
  return props.previewable && props.imgUrl && typeof props.imgUrl === 'string' && props.imgUrl.trim().length > 0 && !hasImgError.value;
});

const handlePreview = event => {
  if (shouldBePreviewable.value) {
    event.stopPropagation();
    showPreview.value = true;
  }
};

const handleEditClick = () => {
  showPreview.value = false;
  emit('edit');
};

const handleCropClick = () => {
  showPreview.value = false;
  emit('crop');
};

// Map types to default icons
const typeIcons = {
  user: 'ri-user-line',
  company: 'ri-building-line',
  brand: 'ri-award-line',
  product: 'ri-box-3-line',
  payment: 'ri-bank-card-line',
  activity: 'ri-history-line',
};

// Map types to default colors
const typeColors = {
  user: 'primary-lighten-5',
  company: 'info-lighten-5',
  brand: 'warning-lighten-5',
  product: 'success-lighten-5',
  payment: 'secondary-lighten-5',
  activity: 'grey-lighten-4',
};

const fallbackIcon = computed(() => {
  if (props.icon !== 'ri-user-line') return props.icon;
  return typeIcons[props.type] || 'ri-user-line';
});

const bgcolor = computed(() => {
  if (props.color !== 'primary-lighten-5') return props.color;
  return typeColors[props.type] || 'primary-lighten-5';
});

const textClass = computed(() => {
  return `text-${props.textColor}`;
});

const iconColor = computed(() => {
  return props.textColor;
});

const initials = computed(() => {
  if (props.customInitials) return props.customInitials;
  if (!props.name) return '';

  const words = props.name.trim().split(/\s+/);
  if (words.length === 0) return '';

  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }

  return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
});

const iconSize = computed(() => {
  const numSize = parseInt(props.size);
  if (isNaN(numSize)) return 'small';
  return numSize * 0.5 + 'px';
});

const isStandardRounded = computed(() => {
  const standardValues = ['0', 'xs', 'sm', 'md', 'lg', 'xl', 'pill', 'circle'];
  return standardValues.includes(props.rounded) || !props.rounded;
});

const avatarStyle = computed(() => {
  if (isStandardRounded.value) return {};
  return {
    borderRadius: props.rounded,
  };
});

const initialsFontSize = computed(() => {
  const numSize = parseInt(props.size);
  if (isNaN(numSize)) return '0.875rem';
  return numSize * 0.35 + 'px';
});
</script>

<style scoped>
.app-avatar-wrapper {
  position: relative;
  line-height: 0;
}

.cursor-pointer {
  cursor: pointer;
}

.app-avatar {
  transition: all 0.2s ease;
  flex-shrink: 0;
  display: flex !important;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.hover-scale:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1) !important;
  z-index: 1;
}

.cursor-zoom-in {
  cursor: zoom-in !important;
}

.avatar-edit-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  opacity: 0;
  transition: all 0.3s ease;
  z-index: 100;
  pointer-events: none;
  border-radius: inherit;
}

.app-avatar-wrapper:hover .avatar-edit-overlay {
  opacity: 1;
  pointer-events: auto;
  cursor: pointer;
}

.edit-btn {
  transform: translateY(10px);
  transition: all 0.3s ease;
}

.app-avatar-wrapper:hover .edit-btn {
  transform: translateY(0);
}

.edit-badge-permanent {
  position: absolute;
  bottom: 4px;
  right: 4px;
  background: rgb(var(--v-theme-primary));
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid white;
  display: flex !important;
  align-items: center;
  justify-content: center;
  z-index: 110;
  cursor: pointer;
  transition: transform 0.2s;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}

.edit-badge-permanent:hover {
  transform: scale(1.1);
  background: rgb(var(--v-theme-primary-darken-1));
}

.preview-actions-bar {
  position: absolute;
  bottom: 0px;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
  padding: 60px 20px 20px !important;
  z-index: 110;
}

.preview-close-btn {
  position: absolute;
  top: 15px;
  right: 15px;
  z-index: 120;
}

.user-preview-img :deep(.v-img__img) {
  object-fit: contain;
}

:deep(.v-img__img) {
  object-fit: cover;
}
</style>
