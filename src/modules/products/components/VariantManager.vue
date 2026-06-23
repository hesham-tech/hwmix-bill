<template>
  <div class="variant-manager">

    <!-- ===== Shell ===== -->
    <div class="vm-shell border rounded-lg overflow-hidden">

      <!-- ===== Header: Variant Tabs + Add Button ===== -->
      <div class="vm-header d-flex align-center border-b bg-grey-lighten-5">

        <!-- Tabs Scroller -->
        <div class="vm-tabs-scroll d-flex align-center flex-1 overflow-x-auto pa-1" style="scrollbar-width:none;">
          <button
            v-for="(variant, vIndex) in modelValue"
            :key="vIndex"
            type="button"
            class="vm-tab-btn"
            :class="{ 'vm-tab-btn--active': activeVariantIndex === vIndex }"
            @click="switchVariant(vIndex)"
          >
            <!-- Thumbnail or colored dot -->
            <v-avatar v-if="getVariantThumbnail(variant)" size="22" class="rounded-md border flex-shrink-0" style="border-color:rgba(0,0,0,0.1)!important">
              <v-img :src="getVariantThumbnail(variant)" cover crossorigin="anonymous" />
            </v-avatar>
            <span v-else class="vm-variant-dot flex-shrink-0" :class="variant.retail_price ? 'vm-variant-dot--done' : 'vm-variant-dot--empty'" />

            <!-- Label area -->
            <div class="vm-tab-info">
              <div class="vm-tab-name">متغير {{ vIndex + 1 }}</div>
              <!-- mini stats row -->
              <div class="vm-tab-stats d-flex align-center" style="gap:6px;">
                <span v-if="variant.retail_price" class="vm-stat vm-stat--price">
                  <v-icon icon="ri-money-dollar-circle-line" size="9" />{{ variant.retail_price }}
                </span>
                <span v-if="productType === 'physical' && calculateTotalQty(variant) > 0" class="vm-stat vm-stat--stock">
                  <v-icon icon="ri-archive-line" size="9" />{{ calculateTotalQty(variant) }}
                </span>
                <template v-for="attr in getVariantAttributesList(variant)" :key="attr.name">
                  <span class="vm-stat vm-stat--attr" :style="attr.color ? { color: attr.color } : {}">{{ attr.name }}</span>
                </template>
              </div>
            </div>

            <!-- Delete btn (on hover) -->
            <v-btn
              v-if="vIndex > 0"
              icon="ri-close-line"
              size="x-small"
              variant="text"
              color="error"
              density="compact"
              class="vm-delete-btn ms-1"
              :title="'حذف متغير #' + (vIndex + 1)"
              @click.stop="removeVariant(vIndex)"
            />
          </button>
        </div>

        <!-- Add variant + count chip -->
        <div class="d-flex align-center gap-2 pe-2 flex-shrink-0">
          <v-chip v-if="modelValue.length > 0" size="x-small" color="primary" variant="tonal" density="compact">
            {{ modelValue.length }} متغير
          </v-chip>
          <v-btn
            size="x-small"
            variant="tonal"
            color="primary"
            density="compact"
            prepend-icon="ri-add-line"
            class="rounded-md"
            @click="addVariant"
          >
            إضافة
          </v-btn>
        </div>
      </div>

      <!-- ===== Content: Flat variant body (no sub-tabs) ===== -->
      <div v-if="modelValue.length > 0 && currentVariant" class="vm-body bg-white">

        <!-- ── Section: الأسعار ── -->
        <div class="vm-section">
          <div class="vm-section-label">
            <v-icon icon="ri-price-tag-3-line" size="12" class="me-1" color="green-darken-2" />
            الأسعار
          </div>
          <div class="vm-section-content">
            <v-row dense>
              <v-col cols="6" sm="3" v-if="can(PERMISSIONS.PRODUCTS_VIEW_PURCHASE_PRICE)">
                <AppInput
                  v-model.number="currentVariant.purchase_price"
                  label="سعر الشراء *"
                  type="number"
                  prefix="ج.م"
                  class="price-input"
                  density="compact"
                  hide-details="auto"
                  :rules="purchasePriceRules"
                  @update:model-value="calculateProfitFromPrices(currentVariant)"
                />
              </v-col>
              <v-col cols="6" sm="3" v-if="can(PERMISSIONS.PRODUCTS_VIEW_WHOLESALE_PRICE)">
                <AppInput
                  v-model.number="currentVariant.wholesale_price"
                  label="سعر الجملة"
                  type="number"
                  prefix="ج.م"
                  class="price-input"
                  density="compact"
                  hide-details="auto"
                />
              </v-col>
              <v-col cols="6" sm="3">
                <AppInput
                  v-model.number="currentVariant.retail_price"
                  label="سعر القطاعي *"
                  type="number"
                  prefix="ج.م"
                  class="price-input"
                  density="compact"
                  hide-details="auto"
                  :rules="retailPriceRules"
                  @update:model-value="calculateProfitFromPrices(currentVariant)"
                />
              </v-col>
              <v-col cols="6" sm="3" v-if="can(PERMISSIONS.PRODUCTS_VIEW_PURCHASE_PRICE)">
                <AppInput
                  v-model.number="currentVariant.profit_margin"
                  label="هامش الربح %"
                  type="number"
                  prefix="%"
                  class="price-input"
                  density="compact"
                  hide-details="auto"
                  @update:model-value="calculatePriceFromProfit(currentVariant)"
                />
              </v-col>
            </v-row>

            <!-- Profit Indicators -->
            <v-row
              dense
              class="mt-2"
              v-if="can(PERMISSIONS.PRODUCTS_VIEW_PURCHASE_PRICE) && currentVariant.purchase_price && (currentVariant.wholesale_price || currentVariant.retail_price)"
            >
              <v-col cols="6" v-if="currentVariant.wholesale_price && can(PERMISSIONS.PRODUCTS_VIEW_WHOLESALE_PRICE)">
                <v-alert :color="getProfitColor(currentVariant, 'wholesale')" variant="tonal" density="compact" class="pa-2" :icon="getProfitIcon(currentVariant, 'wholesale')">
                  <div class="d-flex align-center justify-space-between">
                    <span class="text-xxs font-weight-bold">ربح الجملة</span>
                    <v-chip size="x-small" :color="getProfitColor(currentVariant, 'wholesale')" variant="flat" density="compact">{{ calculateProfitMargin(currentVariant, 'wholesale') }}%</v-chip>
                  </div>
                  <div class="text-xxs mt-1 text-grey-darken-1">{{ calculateProfitAmount(currentVariant, 'wholesale') }} ج.م / وحدة</div>
                </v-alert>
              </v-col>
              <v-col cols="6" v-if="currentVariant.retail_price">
                <v-alert :color="getProfitColor(currentVariant, 'retail')" variant="tonal" density="compact" class="pa-2" :icon="getProfitIcon(currentVariant, 'retail')">
                  <div class="d-flex align-center justify-space-between">
                    <span class="text-xxs font-weight-bold">ربح القطاعي</span>
                    <v-chip size="x-small" :color="getProfitColor(currentVariant, 'retail')" variant="flat" density="compact">{{ calculateProfitMargin(currentVariant, 'retail') }}%</v-chip>
                  </div>
                  <div class="text-xxs mt-1 text-grey-darken-1">{{ calculateProfitAmount(currentVariant, 'retail') }} ج.م / وحدة</div>
                </v-alert>
              </v-col>
            </v-row>

            <!-- SKU & Barcode -->
            <v-row dense class="mt-2">
              <v-col cols="12" sm="6">
                <AppInput v-model="currentVariant.sku" label="SKU — كود الصنف" placeholder="مثال: SHIRT-RED-XL" prepend-inner-icon="ri-hashtag" density="compact" hide-details="auto" />
              </v-col>
              <v-col cols="12" sm="6">
                <AppInput v-model="currentVariant.barcode" label="الباركود" placeholder="اتركه فارغاً للتوليد التلقائي" prepend-inner-icon="ri-barcode-line" density="compact" hide-details="auto" />
              </v-col>
            </v-row>
          </div>
        </div>

        <v-divider />

        <!-- ── Section: المخزون (physical only) ── -->
        <div v-if="productType === 'physical'" class="vm-section">
          <div class="vm-section-label">
            <v-icon icon="ri-store-2-line" size="12" class="me-1" color="blue-darken-2" />
            المخزون
            <v-chip v-if="calculateTotalQty(currentVariant) > 0" size="x-small" color="success" variant="flat" density="compact" class="ms-auto">
              إجمالي: {{ calculateTotalQty(currentVariant) }}
            </v-chip>
            <v-btn size="x-small" variant="tonal" color="primary" density="compact" prepend-icon="ri-add-line" class="rounded-md ms-2" @click="addStock(activeVariantIndex)">
              إضافة فرع
            </v-btn>
          </div>
          <div class="vm-section-content">
            <!-- Stock rows -->
            <div
              v-for="(stock, sIndex) in currentVariant.stocks"
              :key="sIndex"
              class="stock-card border rounded-lg pa-2 mb-2"
            >
              <div class="d-flex align-center justify-space-between mb-2">
                <span class="text-xxs text-grey font-weight-bold">
                  <v-icon icon="ri-store-2-line" size="10" color="grey" class="me-1" />
                  فرع / مستودع #{{ sIndex + 1 }}
                </span>
                <v-btn v-if="sIndex !== 0" icon="ri-delete-bin-7-line" size="x-small" variant="text" color="error" density="compact" :disabled="currentVariant.stocks?.length <= 1" @click="removeStock(activeVariantIndex, sIndex)" />
              </div>
              <v-row dense align="center">
                <v-col cols="12" sm="5">
                  <AppAutocomplete v-model="stock.warehouse_id" label="المستودع / الفرع" api-endpoint="warehouses" item-title="name" item-value="id" density="compact" variant="outlined" hide-details prepend-inner-icon="ri-store-2-line" />
                </v-col>
                <v-col cols="6" sm="4">
                  <AppInput v-model.number="stock.quantity" label="الكمية *" type="number" density="compact" variant="outlined" hide-details="auto" placeholder="0" prepend-inner-icon="ri-stack-line" :rules="stockRules" :readonly="!can(PERMISSIONS.STOCKS_MANUAL_ADJUSTMENT) && !can(PERMISSIONS.ADMIN_SUPER) && !can(PERMISSIONS.ADMIN_COMPANY)" />
                </v-col>
                <v-col cols="6" sm="3">
                  <v-select v-model="stock.unit_id" :items="filteredUnits" item-title="name" item-value="id" label="الوحدة" variant="outlined" density="compact" hide-details="auto" :disabled="!selectedGroup" :placeholder="!selectedGroup ? 'اختر مجموعة أولاً' : ''">
                    <template #prepend-inner><v-icon icon="ri-scales-3-line" size="14" color="grey" /></template>
                  </v-select>
                </v-col>
              </v-row>
            </div>

            <!-- Empty stock state -->
            <div v-if="!currentVariant.stocks?.length" class="text-center py-5 border-dashed rounded-lg">
              <v-icon icon="ri-store-2-line" color="grey-lighten-2" size="24" />
              <div class="text-xxs text-grey mt-1">لا يوجد مستودع محدد</div>
              <v-btn size="x-small" variant="tonal" color="primary" class="mt-2 rounded-md" prepend-icon="ri-add-line" @click="addStock(activeVariantIndex)">إضافة مستودع</v-btn>
            </div>
          </div>
        </div>

        <v-divider />

        <!-- ── Section: الصفات ── -->
        <div class="vm-section">
          <div class="vm-section-label">
            <v-icon icon="ri-equalizer-line" size="12" class="me-1" color="purple-darken-2" />
            الصفات
            <v-btn size="x-small" variant="tonal" color="secondary" density="compact" prepend-icon="ri-add-line" class="rounded-md ms-auto" @click="addAttribute(activeVariantIndex)">
              إضافة صفة
            </v-btn>
          </div>
          <div class="vm-section-content">
            <div v-if="!currentVariant.attributes?.length" class="text-center py-5 border-dashed rounded-lg">
              <v-icon icon="ri-list-settings-line" color="grey-lighten-2" size="24" />
              <div class="text-xxs text-grey mt-1">لا توجد مواصفات بعد</div>
            </div>
            <div v-else class="d-flex flex-wrap gap-2">
              <div
                v-for="(attr, aIndex) in currentVariant.attributes"
                :key="aIndex"
                class="attr-pill-group d-flex align-center border rounded-lg bg-white overflow-hidden"
              >
                <div class="attr-label-box bg-grey-lighten-5 px-2 py-2 border-e">
                  <AppAutocomplete v-model="attr.attribute_id" label="الصفة" :items="attributeList" item-title="name" item-value="id" density="compact" variant="plain" hide-details class="attr-input">
                    <template #no-data>
                      <v-list-item @click="openCreateAttributeDialog(activeVariantIndex, aIndex)">
                        <template #prepend><v-icon color="primary" icon="ri-add-line" /></template>
                        <v-list-item-title>إضافة خاصية جديدة...</v-list-item-title>
                      </v-list-item>
                    </template>
                  </AppAutocomplete>
                </div>
                <div class="attr-value-box px-2 py-2">
                  <AppAutocomplete v-if="attr.attribute_id" v-model="attr.attribute_value_id" label="القيمة" :items="attributeValuesMap[attr.attribute_id] || []" item-title="name" item-value="id" density="compact" variant="plain" hide-details class="attr-input">
                    <template #no-data>
                      <v-list-item @click="openCreateValueDialog(attr.attribute_id, activeVariantIndex, aIndex)">
                        <template #prepend><v-icon color="primary" icon="ri-add-line" /></template>
                        <v-list-item-title>إضافة قيمة...</v-list-item-title>
                      </v-list-item>
                    </template>
                    <template #selection="{ item }">
                      <v-chip v-if="item?.raw?.color" size="small" :style="{ backgroundColor: item.raw.color, color: getContrastColor(item.raw.color) }">{{ item.raw.name }}</v-chip>
                      <span v-else-if="item?.raw">{{ item.raw.name }}</span>
                    </template>
                    <template #item="{ props: ip, item }">
                      <v-list-item v-if="item?.raw" v-bind="ip" :style="item.raw.color ? { backgroundColor: item.raw.color, color: getContrastColor(item.raw.color) } : {}" />
                    </template>
                  </AppAutocomplete>
                  <div v-else class="text-xxs text-grey italic pa-1">اختر الصفة أولاً</div>
                </div>
                <v-btn icon="ri-close-line" size="x-small" variant="text" color="grey" class="mx-1" @click="removeAttribute(activeVariantIndex, aIndex)" />
              </div>
            </div>
          </div>
        </div>

        <v-divider />

        <!-- ── Section: الصور ── -->
        <div class="vm-section">
          <div class="vm-section-label">
            <v-icon icon="ri-image-line" size="12" class="me-1" color="teal-darken-2" />
            الصور
            <span v-if="currentVariant.images?.length" class="ms-auto">
              <v-chip size="x-small" color="teal" variant="tonal" density="compact">{{ currentVariant.images.length }} صورة</v-chip>
            </span>
          </div>
          <div class="vm-section-content">
            <ProductMediaManager v-model="currentVariant.images" v-model:primaryImageId="currentVariant.primary_image_id" />
          </div>
        </div>
      </div>

      <!-- Empty State (no variants) -->
      <div v-if="!modelValue.length" class="vm-empty pa-8 text-center bg-white">
        <v-icon icon="ri-layout-grid-line" color="grey-lighten-2" size="48" class="mb-3" />
        <div class="text-body-2 font-weight-bold text-grey-darken-1 mb-1">لا توجد متغيرات بعد</div>
        <div class="text-caption text-grey mb-4">أضف متغيراً واحداً على الأقل لتحديد السعر والمخزون</div>
        <v-btn color="primary" variant="flat" prepend-icon="ri-add-line" @click="addVariant">
          إضافة أول متغير
        </v-btn>
      </div>
    </div>

    <!-- ===== Summary Table ===== -->
    <div v-if="modelValue.length > 0" class="vm-summary-table mt-4 border rounded-lg overflow-hidden">
      <div class="summary-header d-flex align-center justify-space-between pa-2 bg-grey-lighten-5 border-b">
        <div class="d-flex align-center gap-2">
          <v-icon icon="ri-table-2" color="grey-darken-1" size="14" />
          <span class="text-xxs font-weight-bold text-grey-darken-1">جدول ملخص جميع المتغيرات</span>
        </div>
        <v-btn size="x-small" variant="text" color="grey" :icon="summaryCollapsed ? 'ri-arrow-down-s-line' : 'ri-arrow-up-s-line'" density="compact" @click="summaryCollapsed = !summaryCollapsed" />
      </div>
      <v-expand-transition>
        <div v-if="!summaryCollapsed" class="overflow-x-auto">
          <table class="summary-table w-100">
            <thead>
              <tr>
                <th class="text-start">#</th>
                <th class="text-start">SKU</th>
                <th class="text-start">الصفات</th>
                <th v-if="can(PERMISSIONS.PRODUCTS_VIEW_PURCHASE_PRICE)" class="text-end">سعر الشراء</th>
                <th v-if="can(PERMISSIONS.PRODUCTS_VIEW_WHOLESALE_PRICE)" class="text-end">سعر الجملة</th>
                <th class="text-end">سعر القطاعي</th>
                <th class="text-center">هامش الربح</th>
                <th v-if="productType === 'physical'" class="text-end">إجمالي المخزون</th>
                <th class="text-center">الصور</th>
                <th class="text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(variant, vIdx) in modelValue"
                :key="vIdx"
                class="summary-row"
                :class="{ 'summary-row--active': activeVariantIndex === vIdx }"
                @click="switchVariant(vIdx)"
              >
                <td>
                  <div class="d-flex align-center gap-1">
                    <div class="v-dot flex-shrink-0" :class="variant.retail_price ? 'bg-success' : 'bg-grey-lighten-2'" />
                    <span>{{ vIdx + 1 }}</span>
                  </div>
                </td>
                <td class="text-primary font-weight-medium">{{ variant.sku || '—' }}</td>
                <td>
                  <div class="d-flex flex-wrap gap-1">
                    <template v-for="attr in variant.attributes" :key="attr.attribute_id">
                      <v-chip v-if="attr.attribute_id && attr.attribute_value_id" size="x-small" variant="tonal" color="secondary" density="compact" class="text-xxs">
                        {{ getAttributeLabel(attr) }}
                      </v-chip>
                    </template>
                    <span v-if="!hasAttributes(variant)" class="text-grey text-xxs">—</span>
                  </div>
                </td>
                <td v-if="can(PERMISSIONS.PRODUCTS_VIEW_PURCHASE_PRICE)" class="text-end">{{ variant.purchase_price || '—' }}</td>
                <td v-if="can(PERMISSIONS.PRODUCTS_VIEW_WHOLESALE_PRICE)" class="text-end">{{ variant.wholesale_price || '—' }}</td>
                <td class="text-end font-weight-bold">{{ variant.retail_price || '—' }}</td>
                <td class="text-center">
                  <v-chip v-if="variant.purchase_price && variant.retail_price" size="x-small" :color="getProfitColor(variant, 'retail')" variant="flat" density="compact" class="font-weight-bold">
                    {{ calculateProfitMargin(variant, 'retail') }}%
                  </v-chip>
                  <span v-else class="text-grey text-xxs">—</span>
                </td>
                <td v-if="productType === 'physical'" class="text-end font-weight-bold">{{ calculateTotalQty(variant) || '—' }}</td>
                <td class="text-center">
                  <v-badge :content="variant.images?.length || 0" color="primary" inline size="x-small" />
                </td>
                <td class="text-center">
                  <div class="d-flex justify-center gap-1">
                    <v-btn icon="ri-edit-line" size="x-small" variant="text" color="primary" density="compact" :title="'تعديل متغير #' + (vIdx + 1)" @click.stop="switchVariant(vIdx)" />
                    <v-btn v-if="vIdx > 0" icon="ri-delete-bin-line" size="x-small" variant="text" color="error" density="compact" :title="'حذف متغير #' + (vIdx + 1)" @click.stop="removeVariant(vIdx)" />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </v-expand-transition>
    </div>

    <!-- Dialogs -->
    <AttributeFormDialog v-model="showAttrDialog" @saved="handleAttributeSaved" />
    <AttributeValueFormDialog v-if="selectedAttributeForValue" v-model="showValueDialog" :attribute="selectedAttributeForValue" @saved="handleValueSaved" />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';

