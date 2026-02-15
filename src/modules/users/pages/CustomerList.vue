<template>
  <div class="customers-page">
    <v-container fluid class="pa-0">
      <v-row class="ma-0">
        <v-col cols="12" class="pa-0">
          <v-card rounded="md" class="border shadow-sm">
            <AppDataTable
              v-model:sort-by="sortByVuetify"
              v-model:search="searchText"
              :filters="advancedFilters"
              :items-per-page="-1"
              :headers="headers"
              :items="users || []"
              :total-items="totalItems || 0"
              :loading="loading"
              :table-height="'calc(100vh - 220px)'"
              hide-pagination
              grid-enabled
              :grid-options="{
                titleKey: 'full_name',
                avatarKey: 'image_url',
                bodyKeys: ['phone', 'balance_display', 'status'],
              }"
              infinite-scroll
              :has-more="(users?.length || 0) < (totalItems || 0)"
              permission-module="users"
              title="العملاء"
              subtitle="إدارة بيانات العملاء والبحث في سجلاتهم"
              icon="ri-team-line"
              @update:filters="applyFilters"
              @update:options="onTableOptionsUpdate"
              @edit="handleEdit"
              @delete="handleDelete"
              @view="item => $router.push(`/app/users/${item.id}`)"
              @load="handleLoadMore"
            >
              <template #actions>
                <AppButton
                  v-if="can(PERMISSIONS.USERS_CREATE)"
                  color="primary"
                  prepend-icon="ri-user-add-line"
                  size="small"
                  class="rounded-pill shadow-sm"
                  style="height: 40px"
                  @click="handleCreate"
                >
                  عميل جديد
                </AppButton>
              </template>

              <!-- Custom Templates -->
              <template #item.full_name="{ item }">
                <AppUserBalanceProfile :user="item" @click="$router.push(`/app/users/${item.id}`)" />
              </template>

              <template #item.phone="{ item }">
                <div dir="ltr" class="text-caption font-weight-medium">{{ item.phone }}</div>
              </template>

              <template #item.balance_display="{ item }">
                <v-chip :color="item.balance < 0 ? 'error' : 'success'" variant="tonal" size="small" class="font-weight-bold">
                  {{ formatCurrency(Math.abs(item.balance)) }} {{ item.balance < 0 ? 'عليه' : 'له' }}
                </v-chip>
              </template>

              <template #item.status="{ item }">
                <v-chip
                  :color="[1, '1', true, 'active'].includes(item.status) ? 'success' : 'error'"
                  size="x-small"
                  variant="flat"
                  class="font-weight-bold px-2"
                >
                  {{ [1, '1', true, 'active'].includes(item.status) ? 'نشط' : 'معطل' }}
                </v-chip>
              </template>

              <template #extra-actions="{ item, inMenu }">
                <!-- Payment Action -->
                <v-list-item
                  v-if="inMenu && can(PERMISSIONS.PAYMENTS_CREATE)"
                  prepend-icon="ri-money-dollar-circle-line"
                  title="سداد دفعة"
                  class="text-success"
                  @click="$router.push(`/app/payments/create?user_id=${item.id}`)"
                />
                <AppButton
                  v-else-if="can(PERMISSIONS.PAYMENTS_CREATE)"
                  icon="ri-money-dollar-circle-line"
                  size="small"
                  variant="text"
                  color="success"
                  tooltip="سداد دفعة"
                  @click="$router.push(`/app/payments/create?user_id=${item.id}`)"
                />

                <!-- Installment Plan Action -->
                <v-list-item
                  v-if="inMenu && can(PERMISSIONS.INSTALLMENT_PLANS_CREATE)"
                  prepend-icon="ri-calendar-todo-line"
                  title="خطة تقسيط"
                  class="text-primary"
                  @click="$router.push(`/app/invoices/create?type=installment_sale&user_id=${item.id}`)"
                />
                <AppButton
                  v-else-if="can(PERMISSIONS.INSTALLMENT_PLANS_CREATE)"
                  icon="ri-calendar-todo-line"
                  size="small"
                  variant="text"
                  color="primary"
                  tooltip="خطة تقسيط"
                  @click="$router.push(`/app/invoices/create?type=installment_sale&user_id=${item.id}`)"
                />
              </template>
            </AppDataTable>
          </v-card>
        </v-col>
      </v-row>

      <!-- User Form Dialog -->
      <AppDialog
        v-model="isOpen"
        :title="isEditMode ? `تعديل بيانات: ${formData.nickname || formData.full_name || ''}` : 'إضافة عميل جديد'"
        :subtitle="isEditMode ? 'تحديث المعلومات الأساسية' : 'إضافة عميل جديد للنظام'"
        :icon="isEditMode ? 'ri-user-edit-line' : 'ri-user-add-line'"
        max-width="800"
        hide-actions
      >
        <UserForm ref="userFormRef" v-model="formData" :is-edit-mode="isEditMode" hide-actions @save="handleSave" @cancel="close">
          <!-- Inject role hidden field -->
          <template #extra-fields>
            <input type="hidden" :value="'customer'" name="role" />
          </template>
        </UserForm>

        <template #actions>
          <AppButton variant="tonal" color="grey" @click="close">إلغاء</AppButton>
          <AppButton :loading="userFormRef?.loading" color="primary" class="px-8 font-weight-bold rounded-pill shadow-md" @click="handleSubmit">
            <v-icon :icon="userFormRef?.form?.id ? 'ri-user-received-line' : 'ri-save-line'" class="me-2" />
            {{ isEditMode ? 'تحديث البيانات' : userFormRef?.form?.id ? 'ربط العميل' : 'حفظ العميل' }}
          </AppButton>
        </template>
      </AppDialog>

      <div class="px-6 pb-6 mt-4">
        <AppConfirmDialog v-model="showConfirm" :message="confirmMessage" @confirm="handleConfirm" @cancel="handleCancel" />
      </div>
    </v-container>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { usePermissions } from '@/composables/usePermissions';
