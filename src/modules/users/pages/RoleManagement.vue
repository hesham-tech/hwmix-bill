<template>
  <div class="role-management-page pa-6">
    <!-- Header -->
    <div class="d-flex align-center justify-space-between mb-8">
      <div>
        <h1 class="text-h4 font-weight-black text-primary mb-1">إدارة الأدوار الوظيفية</h1>
        <p class="text-body-1 text-grey-darken-1">عرّف المسميات الوظيفية وصلاحياتها لتنظيم فريق العمل</p>
      </div>
      <AppButton color="primary" prepend-icon="ri-add-line" size="large" class="px-6 rounded-xl shadow-lg" @click="openRoleDialog()">
        إضافة دور جديد
      </AppButton>
    </div>

    <!-- Stats Row -->
    <v-row class="mb-6">
      <v-col cols="12" sm="4">
        <v-card variant="flat" border class="pa-4 rounded-xl bg-primary-lighten-5 border-primary">
          <div class="d-flex align-center gap-4">
            <v-avatar color="primary" variant="tonal" size="48">
              <v-icon icon="ri-shield-user-line" color="primary" />
            </v-avatar>
            <div>
              <div class="text-h5 font-weight-black">{{ store.roles.length }}</div>
              <div class="text-caption text-primary">إجمالي الأدوار المعرفة</div>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Roles Grid -->
    <v-row v-if="!store.loading">
      <v-col v-for="role in store.roles" :key="role.id" cols="12" md="4" lg="3">
        <v-card variant="flat" border class="role-card h-100 transition-swing">
          <v-card-text class="pa-5">
            <div class="d-flex align-center justify-space-between mb-4">
              <v-icon :icon="getRoleIcon(role.name)" size="32" color="primary" class="bg-grey-lighten-4 pa-4 rounded-lg" />
              <v-menu location="bottom end">
                <template #activator="{ props }">
                  <v-btn icon="ri-more-2-fill" variant="text" size="small" v-bind="props" />
                </template>
                <v-list density="compact" class="rounded-lg">
                  <v-list-item @click="openRoleDialog(role)">
                    <template #prepend><v-icon icon="ri-edit-line" size="small" /></template>
                    <v-list-item-title>تعديل الدور</v-list-item-title>
                  </v-list-item>
                  <v-divider />
                  <v-list-item color="error" @click="confirmDelete(role)">
                    <template #prepend><v-icon icon="ri-delete-bin-line" size="small" /></template>
                    <v-list-item-title>حذف الدور</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </div>

            <h3 class="text-h6 font-weight-bold mb-1">{{ role.label || role.name }}</h3>
            <p class="text-caption text-grey-darken-1 mb-4 line-clamp-2" style="height: 40px">
              {{ role.description || 'لا يوجد وصف متاح لهذا الدور الوظيفي.' }}
            </p>

            <div class="d-flex align-center flex-wrap gap-2">
              <v-chip size="x-small" color="primary" variant="tonal" class="font-weight-bold"> {{ role.permissions_count || 0 }} صلاحية </v-chip>
              <v-chip v-if="role.users_count !== undefined" size="x-small" color="grey" variant="flat"> {{ role.users_count }} مستخدمين </v-chip>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Empty State -->
      <v-col v-if="store.roles.length === 0" cols="12">
        <div class="text-center pa-12 bg-grey-lighten-5 rounded-xl border-dashed">
          <v-icon icon="ri-shield-flash-line" size="64" color="grey-lighten-2" />
          <div class="text-h6 text-grey mt-4">لا يوجد أدوار مسجلة حالياً</div>
          <p class="text-caption text-grey-darken-1 mb-6">ابدأ بإنشاء أول دور وظيفي لفريق عملك</p>
          <AppButton color="primary" @click="openRoleDialog()">إضافة أول دور</AppButton>
        </div>
      </v-col>
    </v-row>

    <!-- Loading State -->
    <div v-else class="text-center pa-12">
      <v-progress-circular indeterminate color="primary" size="64" />
      <div class="mt-4 text-grey">جاري تحميل الأدوار...</div>
    </div>

    <!-- Role Dialog -->
    <v-dialog v-model="dialog.isOpen" max-width="800" persistent scrollable>
      <RoleForm
        v-if="dialog.isOpen"
        :role="dialog.data"
        :is-edit-mode="dialog.isEdit"
        :available-permissions="store.availablePermissions"
        :loading="dialog.loading"
        @save="handleSaveRole"
        @cancel="dialog.isOpen = false"
      />
    </v-dialog>

    <!-- Delete Confirmation -->
    <v-dialog v-model="deleteDialog.isOpen" max-width="400">
      <v-card class="rounded-xl pa-4">
        <v-card-text class="text-center pt-6">
          <v-avatar color="error-lighten-5" size="72" class="mb-4">
            <v-icon icon="ri-error-warning-line" color="error" size="40" />
          </v-avatar>
          <div class="text-h6 font-weight-bold mb-2">هل أنت متأكد من الحذف؟</div>
          <p class="text-body-2 text-grey-darken-1">
            سيتم حذف الدور <span class="font-weight-bold text-error">"{{ deleteDialog.data?.label }}"</span> نهائياً. هذا الإجراء قد يؤثر على وصول
            المستخدمين المرتبطين بهذا الدور.
          </p>
        </v-card-text>
        <v-card-actions class="gap-3 pt-4 px-4 pb-4">
          <v-btn variant="tonal" block class="flex-grow-1" @click="deleteDialog.isOpen = false">إلغاء</v-btn>
          <v-btn color="error" variant="flat" block class="flex-grow-1" :loading="deleteDialog.loading" @click="deleteRole"> تأكيد الحذف </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import { useUserStore } from '../store/user.store';
