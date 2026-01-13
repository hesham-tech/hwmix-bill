<template>
  <div class="users-page">
    <!-- Header with Stats -->
    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="3">
        <v-card class="rounded-xl border border-primary-lighten-4 elevation-sm overflow-hidden">
          <div class="pa-4 d-flex align-center gap-4">
            <v-avatar color="primary-lighten-5" rounded="lg" size="48">
              <v-icon icon="ri-team-line" color="primary" />
            </v-avatar>
            <div>
              <div class="text-caption text-grey-darken-1 font-weight-medium">إجمالي المستخدمين</div>
              <div class="text-h5 font-weight-bold primary--text">{{ totalItems || 0 }}</div>
            </div>
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card class="rounded-xl border border-success-lighten-4 elevation-sm overflow-hidden">
          <div class="pa-4 d-flex align-center gap-4">
            <v-avatar color="success-lighten-5" rounded="lg" size="48">
              <v-icon icon="ri-user-follow-line" color="success" />
            </v-avatar>
            <div>
              <div class="text-caption text-grey-darken-1 font-weight-medium">نشطين الآن</div>
              <div class="text-h5 font-weight-bold text-success">{{ activeCount }}</div>
            </div>
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card class="rounded-xl border border-warning-lighten-4 elevation-sm overflow-hidden">
          <div class="pa-4 d-flex align-center gap-4">
            <v-avatar color="warning-lighten-5" rounded="lg" size="48">
              <v-icon icon="ri-admin-line" color="warning" />
            </v-avatar>
            <div>
              <div class="text-caption text-grey-darken-1 font-weight-medium">المدراء</div>
              <div class="text-h5 font-weight-bold text-warning">{{ adminCount }}</div>
            </div>
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card class="rounded-xl border border-error-lighten-4 elevation-sm overflow-hidden">
          <div class="pa-4 d-flex align-center gap-4">
            <v-avatar color="error-lighten-5" rounded="lg" size="48">
              <v-icon icon="ri-user-forbid-line" color="error" />
            </v-avatar>
            <div>
              <div class="text-caption text-grey-darken-1 font-weight-medium">معطلين</div>
              <div class="text-h5 font-weight-bold text-error">{{ inactiveCount }}</div>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Filter Bar -->
    <v-card class="rounded-xl border border-grey-lighten-4 mb-6 elevation-sm overflow-visible">
      <div class="pa-4 d-flex align-center gap-3 flex-wrap">
        <AppInput
          v-model="store.search"
          label="بحث بالمستخدم..."
          prepend-inner-icon="ri-search-line"
          density="compact"
          hide-details
          class="max-width-300 flex-grow-1 flex-sm-grow-0"
          @update:model-value="handleSearch"
        />

        <v-select
          v-model="store.roleFilter"
          :items="roleOptions"
          label="الدور"
          density="compact"
          hide-details
          clearable
          class="max-width-200"
          @update:model-value="handleFiltersChange"
        />

        <v-select
          v-model="store.statusFilter"
          :items="statusOptions"
          label="الحالة"
          density="compact"
          hide-details
          clearable
          class="max-width-200"
          @update:model-value="handleFiltersChange"
        />

        <v-switch
          v-if="userStore.isAdmin || can('users.view_all')"
          v-model="store.isGlobalMode"
          label="عرض عالمي"
          color="primary"
          hide-details
          inset
          density="compact"
          class="ml-4"
          @update:model-value="handleFiltersChange"
        />

        <v-spacer />

        <AppButton
          v-if="can('users.create')"
          color="primary"
          prepend-icon="ri-user-add-line"
          class="font-weight-bold rounded-pill"
          @click="handleCreate"
        >
          مستخدم جديد
        </AppButton>
      </div>
    </v-card>

    <AppInfiniteScroll
      :loading="loading && users?.length > 0"
      :has-more="(users?.length || 0) < (totalItems || 0)"
      no-more-text="لا يوجد المزيد من المستخدمين"
      @load="handleLoadMore"
    >
      <AppDataTable
        v-model:page="store.page"
        v-model:items-per-page="store.itemsPerPage"
        v-model:sort-by="store.sortBy"
        :headers="headers"
        :items="users || []"
        :total-items="totalItems || 0"
        :loading="loading"
        hide-pagination
        permission-module="users"
        @update:options="onTableOptionsUpdate"
        @edit="handleEdit"
        @delete="handleDelete"
      >
        <template #item.full_name="{ item }">
          <div class="d-flex align-center py-2">
            <AppAvatar :img-url="item.avatar_url" :name="item.nickname || item.full_name" size="45" class="me-3 border shadow-sm" />
            <div class="d-flex flex-column">
              <span class="font-weight-bold text-body-1">{{ item.nickname || item.full_name }}</span>
              <span class="text-caption text-grey d-flex align-center gap-1">
                <v-icon icon="ri-mail-line" size="12" />
                {{ item.email || 'لا يوجد بريد' }}
              </span>
            </div>
          </div>
        </template>

        <template #item.phone="{ item }">
          <div v-if="item.phone" class="d-flex align-center gap-1 text-body-2">
            <v-icon icon="ri-phone-line" size="14" color="primary" />
            <span class="text-ltr">{{ item.phone }}</span>
          </div>
          <span v-else class="text-caption text-grey italic">لا يوجد</span>
        </template>

        <template #item.roles="{ item }">
          <div class="d-flex flex-wrap gap-1">
            <v-chip
              v-for="role in item.roles"
              :key="role"
              size="x-small"
              variant="flat"
              color="secondary-lighten-5"
              class="text-secondary font-weight-bold px-2 rounded"
            >
              {{ role }}
            </v-chip>
            <span v-if="!item.roles?.length" class="text-caption text-grey italic">موظف</span>
          </div>
        </template>

        <template #item.status="{ item }">
          <v-chip
            :color="item.status === 'active' || item.status === 1 ? 'success' : 'error'"
            size="x-small"
            variant="flat"
            class="font-weight-bold px-2"
          >
            {{ item.status === 'active' || item.status === 1 ? 'نشط' : 'معطل' }}
          </v-chip>
        </template>

        <template #extra-actions="{ item }">
          <v-btn
            v-if="can('roles.page')"
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
      <ConfirmDialog v-model="showConfirm" :message="confirmMessage" @confirm="handleConfirm" @cancel="handleCancel" />
    </div>

    <!-- User Form Dialog -->
    <AppDialog
      v-model="isOpen"
      :title="isEditMode ? 'تعديل بيانات المستخدم' : 'إضافة مستخدم جديد'"
      :icon="isEditMode ? 'ri-user-edit-line' : 'ri-user-add-line'"
      max-width="800"
      hide-actions
    >
      <UserForm v-model="formData" :is-edit-mode="isEditMode" @save="handleSave" @cancel="close" />
    </AppDialog>

    <!-- Permission Management Dialog -->
    <v-dialog v-model="isPermissionOpen" max-width="900" scrollable transition="dialog-bottom-transition">
      <UserPermissionManager v-if="isPermissionOpen" :user="permissionUser" @save="onPermissionSaved" @cancel="closePermissions" />
    </v-dialog>
  </div>
