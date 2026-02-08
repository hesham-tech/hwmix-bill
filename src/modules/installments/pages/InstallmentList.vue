<template>
  <div
    v-if="canAny(PERMISSIONS.INSTALLMENT_PLANS_VIEW_ALL, PERMISSIONS.INSTALLMENT_PLANS_VIEW_CHILDREN, PERMISSIONS.INSTALLMENT_PLANS_VIEW_SELF)"
    class="installments-page"
  >
    <!-- Desktop: Side-by-side Layout -->
    <v-row class="d-none d-md-flex ma-0">
      <!-- Table Column (8/12) - Shows first (left in RTL) -->
      <v-col cols="12" class="pa-0">
        <v-card rounded="md" class="border shadow-sm">
          <InstallmentsTable
            :items="installments"
            :loading="loading"
            :total-items="total"
            v-model:items-per-page="itemsPerPage"
            v-model:page="page"
            v-model:sort-by="sortByVuetify"
            :auto-sort="false"
            title="جدول الأقساط"
            subtitle="متابعة جميع الأقساط المستحقة والتحصيلات"
            icon="ri-calendar-todo-line"
            show-view-toggle
            @update:options="changeSort"
            @view="handleView"
            @pay="handlePay"
            @print-receipt="handlePrintReceipt"
          />
        </v-card>
      </v-col>
    </v-row>

    <!-- Payment Dialog -->
    <InstallmentPaymentDialog v-model="showPaymentDialog" :installment="selectedInstallment" @success="handlePaySuccess" />

    <!-- Success Dialog -->
    <PaymentSuccessDialog v-model="showSuccessDialog" :payment-details="paymentResult" @close="refresh" />

    <!-- Details Dialog -->
    <InstallmentDetailsDialog v-model="showDetailsDialog" :installment="selectedInstallment" />
  </div>

  <!-- Access Denied State (Updated with AppButton) -->
  <div v-else class="pa-4 text-center d-flex flex-column align-center justify-center" style="min-height: 400px">
    <v-avatar size="100" color="error-lighten-5" class="mb-2">
      <v-icon icon="ri-lock-2-line" size="48" color="error" />
    </v-avatar>
    <h2 class="text-h4 font-weight-bold mb-2">عذراً، لا تملك الصلاحية</h2>
    <p class="text-body-1 text-grey mb-2">ليس لديك إذن للوصول إلى الأقساط. يرجى مراجعة المسؤول.</p>
    <AppButton to="/app/admin/dashboard" color="primary" variant="tonal" prepend-icon="ri-home-4-line"> العودة للرئيسية </AppButton>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { usePermissions } from '@/composables/usePermissions';
import { useDataTable } from '@/composables/useDataTable';
import { useApi } from '@/composables/useApi';
import { PERMISSIONS } from '@/config/permissions';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { AppPageHeader, AppButton, AppInput, AppAvatar, AppPhone } from '@/components';
import InstallmentFilters from '../components/InstallmentFilters.vue';
import InstallmentPaymentDialog from '../components/InstallmentPaymentDialog.vue';
import InstallmentDetailsDialog from '../components/InstallmentDetailsDialog.vue';
import InstallmentsTable from '../components/InstallmentsTable.vue';
import PaymentSuccessDialog from '../components/PaymentSuccessDialog.vue';
import installmentService from '@/api/services/installment.service';
import { usePrint } from '@/modules/print/composables/usePrint';
import { useNotifications } from '@/plugins/notification';

const { can, canAny } = usePermissions();
const { notify } = useNotifications();
const { printInstallment } = usePrint();
const api = useApi('/api/installments');
const router = useRouter();

// API fetch function for useDataTable
const fetchInstallments = async params => {
  return await api.get(params, { showLoading: false });
};

