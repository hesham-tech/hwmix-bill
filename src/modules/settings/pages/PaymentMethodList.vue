<template>
  <div class="payment-methods-page">
    <!-- Page Header -->
    <div class="page-header d-flex align-center justify-space-between mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold ml-2">طرق الدفع</h1>
        <p class="text-body-1 text-grey">إدارة طرق الدفع المتاحة في النظام</p>
      </div>
      <AppButton v-if="canCreate" prepend-icon="ri-add-line" size="large" elevation="2" @click="handleCreate"> طريقة جديدة </AppButton>
    </div>

    <!-- Filters & View Toggle -->
    <AppCard class="mb-6">
      <div class="d-flex align-center flex-wrap gap-4">
        <AppInput
          v-model="search"
          label="بحث عن طريقة دفع..."
          prepend-inner-icon="ri-search-line"
          class="max-width-300 flex-grow-1"
          hide-details
          @update:model-value="handleSearch"
        />

        <v-spacer />

        <v-btn-group variant="outlined" density="comfortable" color="primary">
          <AppButton :active="viewMode === 'grid'" icon="ri-grid-fill" @click="viewMode = 'grid'" title="عرض شبكي" />
          <AppButton :active="viewMode === 'list'" icon="ri-list-check" @click="viewMode = 'list'" title="عرض قائمة" />
        </v-btn-group>
      </div>
    </AppCard>

    <!-- Content Area -->
    <LoadingSpinner v-if="loading && !paymentMethods.length" size="64" text="جاري تحميل طرق الدفع..." />

    <EmptyState
      v-else-if="!paymentMethods.length"
      icon="ri-bank-card-line"
      title="لا توجد طرق دفع حالياً"
      message="ابدأ بإضافة أول طريقة دفع لنظامك"
      :show-action="canCreate"
      action-text="إضافة طريقة دفع"
      @action="handleCreate"
    />

    <template v-else>
      <!-- Grid View -->
      <v-row v-if="viewMode === 'grid'">
        <v-col v-for="item in paymentMethods" :key="item.id" cols="12" sm="6" md="4" lg="3">
          <AppCard class="method-card h-100" no-padding>
            <div class="method-card-header d-flex align-center justify-center pa-6 bg-grey-lighten-4 position-relative">
              <v-avatar size="80" rounded="circle" :color="item.active ? 'bg-white' : 'grey-lighten-3'" class="elevation-1 bg-white">
                <v-img v-if="item.image_url" :src="item.image_url" cover />
                <v-icon v-else :icon="getMethodIcon(item.code)" size="40" :color="item.active ? 'success' : 'grey'" />
              </v-avatar>

              <v-chip
                :color="item.active ? 'success' : 'error'"
                size="x-small"
                class="position-absolute top-2 right-2 font-weight-bold"
                variant="flat"
              >
                {{ item.active ? 'نشط' : 'معطل' }}
              </v-chip>

              <v-chip v-if="item.is_system" color="info" size="x-small" class="position-absolute top-2 left-2 font-weight-bold" variant="tonal">
                نظام
              </v-chip>
            </div>

            <v-card-item>
              <v-card-title class="text-h6 font-weight-bold">{{ item.name }}</v-card-title>
              <v-card-subtitle class="mt-1">كود: {{ item.code }}</v-card-subtitle>
            </v-card-item>

            <template #actions>
              <v-spacer />
              <AppButton icon="ri-edit-line" variant="text" color="primary" @click="handleEdit(item)" />
              <AppButton v-if="canDelete(item)" icon="ri-delete-bin-line" variant="text" color="error" @click="handleDelete(item)" />
            </template>
          </AppCard>
        </v-col>
      </v-row>

      <!-- List View -->
      <AppDataTable
        v-else
        :headers="headers"
        :items="paymentMethods"
        :total-items="total"
        :loading="loading"
        v-model:page="page"
        v-model:items-per-page="itemsPerPage"
        :searchable="false"
        :can-view="false"
        :can-delete="false"
        @update:options="loadData"
        @edit="handleEdit"
      >
        <template #item.name="{ item }">
          <div class="d-flex align-center py-1">
            <v-avatar size="32" rounded="circle" :color="item.active ? 'bg-white' : 'grey-lighten-4'" class="me-3 border">
              <v-img v-if="item.image_url" :src="item.image_url" cover />
              <v-icon v-else :icon="getMethodIcon(item.code)" size="18" :color="item.active ? 'success' : 'grey'" />
            </v-avatar>
            <span class="font-weight-bold">{{ item.name }}</span>
            <v-chip v-if="item.is_system" size="x-small" color="info" variant="tonal" class="ms-2">أساسي</v-chip>
          </div>
        </template>

        <template #item.active="{ item }">
          <v-chip :color="item.active ? 'success' : 'error'" size="small" variant="flat" class="font-weight-bold">
            {{ item.active ? 'نشط' : 'معطل' }}
          </v-chip>
        </template>

        <template #extra-actions="{ item }">
          <AppButton v-if="canDelete(item)" icon="ri-delete-bin-line" variant="text" color="error" size="small" @click="handleDelete(item)" />
        </template>
      </AppDataTable>

      <!-- Pagination -->
      <div v-if="viewMode === 'grid'" class="mt-8 d-flex align-center justify-space-between flex-wrap gap-4 px-2">
        <div class="text-body-2 text-grey">عرض {{ paymentMethods.length }} من إجمالي {{ total }} طريقة</div>
        <v-pagination
          v-model="page"
          :length="Math.ceil(total / itemsPerPage)"
          :total-visible="5"
          rounded="circle"
          size="small"
          @update:model-value="loadData"
        />
      </div>
    </template>

    <!-- Payment Method Form Dialog -->
    <PaymentMethodForm v-model="showDialog" :payment-method="selectedItem" @saved="loadData" />

    <!-- Delete Confirmation -->
    <AppDialog
      v-model="showDeleteDialog"
      title="حذف طريقة الدفع؟"
      icon="ri-delete-bin-7-line"
      confirm-color="error"
      confirm-text="تأكيد الحذف"
      :loading="deleting"
      @confirm="confirmDelete"
    >
      <div class="text-center pa-4">
        <v-avatar color="error-lighten-5" size="80" class="mb-4 mx-auto">
          <v-icon icon="ri-delete-bin-7-line" color="error" size="40" />
        </v-avatar>
        <p class="text-body-1 text-grey-darken-1">هل أنت متأكد من حذف "{{ selectedItem?.name }}"؟</p>
        <v-alert v-if="selectedItem?.payments_count > 0" type="warning" variant="tonal" density="compact" class="mt-4 text-right">
          هذه الطريقة مرتبطة بـ {{ selectedItem.payments_count }} عملية دفع. لا ينصح بحذفها.
        </v-alert>
      </div>
    </AppDialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { usePaymentMethodsData } from '../composables/usePaymentMethodsData';
