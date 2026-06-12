<!-- صفحة دفتر الأستاذ العام - تعرض جميع الحركات المالية المسجلة في النظام -->

<template>
  <div class="ledger-list-page">
    <!-- ترويسة الصفحة -->
    <AppPageHeader
      title="دفتر الأستاذ"
      subtitle="سجل تدقيق شامل لجميع الحركات المالية داخل النظام"
      icon="ri-book-open-line"
      sticky
    >
      <template #append>
        <div class="d-flex align-center ga-2">
          <AppButton
            variant="outlined"
            prepend-icon="ri-download-2-line"
            color="success"
            :loading="exportLoading"
            @click="handleExport"
          >
            <span class="d-none d-sm-inline">تصدير Excel</span>
          </AppButton>
          <AppButton
            :variant="showFilters ? 'tonal' : 'outlined'"
            prepend-icon="ri-filter-3-line"
            color="primary"
            @click="showFilters = !showFilters"
          >
            <span class="d-none d-sm-inline">فلترة</span>
            <v-chip
              v-if="activeFiltersCount > 0"
              size="x-small"
              color="primary"
              class="ms-1"
            >
              {{ activeFiltersCount }}
            </v-chip>
          </AppButton>
        </div>
      </template>
    </AppPageHeader>

    <v-container fluid class="pa-3 pa-md-4">

      <!-- بطاقات الملخص -->
      <v-row class="mb-4" dense>
        <v-col cols="6" sm="3">
          <v-card class="summary-card summary-card--total pa-3" rounded="lg" flat>
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-caption text-medium-emphasis mb-1">إجمالي القيود</div>
                <div class="text-h6 font-weight-bold">{{ totalItems?.toLocaleString('ar') || '0' }}</div>
              </div>
              <v-avatar style="background-color: #eff6ff !important;" size="40" rounded="lg">
                <v-icon icon="ri-book-2-line" color="primary" size="22" />
              </v-avatar>
            </div>
          </v-card>
        </v-col>
        <v-col cols="6" sm="3">
          <v-card class="summary-card summary-card--income pa-3" rounded="lg" flat>
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-caption text-medium-emphasis mb-1">إيرادات الصفحة</div>
                <div class="text-h6 font-weight-bold text-success">{{ formatCurrency(pageIncome) }}</div>
              </div>
              <v-avatar style="background-color: #ecfdf5 !important;" size="40" rounded="lg">
                <v-icon icon="ri-arrow-left-down-line" color="success" size="22" />
              </v-avatar>
            </div>
          </v-card>
        </v-col>
        <v-col cols="6" sm="3">
          <v-card class="summary-card summary-card--expense pa-3" rounded="lg" flat>
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-caption text-medium-emphasis mb-1">مصروفات الصفحة</div>
                <div class="text-h6 font-weight-bold text-error">{{ formatCurrency(pageExpense) }}</div>
              </div>
              <v-avatar style="background-color: #fef2f2 !important;" size="40" rounded="lg">
                <v-icon icon="ri-arrow-right-up-line" color="error" size="22" />
              </v-avatar>
            </div>
          </v-card>
        </v-col>
        <v-col cols="6" sm="3">
          <v-card class="summary-card pa-3" rounded="lg" flat :class="pageNet >= 0 ? 'summary-card--positive' : 'summary-card--negative'">
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-caption text-medium-emphasis mb-1">صافي الصفحة</div>
                <div class="text-h6 font-weight-bold" :class="pageNet >= 0 ? 'text-success' : 'text-error'">
                  {{ pageNet >= 0 ? '+' : '' }}{{ formatCurrency(pageNet) }}
                </div>
              </div>
              <v-avatar :style="{ backgroundColor: pageNet >= 0 ? '#ecfdf5 !important' : '#fef2f2 !important' }" size="40" rounded="lg">
                <v-icon :icon="pageNet >= 0 ? 'ri-trending-up-line' : 'ri-trending-down-line'" :color="pageNet >= 0 ? 'success' : 'error'" size="22" />
              </v-avatar>
            </div>
          </v-card>
        </v-col>
      </v-row>

      <!-- لوحة الفلاتر المتقدمة -->
      <v-expand-transition>
        <v-card v-show="showFilters" class="mb-4 filter-panel" rounded="lg" flat border>
          <v-card-text class="pa-4">
            <v-row dense>
              <v-col cols="12" sm="6" md="3">
                <AppDatePicker
                  v-model="filters.date_from"
                  label="من تاريخ"
                  clearable
                  prepend-inner-icon="ri-calendar-2-line"
                  @update:model-value="handleFiltersChange"
                />
              </v-col>
              <v-col cols="12" sm="6" md="3">
                <AppDatePicker
                  v-model="filters.date_to"
                  label="إلى تاريخ"
                  clearable
                  prepend-inner-icon="ri-calendar-check-line"
                  @update:model-value="handleFiltersChange"
                />
              </v-col>
              <v-col cols="12" sm="6" md="3">
                <AppAutocomplete
                  v-model="filters.type"
                  :items="typeFilterItems"
                  item-title="title"
                  item-value="value"
                  label="نوع الحركة"
                  clearable
                  prepend-inner-icon="ri-exchange-line"
                  @update:model-value="handleFiltersChange"
                />
              </v-col>
              <v-col cols="12" sm="6" md="3" class="d-flex align-end pb-1">
                <AppButton
                  variant="text"
                  color="error"
                  prepend-icon="ri-refresh-line"
                  @click="resetFilters"
                >
                  إعادة تعيين
                </AppButton>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-expand-transition>

      <!-- الجدول الرئيسي -->
      <v-card rounded="lg" flat border class="ledger-table-card">
        <AppDataTable
          table-key="ledger.index"
          v-model:sort-by="sortByVuetify"
          v-model:search="searchText"
          v-model:page="currentPage"
          v-model:items-per-page="perPage"
          :headers="headers"
          :items="ledgerEntries || []"
          :total-items="totalItems || 0"
          :loading="loading"
          title="الحركات المالية"
          icon="ri-history-line"
          permission-module="financial_ledger"
          :can-create="false"
          @update:options="handleOptionsUpdate"
        >
          <!-- عمود التاريخ -->
          <template #item.entry_date="{ item }">
            <div class="d-flex flex-column py-1">
              <span class="font-weight-semibold text-slate-800 text-body-2">
                {{ formatDate(item.entry_date || item.created_at) }}
              </span>
              <span class="text-caption text-medium-emphasis">
                {{ formatTime(item.entry_date || item.created_at) }}
              </span>
            </div>
          </template>

          <!-- عمود النوع -->
          <template #item.type_label="{ item }">
            <v-chip
              size="small"
              :color="getTypeColor(item.type)"
              variant="tonal"
              class="font-weight-bold ledger-type-chip"
            >
              <v-icon :icon="getTypeIcon(item.type)" size="13" class="me-1" />
              {{ item.type_label || getTypeFallbackLabel(item.type) }}
            </v-chip>
          </template>

          <!-- عمود المبلغ -->
          <template #item.amount="{ item }">
            <div
              class="d-flex align-center justify-end ga-1 font-weight-bold text-body-2"
              :class="isIncomeType(item.type) ? 'text-success' : 'text-error'"
            >
              <v-icon
                :icon="isIncomeType(item.type) ? 'ri-add-line' : 'ri-subtract-line'"
                size="14"
              />
              <span>{{ formatCurrency(Math.abs(item.amount)) }}</span>
            </div>
          </template>

          <!-- عمود الوصف -->
          <template #item.description="{ item }">
            <v-tooltip v-if="item.description && item.description.length > 40" :text="item.description" location="top">
              <template #activator="{ props: tooltipProps }">
                <span v-bind="tooltipProps" class="text-body-2 description-text">
                  {{ item.description.substring(0, 40) + '…' }}
                </span>
              </template>
            </v-tooltip>
            <span v-else class="text-body-2 text-medium-emphasis">
              {{ item.description || '—' }}
            </span>
          </template>

          <!-- عمود المرجع -->
          <template #item.source_id="{ item }">
            <div v-if="item.source_id" class="d-flex align-center ga-1">
              <v-chip
                size="x-small"
                variant="outlined"
                color="primary"
                class="reference-chip"
              >
                <v-icon icon="ri-hashtag" size="10" class="me-1" />
                {{ item.source_id }}
              </v-chip>
              <span v-if="item.source_type" class="text-caption text-medium-emphasis">
                {{ getSourceTypeLabel(item.source_type) }}
              </span>
            </div>
            <span v-else class="text-caption text-medium-emphasis">—</span>
          </template>

          <!-- عمود نوع الحساب -->
          <template #item.account_type="{ item }">
            <v-chip
              v-if="item.account_type"
              size="x-small"
              variant="flat"
              color="secondary"
              class="font-weight-medium"
            >
              {{ item.account_type }}
            </v-chip>
            <span v-else class="text-caption text-medium-emphasis">—</span>
          </template>
        </AppDataTable>
      </v-card>
    </v-container>
  </div>
