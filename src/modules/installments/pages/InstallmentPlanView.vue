<template>
  <div class="installment-plan-view">
    <AppPageHeader
      :title="`خطة التقسيط #${plan?.id}`"
      :subtitle="`فاتورة رقم #${plan?.invoice?.invoice_number}${plan?.down_payment > 0 ? ' - دفعة مقدمة: ' + formatCurrency(plan.down_payment) : ''}`"
      icon="ri-calendar-event-line"
      sticky
    >
      <template #prepend>
        <AppButton icon="ri-arrow-right-line" variant="text" @click="router.back()" />
      </template>
      <template #append>
        <div class="d-flex gap-2 flex-wrap justify-end">
          <AppButton
            v-if="plan?.status === 'active'"
            color="success"
            prepend-icon="ri-hand-coin-line"
            class="font-weight-bold"
            @click="openPaymentDialog()"
          >
            تحصيل قسط
          </AppButton>

          <AppPrintShare v-if="plan" type="installment_plan" :data="{ plan }" label="طباعة الفاتورة" color="primary" variant="tonal" />

          <AppPrintShare v-if="plan" type="contract" :data="{ plan }" label="طباعة العقد" color="black" />
        </div>
      </template>
    </AppPageHeader>

    <v-container fluid class="pt-2">
      <!-- Error/Loading -->
      <div v-if="loading && !plan" class="d-flex justify-center align-center py-12">
        <LoadingSpinner />
      </div>

      <div v-else-if="plan" class="installment-plan-dashboard">
        <v-row>
          <!-- Top Stats Row -->
          <v-row dense>
            <v-col cols="4" sm="4" md="2" class="flex-grow-1">
              <StatsCard
                title="الأقساط المتبقية"
                :value="remainingInstallmentsCount"
                icon="ri-calendar-event-line"
                color="#3F51B5"
                :subtitle="`من إجمالي ${plan.number_of_installments} أقساط`"
              />
            </v-col>
            <v-col cols="4" sm="4" md="2" class="flex-grow-1">
              <StatsCard title="إجمالي مبلغ الخطة" :value="plan.total_amount" type="currency" icon="ri-money-dollar-circle-line" color="primary" />
            </v-col>
            <v-col cols="4" sm="4" md="2" class="flex-grow-1">
              <StatsCard title="الدفعة المقدمة" :value="plan.down_payment" type="currency" icon="ri-hand-coin-line" color="#FB8C00" />
            </v-col>
            <v-col cols="6" sm="4" md="2" class="flex-grow-1">
              <StatsCard
                title="المبلغ المحصل"
                :value="plan.total_pay"
                type="currency"
                icon="ri-checkbox-circle-line"
                color="success"
                show-progress
                :progress="plan.payment_progress"
              />
            </v-col>
            <v-col cols="6" sm="4" md="2" class="flex-grow-1">
              <StatsCard title="المتبقي للتحصيل" :value="plan.remaining_amount" type="currency" icon="ri-error-warning-line" color="error" />
            </v-col>
          </v-row>

          <!-- Main Content -->
          <v-col cols="12" md="8">
            <!-- Unified Customer Card -->
            <FinancialCustomerCard v-if="plan.customer" :customer="plan.customer" :balance="plan.customer.balance" class="mb-6" />

            <!-- Products Included -->
            <AppCard v-if="plan.invoice_items?.length" title="المنتجات المشمولة في العقد" icon="ri-shopping-bag-3-line" class="mb-6" rounded="lg">
              <v-table density="compact">
                <thead>
                  <tr>
                    <th class="text-right">المنتج</th>
                    <th class="text-center">الكمية</th>
                    <th class="text-left">الإجمالي</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in plan.invoice_items" :key="item.id">
                    <td class="font-weight-bold py-2">{{ item.name }}</td>
                    <td class="text-center">{{ item.quantity }}</td>
                    <td class="text-left font-weight-black text-primary">{{ formatCurrency(item.total) }}</td>
                  </tr>
                </tbody>
              </v-table>
            </AppCard>

            <!-- Installment Schedule Table -->
            <AppCard title="جدول سداد الأقساط" icon="ri-calendar-todo-line" padding="0" rounded="lg">
              <InstallmentsTable
                :items="plan.installments || []"
                :show-customer="false"
                :show-plan="false"
                @refresh="loadPlan"
                @pay="openPaymentDialog"
                @view="openDetails"
                @print-receipt="handlePrintReceipt"
                class="border-0"
                :highlight-next="true"
              />
            </AppCard>
          </v-col>

          <!-- Sidebar -->
          <v-col cols="12" md="4">
            <div class="d-flex flex-column gap-4">
              <!-- Plan Setup Details -->
              <v-card rounded="lg" class="border shadow-sm pa-4">
                <div class="text-subtitle-2 font-weight-bold text-primary mb-4 d-flex align-center border-b border-primary border-opacity-25 pb-2">
                  <v-icon icon="ri-settings-4-line" size="18" class="me-2" />
                  بيانات التعاقد الثابتة
                </div>

                <div class="d-flex flex-column gap-4">
                  <div class="d-flex justify-space-between align-center">
                    <span class="text-caption text-grey">قيمة القسط الثابت:</span>
                    <span class="font-weight-black text-h6 text-success">{{ formatCurrency(plan.installment_amount) }}</span>
                  </div>
                  <div class="d-flex justify-space-between">
                    <span class="text-caption text-grey">دورية السداد:</span>
                    <span class="font-weight-bold">{{ getFrequencyLabel(plan.frequency) }}</span>
                  </div>
                  <div class="d-flex justify-space-between">
                    <span class="text-caption text-grey">نسبة الفائدة:</span>
                    <span class="font-weight-bold text-error">{{ plan.interest_rate }}%</span>
                  </div>
                  <div class="d-flex justify-space-between">
                    <span class="text-caption text-grey">تاريخ بدء الخطة:</span>
                    <span class="font-weight-bold">{{ formatDate(plan.start_date) }}</span>
                  </div>
                </div>

                <v-divider class="my-4 opacity-50" />

                <div class="d-flex align-center gap-2">
                  <v-avatar color="primary-lighten-4" size="28">
                    <span class="text-xs text-primary font-weight-black">{{ plan.creator?.full_name?.charAt(0) }}</span>
                  </v-avatar>
                  <div>
                    <div class="text-xxs text-grey">أنشئت بواسطة</div>
                    <div class="text-caption font-weight-bold">{{ plan.creator?.full_name || 'موظف غير معروف' }}</div>
                  </div>
                </div>
              </v-card>

              <!-- Quick Link to Invoice -->
              <v-card
                v-if="plan.invoice"
                rounded="lg"
                class="border shadow-sm pa-4 bg-blue-grey-lighten-5 cursor-pointer"
                @click="router.push(`/app/invoices/${plan.invoice.id}`)"
              >
                <div class="d-flex align-center justify-space-between">
                  <div class="d-flex align-center">
                    <v-icon icon="ri-file-list-3-line" color="blue-grey" class="me-3" />
                    <div>
                      <div class="text-caption text-blue-grey">الفاتورة الأصلية</div>
                      <div class="text-subtitle-2 font-weight-black">#{{ plan.invoice.invoice_number }}</div>
                    </div>
                  </div>
                  <v-icon icon="ri-arrow-left-s-line" color="blue-grey" />
                </div>
              </v-card>

              <!-- Notes -->
              <v-card v-if="plan.notes" rounded="lg" class="border shadow-sm pa-4 bg-amber-lighten-5 border-amber">
                <div class="text-subtitle-2 font-weight-bold text-amber-darken-3 mb-2 d-flex align-center">
                  <v-icon icon="ri-sticky-note-line" size="18" class="me-2" />
                  ملاحظات إضافية
                </div>
                <div class="text-body-2 text-grey-darken-3 italic">{{ plan.notes }}</div>
              </v-card>
            </div>
          </v-col>
        </v-row>
      </div>

      <v-row v-else-if="!loading">
        <v-col cols="12">
          <v-alert type="error" variant="tonal">عذراً، لم يتم العثور على خطة التقسيط المطلوبة.</v-alert>
        </v-col>
      </v-row>
    </v-container>

    <!-- Dialogs -->
    <InstallmentPaymentDialog v-model="showPaymentDialog" :installment="selectedInstallment" @success="handlePaySuccess" />
    <PaymentSuccessDialog v-model="showSuccessDialog" :payment-details="paymentResult" @close="loadPlan" />
    <InstallmentDetailsDialog v-model="showDetailsDialog" :installment="selectedInstallment" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useApi } from '@/composables/useApi';
