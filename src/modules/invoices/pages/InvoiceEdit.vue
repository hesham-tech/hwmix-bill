<template>
  <v-container fluid>
    <div class="d-flex align-center justify-space-between mb-6">
      <div class="d-flex align-center">
        <AppButton icon="ri-arrow-right-line" variant="text" color="secondary" @click="goBack" class="me-3" />
        <div>
          <h1 class="text-h4 font-weight-bold">تعديل الفاتورة</h1>
          <p class="text-body-1 text-grey" v-if="invoice">فاتورة رقم #{{ invoice.invoice_number }}</p>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="d-flex justify-center align-center py-12">
      <LoadingSpinner />
    </div>

    <!-- Edit Form (Same as Create but pre-filled) -->
    <v-card v-else-if="invoice">
      <v-stepper v-model="currentStep" :items="steps" alt-labels>
        <!-- Step 1: Customer Info -->
        <template #item.1>
          <div class="pa-4">
            <v-row>
              <v-col cols="12">
                <div class="d-flex align-center mb-4">
                  <v-icon icon="ri-user-settings-line" color="primary" class="me-2" />
                  <h3 class="text-h6 font-weight-bold">معلومات العميل والفاتورة</h3>
                </div>
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
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="ri-file-copy-line"
                />
              </v-col>

              <v-col cols="12" md="4">
                <AppInput v-model="formData.invoice_date" type="date" label="تاريخ الفاتورة *" prepend-inner-icon="ri-calendar-line" />
              </v-col>

              <v-col cols="12" md="4">
                <AppInput v-model="formData.due_date" type="date" label="تاريخ الاستحقاق" prepend-inner-icon="ri-calendar-check-line" />
              </v-col>

              <v-col cols="12" md="4">
                <v-select
                  v-model="formData.warehouse_id"
                  :items="warehouses"
                  item-title="name"
                  item-value="id"
                  label="المخزن"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="ri-building-line"
                />
              </v-col>
            </v-row>
          </div>
        </template>

        <!-- Step 2: Products -->
        <template #item.2>
          <div class="pa-4">
            <v-row>
              <v-col cols="12">
                <div class="d-flex align-center mb-4">
                  <v-icon icon="ri-shopping-bag-line" color="primary" class="me-2" />
                  <h3 class="text-h6 font-weight-bold">المنتجات</h3>
                </div>
              </v-col>

              <v-col cols="12">
                <ProductSelector @add="addProduct" />
              </v-col>

              <!-- Selected Products Table -->
              <v-col v-if="formData.items.length > 0" cols="12">
                <AppCard class="mt-4" title="المنتجات المحددة" :subtitle="`إجمالي العناصر: ${formData.items.length}`" icon="ri-list-check-2">
                  <v-table>
                    <thead>
                      <tr>
                        <th class="text-right">المنتج</th>
                        <th class="text-center">الكمية</th>
                        <th class="text-left">السعر</th>
                        <th class="text-left">الخصم</th>
                        <th class="text-left">الإجمالي</th>
                        <th class="text-center">إجراءات</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(item, index) in formData.items" :key="index">
                        <td>
                          <div class="font-weight-medium">{{ item.product_name }}</div>
                          <div v-if="item.variant_name" class="text-caption text-grey">{{ item.variant_name }}</div>
                        </td>
                        <td class="text-center">
                          <v-chip size="small" variant="tonal" color="primary">{{ item.quantity }}</v-chip>
                        </td>
                        <td class="text-left">{{ formatCurrency(item.unit_price) }}</td>
                        <td class="text-left text-error">{{ item.discount_percentage }}%</td>
                        <td class="text-left font-weight-bold text-success">{{ formatCurrency(item.total) }}</td>
                        <td class="text-center">
                          <AppButton
                            icon="ri-delete-bin-line"
                            size="x-small"
                            variant="text"
                            color="error"
                            tooltip="حذف"
                            @click="removeProduct(index)"
                          />
                        </td>
                      </tr>
                    </tbody>
                  </v-table>
                </AppCard>
              </v-col>

              <v-col v-else cols="12">
                <v-alert type="info" variant="tonal" border="start"> لم يتم إضافة منتجات بعد. ابحث عن منتج أعلاه للإضافة. </v-alert>
              </v-col>
            </v-row>
          </div>
        </template>

        <!-- Step 3: Review & Payment -->
        <template #item.3>
          <div class="pa-4">
            <v-row>
              <v-col cols="12" md="7">
                <div class="d-flex align-center mb-4">
                  <v-icon icon="ri-eye-line" color="primary" class="me-2" />
                  <h3 class="text-h6 font-weight-bold">مراجعة التعديلات</h3>
                </div>

                <!-- Customer Info -->
                <AppCard title="معلومات العميل" icon="ri-user-line" class="mb-6">
                  <div class="d-flex flex-column gap-2">
                    <div class="d-flex justify-space-between border-bottom pb-2">
                      <span class="text-grey">الاسم:</span>
                      <span class="font-weight-bold">{{ formData.customer?.name }}</span>
                    </div>
                    <div class="d-flex justify-space-between border-bottom pb-2">
                      <span class="text-grey">الهاتف:</span>
                      <span class="font-weight-bold">{{ formData.customer?.phone }}</span>
                    </div>
                    <div v-if="formData.customer?.email" class="d-flex justify-space-between">
                      <span class="text-grey">البريد:</span>
                      <span class="font-weight-bold">{{ formData.customer.email }}</span>
                    </div>
                  </div>
                </AppCard>

                <!-- Products Summary -->
                <AppCard title="ملخص المنتجات" icon="ri-shopping-cart-2-line">
                  <v-list density="compact">
                    <v-list-item v-for="(item, index) in formData.items" :key="index" class="px-0">
                      <template #prepend>
                        <v-avatar size="32" color="primary-lighten-5" class="me-3">
                          <span class="text-primary text-caption font-weight-bold">{{ item.quantity }}</span>
                        </v-avatar>
                      </template>
                      <v-list-item-title class="font-weight-medium">{{ item.product_name }}</v-list-item-title>
                      <v-list-item-subtitle>{{ formatCurrency(item.unit_price) }}</v-list-item-subtitle>
                      <template #append>
                        <span class="font-weight-bold text-success">{{ formatCurrency(item.total) }}</span>
                      </template>
                    </v-list-item>
                  </v-list>
                </AppCard>
              </v-col>

              <v-col cols="12" md="5">
                <div class="d-flex align-center mb-4">
                  <v-icon icon="ri-secure-payment-line" color="primary" class="me-2" />
                  <h3 class="text-h6 font-weight-bold">الخصومات والضرائب</h3>
                </div>

                <AppCard>
                  <v-row dense>
                    <v-col cols="6">
                      <AppInput v-model.number="formData.discount_percentage" label="خصم %" type="number" prepend-inner-icon="ri-percent-line" />
                    </v-col>
                    <v-col cols="6">
                      <AppInput v-model.number="formData.tax_percentage" label="ضريبة %" type="number" prepend-inner-icon="ri-percent-line" />
                    </v-col>
                    <v-col cols="12">
                      <AppInput v-model.number="formData.shipping_cost" label="تكلفة الشحن" type="number" prepend-inner-icon="ri-truck-line" />
                    </v-col>
                  </v-row>

                  <v-divider class="my-4" />

                  <div class="d-flex flex-column gap-2 mb-4">
                    <div class="d-flex justify-space-between text-body-1">
                      <span class="text-grey">المجموع الفرعي:</span>
                      <span class="font-weight-medium">{{ formatCurrency(calculations.subtotal) }}</span>
                    </div>
                    <div v-if="calculations.discountAmount > 0" class="d-flex justify-space-between text-body-1 text-error">
                      <span>إجمالي الخصم:</span>
                      <span>-{{ formatCurrency(calculations.discountAmount) }}</span>
                    </div>
                    <div v-if="calculations.taxAmount > 0" class="d-flex justify-space-between text-body-1">
                      <span class="text-grey">إجمالي الضريبة:</span>
                      <span>{{ formatCurrency(calculations.taxAmount) }}</span>
                    </div>
                    <div v-if="formData.shipping_cost > 0" class="d-flex justify-space-between text-body-1">
                      <span class="text-grey">تكلفة الشحن:</span>
                      <span>{{ formatCurrency(formData.shipping_cost) }}</span>
                    </div>
                  </div>

                  <div class="d-flex justify-space-between align-center px-4 py-3 bg-success-lighten-5 rounded-lg border border-success">
                    <span class="text-h6 font-weight-bold text-success">الإجمالي النهائي:</span>
                    <span class="text-h5 font-weight-black text-success">{{ formatCurrency(calculations.total) }}</span>
                  </div>
                </AppCard>
              </v-col>
            </v-row>
          </div>
        </template>

        <!-- Actions -->
        <template #actions>
          <v-divider />
          <div class="d-flex align-center justify-space-between pa-4">
            <AppButton v-if="currentStep > 1" variant="outlined" color="secondary" prepend-icon="ri-arrow-right-line" @click="currentStep--">
              السابق
            </AppButton>
            <div v-else></div>

            <div class="d-flex gap-2">
              <AppButton v-if="currentStep < 3" append-icon="ri-arrow-left-line" @click="currentStep++"> التالي </AppButton>
              <AppButton v-else color="success" prepend-icon="ri-save-line" :loading="submitting" @click="updateInvoice"> حفظ التعديلات </AppButton>
            </div>
          </div>
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
import AppButton from '@/components/common/AppButton.vue';
import AppCard from '@/components/common/AppCard.vue';
import AppInput from '@/components/common/AppInput.vue';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';

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

const handleCustomerChange = customer => {
  formData.value.customer = customer;
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
