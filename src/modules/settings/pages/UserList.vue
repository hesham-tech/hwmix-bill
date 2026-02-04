<template>
  <div class="users-page">
    <div class="page-header mb-6">
      <h1 class="text-h4 font-weight-bold">المستخدمين</h1>
      <p class="text-body-1 text-grey">إدارة مستخ دمي النظام والعملاء</p>
    </div>

    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon icon="ri-user-line" class="me-2" />
        المستخدمين
        <v-spacer />
        <v-btn color="primary" prepend-icon="ri-add-line" @click="handleCreate"> مستخدم جديد </v-btn>
      </v-card-title>

      <v-card-text>
        <v-data-table
          :headers="headers"
          :items="users"
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
          <template #item.full_name="{ item }">
            <div class="d-flex align-center">
              <v-avatar size="32" color="primary" class="me-2">
                <span class="text-white text-caption">{{ item.full_name?.charAt(0) }}</span>
              </v-avatar>
              <div>
                <div class="font-weight-medium">{{ item.full_name }}</div>
                <div class="text-caption text-medium-emphasis">{{ item.email }}</div>
              </div>
            </div>
          </template>

          <template #item.role="{ item }">
            <v-chip v-if="item.role" size="small" variant="tonal" color="info">
              {{ item.role.name }}
            </v-chip>
            <span v-else class="text-grey">-</span>
          </template>

          <template #item.phone="{ item }">
            <AppPhone :phone="item.phone" />
          </template>

          <template #item.is_active="{ item }">
            <v-chip :color="item.is_active ? 'success' : 'error'" size="small" variant="tonal">
              {{ item.is_active ? 'نشط' : 'غير نشط' }}
            </v-chip>
          </template>

          <template #item.actions="{ item }">
            <div class="d-flex gap-2">
              <v-btn icon="ri-edit-line" size="small" variant="text" color="primary" @click="handleEdit(item)" />
              <v-btn icon="ri-delete-bin-line" size="small" variant="text" color="error" @click="handleDelete(item)" />
            </div>
          </template>

          <template #no-data>
            <div class="text-center pa-4">
              <v-icon icon="ri-user-line" size="48" color="grey" class="mb-2" />
              <div class="text-medium-emphasis">لا يوجد مستخدمين</div>
            </div>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <!-- Form Dialog -->
    <v-dialog v-model="showDialog" max-width="700" persistent>
      <v-card>
        <v-card-title>{{ isEdit ? 'تعديل المستخدم' : 'مستخدم جديد' }}</v-card-title>
        <v-card-text>
          <v-form ref="formRef">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field v-model="formData.name" label="الاسم *" :rules="[rules.required]" />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="formData.email" label="البريد الإلكتروني *" type="email" :rules="[rules.required, rules.email]" />
              </v-col>
              <v-col cols="12" md="6">
                <AppPasswordInput
                  v-model="formData.password"
                  :label="isEdit ? 'كلمة المرور (اتركها فارغة لعدم التغيير)' : 'كلمة المرور *'"
                  :rules="isEdit ? [] : [rules.required]"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="formData.phone" label="رقم الهاتف" />
              </v-col>
              <v-col cols="12" md="6">
                <v-autocomplete
                  v-model="formData.role_id"
                  :items="rolesList"
                  :loading="loadingRoles"
                  item-title="name"
                  item-value="id"
                  label="الدور"
                  clearable
                />
              </v-col>
              <v-col cols="12" md="6">
                <AppSwitch v-model="formData.is_active" label="نشط" :true-value="1" :false-value="0" />
              </v-col>
            </v-row>
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
import { useUsersData } from '../composables/useUsersData';
import { useApi } from '@/composables/useApi';
import AppSwitch from '@/components/common/AppSwitch.vue';
import AppCard from '@/components/common/AppCard.vue';
import AppPasswordInput from '@/components/common/AppPasswordInput.vue';
const { users, loading, total, fetchUsers, deleteUser } = useUsersData();
const api = useApi('/api/users');
const rolesApi = useApi('/api/roles');

const page = ref(1);
const itemsPerPage = ref(10);
const showDialog = ref(false);
const showDeleteDialog = ref(false);
const selectedItem = ref(null);
const saving = ref(false);
const deleting = ref(false);
const formRef = ref(null);
const rolesList = ref([]);
const loadingRoles = ref(false);

const formData = ref({
  full_name: '',
  nickname: '',
  email: '',
  password: '',
  phone: '',
  role_id: null,
  is_active: 1,
});

const isEdit = computed(() => !!selectedItem.value?.id);

const headers = [
  { title: 'المستخدم', key: 'full_name' },
  { title: 'الدور', key: 'role' },
  { title: 'الهاتف', key: 'phone' },
  { title: 'الحالة', key: 'is_active' },
  { title: 'الإجراءات', key: 'actions', sortable: false, align: 'end' },
];

const rules = {
  required: v => !!v || 'مطلوب',
  email: v => /.+@.+\..+/.test(v) || 'بريد إلكتروني غير صالح',
};

const loadRoles = async () => {
  loadingRoles.value = true;
  try {
    const response = await rolesApi.get({ per_page: 100 }, { showLoading: false, showError: false });
    rolesList.value = response.data || [];
  } finally {
    loadingRoles.value = false;
  }
};

const handleCreate = () => {
  selectedItem.value = null;
  formData.value = { full_name: '', nickname: '', email: '', password: '', phone: '', role_id: null, is_active: 1 };
  showDialog.value = true;
  if (!rolesList.value.length) loadRoles();
};

const handleEdit = item => {
  selectedItem.value = item;
  formData.value = {
    full_name: item.full_name || '',
    nickname: item.nickname || '',
    email: item.email,
    password: '',
    phone: item.phone || '',
    role_id: item.role_id || null,
    is_active: item.is_active ?? 1,
  };
  showDialog.value = true;
  if (!rolesList.value.length) loadRoles();
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
    const payload = { ...formData.value };
    if (isEdit.value && !payload.password) {
      delete payload.password;
    }

    if (isEdit.value) {
      await api.update(selectedItem.value.id, payload, { successMessage: 'تم التحديث بنجاح' });
    } else {
      await api.create(payload, { successMessage: 'تم الإضافة بنجاح' });
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
    await deleteUser(selectedItem.value.id);
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

const loadData = () => fetchUsers({ page: page.value, per_page: itemsPerPage.value });

onMounted(loadData);
</script>

<style scoped>
.users-page {
  padding: 24px;
}
</style>
