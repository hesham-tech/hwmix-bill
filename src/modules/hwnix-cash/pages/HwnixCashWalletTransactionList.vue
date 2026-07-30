<template>
  <div class="hwnix-cash-wallet-transactions-wrapper">
    <AppDataTable
      table-key="hwnix-cash-wallet-transactions.index"
      v-model:sort-by="store.sortBy"
      v-model:search="store.search"
      :headers="headers"
      :items="store.transactions"
      :loading="store.loading"
      :total-items="store.totalItems"
      :page="store.page"
      :items-per-page="store.itemsPerPage"
      :filters="advancedFilters"
      permission-module="hwnix_cash_wallet_transactions"
      title="معاملات المحافظ"
      subtitle="سجل جميع عمليات الإيداع والسحب والتحويل"
      icon="ri-exchange-dollar-line"
      @update:page="store.page = $event; store.fetchTransactions()"
      @update:items-per-page="store.itemsPerPage = $event; store.fetchTransactions()"
      @view="viewTransaction"
      @delete="confirmDelete"
      @update:filters="applyFilters"
    >
      <!-- الإجراءات الرأسية -->
      <template #actions>
        <AppButton
          variant="tonal"
          color="primary"
          prepend-icon="ri-refresh-line"
          :loading="store.loading"
          @click="store.fetchTransactions()"
        >
          تحديث البيانات
        </AppButton>
        <AppButton
          v-if="can(PERMISSIONS.HWNIX_CASH_WALLET_TRANSACTIONS_CREATE)"
          prepend-icon="ri-add-line"
          color="primary"
          @click="createDialog = true"
        >
          تسجيل معاملة يدوية
        </AppButton>
      </template>

      <!-- رقم المرجع -->
      <template #item.reference_number="{ item }">
        <div
          class="text-primary font-weight-bold font-mono cursor-pointer hover-underline"
          @click="viewTransaction(item)"
        >
          {{ item.operation_number || item.reference_number || ('#' + item.id) }}
        </div>
      </template>

      <!-- الخط المالي والمرابطة -->
      <template #item.line="{ item }">
        <div v-if="item.line" class="d-flex flex-column py-1">
          <div class="d-flex align-center gap-1 font-weight-bold font-mono text-body-2">
            <v-icon icon="ri-sim-card-line" size="14" color="primary" />
            <span>{{ item.line.phone_number }}</span>
          </div>
          <span class="text-caption text-grey">
            {{ item.line.device_name || 'غير محدد' }}
          </span>
        </div>
        <span v-else class="text-caption text-grey">—</span>
      </template>

      <!-- نوع المعاملة -->
      <template #item.transaction_type="{ item }">
        <v-chip
          :color="getTypeColor(item.operation_type || item.transaction_type)"
          size="small"
          variant="tonal"
          class="font-weight-medium"
        >
          <v-icon :icon="getTypeIcon(item.operation_type || item.transaction_type)" size="12" class="me-1" />
          {{ getTypeLabel(item.operation_type || item.transaction_type) }}
        </v-chip>
      </template>

      <!-- المبلغ -->
      <template #item.amount="{ item }">
        <div class="d-flex align-center gap-1">
          <span
            :class="['font-weight-bold', isDebit(item.operation_type || item.transaction_type) ? 'text-error' : 'text-success']"
          >
            {{ isDebit(item.operation_type || item.transaction_type) ? '-' : '+' }}{{ formatCurrency(item.amount) }}
          </span>
          <span class="text-caption text-grey">{{ item.currency || 'EGP' }}</span>
        </div>
      </template>

      <!-- المستهدف / الرقم والاسم -->
      <template #item.target="{ item }">
        <div v-if="item.target_phone || item.target_name" class="d-flex flex-column">
          <span v-if="item.target_phone" class="font-mono text-body-2 font-weight-bold">{{ item.target_phone }}</span>
          <span v-if="item.target_name" class="text-caption text-grey">{{ item.target_name }}</span>
        </div>
        <span v-else class="text-caption text-grey">—</span>
      </template>

      <!-- المزود -->
      <template #item.provider="{ item }">
        <HwnixCashProviderChip :provider="item.provider" size="x-small" />
      </template>

      <!-- الحالة -->
      <template #item.status="{ item }">
        <HwnixCashStatusChip :status="item.status" />
      </template>

      <!-- التاريخ -->
      <template #item.transaction_date="{ item }">
        <div class="d-flex align-center gap-1 text-body-2 text-grey">
          <v-icon icon="ri-calendar-line" size="12" />
          {{ formatDate(item.operation_at || item.transaction_date || item.created_at) }}
        </div>
      </template>
    </AppDataTable>

    <!-- Dialog تأكيد الحذف -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card rounded="xl">
        <v-card-title class="text-h6 pa-6 pb-2">تأكيد الحذف</v-card-title>
        <v-card-text class="px-6 pb-4 text-body-2 text-grey">
          هل أنت متأكد من حذف هذه المعاملة؟ لا يمكن التراجع عن هذا الإجراء.
        </v-card-text>
        <v-card-actions class="pa-4 gap-2">
          <v-spacer />
          <AppButton variant="text" @click="deleteDialog = false">إلغاء</AppButton>
          <AppButton color="error" :loading="store.loading" @click="doDelete">حذف</AppButton>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useHwnixCashWalletTransactionStore } from '../store/hwnix-cash-wallet-transaction.store';
