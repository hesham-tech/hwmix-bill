<template>
  <div class="stock-page">
    <div class="mb-6 px-6 pt-6">
      <h1 class="text-h4 font-weight-bold">المخزون</h1>
      <p class="text-body-1 text-grey">مراقبة مستويات المخزون وحالات التوفر في جميع المستودعات</p>
    </div>

    <div class="px-6 pb-6">
      <AppDataTable
        :headers="headers"
        :items="products"
        :loading="loading"
        :items-length="total"
        :items-per-page="itemsPerPage"
        :page="page"
        title="حالة المخزون الحالي"
        icon="ri-inbox-line"
        @update:page="
          page = $event;
          loadData();
        "
        @update:items-per-page="handleItemsPerPageChange"
      >
        <template #item.product="{ item }">
          <div class="d-flex flex-column">
            <span class="font-weight-bold text-body-1">{{ item.name }}</span>
            <span class="text-caption text-grey">{{ item.sku || 'بدون SKU' }}</span>
          </div>
        </template>

        <template #item.category="{ item }">
          <v-chip v-if="item.category" size="small" variant="flat" color="primary-lighten-5" class="text-primary font-weight-bold">
            {{ item.category.name }}
          </v-chip>
          <span v-else class="text-grey-lighten-1 text-caption">غير مصنف</span>
        </template>

        <template #item.warehouse="{ item }">
          <div class="d-flex align-center">
            <v-icon icon="ri-building-line" size="small" color="info" class="me-2" />
            <span class="font-weight-medium text-info">{{ item.warehouse?.name || 'غير محدد' }}</span>
          </div>
        </template>

        <template #item.stock_quantity="{ item }">
          <v-chip :color="getStockColor(item.stock_quantity, item.min_stock_level)" size="small" variant="flat" class="font-weight-bold px-3">
            <v-icon :icon="getStockIcon(item.stock_quantity, item.min_stock_level)" size="14" class="me-1" />
            {{ item.stock_quantity || 0 }} وحدة
          </v-chip>
        </template>

        <template #item.min_stock_level="{ item }">
          <span class="font-weight-medium">{{ item.min_stock_level || '0' }}</span>
        </template>

        <template #item.status="{ item }">
          <v-chip :color="getStockStatusColor(item.stock_quantity, item.min_stock_level)" size="small" variant="tonal" class="font-weight-black">
            {{ getStockStatus(item.stock_quantity, item.min_stock_level) }}
          </v-chip>
        </template>
      </AppDataTable>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useApi } from '@/composables/useApi';
import AppDataTable from '@/components/common/AppDataTable.vue';
import AppCard from '@/components/common/AppCard.vue';

const api = useApi('/api/products');

const products = ref([]);
const loading = ref(false);
const total = ref(0);
const page = ref(1);
const itemsPerPage = ref(10);

const headers = [
  { title: 'المنتج', key: 'product' },
  { title: 'الفئة', key: 'category' },
  { title: 'المخزن', key: 'warehouse' },
  { title: 'الكمية', key: 'stock_quantity', align: 'center' },
  { title: 'الحد الأدنى', key: 'min_stock_level', align: 'center' },
  { title: 'الحالة', key: 'status' },
];

const getStockColor = (quantity, minLevel) => {
  if (!quantity || quantity === 0) return 'error';
  if (quantity < (minLevel || 10)) return 'warning';
  return 'success';
};

const getStockIcon = (quantity, minLevel) => {
  if (!quantity || quantity === 0) return 'ri-close-circle-line';
  if (quantity < (minLevel || 10)) return 'ri-error-warning-line';
  return 'ri-checkbox-circle-line';
};

const getStockStatus = (quantity, minLevel) => {
  if (!quantity || quantity === 0) return 'نفذ المخزون';
  if (quantity < (minLevel || 10)) return 'مخزون منخفض';
  return 'متوفر';
};

const getStockStatusColor = (quantity, minLevel) => {
  if (!quantity || quantity === 0) return 'error';
  if (quantity < (minLevel || 10)) return 'warning';
  return 'success';
};

const loadData = async () => {
  loading.value = true;
  try {
    const response = await api.get({ page: page.value, per_page: itemsPerPage.value, track_stock: 1 }, { showLoading: false });
    products.value = response.data || [];
    total.value = response.total || 0;
  } finally {
    loading.value = false;
  }
};

const handleItemsPerPageChange = value => {
  itemsPerPage.value = value;
  page.value = 1;
  loadData();
};

onMounted(loadData);
</script>

<style scoped></style>
