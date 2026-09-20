<template>
  <v-chip :color="badgeConfig.color" size="small" class="font-weight-bold" variant="flat">
    {{ badgeConfig.text }}
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

const badgeConfig = computed(() => {
  switch (props.status) {
    case 'in_stock':
      return { color: 'success', text: 'متوفر' }
    case 'out_of_stock':
      return { color: 'error', text: 'نفذت الكمية' }
    case 'low_stock':
      return { color: 'warning', text: 'كمية محدودة' }
    default:
      return { color: 'grey', text: 'غير معروف' }
  }
})
</script>
