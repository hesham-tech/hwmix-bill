<template>
  <div class="text-center py-8">
    <v-progress-circular :size="size" :width="width" color="primary" indeterminate />

    <p v-if="text" class="text-body-1 mt-4">{{ text }}</p>
  </div>
</template>

<script setup>
defineProps({
  size: {
    type: [String, Number],
    default: 64,
  },
  width: {
    type: [String, Number],
    default: 4,
  },
  text: {
    type: String,
    default: 'جاري التحميل...',
  },
});
</script>
