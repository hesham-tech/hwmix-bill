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
    initialFilters = {}, // ✅ دعم فلاتر أولية
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

  // Search & Filters with parsing safety
  const search = ref(syncWithUrl ? route.query.search || '' : '');

  const getInitialFilters = () => {
    if (!syncWithUrl || !route.query.filters) return { ...initialFilters };
    try {
      return { ...initialFilters, ...JSON.parse(route.query.filters) };
    } catch (e) {
      console.warn('[DataTable] Failed to parse filters from URL:', e);
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
  const totalPages = computed(() => {
    const pp = perPage.value || 10;
    return Math.max(1, Math.ceil(total.value / pp));
  });

  // ✅ Vuetify Compatible Sorting (v-model:sort-by)
  const sortByVuetify = computed({
    get: () => [{ key: sortBy.value, order: sortOrder.value }],
    set: val => {
      if (val && val.length > 0) {
        sortBy.value = val[0].key;
        sortOrder.value = val[0].order;
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
   * @param {Object} fetchOptions - خيارات إضافية للجلب (مثل append)
   */
  const fetchData = async (fetchOptions = {}) => {
    const { append = false } = fetchOptions;

    // Prevent duplicate calls if already loading
    if (loading.value && !append) {
      console.debug('DataTable is already loading, skipping request.');
      return;
    }

    loading.value = true;
    error.value = null;

    try {
      const params = {
        page: currentPage.value,
        per_page: perPage.value,
        sort_by: sortBy.value,
        sort_order: sortOrder.value,
      };

      // إضافة search إذا موجود
      if (search.value) {
        params.search = search.value;
      }

      // إضافة filters
      Object.entries(filters.value).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          params[key] = value;
        }
      });

      const response = await fetchFunction(params);

      // تحديث البيانات
      const newData = response.data || [];
      if (append) {
        items.value = [...items.value, ...newData];
      } else {
        items.value = newData;
      }

      total.value = response.meta?.total ?? response.total ?? 0;
      lastPage.value = response.meta?.last_page ?? response.last_page ?? 1;

      const newPage = response.meta?.current_page ?? response.current_page ?? 1;
      if (currentPage.value !== newPage) {
        currentPage.value = newPage;
      }

      // مزامنة مع URL
      if (syncWithUrl) {
        updateUrl();
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
  const updateUrl = () => {
    const query = {
      page: String(currentPage.value),
      per_page: String(perPage.value),
      sort_by: sortBy.value,
      sort_order: sortOrder.value,
    };

    if (search.value) {
      query.search = search.value;
    }

    if (Object.keys(filters.value).length > 0) {
      query.filters = JSON.stringify(filters.value);
    }

    // ✅ تجنب التحديث إذا كان كائن الـ query مطابقاً تماماً للحالي
    const currentQuery = route.query;
    const isSame =
      Object.keys(query).length === Object.keys(currentQuery).length && Object.keys(query).every(key => query[key] === currentQuery[key]);

    if (!isSame) {
      router.replace({ query }).catch(err => {
        if (err.name !== 'NavigationDuplicated') {
          console.error('DataTable URL update error:', err);
        }
      });
    }
  };

  /**
   * تغيير الصفحة
   */
  const changePage = page => {
    currentPage.value = page;
    fetchData();
  };

  /**
   * تغيير عدد العناصر لكل صفحة
   */
  const changePerPage = value => {
    perPage.value = value;
    currentPage.value = 1; // العودة للصفحة الأولى
    fetchData();
  };

  /**
   * تغيير الترتيب
   * يدعم السلاسل النصية البسيطة أو كائنات Vuetify (sortBy array/options object)
   */
  const changeSort = column => {
    // 1. إذا كانت مصفوفة (نمط Vuetify 3: [{ key, order }])
    if (Array.isArray(column) && column.length > 0) {
      const firstSort = column[0];
      sortBy.value = firstSort.key;
      sortOrder.value = firstSort.order || 'asc';
    }
    // 2. إذا كان كائن الخيارات بالكامل (update:options event)
    else if (column && typeof column === 'object' && Array.isArray(column.sortBy)) {
      if (column.sortBy.length > 0) {
        const firstSort = column.sortBy[0];
        sortBy.value = firstSort.key;
        sortOrder.value = firstSort.order || 'asc';
      }
    }
    // 3. إذا كان اسم العمود كسلسلة نصية (النمط الكلاسيكي)
    else if (typeof column === 'string') {
      if (sortBy.value === column) {
        sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
      } else {
        sortBy.value = column;
        sortOrder.value = 'asc';
      }
    }

    fetchData();
  };

  /**
   * البحث (مع debounce)
   */
  let searchTimeout;
  const performSearch = searchValue => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      search.value = searchValue;
      currentPage.value = 1; // العودة للصفحة الأولى
      fetchData();
    }, 500); // 500ms debounce
  };

  /**
   * تطبيق الفلاتر
   */
  const applyFilters = (newFilters = null) => {
    if (newFilters !== null && newFilters !== undefined) {
      filters.value = { ...filters.value, ...newFilters };
    }
    currentPage.value = 1;
    fetchData();
  };

  /**
   * إعادة تعيين الفلاتر
   */
  const resetFilters = () => {
    filters.value = {};
    search.value = '';
    currentPage.value = 1;
    fetchData();
  };

  /**
   * تحديث عنصر واحد في الجدول
   */
  const updateItem = (id, updatedData) => {
    const index = items.value.findIndex(item => item.id === id);
    if (index !== -1) {
      items.value[index] = { ...items.value[index], ...updatedData };
    }
  };

  /**
   * حذف عنصر من الجدول
   */
  const removeItem = id => {
    items.value = items.value.filter(item => item.id !== id);
    total.value--;
  };

  /**
   * تحديد/إلغاء تحديد عنصر
   */
  const toggleSelection = id => {
    const index = selectedIds.value.indexOf(id);
    if (index === -1) {
      selectedIds.value.push(id);
    } else {
      selectedIds.value.splice(index, 1);
    }
  };

  /**
   * تحديد/إلغاء تحديد الكل
   */
  const toggleSelectAll = () => {
    if (selectAll.value) {
      selectedIds.value = items.value.map(item => item.id);
    } else {
      selectedIds.value = [];
    }
  };

  /**
   * مسح التحديد
   */
  const clearSelection = () => {
    selectedIds.value = [];
    selectAll.value = false;
  };

  /**
   * تحديث البيانات (refresh)
   */
  const refresh = () => {
    fetchData();
  };

  // ✅ Watchers
  watch(selectAll, toggleSelectAll);

  // جلب البيانات عند التحميل
  if (immediate) {
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