</template>

<script setup>
// منطق صفحة دفتر الأستاذ وجلب بيانات الحركات المالية من API
import { ref, computed } from 'vue';
import {
  AppPageHeader,
  AppDataTable,
  AppButton,
  AppAutocomplete,
  AppDatePicker,
} from '@/components';
import { formatCurrency, formatDate, formatTime } from '@/utils/formatters';
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
  filters,
  changeSort,
  applyFilters,
  resetFilters: resetDataTableFilters,
} = useDataTable(params => financialLedgerService.getAll(params), {
  syncWithUrl: true,
  initialSortBy: 'entry_date',
  initialSortOrder: 'desc',
  immediate: true,
});

const exportLoading = ref(false);
const showFilters = ref(false);

// أعمدة الجدول
const headers = [
  { title: 'التاريخ', key: 'entry_date', sortable: true, minWidth: '140px' },
  { title: 'النوع', key: 'type_label', sortable: false, minWidth: '120px' },
  { title: 'المبلغ', key: 'amount', sortable: true, align: 'end', minWidth: '110px' },
  { title: 'الوصف', key: 'description', sortable: false, minWidth: '180px' },
  { title: 'المرجع', key: 'source_id', sortable: false, minWidth: '130px' },
  { title: 'نوع الحساب', key: 'account_type', sortable: false, minWidth: '100px' },
];

