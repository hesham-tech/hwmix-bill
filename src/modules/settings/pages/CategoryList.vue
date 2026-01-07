<template>
  <div class="categories-page">
    <div class="page-header mb-6">
      <h1 class="text-h4 font-weight-bold">الفئات</h1>
      <p class="text-body-1 text-grey">إدارة فئات المنتجات</p>
    </div>

    <AppDataTable
      title="الفئات"
      icon="ri-folder-line"
      :headers="headers"
      :items="categories"
      :total-items="total"
      :loading="loading"
      v-model:page="page"
      v-model:items-per-page="itemsPerPage"
      @update:options="fetchCategories($event)"
      @edit="handleEdit"
      @delete="handleDelete"
    >
      <template #actions>
        <AppButton prepend-icon="ri-add-line" @click="handleCreate"> فئة جديدة </AppButton>
      </template>

      <template #item.name="{ item }">
        <div class="d-flex align-center">
          <v-icon
            :icon="item.parent_id ? 'ri-folder-open-line' : 'ri-folder-fill'"
            size="small"
            :color="item.parent_id ? 'info' : 'primary'"
            class="me-2"
          />
          <span class="font-weight-medium">{{ item.name }}</span>
        </div>
      </template>

      <template #item.parent="{ item }">
        <v-chip v-if="item.parent?.name" size="small" variant="tonal">
          {{ item.parent.name }}
        </v-chip>
        <span v-else class="text-grey text-caption">فئة رئيسية</span>
      </template>

      <template #item.is_active="{ item }">
        <v-chip :color="item.is_active ? 'success' : 'error'" size="small" variant="tonal">
          {{ item.is_active ? 'نشط' : 'غير نشط' }}
        </v-chip>
      </template>
    </AppDataTable>

    <!-- Form Dialog -->
    <AppDialog
      v-model="showDialog"
      :title="isEdit ? 'تعديل الفئة' : 'فئة جديدة'"
      :icon="isEdit ? 'ri-edit-line' : 'ri-add-line'"
      :loading="saving"
      @confirm="handleSave"
    >
      <v-form ref="formRef" @submit.prevent="handleSave">
        <v-row>
          <v-col cols="12">
            <AppInput v-model="formData.name" label="اسم الفئة *" :rules="[rules.required]" />
          </v-col>
          <v-col cols="12">
            <v-autocomplete
              v-model="formData.parent_id"
              :items="parentCategories"
              item-title="name"
              item-value="id"
              label="الفئة الرئيسية"
              variant="outlined"
              density="comfortable"
              clearable
              placeholder="اختر الفئة الرئيسية (اختياري)"
            />
          </v-col>
          <v-col cols="12">
            <v-switch v-model="formData.is_active" label="نشط" color="success" :true-value="1" :false-value="0" hide-details />
          </v-col>
        </v-row>
      </v-form>
    </AppDialog>

    <!-- Delete Dialog -->
    <AppDialog
      v-model="showDeleteDialog"
      title="تأكيد الحذف"
      icon="ri-delete-bin-line"
      confirm-color="error"
      confirm-text="حذف"
      :loading="deleting"
      @confirm="confirmDelete"
    >
      هل أنت متأكد من حذف "<strong>{{ selectedItem?.name }}</strong
      >"؟
    </AppDialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useCategoriesData } from '../composables/useCategoriesData';
import { useApi } from '@/composables/useApi';
import AppDataTable from '@/components/common/AppDataTable.vue';
import AppDialog from '@/components/common/AppDialog.vue';
import AppButton from '@/components/common/AppButton.vue';
import AppInput from '@/components/common/AppInput.vue';

const { categories, loading, total, fetchCategories, deleteCategory } = useCategoriesData();
const api = useApi('/api/categories');

const page = ref(1);
const itemsPerPage = ref(10);
const showDialog = ref(false);
const showDeleteDialog = ref(false);
const selectedItem = ref(null);
const saving = ref(false);
const deleting = ref(false);
const formRef = ref(null);

const formData = ref({ name: '', parent_id: null, is_active: 1 });
const isEdit = computed(() => !!selectedItem.value?.id);

// Parent categories (exclude current category when editing)
const parentCategories = computed(() => {
  return categories.value.filter(cat => cat.id !== selectedItem.value?.id);
});

const headers = [
  { title: 'الاسم', key: 'name' },
  { title: 'الفئة الرئيسية', key: 'parent' },
  { title: 'الحالة', key: 'is_active' },
  { title: 'الإجراءات', key: 'actions', sortable: false, align: 'end' },
];

const rules = { required: v => !!v || 'مطلوب' };

const handleCreate = () => {
  selectedItem.value = null;
  formData.value = { name: '', parent_id: null, is_active: 1 };
  showDialog.value = true;
};

const handleEdit = item => {
  selectedItem.value = item;
  formData.value = { ...item, parent_id: item.parent_id || null };
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
    await deleteCategory(selectedItem.value.id);
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

const loadData = () => fetchCategories({ page: page.value, per_page: itemsPerPage.value });

onMounted(loadData);
</script>

<style scoped>
.categories-page {
  padding: 24px;
}
</style>
