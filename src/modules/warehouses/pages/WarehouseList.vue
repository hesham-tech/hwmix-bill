<template>
  <div class="warehouses-page">
    <!-- Page Header -->
    <div class="page-header d-flex align-center justify-space-between mb-2">
      <div>
        <h1 class="text-h4 font-weight-bold ml-2">المخازن</h1>
        <p class="text-body-1 text-grey">إدارة ومتابعة المخازن والمخزون الخاص بكل منها</p>
      </div>
      <AppButton v-if="canAny(PERMISSIONS.WAREHOUSES_CREATE)" prepend-icon="ri-add-line" size="large" elevation="2" @click="handleCreate">
        مخزن جديد
      </AppButton>
    </div>

    <!-- Filters & View Toggle -->
    <AppCard class="mb-2">
      <div class="d-flex align-center flex-wrap gap-4">
        <AppInput
          v-model="search"
          label="بحث عن مخزن..."
          prepend-inner-icon="ri-search-line"
          class="max-width-300 flex-grow-1"
          hide-details
          @update:model-value="handleSearch"
        />

        <v-spacer />

        <v-btn-group variant="outlined" density="comfortable" color="primary" class="rounded-pill overflow-hidden">
          <AppButton :active="viewMode === 'grid'" icon="ri-grid-fill" @click="viewMode = 'grid'" title="عرض شبكي" />
          <AppButton :active="viewMode === 'list'" icon="ri-list-check" @click="viewMode = 'list'" title="عرض قائمة" />
        </v-btn-group>
      </div>
    </AppCard>

    <!-- Content Area -->
    <LoadingSpinner v-if="loading && !warehouses.length" size="64" text="جاري تحميل البيانات..." />

    <EmptyState
      v-else-if="!warehouses.length"
      icon="ri-building-4-line"
      title="لا توجد مخازن حالياً"
      message="ابدأ بإضافة أول مخزن لنظامك لتتمكن من إدارة المخزون"
      show-action
      action-text="إضافة مخزن"
      @action="handleCreate"
    />

    <AppDataTable
      table-key="warehouses.index"
      v-else
      v-model:page="page"
      v-model:items-per-page="itemsPerPage"
      v-model:sort-by="sortBy"
      :headers="headers"
      :items="warehouses"
      :total-items="totalItems"
      :loading="loading"
      :searchable="false"
      :grid-enabled="viewMode === 'grid'"
      @update:options="loadWarehouses"
      @edit="handleEdit"
      @delete="handleDelete"
    >
      <!-- Grid View Slot -->
      <template #grid="{ items, handleContextMenu }">
        <v-row dense>
          <v-col v-for="warehouse in items" :key="warehouse.id" cols="12" sm="6" md="4" lg="3">
            <AppCard class="warehouse-card h-100" no-padding @contextmenu.prevent="handleContextMenu($event, { item: warehouse })">
              <div class="warehouse-card-header d-flex align-center justify-center bg-primary-lighten-5 position-relative">
                <v-avatar color="primary" size="80" class="elevation-2">
                  <v-icon icon="ri-building-4-line" size="40" color="white" />
                </v-avatar>

                <v-chip
                  :color="warehouse.is_active ? 'success' : 'error'"
                  size="x-small"
                  class="position-absolute top-2 right-2 font-weight-bold"
                  variant="flat"
                >
                  {{ warehouse.is_active ? 'نشط' : 'معطل' }}
                </v-chip>
              </div>

              <v-card-item>
                <div class="d-flex align-center justify-space-between w-100">
                  <v-card-title class="text-h6 font-weight-bold">{{ warehouse.name }}</v-card-title>
                  <v-tooltip v-if="warehouse.is_default" text="المستودع الافتراضي">
                    <template #activator="{ props }">
                      <v-icon v-bind="props" icon="ri-star-fill" color="warning" size="24" />
                    </template>
                  </v-tooltip>
                </div>
                <v-card-subtitle class="d-flex align-center mt-1">
                  <v-icon icon="ri-map-pin-line" size="14" class="me-1" color="primary" />
                  {{ warehouse.location || 'عنوان غير محدد' }}
                </v-card-subtitle>
              </v-card-item>

              <v-card-text class="pt-0">
                <p class="text-body-2 text-grey-darken-1 text-truncate-2 height-40">
                  {{ warehouse.description || 'لا يوجد وصف إضافي لهذا المخزن.' }}
                </p>
              </v-card-text>

              <v-divider class="border-opacity-25" />

              <div class="px-4 py-3 bg-grey-lighten-5">
                <div class="d-flex justify-space-between align-center mb-1 text-body-2">
                  <span class="text-grey-darken-1 d-flex align-center">
                    <v-icon icon="ri-archive-line" size="16" class="me-1" color="grey-darken-1" />
                    إجمالي القطع:
                  </span>
                  <span class="font-weight-bold text-slate-800">{{ formatNumber(warehouse.total_items, 0) }}</span>
                </div>
                <div class="d-flex justify-space-between align-center mb-1 text-body-2">
                  <span class="text-grey-darken-1 d-flex align-center">
                    <v-icon icon="ri-price-tag-3-line" size="16" class="me-1" color="grey-darken-1" />
                    عدد الأصناف:
                  </span>
                  <span class="font-weight-medium text-grey-darken-3">{{ formatNumber(warehouse.total_unique_items, 0) }} صنف</span>
                </div>
                <div class="d-flex justify-space-between align-center mb-1 text-body-2">
                  <span class="text-grey-darken-1 d-flex align-center">
                    <v-icon icon="ri-money-dollar-circle-line" size="16" class="me-1" color="success" />
                    قيمة الجملة:
                  </span>
                  <span class="font-weight-bold text-success-darken-1">{{ formatCurrency(warehouse.total_wholesale_value) }}</span>
                </div>
                <div class="d-flex justify-space-between align-center mb-2 text-body-2">
                  <span class="text-grey-darken-1 d-flex align-center">
                    <v-icon icon="ri-shopping-cart-line" size="16" class="me-1" color="primary" />
                    قيمة القطاعي:
                  </span>
                  <span class="font-weight-bold text-primary">{{ formatCurrency(warehouse.total_retail_value) }}</span>
                </div>

                <div class="d-flex gap-1 flex-wrap mt-2 pt-2 border-top border-dashed">
                  <v-chip v-if="warehouse.expired_items_count > 0" color="error" size="x-small" variant="flat" class="font-weight-bold">
                    <v-icon icon="ri-time-line" start size="10" />
                    {{ warehouse.expired_items_count }} منتهي
                  </v-chip>
                  <v-chip v-if="warehouse.low_stock_items_count > 0" color="warning" size="x-small" variant="flat" class="font-weight-bold">
                    <v-icon icon="ri-alert-line" start size="10" />
                    {{ warehouse.low_stock_items_count }} ناقص
                  </v-chip>
                  <v-chip v-if="warehouse.expiring_soon_items_count > 0" color="info" size="x-small" variant="flat" class="font-weight-bold">
                    <v-icon icon="ri-calendar-todo-line" start size="10" />
                    {{ warehouse.expiring_soon_items_count }} قريباً
                  </v-chip>
                  <span v-if="warehouse.expired_items_count === 0 && warehouse.low_stock_items_count === 0 && warehouse.expiring_soon_items_count === 0" class="text-caption text-success font-weight-medium d-flex align-center">
                    <v-icon icon="ri-checkbox-circle-fill" color="success" class="me-1" size="12" />
                    حالة المخزون سليمة
                  </span>
                </div>
              </div>

              <v-divider />

              <div class="d-flex align-center justify-space-between px-3 py-2">
                <v-btn
                  v-if="canAny(PERMISSIONS.STOCKS_VIEW_ALL, PERMISSIONS.STOCKS_VIEW_CHILDREN, PERMISSIONS.STOCKS_VIEW_SELF)"
                  variant="tonal"
                  color="secondary"
                  size="small"
                  prepend-icon="ri-eye-line"
                  class="rounded-pill font-weight-bold"
                  @click="handleViewStock(warehouse)"
                >
                  جرد المخزون
                </v-btn>
                <div class="d-flex gap-2">
                  <AppButton
                    v-if="canAny(PERMISSIONS.STOCKS_VIEW_ALL, PERMISSIONS.STOCKS_VIEW_CHILDREN, PERMISSIONS.STOCKS_VIEW_SELF)"
                    icon="ri-arrow-left-right-line"
                    variant="text"
                    color="primary"
                    @click="handleOpenTransfer(warehouse)"
                    title="تحويل مخزني"
                  />
                  <AppButton
                    v-if="
                      !warehouse.is_default &&
                      canAny(PERMISSIONS.WAREHOUSES_UPDATE_ALL, PERMISSIONS.WAREHOUSES_UPDATE_CHILDREN, PERMISSIONS.WAREHOUSES_UPDATE_SELF)
                    "
                    icon="ri-star-line"
                    variant="text"
                    color="warning"
                    @click="handleSetDefault(warehouse)"
                    title="تعيين كافتراضي"
                  />
                  <AppButton
                    v-if="canAny(PERMISSIONS.WAREHOUSES_UPDATE_ALL, PERMISSIONS.WAREHOUSES_UPDATE_CHILDREN, PERMISSIONS.WAREHOUSES_UPDATE_SELF)"
                    icon="ri-edit-line"
                    variant="text"
                    color="primary"
                    @click="handleEdit(warehouse)"
                  />
                  <AppButton
                    v-if="canAny(PERMISSIONS.WAREHOUSES_DELETE_ALL, PERMISSIONS.WAREHOUSES_DELETE_CHILDREN, PERMISSIONS.WAREHOUSES_DELETE_SELF)"
                    icon="ri-delete-bin-line"
                    variant="text"
                    color="error"
                    @click="handleDelete(warehouse)"
                  />
                </div>
              </div>
            </AppCard>
          </v-col>
        </v-row>
      </template>
      <template #item.name="{ item }">
        <div class="d-flex align-center py-2">
          <v-avatar color="primary-lighten-5" size="40" class="me-3 border">
            <v-icon icon="ri-building-4-line" color="primary" size="small" />
          </v-avatar>
          <div>
            <div class="d-flex align-center">
              <div class="font-weight-bold text-body-1">{{ item.name }}</div>
              <v-tooltip v-if="item.is_default" text="المستودع الافتراضي">
                <template #activator="{ props }">
                  <v-icon v-bind="props" icon="ri-star-fill" color="warning" size="16" class="ms-2" />
                </template>
              </v-tooltip>
            </div>
            <div class="text-caption text-grey">{{ item.description || 'بدون وصف' }}</div>
          </div>
        </div>
      </template>

      <template #item.location="{ item }">
        <div class="d-flex align-center text-body-2">
          <v-icon icon="ri-map-pin-line" size="small" color="secondary" class="me-2" />
          <span class="text-secondary">{{ item.location || 'غير محدد' }}</span>
        </div>
      </template>

      <template #item.total_items="{ item }">
        <span class="font-weight-bold">{{ formatNumber(item.total_items, 0) }}</span>
      </template>

      <template #item.total_unique_items="{ item }">
        <v-chip color="grey-lighten-4" class="text-grey-darken-3 font-weight-medium" size="small">
          {{ formatNumber(item.total_unique_items, 0) }} صنف
        </v-chip>
      </template>

      <template #item.total_wholesale_value="{ item }">
        <span class="font-weight-bold text-success-darken-1">{{ formatCurrency(item.total_wholesale_value) }}</span>
      </template>

      <template #item.total_retail_value="{ item }">
        <span class="font-weight-bold text-primary">{{ formatCurrency(item.total_retail_value) }}</span>
      </template>

      <template #item.total_cost_value="{ item }">
        <span class="font-weight-bold text-secondary">{{ formatCurrency(item.total_cost_value) }}</span>
      </template>

      <template #item.alerts="{ item }">
        <div class="d-flex align-center justify-center gap-1">
          <!-- المنتجات المنتهية -->
          <v-tooltip v-if="item.expired_items_count > 0" text="منتجات منتهية الصلاحية">
            <template #activator="{ props }">
              <v-chip v-bind="props" color="error" size="small" variant="flat" class="font-weight-bold">
                <v-icon icon="ri-time-line" start size="14" />
                {{ item.expired_items_count }} منتهي
              </v-chip>
            </template>
          </v-tooltip>

          <!-- النواقص -->
          <v-tooltip v-if="item.low_stock_items_count > 0" text="أصناف قاربت على النفاد أو نفدت">
            <template #activator="{ props }">
              <v-chip v-bind="props" color="warning" size="small" variant="flat" class="font-weight-bold">
                <v-icon icon="ri-alert-line" start size="14" />
                {{ item.low_stock_items_count }} ناقص
              </v-chip>
            </template>
          </v-tooltip>

          <!-- تنبيه قرب انتهاء الصلاحية -->
          <v-tooltip v-if="item.expiring_soon_items_count > 0" text="منتجات ستنتهي خلال 30 يوم">
            <template #activator="{ props }">
              <v-chip v-bind="props" color="info" size="small" variant="flat" class="font-weight-bold">
                <v-icon icon="ri-calendar-todo-line" start size="14" />
                {{ item.expiring_soon_items_count }} قريباً
              </v-chip>
            </template>
          </v-tooltip>

          <span v-if="item.expired_items_count === 0 && item.low_stock_items_count === 0 && item.expiring_soon_items_count === 0" class="text-caption text-success font-weight-medium d-flex align-center">
            <v-icon icon="ri-checkbox-circle-fill" color="success" class="me-1" size="14" />
            سليم
          </span>
        </div>
      </template>

      <template #item.status="{ item }">
        <v-chip :color="item.is_active ? 'success' : 'error'" size="small" variant="flat" class="font-weight-bold">
          {{ item.is_active ? 'نشط' : 'معطل' }}
        </v-chip>
      </template>

      <template #extra-actions="{ item }">
        <v-list-item
          v-if="canAny(PERMISSIONS.STOCKS_VIEW_ALL, PERMISSIONS.STOCKS_VIEW_CHILDREN, PERMISSIONS.STOCKS_VIEW_SELF)"
          prepend-icon="ri-eye-line"
          title="جرد المخزون"
          class="text-secondary"
          @click="handleViewStock(item)"
        />
        <v-list-item
          v-if="canAny(PERMISSIONS.STOCKS_VIEW_ALL, PERMISSIONS.STOCKS_VIEW_CHILDREN, PERMISSIONS.STOCKS_VIEW_SELF)"
          prepend-icon="ri-arrow-left-right-line"
          title="تحويل مخزني"
          class="text-primary"
          @click="handleOpenTransfer(item)"
        />
        <v-list-item
          v-if="
            !item.is_default && canAny(PERMISSIONS.WAREHOUSES_UPDATE_ALL, PERMISSIONS.WAREHOUSES_UPDATE_CHILDREN, PERMISSIONS.WAREHOUSES_UPDATE_SELF)
          "
          prepend-icon="ri-star-line"
          title="تعيين كافتراضي"
          class="text-warning"
          @click="handleSetDefault(item)"
        />
        <v-list-item
          v-if="canAny(PERMISSIONS.WAREHOUSES_UPDATE_ALL, PERMISSIONS.WAREHOUSES_UPDATE_CHILDREN, PERMISSIONS.WAREHOUSES_UPDATE_SELF)"
          prepend-icon="ri-edit-line"
          title="تعديل"
          class="text-primary"
          @click="handleEdit(item)"
        />
        <v-list-item
          v-if="canAny(PERMISSIONS.WAREHOUSES_DELETE_ALL, PERMISSIONS.WAREHOUSES_DELETE_CHILDREN, PERMISSIONS.WAREHOUSES_DELETE_SELF)"
          prepend-icon="ri-delete-bin-line"
          title="حذف"
          class="text-error"
          @click="handleDelete(item)"
        />
      </template>
    </AppDataTable>

    <!-- Warehouse Form Dialog -->

    <!-- Warehouse Form Dialog -->
    <AppDialog
      v-model="isOpen"
      :title="isEditMode ? 'تعديل بيانات المخزن' : 'إضافة مخزن جديد'"
      :icon="isEditMode ? 'ri-edit-line' : 'ri-building-4-line'"
      max-width="600"
      :loading="isSaving"
      @confirm="submitWarehouseForm"
      @close="close"
    >
      <WarehouseForm ref="warehouseFormRef" :model-value="formData" @save="handleSave" @cancel="close" />
    </AppDialog>

    <!-- Delete Confirmation -->
    <AppConfirmDialog v-model="showConfirm" :message="confirmMessage" @confirm="handleConfirm" @cancel="handleCancel" />

    <!-- Stock Adjustment Dialog -->
    <StockAdjustmentDialog v-model="isAdjustmentOpen" :warehouse="selectedWarehouse" @success="loadWarehouses" />

    <!-- Stock Transfer Dialog -->
    <StockTransferDialog v-model="isTransferOpen" :warehouse="selectedWarehouse" @success="loadWarehouses" />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useWarehouseStore } from '../store/warehouse.store';
