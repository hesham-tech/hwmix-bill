<template>
  <div v-if="can(PERMISSIONS.PAYMENTS_VIEW_ALL)" class="installments-page">
    <AppPageHeader title="الأقساط" subtitle="متابعة جميع الأقساط المستحقة والتحصيلات" icon="ri-calendar-todo-line" sticky>
      <template #controls>
        <v-row align="center" class="w-100 mx-0">
          <v-col cols="12" md="8">
            <AppInput
              v-model="search"
              placeholder="بحث في الأقساط..."
              prepend-inner-icon="ri-search-line"
              clearable
              hide-details
              variant="solo-filled"
              density="comfortable"
              flat
              class="rounded-lg"
              @update:model-value="debouncedSearch"
            />
          </v-col>
          <v-col cols="12" md="4" class="text-end">
            <AppButton
              variant="tonal"
              color="primary"
              prepend-icon="ri-equalizer-line"
              class="rounded-lg font-weight-bold"
              @click="showAdvanced = !showAdvanced"
            >
              {{ showAdvanced ? 'إخفاء البحث المتقدم' : 'بحث متقدم' }}
            </AppButton>
          </v-col>
        </v-row>
      </template>
    </AppPageHeader>

    <v-container fluid class="pt-0">
      <!-- Advanced Filters -->
      <v-expand-transition>
        <div v-if="showAdvanced" class="mb-6">
          <InstallmentFilters v-model="filters" @apply="handleFiltersChange" />
        </div>
      </v-expand-transition>

      <AppDataTable
        :headers="headers"
        :items="installments"
        :loading="loading"
        :total-items="total"
        v-model:items-per-page="itemsPerPage"
        v-model:page="page"
        v-model:sort-by="sortByVuetify"
        @update:options="changeSort"
        title="قائمة الأقساط"
        icon="ri-list-check-line"
      >
        <template #item.plan="{ item }">
          <div v-if="item.plan?.invoice" class="py-2">
            <div class="font-weight-bold text-primary">فاتورة #{{ item.plan.invoice.invoice_number }}</div>
            <div class="text-caption text-grey">{{ item.plan.invoice.customer?.name }}</div>
          </div>
        </template>

        <template #item.amount="{ item }">
          <div class="font-weight-black text-body-1">{{ formatCurrency(item.amount) }}</div>
        </template>

        <template #item.due_date="{ item }">
          <div :class="[getDueDateClass(item.due_date, item.status), 'font-weight-medium']">
            {{ formatDate(item.due_date) }}
          </div>
        </template>

        <template #item.status="{ item }">
          <v-chip :color="getStatusColor(item.status)" size="small" variant="flat" class="font-weight-bold px-3">
            {{ getStatusLabel(item.status) }}
          </v-chip>
        </template>

        <template #extra-actions="{ item }">
          <AppButton
            v-if="item.status === 'pending' && can(PERMISSIONS.PAYMENTS_CREATE)"
            icon="ri-check-line"
            size="x-small"
            variant="text"
            color="success"
            tooltip="تحديد كمدفوع"
            @click="markAsPaid(item)"
          />
        </template>
      </AppDataTable>
    </v-container>
  </div>

  <!-- Access Denied State (Updated with AppButton) -->
  <div v-else class="pa-12 text-center d-flex flex-column align-center justify-center" style="min-height: 400px">
    <v-avatar size="100" color="error-lighten-5" class="mb-6">
      <v-icon icon="ri-lock-2-line" size="48" color="error" />
    </v-avatar>
    <h2 class="text-h4 font-weight-bold mb-2">عذراً، لا تملك الصلاحية</h2>
    <p class="text-body-1 text-grey mb-6">ليس لديك إذن للوصول إلى الأقساط. يرجى مراجعة المسؤول.</p>
    <AppButton to="/dashboard" color="primary" variant="tonal" prepend-icon="ri-home-4-line"> العودة للرئيسية </AppButton>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { usePermissions } from '@/composables/usePermissions';
import { useDataTable } from '@/composables/useDataTable';
import { useApi } from '@/composables/useApi';
import { PERMISSIONS } from '@/config/permissions';
import { formatCurrency, formatDate } from '@/utils/formatters';
import AppPageHeader from '@/components/common/AppPageHeader.vue';
import AppDataTable from '@/components/common/AppDataTable.vue';
import AppButton from '@/components/common/AppButton.vue';
import AppInput from '@/components/common/AppInput.vue';
import InstallmentFilters from '../components/InstallmentFilters.vue';

const { can } = usePermissions();
const api = useApi('/api/installments');

// API fetch function for useDataTable
const fetchInstallments = async params => {
  return await api.get(params, { showLoading: false });
};

// DataTable logic
const {
  items: installments,
  loading,
  currentPage: page,
  perPage: itemsPerPage,
  total,
  search,
  filters,
  sortBy,
  sortByVuetify,
  changePage,
  changePerPage,
  changeSort,
  applyFilters,
  refresh,
} = useDataTable(fetchInstallments, {
  syncWithUrl: true,
  initialSortBy: 'due_date',
  initialSortOrder: 'asc',
});

// UI State
const showAdvanced = ref(false);

const headers = [
  { title: 'الخطة (الفاتورة)', key: 'plan', sortable: false },
  { title: 'المبلغ', key: 'amount', align: 'end', sortable: true },
  { title: 'تاريخ الاستحقاق', key: 'due_date', sortable: true },
  { title: 'الحالة', key: 'status', sortable: true },
  { title: 'الإجراءات', key: 'actions', sortable: false, align: 'end' },
];

const getDueDateClass = (dueDate, status) => {
  if (status === 'paid') return 'text-success';
  if (status === 'cancelled') return 'text-grey';

  const today = new Date();
  const due = new Date(dueDate);
  if (due < today) return 'text-error font-weight-bold';
  return '';
};

const getStatusColor = status => {
  const colors = { pending: 'warning', paid: 'success', overdue: 'error', cancelled: 'grey' };
  return colors[status] || 'grey';
};

const getStatusLabel = status => {
  const labels = { pending: 'معلق', paid: 'مدفوع', overdue: 'متأخر', cancelled: 'ملغي' };
  return labels[status] || status;
};

const markAsPaid = async installment => {
  try {
    await api.update(installment.id, { status: 'paid' }, { successMessage: 'تم تسجيل الدفع بنجاح' });
    refresh();
  } catch (error) {
    console.error('Error marking installment as paid:', error);
  }
};

const handleFiltersChange = newFilters => {
  applyFilters(newFilters);
};

// Debounce search
let searchTimeout;
const debouncedSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    applyFilters();
  }, 500);
};
</script>

<style scoped>
.installments-page :deep(.v-container) {
  max-width: 100% !important;
}
</style>
