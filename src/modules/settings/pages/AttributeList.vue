<template>
  <div class="attributes-page">
    <div class="page-header mb-6">
      <h1 class="text-h4 font-weight-bold">خصائص المنتجات</h1>
      <p class="text-body-1 text-grey">إدارة خصائص المنتجات (اللون، المقاس، إلخ)</p>
    </div>

    <AppDataTable
      title="الخصائص"
      icon="ri-paint-brush-line"
      :headers="headers"
      :items="attributes"
      :total-items="total"
      :loading="loading"
      v-model:page="page"
      v-model:items-per-page="itemsPerPage"
      @update:options="fetchAttributes($event)"
      @edit="handleEdit"
      @delete="handleDelete"
    >
      <template #actions>
        <AppButton prepend-icon="ri-add-line" @click="handleCreate"> خاصية جديدة </AppButton>
      </template>

      <template #item.name="{ item }">
        <div class="d-flex align-center">
          <v-icon icon="ri-list-settings-line" size="small" color="primary" class="me-2" />
          <span class="font-weight-medium">{{ item.name }}</span>
        </div>
      </template>

      <template #item.values="{ item }">
        <div class="d-flex flex-wrap gap-1">
          <v-chip v-for="(value, index) in getAttributeValues(item)" :key="index" size="small" variant="tonal">
            {{ value.name || value }}
          </v-chip>
          <span v-if="!getAttributeValues(item).length" class="text-grey text-caption">-</span>
        </div>
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
      :title="isEdit ? 'تعديل الخاصية' : 'خاصية جديدة'"
      :icon="isEdit ? 'ri-edit-line' : 'ri-add-line'"
      :loading="saving"
      max-width="700"
      @confirm="handleSave"
    >
      <v-form ref="formRef" @submit.prevent="handleSave">
        <v-row>
          <v-col cols="12">
            <AppInput v-model="formData.name" label="اسم الخاصية *" placeholder="مثال: اللون، المقاس" :rules="[rules.required]" />
          </v-col>

          <v-col cols="12">
            <v-divider class="mb-2" />
            <div class="d-flex align-center mb-2">
              <span class="text-subtitle-2">القيم المتاحة</span>
              <v-spacer />
              <AppButton size="small" color="primary" variant="tonal" prepend-icon="ri-add-line" @click="addValue"> إضافة قيمة </AppButton>
            </div>

            <div v-if="formData.values.length" class="values-list pa-1">
              <v-row v-for="(value, index) in formData.values" :key="index" dense>
                <v-col cols="10">
                  <AppInput v-model="formData.values[index]" :label="`القيمة ${index + 1}`" placeholder="مثال: أحمر، أزرق" hide-details />
                </v-col>
                <v-col cols="2" class="d-flex align-center mt-2">
                  <AppButton icon="ri-delete-bin-line" size="small" variant="text" color="error" @click="removeValue(index)" />
                </v-col>
              </v-row>
            </div>
            <div v-else class="text-center pa-4 text-grey bg-grey-lighten-4 rounded-lg">
              <v-icon icon="ri-information-line" class="me-1" />
              لم يتم إضافة قيم بعد
            </div>
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
      هل أنت متأكد من حذف الخاصية "<strong>{{ selectedItem?.name }}</strong
      >"؟
    </AppDialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useAttributesData } from '../composables/useAttributesData';
import { useApi } from '@/composables/useApi';
import AppDataTable from '@/components/common/AppDataTable.vue';
import AppDialog from '@/components/common/AppDialog.vue';
import AppButton from '@/components/common/AppButton.vue';
import AppInput from '@/components/common/AppInput.vue';

const { attributes, loading, total, fetchAttributes, deleteAttribute } = useAttributesData();
const api = useApi('/api/attributes');

const page = ref(1);
const itemsPerPage = ref(10);
const showDialog = ref(false);
const showDeleteDialog = ref(false);
const selectedItem = ref(null);
const saving = ref(false);
const deleting = ref(false);
const formRef = ref(null);

const formData = ref({ name: '', values: [], is_active: 1 });
const isEdit = computed(() => !!selectedItem.value?.id);

const headers = [
  { title: 'الاسم', key: 'name' },
  { title: 'القيم', key: 'values' },
  { title: 'الحالة', key: 'is_active' },
  { title: 'الإجراءات', key: 'actions', sortable: false, align: 'end' },
];

const rules = { required: v => !!v || 'مطلوب' };

const getAttributeValues = item => {
  if (!item.values) return [];
  if (Array.isArray(item.values)) return item.values;
  try {
    return JSON.parse(item.values);
  } catch {
    return [];
  }
};

const addValue = () => {
  formData.value.values.push('');
};

const removeValue = index => {
  formData.value.values.splice(index, 1);
};

const handleCreate = () => {
  selectedItem.value = null;
  formData.value = { name: '', values: [''], is_active: 1 };
  showDialog.value = true;
};

const handleEdit = item => {
  selectedItem.value = item;
  const values = getAttributeValues(item);
  formData.value = {
    name: item.name,
    values: values.map(v => (typeof v === 'string' ? v : v.name)),
    is_active: item.is_active ?? 1,
  };
  showDialog.value = true;
};

const handleDelete = item => {
  selectedItem.value = item;
  showDeleteDialog.value = true;
};

const handleSave = async () => {
  const { valid } = await formRef.value.validate();
  if (!valid) return;

  // Remove empty values
  const cleanedValues = formData.value.values.filter(v => v.trim() !== '');
  if (cleanedValues.length === 0) {
    alert('يجب إضافة قيمة واحدة على الأقل');
    return;
  }

  saving.value = true;
  try {
    const payload = {
      ...formData.value,
      values: cleanedValues,
    };

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
    await deleteAttribute(selectedItem.value.id);
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

const loadData = () => fetchAttributes({ page: page.value, per_page: itemsPerPage.value });

onMounted(loadData);
</script>

<style scoped>
.attributes-page {
  padding: 24px;
}

.values-list {
  max-height: 300px;
  overflow-y: auto;
}
</style>