import { useDialog, useConfirm } from '@/composables';
import { usePermissions } from '@/composables/usePermissions';
import { PERMISSIONS } from '@/config/permissions';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import AppDataTable from '@/components/common/AppDataTable.vue';
import AppDialog from '@/components/common/AppDialog.vue';
import AppButton from '@/components/common/AppButton.vue';
import AppCard from '@/components/common/AppCard.vue';
import AppInput from '@/components/common/AppInput.vue';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import EmptyState from '@/components/common/EmptyState.vue';
import AppConfirmDialog from '@/components/common/AppConfirmDialog.vue';
import WarehouseForm from '../components/WarehouseForm.vue';
import StockAdjustmentDialog from '../components/StockAdjustmentDialog.vue';
import StockTransferDialog from '../components/StockTransferDialog.vue';

const store = useWarehouseStore();
const { warehouses, loading, totalItems, page, itemsPerPage, search, sortBy } = storeToRefs(store);

const { isOpen, formData, isEditMode, open, close } = useDialog();
const { showConfirm, confirmMessage, confirm, handleConfirm, handleCancel } = useConfirm();
const { can, canAny } = usePermissions();

const warehouseFormRef = ref(null);
const isSaving = ref(false);
const viewMode = ref('grid');

const isAdjustmentOpen = ref(false);
const isTransferOpen = ref(false);
const selectedWarehouse = ref(null);

