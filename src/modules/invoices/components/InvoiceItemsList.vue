<template>
  <div class="invoice-items-wrapper">
    <!-- الهيكل الموحد: Header + Input Row + Scrollable Items في وحدة بصرية واحدة -->
    <section v-if="isPhone" class="phone-items">
      <div class="phone-section-heading">
        <div>
          <h2>
            أصناف الفاتورة <span>{{ items.length }}</span>
          </h2>
          <p>أضف الأصناف وراجع تفاصيلها</p>
        </div>
        <v-btn color="primary" variant="tonal" rounded="pill" prepend-icon="ri-add-line" @click="isAddOpen = true">إضافة صنف</v-btn>
      </div>
      <div v-if="!items.length" class="phone-empty">
        <v-icon icon="ri-shopping-bag-3-line" size="24" color="primary" />
        <div>
          <strong>لا توجد أصناف بعد</strong>
          <p>أضف صنفًا بالاسم أو الباركود للبدء.</p>
        </div>
      </div>
      <template v-else>
        <p class="phone-table-hint" id="invoice-table-scroll-hint">{{ items.length }} صنف · اسحب الجدول عرضيًا لباقي الحقول ورأسيًا لباقي الأصناف.</p>
        <div
          ref="phoneScrollRef"
          class="phone-table-viewport"
          :style="{ '--items-height': `${Math.max(160, Math.min(380, viewportHeight * 0.42))}px` }"
          tabindex="0"
          role="region"
          aria-label="جدول أصناف الفاتورة"
          aria-describedby="invoice-table-scroll-hint"
        >
          <table class="phone-items-table">
            <colgroup>
              <col style="width: 124px" />
              <col style="width: 80px" />
              <col style="width: 96px" />
              <col style="width: 96px" />
              <col style="width: 92px" />
            </colgroup>
            <thead>
              <tr>
                <th scope="col" class="sticky-item">الصنف</th>
                <th scope="col">الكمية</th>
                <th scope="col">سعر الوحدة</th>
                <th scope="col">الإجمالي</th>
                <th scope="col" class="sticky-actions">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(item, index) in items"
                :key="rowKey(item)"
                :data-item-key="rowKey(item)"
                :class="{ 'item-row--flash': highlightedItemIndex === index }"
              >
                <th scope="row" class="sticky-item">
                  <span class="phone-row-name" :title="item.name">{{ item.name }}</span
                  ><small>{{
                    item.allowed_units?.find(u => u.id === item.unit_id)?.name || (item.product_type === 'service' ? 'خدمة' : 'قطعة')
                  }}</small>
                </th>
                <td>
                  <AppInput
                    :model-value="item.quantity"
                    :aria-label="`كمية ${item.name}`"
                    type="number"
                    inputmode="decimal"
                    hide-details
                    class="row-number"
                    :error="isItemError(item)"
                    :step="quantityStep(item)"
                    @update:model-value="value => updateQuantity(item, value)"
                    @keydown.enter.prevent="$event.target.blur()"
                  /><small v-if="isItemError(item)" class="text-error" role="alert">تجاوز المخزون</small>
                </td>
                <td>
                  <AppInput
                    v-model.number="item.unit_price"
                    :aria-label="`سعر ${item.name}`"
                    type="number"
                    inputmode="decimal"
                    hide-details
                    min="0"
                    class="row-number"
                    @update:model-value="$emit('calculate', item)"
                    @keydown.enter.prevent="$event.target.blur()"
                  />
                </td>
                <td class="phone-row-total">{{ formatCurrency(item.total) }}</td>
                <td class="sticky-actions">
                  <div class="item-row-actions">
                    <v-btn
                      icon="ri-external-link-line"
                      variant="text"
                      color="primary"
                      aria-label="فتح تفاصيل الصنف"
                      :title="`فتح تفاصيل ${item.name}`"
                      data-item-details
                      @click="openDetails(item, $event)"
                    /><v-btn
                      icon="ri-delete-bin-line"
                      variant="text"
                      color="error"
                      aria-label="حذف الصنف"
                      :title="`حذف ${item.name}`"
                      @click="$emit('remove', index)"
                    />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
      <slot v-if="showInstallmentSection" name="installment" />
      <v-dialog v-model="isAddOpen" fullscreen transition="dialog-bottom-transition" content-class="invoice-phone-dialog">
        <v-card class="phone-add-screen">
          <v-toolbar color="surface" class="border-b"
            ><v-btn icon="ri-arrow-right-line" aria-label="العودة إلى الفاتورة" @click="isAddOpen = false" /><v-toolbar-title
              >إضافة صنف</v-toolbar-title
            ></v-toolbar
          >
          <v-card-text class="phone-add-content">
            <p class="phone-overline">ابحث عن منتج أو خدمة</p>
            <ProductSelector
              v-if="isAddOpen"
              ref="productSelectorRef"
              :warehouse-id="warehouseId"
              :invoice-type="invoiceType"
              :customer-type="customerType"
              @select-item="onProductSelected"
              @create-product="
                name => {
                  isAddOpen = false;
                  $emit('create-product', name);
                }
              "
            />
            <div v-if="inlineItem" class="phone-selected-product">
              <h2>{{ inlineItem.name }}</h2>
              <p>{{ getItemAttributesText(inlineItem) }}</p>
              <div class="phone-add-fields">
                <v-select
                  v-if="inlineItem.allowed_units?.length > 1"
                  v-model="inlineItem.unit_id"
                  :items="inlineItem.allowed_units"
                  item-title="name"
                  item-value="id"
                  label="الوحدة"
                  variant="outlined"
                  hide-details
                  @update:model-value="onInlineUnitChange"
                />
                <AppInput v-model.number="inlineQuantity" label="الكمية" type="number" inputmode="decimal" hide-details />
                <AppInput v-model.number="inlineUnitPrice" label="سعر الوحدة" type="number" inputmode="decimal" hide-details />
                <AppInput v-model.number="inlineDiscount" label="خصم الصنف" type="number" inputmode="decimal" hide-details />
              </div>
              <div class="phone-add-total">
                <span>إجمالي الصنف</span><strong>{{ formatCurrency(inlineSubtotal) }}</strong>
              </div>
            </div>
            <div v-else class="phone-search-hint">
              <v-icon icon="ri-search-2-line" size="48" />
              <p>اختر الصنف من نتائج البحث<br />لتحديد الكمية ومراجعة السعر</p>
            </div>
          </v-card-text>
          <v-card-actions class="phone-add-actions"
            ><v-btn block color="primary" variant="flat" rounded="pill" :disabled="!inlineItem || inlineQuantity <= 0" @click="commitInlineItem"
              >إضافة إلى الفاتورة</v-btn
            ></v-card-actions
          >
        </v-card>
      </v-dialog>
    </section>
    <div v-else class="invoice-table-container">
      <!-- ═══ الجزء الثابت: رأس الأعمدة + صف الإدخال ═══ -->
      <div class="table-fixed-zone">
        <!-- رأس أعمدة الجدول -->
        <div class="table-col-header">
          <!-- عمود الصنف (flex-grow) -->
          <div class="col-item">
            <span class="col-label">
              <v-icon icon="ri-shopping-bag-3-line" size="12" class="me-1" />
              الصنف
            </span>
            <v-chip size="x-small" color="primary" variant="flat" class="font-weight-bold ms-2">
              {{ items.length }}
            </v-chip>
          </div>
          <!-- عمود سعر البيع (فاتورة شراء فقط) -->
          <div v-if="invoiceType === 'purchase'" class="col-sell-price col-label">سعر البيع</div>
          <!-- عمود الوحدة -->
          <div class="col-unit col-label">الوحدة</div>
          <!-- عمود الكمية -->
          <div class="col-qty col-label">الكمية</div>
          <!-- عمود السعر -->
          <div class="col-price col-label">سعر الوحدة</div>
          <!-- عمود الخصم -->
          <div class="col-disc col-label">الخصم</div>
          <!-- عمود الإجمالي -->
          <div class="col-total col-label">الإجمالي</div>
          <!-- عمود الإجراء -->
          <div class="col-action"></div>
        </div>

        <!-- ─── صف الإدخال (يتوافق عرض حقوله مع أعمدة الجدول تمامًا) ─── -->
        <div class="input-row" :class="{ 'input-row--active': !!inlineItem }">
          <!-- حقل البحث عن المنتج -->
          <div class="col-item input-row__search">
            <ProductSelector
              ref="productSelectorRef"
              :warehouse-id="warehouseId"
              :invoice-type="invoiceType"
              :customer-type="customerType"
              @select-item="onProductSelected"
              @create-product="$emit('create-product', $event)"
            />
          </div>

          <!-- عمود سعر البيع (placeholder فارغ لمحاذاة الأعمدة) -->
          <div v-if="invoiceType === 'purchase'" class="col-sell-price d-flex align-center justify-center">
            <span v-if="inlineItem" class="text-xxs text-success font-weight-bold">—</span>
          </div>

          <!-- الوحدة -->
          <div class="col-unit d-flex align-center justify-center">
            <v-select
              v-if="inlineItem && inlineItem.allowed_units && inlineItem.allowed_units.length > 1"
              v-model="inlineItem.unit_id"
              :items="inlineItem.allowed_units"
              item-title="name"
              item-value="id"
              density="compact"
              variant="outlined"
              hide-details
              class="compact-select"
              @update:model-value="onInlineUnitChange"
            />
            <span v-else class="text-xxs text-grey-darken-2 font-weight-medium">
              {{ inlineItem?.product_type === 'service' ? 'خدمة' : inlineItem?.allowed_units?.[0]?.name || '—' }}
            </span>
          </div>

          <!-- الكمية -->
          <div class="col-qty d-flex align-center justify-center">
            <AppInput
              ref="qtyInputRef"
              v-model.number="inlineQuantity"
              type="number"
              density="compact"
              hide-details
              placeholder="1"
              min="0.0001"
              class="compact-input centered-input font-weight-black text-primary"
              :class="{ 'input-disabled': !inlineItem }"
              :disabled="!inlineItem"
              @focus="onQtyFocus"
              @keydown.enter.prevent="commitInlineItem"
            />
          </div>

          <!-- السعر -->
          <div class="col-price d-flex align-center justify-center">
            <AppInput
              v-model.number="inlineUnitPrice"
              type="number"
              density="compact"
              hide-details
              placeholder="0.00"
              class="compact-input centered-input"
              :disabled="!inlineItem"
              @keydown.enter.prevent="commitInlineItem"
            />
          </div>

          <!-- الخصم -->
          <div class="col-disc d-flex align-center justify-center">
            <AppInput
              v-model.number="inlineDiscount"
              type="number"
              density="compact"
              hide-details
              placeholder="0"
              class="compact-input centered-input"
              :disabled="!inlineItem"
              @keydown.enter.prevent="commitInlineItem"
            />
          </div>

          <!-- الإجمالي + زر الإضافة -->
          <div class="col-total d-flex align-center justify-end gap-1 pe-1">
            <span v-if="inlineItem" class="text-caption font-weight-black text-primary text-no-wrap">
              {{ formatCurrency(inlineSubtotal) }}
            </span>
            <v-btn color="primary" size="small" variant="flat" class="add-btn px-2" :disabled="!inlineItem" @click="commitInlineItem">
              <v-icon icon="ri-add-line" size="16" />
              <span class="d-none d-md-inline ms-1 text-xxs font-weight-bold">إضافة</span>
            </v-btn>
          </div>

          <!-- المحاذاة مع عمود الإجراء -->
          <div class="col-action"></div>
        </div>
      </div>

      <!-- ═══ منطقة الأصناف القابلة للـ Scroll (الأحدث أولًا) ═══ -->
      <div class="items-scroll-area" ref="scrollAreaRef">
        <!-- حالة فارغة -->
        <div v-if="items.length === 0" class="empty-state-wrapper">
          <EmptyState
            icon="ri-shopping-cart-2-line"
            icon-size="48"
            title="لا توجد أصناف بعد"
            message="ابحث عن المنتج في حقل البحث أعلاه ثم اضغط Enter للإضافة السريعة"
            class="py-4"
          />
        </div>

        <!-- قائمة الأصناف -->
        <div
          v-for="(item, index) in items"
          :key="rowKey(item)"
          :data-item-key="rowKey(item)"
          class="item-row"
          :class="{ 'item-row--flash': highlightedItemIndex === index }"
        >
          <!-- معلومات المنتج -->
          <div class="col-item">
            <AppAvatar :img-url="item.primary_image_url" :name="item.name" size="28" rounded="md" class="me-2 flex-shrink-0" />
            <div class="item-info">
              <div class="item-name">{{ item.name }}</div>
              <div class="item-meta">
                <span v-if="getItemAttributesText(item)" class="item-attrs">
                  <v-icon icon="ri-price-tag-3-line" size="9" class="me-1" />
                  {{ getItemAttributesText(item) }}
                </span>
                <span v-if="item.barcode" class="item-barcode">
                  {{ item.barcode }}
                </span>
              </div>
            </div>
          </div>

          <!-- سعر البيع (فاتورة شراء) -->
          <div v-if="invoiceType === 'purchase'" class="col-sell-price text-center">
            <span class="text-xxs font-weight-bold text-success">
              {{ formatCurrency(getSellingPriceForCurrentUnit(item)) }}
            </span>
          </div>

          <!-- الوحدة -->
          <div class="col-unit text-center">
            <v-select
              v-if="item.allowed_units && item.allowed_units.length > 1"
              v-model="item.unit_id"
              :items="item.allowed_units"
              item-title="name"
              item-value="id"
              density="compact"
              variant="outlined"
              hide-details
              class="compact-select"
              @update:model-value="val => handleUnitChange(item, val)"
            />
            <span v-else-if="item.product_type === 'service'" class="text-xxs text-grey-darken-1">خدمة</span>
            <span v-else class="text-xxs text-grey-darken-1 font-weight-medium">
              {{ item.allowed_units?.[0]?.name || 'قطعة' }}
            </span>
          </div>

          <!-- الكمية (قابلة للتعديل Inline) -->
          <div class="col-qty text-center">
            <div class="position-relative d-flex justify-center">
              <AppInput
                :model-value="item.quantity"
                type="number"
                density="compact"
                hide-details
                min="0.0001"
                required
                class="compact-input centered-input font-weight-bold"
                :class="{ 'flash-error': isItemError(item) }"
                :step="item.allow_decimal_quantities ? Math.pow(0.1, item.quantity_precision || 2).toFixed(item.quantity_precision || 2) : 1"
                @focus="$event.target.select()"
                @keydown.enter="$event.target.blur()"
                @keydown.esc="revertQuantity(item)"
                @update:model-value="val => updateQuantity(item, val)"
              />
              <v-tooltip :model-value="isItemError(item)" location="top" activator="parent" content-class="bg-error text-white font-weight-bold">
                الكمية المتاحة: {{ item.max_quantity }}
              </v-tooltip>
            </div>
          </div>

          <!-- السعر (قابل للتعديل Inline) -->
          <div class="col-price text-center">
            <AppInput
              v-model.number="item.unit_price"
              type="number"
              density="compact"
              hide-details
              required
              class="compact-input centered-input"
              @focus="$event.target.select()"
              @keydown.enter="$event.target.blur()"
              @update:model-value="$emit('calculate', item)"
            />
          </div>

          <!-- الخصم (قابل للتعديل Inline) -->
          <div class="col-disc text-center">
            <AppInput
              v-model.number="item.discount"
              type="number"
              density="compact"
              hide-details
              class="compact-input centered-input"
              @focus="$event.target.select()"
              @keydown.enter="$event.target.blur()"
              @update:model-value="$emit('calculate', item)"
            />
          </div>

          <!-- الإجمالي -->
          <div class="col-total text-start ps-1 font-weight-black text-primary text-caption">
            {{ formatCurrency(item.total) }}
          </div>

          <!-- زر الحذف -->
          <div class="col-action text-center">
            <div class="item-row-actions">
              <v-btn
                icon="ri-external-link-line"
                variant="text"
                color="primary"
                size="small"
                aria-label="فتح تفاصيل الصنف"
                :title="`فتح تفاصيل ${item.name}`"
                data-item-details
                @click="openDetails(item, $event)"
              /><v-btn
                icon="ri-delete-bin-line"
                variant="text"
                color="error"
                size="small"
                aria-label="حذف الصنف"
                :title="`حذف ${item.name}`"
                @click="$emit('remove', index)"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- قسم الأقساط (إن وجد) -->
      <template v-if="showInstallmentSection">
        <v-divider />
        <div class="pa-0">
          <slot name="installment" />
        </div>
      </template>
    </div>
    <InvoiceItemDetailsDialog
      :item="detailsItem"
      :is-phone="isPhone"
      :viewport-height="viewportHeight"
      :invoice-type="invoiceType"
      :selling-price="getSellingPriceForCurrentUnit"
      :external-error="detailsError"
      @close="closeDetails"
      @apply="applyDetails"
      @unit-change="handleUnitChange"
    />
  </div>
