<template>
  <v-autocomplete
    v-model="selectedCustomer"
    :items="customers"
    :loading="loading"
    :search="searchQuery"
    item-title="name"
    item-value="id"
    label="اختر العميل *"
    placeholder="ابحث عن العميل..."
    prepend-inner-icon="ri-user-search-line"
    clearable
    return-object
    @update:search="handleSearch"
  >
    <!-- Custom item slot -->
    <template #item="{ props, item }">
      <v-list-item v-bind="props">
        <template #prepend>
          <v-avatar color="primary" size="40">
            <span class="text-white">
              {{ item.raw.name.charAt(0) }}
            </span>
          </v-avatar>
        </template>
        <template #title>
          {{ item.raw.name }}
        </template>
        <template #subtitle>
          <div class="d-flex flex-column">
            <span v-if="item.raw.phone">
              <v-icon icon="ri-phone-line" size="x-small" />
              {{ item.raw.phone }}
            </span>
            <span v-if="item.raw.email" class="text-caption">
              {{ item.raw.email }}
            </span>
          </div>
        </template>
      </v-list-item>
    </template>

    <!-- No data -->
    <template #no-data>
      <v-list-item>
        <v-list-item-title class="text-center"> لا توجد نتائج </v-list-item-title>
      </v-list-item>
    </template>

    <!-- Append: Create new customer button -->
    <template #append-item>
      <v-divider />
      <v-list-item @click="showCreateDialog = true">
        <template #prepend>
          <v-icon icon="ri-add-circle-line" color="primary" />
        </template>
        <v-list-item-title class="text-primary"> إضافة عميل جديد </v-list-item-title>
      </v-list-item>
    </template>
  </v-autocomplete>

  <!-- Create Customer Dialog -->
  <v-dialog v-model="showCreateDialog" max-width="600">
    <v-card>
      <v-card-title class="text-h5">
        <v-icon icon="ri-user-add-line" class="me-2" />
        إضافة عميل جديد
      </v-card-title>

      <v-card-text>
        <v-row>
          <v-col cols="12" md="6">
            <v-text-field v-model="newCustomer.name" label="الاسم *" prepend-inner-icon="ri-user-line" :error-messages="errors.name" />
          </v-col>

          <v-col cols="12" md="6">
            <v-text-field v-model="newCustomer.phone" label="رقم الهاتف *" prepend-inner-icon="ri-phone-line" :error-messages="errors.phone" />
          </v-col>

          <v-col cols="12" md="6">
            <v-text-field
              v-model="newCustomer.email"
              label="البريد الإلكتروني"
              prepend-inner-icon="ri-mail-line"
              type="email"
              :error-messages="errors.email"
            />
          </v-col>

          <v-col cols="12" md="6">
            <v-text-field v-model="newCustomer.tax_number" label="الرقم الضريبي" prepend-inner-icon="ri-bill-line" />
          </v-col>

          <v-col cols="12">
            <v-textarea v-model="newCustomer.address" label="العنوان" prepend-inner-icon="ri-map-pin-line" rows="2" />
          </v-col>
        </v-row>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="cancelCreate"> إلغاء </v-btn>
        <v-btn color="primary" variant="flat" :loading="creating" @click="createCustomer"> حفظ </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { useApi } from '@/composables/useApi';
import { toast } from 'vue3-toastify';

const props = defineProps({
  modelValue: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(['update:modelValue']);

// API
const customerApi = useApi('/api/customers');

// State
const customers = ref([]);
const loading = ref(false);
const searchQuery = ref('');

// Selected customer
const selectedCustomer = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value),
});

// Create dialog
const showCreateDialog = ref(false);
const creating = ref(false);
const newCustomer = ref({
  name: '',
  phone: '',
  email: '',
  tax_number: '',
  address: '',
});
const errors = ref({});

// Search customers
let searchTimeout;
const handleSearch = query => {
  searchQuery.value = query;
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    loadCustomers(query);
  }, 300);
};

// Load customers
const loadCustomers = async (search = '') => {
  loading.value = true;
  try {
    const params = search ? { search } : {};
    const response = await customerApi.get(params, { showLoading: false, showError: false });
    customers.value = response.data || [];
  } catch (error) {
    console.error('Error loading customers:', error);
  } finally {
    loading.value = false;
  }
};

// Create customer
const createCustomer = async () => {
  errors.value = {};

  // Simple validation
  if (!newCustomer.value.name) {
    errors.value.name = 'الاسم مطلوب';
    return;
  }
  if (!newCustomer.value.phone) {
    errors.value.phone = 'رقم الهاتف مطلوب';
    return;
  }

  creating.value = true;
  try {
    const response = await customerApi.create(newCustomer.value, {
      successMessage: 'تم إضافة العميل بنجاح',
    });

    // Add to list and select
    customers.value.unshift(response.data);
    selectedCustomer.value = response.data;

    // Reset and close
    newCustomer.value = { name: '', phone: '', email: '', tax_number: '', address: '' };
    showCreateDialog.value = false;
  } catch (error) {
    if (error.response?.data?.errors) {
      errors.value = error.response.data.errors;
    }
  } finally {
    creating.value = false;
  }
};

const cancelCreate = () => {
  newCustomer.value = { name: '', phone: '', email: '', tax_number: '', address: '' };
  errors.value = {};
  showCreateDialog.value = false;
};

// Load on mount
loadCustomers();
</script>
