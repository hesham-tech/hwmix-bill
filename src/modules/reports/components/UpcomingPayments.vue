<template>
  <AppDataTable
    :headers="headers"
    :items="payments"
    :loading="loading"
    title="الفواتير المستحقة قريباً"
    icon="ri-calendar-todo-line"
    hide-footer
    :items-per-page="5"
  >
    <template #actions>
      <v-chip v-if="upcomingCount > 0" color="error" size="small" variant="flat" class="font-weight-black">
        {{ upcomingCount }} فواتير متأخرة
      </v-chip>
    </template>

    <template #item.customer="{ item }">
      <div class="d-flex align-center py-2">
        <v-avatar size="36" color="primary-lighten-5" class="me-3">
          <span class="text-primary font-weight-bold text-caption">
            {{ item.customer?.name?.charAt(0) }}
          </span>
        </v-avatar>
        <div class="d-flex flex-column">
          <span class="font-weight-bold text-body-1">{{ item.customer?.name }}</span>
          <span class="text-caption text-grey">فاتورة #{{ item.invoice_number }}</span>
        </div>
      </div>
    </template>

    <template #item.due_date="{ item }">
      <div class="d-flex flex-column">
        <span class="font-weight-medium text-body-2">{{ formatDate(item.due_date) }}</span>
        <span :class="getDaysLeftClass(item.due_date)" class="text-caption">
          {{ getDaysLeft(item.due_date) }}
        </span>
      </div>
    </template>

    <template #item.amount="{ item }">
      <div class="d-flex flex-column align-end">
        <span class="font-weight-black text-body-1 text-error">{{ formatCurrency(item.remaining) }}</span>
        <span class="text-caption text-grey">من {{ formatCurrency(item.total) }}</span>
      </div>
    </template>

    <template #item.urgency="{ item }">
      <v-chip :color="getUrgencyColor(item.due_date)" size="small" variant="flat" class="font-weight-bold px-3">
        {{ getUrgencyLabel(item.due_date) }}
      </v-chip>
    </template>

    <template #no-data>
      <div class="text-center pa-8">
        <v-icon icon="ri-checkbox-circle-fill" size="48" color="success" class="mb-2 opacity-50" />
        <div class="text-subtitle-1 text-success font-weight-medium">ممتاز! لا توجد مديونيات متأخرة حالياً</div>
      </div>
    </template>
  </AppDataTable>
</template>

<script setup>
import { computed } from 'vue';
import AppDataTable from '@/components/common/AppDataTable.vue';

const props = defineProps({
  payments: {
    type: Array,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const headers = [
  { title: 'العميل', key: 'customer' },
  { title: 'تاريخ الاستحقاق', key: 'due_date' },
  { title: 'المبلغ المتبقي', key: 'amount', align: 'end' },
  { title: 'الأولوية', key: 'urgency' },
];

const upcomingCount = computed(() => props.payments.length);

const formatDate = date => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('ar-EG', {
    day: 'numeric',
    month: 'short',
  });
};

const formatCurrency = amount => {
  if (!amount) return '0.00 ج.م';
  return new Intl.NumberFormat('ar-EG', {
    style: 'currency',
    currency: 'EGP',
  }).format(amount);
};

const getDaysLeft = dueDate => {
  if (!dueDate) return '-';

  const today = new Date();
  const due = new Date(dueDate);
  const diffTime = due - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'متأخر!';
  if (diffDays === 0) return 'اليوم';
  if (diffDays === 1) return 'غداً';
  return `بعد ${diffDays} يوم`;
};

const getDaysLeftClass = dueDate => {
  if (!dueDate) return '';

  const today = new Date();
  const due = new Date(dueDate);
  const diffTime = due - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'text-error font-weight-bold';
  if (diffDays <= 1) return 'text-warning font-weight-bold';
  return 'text-medium-emphasis';
};

const getUrgencyColor = dueDate => {
  if (!dueDate) return 'grey';

  const today = new Date();
  const due = new Date(dueDate);
  const diffTime = due - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'error';
  if (diffDays <= 1) return 'warning';
  if (diffDays <= 3) return 'info';
  return 'success';
};

const getUrgencyLabel = dueDate => {
  if (!dueDate) return '-';

  const today = new Date();
  const due = new Date(dueDate);
  const diffTime = due - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'متأخر';
  if (diffDays <= 1) return 'عاجل';
  if (diffDays <= 3) return 'قريب';
  return 'عادي';
};
</script>
