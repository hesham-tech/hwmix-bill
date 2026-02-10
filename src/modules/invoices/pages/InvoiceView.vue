<template>
  <v-container fluid :class="mobile ? 'pa-2' : 'pa-4'">
    <div class="d-flex align-center justify-space-between mb-4 mb-sm-6 flex-wrap gap-3">
      <div class="d-flex align-center">
        <AppButton
          icon="ri-arrow-right-line"
          variant="text"
          color="secondary"
          @click="goBack"
          class="me-2 me-sm-3"
          :size="mobile ? 'small' : 'default'"
        />
        <div>
          <h1 :class="[mobile ? 'text-h6' : 'text-h4', 'font-weight-bold']">الفاتورة #{{ invoice?.invoice_number }}</h1>
          <p :class="[mobile ? 'text-caption' : 'text-body-1', 'text-grey mb-0']" v-if="invoice">
            <v-icon icon="ri-calendar-line" size="small" class="me-1" />
            {{ formatDate(invoice.issue_date) }}
          </p>
        </div>
      </div>
      <div class="d-flex gap-2 no-print flex-grow-1 flex-sm-grow-0 justify-end">
        <AppButton
          v-if="can('invoices.update_all')"
          color="primary"
          :prepend-icon="!mobile ? 'ri-edit-line' : ''"
          :icon="mobile ? 'ri-edit-line' : false"
          :size="mobile ? 'small' : 'default'"
          @click="editInvoice"
        >
          {{ mobile ? '' : 'تعديل' }}
        </AppButton>
        <AppButton
          v-if="invoice?.invoice_type?.code === 'purchase'"
          color="warning"
          :prepend-icon="!mobile ? 'ri-ticket-line' : ''"
          :icon="mobile ? 'ri-ticket-line' : false"
          :size="mobile ? 'small' : 'default'"
          @click="stickersDialog?.open(invoice)"
        >
          {{ mobile ? '' : 'الملصقات' }}
        </AppButton>
        <AppPrintShare v-if="invoice" type="invoice" :data="{ invoice }" label="طباعة الفاتورة" color="info" :size="mobile ? 'small' : 'default'" />
        <AppButton
          v-if="can('invoices.delete_all')"
          color="error"
          :prepend-icon="!mobile ? 'ri-delete-bin-line' : ''"
          :icon="mobile ? 'ri-delete-bin-line' : false"
          :size="mobile ? 'small' : 'default'"
          @click="showDeleteDialog = true"
        >
          {{ mobile ? '' : 'حذف' }}
        </AppButton>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="d-flex justify-center align-center py-12">
      <LoadingSpinner />
    </div>

    <div id="invoice-content">
      <v-row v-if="invoice">
        <!-- Invoice Details -->
        <v-col cols="12" md="8">
          <!-- Unified Customer Card -->
          <FinancialCustomerCard v-if="invoice.customer" :customer="invoice.customer" :balance="invoice.customer.balance" class="mb-4 mb-sm-6" />

          <!-- Items -->
          <AppCard title="عناصر الفاتورة" icon="ri-list-check-2" class="mb-4 mb-sm-6" padding="0" rounded="md">
            <!-- Desktop Table -->
            <v-table v-if="!mobile" class="invoice-items-table">
              <thead>
                <tr>
                  <th class="text-right">المنتج</th>
                  <th class="text-center">الكمية</th>
                  <th class="text-left">سعر الوحدة</th>
                  <th class="text-left">الخصم</th>
                  <th class="text-left font-weight-bold">الإجمالي</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in invoice.items" :key="item.id">
                  <td>
                    <div class="d-flex align-center py-2">
                      <AppAvatar
                        v-if="item.primary_image_url"
                        :img-url="item.primary_image_url"
                        :name="item.name"
                        size="40"
                        rounded="circle"
                        class="me-3 border"
                        type="product"
                      />
                      <div>
                        <div class="font-weight-bold">{{ item.name }}</div>
                        <div v-if="item.product?.code" class="text-caption text-grey">كود: {{ item.product.code }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="text-center">
                    <v-chip size="small" variant="tonal" color="primary" class="font-weight-bold">{{ item.quantity }}</v-chip>
                  </td>
                  <td class="text-left text-body-2">{{ formatCurrency(item.unit_price) }}</td>
                  <td class="text-left text-body-2 text-error" v-if="item.discount > 0">
                    {{ formatCurrency(item.discount) }}
                  </td>
                  <td class="text-left text-body-2 text-grey" v-else>-</td>
                  <td class="text-left font-weight-bold text-success">
                    {{ formatCurrency(item.total) }}

                    <!-- Digital Delivery Info (Desktop) -->
                    <div v-if="item.digital_deliveries && item.digital_deliveries.length > 0" class="mt-3 no-print">
                      <div
                        v-for="delivery in item.digital_deliveries"
                        :key="delivery.id"
                        class="digital-delivery-box pa-2 rounded bg-info-lighten-5 border-info border-sm"
                      >
                        <div class="d-flex align-center gap-2 mb-1">
                          <v-icon icon="ri-key-2-line" size="small" color="info" />
                          <span class="text-caption font-weight-bold text-info">بيانات التفعيل:</span>
                        </div>
                        <div class="text-body-2 font-weight-bold code-font">{{ delivery.delivery_data?.license_key || '---' }}</div>
                        <div v-if="delivery.delivery_data?.instructions" class="text-caption text-grey mt-1">
                          {{ delivery.delivery_data.instructions }}
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </v-table>

            <!-- Mobile Cards -->
            <div v-else class="pa-2">
              <v-card v-for="item in invoice.items" :key="'m-' + item.id" border flat class="mb-2 rounded-md bg-grey-lighten-5">
                <div class="pa-3">
                  <div class="d-flex align-center gap-2 mb-3">
                    <AppAvatar
                      v-if="item.primary_image_url"
                      :img-url="item.primary_image_url"
                      :name="item.name"
                      size="44"
                      rounded="md"
                      class="border"
                      type="product"
                    />
                    <div class="flex-grow-1">
                      <div class="font-weight-bold text-body-2 line-clamp-1">{{ item.name }}</div>
                      <div class="text-caption text-grey">كود: {{ item.product?.code || '---' }}</div>
                    </div>
                    <v-chip size="x-small" color="primary" variant="flat" class="font-weight-bold"> {{ item.quantity }} قطعة </v-chip>
                  </div>

                  <v-divider class="mb-3 border-dashed" />

                  <div class="d-flex flex-column gap-2">
                    <div class="d-flex justify-space-between text-caption">
                      <span class="text-grey">سعر الوحدة:</span>
                      <span class="font-weight-medium">{{ formatCurrency(item.unit_price) }}</span>
                    </div>
                    <div v-if="item.discount > 0" class="d-flex justify-space-between text-caption text-error">
                      <span>الخصم:</span>
                      <span>-{{ formatCurrency(item.discount) }}</span>
                    </div>
                    <!-- Digital Delivery Info (Mobile) -->
                    <div v-if="item.digital_deliveries && item.digital_deliveries.length > 0" class="mt-2 no-print">
                      <div
                        v-for="delivery in item.digital_deliveries"
                        :key="delivery.id"
                        class="digital-delivery-box pa-2 rounded bg-info-lighten-5 border-info border-sm"
                      >
                        <div class="d-flex align-center gap-2 mb-1">
                          <v-icon icon="ri-key-2-line" size="small" color="info" />
                          <span class="text-caption font-weight-bold text-info">بيانات التفعيل:</span>
                        </div>
                        <div class="text-body-2 font-weight-bold code-font">{{ delivery.delivery_data?.license_key || '---' }}</div>
                      </div>
                    </div>
                    <div class="d-flex justify-space-between align-center border-top-dotted pt-2 mt-1">
                      <span class="text-subtitle-2 font-weight-bold">الإجمالي:</span>
                      <span class="text-subtitle-1 font-weight-bold text-success">{{ formatCurrency(item.total) }}</span>
                    </div>
                  </div>
                </div>
              </v-card>
            </div>
          </AppCard>

          <!-- Payment History -->
          <AppCard title="سجل المدفوعات" icon="ri-history-line" class="mb-4 mb-sm-6" rounded="md">
            <template #actions>
              <AppButton
                v-if="invoice.payment_status !== 'paid' && can(PERMISSIONS.PAYMENTS_CREATE)"
                variant="outlined"
                prepend-icon="ri-add-line"
                size="small"
                class="no-print"
                @click="router.push({ path: '/app/payments/create', query: { invoice_id: invoice.id } })"
              >
                إضافة دفعة
              </AppButton>
            </template>

            <v-list v-if="invoice.payments?.length" class="pa-0">
              <v-list-item
                v-for="(payment, index) in invoice.payments"
                :key="payment.id"
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
            <div v-else class="text-center py-6 text-grey">لا توجد مدفوعات مسجلة لهذه الفاتورة.</div>
          </AppCard>

          <!-- Installment Schedule Table (If Installment Type) -->
          <AppCard
            v-if="invoice.installment_plan && invoice.installment_plan.installments?.length"
            title="جدول الأقساط"
            icon="ri-calendar-schedule-line"
            class="mb-4 mb-sm-6"
            padding="0"
            rounded="md"
          >
            <InstallmentsTable
              :items="invoice.installment_plan.installments"
              :show-customer="false"
              :show-plan="false"
              :show-actions="false"
              hide-pagination
              class="border-0"
            />
            <v-divider />
            <div class="pa-4 d-flex justify-end">
              <AppButton
                color="primary"
                variant="tonal"
                size="small"
                prepend-icon="ri-external-link-line"
                @click="router.push(`/app/installment-plans/${invoice.installment_plan.id}`)"
              >
                إدارة الخطة بالكامل
              </AppButton>
            </div>
          </AppCard>
        </v-col>

        <!-- Summary -->
        <v-col cols="12" md="4">
          <!-- Status -->
          <AppCard title="الحالة والمتابعة" icon="ri-settings-4-line" class="mb-4" rounded="md">
            <div class="d-flex flex-column gap-4">
              <div>
                <div class="text-caption text-grey mb-1">حالة الفاتورة العامة</div>
                <v-chip :color="getStatusColor(invoice.status)" variant="tonal" class="px-4 font-weight-bold">
                  {{ invoice.status_label || getStatusLabel(invoice.status) }}
                </v-chip>
              </div>
              <div>
                <div class="text-caption text-grey mb-1">حالة تحصيل المبالغ</div>
                <v-chip :color="getPaymentStatusColor(invoice.payment_status)" variant="tonal" class="px-4 font-weight-bold">
                  {{ invoice.payment_status_label || getPaymentStatusLabel(invoice.payment_status) }}
                </v-chip>
              </div>

              <v-divider v-if="can('invoices.update_all')" class="no-print" />

              <v-select
                v-if="can('invoices.update_all')"
                v-model="selectedStatus"
                :items="statusOptions"
                label="تغيير الحالة"
                variant="outlined"
                density="comfortable"
                class="no-print mt-2"
                hide-details
                @update:model-value="updateStatus"
              />
            </div>
          </AppCard>

          <!-- Totals & Balance Flow -->
          <AppCard title="الملخص المالي والتدقق" icon="ri-money-dollar-box-line" rounded="md" class="mb-4">
            <div class="d-flex flex-column gap-2 mb-4">
              <div class="d-flex justify-space-between text-body-2">
                <span class="text-grey">إجمالي العناصر:</span>
                <span class="font-weight-medium text-body-1">{{ formatCurrency(invoice.gross_amount) }}</span>
              </div>
              <div v-if="invoice.total_discount > 0" class="d-flex justify-space-between text-body-2 text-error italic">
                <span>الخصومات والتعويضات:</span>
                <span>-{{ formatCurrency(invoice.total_discount) }}</span>
              </div>
              <div v-if="invoice.total_tax > 0" class="d-flex justify-space-between text-body-2">
                <span class="text-grey">الضرائب (VAT):</span>
                <span>{{ formatCurrency(invoice.total_tax) }}</span>
              </div>

              <v-divider class="my-2" />

              <div class="d-flex justify-space-between align-center">
                <span class="text-h6 font-weight-bold">صافي المديونية:</span>
                <span class="text-h5 font-weight-bold text-primary">{{ formatCurrency(invoice.net_amount) }}</span>
              </div>
            </div>

            <div class="pa-4 rounded-lg bg-grey-lighten-4 border-s-4 border-s-primary mb-4">
              <div class="d-flex justify-space-between text-caption mb-1">
                <span class="text-grey">رصيد العميل قبل هذه الفاتورة:</span>
                <span class="font-weight-bold" :class="parseFloat(invoice.previous_balance) < 0 ? 'text-error' : 'text-success'">
                  {{ formatCurrency(invoice.previous_balance) }}
                </span>
              </div>
              <div class="d-flex justify-space-between text-body-1 font-weight-black border-t pt-2 mt-1">
                <span>صافي المطلوب تحصيله:</span>
                <span>{{ formatCurrency(invoice.total_required) }}</span>
              </div>
            </div>

            <div class="pa-4 rounded-lg bg-primary-lighten-5 border mb-4">
              <div class="d-flex justify-space-between text-body-2 mb-2">
                <span class="text-primary-darken-2">إجمالي المسدد:</span>
                <span class="font-weight-black text-success text-body-1">{{ formatCurrency(invoice.paid_amount) }}</span>
              </div>
              <div class="d-flex justify-space-between text-body-2">
                <span class="text-grey">المتبقي المطلوب:</span>
                <span class="font-weight-black text-error">{{ formatCurrency(invoice.remaining_amount) }}</span>
              </div>

              <v-divider class="my-3 opacity-25" />

              <div class="d-flex justify-space-between text-body-1 font-weight-black">
                <span class="text-primary-darken-4">رصيد العميل النهائي:</span>
                <span class="text-primary-darken-4">{{ formatCurrency(invoice.user_balance_after || 0) }}</span>
              </div>
            </div>

            <!-- Initial Snapshot -->
            <v-expansion-panels flat variant="accordion">
              <v-expansion-panel bg-color="blue-grey-lighten-5">
                <v-expansion-panel-title class="text-caption font-weight-bold py-1"> حالة الفاتورة عند الإنشاء (Snapshot) </v-expansion-panel-title>
                <v-expansion-panel-text class="text-caption pb-2">
                  <div class="d-flex justify-space-between mb-1">
                    <span>المدفوع الابتدائي:</span>
                    <span>{{ formatCurrency(invoice.initial_paid_amount) }}</span>
                  </div>
                  <div class="d-flex justify-space-between">
                    <span>المتبقي الابتدائي:</span>
                    <span>{{ formatCurrency(invoice.initial_remaining_amount) }}</span>
                  </div>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
          </AppCard>

          <!-- Installment Plan Summary (Conditional) -->
          <InstallmentPlanSummaryCard
            v-if="invoice.installment_plan"
            :plan="invoice.installment_plan"
            @view-plan="id => router.push(`/app/installment-plans/${id}`)"
          />
        </v-col>
      </v-row>
    </div>

    <PrintInvoiceItemsStickersDialog ref="stickersDialog" />
    <!-- Delete Confirmation Dialog -->
    <AppDialog
      v-model="showDeleteDialog"
      title="تأكيد حذف الفاتورة"
      icon="ri-delete-bin-line"
      confirm-color="error"
      confirm-text="حذف"
      @confirm="deleteInvoice"
    >
      هل أنت متأكد من حذف هذه الفاتورة؟ لا يمكن التراجع عن هذا الإجراء وسيتم حذف الفاتورة وجميع المدفوعات المرتبطة بها نهائياً.
    </AppDialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useDisplay } from 'vuetify';
