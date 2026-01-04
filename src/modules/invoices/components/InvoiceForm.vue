<template>
  <v-form ref="formRef" @submit.prevent="handleSubmit">
    <v-row>
      <!-- Invoice Type -->
      <v-col cols="12" md="4">
        <v-select v-model="form.type" :items="typeOptions" label="نوع الفاتورة *" :readonly="!!modelValue.id" :rules="[required]" />
      </v-col>

      <!-- Customer -->
      <v-col cols="12" md="4">
        <v-autocomplete v-model="form.customer_id" :items="customers" item-title="name" item-value="id" label="العميل *" :rules="[required]" />
      </v-col>

      <!-- Date -->
      <v-col cols="12" md="4">
        <v-text-field v-model="form.date" type="date" label="التاريخ *" :rules="[required]" />
      </v-col>

      <!-- Invoice Items -->
      <v-col cols="12">
        <v-card>
          <v-card-title class="d-flex justify-space-between align-center">
            <span>الأصناف</span>
            <v-btn color="primary" size="small" prepend-icon="ri-add-line" @click="addItem"> إضافة صنف </v-btn>
          </v-card-title>

          <v-card-text>
            <v-table>
              <thead>
                <tr>
                  <th>المنتج</th>
                  <th>الكمية</th>
                  <th>السعر</th>
                  <th>المجموع</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in form.items" :key="index">
                  <td style="width: 40%">
                    <v-autocomplete
                      v-model="item.product_id"
                      :items="products"
                      item-title="name"
                      item-value="id"
                      density="compact"
                      hide-details
                      @update:model-value="handleProductChange(index)"
                    />
                  </td>
                  <td style="width: 15%">
                    <v-text-field
                      v-model.number="item.quantity"
                      type="number"
                      density="compact"
                      hide-details
                      min="1"
                      @input="calculateItemTotal(index)"
                    />
                  </td>
                  <td style="width: 20%">
                    <v-text-field
                      v-model.number="item.price"
                      type="number"
                      density="compact"
                      hide-details
                      min="0"
                      step="0.01"
                      @input="calculateItemTotal(index)"
                    />
                  </td>
                  <td style="width: 15%">
                    <span class="font-weight-bold">
                      {{ formatCurrency(item.total) }}
                    </span>
                  </td>
                  <td style="width: 10%">
                    <v-btn icon="ri-delete-bin-line" size="small" variant="text" color="error" @click="removeItem(index)" />
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Totals -->
      <v-col cols="12" md="6" offset-md="6">
        <v-card>
          <v-card-text>
            <div class="d-flex justify-space-between mb-2">
              <span>المجموع الفرعي:</span>
              <span class="font-weight-bold">{{ formatCurrency(subtotal) }}</span>
            </div>

            <div class="d-flex justify-space-between mb-2">
              <span>الضريبة ({{ form.tax_rate }}%):</span>
              <span class="font-weight-bold">{{ formatCurrency(taxAmount) }}</span>
            </div>

            <div class="d-flex justify-space-between mb-2">
              <span>الخصم:</span>
              <v-text-field
                v-model.number="form.discount"
                type="number"
                density="compact"
                hide-details
                min="0"
                step="0.01"
                style="max-width: 150px"
              />
            </div>

            <v-divider class="my-3" />

            <div class="d-flex justify-space-between">
              <span class="text-h6">المجموع الكلي:</span>
              <span class="text-h6 font-weight-bold text-primary">
                {{ formatCurrency(total) }}
              </span>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Notes -->
      <v-col cols="12">
        <v-textarea v-model="form.notes" label="ملاحظات" rows="3" />
      </v-col>
    </v-row>

    <!-- Actions -->
    <FormActions :loading="loading" @cancel="$emit('cancel')" @submit="handleSubmit" />
  </v-form>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { FormActions } from '@/components';
import { productService } from '@/api';

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(['save', 'cancel']);

const formRef = ref(null);
const loading = ref(false);
const products = ref([]);
const customers = ref([]);

const form = ref({
  type: 'sale',
  customer_id: null,
  date: new Date().toISOString().split('T')[0],
  items: [],
  tax_rate: 14,
  discount: 0,
  notes: '',
  ...props.modelValue,
});

// Validation rules
const required = v => !!v || 'هذا الحقل مطلوب';

// Type options
const typeOptions = [
  { title: 'فاتورة بيع', value: 'sale' },
  { title: 'فاتورة شراء', value: 'purchase' },
  { title: 'فاتورة تقسيط', value: 'installment_sale' },
];

// Computed
const subtotal = computed(() => {
  return form.value.items.reduce((sum, item) => sum + (item.total || 0), 0);
});

const taxAmount = computed(() => {
  return (subtotal.value * form.value.tax_rate) / 100;
});

const total = computed(() => {
  return subtotal.value + taxAmount.value - (form.value.discount || 0);
});

// Methods
const addItem = () => {
  form.value.items.push({
    product_id: null,
    quantity: 1,
    price: 0,
    total: 0,
  });
};

const removeItem = index => {
  form.value.items.splice(index, 1);
};

const handleProductChange = async index => {
  const item = form.value.items[index];
  const product = products.value.find(p => p.id === item.product_id);

  if (product) {
    item.price = product.price || 0;
    calculateItemTotal(index);
  }
};

const calculateItemTotal = index => {
  const item = form.value.items[index];
  item.total = (item.quantity || 0) * (item.price || 0);
};

const formatCurrency = amount => {
  return new Intl.NumberFormat('ar-EG', {
    style: 'currency',
    currency: 'EGP',
  }).format(amount || 0);
};

const handleSubmit = async () => {
  const { valid } = await formRef.value.validate();

  if (!valid) return;

  if (form.value.items.length === 0) {
    // toast error
    return;
  }

  loading.value = true;

  const data = {
    ...form.value,
    subtotal: subtotal.value,
    tax: taxAmount.value,
    total: total.value,
  };

  emit('save', data);
  loading.value = false;
};

// Load data
const loadProducts = async () => {
  try {
    const response = await productService.getAll({ per_page: -1 }, { showToast: false });
    products.value = response.data;
  } catch (error) {
    console.error('Error loading products:', error);
  }
};

// Lifecycle
onMounted(() => {
  loadProducts();

  if (form.value.items.length === 0) {
    addItem();
  }
});

// Watch modelValue changes
watch(
  () => props.modelValue,
  newVal => {
    form.value = { ...form.value, ...newVal };
  },
  { deep: true }
);
</script>
