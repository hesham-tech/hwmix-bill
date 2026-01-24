<template>
  <ReportLayout
    v-if="can(PERMISSIONS.REPORTS_STOCK)"
    title="تقرير تقييم المخزون"
    description="تحليل قيمة البضاعة المتوفرة، هوامش الربح المتوقعة، وتنبيهات النواقص"
    :loading="loading"
    @refresh="loadReport"
    @export="handleExport"
  >
    <!-- Filters -->
    <template #filters>
      <div class="d-flex flex-column gap-4">
        <v-select
          v-model="filters.stock_status"
          label="حالة المخزون"
          :items="[
            { title: 'الكل', value: '' },
            { title: 'متوفر', value: 'in_stock' },
            { title: 'منخفض', value: 'low_stock' },
            { title: 'نافذ', value: 'out_of_stock' },
          ]"
          variant="outlined"
          density="compact"
        />
        <AppInput v-model="filters.threshold" label="حد التنبيه (Low Stock)" type="number" />
        <AppButton color="primary" block @click="loadReport">تحديث التقرير</AppButton>
      </div>
    </template>

    <!-- Summary -->
    <template #summary>
      <v-row dense>
        <v-col cols="12" sm="4">
          <v-card border flat class="rounded-lg pa-4 bg-primary-lighten-5 border-primary">
            <div class="text-caption font-weight-bold text-primary">إجمالي قيمة التكلفة</div>
            <div class="text-h4 font-weight-black text-primary">{{ formatCurrency(summary.total_cost_value) }}</div>
          </v-card>
        </v-col>
        <v-col cols="12" sm="4">
          <v-card border flat class="rounded-lg pa-4 bg-success-lighten-5 border-success">
            <div class="text-caption font-weight-bold text-success">القيمة البيعية المتوقعة</div>
            <div class="text-h4 font-weight-black text-success">{{ formatCurrency(summary.total_sale_value) }}</div>
          </v-card>
        </v-col>
        <v-col cols="12" sm="4">
          <v-card border flat class="rounded-lg pa-4 bg-info-lighten-5 border-info">
            <div class="text-caption font-weight-bold text-info">الربح التقديري المحتمل</div>
            <div class="text-h4 font-weight-black text-info">{{ formatCurrency(summary.potential_profit) }}</div>
          </v-card>
        </v-col>
      </v-row>
    </template>

    <!-- Charts -->
    <template #charts>
      <v-row>
        <v-col cols="12" md="6">
          <StockValuationChart :summary="summary" :loading="loading" />
        </v-col>
        <v-col cols="12" md="6">
          <v-card border flat class="rounded-lg pa-4 fill-height">
            <h3 class="text-h6 font-weight-black mb-4">تنبيهات حالة المخزون</h3>
            <v-list density="compact">
              <v-list-item
                prepend-icon="ri-error-warning-line"
                title="أصناف قاربت على النفاذ"
                :subtitle="`${lowStockCount} منتج وصل للحد الأدنى`"
                base-color="warning"
              />
              <v-list-item
                prepend-icon="ri-close-circle-line"
                title="أصناف نفذت تماماً"
                :subtitle="`${outOfStockCount} منتج بدون رصيد`"
                base-color="error"
              />
            </v-list>
          </v-card>
        </v-col>
      </v-row>
    </template>

    <!-- Table -->
    <template #table>
      <AppDataTable :headers="headers" :items="valuationData" :loading="loading" title="تقييم المنتجات التفصيلي" icon="ri-barcode-line">
        <template #item.total_quantity="{ item }">
          <v-chip
            :color="item.total_quantity <= 0 ? 'error' : item.total_quantity <= 10 ? 'warning' : 'success'"
            size="small"
            variant="flat"
            class="font-weight-bold"
          >
            {{ item.total_quantity }}
          </v-chip>
        </template>
        <template #item.total_cost_value="{ item }">
          <span class="text-grey-darken-2">{{ formatCurrency(item.total_cost_value) }}</span>
        </template>
        <template #item.total_sale_value="{ item }">
          <span class="font-weight-bold text-success">{{ formatCurrency(item.total_sale_value) }}</span>
        </template>
      </AppDataTable>
    </template>
  </ReportLayout>

  <!-- Access Denied State -->
  <div v-else class="pa-12 text-center d-flex flex-column align-center justify-center" style="min-height: 400px">
    <v-avatar size="100" color="error-lighten-5" class="mb-6">
      <v-icon icon="ri-lock-2-line" size="48" color="error" />
    </v-avatar>
    <h2 class="text-h4 font-weight-bold mb-2">عذراً، لا تملك الصلاحية</h2>
    <p class="text-body-1 text-grey mb-6">ليس لديك إذن للوصول إلى تقارير تقييم المخزون. يرجى مراجعة المسؤول.</p>
    <AppButton to="/dashboard" color="primary" variant="tonal" prepend-icon="ri-home-4-line"> العودة للرئيسية </AppButton>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { usePermissions } from '@/composables/usePermissions';
import { PERMISSIONS } from '@/config/permissions';
import { formatCurrency } from '@/utils/formatters';
import { useApi } from '@/composables/useApi';
import { usePrintExport } from '@/composables/usePrintExport';
import StockValuationChart from '../components/StockValuationChart.vue';
import ReportLayout from '../components/ReportLayout.vue';
import AppButton from '@/components/common/AppButton.vue';
import AppInput from '@/components/common/AppInput.vue';
import AppDataTable from '@/components/common/AppDataTable.vue';

const { can } = usePermissions();

const api = useApi('/api/reports/stock');
const { exportToCSV } = usePrintExport();

const loading = ref(false);
const filters = ref({
  stock_status: '',
  threshold: 10,
});

const valuationData = ref([]);
const summary = ref({
  total_cost_value: 0,
  total_sale_value: 0,
  potential_profit: 0,
});

const lowStockCount = ref(0);
const outOfStockCount = ref(0);

const headers = [
  { title: 'المنتج', key: 'product_name' },
  { title: 'الكمية المتوفرة', key: 'total_quantity', align: 'center' },
  { title: 'قيمة التكلفة', key: 'total_cost_value', align: 'end' },
  { title: 'القيمة البيعية', key: 'total_sale_value', align: 'end' },
];

const loadReport = async () => {
  loading.value = true;
  try {
    // 1. Fetch Valuation (Charts & Table Data)
    const valRes = await useApi('/api/reports/stock/valuation').get(filters.value, { showLoading: false });
    valuationData.value = valRes.valuation || [];
    summary.value = valRes.summary || { total_cost_value: 0, total_sale_value: 0, potential_profit: 0 };

    // 2. Fetch Low Stock for Alerts
    const lowRes = await useApi('/api/reports/stock/low-stock').get({ threshold: filters.value.threshold }, { showLoading: false });
    lowStockCount.value = lowRes.count || 0;
    outOfStockCount.value = valuationData.value.filter(i => i.total_quantity <= 0).length;
  } finally {
    loading.value = false;
  }
};

const handleExport = () => {
  if (!can(PERMISSIONS.REPORTS_EXPORT)) {
    return;
  }
  const data = valuationData.value.map(item => ({
    المنتج: item.product_name,
    الكمية: item.total_quantity,
    'قيمة التكلفة': item.total_cost_value,
    'القيمة البيعية': item.total_sale_value,
  }));
  exportToCSV(data, 'تقرير_تقييم_المخزون.csv');
};

onMounted(loadReport);
</script>
