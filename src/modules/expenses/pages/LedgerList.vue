<!--   صفحة دفتر الأستاذ العام - تعرض جميع الحركات المالية المسجلة في النظام -->

<template>
  <div class="ledger-list-page">
    <v-container fluid class="pa-0">
      <v-row class="ma-0">
        <v-col cols="12" class="pa-0">
          <v-card rounded="md" class="border shadow-sm">
            <AppDataTable
              table-key="ledger.index"
              v-model:sort-by="sortByVuetify"
              v-model:search="searchText"
              v-model:page="currentPage"
              v-model:items-per-page="perPage"
              :filters="advancedFilters"
              :headers="headers"
              :items="ledgerEntries || []"
              :total-items="totalItems || 0"
              :loading="loading"
              title="دفتر الأستاذ"
              subtitle="سجل تدقيق لجميع الحركات المالية داخل النظام"
              icon="ri-book-open-line"
              permission-module="financial_ledger"
              :can-create="false"
              @update:filters="applyFilters"
              @update:options="handleOptionsUpdate"
            >
              <!-- زر تصدير Excel في منطقة الإجراءات -->
              <template #actions>
                <AppButton
                  variant="outlined"
                  prepend-icon="ri-download-2-line"
                  color="success"
                  :loading="exportLoading"
                  size="small"
                  style="height: 28px"
                  class="px-2"
                  @click="handleExport"
                >
                  <span class="d-none d-sm-inline">تصدير Excel</span>
                </AppButton>
              </template>

              <!-- عمود النوع -->
              <template #item.type_label="{ item }">
                <v-chip size="small" :color="getTypeColor(item.type)" variant="tonal" class="font-weight-bold">
                  {{ item.type_label }}
                </v-chip>
              </template>

              <!-- عمود المبلغ -->
              <template #item.amount="{ item }">
                <span :class="item.amount < 0 ? 'text-error' : 'text-success'" class="font-weight-bold">
                  {{ formatCurrency(Math.abs(item.amount)) }}
                  <v-icon :icon="item.amount < 0 ? 'ri-arrow-down-line' : 'ri-arrow-up-line'" size="x-small" />
                </span>
              </template>

              <!-- عمود الرصيد بعد -->
              <template #item.balance_after="{ item }">
                <span class="font-weight-bold">{{ formatCurrency(item.balance_after) }}</span>
              </template>

              <!-- عمود المرجع -->
              <template #item.source_id="{ item }">
                <span class="text-caption text-grey">{{ item.source_id || '—' }}</span>
              </template>
            </AppDataTable>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup>
//   منطق صفحة دفتر الأستاذ وجلب بيانات الحركات المالية من API
import { ref } from 'vue';
import AppDataTable from '@/components/common/AppDataTable.vue';
import AppButton from '@/components/common/AppButton.vue';
import { formatCurrency } from '@/utils/formatters';
import { financialLedgerService } from '@/api';
import { useDataTable } from '@/composables/useDataTable';

const {
  items: ledgerEntries,
  loading,
  currentPage,
  perPage,
  total: totalItems,
  sortByVuetify,
  search: searchText,
  changeSort,
  applyFilters,
} = useDataTable(params => financialLedgerService.getAll(params), {
  syncWithUrl: true,
  initialSortBy: 'created_at',
  initialSortOrder: 'desc',
  immediate: true,
});

const exportLoading = ref(false);

const headers = [
  { title: 'التاريخ', key: 'created_at', sortable: true },
  { title: 'النوع', key: 'type_label', sortable: false },
  { title: 'المبلغ', key: 'amount', sortable: true, align: 'end' },
  { title: 'الرصيد بعد', key: 'balance_after', sortable: false, align: 'end' },
  { title: 'المرجع', key: 'source_id', sortable: false },
  { title: 'الملاحظات', key: 'description', sortable: false },
];

// فلاتر متقدمة مدمجة داخل AppDataTable تلقائياً
const advancedFilters = [
  {
    key: 'date_from',
    title: 'من تاريخ',
    type: 'date',
  },
  {
    key: 'date_to',
    title: 'إلى تاريخ',
    type: 'date',
  },
  {
    key: 'type',
    title: 'نوع الحركة',
    type: 'select',
    items: [
      { title: 'فاتورة مبيعات', value: 'sale' },
      { title: 'فاتورة مشتريات', value: 'purchase' },
      { title: 'مصروفات', value: 'expense' },
      { title: 'سداد دفعة', value: 'payment' },
      { title: 'إيداع', value: 'deposit' },
      { title: 'سحب', value: 'withdraw' },
      { title: 'تحويل', value: 'transfer' },
    ],
  },
];

const handleOptionsUpdate = options => {
  changeSort(options);
};

const handleExport = async () => {
  exportLoading.value = true;
  try {
    await financialLedgerService.export({});
  } finally {
    exportLoading.value = false;
  }
};

const getTypeColor = type => {
  const colors = {
    sale: 'success',
    purchase: 'info',
    expense: 'error',
    payment: 'warning',
    deposit: 'info',
    withdraw: 'error',
    transfer: 'orange',
  };
  return colors[type] || 'grey';
};
</script>
