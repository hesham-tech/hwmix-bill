<template>
  <v-container fluid :class="mobile ? 'pa-2' : 'pa-4'">
    <div class="d-flex align-center justify-space-between mb-6 flex-wrap gap-3">
      <div class="d-flex align-center">
        <v-btn icon="ri-arrow-right-line" variant="text" color="secondary" @click="goBack" class="me-3" />
        <div>
          <h1 class="text-h4 font-weight-black">الفاتورة #{{ invoice?.invoice_number }}</h1>
          <p class="text-body-1 text-grey mb-0" v-if="invoice">
            <v-icon icon="ri-calendar-line" size="small" class="me-1" />
            {{ formatDate(invoice.issue_date) }}
          </p>
        </div>
      </div>
      <div class="no-print">
        <v-btn color="primary" prepend-icon="ri-printer-line" variant="elevated" class="px-6" @click="printInvoice"> طباعة الفاتورة </v-btn>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="d-flex justify-center align-center py-12">
      <v-progress-circular indeterminate color="primary" size="64" />
    </div>

    <div id="purchase-content" class="pb-12">
      <v-row v-if="invoice">
        <!-- Main Content -->
        <v-col cols="12" md="8">
          <!-- Company Info (Vendor) -->
          <v-card variant="flat" border class="pa-4 mb-6 bg-grey-lighten-5">
            <div class="d-flex align-center mb-4">
              <v-avatar color="primary" rounded="lg" size="48" class="me-3">
                <v-icon icon="ri-building-2-line" color="white" />
              </v-avatar>
              <div>
                <div class="text-caption text-grey">البائع / الشركة</div>
                <div class="text-h6 font-weight-bold">{{ invoice.company?.name || 'شركة التقنية المتقدمة' }}</div>
              </div>
            </div>
            <v-divider class="mb-4" />
            <v-row>
              <v-col cols="12" sm="6" class="py-1">
                <div class="text-caption text-grey">رقم الهاتف</div>
                <div class="font-weight-medium">{{ invoice.company?.phone || '---' }}</div>
              </v-col>
              <v-col cols="12" sm="6" class="py-1">
                <div class="text-caption text-grey">البريد الإلكتروني</div>
                <div class="font-weight-medium">{{ invoice.company?.email || '---' }}</div>
              </v-col>
            </v-row>
          </v-card>

          <!-- Financial Summary -->
          <v-card variant="flat" border class="pa-4 mb-6">
            <div class="text-h6 font-weight-bold mb-4">الملخص المالي</div>

            <div class="d-flex justify-space-between mb-2">
              <span class="text-grey">الإجمالي</span>
              <span class="font-weight-medium">{{ formatCurrency(invoice.gross_amount) }}</span>
            </div>

            <div v-if="invoice.total_discount > 0" class="d-flex justify-space-between mb-2 text-error">
              <span>خصومات</span>
              <span>-{{ formatCurrency(invoice.total_discount) }}</span>
            </div>

            <v-divider class="my-3" />

            <div class="d-flex justify-space-between align-center mb-4">
              <span class="text-subtitle-1 font-weight-bold">صافي المشتريات</span>
              <span class="text-h5 font-weight-black text-primary">{{ formatCurrency(invoice.net_amount) }}</span>
            </div>

            <div class="bg-primary-lighten-5 pa-4 text-center">
              <div class="text-caption text-primary-darken-2 font-weight-bold mb-1">المبلغ المتبقي للسداد</div>
              <div class="text-h4 font-weight-black text-primary-darken-3">
                {{ formatCurrency(invoice.remaining_amount) }}
              </div>
            </div>

            <div v-if="invoice.installment_plan" class="mt-4 pa-3 rounded-lg border-primary border-dashed border-sm bg-blue-lighten-5">
              <div class="text-primary font-weight-bold mb-1 d-flex align-center">
                <v-icon icon="ri-calendar-todo-line" size="small" class="me-2" />
                تحت التقسيط
              </div>
              <div class="text-caption text-primary">القسط الشهري: {{ formatCurrency(invoice.installment_plan.installment_amount) }}</div>
            </div>
          </v-card>
          <!-- Items Table -->
          <v-card variant="flat" border class="overflow-hidden mb-6">
            <div class="bg-grey-lighten-4 pa-4 font-weight-bold d-flex align-center">
              <v-icon icon="ri-list-check-2" class="me-2 text-primary" />
              تفاصيل المشتروات
            </div>

            <!-- Desktop View -->
            <v-table v-if="!mobile">
              <thead>
                <tr>
                  <th class="text-right">المنتج</th>
                  <th class="text-center">الكمية</th>
                  <th class="text-left font-weight-bold">الإجمالي</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in invoice.items" :key="item.id">
                  <td>
                    <div class="d-flex align-center py-3">
                      <AppAvatar
                        v-if="item.primary_image_url"
                        :img-url="item.primary_image_url"
                        :name="item.name"
                        size="48"
                        rounded="lg"
                        class="me-3 border shadow-sm"
                        type="product"
                      />
                      <v-avatar v-else color="grey-lighten-4" size="48" rounded="lg" class="me-3 border">
                        <v-icon icon="ri-image-line" color="grey" />
                      </v-avatar>
                      <div>
                        <div class="font-weight-black text-body-1">{{ item.name }}</div>
                        <div class="text-caption text-grey">سعر الوحدة: {{ formatCurrency(item.unit_price) }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="text-center">
                    <v-chip size="small" variant="tonal" color="primary" class="font-weight-bold">{{ item.quantity }}</v-chip>
                  </td>
                  <td class="text-left font-weight-black text-primary text-body-1">{{ formatCurrency(item.total) }}</td>
                </tr>
              </tbody>
            </v-table>

            <!-- Mobile View -->
            <div v-else class="pa-2">
              <v-card v-for="item in invoice.items" :key="'m-' + item.id" border flat class="mb-3 rounded-lg overflow-hidden">
                <div class="d-flex pa-3 align-center">
                  <AppAvatar
                    v-if="item.primary_image_url"
                    :img-url="item.primary_image_url"
                    :name="item.name"
                    size="60"
                    rounded="lg"
                    class="me-3 border"
                    type="product"
                  />
                  <div class="flex-grow-1">
                    <div class="font-weight-black text-body-2 mb-1">{{ item.name }}</div>
                    <div class="d-flex justify-space-between align-end">
                      <div class="text-caption text-grey">{{ item.quantity }} × {{ formatCurrency(item.unit_price) }}</div>
                      <div class="text-subtitle-2 font-weight-black text-primary">{{ formatCurrency(item.total) }}</div>
                    </div>
                  </div>
                </div>
              </v-card>
            </div>
          </v-card>
        </v-col>

        <!-- Sidebar Summary -->
        <v-col cols="12" md="4">
          <!-- Status Card -->
          <v-card variant="flat" border class="mb-6 text-center">
            <div class="text-caption text-grey text-right">حالة السداد</div>
            <div class="">
              <v-icon
                :icon="getPaymentStatusIcon(invoice.payment_status)"
                size="48"
                :color="getPaymentStatusColor(invoice.payment_status)"
                class="mb-3"
              />
              <div class="text-h5 font-weight-black" :class="`text-${getPaymentStatusColor(invoice.payment_status)}`">
                {{ getPaymentStatusLabel(invoice.payment_status) }}
              </div>
            </div>
          </v-card>
          <!-- Payment History (Moved to Bottom) -->
          <v-card v-if="invoice.payments?.length" variant="flat" border class="pa-4">
            <div class="text-h6 font-weight-bold mb-4 d-flex align-center">
              <v-icon icon="ri-history-line" class="me-2 text-success" />
              سجل المدفوعات
            </div>
            <v-list class="pa-0">
              <v-list-item
                v-for="(payment, index) in invoice.payments"
                :key="payment.id"
                class="px-0 py-3"
                :class="{ 'border-bottom': index < invoice.payments.length - 1 }"
              >
                <template #prepend>
                  <v-avatar color="success-lighten-5" size="40" class="me-3">
                    <v-icon icon="ri-money-dollar-circle-line" color="success" />
                  </v-avatar>
                </template>
                <v-list-item-title class="font-weight-bold text-success">
                  {{ formatCurrency(payment.amount) }}
                </v-list-item-title>
                <v-list-item-subtitle> {{ formatDate(payment.payment_date) }} - {{ payment.payment_method?.name }} </v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card>
        </v-col>
      </v-row>
    </div>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useDisplay } from 'vuetify';
