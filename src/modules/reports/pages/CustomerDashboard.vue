<template>
  <div class="customer-dashboard pa-6">
    <!-- Premium Header -->
    <div class="welcome-section mb-8 d-flex align-center justify-space-between">
      <div>
        <h1 class="text-h3 font-weight-bold primary-gradient-text">{{ dynamicGreeting }}, {{ userName }}!</h1>
        <p class="text-h6 text-grey-darken-1 font-weight-regular mt-2">إليك ملخص مالي دقيق وشامل لمعاملاتك</p>
      </div>
      <AppButton icon="ri-refresh-line" variant="tonal" color="primary" :loading="refreshing" @click="refreshAll"> تحديث البيانات </AppButton>
    </div>

    <!-- Main Scorecards -->
    <v-row class="mb-6">
      <v-col cols="12" md="4">
        <v-card class="premium-card balance-card" elevation="4">
          <div class="card-glow"></div>
          <v-card-text class="d-flex flex-column align-center py-8">
            <v-icon icon="ri-wallet-3-line" size="48" color="white" class="mb-4" />
            <div class="text-overline text-white-50">مطلوب سداده (المديونية)</div>
            <div class="text-h3 font-weight-black text-white mt-1">{{ formatCurrency(stats.remainingBalance) }}</div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card class="premium-card info-card" elevation="2">
          <v-card-text class="d-flex align-center py-6">
            <v-avatar color="success-lighten-4" size="64" class="me-4">
              <v-icon icon="ri-checkbox-circle-line" color="success" size="32" />
            </v-avatar>
            <div>
              <div class="text-caption text-grey">إجمالي ما تم دفعه</div>
              <div class="text-h5 font-weight-bold text-success">{{ formatCurrency(stats.totalPaid) }}</div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col v-if="stats.upcomingInstallmentsCount > 0" cols="12" md="4">
        <v-card class="premium-card info-card" elevation="2">
          <v-card-text class="d-flex align-center py-6">
            <v-avatar color="warning-lighten-4" size="64" class="me-4">
              <v-icon icon="ri-calendar-todo-line" color="warning" size="32" />
            </v-avatar>
            <div>
              <div class="text-caption text-grey">أقساط وشيكة</div>
              <div class="text-h5 font-weight-bold text-warning">{{ stats.upcomingInstallmentsCount }} قسط قريباً</div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Content Sections with Tabs -->
    <v-card rounded="md" class="border">
      <v-tabs v-model="activeTab" color="primary" align-tabs="start" class="border-bottom">
        <v-tab v-if="recentInvoices.length > 0" value="invoices" class="text-body-1 font-weight-bold">
          <v-icon start icon="ri-bill-line" />
          فواتيري
        </v-tab>
        <v-tab v-if="recentPayments.length > 0" value="payments" class="text-body-1 font-weight-bold">
          <v-icon start icon="ri-money-dollar-circle-line" />
          سجل المدفوعات
        </v-tab>
        <v-tab v-if="upcomingInstallments.length > 0" value="installments" class="text-body-1 font-weight-bold">
          <v-icon start icon="ri-calendar-2-line" />
          جدول الأقساط
        </v-tab>
      </v-tabs>

      <v-window v-model="activeTab" class="pa-4">
        <!-- Invoices Tab -->
        <v-window-item v-if="recentInvoices.length > 0" value="invoices">
          <AppDataTable :headers="invoiceHeaders" :items="recentInvoices" :loading="loading" hide-footer @view="showInvoiceDetails">
            <template #item.invoice_number="{ item }">
              <div class="font-weight-black text-primary">#{{ item.invoice_number }}</div>
            </template>
            <template #item.net_amount="{ item }">
              <span class="font-weight-bold">{{ formatCurrency(item.net_amount) }}</span>
            </template>
            <template #item.remaining_amount="{ item }">
              <span :class="['font-weight-bold', item.remaining_amount > 0 ? 'text-error' : 'text-success']">
                {{ formatCurrency(item.remaining_amount) }}
              </span>
            </template>
            <template #item.payment_status="{ item }">
              <v-chip :color="getPaymentStatusColor(item.payment_status)" size="x-small" label class="font-weight-black">
                {{ getPaymentStatusLabel(item.payment_status) }}
              </v-chip>
            </template>
          </AppDataTable>
          <div class="text-center mt-4">
            <AppButton variant="text" to="/invoices">عرض كافة الفواتير</AppButton>
          </div>
        </v-window-item>

        <!-- Payments Tab -->
        <v-window-item v-if="recentPayments.length > 0" value="payments">
          <AppDataTable :headers="paymentHeaders" :items="recentPayments" :loading="loading" hide-footer>
            <template #item.amount="{ item }">
              <span class="font-weight-bold text-success">{{ formatCurrency(item.amount) }}</span>
            </template>
            <template #item.invoice.invoice_number="{ item }">
              <v-chip v-if="item.invoice" size="x-small" variant="tonal" color="primary" @click="showInvoiceDetails(item.invoice)">
                #{{ item.invoice.invoice_number }}
              </v-chip>
              <span v-else class="text-grey text-caption">دفع عام</span>
            </template>
            <template #item.payment_method="{ item }">
              <div class="d-flex align-center gap-1">
                <v-icon size="14">ri-wallet-3-line</v-icon>
                {{ item.payment_method?.name || 'نقدي' }}
              </div>
            </template>
          </AppDataTable>
        </v-window-item>

        <!-- Installments Tab -->
        <v-window-item v-if="upcomingInstallments.length > 0" value="installments">
          <AppDataTable :headers="installmentHeaders" :items="upcomingInstallments" :loading="loading" hide-footer>
            <template #item.amount="{ item }">
              <span class="font-weight-bold text-warning">{{ formatCurrency(item.amount) }}</span>
            </template>
            <template #item.due_date="{ item }">
              <div :class="isLate(item.due_date) ? 'text-error font-weight-bold' : ''">
                {{ formatDate(item.due_date) }}
                <v-chip v-if="isLate(item.due_date)" size="x-small" color="error" class="ms-1">متأخر</v-chip>
              </div>
            </template>
            <template #item.plan.invoice.invoice_number="{ item }">
              <span class="text-primary font-weight-medium">#{{ item.plan?.invoice?.invoice_number }}</span>
            </template>
          </AppDataTable>
        </v-window-item>
      </v-window>
    </v-card>

    <!-- Invoice Details Dialog -->
    <AppDialog v-model="invoiceDialog.show" :title="`تفاصيل الفاتورة #${invoiceDialog.data?.invoice_number}`" max-width="900" hide-actions>
      <div v-if="invoiceDialog.data" class="pa-4">
        <v-row>
          <v-col cols="12" md="6">
            <div class="text-subtitle-2 text-grey mb-1">بيانات الفاتورة</div>
            <v-list density="compact" border class="rounded-md">
              <v-list-item title="التاريخ" :subtitle="formatDate(invoiceDialog.data.issue_date)" />
              <v-list-item title="رقم الفاتورة" :subtitle="`#${invoiceDialog.data.invoice_number}`" />
              <v-list-item title="إجمالي المبلغ" :subtitle="formatCurrency(invoiceDialog.data.net_amount)" />
              <v-list-item title="المبلغ المسدد" :subtitle="formatCurrency(invoiceDialog.data.paid_amount)" class="text-success" />
              <v-list-item
                title="المبلغ المتبقي"
                :subtitle="formatCurrency(invoiceDialog.data.remaining_amount)"
                class="text-error font-weight-bold"
              />
            </v-list>
          </v-col>
          <v-col cols="12" md="6">
            <div class="text-subtitle-2 text-grey mb-1">الحالة المالية والدفع</div>
            <v-card variant="tonal" :color="getPaymentStatusColor(invoiceDialog.data.payment_status)" class="pa-6 rounded-md text-center mb-4">
              <div class="text-h5 font-weight-black mb-1">{{ getPaymentStatusLabel(invoiceDialog.data.payment_status) }}</div>
              <div class="text-caption">حالة الفاتورة الحالية في النظام</div>
            </v-card>

            <!-- Quick Pay from Balance -->
            <v-card v-if="invoiceDialog.data.remaining_amount > 0" variant="outlined" class="pa-4 rounded-md border-dashed">
              <div class="d-flex align-center justify-space-between mb-3">
                <span class="text-body-2">رصيدك المتاح:</span>
                <span :class="['font-weight-black', userStore.currentUser.balance >= 1 ? 'text-success' : 'text-error']">
                  {{ formatCurrency(userStore.currentUser.balance) }}
                </span>
              </div>
              <AppButton
                block
                color="success"
                :disabled="userStore.currentUser.balance < 1"
                :loading="paying"
                prepend-icon="ri-qr-code-fill"
                @click="payFromBalance(invoiceDialog.data)"
              >
                {{ userStore.currentUser.balance >= 1 ? 'سداد من الرصيد المتاح' : 'رصيدك لا يكفي للسداد' }}
              </AppButton>
              <div class="text-caption text-grey mt-2 text-center">سيتم خصم المبلغ المتبقي من محفظتك الإلكترونية</div>
            </v-card>
          </v-col>
        </v-row>

        <div class="mt-6">
          <div class="text-subtitle-2 text-grey mb-2">الأصناف المشتراة</div>
          <AppDataTable :headers="itemHeaders" :items="invoiceDialog.data.items || []" hide-footer dense border class="mb-6">
            <template #item.unit_price="{ item }">{{ formatCurrency(item.unit_price) }}</template>
            <template #item.total="{ item }">{{ formatCurrency(item.unit_price * item.quantity) }}</template>
          </AppDataTable>
        </div>

        <div v-if="invoiceDialog.data.payments?.length" class="mt-6">
          <div class="text-subtitle-2 text-grey mb-2">سجل مدفوعات هذه الفاتورة</div>
          <AppDataTable :headers="paymentHeaders" :items="invoiceDialog.data.payments || []" hide-footer dense border>
            <template #item.amount="{ item }">
              <span class="font-weight-bold text-success">{{ formatCurrency(item.amount) }}</span>
            </template>
            <template #item.payment_method="{ item }">
              {{ item.payment_method?.name || 'نقدي' }}
            </template>
          </AppDataTable>
        </div>
      </div>
    </AppDialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useUserStore } from '@/stores/user';