import { PERMISSIONS } from '@/config/permissions';
import { useUserStore } from '@/stores/user';
import HwnixCashProviderChip from '../components/HwnixCashProviderChip.vue';
import HwnixCashStatusChip from '../components/HwnixCashStatusChip.vue';
import AppButton from '@/components/common/AppButton.vue';

const store = useHwnixCashWalletTransactionStore();
const router = useRouter();
const userStore = useUserStore();
const can = permission => userStore.hasPermission(permission);

const createDialog = ref(false);
const deleteDialog = ref(false);
const deletingId = ref(null);

const headers = [
  { title: 'المرجع / الرقم', key: 'reference_number', sortable: true },
  { title: 'الخط المالي والهاتف', key: 'line', sortable: false },
  { title: 'نوع المعاملة', key: 'transaction_type', sortable: true },
  { title: 'المبلغ', key: 'amount', sortable: true },
  { title: 'الجهة / المستهدف', key: 'target', sortable: false },
  { title: 'المزود', key: 'provider', sortable: true },
  { title: 'الحالة', key: 'status', sortable: true },
  { title: 'التاريخ', key: 'transaction_date', sortable: true },
  { title: 'الإجراءات', key: 'actions', sortable: false, align: 'center' },
];

const advancedFilters = [
  {
    key: 'transaction_type',
    label: 'نوع المعاملة',
    type: 'select',
    items: [
      { title: 'تحويل', value: 'transfer' },
      { title: 'استلام', value: 'receive' },
      { title: 'تسوية رصيد', value: 'reconciliation' },
      { title: 'دفع فاتورة', value: 'bill_payment' },
      { title: 'سحب نقدي', value: 'cash_withdraw' },
      { title: 'إيداع نقدي', value: 'cash_deposit' },
      { title: 'دفع تجار', value: 'merchant_payment' },
      { title: 'مشتريات بالكارت', value: 'card_purchase' },
      { title: 'استرداد', value: 'refund' },
      { title: 'عكس معاملة', value: 'reversal' },
    ],
  },
  {
    key: 'status',
    label: 'الحالة',
    type: 'select',
    items: [
      { title: 'ناجحة', value: 'success' },
      { title: 'فاشلة', value: 'failed' },
      { title: 'معلقة', value: 'pending' },
    ],
  },
  {
    key: 'provider',
    label: 'المزود',
    type: 'select',
    items: [
      { title: 'فودافون كاش', value: 'vodafone_cash' },
      { title: 'اورنج كاش', value: 'orange_cash' },
      { title: 'اتصالات كاش', value: 'etisalat_cash' },
      { title: 'وي كاش', value: 'we_cash' },
    ],
  },
  { key: 'date_from', label: 'من تاريخ', type: 'date' },
  { key: 'date_to', label: 'إلى تاريخ', type: 'date' },
];