const headers = [
  { title: 'المخزن', key: 'name', sortable: true, mandatory: true },
  { title: 'الموقع', key: 'location', sortable: false },
  { title: 'إجمالي القطع', key: 'total_items', align: 'center', sortable: true },
  { title: 'الأصناف', key: 'total_unique_items', align: 'center', sortable: true },
  { title: 'قيمة الجملة', key: 'total_wholesale_value', align: 'end', sortable: true },
  { title: 'قيمة التجزئة', key: 'total_retail_value', align: 'end', sortable: true },
  { title: 'إجمالي التكلفة', key: 'total_cost_value', align: 'end', sortable: true, defaultHide: true },
  { title: 'التنبيهات', key: 'alerts', align: 'center', sortable: false },
  { title: 'المدير', key: 'manager', defaultHide: true },
  { title: 'السعة الاستيعابية', key: 'capacity', defaultHide: true },
  { title: 'الوصف', key: 'description', defaultHide: true },
  { title: 'تاريخ الإنشاء', key: 'created_at', defaultHide: true },
  { title: 'تاريخ التحديث', key: 'updated_at', defaultHide: true },
  { title: 'الحالة', key: 'status', sortable: false, align: 'center' },
  { title: 'الإجراءات', key: 'actions', sortable: false, align: 'end', mandatory: true },
];

