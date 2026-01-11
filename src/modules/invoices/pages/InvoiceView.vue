<template>
  <v-container fluid>
    <div class="d-flex align-center justify-space-between mb-6">
      <div class="d-flex align-center">
        <AppButton icon="ri-arrow-right-line" variant="text" color="secondary" @click="goBack" class="me-3" />
        <div>
          <h1 class="text-h4 font-weight-bold">الفاتورة #{{ invoice?.invoice_number }}</h1>
          <p class="text-body-1 text-grey" v-if="invoice">{{ formatDate(invoice.invoice_date) }}</p>
        </div>
      </div>
      <div class="d-flex gap-2 no-print">
        <AppButton v-if="can('invoices.update_all')" color="primary" prepend-icon="ri-edit-line" @click="editInvoice"> تعديل </AppButton>
        <AppButton v-if="can('invoices.print')" color="info" prepend-icon="ri-printer-line" @click="printInvoice"> طباعة </AppButton>
        <AppButton v-if="can('invoices.delete_all')" color="error" prepend-icon="ri-delete-bin-line" @click="showDeleteDialog = true">
          حذف
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
          <!-- Customer Info -->
          <AppCard title="معلومات العميل" icon="ri-user-line" class="mb-6">
            <v-row>
              <v-col cols="12" sm="6">
                <div class="text-caption text-grey mb-1">الاسم الكامل</div>
                <div class="font-weight-bold text-h6">{{ invoice.customer?.name }}</div>
              </v-col>
              <v-col cols="12" sm="6">
                <div class="text-caption text-grey mb-1">رقم الهاتف</div>
                <div class="font-weight-bold text-h6">
                  <v-icon icon="ri-phone-line" size="small" class="me-1" />
                  {{ invoice.customer?.phone }}
                </div>
              </v-col>
              <v-col v-if="invoice.customer?.email" cols="12" sm="6">
                <div class="text-caption text-grey mb-1">البريد الإلكتروني</div>
                <div class="font-weight-medium">{{ invoice.customer.email }}</div>
              </v-col>
              <v-col v-if="invoice.customer?.address" cols="12" sm="6">
                <div class="text-caption text-grey mb-1">العنوان</div>
                <div class="font-weight-medium">{{ invoice.customer.address }}</div>
              </v-col>
            </v-row>
          </AppCard>

          <!-- Items -->
          <AppCard title="عناصر الفاتورة" icon="ri-list-check-2" class="mb-6">
            <v-table>
              <thead>
                <tr>
                  <th class="text-right">المنتج</th>
                  <th class="text-center">الكمية</th>
                  <th class="text-left">السعر</th>
                  <th class="text-left">الخصم</th>
                  <th class="text-left font-weight-bold">الإجمالي</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in invoice.items" :key="item.id">
                  <td>
                    <div class="font-weight-bold">{{ item.product_name }}</div>
                    <div v-if="item.variant_name" class="text-caption text-grey">{{ item.variant_name }}</div>
                  </td>
                  <td class="text-center">
                    <v-chip size="small" variant="tonal" color="primary">{{ item.quantity }}</v-chip>
                  </td>
                  <td class="text-left text-body-2">{{ formatCurrency(item.unit_price) }}</td>
                  <td class="text-left text-body-2 text-error">{{ item.discount_percentage }}%</td>
                  <td class="text-left font-weight-bold text-success">{{ formatCurrency(item.total) }}</td>
                </tr>
              </tbody>
            </v-table>
          </AppCard>

          <!-- Payment History -->
          <AppCard title="سجل المدفوعات" icon="ri-history-line">
            <template #actions>
              <AppButton
                v-if="invoice.payment_status !== 'paid'"
                variant="outlined"
                prepend-icon="ri-add-line"
                size="small"
                class="no-print"
                @click="showPaymentDialog = true"
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
        </v-col>

        <!-- Summary -->
        <v-col cols="12" md="4">
          <!-- Status -->
          <AppCard title="الحالة والمتابعة" icon="ri-settings-4-line" class="mb-6">
            <div class="d-flex flex-column gap-4">
              <div>
                <div class="text-caption text-grey mb-1">حالة الفاتورة العامة</div>
                <v-chip :color="getStatusColor(invoice.status)" variant="tonal" class="px-4 font-weight-bold">
                  {{ getStatusLabel(invoice.status) }}
                </v-chip>
              </div>
              <div>
                <div class="text-caption text-grey mb-1">حالة تحصيل المبالغ</div>
                <v-chip :color="getPaymentStatusColor(invoice.payment_status)" variant="tonal" class="px-4 font-weight-bold">
                  {{ getPaymentStatusLabel(invoice.payment_status) }}
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

          <!-- Totals -->
          <AppCard title="الملخص المالي" icon="ri-money-dollar-box-line">
            <div class="d-flex flex-column gap-2 mb-4">
              <div class="d-flex justify-space-between text-body-2">
                <span class="text-grey">المجموع الفرعي:</span>
                <span class="font-weight-medium">{{ formatCurrency(invoice.subtotal) }}</span>
              </div>
              <div v-if="invoice.discount_amount > 0" class="d-flex justify-space-between text-body-2 text-error">
                <span>إجمالي الخصم:</span>
                <span>-{{ formatCurrency(invoice.discount_amount) }}</span>
              </div>
              <div v-if="invoice.tax_amount > 0" class="d-flex justify-space-between text-body-2">
                <span class="text-grey">إجمالي الضريبة:</span>
                <span>{{ formatCurrency(invoice.tax_amount) }}</span>
              </div>
              <div v-if="invoice.shipping_cost > 0" class="d-flex justify-space-between text-body-2">
                <span class="text-grey">تكلفة الشحن:</span>
                <span>{{ formatCurrency(invoice.shipping_cost) }}</span>
              </div>
            </div>

            <v-divider class="my-4" />

            <div class="d-flex justify-space-between align-center mb-4">
              <span class="text-h6 font-weight-bold">إجمالي الفاتورة:</span>
              <span class="text-h5 font-weight-black text-success">{{ formatCurrency(invoice.total) }}</span>
            </div>

            <v-divider class="mb-4" />

            <div class="d-flex flex-column gap-2 p-2 rounded-lg bg-grey-lighten-4">
              <div class="d-flex justify-space-between text-body-2">
                <span class="text-grey">إجمالي المدفوع:</span>
                <span class="font-weight-bold text-info">{{ formatCurrency(invoice.paid_amount) }}</span>
              </div>
              <div v-if="invoice.remaining > 0" class="d-flex justify-space-between text-body-2">
                <span class="text-grey">المبلغ المتبقي:</span>
                <span class="font-weight-bold text-error">{{ formatCurrency(invoice.remaining) }}</span>
              </div>
              <div v-else class="text-center text-success font-weight-bold py-1">مدفوعة بالكامل</div>
            </div>
          </AppCard>
        </v-col>
      </v-row>
    </div>

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
import { useApi } from '@/composables/useApi';
import { usePermissions } from '@/composables/usePermissions';
import { usePrintExport } from '@/composables/usePrintExport';
import AppButton from '@/components/common/AppButton.vue';
import AppCard from '@/components/common/AppCard.vue';
import AppDialog from '@/components/common/AppDialog.vue';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import { toast } from 'vue3-toastify';

