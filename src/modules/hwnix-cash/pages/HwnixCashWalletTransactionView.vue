<template>
  <div class="wallet-transaction-view">
    <div v-if="store.loading" class="d-flex justify-center align-center py-16">
      <v-progress-circular indeterminate color="primary" size="48" />
    </div>

    <div v-else-if="tx">
      <!-- Header Card -->
      <v-card rounded="xl" class="mb-4" elevation="0" border>
        <v-card-text class="pa-6">
          <div class="d-flex align-center justify-space-between flex-wrap gap-3">
            <div class="d-flex align-center gap-3">
              <v-avatar size="52" :color="getTypeColor(tx.transaction_type)" variant="tonal" rounded="lg">
                <v-icon :icon="getTypeIcon(tx.transaction_type)" size="26" />
              </v-avatar>
              <div>
                <div class="text-h6 font-weight-black">{{ tx.reference_number || '#' + tx.id }}</div>
                <div class="text-body-2 text-grey">{{ getTypeLabel(tx.transaction_type) }}</div>
              </div>
            </div>
            <div class="text-end">
              <div
                :class="['text-h5 font-weight-black', isDebit(tx.transaction_type) ? 'text-error' : 'text-success']"
              >
                {{ isDebit(tx.transaction_type) ? '-' : '+' }}{{ formatCurrency(tx.amount) }}
                <span class="text-body-2 ms-1">{{ tx.currency || 'EGP' }}</span>
              </div>
              <HwnixCashStatusChip :status="tx.status" class="mt-1" />
            </div>
          </div>
        </v-card-text>
      </v-card>

      <!-- Details Grid -->
      <v-row>
        <v-col cols="12" md="6">
          <v-card rounded="xl" elevation="0" border>
            <v-card-title class="text-body-1 font-weight-bold pa-4 pb-2">
              <v-icon icon="ri-information-line" size="18" class="me-2 text-primary" />
              تفاصيل المعاملة
            </v-card-title>
            <v-divider />
            <v-list density="compact" class="pa-2">
              <v-list-item>
                <template #prepend><v-icon icon="ri-sim-card-line" size="16" class="text-grey me-2" /></template>
                <v-list-item-title class="text-caption text-grey">الخط</v-list-item-title>
                <template #append>
                  <span class="text-body-2 font-weight-medium">{{ tx.line?.phone_number ?? '—' }}</span>
                </template>
              </v-list-item>
              <v-list-item>
                <template #prepend><v-icon icon="ri-smartphone-line" size="16" class="text-grey me-2" /></template>
                <v-list-item-title class="text-caption text-grey">المزود</v-list-item-title>
                <template #append>
                  <HwnixCashProviderChip :provider="tx.provider" size="x-small" />
                </template>
              </v-list-item>
              <v-list-item>
                <template #prepend><v-icon icon="ri-user-line" size="16" class="text-grey me-2" /></template>
                <v-list-item-title class="text-caption text-grey">الطرف الآخر</v-list-item-title>
                <template #append>
                  <span class="text-body-2">{{ tx.counterpart_number ?? '—' }}</span>
                </template>
              </v-list-item>
              <v-list-item>
                <template #prepend><v-icon icon="ri-wallet-line" size="16" class="text-grey me-2" /></template>
                <v-list-item-title class="text-caption text-grey">الرصيد بعد العملية</v-list-item-title>
                <template #append>
                  <span class="text-body-2 font-weight-bold">{{ formatCurrency(tx.balance_after) }}</span>
                </template>
              </v-list-item>
              <v-list-item v-if="getParsedBy(tx) !== '—'">
                <template #prepend><v-icon icon="ri-cpu-line" size="16" class="text-grey me-2" /></template>
                <v-list-item-title class="text-caption text-grey">منفذ ومرحلة التحليل</v-list-item-title>
                <template #append>
                  <div class="d-flex align-center gap-1">
                    <v-chip size="x-small" color="primary" variant="tonal" class="font-mono font-weight-bold">
                      {{ getParsedBy(tx) }}
                    </v-chip>
                    <v-chip v-if="getParserStage(tx)" size="x-small" color="secondary" variant="outlined" class="font-mono">
                      {{ getParserStage(tx) }}
                    </v-chip>
                  </div>
                </template>
              </v-list-item>
            </v-list>
          </v-card>
        </v-col>

        <v-col cols="12" md="6">
          <v-card rounded="xl" elevation="0" border>
            <v-card-title class="text-body-1 font-weight-bold pa-4 pb-2">
              <v-icon icon="ri-calendar-line" size="18" class="me-2 text-primary" />
              التواريخ والتوقيت
            </v-card-title>
            <v-divider />
            <v-list density="compact" class="pa-2">
              <v-list-item>
                <template #prepend><v-icon icon="ri-calendar-event-line" size="16" class="text-grey me-2" /></template>
                <v-list-item-title class="text-caption text-grey">تاريخ المعاملة</v-list-item-title>
                <template #append>
                  <span class="text-body-2">{{ formatDateTime(tx.transaction_date) }}</span>
                </template>
              </v-list-item>
              <v-list-item>
                <template #prepend><v-icon icon="ri-time-line" size="16" class="text-grey me-2" /></template>
                <v-list-item-title class="text-caption text-grey">تاريخ الإنشاء</v-list-item-title>
                <template #append>
                  <span class="text-body-2">{{ formatDateTime(tx.created_at) }}</span>
                </template>
              </v-list-item>
            </v-list>
          </v-card>
        </v-col>

        <!-- ملاحظات -->
        <v-col v-if="tx.notes" cols="12">
          <v-card rounded="xl" elevation="0" border>
            <v-card-title class="text-body-1 font-weight-bold pa-4 pb-2">
              <v-icon icon="ri-sticky-note-line" size="18" class="me-2 text-primary" />
              ملاحظات
            </v-card-title>
            <v-divider />
            <v-card-text class="pa-4 text-body-2">{{ tx.notes }}</v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useHwnixCashWalletTransactionStore } from '../store/hwnix-cash-wallet-transaction.store';
