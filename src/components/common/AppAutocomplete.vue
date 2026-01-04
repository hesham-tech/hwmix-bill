<template>
  <v-autocomplete
    v-model="selectedValue"
    :items="items"
    :item-title="itemTitle"
    :item-value="itemValue"
    :label="label"
    :rules="computedRules"
    :disabled="disabled"
    :loading="loading"
    :search="search"
    :clearable="clearable"
    :multiple="multiple"
    :chips="chips"
    :prepend-icon="prependIcon"
    :prepend-inner-icon="prependInnerIcon"
    :append-icon="appendIcon"
    :hint="hint"
    :persistent-hint="persistentHint"
    :density="density"
    :variant="variant"
    v-bind="$attrs"
    @update:model-value="handleChange"
    @update:search="$emit('update:search', $event)"
  >
    <template v-if="$slots.item" #item="slotProps">
      <slot name="item" v-bind="slotProps" />
    </template>

    <template v-if="$slots.selection" #selection="slotProps">
      <slot name="selection" v-bind="slotProps" />
    </template>

    <template v-if="$slots.prepend" #prepend>
      <slot name="prepend" />
    </template>

    <template v-if="$slots.append" #append>
      <slot name="append" />
    </template>
  </v-autocomplete>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
  modelValue: {
    type: [String, Number, Array, Object],
    default: null,
  },
  items: {
    type: Array,
    default: () => [],
  },
  itemTitle: {
    type: String,
    default: 'title',
  },
  itemValue: {
    type: String,
    default: 'value',
  },
  label: {
    type: String,
    default: '',
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
  loading: {
    type: Boolean,
    default: false,
  },
  search: {
    type: String,
    default: '',
  },
  clearable: {
    type: Boolean,
    default: true,
  },
  multiple: {
    type: Boolean,
    default: false,
  },
  chips: {
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

const emit = defineEmits(['update:modelValue', 'update:search']);

const selectedValue = ref(props.modelValue);

const computedRules = computed(() => {
  const rules = [...props.rules];

  if (props.required && !rules.some(rule => rule.toString().includes('required'))) {
    rules.unshift(v => {
      if (props.multiple) {
        return (v && v.length > 0) || 'هذا الحقل مطلوب';
      }
      return !!v || 'هذا الحقل مطلوب';
    });
  }

  return rules;
});

const handleChange = value => {
  emit('update:modelValue', value);
};

watch(
  () => props.modelValue,
  newVal => {
    selectedValue.value = newVal;
  }
);
</script>
