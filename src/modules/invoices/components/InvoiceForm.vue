<template>
  <div class="invoice-form-container">
    <!-- Sticky Header -->
    <InvoiceHeader
      :is-edit="isEdit"
      :invoice-total="invoiceTotal"
      :loading="loading"
      :can-submit="canSubmit"
      :title="formTitle"
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
            @create-product="isQuickAddProductOpen = true"
          >
            <template #installment>
              <div class="d-none d-sm-block">
                <InstallmentPlanner
                  :net-amount="financials.total_balance"
                  v-model="invoiceData.installment_plan"
                  @update:down-payment="val => (invoiceData.paid_amount = val)"
                />
              </div>
            </template>
          </InvoiceItemsList>
        </v-col>

        <!-- Section 3: Summary & Financials (Right on Desktop) -->
        <v-col cols="12" lg="4">
          <InvoiceFinancials
            v-model="invoiceData"
            v-model:show-profit="showProfit"
            :financials="financials"
            :cash-boxes="cashBoxes"
            :errors="errors"
            @update:prop="({ key, value }) => (invoiceData[key] = value)"
          />
        </v-col>
      </v-row>
    </v-form>

    <!-- Quick Add Customer Dialog -->
    <AppDialog v-model="isQuickAddCustomerOpen" title="إضافة عميل جديد سريع" icon="ri-user-add-line" max-width="800" hide-actions draggable>
      <UserForm :model-value="{ role: 'customer' }" @save="handleQuickCustomerSave" @cancel="isQuickAddCustomerOpen = false" />
    </AppDialog>

    <!-- Quick Add Product Dialog -->
    <AppDialog
      v-model="isQuickAddProductOpen"
      title="إضافة منتج جديد سريع"
      icon="ri-shopping-bag-3-line"
      max-width="1000"
      hide-actions
      draggable
      no-padding
    >
      <ProductForm v-if="isQuickAddProductOpen" is-dialog @success="handleQuickProductSave" @cancel="isQuickAddProductOpen = false" />
    </AppDialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useApi } from '@/composables/useApi';

// Global Components

// Module Components
import InvoiceHeader from './InvoiceHeader.vue';
import InvoiceCustomerInfo from './InvoiceCustomerInfo.vue';
import InvoiceItemsList from './InvoiceItemsList.vue';
import InvoiceFinancials from './InvoiceFinancials.vue';
import InstallmentPlanner from './InstallmentPlanner.vue';
import UserForm from '@/modules/users/components/UserForm.vue';
import ProductForm from '@/modules/products/components/ProductForm.vue';

// Stores & Composables
import { useappState } from '@/stores/appState';
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
const appState = useappState();
const userManagementStore = useUserManagementStore();
const userStore = useUserStore();
const invoiceApi = useApi('/api/invoices');
const { get: getInvoiceTypes } = useApi('/api/invoice-types');
const { get: getWarehouses } = useApi('/api/warehouses');
const { get: getCashBoxes } = useApi('/api/cash-boxes');

// State
const loading = ref(false);
const isFormValid = ref(false);
const form = ref(null);
const invoiceTypes = ref([]);
const warehouses = ref([]);
const cashBoxes = ref([]);
const errors = ref({});
const selectedCustomerObj = ref(null);
const isQuickAddCustomerOpen = ref(false);
const isQuickAddProductOpen = ref(false);
const showProfit = ref(false);

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

const isInstallmentFinalized = ref(false);

const handleInstallmentConfirmation = data => {
  invoiceData.value.installment_plan = data;
  isInstallmentFinalized.value = true;
  saveInvoice();
};

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
  let total_profit = 0;

  invoiceData.value.items.forEach(item => {
    gross_amount += (item.quantity || 0) * (item.unit_price || 0);
    total_discount += item.discount || 0;
    total_profit += (item.profit_margin || 0) * (item.quantity || 0);
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

  const previous_balance = parseFloat(selectedCustomerObj.value?.balance || 0);
  const total_balance = net_amount - previous_balance;
  const remaining_amount = total_balance - (invoiceData.value.paid_amount || 0);

  return {
    gross_amount,
    total_discount,
    taxable_amount,
    total_tax,
    net_amount,
    previous_balance,
    total_balance,
    remaining_amount,
    total_profit,
  };
});

const invoiceTotal = computed(() => financials.value.net_amount);

const canSubmit = computed(() => {
  return isFormValid.value && invoiceData.value.items.length > 0 && !loading.value;
});

const formTitle = computed(() => {
  if (isEdit.value) return 'تعديل الفاتورة';

  switch (currentContext.value) {
    case 'sale':
      return 'فاتورة بيع جديدة';
    case 'installment_sale':
      return 'فاتورة تقسيط جديدة';
    case 'purchase':
      return 'فاتورة شراء جديدة';
    default:
      return 'إنشاء فاتورة جديدة';
  }
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
      max_quantity: productItem.max_quantity || 0,
    };

    // Use purchase_price if it's a purchase invoice
    if (currentContext.value === 'purchases') {
      newItem.unit_price = newItem.purchase_price || 0;
    }

    newItem.quantity = productItem.quantity || 1;
    calculateItem(newItem);
    invoiceData.value.items.push(newItem);
  }
};

