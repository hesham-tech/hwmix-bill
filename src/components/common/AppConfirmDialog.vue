<template>
  <v-dialog :model-value="modelValue || internalModelValue" max-width="450" persistent @update:model-value="$emit('update:modelValue', $event)">
    <v-card class="confirm-dialog rounded-lg overflow-hidden border">
      <div class="pa-6 text-center">
        <v-avatar :color="type === 'error' ? 'error-lighten-5' : 'primary-lighten-5'" size="64" class="mb-4">
          <v-icon
            :icon="icon || (type === 'error' ? 'ri-error-warning-line' : 'ri-question-line')"
            :color="type === 'error' ? 'error' : 'primary'"
            size="32"
          />
        </v-avatar>

        <h3 class="text-h5 font-weight-bold mb-2">{{ title }}</h3>
        <p class="text-body-1 text-grey-darken-1 mb-0">{{ message || subtitle }}</p>
      </div>

      <v-divider />

      <v-card-actions class="pa-4 bg-grey-lighten-5 d-flex gap-3">
        <v-btn block variant="tonal" :color="cancelColor" class="flex-grow-1 font-weight-bold" height="44" @click="handleCancel">
          {{ cancelText }}
        </v-btn>

        <v-btn
          block
          variant="elevated"
          :color="type === 'error' ? 'error' : confirmColor"
          class="flex-grow-1 font-weight-bold elevation-2"
          height="44"
          :loading="loading"
          @click="handleConfirm"
        >
          {{ confirmText }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: 'تأكيد الإجراء',
  },
  subtitle: {
    type: String,
    default: 'هل أنت متأكد من تنفيذ هذا الإجراء؟',
  },
  message: {
    type: String,
    default: '',
  },
  confirmText: {
    type: String,
    default: 'تأكيد',
  },
  cancelText: {
    type: String,
    default: 'إلغاء',
  },
  confirmColor: {
    type: String,
    default: 'primary',
  },
  cancelColor: {
    type: String,
    default: 'grey',
  },
  type: {
    type: String,
    default: 'primary', // 'primary', 'error'
  },
  icon: {
    type: [String, Boolean],
    default: '',
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel']);

const internalModelValue = ref(false);
const resolvePromise = ref(null);

const open = () => {
  internalModelValue.value = true;
  return new Promise(resolve => {
    resolvePromise.value = resolve;
  });
};

const handleCancel = () => {
  internalModelValue.value = false;
  if (resolvePromise.value) resolvePromise.value(false);
  emit('cancel');
  emit('update:modelValue', false);
};

const handleConfirm = () => {
  internalModelValue.value = false;
  if (resolvePromise.value) resolvePromise.value(true);
  emit('confirm');
};

defineExpose({ open });
</script>

<style scoped>
.confirm-dialog {
  background-color: white !important;
}

.gap-3 {
  gap: 12px;
}

.error-lighten-5 {
  background-color: #fff5f5 !important;
}

.primary-lighten-5 {
  background-color: #f0f7ff !important;
}
</style>
