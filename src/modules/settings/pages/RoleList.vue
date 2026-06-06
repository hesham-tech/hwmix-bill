<template>
  <div class="roles-page">
    <AppDataTable
      :headers="headers"
      :items="roles"
      :loading="loading"
      v-model:page="page"
      v-model:items-per-page="itemsPerPage"
      :total-items="total"
      title="الأدوار والصلاحيات"
      subtitle="إدارة أدوار المستخدمين والصلاحيات"
      icon="ri-shield-user-line"
      table-key="roles.index"
      class="premium-card"
      @update:page="loadData"
      @update:items-per-page="handleItemsPerPageChange"
    >
      <template #actions v-if="can(PERMISSIONS.ROLES_CREATE)">
        <v-btn color="primary" prepend-icon="ri-add-line" class="rounded-lg font-weight-bold" @click="handleCreate"> دور جديد </v-btn>
      </template>

      <template #item.name="{ item }">
        <div class="d-flex align-center">
          <v-icon icon="ri-vip-crown-line" size="small" color="warning" class="me-2" />
          <span class="font-weight-medium">{{ item.name }}</span>
        </div>
      </template>

      <template #item.users_count="{ item }">
        <v-chip size="small" variant="tonal"> {{ item.users_count || 0 }} مستخدم </v-chip>
      </template>

      <template #item.actions="{ item }">
        <div class="d-flex gap-2">
          <v-btn
            v-if="canAny(PERMISSIONS.ROLES_UPDATE_ALL, PERMISSIONS.ROLES_UPDATE_CHILDREN, PERMISSIONS.ROLES_UPDATE_SELF, { resource: item })"
            icon="ri-edit-line"
            size="small"
            variant="text"
            color="primary"
            @click="handleEdit(item)"
          />
          <v-btn
            v-if="canAny(PERMISSIONS.ROLES_DELETE_ALL, PERMISSIONS.ROLES_DELETE_CHILDREN, PERMISSIONS.ROLES_DELETE_SELF, { resource: item })"
            icon="ri-delete-bin-line"
            size="small"
            variant="text"
            color="error"
            :disabled="item.name === 'Admin'"
            @click="handleDelete(item)"
          />
        </div>
      </template>

      <template #empty-actions v-if="can(PERMISSIONS.ROLES_CREATE)">
        <v-btn color="primary" variant="outlined" @click="handleCreate">إضافة دور</v-btn>
      </template>
    </AppDataTable>

    <!-- Form Dialog (Simplified - permissions in backend) -->
    <v-dialog v-model="showDialog" max-width="600" persistent>
      <v-card>
        <v-card-title>{{ isEdit ? 'تعديل الدور' : 'دور جديد' }}</v-card-title>
        <v-card-text>
          <v-form ref="formRef">
            <v-text-field v-model="formData.name" label="اسم الدور *" :rules="[rules.required]" />
            <v-textarea v-model="formData.description" label="الوصف" rows="2" />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showDialog = false">إلغاء</v-btn>
          <v-btn color="primary" :loading="saving" @click="handleSave">حفظ</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Dialog -->
    <v-dialog v-model="showDeleteDialog" max-width="400">
      <v-card>
        <v-card-title>تأكيد الحذف</v-card-title>
        <v-card-text>
          هل أنت متأكد من حذف "<strong>{{ selectedItem?.name }}</strong>"؟
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showDeleteDialog = false">إلغاء</v-btn>
          <v-btn color="error" :loading="deleting" @click="confirmDelete">حذف</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRolesData } from '../composables/useRolesData';
import { useApi } from '@/composables/useApi';
import { usePermissions } from '@/composables/usePermissions';
import { PERMISSIONS } from '@/config/permissions';
import AppDataTable from '@/components/common/AppDataTable.vue';

const { can, canAny } = usePermissions();
const { roles, loading, total, fetchRoles, deleteRole } = useRolesData();
const api = useApi('/api/roles');

const page = ref(1);
const itemsPerPage = ref(10);
const showDialog = ref(false);
const showDeleteDialog = ref(false);
const selectedItem = ref(null);
const saving = ref(false);
const deleting = ref(false);
const formRef = ref(null);
const formData = ref({ name: '', description: '' });
const isEdit = computed(() => !!selectedItem.value?.id);

const headers = [
  { title: 'الاسم', key: 'name' },
  { title: 'عدد المستخدمين', key: 'users_count' },
  { title: 'الإجراءات', key: 'actions', sortable: false, align: 'end' },
];

const rules = { required: v => !!v || 'مطلوب' };

const handleCreate = () => {
  selectedItem.value = null;
  formData.value = { name: '', description: '' };
  showDialog.value = true;
};

const handleEdit = item => {
  selectedItem.value = item;
  formData.value = { ...item };
  showDialog.value = true;
};

const handleDelete = item => {
  selectedItem.value = item;
  showDeleteDialog.value = true;
};

const handleSave = async () => {
  const { valid } = await formRef.value.validate();
  if (!valid) return;

  saving.value = true;
  try {
    if (isEdit.value) {
      await api.update(selectedItem.value.id, formData.value, { successMessage: 'تم التحديث بنجاح' });
    } else {
      await api.create(formData.value, { successMessage: 'تم الإضافة بنجاح' });
    }
    showDialog.value = false;
    loadData();
  } finally {
    saving.value = false;
  }
};

const confirmDelete = async () => {
  deleting.value = true;
  try {
    await deleteRole(selectedItem.value.id);
    showDeleteDialog.value = false;
    loadData();
  } finally {
    deleting.value = false;
  }
};

const handleItemsPerPageChange = value => {
  itemsPerPage.value = value;
  page.value = 1;
  loadData();
};

const loadData = () => fetchRoles({ page: page.value, per_page: itemsPerPage.value });

onMounted(loadData);
</script>

<style scoped>
.roles-page {
  padding: 24px;
}
.premium-card {
  border-radius: 16px !important;
  border: 1px solid rgba(var(--v-border-color), 0.1) !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03) !important;
}
</style>