const stockRules = [
  v => (v !== null && v !== undefined && v !== '') || 'قيمة المخزون مطلوبة',
  v => !isNaN(parseFloat(v)) && isFinite(v) && parseFloat(v) >= 0 || 'يجب إدخال رقم صحيح أو عشري',
];

// قواعد سعر الشراء (إجباري، > 0)
const purchasePriceRules = [
  v => (v !== null && v !== undefined && v !== '') || 'سعر الشراء مطلوب',
  v => (parseFloat(v) > 0) || 'يجب أن يكون سعر الشراء أكبر من صفر',
];

// قواعد سعر القطاعي (إجباري، > 0)
const retailPriceRules = [
  v => (v !== null && v !== undefined && v !== '') || 'سعر القطاعي مطلوب',
  v => (parseFloat(v) > 0) || 'يجب أن يكون سعر البيع أكبر من صفر',
];

import AppInput from '@/components/common/AppInput.vue';
import AppAutocomplete from '@/components/common/AppAutocomplete.vue';
import ProductMediaManager from './ProductMediaManager.vue';
import AttributeFormDialog from './AttributeFormDialog.vue';
import AttributeValueFormDialog from './AttributeValueFormDialog.vue';
import { usePermissions } from '@/composables/usePermissions';
import { PERMISSIONS } from '@/config/permissions';
import { useProductStore } from '../store/product.store';
import { useApi } from '@/composables/useApi';
import { getContrastColor } from '@/utils/helpers';

