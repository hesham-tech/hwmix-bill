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
        <!-- Section 1: Customer Info & Quick Stats (The Face of the Plan) -->
        <v-row class="mb-4">
          <v-col cols="12">
            <v-card rounded="lg" class="border shadow-sm overflow-hidden">
              <v-row no-gutters>
                <!-- Customer Profile Card -->
                <v-col cols="12" md="4" class="bg-primary-lighten-5 pa-6 border-e">
                  <div class="d-flex align-center h-100">
                    <v-avatar color="primary" size="84" class="me-6 elevation-3 border border-white border-xl">
                      <v-icon icon="ri-user-heart-line" color="white" size="42" />
                    </v-avatar>
                    <div>
                      <div class="text-overline text-primary font-weight-black mb-1">العميل المرتبط بالخطة</div>
                      <h2 class="text-h5 font-weight-bold mb-1">
                        {{ plan.customer?.full_name || 'غير متوفر' }}
                      </h2>
                      <div class="d-flex align-center gap-2 mb-2">
                        <v-chip
                          v-if="plan.customer?.nickname && plan.customer.nickname !== plan.customer.full_name"
                          color="primary"
                          size="x-small"
                          variant="flat"
                          class="font-weight-bold px-2"
                        >
                          {{ plan.customer.nickname }}
                        </v-chip>
                        <v-chip :color="getStatusColor(plan.status)" size="x-small" variant="flat" class="font-weight-bold px-2">
                          {{ plan.status_label || getStatusLabel(plan.status) }}
                        </v-chip>
                      </div>
                      <AppPhone v-if="plan.customer?.phone" :phone="plan.customer.phone" class="text-primary font-weight-bold" />
                    </div>
                  </div>
                </v-col>

                <!-- Financial Progress Overview -->
                <v-col cols="12" md="8" class="pa-6">
                  <v-row dense>
                    <v-col cols="12" sm="6" lg="3">
                      <div class="pa-3 rounded-lg bg-grey-lighten-4 border h-100 d-flex flex-column justify-center border-soft">
                        <div class="text-xxs text-grey-darken-1 font-weight-bold mb-1 d-flex align-center">
                          <v-icon icon="ri-money-dollar-circle-line" size="14" class="me-1 text-primary" />
                          إجمالي الخطة
                        </div>
                        <div class="text-h6 font-weight-black text-primary">{{ formatCurrency(plan.total_amount) }}</div>
                      </div>
                    </v-col>
                    <v-col cols="12" sm="6" lg="3">
                      <div class="pa-3 rounded-lg bg-indigo-lighten-5 border border-indigo-lighten-3 h-100 d-flex flex-column justify-center">
                        <div class="text-xxs text-indigo-darken-1 font-weight-bold mb-1 d-flex align-center">
                          <v-icon icon="ri-hand-coin-line" size="14" class="me-1" />
                          المقدم المدفوع
                        </div>
                        <div class="text-h6 font-weight-black text-indigo">{{ formatCurrency(plan.down_payment) }}</div>
                      </div>
                    </v-col>
                    <v-col cols="12" sm="6" lg="3">
                      <div class="pa-3 rounded-lg bg-success-lighten-5 border border-success-lighten-3 h-100 d-flex flex-column justify-center">
                        <div class="text-xxs text-success-darken-1 font-weight-bold mb-1 d-flex align-center">
                          <v-icon icon="ri-checkbox-circle-line" size="14" class="me-1" />
                          إجمالي المحصل
                        </div>
                        <div class="text-h6 font-weight-black text-success">{{ formatCurrency(plan.total_pay || collectedAmount) }}</div>
                      </div>
                    </v-col>
                    <v-col cols="12" sm="6" lg="3">
                      <div class="pa-3 rounded-lg bg-error-lighten-5 border border-error-lighten-3 h-100 d-flex flex-column justify-center">
                        <div class="text-xxs text-error-darken-1 font-weight-bold mb-1 d-flex align-center">
                          <v-icon icon="ri-alarm-warning-line" size="14" class="me-1" />
                          المتبقي الكلي
                        </div>
                        <div class="text-h6 font-weight-black text-error">{{ formatCurrency(plan.remaining_amount) }}</div>
                      </div>
                    </v-col>
                    <v-col cols="12" class="pt-3">
                      <div class="d-flex align-center justify-space-between mb-1">
                        <span class="text-xxs font-weight-bold text-grey-darken-1">تقدم سداد الأقساط</span>
                        <span class="text-xxs font-weight-black text-primary">{{ Math.round(paymentProgress) }}%</span>
                      </div>
                      <v-progress-linear
                        :model-value="paymentProgress"
                        height="8"
                        rounded
                        color="primary"
                        class="shadow-sm mt-1"
                        :indeterminate="false"
                      >
                      </v-progress-linear>
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>
            </v-card>
          </v-col>
        </v-row>

        <!-- Section 2: Detailed Info Tabs/Panels -->
        <v-row>
          <!-- Left Column: Installments & Products -->
          <v-col cols="12" md="9">
            <!-- Associated Products Summary -->
            <v-card v-if="plan.invoice_items?.length" rounded="md" class="border shadow-sm mb-4">
              <div class="pa-3 bg-secondary-lighten-5 border-b d-flex align-center">
                <v-icon icon="ri-shopping-bag-3-line" color="secondary" size="18" class="me-2" />
                <span class="text-subtitle-2 font-weight-bold text-secondary"
                  >المنتجات المشمولة في الفاتورة (#{{ plan.invoice?.invoice_number }})</span
                >
              </div>
              <v-table density="compact" class="text-caption">
                <thead>
                  <tr class="bg-grey-lighten-5">
                    <th class="text-right">المنتج</th>
                    <th class="text-center">الكمية</th>
                    <th class="text-center">السعر</th>
                    <th class="text-left">الإجمالي</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in plan.invoice_items" :key="item.id">
                    <td class="font-weight-bold py-2">
                      {{ item.name || item.variant?.product_name || item.product_name }}
                      <div v-if="item.variant?.attribute_values_string" class="text-xxs text-grey">({{ item.variant.attribute_values_string }})</div>
                    </td>
                    <td class="text-center">{{ item.quantity }}</td>
                    <td class="text-center">{{ formatCurrency(item.unit_price) }}</td>
                    <td class="text-left font-weight-bold">{{ formatCurrency(item.total || item.total_price) }}</td>
                  </tr>
                </tbody>
              </v-table>
            </v-card>

            <!-- Installments Table -->
            <v-card rounded="md" class="border shadow-sm">
              <div class="pa-3 bg-primary-lighten-5 border-b d-flex justify-space-between align-center">
                <div class="d-flex align-center">
                  <v-icon icon="ri-list-ordered" color="primary" size="18" class="me-2" />
                  <span class="text-subtitle-2 font-weight-bold text-primary">جدول تحصيل الأقساط</span>
                </div>
                <v-chip size="x-small" density="comfortable" color="primary" variant="flat" class="font-weight-bold px-2">
                  {{ plan.number_of_installments }} قسط
                </v-chip>
              </div>
              <InstallmentsTable
                :items="plan.installments || []"
                :loading="loading"
                :show-customer="false"
                :show-plan="false"
                variant="flat"
                @view="openDetails"
                @pay="openPaymentDialog"
                @print-receipt="handlePrintReceipt"
              />
            </v-card>
          </v-col>

          <!-- Right Column: Sidebar Meta Info -->
          <v-col cols="12" md="3">
            <div class="d-flex flex-column gap-4">
              <!-- Plan Setup Details -->
              <v-card rounded="md" class="border shadow-sm pa-4">
                <div class="text-subtitle-2 font-weight-bold text-grey-darken-2 mb-4 d-flex align-center border-b pb-2">
                  <v-icon icon="ri-settings-4-line" size="18" class="me-2" />
                  إعدادات الخطة
                </div>

                <div class="mb-4">
                  <div class="text-caption text-grey mb-1">قيمة القسط الثابت</div>
                  <div class="d-flex align-center gap-2">
                    <v-icon icon="ri-coin-line" size="small" color="success" />
                    <span class="font-weight-bold text-success">{{ formatCurrency(plan.installment_amount) }}</span>
                  </div>
                </div>

                <div class="mb-4">
                  <div class="text-caption text-grey mb-1">تاريخ البدء</div>
                  <div class="d-flex align-center gap-2">
                    <v-icon icon="ri-calendar-line" size="small" color="primary" />
                    <span class="font-weight-bold">{{ formatDate(plan.start_date) }}</span>
                  </div>
                </div>

                <div class="mb-4">
                  <div class="text-caption text-grey mb-1">دورية السداد</div>
                  <div class="d-flex align-center gap-2">
                    <v-icon icon="ri-refresh-line" size="small" color="secondary" />
                    <span class="font-weight-bold">{{ getFrequencyLabel(plan.frequency) }}</span>
                  </div>
                </div>

                <div class="mb-4">
                  <div class="text-caption text-grey mb-1">نسبة الفائدة</div>
                  <div class="d-flex align-center gap-2">
                    <v-icon icon="ri-percent-line" size="small" color="error" />
                    <span class="font-weight-bold text-error">{{ plan.interest_rate }}% ({{ formatCurrency(plan.interest_amount) }})</span>
                  </div>
                </div>

                <v-divider class="my-3 opacity-50" />

                <div>
                  <div class="text-caption text-grey mb-1">بواسطة الموظف</div>
                  <div class="d-flex align-center gap-2">
                    <v-avatar color="primary-lighten-4" size="24">
                      <span class="text-xxs text-primary font-weight-black">{{ plan.creator?.full_name?.charAt(0) }}</span>
                    </v-avatar>
                    <span class="text-caption font-weight-bold">{{ plan.creator?.full_name || 'غير معروف' }}</span>
                  </div>
                </div>
              </v-card>

              <!-- Notes Card -->
              <v-card v-if="plan.notes" rounded="md" class="border shadow-sm pa-4 bg-amber-lighten-5 border-amber">
                <div class="text-subtitle-2 font-weight-bold text-amber-darken-3 mb-2 d-flex align-center">
                  <v-icon icon="ri-sticky-note-line" size="18" class="me-2" />
                  ملاحظات الخطة
                </div>
                <div class="text-body-2 text-grey-darken-3 italic">{{ plan.notes }}</div>
              </v-card>

              <!-- Quick Actions -->
              <v-card rounded="md" class="border shadow-sm pa-3">
                <AppButton block color="secondary" variant="tonal" prepend-icon="ri-history-line" class="mb-2" @click="goToPayments">
                  سجل الدفعات
                </AppButton>
                <AppButton block color="primary" variant="outlined" prepend-icon="ri-printer-line"> طباعة الجدول </AppButton>
              </v-card>
            </div>
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
import { AppButton, AppSkeleton, AppPhone } from '@/components';
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

const paymentProgress = computed(() => {
  if (!plan.value || !plan.value.total_amount || plan.value.total_amount == 0) return 0;
  return (parseFloat(collectedAmount.value) / parseFloat(plan.value.total_amount)) * 100;
});

const getFrequencyLabel = freq => {
  const labels = {
    monthly: 'شهرياً',
    weekly: 'أسبوعياً',
    daily: 'يومياً',
  };
  return labels[freq] || freq;
};

const getStatusColor = status => {
  const colors = {
    active: 'info',
    pending: 'warning',
    completed: 'success',
    paid: 'success',
    canceled: 'error',
    overdue: 'error',
    partially_paid: 'secondary',
  };
  return colors[status] || 'grey';
};

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