const TYPE_MAP = {
  transfer: { label: 'تحويل', color: 'info', icon: 'ri-arrow-right-left-line', debit: true },
  receive: { label: 'استلام', color: 'success', icon: 'ri-arrow-down-circle-line', debit: false },
  wallet_send: { label: 'تحويل صادرة', color: 'error', icon: 'ri-arrow-up-circle-line', debit: true },
  wallet_receive: { label: 'استلام واردة', color: 'success', icon: 'ri-arrow-down-circle-line', debit: false },
  reconciliation: { label: 'تسوية رصيد', color: 'purple', icon: 'ri-scales-3-line', debit: false },
  TRANSFER: { label: 'تحويل', color: 'info', icon: 'ri-arrow-right-left-line', debit: true },
  RECEIVE: { label: 'استلام', color: 'success', icon: 'ri-arrow-down-circle-line', debit: false },
  BILL_PAYMENT: { label: 'دفع فاتورة', color: 'warning', icon: 'ri-file-list-line', debit: true },
  bill_payment: { label: 'دفع فاتورة', color: 'warning', icon: 'ri-file-list-line', debit: true },
  CASH_WITHDRAW: { label: 'سحب نقدي', color: 'error', icon: 'ri-cash-line', debit: true },
  cash_withdraw: { label: 'سحب نقدي', color: 'error', icon: 'ri-cash-line', debit: true },
  CASH_DEPOSIT: { label: 'إيداع نقدي', color: 'success', icon: 'ri-add-circle-line', debit: false },
  cash_deposit: { label: 'إيداع نقدي', color: 'success', icon: 'ri-add-circle-line', debit: false },
  MERCHANT_PAYMENT: { label: 'دفع تجار', color: 'warning', icon: 'ri-store-line', debit: true },
  merchant_payment: { label: 'دفع تجار', color: 'warning', icon: 'ri-store-line', debit: true },
  CARD_PURCHASE: { label: 'شراء بالكارت', color: 'orange', icon: 'ri-bank-card-line', debit: true },
  card_purchase: { label: 'شراء بالكارت', color: 'orange', icon: 'ri-bank-card-line', debit: true },
  REFUND: { label: 'استرداد', color: 'teal', icon: 'ri-refund-line', debit: false },
  refund: { label: 'استرداد', color: 'teal', icon: 'ri-refund-line', debit: false },
  REVERSAL: { label: 'عكس معاملة', color: 'purple', icon: 'ri-arrow-go-back-line', debit: false },
  reversal: { label: 'عكس معاملة', color: 'purple', icon: 'ri-arrow-go-back-line', debit: false },
};

const getTypeLabel = t => TYPE_MAP[t]?.label ?? t;
const getTypeColor = t => TYPE_MAP[t]?.color ?? 'default';
const getTypeIcon = t => TYPE_MAP[t]?.icon ?? 'ri-question-line';
const isDebit = t => TYPE_MAP[t]?.debit ?? false;

function formatCurrency(v) {
  return new Intl.NumberFormat('ar-EG', { minimumFractionDigits: 2 }).format(v ?? 0);
}

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' });
}

function viewTransaction(item) {
  router.push({ name: 'hwnix-cash-wallet-transaction-view', params: { id: item.id } });
}

function confirmDelete(item) {
  deletingId.value = item.id;
  deleteDialog.value = true;
}

async function doDelete() {
  await store.deleteTransaction(deletingId.value);
  deleteDialog.value = false;
}

function applyFilters(filters) {
  store.typeFilter = filters.transaction_type ?? null;
  store.statusFilter = filters.status ?? null;
  store.providerFilter = filters.provider ?? null;
  store.dateFrom = filters.date_from ?? null;
  store.dateTo = filters.date_to ?? null;
  store.page = 1;
  store.fetchTransactions();
}

onMounted(() => store.fetchTransactions());
</script>
