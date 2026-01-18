<template>
  <div class="invoice-form-container">
    <!-- Sticky Header -->
    <InvoiceHeader
      :is-edit="isEdit"
      :invoice-total="invoiceTotal"
      :loading="loading"
      :can-submit="canSubmit"
      @save="saveInvoice"
      @cancel="$emit('cancel')"
    />

    <v-form ref="form" v-model="isFormValid">
      <v-row>
        <!-- Main Content (Left on Desktop) -->
        <v-col cols="12" lg="8">
          <!-- Section 1: Header Info -->
          <InvoiceCustomerInfo
            v-model="invoiceData"
            :selected-customer="selectedCustomerObj"
            :invoice-types="invoiceTypes"
            :warehouses="warehouses"
            :errors="errors"
            @update:selected-customer="
              val => {
                selectedCustomerObj = val;
                invoiceData.user_id = val?.id || null;
              }
            "
            @create-customer="isQuickAddCustomerOpen = true"
            @update:prop="({ key, value }) => (invoiceData[key] = value)"
          />

          <!-- Section 2: Items Table -->
          <InvoiceItemsList
            v-model:tax-inclusive="invoiceData.tax_inclusive"
            :items="invoiceData.items"
            :warehouse-id="invoiceData.warehouse_id"
            :invoice-type="currentContext"
            :customer-type="selectedCustomerObj?.customer_type || 'retail'"
            :show-installment-section="currentContext === 'installment_sale'"
            @add="addItem"
            @calculate="calculateItem"
            @remove="removeItem"
          >
            <template #installment>
              <InstallmentPlanner
                :total-amount="financials.net_amount"
                v-model="invoiceData.installment_plan"
                @update:down-payment="val => (invoiceData.paid_amount = val)"
              />
            </template>
          </InvoiceItemsList>
        </v-col>

        <!-- Section 3: Summary & Financials (Right on Desktop) -->
        <v-col cols="12" lg="4">
          <InvoiceFinancials
            v-model="invoiceData"
            :financials="financials"
            :errors="errors"
            @update:prop="({ key, value }) => (invoiceData[key] = value)"
          />
        </v-col>
      </v-row>
    </v-form>

    <!-- Quick Add Customer Dialog -->
    <AppDialog v-model="isQuickAddCustomerOpen" title="إضافة عميل جديد سريع" icon="ri-user-add-line" max-width="800" hide-actions>
      <UserForm :model-value="{ role: 'customer' }" @save="handleQuickCustomerSave" @cancel="isQuickAddCustomerOpen = false" />
    </AppDialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useApi } from '@/composables/useApi';

// Global Components

// Module Components
import InvoiceHeader from './InvoiceHeader.vue';
import InvoiceCustomerInfo from './InvoiceCustomerInfo.vue';
import InvoiceItemsList from './InvoiceItemsList.vue';
import InvoiceFinancials from './InvoiceFinancials.vue';
import InstallmentPlanner from './InstallmentPlanner.vue';
import UserForm from '@/modules/users/components/UserForm.vue';

// Stores & Composables
import { useUserStore as useUserManagementStore } from '@/modules/users/store/user.store';
import { useUserStore } from '@/stores/user';

const props = defineProps({
  invoiceId: {
    type: [String, Number],
    default: null,
  },
  initialType: {
    type: String, // 'sales', 'purchases', etc.
    default: 'sales',
  },
});

const emit = defineEmits(['success', 'cancel']);

// API
const userManagementStore = useUserManagementStore();
const userStore = useUserStore();
const invoiceApi = useApi('/api/invoices');
const { get: getInvoiceTypes } = useApi('/api/invoice-types');
const { get: getWarehouses } = useApi('/api/warehouses');

// State
const loading = ref(false);
const isFormValid = ref(false);
const form = ref(null);
const invoiceTypes = ref([]);
const warehouses = ref([]);
const errors = ref({});
const selectedCustomerObj = ref(null);
const isQuickAddCustomerOpen = ref(false);

const invoiceData = ref({
  user_id: null,
  invoice_type_id: null,
  issue_date: new Date().toISOString().split('T')[0],
  due_date: null,
  warehouse_id: null,
  reference_number: '',
  tax_rate: 0,
  tax_inclusive: false,
  header_discount: 0,
  paid_amount: 0,
  cash_box_id: null,
  notes: '',
  items: [],
  installment_plan: null,
});

// Computed properties
const currentInvoiceType = computed(() => {
  return invoiceTypes.value.find(t => t.id === invoiceData.value.invoice_type_id);
});

const currentContext = computed(() => {
  const context = currentInvoiceType.value?.code || currentInvoiceType.value?.context || props.initialType || 'sales';
  return context.toLowerCase();
});

const isEdit = computed(() => !!props.invoiceId);