import { useApi } from '@/composables/useApi';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { usePrintExport } from '@/composables/usePrintExport';

const router = useRouter();
const route = useRoute();
const { mobile } = useDisplay();
const { printElement } = usePrintExport();
const invoiceApi = useApi('/api/invoices');

const loading = ref(true);
const invoice = ref(null);

const goBack = () => router.push('/app/purchases');

const printInvoice = () => {
  printElement('purchase-content', `فاتورة #${invoice.value?.invoice_number}`);
};

const getPaymentStatusColor = status => {
  const colors = { unpaid: 'error', partial: 'warning', partially_paid: 'warning', paid: 'success', overpaid: 'indigo' };
  return colors[status] || 'grey';
};

const getPaymentStatusIcon = status => {
  const icons = {
    unpaid: 'ri-error-warning-line',
    partial: 'ri-pie-chart-2-line',
    partially_paid: 'ri-pie-chart-2-line',
    paid: 'ri-checkbox-circle-line',
    overpaid: 'ri-add-circle-line',
  };
  return icons[status] || 'ri-question-line';
};

const getPaymentStatusLabel = status => {
  const labels = {
    unpaid: 'بانتظار السداد',
    partial: 'سداد جزئي',
    partially_paid: 'سداد جزئي',
    paid: 'تم السداد بالكامل',
    overpaid: 'مدفوع بزيادة',
  };
  return labels[status] || status;
};

onMounted(async () => {
  try {
    const response = await invoiceApi.getById(route.params.id);
    invoice.value = response.data;
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.gap-1 {
  gap: 4px;
}
.gap-3 {
  gap: 12px;
}
.border-bottom {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05) !important;
}
.border-dashed {
  border-style: dashed !important;
}
</style>