// DataTable logic
const {
  items: installments,
  loading,
  currentPage: page,
  perPage: itemsPerPage,
  total,
  search,
  filters,
  sortBy,
  sortByVuetify,
  changePage,
  changePerPage,
  changeSort,
  applyFilters,
  refresh,
} = useDataTable(fetchInstallments, {
  syncWithUrl: true,
  initialSortBy: 'due_date',
  initialSortOrder: 'asc',
  immediate: true,
});

// UI State
const showAdvanced = ref(false);

const getStatusLabel = status => {
  const labels = {
    pending: 'معلق',
    paid: 'مدفوع',
    overdue: 'متأخر',
    canceled: 'ملغي',
    partially_paid: 'مدفوع جزئياً',
  };
  return labels[status] || status;
};

// State
const showPaymentDialog = ref(false);
const showDetailsDialog = ref(false);
const showSuccessDialog = ref(false);
const selectedInstallment = ref(null);
const paymentResult = ref(null);
const receiptProps = ref(null);

const prepareReceiptProps = details => {
  // الدفاعية في جلب البيانات
  const record = details?.payment_record?.data || details?.payment_record || details || {};
  const paidInsts = details?.paid_installments || [];

  // محاولة جلب العميل من عدة أماكن
  const customer = record?.customer || record?.plan?.customer || record?.plan?.invoice?.customer || record?.invoice?.customer;

  // محاولة جلب بيانات الشركة
  const company = userStore.currentCompany || record?.plan?.invoice?.company || record?.invoice?.company || record?.company;

  console.log('[InstallmentList] Preparing receipt with:', { record, customer, company });

  return {
    paymentData: record,
    customerName: customer?.name || customer?.full_name || 'عميل غير معروف',
    amountPaid: record?.amount_paid || record?.amount || 0,
    paidInstallments: paidInsts,
    remainingAmount: record?.plan?.remaining_amount || 0,
    paymentMethodName: record?.payment_method?.name || record?.payment_method || 'نقدي',
    companyName: company?.name || 'المتجر الإلكتروني',
    companyLogo: company?.logo || company?.logo_url || userStore.currentUser?.company_logo,
    printFormat: company?.print_settings?.print_format || 'thermal',
  };
};

const handlePaySuccess = data => {
  paymentResult.value = data;
  showSuccessDialog.value = true;
};

const handlePay = item => {
  selectedInstallment.value = item;
  showPaymentDialog.value = true;
};

const handleView = item => {
  selectedInstallment.value = item;
  showDetailsDialog.value = true;
};

const handlePrintReceipt = async installment => {
  notify('جاري جلب بيانات السداد لطباعة الإيصال...', { type: 'info' });

  try {
    const response = await installmentService.getPaymentDetails({ installment_id: installment.id });

    if (response.data && response.data.length > 0) {
      const data = {
        payment_record: response.data[0].installment_payment,
        paid_installments: response.data.map(d => d.installment),
        excess_amount: 0,
        next_installment: null,
      };

      // Use new print system
      await printInstallment({
        payment: data.payment_record,
        customer: {
          name: installment.customer?.name || installment.user?.name || 'عميل غير معروف',
        },
        installments: data.paid_installments,
        plan: {
          remaining_amount: installment.installment_plan?.remaining_amount || 0,
        },
      });

      notify('تم إرسال المستند للطابعة بنجاح.', { type: 'success' });
    } else {
      console.warn('[InstallmentList] No payment details found for this installment');
      notify('عذراً، لم يتم العثور على سجلات سداد لهذا القسط.', { type: 'warning' });
    }
  } catch (error) {
    console.error('Error fetching payment details for print:', error);
    notify('حدث خطأ أثناء تحميل بيانات السداد.', { type: 'error' });
  }
};

const handleFiltersChange = newFilters => {
  applyFilters(newFilters);
};

// Debounce search
let searchTimeout;
const debouncedSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    applyFilters();
  }, 500);
};
</script>

<style scoped>
.installments-page :deep(.v-container) {
  max-width: 100% !important;
}
</style>
