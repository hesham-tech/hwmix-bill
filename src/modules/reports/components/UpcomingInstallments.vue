<template>
  <AppDataTable
    :headers="headers"
    :items="installments"
    :loading="loading"
    title="الأقساط المستحقة قريباً"
    icon="ri-calendar-schedule-line"
    hide-footer
    class="rounded-lg overflow-hidden border"
    :items-per-page="5"
  >
    <template #actions>
      <v-chip v-if="installmentsCount > 0" color="info" size="small" variant="flat" class="font-weight-black">
        {{ installmentsCount }} أقساط مجدولة
      </v-chip>
    </template>

    <template #item.customer="{ item }">
      <div class="d-flex align-center py-2">
        <v-avatar size="36" color="info-lighten-5" class="me-3">
          <span class="text-info font-weight-bold text-caption">
            {{ item.customer?.name?.charAt(0) }}
          </span>
        </v-avatar>
        <div class="d-flex flex-column">
          <span class="font-weight-bold text-body-1">{{ item.customer?.name }}</span>
          <span class="text-caption text-grey">خطة #{{ item.plan_number || item.id }}</span>
        </div>
      </div>
    </template>

    <template #item.installment_details="{ item }">
      <div class="d-flex flex-column">
        <span class="font-weight-bold text-body-2">قسط #{{ item.installment_number }}</span>
        <span class="text-caption text-grey">من {{ item.total_installments }} قسط</span>
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
      <div class="font-weight-black text-body-1 text-info text-end">
        {{ formatCurrency(item.amount) }}
      </div>
    </template>

    <template #item.status="{ item }">
      <v-chip :color="getStatusColor(item.status)" size="small" variant="flat" class="font-weight-bold px-3">
        {{ getStatusLabel(item.status) }}
      </v-chip>
    </template>

    <template #no-data>
      <div class="text-center pa-8">
        <v-icon icon="ri-time-line" size="48" color="grey-lighten-2" class="mb-2 opacity-50" />
        <div class="text-subtitle-1 text-grey font-weight-medium">لا توجد أقساط مستحقة خلال الفترة القادمة</div>
      </div>
    </template>
  </AppDataTable>
</template>

<script setup>
import { computed } from 'vue';
import AppDataTable from '@/components/common/AppDataTable.vue';
import { formatCurrency, formatDate } from '@/utils/formatters';

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
