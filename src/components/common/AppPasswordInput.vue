<template>
  <v-text-field
    v-slot="vSlot"
    v-model="inputValue"
    :type="showPassword ? 'text' : 'password'"
    :append-inner-icon="showPassword ? 'ri-eye-off-line' : 'ri-eye-line'"
    v-bind="$attrs"
    @click:append-inner="showPassword = !showPassword"
    @update:model-value="handleInput"
    @blur="$emit('blur', $event)"
    @focus="$emit('focus', $event)"
  >
    <template v-for="(_, name) in $slots" #[name]="slotData">
      <slot :name="name" v-bind="slotData" />
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
