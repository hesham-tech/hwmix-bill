<template>
  <div class="variant-manager">
    <div class="d-flex align-center justify-space-between mb-4 px-1">
      <div class="d-flex align-center gap-2">
        <v-avatar color="primary-lighten-5" size="32" class="rounded-md">
          <v-icon color="primary" size="small">ri-layout-grid-line</v-icon>
        </v-avatar>
        <h3 class="text-subtitle-1 font-weight-black">أصناف ومتغيرات المنتج</h3>
      </div>
      <v-btn color="primary" variant="flat" prepend-icon="ri-add-line" class="rounded-md" @click="addVariant"> إضافة متغير جديد </v-btn>
    </div>

    <v-expansion-panels v-model="activePanel" multiple class="variant-panels">
      <v-expansion-panel
        v-for="(variant, vIndex) in modelValue"
        :key="vIndex"
        class="mb-3 border rounded-md overflow-hidden elevation-0"
        :class="{ 'active-panel-border': activePanel.includes(vIndex) }"
      >
        <v-expansion-panel-title class="py-3">
          <div class="d-flex align-center gap-3 w-100 pe-4">
            <div class="variant-dot" :class="variant.sku ? 'bg-primary' : 'bg-grey-lighten-2'"></div>
            <AppAvatar
              :img-url="variant.images?.find(i => i.id === variant.primary_image_id || i.is_primary)?.url || variant.images?.[0]?.url"
              :name="variant.sku || 'Var'"
              size="40"
              rounded="md"
              type="product"
              class="mx-1"
            />
            <div class="d-flex flex-column">
              <span class="text-body-2 font-weight-bold">متغير #{{ vIndex + 1 }}</span>
              <span v-if="variant.sku" class="text-caption text-primary font-weight-medium">{{ variant.sku }}</span>
              <span v-else class="text-caption text-grey">لم يتم تحديد SKU</span>
            </div>

            <v-spacer />

            <!-- Quick Stats in Header -->
            <div class="d-none d-sm-flex align-center gap-4 me-4">
              <div class="d-flex flex-column align-end">
                <span class="text-caption text-grey">السعر</span>
                <span class="text-caption font-weight-bold text-success">{{ variant.retail_price || 0 }} ج.م</span>
              </div>
              <v-divider vertical class="mx-1" length="24" />
              <div class="d-flex flex-column align-end">
                <span class="text-caption text-grey">المخزون</span>
                <span class="text-caption font-weight-bold">{{ calculateTotalQty(variant) }} قطعة</span>
              </div>
            </div>

            <div class="d-flex gap-1">
              <v-btn
                icon="ri-file-copy-line"
                size="x-small"
                variant="tonal"
                color="primary"
                class="rounded-md"
                title="تكرار المتغير"
                @click.stop="duplicateVariant(vIndex)"
              />
              <v-btn
                icon="ri-delete-bin-line"
                size="x-small"
                variant="tonal"
                color="error"
                class="rounded-md"
                title="حذف المتغير"
                @click.stop="removeVariant(vIndex)"
              />
            </div>
          </div>
        </v-expansion-panel-title>

        <v-expansion-panel-text class="pa-0 border-t">
          <div class="pa-5">
            <!-- Phase 1: Identity & Prices -->
            <div class="d-flex align-center gap-2 mb-4">
              <v-icon icon="ri-price-tag-3-line" color="primary" size="small" />
              <span class="text-overline text-primary font-weight-black">الهوية والأسعار</span>
            </div>

            <v-row>
              <v-col cols="12" md="6">
                <AppInput v-model="variant.sku" label="SKU (كود الصنف)" placeholder="مثال: APP-IP15-BLK" />
              </v-col>
              <v-col cols="12" md="6">
                <AppInput v-model="variant.barcode" label="الباركود" placeholder="اتركه فارغاً للتوليد التلقائي" />
              </v-col>
              <v-col cols="12" md="4" v-if="can(PERMISSIONS.PRODUCTS_VIEW_PURCHASE_PRICE) || can(PERMISSIONS.ADMIN_SUPER) || can(PERMISSIONS.ADMIN_COMPANY)">
                <AppInput v-model.number="variant.purchase_price" label="سعر الشراء" type="number" prefix="ج.م" class="price-input" />
              </v-col>
              <v-col cols="12" md="4" v-if="can(PERMISSIONS.PRODUCTS_VIEW_WHOLESALE_PRICE) || can(PERMISSIONS.ADMIN_SUPER) || can(PERMISSIONS.ADMIN_COMPANY)">
                <AppInput v-model.number="variant.wholesale_price" label="سعر الجملة" type="number" prefix="ج.م" class="price-input" />
              </v-col>
              <v-col cols="12" md="4">
                <AppInput
                  v-model.number="variant.retail_price"
                  label="سعر القطاعي"
                  type="number"
                  required
                  prefix="ج.م"
                  class="price-input font-weight-bold"
                />
              </v-col>
            </v-row>

            <v-divider class="my-6" />

            <!-- Phase 2: Stock Breakdown (Moved Up) -->
            <div class="d-flex align-center justify-space-between mb-4">
              <div class="d-flex align-center gap-2">
                <v-icon icon="ri-store-2-line" color="primary" size="small" />
                <span class="text-overline text-primary font-weight-black">توزيع المخزون عبر الفروع</span>
              </div>
              <v-btn size="x-small" variant="tonal" color="primary" class="rounded-md" prepend-icon="ri-add-line" @click="addStock(vIndex)">
                إضافة فرع
              </v-btn>
            </div>

            <div class="stock-grid">
              <div v-for="(stock, sIndex) in variant.stocks" :key="sIndex" class="stock-card border rounded-md pa-3 bg-grey-lighten-5 mb-3">
                <v-row dense align="center">
                  <v-col cols="12" md="7">
                    <AppAutocomplete
                      v-model="stock.warehouse_id"
                      label="المستودع / الفرع"
                      api-endpoint="warehouses"
                      item-title="name"
                      item-value="id"
                      density="compact"
                      variant="outlined"
                      bg-color="white"
                      hide-details
                    />
                  </v-col>
                  <v-col cols="8" md="4">
                      <AppInput
                        v-model.number="stock.quantity"
                        label="الكمية المتوفرة"
                        type="number"
                        density="compact"
                        variant="outlined"
                        bg-color="white"
                        hide-details
                        placeholder="0"
                        prepend-inner-icon="ri-stack-line"
                        :readonly="!can(PERMISSIONS.STOCKS_MANUAL_ADJUSTMENT) && !can(PERMISSIONS.ADMIN_SUPER) && !can(PERMISSIONS.ADMIN_COMPANY)"
                        :hint="!can(PERMISSIONS.STOCKS_MANUAL_ADJUSTMENT) && !can(PERMISSIONS.ADMIN_SUPER) && !can(PERMISSIONS.ADMIN_COMPANY) ? 'ليس لديك صلاحية تعديل الكمية يدوياً' : ''"
                        persistent-hint
                      />
                  </v-col>
                  <v-col cols="4" md="1" class="d-flex justify-end">
                    <v-btn
                      v-if="sIndex !== 0"
                      icon="ri-delete-bin-7-line"
                      size="small"
                      variant="text"
                      color="error"
                      class="rounded-md"
                      :disabled="variant.stocks?.length <= 1"
                      :title="variant.stocks?.length <= 1 ? 'يجب وجود مستودع واحد على الأقل' : 'حذف المستودع'"
                      @click="removeStock(vIndex, sIndex)"
                    />
                  </v-col>
                </v-row>
              </div>

              <div v-if="!variant.stocks?.length" class="text-center py-6 border-dashed rounded-md bg-grey-lighten-5 mb-4">
                <v-icon icon="ri-error-warning-line" color="grey" class="mb-1" />
                <div class="text-caption text-grey">لم يتم تحديد مخزون لهذا المتغير بعد</div>
              </div>
            </div>

            <v-divider class="my-6" />

            <!-- Phase 3: Attributes Selection (Moved to End) -->
            <div class="d-flex align-center justify-space-between mb-4">
              <div class="d-flex align-center gap-2">
                <v-icon icon="ri-equalizer-line" color="primary" size="small" />
                <span class="text-overline text-primary font-weight-black">المواصفات والخصائص الفنية</span>
              </div>
              <v-btn size="x-small" variant="tonal" color="secondary" class="rounded-md" prepend-icon="ri-add-line" @click="addAttribute(vIndex)">
                إضافة صفة
              </v-btn>
            </div>

            <div v-if="!variant.attributes?.length" class="text-center py-6 border-dashed rounded-md mb-2 bg-grey-lighten-5">
              <v-icon icon="ri-list-settings-line" color="grey-lighten-1" class="mb-1" />
              <div class="text-caption text-grey">لا توجد مواصفات محددة (سيتم اعتباره كمتغير أساسي بدون خصائص)</div>
            </div>

            <div v-else class="attr-container d-flex flex-wrap gap-2 mb-2">
              <div
                v-for="(attr, aIndex) in variant.attributes"
                :key="aIndex"
                class="attr-pill-group d-flex align-center border rounded-md bg-white shadow-sm overflow-hidden"
              >
                <div class="attr-label-box bg-grey-lighten-4 px-3 py-2 border-e flex-grow-1 w-50">
                  <AppAutocomplete
                    v-model="attr.attribute_id"
                    label="الصفة"
                    api-endpoint="attributes"
                    item-title="name"
                    item-value="id"
                    density="compact"
                    variant="plain"
                    hide-details
                    class="attr-fixed-width"
                    can-create
                  />
                </div>
                <div class="attr-value-box px-3 py-2 flex-grow-1 w-50"">
                  <AppAutocomplete
                    v-if="attr.attribute_id"
                    v-model="attr.attribute_value_id"
                    label="القيمة"
                    :api-endpoint="`attribute-values?attribute_id=${attr.attribute_id}`"
                    item-title="name"
                    item-value="id"
                    density="compact"
                    variant="plain"
                    hide-details
                    class="attr-fixed-width"
                    can-create
                    create-field="name"
                  />
                  <div v-else class="text-caption text-grey-lighten-1 italic">اختر الصفة أولاً</div>
                </div>
                <v-btn icon="ri-close-line" size="x-small" variant="text" color="grey" class="mx-1" @click="removeAttribute(vIndex, aIndex)" />
              </div>
            </div>

            <v-divider class="my-6" />

            <!-- Phase 4: Variant Images -->
            <div class="d-flex align-center gap-2 mb-4">
              <v-icon icon="ri-image-line" color="primary" size="small" />
              <span class="text-overline text-primary font-weight-black">صور المتغير الخاص</span>
            </div>
            <ProductMediaManager
              v-model="variant.images"
              v-model:primaryImageId="variant.primary_image_id"
              class="mt-2"
            />
          </div>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import AppInput from '@/components/common/AppInput.vue';
