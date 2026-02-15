<template>
  <div class="users-page">
    <!-- Removed redundant AppPageHeader -->

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
                bodyKeys: ['roles', 'status', 'created_at'],
              }"
              infinite-scroll
              :has-more="(users?.length || 0) < (totalItems || 0)"
              permission-module="users"
              title="جدول المستخدمين"
              subtitle="إدارة بيانات الفريق والعملاء مع ميزات البحث المتقدم"
              icon="ri-group-line"
              @update:filters="applyFilters"
              @update:options="onTableOptionsUpdate"
              @edit="handleEdit"
              @delete="handleDelete"
              @view="item => $router.push(`/app/users/${item.id}`)"
              @update:search="debouncedSearch"
              @load="handleLoadMore"
            >
              <!-- Actions Slot for Consolidated Controls -->
              <template #actions>
                <div class="d-flex align-center gap-2">
                  <!-- Mode Switch: Current Company vs Global -->
                  <!-- Mode Switch: Current Company vs Global -->
                  <div
                    v-if="userStore.permissions.includes(PERMISSIONS.ADMIN_SUPER)"
                    class="d-inline-flex bg-grey-lighten-4 rounded-pill pa-1 border shadow-inner align-center ga-1"
                    style="height: 40px"
                  >
                    <v-btn
                      size="small"
                      :variant="currentCompanyOnly ? 'flat' : 'text'"
                      :color="currentCompanyOnly ? 'primary' : 'transparent'"
                      class="rounded-pill px-4 font-weight-bold transition-all"
                      :class="{ 'text-grey-darken-1': !currentCompanyOnly }"
                      @click="currentCompanyOnly = true"
                    >
                      <v-icon icon="ri-building-line" start size="16" />
                      الشركة
                    </v-btn>
                    <v-btn
                      size="small"
                      :variant="!currentCompanyOnly ? 'flat' : 'text'"
                      :color="!currentCompanyOnly ? 'warning' : 'transparent'"
                      class="rounded-pill px-4 font-weight-bold transition-all"
                      :class="{ 'text-grey-darken-1': currentCompanyOnly }"
                      @click="currentCompanyOnly = false"
                    >
                      <v-icon icon="ri-global-line" start size="16" />
                      الكل
                    </v-btn>
                  </div>

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

              <!-- Existing Templates -->
              <template #item.full_name="{ item }">
                <AppUserBalanceProfile :user="item" @click="$router.push(`/app/users/${item.id}`)" />
              </template>

              <template #item.roles="{ item }">
                <div class="d-flex flex-wrap gap-1">
                  <template v-if="item.roles?.length">
                    <v-chip
                      v-for="role in item.roles"
                      :key="typeof role === 'object' ? role.id : role"
                      size="x-small"
                      variant="tonal"
                      :color="getRoleColor(role)"
                      class="font-weight-bold px-2 rounded"
                    >
                      {{ typeof role === 'object' ? role.label || role.name : role }}
                    </v-chip>
                  </template>
                  <span v-else class="text-caption text-grey italic">عميل</span>
                  <div v-if="item.company_name" class="text-xxs text-grey mt-1 w-100 italic d-flex align-center gap-1">
                    <v-icon icon="ri-building-line" size="10" color="primary" />
                    {{ item.company_name }}
                  </div>
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

              <template #extra-actions="{ item, inMenu }">
                <!-- Record Payment Action -->
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

                <!-- Permission Management Action -->
                <v-list-item
                  v-if="inMenu && can(PERMISSIONS.ROLES_PAGE)"
                  prepend-icon="ri-shield-user-line"
                  title="إدارة الصلاحيات"
                  class="text-warning"
                  @click="handleManagePermissions(item)"
                />
                <AppButton
                  v-else-if="can(PERMISSIONS.ROLES_PAGE)"
                  icon="ri-shield-user-line"
                  size="small"
                  variant="text"
                  color="warning"
                  tooltip="إدارة الصلاحيات"
                  @click="handleManagePermissions(item)"
                />
              </template>
            </AppDataTable>
          </v-card>

          <div class="px-6 pb-6 mt-4">
            <AppConfirmDialog v-model="showConfirm" :message="confirmMessage" @confirm="handleConfirm" @cancel="handleCancel" />
          </div>
        </v-col>
      </v-row>

      <!-- User Form Dialog -->
      <AppDialog
        v-model="isOpen"
        :title="isEditMode ? `تعديل بيانات: ${formData.nickname || formData.full_name || ''}` : 'إضافة مستخدم جديد'"
        :subtitle="isEditMode ? 'تحديث المعلومات الأساسية وصلاحيات الوصول' : 'إنشاء حساب مستخدم جديد وتحديد صلاحياته'"
        :icon="isEditMode ? 'ri-user-edit-line' : 'ri-user-add-line'"
        max-width="800"
        hide-actions
      >
        <UserForm ref="userFormRef" v-model="formData" :is-edit-mode="isEditMode" hide-actions @save="handleSave" @cancel="close" />

        <template #actions>
          <AppButton variant="tonal" color="grey" @click="close">إلغاء</AppButton>
          <AppButton
            :loading="userFormRef?.loading"
            color="primary"
            class="px-8 font-weight-bold rounded-pill shadow-md"
            @click="userFormRef?.handleSubmit()"
          >
            <v-icon :icon="userFormRef?.form?.id ? 'ri-user-received-line' : 'ri-save-line'" class="me-2" />
            {{ isEditMode ? 'تحديث البيانات' : userFormRef?.form?.id ? 'ربط الحساب' : 'إنشاء المستخدم' }}
          </AppButton>
        </template>
      </AppDialog>

      <!-- Permission Management Dialog -->
      <AppDialog v-model="isPermissionOpen" title="إدارة صلاحيات الوصول" variant="purple" max-width="900" hide-actions fluid :fullscreen="isMobile">
        <template #header>
          <header class="dialog-premium-header variant-purple pa-5 d-flex align-center justify-space-between text-white">
            <div class="d-flex align-center gap-4">
              <AppUserBalanceProfile :user="permissionUser" mode="horizontal" hide-balance :clickable="false" />
              <div class="header-text">
                <span class="text-h6 font-weight-bold d-block title-text">إدارة صلاحيات الوصول</span>
                <div class="d-flex align-center gap-2">
                  <v-icon icon="ri-user-smile-line" size="14" color="white" class="opacity-80" />
                  <span class="text-caption text-white opacity-90 font-weight-medium">
                    {{ permissionUser?.nickname || permissionUser?.full_name || permissionUser?.username }}
                  </span>
                </div>
              </div>
            </div>
            <v-btn icon="ri-close-line" variant="tonal" color="white" class="close-btn-hover" @click="closePermissions" />
          </header>
        </template>
        <UserPermissionManager v-if="isPermissionOpen" :user="permissionUser" @save="onPermissionSaved" @cancel="closePermissions" />
      </AppDialog>
    </v-container>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { useDisplay } from 'vuetify';
