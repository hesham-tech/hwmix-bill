<template>
  <AppDataTable
    :headers="headers"
    :items="items"
    :loading="loading"
    :total-items="total"
    :page="currentPage"
    :items-per-page="perPage"
    :virtual="virtual"
    permission-module="invoices"
    :show-actions="true"
    :can-view="true"
    :can-edit="true"
    :can-delete="true"
    @update:page="changePage"
    @update:items-per-page="changePerPage"
    @update:sort-by="handleSort"
    @view="$emit('view', $event)"
    @edit="$emit('edit', $event)"
    @delete="$emit('delete', $event)"
  >
    <!-- الفاتورة (رقم + نوع) -->
    <template #item.invoice_number="{ item }">
      <div>
        <div class="text-primary font-weight-bold cursor-pointer hover-underline mb-1" @click="$emit('view', item)">#{{ item.invoice_number }}</div>
        <v-chip size="x-small" variant="tonal" color="secondary" class="font-weight-medium">
          {{ item.invoice_type?.name }}
        </v-chip>
      </div>
    </template>

    <!-- العميل -->
    <template #item.customer="{ item }">
      <AppUserBalanceProfile v-if="item.customer" :user="item.customer" mode="horizontal" />
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

    <!-- المالية (إجمالي + مدفوع + متبقي) -->
    <template #item.financials="{ item }">
      <div class="financial-compact py-1">
        <div class="d-flex align-center justify-space-between mb-1">
          <span class="text-grey-darken-1 text-caption">الإجمالي:</span>
          <span class="font-weight-bold text-primary">{{ formatCurrency(item.net_amount) }}</span>
        </div>

        <div class="d-flex align-center justify-space-between mb-1">
          <span class="text-grey-darken-1 text-caption">المدفوع:</span>
          <span class="text-success font-weight-medium">{{ formatCurrency(item.paid_amount) }}</span>
        </div>

        <div class="d-flex align-center justify-space-between">
          <span class="text-grey-darken-1 text-caption">المتبقي:</span>
          <span :class="['font-weight-bold', parseFloat(item.remaining_amount) > 0 ? 'text-error' : 'text-grey-darken-1']">
            {{ formatCurrency(item.remaining_amount) }}
          </span>
        </div>
      </div>
    </template>

    <!-- الحالة (حالة مع حالة الدفع) -->
    <template #item.status="{ item }">
      <div class="d-flex flex-column gap-1">
        <v-chip :color="getStatusColor(item.status)" size="small" variant="tonal" class="font-weight-bold">
          {{ getStatusLabel(item.status) }}
        </v-chip>
        <v-chip :color="getPaymentStatusColor(item.payment_status)" size="x-small" variant="outlined" class="font-weight-medium">
          <v-icon :icon="getPaymentStatusIcon(item.payment_status)" size="12" class="me-1" />
          {{ getPaymentStatusLabel(item.payment_status) }}
        </v-chip>
      </div>
    </template>

    <!-- الإجراءات الإضافية (Extra Actions) -->
    <template #extra-actions="{ item }">
      <AppButton size="x-small" variant="text" color="warning" tooltip="طباعة الفاتورة" @click.stop="$emit('print', item)">
        <v-icon size="16" class="me-1">ri-printer-line</v-icon>
        <span>طباعة</span>
      </AppButton>
    </template>
  </AppDataTable>
</template>

<script setup>
import { computed } from 'vue';
import { usePermissions } from '@/composables/usePermissions';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { PERMISSIONS } from '@/config/permissions';
import { AppUserBalanceProfile, AppButton, AppAvatar, AppPhone } from '@/components';

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
  virtual: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['view', 'edit', 'print', 'delete', 'update:page', 'update:perPage', 'update:sortBy']);

const { can, canAny } = usePermissions();

// Headers - Optimized from 10 to 6 columns
const headers = [
  { title: 'الفاتورة', key: 'invoice_number', sortable: true, width: '200px' },
  { title: 'العميل', key: 'customer', sortable: false, width: '180px' },
  { title: 'التاريخ', key: 'issue_date', sortable: true, width: '140px' },
  { title: 'المالية', key: 'financials', sortable: false, width: '200px', align: 'end' },
  { title: 'الحالة', key: 'status', sortable: true, width: '160px' },
  { title: 'الإجراءات', key: 'actions', sortable: false, align: 'center', width: '120px' },
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
    partially_paid: 'warning',
    paid: 'success',
    overpaid: 'indigo',
  };
  return colors[status] || 'grey';
};

const getPaymentStatusIcon = status => {
  const icons = {
    unpaid: 'ri-close-circle-line',
    partial: 'ri-pie-chart-line',
    partially_paid: 'ri-pie-chart-line',
    paid: 'ri-checkbox-circle-line',
    overpaid: 'ri-add-circle-line',
  };
  return icons[status] || 'ri-question-line';
};

const getPaymentStatusLabel = status => {
  const labels = {
    unpaid: 'غير مدفوعة',
    partial: 'مدفوعة جزئياً',
    partially_paid: 'مدفوعة جزئياً',
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
.financial-compact {
  min-width: 170px;
  max-width: 220px;
}
.financial-compact .d-flex {
  width: 100%;
}
</style>