import AppAutocomplete from '@/components/common/AppAutocomplete.vue';
import AppAvatar from '@/components/common/AppAvatar.vue';
import ProductMediaManager from './ProductMediaManager.vue';
import { usePermissions } from '@/composables/usePermissions';
import { PERMISSIONS } from '@/config/permissions';
import { useProductStore } from '../store/product.store';

const { can } = usePermissions();

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['update:modelValue']);

const productStore = useProductStore();
const activePanel = ref([0]);

const calculateTotalQty = variant => {
  return variant.stocks?.reduce((acc, s) => acc + (parseInt(s.quantity) || 0), 0) || 0;
};

const addVariant = async () => {
  const newVariants = [...props.modelValue];
  const lastVariant = newVariants.length > 0 ? newVariants[newVariants.length - 1] : null;

  if (lastVariant) {
    newVariants.push({
      purchase_price: lastVariant.purchase_price,
      wholesale_price: lastVariant.wholesale_price,
      retail_price: lastVariant.retail_price,
      sku: '',
      barcode: '',
      stocks: lastVariant.stocks.map(s => ({ warehouse_id: s.warehouse_id, quantity: 0 })),
      images: [],
      primary_image_id: null,
      attributes: lastVariant.attributes ? lastVariant.attributes.map(a => ({ ...a })) : [],
    });
  } else {
    const warehouseId = await productStore.fetchDefaultWarehouse();
    newVariants.push({
      purchase_price: 0,
      wholesale_price: 0,
      retail_price: 0,
      sku: '',
      barcode: '',
      stocks: [{ warehouse_id: warehouseId, quantity: 0 }],
      images: [],
      primary_image_id: null,
      attributes: [{ attribute_id: null, attribute_value_id: null }],
    });
  }

  emit('update:modelValue', newVariants);
  activePanel.value = [newVariants.length - 1];
};

