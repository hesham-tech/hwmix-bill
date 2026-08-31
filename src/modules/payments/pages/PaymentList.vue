<template>
  <div class="payments-page">
    <div v-if="!hideHeader" class="mb-2 px-6 pt-6">
      <h1 class="text-h4 font-weight-bold">المدفوعات</h1>
      <p class="text-body-1 text-grey">تتبع وتحصيل المدفوعات النقدية والبنكية للفواتير</p>
    </div>

    <div :class="hideHeader ? '' : 'px-6 pb-6'">
      <AppDataTable
        table-key="payments.index"
        :headers="headers"
        :items="payments"
        :loading="loading"
        v-model:page="page"
        v-model:items-per-page="itemsPerPage"
        v-model:search="searchText"
        v-model:sort-by="sortByVuetify"
        :title="hideHeader ? '' : 'سجل المدفوعات'"
        icon="ri-bank-card-2-line"
        @update:options="changeSort"
      >
        <template #actions>
          <AppButton v-if="can(PERMISSIONS.PAYMENTS_CREATE)" color="primary" prepend-icon="ri-add-line" @click="handleCreate">
            تسجيل تحصيل
          </AppButton>
        </template>

        <template #item.invoice="{ item }">
          <div class="d-flex align-center gap-3 py-1">
            <AppUserBalanceProfile :user="item.customer || item.invoice?.customer" mode="horizontal" />
            <div v-if="item.invoice" class="d-flex flex-column border-right pr-3 ms-2">
              <span class="text-xxs text-grey">عن فاتورة:</span>
              <span class="font-weight-bold text-primary text-caption">#{{ item.invoice.invoice_number }}</span>
            </div>
          </div>
        </template>

        <template #item.amount="{ item }">
          <div class="font-weight-bold text-h6 text-success">
            {{ formatCurrency(item.amount) }}
          </div>
        </template>

        <template #item.payment_method="{ item }">
          <v-chip v-if="item.payment_method" size="small" variant="tonal" color="primary" class="font-weight-bold px-3">
            <v-icon icon="ri-wallet-line" size="14" class="me-1" />
            {{ item.payment_method.name }}
          </v-chip>
          <span v-else class="text-grey-lighten-1">غير محدد</span>
        </template>

        <template #item.payment_date="{ item }">
          <div class="font-weight-medium text-body-1">{{ formatDate(item.payment_date) }}</div>
        </template>

        <template #item.status="{ item }">
          <v-chip
            :color="item.status === 'reversed' ? 'error' : 'success'"
            size="small"
            variant="flat"
            class="font-weight-bold px-3"
          >
            {{ item.status === 'reversed' ? 'ملغاة' : 'مكتملة' }}
          </v-chip>
        </template>

        <template #item.actions="{ item }">
          <div class="d-flex justify-end gap-1">
            <AppButton icon="ri-printer-line" size="x-small" variant="text" color="primary" tooltip="طباعة إيصال" @click="handlePrint(item)" />
            <AppButton
              v-if="can(PERMISSIONS.PAYMENTS_DELETE_ALL) && item.status !== 'reversed'"
              icon="ri-arrow-go-back-line"
              size="x-small"
              variant="text"
              color="error"
              tooltip="عكس الدفعة"
              @click="handleDelete(item)"
            />
          </div>
        </template>
      </AppDataTable>
    </div>

    <!-- Reverse Confirmation Dialog -->
    <AppDialog
      v-model="showDeleteDialog"
      title="تأكيد عكس الدفعة"
      icon="ri-arrow-go-back-line"
      confirm-color="error"
      confirm-text="عكس الدفعة"
      :loading="deleting"
      @confirm="confirmDelete"
    >
      هل أنت متأكد من عكس هذه الدفعة ماليًا؟
      <div class="mt-2 text-error font-weight-medium">
        <v-icon icon="ri-error-warning-line" size="small" class="me-1" />
        لن يتم مسح السجل ولكن ستُعكس قيوده المحاسبية ورصيد الخزينة والذمم.
      </div>
    </AppDialog>

    <!-- Create Payment Dialog -->
    <v-dialog v-model="showCreateDialog" max-width="800" scrollable>
      <v-card>
        <v-card-title class="d-flex align-center bg-primary text-white px-4 py-3">
          <span class="text-h6 font-weight-bold">تسجيل معاملة تحصيل</span>
          <v-spacer />
          <v-btn icon="ri-close-line" variant="text" size="small" color="white" @click="showCreateDialog = false" />
        </v-card-title>
        <v-card-text class="pa-0 bg-background">
          <PaymentCreate v-if="showCreateDialog" is-dialog @success="handleCreateSuccess" @cancel="showCreateDialog = false" />
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useDataTable } from '@/composables/useDataTable';
import { useApi } from '@/composables/useApi';
import { usePermissions } from '@/composables/usePermissions';
import { PERMISSIONS } from '@/config/permissions';
import { AppDataTable, AppButton, AppDialog, AppUserBalanceProfile } from '@/components';
import PaymentCreate from './PaymentCreate.vue';
import { usePrint } from '@/modules/print/composables/usePrint';
import { formatCurrency, formatDate } from '@/utils/formatters';