import { useApi } from '@/composables/useApi';
import { usePermissions } from '@/composables/usePermissions';
import { useUserStore } from '@/stores/user';
import AppAvatar from '@/components/common/AppAvatar.vue';
import FinancialCustomerCard from '@/components/common/FinancialCustomerCard.vue';
import InstallmentPlanSummaryCard from '@/modules/installments/components/InstallmentPlanSummaryCard.vue';
import InstallmentsTable from '@/modules/installments/components/InstallmentsTable.vue';
import PrintInvoiceItemsStickersDialog from '../components/PrintInvoiceItemsStickersDialog.vue';
import { toast } from 'vue3-toastify';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { PERMISSIONS } from '@/config/permissions';
import { AppPrintShare } from '@/components';

const router = useRouter();
const route = useRoute();
const { can, canAny } = usePermissions();
const { mobile } = useDisplay();
const userStore = useUserStore();

const invoiceApi = useApi('/api/invoices');

const loading = ref(true);
const invoice = ref(null);
const showDeleteDialog = ref(false);
const showPaymentDialog = ref(false);
const stickersDialog = ref(null);
const selectedStatus = ref(null);

const statusOptions = [
  { title: 'مسودة', value: 'draft' },
  { title: 'مؤكدة', value: 'confirmed' },
  { title: 'مدفوعة', value: 'paid' },
  { title: 'ملغاة', value: 'canceled' },
];

