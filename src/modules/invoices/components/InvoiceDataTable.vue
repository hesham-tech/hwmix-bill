<template>
  <AppDataTable
    :headers="headers"
    :items="items"
    :loading="loading"
    :total-items="total"
    :page="currentPage"
    :items-per-page="perPage"
    @update:page="changePage"
    @update:items-per-page="changePerPage"
    @update:options="handleSort"
  >
    <!-- رقم الفاتورة -->
    <template #item.invoice_number="{ item }">
      <div class="text-primary font-weight-bold">#{{ item.invoice_number }}</div>
    </template>

    <!-- العميل -->
    <template #item.customer="{ item }">
      <div class="d-flex align-center py-2">
        <v-avatar size="36" color="primary-lighten-5" class="me-3 border">
          <span class="text-primary font-weight-bold">
            {{ item.customer?.name?.charAt(0).toUpperCase() }}
          </span>
        </v-avatar>
        <div class="d-flex flex-column">
          <span class="font-weight-bold text-body-2">{{ item.customer?.name }}</span>
          <span class="text-caption text-grey">
            <v-icon icon="ri-phone-line" size="12" class="me-1" />
            {{ item.customer?.phone || 'لا يوجد رقم' }}
          </span>
        </div>
      </div>
    </template>

    <!-- التاريخ -->
    <template #item.invoice_date="{ item }">
      <div class="d-flex flex-column">
        <span class="text-body-2">{{ formatDate(item.invoice_date) }}</span>
        <span class="text-caption text-error font-weight-medium">
          <v-icon icon="ri-time-line" size="12" class="me-1" />
          {{ formatDate(item.due_date) }}
        </span>
      </div>
    </template>

    <!-- المبلغ -->
    <template #item.total="{ item }">
      <div class="d-flex flex-column align-end">
        <span class="font-weight-bold text-success">{{ formatCurrency(item.total) }}</span>
        <span class="text-caption text-grey">المدفوع: {{ formatCurrency(item.paid_amount) }}</span>
      </div>
    </template>

    <!-- الحالة -->
    <template #item.status="{ item }">
      <v-chip :color="getStatusColor(item.status)" size="small" variant="flat" class="font-weight-bold">
        {{ getStatusLabel(item.status) }}
      </v-chip>
    </template>

    <!-- حالة الدفع -->
    <template #item.payment_status="{ item }">
      <v-chip :color="getPaymentStatusColor(item.payment_status)" size="small" variant="tonal" class="font-weight-bold">
        <v-icon :icon="getPaymentStatusIcon(item.payment_status)" size="14" class="me-1" />
        {{ getPaymentStatusLabel(item.payment_status) }}
      </v-chip>
    </template>

    <!-- الإجراءات -->
    <template #item.actions="{ item }">
      <div class="d-flex gap-1 justify-center">
        <AppButton icon="ri-eye-line" size="x-small" variant="text" color="info" tooltip="عرض" @click="$emit('view', item)" />
        <AppButton
          v-if="can('invoices.update_all')"
          icon="ri-edit-line"
          size="x-small"
          variant="text"
          color="primary"
          tooltip="تعديل"
          @click="$emit('edit', item)"
        />
        <AppButton
          v-if="can('invoices.print')"
          icon="ri-printer-line"
          size="x-small"
          variant="text"
          color="warning"
          tooltip="طباعة"
          @click="$emit('print', item)"
        />
        <AppButton
          v-if="can('invoices.delete_all')"
          icon="ri-delete-bin-line"
          size="x-small"
          variant="text"
          color="error"
          tooltip="حذف"
          @click="$emit('delete', item)"
        />
      </div>
    </template>
  </AppDataTable>
</template>

<script setup>
import { computed } from 'vue';
import { usePermissions } from '@/composables/usePermissions';
import AppDataTable from '@/components/common/AppDataTable.vue';
import AppButton from '@/components/common/AppButton.vue';

const props = defineProps({
  items: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  total: {
    type: Number,
    default: 0,
  },
  currentPage: {
    type: Number,
    default: 1,
  },
  perPage: {
    type: Number,
    default: 10,
  },
});

const emit = defineEmits(['view', 'edit', 'print', 'delete', 'update:page', 'update:perPage', 'update:sortBy']);

const { can } = usePermissions();

// Headers
const headers = [
  { title: 'رقم الفاتورة', key: 'invoice_number', sortable: true },
  { title: 'العميل', key: 'customer', sortable: false },
  { title: 'التاريخ', key: 'invoice_date', sortable: true },
  { title: 'المبلغ', key: 'total', sortable: true, align: 'end' },
  { title: 'الحالة', key: 'status', sortable: true },
  { title: 'حالة الدفع', key: 'payment_status', sortable: true },
  { title: 'الإجراءات', key: 'actions', sortable: false, align: 'center' },
];

// Methods
const changePage = page => {
  emit('update:page', page);
};

const changePerPage = perPage => {
  emit('update:perPage', perPage);
};

const handleSort = sortBy => {
  emit('update:sortBy', sortBy);
};

const formatDate = date => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('ar-EG');
};

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

const getPaymentStatusColor = status => {
  const colors = {
    unpaid: 'error',
    partial: 'warning',
    paid: 'success',
  };
  return colors[status] || 'grey';
};

const getPaymentStatusIcon = status => {
  const icons = {
    unpaid: 'ri-close-circle-line',
    partial: 'ri-pie-chart-line',
    paid: 'ri-checkbox-circle-line',
  };
  return icons[status] || 'ri-question-line';
};

const getPaymentStatusLabel = status => {
  const labels = {
    unpaid: 'غير مدفوعة',
    partial: 'مدفوعة جزئياً',
    paid: 'مدفوعة بالكامل',
  };
  return labels[status] || status;
};
</script>
