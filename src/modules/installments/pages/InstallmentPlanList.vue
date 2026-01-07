<template>
  <div class="installment-plans-page">
    <div class="mb-6 px-6 pt-6">
      <h1 class="text-h4 font-weight-bold">خطط التقسيط</h1>
      <p class="text-body-1 text-grey">متابعة وإدارة جدول تحصيل الأقساط والمدفوعات الآجلة</p>
    </div>

    <div class="px-6 pb-6">
      <AppDataTable
        :headers="headers"
        :items="plans"
        :loading="loading"
        :items-length="total"
        :items-per-page="itemsPerPage"
        :page="page"
        title="سجل خطط التقسيط"
        icon="ri-calendar-schedule-line"
        @update:page="
          page = $event;
          loadData();
        "
        @update:items-per-page="handleItemsPerPageChange"
      >
        <template #item.invoice="{ item }">
          <div v-if="item.invoice" class="d-flex flex-column">
            <span class="font-weight-bold text-primary">فاتورة #{{ item.invoice.invoice_number }}</span>
            <span class="text-caption text-grey">العميل: {{ item.invoice.customer?.name || 'غير معروف' }}</span>
          </div>
          <span v-else class="text-grey-lighten-1">غير مرتبط بفاتورة</span>
        </template>

        <template #item.total_amount="{ item }">
          <div class="font-weight-black text-h6">{{ formatCurrency(item.total_amount) }}</div>
        </template>

        <template #item.installments_count="{ item }">
          <v-chip size="small" variant="flat" color="secondary-lighten-5" class="text-secondary font-weight-bold">
            <v-icon icon="ri-grid-line" size="14" class="me-1" />
            {{ item.installments_count }} قسط
          </v-chip>
        </template>

        <template #item.status="{ item }">
          <v-chip :color="getStatusColor(item.status)" size="small" variant="flat" class="font-weight-bold px-3">
            {{ getStatusLabel(item.status) }}
          </v-chip>
        </template>

        <template #item.actions="{ item }">
          <div class="d-flex justify-end">
            <AppButton icon="ri-eye-line" size="x-small" variant="text" color="info" tooltip="عرض التفاصيل" @click="viewPlan(item)" />
          </div>
        </template>
      </AppDataTable>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useApi } from '@/composables/useApi';
import AppDataTable from '@/components/common/AppDataTable.vue';
import AppButton from '@/components/common/AppButton.vue';
import AppCard from '@/components/common/AppCard.vue';

const router = useRouter();
const api = useApi('/api/installment-plans');

const plans = ref([]);
const loading = ref(false);
const total = ref(0);
const page = ref(1);
const itemsPerPage = ref(10);

const headers = [
  { title: 'الفاتورة', key: 'invoice' },
  { title: 'المبلغ الإجمالي', key: 'total_amount', align: 'end' },
  { title: 'عدد الأقساط', key: 'installments_count' },
  { title: 'الحالة', key: 'status' },
  { title: 'الإجراءات', key: 'actions', sortable: false, align: 'end' },
];

const formatCurrency = amount => {
  if (!amount) return '0.00 ج.م';
  return new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP' }).format(amount);
};

const getStatusColor = status => {
  const colors = { active: 'success', completed: 'info', cancelled: 'error' };
  return colors[status] || 'grey';
};

const getStatusLabel = status => {
  const labels = { active: 'نشط', completed: 'مكتمل', cancelled: 'ملغي' };
  return labels[status] || status;
};

const viewPlan = plan => {
  router.push(`/installments/${plan.id}`);
};

const loadData = async () => {
  loading.value = true;
  try {
    const response = await api.get({ page: page.value, per_page: itemsPerPage.value }, { showLoading: false });
    plans.value = response.data || [];
    total.value = response.total || 0;
  } finally {
    loading.value = false;
  }
};

const handleItemsPerPageChange = value => {
  itemsPerPage.value = value;
  page.value = 1;
  loadData();
};

onMounted(loadData);
</script>

<style scoped></style>