const props = defineProps({
  userId: { type: [Number, String], default: null },
  hideHeader: { type: Boolean, default: false }
});

const { can } = usePermissions();

const router = useRouter();
const { print } = usePrint();

// API
const paymentApi = useApi('/api/payments');

// Fetch function for useDataTable
const fetchPayments = async params => {
  const finalParams = { ...params };
  if (props.userId) finalParams.user_id = props.userId;
  return await paymentApi.get(finalParams, { showLoading: false });
};

// DataTable composable
const {
  items: payments,
  loading,
  currentPage: page,
  perPage: itemsPerPage,
  total,
  search: searchText,
  sortByVuetify,
  changeSort,
  removeItem,
  refresh,
} = useDataTable(fetchPayments, {
  initialPerPage: 10,
  initialSortBy: 'payment_date',
  initialSortOrder: 'desc',
  syncWithUrl: !props.userId,
  immediate: true,
});

const showDeleteDialog = ref(false);
const selectedItem = ref(null);
const deleting = ref(false);

const headers = [
  { title: 'الفاتورة والعميل', key: 'invoice', mandatory: true },
  { title: 'المبلغ', key: 'amount', align: 'end' },
  { title: 'الحالة', key: 'status', align: 'center' },
  { title: 'طريقة الدفع', key: 'payment_method' },
  { title: 'طريقة (نصية)', key: 'method', defaultHide: true },
  { title: 'ملاحظات', key: 'notes', defaultHide: true },
  { title: 'مجزأ؟', key: 'is_split', defaultHide: true },
  { title: 'تاريخ الدفع', key: 'payment_date' },
  { title: 'تاريخ الإنشاء', key: 'created_at', defaultHide: true },
  { title: 'تاريخ التحديث', key: 'updated_at', defaultHide: true },
  { title: 'الإجراءات', key: 'actions', sortable: false, align: 'end', mandatory: true },
];

const showCreateDialog = ref(false);

const handleCreate = () => {
  showCreateDialog.value = true;
};

const handleCreateSuccess = () => {
  showCreateDialog.value = false;
  refresh();
};

const handleDelete = item => {
  selectedItem.value = item;
  showDeleteDialog.value = true;
};

const confirmDelete = async () => {
  deleting.value = true;
  try {
    await paymentApi.remove(selectedItem.value.id);
    refresh(); // Refresh instead of removeItem to fetch updated status=reversed
    showDeleteDialog.value = false;
    selectedItem.value = null;
  } catch (error) {
    // Error handled in useApi
  } finally {
    deleting.value = false;
  }
};

const handlePrint = async item => {
  await print('payment', item);
};
</script>

<style scoped></style>
