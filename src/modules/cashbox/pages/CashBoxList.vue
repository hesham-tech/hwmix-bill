<template>
  <div class="cashbox-page">
    <AppPageHeader title="الخزائن" subtitle="إدارة الخزائن النقدية والأرصدة المتاحة للعمليات" icon="ri-safe-2-line" sticky>
      <template #append>
        <AppButton
          v-if="can(PERMISSIONS.CASH_BOXES_CREATE)"
          color="primary"
          prepend-icon="ri-add-line"
          class="font-weight-bold"
          @click="handleCreate"
        >
          خزينة جديدة
        </AppButton>
      </template>

      <template #controls>
        <v-row align="center" class="w-100 mx-0">
          <v-col cols="12" md="8">
            <AppInput
              v-model="search"
              placeholder="بحث عن خزينة..."
              prepend-inner-icon="ri-search-line"
              clearable
              hide-details
              variant="solo-filled"
              density="comfortable"
              flat
              class="rounded-lg"
              @update:model-value="handleSearch"
            />
          </v-col>
          <v-col cols="12" md="4" class="text-end">
            <v-btn-group variant="tonal" density="comfortable" color="primary" class="rounded-lg bg-primary-lighten-5">
              <AppButton :active="viewMode === 'grid'" icon="ri-grid-fill" tooltip="عرض شبكي" @click="viewMode = 'grid'" />
              <AppButton :active="viewMode === 'list'" icon="ri-list-check" tooltip="عرض قائمة" @click="viewMode = 'list'" />
            </v-btn-group>
          </v-col>
        </v-row>
      </template>
    </AppPageHeader>

    <v-container fluid class="pt-0">
      <LoadingSpinner v-if="loading" />

      <template v-else>
        <EmptyState v-if="cashBoxes.length === 0" icon="ri-safe-2-line" title="لا توجد خزائن" subtitle="لم يتم العثور على أي خزائن مطابقة لبحثك." />

        <template v-else>
          <!-- Grid View with Infinite Scroll -->
          <AppInfiniteScroll
            v-if="viewMode === 'grid'"
            :loading="loading && cashBoxes.length > 0"
            :has-more="cashBoxes.length < total"
            no-more-text="لا يوجد المزيد من الخزائن"
            @load="handleLoadMore"
          >
            <v-row>
              <v-col v-for="item in cashBoxes" :key="item.id" cols="12" sm="6" md="4" lg="3">
                <AppCard class="cashbox-card h-100" no-padding>
                  <div class="cashbox-card-header d-flex align-center justify-center pa-4 bg-grey-lighten-4 position-relative">
                    <v-avatar size="80" rounded="lg" class="elevation-1 bg-white">
                      <v-icon icon="ri-safe-2-line" size="40" color="warning" />
                    </v-avatar>

                    <v-chip
                      :color="item.is_active ? 'success' : 'error'"
                      size="x-small"
                      class="position-absolute top-2 right-2 font-weight-bold"
                      variant="flat"
                    >
                      {{ item.is_active ? 'نشط' : 'معطل' }}
                    </v-chip>
                  </div>

                  <v-card-item>
                    <v-card-title class="text-h6 font-weight-bold">{{ item.name }}</v-card-title>
                    <v-card-subtitle class="d-flex align-center mt-1">
                      <v-chip v-if="item.type" size="x-small" variant="flat" color="primary-lighten-5" class="text-primary font-weight-bold">
                        {{ item.type.name }}
                      </v-chip>
                    </v-card-subtitle>
                  </v-card-item>

                  <v-card-text class="pt-0">
                    <div class="d-flex align-center justify-space-between mt-2">
                      <span class="text-caption text-grey">الرصيد الحالي</span>
                      <span class="font-weight-black" :class="item.balance >= 0 ? 'text-success' : 'text-error'">
                        {{ formatCurrency(item.balance) }}
                      </span>
                    </div>
                  </v-card-text>

                  <template
                    v-if="can(PERMISSIONS.CASH_BOXES_UPDATE_ALL, { resource: item }) || can(PERMISSIONS.CASH_BOXES_DELETE_ALL, { resource: item })"
                    #actions
                  >
                    <v-spacer />
                    <AppButton
                      v-if="can(PERMISSIONS.CASH_BOXES_UPDATE_ALL, { resource: item })"
                      icon="ri-edit-line"
                      variant="text"
                      color="primary"
                      tooltip="تعديل"
                      @click="handleEdit(item)"
                    />
                    <AppButton
                      v-if="can(PERMISSIONS.CASH_BOXES_DELETE_ALL, { resource: item })"
                      icon="ri-delete-bin-line"
                      variant="text"
                      color="error"
                      tooltip="حذف"
                      @click="handleDelete(item)"
                    />
                  </template>
                </AppCard>
              </v-col>
            </v-row>
          </AppInfiniteScroll>

          <!-- List View -->
          <AppDataTable
            v-else
            :headers="headers"
            :items="cashBoxes"
            :loading="loading"
            :items-length="total"
            :items-per-page="itemsPerPage"
            :page="page"
            title="قائمة الخزائن"
            icon="ri-safe-2-line"
            permission-module="cash_boxes"
            @update:options="onTableOptionsUpdate"
          >
            <template #item.name="{ item }">
              <div class="d-flex align-center">
                <v-icon icon="ri-money-dollar-box-line" size="small" color="warning" class="me-2" />
                <span class="font-weight-bold">{{ item.name }}</span>
              </div>
            </template>

            <template #item.type="{ item }">
              <v-chip v-if="item.type" size="small" variant="flat" color="primary-lighten-5" class="text-primary font-weight-bold">
                {{ item.type.name }}
              </v-chip>
              <span v-else class="text-grey-lighten-1 text-caption">غير محدد</span>
            </template>

            <template #item.balance="{ item }">
              <div class="text-end font-weight-black" :class="item.balance >= 0 ? 'text-success' : 'text-error'">
                {{ formatCurrency(item.balance) }}
              </div>
            </template>

            <template #item.is_active="{ item }">
              <v-chip :color="item.is_active ? 'success' : 'error'" size="small" variant="flat" class="font-weight-bold px-3">
                {{ item.is_active ? 'نشط' : 'غير نشط' }}
              </v-chip>
            </template>

            <template #item.actions="{ item }">
              <div class="d-flex justify-end gap-1">
                <AppButton
                  v-if="can(PERMISSIONS.CASH_BOXES_UPDATE_ALL, { resource: item })"
                  icon="ri-edit-line"
                  size="x-small"
                  variant="text"
                  color="primary"
                  tooltip="تعديل"
                  @click="handleEdit(item)"
                />
                <AppButton
                  v-if="can(PERMISSIONS.CASH_BOXES_DELETE_ALL, { resource: item })"
                  icon="ri-delete-bin-line"
                  size="x-small"
                  variant="text"
                  color="error"
                  tooltip="حذف"
                  @click="handleDelete(item)"
                />
              </div>
            </template>
          </AppDataTable>
        </template>
      </template>
    </v-container>

    <!-- Form Dialog -->
    <!-- Form Dialog -->
    <AppDialog
      v-model="showDialog"
      :title="isEdit ? 'تعديل الخزينة' : 'إضافة خزينة جديدة'"
      :icon="isEdit ? 'ri-edit-line' : 'ri-safe-2-line'"
      :loading="saving"
      max-width="650"
      @confirm="handleSave"
    >
      <v-form ref="formRef" @submit.prevent="handleSave">
        <v-row dense>
          <v-col cols="12">
            <AppInput v-model="formData.name" label="اسم الخزينة *" placeholder="مثال: الخزينة الرئيسية" :rules="[rules.required]" />
          </v-col>
          <v-col cols="12">
            <v-select
              v-model="formData.cash_box_type_id"
              :items="cashBoxTypes"
              :loading="loadingTypes"
              item-title="name"
              item-value="id"
              label="نوع الخزينة *"
              variant="outlined"
              density="comfortable"
              prepend-inner-icon="ri-list-settings-line"
              :rules="[rules.required]"
              hide-details
              class="mb-4"
            />
          </v-col>
          <v-col cols="12">
            <AppInput
              v-model.number="formData.initial_balance"
              label="الرصيد الافتتاحي"
              type="number"
              step="0.01"
              prepend-inner-icon="ri-money-dollar-circle-line"
              :disabled="isEdit"
            />
          </v-col>
          <v-col cols="12">
            <v-card variant="tonal" color="primary" class="pa-4 rounded-lg">
              <div class="d-flex align-center justify-space-between">
                <div>
                  <div class="text-subtitle-1 font-weight-bold">حالة النشاط</div>
                  <div class="text-caption">تحديد ما إذا كانت الخزينة متاحة حالياً للعمليات</div>
                </div>
                <AppSwitch v-model="formData.is_active" :true-value="1" :false-value="0" hide-details />
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-form>
    </AppDialog>

    <!-- Delete Dialog -->
    <!-- Delete Confirmation Dialog -->
    <AppDialog
      v-model="showDeleteDialog"
      title="حذف الخزينة؟"
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
        <div class="mt-2 text-error text-caption font-weight-bold">
          <v-icon icon="ri-error-warning-line" size="small" class="me-1" />
          هذا الإجراء قد يؤثر على السجلات المالية المرتبطة!
        </div>
      </div>
    </AppDialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useCashBoxesData } from '../composables/useCashBoxesData';
