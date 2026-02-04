<template>
  <div class="form-field mb-4">
    <!-- Label -->
    <label v-if="label" class="text-body-2 font-weight-medium mb-2 d-block">
      {{ label }}
      <span v-if="required" class="text-error">*</span>
    </label>

    <!-- Input Slot -->
    <slot />

    <!-- Hint -->
    <div v-if="hint" class="text-caption text-grey-darken-1 mt-1">
      {{ hint }}
    </div>

    <!-- Error Messages -->
    <div v-if="errorMessages && errorMessages.length" class="text-caption text-error mt-1">
      {{ errorMessages[0] }}
    </div>
  </div>
</template>

<script setup>
defineProps({
  label: {
    type: String,
    default: '',
  },
  required: {
    type: Boolean,
    default: false,
  },
  hint: {
    type: String,
    default: '',
  },
  errorMessages: {
    type: Array,
    default: () => [],
  },
});
</script>