// خيارات فلتر النوع
const typeFilterItems = [
  { title: 'فاتورة مبيعات', value: 'sale', icon: 'ri-file-list-3-line' },
  { title: 'فاتورة مشتريات', value: 'purchase', icon: 'ri-shopping-cart-line' },
  { title: 'مصروفات', value: 'expense', icon: 'ri-money-dollar-box-line' },
  { title: 'سداد دفعة', value: 'payment', icon: 'ri-bank-card-line' },
  { title: 'إيداع نقدي', value: 'deposit', icon: 'ri-arrow-left-down-line' },
  { title: 'سحب نقدي', value: 'withdraw', icon: 'ri-arrow-right-up-line' },
  { title: 'تحويل مالي', value: 'transfer', icon: 'ri-exchange-line' },
];

// عدد الفلاتر النشطة
const activeFiltersCount = computed(() => {
  return Object.values(filters.value || {}).filter(v => v !== null && v !== undefined && v !== '').length;
});

// إحصائيات الصفحة الحالية
const pageIncome = computed(() => {
  return (ledgerEntries.value || [])
    .filter(e => isIncomeType(e.type))
    .reduce((sum, e) => sum + Math.abs(parseFloat(e.amount || 0)), 0);
});

const pageExpense = computed(() => {
  return (ledgerEntries.value || [])
    .filter(e => !isIncomeType(e.type))
    .reduce((sum, e) => sum + Math.abs(parseFloat(e.amount || 0)), 0);
});