import { useDisplay } from 'vuetify';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { AppButton, AppSkeleton, AppPhone, AppCard, AppAvatar, StatsCard, AppPrintShare } from '@/components';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import FinancialCustomerCard from '@/components/common/FinancialCustomerCard.vue';
import InstallmentsTable from '../components/InstallmentsTable.vue';
import InstallmentPaymentDialog from '../components/InstallmentPaymentDialog.vue';
import InstallmentDetailsDialog from '../components/InstallmentDetailsDialog.vue';
import PaymentSuccessDialog from '../components/PaymentSuccessDialog.vue';
import { usePermissions } from '@/composables/usePermissions';
import installmentService from '@/api/services/installment.service';
import { PERMISSIONS } from '@/config/permissions';

const route = useRoute();
const router = useRouter();
const { mobile } = useDisplay();
const { can } = usePermissions();
const api = useApi('/api/installment-plans');

const plan = ref(null);
const loading = ref(true);
const showPaymentDialog = ref(false);
const showDetailsDialog = ref(false);
const showSuccessDialog = ref(false);
const selectedInstallment = ref(null);
const paymentResult = ref(null);

const remainingInstallmentsCount = computed(() => {
  if (!plan.value?.installments) return 0;
  return plan.value.installments.filter(i => i.status === 'pending' || i.status === 'overdue' || i.status === 'partially_paid').length;
});

const handlePaySuccess = data => {
  paymentResult.value = data;
  showSuccessDialog.value = true;
};

const getFrequencyLabel = freq => {
  const labels = { monthly: 'شهرياً', weekly: 'أسبوعياً', daily: 'يومياً' };
  return labels[freq] || freq;
};

const loadPlan = async () => {
  loading.value = true;
  try {
    const response = await api.getById(route.params.id);
    plan.value = response.data;
  } finally {
    loading.value = false;
  }
};

const openPaymentDialog = installment => {
  if (installment?.id) {
    selectedInstallment.value = installment;
  } else {
    selectedInstallment.value = null; // General payment
  }
  showPaymentDialog.value = true;
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
      paymentResult.value = {
        payment_record: detail.installment_payment,
        paid_installments: response.data.map(d => d.installment),
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
.installment-plan-dashboard {
  animation: fadeIn 0.4s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.cursor-pointer {
  cursor: pointer;
  transition: background 0.2s ease;
}

.cursor-pointer:hover {
  background-color: #f1f5f9 !important;
}

.gap-2 {
  gap: 8px;
}
.gap-4 {
  gap: 16px;
}

.border-soft {
  border-color: rgba(0, 0, 0, 0.05) !important;
}

.text-xxs {
  font-size: 0.65rem;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}
</style>
