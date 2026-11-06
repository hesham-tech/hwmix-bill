import { computed } from 'vue';
import { useDataTable } from '@/composables/useDataTable';
import userService from '@/api/services/user.service';

export function useCustomerTable() {
// API fetch function
const fetchUsersApi = async (params, options = {}) => {
  return await userService.getCustomers(params, { showToast: false, signal: options.signal });
};

// DataTable Logic
const {
  items: users,
  loading,
  currentPage: page,
  perPage: itemsPerPage,
  total: totalItems,
  lastPage,
  search: searchText,
  filters,
  sortByVuetify,
  changeSort,
  applyFilters,
  fetchData,
  refresh,
} = useDataTable(fetchUsersApi, {
  syncWithUrl: true,
  initialSortBy: 'created_at',
  initialSortOrder: 'desc',
  immediate: true,
});

const onTableOptionsUpdate = options => {
  changeSort(options);
};

// Computed for company visibility filter
const currentCompanyOnly = computed({
  get: () => !filters.value?.global,
  set: val => {
    filters.value.global = !val;
    applyFilters(filters.value);
  },
});


return { users, loading, page, itemsPerPage, totalItems, lastPage, searchText, filters, sortByVuetify, changeSort, applyFilters, fetchData, refresh, onTableOptionsUpdate, currentCompanyOnly };
}
