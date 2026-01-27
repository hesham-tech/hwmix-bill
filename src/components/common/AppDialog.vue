<template>
  <v-dialog
    :model-value="modelValue"
    :max-width="maxWidth"
    :persistent="persistent"
    :fullscreen="fullscreen"
    scrollable
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card class="app-dialog-card overflow-hidden">
      <!-- Premium Dialog Header -->
      <slot name="header">
        <header :class="['dialog-premium-header pa-5 d-flex align-center justify-space-between text-white', `variant-${variant}`]">
          <div class="d-flex align-center gap-3">
            <div v-if="icon" class="header-icon-wrapper d-flex align-center justify-center rounded-xl shadow-lg">
              <v-icon :icon="icon" color="white" size="24" />
            </div>
            <div class="header-text-container">
              <span class="text-h6 font-weight-black d-block title-text">{{ title }}</span>
              <span v-if="subtitle" class="text-caption d-block opacity-80 subtitle-text">{{ subtitle }}</span>
            </div>
          </div>

          <v-btn icon="ri-close-line" variant="tonal" color="white" class="close-btn-hover" density="comfortable" @click="handleClose" />
        </header>
      </slot>

      <!-- Dialog Content -->
      <v-card-text class="pa-0 dialog-content">
        <div class="pa-6">
          <slot />
        </div>
      </v-card-text>

      <!-- Dialog Actions -->
      <v-card-actions v-if="showActions" class="dialog-actions pa-5 bg-grey-lighten-5 border-t">
        <v-spacer />

        <div v-if="$slots.actions" class="w-100 d-flex justify-end gap-3">
          <slot name="actions" />
        </div>
        <template v-else-if="!hideActions">
          <v-btn v-if="showCancel" variant="tonal" color="grey-darken-1" class="px-6 font-weight-bold rounded-pill" @click="handleCancel">
            {{ cancelText }}
          </v-btn>

          <v-btn
            v-if="showConfirm"
            variant="flat"
            :color="confirmColor"
            :loading="loading"
            class="px-8 font-weight-black rounded-pill shadow-md"
            @click="handleConfirm"
          >
            <v-icon v-if="!loading" icon="ri-checkbox-circle-line" class="me-2" />
            {{ confirmText }}
          </v-btn>
        </template>
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
  subtitle: {
    type: String,
    default: '',
  },
  icon: {
    type: [String, Boolean],
    default: '',
  },
  maxWidth: {
    type: [String, Number],
    default: 800,
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
    default: 'تأكيد وحفظ',
  },
  confirmColor: {
    type: String,
    default: 'primary',
  },
  variant: {
    type: String,
    default: 'blue', // 'blue' or 'purple'
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
.app-dialog-card {
  border-radius: 28px !important;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25) !important;
}

.dialog-premium-header.variant-blue {
  background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
}

.dialog-premium-header.variant-purple {
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
}

.dialog-premium-header {
  position: relative;
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
}

.header-icon-wrapper {
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.25);
}

.title-text {
  letter-spacing: -0.5px !important;
  line-height: 1.2 !important;
}

.subtitle-text {
  font-weight: 500;
}

.close-btn-hover {
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.close-btn-hover:hover {
  background-color: rgba(239, 68, 68, 0.8) !important; /* Soft Red on hover */
  transform: rotate(90deg) scale(1.1);
}

.avatar-white-border {
  border: 2px solid rgba(255, 255, 255, 0.4) !important;
}

.dialog-content {
  background-color: #fff;
}

.dialog-actions {
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.gap-3 {
  gap: 12px;
}

.w-100 {
  width: 100%;
}

.shadow-md {
  box-shadow:
    0 4px 6px -1px rgb(0 0 0 / 0.1),
    0 2px 4px -2px rgb(0 0 0 / 0.1) !important;
}

:deep(.v-card-text) {
  overflow-x: hidden !important;
}

/* Ensure form rows inside dialog don't cause horizontal scroll */
:deep(.v-row) {
  margin-left: 0;
  margin-right: 0;
}
</style>
