<template>
  <div class="installment-plans-page">
    <AppPageHeader title="خطط التقسيط" subtitle="متابعة وإدارة جدول تحصيل الأقساط والمدفوعات الآجلة" icon="ri-calendar-schedule-line" sticky>
      <template #controls>
        <v-col cols="12" md="8">
          <AppInput
            v-model="search"
            placeholder="بحث سريع في خطط التقسيط..."
            prepend-inner-icon="ri-search-line"
            clearable
            hide-details
            variant="solo-filled"
            density="comfortable"
            flat
            class="rounded-md"
            @update:model-value="debouncedSearch"
          />
        </v-col>
        <v-col cols="12" md="4" class="text-end">
          <AppButton
            variant="tonal"
            color="primary"
            prepend-icon="ri-equalizer-line"
            class="rounded-md font-weight-bold"
            @click="showAdvanced = !showAdvanced"
          >
            {{ showAdvanced ? 'إخفاء البحث المتقدم' : 'بحث متقدم' }}
          </AppButton>
        </v-col>
      </template>
    </AppPageHeader>

    <v-container fluid class="pt-0">
      <!-- Advanced Filters (Placeholder for consistency) -->
      <v-expand-transition>
        <div v-if="showAdvanced" class="mb-6">
          <v-card variant="tonal" color="primary" class="pa-4 rounded-md border-primary bg-primary-lighten-5">
            <div class="d-flex align-center gap-2">
              <v-icon icon="ri-information-line" />
              <span>البحث المتقدم لخطط التقسيط سيتم إضافته قريباً مع خيارات فلترة متقدمة.</span>
            </div>
          </v-card>
        </div>
      </v-expand-transition>
      <v-card rounded="md" class="border shadow-sm overflow-hidden mb-6">
        <AppDataTable
          :headers="headers"
          :items="plans"
          :loading="loading"
          :total-items="total"
          v-model:items-per-page="itemsPerPage"
          v-model:page="page"
          title="سجل خطط التقسيط"
          icon="ri-calendar-event-line"
          @update:options="handleOptionsUpdate"
        >
          <template #item.invoice="{ item }">
            <div class="d-flex flex-column py-2">
              <!-- Invoice Number -->
              <span
                v-if="item.invoice"
                class="font-weight-bold text-primary cursor-pointer hover-underline mb-1"
                @click="viewInvoice(item.invoice.id)"
              >
                فاتورة #{{ item.invoice.invoice_number }}
              </span>
              <!-- Customer Name -->
              <div class="d-flex align-center gap-1">
                <v-icon icon="ri-user-line" size="12" class="text-grey" />
                <span class="text-caption text-grey">{{ item.customer?.name || item.invoice?.customer?.name || 'غير معروف' }}</span>
              </div>
              <!-- Start Date -->
              <div class="d-flex align-center gap-1 mt-1">
                <v-icon icon="ri-calendar-line" size="12" class="text-grey" />
                <span class="text-caption text-grey">{{ formatDate(item.start_date) }}</span>
              </div>
            </div>
          </template>

          <template #item.amounts="{ item }">
            <div class="d-flex flex-column gap-1 py-2 cursor-pointer" @click="viewPlan(item)">
              <!-- Total Amount -->
              <div class="d-flex justify-space-between align-center">
                <span class="text-caption text-grey">الإجمالي:</span>
                <span class="font-weight-bold">{{ formatCurrency(item.total_amount) }}</span>
              </div>
              <!-- Progress Bar with Percentage -->
              <div class="position-relative">
                <v-progress-linear :model-value="getPaymentProgress(item)" :color="getProgressColor(item)" height="20" rounded class="my-1" />
                <div class="position-absolute w-100 h-100 d-flex align-center justify-center" style="top: 0; left: 0">
                  <span class="text-caption font-weight-bold" style="color: white; text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5)">
                    {{ Math.round(getPaymentProgress(item)) }}%
                  </span>
                </div>
              </div>
              <!-- Paid / Remaining -->
              <div class="d-flex justify-space-between align-center">
                <span class="text-caption text-success">مدفوع: {{ formatCurrency(item.total_pay) }}</span>
                <span class="text-caption text-error">متبقي: {{ formatCurrency(item.remaining_amount) }}</span>
              </div>
            </div>
          </template>

          <template #item.installments="{ item }">
            <div class="d-flex flex-column gap-1 py-2">
              <!-- Number of Installments -->
              <v-chip size="small" variant="tonal" color="primary" class="font-weight-bold">
                <v-icon icon="ri-list-check" size="14" class="me-1" />
                {{ item.number_of_installments }} قسط
              </v-chip>
              <!-- Installment Amount -->
              <div class="text-caption text-grey text-center mt-1">{{ formatCurrency(item.installment_amount) }} / شهرياً</div>
            </div>
          </template>

          <template #item.status="{ item }">
            <v-chip :color="getStatusColor(item.status)" size="small" variant="flat" class="font-weight-bold px-3">
              {{ item.status_label || getStatusLabel(item.status) }}
            </v-chip>
          </template>
        </AppDataTable>
      </v-card>
    </v-container>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useApi } from '@/composables/useApi';
