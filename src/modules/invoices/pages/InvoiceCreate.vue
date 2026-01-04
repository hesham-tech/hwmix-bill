<template>
  <v-container fluid>
    <!-- Header -->
    <div class="d-flex align-center mb-4">
      <v-btn icon="ri-arrow-right-line" variant="text" @click="goBack" />
      <div class="ms-3">
        <h1 class="text-h4 font-weight-bold">فاتورة جديدة</h1>
        <p class="text-medium-emphasis">إنشاء فاتورة جديدة</p>
      </div>
    </div>

    <!-- Stepper -->
    <v-card>
      <v-stepper v-model="currentStep" :items="steps" alt-labels>
        <!-- Step 1: Customer Info -->
        <template #item.1>
          <v-card-text>
            <v-row>
              <v-col cols="12">
                <h3 class="text-h6 mb-4">معلومات العميل والفاتورة</h3>
              </v-col>

              <v-col cols="12" md="6">
                <CustomerSelector v-model="formData.customer" @update:model-value="handleCustomerChange" />
              </v-col>

              <v-col cols="12" md="6">
                <v-select
                  v-model="formData.invoice_type_id"
                  :items="invoiceTypes"
                  item-title="name"
                  item-value="id"
                  label="نوع الفاتورة *"
                  prepend-inner-icon="ri-file-copy-line"
                />
              </v-col>

              <v-col cols="12" md="4">
                <v-text-field v-model="formData.invoice_date" type="date" label="تاريخ الفاتورة *" prepend-inner-icon="ri-calendar-line" />
              </v-col>

              <v-col cols="12" md="4">
                <v-text-field v-model="formData.due_date" type="date" label="تاريخ الاستحقاق" prepend-inner-icon="ri-calendar-check-line" />
              </v-col>

              <v-col cols="12" md="4">
                <v-select
                  v-model="formData.warehouse_id"
                  :items="warehouses"
                  item-title="name"
                  item-value="id"
                  label="المخزن"
                  prepend-inner-icon="ri-building-line"
                />
              </v-col>
            </v-row>
          </v-card-text>
        </template>

        <!-- Step 2: Products -->
        <template #item.2>
          <v-card-text>
            <v-row>
              <v-col cols="12">
                <h3 class="text-h6 mb-4">المنتجات</h3>
              </v-col>

              <v-col cols="12">
                <ProductSelector @add="addProduct" />
              </v-col>

              <!-- Selected Products Table -->
              <v-col v-if="formData.items.length > 0" cols="12">
                <v-card variant="outlined" class="mt-4">
                  <v-card-title class="text-subtitle-1"> المنتجات المحددة ({{ formData.items.length }}) </v-card-title>
                  <v-divider />
                  <v-table>
                    <thead>
                      <tr>
                        <th>المنتج</th>
                        <th class="text-center">الكمية</th>
                        <th class="text-end">السعر</th>
                        <th class="text-end">الخصم</th>
                        <th class="text-end">الإجمالي</th>
                        <th class="text-center">إجراءات</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(item, index) in formData.items" :key="index">
                        <td>
                          {{ item.product_name }}
                          <span v-if="item.variant_name" class="text-caption text-medium-emphasis"> ({{ item.variant_name }}) </span>
                        </td>
                        <td class="text-center">{{ item.quantity }}</td>
                        <td class="text-end">{{ formatCurrency(item.unit_price) }}</td>
                        <td class="text-end">{{ item.discount_percentage }}%</td>
                        <td class="text-end font-weight-bold">{{ formatCurrency(item.total) }}</td>
                        <td class="text-center">
                          <v-btn icon="ri-delete-bin-line" size="small" variant="text" color="error" @click="removeProduct(index)" />
                        </td>
                      </tr>
                    </tbody>
                  </v-table>
                </v-card>
              </v-col>

              <v-col v-else cols="12">
                <v-alert type="info" variant="tonal"> لم يتم إضافة منتجات بعد </v-alert>
              </v-col>
            </v-row>
          </v-card-text>
        </template>

        <!-- Step 3: Review & Payment -->
        <template #item.3>
          <v-card-text>
            <v-row>
              <v-col cols="12" md="7">
                <h3 class="text-h6 mb-4">ملخص الفاتورة</h3>

                <!-- Customer Info -->
                <v-card variant="outlined" class="mb-4">
                  <v-card-title class="text-subtitle-1">معلومات العميل</v-card-title>
                  <v-divider />
                  <v-card-text>
                    <div><strong>الاسم:</strong> {{ formData.customer?.name }}</div>
                    <div><strong>الهاتف:</strong> {{ formData.customer?.phone }}</div>
                    <div v-if="formData.customer?.email"><strong>البريد:</strong> {{ formData.customer.email }}</div>
                  </v-card-text>
                </v-card>

                <!-- Products Summary -->
                <v-card variant="outlined">
                  <v-card-title class="text-subtitle-1">المنتجات</v-card-title>
                  <v-divider />
                  <v-list>
                    <v-list-item
                      v-for="(item, index) in formData.items"
                      :key="index"
                      :title="item.product_name"
                      :subtitle="`${item.quantity} × ${formatCurrency(item.unit_price)}`"
                    >
                      <template #append>
                        <span class="font-weight-bold">{{ formatCurrency(item.total) }}</span>
                      </template>
                    </v-list-item>
                  </v-list>
                </v-card>
              </v-col>

              <v-col cols="12" md="5">
                <h3 class="text-h6 mb-4">الدفع والإجمالي</h3>

                <v-card variant="outlined">
                  <v-card-text>
                    <!-- Discount -->
                    <v-text-field
                      v-model.number="formData.discount_percentage"
                      label="خصم إضافي %"
                      type="number"
                      min="0"
                      max="100"
                      prepend-inner-icon="ri-percent-line"
                    />

                    <!-- Tax -->
                    <v-text-field
                      v-model.number="formData.tax_percentage"
                      label="الضريبة %"
                      type="number"
                      min="0"
                      max="100"
                      prepend-inner-icon="ri-percent-line"
                    />

                    <!-- Shipping -->
                    <v-text-field v-model.number="formData.shipping_cost" label="الشحن" type="number" min="0" prepend-inner-icon="ri-truck-line" />

                    <v-divider class="my-4" />

                    <!-- Totals -->
                    <div class="d-flex justify-space-between mb-2">
                      <span>المجموع الفرعي:</span>
                      <span class="font-weight-medium">{{ formatCurrency(calculations.subtotal) }}</span>
                    </div>
                    <div v-if="calculations.discountAmount > 0" class="d-flex justify-space-between mb-2 text-error">
                      <span>الخصم:</span>
                      <span>-{{ formatCurrency(calculations.discountAmount) }}</span>
                    </div>
                    <div v-if="calculations.taxAmount > 0" class="d-flex justify-space-between mb-2">
                      <span>الضريبة:</span>
                      <span>{{ formatCurrency(calculations.taxAmount) }}</span>
                    </div>
                    <div v-if="formData.shipping_cost > 0" class="d-flex justify-space-between mb-2">
                      <span>الشحن:</span>
                      <span>{{ formatCurrency(formData.shipping_cost) }}</span>
                    </div>

                    <v-divider class="my-4" />

                    <div class="d-flex justify-space-between text-h5 font-weight-bold text-success">
                      <span>الإجمالي:</span>
                      <span>{{ formatCurrency(calculations.total) }}</span>
                    </div>

                    <v-divider class="my-4" />

                    <!-- Payment -->
                    <v-select
                      v-model="formData.payment_method_id"
                      :items="paymentMethods"
                      item-title="name"
                      item-value="id"
                      label="طريقة الدفع"
                      prepend-inner-icon="ri-bank-card-line"
                    />

                    <v-text-field
                      v-model.number="formData.amount_paid"
                      label="المبلغ المدفوع"
                      type="number"
                      min="0"
                      :max="calculations.total"
                      prepend-inner-icon="ri-money-dollar-circle-line"
                    />

                    <div v-if="calculations.remaining > 0" class="text-warning">المتبقي: {{ formatCurrency(calculations.remaining) }}</div>

                    <!-- Notes -->
                    <v-textarea v-model="formData.notes" label="ملاحظات" rows="3" prepend-inner-icon="ri-sticky-note-line" class="mt-4" />
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </template>

        <!-- Actions -->
        <template #actions>
          <v-divider />
          <v-card-actions>
            <v-btn v-if="currentStep > 1" variant="outlined" @click="currentStep--"> السابق </v-btn>
            <v-spacer />
            <v-btn v-if="currentStep < 3" color="primary" :disabled="!canProceed" @click="currentStep++"> التالي </v-btn>
            <v-btn v-else color="success" :loading="submitting" :disabled="!canSubmit" @click="submitInvoice"> حفظ الفاتورة </v-btn>
          </v-card-actions>
        </template>
      </v-stepper>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useApi } from '@/composables/useApi';
