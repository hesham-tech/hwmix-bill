<template>
  <div class="invoice-list-wrapper">
    <AppDataTable
      v-model:sort-by="sortByVuetify"
      v-model:search="search"
      :headers="headers"
      :items="items"
      :loading="loading"
      :total-items="total"
      :page="currentPage"
      :items-per-page="perPage"
      :filters="advancedFilters"
      :grid-enabled="true"
      :grid-options="gridOptions"
      :infinite-scroll="true"
      :has-more="hasMore"
      permission-module="invoices"
      title="الفواتير"
      subtitle="إدارة جميع الفواتير الصادرة والواردة"
      icon="ri-file-list-3-line"
      @update:page="changePage"
      @update:items-per-page="changePerPage"
      @load="loadNextPage"
      @view="viewInvoice"
      @edit="editInvoice"
      @delete="confirmDelete"
      @update:filters="applyFilters"
    >
      <template #actions>
        <AppButton v-if="can(PERMISSIONS.INVOICES_CREATE)" prepend-icon="ri-add-line" @click="navigateToCreate"> فاتورة جديدة </AppButton>
      </template>

      <!-- الفاتورة (رقم + نوع) -->
      <template #item.invoice_number="{ item }">
        <div>
          <div class="text-primary font-weight-bold cursor-pointer hover-underline mb-1" @click="viewInvoice(item)">#{{ item.invoice_number }}</div>
          <v-chip size="x-small" variant="tonal" color="secondary" class="font-weight-medium">
            {{ item.invoice_type?.name }}
          </v-chip>
        </div>
      </template>

      <!-- العميل -->
      <template #item.customer="{ item, isGrid }">
        <div class="d-flex align-center gap-3 py-2">
          <AppUserBalanceProfile :user="item.customer || item.user" mode="horizontal" :avatar-size="isGrid ? 0 : 36" :hide-avatar="isGrid" />
        </div>
      </template>

      <!-- التاريخ -->
      <template #item.issue_date="{ item }">
        <div class="d-flex flex-column">
          <div class="d-flex align-center text-body-2">
            <v-icon icon="ri-calendar-line" size="14" class="me-1 text-grey" />
            {{ formatDate(item.issue_date) }}
          </div>
          <div v-if="item.due_date" class="d-flex align-center text-caption text-error font-weight-medium mt-1">
            <v-icon icon="ri-time-line" size="12" class="me-1" />
            {{ formatDate(item.due_date) }}
          </div>
        </div>
      </template>

      <!-- المالية (إجمالي + مدفوع + متبقي) -->
      <template #item.financials="{ item }">
        <div class="financial-compact py-1">
          <div class="d-flex align-center justify-space-between mb-1">
            <span class="text-grey-darken-1 text-caption">الإجمالي:</span>
            <span class="font-weight-bold text-primary">{{ formatCurrency(item.net_amount) }}</span>
          </div>

          <div class="d-flex align-center justify-space-between mb-1">
            <span class="text-grey-darken-1 text-caption">المدفوع:</span>
            <span class="text-success font-weight-medium">{{ formatCurrency(item.paid_amount) }}</span>
          </div>

          <div class="d-flex align-center justify-space-between">
            <span class="text-grey-darken-1 text-caption">المتبقي:</span>
            <span :class="['font-weight-bold', parseFloat(item.remaining_amount) > 0 ? 'text-error' : 'text-grey-darken-1']">
              {{ formatCurrency(item.remaining_amount) }}
            </span>
          </div>
        </div>
      </template>

      <!-- الحالة (حالة مع حالة الدفع) -->
      <template #item.status="{ item }">
        <div class="d-flex flex-column gap-1">
          <v-chip :color="getStatusColor(item.status)" size="small" variant="tonal" class="font-weight-bold">
            {{ getStatusLabel(item.status) }}
          </v-chip>
          <v-chip :color="getPaymentStatusColor(item.payment_status)" size="x-small" variant="outlined" class="font-weight-medium">
            <v-icon :icon="getPaymentStatusIcon(item.payment_status)" size="12" class="me-1" />
            {{ getPaymentStatusLabel(item.payment_status) }}
          </v-chip>
        </div>
      </template>

      <!-- الإجراءات الإضافية -->
      <template #extra-actions="{ item }">
        <AppButton size="x-small" variant="text" color="warning" tooltip="طباعة الفاتورة" @click.stop="printInvoice(item)">
          <v-icon size="16">ri-printer-line</v-icon>
        </AppButton>
      </template>
    </AppDataTable>

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
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useDataTable } from '@/composables/useDataTable';
import { useApi } from '@/composables/useApi';
import { usePermissions } from '@/composables/usePermissions';
import { PERMISSIONS } from '@/config/permissions';
import { formatCurrency, formatDate } from '@/utils/formatters';
import AppDataTable from '@/components/common/AppDataTable.vue';
import AppButton from '@/components/common/AppButton.vue';
import AppDialog from '@/components/common/AppDialog.vue';
import AppUserBalanceProfile from '@/components/common/AppUserBalanceProfile.vue';
import { toast } from 'vue3-toastify';
import { usePrint } from '@/modules/print/composables/usePrint';

const router = useRouter();
const { can } = usePermissions();
const invoiceApi = useApi('/api/invoices');

