<template>
  <AppDataTable
    :headers="headers"
    :items="payments"
    :loading="loading"
    title="المدفوعات والتحصيلات القادمة"
    icon="ri-calendar-todo-line"
    hide-footer
    class="rounded-md overflow-hidden border"
    :items-per-page="5"
  >
    <template #actions>
      <v-chip v-if="upcomingCount > 0" color="error" size="small" variant="flat" class="font-weight-bold"> {{ upcomingCount }} فواتير متأخرة </v-chip>
    </template>

    <template #item.customer="{ item }">
      <div class="d-flex align-center gap-3 py-2">
        <AppUserBalanceProfile v-if="item.customer" :user="item.customer" mode="horizontal" />
        <div class="d-flex flex-column border-right pr-3 ms-2">
          <span class="text-xxs text-grey">فاتورة:</span>
          <span class="font-weight-bold text-primary text-caption">#{{ item.invoice_number }}</span>
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
        <span class="font-weight-bold text-body-1 text-error">{{ formatCurrency(item.remaining) }}</span>
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
// يعرض جدول الفواتير والمدفوعات المستحقة قريباً تفاعلياً من خلال قراءة متجر الـ Runtime المركزي.
import { computed, onMounted } from 'vue';
import { AppDataTable, AppUserBalanceProfile } from '@/components';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { useDashboardStore } from '@/@core/dashboard/store/dashboardStore';

const props = defineProps({
  instanceId: {
    type: String,
    required: true
  },
  userConfig: {
    type: Object,
    default: () => ({})
  }
});

const dashboardStore = useDashboardStore();

const loading = computed(() => {
  return dashboardStore.widgetLoadingStates[props.instanceId] !== false;
});

const payments = computed(() => {
  const wData = dashboardStore.dashboardData[props.instanceId];
  return Array.isArray(wData) ? wData : [];
});

const upcomingCount = computed(() => payments.value.length);

const headers = [
  { title: 'العميل', key: 'customer' },
  { title: 'تاريخ الاستحقاق', key: 'due_date' },
  { title: 'المبلغ المتبقي', key: 'amount', align: 'end' },
  { title: 'الأولوية', key: 'urgency' },
];

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
  if (diffDays <= 3) return 'text-warning font-weight-medium';
  return 'text-grey';
};

const getUrgencyColor = dueDate => {
  if (!dueDate) return 'grey';

  const today = new Date();
  const due = new Date(dueDate);
  const diffTime = due - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'error';
  if (diffDays <= 3) return 'warning';
  return 'success';
};

const getUrgencyLabel = dueDate => {
  if (!dueDate) return 'عادي';

  const today = new Date();
  const due = new Date(dueDate);
  const diffTime = due - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'حرج';
  if (diffDays <= 3) return 'عالي';
  return 'عادي';
};

const loadData = async () => {
  await dashboardStore.fetchWidgetData(props.instanceId);
};

onMounted(() => {
  loadData();
});
</script>

<script>
/**
 * مكون عرض المدفوعات والتحصيلات القادمة (ممتثل للـ Widget Contract)
 */
export default {
  name: 'UpcomingPayments'
}
</script>

<style scoped>
.gap-3 {
  gap: 12px;
}
.text-xxs {
  font-size: 0.65rem !important;
}
</style>
