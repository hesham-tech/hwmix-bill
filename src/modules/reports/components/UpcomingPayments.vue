<template>
  <v-card>
    <v-card-title class="d-flex align-center">
      <v-icon icon="ri-calendar-todo-line" class="me-2" />
      الدفعات المستحقة قريباً
      <v-spacer />
      <v-chip v-if="upcomingCount > 0" color="warning" size="small">
        {{ upcomingCount }}
      </v-chip>
    </v-card-title>

    <v-card-text class="pa-0">
      <v-data-table :headers="headers" :items="payments" :loading="loading" :items-per-page="5" density="comfortable">
        <template #item.customer="{ item }">
          <div class="d-flex align-center">
            <v-avatar size="32" color="primary" class="me-2">
              <span class="text-white text-caption">
                {{ item.customer?.name?.charAt(0) }}
              </span>
            </v-avatar>
            <div>
              <div class="font-weight-medium">{{ item.customer?.name }}</div>
              <div class="text-caption text-medium-emphasis">فاتورة #{{ item.invoice_number }}</div>
            </div>
          </div>
        </template>

        <template #item.due_date="{ item }">
          <div>
            <div>{{ formatDate(item.due_date) }}</div>
            <div :class="getDaysLeftClass(item.due_date)" class="text-caption">
              {{ getDaysLeft(item.due_date) }}
            </div>
          </div>
        </template>

        <template #item.amount="{ item }">
          <div class="text-end">
            <div class="font-weight-bold">{{ formatCurrency(item.remaining) }}</div>
            <div class="text-caption text-medium-emphasis">من {{ formatCurrency(item.total) }}</div>
          </div>
        </template>

        <template #item.urgency="{ item }">
          <v-chip :color="getUrgencyColor(item.due_date)" size="small" variant="tonal">
            {{ getUrgencyLabel(item.due_date) }}
          </v-chip>
        </template>

        <template #no-data>
          <div class="text-center pa-4">
            <v-icon icon="ri-checkbox-circle-line" size="48" color="success" class="mb-2" />
            <div class="text-medium-emphasis">لا توجد دفعات مستحقة خلال الأيام القادمة</div>
          </div>
        </template>
      </v-data-table>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed } from 'vue';

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