</template>

<script setup>
// منطقة أصناف الفاتورة — Workspace متكامل: Header ثابت + صف إدخال ثابت + Scroll للأصناف فقط
import { ref, computed, nextTick, onMounted, onBeforeUnmount } from 'vue';
import InvoiceItemDetailsDialog from './InvoiceItemDetailsDialog.vue';
import { useDisplay } from 'vuetify';
import ProductSelector from './ProductSelector.vue';
import { formatCurrency } from '@/utils/formatters';

const props = defineProps({
  items: {
    type: Array,
    required: true,
  },
  taxInclusive: {
    type: Boolean,
    default: false,
  },
  warehouseId: {
    type: [Number, String],
    default: null,
  },
  invoiceType: {
    type: String,
    default: 'sales',
  },
  customerType: {
    type: String,
    default: 'retail',
  },
  showInstallmentSection: {
    type: Boolean,
    default: false,
  },
});

const { xs: isPhone } = useDisplay();
const isAddOpen = ref(false);

const quantityStep = item => (item.allow_decimal_quantities ? 10 ** -(item.quantity_precision || 2) : 1);

const phoneScrollRef = ref(null),
  detailsItem = ref(null),
  detailsError = ref(''),
  viewportHeight = ref(window.visualViewport?.height || window.innerHeight);
