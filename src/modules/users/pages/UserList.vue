<template>
  <div class="users-page">
    <v-container fluid class="pa-0">
      <v-row class="ma-0">
        <v-col cols="12" class="pa-0">
          <v-card rounded="md" class="border shadow-sm">
            <AppDataTable
              v-model:sort-by="sortByVuetify"
              v-model:search="searchText"
              :filters="advancedFilters"
              v-model:items-per-page="itemsPerPage"
              v-model:page="page"
              :headers="computedHeaders"
              :items="users || []"
              :total-items="totalItems || 0"
              :loading="loading"
              :table-height="'calc(100vh - 220px)'"
              grid-enabled
              :grid-options="{
                titleKey: 'full_name',
                avatarKey: 'image_url',
                bodyKeys: ['phone', 'roles', 'status'],
              }"
              permission-module="users"
              title="المستخدمين"
              subtitle="إدارة الحسابات والصلاحيات في النظام"
              icon="ri-group-line"
              @update:filters="applyFilters"
              @update:options="onTableOptionsUpdate"
              @edit="handleEdit"
              @delete="handleDelete"
              @view="item => $router.push(`/app/users/${item.id}`)"
            >
              <template #actions>
                <div class="d-flex align-center gap-3">
                  <v-checkbox
                    v-if="can(PERMISSIONS.ADMIN_SUPER)"
                    v-model="currentCompanyOnly"
                    label="المستخدمين في هذه الشركة فقط"
                    hide-details
                    density="compact"
                    class="me-4"
                    color="primary"
                  />
                  <AppButton
                    v-if="can(PERMISSIONS.USERS_CREATE)"
                    color="primary"
                    prepend-icon="ri-user-add-line"
                    size="small"
                    class="rounded-pill shadow-sm"
                    style="height: 40px"
                    @click="handleCreate"
                  >
                    مستخدم جديد
                  </AppButton>
                </div>
              </template>

              <!-- Custom Templates -->
              <template #item.full_name="{ item }">
                <AppUserBalanceProfile :user="item" @click="$router.push(`/app/users/${item.id}`)" />
              </template>

              <template #item.phone="{ item }">
                <div dir="ltr" class="text-caption font-weight-medium text-grey-darken-1">{{ item.phone }}</div>
              </template>

              <template #item.roles="{ item }">
                <div class="d-flex flex-wrap gap-1">
                  <v-chip
                    v-for="role in item.roles || []"
                    :key="typeof role === 'object' ? role.name : role"
                    size="x-small"
                    :color="getRoleColor(role)"
                    variant="tonal"
                    class="font-weight-bold px-2"
                  >
                    {{ typeof role === 'object' ? role.label : role }}
                  </v-chip>
                </div>
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

              <template #extra-actions="{ item }">
                <!-- Balance Management Actions -->
                <v-list-item
                  v-if="can(PERMISSIONS.BALANCE_DEPOSIT) || can(PERMISSIONS.BALANCE_DEPOSIT_ANY)"
                  prepend-icon="ri-qr-code-line"
                  title="إيداع رصيد"
                  class="text-info"
                  @click="handleBalanceOperation(item, 'deposit')"
                />
                <v-list-item
                  v-if="can(PERMISSIONS.BALANCE_WITHDRAW) || can(PERMISSIONS.BALANCE_WITHDRAW_ANY)"
                  prepend-icon="ri-hand-coin-line"
                  title="سحب رصيد"
                  class="text-error"
                  @click="handleBalanceOperation(item, 'withdraw')"
                />
                <v-list-item
                  v-if="can(PERMISSIONS.BALANCE_TRANSFER) || can(PERMISSIONS.BALANCE_TRANSFER_ANY)"
                  prepend-icon="ri-swap-box-line"
                  title="تحويل رصيد"
                  class="text-warning"
                  @click="handleBalanceOperation(item, 'transfer')"
                />

                <v-divider class="my-1" />

                <!-- Role/Permission Actions -->
                <v-list-item
                  v-if="can(PERMISSIONS.USERS_EDIT)"
                  prepend-icon="ri-shield-user-line"
                  title="إدارة الصلاحيات"
                  class="text-purple"
                  @click="openPermissions(item)"
                />
                <v-list-item v-if="can(PERMISSIONS.USERS_EDIT)" prepend-icon="ri-edit-line" title="تعديل البيانات" @click="handleEdit(item)" />
              </template>

              <template #empty>
                <div class="d-flex flex-column align-center justify-center py-12">
                  <v-icon icon="ri-user-search-line" size="64" color="grey-lighten-1" class="mb-4" />
                  <div class="text-h6 text-grey-darken-1">لم يتم العثور على مستخدمين</div>
                  <div class="text-caption text-grey">حاول تغيير فلاتر البحث أو إضافة مستخدم جديد</div>
                  <AppButton v-if="can(PERMISSIONS.USERS_CREATE)" color="primary" variant="tonal" class="mt-6" @click="handleCreate">
                    إضافة أول مستخدم
                  </AppButton>
                </div>
              </template>

              <template #footer-append>
                <div class="px-4 py-2 opacity-60 text-caption">إجمالي المسجلين: {{ totalItems }}</div>
              </template>
            </AppDataTable>
          </v-card>
        </v-col>
      </v-row>

      <!-- User Form Dialog -->
      <AppDialog
        v-model="isOpen"
        :title="isEditMode ? `تعديل بيانات: ${formData.nickname || formData.full_name || ''}` : 'إضافة مستخدم جديد'"
        :subtitle="isEditMode ? 'تحديث المعلومات والمجموعات' : 'إنشاء حساب مستخدم جديد في النظام'"
        :icon="isEditMode ? 'ri-user-edit-line' : 'ri-user-add-line'"
        max-width="800"
        hide-actions
      >
        <UserForm ref="userFormRef" v-model="formData" :is-edit-mode="isEditMode" hide-actions @save="handleSave" @cancel="close" />

        <template #actions>
          <AppButton variant="tonal" color="grey" @click="close">إلغاء</AppButton>
          <AppButton :loading="userFormRef?.loading" color="primary" class="px-8 font-weight-bold rounded-pill shadow-md" @click="handleSubmit">
            <v-icon :icon="userFormRef?.form?.id ? 'ri-user-received-line' : 'ri-save-line'" class="me-2" />
            {{ isEditMode ? 'تحديث البيانات' : userFormRef?.form?.id ? 'ربط الحساب' : 'حفظ المستخدم' }}
          </AppButton>
        </template>
      </AppDialog>

      <!-- Permission Management Dialog -->
      <AppDialog v-model="isPermissionOpen" title="إدارة صلاحيات الوصول" variant="purple" max-width="900" hide-actions fluid :fullscreen="isMobile">
        <template #header>
          <div class="d-flex align-center gap-3 w-100 pa-5 text-white">
            <v-avatar color="white" variant="tonal" size="48">
              <v-icon icon="ri-shield-keyhole-line" color="white" />
            </v-avatar>
            <div class="flex-grow-1">
              <span class="text-h6 font-weight-bold d-block">إدارة صلاحيات الوصول</span>
              <span v-if="permissionUser" class="text-caption opacity-80">{{ permissionUser.full_name }} ({{ permissionUser.username }})</span>
            </div>
            <v-btn icon="ri-close-line" variant="text" color="white" @click="closePermissions" />
          </div>
        </template>

        <v-divider class="border-opacity-10" />

        <div class="pa-6 bg-grey-lighten-4 border-b">
          <AppUserBalanceProfile v-if="permissionUser" :user="permissionUser" mode="horizontal" hide-balance :clickable="false" />
        </div>

        <UserPermissionManager v-if="permissionUser" :user="permissionUser" @save="closePermissions" @cancel="closePermissions" />
      </AppDialog>

      <div class="px-6 pb-6 mt-4">
        <AppConfirmDialog v-model="showConfirm" :message="confirmMessage" @confirm="handleConfirm" @cancel="handleCancel" />
      </div>

      <!-- Balance Operations Dialog -->
      <BalanceOperations v-model="isBalanceOpen" :user="balanceUser" :initial-type="balanceType" @success="onBalanceSuccess" />
    </v-container>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useDisplay } from 'vuetify';
