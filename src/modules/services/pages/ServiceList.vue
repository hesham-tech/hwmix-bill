<template>
  <div class="services-page">
    <div class="mb-6 px-6 pt-6">
      <h1 class="text-h4 font-weight-bold">الخدمات</h1>
      <p class="text-body-1 text-grey">إدارة الخدمات الإضافية (الشحن، الصيانة، التركيب، إلخ)</p>
    </div>

    <div class="px-6 pb-6">
      <AppDataTable
        :headers="headers"
        :items="services"
        :loading="loading"
        :items-length="total"
        :items-per-page="itemsPerPage"
        :page="page"
        title="قائمة الخدمات"
        icon="ri-customer-service-2-line"
        @update:page="
          page = $event;
          loadData();
        "
        @update:items-per-page="handleItemsPerPageChange"
      >
        <template #actions>
          <AppButton color="primary" prepend-icon="ri-add-line" @click="handleCreate"> إضافة خدمة </AppButton>
        </template>

        <template #item.name="{ item }">
          <div class="d-flex align-center">
            <v-avatar color="primary-lighten-5" size="36" rounded="lg" class="me-3">
              <v-icon icon="ri-settings-5-line" color="primary" size="20" />
            </v-avatar>
            <div class="d-flex flex-column text-truncate">
              <span class="font-weight-bold text-body-1">{{ item.name }}</span>
              <span class="text-caption text-grey text-truncate max-w-200">{{ item.description || 'بدون وصف' }}</span>
            </div>
          </div>
        </template>

        <template #item.default_price="{ item }">
          <div class="font-weight-bold text-body-1 text-primary">
            {{ formatCurrency(item.default_price) }}
          </div>
        </template>

        <template #item.actions="{ item }">
          <div class="d-flex justify-end gap-1">
            <AppButton icon="ri-pencil-line" size="x-small" variant="text" color="info" tooltip="تعديل" @click="handleEdit(item)" />
            <AppButton icon="ri-delete-bin-line" size="x-small" variant="text" color="error" tooltip="حذف" @click="handleDelete(item)" />
          </div>
        </template>
      </AppDataTable>
    </div>

    <!-- Service Dialog -->
    <AppDialog v-model="showDialog" :title="editMode ? 'تعديل خدمة' : 'إضافة خدمة جديدة'" :loading="saving" @confirm="handleSave">
      <v-form ref="formRef">
        <v-row>
          <v-col cols="12">
            <AppInput v-model="form.name" label="اسم الخدمة *" :rules="[required]" placeholder="مثال: تركيب مكيف، خدمة شحن" />
          </v-col>
          <v-col cols="12">
            <AppInput v-model.number="form.default_price" label="السعر الافتراضي *" type="number" :rules="[required, positiveNumber]" />
          </v-col>
          <v-col cols="12">
            <v-textarea v-model="form.description" label="وصف الخدمة" rows="3" placeholder="تفاصيل إضافية عن الخدمة..." />
          </v-col>
        </v-row>
      </v-form>
    </AppDialog>

    <!-- Delete Dialog -->
    <AppConfirmDialog ref="deleteRef" title="حذف خدمة" message="هل أنت متأكد من حذف هذه الخدمة؟" confirm-text="حذف" confirm-color="error" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { serviceApiService } from '@/api';
import { required, positiveNumber } from '@/utils/validators';
import { formatCurrency } from '@/utils/formatters';
import AppDataTable from '@/components/common/AppDataTable.vue';
import AppButton from '@/components/common/AppButton.vue';
import AppDialog from '@/components/common/AppDialog.vue';
import AppInput from '@/components/common/AppInput.vue';
import AppConfirmDialog from '@/components/common/AppConfirmDialog.vue';
import { toast } from 'vue3-toastify';

const services = ref([]);
const loading = ref(false);
const saving = ref(false);
const total = ref(0);
const page = ref(1);
const itemsPerPage = ref(10);
const showDialog = ref(false);
const editMode = ref(false);
const formRef = ref(null);
const deleteRef = ref(null);

const form = ref({
  id: null,
  name: '',
  description: '',
  default_price: 0,
});

const headers = [
  { title: 'الخدمة', key: 'name' },
  { title: 'السعر الافتراضي', key: 'default_price', align: 'end' },
  { title: 'تاريخ الإضافة', key: 'created_at' },
  { title: 'الإجراءات', key: 'actions', sortable: false, align: 'end' },
];

const loadData = async () => {
  loading.value = true;
  try {
    const response = await serviceApiService.getAll({
      page: page.value,
      per_page: itemsPerPage.value,
    });
    services.value = response.data;
    total.value = response.meta?.total || response.data.length;
  } catch (error) {
    console.error('Error loading services:', error);
  } finally {
    loading.value = false;
  }
};

const handleCreate = () => {
  editMode.value = false;
  form.value = { id: null, name: '', description: '', default_price: 0 };
  showDialog.value = true;
};

const handleEdit = item => {
  editMode.value = true;
  form.value = { ...item };
  showDialog.value = true;
};

const handleSave = async () => {
  const { valid } = await formRef.value.validate();
  if (!valid) return;

  saving.value = true;
  try {
    if (editMode.value) {
      await serviceApiService.update(form.value.id, form.value);
      toast.success('تم تحديث الخدمة بنجاح');
    } else {
      await serviceApiService.create(form.value);
      toast.success('تم إضافة الخدمة بنجاح');
    }
    showDialog.value = false;
    loadData();
  } catch (error) {
    // Error handled by intercepter
  } finally {
    saving.value = false;
  }
};

const handleDelete = async item => {
  const confirmed = await deleteRef.value.open();
  if (!confirmed) return;

  try {
    await serviceApiService.delete(item.id);
    toast.success('تم حذف الخدمة بنجاح');
    loadData();
  } catch (error) {
    // Error handled by intercepter
  }
};

const handleItemsPerPageChange = value => {
  itemsPerPage.value = value;
  page.value = 1;
  loadData();
};

onMounted(loadData);
</script>

<style scoped>
.max-w-200 {
  max-width: 200px;
}
</style>
