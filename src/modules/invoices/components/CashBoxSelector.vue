<template>
  <AppAutocomplete
    v-model="internalValue"
    :items="displayItems"
    item-title="name"
    item-value="id"
    :label="label"
    :loading="loading"
    density="comfortable"
    prepend-inner-icon="ri-wallet-line"
    :error-messages="errorMessages"
    :required="required"
    clearable
  >
    <template #item="{ props, item }">
      <v-list-item v-bind="props">
        <template #subtitle>
          <span class="text-caption">الرصيد: {{ formatCurrency(item.raw.balance) }}</span>
        </template>
      </v-list-item>
    </template>
  </AppAutocomplete>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useApi } from '@/composables/useApi';
import { formatCurrency } from '@/utils/formatters';

const props = defineProps({
  modelValue: {
    type: [Number, String],
    default: null,
  },
  label: {
    type: String,
    default: 'اختر الخزينة / الحساب *',
  },
  errorMessages: {
    type: Array,
    default: () => [],
  },
  required: {
    type: Boolean,
    default: false,
  },
  items: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['update:modelValue']);

const { get: getCashBoxes } = useApi('/api/cash-boxes');
const localCashBoxes = ref([]);
const loading = ref(false);

const internalValue = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val),
});

const displayItems = computed(() => {
  return props.items.length > 0 ? props.items : localCashBoxes.value;
});

const rules = computed(() => {
  return props.required ? [v => !!v || 'خانة الخزينة مطلوبة عند الدفع'] : [];
});

const loadCashBoxes = async () => {
  if (props.items.length > 0) return; // Don't fetch if items provided props

  loading.value = true;
  try {
    const response = await getCashBoxes({ current_user: 1, per_page: 100 });
    localCashBoxes.value = response.data || [];

    // Auto-select default cash box if exists and none selected
    if (!internalValue.value && localCashBoxes.value.length > 0) {
      const defaultBox = localCashBoxes.value.find(b => b.is_default);
      if (defaultBox) internalValue.value = defaultBox.id;
    }
  } catch (error) {
    console.error('Error loading cash boxes:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(loadCashBoxes);
</script>
