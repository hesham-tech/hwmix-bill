<template>
  <v-card :elevation="elevation" class="stats-card" :class="cardClass">
    <v-card-text>
      <div class="d-flex align-center justify-center mb-4">
        <div
          class="stats-icon rounded-circle d-flex align-center justify-center elevation-3"
          :style="{ backgroundColor: colorValue + ' !important', width: '72px', height: '72px' }"
        >
          <v-icon :icon="icon" size="55" color="white" />
        </div>
      </div>

      <v-chip v-if="trend" :color="trendColor" size="small" variant="flat">
        <v-icon :icon="trendIcon" size="16" class="me-1" />
        {{ trend }}
      </v-chip>

      <div class="stats-content text-center">
        <div class="text-h5 font-weight-black mb-1" :style="{ color: colorValue }">
          {{ formattedValue }}
        </div>
        <div class="text-caption font-weight-bold text-grey-darken-1">{{ title }}</div>
        <div v-if="subtitle" class="text-xxs text-grey-darken-1 mt-1 font-weight-medium">
          {{ subtitle }}
        </div>
      </div>

      <v-progress-linear v-if="showProgress" :model-value="progress" :color="color" class="mt-3" height="6" rounded />
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed } from 'vue';
import { formatCurrency, formatNumber } from '@/utils/formatters';

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  value: {
    type: [Number, String],
    required: true,
  },
  icon: {
    type: [String, Boolean],
    required: true,
  },
  color: {
    type: String,
    default: '#1976D2',
  },
  subtitle: {
    type: String,
    default: '',
  },
  trend: {
    type: String,
    default: '',
  },
  type: {
    type: String,
    default: 'number',
    validator: v => ['number', 'currency', 'percentage'].includes(v),
  },
  elevation: {
    type: Number,
    default: 0,
  },
  showProgress: {
    type: Boolean,
    default: false,
  },
  progress: {
    type: Number,
    default: 0,
  },
});

const formattedValue = computed(() => {
  if (props.type === 'currency') {
    return formatCurrency(props.value);
  } else if (props.type === 'percentage') {
    return `${props.value}%`;
  }
  return formatNumber(props.value, 0);
});

const iconStyle = computed(() => ({
  background: props.color,
  padding: '12px',
  borderRadius: '4px',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const trendColor = computed(() => {
  if (!props.trend) return 'grey';
  return props.trend.startsWith('+') ? 'success' : 'error';
});

const trendIcon = computed(() => {
  if (!props.trend) return '';
  return props.trend.startsWith('+') ? 'ri-arrow-up-line' : 'ri-arrow-down-line';
});

const cardClass = computed(() => ({
  'stats-card-hover': true,
}));

const colorValue = computed(() => {
  const themeColors = ['primary', 'secondary', 'success', 'info', 'warning', 'error', 'indigo', 'purple', 'orange', 'teal', 'cyan'];
  if (themeColors.includes(props.color)) {
    return `rgb(var(--v-theme-${props.color}))`;
  }
  return props.color;
});
</script>

<style scoped>
.stats-card {
  transition: all 0.3s ease;
  border-radius: 4px;
  overflow: hidden;
}

.stats-card-hover:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
}

.stats-icon {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12);
  transition: all 0.3s ease;
}

.stats-card:hover .stats-icon {
  transform: scale(1.1);
}
.text-xxs {
  font-size: 0.65rem;
}
</style>