const keys = new WeakMap();
let sequence = 0,
  detailActivator = null,
  scrollSnapshot = null,
  detailsSnapshot = '';
function rowKey(item) {
  if (!keys.has(item)) keys.set(item, `invoice-row-${++sequence}`);
  return keys.get(item);
}
function viewportChanged() {
  viewportHeight.value = window.visualViewport?.height || window.innerHeight;
}
onMounted(() => {
  window.visualViewport?.addEventListener('resize', viewportChanged);
  window.addEventListener('resize', viewportChanged);
});
onBeforeUnmount(() => {
  window.visualViewport?.removeEventListener('resize', viewportChanged);
  window.removeEventListener('resize', viewportChanged);
});
function openDetails(item, event) {
  detailsItem.value = item;
  detailsError.value = '';
  detailsSnapshot = JSON.stringify(item);
  detailActivator = event.currentTarget;
  const area = isPhone.value ? phoneScrollRef.value : scrollAreaRef.value;
  scrollSnapshot = { top: area?.scrollTop || 0, left: area?.scrollLeft || 0 };
}
function closeDetails() {
  const item = detailsItem.value;
  detailsItem.value = null;
  nextTick(() => {
    const area = isPhone.value ? phoneScrollRef.value : scrollAreaRef.value;
    if (area && scrollSnapshot) {
      area.scrollTop = scrollSnapshot.top;
      area.scrollLeft = scrollSnapshot.left;
    }
    if (detailActivator?.isConnected) detailActivator.focus({ preventScroll: true });
    else if (item) revealItem(item, true);
  });
}
function applyDetails(draft) {
  const item = detailsItem.value;
  if (!props.items.includes(item)) {
    detailsError.value = 'الصنف لم يعد موجودًا في الفاتورة.';
    return;
  }
  if (JSON.stringify(item) !== detailsSnapshot) {
    detailsError.value = 'تغيرت بيانات الصنف أثناء فتح التفاصيل. أغلق النافذة وافتحها مرة أخرى.';
    return;
  }
  updateQuantity(draft, draft.quantity);
  if (draft.quantity <= 0) {
    detailsError.value = 'لا توجد كمية متاحة لهذه الوحدة في المخزن.';
    return;
  }
  Object.assign(item, draft);
  emit('calculate', item);
  closeDetails();
}
function revealItem(item, focus = false) {
  nextTick(() => {
    const area = isPhone.value ? phoneScrollRef.value : scrollAreaRef.value,
      row = area?.querySelector(`[data-item-key="${rowKey(item)}"]`);
    if (!row) return;
    const box = area.getBoundingClientRect(),
      r = row.getBoundingClientRect(),
      header = area.querySelector('thead')?.getBoundingClientRect().height || 0;
    if (r.top < box.top + header) area.scrollTop += r.top - box.top - header;
    else if (r.bottom > box.bottom) area.scrollTop += r.bottom - box.bottom;
    if (focus) row.querySelector('[data-item-details]')?.focus({ preventScroll: true });
  });
}
defineExpose({ revealItem });
const emit = defineEmits(['update:taxInclusive', 'add', 'calculate', 'remove', 'create-product']);

