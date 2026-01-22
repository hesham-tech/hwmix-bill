<template>
  <div class="warehouses-page">
    <!-- Page Header -->
    <div class="page-header d-flex align-center justify-space-between mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold ml-2">المخازن</h1>
        <p class="text-body-1 text-grey">إدارة ومتابعة المخازن والمخزون الخاص بكل منها</p>
      </div>
      <AppButton prepend-icon="ri-add-line" size="large" elevation="2" @click="handleCreate"> مخزن جديد </AppButton>
    </div>

    <!-- Filters & View Toggle -->
    <AppCard class="mb-6">
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

    <template v-else>
      <!-- Grid View -->
      <v-row v-if="viewMode === 'grid'">
        <v-col v-for="warehouse in warehouses" :key="warehouse.id" cols="12" sm="6" md="4" lg="3">
          <AppCard class="warehouse-card h-100" no-padding>
            <div class="warehouse-card-header d-flex align-center justify-center pa-4 bg-primary-lighten-5 position-relative">
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

            <v-divider />

            <div class="pa-3 d-flex align-center justify-space-between">
              <v-btn
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
                  v-if="!warehouse.is_default"
                  icon="ri-star-line"
                  variant="text"
                  color="warning"
                  @click="handleSetDefault(warehouse)"
                  title="تعيين كافتراضي"
                />
                <AppButton icon="ri-edit-line" variant="text" color="primary" @click="handleEdit(warehouse)" />
                <AppButton icon="ri-delete-bin-line" variant="text" color="error" @click="handleDelete(warehouse)" />
              </div>
            </div>
          </AppCard>
        </v-col>
      </v-row>

      <!-- List View -->
      <AppDataTable
        v-else
        v-model:page="page"
        v-model:items-per-page="itemsPerPage"
        v-model:sort-by="sortBy"
        :headers="headers"
        :items="warehouses"
        :total-items="totalItems"
        :loading="loading"
        :searchable="false"
        @update:options="loadWarehouses"
        @edit="handleEdit"
        @delete="handleDelete"
      >
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

        <template #item.status="{ item }">
          <v-chip :color="item.is_active ? 'success' : 'error'" size="small" variant="flat" class="font-weight-bold">
            {{ item.is_active ? 'نشط' : 'معطل' }}
          </v-chip>
        </template>

        <template #item.actions="{ item }">
          <div class="d-flex gap-2 justify-end">
            <AppButton icon="ri-eye-line" variant="text" color="secondary" @click="handleViewStock(item)" title="جرد المخزون" />
            <AppButton
              v-if="!item.is_default"
              icon="ri-star-line"
              variant="text"
              color="warning"
              @click="handleSetDefault(item)"
              title="تعيين كافتراضي"
            />
            <AppButton icon="ri-edit-line" variant="text" color="primary" @click="handleEdit(item)" />
            <AppButton icon="ri-delete-bin-line" variant="text" color="error" @click="handleDelete(item)" />
          </div>
        </template>
      </AppDataTable>

      <!-- Pagination for Grid View -->
      <div v-if="viewMode === 'grid'" class="mt-8 d-flex align-center justify-space-between flex-wrap gap-4 px-2">
        <div class="text-body-2 text-grey">عرض {{ warehouses.length }} من إجمالي {{ totalItems }} مخزن</div>
        <v-pagination
          v-model="page"
          :length="Math.ceil(totalItems / itemsPerPage)"
          :total-visible="5"
          rounded="pill"
          size="small"
          active-color="primary"
          @update:model-value="loadWarehouses"
        />
      </div>
    </template>

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
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useWarehouseStore } from '../store/warehouse.store';
import { useDialog, useConfirm } from '@/composables';
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

const store = useWarehouseStore();
const { warehouses, loading, totalItems, page, itemsPerPage, search, sortBy } = storeToRefs(store);

const { isOpen, formData, isEditMode, open, close } = useDialog();
const { showConfirm, confirmMessage, confirm, handleConfirm, handleCancel } = useConfirm();

const warehouseFormRef = ref(null);
const isSaving = ref(false);
const viewMode = ref('grid');

const isAdjustmentOpen = ref(false);
const selectedWarehouse = ref(null);

const headers = [
  { title: 'المخزن', key: 'name', sortable: true },
  { title: 'الموقع', key: 'location', sortable: false },
  { title: 'الحالة', key: 'status', sortable: false, align: 'center' },
  { title: 'الإجراءات', key: 'actions', sortable: false, align: 'end' },
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
  border-radius: 20px;
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
</style>
