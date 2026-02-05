<template>
  <div class="installment-plan-view">
    <AppPageHeader
      :title="`خطة التقسيط #${plan?.id}`"
      :subtitle="`فاتورة رقم #${plan?.invoice?.invoice_number}`"
      icon="ri-calendar-event-line"
      sticky
    >
      <template #prepend>
        <AppButton icon="ri-arrow-right-line" variant="text" @click="router.back()" />
      </template>
      <template #append>
        <AppButton
          v-if="plan?.status === 'active'"
          color="success"
          prepend-icon="ri-hand-coin-line"
          class="font-weight-bold"
          @click="openPaymentDialog"
        >
          تحصيل قسط
        </AppButton>
      </template>
    </AppPageHeader>

    <v-container fluid class="pt-0">
      <v-row v-if="loading && !plan">
        <v-col cols="12">
          <AppSkeleton type="card" />
        </v-col>
      </v-row>

      <template v-else-if="plan">
        <v-row class="mb-6">
          <!-- Main Plan Info -->
          <v-col cols="12" md="8">
            <v-card rounded="md" class="border shadow-sm overflow-hidden h-100">
              <div class="bg-primary pa-4 text-white d-flex justify-space-between align-center">
                <div class="d-flex align-center">
                  <v-avatar color="white" size="48" class="me-4 shadow-sm">
                    <v-icon icon="ri-user-heart-line" color="primary" size="24" />
                  </v-avatar>
                  <div>
                    <div class="text-subtitle-2 opacity-80">العميل</div>
                    <div class="text-h6 font-weight-bold">
                      {{ plan.customer?.nickname || plan.customer?.full_name || 'غير متوفر' }}
                    </div>
                  </div>
                </div>
                <v-chip :color="getStatusColor(plan.status)" variant="flat" class="font-weight-bold px-4">
                  {{ plan.status_label || getStatusLabel(plan.status) }}
                </v-chip>
              </div>

              <v-card-text class="pa-6">
                <v-row>
                  <v-col cols="6" sm="3">
                    <div class="text-caption text-grey mb-1">المبلغ الصافي</div>
                    <div class="text-h6 font-weight-black">{{ formatCurrency(plan.net_amount) }}</div>
                  </v-col>
                  <v-col cols="6" sm="3">
                    <div class="text-caption text-grey mb-1">نسبة الفائدة</div>
                    <div class="text-h6 font-weight-black text-error">{{ plan.interest_rate }}%</div>
                  </v-col>
                  <v-col cols="6" sm="3">
                    <div class="text-caption text-grey mb-1">مبلغ الفائدة</div>
                    <div class="text-h6 font-weight-black text-error">{{ formatCurrency(plan.interest_amount) }}</div>
                  </v-col>
                  <v-col cols="6" sm="3">
                    <div class="text-caption text-grey mb-1">إجمالي المبلغ</div>
                    <div class="text-h6 font-weight-black text-primary">{{ formatCurrency(plan.total_amount) }}</div>
                  </v-col>

                  <v-col cols="12">
                    <v-divider class="my-4" />
                  </v-col>

                  <v-col cols="6" sm="3">
                    <div class="text-caption text-grey mb-1">المقدم</div>
                    <div class="text-h6 font-weight-bold text-success">{{ formatCurrency(plan.down_payment) }}</div>
                  </v-col>
                  <v-col cols="6" sm="3">
                    <div class="text-caption text-grey mb-1">عدد الأقساط</div>
                    <div class="text-h6 font-weight-bold">{{ plan.number_of_installments }} قسط</div>
                  </v-col>
                  <v-col cols="6" sm="6">
                    <div class="text-caption text-grey mb-1">دورية الأقساط</div>
                    <div class="d-flex align-center gap-2">
                      <v-icon icon="ri-refresh-line" size="small" color="secondary" />
                      <span class="text-h6 font-weight-bold">{{ getFrequencyLabel(plan.frequency) }}</span>
                    </div>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- Summary Cards -->
          <v-col cols="12" md="4">
            <v-card rounded="md" class="border shadow-sm h-100 pa-4 d-flex flex-column gap-4">
              <div class="pa-4 rounded-md bg-info-lighten-5 border-info d-flex align-center">
                <v-avatar color="info" rounded="md" size="48" class="me-4">
                  <v-icon icon="ri-hand-coin-line" color="white" />
                </v-avatar>
                <div>
                  <div class="text-caption text-info font-weight-bold">المحصل حتى الآن</div>
                  <div class="text-h5 font-weight-black">{{ formatCurrency(collectedAmount) }}</div>
                </div>
              </div>

              <div class="pa-4 rounded-md bg-error-lighten-5 border-error d-flex align-center">
                <v-avatar color="error" rounded="md" size="48" class="me-4">
                  <v-icon icon="ri-alarm-warning-line" color="white" />
                </v-avatar>
                <div>
                  <div class="text-caption text-error font-weight-bold">المتبقي المطلوب</div>
                  <div class="text-h5 font-weight-black">{{ formatCurrency(plan.remaining_amount) }}</div>
                </div>
              </div>

              <v-spacer />
              <AppButton block color="secondary" variant="tonal" prepend-icon="ri-history-line" @click="goToPayments"> عرض سجل الدفعات </AppButton>
            </v-card>
          </v-col>
        </v-row>

        <!-- Installments List -->
        <v-row>
          <v-col cols="12">
            <InstallmentsTable
              :items="plan.installments || []"
              :loading="loading"
              :show-customer="false"
              :show-plan="false"
              rounded="md"
              class="border shadow-sm"
              @view="openDetails"
              @pay="openPaymentDialog"
              @print-receipt="handlePrintReceipt"
            />
          </v-col>
        </v-row>
      </template>

      <v-row v-else-if="!loading">
        <v-col cols="12">
          <v-alert type="error" variant="tonal" class="rounded-md"> عذراً، لم يتم العثور على خطة التقسيط المطلوبة. </v-alert>
        </v-col>
      </v-row>
    </v-container>

    <!-- Payment Dialog -->
    <InstallmentPaymentDialog v-model="showPaymentDialog" :installment="selectedInstallment" @success="handlePaySuccess" />

    <!-- Success Dialog -->
    <PaymentSuccessDialog v-model="showSuccessDialog" :payment-details="paymentResult" @close="loadPlan" />

    <!-- Details Dialog -->
    <InstallmentDetailsDialog v-model="showDetailsDialog" :installment="selectedInstallment" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useApi } from '@/composables/useApi';