// ── Refs ──
const productSelectorRef = ref(null);
const qtyInputRef = ref(null);
const scrollAreaRef = ref(null);

// ── حالة صف الإدخال ──
const inlineItem = ref(null);
const inlineQuantity = ref(1);
const inlineUnitPrice = ref(0);
const inlineDiscount = ref(0);
const highlightedItemIndex = ref(-1);
const stockErrorItems = ref(new Set());

// ── حساب الإجمالي المؤقت لصف الإدخال ──
const inlineSubtotal = computed(() => {
  if (!inlineItem.value) return 0;
  const qty = parseFloat(inlineQuantity.value) || 0;
  const price = parseFloat(inlineUnitPrice.value) || 0;
  const disc = parseFloat(inlineDiscount.value) || 0;
  return qty * price - disc;
});

const isItemError = item => stockErrorItems.value.has(item);

// ── عند اختيار منتج من القائمة ──
const onProductSelected = itemObj => {
  if (!itemObj) return;

  inlineItem.value = { ...itemObj };
  inlineQuantity.value = 1;
  inlineUnitPrice.value = itemObj.unit_price || 0;
  inlineDiscount.value = itemObj.discount || 0;

  // نقل Focus إلى حقل الكمية فورًا
  if (isPhone.value) return;
  nextTick(() => {
    if (qtyInputRef.value) {
      const inputEl = qtyInputRef.value.$el ? qtyInputRef.value.$el.querySelector('input') : qtyInputRef.value;
      if (inputEl) {
        inputEl.focus();
        inputEl.select?.();
      }
    }
  });
};

