<!-- 
  تعليق عربي: شاشة عرض وإدارة سلة محذوفات الشركات (Soft Deleted Tenants).
  تتيح استعراض الشركات المحذوفة مؤقتاً، استعادتها، أو حذفها نهائياً مع تنظيف وتحديث بيانات المستخدمين المرتبطين.
-->
<template>
  <div class="companies-trash-page">
    <!-- تنبيه عن الحذف التلقائي بعد 30 يوماً -->
    <v-alert
      type="warning"
      variant="tonal"
      class="mb-4 rounded-lg font-weight-medium"
      border="start"
      elevation="0"
    >
      تنبيه: سيتم حذف الشركات الموجودة في سلة المحذوفات تلقائياً وبشكل نهائي بعد مرور 30 يوماً من تاريخ حذفها. الحذف النهائي يؤدي لتطهير جميع السجلات والمستندات وحسابات المستخدمين غير المرتبطين بشركات أخرى.
    </v-alert>

    <AppDataTable
      class="tour-company-trash-table"
      table-key="companies.trash"
      v-model:search="search"
      v-model:page="page"
      v-model:items-per-page="perPage"
      v-model="selectedItems"
      show-select
      :headers="headers"
      :items="companies"
      :total-items="totalItems"
      :loading="loading"
      permission-module="companies"
      title="سلة محذوفات الشركات"
      subtitle="استعراض الشركات المحذوفة مؤقتاً واستعادتها أو إزالتها نهائياً من النظام."
      icon="ri-delete-bin-7-line"
      empty-state-type="companies"
      @update:options="onTableOptionsUpdate"
    >
      <!-- Actions Slot -->
      <template #actions>
        <div class="d-flex gap-2">
          <transition name="fade">
            <div class="d-flex gap-2" v-if="selectedItems.length > 0">
              <AppButton
                color="success"
                variant="tonal"
                prepend-icon="ri-refresh-line"
                size="small"
                class="rounded-pill shadow-sm"
                style="height: 40px"
                @click="handleBatchRestore"
              >
                استعادة المحدد ({{ selectedItems.length }})
              </AppButton>
              <AppButton
                color="error"
                variant="tonal"
                prepend-icon="ri-delete-bin-line"
                size="small"
                class="rounded-pill shadow-sm"
                style="height: 40px"
                @click="handleBatchForceDelete"
              >
                حذف نهائي للمحدد ({{ selectedItems.length }})
              </AppButton>
            </div>
          </transition>
          <AppButton
            color="primary"
            variant="outlined"
            prepend-icon="ri-arrow-right-line"
            size="small"
            class="rounded-pill shadow-sm"
            style="height: 40px"
            @click="router.push({ name: 'companies' })"
          >
            العودة للشركات
          </AppButton>
        </div>
      </template>

      <!-- Company Logo & Name -->
      <template #item.name="{ item }">
        <div class="d-flex align-center py-2">
          <v-avatar size="40" rounded="lg" color="primary-lighten-5" class="me-3 border">
            <v-img v-if="item.logo" :src="item.logo" contain />
            <v-icon v-else icon="ri-building-line" color="primary" size="20" />
          </v-avatar>
          <div>
            <div class="font-weight-bold text-primary">{{ item.name }}</div>
            <div class="text-caption text-grey">{{ item.field || 'لا يوجد نشاط محدد' }}</div>
          </div>
        </div>
      </template>

      <!-- Created At -->
      <template #item.created_at="{ item }">
        <span class="text-caption text-grey">{{ formatDate(item.created_at) }}</span>
      </template>

      <!-- Deleted At -->
      <template #item.deleted_at="{ item }">
        <span class="text-caption text-error font-weight-medium">{{ formatDate(item.deleted_at) }}</span>
      </template>

      <!-- Actions Column -->
      <template #item.actions="{ item }">
        <div class="d-flex justify-end gap-1">
          <AppButton
            icon="ri-refresh-line"
            variant="text"
            color="success"
            size="small"
            tooltip="استعادة الشركة"
            @click="handleRestore(item)"
          />
          <AppButton
            icon="ri-delete-bin-line"
            variant="text"
            color="error"
            size="small"
            tooltip="حذف نهائي"
            @click="handleForceDelete(item)"
          />
        </div>
      </template>
    </AppDataTable>

    <!-- حوار تأكيد الاستعادة -->
    <AppConfirmDialog
      v-model="showRestoreDialog"
      type="warning"
      title="تأكيد استعادة الشركة"
      :message="
        isBatchAction
          ? `هل أنت متأكد من استعادة الشركات المحددة وعددها ${selectedItems.length}؟ ستعود الشركات للعمل بكامل طاقتها وصلاحياتها في النظام.`
          : `هل أنت متأكد من استعادة الشركة '${selectedItem?.name}'؟ ستعود الشركة للعمل بكامل طاقتها وصلاحياتها في النظام.`
      "
      confirm-text="استعادة"
      cancel-text="تراجع"
      :loading="actionLoading"
      @confirm="confirmRestore"
      @cancel="showRestoreDialog = false"
    />

    <!-- حوار تأكيد الحذف النهائي -->
    <AppConfirmDialog
      v-model="showDeleteDialog"
      type="error"
      title="تحذير: تأكيد الحذف النهائي والقطعي"
      :message="
        isBatchAction
          ? `⚠️ تحذير خطير: هل أنت متأكد من حذف الشركات المحددة وعددها ${selectedItems.length} نهائياً؟ هذا الإجراء سيؤدي لتدمير وتطهير جميع السجلات والفواتير والعمليات المالية والملفات وحذف المستخدمين الذين لا يملكون أي شركات أخرى بشكل كامل، ولا يمكن التراجع عن هذا الإجراء أبداً.`
          : `⚠️ تحذير خطير: هل أنت متأكد من حذف الشركة '${selectedItem?.name}' نهائياً؟ هذا الإجراء سيؤدي لتدمير وتطهير جميع السجلات والفواتير والعمليات المالية والملفات وحذف المستخدمين الذين لا يملكون أي شركات أخرى بشكل كامل، ولا يمكن التراجع عن هذا الإجراء أبداً.`
      "
      confirm-text="حذف نهائي قطعي"
      cancel-text="تراجع"
      :loading="actionLoading"
      @confirm="confirmForceDelete"
      @cancel="showDeleteDialog = false"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useDataTable } from '@/composables/useDataTable';
