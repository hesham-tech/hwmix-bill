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
      <div class="text-primary font-weight-bold cursor-pointer hover-underline" @click="$emit('view', item)">#{{ item.invoice_number }}</div>
    </template>

    <!-- النوع -->
    <template #item.invoice_type="{ item }">
      <v-chip size="x-small" variant="tonal" color="secondary" class="font-weight-medium">
        {{ item.invoice_type?.name }}
      </v-chip>
    </template>

    <!-- العميل -->
    <template #item.user="{ item }">
      <div class="d-flex align-center py-2" v-if="item.user">
        <AppAvatar :img-url="item.user.avatar_url" :name="item.user.nickname || item.user.full_name" size="32" rounded="circle" class="me-2 border" />
        <div class="d-flex flex-column">
          <span class="font-weight-bold text-body-2">{{ item.user.nickname || item.user.full_name }}</span>
          <AppPhone :phone="item.user.phone" />
        </div>
      </div>
      <span v-else class="text-caption text-grey">بدون عميل</span>
    </template>

    <!-- التاريخ -->
    <template #item.issue_date="{ item }">
      <div class="d-flex flex-column">
        <div class="d-flex align-center text-body-2">
          <v-icon icon="ri-calendar-line" size="14" class="me-1 text-grey" />
          {{ formatDate(item.issue_date) }}
        </div>
        <div v-if="item.due_date" class="d-flex align-center text-caption text-error font-weight-medium mt-1">
          <v-icon icon="ri-time-line" size="12" class="me-1" />
          {{ formatDate(item.due_date) }}
        </div>
      </div>
    </template>

    <!-- الإجمالي -->
    <template #item.net_amount="{ item }">
      <span class="font-weight-bold text-primary">{{ formatCurrency(item.net_amount) }}</span>
    </template>

    <!-- المدفوع -->
    <template #item.paid_amount="{ item }">
      <span class="text-success">{{ formatCurrency(item.paid_amount) }}</span>
    </template>

    <!-- المتبقي -->
    <template #item.remaining_amount="{ item }">
      <span :class="['font-weight-bold', parseFloat(item.remaining_amount) > 0 ? 'text-error' : 'text-grey']">
        {{ formatCurrency(item.remaining_amount) }}
      </span>
    </template>

    <!-- الحالة -->
    <template #item.status="{ item }">
      <v-chip :color="getStatusColor(item.status)" size="small" variant="tonal" class="font-weight-bold">
        {{ getStatusLabel(item.status) }}
      </v-chip>
    </template>

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
        <AppButton icon="ri-edit-line" size="x-small" variant="text" color="primary" tooltip="تعديل" @click="$emit('edit', item)" />
        <AppButton icon="ri-printer-line" size="x-small" variant="text" color="warning" tooltip="طباعة" @click="$emit('print', item)" />
        <AppButton icon="ri-delete-bin-line" size="x-small" variant="text" color="error" tooltip="حذف" @click="$emit('delete', item)" />
      </div>
    </template>
  </AppDataTable>
</template>

<script setup>
import { computed } from 'vue';
import { usePermissions } from '@/composables/usePermissions';

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
  { title: 'النوع', key: 'invoice_type', sortable: false },
  { title: 'العميل', key: 'user', sortable: false },
  { title: 'التاريخ', key: 'issue_date', sortable: true },
  { title: 'الإجمالي', key: 'net_amount', sortable: true, align: 'end' },
  { title: 'المدفوع', key: 'paid_amount', sortable: true, align: 'end' },
  { title: 'المتبقي', key: 'remaining_amount', sortable: true, align: 'end' },
  { title: 'الحالة', key: 'status', sortable: true },
  { title: 'حالة الدفع', key: 'payment_status', sortable: false },
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
  return new Date(date).toLocaleDateString('ar-EG', {
    charSet: 'utf-8',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
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
    confirmed: 'primary',
    paid: 'success',
    partially_paid: 'warning',
    canceled: 'error',
  };
  return colors[status] || 'grey';
};

const getStatusLabel = status => {
  const labels = {
    draft: 'مسودة',
    confirmed: 'مؤكدة',
    paid: 'مدفوعة',
    partially_paid: 'مدفوعة جزئياً',
    canceled: 'ملغاة',
  };
  return labels[status] || status;
};

const getPaymentStatusColor = status => {
  const colors = {
    unpaid: 'error',
    partial: 'warning',
    paid: 'success',
    overpaid: 'indigo',
  };
  return colors[status] || 'grey';
};

const getPaymentStatusIcon = status => {
  const icons = {
    unpaid: 'ri-close-circle-line',
    partial: 'ri-pie-chart-line',
    paid: 'ri-checkbox-circle-line',
    overpaid: 'ri-add-circle-line',
  };
  return icons[status] || 'ri-question-line';
};

const getPaymentStatusLabel = status => {
  const labels = {
    unpaid: 'غير مدفوعة',
    partial: 'مدفوعة جزئياً',
    paid: 'مدفوعة بالكامل',
    overpaid: 'مدفوعة بزيادة',
  };
  return labels[status] || status;
};
</script>

<style scoped>
.hover-underline:hover {
  text-decoration: underline;
}
.gap-1 {
  gap: 4px;
}
</style>
