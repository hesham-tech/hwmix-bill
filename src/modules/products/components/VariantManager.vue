<template>
  <div class="variant-manager">

    <!-- ===== Variant Tabs Navigation (Top Level) ===== -->
    <div class="vm-shell border rounded-lg overflow-hidden">

      <!-- Row 1: Variant Selector Tabs (Segmented Control style) -->
      <div class="vm-variant-tabs-row d-flex align-center justify-space-between pa-2 bg-grey-lighten-5 border-b">
        <div class="vm-segmented-control d-flex align-center pa-1 bg-grey-lighten-4 rounded-lg">
          <button
            v-for="(variant, vIndex) in modelValue"
            :key="vIndex"
            class="vm-segment-btn"
            :class="{ 'vm-segment-btn--active': activeVariantIndex === vIndex }"
            @click="switchVariant(vIndex)"
          >
            <div class="d-flex align-center gap-2">
              <!-- Variant Thumbnail or Dot -->
              <v-avatar
                v-if="getVariantThumbnail(variant)"
                size="20"
                class="rounded-md border flex-shrink-0"
                style="border-color: rgba(0,0,0,0.1) !important;"
              >
                <v-img :src="getVariantThumbnail(variant)" cover crossorigin="anonymous" />
              </v-avatar>
              <div
                v-else
                class="v-dot flex-shrink-0"
                :class="variant.sku ? 'bg-primary' : 'bg-grey-lighten-2'"
              />

              <!-- Title & Details -->
              <div class="d-flex flex-column align-start">
                <div class="d-flex align-center gap-1">
                  <span class="vm-tab-title">متغير #{{ vIndex + 1 }}</span>
                  <!-- Completion dot -->
                  <span v-if="variant.retail_price" class="vm-done-dot" />
                </div>
                
                <!-- Sub-details with icons -->
                <div
                  v-if="variant.retail_price || (productType === 'physical' && calculateTotalQty(variant) > 0) || hasAttributes(variant)"
                  class="d-flex align-center gap-2 mt-0.5 text-xxs"
                  style="opacity: 0.85;"
                >
                  <!-- Price -->
                  <div v-if="variant.retail_price" class="d-flex align-center gap-0.5 text-success" style="gap: 2px;">
                    <v-icon icon="ri-money-dollar-circle-line" size="10" />
                    <span class="font-weight-bold">{{ variant.retail_price }}</span>
                  </div>
                  <!-- Stock -->
                  <div v-if="productType === 'physical' && calculateTotalQty(variant) > 0" class="d-flex align-center gap-0.5 text-info" style="gap: 2px;">
                    <v-icon icon="ri-archive-line" size="10" />
                    <span class="font-weight-bold">{{ calculateTotalQty(variant) }}</span>
                  </div>
                  <!-- Attributes -->
                  <div v-if="hasAttributes(variant)" class="d-flex align-center gap-0.5 text-secondary" style="gap: 2px;">
                    <v-icon icon="ri-price-tag-3-line" size="10" />
                    <div class="d-flex align-center" style="gap: 1px; max-width: 80px; overflow: hidden; white-space: nowrap;">
                      <template v-for="(attr, index) in getVariantAttributesList(variant)" :key="index">
                        <span
                          class="font-weight-bold"
                          :style="attr.color ? { color: attr.color } : {}"
                        >
                          {{ attr.name }}
                        </span>
                        <span v-if="index < getVariantAttributesList(variant).length - 1" class="text-grey-darken-1" style="margin-inline-end: 1px;">,</span>
                      </template>
                    </div>
                  </div>
                </div>
                
                <!-- SKU as fallback if nothing else is filled -->
                <span v-else-if="variant.sku" class="vm-tab-sku">{{ variant.sku }}</span>
              </div>
            </div>
            
            <!-- Delete action on segment (visible on hover) -->
            <v-btn
              v-if="vIndex > 0"
              icon="ri-close-line"
              size="x-small"
              variant="text"
              color="error"
              density="compact"
              class="ms-2 delete-segment-btn"
              :title="'حذف متغير #' + (vIndex + 1)"
              @click.stop="removeVariant(vIndex)"
            />
          </button>

          <!-- Add Variant Button inside control -->
          <button class="vm-segment-add-btn" @click="addVariant">
            <v-icon icon="ri-add-line" size="12" />
            <span>إضافة</span>
          </button>
        </div>

        <!-- Right Side Stats / Spacer -->
        <div class="d-flex align-center gap-2">
          <v-chip
            v-if="modelValue.length > 0"
            size="x-small"
            color="primary"
            variant="tonal"
            density="compact"
            class="flex-shrink-0"
          >
            {{ modelValue.length }} متغير
          </v-chip>
        </div>
      </div>

      <!-- Row 2: Sub-tabs + Quick Stats for active variant -->
      <div v-if="modelValue.length > 0 && currentVariant" class="vm-sub-tabs d-flex align-center border-b bg-white px-3 py-1">
        <button
          v-for="tab in getVariantTabs(productType)"
          :key="tab.key"
          class="vm-sub-tab"
          :class="['vm-sub-tab--' + tab.key, { 'vm-sub-tab--active': activeSubTab === tab.key }]"
          @click="activeSubTab = tab.key"
        >
          <v-icon :icon="tab.icon" size="13" class="me-1" />
          <span>{{ tab.label }}</span>
          <span v-if="getTabCompletion(currentVariant, tab.key)" class="sub-done-icon ms-1">✓</span>
          <v-badge
            v-else-if="tab.key === 'stock' && productType === 'physical' && calculateTotalQty(currentVariant) > 0"
            :content="calculateTotalQty(currentVariant)"
            color="primary"
            inline
            size="x-small"
            class="ms-1"
          />
        </button>

        <!-- Quick stats on the left side -->
        <div class="d-flex align-center gap-3 ms-auto me-1 flex-shrink-0">
          <div v-if="productType === 'physical'" class="d-flex align-center gap-1">
            <v-icon icon="ri-stack-line" size="12" color="grey" />
            <span class="text-xxs text-grey">{{ calculateTotalQty(currentVariant) }}</span>
          </div>
          <template v-if="currentVariant.retail_price">
            <span class="text-xxs font-weight-bold text-success">{{ currentVariant.retail_price }} ج.م</span>
          </template>
          <v-chip
            v-if="currentVariant.purchase_price && currentVariant.retail_price"
            size="x-small"
            :color="getProfitColor(currentVariant, 'retail')"
            variant="flat"
            density="compact"
            class="text-xxs font-weight-bold"
          >
            {{ calculateProfitMargin(currentVariant, 'retail') }}%
          </v-chip>
        </div>
      </div>

      <!-- ===== Tab Content Area ===== -->
      <div
        v-if="modelValue.length > 0 && currentVariant"
        class="vm-content bg-white"
        :class="'vm-content--' + activeSubTab"
      >

        <!-- TAB: الأسعار -->
        <div v-show="activeSubTab === 'prices'" class="pa-3">
          <v-row dense>
            <v-col cols="12" sm="3" v-if="can(PERMISSIONS.PRODUCTS_VIEW_PURCHASE_PRICE)">
              <AppInput
                v-model.number="currentVariant.purchase_price"
                label="سعر الشراء"
                type="number"
                prefix="ج.م"
                class="price-input"
                hint="التكلفة الأساسية"
                persistent-hint
                @update:model-value="calculateProfitFromPrices(currentVariant)"
              />
            </v-col>
            <v-col cols="12" sm="3" v-if="can(PERMISSIONS.PRODUCTS_VIEW_WHOLESALE_PRICE)">
              <AppInput
                v-model.number="currentVariant.wholesale_price"
                label="سعر الجملة"
                type="number"
                prefix="ج.م"
                class="price-input"
              />
            </v-col>
            <v-col cols="12" sm="3">
              <AppInput
                v-model.number="currentVariant.retail_price"
                label="سعر القطاعي *"
                type="number"
                required
                prefix="ج.م"
                class="price-input"
                @update:model-value="calculateProfitFromPrices(currentVariant)"
              />
            </v-col>
            <v-col cols="12" sm="3">
              <AppInput
                v-model.number="currentVariant.profit_margin"
                label="هامش الربح %"
                type="number"
                prefix="%"
                class="price-input"
                hint="الربح من التكلفة"
                persistent-hint
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
            <v-col cols="12" sm="6" v-if="currentVariant.wholesale_price && can(PERMISSIONS.PRODUCTS_VIEW_WHOLESALE_PRICE)">
              <v-alert
                :color="getProfitColor(currentVariant, 'wholesale')"
                variant="tonal"
                density="compact"
                class="pa-2"
                :icon="getProfitIcon(currentVariant, 'wholesale')"
              >
                <div class="d-flex align-center justify-space-between">
                  <span class="text-xxs font-weight-bold">ربح الجملة</span>
                  <v-chip size="x-small" :color="getProfitColor(currentVariant, 'wholesale')" variant="flat" density="compact">
                    {{ calculateProfitMargin(currentVariant, 'wholesale') }}%
                  </v-chip>
                </div>
                <div class="text-xxs mt-1 text-grey-darken-1">{{ calculateProfitAmount(currentVariant, 'wholesale') }} ج.م / وحدة</div>
              </v-alert>
            </v-col>
            <v-col cols="12" sm="6" v-if="currentVariant.retail_price">
              <v-alert
                :color="getProfitColor(currentVariant, 'retail')"
                variant="tonal"
                density="compact"
                class="pa-2"
                :icon="getProfitIcon(currentVariant, 'retail')"
              >
                <div class="d-flex align-center justify-space-between">
                  <span class="text-xxs font-weight-bold">ربح القطاعي</span>
                  <v-chip size="x-small" :color="getProfitColor(currentVariant, 'retail')" variant="flat" density="compact">
                    {{ calculateProfitMargin(currentVariant, 'retail') }}%
                  </v-chip>
                </div>
                <div class="text-xxs mt-1 text-grey-darken-1">{{ calculateProfitAmount(currentVariant, 'retail') }} ج.م / وحدة</div>
              </v-alert>
            </v-col>
          </v-row>

          <!-- SKU & Barcode -->
          <v-divider class="my-3" />
          <v-row dense>
            <v-col cols="12" sm="6">
              <AppInput
                v-model="currentVariant.sku"
                label="SKU — كود الصنف"
                placeholder="مثال: SHIRT-RED-XL"
                prepend-inner-icon="ri-hashtag"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <AppInput
                v-model="currentVariant.barcode"
                label="الباركود"
                placeholder="اتركه فارغاً للتوليد التلقائي"
                prepend-inner-icon="ri-barcode-line"
              />
            </v-col>
          </v-row>
        </div>

        <!-- TAB: المخزون -->
        <div v-show="activeSubTab === 'stock' && productType === 'physical'" class="pa-3">
          <div class="d-flex align-center justify-space-between mb-3">
            <div class="d-flex align-center gap-2">
              <v-icon icon="ri-store-2-line" color="primary" size="14" />
              <div>
                <div class="text-xxs font-weight-bold">توزيع المخزون الافتتاحي</div>
                <div class="text-xxs text-grey">وزّع الكميات على الفروع والمستودعات</div>
              </div>
            </div>
            <div class="d-flex align-center gap-2">
              <v-chip
                v-if="calculateTotalQty(currentVariant) > 0"
                size="small"
                color="success"
                variant="flat"
                density="compact"
                prepend-icon="ri-stack-line"
              >
                الإجمالي: {{ calculateTotalQty(currentVariant) }}
              </v-chip>
              <v-btn
                size="x-small"
                variant="tonal"
                color="primary"
                density="compact"
                prepend-icon="ri-add-line"
                class="rounded-md"
                @click="addStock(activeVariantIndex)"
              >
                إضافة فرع
              </v-btn>
            </div>
          </div>

          <div
            v-for="(stock, sIndex) in currentVariant.stocks"
            :key="sIndex"
            class="stock-card border rounded-lg pa-3 mb-2"
          >
            <div class="d-flex align-center justify-space-between mb-2">
              <div class="d-flex align-center gap-1">
                <v-icon icon="ri-store-2-line" size="11" color="grey" />
                <span class="text-xxs text-grey font-weight-bold">فرع / مستودع #{{ sIndex + 1 }}</span>
              </div>
              <v-btn
                v-if="sIndex !== 0"
                icon="ri-delete-bin-7-line"
                size="x-small"
                variant="text"
                color="error"
                density="compact"
                :disabled="currentVariant.stocks?.length <= 1"
                @click="removeStock(activeVariantIndex, sIndex)"
              />
            </div>
            <v-row dense align="center">
              <v-col cols="12" sm="5">
                <AppAutocomplete
                  v-model="stock.warehouse_id"
                  label="المستودع / الفرع"
                  api-endpoint="warehouses"
                  item-title="name"
                  item-value="id"
                  density="compact"
                  variant="outlined"
                  hide-details
                  prepend-inner-icon="ri-store-2-line"
                />
              </v-col>
              <v-col cols="6" sm="4">
                <AppInput
                  v-model.number="stock.quantity"
                  label="الكمية *"
                  type="number"
                  density="compact"
                  variant="outlined"
                  hide-details="auto"
                  placeholder="0"
                  prepend-inner-icon="ri-stack-line"
                  :rules="stockRules"
                  :readonly="!can(PERMISSIONS.STOCKS_MANUAL_ADJUSTMENT) && !can(PERMISSIONS.ADMIN_SUPER) && !can(PERMISSIONS.ADMIN_COMPANY)"
                />
              </v-col>
              <v-col cols="6" sm="3">
                <v-select
                  v-model="stock.unit_id"
                  :items="filteredUnits"
                  item-title="name"
                  item-value="id"
                  label="الوحدة"
                  variant="outlined"
                  density="compact"
                  hide-details="auto"
                  :disabled="!selectedGroup"
                  :placeholder="!selectedGroup ? 'اختر مجموعة أولاً' : ''"
                >
                  <template #prepend-inner>
                    <v-icon icon="ri-scales-3-line" size="14" color="grey" />
                  </template>
                </v-select>
              </v-col>
            </v-row>
          </div>

          <div v-if="!currentVariant.stocks?.length" class="text-center py-6 border-dashed rounded-lg">
            <v-icon icon="ri-store-2-line" color="grey-lighten-2" size="28" />
            <div class="text-xxs text-grey mt-1">لا يوجد مستودع محدد</div>
            <v-btn size="x-small" variant="tonal" color="primary" class="mt-2 rounded-md" prepend-icon="ri-add-line" @click="addStock(activeVariantIndex)">
              إضافة مستودع
            </v-btn>
          </div>
        </div>

        <!-- TAB: الصفات -->
        <div v-show="activeSubTab === 'attributes'" class="pa-3">
          <div class="d-flex align-center justify-space-between mb-3">
            <div>
              <div class="text-xxs font-weight-bold">المواصفات والخصائص</div>
              <div class="text-xxs text-grey">مثال: اللون، المقاس، المادة...</div>
            </div>
            <v-btn
              size="x-small"
              variant="tonal"
              color="secondary"
              density="compact"
              prepend-icon="ri-add-line"
              class="rounded-md"
              @click="addAttribute(activeVariantIndex)"
            >
              إضافة صفة
            </v-btn>
          </div>

          <div v-if="!currentVariant.attributes?.length" class="text-center py-6 border-dashed rounded-lg">
            <v-icon icon="ri-list-settings-line" color="grey-lighten-2" size="28" />
            <div class="text-xxs text-grey mt-1">لا توجد مواصفات بعد</div>
          </div>

          <div v-else class="d-flex flex-wrap gap-2">
            <div
              v-for="(attr, aIndex) in currentVariant.attributes"
              :key="aIndex"
              class="attr-pill-group d-flex align-center border rounded-lg bg-white overflow-hidden"
            >
              <div class="attr-label-box bg-grey-lighten-5 px-2 py-2 border-e">
                <AppAutocomplete
                  v-model="attr.attribute_id"
                  label="الصفة"
                  :items="attributeList"
                  item-title="name"
                  item-value="id"
                  density="compact"
                  variant="plain"
                  hide-details
                  class="attr-input"
                >
                  <template #no-data>
                    <v-list-item @click="openCreateAttributeDialog(activeVariantIndex, aIndex)">
                      <template #prepend><v-icon color="primary" icon="ri-add-line" /></template>
                      <v-list-item-title>إضافة خاصية جديدة...</v-list-item-title>
                    </v-list-item>
                  </template>
                </AppAutocomplete>
              </div>
              <div class="attr-value-box px-2 py-2">
                <AppAutocomplete
                  v-if="attr.attribute_id"
                  v-model="attr.attribute_value_id"
                  label="القيمة"
                  :items="attributeValuesMap[attr.attribute_id] || []"
                  item-title="name"
                  item-value="id"
                  density="compact"
                  variant="plain"
                  hide-details
                  class="attr-input"
                >
                  <template #no-data>
                    <v-list-item @click="openCreateValueDialog(attr.attribute_id, activeVariantIndex, aIndex)">
                      <template #prepend><v-icon color="primary" icon="ri-add-line" /></template>
                      <v-list-item-title>إضافة قيمة...</v-list-item-title>
                    </v-list-item>
                  </template>
                  <template #selection="{ item }">
                    <v-chip
                      v-if="item?.raw?.color"
                      size="small"
                      :style="{ backgroundColor: item.raw.color, color: getContrastColor(item.raw.color) }"
                    >{{ item.raw.name }}</v-chip>
                    <span v-else-if="item?.raw">{{ item.raw.name }}</span>
                  </template>
                  <template #item="{ props: ip, item }">
                    <v-list-item
                      v-if="item?.raw"
                      v-bind="ip"
                      :style="item.raw.color ? { backgroundColor: item.raw.color, color: getContrastColor(item.raw.color) } : {}"
                    />
                  </template>
                </AppAutocomplete>
                <div v-else class="text-xxs text-grey italic pa-1">اختر الصفة أولاً</div>
              </div>
              <v-btn icon="ri-close-line" size="x-small" variant="text" color="grey" class="mx-1" @click="removeAttribute(activeVariantIndex, aIndex)" />
            </div>
          </div>
        </div>

        <!-- TAB: الصور -->
        <div v-show="activeSubTab === 'images'" class="pa-3">
          <div class="d-flex align-center gap-2 mb-3">
            <v-icon icon="ri-image-line" color="primary" size="14" />
            <div>
              <div class="text-xxs font-weight-bold">صور هذا المتغير</div>
              <div class="text-xxs text-grey">صور خاصة بهذا اللون أو الحجم (اختياري)</div>
            </div>
          </div>
          <ProductMediaManager
            v-model="currentVariant.images"
            v-model:primaryImageId="currentVariant.primary_image_id"
          />
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

    <!-- ===== Summary Table at Bottom ===== -->
    <div v-if="modelValue.length > 0" class="vm-summary-table mt-4 border rounded-lg overflow-hidden">
      <div class="summary-header d-flex align-center justify-space-between pa-2 bg-grey-lighten-5 border-b">
        <div class="d-flex align-center gap-2">
          <v-icon icon="ri-table-2" color="grey-darken-1" size="14" />
          <span class="text-xxs font-weight-bold text-grey-darken-1">جدول ملخص جميع المتغيرات</span>
        </div>
        <v-btn
          size="x-small"
          variant="text"
          color="grey"
          :icon="summaryCollapsed ? 'ri-arrow-down-s-line' : 'ri-arrow-up-s-line'"
          density="compact"
          @click="summaryCollapsed = !summaryCollapsed"
        />
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
                      <v-chip
                        v-if="attr.attribute_id && attr.attribute_value_id"
                        size="x-small"
                        variant="tonal"
                        color="secondary"
                        density="compact"
                        class="text-xxs"
                      >
                        {{ getAttributeLabel(attr) }}
                      </v-chip>
                    </template>
                    <span v-if="!hasAttributes(variant)" class="text-grey text-xxs">—</span>
                  </div>
                </td>
                <td v-if="can(PERMISSIONS.PRODUCTS_VIEW_PURCHASE_PRICE)" class="text-end">
                  {{ variant.purchase_price || '—' }}
                </td>
                <td v-if="can(PERMISSIONS.PRODUCTS_VIEW_WHOLESALE_PRICE)" class="text-end">
                  {{ variant.wholesale_price || '—' }}
                </td>
                <td class="text-end font-weight-bold">{{ variant.retail_price || '—' }}</td>
                <td class="text-center">
                  <v-chip
                    v-if="variant.purchase_price && variant.retail_price"
                    size="x-small"
                    :color="getProfitColor(variant, 'retail')"
                    variant="flat"
                    density="compact"
                    class="font-weight-bold"
                  >
                    {{ calculateProfitMargin(variant, 'retail') }}%
                  </v-chip>
                  <span v-else class="text-grey text-xxs">—</span>
                </td>
                <td v-if="productType === 'physical'" class="text-end font-weight-bold">
                  {{ calculateTotalQty(variant) || '—' }}
                </td>
                <td class="text-center">
                  <v-badge :content="variant.images?.length || 0" color="primary" inline size="x-small" />
                </td>
                <td class="text-center">
                  <div class="d-flex justify-center gap-1">
                    <v-btn
                      icon="ri-edit-line"
                      size="x-small"
                      variant="text"
                      color="primary"
                      density="compact"
                      :title="'تعديل متغير #' + (vIdx + 1)"
                      @click.stop="switchVariant(vIdx)"
                    />
                    <v-btn
                      v-if="vIdx > 0"
                      icon="ri-delete-bin-line"
                      size="x-small"
                      variant="text"
                      color="error"
                      density="compact"
                      :title="'حذف متغير #' + (vIdx + 1)"
                      @click.stop="removeVariant(vIdx)"
                    />
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
    <AttributeValueFormDialog
      v-if="selectedAttributeForValue"
      v-model="showValueDialog"
      :attribute="selectedAttributeForValue"
      @saved="handleValueSaved"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';

