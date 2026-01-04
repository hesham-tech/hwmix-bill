<template>
  <v-container fluid>
    <!-- Header -->
    <div class="d-flex align-center mb-4">
      <v-btn icon="ri-arrow-right-line" variant="text" @click="goBack" />
      <div class="ms-3">
        <h1 class="text-h4 font-weight-bold">الفاتورة #{{ invoice?.invoice_number }}</h1>
        <p class="text-medium-emphasis">{{ formatDate(invoice?.invoice_date) }}</p>
      </div>
      <v-spacer />

      <!-- Actions -->
      <div class="d-flex gap-2">
        <v-btn v-if="can('invoices.update_all')" color="primary" prepend-icon="ri-edit-line" @click="editInvoice"> تعديل </v-btn>
        <v-btn v-if="can('invoices.print')" color="info" prepend-icon="ri-printer-line" @click="printInvoice"> طباعة </v-btn>
        <v-btn v-if="can('invoices.delete_all')" color="error" prepend-icon="ri-delete-bin-line" @click="showDeleteDialog = true"> حذف </v-btn>
      </div>
    </div>

    <!-- Loading -->
    <v-progress-linear v-if="loading" indeterminate />

    <v-row v-else-if="invoice">
      <!-- Invoice Details -->
      <v-col cols="12" md="8">
        <!-- Customer Info -->
        <v-card class="mb-4">
          <v-card-title>معلومات العميل</v-card-title>
          <v-divider />
          <v-card-text>
            <v-row>
              <v-col cols="6">
                <div class="text-caption text-medium-emphasis">الاسم</div>
                <div class="font-weight-medium">{{ invoice.customer?.name }}</div>
              </v-col>
              <v-col cols="6">
                <div class="text-caption text-medium-emphasis">الهاتف</div>
                <div class="font-weight-medium">{{ invoice.customer?.phone }}</div>
              </v-col>
              <v-col v-if="invoice.customer?.email" cols="6">
                <div class="text-caption text-medium-emphasis">البريد</div>
                <div class="font-weight-medium">{{ invoice.customer.email }}</div>
              </v-col>
              <v-col v-if="invoice.customer?.address" cols="6">
                <div class="text-caption text-medium-emphasis">العنوان</div>
                <div class="font-weight-medium">{{ invoice.customer.address }}</div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- Items -->
        <v-card class="mb-4">
          <v-card-title>العناصر</v-card-title>
          <v-divider />
          <v-table>
            <thead>
              <tr>
                <th>المنتج</th>
                <th class="text-center">الكمية</th>
                <th class="text-end">السعر</th>
                <th class="text-end">الخصم</th>
                <th class="text-end">الإجمالي</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in invoice.items" :key="item.id">
                <td>
                  {{ item.product_name }}
                  <span v-if="item.variant_name" class="text-caption"> ({{ item.variant_name }}) </span>
                </td>
                <td class="text-center">{{ item.quantity }}</td>
                <td class="text-end">{{ formatCurrency(item.unit_price) }}</td>
                <td class="text-end">{{ item.discount_percentage }}%</td>
                <td class="text-end font-weight-bold">{{ formatCurrency(item.total) }}</td>
              </tr>
            </tbody>
          </v-table>
        </v-card>

        <!-- Payment History -->
        <v-card>
          <v-card-title class="d-flex align-center">
            سجل المدفوعات
            <v-spacer />
            <v-btn
              v-if="invoice.payment_status !== 'paid'"
              variant="outlined"
              prepend-icon="ri-add-line"
              size="small"
              @click="showPaymentDialog = true"
            >
              إضافة دفعة
            </v-btn>
          </v-card-title>
          <v-divider />
          <v-list v-if="invoice.payments?.length">
            <v-list-item v-for="payment in invoice.payments" :key="payment.id">
              <template #prepend>
                <v-icon icon="ri-money-dollar-circle-line" color="success" />
              </template>
              <v-list-item-title>
                {{ formatCurrency(payment.amount) }}
              </v-list-item-title>
              <v-list-item-subtitle> {{ formatDate(payment.payment_date) }} - {{ payment.payment_method?.name }} </v-list-item-subtitle>
            </v-list-item>
          </v-list>
          <v-card-text v-else class="text-center text-medium-emphasis"> لا توجد مدفوعات </v-card-text>
        </v-card>
      </v-col>

      <!-- Summary -->
      <v-col cols="12" md="4">
        <!-- Status -->
        <v-card class="mb-4">
          <v-card-title>الحالة</v-card-title>
          <v-divider />
          <v-card-text>
            <div class="mb-3">
              <div class="text-caption text-medium-emphasis mb-1">حالة الفاتورة</div>
              <v-chip :color="getStatusColor(invoice.status)" variant="tonal">
                {{ getStatusLabel(invoice.status) }}
              </v-chip>
            </div>
            <div>
              <div class="text-caption text-medium-emphasis mb-1">حالة الدفع</div>
              <v-chip :color="getPaymentStatusColor(invoice.payment_status)" variant="tonal">
                {{ getPaymentStatusLabel(invoice.payment_status) }}
              </v-chip>
            </div>

            <v-select
              v-if="can('invoices.update_all')"
              v-model="selectedStatus"
              :items="statusOptions"
              label="تحديث الحالة"
              class="mt-4"
              @update:model-value="updateStatus"
            />
          </v-card-text>
        </v-card>

        <!-- Totals -->
        <v-card>
          <v-card-title>الإجمالي</v-card-title>
          <v-divider />
          <v-card-text>
            <div class="d-flex justify-space-between mb-2">
              <span>المجموع الفرعي:</span>
              <span class="font-weight-medium">{{ formatCurrency(invoice.subtotal) }}</span>
            </div>
            <div v-if="invoice.discount_amount > 0" class="d-flex justify-space-between mb-2 text-error">
              <span>الخصم:</span>
              <span>-{{ formatCurrency(invoice.discount_amount) }}</span>
            </div>
            <div v-if="invoice.tax_amount > 0" class="d-flex justify-space-between mb-2">
              <span>الضريبة:</span>
              <span>{{ formatCurrency(invoice.tax_amount) }}</span>
            </div>
            <div v-if="invoice.shipping_cost > 0" class="d-flex justify-space-between mb-2">
              <span>الشحن:</span>
              <span>{{ formatCurrency(invoice.shipping_cost) }}</span>
            </div>

            <v-divider class="my-3" />

            <div class="d-flex justify-space-between text-h5 font-weight-bold mb-2">
              <span>الإجمالي:</span>
              <span class="text-success">{{ formatCurrency(invoice.total) }}</span>
            </div>
            <div class="d-flex justify-space-between">
              <span>المدفوع:</span>
              <span class="font-weight-medium text-info">{{ formatCurrency(invoice.paid_amount) }}</span>
            </div>
            <div v-if="invoice.remaining > 0" class="d-flex justify-space-between text-warning">
              <span>المتبقي:</span>
              <span class="font-weight-bold">{{ formatCurrency(invoice.remaining) }}</span>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Delete Dialog -->
    <v-dialog v-model="showDeleteDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h5">
          <v-icon icon="ri-error-warning-line" color="error" class="me-2" />
          تأكيد الحذف
        </v-card-title>
        <v-card-text> هل أنت متأكد من حذف هذه الفاتورة؟ </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showDeleteDialog = false">إلغاء</v-btn>
          <v-btn color="error" @click="deleteInvoice">حذف</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useApi } from '@/composables/useApi';
import { usePermissions } from '@/composables/usePermissions';
import { toast } from 'vue3-toastify';

const router = useRouter();
const route = useRoute();
const { can } = usePermissions();

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
  window.open(`/api/invoice/${route.params.id}/pdf`, '_blank');
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
