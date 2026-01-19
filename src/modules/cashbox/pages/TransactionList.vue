<template>
  <div v-if="can(PERMISSIONS.TRANSACTIONS_VIEW_ALL)" class="transactions-page">
    <AppPageHeader title="حركات الخزينة" subtitle="سجل وتدقيق جميع المعاملات المالية الصادرة والواردة" icon="ri-exchange-line" sticky>
      <template #controls>
        <v-row align="center" class="w-100 mx-0">
          <v-col cols="12" md="8">
            <AppInput
              v-model="search"
              placeholder="بحث في الحركات..."
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
          <TransactionFilters v-model="filters" :cash-boxes="cashBoxes" @apply="handleFiltersChange" />
        </div>
      </v-expand-transition>

      <AppDataTable
        :headers="headers"
        :items="transactions"
        :loading="loading"
        :total-items="total"
        v-model:items-per-page="itemsPerPage"
        v-model:page="page"
        v-model:sort-by="sortByVuetify"
        title="المعاملات المالية الأخيرة"
        icon="ri-history-line"
        @update:options="changeSort"
      >
        <template #item.type="{ item }">
          <v-chip :color="item.type === 'income' ? 'success' : 'error'" size="small" variant="flat" class="font-weight-bold px-3">
            <v-icon :icon="item.type === 'income' ? 'ri-arrow-left-down-line' : 'ri-arrow-right-up-line'" size="14" class="me-1" />
            {{ item.type === 'income' ? 'إيداع نقدية' : 'سحب نقدية' }}
          </v-chip>
        </template>

        <template #item.cash_box="{ item }">
          <div class="d-flex align-center py-2">
            <v-avatar color="primary-lighten-5" size="32" rounded="lg" class="me-3">
              <v-icon icon="ri-safe-2-line" size="18" color="primary" />
            </v-avatar>
            <span class="font-weight-bold text-slate-700">{{ item.cash_box?.name || 'خزينة غير محددة' }}</span>
          </div>
        </template>

        <template #item.amount="{ item }">
          <div class="text-end font-weight-black text-body-1" :class="item.type === 'income' ? 'text-success' : 'text-error'">
            {{ item.type === 'income' ? '+' : '-' }} {{ formatCurrency(item.amount) }}
          </div>
        </template>

        <template #item.date="{ item }">
          <div class="d-flex flex-column py-1">
            <span class="font-weight-bold text-slate-800">{{ formatDate(item.transaction_date) }}</span>
            <span class="text-caption text-grey">{{ formatTime(item.transaction_date) }}</span>
          </div>
        </template>

        <template #item.description="{ item }">
          <span class="text-body-2 text-wrap d-inline-block py-1" style="max-width: 300px; line-height: 1.4">
            {{ item.description || 'لا يوجد وصف' }}
          </span>
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
    <p class="text-body-1 text-grey mb-6">ليس لديك إذن للوصول إلى حركات الخزينة. يرجى مراجعة المسؤول.</p>
    <AppButton to="/dashboard" color="primary" variant="tonal" prepend-icon="ri-home-4-line"> العودة للرئيسية </AppButton>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { usePermissions } from '@/composables/usePermissions';
import { useDataTable } from '@/composables/useDataTable';
import { useApi } from '@/composables/useApi';
import { PERMISSIONS } from '@/config/permissions';
import { formatCurrency, formatDate, formatTime } from '@/utils/formatters';
import AppPageHeader from '@/components/common/AppPageHeader.vue';
import AppDataTable from '@/components/common/AppDataTable.vue';
import AppButton from '@/components/common/AppButton.vue';
import AppInput from '@/components/common/AppInput.vue';
import TransactionFilters from '../components/TransactionFilters.vue';

const { can } = usePermissions();
const api = useApi('/api/transactions');
const cashBoxesApi = useApi('/api/cash-boxes');

// API fetch function for useDataTable
const fetchTransactions = async params => {
  return await api.get(params, { showLoading: false });
};

// DataTable logic
const {
  items: transactions,
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
} = useDataTable(fetchTransactions, {
  syncWithUrl: true,
  initialSortBy: 'transaction_date',
  initialSortOrder: 'desc',
});

// Extra state
const cashBoxes = ref([]);
const showAdvanced = ref(false);

const loadCashBoxes = async () => {
  try {
    const response = await cashBoxesApi.get({ per_page: 100 }, { showLoading: false });
    cashBoxes.value = response.data || [];
  } catch (error) {
    console.error('Error loading cashboxes:', error);
  }
};

const headers = [
  { title: 'النوع', key: 'type', sortable: true },
  { title: 'الخزينة', key: 'cash_box', sortable: false },
  { title: 'المبلغ', key: 'amount', align: 'end', sortable: true },
  { title: 'التاريخ', key: 'transaction_date', sortable: true },
  { title: 'الوصف', key: 'description', sortable: false },
];

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

onMounted(() => {
  loadCashBoxes();
});
</script>

<style scoped>
.transactions-page :deep(.v-container) {
  max-width: 100% !important;
}

.text-slate-800 {
  color: #1e293b !important;
}
.text-slate-700 {
  color: #334155 !important;
}
</style>
