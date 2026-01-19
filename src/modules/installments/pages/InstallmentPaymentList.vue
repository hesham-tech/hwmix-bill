<template>
  <div v-if="can(PERMISSIONS.PAYMENTS_VIEW_ALL)" class="installment-payments-page">
    <AppPageHeader
      :title="`سجل دفعات الخطة #${planId || 'العامة'}`"
      subtitle="مراجعة عمليات السداد المرتبطة بخطة التقسيط"
      icon="ri-money-dollar-box-line"
      sticky
    >
      <template #append>
        <AppButton
          v-if="can(PERMISSIONS.PAYMENTS_CREATE)"
          color="primary"
          prepend-icon="ri-add-line"
          class="font-weight-bold"
          @click="handleAddPayment"
        >
          تسجيل دفعة جديدة
        </AppButton>
      </template>
      <template #controls>
        <v-row align="center" class="w-100 mx-0">
          <v-col cols="12">
            <AppInput
              v-model="search"
              placeholder="بحث في الدفعات..."
              prepend-inner-icon="ri-search-line"
              clearable
              hide-details
              variant="solo-filled"
              density="comfortable"
              flat
              class="rounded-lg"
              @update:model-value="debouncedSearch"
            />
          </v-col>
        </v-row>
      </template>
    </AppPageHeader>

    <v-container fluid class="pt-0">
      <AppDataTable :headers="headers" :items="payments" :loading="loading" title="الدفعات المسجلة" icon="ri-history-line">
        <template #item.amount="{ item }">
          <div class="font-weight-black text-body-1 text-success">
            {{ formatCurrency(item.amount) }}
          </div>
        </template>

        <template #item.date="{ item }">
          <div class="font-weight-medium">{{ formatDate(item.date) }}</div>
        </template>

        <template #item.method="{ item }">
          <v-chip size="small" variant="tonal" color="primary" class="font-weight-bold px-3">
            <v-icon icon="ri-wallet-line" size="14" class="me-1" />
            {{ getMethodLabel(item.method) }}
          </v-chip>
        </template>

        <template #item.notes="{ item }">
          <span class="text-caption text-grey text-truncate d-inline-block" style="max-width: 200px">
            {{ item.notes || '---' }}
          </span>
        </template>

        <template #item.actions="{ item }">
          <div class="d-flex justify-end">
            <AppButton
              icon="ri-eye-line"
              size="x-small"
              variant="text"
              color="info"
              tooltip="عرض التفاصيل الكاملة"
              @click="handleViewDetails(item)"
            />
          </div>
        </template>
      </AppDataTable>
    </v-container>

    <!-- Payment Details Dialog -->
    <AppDialog v-model="showDetails" title="تفاصيل دفعة القسط" icon="ri-information-line" max-width="600" hide-confirm>
      <div v-if="selectedPayment">
        <v-row dense>
          <v-col cols="12" sm="6">
            <div class="pa-3 border rounded-lg bg-grey-lighten-5 mb-2">
              <div class="text-caption text-grey mb-1">قيمة الدفعة</div>
              <div class="text-h5 font-weight-black text-success">{{ formatCurrency(selectedPayment.amount) }}</div>
            </div>
          </v-col>
          <v-col cols="12" sm="6">
            <div class="pa-3 border rounded-lg bg-grey-lighten-5 mb-2">
              <div class="text-caption text-grey mb-1">تاريخ العملية</div>
              <div class="text-h6 font-weight-bold">{{ formatDate(selectedPayment.date) }}</div>
            </div>
          </v-col>
          <v-col cols="12">
            <div class="pa-3 border rounded-lg bg-grey-lighten-5 mb-4">
              <div class="text-caption text-grey mb-1">طريقة الدفع</div>
              <div class="d-flex align-center">
                <v-icon icon="ri-wallet-line" size="small" class="me-2" />
                <span class="font-weight-bold">{{ getMethodLabel(selectedPayment.method) }}</span>
              </div>
            </div>
          </v-col>
          <v-col v-if="selectedPayment.notes" cols="12">
            <div class="pa-3 border rounded-lg bg-grey-lighten-5 mb-4">
              <div class="text-caption text-grey mb-1">ملاحظات إضافية</div>
              <div class="text-body-2">{{ selectedPayment.notes }}</div>
            </div>
          </v-col>
        </v-row>

        <v-divider class="my-4" />

        <div class="d-flex align-center mb-4">
          <v-icon icon="ri-list-check-line" size="small" color="primary" class="me-2" />
          <h4 class="text-subtitle-1 font-weight-bold">توزيع الدفعة على الأقساط</h4>
        </div>

        <div v-if="loadingDetails" class="py-12">
          <AppSkeleton type="list" />
        </div>
        <div v-else-if="paymentDetails.length">
          <v-list border class="rounded-lg pa-0 overflow-hidden">
            <v-list-item v-for="(detail, index) in paymentDetails" :key="detail.id" :class="{ 'border-b': index < paymentDetails.length - 1 }">
              <template #prepend>
                <v-avatar color="primary-lighten-5" size="32" class="me-3">
                  <span class="text-primary text-caption font-weight-bold">#{{ detail.installment_id }}</span>
                </v-avatar>
              </template>
              <v-list-item-title class="font-weight-bold">قسط مستحق</v-list-item-title>
              <v-list-item-subtitle class="text-grey">تم سداد جزء من قيمة القسط</v-list-item-subtitle>
              <template #append>
                <div class="text-h6 font-weight-black text-primary">{{ formatCurrency(detail.amount_paid) }}</div>
              </template>
            </v-list-item>
          </v-list>
        </div>
        <EmptyState v-else title="لا توجد تفاصيل لتوزيع هذه الدفعة" icon="ri-error-warning-line" />
      </div>
    </AppDialog>
  </div>

  <!-- Access Denied State (Updated with AppButton) -->
  <div v-else class="pa-12 text-center d-flex flex-column align-center justify-center" style="min-height: 400px">
    <v-avatar size="100" color="error-lighten-5" class="mb-6">
      <v-icon icon="ri-lock-2-line" size="48" color="error" />
    </v-avatar>
    <h2 class="text-h4 font-weight-bold mb-2">عذراً، لا تملك الصلاحية</h2>
    <p class="text-body-1 text-grey mb-6">ليس لديك إذن للوصول إلى سجل دفعات الأقساط. يرجى مراجعة المسؤول.</p>
    <AppButton to="/dashboard" color="primary" variant="tonal" prepend-icon="ri-home-4-line"> العودة للرئيسية </AppButton>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { usePermissions } from '@/composables/usePermissions';
