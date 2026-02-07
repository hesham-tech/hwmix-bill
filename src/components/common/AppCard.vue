<template>
  <v-card :elevation="elevation" :class="cardClass">
    <!-- Card Title with Icon -->
    <v-card-title v-if="title" class="d-flex align-center">
      <v-icon v-if="icon" :icon="icon" :color="iconColor" class="me-2" />
      <span>{{ title }}</span>

      <v-spacer />

      <slot name="title-actions" />
    </v-card-title>

    <!-- Card Subtitle -->
    <v-card-subtitle v-if="subtitle">
      {{ subtitle }}
    </v-card-subtitle>

    <!-- Card Content -->
    <v-card-text :class="contentClass">
      <slot />
    </v-card-text>

    <!-- Card Actions -->
    <v-card-actions v-if="$slots.actions">
      <slot name="actions" />
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  title: {
    type: String,
    default: '',
  },
  subtitle: {
    type: String,
    default: '',
  },
  icon: {
    type: [String, Boolean],
    default: '',
  },
  iconColor: {
    type: String,
    default: 'primary',
  },
  elevation: {
    type: [Number, String],
    default: 0,
  },
  flat: {
    type: Boolean,
    default: false,
  },
  outlined: {
    type: Boolean,
    default: false,
  },
  noPadding: {
    type: Boolean,
    default: false,
  },
});

const cardClass = computed(() => ({
  flat: props.flat,
  outlined: props.outlined,
}));

const contentClass = computed(() => ({
  'pa-0': props.noPadding,
}));
</script>