const { can } = usePermissions();

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  productType: { type: String, default: 'physical' },
  units: { type: Array, default: () => [] },
  selectedGroup: { type: Number, default: null },
  baseUnitId: { type: [Number, String], default: null },
});

const emit = defineEmits(['update:modelValue']);

const productStore = useProductStore();

// حالة النشاط
const activeVariantIndex = ref(0);
const summaryCollapsed = ref(false);

// المتغير النشط حالياً
const currentVariant = computed(() => props.modelValue[activeVariantIndex.value] ?? null);

const switchVariant = (idx) => {
  activeVariantIndex.value = idx;
};

// فلترة وحدات القياس
const filteredUnits = computed(() => {
  if (!props.selectedGroup) return [];
  return props.units.filter(u => u.unit_group_id === props.selectedGroup);
});

// تعيين وحدة المخزون الافتراضية
watch(
  () => props.baseUnitId,
  (newVal) => {
    if (newVal) {
      props.modelValue.forEach(v => {
        v.stocks?.forEach(s => { if (!s.unit_id) s.unit_id = newVal; });
      });
    }
  },
  { immediate: true }
);

// تصحيح activeVariantIndex إذا تم حذف متغير
watch(
  () => props.modelValue.length,
  (len) => {
    if (activeVariantIndex.value >= len) {
      activeVariantIndex.value = Math.max(0, len - 1);
    }
  }
);

