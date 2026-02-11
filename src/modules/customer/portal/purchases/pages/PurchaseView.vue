<template>
  <v-container fluid :class="mobile ? 'pa-2' : 'pa-4'">
    <div class="d-flex align-center justify-space-between mb-6 flex-wrap gap-3">
      <div class="d-flex align-center">
        <v-btn icon="ri-arrow-right-line" variant="tonal" color="slate-600" @click="goBack" class="me-4 rounded-lg" />
        <div>
          <div class="text-overline font-weight-black text-primary line-height-1 mb-1">تفاصيل المشتريات المصدقة</div>
          <h1 class="text-h4 font-weight-black text-slate-900">إيصال رقم #{{ invoice?.invoice_number }}</h1>
        </div>
      </div>
      <div class="no-print d-flex gap-2">
        <!-- Global Account Balance Info -->
        <v-card
          variant="tonal"
          :color="userStore.currentUser?.balance < 0 ? 'error' : 'success'"
          class="pa-2 px-4 rounded-xl d-flex align-center gap-2"
        >
          <v-icon :icon="userStore.currentUser?.balance < 0 ? 'ri-error-warning-line' : 'ri-checkbox-circle-line'" size="20" />
          <div class="text-right">
            <div class="text-xxs font-weight-bold opacity-70">رصيد الحساب الجاري</div>
            <div class="text-subtitle-2 font-weight-black line-height-1">{{ formatCurrency(userStore.currentUser?.balance) }}</div>
          </div>
        </v-card>
        <PortalStatusBadge v-if="invoice" :status="invoice.payment_status" size="large" />
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
          <v-card variant="flat" border class="pa-4 mb-2 bg-grey-lighten-5">
            <div class="d-flex align-center mb-4">
              <v-avatar color="primary" rounded="md" size="48" class="me-3">
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
          <v-card variant="flat" border class="pa-4 mb-2">
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
              <span class="text-h5 font-weight-bold text-primary">{{ formatCurrency(invoice.net_amount) }}</span>
            </div>

            <div class="bg-primary-lighten-5 pa-4 text-center">
              <div class="text-caption text-primary-darken-2 font-weight-bold mb-1">المبلغ المتبقي للسداد</div>
              <div class="text-h4 font-weight-bold text-primary-darken-3">
                {{ formatCurrency(invoice.remaining_amount) }}
              </div>
            </div>

            <div v-if="invoice.installment_plan" class="mt-4 pa-3 rounded-md border-primary border-dashed border-sm bg-blue-lighten-5">
              <div class="text-primary font-weight-bold mb-1 d-flex align-center">
                <v-icon icon="ri-calendar-todo-line" size="small" class="me-2" />
                تحت التقسيط
              </div>
              <div class="text-caption text-primary">القسط الشهري: {{ formatCurrency(invoice.installment_plan.installment_amount) }}</div>
            </div>
          </v-card>
          <!-- Items Table -->
          <v-card variant="flat" border class="overflow-hidden mb-2">
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
                        rounded="md"
                        class="me-3 border shadow-sm"
                        type="product"
                      />
                      <v-avatar v-else color="grey-lighten-4" size="48" rounded="md" class="me-3 border">
                        <v-icon icon="ri-image-line" color="grey" />
                      </v-avatar>
                      <div>
                        <div class="font-weight-bold text-body-1">{{ item.name }}</div>
                        <div class="text-caption text-grey">سعر الوحدة: {{ formatCurrency(item.unit_price) }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="text-center">
                    <v-chip size="small" variant="tonal" color="primary" class="font-weight-bold">{{ item.quantity }}</v-chip>
                  </td>
                  <td class="text-left font-weight-bold text-primary text-body-1">{{ formatCurrency(item.total) }}</td>
                </tr>
              </tbody>
            </v-table>

            <!-- Mobile View -->
            <div v-else class="pa-2">
              <v-card v-for="item in invoice.items" :key="'m-' + item.id" border flat class="mb-3 rounded-md overflow-hidden">
                <div class="d-flex pa-3 align-center">
                  <AppAvatar
                    v-if="item.primary_image_url"
                    :img-url="item.primary_image_url"
                    :name="item.name"
                    size="60"
                    rounded="md"
                    class="me-3 border"
                    type="product"
                  />
                  <div class="flex-grow-1">
                    <div class="font-weight-bold text-body-2 mb-1">{{ item.name }}</div>
                    <div class="d-flex justify-space-between align-end">
                      <div class="text-caption text-grey">{{ item.quantity }} × {{ formatCurrency(item.unit_price) }}</div>
                      <div class="text-subtitle-2 font-weight-bold text-primary">{{ formatCurrency(item.total) }}</div>
                    </div>
                  </div>
                </div>
              </v-card>
            </div>
          </v-card>
        </v-col>

        <!-- Sidebar Summary -->
        <v-col cols="12" md="4">
          <!-- Digital Trust Certificate Card -->
          <v-card variant="flat" border class="pa-6 rounded-xl mb-4 bg-primary text-white text-center balance-hero shadow-lg border-0">
            <v-icon icon="ri-verified-badge-fill" size="64" color="white" class="mb-4 opacity-40 shadow-sm" />
            <div class="text-subtitle-1 font-weight-bold mb-1">إجمالي المستحق</div>
            <div class="text-h3 font-weight-black mb-4">{{ formatCurrency(invoice.net_amount) }}</div>
            <v-divider class="border-white opacity-20 mb-4" />
            <div class="d-flex justify-space-between align-center mb-2 px-2">
              <span class="text-caption opacity-80">تم سداد</span>
              <span class="text-subtitle-1 font-weight-black">{{ formatCurrency(invoice.paid_amount) }}</span>
            </div>
            <div class="d-flex justify-space-between align-center px-2">
              <span class="text-caption opacity-80">المتبقي</span>
              <span class="text-subtitle-1 font-weight-black">{{ formatCurrency(invoice.remaining_amount) }}</span>
            </div>
          </v-card>

          <!-- Payment History (Digital Proof) -->
          <v-card v-if="invoice.payments?.length" variant="flat" border class="pa-4 rounded-xl bg-white border-slate-200 shadow-sm">
            <div class="text-subtitle-1 font-weight-black mb-4 d-flex align-center text-slate-900 border-bottom pb-2">
              <v-icon icon="ri-history-line" class="me-2 text-success" />
              سجل السداد الرقمي
            </div>
            <div
              v-for="(payment, index) in invoice.payments"
              :key="payment.id"
              class="d-flex align-center gap-3 py-3"
              :class="{ 'border-bottom': index < invoice.payments.length - 1 }"
            >
              <v-avatar color="success-lighten-5" size="40" rounded="lg">
                <v-icon icon="ri-checkbox-circle-line" color="success" size="20" />
              </v-avatar>
              <div class="flex-grow-1">
                <div class="d-flex justify-space-between align-center">
                  <span class="font-weight-black text-slate-900">{{ formatCurrency(payment.amount) }}</span>
                  <span class="text-xxs text-grey">{{ formatDate(payment.payment_date) }}</span>
                </div>
                <div class="text-caption text-grey">{{ payment.payment_method?.name }}</div>
              </div>
            </div>
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
import PortalStatusBadge from '../../components/PortalStatusBadge.vue';

import { useUserStore } from '@/stores/user';

const userStore = useUserStore();
const router = useRouter();
const route = useRoute();
const { mobile } = useDisplay();
const invoiceApi = useApi('/api/invoices');

const loading = ref(true);
const invoice = ref(null);

const goBack = () => router.push('/app/purchases');

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
.balance-hero {
  background: linear-gradient(135deg, rgb(var(--v-theme-primary)) 0%, #303f9f 100%);
}

.gap-1 {
  gap: 4px;
}
.gap-3 {
  gap: 12px;
}

.border-bottom {
  border-bottom: 1px solid #f1f5f9 !important;
}

.text-xxs {
  font-size: 0.65rem;
}

.text-slate-900 {
  color: #0f172a;
}
.text-slate-600 {
  color: #475569;
}
.border-slate-200 {
  border-color: #e2e8f0 !important;
}

.line-height-1 {
  line-height: 1;
}
</style>