const onQtyFocus = e => {
  e.target?.select?.();
};

// ── تغيير الوحدة في صف الإدخال ──
const onInlineUnitChange = unitId => {
  if (!inlineItem.value) return;
  inlineItem.value.unit_id = unitId;

  const customPrice = inlineItem.value.unit_prices?.find(up => up.unit_id === unitId);
  if (customPrice) {
    if (props.invoiceType === 'purchase') {
      inlineUnitPrice.value = customPrice.cost || customPrice.price || inlineItem.value.purchase_price;
    } else if (props.customerType === 'wholesale') {
      inlineUnitPrice.value = customPrice.price || inlineItem.value.wholesale_price;
    } else {
      inlineUnitPrice.value = customPrice.price || inlineItem.value.retail_price;
    }
  } else {
    let factor = 1.0;
    if (unitId !== inlineItem.value.base_unit_id) {
      const vu = inlineItem.value.units?.find(u => u.unit_id === unitId);
      if (vu) factor = parseFloat(vu.conversion_factor_to_base) || 1.0;
    }
    if (props.invoiceType === 'purchase') {
      inlineUnitPrice.value = (inlineItem.value.purchase_price || 0) * factor;
    } else if (props.customerType === 'wholesale') {
      inlineUnitPrice.value = (inlineItem.value.wholesale_price || 0) * factor;
    } else {
      inlineUnitPrice.value = (inlineItem.value.retail_price || 0) * factor;
    }
  }
};

// ── تأكيد إضافة الصنف (Enter أو زر الإضافة) ──
const commitInlineItem = () => {
  if (!inlineItem.value) return;

  const qty = parseFloat(inlineQuantity.value) || 1;
  const price = parseFloat(inlineUnitPrice.value) || 0;
  const disc = parseFloat(inlineDiscount.value) || 0;

  emit('add', {
    ...inlineItem.value,
    quantity: qty,
    unit_price: price,
    discount: disc,
    total: qty * price - disc,
  });

  if (isPhone.value) isAddOpen.value = false;

  // تصفية صف الإدخال
  inlineItem.value = null;
  inlineQuantity.value = 1;
  inlineUnitPrice.value = 0;
  inlineDiscount.value = 0;

  // وميض اللون على أول صنف في القائمة
  highlightedItemIndex.value = 0;
  setTimeout(() => {
    highlightedItemIndex.value = -1;
  }, 700);

  // إعادة Focus لحقل البحث
  nextTick(() => {
    if (isPhone.value && props.items[0]) revealItem(props.items[0]);
    if (!isPhone.value) productSelectorRef.value?.focus();
  });
};

const revertQuantity = item => {
  emit('calculate', item);
};

// ── دوال مساعدة (محافظة على البيزنس لوجيك الأصلي) ──
const getItemAttributesText = item => {
  if (!item) return '';
  if (item.attributes_text) return item.attributes_text;
  if (item.variant?.attributes_text) return item.variant.attributes_text;

  const attrs = item.attributes || item.variant?.attributes;
  if (attrs && Array.isArray(attrs) && attrs.length > 0) {
    return attrs
      .map(a => {
        const name = a.attribute?.name || a.name;
        const val = a.attribute_value?.name || a.value?.name || a.val || a.value;
        return name && val ? `${name}: ${val}` : val || name || '';
      })
      .filter(Boolean)
      .join(' - ');
  }
  return '';
};

