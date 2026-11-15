<template>
  <div class="filters-sidebar" :class="{ 'filters-sidebar--mobile': mobile }" dir="rtl">
    <p class="text-caption text-medium-emphasis mb-4">تتحدث النتائج تلقائيًا. يمكنك اختيار أكثر من تصنيف وعلامة تجارية.</p>
    <!-- Categories -->
    <div v-if="props.categories.length > 0" class="filter-section mb-6">
      <div class="filter-title d-flex align-center justify-space-between mb-3">
        <span class="font-weight-bold text-body-1">التصنيفات</span>
        <v-btn v-if="localFilters.category_ids.length" variant="text" size="x-small" color="primary" @click="clearCategory">
          مسح
        </v-btn>
      </div>
      <div class="category-list">
        <button
          v-for="cat in props.categories"
          :key="cat.id"
          class="category-item d-flex align-center justify-space-between rounded-lg px-3 py-2 mb-1 cursor-pointer"
          type="button"
          :aria-pressed="localFilters.category_ids.includes(Number(cat.id))"
          :class="{ 'category-active': localFilters.category_ids.includes(Number(cat.id)) }"
          @click="selectCategory(cat.id)"
        >
          <span class="text-body-2"><v-icon v-if="localFilters.category_ids.includes(Number(cat.id))" icon="ri-check-line" size="16" class="me-1" />{{ cat.name }}</span>
          <v-chip size="x-small" :color="localFilters.category_ids.includes(Number(cat.id)) ? 'primary' : 'default'" variant="flat">
            {{ cat.products_count || '' }}
          </v-chip>
        </button>
      </div>
      <v-divider class="mt-6"></v-divider>
    </div>

    <!-- Price Range -->
    <div class="filter-section mb-6">
      <div class="filter-title font-weight-bold text-body-1 mb-3">نطاق السعر</div>
      <v-row dense class="mb-4">
        <v-col cols="6">
          <v-text-field
            v-model.number="localFilters.min_price"
            label="من (ج.م)"
            variant="outlined"
            density="compact"
            hide-details
            type="number"
            min="0"
            @update:model-value="schedulePriceFilters"
          ></v-text-field>
        </v-col>
        <v-col cols="6">
          <v-text-field
            v-model.number="localFilters.max_price"
            label="إلى (ج.م)"
            variant="outlined"
            density="compact"
            hide-details
            type="number"
            min="0"
            @update:model-value="schedulePriceFilters"
          ></v-text-field>
        </v-col>
      </v-row>
      <p v-if="priceError" role="alert" class="text-error text-caption">{{ priceError }}</p>
    </div>

    <v-divider class="mb-6"></v-divider>

    <!-- In Stock Only -->
    <div class="filter-section mb-6">
      <v-checkbox
        v-model="localFilters.in_stock"
        label="متوفر في المخزون فقط"
        color="primary"
        hide-details
        density="compact"
        @update:model-value="emitFilters"
      ></v-checkbox>
    </div>

    <v-divider class="mb-6"></v-divider>

    <!-- Brands -->
    <div v-if="props.brands.length > 0" class="filter-section mb-6">
      <div class="filter-title font-weight-bold text-body-1 mb-3">العلامات التجارية</div>
      <div class="d-flex flex-wrap gap-2">
        <v-chip
          v-for="brand in props.brands"
          :key="brand.id"
          size="small"
          :color="localFilters.brand_ids.includes(Number(brand.id)) ? 'primary' : 'default'"
          :variant="localFilters.brand_ids.includes(Number(brand.id)) ? 'flat' : 'tonal'"
          role="button"
          :aria-pressed="localFilters.brand_ids.includes(Number(brand.id))"
          @click="toggleBrand(brand.id)"
          class="cursor-pointer"
        >
          {{ brand.name }}
        </v-chip>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, watch, computed, onBeforeUnmount } from 'vue'
import { normalizeCatalogFilters } from '../utils/catalogFilters'

const props = defineProps({
  categories: { type: Array, default: () => [] },
  brands: { type: Array, default: () => [] },
  filters: { type: Object, default: () => ({}) },
  mobile: Boolean,
})

const emit = defineEmits(['update:filters'])

const localFilters = ref(normalizeCatalogFilters(props.filters))
let priceTimer
const priceError = computed(() => {
  const { min_price: min, max_price: max } = localFilters.value
  if ([min, max].some(value => value != null && value !== '' && (!Number.isFinite(Number(value)) || Number(value) < 0))) return 'أدخل سعرًا صحيحًا لا يقل عن صفر'
  return min != null && min !== '' && max != null && max !== '' && Number(min) > Number(max) ? 'الحد الأعلى يجب ألا يقل عن الحد الأدنى' : ''
})

watch(() => props.filters, (nv) => {
  clearTimeout(priceTimer)
  localFilters.value = normalizeCatalogFilters(nv)
}, { deep: true })

const selectCategory = (id) => {
  toggleId('category_ids', Number(id))
}

const clearCategory = () => {
  localFilters.value.category_ids = []
  emitFilters()
}

const toggleBrand = (id) => {
  toggleId('brand_ids', Number(id))
}

const toggleId = (key, id) => {
  const ids = localFilters.value[key]
  localFilters.value[key] = ids.includes(id) ? ids.filter(value => value !== id) : [...ids, id]
  emitFilters()
}

const emitFilters = () => {
  clearTimeout(priceTimer)
  if (!priceError.value) emit('update:filters', normalizeCatalogFilters(localFilters.value))
}
const schedulePriceFilters = () => {
  clearTimeout(priceTimer)
  priceTimer = setTimeout(emitFilters, 350)
}
onBeforeUnmount(() => clearTimeout(priceTimer))
</script>

<style scoped>
.filters-sidebar {
  background: white;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  position: sticky;
  top: 90px;
}

.category-item {
  width: 100%;
  border: 0;
  background: transparent;
  text-align: start;
  transition: all 0.15s ease;
  cursor: pointer;
}

.category-item:focus-visible { outline: 2px solid #1a73e8; outline-offset: 2px; }
.filters-sidebar--mobile { position: static; padding: 0; box-shadow: none; border-radius: 0; }

.category-item:hover {
  background: #f1f5f9;
}

.category-active {
  background: #eff6ff !important;
  color: #1a73e8;
  font-weight: 600;
}

.price-field {
  flex: 1;
}

.cursor-pointer {
  cursor: pointer;
}
</style>