import { useUserStore as useGlobalUserStore } from '@/stores/user';
import { useUserStore } from '../store/user.store';
import { usePermissions } from '@/composables/usePermissions';
import { useDataTable } from '@/composables/useDataTable';
import { userService } from '@/api';
import { useUser } from '../composables/useUser';
import UserForm from '../components/UserForm.vue';
import UserPermissionManager from '../components/UserPermissionManager.vue';
import { AppDataTable, AppButton, AppDialog, AppInfiniteScroll, AppConfirmDialog, AppSwitch, AppUserBalanceProfile } from '@/components';
import { PERMISSIONS } from '@/config/permissions';

const { can, canAny } = usePermissions();
const { smAndDown: isMobile } = useDisplay();
const store = useUserStore();
const userStore = useGlobalUserStore();
const userFormRef = ref(null);

// Advanced Filters Definition
const advancedFilters = [
  {
    key: 'role',
    title: 'الدور',
    type: 'select',
    items: [
      { title: 'مدير عام', value: 'admin.super' },
      { title: 'مدير شركة', value: 'admin.company' },
      { title: 'مدير', value: 'manager' },
      { title: 'موظف مبيعات', value: 'sales' },
      { title: 'أمين مخزن', value: 'stock' },
      { title: 'محاسب', value: 'accountant' },
      { title: 'عميل', value: 'customer' },
    ],
  },
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

// API fetch function for useDataTable
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
  sortBy,
  sortByVuetify,
  changePage,
  changeSort,
  applyFilters,
  fetchData,
} = useDataTable(fetchUsersApi, {
  syncWithUrl: true,
  initialSortBy: 'created_at',
  initialSortOrder: 'desc',
  immediate: true,
});

const currentCompanyOnly = computed({
  get: () => !filters.value.global,
  set: val => {
    filters.value.global = !val;
    applyFilters(filters.value);
  },
});

const handleLoadMore = () => {
  if (loading.value || users.value.length >= totalItems.value || page.value >= (lastPage.value || Infinity)) return;
  page.value++;
  fetchData({ append: true });
};

const onTableOptionsUpdate = options => {
  changeSort(options);
};

const handleSave = async data => {
  await saveUser(data);
  fetchData();
  close();
};

const onPermissionSaved = async () => {
  closePermissions();
  fetchData();
};

const headers = computed(() => {
  const base = [
    { title: 'بيانات العميل ورصيده', key: 'full_name', sortable: true },
    { title: 'الأدوار', key: 'roles', sortable: false },
  ];

  base.push({ title: 'الحالة', key: 'status', sortable: true });
  base.push({ title: 'تاريخ الإضافة', key: 'created_at', sortable: true });
  base.push({ title: 'الإجراءات', key: 'actions', sortable: false, align: 'end' });

  return base;
});

// Statistics counters (synced with global filters)
const activeCount = computed(() => store.stats?.active || 0);
const adminCount = computed(() => store.stats?.admins || 0);
const inactiveCount = computed(() => store.stats?.inactive || 0);

const handleManagePermissions = user => {
  openPermissions(user);
};

const getRoleColor = role => {
  const roleName = typeof role === 'object' ? role.name : role;
  const colors = {
    'admin.super': '#EE4B2B', // Vivid Red
    'admin.company': '#1A73E8', // Google Blue
    manager: '#00BFA5', // Teal
    sales: '#4CAF50', // Green
    stock: '#FB8C00', // Orange
    accountant: '#8E24AA', // Purple
  };
  return colors[roleName] || '#78909C';
};

// Update stats when global filter changes
watch(
  () => filters.value.global,
  newVal => {
    store.fetchStats({ global: newVal });
  }
);

onMounted(() => {
  store.fetchStats({ global: filters.value.global });
});

// Debounce search
let searchTimeout;
const debouncedSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    applyFilters();
  }, 500);
};
</script>

<style scoped>
.users-page :deep(.v-container) {
  max-width: 100% !important;
}

.hover-underline:hover {
  text-decoration: underline;
}
</style>
