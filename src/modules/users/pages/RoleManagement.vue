<template>
  <div class="role-management-page">
    <div class="mb-6 px-6 pt-6">
      <h1 class="text-h4 font-weight-bold">إدارة الأدوار والصلاحيات</h1>
      <p class="text-body-1 text-grey">تحكم دقيق في مستويات الوصول والعمليات المتاحة لكل موظف</p>
    </div>

    <v-row>
      <!-- Users List -->
      <v-col cols="12" md="4">
        <AppCard title="المستخدمين النشطين" icon="ri-team-line" class="fill-height">
          <template #actions>
            <AppInput
              v-model="search"
              placeholder="بحث بالاسم أو البريد..."
              density="compact"
              hide-details
              prepend-inner-icon="ri-search-line"
              class="max-width-200"
            />
          </template>

          <v-list v-if="!loadingUsers" lines="two" class="pa-0">
            <v-list-item
              v-for="user in filteredUsers"
              :key="user.id"
              :active="selectedUserId === user.id"
              class="border-b"
              @click="selectUser(user)"
              active-color="primary"
            >
              <template #prepend>
                <v-avatar color="primary-lighten-5" size="40">
                  <span class="text-primary font-weight-bold text-caption">{{ getInitials(user.name) }}</span>
                </v-avatar>
              </template>
              <v-list-item-title class="font-weight-bold">{{ user.name }}</v-list-item-title>
              <v-list-item-subtitle class="text-caption">{{ user.email }}</v-list-item-subtitle>
              <template #append>
                <v-chip size="x-small" variant="flat" color="grey-lighten-4" class="font-weight-black">
                  {{ user.roles?.[0]?.name || 'بدون دور' }}
                </v-chip>
              </template>
            </v-list-item>
          </v-list>
          <div v-else class="pa-10 text-center">
            <v-progress-circular indeterminate color="primary" />
          </div>
        </AppCard>
      </v-col>

      <!-- Permissions Management -->
      <v-col cols="12" md="8">
        <AppCard v-if="selectedUserId" :title="`صلاحيات: ${selectedUser?.name}`" icon="ri-shield-keyhole-line">
          <template #actions>
            <AppButton color="success" :loading="saving" prepend-icon="ri-save-line" @click="savePermissions"> حفظ التغييرات </AppButton>
          </template>

          <v-tabs v-model="activeTab" color="primary" align-tabs="start" class="border-b">
            <v-tab value="roles" class="text-none">
              <v-icon icon="ri-admin-line" class="me-2" />
              الأدوار الوظيفية
            </v-tab>
            <v-tab value="permissions" class="text-none">
              <v-icon icon="ri-list-settings-line" class="me-2" />
              قواعد الوصول التفصيلية
            </v-tab>
          </v-tabs>

          <v-window v-model="activeTab" class="pa-6">
            <!-- Roles Tab -->
            <v-window-item value="roles">
              <div class="text-subtitle-1 font-weight-bold mb-4">اختر الدور الوظيفي الرئيسي للمستخدم:</div>
              <v-radio-group v-model="userRole">
                <v-row>
                  <v-col v-for="role in allRoles" :key="role.id" cols="12" sm="6">
                    <v-card
                      border
                      flat
                      class="pa-4 clickable h-100"
                      :class="{ 'border-primary bg-primary-lighten-5': userRole === role.name }"
                      @click="userRole = role.name"
                    >
                      <v-radio :value="role.name" color="primary">
                        <template #label>
                          <div class="ms-2">
                            <div class="font-weight-black text-body-1">{{ role.label }}</div>
                            <div class="text-caption text-grey-darken-1">{{ role.description }}</div>
                          </div>
                        </template>
                      </v-radio>
                    </v-card>
                  </v-col>
                </v-row>
              </v-radio-group>
            </v-window-item>

            <!-- Permissions Tab -->
            <v-window-item value="permissions">
              <v-row dense>
                <v-col v-for="(perms, group) in permissionGroups" :key="group" cols="12" sm="6">
                  <v-card border flat class="mb-4">
                    <div class="bg-grey-lighten-4 px-4 py-2 font-weight-black text-subtitle-2 border-b">
                      <v-icon :icon="getGroupIcon(group)" size="small" class="me-2" />
                      {{ getGroupLabel(group) }}
                    </div>
                    <v-card-text class="pa-3">
                      <v-checkbox
                        v-for="perm in perms"
                        :key="perm.name"
                        v-model="userPermissions"
                        :label="perm.label"
                        :value="perm.name"
                        color="primary"
                        density="compact"
                        hide-details
                      />
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </v-window-item>
          </v-window>
        </AppCard>

        <AppCard v-else class="fill-height d-flex align-center justify-center bg-grey-lighten-5 border-dashed">
          <div class="text-center pa-12">
            <v-avatar color="grey-lighten-4" size="100" class="mb-6">
              <v-icon size="48" color="grey-lighten-1">ri-user-settings-line</v-icon>
            </v-avatar>
            <div class="text-h5 font-weight-bold text-grey-darken-1">تعديل الصلاحيات</div>
            <div class="text-body-1 text-grey-lighten-1 mt-2">يرجى اختيار موظف من القائمة الجانبية للبدء في تخصيص صلاحيات الوصول الخاصة به</div>
          </div>
        </AppCard>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useApi } from '@/composables/useApi';