// Data Table Logic
const {
  items,
  loading,
  currentPage,
  perPage,
  total,
  hasMore,
  search,
  filters,
  sortByVuetify,
  changePage,
  changePerPage,
  loadNextPage,
  removeItem,
  applyFilters,
} = useDataTable(
  async params => {
    return await invoiceApi.get(params, { showLoading: false });
  },
  {
    initialPerPage: 10,
    initialSortBy: 'id',
    initialSortOrder: 'desc',
  }
);

// Headers
const headers = [
  { title: 'الفاتورة', key: 'invoice_number', sortable: true, width: '150px' },
  { title: 'العميل', key: 'customer', sortable: false, width: '180px' },
  { title: 'التاريخ', key: 'issue_date', sortable: true, width: '140px' },
  { title: 'المالية', key: 'financials', sortable: false, width: '200px', align: 'end' },
  { title: 'الحالة', key: 'status', sortable: true, width: '160px' },
  { title: 'الإجراءات', key: 'actions', sortable: false, align: 'center', width: '120px' },
];

/** @type {import('@/components/common/AppDataTable.vue').AdvancedFilter[]} */
const advancedFilters = [
  {
    key: 'user_id',
    title: 'العميل',
    type: 'autocomplete',
    apiEndpoint: 'users',
    itemTitle: 'name',
    itemValue: 'id',
  },
  {
    key: 'invoice_type_id',
    title: 'نوع الفاتورة',
    type: 'select',
    getItems: async () => {
      const { data } = await useApi('/api/invoice-types').get();
      return data;
    },
    itemTitle: 'name',
    itemValue: 'id',
  },
  {
    key: 'status',
    title: 'الحالة',
    type: 'select',
    items: [
      { title: 'مسودة', value: 'draft' },
      { title: 'قيد الانتظار', value: 'pending' },
      { title: 'معتمدة', value: 'approved' },
      { title: 'ملغاة', value: 'cancelled' },
    ],
  },
  {
    key: 'payment_status',
    title: 'حالة الدفع',
    type: 'select',
    items: [
      { title: 'غير مدفوعة', value: 'unpaid' },
      { title: 'مدفوعة جزئياً', value: 'partial' },
      { title: 'مدفوعة بالكامل', value: 'paid' },
      { title: 'مدفوعة بزيادة', value: 'overpaid' },
    ],
  },
  {
    key: 'date_from',
    title: 'من تاريخ',
    type: 'date',
  },
  {
    key: 'date_to',
    title: 'إلى تاريخ',
    type: 'date',
  },
];

// Grid Options
const gridOptions = {
  titleKey: 'invoice_number',
  subtitleKey: 'customer', // Mapped to item.customer slot
  bodyKeys: ['issue_date', 'financials', 'status'], // Map to slots
};

// UI Helpers
const getStatusColor = status =>
  ({
    draft: 'grey',
    confirmed: 'primary',
    paid: 'success',
    partially_paid: 'warning',
    canceled: 'error',
  })[status] || 'grey';

const getStatusLabel = status =>
  ({
    draft: 'مسودة',
    confirmed: 'مؤكدة',
    paid: 'مدفوعة',
    partially_paid: 'مدفوعة جزئياً',
    canceled: 'ملغاة',
  })[status] || status;

const getPaymentStatusColor = status =>
  ({
    unpaid: 'error',
    partial: 'warning',
    partially_paid: 'warning',
    paid: 'success',
    overpaid: 'indigo',
  })[status] || 'grey';

const getPaymentStatusIcon = status =>
  ({
    unpaid: 'ri-close-circle-line',
    partial: 'ri-pie-chart-line',
    partially_paid: 'ri-pie-chart-line',
    paid: 'ri-checkbox-circle-line',
    overpaid: 'ri-add-circle-line',
  })[status] || 'ri-question-line';

const getPaymentStatusLabel = status =>
  ({
    unpaid: 'غير مدفوعة',
    partial: 'مدفوعة جزئياً',
    partially_paid: 'مدفوعة جزئياً',
    paid: 'مدفوعة بالكامل',
    overpaid: 'مدفوعة بزيادة',
  })[status] || status;

// Actions
const navigateToCreate = () => router.push('/app/invoices/create');
const viewInvoice = invoice => router.push(`/app/invoices/${invoice.id}`);
const editInvoice = invoice => router.push(`/app/invoices/${invoice.id}/edit`);

const printInvoice = async invoice => {
  const { printInvoice: print } = usePrint();
  try {
    await print({ invoice });
  } catch (error) {
    console.error('[InvoiceList] Print error:', error);
    toast.error('فشل في طباعة الفاتورة');
  }
};

// Delete
const deleteDialog = ref(false);
const itemToDelete = ref(null);
const deleting = ref(false);

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
    toast.success('تم حذف الفاتورة بنجاح');
  } catch (error) {
    toast.error('فشل حذف الفاتورة');
  } finally {
    deleting.value = false;
  }
};
</script>

<style scoped>
.invoice-list-wrapper :deep(.v-container) {
  max-width: 100% !important;
}
.hover-underline:hover {
  text-decoration: underline;
}
.financial-compact {
  min-width: 170px;
  max-width: 220px;
}
</style>
