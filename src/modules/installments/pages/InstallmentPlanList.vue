<template>
  <div class="installment-plans-page">
    <AppPageHeader title="خطط التقسيط" subtitle="متابعة وإدارة جدول تحصيل الأقساط والمدفوعات الآجلة" icon="ri-calendar-schedule-line" sticky />

    <v-container fluid class="pt-0">
      <v-card rounded="md" class="border shadow-sm overflow-hidden mb-2">
        <AppDataTable
          :headers="headers"
          :items="plans"
          :loading="loading"
          :total-items="total"
          v-model:items-per-page="itemsPerPage"
          v-model:page="page"
          v-model:search="search"
          :filters="filtersConfig"
          show-view-toggle
          title="سجل خطط التقسيط"
          icon="ri-calendar-event-line"
          @update:options="handleOptionsUpdate"
          @update:filters="handleFiltersUpdate"
        >
          <!-- Grid View Slot -->
          <template #grid="{ items }">
            <v-col v-for="item in items" :key="item.id" cols="12" sm="6" md="4" lg="3">
              <v-card variant="outlined" class="mx-auto h-100 d-flex flex-column border-soft cursor-pointer shadow-sm-hover" @click="viewPlan(item)">
                <v-card-item class="pb-2">
                  <div class="d-flex justify-space-between align-center mb-1">
                    <span class="text-caption font-weight-bold text-primary">#{{ item.invoice?.invoice_number || item.invoice_number }}</span>
                    <v-chip :color="getStatusColor(item.status)" size="x-small" density="comfortable" class="font-weight-bold">
                      {{ getStatusLabel(item.status) }}
                    </v-chip>
                  </div>
                  <v-card-title class="pa-0 text-subtitle-2 font-weight-bold">
                    {{ item.customer?.name || item.customer_name || 'غير معروف' }}
                  </v-card-title>
                </v-card-item>

                <v-card-text class="pt-0 flex-grow-1">
                  <div class="d-flex align-center gap-2 mb-3 mt-1">
                    <v-progress-linear :model-value="getPaymentProgress(item)" :color="getProgressColor(item)" height="6" rounded>
                      <template #default="{ value }">
                        <span class="text-xxs font-weight-black" style="font-size: 8px">{{ Math.ceil(value) }}%</span>
                      </template>
                    </v-progress-linear>
                  </div>

                  <div class="d-flex justify-space-between text-caption mb-1">
                    <span class="text-grey">الإجمالي:</span>
                    <span class="font-weight-bold">{{ formatCurrency(item.total_amount) }}</span>
                  </div>
                  <div class="d-flex justify-space-between text-caption">
                    <span class="text-grey">المتبقي:</span>
                    <span class="text-error font-weight-bold">{{ formatCurrency(item.remaining_amount || item.total_amount - item.total_pay) }}</span>
                  </div>
                </v-card-text>

                <v-divider class="mx-4 opacity-50" />

                <v-card-actions class="pa-2 px-3">
                  <v-btn variant="text" size="x-small" color="info" @click.stop="viewPlan(item)">عرض</v-btn>
                  <v-spacer />
                  <v-btn variant="text" size="x-small" color="primary" @click.stop="editPlan(item)">تعديل</v-btn>
                </v-card-actions>
              </v-card>
            </v-col>
          </template>

          <!-- List View Slots -->
          <template #item.invoice="{ item }">
            <div class="d-flex flex-column py-2">
              <span
                v-if="item.invoice"
                class="font-weight-bold text-primary cursor-pointer hover-underline mb-1"
                @click="viewInvoice(item.invoice.id)"
              >
                فاتورة #{{ item.invoice.invoice_number }}
              </span>
              <div class="d-flex align-center gap-1">
                <v-icon icon="ri-user-line" size="12" class="text-grey" />
                <span class="text-caption text-grey">{{ item.customer?.name || item.invoice?.customer?.name || 'غير معروف' }}</span>
              </div>
              <div class="d-flex align-center gap-1 mt-1">
                <v-icon icon="ri-calendar-line" size="12" class="text-grey" />
                <span class="text-caption text-grey">{{ formatDate(item.start_date) }}</span>
              </div>
            </div>
          </template>

          <template #item.amounts="{ item }">
            <div class="d-flex flex-column gap-1 py-2 cursor-pointer" @click="viewPlan(item)">
              <div class="d-flex justify-space-between align-center">
                <span class="text-caption text-grey">الإجمالي:</span>
                <span class="font-weight-bold">{{ formatCurrency(item.total_amount) }}</span>
              </div>
              <div class="position-relative">
                <v-progress-linear :model-value="getPaymentProgress(item)" :color="getProgressColor(item)" height="20" rounded class="my-1" />
                <div class="position-absolute w-100 h-100 d-flex align-center justify-center" style="top: 0; left: 0">
                  <span class="text-caption font-weight-bold" style="color: white; text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5)">
                    {{ Math.round(getPaymentProgress(item)) }}%
                  </span>
                </div>
              </div>
              <div class="d-flex justify-space-between align-center">
                <span class="text-caption text-success">مدفوع: {{ formatCurrency(item.total_pay) }}</span>
                <span class="text-caption text-error">متبقي: {{ formatCurrency(item.remaining_amount) }}</span>
              </div>
            </div>
          </template>

          <template #item.installments="{ item }">
            <div class="d-flex flex-column gap-1 py-2">
              <v-chip size="small" variant="tonal" color="primary" class="font-weight-bold">
                <v-icon icon="ri-list-check" size="14" class="me-1" />
                {{ item.number_of_installments }} قسط
              </v-chip>
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
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useApi } from '@/composables/useApi';
import { usePermissions } from '@/composables/usePermissions';
import { formatCurrency } from '@/utils/formatters';
import AppPageHeader from '@/components/common/AppPageHeader.vue';
import AppDataTable from '@/components/common/AppDataTable.vue';

