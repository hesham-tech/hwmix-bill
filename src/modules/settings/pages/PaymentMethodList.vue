<template>
  <div class="payment-methods-page">
    <!-- Page Header -->
    <div class="page-header d-flex align-center justify-space-between mb-2">
      <div>
        <h1 class="text-h4 font-weight-bold ml-2">طرق الدفع</h1>
        <p class="text-body-1 text-grey">إدارة طرق الدفع المتاحة في النظام</p>
      </div>
      <AppButton v-if="canCreate" prepend-icon="ri-add-line" size="large" elevation="2" @click="handleCreate"> طريقة جديدة </AppButton>
    </div>

    <!-- Filters & View Toggle -->
    <AppCard class="mb-2">
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
        <AppSwitch
          v-if="isSuperAdmin"
          v-model="isSystemVisible"
          :label="isSystemVisible ? 'مشاهدة الأنواع الأساسية (System)' : 'مشاهدة الأنواع المخصصة (Custom)'"
          hide-details
        />
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
      <!-- Grid View with Infinite Scroll -->
      <AppInfiniteScroll
        v-if="viewMode === 'grid'"
        :loading="loading && paymentMethods.length > 0"
        :has-more="paymentMethods.length < total"
        no-more-text="لا يوجد المزيد من طرق الدفع"
        @load="handleLoadMore"
      >
        <v-row>
          <v-col v-for="item in paymentMethods" :key="item.id" cols="12" sm="6" md="4" lg="3">
            <AppCard class="method-card h-100" no-padding>
              <div class="method-card-header d-flex align-center justify-center pa-2 bg-grey-lighten-4 position-relative">
                <AppAvatar
                  :img-url="item.image_url"
                  :name="item.name"
                  type="payment"
                  size="120"
                  :custom-class="item.active ? 'bg-white' : 'grey-lighten-3'"
                  class="elevation-1"
                />
              </div>

              <v-card-item class="position-relative pt-4">
                <v-card-title class="text-h6 font-weight-bold pa-0 mb-1">{{ item.name }}</v-card-title>

                <div class="d-flex align-center justify-space-between mb-1" style="height: 32px">
                  <div class="d-flex align-center">
                    <span class="text-caption text-grey-darken-1 me-2">الحالة:</span>
                    <v-chip :color="item.active ? 'success' : 'error'" size="x-small" class="font-weight-bold" variant="flat">
                      {{ item.active ? 'نشط' : 'معطل' }}
                    </v-chip>
                  </div>

                  <AppSwitch
                    v-if="canToggle(item)"
                    :model-value="item.active"
                    :loading="togglingId === item.id"
                    @update:model-value="handleToggleStatus(item)"
                  />
                </div>

                <v-card-subtitle class="pa-0">كود: {{ item.code }}</v-card-subtitle>

                <!-- Essential/System Chip -->
                <v-chip v-if="item.is_system" color="info" size="x-small" class="position-absolute" style="top: 16px; left: 16px" variant="tonal">
                  اساسي
                </v-chip>
              </v-card-item>

              <template #actions>
                <v-spacer />
                <AppButton icon="ri-edit-line" variant="text" color="primary" @click="handleEdit(item)" />
                <AppButton v-if="canDelete(item)" icon="ri-delete-bin-line" variant="text" color="error" @click="handleDelete(item)" />
              </template>
            </AppCard>
          </v-col>
        </v-row>
      </AppInfiniteScroll>

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
        @update:options="onTableOptionsUpdate"
        @edit="handleEdit"
      >
        <template #item.name="{ item }">
          <div class="d-flex align-center py-2">
            <AppAvatar :img-url="item.image_url" :name="item.name" type="payment" size="48" class="me-3 border" />
            <div class="d-flex flex-column">
              <span class="font-weight-bold">{{ item.name }}</span>
              <v-chip v-if="item.is_system" size="x-small" color="info" variant="tonal" class="mt-1" style="width: fit-content">أساسي</v-chip>
            </div>
          </div>
        </template>

        <template #item.active="{ item }">
          <div class="d-flex align-center justify-center">
            <span v-if="canToggle(item)" class="text-caption me-2 font-weight-bold" :class="item.active ? 'text-success' : 'text-error'">
              {{ item.active ? 'نشط' : 'معطل' }}
            </span>
            <AppSwitch
              v-if="canToggle(item)"
              :model-value="item.active"
              :loading="togglingId === item.id"
              @update:model-value="handleToggleStatus(item)"
            />
            <v-chip v-else :color="item.active ? 'success' : 'error'" size="small" variant="flat" class="font-weight-bold">
              {{ item.active ? 'نشط' : 'معطل' }}
            </v-chip>
          </div>
        </template>

        <template #extra-actions="{ item }">
          <AppButton v-if="canDelete(item)" icon="ri-delete-bin-line" variant="text" color="error" size="small" @click="handleDelete(item)" />
        </template>
      </AppDataTable>

      <!-- No grid pagination, using infinite scroll above -->
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
import AppSwitch from '@/components/common/AppSwitch.vue';
import AppCard from '@/components/common/AppCard.vue';
import AppButton from '@/components/common/AppButton.vue';
import AppInput from '@/components/common/AppInput.vue';
import AppDialog from '@/components/common/AppDialog.vue';
import AppDataTable from '@/components/common/AppDataTable.vue';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import EmptyState from '@/components/common/EmptyState.vue';
import AppInfiniteScroll from '@/components/common/AppInfiniteScroll.vue';
import AppAvatar from '@/components/common/AppAvatar.vue';
import { PERMISSIONS } from '@/config/permissions';
import { useApi } from '@/composables/useApi';
import { useUserStore } from '@/stores/user';

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
const { can, canAny } = usePermissions();
const authStore = useAuthStore();
const userStore = useUserStore();

