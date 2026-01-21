<template>
  <v-dialog
    :model-value="modelValue"
    :max-width="maxWidth"
    :persistent="persistent"
    :fullscreen="fullscreen"
    scrollable
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card>
      <!-- Dialog Header -->
      <v-card-title class="d-flex align-center justify-space-between bg-primary">
        <div class="d-flex align-center gap-2">
          <v-icon v-if="icon" :icon="icon" color="white" />
          <span class="text-white">{{ title }}</span>
        </div>

        <v-btn icon="ri-close-line" variant="text" color="white" @click="handleClose" />
      </v-card-title>

      <!-- Dialog Content -->
      <v-card-text class="pa-6">
        <slot />
      </v-card-text>

      <!-- Dialog Actions -->
      <v-card-actions v-if="showActions" class="px-6 pb-6 pt-0">
        <v-spacer />

        <template v-if="!hideActions && !$slots.actions">
          <v-btn v-if="showCancel" variant="outlined" color="grey" class="px-6" @click="handleCancel">
            {{ cancelText }}
          </v-btn>

          <v-btn v-if="showConfirm" variant="elevated" :color="confirmColor" :loading="loading" class="px-6" @click="handleConfirm">
            {{ confirmText }}
          </v-btn>
        </template>

        <div v-if="$slots.actions" class="w-100">
          <slot name="actions" />
        </div>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    default: '',
  },
  maxWidth: {
    type: [String, Number],
    default: 600,
  },
  persistent: {
    type: Boolean,
    default: false,
  },
  fullscreen: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  showActions: {
    type: Boolean,
    default: true,
  },
  hideActions: {
    type: Boolean,
    default: false,
  },
  showCancel: {
    type: Boolean,
    default: true,
  },
  showConfirm: {
    type: Boolean,
    default: true,
  },
  cancelText: {
    type: String,
    default: 'إلغاء',
  },
  confirmText: {
    type: String,
    default: 'حفظ',
  },
  confirmColor: {
    type: String,
    default: 'primary',
  },
});

const emit = defineEmits(['update:modelValue', 'close', 'cancel', 'confirm']);

const handleClose = () => {
  emit('close');
  emit('update:modelValue', false);
};

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
.w-100 {
  width: 100%;
}
:deep(.v-card-text),
:deep(.v-card-actions) {
  overflow-x: hidden !important;
}
</style>
