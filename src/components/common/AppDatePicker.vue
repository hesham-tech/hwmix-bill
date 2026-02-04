<template>
  <v-menu v-model="menu" :close-on-content-click="false" transition="scale-transition" min-width="auto">
    <template #activator="{ props: menuProps }">
      <AppInput
        v-model="formattedDate"
        v-bind="{ ...menuProps, ...$attrs }"
        :label="label"
        readonly
        :placeholder="placeholder"
        prepend-inner-icon="ri-calendar-line"
        :rules="rules"
        :required="required"
        :disabled="disabled"
      />
    </template>
    <v-date-picker v-model="dateValue" color="primary" @update:model-value="handleDateChange" />
  </v-menu>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import AppInput from './AppInput.vue';

const props = defineProps({
  modelValue: {
    type: [String, Date],
    default: null,
  },
  label: {
    type: String,
    default: 'التاريخ',
  },
  placeholder: {
    type: String,
    default: 'اختر التاريخ',
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
});

const emit = defineEmits(['update:modelValue']);

const menu = ref(false);

const parseDate = val => {
  if (!val) return null;
  if (val instanceof Date) return val;
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d;
};

const dateValue = ref(parseDate(props.modelValue));

const formattedDate = computed(() => {
  if (!dateValue.value) return '';
  const d = dateValue.value;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
});

const handleDateChange = value => {
  const d = parseDate(value);
  if (d) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    emit('update:modelValue', dateStr);
    menu.value = false;
  }
};

watch(
  () => props.modelValue,
  newVal => {
    dateValue.value = parseDate(newVal);
  }
);
</script>
