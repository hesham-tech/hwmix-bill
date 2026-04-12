<template>
  <div :class="['app-balance-display', customClass]" v-if="metadata">
    <!-- Value and Label -->
    <div :class="['d-flex align-center', gapClass]">
      <!-- Label based on perspective -->
      <span v-if="!hideLabel && label" :class="['balance-label', labelClass, colorClass]">
        {{ label }}
      </span>

      <!-- Absolute Value -->
      <span :class="['balance-value', valueClass, colorClass]">
        {{ formatCurrency(metadata.absValue) }}
      </span>

      <!-- Optional Icon -->
      <v-icon v-if="showIcon" :icon="icon" :size="iconSize" :class="[colorClass, 'ms-1']" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { getBalanceMetadata, formatCurrency } from '@/utils/formatters';

const props = defineProps({
  amount: {
    type: [Number, String],
    required: true,
  },
  /**
   * perspective: 
   * - 'admin': Uses "مدين / دائن"
   * - 'customer': Uses "عليك / لك"
   * - 'formal': Uses neutral language (mostly for documents/exports)
   */
  perspective: {
    type: String,
    default: 'admin',
    validator: (v) => ['admin', 'customer', 'formal'].includes(v),
  },
  hideLabel: {
    type: Boolean,
    default: false,
  },
  showIcon: {
    type: Boolean,
    default: false,
  },
  iconSize: {
    type: [Number, String],
    default: 16,
  },
  // Custom Styles
  valueClass: { type: String, default: 'font-weight-black' },
  labelClass: { type: String, default: 'text-caption' },
  customClass: { type: String, default: '' },
  gapClass: { type: String, default: 'gap-1' },
});

const metadata = computed(() => getBalanceMetadata(props.amount));

// Interpretation logic
const label = computed(() => {
  if (metadata.value.isZero) return '';

  if (props.perspective === 'admin') {
    return metadata.value.isAsset ? 'مدين' : 'دائن';
  }

  if (props.perspective === 'customer') {
    return metadata.value.isAsset ? 'عليك' : 'لك';
  }

  return ''; // 'formal' doesn't use simple labels, handled by parent if needed
});

const colorClass = computed(() => {
  if (metadata.value.isZero) return 'text-grey';

  if (props.perspective === 'admin') {
    return metadata.value.isAsset ? 'text-success' : 'text-error';
  }

  if (props.perspective === 'customer') {
    return metadata.value.isAsset ? 'text-error' : 'text-success';
  }

  return '';
});

const icon = computed(() => {
  if (metadata.value.isZero) return 'ri-subtract-line';
  if (metadata.value.isAsset) return 'ri-arrow-up-circle-line';
  return 'ri-arrow-down-circle-line';
});
</script>

<style scoped>
.app-balance-display {
  display: inline-block;
}
.balance-label {
  opacity: 0.9;
}
</style>