import { useDataTable } from '@/composables/useDataTable';
import { userService } from '@/api';
import { useUser } from '../composables/useUser';
import UserForm from '../components/UserForm.vue';
import { AppDataTable, AppButton, AppDialog, AppConfirmDialog, AppUserBalanceProfile } from '@/components';
import { PERMISSIONS } from '@/config/permissions';
import { formatCurrency } from '@/utils/formatters';

const { can } = usePermissions();
const userFormRef = ref(null);

// Advanced Filters (Simplified for Customers)
const advancedFilters = [
  {
    key: 'status',
    title: 'الحالة',
    type: 'select',
    items: [
      { title: 'نشط', value: 'active' },
      { title: 'معطل', value: 'inactive' },
    ],
  },
];

const {
  formData,
  isEditMode,
  isOpen,
  close,
  showConfirm,
  confirmMessage,
  handleConfirm,
  handleCancel,
  saveUser,
  handleDelete,
  handleEdit,
  handleCreate: baseHandleCreate,
} = useUser();

// Override handleCreate to set default role
const handleCreate = () => {
  baseHandleCreate();
  formData.value.role = 'customer';
  formData.value.roles = ['customer'];
};

// API fetch function
const fetchUsersApi = async params => {
  return await userService.getAll({ ...params, role: 'customer' }, { showToast: false });
};

// DataTable Logic
const {
  items: users,
  loading,
  currentPage: page,
  total: totalItems,
  lastPage,
  search: searchText,
  sortByVuetify,
  changeSort,
  applyFilters,
  fetchData,
} = useDataTable(fetchUsersApi, {
  syncWithUrl: true,
  initialSortBy: 'created_at',
  initialSortOrder: 'desc',
  immediate: true,
});

const handleLoadMore = () => {
  if (loading.value || users.value.length >= totalItems.value || page.value >= (lastPage.value || Infinity)) return;
  page.value++;
  fetchData({ append: true });
};

const onTableOptionsUpdate = options => {
  changeSort(options);
};

const handleSubmit = () => {
  // Ensure role is set before submit
  if (!formData.value.role) {
    formData.value.role = 'customer';
    formData.value.roles = ['customer'];
  }
  userFormRef.value?.handleSubmit();
};

const handleSave = async data => {
  // Ensure role is customer
  if (!data.roles || !data.roles.includes('customer')) {
    data.roles = ['customer'];
    data.role = 'customer';
  }
  await saveUser(data);
  fetchData();
  close();
};

const headers = [
  { title: 'العميل', key: 'full_name', sortable: true },
  { title: 'رقم الهاتف', key: 'phone', sortable: true },
  { title: 'الرصيد', key: 'balance_display', sortable: true, align: 'end' },
  { title: 'الحالة', key: 'status', sortable: true },
  { title: 'تاريخ الإضافة', key: 'created_at', sortable: true },
  { title: 'الإجراءات', key: 'actions', sortable: false, align: 'end' },
];
</script>

<style scoped>
.customers-page :deep(.v-container) {
  max-width: 100% !important;
}
</style>