const duplicateVariant = index => {
  const newVariants = [...props.modelValue];
  const source = newVariants[index];

  const clone = {
    ...JSON.parse(JSON.stringify(source)),
    id: undefined,
    sku: '',
    barcode: '',
    stocks: source.stocks.map(s => ({ ...s, quantity: 0, id: undefined })),
  };

  newVariants.splice(index + 1, 0, clone);
  emit('update:modelValue', newVariants);
  activePanel.value = [index + 1];
};

const removeVariant = index => {
  if (props.modelValue.length === 1) return;
  const newVariants = [...props.modelValue];
  newVariants.splice(index, 1);
  emit('update:modelValue', newVariants);
};

const addStock = async vIndex => {
  const newVariants = [...props.modelValue];
  const warehouseId = await productStore.fetchDefaultWarehouse();
  newVariants[vIndex].stocks.push({ warehouse_id: warehouseId, quantity: 0 });
  emit('update:modelValue', newVariants);
};

const removeStock = (vIndex, sIndex) => {
  if (props.modelValue[vIndex].stocks.length <= 1) return;
  const newVariants = [...props.modelValue];
  newVariants[vIndex].stocks.splice(sIndex, 1);
  emit('update:modelValue', newVariants);
};

const addAttribute = vIndex => {
  const newVariants = [...props.modelValue];
  if (!newVariants[vIndex].attributes) newVariants[vIndex].attributes = [];
  newVariants[vIndex].attributes.push({ attribute_id: null, attribute_value_id: null });
  emit('update:modelValue', newVariants);
};

