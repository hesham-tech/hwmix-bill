<template>
  <div class="invoice-create-page">
    <CanView permission="invoices.create" show-message>
      <div class="page-header mb-6">
        <h1 class="text-h4 font-weight-bold">فاتورة جديدة</h1>
        <p class="text-body-1 text-grey">إنشاء فاتورة بيع أو شراء</p>
      </div>

      <v-stepper v-model="step" alt-labels>
        <v-stepper-header>
          <v-stepper-item :complete="step > 1" :value="1" title="نوع الفاتورة" icon="ri-file-list-line" />
          <v-divider />

          <v-stepper-item :complete="step > 2" :value="2" title="بيانات العميل" icon="ri-user-line" />
          <v-divider />

          <v-stepper-item :complete="step > 3" :value="3" title="الأصناف" icon="ri-shopping-cart-line" />
          <v-divider />

          <v-stepper-item :value="4" title="المراجعة" icon="ri-checkbox-circle-line" />
        </v-stepper-header>

        <v-stepper-window>
          <!-- Step 1: Invoice Type -->
          <v-stepper-window-item :value="1">
            <v-card flat>
              <v-card-text>
                <v-row>
                  <v-col cols="12" md="6">
                    <v-card :class="{ 'invoice-type-selected': form.type === 'sales' }" class="invoice-type-card" @click="form.type = 'sales'">
                      <v-card-text class="text-center pa-8">
                        <v-icon icon="ri-shopping-bag-line" size="64" color="success" />
                        <h3 class="text-h5 mt-4">فاتورة بيع</h3>
                        <p class="text-grey mt-2">إصدار فاتورة للعملاء</p>
                      </v-card-text>
                    </v-card>
                  </v-col>

                  <v-col cols="12" md="6">
                    <v-card :class="{ 'invoice-type-selected': form.type === 'purchase' }" class="invoice-type-card" @click="form.type = 'purchase'">
                      <v-card-text class="text-center pa-8">
                        <v-icon icon="ri-shopping-cart-line" size="64" color="primary" />
                        <h3 class="text-h5 mt-4">فاتورة شراء</h3>
                        <p class="text-grey mt-2">تسجيل مشتريات من الموردين</p>
                      </v-card-text>
                    </v-card>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-stepper-window-item>

          <!-- Step 2: Customer Info -->
          <v-stepper-window-item :value="2">
            <v-card flat>
              <v-card-text>
                <InvoiceForm v-model="form" :step="2" />
              </v-card-text>
            </v-card>
          </v-stepper-window-item>

          <!-- Step 3: Items -->
          <v-stepper-window-item :value="3">
            <v-card flat>
              <v-card-text>
                <InvoiceForm v-model="form" :step="3" />
              </v-card-text>
            </v-card>
          </v-stepper-window-item>

          <!-- Step 4: Review -->
          <v-stepper-window-item :value="4">
            <v-card flat>
              <v-card-text>
                <div class="review-section">
                  <h3 class="text-h6 mb-4">مراجعة الفاتورة</h3>

                  <v-row>
                    <v-col cols="12" md="6">
                      <div class="review-item">
                        <span class="text-grey">النوع:</span>
                        <span class="font-weight-bold">
                          {{ form.type === 'sales' ? 'بيع' : 'شراء' }}
                        </span>
                      </div>
                      <div class="review-item">
                        <span class="text-grey">العميل:</span>
                        <span class="font-weight-bold">{{ form.customer_name }}</span>
                      </div>
                    </v-col>

                    <v-col cols="12" md="6">
                      <div class="review-item">
                        <span class="text-grey">التاريخ:</span>
                        <span class="font-weight-bold">{{ form.date }}</span>
                      </div>
                      <div class="review-item">
                        <span class="text-grey">عدد الأصناف:</span>
                        <span class="font-weight-bold">{{ form.items?.length || 0 }}</span>
                      </div>
                    </v-col>
                  </v-row>

                  <v-divider class="my-4" />

                  <div class="totals">
                    <div class="total-row">
                      <span>المجموع الفرعي:</span>
                      <span>{{ formatCurrency(calculateSubtotal()) }}</span>
                    </div>
                    <div class="total-row">
                      <span>الضريبة:</span>
                      <span>{{ formatCurrency(form.tax || 0) }}</span>
                    </div>
                    <div class="total-row total">
                      <span class="text-h6">الإجمالي:</span>
                      <span class="text-h5 text-success">
                        {{ formatCurrency(calculateTotal()) }}
                      </span>
                    </div>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </v-stepper-window-item>
        </v-stepper-window>

        <v-stepper-actions @click:prev="step--" @click:next="handleNext" :disabled="loading" />
      </v-stepper>
    </CanView>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import InvoiceForm from '../components/InvoiceForm.vue';
import CanView from '@/components/common/CanView.vue';
import { invoiceService } from '@/api';
import { formatCurrency } from '@/utils/formatters';
import { toast } from 'vue3-toastify';

const router = useRouter();
const step = ref(1);
const loading = ref(false);

const form = ref({
  type: 'sales',
  customer_name: '',
  customer_id: null,
  date: new Date().toISOString().split('T')[0],
  items: [],
  tax: 0,
  discount: 0,
  notes: '',
});

const calculateSubtotal = () => {
  return form.value.items?.reduce((sum, item) => sum + (item.total || 0), 0) || 0;
};

const calculateTotal = () => {
  const subtotal = calculateSubtotal();
  return subtotal + (form.value.tax || 0) - (form.value.discount || 0);
};

const handleNext = async () => {
  if (step.value < 4) {
    step.value++;
  } else {
    await handleSubmit();
  }
};

const handleSubmit = async () => {
  loading.value = true;
  try {
    await invoiceService.save(form.value);
    toast.success('تم إنشاء الفاتورة بنجاح');
    router.push('/invoices');
  } catch (error) {
    toast.error('فشل إنشاء الفاتورة');
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.invoice-create-page {
  padding: 24px;
}

.invoice-type-card {
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.invoice-type-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}

.invoice-type-selected {
  border-color: #1976d2;
  background: rgba(25, 118, 210, 0.05);
}

.review-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
}

.totals {
  margin-top: 16px;
}

.total-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
}

.total-row.total {
  border-top: 2px solid #ddd;
  margin-top: 8px;
  padding-top: 16px;
}
</style>
