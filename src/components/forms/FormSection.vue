<template>
  <v-card :class="sectionClass">
    <v-card-title v-if="title" class="d-flex align-center bg-grey-lighten-4">
      <v-icon v-if="icon" :icon="icon" class="me-2" />
      <span>{{ title }}</span>

      <v-spacer />

      <slot name="title-actions" />
    </v-card-title>

    <v-card-text :class="{ 'pa-6': !noPadding }">
      <slot />
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  title: {
    type: String,
    default: '',
  },
  icon: {
    type: String,
    default: '',
  },
  noPadding: {
    type: Boolean,
    default: false,
  },
  bordered: {
    type: Boolean,
    default: true,
  },
});

const sectionClass = computed(() => ({
  'mb-4': true,
  'elevation-0': true,
  border: props.bordered,
}));
</script>
