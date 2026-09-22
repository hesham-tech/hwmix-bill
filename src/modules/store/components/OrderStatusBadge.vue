<template>
  <v-chip
    :color="statusConfig.color"
    :variant="statusConfig.variant"
    :size="size"
    class="font-weight-semibold"
  >
    <v-icon :icon="statusConfig.icon" :size="size === 'small' ? 14 : 16" class="me-1"></v-icon>
    {{ statusConfig.label }}
  </v-chip>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: { type: String, default: 'pending' },
  size: { type: String, default: 'default' }
})

const statusMap = {
  pending:           { label: 'قيد الانتظار', color: 'warning',  variant: 'tonal',    icon: 'ri-time-line' },
  confirmed:         { label: 'تم التأكيد',   color: 'info',     variant: 'tonal',    icon: 'ri-checkbox-circle-line' },
  processing:        { label: 'قيد التجهيز',  color: 'primary',  variant: 'tonal',    icon: 'ri-loader-4-line' },
  shipped:           { label: 'في الطريق',    color: 'purple',   variant: 'tonal',    icon: 'ri-truck-line' },
  partially_shipped: { label: 'شحن جزئي',     color: 'deep-purple', variant: 'tonal', icon: 'ri-truck-line' },
  delivered:         { label: 'تم التسليم',   color: 'success',  variant: 'flat',     icon: 'ri-checkbox-circle-fill' },
  cancelled:         { label: 'ملغي',          color: 'error',    variant: 'tonal',    icon: 'ri-close-circle-line' },
  returned:          { label: 'مُعاد',         color: 'grey',     variant: 'tonal',    icon: 'ri-arrow-go-back-line' },
}

const statusConfig = computed(() =>
  statusMap[props.status] || { label: props.status, color: 'grey', variant: 'tonal', icon: 'ri-question-line' }
)
</script>
