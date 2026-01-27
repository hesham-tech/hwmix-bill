<template>
  <div class="purchases-wrapper">
    <AppPageHeader title="مشترياتي" subtitle="عرض جميع فواتير الشراء والخدمات الخاصة بك" icon="ri-bill-line">
      <template #controls>
        <v-col cols="12" md="12">
          <AppInput
            v-model="filters.search"
            placeholder="بحث برقم الفاتورة..."
            prepend-inner-icon="ri-search-line"
            clearable
            hide-details
            variant="solo-filled"
            density="comfortable"
            flat
            class="rounded-lg px-0"
            @update:model-value="debouncedSearch"
          />
        </v-col>
      </template>
    </AppPageHeader>

    <v-container fluid class="pt-0">
      <v-row>
        <v-col cols="12">
          <v-card rounded="xl" class="border shadow-sm overflow-hidden">
            <PurchasesDataTable
              :items="items"
              :loading="loading"
              :total="total"
              :current-page="currentPage"
              :per-page="perPage"
              @view="viewInvoice"
              @print="printInvoice"
              @update:page="changePage"
              @update:per-page="changePerPage"
              @update:sort-by="changeSort"
            />
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useDataTable } from '@/composables/useDataTable';
import { useApi } from '@/composables/useApi';
import PurchasesDataTable from '../components/PurchasesDataTable.vue';
import AppPageHeader from '@/components/common/AppPageHeader.vue';
import { toast } from 'vue3-toastify';

const router = useRouter();

// API
const invoiceApi = useApi('/api/invoices');

// Fetch function for useDataTable
const fetchInvoices = async params => {
  return await invoiceApi.get(params, { showLoading: false });
};

// DataTable composable
const { items, loading, currentPage, perPage, total, filters, changePage, changePerPage, changeSort, applyFilters } = useDataTable(fetchInvoices, {
  initialPerPage: 10,
  syncWithUrl: true,
  immediate: true,
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
const viewInvoice = invoice => {
  router.push(`/invoices/${invoice.id}`);
};

const printInvoice = async invoice => {
  try {
    toast.info('جاري تجهيز الفاتورة للطباعة...');
    window.open(`/api/invoice/${invoice.id}/pdf`, '_blank');
  } catch (error) {
    toast.error('فشل في طباعة الفاتورة');
  }
};
</script>