const financials = computed(() => {
  let gross_amount = 0;
  let total_discount = 0;

  invoiceData.value.items.forEach(item => {
    gross_amount += (item.quantity || 0) * (item.unit_price || 0);
    total_discount += item.discount || 0;
  });

  const taxable_amount = gross_amount - total_discount - (invoiceData.value.header_discount || 0);
  let total_tax = 0;
  let net_amount = taxable_amount;

  if (invoiceData.value.tax_rate > 0) {
    if (invoiceData.value.tax_inclusive) {
      total_tax = taxable_amount - taxable_amount / (1 + invoiceData.value.tax_rate / 100);
      net_amount = taxable_amount;
    } else {
      total_tax = taxable_amount * (invoiceData.value.tax_rate / 100);
      net_amount = taxable_amount + total_tax;
    }
  }

  const remaining_amount = net_amount - (invoiceData.value.paid_amount || 0);

  return {
    gross_amount,
    total_discount,
    taxable_amount,
    total_tax,
    net_amount,
    remaining_amount,
  };
});

const invoiceTotal = computed(() => financials.value.net_amount);

const canSubmit = computed(() => {
  return isFormValid.value && invoiceData.value.items.length > 0 && !loading.value;
});

// Methods
const addItem = productItem => {
  const existing = invoiceData.value.items.find(i => i.product_id === productItem.product_id && i.variant_id === productItem.variant_id);

  if (existing) {
    existing.quantity += productItem.quantity;
    calculateItem(existing);
  } else {
    const newItem = {
      ...productItem,
      discount: productItem.discount || 0,
      total: productItem.total || 0,
      max_quantity: productItem.quantity,
    };
    newItem.quantity = 1;
    calculateItem(newItem);
    invoiceData.value.items.push(newItem);
  }
};

const calculateItem = item => {
  item.total = (item.quantity || 0) * (item.unit_price || 0) - (item.discount || 0);
};

const removeItem = index => {
  invoiceData.value.items.splice(index, 1);
};

const handleQuickCustomerSave = async data => {
  loading.value = true;
  try {
    const response = await userManagementStore.createUser(data);
    const newCustomer = response.data || response;
    invoiceData.value.user_id = newCustomer.id;
    selectedCustomerObj.value = newCustomer;
    isQuickAddCustomerOpen.value = false;
  } catch (error) {
    console.error('Failed to quick add customer:', error);
  } finally {
    loading.value = false;
  }
};

const saveInvoice = async () => {
  const { valid } = await form.value.validate();
  if (!valid) return;

  loading.value = true;
  errors.value = {};

  try {
    const payload = {
      ...invoiceData.value,
      ...financials.value,
      invoice_number: invoiceData.value.reference_number,
      total_discount: invoiceData.value.header_discount || 0,
      invoice_type_code: currentContext.value,
    };

    // Only send installment plan if it's an installment sale AND there's actually a remaining balance
    if (currentContext.value !== 'installment_sale' || financials.value.remaining_amount <= 0) {
      delete payload.installment_plan;
    }

    let response;
    if (isEdit.value) {
      response = await invoiceApi.update(props.invoiceId, payload);
    } else {
      response = await invoiceApi.create(payload);
    }

    // تحديث بيانات المستخدم (الرصيد في القائمة العلوية)
    userStore.fetchUser();

    emit('success', response.data);
  } catch (error) {
    if (error.response?.data?.errors) {
      errors.value = error.response.data.errors;
    }
  } finally {
    loading.value = false;
  }
};

const loadLookups = async () => {
  try {
    const [typesRes, whRes] = await Promise.all([getInvoiceTypes(), getWarehouses()]);
    invoiceTypes.value = typesRes.data || [];
    warehouses.value = whRes.data || [];

    if (!isEdit.value) {
      if (invoiceTypes.value.length > 0) {
        invoiceData.value.invoice_type_id = invoiceTypes.value[0].id;
      }
      const defaultWarehouse = warehouses.value.find(w => w.is_default);
      if (defaultWarehouse) {
        invoiceData.value.warehouse_id = defaultWarehouse.id;
      } else if (warehouses.value.length > 0) {
        invoiceData.value.warehouse_id = warehouses.value[0].id;
      }
    }
  } catch (error) {
    console.error('Error loading lookups:', error);
  }
};

const fetchInvoice = async () => {
  if (!props.invoiceId) return;

  loading.value = true;
  try {
    const response = await invoiceApi.getOne(props.invoiceId);
    const invoice = response.data;

    invoiceData.value = {
      user_id: invoice.user_id,
      invoice_type_id: invoice.invoice_type_id,
      issue_date: invoice.issue_date?.split(' ')[0],
      due_date: invoice.due_date?.split(' ')[0],
      warehouse_id: invoice.warehouse_id,
      tax_rate: parseFloat(invoice.tax_rate || 0),
      tax_inclusive: invoice.tax_inclusive,
      paid_amount: parseFloat(invoice.paid_amount || 0),
      notes: invoice.notes || '',
      items: invoice.items.map(item => ({
        product_id: item.product_id,
        variant_id: item.variant_id,
        name: item.name,
        quantity: parseFloat(item.quantity),
        unit_price: parseFloat(item.unit_price),
        discount: parseFloat(item.discount || 0),
        total: parseFloat(item.total),
        primary_image_url: item.variant?.primary_image_url || item.product?.primary_image_url,
      })),
    };

    // Pre-populate selected customer object for UI logic
    if (invoice.user) {
      selectedCustomerObj.value = invoice.user;
    }
  } catch (error) {
    console.error('Error fetching invoice:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadLookups();
  if (isEdit.value) {
    fetchInvoice();
  }
});
</script>

<style scoped>
/* .invoice-form-container {
  min-height: 100vh;
} */
</style>