// حسابات المخزون والصفات
const calculateTotalQty = (variant) =>
  variant?.stocks?.reduce((acc, s) => acc + (parseFloat(s.quantity) || 0), 0) || 0;

const hasAttributes = (variant) =>
  variant?.attributes?.some(a => a.attribute_id && a.attribute_value_id) || false;

const getVariantAttributesList = (variant) => {
  if (!variant?.attributes) return [];
  return variant.attributes
    .map(attr => {
      const attribute = attributeList.value.find(a => a.id === attr.attribute_id);
      const value = attribute?.values?.find(v => v.id === attr.attribute_value_id);
      if (!value) return null;
      return { name: value.name, color: value.color || null };
    })
    .filter(Boolean);
};

const getVariantThumbnail = (variant) => {
  if (!variant?.images?.length) return null;
  const primary = variant.images.find(img => img.id === variant.primary_image_id || img.is_primary);
  return primary ? primary.url : variant.images[0].url;
};

const getAttributeLabel = (attr) => {
  const attribute = attributeList.value.find(a => a.id === attr.attribute_id);
  const value = attribute?.values?.find(v => v.id === attr.attribute_value_id);
  return value ? value.name : '...';
};

// حسابات الربح
const calculateProfitMargin = (variant, priceType = 'retail') => {
  const purchase = parseFloat(variant.purchase_price) || 0;
  const sale = priceType === 'wholesale' ? parseFloat(variant.wholesale_price) || 0 : parseFloat(variant.retail_price) || 0;
  if (purchase === 0) return 0;
  return ((sale - purchase) / purchase * 100).toFixed(1);
};