const stockRules = [
  v => (v !== null && v !== undefined && v !== '') || 'قيمة المخزون مطلوبة',
  v => /^\d+$/.test(v) || 'يجب إدخال أرقام فقط',
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
const activeSubTab = ref('prices');
const summaryCollapsed = ref(false);

// المتغير النشط حالياً
const currentVariant = computed(() => props.modelValue[activeVariantIndex.value] ?? null);

const switchVariant = (idx) => {
  activeVariantIndex.value = idx;
  activeSubTab.value = 'prices';
};

// قائمة التابات بحسب نوع المنتج
const getVariantTabs = (type) => {
  const tabs = [
    { key: 'prices', label: 'الأسعار', icon: 'ri-price-tag-3-line' },
  ];
  if (type === 'physical') {
    tabs.push({ key: 'stock', label: 'المخزون', icon: 'ri-store-2-line' });
  }
  tabs.push(
    { key: 'attributes', label: 'الصفات', icon: 'ri-equalizer-line' },
    { key: 'images', label: 'الصور', icon: 'ri-image-line' },
  );
  return tabs;
};

// اكتمال كل تاب
const getTabCompletion = (variant, key) => {
  if (!variant) return false;
  if (key === 'prices') return !!variant.retail_price;
  if (key === 'stock') return calculateTotalQty(variant) > 0;
  if (key === 'attributes') return hasAttributes(variant);
  if (key === 'images') return (variant.images?.length || 0) > 0;
  return false;
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
  variant?.stocks?.reduce((acc, s) => acc + (parseInt(s.quantity) || 0), 0) || 0;

const hasAttributes = (variant) =>
  variant?.attributes?.some(a => a.attribute_id && a.attribute_value_id) || false;

const getVariantAttrLabel = (variant) => {
  const found = variant.attributes?.find(a => a.attribute_id && a.attribute_value_id);
  if (!found) return '';
  const attr = attributeList.value.find(a => a.id === found.attribute_id);
  const val = attr?.values?.find(v => v.id === found.attribute_value_id);
  return val?.name || '';
};

const getVariantAllAttrsLabel = (variant) => {
  if (!variant?.attributes) return '';
  return variant.attributes
    .map(attr => {
      const attribute = attributeList.value.find(a => a.id === attr.attribute_id);
      const value = attribute?.values?.find(v => v.id === attr.attribute_value_id);
      return value ? value.name : '';
    })
    .filter(name => name)
    .join(', ');
};

const getVariantAttributesList = (variant) => {
  if (!variant?.attributes) return [];
  return variant.attributes
    .map(attr => {
      const attribute = attributeList.value.find(a => a.id === attr.attribute_id);
      const value = attribute?.values?.find(v => v.id === attr.attribute_value_id);
      if (!value) return null;
      return {
        name: value.name,
        color: value.color || null
      };
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
  activeSubTab.value = 'prices';
};

const duplicateVariant = (index) => {
  const newVariants = [...props.modelValue];
  const clone = {
    ...JSON.parse(JSON.stringify(newVariants[index])),
    id: undefined, sku: '', barcode: '',
    stocks: newVariants[index].stocks.map(s => ({ ...s, quantity: null, id: undefined })),
  };
  newVariants.splice(index + 1, 0, clone);
  emit('update:modelValue', newVariants);
  activeVariantIndex.value = index + 1;
  activeSubTab.value = 'prices';
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
/* ===== Shell ===== */
.variant-manager { font-size: 12px; }

.vm-shell {
  background: white;
}

/* ===== Segmented Control (Top Level Variant Selector) ===== */
.vm-variant-tabs-row {
  min-height: 58px;
  background-color: #fafafa !important;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08) !important;
}

.vm-segmented-control {
  background-color: #f1f3f5;
  gap: 4px;
  max-width: 100%;
  overflow-x: auto;
  scrollbar-width: none;
}
.vm-segmented-control::-webkit-scrollbar { display: none; }

.vm-segment-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border: none;
  background: transparent;
  color: #495057;
  cursor: pointer;
  border-radius: 6px;
  white-space: nowrap;
  transition: all 0.2s ease-in-out;
  min-height: 38px;
  font-weight: 500;
  position: relative;
}

.vm-segment-btn:hover {
  background: rgba(0, 0, 0, 0.04);
  color: #212529;
}

.vm-segment-btn--active {
  background: #ffffff !important;
  color: rgb(var(--v-theme-primary)) !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
  font-weight: 600;
}

.vm-segment-btn--active .vm-tab-title {
  color: rgb(var(--v-theme-primary));
}

.vm-segment-add-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  font-size: 11px;
  font-weight: 600;
  color: rgb(var(--v-theme-primary));
  border: none;
  background: transparent;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
  min-height: 38px;
  border-radius: 6px;
}

.vm-segment-add-btn:hover {
  background: rgba(var(--v-theme-primary), 0.08);
}

.delete-segment-btn {
  opacity: 0.5;
  transition: opacity 0.15s, transform 0.15s;
}
.vm-segment-btn:hover .delete-segment-btn {
  opacity: 1;
}

.vm-tab-title {
  font-size: 12px;
  font-weight: 600;
  color: rgba(0,0,0,0.7);
  display: block;
  line-height: 1.2;
}

.vm-tab-sku {
  font-size: 9px;
  color: rgb(var(--v-theme-primary));
  display: block;
  line-height: 1.2;
  opacity: 0.8;
}

.vm-done-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgb(var(--v-theme-success));
  flex-shrink: 0;
}

/* ===== Sub Tabs (Second Level) ===== */
.vm-sub-tabs {
  min-height: 42px;
  background-color: #ffffff;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08) !important;
}

.vm-sub-tab {
  display: inline-flex;
  align-items: center;
  padding: 8px 16px;
  font-size: 12px;
  font-weight: 500;
  color: #6c757d;
  border: none;
  background: transparent;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  white-space: nowrap;
  transition: all 0.2s ease;
  min-height: 42px;
}

.vm-sub-tab:hover {
  color: #212529;
  background: rgba(0, 0, 0, 0.02);
}

/* Active Sub-Tabs Colors (Accents only, no block backgrounds) */
.vm-sub-tab--prices.vm-sub-tab--active {
  color: #2e7d32 !important;
  border-bottom-color: #2e7d32 !important;
  font-weight: 600;
}

.vm-sub-tab--stock.vm-sub-tab--active {
  color: #1565c0 !important;
  border-bottom-color: #1565c0 !important;
  font-weight: 600;
}

.vm-sub-tab--attributes.vm-sub-tab--active {
  color: #6a1b9a !important;
  border-bottom-color: #6a1b9a !important;
  font-weight: 600;
}

.vm-sub-tab--images.vm-sub-tab--active {
  color: #00695c !important;
  border-bottom-color: #00695c !important;
  font-weight: 600;
}

.sub-done-icon {
  font-size: 10px;
  color: rgb(var(--v-theme-success));
  font-weight: bold;
}

/* ===== Content Area & Backgrounds (Pure White Canvas with thin color top border) ===== */
.vm-content {
  min-height: 220px;
  background-color: #ffffff !important; /* Pure white canvas */
}

.vm-content--prices {
  border-top: 2px solid #2e7d32 !important; /* Green accent top border */
}

.vm-content--stock {
  border-top: 2px solid #1565c0 !important; /* Blue accent top border */
}

.vm-content--attributes {
  border-top: 2px solid #6a1b9a !important; /* Purple accent top border */
}

.vm-content--images {
  border-top: 2px solid #00695c !important; /* Teal accent top border */
}

/* ===== Variant Dot ===== */
.v-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}

/* ===== Stock Card ===== */
.stock-card {
  transition: all 0.2s;
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.08);
}
.stock-card:hover {
  background: white !important;
  border-color: rgb(var(--v-theme-primary)) !important;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

/* ===== Attrs ===== */
.attr-pill-group {
  min-width: 260px;
  flex: 1 1 260px;
  transition: border-color 0.2s;
}
.attr-pill-group:hover {
  border-color: rgb(var(--v-theme-primary)) !important;
}
.attr-input { min-width: 110px; }
.attr-label-box { min-width: 120px; }
.attr-value-box { min-width: 120px; }

/* ===== Summary Table ===== */
.vm-summary-table { background: white; }

.summary-table {
  border-collapse: collapse;
  font-size: 11px;
}

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

.summary-row {
  transition: background 0.12s;
  cursor: pointer;
}
.summary-row:hover { background: rgba(var(--v-theme-primary), 0.03); }
.summary-row--active td { background: rgba(var(--v-theme-primary), 0.05); }

/* ===== Empty State ===== */
.vm-empty { border-radius: 0 0 8px 8px; }

/* ===== Misc ===== */
.text-xxs { font-size: 10px !important; }
.border-dashed { border: 1.5px dashed rgba(0,0,0,0.1); }
.price-input :deep(input) { text-align: center; }
.w-100 { width: 100% !important; }
.gap-1 { gap: 4px; }
.gap-2 { gap: 8px; }
.gap-3 { gap: 12px; }
</style>
