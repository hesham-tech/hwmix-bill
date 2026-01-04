<template>
  <v-data-table
    :headers="headers"
    :items="items"
    :loading="loading"
    :items-length="total"
    :page="currentPage"
    :items-per-page="perPage"
    class="elevation-1"
    @update:page="changePage"
    @update:items-per-page="changePerPage"
    @update:sort-by="handleSort"
  >
    <!-- Loading -->
    <template #loading>
      <v-skeleton-loader type="table-row@10" />
    </template>

    <!-- رقم الفاتورة -->
    <template #item.invoice_number="{ item }">
      <div class="text-primary font-weight-medium">#{{ item.invoice_number }}</div>
    </template>

    <!-- العميل -->
    <template #item.customer="{ item }">
      <div class="d-flex align-center">
        <v-avatar size="32" color="primary" class="me-2">
          <span class="text-white text-caption">
            {{ item.customer?.name?.charAt(0) }}
          </span>
        </v-avatar>
        <div>
          <div class="font-weight-medium">{{ item.customer?.name }}</div>
          <div class="text-caption text-medium-emphasis">
            {{ item.customer?.phone }}
          </div>
        </div>
      </div>
    </template>

    <!-- التاريخ -->
    <template #item.invoice_date="{ item }">
      <div>{{ formatDate(item.invoice_date) }}</div>
      <div class="text-caption text-medium-emphasis">الاستحقاق: {{ formatDate(item.due_date) }}</div>
    </template>

    <!-- المبلغ -->
    <template #item.total="{ item }">
      <div class="font-weight-bold text-success">
        {{ formatCurrency(item.total) }}
      </div>
      <div class="text-caption text-medium-emphasis">المدفوع: {{ formatCurrency(item.paid_amount) }}</div>
    </template>

    <!-- الحالة -->
    <template #item.status="{ item }">
      <v-chip :color="getStatusColor(item.status)" size="small" variant="tonal">
        {{ getStatusLabel(item.status) }}
      </v-chip>
    </template>

    <!-- حالة الدفع -->
    <template #item.payment_status="{ item }">
      <v-chip :color="getPaymentStatusColor(item.payment_status)" size="small" variant="tonal">
        {{ getPaymentStatusLabel(item.payment_status) }}
      </v-chip>
    </template>

    <!-- الإجراءات -->
    <template #item.actions="{ item }">
      <div class="d-flex gap-1">
        <!-- عرض -->
        <v-tooltip text="عرض" location="top">
          <template #activator="{ props }">
            <v-btn v-bind="props" icon="ri-eye-line" size="small" variant="text" @click="$emit('view', item)" />
          </template>
        </v-tooltip>

        <!-- تعديل -->
        <v-tooltip text="تعديل" location="top">
          <template #activator="{ props }">
            <v-btn
              v-if="can('invoices.update_all')"
              v-bind="props"
              icon="ri-edit-line"
              size="small"
              variant="text"
              color="primary"
              @click="$emit('edit', item)"
            />
          </template>
        </v-tooltip>

        <!-- طباعة -->
        <v-tooltip text="طباعة" location="top">
          <template #activator="{ props }">
            <v-btn
              v-if="can('invoices.print')"
              v-bind="props"
              icon="ri-printer-line"
              size="small"
              variant="text"
              color="info"
              @click="$emit('print', item)"
            />
          </template>
        </v-tooltip>

        <!-- حذف -->
        <v-tooltip text="حذف" location="top">
          <template #activator="{ props }">
            <v-btn
              v-if="can('invoices.delete_all')"
              v-bind="props"
              icon="ri-delete-bin-line"
              size="small"
              variant="text"
              color="error"
              @click="$emit('delete', item)"
            />
          </template>
        </v-tooltip>
      </div>
    </template>

    <!-- No data -->
    <template #no-data>
      <div class="text-center pa-4">
        <v-icon icon="ri-file-list-line" size="48" color="grey-lighten-1" />
        <div class="text-h6 mt-2">لا توجد فواتير</div>
        <div class="text-caption text-medium-emphasis">ابدأ بإنشاء فاتورة جديدة</div>
      </div>
    </template>
  </v-data-table>
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

const getPaymentStatusLabel = status => {
  const labels = {
    unpaid: 'غير مدفوعة',
    partial: 'مدفوعة جزئياً',
    paid: 'مدفوعة بالكامل',
  };
  return labels[status] || status;
};
</script>
