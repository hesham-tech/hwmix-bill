<template>
  <div class="search-create-select">
    <div class="d-flex align-center justify-space-between mb-1">
      <label class="text-caption font-weight-bold text-grey-darken-1">{{ label }}</label>
    </div>
    <v-autocomplete
      v-model="selectedId"
      :items="items"
      :item-title="itemTitle"
      item-value="id"
      :placeholder="placeholder"
      :loading="isLoading"
      v-model:search="searchText"
      variant="solo"
      flat
      bg-color="grey-lighten-4"
      class="premium-input-field"
      clearable
      hide-details
      ref="autocompleteRef"
      @keydown.enter.prevent="handleFreeTextOnEnter"
    >
      <template #no-data>
        <v-list-item v-if="searchText" @click="handleCreation(searchText)">
          <template #prepend>
            <v-icon icon="ri-add-line" color="primary" class="me-2"></v-icon>
          </template>
          <v-list-item-title> إضافة "{{ searchText }}" كـ {{ label }} جديد </v-list-item-title>
        </v-list-item>
        <v-list-item v-else>
          <v-list-item-title class="text-grey">ابدأ بالكتابة للبحث أو الإضافة...</v-list-item-title>
        </v-list-item>
      </template>

      <template #prepend-item v-if="searchText && filteredItemsCount === 0">
        <v-list-item @click="handleCreation(searchText)">
          <template #prepend>
            <v-icon icon="ri-add-line" color="primary" class="me-2"></v-icon>
          </template>
          <v-list-item-title> إضافة "{{ searchText }}" كـ {{ label }} جديد </v-list-item-title>
        </v-list-item>
        <v-divider class="mb-2"></v-divider>
      </template>
    </v-autocomplete>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue';
import { categoryService, brandService } from '@/api';

const props = defineProps({
  modelValue: [Number, String, null],
  items: { type: Array, default: () => [] },
  label: { type: String, default: 'البحث' },
  placeholder: { type: String, default: 'اختر أو ابحث...' },
  entity: { type: String, required: true }, // 'categories' or 'brands'
  itemTitle: { type: String, default: 'name' },
});

const emit = defineEmits(['update:modelValue', 'item-created']);

const isLoading = ref(false);
const searchText = ref('');
const autocompleteRef = ref(null);

const services = {
  categories: categoryService,
  brands: brandService,
};

const selectedId = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val),
});

const filteredItemsCount = computed(() => {
  if (!searchText.value) return props.items.length;
  const search = searchText.value.toLowerCase();
  return props.items.filter(item => item[props.itemTitle]?.toLowerCase().includes(search)).length;
});

async function handleCreation(itemName) {
  if (!itemName || isLoading.value) return;

  // Check if item already exists locally to avoid duplicates
  const existingItem = props.items.find(i => i[props.itemTitle]?.toLowerCase() === itemName.toLowerCase());
  if (existingItem) {
    selectedId.value = existingItem.id;
    searchText.value = '';
    return;
  }

  const service = services[props.entity];
  if (!service) {
    console.error(`Service for entity ${props.entity} not found`);
    return;
  }

  isLoading.value = true;
  try {
    const payload = { name: itemName };
    const response = await service.save(payload);

    // In restructure-v2, handleSuccess returns { data: [...] } where data is an array
    // Even for single resource, it wraps it in an array
    const createdItem = response.data?.[0] || response.data || response;

    emit('item-created', createdItem);
    selectedId.value = createdItem.id;

    await nextTick();
    if (autocompleteRef.value) {
      autocompleteRef.value.blur();
    }
  } catch (error) {
    console.error(`Failed to add ${props.entity}:`, error);
  } finally {
    isLoading.value = false;
    searchText.value = '';
  }
}

function handleFreeTextOnEnter() {
  const trimmedText = searchText.value?.trim();
  if (!trimmedText) return;

  const exists = props.items.some(i => i[props.itemTitle]?.toLowerCase() === trimmedText.toLowerCase());
  if (!exists) {
    handleCreation(trimmedText);
  } else {
    // If it exists, Vuetify usually selects it automatically if it's the first match,
    // otherwise we just clear the search to show it's selected.
    searchText.value = '';
  }
}
</script>

<style scoped>
.premium-input-field :deep(.v-field) {
  border-radius: 12px !important;
  border: 1px solid transparent !important;
  transition: all 0.2s ease;
}

.premium-input-field :deep(.v-field--focused) {
  border-color: rgba(var(--v-theme-primary), 0.3) !important;
}

.search-create-select {
  width: 100%;
}
</style>
