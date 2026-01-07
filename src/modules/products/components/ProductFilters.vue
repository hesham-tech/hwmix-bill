<template>
  <AppCard title="تصفية المنتجات" icon="ri-filter-3-line" class="mb-4">
    <template #actions>
      <AppButton variant="text" color="secondary" size="small" prepend-icon="ri-refresh-line" @click="resetFilters"> مسح الكل </AppButton>
    </template>

    <v-row dense>
      <v-col cols="12" md="4">
        <AppInput
          :model-value="filters.search"
          label="البحث السريع"
          placeholder="اسم المنتج، SKU، أو باركود"
          prepend-inner-icon="ri-search-line"
          @update:model-value="handleSearchChange"
        />
      </v-col>

      <v-col cols="12" md="3">
        <v-select
          v-model="filters.category_id"
          :items="categories"
          :loading="loadingCategories"
          item-title="name"
          item-value="id"
          label="الفئة"
          variant="outlined"
          density="comfortable"
          prepend-inner-icon="ri-folder-line"
          clearable
          hide-details
          @update:model-value="$emit('filter-change')"
        />
      </v-col>

      <v-col cols="12" md="3">
        <v-select
          v-model="filters.brand_id"
          :items="brands"
          :loading="loadingBrands"
          item-title="name"
          item-value="id"
          label="العلامة التجارية"
          variant="outlined"
          density="comfortable"
          prepend-inner-icon="ri-award-line"
          clearable
          hide-details
          @update:model-value="$emit('filter-change')"
        />
      </v-col>

      <v-col cols="12" md="2">
        <v-select
          v-model="filters.stock_status"
          :items="stockStatuses"
          label="حالة المخزون"
          variant="outlined"
          density="comfortable"
          prepend-inner-icon="ri-archive-line"
          clearable
          hide-details
          @update:model-value="$emit('filter-change')"
        />
      </v-col>
    </v-row>
  </AppCard>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useApi } from '@/composables/useApi';
import AppCard from '@/components/common/AppCard.vue';
import AppButton from '@/components/common/AppButton.vue';
import AppInput from '@/components/common/AppInput.vue';

const props = defineProps({
  filters: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['filter-change', 'update:filters']);

const categoriesApi = useApi('/api/categories');
const brandsApi = useApi('/api/brands');

const categories = ref([]);
const brands = ref([]);
const loadingCategories = ref(false);
const loadingBrands = ref(false);

const stockStatuses = [
  { title: 'متوفر', value: 'in_stock' },
  { title: 'مخزون منخفض', value: 'low_stock' },
  { title: 'نفذ المخزون', value: 'out_of_stock' },
];

let searchTimeout;

const handleSearchChange = value => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    emit('update:filters', { ...props.filters, search: value });
    emit('filter-change');
  }, 300);
};

const loadCategories = async () => {
  loadingCategories.value = true;
  try {
    const response = await categoriesApi.get({ per_page: 100 }, { showLoading: false, showError: false });
    categories.value = response.data || [];
  } finally {
    loadingCategories.value = false;
  }
};

const loadBrands = async () => {
  loadingBrands.value = true;
  try {
    const response = await brandsApi.get({ per_page: 100 }, { showLoading: false, showError: false });
    brands.value = response.data || [];
  } finally {
    loadingBrands.value = false;
  }
};

onMounted(() => {
  loadCategories();
  loadBrands();
});
</script>
