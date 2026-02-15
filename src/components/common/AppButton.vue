<template>
  <v-btn
    :color="color"
    :variant="variant"
    :size="size"
    :loading="loading"
    :disabled="disabled"
    :icon="!!(icon && !$slots.default)"
    :block="block"
    :rounded="rounded"
    :elevation="elevation"
    :prepend-icon="prependIcon"
    :append-icon="appendIcon"
    v-bind="$attrs"
    :class="{ 'mobile-friendly-btn': mobile }"
    @click="$emit('click', $event)"
  >
    <v-tooltip v-if="tooltip" activator="parent" location="top" open-on-hover open-on-click open-on-focus>
      {{ tooltip }}
    </v-tooltip>
    <!-- For icon-only buttons (icon prop without content) -->
    <v-icon v-if="typeof icon === 'string' && icon" :icon="icon" />
    <slot />
  </v-btn>
</template>

<script setup>
import { useDisplay } from 'vuetify';

const { mobile } = useDisplay();

defineProps({
  color: { type: String, default: 'primary' },
  variant: { type: String, default: 'elevated' },
  size: { type: String, default: 'default' },
  loading: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  tooltip: { type: String, default: '' },
  icon: { type: [String, Boolean], default: '' },
  block: { type: Boolean, default: false },
  rounded: { type: [Boolean, String], default: false },
  elevation: { type: [Number, String], default: undefined },
  prependIcon: { type: [String, Boolean], default: '' },
  appendIcon: { type: [String, Boolean], default: '' },
});

defineEmits(['click']);
</script>
