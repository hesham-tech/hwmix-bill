<template>
  <v-dialog :model-value="modelValue || internalModelValue" max-width="480" persistent @update:model-value="$emit('update:modelValue', $event)">
    <v-card class="confirm-dialog rounded-md overflow-hidden shadow-xl border-0">
      <div class="pa-8 text-center position-relative">
        <!-- Abstract background pattern -->
        <div class="abstract-bg" :class="type === 'error' ? 'bg-error-light' : 'bg-primary-light'"></div>

        <v-avatar :color="type === 'error' ? 'error' : 'primary'" size="80" class="mb-6 elevation-4 relative-z">
          <v-icon :icon="icon || (type === 'error' ? 'ri-error-warning-fill' : 'ri-question-fill')" color="white" size="40" />
        </v-avatar>

        <h3 class="text-h5 font-weight-bold mb-3 relative-z">{{ title }}</h3>
        <p class="text-body-1 text-grey-darken-2 mb-0 relative-z">{{ message || subtitle }}</p>
      </div>

      <v-divider class="opacity-10" />

      <v-card-actions class="pa-6 bg-grey-lighten-5 d-flex gap-4">
        <v-btn variant="tonal" :color="cancelColor" class="flex-grow-1 font-weight-bold rounded-md" height="48" @click="handleCancel">
          {{ cancelText }}
        </v-btn>

        <v-btn
          variant="flat"
          :color="type === 'error' ? 'error' : confirmColor"
          class="flex-grow-1 font-weight-bold elevation-2 rounded-md shadow-md"
          height="48"
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

.relative-z {
  position: relative;
  z-index: 2;
}

.abstract-bg {
  position: absolute;
  top: -100px;
  right: -100px;
  width: 250px;
  height: 250px;
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.15;
  z-index: 1;
}

.bg-error-light {
  background-color: #ff5252;
}

.bg-primary-light {
  background-color: #1e88e5;
}

.gap-4 {
  gap: 16px;
}

.shadow-md {
  box-shadow:
    0 4px 6px -1px rgb(0 0 0 / 0.1),
    0 2px 4px -2px rgb(0 0 0 / 0.1) !important;
}
</style>