const calculateProfitAmount = (variant, priceType = 'retail') => {
  const purchase = parseFloat(variant.purchase_price) || 0;
  const sale = priceType === 'wholesale' ? parseFloat(variant.wholesale_price) || 0 : parseFloat(variant.retail_price) || 0;
  return (sale - purchase).toFixed(0);
};

const getProfitColor = (variant, priceType = 'retail') => {
  const purchase = parseFloat(variant.purchase_price) || 0;
  const sale = priceType === 'wholesale' ? parseFloat(variant.wholesale_price) || 0 : parseFloat(variant.retail_price) || 0;
  if (sale < purchase) return 'error';
  const m = calculateProfitMargin(variant, priceType);
  if (m < 10) return 'warning';
  if (m < 30) return 'info';
  return 'success';
};

const getProfitIcon = (variant, priceType = 'retail') => {
  const purchase = parseFloat(variant.purchase_price) || 0;
  const sale = priceType === 'wholesale' ? parseFloat(variant.wholesale_price) || 0 : parseFloat(variant.retail_price) || 0;
  if (sale < purchase) return 'ri-error-warning-line';
  const m = calculateProfitMargin(variant, priceType);
  return m >= 30 ? 'ri-thumb-up-line' : m >= 10 ? 'ri-information-line' : 'ri-alert-line';
};