const debounce = (fn, delay) => {
  let timeoutId;
  return (...args) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};

const handleSearch = debounce(() => {
  page.value = 1;
  loadWarehouses();
}, 500);

const loadWarehouses = async () => {
  await store.fetchWarehouses();
};

const handleEdit = warehouse => {
  open(warehouse);
};

const handleCreate = () => {
  open({});
};

const handleDelete = warehouse => {
  confirm(`هل أنت متأكد من حذف المخزن "${warehouse.name}"؟`, async () => {
    await store.deleteWarehouse(warehouse.id);
  });
};

const submitWarehouseForm = () => {
  if (warehouseFormRef.value) {
    warehouseFormRef.value.handleSubmit();
  }
};

const handleSave = async data => {
  isSaving.value = true;
  try {
    if (isEditMode.value) {
      await store.updateWarehouse(formData.value.id, data);
    } else {
      await store.createWarehouse(data);
    }
    close();
    await loadWarehouses();
  } finally {
    isSaving.value = false;
  }
};

const handleViewStock = warehouse => {
  selectedWarehouse.value = warehouse;
  isAdjustmentOpen.value = true;
};

const handleOpenTransfer = warehouse => {
  selectedWarehouse.value = warehouse;
  isTransferOpen.value = true;
};

const handleSetDefault = async warehouse => {
  confirm(`هل أنت متأكد من تعيين المخزن "${warehouse.name}" كمخزن افتراضي؟`, async () => {
    await store.setDefaultWarehouse(warehouse.id);
  });
};

onMounted(() => {
  loadWarehouses();
});

watch([page, itemsPerPage], () => {
  if (viewMode.value === 'grid') {
    loadWarehouses();
  }
});
</script>

<style scoped>
.warehouses-page {
  padding: 0;
}

.max-width-300 {
  max-width: 300px;
}

.warehouse-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(var(--v-theme-primary), 0.05);
  overflow: hidden;
}

.warehouse-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 15px 30px rgba(var(--v-theme-primary), 0.1) !important;
}

.warehouse-card-header {
  height: 140px;
  background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.05) 0%, rgba(var(--v-theme-primary), 0.1) 100%);
}

.height-40 {
  height: 40px;
}

.text-truncate-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.gap-2 {
  gap: 8px;
}

.hover-scale {
  transition: transform 0.2s;
}

.hover-scale:hover {
  transform: scale(1.02);
}

.border-dashed {
  border-top: 1px dashed rgba(0, 0, 0, 0.08) !important;
}

.gap-1 {
  gap: 4px;
}

.text-success-darken-1 {
  color: #2e7d32 !important;
}

.text-slate-800 {
  color: #1e293b !important;
}

.border-top {
  border-top: 1px solid rgba(0, 0, 0, 0.08) !important;
}
</style>
