<template>
  <div class="transactions-page">
    <v-container fluid class="pa-0">
      <v-row class="ma-0">
        <v-col cols="12" class="pa-0">
          <v-card rounded="md" class="border shadow-sm">
            <AppDataTable
            table-key="financial_transactions.index"
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
              :title="hideHeader ? '' : 'سجل المعاملات المالية'"
              :subtitle="hideHeader ? '' : 'متابعة كافة عمليات الإيداع، السحب، والتحويلات'"
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

              <template #item.creator="{ item }">
                <div class="d-flex flex-column py-1">
                  <AppUserBalanceProfile
                    v-if="item.creator"
                    :user="item.creator"
                    mode="horizontal"
                    hide-balance
                    dense
                    @click="$router.push(`/app/users/${item.creator.id}`)"
                  />
                  <span v-else class="text-grey italic">غير معروف</span>
                  <div v-if="item.employee_balance_before !== null" class="text-caption text-grey mt-1">
                    الخزينة: 
                    <span class="font-weight-medium">{{ formatCurrency(item.employee_balance_before) }}</span>
                    <v-icon icon="ri-arrow-left-line" size="10" class="mx-1" />
                    <span class="font-weight-medium text-success">{{ formatCurrency(item.employee_balance_after) }}</span>
                  </div>
                </div>
              </template>

              <template #item.user="{ item }">
                <div class="d-flex flex-column py-1">
                  <AppUserBalanceProfile
                    v-if="item.user"
                    :user="item.user"
                    mode="horizontal"
                    hide-balance
                    dense
                    @click="$router.push(`/app/users/${item.user.id}`)"
                  />
                  <span v-else class="text-grey italic">غير معروف</span>
                  <div v-if="item.client_balance_before !== null" class="text-caption text-grey mt-1">
                    الرصيد: 
                    <span class="font-weight-medium">{{ formatCurrency(item.client_balance_before) }}</span>
                    <v-icon icon="ri-arrow-left-line" size="10" class="mx-1" />
                    <span class="font-weight-medium text-primary">{{ formatCurrency(item.client_balance_after) }}</span>
                  </div>
                </div>
              </template>

              <template #item.amount="{ item }">
                <div class="text-right">
                  <span :class="item.amount < 0 ? 'text-error' : 'text-success'" class="font-weight-bold">
                    {{ formatCurrency(Math.abs(item.amount)) }}
                  </span>
                </div>
              </template>

              <template #item.reference="{ item }">
                <div class="d-flex flex-column">
                  <template v-if="item.source_invoice">
                    <v-btn
                      variant="text"
                      color="primary"
                      class="text-caption font-weight-bold pa-0 h-auto justify-start"
                      @click="$router.push(`/app/invoices/${item.source_invoice_id}`)"
                      prepend-icon="ri-file-list-3-line"
                      size="small"
                      style="min-width: unset; height: auto !important;"
                    >
                      فاتورة #{{ item.source_invoice.invoice_number }}
                    </v-btn>
                  </template>
                  <template v-else-if="item.source_installment">
                    <v-btn
                      variant="text"
                      color="warning"
                      class="text-caption font-weight-bold pa-0 h-auto justify-start"
                      @click="$router.push(`/app/installment-plans/${item.source_installment.installment_plan_id}`)"
                      prepend-icon="ri-calendar-todo-line"
                      size="small"
                      style="min-width: unset; height: auto !important;"
                    >
                      خطة قسط #{{ item.source_installment.installment_plan_id }}
                    </v-btn>
                  </template>
                  <span v-else-if="item.source_installment_id" class="text-caption text-grey">
                    قسط #{{ item.source_installment_id }}
                  </span>
                  <span v-else class="text-caption text-grey italic">لا يوجد</span>
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

const props = defineProps({
  userId: { type: [Number, String], default: null },
  hideHeader: { type: Boolean, default: false }
});

import { transactionService } from '@/api';
import { AppDataTable, AppUserBalanceProfile } from '@/components';
import { formatCurrency, formatDateTime } from '@/utils/formatters';

// API fetch function
const fetchTransactionsApi = async params => {
  const finalParams = { ...params };
  if (props.userId) finalParams.user_id = props.userId;
  return await transactionService.getAll(finalParams, { showToast: false });
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
  syncWithUrl: !props.userId,
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
  { title: 'الموظف / الخزينة', key: 'creator', sortable: false },
  { title: 'العميل / الطرف الآخر', key: 'user', sortable: false },
  { title: 'المبلغ', key: 'amount', sortable: true, align: 'end' },
  { title: 'المرجع', key: 'reference', sortable: false },
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
    reverse_transfer: 'عكس تحويل',
    reverse_deposit: 'عكس إيداع',
    reverse_withdraw: 'عكس سحب',
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
  if (type?.startsWith('reverse_')) return 'secondary';
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
  if (type?.startsWith('reverse_')) return 'ri-restart-line';
  return icons[type] || 'ri-money-dollar-circle-line';
};
</script>

<style scoped>
.transactions-page :deep(.v-container) {
  max-width: 100% !important;
}
</style>
