<template>
  <div class="stock-report-page">
    <div class="page-header mb-6">
      <h1 class="text-h4 font-weight-bold">تقرير المخزون</h1>
      <p class="text-body-1 text-grey">حالة المخزون والمنتجات</p>
    </div>

    <!-- Summary Cards -->
    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="3">
        <StatsCard title="إجمالي المنتجات" :value="summary.totalProducts" icon="ri-box-3-line" color="#2196F3" />
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <StatsCard title="قيمة المخزون" :value="summary.stockValue" type="currency" icon="ri-money-dollar-box-line" color="#4CAF50" />
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <StatsCard title="منتجات منخفضة" :value="summary.lowStock" icon="ri-alert-line" color="#FF9800" trend="-12%" />
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <StatsCard title="نفذ من المخزن" :value="summary.outOfStock" icon="ri-close-circle-line" color="#F44336" />
      </v-col>
    </v-row>

    <!-- Charts & Tables -->
    <v-row>
      <v-col cols="12" md="8">
        <AppCard title="المخزون حسب الفئة" icon="ri-bar-chart-line">
          <div class="pa-4">
            <canvas ref="stockChartRef" height="300"></canvas>
          </div>
        </AppCard>
      </v-col>

      <v-col cols="12" md="4">
        <AppCard title="المنتجات الأكثر مبيعاً" icon="ri-fire-line">
          <v-list>
            <v-list-item v-for="product in topMoving" :key="product.id" :title="product.name" :subtitle="`مخزون: ${product.stock}`">
              <template #append>
                <v-chip size="small" :color="getStockColor(product.stock)">
                  {{ product.stock }}
                </v-chip>
              </template>
            </v-list-item>
          </v-list>
        </AppCard>
      </v-col>
    </v-row>

    <!-- Low Stock Alert -->
    <v-row class="mt-4">
      <v-col cols="12">
        <AppCard title="تنبيهات المخزون" icon="ri-notification-line">
          <AppDataTable :headers="alertHeaders" :items="lowStockItems" :loading="loading">
            <template #item.stock="{ item }">
              <v-chip :color="getStockColor(item.stock)" size="small"> {{ item.stock }} / {{ item.min_stock }} </v-chip>
            </template>

            <template #item.actions="{ item }">
              <CanView permission="products.update">
                <v-btn size="small" color="primary" @click="handleRestock(item)"> إعادة تخزين </v-btn>
              </CanView>
            </template>
          </AppDataTable>
        </AppCard>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { AppCard, AppDataTable } from '@/components';
import StatsCard from '@/components/common/StatsCard.vue';
import CanView from '@/components/common/CanView.vue';
import Chart from 'chart.js/auto';

const stockChartRef = ref(null);
const loading = ref(false);

const summary = ref({
  totalProducts: 342,
  stockValue: 850000,
  lowStock: 23,
  outOfStock: 8,
});

const topMoving = ref([
  { id: 1, name: 'منتج أ', stock: 45 },
  { id: 2, name: 'منتج ب', stock: 32 },
  { id: 3, name: 'منتج ج', stock: 28 },
]);

const alertHeaders = [
  { title: 'المنتج', key: 'name' },
  { title: 'الفئة', key: 'category' },
  { title: 'المخزون', key: 'stock' },
  { title: 'السعر', key: 'price' },
  { title: 'الإجراءات', key: 'actions' },
];

const lowStockItems = ref([
  { id: 1, name: 'منتج أ', category: 'فئة 1', stock: 5, min_stock: 20, price: 100 },
  { id: 2, name: 'منتج ب', category: 'فئة 2', stock: 3, min_stock: 15, price: 150 },
]);

const getStockColor = stock => {
  if (stock === 0) return 'error';
  if (stock < 10) return 'warning';
  return 'success';
};

const handleRestock = product => {
  console.log('Restock:', product.name);
};

const initChart = () => {
  if (stockChartRef.value) {
    new Chart(stockChartRef.value, {
      type: 'bar',
      data: {
        labels: ['إلكترونيات', 'ملابس', 'أغذية', 'أخرى'],
        datasets: [
          {
            label: 'المخزون',
            data: [120, 85, 95, 42],
            backgroundColor: ['#2196F3', '#4CAF50', '#FF9800', '#9C27B0'],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
      },
    });
  }
};

onMounted(() => {
  initChart();
});
</script>

<style scoped>
.stock-report-page {
  padding: 24px;
}
</style>
