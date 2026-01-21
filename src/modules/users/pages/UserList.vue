<template>
  <div class="users-page">
    <AppPageHeader title="إدارة المستخدمين" subtitle="إدارة أعضاء الفريق، الصلاحيات، وحسابات العملاء" icon="ri-group-line">
      <template #append>
        <AppButton
          v-if="can(PERMISSIONS.USERS_CREATE)"
          color="primary"
          prepend-icon="ri-user-add-line"
          size="large"
          class="font-weight-bold rounded-pill shadow-sm"
          @click="handleCreate"
        >
          مستخدم جديد
        </AppButton>
      </template>

      <template #controls>
        <v-col cols="12" md="8">
          <AppInput
            v-model="search"
            placeholder="بحث سريح بالاسم، الهاتف، أو البريد..."
            prepend-inner-icon="ri-search-line"
            clearable
            hide-details
            variant="solo-filled"
            density="comfortable"
            flat
            class="rounded-lg px-0"
            @update:model-value="debouncedSearch"
          />
        </v-col>
        <v-col cols="12" md="4" class="text-end">
          <AppButton
            variant="tonal"
            color="primary"
            prepend-icon="ri-equalizer-line"
            class="rounded-lg font-weight-bold"
            @click="showAdvanced = !showAdvanced"
          >
            {{ showAdvanced ? 'إخفاء البحث المتقدم' : 'بحث متقدم' }}
          </AppButton>
        </v-col>
      </template>
    </AppPageHeader>

    <v-container fluid class="pt-0">
      <!-- Statistics Row (Simplified & Modern) -->
      <v-row class="mb-4">
        <v-col cols="6" sm="6" md="3">
          <div class="pa-4 d-flex align-center gap-3 rounded-xl border bg-white shadow-sm">
            <v-avatar color="primary-lighten-5" rounded="lg" size="42">
              <v-icon icon="ri-team-line" color="primary" size="20" />
            </v-avatar>
            <div class="overflow-hidden">
              <div class="text-caption text-grey-darken-1 font-weight-medium text-truncate">إجمالي المستخدمين</div>
              <div class="text-h6 font-weight-bold">{{ totalItems || 0 }}</div>
            </div>
          </div>
        </v-col>
        <v-col cols="6" sm="6" md="3">
          <div class="pa-4 d-flex align-center gap-3 rounded-xl border bg-white shadow-sm">
            <v-avatar color="success-lighten-5" rounded="lg" size="42">
              <v-icon icon="ri-user-follow-line" color="success" size="20" />
            </v-avatar>
            <div class="overflow-hidden">
              <div class="text-caption text-grey-darken-1 font-weight-medium text-truncate">نشطين الآن</div>
              <div class="text-h6 font-weight-bold text-success">{{ activeCount }}</div>
            </div>
          </div>
        </v-col>
        <v-col cols="6" sm="6" md="3">
          <div class="pa-4 d-flex align-center gap-3 rounded-xl border bg-white shadow-sm">
            <v-avatar color="warning-lighten-5" rounded="lg" size="42">
              <v-icon icon="ri-admin-line" color="warning" size="20" />
            </v-avatar>
            <div class="overflow-hidden">
              <div class="text-caption text-grey-darken-1 font-weight-medium text-truncate">المدراء</div>
              <div class="text-h6 font-weight-bold text-warning">{{ adminCount }}</div>
            </div>
          </div>
        </v-col>
        <v-col cols="6" sm="6" md="3">
          <div class="pa-4 d-flex align-center gap-3 rounded-xl border bg-white shadow-sm">
            <v-avatar color="error-lighten-5" rounded="lg" size="42">
              <v-icon icon="ri-user-forbid-line" color="error" size="20" />
            </v-avatar>
            <div class="overflow-hidden">
              <div class="text-caption text-grey-darken-1 font-weight-medium text-truncate">معطلين</div>
              <div class="text-h6 font-weight-bold text-error">{{ inactiveCount }}</div>
            </div>
          </div>
        </v-col>
      </v-row>

      <!-- Advanced Filters -->
      <v-expand-transition>
        <div v-if="showAdvanced" class="mb-6">
          <UserFilters v-model="filters" @apply="handleFiltersChange" />
        </div>
      </v-expand-transition>

      <!-- Global Mode Switch (Moved here) -->
      <div v-if="userStore.isAdmin || can(PERMISSIONS.USERS_VIEW_ALL)" class="d-flex align-center justify-end mb-4 px-2">
        <v-card variant="tonal" color="primary" class="rounded-pill px-4 py-1 border-primary">
          <div class="d-flex align-center gap-2">
            <v-icon icon="ri-global-line" size="18" />
            <span class="text-caption font-weight-bold">عرض كافة الشركات</span>
            <AppSwitch
              v-model="filters.global"
              color="primary"
              hide-details
              inset
              density="compact"
              class="ms-2"
              @update:model-value="applyFilters(filters)"
            />
          </div>
        </v-card>
      </div>

      <AppInfiniteScroll
        :loading="loading && users?.length > 0"
        :has-more="(users?.length || 0) < (totalItems || 0)"
        no-more-text="لا يوجد المزيد من المستخدمين"
        @load="handleLoadMore"
      >
        <AppDataTable
          v-model:page="page"
          v-model:items-per-page="itemsPerPage"
          v-model:sort-by="sortByVuetify"
          :headers="headers"
          :items="users || []"
          :total-items="totalItems || 0"
          :loading="loading"
          hide-pagination
          permission-module="users"
          @update:options="onTableOptionsUpdate"
          @edit="handleEdit"
          @delete="handleDelete"
          @view="item => $router.push(`/users/${item.id}`)"
        >
          <template #item.full_name="{ item }">
            <div class="d-flex align-center py-2">
              <AppAvatar :img-url="item.avatar_url" :name="item.nickname || item.full_name" size="45" class="me-3 border shadow-sm" />
              <div class="d-flex flex-column">
                <span class="font-weight-bold text-body-1 text-primary cursor-pointer hover-underline" @click="$router.push(`/users/${item.id}`)">
                  {{ item.nickname || item.full_name }}
                </span>
                <span class="text-caption text-grey d-flex align-center gap-1">
                  <v-icon icon="ri-mail-line" size="12" />
                  {{ item.email || 'لا يوجد بريد' }}
                </span>
              </div>
            </div>
          </template>

          <template #item.phone="{ item }">
            <AppPhone :phone="item.phone" />
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

          <template #item.balance="{ item }">
            <div :class="['font-weight-bold text-end', item.balance < 0 ? 'text-error' : 'text-success']">
              {{ formatCurrency(item.balance) }}
            </div>
          </template>

          <template #extra-actions="{ item, inMenu }">
            <!-- Use v-list-item in context menu for perfect alignment -->
            <v-list-item
              v-if="inMenu && can(PERMISSIONS.ROLES_PAGE)"
              prepend-icon="ri-shield-user-line"
              title="إدارة الصلاحيات"
              class="text-warning"
              @click="handleManagePermissions(item)"
            />
            <!-- Use AppButton in table for icon-only display -->
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
      </AppInfiniteScroll>

      <div class="px-6 pb-6">
        <AppConfirmDialog v-model="showConfirm" :message="confirmMessage" @confirm="handleConfirm" @cancel="handleCancel" />
      </div>

      <!-- User Form Dialog -->
      <AppDialog
        v-model="isOpen"
        :title="isEditMode ? 'تعديل بيانات المستخدم' : 'إضافة مستخدم جديد'"
        :icon="isEditMode ? 'ri-user-edit-line' : 'ri-user-add-line'"
        max-width="800"
        hide-actions
      >
        <UserForm ref="userFormRef" v-model="formData" :is-edit-mode="isEditMode" hide-actions @save="handleSave" @cancel="close" />

        <template #actions>
          <AppButton variant="tonal" color="grey" @click="close">إلغاء</AppButton>
          <AppButton :loading="userFormRef?.loading" color="primary" class="px-8 font-weight-bold rounded-pill" @click="userFormRef?.handleSubmit()">
            <v-icon :icon="userFormRef?.form?.id ? 'ri-user-received-line' : 'ri-save-line'" class="me-2" />
            {{ isEditMode ? 'تحديث البيانات' : userFormRef?.form?.id ? 'ربط الحساب' : 'إنشاء المستخدم' }}
          </AppButton>
        </template>
      </AppDialog>

      <!-- Permission Management Dialog -->
      <AppDialog v-model="isPermissionOpen" title="إدارة الصلاحيات" icon="ri-shield-user-line" max-width="900" hide-actions>
        <UserPermissionManager v-if="isPermissionOpen" :user="permissionUser" @save="onPermissionSaved" @cancel="closePermissions" />
      </AppDialog>
    </v-container>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { useUserStore as useGlobalUserStore } from '@/stores/user';