const router = useRouter();
const route = useRoute();
const { can } = usePermissions();
const { printElement } = usePrintExport();

const invoiceApi = useApi('/api/invoices');

const loading = ref(true);
const invoice = ref(null);
const showDeleteDialog = ref(false);
const showPaymentDialog = ref(false);
const selectedStatus = ref(null);

const statusOptions = [
  { title: 'مسودة', value: 'draft' },
  { title: 'قيد الانتظار', value: 'pending' },
  { title: 'معتمدة', value: 'approved' },
  { title: 'ملغاة', value: 'cancelled' },
];

const goBack = () => router.push('/invoices');
const editInvoice = () => router.push(`/invoices/${route.params.id}/edit`);

const printInvoice = () => {
  printElement('invoice-content', `فاتورة #${invoice.value?.invoice_number}`);
};

const deleteInvoice = async () => {
  try {
    await invoiceApi.remove(route.params.id, { successMessage: 'تم حذف الفاتورة' });
    router.push('/invoices');
  } finally {
    showDeleteDialog.value = false;
  }
};

const updateStatus = async newStatus => {
  try {
    await invoiceApi.update(route.params.id, { status: newStatus });
    invoice.value.status = newStatus;
  } catch (error) {
    selectedStatus.value = invoice.value.status;
  }
};

const formatDate = date => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('ar-EG');
};

const formatCurrency = amount => {
  if (!amount) return '0.00 ج.م';
  return new Intl.NumberFormat('ar-EG', {
    style: 'currency',
    currency: 'EGP',
  }).format(amount);
};

const getStatusColor = status => {
  const colors = { draft: 'grey', pending: 'warning', approved: 'success', cancelled: 'error' };
  return colors[status] || 'grey';
};

const getStatusLabel = status => {
  const labels = { draft: 'مسودة', pending: 'قيد الانتظار', approved: 'معتمدة', cancelled: 'ملغاة' };
  return labels[status] || status;
};

const getPaymentStatusColor = status => {
  const colors = { unpaid: 'error', partial: 'warning', paid: 'success' };
  return colors[status] || 'grey';
};

const getPaymentStatusLabel = status => {
  const labels = { unpaid: 'غير مدفوعة', partial: 'مدفوعة جزئياً', paid: 'مدفوعة بالكامل' };
  return labels[status] || status;
};

onMounted(async () => {
  try {
    const response = await invoiceApi.getById(route.params.id);
    invoice.value = response.data;
    selectedStatus.value = invoice.value.status;
  } finally {
    loading.value = false;
  }
});
</script>