import { useDashboardData } from '../composables/useDashboardData';
import AppDataTable from '@/components/common/AppDataTable.vue';
import AppButton from '@/components/common/AppButton.vue';
import AppDialog from '@/components/common/AppDialog.vue';
import { formatCurrency, formatDate } from '@/utils/formatters';

const userStore = useUserStore();
const { stats, recentInvoices, recentPayments, upcomingInstallments, refreshing, loading, refreshAll } = useDashboardData();

const activeTab = ref('invoices');
const invoiceDialog = ref({
  show: false,
  data: null,
});

const userName = computed(() => userStore.currentUser?.full_name?.split(' ')[0] || 'أهلاً بك');
const dynamicGreeting = computed(() => {
  const hour = new Date().getHours();
  if (hour < 12) return 'صباح الخير';
  if (hour < 18) return 'مساء الخير';
  return 'أهلاً بك';
});

// Table Headers
const invoiceHeaders = [
  { title: 'رقم الفاتورة', key: 'invoice_number' },
  { title: 'التاريخ', key: 'issue_date' },
  { title: 'الإجمالي', key: 'net_amount' },
  { title: 'المتبقي', key: 'remaining_amount' },
  { title: 'الحالة', key: 'payment_status' },
  { title: '', key: 'actions', align: 'end' },
];

