<script setup>
const props = defineProps({
  modelValue: {
    type: [String, Number, Boolean, Array, Object],
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
  type: {
    type: String,
    required: false,
  },
  autocomplete: {
    type: String,
    required: false,
  },
  autofocus: {
    type: Boolean,
    required: false,
  },
});

const emit = defineEmits(['update:modelValue']);
</script>

<template>
  <v-text-field
    v-bind="$attrs"
    v-model="modelValue"
    :label="label"
    :rules="rules"
    :type="type"
    :autocomplete="autocomplete"
    :autofocus="autofocus"
    hide-details="auto"
    @update:modelValue="value => emit('update:modelValue', value)"
  />
</template>
