<template>
  <v-container fluid>
    <!-- Header -->
    <div class="d-flex align-center mb-4">
      <v-btn icon="ri-arrow-right-line" variant="text" @click="goBack" />
      <div class="ms-3">
        <h1 class="text-h4 font-weight-bold">تعديل الفاتورة</h1>
        <p class="text-medium-emphasis">الفاتورة #{{ invoice?.invoice_number }}</p>
      </div>
    </div>

    <!-- Loading -->
    <v-card v-if="loading" class="pa-6">
      <v-skeleton-loader type="article" />
    </v-card>

    <!-- Edit Form (Same as Create but pre-filled) -->
    <v-card v-else-if="invoice">
      <v-stepper v-model="currentStep" :items="steps" alt-labels>
        <!-- Same steps as InvoiceCreate.vue -->
        <template #item.1>
          <v-card-text>
            <v-row>
              <v-col cols="12">
                <h3 class="text-h6 mb-4">معلومات العميل والفاتورة</h3>
              </v-col>

              <v-col cols="12" md="6">
                <CustomerSelector v-model="formData.customer" />
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

        <template #item.2>
          <v-card-text>
            <v-row>
              <v-col cols="12">
                <h3 class="text-h6 mb-4">المنتجات</h3>
                <ProductSelector @add="addProduct" />
              </v-col>

              <v-col v-if="formData.items.length > 0" cols="12">
                <v-card variant="outlined" class="mt-4">
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
                        <td>{{ item.product_name }}</td>
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
            </v-row>
          </v-card-text>
        </template>

        <template #item.3>
          <v-card-text>
            <v-row>
              <v-col cols="12" md="7">
                <h3 class="text-h6 mb-4">ملخص الفاتورة</h3>
                <v-card variant="outlined">
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
                    <v-text-field
                      v-model.number="formData.discount_percentage"
                      label="خصم إضافي %"
                      type="number"
                      prepend-inner-icon="ri-percent-line"
                    />
                    <v-text-field v-model.number="formData.tax_percentage" label="الضريبة %" type="number" prepend-inner-icon="ri-percent-line" />
                    <v-text-field v-model.number="formData.shipping_cost" label="الشحن" type="number" prepend-inner-icon="ri-truck-line" />

                    <v-divider class="my-4" />

                    <div class="d-flex justify-space-between text-h5 font-weight-bold text-success">
                      <span>الإجمالي:</span>
                      <span>{{ formatCurrency(calculations.total) }}</span>
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </template>

        <template #actions>
          <v-divider />
          <v-card-actions>
            <v-btn v-if="currentStep > 1" variant="outlined" @click="currentStep--"> السابق </v-btn>
            <v-spacer />
            <v-btn v-if="currentStep < 3" color="primary" @click="currentStep++"> التالي </v-btn>
            <v-btn v-else color="success" :loading="submitting" @click="updateInvoice"> حفظ التعديلات </v-btn>
          </v-card-actions>
        </template>
      </v-stepper>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useApi } from '@/composables/useApi';
import CustomerSelector from '../components/CustomerSelector.vue';
import ProductSelector from '../components/ProductSelector.vue';

const router = useRouter();
const route = useRoute();

const invoiceApi = useApi('/api/invoices');
const { get: getInvoiceTypes } = useApi('/api/invoice-types');
const { get: getWarehouses } = useApi('/api/warehouses');

const loading = ref(true);
const submitting = ref(false);
const invoice = ref(null);
const currentStep = ref(1);
const steps = [
  { title: 'معلومات الفاتورة', value: 1 },
  { title: 'المنتجات', value: 2 },
  { title: 'المراجعة', value: 3 },
];

const formData = ref({
  customer: null,
  invoice_type_id: null,
  invoice_date: null,
  due_date: null,
  warehouse_id: null,
  items: [],
  discount_percentage: 0,
  tax_percentage: 14,
  shipping_cost: 0,
});

const invoiceTypes = ref([]);
const warehouses = ref([]);

const calculations = computed(() => {
  const subtotal = formData.value.items.reduce((sum, item) => sum + parseFloat(item.total), 0);
  const discountAmount = subtotal * (formData.value.discount_percentage / 100);
  const taxableAmount = subtotal - discountAmount;
  const taxAmount = taxableAmount * (formData.value.tax_percentage / 100);
  const total = taxableAmount + taxAmount + formData.value.shipping_cost;

  return { subtotal, discountAmount, taxableAmount, taxAmount, total };
});

const goBack = () => {
  router.push('/invoices');
};

const addProduct = item => {
  formData.value.items.push(item);
};

const removeProduct = index => {
  formData.value.items.splice(index, 1);
};

const updateInvoice = async () => {
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
      total: calculations.value.total,
    };

    await invoiceApi.update(route.params.id, payload, {
      successMessage: 'تم تحديث الفاتورة بنجاح',
    });

    router.push(`/invoices/${route.params.id}`);
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

onMounted(async () => {
  try {
    const [invData, invTypes, whs] = await Promise.all([
      invoiceApi.getById(route.params.id),
      getInvoiceTypes({}, { showLoading: false }),
      getWarehouses({}, { showLoading: false }),
    ]);

    invoice.value = invData.data;
    invoiceTypes.value = invTypes.data || [];
    warehouses.value = whs.data || [];

    // Pre-fill form
    formData.value = {
      customer: invData.data.customer,
      invoice_type_id: invData.data.invoice_type_id,
      invoice_date: invData.data.invoice_date,
      due_date: invData.data.due_date,
      warehouse_id: invData.data.warehouse_id,
      items: invData.data.items || [],
      discount_percentage: invData.data.discount_percentage || 0,
      tax_percentage: invData.data.tax_percentage || 14,
      shipping_cost: invData.data.shipping_cost || 0,
    };
  } finally {
    loading.value = false;
  }
});
</script>