import { usePermissions } from '@/composables/usePermissions';
import { useDataTable } from '@/composables/useDataTable';
import { userService } from '@/api';
import { useUser } from '../composables/useUser';
import UserForm from '../components/UserForm.vue';
import UserPermissionManager from '../components/UserPermissionManager.vue';
import BalanceOperations from '@/modules/financials/components/BalanceOperations.vue';
import { AppDataTable, AppButton, AppDialog, AppConfirmDialog, AppUserBalanceProfile } from '@/components';
import { PERMISSIONS } from '@/config/permissions';
import { useAuthStore } from '@/stores/auth';

const { mobile: isMobile } = useDisplay();
const { can } = usePermissions();
const userStore = useAuthStore();
const userFormRef = ref(null);

// Advanced Filters
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
  isPermissionOpen,
  permissionUser,
  openPermissions,
  closePermissions,
  saveUser,
  handleDelete,
  handleEdit,
  handleCreate,
} = useUser();

// API fetch function
const fetchUsersApi = async params => {
  return await userService.getAll(params, { showToast: false });
};

// DataTable Logic
const {
  items: users,
  loading,
  currentPage: page,
  perPage: itemsPerPage,
  total: totalItems,
  lastPage,
  search: searchText,
  filters,
  sortByVuetify,
  changeSort,
  applyFilters,
  fetchData,
  refresh,
} = useDataTable(fetchUsersApi, {
  syncWithUrl: true,
  initialSortBy: 'created_at',
  initialSortOrder: 'desc',
  immediate: true,
});

const onTableOptionsUpdate = options => {
  changeSort(options);
};

// Computed for company visibility filter
const currentCompanyOnly = computed({
  get: () => !filters.value.global,
  set: val => {
    filters.value.global = !val;
    applyFilters(filters.value);
  },
});

const handleSubmit = () => {
  userFormRef.value?.handleSubmit();
};

const handleSave = async data => {
  await saveUser(data);
  refresh();
  close();
};

const computedHeaders = [
  { title: 'المستخدم', key: 'full_name', sortable: true },
  { title: 'الهاتف', key: 'phone', sortable: false },
  { title: 'الأدوار', key: 'roles', sortable: false },
  { title: 'الحالة', key: 'status', sortable: true },
  { title: 'الإجراءات', key: 'actions', sortable: false, align: 'end' },
];

const getRoleColor = role => {
  const roleName = typeof role === 'object' ? role.name : role;
  const colors = {
    'admin.super': '#EE4B2B',
    'admin.company': '#1A73E8',
    manager: '#00BFA5',
    sales: '#4CAF50',
    stock: '#FB8C00',
    accountant: '#8E24AA',
  };
  return colors[roleName] || '#78909C';
};

// Balance Operations
const isBalanceOpen = ref(false);
const balanceUser = ref(null);
const balanceType = ref('deposit');

const handleBalanceOperation = (user, type) => {
  balanceUser.value = user;
  balanceType.value = type;
  isBalanceOpen.value = true;
};

const onBalanceSuccess = () => {
  refresh();
};
</script>

<style scoped>
.users-page :deep(.v-container) {
  max-width: 100% !important;
}

.gap-3 {
  gap: 12px;
}
</style>
