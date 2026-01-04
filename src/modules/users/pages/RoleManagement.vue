<template>
  <div class="role-management">
    <AppCard title="إدارة الأدوار والصلاحيات" icon="ri-shield-star-line">
      <v-row>
        <!-- User Selection -->
        <v-col cols="12" md="4">
          <v-autocomplete
            v-model="selectedUserId"
            :items="users"
            item-title="name"
            item-value="id"
            label="اختر المستخدم"
            prepend-inner-icon="ri-user-line"
            @update:model-value="loadUserPermissions"
          />
        </v-col>

        <!-- Role Assignment -->
        <v-col v-if="selectedUserId" cols="12" md="8">
          <v-select
            v-model="selectedRole"
            :items="roles"
            item-title="name"
            item-value="id"
            label="تعيين دور"
            prepend-inner-icon="ri-shield-user-line"
          >
            <template #append>
              <v-btn color="primary" :loading="loading" @click="handleAssignRole"> تعيين </v-btn>
            </template>
          </v-select>
        </v-col>
      </v-row>

      <v-divider v-if="selectedUserId" class="my-6" />

      <!-- Permissions Grid -->
      <div v-if="selectedUserId">
        <h3 class="text-h6 mb-4">الصلاحيات</h3>

        <AppSkeleton v-if="loadingPermissions" type="list" />

        <div v-else>
          <v-row>
            <v-col v-for="group in permissionGroups" :key="group.name" cols="12" md="6">
              <FormSection :title="group.label">
                <v-checkbox
                  v-for="permission in group.permissions"
                  :key="permission.value"
                  v-model="selectedPermissions"
                  :label="permission.label"
                  :value="permission.value"
                  density="compact"
                  hide-details
                />
              </FormSection>
            </v-col>
          </v-row>

          <v-btn class="mt-4" color="success" :loading="loading" @click="handleSavePermissions"> حفظ الصلاحيات </v-btn>
        </div>
      </div>

      <EmptyState v-else icon="ri-user-settings-line" title="اختر مستخدم" message="قم باختيار مستخدم لعرض وتعديل صلاحياته" />
    </AppCard>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { AppCard, AppSkeleton, EmptyState, FormSection } from '@/components';
import { useUser } from '../composables/useUser';
import { toast } from 'vue3-toastify';
import { PERMISSIONS } from '@/utils/constants';

const { users, loadUsers, assignRole, updatePermissions } = useUser();

const selectedUserId = ref(null);
const selectedRole = ref(null);
const selectedPermissions = ref([]);
const loading = ref(false);
const loadingPermissions = ref(false);

const roles = ref([
  { id: 1, name: 'مدير عام' },
  { id: 2, name: 'مدير شركة' },
  { id: 3, name: 'موظف' },
  { id: 4, name: 'عميل' },
]);

const permissionGroups = ref([
  {
    name: 'invoices',
    label: 'الفواتير',
    permissions: [
      { value: PERMISSIONS.INVOICES_VIEW, label: 'عرض' },
      { value: PERMISSIONS.INVOICES_CREATE, label: 'إنشاء' },
      { value: PERMISSIONS.INVOICES_UPDATE, label: 'تعديل' },
      { value: PERMISSIONS.INVOICES_DELETE, label: 'حذف' },
    ],
  },
  {
    name: 'products',
    label: 'المنتجات',
    permissions: [
      { value: PERMISSIONS.PRODUCTS_VIEW, label: 'عرض' },
      { value: PERMISSIONS.PRODUCTS_CREATE, label: 'إنشاء' },
      { value: PERMISSIONS.PRODUCTS_UPDATE, label: 'تعديل' },
      { value: PERMISSIONS.PRODUCTS_DELETE, label: 'حذف' },
    ],
  },
  {
    name: 'payments',
    label: 'المدفوعات',
    permissions: [
      { value: PERMISSIONS.PAYMENTS_VIEW, label: 'عرض' },
      { value: PERMISSIONS.PAYMENTS_CREATE, label: 'إنشاء' },
      { value: PERMISSIONS.PAYMENTS_UPDATE, label: 'تعديل' },
      { value: PERMISSIONS.PAYMENTS_DELETE, label: 'حذف' },
    ],
  },
  {
    name: 'users',
    label: 'المستخدمين',
    permissions: [
      { value: PERMISSIONS.USERS_VIEW, label: 'عرض' },
      { value: PERMISSIONS.USERS_CREATE, label: 'إنشاء' },
      { value: PERMISSIONS.USERS_UPDATE, label: 'تعديل' },
      { value: PERMISSIONS.USERS_DELETE, label: 'حذف' },
    ],
  },
  {
    name: 'reports',
    label: 'التقارير',
    permissions: [{ value: PERMISSIONS.REPORTS_VIEW, label: 'عرض التقارير' }],
  },
]);

const loadUserPermissions = async userId => {
  if (!userId) {
    selectedPermissions.value = [];
    return;
  }

  loadingPermissions.value = true;
  try {
    // TODO: Load actual user permissions from API
    // const response = await userService.getPermissions(userId)
    // selectedPermissions.value = response.data
    selectedPermissions.value = [];
  } catch (error) {
    console.error('Error loading permissions:', error);
  } finally {
    loadingPermissions.value = false;
  }
};

const handleAssignRole = async () => {
  if (!selectedUserId.value || !selectedRole.value) return;

  loading.value = true;
  try {
    await assignRole(selectedUserId.value, selectedRole.value);
    toast.success('تم تعيين الدور بنجاح');
  } catch (error) {
    console.error('Error assigning role:', error);
  } finally {
    loading.value = false;
  }
};

const handleSavePermissions = async () => {
  if (!selectedUserId.value) return;

  loading.value = true;
  try {
    await updatePermissions(selectedUserId.value, selectedPermissions.value);
  } catch (error) {
    console.error('Error saving permissions:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadUsers();
});
</script>

<style scoped>
.role-management {
  padding: 1rem;
}
</style>