import { formatCurrency, formatDate } from '@/utils/formatters';
import AppButton from '@/components/common/AppButton.vue';
import AppSkeleton from '@/components/common/AppSkeleton.vue';
import InstallmentsTable from '../components/InstallmentsTable.vue';
import InstallmentPaymentDialog from '../components/InstallmentPaymentDialog.vue';
import InstallmentDetailsDialog from '../components/InstallmentDetailsDialog.vue';
import PaymentSuccessDialog from '../components/PaymentSuccessDialog.vue';
import { usePermissions } from '@/composables/usePermissions';
import installmentService from '@/api/services/installment.service';
import { PERMISSIONS } from '@/config/permissions';

const route = useRoute();
const router = useRouter();
const { canAny } = usePermissions();
const api = useApi('/api/installment-plans');
const installmentApi = useApi('/api/installments');

const plan = ref(null);
const loading = ref(true);
const showPaymentDialog = ref(false);
const showDetailsDialog = ref(false);
const showSuccessDialog = ref(false);
const selectedInstallment = ref(null);
const paymentResult = ref(null);

const handlePaySuccess = data => {
  paymentResult.value = data;
  showSuccessDialog.value = true;
};

const collectedAmount = computed(() => {
  if (!plan.value) return 0;
  return plan.value.total_amount - plan.value.remaining_amount;
});

const headers = [
  { title: 'رقم القسط', key: 'installment_number' },
  { title: 'المبلغ', key: 'amount', align: 'end' },
  { title: 'تاريخ الاستحقاق', key: 'due_date' },
  { title: 'الحالة', key: 'status' },
  { title: 'الإجراءات', key: 'actions', sortable: false, align: 'end' },
];

const loadPlan = async () => {
  loading.value = true;
  try {
    const response = await api.getById(route.params.id);
    plan.value = response.data;
  } finally {
    loading.value = false;
  }
};

const getStatusLabel = status => {
  const labels = {
    active: 'نشط',
    pending: 'معلق',
    completed: 'مكتمل',
    canceled: 'ملغي',
    paid: 'مدفوع',
    overdue: 'متأخر',
    partially_paid: 'مدفوع جزئياً',
  };
  return labels[status] || status;
};

const markAsPaid = async installment => {
  try {
    await installmentApi.update(installment.id, { status: 'paid' }, { successMessage: 'تم تسجيل دفع القسط بنجاح' });
    loadPlan();
  } catch (error) {
    console.error('Error marking installment as paid:', error);
  }
};

const goToPayments = () => {
  router.push({ name: 'installment-payments', query: { plan_id: plan.value.id } });
};

const openPaymentDialog = installment => {
  if (installment?.id) {
    selectedInstallment.value = installment;
    showPaymentDialog.value = true;
  } else {
    router.push({ name: 'installment-payments', query: { plan_id: plan.value.id, action: 'pay' } });
  }
};

const openDetails = installment => {
  selectedInstallment.value = installment;
  showDetailsDialog.value = true;
};

const handlePrintReceipt = async installment => {
  try {
    const response = await installmentService.getPaymentDetails({ installment_id: installment.id });
    if (response.data && response.data.length > 0) {
      const detail = response.data[0];
      // Reconstruct the structure expected by PaymentSuccessDialog
      paymentResult.value = {
        payment_record: detail.installment_payment,
        paid_installments: response.data.map(d => d.installment),
        // These might be missing but PaymentSuccessDialog handles missing data gracefully
        excess_amount: 0,
        next_installment: null,
      };
      showSuccessDialog.value = true;
    }
  } catch (error) {
    console.error('Error fetching payment details for print:', error);
  }
};

onMounted(loadPlan);
</script>

<style scoped>
.installment-plan-view :deep(.v-container) {
  max-width: 100% !important;
}

.gap-2 {
  gap: 8px;
}
.gap-4 {
  gap: 16px;
}
</style>
