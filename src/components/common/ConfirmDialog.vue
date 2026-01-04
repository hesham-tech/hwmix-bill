<template>
  <v-dialog :model-value="modelValue" max-width="400" persistent @update:model-value="$emit('update:modelValue', $event)">
    <v-card>
      <v-card-title class="bg-error text-white d-flex align-center gap-2">
        <v-icon icon="ri-error-warning-line" color="white" />
        <span>تأكيد</span>
      </v-card-title>

      <v-card-text class="pa-6">
        <p class="text-body-1">{{ message }}</p>
      </v-card-text>

      <v-card-actions class="px-6 pb-4">
        <v-spacer />

        <v-btn variant="outlined" color="grey" @click="handleCancel"> إلغاء </v-btn>

        <v-btn variant="elevated" color="error" :loading="loading" @click="handleConfirm"> تأكيد </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  message: {
    type: String,
    default: 'هل أنت متأكد؟',
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel']);

const handleCancel = () => {
  emit('cancel');
  emit('update:modelValue', false);
};

const handleConfirm = () => {
  emit('confirm');
};
</script>

<style scoped>
.gap-2 {
  gap: 0.5rem;
}
</style>
