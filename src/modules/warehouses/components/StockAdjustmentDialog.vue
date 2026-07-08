<template>
  <AppDialog
    v-model="isOpen"
    title="تعديل المخزون"
    icon="ri-equalizer-line"
    max-width="600"
    :loading="loading"
    @confirm="handleSubmit"
    @close="close"
  >
    <v-form ref="form" v-model="isFormValid" class="pa-2">
      <div v-if="warehouse" class="mb-2 pa-4 rounded-md bg-primary-lighten-5 border-primary border-dashed border-sm">
        <div class="text-caption text-primary font-weight-bold mb-1">المستودع المحدد:</div>
        <div class="text-h6 font-weight-bold text-primary">{{ warehouse.name }}</div>
      </div>

      <!-- Variant Search -->
      <ProductSelector @add="selectVariant" :warehouse-id="warehouse?.id" invoice-type="sales" />

      <!-- Adjustment List -->
      <div v-if="items.length > 0" class="mt-6">
        <div class="text-subtitle-2 font-weight-bold mb-3 d-flex align-center">
          <v-icon icon="ri-list-check-line" size="small" class="me-2" color="primary" />
          البنود المراد تعديلها
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

          <v-row dense>
            <v-col cols="12" sm="6">
              <div class="text-caption text-grey mb-1">الكمية الحالية</div>
              <div class="font-weight-bold">{{ item.current_quantity || 0 }}</div>
            </v-col>
            <v-col cols="12" sm="6">
              <AppInput
                v-model.number="item.quantity"
                label="الكمية الجديدة *"
                type="number"
                density="compact"
                hide-details
                required
                :rules="[v => v !== null || 'مطلوب']"
              />
            </v-col>
          </v-row>
        </v-card>
      </div>

      <EmptyState
        v-else
        icon="ri-search-2-line"
        title="لم يتم اختيار أصناف"
        message="ابحث عن المنتجات الفيزيائية أعلاه لإضافتها لقائمة التعديل"
        class="mt-4"
      />
    </v-form>
  </AppDialog>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useApi } from '@/composables/useApi';
import { useUserStore } from '@/stores/user';
import AppDialog from '@/components/common/AppDialog.vue';
import AppInput from '@/components/common/AppInput.vue';
import AppButton from '@/components/common/AppButton.vue';
import AppAvatar from '@/components/common/AppAvatar.vue';
import EmptyState from '@/components/common/EmptyState.vue';
import ProductSelector from '@/modules/invoices/components/ProductSelector.vue';
import notificationManager from '@/services/notificationManager';

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
const userStore = useUserStore();

const loading = ref(false);
const isFormValid = ref(false);
const form = ref(null);
const items = ref([]);
const adjustmentTypeId = ref(null);

const loadAdjustmentType = async () => {
  try {
    const res = await invoiceTypesApi.get();
    const types = res.data || [];
    const adjType = types.find(t => t.code === 'inventory_adjustment');
    if (adjType) {
      adjustmentTypeId.value = adjType.id;
    }
  } catch (error) {
    console.error('Failed to load invoice types:', error);
  }
};

onMounted(() => {
  loadAdjustmentType();
});

const selectVariant = productItem => {
  // Only allow physical products for stock adjustment
  if (productItem.product_type !== 'physical' || !productItem.requires_stock) {
    notificationManager.warning('يمكن تعديل مخزون المنتجات الفيزيائية فقط');
    return;
  }

  const existing = items.value.find(i => i.variant_id === productItem.variant_id);
  if (!existing) {
    items.value.push({
      ...productItem,
      current_quantity: productItem.quantity,
      quantity: productItem.quantity,
    });
  }
};

const removeItem = index => {
  items.value.splice(index, 1);
};

const handleSubmit = async () => {
  const { valid } = await form.value.validate();
  if (!valid || items.value.length === 0) return;

  if (!adjustmentTypeId.value) {
    notificationManager.error('لم يتم تحميل نوع الفاتورة الخاص بالتسوية المخزنية بعد.');
    return;
  }

  loading.value = true;
  try {
    const payload = {
      invoice_type_id: adjustmentTypeId.value,
      invoice_type_code: 'inventory_adjustment',
      warehouse_id: props.warehouse.id,
      gross_amount: 0,
      net_amount: 0,
      user_id: userStore.currentUser?.id || 1,
      items: items.value.map(item => ({
        product_id: item.product_id,
        variant_id: item.variant_id,
        name: item.name,
        quantity: item.quantity,
        unit_price: 0,
        total: 0,
      })),
    };

    await invoiceApi.create(payload);
    notificationManager.success('تم تعديل المخزون بنجاح');
    emit('success');
    close();
  } catch (error) {
    console.error('Failed to adjust stock:', error);
  } finally {
    loading.value = false;
  }
};

const close = () => {
  isOpen.value = false;
  items.value = [];
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
