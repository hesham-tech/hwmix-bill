<template>
  <div v-if="can(PERMISSIONS.PAYMENTS_VIEW_ALL)" class="installments-page">
    <div class="page-header mb-6">
      <h1 class="text-h4 font-weight-bold">الأقساط</h1>
      <p class="text-body-1 text-grey">متابعة جميع الأقساط المستحقة</p>
    </div>

    <v-card>
      <v-card-title>قائمة الأقساط</v-card-title>
      <v-card-text>
        <v-data-table
          :headers="headers"
          :items="installments"
          :loading="loading"
          :items-per-page="itemsPerPage"
          :page="page"
          :items-length="total"
          @update:page="
            page = $event;
            loadData();
          "
          @update:items-per-page="handleItemsPerPageChange"
          density="comfortable"
        >
          <template #item.plan="{ item }">
            <div v-if="item.plan?.invoice">
              <div class="font-weight-medium">فاتورة #{{ item.plan.invoice.invoice_number }}</div>
              <div class="text-caption text-medium-emphasis">{{ item.plan.invoice.customer?.name }}</div>
            </div>
          </template>

          <template #item.amount="{ item }">
            <div class="font-weight-bold">{{ formatCurrency(item.amount) }}</div>
          </template>

          <template #item.due_date="{ item }">
            <div :class="getDueDateClass(item.due_date, item.status)">
              {{ formatDate(item.due_date) }}
            </div>
          </template>

          <template #item.status="{ item }">
            <v-chip :color="getStatusColor(item.status)" size="small" variant="tonal">
              {{ getStatusLabel(item.status) }}
            </v-chip>
          </template>

          <template #item.actions="{ item }">
            <v-btn
              v-if="item.status === 'pending' && can(PERMISSIONS.PAYMENTS_CREATE)"
              icon="ri-check-line"
              size="small"
              variant="text"
              color="success"
              @click="markAsPaid(item)"
            />
          </template>

          <template #no-data>
            <div class="text-center pa-4">
              <v-icon icon="ri-calendar-check-line" size="48" color="grey" class="mb-2" />
              <div class="text-medium-emphasis">لا توجد أقساط</div>
            </div>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
  </div>

  <!-- Access Denied State -->
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
import { usePermissions } from '@/composables/usePermissions';
import { PERMISSIONS } from '@/config/permissions';

const { can } = usePermissions();
const api = useApi('/api/installments');

const installments = ref([]);
const loading = ref(false);
const total = ref(0);
const page = ref(1);
const itemsPerPage = ref(10);

const headers = [
  { title: 'الخطة', key: 'plan' },
  { title: 'المبلغ', key: 'amount', align: 'end' },
  { title: 'تاريخ الاستحقاق', key: 'due_date' },
  { title: 'الحالة', key: 'status' },
  { title: 'الإجراءات', key: 'actions', sortable: false, align: 'end' },
];

const formatCurrency = amount => {
  if (!amount) return '0.00 ج.م';
  return new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP' }).format(amount);
};

const formatDate = date => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('ar-EG');
};

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
    const response = await api.get({ page: page.value, per_page: itemsPerPage.value }, { showLoading: false });
    installments.value = response.data || [];
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

<style scoped>
.installments-page {
  padding: 24px;
}
</style>