import { PERMISSIONS } from '@/config/permissions';
import { useInstallment } from '../composables/useInstallment';
import AppPageHeader from '@/components/common/AppPageHeader.vue';
import AppDataTable from '@/components/common/AppDataTable.vue';
import AppButton from '@/components/common/AppButton.vue';
import AppDialog from '@/components/common/AppDialog.vue';
import AppInput from '@/components/common/AppInput.vue';
import AppSkeleton from '@/components/common/AppSkeleton.vue';
import EmptyState from '@/components/common/EmptyState.vue';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { PAYMENT_METHOD_LABELS } from '@/utils/constants';

const props = defineProps({
  planId: {
    type: [Number, String],
    default: null,
  },
});

const { can } = usePermissions();
const { payments, loading, loadPayments, loadPaymentDetails } = useInstallment();

// State
const search = ref('');
const showDetails = ref(false);
const selectedPayment = ref(null);
const paymentDetails = ref([]);
const loadingDetails = ref(false);

const headers = [
  { title: 'المبلغ', key: 'amount', sortable: true },
  { title: 'التاريخ', key: 'date', sortable: true },
  { title: 'الطريقة', key: 'method', sortable: false },
  { title: 'ملاحظات', key: 'notes', sortable: false },
  { title: 'الإجراءات', key: 'actions', sortable: false, align: 'end' },
];

const getMethodLabel = method => {
  return PAYMENT_METHOD_LABELS[method] || method;
};

const handleViewDetails = async payment => {
  selectedPayment.value = payment;
  showDetails.value = true;

  loadingDetails.value = true;
  try {
    const response = await loadPaymentDetails(payment.id);
    paymentDetails.value = response.data;
  } finally {
    loadingDetails.value = false;
  }
};

const handleAddPayment = () => {
  console.log('Add payment');
  // TODO: Open payment form dialog
};

// Debounce search
let searchTimeout;
const debouncedSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    loadPayments(props.planId, search.value);
  }, 500);
};

onMounted(() => {
  loadPayments(props.planId);
});
</script>

<style scoped>
.installment-payments-page :deep(.v-container) {
  max-width: 100% !important;
}
</style>
