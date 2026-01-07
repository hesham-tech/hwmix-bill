<template>
  <div class="stock-report-page">
    <div class="mb-6 px-6 pt-6 d-flex align-center justify-space-between">
      <div>
        <h1 class="text-h4 font-weight-bold">تقرير تفصيلي لحالة المخزون</h1>
        <p class="text-body-1 text-grey">متابعة الكميات المتوفرة والقيم المالية للمخزون في المستودعات</p>
      </div>
      <div class="d-flex gap-2">
        <AppButton variant="tonal" color="success" prepend-icon="ri-download-line" @click="exportReport" :disabled="!products.length">
          تصدير CSV
        </AppButton>
        <AppButton color="primary" prepend-icon="ri-refresh-line" @click="loadReport"> تحديث </AppButton>
      </div>
    </div>

    <!-- Summary Cards -->
    <v-row class="px-6 mx-0 mb-6" dense>
      <v-col cols="12" sm="6" md="3">
        <v-card border flat class="rounded-xl overflow-hidden pa-1">
          <v-card-text class="pa-4 bg-primary-lighten-5">
            <div class="text-caption font-weight-bold text-primary mb-1">إجمالي المنتجات</div>
            <div class="text-h4 font-weight-black text-primary">{{ summary.total_products }}</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card border flat class="rounded-xl overflow-hidden pa-1 border-success">
          <v-card-text class="pa-4 bg-success-lighten-5">
            <div class="text-caption font-weight-bold text-success mb-1">القيمة الإجمالية</div>
            <div class="text-h4 font-weight-black text-success">{{ formatCurrency(summary.total_value) }}</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card border flat class="rounded-xl overflow-hidden pa-1 border-warning">
          <v-card-text class="pa-4 bg-warning-lighten-5">
            <div class="text-caption font-weight-bold text-warning mb-1">مخزون منخفض</div>
            <div class="text-h4 font-weight-black text-warning">{{ summary.low_stock }}</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card border flat class="rounded-xl overflow-hidden pa-1 border-error">
          <v-card-text class="pa-4 bg-error-lighten-5">
            <div class="text-caption font-weight-bold text-error mb-1">نفذ المخزون</div>
            <div class="text-h4 font-weight-black text-error">{{ summary.out_of_stock }}</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <div class="px-6 mb-4">
      <AppCard title="خيارات التصفية" icon="ri-filter-3-line">
        <v-row dense>
          <v-col cols="12" sm="6" md="5">
            <v-select
              v-model="filters.warehouse_id"
              :items="warehouses"
              :loading="loadingWarehouses"
              item-title="name"
              item-value="id"
              label="تصفية حسب المخزن"
              clearable
              variant="outlined"
              density="compact"
              hide-details
              prepend-inner-icon="ri-building-4-line"
            />
          </v-col>
          <v-col cols="12" sm="6" md="5">
            <v-select
              v-model="filters.stock_status"
              :items="stockStatuses"
              label="تصفية حسب الحالة"
              clearable
              variant="outlined"
              density="compact"
              hide-details
              prepend-inner-icon="ri-list-check-2"
            />
          </v-col>
          <v-col cols="12" md="2" class="d-flex align-center">
            <AppButton color="secondary" block prepend-icon="ri-refresh-line" @click="loadReport" variant="tonal"> عرض </AppButton>
          </v-col>
        </v-row>
      </AppCard>
    </div>

    <div class="px-6 pb-6">
      <AppDataTable :headers="headers" :items="products" :loading="loading" title="كشف الأصناف التفصيلي" icon="ri-search-eye-line">
        <template #item.stock_quantity="{ item }">
          <v-chip :color="getStockColor(item.stock_quantity, item.min_stock_level)" size="small" variant="flat" class="font-weight-black px-3">
            {{ item.stock_quantity || 0 }} وحدة
          </v-chip>
        </template>
        <template #item.stock_value="{ item }">
          <div class="font-weight-black text-body-1 text-success">{{ formatCurrency(item.stock_value) }}</div>
        </template>
        <template #no-data>
          <div class="text-center pa-10">
            <v-icon icon="ri-inbox-archive-line" size="64" color="grey-lighten-2" class="mb-4" />
            <div class="text-h6 text-grey font-weight-medium">لا توجد منتجات مطابقة لخيارات البحث</div>
          </div>
        </template>
      </AppDataTable>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useApi } from '@/composables/useApi';
import { usePrintExport } from '@/composables/usePrintExport';
import AppCard from '@/components/common/AppCard.vue';
import AppButton from '@/components/common/AppButton.vue';
import AppDataTable from '@/components/common/AppDataTable.vue';

const productsApi = useApi('/api/products');
const warehousesApi = useApi('/api/warehouses');
const { exportToCSV } = usePrintExport();

const loading = ref(false);
const loadingWarehouses = ref(false);
const warehouses = ref([]);
const filters = ref({ warehouse_id: null, stock_status: null });

const summary = ref({ total_products: 0, total_value: 0, low_stock: 0, out_of_stock: 0 });
const products = ref([]);

const stockStatuses = [
  { title: 'متوفر', value: 'in_stock' },
  { title: 'مخزون منخفض', value: 'low_stock' },
  { title: 'نفذ المخزون', value: 'out_of_stock' },
];

const headers = [
  { title: 'المنتج', key: 'name' },
  { title: 'المخزن', key: 'warehouse.name' },
  { title: 'الكمية', key: 'stock_quantity', align: 'center' },
  { title: 'قيمة المخزون', key: 'stock_value', align: 'end' },
];

const formatCurrency = amount => {
  if (!amount) return '0.00 ج.م';
  return new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP' }).format(amount);
};

const getStockColor = (quantity, minLevel) => {
  if (!quantity || quantity === 0) return 'error';
  if (quantity < (minLevel || 10)) return 'warning';
  return 'success';
};

const loadWarehouses = async () => {
  loadingWarehouses.value = true;
  try {
    const response = await warehousesApi.get({ per_page: 100 }, { showLoading: false, showError: false });
    warehouses.value = response.data || [];
  } finally {
    loadingWarehouses.value = false;
  }
};

const exportReport = () => {
  const data = products.value.map(p => ({
    المنتج: p.name,
    المخزن: p.warehouse?.name || '-',
    الكمية: p.stock_quantity,
    القيمة: p.stock_value,
  }));
  exportToCSV(data, 'تقرير_المخزون.csv', ['المنتج', 'المخزن', 'الكمية', 'القيمة']);
};

const loadReport = async () => {
  loading.value = true;
  try {
    const response = await productsApi.get({ ...filters.value, per_page: 100 }, { showLoading: false });
    products.value = (response.data || []).map(p => ({
      ...p,
      stock_value: (p.stock_quantity || 0) * (p.cost_price || 0),
    }));

    const total = products.value.reduce((sum, p) => sum + p.stock_value, 0);
    summary.value = {
      total_products: products.value.length,
      total_value: total,
      low_stock: products.value.filter(p => p.stock_quantity < (p.min_stock_level || 10) && p.stock_quantity > 0).length,
      out_of_stock: products.value.filter(p => !p.stock_quantity || p.stock_quantity === 0).length,
    };
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadWarehouses();
  loadReport();
});
</script>

<style scoped></style>
