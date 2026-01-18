<template>
  <AppAutocomplete
    v-model="internalValue"
    :items="cashBoxes"
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
});

const emit = defineEmits(['update:modelValue']);

const { get: getCashBoxes } = useApi('/api/cash-boxes');
const cashBoxes = ref([]);
const loading = ref(false);

const internalValue = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val),
});

const rules = computed(() => {
  return props.required ? [v => !!v || 'خانة الخزينة مطلوبة عند الدفع'] : [];
});

const loadCashBoxes = async () => {
  loading.value = true;
  try {
    const response = await getCashBoxes({ current_user: 1, per_page: 100 });
    cashBoxes.value = response.data || [];

    // Auto-select default cash box if exists and none selected
    if (!internalValue.value && cashBoxes.value.length > 0) {
      const defaultBox = cashBoxes.value.find(b => b.is_default);
      if (defaultBox) internalValue.value = defaultBox.id;
    }
  } catch (error) {
    console.error('Error loading cash boxes:', error);
  } finally {
    loading.value = false;
  }
};

const formatCurrency = amount => {
  return new Intl.NumberFormat('ar-EG', {
    style: 'currency',
    currency: 'EGP',
  }).format(amount || 0);
};

onMounted(loadCashBoxes);
</script>