import { useDataTable } from '@/composables/useDataTable';
import { useApi } from '@/composables/useApi';
import { usePermissions } from '@/composables/usePermissions';
import AppPageHeader from '@/components/common/AppPageHeader.vue';
import AppDataTable from '@/components/common/AppDataTable.vue';
import AppButton from '@/components/common/AppButton.vue';
import AppDialog from '@/components/common/AppDialog.vue';
import AppInput from '@/components/common/AppInput.vue';
import AppSwitch from '@/components/common/AppSwitch.vue';
import AppCard from '@/components/common/AppCard.vue';
import AppInfiniteScroll from '@/components/common/AppInfiniteScroll.vue';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import EmptyState from '@/components/common/EmptyState.vue';
import { PERMISSIONS } from '@/config/permissions';

const { can } = usePermissions();
const api = useApi('/api/cash-boxes');
const typesApi = useApi('/api/cash-box-types');
const { deleteCashBox } = useCashBoxesData();

// API fetch function for useDataTable
const fetchCashBoxesApi = async params => {
  // Map 'search' to 'name' for this API if needed, but useDataTable handles 'search'
  // If the API specifically needs 'name' instead of 'search':
  const finalParams = { ...params };
  if (params.search) {
    finalParams.name = params.search;
  }
  return await api.get(finalParams, { showLoading: false });
};

