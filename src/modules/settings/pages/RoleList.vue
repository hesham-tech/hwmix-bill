<template>
  <div class="roles-page">
    <div class="page-header mb-6">
      <h1 class="text-h4 font-weight-bold">الأدوار والصلاحيات</h1>
      <p class="text-body-1 text-grey">إدارة أدوار المستخدمين والصلاحيات</p>
    </div>

    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon icon="ri-shield-user-line" class="me-2" />
        الأدوار
        <v-spacer />
        <v-btn color="primary" prepend-icon="ri-add-line" @click="handleCreate"> دور جديد </v-btn>
      </v-card-title>

      <v-card-text>
        <v-data-table
          :headers="headers"
          :items="roles"
          :loading="loading"
          :items-per-page="itemsPerPage"
          :page="page"
          :items-length="total"
          @update:page="
            page = $event;
            loadData();
          "
          @update:items-per-page="handleItemsPerPageChange"
          density="comfortable"
        >
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
              <v-btn icon="ri-edit-line" size="small" variant="text" color="primary" @click="handleEdit(item)" />
              <v-btn
                icon="ri-delete-bin-line"
                size="small"
                variant="text"
                color="error"
                :disabled="item.name === 'Admin'"
                @click="handleDelete(item)"
              />
            </div>
          </template>

          <template #no-data>
            <div class="text-center pa-4">
              <v-icon icon="ri-shield-user-line" size="48" color="grey" class="mb-2" />
              <div class="text-medium-emphasis">لا توجد أدوار</div>
            </div>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

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
          هل أنت متأكد من حذف "<strong>{{ selectedItem?.name }}</strong
          >"؟
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
import { ref, onMounted, computed } from 'vue';
import { useRolesData } from '../composables/useRolesData';
import { useApi } from '@/composables/useApi';

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
</style>