const calculatePriceFromProfit = (variant) => {
  const purchase = parseFloat(variant.purchase_price) || 0;
  const margin = parseFloat(variant.profit_margin) || 0;
  if (purchase > 0) {
    variant.retail_price = parseFloat((purchase * (1 + margin / 100)).toFixed(2));
    variant.wholesale_price = parseFloat((purchase * (1 + (margin / 2) / 100)).toFixed(2));
  }
};

const calculateProfitFromPrices = (variant) => {
  const purchase = parseFloat(variant.purchase_price) || 0;
  const retail = parseFloat(variant.retail_price) || 0;
  if (purchase > 0) {
    variant.profit_margin = parseFloat(((retail - purchase) / purchase * 100).toFixed(2));
  }
};

// إدارة المتغيرات
const addVariant = async () => {
  const newVariants = [...props.modelValue];
  const last = newVariants.length > 0 ? newVariants[newVariants.length - 1] : null;

  if (last) {
    newVariants.push({
      purchase_price: last.purchase_price,
      wholesale_price: last.wholesale_price,
      retail_price: last.retail_price,
      profit_margin: last.profit_margin,
      sku: '',
      barcode: '',
      stocks: last.stocks.map(s => ({ warehouse_id: s.warehouse_id, quantity: null, unit_id: props.baseUnitId })),
      images: [],
      primary_image_id: null,
      attributes: last.attributes ? last.attributes.map(a => ({ ...a })) : [],
    });
  } else {
    const wid = await productStore.fetchDefaultWarehouse();
    newVariants.push({
      purchase_price: 0, wholesale_price: 0, retail_price: 0, profit_margin: 0,
      sku: '', barcode: '',
      stocks: [{ warehouse_id: wid, quantity: null, unit_id: props.baseUnitId }],
      images: [], primary_image_id: null,
      attributes: [{ attribute_id: null, attribute_value_id: null }],
    });
  }

  emit('update:modelValue', newVariants);
  activeVariantIndex.value = newVariants.length - 1;
};

