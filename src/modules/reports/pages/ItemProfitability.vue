<template>
  <div class="pa-4">
    <!-- Header -->
    <div class="d-flex align-center justify-space-between mb-4">
      <div>
        <h2 class="text-h5 font-weight-bold mb-1">أرباح مبيعات الأصناف</h2>
        <div class="text-body-2 text-grey-darken-1">تحليل حركة مبيعات الأصناف وتكلفة شرائها وأرباحها المحققة</div>
      </div>
      
      <!-- Filters -->
      <div class="d-flex gap-3 align-center flex-wrap">
        <div v-if="selectedPeriod === 'custom'" class="d-flex gap-2">
          <v-text-field label="من تاريخ" type="date" v-model="dateFrom" density="compact" variant="outlined" hide-details @update:model-value="fetchData" style="width: 140px;"></v-text-field>
          <v-text-field label="إلى تاريخ" type="date" v-model="dateTo" density="compact" variant="outlined" hide-details @update:model-value="fetchData" style="width: 140px;"></v-text-field>
        </div>

        <v-btn-toggle v-model="selectedPeriod" mandatory color="primary" variant="outlined" divided density="comfortable" class="rounded-lg" @update:model-value="onPeriodChange">
          <v-btn value="today" size="small" class="px-4">اليوم</v-btn>
          <v-btn value="week" size="small" class="px-4">الأسبوع</v-btn>
          <v-btn value="month" size="small" class="px-4">الشهر</v-btn>
          <v-btn value="custom" size="small" class="px-4">مخصص</v-btn>
        </v-btn-toggle>
      </div>
    </div>

    <!-- Mini Stats -->
    <v-row class="mb-4">
      <v-col cols="12" sm="6" md="3">
        <v-card class="pa-4 rounded-lg bg-primary-lighten-5" flat border>
          <div class="text-caption font-weight-bold text-primary mb-1">إجمالي الكميات المباعة</div>
          <div class="text-h5 font-weight-black text-primary">{{ formatNumber(summary.total_qty) }}</div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card class="pa-4 rounded-lg bg-orange-lighten-5" flat border>
          <div class="text-caption font-weight-bold text-orange-darken-3 mb-1">إجمالي التكلفة</div>
          <div class="text-h5 font-weight-black text-orange-darken-3">{{ formatCurrency(summary.total_cost) }}</div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card class="pa-4 rounded-lg bg-info-lighten-5" flat border>
          <div class="text-caption font-weight-bold text-info-darken-1 mb-1">إجمالي الإيرادات</div>
          <div class="text-h5 font-weight-black text-info-darken-1">{{ formatCurrency(summary.total_revenue) }}</div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card class="pa-4 rounded-lg bg-success-lighten-5" flat border>
          <div class="text-caption font-weight-bold text-success-darken-2 mb-1">إجمالي الربح</div>
          <div class="text-h5 font-weight-black text-success-darken-2">{{ formatCurrency(summary.total_profit) }}</div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Data Table -->
    <v-card class="rounded-lg border shadow-sm">
      <v-data-table-server
        v-model:items-per-page="options.itemsPerPage"
        :headers="headers"
        :items="items"
        :items-length="totalItems"
        :loading="loading"
        class="border-0"
        @update:options="onOptionsUpdate"
      >
        <template v-slot:item.issue_date="{ item }">
          {{ formatDate(item.issue_date) }}
        </template>
        
        <template v-slot:item.unit_price="{ item }">
          {{ formatCurrency(item.unit_price) }}
        </template>
        
        <template v-slot:item.cost_price="{ item }">
          <span class="text-orange-darken-3">{{ formatCurrency(item.cost_price) }}</span>
        </template>

        <template v-slot:item.profit="{ item }">
          <v-chip :color="item.profit > 0 ? 'success' : 'error'" size="small" variant="flat" class="font-weight-bold">
            {{ formatCurrency(item.profit) }}
          </v-chip>
        </template>
        
        <template v-slot:item.invoice_number="{ item }">
          <router-link :to="`/app/invoices/view/${item.invoice_id}`" class="text-primary text-decoration-none font-weight-medium">
            #{{ item.invoice_number }}
          </router-link>
        </template>
      </v-data-table-server>
    </v-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import apiClient from '@/api/axios.config';
import { formatCurrency, formatDate, formatNumber } from '@/utils/formatters';

const route = useRoute();
const selectedPeriod = ref(route.query.period || 'today');

const dateFrom = ref(new Date().toISOString().substr(0, 10));
const dateTo = ref(new Date().toISOString().substr(0, 10));

const loading = ref(false);
const items = ref([]);
const totalItems = ref(0);
const summary = ref({ total_qty: 0, total_cost: 0, total_revenue: 0, total_profit: 0 });

const options = ref({
  page: 1,
  itemsPerPage: 15,
});

const headers = [
  { title: 'الفاتورة', key: 'invoice_number', sortable: false },
  { title: 'التاريخ', key: 'issue_date', sortable: false },
  { title: 'اسم الصنف', key: 'name', sortable: false },
  { title: 'الكمية', key: 'quantity', sortable: false, align: 'center' },
  { title: 'التكلفة', key: 'cost_price', sortable: false },
  { title: 'سعر البيع', key: 'unit_price', sortable: false },
  { title: 'إجمالي الربح', key: 'profit', sortable: false },
];

const onPeriodChange = () => {
  if (selectedPeriod.value !== 'custom') {
    fetchData();
  }
};

const fetchData = async () => {
  loading.value = true;
  try {
    const params = {
      period: selectedPeriod.value,
      page: options.value.page,
      per_page: options.value.itemsPerPage,
    };
    
    if (selectedPeriod.value === 'custom') {
      params.date_from = dateFrom.value;
      params.date_to = dateTo.value;
    }

    const response = await apiClient.get('reports/item-profitability', { params });
    
    // Support standard axios response format
    const resData = response.data?.data || response.data;
    
    items.value = resData.items?.data || [];
    totalItems.value = resData.items?.total || 0;
    summary.value = resData.summary || { total_qty: 0, total_cost: 0, total_revenue: 0, total_profit: 0 };
  } catch (error) {
    console.error('Failed to fetch item profitability', error);
  } finally {
    loading.value = false;
  }
};

const onOptionsUpdate = (newOptions) => {
  options.value = newOptions;
  fetchData();
};
</script>