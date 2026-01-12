<template>
  <v-avatar
    :size="size"
    :rounded="rounded"
    :color="imgUrl ? undefined : bgcolor"
    :class="['app-avatar shadow-sm border', { 'hover-scale': hoverable }, customClass]"
    v-bind="$attrs"
  >
    <!-- Priority 1: Image -->
    <v-img v-if="imgUrl" :src="imgUrl" cover @error="handleImgError">
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
</template>

<script setup>
import { ref, computed } from 'vue';

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
    type: String,
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
   * Custom CSS class for the avatar element.
   */
  customClass: {
    type: String,
    default: '',
  },
});

const hasImgError = ref(false);

const handleImgError = () => {
  hasImgError.value = true;
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

const initialsFontSize = computed(() => {
  const numSize = parseInt(props.size);
  if (isNaN(numSize)) return '0.875rem';
  return numSize * 0.35 + 'px';
});
</script>

<style scoped>
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

:deep(.v-img__img) {
  object-fit: cover;
}
</style>
