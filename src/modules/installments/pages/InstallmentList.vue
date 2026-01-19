<template>
  <div v-if="can(PERMISSIONS.PAYMENTS_VIEW_ALL)" class="installments-page">
    <AppPageHeader title="الأقساط" subtitle="متابعة جميع الأقساط المستحقة والتحصيلات" icon="ri-calendar-todo-line" sticky>
      <template #controls>
        <v-row align="center" class="w-100 mx-0">
          <v-col cols="12" md="8">
            <AppInput
              v-model="search"
              placeholder="بحث في الأقساط..."
              prepend-inner-icon="ri-search-line"
              clearable
              hide-details
              variant="solo-filled"
              density="comfortable"
              flat
              class="rounded-lg"
              @update:model-value="debouncedSearch"
            />
          </v-col>
          <v-col cols="12" md="4" class="text-end">
            <AppButton
              variant="tonal"
              color="primary"
              prepend-icon="ri-equalizer-line"
              class="rounded-lg font-weight-bold"
              @click="showAdvanced = !showAdvanced"
            >
              {{ showAdvanced ? 'إخفاء البحث المتقدم' : 'بحث متقدم' }}
            </AppButton>
          </v-col>
        </v-row>
      </template>
    </AppPageHeader>

    <v-container fluid class="pt-0">
      <!-- Advanced Filters -->
      <v-expand-transition>
        <div v-if="showAdvanced" class="mb-6">
          <InstallmentFilters v-model="filters" @apply="handleFiltersChange" />
        </div>
      </v-expand-transition>

      <AppDataTable
        :headers="headers"
        :items="installments"
        :loading="loading"
        :items-length="total"
        v-model:items-per-page="itemsPerPage"
        v-model:page="page"
        @update:options="handleOptionsUpdate"
        title="قائمة الأقساط"
        icon="ri-list-check-line"
      >
        <template #item.plan="{ item }">
          <div v-if="item.plan?.invoice" class="py-2">
            <div class="font-weight-bold text-primary">فاتورة #{{ item.plan.invoice.invoice_number }}</div>
            <div class="text-caption text-grey">{{ item.plan.invoice.customer?.name }}</div>
          </div>
        </template>

        <template #item.amount="{ item }">
          <div class="font-weight-black text-body-1">{{ formatCurrency(item.amount) }}</div>
        </template>

        <template #item.due_date="{ item }">
          <div :class="[getDueDateClass(item.due_date, item.status), 'font-weight-medium']">
            {{ formatDate(item.due_date) }}
          </div>
        </template>

        <template #item.status="{ item }">
          <v-chip :color="getStatusColor(item.status)" size="small" variant="flat" class="font-weight-bold px-3">
            {{ getStatusLabel(item.status) }}
          </v-chip>
        </template>

        <template #item.actions="{ item }">
          <div class="d-flex justify-end">
            <AppButton
              v-if="item.status === 'pending' && can(PERMISSIONS.PAYMENTS_CREATE)"
              icon="ri-check-line"
              size="x-small"
              variant="text"
              color="success"
              tooltip="تحديد كمدفوع"
              @click="markAsPaid(item)"
            />
          </div>
        </template>
      </AppDataTable>
    </v-container>
  </div>

  <!-- Access Denied State (Updated with AppButton) -->
  <div v-else class="pa-12 text-center d-flex flex-column align-center justify-center" style="min-height: 400px">
    <v-avatar size="100" color="error-lighten-5" class="mb-6">
      <v-icon icon="ri-lock-2-line" size="48" color="error" />
    </v-avatar>
    <h2 class="text-h4 font-weight-bold mb-2">عذراً، لا تملك الصلاحية</h2>
    <p class="text-body-1 text-grey mb-6">ليس لديك إذن للوصول إلى الأقساط. يرجى مراجعة المسؤول.</p>
    <AppButton to="/dashboard" color="primary" variant="tonal" prepend-icon="ri-home-4-line"> العودة للرئيسية </AppButton>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { usePermissions } from '@/composables/usePermissions';
import { useApi } from '@/composables/useApi';
import { PERMISSIONS } from '@/config/permissions';
import { formatCurrency, formatDate } from '@/utils/formatters';
import AppPageHeader from '@/components/common/AppPageHeader.vue';
import AppDataTable from '@/components/common/AppDataTable.vue';
import AppButton from '@/components/common/AppButton.vue';
import AppInput from '@/components/common/AppInput.vue';
import InstallmentFilters from '../components/InstallmentFilters.vue';

const { can } = usePermissions();
const api = useApi('/api/installments');

// State
const installments = ref([]);
const loading = ref(false);
const total = ref(0);
const page = ref(1);
const itemsPerPage = ref(10);
const search = ref('');
const showAdvanced = ref(false);
const filters = ref({
  status: null,
  date_from: null,
  date_to: null,
});

const headers = [
  { title: 'الخطة (الفاتورة)', key: 'plan' },
  { title: 'المبلغ', key: 'amount', align: 'end' },
  { title: 'تاريخ الاستحقاق', key: 'due_date' },
  { title: 'الحالة', key: 'status' },
  { title: 'الإجراءات', key: 'actions', sortable: false, align: 'end' },
];

const getDueDateClass = (dueDate, status) => {
  if (status === 'paid') return 'text-success';
  if (status === 'cancelled') return 'text-grey';

  const today = new Date();
  const due = new Date(dueDate);
  if (due < today) return 'text-error font-weight-bold';
  return '';
};

const getStatusColor = status => {
  const colors = { pending: 'warning', paid: 'success', overdue: 'error', cancelled: 'grey' };
  return colors[status] || 'grey';
};

const getStatusLabel = status => {
  const labels = { pending: 'معلق', paid: 'مدفوع', overdue: 'متأخر', cancelled: 'ملغي' };
  return labels[status] || status;
};

const markAsPaid = async installment => {
  try {
    await api.update(installment.id, { status: 'paid' }, { successMessage: 'تم تسجيل الدفع بنجاح' });
    loadData();
  } catch (error) {
    console.error('Error marking installment as paid:', error);
  }
};

const loadData = async () => {
  loading.value = true;
  try {
    const params = {
      page: page.value,
      per_page: itemsPerPage.value,
      search: search.value,
      ...filters.value,
    };
    const response = await api.get(params, { showLoading: false });
    installments.value = response.data || [];
    total.value = response.total || 0;
  } finally {
    loading.value = false;
  }
};

const handleOptionsUpdate = options => {
  page.value = options.page;
  itemsPerPage.value = options.itemsPerPage;
  loadData();
};

const handleFiltersChange = () => {
  page.value = 1;
  loadData();
};

// Debounce search
let searchTimeout;
const debouncedSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    page.value = 1;
    loadData();
  }, 500);
};

onMounted(loadData);
</script>

<style scoped>
.installments-page :deep(.v-container) {
  max-width: 100% !important;
}
</style>
