<template>
  <v-text-field
    v-model="inputValue"
    :label="label"
    :placeholder="placeholder"
    :type="type"
    :rules="computedRules"
    :disabled="disabled"
    :readonly="readonly"
    :clearable="clearable"
    :prepend-icon="prependIcon"
    :prepend-inner-icon="prependInnerIcon"
    :append-icon="appendIcon"
    :append-inner-icon="appendInnerIcon"
    :hint="hint"
    :persistent-hint="persistentHint"
    :density="density"
    :variant="variant"
    v-bind="$attrs"
    @update:model-value="handleInput"
    @blur="$emit('blur', $event)"
    @focus="$emit('focus', $event)"
  >
    <template v-if="$slots.prepend" #prepend>
      <slot name="prepend" />
    </template>

    <template v-if="$slots.append" #append>
      <slot name="append" />
    </template>
  </v-text-field>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: '',
  },
  label: {
    type: String,
    default: '',
  },
  placeholder: {
    type: String,
    default: '',
  },
  type: {
    type: String,
    default: 'text',
  },
  rules: {
    type: Array,
    default: () => [],
  },
  required: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  readonly: {
    type: Boolean,
    default: false,
  },
  clearable: {
    type: Boolean,
    default: false,
  },
  prependIcon: {
    type: String,
    default: '',
  },
  prependInnerIcon: {
    type: String,
    default: '',
  },
  appendIcon: {
    type: String,
    default: '',
  },
  appendInnerIcon: {
    type: String,
    default: '',
  },
  hint: {
    type: String,
    default: '',
  },
  persistentHint: {
    type: Boolean,
    default: false,
  },
  density: {
    type: String,
    default: 'default',
  },
  variant: {
    type: String,
    default: 'outlined',
  },
});

const emit = defineEmits(['update:modelValue', 'blur', 'focus']);

const inputValue = ref(props.modelValue);

// Auto-add required rule if needed
const computedRules = computed(() => {
  const rules = [...props.rules];

  if (props.required && !rules.some(rule => rule.toString().includes('required'))) {
    rules.unshift(v => !!v || 'هذا الحقل مطلوب');
  }

  return rules;
});

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
