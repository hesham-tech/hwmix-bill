<template>
  <div class="transactions-page">
    <v-container fluid class="pa-0">
      <v-row class="ma-0">
        <v-col cols="12" class="pa-0">
          <v-card rounded="md" class="border shadow-sm">
            <AppDataTable
              v-model:sort-by="sortByVuetify"
              v-model:search="searchText"
              :filters="advancedFilters"
              :items-per-page="20"
              :headers="headers"
              :items="transactions || []"
              :total-items="totalItems || 0"
              :loading="loading"
              :table-height="'calc(100vh - 220px)'"
              permission-module="transactions"
              title="سجل المعاملات المالية"
              subtitle="متابعة كافة عمليات الإيداع، السحب، والتحويلات"
              icon="ri-exchange-funds-line"
              @update:filters="applyFilters"
              @update:options="onTableOptionsUpdate"
              @load="handleLoadMore"
            >
              <template #item.type="{ item }">
                <v-chip :color="getTypeColor(item.type)" size="small" variant="tonal" class="font-weight-bold">
                  <v-icon :icon="getTypeIcon(item.type)" start size="14" />
                  {{ getTypeLabel(item.type) }}
                </v-chip>
              </template>

              <template #item.user="{ item }">
                <AppUserBalanceProfile
                  v-if="item.user"
                  :user="item.user"
                  mode="horizontal"
                  hide-balance
                  dense
                  @click="$router.push(`/app/users/${item.user.id}`)"
                />
                <span v-else class="text-grey italic">غير معروف</span>
              </template>

              <template #item.amount="{ item }">
                <div class="text-right">
                  <span :class="item.amount < 0 ? 'text-error' : 'text-success'" class="font-weight-bold">
                    {{ formatCurrency(Math.abs(item.amount)) }}
                  </span>
                </div>
              </template>

              <template #item.created_at="{ item }">
                <div class="text-caption text-grey">
                  {{ formatDateTime(item.created_at) }}
                </div>
              </template>
            </AppDataTable>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useDataTable } from '@/composables/useDataTable';
import { transactionService } from '@/api';
import { AppDataTable, AppUserBalanceProfile } from '@/components';
import { formatCurrency, formatDateTime } from '@/utils/formatters';

// API fetch function
const fetchTransactionsApi = async params => {
  return await transactionService.getAll(params, { showToast: false });
};

// DataTable Logic
const {
  items: transactions,
  loading,
  currentPage: page,
  total: totalItems,
  lastPage,
  search: searchText,
  filters,
  sortByVuetify,
  changeSort,
  applyFilters,
  fetchData,
} = useDataTable(fetchTransactionsApi, {
  syncWithUrl: true,
  initialSortBy: 'created_at',
  initialSortOrder: 'desc',
  immediate: true,
});

const onTableOptionsUpdate = options => {
  changeSort(options);
};

const handleLoadMore = () => {
  if (loading.value || transactions.value.length >= totalItems.value || page.value >= (lastPage.value || Infinity)) return;
  page.value++;
  fetchData({ append: true });
};

const headers = [
  { title: 'العملية', key: 'type', sortable: true },
  { title: 'المستخدم / العميل', key: 'user', sortable: false },
  { title: 'المبلغ', key: 'amount', sortable: true, align: 'end' },
  { title: 'البيان / الوصف', key: 'description', sortable: false },
  { title: 'التاريخ', key: 'created_at', sortable: true },
];

const advancedFilters = [
  {
    key: 'type',
    title: 'نوع العملية',
    type: 'select',
    items: [
      { title: 'إيداع', value: 'deposit' },
      { title: 'سحب', value: 'withdraw' },
      { title: 'تحويل صادر', value: 'transfer_out' },
      { title: 'تحويل وارد', value: 'transfer_in' },
      { title: 'مبيعات', value: 'invoice' },
    ],
  },
];

const getTypeLabel = type => {
  const labels = {
    deposit: 'إيداع رصيد',
    withdraw: 'سحب رصيد',
    transfer_out: 'تحويل صادر',
    transfer_in: 'تحويل وارد',
    invoice: 'فاتورة مبيعات',
    reversal: 'عكس عملية',
  };
  return labels[type] || type;
};

const getTypeColor = type => {
  const colors = {
    deposit: 'info',
    withdraw: 'error',
    transfer_out: 'warning',
    transfer_in: 'success',
    invoice: 'primary',
  };
  return colors[type] || 'grey';
};

const getTypeIcon = type => {
  const icons = {
    deposit: 'ri-qr-code-line',
    withdraw: 'ri-hand-coin-line',
    transfer_out: 'ri-arrow-right-up-line',
    transfer_in: 'ri-arrow-left-down-line',
    invoice: 'ri-file-list-3-line',
  };
  return icons[type] || 'ri-money-dollar-circle-line';
};
</script>

<style scoped>
.transactions-page :deep(.v-container) {
  max-width: 100% !important;
}
</style>