import CustomerSelector from '../components/CustomerSelector.vue';
import ProductSelector from '../components/ProductSelector.vue';
import { toast } from 'vue3-toastify';

const router = useRouter();

// API
const invoiceApi = useApi('/api/invoices');
const { get: getInvoiceTypes } = useApi('/api/invoice-types');
const { get: getWarehouses } = useApi('/api/warehouses');
const { get: getPaymentMethods } = useApi('/api/payment-methods');

// Stepper
const currentStep = ref(1);
const steps = [
  { title: 'معلومات الفاتورة', value: 1 },
  { title: 'المنتجات', value: 2 },
  { title: 'المراجعة والدفع', value: 3 },
];

// Form Data
const formData = ref({
  customer: null,
  invoice_type_id: null,
  invoice_date: new Date().toISOString().split('T')[0],
  due_date: null,
  warehouse_id: null,
  items: [],
  discount_percentage: 0,
  tax_percentage: 14, // Default tax in Egypt
  shipping_cost: 0,
  payment_method_id: null,
  amount_paid: 0,
  notes: '',
});

// Lookups
const invoiceTypes = ref([]);
const warehouses = ref([]);
const paymentMethods = ref([]);
const submitting = ref(false);

// Calculations
const calculations = computed(() => {
  const subtotal = formData.value.items.reduce((sum, item) => sum + parseFloat(item.total), 0);
  const discountAmount = subtotal * (formData.value.discount_percentage / 100);
  const taxableAmount = subtotal - discountAmount;
  const taxAmount = taxableAmount * (formData.value.tax_percentage / 100);
  const total = taxableAmount + taxAmount + formData.value.shipping_cost;
  const remaining = total - formData.value.amount_paid;

  return {
    subtotal,
    discountAmount,
    taxableAmount,
    taxAmount,
    total,
    remaining,
  };
});

