<template>
  <v-btn
    :color="color"
    :variant="variant"
    :size="size"
    :loading="loading"
    :disabled="disabled"
    :icon="icon ? true : false"
    :block="block"
    :rounded="rounded"
    :elevation="elevation"
    :prepend-icon="prependIcon"
    :append-icon="appendIcon"
    v-bind="$attrs"
    @click="$emit('click', $event)"
  >
    <v-icon v-if="icon" :icon="icon" />
    <slot v-else />
  </v-btn>
</template>

<script setup>
defineProps({
  color: {
    type: String,
    default: 'primary',
  },
  variant: {
    type: String,
    default: 'elevated',
  },
  size: {
    type: String,
    default: 'default',
  },
  loading: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  icon: {
    type: String,
    default: '',
  },
  block: {
    type: Boolean,
    default: false,
  },
  rounded: {
    type: [Boolean, String],
    default: false,
  },
  elevation: {
    type: [Number, String],
    default: undefined,
  },
  prependIcon: {
    type: String,
    default: '',
  },
  appendIcon: {
    type: String,
    default: '',
  },
});

defineEmits(['click']);
</script>
