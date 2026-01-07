<template>
  <AppCard class="mb-6" title="تصفية الفواتير" icon="ri-filter-3-line">
    <template #actions>
      <AppButton v-if="hasActiveFilters" variant="text" color="error" prepend-icon="ri-close-circle-line" @click="resetAllFilters">
        مسح الكل
      </AppButton>
    </template>

    <v-row>
      <!-- البحث -->
      <v-col cols="12" md="4">
        <AppInput
          v-model="localFilters.search"
          label="بحث..."
          placeholder="رقم الفاتورة، اسم العميل، رقم الهاتف"
          prepend-inner-icon="ri-search-line"
          clearable
          @update:model-value="debouncedSearch"
        />
      </v-col>

      <!-- نوع الفاتورة -->
      <v-col cols="12" md="4">
        <v-select
          v-model="localFilters.invoice_type_id"
          :items="invoiceTypes"
          item-title="name"
          item-value="id"
          label="نوع الفاتورة"
          variant="outlined"
          density="comfortable"
          prepend-inner-icon="ri-file-copy-line"
          clearable
          hide-details
        />
      </v-col>

      <!-- الحالة -->
      <v-col cols="12" md="4">
        <v-select
          v-model="localFilters.status"
          :items="statusOptions"
          item-title="label"
          item-value="value"
          label="حالة الفاتورة"
          variant="outlined"
          density="comfortable"
          prepend-inner-icon="ri-checkbox-circle-line"
          clearable
          hide-details
        />
      </v-col>

      <!-- حالة الدفع -->
      <v-col cols="12" md="4">
        <v-select
          v-model="localFilters.payment_status"
          :items="paymentStatusOptions"
          item-title="label"
          item-value="value"
          label="حالة الدفع"
          variant="outlined"
          density="comfortable"
          prepend-inner-icon="ri-money-dollar-circle-line"
          clearable
          hide-details
        />
      </v-col>

      <!-- من تاريخ -->
      <v-col cols="12" md="4">
        <AppInput v-model="localFilters.date_from" type="date" label="من تاريخ" prepend-inner-icon="ri-calendar-line" clearable />
      </v-col>

      <!-- إلى تاريخ -->
      <v-col cols="12" md="4">
        <AppInput v-model="localFilters.date_to" type="date" label="إلى تاريخ" prepend-inner-icon="ri-calendar-line" clearable />
      </v-col>
    </v-row>

    <div class="d-flex gap-2 mt-4">
      <AppButton prepend-icon="ri-search-line" @click="applyFilters"> بحث وتصفية </AppButton>
      <AppButton variant="outlined" color="secondary" prepend-icon="ri-refresh-line" @click="resetAllFilters"> إعادة تعيين </AppButton>
    </div>
  </AppCard>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useApi } from '@/composables/useApi';
import AppCard from '@/components/common/AppCard.vue';
import AppButton from '@/components/common/AppButton.vue';
import AppInput from '@/components/common/AppInput.vue';

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(['update:modelValue', 'apply']);

// Local filters state
const localFilters = ref({
  search: '',
  invoice_type_id: null,
  status: null,
  payment_status: null,
  date_from: null,
  date_to: null,
  ...props.modelValue,
});

// API للحصول على أنواع الفواتير
const { get: getInvoiceTypes } = useApi('/api/invoice-types');
const invoiceTypes = ref([]);

// خيارات الحالات
const statusOptions = [
  { label: 'مسودة', value: 'draft' },
  { label: 'قيد الانتظار', value: 'pending' },
  { label: 'معتمدة', value: 'approved' },
  { label: 'ملغاة', value: 'cancelled' },
];

const paymentStatusOptions = [
  { label: 'غير مدفوعة', value: 'unpaid' },
  { label: 'مدفوعة جزئياً', value: 'partial' },
  { label: 'مدفوعة بالكامل', value: 'paid' },
];

// Check if there are active filters
const hasActiveFilters = computed(() => {
  return Object.values(localFilters.value).some(value => value !== null && value !== '');
});

// Debounce search
let searchTimeout;
const debouncedSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    applyFilters();
  }, 500);
};

// Apply filters
const applyFilters = () => {
  emit('update:modelValue', { ...localFilters.value });
  emit('apply', { ...localFilters.value });
};

// Reset filters
const resetAllFilters = () => {
  localFilters.value = {
    search: '',
    invoice_type_id: null,
    status: null,
    payment_status: null,
    date_from: null,
    date_to: null,
  };
  applyFilters();
};

// Load invoice types
const loadInvoiceTypes = async () => {
  try {
    const response = await getInvoiceTypes({}, { showLoading: false, showError: false });
    invoiceTypes.value = response.data || [];
  } catch (error) {
    console.error('Error loading invoice types:', error);
  }
};

// Watch for external changes
watch(
  () => props.modelValue,
  newValue => {
    localFilters.value = { ...newValue };
  },
  { deep: true }
);

// Load data on mount
onMounted(() => {
  loadInvoiceTypes();
});
</script>
