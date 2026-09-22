<template>
  <div class="filters-sidebar" dir="rtl">
    <!-- Categories -->
    <div class="filter-section mb-6">
      <div class="filter-title d-flex align-center justify-space-between mb-3">
        <span class="font-weight-bold text-body-1">التصنيفات</span>
        <v-btn v-if="localFilters.category_id" variant="text" size="x-small" color="primary" @click="clearCategory">
          مسح
        </v-btn>
      </div>
      <div class="category-list">
        <div
          v-for="cat in props.categories"
          :key="cat.id"
          class="category-item d-flex align-center justify-space-between rounded-lg px-3 py-2 mb-1 cursor-pointer"
          :class="{ 'category-active': localFilters.category_id === cat.id }"
          @click="selectCategory(cat.id)"
        >
          <span class="text-body-2">{{ cat.name }}</span>
          <v-chip size="x-small" :color="localFilters.category_id === cat.id ? 'primary' : 'default'" variant="flat">
            {{ cat.products_count || '' }}
          </v-chip>
        </div>
      </div>
    </div>

    <v-divider class="mb-6"></v-divider>

    <!-- Price Range -->
    <div class="filter-section mb-6">
      <div class="filter-title font-weight-bold text-body-1 mb-3">نطاق السعر</div>
      <div class="price-inputs d-flex gap-2 mb-4">
        <v-text-field
          v-model.number="localFilters.min_price"
          label="من"
          variant="outlined"
          density="compact"
          hide-details
          type="number"
          suffix="ج.م"
          class="price-field"
        ></v-text-field>
        <v-text-field
          v-model.number="localFilters.max_price"
          label="إلى"
          variant="outlined"
          density="compact"
          hide-details
          type="number"
          suffix="ج.م"
          class="price-field"
        ></v-text-field>
      </div>
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
          :color="localFilters.brand_id === brand.id ? 'primary' : 'default'"
          :variant="localFilters.brand_id === brand.id ? 'flat' : 'tonal'"
          @click="toggleBrand(brand.id)"
          class="cursor-pointer"
        >
          {{ brand.name }}
        </v-chip>
      </div>
    </div>

    <!-- Apply Button -->
    <v-btn
      color="primary"
      block
      class="font-weight-bold rounded-xl"
      height="48"
      @click="emitFilters"
    >
      تطبيق الفلاتر
    </v-btn>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  categories: { type: Array, default: () => [] },
  brands: { type: Array, default: () => [] },
  filters: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['update:filters'])

const localFilters = ref({
  category_id: null,
  brand_id: null,
  min_price: null,
  max_price: null,
  in_stock: false,
  ...props.filters
})

watch(() => props.filters, (nv) => {
  localFilters.value = { ...localFilters.value, ...nv }
}, { deep: true })

const selectCategory = (id) => {
  localFilters.value.category_id = localFilters.value.category_id === id ? null : id
}

const clearCategory = () => {
  localFilters.value.category_id = null
}

const toggleBrand = (id) => {
  localFilters.value.brand_id = localFilters.value.brand_id === id ? null : id
}

const emitFilters = () => {
  emit('update:filters', { ...localFilters.value })
}
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
  transition: all 0.15s ease;
  cursor: pointer;
}

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
