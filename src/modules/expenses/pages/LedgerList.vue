<template>
  <div class="ledger-list-page">
    <AppPageHeader title="دفتر الأستاذ" subtitle="سجل تدقيق لجميع الحركات المالية داخل النظام" icon="ri-book-open-line">
      <template #controls>
        <v-col cols="12" md="4" lg="3">
          <AppInput
            v-model="filters.search"
            prepend-inner-icon="ri-search-line"
            placeholder="البحث في الملاحظات أو المرجع..."
            hide-details
            @update:model-value="handleSearch"
          />
        </v-col>

        <v-col cols="auto">
          <AppButton
            :variant="showAdvancedSearch ? 'tonal' : 'text'"
            prepend-icon="ri-filter-3-line"
            @click="showAdvancedSearch = !showAdvancedSearch"
          >
            فلترة متقدمة
          </AppButton>
        </v-col>

        <v-spacer />

        <v-col cols="auto">
          <AppButton variant="outlined" prepend-icon="ri-download-2-line" color="success" :loading="exportLoading" @click="handleExport">
            تصدير Excel
          </AppButton>
        </v-col>
      </template>
    </AppPageHeader>

    <v-expand-transition>
      <v-card v-if="showAdvancedSearch" class="mx-4 mb-4 pa-4 border-slate-50" flat>
        <v-row>
          <v-col cols="12" sm="6" md="3">
            <AppDatePicker v-model="filters.date_from" label="من تاريخ" clearable @update:model-value="handleAdvancedFilters" />
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <AppDatePicker v-model="filters.date_to" label="إلى تاريخ" clearable @update:model-value="handleAdvancedFilters" />
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <AppAutocomplete v-model="filters.type" :items="ledgerTypes" label="نوع الحركة" clearable @update:model-value="handleAdvancedFilters" />
          </v-col>
          <v-col cols="12" sm="6" md="3" class="d-flex align-end pb-3">
            <AppButton variant="text" color="error" @click="resetFilters">تصفية الكل</AppButton>
          </v-col>
        </v-row>
      </v-card>
    </v-expand-transition>

    <v-card class="mx-4 mt-2 border-slate-50" flat>
      <AppDataTable
        :headers="headers"
        :items="ledgerEntries"
        :loading="loading"
        :total-items="totalItems"
        v-model:page="currentPage"
        v-model:items-per-page="perPage"
        v-model:sort-by="sortByVuetify"
        @update:options="handleOptionsUpdate"
      >
        <template #[`item.type_label`]="{ item }">
          <v-chip size="small" :color="getTypeColor(item.type)" variant="tonal">
            {{ item.type_label }}
          </v-chip>
        </template>

        <template #[`item.amount`]="{ item }">
          <span :class="item.amount < 0 ? 'text-error' : 'text-success'" class="font-weight-bold">
            {{ formatCurrency(Math.abs(item.amount)) }}
            <v-icon :icon="item.amount < 0 ? 'ri-arrow-down-line' : 'ri-arrow-up-line'" size="x-small" />
          </span>
        </template>

        <template #[`item.balance_after`]="{ item }">
          <span class="font-weight-black">{{ formatCurrency(item.balance_after) }}</span>
        </template>
      </AppDataTable>
    </v-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import AppPageHeader from '@/components/common/AppPageHeader.vue';
import AppDataTable from '@/components/common/AppDataTable.vue';
import AppButton from '@/components/common/AppButton.vue';
import AppInput from '@/components/common/AppInput.vue';
import AppDatePicker from '@/components/common/AppDatePicker.vue';
import AppAutocomplete from '@/components/common/AppAutocomplete.vue';
import { formatCurrency } from '@/utils/formatters';
import { financialLedgerService } from '@/api';
import { useDataTable } from '@/composables/useDataTable';
import debounce from 'lodash/debounce';

const {
  items: ledgerEntries,
  loading,
  currentPage,
  perPage,
  total: totalItems,
  sortByVuetify,
  applyFilters,
  fetchData,
} = useDataTable(params => financialLedgerService.getAll(params), {
  initialSortBy: 'created_at',
  initialSortOrder: 'desc',
  immediate: false,
});

const exportLoading = ref(false);
const showAdvancedSearch = ref(false);

const filters = reactive({
  search: '',
  date_from: null,
  date_to: null,
  type: null,
});

const headers = [
  { title: 'التاريخ', key: 'created_at', sortable: true },
  { title: 'النوع', key: 'type_label', sortable: false },
  { title: 'المبلغ', key: 'amount', sortable: true, align: 'end' },
  { title: 'الرصيد بعد', key: 'balance_after', sortable: false, align: 'end' },
  { title: 'المرجع', key: 'source_id', sortable: false },
  { title: 'الملاحظات', key: 'description', sortable: false },
];

const ledgerTypes = [
  { title: 'فاتورة مبيعات', value: 'sale' },
  { title: 'فاتورة مشتريات', value: 'purchase' },
  { title: 'مصروفات', value: 'expense' },
  { title: 'سداد دفعة', value: 'payment' },
];

// fetchData is now provided by useDataTable

const handleSearch = debounce(() => {
  applyFilters({ ...filters });
}, 500);

const handleAdvancedFilters = () => {
  applyFilters({ ...filters });
};

const handleOptionsUpdate = options => {
  const { sortBy } = options;
  if (sortBy && sortBy.length > 0) {
    sortByVuetify.value = sortBy;
    fetchData();
  }
};

const resetFilters = () => {
  Object.assign(filters, { search: '', date_from: null, date_to: null, type: null });
  applyFilters({ ...filters });
};

const handleExport = async () => {
  exportLoading.value = true;
  await financialLedgerService.export(filters);
  exportLoading.value = false;
};

const getTypeColor = type => {
  const colors = {
    sale: 'success',
    purchase: 'info',
    expense: 'error',
    payment: 'warning',
  };
  return colors[type] || 'grey';
};

onMounted(() => {
  // Rely on AppDataTable update:options to fetch initial data
});
</script>

<style scoped>
.border-slate-50 {
  border: 1px solid #f1f5f9 !important;
}
</style>