const getSellingPriceForCurrentUnit = item => {
  if (!item) return 0;
  if (item.product_type === 'service') return item.default_price || item.unit_price || 0;

  const unitId = item.unit_id;
  const customPrice = item.unit_prices?.find(up => up.unit_id === unitId);
  if (customPrice && (customPrice.price || customPrice.retail_price)) {
    return parseFloat(customPrice.price || customPrice.retail_price);
  }

  let factor = 1.0;
  if (unitId && unitId !== item.base_unit_id) {
    const vu = item.units?.find(u => u.unit_id === unitId);
    if (vu) factor = parseFloat(vu.conversion_factor_to_base) || 1.0;
  }

  return (parseFloat(item.retail_price) || 0) * factor;
};

const handleUnitChange = (item, unitId) => {
  const customPrice = item.unit_prices?.find(up => up.unit_id === unitId);
  if (customPrice) {
    if (props.invoiceType === 'purchase') {
      item.unit_price = customPrice.cost || customPrice.price || item.purchase_price;
    } else if (props.customerType === 'wholesale') {
      item.unit_price = customPrice.price || item.wholesale_price;
    } else {
      item.unit_price = customPrice.price || item.retail_price;
    }
  } else {
    let factor = 1.0;
    if (unitId !== item.base_unit_id) {
      const vu = item.units?.find(u => u.unit_id === unitId);
      if (vu) factor = parseFloat(vu.conversion_factor_to_base) || 1.0;
    }
    if (props.invoiceType === 'purchase') {
      item.unit_price = (item.purchase_price || 0) * factor;
    } else if (props.customerType === 'wholesale') {
      item.unit_price = (item.wholesale_price || 0) * factor;
    } else {
      item.unit_price = (item.retail_price || 0) * factor;
    }
  }

  const selectedUnit = item.allowed_units?.find(u => u.id === unitId);
  if (selectedUnit) {
    item.allow_decimal_quantities = selectedUnit.decimal_places > 0;
    item.quantity_precision = selectedUnit.decimal_places || 0;
  }

  emit('calculate', item);
};

const updateQuantity = (item, val) => {
  let newVal = parseFloat(val);
  if (isNaN(newVal) || newVal < 0.0001) newVal = 0.01;

  if (!item.allow_decimal_quantities) {
    newVal = Math.round(newVal);
  } else {
    const precision = item.quantity_precision || 2;
    newVal = parseFloat(newVal.toFixed(precision));
  }

  if (props.invoiceType !== 'purchase' && item.requires_stock && typeof item.max_quantity === 'number') {
    let factor = 1.0;
    const vu = item.units?.find(u => u.unit_id === item.unit_id);
    if (vu) factor = parseFloat(vu.conversion_factor_to_base) || 1.0;

    const maxQtyInUnit = item.max_quantity / factor;
    if (newVal > maxQtyInUnit) {
      stockErrorItems.value.add(item);
      setTimeout(() => {
        stockErrorItems.value.delete(item);
      }, 1000);

      if (item.quantity === maxQtyInUnit) {
        if (newVal !== maxQtyInUnit) item.quantity = newVal;
        nextTick(() => {
          item.quantity = maxQtyInUnit;
          emit('calculate', item);
        });
        return;
      }
      newVal = maxQtyInUnit;
    }
  }

  item.quantity = newVal;
  emit('calculate', item);
};
</script>

<style scoped>
/* ═══════════════════════════════════════════════════
   INVOICE WORKSPACE — Invoice Items Component
   ═══════════════════════════════════════════════════ */

.invoice-items-wrapper {
  display: flex;
  flex-direction: column;
}

/* الحاوية الرئيسية للجدول */
.invoice-table-container {
  border: 1px solid rgba(var(--v-border-color), 0.2);
  border-radius: 8px;
  overflow: hidden;
  background: rgb(var(--v-theme-surface));
  display: flex;
  flex-direction: column;
}

/* ═══ منطقة الـ Fixed Header (أعمدة + صف الإدخال) ═══ */
.table-fixed-zone {
  flex-shrink: 0;
  background: rgb(var(--v-theme-surface));
  z-index: 2;
}

/* ─── رأس أعمدة الجدول ─── */
.table-col-header {
  display: flex;
  align-items: center;
  background: rgba(var(--v-theme-on-surface), 0.035);
  border-bottom: 1px solid rgba(var(--v-border-color), 0.15);
  padding: 0 8px;
  min-height: 32px;
  user-select: none;
  gap: 4px; /* لضمان تطابق المسافات مع input-row و item-row */
}

.col-label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  color: rgba(var(--v-theme-on-surface), 0.55);
  display: flex;
  align-items: center;
}

/* ─── صف الإدخال ─── */
.input-row {
  display: flex;
  align-items: center;
  padding: 5px 8px;
  background: rgba(var(--v-theme-primary), 0.03);
  border-bottom: 2px solid rgba(var(--v-theme-primary), 0.18);
  gap: 4px;
  min-height: 46px;
  transition: background 0.2s ease;
}

.input-row--active {
  background: rgba(var(--v-theme-primary), 0.06);
  border-bottom-color: rgba(var(--v-theme-primary), 0.35);
}

