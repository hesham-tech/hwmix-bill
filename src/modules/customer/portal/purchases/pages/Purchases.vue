<template>
  <div class="purchases-portal">
    <v-container fluid class="pa-2">
      <!-- Welcome Header -->
      <div class="d-flex justify-space-between align-center mb-2">
        <div>
          <h1 class="text-h4 font-weight-bold mb-1">مشترياتي</h1>
          <p class="text-subtitle-1 text-grey-darken-1">تابع فواتيرك ومدفوعاتك بكل سهولة</p>
        </div>
        <v-avatar color="primary" rounded="md" size="56" class="elevation-4 shadow-primary">
          <v-icon icon="ri-bill-line" color="white" size="32" />
        </v-avatar>
      </div>

      <!-- Quick Stats -->
      <v-row class="mb-2">
        <v-col cols="12" sm="4">
          <v-card variant="flat" border class="rounded-md pa-4 bg-primary-lighten-5 border-primary opacity-90">
            <div class="text-caption text-primary-darken-2 font-weight-bold mb-1">إجمالي المشتريات</div>
            <div class="text-h5 font-weight-bold">{{ formatCurrency(summary.total_amount) }}</div>
          </v-card>
        </v-col>
        <v-col cols="12" sm="4">
          <v-card variant="flat" border class="rounded-md pa-4 bg-error-lighten-5 border-error">
            <div class="text-caption text-error-darken-2 font-weight-bold mb-1">المبلغ المطلوب سداده</div>
            <div class="text-h5 font-weight-bold text-error">{{ formatCurrency(summary.due_amount) }}</div>
          </v-card>
        </v-col>
        <v-col cols="12" sm="4">
          <v-card variant="flat" border class="rounded-md pa-4 bg-success-lighten-5 border-success">
            <div class="text-caption text-success-darken-2 font-weight-bold mb-1">عدد الفواتير</div>
            <div class="text-h5 font-weight-bold">{{ total }}</div>
          </v-card>
        </v-col>
      </v-row>

      <!-- Search & Filters -->
      <div class="d-flex flex-column flex-sm-row gap-4 mb-2 align-center">
        <v-text-field
          v-model="filters.search"
          placeholder="ابحث برقم الفاتورة..."
          prepend-inner-icon="ri-search-2-line"
          variant="solo"
          flat
          border
          class="rounded-md flex-grow-1"
          hide-details
          density="comfortable"
          @update:model-value="debouncedSearch"
        />
        <v-btn
          variant="tonal"
          color="primary"
          height="48"
          class="rounded-md px-6 font-weight-bold"
          prepend-icon="ri-refresh-line"
          @click="refresh"
          :loading="loading"
        >
          تحديث
        </v-btn>
      </div>

      <!-- Loading State -->
      <div v-if="loading && items.length === 0" class="d-flex justify-center py-12">
        <v-progress-circular indeterminate color="primary" size="64" />
      </div>

      <!-- Empty State -->
      <div v-else-if="items.length === 0" class="text-center py-12 bg-grey-lighten-4 rounded-md border border-dashed mt-4">
        <v-icon icon="ri-inbox-line" size="64" color="grey-lighten-1" class="mb-4" />
        <h3 class="text-h6 font-weight-bold text-grey-darken-1">لا توجد فواتير حالياً</h3>
        <p class="text-body-2 text-grey">كل مشترياتك ستظهر هنا بمجرد صدورها</p>
      </div>

      <!-- Purchases Grid -->
      <template v-else>
        <v-row class="dense-grid">
          <v-col v-for="item in purchases" :key="item.id" cols="12" sm="6" lg="4" class="pa-2">
            <PortalPurchaseCard :purchase="item" @view="viewPurchase" />
          </v-col>
        </v-row>

        <!-- Pagination -->
        <div class="d-flex justify-center mt-8">
          <v-pagination
            v-model="currentPage"
            :length="Math.ceil(total / perPage)"
            :total-visible="5"
            rounded="circle"
            color="primary"
            @update:model-value="changePage"
          />
        </div>
      </template>
    </v-container>
  </div>
</template>

<script setup>
import { reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useDataTable } from '@/composables/useDataTable';
import { useApi } from '@/composables/useApi';
import { formatCurrency } from '@/utils/formatters';
import PortalPurchaseCard from '../../components/PortalPurchaseCard.vue';
import { toast } from 'vue3-toastify';

const router = useRouter();
const invoiceApi = useApi('/api/invoices');

const fetchInvoices = async params => {
  return await invoiceApi.get(params, { showLoading: false });
};

const {
  items: purchases,
  loading,
  currentPage,
  perPage,
  total,
  filters,
  changePage,
  applyFilters,
  refresh,
} = useDataTable(fetchInvoices, {
  initialPerPage: 9,
  syncWithUrl: true,
  immediate: true,
});

// Summary Stats Calculation
const summary = computed(() => {
  return purchases.value.reduce(
    (acc, item) => {
      acc.total_amount += parseFloat(item.net_amount || 0);
      acc.due_amount += parseFloat(item.remaining_amount || 0);
      return acc;
    },
    { total_amount: 0, due_amount: 0 }
  );
});

// Debounce search
let searchTimeout;
const debouncedSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    applyFilters();
  }, 500);
};

// Navigation
const viewPurchase = purchase => {
  router.push(`/app/purchases/${purchase.id}`);
};
</script>

<style scoped>
.gap-4 {
  gap: 16px;
}
.shadow-primary {
  box-shadow: 0 4px 12px rgba(var(--v-theme-primary), 0.3) !important;
}
</style>
