<script setup>
const props = defineProps({
  modelValue: {
    type: [String, Number],
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
});

const emit = defineEmits(['update:modelValue']);
</script>

<template>
  <v-textarea
    v-bind="$attrs"
    v-model="modelValue"
    :label="label"
    :rules="rules"
    hide-details="auto"
    @update:modelValue="value => emit('update:modelValue', value)"
  />
</template>
