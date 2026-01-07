<template>
  <AppAutocomplete
    v-model="selectedCustomer"
    :items="customers"
    :loading="loading"
    :search="searchQuery"
    item-title="name"
    item-value="id"
    label="اختر العميل *"
    placeholder="ابحث بالاسم أو الهاتف..."
    prepend-inner-icon="ri-user-search-line"
    clearable
    return-object
    @update:search="handleSearch"
  >
    <!-- Custom item slot -->
    <template #item="{ props, item }">
      <v-list-item v-bind="props">
        <template #prepend>
          <v-avatar color="primary-lighten-5" class="me-3 border" size="40">
            <span class="text-primary font-weight-bold">
              {{ item.raw.name.charAt(0).toUpperCase() }}
            </span>
          </v-avatar>
        </template>
        <template #title>
          <span class="font-weight-bold">{{ item.raw.name }}</span>
        </template>
        <template #subtitle>
          <div class="d-flex flex-column gap-1 mt-1">
            <span v-if="item.raw.phone" class="text-caption">
              <v-icon icon="ri-phone-line" size="14" class="me-1" />
              {{ item.raw.phone }}
            </span>
            <span v-if="item.raw.email" class="text-caption">
              <v-icon icon="ri-mail-line" size="14" class="me-1" />
              {{ item.raw.email }}
            </span>
          </div>
        </template>
      </v-list-item>
    </template>
  </AppAutocomplete>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useApi } from '@/composables/useApi';
import AppAutocomplete from '@/components/common/AppAutocomplete.vue';

const props = defineProps({
  modelValue: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(['update:modelValue']);

// API (Customers = Users in this system)
const customerApi = useApi('/api/users');

// State
const customers = ref([]);
const loading = ref(false);
const searchQuery = ref('');

// Selected customer
const selectedCustomer = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value),
});

// Search users (customers)
let searchTimeout;
const handleSearch = query => {
  searchQuery.value = query;
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    loadCustomers(query);
  }, 300);
};

// Load users (customers)
const loadCustomers = async (search = '') => {
  loading.value = true;
  try {
    const params = search ? { search } : {};
    const response = await customerApi.get(params, { showLoading: false, showError: false });
    customers.value = response.data || [];
  } catch (error) {
    console.error('Error loading users (customers):', error);
  } finally {
    loading.value = false;
  }
};

// Load on mount
loadCustomers();
</script>
