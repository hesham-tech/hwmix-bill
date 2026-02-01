<template>
  <div class="invoice-list-wrapper">
    <AppPageHeader title="الفواتير" subtitle="إدارة جميع الفواتير الصادرة والواردة" icon="ri-file-list-3-line" sticky>
      <template #append>
        <AppButton v-if="can(PERMISSIONS.INVOICES_CREATE)" prepend-icon="ri-add-line" size="large" @click="navigateToCreate">
          فاتورة جديدة
        </AppButton>
      </template>
      <template #controls>
        <v-col cols="12" md="8">
          <AppInput
            v-model="filters.search"
            placeholder="بحث سريع برقم الفاتورة أو اسم العميل..."
            prepend-inner-icon="ri-search-line"
            clearable
            hide-details
            variant="solo-filled"
            density="comfortable"
            flat
            class="rounded-md"
            @update:model-value="debouncedSearch"
          />
        </v-col>
        <v-col cols="auto" class="d-md-none">
          <AppButton icon="ri-filter-line" color="primary" @click="showAdvanced = !showAdvanced" />
        </v-col>
      </template>
    </AppPageHeader>

    <v-container fluid class="pa-0">
      <!-- Advanced Filters (Expandable on Mobile) -->
      <div>
        <v-expand-transition>
          <div v-show="showAdvanced || !mobile" class="d-md-none">
            <InvoiceFilters v-model="filters" @apply="applyFilters" />
          </div>
        </v-expand-transition>
      </div>

      <!-- Desktop: Side-by-side Layout -->
      <v-row class="d-none d-md-flex ma-0">
        <!-- Table Column (8/12) -->
        <v-col cols="12" md="8" class="pa-0">
          <!-- Bulk Actions -->
          <AppCard v-if="hasSelection" class="mb-4" color="primary" variant="tonal">
            <div class="d-flex align-center px-4 py-2">
              <div class="text-primary font-weight-bold">تم تحديد {{ selectedIds.length }} فاتورة</div>
              <v-spacer />
              <AppButton
                v-if="canAny(PERMISSIONS.INVOICES_DELETE_ALL, PERMISSIONS.INVOICES_DELETE_CHILDREN, PERMISSIONS.INVOICES_DELETE_SELF)"
                variant="outlined"
                color="error"
                prepend-icon="ri-delete-bin-line"
                @click="confirmBulkDelete"
              >
                حذف المحدد
              </AppButton>
            </div>
          </AppCard>

          <v-card rounded="md" class="border shadow-sm">
            <InvoiceDataTable
              :items="items"
              :loading="loading"
              :total="total"
              :current-page="currentPage"
              :per-page="perPage"
              :table-height="'calc(100vh - 350px)'"
              @view="viewInvoice"
              @edit="editInvoice"
              @print="printInvoice"
              @delete="confirmDelete"
              @update:page="changePage"
              @update:per-page="changePerPage"
              @update:sort-by="changeSort"
            />
          </v-card>
        </v-col>

        <!-- Filters Column (4/12) -->
        <v-col cols="12" md="4" class="pa-0">
          <div class="sticky-filters">
            <InvoiceFilters v-model="filters" @apply="applyFilters" />
          </div>
        </v-col>
      </v-row>

      <!-- Mobile: Table Only (Full Width) -->
      <div class="d-md-none">
        <v-card rounded="md" class="border shadow-sm">
          <InvoiceDataTable
            :items="items"
            :loading="loading"
            :total="total"
            :current-page="currentPage"
            :per-page="perPage"
            @view="viewInvoice"
            @edit="editInvoice"
            @print="printInvoice"
            @delete="confirmDelete"
            @update:page="changePage"
            @update:per-page="changePerPage"
            @update:sort-by="changeSort"
          />
        </v-card>
      </div>

      <!-- Delete Confirmation Dialog -->
      <AppDialog
        v-model="deleteDialog"
        title="تأكيد الحذف"
        icon="ri-delete-bin-line"
        confirm-color="error"
        confirm-text="حذف الفاتورة"
        :loading="deleting"
        @confirm="deleteInvoice"
      >
        هل أنت متأكد من حذف هذه الفاتورة؟ لا يمكن التراجع عن هذا الإجراء.
      </AppDialog>
    </v-container>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useDisplay } from 'vuetify';
import { useDataTable } from '@/composables/useDataTable';
import { useApi } from '@/composables/useApi';
import { usePermissions } from '@/composables/usePermissions';
import { PERMISSIONS } from '@/config/permissions';
import InvoiceDataTable from '../components/InvoiceDataTable.vue';
import InvoiceFilters from '../components/InvoiceFilters.vue';
import AppPageHeader from '@/components/common/AppPageHeader.vue';
import AppButton from '@/components/common/AppButton.vue';
import AppCard from '@/components/common/AppCard.vue';
import AppDialog from '@/components/common/AppDialog.vue';
import { toast } from 'vue3-toastify';

const router = useRouter();
const { can, canAny } = usePermissions();
const { mobile } = useDisplay();

// API
const invoiceApi = useApi('/api/invoices');

// Fetch function for useDataTable
const fetchInvoices = async params => {
  return await invoiceApi.get(params, { showLoading: false });
};

// DataTable composable
const {
  items,
  loading,
  currentPage,
  perPage,
  total,
  filters,
  selectedIds,
  hasSelection,
  changePage,
  changePerPage,
  changeSort,
  applyFilters,
  removeItem,
  refresh,
} = useDataTable(fetchInvoices, {
  initialPerPage: 10,
  syncWithUrl: true,
  immediate: true,
});

// UI State
const showAdvanced = ref(false);

// Delete state
const deleteDialog = ref(false);
const itemToDelete = ref(null);
const deleting = ref(false);

// Debounce search
let searchTimeout;
const debouncedSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    applyFilters();
  }, 500);
};

// Navigation
const navigateToCreate = () => {
  router.push('/app/invoices/create');
};

const viewInvoice = invoice => {
  router.push(`/app/invoices/${invoice.id}`);
};

const editInvoice = invoice => {
  router.push(`/app/invoices/${invoice.id}/edit`);
};

const printInvoice = async invoice => {
  try {
    // TODO: Implement PDF generation
    toast.info('جاري تجهيز الفاتورة للطباعة...');
    window.open(`/api/invoice/${invoice.id}/pdf`, '_blank');
  } catch (error) {
    toast.error('فشل في طباعة الفاتورة');
  }
};

const confirmDelete = invoice => {
  itemToDelete.value = invoice;
  deleteDialog.value = true;
};

const deleteInvoice = async () => {
  if (!itemToDelete.value) return;

  deleting.value = true;
  try {
    await invoiceApi.remove(itemToDelete.value.id);
    removeItem(itemToDelete.value.id);
    deleteDialog.value = false;
    itemToDelete.value = null;
  } catch (error) {
    // Error handled in useApi
  } finally {
    deleting.value = false;
  }
};

const confirmBulkDelete = () => {
  // TODO: Implement bulk delete
  toast.info('ميزة الحذف الجماعي قيد التطوير');
};
</script>

<style scoped>
.invoice-list-wrapper :deep(.v-container) {
  max-width: 100% !important;
}
</style>
