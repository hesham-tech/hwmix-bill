<template>
  <div class="installment-plans-page">
    <AppDataTable
      v-model:page="store.page"
      v-model:items-per-page="store.itemsPerPage"
      v-model:sort-by="store.sortBy"
      v-model:search="store.search"
      :headers="headers"
      :items="plans"
      :total-items="totalItems"
      :loading="loading"
      title="خطط التقسيط"
      icon="ri-calendar-schedule-line"
      @update:options="loadPlans"
      @view="handleViewPlan"
      @edit="handleEditPlan"
      @delete="handleDeletePlan"
      :can-view="true"
    >
      <template #actions>
        <v-btn color="primary" prepend-icon="ri-add-line" @click="handleCreatePlan"> خطة تقسيط جديدة </v-btn>
      </template>

      <template #item.customer_name="{ item }">
        <div class="d-flex align-center">
          <v-avatar size="32" color="primary" class="me-2">
            <span class="text-white text-caption">
              {{ getInitials(item.customer_name) }}
            </span>
          </v-avatar>
          <span>{{ item.customer_name }}</span>
        </div>
      </template>

      <template #item.total_amount="{ item }">
        <span class="font-weight-bold">{{ formatCurrency(item.total_amount) }}</span>
      </template>

      <template #item.down_payment="{ item }">
        <span class="text-success">{{ formatCurrency(item.down_payment || 0) }}</span>
      </template>

      <template #item.remaining_amount="{ item }">
        <span class="text-warning">{{ formatCurrency(item.remaining_amount) }}</span>
      </template>

      <template #item.status="{ item }">
        <v-chip :color="getStatusColor(item.status)" size="small">
          {{ getStatusLabel(item.status) }}
        </v-chip>
      </template>

      <template #item.installment_count="{ item }">
        <v-chip size="small" variant="outlined"> {{ item.installment_count }} قسط </v-chip>
      </template>

      <template #extra-actions="{ item }">
        <v-btn icon="ri-list-check" size="small" variant="text" color="info" @click="handleViewPayments(item)" />
      </template>
    </AppDataTable>

    <ConfirmDialog v-model="showConfirm" :message="confirmMessage" @confirm="handleConfirm" @cancel="handleCancel" />
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useInstallmentStore } from '../store/installment.store';
import { useInstallment } from '../composables/useInstallment';
import { AppDataTable, ConfirmDialog } from '@/components';
import { formatCurrency } from '@/utils/formatters';
import { getInitials } from '@/utils/helpers';

const store = useInstallmentStore();
const {
  plans,
  loading,
  totalItems,
  showConfirm,
  confirmMessage,
  handleConfirm,
  handleCancel,
  loadPlans,
  handleDeletePlan,
  handleEditPlan,
  handleCreatePlan,
} = useInstallment();

const headers = [
  { title: 'العميل', key: 'customer_name', sortable: true },
  { title: 'المبلغ الكلي', key: 'total_amount', sortable: true },
  { title: 'المقدم', key: 'down_payment', sortable: false },
  { title: 'المتبقي', key: 'remaining_amount', sortable: true },
  { title: 'عدد الأقساط', key: 'installment_count', sortable: true },
  { title: 'الحالة', key: 'status', sortable: true },
  { title: 'الإجراءات', key: 'actions', sortable: false },
];

const getStatusColor = status => {
  const colors = {
    active: 'success',
    completed: 'info',
    cancelled: 'error',
    pending: 'warning',
  };
  return colors[status] || 'grey';
};

const getStatusLabel = status => {
  const labels = {
    active: 'نشط',
    completed: 'مكتمل',
    cancelled: 'ملغي',
    pending: 'معلق',
  };
  return labels[status] || status;
};

const handleViewPlan = plan => {
  console.log('View plan:', plan.id);
  // TODO: Navigate to plan details page
};

const handleViewPayments = plan => {
  console.log('View payments for plan:', plan.id);
  // TODO: Navigate to payments page or open dialog
};

onMounted(() => {
  loadPlans();
});
</script>

<style scoped>
.installment-plans-page {
  padding: 1rem;
}
</style>