const removeAttribute = (vIndex, aIndex) => {
  const newVariants = [...props.modelValue];
  newVariants[vIndex].attributes.splice(aIndex, 1);
  emit('update:modelValue', newVariants);
};
</script>

<style scoped>
.gap-1 {
  gap: 0.25rem;
}
.gap-2 {
  gap: 0.5rem;
}
.gap-3 {
  gap: 0.75rem;
}
.gap-4 {
  gap: 1rem;
}

.variant-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.active-panel-border {
  border: 1.5px solid var(--v-theme-primary) !important;
}

.attr-pill-group {
  min-width: 300px;
  flex: 1 1 300px;
  transition: all 0.2s ease-in-out;
}

.attr-pill-group:hover {
  border-color: var(--v-theme-primary) !important;
  box-shadow: 0 4px 12px rgba(var(--v-theme-primary), 0.1) !important;
}

.attr-fixed-width {
  min-width: 120px;
}

.attr-label-box {
  min-width: 140px;
}

.stock-card {
  transition: all 0.2s;
}

.stock-card:hover {
  background-color: white !important;
  border-color: var(--v-theme-primary) !important;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.border-dashed {
  border: 1.5px dashed rgba(0, 0, 0, 0.1);
}

.price-input :deep(input) {
  text-align: center;
}

:deep(.v-expansion-panel-text__wrapper) {
  padding: 0 !important;
}

/* Custom transitions */
.v-expansion-panel {
  transition: all 0.3s ease;
}
</style>
