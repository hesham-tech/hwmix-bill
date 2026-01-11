<template>
  <div class="cash-box-types-page">
    <!-- Page Header -->
    <div class="page-header d-flex align-center justify-space-between mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold ml-2">أنواع الخزائن</h1>
        <p class="text-body-1 text-grey">إدارة أنواع الخزائن المتاحة في النظام</p>
      </div>
      <AppButton v-if="canCreate" prepend-icon="ri-add-line" size="large" elevation="2" @click="handleCreate"> نوع جديد </AppButton>
    </div>

    <!-- Filters & View Toggle -->
    <AppCard class="mb-6">
      <div class="d-flex align-center flex-wrap gap-4">
        <AppInput
          v-model="search"
          label="بحث عن نوع..."
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
    <LoadingSpinner v-if="loading && !cashBoxTypes.length" size="64" text="جاري تحميل أنواع الخزائن..." />

    <EmptyState
      v-else-if="!cashBoxTypes.length"
      icon="ri-inbox-archive-line"
      title="لا توجد أنواع خزائن حالياً"
      message="ابدأ بإضافة أول نوع خزينة لنظامك"
      :show-action="canCreate"
      action-text="إضافة نوع جديد"
      @action="handleCreate"
    />

    <template v-else>
      <!-- Grid View with Infinite Scroll -->
      <AppInfiniteScroll
        v-if="viewMode === 'grid'"
        :loading="loading && cashBoxTypes.length > 0"
        :has-more="cashBoxTypes.length < total"
        no-more-text="لا يوجد المزيد من أنواع الخزائن"
        @load="handleLoadMore"
      >
        <v-row>
          <v-col v-for="item in cashBoxTypes" :key="item.id" cols="12" sm="6" md="4" lg="3">
            <AppCard class="type-card h-100" no-padding>
              <div class="type-card-header d-flex align-center justify-center pa-6 bg-grey-lighten-4 position-relative">
                <v-avatar size="120" rounded="circle" :color="item.is_active ? 'bg-white' : 'grey-lighten-3'" class="elevation-1 bg-white">
                  <v-img v-if="item.image_url" :src="item.image_url" cover />
                  <v-icon v-else icon="ri-inbox-archive-line" size="60" :color="item.is_active ? 'primary' : 'grey'" />
                </v-avatar>
              </div>

              <v-card-item class="position-relative pt-4">
                <v-card-title class="text-h6 font-weight-bold pa-0 mb-1">{{ item.name }}</v-card-title>

                <span class="text-caption text-grey-darken-1 me-2">{{ item.description }}</span>
                <div class="d-flex align-center justify-space-between mb-1" style="height: 32px">
                  <div class="d-flex align-center">
                    <span class="text-caption text-grey-darken-1 me-2">الحالة:</span>
                    <v-chip :color="item.is_active ? 'success' : 'error'" size="x-small" class="font-weight-bold" variant="flat">
                      {{ item.is_active ? 'نشط' : 'معطل' }}
                    </v-chip>
                  </div>

                  <AppSwitch
                    v-if="canToggle(item)"
                    :model-value="item.is_active"
                    :loading="togglingId === item.id"
                    @update:model-value="handleToggleStatus(item)"
                  />
                </div>

                <v-card-subtitle class="pa-0">الخزائن: {{ item.cash_boxes_count || 0 }}</v-card-subtitle>

                <!-- Essential/System Chip -->
                <v-chip v-if="item.is_system" color="info" size="x-small" class="position-absolute" style="top: 16px; left: 16px" variant="tonal">
                  أساسي
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
        :items="cashBoxTypes"
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
            <v-avatar size="48" rounded="circle" :color="item.is_active ? 'bg-white' : 'grey-lighten-4'" class="me-3 border">
              <v-img v-if="item.image_url" :src="item.image_url" cover />
              <v-icon v-else icon="ri-inbox-archive-line" size="24" :color="item.is_active ? 'primary' : 'grey'" />
            </v-avatar>
            <div class="d-flex flex-column">
              <span class="font-weight-bold">{{ item.name }}</span>
              <v-chip v-if="item.is_system" size="x-small" color="info" variant="tonal" class="mt-1" style="width: fit-content">أساسي</v-chip>
            </div>
          </div>
        </template>

        <template #item.is_active="{ item }">
          <div class="d-flex align-center justify-center">
            <span v-if="canToggle(item)" class="text-caption me-2 font-weight-bold" :class="item.is_active ? 'text-success' : 'text-error'">
              {{ item.is_active ? 'نشط' : 'معطل' }}
            </span>
            <AppSwitch
              v-if="canToggle(item)"
              :model-value="item.is_active"
              :loading="togglingId === item.id"
              @update:model-value="handleToggleStatus(item)"
            />
            <v-chip v-else :color="item.is_active ? 'success' : 'error'" size="small" variant="flat" class="font-weight-bold">
              {{ item.is_active ? 'نشط' : 'معطل' }}
            </v-chip>
          </div>
        </template>

        <template #extra-actions="{ item }">
          <AppButton v-if="canDelete(item)" icon="ri-delete-bin-line" variant="text" color="error" size="small" @click="handleDelete(item)" />
        </template>
      </AppDataTable>
    </template>

    <!-- CashBoxType Form Dialog -->
    <CashBoxTypeForm v-model="showDialog" :cash-box-type="selectedItem" @saved="loadData" />

    <!-- Delete Confirmation -->
    <AppDialog
      v-model="showDeleteDialog"
      title="حذف نوع الخزينة؟"
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
        <v-alert v-if="selectedItem?.cash_boxes_count > 0" type="warning" variant="tonal" density="compact" class="mt-4 text-right">
          هذا النوع مرتبط بـ {{ selectedItem.cash_boxes_count }} خزينة. لا ينصح بحذفه.
        </v-alert>
      </div>
    </AppDialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useCashBoxTypesData } from '../composables/useCashBoxTypesData';
