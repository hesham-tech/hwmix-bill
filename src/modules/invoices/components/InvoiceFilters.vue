<template>
  <AppCard class="mb-6 filter-card">
    <div class="pa-4 pb-0">
      <div class="d-flex align-center mb-4">
        <v-icon icon="ri-equalizer-line" color="primary" class="me-3" />
        <div class="text-h6 font-weight-bold">بحث متقدم</div>

        <v-chip v-if="hasActiveFilters" size="x-small" color="primary" class="ms-3 font-weight-bold"> مرشحات نشطة </v-chip>

        <v-spacer />

        <AppButton
          v-if="hasActiveFilters"
          variant="text"
          color="error"
          size="small"
          prepend-icon="ri-close-circle-line"
          @click.stop="resetAllFilters"
        >
          مسح الكل
        </AppButton>
      </div>

      <v-divider class="mb-6" />

      <v-row>
        <!-- نوع الفاتورة -->
        <v-col cols="12" sm="6" md="4">
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
        <v-col cols="6" sm="6" md="4">
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
        <v-col cols="6" sm="6" md="4">
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
        <v-col cols="6" sm="6" md="4">
          <AppInput v-model="localFilters.date_from" type="date" label="من تاريخ" prepend-inner-icon="ri-calendar-line" clearable />
        </v-col>

        <!-- إلى تاريخ -->
        <v-col cols="6" sm="6" md="4">
          <AppInput v-model="localFilters.date_to" type="date" label="إلى تاريخ" prepend-inner-icon="ri-calendar-line" clearable />
        </v-col>
      </v-row>

      <div class="d-flex flex-wrap gap-2 mt-4 pb-4">
        <AppButton flex-grow-1 prepend-icon="ri-filter-line" @click="applyFilters" class="flex-grow-1"> تطبيق الفلاتر </AppButton>
        <AppButton flex-grow-1 variant="outlined" color="secondary" prepend-icon="ri-refresh-line" @click="resetAllFilters" class="flex-grow-1">
          إعادة تعيين
        </AppButton>
      </div>
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
  { label: 'مدفوعة بزيادة', value: 'overpaid' },
];

// Check if there are active filters
const hasActiveFilters = computed(() => {
  return Object.keys(localFilters.value).some(key => {
    if (key === 'search') return false;
    const value = localFilters.value[key];
    return value !== null && value !== '';
  });
});

// Apply filters
const applyFilters = () => {
  emit('update:modelValue', { ...localFilters.value });
  emit('apply', { ...localFilters.value });
};

// Reset filters
const resetAllFilters = () => {
  localFilters.value = {
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

<style scoped>
.filter-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(0, 0, 0, 0.05) !important;
}

.filter-header {
  min-height: 64px;
  transition: background-color 0.2s ease;
}

.filter-header:hover {
  background-color: rgba(var(--v-theme-primary), 0.02);
}

.is-collapsed {
  box-shadow: none !important;
  background-color: #fafafa !important;
}

.gap-2 {
  gap: 8px;
}
</style>