// DataTable logic
const {
  items: cashBoxes,
  loading,
  currentPage: page,
  perPage: itemsPerPage,
  total,
  search,
  filters,
  sortBy,
  changePage,
  changeSort,
  applyFilters,
  fetchData,
} = useDataTable(fetchCashBoxesApi, {
  syncWithUrl: true,
  initialSortBy: 'name',
  initialSortOrder: 'asc',
  initialPerPage: 12,
});

// UI State
const viewMode = ref('grid');
const showDialog = ref(false);
const showDeleteDialog = ref(false);
const selectedItem = ref(null);
const saving = ref(false);
const deleting = ref(false);
const formRef = ref(null);
const cashBoxTypes = ref([]);
const loadingTypes = ref(false);
const formData = ref({ name: '', cash_box_type_id: null, initial_balance: 0, is_active: 1 });

const isEdit = computed(() => !!selectedItem.value);

const headers = computed(() => {
  const baseHeaders = [
    { title: 'الاسم', key: 'name', sortable: true },
    { title: 'النوع', key: 'type', sortable: true },
    { title: 'الرصيد', key: 'balance', align: 'end', sortable: true },
    { title: 'الحالة', key: 'is_active', align: 'center', sortable: true },
  ];

  if (can(PERMISSIONS.CASH_BOXES_UPDATE_ALL) || can(PERMISSIONS.CASH_BOXES_DELETE_ALL)) {
    baseHeaders.push({ title: 'الإجراءات', key: 'actions', sortable: false, align: 'end', width: '120px' });
  }

  return baseHeaders;
});

const rules = { required: v => !!v || 'مطلوب' };

const loadTypes = async () => {
  loadingTypes.value = true;
  try {
    const response = await typesApi.get({ per_page: 100 }, { showLoading: false, showError: false });
    cashBoxTypes.value = response.data || [];
  } finally {
    loadingTypes.value = false;
  }
};

const handleCreate = () => {
  selectedItem.value = null;
  formData.value = { name: '', cash_box_type_id: null, initial_balance: 0, is_active: 1 };
  showDialog.value = true;
  if (!cashBoxTypes.value.length) loadTypes();
};

const handleEdit = item => {
  selectedItem.value = item;
  formData.value = { ...item };
  showDialog.value = true;
  if (!cashBoxTypes.value.length) loadTypes();
};

const handleDelete = item => {
  selectedItem.value = item;
  showDeleteDialog.value = true;
};

const handleSave = async () => {
  const { valid } = await formRef.value.validate();
  if (!valid) return;

  saving.value = true;
  try {
    if (isEdit.value) {
      await api.update(selectedItem.value.id, formData.value, { successMessage: 'تم التحديث بنجاح' });
    } else {
      await api.create(formData.value, { successMessage: 'تم الإضافة بنجاح' });
    }
    showDialog.value = false;
    fetchData();
  } finally {
    saving.value = false;
  }
};

const confirmDelete = async () => {
  deleting.value = true;
  try {
    await deleteCashBox(selectedItem.value.id);
    showDeleteDialog.value = false;
    fetchData();
  } finally {
    deleting.value = false;
  }
};

const formatCurrency = amount => {
  if (amount === undefined || amount === null) return '0.00 ج.م';
  return new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP' }).format(amount);
};

const handleSearch = () => {
  applyFilters();
};

const handleLoadMore = () => {
  if (loading.value || cashBoxes.value.length >= total.value) return;
  page.value++;
  fetchData({ append: true });
};

const onTableOptionsUpdate = options => {
  if (viewMode.value === 'list') {
    changeSort(options);
  }
};

onMounted(() => {
  // Initial load is handled by useDataTable
});

watch(viewMode, () => {
  page.value = 1;
  fetchData();
});

const togglingId = ref(null);
const handleToggleStatus = async item => {
  togglingId.value = item.id;
  try {
    await api.update(item.id, { is_active: !item.is_active });
    item.is_active = !item.is_active;
  } finally {
    togglingId.value = null;
  }
};
</script>

<style scoped>
.cashbox-page :deep(.v-container) {
  max-width: 100% !important;
}

.cashbox-card {
  transition: all 0.3s ease;
}

.cashbox-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(var(--v-theme-primary), 0.08) !important;
}
</style>
