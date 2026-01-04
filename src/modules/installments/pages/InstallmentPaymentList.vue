<template>
  <div class="installment-payments-page">
    <AppCard :title="`الدفعات - خطة #${planId || 'الكل'}`" icon="ri-money-dollar-box-line">
      <v-data-table :headers="headers" :items="payments" :loading="loading" density="comfortable">
        <template #item.amount="{ item }">
          <span class="font-weight-bold text-success">
            {{ formatCurrency(item.amount) }}
          </span>
        </template>

        <template #item.date="{ item }">
          {{ formatDate(item.date) }}
        </template>

        <template #item.method="{ item }">
          <v-chip size="small">
            {{ getMethodLabel(item.method) }}
          </v-chip>
        </template>

        <template #item.actions="{ item }">
          <v-btn icon="ri-eye-line" size="small" variant="text" color="info" @click="handleViewDetails(item)" />
        </template>

        <template #top>
          <div class="pa-4">
            <v-btn color="primary" prepend-icon="ri-add-line" @click="handleAddPayment"> تسجيل دفعة </v-btn>
          </div>
        </template>
      </v-data-table>
    </AppCard>

    <!-- Payment Details Dialog -->
    <AppDialog v-model="showDetails" title="تفاصيل الدفعة" max-width="800" @close="showDetails = false">
      <div v-if="selectedPayment">
        <v-row>
          <v-col cols="12" md="6">
            <div class="text-caption text-grey">المبلغ:</div>
            <div class="text-h6">{{ formatCurrency(selectedPayment.amount) }}</div>
          </v-col>
          <v-col cols="12" md="6">
            <div class="text-caption text-grey">التاريخ:</div>
            <div class="text-h6">{{ formatDate(selectedPayment.date) }}</div>
          </v-col>
          <v-col cols="12">
            <div class="text-caption text-grey">الطريقة:</div>
            <div>{{ getMethodLabel(selectedPayment.method) }}</div>
          </v-col>
          <v-col v-if="selectedPayment.notes" cols="12">
            <div class="text-caption text-grey">ملاحظات:</div>
            <div>{{ selectedPayment.notes }}</div>
          </v-col>
        </v-row>

        <v-divider class="my-4" />

        <h4>التفاصيل</h4>
        <v-list v-if="paymentDetails.length">
          <v-list-item v-for="detail in paymentDetails" :key="detail.id">
            <v-list-item-title> قسط #{{ detail.installment_id }} </v-list-item-title>
            <v-list-item-subtitle>
              {{ formatCurrency(detail.amount_paid) }}
            </v-list-item-subtitle>
          </v-list-item>
        </v-list>
        <AppSkeleton v-else-if="loadingDetails" type="list" />
        <EmptyState v-else title="لا توجد تفاصيل" />
      </div>
    </AppDialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useInstallment } from '../composables/useInstallment';
import { AppCard, AppDialog, AppSkeleton, EmptyState } from '@/components';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { PAYMENT_METHOD_LABELS } from '@/utils/constants';

const props = defineProps({
  planId: {
    type: [Number, String],
    default: null,
  },
});

const { payments, loading, loadPayments, loadPaymentDetails } = useInstallment();

const headers = [
  { title: 'المبلغ', key: 'amount', sortable: true },
  { title: 'التاريخ', key: 'date', sortable: true },
  { title: 'الطريقة', key: 'method', sortable: false },
  { title: 'ملاحظات', key: 'notes', sortable: false },
  { title: 'الإجراءات', key: 'actions', sortable: false },
];

const showDetails = ref(false);
const selectedPayment = ref(null);
const paymentDetails = ref([]);
const loadingDetails = ref(false);

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

onMounted(() => {
  loadPayments(props.planId);
});
</script>

<style scoped>
.installment-payments-page {
  padding: 1rem;
}
</style>
