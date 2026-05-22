<script setup>
/**
 * AppFieldHelp.vue
 * أيقونة مساعدة صغيرة توضع بجوار الحقول لعرض شرح إضافي عند النقر أو التمرير.
 */
defineProps({
  text: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    default: '',
  },
  icon: {
    type: String,
    default: 'ri-question-line',
  },
  color: {
    type: String,
    default: 'grey-darken-1',
  },
  size: {
    type: [String, Number],
    default: 16,
  },
  location: {
    type: String,
    default: 'top',
  }
});
</script>

<template>
  <v-tooltip :location="location" max-width="280" content-class="field-help-tooltip">
    <template #activator="{ props }">
      <v-icon
        v-bind="props"
        :icon="icon"
        :color="color"
        :size="size"
        class="field-help-icon ms-1 cursor-help"
      />
    </template>
    <div class="field-help-content pa-1">
      <div v-if="title" class="font-weight-bold text-subtitle-2 mb-1 text-primary">
        {{ title }}
      </div>
      <div class="text-caption" style="line-height: 1.5;">
        {{ text }}
      </div>
    </div>
  </v-tooltip>
</template>

<style scoped>
.field-help-icon {
  opacity: 0.7;
  transition: opacity 0.2s, transform 0.2s;
  vertical-align: middle;
  pointer-events: auto !important;
}
.field-help-icon:hover {
  opacity: 1;
  transform: scale(1.1);
}
</style>

<style>
/* Global tooltip styling */
.field-help-tooltip {
  background: rgba(var(--v-theme-surface), 0.95) !important;
  backdrop-filter: blur(12px) !important;
  border: 1px solid rgba(var(--v-border-color), 0.16) !important;
  color: rgb(var(--v-theme-on-surface)) !important;
  border-radius: 10px !important;
  padding: 8px 12px !important;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12) !important;
}
</style>