import AppButton from '@/components/common/AppButton.vue';
import RoleForm from '../components/RoleForm.vue';

const store = useUserStore();

const dialog = reactive({
  isOpen: false,
  isEdit: false,
  data: null,
  loading: false,
});

const deleteDialog = reactive({
  isOpen: false,
  data: null,
  loading: false,
});

onMounted(async () => {
  await Promise.all([store.fetchRoles(), store.fetchAvailablePermissions()]);
});

const openRoleDialog = (role = null) => {
  dialog.isEdit = !!role;
  dialog.data = role ? { ...role } : { permissions: [] };
  dialog.isOpen = true;
};

const handleSaveRole = async formData => {
  dialog.loading = true;
  try {
    if (dialog.isEdit) {
      await store.updateRole(dialog.data.id, formData);
    } else {
      await store.createRole(formData);
    }
    dialog.isOpen = false;
  } finally {
    dialog.loading = false;
  }
};

const confirmDelete = role => {
  deleteDialog.data = role;
  deleteDialog.isOpen = true;
};

const deleteRole = async () => {
  deleteDialog.loading = true;
  try {
    await store.deleteRole(deleteDialog.data.id);
    deleteDialog.isOpen = false;
  } finally {
    deleteDialog.loading = false;
  }
};

const getRoleIcon = name => {
  const icons = {
    admin: 'ri-admin-line',
    manager: 'ri-briefcase-line',
    sales: 'ri-shopping-cart-2-line',
    accounting: 'ri-calculator-line',
    warehouse: 'ri-home-gear-line',
    customer: 'ri-user-heart-line',
  };
  return icons[name] || 'ri-shield-line';
};
</script>

<style scoped>
.role-card {
  border-radius: 20px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.role-card:hover {
  transform: translateY(-8px);
  border-color: rgb(var(--v-theme-primary), 0.3) !important;
  box-shadow: 0 12px 24px -10px rgba(var(--v-theme-primary), 0.2) !important;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.bg-primary-lighten-5 {
  background-color: rgba(var(--v-theme-primary), 0.05) !important;
}

.border-dashed {
  border: 2px dashed #e0e0e0 !important;
}
</style>
