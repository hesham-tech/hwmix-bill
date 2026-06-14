<template>
  <AppDialog
    v-model="isOpen"
    title="تحويل مخزني"
    icon="ri-arrow-left-right-line"
    max-width="650"
    :loading="loading"
    @confirm="handleSubmit"
    @close="close"
  >
    <v-form ref="form" v-model="isFormValid" class="pa-2">
      <!-- Source Warehouse Info -->
      <div v-if="warehouse" class="mb-4 pa-3 rounded-md bg-amber-lighten-5 border-warning border-dashed border-sm d-flex align-center">
        <v-icon icon="ri-building-4-line" class="me-2" color="warning" />
        <div>
          <div class="text-caption text-grey">المستودع المصدر:</div>
          <div class="font-weight-bold text-body-1">{{ warehouse.name }}</div>
        </div>
      </div>

      <!-- Destination Warehouse Selector -->
      <v-select
        v-model="toWarehouseId"
        :items="filteredWarehouses"
        item-title="name"
        item-value="id"
        label="المستودع المستهدف (التحويل إليه) *"
        placeholder="اختر المستودع المستهدف"
        density="comfortable"
        variant="outlined"
        required
        :rules="[v => !!v || 'المستودع المستهدف مطلوب']"
        class="mb-4"
      />

      <!-- Variant Search -->
      <ProductSelector
        v-if="warehouse"
        @add="selectVariant"
        :warehouse-id="warehouse.id"
        invoice-type="sales"
      />

      <!-- Transfer Items List -->
      <div v-if="items.length > 0" class="mt-6">
        <div class="text-subtitle-2 font-weight-bold mb-3 d-flex align-center">
          <v-icon icon="ri-list-check-line" size="small" class="me-2" color="primary" />
          الأصناف المراد تحويلها
        </div>

        <v-card v-for="(item, index) in items" :key="item.variant_id" border flat class="mb-3 pa-3 rounded-md overflow-hidden">
          <div class="d-flex align-center gap-3">
            <AppAvatar :img-url="item.primary_image_url" :name="item.name" size="48" rounded="md" border />
            <div class="flex-grow-1">
              <div class="font-weight-bold text-body-2">{{ item.name }}</div>
              <div class="text-caption text-grey">{{ item.variant_name }}</div>
            </div>
            <AppButton icon="ri-delete-bin-line" variant="text" color="error" density="comfortable" @click="removeItem(index)" />
          </div>

          <v-divider class="my-3 border-dashed" />

          <v-row dense class="align-center">
            <v-col cols="12" sm="6">
              <div class="text-caption text-grey mb-1">الكمية المتوفرة حالياً بالمنشأ</div>
              <div class="font-weight-bold text-success">{{ item.available_quantity || 0 }} قطعة</div>
            </v-col>
            <v-col cols="12" sm="6">
              <AppInput
                v-model.number="item.transfer_quantity"
                label="الكمية المراد نقلها *"
                type="number"
                density="compact"
                hide-details
                required
                :rules="[
                  v => !!v || 'الكمية مطلوبة',
                  v => v > 0 || 'يجب أن تكون الكمية أكبر من 0',
                  v => v <= item.available_quantity || 'الكمية غير متوفرة بالكامل في المصدر'
                ]"
              />
            </v-col>
          </v-row>
        </v-card>
      </div>

      <EmptyState
        v-else
        icon="ri-search-2-line"
        title="لم يتم اختيار أصناف بعد"
        message="ابحث عن المنتجات الفيزيائية المتوفرة في المستودع المصدر لإضافتها"
        class="mt-4"
      />
    </v-form>
  </AppDialog>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useApi } from '@/composables/useApi';
import { useUserStore } from '@/stores/user';
import AppDialog from '@/components/common/AppDialog.vue';
import AppInput from '@/components/common/AppInput.vue';
import AppButton from '@/components/common/AppButton.vue';
import AppAvatar from '@/components/common/AppAvatar.vue';
import EmptyState from '@/components/common/EmptyState.vue';
import ProductSelector from '@/modules/invoices/components/ProductSelector.vue';
import { toast } from 'vue3-toastify';

