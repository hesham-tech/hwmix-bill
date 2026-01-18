<template>
  <div v-if="can(PERMISSIONS.TRANSACTIONS_VIEW_ALL)" class="transactions-page">
    <div class="mb-6 px-6 pt-6">
      <h1 class="text-h4 font-weight-bold">حركات الخزينة</h1>
      <p class="text-body-1 text-grey">سجل وتدقيق جميع المعاملات المالية الصادرة والواردة</p>
    </div>

    <div class="px-6 pb-6">
      <AppDataTable
        :headers="headers"
        :items="transactions"
        :loading="loading"
        :items-length="total"
        :items-per-page="itemsPerPage"
        :page="page"
        title="المعاملات المالية الأخيرة"
        icon="ri-exchange-line"
        @update:page="
          page = $event;
          loadData();
        "
        @update:items-per-page="handleItemsPerPageChange"
      >
        <template #item.type="{ item }">
          <v-chip :color="item.type === 'income' ? 'success' : 'error'" size="small" variant="flat" class="font-weight-bold px-3">
            <v-icon :icon="item.type === 'income' ? 'ri-arrow-left-down-line' : 'ri-arrow-right-up-line'" size="14" class="me-1" />
            {{ item.type === 'income' ? 'إيداع نقدية' : 'سحب نقدية' }}
          </v-chip>
        </template>

        <template #item.cash_box="{ item }">
          <div class="d-flex align-center">
            <v-icon icon="ri-safe-2-line" size="small" color="secondary" class="me-2" />
            <span class="font-weight-medium text-secondary">{{ item.cash_box?.name || 'خزينة غير محددة' }}</span>
          </div>
        </template>

        <template #item.amount="{ item }">
          <div class="text-end font-weight-black text-h6" :class="item.type === 'income' ? 'text-success' : 'text-error'">
            {{ item.type === 'income' ? '+' : '-' }} {{ formatCurrency(item.amount) }}
          </div>
        </template>

        <template #item.date="{ item }">
          <div class="d-flex flex-column">
            <span class="font-weight-medium">{{ formatDate(item.transaction_date) }}</span>
            <span class="text-caption text-grey">{{ formatTime(item.transaction_date) }}</span>
          </div>
        </template>

        <template #item.description="{ item }">
          <span class="text-body-2 text-wrap" style="max-width: 300px">{{ item.description || 'لا يوجد وصف' }}</span>
        </template>
      </AppDataTable>
    </div>
  </div>

  <!-- Access Denied State -->
  <div v-else class="pa-12 text-center d-flex flex-column align-center justify-center" style="min-height: 400px">
    <v-avatar size="100" color="error-lighten-5" class="mb-6">
      <v-icon icon="ri-lock-2-line" size="48" color="error" />
    </v-avatar>
    <h2 class="text-h4 font-weight-bold mb-2">عذراً، لا تملك الصلاحية</h2>
    <p class="text-body-1 text-grey mb-6">ليس لديك إذن للوصول إلى حركات الخزينة. يرجى مراجعة المسؤول.</p>
    <AppButton to="/dashboard" color="primary" variant="tonal" prepend-icon="ri-home-4-line"> العودة للرئيسية </AppButton>
  </div>
</template>

<script setup>
import { usePermissions } from '@/composables/usePermissions';
import { PERMISSIONS } from '@/config/permissions';
import AppDataTable from '@/components/common/AppDataTable.vue';
import AppCard from '@/components/common/AppCard.vue';

const { can } = usePermissions();
const api = useApi('/api/transactions');

const transactions = ref([]);
const loading = ref(false);
const total = ref(0);
const page = ref(1);
const itemsPerPage = ref(10);

const headers = [
  { title: 'النوع', key: 'type' },
  { title: 'الخزينة', key: 'cash_box' },
  { title: 'المبلغ', key: 'amount', align: 'end' },
  { title: 'التاريخ', key: 'date' },
  { title: 'الوصف', key: 'description' },
];

const getCurrencySymbol = () => 'ج.م';

const formatCurrency = amount => {
  if (!amount) return `0.00 ${getCurrencySymbol()}`;
  return new Intl.NumberFormat('ar-EG', {
    style: 'currency',
    currency: 'EGP',
    currencyDisplay: 'symbol',
  }).format(amount);
};

const formatDate = date => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const formatTime = date => {
  if (!date) return '';
  return new Date(date).toLocaleTimeString('ar-EG', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

const loadData = async () => {
  loading.value = true;
  try {
    const response = await api.get({ page: page.value, per_page: itemsPerPage.value }, { showLoading: false });
    transactions.value = response.data || [];
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