</template>

<script setup>
import { onMounted, watch, computed } from 'vue';
import { useUserStore as useGlobalUserStore } from '@/stores/user';
import { useUserStore } from '../store/user.store';
import { usePermissions } from '@/composables/usePermissions';
import { useUser } from '../composables/useUser';
import UserForm from '../components/UserForm.vue';
import UserPermissionManager from '../components/UserPermissionManager.vue';
import AppDataTable from '@/components/common/AppDataTable.vue';
import AppButton from '@/components/common/AppButton.vue';
import AppDialog from '@/components/common/AppDialog.vue';
import AppInfiniteScroll from '@/components/common/AppInfiniteScroll.vue';
import ConfirmDialog from '@/components/common/ConfirmDialog.vue';
import { getInitials } from '@/utils/helpers';

const { can } = usePermissions();
const store = useUserStore();
const userStore = useGlobalUserStore();
const {
  users,
  loading,
  totalItems,
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
  loadUsers,
  loadMore,
  saveUser,
  handleDelete,
  handleEdit,
  handleCreate,
} = useUser();

const handleSave = async data => {
  await saveUser(data);
  close();
};

const onPermissionSaved = async () => {
  closePermissions();
  await loadUsers();
};

const handleLoadMore = () => {
  if (loading.value || !users.value || users.value.length >= (totalItems.value || 0)) return;
  loadMore();
};

const headers = [
  { title: 'المستخدم', key: 'full_name', sortable: true },
  { title: 'الهاتف', key: 'phone', sortable: true },
  { title: 'الأدوار', key: 'roles', sortable: false },
  { title: 'الحالة', key: 'status', sortable: true },
  { title: 'تاريخ الإضافة', key: 'created_at', sortable: true },
  { title: 'الإجراءات', key: 'actions', sortable: false, align: 'end' },
];

const roleOptions = [
  { title: 'الكل', value: null },
  { title: 'مدير عام', value: 'admin.super' },
  { title: 'مدير شركة', value: 'admin.company' },
  { title: 'موظف', value: 'employee' },
];

const statusOptions = [
  { title: 'الكل', value: null },
  { title: 'نشط', value: 'active' },
  { title: 'معطل', value: 'inactive' },
];

// Statistics counters
const activeCount = computed(() => store.stats?.active || 0);
const adminCount = computed(() => store.stats?.admins || 0);
const inactiveCount = computed(() => store.stats?.inactive || 0);

const handleFiltersChange = () => {
  store.page = 1;
  loadUsers();
};

const handleSearch = () => {
  store.page = 1;
  loadUsers();
};

const onTableOptionsUpdate = options => {
  if (JSON.stringify(store.sortBy) !== JSON.stringify(options.sortBy)) {
    store.sortBy = options.sortBy;
    loadUsers();
  }
};

const handleManagePermissions = user => {
  openPermissions(user);
};

onMounted(() => {
  store.page = 1;
  loadUsers(false);
  store.fetchStats();
});

// Watch search to reset page
watch(
  () => store.search,
  () => {
    store.page = 1;
    loadUsers(false);
  }
);

// Watch itemsPerPage to reset page
watch(
  () => store.itemsPerPage,
  () => {
    store.page = 1;
    loadUsers(false);
  }
);
</script>

<style scoped></style>
