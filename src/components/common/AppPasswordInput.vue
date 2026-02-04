<template>
  <v-text-field
    v-model="inputValue"
    :type="showPassword ? 'text' : 'password'"
    :append-inner-icon="showPassword ? 'ri-eye-off-line' : 'ri-eye-line'"
    v-bind="$attrs"
    @click:append-inner="showPassword = !showPassword"
    @update:model-value="handleInput"
    @blur="$emit('blur', $event)"
    @focus="$emit('focus', $event)"
  >
    <!-- Basic slots pass-through -->
    <template v-if="$slots.prependInner" #prepend-inner>
      <slot name="prepend-inner" />
    </template>

    <template v-if="$slots.prepend" #prepend>
      <slot name="prepend" />
    </template>

    <template v-if="$slots.append" #append>
      <slot name="append" />
    </template>
  </v-text-field>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: '',
  },
});

const emit = defineEmits(['update:modelValue', 'blur', 'focus']);

const inputValue = ref(props.modelValue);
const showPassword = ref(false);

const handleInput = value => {
  emit('update:modelValue', value);
};

// Watch for external changes
watch(
  () => props.modelValue,
  newVal => {
    inputValue.value = newVal;
  }
);
</script>

<style scoped>
/* Add any specific styles for password input if needed */
</style>