// Validation
const canProceed = computed(() => {
  if (currentStep.value === 1) {
    return formData.value.customer && formData.value.invoice_date;
  }
  if (currentStep.value === 2) {
    return formData.value.items.length > 0;
  }
  return true;
});

const canSubmit = computed(() => {
  return formData.value.customer && formData.value.items.length > 0 && !submitting.value;
});

// Methods
const goBack = () => {
  router.push('/invoices');
};

const handleCustomerChange = customer => {
  formData.value.customer = customer;
};

const addProduct = item => {
  formData.value.items.push(item);
};

const removeProduct = index => {
  formData.value.items.splice(index, 1);
};

const submitInvoice = async () => {
  submitting.value = true;
  try {
    const payload = {
      customer_id: formData.value.customer.id,
      invoice_type_id: formData.value.invoice_type_id,
      invoice_date: formData.value.invoice_date,
      due_date: formData.value.due_date,
      warehouse_id: formData.value.warehouse_id,
      items: formData.value.items,
      discount_percentage: formData.value.discount_percentage,
      tax_percentage: formData.value.tax_percentage,
      shipping_cost: formData.value.shipping_cost,
      payment_method_id: formData.value.payment_method_id,
      amount_paid: formData.value.amount_paid,
      notes: formData.value.notes,
      total: calculations.value.total,
    };

    const response = await invoiceApi.create(payload, {
      successMessage: 'تم إنشاء الفاتورة بنجاح',
    });

    router.push(`/invoices/${response.data.id}`);
  } catch (error) {
    // Error handled in useApi
  } finally {
    submitting.value = false;
  }
};

const formatCurrency = amount => {
  if (!amount) return '0.00 ج.م';
  return new Intl.NumberFormat('ar-EG', {
    style: 'currency',
    currency: 'EGP',
  }).format(amount);
};

// Load data
onMounted(async () => {
  try {
    const [invTypes, whs, pmths] = await Promise.all([
      getInvoiceTypes({}, { showLoading: false }),
      getWarehouses({}, { showLoading: false }),
      getPaymentMethods({}, { showLoading: false }),
    ]);

    invoiceTypes.value = invTypes.data || [];
    warehouses.value = whs.data || [];
    paymentMethods.value = pmths.data || [];
  } catch (error) {
    console.error('Error loading data:', error);
  }
});
</script>
