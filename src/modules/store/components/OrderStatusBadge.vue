<template>
  <v-chip :color="config.color" size="small" variant="flat" class="font-weight-bold">
    {{ config.label }}
  </v-chip>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: {
    type: String,
    required: true
  }
})

const config = computed(() => {
  const map = {
    pending: { label: 'قيد الانتظار', color: 'warning' },
    confirmed: { label: 'مؤكد', color: 'info' },
    processing: { label: 'قيد التجهيز', color: 'primary' },
    shipped: { label: 'تم الشحن', color: 'deep-purple' },
    delivered: { label: 'تم التوصيل', color: 'success' },
    cancelled: { label: 'ملغي', color: 'error' },
  }
  return map[props.status] || { label: props.status, color: 'grey' }
})
</script>
