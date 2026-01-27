<template>
  <div class="installment-plans-page">
    <AppPageHeader title="خطط التقسيط" subtitle="متابعة وإدارة جدول تحصيل الأقساط والمدفوعات الآجلة" icon="ri-calendar-schedule-line" sticky>
      <template #controls>
        <v-row align="center" class="w-100 mx-0">
          <v-col cols="12" md="8">
            <AppInput
              v-model="search"
              placeholder="بحث في خطط التقسيط..."
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
      <!-- Advanced Filters (Placeholder for consistency) -->
      <v-expand-transition>
        <div v-if="showAdvanced" class="mb-6">
          <v-card variant="tonal" color="primary" class="pa-4 rounded-lg border-primary bg-primary-lighten-5">
            <div class="d-flex align-center gap-2">
              <v-icon icon="ri-information-line" />
              <span>البحث المتقدم لخطط التقسيط سيتم إضافته قريباً مع خيارات فلترة متقدمة.</span>
            </div>
          </v-card>
        </div>
      </v-expand-transition>
      <AppDataTable
        :headers="headers"
        :items="plans"
        :loading="loading"
        :items-length="total"
        v-model:items-per-page="itemsPerPage"
        v-model:page="page"
        title="سجل خطط التقسيط"
        icon="ri-calendar-event-line"
        @update:options="handleOptionsUpdate"
      >
        <template #item.invoice="{ item }">
          <div v-if="item.invoice" class="d-flex flex-column py-2">
            <span class="font-weight-bold text-primary">فاتورة #{{ item.invoice.invoice_number }}</span>
            <span class="text-caption text-grey">العميل: {{ item.invoice.customer?.name || 'غير معروف' }}</span>
          </div>
          <span v-else class="text-grey-lighten-1">غير مرتبط بفاتورة</span>
        </template>

        <template #item.net_amount="{ item }">
          <div class="font-weight-black text-body-1">{{ formatCurrency(item.net_amount) }}</div>
        </template>

        <template #item.installments_count="{ item }">
          <v-chip size="small" variant="tonal" color="secondary" class="font-weight-bold">
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
            <AppButton
              v-if="can(PERMISSIONS.INSTALLMENTS_PAGE)"
              icon="ri-eye-line"
              size="x-small"
              variant="text"
              color="info"
              tooltip="عرض التفاصيل"
              @click="viewPlan(item)"
            />
          </div>
        </template>
      </AppDataTable>
    </v-container>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useApi } from '@/composables/useApi';
import { usePermissions } from '@/composables/usePermissions';
import { PERMISSIONS } from '@/config/permissions';
import { formatCurrency } from '@/utils/formatters';
import AppPageHeader from '@/components/common/AppPageHeader.vue';
import AppDataTable from '@/components/common/AppDataTable.vue';
import AppButton from '@/components/common/AppButton.vue';
import AppInput from '@/components/common/AppInput.vue';

const { can } = usePermissions();

const router = useRouter();
const api = useApi('/api/installment-plans');

// State
const plans = ref([]);
const loading = ref(false);
const total = ref(0);
const page = ref(1);
const itemsPerPage = ref(10);
const search = ref('');
const showAdvanced = ref(false);

const headers = [
  { title: 'الفاتورة', key: 'invoice' },
  { title: 'المبلغ الصافي', key: 'net_amount', align: 'end' },
  { title: 'عدد الأقساط', key: 'installments_count' },
  { title: 'الحالة', key: 'status' },
  { title: 'الإجراءات', key: 'actions', sortable: false, align: 'end' },
];

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
    const params = {
      page: page.value,
      per_page: itemsPerPage.value,
      search: search.value,
    };
    const response = await api.get(params, { showLoading: false });
    plans.value = response.data || [];
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
.installment-plans-page :deep(.v-container) {
  max-width: 100% !important;
}
</style>