const pageNet = computed(() => pageIncome.value - pageExpense.value);

// دوال معالجة الأحداث
const handleOptionsUpdate = options => {
  changeSort(options);
};

const handleFiltersChange = () => {
  applyFilters(filters.value);
};

const resetFilters = () => {
  resetDataTableFilters();
};

const handleExport = async () => {
  exportLoading.value = true;
  try {
    await financialLedgerService.export({});
  } finally {
    exportLoading.value = false;
  }
};

// دوال تصنيف النوع
const isIncomeType = type => ['sale', 'deposit', 'transfer_in'].includes(type);

const getTypeColor = type => {
  const colors = {
    sale: 'success',
    purchase: 'info',
    expense: 'error',
    payment: 'warning',
    deposit: 'teal',
    withdraw: 'deep-orange',
    transfer: 'purple',
    transfer_in: 'teal',
    transfer_out: 'deep-orange',
  };
  return colors[type] || 'grey';
};

const getTypeIcon = type => {
  const icons = {
    sale: 'ri-file-list-3-line',
    purchase: 'ri-shopping-cart-2-line',
    expense: 'ri-money-dollar-box-line',
    payment: 'ri-bank-card-line',
    deposit: 'ri-arrow-left-down-line',
    withdraw: 'ri-arrow-right-up-line',
    transfer: 'ri-exchange-line',
    transfer_in: 'ri-arrow-left-down-line',
    transfer_out: 'ri-arrow-right-up-line',
  };
  return icons[type] || 'ri-currency-line';
};

const getTypeFallbackLabel = type => {
  const labels = {
    sale: 'مبيعات',
    purchase: 'مشتريات',
    expense: 'مصروف',
    payment: 'دفعة',
    deposit: 'إيداع',
    withdraw: 'سحب',
    transfer: 'تحويل',
  };
  return labels[type] || type || '—';
};

const getSourceTypeLabel = sourceType => {
  if (!sourceType) return '';
  const name = sourceType.split('\\').pop().toLowerCase();
  const labels = {
    invoice: 'فاتورة',
    expense: 'مصروف',
    payment: 'دفعة',
    transaction: 'حركة',
    cashbox: 'خزينة',
    subscription: 'اشتراك',
    installment: 'قسط',
  };
  return labels[name] || name;
};
</script>

<style scoped>
.ledger-list-page :deep(.v-container) {
  max-width: 100% !important;
}

/* بطاقات الملخص */
.summary-card {
  background-color: #ffffff !important;
  border: 1px solid #f1f5f9 !important;
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}

.summary-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05) !important;
  transform: translateY(-1px);
}

.summary-card--total {
  border-left: 3px solid #3b82f6 !important;
}

.summary-card--income {
  border-left: 3px solid #10b981 !important;
}

.summary-card--expense {
  border-left: 3px solid #ef4444 !important;
}

.summary-card--positive {
  border-left: 3px solid #10b981 !important;
}

.summary-card--negative {
  border-left: 3px solid #ef4444 !important;
}

/* لوحة الفلاتر */
.filter-panel {
  background-color: #f8fafc !important;
  border: 1px solid #e2e8f0 !important;
}

/* الجدول */
.ledger-table-card {
  background-color: #ffffff !important;
  border: 1px solid #f1f5f9 !important;
}

.ledger-table-card :deep(.v-data-table__tr:hover) {
  background-color: #f8fafc !important;
}

/* شريحة النوع */
.ledger-type-chip {
  font-size: 0.73rem !important;
}

/* شريحة المرجع */
.reference-chip {
  font-size: 0.7rem !important;
  letter-spacing: 0;
}

/* الوصف */
.description-text {
  cursor: help;
  border-bottom: 1px dashed #cbd5e1;
}

/* ألوان النصوص */
.text-slate-800 {
  color: #1e293b !important;
}
</style>