const paymentHeaders = [
  { title: 'المبلغ', key: 'amount' },
  { title: 'التاريخ', key: 'payment_date' },
  { title: 'طريقة الدفع', key: 'payment_method' },
  { title: 'الفاتورة', key: 'invoice.invoice_number' },
];

const installmentHeaders = [
  { title: 'المبلغ', key: 'amount' },
  { title: 'تاريخ الاستحقاق', key: 'due_date' },
  { title: 'الفاتورة', key: 'plan.invoice.invoice_number' },
];

const itemHeaders = [
  { title: 'الصنف', key: 'product.name' },
  { title: 'الكمية', key: 'quantity' },
  { title: 'السعر', key: 'unit_price' },
  { title: 'الإجمالي', key: 'total' },
];

// Helper Functions
const getPaymentStatusColor = status => {
  const colors = { unpaid: 'error', partial: 'warning', paid: 'success', overpaid: 'info' };
  return colors[status] || 'grey';
};

const getPaymentStatusLabel = status => {
  const labels = {
    unpaid: 'بانتظار السداد',
    partial: 'سداد جزئي',
    paid: 'تم السداد بالكامل',
    overpaid: 'رصيد زايد (فائض)',
  };
  return labels[status] || status;
};

const isLate = date => new Date(date) < new Date() && activeTab.value === 'installments';

const showInvoiceDetails = invoice => {
  invoiceDialog.value.data = invoice;
  invoiceDialog.value.show = true;
};

const paying = ref(false);
const payFromBalance = async invoice => {
  paying.value = true;
  try {
    const { useApi } = await import('@/composables/useApi');
    const paymentApi = useApi('/api/payments');

    await paymentApi.store({
      user_id: userStore.currentUser.id,
      invoice_id: invoice.id,
      cash_amount: 0,
      credit_amount: invoice.remaining_amount,
      payment_date: new Date().toISOString().slice(0, 19).replace('T', ' '),
      notes: `سداد آلي من رصيد الداشبورد للعميل`,
      cash_box_id: userStore.currentUser.cash_box_default_id || 1, // استخدام خزينة افتراضية
    });

    invoiceDialog.value.show = false;
    refreshAll();
    userStore.fetchUser(); // تحديث الرصيد العلوي
  } catch (error) {
    console.error('Payment failed:', error);
  } finally {
    paying.value = false;
  }
};

// Auto-select first available tab after loading
watch(
  [recentInvoices, recentPayments, upcomingInstallments],
  () => {
    if (recentInvoices.value.length > 0) {
      activeTab.value = 'invoices';
    } else if (recentPayments.value.length > 0) {
      activeTab.value = 'payments';
    } else if (upcomingInstallments.value.length > 0) {
      activeTab.value = 'installments';
    }
  },
  { once: true }
);

onMounted(() => {
  refreshAll();
});
</script>

<style scoped>
.primary-gradient-text {
  background: linear-gradient(135deg, rgb(var(--v-theme-primary)) 0%, #1a237e 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.premium-card {
  border-radius: 24px !important;
  overflow: hidden;
  position: relative;
  transition: transform 0.3s ease;
}

.premium-card:hover {
  transform: translateY(-5px);
}

.balance-card {
  background: linear-gradient(135deg, rgb(var(--v-theme-primary)) 0%, #312e81 100%);
  color: white;
}

.card-glow {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
  pointer-events: none;
}

.text-white-50 {
  color: rgba(255, 255, 255, 0.6) !important;
}

.info-card {
  border: 1px solid rgba(var(--v-theme-primary), 0.08);
}
</style>
