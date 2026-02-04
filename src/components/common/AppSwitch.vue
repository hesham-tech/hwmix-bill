<template>
  <v-switch
    v-model="internalValue"
    :label="label"
    :color="color"
    :loading="loading"
    :disabled="disabled"
    :density="density"
    :inset="inset"
    :hide-details="hideDetails"
    v-bind="$attrs"
    @update:model-value="handleUpdate"
  >
    <!-- Pass through all slots -->
    <template v-for="(_, name) in $slots" #[name]="slotProps">
      <slot :name="name" v-bind="slotProps" />
    </template>
  </v-switch>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  modelValue: {
    type: [Boolean, Array, Number, String],
    default: false,
  },
  label: {
    type: String,
    default: '',
  },
  color: {
    type: String,
    default: 'success', // Default color for the project
  },
  loading: {
    type: [Boolean, String],
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  density: {
    type: String,
    default: 'comfortable',
  },
  inset: {
    type: Boolean,
    default: true,
  },
  hideDetails: {
    type: [Boolean, String],
    default: 'auto',
  },
});

const emit = defineEmits(['update:modelValue', 'change']);

const internalValue = computed({
  get: () => props.modelValue,
  set: val => {
    emit('update:modelValue', val);
    emit('change', val);
  },
});

const handleUpdate = val => {
  // Logic if needed on update
};
</script>

<style scoped>
/* Add any global switch styling here if needed */
</style>