const isSuperAdmin = computed(() => userStore.hasPermission(PERMISSIONS.ADMIN_SUPER));
const isCompanyAdmin = computed(() => userStore.hasPermission(PERMISSIONS.ADMIN_COMPANY));

const canCreate = computed(() => {
  return canAny(PERMISSIONS.PAYMENT_METHODS_CREATE);
});

const canDelete = item => {
  if (item.is_system && !isSuperAdmin.value) return false;
  return canAny(PERMISSIONS.PAYMENT_METHODS_DELETE_ALL, PERMISSIONS.PAYMENT_METHODS_DELETE_CHILDREN, PERMISSIONS.PAYMENT_METHODS_DELETE_SELF, {
    resource: item,
  });
};

const canToggle = item => {
  if (item.is_system && !isSuperAdmin.value) return false;
  return canAny(PERMISSIONS.PAYMENT_METHODS_UPDATE_ALL, PERMISSIONS.PAYMENT_METHODS_UPDATE_CHILDREN, PERMISSIONS.PAYMENT_METHODS_UPDATE_SELF, {
    resource: item,
  });
};

const methodApi = useApi('/api/payment-methods');
const togglingId = ref(null);

const handleToggleStatus = async item => {
  togglingId.value = item.id;
  try {
    await methodApi.update(item.id, { active: !item.active });
    item.active = !item.active;
  } finally {
    togglingId.value = null;
  }
};

const handleLoadMore = () => {
  if (loading.value || paymentMethods.value.length >= total.value) return;
  page.value++;
  loadData(true);
};

const page = ref(1);
const itemsPerPage = ref(12);
const search = ref('');
const viewMode = ref('grid');
const showDialog = ref(false);
const showDeleteDialog = ref(false);
const selectedItem = ref(null);
const deleting = ref(false);
const isSystemVisible = ref(false);

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

const onTableOptionsUpdate = options => {
  // When options change (like itemsPerPage), we want to reload
  // v-data-table-server handles page and itemsPerPage syncing via v-model
  if (viewMode.value === 'list') {
    loadData();
  }
};

const loadData = (options = {}) => {
  const isAppend = options === true;

  const params = {
    page: page.value,
    per_page: itemsPerPage.value,
    search: search.value,
  };

  if (isSuperAdmin.value) {
    params.is_system = isSystemVisible.value ? 1 : 0;
  }

  fetchPaymentMethods(params, { append: isAppend });
};

onMounted(loadData);

watch(page, (newPage, oldPage) => {
  // Only trigger loadData if it's the List view (Grid view uses handleLoadMore)
  if (viewMode.value === 'list') {
    loadData();
  }
});

watch(itemsPerPage, () => {
  if (viewMode.value === 'list') {
    page.value = 1;
    loadData();
  }
});

watch(viewMode, () => {
  // Reset when switching views to ensure clean state
  page.value = 1;
  loadData();
});

watch(isSystemVisible, () => {
  page.value = 1;
  loadData();
});
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
  height: 180px;
  border-radius: 16px 16px 0 0;
}
</style>
