<template>
  <v-container fluid>
    <!-- Header -->
    <div class="d-flex align-center mb-4">
      <div>
        <h1 class="text-h4 font-weight-bold">الفواتير</h1>
        <p class="text-medium-emphasis">إدارة جميع الفواتير</p>
      </div>
      <v-spacer />
      <v-btn v-if="can('invoices.create')" color="primary" prepend-icon="ri-add-line" size="large" @click="navigateToCreate"> فاتورة جديدة </v-btn>
    </div>

    <!-- Filters -->
    <InvoiceFilters v-model="filters" @apply="applyFilters" />

    <!-- Bulk Actions -->
    <v-card v-if="hasSelection" class="mb-4 bg-primary-lighten-5">
      <v-card-text class="d-flex align-center">
        <div class="text-primary font-weight-medium">تم تحديد {{ selectedIds.length }} فاتورة</div>
        <v-spacer />
        <v-btn v-if="can('invoices.delete_all')" variant="outlined" color="error" prepend-icon="ri-delete-bin-line" @click="confirmBulkDelete">
          حذف المحدد
        </v-btn>
      </v-card-text>
    </v-card>

    <!-- Data Table -->
    <v-card>
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

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h5">
          <v-icon icon="ri-error-warning-line" color="error" class="me-2" />
          تأكيد الحذف
        </v-card-title>
        <v-card-text> هل أنت متأكد من حذف هذه الفاتورة؟ لا يمكن التراجع عن هذا الإجراء. </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="deleteDialog = false"> إلغاء </v-btn>
          <v-btn color="error" variant="flat" :loading="deleting" @click="deleteInvoice"> حذف </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
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
