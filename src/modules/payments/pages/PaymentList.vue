<template>
  <div class="payments-page">
    <AppDataTable
      v-model:page="store.page"
      v-model:items-per-page="store.itemsPerPage"
      v-model:sort-by="store.sortBy"
      v-model:search="store.search"
      :headers="headers"
      :items="payments"
      :total-items="totalItems"
      :loading="loading"
      title="المدفوعات"
      icon="ri-money-dollar-circle-line"
      @update:options="loadPayments"
      @edit="handleEdit"
      @delete="handleDelete"
    >
      <template #actions>
        <v-btn color="primary" prepend-icon="ri-add-line" @click="handleCreate"> دفعة جديدة </v-btn>
      </template>

      <template #item.amount="{ item }">
        <span class="font-weight-bold text-success">
          {{ formatCurrency(item.amount) }}
        </span>
      </template>

      <template #item.method="{ item }">
        <v-chip :color="getMethodColor(item.method)" size="small">
          {{ getMethodLabel(item.method) }}
        </v-chip>
      </template>

      <template #item.date="{ item }">
        {{ formatDate(item.date) }}
      </template>

      <template #item.invoice_number="{ item }">
        <span class="text-primary">{{ item.invoice?.invoice_number || '-' }}</span>
      </template>
    </AppDataTable>

    <AppDialog v-model="isOpen" :title="isEditMode ? 'تعديل دفعة' : 'دفعة جديدة'" max-width="600" @close="close">
      <PaymentForm :model-value="formData" @save="handleSave" @cancel="close" />
    </AppDialog>

    <ConfirmDialog v-model="showConfirm" :message="confirmMessage" @confirm="handleConfirm" @cancel="handleCancel" />
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { usePaymentStore } from '../store/payment.store';
import { usePayment } from '../composables/usePayment';
import { AppDataTable, AppDialog, ConfirmDialog } from '@/components';
import PaymentForm from '../components/PaymentForm.vue';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { PAYMENT_METHODS, PAYMENT_METHOD_LABELS } from '@/utils/constants';

const store = usePaymentStore();
const {
  payments,
  loading,
  totalItems,
  formData,
  isEditMode,
  isOpen,
  close,
  showConfirm,
  confirmMessage,
  handleConfirm,
  handleCancel,
  loadPayments,
  handleDelete,
  handleEdit,
  handleCreate,
  savePayment,
} = usePayment();

const headers = [
  { title: 'رقم الفاتورة', key: 'invoice_number', sortable: true },
  { title: 'المبلغ', key: 'amount', sortable: true },
  { title: 'الطريقة', key: 'method', sortable: true },
  { title: 'التاريخ', key: 'date', sortable: true },
  { title: 'ملاحظات', key: 'notes', sortable: false },
  { title: 'الإجراءات', key: 'actions', sortable: false },
];

const getMethodColor = method => {
  const colors = {
    [PAYMENT_METHODS.CASH]: 'success',
    [PAYMENT_METHODS.CARD]: 'info',
    [PAYMENT_METHODS.TRANSFER]: 'warning',
    [PAYMENT_METHODS.CHECK]: 'purple',
  };
  return colors[method] || 'grey';
};

const getMethodLabel = method => {
  return PAYMENT_METHOD_LABELS[method] || method;
};

const handleSave = async data => {
  await savePayment(data);
  close();
  await loadPayments();
};

onMounted(() => {
  loadPayments();
});
</script>

<style scoped>
.payments-page {
  padding: 1rem;
}
</style>