const goBack = () => router.push('/app/invoices');
const editInvoice = () => router.push(`/app/invoices/${route.params.id}/edit`);

const deleteInvoice = async () => {
  try {
    await invoiceApi.remove(route.params.id, { successMessage: 'تم حذف الفاتورة' });
    userStore.fetchUser();
    router.push('/app/invoices');
  } finally {
    showDeleteDialog.value = false;
  }
};

const updateStatus = async newStatus => {
  try {
    await invoiceApi.update(route.params.id, { status: newStatus });
    invoice.value.status = newStatus;
    // Reload data after status change to get updated labels
    const response = await invoiceApi.getById(route.params.id);
    invoice.value = response.data;
    userStore.fetchUser();
  } catch (error) {
    selectedStatus.value = invoice.value.status;
  }
};

const getStatusColor = status => {
  const colors = {
    draft: 'grey',
    confirmed: 'primary',
    paid: 'success',
    partially_paid: 'info',
    canceled: 'error',
    canceled: 'error',
  };
  return colors[status] || 'grey';
};

const getStatusLabel = status => {
  const labels = {
    draft: 'مسودة',
    confirmed: 'مؤكدة',
    paid: 'مدفوعة',
    partially_paid: 'مدفوعة جزئياً',
    canceled: 'ملغاة',
  };
  return labels[status] || status;
};