import HwnixCashProviderChip from '../components/HwnixCashProviderChip.vue';
import HwnixCashStatusChip from '../components/HwnixCashStatusChip.vue';

const route = useRoute();
const store = useHwnixCashWalletTransactionStore();
const tx = computed(() => store.currentTransaction);

const TYPE_MAP = {
  TRANSFER: { label: 'تحويل', color: 'info', icon: 'ri-arrow-right-left-line', debit: true },
  RECEIVE: { label: 'استلام', color: 'success', icon: 'ri-arrow-down-circle-line', debit: false },
  BILL_PAYMENT: { label: 'دفع فاتورة', color: 'warning', icon: 'ri-file-list-line', debit: true },
  CASH_WITHDRAW: { label: 'سحب نقدي', color: 'error', icon: 'ri-cash-line', debit: true },
  CASH_DEPOSIT: { label: 'إيداع نقدي', color: 'success', icon: 'ri-add-circle-line', debit: false },
  MERCHANT_PAYMENT: { label: 'دفع تجار', color: 'warning', icon: 'ri-store-line', debit: true },
  CARD_PURCHASE: { label: 'شراء بالكارت', color: 'orange', icon: 'ri-bank-card-line', debit: true },
  REFUND: { label: 'استرداد', color: 'teal', icon: 'ri-refund-line', debit: false },
  REVERSAL: { label: 'عكس معاملة', color: 'purple', icon: 'ri-arrow-go-back-line', debit: false },
};

const getTypeLabel = t => TYPE_MAP[t]?.label ?? t;
const getTypeColor = t => TYPE_MAP[t]?.color ?? 'default';
const getTypeIcon = t => TYPE_MAP[t]?.icon ?? 'ri-question-line';
const isDebit = t => TYPE_MAP[t]?.debit ?? false;

function formatCurrency(v) {
  return new Intl.NumberFormat('ar-EG', { minimumFractionDigits: 2 }).format(v ?? 0);
}

function formatDateTime(d) {
  if (!d) return '—';
  return new Date(d).toLocaleString('ar-EG', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function getParsedBy(item) {
  if (!item) return '—';
  if (item.parsed_by) return item.parsed_by;
  if (item.metadata?.parsed_by) return item.metadata.parsed_by;
  if (item.metadata?.normalized_dto?.executionMetadata?.ai_model) {
    return item.metadata.normalized_dto.executionMetadata.ai_model;
  }
  if (item.metadata?.normalized_dto?.executionMetadata?.analyzer_version) {
    return 'AI Parser v' + item.metadata.normalized_dto.executionMetadata.analyzer_version;
  }
  if (item.metadata?.normalized_dto) return 'AI Parser';
  if (item.operation_type === 'reconciliation' || item.metadata?.reconciled_by) return 'SystemReconciliation';
  if (item.source === 'system') return 'SystemAction';
  if (item.source === 'manual') return 'ManualEntry';
  return '—';
}

function getParserStage(item) {
  if (!item) return '';
  if (item.parser_stage) return item.parser_stage;
  if (item.metadata?.parser_stage) return item.metadata.parser_stage;
  if (item.metadata?.normalized_dto?.executionMetadata?.ai_model || item.metadata?.normalized_dto) {
    return 'ai';
  }
  if (item.source === 'system' || item.operation_type === 'reconciliation') return 'system';
  if (item.source === 'manual') return 'manual';
  return '';
}

onMounted(() => store.fetchTransaction(route.params.id));
</script>