import { useUserStore } from '../store/user.store';
import { usePermissions } from '@/composables/usePermissions';
import { useDataTable } from '@/composables/useDataTable';
import { userService } from '@/api';
import { useUser } from '../composables/useUser';
import UserForm from '../components/UserForm.vue';
import UserFilters from '../components/UserFilters.vue';
import UserPermissionManager from '../components/UserPermissionManager.vue';
import AppDataTable from '@/components/common/AppDataTable.vue';
import AppButton from '@/components/common/AppButton.vue';
import AppDialog from '@/components/common/AppDialog.vue';
import AppInfiniteScroll from '@/components/common/AppInfiniteScroll.vue';
import AppConfirmDialog from '@/components/common/AppConfirmDialog.vue';
import AppSwitch from '@/components/common/AppSwitch.vue';
import { PERMISSIONS } from '@/config/permissions';
import { getInitials } from '@/utils/helpers';
import { formatCurrency } from '@/utils/formatters';

const { can } = usePermissions();
const store = useUserStore();
const userStore = useGlobalUserStore();
const userFormRef = ref(null);
const showAdvanced = ref(false);

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
  search,
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
  immediate: false,
});

const handleLoadMore = () => {
  if (loading.value || users.value.length >= totalItems.value) return;
  page.value++;
  fetchData({ append: true });
};

const onTableOptionsUpdate = options => {
  changeSort(options);
};

const handleFiltersChange = newFilters => {
  applyFilters(newFilters);
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
    { title: 'المستخدم', key: 'full_name', sortable: true },
    { title: 'الهاتف', key: 'phone', sortable: true },
    { title: 'الأدوار', key: 'roles', sortable: false },
  ];

  if (can(PERMISSIONS.USERS_VIEW_ALL)) {
    base.push({ title: 'الرصيد', key: 'balance', sortable: true, align: 'end' });
  }

  base.push({ title: 'الحالة', key: 'status', sortable: true });
  base.push({ title: 'تاريخ الإضافة', key: 'created_at', sortable: true });
  base.push({ title: 'الإجراءات', key: 'actions', sortable: false, align: 'end' });

  return base;
});

// Statistics counters
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

onMounted(() => {
  store.fetchStats();
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
.hover-underline:hover {
  text-decoration: underline;
}
</style>
