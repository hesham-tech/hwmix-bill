<template>
  <v-date-picker
    v-model="dateValue"
    :label="label"
    :rules="rules"
    :disabled="disabled"
    :min="min"
    :max="max"
    :show-adjacent-months="showAdjacentMonths"
    v-bind="$attrs"
    @update:model-value="handleChange"
  />
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  modelValue: {
    type: [String, Date],
    default: null,
  },
  label: {
    type: String,
    default: 'التاريخ',
  },
  rules: {
    type: Array,
    default: () => [],
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  min: {
    type: String,
    default: undefined,
  },
  max: {
    type: String,
    default: undefined,
  },
  showAdjacentMonths: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(['update:modelValue']);

const dateValue = ref(props.modelValue);

const handleChange = value => {
  emit('update:modelValue', value);
};

watch(
  () => props.modelValue,
  newVal => {
    dateValue.value = newVal;
  }
);
</script>