.input-row__search {
  flex: 1 1 0;
  min-width: 200px;
}

/* إجبار ProductSelector على ألا يبدو عملاقًا جدًا، لكن الحاوية نفسها تتمدد لتضمن المحاذاة */
.input-row__search > * {
  width: 100%;
  max-width: 400px;
}

/* ═══ منطقة Scroll الأصناف ═══ */
.items-scroll-area {
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: thin;
  scrollbar-color: rgba(var(--v-theme-primary), 0.2) transparent;
  min-height: 120px;
  /* الارتفاع الأقصى: ديناميكي بحيث لا يأخذ أكثر من 50vh على الشاشات الكبيرة */
  max-height: clamp(180px, calc(100vh - 380px), 520px);
}

.items-scroll-area::-webkit-scrollbar {
  width: 4px;
}

.items-scroll-area::-webkit-scrollbar-thumb {
  background: rgba(var(--v-theme-primary), 0.2);
  border-radius: 4px;
}

/* ─── صف صنف مضاف ─── */
.item-row {
  display: flex;
  align-items: center;
  padding: 4px 8px;
  border-bottom: 1px solid rgba(var(--v-border-color), 0.1);
  min-height: 42px;
  gap: 4px;
  transition: background 0.15s ease;
}

.item-row:hover {
  background: rgba(var(--v-theme-primary), 0.025);
}

.item-row:last-child {
  border-bottom: none;
}

/* ─── وميض الإضافة الجديدة ─── */
.item-row--flash {
  animation: flash-success 0.7s ease-out;
}

@keyframes flash-success {
  0% {
    background-color: rgba(var(--v-theme-success), 0.2);
  }
  100% {
    background-color: transparent;
  }
}

/* ═══ تعريف الأعمدة (مشترك بين Header + Input Row + Item Rows) ═══ */

/* عمود الصنف: يأخذ المساحة المتبقية مع حد أدنى مريح */
.col-item {
  flex: 1 1 0;
  min-width: 220px;
  display: flex;
  align-items: center;
  padding-inline-start: 4px;
}

/* عمود سعر البيع */
.col-sell-price {
  flex: 0 0 90px;
  width: 90px;
  text-align: center;
}

/* عمود الوحدة */
.col-unit {
  flex: 0 0 76px;
  width: 76px;
  text-align: center;
}

/* عمود الكمية */
.col-qty {
  flex: 0 0 80px;
  width: 80px;
  text-align: center;
}

/* عمود سعر الوحدة */
.col-price {
  flex: 0 0 100px;
  width: 100px;
  text-align: center;
}

/* عمود الخصم */
.col-disc {
  flex: 0 0 72px;
  width: 72px;
  text-align: center;
}

/* عمود الإجمالي */
.col-total {
  flex: 0 0 96px;
  width: 96px;
  text-align: start;
  padding-inline-start: 4px;
}

/* عمود الإجراء (حذف) */
.col-action {
  flex: 0 0 88px;
  width: 88px;
  text-align: center;
}

/* ─── معلومات المنتج داخل صف الصنف ─── */
.item-info {
  min-width: 0;
  overflow: hidden;
}

.item-name {
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.3;
}

.item-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 1px;
}

.item-attrs {
  font-size: 9.5px;
  color: rgb(var(--v-theme-primary));
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 160px;
}

.item-barcode {
  font-size: 9px;
  color: rgba(var(--v-theme-on-surface), 0.45);
  font-variant-numeric: tabular-nums;
}

/* ─── حقول الإدخال المضغوطة ─── */
.compact-input {
  max-width: 76px;
}

:deep(.compact-input .v-field) {
  font-size: 12px;
}

:deep(.compact-input .v-field__input) {
  padding-top: 3px !important;
  padding-bottom: 3px !important;
  min-height: 28px !important;
}

.compact-select {
  max-width: 72px;
}

:deep(.compact-select .v-field) {
  font-size: 11px;
}

:deep(.compact-select .v-field__input) {
  padding-top: 3px !important;
  padding-bottom: 3px !important;
  min-height: 28px !important;
}

/* إدخال مضغوط مع text-center */
:deep(.centered-input .v-field__input) {
  text-align: center;
}

/* ─── زر الإضافة ─── */
.add-btn {
  min-width: 28px !important;
  height: 28px !important;
}

/* ─── الحالة الفارغة ─── */
.empty-state-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 140px;
}

/* ─── وميض خطأ الكمية ─── */
@keyframes flash-red {
  0% {
    transform: scale(1);
    background-color: transparent;
  }
  50% {
    transform: scale(1.03);
    background-color: rgba(var(--v-theme-error), 0.15);
    border-color: rgb(var(--v-theme-error)) !important;
  }
  100% {
    transform: scale(1);
    background-color: transparent;
  }
}

:deep(.flash-error) .v-field {
  animation: flash-red 0.4s ease-in-out;
  border-color: rgb(var(--v-theme-error)) !important;
}

/* ═══ Responsive ═══ */
/* على الشاشات الصغيرة نخفي بعض الأعمدة */
@media (max-width: 768px) {
  .col-disc,
  .col-sell-price {
    display: none;
  }

  .col-unit {
    flex: 0 0 70px;
    width: 70px;
  }

  .col-qty {
    flex: 0 0 70px;
    width: 70px;
  }

  .col-price {
    flex: 0 0 90px;
    width: 90px;
  }

  .col-total {
    flex: 0 0 90px;
    width: 90px;
  }

  .items-scroll-area {
    max-height: clamp(160px, calc(100vh - 420px), 380px);
  }
}

