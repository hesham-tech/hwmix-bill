import { ref, computed, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';

/**
 * Composable for managing DataTable state and operations
 * يدير حالة الجداول والعمليات (pagination, sorting, search)
 *
 * @param {Function} fetchFunction - دالة جلب البيانات من API
 * @param {Object} options - خيارات إضافية
 * @returns {Object} - حالة الجدول والدوال
 */
export function useDataTable(fetchFunction, options = {}) {
  const router = useRouter();
  const route = useRoute();

  // الخيارات الافتراضية
  const {
    initialPage = 1,
    initialPerPage = 10,
    initialSortBy = 'id',
    initialSortOrder = 'desc',
    initialFilters = {},
    syncWithUrl = true,
    immediate = true,
  } = options;

  // ✅ الحالة (State)
  const items = ref([]);
  const loading = ref(false);
  const error = ref(null);

  // Pagination safety
  const parseNum = (val, fallback) => {
    const n = parseInt(val);
    return isNaN(n) || n < 1 ? fallback : n;
  };

  const currentPage = ref(syncWithUrl ? parseNum(route.query.page, initialPage) : initialPage);
  const perPage = ref(syncWithUrl ? parseNum(route.query.per_page, initialPerPage) : initialPerPage);
  const total = ref(0);
  const lastPage = ref(1);

  // Sorting
  const sortBy = ref(syncWithUrl ? route.query.sort_by || initialSortBy : initialSortBy);
  const sortOrder = ref(syncWithUrl ? route.query.sort_order || initialSortOrder : initialSortOrder);

  // Search & Filters
  const search = ref(syncWithUrl ? route.query.search || '' : '');

  const getInitialFilters = () => {
    if (!syncWithUrl || !route.query.filters) return { ...initialFilters };
    try {
      return { ...initialFilters, ...JSON.parse(route.query.filters) };
    } catch {
      return { ...initialFilters };
    }
  };
  const filters = ref(getInitialFilters());

  // Selection
  const selectedIds = ref([]);
  const selectAll = ref(false);

  // ✅ Computed
  const hasItems = computed(() => items.value.length > 0);
  const isEmpty = computed(() => !loading.value && items.value.length === 0);
  const hasSelection = computed(() => selectedIds.value.length > 0);
  const totalPages = computed(() => lastPage.value);

  const sortByVuetify = computed({
    get: () => [{ key: sortBy.value, order: sortOrder.value }],
    set: val => {
      if (val && val.length > 0) {
        sortBy.value = val[0].key;
        sortOrder.value = val[0].order || 'asc';
      }
    },
  });

  const paginationInfo = computed(() => {
    const from = (currentPage.value - 1) * perPage.value + 1;
    const to = Math.min(currentPage.value * perPage.value, total.value);
    return { from, to, total: total.value };
  });

  // ✅ Methods

  /**
   * جلب البيانات من API
   */
  const fetchData = async (fetchOptions = {}) => {
    const { append = false } = fetchOptions;
    if (loading.value && !append) return;

    loading.value = true;
    error.value = null;

    try {
      const params = {
        page: currentPage.value,
        per_page: perPage.value === -1 ? 1000 : perPage.value,
        sort_by: sortBy.value,
        sort_order: sortOrder.value,
      };

      if (search.value) params.search = search.value;
      Object.entries(filters.value).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') params[key] = value;
      });

      const response = await fetchFunction(params);
      const newData = response.data || [];
      if (append) items.value = [...items.value, ...newData];
      else items.value = newData;

      const responseTotal = response.meta?.total ?? response.total ?? response.data?.length ?? 0;
      total.value = responseTotal;
      const calcLastPage = Math.ceil(responseTotal / (params.per_page > 0 ? params.per_page : 1)) || 1;
      lastPage.value = response.meta?.last_page ?? response.last_page ?? calcLastPage;

      const responsePage = response.meta?.current_page ?? response.current_page ?? params.page;
      if (!append && currentPage.value !== responsePage) {
        currentPage.value = responsePage;
      }
    } catch (err) {
      error.value = err.message || 'حدث خطأ في تحميل البيانات';
      console.error('DataTable fetch error:', err);
    } finally {
      loading.value = false;
    }
  };

  /**
   * تحديث URL query params
   */
  const updateUrl = (overrides = {}) => {
    if (!syncWithUrl) return;
    const query = {
      ...route.query,
      page: String(overrides.page ?? currentPage.value),
      per_page: String(overrides.per_page ?? perPage.value),
      sort_by: overrides.sort_by ?? sortBy.value,
      sort_order: overrides.sort_order ?? sortOrder.value,
    };

    if (overrides.search !== undefined) overrides.search ? (query.search = overrides.search) : delete query.search;
    else search.value ? (query.search = search.value) : delete query.search;

    if (overrides.filters !== undefined)
      overrides.filters && Object.keys(overrides.filters).length > 0 ? (query.filters = JSON.stringify(overrides.filters)) : delete query.filters;
    else Object.keys(filters.value).length > 0 ? (query.filters = JSON.stringify(filters.value)) : delete query.filters;

    const keys = ['page', 'per_page', 'sort_by', 'sort_order', 'search', 'filters'];
    const hasChanged = keys.some(key => String(query[key] || '') !== String(route.query[key] || ''));
    if (hasChanged) router.push({ query }).catch(() => {});
  };

  /**
   * العمليات الأساسية
   */
  const changePage = page => {
    if (syncWithUrl) updateUrl({ page });
    else {
      currentPage.value = page;
      fetchData();
    }
  };

  const changePerPage = value => {
    if (syncWithUrl) updateUrl({ per_page: value, page: 1 });
    else {
      perPage.value = value;
      currentPage.value = 1;
      fetchData();
    }
  };

  const changeSort = column => {
    let ns = sortBy.value,
      no = sortOrder.value,
      np = currentPage.value,
      npp = perPage.value;
    if (Array.isArray(column) && column.length > 0) {
      ns = column[0].key;
      no = column[0].order || 'asc';
    } else if (column && typeof column === 'object') {
      const { sortBy: sb, page: p, itemsPerPage: ip } = column;
      if (sb?.length > 0) {
        ns = sb[0].key;
        no = sb[0].order || 'asc';
      }
      if (p !== undefined) np = p;
      if (ip !== undefined) npp = ip;
    } else if (typeof column === 'string') {
      if (sortBy.value === column) no = sortOrder.value === 'asc' ? 'desc' : 'asc';
      else {
        ns = column;
        no = 'asc';
      }
    }
    if (syncWithUrl) updateUrl({ sort_by: ns, sort_order: no, page: np, per_page: npp });
    else {
      sortBy.value = ns;
      sortOrder.value = no;
      currentPage.value = np;
      perPage.value = npp;
      fetchData();
    }
  };

  const performSearch = v => {
    if (syncWithUrl) updateUrl({ search: v, page: 1 });
    else {
      search.value = v;
      currentPage.value = 1;
      fetchData();
    }
  };

  const applyFilters = f => {
    const finalF = f ? { ...filters.value, ...f } : filters.value;
    if (syncWithUrl) updateUrl({ filters: finalF, page: 1 });
    else {
      filters.value = finalF;
      currentPage.value = 1;
      fetchData();
    }
  };

  const resetFilters = () => {
    if (syncWithUrl) updateUrl({ filters: { ...initialFilters }, search: '', page: 1 });
    else {
      filters.value = { ...initialFilters };
      search.value = '';
      currentPage.value = 1;
      fetchData();
    }
  };

  // مساعدات إضافية
  const updateItem = (id, data) => {
    const idx = items.value.findIndex(i => i.id === id);
    if (idx !== -1) items.value[idx] = { ...items.value[idx], ...data };
  };

  const removeItem = id => {
    items.value = items.value.filter(i => i.id !== id);
    total.value--;
  };

  const toggleSelection = id => {
    const idx = selectedIds.value.indexOf(id);
    if (idx === -1) selectedIds.value.push(id);
    else selectedIds.value.splice(idx, 1);
  };

  const toggleSelectAll = () => {
    selectedIds.value = selectAll.value ? items.value.map(i => i.id) : [];
  };

  const clearSelection = () => {
    selectedIds.value = [];
    selectAll.value = false;
  };
  const refresh = () => fetchData();

  // ✅ Watchers للتزامن التلقائي (عند استخدام v-model)
  watch(selectAll, toggleSelectAll);

  // مراقبة البحث مع debounce
  let searchTimeout;
  watch(search, newVal => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      // فقط إذا كان هناك اختلاف حقيقي عن الرابط الحالي
      if (syncWithUrl && String(newVal) !== String(route.query.search || '')) {
        updateUrl({ search: newVal, page: 1 });
      } else if (!syncWithUrl) {
        currentPage.value = 1;
        fetchData();
      }
    }, 500);
  });

  // مراقبة الفلاتر
  watch(
    filters,
    newVal => {
      if (syncWithUrl) {
        const urlFilters = route.query.filters ? JSON.parse(route.query.filters) : {};
        if (JSON.stringify(newVal) !== JSON.stringify(urlFilters)) {
          updateUrl({ filters: newVal, page: 1 });
        }
      } else {
        currentPage.value = 1;
        fetchData();
      }
    },
    { deep: true }
  );

  if (syncWithUrl) {
    watch(
      () => route.query,
      (newQ, oldQ) => {
        const keys = ['page', 'per_page', 'sort_by', 'sort_order', 'search', 'filters'];
        const changed = !oldQ || keys.some(k => String(newQ[k] || '') !== String(oldQ[k] || ''));
        if (changed) {
          currentPage.value = parseNum(newQ.page, initialPage);
          perPage.value = parseNum(newQ.per_page, initialPerPage);
          sortBy.value = newQ.sort_by || initialSortBy;
          sortOrder.value = newQ.sort_order || initialSortOrder;
          search.value = newQ.search || '';
          try {
            filters.value = newQ.filters ? JSON.parse(newQ.filters) : { ...initialFilters };
          } catch {
            filters.value = { ...initialFilters };
          }
          fetchData();
        }
      },
      { deep: true, immediate: true }
    );
  } else if (immediate) {
    fetchData();
  }

  return {
    // State
    items,
    loading,
    error,
    currentPage,
    perPage,
    total,
    lastPage,
    sortBy,
    sortOrder,
    sortByVuetify,
    search,
    filters,
    selectedIds,
    selectAll,
    // Computed
    hasItems,
    isEmpty,
    hasSelection,
    totalPages,
    paginationInfo,
    // Methods
    fetchData,
    changePage,
    changePerPage,
    changeSort,
    performSearch,
    applyFilters,
    resetFilters,
    updateItem,
    removeItem,
    toggleSelection,
    clearSelection,
    refresh,
  };
}