const getPaymentStatusColor = status => {
  const colors = { unpaid: 'error', partial: 'warning', partially_paid: 'warning', paid: 'success', overpaid: 'indigo' };
  return colors[status] || 'grey';
};

const getPaymentStatusLabel = status => {
  const labels = {
    unpaid: 'غير مدفوعة',
    partial: 'مدفوعة جزئياً',
    partially_paid: 'مدفوعة جزئياً',
    paid: 'مدفوعة بالكامل',
    overpaid: 'مدفوعة بزيادة',
  };
  return labels[status] || status;
};

const getDueDateClass = (dueDate, status) => {
  if (status === 'paid') return 'text-success';
  if (status === 'canceled') return 'text-grey';
  const today = new Date();
  const due = new Date(dueDate);
  if (due < today) return 'text-error font-weight-bold';
  return 'text-grey-darken-1';
};

onMounted(async () => {
  try {
    const response = await invoiceApi.getById(route.params.id);
    invoice.value = response.data;

    // Load full plan if it exists to get installments
    if (invoice.value.installment_plan?.id) {
      const planApi = useApi('/api/installment-plans');
      const planResponse = await planApi.getById(invoice.value.installment_plan.id);
      invoice.value.installment_plan = planResponse.data;
    }

    selectedStatus.value = invoice.value.status;
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.gap-2 {
  gap: 8px;
}
.gap-3 {
  gap: 12px;
}
.gap-4 {
  gap: 16px;
}
.italic {
  font-style: italic;
}
.border-dashed {
  border-style: dashed !important;
}
.border-sm {
  border-width: 1px !important;
}

.rotating {
  animation: rotate 1.5s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
