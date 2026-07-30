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
          class="text-primary font-weight-bold font-mono cursor-pointer hover-underline d-flex align-center gap-1"
          @click="openViewDialog(item)"
        >
          <v-icon icon="ri-hashtag" size="14" color="primary" />
          <span>{{ item.operation_number || item.reference_number || ('#' + item.id) }}</span>
        </div>
      </template>

      <!-- الحساب المالي والخط المرتبط -->
      <template #item.line="{ item }">
        <div class="d-flex flex-column py-1">
          <div v-if="item.financial_account" class="d-flex align-center gap-1 font-weight-bold text-body-2 text-primary">
            <v-icon icon="ri-bank-card-line" size="14" color="primary" />
            <span>{{ item.financial_account.name }}</span>
            <v-chip size="x-small" variant="outlined" color="primary" class="font-weight-bold ms-1">
              {{ item.financial_account.sender_identifier }}
            </v-chip>
          </div>
          <div v-if="item.line" class="d-flex align-center gap-1 text-caption text-grey mt-1">
            <v-icon icon="ri-sim-card-line" size="12" color="grey" />
            <span class="font-mono">{{ item.line.phone_number }}</span>
            <span v-if="item.line.device_name">({{ item.line.device_name }})</span>
          </div>
          <span v-if="!item.financial_account && !item.line" class="text-caption text-grey">—</span>
        </div>
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

      <!-- المبلغ والرصيد المتبقي بعدها -->
      <template #item.amount="{ item }">
        <div class="d-flex flex-column">
          <div class="d-flex align-center gap-1">
            <span
              :class="['font-weight-bold', isDebit(item.operation_type || item.transaction_type) ? 'text-error' : 'text-success']"
            >
              {{ isDebit(item.operation_type || item.transaction_type) ? '-' : '+' }}{{ formatCurrency(item.amount) }}
            </span>
            <span class="text-caption text-grey">{{ item.currency || 'EGP' }}</span>
          </div>
          <div v-if="item.balance_after !== null && item.balance_after !== undefined" class="text-caption text-grey" style="font-size: 11px;">
            الرصيد بعدها: <span class="font-weight-bold font-mono">{{ formatCurrency(item.balance_after) }} ج.م</span>
          </div>
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

      <!-- الإجراءات -->
      <template #item.actions="{ item }">
        <div class="d-flex align-center gap-1 justify-center">
          <v-tooltip text="معاينة تفاصيل المعاملة والسجل" location="top">
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                icon="ri-eye-line"
                size="small"
                variant="tonal"
                color="primary"
                @click="openViewDialog(item)"
              />
            </template>
          </v-tooltip>

          <v-tooltip v-if="can(PERMISSIONS.HWNIX_CASH_WALLET_TRANSACTIONS_DELETE)" text="حذف المعاملة" location="top">
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                icon="ri-delete-bin-line"
                size="small"
                variant="text"
                color="error"
                @click="confirmDelete(item)"
              />
            </template>
          </v-tooltip>
        </div>
      </template>
    </AppDataTable>

    <!-- Dialog معاينة تفاصيل المعاملة السجل المالي والحدود والرسالة الخام -->
    <v-dialog v-model="viewDialog" max-width="680" scrollable>
      <v-card rounded="xl" v-if="selectedTransaction">
        <v-card-title class="text-h6 pa-6 pb-4 d-flex align-center justify-space-between">
          <div class="d-flex align-center gap-2">
            <v-icon icon="ri-file-list-3-line" color="primary" />
            <span>تفاصيل المعاملة المالية #{{ selectedTransaction.id }}</span>
          </div>
          <v-btn icon="ri-close-line" variant="text" size="small" @click="viewDialog = false" />
        </v-card-title>
        <v-divider />
        <v-card-text class="pa-6">
          <!-- كارت ملخص المبلغ والرصيد المتبقي -->
          <v-card variant="flat" color="grey-lighten-4" rounded="lg" class="pa-4 mb-4">
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-caption text-grey-darken-1 mb-1">قيمة الحركة المالية:</div>
                <div
                  :class="['text-h4 font-weight-black font-mono', isDebit(selectedTransaction.operation_type) ? 'text-error' : 'text-success']"
                >
                  {{ isDebit(selectedTransaction.operation_type) ? '-' : '+' }}{{ formatCurrency(selectedTransaction.amount) }} {{ selectedTransaction.currency || 'EGP' }}
                </div>
              </div>
              <div class="text-end">
                <v-chip
                  :color="getTypeColor(selectedTransaction.operation_type)"
                  size="small"
                  variant="flat"
                  class="font-weight-bold mb-1"
                >
                  <v-icon :icon="getTypeIcon(selectedTransaction.operation_type)" size="14" class="me-1" />
                  {{ getTypeLabel(selectedTransaction.operation_type) }}
                </v-chip>
                <div v-if="selectedTransaction.balance_after !== null" class="text-caption font-weight-bold mt-1">
                  الرصيد بعدها: <span class="font-mono text-primary">{{ formatCurrency(selectedTransaction.balance_after) }} ج.م</span>
                </div>
              </div>
            </div>
          </v-card>

          <!-- معلومات الحساب المالي والخط والمرابطة -->
          <v-row dense class="mb-4">
            <v-col cols="6">
              <div class="pa-3 rounded-lg border bg-grey-lighten-5">
                <div class="text-caption text-grey mb-1">الحساب المالي:</div>
                <div class="font-weight-bold text-body-2 text-primary d-flex align-center gap-1">
                  <v-icon icon="ri-bank-card-line" size="14" color="primary" />
                  {{ selectedTransaction.financial_account?.name || 'غير محدد' }}
                </div>
              </div>
            </v-col>
            <v-col cols="6">
              <div class="pa-3 rounded-lg border bg-grey-lighten-5">
                <div class="text-caption text-grey mb-1">الخط وشريحة الهاتف:</div>
                <div class="font-weight-bold text-body-2 font-mono d-flex align-center gap-1">
                  <v-icon icon="ri-sim-card-line" size="14" color="info" />
                  {{ selectedTransaction.line?.phone_number || 'غير محدد' }}
                </div>
              </div>
            </v-col>
          </v-row>

          <!-- نص الرسالة الخام Raw SMS -->
          <div v-if="selectedTransaction.raw_sms" class="mb-4">
            <div class="d-flex align-center justify-space-between mb-2">
              <span class="text-body-2 font-weight-bold text-grey-darken-2">نص الرسالة النصية الخام (Raw SMS):</span>
              <v-btn
                size="x-small"
                variant="tonal"
                color="primary"
                prepend-icon="ri-file-copy-line"
                @click="copyRawSms(selectedTransaction.raw_sms)"
              >
                نسخ النص
              </v-btn>
            </div>
            <div class="pa-3 rounded-lg border bg-grey-lighten-5 font-mono text-body-2 dir-rtl">
              {{ selectedTransaction.raw_sms }}
            </div>
          </div>
        </v-card-text>
        <v-divider />
        <v-card-actions class="pa-4">
          <v-spacer />
          <AppButton color="primary" @click="viewDialog = false">إغلاق</AppButton>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog تأكيد الحذف -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card rounded="xl">
        <v-card-title class="text-h6 pa-6 pb-2 d-flex align-center gap-2">
          <v-icon icon="ri-delete-bin-line" color="error" />
          تأكيد حذف المعاملة
        </v-card-title>
        <v-card-text class="px-6 pb-4 text-body-2 text-grey">
          هل أنت متأكد من حذف هذه المعاملة؟ لا يمكن التراجع عن هذا الإجراء.
        </v-card-text>
        <v-card-actions class="pa-4 gap-2">
          <v-spacer />
          <AppButton variant="text" @click="deleteDialog = false">إلغاء</AppButton>
          <AppButton color="error" :loading="store.loading" @click="doDelete">حذف المعاملة</AppButton>
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

import notificationManager from '@/services/notificationManager';

const store = useHwnixCashWalletTransactionStore();
const router = useRouter();
const userStore = useUserStore();
const can = permission => userStore.hasPermission(permission);

const createDialog = ref(false);
const deleteDialog = ref(false);
const deletingId = ref(null);
const viewDialog = ref(false);
const selectedTransaction = ref(null);

function openViewDialog(item) {
  selectedTransaction.value = item;
  viewDialog.value = true;
}

function copyRawSms(text) {
  if (!text) return;
  navigator.clipboard.writeText(text);
  notificationManager.success('تم نسخ نص الرسالة النصية الخام إلى الحافظة');
}

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