const handleQuickProductSave = product => {
  // If product has variants, add the first one by default for quick add
  if (product && product.variants?.length > 0) {
    const variant = product.variants[0];
    const item = {
      product_id: product.id,
      product_name: product.name,
      name: product.name,
      variant_id: variant.id,
      variant_name: variant.sku,
      attributes_text: variant.attributes
        ?.map(attr => attr.attribute_value?.name || attr.value?.name)
        .filter(Boolean)
        .join(' - '),
      quantity: 1,
      max_quantity: variant.quantity || 0,
      unit_price: currentContext.value === 'purchases' ? variant.purchase_price : variant.retail_price,
      retail_price: variant.retail_price || 0,
      wholesale_price: variant.wholesale_price || 0,
      purchase_price: variant.purchase_price || 0,
      discount: 0,
      primary_image_url: variant.primary_image_url || product.primary_image_url,
      product_type: product.product_type,
      requires_stock: product.require_stock,
    };
    addItem(item);
  } else if (product) {
    // Fallback for simple product structure if any
    const item = {
      product_id: product.id,
      name: product.name,
      quantity: 1,
      unit_price: currentContext.value === 'purchases' ? product.purchase_price : product.retail_price,
      product_type: product.product_type,
    };
    addItem(item);
  }
  isQuickAddProductOpen.value = false;
};

// Watch for customer changes to update prices dynamically
watch(
  () => selectedCustomerObj.value?.customer_type,
  newType => {
    if (!newType || (currentContext.value !== 'sale' && currentContext.value !== 'installment_sale')) return;

    invoiceData.value.items.forEach(item => {
      if (newType === 'wholesale') {
        item.unit_price = item.wholesale_price || item.retail_price || 0;
      } else {
        item.unit_price = item.retail_price || 0;
      }
      calculateItem(item);
    });
  }
);

// Sync installment calculator total if it's open
watch(
  () => financials.value.total_balance,
  newTotal => {
    if (appState.installmentCalc.isOpen && appState.installmentCalc.mode === 'invoice') {
      appState.installmentCalc.initialTotal = newTotal;
    }
  }
);

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
      previous_balance: financials.value.previous_balance,
    };

    // Only send installment plan if it's an installment sale AND there's actually a remaining balance
    if (currentContext.value === 'installment_sale' && financials.value.remaining_amount > 0 && !isInstallmentFinalized.value) {
      appState.openInstallmentCalc({
        mode: 'invoice',
        initialTotal: financials.value.total_balance,
        onSave: handleInstallmentConfirmation,
      });
      loading.value = false;
      return;
    }

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
    const [typesRes, whRes, cbRes] = await Promise.all([getInvoiceTypes(), getWarehouses(), getCashBoxes()]);
    invoiceTypes.value = typesRes.data || [];
    warehouses.value = whRes.data || [];
    cashBoxes.value = cbRes.data || [];

    if (!isEdit.value) {
      if (invoiceTypes.value.length > 0) {
        // Try to find type matching the initialType prop (passed from query param)
        const targetType = invoiceTypes.value.find(t => t.code === props.initialType);

        if (targetType) {
          invoiceData.value.invoice_type_id = targetType.id;
        } else {
          // Fallback to first type if specific type not found
          invoiceData.value.invoice_type_id = invoiceTypes.value[0].id;
        }
      }

      // Select default Warehouse
      const defaultWarehouse = warehouses.value.find(w => w.is_default);
      if (defaultWarehouse) {
        invoiceData.value.warehouse_id = defaultWarehouse.id;
      } else if (warehouses.value.length > 0) {
        invoiceData.value.warehouse_id = warehouses.value[0].id;
      }

      // Select default Cash Box
      const defaultCashBox = cashBoxes.value.find(cb => cb.is_default);
      if (defaultCashBox) {
        invoiceData.value.cash_box_id = defaultCashBox.id;
      } else if (cashBoxes.value.length > 0) {
        invoiceData.value.cash_box_id = cashBoxes.value[0].id;
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
    const response = await invoiceApi.getById(props.invoiceId);
    const invoice = response.data;

    // Direct assignment to ensure reactivity and correctness
    const data = {
      user_id: invoice.user_id,
      invoice_type_id: invoice.invoice_type_id,
      issue_date: invoice.issue_date?.substring(0, 10), // Ensure YYYY-MM-DD
      due_date: invoice.due_date?.substring(0, 10),
      warehouse_id: invoice.warehouse_id ? Number(invoice.warehouse_id) : null,
      reference_number: invoice.reference_number || '',
      tax_rate: parseFloat(invoice.tax_rate || 0),
      tax_inclusive: !!invoice.tax_inclusive,
      header_discount: parseFloat(invoice.total_discount || 0),
      paid_amount: parseFloat(invoice.paid_amount || 0),
      cash_box_id: invoice.cash_box_id ? Number(invoice.cash_box_id) : null,
      notes: invoice.notes || '',
      items: (invoice.items || []).map(item => ({
        product_id: item.product_id,
        variant_id: item.variant_id,
        name: item.name,
        quantity: parseFloat(item.quantity || 0),
        max_quantity: parseFloat(item.quantity || 0),
        requires_stock: item.requires_stock ?? true,
        unit_price: parseFloat(item.unit_price || 0),
        retail_price: parseFloat(item.retail_price || item.unit_price || 0),
        wholesale_price: parseFloat(item.wholesale_price || 0),
        profit_margin: parseFloat(item.profit_margin || 0),
        discount: parseFloat(item.discount || 0),
        total: parseFloat(item.total || 0),
        primary_image_url: item.primary_image_url || item.variant?.primary_image_url || item.product?.primary_image_url,
      })),
    };

    invoiceData.value = { ...invoiceData.value, ...data };

    // Pre-populate selected customer object for UI logic
    if (invoice.customer) {
      selectedCustomerObj.value = invoice.customer;
    }
  } catch (error) {
    console.error('Error fetching invoice:', error);
  } finally {
    loading.value = false;
  }
};

// ... watch ...

onMounted(async () => {
  await loadLookups();
  if (isEdit.value) {
    await fetchInvoice();
  }
});
</script>

<style scoped>
/* .invoice-form-container {
  min-height: 100vh;
} */
</style>