import { usePermissions } from '@/composables/usePermissions';
import { PERMISSIONS } from '@/config/permissions';
import { formatCurrency } from '@/utils/formatters';
import AppPageHeader from '@/components/common/AppPageHeader.vue';
import AppDataTable from '@/components/common/AppDataTable.vue';
import AppButton from '@/components/common/AppButton.vue';
import AppInput from '@/components/common/AppInput.vue';

const { can, canAny } = usePermissions();

const router = useRouter();
const api = useApi('/api/installment-plans');

// State
const plans = ref([]);
const loading = ref(false);
const total = ref(0);
const page = ref(1);
const itemsPerPage = ref(10);
const search = ref('');
const showAdvanced = ref(false);

const headers = [
  { title: 'المبالغ والتقدم', key: 'amounts', align: 'center', width: '250px' },
  { title: 'الفاتورة والعميل', key: 'invoice', width: '280px' },
  { title: 'الأقساط', key: 'installments', align: 'center', width: '140px' },
  { title: 'الحالة', key: 'status', align: 'center', width: '120px' },
];

const getStatusColor = status => {
  const colors = {
    pending: 'warning',
    active: 'info',
    partially_paid: 'secondary',
    paid: 'success',
    completed: 'success',
    canceled: 'error',
    overdue: 'error',
  };
  return colors[status] || 'grey';
};

const getStatusLabel = status => {
  const labels = {
    pending: 'في الانتظار',
    active: 'نشط',
    partially_paid: 'مدفوعة جزئياً',
    paid: 'مدفوعة',
    completed: 'مكتمل',
    canceled: 'ملغي',
    overdue: 'متأخرة',
  };
  return labels[status] || status;
};

const viewPlan = plan => {
  router.push(`/app/installment-plans/${plan.id}`);
};

const viewInvoice = invoiceId => {
  router.push(`/app/invoices/${invoiceId}`);
};

const formatDate = dateString => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' });
};

const getPaymentProgress = item => {
  if (!item.total_amount || item.total_amount == 0) return 0;
  return (parseFloat(item.total_pay) / parseFloat(item.total_amount)) * 100;
};

const getProgressColor = item => {
  const progress = getPaymentProgress(item);
  if (progress >= 100) return 'success';
  if (progress >= 50) return 'info';
  if (progress >= 25) return 'warning';
  return 'error';
};

const loadData = async () => {
  loading.value = true;
  try {
    const params = {
      page: page.value,
      per_page: itemsPerPage.value,
      search: search.value,
    };
    const response = await api.get(params, { showLoading: false });
    plans.value = response.data || [];
    total.value = response.total || 0;
  } finally {
    loading.value = false;
  }
};

const handleOptionsUpdate = options => {
  page.value = options.page;
  itemsPerPage.value = options.itemsPerPage;
  loadData();
};

// Debounce search
let searchTimeout;
const debouncedSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    page.value = 1;
    loadData();
  }, 500);
};

onMounted(loadData);
</script>

<style scoped>
.installment-plans-page :deep(.v-container) {
  max-width: 100% !important;
}

.hover-underline:hover {
  text-decoration: underline;
}
</style>