// --- Initialization ---
const { canAny } = usePermissions();
const router = useRouter();
const api = useApi('/api/installment-plans');

// --- State ---
const plans = ref([]);
const loading = ref(false);
const total = ref(0);
const page = ref(1);
const itemsPerPage = ref(10);
const search = ref('');
const filters = ref({});

// --- Configuration ---
const headers = [
  { title: 'المبالغ والتقدم', key: 'amounts', align: 'center', width: '250px' },
  { title: 'الفاتورة والعميل', key: 'invoice', width: '280px' },
  { title: 'الأقساط', key: 'installments', align: 'center', width: '140px' },
  { title: 'الحالة', key: 'status', align: 'center', width: '120px' },
];

const filtersConfig = [
  {
    key: 'status',
    title: 'الحالة',
    type: 'select',
    items: [
      { title: 'في الانتظار', value: 'pending' },
      { title: 'نشط', value: 'active' },
      { title: 'مدفوعة جزئياً', value: 'partially_paid' },
      { title: 'مدفوعة', value: 'paid' },
      { title: 'متأخرة', value: 'overdue' },
    ],
  },
  { key: 'start_date', title: 'تاريخ البدء', type: 'date' },
];

// --- Business Logic ---
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

// --- Actions ---
const loadData = async () => {
  loading.value = true;
  try {
    const params = {
      page: page.value,
      per_page: itemsPerPage.value,
      search: search.value,
      ...filters.value,
    };
    const response = await api.get(params, { showLoading: false });
    plans.value = response.data || [];
    total.value = response.total || 0;
  } finally {
    loading.value = false;
  }
};

const editPlan = item => console.log('Edit plan', item);
const viewPlan = plan => router.push(`/app/installment-plans/${plan.id}`);
const viewInvoice = invoiceId => router.push(`/app/invoices/${invoiceId}`);

const formatDate = dateString => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const handleFiltersUpdate = newFilters => {
  filters.value = newFilters;
  page.value = 1;
  loadData();
};

const handleOptionsUpdate = options => {
  page.value = options.page;
  itemsPerPage.value = options.itemsPerPage;
  loadData();
};

// --- Watchers ---
let searchTimeout;
watch(search, () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    page.value = 1;
    loadData();
  }, 500);
});

onMounted(loadData);
</script>

<style scoped>
.hover-underline:hover {
  text-decoration: underline;
}

.shadow-sm-hover {
  transition: box-shadow 0.3s ease;
}

.shadow-sm-hover:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05) !important;
}
</style>
