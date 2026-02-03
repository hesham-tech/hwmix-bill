<script setup>
const props = defineProps({
  modelValue: {
    type: [String, Number, Array, Object],
    required: false,
  },
  label: {
    type: String,
    required: false,
  },
  rules: {
    type: Array,
    required: false,
  },
  items: {
    type: Array,
    required: false,
  },
});

const emit = defineEmits(['update:modelValue']);
</script>

<template>
  <v-select
    v-bind="$attrs"
    v-model="modelValue"
    :label="label"
    :rules="rules"
    :items="items"
    hide-details="auto"
    @update:modelValue="value => emit('update:modelValue', value)"
  />
</template>
