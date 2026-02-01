<template>
  <AppAutocomplete
    v-model="selectedCustomer"
    :items="customers"
    :loading="loading"
    :search="searchQuery"
    item-title="nickname"
    item-value="id"
    :label="label"
    placeholder="ابحث بالاسم أو الهاتف..."
    prepend-inner-icon="ri-user-search-line"
    clearable
    :return-object="returnObject"
    @update:search="handleSearch"
    class="customer-selector"
  >
    <!-- Selection slot for the input field -->
    <template #selection="{ item }">
      <div v-if="item.raw" class="d-flex align-center">
        <AppAvatar :img-url="item.raw.avatar_url" :name="item.raw.nickname || item.raw.name" size="24" rounded="circle" class="me-2 border" />
        <span class="text-body-2 font-weight-medium">{{ item.raw.nickname || item.raw.name }}</span>
      </div>
    </template>

    <!-- Prepend inner for adding new customer -->
    <template #append-inner>
      <AppButton
        icon="ri-user-add-line"
        variant="text"
        size="small"
        color="primary"
        class="ms-1"
        @click.stop="$emit('create')"
        v-tooltip="'إضافة عميل جديد'"
      />
    </template>

    <!-- Custom item slot -->
    <template #item="{ props, item }">
      <v-list-item v-bind="props" class="py-2">
        <template #prepend>
          <AppAvatar :img-url="item.raw.avatar_url" :name="item.raw.nickname || item.raw.name" size="40" rounded="md" class="me-3 border" />
        </template>
        <template #title>
          <div class="d-flex align-center justify-space-between">
            <span class="font-weight-bold" v-html="highlightText(item.raw.nickname || item.raw.name, searchQuery)"></span>
            <v-chip v-if="item.raw.customer_type === 'wholesale'" size="x-small" color="info" variant="tonal" class="ms-2">جملة</v-chip>
          </div>
        </template>
        <template #subtitle>
          <div class="d-flex align-center gap-3 mt-1 text-caption text-secondary flex-wrap">
            <span v-if="item.raw.phone" class="d-flex align-center">
              <v-icon icon="ri-phone-line" size="14" class="me-1" />
              <span v-html="highlightText(item.raw.phone, searchQuery)"></span>
            </span>
            <span v-if="item.raw.email" class="d-flex align-center">
              <v-icon icon="ri-mail-line" size="14" class="me-1" />
              {{ item.raw.email }}
            </span>
            <v-chip v-if="item.raw.balance !== undefined" size="x-small" :color="item.raw.balance < 0 ? 'error' : 'success'" variant="tonal">
              رصيد: {{ item.raw.balance }}
            </v-chip>
          </div>
        </template>
      </v-list-item>
    </template>
  </AppAutocomplete>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useApi } from '@/composables/useApi';
import { highlightText } from '@/utils/helpers';

const props = defineProps({
  modelValue: {
    type: [Object, Number, String],
    default: null,
  },
  label: {
    type: String,
    default: 'اختر العميل *',
  },
  returnObject: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(['update:modelValue', 'create']);

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
