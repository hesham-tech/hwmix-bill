<template>
  <div class="expense-list-page">
    <AppPageHeader title="إدارة المصاريف" subtitle="تتبع المصاريف التشغيلية والإدارية للمنشأة" icon="ri-money-dollar-box-line">
      <template #append>
        <div class="d-flex ga-2">
          <AppButton v-if="canCreate" prepend-icon="ri-add-line" color="primary" @click="openAddDialog"> تسجيل مصروف </AppButton>
          <AppButton v-if="canManageCategories" variant="outlined" prepend-icon="ri-price-tag-3-line" @click="showCategoryDialog = true">
            الفئات
          </AppButton>
        </div>
      </template>

      <template #controls>
        <v-col cols="12" md="4" lg="3">
          <AppInput
            v-model="filters.search"
            prepend-inner-icon="ri-search-line"
            placeholder="بحث في الوصف أو المرجع..."
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
            بحث متقدم
            <v-chip v-if="activeFiltersCount > 0" size="x-small" color="primary" class="ms-2">
              {{ activeFiltersCount }}
            </v-chip>
          </AppButton>
        </v-col>
      </template>
    </AppPageHeader>

    <v-expand-transition>
      <v-card v-if="showAdvancedSearch" class="mx-4 mb-4 pa-4 border-slate-50" flat>
        <v-row>
          <v-col cols="12" sm="6" md="3">
            <AppAutocomplete
              v-model="filters.expense_category_id"
              :items="categories"
              item-title="name"
              item-value="id"
              label="الفئة"
              clearable
              @update:model-value="handleAdvancedFilters"
            />
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <AppDatePicker v-model="filters.date_from" label="من تاريخ" clearable @update:model-value="handleAdvancedFilters" />
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <AppDatePicker v-model="filters.date_to" label="إلى تاريخ" clearable @update:model-value="handleAdvancedFilters" />
          </v-col>
          <v-col cols="12" sm="6" md="3" class="d-flex align-end pb-3">
            <AppButton variant="text" color="error" @click="resetFilters"> إعادة تعيين </AppButton>
          </v-col>
        </v-row>
      </v-card>
    </v-expand-transition>

    <v-card class="mx-4 mt-2 border-slate-50" flat>
      <AppDataTable
        :headers="headers"
        :items="expenses"
        :loading="loading"
        :total-items="totalItems"
        v-model:page="currentPage"
        v-model:items-per-page="perPage"
        v-model:sort-by="sortByVuetify"
        @update:options="handleOptionsUpdate"
      >
        <template #[`item.amount`]="{ item }">
          <span class="font-weight-bold text-error">
            {{ formatCurrency(item.amount) }}
          </span>
        </template>

        <template #[`item.expense_category`]="{ item }">
          <v-chip size="small" variant="tonal" color="primary">
            {{ item.expense_category?.name }}
          </v-chip>
        </template>

        <template #[`item.actions`]="{ item }">
          <div class="d-flex ga-1">
            <AppButton v-if="canUpdate(item)" icon="ri-edit-line" variant="text" size="small" color="info" @click="openEditDialog(item)" />
            <AppButton v-if="canDelete(item)" icon="ri-delete-bin-line" variant="text" size="small" color="error" @click="handleDelete(item.id)" />
          </div>
        </template>
      </AppDataTable>
    </v-card>

    <!-- Dialogs -->
    <ExpenseDialog v-model="showExpenseDialog" :expense="selectedExpense" @saved="handleSaved" />

    <ExpenseCategoryDialog v-model="showCategoryDialog" @changed="fetchCategories" />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import AppPageHeader from '@/components/common/AppPageHeader.vue';
import AppDataTable from '@/components/common/AppDataTable.vue';
import AppButton from '@/components/common/AppButton.vue';
import AppInput from '@/components/common/AppInput.vue';
import AppAutocomplete from '@/components/common/AppAutocomplete.vue';
import AppDatePicker from '@/components/common/AppDatePicker.vue';
import { formatCurrency } from '@/utils/formatters';
import ExpenseDialog from '../components/ExpenseDialog.vue';
import ExpenseCategoryDialog from '../components/ExpenseCategoryDialog.vue';
import { useDataTable } from '@/composables/useDataTable';
import { useExpenseCategories } from '../composables/useExpenseCategories';
import { useExpenses } from '../composables/useExpenses'; // Needed for delete/update/create
import { useUserStore } from '@/stores/user';
import { expenseService } from '@/api';
import { PERMISSIONS } from '@/config/permissions';
import debounce from 'lodash/debounce';