const removeVariant = (index) => {
  if (props.modelValue.length === 1) return;
  const newVariants = [...props.modelValue];
  newVariants.splice(index, 1);
  emit('update:modelValue', newVariants);
};

const addStock = async (vIndex) => {
  const newVariants = [...props.modelValue];
  const wid = await productStore.fetchDefaultWarehouse();
  newVariants[vIndex].stocks.push({ warehouse_id: wid, quantity: null, unit_id: props.baseUnitId });
  emit('update:modelValue', newVariants);
};

const removeStock = (vIndex, sIndex) => {
  if (props.modelValue[vIndex].stocks.length <= 1) return;
  const newVariants = [...props.modelValue];
  newVariants[vIndex].stocks.splice(sIndex, 1);
  emit('update:modelValue', newVariants);
};

const addAttribute = (vIndex) => {
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

// الصفات
const attributeList = ref([]);
const fetchAttributes = async () => {
  try {
    const r = await useApi('attributes').get({ per_page: 100 });
    attributeList.value = r.data || [];
  } catch (e) {
    console.error('Failed to fetch attributes', e);
  }
};

const attributeValuesMap = computed(() => {
  const map = {};
  (attributeList.value || []).forEach(a => { map[a.id] = a.values || []; });
  return map;
});

const showAttrDialog = ref(false);
const showValueDialog = ref(false);
const activeAttrIndex = ref({ vIndex: null, aIndex: null });
const selectedAttributeForValue = ref(null);

const openCreateAttributeDialog = (vIndex, aIndex) => {
  activeAttrIndex.value = { vIndex, aIndex };
  showAttrDialog.value = true;
};

const openCreateValueDialog = (attributeId, vIndex, aIndex) => {
  const attr = attributeList.value.find(a => a.id === attributeId);
  if (!attr) return;
  selectedAttributeForValue.value = attr;
  activeAttrIndex.value = { vIndex, aIndex };
  showValueDialog.value = true;
};

const handleAttributeSaved = async (newAttr) => {
  await fetchAttributes();
  const { vIndex, aIndex } = activeAttrIndex.value;
  if (vIndex !== null && aIndex !== null && props.modelValue[vIndex]?.attributes?.[aIndex]) {
    const nv = [...props.modelValue];
    nv[vIndex].attributes[aIndex].attribute_id = newAttr.id;
    nv[vIndex].attributes[aIndex].attribute_value_id = null;
    emit('update:modelValue', nv);
  }
};

const handleValueSaved = async (newValue) => {
  await fetchAttributes();
  const { vIndex, aIndex } = activeAttrIndex.value;
  if (vIndex !== null && aIndex !== null && props.modelValue[vIndex]?.attributes?.[aIndex]) {
    const nv = [...props.modelValue];
    nv[vIndex].attributes[aIndex].attribute_value_id = newValue.id;
    emit('update:modelValue', nv);
  }
};

onMounted(() => fetchAttributes());
</script>

<style scoped>
.variant-manager { font-size: 12px; }

/* ===== Shell ===== */
.vm-shell { background: white; }

/* ===== Header ===== */
.vm-header {
  min-height: 52px;
  background-color: #fafafa !important;
  border-bottom: 1px solid rgba(0,0,0,0.08) !important;
  gap: 0;
}

.vm-tabs-scroll {
  gap: 3px;
  scrollbar-width: none;
}
.vm-tabs-scroll::-webkit-scrollbar { display: none; }

/* ===== Variant Tab Button ===== */
.vm-tab-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border: none;
  background: transparent;
  color: #495057;
  cursor: pointer;
  border-radius: 6px;
  white-space: nowrap;
  transition: all 0.18s ease;
  min-height: 42px;
  font-weight: 500;
  position: relative;
}
.vm-tab-btn:hover {
  background: rgba(0,0,0,0.04);
  color: #212529;
}
.vm-tab-btn--active {
  background: #ffffff !important;
  color: rgb(var(--v-theme-primary)) !important;
  box-shadow: 0 1px 4px rgba(0,0,0,0.1);
  font-weight: 600;
}
.vm-tab-btn--active .vm-tab-name {
  color: rgb(var(--v-theme-primary));
}
.vm-delete-btn { opacity: 0.4; transition: opacity 0.15s; }
.vm-tab-btn:hover .vm-delete-btn { opacity: 1; }