@media (max-width: 480px) {
  .col-unit {
    display: none;
  }

  .col-price {
    flex: 0 0 80px;
    width: 80px;
  }

  .col-qty {
    flex: 0 0 70px;
    width: 70px;
  }
}

.phone-section-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin: 8px 0 16px;
}
.phone-section-heading h2 {
  font-size: 17px;
  font-weight: 800;
  margin: 0;
}
.phone-section-heading h2 span {
  display: inline-grid;
  place-items: center;
  background: rgba(var(--v-theme-primary), 0.1);
  color: rgb(var(--v-theme-primary));
  border-radius: 50%;
  min-width: 24px;
  height: 24px;
  font-size: 12px;
}
.phone-section-heading p,
.phone-item-title p {
  color: rgba(var(--v-theme-on-surface), 0.65);
  font-size: 12px;
  margin: 4px 0 0;
}
.phone-empty {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: rgb(var(--v-theme-surface));
  border: 1px dashed rgba(var(--v-theme-primary), 0.25);
  border-radius: 12px;
}
.phone-empty strong {
  font-size: 14px;
}
.phone-empty p {
  font-size: 12px;
  margin: 4px 0 0;
  color: rgba(var(--v-theme-on-surface), 0.65);
}
.phone-table-hint {
  font-size: 11px;
  color: rgba(var(--v-theme-on-surface), 0.65);
  margin: 0 0 6px;
}
.phone-table-viewport {
  max-height: var(--items-height);
  overflow: auto;
  overscroll-behavior: contain;
  border: 1px solid rgba(var(--v-border-color), 0.18);
  border-radius: 12px;
  background: rgb(var(--v-theme-surface));
  scrollbar-width: thin;
  scroll-padding-block-start: 44px;
  scroll-padding-inline: 124px 92px;
}
.phone-items-table {
  border-collapse: separate;
  border-spacing: 0;
  table-layout: fixed;
  width: 100%;
  min-width: 488px;
}
.phone-items-table th,
.phone-items-table td {
  padding: 6px 4px;
  text-align: center;
  border-bottom: 1px solid rgba(var(--v-border-color), 0.12);
  background: rgb(var(--v-theme-surface));
}
.phone-items-table thead th {
  position: sticky;
  top: 0;
  z-index: 2;
  height: 44px;
  background: rgb(var(--v-theme-surface));
  font-size: 12px;
  white-space: nowrap;
}
.phone-items-table .sticky-item {
  position: sticky;
  inset-inline-start: 0;
  z-index: 1;
  text-align: start;
  padding-inline: 8px;
  border-inline-end: 1px solid rgba(var(--v-border-color), 0.14);
}
.phone-items-table .sticky-actions {
  position: sticky;
  inset-inline-end: 0;
  z-index: 1;
  border-inline-start: 1px solid rgba(var(--v-border-color), 0.14);
}
.phone-items-table thead .sticky-item,
.phone-items-table thead .sticky-actions {
  z-index: 3;
}
.phone-row-name {
  font-size: 13px;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  overflow-wrap: anywhere;
}
.phone-items-table small {
  font-size: 10px;
  color: rgba(var(--v-theme-on-surface), 0.6);
  font-weight: 400;
}
.phone-row-total {
  font-size: 13px;
  font-weight: 700;
  color: rgb(var(--v-theme-primary));
  overflow-wrap: anywhere;
}
.item-row-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
}
.item-row-actions .v-btn {
  flex: none;
}
@media (max-width: 599.98px) {
  .item-row-actions .v-btn {
    width: 44px !important;
    min-width: 44px !important;
    height: 44px !important;
    min-height: 44px !important;
    block-size: 44px !important;
  }
  .phone-table-viewport .row-number {
    min-width: 0;
  }
  .phone-table-viewport :deep(input) {
    text-align: center;
    padding-inline: 4px !important;
  }
}
.phone-add-screen {
  height: 100dvh;
}
.phone-add-content {
  padding: 24px 16px !important;
}
.phone-overline {
  font-size: 13px;
  color: rgba(var(--v-theme-on-surface), 0.6);
  margin-bottom: 16px;
}
.phone-selected-product {
  margin-top: 28px;
}
.phone-selected-product h2 {
  font-size: 20px;
  overflow-wrap: anywhere;
}
.phone-selected-product > p {
  color: rgba(var(--v-theme-on-surface), 0.65);
}
.phone-add-total {
  display: flex;
  justify-content: space-between;
  padding: 20px 16px;
  margin-top: 24px;
  border-radius: 16px;
  background: rgba(var(--v-theme-primary), 0.08);
}
.phone-add-total strong {
  color: rgb(var(--v-theme-primary));
}
.phone-search-hint {
  text-align: center;
  padding: 64px 16px;
  color: rgba(var(--v-theme-on-surface), 0.45);
  line-height: 2;
}
.phone-add-actions {
  flex-shrink: 0;
  padding: 12px 16px calc(12px + env(safe-area-inset-bottom)) !important;
  border-top: 1px solid rgba(var(--v-border-color), 0.12);
}
.phone-add-actions .v-btn {
  height: 52px;
}
</style>