import CashBoxTypeForm from '../components/CashBoxTypeForm.vue';
import AppSwitch from '@/components/common/AppSwitch.vue';
import AppCard from '@/components/common/AppCard.vue';
import AppButton from '@/components/common/AppButton.vue';
import AppInput from '@/components/common/AppInput.vue';
import AppDialog from '@/components/common/AppDialog.vue';
import AppDataTable from '@/components/common/AppDataTable.vue';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import EmptyState from '@/components/common/EmptyState.vue';
import AppInfiniteScroll from '@/components/common/AppInfiniteScroll.vue';
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

const { cashBoxTypes, loading, total, fetchCashBoxTypes, deleteCashBoxType } = useCashBoxTypesData();

const userStore = useUserStore();

const isSuperAdmin = computed(() => userStore.isAdmin);
const isCompanyAdmin = computed(() => userStore.isCompanyAdmin);

const canCreate = computed(() => {
  return isSuperAdmin.value || isCompanyAdmin.value || userStore.hasPermission(PERMISSIONS.CASH_BOX_TYPES_CREATE);
});

const canDelete = item => {
  if (isSuperAdmin.value) return true;
  if (item.is_system) return false;
  return isCompanyAdmin.value || userStore.hasPermission(PERMISSIONS.CASH_BOX_TYPES_DELETE_ALL);
};

const canToggle = item => {
  if (isSuperAdmin.value) return true;
  if (item.is_system) return false;
  return isCompanyAdmin.value || userStore.hasPermission(PERMISSIONS.CASH_BOX_TYPES_UPDATE_ALL);
};

const typeApi = useApi('/api/cash-box-types');
const togglingId = ref(null);

const handleToggleStatus = async item => {
  togglingId.value = item.id;
  try {
    await typeApi.update(item.id, { is_active: !item.is_active });
    item.is_active = !item.is_active;
  } finally {
    togglingId.value = null;
    ``;
  }
};
const isSystemVisible = ref(false);

const handleLoadMore = () => {
  if (loading.value || cashBoxTypes.value.length >= total.value) return;
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

const headers = [
  { title: 'نوع الخزينة', key: 'name', sortable: true },
  { title: 'عدد الخزن', key: 'cash_boxes_count', align: 'center', sortable: true },
  { title: 'الحالة', key: 'is_active', align: 'center', sortable: true },
  { title: 'الإجراءات', key: 'actions', sortable: false, align: 'end', width: '120px' },
];

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
    await deleteCashBoxType(selectedItem.value.id);
    showDeleteDialog.value = false;
    loadData();
  } finally {
    deleting.value = false;
  }
};

const onTableOptionsUpdate = options => {
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

  fetchCashBoxTypes(params, { append: isAppend });
};

onMounted(loadData);

watch(page, () => {
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
  page.value = 1;
  loadData();
});

watch(isSystemVisible, () => {
  page.value = 1;
  loadData();
});
</script>

<style scoped>
.cash-box-types-page {
  padding: 24px;
  background-color: #f8f9fa;
  min-height: 100vh;
}

.max-width-300 {
  max-width: 300px;
}

.type-card {
  transition: all 0.3s ease;
  border-radius: 16px;
  border: 1px solid #eee;
}

.type-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1) !important;
}

.type-card-header {
  height: 180px;
  border-radius: 16px 16px 0 0;
}
</style>
