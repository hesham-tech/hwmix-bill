<template>
  <div class="warehouses-page">
    <div class="page-header mb-6">
      <h1 class="text-h4 font-weight-bold">المخازن</h1>
      <p class="text-body-1 text-grey">إدارة مخازن المنتجات</p>
    </div>

    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon icon="ri-store-line" class="me-2" />
        المخازن
        <v-spacer />
        <v-btn color="primary" prepend-icon="ri-add-line" @click="handleCreate"> مخزن جديد </v-btn>
      </v-card-title>

      <v-card-text>
        <v-data-table
          :headers="headers"
          :items="warehouses"
          :loading="loading"
          :items-per-page="itemsPerPage"
          :page="page"
          :items-length="total"
          @update:page="page = $event"
          @update:items-per-page="handleItemsPerPageChange"
          density="comfortable"
        >
          <template #item.name="{ item }">
            <div class="d-flex align-center">
              <v-icon icon="ri-building-line" size="small" color="primary" class="me-2" />
              <span class="font-weight-medium">{{ item.name }}</span>
            </div>
          </template>

          <template #item.location="{ item }">
            <span class="text-medium-emphasis">{{ item.location || '-' }}</span>
          </template>

          <template #item.manager="{ item }">
            <v-chip v-if="item.manager?.name" size="small" variant="tonal" color="info">
              <v-icon icon="ri-user-line" size="small" class="me-1" />
              {{ item.manager.name }}
            </v-chip>
            <span v-else class="text-grey">-</span>
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
              <v-icon icon="ri-store-line" size="48" color="grey" class="mb-2" />
              <div class="text-medium-emphasis">لا توجد مخازن</div>
            </div>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <!-- Form Dialog -->
    <v-dialog v-model="showDialog" max-width="700" persistent>
      <v-card>
        <v-card-title>{{ isEdit ? 'تعديل المخزن' : 'مخزن جديد' }}</v-card-title>
        <v-card-text>
          <v-form ref="formRef">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field v-model="formData.name" label="اسم المخزن *" :rules="[rules.required]" />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="formData.location" label="الموقع" />
              </v-col>
              <v-col cols="12">
                <v-autocomplete
                  v-model="formData.manager_id"
                  :items="users"
                  :loading="loadingUsers"
                  item-title="name"
                  item-value="id"
                  label="المدير المسؤول"
                  clearable
                  placeholder="اختر المدير المسؤول (اختياري)"
                />
              </v-col>
              <v-col cols="12">
                <v-switch v-model="formData.is_active" label="نشط" color="success" :true-value="1" :false-value="0" />
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
          هل أنت متأكد من حذف المخزن "<strong>{{ selectedItem?.name }}</strong
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
import { useWarehousesData } from '../composables/useWarehousesData';
import { useApi } from '@/composables/useApi';

const { warehouses, loading, total, fetchWarehouses, deleteWarehouse } = useWarehousesData();
const api = useApi('/api/warehouses');
const usersApi = useApi('/api/users');

const page = ref(1);
const itemsPerPage = ref(10);
const showDialog = ref(false);
const showDeleteDialog = ref(false);
const selectedItem = ref(null);
const saving = ref(false);
const deleting = ref(false);
const formRef = ref(null);
const users = ref([]);
const loadingUsers = ref(false);

const formData = ref({ name: '', location: '', manager_id: null, is_active: 1 });
const isEdit = computed(() => !!selectedItem.value?.id);

const headers = [
  { title: 'الاسم', key: 'name' },
  { title: 'الموقع', key: 'location' },
  { title: 'المدير', key: 'manager' },
  { title: 'الحالة', key: 'is_active' },
  { title: 'الإجراءات', key: 'actions', sortable: false, align: 'end' },
];

const rules = { required: v => !!v || 'مطلوب' };

const loadUsers = async () => {
  loadingUsers.value = true;
  try {
    const response = await usersApi.get({ per_page: 100 }, { showLoading: false, showError: false });
    users.value = response.data || [];
  } catch (error) {
    users.value = [];
  } finally {
    loadingUsers.value = false;
  }
};

const handleCreate = () => {
  selectedItem.value = null;
  formData.value = { name: '', location: '', manager_id: null, is_active: 1 };
  showDialog.value = true;
  if (!users.value.length) loadUsers();
};

const handleEdit = item => {
  selectedItem.value = item;
  formData.value = { ...item, manager_id: item.manager_id || null };
  showDialog.value = true;
  if (!users.value.length) loadUsers();
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
    await deleteWarehouse(selectedItem.value.id);
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

const loadData = () => fetchWarehouses({ page: page.value, per_page: itemsPerPage.value });

onMounted(loadData);
</script>

<style scoped>
.warehouses-page {
  padding: 24px;
}
</style>