const userStore = useUserStore();
const { deleteExpense, createExpense, updateExpense } = useExpenses();
const { categories, fetchCategories } = useExpenseCategories();

const {
  items: expenses,
  loading,
  currentPage,
  perPage,
  total: totalItems,
  sortByVuetify,
  applyFilters,
  fetchData,
} = useDataTable(params => expenseService.getAll(params), {
  initialSortBy: 'expense_date',
  initialSortOrder: 'desc',
  immediate: false,
});

const showExpenseDialog = ref(false);
const showCategoryDialog = ref(false);
const showAdvancedSearch = ref(false);
const selectedExpense = ref(null);

const filters = reactive({
  search: '',
  expense_category_id: null,
  date_from: null,
  date_to: null,
});

const headers = [
  { title: 'التاريخ', key: 'expense_date', sortable: true },
  { title: 'الفئة', key: 'expense_category', sortable: false },
  { title: 'الوصف', key: 'notes', sortable: false },
  { title: 'المبلغ', key: 'amount', sortable: true, align: 'end' },
  { title: 'المرجع', key: 'reference_number', sortable: false },
  { title: 'بواسطة', key: 'creator.full_name', sortable: false },
  { title: 'إجراءات', key: 'actions', sortable: false, align: 'center' },
];

const activeFiltersCount = computed(() => {
  let count = 0;
  if (filters.expense_category_id) count++;
  if (filters.date_from) count++;
  if (filters.date_to) count++;
  return count;
});

const canCreate = computed(() => userStore.hasPermission(PERMISSIONS.EXPENSES_CREATE));
const canManageCategories = computed(() => userStore.hasPermission(PERMISSIONS.EXPENSE_CATEGORIES_PAGE));
const canUpdate = item =>
  userStore.hasPermission(PERMISSIONS.EXPENSES_UPDATE_ALL) ||
  (userStore.hasPermission(PERMISSIONS.EXPENSES_UPDATE_SELF) && item.created_by === userStore.currentUser.id);
const canDelete = item =>
  userStore.hasPermission(PERMISSIONS.EXPENSES_DELETE_ALL) ||
  (userStore.hasPermission(PERMISSIONS.EXPENSES_DELETE_SELF) && item.created_by === userStore.currentUser.id);

const handleSearch = debounce(() => {
  applyFilters({ ...filters });
}, 500);

const handleAdvancedFilters = () => {
  applyFilters({ ...filters });
};

const handleOptionsUpdate = options => {
  // useDataTable changeSort handles this
  const { sortBy } = options;
  if (sortBy && sortBy.length > 0) {
    sortByVuetify.value = sortBy;
    fetchData();
  }
};

const resetFilters = () => {
  Object.assign(filters, {
    search: '',
    expense_category_id: null,
    date_from: null,
    date_to: null,
  });
  applyFilters({ ...filters });
};

const openAddDialog = () => {
  selectedExpense.value = null;
  showExpenseDialog.value = true;
};

const openEditDialog = expense => {
  selectedExpense.value = expense;
  showExpenseDialog.value = true;
};

const handleSaved = async data => {
  let res;
  if (data.id) {
    res = await updateExpense(data.id, data);
  } else {
    res = await createExpense(data);
  }

  if (res?.success) {
    showExpenseDialog.value = false;
    fetchData();
  }
};

const handleDelete = async id => {
  if (!confirm('هل أنت متأكد من حذف هذا المصروف؟')) return;
  const res = await deleteExpense(id);
  if (res?.success) fetchData();
};

onMounted(() => {
  fetchCategories();
});
</script>

<style scoped>
.border-slate-50 {
  border: 1px solid #f1f5f9 !important;
}
</style>