/* ===== Variant Dot ===== */
.vm-variant-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
  transition: background 0.2s;
}
.vm-variant-dot--done  { background: rgb(var(--v-theme-success)); }
.vm-variant-dot--empty { background: #ced4da; }

/* ===== Tab Info ===== */
.vm-tab-info { display: flex; flex-direction: column; align-items: flex-start; }
.vm-tab-name { font-size: 12px; font-weight: 600; line-height: 1.2; }

.vm-tab-stats {
  font-size: 9px;
  opacity: 0.8;
  line-height: 1;
  flex-wrap: nowrap;
  overflow: hidden;
  max-width: 120px;
}

.vm-stat {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  font-weight: 600;
  white-space: nowrap;
}
.vm-stat--price  { color: #2e7d32; }
.vm-stat--stock  { color: #1565c0; }
.vm-stat--attr   { color: #6a1b9a; }

/* ===== Body ===== */
.vm-body { border-radius: 0 0 8px 8px; }

/* ===== Sections ===== */
.vm-section { }

.vm-section-label {
  display: flex;
  align-items: center;
  padding: 8px 14px;
  background: #f8f9fa;
  border-bottom: 1px solid rgba(0,0,0,0.06);
  font-size: 11px;
  font-weight: 700;
  color: rgba(0,0,0,0.6);
  letter-spacing: 0.3px;
  gap: 4px;
}

.vm-section-content {
  padding: 12px 14px;
}

/* ===== Stock Card ===== */
.stock-card {
  transition: all 0.2s;
  background: #ffffff;
  border: 1px solid rgba(0,0,0,0.08);
}
.stock-card:hover {
  border-color: rgb(var(--v-theme-primary)) !important;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

/* ===== Attrs ===== */
.attr-pill-group {
  min-width: 260px;
  flex: 1 1 260px;
  transition: border-color 0.2s;
}
.attr-pill-group:hover { border-color: rgb(var(--v-theme-primary)) !important; }
.attr-input { min-width: 110px; }
.attr-label-box { min-width: 120px; }
.attr-value-box { min-width: 120px; }

/* ===== Summary Table ===== */
.vm-summary-table { background: white; }
.summary-table { border-collapse: collapse; font-size: 11px; }
.summary-table th {
  padding: 8px 10px;
  background: #f9fafb;
  border-bottom: 1px solid rgba(0,0,0,0.08);
  font-size: 10px;
  font-weight: 600;
  color: rgba(0,0,0,0.5);
  white-space: nowrap;
}
.summary-table td {
  padding: 7px 10px;
  border-bottom: 1px solid rgba(0,0,0,0.04);
  vertical-align: middle;
}
.summary-row { transition: background 0.12s; cursor: pointer; }
.summary-row:hover { background: rgba(var(--v-theme-primary), 0.03); }
.summary-row--active td { background: rgba(var(--v-theme-primary), 0.05); }

/* ===== Empty State ===== */
.vm-empty { border-radius: 0 0 8px 8px; }

/* ===== Misc ===== */
.v-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
.text-xxs { font-size: 10px !important; }
.border-dashed { border: 1.5px dashed rgba(0,0,0,0.1); }
.price-input :deep(input) { text-align: center; }
.w-100 { width: 100% !important; }
.gap-1 { gap: 4px; }
.gap-2 { gap: 8px; }
.gap-3 { gap: 12px; }
</style>
