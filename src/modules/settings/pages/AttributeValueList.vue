<template>
  <div class="attribute-values-page">
    <div class="mb-6 px-6 pt-6 d-flex align-center justify-space-between">
      <div>
        <div class="d-flex align-center mb-1">
          <AppButton icon="ri-arrow-right-line" variant="text" color="grey" class="me-2" to="/attributes" />
          <h1 class="text-h4 font-weight-bold">قيم الخاصية: {{ attribute?.name || '...' }}</h1>
        </div>
        <p class="text-body-1 text-grey ms-10">إدارة القيم المتاحة لهذه الخاصية لاستخدامها في المنتجات</p>
      </div>
      <AppButton prepend-icon="ri-add-line" @click="handleCreate"> إضافة قيمة جديدة </AppButton>
    </div>

    <div class="px-6 pb-6">
      <AppDataTable
        title="قيم الخاصية"
        icon="ri-list-check"
        :headers="headers"
        :items="values"
        :loading="loading"
        @edit="handleEdit"
        @delete="handleDelete"
      >
        <template #item.name="{ item }">
          <div class="font-weight-bold text-primary">{{ item.name }}</div>
        </template>
      </AppDataTable>
    </div>

    <!-- Form Dialog -->
    <AppDialog
      v-model="showDialog"
      :title="isEdit ? 'تعديل القيمة' : 'إضافة قيمة جديدة'"
      :icon="isEdit ? 'ri-edit-line' : 'ri-add-line'"
      :loading="saving"
      @confirm="handleSave"
    >
      <v-form ref="formRef" @submit.prevent="handleSave">
        <AppInput v-model="formData.name" label="اسم القيمة *" placeholder="مثال: أحمر، XL، 128GB" :rules="[v => !!v || 'مطلوب']" />
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
      هل أنت متأكد من حذف القيمة "<strong>{{ selectedItem?.name }}</strong
      >"؟
    </AppDialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useApi } from '@/composables/useApi';
import AppDataTable from '@/components/common/AppDataTable.vue';
import AppDialog from '@/components/common/AppDialog.vue';
import AppButton from '@/components/common/AppButton.vue';
import AppInput from '@/components/common/AppInput.vue';

const route = useRoute();
const attributeId = route.params.id;
const api = useApi(`/api/attributes/${attributeId}/values`);
const attributeApi = useApi(`/api/attributes`);

const attribute = ref(null);
const values = ref([]);
const loading = ref(false);
const showDialog = ref(false);
const showDeleteDialog = ref(false);
const selectedItem = ref(null);
const saving = ref(false);
const deleting = ref(false);
const formRef = ref(null);

const formData = ref({ name: '' });
const isEdit = computed(() => !!selectedItem.value?.id);

const headers = [
  { title: 'القيمة', key: 'name' },
  { title: 'تاريخ الإضافة', key: 'created_at' },
  { title: 'الإجراءات', key: 'actions', sortable: false, align: 'end' },
];

const fetchAttribute = async () => {
  try {
    const res = await attributeApi.getById(attributeId);
    attribute.value = res.data;
  } catch (err) {
    console.error('Error fetching attribute:', err);
  }
};

const fetchValues = async () => {
  loading.value = true;
  try {
    const res = await api.get();
    values.value = res.data || [];
  } catch (err) {
    console.error('Error fetching values:', err);
  } finally {
    loading.value = false;
  }
};

const handleCreate = () => {
  selectedItem.value = null;
  formData.value = { name: '' };
  showDialog.value = true;
};

const handleEdit = item => {
  selectedItem.value = item;
  formData.value = { name: item.name };
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
    fetchValues();
  } finally {
    saving.value = false;
  }
};

const confirmDelete = async () => {
  deleting.value = true;
  try {
    await api.remove(selectedItem.value.id, { successMessage: 'تم الحذف بنجاح' });
    showDeleteDialog.value = false;
    fetchValues();
  } finally {
    deleting.value = false;
  }
};

onMounted(() => {
  fetchAttribute();
  fetchValues();
});
</script>