import PaymentMethodForm from '../components/PaymentMethodForm.vue';
import AppCard from '@/components/common/AppCard.vue';
import AppButton from '@/components/common/AppButton.vue';
import AppInput from '@/components/common/AppInput.vue';
import AppDialog from '@/components/common/AppDialog.vue';
import AppDataTable from '@/components/common/AppDataTable.vue';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import EmptyState from '@/components/common/EmptyState.vue';

// Simple debounce
const debounce = (fn, delay) => {
  let timeoutId;
  return (...args) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};

const { paymentMethods, loading, total, fetchPaymentMethods, deletePaymentMethod } = usePaymentMethodsData();

// Check for permissions
import { useAuthStore } from '@/stores/auth';
const authStore = useAuthStore();
const isSuperAdmin = computed(() => authStore.user?.permissions?.includes('admin.super'));
const isCompanyAdmin = computed(() => authStore.user?.permissions?.includes('admin.company'));

const canCreate = computed(() => {
  return isSuperAdmin.value || isCompanyAdmin.value || authStore.user?.permissions?.includes('payment_methods.create');
});

const canDelete = item => {
  if (isSuperAdmin.value) return true;
  if (item.is_system) return false;
  return isCompanyAdmin.value || authStore.user?.permissions?.includes('payment_methods.delete');
};

const page = ref(1);
const itemsPerPage = ref(12);
const search = ref('');
const viewMode = ref('grid');
const showDialog = ref(false);
const showDeleteDialog = ref(false);
const selectedItem = ref(null);
const deleting = ref(false);

const headers = [
  { title: 'طريقة الدفع', key: 'name', sortable: true },
  { title: 'الكود', key: 'code', sortable: true },
  { title: 'الحالة', key: 'active', align: 'center', sortable: true },
  { title: 'الإجراءات', key: 'actions', sortable: false, align: 'end', width: '120px' },
];

const getMethodIcon = code => {
  const icons = {
    CASH: 'ri-money-dollar-circle-line',
    BANK: 'ri-bank-line',
    CARD: 'ri-bank-card-line',
    WALLET: 'ri-wallet-3-line',
    CHEQUE: 'ri-coupon-3-line',
  };
  return icons[code?.toUpperCase()] || 'ri-bank-card-line';
};

const handleSearch = debounce(() => {
  page.value = 1;
  loadData();
}, 500);

const handleCreate = () => {
  selectedItem.value = null;
  showDialog.value = true;
};

const handleEdit = item => {
  selectedItem.value = item;
  showDialog.value = true;
};

const handleDelete = item => {
  selectedItem.value = item;
  showDeleteDialog.value = true;
};

const confirmDelete = async () => {
  deleting.value = true;
  try {
    await deletePaymentMethod(selectedItem.value.id);
    showDeleteDialog.value = false;
    loadData();
  } finally {
    deleting.value = false;
  }
};

const loadData = () => {
  fetchPaymentMethods({
    page: page.value,
    per_page: itemsPerPage.value,
    search: search.value,
  });
};

onMounted(loadData);
watch(page, () => loadData());
</script>

<style scoped>
.payment-methods-page {
  padding: 24px;
  background-color: #f8f9fa;
  min-height: 100vh;
}

.max-width-300 {
  max-width: 300px;
}

.method-card {
  transition: all 0.3s ease;
  border-radius: 16px;
  border: 1px solid #eee;
}

.method-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1) !important;
}

.method-card-header {
  height: 140px;
  border-radius: 16px 16px 0 0;
}
</style>
