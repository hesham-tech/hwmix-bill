<template>
  <div class="payments-page">
    <div class="mb-2 px-6 pt-6">
      <h1 class="text-h4 font-weight-bold">المدفوعات</h1>
      <p class="text-body-1 text-grey">تتبع وتحصيل المدفوعات النقدية والبنكية للفواتير</p>
    </div>

    <div class="px-6 pb-6">
      <AppDataTable
        :headers="headers"
        :items="payments"
        :loading="loading"
        :items-length="total"
        :items-per-page="itemsPerPage"
        :page="page"
        title="سجل المدفوعات"
        icon="ri-bank-card-2-line"
        @update:page="
          page = $event;
          loadData();
        "
        @update:items-per-page="handleItemsPerPageChange"
      >
        <template #actions>
          <AppButton v-if="can(PERMISSIONS.PAYMENTS_CREATE)" color="primary" prepend-icon="ri-add-line" @click="handleCreate">
            تسجيل تحصيل
          </AppButton>
        </template>

        <template #item.invoice="{ item }">
          <div class="d-flex flex-column">
            <span v-if="item.invoice" class="font-weight-bold text-primary">فاتورة #{{ item.invoice.invoice_number }}</span>
            <span class="text-caption text-grey">{{
              item.customer?.nickname ||
              item.customer?.full_name ||
              item.invoice?.customer?.nickname ||
              item.invoice?.customer?.full_name ||
              'بدون عميل'
            }}</span>
          </div>
        </template>

        <template #item.amount="{ item }">
          <div class="font-weight-bold text-h6 text-success">
            {{ formatCurrency(item.amount) }}
          </div>
        </template>

        <template #item.payment_method="{ item }">
          <v-chip v-if="item.payment_method" size="small" variant="flat" color="primary-lighten-5" class="text-primary font-weight-bold px-3">
            <v-icon icon="ri-wallet-line" size="14" class="me-1" />
            {{ item.payment_method.name }}
          </v-chip>
          <span v-else class="text-grey-lighten-1">غير محدد</span>
        </template>

        <template #item.payment_date="{ item }">
          <div class="font-weight-medium text-body-1">{{ formatDate(item.payment_date) }}</div>
        </template>

        <template #item.actions="{ item }">
          <div class="d-flex justify-end gap-1">
            <AppButton icon="ri-printer-line" size="x-small" variant="text" color="primary" tooltip="طباعة إيصال" @click="handlePrint(item)" />
            <AppButton
              v-if="can(PERMISSIONS.PAYMENTS_DELETE_ALL)"
              icon="ri-delete-bin-line"
              size="x-small"
              variant="text"
              color="error"
              tooltip="حذف الدفعة"
              @click="handleDelete(item)"
            />
          </div>
        </template>
      </AppDataTable>
    </div>

    <!-- Delete Dialog -->
    <!-- Delete Confirmation Dialog -->
    <AppDialog
      v-model="showDeleteDialog"
      title="تأكيد حذف الدفعة"
      icon="ri-delete-bin-line"
      confirm-color="error"
      confirm-text="حذف"
      :loading="deleting"
      @confirm="confirmDelete"
    >
      هل أنت متأكد من حذف هذه الدفعة نهائياً؟
      <div class="mt-2 text-error font-weight-medium">
        <v-icon icon="ri-error-warning-line" size="small" class="me-1" />
        سيتم تعديل رصيد الفاتورة المرتبطة وخصم المبلغ من الخزينة.
      </div>
    </AppDialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { usePaymentsData } from '../composables/usePaymentsData';
import { usePermissions } from '@/composables/usePermissions';
import { PERMISSIONS } from '@/config/permissions';
import AppDataTable from '@/components/common/AppDataTable.vue';
import AppButton from '@/components/common/AppButton.vue';
import AppCard from '@/components/common/AppCard.vue';
import AppDialog from '@/components/common/AppDialog.vue';
import { usePrint } from '@/modules/print/composables/usePrint';
import { formatCurrency, formatDate } from '@/utils/formatters';

const { can } = usePermissions();

const router = useRouter();
const { print } = usePrint();
const { payments, loading, total, fetchPayments, deletePayment } = usePaymentsData();

const page = ref(1);
const itemsPerPage = ref(10);
const showDeleteDialog = ref(false);
const selectedItem = ref(null);
const deleting = ref(false);

const headers = [
  { title: 'الفاتورة', key: 'invoice' },
  { title: 'المبلغ', key: 'amount', align: 'end' },
  { title: 'طريقة الدفع', key: 'payment_method' },
  { title: 'تاريخ الدفع', key: 'payment_date' },
  { title: 'الإجراءات', key: 'actions', sortable: false, align: 'end' },
];

const handleCreate = () => {
  router.push('/payments/create');
};

const handleDelete = item => {
  selectedItem.value = item;
  showDeleteDialog.value = true;
};

const confirmDelete = async () => {
  deleting.value = true;
  try {
    await deletePayment(selectedItem.value.id);
    showDeleteDialog.value = false;
    loadData();
  } finally {
    deleting.value = false;
  }
};

const handlePrint = async item => {
  await print('payment', item);
};

const handleItemsPerPageChange = value => {
  itemsPerPage.value = value;
  page.value = 1;
  loadData();
};

const loadData = () => fetchPayments({ page: page.value, per_page: itemsPerPage.value });

onMounted(loadData);
</script>

<style scoped></style>
