<template>
  <v-container fluid>
    <div class="d-flex align-center justify-space-between mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold">الفواتير</h1>
        <p class="text-body-1 text-grey">إدارة جميع الفواتير الصادرة والواردة</p>
      </div>
      <AppButton v-if="can('invoices.create')" prepend-icon="ri-add-line" size="large" @click="navigateToCreate"> فاتورة جديدة </AppButton>
    </div>

    <!-- Filters -->
    <InvoiceFilters v-model="filters" @apply="applyFilters" />

    <!-- Bulk Actions -->
    <AppCard v-if="hasSelection" class="mb-4" color="primary" variant="tonal">
      <div class="d-flex align-center px-4 py-2">
        <div class="text-primary font-weight-bold">تم تحديد {{ selectedIds.length }} فاتورة</div>
        <v-spacer />
        <AppButton v-if="can('invoices.delete_all')" variant="outlined" color="error" prepend-icon="ri-delete-bin-line" @click="confirmBulkDelete">
          حذف المحدد
        </AppButton>
      </div>
    </AppCard>

    <!-- Data Table -->
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
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useDataTable } from '@/composables/useDataTable';
import { useApi } from '@/composables/useApi';
import { usePermissions } from '@/composables/usePermissions';
import InvoiceDataTable from '../components/InvoiceDataTable.vue';
import InvoiceFilters from '../components/InvoiceFilters.vue';
import AppButton from '@/components/common/AppButton.vue';
import AppCard from '@/components/common/AppCard.vue';
import AppDialog from '@/components/common/AppDialog.vue';
import { toast } from 'vue3-toastify';

const router = useRouter();
const { can } = usePermissions();

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
});

// Delete state
const deleteDialog = ref(false);
const itemToDelete = ref(null);
const deleting = ref(false);

// Navigation
const navigateToCreate = () => {
  router.push('/invoices/create');
};

const viewInvoice = invoice => {
  router.push(`/invoices/${invoice.id}`);
};

const editInvoice = invoice => {
  router.push(`/invoices/${invoice.id}/edit`);
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
