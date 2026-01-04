<template>
  <v-card>
    <v-card-title class="d-flex align-center">
      <v-icon icon="ri-calendar-schedule-line" class="me-2" />
      أقساط مستحقة قريباً
      <v-spacer />
      <v-chip v-if="installmentsCount > 0" color="info" size="small">
        {{ installmentsCount }}
      </v-chip>
    </v-card-title>

    <v-card-text class="pa-0">
      <v-data-table :headers="headers" :items="installments" :loading="loading" :items-per-page="5" density="comfortable">
        <template #item.customer="{ item }">
          <div class="d-flex align-center">
            <v-avatar size="32" color="info" class="me-2">
              <span class="text-white text-caption">
                {{ item.customer?.name?.charAt(0) }}
              </span>
            </v-avatar>
            <div>
              <div class="font-weight-medium">{{ item.customer?.name }}</div>
              <div class="text-caption text-medium-emphasis">خطة #{{ item.plan_number || item.id }}</div>
            </div>
          </div>
        </template>

        <template #item.installment_details="{ item }">
          <div>
            <div class="font-weight-medium">قسط #{{ item.installment_number }}</div>
            <div class="text-caption text-medium-emphasis">من {{ item.total_installments }} قسط</div>
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
            <div class="font-weight-bold text-info">{{ formatCurrency(item.amount) }}</div>
            <div class="text-caption text-medium-emphasis">مبلغ القسط</div>
          </div>
        </template>

        <template #item.status="{ item }">
          <v-chip :color="getStatusColor(item.status)" size="small" variant="tonal">
            {{ getStatusLabel(item.status) }}
          </v-chip>
        </template>

        <template #no-data>
          <div class="text-center pa-4">
            <v-icon icon="ri-checkbox-circle-line" size="48" color="success" class="mb-2" />
            <div class="text-medium-emphasis">لا توجد أقساط مستحقة خلال الأيام القادمة</div>
          </div>
        </template>
      </v-data-table>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  installments: {
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
  { title: 'القسط', key: 'installment_details' },
  { title: 'تاريخ الاستحقاق', key: 'due_date' },
  { title: 'المبلغ', key: 'amount', align: 'end' },
  { title: 'الحالة', key: 'status' },
];

const installmentsCount = computed(() => props.installments.length);

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

const getStatusColor = status => {
  const colors = {
    pending: 'warning',
    paid: 'success',
    overdue: 'error',
    cancelled: 'grey',
  };
  return colors[status] || 'info';
};

const getStatusLabel = status => {
  const labels = {
    pending: 'معلق',
    paid: 'مدفوع',
    overdue: 'متأخر',
    cancelled: 'ملغي',
  };
  return labels[status] || status;
};
</script>
