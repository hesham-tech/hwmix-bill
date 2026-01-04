<template>
  <v-card>
    <v-card-title>
      <v-icon icon="ri-file-list-line" class="me-2" />
      آخر الفواتير
    </v-card-title>
    <v-card-text class="pa-0">
      <v-data-table :headers="headers" :items="invoices" :items-per-page="5" :loading="loading" density="comfortable">
        <template #item.invoice_number="{ item }">
          <span class="text-primary font-weight-medium">#{{ item.invoice_number }}</span>
        </template>

        <template #item.customer="{ item }">
          {{ item.customer?.name || '-' }}
        </template>

        <template #item.total="{ item }">
          <span class="font-weight-bold">{{ formatCurrency(item.total) }}</span>
        </template>

        <template #item.status="{ item }">
          <v-chip :color="getStatusColor(item.status)" size="small">
            {{ getStatusLabel(item.status) }}
          </v-chip>
        </template>

        <template #no-data>
          <div class="text-center pa-4 text-medium-emphasis">لا توجد فواتير</div>
        </template>
      </v-data-table>
    </v-card-text>
  </v-card>
</template>

<script setup>
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

const formatCurrency = amount => {
  if (!amount) return '0.00 ج.م';
  return new Intl.NumberFormat('ar-EG', {
    style: 'currency',
    currency: 'EGP',
  }).format(amount);
};

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
