<template>
  <div class="d-flex justify-end gap-2 mt-6">
    <v-btn variant="outlined" color="grey" :disabled="loading" @click="$emit('cancel')">
      {{ cancelText }}
    </v-btn>

    <v-btn variant="elevated" :color="submitColor" :loading="loading" @click="$emit('submit')">
      {{ submitText }}
    </v-btn>
  </div>
</template>

<script setup>
defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
  cancelText: {
    type: String,
    default: 'إلغاء',
  },
  submitText: {
    type: String,
    default: 'حفظ',
  },
  submitColor: {
    type: String,
    default: 'primary',
  },
});

defineEmits(['cancel', 'submit']);
</script>

<style scoped>
.gap-2 {
  gap: 0.5rem;
}
</style>