const props = defineProps({
  modelValue: Boolean,
  warehouse: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(['update:modelValue', 'success']);

const isOpen = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val),
});

const invoiceApi = useApi('/api/invoices');
const invoiceTypesApi = useApi('/api/invoice-types');
const warehousesApi = useApi('/api/warehouses');
const userStore = useUserStore();

const loading = ref(false);
const isFormValid = ref(false);
const form = ref(null);
const items = ref([]);
const allWarehouses = ref([]);
const toWarehouseId = ref(null);
const transferTypeId = ref(null);

// Fetch all warehouses
const loadWarehouses = async () => {
  try {
    const res = await warehousesApi.get({ per_page: -1 });
    allWarehouses.value = (res.data || []).map(item => ({
      ...item,
      is_active: item.status === 'active',
    }));
  } catch (error) {
    console.error('Failed to load warehouses:', error);
  }
};

// Filter out the source warehouse from destinations
const filteredWarehouses = computed(() => {
  if (!props.warehouse) return allWarehouses.value;
  return allWarehouses.value.filter(w => w.id !== props.warehouse.id && w.is_active);
});

// Load the stock_transfer invoice type ID
const loadTransferType = async () => {
  try {
    const res = await invoiceTypesApi.get();
    const types = res.data || [];
    const tType = types.find(t => t.code === 'stock_transfer');
    if (tType) {
      transferTypeId.value = tType.id;
    }
  } catch (error) {
    console.error('Failed to load invoice types:', error);
  }
};

onMounted(() => {
  loadWarehouses();
  loadTransferType();
});

// Reset destination warehouse and items when opening dialog
watch(isOpen, (newVal) => {
  if (newVal) {
    toWarehouseId.value = null;
    items.value = [];
    loadWarehouses();
  }
});

const selectVariant = productItem => {
  // Only allow physical products for stock transfer
  if (productItem.product_type !== 'physical' || !productItem.requires_stock) {
    toast.warning('يمكن تحويل المنتجات الفيزيائية فقط');
    return;
  }

  // Ensure item has stock in the source warehouse
  if (!productItem.quantity || productItem.quantity <= 0) {
    toast.warning('هذا المنتج لا يحتوي على مخزون كافٍ في مستودع المنشأ للتحويل');
    return;
  }

  const existing = items.value.find(i => i.variant_id === productItem.variant_id);
  if (!existing) {
    items.value.push({
      ...productItem,
      available_quantity: productItem.quantity,
      transfer_quantity: 1,
    });
  } else {
    toast.info('تمت إضافة المنتج بالفعل لقائمة التحويل');
  }
};

const removeItem = index => {
  items.value.splice(index, 1);
};

const handleSubmit = async () => {
  const { valid } = await form.value.validate();
  if (!valid || items.value.length === 0) return;

  if (!transferTypeId.value) {
    toast.error('لم يتم تحميل نوع المستند الخاص بالتحويل المخزني بعد.');
    return;
  }

  loading.value = true;
  try {
    const payload = {
      invoice_type_id: transferTypeId.value,
      invoice_type_code: 'stock_transfer',
      warehouse_id: props.warehouse.id,
      to_warehouse_id: toWarehouseId.value,
      gross_amount: 0,
      net_amount: 0,
      user_id: userStore.currentUser?.id || 1,
      items: items.value.map(item => ({
        product_id: item.product_id,
        variant_id: item.variant_id,
        name: item.name,
        quantity: item.transfer_quantity,
        unit_price: 0,
        total: 0,
      })),
    };

    await invoiceApi.create(payload);
    toast.success('تمت عملية التحويل المخزني بنجاح');
    emit('success');
    close();
  } catch (error) {
    console.error('Failed to transfer stock:', error);
  } finally {
    loading.value = false;
  }
};

const close = () => {
  isOpen.value = false;
  items.value = [];
  toWarehouseId.value = null;
};
</script>

<style scoped>
.border-dashed {
  border-style: dashed !important;
}
.border-sm {
  border-width: 1px !important;
}
</style>