import { AppDataTable, AppButton, AppConfirmDialog } from '@/components';
import { companyService } from '@/api';
import { formatDate } from '@/utils/formatters';

const router = useRouter();

// API fetch function
const fetchTrashedCompaniesApi = async params => {
  return await companyService.getTrash(params);
};

// DataTable logic
const {
  items: companies,
  loading,
  currentPage: page,
  perPage,
  total: totalItems,
  search,
  refresh,
} = useDataTable(fetchTrashedCompaniesApi, {
  syncWithUrl: true,
  initialSortBy: 'deleted_at',
  initialSortOrder: 'desc',
  initialPerPage: 15,
  immediate: true,
});

// State
const selectedItems = ref([]);
const showRestoreDialog = ref(false);
const showDeleteDialog = ref(false);
const selectedItem = ref(null);
const isBatchAction = ref(false);
const actionLoading = ref(false);

// Table Headers
const headers = [
  { title: 'اسم الشركة والنشاط', key: 'name', align: 'start', sortable: true, mandatory: true },
  { title: 'المدير / المالك', key: 'owner_name', sortable: true },
  { title: 'تاريخ الإنشاء', key: 'created_at', sortable: true },
  { title: 'تاريخ الحذف', key: 'deleted_at', sortable: true },
  { title: 'الإجراءات', key: 'actions', sortable: false, align: 'end', mandatory: true },
];

const onTableOptionsUpdate = options => {
  // Sort/Pagination changes are handled automatically by useDataTable when synced.
};

// Actions
const handleRestore = (item) => {
  selectedItem.value = item;
  isBatchAction.value = false;
  showRestoreDialog.value = true;
};

const handleBatchRestore = () => {
  isBatchAction.value = true;
  showRestoreDialog.value = true;
};

const confirmRestore = async () => {
  actionLoading.value = true;
  try {
    const ids = isBatchAction.value ? selectedItems.value : [selectedItem.value.id];
    await companyService.restoreTrash(ids);
    showRestoreDialog.value = false;
    selectedItems.value = [];
    refresh();
  } catch (error) {
    // Handled by BaseService
  } finally {
    actionLoading.value = false;
  }
};

const handleForceDelete = (item) => {
  selectedItem.value = item;
  isBatchAction.value = false;
  showDeleteDialog.value = true;
};

const handleBatchForceDelete = () => {
  isBatchAction.value = true;
  showDeleteDialog.value = true;
};

const confirmForceDelete = async () => {
  actionLoading.value = true;
  try {
    const ids = isBatchAction.value ? selectedItems.value : [selectedItem.value.id];
    await companyService.forceDeleteTrash(ids);
    showDeleteDialog.value = false;
    selectedItems.value = [];
    refresh();
  } catch (error) {
    // Handled by BaseService
  } finally {
    actionLoading.value = false;
  }
};
</script>

<style scoped>
.companies-trash-page {
  max-width: 100%;
}
.gap-2 {
  gap: 8px;
}
</style>
