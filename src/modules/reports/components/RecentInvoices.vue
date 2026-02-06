<template>
  <AppDataTable
    :headers="headers"
    :items="invoices"
    :loading="loading"
    title="آخر الفواتير الصادرة"
    icon="ri-file-list-3-line"
    hide-footer
    class="rounded-md overflow-hidden border"
    :items-per-page="5"
  >
    <template #item.invoice_number="{ item }">
      <div class="font-weight-bold text-primary">#{{ item.invoice_number }}</div>
    </template>

    <template #item.customer="{ item }">
      <div class="font-weight-medium">{{ item.customer?.name || '---' }}</div>
    </template>

    <template #item.total="{ item }">
      <div class="font-weight-bold text-h6 text-success">
        {{ formatCurrency(item.total) }}
      </div>
    </template>

    <template #item.status="{ item }">
      <v-chip :color="getStatusColor(item.status)" size="small" variant="flat" class="font-weight-bold px-3">
        {{ getStatusLabel(item.status) }}
      </v-chip>
    </template>

    <template #no-data>
      <div class="text-center pa-8">
        <v-icon icon="ri-file-history-line" size="48" color="grey-lighten-2" class="mb-2" />
        <div class="text-subtitle-1 text-grey font-weight-medium">لا توجد فواتير حديثة حتى الآن</div>
      </div>
    </template>
  </AppDataTable>
</template>

<script setup>
import AppDataTable from '@/components/common/AppDataTable.vue';
import { formatCurrency } from '@/utils/formatters';

defineProps({
  invoices: {
    type: Array,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const headers = [
  { title: 'رقم الفاتورة', key: 'invoice_number' },
  { title: 'العميل', key: 'customer' },
  { title: 'المبلغ', key: 'total', align: 'end' },
  { title: 'الحالة', key: 'status' },
];

const getStatusColor = status => {
  const colors = {
    draft: 'grey',
    pending: 'warning',
    approved: 'success',
    cancelled: 'error',
  };
  return colors[status] || 'grey';
};

const getStatusLabel = status => {
  const labels = {
    draft: 'مسودة',
    pending: 'قيد الانتظار',
    approved: 'معتمدة',
    cancelled: 'ملغاة',
  };
  return labels[status] || status;
};
</script>