import AppCard from '@/components/common/AppCard.vue';
import AppButton from '@/components/common/AppButton.vue';
import AppInput from '@/components/common/AppInput.vue';
import { getInitials } from '@/utils/helpers';

const usersApi = useApi('/api/users');
const rolesApi = useApi('/api/roles');

const search = ref('');
const loadingUsers = ref(false);
const saving = ref(false);
const users = ref([]);
const allRoles = ref([
  { id: 1, name: 'admin', label: 'مدير النظام', description: 'وصول كامل لجميع ميزات النظام' },
  { id: 2, name: 'manager', label: 'مدير فرع', description: 'إدارة المبيعات والمخزون والتقارير' },
  { id: 3, name: 'sales', label: 'بائع', description: 'إنشاء الفواتير والبحث عن المنتجات' },
  { id: 4, name: 'accountant', label: 'محاسب', description: 'مراجعة التقارير المالية والمدفوعات' },
]);

const selectedUserId = ref(null);
const selectedUser = ref(null);
const activeTab = ref('roles');
const userRole = ref('');
const userPermissions = ref([]);

const permissionGroups = {
  invoices: [
    { name: 'invoices.view', label: 'عرض الفواتير' },
    { name: 'invoices.create', label: 'إنشاء فواتير' },
    { name: 'invoices.edit', label: 'تعديل فواتير' },
    { name: 'invoices.delete', label: 'حذف فواتير' },
  ],
  products: [
    { name: 'products.view', label: 'عرض المنتجات' },
    { name: 'products.create', label: 'إضافة منتجات' },
    { name: 'products.edit', label: 'تعديل منتجات' },
    { name: 'products.delete', label: 'حذف منتجات' },
  ],
  customers: [
    { name: 'customers.view', label: 'عرض العملاء' },
    { name: 'customers.create', label: 'إضافة عملاء' },
    { name: 'customers.edit', label: 'تعديل عملاء' },
  ],
  reports: [
    { name: 'reports.sales', label: 'تقرير المبيعات' },
    { name: 'reports.profit', label: 'تقرير الأرباح' },
    { name: 'reports.stock', label: 'تقرير المخزون' },
  ],
};

const getGroupLabel = group => {
  const labels = {
    invoices: 'إدارة الفواتير',
    products: 'إدارة المنتجات',
    customers: 'إدارة العملاء',
    reports: 'التقارير المتقدمة',
  };
  return labels[group] || group;
};

const getGroupIcon = group => {
  const icons = {
    invoices: 'ri-file-list-3-line',
    products: 'ri-box-3-line',
    customers: 'ri-team-line',
    reports: 'ri-bar-chart-box-line',
  };
  return icons[group] || 'ri-checkbox-circle-line';
};

const filteredUsers = computed(() => {
  if (!search.value) return users.value;
  const q = search.value.toLowerCase();
  return users.value.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
});

const loadUsers = async () => {
  loadingUsers.value = true;
  try {
    const res = await usersApi.get({ per_page: 100 }, { showLoading: false });
    users.value = res.data || [];
  } finally {
    loadingUsers.value = false;
  }
};

const selectUser = user => {
  selectedUserId.value = user.id;
  selectedUser.value = user;
  userRole.value = user.roles?.[0]?.name || '';
  userPermissions.value = user.permissions?.map(p => p.name) || [];
};

const savePermissions = async () => {
  if (!selectedUserId.value) return;
  saving.value = true;
  try {
    // Sync roles and permissions via API
    await usersApi.update(
      `${selectedUserId.value}/sync-permissions`,
      {
        role: userRole.value,
        permissions: userPermissions.value,
      },
      { successMessage: 'تم تحديث الصلاحيات بنجاح' }
    );
  } finally {
    saving.value = false;
  }
};

onMounted(loadUsers);
</script>

<style scoped>
.role-management-page {
  padding: 24px;
}
.max-width-200 {
  max-width: 200px;
}
.clickable {
  cursor: pointer;
  transition: all 0.2s;
}
.clickable:hover {
  background-color: #f5f5f5;
}
</style>
